# ## JEFRi Namespace
module.exports =
	# Compare two entities for equality. Entities are equal if they
	# are of the same type and have equivalent IDs.
	EntityComparator: (a, b) ->
		cmp =
			a and b and
			a._type() is b._type() and
			a.id() is b.id()
		return cmp

	# Duck type check if an object is an entity.
	isEntity: (obj = {}) ->
		return obj._type and obj.id and
			Function.isFunction(obj._type) and Function.isFunction(obj.id) or false
