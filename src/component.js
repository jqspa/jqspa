spa.components = {};
spa.Component = ( function(){
    var Component = Object.create(spa.RenderBase);

    Component.add = function(blue_print_config){
        if(!blue_print_config.name) return false;
        spa.components[blue_print_config.name] = function(config){
            config = !config ? blue_print_config : $.extend(Object.create(blue_print_config), config);
            return this.create(config);
        }.bind(this);
    };

    Component.create = function(config){
        return RenderBase.create.call(this, config);
    };

    return Component;
} )();