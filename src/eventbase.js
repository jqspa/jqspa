spa.EventBase = ( function(){
    var EventBase = {};

    EventBase.create = function(config){

    	return $.extend(
    		Object.create(EventBase),
    		{
    			__topics: {}
    		},
	    	config || {}
	    );
	};

	EventBase.init =  function(){};
	/*
		pub/sub
	*/

	EventBase.subscribe = function(topics, listener) {
		// create the topic if not yet created
		var 
			topic, 
			previous = [],
			subscriptions = [];

		if(!$.isArray(topics)) topics = [topics];
		for(var idx = topics.length; idx--;){
			topic = topics[idx];
			if(~previous.indexOf(topic)) continue;
			if(!Object.hasOwnProperty.call(this.__topics, topic)) {
				this.__topics[topic] = [];
			}

			// add the listener
			subscriptions.push(this.__topics[topic].push(listener)-1);
			previous.push(topic);
		}
		return {
			remove: function(){
				for(var idx = subscriptions.length; idx--;){ 
					delete this.__topics[topic][idx];
				}
			}.bind(this)
		}
	};

	EventBase.publish = function(topic, data) {
		data = data || {}; 

		// run middle ware
		if(!data.disableMiddleware && this.__topics['__MIDDLEWARE__'] && this.__topics['__MIDDLEWARE__'].length){

			// if all functions dont return true, kill the event
			if(!this.__topics['__MIDDLEWARE__'].every(function(middleware, index){
				return middleware(data, topic);
			})) return false;
		}

		// return if the topic doesn't exist, or there are no listeners
		if(!this.__topics[topic] || this.__topics[topic].length < 1) return;

		// send the event to all listeners
		this.__topics[topic].forEach(function(listener) {
			setTimeout(function(data, topic){
				listener(data, topic);
			}, 0, data, topic);
		});
	};
	

	var gevent = EventBase.create();
	spa.subscribe = function(topics, listener){
		gevent.subscribe(topics, listener);
	};
	spa.publish = function(topic, data){
		gevent.publish(topic, data);
	}

	return EventBase;
} )();