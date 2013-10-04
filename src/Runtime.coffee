#   JEFRi Runtime.js
#   (c) 2011-2012 David Souther
#   JEFRi is freely distributable under the MIT license.
#   For all details and documentation:
#   http://jefri.org

	# ## JEFRi Namespace
	JEFRi =
		# Compare two entities for equality. Entities are equal if they
		# are of the same type and have equivalent IDs.
		EntityComparator: (a, b) ->
			cmp =
				a and b and
				a._type() is b._type() and
				a.id() is b.id()
			return cmp

		#Duck type check if an object is an entity.
		isEntity: (obj = {}) ->
			return obj._type and obj.id and
				_.isFunction(obj._type) and _.isFunction(obj.id) or false

	EntityArray = (@entity, @field, @relationship)->
	EntityArray:: = Object.create Array::
	EntityArray::remove = (entity)->
		return if entity is null
		i = @length - 1
		while i > - 1
			if @[i]._compare entity
				if @relationship.back
					e = @[i]
					try
						e[@relationship.back].remove @
					catch
						e[@relationship.back] = null
				@splice i, 1
			i--
		@
	EntityArray::add = (entity)->
		if not _(@entity._relationships[@field]).find _.bind(JEFRi.EntityComparator, null, entity)
			#There is not a local reference to the found entity.
			@entity._relationships[@field].push entity

			#Call the reverse setter
			entity[@relationship.back] = @entity if @relationship.back
		@entity

	# Add isEntity to the underscore function.
	_.mixin isEntity: JEFRi.isEntity

	# ### Runtime Constructor
	JEFRi.Runtime = (contextUri, options, protos) ->
		if not @ instanceof JEFRi.Runtime then return new JEFRi.Rutime contextUri, options, protos

		# The ec reference for entity prototypes
		ec = @

		if not _.isString contextUri
			protos = options
			options = contextUri
			contextUri = ''

		# Prepare a promise for completing context loading.
		ready = Q.defer()

		# Fill in all the privileged properties
		settings =
			# If an entity already exists, does JEFRi update or replace?
			updateOnIntern: true
			# The constructor for the default store.
		_(settings).extend options

		_(@).extend
			settings: settings

			ready: ready.promise

			# In-memory representation of the loaded context.
			_context:
				meta: {}
				contexts: {}
				entities: {}
				attributes: {}

			# In-memory store of JEFRi entities.
			_instances: {}

		# #### Private helper functions
		# These handle most of the heavy lifting of building Entity classes.

		# A few default property values.
		_default = (type) ->
			switch type
				when "boolean" then false
				when "int" or "float" then 0
				when "string" then ""
				else ""

		# Takes a "raw" context object and orders it into the internal _context
		# storage. Also builds constructors and prototypes for the context.
		_set_context = (context, protos) =>
			# Save the attributes
			_(@_context.attributes).extend (context.attributes || {} )

			# Prepare each entity. Uses _.each to put (definition, type) in a closure.
			# _.each context.entities, (definition, type) => # NO SERIOUSLY, definition MUST BE IN A CLOSURE!
			for type, definition of context.entities
				_build_constructor definition, type

		_build_constructor = (definition, type) =>
			# Keep the definition locally, modifying it directly with the ctor and prototypes.
			@_context.entities[type] = definition
			# Ready the instances bucket
			@_instances[type] = {}

			# Build an entity's constructor.
			definition.Constructor = (proto) ->
				# Set the privileged accounting and property data.
				_(@).extend
					_new: true
					_modified: {_count: 0}
					_fields: {}
					_relationships: {}
					_runtime: ec

				# Check for runtime prototype override.
				proto = proto || {}

				# Set the key generate if not set by proto.
				proto[definition.key] = proto[definition.key] || _.UUID.v4()

				# Set a bunch of default values, so they're all available.
				for name, property of definition.properties
					# Use the value provided to the constructor, or the default.
					def = proto[name] || _default(property.type)
					@[name] = def

				# Attach a privileged copy of the full id, more for debugging than use.
				@_id = @id true

				# Add runtime methods
				_(@::).extend proto::

				# Set a few event handlers
				# Manage accounting after an entity has been persisted
				@.on "persisted", ->
					_(@).extend
						_new: false
						_modified:
							_count: 0

				return @

			#Set up the prototype for any of this entity.
			_build_prototype(type, definition, (protos && protos[type]) )

		# Set up all the required methods - id!, _type!, and the mutaccs.
		_build_prototype = (type, definition, proto) =>
			_(definition.Constructor::).extend JEFRi.EventDispatcher::,
				# Get this entity's type. Use the closure'd reference.
				_type: (full) ->
					full = full || false
					type

				# Get this entity's ID.
				id: (full) ->
					"#{if full then "#{@_type()}/" else ""}#{@[definition.key]}"

				# Find the status of an entity.
				_status: ->
					state = "MODIFIED"
					if @_new
						state = "NEW"
					else if _.isEmpty @_modified
						state = "PERSISTED"
					state

				_definition: -> definition

				# Add this entity to the persist transaction
				_persist: (transaction, callback) ->
					deferred = _.Deferred().then(callback)
					top = !transaction
					transaction = if top then new JEFRi.Transaction() else transaction
					transaction.add(@)

					#Call the on_persist handler
					@.on "persisting", transaction

					#If we're on top, run the transaction...
					if top then transaction.persist(callback)

					deferred.promise()

				# Encode returns the bare object.
				_encode: ->
					min = {_type: @_type(), _id: @id() }

					#Add all the properties to the writer.
					for prop of definition.properties
						min[prop] = @[prop]

					# Don't add relationships. Any walker will be responsible for adding only the entities they need.
					min

				# Delete this entity.
				# Remove it from all relationships, invalidate the ID.
				_destroy: _.lock ->
					@trigger "destroying", {}
					for name, rel of definition.relationships
						if rel.type is "has_many"
							@[name].remove @
						else
							@[name] = null
					ec.destroy @
					@[definition.key] = 0
					@trigger "destroyed", {}

				_compare: (b) ->
					JEFRi.EntityComparator @, b

			# Alias _encode as toJSON for ES5 JSON.stringify()
			definition.Constructor::toJSON = definition.Constructor::_encode

			# Prepare property mutators and accessors.
			for field, property of definition.properties
				_build_mutacc definition, field, property

			# Prepare navigation mutaccs.
			for rel_name, relationship of definition.relationships
				_build_relationship definition, rel_name, relationship

			for method, func of definition.methods
				_build_method definition, method, func

			# Add any additional prototypes functions
			if proto then _(definition.Constructor::).extend proto::

		# Prepare a mutacc for a specific property.
		# The property mutacc must handle entity accounting details.
		_build_mutacc = (definition, field, property) =>
			Object.defineProperty definition.Constructor::, field,
				# The setter has some accounting details to handle
				set: (value) ->
					# Only actually update it if it is a new value.
					if (value isnt @_fields[field])
						# The actual set
						@_fields[field] = value

						# Update the modified list if not set...
						if (!@_modified[field])
							@_modified[field] = @_fields[field]
							@_modified._count += 1
						else
							# It might be getting set to the old value...
							if (@_modified[field] is value)
								delete @_modified[field]
								@_modified._count -= 1

						# Notify observers
						@.trigger "modified", [field, value]

				get: ->
					# Just a getter.
					return @_fields[field]

		# Attach the mutators and accessors (mutaccs) to the prototype.
		#/* TODO Thoroughly debug these functions... */
		_build_relationship = (definition, field, relationship) ->
			access =
				# The multiple relations functions.
				if "has_many" is relationship.type
					enumerable: true
					configurable: false
					# Return the set of entities in the relationship.
					get: ->
						# Check if the field has ever been set
						if not (field of @_relationships)
							# The field hasn't been set, so we haven't ever gotten this relationship before.
							@_relationships[field] = new EntityArray @, field, relationship
							# We'll need to go through and fix that.
							# We'll need to grab everything who points to us...
							# Loop over every entity this relationship could point to
							for id, type of ec._instances[relationship.to.type]
								# If these are related
								if type[relationship.to.property] is @[relationship.property]
									# Add it
									@_relationships[field].add type
						@_relationships[field]

					# Add an entity to the relationship.
					set: (relations...) ->
						relations = _(relations).flatten()
						# Lazy load
						@[field]
						for entity in relations
							#There is not a local reference to the found entity.
							@_relationships[field].add entity

						@_modified._count += 1
						# Notify observers
						@.trigger "modified", [field, arguments]
						@
				else
					set: _.lock (related) ->
						if related is null # Actually a "Remove"
							if "is_a" isnt relationship.type
								try
									@_relationships[field]?[relationship.back].remove @
								catch
									@_relationships[field]?[relationship.back] = null
							@_relationships[field] = null
							@[relationship.property] = null
						else # A set
							@_relationships[field] = related
							resolve_ids.call @, related
							if "is_a" isnt relationship.type
								if relationship.back then related?[relationship.back] = @
						# Notify observers
						@_modified._count += 1
						@.trigger "modified", [field, related]
						@

					get: ->
						if @_relationships[field] is undefined
							# Just need the one...
							@_relationships[field] = ec._instances[relationship.to.type][@[relationship.property]]
							# Make sure we found one
							if @_relationships[field] is undefined
								# If not, create it.
								key = {}
								key[relationship.to.property] = @[relationship.property]
								@[field] = ec.build(relationship.to.type, key)

						return @_relationships[field]

			Object.defineProperty definition.Constructor::, field, access

			# Helper for has_a::set
			resolve_ids = (related) ->
				# If related is undefined, unset the property
				if related is undefined
					@[relationship.property] = undefined
				# If @'s key is relprop, use it for related
				else if definition.key is relationship.property # Always use this' ID if we can
					related[relationship.to.property] = @[relationship.property]
				else if related._definition().key is relationship.to.property # Back-up ID
					@[relationship.property] = related[relationship.to.property]
				else # No IDs. If one is set, set the other to that
					if @[relationship.property].match _.UUID.rvalid
						related[relationship.to.property] = @[relationship.property]
					else if related[relationship.to.property].match _.UUID.rvalid
						@[relationship.property] = related[relationship.to.property]
					else #Nothing is set, use this' id
						id = _.UUID.v4()
						@[relationship.property] = id
						related[relationship.to.property] = id

		_build_method = (definition, method, func) ->
			func =
				definitions: func.definitions || {}
				order: func.order || []
			body = func.definitions.javascript || ""
			params = func.order
			if body && not body.match /window/
				params.push body
				fn = Function.apply null, params
			else
				fn = _.noop
			definition.Constructor::[method] = fn

		@load = (contextUri, prototypes) ->
			Request(contextUri)
			.then (data) ->
				data = data || "{}"
				data = if _.isString(data) then JSON.parse(data) else data
				_set_context data, prototypes
				ready.resolve()
			.catch (e) ->
				console.warn e, e.message
				ready.reject e
			.done()

		# Prepare the runtime with the given contexts.
		if (options && options.debug)
			# The context object was provided by the caller
			_set_context(options.debug.context, protos)
			ready.resolve()
		if contextUri then @load contextUri, protos
		@

	# #### Entity Array helper
	pushResult = (entity) ->
		type = entity._type()
		if (!@[type]) then @[type] = []
		@[type].push(entity)

	# #### Runtime Prototype
	_(JEFRi.Runtime::).extend JEFRi.Runtime::

	_(JEFRi.Runtime::).extend
		# Reset the runtime's data, maintains context definitions.
		clear: ->
			@_instances = {}
			@

		# Get the definition of an entity type.
		definition: (name)->
			name = name._type?() || name
			@_context.entities[name]

		# Add the methods in the extend prototype to the prototype of type specified
		# affecting _ALL_ instances, both current and future, of type.
		extend: (type, extend) ->
			if (@_context.entities[type])
				_(@_context.entities[type].Constructor::).extend extend::
			@

		# Return the canonical memory reference of the entity.
		intern: (entity, updateOnIntern = false) ->
			updateOnIntern = updateOnIntern || @settings.updateOnIntern

			if (entity.length && ! entity._type)
				#Array-like
				entities = for ent in entity
					@intern(ent, updateOnIntern)
				return entities

			if (updateOnIntern)
				#Merge the given entity into the stored entity.
				ret = @_instances[entity._type() ][entity.id() ] || entity
				_(ret._fields).extend entity._fields
			else
				#Take the stored one if possible, otherwise use the given entity.
				ret = @_instances[entity._type() ][entity.id() ] || entity

			#Update the saved entity
			@_instances[entity._type() ][entity.id() ] = ret
			ret

		# Return a new instance of an object described in the context.
		build: (type, obj) ->
			def = @definition(type)
			if !def
				throw "JEFRi::Runtime::build '#{type}' is not a defined type in this context."
			obj = obj || {}
			# We are going to build the new entity first, then, if there is a local
			# instance, we will extend the local instance with the new instance.
			r = new def.Constructor obj
			if def.key of obj
				# If the entity key is specified in obj, check the local storage.
				demi = {_type : type}
				demi[def.key] = obj[def.key]
				instance = @find(demi)
				if (instance.length > 0)
					# Local instance, extend it with the new obj and return local.
					instance = instance[0]
					_(instance._fields).extend r._fields
					return instance
			@_instances[type][r.id() ] = r
			return r

		# Expand and intern a transaction.
		expand: (transaction, action) ->
			action = action || "persisted"

			built = []
			for entity in transaction.entities || []
				e = @build(entity._type, entity)
				e = @intern(e, true)
				#Make the entity not new...
				e.trigger action, true
				built.push(e)

			transaction.entities = built

		# Completely remove an entity from this runtime
		destroy: (entity) ->
			delete @_instances[entity._type() ][entity.id() ]
			@

		# Return an interned entity from the local instance matching spec.
		#
		# Spec requires an _type property and either the entity key or _id set.
		find: (spec) ->
			if (typeof spec is "string")
				spec = {_type : spec}
			to_return = []
			r = @definition(spec._type)
			results = @_instances[spec._type]

			if spec.hasOwnProperty r.key || spec.hasOwnProperty '_id'
				# If a key is set, return only that result.
				if (results[spec[r.key]])
					to_return.push(results[spec[r.key]])
			else
				# Add results to an array to clean up the return for the user.
				for key, result of results
					to_return.push result

			to_return
