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
