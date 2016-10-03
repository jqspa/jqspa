spa.components = {};
spa.Component = ( function(){
    var Component = {};

    Component.add = function(component){
        if(!component.name) return false;
        spa.components[component.name] = function(){
            return this.create(component);
        }.bind(this);
    };

    Component.create = function(config){
        return $.extend(Object.create(Component), config || {});
    };

    return spa.Mixer(spa.EventBase, spa.RenderBase, Component);
} )();

console.log("Comp Proto",spa.Component);