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

spa.Form = ( function(){
    var form = Object.create(spa.Component);

    form.value_map = {};

    // Does this make sense
    form.input_cache = {};

    form.renderErrors = function(data){
        // data is an object where the kwys
        // are fields. The values are explanations 
        // as to why the field is invalid.
    };

    return form;
} )();