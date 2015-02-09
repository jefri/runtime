#     JEFRi PostStore.js 0.1.0
#     (c) 2011-2012 David Souther
#     JEFRi is freely distributable under the MIT license.
#     For all details and documentation:
#     http://jefri.org

# ## Transactions
	# ### Transaction
	# Object to handle transactions.
	JEFRi.Transaction = (spec, store) ->
		Object.assign @,
			attributes: {}
			store: store
			entities: if (spec instanceof Array) then spec else (if spec then [spec] else [])

	# ### Prototype
	JEFRi.Transaction:: = Object.create
		# ### encode
		encode: ->
			transaction =
				attributes: @attributes
				entities: []

			for entity in @entities
				transaction.entities.push if JEFRi.isEntity(entity) then entity._encode() else entity

			transaction

		# ### toString
		toString: ->
			return JSON.stringify @encode()

		# ### get*([store])*
		# Execute the transaction as a GET request
		get: (store = @store) ->
			@emit "getting", {}

			new Promise (resolve, reject)->
				store = store || @store
				store.execute('get', @).then ->
					resolve @

		# ### persist*([store])*
		# Execute the transaction as a POST request
		persist: (store = @store) ->
			@emit "persisting", {}
			new Promise (resolve)->
				store.execute('persist', @).then (t)=>
					for entity in t.entities
						entity.emit "persisted", {}
					@emit "persisted", {}
					resolve @

		# ### add*(spec...)*
		# Add several entities to the transaction
		add: (spec, force = false) ->
			#Force spec to be an array
			spec = if Array.isArray spec then spec else [].slice.call(arguments, 0)
			for s in spec
				# if not _.isEntity s
				#	s = @store.settings.runtime.expand s
				# TODO switch to direct lookup.
				if yes #|| force ||  _(@entities).indexBy(JEFRi.EntityComparator s) < 0
					#Hasn't been added yet...
					@entities.push s
			return @


		# ### attributes*(attributes)*
		# Set several attributes on the transaction
		attributes: (attributes) ->
			Object.assign @attributes,c attributes
			@
