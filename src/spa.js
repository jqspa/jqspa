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
spa.includeScript('/src/eventbase.js');

/*
	base object for renderables
*/
spa.includeScript('/src/renderbase.js');

/*
	Servcies
*/
spa.includeScript('/src/services.js');

/*
	Models
*/
spa.includeScript('/src/models.js');

/* 
	error templates
*/
spa.includeScript('/src/errorpages.js');

/*
	Shells
*/
spa.includeScript('/src/shell.js');


/*
	Pages
*/
spa.includeScript('/src/page.js');


/*
	Components
*/
spa.includeScript('/src/component.js');

/*
	router
*/
spa.includeScript('/src/router.js');


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
