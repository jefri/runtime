JEFRi = require "../../../../src"

describe "Properties", ->
	runtime = null
	beforeEach ->
		runtime = new JEFRi.Runtime "http://localhost:8000/user.json"

	it "have good defaults", (done)->
		runtime.ready
		.then ->
			user = runtime.build "User",
				name: "southerd"
				address: "davidsouther@gmail.com"

			user.nicknames.should.be.instanceOf(Array)
			user.nicknames.push('David')
			user.nicknames.push('Dave')
			user.nicknames.length.should.equal 2

			done()
		.catch done
