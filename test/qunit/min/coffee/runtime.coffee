testDone = ->
	tests = 3
	->
		test--
		test <= 0

module "JEFRi Runtime",
	teardown: ->
		testDone()

test "Runtime Prototype", ->
	ok JEFRi.Runtime, "JEFRi Runtime is available."
	runtime = new JEFRi.Runtime "http://localhost:8000/context.json"
	ok runtime.definition, "JEFRi.Runtime::definition"
	ok runtime.build, "JEFRi.Runtime::build"
	ok runtime.intern, "JEFRi.Runtime::intern"
	ok runtime.expand, "JEFRi.Runtime::expand"

asyncTest "Instantiate Runtime", ->
	runtime = new JEFRi.Runtime "/test/qunit/min/context/user.json",
		storeURI: "/test/"

	runtime.ready.done ->
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
		equal authinfo.id(), 0, "ID zeroed."
		equal authinfo._relationships.user, null, "Relationship cleared."
		equal user._relationships.authinfo, null, "Remote relationship cleared."
		equal runtime._instances.Authinfo[aid], `undefined`, "Removed from runtime instances."

		user2 = runtime.build "User",
			name: "portaj"
			address: "rurd4me@example.com"
		authinfo2 = user2.authinfo

		ok authinfo2, "Default relationship created."
		ok authinfo2.id().match(/[a-f0-9\-]{36}/i), "Authinfo2 should have a valid id."
		equal authinfo2.user_id, user2.id(), "Authinfo2 refers to correct user."
		equal authinfo2.user.id(), user2.id(), "Authinfo2 returns correct user."
		user2.authinfo = null
		equal user2._relationships.authinfo, null, "User2 removed authinfo."
		equal authinfo2._relationships.user, null, "Authinfo2 removed user."

		start()

asyncTest "Runtime Features", ->
	expect 2
	runtime = new JEFRi.Runtime "/test/qunit/min/context/user.json",
		storeURI: "/test/"
	runtime.ready.done ->
		user = runtime.build "User",
			name: "southerd"
			address: "davidsouther@gmail.com"
		ok user._runtime, "Entity has reference to creating runtime."
		ok _(user).isEntity(), "isEntity checks correctly."
		start()

test "isEntity", ->
	[null, undefined, "", 'foo', 123, 45.67].forEach (e)->
		equal _(e).isEntity(), false, "'#{e}' is not an entity"


test "Transaction Prototype", ->
	ok JEFRi.Transaction, "JEFRi Transaction is available."
	t = new JEFRi.Transaction()
	ok t, "Created Transaction"
	ok t.add, "JEFRi.Transaction::add"
	ok t.attributes, "JEFRi.Transaction::attributes"
	ok t.get, "JEFRi.Transaction::get"
	ok t.persist, "JEFRi.Transaction::persist"

asyncTest "Exceptional cases", ->
	runtime = new JEFRi.Runtime "/test/qunit/min/context/user.json",
		storeURI: "/test/"
	runtime.ready.done ->
		badType = ->
			foo = runtime.build("foo")
		ok runtime, "Could load runtime."
		checkBadTypeException = (ex) ->
			return true  if ex.match and ex.match(/JEFRi::Runtime::build 'foo' is not a defined type in this context./)
			false

		# checkBadTypeException = "JEFRi::runtime::build 'foo' is not a defined type in the context.";
		raises badType, checkBadTypeException, "Create bad type generates exception."
		start()


