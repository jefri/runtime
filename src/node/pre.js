if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

debugger
var R = require("request");
var Request = function(uri, body){
	var resolve, reject;
	var promise = new Promise(function(_resolve, _reject){
		resolve = _resolve;
		reject = _reject;
	});

	cb = function(err, res, body){
		if(err) return reject(err);
		resolve(body, res);
	}

	options = {method: body ? "POST" : "GET"};
	if(body) options.body = body;

	R(uri, options, cb);

	return promise;
}
