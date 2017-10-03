# `spa.utils`

Name space for sharing common utility actions. End users should project specific utilities here as well. 

## Methods

* **emptyFunc**
	* *type* | `function`
	* *takes* | nothing/anything
	* *returns* | `null`
	
	Empty function so it only needs to be created once.
	
	```js
	function someFunction(callback){
		callback = callback || spa.utitls.emptyFunc;

		... code ...

		callback(data);
	}
	```

* **UUID**
	* *type* | `function`
	* *takes* | nothing
	* *returns* | UUID as a `string`

	Creates UUID4*ish* strings.

	```js
	let uuid = spa.utitls.UUID() // "6ae2b7b9-417b-4393-98e6-a740a7783f90"
	```

## jQuery plugins

* **serializeObject**
	* *type* | `function`
	* *takes* | nothing, works on chained jQuery form node
	* *returns* | `object`

	representing the inputed form

	```js
	$('form').on('submit', function(event){
		var formData = $(this).serializeObject();
	});
	```


# `spa.StyleSheets`

Internal object to load and unload components CSS

# `spa.EventBase`

Internal object to implement topic based pub/sub events.

## Methods
* **subscribe**
	* *type* | `function`
	* *takes* |
		* `string` topic to listen for
		* `function` function to run when listener is called. data as an `object` will be passed as the first argument.
	* *returns* `object` holding a remove `function`.

	Add listeners to call when topics are published. 

	```js
	let newUserSubscription =  spa.subscribe('user-new', function(data){
		alert('Welcome new user '* data.userName);
	});

	// removes the listen
	newUserSubscription.remove();
	```

* **preSubscribe**
	* *type* | `function`
	* *takes* |
		* `string` topic to listen for
		* `function` function to run when listener is called. data as an `object` will be passed as the first argument.
	* *returns* `object` holding a remove `function`.

	Add listeners to call when before the topic is published. All callback functions must return true, or the topic publish will not be called. 

	```js
	let newUserPreSubscription =  spa.preSubscribe('user-new', function(data){
		if(data.username) return true;
	});

	// removes the listen
	newUserPreSubscription.remove();
	```

* **publish**
	* *type* | `function`
	* *takes* |
		* `string` topic to publish event to **required**
		* `object` data to be passed to all subscribing function
	* *returns* | `null`

	Calls all subscribing functions with passed data. Each function call is wrapped in `setTimeout` as not to block.

	```js
	spa.publish('user-new', {
		'userName': 'Mike',
		'userId': 2345312,
		'avatar': 'https://i.imgur.com/xkysUax.gif'
	})
	```

# `spa.Service`

User defined services for interacting with data sources, mostly API wrappers.

## methods
* **add**
	* type | `function`
	* *takes* | `object` holding the service. 
		* `name` key with the service name is **required**. 
		* `init` function can be defined witch will run when service is added.
	* *returns* `none`

	Method for adding services to your application.

	```
	spa.Service.add({ // codeland-crunner
		name: 'codeland-crunner',
		run: function(args){ // language, code, callback
			$.ajax({
				jar: args.jar,
				method: 'POST',
				url: '/api/v0/courses/run',
				dataType: "json",
				data: {
					language: args.language,
					code: args.code
				},
				success: function(data){
					data.token = args.token;
					(args.callback || spa.utils.emptyFunc)(data);
				}
			});
		},
		test: function(args){
			return $.ajax({
				jar: args.jar,
				method: 'POST',
				url: '/api/v0/user/teams/' + args.team.slug + '/tracks/' + args.track.slug + '/test-attempts',
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify({
					language: args.language,
					// code: window.btoa(args.code.replace(/\t/g,'    ')),
					sha: args.sha,
					github_id: args.github_id,
					repo: args.repo,
					path: args.path,
					type: args.type
				})
			});
		}
	});
	```

# `spa.Model`

User defined Models for manipulating, caching and distributing data in the application.

## methods
* **add**
	* type | `function`
	* *takes* | `object` holding the Model. 
		* `name` key with the model name is **required**. 
		* `init` function can be defined witch will run when service is added.
	* *returns* `none`

	Method for adding models to your application.

	```js
	```


