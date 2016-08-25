
#`window.spa`
is global namespace object that will hold everything.

`defaults` *Object* holding project default names and settings.
`shells` *Object* holding all avail shells
`pages` *Array* of pages ordered
`components` *Object* holding
`$cache` *Object* holding cached jQuery objects
`errorPages` *object* holding renderable error templates for when things fail
 

* ## `spa.__Renderable`
  This object holds the methods that load, render and manager interaction with the DOM. It is not meant to be used directly but is a base object for other object.
 
  * `context`
    * *Object* default `{}`
    * Holds the context to be passed when the template is rendered.
 
  * `template`
    * *String* default `''`
    * The main template.
 
  * `setTimeouts` and `setInterval`
    * *Objects* default `{}`
    * Holds references to timeouts and intervals. All must be held here for proper clean up.
 
  * `$container`
    * *jQuery object*
    Reference to the parent container. This is where the object renders its template to.
 
  * `__setUp( $element )`
    * `$element` *jQuery object*
      * the renderables container
    * Sets up the internal state. Then calls the init.
    * **This is a internal method not meant to be called outside of the spa object.**
 
  * `init()`
    * Hold the starting logic. This must call `this.renderTemplate`. Default action is reading the template.
 
  * `renderTemplate( [context] )`
    * `context` *Object* 
      * render context
    * Renders the template to the objects container. **context** passed will extend `this`.context and be passed to the render.

  * `__delcare( context )`
    * `context` *object* new instance context
    * **returns** new instance of `this` object with the passed **context**.

  * `__clearSets()`
    * Internal method to clear all `setTimeOuts` and `setIntervals`

  * `unload()`
    * Clean up object, calls `this.clearSets`


* ## `Shell` 
  The shell is the outer most layer of the Document wrapper. At least one shell must be declared, the `index` shell. The shell implements all `__Renderable` with some new ones and changes

  * `add( shell )`
    * `shell` object
      * object defining the shell to be added
    * Takes the *shell*, creates an instance for it and registers that with the spa.

  * `update( shell )`
    * `shell`
   		* *spa.shell element*
      * reference to new shell
    * Updates the  current shell with a new **shell** if the new shell is different then the current one.


* ## `Page`
Pages hold main content, and are routable by default. The page implements all `__Renderable` with some new ones and changes

  * `add( page )`
	* `page` object
	* object defining the page to be added.
    * takes page objects and registers them with the spa.

  * `renderTemplate( context )`
    * Calls `__Tamplate.renderTemplate` and sets the pages title


* ## components
Components are spinets of functionality, think like Java applets or active X components. This where you should place all interactive elements of your application. The component implements all `__Renderable` with some new ones and changes

  * `add( component )`
	* `component` object
	  * object defining the component to be added
    * takes component objects and registers them with the spa.


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
