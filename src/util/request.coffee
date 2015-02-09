Promise = require('./promise')

browserRequest = ->
	ajex = (options)->
		promise = Promise()

		# Nice clean way to get an xhr
		XHR = window.ActiveXObject or XMLHttpRequest
		xhr = new XHR 'Microsoft.XMLHTTP'

		# Probably a GET requst, unless there is data or something else is specified.
		xhr.open (options.type or if options.data then 'POST' else 'GET'), options.url, true

		# Most likely sending text/plain
		if 'overrideMimeType' in xhr
			xhr.overrideMimeType options.dataType or 'text/plain'

		# Handle state changes.
		xhr.onreadystatechange = ->
			if xhr.readyState is 4
				if ((_ref = xhr.status) is 0 or _ref is 200)
					# Resolve on success.
					resolution = xhr.responseText
					if options.dataType is "application/json"
						resolution = JSON.parse resolution
					promise yes, resolution
				else
					# Reject on failure.
					promise no, new Error "Could not load " + options.url
				return

			# Notify for any other events.
			# d.notify xhr

		# We'll need to set headers to send the data.
		if options.data
			xhr.setRequestHeader "Content-type", options.dataType or "application/x-www-form-urlencoded"

		# Execute the request.
		xhr.send options.data or null

		# No need to return the entire XHR request.
		promise

	# get(url[, options])
	# Shorthand for a GET request.
	get: (url, options)->
		options = options or {}
		options.url = url
		options.type = 'GET'
		options.data = null
		ajax options

	# post(url[, options])
	# Shorthand for a POST request.
	post: (url, options)->
		options = options or {}
		options.url = url
		options.type = 'POST'
		ajax options

serverRequest = ->
	request = require 'request'
	get: (uri)->
		promise = Promise()
		request.get uri, (err, success, body)->
			promise !err?, err or body
		promise

	post: (uri, options)->
		promise = Promise()
		if options.data
			options.body = options.data.toString()
			delete options.data
		if options.dataType
			options.headers =
				"Content-type": options.dataType
			delete options.dataType
		request.post uri, options, (err, success, body)->
			promise !err?, err or body
		promise

request =
	if typeof window isnt 'undefined'
		browserRequest()
	else
		serverRequest()

module.exports = (uri)->
	# Consistently handle "" for requests
	if uri is ""
		Promise()(yes)
	else
		request.get(uri)

module.exports.get = request.get
module.exports.post = request.post
