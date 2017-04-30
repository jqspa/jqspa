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
		defaults: {
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
spa.utils = {};

(function(utils) {
	utils.emptyFunc = function(){};

	utils.UUID = function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
    };

})(spa.utils);

(function($){
    $.fn.serializeObject = function() {
        var 
            arr = $(this).serializeArray(), 
            obj = {};
        
        for(var i = 0; i < arr.length; i++) {
            if(obj[arr[i].name] === undefined) {
                obj[arr[i].name] = arr[i].value;
            } else {
                if(!(obj[arr[i].name] instanceof Array)) {
                    obj[arr[i].name] = [obj[arr[i].name]];
                }
                obj[arr[i].name].push(arr[i].value);
            }
        }
        return obj;
    };
    
    $.getCookie = function(){
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    };
})(jQuery);

/*
	base object for events
*/
spa.EventBase = ( function(){
    var EventBase = {};

    EventBase.create = function(config){

    	return $.extend(
    		Object.create(EventBase),
    		{
    			__topics: {},
    			__preTopics: {},
    		},
	    	config || {}
	    );
	};

	EventBase.init = spa.utils.emptyFunc;
	/*
		pub/sub
	*/

	EventBase.subscribe = function(topics, listener){
		return this.__subscribe(this.__topics, topics, listener);
	};

	EventBase.preSubscribe = function(topics, listener){
		return this.__subscribe(this.__preTopics, topics, listener);
	};

	EventBase.__subscribe = function(target, topics, listener) {
		// create the topic if not yet created
		var 
			topic, 
			previous = [],
			subscriptions = [];

		if(!$.isArray(topics)) topics = [topics];
		for(var idx = topics.length; idx--;){
			topic = topics[idx];
			if(~previous.indexOf(topic)) continue;
			if(!Object.hasOwnProperty.call(target, topic)) {
				target[topic] = [];
			}

			// add the listener
			subscriptions.push(target[topic].push(listener)-1);
			previous.push(topic);
		}
		return {
			remove: function(){
				for(var idx = subscriptions.length; idx--;){ 
					delete target[topic][subscriptions[idx]];
				}
			}.bind(this)
		}
	};

	EventBase.__prePublish = function(topic, data){
		if(!data.disablePreHook && this.__preTopics[topic] && this.__preTopics[topic].length){

			// if all functions dont return true, kill the event
			if(!this.__preTopics[topic].every(function(func, index){
				return func(data, topic);
			})) return false;
		}
		return true;
	};

	EventBase.publish = function(topic, data) {
		data = data || {};

		if(!this.__prePublish(topic, data)){
			return false;
		}

		// run middle ware
		if(!data.disableMiddleware && this.__topics['__MIDDLEWARE__'] && this.__topics['__MIDDLEWARE__'].length){

			// if all functions dont return true, kill the event
			if(!this.__topics['__MIDDLEWARE__'].every(function(middleware, index){
				return middleware(data, topic);
			})) return false;
		}

		// return if the topic doesn't exist, or there are no listeners
		var 
			args = _.split(topic, ":"),
			__topic = args[0];

		if(!this.__topics[__topic] || this.__topics[__topic].length < 1) return;

		// send the event to all listeners
		args.unshift(data);
		this.__topics[__topic].forEach(function(listener) {
			setTimeout(function(args){
				listener.apply(null, args);
			}, 0, args);
		});
	};
	
	var gevent = EventBase.create();
	spa.subscribe = function(topics, listener){
		return gevent.subscribe(topics, listener);
	};

	spa.publish = function(topic, data){
		return gevent.publish(topic, data);
	};

	spa.preSubscribe = function(topic, listener){
		return gevent.preSubscribe(topic, listener);
	};

	spa.sub = spa.subscribe;
	spa.presub = spa.preSubscribe;
	spa.pub = spa.publish;

	return EventBase;
} )();

