module "Contexts"
asyncTest "Context", ->
  runtime = new JEFRi.Runtime("/test/qunit/min/context/jefri.json")
  runtime.ready.done ->
    ok runtime._context.entities, "Has entities."
    context = runtime.build "Context", {}
    id = context.id()
    hostsEntity = runtime.build "Entity",
      name: "Host"
      key: "host_id"

    context.entities hostsEntity
    equal context.id(), id, "ID not overwritten on entity set."
    ct = runtime.find("Context")[0]
    equal ct.entities()[0].context().id(), ct.id(), "Navigating relationships succeeded."

    properties = []
    properties.push runtime.build "Property",
      name: "host_id"
      type: "string"
    properties.push runtime.build "Property",
      name: "hostname"
      type: "string"
    properties.push runtime.build "Property",
      name: "ip"
      type: "string"
    properties.push runtime.build "Property",
      name: "mac"
      type: "string"
    hostsEntity.properties properties
    equal hostsEntity.properties().length, 4, "4 properties added."
    note = runtime.build "Property",
      name: "notes"
      type: "string"

    hostsEntity.properties note
    equal hostsEntity.properties().length, 5, "5th property added."
    note.entity null
    equal hostsEntity.properties().length, 4, "5th property removed."
    equal note._relationships.entity, null, "Relationship removed."
    equal note.entity_id(), `undefined`, "Relationship key zeroed."
    
    start()
