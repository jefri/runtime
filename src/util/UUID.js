var SIZE = 1;
var UUID = {};
module.exports = UUID;

UUID.rvalid = /^\{?[0-9a-f]{8}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?[0-9a-f]{12}\}?$/i;

var random;
if(typeof window !== 'undefined') {
  random = function(){
    var array = new Uint8Array(SIZE);
    window.crypto.getRandomValues(array);
    return [].slice.call(array)[0];
  }
} else {
  var crypto = require('crypto');
  random = function(){
    // sync
    try {
      var buf = crypto.randomBytes(SIZE);
      var array = new Uint8Array(buf);
      return [].slice.call(array)[0];
    } catch (ex) {
      // handle error
      // most likely, entropy sources are drained
    }
  }
}

UUID.v4 = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = random()&0x0f, v = c === 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
};
