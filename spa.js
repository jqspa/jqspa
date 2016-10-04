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
		}
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

	spa.Mixer = function(){
		var args = [].slice.apply(arguments);
		var obj = {};

		obj.create = function(config){
			var defaults = {};
			for(var idx = 0; idx < args.length; idx++){
				defaults = $.extend(defaults, args[idx].create());
			}
			return $.extend(Object.create(defaults), config || {});
		};

		var prototype = {};
		for(var idx = 0; idx < args.length; idx++){
			prototype = $.extend(Object.create(prototype), args[idx]);
		}
		// console.log(prototype);
		return $.extend(Object.create(prototype), obj);
	};
	
	// Probaly should be a singleton
	spa.StyleSheets = (function(){
		var styleSheets = Object.create(Array.prototype);

		styleSheets.create = function(){
			var args = [].slice.apply(arguments);

			var $head = jQuery("head");
			if ($head.length) {
				args.unshift($head);
				args = this.load.apply(this, args);
			}

			return $.extend(Object.create(this), args);
		};

		styleSheets.push = function(){
			var args = [].slice.apply(arguments);
			
			var $head = jQuery("head");
			if ($head.length) {
				args.unshift($head);
				args = this.load.apply(this, args);
			}
			return Array.prototype.push.apply(this, args);
		};

		styleSheets.load = function($head){
			var sheet, args = [].slice.apply(arguments);
			args.shift();
			var sheet_count = args.length, idx = 0;
			for (;idx < sheet_count; idx++){
				sheet = args[idx];
				if ($head.children('style[class="' + sheet.attr("class") + '"]').length === 0){
            		$head.append(args[idx]);
            	} else {
            		args.splice(idx, 1);
            		sheet_count--
            		idx--
            	}
           	}
           	return args;
        };

        return styleSheets;
	})();

})(jQuery);

/*
	base object for events
*/
spa.EventBase = ( function(){
    var EventBase = {};

    EventBase.listeners = {};
    EventBase.create = function(config){
    	return $.extend(
    		Object.create(EventBase),
	    	{
	    		setTimeoutMap: {},
	    		setIntervalMap: {},
	    		$container: jQuery({})
	    	}, 
	    	config || {}
	    );
	}
	EventBase.on = function(event, data, callback){
		return this.$container.on.apply(this.$container, arguments);
	};

	EventBase.trigger = function(event, data, callback){
		return this.$container.trigger.apply(this.$container, arguments);
	};

	EventBase.setTimeout = function(name, callback, delay, args){
		this.setTimeoutMap[name] = window.setTimeout.apply(
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

	EventBase.init =  function(){};
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
			if(~previous.indexOf(topic)) continue;
			if(!Object.hasOwnProperty.call(this.__topics, topic)) {
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
			setTimeout(function(data){
				listener(data || {});
			}, 0, data);
		});
	};

	return Object.create(EventBase);
} )();

/*
	base object for renderables
*/
spa.RenderBase = ( function(){
    var RenderBase = {};
    RenderBase.errorTemplates = {};

    RenderBase.create = function(config){
    	return $.extend(
            Object.create(RenderBase), 
            {
                context: {},
                template: '',
                cssRules: ''
            }, 
            config || {}
        );
    };

	RenderBase.__setUp = function($element){
		this.$container = $element;
		this.$container.addClass(this.name);
		this.init();
	};

	RenderBase.__parse_style = function(){
		var sheet = jQuery('<style class="' + this.name + '-style">')
		sheet.append(this.cssRules || "");
        this.sheet = spa.$cache.$styleSheets.push(sheet);
	};

	RenderBase.init = function(){
		// BAD?
		this.renderTemplate();
	};

	RenderBase.renderTemplate = function(context){
        if (!this.sheet) this.__parse_style();
		this.$container.html( Mustache.render(
			this.template,
			jQuery.extend({}, this.context, context)
		) );
		this.components = this.$find(this.$container);
	};

    RenderBase.$find = function($element, dontRender){
        var components = [];
        $element.find('[data-component-name]').each(function(index, element){
        	var component;
            var $element = jQuery(element);
            var componentName = $element.data('component-name');
            var bluePrint = spa.components[componentName];
            
            //set error component if none is found
            if(!bluePrint){
                component = spa.Component.errorTemplates['404'].create({
                	context: {
                		name: componentName
                	}
                });

            } else if ($element.parents('[data-component-name="' + componentName + '"]').length){
                component = spa.Component.errorTemplates['500'].create({
                	context: {
                		name: componentName
                	}
                });
            } else{
            	component = bluePrint();
            }
            
	        components.push(component);

    	    component.__setUp($element);
        });

        return components;
    };

    RenderBase.$insert = function($element){
    	// var $element = jQuery(element);
    	var component;
        var componentName = $element.data('component-name');
        var bluePrint = spa.components[componentName];
        
        //set error component if none is found
        if(!bluePrint){
            component = spa.Component.errorTemplates['404'].create({
            	context: {
            		name: componentName
            	}
            });

        } else if ($element.parents('[data-component-name="' + componentName + '"]').length){
            component = spa.Component.errorTemplates['500'].create({
            	context: {
            		name: componentName
            	}
            });
        } else{
        	component = bluePrint();
        }

        this.components.push(component);

	    component.__setUp($element);
        return component
    };

	return Object.create(RenderBase);
} )();

