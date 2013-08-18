Request = do->
	ajax = (options) ->
		d = Q.defer()
		XHR = window.ActiveXObject or XMLHttpRequest
		xhr = new XHR("Microsoft.XMLHTTP")
		xhr.open options.type or ((if options.data then "POST" else "GET")), options.uri, true
		xhr.overrideMimeType? options.dataType or "text/plain"
		xhr.onreadystatechange = ->
			if xhr.readyState is 4
				if xhr.status is 0 or xhr.status is 200
					resolution = xhr.responseText
					resolution = JSON.parse(resolution)  if options.dataType is "application/json"
					d.resolve resolution
				else
					d.reject new Error "Could not load #{options.uri}"
				return
			d.notify xhr

		xhr.setRequestHeader "Content-type", options.dataType or "application/x-www-form-urlencoded"  if options.data
		xhr.send options.data or null
		d.promise

	request = (uri, body)->
		if body
			request.post uri, {data: body}
		else
			request.get uri

	request.get = (uri, options) ->
		options = options or {}
		options.uri = uri
		options.type = "GET"
		options.data = null
		ajax options

	request.post = (uri, options) ->
		options = options or {}
		options.uri = uri
		options.type = "POST"
		ajax options

	request