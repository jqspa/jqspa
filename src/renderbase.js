spa.RenderBase = ( function(){
	var RenderBase = {};
	RenderBase.errorTemplates = {};
	RenderBase.loadingHTML = "Loading...";

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

	RenderBase.init = function(){
		// BAD?
		this.renderTemplate();
	};

	RenderBase.loadingStart = function(){
		this.$container.before(this.loadingHTML);
	};

	// change name to `containerInit`
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

	RenderBase.$find = function($element){
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
