describe "JEFRi", ->
	jefri = require "../../../../src/index.js"

	context = null

	beforeEach (done)->
		runtime = new jefri.Runtime "http://localhost:8000/context.json"
		runtime.ready
		.then (a)->
			context = runtime.build "Context", name: "network"

			router = runtime.build "Entity",
				"name": "Router",
				"key": "router_id"

			host = runtime.build "Entity",
				"name": "Host"
				"key": "host_id"

			context.entities = [host, router]

			router.properties = [
				runtime.build "Property",
					name: "router_id"
					type: "string"
				runtime.build "Property",
					name: "name"
					type: "string"
			]

			router_hosts = runtime.build "Relationship",
				name: "hosts"
				type: "has_many"
				to_property: "router_id"
				from_property: "router_id"
			router_hosts.to = host
			router_hosts.from = router

			host.properties = [
				runtime.build "Property",
					name: "host_id",
					type: "string"
				runtime.build "Property",
					name: "hostname",
					type: "string"
				runtime.build "Property",
					name: "ip",
					type: "string"
				runtime.build "Property",
					name: "mac",
					type: "string"
				runtime.build "Property",
					name: "router_id"
					type: "string"
			]

			host_router = runtime.build "Relationship",
				name: "router"
				type: "has_a"
				to_property: "router_id"
				from_property: "router_id"
			host_router.to = router
			host_router.from = host

			done()
		.catch (err)->
			done err

	it "exports", (done)->
		context.should.have.property 'export'
		stringContext = context.export()
		stringContext.length.should.be.greaterThan 0
		contextContent = JSON.parse stringContext

		Object.keys(contextContent.entities).length.should.equal 2
		contextContent.entities.Router.key.should.equal "router_id"
		contextContent.entities.Host.relationships.router.to.type.should.equal "Router"

		done()
