# `spa.utils`

Name space for sharing common utility actions. End users should project specific utilities here as well. 

## Methods

* **emptyFunc**
	* *type*| `function`
	* *takes*| nothing/anything
	* *returns*| `null`
	
	Empty function so it only needs to be created once.
	
	```js
	function someFunction(callback){
		callback = callback || spa.utitls.emptyFunc;

		... code ...

		callback(data);
	}
	```

* UUID

	*type* `function`

	*takes* nothing

	*returns* UUID as a `string`

	Creates UUID4*ish* strings.
	```js
	let uuid = spa.utitls.UUID() // "6ae2b7b9-417b-4393-98e6-a740a7783f90"
	```

## jQuery plugins

* serializeObject

	*type* `function`

	*takes* nothing, works on chained jQuery form node

	*returns* `object`

	representing the inputed form
	```js
	$('form').on('submit', function(event){
		var formData = $(this).serializeObject();
	});
	```
