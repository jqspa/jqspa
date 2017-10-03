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
	spa = jQuery.extend({
		buildTaskCount: 0, // check if still used
		$cache: {}, // holds #jQuery selected objects for commonly used DOM nodes
		routes: [], // Route objects ordered for route selection
		current: {}, // current state of objects?
		defaults: { // Defualt settings for spa components
			shell: 'index'
		},
	}, spa);

	spa.inits = []; // ordered list of init callbacks
	spa.init = function(callback){
		spa.inits.push(callback);
	};

	spa.onInit = function(){
		spa.inits.forEach(function(callback){
			callback();
		});
	};

	spa.includeScript = function(path){
		// Dynamic script loading synchronousness
		// mostly used in dev to help directly debug issues in source files 
		if(JQSPA_BASE_PATH && path.match(/^\/src\//i)){
			path = JQSPA_BASE_PATH + path;
		}
		// $('head').append('<script src="'+path+'">');

		jQuery.ajax({
			url: path,
			dataType: 'script',
			async: falseac
		});
	};

	/*
		grab templates from the server
	*/
	spa.includeTemplate = function(path){
		// Dynamic template loading synchronousness
		// mostly used in dev to help directly debug issues in source files 
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
	include all the bass
*/

/*
	spa utils
*/
spa.includeScript('/src/utils.js');

/*
	base object for style sheets
*/
spa.includeScript('/src/stylesheets.js');

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
	Components
*/
spa.includeScript('/src/component.js');

/*
	Forms
*/
spa.includeScript('/src/forms.js');

/*
	router
*/
spa.includeScript('/src/router.js');

/*
	bootstrap
*/
spa.includeScript('/src/bootstrap.js');

/*
	when the DOM is finished, start the spa
*/
jQuery(document).on("DOMContentLoaded", function(event) {
	spa.publish("__dom-content-loaded-start");
	spa.publish("__dom-content-loaded-end");
});
