spa.Form = ( function(){
    var Form = Object.create(spa.RenderBase);

    Form.errorMessageClass = "input-error-message";

    Form.add = function(blue_print_config){
        if(!blue_print_config.name) return false;
        spa.components[blue_print_config.name] = function(config){
            config = !config ? blue_print_config : $.extend(Object.create(blue_print_config), config);
            return this.create(config);
        }.bind(this);
    };

    Form.renderErrors = function(data){
        var that = this;
        that.$container.find("." + that.errorMessageClass).remove();
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
        var that = this;
        var $target = this.getErrorTarget(name);
        if (message.prototype !== Array.prototype){
            message = [message];
        }
        jQuery.each(message, function(idx, value){
            $target.append('<span class="' + that.errorMessageClass + '">' + value + '</span>');
        });
    };

    Form.getErrorTarget = function(name) {
        return this.$container.find('[for="' + name + '"]');
    };

    Form.create = function(config){
        return spa.RenderBase.create.call(this, config);
    };

    return Form;
} )();