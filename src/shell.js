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
