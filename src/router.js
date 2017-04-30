spa.routes = [];
spa.current.route = {};
spa.Router = {
	defaultRoute: spa.routes,

	add: function(route){

		if( $.isArray(route) ){
			route.forEach(this.add);
			return ;
		}

		if(!route.uri && !route.init) return false;

		spa.routes.push( route );
		return true;
	},

	lookup: function(url, routes){
		routes = routes || this.defaultRoute;
		
		var re,
			match = false,
			parsedURL = XRegExp.exec(url,
				XRegExp('/?(?<path>[^?]*)\\??(?<query>[^#]*)\\#?(?<hash>.*)',
					'ix'
				)
			);

		routes.some(function(route){
			re = XRegExp.exec(parsedURL.path, XRegExp(route.uri, 'ix'));
			if(re){
				route.REQ = {
					url: url,
					re: re
				};

				match = route;
				match.query = spa.Router.deparam(parsedURL.query);
				match.hash = parsedURL.hash;
				match.path = "/"+parsedURL.path;

				return true;
			}
		});

		return match;
	},

	resolver: function(url, isHistoryEvent){
		isHistoryEvent = isHistoryEvent === undefined ? true :  isHistoryEvent;
		var match = this.lookup(url);

		if(!match){
			match = spa.RenderBase.errorTemplates['404'].create({
				$container: jQuery(spa.Shell.defaultContainerSelector),
				context: {
					name: url
				}
			});
		}
		
		if(spa.devMode) url += '#dev';
		
		match.init();
		spa.Shell.update(match);

		spa.publish('spa-route-change', match);

		spa.current.route = match

		if(isHistoryEvent){
			spa.Router.historyAdd({url: match.path}, match.title, match.path);
		}

	},

	historyAdd: function(state, title, url){
		console.log('check hist',url, window.location.pathname);
		
		if(url === window.location.pathname){
			return false;
		}

		window.history.pushState(state, title, url);
		// window.dispatchEvent(new Event('popstate'));
	},

	deparam: function (querystring) {
		// http://stackoverflow.com/a/14368860

		// remove any preceding url and split
		querystring = querystring.substring(
			querystring.indexOf('?')+1
		).split('&');

		var params = {},
			pair,
			decoder = decodeURIComponent;

		// march and parse
		for (var i = querystring.length - 1; i >= 0; i--) {
			pair = querystring[i].split('=');
			params[decoder(pair[0])] = decoder(pair[1] || '');
		}

		return params;
	},

};
