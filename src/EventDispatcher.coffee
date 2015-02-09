JEFRi.EventDispatcher = ->
JEFRi.EventDispatcher:: =
	# constructor: EventDispatcher
	on: (event, fn)->
		@_listeners = {}  if @_listeners is `undefined`
		listeners = @_listeners
		listeners[event] = []  if listeners[event] is `undefined`
		listeners[event].push fn  if listeners[event].indexOf(fn) is -1

	off: (event, fn)->
		return  if @_listeners is `undefined`
		listeners = @_listeners
		index = listeners[event].indexOf(fn)
		listeners[event].splice index, 1  if index isnt -1

	emit: (event, args)->
		return  if @_listeners is `undefined`
		listeners = @_listeners
		listenerArray = listeners[event]
		if listenerArray isnt `undefined`
			event.target = this
			listener.call this, event for listener in listenerArray
