spa.__RenderBase = ( function(){
	var __RenderBase = Object.create(spa.__EventBase);

	__RenderBase.context = {};
	__RenderBase.template = '';
	__RenderBase.errorTemplates = {};

	__RenderBase.__setUp = function($element){
		this.$container = $element;
		this.init();
	};

	__RenderBase.init = function(){
		this.renderTemplate();
	},

	__RenderBase.renderTemplate = function(context){
		this.$container.html( Mustache.render(
			this.template,
			jQuery.extend({}, this.context, context)
		) );
		this.components = spa.Component.$find(this.$container);
	};

	return __RenderBase;
} )();
