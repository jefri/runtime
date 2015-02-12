JEFRi = require './jefri.coffee'

module.exports = EntityArray = (@entity, @field, @relationship)->
EntityArray:: = Object.create Array::
EntityArray::remove = (entity)->
	return if entity is null
	i = @length - 1
	while i >= 0
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
	found = null
	@entity._relationships[@field].forEach (other)->
		return if found?
		found = other if JEFRi.EntityComparator entity, other
	unless found?
		#There is not a local reference to the found entity.
		@entity._relationships[@field].push entity

		#Call the reverse setter
		entity[@relationship.back] = @entity if @relationship.back
	@entity
