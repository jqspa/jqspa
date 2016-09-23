"use strict";
/* globals jQuery, Mustache, XRegExp, $, spa */
var spa = spa || {};

( function($){

	/*
		delay calling document.ready until SPA is loaded.
	*/
	jQuery.holdReady(true);

	/*
		set up spa object
	*/
	jQuery.extend(spa, {
		buildTaskCount: 0,
		$cache: {},
		routes: [],
		current: {},
		defualts: {
			shell: 'index'
		}
	});

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
spa.EventBase = ( function(){
	var EventBase = {};
	EventBase.setTimeoutMap = {};
	EventBase.setIntervalMap = {};
	EventBase.listeners = {};
	EventBase.$container = jQuery({});


	EventBase.on = function(event, data, callback){
		return this.$container.on.apply(this.$container, arguments);
	};

	EventBase.trigger = function(event, data, callback){
		return this.$container.trigger.apply(this.$container, arguments);
	};

	EventBase.setTimeOut = function(name, callback, delay, args){
		this.setTimeoutMap[name] = window.setTimeOut.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setTimeoutMap[name];
	};

	EventBase.setInterval = function(name, callback, delay, args){

		this.setIntervalMap[name] = window.setInterval.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setIntervalMap[name];
	};

	EventBase.__clearSets = function(){
		for(var key in this.setIntervalMap){
			clearInterval( this.setIntervalMap[key] );
		}

		for(var key in this.setTimeoutMap){
			clearTimeout( this.setTimeoutMap[key] );
		}
	};

	EventBase.unload =  function(){
		this.__clearSets();
	};

	EventBase.__declare =  function(object){
		var newObject = Object.create(this);

		return jQuery.extend(newObject, object);
	};

	/*
		pub/sub
	*/

	EventBase.__topics = {};

	EventBase.subscribe = function(topics, listener) {
		// create the topic if not yet created
		var topic, previous = [];
		if(!$.isArray(topics)) topics = [topics];
		for(var idx = topics.length; idx--;){
			topic = topics[idx];
			if(!~previous.indexOf(topic)) continue;
			if(!Object.hasOwnProperty(this.__topics, topic)) {
				this.__topics[topic] = [];
			}

			// add the listener
			this.__topics[topic].push(listener);
			previous.push(topic);
		}
	};

	EventBase.publish = function(topic, data) {
		// return if the topic doesn't exist, or there are no listeners
		if(!this.__topics[topic] || this.__topics[topic].length < 1) return;

		// send the event to all listeners
		this.__topics[topic].forEach(function(listener) {
			this.setTimeout(function(data){
				listener(data || {});
			}, 0, data);
		});
	};




	return EventBase;
} )();

/*
	base object for renderables
*/
spa.RenderBase = ( function(){
	var RenderBase = Object.create(spa.EventBase);

	RenderBase.context = {};
	RenderBase.template = '';
	RenderBase.errorTemplates = {};

	RenderBase.__setUp = function($element){
		this.$container = $element;
		this.$container.addClass(this.name);
		this.init();
	};

	RenderBase.init = function(){
		// BAD?
		this.renderTemplate();
	};

	RenderBase.renderTemplate = function(context){
		this.$container.html( Mustache.render(
			this.template,
			jQuery.extend({}, this.context, context)
		) );
		this.components = this.$find(this.$container);
	};

	RenderBase.$find = function($element, dontStart){
		var components = [];
		$element.find('[data-component-name]').each(function(index, element){

			var $element = jQuery(element);
			var componentName = $element.data('component-name');
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

			component.__setUp($element);
		});

		return components;
	};
	return RenderBase;
} )();

/*
	Servcies
*/
spa.services = {};
spa.Service = ( function(){
	var service = Object.create(spa.EventBase);

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
	var model = Object.create(spa.EventBase);

	model.add = function(model){
		if(!model.name) return false;

		model = this.__declare(model);

		spa.models[model.name] = model;
        
        model.init();
	};

	return model;
})();

/* 
	error templates
*/
spa.RenderBase.errorTemplates['404'] = spa.RenderBase.__declare({
	template: '<center><h1><i>Page {{name}} Not Found</i></h1>{{message}}<center>',
	title: '404'
});

spa.RenderBase.errorTemplates['500'] = spa.RenderBase.__declare({
	title: '500',
	template: '<center><h1><i>SPA error {{name}}</i></h1>{{message}}<center>'
});

/*
	Shells
*/
spa.shells = {};
spa.Shell = ( function(){
	var shell = Object.create(spa.RenderBase);

	shell.defualtContainerSelector = '#spa-shell'; // move me

	shell.add = function(shell){
		if(!shell.name) return false;

		shell = this.__declare(shell);

		spa.shells[shell.name] = shell;
	};

	shell.renderTemplate = function(context, callback){
		spa.RenderBase.renderTemplate.call(this, context);
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
	Components
*/
spa.components = {};
spa.Component = ( function(){
	var component = Object.create(spa.RenderBase);

	component.add =function(component){
		if(!component.name) return false;

		component = this.__declare(component);
		spa.components[component.name] = component;
	};


	return component;
} )();
/*
	router
*/
spa.routes = [];
spa.Router = {
	defaultRoute: spa.routes,

	add: function(route){

		if( $.isArray(route) ){
			route.forEach(this.add);
			return ;
		}

		if(!route.uri && !route.init) return false;

		spa.routes.push( route );
		return true;
	},

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

	resolver: function(url, isHistortyEvent){
		isHistortyEvent = isHistortyEvent === undefined ? true :  false;
		var match = this.lookup(url);

		 // if(spa.current.page && match.REQ.re[0] === spa.current.page.REQ.re[0]) return false;

		if(!match){
			match = spa.RenderBase.errorTemplates['404'];

			match.context = {
				name: url
			};
		}
		
		spa.Shell.update(match.shell);
		match.init();

		if(isHistortyEvent){
			spa.Router.historyAdd({url: url}, match.title, url);
		}

	},

	historyAdd: function(state, title, url){
		window.history.pushState(state, title, url);
		// window.dispatchEvent(new Event('popstate'));

	}

};

/*
	bootstrap
*/
spa.init(function(){
    spa.EventBase.subscribe("__dom-content-loaded-start", function(){
        /* $cache stuff */
        spa.$cache.$loader = jQuery('#spa-loader-holder');
        spa.$cache.$body = jQuery('body');
        spa.Shell.$container = jQuery(spa.Shell.defualtContainerSelector);

        jQuery(window).on( "popstate", function( event ) {
            spa.EventBase.publish("load-shell", {
                "path": window.location.pathname,
                "isHistory": false
            });
        } );

        spa.$cache.$body.on('click', '.ajax-link', function(event){
            event.preventDefault();
            spa.EventBase.publish("load-shell", {
                "path": jQuery(this).attr('href'),
                "isHistory": true
            });
            return false;
        });
        
    });

    spa.EventBase.subscribe("__spa-ready", function(){
        /* 
            load the first route 
        */
        spa.EventBase.publish("load-shell", {
            "path": window.location.pathname,
            "isHistory": false
        });
    });

    spa.EventBase.subscribe("load-shell", function(data){

        spa.Router.resolver(data.path, data.isHistory);

        spa.$cache.$loader.hide();
        spa.Shell.$container.show();
    });

    (function(){
        var buildTaskCount = spa.buildTaskCount;

        spa.EventBase.subscribe("__dom-content-loaded-end", function(data){
            if (buildTaskCount === 0){
                spa.EventBase.publish("__spa-ready");
            }
        });
        spa.EventBase.subscribe("spa-build-task-complete", function(data){
            buildTaskCount--;
            if (buildTaskCount === 0){
                spa.EventBase.publish("__spa-ready");
            }
        });
    }());

});

spa.onInit();
/*
	when the DOM is finished, start the spa
*/
jQuery(document).on("DOMContentLoaded", function(event) {
	spa.EventBase.publish("___dom-content-loaded-start");
	spa.EventBase.publish("___dom-content-loaded-end");
});
