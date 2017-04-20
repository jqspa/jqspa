spa.EventBase = ( function(){
    var EventBase = {};

    EventBase.create = function(config){

    	return $.extend(
    		Object.create(EventBase),
    		{
    			__topics: {},
    			__preTopics: {},
    		},
	    	config || {}
	    );
	};

	EventBase.init = spa.utils.emptyFunc;
	/*
		pub/sub
	*/

	EventBase.subscribe = function(topics, listener){
		return this.__subscribe(this.__topics, topics, listener);
	};

	EventBase.preSubscribe = function(topics, listener){
		return this.__subscribe(this.__preTopics, topics, listener);
	};

	EventBase.__subscribe = function(target, topics, listener) {
		// create the topic if not yet created
		var 
			topic, 
			previous = [],
			subscriptions = [];

		if(!$.isArray(topics)) topics = [topics];
		for(var idx = topics.length; idx--;){
			topic = topics[idx];
			if(~previous.indexOf(topic)) continue;
			if(!Object.hasOwnProperty.call(target, topic)) {
				target[topic] = [];
			}

			// add the listener
			subscriptions.push(target[topic].push(listener)-1);
			previous.push(topic);
		}
		return {
			remove: function(){
				for(var idx = subscriptions.length; idx--;){ 
					delete target[topic][subscriptions[idx]];
				}
			}.bind(this)
		}
	};

	EventBase.__prePublish = function(topic, data){
		if(!data.disablePreHook && this.__preTopics[topic] && this.__preTopics[topic].length){

			// if all functions dont return true, kill the event
			if(!this.__preTopics[topic].every(function(func, index){
				return func(data, topic);
			})) return false;
		}
		return true;
	};

	EventBase.publish = function(topic, data) {
		data = data || {};

		if(!this.__prePublish(topic, data)){
			return false;
		}

		// run middle ware
		if(!data.disableMiddleware && this.__topics['__MIDDLEWARE__'] && this.__topics['__MIDDLEWARE__'].length){

			// if all functions dont return true, kill the event
			if(!this.__topics['__MIDDLEWARE__'].every(function(middleware, index){
				return middleware(data, topic);
			})) return false;
		}

		// return if the topic doesn't exist, or there are no listeners
		var 
			args = _.split(topic, ":"),
			__topic = args[0];

		if(!this.__topics[__topic] || this.__topics[__topic].length < 1) return;

		// send the event to all listeners
		args.unshift(data);
		this.__topics[__topic].forEach(function(listener) {
			setTimeout(function(args){
				listener.apply(null, args);
			}, 0, args);
		});
	};
	
	var gevent = EventBase.create();
	spa.subscribe = function(topics, listener){
		return gevent.subscribe(topics, listener);
	};

	spa.publish = function(topic, data){
		return gevent.publish(topic, data);
	};

	spa.preSubscribe = function(topic, listener){
		return gevent.preSubscribe(topic, listener);
	};

	spa.sub = spa.subscribe;
	spa.presub = spa.preSubscribe;
	spa.pub = spa.publish;

	return EventBase;
} )();
