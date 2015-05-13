JEFRi = require "../../../../src"

describe "Definitions", ->
	runtime = null
	beforeEach ->
		runtime = new JEFRi.Runtime "http://localhost:8000/user.json"

	it "are available from entities", (done)->
		runtime.ready
		.then ->
			user = runtime.build "User",
				name: "southerd"
				address: "davidsouther@gmail.com"

			definition = user._definition()
			definition.should.have.property('type')
			definition.type.should.equal('User')

			done()
		.catch done
