ok = (v)->
	should.exist v
	v.should.be.ok()

equal = (a, b)->
	a.should.equal(b)

describe "JEFRi Runtime", ->

	it "Runtime Prototype", ->
		ok JEFRi.Runtime, "JEFRi Runtime is available."
		runtime = new JEFRi.Runtime "http://localhost:8000/context.json"
		ok runtime.definition, "JEFRi.Runtime::definition"
		ok runtime.build, "JEFRi.Runtime::build"
		ok runtime.intern, "JEFRi.Runtime::intern"
		ok runtime.expand, "JEFRi.Runtime::expand"

	it "Instantiate Runtime", (done)->
		runtime = new JEFRi.Runtime "http://localhost:8000/user.json",
			storeURI: "/test/"

		runtime.ready
		.then ->
			ok runtime, "Could not load runtime."
			ok runtime.definition("Authinfo") and runtime.definition("User"), "Runtime has the correct entities."

			user = runtime.build "User",
				name: "southerd"
				address: "davidsouther@gmail.com"

			id = user.id()
			equal user._status(), "NEW", "Built user should be New"
			ok user.id().match(/[a-f0-9\-]{36}/i), "User should have a valid id."
			equal user.id(), user.user_id, "User id() and user_id properties must match."
			user.authinfo = runtime.build "Authinfo", {}

			authinfo = user.authinfo
			equal authinfo._status(), "NEW", "Built authinfo should be New"
			ok authinfo.id().match(/[a-f0-9\-]{36}/i), "Authinfo should have a valid id."
			ok authinfo.id(true).match(/[a-zA-Z_\-]+\/[a-f0-9\-]{36}/i), "id(true) returns full path."
			equal authinfo.user_id, user.id(), "Authinfo IDs correct user."
			equal authinfo._relationships.user, user, "Authinfo refers to correct user"
			equal id, user.id(), "ID not overwritten on entity set."
			ok authinfo._destroy, "Entity can be destroyed."

			aid = authinfo.id()
			authinfo._destroy()
			equal authinfo.id(), '0', "ID zeroed."
			should.not.exist authinfo._relationships.user, "Relationship cleared."
			should.not.exist user._relationships.authinfo, "Remote relationship cleared."
			should.not.exist runtime._instances.Authinfo[aid], "Removed from runtime instances."

			user2 = runtime.build "User",
				name: "portaj"
				address: "rurd4me@example.com"
			authinfo2 = user2.authinfo

			ok authinfo2, "Default relationship created."
			ok authinfo2.id().match(/[a-f0-9\-]{36}/i), "Authinfo2 should have a valid id."
			equal authinfo2.user_id, user2.id(), "Authinfo2 refers to correct user."
			equal authinfo2.user.id(), user2.id(), "Authinfo2 returns correct user."
			user2.authinfo = null
			should.not.exist user2._relationships.authinfo, "User2 removed authinfo."
			should.not.exist authinfo2._relationships.user, "Authinfo2 removed user."

			done()
		.catch done

	it "Runtime Features", (done)->
		runtime = new JEFRi.Runtime "http://localhost:8000/user.json",
			storeURI: "/test/"
		runtime.ready
		.then ->
			user = runtime.build "User",
				name: "southerd"
				address: "davidsouther@gmail.com"
			ok user._runtime, "Entity has reference to creating runtime."
			ok JEFRi.isEntity(user), "isEntity checks correctly."
			done()
		.catch done

	it "isEntity", ->
		[null, undefined, "", 'foo', 123, 45.67].forEach (e)->
			equal JEFRi.isEntity(e), false, "'#{e}' is not an entity"

	it "Transaction Prototype", ->
		ok JEFRi.Transaction, "JEFRi Transaction is available."
		t = new JEFRi.Transaction()
		ok t, "Created Transaction"
		ok t.add, "JEFRi.Transaction::add"
		ok t.attributes, "JEFRi.Transaction::attributes"
		ok t.get, "JEFRi.Transaction::get"
		ok t.persist, "JEFRi.Transaction::persist"

	it "Exceptional cases", (done)->
		runtime = new JEFRi.Runtime "http://localhost:8000/user.json",
			storeURI: "/test/"
		runtime.ready
		.then ->
			badType = ->
				foo = runtime.build("foo")
			ok runtime, "Could load runtime."
			checkBadTypeException = "JEFRi::Runtime::build 'foo' is not a defined type in this context."
			badType.should.throw checkBadTypeException, "Create bad type generates exception."
			done()
		.catch done
