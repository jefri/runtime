var _ = require("superscore");
var Q = require("q");
var R = require("request");
var Request = function(uri, body){
	defer = Q.defer();

	cb = function(err, res, body){
		if(err) return defer.reject(err);
		defer.resolve(body, res);
	}

	options = {method: body ? "POST" : "GET"};
	if(body) options.body = body;

	R(uri, options, cb);

	return defer.promise;
}
