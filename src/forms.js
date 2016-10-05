spa.Form = ( function(){
    var Form = {};

    Form.add = function(blue_print_config){
        if(!blue_print_config.name) return false;
        spa.components[blue_print_config.name] = function(config){
            return this.create($.extend(Object.create(blue_print_config), config));
        }.bind(this);
    };

    Form.renderErrors = function(data){
        var that = this;

        jQuery.each(data, function(key, value){
            if (Object.hasOwnProperty.call(that, "set" + key + "Error")){
                that["set" + key + "Error"](key, value)
            }
            else{
                that.setError(key, value)
            }
        });
    };

    Form.setError = function(name, message){
        var $target = this.getErrorTarget(name);
        if (message.prototype !== Array.prototype){
            message = [message];
        }
        jQuery.each(message, function(idx, value){
            $target.append("<span>" + value + "</span>");
        });
    };

    Form.getErrorTarget = function(name) {
        return this.$container.find('[for="' + name + '"]');
    };

    Form.create = function(config){
        return $.extend(Object.create(Form), config || {});
    };

    return spa.Mixer(spa.EventBase, spa.RenderBase, Form);
} )();