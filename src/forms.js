spa.Form = ( function(){
    var form = Object.create(spa.Component);

    form.renderErrors = function(data){
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

    form.setError = function(name, message){
        var $target = this.getErrorTarget(name);
        if (message.prototype !== Array.prototype){
            message = [message];
        }
        jQuery.each(message, function(idx, value){
            $target.append("<span>" + value + "</span>");
        });
    };

    form.getErrorTarget = function(name) {
        return this.$container.find('[for="' + name + '"]')
    };

    return form;
} )();