spa.__EventBase = ( function(){
	var __EventBase = {};
	__EventBase.setTimeoutMap = {};
	__EventBase.setIntervalMap = {};
	__EventBase.listeners = {};
	__EventBase.$container = jQuery({});


	__EventBase.on = function(event, data, callback){
		return this.$container.on.apply(this, arguments);
	};

	__EventBase.triger = function(event, data, callback){
		return this.$container.triger.apply(this, arguments);
	};

	__EventBase.setTimeOut = function(name, callback, delay, args){
		this.setTimeoutMap[name] = window.setTimeOut.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setTimeoutMap[name];
	};

	__EventBase.setInterval = function(name, callback, delay, args){

		this.setIntervalMap[name] = window.setInterval.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setIntervalMap[name];
	};

	__EventBase.__clearSets = function(){
		for(var key in this.setIntervalMap){
			clearInterval( this.setIntervalMap[key] );
		}

		for(var key in this.setTimeoutMap){
			clearTimeout( this.setTimeoutMap[key] );
		}
	};

	__EventBase.unload =  function(){
		this.__clearSets();
	};

	__EventBase.__declare =  function(object){
		var newObject = Object.create(this);

		return jQuery.extend(newObject, {__declare:null}, object);
	};

	return __EventBase;
} )();
