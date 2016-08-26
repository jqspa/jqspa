spa.pages = [];
spa.Page = (function(){
	var page = Object.create(spa.__RenderBase);

	page.add = function(page){
		if(!page.uri) return false;

		page = this.__declare(page);
		spa.pages.push(page);
	};

	page.renderTemplate = function(context, callback){
		spa.__RenderBase.renderTemplate.call(this, context);
		document.title = this.title || document.title;
	};

	page.resolver = function(url, isHistortyEvent){
		isHistortyEvent = isHistortyEvent === undefined ? true :  false;
		var match = spa.Router.lookup(url, spa.pages);

		if(match === spa.current.page) return false;
		if(!match){
			match = this.errorTemplates['404'];

			match.context = {
				name: url
			};
		}
		if(spa.current.page){
			spa.current.page.unload();
		}

		spa.Shell.update(match.shell);

		match.__setUp(spa.current.shell.$container.find('#spa-shell-page'));
		spa.current.page = match;

		if(isHistortyEvent){
			spa.Router.historyAdd({url: url}, match.title, url);
		}

	};


	return page;
})();