/*
	Servcies
*/
spa.services = {};
spa.Service = ( function(){
	var service = Object.create(spa.EventBase);

	service.add = function(service){
		if(!service.name) return false;

		service = this.create(service);
        service.init();
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

		model = this.create(model);

		spa.models[model.name] = model;
        
        model.init();
	};

	return model;
})();

/* 
	error templates
*/
spa.RenderBase.errorTemplates['404'] = spa.RenderBase.constructor({
	template: '<center><h1><i>Page {{name}} Not Found</i></h1>{{message}}<center>',
	title: '404'
});

spa.RenderBase.errorTemplates['500'] = spa.RenderBase.constructor({
	title: '500',
	template: '<center><h1><i>SPA error {{name}}</i></h1>{{message}}<center>'
});

/*
	Shells
*/
spa.shells = {};
spa.Shell = ( function(){
	var shell = spa.Mixer(spa.EventBase, spa.RenderBase);

	shell.defaultContainerSelector = '#spa-shell'; // move me

	shell.add = function(shell){
		if(!shell.name) return false;

		shell = this.create(shell);
		spa.shells[shell.name] = shell;
	};

	shell.renderTemplate = function(context, callback){
		spa.RenderBase.renderTemplate.call(this, context);
	};

	shell.update = function(shell){
		shell = shell || spa.shells[ spa.defaults.shell ];
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
    var Component = {};

    Component.add = function(component){
        if(!component.name) return false;
        spa.components[component.name] = function(){
            return this.create(component);
        }.bind(this);
    };

    Component.create = function(config){
        return $.extend(Object.create(Component), config || {});
    };

    return spa.Mixer(spa.EventBase, spa.RenderBase, Component);
} )();

/*
	Forms
*/
spa.Form = ( function(){
    var Form = {};

    Form.add = function(config){
        if(!config.name) return false;
        spa.components[config.name] = function(){
            return this.create(config);
        }.bind(this);
    };

    Form.renderErrors = function(data){
        var that = this;

        jQuery.each(data, function(key, value){
            if (Object.hasOwnProperty.call(that, "set" + key + "Error")){
                that["set" + key + "Error"](key, value)
            }
            else{
                that.setError(key, value)
            }
        });
    };

    Form.setError = function(name, message){
        var $target = this.getErrorTarget(name);
        if (message.prototype !== Array.prototype){
            message = [message];
        }
        jQuery.each(message, function(idx, value){
            $target.append("<span>" + value + "</span>");
        });
    };

    Form.getErrorTarget = function(name) {
        return this.$container.find('[for="' + name + '"]');
    };

    Form.create = function(config){
        return $.extend(Object.create(Form), config || {});
    };

    return spa.Mixer(spa.EventBase, spa.RenderBase, Form);
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

	resolver: function(url, isHistoryEvent){
		isHistoryEvent = isHistoryEvent === undefined ? true :  isHistoryEvent;
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

		if(isHistoryEvent){
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
    spa.$cache.$styleSheets = spa.StyleSheets.create();
    
    spa.EventBase.subscribe("__dom-content-loaded-start", function(){
        /* $cache stuff */
        spa.$cache.$loader = jQuery('#spa-loader-holder');
        spa.$cache.$body = jQuery('body');
        var args = [].slice.call(spa.$cache.$styleSheets);
        if(args.length){
            args.unshift(jQuery('head'));
            spa.$cache.$styleSheets.load.apply({}, args);
        }

        
        spa.Shell.$container = jQuery(spa.Shell.defaultContainerSelector);
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
        jQuery.holdReady(false);
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
/*
	when the DOM is finished, start the spa
*/
jQuery(document).on("DOMContentLoaded", function(event) {
	spa.EventBase.publish("__dom-content-loaded-start");
	spa.EventBase.publish("__dom-content-loaded-end");
});
