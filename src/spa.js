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
		buildTaskCount: 0,
		$cache: {},
		routes: [],
		current: {},
		defualts: {
			shell: 'index'
		},
	}, spa);

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
		if(JQSPA_BASE_PATH && path.match(/^\/src\//i)){
			path = JQSPA_BASE_PATH + path;
		}
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
	
	// Probaly should be a singleton
	spa.StyleSheets = (function(){
		var styleSheets = Object.create(Array.prototype);

		styleSheets.create = function(){
			var args = [].slice.apply(arguments);

			var $body = jQuery("body");
			if ($body.length) {
				args.unshift($body);
				args = this.load.apply(this, args);
			}

			return $.extend(Object.create(this), args);
		};

		styleSheets.push = function(){
			var args = [].slice.apply(arguments);
			
			var $body = jQuery("body");
			if ($body.length) {
				args.unshift($body);
				args = this.load.apply(this, args);
			}
			return Array.prototype.push.apply(this, args);
		};

		styleSheets.unload = function(sheet_class){
			var components = jQuery("body ." + sheet_class);
			if (components.length === 0){
				var $sheet = jQuery('body style.' + sheet_class);
				$sheet.remove();
				var idx = this.indexOf($sheet[0]);
				if (~idx !== 0) this.splice(idx, 1);
				return true;
			}
			return false;
		};

		styleSheets.load = function($body){
			var sheet, args = [].slice.apply(arguments);
			args.shift();
			var sheet_count = args.length, idx = 0;
			for (;idx < sheet_count; idx++){
				sheet = args[idx];
				if ($body.children('style[class="' + sheet.attr("class") + '"]').length === 0){
            		$body.append(args[idx]);
            	} else {
            		args.splice(idx, 1);
            		sheet_count--;
            		idx--;
            	}
           	}
           	return args;
        };

        return styleSheets;
	})();

})(jQuery);

/*
	spa utils
*/
spa.includeScript('/src/utils.js');

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
