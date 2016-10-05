spa.components = {};
spa.Component = ( function(){
    var Component = {};

    Component.add = function(blue_print_config){
        if(!blue_print_config.name) return false;
        spa.components[blue_print_config.name] = function(config){
            return this.create($.extend(Object.create(blue_print_config), config));
        }.bind(this);
    };

    Component.create = function(config){
        return $.extend(Object.create(Component), config || {});
    };

    return spa.Mixer(spa.EventBase, spa.RenderBase, Component);
} )();