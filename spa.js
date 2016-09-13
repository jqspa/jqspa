"use strict";

var spa = {};

( function($){

	/*
		delay calling document.ready until SPA is loaded.
	*/
	jQuery.holdReady(true);

	/*
		set up spa object
	*/
	spa = {
		$cache: {},
		routes: [],
		current: {},
		defualts: {
			shell: 'index'
		}
	};

	spa.inits = [];
	spa.init = function(callback){
		spa.inits.push(callback);
	};

	spa.onInit = function(){
		spa.inits.forEach(function(callback){
			callback();
		});
	};

	spa.includeScript = function(path){
		// $('head').append('<script src="'+path+'">');

		jQuery.ajax({
			url: path,
			dataType: 'script',
			async: false
		});
	};

	/*
		grab templates from the server
	*/
	spa.includeTemplate = function(path){
		var string = '';
		jQuery.ajax({
			url: path,
			success: function(data){
				string = data;
			},
			async: false
		});
		return string;
	};

})(jQuery);

/*
	base object for events
*/
spa.__EventBase = ( function(){
	var __EventBase = {};
	__EventBase.setTimeoutMap = {};
	__EventBase.setIntervalMap = {};
	__EventBase.listeners = {};
	__EventBase.$container = jQuery({});


	__EventBase.on = function(event, data, callback){
		return this.$container.on.apply(this.$container, arguments);
	};

	__EventBase.trigger = function(event, data, callback){
		return this.$container.trigger.apply(this.$container, arguments);
	};

	__EventBase.setTimeOut = function(name, callback, delay, args){
		this.setTimeoutMap[name] = window.setTimeOut.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setTimeoutMap[name];
	};

	__EventBase.setInterval = function(name, callback, delay, args){

		this.setIntervalMap[name] = window.setInterval.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setIntervalMap[name];
	};

	__EventBase.__clearSets = function(){
		for(var key in this.setIntervalMap){
			clearInterval( this.setIntervalMap[key] );
		}

		for(var key in this.setTimeoutMap){
			clearTimeout( this.setTimeoutMap[key] );
		}
	};

	__EventBase.unload =  function(){
		this.__clearSets();
	};

	__EventBase.__declare =  function(object){
		var newObject = Object.create(this);

		return jQuery.extend(newObject, {__declare:null}, object);
	};

	return __EventBase;
} )();

/*
	base object for renderables
*/
spa.__RenderBase = ( function(){
	var __RenderBase = Object.create(spa.__EventBase);

	__RenderBase.context = {};
	__RenderBase.template = '';
	__RenderBase.errorTemplates = {};

	__RenderBase.__setUp = function($element){
		this.$container = $element;
		this.init();
	};

	__RenderBase.init = function(){
		this.renderTemplate();
	},

	__RenderBase.renderTemplate = function(context){
		this.$container.html( Mustache.render(
			this.template,
			jQuery.extend({}, this.context, context)
		) );
		this.components = spa.Component.$find(this.$container);
	};

	return __RenderBase;
} )();

/*
	Servcies
*/
spa.services = {};
spa.Service = ( function(){
	var service = Object.create(spa.__EventBase);

	service.add = function(service){
		if(!service.name) return false;

		service = this.__declare(service);

		spa.services[service.name] = service;
	};

	return service;
} )();

/*
	Models
*/
spa.models = {};
spa.Model = ( function(){
	var model = Object.create(spa.__EventBase);

	model.add = function(model){
		if(!model.name) return false;

		model = this.__declare(model);

		spa.models[model.name] = model;
	};

	return model;
})();

/* 
	error templates
*/
spa.__RenderBase.errorTemplates['404'] = spa.__RenderBase.__declare({
	template: '<center><h1><i>Page {{name}} Not Found</i></h1>{{message}}<center>',
	title: '404'
});

spa.__RenderBase.errorTemplates['500'] = spa.__RenderBase.__declare({
	title: '500',
	template: '<center><h1><i>SPA error {{name}}</i></h1>{{message}}<center>'
});

