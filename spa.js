'use strict';

(function($){
	var callback = callback || function(){};

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
		components: {}
	};

	/*
		hold default page template
	*/
	spa.content = {
		template: '<main></main>',
		context: {}
	};

	/*
		set page objects for errors
	*/
	spa.errorPages = {
		'404': {
			template: '<center><h1><i>Page Not Found</i></h1>{{message}}<center>',
			title: '404'
		},
		'500': {
			title: '500',
			template: '<center><h1><i>SPA error</i></h1>{{message}}<center>'
			
		}
	};

	/*
		grab templates from the server
	*/
	spa.templatePath = function(path){
		var template = '';
		jQuery.ajax({
	        url: path,
	        success: function(data){
	        	template = data
	        },
	        async: false
    	});
    	return template;
	};

	/*
		parse route
	*/
	spa.router = function(url, callback){

		// hold an empty page object
		var page = {};
		// remove preceding slashes
		url = url.replace(/^\/+/, '');
		callback = callback || function(){};

		// loop over all the routes and find a match
		if(!spa.routes.some(function(route){
			var re = XRegExp.exec(url, XRegExp(route.url, 'ix'));
			if(re){
				page = route;
				page.res = re;

				// when a match is found
				return true;
			}
		})){

			// pull up the error page when a matching route isnt found
			page = spa.errorPages['404'];
			page.context = {message: 'No route found.'}
		}

		// prevented double load
		if(spa.current.page && spa.current.page.url === page.url){
			return false;
		}else{
			spa.current.page = page;
		}

		// set the history events
		window.history.pushState({ url: url }, page.title, '/'+url);
        // window.dispatchEvent(new Event('popstate'));

        //load the route // this should be moved else where
        if($.isFunction(page.action)){
        	page.action(page, callback);
        }else if(page.template){
			spa.page.renderTemplate(page, callback);
        }else{
        	spa.page.renderTemplate(spa.errorPages['500'], {message:'No action can be taken.'})
        }
	};

	/*
	*/
	spa.page = {
		renderTemplate: function(page, callback){
			callback = callback || function(){};
			
			spa.cache.$main.html(
				Mustache.render(page.template, page.context)
			);

			page.component = (function(){
				var components = [];

				spa.cache.$main.find('[data-component-name]').each(function(e){
					var $this = $(this);
					var component = spa.components[$this.data('component-name')];
					
					component.load($this);
					components.push(component);
				});

				return components;
			})()

			document.title = page.title || document.title;
			callback(page);
		}
	};

	spa.addComponent = function(component){
		component.setTimeouts = {};
		component.setInterval = {};

		component.load = function($element){
			this.$template = $element;
			this.init();
		}

		component.renderTemplate = function(context){
			this.$template.html(Mustache.render(
				this.template,
				$.extend({}, this.context, context)
			));
		};

		spa.components[component.name] = component;
	};


	/*
		add route to the routes list
	*/
	spa.routeAdd = function(pageOBJ){
		pageOBJ.template = pageOBJ.template || '';

		pageOBJ.renderTemplate = function(){
			console.log(this)
			spa.page.renderTemplate(this)
		};

		spa.routes.push(pageOBJ);
	};

})(jQuery);

/*
	when the DOM is finished, start the spa
*/
$(document).on("DOMContentLoaded", function(event) {
	/* cache stuff */
	spa.cache.$loader = $('#spa-loader-holder');
	spa.cache.$content = $('#spa-content');
	spa.cache.$body = $('body');

	/* load stuff */
	spa.cache.$content.html(
		Mustache.render(spa.content.template, spa.content.context)
	);

	/* more cache */
	spa.cache.$main = $('main');

	/* 
		load the first route 
	*/
	spa.router(window.location.pathname, function(page){
		spa.cache.$loader.hide();
		spa.cache.$content.show();
	});

	/*
		catch ajax load links
	*/
	spa.cache.$body.on('click', '.ajax-link', function(event){
		event.preventDefault();
		spa.router($(this).attr('href'));
	});
});
