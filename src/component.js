spa.components = {};
spa.Component = ( function(){
	var component = Object.create(spa.RenderBase);

	component.add = function(component){
		if(!component.name) return false;

		component = this.__declare(component);
		spa.components[component.name] = component;
	};


	return component;
} )();