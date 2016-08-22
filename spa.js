'use strict';

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
			template: "<center><h1><i>Page Not Found</i></h1><center>",
			title: "404"
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

		var page = {};
		url = url.replace(/^\//, '');
		callback = callback || function(){};


		if(!spa.routes.some(function(route){
			var re = XRegExp.exec(url, XRegExp(route.url, 'ix'));
			if(re){
				page = route;
				page.res = re;
				return true;
			}
		})){
			page = spa.errorPages['404'];
		}

		if(spa.current.page && spa.current.page.url === page.url){
			console.log('prevented double load.')
			return false;
		}else{
			spa.current.page = page;
		}


		window.history.pushState({ url: url }, page.title, '/'+url);
        // window.dispatchEvent(new Event('popstate'));

        if($.isFunction(page.action)){
        	page.action(page, callback);
        }else{
			spa.page.renderTemplate(page, callback);
        }
	};

	spa.page = {
		renderTemplate: function(page, callback){
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
			console.log(arguments);
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
