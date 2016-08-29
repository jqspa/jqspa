spa.routes = [];
spa.Router = {
	defaultRoute: spa.pages,

	lookup: function(url, routes){
		var match = false;
		url = url.replace(/^\/+/, '');
		routes = routes || this.defaultRoute;

		if(!routes.some(function(route){
			var re = XRegExp.exec(url, XRegExp(route.uri, 'ix'));
			if(re){
				route.REQ = {
					url: url,
					re: re
				};
				match = route;
				return true;
			}
		}));

		return match;
	},

	historyAdd: function(state, title, url){
		window.history.pushState(state, title, url);
		// window.dispatchEvent(new Event('popstate'));

	}

};
