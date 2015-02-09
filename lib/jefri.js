/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var EntityArray, JEFRi, Promise, Request, UUID, pushResult,
	  __slice = [].slice;

	__webpack_require__(1);

	Promise = __webpack_require__(2);

	Request = __webpack_require__(4);

	UUID = __webpack_require__(3);

	JEFRi = module.exports = {
	  EntityComparator: function(a, b) {
	    var cmp;
	    cmp = a && b && a._type() === b._type() && a.id() === b.id();
	    return cmp;
	  },
	  isEntity: function(obj) {
	    if (obj == null) {
	      obj = {};
	    }
	    return obj._type && obj.id && _.isFunction(obj._type) && _.isFunction(obj.id) || false;
	  }
	};

	EntityArray = function(_at_entity, _at_field, _at_relationship) {
	  this.entity = _at_entity;
	  this.field = _at_field;
	  this.relationship = _at_relationship;
	};

	EntityArray.prototype = Object.create(Array.prototype);

	EntityArray.prototype.remove = function(entity) {
	  var e, i;
	  if (entity === null) {
	    return;
	  }
	  i = this.length - 1;
	  while (i > -1) {
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

	JEFRi.Runtime = function(contextUri, options, protos) {
	  var ec, ready, settings, _build_constructor, _build_method, _build_mutacc, _build_prototype, _build_relationship, _default, _set_context;
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
	      var definition, type, _ref, _results;
	      Object.assign(_this._context.attributes, context.attributes || {});
	      _ref = context.entities;
	      _results = [];
	      for (type in _ref) {
	        definition = _ref[type];
	        _results.push(_build_constructor(definition, type));
	      }
	      return _results;
	    };
	  })(this);
	  _build_constructor = (function(_this) {
	    return function(definition, type) {
	      _this._context.entities[type] = definition;
	      _this._instances[type] = {};
	      definition.Constructor = function(proto) {
	        var def, name, property, _ref;
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
	        _ref = definition.properties;
	        for (name in _ref) {
	          property = _ref[name];
	          def = proto[name] || _default(property.type);
	          this[name] = def;
	        }
	        this._id = this.id(true);
	        Object.assign(this.prototype, proto.prototype);
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
	      var field, func, method, property, rel_name, relationship, _ref, _ref1, _ref2;
	      definition.Constructor.prototype = Object.create(Object.assign({}, JEFRi.EventDispatcher.prototype, {
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
	        _destroy: _.lock(function() {
	          var name, rel, _ref;
	          this.emit("destroying", {});
	          _ref = definition.relationships;
	          for (name in _ref) {
	            rel = _ref[name];
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
	      _ref = definition.properties;
	      for (field in _ref) {
	        property = _ref[field];
	        _build_mutacc(definition, field, property);
	      }
	      _ref1 = definition.relationships;
	      for (rel_name in _ref1) {
	        relationship = _ref1[rel_name];
	        _build_relationship(definition, rel_name, relationship);
	      }
	      _ref2 = definition.methods;
	      for (method in _ref2) {
	        func = _ref2[method];
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
	        var id, type, _ref;
	        if (!(field in this._relationships)) {
	          this._relationships[field] = new EntityArray(this, field, relationship);
	          _ref = ec._instances[relationship.to.type];
	          for (id in _ref) {
	            type = _ref[id];
	            if (type[relationship.to.property] === this[relationship.property]) {
	              this._relationships[field].add(type);
	            }
	          }
	        }
	        return this._relationships[field];
	      },
	      set: function() {
	        var entity, relations, _i, _len;
	        relations = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	        relations = relations.reduce((function(a, b) {
	          return a.concat(b);
	        }), []);
	        this[field];
	        for (_i = 0, _len = relations.length; _i < _len; _i++) {
	          entity = relations[_i];
	          this._relationships[field].add(entity);
	        }
	        this._modified._count += 1;
	        this.emit("modified", [field, arguments]);
	        return this;
	      }
	    } : {
	      set: _.lock(function(related) {
	        var _ref, _ref1;
	        if (related === null) {
	          if ("is_a" !== relationship.type) {
	            try {
	              if ((_ref = this._relationships[field]) != null) {
	                _ref[relationship.back].remove(this);
	              }
	            } catch (_error) {
	              if ((_ref1 = this._relationships[field]) != null) {
	                _ref1[relationship.back] = null;
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
	      data = data || "{}";
	      data = _.isString(data) ? JSON.parse(data) : data;
	      _set_context(data, prototypes);
	      return ready.promise(true);
	    })["catch"](function(e) {
	      console.warn(e, e.message);
	      return ready.reject(e);
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

	JEFRi.Runtime.prototype = Object.create({
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
	        var _i, _len, _results;
	        _results = [];
	        for (_i = 0, _len = entity.length; _i < _len; _i++) {
	          ent = entity[_i];
	          _results.push(this.intern(ent, updateOnIntern));
	        }
	        return _results;
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
	    var built, e, entity, _i, _j, _len, _len1, _ref;
	    action = action || "persisted";
	    built = [];
	    _ref = transaction.entities || [];
	    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	      entity = _ref[_i];
	      e = this.build(entity._type, entity);
	      e = this.intern(e, true);
	      built.push(e);
	    }
	    for (_j = 0, _len1 = built.length; _j < _len1; _j++) {
	      e = built[_j];
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
	});

	JEFRi.Transaction = function(spec, store) {
	  return Object.assign(this, {
	    attributes: {},
	    store: store,
	    entities: spec instanceof Array ? spec : (spec ? [spec] : [])
	  });
	};

	JEFRi.Transaction.prototype = Object.create({
	  encode: function() {
	    var entity, transaction, _i, _len, _ref;
	    transaction = {
	      attributes: this.attributes,
	      entities: []
	    };
	    _ref = this.entities;
	    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	      entity = _ref[_i];
	      transaction.entities.push(JEFRi.isEntity(entity) ? entity._encode() : entity);
	    }
	    return transaction;
	  },
	  toString: function() {
	    return JSON.stringify(this.encode());
	  },
	  get: function(store) {
	    if (store == null) {
	      store = this.store;
	    }
	    this.emit("getting", {});
	    return new Promise(function(resolve, reject) {
	      store = store || this.store;
	      return store.execute('get', this).then(function() {
	        return resolve(this);
	      });
	    });
	  },
	  persist: function(store) {
	    if (store == null) {
	      store = this.store;
	    }
	    this.emit("persisting", {});
	    return new Promise(function(resolve) {
	      return store.execute('persist', this).then((function(_this) {
	        return function(t) {
	          var entity, _i, _len, _ref;
	          _ref = t.entities;
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            entity = _ref[_i];
	            entity.emit("persisted", {});
	          }
	          _this.emit("persisted", {});
	          return resolve(_this);
	        };
	      })(this));
	    });
	  },
	  add: function(spec, force) {
	    var s, _i, _len;
	    if (force == null) {
	      force = false;
	    }
	    spec = Array.isArray(spec) ? spec : [].slice.call(arguments, 0);
	    for (_i = 0, _len = spec.length; _i < _len; _i++) {
	      s = spec[_i];
	      if (true) {
	        this.entities.push(s);
	      }
	    }
	    return this;
	  },
	  attributes: function(attributes) {
	    Object.assign(this.attributes, c(attributes));
	    return this;
	  }
	});


/***/ },
/* 1 */
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
	  Object.isString = function(obj){
	    return Object.toString.call(contextUri) === '[object String]';
	  }
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	(function(e){function g(h){return"function"==typeof h}function k(h){"undefined"!=typeof setImmediate?setImmediate(h):"undefined"!=typeof process&&process.nextTick?process.nextTick(h):setTimeout(h,0)}e[0][e[1]]=function n(f){function a(a,g){null==b&&null!=a&&(b=a,l=g,c.length&&k(function(){for(var a=0;a<c.length;a++)c[a]()}));return b}var b,l=[],c=[];a.then=function(a,e){function m(){try{var c=b?a:e;if(g(c)){var f=function(a){var c,b=0;try{if(a&&("object"==typeof a||g(a))&&g(c=a.then)){if(a===d)throw new TypeError;
	c.call(a,function(){b++||f.apply(void 0,arguments)},function(a){b++||d(!1,[a])})}else d(!0,arguments)}catch(e){b++||d(!1,[e])}};f(c.apply(void 0,l||[]))}else d(b,l)}catch(k){d(!1,[k])}}var d=n(f);null!=b?k(m):c.push(m);return d};f&&(a=f(a));return a}})("undefined"==typeof module?[window,"Promise"]:[module,"exports"]);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Emitter = __webpack_require__(5);
	var reduce = __webpack_require__(6);

	/**
	 * Root reference for iframes.
	 */

	var root = 'undefined' == typeof window
	  ? this
	  : window;

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isHost(obj) {
	  var str = {}.toString.call(obj);

	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}

	/**
	 * Determine XHR.
	 */

	function getXHR() {
	  if (root.XMLHttpRequest
	    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  return false;
	}

	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */

	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return obj === Object(obj);
	}

	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */

	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    if (null != obj[key]) {
	      pairs.push(encodeURIComponent(key)
	        + '=' + encodeURIComponent(obj[key]));
	    }
	  }
	  return pairs.join('&');
	}

	/**
	 * Expose serialization method.
	 */

	 request.serializeObject = serialize;

	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */

	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var parts;
	  var pair;

	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    parts = pair.split('=');
	    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	  }

	  return obj;
	}

	/**
	 * Expose parser.
	 */

	request.parseString = parseString;

	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */

	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};

	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */

	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };

	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */

	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};

	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;

	  lines.pop(); // trailing CRLF

	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }

	  return fields;
	}

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	function type(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function params(str){
	  return reduce(str.split(/ *; */), function(obj, str){
	    var parts = str.split(/ *= */)
	      , key = parts.shift()
	      , val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */

	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  this.text = this.req.method !='HEAD' 
	     ? this.xhr.responseText 
	     : null;
	  this.setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this.setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this.parseBody(this.text)
	    : null;
	}

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};

	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */

	Response.prototype.setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);

	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};

	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */

	Response.prototype.parseBody = function(str){
	  var parse = request.parse[this.type];
	  return parse && str && str.length
	    ? parse(str)
	    : null;
	};

	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */

	Response.prototype.setStatusProperties = function(status){
	  var type = status / 100 | 0;

	  // status / class
	  this.status = status;
	  this.statusType = type;

	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;

	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status || 1223 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};

	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */

	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;

	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;

	  return err;
	};

	/**
	 * Expose `Response`.
	 */

	request.Response = Response;

	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */

	function Request(method, url) {
	  var self = this;
	  Emitter.call(this);
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {};
	  this._header = {};
	  this.on('end', function(){
	    var err = null;
	    var res = null;

	    try {
	      res = new Response(self); 
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	    }

	    self.callback(err, res);
	  });
	}

	/**
	 * Mixin `Emitter`.
	 */

	Emitter(Request.prototype);

	/**
	 * Allow for extension
	 */

	Request.prototype.use = function(fn) {
	  fn(this);
	  return this;
	}

	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.timeout = function(ms){
	  this._timeout = ms;
	  return this;
	};

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.clearTimeout = function(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};

	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */

	Request.prototype.abort = function(){
	  if (this.aborted) return;
	  this.aborted = true;
	  this.xhr.abort();
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};

	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};

	/**
	 * Remove header `field`.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Get case-insensitive header `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 */

	Request.prototype.getHeader = function(field){
	  return this._header[field.toLowerCase()];
	};

	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};

	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};

	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass){
	  var str = btoa(user + ':' + pass);
	  this.set('Authorization', 'Basic ' + str);
	  return this;
	};

	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/

	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};

	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.field = function(name, val){
	  if (!this._formData) this._formData = new FormData();
	  this._formData.append(name, val);
	  return this;
	};

	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, filename){
	  if (!this._formData) this._formData = new FormData();
	  this._formData.append(field, file, filename);
	  return this;
	};

	/**
	 * Send `data`, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // querystring
	 *       request.get('/search')
	 *         .end(callback)
	 *
	 *       // multiple data "writes"
	 *       request.get('/search')
	 *         .send({ search: 'query' })
	 *         .send({ range: '1..5' })
	 *         .send({ order: 'desc' })
	 *         .end(callback)
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"})
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	  *      request.post('/user')
	  *        .send('name=tobi')
	  *        .send('species=ferret')
	  *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.send = function(data){
	  var obj = isObject(data);
	  var type = this.getHeader('Content-Type');

	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    if (!type) this.type('form');
	    type = this.getHeader('Content-Type');
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }

	  if (!obj) return this;
	  if (!type) this.type('json');
	  return this;
	};

	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */

	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  if (2 == fn.length) return fn(err, res);
	  if (err) return this.emit('error', err);
	  fn(res);
	};

	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */

	Request.prototype.crossDomainError = function(){
	  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
	  err.crossDomain = true;
	  this.callback(err);
	};

	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */

	Request.prototype.timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};

	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */

	Request.prototype.withCredentials = function(){
	  this._withCredentials = true;
	  return this;
	};

	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = getXHR();
	  var query = this._query.join('&');
	  var timeout = this._timeout;
	  var data = this._formData || this._data;

	  // store callback
	  this._callback = fn || noop;

	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;
	    if (0 == xhr.status) {
	      if (self.aborted) return self.timeoutError();
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };

	  // progress
	  if (xhr.upload) {
	    xhr.upload.onprogress = function(e){
	      e.percent = e.loaded / e.total * 100;
	      self.emit('progress', e);
	    };
	  }

	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.abort();
	    }, timeout);
	  }

	  // querystring
	  if (query) {
	    query = request.serializeObject(query);
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }

	  // initiate request
	  xhr.open(this.method, this.url, true);

	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;

	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
	    // serialize stuff
	    var serialize = request.serialize[this.getHeader('Content-Type')];
	    if (serialize) data = serialize(data);
	  }

	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }

	  // send stuff
	  this.emit('request', this);
	  xhr.send(data);
	  return this;
	};

	/**
	 * Expose `Request`.
	 */

	request.Request = Request;

	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */

	function request(method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new Request('GET', method).end(url);
	  }

	  // url first
	  if (1 == arguments.length) {
	    return new Request('GET', method);
	  }

	  return new Request(method, url);
	}

	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.del = function(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * Expose `request`.
	 */

	module.exports = request;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks[event] = this._callbacks[event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  var self = this;
	  this._callbacks = this._callbacks || {};

	  function on() {
	    self.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks[event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks[event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks[event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks[event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Reduce `arr` with `fn`.
	 *
	 * @param {Array} arr
	 * @param {Function} fn
	 * @param {Mixed} initial
	 *
	 * TODO: combatible error handling?
	 */

	module.exports = function(arr, fn, initial){  
	  var idx = 0;
	  var len = arr.length;
	  var curr = arguments.length == 3
	    ? initial
	    : arr[idx++];

	  while (idx < len) {
	    curr = fn.call(null, curr, arr[idx], ++idx, arr);
	  }
	  
	  return curr;
	};

/***/ }
/******/ ])