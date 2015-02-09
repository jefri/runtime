describe "JEFRi", ->
	jefri = require "../../../../src/Runtime"

	context = null

	beforeEach (done)->
		runtime = new jefri.Runtime "http://localhost:8000/context.json"
		runtime.ready.then (a)->
			context = runtime.build "Context", name: "network"
			done()
