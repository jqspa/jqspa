spa.services = {};
spa.Service = ( function(){
	var service = Object.create(spa.EventBase);

	service.add = function(service){
		if(!service.name) return false;

		service = this.create(service);
        service.init();
		spa.services[service.name] = service;
	};

	return service;
} )();
