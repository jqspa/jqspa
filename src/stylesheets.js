spa.StyleSheets = (function(){
	var styleSheets = Object.create(Array.prototype);

	styleSheets.create = function(){
		var args = [].slice.apply(arguments);

		var $body = jQuery("body");
		if ($body.length) {
			args.unshift($body);
			args = this.load.apply(this, args);
		}

		return $.extend(Object.create(this), args);
	};

	styleSheets.push = function(){
		var args = [].slice.apply(arguments);
		
		var $body = jQuery("body");
		if ($body.length) {
			args.unshift($body);
			args = this.load.apply(this, args);
		}
		return Array.prototype.push.apply(this, args);
	};

	styleSheets.unload = function(sheet_class){
		var components = jQuery("body ." + sheet_class);
		if (components.length === 0){
			var $sheet = jQuery('body style.' + sheet_class);
			$sheet.remove();
			var idx = this.indexOf($sheet[0]);
			if (~idx !== 0) this.splice(idx, 1);
			return true;
		}
		return false;
	};

	styleSheets.load = function($body){
		var sheet, args = [].slice.apply(arguments);
		args.shift();
		var sheet_count = args.length, idx = 0;
		for (;idx < sheet_count; idx++){
			sheet = args[idx];
			if ($body.children('style[class="' + sheet.attr("class") + '"]').length === 0){
				$body.append(args[idx]);
			} else {
				args.splice(idx, 1);
				sheet_count--;
				idx--;
			}
		}
		return args;
	};

	return styleSheets;
})();
	