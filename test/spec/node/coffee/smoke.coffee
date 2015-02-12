describe 'Smoke', ->
	it 'Loads', (done)->
		jefri = require "../../../../src/"
		should.exist jefri
		runtime = new jefri.Runtime "http://souther.co/EntityContext.json"
		runtime.ready
		.then ->
			user = runtime.build "User"
			should.exist user.id()
		.finally ->
			done()
