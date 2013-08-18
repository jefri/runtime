runtime = `undefined`
module "Transaction",
	setup: ->
		runtime = new JEFRi.Runtime "/test/qunit/min/context/user.json",
			storeURI: "/test/"

asyncTest "Transaction Basics", ->
	expect 1
	runtime.ready.done ->
		user = runtime.build "User",
			name: "southerd"
			address: "davidsouther@gmail.com"

		user.authinfo runtime.build "Authinfo", {}
		authinfo = user.authinfo()
		transaction = new JEFRi.Transaction()
		transaction.add user, authinfo
		equal transaction.entities.length, 2, "Has both entities."
		start()
