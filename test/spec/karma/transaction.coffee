describe "Transaction", ->
	runtime = null
	beforeEach ->
		runtime = new JEFRi.Runtime "http://localhost:8000/user.json",
			storeURI: "/test/"

	it "Transaction Basics", (done)->
		runtime.ready
		.then ->
			user = runtime.build "User",
				name: "southerd"
				address: "davidsouther@gmail.com"

			user.authinfo = runtime.build "Authinfo", {}
			authinfo = user.authinfo
			transaction = new JEFRi.Transaction()
			transaction.add user, authinfo
			equal transaction.entities.length, 2, "Has both entities."
			done()
		.catch done
