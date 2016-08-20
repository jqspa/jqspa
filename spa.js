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
		startPath: '/'
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

		spa.page.load(page, callback);
	};

	spa.page = {
		load: function(page, callback){
			spa.cache.$main.hide();
			spa.cache.$main.html(
				Mustache.render(page.template, page.context)
			)

			document.title = page.title || document.title;
			callback(page);
			spa.cache.$main.show();
		}
	};

	/*
		add route to the routes list
	*/
	spa.routeAdd = function(pageOBJ){
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
		spa.router($(this).attr('href'))
	});
});

/*
	listen 
*/
// $(window).on( "popstate", function(event) {
// 	var url = history.state ? history.state.url : spa.startPath;
// 	spa.router(url);
// });




