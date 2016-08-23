'use strict';

	function callback(){};
(function($){

	/*
		set up dependences
	*/
	XRegExp.install('natives');

	/*
		delay calling document.ready until SPA is loaded.
	*/
	$.holdReady(true);

	/*
		set up spa object
	*/
	window.spa = {
		cache: {},
		routes: [],
		current: {},
		components: {},
		defualts: {
			shell: 'index'
		}
	};

	/*
		grab templates from the server
	*/
	spa.templatePath = function(path){
		var string = '';
		jQuery.ajax({
	        url: path,
	        success: function(data){
	        	string = data
	        },
	        async: false
    	});
    	return string;
	};
	/*
		base object for renderables
	*/
	spa.__Template = {
		context: {},
		template: '',
		setTimeouts: {},
		setInterval: {},

		init: function(){
			this.renderTemplate();
		},

		load: function($element){
			this.$container = $element;
			this.init();
		},
		renderTemplate: function(context){
			console.log('context', context)
			this.$container.html( Mustache.render(
				this.template,
				$.extend({}, this.context, context)
			) );
			this.components = spa.Component.$find(this.$container);
		},
		declare: function(object){
			var newObject = Object.create(spa.__Template);
			newObject = Object.create(this);

			return $.extend(newObject, {declare:null}, object);
		},
		clearSets: function(){
			for(var key in this.setInterval){
				clearInterval( this.setInterval[key] );
			}

			for(var key in this.setTimeouts){
				clearTimeout( this.setTimeouts[key] );
			}
		},
		unload: function(){
			this.clearSets();
		},
		errorTemplates: {}
	};

	/* 
		error templates
	*/
	spa.__Template.errorTemplates['404'] = spa.__Template.declare({
		template: '<center><h1><i>Page {{name}} Not Found</i></h1>{{message}}<center>',
		title: '404'
	});

	spa.__Template.errorTemplates['500'] = spa.__Template.declare({
		title: '500',
		template: '<center><h1><i>SPA error {{name}}</i></h1>{{message}}<center>'
	});

	/*
		Shells
	*/
	spa.shells = {};
	spa.Shell = (function(){
		var shell = Object.create(spa.__Template);

		shell.defualtContainerSelector = '#spa-shell';

		shell.add = function(shell){
			if(!shell.name) return false;

			shell = this.declare(shell);
			spa.shells[shell.name] = shell;
		};
		shell.renderTemplate = function(context, callback){
			spa.__Template.renderTemplate.call(this, context);
		};

		shell.update = function(shell){
			shell = shell || spa.shells[ spa.defualts.shell ];
			if(spa.current.shell === shell) return false;

			spa.current.shell = shell;
			shell.load(this.$container);
		};

		$(document).on("DOMContentLoaded", function(event) {
			spa.Shell.$container = $(this.defualtContainerSelector);
		});

		return shell
	})(); 


	/*
		Pages
	*/
	spa.pages = [];
	spa.Page = (function(){
		var page = Object.create(spa.__Template);

		page.add = function(page){
			if(!page.uri) return false;

			page = this.declare(page);
			spa.pages.push(page);
		};

		page.renderTemplate = function(context, callback){
			spa.__Template.renderTemplate.call(this, context);
			document.title = this.title || document.title;
		};

		page.resolver = function(url){
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

			match.load(spa.current.shell.$container.find('#spa-shell-page'));
			spa.current.page = match;

		};

		return page;
	})();


	/*
		Components
	*/
	spa.components = {};
	spa.Component = (function(){
		var component = Object.create(spa.__Template);

		component.add =function(component){
			if(!component.name) return false;

			component = this.declare(component);
			spa.components[component.name] = component;
		};

		component.$find = function($element){
			var components = [];

			$element.find('[data-component-name]').each(function(element){
				var $this = $(this);
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

				component.load($this);
			});

			return components;
		}

		return component;
	})();

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
					}
					match = route;
					return true;
				}
			}));

			return match;
		},

		historyAdd: function(){
			// set the history events
			//window.history.pushState({ url: url }, page.title, '/'+url);
		    // window.dispatchEvent(new Event('popstate'));

		}

	};
})(jQuery);



/*
	when the DOM is finished, start the spa
*/
$(document).on("DOMContentLoaded", function(event) {
	/* cache stuff */
	spa.cache.$loader = $('#spa-loader-holder');
	spa.cache.$body = $('body');


	/* 
		load the first route 
	*/
	spa.Shell.$container = $(spa.Shell.defualtContainerSelector);
	spa.Page.resolver(window.location.pathname);
	// 	function(page){
	// });
	spa.cache.$loader.hide();
	spa.Shell.$container.show();

	spa.cache.$body.on('click', '.ajax-link', function(event){
		event.preventDefault();
		spa.Page.resolver($(this).attr('href'));
		return false;
	});
});
