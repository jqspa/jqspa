spa.shells = {};
spa.Shell = ( function(){
	var shell = Object.create(spa.__RenderBase);

	shell.defualtContainerSelector = '#spa-shell';

	shell.add = function(shell){
		if(!shell.name) return false;

		shell = this.__declare(shell);

		spa.shells[shell.name] = shell;
	};
	shell.renderTemplate = function(context, callback){
		spa.__RenderBase.renderTemplate.call(this, context);
	};

	shell.update = function(shell){
		shell = shell || spa.shells[ spa.defualts.shell ];
		if(spa.current.shell === shell) return false;

		spa.current.shell = shell;
		shell.__setUp(this.$container);
	};

	$(document).on("DOMContentLoaded", function(event) {
		spa.Shell.$container = jQuery(this.defualtContainerSelector);
	});

	return shell;
} )();
