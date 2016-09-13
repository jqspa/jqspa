spa.EventBase = ( function(){
	var EventBase = {};
	EventBase.setTimeoutMap = {};
	EventBase.setIntervalMap = {};
	EventBase.listeners = {};
	EventBase.$container = jQuery({});


	EventBase.on = function(event, data, callback){
		return this.$container.on.apply(this.$container, arguments);
	};

	EventBase.trigger = function(event, data, callback){
		return this.$container.trigger.apply(this.$container, arguments);
	};

	EventBase.setTimeOut = function(name, callback, delay, args){
		this.setTimeoutMap[name] = window.setTimeOut.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setTimeoutMap[name];
	};

	EventBase.setInterval = function(name, callback, delay, args){

		this.setIntervalMap[name] = window.setInterval.apply(
			window,
			Array.apply(this, arguments).splice(1)
		);

		return this.setIntervalMap[name];
	};

	EventBase.__clearSets = function(){
		for(var key in this.setIntervalMap){
			clearInterval( this.setIntervalMap[key] );
		}

		for(var key in this.setTimeoutMap){
			clearTimeout( this.setTimeoutMap[key] );
		}
	};

	EventBase.unload =  function(){
		this.__clearSets();
	};

	EventBase.__declare =  function(object){
		var newObject = Object.create(this);

		return jQuery.extend(newObject, object);
	};

	/*
		pub/sub
	*/

	EventBase.__topics = {};

	EventBase.subscribe = function(topic, listener) {
		// create the topic if not yet created
		if(!this.__topics[topic]) this.__topics[topic] = [];

		// add the listener
		this.__topics[topic].push(listener);
	}

	EventBase.publish = function(topic, data) {
		// return if the topic doesn't exist, or there are no listeners
		if(!this.__topics[topic] || this.__topics[topic].length < 1) return;

		// send the event to all listeners
		this.__topics[topic].forEach(function(listener) {
			listener(data || {});
		});
	}




	return EventBase;
} )();
