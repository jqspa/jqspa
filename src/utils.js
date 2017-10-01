spa.utils = {};

(function(utils) {

    // only use memory for one empty function
	utils.emptyFunc = function(){};

	utils.UUID = function(){
        var d = new Date().getTime();
        return uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
    };

})(spa.utils);

(function($){
    $.fn.serializeObject = function() {
        var 
            arr = $(this).serializeArray(), 
            obj = {};
        
        for(var i = 0; i < arr.length; i++) {
            if(obj[arr[i].name] === undefined) {
                obj[arr[i].name] = arr[i].value;
            } else {
                if(!(obj[arr[i].name] instanceof Array)) {
                    obj[arr[i].name] = [obj[arr[i].name]];
                }
                obj[arr[i].name].push(arr[i].value);
            }
        }
        return obj;
    };
})(jQuery);
