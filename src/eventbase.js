spa.EventBase = ( function(){
    var EventBase = {};

    EventBase.listeners = {};
    EventBase.create = function(config){
    	return $.extend({
    		setTimeoutMap: {},
    		setIntervalMap: {},
    		$container: jQuery({})
    	}, Object.create(EventBase), config || {});
	}
	EventBase.on = function(event, data, callback){
		return this.$container.on.apply(this.$container, arguments);
	};

	EventBase.trigger = function(event, data, callback){
		return this.$container.trigger.apply(this.$container, arguments);
	};

	EventBase.setTimeout = function(name, callback, delay, args){
		this.setTimeoutMap[name] = window.setTimeout.apply(
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

	EventBase.init =  function(){};
	/*
		pub/sub
	*/

	EventBase.__topics = {};

	EventBase.subscribe = function(topics, listener) {
		// create the topic if not yet created
		var topic, previous = [];
		if(!$.isArray(topics)) topics = [topics];
		for(var idx = topics.length; idx--;){
			topic = topics[idx];
			if(~previous.indexOf(topic)) continue;
			if(!Object.hasOwnProperty.call(this.__topics, topic)) {
				this.__topics[topic] = [];
			}

			// add the listener
			this.__topics[topic].push(listener);
			previous.push(topic);
		}
	};

	EventBase.publish = function(topic, data) {
		// return if the topic doesn't exist, or there are no listeners
		if(!this.__topics[topic] || this.__topics[topic].length < 1) return;

		// send the event to all listeners
		this.__topics[topic].forEach(function(listener) {
			setTimeout(function(data){
				listener(data || {});
			}, 0, data);
		});
	};

	return Object.create(EventBase);
} )();
