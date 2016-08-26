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
		$cache: {},
		routes: [],
		current: {},
		components: {},
		defualts: {
			shell: 'index'
		}
	};

	spa.requireScript = function(path){
		jQuery.ajax({
	        url: path,
	        dataType: 'script',
	        async: false
    	});
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

})(jQuery);

	/*
		base object for renderables
	*/
	spa.requireScript('/src/renderbase.js');

	/* 
		error templates
	*/
	spa.requireScript('/src/errorpages.js');

	/*
		Shells
	*/
	spa.requireScript('/src/shell.js');


	/*
		Pages
	*/
	spa.requireScript('/src/page.js');
	

	/*
		Components
	*/
	spa.requireScript('/src/component.js');

	/*
		router
	*/
	spa.requireScript('/src/router.js');


/*
	when the DOM is finished, start the spa
*/
$(document).on("DOMContentLoaded", function(event) {
	/* $cache stuff */
	spa.$cache.$loader = $('#spa-loader-holder');
	spa.$cache.$body = $('body');
	spa.Shell.$container = $(spa.Shell.defualtContainerSelector);

	$( window ).on( "popstate", function( event ) {
		spa.Page.resolver(window.location.pathname, false);
	} );
	/* 
		load the first route 
	*/
	spa.Page.resolver(window.location.pathname, false);

	spa.$cache.$loader.hide();
	spa.Shell.$container.show();

	spa.$cache.$body.on('click', '.ajax-link', function(event){
		event.preventDefault();
		spa.Page.resolver( $(this).attr('href') );
		return false;
	});
});
