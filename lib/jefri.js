/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var JEFRi = __webpack_require__(1);
	JEFRi.Runtime = __webpack_require__(2);
	JEFRi.Transaction = __webpack_require__(3);

	module.exports = JEFRi;

	if(typeof window !== 'undefined' && window !== null){
		window.JEFRi = module.exports
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  EntityComparator: function(a, b) {
	    var cmp;
	    cmp = a && b && a._type() === b._type() && a.id() === b.id();
	    return cmp;
	  },
	  isEntity: function(obj) {
	    if (obj == null) {
	      obj = {};
	    }
	    return obj._type && obj.id && Function.isFunction(obj._type) && Function.isFunction(obj.id) || false;
	  }
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var EntityArray, Eventer, JEFRi, Promise, Request, UUID, jiffies, lock, pushResult,
	  slice = [].slice;

	JEFRi = __webpack_require__(1);

	jiffies = __webpack_require__(5);

	Eventer = jiffies.Event;

	Promise = jiffies.promise;

	Request = jiffies.request;

	UUID = jiffies.UUID;

	lock = jiffies.lock;

	EntityArray = __webpack_require__(4);

	module.exports = JEFRi.Runtime = function(contextUri, options, protos) {
	  var _build_constructor, _build_method, _build_mutacc, _build_prototype, _build_relationship, _default, _set_context, ec, ready, settings;
	  if (!this instanceof JEFRi.Runtime) {
	    return new JEFRi.Rutime(contextUri, options, protos);
	  }
	  ec = this;
	  if (!Object.isString(contextUri)) {
	    protos = options;
	    options = contextUri;
	    contextUri = '';
	  }
	  ready = {
	    promise: Promise()
	  };
	  settings = {
	    updateOnIntern: true
	  };
	  Object.assign(settings, options);
	  Object.assign(this, {
	    settings: settings,
	    ready: ready.promise,
	    _context: {
	      meta: {},
	      contexts: {},
	      entities: {},
	      attributes: {}
	    },
	    _instances: {}
	  });
	  _default = function(type) {
	    switch (type) {
	      case "boolean":
	        return false;
	      case "int" || "float":
	        return 0;
	      case "string":
	        return "";
	      default:
	        return "";
	    }
	  };
	  _set_context = (function(_this) {
	    return function(context, protos) {
	      var definition, ref, results1, type;
	      Object.assign(_this._context.attributes, context.attributes || {});
	      ref = context.entities;
	      results1 = [];
	      for (type in ref) {
	        definition = ref[type];
	        results1.push(_build_constructor(definition, type));
	      }
	      return results1;
	    };
	  })(this);
	  _build_constructor = (function(_this) {
	    return function(definition, type) {
	      _this._context.entities[type] = definition;
	      _this._instances[type] = {};
	      definition.Constructor = function(proto) {
	        var def, name, property, ref;
	        Object.assign(this, {
	          _new: true,
	          _modified: {
	            _count: 0
	          },
	          _fields: {},
	          _relationships: {},
	          _runtime: ec
	        });
	        proto = proto || {};
	        proto[definition.key] = proto[definition.key] || UUID.v4();
	        ref = definition.properties;
	        for (name in ref) {
	          property = ref[name];
	          def = proto[name] || _default(property.type);
	          this[name] = def;
	        }
	        this._id = this.id(true);
	        this.on("persisted", function() {
	          this._new = false;
	          return this._modified = {
	            _count: 0
	          };
	        });
	        return this;
	      };
	      definition.Constructor.name = type;
	      return _build_prototype(type, definition, protos && protos[type]);
	    };
	  })(this);
	  _build_prototype = (function(_this) {
	    return function(type, definition, proto) {
	      var field, func, method, property, ref, ref1, ref2, rel_name, relationship;
	      definition.Constructor.prototype = Object.create(Object.assign({}, Eventer.prototype, {
	        _type: function(full) {
	          full = full || false;
	          return type;
	        },
	        id: function(full) {
	          return "" + (full ? (this._type()) + "/" : "") + this[definition.key];
	        },
	        _status: function() {
	          if (this._new) {
	            return "NEW";
	          } else if (this._modified._count === 0) {
	            return "PERSISTED";
	          } else {
	            return "MODIFIED";
	          }
	        },
	        _definition: function() {
	          return definition;
	        },
	        _persist: function(transaction, callback) {
	          var deferred, top;
	          deferred = _.Deferred().then(callback);
	          top = !transaction;
	          transaction = top ? new JEFRi.Transaction() : transaction;
	          transaction.add(this);
	          this.emit("persisting", transaction);
	          if (top) {
	            return transaction.persist(callback);
	          }
	        },
	        _encode: function() {
	          var min, prop;
	          min = {
	            _type: this._type(),
	            _id: this.id()
	          };
	          for (prop in definition.properties) {
	            min[prop] = this[prop];
	          }
	          return min;
	        },
	        _destroy: lock(function() {
	          var name, ref, rel;
	          this.emit("destroying", {});
	          ref = definition.relationships;
	          for (name in ref) {
	            rel = ref[name];
	            if (rel.type === "has_many") {
	              this[name].remove(this);
	            } else {
	              this[name] = null;
	            }
	          }
	          ec.destroy(this);
	          this[definition.key] = 0;
	          return this.emit("destroyed", {});
	        }),
	        _compare: function(b) {
	          return JEFRi.EntityComparator(this, b);
	        }
	      }));
	      definition.Constructor.prototype.toJSON = definition.Constructor.prototype._encode;
	      ref = definition.properties;
	      for (field in ref) {
	        property = ref[field];
	        _build_mutacc(definition, field, property);
	      }
	      ref1 = definition.relationships;
	      for (rel_name in ref1) {
	        relationship = ref1[rel_name];
	        _build_relationship(definition, rel_name, relationship);
	      }
	      ref2 = definition.methods;
	      for (method in ref2) {
	        func = ref2[method];
	        _build_method(definition, method, func);
	      }
	      if (proto) {
	        return Object.assign(definition.Constructor.prototype, proto.prototype);
	      }
	    };
	  })(this);
	  _build_mutacc = (function(_this) {
	    return function(definition, field, property) {
	      return Object.defineProperty(definition.Constructor.prototype, field, {
	        set: function(value) {
	          if (value !== this._fields[field]) {
	            this._fields[field] = value;
	            if (!this._modified[field]) {
	              this._modified[field] = this._fields[field];
	              this._modified._count += 1;
	            } else {
	              if (this._modified[field] === value) {
	                delete this._modified[field];
	                this._modified._count -= 1;
	              }
	            }
	            return this.emit("modified", [field, value]);
	          }
	        },
	        get: function() {
	          return this._fields[field];
	        }
	      });
	    };
	  })(this);
	  _build_relationship = function(definition, field, relationship) {
	    var access, resolve_ids;
	    access = "has_many" === relationship.type ? {
	      enumerable: true,
	      configurable: false,
	      get: function() {
	        var id, ref, type;
	        if (!(field in this._relationships)) {
	          this._relationships[field] = new EntityArray(this, field, relationship);
	          ref = ec._instances[relationship.to.type];
	          for (id in ref) {
	            type = ref[id];
	            if (type[relationship.to.property] === this[relationship.property]) {
	              this._relationships[field].add(type);
	            }
	          }
	        }
	        return this._relationships[field];
	      },
	      set: function() {
	        var entity, i, len, relations;
	        relations = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	        relations = relations.reduce((function(a, b) {
	          return a.concat(b);
	        }), []);
	        this[field];
	        for (i = 0, len = relations.length; i < len; i++) {
	          entity = relations[i];
	          this._relationships[field].add(entity);
	        }
	        this._modified._count += 1;
	        this.emit("modified", [field, arguments]);
	        return this;
	      }
	    } : {
	      set: lock(function(related) {
	        var ref, ref1;
	        if (related === null) {
	          if ("is_a" !== relationship.type) {
	            try {
	              if ((ref = this._relationships[field]) != null) {
	                ref[relationship.back].remove(this);
	              }
	            } catch (_error) {
	              if ((ref1 = this._relationships[field]) != null) {
	                ref1[relationship.back] = null;
	              }
	            }
	          }
	          this._relationships[field] = null;
	          this[relationship.property] = null;
	        } else {
	          this._relationships[field] = related;
	          resolve_ids.call(this, related);
	          if ("is_a" !== relationship.type) {
	            if (relationship.back) {
	              if (related != null) {
	                related[relationship.back] = this;
	              }
	            }
	          }
	        }
	        this._modified._count += 1;
	        this.emit("modified", [field, related]);
	        return this;
	      }),
	      get: function() {
	        var key;
	        if (this._relationships[field] === void 0) {
	          this._relationships[field] = ec._instances[relationship.to.type][this[relationship.property]];
	          if (this._relationships[field] === void 0) {
	            key = {};
	            key[relationship.to.property] = this[relationship.property];
	            this[field] = ec.build(relationship.to.type, key);
	          }
	        }
	        return this._relationships[field];
	      }
	    };
	    Object.defineProperty(definition.Constructor.prototype, field, access);
	    return resolve_ids = function(related) {
	      var id;
	      if (related === void 0) {
	        return this[relationship.property] = void 0;
	      } else if (definition.key === relationship.property) {
	        return related[relationship.to.property] = this[relationship.property];
	      } else if (related._definition().key === relationship.to.property) {
	        return this[relationship.property] = related[relationship.to.property];
	      } else {
	        if (this[relationship.property].match(UUID.rvalid)) {
	          return related[relationship.to.property] = this[relationship.property];
	        } else if (related[relationship.to.property].match(UUID.rvalid)) {
	          return this[relationship.property] = related[relationship.to.property];
	        } else {
	          id = UUID.v4();
	          this[relationship.property] = id;
	          return related[relationship.to.property] = id;
	        }
	      }
	    };
	  };
	  _build_method = function(definition, method, func) {
	    var body, fn, params;
	    func = {
	      definitions: func.definitions || {},
	      order: func.order || []
	    };
	    body = func.definitions.javascript || "";
	    params = func.order;
	    if (body && !body.match(/window/)) {
	      params.push(body);
	      fn = Function.apply(null, params);
	    } else {
	      fn = function() {};
	    }
	    return definition.Constructor.prototype[method] = fn;
	  };
	  this.load = function(contextUri, prototypes) {
	    return Request(contextUri).then(function(data) {
	      var e;
	      data = data || "{}";
	      try {
	        data = Object.isString(data) ? JSON.parse(data) : data;
	        _set_context(data, prototypes);
	        return ready.promise(true);
	      } catch (_error) {
	        e = _error;
	        console.error('Could not load context');
	        console.warn(e);
	        console.log(data);
	        return ready.promise(false);
	      }
	    })["catch"](function(e) {
	      console.warn(e);
	      console.log(e.stack);
	      return ready.promise(false, e);
	    }).done();
	  };
	  if (options && options.debug) {
	    _set_context(options.debug.context, protos);
	    ready.promise(false);
	  }
	  if (contextUri) {
	    this.load(contextUri, protos);
	  }
	  return this;
	};

	pushResult = function(entity) {
	  var type;
	  type = entity._type();
	  if (!this[type]) {
	    this[type] = [];
	  }
	  return this[type].push(entity);
	};

	JEFRi.Runtime.prototype = Object.create(Object.assign({}, Eventer, {
	  clear: function() {
	    this._instances = {};
	    return this;
	  },
	  definition: function(name) {
	    name = (typeof name._type === "function" ? name._type() : void 0) || name;
	    return this._context.entities[name];
	  },
	  extend: function(type, extend) {
	    if (this._context.entities[type]) {
	      Object.assign(this._context.entities[type].Constructor.prototype, extend.prototype);
	    }
	    return this;
	  },
	  intern: function(entity, updateOnIntern) {
	    var ent, entities, ret;
	    if (updateOnIntern == null) {
	      updateOnIntern = false;
	    }
	    updateOnIntern = updateOnIntern || this.settings.updateOnIntern;
	    if (entity.length && !entity._type) {
	      entities = (function() {
	        var i, len, results1;
	        results1 = [];
	        for (i = 0, len = entity.length; i < len; i++) {
	          ent = entity[i];
	          results1.push(this.intern(ent, updateOnIntern));
	        }
	        return results1;
	      }).call(this);
	      return entities;
	    }
	    if (updateOnIntern) {
	      ret = this._instances[entity._type()][entity.id()] || entity;
	      Object.assign(ret._fields, entity._fields);
	    } else {
	      ret = this._instances[entity._type()][entity.id()] || entity;
	    }
	    this._instances[entity._type()][entity.id()] = ret;
	    return ret;
	  },
	  build: function(type, obj) {
	    var def, demi, instance, r;
	    def = this.definition(type);
	    if (!def) {
	      throw "JEFRi::Runtime::build '" + type + "' is not a defined type in this context.";
	    }
	    obj = obj || {};
	    r = new def.Constructor(obj);
	    if (def.key in obj) {
	      demi = {
	        _type: type
	      };
	      demi[def.key] = obj[def.key];
	      instance = this.find(demi);
	      if (instance.length > 0) {
	        instance = instance[0];
	        Object.assign(instance._fields, r._fields);
	        return instance;
	      }
	    }
	    this._instances[type][r.id()] = r;
	    return r;
	  },
	  expand: function(transaction, action) {
	    var built, e, entity, i, j, len, len1, ref;
	    action = action || "persisted";
	    built = [];
	    ref = transaction.entities || [];
	    for (i = 0, len = ref.length; i < len; i++) {
	      entity = ref[i];
	      e = this.build(entity._type, entity);
	      e = this.intern(e, true);
	      built.push(e);
	    }
	    for (j = 0, len1 = built.length; j < len1; j++) {
	      e = built[j];
	      e.emit(action, true);
	    }
	    return transaction.entities = built;
	  },
	  destroy: function(entity) {
	    delete this._instances[entity._type()][entity.id()];
	    return this;
	  },
	  find: function(spec) {
	    var key, r, result, results, to_return;
	    if (typeof spec === "string") {
	      spec = {
	        _type: spec
	      };
	    }
	    to_return = [];
	    r = this.definition(spec._type);
	    results = this._instances[spec._type];
	    if (spec.hasOwnProperty(r.key || spec.hasOwnProperty('_id'))) {
	      if (results[spec[r.key]]) {
	        to_return.push(results[spec[r.key]]);
	      }
	    } else {
	      for (key in results) {
	        result = results[key];
	        to_return.push(result);
	      }
	    }
	    return to_return;
	  }
	}));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var JEFRi, Transaction;

	JEFRi = __webpack_require__(1);

	Transaction = (function() {
	  function Transaction(spec, store) {
	    Object.assign(this, {
	      attributes: {},
	      store: store,
	      entities: spec instanceof Array ? spec : (spec ? [spec] : [])
	    });
	  }

	  Transaction.prototype.encode = function() {
	    var entity, i, len, ref, transaction;
	    transaction = {
	      attributes: this.attributes,
	      entities: []
	    };
	    ref = this.entities;
	    for (i = 0, len = ref.length; i < len; i++) {
	      entity = ref[i];
	      transaction.entities.push(JEFRi.isEntity(entity) ? entity._encode() : entity);
	    }
	    return transaction;
	  };

	  Transaction.prototype.toString = function() {
	    return JSON.stringify(this.encode());
	  };

	  Transaction.prototype.get = function(store) {
	    if (store == null) {
	      store = this.store;
	    }
	    this.emit("getting", {});
	    store = store || this.store;
	    return store.execute('get', this).then(function() {
	      return resolve(this);
	    });
	  };

	  Transaction.prototype.persist = function(store) {
	    if (store == null) {
	      store = this.store;
	    }
	    this.emit("persisting", {});
	    return store.execute('persist', this).then((function(_this) {
	      return function(t) {
	        var entity, i, len, ref;
	        ref = t.entities;
	        for (i = 0, len = ref.length; i < len; i++) {
	          entity = ref[i];
	          entity.emit("persisted", {});
	        }
	        _this.emit("persisted", {});
	        return resolve(_this);
	      };
	    })(this));
	  };

	  Transaction.prototype.add = function(spec, force) {
	    var i, len, s;
	    if (force == null) {
	      force = false;
	    }
	    spec = Array.isArray(spec) ? spec : [].slice.call(arguments, 0);
	    for (i = 0, len = spec.length; i < len; i++) {
	      s = spec[i];
	      if (true) {
	        this.entities.push(s);
	      }
	    }
	    return this;
	  };

	  Transaction.prototype.attributes = function(attributes) {
	    Object.assign(this.attributes, c(attributes));
	    return this;
	  };

	  return Transaction;

	})();

	module.exports = Transaction;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var EntityArray, JEFRi;

	JEFRi = __webpack_require__(1);

	module.exports = EntityArray = function(entity1, field, relationship) {
	  this.entity = entity1;
	  this.field = field;
	  this.relationship = relationship;
	};

	EntityArray.prototype = Object.create(Array.prototype);

	EntityArray.prototype.remove = function(entity) {
	  var e, i;
	  if (entity === null) {
	    return;
	  }
	  i = this.length - 1;
	  while (i >= 0) {
	    if (this[i]._compare(entity)) {
	      if (this.relationship.back) {
	        e = this[i];
	        try {
	          e[this.relationship.back].remove(this);
	        } catch (_error) {
	          e[this.relationship.back] = null;
	        }
	      }
	      this.splice(i, 1);
	    }
	    i--;
	  }
	  return this;
	};

	EntityArray.prototype.add = function(entity) {
	  var found;
	  found = null;
	  this.entity._relationships[this.field].forEach(function(other) {
	    if (found != null) {
	      return;
	    }
	    if (JEFRi.EntityComparator(entity, other)) {
	      return found = other;
	    }
	  });
	  if (found == null) {
	    this.entity._relationships[this.field].push(entity);
	    if (this.relationship.back) {
	      entity[this.relationship.back] = this.entity;
	    }
	  }
	  return this.entity;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6);

	module.exports = {
		Event: __webpack_require__(10),
		lock: __webpack_require__(7),
		promise: __webpack_require__(8),
		request: __webpack_require__(11),
		UUID: __webpack_require__(9)
	};

	if(typeof window == 'object' && window !== null){
		window.jiffies = module.exports;
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
	if (![].includes) {
		Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {'use strict';
			var O = Object(this);
			var len = parseInt(O.length) || 0;
			if (len === 0) {
				return false;
			}
			var n = parseInt(arguments[1]) || 0;
			var k;
			if (n >= 0) {
				k = n;
			} else {
				k = len + n;
				if (k < 0) {k = 0;}
			}
			var currentElement;
			while (k < len) {
				currentElement = O[k];
				if (searchElement === currentElement ||
					 (searchElement !== searchElement && currentElement !== currentElement)) {
					return true;
				}
				k++;
			}
			return false;
		};
	}

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

	if (!Object.isString) {
		Object.isString = function(value){
			return typeof value == 'string';
		}
	}

	if (!Array.isArray) {
		Array.isArray = function(arg) {
			return Object.prototype.toString.call(arg) === '[object Array]';
		};
	}

	if (!Function.isFunction) {
		Function.isFunction = function(obj) {
			return typeof obj === 'function';
		};
	}

	if (!Object.isObject) {
		Object.isObject =  function(obj) {
			return typeof obj == 'object' && obj !== null || false;
		}
	}

	if (!Object.isNumber) {
		Object.isNumber = function(n) {
		  return !isNaN(parseFloat(n)) && isFinite(n);
		};
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function( fn ) {
		return function(){
			var ret, ex;
			if(!fn.__locked){
				fn.__locked = true;
				try {
					ret = fn.apply(this, arguments);
				} catch (e){
					ex = e;
				}
			}
			fn.__locked = false;
			if(ex){
				throw ex;
			} else {
				return ret;
			}
		};
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, setImmediate, process) {(function(target) {
		var undef;

		function defer(callback) {
			if (typeof setImmediate != 'undefined')
				setImmediate(callback);
			else if (typeof process != 'undefined' && process['nextTick'])
				process['nextTick'](callback);
			else
				setTimeout(callback, 0);
		}

		target[0][target[1]] = function pinkySwear(extend) {
			var state;			// undefined/null = pending, true = fulfilled, false = rejected
			var values = [];	// an array of values as arguments for the then() handlers
			var deferred = [];	// functions to call when set() is invoked

			var set = function(newState, newValues) {
				if (state == null && newState != null) {
					state = newState;
					if(Array.isArray(newValues)){
						values = newValues;
					} else {
						values = [newValues];
					}
					if (deferred.length){
						defer(function() {
							for (var i = 0; i < deferred.length; i++)
								deferred[i]();
						});
					}
				}
				return state;
			};

			set['then'] = function (onFulfilled, onRejected) {
				var promise2 = pinkySwear(extend);
				var callCallbacks = function() {
					try {
						var f = (state ? onFulfilled : onRejected);
						if (Function.isFunction(f)) {
							resolve(f.apply(undef, values || []));
						} else {
							promise2(state, values);
						}
					} catch (e) {
						promise2(false, [e]);
					}
				};
				if (state != null) {
					defer(callCallbacks);
				} else {
					deferred.push(callCallbacks);
				}
				return promise2;

				function resolve(x) {
					var then, cbCalled = 0;
					try {
						if (x && Function.isFunction(then = x['then'])) {
							if (x === promise2){
								throw new TypeError();
							}
							then['call'](x, pass, fail);
						} else {
							promise2(true, arguments);
						}
					} catch(e) {
						if (!cbCalled++) {
							promise2(false, [e]);
						}
					}
					function pass(){ if (!cbCalled++) resolve.apply(undef, arguments); }
					function fail(value){ if (!cbCalled++) promise2(false, [value]); }
				}
			};

			set['catch'] = function (onRejected){
				return set['then'](function(){}, onRejected);
			};

			set['finally'] = function(afterPromise){
				return set['catch'](function(){return null;})['then'](afterPromise);
			};

			set['done'] = function(afterPromise, onRejected){
				return null;
			};

			if(extend){
				set = extend(set);
			}
			return set;
		};
	})(false ? [window, 'promise'] : [module, 'exports']);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(16)(module), __webpack_require__(13).setImmediate, __webpack_require__(14)))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var UUID = {};
	module.exports = UUID;

	UUID.rvalid = /^\{?[0-9a-f]{8}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?[0-9a-f]{12}\}?$/i;

	var random = __webpack_require__(12);

	UUID.v4 = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = random(1)&0x0f, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var EventDispatcher;

	module.exports = EventDispatcher = function() {};

	EventDispatcher.prototype = {
	  on: function(event, fn) {
	    var listeners;
	    if (this._listeners == null) {
	      this._listeners = {};
	    }
	    listeners = this._listeners;
	    if (listeners[event] == null) {
	      listeners[event] = [];
	    }
	    if (!listeners[event].includes(fn)) {
	      return listeners[event].push(fn);
	    }
	  },
	  off: function(event, fn) {
	    var index, listeners;
	    if (this._listeners == null) {
	      return;
	    }
	    listeners = this._listeners;
	    index = listeners[event].indexOf(fn);
	    if (index !== -1) {
	      return listeners[event].splice(index, 1);
	    }
	  },
	  emit: function(event, args) {
	    var i, len, listener, listenerArray, listeners, results;
	    if (this._listeners == null) {
	      return;
	    }
	    listeners = this._listeners;
	    listenerArray = listeners[event];
	    if (listenerArray != null) {
	      event.target = this;
	      results = [];
	      for (i = 0, len = listenerArray.length; i < len; i++) {
	        listener = listenerArray[i];
	        results.push(listener.call(this, event));
	      }
	      return results;
	    }
	  }
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var request;

	request = __webpack_require__(15);

	module.exports = function(uri) {
	  if (uri === "") {
	    return Promise()(true);
	  } else {
	    return request.get(uri);
	  }
	};

	module.exports.get = request.get;

	module.exports.post = request.post;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(size){
		var array = new Uint8Array(size);
		window.crypto.getRandomValues(array);
		return [].slice.call(array)[0];
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(14).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate, __webpack_require__(13).clearImmediate))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    draining = true;
	    var currentQueue;
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        var i = -1;
	        while (++i < len) {
	            currentQueue[i]();
	        }
	        len = queue.length;
	    }
	    draining = false;
	}
	process.nextTick = function (fun) {
	    queue.push(fun);
	    if (!draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Promise, ajax,
	  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	Promise = __webpack_require__(8);

	ajax = function(options) {
	  var XHR, promise, xhr;
	  promise = Promise();
	  XHR = window.ActiveXObject || XMLHttpRequest;
	  xhr = new XHR('Microsoft.XMLHTTP');
	  xhr.open(options.type || (options.data ? 'POST' : 'GET'), options.url, true);
	  if (indexOf.call(xhr, 'overrideMimeType') >= 0) {
	    xhr.overrideMimeType(options.dataType || 'text/plain');
	  }
	  xhr.onreadystatechange = function() {
	    var _ref, resolution;
	    if (xhr.readyState === 4) {
	      if ((_ref = xhr.status) === 0 || _ref === 200) {
	        resolution = xhr.responseText;
	        if (options.dataType === "application/json") {
	          resolution = JSON.parse(resolution);
	        }
	        promise(true, resolution);
	      } else {
	        promise(false, new Error("Could not load " + options.url));
	      }
	    }
	  };
	  if (options.data) {
	    xhr.setRequestHeader("Content-type", options.dataType || "application/x-www-form-urlencoded");
	  }
	  xhr.send(options.data || null);
	  return promise;
	};

	module.exports = {
	  get: function(url, options) {
	    options = options || {};
	    options.url = url;
	    options.type = 'GET';
	    options.data = null;
	    return ajax(options);
	  },
	  post: function(url, options) {
	    options = options || {};
	    options.url = url;
	    options.type = 'POST';
	    return ajax(options);
	  }
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ]);