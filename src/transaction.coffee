# ## Transactions
# ### Transaction
# Object to handle transactions.
JEFRi = require './jefri.coffee'

class Transaction
	constructor: (spec, store) ->
		Object.assign @,
			attributes: if spec and spec.attributes then spec.attributes else {}
			store: store
			entities:
				if (spec instanceof Array)
					spec
				else if spec
					if spec.entities
						spec.entities
					else
						[spec]
				else
					[]

	# ### Prototype
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
	get: (store = @store)->
		@emit "getting", {}

		store = store || @store
		store.execute('get', @).then ->
			resolve @

	# ### persist*([store])*
	# Execute the transaction as a POST request
	persist: (store = @store)->
		@emit "persisting", {}
		store.execute('persist', @).then (t)=>
			for entity in t.entities
				entity.emit "persisted", {}
			@emit "persisted", {}
			resolve @

	# ### add*(spec...)*
	# Add several entities to the transaction
	add: (spec, force = false)->
		#Force spec to be an array
		spec = if Array.isArray spec then spec else [].slice.call(arguments, 0)
		for s in spec
			# if not _.isEntity s
			#	s = @store.settings.runtime.expand s
			# TODO switch to direct lookup.
			if yes #|| force ||	_(@entities).indexBy(JEFRi.EntityComparator s) < 0
				#Hasn't been added yet...
				@entities.push s
		return @

	# ### attributes*(attributes)*
	# Set several attributes on the transaction
	attributes: (attributes) ->
		Object.assign @attributes,c attributes
		@

module.exports = Transaction
