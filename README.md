
## spa
	`window.spa` is global namespace object that will hold everything.

## `spa.__Template`
This class holds the methods that load, render and manager inter action from with the DOM. It is not meant to be used directly.

`context` Object default `{}`
Holds the context to be passed to the render function.

`template` String default `''`
The main template of its object.

`setTimeouts` and `setInterval` Objects default {}
Objects to hold references to timeouts and intervals. All must be held here for proper clean up.

`$container` jQuery object
Reference to the container belongs to. This is where the object renders its template to.

`__setUp` function
Arguments
	`$element` required jQuery object of the objects container
Sets up the internal state. Then calls the init.
This is a internal method not meant to be called outside of the spa object.

`init` Function
Arguments
	None, user set.
Hold the starting logic. This must call `this.renderTemplate`. Default action is reading the template.

`renderTemplate` Function
Arguments
	`context` Object render context
renders the template to the objects container. context passed will extend this.context.

`__delcare` Function
Internal method to aid in instance creation.
returns new instance.

`__clearSets` Function
Internal method to clear all `setTimeOuts` and `setIntervals`

`unload` Function
Clean up object, calls `this.clearSets`


## shell
The shell is the outer most layer of the Document wrapper. At least one shell must be declared, the `index` shell. The shell implements all `__template` with some new ones and changes

# shell methods
`add` Function
Arguments
	`shell` object
	object defining the shell to be added
takes shell objects and registers them with the spa.

`update`
Arguments
	'shell' refence to new shell
Updates the shell with a new shell if the new shell is different then the current one


## page
Pages hold main content, and are routable by default. The page implements all `__template` with some new ones and changes

`add` Function
Arguments
	`page` object
	object defining the page to be added
takes page objects and registers them with the spa.

`renderTemplate`
Calls `__Tamplate.renderTemplate` and sets the pages title


## components
Components are spinets of functionality, think like Java applets or active X components. This where you should place all interactive elements of your application. The component implements all `__template` with some new ones and changes

`add` Function
Arguments
	`component` object
	object defining the component to be added
takes component objects and registers them with the spa.


`$find`
Arguments
	`$element` jQuery Object
Find will search a element for components. It will then start each of them.

return Array of components in the element.



##page object

`uri` String **requires**
	regex match for url path
	**DO NOT PUT SLASHES!**

`template` String
	string of HTML to be parsed by Mustache

`title` String
	HTML title tag contents

`context` Object default `{}`
	default Object to be padded to Mustache while rendering
