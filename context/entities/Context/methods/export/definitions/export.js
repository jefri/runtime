var context = {attributes: {}, entities: {}};
this.entities.forEach(function(entity){
		context.entities[entity.name] = entity.export();
});
return JSON.stringify(context);
