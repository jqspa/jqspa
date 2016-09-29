spa.components = {};
spa.Component = ( function(){
    var component = spa.Mixer(spa.EventBase, spa.RenderBase);

    component.add = function(component){
        if(!component.name) return false;
        spa.components[component.name] = function(){
        	return this.constructor(component);
        }.bind(this);
    };

    return component;
} )();