/*
	base object for renderables
*/
spa.RenderBase = ( function(){
	var RenderBase = {};
	RenderBase.errorTemplates = {};
	RenderBase.loadingHTML = "Loading...";

	RenderBase.create = function(config){
		return $.extend(
			Object.create(this), 
			{
				setTimeoutMap: {},
				setIntervalMap: {},
				$container: jQuery({}),
				context: {},
				template: '',
				cssRules: '',
				__subs: [],
			},
			config || {}
		);
	};

	// wrapper for mustache render template
	RenderBase.render = function(template, context, partials){
		if($.isPlainObject(template)){
			partials = context;
			context = template;
			template = undefined;
		}

		return Mustache.render(
			template || this.template,
			jQuery.extend({}, this.context, context || {}),
			jQuery.extend({}, this.templateMap, partials || {}) 
		);
	};

	RenderBase.loadingStart = function(){
		this.$container.before(this.loadingHTML);
	};

	RenderBase.__setUp = function($element){
		this.$container = $element;
		this.$container.addClass(this.name);
		
		this.hideContainerInit();

		if (!this.sheet) this.__parse_style();
		
		this.loadingStart();
		this.init();
	};

	RenderBase.__parse_style = function(){
		var sheet = jQuery('<style class="' + this.name + '-style">')
		sheet.append(this.cssRules || "");
		this.sheet = spa.$cache.$styleSheets.push(sheet);
	};

	RenderBase.__cleanUp = function(){
		// console.log('cleaning up', this.name, 'component', this);
		this.__clearSets();
		this.__clearSubs();
		this.hideContainer();
		this.$container.removeClass(this.name);
		spa.$cache.$styleSheets.unload(this.$container.attr('class') + '-style');
	};

	RenderBase.init = function(){
		// BAD?
		this.renderTemplate();
	};

	RenderBase.hideContainerInit = spa.utils.emptyFunc;

	RenderBase.hideContainer = spa.utils.emptyFunc;

	RenderBase.showContainer = function(callback){
		callback();
	};


	RenderBase.renderTemplate = function(context, partials, callback){
		if($.isFunction(context)) callback = context;
		if($.isFunction(partials)) callback = partials;

		this.$container.html(this.render(context, partials));
		this.components = this.$find(this.$container);
		this.showContainer(callback);
	};

	// ********************************************

	RenderBase.on = function(event, data, callback){
		return this.$container.on.apply(this.$container, arguments);
	};

	RenderBase.trigger = function(event, data, callback){
		return this.$container.trigger.apply(this.$container, arguments);
	};

	RenderBase.setTimeout = function(name, callback, delay, args){
		this.setTimeoutMap[name] = window.setTimeout.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setTimeoutMap[name];
	};

	RenderBase.setInterval = function(name, callback, delay, args){

		this.setIntervalMap[name] = window.setInterval.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setIntervalMap[name];
	};

	RenderBase.subscribe = function(topics, listener){
		this.__subs.push(spa.subscribe(topics, listener));
	};

	RenderBase.publish = spa.publish;

	RenderBase.__clearSubs = function(){
		this.__subs.forEach(function(value){
			value.remove();
		});
	};

	RenderBase.__clearSets = function(){
		for(var key in this.setIntervalMap){
			clearInterval( this.setIntervalMap[key] );
		}

		for(var key in this.setTimeoutMap){
			clearTimeout( this.setTimeoutMap[key] );
		}
	};

	// ********************************************

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

	RenderBase.$insert = function($element, config){
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
			component = bluePrint(config || {});
		}

		this.components.push(component);

		component.__setUp($element);
		return component
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
spa.RenderBase.errorTemplates['404'] = spa.RenderBase.create({
	title: '404',
	template: '<center><h1><i>Page {{name}} Not Found</i></h1>{{message}}<center>',
	create: function(config){
		config.template = config.template || this.template;
		return spa.RenderBase.create(config);
	}
});

spa.RenderBase.errorTemplates['500'] = spa.RenderBase.create({
	title: '500',
	template: '<center><h1><i>SPA error {{name}}</i></h1>{{message}}<center>',
	create: function(config){
		config.template = config.template || this.template;
		return spa.RenderBase.create(config);
	}
});

/*
	Shells
*/
spa.shells = {};
spa.Shell = ( function(){
	var Shell = Object.create(spa.RenderBase);
	
	Shell.defaultContainerSelector = '#spa-shell'; // move me

	Shell.add = function(shell){
		if(!shell.name) return false;

		shell = this.create(shell);
		spa.shells[shell.name] = shell;
	};

	Shell.renderTemplate = function(context, callback){
		spa.RenderBase.renderTemplate.call(this, context);
	};

	Shell.resize = function(){
		this.$container.height('100vh');
		this.$container.width('100vw');
		spa.publish("resize");
	}

	Shell.update = function(shell){
		shell = shell || spa.shells[ spa.defaults.shell ];
		
		// prevent double load of shell
		if(spa.current.shell === shell) return false;

		if (spa.current.shell) spa.current.shell.unload();

		spa.current.shell = shell;
		shell.__setUp(this.$container);
	};

	Shell.unload = function(){
		this.__cleanUp();
		(this.components ? this.components:[]).forEach(function(component){
			Shell.unload.call(component);
		}.bind(this));
	};

    Shell.create = function(config){
        return spa.RenderBase.create.call(this, config);
    };

	return Shell;
} )();

/*
	Components
*/
spa.components = {};
spa.Component = ( function(){
    var Component = Object.create(spa.RenderBase);

    Component.add = function(blue_print_config){
        if(!blue_print_config.name) return false;
        spa.components[blue_print_config.name] = function(config){
            config = !config ? blue_print_config : $.extend(Object.create(blue_print_config), config);
            return this.create(config);
        }.bind(this);
    };

    Component.create = function(config){
        return spa.RenderBase.create.call(this, config);
    };

    return Component;
} )();

/*
	Forms
*/
spa.Form = ( function(){
    var Form = Object.create(spa.RenderBase);

    Form.errorMessageClass = "input-error-message";

    Form.add = function(blue_print_config){
        if(!blue_print_config.name) return false;
        spa.components[blue_print_config.name] = function(config){
            config = !config ? blue_print_config : $.extend(Object.create(blue_print_config), config);
            return this.create(config);
        }.bind(this);
    };

    Form.renderErrors = function(data){
        var that = this;
        that.$container.find("." + that.errorMessageClass).remove();
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
        var that = this;
        var $target = this.getErrorTarget(name);
        if (message.prototype !== Array.prototype){
            message = [message];
        }
        jQuery.each(message, function(idx, value){
            $target.append('<span class="' + that.errorMessageClass + '">' + value + '</span>');
        });
    };

    Form.getErrorTarget = function(name) {
        return this.$container.find('[for="' + name + '"]');
    };

    Form.create = function(config){
        return spa.RenderBase.create.call(this, config);
    };

    return Form;
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
		routes = routes || this.defaultRoute;
		
		var re,
			match = false,
			parsedURL = XRegExp.exec(url,
				XRegExp('/?(?<path>[^?]*)\\??(?<query>[^#]*)\\#?(?<hash>.*)',
					'ix'
				)
			);

		routes.some(function(route){
			re = XRegExp.exec(parsedURL.path, XRegExp(route.uri, 'ix'));
			if(re){
				route.REQ = {
					url: url,
					re: re
				};

				match = route;
				match.query = spa.Router.deparam(parsedURL.query);
				match.hash = parsedURL.hash;
				match.path = "/"+parsedURL.path;

				return true;
			}
		});

		return match;
	},

	resolver: function(url, isHistoryEvent){
		isHistoryEvent = isHistoryEvent === undefined ? true :  isHistoryEvent;
		var match = this.lookup(url);

		// if(match.REQ.re[0] === spa.current.page.REQ.re[0]) return false;

		if(!match){
			match = spa.RenderBase.errorTemplates['404'].create({
				$container: jQuery(spa.Shell.defaultContainerSelector),
				context: {
					name: url
				}
			});
		}
		
		if(spa.devMode) url += '#dev';
		
		match.init();
		spa.Shell.update(match.shell);

		spa.publish('spa-route-change', match);

		spa.current.route = match

		if(isHistoryEvent){
			spa.Router.historyAdd({url: match.path}, match.title, match.path);
		}

	},

	historyAdd: function(state, title, url){
		window.history.pushState(state, title, url);
		// window.dispatchEvent(new Event('popstate'));
	},

	deparam: function (querystring) {
		// http://stackoverflow.com/a/14368860

		// remove any preceding url and split
		querystring = querystring.substring(
			querystring.indexOf('?')+1
		).split('&');

		var params = {},
			pair,
			decoder = decodeURIComponent;

		// march and parse
		for (var i = querystring.length - 1; i >= 0; i--) {
			pair = querystring[i].split('=');
			params[decoder(pair[0])] = decoder(pair[1] || '');
		}

		return params;
	},

};

/*
	bootstrap
*/
spa.init(function(){
    spa.$cache.$styleSheets = spa.StyleSheets.create();
    
    spa.subscribe("__dom-content-loaded-start", function(){
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
            spa.publish("load-shell", {
                "path": window.location.pathname,
                "isHistory": false
            });
        } );

        spa.$cache.$body.on('click', '.ajax-link', function(event){
            event.preventDefault();
            spa.publish("load-shell", {
                "path": jQuery(this).attr('href'),
                "isHistory": true
            });
            return false;
        });
        
    });

    spa.subscribe("__spa-ready", function(){
        /* 
            load the first route 
        */
        jQuery.holdReady(false);
        spa.publish("load-shell", {
            "path": window.location.pathname,
            "isHistory": false
        });
    });

    spa.subscribe("load-shell", function(data){
        
        spa.Router.resolver(data.path, data.isHistory);

        spa.$cache.$loader.hide();
        spa.Shell.$container.show();
    });

    (function(){
        var buildTaskCount = spa.buildTaskCount;

        spa.subscribe("__dom-content-loaded-end", function(data){
            if (buildTaskCount === 0){
                spa.publish("__spa-ready");
            }
            buildTaskCount--;
        });
        spa.subscribe("spa-build-task-complete", function(data){
            if (buildTaskCount === 0){
                spa.publish("__spa-ready");
            }
            buildTaskCount--;
        });
    }());

});
/*
	when the DOM is finished, start the spa
*/
jQuery(document).on("DOMContentLoaded", function(event) {
	spa.publish("__dom-content-loaded-start");
	spa.publish("__dom-content-loaded-end");
});
