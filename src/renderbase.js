spa.RenderBase = ( function(){
	var RenderBase = Object.create(spa.EventBase);

	RenderBase.context = {};
	RenderBase.template = '';
	RenderBase.errorTemplates = {};

	RenderBase.__setUp = function($element){
		this.$container = $element;
		this.$container.addClass(this.name);
		this.init();
	};

	RenderBase.init = function(){
		// BAD?
		this.renderTemplate();
	};

	RenderBase.renderTemplate = function(context){
		this.$container.html( Mustache.render(
			this.template,
			jQuery.extend({}, this.context, context)
		) );
		this.components = this.$find(this.$container);
	};

	RenderBase.$find = function($element, dontStart){
		var components = [];
		$element.find('[data-component-name]').each(function(index, element){

			var $element = jQuery(element);
			var componentName = $element.data('component-name');
			var component = spa.components[componentName];
			
			//set error component if none is found
			if(!component){
				component = spa.Component.errorTemplates['404'];
				component.context = {
					name: componentName
				};
			}else{
				components.push(component);
			}

			component.__setUp($element);
		});

		return components;
	};
	return RenderBase;
} )();
