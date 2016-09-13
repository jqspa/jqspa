spa.services = {};
spa.Service = ( function(){
	var service = Object.create(spa.EventBase);

	service.add = function(service){
		if(!service.name) return false;

		service = this.__declare(service);

		spa.services[service.name] = service;
	};

	return service;
} )();
