spa.models = {};
spa.Model = ( function(){
	var model = Object.create(spa.__EventBase);

	model.add = function(model){
		if(!model.name) return false;

		model = this.__declare(model);

		spa.models[model.name] = model;
	};

	return model;
})();
