spa.models = {};
spa.Model = ( function(){
	var model = Object.create(spa.EventBase);

	model.add = function(model){
		if(!model.name) return false;

		model = this.create(model);

		spa.models[model.name] = model;
        
        model.init();
	};

	return model;
})();
