spa.Form = ( function(){
    var form = Object.create(spa.Component);

    form.renderErrors = function(data){
        jQuery.each(data, function(key, value){
            form.setError(key, value)
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