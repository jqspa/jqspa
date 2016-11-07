spa.EventBase = ( function(){
    var EventBase = {};

	EventBase.__topics = {};

    EventBase.create = function(config){
    	return $.extend(
    		Object.create(EventBase),
	    	config || {}
	    );
	};

	EventBase.init =  function(){};
	/*
		pub/sub
	*/

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
			setTimeout(function(data, topic){
				listener(data || {}, topic);
			}, 0, data, topic);
		});
	};
	
	return EventBase;
} )();
