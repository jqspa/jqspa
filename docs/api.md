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

