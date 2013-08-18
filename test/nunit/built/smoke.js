(function() {
  exports['Smoke'] = {
    loads: function(test) {
      var jefri, runtime;
      test.expect(2);
      jefri = require('../../../lib/jefri');
      test.ok(jefri, 'JEFRi gets returned.');
      runtime = new jefri.Runtime("http://souther.co/EntityContext.json");
      return runtime.ready.then(function() {
        var user;
        user = runtime.build("User");
        return test.ok(user.id(), "Instantiated and built.");
      })["finally"](function() {
        return test.done();
      });
    }
  };

}).call(this);