# `spa.$cache`

`object` that holds cached jQuery nodes.

* **$loader** `#spa-loader-holder` Holds the elements to be displayed while the spa in first loading.

* **$body** `body`

# `spa.current`

`object` that holds current references for spa objects

## Properties

* **shell** | refernce to currently loaded shell.
* **route** | reference to the current loaded route.

# `spa.RenderBase`

Base prototype for DOM renderable objects. This is the base for `spa.Shell` and `spa.Component`  

## instance Properties

* **$container** | `jQuery` object for the current renderables DOM element node. This will always be set the spa when a randerable is created.
* **context** | `object` holding the context to be rendered by Mustache.
* **template** | `string` Base template for renaderable during Mustache rendering.
* **templateMap** | `object` of other templates as strings to used for the renderable. This object will also be passed to Mustaches render as partials.
* **cssRules** | `string` style sheet for the renderable.

## class Properties

* **loadingHTML** | `string` HTML content for the DOM while loading. Default `"Loading..."`. This can be edited anytime.
* **erroTemplates** | `object` Holds what content will be displayed if errors while loading. Currently supports `404` and `500`.

## Methods

* **init**
	* *takes* | `null`
	* *returns* | `null`
	Function be run when ever an instance of the renderable is created. The default action is simply to call the renderables `renderTamplate` method. if you over write this method, remember you have to call `renderTemplate` your self.

* **render**
	* *takes* |
		* `string` template to be used with Mustache. **optional** If the first argument isnt a string, the renrderables `.template` will be used.
		* `object` context to extended on the current renderables context. **required**
		* *partials* `object` of Mustache partials to be extended on the currents renderables `templateMap`.

* **renderTemplate**
	* *takes* |
		* *context* `object` Mustache context object. **optional**
		* *partials* `object` of Mustache partials to be passed for randering. **optional**
		* **callback** `function` callback to be ran after renderable contents is on the DOM. **optional**

		This function is responsible for getting content onto the DOM.

* **loadingStart**
	* *takes* | nothing
	* *returns* | nothing

	Function to display loading text.

	```js
	spa.RenderBase.loadingStart = function(){
	    this.$container.prev('.spa-spinner-component').remove();
	    var loadingHTML = this.loadingHTML;
	    this.$container.before(loadingHTML);
	};
	```

* **hideContainerInit**
	* *takes* | nothing
	* *returns* | nothing

	Sets initial state of the DOM. Mostly used for set up effects.

	```js
	spa.RenderBase.hideContainerInit = function(){
		this.$container.css('opacity', 0);
	};
	```

* **hideContainer**
	* *takes* | nothing
	* *returns* | nothing

	Hides the container when it going be removed from the page.

* **showContainer**
	* *takes* | `function` callback when the container is fully displayed.
	* *returns* | nothing

	Call effects on how to display the container. If you implement this, you must call the callback when the container is done.

	```js
	spa.RenderBase.showContainer = function(callback){
	    this.$container.prev('.spa-spinner-component').remove();
	    this.$container.stop().fadeTo('slow', 1, callback);
	};
	``` 

* **$find**
	* *takes* | `jQuery` element to search for components.
	* *returns* | `array` of components located.

	Searches $element for components and creates them.

* **$insert**
	* *takes* | 
		* `jQuery` element with a `data-component-name` attribute.
		* `object` configurables that will be passed to the created component.
	* *returns* | `spa.Component` instance for the provided element.

	Blindly assumes the element is within the calling component(This may or may not be problematic depending on how `spa.Component` clean up is done). Attempts to create `spa.Component` instance using the component name from the element's `data-component-name` attribute(If the `data-component-name` does not match any registered comopent an error component is created). Adds the newly created `spa.Component` to the calling component's array of components(Wow terrible naming). Returns the newly created component.

# `spa.Shell`

Shells act as whole page templates and container holders. Shells also act as router able objects by default. Shells extend from and implement everything from
`spa.RenderBase`.

# class Properties

* *defaultContainerSelector* | `string` jQurty selector for the shell container. Default is `"#spa-shell"`.

# Methods

* *add* | 
	* *takes* | `object` representing the shell to be added. A `name` key must be implemented.

