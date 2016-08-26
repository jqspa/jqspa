console.log('loaded')

spa.components = {};
spa.Component = (function(){
	var component = Object.create(spa.__RenderBase);

	component.add =function(component){
		if(!component.name) return false;

		component = this.__declare(component);
		spa.components[component.name] = component;
	};

	component.$find = function($element, dontStart){
		var components = [];

		$element.find('[data-component-name]').each(function(element){
			var $this = $(this);
			var componentName = $this.data('component-name');
			var component = spa.components[componentName];
			
			//set error component if none is found
			if(!component){
				component = spa.Component.errorTemplates['404'];
				component.context = {
					name: componentName
				};
			}else{
				components.push(component);
			}

			component.__setUp($this);
		});

		return components;
	}

	return component;
})();
