spa.RenderBase = ( function(){
	var RenderBase = Object.create(spa.EventBase);

	RenderBase.context = {};
	RenderBase.template = '';
	RenderBase.errorTemplates = {};

	RenderBase.__setUp = function($element){
		this.$container = $element;
		this.init();
	};

	RenderBase.init = function(){
		this.renderTemplate();
	},

	RenderBase.renderTemplate = function(context){
		this.$container.html( Mustache.render(
			this.template,
			jQuery.extend({}, this.context, context)
		) );
		this.components = spa.Component.$find(this.$container);
	};

	return RenderBase;
} )();