/*
	Shells
*/
spa.shells = {};
spa.Shell = ( function(){
	var shell = Object.create(spa.__RenderBase);

	shell.defualtContainerSelector = '#spa-shell'; // move me

	shell.add = function(shell){
		if(!shell.name) return false;

		shell = this.__declare(shell);

		spa.shells[shell.name] = shell;
	};
	
	shell.renderTemplate = function(context, callback){
		spa.__RenderBase.renderTemplate.call(this, context);
	};

	shell.update = function(shell){
		shell = shell || spa.shells[ spa.defualts.shell ];
		if(spa.current.shell === shell) return false;

		spa.current.shell = shell;
		shell.__setUp(this.$container);
	};

	return shell;
} )();


/*
	Pages
*/
spa.pages = [];
spa.Page = ( function(){
	var page = Object.create(spa.__RenderBase);

	page.add = function(page){
		if(!page.uri) return false;

		page = this.__declare(page);
		spa.pages.push(page);
	};

	page.renderTemplate = function(context, callback){
		spa.__RenderBase.renderTemplate.call(this, context);
		document.title = this.title || document.title;
	};

	page.resolver = function(url, isHistortyEvent){
		isHistortyEvent = isHistortyEvent === undefined ? true :  false;
		var match = spa.Router.lookup(url, spa.pages);

		if(match === spa.current.page) return false;
		if(!match){
			match = this.errorTemplates['404'];

			match.context = {
				name: url
			};
		}
		if(spa.current.page){
			spa.current.page.unload();
		}

		spa.Shell.update(match.shell);

		match.__setUp(spa.current.shell.$container.find('#spa-shell-page'));
		spa.current.page = match;

		if(isHistortyEvent){
			spa.Router.historyAdd({url: url}, match.title, url);
		}

	};


	return page;
} )();


/*
	Components
*/
spa.components = {};
spa.Component = ( function(){
	var component = Object.create(spa.__RenderBase);

	component.add =function(component){
		if(!component.name) return false;

		component = this.__declare(component);
		spa.components[component.name] = component;
	};

	component.$find = function($element, dontStart){
		var components = [];
		$element.find('[data-component-name]').each(function(element){
			var $this = jQuery(this);
			var componentName = $this.data('component-name');
			var component = spa.components[componentName];
			
			//set error component if none is found
			if(!component){
				component = spa.Component.errorTemplates['404'];
				component.context = {
					name: componentName
				};
			}else{
				components.push(component);
			}

			component.__setUp($this);
		});

		return components;
	};

	return component;
} )();

/*
	router
*/
spa.routes = [];
spa.Router = {
	defaultRoute: spa.pages,

	lookup: function(url, routes){
		var match = false;
		url = url.replace(/^\/+/, '');
		routes = routes || this.defaultRoute;

		if(!routes.some(function(route){
			var re = XRegExp.exec(url, XRegExp(route.uri, 'ix'));
			if(re){
				route.REQ = {
					url: url,
					re: re
				};
				match = route;
				return true;
			}
		}));

		return match;
	},

	historyAdd: function(state, title, url){
		window.history.pushState(state, title, url);
		// window.dispatchEvent(new Event('popstate'));

	}

};


/*
	when the DOM is finished, start the spa
*/
jQuery(document).on("DOMContentLoaded", function(event) {
	/* $cache stuff */
	spa.$cache.$loader = jQuery('#spa-loader-holder');
	spa.$cache.$body = jQuery('body');
	spa.Shell.$container = jQuery(spa.Shell.defualtContainerSelector);

	jQuery(window).on( "popstate", function( event ) {
		spa.Page.resolver(window.location.pathname, false);
	} );

	spa.$cache.$body.on('click', '.ajax-link', function(event){
		event.preventDefault();
		spa.Page.resolver( jQuery(this).attr('href') );
		return false;
	});
	
	spa.onInit();
	/* 
		load the first route 
	*/
	spa.Page.resolver(window.location.pathname, false);

	spa.$cache.$loader.hide();
	spa.Shell.$container.show();

});
