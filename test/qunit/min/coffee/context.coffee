module "Contexts"
asyncTest "Context", ->
	runtime = new JEFRi.Runtime("/test/qunit/min/context/jefri.json")
	runtime.ready.done ->
		ok runtime._context.entities, "Has entities."
		context = runtime.build "Context", {}
		id = context.id()
		host = runtime.build "Entity",
			name: "Host"
			key: "host_id"

		context.entities = host
		equal context.id(), id, "ID not overwritten on entity set."
		ct = runtime.find("Context")[0]
		equal ct.entities[0].context.id(), ct.id(), "Navigating relationships succeeded."

		host.properties = [
			runtime.build "Property",
				name: "host_id"
				type: "string"
			runtime.build "Property",
				name: "hostname"
				type: "string"
			runtime.build "Property",
				name: "ip"
				type: "string"
			runtime.build "Property",
				name: "mac"
				type: "string"
		]
		equal host.properties.length, 4, "4 properties added."

		note = runtime.build "Property",
			name: "notes"
			type: "string"

		host.properties.add note

		equal host.properties.length, 5, "5th property added."
		note.entity = null
		equal host.properties.length, 4, "5th property removed."
		equal note._relationships.entity, null, "Relationship removed."
		equal note.entity_id, `undefined`, "Relationship key zeroed."
		
		start()
