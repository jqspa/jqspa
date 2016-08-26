spa.__RenderBase = {
	context: {},
	template: '',
	setTimeouts: {},
	setInterval: {},
	errorTemplates: {},
	$container: null,

	__setUp: function($element){
		this.$container = $element;
		this.init();
	},

	init: function(){
		this.renderTemplate();
	},
	renderTemplate: function(context){
		this.$container.html( Mustache.render(
			this.template,
			$.extend({}, this.context, context)
		) );
		this.components = spa.Component.$find(this.$container);
	},
	__declare: function(object){
		var newObject = Object.create(this);

		return $.extend(newObject, {__declare:null}, object);
	},
	__clearSets: function(){
		for(var key in this.setInterval){
			clearInterval( this.setInterval[key] );
		}

		for(var key in this.setTimeouts){
			clearTimeout( this.setTimeouts[key] );
		}
	},
	unload: function(){
		this.__clearSets();
	},
};
