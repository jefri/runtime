should = require "should"
describe "JEFRi", ->
	jefri = require "../../../../lib/jefri"
	_ = require "superscore"

	context = runtime = null

	beforeEach (done)->
		runtime = new jefri.Runtime "http://localhost:8000/context.json"
		runtime.ready.then ->
			done()


	it "changes the modified count when editing relationships", (done)->
		context = runtime.build "Context", name: "network"

		context._status().should.equal "NEW"
		context._modified._count.should.equal 2

		router = runtime.build "Entity",
			"name": "Router",
			"key": "router_id"

		context.entities = [ router ]

		context._modified._count.should.equal 4# 3 hack fix

		done()

