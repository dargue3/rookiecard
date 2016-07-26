(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
	Autosize 3.0.16
	license: MIT
	http://www.jacklmoore.com/autosize
*/
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod);
		global.autosize = mod.exports;
	}
})(this, function (exports, module) {
	'use strict';

	var set = typeof Set === 'function' ? new Set() : (function () {
		var list = [];

		return {
			has: function has(key) {
				return Boolean(list.indexOf(key) > -1);
			},
			add: function add(key) {
				list.push(key);
			},
			'delete': function _delete(key) {
				list.splice(list.indexOf(key), 1);
			} };
	})();

	var createEvent = function createEvent(name) {
		return new Event(name);
	};
	try {
		new Event('test');
	} catch (e) {
		// IE does not support `new Event()`
		createEvent = function (name) {
			var evt = document.createEvent('Event');
			evt.initEvent(name, true, false);
			return evt;
		};
	}

	function assign(ta) {
		var _ref = arguments[1] === undefined ? {} : arguments[1];

		var _ref$setOverflowX = _ref.setOverflowX;
		var setOverflowX = _ref$setOverflowX === undefined ? true : _ref$setOverflowX;
		var _ref$setOverflowY = _ref.setOverflowY;
		var setOverflowY = _ref$setOverflowY === undefined ? true : _ref$setOverflowY;

		if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || set.has(ta)) return;

		var heightOffset = null;
		var overflowY = null;
		var clientWidth = ta.clientWidth;

		function init() {
			var style = window.getComputedStyle(ta, null);

			overflowY = style.overflowY;

			if (style.resize === 'vertical') {
				ta.style.resize = 'none';
			} else if (style.resize === 'both') {
				ta.style.resize = 'horizontal';
			}

			if (style.boxSizing === 'content-box') {
				heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			} else {
				heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			}
			// Fix when a textarea is not on document body and heightOffset is Not a Number
			if (isNaN(heightOffset)) {
				heightOffset = 0;
			}

			update();
		}

		function changeOverflow(value) {
			{
				// Chrome/Safari-specific fix:
				// When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
				// made available by removing the scrollbar. The following forces the necessary text reflow.
				var width = ta.style.width;
				ta.style.width = '0px';
				// Force reflow:
				/* jshint ignore:start */
				ta.offsetWidth;
				/* jshint ignore:end */
				ta.style.width = width;
			}

			overflowY = value;

			if (setOverflowY) {
				ta.style.overflowY = value;
			}

			resize();
		}

		function getParentOverflows(el) {
			var arr = [];

			while (el && el.parentNode && el.parentNode instanceof Element) {
				if (el.parentNode.scrollTop) {
					arr.push({
						node: el.parentNode,
						scrollTop: el.parentNode.scrollTop });
				}
				el = el.parentNode;
			}

			return arr;
		}

		function resize() {
			var originalHeight = ta.style.height;
			var overflows = getParentOverflows(ta);
			var docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

			ta.style.height = 'auto';

			var endHeight = ta.scrollHeight + heightOffset;

			if (ta.scrollHeight === 0) {
				// If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
				ta.style.height = originalHeight;
				return;
			}

			ta.style.height = endHeight + 'px';

			// used to check if an update is actually necessary on window.resize
			clientWidth = ta.clientWidth;

			// prevents scroll-position jumping
			overflows.forEach(function (el) {
				el.node.scrollTop = el.scrollTop;
			});

			if (docTop) {
				document.documentElement.scrollTop = docTop;
			}
		}

		function update() {
			var startHeight = ta.style.height;

			resize();

			var style = window.getComputedStyle(ta, null);

			if (style.height !== ta.style.height) {
				if (overflowY !== 'visible') {
					changeOverflow('visible');
				}
			} else {
				if (overflowY !== 'hidden') {
					changeOverflow('hidden');
				}
			}

			if (startHeight !== ta.style.height) {
				var evt = createEvent('autosize:resized');
				ta.dispatchEvent(evt);
			}
		}

		var pageResize = function pageResize() {
			if (ta.clientWidth !== clientWidth) {
				update();
			}
		};

		var destroy = (function (style) {
			window.removeEventListener('resize', pageResize, false);
			ta.removeEventListener('input', update, false);
			ta.removeEventListener('keyup', update, false);
			ta.removeEventListener('autosize:destroy', destroy, false);
			ta.removeEventListener('autosize:update', update, false);
			set['delete'](ta);

			Object.keys(style).forEach(function (key) {
				ta.style[key] = style[key];
			});
		}).bind(ta, {
			height: ta.style.height,
			resize: ta.style.resize,
			overflowY: ta.style.overflowY,
			overflowX: ta.style.overflowX,
			wordWrap: ta.style.wordWrap });

		ta.addEventListener('autosize:destroy', destroy, false);

		// IE9 does not fire onpropertychange or oninput for deletions,
		// so binding to onkeyup to catch most of those events.
		// There is no way that I know of to detect something like 'cut' in IE9.
		if ('onpropertychange' in ta && 'oninput' in ta) {
			ta.addEventListener('keyup', update, false);
		}

		window.addEventListener('resize', pageResize, false);
		ta.addEventListener('input', update, false);
		ta.addEventListener('autosize:update', update, false);
		set.add(ta);

		if (setOverflowX) {
			ta.style.overflowX = 'hidden';
			ta.style.wordWrap = 'break-word';
		}

		init();
	}

	function destroy(ta) {
		if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) return;
		var evt = createEvent('autosize:destroy');
		ta.dispatchEvent(evt);
	}

	function update(ta) {
		if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) return;
		var evt = createEvent('autosize:update');
		ta.dispatchEvent(evt);
	}

	var autosize = null;

	// Do nothing in Node.js environment and IE8 (or lower)
	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
		autosize = function (el) {
			return el;
		};
		autosize.destroy = function (el) {
			return el;
		};
		autosize.update = function (el) {
			return el;
		};
	} else {
		autosize = function (el, options) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], function (x) {
					return assign(x, options);
				});
			}
			return el;
		};
		autosize.destroy = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], destroy);
			}
			return el;
		};
		autosize.update = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], update);
			}
			return el;
		};
	}

	module.exports = autosize;
});
},{}],2:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":4}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/is-integer"), __esModule: true };
},{"core-js/library/fn/number/is-integer":5}],4:[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":8}],5:[function(require,module,exports){
require('../../modules/es6.number.is-integer');
module.exports = require('../../modules/_core').Number.isInteger;
},{"../../modules/_core":8,"../../modules/es6.number.is-integer":22}],6:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],7:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":18}],8:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],9:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":6}],10:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":13}],11:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":14,"./_is-object":18}],12:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":8,"./_ctx":9,"./_global":14,"./_hide":15}],13:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],14:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],15:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":10,"./_object-dp":19,"./_property-desc":20}],16:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":10,"./_dom-create":11,"./_fails":13}],17:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = require('./_is-object')
  , floor    = Math.floor;
module.exports = function isInteger(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
};
},{"./_is-object":18}],18:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],19:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":7,"./_descriptors":10,"./_ie8-dom-define":16,"./_to-primitive":21}],20:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],21:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":18}],22:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $export = require('./_export');

$export($export.S, 'Number', {isInteger: require('./_is-integer')});
},{"./_export":12,"./_is-integer":17}],23:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
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

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],24:[function(require,module,exports){
var autosize = require('autosize')

exports.install = function(Vue) {
  Vue.directive('autosize', {
    bind: function() {
      autosize(this.el)
    },

    update: function(value) {
      this.el.value = value
      autosize.update(this.el)
    },

    unbind: function() {
      autosize.destroy(this.el)
    }
  })
}
},{"autosize":1}],25:[function(require,module,exports){
var Vue // late bind
var map = Object.create(null)
var shimmed = false
var isBrowserify = false

/**
 * Determine compatibility and apply patch.
 *
 * @param {Function} vue
 * @param {Boolean} browserify
 */

exports.install = function (vue, browserify) {
  if (shimmed) return
  shimmed = true

  Vue = vue
  isBrowserify = browserify

  exports.compatible = !!Vue.internalDirectives
  if (!exports.compatible) {
    console.warn(
      '[HMR] vue-loader hot reload is only compatible with ' +
      'Vue.js 1.0.0+.'
    )
    return
  }

  // patch view directive
  patchView(Vue.internalDirectives.component)
  console.log('[HMR] Vue component hot reload shim applied.')
  // shim router-view if present
  var routerView = Vue.elementDirective('router-view')
  if (routerView) {
    patchView(routerView)
    console.log('[HMR] vue-router <router-view> hot reload shim applied.')
  }
}

/**
 * Shim the view directive (component or router-view).
 *
 * @param {Object} View
 */

function patchView (View) {
  var unbuild = View.unbuild
  View.unbuild = function (defer) {
    if (!this.hotUpdating) {
      var prevComponent = this.childVM && this.childVM.constructor
      removeView(prevComponent, this)
      // defer = true means we are transitioning to a new
      // Component. Register this new component to the list.
      if (defer) {
        addView(this.Component, this)
      }
    }
    // call original
    return unbuild.call(this, defer)
  }
}

/**
 * Add a component view to a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function addView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    if (!map[id]) {
      map[id] = {
        Component: Component,
        views: [],
        instances: []
      }
    }
    map[id].views.push(view)
  }
}

/**
 * Remove a component view from a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function removeView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    map[id].views.$remove(view)
  }
}

/**
 * Create a record for a hot module, which keeps track of its construcotr,
 * instnaces and views (component directives or router-views).
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if (typeof options === 'function') {
    options = options.options
  }
  if (typeof options.el !== 'string' && typeof options.data !== 'object') {
    makeOptionsHot(id, options)
    map[id] = {
      Component: null,
      views: [],
      instances: []
    }
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot (id, options) {
  options.hotID = id
  injectHook(options, 'created', function () {
    var record = map[id]
    if (!record.Component) {
      record.Component = this.constructor
    }
    record.instances.push(this)
  })
  injectHook(options, 'beforeDestroy', function () {
    map[id].instances.$remove(this)
  })
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook (options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

/**
 * Update a hot component.
 *
 * @param {String} id
 * @param {Object|null} newOptions
 * @param {String|null} newTemplate
 */

exports.update = function (id, newOptions, newTemplate) {
  var record = map[id]
  // force full-reload if an instance of the component is active but is not
  // managed by a view
  if (!record || (record.instances.length && !record.views.length)) {
    console.log('[HMR] Root or manually-mounted instance modified. Full reload may be required.')
    if (!isBrowserify) {
      window.location.reload()
    } else {
      // browserify-hmr somehow sends incomplete bundle if we reload here
      return
    }
  }
  if (!isBrowserify) {
    // browserify-hmr already logs this
    console.log('[HMR] Updating component: ' + format(id))
  }
  var Component = record.Component
  // update constructor
  if (newOptions) {
    // in case the user exports a constructor
    Component = record.Component = typeof newOptions === 'function'
      ? newOptions
      : Vue.extend(newOptions)
    makeOptionsHot(id, Component.options)
  }
  if (newTemplate) {
    Component.options.template = newTemplate
  }
  // handle recursive lookup
  if (Component.options.name) {
    Component.options.components[Component.options.name] = Component
  }
  // reset constructor cached linker
  Component.linker = null
  // reload all views
  record.views.forEach(function (view) {
    updateView(view, Component)
  })
  // flush devtools
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush')
  }
}

/**
 * Update a component view instance
 *
 * @param {Directive} view
 * @param {Function} Component
 */

function updateView (view, Component) {
  if (!view._bound) {
    return
  }
  view.Component = Component
  view.hotUpdating = true
  // disable transitions
  view.vm._isCompiled = false
  // save state
  var state = extractState(view.childVM)
  // remount, make sure to disable keep-alive
  var keepAlive = view.keepAlive
  view.keepAlive = false
  view.mountComponent()
  view.keepAlive = keepAlive
  // restore state
  restoreState(view.childVM, state, true)
  // re-eanble transitions
  view.vm._isCompiled = true
  view.hotUpdating = false
}

/**
 * Extract state from a Vue instance.
 *
 * @param {Vue} vm
 * @return {Object}
 */

function extractState (vm) {
  return {
    cid: vm.constructor.cid,
    data: vm.$data,
    children: vm.$children.map(extractState)
  }
}

/**
 * Restore state to a reloaded Vue instance.
 *
 * @param {Vue} vm
 * @param {Object} state
 */

function restoreState (vm, state, isRoot) {
  var oldAsyncConfig
  if (isRoot) {
    // set Vue into sync mode during state rehydration
    oldAsyncConfig = Vue.config.async
    Vue.config.async = false
  }
  // actual restore
  if (isRoot || !vm._props) {
    vm.$data = state.data
  } else {
    Object.keys(state.data).forEach(function (key) {
      if (!vm._props[key]) {
        // for non-root, only restore non-props fields
        vm.$data[key] = state.data[key]
      }
    })
  }
  // verify child consistency
  var hasSameChildren = vm.$children.every(function (c, i) {
    return state.children[i] && state.children[i].cid === c.constructor.cid
  })
  if (hasSameChildren) {
    // rehydrate children
    vm.$children.forEach(function (c, i) {
      restoreState(c, state.children[i])
    })
  }
  if (isRoot) {
    Vue.config.async = oldAsyncConfig
  }
}

function format (id) {
  var match = id.match(/[^\/]+\.vue$/)
  return match ? match[0] : id
}

},{}],26:[function(require,module,exports){
/**
 * Before Interceptor.
 */

var _ = require('../util');

module.exports = {

    request: function (request) {

        if (_.isFunction(request.beforeSend)) {
            request.beforeSend.call(this, request);
        }

        return request;
    }

};

},{"../util":49}],27:[function(require,module,exports){
/**
 * Base client.
 */

var _ = require('../../util');
var Promise = require('../../promise');
var xhrClient = require('./xhr');

module.exports = function (request) {

    var response = (request.client || xhrClient)(request);

    return Promise.resolve(response).then(function (response) {

        if (response.headers) {

            var headers = parseHeaders(response.headers);

            response.headers = function (name) {

                if (name) {
                    return headers[_.toLower(name)];
                }

                return headers;
            };

        }

        response.ok = response.status >= 200 && response.status < 300;

        return response;
    });

};

function parseHeaders(str) {

    var headers = {}, value, name, i;

    if (_.isString(str)) {
        _.each(str.split('\n'), function (row) {

            i = row.indexOf(':');
            name = _.trim(_.toLower(row.slice(0, i)));
            value = _.trim(row.slice(i + 1));

            if (headers[name]) {

                if (_.isArray(headers[name])) {
                    headers[name].push(value);
                } else {
                    headers[name] = [headers[name], value];
                }

            } else {

                headers[name] = value;
            }

        });
    }

    return headers;
}

},{"../../promise":42,"../../util":49,"./xhr":30}],28:[function(require,module,exports){
/**
 * JSONP client.
 */

var _ = require('../../util');
var Promise = require('../../promise');

module.exports = function (request) {
    return new Promise(function (resolve) {

        var callback = '_jsonp' + Math.random().toString(36).substr(2), response = {request: request, data: null}, handler, script;

        request.params[request.jsonp] = callback;
        request.cancel = function () {
            handler({type: 'cancel'});
        };

        script = document.createElement('script');
        script.src = _.url(request);
        script.type = 'text/javascript';
        script.async = true;

        window[callback] = function (data) {
            response.data = data;
        };

        handler = function (event) {

            if (event.type === 'load' && response.data !== null) {
                response.status = 200;
            } else if (event.type === 'error') {
                response.status = 404;
            } else {
                response.status = 0;
            }

            resolve(response);

            delete window[callback];
            document.body.removeChild(script);
        };

        script.onload = handler;
        script.onerror = handler;

        document.body.appendChild(script);
    });
};

},{"../../promise":42,"../../util":49}],29:[function(require,module,exports){
/**
 * XDomain client (Internet Explorer).
 */

var _ = require('../../util');
var Promise = require('../../promise');

module.exports = function (request) {
    return new Promise(function (resolve) {

        var xdr = new XDomainRequest(), response = {request: request}, handler;

        request.cancel = function () {
            xdr.abort();
        };

        xdr.open(request.method, _.url(request), true);

        handler = function (event) {

            response.data = xdr.responseText;
            response.status = xdr.status;
            response.statusText = xdr.statusText;

            resolve(response);
        };

        xdr.timeout = 0;
        xdr.onload = handler;
        xdr.onabort = handler;
        xdr.onerror = handler;
        xdr.ontimeout = function () {};
        xdr.onprogress = function () {};

        xdr.send(request.data);
    });
};

},{"../../promise":42,"../../util":49}],30:[function(require,module,exports){
/**
 * XMLHttp client.
 */

var _ = require('../../util');
var Promise = require('../../promise');

module.exports = function (request) {
    return new Promise(function (resolve) {

        var xhr = new XMLHttpRequest(), response = {request: request}, handler;

        request.cancel = function () {
            xhr.abort();
        };

        xhr.open(request.method, _.url(request), true);

        if (_.isPlainObject(request.xhr)) {
            _.extend(xhr, request.xhr);
        }

        _.each(request.headers || {}, function (value, header) {
            xhr.setRequestHeader(header, value);
        });

        handler = function (event) {

            response.data = xhr.responseText;
            response.status = xhr.status;
            response.statusText = xhr.statusText;
            response.headers = xhr.getAllResponseHeaders();

            resolve(response);
        };

        xhr.onload = handler;
        xhr.onabort = handler;
        xhr.onerror = handler;

        xhr.send(request.data);
    });
};

},{"../../promise":42,"../../util":49}],31:[function(require,module,exports){
/**
 * CORS Interceptor.
 */

var _ = require('../util');
var xdrClient = require('./client/xdr');
var xhrCors = 'withCredentials' in new XMLHttpRequest();
var originUrl = _.url.parse(location.href);

module.exports = {

    request: function (request) {

        if (request.crossOrigin === null) {
            request.crossOrigin = crossOrigin(request);
        }

        if (request.crossOrigin) {

            if (!xhrCors) {
                request.client = xdrClient;
            }

            request.emulateHTTP = false;
        }

        return request;
    }

};

function crossOrigin(request) {

    var requestUrl = _.url.parse(_.url(request));

    return (requestUrl.protocol !== originUrl.protocol || requestUrl.host !== originUrl.host);
}

},{"../util":49,"./client/xdr":29}],32:[function(require,module,exports){
/**
 * Header Interceptor.
 */

var _ = require('../util');

module.exports = {

    request: function (request) {

        request.method = request.method.toUpperCase();
        request.headers = _.extend({}, _.http.headers.common,
            !request.crossOrigin ? _.http.headers.custom : {},
            _.http.headers[request.method.toLowerCase()],
            request.headers
        );

        if (_.isPlainObject(request.data) && /^(GET|JSONP)$/i.test(request.method)) {
            _.extend(request.params, request.data);
            delete request.data;
        }

        return request;
    }

};

},{"../util":49}],33:[function(require,module,exports){
/**
 * Service for sending network requests.
 */

var _ = require('../util');
var Client = require('./client');
var Promise = require('../promise');
var interceptor = require('./interceptor');
var jsonType = {'Content-Type': 'application/json'};

function Http(url, options) {

    var client = Client, request, promise;

    Http.interceptors.forEach(function (handler) {
        client = interceptor(handler, this.$vm)(client);
    }, this);

    options = _.isObject(url) ? url : _.extend({url: url}, options);
    request = _.merge({}, Http.options, this.$options, options);
    promise = client(request).bind(this.$vm).then(function (response) {

        return response.ok ? response : Promise.reject(response);

    }, function (response) {

        if (response instanceof Error) {
            _.error(response);
        }

        return Promise.reject(response);
    });

    if (request.success) {
        promise.success(request.success);
    }

    if (request.error) {
        promise.error(request.error);
    }

    return promise;
}

Http.options = {
    method: 'get',
    data: '',
    params: {},
    headers: {},
    xhr: null,
    jsonp: 'callback',
    beforeSend: null,
    crossOrigin: null,
    emulateHTTP: false,
    emulateJSON: false,
    timeout: 0
};

Http.interceptors = [
    require('./before'),
    require('./timeout'),
    require('./jsonp'),
    require('./method'),
    require('./mime'),
    require('./header'),
    require('./cors')
];

Http.headers = {
    put: jsonType,
    post: jsonType,
    patch: jsonType,
    delete: jsonType,
    common: {'Accept': 'application/json, text/plain, */*'},
    custom: {'X-Requested-With': 'XMLHttpRequest'}
};

['get', 'put', 'post', 'patch', 'delete', 'jsonp'].forEach(function (method) {

    Http[method] = function (url, data, success, options) {

        if (_.isFunction(data)) {
            options = success;
            success = data;
            data = undefined;
        }

        if (_.isObject(success)) {
            options = success;
            success = undefined;
        }

        return this(url, _.extend({method: method, data: data, success: success}, options));
    };
});

module.exports = _.http = Http;

},{"../promise":42,"../util":49,"./before":26,"./client":27,"./cors":31,"./header":32,"./interceptor":34,"./jsonp":35,"./method":36,"./mime":37,"./timeout":38}],34:[function(require,module,exports){
/**
 * Interceptor factory.
 */

var _ = require('../util');
var Promise = require('../promise');

module.exports = function (handler, vm) {

    return function (client) {

        if (_.isFunction(handler)) {
            handler = handler.call(vm, Promise);
        }

        return function (request) {

            if (_.isFunction(handler.request)) {
                request = handler.request.call(vm, request);
            }

            return when(request, function (request) {
                return when(client(request), function (response) {

                    if (_.isFunction(handler.response)) {
                        response = handler.response.call(vm, response);
                    }

                    return response;
                });
            });
        };
    };
};

function when(value, fulfilled, rejected) {

    var promise = Promise.resolve(value);

    if (arguments.length < 2) {
        return promise;
    }

    return promise.then(fulfilled, rejected);
}

},{"../promise":42,"../util":49}],35:[function(require,module,exports){
/**
 * JSONP Interceptor.
 */

var jsonpClient = require('./client/jsonp');

module.exports = {

    request: function (request) {

        if (request.method == 'JSONP') {
            request.client = jsonpClient;
        }

        return request;
    }

};

},{"./client/jsonp":28}],36:[function(require,module,exports){
/**
 * HTTP method override Interceptor.
 */

module.exports = {

    request: function (request) {

        if (request.emulateHTTP && /^(PUT|PATCH|DELETE)$/i.test(request.method)) {
            request.headers['X-HTTP-Method-Override'] = request.method;
            request.method = 'POST';
        }

        return request;
    }

};

},{}],37:[function(require,module,exports){
/**
 * Mime Interceptor.
 */

var _ = require('../util');

module.exports = {

    request: function (request) {

        if (request.emulateJSON && _.isPlainObject(request.data)) {
            request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            request.data = _.url.params(request.data);
        }

        if (_.isObject(request.data) && /FormData/i.test(request.data.toString())) {
            delete request.headers['Content-Type'];
        }

        if (_.isPlainObject(request.data)) {
            request.data = JSON.stringify(request.data);
        }

        return request;
    },

    response: function (response) {

        try {
            response.data = JSON.parse(response.data);
        } catch (e) {}

        return response;
    }

};

},{"../util":49}],38:[function(require,module,exports){
/**
 * Timeout Interceptor.
 */

module.exports = function () {

    var timeout;

    return {

        request: function (request) {

            if (request.timeout) {
                timeout = setTimeout(function () {
                    request.cancel();
                }, request.timeout);
            }

            return request;
        },

        response: function (response) {

            clearTimeout(timeout);

            return response;
        }

    };
};

},{}],39:[function(require,module,exports){
/**
 * Install plugin.
 */

function install(Vue) {

    var _ = require('./util');

    _.config = Vue.config;
    _.warning = Vue.util.warn;
    _.nextTick = Vue.util.nextTick;

    Vue.url = require('./url');
    Vue.http = require('./http');
    Vue.resource = require('./resource');
    Vue.Promise = require('./promise');

    Object.defineProperties(Vue.prototype, {

        $url: {
            get: function () {
                return _.options(Vue.url, this, this.$options.url);
            }
        },

        $http: {
            get: function () {
                return _.options(Vue.http, this, this.$options.http);
            }
        },

        $resource: {
            get: function () {
                return Vue.resource.bind(this);
            }
        },

        $promise: {
            get: function () {
                return function (executor) {
                    return new Vue.Promise(executor, this);
                }.bind(this);
            }
        }

    });
}

if (window.Vue) {
    Vue.use(install);
}

module.exports = install;

},{"./http":33,"./promise":42,"./resource":43,"./url":44,"./util":49}],40:[function(require,module,exports){
/**
 * Promises/A+ polyfill v1.1.4 (https://github.com/bramstein/promis)
 */

var _ = require('../util');

var RESOLVED = 0;
var REJECTED = 1;
var PENDING  = 2;

function Promise(executor) {

    this.state = PENDING;
    this.value = undefined;
    this.deferred = [];

    var promise = this;

    try {
        executor(function (x) {
            promise.resolve(x);
        }, function (r) {
            promise.reject(r);
        });
    } catch (e) {
        promise.reject(e);
    }
}

Promise.reject = function (r) {
    return new Promise(function (resolve, reject) {
        reject(r);
    });
};

Promise.resolve = function (x) {
    return new Promise(function (resolve, reject) {
        resolve(x);
    });
};

Promise.all = function all(iterable) {
    return new Promise(function (resolve, reject) {
        var count = 0, result = [];

        if (iterable.length === 0) {
            resolve(result);
        }

        function resolver(i) {
            return function (x) {
                result[i] = x;
                count += 1;

                if (count === iterable.length) {
                    resolve(result);
                }
            };
        }

        for (var i = 0; i < iterable.length; i += 1) {
            Promise.resolve(iterable[i]).then(resolver(i), reject);
        }
    });
};

Promise.race = function race(iterable) {
    return new Promise(function (resolve, reject) {
        for (var i = 0; i < iterable.length; i += 1) {
            Promise.resolve(iterable[i]).then(resolve, reject);
        }
    });
};

var p = Promise.prototype;

p.resolve = function resolve(x) {
    var promise = this;

    if (promise.state === PENDING) {
        if (x === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        var called = false;

        try {
            var then = x && x['then'];

            if (x !== null && typeof x === 'object' && typeof then === 'function') {
                then.call(x, function (x) {
                    if (!called) {
                        promise.resolve(x);
                    }
                    called = true;

                }, function (r) {
                    if (!called) {
                        promise.reject(r);
                    }
                    called = true;
                });
                return;
            }
        } catch (e) {
            if (!called) {
                promise.reject(e);
            }
            return;
        }

        promise.state = RESOLVED;
        promise.value = x;
        promise.notify();
    }
};

p.reject = function reject(reason) {
    var promise = this;

    if (promise.state === PENDING) {
        if (reason === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        promise.state = REJECTED;
        promise.value = reason;
        promise.notify();
    }
};

p.notify = function notify() {
    var promise = this;

    _.nextTick(function () {
        if (promise.state !== PENDING) {
            while (promise.deferred.length) {
                var deferred = promise.deferred.shift(),
                    onResolved = deferred[0],
                    onRejected = deferred[1],
                    resolve = deferred[2],
                    reject = deferred[3];

                try {
                    if (promise.state === RESOLVED) {
                        if (typeof onResolved === 'function') {
                            resolve(onResolved.call(undefined, promise.value));
                        } else {
                            resolve(promise.value);
                        }
                    } else if (promise.state === REJECTED) {
                        if (typeof onRejected === 'function') {
                            resolve(onRejected.call(undefined, promise.value));
                        } else {
                            reject(promise.value);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            }
        }
    });
};

p.then = function then(onResolved, onRejected) {
    var promise = this;

    return new Promise(function (resolve, reject) {
        promise.deferred.push([onResolved, onRejected, resolve, reject]);
        promise.notify();
    });
};

p.catch = function (onRejected) {
    return this.then(undefined, onRejected);
};

module.exports = Promise;

},{"../util":49}],41:[function(require,module,exports){
/**
 * URL Template v2.0.6 (https://github.com/bramstein/url-template)
 */

exports.expand = function (url, params, variables) {

    var tmpl = this.parse(url), expanded = tmpl.expand(params);

    if (variables) {
        variables.push.apply(variables, tmpl.vars);
    }

    return expanded;
};

exports.parse = function (template) {

    var operators = ['+', '#', '.', '/', ';', '?', '&'], variables = [];

    return {
        vars: variables,
        expand: function (context) {
            return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
                if (expression) {

                    var operator = null, values = [];

                    if (operators.indexOf(expression.charAt(0)) !== -1) {
                        operator = expression.charAt(0);
                        expression = expression.substr(1);
                    }

                    expression.split(/,/g).forEach(function (variable) {
                        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                        values.push.apply(values, exports.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                        variables.push(tmp[1]);
                    });

                    if (operator && operator !== '+') {

                        var separator = ',';

                        if (operator === '?') {
                            separator = '&';
                        } else if (operator !== '#') {
                            separator = operator;
                        }

                        return (values.length !== 0 ? operator : '') + values.join(separator);
                    } else {
                        return values.join(',');
                    }

                } else {
                    return exports.encodeReserved(literal);
                }
            });
        }
    };
};

exports.getValues = function (context, operator, key, modifier) {

    var value = context[key], result = [];

    if (this.isDefined(value) && value !== '') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            value = value.toString();

            if (modifier && modifier !== '*') {
                value = value.substring(0, parseInt(modifier, 10));
            }

            result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
        } else {
            if (modifier === '*') {
                if (Array.isArray(value)) {
                    value.filter(this.isDefined).forEach(function (value) {
                        result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
                    }, this);
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (this.isDefined(value[k])) {
                            result.push(this.encodeValue(operator, value[k], k));
                        }
                    }, this);
                }
            } else {
                var tmp = [];

                if (Array.isArray(value)) {
                    value.filter(this.isDefined).forEach(function (value) {
                        tmp.push(this.encodeValue(operator, value));
                    }, this);
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (this.isDefined(value[k])) {
                            tmp.push(encodeURIComponent(k));
                            tmp.push(this.encodeValue(operator, value[k].toString()));
                        }
                    }, this);
                }

                if (this.isKeyOperator(operator)) {
                    result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                } else if (tmp.length !== 0) {
                    result.push(tmp.join(','));
                }
            }
        }
    } else {
        if (operator === ';') {
            result.push(encodeURIComponent(key));
        } else if (value === '' && (operator === '&' || operator === '?')) {
            result.push(encodeURIComponent(key) + '=');
        } else if (value === '') {
            result.push('');
        }
    }

    return result;
};

exports.isDefined = function (value) {
    return value !== undefined && value !== null;
};

exports.isKeyOperator = function (operator) {
    return operator === ';' || operator === '&' || operator === '?';
};

exports.encodeValue = function (operator, value, key) {

    value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : encodeURIComponent(value);

    if (key) {
        return encodeURIComponent(key) + '=' + value;
    } else {
        return value;
    }
};

exports.encodeReserved = function (str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
        if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part);
        }
        return part;
    }).join('');
};

},{}],42:[function(require,module,exports){
/**
 * Promise adapter.
 */

var _ = require('./util');
var PromiseObj = window.Promise || require('./lib/promise');

function Promise(executor, context) {

    if (executor instanceof PromiseObj) {
        this.promise = executor;
    } else {
        this.promise = new PromiseObj(executor.bind(context));
    }

    this.context = context;
}

Promise.all = function (iterable, context) {
    return new Promise(PromiseObj.all(iterable), context);
};

Promise.resolve = function (value, context) {
    return new Promise(PromiseObj.resolve(value), context);
};

Promise.reject = function (reason, context) {
    return new Promise(PromiseObj.reject(reason), context);
};

Promise.race = function (iterable, context) {
    return new Promise(PromiseObj.race(iterable), context);
};

var p = Promise.prototype;

p.bind = function (context) {
    this.context = context;
    return this;
};

p.then = function (fulfilled, rejected) {

    if (fulfilled && fulfilled.bind && this.context) {
        fulfilled = fulfilled.bind(this.context);
    }

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    this.promise = this.promise.then(fulfilled, rejected);

    return this;
};

p.catch = function (rejected) {

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    this.promise = this.promise.catch(rejected);

    return this;
};

p.finally = function (callback) {

    return this.then(function (value) {
            callback.call(this);
            return value;
        }, function (reason) {
            callback.call(this);
            return PromiseObj.reject(reason);
        }
    );
};

p.success = function (callback) {

    _.warn('The `success` method has been deprecated. Use the `then` method instead.');

    return this.then(function (response) {
        return callback.call(this, response.data, response.status, response) || response;
    });
};

p.error = function (callback) {

    _.warn('The `error` method has been deprecated. Use the `catch` method instead.');

    return this.catch(function (response) {
        return callback.call(this, response.data, response.status, response) || response;
    });
};

p.always = function (callback) {

    _.warn('The `always` method has been deprecated. Use the `finally` method instead.');

    var cb = function (response) {
        return callback.call(this, response.data, response.status, response) || response;
    };

    return this.then(cb, cb);
};

module.exports = Promise;

},{"./lib/promise":40,"./util":49}],43:[function(require,module,exports){
/**
 * Service for interacting with RESTful services.
 */

var _ = require('./util');

function Resource(url, params, actions, options) {

    var self = this, resource = {};

    actions = _.extend({},
        Resource.actions,
        actions
    );

    _.each(actions, function (action, name) {

        action = _.merge({url: url, params: params || {}}, options, action);

        resource[name] = function () {
            return (self.$http || _.http)(opts(action, arguments));
        };
    });

    return resource;
}

function opts(action, args) {

    var options = _.extend({}, action), params = {}, data, success, error;

    switch (args.length) {

        case 4:

            error = args[3];
            success = args[2];

        case 3:
        case 2:

            if (_.isFunction(args[1])) {

                if (_.isFunction(args[0])) {

                    success = args[0];
                    error = args[1];

                    break;
                }

                success = args[1];
                error = args[2];

            } else {

                params = args[0];
                data = args[1];
                success = args[2];

                break;
            }

        case 1:

            if (_.isFunction(args[0])) {
                success = args[0];
            } else if (/^(POST|PUT|PATCH)$/i.test(options.method)) {
                data = args[0];
            } else {
                params = args[0];
            }

            break;

        case 0:

            break;

        default:

            throw 'Expected up to 4 arguments [params, data, success, error], got ' + args.length + ' arguments';
    }

    options.data = data;
    options.params = _.extend({}, options.params, params);

    if (success) {
        options.success = success;
    }

    if (error) {
        options.error = error;
    }

    return options;
}

Resource.actions = {

    get: {method: 'GET'},
    save: {method: 'POST'},
    query: {method: 'GET'},
    update: {method: 'PUT'},
    remove: {method: 'DELETE'},
    delete: {method: 'DELETE'}

};

module.exports = _.resource = Resource;

},{"./util":49}],44:[function(require,module,exports){
/**
 * Service for URL templating.
 */

var _ = require('../util');
var ie = document.documentMode;
var el = document.createElement('a');

function Url(url, params) {

    var options = url, transform;

    if (_.isString(url)) {
        options = {url: url, params: params};
    }

    options = _.merge({}, Url.options, this.$options, options);

    Url.transforms.forEach(function (handler) {
        transform = factory(handler, transform, this.$vm);
    }, this);

    return transform(options);
};

/**
 * Url options.
 */

Url.options = {
    url: '',
    root: null,
    params: {}
};

/**
 * Url transforms.
 */

Url.transforms = [
    require('./template'),
    require('./legacy'),
    require('./query'),
    require('./root')
];

/**
 * Encodes a Url parameter string.
 *
 * @param {Object} obj
 */

Url.params = function (obj) {

    var params = [], escape = encodeURIComponent;

    params.add = function (key, value) {

        if (_.isFunction(value)) {
            value = value();
        }

        if (value === null) {
            value = '';
        }

        this.push(escape(key) + '=' + escape(value));
    };

    serialize(params, obj);

    return params.join('&').replace(/%20/g, '+');
};

/**
 * Parse a URL and return its components.
 *
 * @param {String} url
 */

Url.parse = function (url) {

    if (ie) {
        el.href = url;
        url = el.href;
    }

    el.href = url;

    return {
        href: el.href,
        protocol: el.protocol ? el.protocol.replace(/:$/, '') : '',
        port: el.port,
        host: el.host,
        hostname: el.hostname,
        pathname: el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname,
        search: el.search ? el.search.replace(/^\?/, '') : '',
        hash: el.hash ? el.hash.replace(/^#/, '') : ''
    };
};

function factory(handler, next, vm) {
    return function (options) {
        return handler.call(vm, options, next);
    };
}

function serialize(params, obj, scope) {

    var array = _.isArray(obj), plain = _.isPlainObject(obj), hash;

    _.each(obj, function (value, key) {

        hash = _.isObject(value) || _.isArray(value);

        if (scope) {
            key = scope + '[' + (plain || hash ? key : '') + ']';
        }

        if (!scope && array) {
            params.add(value.name, value.value);
        } else if (hash) {
            serialize(params, value, key);
        } else {
            params.add(key, value);
        }
    });
}

module.exports = _.url = Url;

},{"../util":49,"./legacy":45,"./query":46,"./root":47,"./template":48}],45:[function(require,module,exports){
/**
 * Legacy Transform.
 */

var _ = require('../util');

module.exports = function (options, next) {

    var variables = [], url = next(options);

    url = url.replace(/(\/?):([a-z]\w*)/gi, function (match, slash, name) {

        _.warn('The `:' + name + '` parameter syntax has been deprecated. Use the `{' + name + '}` syntax instead.');

        if (options.params[name]) {
            variables.push(name);
            return slash + encodeUriSegment(options.params[name]);
        }

        return '';
    });

    variables.forEach(function (key) {
        delete options.params[key];
    });

    return url;
};

function encodeUriSegment(value) {

    return encodeUriQuery(value, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}

function encodeUriQuery(value, spaces) {

    return encodeURIComponent(value).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (spaces ? '%20' : '+'));
}

},{"../util":49}],46:[function(require,module,exports){
/**
 * Query Parameter Transform.
 */

var _ = require('../util');

module.exports = function (options, next) {

    var urlParams = Object.keys(_.url.options.params), query = {}, url = next(options);

   _.each(options.params, function (value, key) {
        if (urlParams.indexOf(key) === -1) {
            query[key] = value;
        }
    });

    query = _.url.params(query);

    if (query) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + query;
    }

    return url;
};

},{"../util":49}],47:[function(require,module,exports){
/**
 * Root Prefix Transform.
 */

var _ = require('../util');

module.exports = function (options, next) {

    var url = next(options);

    if (_.isString(options.root) && !url.match(/^(https?:)?\//)) {
        url = options.root + '/' + url;
    }

    return url;
};

},{"../util":49}],48:[function(require,module,exports){
/**
 * URL Template (RFC 6570) Transform.
 */

var UrlTemplate = require('../lib/url-template');

module.exports = function (options) {

    var variables = [], url = UrlTemplate.expand(options.url, options.params, variables);

    variables.forEach(function (key) {
        delete options.params[key];
    });

    return url;
};

},{"../lib/url-template":41}],49:[function(require,module,exports){
/**
 * Utility functions.
 */

var _ = exports, array = [], console = window.console;

_.warn = function (msg) {
    if (console && _.warning && (!_.config.silent || _.config.debug)) {
        console.warn('[VueResource warn]: ' + msg);
    }
};

_.error = function (msg) {
    if (console) {
        console.error(msg);
    }
};

_.trim = function (str) {
    return str.replace(/^\s*|\s*$/g, '');
};

_.toLower = function (str) {
    return str ? str.toLowerCase() : '';
};

_.isArray = Array.isArray;

_.isString = function (val) {
    return typeof val === 'string';
};

_.isFunction = function (val) {
    return typeof val === 'function';
};

_.isObject = function (obj) {
    return obj !== null && typeof obj === 'object';
};

_.isPlainObject = function (obj) {
    return _.isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype;
};

_.options = function (fn, obj, options) {

    options = options || {};

    if (_.isFunction(options)) {
        options = options.call(obj);
    }

    return _.merge(fn.bind({$vm: obj, $options: options}), fn, {$options: options});
};

_.each = function (obj, iterator) {

    var i, key;

    if (typeof obj.length == 'number') {
        for (i = 0; i < obj.length; i++) {
            iterator.call(obj[i], obj[i], i);
        }
    } else if (_.isObject(obj)) {
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                iterator.call(obj[key], obj[key], key);
            }
        }
    }

    return obj;
};

_.defaults = function (target, source) {

    for (var key in source) {
        if (target[key] === undefined) {
            target[key] = source[key];
        }
    }

    return target;
};

_.extend = function (target) {

    var args = array.slice.call(arguments, 1);

    args.forEach(function (arg) {
        merge(target, arg);
    });

    return target;
};

_.merge = function (target) {

    var args = array.slice.call(arguments, 1);

    args.forEach(function (arg) {
        merge(target, arg, true);
    });

    return target;
};

function merge(target, source, deep) {
    for (var key in source) {
        if (deep && (_.isPlainObject(source[key]) || _.isArray(source[key]))) {
            if (_.isPlainObject(source[key]) && !_.isPlainObject(target[key])) {
                target[key] = {};
            }
            if (_.isArray(source[key]) && !_.isArray(target[key])) {
                target[key] = [];
            }
            merge(target[key], source[key], deep);
        } else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}

},{}],50:[function(require,module,exports){
/*!
 * vue-router v0.7.13
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.VueRouter = factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  function Target(path, matcher, delegate) {
    this.path = path;
    this.matcher = matcher;
    this.delegate = delegate;
  }

  Target.prototype = {
    to: function to(target, callback) {
      var delegate = this.delegate;

      if (delegate && delegate.willAddRoute) {
        target = delegate.willAddRoute(this.matcher.target, target);
      }

      this.matcher.add(this.path, target);

      if (callback) {
        if (callback.length === 0) {
          throw new Error("You must have an argument in the function passed to `to`");
        }
        this.matcher.addChild(this.path, target, callback, this.delegate);
      }
      return this;
    }
  };

  function Matcher(target) {
    this.routes = {};
    this.children = {};
    this.target = target;
  }

  Matcher.prototype = {
    add: function add(path, handler) {
      this.routes[path] = handler;
    },

    addChild: function addChild(path, target, callback, delegate) {
      var matcher = new Matcher(target);
      this.children[path] = matcher;

      var match = generateMatch(path, matcher, delegate);

      if (delegate && delegate.contextEntered) {
        delegate.contextEntered(target, match);
      }

      callback(match);
    }
  };

  function generateMatch(startingPath, matcher, delegate) {
    return function (path, nestedCallback) {
      var fullPath = startingPath + path;

      if (nestedCallback) {
        nestedCallback(generateMatch(fullPath, matcher, delegate));
      } else {
        return new Target(startingPath + path, matcher, delegate);
      }
    };
  }

  function addRoute(routeArray, path, handler) {
    var len = 0;
    for (var i = 0, l = routeArray.length; i < l; i++) {
      len += routeArray[i].path.length;
    }

    path = path.substr(len);
    var route = { path: path, handler: handler };
    routeArray.push(route);
  }

  function eachRoute(baseRoute, matcher, callback, binding) {
    var routes = matcher.routes;

    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        var routeArray = baseRoute.slice();
        addRoute(routeArray, path, routes[path]);

        if (matcher.children[path]) {
          eachRoute(routeArray, matcher.children[path], callback, binding);
        } else {
          callback.call(binding, routeArray);
        }
      }
    }
  }

  function map (callback, addRouteCallback) {
    var matcher = new Matcher();

    callback(generateMatch("", matcher, this.delegate));

    eachRoute([], matcher, function (route) {
      if (addRouteCallback) {
        addRouteCallback(this, route);
      } else {
        this.add(route);
      }
    }, this);
  }

  var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

  var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

  var noWarning = false;
  function warn(msg) {
    if (!noWarning && typeof console !== 'undefined') {
      console.error('[vue-router] ' + msg);
    }
  }

  function tryDecode(uri, asComponent) {
    try {
      return asComponent ? decodeURIComponent(uri) : decodeURI(uri);
    } catch (e) {
      warn('malformed URI' + (asComponent ? ' component: ' : ': ') + uri);
    }
  }

  function isArray(test) {
    return Object.prototype.toString.call(test) === "[object Array]";
  }

  // A Segment represents a segment in the original route description.
  // Each Segment type provides an `eachChar` and `regex` method.
  //
  // The `eachChar` method invokes the callback with one or more character
  // specifications. A character specification consumes one or more input
  // characters.
  //
  // The `regex` method returns a regex fragment for the segment. If the
  // segment is a dynamic of star segment, the regex fragment also includes
  // a capture.
  //
  // A character specification contains:
  //
  // * `validChars`: a String with a list of all valid characters, or
  // * `invalidChars`: a String with a list of all invalid characters
  // * `repeat`: true if the character specification can repeat

  function StaticSegment(string) {
    this.string = string;
  }
  StaticSegment.prototype = {
    eachChar: function eachChar(callback) {
      var string = this.string,
          ch;

      for (var i = 0, l = string.length; i < l; i++) {
        ch = string.charAt(i);
        callback({ validChars: ch });
      }
    },

    regex: function regex() {
      return this.string.replace(escapeRegex, '\\$1');
    },

    generate: function generate() {
      return this.string;
    }
  };

  function DynamicSegment(name) {
    this.name = name;
  }
  DynamicSegment.prototype = {
    eachChar: function eachChar(callback) {
      callback({ invalidChars: "/", repeat: true });
    },

    regex: function regex() {
      return "([^/]+)";
    },

    generate: function generate(params) {
      var val = params[this.name];
      return val == null ? ":" + this.name : val;
    }
  };

  function StarSegment(name) {
    this.name = name;
  }
  StarSegment.prototype = {
    eachChar: function eachChar(callback) {
      callback({ invalidChars: "", repeat: true });
    },

    regex: function regex() {
      return "(.+)";
    },

    generate: function generate(params) {
      var val = params[this.name];
      return val == null ? ":" + this.name : val;
    }
  };

  function EpsilonSegment() {}
  EpsilonSegment.prototype = {
    eachChar: function eachChar() {},
    regex: function regex() {
      return "";
    },
    generate: function generate() {
      return "";
    }
  };

  function parse(route, names, specificity) {
    // normalize route as not starting with a "/". Recognition will
    // also normalize.
    if (route.charAt(0) === "/") {
      route = route.substr(1);
    }

    var segments = route.split("/"),
        results = [];

    // A routes has specificity determined by the order that its different segments
    // appear in. This system mirrors how the magnitude of numbers written as strings
    // works.
    // Consider a number written as: "abc". An example would be "200". Any other number written
    // "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
    // then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
    // of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
    // leading symbol, "1".
    // The rule is that symbols to the left carry more weight than symbols to the right
    // when a number is written out as a string. In the above strings, the leading digit
    // represents how many 100's are in the number, and it carries more weight than the middle
    // number which represents how many 10's are in the number.
    // This system of number magnitude works well for route specificity, too. A route written as
    // `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
    // `x`, irrespective of the other parts.
    // Because of this similarity, we assign each type of segment a number value written as a
    // string. We can find the specificity of compound routes by concatenating these strings
    // together, from left to right. After we have looped through all of the segments,
    // we convert the string to a number.
    specificity.val = '';

    for (var i = 0, l = segments.length; i < l; i++) {
      var segment = segments[i],
          match;

      if (match = segment.match(/^:([^\/]+)$/)) {
        results.push(new DynamicSegment(match[1]));
        names.push(match[1]);
        specificity.val += '3';
      } else if (match = segment.match(/^\*([^\/]+)$/)) {
        results.push(new StarSegment(match[1]));
        specificity.val += '2';
        names.push(match[1]);
      } else if (segment === "") {
        results.push(new EpsilonSegment());
        specificity.val += '1';
      } else {
        results.push(new StaticSegment(segment));
        specificity.val += '4';
      }
    }

    specificity.val = +specificity.val;

    return results;
  }

  // A State has a character specification and (`charSpec`) and a list of possible
  // subsequent states (`nextStates`).
  //
  // If a State is an accepting state, it will also have several additional
  // properties:
  //
  // * `regex`: A regular expression that is used to extract parameters from paths
  //   that reached this accepting state.
  // * `handlers`: Information on how to convert the list of captures into calls
  //   to registered handlers with the specified parameters
  // * `types`: How many static, dynamic or star segments in this route. Used to
  //   decide which route to use if multiple registered routes match a path.
  //
  // Currently, State is implemented naively by looping over `nextStates` and
  // comparing a character specification against a character. A more efficient
  // implementation would use a hash of keys pointing at one or more next states.

  function State(charSpec) {
    this.charSpec = charSpec;
    this.nextStates = [];
  }

  State.prototype = {
    get: function get(charSpec) {
      var nextStates = this.nextStates;

      for (var i = 0, l = nextStates.length; i < l; i++) {
        var child = nextStates[i];

        var isEqual = child.charSpec.validChars === charSpec.validChars;
        isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

        if (isEqual) {
          return child;
        }
      }
    },

    put: function put(charSpec) {
      var state;

      // If the character specification already exists in a child of the current
      // state, just return that state.
      if (state = this.get(charSpec)) {
        return state;
      }

      // Make a new state for the character spec
      state = new State(charSpec);

      // Insert the new state as a child of the current state
      this.nextStates.push(state);

      // If this character specification repeats, insert the new state as a child
      // of itself. Note that this will not trigger an infinite loop because each
      // transition during recognition consumes a character.
      if (charSpec.repeat) {
        state.nextStates.push(state);
      }

      // Return the new state
      return state;
    },

    // Find a list of child states matching the next character
    match: function match(ch) {
      // DEBUG "Processing `" + ch + "`:"
      var nextStates = this.nextStates,
          child,
          charSpec,
          chars;

      // DEBUG "  " + debugState(this)
      var returned = [];

      for (var i = 0, l = nextStates.length; i < l; i++) {
        child = nextStates[i];

        charSpec = child.charSpec;

        if (typeof (chars = charSpec.validChars) !== 'undefined') {
          if (chars.indexOf(ch) !== -1) {
            returned.push(child);
          }
        } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
          if (chars.indexOf(ch) === -1) {
            returned.push(child);
          }
        }
      }

      return returned;
    }

    /** IF DEBUG
    , debug: function() {
      var charSpec = this.charSpec,
          debug = "[",
          chars = charSpec.validChars || charSpec.invalidChars;
       if (charSpec.invalidChars) { debug += "^"; }
      debug += chars;
      debug += "]";
       if (charSpec.repeat) { debug += "+"; }
       return debug;
    }
    END IF **/
  };

  /** IF DEBUG
  function debug(log) {
    console.log(log);
  }

  function debugState(state) {
    return state.nextStates.map(function(n) {
      if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
      return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
    }).join(", ")
  }
  END IF **/

  // Sort the routes by specificity
  function sortSolutions(states) {
    return states.sort(function (a, b) {
      return b.specificity.val - a.specificity.val;
    });
  }

  function recognizeChar(states, ch) {
    var nextStates = [];

    for (var i = 0, l = states.length; i < l; i++) {
      var state = states[i];

      nextStates = nextStates.concat(state.match(ch));
    }

    return nextStates;
  }

  var oCreate = Object.create || function (proto) {
    function F() {}
    F.prototype = proto;
    return new F();
  };

  function RecognizeResults(queryParams) {
    this.queryParams = queryParams || {};
  }
  RecognizeResults.prototype = oCreate({
    splice: Array.prototype.splice,
    slice: Array.prototype.slice,
    push: Array.prototype.push,
    length: 0,
    queryParams: null
  });

  function findHandler(state, path, queryParams) {
    var handlers = state.handlers,
        regex = state.regex;
    var captures = path.match(regex),
        currentCapture = 1;
    var result = new RecognizeResults(queryParams);

    for (var i = 0, l = handlers.length; i < l; i++) {
      var handler = handlers[i],
          names = handler.names,
          params = {};

      for (var j = 0, m = names.length; j < m; j++) {
        params[names[j]] = captures[currentCapture++];
      }

      result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
    }

    return result;
  }

  function addSegment(currentState, segment) {
    segment.eachChar(function (ch) {
      var state;

      currentState = currentState.put(ch);
    });

    return currentState;
  }

  function decodeQueryParamPart(part) {
    // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
    part = part.replace(/\+/gm, '%20');
    return tryDecode(part, true);
  }

  // The main interface

  var RouteRecognizer = function RouteRecognizer() {
    this.rootState = new State();
    this.names = {};
  };

  RouteRecognizer.prototype = {
    add: function add(routes, options) {
      var currentState = this.rootState,
          regex = "^",
          specificity = {},
          handlers = [],
          allSegments = [],
          name;

      var isEmpty = true;

      for (var i = 0, l = routes.length; i < l; i++) {
        var route = routes[i],
            names = [];

        var segments = parse(route.path, names, specificity);

        allSegments = allSegments.concat(segments);

        for (var j = 0, m = segments.length; j < m; j++) {
          var segment = segments[j];

          if (segment instanceof EpsilonSegment) {
            continue;
          }

          isEmpty = false;

          // Add a "/" for the new segment
          currentState = currentState.put({ validChars: "/" });
          regex += "/";

          // Add a representation of the segment to the NFA and regex
          currentState = addSegment(currentState, segment);
          regex += segment.regex();
        }

        var handler = { handler: route.handler, names: names };
        handlers.push(handler);
      }

      if (isEmpty) {
        currentState = currentState.put({ validChars: "/" });
        regex += "/";
      }

      currentState.handlers = handlers;
      currentState.regex = new RegExp(regex + "$");
      currentState.specificity = specificity;

      if (name = options && options.as) {
        this.names[name] = {
          segments: allSegments,
          handlers: handlers
        };
      }
    },

    handlersFor: function handlersFor(name) {
      var route = this.names[name],
          result = [];
      if (!route) {
        throw new Error("There is no route named " + name);
      }

      for (var i = 0, l = route.handlers.length; i < l; i++) {
        result.push(route.handlers[i]);
      }

      return result;
    },

    hasRoute: function hasRoute(name) {
      return !!this.names[name];
    },

    generate: function generate(name, params) {
      var route = this.names[name],
          output = "";
      if (!route) {
        throw new Error("There is no route named " + name);
      }

      var segments = route.segments;

      for (var i = 0, l = segments.length; i < l; i++) {
        var segment = segments[i];

        if (segment instanceof EpsilonSegment) {
          continue;
        }

        output += "/";
        output += segment.generate(params);
      }

      if (output.charAt(0) !== '/') {
        output = '/' + output;
      }

      if (params && params.queryParams) {
        output += this.generateQueryString(params.queryParams);
      }

      return output;
    },

    generateQueryString: function generateQueryString(params) {
      var pairs = [];
      var keys = [];
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      keys.sort();
      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        var value = params[key];
        if (value == null) {
          continue;
        }
        var pair = encodeURIComponent(key);
        if (isArray(value)) {
          for (var j = 0, l = value.length; j < l; j++) {
            var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
            pairs.push(arrayPair);
          }
        } else {
          pair += "=" + encodeURIComponent(value);
          pairs.push(pair);
        }
      }

      if (pairs.length === 0) {
        return '';
      }

      return "?" + pairs.join("&");
    },

    parseQueryString: function parseQueryString(queryString) {
      var pairs = queryString.split("&"),
          queryParams = {};
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('='),
            key = decodeQueryParamPart(pair[0]),
            keyLength = key.length,
            isArray = false,
            value;
        if (pair.length === 1) {
          value = 'true';
        } else {
          //Handle arrays
          if (keyLength > 2 && key.slice(keyLength - 2) === '[]') {
            isArray = true;
            key = key.slice(0, keyLength - 2);
            if (!queryParams[key]) {
              queryParams[key] = [];
            }
          }
          value = pair[1] ? decodeQueryParamPart(pair[1]) : '';
        }
        if (isArray) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = value;
        }
      }
      return queryParams;
    },

    recognize: function recognize(path, silent) {
      noWarning = silent;
      var states = [this.rootState],
          pathLen,
          i,
          l,
          queryStart,
          queryParams = {},
          isSlashDropped = false;

      queryStart = path.indexOf('?');
      if (queryStart !== -1) {
        var queryString = path.substr(queryStart + 1, path.length);
        path = path.substr(0, queryStart);
        if (queryString) {
          queryParams = this.parseQueryString(queryString);
        }
      }

      path = tryDecode(path);
      if (!path) return;

      // DEBUG GROUP path

      if (path.charAt(0) !== "/") {
        path = "/" + path;
      }

      pathLen = path.length;
      if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
        path = path.substr(0, pathLen - 1);
        isSlashDropped = true;
      }

      for (i = 0, l = path.length; i < l; i++) {
        states = recognizeChar(states, path.charAt(i));
        if (!states.length) {
          break;
        }
      }

      // END DEBUG GROUP

      var solutions = [];
      for (i = 0, l = states.length; i < l; i++) {
        if (states[i].handlers) {
          solutions.push(states[i]);
        }
      }

      states = sortSolutions(solutions);

      var state = solutions[0];

      if (state && state.handlers) {
        // if a trailing slash was dropped and a star segment is the last segment
        // specified, put the trailing slash back
        if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
          path = path + "/";
        }
        return findHandler(state, path, queryParams);
      }
    }
  };

  RouteRecognizer.prototype.map = map;

  var genQuery = RouteRecognizer.prototype.generateQueryString;

  // export default for holding the Vue reference
  var exports$1 = {};
  /**
   * Warn stuff.
   *
   * @param {String} msg
   */

  function warn$1(msg) {
    /* istanbul ignore next */
    if (typeof console !== 'undefined') {
      console.error('[vue-router] ' + msg);
    }
  }

  /**
   * Resolve a relative path.
   *
   * @param {String} base
   * @param {String} relative
   * @param {Boolean} append
   * @return {String}
   */

  function resolvePath(base, relative, append) {
    var query = base.match(/(\?.*)$/);
    if (query) {
      query = query[1];
      base = base.slice(0, -query.length);
    }
    // a query!
    if (relative.charAt(0) === '?') {
      return base + relative;
    }
    var stack = base.split('/');
    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }
    // resolve relative path
    var segments = relative.replace(/^\//, '').split('/');
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment === '.') {
        continue;
      } else if (segment === '..') {
        stack.pop();
      } else {
        stack.push(segment);
      }
    }
    // ensure leading slash
    if (stack[0] !== '') {
      stack.unshift('');
    }
    return stack.join('/');
  }

  /**
   * Forgiving check for a promise
   *
   * @param {Object} p
   * @return {Boolean}
   */

  function isPromise(p) {
    return p && typeof p.then === 'function';
  }

  /**
   * Retrive a route config field from a component instance
   * OR a component contructor.
   *
   * @param {Function|Vue} component
   * @param {String} name
   * @return {*}
   */

  function getRouteConfig(component, name) {
    var options = component && (component.$options || component.options);
    return options && options.route && options.route[name];
  }

  /**
   * Resolve an async component factory. Have to do a dirty
   * mock here because of Vue core's internal API depends on
   * an ID check.
   *
   * @param {Object} handler
   * @param {Function} cb
   */

  var resolver = undefined;

  function resolveAsyncComponent(handler, cb) {
    if (!resolver) {
      resolver = {
        resolve: exports$1.Vue.prototype._resolveComponent,
        $options: {
          components: {
            _: handler.component
          }
        }
      };
    } else {
      resolver.$options.components._ = handler.component;
    }
    resolver.resolve('_', function (Component) {
      handler.component = Component;
      cb(Component);
    });
  }

  /**
   * Map the dynamic segments in a path to params.
   *
   * @param {String} path
   * @param {Object} params
   * @param {Object} query
   */

  function mapParams(path, params, query) {
    if (params === undefined) params = {};

    path = path.replace(/:([^\/]+)/g, function (_, key) {
      var val = params[key];
      /* istanbul ignore if */
      if (!val) {
        warn$1('param "' + key + '" not found when generating ' + 'path for "' + path + '" with params ' + JSON.stringify(params));
      }
      return val || '';
    });
    if (query) {
      path += genQuery(query);
    }
    return path;
  }

  var hashRE = /#.*$/;

  var HTML5History = (function () {
    function HTML5History(_ref) {
      var root = _ref.root;
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, HTML5History);

      if (root && root !== '/') {
        // make sure there's the starting slash
        if (root.charAt(0) !== '/') {
          root = '/' + root;
        }
        // remove trailing slash
        this.root = root.replace(/\/$/, '');
        this.rootRE = new RegExp('^\\' + this.root);
      } else {
        this.root = null;
      }
      this.onChange = onChange;
      // check base tag
      var baseEl = document.querySelector('base');
      this.base = baseEl && baseEl.getAttribute('href');
    }

    HTML5History.prototype.start = function start() {
      var _this = this;

      this.listener = function (e) {
        var url = location.pathname + location.search;
        if (_this.root) {
          url = url.replace(_this.rootRE, '');
        }
        _this.onChange(url, e && e.state, location.hash);
      };
      window.addEventListener('popstate', this.listener);
      this.listener();
    };

    HTML5History.prototype.stop = function stop() {
      window.removeEventListener('popstate', this.listener);
    };

    HTML5History.prototype.go = function go(path, replace, append) {
      var url = this.formatPath(path, append);
      if (replace) {
        history.replaceState({}, '', url);
      } else {
        // record scroll position by replacing current state
        history.replaceState({
          pos: {
            x: window.pageXOffset,
            y: window.pageYOffset
          }
        }, '', location.href);
        // then push new state
        history.pushState({}, '', url);
      }
      var hashMatch = path.match(hashRE);
      var hash = hashMatch && hashMatch[0];
      path = url
      // strip hash so it doesn't mess up params
      .replace(hashRE, '')
      // remove root before matching
      .replace(this.rootRE, '');
      this.onChange(path, null, hash);
    };

    HTML5History.prototype.formatPath = function formatPath(path, append) {
      return path.charAt(0) === '/'
      // absolute path
      ? this.root ? this.root + '/' + path.replace(/^\//, '') : path : resolvePath(this.base || location.pathname, path, append);
    };

    return HTML5History;
  })();

  var HashHistory = (function () {
    function HashHistory(_ref) {
      var hashbang = _ref.hashbang;
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, HashHistory);

      this.hashbang = hashbang;
      this.onChange = onChange;
    }

    HashHistory.prototype.start = function start() {
      var self = this;
      this.listener = function () {
        var path = location.hash;
        var raw = path.replace(/^#!?/, '');
        // always
        if (raw.charAt(0) !== '/') {
          raw = '/' + raw;
        }
        var formattedPath = self.formatPath(raw);
        if (formattedPath !== path) {
          location.replace(formattedPath);
          return;
        }
        // determine query
        // note it's possible to have queries in both the actual URL
        // and the hash fragment itself.
        var query = location.search && path.indexOf('?') > -1 ? '&' + location.search.slice(1) : location.search;
        self.onChange(path.replace(/^#!?/, '') + query);
      };
      window.addEventListener('hashchange', this.listener);
      this.listener();
    };

    HashHistory.prototype.stop = function stop() {
      window.removeEventListener('hashchange', this.listener);
    };

    HashHistory.prototype.go = function go(path, replace, append) {
      path = this.formatPath(path, append);
      if (replace) {
        location.replace(path);
      } else {
        location.hash = path;
      }
    };

    HashHistory.prototype.formatPath = function formatPath(path, append) {
      var isAbsoloute = path.charAt(0) === '/';
      var prefix = '#' + (this.hashbang ? '!' : '');
      return isAbsoloute ? prefix + path : prefix + resolvePath(location.hash.replace(/^#!?/, ''), path, append);
    };

    return HashHistory;
  })();

  var AbstractHistory = (function () {
    function AbstractHistory(_ref) {
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, AbstractHistory);

      this.onChange = onChange;
      this.currentPath = '/';
    }

    AbstractHistory.prototype.start = function start() {
      this.onChange('/');
    };

    AbstractHistory.prototype.stop = function stop() {
      // noop
    };

    AbstractHistory.prototype.go = function go(path, replace, append) {
      path = this.currentPath = this.formatPath(path, append);
      this.onChange(path);
    };

    AbstractHistory.prototype.formatPath = function formatPath(path, append) {
      return path.charAt(0) === '/' ? path : resolvePath(this.currentPath, path, append);
    };

    return AbstractHistory;
  })();

  /**
   * Determine the reusability of an existing router view.
   *
   * @param {Directive} view
   * @param {Object} handler
   * @param {Transition} transition
   */

  function canReuse(view, handler, transition) {
    var component = view.childVM;
    if (!component || !handler) {
      return false;
    }
    // important: check view.Component here because it may
    // have been changed in activate hook
    if (view.Component !== handler.component) {
      return false;
    }
    var canReuseFn = getRouteConfig(component, 'canReuse');
    return typeof canReuseFn === 'boolean' ? canReuseFn : canReuseFn ? canReuseFn.call(component, {
      to: transition.to,
      from: transition.from
    }) : true; // defaults to true
  }

  /**
   * Check if a component can deactivate.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Function} next
   */

  function canDeactivate(view, transition, next) {
    var fromComponent = view.childVM;
    var hook = getRouteConfig(fromComponent, 'canDeactivate');
    if (!hook) {
      next();
    } else {
      transition.callHook(hook, fromComponent, next, {
        expectBoolean: true
      });
    }
  }

  /**
   * Check if a component can activate.
   *
   * @param {Object} handler
   * @param {Transition} transition
   * @param {Function} next
   */

  function canActivate(handler, transition, next) {
    resolveAsyncComponent(handler, function (Component) {
      // have to check due to async-ness
      if (transition.aborted) {
        return;
      }
      // determine if this component can be activated
      var hook = getRouteConfig(Component, 'canActivate');
      if (!hook) {
        next();
      } else {
        transition.callHook(hook, null, next, {
          expectBoolean: true
        });
      }
    });
  }

  /**
   * Call deactivate hooks for existing router-views.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Function} next
   */

  function deactivate(view, transition, next) {
    var component = view.childVM;
    var hook = getRouteConfig(component, 'deactivate');
    if (!hook) {
      next();
    } else {
      transition.callHooks(hook, component, next);
    }
  }

  /**
   * Activate / switch component for a router-view.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Number} depth
   * @param {Function} [cb]
   */

  function activate(view, transition, depth, cb, reuse) {
    var handler = transition.activateQueue[depth];
    if (!handler) {
      saveChildView(view);
      if (view._bound) {
        view.setComponent(null);
      }
      cb && cb();
      return;
    }

    var Component = view.Component = handler.component;
    var activateHook = getRouteConfig(Component, 'activate');
    var dataHook = getRouteConfig(Component, 'data');
    var waitForData = getRouteConfig(Component, 'waitForData');

    view.depth = depth;
    view.activated = false;

    var component = undefined;
    var loading = !!(dataHook && !waitForData);

    // "reuse" is a flag passed down when the parent view is
    // either reused via keep-alive or as a child of a kept-alive view.
    // of course we can only reuse if the current kept-alive instance
    // is of the correct type.
    reuse = reuse && view.childVM && view.childVM.constructor === Component;

    if (reuse) {
      // just reuse
      component = view.childVM;
      component.$loadingRouteData = loading;
    } else {
      saveChildView(view);

      // unbuild current component. this step also destroys
      // and removes all nested child views.
      view.unbuild(true);

      // build the new component. this will also create the
      // direct child view of the current one. it will register
      // itself as view.childView.
      component = view.build({
        _meta: {
          $loadingRouteData: loading
        },
        created: function created() {
          this._routerView = view;
        }
      });

      // handle keep-alive.
      // when a kept-alive child vm is restored, we need to
      // add its cached child views into the router's view list,
      // and also properly update current view's child view.
      if (view.keepAlive) {
        component.$loadingRouteData = loading;
        var cachedChildView = component._keepAliveRouterView;
        if (cachedChildView) {
          view.childView = cachedChildView;
          component._keepAliveRouterView = null;
        }
      }
    }

    // cleanup the component in case the transition is aborted
    // before the component is ever inserted.
    var cleanup = function cleanup() {
      component.$destroy();
    };

    // actually insert the component and trigger transition
    var insert = function insert() {
      if (reuse) {
        cb && cb();
        return;
      }
      var router = transition.router;
      if (router._rendered || router._transitionOnLoad) {
        view.transition(component);
      } else {
        // no transition on first render, manual transition
        /* istanbul ignore if */
        if (view.setCurrent) {
          // 0.12 compat
          view.setCurrent(component);
        } else {
          // 1.0
          view.childVM = component;
        }
        component.$before(view.anchor, null, false);
      }
      cb && cb();
    };

    var afterData = function afterData() {
      // activate the child view
      if (view.childView) {
        activate(view.childView, transition, depth + 1, null, reuse || view.keepAlive);
      }
      insert();
    };

    // called after activation hook is resolved
    var afterActivate = function afterActivate() {
      view.activated = true;
      if (dataHook && waitForData) {
        // wait until data loaded to insert
        loadData(component, transition, dataHook, afterData, cleanup);
      } else {
        // load data and insert at the same time
        if (dataHook) {
          loadData(component, transition, dataHook);
        }
        afterData();
      }
    };

    if (activateHook) {
      transition.callHooks(activateHook, component, afterActivate, {
        cleanup: cleanup,
        postActivate: true
      });
    } else {
      afterActivate();
    }
  }

  /**
   * Reuse a view, just reload data if necessary.
   *
   * @param {Directive} view
   * @param {Transition} transition
   */

  function reuse(view, transition) {
    var component = view.childVM;
    var dataHook = getRouteConfig(component, 'data');
    if (dataHook) {
      loadData(component, transition, dataHook);
    }
  }

  /**
   * Asynchronously load and apply data to component.
   *
   * @param {Vue} component
   * @param {Transition} transition
   * @param {Function} hook
   * @param {Function} cb
   * @param {Function} cleanup
   */

  function loadData(component, transition, hook, cb, cleanup) {
    component.$loadingRouteData = true;
    transition.callHooks(hook, component, function () {
      component.$loadingRouteData = false;
      component.$emit('route-data-loaded', component);
      cb && cb();
    }, {
      cleanup: cleanup,
      postActivate: true,
      processData: function processData(data) {
        // handle promise sugar syntax
        var promises = [];
        if (isPlainObject(data)) {
          Object.keys(data).forEach(function (key) {
            var val = data[key];
            if (isPromise(val)) {
              promises.push(val.then(function (resolvedVal) {
                component.$set(key, resolvedVal);
              }));
            } else {
              component.$set(key, val);
            }
          });
        }
        if (promises.length) {
          return promises[0].constructor.all(promises);
        }
      }
    });
  }

  /**
   * Save the child view for a kept-alive view so that
   * we can restore it when it is switched back to.
   *
   * @param {Directive} view
   */

  function saveChildView(view) {
    if (view.keepAlive && view.childVM && view.childView) {
      view.childVM._keepAliveRouterView = view.childView;
    }
    view.childView = null;
  }

  /**
   * Check plain object.
   *
   * @param {*} val
   */

  function isPlainObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  /**
   * A RouteTransition object manages the pipeline of a
   * router-view switching process. This is also the object
   * passed into user route hooks.
   *
   * @param {Router} router
   * @param {Route} to
   * @param {Route} from
   */

  var RouteTransition = (function () {
    function RouteTransition(router, to, from) {
      babelHelpers.classCallCheck(this, RouteTransition);

      this.router = router;
      this.to = to;
      this.from = from;
      this.next = null;
      this.aborted = false;
      this.done = false;
    }

    /**
     * Abort current transition and return to previous location.
     */

    RouteTransition.prototype.abort = function abort() {
      if (!this.aborted) {
        this.aborted = true;
        // if the root path throws an error during validation
        // on initial load, it gets caught in an infinite loop.
        var abortingOnLoad = !this.from.path && this.to.path === '/';
        if (!abortingOnLoad) {
          this.router.replace(this.from.path || '/');
        }
      }
    };

    /**
     * Abort current transition and redirect to a new location.
     *
     * @param {String} path
     */

    RouteTransition.prototype.redirect = function redirect(path) {
      if (!this.aborted) {
        this.aborted = true;
        if (typeof path === 'string') {
          path = mapParams(path, this.to.params, this.to.query);
        } else {
          path.params = path.params || this.to.params;
          path.query = path.query || this.to.query;
        }
        this.router.replace(path);
      }
    };

    /**
     * A router view transition's pipeline can be described as
     * follows, assuming we are transitioning from an existing
     * <router-view> chain [Component A, Component B] to a new
     * chain [Component A, Component C]:
     *
     *  A    A
     *  | => |
     *  B    C
     *
     * 1. Reusablity phase:
     *   -> canReuse(A, A)
     *   -> canReuse(B, C)
     *   -> determine new queues:
     *      - deactivation: [B]
     *      - activation: [C]
     *
     * 2. Validation phase:
     *   -> canDeactivate(B)
     *   -> canActivate(C)
     *
     * 3. Activation phase:
     *   -> deactivate(B)
     *   -> activate(C)
     *
     * Each of these steps can be asynchronous, and any
     * step can potentially abort the transition.
     *
     * @param {Function} cb
     */

    RouteTransition.prototype.start = function start(cb) {
      var transition = this;

      // determine the queue of views to deactivate
      var deactivateQueue = [];
      var view = this.router._rootView;
      while (view) {
        deactivateQueue.unshift(view);
        view = view.childView;
      }
      var reverseDeactivateQueue = deactivateQueue.slice().reverse();

      // determine the queue of route handlers to activate
      var activateQueue = this.activateQueue = toArray(this.to.matched).map(function (match) {
        return match.handler;
      });

      // 1. Reusability phase
      var i = undefined,
          reuseQueue = undefined;
      for (i = 0; i < reverseDeactivateQueue.length; i++) {
        if (!canReuse(reverseDeactivateQueue[i], activateQueue[i], transition)) {
          break;
        }
      }
      if (i > 0) {
        reuseQueue = reverseDeactivateQueue.slice(0, i);
        deactivateQueue = reverseDeactivateQueue.slice(i).reverse();
        activateQueue = activateQueue.slice(i);
      }

      // 2. Validation phase
      transition.runQueue(deactivateQueue, canDeactivate, function () {
        transition.runQueue(activateQueue, canActivate, function () {
          transition.runQueue(deactivateQueue, deactivate, function () {
            // 3. Activation phase

            // Update router current route
            transition.router._onTransitionValidated(transition);

            // trigger reuse for all reused views
            reuseQueue && reuseQueue.forEach(function (view) {
              return reuse(view, transition);
            });

            // the root of the chain that needs to be replaced
            // is the top-most non-reusable view.
            if (deactivateQueue.length) {
              var _view = deactivateQueue[deactivateQueue.length - 1];
              var depth = reuseQueue ? reuseQueue.length : 0;
              activate(_view, transition, depth, cb);
            } else {
              cb();
            }
          });
        });
      });
    };

    /**
     * Asynchronously and sequentially apply a function to a
     * queue.
     *
     * @param {Array} queue
     * @param {Function} fn
     * @param {Function} cb
     */

    RouteTransition.prototype.runQueue = function runQueue(queue, fn, cb) {
      var transition = this;
      step(0);
      function step(index) {
        if (index >= queue.length) {
          cb();
        } else {
          fn(queue[index], transition, function () {
            step(index + 1);
          });
        }
      }
    };

    /**
     * Call a user provided route transition hook and handle
     * the response (e.g. if the user returns a promise).
     *
     * If the user neither expects an argument nor returns a
     * promise, the hook is assumed to be synchronous.
     *
     * @param {Function} hook
     * @param {*} [context]
     * @param {Function} [cb]
     * @param {Object} [options]
     *                 - {Boolean} expectBoolean
     *                 - {Boolean} postActive
     *                 - {Function} processData
     *                 - {Function} cleanup
     */

    RouteTransition.prototype.callHook = function callHook(hook, context, cb) {
      var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var _ref$expectBoolean = _ref.expectBoolean;
      var expectBoolean = _ref$expectBoolean === undefined ? false : _ref$expectBoolean;
      var _ref$postActivate = _ref.postActivate;
      var postActivate = _ref$postActivate === undefined ? false : _ref$postActivate;
      var processData = _ref.processData;
      var cleanup = _ref.cleanup;

      var transition = this;
      var nextCalled = false;

      // abort the transition
      var abort = function abort() {
        cleanup && cleanup();
        transition.abort();
      };

      // handle errors
      var onError = function onError(err) {
        postActivate ? next() : abort();
        if (err && !transition.router._suppress) {
          warn$1('Uncaught error during transition: ');
          throw err instanceof Error ? err : new Error(err);
        }
      };

      // since promise swallows errors, we have to
      // throw it in the next tick...
      var onPromiseError = function onPromiseError(err) {
        try {
          onError(err);
        } catch (e) {
          setTimeout(function () {
            throw e;
          }, 0);
        }
      };

      // advance the transition to the next step
      var next = function next() {
        if (nextCalled) {
          warn$1('transition.next() should be called only once.');
          return;
        }
        nextCalled = true;
        if (transition.aborted) {
          cleanup && cleanup();
          return;
        }
        cb && cb();
      };

      var nextWithBoolean = function nextWithBoolean(res) {
        if (typeof res === 'boolean') {
          res ? next() : abort();
        } else if (isPromise(res)) {
          res.then(function (ok) {
            ok ? next() : abort();
          }, onPromiseError);
        } else if (!hook.length) {
          next();
        }
      };

      var nextWithData = function nextWithData(data) {
        var res = undefined;
        try {
          res = processData(data);
        } catch (err) {
          return onError(err);
        }
        if (isPromise(res)) {
          res.then(next, onPromiseError);
        } else {
          next();
        }
      };

      // expose a clone of the transition object, so that each
      // hook gets a clean copy and prevent the user from
      // messing with the internals.
      var exposed = {
        to: transition.to,
        from: transition.from,
        abort: abort,
        next: processData ? nextWithData : next,
        redirect: function redirect() {
          transition.redirect.apply(transition, arguments);
        }
      };

      // actually call the hook
      var res = undefined;
      try {
        res = hook.call(context, exposed);
      } catch (err) {
        return onError(err);
      }

      if (expectBoolean) {
        // boolean hooks
        nextWithBoolean(res);
      } else if (isPromise(res)) {
        // promise
        if (processData) {
          res.then(nextWithData, onPromiseError);
        } else {
          res.then(next, onPromiseError);
        }
      } else if (processData && isPlainOjbect(res)) {
        // data promise sugar
        nextWithData(res);
      } else if (!hook.length) {
        next();
      }
    };

    /**
     * Call a single hook or an array of async hooks in series.
     *
     * @param {Array} hooks
     * @param {*} context
     * @param {Function} cb
     * @param {Object} [options]
     */

    RouteTransition.prototype.callHooks = function callHooks(hooks, context, cb, options) {
      var _this = this;

      if (Array.isArray(hooks)) {
        this.runQueue(hooks, function (hook, _, next) {
          if (!_this.aborted) {
            _this.callHook(hook, context, next, options);
          }
        }, cb);
      } else {
        this.callHook(hooks, context, cb, options);
      }
    };

    return RouteTransition;
  })();

  function isPlainOjbect(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  function toArray(val) {
    return val ? Array.prototype.slice.call(val) : [];
  }

  var internalKeysRE = /^(component|subRoutes|fullPath)$/;

  /**
   * Route Context Object
   *
   * @param {String} path
   * @param {Router} router
   */

  var Route = function Route(path, router) {
    var _this = this;

    babelHelpers.classCallCheck(this, Route);

    var matched = router._recognizer.recognize(path);
    if (matched) {
      // copy all custom fields from route configs
      [].forEach.call(matched, function (match) {
        for (var key in match.handler) {
          if (!internalKeysRE.test(key)) {
            _this[key] = match.handler[key];
          }
        }
      });
      // set query and params
      this.query = matched.queryParams;
      this.params = [].reduce.call(matched, function (prev, cur) {
        if (cur.params) {
          for (var key in cur.params) {
            prev[key] = cur.params[key];
          }
        }
        return prev;
      }, {});
    }
    // expose path and router
    this.path = path;
    // for internal use
    this.matched = matched || router._notFoundHandler;
    // internal reference to router
    Object.defineProperty(this, 'router', {
      enumerable: false,
      value: router
    });
    // Important: freeze self to prevent observation
    Object.freeze(this);
  };

  function applyOverride (Vue) {
    var _Vue$util = Vue.util;
    var extend = _Vue$util.extend;
    var isArray = _Vue$util.isArray;
    var defineReactive = _Vue$util.defineReactive;

    // override Vue's init and destroy process to keep track of router instances
    var init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      options = options || {};
      var root = options._parent || options.parent || this;
      var router = root.$router;
      var route = root.$route;
      if (router) {
        // expose router
        this.$router = router;
        router._children.push(this);
        /* istanbul ignore if */
        if (this._defineMeta) {
          // 0.12
          this._defineMeta('$route', route);
        } else {
          // 1.0
          defineReactive(this, '$route', route);
        }
      }
      init.call(this, options);
    };

    var destroy = Vue.prototype._destroy;
    Vue.prototype._destroy = function () {
      if (!this._isBeingDestroyed && this.$router) {
        this.$router._children.$remove(this);
      }
      destroy.apply(this, arguments);
    };

    // 1.0 only: enable route mixins
    var strats = Vue.config.optionMergeStrategies;
    var hooksToMergeRE = /^(data|activate|deactivate)$/;

    if (strats) {
      strats.route = function (parentVal, childVal) {
        if (!childVal) return parentVal;
        if (!parentVal) return childVal;
        var ret = {};
        extend(ret, parentVal);
        for (var key in childVal) {
          var a = ret[key];
          var b = childVal[key];
          // for data, activate and deactivate, we need to merge them into
          // arrays similar to lifecycle hooks.
          if (a && hooksToMergeRE.test(key)) {
            ret[key] = (isArray(a) ? a : [a]).concat(b);
          } else {
            ret[key] = b;
          }
        }
        return ret;
      };
    }
  }

  function View (Vue) {

    var _ = Vue.util;
    var componentDef =
    // 0.12
    Vue.directive('_component') ||
    // 1.0
    Vue.internalDirectives.component;
    // <router-view> extends the internal component directive
    var viewDef = _.extend({}, componentDef);

    // with some overrides
    _.extend(viewDef, {

      _isRouterView: true,

      bind: function bind() {
        var route = this.vm.$route;
        /* istanbul ignore if */
        if (!route) {
          warn$1('<router-view> can only be used inside a ' + 'router-enabled app.');
          return;
        }
        // force dynamic directive so v-component doesn't
        // attempt to build right now
        this._isDynamicLiteral = true;
        // finally, init by delegating to v-component
        componentDef.bind.call(this);

        // locate the parent view
        var parentView = undefined;
        var parent = this.vm;
        while (parent) {
          if (parent._routerView) {
            parentView = parent._routerView;
            break;
          }
          parent = parent.$parent;
        }
        if (parentView) {
          // register self as a child of the parent view,
          // instead of activating now. This is so that the
          // child's activate hook is called after the
          // parent's has resolved.
          this.parentView = parentView;
          parentView.childView = this;
        } else {
          // this is the root view!
          var router = route.router;
          router._rootView = this;
        }

        // handle late-rendered view
        // two possibilities:
        // 1. root view rendered after transition has been
        //    validated;
        // 2. child view rendered after parent view has been
        //    activated.
        var transition = route.router._currentTransition;
        if (!parentView && transition.done || parentView && parentView.activated) {
          var depth = parentView ? parentView.depth + 1 : 0;
          activate(this, transition, depth);
        }
      },

      unbind: function unbind() {
        if (this.parentView) {
          this.parentView.childView = null;
        }
        componentDef.unbind.call(this);
      }
    });

    Vue.elementDirective('router-view', viewDef);
  }

  var trailingSlashRE = /\/$/;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
  var queryStringRE = /\?.*$/;

  // install v-link, which provides navigation support for
  // HTML5 history mode
  function Link (Vue) {
    var _Vue$util = Vue.util;
    var _bind = _Vue$util.bind;
    var isObject = _Vue$util.isObject;
    var addClass = _Vue$util.addClass;
    var removeClass = _Vue$util.removeClass;

    var onPriority = Vue.directive('on').priority;
    var LINK_UPDATE = '__vue-router-link-update__';

    var activeId = 0;

    Vue.directive('link-active', {
      priority: 9999,
      bind: function bind() {
        var _this = this;

        var id = String(activeId++);
        // collect v-links contained within this element.
        // we need do this here before the parent-child relationship
        // gets messed up by terminal directives (if, for, components)
        var childLinks = this.el.querySelectorAll('[v-link]');
        for (var i = 0, l = childLinks.length; i < l; i++) {
          var link = childLinks[i];
          var existingId = link.getAttribute(LINK_UPDATE);
          var value = existingId ? existingId + ',' + id : id;
          // leave a mark on the link element which can be persisted
          // through fragment clones.
          link.setAttribute(LINK_UPDATE, value);
        }
        this.vm.$on(LINK_UPDATE, this.cb = function (link, path) {
          if (link.activeIds.indexOf(id) > -1) {
            link.updateClasses(path, _this.el);
          }
        });
      },
      unbind: function unbind() {
        this.vm.$off(LINK_UPDATE, this.cb);
      }
    });

    Vue.directive('link', {
      priority: onPriority - 2,

      bind: function bind() {
        var vm = this.vm;
        /* istanbul ignore if */
        if (!vm.$route) {
          warn$1('v-link can only be used inside a router-enabled app.');
          return;
        }
        this.router = vm.$route.router;
        // update things when the route changes
        this.unwatch = vm.$watch('$route', _bind(this.onRouteUpdate, this));
        // check v-link-active ids
        var activeIds = this.el.getAttribute(LINK_UPDATE);
        if (activeIds) {
          this.el.removeAttribute(LINK_UPDATE);
          this.activeIds = activeIds.split(',');
        }
        // no need to handle click if link expects to be opened
        // in a new window/tab.
        /* istanbul ignore if */
        if (this.el.tagName === 'A' && this.el.getAttribute('target') === '_blank') {
          return;
        }
        // handle click
        this.handler = _bind(this.onClick, this);
        this.el.addEventListener('click', this.handler);
      },

      update: function update(target) {
        this.target = target;
        if (isObject(target)) {
          this.append = target.append;
          this.exact = target.exact;
          this.prevActiveClass = this.activeClass;
          this.activeClass = target.activeClass;
        }
        this.onRouteUpdate(this.vm.$route);
      },

      onClick: function onClick(e) {
        // don't redirect with control keys
        /* istanbul ignore if */
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        // don't redirect when preventDefault called
        /* istanbul ignore if */
        if (e.defaultPrevented) return;
        // don't redirect on right click
        /* istanbul ignore if */
        if (e.button !== 0) return;

        var target = this.target;
        if (target) {
          // v-link with expression, just go
          e.preventDefault();
          this.router.go(target);
        } else {
          // no expression, delegate for an <a> inside
          var el = e.target;
          while (el.tagName !== 'A' && el !== this.el) {
            el = el.parentNode;
          }
          if (el.tagName === 'A' && sameOrigin(el)) {
            e.preventDefault();
            var path = el.pathname;
            if (this.router.history.root) {
              path = path.replace(this.router.history.rootRE, '');
            }
            this.router.go({
              path: path,
              replace: target && target.replace,
              append: target && target.append
            });
          }
        }
      },

      onRouteUpdate: function onRouteUpdate(route) {
        // router.stringifyPath is dependent on current route
        // and needs to be called again whenver route changes.
        var newPath = this.router.stringifyPath(this.target);
        if (this.path !== newPath) {
          this.path = newPath;
          this.updateActiveMatch();
          this.updateHref();
        }
        if (this.activeIds) {
          this.vm.$emit(LINK_UPDATE, this, route.path);
        } else {
          this.updateClasses(route.path, this.el);
        }
      },

      updateActiveMatch: function updateActiveMatch() {
        this.activeRE = this.path && !this.exact ? new RegExp('^' + this.path.replace(/\/$/, '').replace(queryStringRE, '').replace(regexEscapeRE, '\\$&') + '(\\/|$)') : null;
      },

      updateHref: function updateHref() {
        if (this.el.tagName !== 'A') {
          return;
        }
        var path = this.path;
        var router = this.router;
        var isAbsolute = path.charAt(0) === '/';
        // do not format non-hash relative paths
        var href = path && (router.mode === 'hash' || isAbsolute) ? router.history.formatPath(path, this.append) : path;
        if (href) {
          this.el.href = href;
        } else {
          this.el.removeAttribute('href');
        }
      },

      updateClasses: function updateClasses(path, el) {
        var activeClass = this.activeClass || this.router._linkActiveClass;
        // clear old class
        if (this.prevActiveClass && this.prevActiveClass !== activeClass) {
          toggleClasses(el, this.prevActiveClass, removeClass);
        }
        // remove query string before matching
        var dest = this.path.replace(queryStringRE, '');
        path = path.replace(queryStringRE, '');
        // add new class
        if (this.exact) {
          if (dest === path ||
          // also allow additional trailing slash
          dest.charAt(dest.length - 1) !== '/' && dest === path.replace(trailingSlashRE, '')) {
            toggleClasses(el, activeClass, addClass);
          } else {
            toggleClasses(el, activeClass, removeClass);
          }
        } else {
          if (this.activeRE && this.activeRE.test(path)) {
            toggleClasses(el, activeClass, addClass);
          } else {
            toggleClasses(el, activeClass, removeClass);
          }
        }
      },

      unbind: function unbind() {
        this.el.removeEventListener('click', this.handler);
        this.unwatch && this.unwatch();
      }
    });

    function sameOrigin(link) {
      return link.protocol === location.protocol && link.hostname === location.hostname && link.port === location.port;
    }

    // this function is copied from v-bind:class implementation until
    // we properly expose it...
    function toggleClasses(el, key, fn) {
      key = key.trim();
      if (key.indexOf(' ') === -1) {
        fn(el, key);
        return;
      }
      var keys = key.split(/\s+/);
      for (var i = 0, l = keys.length; i < l; i++) {
        fn(el, keys[i]);
      }
    }
  }

  var historyBackends = {
    abstract: AbstractHistory,
    hash: HashHistory,
    html5: HTML5History
  };

  // late bind during install
  var Vue = undefined;

  /**
   * Router constructor
   *
   * @param {Object} [options]
   */

  var Router = (function () {
    function Router() {
      var _this = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$hashbang = _ref.hashbang;
      var hashbang = _ref$hashbang === undefined ? true : _ref$hashbang;
      var _ref$abstract = _ref.abstract;
      var abstract = _ref$abstract === undefined ? false : _ref$abstract;
      var _ref$history = _ref.history;
      var history = _ref$history === undefined ? false : _ref$history;
      var _ref$saveScrollPosition = _ref.saveScrollPosition;
      var saveScrollPosition = _ref$saveScrollPosition === undefined ? false : _ref$saveScrollPosition;
      var _ref$transitionOnLoad = _ref.transitionOnLoad;
      var transitionOnLoad = _ref$transitionOnLoad === undefined ? false : _ref$transitionOnLoad;
      var _ref$suppressTransitionError = _ref.suppressTransitionError;
      var suppressTransitionError = _ref$suppressTransitionError === undefined ? false : _ref$suppressTransitionError;
      var _ref$root = _ref.root;
      var root = _ref$root === undefined ? null : _ref$root;
      var _ref$linkActiveClass = _ref.linkActiveClass;
      var linkActiveClass = _ref$linkActiveClass === undefined ? 'v-link-active' : _ref$linkActiveClass;
      babelHelpers.classCallCheck(this, Router);

      /* istanbul ignore if */
      if (!Router.installed) {
        throw new Error('Please install the Router with Vue.use() before ' + 'creating an instance.');
      }

      // Vue instances
      this.app = null;
      this._children = [];

      // route recognizer
      this._recognizer = new RouteRecognizer();
      this._guardRecognizer = new RouteRecognizer();

      // state
      this._started = false;
      this._startCb = null;
      this._currentRoute = {};
      this._currentTransition = null;
      this._previousTransition = null;
      this._notFoundHandler = null;
      this._notFoundRedirect = null;
      this._beforeEachHooks = [];
      this._afterEachHooks = [];

      // trigger transition on initial render?
      this._rendered = false;
      this._transitionOnLoad = transitionOnLoad;

      // history mode
      this._root = root;
      this._abstract = abstract;
      this._hashbang = hashbang;

      // check if HTML5 history is available
      var hasPushState = typeof window !== 'undefined' && window.history && window.history.pushState;
      this._history = history && hasPushState;
      this._historyFallback = history && !hasPushState;

      // create history object
      var inBrowser = Vue.util.inBrowser;
      this.mode = !inBrowser || this._abstract ? 'abstract' : this._history ? 'html5' : 'hash';

      var History = historyBackends[this.mode];
      this.history = new History({
        root: root,
        hashbang: this._hashbang,
        onChange: function onChange(path, state, anchor) {
          _this._match(path, state, anchor);
        }
      });

      // other options
      this._saveScrollPosition = saveScrollPosition;
      this._linkActiveClass = linkActiveClass;
      this._suppress = suppressTransitionError;
    }

    /**
     * Allow directly passing components to a route
     * definition.
     *
     * @param {String} path
     * @param {Object} handler
     */

    // API ===================================================

    /**
    * Register a map of top-level paths.
    *
    * @param {Object} map
    */

    Router.prototype.map = function map(_map) {
      for (var route in _map) {
        this.on(route, _map[route]);
      }
      return this;
    };

    /**
     * Register a single root-level path
     *
     * @param {String} rootPath
     * @param {Object} handler
     *                 - {String} component
     *                 - {Object} [subRoutes]
     *                 - {Boolean} [forceRefresh]
     *                 - {Function} [before]
     *                 - {Function} [after]
     */

    Router.prototype.on = function on(rootPath, handler) {
      if (rootPath === '*') {
        this._notFound(handler);
      } else {
        this._addRoute(rootPath, handler, []);
      }
      return this;
    };

    /**
     * Set redirects.
     *
     * @param {Object} map
     */

    Router.prototype.redirect = function redirect(map) {
      for (var path in map) {
        this._addRedirect(path, map[path]);
      }
      return this;
    };

    /**
     * Set aliases.
     *
     * @param {Object} map
     */

    Router.prototype.alias = function alias(map) {
      for (var path in map) {
        this._addAlias(path, map[path]);
      }
      return this;
    };

    /**
     * Set global before hook.
     *
     * @param {Function} fn
     */

    Router.prototype.beforeEach = function beforeEach(fn) {
      this._beforeEachHooks.push(fn);
      return this;
    };

    /**
     * Set global after hook.
     *
     * @param {Function} fn
     */

    Router.prototype.afterEach = function afterEach(fn) {
      this._afterEachHooks.push(fn);
      return this;
    };

    /**
     * Navigate to a given path.
     * The path can be an object describing a named path in
     * the format of { name: '...', params: {}, query: {}}
     * The path is assumed to be already decoded, and will
     * be resolved against root (if provided)
     *
     * @param {String|Object} path
     * @param {Boolean} [replace]
     */

    Router.prototype.go = function go(path) {
      var replace = false;
      var append = false;
      if (Vue.util.isObject(path)) {
        replace = path.replace;
        append = path.append;
      }
      path = this.stringifyPath(path);
      if (path) {
        this.history.go(path, replace, append);
      }
    };

    /**
     * Short hand for replacing current path
     *
     * @param {String} path
     */

    Router.prototype.replace = function replace(path) {
      if (typeof path === 'string') {
        path = { path: path };
      }
      path.replace = true;
      this.go(path);
    };

    /**
     * Start the router.
     *
     * @param {VueConstructor} App
     * @param {String|Element} container
     * @param {Function} [cb]
     */

    Router.prototype.start = function start(App, container, cb) {
      /* istanbul ignore if */
      if (this._started) {
        warn$1('already started.');
        return;
      }
      this._started = true;
      this._startCb = cb;
      if (!this.app) {
        /* istanbul ignore if */
        if (!App || !container) {
          throw new Error('Must start vue-router with a component and a ' + 'root container.');
        }
        /* istanbul ignore if */
        if (App instanceof Vue) {
          throw new Error('Must start vue-router with a component, not a ' + 'Vue instance.');
        }
        this._appContainer = container;
        var Ctor = this._appConstructor = typeof App === 'function' ? App : Vue.extend(App);
        // give it a name for better debugging
        Ctor.options.name = Ctor.options.name || 'RouterApp';
      }

      // handle history fallback in browsers that do not
      // support HTML5 history API
      if (this._historyFallback) {
        var _location = window.location;
        var _history = new HTML5History({ root: this._root });
        var path = _history.root ? _location.pathname.replace(_history.rootRE, '') : _location.pathname;
        if (path && path !== '/') {
          _location.assign((_history.root || '') + '/' + this.history.formatPath(path) + _location.search);
          return;
        }
      }

      this.history.start();
    };

    /**
     * Stop listening to route changes.
     */

    Router.prototype.stop = function stop() {
      this.history.stop();
      this._started = false;
    };

    /**
     * Normalize named route object / string paths into
     * a string.
     *
     * @param {Object|String|Number} path
     * @return {String}
     */

    Router.prototype.stringifyPath = function stringifyPath(path) {
      var generatedPath = '';
      if (path && typeof path === 'object') {
        if (path.name) {
          var extend = Vue.util.extend;
          var currentParams = this._currentTransition && this._currentTransition.to.params;
          var targetParams = path.params || {};
          var params = currentParams ? extend(extend({}, currentParams), targetParams) : targetParams;
          generatedPath = encodeURI(this._recognizer.generate(path.name, params));
        } else if (path.path) {
          generatedPath = encodeURI(path.path);
        }
        if (path.query) {
          // note: the generated query string is pre-URL-encoded by the recognizer
          var query = this._recognizer.generateQueryString(path.query);
          if (generatedPath.indexOf('?') > -1) {
            generatedPath += '&' + query.slice(1);
          } else {
            generatedPath += query;
          }
        }
      } else {
        generatedPath = encodeURI(path ? path + '' : '');
      }
      return generatedPath;
    };

    // Internal methods ======================================

    /**
    * Add a route containing a list of segments to the internal
    * route recognizer. Will be called recursively to add all
    * possible sub-routes.
    *
    * @param {String} path
    * @param {Object} handler
    * @param {Array} segments
    */

    Router.prototype._addRoute = function _addRoute(path, handler, segments) {
      guardComponent(path, handler);
      handler.path = path;
      handler.fullPath = (segments.reduce(function (path, segment) {
        return path + segment.path;
      }, '') + path).replace('//', '/');
      segments.push({
        path: path,
        handler: handler
      });
      this._recognizer.add(segments, {
        as: handler.name
      });
      // add sub routes
      if (handler.subRoutes) {
        for (var subPath in handler.subRoutes) {
          // recursively walk all sub routes
          this._addRoute(subPath, handler.subRoutes[subPath],
          // pass a copy in recursion to avoid mutating
          // across branches
          segments.slice());
        }
      }
    };

    /**
     * Set the notFound route handler.
     *
     * @param {Object} handler
     */

    Router.prototype._notFound = function _notFound(handler) {
      guardComponent('*', handler);
      this._notFoundHandler = [{ handler: handler }];
    };

    /**
     * Add a redirect record.
     *
     * @param {String} path
     * @param {String} redirectPath
     */

    Router.prototype._addRedirect = function _addRedirect(path, redirectPath) {
      if (path === '*') {
        this._notFoundRedirect = redirectPath;
      } else {
        this._addGuard(path, redirectPath, this.replace);
      }
    };

    /**
     * Add an alias record.
     *
     * @param {String} path
     * @param {String} aliasPath
     */

    Router.prototype._addAlias = function _addAlias(path, aliasPath) {
      this._addGuard(path, aliasPath, this._match);
    };

    /**
     * Add a path guard.
     *
     * @param {String} path
     * @param {String} mappedPath
     * @param {Function} handler
     */

    Router.prototype._addGuard = function _addGuard(path, mappedPath, _handler) {
      var _this2 = this;

      this._guardRecognizer.add([{
        path: path,
        handler: function handler(match, query) {
          var realPath = mapParams(mappedPath, match.params, query);
          _handler.call(_this2, realPath);
        }
      }]);
    };

    /**
     * Check if a path matches any redirect records.
     *
     * @param {String} path
     * @return {Boolean} - if true, will skip normal match.
     */

    Router.prototype._checkGuard = function _checkGuard(path) {
      var matched = this._guardRecognizer.recognize(path, true);
      if (matched) {
        matched[0].handler(matched[0], matched.queryParams);
        return true;
      } else if (this._notFoundRedirect) {
        matched = this._recognizer.recognize(path);
        if (!matched) {
          this.replace(this._notFoundRedirect);
          return true;
        }
      }
    };

    /**
     * Match a URL path and set the route context on vm,
     * triggering view updates.
     *
     * @param {String} path
     * @param {Object} [state]
     * @param {String} [anchor]
     */

    Router.prototype._match = function _match(path, state, anchor) {
      var _this3 = this;

      if (this._checkGuard(path)) {
        return;
      }

      var currentRoute = this._currentRoute;
      var currentTransition = this._currentTransition;

      if (currentTransition) {
        if (currentTransition.to.path === path) {
          // do nothing if we have an active transition going to the same path
          return;
        } else if (currentRoute.path === path) {
          // We are going to the same path, but we also have an ongoing but
          // not-yet-validated transition. Abort that transition and reset to
          // prev transition.
          currentTransition.aborted = true;
          this._currentTransition = this._prevTransition;
          return;
        } else {
          // going to a totally different path. abort ongoing transition.
          currentTransition.aborted = true;
        }
      }

      // construct new route and transition context
      var route = new Route(path, this);
      var transition = new RouteTransition(this, route, currentRoute);

      // current transition is updated right now.
      // however, current route will only be updated after the transition has
      // been validated.
      this._prevTransition = currentTransition;
      this._currentTransition = transition;

      if (!this.app) {
        (function () {
          // initial render
          var router = _this3;
          _this3.app = new _this3._appConstructor({
            el: _this3._appContainer,
            created: function created() {
              this.$router = router;
            },
            _meta: {
              $route: route
            }
          });
        })();
      }

      // check global before hook
      var beforeHooks = this._beforeEachHooks;
      var startTransition = function startTransition() {
        transition.start(function () {
          _this3._postTransition(route, state, anchor);
        });
      };

      if (beforeHooks.length) {
        transition.runQueue(beforeHooks, function (hook, _, next) {
          if (transition === _this3._currentTransition) {
            transition.callHook(hook, null, next, {
              expectBoolean: true
            });
          }
        }, startTransition);
      } else {
        startTransition();
      }

      if (!this._rendered && this._startCb) {
        this._startCb.call(null);
      }

      // HACK:
      // set rendered to true after the transition start, so
      // that components that are acitvated synchronously know
      // whether it is the initial render.
      this._rendered = true;
    };

    /**
     * Set current to the new transition.
     * This is called by the transition object when the
     * validation of a route has succeeded.
     *
     * @param {Transition} transition
     */

    Router.prototype._onTransitionValidated = function _onTransitionValidated(transition) {
      // set current route
      var route = this._currentRoute = transition.to;
      // update route context for all children
      if (this.app.$route !== route) {
        this.app.$route = route;
        this._children.forEach(function (child) {
          child.$route = route;
        });
      }
      // call global after hook
      if (this._afterEachHooks.length) {
        this._afterEachHooks.forEach(function (hook) {
          return hook.call(null, {
            to: transition.to,
            from: transition.from
          });
        });
      }
      this._currentTransition.done = true;
    };

    /**
     * Handle stuff after the transition.
     *
     * @param {Route} route
     * @param {Object} [state]
     * @param {String} [anchor]
     */

    Router.prototype._postTransition = function _postTransition(route, state, anchor) {
      // handle scroll positions
      // saved scroll positions take priority
      // then we check if the path has an anchor
      var pos = state && state.pos;
      if (pos && this._saveScrollPosition) {
        Vue.nextTick(function () {
          window.scrollTo(pos.x, pos.y);
        });
      } else if (anchor) {
        Vue.nextTick(function () {
          var el = document.getElementById(anchor.slice(1));
          if (el) {
            window.scrollTo(window.scrollX, el.offsetTop);
          }
        });
      }
    };

    return Router;
  })();

  function guardComponent(path, handler) {
    var comp = handler.component;
    if (Vue.util.isPlainObject(comp)) {
      comp = handler.component = Vue.extend(comp);
    }
    /* istanbul ignore if */
    if (typeof comp !== 'function') {
      handler.component = null;
      warn$1('invalid component for route "' + path + '".');
    }
  }

  /* Installation */

  Router.installed = false;

  /**
   * Installation interface.
   * Install the necessary directives.
   */

  Router.install = function (externalVue) {
    /* istanbul ignore if */
    if (Router.installed) {
      warn$1('already installed.');
      return;
    }
    Vue = externalVue;
    applyOverride(Vue);
    View(Vue);
    Link(Vue);
    exports$1.Vue = Vue;
    Router.installed = true;
  };

  // auto install
  /* istanbul ignore if */
  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(Router);
  }

  return Router;

}));
},{}],51:[function(require,module,exports){
(function (process,global){
/*!
 * Vue.js v1.0.26
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
'use strict';

function set(obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  if (obj._isVue) {
    set(obj._data, key, val);
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  ob.convert(key, val);
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._proxy(key);
      vm._digest();
    }
  }
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 *
 * @param {Object} obj
 * @param {String} key
 */

function del(obj, key) {
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  var ob = obj.__ob__;
  if (!ob) {
    if (obj._isVue) {
      delete obj._data[key];
      obj._digest();
    }
    return;
  }
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._unproxy(key);
      vm._digest();
    }
  }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check whether the object has the property.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if an expression is a literal value.
 *
 * @param {String} exp
 * @return {Boolean}
 */

var literalValueRE = /^\s?(true|false|-?[\d\.]+|'[^']*'|"[^"]*")\s?$/;

function isLiteral(exp) {
  return literalValueRE.test(exp);
}

/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

function _toString(value) {
  return value == null ? '' : value.toString();
}

/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

function toNumber(value) {
  if (typeof value !== 'string') {
    return value;
  } else {
    var parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
}

/**
 * Convert string boolean literals into real booleans.
 *
 * @param {*} value
 * @return {*|Boolean}
 */

function toBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : value;
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

function stripQuotes(str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelizeRE = /-(\w)/g;

function camelize(str) {
  return str.replace(camelizeRE, toUpper);
}

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

var hyphenateRE = /([a-z\d])([A-Z])/g;

function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g;

function classify(str) {
  return str.replace(classifyRE, toUpper);
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

function bind(fn, ctx) {
  return function (a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  };
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

function extend(to, from) {
  var keys = Object.keys(from);
  var i = keys.length;
  while (i--) {
    to[keys[i]] = from[keys[i]];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';

function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var isArray = Array.isArray;

/**
 * Define a property.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

function _debounce(func, wait) {
  var timeout, args, context, timestamp, result;
  var later = function later() {
    var last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  };
  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    return result;
  };
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 *
 * @param {Array} arr
 * @param {*} obj
 */

function indexOf(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) return i;
  }
  return -1;
}

/**
 * Make a cancellable version of an async callback.
 *
 * @param {Function} fn
 * @return {Function}
 */

function cancellable(fn) {
  var cb = function cb() {
    if (!cb.cancelled) {
      return fn.apply(this, arguments);
    }
  };
  cb.cancel = function () {
    cb.cancelled = true;
  };
  return cb;
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 */

function looseEqual(a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
  /* eslint-enable eqeqeq */
}

var hasProto = ('__proto__' in {});

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

// UA sniffing for working around browser-specific quirks
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && UA.indexOf('trident') > 0;
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
var iosVersionMatch = isIos && UA.match(/os ([\d_]+)/);
var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_');

// detecting iOS UIWebView by indexedDB
var hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB;

var transitionProp = undefined;
var transitionEndEvent = undefined;
var animationProp = undefined;
var animationEndEvent = undefined;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
    timerFunc = context.setImmediate || setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
})();

var _Set = undefined;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    this.set = Object.create(null);
  };
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined;
  };
  _Set.prototype.add = function (key) {
    this.set[key] = 1;
  };
  _Set.prototype.clear = function () {
    this.set = Object.create(null);
  };
}

function Cache(limit) {
  this.size = 0;
  this.limit = limit;
  this.head = this.tail = undefined;
  this._keymap = Object.create(null);
}

var p = Cache.prototype;

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var removed;

  var entry = this.get(key, true);
  if (!entry) {
    if (this.size === this.limit) {
      removed = this.shift();
    }
    entry = {
      key: key
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry;
    this.size++;
  }
  entry.value = value;

  return removed;
};

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer;
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
    this.size--;
  }
  return entry;
};

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return;
  if (entry === this.tail) {
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer;
    }
    entry.newer.older = entry.older; // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer; // C. --> E
  }
  entry.newer = undefined; // D --x
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry;
  return returnEntry ? entry : entry.value;
};

var cache$1 = new Cache(1000);
var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g;
var reservedArgRE = /^in$|^-?\d+/;

/**
 * Parser state
 */

var str;
var dir;
var c;
var prev;
var i;
var l;
var lastFilterIndex;
var inSingle;
var inDouble;
var curly;
var square;
var paren;
/**
 * Push a filter to the current directive object
 */

function pushFilter() {
  var exp = str.slice(lastFilterIndex, i).trim();
  var filter;
  if (exp) {
    filter = {};
    var tokens = exp.match(filterTokenRE);
    filter.name = tokens[0];
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg);
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter);
  }
  lastFilterIndex = i + 1;
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg(arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    };
  } else {
    var stripped = stripQuotes(arg);
    var dynamic = stripped === arg;
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    };
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} s
 * @return {Object}
 */

function parseDirective(s) {
  var hit = cache$1.get(s);
  if (hit) {
    return hit;
  }

  // reset parser state
  str = s;
  inSingle = inDouble = false;
  curly = square = paren = 0;
  lastFilterIndex = 0;
  dir = {};

  for (i = 0, l = str.length; i < l; i++) {
    prev = c;
    c = str.charCodeAt(i);
    if (inSingle) {
      // check single quote
      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
    } else if (inDouble) {
      // check double quote
      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
    } else if (c === 0x7C && // pipe
    str.charCodeAt(i + 1) !== 0x7C && str.charCodeAt(i - 1) !== 0x7C) {
      if (dir.expression == null) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        dir.expression = str.slice(0, i).trim();
      } else {
        // already has filter
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;break; // "
        case 0x27:
          inSingle = true;break; // '
        case 0x28:
          paren++;break; // (
        case 0x29:
          paren--;break; // )
        case 0x5B:
          square++;break; // [
        case 0x5D:
          square--;break; // ]
        case 0x7B:
          curly++;break; // {
        case 0x7D:
          curly--;break; // }
      }
    }
  }

  if (dir.expression == null) {
    dir.expression = str.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  cache$1.put(s, dir);
  return dir;
}

var directive = Object.freeze({
  parseDirective: parseDirective
});

var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var cache = undefined;
var tagRE = undefined;
var htmlRE = undefined;
/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex(str) {
  return str.replace(regexEscapeRE, '\\$&');
}

function compileRegex() {
  var open = escapeRegex(config.delimiters[0]);
  var close = escapeRegex(config.delimiters[1]);
  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0]);
  var unsafeClose = escapeRegex(config.unsafeDelimiters[1]);
  tagRE = new RegExp(unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '|' + open + '((?:.|\\n)+?)' + close, 'g');
  htmlRE = new RegExp('^' + unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '$');
  // reset cache
  cache = new Cache(1000);
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

function parseText(text) {
  if (!cache) {
    compileRegex();
  }
  var hit = cache.get(text);
  if (hit) {
    return hit;
  }
  if (!tagRE.test(text)) {
    return null;
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, html, value, first, oneTime;
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
    /* eslint-enable no-cond-assign */
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      });
    }
    // tag token
    html = htmlRE.test(match[0]);
    value = html ? match[1] : match[2];
    first = value.charCodeAt(0);
    oneTime = first === 42; // *
    value = oneTime ? value.slice(1) : value;
    tokens.push({
      tag: true,
      value: value.trim(),
      html: html,
      oneTime: oneTime
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    });
  }
  cache.put(text, tokens);
  return tokens;
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

function tokensToExp(tokens, vm) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token, vm);
    }).join('+');
  } else {
    return formatToken(tokens[0], vm, true);
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} [single]
 * @return {String}
 */

function formatToken(token, vm, single) {
  return token.tag ? token.oneTime && vm ? '"' + vm.$eval(token.value) + '"' : inlineFilters(token.value, single) : '"' + token.value + '"';
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/;
function inlineFilters(exp, single) {
  if (!filterRE.test(exp)) {
    return single ? exp : '(' + exp + ')';
  } else {
    var dir = parseDirective(exp);
    if (!dir.filters) {
      return '(' + exp + ')';
    } else {
      return 'this._applyFilters(' + dir.expression + // value
      ',null,' + // oldValue (null for read)
      JSON.stringify(dir.filters) + // filter descriptors
      ',false)'; // write?
    }
  }
}

var text = Object.freeze({
  compileRegex: compileRegex,
  parseText: parseText,
  tokensToExp: tokensToExp
});

var delimiters = ['{{', '}}'];
var unsafeDelimiters = ['{{{', '}}}'];

var config = Object.defineProperties({

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Whether to allow devtools inspection.
   * Disabled by default in production builds.
   */

  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: ['component', 'directive', 'elementDirective', 'filter', 'transition', 'partial'],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}, {
  delimiters: { /**
                 * Interpolation delimiters. Changing these would trigger
                 * the text parser to re-compile the regular expressions.
                 *
                 * @type {Array<String>}
                 */

    get: function get() {
      return delimiters;
    },
    set: function set(val) {
      delimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  },
  unsafeDelimiters: {
    get: function get() {
      return unsafeDelimiters;
    },
    set: function set(val) {
      unsafeDelimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  }
});

var warn = undefined;
var formatComponentName = undefined;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';

    warn = function (msg, vm) {
      if (hasConsole && !config.silent) {
        console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
      }
    };

    formatComponentName = function (vm) {
      var name = vm._isVue ? vm.$options.name : vm.name;
      return name ? ' (found in component: <' + hyphenate(name) + '>)' : '';
    };
  })();
}

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function beforeWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    before(el, target);
  }, vm, cb);
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function removeWithTransition(el, vm, cb) {
  applyTransition(el, -1, function () {
    remove(el);
  }, vm, cb);
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
  var transition = el.__v_trans;
  if (!transition ||
  // skip if there are no js hooks and CSS transition is
  // not supported
  !transition.hooks && !transitionEndEvent ||
  // skip transitions for initial compile
  !vm._isCompiled ||
  // if the vm is being manipulated by a parent directive
  // during the parent's compilation phase, skip the
  // animation.
  vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  var action = direction > 0 ? 'enter' : 'leave';
  transition[action](op, cb);
}

var transition = Object.freeze({
  appendWithTransition: appendWithTransition,
  beforeWithTransition: beforeWithTransition,
  removeWithTransition: removeWithTransition,
  applyTransition: applyTransition
});

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
    }
  }
  return el;
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed by doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function inDoc(node) {
  if (!node) return false;
  var doc = node.ownerDocument.documentElement;
  var parent = node.parentNode;
  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

/**
 * Get and remove an attribute from a node.
 *
 * @param {Node} node
 * @param {String} _attr
 */

function getAttr(node, _attr) {
  var val = node.getAttribute(_attr);
  if (val !== null) {
    node.removeAttribute(_attr);
  }
  return val;
}

/**
 * Get an attribute with colon or v-bind: prefix.
 *
 * @param {Node} node
 * @param {String} name
 * @return {String|null}
 */

function getBindAttr(node, name) {
  var val = getAttr(node, ':' + name);
  if (val === null) {
    val = getAttr(node, 'v-bind:' + name);
  }
  return val;
}

/**
 * Check the presence of a bind attribute.
 *
 * @param {Node} node
 * @param {String} name
 * @return {Boolean}
 */

function hasBindAttr(node, name) {
  return node.hasAttribute(name) || node.hasAttribute(':' + name) || node.hasAttribute('v-bind:' + name);
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

function before(el, target) {
  target.parentNode.insertBefore(el, target);
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling);
  } else {
    target.parentNode.appendChild(el);
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

function remove(el) {
  el.parentNode.removeChild(el);
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

function prepend(el, target) {
  if (target.firstChild) {
    before(el, target.firstChild);
  } else {
    target.appendChild(el);
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

function replace(target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 * @param {Boolean} [useCapture]
 */

function on(el, event, cb, useCapture) {
  el.addEventListener(event, cb, useCapture);
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function off(el, event, cb) {
  el.removeEventListener(event, cb);
}

/**
 * For IE9 compat: when both class and :class are present
 * getAttribute('class') returns wrong value...
 *
 * @param {Element} el
 * @return {String}
 */

function getClass(el) {
  var classname = el.className;
  if (typeof classname === 'object') {
    classname = classname.baseVal || '';
  }
  return classname;
}

/**
 * In IE9, setAttribute('class') will result in empty class
 * if the element also has the :class attribute; However in
 * PhantomJS, setting `className` does not work on SVG elements...
 * So we have to do a conditional check here.
 *
 * @param {Element} el
 * @param {String} cls
 */

function setClass(el, cls) {
  /* istanbul ignore if */
  if (isIE9 && !/svg$/.test(el.namespaceURI)) {
    el.className = cls;
  } else {
    el.setAttribute('class', cls);
  }
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function addClass(el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      setClass(el, (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function removeClass(el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    setClass(el, cur.trim());
  }
  if (!el.className) {
    el.removeAttribute('class');
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element|DocumentFragment}
 */

function extractContent(el, asFragment) {
  var child;
  var rawContent;
  /* istanbul ignore if */
  if (isTemplate(el) && isFragment(el.content)) {
    el = el.content;
  }
  if (el.hasChildNodes()) {
    trimNode(el);
    rawContent = asFragment ? document.createDocumentFragment() : document.createElement('div');
    /* eslint-disable no-cond-assign */
    while (child = el.firstChild) {
      /* eslint-enable no-cond-assign */
      rawContent.appendChild(child);
    }
  }
  return rawContent;
}

/**
 * Trim possible empty head/tail text and comment
 * nodes inside a parent.
 *
 * @param {Node} node
 */

function trimNode(node) {
  var child;
  /* eslint-disable no-sequences */
  while ((child = node.firstChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  while ((child = node.lastChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  /* eslint-enable no-sequences */
}

function isTrimmable(node) {
  return node && (node.nodeType === 3 && !node.data.trim() || node.nodeType === 8);
}

/**
 * Check if an element is a template tag.
 * Note if the template appears inside an SVG its tagName
 * will be in lowercase.
 *
 * @param {Element} el
 */

function isTemplate(el) {
  return el.tagName && el.tagName.toLowerCase() === 'template';
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - fragment instance
 * - v-html
 * - v-if
 * - v-for
 * - component
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

function createAnchor(content, persist) {
  var anchor = config.debug ? document.createComment(content) : document.createTextNode(persist ? ' ' : '');
  anchor.__v_anchor = true;
  return anchor;
}

/**
 * Find a component ref attribute that starts with $.
 *
 * @param {Element} node
 * @return {String|undefined}
 */

var refRE = /^v-ref:/;

function findRef(node) {
  if (node.hasAttributes()) {
    var attrs = node.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var name = attrs[i].name;
      if (refRE.test(name)) {
        return camelize(name.replace(refRE, ''));
      }
    }
  }
}

/**
 * Map a function to a range of nodes .
 *
 * @param {Node} node
 * @param {Node} end
 * @param {Function} op
 */

function mapNodeRange(node, end, op) {
  var next;
  while (node !== end) {
    next = node.nextSibling;
    op(node);
    node = next;
  }
  op(end);
}

/**
 * Remove a range of nodes with transition, store
 * the nodes in a fragment with correct ordering,
 * and call callback when done.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Function} cb
 */

function removeNodeRange(start, end, vm, frag, cb) {
  var done = false;
  var removed = 0;
  var nodes = [];
  mapNodeRange(start, end, function (node) {
    if (node === end) done = true;
    nodes.push(node);
    removeWithTransition(node, vm, onRemoved);
  });
  function onRemoved() {
    removed++;
    if (done && removed >= nodes.length) {
      for (var i = 0; i < nodes.length; i++) {
        frag.appendChild(nodes[i]);
      }
      cb && cb();
    }
  }
}

/**
 * Check if a node is a DocumentFragment.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isFragment(node) {
  return node && node.nodeType === 11;
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 *
 * @param {Element} el
 * @return {String}
 */

function getOuterHTML(el) {
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML;
  }
}

var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/i;
var reservedTagRE = /^(slot|partial|component)$/i;

var isUnknownElement = undefined;
if (process.env.NODE_ENV !== 'production') {
  isUnknownElement = function (el, tag) {
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
    } else {
      return (/HTMLUnknownElement/.test(el.toString()) &&
        // Chrome returns unknown for several HTML5 elements.
        // https://code.google.com/p/chromium/issues/detail?id=540526
        // Firefox returns unknown for some "Interactive elements."
        !/^(data|time|rtc|rb|details|dialog|summary)$/.test(tag)
      );
    }
  };
}

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function checkComponentAttr(el, options) {
  var tag = el.tagName.toLowerCase();
  var hasAttrs = el.hasAttributes();
  if (!commonTagRE.test(tag) && !reservedTagRE.test(tag)) {
    if (resolveAsset(options, 'components', tag)) {
      return { id: tag };
    } else {
      var is = hasAttrs && getIsBinding(el, options);
      if (is) {
        return is;
      } else if (process.env.NODE_ENV !== 'production') {
        var expectedTag = options._componentNameMap && options._componentNameMap[tag];
        if (expectedTag) {
          warn('Unknown custom element: <' + tag + '> - ' + 'did you mean <' + expectedTag + '>? ' + 'HTML is case-insensitive, remember to use kebab-case in templates.');
        } else if (isUnknownElement(el, tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.');
        }
      }
    }
  } else if (hasAttrs) {
    return getIsBinding(el, options);
  }
}

/**
 * Get "is" binding from an element.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function getIsBinding(el, options) {
  // dynamic syntax
  var exp = el.getAttribute('is');
  if (exp != null) {
    if (resolveAsset(options, 'components', exp)) {
      el.removeAttribute('is');
      return { id: exp };
    }
  } else {
    exp = getBindAttr(el, 'is');
    if (exp != null) {
      return { id: exp, dynamic: true };
    }
  }
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
};

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.init = strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = strats.activate = function (parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
};

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal ? extend(res, guardArrayAssets(childVal)) : res;
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */

strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */

var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} options
 */

function guardComponents(options) {
  if (options.components) {
    var components = options.components = guardArrayAssets(options.components);
    var ids = Object.keys(components);
    var def;
    if (process.env.NODE_ENV !== 'production') {
      var map = options._componentNameMap = {};
    }
    for (var i = 0, l = ids.length; i < l; i++) {
      var key = ids[i];
      if (commonTagRE.test(key) || reservedTagRE.test(key)) {
        process.env.NODE_ENV !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
        continue;
      }
      // record a all lowercase <-> kebab-case mapping for
      // possible custom element case error warning
      if (process.env.NODE_ENV !== 'production') {
        map[key.replace(/-/g, '').toLowerCase()] = hyphenate(key);
      }
      def = components[key];
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def);
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 *
 * @param {Object} options
 */

function guardProps(options) {
  var props = options.props;
  var i, val;
  if (isArray(props)) {
    options.props = {};
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        options.props[val] = null;
      } else if (val.name) {
        options.props[val.name] = val;
      }
    }
  } else if (isPlainObject(props)) {
    var keys = Object.keys(props);
    i = keys.length;
    while (i--) {
      val = props[keys[i]];
      if (typeof val === 'function') {
        props[keys[i]] = { type: val };
      }
    }
  }
}

/**
 * Guard an Array-format assets option and converted it
 * into the key-value Object format.
 *
 * @param {Object|Array} assets
 * @return {Object}
 */

function guardArrayAssets(assets) {
  if (isArray(assets)) {
    var res = {};
    var i = assets.length;
    var asset;
    while (i--) {
      asset = assets[i];
      var id = typeof asset === 'function' ? asset.options && asset.options.name || asset.id : asset.name || asset.id;
      if (!id) {
        process.env.NODE_ENV !== 'production' && warn('Array-syntax assets must provide a "name" or "id" field.');
      } else {
        res[id] = asset;
      }
    }
    return res;
  }
  return assets;
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

function mergeOptions(parent, child, vm) {
  guardComponents(child);
  guardProps(child);
  if (process.env.NODE_ENV !== 'production') {
    if (child.propsData && !vm) {
      warn('propsData can only be used as an instantiation option.');
    }
  }
  var options = {};
  var key;
  if (child['extends']) {
    parent = typeof child['extends'] === 'function' ? mergeOptions(parent, child['extends'].options, vm) : mergeOptions(parent, child['extends'], vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i];
      var mixinOptions = mixin.prototype instanceof Vue ? mixin.options : mixin;
      parent = mergeOptions(parent, mixinOptions, vm);
    }
  }
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @param {Boolean} warnMissing
 * @return {Object|Function}
 */

function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }
  var assets = options[type];
  var camelizedId;
  var res = assets[id] ||
  // camelCase ID
  assets[camelizedId = camelize(id)] ||
  // Pascal Case ID
  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */
function Dep() {
  this.id = uid$1++;
  this.subs = [];
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub);
};

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = toArray(this.subs);
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

def(arrayProto, '$set', function $set(index, val) {
  if (index >= this.length) {
    this.length = Number(index) + 1;
  }
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index or target element reference.
 *
 * @param {*} item
 */

def(arrayProto, '$remove', function $remove(item) {
  /* istanbul ignore if */
  if (!this.length) return;
  var index = indexOf(this, item);
  if (index > -1) {
    return this.splice(index, 1);
  }
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However in certain cases, e.g.
 * v-for scope alias and props, we don't want to force conversion
 * because the value may be a nested value under a frozen data structure.
 *
 * So whenever we want to set a reactive property without forcing
 * conversion on the new value, we wrap that call inside this function.
 */

var shouldConvert = true;

function withoutConversion(fn) {
  shouldConvert = false;
  fn();
  shouldConvert = true;
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  def(value, '__ob__', this);
  if (isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  var keys = Object.keys(obj);
  for (var i = 0, l = keys.length; i < l; i++) {
    this.convert(keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val);
};

/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  this.vms.$remove(vm);
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} src
 */

function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldConvert && (isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 */

function defineReactive(obj, key, val) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}



var util = Object.freeze({
	defineReactive: defineReactive,
	set: set,
	del: del,
	hasOwn: hasOwn,
	isLiteral: isLiteral,
	isReserved: isReserved,
	_toString: _toString,
	toNumber: toNumber,
	toBoolean: toBoolean,
	stripQuotes: stripQuotes,
	camelize: camelize,
	hyphenate: hyphenate,
	classify: classify,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	def: def,
	debounce: _debounce,
	indexOf: indexOf,
	cancellable: cancellable,
	looseEqual: looseEqual,
	isArray: isArray,
	hasProto: hasProto,
	inBrowser: inBrowser,
	devtools: devtools,
	isIE: isIE,
	isIE9: isIE9,
	isAndroid: isAndroid,
	isIos: isIos,
	iosVersionMatch: iosVersionMatch,
	iosVersion: iosVersion,
	hasMutationObserverBug: hasMutationObserverBug,
	get transitionProp () { return transitionProp; },
	get transitionEndEvent () { return transitionEndEvent; },
	get animationProp () { return animationProp; },
	get animationEndEvent () { return animationEndEvent; },
	nextTick: nextTick,
	get _Set () { return _Set; },
	query: query,
	inDoc: inDoc,
	getAttr: getAttr,
	getBindAttr: getBindAttr,
	hasBindAttr: hasBindAttr,
	before: before,
	after: after,
	remove: remove,
	prepend: prepend,
	replace: replace,
	on: on,
	off: off,
	setClass: setClass,
	addClass: addClass,
	removeClass: removeClass,
	extractContent: extractContent,
	trimNode: trimNode,
	isTemplate: isTemplate,
	createAnchor: createAnchor,
	findRef: findRef,
	mapNodeRange: mapNodeRange,
	removeNodeRange: removeNodeRange,
	isFragment: isFragment,
	getOuterHTML: getOuterHTML,
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	checkComponentAttr: checkComponentAttr,
	commonTagRE: commonTagRE,
	reservedTagRE: reservedTagRE,
	get warn () { return warn; }
});

var uid = 0;

function initMixin (Vue) {
  /**
   * The main init sequence. This is called for every
   * instance, including ones that are created from extended
   * constructors.
   *
   * @param {Object} options - this options object should be
   *                           the result of merging class
   *                           options and the options passed
   *                           in to the constructor.
   */

  Vue.prototype._init = function (options) {
    options = options || {};

    this.$el = null;
    this.$parent = options.parent;
    this.$root = this.$parent ? this.$parent.$root : this;
    this.$children = [];
    this.$refs = {}; // child vm references
    this.$els = {}; // element references
    this._watchers = []; // all watchers as an array
    this._directives = []; // all directives

    // a uid
    this._uid = uid++;

    // a flag to avoid this being observed
    this._isVue = true;

    // events bookkeeping
    this._events = {}; // registered callbacks
    this._eventsCount = {}; // for $broadcast optimization

    // fragment instance properties
    this._isFragment = false;
    this._fragment = // @type {DocumentFragment}
    this._fragmentStart = // @type {Text|Comment}
    this._fragmentEnd = null; // @type {Text|Comment}

    // lifecycle state
    this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = this._vForRemoving = false;
    this._unlinkFn = null;

    // context:
    // if this is a transcluded component, context
    // will be the common parent vm of this instance
    // and its host.
    this._context = options._context || this.$parent;

    // scope:
    // if this is inside an inline v-for, the scope
    // will be the intermediate scope created for this
    // repeat fragment. this is used for linking props
    // and container directives.
    this._scope = options._scope;

    // fragment:
    // if this instance is compiled inside a Fragment, it
    // needs to reigster itself as a child of that fragment
    // for attach/detach to work properly.
    this._frag = options._frag;
    if (this._frag) {
      this._frag.children.push(this);
    }

    // push self into parent / transclusion host
    if (this.$parent) {
      this.$parent.$children.push(this);
    }

    // merge options.
    options = this.$options = mergeOptions(this.constructor.options, options, this);

    // set ref
    this._updateRef();

    // initialize data as empty object.
    // it will be filled up in _initData().
    this._data = {};

    // call init hook
    this._callHook('init');

    // initialize data observation and scope inheritance.
    this._initState();

    // setup event system and option events.
    this._initEvents();

    // call created hook
    this._callHook('created');

    // if `el` option is passed, start compilation.
    if (options.el) {
      this.$mount(options.el);
    }
  };
}

var pathCache = new Cache(1000);

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} ch
 * @return {String} type
 */

function getPathCharType(ch) {
  if (ch === undefined) {
    return 'eof';
  }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30:
      // 0
      return ch;

    case 0x5F: // _
    case 0x24:
      // $
      return 'ident';

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0: // No-break space
    case 0xFEFF: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029:
      // Paragraph Separator
      return 'ws';
  }

  // a-z, A-Z
  if (code >= 0x61 && code <= 0x7A || code >= 0x41 && code <= 0x5A) {
    return 'ident';
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number';
  }

  return 'else';
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 *
 * @param {String} path
 * @return {String}
 */

function formatSubPath(path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}

/**
 * Parse a string path into an array of segments
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parse(path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c, newChar, key, type, transition, action, typeMap;

  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }

  while (mode != null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        return;
      }
    }

    if (mode === AFTER_PATH) {
      keys.raw = path;
      return keys;
    }
  }
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath(path) {
  var hit = pathCache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      pathCache.put(path, hit);
    }
  }
  return hit;
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

function getPath(obj, path) {
  return parseExpression(path).get(obj);
}

/**
 * Warn against setting non-existent root path on a vm.
 */

var warnNonExistent;
if (process.env.NODE_ENV !== 'production') {
  warnNonExistent = function (path, vm) {
    warn('You are setting a non-existent path "' + path.raw + '" ' + 'on a vm instance. Consider pre-initializing the property ' + 'with the "data" option for more reliable reactivity ' + 'and better performance.', vm);
  };
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

function setPath(obj, path, val) {
  var original = obj;
  if (typeof path === 'string') {
    path = parse(path);
  }
  if (!path || !isObject(obj)) {
    return false;
  }
  var last, key;
  for (var i = 0, l = path.length; i < l; i++) {
    last = obj;
    key = path[i];
    if (key.charAt(0) === '*') {
      key = parseExpression(key.slice(1)).get.call(original, original);
    }
    if (i < l - 1) {
      obj = obj[key];
      if (!isObject(obj)) {
        obj = {};
        if (process.env.NODE_ENV !== 'production' && last._isVue) {
          warnNonExistent(path, last);
        }
        set(last, key, obj);
      }
    } else {
      if (isArray(obj)) {
        obj.$set(key, val);
      } else if (key in obj) {
        obj[key] = val;
      } else {
        if (process.env.NODE_ENV !== 'production' && obj._isVue) {
          warnNonExistent(path, obj);
        }
        set(obj, key, val);
      }
    }
  }
  return true;
}

var path = Object.freeze({
  parsePath: parsePath,
  getPath: getPath,
  setPath: setPath
});

var expressionCache = new Cache(1000);

var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

// keywords that don't make sense inside expressions
var improperKeywords = 'break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'protected,static,interface,private,public';
var improperKeywordsRE = new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
var literalValueRE$1 = /^(?:true|false|null|undefined|Infinity|NaN)$/;

function noop() {}

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = [];

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save(str, isString) {
  var i = saved.length;
  saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
  return '"' + i + '"';
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite(raw) {
  var c = raw.charAt(0);
  var path = raw.slice(1);
  if (allowedKeywordsRE.test(path)) {
    return raw;
  } else {
    path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
    return c + 'scope.' + path;
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore(str, i) {
  return saved[i];
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @return {Function}
 */

function compileGetter(exp) {
  if (improperKeywordsRE.test(exp)) {
    process.env.NODE_ENV !== 'production' && warn('Avoid using reserved keywords in expression: ' + exp);
  }
  // reset state
  saved.length = 0;
  // save strings and object literal keys
  var body = exp.replace(saveRE, save).replace(wsRE, '');
  // rewrite all paths
  // pad 1 space here because the regex matches 1 extra char
  body = (' ' + body).replace(identRE, rewrite).replace(restoreRE, restore);
  return makeGetterFn(body);
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetterFn(body) {
  try {
    /* eslint-disable no-new-func */
    return new Function('scope', 'return ' + body + ';');
    /* eslint-enable no-new-func */
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if (e.toString().match(/unsafe-eval|CSP/)) {
        warn('It seems you are using the default build of Vue.js in an environment ' + 'with Content Security Policy that prohibits unsafe-eval. ' + 'Use the CSP-compliant build instead: ' + 'http://vuejs.org/guide/installation.html#CSP-compliant-build');
      } else {
        warn('Invalid expression. ' + 'Generated function body: ' + body);
      }
    }
    return noop;
  }
}

/**
 * Compile a setter function for the expression.
 *
 * @param {String} exp
 * @return {Function|undefined}
 */

function compileSetter(exp) {
  var path = parsePath(exp);
  if (path) {
    return function (scope, val) {
      setPath(scope, path, val);
    };
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid setter expression: ' + exp);
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function parseExpression(exp, needSet) {
  exp = exp.trim();
  // try cache
  var hit = expressionCache.get(exp);
  if (hit) {
    if (needSet && !hit.set) {
      hit.set = compileSetter(hit.exp);
    }
    return hit;
  }
  var res = { exp: exp };
  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple getter
  ? makeGetterFn('scope.' + exp)
  // dynamic getter
  : compileGetter(exp);
  if (needSet) {
    res.set = compileSetter(exp);
  }
  expressionCache.put(exp, res);
  return res;
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} exp
 * @return {Boolean}
 */

function isSimplePath(exp) {
  return pathTestRE.test(exp) &&
  // don't treat literal values as paths
  !literalValueRE$1.test(exp) &&
  // Math constants e.g. Math.PI, Math.E etc.
  exp.slice(0, 5) !== 'Math.';
}

var expression = Object.freeze({
  parseExpression: parseExpression,
  isSimplePath: isSimplePath
});

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.

var queue = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;

/**
 * Reset the batcher's state.
 */

function resetBatcherState() {
  queue.length = 0;
  userQueue.length = 0;
  has = {};
  circular = {};
  waiting = false;
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue() {
  var _again = true;

  _function: while (_again) {
    _again = false;

    runBatcherQueue(queue);
    runBatcherQueue(userQueue);
    // user watchers triggered more watchers,
    // keep flushing until it depletes
    if (queue.length) {
      _again = true;
      continue _function;
    }
    // dev tool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
    resetBatcherState();
  }
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue(queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (var i = 0; i < queue.length; i++) {
    var watcher = queue[i];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn('You may have an infinite update loop for watcher ' + 'with expression "' + watcher.expression + '"', watcher.vm);
        break;
      }
    }
  }
  queue.length = 0;
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

function pushWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    // push watcher into appropriate queue
    var q = watcher.user ? userQueue : queue;
    has[id] = q.length;
    q.push(watcher);
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushBatcherQueue);
    }
  }
}

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String|Function} expOrFn
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */
function Watcher(vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options);
  }
  var isFn = typeof expOrFn === 'function';
  this.vm = vm;
  vm._watchers.push(this);
  this.expression = expOrFn;
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.prevError = null; // for async error stacks
  // parse expression for getter/setter
  if (isFn) {
    this.getter = expOrFn;
    this.setter = undefined;
  } else {
    var res = parseExpression(expOrFn, this.twoWay);
    this.getter = res.get;
    this.setter = res.set;
  }
  this.value = this.lazy ? undefined : this.get();
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false;
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet();
  var scope = this.scope || this.vm;
  var value;
  try {
    value = this.getter.call(scope, scope);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating expression ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  if (this.preProcess) {
    value = this.preProcess(value);
  }
  if (this.filters) {
    value = scope._applyFilters(value, null, this.filters, false);
  }
  if (this.postProcess) {
    value = this.postProcess(value);
  }
  this.afterGet();
  return value;
};

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

Watcher.prototype.set = function (value) {
  var scope = this.scope || this.vm;
  if (this.filters) {
    value = scope._applyFilters(value, this.value, this.filters, true);
  }
  try {
    this.setter.call(scope, scope, value);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating setter ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // two-way sync for v-for alias
  var forContext = scope.$forContext;
  if (forContext && forContext.alias === this.expression) {
    if (forContext.filters) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using two-way binding on ' + 'a v-for alias (' + this.expression + '), and the ' + 'v-for has filters. This will not work properly. ' + 'Either remove the filters or use an array of ' + 'objects and bind to object properties instead.', this.vm);
      return;
    }
    forContext._withLock(function () {
      if (scope.$key) {
        // original is an object
        forContext.rawValue[scope.$key] = value;
      } else {
        forContext.rawValue.$set(scope.$index, value);
      }
    });
  }
};

/**
 * Prepare for dependency collection.
 */

Watcher.prototype.beforeGet = function () {
  Dep.target = this;
};

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */

Watcher.prototype.afterGet = function () {
  Dep.target = null;
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync || !config.async) {
    this.run();
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
    this.queued = true;
    // record before-push error stack in debug mode
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.debug) {
      this.prevError = new Error('[vue] async stack trace');
    }
    pushWatcher(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated; but only do so if this is a
    // non-shallow update (caused by a vm digest).
    (isObject(value) || this.deep) && !this.shallow) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      // in debug + async mode, when a watcher callbacks
      // throws, we also throw the saved before-push error
      // so the full cross-tick stack trace is available.
      var prevError = this.prevError;
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.debug && prevError) {
        this.prevError = null;
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          nextTick(function () {
            throw prevError;
          }, 0);
          throw e;
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
    this.queued = this.shallow = false;
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
  // avoid overwriting another watcher that is being
  // collected.
  var current = Dep.target;
  this.value = this.get();
  this.dirty = false;
  Dep.target = current;
};

/**
 * Depend on all deps collected by this watcher.
 */

Watcher.prototype.depend = function () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed or is performing a v-for
    // re-render (the watcher list is then filtered by v-for).
    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
      this.vm._watchers.$remove(this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
    this.vm = this.cb = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {*} val
 */

var seenObjects = new _Set();
function traverse(val, seen) {
  var i = undefined,
      keys = undefined;
  if (!seen) {
    seen = seenObjects;
    seen.clear();
  }
  var isA = isArray(val);
  var isO = isObject(val);
  if ((isA || isO) && Object.isExtensible(val)) {
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return;
      } else {
        seen.add(depId);
      }
    }
    if (isA) {
      i = val.length;
      while (i--) traverse(val[i], seen);
    } else if (isO) {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) traverse(val[keys[i]], seen);
    }
  }
}

var text$1 = {

  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
  },

  update: function update(value) {
    this.el[this.attr] = _toString(value);
  }
};

var templateCache = new Cache(1000);
var idSelectorCache = new Cache(1000);

var map = {
  efault: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
};

map.td = map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option = map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, '<table>', '</table>'];

map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, '<svg ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' + 'xmlns:ev="http://www.w3.org/2001/xml-events"' + 'version="1.1">', '</svg>'];

/**
 * Check if a node is a supported template node with a
 * DocumentFragment content.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isRealTemplate(node) {
  return isTemplate(node) && isFragment(node.content);
}

var tagRE$1 = /<([\w:-]+)/;
var entityRE = /&#?\w+?;/;
var commentRE = /<!--/;

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @param {Boolean} raw
 * @return {DocumentFragment}
 */

function stringToFragment(templateString, raw) {
  // try a cache hit first
  var cacheKey = raw ? templateString : templateString.trim();
  var hit = templateCache.get(cacheKey);
  if (hit) {
    return hit;
  }

  var frag = document.createDocumentFragment();
  var tagMatch = templateString.match(tagRE$1);
  var entityMatch = entityRE.test(templateString);
  var commentMatch = commentRE.test(templateString);

  if (!tagMatch && !entityMatch && !commentMatch) {
    // text only, return a single text node.
    frag.appendChild(document.createTextNode(templateString));
  } else {
    var tag = tagMatch && tagMatch[1];
    var wrap = map[tag] || map.efault;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var node = document.createElement('div');

    node.innerHTML = prefix + templateString + suffix;
    while (depth--) {
      node = node.lastChild;
    }

    var child;
    /* eslint-disable no-cond-assign */
    while (child = node.firstChild) {
      /* eslint-enable no-cond-assign */
      frag.appendChild(child);
    }
  }
  if (!raw) {
    trimNode(frag);
  }
  templateCache.put(cacheKey, frag);
  return frag;
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment(node) {
  // if its a template tag and the browser supports it,
  // its content is already a document fragment. However, iOS Safari has
  // bug when using directly cloned template content with touch
  // events and can cause crashes when the nodes are removed from DOM, so we
  // have to treat template elements as string templates. (#2805)
  /* istanbul ignore if */
  if (isRealTemplate(node)) {
    return stringToFragment(node.innerHTML);
  }
  // script template
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent);
  }
  // normal node, clone it to avoid mutating the original
  var clonedNode = cloneNode(node);
  var frag = document.createDocumentFragment();
  var child;
  /* eslint-disable no-cond-assign */
  while (child = clonedNode.firstChild) {
    /* eslint-enable no-cond-assign */
    frag.appendChild(child);
  }
  trimNode(frag);
  return frag;
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/showug.cgi?id=137755
var hasBrokenTemplate = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var a = document.createElement('div');
    a.innerHTML = '<template>1</template>';
    return !a.cloneNode(true).firstChild.innerHTML;
  } else {
    return false;
  }
})();

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var t = document.createElement('textarea');
    t.placeholder = 't';
    return t.cloneNode(true).value === 't';
  } else {
    return false;
  }
})();

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

function cloneNode(node) {
  /* istanbul ignore if */
  if (!node.querySelectorAll) {
    return node.cloneNode();
  }
  var res = node.cloneNode(true);
  var i, original, cloned;
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    var tempClone = res;
    if (isRealTemplate(node)) {
      node = node.content;
      tempClone = res.content;
    }
    original = node.querySelectorAll('template');
    if (original.length) {
      cloned = tempClone.querySelectorAll('template');
      i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(cloneNode(original[i]), cloned[i]);
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value;
    } else {
      original = node.querySelectorAll('textarea');
      if (original.length) {
        cloned = res.querySelectorAll('textarea');
        i = cloned.length;
        while (i--) {
          cloned[i].value = original[i].value;
        }
      }
    }
  }
  return res;
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *        Possible values include:
 *        - DocumentFragment object
 *        - Node object of type Template
 *        - id selector: '#some-template-id'
 *        - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} shouldClone
 * @param {Boolean} raw
 *        inline HTML interpolation. Do not check for id
 *        selector and keep whitespace in the string.
 * @return {DocumentFragment|undefined}
 */

function parseTemplate(template, shouldClone, raw) {
  var node, frag;

  // if the template is already a document fragment,
  // do nothing
  if (isFragment(template)) {
    trimNode(template);
    return shouldClone ? cloneNode(template) : template;
  }

  if (typeof template === 'string') {
    // id selector
    if (!raw && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template);
      if (!frag) {
        node = document.getElementById(template.slice(1));
        if (node) {
          frag = nodeToFragment(node);
          // save selector to cache
          idSelectorCache.put(template, frag);
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template, raw);
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template);
  }

  return frag && shouldClone ? cloneNode(frag) : frag;
}

var template = Object.freeze({
  cloneNode: cloneNode,
  parseTemplate: parseTemplate
});

var html = {

  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
      // replace the placeholder with proper anchor
      this.anchor = createAnchor('v-html');
      replace(this.el, this.anchor);
    }
  },

  update: function update(value) {
    value = _toString(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },

  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      remove(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = parseTemplate(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = toArray(frag.childNodes);
    before(frag, this.anchor);
  }
};

/**
 * Abstraction for a partially-compiled fragment.
 * Can optionally compile content with a child scope.
 *
 * @param {Function} linker
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Vue} [host]
 * @param {Object} [scope]
 * @param {Fragment} [parentFrag]
 */
function Fragment(linker, vm, frag, host, scope, parentFrag) {
  this.children = [];
  this.childFrags = [];
  this.vm = vm;
  this.scope = scope;
  this.inserted = false;
  this.parentFrag = parentFrag;
  if (parentFrag) {
    parentFrag.childFrags.push(this);
  }
  this.unlink = linker(vm, frag, host, scope, this);
  var single = this.single = frag.childNodes.length === 1 &&
  // do not go single mode if the only node is an anchor
  !frag.childNodes[0].__v_anchor;
  if (single) {
    this.node = frag.childNodes[0];
    this.before = singleBefore;
    this.remove = singleRemove;
  } else {
    this.node = createAnchor('fragment-start');
    this.end = createAnchor('fragment-end');
    this.frag = frag;
    prepend(this.node, frag);
    frag.appendChild(this.end);
    this.before = multiBefore;
    this.remove = multiRemove;
  }
  this.node.__v_frag = this;
}

/**
 * Call attach/detach for all components contained within
 * this fragment. Also do so recursively for all child
 * fragments.
 *
 * @param {Function} hook
 */

Fragment.prototype.callHook = function (hook) {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i]);
  }
};

/**
 * Insert fragment before target, single node version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function singleBefore(target, withTransition) {
  this.inserted = true;
  var method = withTransition !== false ? beforeWithTransition : before;
  method(this.node, target, this.vm);
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove() {
  this.inserted = false;
  var shouldCallRemove = inDoc(this.node);
  var self = this;
  this.beforeRemove();
  removeWithTransition(this.node, this.vm, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function multiBefore(target, withTransition) {
  this.inserted = true;
  var vm = this.vm;
  var method = withTransition !== false ? beforeWithTransition : before;
  mapNodeRange(this.node, this.end, function (node) {
    method(node, target, vm);
  });
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove() {
  this.inserted = false;
  var self = this;
  var shouldCallRemove = inDoc(this.node);
  this.beforeRemove();
  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Prepare the fragment for removal.
 */

Fragment.prototype.beforeRemove = function () {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    // call the same method recursively on child
    // fragments, depth-first
    this.childFrags[i].beforeRemove(false);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    // Call destroy for all contained instances,
    // with remove:false and defer:true.
    // Defer is necessary because we need to
    // keep the children to call detach hooks
    // on them.
    this.children[i].$destroy(false, true);
  }
  var dirs = this.unlink.dirs;
  for (i = 0, l = dirs.length; i < l; i++) {
    // disable the watchers on all the directives
    // so that the rendered content stays the same
    // during removal.
    dirs[i]._watcher && dirs[i]._watcher.teardown();
  }
};

/**
 * Destroy the fragment.
 */

Fragment.prototype.destroy = function () {
  if (this.parentFrag) {
    this.parentFrag.childFrags.$remove(this);
  }
  this.node.__v_frag = null;
  this.unlink();
};

/**
 * Call attach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function attach(child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook('attached');
  }
}

/**
 * Call detach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function detach(child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook('detached');
  }
}

var linkerCache = new Cache(5000);

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */
function FragmentFactory(vm, el) {
  this.vm = vm;
  var template;
  var isString = typeof el === 'string';
  if (isString || isTemplate(el) && !el.hasAttribute('v-if')) {
    template = parseTemplate(el, true);
  } else {
    template = document.createDocumentFragment();
    template.appendChild(el);
  }
  this.template = template;
  // linker can be cached, but only for components
  var linker;
  var cid = vm.constructor.cid;
  if (cid > 0) {
    var cacheId = cid + (isString ? el : getOuterHTML(el));
    linker = linkerCache.get(cacheId);
    if (!linker) {
      linker = compile(template, vm.$options, true);
      linkerCache.put(cacheId, linker);
    }
  } else {
    linker = compile(template, vm.$options, true);
  }
  this.linker = linker;
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = cloneNode(this.template);
  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag);
};

var ON = 700;
var MODEL = 800;
var BIND = 850;
var TRANSITION = 1100;
var EL = 1500;
var COMPONENT = 1500;
var PARTIAL = 1750;
var IF = 2100;
var FOR = 2200;
var SLOT = 2300;

var uid$3 = 0;

var vFor = {

  priority: FOR,
  terminal: true,

  params: ['track-by', 'stagger', 'enter-stagger', 'leave-stagger'],

  bind: function bind() {
    // support "item in/of items" syntax
    var inMatch = this.expression.match(/(.*) (?:in|of) (.*)/);
    if (inMatch) {
      var itMatch = inMatch[1].match(/\((.*),(.*)\)/);
      if (itMatch) {
        this.iterator = itMatch[1].trim();
        this.alias = itMatch[2].trim();
      } else {
        this.alias = inMatch[1].trim();
      }
      this.expression = inMatch[2];
    }

    if (!this.alias) {
      process.env.NODE_ENV !== 'production' && warn('Invalid v-for expression "' + this.descriptor.raw + '": ' + 'alias is required.', this.vm);
      return;
    }

    // uid as a cache identifier
    this.id = '__v-for__' + ++uid$3;

    // check if this is an option list,
    // so that we know if we need to update the <select>'s
    // v-model when the option list has changed.
    // because v-model has a lower priority than v-for,
    // the v-model is not bound here yet, so we have to
    // retrive it in the actual updateModel() function.
    var tag = this.el.tagName;
    this.isOption = (tag === 'OPTION' || tag === 'OPTGROUP') && this.el.parentNode.tagName === 'SELECT';

    // setup anchor nodes
    this.start = createAnchor('v-for-start');
    this.end = createAnchor('v-for-end');
    replace(this.el, this.end);
    before(this.start, this.end);

    // cache
    this.cache = Object.create(null);

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el);
  },

  update: function update(data) {
    this.diff(data);
    this.updateRef();
    this.updateModel();
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   */

  diff: function diff(data) {
    // check if the Array was converted from an Object
    var item = data[0];
    var convertedFromObject = this.fromObject = isObject(item) && hasOwn(item, '$key') && hasOwn(item, '$value');

    var trackByKey = this.params.trackBy;
    var oldFrags = this.frags;
    var frags = this.frags = new Array(data.length);
    var alias = this.alias;
    var iterator = this.iterator;
    var start = this.start;
    var end = this.end;
    var inDocument = inDoc(start);
    var init = !oldFrags;
    var i, l, frag, key, value, primitive;

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i];
      key = convertedFromObject ? item.$key : null;
      value = convertedFromObject ? item.$value : item;
      primitive = !isObject(value);
      frag = !init && this.getCachedFrag(value, i, key);
      if (frag) {
        // reusable fragment
        frag.reused = true;
        // update $index
        frag.scope.$index = i;
        // update $key
        if (key) {
          frag.scope.$key = key;
        }
        // update iterator
        if (iterator) {
          frag.scope[iterator] = key !== null ? key : i;
        }
        // update data for track-by, object repeat &
        // primitive values.
        if (trackByKey || convertedFromObject || primitive) {
          withoutConversion(function () {
            frag.scope[alias] = value;
          });
        }
      } else {
        // new isntance
        frag = this.create(value, alias, i, key);
        frag.fresh = !init;
      }
      frags[i] = frag;
      if (init) {
        frag.before(end);
      }
    }

    // we're done for the initial render.
    if (init) {
      return;
    }

    // Second pass, go through the old fragments and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0;
    var totalRemoved = oldFrags.length - frags.length;
    // when removing a large number of fragments, watcher removal
    // turns out to be a perf bottleneck, so we batch the watcher
    // removals into a single filter call!
    this.vm._vForRemoving = true;
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i];
      if (!frag.reused) {
        this.deleteCachedFrag(frag);
        this.remove(frag, removalIndex++, totalRemoved, inDocument);
      }
    }
    this.vm._vForRemoving = false;
    if (removalIndex) {
      this.vm._watchers = this.vm._watchers.filter(function (w) {
        return w.active;
      });
    }

    // Final pass, move/insert new fragments into the
    // right place.
    var targetPrev, prevEl, currentPrev;
    var insertionIndex = 0;
    for (i = 0, l = frags.length; i < l; i++) {
      frag = frags[i];
      // this is the frag that we should be after
      targetPrev = frags[i - 1];
      prevEl = targetPrev ? targetPrev.staggerCb ? targetPrev.staggerAnchor : targetPrev.end || targetPrev.node : start;
      if (frag.reused && !frag.staggerCb) {
        currentPrev = findPrevFrag(frag, start, this.id);
        if (currentPrev !== targetPrev && (!currentPrev ||
        // optimization for moving a single item.
        // thanks to suggestions by @livoras in #1807
        findPrevFrag(currentPrev, start, this.id) !== targetPrev)) {
          this.move(frag, prevEl);
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDocument);
      }
      frag.reused = frag.fresh = false;
    }
  },

  /**
   * Create a new fragment instance.
   *
   * @param {*} value
   * @param {String} alias
   * @param {Number} index
   * @param {String} [key]
   * @return {Fragment}
   */

  create: function create(value, alias, index, key) {
    var host = this._host;
    // create iteration scope
    var parentScope = this._scope || this.vm;
    var scope = Object.create(parentScope);
    // ref holder for the scope
    scope.$refs = Object.create(parentScope.$refs);
    scope.$els = Object.create(parentScope.$els);
    // make sure point $parent to parent scope
    scope.$parent = parentScope;
    // for two-way binding on alias
    scope.$forContext = this;
    // define scope properties
    // important: define the scope alias without forced conversion
    // so that frozen data structures remain non-reactive.
    withoutConversion(function () {
      defineReactive(scope, alias, value);
    });
    defineReactive(scope, '$index', index);
    if (key) {
      defineReactive(scope, '$key', key);
    } else if (scope.$key) {
      // avoid accidental fallback
      def(scope, '$key', null);
    }
    if (this.iterator) {
      defineReactive(scope, this.iterator, key !== null ? key : index);
    }
    var frag = this.factory.create(host, scope, this._frag);
    frag.forId = this.id;
    this.cacheFrag(value, frag, index, key);
    return frag;
  },

  /**
   * Update the v-ref on owner vm.
   */

  updateRef: function updateRef() {
    var ref = this.descriptor.ref;
    if (!ref) return;
    var hash = (this._scope || this.vm).$refs;
    var refs;
    if (!this.fromObject) {
      refs = this.frags.map(findVmFromFrag);
    } else {
      refs = {};
      this.frags.forEach(function (frag) {
        refs[frag.scope.$key] = findVmFromFrag(frag);
      });
    }
    hash[ref] = refs;
  },

  /**
   * For option lists, update the containing v-model on
   * parent <select>.
   */

  updateModel: function updateModel() {
    if (this.isOption) {
      var parent = this.start.parentNode;
      var model = parent && parent.__v_model;
      if (model) {
        model.forceUpdate();
      }
    }
  },

  /**
   * Insert a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDocument
   */

  insert: function insert(frag, index, prevEl, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter');
    if (inDocument && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor;
      if (!anchor) {
        anchor = frag.staggerAnchor = createAnchor('stagger-anchor');
        anchor.__v_frag = frag;
      }
      after(anchor, prevEl);
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.before(anchor);
        remove(anchor);
      });
      setTimeout(op, staggerAmount);
    } else {
      var target = prevEl.nextSibling;
      /* istanbul ignore if */
      if (!target) {
        // reset end anchor position in case the position was messed up
        // by an external drag-n-drop library.
        after(this.end, prevEl);
        target = this.end;
      }
      frag.before(target);
    }
  },

  /**
   * Remove a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {Boolean} inDocument
   */

  remove: function remove(frag, index, total, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
      // it's not possible for the same frag to be removed
      // twice, so if we have a pending stagger callback,
      // it means this frag is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return;
    }
    var staggerAmount = this.getStagger(frag, index, total, 'leave');
    if (inDocument && staggerAmount) {
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.remove();
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.remove();
    }
  },

  /**
   * Move a fragment to a new position.
   * Force no transition.
   *
   * @param {Fragment} frag
   * @param {Node} prevEl
   */

  move: function move(frag, prevEl) {
    // fix a common issue with Sortable:
    // if prevEl doesn't have nextSibling, this means it's
    // been dragged after the end anchor. Just re-position
    // the end anchor to the end of the container.
    /* istanbul ignore if */
    if (!prevEl.nextSibling) {
      this.end.parentNode.appendChild(this.end);
    }
    frag.before(prevEl.nextSibling, false);
  },

  /**
   * Cache a fragment using track-by or the object key.
   *
   * @param {*} value
   * @param {Fragment} frag
   * @param {Number} index
   * @param {String} [key]
   */

  cacheFrag: function cacheFrag(value, frag, index, key) {
    var trackByKey = this.params.trackBy;
    var cache = this.cache;
    var primitive = !isObject(value);
    var id;
    if (key || trackByKey || primitive) {
      id = getTrackByKey(index, key, value, trackByKey);
      if (!cache[id]) {
        cache[id] = frag;
      } else if (trackByKey !== '$index') {
        process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
      }
    } else {
      id = this.id;
      if (hasOwn(value, id)) {
        if (value[id] === null) {
          value[id] = frag;
        } else {
          process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
        }
      } else if (Object.isExtensible(value)) {
        def(value, id, frag);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Frozen v-for objects cannot be automatically tracked, make sure to ' + 'provide a track-by key.');
      }
    }
    frag.raw = value;
  },

  /**
   * Get a cached fragment from the value/index/key
   *
   * @param {*} value
   * @param {Number} index
   * @param {String} key
   * @return {Fragment}
   */

  getCachedFrag: function getCachedFrag(value, index, key) {
    var trackByKey = this.params.trackBy;
    var primitive = !isObject(value);
    var frag;
    if (key || trackByKey || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      frag = this.cache[id];
    } else {
      frag = value[this.id];
    }
    if (frag && (frag.reused || frag.fresh)) {
      process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
    }
    return frag;
  },

  /**
   * Delete a fragment from cache.
   *
   * @param {Fragment} frag
   */

  deleteCachedFrag: function deleteCachedFrag(frag) {
    var value = frag.raw;
    var trackByKey = this.params.trackBy;
    var scope = frag.scope;
    var index = scope.$index;
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = hasOwn(scope, '$key') && scope.$key;
    var primitive = !isObject(value);
    if (trackByKey || key || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      this.cache[id] = null;
    } else {
      value[this.id] = null;
      frag.raw = null;
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger: function getStagger(frag, index, total, type) {
    type = type + 'Stagger';
    var trans = frag.node.__v_trans;
    var hooks = trans && trans.hooks;
    var hook = hooks && (hooks[type] || hooks.stagger);
    return hook ? hook.call(frag, index, total) : index * parseInt(this.params[type] || this.params.stagger, 10);
  },

  /**
   * Pre-process the value before piping it through the
   * filters. This is passed to and called by the watcher.
   */

  _preProcess: function _preProcess(value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value;
    return value;
  },

  /**
   * Post-process the value after it has been piped through
   * the filters. This is passed to and called by the watcher.
   *
   * It is necessary for this to be called during the
   * watcher's dependency collection phase because we want
   * the v-for to update when the source Object is mutated.
   */

  _postProcess: function _postProcess(value) {
    if (isArray(value)) {
      return value;
    } else if (isPlainObject(value)) {
      // convert plain object to array.
      var keys = Object.keys(value);
      var i = keys.length;
      var res = new Array(i);
      var key;
      while (i--) {
        key = keys[i];
        res[i] = {
          $key: key,
          $value: value[key]
        };
      }
      return res;
    } else {
      if (typeof value === 'number' && !isNaN(value)) {
        value = range(value);
      }
      return value || [];
    }
  },

  unbind: function unbind() {
    if (this.descriptor.ref) {
      (this._scope || this.vm).$refs[this.descriptor.ref] = null;
    }
    if (this.frags) {
      var i = this.frags.length;
      var frag;
      while (i--) {
        frag = this.frags[i];
        this.deleteCachedFrag(frag);
        frag.destroy();
      }
    }
  }
};

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its inserted flag
 * should have been set to false so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return frag that is bound to this v-for. (see #929)
 *
 * @param {Fragment} frag
 * @param {Comment|Text} anchor
 * @param {String} id
 * @return {Fragment}
 */

function findPrevFrag(frag, anchor, id) {
  var el = frag.node.previousSibling;
  /* istanbul ignore if */
  if (!el) return;
  frag = el.__v_frag;
  while ((!frag || frag.forId !== id || !frag.inserted) && el !== anchor) {
    el = el.previousSibling;
    /* istanbul ignore if */
    if (!el) return;
    frag = el.__v_frag;
  }
  return frag;
}

/**
 * Find a vm from a fragment.
 *
 * @param {Fragment} frag
 * @return {Vue|undefined}
 */

function findVmFromFrag(frag) {
  var node = frag.node;
  // handle multi-node frag
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling;
    }
  }
  return node.__vue__;
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range(n) {
  var i = -1;
  var ret = new Array(Math.floor(n));
  while (++i < n) {
    ret[i] = i;
  }
  return ret;
}

/**
 * Get the track by key for an item.
 *
 * @param {Number} index
 * @param {String} key
 * @param {*} value
 * @param {String} [trackByKey]
 */

function getTrackByKey(index, key, value, trackByKey) {
  return trackByKey ? trackByKey === '$index' ? index : trackByKey.charAt(0).match(/\w/) ? getPath(value, trackByKey) : value[trackByKey] : key || value;
}

if (process.env.NODE_ENV !== 'production') {
  vFor.warnDuplicate = function (value) {
    warn('Duplicate value found in v-for="' + this.descriptor.raw + '": ' + JSON.stringify(value) + '. Use track-by="$index" if ' + 'you are expecting duplicate values.', this.vm);
  };
}

var vIf = {

  priority: IF,
  terminal: true,

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling;
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next);
        this.elseEl = next;
      }
      // check main block
      this.anchor = createAnchor('v-if');
      replace(el, this.anchor);
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.', this.vm);
      this.invalid = true;
    }
  },

  update: function update(value) {
    if (this.invalid) return;
    if (value) {
      if (!this.frag) {
        this.insert();
      }
    } else {
      this.remove();
    }
  },

  insert: function insert() {
    if (this.elseFrag) {
      this.elseFrag.remove();
      this.elseFrag = null;
    }
    // lazy init factory
    if (!this.factory) {
      this.factory = new FragmentFactory(this.vm, this.el);
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag);
    this.frag.before(this.anchor);
  },

  remove: function remove() {
    if (this.frag) {
      this.frag.remove();
      this.frag = null;
    }
    if (this.elseEl && !this.elseFrag) {
      if (!this.elseFactory) {
        this.elseFactory = new FragmentFactory(this.elseEl._context || this.vm, this.elseEl);
      }
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
      this.elseFrag.before(this.anchor);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
    if (this.elseFrag) {
      this.elseFrag.destroy();
    }
  }
};

var show = {

  bind: function bind() {
    // check else block
    var next = this.el.nextElementSibling;
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next;
    }
  },

  update: function update(value) {
    this.apply(this.el, value);
    if (this.elseEl) {
      this.apply(this.elseEl, !value);
    }
  },

  apply: function apply(el, value) {
    if (inDoc(el)) {
      applyTransition(el, value ? 1 : -1, toggle, this.vm);
    } else {
      toggle();
    }
    function toggle() {
      el.style.display = value ? '' : 'none';
    }
  }
};

var text$2 = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    var isRange = el.type === 'range';
    var lazy = this.params.lazy;
    var number = this.params.number;
    var debounce = this.params.debounce;

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false;
    if (!isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true;
      });
      this.on('compositionend', function () {
        composing = false;
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener();
        }
      });
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false;
    if (!isRange && !lazy) {
      this.on('focus', function () {
        self.focused = true;
      });
      this.on('blur', function () {
        self.focused = false;
        // do not sync value after fragment removal (#2017)
        if (!self._frag || self._frag.inserted) {
          self.rawListener();
        }
      });
    }

    // Now attach the main listener
    this.listener = this.rawListener = function () {
      if (composing || !self._bound) {
        return;
      }
      var val = number || isRange ? toNumber(el.value) : el.value;
      self.set(val);
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value);
        }
      });
    };

    // apply debounce
    if (debounce) {
      this.listener = _debounce(this.listener, debounce);
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function';
    if (this.hasjQuery) {
      var method = jQuery.fn.on ? 'on' : 'bind';
      jQuery(el)[method]('change', this.rawListener);
      if (!lazy) {
        jQuery(el)[method]('input', this.listener);
      }
    } else {
      this.on('change', this.rawListener);
      if (!lazy) {
        this.on('input', this.listener);
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && isIE9) {
      this.on('cut', function () {
        nextTick(self.listener);
      });
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener();
        }
      });
    }

    // set initial value if present
    if (el.hasAttribute('value') || el.tagName === 'TEXTAREA' && el.value.trim()) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    // #3029 only update when the value changes. This prevent
    // browsers from overwriting values like selectionStart
    value = _toString(value);
    if (value !== this.el.value) this.el.value = value;
  },

  unbind: function unbind() {
    var el = this.el;
    if (this.hasjQuery) {
      var method = jQuery.fn.off ? 'off' : 'unbind';
      jQuery(el)[method]('change', this.listener);
      jQuery(el)[method]('input', this.listener);
    }
  }
};

var radio = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      // value overwrite via v-bind:value
      if (el.hasOwnProperty('_value')) {
        return el._value;
      }
      var val = el.value;
      if (self.params.number) {
        val = toNumber(val);
      }
      return val;
    };

    this.listener = function () {
      self.set(self.getValue());
    };
    this.on('change', this.listener);

    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.checked = looseEqual(value, this.getValue());
  }
};

var select = {

  bind: function bind() {
    var _this = this;

    var self = this;
    var el = this.el;

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get());
      }
    };

    // check if this is a multiple select
    var multiple = this.multiple = el.hasAttribute('multiple');

    // attach listener
    this.listener = function () {
      var value = getValue(el, multiple);
      value = self.params.number ? isArray(value) ? value.map(toNumber) : toNumber(value) : value;
      self.set(value);
    };
    this.on('change', this.listener);

    // if has initial value, set afterBind
    var initValue = getValue(el, multiple, true);
    if (multiple && initValue.length || !multiple && initValue !== null) {
      this.afterBind = this.listener;
    }

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', function () {
      nextTick(_this.forceUpdate);
    });
    if (!inDoc(el)) {
      nextTick(this.forceUpdate);
    }
  },

  update: function update(value) {
    var el = this.el;
    el.selectedIndex = -1;
    var multi = this.multiple && isArray(value);
    var options = el.options;
    var i = options.length;
    var op, val;
    while (i--) {
      op = options[i];
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      /* eslint-disable eqeqeq */
      op.selected = multi ? indexOf$1(value, val) > -1 : looseEqual(value, val);
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function unbind() {
    /* istanbul ignore next */
    this.vm.$off('hook:attached', this.forceUpdate);
  }
};

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @param {Boolean} init
 * @return {Array|*}
 */

function getValue(el, multi, init) {
  var res = multi ? [] : null;
  var op, val, selected;
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i];
    selected = init ? op.hasAttribute('selected') : op.selected;
    if (selected) {
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      if (multi) {
        res.push(val);
      } else {
        return val;
      }
    }
  }
  return res;
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf$1(arr, val) {
  var i = arr.length;
  while (i--) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }
  return -1;
}

var checkbox = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      return el.hasOwnProperty('_value') ? el._value : self.params.number ? toNumber(el.value) : el.value;
    };

    function getBooleanValue() {
      var val = el.checked;
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue;
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue;
      }
      return val;
    }

    this.listener = function () {
      var model = self._watcher.value;
      if (isArray(model)) {
        var val = self.getValue();
        if (el.checked) {
          if (indexOf(model, val) < 0) {
            model.push(val);
          }
        } else {
          model.$remove(val);
        }
      } else {
        self.set(getBooleanValue());
      }
    };

    this.on('change', this.listener);
    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    var el = this.el;
    if (isArray(value)) {
      el.checked = indexOf(value, this.getValue()) > -1;
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = looseEqual(value, el._trueValue);
      } else {
        el.checked = !!value;
      }
    }
  }
};

var handlers = {
  text: text$2,
  radio: radio,
  select: select,
  checkbox: checkbox
};

var model = {

  priority: MODEL,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind: function bind() {
    // friendly warning...
    this.checkFilters();
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using a read-only filter with ' + 'v-model="' + this.descriptor.raw + '". ' + 'You might want to use a two-way filter to ensure correct behavior.', this.vm);
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text;
    } else if (tag === 'SELECT') {
      handler = handlers.select;
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text;
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-model does not support element type: ' + tag, this.vm);
      return;
    }
    el.__v_model = this;
    handler.bind.call(this);
    this.update = handler.update;
    this._unbind = handler.unbind;
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters: function checkFilters() {
    var filters = this.filters;
    if (!filters) return;
    var i = filters.length;
    while (i--) {
      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name);
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true;
      }
      if (filter.write) {
        this.hasWrite = true;
      }
    }
  },

  unbind: function unbind() {
    this.el.__v_model = null;
    this._unbind && this._unbind();
  }
};

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': [8, 46],
  up: 38,
  left: 37,
  right: 39,
  down: 40
};

function keyFilter(handler, keys) {
  var codes = keys.map(function (key) {
    var charCode = key.charCodeAt(0);
    if (charCode > 47 && charCode < 58) {
      return parseInt(key, 10);
    }
    if (key.length === 1) {
      charCode = key.toUpperCase().charCodeAt(0);
      if (charCode > 64 && charCode < 91) {
        return charCode;
      }
    }
    return keyCodes[key];
  });
  codes = [].concat.apply([], codes);
  return function keyHandler(e) {
    if (codes.indexOf(e.keyCode) > -1) {
      return handler.call(this, e);
    }
  };
}

function stopFilter(handler) {
  return function stopHandler(e) {
    e.stopPropagation();
    return handler.call(this, e);
  };
}

function preventFilter(handler) {
  return function preventHandler(e) {
    e.preventDefault();
    return handler.call(this, e);
  };
}

function selfFilter(handler) {
  return function selfHandler(e) {
    if (e.target === e.currentTarget) {
      return handler.call(this, e);
    }
  };
}

var on$1 = {

  priority: ON,
  acceptStatement: true,
  keyCodes: keyCodes,

  bind: function bind() {
    // deal with iframes
    if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
      var self = this;
      this.iframeBind = function () {
        on(self.el.contentWindow, self.arg, self.handler, self.modifiers.capture);
      };
      this.on('load', this.iframeBind);
    }
  },

  update: function update(handler) {
    // stub a noop for v-on with no value,
    // e.g. @mousedown.prevent
    if (!this.descriptor.raw) {
      handler = function () {};
    }

    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('v-on:' + this.arg + '="' + this.expression + '" expects a function value, ' + 'got ' + handler, this.vm);
      return;
    }

    // apply modifiers
    if (this.modifiers.stop) {
      handler = stopFilter(handler);
    }
    if (this.modifiers.prevent) {
      handler = preventFilter(handler);
    }
    if (this.modifiers.self) {
      handler = selfFilter(handler);
    }
    // key filter
    var keys = Object.keys(this.modifiers).filter(function (key) {
      return key !== 'stop' && key !== 'prevent' && key !== 'self' && key !== 'capture';
    });
    if (keys.length) {
      handler = keyFilter(handler, keys);
    }

    this.reset();
    this.handler = handler;

    if (this.iframeBind) {
      this.iframeBind();
    } else {
      on(this.el, this.arg, this.handler, this.modifiers.capture);
    }
  },

  reset: function reset() {
    var el = this.iframeBind ? this.el.contentWindow : this.el;
    if (this.handler) {
      off(el, this.arg, this.handler);
    }
  },

  unbind: function unbind() {
    this.reset();
  }
};

var prefixes = ['-webkit-', '-moz-', '-ms-'];
var camelPrefixes = ['Webkit', 'Moz', 'ms'];
var importantRE = /!important;?$/;
var propCache = Object.create(null);

var testEl = null;

var style = {

  deep: true,

  update: function update(value) {
    if (typeof value === 'string') {
      this.el.style.cssText = value;
    } else if (isArray(value)) {
      this.handleObject(value.reduce(extend, {}));
    } else {
      this.handleObject(value || {});
    }
  },

  handleObject: function handleObject(value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {});
    var name, val;
    for (name in cache) {
      if (!(name in value)) {
        this.handleSingle(name, null);
        delete cache[name];
      }
    }
    for (name in value) {
      val = value[name];
      if (val !== cache[name]) {
        cache[name] = val;
        this.handleSingle(name, val);
      }
    }
  },

  handleSingle: function handleSingle(prop, value) {
    prop = normalize(prop);
    if (!prop) return; // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += '';
    if (value) {
      var isImportant = importantRE.test(value) ? 'important' : '';
      if (isImportant) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          warn('It\'s probably a bad idea to use !important with inline rules. ' + 'This feature will be deprecated in a future version of Vue.');
        }
        value = value.replace(importantRE, '').trim();
        this.el.style.setProperty(prop.kebab, value, isImportant);
      } else {
        this.el.style[prop.camel] = value;
      }
    } else {
      this.el.style[prop.camel] = '';
    }
  }

};

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize(prop) {
  if (propCache[prop]) {
    return propCache[prop];
  }
  var res = prefix(prop);
  propCache[prop] = propCache[res] = res;
  return res;
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix(prop) {
  prop = hyphenate(prop);
  var camel = camelize(prop);
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
  if (!testEl) {
    testEl = document.createElement('div');
  }
  var i = prefixes.length;
  var prefixed;
  if (camel !== 'filter' && camel in testEl.style) {
    return {
      kebab: prop,
      camel: camel
    };
  }
  while (i--) {
    prefixed = camelPrefixes[i] + upper;
    if (prefixed in testEl.style) {
      return {
        kebab: prefixes[i] + prop,
        camel: prefixed
      };
    }
  }
}

// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xlinkRE = /^xlink:/;

// check for attributes that prohibit interpolations
var disallowedInterpAttrRE = /^v-|^:|^@|^(?:is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/;
// these attributes should also set their corresponding properties
// because they only affect the initial state of the element
var attrWithPropsRE = /^(?:value|checked|selected|muted)$/;
// these attributes expect enumrated values of "true" or "false"
// but are not boolean attributes
var enumeratedAttrRE = /^(?:draggable|contenteditable|spellcheck)$/;

// these attributes should set a hidden property for
// binding v-model to object values
var modelProps = {
  value: '_value',
  'true-value': '_trueValue',
  'false-value': '_falseValue'
};

var bind$1 = {

  priority: BIND,

  bind: function bind() {
    var attr = this.arg;
    var tag = this.el.tagName;
    // should be deep watch on object mode
    if (!attr) {
      this.deep = true;
    }
    // handle interpolation bindings
    var descriptor = this.descriptor;
    var tokens = descriptor.interp;
    if (tokens) {
      // handle interpolations with one-time tokens
      if (descriptor.hasOneTime) {
        this.expression = tokensToExp(tokens, this._scope || this.vm);
      }

      // only allow binding on native attributes
      if (disallowedInterpAttrRE.test(attr) || attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT')) {
        process.env.NODE_ENV !== 'production' && warn(attr + '="' + descriptor.raw + '": ' + 'attribute interpolation is not allowed in Vue.js ' + 'directives and special attributes.', this.vm);
        this.el.removeAttribute(attr);
        this.invalid = true;
      }

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production') {
        var raw = attr + '="' + descriptor.raw + '": ';
        // warn src
        if (attr === 'src') {
          warn(raw + 'interpolation in "src" attribute will cause ' + 'a 404 request. Use v-bind:src instead.', this.vm);
        }

        // warn style
        if (attr === 'style') {
          warn(raw + 'interpolation in "style" attribute will cause ' + 'the attribute to be discarded in Internet Explorer. ' + 'Use v-bind:style instead.', this.vm);
        }
      }
    }
  },

  update: function update(value) {
    if (this.invalid) {
      return;
    }
    var attr = this.arg;
    if (this.arg) {
      this.handleSingle(attr, value);
    } else {
      this.handleObject(value || {});
    }
  },

  // share object handler with v-bind:class
  handleObject: style.handleObject,

  handleSingle: function handleSingle(attr, value) {
    var el = this.el;
    var interp = this.descriptor.interp;
    if (this.modifiers.camel) {
      attr = camelize(attr);
    }
    if (!interp && attrWithPropsRE.test(attr) && attr in el) {
      var attrValue = attr === 'value' ? value == null // IE9 will set input.value to "null" for null...
      ? '' : value : value;

      if (el[attr] !== attrValue) {
        el[attr] = attrValue;
      }
    }
    // set model props
    var modelProp = modelProps[attr];
    if (!interp && modelProp) {
      el[modelProp] = value;
      // update v-model if present
      var model = el.__v_model;
      if (model) {
        model.listener();
      }
    }
    // do not set value attribute for textarea
    if (attr === 'value' && el.tagName === 'TEXTAREA') {
      el.removeAttribute(attr);
      return;
    }
    // update attribute
    if (enumeratedAttrRE.test(attr)) {
      el.setAttribute(attr, value ? 'true' : 'false');
    } else if (value != null && value !== false) {
      if (attr === 'class') {
        // handle edge case #1960:
        // class interpolation should not overwrite Vue transition class
        if (el.__v_trans) {
          value += ' ' + el.__v_trans.id + '-transition';
        }
        setClass(el, value);
      } else if (xlinkRE.test(attr)) {
        el.setAttributeNS(xlinkNS, attr, value === true ? '' : value);
      } else {
        el.setAttribute(attr, value === true ? '' : value);
      }
    } else {
      el.removeAttribute(attr);
    }
  }
};

var el = {

  priority: EL,

  bind: function bind() {
    /* istanbul ignore if */
    if (!this.arg) {
      return;
    }
    var id = this.id = camelize(this.arg);
    var refs = (this._scope || this.vm).$els;
    if (hasOwn(refs, id)) {
      refs[id] = this.el;
    } else {
      defineReactive(refs, id, this.el);
    }
  },

  unbind: function unbind() {
    var refs = (this._scope || this.vm).$els;
    if (refs[this.id] === this.el) {
      refs[this.id] = null;
    }
  }
};

var ref = {
  bind: function bind() {
    process.env.NODE_ENV !== 'production' && warn('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.', this.vm);
  }
};

var cloak = {
  bind: function bind() {
    var el = this.el;
    this.vm.$once('pre-hook:compiled', function () {
      el.removeAttribute('v-cloak');
    });
  }
};

// must export plain object
var directives = {
  text: text$1,
  html: html,
  'for': vFor,
  'if': vIf,
  show: show,
  model: model,
  on: on$1,
  bind: bind$1,
  el: el,
  ref: ref,
  cloak: cloak
};

var vClass = {

  deep: true,

  update: function update(value) {
    if (!value) {
      this.cleanup();
    } else if (typeof value === 'string') {
      this.setClass(value.trim().split(/\s+/));
    } else {
      this.setClass(normalize$1(value));
    }
  },

  setClass: function setClass(value) {
    this.cleanup(value);
    for (var i = 0, l = value.length; i < l; i++) {
      var val = value[i];
      if (val) {
        apply(this.el, val, addClass);
      }
    }
    this.prevKeys = value;
  },

  cleanup: function cleanup(value) {
    var prevKeys = this.prevKeys;
    if (!prevKeys) return;
    var i = prevKeys.length;
    while (i--) {
      var key = prevKeys[i];
      if (!value || value.indexOf(key) < 0) {
        apply(this.el, key, removeClass);
      }
    }
  }
};

/**
 * Normalize objects and arrays (potentially containing objects)
 * into array of strings.
 *
 * @param {Object|Array<String|Object>} value
 * @return {Array<String>}
 */

function normalize$1(value) {
  var res = [];
  if (isArray(value)) {
    for (var i = 0, l = value.length; i < l; i++) {
      var _key = value[i];
      if (_key) {
        if (typeof _key === 'string') {
          res.push(_key);
        } else {
          for (var k in _key) {
            if (_key[k]) res.push(k);
          }
        }
      }
    }
  } else if (isObject(value)) {
    for (var key in value) {
      if (value[key]) res.push(key);
    }
  }
  return res;
}

/**
 * Add or remove a class/classes on an element
 *
 * @param {Element} el
 * @param {String} key The class name. This may or may not
 *                     contain a space character, in such a
 *                     case we'll deal with multiple class
 *                     names at once.
 * @param {Function} fn
 */

function apply(el, key, fn) {
  key = key.trim();
  if (key.indexOf(' ') === -1) {
    fn(el, key);
    return;
  }
  // The key contains one or more space characters.
  // Since a class name doesn't accept such characters, we
  // treat it as multiple classes.
  var keys = key.split(/\s+/);
  for (var i = 0, l = keys.length; i < l; i++) {
    fn(el, keys[i]);
  }
}

var component = {

  priority: COMPONENT,

  params: ['keep-alive', 'transition-mode', 'inline-template'],

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   <comp> or <div v-component="comp">
   *
   * - dynamic:
   *   <component :is="view">
   */

  bind: function bind() {
    if (!this.el.__vue__) {
      // keep-alive cache
      this.keepAlive = this.params.keepAlive;
      if (this.keepAlive) {
        this.cache = {};
      }
      // check inline-template
      if (this.params.inlineTemplate) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = extractContent(this.el, true);
      }
      // component resolution related state
      this.pendingComponentCb = this.Component = null;
      // transition related state
      this.pendingRemovals = 0;
      this.pendingRemovalCb = null;
      // create a ref anchor
      this.anchor = createAnchor('v-component');
      replace(this.el, this.anchor);
      // remove is attribute.
      // this is removed during compilation, but because compilation is
      // cached, when the component is used elsewhere this attribute
      // will remain at link time.
      this.el.removeAttribute('is');
      this.el.removeAttribute(':is');
      // remove ref, same as above
      if (this.descriptor.ref) {
        this.el.removeAttribute('v-ref:' + hyphenate(this.descriptor.ref));
      }
      // if static, build right now.
      if (this.literal) {
        this.setComponent(this.expression);
      }
    } else {
      process.env.NODE_ENV !== 'production' && warn('cannot mount component "' + this.expression + '" ' + 'on already mounted element: ' + this.el);
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. <component :is="view">
   */

  update: function update(value) {
    if (!this.literal) {
      this.setComponent(value);
    }
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function setComponent(value, cb) {
    this.invalidatePending();
    if (!value) {
      // just remove current
      this.unbuild(true);
      this.remove(this.childVM, cb);
      this.childVM = null;
    } else {
      var self = this;
      this.resolveComponent(value, function () {
        self.mountComponent(cb);
      });
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  resolveComponent: function resolveComponent(value, cb) {
    var self = this;
    this.pendingComponentCb = cancellable(function (Component) {
      self.ComponentName = Component.options.name || (typeof value === 'string' ? value : null);
      self.Component = Component;
      cb();
    });
    this.vm._resolveComponent(value, this.pendingComponentCb);
  },

  /**
   * Create a new instance using the current constructor and
   * replace the existing instance. This method doesn't care
   * whether the new component and the old one are actually
   * the same.
   *
   * @param {Function} [cb]
   */

  mountComponent: function mountComponent(cb) {
    // actual mount
    this.unbuild(true);
    var self = this;
    var activateHooks = this.Component.options.activate;
    var cached = this.getCached();
    var newComponent = this.build();
    if (activateHooks && !cached) {
      this.waitingFor = newComponent;
      callActivateHooks(activateHooks, newComponent, function () {
        if (self.waitingFor !== newComponent) {
          return;
        }
        self.waitingFor = null;
        self.transition(newComponent, cb);
      });
    } else {
      // update ref for kept-alive component
      if (cached) {
        newComponent._updateRef();
      }
      this.transition(newComponent, cb);
    }
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function invalidatePending() {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel();
      this.pendingComponentCb = null;
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function build(extraOptions) {
    var cached = this.getCached();
    if (cached) {
      return cached;
    }
    if (this.Component) {
      // default options
      var options = {
        name: this.ComponentName,
        el: cloneNode(this.el),
        template: this.inlineTemplate,
        // make sure to add the child with correct parent
        // if this is a transcluded component, its parent
        // should be the transclusion host.
        parent: this._host || this.vm,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.inlineTemplate,
        _ref: this.descriptor.ref,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        // if this is a transcluded component, context
        // will be the common parent vm of this instance
        // and its host.
        _context: this.vm,
        // if this is inside an inline v-for, the scope
        // will be the intermediate scope created for this
        // repeat fragment. this is used for linking props
        // and container directives.
        _scope: this._scope,
        // pass in the owner fragment of this component.
        // this is necessary so that the fragment can keep
        // track of its contained components in order to
        // call attach/detach hooks for them.
        _frag: this._frag
      };
      // extra options
      // in 1.0.0 this is used by vue-router only
      /* istanbul ignore if */
      if (extraOptions) {
        extend(options, extraOptions);
      }
      var child = new this.Component(options);
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child;
      }
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && this.el.hasAttribute('transition') && child._isFragment) {
        warn('Transitions will not work on a fragment instance. ' + 'Template: ' + child.$options.template, child);
      }
      return child;
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function getCached() {
    return this.keepAlive && this.cache[this.Component.cid];
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function unbuild(defer) {
    if (this.waitingFor) {
      if (!this.keepAlive) {
        this.waitingFor.$destroy();
      }
      this.waitingFor = null;
    }
    var child = this.childVM;
    if (!child || this.keepAlive) {
      if (child) {
        // remove ref
        child._inactive = true;
        child._updateRef(true);
      }
      return;
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer);
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function remove(child, cb) {
    var keepAlive = this.keepAlive;
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++;
      this.pendingRemovalCb = cb;
      var self = this;
      child.$remove(function () {
        self.pendingRemovals--;
        if (!keepAlive) child._cleanup();
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb();
          self.pendingRemovalCb = null;
        }
      });
    } else if (cb) {
      cb();
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function transition(target, cb) {
    var self = this;
    var current = this.childVM;
    // for devtool inspection
    if (current) current._inactive = true;
    target._inactive = false;
    this.childVM = target;
    switch (self.params.transitionMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb);
        });
        break;
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb);
        });
        break;
      default:
        self.remove(current);
        target.$before(self.anchor, cb);
    }
  },

  /**
   * Unbind.
   */

  unbind: function unbind() {
    this.invalidatePending();
    // Do not defer cleanup when unbinding
    this.unbuild();
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy();
      }
      this.cache = null;
    }
  }
};

/**
 * Call activate hooks in order (asynchronous)
 *
 * @param {Array} hooks
 * @param {Vue} vm
 * @param {Function} cb
 */

function callActivateHooks(hooks, vm, cb) {
  var total = hooks.length;
  var called = 0;
  hooks[0].call(vm, next);
  function next() {
    if (++called >= total) {
      cb();
    } else {
      hooks[called].call(vm, next);
    }
  }
}

var propBindingModes = config._propBindingModes;
var empty = {};

// regexes
var identRE$1 = /^[$_a-zA-Z]+[\w$]*$/;
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/;

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @param {Vue} vm
 * @return {Function} propsLinkFn
 */

function compileProps(el, propOptions, vm) {
  var props = [];
  var names = Object.keys(propOptions);
  var i = names.length;
  var options, name, attr, value, path, parsed, prop;
  while (i--) {
    name = names[i];
    options = propOptions[name] || empty;

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.', vm);
      continue;
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name);
    if (!identRE$1.test(path)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop key: "' + name + '". Prop keys ' + 'must be valid identifiers.', vm);
      continue;
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY,
      raw: null
    };

    attr = hyphenate(name);
    // first check dynamic version
    if ((value = getBindAttr(el, attr)) === null) {
      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
        prop.mode = propBindingModes.TWO_WAY;
      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
        prop.mode = propBindingModes.ONE_TIME;
      }
    }
    if (value !== null) {
      // has dynamic binding!
      prop.raw = value;
      parsed = parseDirective(value);
      value = parsed.expression;
      prop.filters = parsed.filters;
      // check binding type
      if (isLiteral(value) && !parsed.filters) {
        // for expressions containing literal numbers and
        // booleans, there's no need to setup a prop binding,
        // so we can optimize them as a one-time set.
        prop.optimizedLiteral = true;
      } else {
        prop.dynamic = true;
        // check non-settable path for two-way bindings
        if (process.env.NODE_ENV !== 'production' && prop.mode === propBindingModes.TWO_WAY && !settablePathRE.test(value)) {
          prop.mode = propBindingModes.ONE_WAY;
          warn('Cannot bind two-way prop with non-settable ' + 'parent path: ' + value, vm);
        }
      }
      prop.parentPath = value;

      // warn required two-way
      if (process.env.NODE_ENV !== 'production' && options.twoWay && prop.mode !== propBindingModes.TWO_WAY) {
        warn('Prop "' + name + '" expects a two-way binding type.', vm);
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
      prop.raw = value;
    } else if (process.env.NODE_ENV !== 'production') {
      // check possible camelCase prop usage
      var lowerCaseName = path.toLowerCase();
      value = /[A-Z\-]/.test(name) && (el.getAttribute(lowerCaseName) || el.getAttribute(':' + lowerCaseName) || el.getAttribute('v-bind:' + lowerCaseName) || el.getAttribute(':' + lowerCaseName + '.once') || el.getAttribute('v-bind:' + lowerCaseName + '.once') || el.getAttribute(':' + lowerCaseName + '.sync') || el.getAttribute('v-bind:' + lowerCaseName + '.sync'));
      if (value) {
        warn('Possible usage error for prop `' + lowerCaseName + '` - ' + 'did you mean `' + attr + '`? HTML is case-insensitive, remember to use ' + 'kebab-case for props in templates.', vm);
      } else if (options.required) {
        // warn missing required
        warn('Missing required prop: ' + name, vm);
      }
    }
    // push prop
    props.push(prop);
  }
  return makePropsLinkFn(props);
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn(props) {
  return function propsLinkFn(vm, scope) {
    // store resolved props info
    vm._props = {};
    var inlineProps = vm.$options.propsData;
    var i = props.length;
    var prop, path, options, value, raw;
    while (i--) {
      prop = props[i];
      raw = prop.raw;
      path = prop.path;
      options = prop.options;
      vm._props[path] = prop;
      if (inlineProps && hasOwn(inlineProps, path)) {
        initProp(vm, prop, inlineProps[path]);
      }if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, undefined);
      } else if (prop.dynamic) {
        // dynamic prop
        if (prop.mode === propBindingModes.ONE_TIME) {
          // one time binding
          value = (scope || vm._context || vm).$get(prop.parentPath);
          initProp(vm, prop, value);
        } else {
          if (vm._context) {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope); // el, host, scope
          } else {
              // root instance
              initProp(vm, prop, vm.$get(prop.parentPath));
            }
        }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        var stripped = stripQuotes(raw);
        value = stripped === raw ? toBoolean(toNumber(raw)) : stripped;
        initProp(vm, prop, value);
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value, or with same
        // literal value (e.g. disabled="disabled")
        // see https://github.com/vuejs/vue-loader/issues/182
        value = options.type === Boolean && (raw === '' || raw === hyphenate(prop.name)) ? true : raw;
        initProp(vm, prop, value);
      }
    }
  };
}

/**
 * Process a prop with a rawValue, applying necessary coersions,
 * default values & assertions and call the given callback with
 * processed value.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} rawValue
 * @param {Function} fn
 */

function processPropValue(vm, prop, rawValue, fn) {
  var isSimple = prop.dynamic && isSimplePath(prop.parentPath);
  var value = rawValue;
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop);
  }
  value = coerceProp(prop, value, vm);
  var coerced = value !== rawValue;
  if (!assertProp(prop, value, vm)) {
    value = undefined;
  }
  if (isSimple && !coerced) {
    withoutConversion(function () {
      fn(value);
    });
  } else {
    fn(value);
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function initProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    defineReactive(vm, prop.path, value);
  });
}

/**
 * Update a prop's value on a vm.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function updateProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    vm[prop.path] = value;
  });
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @return {*}
 */

function getPropDefaultValue(vm, prop) {
  // no default, return undefined
  var options = prop.options;
  if (!hasOwn(options, 'default')) {
    // absent boolean value defaults to false
    return options.type === Boolean ? false : undefined;
  }
  var def = options['default'];
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn('Invalid default value for prop "' + prop.name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function ? def.call(vm) : def;
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 * @param {Vue} vm
 */

function assertProp(prop, value, vm) {
  if (!prop.options.required && ( // non-required
  prop.raw === null || // abscent
  value == null) // null or undefined
  ) {
      return true;
    }
  var options = prop.options;
  var type = options.type;
  var valid = !type;
  var expectedTypes = [];
  if (type) {
    if (!isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType);
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    if (process.env.NODE_ENV !== 'production') {
      warn('Invalid prop: type check failed for prop "' + prop.name + '".' + ' Expected ' + expectedTypes.map(formatType).join(', ') + ', got ' + formatValue(value) + '.', vm);
    }
    return false;
  }
  var validator = options.validator;
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for prop "' + prop.name + '".', vm);
      return false;
    }
  }
  return true;
}

/**
 * Force parsing value with coerce option.
 *
 * @param {*} value
 * @param {Object} options
 * @return {*}
 */

function coerceProp(prop, value, vm) {
  var coerce = prop.options.coerce;
  if (!coerce) {
    return value;
  }
  if (typeof coerce === 'function') {
    return coerce(value);
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid coerce for prop "' + prop.name + '": expected function, got ' + typeof coerce + '.', vm);
    return value;
  }
}

/**
 * Assert the type of a value
 *
 * @param {*} value
 * @param {Function} type
 * @return {Object}
 */

function assertType(value, type) {
  var valid;
  var expectedType;
  if (type === String) {
    expectedType = 'string';
    valid = typeof value === expectedType;
  } else if (type === Number) {
    expectedType = 'number';
    valid = typeof value === expectedType;
  } else if (type === Boolean) {
    expectedType = 'boolean';
    valid = typeof value === expectedType;
  } else if (type === Function) {
    expectedType = 'function';
    valid = typeof value === expectedType;
  } else if (type === Object) {
    expectedType = 'object';
    valid = isPlainObject(value);
  } else if (type === Array) {
    expectedType = 'array';
    valid = isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  };
}

/**
 * Format type for output
 *
 * @param {String} type
 * @return {String}
 */

function formatType(type) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'custom type';
}

/**
 * Format value
 *
 * @param {*} value
 * @return {String}
 */

function formatValue(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

var bindingModes = config._propBindingModes;

var propDef = {

  bind: function bind() {
    var child = this.vm;
    var parent = child._context;
    // passed in from compiler directly
    var prop = this.descriptor.prop;
    var childKey = prop.path;
    var parentKey = prop.parentPath;
    var twoWay = prop.mode === bindingModes.TWO_WAY;

    var parentWatcher = this.parentWatcher = new Watcher(parent, parentKey, function (val) {
      updateProp(child, prop, val);
    }, {
      twoWay: twoWay,
      filters: prop.filters,
      // important: props need to be observed on the
      // v-for scope if present
      scope: this._scope
    });

    // set the child initial value.
    initProp(child, prop, parentWatcher.value);

    // setup two-way binding
    if (twoWay) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this;
      child.$once('pre-hook:created', function () {
        self.childWatcher = new Watcher(child, childKey, function (val) {
          parentWatcher.set(val);
        }, {
          // ensure sync upward before parent sync down.
          // this is necessary in cases e.g. the child
          // mutates a prop array, then replaces it. (#1683)
          sync: true
        });
      });
    }
  },

  unbind: function unbind() {
    this.parentWatcher.teardown();
    if (this.childWatcher) {
      this.childWatcher.teardown();
    }
  }
};

var queue$1 = [];
var queued = false;

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

function pushJob(job) {
  queue$1.push(job);
  if (!queued) {
    queued = true;
    nextTick(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  // Force layout
  var f = document.documentElement.offsetHeight;
  for (var i = 0; i < queue$1.length; i++) {
    queue$1[i]();
  }
  queue$1 = [];
  queued = false;
  // dummy return, so js linters don't complain about
  // unused variable f
  return f;
}

var TYPE_TRANSITION = 'transition';
var TYPE_ANIMATION = 'animation';
var transDurationProp = transitionProp + 'Duration';
var animDurationProp = animationProp + 'Duration';

/**
 * If a just-entered element is applied the
 * leave class while its enter transition hasn't started yet,
 * and the transitioned property has the same value for both
 * enter/leave, then the leave transition will be skipped and
 * the transitionend event never fires. This function ensures
 * its callback to be called after a transition has started
 * by waiting for double raf.
 *
 * It falls back to setTimeout on devices that support CSS
 * transitions but not raf (e.g. Android 4.2 browser) - since
 * these environments are usually slow, we are giving it a
 * relatively large timeout.
 */

var raf = inBrowser && window.requestAnimationFrame;
var waitForTransitionStart = raf
/* istanbul ignore next */
? function (fn) {
  raf(function () {
    raf(fn);
  });
} : function (fn) {
  setTimeout(fn, 50);
};

/**
 * A Transition object that encapsulates the state and logic
 * of the transition.
 *
 * @param {Element} el
 * @param {String} id
 * @param {Object} hooks
 * @param {Vue} vm
 */
function Transition(el, id, hooks, vm) {
  this.id = id;
  this.el = el;
  this.enterClass = hooks && hooks.enterClass || id + '-enter';
  this.leaveClass = hooks && hooks.leaveClass || id + '-leave';
  this.hooks = hooks;
  this.vm = vm;
  // async state
  this.pendingCssEvent = this.pendingCssCb = this.cancel = this.pendingJsCb = this.op = this.cb = null;
  this.justEntered = false;
  this.entered = this.left = false;
  this.typeCache = {};
  // check css transition type
  this.type = hooks && hooks.type;
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    if (this.type && this.type !== TYPE_TRANSITION && this.type !== TYPE_ANIMATION) {
      warn('invalid CSS transition type for transition="' + this.id + '": ' + this.type, vm);
    }
  }
  // bind
  var self = this;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone'].forEach(function (m) {
    self[m] = bind(self[m], self);
  });
}

var p$1 = Transition.prototype;

/**
 * Start an entering transition.
 *
 * 1. enter transition triggered
 * 2. call beforeEnter hook
 * 3. add enter class
 * 4. insert/show element
 * 5. call enter hook (with possible explicit js callback)
 * 6. reflow
 * 7. based on transition type:
 *    - transition:
 *        remove class now, wait for transitionend,
 *        then done if there's no explicit js callback.
 *    - animation:
 *        wait for animationend, remove class,
 *        then done if there's no explicit js callback.
 *    - no css transition:
 *        done now if there's no explicit js callback.
 * 8. wait for either done or js callback, then call
 *    afterEnter hook.
 *
 * @param {Function} op - insert/show the element
 * @param {Function} [cb]
 */

p$1.enter = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeEnter');
  this.cb = cb;
  addClass(this.el, this.enterClass);
  op();
  this.entered = false;
  this.callHookWithCb('enter');
  if (this.entered) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.enterCancelled;
  pushJob(this.enterNextTick);
};

/**
 * The "nextTick" phase of an entering transition, which is
 * to be pushed into a queue and executed after a reflow so
 * that removing the class can trigger a CSS transition.
 */

p$1.enterNextTick = function () {
  var _this = this;

  // prevent transition skipping
  this.justEntered = true;
  waitForTransitionStart(function () {
    _this.justEntered = false;
  });
  var enterDone = this.enterDone;
  var type = this.getCssTransitionType(this.enterClass);
  if (!this.pendingJsCb) {
    if (type === TYPE_TRANSITION) {
      // trigger transition by removing enter class now
      removeClass(this.el, this.enterClass);
      this.setupCssCb(transitionEndEvent, enterDone);
    } else if (type === TYPE_ANIMATION) {
      this.setupCssCb(animationEndEvent, enterDone);
    } else {
      enterDone();
    }
  } else if (type === TYPE_TRANSITION) {
    removeClass(this.el, this.enterClass);
  }
};

/**
 * The "cleanup" phase of an entering transition.
 */

p$1.enterDone = function () {
  this.entered = true;
  this.cancel = this.pendingJsCb = null;
  removeClass(this.el, this.enterClass);
  this.callHook('afterEnter');
  if (this.cb) this.cb();
};

/**
 * Start a leaving transition.
 *
 * 1. leave transition triggered.
 * 2. call beforeLeave hook
 * 3. add leave class (trigger css transition)
 * 4. call leave hook (with possible explicit js callback)
 * 5. reflow if no explicit js callback is provided
 * 6. based on transition type:
 *    - transition or animation:
 *        wait for end event, remove class, then done if
 *        there's no explicit js callback.
 *    - no css transition:
 *        done if there's no explicit js callback.
 * 7. wait for either done or js callback, then call
 *    afterLeave hook.
 *
 * @param {Function} op - remove/hide the element
 * @param {Function} [cb]
 */

p$1.leave = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeLeave');
  this.op = op;
  this.cb = cb;
  addClass(this.el, this.leaveClass);
  this.left = false;
  this.callHookWithCb('leave');
  if (this.left) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.leaveCancelled;
  // only need to handle leaveDone if
  // 1. the transition is already done (synchronously called
  //    by the user, which causes this.op set to null)
  // 2. there's no explicit js callback
  if (this.op && !this.pendingJsCb) {
    // if a CSS transition leaves immediately after enter,
    // the transitionend event never fires. therefore we
    // detect such cases and end the leave immediately.
    if (this.justEntered) {
      this.leaveDone();
    } else {
      pushJob(this.leaveNextTick);
    }
  }
};

/**
 * The "nextTick" phase of a leaving transition.
 */

p$1.leaveNextTick = function () {
  var type = this.getCssTransitionType(this.leaveClass);
  if (type) {
    var event = type === TYPE_TRANSITION ? transitionEndEvent : animationEndEvent;
    this.setupCssCb(event, this.leaveDone);
  } else {
    this.leaveDone();
  }
};

/**
 * The "cleanup" phase of a leaving transition.
 */

p$1.leaveDone = function () {
  this.left = true;
  this.cancel = this.pendingJsCb = null;
  this.op();
  removeClass(this.el, this.leaveClass);
  this.callHook('afterLeave');
  if (this.cb) this.cb();
  this.op = null;
};

/**
 * Cancel any pending callbacks from a previously running
 * but not finished transition.
 */

p$1.cancelPending = function () {
  this.op = this.cb = null;
  var hasPending = false;
  if (this.pendingCssCb) {
    hasPending = true;
    off(this.el, this.pendingCssEvent, this.pendingCssCb);
    this.pendingCssEvent = this.pendingCssCb = null;
  }
  if (this.pendingJsCb) {
    hasPending = true;
    this.pendingJsCb.cancel();
    this.pendingJsCb = null;
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass);
    removeClass(this.el, this.leaveClass);
  }
  if (this.cancel) {
    this.cancel.call(this.vm, this.el);
    this.cancel = null;
  }
};

/**
 * Call a user-provided synchronous hook function.
 *
 * @param {String} type
 */

p$1.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el);
  }
};

/**
 * Call a user-provided, potentially-async hook function.
 * We check for the length of arguments to see if the hook
 * expects a `done` callback. If true, the transition's end
 * will be determined by when the user calls that callback;
 * otherwise, the end is determined by the CSS transition or
 * animation.
 *
 * @param {String} type
 */

p$1.callHookWithCb = function (type) {
  var hook = this.hooks && this.hooks[type];
  if (hook) {
    if (hook.length > 1) {
      this.pendingJsCb = cancellable(this[type + 'Done']);
    }
    hook.call(this.vm, this.el, this.pendingJsCb);
  }
};

/**
 * Get an element's transition type based on the
 * calculated styles.
 *
 * @param {String} className
 * @return {Number}
 */

p$1.getCssTransitionType = function (className) {
  /* istanbul ignore if */
  if (!transitionEndEvent ||
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  document.hidden ||
  // explicit js-only transition
  this.hooks && this.hooks.css === false ||
  // element is hidden
  isHidden(this.el)) {
    return;
  }
  var type = this.type || this.typeCache[className];
  if (type) return type;
  var inlineStyles = this.el.style;
  var computedStyles = window.getComputedStyle(this.el);
  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION;
  } else {
    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION;
    }
  }
  if (type) {
    this.typeCache[className] = type;
  }
  return type;
};

/**
 * Setup a CSS transitionend/animationend callback.
 *
 * @param {String} event
 * @param {Function} cb
 */

p$1.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event;
  var self = this;
  var el = this.el;
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      off(el, event, onEnd);
      self.pendingCssEvent = self.pendingCssCb = null;
      if (!self.pendingJsCb && cb) {
        cb();
      }
    }
  };
  on(el, event, onEnd);
};

/**
 * Check if an element is hidden - in that case we can just
 * skip the transition alltogether.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isHidden(el) {
  if (/svg$/.test(el.namespaceURI)) {
    // SVG elements do not have offset(Width|Height)
    // so we need to check the client rect
    var rect = el.getBoundingClientRect();
    return !(rect.width || rect.height);
  } else {
    return !(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
}

var transition$1 = {

  priority: TRANSITION,

  update: function update(id, oldId) {
    var el = this.el;
    // resolve on owner vm
    var hooks = resolveAsset(this.vm.$options, 'transitions', id);
    id = id || 'v';
    oldId = oldId || 'v';
    el.__v_trans = new Transition(el, id, hooks, this.vm);
    removeClass(el, oldId + '-transition');
    addClass(el, id + '-transition');
  }
};

var internalDirectives = {
  style: style,
  'class': vClass,
  component: component,
  prop: propDef,
  transition: transition$1
};

// special binding prefixes
var bindRE = /^v-bind:|^:/;
var onRE = /^v-on:|^@/;
var dirAttrRE = /^v-([^:]+)(?:$|:(.*)$)/;
var modifierRE = /\.[^\.]+/g;
var transitionRE = /^(v-bind:|:)?transition$/;

// default directive priority
var DEFAULT_PRIORITY = 1000;
var DEFAULT_TERMINAL_PRIORITY = 2000;

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function would normally
 * be called on instance root nodes, but can also be used
 * for partial compilation if the partial argument is true.
 *
 * The returned composite link function, when called, will
 * return an unlink function that tearsdown all directives
 * created during the linking phase.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @return {Function}
 */

function compile(el, options, partial) {
  // link function for the node itself.
  var nodeLinkFn = partial || !options._asComponent ? compileNode(el, options) : null;
  // link function for the childNodes
  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && !isScript(el) && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host] - host vm of transcluded content
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - link context fragment
   * @return {Function|undefined}
   */

  return function compositeLinkFn(vm, el, host, scope, frag) {
    // cache childNodes before linking parent, fix #657
    var childNodes = toArray(el.childNodes);
    // link
    var dirs = linkAndCapture(function compositeLinkCapturer() {
      if (nodeLinkFn) nodeLinkFn(vm, el, host, scope, frag);
      if (childLinkFn) childLinkFn(vm, childNodes, host, scope, frag);
    }, vm);
    return makeUnlinkFn(vm, dirs);
  };
}

/**
 * Apply a linker to a vm/element pair and capture the
 * directives created during the process.
 *
 * @param {Function} linker
 * @param {Vue} vm
 */

function linkAndCapture(linker, vm) {
  /* istanbul ignore if */
  if (process.env.NODE_ENV === 'production') {
    // reset directives before every capture in production
    // mode, so that when unlinking we don't need to splice
    // them out (which turns out to be a perf hit).
    // they are kept in development mode because they are
    // useful for Vue's own tests.
    vm._directives = [];
  }
  var originalDirCount = vm._directives.length;
  linker();
  var dirs = vm._directives.slice(originalDirCount);
  dirs.sort(directiveComparator);
  for (var i = 0, l = dirs.length; i < l; i++) {
    dirs[i]._bind();
  }
  return dirs;
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator(a, b) {
  a = a.descriptor.def.priority || DEFAULT_PRIORITY;
  b = b.descriptor.def.priority || DEFAULT_PRIORITY;
  return a > b ? -1 : a === b ? 0 : 1;
}

/**
 * Linker functions return an unlink function that
 * tearsdown all directives instances generated during
 * the process.
 *
 * We create unlink functions with only the necessary
 * information to avoid retaining additional closures.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Vue} [context]
 * @param {Array} [contextDirs]
 * @return {Function}
 */

function makeUnlinkFn(vm, dirs, context, contextDirs) {
  function unlink(destroying) {
    teardownDirs(vm, dirs, destroying);
    if (context && contextDirs) {
      teardownDirs(context, contextDirs);
    }
  }
  // expose linked directives
  unlink.dirs = dirs;
  return unlink;
}

/**
 * Teardown partial linked directives.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Boolean} destroying
 */

function teardownDirs(vm, dirs, destroying) {
  var i = dirs.length;
  while (i--) {
    dirs[i]._teardown();
    if (process.env.NODE_ENV !== 'production' && !destroying) {
      vm._directives.$remove(dirs[i]);
    }
  }
}

/**
 * Compile link props on an instance.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} props
 * @param {Object} [scope]
 * @return {Function}
 */

function compileAndLinkProps(vm, el, props, scope) {
  var propsLinkFn = compileProps(el, props, vm);
  var propDirs = linkAndCapture(function () {
    propsLinkFn(vm, scope);
  }, vm);
  return makeUnlinkFn(vm, propDirs);
}

/**
 * Compile the root element of an instance.
 *
 * 1. attrs on context container (context scope)
 * 2. attrs on the component template root node, if
 *    replace:true (child scope)
 *
 * If this is a fragment instance, we only need to compile 1.
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Object} contextOptions
 * @return {Function}
 */

function compileRoot(el, options, contextOptions) {
  var containerAttrs = options._containerAttrs;
  var replacerAttrs = options._replacerAttrs;
  var contextLinkFn, replacerLinkFn;

  // only need to compile other attributes for
  // non-fragment instances
  if (el.nodeType !== 11) {
    // for components, container and replacer need to be
    // compiled separately and linked in different scopes.
    if (options._asComponent) {
      // 2. container attributes
      if (containerAttrs && contextOptions) {
        contextLinkFn = compileDirectives(containerAttrs, contextOptions);
      }
      if (replacerAttrs) {
        // 3. replacer attributes
        replacerLinkFn = compileDirectives(replacerAttrs, options);
      }
    } else {
      // non-component, just compile as a normal element.
      replacerLinkFn = compileDirectives(el.attributes, options);
    }
  } else if (process.env.NODE_ENV !== 'production' && containerAttrs) {
    // warn container directives for fragment instances
    var names = containerAttrs.filter(function (attr) {
      // allow vue-loader/vueify scoped css attributes
      return attr.name.indexOf('_v-') < 0 &&
      // allow event listeners
      !onRE.test(attr.name) &&
      // allow slots
      attr.name !== 'slot';
    }).map(function (attr) {
      return '"' + attr.name + '"';
    });
    if (names.length) {
      var plural = names.length > 1;
      warn('Attribute' + (plural ? 's ' : ' ') + names.join(', ') + (plural ? ' are' : ' is') + ' ignored on component ' + '<' + options.el.tagName.toLowerCase() + '> because ' + 'the component is a fragment instance: ' + 'http://vuejs.org/guide/components.html#Fragment-Instance');
    }
  }

  options._containerAttrs = options._replacerAttrs = null;
  return function rootLinkFn(vm, el, scope) {
    // link context scope dirs
    var context = vm._context;
    var contextDirs;
    if (context && contextLinkFn) {
      contextDirs = linkAndCapture(function () {
        contextLinkFn(context, el, null, scope);
      }, context);
    }

    // link self
    var selfDirs = linkAndCapture(function () {
      if (replacerLinkFn) replacerLinkFn(vm, el);
    }, vm);

    // return the unlink function that tearsdown context
    // container directives.
    return makeUnlinkFn(vm, selfDirs, context, contextDirs);
  };
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode(node, options) {
  var type = node.nodeType;
  if (type === 1 && !isScript(node)) {
    return compileElement(node, options);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node, options);
  } else {
    return null;
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement(el, options) {
  // preprocess textareas.
  // textarea treats its text content as the initial value.
  // just bind it as an attr directive for value.
  if (el.tagName === 'TEXTAREA') {
    var tokens = parseText(el.value);
    if (tokens) {
      el.setAttribute(':value', tokensToExp(tokens));
      el.value = '';
    }
  }
  var linkFn;
  var hasAttrs = el.hasAttributes();
  var attrs = hasAttrs && toArray(el.attributes);
  // check terminal directives (for & if)
  if (hasAttrs) {
    linkFn = checkTerminalDirectives(el, attrs, options);
  }
  // check element directives
  if (!linkFn) {
    linkFn = checkElementDirectives(el, options);
  }
  // check component
  if (!linkFn) {
    linkFn = checkComponent(el, options);
  }
  // normal directives
  if (!linkFn && hasAttrs) {
    linkFn = compileDirectives(attrs, options);
  }
  return linkFn;
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode(node, options) {
  // skip marked text nodes
  if (node._skip) {
    return removeText;
  }

  var tokens = parseText(node.wholeText);
  if (!tokens) {
    return null;
  }

  // mark adjacent text nodes as skipped,
  // because we are using node.wholeText to compile
  // all adjacent text nodes together. This fixes
  // issues in IE where sometimes it splits up a single
  // text node into multiple ones.
  var next = node.nextSibling;
  while (next && next.nodeType === 3) {
    next._skip = true;
    next = next.nextSibling;
  }

  var frag = document.createDocumentFragment();
  var el, token;
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
    frag.appendChild(el);
  }
  return makeTextNodeLinkFn(tokens, frag, options);
}

/**
 * Linker for an skipped text node.
 *
 * @param {Vue} vm
 * @param {Text} node
 */

function removeText(vm, node) {
  remove(node);
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken(token, options) {
  var el;
  if (token.oneTime) {
    el = document.createTextNode(token.value);
  } else {
    if (token.html) {
      el = document.createComment('v-html');
      setTokenType('html');
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ');
      setTokenType('text');
    }
  }
  function setTokenType(type) {
    if (token.descriptor) return;
    var parsed = parseDirective(token.value);
    token.descriptor = {
      name: type,
      def: directives[type],
      expression: parsed.expression,
      filters: parsed.filters
    };
  }
  return el;
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn(tokens, frag) {
  return function textNodeLinkFn(vm, el, host, scope) {
    var fragClone = frag.cloneNode(true);
    var childNodes = toArray(fragClone.childNodes);
    var token, value, node;
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];
      value = token.value;
      if (token.tag) {
        node = childNodes[i];
        if (token.oneTime) {
          value = (scope || vm).$eval(value);
          if (token.html) {
            replace(node, parseTemplate(value, true));
          } else {
            node.data = _toString(value);
          }
        } else {
          vm._bindDir(token.descriptor, node, host, scope);
        }
      }
    }
    replace(el, fragClone);
  };
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i];
    nodeLinkFn = compileNode(node, options);
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== 'SCRIPT' && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
    linkFns.push(nodeLinkFn, childLinkFn);
  }
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn(linkFns) {
  return function childLinkFn(vm, nodes, host, scope, frag) {
    var node, nodeLinkFn, childrenLinkFn;
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childrenLinkFn = linkFns[i++];
      // cache childNodes before linking parent, fix #657
      var childNodes = toArray(node.childNodes);
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host, scope, frag);
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host, scope, frag);
      }
    }
  };
}

/**
 * Check for element directives (custom elements that should
 * be resovled as terminal directives).
 *
 * @param {Element} el
 * @param {Object} options
 */

function checkElementDirectives(el, options) {
  var tag = el.tagName.toLowerCase();
  if (commonTagRE.test(tag)) {
    return;
  }
  var def = resolveAsset(options, 'elementDirectives', tag);
  if (def) {
    return makeTerminalNodeLinkFn(el, tag, '', options, def);
  }
}

/**
 * Check if an element is a component. If yes, return
 * a component link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|undefined}
 */

function checkComponent(el, options) {
  var component = checkComponentAttr(el, options);
  if (component) {
    var ref = findRef(el);
    var descriptor = {
      name: 'component',
      ref: ref,
      expression: component.id,
      def: internalDirectives.component,
      modifiers: {
        literal: !component.dynamic
      }
    };
    var componentLinkFn = function componentLinkFn(vm, el, host, scope, frag) {
      if (ref) {
        defineReactive((scope || vm).$refs, ref, null);
      }
      vm._bindDir(descriptor, el, host, scope, frag);
    };
    componentLinkFn.terminal = true;
    return componentLinkFn;
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Array} attrs
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function checkTerminalDirectives(el, attrs, options) {
  // skip v-pre
  if (getAttr(el, 'v-pre') !== null) {
    return skip;
  }
  // skip v-else block, but only if following v-if
  if (el.hasAttribute('v-else')) {
    var prev = el.previousElementSibling;
    if (prev && prev.hasAttribute('v-if')) {
      return skip;
    }
  }

  var attr, name, value, modifiers, matched, dirName, rawName, arg, def, termDef;
  for (var i = 0, j = attrs.length; i < j; i++) {
    attr = attrs[i];
    name = attr.name.replace(modifierRE, '');
    if (matched = name.match(dirAttrRE)) {
      def = resolveAsset(options, 'directives', matched[1]);
      if (def && def.terminal) {
        if (!termDef || (def.priority || DEFAULT_TERMINAL_PRIORITY) > termDef.priority) {
          termDef = def;
          rawName = attr.name;
          modifiers = parseModifiers(attr.name);
          value = attr.value;
          dirName = matched[1];
          arg = matched[2];
        }
      }
    }
  }

  if (termDef) {
    return makeTerminalNodeLinkFn(el, dirName, value, options, termDef, rawName, arg, modifiers);
  }
}

function skip() {}
skip.terminal = true;

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @param {Object} def
 * @param {String} [rawName]
 * @param {String} [arg]
 * @param {Object} [modifiers]
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn(el, dirName, value, options, def, rawName, arg, modifiers) {
  var parsed = parseDirective(value);
  var descriptor = {
    name: dirName,
    arg: arg,
    expression: parsed.expression,
    filters: parsed.filters,
    raw: value,
    attr: rawName,
    modifiers: modifiers,
    def: def
  };
  // check ref for v-for and router-view
  if (dirName === 'for' || dirName === 'router-view') {
    descriptor.ref = findRef(el);
  }
  var fn = function terminalNodeLinkFn(vm, el, host, scope, frag) {
    if (descriptor.ref) {
      defineReactive((scope || vm).$refs, descriptor.ref, null);
    }
    vm._bindDir(descriptor, el, host, scope, frag);
  };
  fn.terminal = true;
  return fn;
}

/**
 * Compile the directives on an element and return a linker.
 *
 * @param {Array|NamedNodeMap} attrs
 * @param {Object} options
 * @return {Function}
 */

function compileDirectives(attrs, options) {
  var i = attrs.length;
  var dirs = [];
  var attr, name, value, rawName, rawValue, dirName, arg, modifiers, dirDef, tokens, matched;
  while (i--) {
    attr = attrs[i];
    name = rawName = attr.name;
    value = rawValue = attr.value;
    tokens = parseText(value);
    // reset arg
    arg = null;
    // check modifiers
    modifiers = parseModifiers(name);
    name = name.replace(modifierRE, '');

    // attribute interpolations
    if (tokens) {
      value = tokensToExp(tokens);
      arg = name;
      pushDir('bind', directives.bind, tokens);
      // warn against mixing mustaches with v-bind
      if (process.env.NODE_ENV !== 'production') {
        if (name === 'class' && Array.prototype.some.call(attrs, function (attr) {
          return attr.name === ':class' || attr.name === 'v-bind:class';
        })) {
          warn('class="' + rawValue + '": Do not mix mustache interpolation ' + 'and v-bind for "class" on the same element. Use one or the other.', options);
        }
      }
    } else

      // special attribute: transition
      if (transitionRE.test(name)) {
        modifiers.literal = !bindRE.test(name);
        pushDir('transition', internalDirectives.transition);
      } else

        // event handlers
        if (onRE.test(name)) {
          arg = name.replace(onRE, '');
          pushDir('on', directives.on);
        } else

          // attribute bindings
          if (bindRE.test(name)) {
            dirName = name.replace(bindRE, '');
            if (dirName === 'style' || dirName === 'class') {
              pushDir(dirName, internalDirectives[dirName]);
            } else {
              arg = dirName;
              pushDir('bind', directives.bind);
            }
          } else

            // normal directives
            if (matched = name.match(dirAttrRE)) {
              dirName = matched[1];
              arg = matched[2];

              // skip v-else (when used with v-show)
              if (dirName === 'else') {
                continue;
              }

              dirDef = resolveAsset(options, 'directives', dirName, true);
              if (dirDef) {
                pushDir(dirName, dirDef);
              }
            }
  }

  /**
   * Push a directive.
   *
   * @param {String} dirName
   * @param {Object|Function} def
   * @param {Array} [interpTokens]
   */

  function pushDir(dirName, def, interpTokens) {
    var hasOneTimeToken = interpTokens && hasOneTime(interpTokens);
    var parsed = !hasOneTimeToken && parseDirective(value);
    dirs.push({
      name: dirName,
      attr: rawName,
      raw: rawValue,
      def: def,
      arg: arg,
      modifiers: modifiers,
      // conversion from interpolation strings with one-time token
      // to expression is differed until directive bind time so that we
      // have access to the actual vm context for one-time bindings.
      expression: parsed && parsed.expression,
      filters: parsed && parsed.filters,
      interp: interpTokens,
      hasOneTime: hasOneTimeToken
    });
  }

  if (dirs.length) {
    return makeNodeLinkFn(dirs);
  }
}

/**
 * Parse modifiers from directive attribute name.
 *
 * @param {String} name
 * @return {Object}
 */

function parseModifiers(name) {
  var res = Object.create(null);
  var match = name.match(modifierRE);
  if (match) {
    var i = match.length;
    while (i--) {
      res[match[i].slice(1)] = true;
    }
  }
  return res;
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn(directives) {
  return function nodeLinkFn(vm, el, host, scope, frag) {
    // reverse apply because it's sorted low to high
    var i = directives.length;
    while (i--) {
      vm._bindDir(directives[i], el, host, scope, frag);
    }
  };
}

/**
 * Check if an interpolation string contains one-time tokens.
 *
 * @param {Array} tokens
 * @return {Boolean}
 */

function hasOneTime(tokens) {
  var i = tokens.length;
  while (i--) {
    if (tokens[i].oneTime) return true;
  }
}

function isScript(el) {
  return el.tagName === 'SCRIPT' && (!el.hasAttribute('type') || el.getAttribute('type') === 'text/javascript');
}

var specialCharRE = /[^\w\-:\.]/;

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-for.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transclude(el, options) {
  // extract container attributes to pass them down
  // to compiler, because they need to be compiled in
  // parent scope. we are mutating the options object here
  // assuming the same object will be used for compile
  // right after this.
  if (options) {
    options._containerAttrs = extractAttrs(el);
  }
  // for template tags, what we want is its content as
  // a documentFragment (for fragment instances)
  if (isTemplate(el)) {
    el = parseTemplate(el);
  }
  if (options) {
    if (options._asComponent && !options.template) {
      options.template = '<slot></slot>';
    }
    if (options.template) {
      options._content = extractContent(el);
      el = transcludeTemplate(el, options);
    }
  }
  if (isFragment(el)) {
    // anchors for fragment instance
    // passing in `persist: true` to avoid them being
    // discarded by IE during template cloning
    prepend(createAnchor('v-start', true), el);
    el.appendChild(createAnchor('v-end', true));
  }
  return el;
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate(el, options) {
  var template = options.template;
  var frag = parseTemplate(template, true);
  if (frag) {
    var replacer = frag.firstChild;
    var tag = replacer.tagName && replacer.tagName.toLowerCase();
    if (options.replace) {
      /* istanbul ignore if */
      if (el === document.body) {
        process.env.NODE_ENV !== 'production' && warn('You are mounting an instance with a template to ' + '<body>. This will replace <body> entirely. You ' + 'should probably use `replace: false` here.');
      }
      // there are many cases where the instance must
      // become a fragment instance: basically anything that
      // can create more than 1 root nodes.
      if (
      // multi-children template
      frag.childNodes.length > 1 ||
      // non-element template
      replacer.nodeType !== 1 ||
      // single nested component
      tag === 'component' || resolveAsset(options, 'components', tag) || hasBindAttr(replacer, 'is') ||
      // element directive
      resolveAsset(options, 'elementDirectives', tag) ||
      // for block
      replacer.hasAttribute('v-for') ||
      // if block
      replacer.hasAttribute('v-if')) {
        return frag;
      } else {
        options._replacerAttrs = extractAttrs(replacer);
        mergeAttrs(el, replacer);
        return replacer;
      }
    } else {
      el.appendChild(frag);
      return el;
    }
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid template option: ' + template);
  }
}

/**
 * Helper to extract a component container's attributes
 * into a plain object array.
 *
 * @param {Element} el
 * @return {Array}
 */

function extractAttrs(el) {
  if (el.nodeType === 1 && el.hasAttributes()) {
    return toArray(el.attributes);
  }
}

/**
 * Merge the attributes of two elements, and make sure
 * the class names are merged properly.
 *
 * @param {Element} from
 * @param {Element} to
 */

function mergeAttrs(from, to) {
  var attrs = from.attributes;
  var i = attrs.length;
  var name, value;
  while (i--) {
    name = attrs[i].name;
    value = attrs[i].value;
    if (!to.hasAttribute(name) && !specialCharRE.test(name)) {
      to.setAttribute(name, value);
    } else if (name === 'class' && !parseText(value) && (value = value.trim())) {
      value.split(/\s+/).forEach(function (cls) {
        addClass(to, cls);
      });
    }
  }
}

/**
 * Scan and determine slot content distribution.
 * We do this during transclusion instead at compile time so that
 * the distribution is decoupled from the compilation order of
 * the slots.
 *
 * @param {Element|DocumentFragment} template
 * @param {Element} content
 * @param {Vue} vm
 */

function resolveSlots(vm, content) {
  if (!content) {
    return;
  }
  var contents = vm._slotContents = Object.create(null);
  var el, name;
  for (var i = 0, l = content.children.length; i < l; i++) {
    el = content.children[i];
    /* eslint-disable no-cond-assign */
    if (name = el.getAttribute('slot')) {
      (contents[name] || (contents[name] = [])).push(el);
    }
    /* eslint-enable no-cond-assign */
    if (process.env.NODE_ENV !== 'production' && getBindAttr(el, 'slot')) {
      warn('The "slot" attribute must be static.', vm.$parent);
    }
  }
  for (name in contents) {
    contents[name] = extractFragment(contents[name], content);
  }
  if (content.hasChildNodes()) {
    var nodes = content.childNodes;
    if (nodes.length === 1 && nodes[0].nodeType === 3 && !nodes[0].data.trim()) {
      return;
    }
    contents['default'] = extractFragment(content.childNodes, content);
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @return {DocumentFragment}
 */

function extractFragment(nodes, parent) {
  var frag = document.createDocumentFragment();
  nodes = toArray(nodes);
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    if (isTemplate(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
      parent.removeChild(node);
      node = parseTemplate(node, true);
    }
    frag.appendChild(node);
  }
  return frag;
}



var compiler = Object.freeze({
	compile: compile,
	compileAndLinkProps: compileAndLinkProps,
	compileRoot: compileRoot,
	transclude: transclude,
	resolveSlots: resolveSlots
});

function stateMixin (Vue) {
  /**
   * Accessor for `$data` property, since setting $data
   * requires observing the new object and updating
   * proxied properties.
   */

  Object.defineProperty(Vue.prototype, '$data', {
    get: function get() {
      return this._data;
    },
    set: function set(newData) {
      if (newData !== this._data) {
        this._setData(newData);
      }
    }
  });

  /**
   * Setup the scope of an instance, which contains:
   * - observed data
   * - computed properties
   * - user methods
   * - meta properties
   */

  Vue.prototype._initState = function () {
    this._initProps();
    this._initMeta();
    this._initMethods();
    this._initData();
    this._initComputed();
  };

  /**
   * Initialize props.
   */

  Vue.prototype._initProps = function () {
    var options = this.$options;
    var el = options.el;
    var props = options.props;
    if (props && !el) {
      process.env.NODE_ENV !== 'production' && warn('Props will not be compiled if no `el` option is ' + 'provided at instantiation.', this);
    }
    // make sure to convert string selectors into element now
    el = options.el = query(el);
    this._propsUnlinkFn = el && el.nodeType === 1 && props
    // props must be linked in proper scope if inside v-for
    ? compileAndLinkProps(this, el, props, this._scope) : null;
  };

  /**
   * Initialize the data.
   */

  Vue.prototype._initData = function () {
    var dataFn = this.$options.data;
    var data = this._data = dataFn ? dataFn() : {};
    if (!isPlainObject(data)) {
      data = {};
      process.env.NODE_ENV !== 'production' && warn('data functions should return an object.', this);
    }
    var props = this._props;
    // proxy data on instance
    var keys = Object.keys(data);
    var i, key;
    i = keys.length;
    while (i--) {
      key = keys[i];
      // there are two scenarios where we can proxy a data key:
      // 1. it's not already defined as a prop
      // 2. it's provided via a instantiation option AND there are no
      //    template prop present
      if (!props || !hasOwn(props, key)) {
        this._proxy(key);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Data field "' + key + '" is already defined ' + 'as a prop. To provide default value for a prop, use the "default" ' + 'prop option; if you want to pass prop values to an instantiation ' + 'call, use the "propsData" option.', this);
      }
    }
    // observe data
    observe(data, this);
  };

  /**
   * Swap the instance's $data. Called in $data's setter.
   *
   * @param {Object} newData
   */

  Vue.prototype._setData = function (newData) {
    newData = newData || {};
    var oldData = this._data;
    this._data = newData;
    var keys, key, i;
    // unproxy keys not present in new data
    keys = Object.keys(oldData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!(key in newData)) {
        this._unproxy(key);
      }
    }
    // proxy keys not already proxied,
    // and trigger change for changed values
    keys = Object.keys(newData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!hasOwn(this, key)) {
        // new property
        this._proxy(key);
      }
    }
    oldData.__ob__.removeVm(this);
    observe(newData, this);
    this._digest();
  };

  /**
   * Proxy a property, so that
   * vm.prop === vm._data.prop
   *
   * @param {String} key
   */

  Vue.prototype._proxy = function (key) {
    if (!isReserved(key)) {
      // need to store ref to self here
      // because these getter/setters might
      // be called by child scopes via
      // prototype inheritance.
      var self = this;
      Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(val) {
          self._data[key] = val;
        }
      });
    }
  };

  /**
   * Unproxy a property.
   *
   * @param {String} key
   */

  Vue.prototype._unproxy = function (key) {
    if (!isReserved(key)) {
      delete this[key];
    }
  };

  /**
   * Force update on every watcher in scope.
   */

  Vue.prototype._digest = function () {
    for (var i = 0, l = this._watchers.length; i < l; i++) {
      this._watchers[i].update(true); // shallow updates
    }
  };

  /**
   * Setup computed properties. They are essentially
   * special getter/setters
   */

  function noop() {}
  Vue.prototype._initComputed = function () {
    var computed = this.$options.computed;
    if (computed) {
      for (var key in computed) {
        var userDef = computed[key];
        var def = {
          enumerable: true,
          configurable: true
        };
        if (typeof userDef === 'function') {
          def.get = makeComputedGetter(userDef, this);
          def.set = noop;
        } else {
          def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, this) : bind(userDef.get, this) : noop;
          def.set = userDef.set ? bind(userDef.set, this) : noop;
        }
        Object.defineProperty(this, key, def);
      }
    }
  };

  function makeComputedGetter(getter, owner) {
    var watcher = new Watcher(owner, getter, null, {
      lazy: true
    });
    return function computedGetter() {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  /**
   * Setup instance methods. Methods must be bound to the
   * instance since they might be passed down as a prop to
   * child components.
   */

  Vue.prototype._initMethods = function () {
    var methods = this.$options.methods;
    if (methods) {
      for (var key in methods) {
        this[key] = bind(methods[key], this);
      }
    }
  };

  /**
   * Initialize meta information like $index, $key & $value.
   */

  Vue.prototype._initMeta = function () {
    var metas = this.$options._meta;
    if (metas) {
      for (var key in metas) {
        defineReactive(this, key, metas[key]);
      }
    }
  };
}

var eventRE = /^v-on:|^@/;

function eventsMixin (Vue) {
  /**
   * Setup the instance's option events & watchers.
   * If the value is a string, we pull it from the
   * instance's methods by name.
   */

  Vue.prototype._initEvents = function () {
    var options = this.$options;
    if (options._asComponent) {
      registerComponentEvents(this, options.el);
    }
    registerCallbacks(this, '$on', options.events);
    registerCallbacks(this, '$watch', options.watch);
  };

  /**
   * Register v-on events on a child component
   *
   * @param {Vue} vm
   * @param {Element} el
   */

  function registerComponentEvents(vm, el) {
    var attrs = el.attributes;
    var name, value, handler;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (eventRE.test(name)) {
        name = name.replace(eventRE, '');
        // force the expression into a statement so that
        // it always dynamically resolves the method to call (#2670)
        // kinda ugly hack, but does the job.
        value = attrs[i].value;
        if (isSimplePath(value)) {
          value += '.apply(this, $arguments)';
        }
        handler = (vm._scope || vm._context).$eval(value, true);
        handler._fromParent = true;
        vm.$on(name.replace(eventRE), handler);
      }
    }
  }

  /**
   * Register callbacks for option events and watchers.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {Object} hash
   */

  function registerCallbacks(vm, action, hash) {
    if (!hash) return;
    var handlers, key, i, j;
    for (key in hash) {
      handlers = hash[key];
      if (isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(vm, action, key, handlers[i]);
        }
      } else {
        register(vm, action, key, handlers);
      }
    }
  }

  /**
   * Helper to register an event/watch callback.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {String} key
   * @param {Function|String|Object} handler
   * @param {Object} [options]
   */

  function register(vm, action, key, handler, options) {
    var type = typeof handler;
    if (type === 'function') {
      vm[action](key, handler, options);
    } else if (type === 'string') {
      var methods = vm.$options.methods;
      var method = methods && methods[handler];
      if (method) {
        vm[action](key, method, options);
      } else {
        process.env.NODE_ENV !== 'production' && warn('Unknown method: "' + handler + '" when ' + 'registering callback for ' + action + ': "' + key + '".', vm);
      }
    } else if (handler && type === 'object') {
      register(vm, action, key, handler.handler, handler);
    }
  }

  /**
   * Setup recursive attached/detached calls
   */

  Vue.prototype._initDOMHooks = function () {
    this.$on('hook:attached', onAttached);
    this.$on('hook:detached', onDetached);
  };

  /**
   * Callback to recursively call attached hook on children
   */

  function onAttached() {
    if (!this._isAttached) {
      this._isAttached = true;
      this.$children.forEach(callAttach);
    }
  }

  /**
   * Iterator to call attached hook
   *
   * @param {Vue} child
   */

  function callAttach(child) {
    if (!child._isAttached && inDoc(child.$el)) {
      child._callHook('attached');
    }
  }

  /**
   * Callback to recursively call detached hook on children
   */

  function onDetached() {
    if (this._isAttached) {
      this._isAttached = false;
      this.$children.forEach(callDetach);
    }
  }

  /**
   * Iterator to call detached hook
   *
   * @param {Vue} child
   */

  function callDetach(child) {
    if (child._isAttached && !inDoc(child.$el)) {
      child._callHook('detached');
    }
  }

  /**
   * Trigger all handlers for a hook
   *
   * @param {String} hook
   */

  Vue.prototype._callHook = function (hook) {
    this.$emit('pre-hook:' + hook);
    var handlers = this.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(this);
      }
    }
    this.$emit('hook:' + hook);
  };
}

function noop$1() {}

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {Object} descriptor
 *                 - {String} name
 *                 - {Object} def
 *                 - {String} expression
 *                 - {Array<Object>} [filters]
 *                 - {Object} [modifiers]
 *                 - {Boolean} literal
 *                 - {String} attr
 *                 - {String} arg
 *                 - {String} raw
 *                 - {String} [ref]
 *                 - {Array<Object>} [interp]
 *                 - {Boolean} [hasOneTime]
 * @param {Vue} vm
 * @param {Node} el
 * @param {Vue} [host] - transclusion host component
 * @param {Object} [scope] - v-for scope
 * @param {Fragment} [frag] - owner fragment
 * @constructor
 */
function Directive(descriptor, vm, el, host, scope, frag) {
  this.vm = vm;
  this.el = el;
  // copy descriptor properties
  this.descriptor = descriptor;
  this.name = descriptor.name;
  this.expression = descriptor.expression;
  this.arg = descriptor.arg;
  this.modifiers = descriptor.modifiers;
  this.filters = descriptor.filters;
  this.literal = this.modifiers && this.modifiers.literal;
  // private
  this._locked = false;
  this._bound = false;
  this._listeners = null;
  // link context
  this._host = host;
  this._scope = scope;
  this._frag = frag;
  // store directives on node in dev mode
  if (process.env.NODE_ENV !== 'production' && this.el) {
    this.el._vue_directives = this.el._vue_directives || [];
    this.el._vue_directives.push(this);
  }
}

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 */

Directive.prototype._bind = function () {
  var name = this.name;
  var descriptor = this.descriptor;

  // remove attribute
  if ((name !== 'cloak' || this.vm._isCompiled) && this.el && this.el.removeAttribute) {
    var attr = descriptor.attr || 'v-' + name;
    this.el.removeAttribute(attr);
  }

  // copy def properties
  var def = descriptor.def;
  if (typeof def === 'function') {
    this.update = def;
  } else {
    extend(this, def);
  }

  // setup directive params
  this._setupParams();

  // initial bind
  if (this.bind) {
    this.bind();
  }
  this._bound = true;

  if (this.literal) {
    this.update && this.update(descriptor.raw);
  } else if ((this.expression || this.modifiers) && (this.update || this.twoWay) && !this._checkStatement()) {
    // wrapped updater for context
    var dir = this;
    if (this.update) {
      this._update = function (val, oldVal) {
        if (!dir._locked) {
          dir.update(val, oldVal);
        }
      };
    } else {
      this._update = noop$1;
    }
    var preProcess = this._preProcess ? bind(this._preProcess, this) : null;
    var postProcess = this._postProcess ? bind(this._postProcess, this) : null;
    var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update, // callback
    {
      filters: this.filters,
      twoWay: this.twoWay,
      deep: this.deep,
      preProcess: preProcess,
      postProcess: postProcess,
      scope: this._scope
    });
    // v-model with inital inline value need to sync back to
    // model instead of update to DOM on init. They would
    // set the afterBind hook to indicate that.
    if (this.afterBind) {
      this.afterBind();
    } else if (this.update) {
      this.update(watcher.value);
    }
  }
};

/**
 * Setup all param attributes, e.g. track-by,
 * transition-mode, etc...
 */

Directive.prototype._setupParams = function () {
  if (!this.params) {
    return;
  }
  var params = this.params;
  // swap the params array with a fresh object.
  this.params = Object.create(null);
  var i = params.length;
  var key, val, mappedKey;
  while (i--) {
    key = hyphenate(params[i]);
    mappedKey = camelize(key);
    val = getBindAttr(this.el, key);
    if (val != null) {
      // dynamic
      this._setupParamWatcher(mappedKey, val);
    } else {
      // static
      val = getAttr(this.el, key);
      if (val != null) {
        this.params[mappedKey] = val === '' ? true : val;
      }
    }
  }
};

/**
 * Setup a watcher for a dynamic param.
 *
 * @param {String} key
 * @param {String} expression
 */

Directive.prototype._setupParamWatcher = function (key, expression) {
  var self = this;
  var called = false;
  var unwatch = (this._scope || this.vm).$watch(expression, function (val, oldVal) {
    self.params[key] = val;
    // since we are in immediate mode,
    // only call the param change callbacks if this is not the first update.
    if (called) {
      var cb = self.paramWatchers && self.paramWatchers[key];
      if (cb) {
        cb.call(self, val, oldVal);
      }
    } else {
      called = true;
    }
  }, {
    immediate: true,
    user: false
  });(this._paramUnwatchFns || (this._paramUnwatchFns = [])).push(unwatch);
};

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. on-click="a++"
 *
 * @return {Boolean}
 */

Directive.prototype._checkStatement = function () {
  var expression = this.expression;
  if (expression && this.acceptStatement && !isSimplePath(expression)) {
    var fn = parseExpression(expression).get;
    var scope = this._scope || this.vm;
    var handler = function handler(e) {
      scope.$event = e;
      fn.call(scope, scope);
      scope.$event = null;
    };
    if (this.filters) {
      handler = scope._applyFilters(handler, null, this.filters);
    }
    this.update(handler);
    return true;
  }
};

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @public
 */

Directive.prototype.set = function (value) {
  /* istanbul ignore else */
  if (this.twoWay) {
    this._withLock(function () {
      this._watcher.set(value);
    });
  } else if (process.env.NODE_ENV !== 'production') {
    warn('Directive.set() can only be used inside twoWay' + 'directives.');
  }
};

/**
 * Execute a function while preventing that function from
 * triggering updates on this directive instance.
 *
 * @param {Function} fn
 */

Directive.prototype._withLock = function (fn) {
  var self = this;
  self._locked = true;
  fn.call(self);
  nextTick(function () {
    self._locked = false;
  });
};

/**
 * Convenience method that attaches a DOM event listener
 * to the directive element and autometically tears it down
 * during unbind.
 *
 * @param {String} event
 * @param {Function} handler
 * @param {Boolean} [useCapture]
 */

Directive.prototype.on = function (event, handler, useCapture) {
  on(this.el, event, handler, useCapture);(this._listeners || (this._listeners = [])).push([event, handler]);
};

/**
 * Teardown the watcher and call unbind.
 */

Directive.prototype._teardown = function () {
  if (this._bound) {
    this._bound = false;
    if (this.unbind) {
      this.unbind();
    }
    if (this._watcher) {
      this._watcher.teardown();
    }
    var listeners = this._listeners;
    var i;
    if (listeners) {
      i = listeners.length;
      while (i--) {
        off(this.el, listeners[i][0], listeners[i][1]);
      }
    }
    var unwatchFns = this._paramUnwatchFns;
    if (unwatchFns) {
      i = unwatchFns.length;
      while (i--) {
        unwatchFns[i]();
      }
    }
    if (process.env.NODE_ENV !== 'production' && this.el) {
      this.el._vue_directives.$remove(this);
    }
    this.vm = this.el = this._watcher = this._listeners = null;
  }
};

function lifecycleMixin (Vue) {
  /**
   * Update v-ref for component.
   *
   * @param {Boolean} remove
   */

  Vue.prototype._updateRef = function (remove) {
    var ref = this.$options._ref;
    if (ref) {
      var refs = (this._scope || this._context).$refs;
      if (remove) {
        if (refs[ref] === this) {
          refs[ref] = null;
        }
      } else {
        refs[ref] = this;
      }
    }
  };

  /**
   * Transclude, compile and link element.
   *
   * If a pre-compiled linker is available, that means the
   * passed in element will be pre-transcluded and compiled
   * as well - all we need to do is to call the linker.
   *
   * Otherwise we need to call transclude/compile/link here.
   *
   * @param {Element} el
   */

  Vue.prototype._compile = function (el) {
    var options = this.$options;

    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference; this step also injects
    // the template and caches the original attributes
    // on the container node and replacer node.
    var original = el;
    el = transclude(el, options);
    this._initElement(el);

    // handle v-pre on root node (#2026)
    if (el.nodeType === 1 && getAttr(el, 'v-pre') !== null) {
      return;
    }

    // root is always compiled per-instance, because
    // container attrs and props can be different every time.
    var contextOptions = this._context && this._context.$options;
    var rootLinker = compileRoot(el, options, contextOptions);

    // resolve slot distribution
    resolveSlots(this, options._content);

    // compile and link the rest
    var contentLinkFn;
    var ctor = this.constructor;
    // component compilation can be cached
    // as long as it's not using inline-template
    if (options._linkerCachable) {
      contentLinkFn = ctor.linker;
      if (!contentLinkFn) {
        contentLinkFn = ctor.linker = compile(el, options);
      }
    }

    // link phase
    // make sure to link root with prop scope!
    var rootUnlinkFn = rootLinker(this, el, this._scope);
    var contentUnlinkFn = contentLinkFn ? contentLinkFn(this, el) : compile(el, options)(this, el);

    // register composite unlink function
    // to be called during instance destruction
    this._unlinkFn = function () {
      rootUnlinkFn();
      // passing destroying: true to avoid searching and
      // splicing the directives
      contentUnlinkFn(true);
    };

    // finally replace original
    if (options.replace) {
      replace(original, el);
    }

    this._isCompiled = true;
    this._callHook('compiled');
  };

  /**
   * Initialize instance element. Called in the public
   * $mount() method.
   *
   * @param {Element} el
   */

  Vue.prototype._initElement = function (el) {
    if (isFragment(el)) {
      this._isFragment = true;
      this.$el = this._fragmentStart = el.firstChild;
      this._fragmentEnd = el.lastChild;
      // set persisted text anchors to empty
      if (this._fragmentStart.nodeType === 3) {
        this._fragmentStart.data = this._fragmentEnd.data = '';
      }
      this._fragment = el;
    } else {
      this.$el = el;
    }
    this.$el.__vue__ = this;
    this._callHook('beforeCompile');
  };

  /**
   * Create and bind a directive to an element.
   *
   * @param {Object} descriptor - parsed directive descriptor
   * @param {Node} node   - target node
   * @param {Vue} [host] - transclusion host component
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - owner fragment
   */

  Vue.prototype._bindDir = function (descriptor, node, host, scope, frag) {
    this._directives.push(new Directive(descriptor, this, node, host, scope, frag));
  };

  /**
   * Teardown an instance, unobserves the data, unbind all the
   * directives, turn off all the event listeners, etc.
   *
   * @param {Boolean} remove - whether to remove the DOM node.
   * @param {Boolean} deferCleanup - if true, defer cleanup to
   *                                 be called later
   */

  Vue.prototype._destroy = function (remove, deferCleanup) {
    if (this._isBeingDestroyed) {
      if (!deferCleanup) {
        this._cleanup();
      }
      return;
    }

    var destroyReady;
    var pendingRemoval;

    var self = this;
    // Cleanup should be called either synchronously or asynchronoysly as
    // callback of this.$remove(), or if remove and deferCleanup are false.
    // In any case it should be called after all other removing, unbinding and
    // turning of is done
    var cleanupIfPossible = function cleanupIfPossible() {
      if (destroyReady && !pendingRemoval && !deferCleanup) {
        self._cleanup();
      }
    };

    // remove DOM element
    if (remove && this.$el) {
      pendingRemoval = true;
      this.$remove(function () {
        pendingRemoval = false;
        cleanupIfPossible();
      });
    }

    this._callHook('beforeDestroy');
    this._isBeingDestroyed = true;
    var i;
    // remove self from parent. only necessary
    // if parent is not being destroyed as well.
    var parent = this.$parent;
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this);
      // unregister ref (remove: true)
      this._updateRef(true);
    }
    // destroy all children.
    i = this.$children.length;
    while (i--) {
      this.$children[i].$destroy();
    }
    // teardown props
    if (this._propsUnlinkFn) {
      this._propsUnlinkFn();
    }
    // teardown all directives. this also tearsdown all
    // directive-owned watchers.
    if (this._unlinkFn) {
      this._unlinkFn();
    }
    i = this._watchers.length;
    while (i--) {
      this._watchers[i].teardown();
    }
    // remove reference to self on $el
    if (this.$el) {
      this.$el.__vue__ = null;
    }

    destroyReady = true;
    cleanupIfPossible();
  };

  /**
   * Clean up to ensure garbage collection.
   * This is called after the leave transition if there
   * is any.
   */

  Vue.prototype._cleanup = function () {
    if (this._isDestroyed) {
      return;
    }
    // remove self from owner fragment
    // do it in cleanup so that we can call $destroy with
    // defer right when a fragment is about to be removed.
    if (this._frag) {
      this._frag.children.$remove(this);
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data && this._data.__ob__) {
      this._data.__ob__.removeVm(this);
    }
    // Clean up references to private properties and other
    // instances. preserve reference to _data so that proxy
    // accessors still work. The only potential side effect
    // here is that mutating the instance after it's destroyed
    // may affect the state of other components that are still
    // observing the same object, but that seems to be a
    // reasonable responsibility for the user rather than
    // always throwing an error on them.
    this.$el = this.$parent = this.$root = this.$children = this._watchers = this._context = this._scope = this._directives = null;
    // call the last hook...
    this._isDestroyed = true;
    this._callHook('destroyed');
    // turn off all instance listeners.
    this.$off();
  };
}

function miscMixin (Vue) {
  /**
   * Apply a list of filter (descriptors) to a value.
   * Using plain for loops here because this will be called in
   * the getter of any watcher with filters so it is very
   * performance sensitive.
   *
   * @param {*} value
   * @param {*} [oldValue]
   * @param {Array} filters
   * @param {Boolean} write
   * @return {*}
   */

  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
    var filter, fn, args, arg, offset, i, l, j, k;
    for (i = 0, l = filters.length; i < l; i++) {
      filter = filters[write ? l - i - 1 : i];
      fn = resolveAsset(this.$options, 'filters', filter.name, true);
      if (!fn) continue;
      fn = write ? fn.write : fn.read || fn;
      if (typeof fn !== 'function') continue;
      args = write ? [value, oldValue] : [value];
      offset = write ? 2 : 1;
      if (filter.args) {
        for (j = 0, k = filter.args.length; j < k; j++) {
          arg = filter.args[j];
          args[j + offset] = arg.dynamic ? this.$get(arg.value) : arg.value;
        }
      }
      value = fn.apply(this, args);
    }
    return value;
  };

  /**
   * Resolve a component, depending on whether the component
   * is defined normally or using an async factory function.
   * Resolves synchronously if already resolved, otherwise
   * resolves asynchronously and caches the resolved
   * constructor on the factory.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  Vue.prototype._resolveComponent = function (value, cb) {
    var factory;
    if (typeof value === 'function') {
      factory = value;
    } else {
      factory = resolveAsset(this.$options, 'components', value, true);
    }
    /* istanbul ignore if */
    if (!factory) {
      return;
    }
    // async component factory
    if (!factory.options) {
      if (factory.resolved) {
        // cached
        cb(factory.resolved);
      } else if (factory.requested) {
        // pool callbacks
        factory.pendingCallbacks.push(cb);
      } else {
        factory.requested = true;
        var cbs = factory.pendingCallbacks = [cb];
        factory.call(this, function resolve(res) {
          if (isPlainObject(res)) {
            res = Vue.extend(res);
          }
          // cache resolved
          factory.resolved = res;
          // invoke callbacks
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res);
          }
        }, function reject(reason) {
          process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component' + (typeof value === 'string' ? ': ' + value : '') + '. ' + (reason ? '\nReason: ' + reason : ''));
        });
      }
    } else {
      // normal component
      cb(factory);
    }
  };
}

var filterRE$1 = /[^|]\|[^|]/;

function dataAPI (Vue) {
  /**
   * Get the value from an expression on this vm.
   *
   * @param {String} exp
   * @param {Boolean} [asStatement]
   * @return {*}
   */

  Vue.prototype.$get = function (exp, asStatement) {
    var res = parseExpression(exp);
    if (res) {
      if (asStatement) {
        var self = this;
        return function statementHandler() {
          self.$arguments = toArray(arguments);
          var result = res.get.call(self, self);
          self.$arguments = null;
          return result;
        };
      } else {
        try {
          return res.get.call(this, this);
        } catch (e) {}
      }
    }
  };

  /**
   * Set the value from an expression on this vm.
   * The expression must be a valid left-hand
   * expression in an assignment.
   *
   * @param {String} exp
   * @param {*} val
   */

  Vue.prototype.$set = function (exp, val) {
    var res = parseExpression(exp, true);
    if (res && res.set) {
      res.set.call(this, this, val);
    }
  };

  /**
   * Delete a property on the VM
   *
   * @param {String} key
   */

  Vue.prototype.$delete = function (key) {
    del(this._data, key);
  };

  /**
   * Watch an expression, trigger callback when its
   * value changes.
   *
   * @param {String|Function} expOrFn
   * @param {Function} cb
   * @param {Object} [options]
   *                 - {Boolean} deep
   *                 - {Boolean} immediate
   * @return {Function} - unwatchFn
   */

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    var parsed;
    if (typeof expOrFn === 'string') {
      parsed = parseDirective(expOrFn);
      expOrFn = parsed.expression;
    }
    var watcher = new Watcher(vm, expOrFn, cb, {
      deep: options && options.deep,
      sync: options && options.sync,
      filters: parsed && parsed.filters,
      user: !options || options.user !== false
    });
    if (options && options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };

  /**
   * Evaluate a text directive, including filters.
   *
   * @param {String} text
   * @param {Boolean} [asStatement]
   * @return {String}
   */

  Vue.prototype.$eval = function (text, asStatement) {
    // check for filters.
    if (filterRE$1.test(text)) {
      var dir = parseDirective(text);
      // the filter regex check might give false positive
      // for pipes inside strings, so it's possible that
      // we don't get any filters here
      var val = this.$get(dir.expression, asStatement);
      return dir.filters ? this._applyFilters(val, null, dir.filters) : val;
    } else {
      // no filter
      return this.$get(text, asStatement);
    }
  };

  /**
   * Interpolate a piece of template text.
   *
   * @param {String} text
   * @return {String}
   */

  Vue.prototype.$interpolate = function (text) {
    var tokens = parseText(text);
    var vm = this;
    if (tokens) {
      if (tokens.length === 1) {
        return vm.$eval(tokens[0].value) + '';
      } else {
        return tokens.map(function (token) {
          return token.tag ? vm.$eval(token.value) : token.value;
        }).join('');
      }
    } else {
      return text;
    }
  };

  /**
   * Log instance data as a plain JS object
   * so that it is easier to inspect in console.
   * This method assumes console is available.
   *
   * @param {String} [path]
   */

  Vue.prototype.$log = function (path) {
    var data = path ? getPath(this._data, path) : this._data;
    if (data) {
      data = clean(data);
    }
    // include computed fields
    if (!path) {
      var key;
      for (key in this.$options.computed) {
        data[key] = clean(this[key]);
      }
      if (this._props) {
        for (key in this._props) {
          data[key] = clean(this[key]);
        }
      }
    }
    console.log(data);
  };

  /**
   * "clean" a getter/setter converted object into a plain
   * object copy.
   *
   * @param {Object} - obj
   * @return {Object}
   */

  function clean(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

function domAPI (Vue) {
  /**
   * Convenience on-instance nextTick. The callback is
   * auto-bound to the instance, and this avoids component
   * modules having to rely on the global Vue.
   *
   * @param {Function} fn
   */

  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this);
  };

  /**
   * Append instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$appendTo = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, append, appendWithTransition);
  };

  /**
   * Prepend instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$prependTo = function (target, cb, withTransition) {
    target = query(target);
    if (target.hasChildNodes()) {
      this.$before(target.firstChild, cb, withTransition);
    } else {
      this.$appendTo(target, cb, withTransition);
    }
    return this;
  };

  /**
   * Insert instance before target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$before = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, beforeWithCb, beforeWithTransition);
  };

  /**
   * Insert instance after target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$after = function (target, cb, withTransition) {
    target = query(target);
    if (target.nextSibling) {
      this.$before(target.nextSibling, cb, withTransition);
    } else {
      this.$appendTo(target.parentNode, cb, withTransition);
    }
    return this;
  };

  /**
   * Remove instance from DOM
   *
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$remove = function (cb, withTransition) {
    if (!this.$el.parentNode) {
      return cb && cb();
    }
    var inDocument = this._isAttached && inDoc(this.$el);
    // if we are not in document, no need to check
    // for transitions
    if (!inDocument) withTransition = false;
    var self = this;
    var realCb = function realCb() {
      if (inDocument) self._callHook('detached');
      if (cb) cb();
    };
    if (this._isFragment) {
      removeNodeRange(this._fragmentStart, this._fragmentEnd, this, this._fragment, realCb);
    } else {
      var op = withTransition === false ? removeWithCb : removeWithTransition;
      op(this.$el, this, realCb);
    }
    return this;
  };

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

  function insert(vm, target, cb, withTransition, op1, op2) {
    target = query(target);
    var targetIsDetached = !inDoc(target);
    var op = withTransition === false || targetIsDetached ? op1 : op2;
    var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);
    if (vm._isFragment) {
      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
        op(node, target, vm);
      });
      cb && cb();
    } else {
      op(vm.$el, target, vm, cb);
    }
    if (shouldCallHook) {
      vm._callHook('attached');
    }
    return vm;
  }

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

  function query(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
  }

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function append(el, target, vm, cb) {
    target.appendChild(el);
    if (cb) cb();
  }

  /**
   * InsertBefore operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function beforeWithCb(el, target, vm, cb) {
    before(el, target);
    if (cb) cb();
  }

  /**
   * Remove operation that takes a callback.
   *
   * @param {Node} el
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function removeWithCb(el, vm, cb) {
    remove(el);
    if (cb) cb();
  }
}

function eventsAPI (Vue) {
  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
    modifyListenerCount(this, event, 1);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this;
    function on() {
      self.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs;
    // all
    if (!arguments.length) {
      if (this.$parent) {
        for (event in this._events) {
          cbs = this._events[event];
          if (cbs) {
            modifyListenerCount(this, event, -cbs.length);
          }
        }
      }
      this._events = {};
      return this;
    }
    // specific event
    cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (arguments.length === 1) {
      modifyListenerCount(this, event, -cbs.length);
      this._events[event] = null;
      return this;
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        modifyListenerCount(this, event, -1);
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Trigger an event on self.
   *
   * @param {String|Object} event
   * @return {Boolean} shouldPropagate
   */

  Vue.prototype.$emit = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    var cbs = this._events[event];
    var shouldPropagate = isSource || !cbs;
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      // this is a somewhat hacky solution to the question raised
      // in #2102: for an inline component listener like <comp @test="doThis">,
      // the propagation handling is somewhat broken. Therefore we
      // need to treat these inline callbacks differently.
      var hasParentCbs = isSource && cbs.some(function (cb) {
        return cb._fromParent;
      });
      if (hasParentCbs) {
        shouldPropagate = false;
      }
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        var cb = cbs[i];
        var res = cb.apply(this, args);
        if (res === true && (!hasParentCbs || cb._fromParent)) {
          shouldPropagate = true;
        }
      }
    }
    return shouldPropagate;
  };

  /**
   * Recursively broadcast an event to all children instances.
   *
   * @param {String|Object} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$broadcast = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    // if no child has registered for this event,
    // then there's no need to broadcast.
    if (!this._eventsCount[event]) return;
    var children = this.$children;
    var args = toArray(arguments);
    if (isSource) {
      // use object event to indicate non-source emit
      // on children
      args[0] = { name: event, source: this };
    }
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var shouldPropagate = child.$emit.apply(child, args);
      if (shouldPropagate) {
        child.$broadcast.apply(child, args);
      }
    }
    return this;
  };

  /**
   * Recursively propagate an event up the parent chain.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$dispatch = function (event) {
    var shouldPropagate = this.$emit.apply(this, arguments);
    if (!shouldPropagate) return;
    var parent = this.$parent;
    var args = toArray(arguments);
    // use object event to indicate non-source emit
    // on parents
    args[0] = { name: event, source: this };
    while (parent) {
      shouldPropagate = parent.$emit.apply(parent, args);
      parent = shouldPropagate ? parent.$parent : null;
    }
    return this;
  };

  /**
   * Modify the listener counts on all parents.
   * This bookkeeping allows $broadcast to return early when
   * no child has listened to a certain event.
   *
   * @param {Vue} vm
   * @param {String} event
   * @param {Number} count
   */

  var hookRE = /^hook:/;
  function modifyListenerCount(vm, event, count) {
    var parent = vm.$parent;
    // hooks do not get broadcasted so no need
    // to do bookkeeping for them
    if (!parent || !count || hookRE.test(event)) return;
    while (parent) {
      parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
      parent = parent.$parent;
    }
  }
}

function lifecycleAPI (Vue) {
  /**
   * Set instance target element and kick off the compilation
   * process. The passed in `el` can be a selector string, an
   * existing Element, or a DocumentFragment (for block
   * instances).
   *
   * @param {Element|DocumentFragment|string} el
   * @public
   */

  Vue.prototype.$mount = function (el) {
    if (this._isCompiled) {
      process.env.NODE_ENV !== 'production' && warn('$mount() should be called only once.', this);
      return;
    }
    el = query(el);
    if (!el) {
      el = document.createElement('div');
    }
    this._compile(el);
    this._initDOMHooks();
    if (inDoc(this.$el)) {
      this._callHook('attached');
      ready.call(this);
    } else {
      this.$once('hook:attached', ready);
    }
    return this;
  };

  /**
   * Mark an instance as ready.
   */

  function ready() {
    this._isAttached = true;
    this._isReady = true;
    this._callHook('ready');
  }

  /**
   * Teardown the instance, simply delegate to the internal
   * _destroy.
   *
   * @param {Boolean} remove
   * @param {Boolean} deferCleanup
   */

  Vue.prototype.$destroy = function (remove, deferCleanup) {
    this._destroy(remove, deferCleanup);
  };

  /**
   * Partially compile a piece of DOM and return a
   * decompile function.
   *
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host]
   * @param {Object} [scope]
   * @param {Fragment} [frag]
   * @return {Function}
   */

  Vue.prototype.$compile = function (el, host, scope, frag) {
    return compile(el, this.$options, true)(this, el, host, scope, frag);
  };
}

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

// install internals
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
miscMixin(Vue);

// install instance APIs
dataAPI(Vue);
domAPI(Vue);
eventsAPI(Vue);
lifecycleAPI(Vue);

var slot = {

  priority: SLOT,
  params: ['name'],

  bind: function bind() {
    // this was resolved during component transclusion
    var name = this.params.name || 'default';
    var content = this.vm._slotContents && this.vm._slotContents[name];
    if (!content || !content.hasChildNodes()) {
      this.fallback();
    } else {
      this.compile(content.cloneNode(true), this.vm._context, this.vm);
    }
  },

  compile: function compile(content, context, host) {
    if (content && context) {
      if (this.el.hasChildNodes() && content.childNodes.length === 1 && content.childNodes[0].nodeType === 1 && content.childNodes[0].hasAttribute('v-if')) {
        // if the inserted slot has v-if
        // inject fallback content as the v-else
        var elseBlock = document.createElement('template');
        elseBlock.setAttribute('v-else', '');
        elseBlock.innerHTML = this.el.innerHTML;
        // the else block should be compiled in child scope
        elseBlock._context = this.vm;
        content.appendChild(elseBlock);
      }
      var scope = host ? host._scope : this._scope;
      this.unlink = context.$compile(content, host, scope, this._frag);
    }
    if (content) {
      replace(this.el, content);
    } else {
      remove(this.el);
    }
  },

  fallback: function fallback() {
    this.compile(extractContent(this.el, true), this.vm);
  },

  unbind: function unbind() {
    if (this.unlink) {
      this.unlink();
    }
  }
};

var partial = {

  priority: PARTIAL,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function name(value) {
      vIf.remove.call(this);
      if (value) {
        this.insert(value);
      }
    }
  },

  bind: function bind() {
    this.anchor = createAnchor('v-partial');
    replace(this.el, this.anchor);
    this.insert(this.params.name);
  },

  insert: function insert(id) {
    var partial = resolveAsset(this.vm.$options, 'partials', id, true);
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial);
      vIf.insert.call(this);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

var elementDirectives = {
  slot: slot,
  partial: partial
};

var convertArray = vFor._postProcess;

/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

function limitBy(arr, n, offset) {
  offset = offset ? parseInt(offset, 10) : 0;
  n = toNumber(n);
  return typeof n === 'number' ? arr.slice(offset, offset + n) : arr;
}

/**
 * Filter filter for arrays
 *
 * @param {String} search
 * @param {String} [delimiter]
 * @param {String} ...dataKeys
 */

function filterBy(arr, search, delimiter) {
  arr = convertArray(arr);
  if (search == null) {
    return arr;
  }
  if (typeof search === 'function') {
    return arr.filter(search);
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase();
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2;
  // extract and flatten keys
  var keys = Array.prototype.concat.apply([], toArray(arguments, n));
  var res = [];
  var item, key, val, j;
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i];
    val = item && item.$value || item;
    j = keys.length;
    if (j) {
      while (j--) {
        key = keys[j];
        if (key === '$key' && contains(item.$key, search) || contains(getPath(val, key), search)) {
          res.push(item);
          break;
        }
      }
    } else if (contains(item, search)) {
      res.push(item);
    }
  }
  return res;
}

/**
 * Filter filter for arrays
 *
 * @param {String|Array<String>|Function} ...sortKeys
 * @param {Number} [order]
 */

function orderBy(arr) {
  var comparator = null;
  var sortKeys = undefined;
  arr = convertArray(arr);

  // determine order (last argument)
  var args = toArray(arguments, 1);
  var order = args[args.length - 1];
  if (typeof order === 'number') {
    order = order < 0 ? -1 : 1;
    args = args.length > 1 ? args.slice(0, -1) : args;
  } else {
    order = 1;
  }

  // determine sortKeys & comparator
  var firstArg = args[0];
  if (!firstArg) {
    return arr;
  } else if (typeof firstArg === 'function') {
    // custom comparator
    comparator = function (a, b) {
      return firstArg(a, b) * order;
    };
  } else {
    // string keys. flatten first
    sortKeys = Array.prototype.concat.apply([], args);
    comparator = function (a, b, i) {
      i = i || 0;
      return i >= sortKeys.length - 1 ? baseCompare(a, b, i) : baseCompare(a, b, i) || comparator(a, b, i + 1);
    };
  }

  function baseCompare(a, b, sortKeyIndex) {
    var sortKey = sortKeys[sortKeyIndex];
    if (sortKey) {
      if (sortKey !== '$key') {
        if (isObject(a) && '$value' in a) a = a.$value;
        if (isObject(b) && '$value' in b) b = b.$value;
      }
      a = isObject(a) ? getPath(a, sortKey) : a;
      b = isObject(b) ? getPath(b, sortKey) : b;
    }
    return a === b ? 0 : a > b ? order : -order;
  }

  // sort on a copy to avoid mutating original array
  return arr.slice().sort(comparator);
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains(val, search) {
  var i;
  if (isPlainObject(val)) {
    var keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true;
      }
    }
  } else if (isArray(val)) {
    i = val.length;
    while (i--) {
      if (contains(val[i], search)) {
        return true;
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1;
  }
}

var digitsRE = /(\d{3})(?=\d)/g;

// asset collections must be a plain object.
var filters = {

  orderBy: orderBy,
  filterBy: filterBy,
  limitBy: limitBy,

  /**
   * Stringify value.
   *
   * @param {Number} indent
   */

  json: {
    read: function read(value, indent) {
      return typeof value === 'string' ? value : JSON.stringify(value, null, arguments.length > 1 ? indent : 2);
    },
    write: function write(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  /**
   * 'abc' => 'Abc'
   */

  capitalize: function capitalize(value) {
    if (!value && value !== 0) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },

  /**
   * 'abc' => 'ABC'
   */

  uppercase: function uppercase(value) {
    return value || value === 0 ? value.toString().toUpperCase() : '';
  },

  /**
   * 'AbC' => 'abc'
   */

  lowercase: function lowercase(value) {
    return value || value === 0 ? value.toString().toLowerCase() : '';
  },

  /**
   * 12345 => $12,345.00
   *
   * @param {String} sign
   * @param {Number} decimals Decimal places
   */

  currency: function currency(value, _currency, decimals) {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    _currency = _currency != null ? _currency : '$';
    decimals = decimals != null ? decimals : 2;
    var stringified = Math.abs(value).toFixed(decimals);
    var _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
    var i = _int.length % 3;
    var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
    var _float = decimals ? stringified.slice(-1 - decimals) : '';
    var sign = value < 0 ? '-' : '';
    return sign + _currency + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
  },

  /**
   * 'item' => 'items'
   *
   * @params
   *  an array of strings corresponding to
   *  the single, double, triple ... forms of the word to
   *  be pluralized. When the number to be pluralized
   *  exceeds the length of the args, it will use the last
   *  entry in the array.
   *
   *  e.g. ['single', 'double', 'triple', 'multiple']
   */

  pluralize: function pluralize(value) {
    var args = toArray(arguments, 1);
    var length = args.length;
    if (length > 1) {
      var index = value % 10 - 1;
      return index in args ? args[index] : args[length - 1];
    } else {
      return args[0] + (value === 1 ? '' : 's');
    }
  },

  /**
   * Debounce a handler function.
   *
   * @param {Function} handler
   * @param {Number} delay = 300
   * @return {Function}
   */

  debounce: function debounce(handler, delay) {
    if (!handler) return;
    if (!delay) {
      delay = 300;
    }
    return _debounce(handler, delay);
  }
};

function installGlobalAPI (Vue) {
  /**
   * Vue and every constructor that extends Vue has an
   * associated options object, which can be accessed during
   * compilation steps as `this.constructor.options`.
   *
   * These can be seen as the default options of every
   * Vue instance.
   */

  Vue.options = {
    directives: directives,
    elementDirectives: elementDirectives,
    filters: filters,
    transitions: {},
    components: {},
    partials: {},
    replace: true
  };

  /**
   * Expose useful internals
   */

  Vue.util = util;
  Vue.config = config;
  Vue.set = set;
  Vue['delete'] = del;
  Vue.nextTick = nextTick;

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler;
  Vue.FragmentFactory = FragmentFactory;
  Vue.internalDirectives = internalDirectives;
  Vue.parsers = {
    path: path,
    text: text,
    template: template,
    directive: directive,
    expression: expression
  };

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
        name = null;
      }
    }
    var Sub = createClass(name || 'VueComponent');
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass(name) {
    /* eslint-disable no-new-func */
    return new Function('return function ' + classify(name) + ' (options) { this._init(options) }')();
    /* eslint-enable no-new-func */
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
  };

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && (commonTagRE.test(id) || reservedTagRE.test(id))) {
            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          if (!definition.name) {
            definition.name = id;
          }
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });

  // expose internal transition API
  extend(Vue.transition, transition);
}

installGlobalAPI(Vue);

Vue.version = '1.0.26';

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue);
    } else if (process.env.NODE_ENV !== 'production' && inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)) {
      console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
    }
  }
}, 0);

module.exports = Vue;
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":23}],52:[function(require,module,exports){
var inserted = exports.cache = {}

exports.insert = function (css) {
  if (inserted[css]) return
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return elem
}

},{}],53:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("@media screen and (max-width: 767px) {\n  #addEventCancel {\n    margin-left: 0px;\n  }\n}\n.homeGame {\n  color: #c90018 !important;\n}\n.awayGame {\n  color: #f2d500 !important;\n}\n.practice {\n  color: #329acf !important;\n}\n.other {\n  color: #76af00 !important;\n}\ndiv[AddEvent=\"fromTime\"],\ndiv[AddEvent=\"toTime\"] {\n  margin-top: 10px;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	name: 'AddEvent',

	props: [],

	data: function data() {

		return {
			title: '',
			type: 'practice',
			fromDate: '',
			fromTime: '',
			toDate: '',
			toTime: '',
			toPickerChange: false,
			repeats: false,
			days: [],
			untilPickerChange: false,
			until: '',
			details: '',
			endsError: false,
			untilError: false,
			errors: {
				title: '',
				start: '',
				end: '',
				until: '',
				days: ''
			},
			switchInit: false
		};
	},


	methods: {
		//submit post request
		createEvent: function createEvent() {
			var errors = this.errorCheck();

			if (errors) {
				//errors are displayed, let them fix
				return;
			}

			//if no error, send the post request

			var momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');
			var momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			var momentUntil = moment(this.until, 'MMM D, YYYY');

			var newEvent = {
				title: this.title,
				type: this.type,
				start: momentFrom.unix(),
				end: momentTo.unix(),
				details: this.details
			};

			if (this.repeats) {
				//if the event repeats, add this extra data with the request	
				newEvent.until = momentUntil.unix();
				newEvent.repeats = true;
				newEvent.days = this.days;
			}

			var self = this;
			var url = this.$parent.prefix + '/event';
			this.$http.post(url, newEvent).then(function (response) {
				if (!response.data.ok) {
					throw response.data.error;
				}

				self.$dispatch('newEvent', response.data.events, response.data.feed);

				$('#addEventModal').modal('hide');

				if (self.repeats) {
					//plural
					var msg = "Events saved";
				} else {
					var msg = "Event saved";
				}

				self.$root.banner('good', msg);

				self.reinitializeData();
				self.resetPickers();
			}).catch(function (response) {
				//with a validated request, an error is thrown but laravel let's us supply an error message
				self.$root.errorMsg(response.data.error);
			});
		},


		//make sure there are no errors before saving data
		errorCheck: function errorCheck() {
			var errors = 0;

			if (!this.title.length) {
				errors++;
				this.errors.title = 'Enter a title';
			} else {
				this.errors.title = '';
			}

			if (!this.toDate.length || !this.toTime.length) {
				errors++;
				this.errors.end = 'Choose an end date and time';
			} else {
				this.errors.end = '';
			}

			if (!this.fromDate.length || !this.fromTime.length) {
				errors++;
				this.errors.start = 'Choose an end date and time';
			} else {
				this.errors.start = '';
			}

			if (this.repeats) {
				if (!this.days.length) {
					errors++;
					this.errors.days = 'Which days does it repeat?';
				} else {
					this.errors.days = '';
				}
				if (!this.until.length) {
					errors++;
					this.errors.until = 'When does it repeat until?';
				} else {
					this.errors.until = '';
				}
			}

			if (errors) {
				//if any of these failed, solve those issues first
				return errors;
			}

			//check for end dates < start dates
			//until dates < end dates
			var momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');
			var momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			var momentUntil = moment(this.until, 'MMM D, YYYY');

			if (!momentTo.isAfter(momentFrom)) {
				errors++;
				this.errors.end = 'Ends before it starts';
			} else {
				this.errors.end = '';
			}

			if (!momentUntil.isAfter(momentTo) && this.repeats) {
				errors++;
				this.errors.until = 'Stops repeating before the event ends';
			} else {
				this.errors.until = '';
			}

			return errors;
		},


		//discard button was clicked
		discardEvent: function discardEvent() {
			$('#addEventModal').modal('hide');

			this.reinitializeData();

			this.resetPickers();
		},
		resetPickers: function resetPickers() {
			//set datetimepickers back to normal
			$('div[AddEvent="fromDate"]').data('DateTimePicker').date(this.momentFrom);
			$('div[AddEvent="toDate"]').data('DateTimePicker').date(this.momentTo);
			$('div[AddEvent="until"]').data('DateTimePicker').date(this.momentUntil);
			$('div[AddEvent="fromTime"]').data('DateTimePicker').date(this.momentFrom);
			$('div[AddEvent="toTime"]').data('DateTimePicker').date(this.momentTo);
		},


		//set newEvent object back to default values
		reinitializeData: function reinitializeData() {

			//initialize dates to 'tomorrow at 6:00 - 8:00 pm'
			//untilDate is used for repeating events, initialize to a week after event starts
			var fromDate = moment().add(1, 'day').hour(18).minute(0).second(0);
			var toDate = moment().add(1, 'day').hour(20).minute(0).second(0);
			var untilDate = moment().add(8, 'day').hour(20).minute(0).second(0);

			this.title = '';
			this.eventClass = '0';
			this.fromDate = fromDate.format('MMM D, YYYY');
			this.fromTime = fromDate.format('h:mm a');
			this.toDate = toDate.format('MMM D, YYYY');
			this.toTime = toDate.format('h:mm a');
			this.until = untilDate.format('MMM D, YYYY');
			this.toPickerChange = false;
			this.repeats = false;
			this.days = [];
			this.untilPickerChange = false;
			this.details = '';
			this.momentFrom = fromDate;
			this.momentTo = toDate;
			this.momentUntil = untilDate;

			for (var key in this.errors) {
				this.errors[key] = '';
			}

			if (this.switchInit) $('input[bootstrap-switch="AddEvent"]').bootstrapSwitch('state', false);
		}
	},

	ready: function ready() {

		$(function () {

			this.reinitializeData();

			$('.selectpicker[AddEvent]').selectpicker();

			var fromDate = this.momentFrom;
			var toDate = this.momentTo;
			var untilDate = this.momentUntil;

			//datepickers for adding events, sel
			var fromPicker = $('div[AddEvent="fromDate"]');
			var toPicker = $('div[AddEvent="toDate"]');
			var untilPicker = $('div[AddEvent="until"]');
			var fromPickerTime = $('div[AddEvent="fromTime"]');
			var toPickerTime = $('div[AddEvent="toTime"]');

			fromPicker.datetimepicker({
				allowInputToggle: true,
				focusOnShow: true,
				format: 'MMM D, YYYY',
				defaultDate: fromDate
			}).on('dp.change', function (e) {
				if (!e.date) {
					this.fromDate = '';
					return;
				}

				//when 'from' changes, save this new date into the state
				//set 'to' and 'until' minimum dates so they don't end before it starts
				this.fromDate = e.date.format('MMM D, YYYY');
				toPicker.data('DateTimePicker').minDate(e.date);
				untilPicker.data('DateTimePicker').minDate(e.date.add(1, 'week'));

				if (!this.toPickerChange) {
					//if the toPicker (date) hasn't been manually set yet, default it to this new fromDate 
					toPicker.data('DateTimePicker').date(e.date);
				}
			}.bind(this));

			toPicker.datetimepicker({
				allowInputToggle: true,
				focusOnShow: true,
				format: 'MMM D, YYYY',
				defaultDate: toDate
			}).on('dp.change', function (e) {
				if (!e.date) {
					this.toDate = '';
					return;
				}

				this.toDate = e.date.format('MMM D, YYYY');
				this.toPickerChange = true;
				untilPicker.data('DateTimePicker').minDate(e.date.add(1, 'week'));
			}.bind(this));

			untilPicker.datetimepicker({
				stepping: 5,
				allowInputToggle: true,
				focusOnShow: true,
				format: 'MMM D, YYYY',
				defaultDate: untilDate
			}).on('dp.change', function (e) {
				if (!e.date) {
					this.until = '';
					return;
				}

				this.until = e.date.format('MMM D, YYYY');
			}.bind(this));

			fromPickerTime.datetimepicker({
				stepping: 5,
				allowInputToggle: true,
				focusOnShow: true,
				format: 'h:mm a',
				defaultDate: fromDate
			}).on('dp.change', function (e) {
				if (!e.date) {
					this.fromTime = '';
					return;
				}
				this.fromTime = e.date.format('h:mm a');
			}.bind(this));

			toPickerTime.datetimepicker({
				stepping: 5,
				allowInputToggle: true,
				focusOnShow: true,
				format: 'h:mm a',
				defaultDate: toDate
			}).on('dp.change', function (e) {
				if (!e.date) {
					this.toTime = '';
					return;
				}
				this.toTime = e.date.format('h:mm a');
			}.bind(this));

			this.toPickerChange = false;
			this.untilPickerChange = false;

			var self = this;
			var options = {
				state: false,
				onText: 'YES',
				offText: 'NO',
				onSwitchChange: function (e, state) {
					this.repeats = state;
				}.bind(this)
			};

			$('input[bootstrap-switch="AddEvent"]').bootstrapSwitch(options);
			this.switchInit = true;
		}.bind(this));
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t\n\t<div id=\"addEventDiv\" class=\"col-xs-12\">\n    <form @submit.prevent=\"createEvent()\">\n\n\t    <div class=\"row\">\n        <div class=\"form-group\">\n          <div class=\"col-xs-12 col-sm-6\">\n            <label>Title</label>\n            <input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.title }\" placeholder=\"vs. Georgia Tech\" maxlength=\"50\" v-model=\"title\" autocomplete=\"off\">\n            <span v-show=\"errors.title\" class=\"form-error\">{{ errors.title }}</span>\n          </div>\n          <div class=\"col-xs-12 col-sm-6\">\n            <label>Type</label>\n            <select v-model=\"type\" data-style=\"btn-select btn-lg\" class=\"selectpicker form-control show-tick\" addevent=\"\">\n              <option value=\"practice\" class=\"practice\">Practice</option>    \n              <option value=\"home_game\" class=\"homeGame\">Home Game</option>\n              <option value=\"away_game\" class=\"awayGame\">Away Game</option>\n              <option value=\"other\" class=\"other\">Other</option>\n            </select>\n          </div>\n        </div>\n\t    </div>\n\t    <br>\n\t    <div class=\"row\">\n        <div class=\"col-xs-12 col-sm-6\">\n          <div class=\"form-group\">\n\t\t\t\t\t\t<!-- from - date -->\n            <label>Starts at</label>\n            <div class=\"input-group date\" addevent=\"fromDate\">\n          \t\t<input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.start }\">\n              <span class=\"input-group-addon\">\n              \t<span class=\"glyphicon glyphicon-calendar\"></span>\n              </span>\n            </div>\n\t\t\t\t\t\t<!-- from - time -->\n            <div class=\"input-group date\" addevent=\"fromTime\">\n          \t\t<input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.start }\">\n              <span class=\"input-group-addon\">\n              \t<span class=\"glyphicon glyphicon-time\"></span>\n              </span>\n            </div>\n            <span v-show=\"errors.start\" class=\"form-error\">{{ errors.start }}</span>\n          </div>\n        </div>\n        <div class=\"col-xs-12 col-sm-6\">\n          <div class=\"form-group\">\n            <label>Ends at</label>\n            <div class=\"input-group date\" addevent=\"toDate\">\n              <input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.end }\">\n              <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-calendar\"></span>\n              </span>\n            </div>\n            <!-- to - time -->\n            <div class=\"input-group date\" addevent=\"toTime\">\n              <input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.end }\">\n              <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-time\"></span>\n              </span>\n            </div>\n            <span v-show=\"errors.end\" class=\"form-error\">{{ errors.end }}</span>\n          </div>\n        </div>\n\t    </div>\n\t    <br>\n\t    <div class=\"row\">\n        <div class=\"col-xs-12\">\n          <div class=\"switch-container\">\n\t\t\t\t\t\t<input type=\"checkbox\" bootstrap-switch=\"AddEvent\">\n\t\t\t\t\t\t<span class=\"switch-label\">This event repeats...</span>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t    </div>\n\t    <div id=\"repeatDaysDiv\" class=\"row\" v-show=\"repeats\" transition=\"slide-sm\">\n        <div class=\"form-group\">\n          <div class=\"col-xs-12 col-sm-6\" :class=\"{'form-error' : errors.days }\">\n            <label for=\"days\">Every</label>\n            <select name=\"days[]\" class=\"selectpicker form-control show-tick\" data-style=\"btn-select btn-lg\" data-selected-text-format=\"count>2\" title=\"\" multiple=\"\" v-model=\"days\">\n                <option>Sunday</option>\n                <option>Monday</option>\n                <option>Tuesday</option>\n                <option>Wednesday</option>\n                <option>Thursday</option>\n                <option>Friday</option>\n                <option>Saturday</option>\n            </select>\n            <span v-show=\"errors.days\" class=\"form-error\">{{ errors.days }}</span>\n          </div>\n          <div class=\"col-xs-12 col-sm-6\">\n            <label for=\"until\">Until</label>\n            <div class=\"input-group date\" addevent=\"until\">\n              <input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.until }\">\n              <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-calendar\"></span>\n              </span>\n            </div>\n            <span v-show=\"errors.until\" class=\"form-error\">{{ errors.until }}</span>\n          </div>\n          <br>\n        </div>\n\t    </div>\n\t    <br>\n\t    <br>\n\t    <div id=\"eventDetailsDiv\" class=\"row\">\n        <div class=\"col-xs-12\">\n          <label>Extra details about this event</label>\n          <textarea v-autosize=\"details\" name=\"details\" class=\"form-control\" maxlength=\"5000\" rows=\"1\" placeholder=\"Remember your water bottle!\" v-model=\"details\"></textarea>\n        </div>\n\t    </div>\n    \t<hr>\n    \t<br>\n\t    <div class=\"row\">\n\t      <div class=\"col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-2\">\n\t      \t<input type=\"submit\" class=\"btn btn-primary btn-block btn-md btn-first\" value=\"SAVE\">\n\t      </div>\n\t      <div class=\"col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0\">\n          <a id=\"addEventCancel\" @click=\"discardEvent()\" class=\"btn btn-cancel btn-block btn-md outline\">CANCEL</a>\n\t      </div>\n\t    </div>\n    </form>\n\t</div>\n\t\t\n\n\t\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["@media screen and (max-width: 767px) {\n  #addEventCancel {\n    margin-left: 0px;\n  }\n}\n.homeGame {\n  color: #c90018 !important;\n}\n.awayGame {\n  color: #f2d500 !important;\n}\n.practice {\n  color: #329acf !important;\n}\n.other {\n  color: #76af00 !important;\n}\ndiv[AddEvent=\"fromTime\"],\ndiv[AddEvent=\"toTime\"] {\n  margin-top: 10px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-1024e6ba", module.exports)
  } else {
    hotAPI.update("_v-1024e6ba", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],54:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".Alert__container {\n  position: fixed;\n  width: 100%;\n  top: 90px;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  z-index: 5000;\n}\n@media screen and (max-width: 767px) {\n  .Alert__container {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n  }\n}\n.alert {\n  opacity: 0.9;\n  border: none;\n  box-shadow: none;\n  text-shadow: none;\n  margin-right: 30px;\n}\n@media screen and (max-width: 767px) {\n  .alert {\n    margin-right: 0;\n  }\n}\n.alert.alert-success {\n  background-color: #ade5a1;\n  color: #255c19;\n  background-image: none;\n}\n.alert.alert-info {\n  background-color: #c2e1f1;\n  color: #184e6a;\n  background-image: none;\n}\n.alert.alert-danger {\n  background-color: #edaeb4;\n  color: #97222d;\n  background-image: none;\n}\n.alert .alert-icon {\n  margin-right: 15px;\n  font-size: 22px;\n}\n.alert .close {\n  color: #000;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	name: 'Alert',

	props: ['show'],

	data: function data() {
		return {
			alerts: [],
			alertCounter: 0,
			type: 'info',
			msg: 'You better check yoself'
		};
	},


	events: {
		//event from App to show an alert
		displayAlert: function displayAlert(type, msg) {

			//add an alert
			this.alertCounter++;
			this.msg = msg;
			this.type = type;

			//choose a timeout length
			if (this.type !== 'good') var timeout = 8000;else var timeout = 3000;

			var self = this;
			//set an async timer
			setTimeout(function () {
				//when the timer is up, remove this alert
				self.alertCounter--;
				if (!self.alertCounter)
					//if there's no alerts remaining, hide
					self.show = false;
			}, timeout);
		}
	},

	computed: {
		//returns an array of classes for the alert
		//info and error last longer and have a close option
		alertClasses: function alertClasses() {
			return {
				'alert': true,
				'alert-dismissable': this.type !== 'good',
				'alert-success': this.type === 'good',
				'alert-danger': this.type === 'bad',
				'alert-info': this.type === 'info'
			};
		}
	}

};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\n<div class=\"Alert__container\" v-show=\"show\">\n\t<div :class=\"alertClasses\">\n\n\t\t<i class=\"material-icons alert-icon pull-left\" v-show=\"type === 'good'\">done</i>\n\t\t<i class=\"material-icons alert-icon pull-left\" v-show=\"type === 'bad'\">error</i>\n\t\t<i class=\"material-icons alert-icon pull-left\" v-show=\"type === 'info'\">info_outline</i>\n\n\t\t<!-- show X for 'info' and 'bad' (they last longer and are dismissable) -->\n\t\t<span @click=\"show = false\" class=\"close\" v-show=\"type !== 'good'\">×</span>\n\t\t<span>\n\t\t\t{{ msg }}\n\t\t</span>\n\n\t</div>\n</div>\n\t\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".Alert__container {\n  position: fixed;\n  width: 100%;\n  top: 90px;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  z-index: 5000;\n}\n@media screen and (max-width: 767px) {\n  .Alert__container {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n  }\n}\n.alert {\n  opacity: 0.9;\n  border: none;\n  box-shadow: none;\n  text-shadow: none;\n  margin-right: 30px;\n}\n@media screen and (max-width: 767px) {\n  .alert {\n    margin-right: 0;\n  }\n}\n.alert.alert-success {\n  background-color: #ade5a1;\n  color: #255c19;\n  background-image: none;\n}\n.alert.alert-info {\n  background-color: #c2e1f1;\n  color: #184e6a;\n  background-image: none;\n}\n.alert.alert-danger {\n  background-color: #edaeb4;\n  color: #97222d;\n  background-image: none;\n}\n.alert .alert-icon {\n  margin-right: 15px;\n  font-size: 22px;\n}\n.alert .close {\n  color: #000;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-3923ff22", module.exports)
  } else {
    hotAPI.update("_v-3923ff22", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],55:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".router {\n  margin-top: 50px;\n  min-height: 100%;\n  position: relative;\n}\ndiv.navbar-collapse[aria-expanded='true'],\ndiv.navbar-collapse.collapsing {\n  background: #c90018;\n}\nnav.navbar {\n  background: #c90018;\n}\n#hamburger {\n  background: #c90018;\n}\n#hamburger:focus {\n  background: #b00015;\n}\n#hamburger span {\n  background: #fff;\n}\nnav.navbar.navbar-default {\n  border: 0;\n  height: 53px;\n}\nul.nav.navbar-nav.navbar-right li {\n  background: #c90018;\n}\nul.nav.navbar-nav.navbar-right li a {\n  color: #fff;\n  font-size: 15px;\n}\nul.nav.navbar-nav.navbar-right li a:hover {\n  text-shadow: 0 0 4px #fff;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open {\n  background: #b00015;\n  box-shadow: none;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open a:hover {\n  text-shadow: none;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open a {\n  background: #b00015;\n  padding-bottom: 16px;\n  color: #fff;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open a:hover {\n  color: #fff;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu {\n  top: 52px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li :first-of-type {\n  padding-top: 5px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li :last-of-type {\n  padding-bottom: 5px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li a {\n  text-decoration: none;\n  color: #000;\n  background: #fff;\n  padding: 5px 15px 5px 15px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li :hover {\n  text-decoration: none;\n  cursor: pointer;\n  color: #000;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li span.badge {\n  background-color: #ccc;\n  color: #fff;\n  font-size: 12px;\n  margin-bottom: 2px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu :hover {\n  background: #eee;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu .dropdown-header {\n  background: #fff;\n  padding-left: 15px;\n  color: #808080;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu .dropdown-header :hover {\n  background: #fff;\n  color: #808080;\n  cursor: default;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu .dropdown-none {\n  font-size: 15px;\n  background: #fff;\n  color: #808080;\n}\nul.nav.navbar-nav.navbar-right .dropdown .divider {\n  margin: 5px 0 5px 0;\n  background: #d9d9d9;\n}\n.badge-danger {\n  background-color: #d9534f;\n  font-size: 12px;\n  margin-bottom: 2px;\n}\n#searchBar {\n  height: 15px;\n  width: 280px;\n  color: #fff;\n  margin-top: 10px;\n  background-color: #b00015;\n  font-size: 15px;\n}\ninput#searchBar::-webkit-input-placeholder {\n  color: #fff !important;\n}\ninput#searchBar:-moz-placeholder /* Firefox 18- */ {\n  color: #fff !important;\n}\ninput#searchBar::-moz-placeholder  /* Firefox 19+ */ {\n  color: #fff !important;\n}\ninput#searchBar:-ms-input-placeholder {\n  color: #fff !important;\n}\ninput[placeholder]::-webkit-input-placeholder {\n  color: #c4c4c4 !important;\n}\ninput[placeholder]:-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ninput[placeholder]::-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ninput[placeholder]:-ms-input-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]::-webkit-input-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]:-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]::-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]:-ms-input-placeholder {\n  color: #c4c4c4 !important;\n}\n#searchIcon {\n  color: #fff;\n  position: absolute;\n  left: -26px;\n  top: 15px;\n  font-size: 1.3em;\n}\n#navLogo {\n  position: absolute;\n  height: 53px;\n  width: 180px;\n  left: 50%;\n  margin-left: -92px;\n  display: block;\n  background-color: transparent;\n}\n@media only screen and (max-width: 767px) and (min-width: 10px) {\n  .divider {\n    background: #d9d9d9 !important;\n  }\n  #searchIcon {\n    top: 32px;\n    left: -38px;\n  }\n  #searchBar {\n    margin-top: 25px;\n    border: #b00015;\n  }\n  #navSearchDiv {\n    left: 5px !important;\n  }\n}\n@media only screen and (max-width: 991px) and (min-width: 768px) {\n  #searchBar {\n    width: 220px;\n  }\n}\n#navSearchDiv {\n  position: relative;\n  display: inline-block;\n  left: 25px;\n}\n#profileAboutIcon {\n  font-size: 24px;\n  position: absolute;\n  left: 40px;\n  bottom: 32px;\n}\n#profileMetricsIcon {\n  position: absolute;\n  left: 43px;\n  bottom: 32px;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Alert = require('./Alert.vue');

var _Alert2 = _interopRequireDefault(_Alert);

var _Requests = require('../mixins/Requests.js');

var _Requests2 = _interopRequireDefault(_Requests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'App',

	props: [],

	mixins: [_Requests2.default],

	components: {
		'rc-alert': _Alert2.default
	},

	data: function data() {

		return {
			prefix: '/api/v1/',
			user: {},
			teams: [],
			alert: false,
			alertCounter: 0,
			alertMessage: "You better check yoself",
			alertType: "info"
		};
	},
	created: function created() {
		// get logged-in user data
		var url = this.prefix + 'user/auth';

		var self = this;
		this.$http.get(url).then(function (response) {
			if (!response.data.ok) {
				throw response.data.error;
			}

			self.$emit('App_data', response);
		}).catch(function (error) {
			self.errorMsg(error);
		});
	},


	events: {
		App_data: function App_data(response) {
			this.user = response.data.user;
			this.teams = response.data.teams;
		},


		// event from Team.vue telling App to clear notifications for that team
		clearNotifications: function clearNotifications(id) {
			var updated = false;
			var self = this;

			this.teams = this.teams.filter(function (team) {
				if (team.id === id && team.notifications > 0) {
					updated = true;
					team.notifications = 0;
				}
				return team;
			});

			if (updated) {
				// notifications were cleared for this team, send ajax request to save to server
				var url = this.prefix + 'user/auth/team/' + id;
				this.$http.post(url);
			}
		},


		// if user became a member/fan of a team, add that team to their nav dropdown
		becameAFanOfTeam: function becameAFanOfTeam(team) {

			var newTeam = {
				id: team.id,
				teamname: team.teamname,
				name: team.name,
				sport: team.sport,
				notifications: 0,
				role: 4
			};

			this.teams.push(newTeam);
		},


		// the opposite of above
		removedAsFanOfTeam: function removedAsFanOfTeam(teamname) {
			this.teams = this.teams.filter(function (team) {
				return team.teamname !== teamname;
			});
		}
	},

	computed: {
		// which teams they are a member of
		memberOf: function memberOf() {
			return this.teams.filter(function (team) {
				return team.isMember;
			});
		},


		// which teams they are a fan of
		fanOf: function fanOf() {
			return this.teams.filter(function (team) {
				return team.isFan;
			});
		},


		// which teams an admin has invited them to join
		invitedTo: function invitedTo() {
			return this.teams.filter(function (team) {
				return team.hasBeenInvited;
			});
		}
	},

	methods: {

		/**
   * Show a sweetalert popup message
   *
   * @param {string} type  Possible: 'good', 'bad', 'info'
   * @param {string} title  
   * @param {string} msg  
   */
		popup: function popup(type, title, msg) {
			switch (type) {
				case 'good':
					swal(title, msg, "success");
					break;
				case 'bad':
					swal(title, msg, "error");
					break;
				case 'info':
					swal(title, msg, "info");
					break;
			}
		},


		/**
   * Show a banner message using Alert component
   *
   * @param {string} type  Possible: 'good', 'bad', 'info'
   * @param {string} msg
   */
		banner: function banner(type, msg) {
			// always hide any existing alerts
			this.alert = false;

			// give some timeout so there's a noticeable gap between old and new alerts
			var self = this;
			setTimeout(function () {
				self.alert = true;
				self.$broadcast('displayAlert', type, msg);
			}, 400);
		},


		/**
   * Display a given error message or a default one
   * 
   * @param {string | null} msg
   */
		errorMsg: function errorMsg() {
			var msg = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

			if (typeof msg === 'string') this.banner('bad', msg);else this.banner('bad', 'There was a problem, refresh the page and try again');
		},


		/**
   * Show a bootstrap modal with a given id
   *
   * @param {string} id
   */
		showModal: function showModal(id) {
			$('.for-blurring').removeClass('modal-unblur').addClass('modal-blur');
			$('nav.navbar').removeClass('modal-unblur').addClass('modal-blur');
			$('#' + id).modal('show');
		}
	}, // end methods

	ready: function ready() {

		/*
  // job offer
  console.log("%cI like your style! email me and I might hire you...  dan@rookiecard.com", "color: black; font-size: large;")
  */
		$(function () {

			// remove blurring
			// if user had a modal open then clicked 'back' on browser, blur persists
			$('div.modal').modal('hide');
			$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
			$('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');

			// $("nav.navbar-fixed-top").autoHidingNavbar();


			$('div.modal').on('hide.bs.modal', function () {
				$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
				$('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');
			});
		});
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\n\t<div>\n\t\n    <nav class=\"navbar navbar-default navbar-fixed-top no-highlight\" role=\"navigation\">\n      <div class=\"container\">\n\n         <!-- logo and hamburger  -->\n        <div class=\"navbar-header\">\n            <button id=\"hamburger\" type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\"#navbar-left\">\n                <span class=\"sr-only\">Toggle navigation</span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n            </button>\n            <a v-link=\"{name: 'home'}\"><img id=\"navLogo\" src=\"/images/logo.png\" class=\"navbar-brand navbar-brand-centered\"></a>\n        </div>\n\n            \n        <div class=\"collapse navbar-collapse text-center\" id=\"navbar-left\">\n\n          <!-- search bar -->\n          <ul class=\"nav navbar-nav\">\n            <div id=\"navSearchDiv\">\n              <i id=\"searchIcon\" class=\"glyphicon glyphicon-search\"></i>\n\n              <form method=\"GET\" action=\"/search\" accept-charset=\"UTF-8\">\n          \t\t\t<input id=\"searchBar\" class=\"form-control navbar-form search-form\" placeholder=\"Search players and teams...\" tabindex=\"1\" required=\"\" role=\"search\" name=\"q\" type=\"search\">\n          \t\t</form>\n            </div>\n          </ul>\n\n          <!-- nav links -->\n          <ul class=\"nav navbar-nav navbar-right\">\n            <li><a v-link=\"{name: 'user', params: {name: user.username}}\" class=\"nav-link\">Profile</a></li>\n            <li id=\"teamDropdown\" class=\"dropdown\">\n              <a class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                <span v-cloak=\"\" class=\"badge badge-danger\">{{ totalCount }}</span>&nbsp;Teams <span id=\"teamCaret\" class=\"caret\"></span></a>\n              <ul class=\"dropdown-menu dropdown-menu-left\" role=\"menu\">\n\n            \t\t<li v-if=\"memberOf.length\" class=\"dropdown-header\"><small>MEMBER OF</small></li>\n                <li v-for=\"team in memberOf\">\n                \t<a v-link=\"{name: 'team', params: {name: team.teamname}}\" class=\"nav-link\">\n                \t\t<span v-show=\"team.notifications\" class=\"badge badge-danger\">{{ team.notifications }}</span>\n                \t\t{{ team.name }}\n                \t</a>\n                </li>\n                <li v-if=\"memberOf.length\" id=\"divider\" class=\"divider\"></li>\n\n                <li v-if=\"fanOf.length\" class=\"dropdown-header\"><small>FAN OF</small></li>\n                <li v-for=\"team in fanOf\">\n                \t<a v-link=\"{name: 'team', params: {name: team.teamname}}\" class=\"nav-link\">\n                \t\t<span v-show=\"team.notifications\" class=\"badge badge-danger\">{{ team.notifications }}</span>\n                \t\t{{ team.name }}\n                \t</a>\n                </li><li v-if=\"fanOf.length\" id=\"divider\" class=\"divider\"></li>\n\n                <li v-if=\"invitedTo.length\" class=\"dropdown-header\"><small>INVITED TO</small></li>\n                <li v-for=\"team in invitedTo\">\n                \t<a v-link=\"{name: 'team', params: {name: team.teamname}}\" class=\"nav-link\">\n                \t\t<span v-show=\"team.notifications\" class=\"badge badge-danger\">{{ team.notifications }}</span>\n                \t\t{{ team.name }}\n                \t</a>\n                </li><li v-if=\"invitedTo.length\" id=\"divider\" class=\"divider\"></li>\n\n                <li><a v-link=\"{name: 'team', params: {name: 'create'}}\" class=\"nav-link\">Create a Team</a></li>\n\n              </ul>\n            </li>\n            <li id=\"optionsDropdown\" class=\"dropdown\">\n              <a href=\"#\" id=\"navOptions\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">Options <span id=\"optionsCaret\" class=\"caret\"></span></a>\n              <ul class=\"dropdown-menu\" role=\"menu\">\n                <li><a class=\"nav-link\">Settings</a></li>\n                <li><a class=\"nav-link\">Help</a></li>\n                <li><a class=\"nav-link\">Submit Feedback</a></li>\n                <li id=\"divider\" class=\"divider\"></li>\n                <li><a href=\"/logout\" class=\"nav-link\">Log out</a></li>\n              </ul>\n            </li>\n          </ul>\n        </div>\n      </div>\n    </nav>\n\n    <nav style=\"display: none\" class=\"navbar navbar-default navbar-fixed-top\" role=\"navigation\">\n      <div class=\"container\">\n        <div class=\"navbar-header\">\n          <a href=\"/\"><img id=\"navLogo\" src=\"/images/logo.png\" class=\"navbar-brand navbar-brand-centered\"></a>\n        </div>\n      </div>\n    </nav>\n\n\t\t<rc-alert :show=\"alert\" transition=\"fade-fast\"></rc-alert>\n\t\n\t\t<router-view id=\"router\" transition=\"fade-md\" transition-mode=\"out-in\" class=\"router\"></router-view>\n\t\n\t</div>\n\t\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".router {\n  margin-top: 50px;\n  min-height: 100%;\n  position: relative;\n}\ndiv.navbar-collapse[aria-expanded='true'],\ndiv.navbar-collapse.collapsing {\n  background: #c90018;\n}\nnav.navbar {\n  background: #c90018;\n}\n#hamburger {\n  background: #c90018;\n}\n#hamburger:focus {\n  background: #b00015;\n}\n#hamburger span {\n  background: #fff;\n}\nnav.navbar.navbar-default {\n  border: 0;\n  height: 53px;\n}\nul.nav.navbar-nav.navbar-right li {\n  background: #c90018;\n}\nul.nav.navbar-nav.navbar-right li a {\n  color: #fff;\n  font-size: 15px;\n}\nul.nav.navbar-nav.navbar-right li a:hover {\n  text-shadow: 0 0 4px #fff;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open {\n  background: #b00015;\n  box-shadow: none;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open a:hover {\n  text-shadow: none;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open a {\n  background: #b00015;\n  padding-bottom: 16px;\n  color: #fff;\n}\nul.nav.navbar-nav.navbar-right .dropdown.open a:hover {\n  color: #fff;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu {\n  top: 52px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li :first-of-type {\n  padding-top: 5px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li :last-of-type {\n  padding-bottom: 5px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li a {\n  text-decoration: none;\n  color: #000;\n  background: #fff;\n  padding: 5px 15px 5px 15px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li :hover {\n  text-decoration: none;\n  cursor: pointer;\n  color: #000;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu li span.badge {\n  background-color: #ccc;\n  color: #fff;\n  font-size: 12px;\n  margin-bottom: 2px;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu :hover {\n  background: #eee;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu .dropdown-header {\n  background: #fff;\n  padding-left: 15px;\n  color: #808080;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu .dropdown-header :hover {\n  background: #fff;\n  color: #808080;\n  cursor: default;\n}\nul.nav.navbar-nav.navbar-right .dropdown .dropdown-menu .dropdown-none {\n  font-size: 15px;\n  background: #fff;\n  color: #808080;\n}\nul.nav.navbar-nav.navbar-right .dropdown .divider {\n  margin: 5px 0 5px 0;\n  background: #d9d9d9;\n}\n.badge-danger {\n  background-color: #d9534f;\n  font-size: 12px;\n  margin-bottom: 2px;\n}\n#searchBar {\n  height: 15px;\n  width: 280px;\n  color: #fff;\n  margin-top: 10px;\n  background-color: #b00015;\n  font-size: 15px;\n}\ninput#searchBar::-webkit-input-placeholder {\n  color: #fff !important;\n}\ninput#searchBar:-moz-placeholder /* Firefox 18- */ {\n  color: #fff !important;\n}\ninput#searchBar::-moz-placeholder  /* Firefox 19+ */ {\n  color: #fff !important;\n}\ninput#searchBar:-ms-input-placeholder {\n  color: #fff !important;\n}\ninput[placeholder]::-webkit-input-placeholder {\n  color: #c4c4c4 !important;\n}\ninput[placeholder]:-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ninput[placeholder]::-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ninput[placeholder]:-ms-input-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]::-webkit-input-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]:-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]::-moz-placeholder {\n  color: #c4c4c4 !important;\n}\ntextarea[placeholder]:-ms-input-placeholder {\n  color: #c4c4c4 !important;\n}\n#searchIcon {\n  color: #fff;\n  position: absolute;\n  left: -26px;\n  top: 15px;\n  font-size: 1.3em;\n}\n#navLogo {\n  position: absolute;\n  height: 53px;\n  width: 180px;\n  left: 50%;\n  margin-left: -92px;\n  display: block;\n  background-color: transparent;\n}\n@media only screen and (max-width: 767px) and (min-width: 10px) {\n  .divider {\n    background: #d9d9d9 !important;\n  }\n  #searchIcon {\n    top: 32px;\n    left: -38px;\n  }\n  #searchBar {\n    margin-top: 25px;\n    border: #b00015;\n  }\n  #navSearchDiv {\n    left: 5px !important;\n  }\n}\n@media only screen and (max-width: 991px) and (min-width: 768px) {\n  #searchBar {\n    width: 220px;\n  }\n}\n#navSearchDiv {\n  position: relative;\n  display: inline-block;\n  left: 25px;\n}\n#profileAboutIcon {\n  font-size: 24px;\n  position: absolute;\n  left: 40px;\n  bottom: 32px;\n}\n#profileMetricsIcon {\n  position: absolute;\n  left: 43px;\n  bottom: 32px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-c10b0e32", module.exports)
  } else {
    hotAPI.update("_v-c10b0e32", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"../mixins/Requests.js":72,"./Alert.vue":54,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],56:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".Stats__title {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  margin-bottom: 4em;\n}\n.Stats__title div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n              -ms-grid-row-align: center;\n          align-items: center;\n}\n@media screen and (max-width: 767px) {\n  .Stats__title h1 {\n    font-size: 25px;\n  }\n}\n.Stats__title .versus {\n  color: rc_light_gray;\n}\n.Stats__title .win {\n  color: #f3b700;\n}\n.Stats__title .loss {\n  color: rgba(38,51,255,0.72);\n}\n.Stats__header {\n  margin-bottom: 15px;\n}\n@media screen and (max-width: 767px) {\n  .Stats__header {\n    font-size: 20px;\n  }\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _StatsScrollSpy = require('../mixins/StatsScrollSpy.js');

var _StatsScrollSpy2 = _interopRequireDefault(_StatsScrollSpy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'BasketballStats',

	props: ['type', 'rawStats', 'pagination', 'event', 'players', 'teamCols', 'playerCols'],

	mixins: [_StatsScrollSpy2.default],

	data: function data() {
		if (!this.pagination) this.pagination = false;

		// if single-event stats are being viewed, remove unnecessary columns
		if (this.type === 'event') {
			this.formatForEvent();
		}

		return {
			pagActive: 0,
			pagCount: 1,
			rowsPerPage: 10,
			playerSeasonStats: [],
			playerRecentStats: [],
			teamRecentStats: [],
			teamSeasonStats: [],
			meta: {},
			noStats: false,
			teamSortKey: 'date',
			playerSortKey: 'pts',
			teamSortOrders: {},
			playerSortOrders: {}
		};
	},


	computed: {
		ifPagination: function ifPagination() {
			return this.pagCount > 1 && this.pagination;
		},


		// gets rid of the stat categories that aren't useful for team season stats
		teamSeasonCols: function teamSeasonCols() {
			var index;
			var teamCols = [];
			// make a non-reactive copy of cols
			this.teamCols.forEach(function (val) {
				teamCols.push(val);
			});

			index = teamCols.indexOf('date');
			if (index !== -1) teamCols.splice(index, 1);

			index = teamCols.indexOf('win');
			if (index !== -1) teamCols.splice(index, 1);

			index = teamCols.indexOf('opp');
			if (index !== -1) teamCols.splice(index, 1);

			return teamCols;
		},


		// use all team stats for recent stats
		teamRecentCols: function teamRecentCols() {
			return this.teamCols;
		},


		// gets rid of the stat categories that aren't useful for player season stats
		playerSeasonCols: function playerSeasonCols() {
			var index;
			var playerCols = [];
			// make a non-reactive copy of cols
			this.playerCols.forEach(function (val) {
				playerCols.push(val);
			});

			var ditch = ['date', 'win', 'opp'];
			ditch.forEach(function (stat) {
				var index = playerCols.indexOf(stat);
				if (index !== -1) {
					playerCols.splice(index, 1);
				}
			});

			return playerCols;
		},


		// gets rid of the stat categories that aren't useful for recent player stats
		playerRecentCols: function playerRecentCols() {
			var index;
			var playerCols = [];
			// make a non-reactive copy of cols
			this.playerCols.forEach(function (val) {
				playerCols.push(val);
			});

			var ditch = ['name', 'gs', 'gp', 'efg_', 'astto', 'ts_', 'per', 'eff'];
			ditch.forEach(function (stat) {
				var index = playerCols.indexOf(stat);
				if (index !== -1) {
					playerCols.splice(index, 1);
				}
			});

			return playerCols;
		}
	},

	events: {
		compileStats: function compileStats() {
			this.compile();
		}
	},

	watch: {
		type: function type() {
			this.initScrollSpy();
		}
	},

	methods: {
		// initializes variables when stats request arrives
		compile: function compile() {
			var pagCount = 1;
			var rawTeamStats = [];
			var rawPlayerStats = [];

			if (this.rawStats.length) {

				// separate the data into player and team stats arrays
				for (var x = 0; x < this.rawStats.length; x++) {

					// team stats
					if (this.rawStats[x].type === 'team') {
						rawTeamStats.push(this.rawStats[x]);
					}

					// player stats
					if (this.rawStats[x].type === 'player') {
						rawPlayerStats.push(this.rawStats[x]);
					}
				}

				// format stats for table
				this.makeTeamRecentStats(rawTeamStats);
				this.makePlayerSeasonStats(rawPlayerStats);
				this.makeTeamSeasonStats(rawTeamStats);

				// initialize the sorting order on columns to be descending
				var teamSortOrders = {};
				this.teamCols.forEach(function (key) {
					teamSortOrders[key] = -1;
				});
				var playerSortOrders = {};
				this.playerCols.forEach(function (key) {
					playerSortOrders[key] = -1;
				});
				playerSortOrders['lastname'] = -1;

				// number of pages
				pagCount = Math.ceil(this.teamRecentStats.length / this.rowsPerPage);

				this.pagCount = pagCount;
				this.teamSortOrders = teamSortOrders;
				this.playerSortOrders = playerSortOrders;
			} else {
				// error occurred getting data, create placeholder data
				this.playerSeasonStats = this.markEmpty(0);
				this.playerRecentStats = this.markEmpty(0);
				this.teamRecentStats = this.markEmpty(1);
				this.teamSeasonStats = this.markEmpty(1);
			}

			this.initScrollSpy();
		},


		// prepare listeners for showing "SCROLL >" indicators
		initScrollSpy: function initScrollSpy() {
			if (this.type === 'teamSeason') this.attachScrollListener('#teamSeasonDiv', 'teamSeason');

			if (this.type === 'teamRecent') this.attachScrollListener('#teamRecentDiv', 'teamRecent');

			if (this.type === 'playerSeason') this.attachScrollListener('#playerSeasonDiv', 'playerSeason');

			if (this.type === 'event' || this.type === 'playerRecent') this.attachScrollListener('#playerRecentDiv', 'playerRecent');
		},


		// compiles averages for the season for each player
		// fair warning: this function is sort of a monster
		makePlayerSeasonStats: function makePlayerSeasonStats(rawData) {
			var statsArray = [];
			var IDs = [];
			var playerStats = [];

			// start by grouping all the stats by player
			for (var x = 0; x < rawData.length; x++) {
				var data = rawData[x];
				var userStats = [];

				// if this player hasn't had their stats grouped yet
				if (IDs.indexOf(data.member_id) === -1) {
					// find all of this player's stats in rawData
					userStats = rawData.filter(function (stat) {
						return stat.member_id === data.member_id && stat.type === 'player';
					});
					// add them to the list of already sorted
					IDs.push(data.member_id);
					statsArray.push(userStats);
				}
			}

			// now loop through each players' stats and average
			for (var x = 0; x < statsArray.length; x++) {

				// init object of compiled player's stats
				// length of this array === number of games played
				var totalStats = {};
				this.playerSeasonCols.forEach(function (key) {
					totalStats[key] = 0;
				});
				totalStats.gp = statsArray[x].length;
				var thisPlayer = this.players.filter(function (player) {
					return player.member_id === statsArray[x][0].member_id;
				});
				totalStats.lastname = thisPlayer[0].lastname;
				totalStats.name = thisPlayer[0].abbrName;

				// loop through each stats object belonging to this user
				for (var y = 0; y < statsArray[x].length; y++) {
					// store the stats for this event
					var stats = JSON.parse(statsArray[x][y].stats);
					var doubleDigits = 0;

					for (var key in stats) {
						if (stats.hasOwnProperty(key)) {

							if (key[key.length - 1] === '_') continue; // leave the percentages (e.g. fg_) for later

							if (isNaN(stats[key])) {
								totalStats[key] = stats[key]; // not something that needs averaging
								continue;
							}

							if (key === 'starter') {
								// rename 'starter' to be 'gs'
								totalStats.gs++;
								continue;
							}

							// make a counter for double and triple doubles
							// double double = 2 stat categories in double digits
							if (stats[key] >= 10) {
								if (key === 'ast' || key === 'reb' || key === 'stl' || key === 'blk' || key === 'pts') {
									doubleDigits++;
								}
							}

							// add the these stats to the total
							totalStats[key] = totalStats[key] + stats[key];
						}
					}

					// if two categories in double digits, they get a double double
					// a triple double counts as both
					if (doubleDigits == 2) {
						totalStats.dd2++;
					}
					if (doubleDigits > 2) {
						totalStats.dd2++;
						totalStats.td3++;
					}
				}

				// depending on what sport this team is, do the correct stat crunching
				playerStats.push(this.crunchStats(totalStats));
			}

			if (!playerStats.length) {
				playerStats = this.markEmpty(0);
			}

			// finally done
			this.playerSeasonStats = playerStats;
		},
		crunchStats: function crunchStats(totals) {
			var crunched = {};

			// loop through each key
			for (var key in totals) {
				if (totals.hasOwnProperty(key)) {
					// key exists

					// keys not needing averaging
					if (key === 'name' || key === 'dd2' || key === 'td3' || key === 'lastname') {
						crunched[key] = totals[key];
						continue;
					}

					// special cases, aren't averaged
					if (key === 'gs' || key === 'gp') {
						if (totals[key] === true) crunched[key] = 1;else if (totals[key] === false) crunched[key] = 0;else crunched[key] = totals[key];
						continue;
					}

					// average by number of games played, round to nearest tenth
					crunched[key] = Math.round(totals[key] / totals['gp'] * 10) / 10;
				}
			}

			// calculate the percentages
			// field goal, 3 pointers, free throws
			var prefixes = ['fg', 'threep', 'ft'];
			for (var x = 0; x < prefixes.length; x++) {
				var makes = prefixes[x] + 'm';
				var attempts = prefixes[x] + 'a';
				var percentage = prefixes[x] + '_';

				if (crunched[makes] && crunched[attempts]) {
					var percent = crunched[makes] / crunched[attempts];
					if (isNaN(percent)) {
						crunched[percentage] = 0;
						continue;
					}
					// convert to percentages and round to nearest tenth
					crunched[percentage] = Math.round(percent * 100 * 10) / 10;
				} else {
					crunched[percentage] = 0;
				}
			}

			// calculate special stats

			if (this.playerSeasonCols.includes('eff')) {
				crunched['eff'] = this.efficiency(totals);
			}

			if (this.playerSeasonCols.includes('efg_')) {
				var efg = (totals['fgm'] + 0.5 * totals['threepm']) / totals['fga'];
				crunched['efg_'] = Math.round(efg * 100 * 10) / 10;
			}

			if (this.playerSeasonCols.includes('ts_')) {
				var ts = totals['pts'] / (2 * (totals['fga'] + 0.44 * totals['fta']));
				crunched['ts_'] = Math.round(ts * 100 * 10) / 10;
			}

			if (this.playerSeasonCols.includes('astto')) {
				var astto = totals['ast'] / totals['to'];
				crunched['astto'] = Math.round(astto * 10) / 10;
			}

			return crunched;
		},


		// calculates a players season efficiency rating
		efficiency: function efficiency(totals) {
			var eff = (totals['pts'] + totals['reb'] + totals['ast'] + totals['stl'] + totals['blk'] - (totals['fga'] - totals['fgm']) - (totals['fta'] - totals['ftm']) - totals['to']) / totals['gp'];

			return Math.round(eff * 100) / 100;
		},


		// compiles raw stats into a list of stats by event
		makeTeamRecentStats: function makeTeamRecentStats(rawData) {
			var teamStats = [];

			// for each event, parse some info
			for (var x = 0; x < rawData.length; x++) {
				var data = rawData[x];

				var stats = JSON.parse(data.stats);
				var meta = JSON.parse(data.meta);

				// format date of event like 1/31
				var date = moment.utc(meta.event.start * 1000).local().format('M/D');

				stats.date = date;
				stats.id = data.id;
				stats.event_id = data.event_id;

				// if they included who this game was against
				if (meta.event.type === 'home_game') {
					// home game
					stats.opp = 'vs. ' + meta.opp;
					meta.home = 'vs.';
				} else if (meta.event.type === 'away_game') {
					// away game
					stats.opp = '@ ' + meta.opp;
					meta.home = '@';
				} else {
					// unspecified
					stats.opp = meta.opp;
				}

				if (meta.oppScore < stats.pts) {
					// they won
					stats.win = 'W';
				} else if (meta.oppScore > stats.pts) {
					// they lost
					stats.win = 'L';
				} else if (meta.oppScore === stats.pts) {
					// tie
					stats.win = 'TIE';
				}

				teamStats.push(stats);
			}

			if (!teamStats.length) teamStats = this.markEmpty(1);

			this.teamRecentStats = teamStats;
			this.meta = meta;
		},
		makeTeamSeasonStats: function makeTeamSeasonStats(rawData) {

			var totalStats = {
				gp: rawData.length
			};

			for (var x = 0; x < rawData.length; x++) {

				// store the stats for this event
				var stats = JSON.parse(rawData[x].stats);
				var meta = JSON.parse(rawData[x].meta);
				var doubleDigits = 0;

				for (var key in stats) {
					if (stats.hasOwnProperty(key)) {

						if (key.includes('_')) {
							totalStats[key] = '-';
							continue; // leave the percentages (e.g. fg_) for later
						}

						if (isNaN(stats[key])) {
							totalStats[key] = stats[key]; // not something that needs averaging
							continue;
						}

						// if this key already exists, add the numbers
						if (totalStats[key]) totalStats[key] = totalStats[key] + stats[key];else totalStats[key] = stats[key];
					}
				}
			}

			this.teamSeasonStats = this.crunchStats(totalStats);
		},


		// if stats are being viewed for a single event, cut out unnecessary columns
		formatForEvent: function formatForEvent() {

			var index = this.teamCols.indexOf('win');
			this.teamCols.splice(index, 1);
			index = this.teamCols.indexOf('date');
			this.teamCols.splice(index, 1);
			index = this.teamCols.indexOf('opp');
			this.teamCols.splice(index, 1);

			index = this.playerCols.indexOf('gs');
			this.playerCols.splice(index, 1);
			index = this.playerCols.indexOf('gp');
			this.playerCols.splice(index, 1);
			index = this.playerCols.indexOf('dd2');
			this.playerCols.splice(index, 1);
			index = this.playerCols.indexOf('td3');
			this.playerCols.splice(index, 1);
		},


		// decides whether or not this row is shown
		// based on which pagination page is active
		statShown: function statShown(index) {
			return this.pagActive === Math.floor(index / this.rowsPerPage) || !this.pagination;
		},


		// returns 'win' or 'loss' for formatting class on W/L column
		winLossClass: function winLossClass(val) {
			if (val === 'W') return 'win';else if (val === 'L') return 'loss';else if (val === 'TIE') return 'versus';else return '';
		},


		// new pagination link was clicked
		switchPag: function switchPag(clicked) {
			this.pagActive = clicked;
		},


		// set the clicked header as the sort key
		// invert ascending / descending
		playerSortBy: function playerSortBy(key) {

			if (key === 'name') {
				// if sorting by name, really sort by hidden lastname field
				key = 'lastname';
				if (key === this.playerSortKey) this.playerSortOrders['name'] = this.playerSortOrders['name'] * -1;else this.playerSortKey = 'lastname';

				return;
			}

			if (key === this.playerSortKey) this.playerSortOrders[key] = this.playerSortOrders[key] * -1;else this.playerSortKey = key;
		},
		teamSortBy: function teamSortBy(key) {
			if (key === this.teamSortKey) this.teamSortOrders[key] = this.teamSortOrders[key] * -1;else this.teamSortKey = key;
		},


		// instead of an empty stats row, fill with '-'
		markEmpty: function markEmpty(type) {
			var stats = [{}];

			if (type === 'player') {
				// player stats
				this.playerCols.forEach(function (key) {
					stats[key] = '-';
				});
			} else if (type === 'team') {
				// team stats
				this.teamCols.forEach(function (key) {
					stats[key] = '-';
				});
			}
			return stats;
		}
	},

	ready: function ready() {

		$(function () {

			$('[data-toggle="tooltip"').tooltip({
				container: 'body',
				delay: { show: 400, hide: 0 }
			});
		});
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t\n\t<div class=\"stats-container\">\n\n\t\t<!-- tell the user there aren't any stats here -->\n\t\t<div v-if=\"noStats\" class=\"Stats__title\">\n\t\t\t<div class=\"text-center\">\n\t\t\t\t<h3>There aren't any stats here yet...</h3>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<!-- if this is an event, show the outcome and opponent -->\n\t\t<div v-if=\"type === 'event'\" class=\"Stats__title\">\n\t\t\t<div class=\"text-center\">\n\t\t\t\t<h1>\n\t\t\t\t\t<span v-if=\"meta.teamScore > meta.oppScore\" class=\"win\">Win</span>\n\t\t\t\t\t<span v-if=\"meta.teamScore < meta.oppScore\" class=\"loss\">Loss</span>\n\t\t\t\t\t<span v-if=\"meta.teamScore === meta.oppScore\" class=\"win\">Tie</span>\n\t\t\t\t\t<span class=\"versus\">{{ meta.home }} </span>{{ meta.opp }}\n\t\t\t\t</h1>\n\t\t\t\t<h1>{{ meta.teamScore }} - {{ meta.oppScore }}</h1>\n\t\t\t</div>\n\t\t</div>\n\n\t\n\n    \n\n\t\t<!-- team recent stats -->\n\t\t<h3 v-show=\"type === 'event' &amp;&amp; !noStats\" class=\"Stats__header\">Team Stats</h3>\t\n    <div v-show=\"type === 'teamRecent' || type === 'event'\">\n    \t<div v-if=\"overflowed.teamRecent\" class=\"Stats__overflow\">\n\t\t\t\t<span class=\"--left\" v-show=\"overflowed.teamRecent.first\">\n\t\t\t\t\t<i class=\"material-icons\">chevron_left</i>SCROLL\n\t\t\t\t</span>\n\t\t\t\t<span class=\"--right\" v-show=\"overflowed.teamRecent.last\">\n\t\t\t\t\tSCROLL<i class=\"material-icons\">chevron_right</i>\n\t\t\t\t</span>\n\t\t\t</div>\t\n\t\t\t<div id=\"teamRecentDiv\" class=\"table-responsive\">\n\t\t\t\t<table v-show=\"teamRecentStats\" class=\"table table-striped stats-table\">\n\t\t\t\t\t<thead>\n\t\t\t    \t<tr class=\"no-highlight\">\n\t\t\t      \t<th v-for=\"key in teamRecentCols\" class=\"stat-columns text-center\" :class=\"[teamSortKey === key ? 'col-sort' : '', key === 'opp' ? 'opp' : '']\" @click=\"teamSortBy(key)\" data-toggle=\"tooltip\" :title=\"key | basketballTooltips\">\n\t\t\t      \t\t{{ key | basketballStats }}\n\t\t\t      \t\t<br><span class=\"caret\" :class=\"teamSortOrders[key] > 0  ? 'asc' : 'desc'\"></span>\t      \t\n\t\t\t      \t</th>\n\t\t\t    \t</tr>\n\t\t\t  \t</thead>\n\t\t\t  \t<tbody>\n\t\t\t    \t<tr v-show=\"statShown($index)\" v-for=\"val in teamRecentStats | orderBy teamSortKey teamSortOrders[teamSortKey]\">\n\t\t\t\t      <td v-for=\"key in teamRecentCols\" class=\"stat-entries\" :class=\"[key === 'win' ? winLossClass(val[key]) : '']\">\n\t\t\t\t      \t<span v-show=\"val[key] == null\">-</span>\n\t\t\t\t        {{ val[key] }}\n\t\t\t\t      </td>\n\t\t\t    \t</tr>\n\t\t\t  \t</tbody>\n\t\t\t\t</table>\n\t\t\t\t<div v-else=\"\" class=\"text-center\">\n\t\t\t\t\t<p>No stats here yet...</p>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\n\t\t<!-- team season stats -->\n\t\t<div v-show=\"type === 'teamSeason'\">\n\t\t\t<div v-if=\"overflowed.teamSeason\" class=\"Stats__overflow\">\n\t\t\t\t<span class=\"--left\" v-show=\"overflowed.teamSeason.first\">\n\t\t\t\t\t<i class=\"material-icons\">chevron_left</i>SCROLL\n\t\t\t\t</span>\n\t\t\t\t<span class=\"--right\" v-show=\"overflowed.teamSeason.last\">\n\t\t\t\t\tSCROLL<i class=\"material-icons\">chevron_right</i>\n\t\t\t\t</span>\n\t\t\t</div>\n\t\t\t<div id=\"teamSeasonDiv\" class=\"table-responsive\">\n\t\t\t\t<table v-show=\"teamSeasonStats\" class=\"table table-striped stats-table\">\n\t\t\t\t\t<thead>\n\t\t\t    \t<tr class=\"no-highlight\">\n\t\t\t      \t<th v-for=\"key in teamSeasonCols\" class=\"stat-columns text-center\" data-toggle=\"tooltip\" :title=\"key | basketballTooltips\">\n\t\t\t      \t\t{{ key | basketballStats }}\t\n\t\t\t      \t</th>\n\t\t\t    \t</tr>\n\t\t\t  \t</thead>\n\t\t\t  \t<tbody>\n\t\t\t    \t<tr>\n\t\t\t\t      <td v-for=\"key in teamSeasonCols\" class=\"stat-entries\">\n\t\t\t\t      \t<span v-show=\"teamSeasonStats[key] === null\">-</span>\n\t\t\t\t        {{ teamSeasonStats[key] }}\n\t\t\t\t      </td>\n\t\t\t    \t</tr>\n\t\t\t  \t</tbody>\n\t\t\t\t</table>\n\t\t\t\t<div v-else=\"\" class=\"text-center\">\n\t\t\t\t\t<p>No stats here yet...</p>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\n\t\t<!-- player season stats -->\n\t\t<div v-show=\"type === 'playerSeason'\">\n\t\t\t<div v-if=\"overflowed.playerSeason\" class=\"Stats__overflow\">\n\t\t\t\t<span class=\"--left\" v-show=\"overflowed.playerSeason.first\">\n\t\t\t\t\t<i class=\"material-icons\">chevron_left</i>SCROLL\n\t\t\t\t</span>\n\t\t\t\t<span class=\"--right\" v-show=\"overflowed.playerSeason.last\">\n\t\t\t\t\tSCROLL<i class=\"material-icons\">chevron_right</i>\n\t\t\t\t</span>\n\t\t\t</div>\t\n\t\t\t<div id=\"playerSeasonDiv\" class=\"table-responsive\">\n\t\t\t\t<table v-show=\"playerSeasonStats\" class=\"table table-striped stats-table\">\n\t\t\t\t\t<thead>\n\t\t\t    \t<tr class=\"no-highlight\">\n\t\t\t      \t<th v-for=\"key in playerSeasonCols\" class=\"stat-columns text-center\" :class=\"[playerSortKey === key ? 'col-sort' : '', key === 'name' ? 'name' : '', \n\t\t\t      \t\t\t\t\t\t\t\t(playerSortKey === 'lastname' &amp;&amp; key === 'name') ? 'col-sort' : '']\" @click=\"playerSortBy(key)\" data-toggle=\"tooltip\" :title=\"key | basketballTooltips\">\n\t\t\t      \t\t{{ key | basketballStats }}\n\t\t\t      \t\t<br><span class=\"caret\" :class=\"playerSortOrders[key] > 0  ? 'asc' : 'desc'\"></span>\t      \t\n\t\t\t      \t</th>\n\t\t\t    \t</tr>\n\t\t\t  \t</thead>\n\t\t\t  \t<tbody>\n\t\t\t    \t<tr v-show=\"statShown($index)\" v-for=\"val in playerSeasonStats | orderBy playerSortKey playerSortOrders[playerSortKey]\">\n\t\t\t\t      <td v-for=\"key in playerSeasonCols\" class=\"stat-entries\">\n\t\t\t\t      \t<span v-show=\"val[key] == null\">-</span>\n\t\t\t\t        {{ val[key] }}\n\t\t\t\t      </td>\n\t\t\t    \t</tr>\n\t\t\t  \t</tbody>\n\t\t\t\t</table>\n\t\t\t\t<div v-else=\"\" class=\"text-center\">\n\t\t\t\t\t<p>No stats here yet...</p>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\n\t\t<!-- player recent stats -->\n\t\t<div v-show=\"type === 'playerRecent' || type === 'event'\">\n\t\t\t<h3 v-show=\"type === 'event' &amp;&amp; !noStats\" class=\"Stats__header\">Player Stats</h3>\n\t\t\t<div v-if=\"overflowed.playerRecent\" class=\"Stats__overflow\">\n\t\t\t\t<span class=\"--left\" v-show=\"overflowed.playerRecent.first\">\n\t\t\t\t\t<i class=\"material-icons\">chevron_left</i>SCROLL\n\t\t\t\t</span>\n\t\t\t\t<span class=\"--right\" v-show=\"overflowed.playerRecent.last\">\n\t\t\t\t\tSCROLL<i class=\"material-icons\">chevron_right</i>\n\t\t\t\t</span>\n\t\t\t</div>\t\n\t\t\t<div id=\"playerRecentDiv\">\n\t\t\t\t<div class=\"table-responsive\">\n\t\t\t\t\t<table v-show=\"playerRecentStats\" class=\"table table-striped stats-table\">\n\t\t\t\t\t\t<thead>\n\t\t\t\t    \t<tr class=\"no-highlight\">\n\t\t\t\t      \t<th v-for=\"key in playerRecentCols\" class=\"stat-columns text-center\" :class=\"[playerSortKey === key ? 'col-sort' : '', key === 'name' ? 'name' : '',\n\t\t\t\t      \t\t\t\t\t\t\t\t(playerSortKey === 'lastname' &amp;&amp; key === 'name') ? 'col-sort' : '']\" @click=\"playerSortBy(key)\" data-toggle=\"tooltip\" :title=\"key | basketballTooltips\">\n\t\t\t\t      \t\t{{ key | basketballStats }}\n\t\t\t\t      \t\t<br><span class=\"caret\" :class=\"playerSortOrders[key] > 0  ? 'asc' : 'desc'\"></span>\t      \t\n\t\t\t\t      \t</th>\n\t\t\t\t    \t</tr>\n\t\t\t\t  \t</thead>\n\t\t\t\t  \t<tbody>\n\t\t\t\t    \t<tr v-show=\"statShown($index)\" v-for=\"val in playerRecentStats | orderBy playerSortKey playerSortOrders[playerSortKey]\">\n\t\t\t\t\t      <td v-for=\"key in playerRecentCols\" class=\"stat-entries\">\n\t\t\t\t\t      \t<span v-show=\"val[key] == null\">-</span>\n\t\t\t\t\t        {{ val[key] }}\n\t\t\t\t\t      </td>\n\t\t\t\t    \t</tr>\n\t\t\t\t  \t</tbody>\n\t\t\t\t\t</table>\n\t\t\t\t\t<div v-else=\"\" class=\"text-center\">\n\t\t\t\t\t\t<p>No stats here yet...</p>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<div v-show=\"ifPagination\" class=\"pagination text-center\">\n\t\t\t<ul class=\"pagination\">\n\t\t\t\t<li :class=\"{active: n === pagActive}\" v-for=\"n in pagCount\">\n\t\t\t\t\t<a @click=\"switchPag(n)\">{{ n + 1 }}</a>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>\n\n\n\t</div>\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".Stats__title {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  margin-bottom: 4em;\n}\n.Stats__title div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n              -ms-grid-row-align: center;\n          align-items: center;\n}\n@media screen and (max-width: 767px) {\n  .Stats__title h1 {\n    font-size: 25px;\n  }\n}\n.Stats__title .versus {\n  color: rc_light_gray;\n}\n.Stats__title .win {\n  color: #f3b700;\n}\n.Stats__title .loss {\n  color: rgba(38,51,255,0.72);\n}\n.Stats__header {\n  margin-bottom: 15px;\n}\n@media screen and (max-width: 767px) {\n  .Stats__header {\n    font-size: 20px;\n  }\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-1181ffc0", module.exports)
  } else {
    hotAPI.update("_v-1181ffc0", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"../mixins/StatsScrollSpy.js":73,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],57:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".calendar-wrapper {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n}\n.calendar-wrapper .filler {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Calendar {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  -ms-flex-preferred-size: 775px;\n      flex-basis: 775px;\n  padding-bottom: 3em;\n}\n.Calendar__nav {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  margin-top: 15px;\n}\n.Calendar__nav .nav {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Calendar__nav .add-event {\n  margin: 10px 15px 0px 0px;\n  font-size: 16px;\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Calendar__nav .add-event a {\n  float: right;\n}\n.Calendar__header {\n  margin: 0;\n  margin-top: 9px;\n  width: 190px;\n  text-align: center;\n}\n.Calendar__container {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  margin-top: 45px;\n  max-width: 775px;\n  background: #f5f5f5;\n  padding: 0px 15px;\n}\n.Calendar__container .calendar {\n  background: #f9f9f9;\n}\ndiv .cal-row-head .cal-cell1 {\n  background: #f5f5f5;\n}\na[chevron=\"prev\"],\na[chevron=\"next\"] {\n  position: relative;\n  -webkit-animation-duration: 0.2s;\n  -animation-duration: 0.2s;\n}\na[chevron=\"prev\"]:hover,\na[chevron=\"next\"]:hover {\n  cursor: pointer;\n}\na[chevron=\"prev\"] .chevron,\na[chevron=\"next\"] .chevron {\n  font-size: 44px;\n}\n#cal-day-box .day-highlight.dh-event-awayGame {\n  border: 1px solid rc_yellow;\n}\n#cal-day-box .day-highlight.dh-event-homeGame {\n  border: 1px solid rc_red;\n}\n#cal-day-box .day-highlight.dh-event-practice {\n  border: 1px solid rc_blue;\n}\n#cal-day-box .day-highlight.dh-event-other {\n  border: 1px solid rc_green;\n}\n.event-homeGame {\n  background-color: rc_red;\n}\n.event-awayGame {\n  background-color: rc_yellow;\n}\n.event-practice {\n  background-color: rc_blue;\n}\n.event-other {\n  background-color: rc_green;\n}\n.day-highlight.dh-event-homeGame:hover,\n.day-highlight.dh-event-homeGame {\n  background-color: rc_red;\n  opacity: 0.75;\n}\n.day-highlight.dh-event-awayGame:hover,\n.day-highlight.dh-event-awayGame {\n  background-color: rc_yellow;\n  opacity: 0.75;\n}\n.day-highlight.dh-event-practice:hover,\n.day-highlight.dh-event-practice {\n  background-color: rc_blue;\n  opacity: 0.75;\n}\n.day-highlight.dh-event-other:hover,\n.day-highlight.dh-event-other {\n  background-color: rc_green;\n  opacity: 0.75;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


var animateEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
var rubberBand = 'animated rubberBand';

exports.default = {
  name: 'Calendar',

  props: ['admin', 'events'],

  data: function data() {

    var firstDayOfYear = moment().dayOfYear(1).hour(0).minute(0).unix() * 1000;

    return {
      calendar: '',
      options: {
        events_source: [],
        modal: '#events-modal',
        first_event: firstDayOfYear,
        onAfterViewLoad: function onAfterViewLoad(view) {
          $('.Calendar__header').text(this.getTitle());
        },
        classes: {
          months: {
            general: 'label'
          }
        }
      }
    };
  },


  watch: {
    events: function events() {
      this.compile();
    }
  },

  ready: function ready() {

    var self = this;
    $(function () {

      // attach the calendar when the DOM is ready
      self.calendar = $('.calendar').calendar(self.options);

      // hide tooltips if on mobile (they are annoying and counterintuitive)
      // give time for DOM to settle before checking
      setTimeout(function () {
        if (window.innerWidth < 767) {
          $('.calendar [data-toggle="tooltip"]').tooltip('destroy');
        }
      }, 1000);
    });
  },


  methods: {

    // events array changed, reload the calendar data
    compile: function compile() {

      // attach a new events array
      var events = this.formatEvents();
      if (events.length) var firstEvent = events[0].start;else var firstEvent = moment().dayOfYear(1).hour(0).minute(0).unix() * 1000;

      this.calendar.setOptions({
        events_source: events,
        first_event: firstEvent
      });

      this.calendar.view();
    },


    // format events for calendar
    formatEvents: function formatEvents() {

      var formattedEvents = [];

      for (var x = 0; x < this.events.length; x++) {
        var event = this.events[x];
        var temp = {};

        temp.id = event.id;
        temp.start = event.start * 1000;
        temp.end = event.end * 1000;
        temp.title = this.formatEventTitle(event.title, temp.start, temp.end);

        switch (event.type) {
          case 'practice':
            // practice event
            temp.class = 'event-practice';
            break;
          case 'home_game':
            // game event
            temp.class = 'event-homeGame';
            break;
          case 'away_game':
            // game event
            temp.class = 'event-awayGame';
            break;
          case 'other':
            // other event
            temp.class = 'event-other';
            break;
        }

        formattedEvents.push(temp);
      }

      return formattedEvents;
    },


    // formats the title with an appropriate date string
    formatEventTitle: function formatEventTitle(title, start, end) {

      var startTime, endTime;

      if (moment(start).isSame(end, 'day')) {
        // events on same day, drop date in title

        if (moment(start).hour() < 12 && moment(end).hour() < 12 || moment(start).hour() >= 12 && moment(end).hour() >= 12) {
          // both are am or pm, drop that from string as well
          var startTime = moment(start).format('h:mm');
          var endTime = moment(end).format('h:mm a');
        } else {
          var startTime = moment(start).format('h:mm a');
          var endTime = moment(end).format('h:mm a');
        }
        return title + " — " + startTime + " – " + endTime;
      } else {
        return title + " — " + moment(start).format('MMM. Do h:mm a') + ' - ' + moment(end).format('MMM. Do h:mm a');
      }
    },


    // animate click and switch month
    chevron: function chevron(direction) {
      this.calendar.navigate(direction);

      var chevron = $('[chevron="' + direction + '"]');

      // animate chevron
      chevron.addClass(rubberBand).one(animateEnd, function () {
        chevron.removeClass(rubberBand);
      });
    }
  }

};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n<div class=\"calendar-wrapper\">\n  <div class=\"filler\"></div>\n\n\t<div class=\"Calendar\">\n    <div class=\"Calendar__nav\">\n\n      <div class=\"nav\">\n        <a chevron=\"prev\" @click=\"chevron('prev')\"><i class=\"material-icons chevron\">chevron_left</i></a>\n        <h3 class=\"Calendar__header\"></h3>\n        <a chevron=\"next\" @click=\"chevron('next')\"><i class=\"material-icons chevron\">chevron_right</i></a>\n      </div>\n      \n      <div class=\"add-event\">\n        <a v-show=\"admin\" @click=\"$root.showModal('addEventModal')\">\n          <i class=\"glyphicon glyphicon-plus\"></i>\n          <span>Add an Event</span>\n        </a>\n      </div>\n  \n    </div>\n    <div class=\"Calendar__container\">\n        <div class=\"calendar\"></div>\n    </div>\n\t</div>\n\n  <div class=\"filler\"></div>\n</div> \n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".calendar-wrapper {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n}\n.calendar-wrapper .filler {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Calendar {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  -ms-flex-preferred-size: 775px;\n      flex-basis: 775px;\n  padding-bottom: 3em;\n}\n.Calendar__nav {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  margin-top: 15px;\n}\n.Calendar__nav .nav {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Calendar__nav .add-event {\n  margin: 10px 15px 0px 0px;\n  font-size: 16px;\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Calendar__nav .add-event a {\n  float: right;\n}\n.Calendar__header {\n  margin: 0;\n  margin-top: 9px;\n  width: 190px;\n  text-align: center;\n}\n.Calendar__container {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  margin-top: 45px;\n  max-width: 775px;\n  background: #f5f5f5;\n  padding: 0px 15px;\n}\n.Calendar__container .calendar {\n  background: #f9f9f9;\n}\ndiv .cal-row-head .cal-cell1 {\n  background: #f5f5f5;\n}\na[chevron=\"prev\"],\na[chevron=\"next\"] {\n  position: relative;\n  -webkit-animation-duration: 0.2s;\n  -animation-duration: 0.2s;\n}\na[chevron=\"prev\"]:hover,\na[chevron=\"next\"]:hover {\n  cursor: pointer;\n}\na[chevron=\"prev\"] .chevron,\na[chevron=\"next\"] .chevron {\n  font-size: 44px;\n}\n#cal-day-box .day-highlight.dh-event-awayGame {\n  border: 1px solid rc_yellow;\n}\n#cal-day-box .day-highlight.dh-event-homeGame {\n  border: 1px solid rc_red;\n}\n#cal-day-box .day-highlight.dh-event-practice {\n  border: 1px solid rc_blue;\n}\n#cal-day-box .day-highlight.dh-event-other {\n  border: 1px solid rc_green;\n}\n.event-homeGame {\n  background-color: rc_red;\n}\n.event-awayGame {\n  background-color: rc_yellow;\n}\n.event-practice {\n  background-color: rc_blue;\n}\n.event-other {\n  background-color: rc_green;\n}\n.day-highlight.dh-event-homeGame:hover,\n.day-highlight.dh-event-homeGame {\n  background-color: rc_red;\n  opacity: 0.75;\n}\n.day-highlight.dh-event-awayGame:hover,\n.day-highlight.dh-event-awayGame {\n  background-color: rc_yellow;\n  opacity: 0.75;\n}\n.day-highlight.dh-event-practice:hover,\n.day-highlight.dh-event-practice {\n  background-color: rc_blue;\n  opacity: 0.75;\n}\n.day-highlight.dh-event-other:hover,\n.day-highlight.dh-event-other {\n  background-color: rc_green;\n  opacity: 0.75;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-2d7d5230", module.exports)
  } else {
    hotAPI.update("_v-2d7d5230", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],58:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".page-wrapper {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.CreateTeam {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  margin-top: 40px;\n  margin-bottom: 100px;\n  padding: 20px;\n  background: #fff;\n  max-width: 750px;\n}\n.CreateTeam div,\n.CreateTeam hr {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n}\n.CreateTeam__header {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  margin: 25px 20px 0px 25px;\n}\n.CreateTeam__header h3 {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  margin-bottom: 20px;\n}\n.CreateTeam__header div {\n  margin-top: 10px;\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n}\n.CreateTeam__header div span {\n  color: #7b7b7b;\n}\n.CreateTeam__header p {\n  font-size: 15px;\n}\n.CreateTeam__subheader {\n  margin-left: 20px;\n}\n.CreateTeam__subheader:first-child {\n  margin-top: 20px;\n}\n.CreateTeam__title {\n  text-align: center;\n  margin-bottom: 10px;\n}\n.CreateTeam__title h2 {\n  margin-bottom: 20px;\n}\n.CreateTeam__title p {\n  font-size: 15px;\n  color: #7b7b7b;\n}\n.CreateTeam__inputs {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  margin-top: 25px;\n}\n@media screen and (max-width: 767px) {\n  .CreateTeam__inputs {\n    margin-top: 50px;\n  }\n}\n.CreateTeam__inputs .remaining {\n  font-size: 13px;\n  color: #9f9f9f;\n  float: right;\n}\n.CreateTeam__inputs div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  margin: 5px 20px;\n}\n@media screen and (max-width: 767px) {\n  .CreateTeam__inputs div {\n    -ms-flex-preferred-size: 100%;\n        flex-basis: 100%;\n  }\n}\n.CreateTeam__inputs div.--smallSelect {\n  -webkit-box-flex: 0;\n      -ms-flex: none;\n          flex: none;\n  -ms-flex-preferred-size: 75px;\n      flex-basis: 75px;\n}\n.CreateTeam__inputs div.--name {\n  -ms-flex-preferred-size: 25%;\n      flex-basis: 25%;\n}\n.CreateTeam__inputs div.--email {\n  -ms-flex-preferred-size: 50%;\n      flex-basis: 50%;\n}\n.CreateTeam__inputs div.dropdown-menu.open {\n  margin: 0px;\n}\n.CreateTeam__inputs div.dropdown-menu.open .bs-actionsbox {\n  margin: 5px 0px;\n}\n.CreateTeam__inputs div.dropdown-menu.open .btn-group {\n  margin-left: 0px;\n}\n.CreateTeam__inputs div.dropdown-menu.open .text-muted {\n  color: #329acf;\n}\n.CreateTeam__inputs div.dropdown-menu .disabled a {\n  color: rgba(128,128,128,0.44);\n}\n.CreateTeam__buttons {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  margin-top: 50px;\n}\n.CreateTeam__buttons div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.CreateTeam__buttons a.--right {\n  float: right;\n  margin-right: 20px;\n}\n.CreateTeam__buttons a.--left {\n  float: left;\n  margin-left: 20px;\n}\n.CreateTeam__buttons a.save {\n  float: right;\n  margin-right: 20px;\n}\n.CreateTeam__buttons span.form-error {\n  float: right;\n  margin-right: 20px;\n  margin-top: 10px;\n}\n.CreateTeam__separator {\n  margin-right: 20px;\n  margin-left: 20px;\n}\n.add-user {\n  margin: 25px;\n  text-align: center;\n  font-size: 20px;\n}\n.add-user .glyphicon:hover {\n  cursor: pointer;\n}\n.add-user .glyphicon-minus {\n  color: #fc001e;\n  margin-left: 10px;\n}\n.add-user .glyphicon-plus {\n  color: #1179c9;\n  margin-right: 10px;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _GoogleTypeahead = require('./GoogleTypeahead.vue');

var _GoogleTypeahead2 = _interopRequireDefault(_GoogleTypeahead);

var _StatsSelection = require('../mixins/StatsSelection.js');

var _StatsSelection2 = _interopRequireDefault(_StatsSelection);

var _Validator = require('../mixins/Validator.js');

var _Validator2 = _interopRequireDefault(_Validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'CreateTeam',

	mixins: [_StatsSelection2.default, _Validator2.default],

	props: [],

	components: {
		'google-autocomplete': _GoogleTypeahead2.default
	},

	created: function created() {
		this.$root.get(this.prefix + '/dummy/' + this.gender, 'CreateTeam_dummy');

		this.attachErrorChecking();
	},
	data: function data() {
		return {
			prefix: this.$root.prefix + 'team/create',
			page: 'info',
			name: '',
			teamname: '',
			sport: 'basketball',
			userIsA: 'fan',
			gender: 'male',
			homefield: '',
			city: '',
			long: '',
			lat: '',
			slogan: '',
			players: [{ firstname: '', lastname: '', email: '' }],
			coaches: [{ firstname: '', lastname: '', email: '' }],
			dummy: [{ firstname: 'Ghosty', lastname: 'McGhostFace', email: 'ghost@rookiecard.com' }]
		};
	},


	methods: {
		/**
   * Send request to server to create this team
   * 
   * @return Routes to /team/<teamname>
   */
		save: function save() {

			if (this.errorCheck() > 0) {
				this.setPageError('Correct errors before submitting');
				return;
			}

			// build up object of all the team data
			var data = {
				name: this.name,
				teamname: this.teamname,
				slogan: this.slogan,
				gender: this.gender,
				homefield: this.homefield,
				city: this.city,
				long: this.long,
				lat: this.lat,
				sport: this.sport,
				userIsA: this.userIsA,
				players: this.players,
				coaches: this.coaches,
				numPlayers: this.numPlayers,
				numCoaches: this.numCoaches,
				userStats: this.userSelected,
				rcStats: this.rcSelected
			};

			this.$root.post(this.prefix, 'CreateTeam_submit', data);
		},


		/**
   * User has clicked the "Next >" button
   * Error check and move the page forward
   *
   * @return {void}
   */
		changePage: function changePage() {
			var errors = 0;

			this.setPageError('Correct errors before continuing');

			if (this.page === 'info') {
				errors += this.errorCheck('name');
				errors += this.errorCheck('teamname');
				errors += this.errorCheck('city');
			} else if (this.page === 'roster') {
				errors = this.errorCheck();
			}

			if (!errors) {
				this.setPageError('');

				if (this.page === 'info') {
					this.page = 'stats';
				} else if (this.page === 'stats') {
					this.page = 'roster';
				}
			}
		},


		/**
   * Tell Validator.js which variables to error check
   *
   * @return {void} 
   */
		attachErrorChecking: function attachErrorChecking() {
			var msg = ['Enter a team URL', 'Use 18 characters or less', 'Use only letters and numbers'];
			this.registerErrorChecking('teamname', 'required|max:18|alpha_num', msg);
			this.registerErrorChecking('name', 'required', 'Enter a name');
			this.registerErrorChecking('city', 'required', 'Search for your city');

			this.registerErrorChecking('players.*.email', 'email', 'Invalid email');
			this.registerErrorChecking('players.*.firstname', 'required', 'Enter a first name');
			this.registerErrorChecking('players.*.lastname', 'required', 'Enter a last name');
			this.registerErrorChecking('coaches.*.email', 'email', 'Invalid email');
			this.registerErrorChecking('coaches.*.firstname', 'required', 'Enter a first name');
			this.registerErrorChecking('coaches.*.lastname', 'required', 'Enter a last name');

			// will use these below the "Next >" button if error on the page
			this.manualErrorChecking('page.info');
			this.manualErrorChecking('page.roster');
		},


		/**
   * Set an error below the "Next >" button
   */
		setPageError: function setPageError(error) {
			this.$set('errors.page.' + this.page, error);
		}
	},

	events: {
		/**
   * Request returned with dummy data used as placeholders for ghosts
   *
   * @param {object} response
   */
		CreateTeam_dummy: function CreateTeam_dummy(response) {
			this.dummy = response.data.dummy;
		},


		/**
   * Request returned whether or not this teamname is available
   *
   * @param {object} response
   */
		CreateTeam_available: function CreateTeam_available(response) {
			if (response.data.available) {
				this.errors.teamname = '';
			} else {
				this.errors.teamname = 'Already taken, try another';
			}
		},


		/**
   * Request returned after creating the team
   *
   * @param {object} response 
   */
		CreateTeam_submit: function CreateTeam_submit(response) {
			// use a delay because it felt TOO fast without one
			setTimeout(function () {
				this.$router.go('/team/' + response.data.team.teamname);
			}.bind(this), 750);
		},


		/**
   * Inititialze the selectpickers in the stats section
   */
		initSelectPicker: function initSelectPicker() {
			var userPicker = $('[CreateTeam="userStats"]');
			var rcPicker = $('[CreateTeam="rcStats"]');

			userPicker.selectpicker({});
			rcPicker.selectpicker({});

			userPicker.selectpicker('val', this.userSelected).selectpicker('refresh');
			rcPicker.selectpicker('val', this.rcSelected).selectpicker('refresh');
			userPicker.selectpicker('refresh');
			rcPicker.selectpicker('refresh');

			// set up listeners to tell StatsSelection mixin to update on change
			userPicker.on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
				this.setDependencies();
			}.bind(this));

			rcPicker.on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
				this.setDependencies();
			}.bind(this));
		},


		/**
   * The stats selected have been changed, re-render the pickers
   */
		renderSelectPicker: function renderSelectPicker() {
			var userPicker = $('[CreateTeam="userStats"]');
			var rcPicker = $('[CreateTeam="rcStats"]');

			userPicker.selectpicker('refresh');
			rcPicker.selectpicker('refresh');
			userPicker.selectpicker('val', this.userSelected);
			rcPicker.selectpicker('val', this.rcSelected);
			userPicker.selectpicker('render');
			rcPicker.selectpicker('render');
		}
	},

	watch: {
		/**
   * If the sport changed, change the stats in the pickers as well
   */
		sport: function sport() {
			this.initSelections(this.sport);
		},


		/**
   * If the team's gender has changed, update the dummy names to be accurate
   */
		gender: function gender() {
			this.$root.get(this.prefix + '/dummy/' + this.gender, 'CreateTeam_dummy');
		},


		/**
   * If the teamname changed, ask the server if this name is in use yet
   */
		teamname: function teamname() {
			if (!this.errors.teamname && this.teamname.length) {
				// ask the server if this teamname is available
				var url = this.prefix + '/' + this.teamname;
				this.$root.post(url, 'CreateTeam_available');
			}
		}
	},

	ready: function ready() {
		// calling StatsSelection mixin function
		this.initSelections(this.sport);

		$(function () {

			$('[CreateTeam="sport"]').selectpicker({});
			$('[CreateTeam="numPlayers"]').selectpicker({});
			$('[CreateTeam="numCoaches"]').selectpicker({});
			$('[CreateTeam="gender"]').selectpicker({});
			$('[CreateTeam="userIsA"]').selectpicker({});
		}.bind(this));
	}
};

/*Dropzone.options.createTeamDropzone = {
	paramName: 'pic',
	dictDefaultMessage: 'Drag and drop a file or click here',
	headers: {'X-CSRF-TOKEN': $('#_token').attr('value') },
	maxFiles: 1,
	maxFilesize: 10,
};*/
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t<div>\n\t\t<div class=\"page-wrapper\">\n\t\t\t\n\t\t\t<div class=\"CreateTeam\">\n\t\t\t\n\n\t\t\t\t<div v-show=\"page === 'info'\" class=\"CreateTeam__title\">\n\t\t\t\t\t<h2>Manage your team on Rookiecard</h2>\n\t\t\t\t\t<p>Organize your calendar, stats, and roster in one place</p>\n\t\t\t\t\t<p>Fully automated email notifications for new events, cancelations, and more</p>\n\t\t\t\t\t<p>Fans can stay updated on team activities</p>\n\t\t\t\t</div>\n\n\n\n\t\t\t\t<!-- Basic info -->\n\t\t\t\t<div v-show=\"page === 'info'\">\n\t\t\t\t\t\n\t\t\t\t\t<div class=\"CreateTeam__header\">\n\t\t\t\t\t\t<h3>Team Info</h3>\n\t\t\t\t\t\t<p>First tell us some basic info about your team</p>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<span>Step 1 / 3</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<hr>\n\t\t\t\t\t</div>\t\n\t\t\t\t\t<div class=\"CreateTeam__inputs\">\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Team Name</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.name}\" required=\"\" maxlength=\"25\" placeholder=\"WHS Varsity Basketball\" v-model=\"name\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.name }}</span>\t\t\t\t\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Team URL</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.teamname}\" maxlength=\"18\" placeholder=\"whsbasketball16\" required=\"\" debounce=\"600\" v-model=\"teamname\">\n\t\t\t\t\t\t\t<span v-show=\"errors.teamname\" class=\"form-error\">{{ errors.teamname }}</span>\n\t\t\t\t\t\t\t<span v-else=\"\" class=\"input-info\">rookiecard.com/team/{{ teamname }}</span>\t\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class=\"CreateTeam__inputs\">\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Sport</label>\n\t\t\t\t\t\t\t<select data-style=\"btn-select btn-lg\" createteam=\"sport\" class=\"selectpicker form-control show-tick\" required=\"\" v-model=\"sport\">\n\t              <option value=\"basketball\">Basketball</option>    \n\t              <option value=\"baseball\" disabled=\"\">Baseball</option>    \n\t              <option value=\"softball\" disabled=\"\">Softball</option>    \n\t              <option value=\"football\" disabled=\"\">Football</option>    \n            \t</select>\n\t\t\t\t\t\t\t<span class=\"input-info\">More coming soon!</span>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>I am a...</label>\n\t\t\t\t\t\t\t<select data-style=\"btn-select btn-lg\" createteam=\"userIsA\" class=\"selectpicker form-control show-tick\" required=\"\" v-model=\"userIsA\">\n\t\t\t\t\t\t\t\t<option value=\"player\">Player</option>\n\t\t\t\t\t\t\t\t<option value=\"coach\">Coach</option>\n\t\t\t\t\t\t\t\t<option value=\"fan\">Fan</option>\n\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Sex</label>\n\t\t\t\t\t\t\t<select data-style=\"btn-select btn-lg\" class=\"selectpicker form-control show-tick\" createteam=\"gender\" v-model=\"gender\">\n\t\t\t\t\t\t\t\t<option value=\"male\">Men</option>\n\t\t\t\t\t\t\t\t<option value=\"female\">Women</option>\n\t\t\t\t\t\t\t\t<option value=\"coed\">Co-ed</option>\n\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class=\"CreateTeam__inputs\">\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Home Field</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" maxlength=\"50\" placeholder=\"Cowell Stadium\" v-model=\"homefield\">\n\t\t\t\t\t\t</div>\n\n\n\t\t\t\t\t\t<google-autocomplete :city.sync=\"city\" :long.sync=\"long\" :lat.sync=\"lat\" label=\"City / Town\" :error=\"errors.city\">\n\t\t\t\t\t\t</google-autocomplete>\n\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class=\"CreateTeam__inputs\">\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Slogan</label>\n\t\t\t\t\t\t\t<span class=\"remaining\"><strong>{{ slogan.length }}</strong> / 50</span>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" maxlength=\"50\" placeholder=\"Home of the Warriors\" v-model=\"slogan\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.slogan }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t\n\n\t\t\t\t\t<!-- <div class=\"CreateTeam__inputs\">\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<form action=\"/team/create/unhfootball/pic\" class=\"dropzone\" id=\"create-team-dropzone\"></form>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div> -->\n\t\t\t\t\t\n\n\n\t\t\t\t\t<div class=\"CreateTeam__buttons\">\n\t\t\t\t\t\t<div><!-- empty as placeholder for non-existent back button --></div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<a class=\"btn btn-primary --chevron --sm --right\" @click=\"changePage\">NEXT\n\t\t\t\t\t\t\t\t<i class=\"material-icons btn-chevron --right\">chevron_right</i>\n\t\t\t\t\t\t\t</a>\t\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.page.info }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\t\n\n\t\t\t\t</div> <!-- end of team info -->\n\t\t\t\t\n\n\n\n\t\t\t\t<div v-show=\"page === 'stats'\">\n\n\t\t\t\t\t<div class=\"CreateTeam__header\">\n\t\t\t\t\t\t<h3>Stats</h3>\n\t\t\t\t\t\t<p>Choose the stats you want to track for your team and players</p>\n\t\t\t\t\t\t<p>These can be changed at any time</p>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<span>Step 2 / 3</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<hr>\n\t\t\t\t\t</div>\t\n\t\t\t\t\t<div class=\"CreateTeam__inputs\">\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Inputted by team admin</label>\n\t\t\t\t\t\t\t<select data-style=\"btn-select btn-lg\" createteam=\"userStats\" class=\"selectpicker form-control show-tick\" data-selected-text-format=\"count\" multiple=\"\" required=\"\" data-size=\"false\" v-model=\"userSelected\">\n\t              <option v-for=\"stat in userStatsList\" :value=\"userStatKeys[$index]\" :disabled=\"stat.disabled\">{{ stat.val }}</option>      \n            \t</select>\n            \t<p v-for=\"stat in userStatsList\">{{ userStatsList[stat] }}</p> \n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<label>Calculated by Rookiecard</label>\n\t\t\t\t\t\t\t<select data-style=\"btn-select btn-lg\" createteam=\"rcStats\" class=\"selectpicker form-control show-tick\" data-selected-text-format=\"count\" multiple=\"\" required=\"\" data-size=\"false\" v-model=\"rcSelected\">\n\t              <option v-for=\"stat in rcStatsList\" :value=\"rcStatKeys[$index]\" :disabled=\"stat.disabled\">{{ stat.val }}</option>       \n            \t</select>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class=\"CreateTeam__buttons\">\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<a class=\"btn btn-cancel --chevron --sm --left\" @click=\"page = 'info'\">\n\t\t\t\t\t\t\t\t<i class=\"material-icons btn-chevron --left\">chevron_left</i>BACK\n\t\t\t\t\t\t\t</a>\t\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<a class=\"btn btn-primary --chevron --sm --right\" @click=\"changePage\">NEXT\n\t\t\t\t\t\t\t\t<i class=\"material-icons btn-chevron --right\">chevron_right</i>\n\t\t\t\t\t\t\t</a>\t\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.page.stats }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\t\t\n\t\t\t\t</div> <!-- end of stats  -->\n\n\n\n\t\t\t\t<div v-show=\"page === 'roster'\">\n\n\t\t\t\t\t<div class=\"CreateTeam__header\">\n\t\t\t\t\t\t<h3>Roster</h3>\n\t\t\t\t\t\t<p>Enter info about the players and coaches that are on this team.</p>\n\t\t\t\t\t\t<p>Your team will be populated with \"ghost\" users.</p>\n\t\t\t\t\t\t<p>If you'd like to invite someone to join, add their email.</p>\n\t\t\t\t\t\t<p><strong>Don't worry, you can edit all of this information at any time!</strong></p>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<span>Step 3 / 3</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<hr>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<h4 class=\"CreateTeam__subheader\">Players</h4>\n\t\t\t\t\t<!-- disabled inputs to show logged-in user as a player -->\n\t\t\t\t\t<div v-show=\"userIsA == 'player'\" class=\"CreateTeam__inputs\">\n\t\t\t\t\t\t<div class=\"--name\">\n\t\t\t\t\t\t\t<label>First</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"$root.user.firstname\" disabled=\"\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--name\">\t\n\t\t\t\t\t\t\t<label>Last</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"$root.user.lastname\" disabled=\"\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--email\">\n\t\t\t\t\t\t\t<label>Email</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"$root.user.email\" disabled=\"\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div v-for=\"player in players\" class=\"CreateTeam__inputs\" transition=\"slide-sm\">\n\t\t\t\t\t\t<div class=\"--name\">\n\t\t\t\t\t\t\t<label>First Name</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"player.firstname\" :class=\"{'form-error' : errors.players[$index].firstname}\" :placeholder=\"dummy[$index].firstname\" maxlength=\"100\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.players[$index].firstname }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--name\">\t\n\t\t\t\t\t\t\t<label>Last Name</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"player.lastname\" :class=\"{'form-error' : errors.players[$index].lastname}\" :placeholder=\"dummy[$index].lastname\" maxlength=\"100\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.players[$index].lastname }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--email\">\n\t\t\t\t\t\t\t<label>Email</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"player.email\" :class=\"{'form-error' : errors.players[$index].email}\" :placeholder=\"dummy[$index].email\" maxlength=\"100\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.players[$index].email }}</span>\n\t\t\t\t\t\t</div>\t\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"add-user\">\n            <i @click=\"players.push({firstname: '', lastname: '', email: ''})\" class=\"glyphicon glyphicon-plus\">\n            </i>\n            <i @click=\"players.pop()\" class=\"glyphicon glyphicon-minus\">\n            </i>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<hr class=\"CreateTeam__separator\">\n\n\t\t\t\t\t<h4 class=\"CreateTeam__subheader\">Coaches</h4>\n\t\t\t\t\t<!-- disabled inputs to show logged-in user as a coach -->\n\t\t\t\t\t<div v-show=\"userIsA == 'coach'\" class=\"CreateTeam__inputs\">\n\t\t\t\t\t\t<div class=\"--name\">\n\t\t\t\t\t\t\t<label>First</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"$root.user.firstname\" disabled=\"\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--name\">\t\n\t\t\t\t\t\t\t<label>Last</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"$root.user.lastname\" disabled=\"\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--email\">\n\t\t\t\t\t\t\t<label>Email</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"$root.user.email\" disabled=\"\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div v-for=\"coach in coaches\" class=\"CreateTeam__inputs\" transition=\"slide-sm\">\n\t\t\t\t\t\t<div class=\"--name\">\n\t\t\t\t\t\t\t<label>First Name</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"coach.firstname\" :class=\"{'form-error' : errors.coaches[$index].firstname}\" :placeholder=\"dummy[$index].firstname\" maxlength=\"100\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.coaches[$index].firstname }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--name\">\t\n\t\t\t\t\t\t\t<label>Last Name</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"coach.lastname\" :class=\"{'form-error' : errors.coaches[$index].lastname}\" :placeholder=\"dummy[$index].lastname\" maxlength=\"100\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.coaches[$index].lastname }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"--email\">\n\t\t\t\t\t\t\t<label>Email</label>\n\t\t\t\t\t\t\t<input type=\"text\" class=\"form-control\" v-model=\"coach.email\" :class=\"{'form-error' : errors.coaches[$index].email}\" :placeholder=\"dummy[$index].email\" maxlength=\"100\">\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.coaches[$index].email }}</span>\n\t\t\t\t\t\t</div>\t\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"add-user\">\n            <i @click=\"coaches.push({firstname: '', lastname: '', email: ''})\" class=\"glyphicon glyphicon-plus\">\n            </i>\n            <i @click=\"coaches.pop()\" class=\"glyphicon glyphicon-minus\">\n            </i>\n\t\t\t\t\t</div>\n\t\t\t\t\t\t  \n\t\t\t\t\t\n\n\t\t\t\t\t<div class=\"CreateTeam__buttons\">\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<a class=\"btn btn-cancel --chevron --sm --left\" @click=\"page = 'stats'\">BACK\n\t\t\t\t\t\t\t\t<i class=\"material-icons btn-chevron --left\">chevron_left</i>\n\t\t\t\t\t\t\t</a>\t\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<a class=\"btn btn-primary save\" @click=\"save\">CREATE TEAM</a>\n\t\t\t\t\t\t\t<span class=\"form-error\">{{ errors.page.roster }}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\t\t\n\t\t\t\t</div> <!-- end of stats  -->\n\t\t\t\t\n\t\t\t</div>\n\t\t\t\n\n\t\t</div>\n\n\t\t\t<!-- include the footer at bottom -->\n\t\t<div class=\"Footer --light\">\n\t    <p>® 2016 Rookiecard LLC</p>\n\t\t</div>\n\n\t</div>\t\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".page-wrapper {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.CreateTeam {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  margin-top: 40px;\n  margin-bottom: 100px;\n  padding: 20px;\n  background: #fff;\n  max-width: 750px;\n}\n.CreateTeam div,\n.CreateTeam hr {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n}\n.CreateTeam__header {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  margin: 25px 20px 0px 25px;\n}\n.CreateTeam__header h3 {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  margin-bottom: 20px;\n}\n.CreateTeam__header div {\n  margin-top: 10px;\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n}\n.CreateTeam__header div span {\n  color: #7b7b7b;\n}\n.CreateTeam__header p {\n  font-size: 15px;\n}\n.CreateTeam__subheader {\n  margin-left: 20px;\n}\n.CreateTeam__subheader:first-child {\n  margin-top: 20px;\n}\n.CreateTeam__title {\n  text-align: center;\n  margin-bottom: 10px;\n}\n.CreateTeam__title h2 {\n  margin-bottom: 20px;\n}\n.CreateTeam__title p {\n  font-size: 15px;\n  color: #7b7b7b;\n}\n.CreateTeam__inputs {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  margin-top: 25px;\n}\n@media screen and (max-width: 767px) {\n  .CreateTeam__inputs {\n    margin-top: 50px;\n  }\n}\n.CreateTeam__inputs .remaining {\n  font-size: 13px;\n  color: #9f9f9f;\n  float: right;\n}\n.CreateTeam__inputs div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  margin: 5px 20px;\n}\n@media screen and (max-width: 767px) {\n  .CreateTeam__inputs div {\n    -ms-flex-preferred-size: 100%;\n        flex-basis: 100%;\n  }\n}\n.CreateTeam__inputs div.--smallSelect {\n  -webkit-box-flex: 0;\n      -ms-flex: none;\n          flex: none;\n  -ms-flex-preferred-size: 75px;\n      flex-basis: 75px;\n}\n.CreateTeam__inputs div.--name {\n  -ms-flex-preferred-size: 25%;\n      flex-basis: 25%;\n}\n.CreateTeam__inputs div.--email {\n  -ms-flex-preferred-size: 50%;\n      flex-basis: 50%;\n}\n.CreateTeam__inputs div.dropdown-menu.open {\n  margin: 0px;\n}\n.CreateTeam__inputs div.dropdown-menu.open .bs-actionsbox {\n  margin: 5px 0px;\n}\n.CreateTeam__inputs div.dropdown-menu.open .btn-group {\n  margin-left: 0px;\n}\n.CreateTeam__inputs div.dropdown-menu.open .text-muted {\n  color: #329acf;\n}\n.CreateTeam__inputs div.dropdown-menu .disabled a {\n  color: rgba(128,128,128,0.44);\n}\n.CreateTeam__buttons {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  margin-top: 50px;\n}\n.CreateTeam__buttons div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.CreateTeam__buttons a.--right {\n  float: right;\n  margin-right: 20px;\n}\n.CreateTeam__buttons a.--left {\n  float: left;\n  margin-left: 20px;\n}\n.CreateTeam__buttons a.save {\n  float: right;\n  margin-right: 20px;\n}\n.CreateTeam__buttons span.form-error {\n  float: right;\n  margin-right: 20px;\n  margin-top: 10px;\n}\n.CreateTeam__separator {\n  margin-right: 20px;\n  margin-left: 20px;\n}\n.add-user {\n  margin: 25px;\n  text-align: center;\n  font-size: 20px;\n}\n.add-user .glyphicon:hover {\n  cursor: pointer;\n}\n.add-user .glyphicon-minus {\n  color: #fc001e;\n  margin-left: 10px;\n}\n.add-user .glyphicon-plus {\n  color: #1179c9;\n  margin-right: 10px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-cc5cf9ba", module.exports)
  } else {
    hotAPI.update("_v-cc5cf9ba", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"../mixins/StatsSelection.js":74,"../mixins/Validator.js":75,"./GoogleTypeahead.vue":62,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],59:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("#statsWrapper {\n  padding: 1.5em;\n}\n#statsWrapper h3 {\n  margin-top: 2em;\n}\n.stats-radio {\n  padding-left: 3em;\n}\n.stat-notes {\n  margin-bottom: 20px;\n}\n.edit-button {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n}\n@media screen and (max-width: 767px) {\n  .edit-button {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    margin-bottom: 25px;\n  }\n}\n.edit-button .btn {\n  padding-left: 14px;\n}\n.edit-button #edit-chevron {\n  position: absolute;\n  top: 17px;\n  right: -4px;\n  font-size: 30px;\n}\n.meta-data {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  margin-top: 2em;\n}\n.meta-data div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  margin-right: 2em;\n}\n.meta-data .opponent {\n  max-width: 300px;\n  min-width: 250px;\n}\n.meta-data .opponent-score {\n  max-width: 120px;\n  min-width: 120px;\n}\ninput.form-control.stats-input {\n  margin: 0 auto;\n  width: 50px;\n  height: 0;\n  background-color: #f5f5f5;\n  font-size: 14px;\n  box-sizing: initial;\n}\n.form-group .new-stats {\n  vertical-align: middle;\n  min-width: 96px;\n}\n.stats-table tr.no-hover:hover td,\n.stats-table tr.form-group:hover td {\n  background-color: #fff !important;\n  border: 1px solid #cacaca !important;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _StatsScrollSpy = require('../mixins/StatsScrollSpy.js');

var _StatsScrollSpy2 = _interopRequireDefault(_StatsScrollSpy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'EditBasketballStats',

	props: ['stats', 'players', 'event', 'team', 'editEvent', 'playerCols', 'teamCols'],

	mixins: [_StatsScrollSpy2.default],

	data: function data() {
		return {
			newStats: [],
			teamStats: {},
			meta: {
				opp: '',
				oppScore: '',
				teamScore: ''
			}
		};
	},


	watch: {

		// if stats change, reinitialize the page
		stats: function stats() {
			this.compile();
		},


		// if the viewed event changes, reinitialize the page
		event: function event() {
			this.compile();
		}
	},

	computed: {
		newPlayerCols: function newPlayerCols() {
			var index;
			var newCols = JSON.parse((0, _stringify2.default)(this.playerCols));

			var ditch = ['date', 'win', 'opp', 'gs', 'gp', 'efg_', 'astto', 'ts_', 'per', 'eff', 'dd2', 'td3'];
			ditch.forEach(function (stat) {
				var index = newCols.indexOf(stat);
				if (index !== -1) {
					newCols.splice(index, 1);
				}
			});

			return newCols;
		},
		newTeamCols: function newTeamCols() {
			var index;
			var newCols = [];

			this.newPlayerCols.forEach(function (val) {
				newCols.push(val);
			});

			var ditch = ['name', 'dnp'];
			ditch.forEach(function (stat) {
				var index = newCols.indexOf(stat);
				if (index !== -1) {
					newCols.splice(index, 1);
				}
			});

			return newCols;
		}
	},

	methods: {
		compile: function compile() {
			var newStats = [];
			var IDs = [];

			this.meta.opp = '';
			this.meta.oppScore = '';
			this.meta.teamScore = '';

			// first initialize newStats with any existing data
			for (var x = 0; x < this.stats.length; x++) {
				var curr = this.stats[x];

				// catch the team stats for this event
				if (curr.type === 'team') {
					// initialize meta data
					var meta = JSON.parse(curr.meta);
					this.meta.opp = meta.opp;
					this.meta.oppScore = meta.oppScore;
					continue;
				}

				if (IDs.indexOf(curr.member_id) !== -1) {
					// this player's stats already parsed (error somewhere down the road)
					continue;
				}

				var player = this.players.filter(function (player) {
					return player.member_id === curr.member_id;
				});

				var stats = JSON.parse(curr.stats);

				stats['id'] = curr.owner_id;
				stats['member_id'] = curr.member_id;
				stats['name'] = player[0].abbrName;

				newStats.push(stats);
				IDs.push(curr.member_id);
			}

			for (var x = 0; x < this.players.length; x++) {
				var curr = this.players[x];
				var emptyStats = {};

				if (IDs.indexOf(curr.member_id) !== -1)
					// this player's stats already parsed, don't create empty row
					continue;

				this.newPlayerCols.forEach(function (col) {
					emptyStats[col] = '';
				});
				emptyStats.id = curr.id;
				emptyStats.member_id = curr.member_id;
				emptyStats.name = curr.abbrName;
				emptyStats.starter = false;
				emptyStats.dnp = false;

				newStats.push(emptyStats);
			}

			this.newStats = newStats;

			this.initScrollSpy();
		},


		// attach listeners for whether or not to show SCROLL > indicators
		initScrollSpy: function initScrollSpy() {
			setTimeout(function () {
				this.attachScrollListener('#editTeamStatsDiv', 'teamStats');
				this.attachScrollListener('#editPlayerStatsDiv', 'playerStats');
			}.bind(this), 500);
		},


		// decide whether or not this stat column needs special formatting
		specialRow: function specialRow(col) {
			if (col === 'name' || col === 'starter' || col === 'dnp') return true;
			if (col[col.length - 1] === '_') return true;

			return false;
		},


		// submit to database
		submitStats: function submitStats() {
			// check that the inputs are error free
			var errors = this.errorCheck();

			if (!errors) {

				// did these stats exist and were then updated?
				var statsAreNew = this.stats.length ? false : true;

				// store how many points team had (for status update meta data)
				this.meta.teamScore = this.teamStats.pts;
				this.meta.team = this.team.name;
				var self = this;
				var data = {
					playerStats: this.newStats,
					teamStats: this.teamStats,
					event: this.event.id,
					team: this.team,
					meta: this.meta
				};

				// save as a new event
				if (statsAreNew) {
					var url = this.$parent.prefix + '/stats';
					this.$http.post(url, data).then(function (response) {
						// send a stats updated event to parent
						if (response.data.ok) {
							self.$dispatch('newStats', response.data.stats, response.data.feed);
							$('#viewEventModal').modal('hide');
							self.stats = {};
							self.compile();
							self.$root.banner("good", 'Stats saved');
						} else {
							// they weren't allowed to add stats
							self.$root.banner('bad', response.data.error);
						}
					}).catch(function () {
						self.$root.errorMsg();
					});
				}

				// update existing stats
				else {
						var url = this.$parent.prefix + '/stats';
						this.$http.put(url, data).then(function (response) {
							if (response.data.ok) {
								self.$dispatch('updateStats', response.data, this.event);
								$('#viewEventModal').modal('hide');
								self.stats = {};
								self.compile();
								self.$root.banner("good", 'Stats saved');
							} else {
								// they weren't allowed to update stats
								self.$root.banner('bad', response.data.error);
							}
						}).catch(function () {
							self.$root.errorMsg();
						});
					}
			}
		},


		// throw away inputted data
		discardStats: function discardStats() {
			$('#viewEventModal').modal('hide');
			this.compile();
		},
		deleteStats: function deleteStats() {
			$('#viewEventModal').modal('hide');
			this.$dispatch('deleteStats', this.event);
			this.stats = {};
			this.compile();

			var self = this;
			var name = this.$route.params.name;
			var prefix = this.$parent.prefix;
			var url = prefix + name + '/stats/' + this.event.id;
			this.$http.delete(url).then(function (response) {
				self.$root.banner('good', "Stats deleted");
			}).catch(function () {
				self.$root.errorMsg();
			});
		},


		// calculates and saves the total for that field
		// accepts everything except the percentage cols
		team_total: function team_total(col) {
			var stats = this.newStats;
			var total = 0;
			for (var x = 0; x < stats.length; x++) {
				if (stats[x][col] === '') total += 0;else total += stats[x][col];
			}
			this.teamStats[col] = total;
			return total;
		},


		// calculates and saves percentages for team
		// accepts fg, ft, threep for cols
		// e.g. col == 'fg', var p = 'fg_'
		team_percent: function team_percent(col) {
			var stats = this.newStats;
			var m = col + 'm';
			var a = col + 'a';
			var p = col + '_';
			var makes = 0;
			var attempts = 0;
			var percent = 0;
			for (var x = 0; x < stats.length; x++) {
				// first check if makes > attempts, return percent > 100
				// the 'percentage' filter turns this into 'ERROR'
				if (stats[x][m] > stats[x][a]) {
					percent = 101;
					this.teamStats[p] = 101;
					return percent;
				}
				if (stats[x][m] === '') makes += 0;else makes += stats[x][m];

				if (stats[x][attempts] === '') attempts += 0;else attempts += stats[x][a];
			}
			percent = makes / attempts;

			// make into percentage with one decimal place accuracy
			percent = Math.round(percent * 100 * 10) / 10;
			if (isNaN(percent)) percent = 0;

			this.teamStats[p] = percent;
			return percent;
		},


		// calculates and saves percentages for this player
		// accepts fg, ft, threep for cols
		// e.g. col == 'fg', var p = 'fg_'
		newStats_percent: function newStats_percent(index, col) {
			var percentage = 0;

			// dynamically picks which stat based on col
			var m = col + 'm';
			var a = col + 'a';
			var p = col + '_';

			if (this.newStats[index][m] === '' || this.newStats[index][a] === '') percentage = 0;else percentage = this.newStats[index][m] / this.newStats[index][a];

			// make into percentage with one decimal place accuracy
			percentage = Math.round(percentage * 100 * 10) / 10;

			if (isNaN(percentage)) percentage = 0;

			this.newStats[index][p] = percentage;
			return percentage;
		},
		errorCheck: function errorCheck() {
			var stats = this.newStats;
			for (var x = 0; x < stats.length; x++) {
				if (stats[x].fg_ > 100) {
					this.errorMessage('FG');
					return true;
				}
				if (stats[x].threep_ > 100) {
					this.errorMessage('3P');
					return true;
				}
				if (stats[x].ft_ > 100) {
					this.errorMessage('FT');
					return true;
				}
			}

			if (!(0, _isInteger2.default)(this.meta.oppScore)) {
				this.$root.popup('bad', 'Error in Stats!', 'Check that the Opponent\'s score is a number.');
				return true;
			}

			return false;
		},


		// displays a customized error message depending on which stat category was incorrect
		errorMessage: function errorMessage(col) {
			this.$root.popup("bad", "Error in stats!", "One of the " + col + "M entries is greater than " + col + "A, please correct first. Look for the row with ERROR in " + col + "%");
		}
	}

};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\n<div id=\"statsWrapper\">\n\n\t<!-- if user clicks this, show form to edit event details, value travels up to ViewEvent.vue -->\n\t<div class=\"edit-button\">\n\t\t<a class=\"btn btn-primary --chevron --lg\" @click=\"editEvent = true\">\n\t\t\tEdit Event Details\n\t\t\t<i class=\"material-icons btn-chevron --right\">chevron_right</i>\n\t\t</a>\n\t</div>\n\n\t<!-- notes to user -->\n\t<div class=\"stat-notes\">\n\t\t<span><strong>Notes about stat entries:</strong></span>\n\t\t<ul>\n\t\t\t<li>\n\t\t\t\t<p>Any fields left empty are treated as zeros.</p>\n\t\t\t</li>\n\t\t\t<li v-show=\"usesMinutes\">\n\t\t\t\t<p>If MIN is zero, that player's stats are treated as a DNP (did not play) and don't count as zeros.</p>\n\t\t\t</li>\n\t\t\t<li v-show=\"!usesMinutes\">\n\t\t\t\t<p>If DNP (did not play) is checked, that player's stats are ignored and don't count as zeros.</p>\n\t\t\t</li>\n\t\t</ul>\n\t</div>\n\n\t<!-- input new stats here -->\n\t<h3>Box Score</h3>\n\t<form @submit.prevent=\"\">\n\t\t<div v-if=\"overflowed.playerStats\" class=\"Stats__overflow\">\n\t\t\t<span class=\"--left\" v-show=\"overflowed.playerStats.first\">\n\t\t\t\t<i class=\"material-icons\">chevron_left</i>SCROLL\n\t\t\t</span>\n\t\t\t<span class=\"--right\" v-show=\"overflowed.playerStats.last\">\n\t\t\t\tSCROLL<i class=\"material-icons\">chevron_right</i>\n\t\t\t</span>\n\t\t</div>\t\t\n\t\t<div id=\"editPlayerStatsDiv\" class=\"table-responsive stats-container\">\n\t\t\t<table class=\"table stats-table\">\n\t\t\t\t<thead>\n\t\t    \t<tr>\n\t\t      \t<th v-for=\"col in newPlayerCols\" class=\"stat-columns text-center\" data-toggle=\"tooltip\" :title=\"col | basketballTooltips\">\n\t\t      \t\t{{ col | basketballStats }}\n\t\t      \t</th>\n\t\t    \t</tr>\n\t\t  \t</thead>\n\t\t  \t<tbody>\n\t\t    \t<tr v-for=\"(index, row) in newStats | orderBy 'lastname'\" class=\"form-group\">\n\t\t\t      <td v-for=\"col in newPlayerCols\" class=\"new-stats stat-entries text-center\">\n\t\t\t      \t<!-- span inserts calculated data that isn't inputted by user -->\n\t\t\t      \t<span v-if=\"specialRow(col)\">\n\t\t\t      \t\t<span v-if=\"col === 'name'\">{{ row[col] }}</span>\n\t\t\t      \t\t<input v-if=\"col === 'starter'\" type=\"checkbox\" v-model=\"newStats[index][col]\">\n\t\t\t      \t\t<input v-if=\"col === 'dnp' &amp;&amp; ! usesMinutes\" type=\"checkbox\" v-model=\"newStats[index][col]\">\n\t\t\t      \t\t<span v-if=\"col === 'fg_'\">{{ newStats_percent(index, 'fg') | checkPercentage }}</span>\n\t\t\t      \t\t<span v-if=\"col === 'ft_'\">{{ newStats_percent(index, 'ft') | checkPercentage }}</span>\n\t\t\t      \t\t<span v-if=\"col === 'threep_'\">{{ newStats_percent(index, 'threep') | checkPercentage }}</span>\n\t\t\t      \t</span>\n\t\t\t      \t<input v-else=\"\" type=\"text\" class=\"form-control stats-input text-center\" autocomplete=\"off\" :placeholder=\"col | basketballStats\" v-model=\"newStats[index][col]\" number=\"\">\n\t\t\t      </td>\n\t\t    \t</tr>\n\t\t  \t</tbody>\n\t\t\t</table>\n\t\t</div>\n\n\t\t<div class=\"meta-data\">\n\t\t\t<div class=\"form-group opponent\">\n\t\t\t\t<label for=\"opp\">Opponent</label>\n\t\t\t\t<input name=\"opp\" type=\"text\" class=\"form-control\" required=\"\" autocomplete=\"off\" v-model=\"meta.opp\">\n\t\t\t</div>\n\t\t\t<div class=\"form-group opponent-score\">\n\t\t\t\t<label for=\"oppScore\">Opponent Score</label>\n\t\t\t\t<input name=\"oppScore\" type=\"text\" class=\"form-control\" number=\"\" required=\"\" autocomplete=\"off\" v-model=\"meta.oppScore\">\n\t\t\t</div>\n\t\t</div>\n\n\t\t<!-- compiled team stats table -->\n\t\t<h3>Team Stats</h3>\n\t\t<div v-if=\"overflowed.teamStats\" class=\"Stats__overflow\">\n\t\t\t<span class=\"--left\" v-show=\"overflowed.teamStats.first\">\n\t\t\t\t<i class=\"material-icons\">chevron_left</i>SCROLL\n\t\t\t</span>\n\t\t\t<span class=\"--right\" v-show=\"overflowed.teamStats.last\">\n\t\t\t\tSCROLL<i class=\"material-icons\">chevron_right</i>\n\t\t\t</span>\n\t\t</div>\t\t\n\t\t<div id=\"editTeamStatsDiv\" class=\"table-responsive stats-container\">\n\t\t\t<table class=\"table table-striped stats-table\">\n\t\t\t\t<thead>\n\t\t    \t<tr>\n\t\t      \t<th v-for=\"col in newTeamCols\" class=\"stat-columns text-center\" data-toggle=\"tooltip\" :title=\"col | basketballTooltips\">\n\t\t      \t\t{{ col | basketballStats }}\n\t\t      \t</th>\n\t\t    \t</tr>\n\t\t  \t</thead>\n\t\t  \t<tbody>\n\t\t    \t<tr class=\"no-hover\">\n\t\t\t      <td v-for=\"col in newTeamCols\" class=\"stat-entries\">\n\t\t\t      <!-- span inserts calculated percentages instead of totals -->\n\t\t\t      \t<span v-if=\"specialRow(col)\">\n\t\t\t\t      \t<span v-if=\"col === 'fg_'\">{{ team_percent('fg') | checkPercentage }}</span>\n\t\t\t\t      \t<span v-if=\"col === 'threep_'\">{{ team_percent('threep') | checkPercentage }}</span>\n\t\t\t\t      \t<span v-if=\"col === 'ft_'\">{{ team_percent('ft') | checkPercentage }}</span>\n\t\t\t\t      </span>\n\t\t\t      \t<span v-else=\"\">{{ team_total(col) }}</span>\n\t\t\t      </td>\n\t\t    \t</tr>\n\t\t  \t</tbody>\n\t\t\t</table>\n\t\t</div>\n\n    <div class=\"row\">\n      <div class=\"col-xs-6 col-xs-offset-3 col-sm-4 col-md-2\" :class=\"[stats.length ? 'col-md-offset-3' : 'col-md-offset-4',\n      \t\t\t         stats.length ? 'col-sm-offset-0' : 'col-sm-offset-2']\">\n      \t<input type=\"submit\" class=\"btn btn-block btn-primary btn-md\" value=\"SAVE\">\n      </div>\n      <div class=\"col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0 col-md-2\" v-show=\"stats.length\">\n      \t<a @click=\"deleteStats()\" class=\"btn btn-block btn-delete btn-md\">DELETE</a>\n      </div>\n      <div class=\"col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0 col-md-2\">\n      \t<a @click=\"discardStats()\" class=\"btn btn-block btn-cancel btn-md outline\">CANCEL</a>\n      </div>\n    </div>\n\n\t</form>\n</div>\n\t\n\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["#statsWrapper {\n  padding: 1.5em;\n}\n#statsWrapper h3 {\n  margin-top: 2em;\n}\n.stats-radio {\n  padding-left: 3em;\n}\n.stat-notes {\n  margin-bottom: 20px;\n}\n.edit-button {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n}\n@media screen and (max-width: 767px) {\n  .edit-button {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    margin-bottom: 25px;\n  }\n}\n.edit-button .btn {\n  padding-left: 14px;\n}\n.edit-button #edit-chevron {\n  position: absolute;\n  top: 17px;\n  right: -4px;\n  font-size: 30px;\n}\n.meta-data {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  margin-top: 2em;\n}\n.meta-data div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  margin-right: 2em;\n}\n.meta-data .opponent {\n  max-width: 300px;\n  min-width: 250px;\n}\n.meta-data .opponent-score {\n  max-width: 120px;\n  min-width: 120px;\n}\ninput.form-control.stats-input {\n  margin: 0 auto;\n  width: 50px;\n  height: 0;\n  background-color: #f5f5f5;\n  font-size: 14px;\n  box-sizing: initial;\n}\n.form-group .new-stats {\n  vertical-align: middle;\n  min-width: 96px;\n}\n.stats-table tr.no-hover:hover td,\n.stats-table tr.form-group:hover td {\n  background-color: #fff !important;\n  border: 1px solid #cacaca !important;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-1c7772b6", module.exports)
  } else {
    hotAPI.update("_v-1c7772b6", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"../mixins/StatsScrollSpy.js":73,"babel-runtime/core-js/json/stringify":2,"babel-runtime/core-js/number/is-integer":3,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],60:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".edit-stats-button {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n}\n@media screen and (max-width: 767px) {\n  .edit-stats-button {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n  }\n}\n.edit-stats-button .btn {\n  padding-left: 14px;\n}\n.edit-stats-button #edit-chevron {\n  position: absolute;\n  top: 17px;\n  right: -4px;\n  font-size: 30px;\n}\n.edit-submit-buttons {\n  margin-bottom: 20px;\n}\ndiv[EditEvent=\"fromTime\"],\ndiv[EditEvent=\"toTime\"] {\n  margin-top: 10px;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'EditEvent',

	props: ['event', 'events', 'editEvent'],

	data: function data() {

		return {
			fromDate: '',
			fromTime: '',
			toDate: '',
			toTime: '',
			backup: {},
			toPickerChange: false
		};
	},


	watch: {
		event: function event(val, old) {
			// wait for an new event to be clicked
			if (this.event.id) this.initialize();else return;
		}
	},

	computed: {
		// figure out if this event is a game
		isGame: function isGame() {
			return this.event.type === 1 || this.event.type === 2;
		}
	},

	methods: {

		// save button was hit
		updateEvent: function updateEvent() {

			var momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			var momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');

			this.event.start = momentFrom.unix();
			this.event.end = momentTo.unix();

			var self = this;
			var url = this.$parent.prefix + "/event/" + this.event.id;
			this.$http.put(url, this.event).then(function (response) {

				var events = response.data.events;
				var feed = response.data.feed;

				self.$dispatch('updateEvent', events, feed);

				// hide the modal
				$('#viewEventModal').modal('hide');

				// show success banner
				self.$root.banner('good', "Event saved");
			}).catch(function (response) {
				self.$root.errorMsg();
			});
		},


		// delete button was hit
		deleteEvent: function deleteEvent(confirmed) {

			if (this.editEvent && !confirmed) {
				// prompt user 'are you sure?' because there may be attached stats
				this.promptForDelete();
				return;
			}

			var self = this;
			var url = this.$parent.prefix + "/event/" + this.backup.id;
			this.$http.delete(url).then(function (response) {
				if (!response.data.ok) {
					throw response.data.error;
				}

				var events = response.data.events;
				var feed = response.data.feed;

				self.$dispatch('deleteEvent', events, feed);

				$('#viewEventModal').modal('hide');

				// show success banner
				self.$root.banner('good', "Event deleted");
			}).catch(function (response) {
				// show error
				self.$root.errorMsg();
			});
		},


		// display a popup with a yes or no for deleting this event
		promptForDelete: function promptForDelete() {
			swal({
				title: 'Delete Event?',
				text: 'Are you sure you want to delete this event? This will also delete any associated stats!',
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: '#C90019',
				cancelButtonColor: 'whitesmoke',
				confirmButtonText: 'DELETE',
				cancelButtonText: 'CANCEL',
				allowOutsideClick: true,
				closeOnConfirm: true
			}, function (confirm) {
				if (confirm)
					// confirm delete
					this.deleteEvent(true);
			}.bind(this));
		},


		// cancel button was hit
		cancel: function cancel() {
			this.event = this.backup;
			this.editEvent = false;
			this.initialize();
			$('#viewEventModal').modal('hide');
		},


		// initialize data and get date/time pickers ready
		initialize: function initialize() {

			// make a backup of event so changes aren't reflected in rest of app unless saved
			this.backup = JSON.parse((0, _stringify2.default)(this.event));

			// init moment instances, milliseconds
			this.fromDate = moment(this.event.start * 1000);
			this.fromTime = moment(this.event.start * 1000);
			this.toDate = moment(this.event.end * 1000);
			this.toTime = moment(this.event.end * 1000);

			// initialize the jquery and event data
			$(function () {

				// init selectpicker, set to correct type
				$('.selectpicker[EditEvent]').selectpicker();
				$('.selectpicker[EditEvent]').selectpicker('val', this.event.type);

				// datepickers for adding events
				var fromPicker = $('[EditEvent="fromDate"]');
				var toPicker = $('[EditEvent="toDate"]');
				var fromPickerTime = $('[EditEvent="fromTime"]');
				var toPickerTime = $('[EditEvent="toTime"]');

				fromPicker.datetimepicker({
					allowInputToggle: true,
					focusOnShow: true,
					format: 'MMM D, YYYY',
					defaultDate: this.fromDate
				}).on('dp.change', function (e) {
					if (!e.date) {
						this.fromDate = '';
						return;
					}

					// when 'from' changes, save this new date into the state
					// set 'to' date so it doesn't end before it starts
					this.fromDate = e.date.format('MMM D, YYYY');
					toPicker.data('DateTimePicker').minDate(e.date);

					if (!this.toPickerChange) {
						// if the toPicker (date) hasn't been manually set yet, default it to this new fromDate 
						toPicker.data('DateTimePicker').date(e.date);
					}
				}.bind(this));

				toPicker.datetimepicker({
					allowInputToggle: true,
					focusOnShow: true,
					format: 'MMM D, YYYY',
					defaultDate: this.toDate
				}).on('dp.change', function (e) {
					if (!e.date) {
						this.toDate = '';
						return;
					}
					this.toPickerChange = true;
					this.toDate = e.date.format('MMM D, YYYY');
				}.bind(this));

				fromPickerTime.datetimepicker({
					stepping: 5,
					allowInputToggle: true,
					focusOnShow: true,
					format: 'h:mm a',
					defaultDate: this.fromDate
				}).on('dp.change', function (e) {
					if (!e.date) {
						this.fromTime = '';
						return;
					}
					this.fromTime = e.date.format('h:mm a');
				}.bind(this));

				toPickerTime.datetimepicker({
					stepping: 5,
					allowInputToggle: true,
					focusOnShow: true,
					format: 'h:mm a',
					defaultDate: this.toDate
				}).on('dp.change', function (e) {
					if (!e.date) {
						this.toTime = '';
						return;
					}
					this.toTime = e.date.format('h:mm a');
				}.bind(this));

				this.toPickerChange = false;
				this.fromDate = moment(this.event.start * 1000).format('MMM D, YYYY');
				this.fromTime = moment(this.event.start * 1000).format('h:mm a');
				this.toDate = moment(this.event.end * 1000).format('MMM D, YYYY');
				this.toTime = moment(this.event.end * 1000).format('h:mm a');
			}.bind(this));
		},


		// make sure there are no errors before saving data
		errorCheck: function errorCheck() {
			var errors = 0;

			if (!this.event.title.length) {
				errors++;
				this.errors.title = 'Enter a title';
			} else {
				this.errors.title = '';
			}

			if (!this.toDate.length || !this.toTime.length) {
				errors++;
				this.errors.end = 'Choose an end date and time';
			} else {
				this.errors.end = '';
			}

			if (!this.fromDate.length || !this.fromTime.length) {
				errors++;
				this.errors.start = 'Choose an end date and time';
			} else {
				this.errors.start = '';
			}

			if (this.repeats) {
				if (!this.repeatDays.length) {
					errors++;
					this.errors.repeatDays = 'Which days does it repeat?';
				} else {
					this.errors.repeatDays = '';
				}
				if (!this.until.length) {
					errors++;
					this.errors.until = 'When does it repeat until?';
				} else {
					this.errors.until = '';
				}
			}

			if (errors) {
				// if any of these failed, solve those issues first
				return errors;
			}

			// check for end dates < start dates
			// until dates < end dates
			var momentTo = moment(this.toDate + ' ' + this.toTime, 'MMM D, YYYY h:mm a');
			var momentFrom = moment(this.fromDate + ' ' + this.fromTime, 'MMM D, YYYY h:mm a');
			var momentUntil = moment(this.until, 'MMM D, YYYY');

			if (!momentTo.isAfter(momentFrom)) {
				errors++;
				this.errors.end = 'Ends before it starts';
			} else {
				this.errors.end = '';
			}

			if (!momentUntil.isAfter(momentTo) && this.repeats) {
				errors++;
				this.errors.until = 'Stops repeating before the event ends';
			} else {
				this.errors.until = '';
			}

			return errors;
		}
	}

};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t\n  <div class=\"col-xs-12\">\n\n\t\t<!-- if user clicks this, show form to edit stats, value syncs up to ViewEvent.vue -->\n  \t<div v-if=\"editEvent\" class=\"edit-stats-button\">\n\t\t\t<a class=\"btn btn-primary --chevron --md\" @click=\"editEvent = false\">\n\t\t\t\tEdit Stats \n\t\t\t\t<i class=\"material-icons btn-chevron --right\">chevron_right</i>\n\t\t\t</a>\n\t\t</div>\n\n    <form @submit.prevent=\"updateEvent()\">\n\n\t    <div class=\"row\">\n        <div class=\"form-group\">\n          <div class=\"col-xs-12 col-sm-6\">\n            <label for=\"title\">Title</label>\n            <input class=\"form-control input-lg\" name=\"title\" type=\"text\" autocomplete=\"off\" required=\"\" v-model=\"event.title\">\n          </div>\n          <div class=\"col-xs-12 col-sm-6 type-select\">\n            <label for=\"class\">Type</label>\n            <select data-style=\"btn-select btn-lg\" name=\"class\" class=\"selectpicker form-control show-tick\" editevent=\"\" v-model=\"event.type\" number=\"\">\n              <option value=\"practice\" class=\"practice\">Practice</option>    \n              <option value=\"home_game\" class=\"homeGame\">Home Game</option>\n              <option value=\"away_game\" class=\"awayGame\">Away Game</option>\n              <option value=\"other\" class=\"other\">Other</option>\n            </select>\n          </div>\n        </div>\n\t    </div>\n    \t<br>\n\t    <div class=\"row\">\n        <div class=\"col-xs-12 col-sm-6\">\n          <div class=\"form-group\">\n            <label for=\"from\">Starts at</label>\n            <!-- from - date -->\n            <div class=\"input-group date\" editevent=\"fromDate\">\n          \t\t<input type=\"text\" class=\"form-control\" required=\"\">\n              <span class=\"input-group-addon\">\n              \t<span class=\"glyphicon glyphicon-calendar\"></span>\n              </span>\n            </div>\n            <!-- from - time -->\n            <div class=\"input-group date\" editevent=\"fromTime\">\n              <input type=\"text\" class=\"form-control\" required=\"\">\n              <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-time\"></span>\n              </span>\n            </div>\n          </div>\n        </div>\n        <div class=\"col-xs-12 col-sm-6\">\n          <div class=\"form-group\">\n            <label for=\"to\">Ends at</label>\n            <!-- to - date -->\n            <div class=\"input-group date\" editevent=\"toDate\">\n              <input type=\"text\" class=\"form-control\" required=\"\">\n              <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-calendar\"></span>\n              </span>\n            </div>\n            <!-- to - time -->\n            <div class=\"input-group date\" editevent=\"toTime\">\n              <input type=\"text\" class=\"form-control\" required=\"\">\n              <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-time\"></span>\n              </span>\n            </div>\n          </div>\n        </div>\n\t    </div>\n\t    <br>\n\t    <div class=\"row\">\n\t      <div class=\"col-xs-12\">\n\t        <label for=\"details\">Extra details about this event</label>\n\t        <textarea v-autosize=\"event.details\" rows=\"1\" class=\"form-control\" maxlength=\"5000\" autocomplete=\"off\" v-model=\"event.details\">{{ event.details }}</textarea>\n\t      </div>\n\t    </div>\n\t    <hr>\n\t    <br>\n\t\t\t<div class=\"row edit-submit-buttons\">\n\t\t    <div class=\"col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-1\">\n\t\t    \t<input class=\"btn btn-primary btn-block btn-md btn-first\" tabindex=\"4\" type=\"submit\" value=\"SAVE\">\n\t\t    </div>\n\t\t    <div class=\"col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-0\">\n\t\t    \t<input class=\"btn btn-delete btn-block btn-md\" tabindex=\"5\" value=\"DELETE\" @click=\"deleteEvent(false)\">\n\t\t    </div>\n\t\t    <div class=\"col-xs-4 col-xs-offset-4 col-sm-3 col-sm-offset-0\">\n\t\t    \t<input class=\"btn btn-cancel btn-block btn-md outline\" tabindex=\"6\" value=\"CANCEL\" @click=\"cancel()\">\n\t\t    </div>\n\t    </div>\n\t\t</form></div>\n\t\n\n\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".edit-stats-button {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n}\n@media screen and (max-width: 767px) {\n  .edit-stats-button {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n  }\n}\n.edit-stats-button .btn {\n  padding-left: 14px;\n}\n.edit-stats-button #edit-chevron {\n  position: absolute;\n  top: 17px;\n  right: -4px;\n  font-size: 30px;\n}\n.edit-submit-buttons {\n  margin-bottom: 20px;\n}\ndiv[EditEvent=\"fromTime\"],\ndiv[EditEvent=\"toTime\"] {\n  margin-top: 10px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-2402af76", module.exports)
  } else {
    hotAPI.update("_v-2402af76", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"babel-runtime/core-js/json/stringify":2,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],61:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".EditUser {\n  background: #fff;\n}\n.EditUser__role {\n  margin-bottom: 25px;\n}\n.EditUser__data {\n  margin-bottom: 25px;\n}\n.EditUser__buttons {\n  margin-bottom: 12px;\n}\n.EditUser__confirm .kick {\n  width: 100%;\n  text-align: center;\n  margin-bottom: 35px;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Validator = require('./../mixins/Validator.js');

var _Validator2 = _interopRequireDefault(_Validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'EditUser',

	props: ['user', 'positions'],

	mixins: [_Validator2.default],

	data: function data() {

		return {
			ghostEmail: false,
			adminOptions: {
				state: this.user.isAdmin,
				onText: 'YES',
				offText: 'NO',
				onSwitchChange: function (e, state) {
					this.user.isAdmin = state;
				}.bind(this)
			},
			confirmKick: false,
			kickButton: '',
			kickMsg: '',
			kickText: ''
		};
	},
	beforeCompile: function beforeCompile() {
		this.setErrorChecking();
	},


	computed: {
		role: function role() {
			return this.user.role;
		}
	},

	watch: {

		//if user changed, set inputs to correct new states
		user: function user() {
			this.initialize();
		},


		//if role changed, set inputs to correct new states
		role: function role() {
			this.initialize();
		}
	},

	events: {
		EditUser_update: function EditUser_update(response) {
			$('#rosterModal').modal('hide');
			this.$dispatch('Team_updated_members', response.data.members);
			this.$root.banner('good', "User saved");
		}
	},

	methods: {

		//whenever the data reloads, reset the input elements and some logic
		initialize: function initialize() {
			this.confirmKick = false;

			if (this.user.isGhost) {
				if (this.user.meta.email) {
					this.ghostEmail = true;
				} else {
					this.ghostEmail = false;
				}
			}

			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch(this.adminOptions);
			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch('state', this.user.isAdmin);

			$('.selectpicker[EditUser]').selectpicker({
				noneSelectedText: 'None'
			}).selectpicker('refresh');

			this.setErrorChecking();
		},
		setErrorChecking: function setErrorChecking() {
			this.registerErrorChecking('user.meta.num', 'jersey', 'Choose between 00-99');

			// extra details to check if editing a ghost
			if (this.user.isGhost) {
				this.registerErrorChecking('user.meta.firstname', 'required', 'Enter a first name');
				this.registerErrorChecking('user.meta.lastname', 'required', 'Enter a last name');
				this.registerErrorChecking('user.meta.email', 'email', 'Invalid email');
			}
		},


		//send ajax request to save data
		save: function save() {
			if (this.errorCheck() > 0) {
				return;
			}

			if (this.user.new) {
				this.newUser();
			} else {
				this.updateUser();
			}
		},


		//send post request to server to save new user
		newUser: function newUser() {
			var self = this;
			var url = this.$parent.prefix + '/member';
			var data = {
				name: this.user.meta.ghost.name,
				email: this.user.meta.ghost.email,
				role: this.user.role
			};

			this.$http.post(url, data).then(function (response) {
				if (!response.data.ok) throw response.data.error;

				$('#rosterModal').modal('hide');
				self.$dispatch('newUser', response.data.user);
				self.$root.banner('good', "User created");
			}).catch(function (error) {
				self.$root.errorMsg(error);
			});
		},


		//send put request to server to update user
		updateUser: function updateUser() {
			$('#rosterModal').modal('hide');

			var self = this;
			var url = this.$parent.prefix + '/member/' + this.user.member_id;
			var switchRole = false;
			if (this.user.isPlayer && (this.user.role === 'coach' || this.user.role === 'ghost_coach')) switchRole = true;
			if (this.user.isCoach && (this.user.role === 'player' || this.user.role === 'ghost_player')) switchRole = true;
			var data = {
				meta: this.user.meta,
				isGhost: this.user.isGhost,
				role: switchRole,
				admin: this.user.isAdmin
			};
			this.$root.put(url, 'EditUser_update', data);
		},


		//close modal
		cancel: function cancel() {
			$('#rosterModal').modal('hide');
		},


		//show popup asking to confirm the kick, send event to Team if they do
		kick: function kick(confirm) {
			if (typeof confirm !== 'boolean') {
				//they need to first confirm their decision to kick
				this.confirm();
				return;
			}

			if (!confirm) {
				//they don't want to kick
				this.confirmKick = false;
				return;
			}

			if (this.user.ghost) {
				var msg = 'Ghost deleted';
			} else if (this.user.isFan) {
				var msg = 'Fan removed';
			} else {
				var msg = 'User kicked, replaced with ghost';
			}

			//tell server about new changes
			var data = { user: this.user };
			var self = this;
			this.$http.delete(this.$parent.prefix + '/user', data).then(function (response) {
				if (!response.data.ok) throw response.data.error;

				var user = response.data.user;
				if (!user) {
					user = { deleted: true, member_id: self.user.member_id };
				}

				self.confirmKick = false;

				self.$dispatch('deleteUser', user);
				self.$root.banner('good', msg);
				$('#rosterModal').modal('hide');
			}).catch(function (error) {
				self.$root.errorMsg(error);
			});

			return;
		},


		//change the popup so they can confirm their kick on a player
		confirm: function confirm() {
			if (this.user.isFan) {
				//this is a fan
				this.kickMsg = 'Remove ' + this.user.firstname + ' as a fan?';
				this.kickText = '';
				this.kickButton = 'REMOVE';
			} else if (this.user.isGhost) {
				//they're a ghost, stats will be deleted too
				this.kickMsg = 'Delete this ghost?';
				this.kickText = 'If you delete this ghost, all associated stats will be deleted as well.';
				this.kickButton = 'DELETE';
			} else {
				//they're kick a player
				this.kickMsg = 'Kick ' + this.user.firstname + ' from the team?';
				this.kickText = "They will be replaced with a ghost user";
				this.kickButton = 'KICK';
			}

			this.confirmKick = true;
		}
	},

	//initialize inputs with jquery
	ready: function ready() {

		var self = this;

		this.initialize();

		$(function () {

			$('.selectpicker[EditUser]').selectpicker({
				noneSelectedText: 'None'
			});

			$('input[bootstrap-switch="EditUser"]').bootstrapSwitch(self.adminOptions);
		});
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t<div class=\"col-xs-12 EditUser\">\n\n\n\t\t<div v-show=\"confirmKick\" class=\"EditUser__confirm\">\n\t\t\t<!-- show this div when user is confirming a kick on someone -->\n\t\t\t<div class=\"row kick\">\n\t\t\t\t<h3>{{ kickMsg }}</h3>\n\t\t\t\t<p>{{ kickText }}</p>\n\t\t\t</div>\n\t\t\t<div class=\"row EditUser__buttons\">\n\t\t    <div class=\"col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-2\">\n\t\t    \t<a class=\"btn btn-delete btn-block btn-md\" @click=\"kick(true)\">{{ kickButton }}</a>\n\t\t    </div>\n\t\t    <div class=\"col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-1\">\n\t\t    \t<a class=\"btn btn-cancel btn-block btn-md outline\" @click=\"kick(false)\">CANCEL</a>\n\t\t    </div>\n\t\t  </div>\n\t\t</div>\n\n    <form v-else=\"\" @submit.prevent=\"save()\">\n    \t<div v-if=\"!user.new\" class=\"row EditUser__role\">\n\t    \t<div v-if=\"user.isCoach || user.isPlayer\" class=\"col-xs-6\">\n\t        <label>Is a...</label>\n\t        <select data-style=\"btn-select btn-lg\" edituser=\"\" class=\"selectpicker form-control show-tick\" data-max-options=\"1\" v-model=\"user.role\" number=\"\">\n\t        \t<option v-if=\"user.isGhost\" value=\"ghost_player\">Player</option>    \n\t          <option v-else=\"\" value=\"player\">Player</option>    \n\t          <option v-if=\"user.isGhost\" value=\"ghost_coach\">Coach</option>    \n\t          <option v-else=\"\" value=\"coach\">Coach</option>    \n\t        </select>\n\t      </div>\n\t    </div>\n\t    <div v-if=\"user.isPlayer\" class=\"row EditUser__data\">\n        <div class=\"col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0\">\n          <label for=\"number\">Jersey Number</label>\n          <input type=\"text\" class=\"form-control\" :class=\"{'form-error' : errors.user.meta.num}\" v-model=\"user.meta.num\" @keyup=\"errorCheck('num')\" autocomplete=\"false\" maxlength=\"2\">\n          <span v-show=\"errors.user.meta.num\" class=\"form-error\">{{ errors.user.meta.num }}</span>\n        </div>\n        <div class=\"col-xs-6 col-sm-4\">\n          <label>Primary</label>\n          <select data-style=\"btn-select btn-lg\" edituser=\"position[0]\" class=\"selectpicker form-control show-tick\" multiple=\"\" data-max-options=\"1\" v-model=\"user.meta.positions[0]\">\n            <option v-for=\"position in positions\" :value=\"position\">{{ position | uppercase }}</option>    \n          </select>\n        </div>\n        <div class=\"col-xs-6 col-sm-4\">\n          <label>Secondary</label>\n          <select data-style=\"btn-select btn-lg\" edituser=\"position[1]\" class=\"selectpicker form-control show-tick\" multiple=\"\" data-max-options=\"1\" v-model=\"user.meta.positions[1]\">\n            <option v-for=\"position in positions\" :value=\"position\">{{ position | uppercase }}</option>    \n          </select>\n        </div>  \n\t    </div>\n\n\n\t    <div v-if=\"user.isGhost\" class=\"row EditUser__data\">\n  \t\t\t<div class=\"col-xs-6 col-sm-3\">\n  \t\t\t\t<label>First Name</label>\n  \t\t\t\t<input type=\"text\" class=\"form-control\" maxlength=\"100\" v-model=\"user.meta.firstname\" required=\"\" :class=\"{'form-error' : errors.user.meta.firstname}\" autocomplete=\"false\">\n  \t\t\t\t<span v-show=\"errors.user.meta.firstname\" class=\"form-error\">{{ errors.user.meta.firstname }}</span>\n  \t\t\t</div>\n  \t\t\t<div class=\"col-xs-6 col-sm-3\">\n  \t\t\t\t<label>Last Name</label>\n  \t\t\t\t<input type=\"text\" class=\"form-control\" maxlength=\"100\" v-model=\"user.meta.lastname\" required=\"\" :class=\"{'form-error' : errors.user.meta.lastname}\" autocomplete=\"false\">\n  \t\t\t\t<span v-show=\"errors.user.meta.lastname\" class=\"form-error\">{{ errors.user.meta.lastname }}</span>\n  \t\t\t</div>\n  \t\t\t<div class=\"col-xs-12 col-sm-6\">\n  \t\t\t\t<label>Email</label>\n  \t\t\t\t<input type=\"text\" class=\"form-control\" :class=\"{ 'form-error' : errors.user.meta.email }\" maxlength=\"100\" v-model=\"user.meta.email\" autocomplete=\"false\">\n\t\t\t\t\t<span v-show=\"errors.user.meta.email\" class=\"form-error\">{{ errors.user.meta.email }}</span>\n\t\t\t\t\t<template v-else=\"\">\n\t\t\t\t\t\t<span v-show=\"ghostEmail\" class=\"input-info\">Editing the email will resend an invitation</span>\n  \t\t\t\t\t<span v-show=\"! ghostEmail\" class=\"input-info\">Invite someone to take this spot!</span>\n\t\t\t\t\t</template>\n  \t\t\t</div>\n\t\t\t</div>\n\t    <div v-if=\"! user.isGhost\" class=\"row\">\n        <div class=\"col-xs-6\">\n          <div class=\"switch-container\">\n\t\t\t\t\t\t<input type=\"checkbox\" bootstrap-switch=\"EditUser\">\n\t\t\t\t\t\t<span class=\"switch-label\">Team Admin</span>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t    </div>\n\n\n\n    \t<hr>\n\t    <div class=\"row EditUser__buttons\">\n\t\t    <div class=\"col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-1\">\n\t\t    \t<a class=\"btn btn-primary btn-block btn-md\" @click=\"save()\">SAVE</a>\n\t\t    </div>\n\t\t    <div class=\"col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-0\">\n\t\t    \t<a v-if=\"!user.new &amp;&amp; !user.isGhost\" class=\"btn btn-delete btn-block btn-md\" @click=\"kick()\">KICK</a>\n\t\t    \t<a v-if=\"!user.new &amp;&amp; user.isGhost\" class=\"btn btn-delete btn-block btn-md\" @click=\"kick()\">DELETE</a>\n\t\t    </div>\n\t\t    <div class=\"col-xs-6 col-xs-offset-3 col-sm-3 col-sm-offset-0\">\n\t\t    \t<a class=\"btn btn-cancel btn-block btn-md outline\" @click=\"cancel()\">CANCEL</a>\n\t\t    </div>\n\t    </div>\n    </form>\n\t</div>\t\n\t\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".EditUser {\n  background: #fff;\n}\n.EditUser__role {\n  margin-bottom: 25px;\n}\n.EditUser__data {\n  margin-bottom: 25px;\n}\n.EditUser__buttons {\n  margin-bottom: 12px;\n}\n.EditUser__confirm .kick {\n  width: 100%;\n  text-align: center;\n  margin-bottom: 35px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-f4673dc2", module.exports)
  } else {
    hotAPI.update("_v-f4673dc2", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"./../mixins/Validator.js":75,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	name: 'GoogleTypeahead',

	props: ['city', 'long', 'lat', 'label', 'error'],

	data: function data() {
		return {
			location: '',
			selected: false
		};
	},


	watch: {
		//if they have edited something previously selected, reset the data
		location: function location(val) {
			if (this.selected) {
				this.selected = false;
				this.city = '';
				this.lat = '';
				this.long = '';
			}
		}
	},

	methods: {
		//format the results into the necessary items
		placeSelected: function placeSelected(place) {
			var address = place.formatted_address.split(',');
			this.city = address[0] + ', ' + address[1][1] + address[1][2];
			this.lat = place.geometry.location.lat();
			this.long = place.geometry.location.lng();
			this.selected = true;
		}
	},

	ready: function ready() {
		var self = this;
		$(function () {
			//when the page is loaded, init google maps api
			var input = document.getElementById('placeSearch');
			var options = {
				types: ['(cities)'],
				componentRestrictions: { country: "us" }
			};
			var autocomplete = new google.maps.places.Autocomplete(input, options);

			//set up listener, tell this.placeSelected when there was a selection
			autocomplete.addListener('place_changed', function () {
				var place = autocomplete.getPlace();
				self.placeSelected(place);
			});
		});
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n<div>\n\t\t<label>{{ label }}</label>\n\t\t<input id=\"placeSearch\" type=\"text\" class=\"form-control\" :class=\"{'form-error' : error}\" v-model=\"location\">\n\t\t<span v-show=\"error\" class=\"form-error\">{{ error }}</span>\n</div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  if (!module.hot.data) {
    hotAPI.createRecord("_v-6e36b7d4", module.exports)
  } else {
    hotAPI.update("_v-6e36b7d4", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":51,"vue-hot-reload-api":25}],63:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".Feed {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  padding: 0px 2em;\n}\n.Feed__line {\n  position: absolute;\n  left: 23px;\n  width: 0;\n  height: 100%;\n  border: 2px dashed #d0d0d0;\n}\n@media screen and (max-width: 500px) {\n  .Feed__line {\n    left: 18px;\n  }\n}\n.Feed__post {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding: 0 2em;\n}\n.Feed__post .Feed__thumbnail {\n  height: 54px;\n  width: 54px;\n  margin-right: 2em;\n  font-size: 18px;\n}\n@media screen and (max-width: 500px) {\n  .Feed__post .Feed__thumbnail {\n    width: 34px;\n    height: 34px;\n  }\n}\n.Feed__write {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  max-width: 775px;\n  margin-bottom: 7em;\n}\n.Feed__write .Feed__input {\n  width: 100%;\n  position: relative;\n}\n.Feed__write .Feed__input .arrow-left {\n  position: absolute;\n  top: 13px;\n  left: -10px;\n}\n@media screen and (max-width: 500px) {\n  .Feed__write .Feed__input .arrow-left {\n    top: 8px;\n  }\n}\n.Feed__write .submit-button:hover {\n  cursor: pointer;\n}\n.Feed__write .submit-button span {\n  font-size: 14px;\n  color: #fff;\n}\n@media screen and (max-width: 500px) {\n  .Feed__write .submit-button span {\n    font-size: 9px;\n  }\n}\n.Feed__day {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  position: relative;\n  min-width: 775px;\n  margin-top: 3em;\n  overflow: hidden;\n}\n@media screen and (max-width: 831px) {\n  .Feed__day {\n    min-width: 0;\n  }\n}\n.Feed__day:first-child {\n  margin-top: 0;\n}\n.Feed__date {\n  text-align: center;\n  margin-bottom: 2em;\n}\n.Feed__date span {\n  color: #9f9f9f;\n  position: relative;\n  padding-left: 25px;\n}\n.Feed__date span i {\n  position: absolute;\n  left: -3px;\n  top: -3px;\n  font-size: 21px;\n}\n.Feed__entry {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin-bottom: 5em;\n}\n.Feed__entry:last-child {\n  margin-bottom: 1em;\n}\n.Feed__text {\n  font-size: 16px;\n  max-width: 700px;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n}\n.Feed__creator {\n  margin-bottom: 1em;\n  font-size: 14px;\n}\n.Feed__timestamp {\n  position: relative;\n  margin-left: 15px;\n  color: #9f9f9f;\n}\n.Feed__timestamp .bullet {\n  position: absolute;\n  left: -13px;\n  top: -5px;\n  font-size: 20px;\n}\n.Feed__timestamp #deleteIcon {\n  font-size: 18px;\n  position: absolute;\n  right: -25px;\n  top: -1px;\n}\n.Feed__timestamp #deleteIcon:hover {\n  cursor: pointer;\n}\n.Feed__subject {\n  margin-bottom: 0.7em;\n}\n.Feed__details {\n  border-left: 5px solid rgba(128,128,128,0.44);\n  font-weight: bold;\n  margin-bottom: 0;\n}\n.Feed__details .win {\n  font-weight: bold;\n}\n.Feed__details .loss {\n  color: #7b7b7b;\n  font-weight: lighter;\n}\n.Feed__entry__date {\n  margin-bottom: 0.7em;\n}\n.Feed__entry__date--canceled {\n  text-decoration: line-through;\n  margin-bottom: 1em;\n}\n.Feed__entry__repeats {\n  margin-bottom: 1em;\n  color: #9f9f9f;\n}\n.Feed__thumbnail {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  padding: 20px;\n  margin-right: 2em;\n  z-index: 10;\n}\n@media screen and (max-width: 500px) {\n  .Feed__thumbnail {\n    width: 30px;\n    height: 30px;\n    margin-right: 2em;\n  }\n}\n.Feed__thumbnail .Feed__icon {\n  font-size: 30px;\n}\n@media screen and (max-width: 500px) {\n  .Feed__thumbnail .Feed__icon {\n    font-size: 18px;\n  }\n}\n.Feed__thumbnail--write {\n  background: #329acf;\n  color: #fff;\n}\n.Feed__thumbnail--stats {\n  background: #f96a04;\n  color: #fff;\n}\n.Feed__thumbnail--newEvent {\n  background: #76af00;\n  color: #fff;\n}\n.Feed__thumbnail--updateEvent {\n  background: #f2d500;\n  color: #fff;\n}\n.Feed__thumbnail--cancelEvent {\n  background: #c90018;\n  color: #fff;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});


// NewsFeed handles some of its own state without notifying parent. this 
// is mostly due to the fact that there are transitions and for the most
// part, the data here is inconsequential to the rest of the page

exports.default = {

	name: 'NewsFeed',

	props: ['type', 'users', 'name', 'feed'],

	data: function data() {

		return {
			newPost: '',
			entries: [[]]
		};
	},


	watch: {
		feed: function feed() {
			this.entries = [[]];
			this.compile();
		}
	},

	events: {
		// new feed entry from Team has been sent
		updateFeed: function updateFeed(entry) {
			// add to the feed, 'true' means this is a brand new post
			this.format(entry, true);
		}
	},

	methods: {

		// iterate through all raw feed data, format and add to the news feed
		compile: function compile() {

			var self = this;
			this.feed.forEach(function (entry) {
				// the 'false' means these aren't brand new posts
				self.format(entry, false);
			});

			this.entries.splice(0, 1); // remove empty placeholder spot in feed array
		},


		// for deciding whether or not to show the 'delete' icon in feed
		// show if owner of entry or if team admin
		showDelete: function showDelete(creator) {
			var admin = this.$parent.admin;
			var auth = this.$parent.auth.id;

			if (this.type === 'team' && admin) return true;else if (this.type === 'team' && creator === auth) return true;else return false;
		},


		// delete an entry in the news feed
		deletePost: function deletePost(entry, index) {

			// remove from the news feed array
			this.entries[index].$remove(entry);

			var self = this;
			var url = this.$parent.prefix + '/feed';
			var data = { id: entry.id };
			this.$http.delete(url, data).then(function (response) {
				// successful ajax request
				self.$root.banner('good', 'This post has been deleted');
			}).catch(function () {
				// failed ajax request
				self.$root.banner('bad', "There was a problem deleting this post, try refreshing the page.");
			});
		},


		// when a fan/coach/player writes to the team wall
		postNewPost: function postNewPost() {

			var entry = {};
			var createdDate = moment();

			entry.date = 'Today';
			entry.creator = this.$parent.auth.id;
			entry.timestamp = createdDate.format('h:mm a'); // timestamp on post
			entry.hoverDate = createdDate.format('M/D/YYYY h:mm:ss a'); // hover text on timestamp
			entry.icon = 'textsms';
			entry.iconClass = 'Feed__thumbnail--write';
			entry.type = 3;
			entry.details = this.newPost;

			this.addToFeed(entry, true);

			this.newPost = '';

			var self = this;
			var url = this.$parent.prefix + '/feed';
			var data = { post: entry.details };
			this.$http.post(url, data).then(function (response) {
				// successful ajax post, dynamically add post to the feed
				self.$root.banner('good', 'Your post has been added to the team feed');

				// attach the correct id now that we have the response back (in case they need to delete their post)
				self.entries[0][0].id = response.data.id;
			}).catch(function () {
				// failed ajax request
				self.$root.banner('bad', "There was a problem with your post, try refreshing the page.");
			});
		},


		// format raw data into news feed
		format: function format(feed, isNewPost) {

			// for each object in news feed, group into which day it was formed on
			var entry = {};
			var meta = JSON.parse(feed.meta);
			var createdDate = moment.utc(feed.created_at, 'YYYY-MM-DD HH:mm:ss').local();

			// create a datestamp for sorting days that have feed entries
			var date = createdDate.format('ddd. MMMM Do');

			// if last year, include year in datestamp
			if (createdDate.isBefore(moment().startOf('year'))) date = createdDate.format('ddd. MMMM Do, YYYY');

			// for readability, if the date is closeby, use human format
			if (moment().subtract(1, 'day').isSame(createdDate, 'day')) date = 'Yesterday';

			if (moment().isSame(createdDate, 'day')) date = 'Today';

			entry.date = date;
			entry.creator = feed.creator_id;
			entry.id = feed.id;
			entry.timestamp = createdDate.format('h:mm a'); // timestamp on post
			entry.hoverDate = createdDate.format('M/D/YYYY h:mm a'); // hover text on timestamp
			entry.type = feed.type;

			if (entry.type <= 2) {
				// event-type feed entries
				entry.title = meta.event.title;
				entry.event_id = meta.event.id;
				entry.start = meta.event.start;
				entry.end = meta.event.end;
				if (entry.type != 2) entry.details = meta.event.details;

				// choose the right icon depending on type
				switch (entry.type) {
					case 0:
						entry.icon = 'add';
						entry.iconClass = 'Feed__thumbnail--newEvent';
						break;
					case 1:
						entry.icon = 'refresh';
						entry.iconClass = 'Feed__thumbnail--updateEvent';
						break;
					case 2:
						entry.icon = 'remove';
						entry.iconClass = 'Feed__thumbnail--cancelEvent';
						break;
				}

				if (meta.repeats) {
					// if this is a repeating event, display which days and until when
					entry.repeats = meta.repeats;
				}
			}

			if (entry.type === 3) {
				// user written post to the team feed
				entry.details = meta.details;
				entry.icon = 'textsms';
				entry.iconClass = 'Feed__thumbnail--write';
				entry.type = 3;
			}

			if (entry.type === 4) {
				// stats for an event have been posted
				entry.title = meta.event.title;
				entry.event_id = meta.event.id;
				entry.icon = 'trending_up';
				entry.iconClass = 'Feed__thumbnail--stats';
				entry.type = 4;
				entry = this.formatGameOutcome(entry, meta);
			}

			// add this entry to the entries array
			this.addToFeed(entry, isNewPost);
		},


		// turn raw data into an array that can be iterated on by Vue
		// first layer of array are days in which something happened on the team page
		// inside those arrays are arrays of this data we just set up above
		// if isNewPost is true, add to top of array (to maintain chronological order)
		addToFeed: function addToFeed(entry, isNewPost) {

			for (var x = 0; x < this.entries.length; x++) {

				if (this.entries[x].length) {
					// there's an entry on this date already, check if correct date
					if (this.entries[x][0].date === entry.date) {
						// this is the correct spot in the array, push new entry
						if (isNewPost) {
							this.entries[x].unshift(entry);
							break;
						} else {
							this.entries[x].push(entry);
							break;
						}
					}
				}

				if (isNewPost) {
					// brand new post, and the date 'Today' doesn't exist (would've stopped in above conditional)
					// add this entry to top of news feed
					this.entries.unshift([entry]);
					break;
				}

				if (x === this.entries.length - 1) {
					// couldn't find a suitable spot, push new date onto array
					this.entries.push([entry]);
					break;
				}
			}
		},


		// returns name of player/coach 
		lookupPlayer: function lookupPlayer(id) {
			// returns the name of the player when given an id
			var match = {};
			match = this.users.filter(function (user) {
				return user.id === id;
			});

			if (match.length) {
				return {
					name: match[0].firstname + " " + match[0].lastname,
					username: match[0].username
				};
			} else {
				return "ERROR";
			}
		},


		// choose css classes for who won, which was home/away
		formatGameOutcome: function formatGameOutcome(entry, meta) {

			if (meta.event.class === 1) {
				// home game
				entry.homeScore = meta.teamScore;
				entry.awayScore = meta.oppScore;
				entry.homeName = meta.team;
				entry.awayName = meta.opp;
			} else {
				// home game
				entry.homeScore = meta.oppScore;
				entry.awayScore = meta.teamScore;
				entry.homeName = meta.opp;
				entry.awayName = meta.team;
			}

			if (entry.awayScore > entry.homeScore) {
				// team won
				entry.awayClass = 'win';
				entry.homeClass = 'loss';
			}
			if (entry.awayScore < entry.homeScore) {
				// team won
				entry.awayClass = 'loss';
				entry.homeClass = 'win';
			}
			if (entry.awayScore === entry.homeScore) {
				// team won
				entry.awayClass = 'win';
				entry.homeClass = 'win';
			}

			return entry;
		}
	}

};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n<div>\n\t\n\t<!-- if on user/team, allow someone to write to wall -->\n\t<div v-if=\"type !== 'home'\" class=\"Feed__post\">\n\t\t<div class=\"Feed__write\">\n\t\t\t<div v-if=\"!newPost\" class=\"Feed__thumbnail Feed__thumbnail--write\">\n\t\t\t\t<i class=\"Feed__icon material-icons\">textsms</i>\n\t\t\t</div>\n\t\t\t<div v-else=\"\" class=\"Feed__thumbnail Feed__thumbnail--write submit-button\" @click=\"postNewPost\">\n\t\t\t\t<span>Submit</span>\n\t\t\t</div>\n\t\t\t<div class=\"Feed__input\">\n\t\t\t\t<div class=\"arrow-left\"></div>\n\t\t\t\t\t<form>\n\t\t\t\t\t\t<textarea v-autosize=\"newPost\" rows=\"1\" placeholder=\"Write a new post...\" class=\"form-control\" v-model=\"newPost\" required=\"\"></textarea>\n\t\t\t\t\t</form>\t\t\t\t\t\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\n\t<!-- start of the news feed -->\n\t<div class=\"Feed\">\n\t\t<div v-for=\"(index, day) in entries\" transition=\"slide-md\" class=\"Feed__day\">\n\t\t\t<div v-if=\"day.length\" class=\"Feed__date\">\n\t\t\t\t<span><i class=\"material-icons\">date_range</i>\n\t\t\t\t\t{{ day[0].date }}\n\t\t\t\t</span>\n\t\t\t</div>\n\t\t\t<div class=\"Feed__line\"></div>\n\n\t\t\t<div v-for=\"entry in day\" transition=\"slide-md\" class=\"Feed__entry\">\n\t\t\t\t<div class=\"Feed__thumbnail\" :class=\"entry.iconClass\">\n\t\t\t\t\t<i class=\"Feed__icon material-icons\">{{ entry.icon }}</i>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"Feed__text\">\n\t\t\t\t\t<div class=\"Feed__creator\">\n\t\t\t\t\t\t<a v-link=\"{name: 'user', params: {name: lookupPlayer(entry.creator).username}}\">{{ lookupPlayer(entry.creator).name }}</a>\n\t\t\t\t\t\t<span :title=\"entry.hoverDate\" class=\"Feed__timestamp\">\n\t\t\t\t\t\t\t<span class=\"bullet\">•</span>\n\t\t\t\t\t\t\t{{ entry.timestamp }}\n\t\t\t\t\t\t\t<i v-if=\"showDelete(entry.creator)\" id=\"deleteIcon\" class=\"material-icons\" title=\"Delete Post\" @click=\"deletePost(entry, index)\">clear</i>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<!-- new event -->\n\t\t\t\t\t<div v-if=\"entry.type === 0\" class=\"Feed__subject\">\n\t\t\t\t\t\t<span>The event <a class=\"event-trigger\" :data-event-id=\"entry.event_id\">{{ entry.title }}</a> has been added to the calendar</span>\n\t\t\t\t\t</div>\n\n\n\t\t\t\t\t<!-- event edited -->\n\t\t\t\t\t<div v-if=\"entry.type === 1\" class=\"Feed__subject\">\n\t\t\t\t\t\t<span>The event <a class=\"event-trigger\" :data-event-id=\"entry.event_id\">{{ entry.title }}</a> has been edited</span>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<!-- event canceled -->\n\t\t\t\t\t<div v-if=\"entry.type === 2\" class=\"Feed__subject\">\n\t\t\t\t\t\t<span>The event {{ entry.title }} has been canceled</span>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<!-- stats posted -->\n\t\t\t\t\t<div v-if=\"entry.type === 4\" class=\"Feed__subject\">\n\t\t\t\t\t\t<span>Stats for the game <a class=\"event-trigger\" :data-event-id=\"entry.event_id\">{{ entry.title }}</a> have been posted</span>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<!-- if this is a canceled event, show strikethrough date -->\n\t\t\t\t\t<div v-if=\"entry.type === 2\" class=\"Feed__entry__date--canceled\">\n\t\t\t\t\t\t<span>{{ entry.start | formatTimeString entry.end }}</span>\n\t\t\t\t\t</div>\n\t\t\t\t\t<!-- otherwise just show date -->\n\t\t\t\t\t<div v-if=\"entry.type < 2\" class=\"Feed__entry__date\">\n\t\t\t\t\t\t<span>{{ entry.start | formatTimeString entry.end }}</span>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<!-- if this event repeats, display which days -->\n\t\t\t\t\t<div v-if=\"entry.repeats\" class=\"Feed__entry__repeats\">\n\t\t\t\t\t\t<span>{{ entry.repeats | formatRepeatString }}</span>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<!-- if there's any extra details -->\n\t\t\t\t\t<blockquote v-if=\"entry.details\" class=\"Feed__details\">\n\t\t\t\t\t\t<p>{{ entry.details }}</p>\n\t\t\t\t\t</blockquote>\n\t\t\t\t\t\n\t\t\t\t\t<!-- if stats are posted, display the outcome of the game -->\n\t\t\t\t\t<!-- away team's score is always displayed first -->\n\t\t\t\t\t<blockquote v-if=\"entry.type === 4\" class=\"Feed__details\">\n\t\t\t\t\t\t<p :class=\"entry.awayClass\">{{ entry.awayName }} - {{ entry.awayScore }}</p>\n\t\t\t\t\t\t<p :class=\"entry.homeClass\">{{ entry.homeName }} - {{ entry.homeScore }}</p>\t\n\t\t\t\t\t</blockquote>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t</div>\n\t</div>\n\n\n</div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".Feed {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  padding: 0px 2em;\n}\n.Feed__line {\n  position: absolute;\n  left: 23px;\n  width: 0;\n  height: 100%;\n  border: 2px dashed #d0d0d0;\n}\n@media screen and (max-width: 500px) {\n  .Feed__line {\n    left: 18px;\n  }\n}\n.Feed__post {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding: 0 2em;\n}\n.Feed__post .Feed__thumbnail {\n  height: 54px;\n  width: 54px;\n  margin-right: 2em;\n  font-size: 18px;\n}\n@media screen and (max-width: 500px) {\n  .Feed__post .Feed__thumbnail {\n    width: 34px;\n    height: 34px;\n  }\n}\n.Feed__write {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  max-width: 775px;\n  margin-bottom: 7em;\n}\n.Feed__write .Feed__input {\n  width: 100%;\n  position: relative;\n}\n.Feed__write .Feed__input .arrow-left {\n  position: absolute;\n  top: 13px;\n  left: -10px;\n}\n@media screen and (max-width: 500px) {\n  .Feed__write .Feed__input .arrow-left {\n    top: 8px;\n  }\n}\n.Feed__write .submit-button:hover {\n  cursor: pointer;\n}\n.Feed__write .submit-button span {\n  font-size: 14px;\n  color: #fff;\n}\n@media screen and (max-width: 500px) {\n  .Feed__write .submit-button span {\n    font-size: 9px;\n  }\n}\n.Feed__day {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  position: relative;\n  min-width: 775px;\n  margin-top: 3em;\n  overflow: hidden;\n}\n@media screen and (max-width: 831px) {\n  .Feed__day {\n    min-width: 0;\n  }\n}\n.Feed__day:first-child {\n  margin-top: 0;\n}\n.Feed__date {\n  text-align: center;\n  margin-bottom: 2em;\n}\n.Feed__date span {\n  color: #9f9f9f;\n  position: relative;\n  padding-left: 25px;\n}\n.Feed__date span i {\n  position: absolute;\n  left: -3px;\n  top: -3px;\n  font-size: 21px;\n}\n.Feed__entry {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin-bottom: 5em;\n}\n.Feed__entry:last-child {\n  margin-bottom: 1em;\n}\n.Feed__text {\n  font-size: 16px;\n  max-width: 700px;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n}\n.Feed__creator {\n  margin-bottom: 1em;\n  font-size: 14px;\n}\n.Feed__timestamp {\n  position: relative;\n  margin-left: 15px;\n  color: #9f9f9f;\n}\n.Feed__timestamp .bullet {\n  position: absolute;\n  left: -13px;\n  top: -5px;\n  font-size: 20px;\n}\n.Feed__timestamp #deleteIcon {\n  font-size: 18px;\n  position: absolute;\n  right: -25px;\n  top: -1px;\n}\n.Feed__timestamp #deleteIcon:hover {\n  cursor: pointer;\n}\n.Feed__subject {\n  margin-bottom: 0.7em;\n}\n.Feed__details {\n  border-left: 5px solid rgba(128,128,128,0.44);\n  font-weight: bold;\n  margin-bottom: 0;\n}\n.Feed__details .win {\n  font-weight: bold;\n}\n.Feed__details .loss {\n  color: #7b7b7b;\n  font-weight: lighter;\n}\n.Feed__entry__date {\n  margin-bottom: 0.7em;\n}\n.Feed__entry__date--canceled {\n  text-decoration: line-through;\n  margin-bottom: 1em;\n}\n.Feed__entry__repeats {\n  margin-bottom: 1em;\n  color: #9f9f9f;\n}\n.Feed__thumbnail {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  padding: 20px;\n  margin-right: 2em;\n  z-index: 10;\n}\n@media screen and (max-width: 500px) {\n  .Feed__thumbnail {\n    width: 30px;\n    height: 30px;\n    margin-right: 2em;\n  }\n}\n.Feed__thumbnail .Feed__icon {\n  font-size: 30px;\n}\n@media screen and (max-width: 500px) {\n  .Feed__thumbnail .Feed__icon {\n    font-size: 18px;\n  }\n}\n.Feed__thumbnail--write {\n  background: #329acf;\n  color: #fff;\n}\n.Feed__thumbnail--stats {\n  background: #f96a04;\n  color: #fff;\n}\n.Feed__thumbnail--newEvent {\n  background: #76af00;\n  color: #fff;\n}\n.Feed__thumbnail--updateEvent {\n  background: #f2d500;\n  color: #fff;\n}\n.Feed__thumbnail--cancelEvent {\n  background: #c90018;\n  color: #fff;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-2c217d3b", module.exports)
  } else {
    hotAPI.update("_v-2c217d3b", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],64:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".Roster {\n  margin: 0 auto;\n  max-width: 775px;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n}\n@media screen and (max-width: 775px) {\n  .Roster {\n    padding: 0px 15px;\n  }\n}\n.Roster__header {\n  margin-bottom: -10px;\n}\n.Roster__add {\n  position: absolute;\n  right: 0;\n  top: 5px;\n  font-size: 16px;\n}\n.Roster__list {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n@media screen and (max-width: 550px) {\n  .Roster__list {\n    -ms-flex-preferred-size: 100%;\n        flex-basis: 100%;\n  }\n}\n.Roster__coaches {\n  position: relative;\n}\n.Roster__players {\n  margin-top: 25px;\n  position: relative;\n}\n.Roster__fans {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  padding-left: 3em;\n}\n@media screen and (max-width: 550px) {\n  .Roster__fans {\n    padding: 0;\n    -ms-flex-preferred-size: 100%;\n        flex-basis: 100%;\n  }\n}\n#adminIcon {\n  color: rgba(128,128,128,0.44);\n}\n#editIcon {\n  color: #1179c9;\n}\n#editIcon:hover {\n  color: #38a9f9;\n  cursor: pointer;\n}\n#saveIcon {\n  position: absolute;\n  left: 35px;\n  top: 9px;\n  color: #fff;\n  margin: 0;\n  line-height: 0.2;\n}\n.jersey {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  max-width: 75px;\n  display: inline-block;\n}\n.jersey div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'Roster',

	props: ['players', 'coaches', 'fans', 'admin', 'editUser'],

	data: function data() {
		return {};
	},


	methods: {

		//they clicked the edit button
		//open modal to edit player
		edit: function edit(user) {

			//make a copy of this player (not reactive with state in case not saved)
			this.$set('editUser', JSON.parse((0, _stringify2.default)(user)));
			this.$root.showModal('rosterModal');
		},


		//clicked the 'add user' button
		addUser: function addUser(role) {
			if (role === 'player') var role = 1;
			if (role === 'coach') var role = 3;

			var user = {
				role: role,
				ghost: true,
				new: true,
				meta: {
					ghost: {
						name: '',
						email: ''
					},
					positions: [],
					num: ''
				}
			};

			this.$set('editUser', user);
			this.$root.showModal('rosterModal');
		}
	},

	ready: function ready() {

		$(function () {
			//attach tooltips
			$('[data-toggle="tooltip"').tooltip({
				container: 'body',
				delay: { show: 400, hide: 0 }
			});
		});
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t<div class=\"Roster\">\n\t\t\n\t\t<div class=\"Roster__list\">\n\n\n\t\t\t<!-- coaches column -->\n\t\t\t<div v-if=\"coaches.length\" class=\"Roster__coaches\">\n\t\t\t\t<h2 class=\"Roster__header\">Coaches</h2>\n\t\t\t\t<a v-show=\"isAdmin\" class=\"Roster__add\" @click=\"addUser('coach')\">\n          <i class=\"material-icons\">person_add</i>\n        </a>\n\t\t\t\t<hr>\n\t\t\t\t<div v-for=\"coach in coaches | orderBy 'lastname'\">\n\t\t\t\t\t<div class=\"Media\">\n\n\t\t\t\t\t\t<img v-if=\"! coach.isGhost\" :src=\"coach.pic\" class=\"Media__thumbnail\" width=\"60\" height=\"60\" v-link=\"{name: 'user', params: {name: coach.username}}\">\n\t\t\n\t\t\t\t\t\t<img v-else=\"\" :src=\"coach.pic\" class=\"Media__thumbnail --ghost\" width=\"60\" height=\"60\">\n\n\t\t\t\t\t\n\t\t\t\t\t\t<div class=\"Media__text\">\n\t\t\t\t\t\t\t<div class=\"Media__title\">\n\t\t\t\t\t\t\t\t<a v-if=\"! coach.isGhost\" v-link=\"{name: 'user', params: {name: coach.username}}\">\n\t\t\t\t\t\t\t\t\t{{ coach.firstname + ' ' + coach.lastname }}\n\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t<p v-else=\"\">\n\t\t\t\t\t\t\t\t\t{{ coach.firstname + ' ' + coach.lastname }}\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"Media__details\">\n\t\t\t\t\t\t\t\t<i v-if=\"isAdmin\" @click=\"edit(coach)\" id=\"editIcon\" class=\"material-icons\">mode_edit</i>\n\t\t\t\t\t\t\t\t<i v-if=\"coach.isAdmin\" id=\"adminIcon\" class=\"material-icons\" data-toggle=\"tooltip\" title=\"Admin\">font_download</i>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\t\n\t\t\t</div>\n\n\n\t\t\t<!-- players column -->\n\t\t\t<div v-if=\"players.length\" class=\"Roster__players\">\n\t\t\t\t<h2 class=\"Roster__header\">Players</h2>\n\t\t\t\t<a v-show=\"isAdmin\" class=\"Roster__add\" @click=\"addUser('player')\">\n          <i class=\"material-icons\">person_add</i>\n        </a>\n\t\t\t\t<hr>\n\t\t\t\t\n\t\t\t\t<div v-for=\"player in players | orderBy 'lastname'\">\n\t\t\t\t\t<div class=\"Media\">\n\n\t\t\t\t\t\t<img v-if=\"! player.isGhost\" :src=\"player.pic\" class=\"Media__thumbnail\" width=\"60\" height=\"60\" v-link=\"{name: 'user', params: {name: player.username}}\">\n\t\t\t\t\t\t<img v-else=\"\" :src=\"player.pic\" class=\"Media__thumbnail --ghost\" width=\"60\" height=\"60\">\n\t\t\t\n\t\t\t\t\t\t<div class=\"Media__text\">\n\t\t\t\t\t\t\t<div class=\"Media__title\">\n\t\t\t\t\t\t\t\t<span v-show=\"player.meta.num\" class=\"Media__number\">\n\t\t\t\t\t\t\t\t\t\t{{ player.meta.num }}<span class=\"Media__divider\">|</span>\n\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t<a v-if=\"! player.isGhost\" v-link=\"{name: 'user', params: {name: player.username}}\">\n\t\t\t\t\t\t\t\t\t{{ player.firstname + ' ' + player.lastname }}\n\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t<p v-else=\"\">\n\t\t\t\t\t\t\t\t\t{{ player.firstname + ' ' + player.lastname }}\n\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t<div class=\"Media__details\">\n\t\t\t\t\t\t\t\t<i v-if=\"admin\" @click=\"edit(player)\" id=\"editIcon\" class=\"material-icons\">mode_edit</i>\n\t\t\t\t\t\t\t\t<i v-if=\"player.admin\" id=\"adminIcon\" class=\"material-icons\" data-toggle=\"tooltip\" title=\"Admin\">font_download</i>\n\t\t\t\t\t\t\t\t<span class=\"positions\">\n\t\t\t\t\t\t\t\t\t<span v-for=\"position in player.meta.positions\">\n\t\t\t\t\t\t\t\t\t\t{{ position | uppercase }}  \n\t\t\t\t\t\t\t\t\t\t<span v-show=\"$index !== (player.meta.positions.length - 1) &amp;&amp; \n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tplayer.meta.positions[$index+1].length\"> | </span>\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t</div>\n\t\t</div> <!-- end Roster__list -->\n\n\n\t\t<!-- fans column -->\n\t\t<div v-if=\"fans.length\" class=\"Roster__fans\">\n\t\t\t<h2 class=\"Roster__header\">Fans</h2>\n\t\t\t<hr>\n\t\t\t<div v-for=\"fan in fans | orderBy 'admin' -1\" class=\"Media\">\n\n\t\t\t\t<img :src=\"fan.pic\" class=\"Media__thumbnail\" width=\"60\" height=\"60\" v-link=\"{name: 'user', params: {name: fan.username}}\">\n\t\t\t\t\n\t\t\t\t<div class=\"Media__text\">\n\t\t\t\t\t<div class=\"Media__title\">\n\t\t\t\t\t\t<a v-link=\"{name: 'user', params: {name: fan.username}}\">\n\t\t\t\t\t\t\t{{ fan.firstname + ' ' + fan.lastname }}\n\t\t\t\t\t\t</a>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"Media__details\">\n\t\t\t\t\t\t<i v-if=\"admin\" @click=\"edit(fan)\" id=\"editIcon\" class=\"material-icons\">mode_edit</i>\n\t\t\t\t\t\t<i v-if=\"fan.isAdmin\" id=\"adminIcon\" class=\"material-icons\" data-toggle=\"tooltip\" title=\"Admin\">font_download</i>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\n\n\t</div>\t\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".Roster {\n  margin: 0 auto;\n  max-width: 775px;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n}\n@media screen and (max-width: 775px) {\n  .Roster {\n    padding: 0px 15px;\n  }\n}\n.Roster__header {\n  margin-bottom: -10px;\n}\n.Roster__add {\n  position: absolute;\n  right: 0;\n  top: 5px;\n  font-size: 16px;\n}\n.Roster__list {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n@media screen and (max-width: 550px) {\n  .Roster__list {\n    -ms-flex-preferred-size: 100%;\n        flex-basis: 100%;\n  }\n}\n.Roster__coaches {\n  position: relative;\n}\n.Roster__players {\n  margin-top: 25px;\n  position: relative;\n}\n.Roster__fans {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  padding-left: 3em;\n}\n@media screen and (max-width: 550px) {\n  .Roster__fans {\n    padding: 0;\n    -ms-flex-preferred-size: 100%;\n        flex-basis: 100%;\n  }\n}\n#adminIcon {\n  color: rgba(128,128,128,0.44);\n}\n#editIcon {\n  color: #1179c9;\n}\n#editIcon:hover {\n  color: #38a9f9;\n  cursor: pointer;\n}\n#saveIcon {\n  position: absolute;\n  left: 35px;\n  top: 9px;\n  color: #fff;\n  margin: 0;\n  line-height: 0.2;\n}\n.jersey {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  max-width: 75px;\n  display: inline-block;\n}\n.jersey div {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-39a90f96", module.exports)
  } else {
    hotAPI.update("_v-39a90f96", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"babel-runtime/core-js/json/stringify":2,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],65:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("#statsWrapper {\n  padding-bottom: 10px;\n}\n.stats-container {\n  position: relative;\n  min-height: 100px;\n  padding: 0.5em 2em 2em 0;\n}\n@media screen and (max-width: 767px) {\n  .stats-container {\n    border: 0;\n  }\n}\n.stats-container .Tab__container {\n  margin-bottom: 45px;\n  font-size: 16px;\n}\ntable th.stat-columns {\n  background-color: #7ab0eb;\n  border: 1px solid #cacaca;\n  color: #fff;\n  font-weight: 300;\n}\ntable th.stat-columns.name {\n  padding: 8px 30px;\n}\ntable th.stat-columns.opp {\n  padding: 8px 50px;\n}\ntable th.stat-columns:hover {\n  cursor: pointer;\n}\ntable th.stat-columns.col-sort {\n  background-color: #4b74a0;\n  border-bottom: 2px solid #cacaca;\n}\n.table-striped tbody tr:nth-child(even) td {\n  background-color: #f7f7f7;\n}\n.table-striped tbody tr:nth-child(odd) td {\n  background-color: #fff;\n}\n.stats-table tr:hover td {\n  background-color: #d6d6d6 !important;\n  border: 1px solid #f7f7f7 !important;\n}\ntd.stat-entries {\n  border: 1px solid #cacaca;\n  vertical-align: middle;\n}\n.stats-table {\n  font-size: 13px;\n  font-family: 'Monda', sans-serif;\n  text-align: center;\n}\n.stats-table .caret {\n  margin: 0;\n  -webkit-transition: all 0.2s;\n  transition: all 0.2s;\n}\n.stats-table .caret.asc {\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg);\n}\n.stats-table .caret.desc {\n  -webkit-transform: rotate(0deg);\n          transform: rotate(0deg);\n}\n.stat-entries.win {\n  color: #f3b700;\n}\n.stat-entries.loss {\n  color: rgba(38,51,255,0.72);\n  font-weight: bold;\n}\n.stat-entries.versus {\n  color: #7b7b7b;\n  font-weight: bold;\n}\ndiv.pagination {\n  margin: 0 auto;\n  width: 100%;\n}\nul.pagination {\n  font-size: 13px;\n  margin-top: 5px;\n}\nul.pagination li a,\nul.pagination li a:visited {\n  color: #000;\n}\nul.pagination li a:hover {\n  color: #000;\n  background-color: #d6d6d6;\n  border-color: #cacaca;\n}\nul.pagination .active a,\nul.pagination .active a:visited,\nul.pagination .active a:hover {\n  color: #fff;\n  background-color: #7ab0eb;\n  border-color: #cacaca;\n}\n.Stats__title.--noStats {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  text-align: center;\n  font-size: 25px;\n  margin-bottom: 2em;\n}\n.Stats__title.--noStats * {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Stats__overflow {\n  margin-top: 1em;\n  margin-bottom: 0.5em;\n  min-height: 20px;\n}\n.Stats__overflow span {\n  position: relative;\n  color: rgba(128,128,128,0.44);\n}\n.Stats__overflow span.--right {\n  padding-right: 1.5em;\n  float: right;\n}\n.Stats__overflow span.--right i {\n  top: -5px;\n  right: -9px;\n}\n.Stats__overflow span.--left {\n  float: left;\n  padding-left: 1.5em;\n}\n.Stats__overflow span.--left i {\n  top: -5px;\n  left: -9px;\n}\n.Stats__overflow span i {\n  position: absolute;\n  font-size: 30px;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _BasketballStats = require('./BasketballStats.vue');

var _BasketballStats2 = _interopRequireDefault(_BasketballStats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'Stats',

	props: ['stats', 'players', 'type', 'team', 'sport', 'event', 'pagination', 'teamCols', 'playerCols'],

	components: {
		'basketball': _BasketballStats2.default
	},

	data: function data() {
		return {};
	},


	watch: {
		//stats have changed, compile
		stats: function stats() {
			this.$broadcast('compileStats');
		}
	},

	events: {
		dataReady: function dataReady() {
			this.$broadcast('compileStats');
		}
	}

};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t\n\t<div>\n\n\t\t<div v-if=\"type === 'event' &amp;&amp; ! stats.length\" class=\"Stats__title --noStats\">\n\t\t\t<p>This event's stats aren't posted yet... bug a team admin to post them!</p>\n\t\t</div>\n\t\t\n\t\t<basketball v-if=\"sport === 'basketball'\" :type=\"type\" :event=\"event\" :players=\"players\" :raw-stats=\"stats\" :pagination=\"pagination\" :team-cols=\"teamCols\" :player-cols=\"playerCols\">\n  \t</basketball>\t\n\n\n\n\t</div>\n\t\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["#statsWrapper {\n  padding-bottom: 10px;\n}\n.stats-container {\n  position: relative;\n  min-height: 100px;\n  padding: 0.5em 2em 2em 0;\n}\n@media screen and (max-width: 767px) {\n  .stats-container {\n    border: 0;\n  }\n}\n.stats-container .Tab__container {\n  margin-bottom: 45px;\n  font-size: 16px;\n}\ntable th.stat-columns {\n  background-color: #7ab0eb;\n  border: 1px solid #cacaca;\n  color: #fff;\n  font-weight: 300;\n}\ntable th.stat-columns.name {\n  padding: 8px 30px;\n}\ntable th.stat-columns.opp {\n  padding: 8px 50px;\n}\ntable th.stat-columns:hover {\n  cursor: pointer;\n}\ntable th.stat-columns.col-sort {\n  background-color: #4b74a0;\n  border-bottom: 2px solid #cacaca;\n}\n.table-striped tbody tr:nth-child(even) td {\n  background-color: #f7f7f7;\n}\n.table-striped tbody tr:nth-child(odd) td {\n  background-color: #fff;\n}\n.stats-table tr:hover td {\n  background-color: #d6d6d6 !important;\n  border: 1px solid #f7f7f7 !important;\n}\ntd.stat-entries {\n  border: 1px solid #cacaca;\n  vertical-align: middle;\n}\n.stats-table {\n  font-size: 13px;\n  font-family: 'Monda', sans-serif;\n  text-align: center;\n}\n.stats-table .caret {\n  margin: 0;\n  -webkit-transition: all 0.2s;\n  transition: all 0.2s;\n}\n.stats-table .caret.asc {\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg);\n}\n.stats-table .caret.desc {\n  -webkit-transform: rotate(0deg);\n          transform: rotate(0deg);\n}\n.stat-entries.win {\n  color: #f3b700;\n}\n.stat-entries.loss {\n  color: rgba(38,51,255,0.72);\n  font-weight: bold;\n}\n.stat-entries.versus {\n  color: #7b7b7b;\n  font-weight: bold;\n}\ndiv.pagination {\n  margin: 0 auto;\n  width: 100%;\n}\nul.pagination {\n  font-size: 13px;\n  margin-top: 5px;\n}\nul.pagination li a,\nul.pagination li a:visited {\n  color: #000;\n}\nul.pagination li a:hover {\n  color: #000;\n  background-color: #d6d6d6;\n  border-color: #cacaca;\n}\nul.pagination .active a,\nul.pagination .active a:visited,\nul.pagination .active a:hover {\n  color: #fff;\n  background-color: #7ab0eb;\n  border-color: #cacaca;\n}\n.Stats__title.--noStats {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  text-align: center;\n  font-size: 25px;\n  margin-bottom: 2em;\n}\n.Stats__title.--noStats * {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Stats__overflow {\n  margin-top: 1em;\n  margin-bottom: 0.5em;\n  min-height: 20px;\n}\n.Stats__overflow span {\n  position: relative;\n  color: rgba(128,128,128,0.44);\n}\n.Stats__overflow span.--right {\n  padding-right: 1.5em;\n  float: right;\n}\n.Stats__overflow span.--right i {\n  top: -5px;\n  right: -9px;\n}\n.Stats__overflow span.--left {\n  float: left;\n  padding-left: 1.5em;\n}\n.Stats__overflow span.--left i {\n  top: -5px;\n  left: -9px;\n}\n.Stats__overflow span i {\n  position: absolute;\n  font-size: 30px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-14bfe0e5", module.exports)
  } else {
    hotAPI.update("_v-14bfe0e5", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"./BasketballStats.vue":56,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],66:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".Team {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Team__details {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  margin-bottom: 35px;\n  padding: 110px 0 0 0px;\n  background-size: cover;\n  background-attachment: fixed;\n}\n.Team__pic {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  padding-left: 40px;\n  max-width: 290px;\n  -webkit-transform: translate(0, 125px);\n          transform: translate(0, 125px);\n}\n.Team__pic img {\n  border-radius: 50%;\n  border: 3px solid #fff;\n}\n.black-container {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  background: rgba(0,0,0,0.7);\n}\n.black-container .filler {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Team__info__tabs {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  -webkit-box-flex: 3;\n      -ms-flex: 3;\n          flex: 3;\n  padding: 0;\n}\n.Team__info {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n}\n.Team__text {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column wrap;\n      flex-flow: column wrap;\n  color: #fff;\n}\n.Team__tabs {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n}\n.Team__name {\n  -ms-flex-preferred-size: 1;\n      flex-basis: 1;\n  font-size: 42px;\n}\n.Team__location {\n  padding-left: 22px;\n  -ms-flex-preferred-size: 1;\n      flex-basis: 1;\n  margin-top: 15px;\n  font-size: 16px;\n}\n.Team__location span {\n  position: relative;\n}\n.Team__location .material-icons {\n  position: absolute;\n  font-size: 21px;\n  left: -27px;\n  top: -2px;\n}\n.Team__slogan {\n  -ms-flex-preferred-size: 1;\n      flex-basis: 1;\n  margin-top: 15px;\n  font-size: 16px;\n}\n.Team__fans {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-align: end;\n      -ms-flex-align: end;\n          align-items: flex-end;\n  margin-top: 20px;\n}\n.Team__fans .num-fans {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  overflow: hidden;\n  height: 44px;\n  width: 70px;\n}\n.Team__fans .num-fans .fan-count {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  background-color: #fff;\n  min-width: 61px;\n  height: 44px;\n  font-size: 17px;\n  border-radius: 10%;\n  color: #7b7b7b;\n}\n.Team__fans .num-fans .fan-count span {\n  position: absolute;\n  top: 8px;\n  right: 33px;\n}\n.Team__fans .num-fans .fan-count.--tensOfFans span {\n  right: 30px;\n}\n.Team__fans .num-fans .fan-count.--hundredsOfFans span {\n  right: 24px;\n}\n.Team__fans .num-fans .fan-count.--thousandsOfFans span {\n  right: 19px;\n}\n.Team__fans .num-fans .arrow-right {\n  position: absolute;\n  top: 5px;\n  right: 4px;\n  margin-top: 9px;\n  height: 0;\n  width: 0;\n  border-bottom: 6px solid transparent;\n  border-top: 6px solid transparent;\n  border-left: 6px solid #fff;\n}\n.Team__fans .fan-icon {\n  margin-left: 2px;\n}\n.Team__fans .fan-icon:hover {\n  cursor: pointer;\n}\n.Team__fans .fan-icon.--member:hover {\n  cursor: default;\n}\n.Team__invite {\n  background: #fff;\n  border-radius: 5px;\n  margin-right: 15px;\n}\n.Team__invite a.btn.outline,\n.Team__invite a.btn {\n  border: 0;\n  margin: 0;\n}\n.Team__invite a.btn.outline:hover,\n.Team__invite a.btn:hover {\n  border: 0;\n}\n.Team__invite a.btn.outline.--member:hover,\n.Team__invite a.btn.--member:hover {\n  cursor: default;\n  color: #fff;\n  background-color: #21c230;\n}\n.Team__tabs {\n  margin-top: 25px;\n  height: 45px;\n  padding: 0;\n  overflow: visible;\n}\n.Team__tabs .tab {\n  width: 200px;\n  position: relative;\n  height: 45px;\n  float: left;\n  overflow: hidden;\n  margin: 0 -15px 0 0;\n}\n.Team__tabs .tab .tab-box {\n  height: 53px;\n  background: #ccc;\n  border-radius: 6px;\n  border: 1px solid rgba(128,128,128,0.44);\n  border-bottom: 9px solid rgba(128,128,128,0.44);\n  margin: 0 7px 0;\n  box-shadow: 0 0 2px #fff inset;\n  -webkit-transform: perspective(100px) rotateX(23deg);\n          transform: perspective(100px) rotateX(23deg);\n  -webkit-transition: background 0.3s, border-bottom 0.05s;\n  transition: background 0.3s, border-bottom 0.05s;\n}\n.Team__tabs .tab a {\n  color: #1179c9;\n  -webkit-transition: color 0.3s;\n  transition: color 0.3s;\n}\n.Team__tabs .tab:hover {\n  cursor: pointer;\n}\n.Team__tabs .tab:hover .tab-box {\n  background: #fff;\n  -webkit-transition: background 0.3s;\n  transition: background 0.3s;\n}\n.Team__tabs .tab:hover a {\n  color: #38a9f9;\n  -webkit-transition: color 0.3s;\n  transition: color 0.3s;\n}\n.Team__tabs .tab.--active {\n  z-index: 40;\n  position: relative;\n  padding-bottom: 1px;\n}\n.Team__tabs .tab.--active .tab-box {\n  background-color: #f5f5f5;\n  border-bottom: 0;\n  -webkit-transition: border-bottom 0.05s;\n  transition: border-bottom 0.05s;\n  box-shadow: 0 0 2px #fff inset;\n}\n.Team__tabs .tab.--active a,\n.Team__tabs .tab.--active:hover {\n  cursor: default;\n  color: #000;\n}\n.Team__feed {\n  background: #ebebeb;\n  margin-top: 4em;\n}\n.Team__feed_divider {\n  margin: 65px 0px 105px 0px;\n}\n.Team__stats {\n  padding: 0 2em;\n}\n#calendarTab {\n  position: absolute;\n  top: 17px;\n  left: 69px;\n}\n#calendarTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#statsTab {\n  position: absolute;\n  top: 17px;\n  left: 84px;\n}\n#statsTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#rosterTab {\n  position: absolute;\n  top: 17px;\n  left: 81px;\n}\n#rosterTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#settingsTab {\n  position: absolute;\n  top: 15px;\n  left: 74px;\n}\n#settingsTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#noTeam {\n  margin-top: 80px;\n}\nrc-stats {\n  padding: 2em;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Calendar = require('./Calendar.vue');

var _Calendar2 = _interopRequireDefault(_Calendar);

var _Stats = require('./Stats.vue');

var _Stats2 = _interopRequireDefault(_Stats);

var _AddEvent = require('./AddEvent.vue');

var _AddEvent2 = _interopRequireDefault(_AddEvent);

var _ViewEvent = require('./ViewEvent.vue');

var _ViewEvent2 = _interopRequireDefault(_ViewEvent);

var _Roster = require('./Roster.vue');

var _Roster2 = _interopRequireDefault(_Roster);

var _NewsFeed = require('./NewsFeed.vue');

var _NewsFeed2 = _interopRequireDefault(_NewsFeed);

var _EditUser = require('./EditUser.vue');

var _EditUser2 = _interopRequireDefault(_EditUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'Team',

	props: [],

	components: {
		'rc-calendar': _Calendar2.default,
		'rc-stats': _Stats2.default,
		'rc-add-event': _AddEvent2.default,
		'rc-view-event': _ViewEvent2.default,
		'rc-roster': _Roster2.default,
		'rc-news-feed': _NewsFeed2.default,
		'rc-edit-user': _EditUser2.default
	},

	route: {
		canReuse: false
	},

	data: function data() {
		var prefix = this.$parent.prefix + 'team/';
		var teamname = this.$route.params.name;

		// set new title
		document.title = teamname;

		return {
			prefix: prefix + teamname,
			requestFinished: false,
			notFound: false,
			auth: {},
			team: {
				meta: {}
			},
			isAdmin: false,
			isFan: false,
			isPlayer: false,
			isCoach: false,
			hasBeenInvited: false,
			hasRequestedToJoin: false,
			isCreator: false,
			editUser: {
				firstname: '',
				lastname: '',
				meta: {}
			},
			positions: [],
			teamStatCols: [],
			playerStatCols: [],
			users: [],
			tab: 'roster',
			statsTab: 'teamRecent',
			events: [],
			stats: [],
			feed: [],
			fansChanged: false,
			numFansTransition: 'number-tick-up'
		};
	},
	created: function created() {
		var url = this.makeUrl('');
		this.$root.get(url, 'Team_requestSuccess', [], 'Team_requestFail');
	},


	computed: {
		numFans: function numFans() {
			return this.fans.length;
		},
		isMember: function isMember() {
			return this.isPlayer || this.isCoach;
		},


		// makes fan counter div wider with larger numFans
		numFansClass: function numFansClass() {
			if (this.fans.length >= 1000) return '--thousandsOfFans';else if (this.fans.length >= 100) return '--hundredsOfFans';else if (this.fans.length >= 10) return '--tensOfFans';else return '';
		},


		// the following three functions pick which of the fan icons to display
		showRemoveFan: function showRemoveFan() {
			return !this.isFan && !this.isMember;
		},
		showBecomeFan: function showBecomeFan() {
			return this.isFan && !this.isAdmin;
		},
		showIsFan: function showIsFan() {
			// this icon is unclickable
			return this.isMember || this.isFan && this.isAdmin;
		},


		// the following four functions pick which of the membership buttons to display
		showYoureAMember: function showYoureAMember() {
			return this.isMember || this.isCreator;
		},
		showRequestToJoin: function showRequestToJoin() {
			return !this.hasRequestedToJoin && !this.hasBeenInvited && !this.isMember && !this.isCreator;
		},
		showCancelRequest: function showCancelRequest() {
			return this.hasRequestedToJoin;
		},
		showRespondToInvitation: function showRespondToInvitation() {
			return this.hasBeenInvited;
		},


		// create list of players from users
		players: function players() {
			return this.users.filter(function (user) {
				return user.isPlayer;
			});
		},


		// create list of coaches from users
		coaches: function coaches() {
			return this.users.filter(function (user) {
				return user.isCoach;
			});
		},


		// create list of fans from users
		fans: function fans() {
			return this.users.filter(function (user) {
				return user.isFan;
			});
		}
	},

	events: {

		// team data has arrived from the back-end
		Team_requestSuccess: function Team_requestSuccess(response) {
			this.compile(response.data.data);

			setTimeout(function () {
				this.requestFinished = true;
				this.$broadcast('dataReady');
			}.bind(this), 100);
		},


		// team data has arrived from the back-end
		Team_requestFail: function Team_requestFail(response) {
			this.requestFinished = true;
			this.notFound = true;
		},


		/**
   * User has toggled their fan status
   */
		Team_toggleFan: function Team_toggleFan(response) {
			this.updateFanStatus();
			this.users = [];
			this.formatUsers(response.data.members);
		},


		// new stats have been posted from ViewEvent
		newStats: function newStats(data, entry) {
			var self = this;
			data.forEach(function (val) {
				self.stats.push(val);
			});

			this.$broadcast('updateFeed', entry);
		},


		// updated stats have been posted from ViewEvent
		updateStats: function updateStats(data, event) {
			// first erase all stats for this event
			this.stats = this.stats.filter(function (stat) {
				return stat.event_id !== event.id;
			});

			if (data.length) {
				// there were new stats to add
				data.forEach(function (val) {
					this.stats.push(val);
				}.bind(this));
			}

			// tell Stats.vue to re-compile the stats
			this.$broadcast('updateStats', this.stats);
		},


		// stats have been deleted from ViewEvent
		deleteStats: function deleteStats(event) {
			// iterate through all stats, keep the ones not associated with this event
			this.stats = this.stats.filter(function (stat) {
				return stat.event_id !== event.id;
			});

			// tell Stats.vue to re-compile
			this.$broadcast('updateStats', this.stats);
		},
		newEvent: function newEvent(events, entry) {
			this.events = events;

			this.$broadcast('updateFeed', entry);
		},
		updateEvent: function updateEvent(events, entry) {
			this.events = events;

			if (entry) {
				this.$broadcast('updateFeed', entry);
			}
		},
		deleteEvent: function deleteEvent(events, entry) {
			this.events = events;

			if (entry) {
				this.$broadcast('updateFeed', entry);
			}
		},


		/**
   * A user was created/edited/deleted
   *
   * @param {array} members  The updated array of team members
   */
		Team_updated_members: function Team_updated_members(members) {
			this.users = [];
			this.formatUsers(members);
		}
	},

	methods: {
		makeUrl: function makeUrl(extension) {
			return this.prefix + extension;
		},


		// method for assigning data after ajax call finishes
		compile: function compile(data) {
			this.auth = this.$root.user;
			this.team = data.team;

			// loop through all the users, create user objects
			this.users = [];
			this.formatUsers(data.members);

			// store meta data about team
			var meta = JSON.parse(data.team.meta);
			this.teamStatCols = meta.stats.teamCols;
			this.playerStatCols = meta.stats.playerCols;
			this.team.slogan = meta.slogan;
			this.team.homefield = meta.homefield;
			this.team.city = meta.city;

			// format the backdrop image as a style tag 
			this.team.backdrop = "background-image: url('" + this.team.backdrop + "');";

			// note whether or not this user is the creator
			if (this.team.creator_id === this.auth.id) {
				this.isCreator = true;
				this.isAdmin = true;
			}

			// now that all team data is ready, set these variables
			// components are listening, will format the data as needed
			this.events = data.events;
			this.stats = data.stats;
			this.feed = data.feed;
			this.positions = data.positions;

			// tell App.vue to clear any notifications the logged in user may have
			//this.$dispatch('clearNotifications', this.team.id);
		},


		// compile meta data for users and push into this.users
		formatUsers: function formatUsers(users) {
			if (!users) {
				// its possible there is a 'null' here 
				return;
			}

			if (!Array.isArray(users)) {
				users = [users];
			}

			for (var x = 0; x < users.length; x++) {
				var user = users[x];

				if (user.meta) {
					user.meta = JSON.parse(user.meta);
				} else {
					user.meta = {};
				}

				if (this.auth.id === user.id) {
					// save the logged-in users's data separately too
					this.isAdmin = user.isAdmin;
					this.isFan = user.isFan;
					this.isPlayer = user.isPlayer;
					this.isCoach = user.isCoach;
					this.hasRequestedToJoin = user.hasRequestedToJoin;
					this.hasBeenInvited = user.hasBeenInvited;
				}

				// mark which user is the creator
				if (this.team.creator_id === user.id) {
					user.isCreator = true;
				}

				this.users.push(user);
			}
		},


		// user hit fan button
		toggleFan: function toggleFan() {
			var self = this;
			var url = this.prefix + '/fan';
			this.$root.post(url, 'Team_toggleFan');
		},


		// successful request, change fan status
		updateFanStatus: function updateFanStatus() {
			if (this.isFan) {
				// use decrement animation on counter
				this.numFansTransition = 'number-tick-down';
			} else {
				// increment
				this.numFansTransition = 'number-tick-up';
			}

			// swap the fan status
			this.isFan = !this.isFan;
			this.fansChanged = !this.fansChanged;

			if (this.isFan) {
				// tell App.vue to add this team to the nav dropdown
				this.$dispatch('becameAFanOfTeam', this.team);
				this.$root.banner('good', "You're now a fan");
			} else {
				this.$dispatch('removedAsFanOfTeam', this.team.teamname);
				this.$root.banner('good', "You're no longer a fan");
			}
		},


		// the player wants to send a request to join this team
		requestToJoin: function requestToJoin(action) {
			var self = this;
			var url = this.prefix + '/join';
			this.$http.post(url).then(function (response) {
				if (!response.data.ok) throw response.data.error;

				if (action === 'join') {
					self.hasRequestedToJoin = true;
					self.$root.banner('good', "Request sent to team admin");
				} else if (action === 'cancel') {
					self.hasRequestedToJoin = false;
					self.$root.banner('good', "Request cancelled");
				}
			}).catch(function (error) {
				self.$root.errorMsg(error);
			});
		},


		// they were invited, make them a for-real member now
		respondToInv: function respondToInv(outcome) {
			var self = this;
			// first they should confirm whether they want to accept the invite or not
			// only do this if 'outcome' isn't a boolean yet (vue makes it random event data on-click)
			if (typeof outcome !== 'boolean') {
				if (this.auth.role === 5 || this.auth.role === 45) var role = 'player.';
				if (this.auth.role === 6 || this.auth.role === 46) var role = 'coach.';
				var text = "You've been invited to join this team as a " + role;
				swal({
					title: 'Respond to Invitation',
					text: text,
					type: "info",
					showCancelButton: true,
					confirmButtonColor: '#1179C9',
					cancelButtonColor: 'whitesmoke',
					confirmButtonText: 'JOIN',
					cancelButtonText: 'NO THANKS',
					closeOnConfirm: true
				}, function (confirm) {
					// call this function with boolean response
					if (confirm) {
						self.respondToInv(true);
					} else {
						self.respondToInv(false);
					}
				});

				// they will be back after confirming
				return;
			}

			var url = this.prefix + '/join';
			data = { accept: outcome };
			this.$http.post(url, data).then(function (response) {
				// check there were no authorization errors
				if (!response.data.ok) {
					throw response.data.error;
				}

				self.hasBeenInvited = false;

				if (outcome) {
					// add them to the team
					self.formatUsers(response.data.users);
					self.$root.banner('good', "You've joined this team");
					self.isFan = false;
				} else {
					self.$root.banner('good', "Invitation denied");
				}
			}).catch(function (error) {
				self.$root.errorMsg(error);
			});
		}
	}, // end methods

	ready: function ready() {

		$(function () {

			$('div.modal').on('hide.bs.modal', function () {
				$('.for-blurring').addClass('modal-unblur').removeClass('modal-blur');
				$('nav.navbar').addClass('modal-unblur').removeClass('modal-blur');
			});

			$('#becomeFan').on('mouseover', function () {
				$(this).attr('src', '/images/becomeFanHover.png');
			});
			$('#becomeFan').on('mouseout', function () {
				$(this).attr('src', '/images/becomeFan.png');
			});

			$('#isFan').on('mouseover', function () {
				$(this).attr('src', '/images/isFanHover.png');
			});
			$('#isFan').on('mouseout', function () {
				$(this).attr('src', '/images/isFan.png');
			});
		});
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n<div>\n\t<div v-show=\"requestFinished\">\n\t<!-- container for template -->\n\n\t\t<!-- no results for team, show message -->\n\t\t<div id=\"noTeam\" v-cloak=\"\" v-show=\"notFound\" class=\"f-el-fill text-center\">\n\t\t\t<h3>This team doesn't exist, you could create it <a v-link=\"{name: 'team', params: {name: 'create'}}\">here</a></h3>\n\t\t\t<br>\n\t\t\t<h4>If you think this is an error, try refreshing the page.</h4>\n\t\t</div>\n\n\t\t<!-- wrapper div around non-modal content for blurring -->\n\t\t<div v-cloak=\"\" v-else=\"\" class=\"Team for-blurring\">\n\t\t\n\n    \t<div class=\"Team__details\" :style=\"team.backdrop\">\n\t\t\t\t\n\t\t\t\t<div class=\"Team__pic\">\n\t\t\t\t\t<img width=\"250\" height=\"250\" :src=\"team.pic\">\n\t\t\t\t</div>\n\t\t\t\t\n\t\t\t\t<div class=\"black-container\">\n\t\t\t\t\t\n\t\t\t\t\t<div class=\"filler\"></div>\t\t\t\t\t\t\n\n\t\t\t\t\t<div class=\"Team__info__tabs\">\n\n\t\t\t\t\t\t<div class=\"filler\"></div>\n\t\t\t\t\t\t\n\t\t\t\t\t\t<div class=\"Team__info\">\n\t\t\t\t\t\t\t<div class=\"Team__text\">\n\t\t\t\t\t\t\t\t<h1 class=\"Team__name\">{{ team.name }}</h1>\n\t\t\t\t\t\t\t\t<div class=\"Team__slogan\">\n\t\t\t\t\t\t\t\t\t<i>{{ team.slogan }}</i>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class=\"Team__location\">\n\t\t\t\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t\t\t\t<i class=\"material-icons no-highlight\">place</i>\n\t\t\t\t\t\t\t\t\t\t{{ team.homefield + ', ' + team.city }}\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t</div>\t\n\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t<div class=\"Team__fans\">\n\t\t\t\t\t\t\t\t<div class=\"Team__join_buttons\">\n\t\t\t\t\t\t\t\t\t<!-- buttons for joining team, accepting invitation -->\n\t\t\t\t\t\t\t\t\t<div class=\"Team__invite\">\n\t\t\t\t\t\t\t\t\t\t<a class=\"btn btn-primary\" @click=\"requestToJoin('join')\">REQUEST TO JOIN</a>\n\n\t\t\t\t\t\t\t\t\t\t<a v-show=\"false\" class=\"btn btn-delete\" @click=\"requestToJoin('cancel')\">CANCEL REQUEST</a>\n\n\t\t\t\t\t\t\t\t\t\t<a v-show=\"false\" class=\"btn btn-success\" @click=\"respondToInv()\">RESPOND TO INVITATION</a>\n\n\t\t\t\t\t\t\t\t\t\t<a v-show=\"false\" class=\"btn btn-success --member\">YOU'RE A MEMBER</a>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class=\"num-fans\">\n\t\t\t\t\t\t\t\t\t<div class=\"fan-count\" :class=\"numFansClass\">\n\t\t\t\t\t\t\t\t\t\t<span v-if=\"!fansChanged\" :transition=\"numFansTransition\">{{ numFans }}</span>\n\t\t\t\t\t\t\t\t\t\t<span v-if=\"fansChanged\" :transition=\"numFansTransition\">{{ numFans }}</span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"arrow-right --white\"></div>\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t<div v-show=\"!isFan &amp;&amp; !isMember\" class=\"fan-icon\" @click=\"toggleFan\">\n\t\t\t\t\t\t\t\t\t<img src=\"/images/becomeFan.png\" width=\"35\" height=\"47\" alt=\"Become a fan\" id=\"becomeFan\">\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div v-show=\"isFan &amp;&amp; !isMember\" class=\"fan-icon\" @click=\"toggleFan\">\n\t\t\t\t\t\t\t\t\t<img src=\"/images/isFan.png\" width=\"35\" height=\"47\" alt=\"You're a fan\" id=\"isFan\">\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div v-show=\"isMember\" class=\"fan-icon --member\">\n\t\t\t\t\t\t\t\t\t<img src=\"/images/isFan.png\" width=\"35\" height=\"47\" alt=\"You're a member\">\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div> <!-- end  Team__fans -->\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class=\"Team__tabs\">\n\t\t\t\t\t\t\t<div class=\"tab\" :class=\"{'--active' : tab === 'calendar'}\" @click=\"tab = 'calendar'\">\n\t\t\t\t\t\t\t\t<div class=\"tab-box\"></div>\n\t\t\t\t\t\t\t\t<a id=\"calendarTab\">\n\t        \t\t\t\t<i class=\"material-icons\">date_range</i>CALENDAR\n\t\t            </a>\t\t\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"tab\" :class=\"{'--active' : tab === 'stats'}\" @click=\"tab = 'stats'\">\n\t\t\t\t\t\t\t\t<div class=\"tab-box\"></div>\n\t\t\t\t\t\t\t\t<a id=\"statsTab\">\n\t        \t\t\t\t<i class=\"material-icons\">trending_up</i>STATS\n\t\t            </a>\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"tab\" :class=\"{'--active' : tab === 'roster'}\" @click=\"tab = 'roster'\">\n\t\t\t\t\t\t\t\t<div class=\"tab-box\"></div>\n\t\t\t\t\t\t\t\t<a id=\"rosterTab\">\n\t        \t\t\t\t<i class=\"material-icons\">group</i>ROSTER\n\t\t            </a>\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div v-show=\"isAdmin\" class=\"tab\" :class=\"{'--active' : tab === 'settings'}\" @click=\"tab = 'settings'\">\n\t\t\t\t\t\t\t\t<div class=\"tab-box\"></div>\n\t\t\t\t\t\t\t\t<a id=\"settingsTab\">\n\t        \t\t\t\t<i class=\"material-icons\">settings</i>SETTINGS\n\t\t            </a>\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\t\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div> <!-- end team well -->\n\n\n\n\t\t\t\n\t\t\t<div> <!-- begin calendar/roster/stats/newsfeed container -->\n\n\n\t\t\t  <div class=\"row\">\n\t\t      <div class=\"col-xs-12 Team__calendar\" v-show=\"tab === 'calendar'\">\n\n\t        \t<rc-calendar :admin=\"isAdmin\" :events=\"events\"></rc-calendar>\n\n\t\t      </div>\n\t\t    </div>\n\n\n\n\t\t    <div class=\"row\">\n\t\t      <div class=\"col-xs-12 text-center Team__stats\" v-show=\"tab === 'stats'\">\n\n\t\t      \t<!-- links for switching tabs -->\n\t\t\t\t\t\t<div class=\"Tab__container\">\n\t\t\t\t\t\t\t<ul class=\"Tab__list\">\n\t\t\t\t\t      <li>\n\t\t\t\t\t        <a :class=\"['Tab', statsTab === 'teamRecent' ? 'Tab--active' : '']\" @click=\"statsTab = 'teamRecent'\">RECENT\n\t\t\t\t\t        </a>\n\t\t\t\t\t      </li>\n\t\t\t\t\t      <li>\n\t\t\t\t\t        <a :class=\"['Tab', statsTab === 'playerSeason' ? 'Tab--active' : '']\" @click=\"statsTab = 'playerSeason'\">PLAYER\n\t\t\t\t\t        </a>\n\t\t\t\t\t      </li>\n\t\t\t\t\t      <li>\n\t\t\t\t\t        <a :class=\"['Tab', statsTab === 'teamSeason' ? 'Tab--active' : '']\" @click=\"statsTab = 'teamSeason'\">SEASON\n\t\t\t\t\t        </a>\n\t\t\t\t\t      </li>\n\t\t\t\t\t    </ul>\n\t\t\t\t\t\t</div>\n\n\t        \t<rc-stats :type=\"statsTab\" :stats=\"stats\" :sport=\"team.sport\" :players=\"players\" pagination=\"false\" :team-cols=\"teamStatCols\" :player-cols=\"playerStatCols\">\n        \t\t</rc-stats>\n\t\t        \t\n\t\t      </div>\n\t\t    </div>\n\n\n\n\t\t    <div class=\"row\">\n\t\t      <div class=\"col-xs-12 Team__roster\" v-show=\"tab === 'roster'\">\n\n\t\t        <rc-roster :players=\"players\" :coaches=\"coaches\" :fans=\"fans\" :edit-user.sync=\"editUser\" :admin=\"isAdmin\">\n\t\t        </rc-roster>\t\t\n\n\t\t      </div>\n\t\t    </div>\n\n\n\t\t     <div class=\"row\">\n\t\t      <div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 Team__edit\" v-show=\"tab === 'settings'\">\n\n\t        \t<h3>Settings</h3>\n\t        \t\n\n\t\t        \t\n\t\t      </div>\n\t\t    </div>\n\t    </div>\n\n\t\t\t\n\t\t\t<div class=\"row\">\n\t\t\t\t<div class=\"col-xs-12 Team__feed\">\n\t\t\t\t\t<div class=\"row\">\n\n\t\t\t\t\t\t<div class=\"col-xs-12 Team__feed_divider\">\n\t\t\t\t\t\t\t<div class=\"divider\">\n\t\t\t\t\t\t\t\t<div class=\"divider-text\">\n\t\t\t\t\t\t\t\t\t<span class=\"--twotone\">NEWS FEED</span>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class=\"row\">\n\t\t\t\t\t\t<div class=\"col-xs-12\">\n\n\t\t\t\t\t\t\t<!-- <rc-news-feed type=\"team\" :feed=\"feed\" :users=\"users\"></rc-news-feed> -->\n\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t\n\t\t\t<!-- include the footer at bottom -->\n\t\t\t<div class=\"Footer\">\n\t\t    <p>® 2016 Rookiecard LLC</p>\n\t\t\t</div>\n\n\t\t</div>\n\t  <!--  end of blurring wrapper --> \n\t  <!-- keep modals below here so the background blurs properly -->\n\n\n\n    <!-- inside here is complex logic handling what happens when an event is \n    \t\t\tclicked on from calendar or news feed -->\n\t\t<rc-view-event :admin=\"isAdmin\" :events=\"events\" :stats=\"stats\" :team=\"team\" :auth=\"auth\" :players=\"players\" :team-cols=\"teamStatCols\" :player-cols=\"playerStatCols\">\n\t\t</rc-view-event>\n\n\n\n    <!-- modal window for adding events -->\n    <div class=\"modal\" id=\"addEventModal\" role=\"dialog\" aria-hidden=\"true\">\n      <div class=\"modal-dialog\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n            <h3 class=\"modal-title\">Add an Event</h3>\n          </div>\n          <div class=\"modal-body\">\n            <div class=\"row\">\n                 \n\t\t\t\t\t\t\t<rc-add-event></rc-add-event>\n\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n\n\n    <!-- modal for editing a player in the roster -->\n\t\t<div class=\"modal\" id=\"rosterModal\" role=\"dialog\" aria-hidden=\"true\">\n      <div class=\"modal-dialog\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n            <h3 v-show=\"(editUser.member_id) &amp;&amp; !editUser.new\" class=\"modal-title\">{{ editUser.firstname + ' ' + editUser.lastname }}</h3>\n            <h3 v-show=\"editUser.new &amp;&amp; editUser.role === 1\" class=\"modal-title\">Add a Player</h3>\n            <h3 v-show=\"editUser.new &amp;&amp; editUser.role === 3\" class=\"modal-title\">Add a Coach</h3>\n          </div>\n          <div class=\"modal-body\">\n          \t<div class=\"row\">\n            \n\t\t\t\t\t\t\t<rc-edit-user v-if=\"editUser.member_id || editUser.new\" :user=\"editUser\" :positions=\"positions\"></rc-edit-user>\n\n\t\t\t\t\t\t</div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n\n\n\n <!-- end container for template -->\n  </div>  \n</div>\n\n\n\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".Team {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Team__details {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  margin-bottom: 35px;\n  padding: 110px 0 0 0px;\n  background-size: cover;\n  background-attachment: fixed;\n}\n.Team__pic {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  padding-left: 40px;\n  max-width: 290px;\n  -webkit-transform: translate(0, 125px);\n          transform: translate(0, 125px);\n}\n.Team__pic img {\n  border-radius: 50%;\n  border: 3px solid #fff;\n}\n.black-container {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  background: rgba(0,0,0,0.7);\n}\n.black-container .filler {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.Team__info__tabs {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column;\n      flex-flow: column;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  -webkit-box-flex: 3;\n      -ms-flex: 3;\n          flex: 3;\n  padding: 0;\n}\n.Team__info {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n}\n.Team__text {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: column wrap;\n      flex-flow: column wrap;\n  color: #fff;\n}\n.Team__tabs {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n}\n.Team__name {\n  -ms-flex-preferred-size: 1;\n      flex-basis: 1;\n  font-size: 42px;\n}\n.Team__location {\n  padding-left: 22px;\n  -ms-flex-preferred-size: 1;\n      flex-basis: 1;\n  margin-top: 15px;\n  font-size: 16px;\n}\n.Team__location span {\n  position: relative;\n}\n.Team__location .material-icons {\n  position: absolute;\n  font-size: 21px;\n  left: -27px;\n  top: -2px;\n}\n.Team__slogan {\n  -ms-flex-preferred-size: 1;\n      flex-basis: 1;\n  margin-top: 15px;\n  font-size: 16px;\n}\n.Team__fans {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-align: end;\n      -ms-flex-align: end;\n          align-items: flex-end;\n  margin-top: 20px;\n}\n.Team__fans .num-fans {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  overflow: hidden;\n  height: 44px;\n  width: 70px;\n}\n.Team__fans .num-fans .fan-count {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  background-color: #fff;\n  min-width: 61px;\n  height: 44px;\n  font-size: 17px;\n  border-radius: 10%;\n  color: #7b7b7b;\n}\n.Team__fans .num-fans .fan-count span {\n  position: absolute;\n  top: 8px;\n  right: 33px;\n}\n.Team__fans .num-fans .fan-count.--tensOfFans span {\n  right: 30px;\n}\n.Team__fans .num-fans .fan-count.--hundredsOfFans span {\n  right: 24px;\n}\n.Team__fans .num-fans .fan-count.--thousandsOfFans span {\n  right: 19px;\n}\n.Team__fans .num-fans .arrow-right {\n  position: absolute;\n  top: 5px;\n  right: 4px;\n  margin-top: 9px;\n  height: 0;\n  width: 0;\n  border-bottom: 6px solid transparent;\n  border-top: 6px solid transparent;\n  border-left: 6px solid #fff;\n}\n.Team__fans .fan-icon {\n  margin-left: 2px;\n}\n.Team__fans .fan-icon:hover {\n  cursor: pointer;\n}\n.Team__fans .fan-icon.--member:hover {\n  cursor: default;\n}\n.Team__invite {\n  background: #fff;\n  border-radius: 5px;\n  margin-right: 15px;\n}\n.Team__invite a.btn.outline,\n.Team__invite a.btn {\n  border: 0;\n  margin: 0;\n}\n.Team__invite a.btn.outline:hover,\n.Team__invite a.btn:hover {\n  border: 0;\n}\n.Team__invite a.btn.outline.--member:hover,\n.Team__invite a.btn.--member:hover {\n  cursor: default;\n  color: #fff;\n  background-color: #21c230;\n}\n.Team__tabs {\n  margin-top: 25px;\n  height: 45px;\n  padding: 0;\n  overflow: visible;\n}\n.Team__tabs .tab {\n  width: 200px;\n  position: relative;\n  height: 45px;\n  float: left;\n  overflow: hidden;\n  margin: 0 -15px 0 0;\n}\n.Team__tabs .tab .tab-box {\n  height: 53px;\n  background: #ccc;\n  border-radius: 6px;\n  border: 1px solid rgba(128,128,128,0.44);\n  border-bottom: 9px solid rgba(128,128,128,0.44);\n  margin: 0 7px 0;\n  box-shadow: 0 0 2px #fff inset;\n  -webkit-transform: perspective(100px) rotateX(23deg);\n          transform: perspective(100px) rotateX(23deg);\n  -webkit-transition: background 0.3s, border-bottom 0.05s;\n  transition: background 0.3s, border-bottom 0.05s;\n}\n.Team__tabs .tab a {\n  color: #1179c9;\n  -webkit-transition: color 0.3s;\n  transition: color 0.3s;\n}\n.Team__tabs .tab:hover {\n  cursor: pointer;\n}\n.Team__tabs .tab:hover .tab-box {\n  background: #fff;\n  -webkit-transition: background 0.3s;\n  transition: background 0.3s;\n}\n.Team__tabs .tab:hover a {\n  color: #38a9f9;\n  -webkit-transition: color 0.3s;\n  transition: color 0.3s;\n}\n.Team__tabs .tab.--active {\n  z-index: 40;\n  position: relative;\n  padding-bottom: 1px;\n}\n.Team__tabs .tab.--active .tab-box {\n  background-color: #f5f5f5;\n  border-bottom: 0;\n  -webkit-transition: border-bottom 0.05s;\n  transition: border-bottom 0.05s;\n  box-shadow: 0 0 2px #fff inset;\n}\n.Team__tabs .tab.--active a,\n.Team__tabs .tab.--active:hover {\n  cursor: default;\n  color: #000;\n}\n.Team__feed {\n  background: #ebebeb;\n  margin-top: 4em;\n}\n.Team__feed_divider {\n  margin: 65px 0px 105px 0px;\n}\n.Team__stats {\n  padding: 0 2em;\n}\n#calendarTab {\n  position: absolute;\n  top: 17px;\n  left: 69px;\n}\n#calendarTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#statsTab {\n  position: absolute;\n  top: 17px;\n  left: 84px;\n}\n#statsTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#rosterTab {\n  position: absolute;\n  top: 17px;\n  left: 81px;\n}\n#rosterTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#settingsTab {\n  position: absolute;\n  top: 15px;\n  left: 74px;\n}\n#settingsTab i {\n  position: absolute;\n  font-size: 24px;\n  left: -28px;\n  top: -3px;\n}\n#noTeam {\n  margin-top: 80px;\n}\nrc-stats {\n  padding: 2em;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-ad3660f2", module.exports)
  } else {
    hotAPI.update("_v-ad3660f2", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"./AddEvent.vue":53,"./Calendar.vue":57,"./EditUser.vue":61,"./NewsFeed.vue":63,"./Roster.vue":64,"./Stats.vue":65,"./ViewEvent.vue":67,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],67:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert(".edit-button {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.edit-button .btn {\n  padding-left: 14px;\n}\n.edit-button #edit-chevron {\n  position: absolute;\n  top: 17px;\n  right: -4px;\n  font-size: 30px;\n}\n.ViewEvent div {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  text-align: center;\n  font-size: 25px;\n  margin-bottom: 25px;\n}\n.ViewEvent__details {\n  font-weight: bold;\n}\n.ViewEvent__type.--practice {\n  color: #329acf;\n}\n.ViewEvent__type.--home {\n  color: #c90018;\n}\n.ViewEvent__type.--away {\n  color: #f2d500;\n}\n.ViewEvent__type.--special {\n  color: #76af00;\n}\n.modal {\n  padding: 0;\n}\n.stats-modal .modal-dialog {\n  width: 90%;\n}\n")
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _EditEvent = require('./EditEvent.vue');

var _EditEvent2 = _interopRequireDefault(_EditEvent);

var _EditBasketballStats = require('./EditBasketballStats.vue');

var _EditBasketballStats2 = _interopRequireDefault(_EditBasketballStats);

var _Stats = require('./Stats.vue');

var _Stats2 = _interopRequireDefault(_Stats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	name: 'ViewEvent',

	props: ['team', 'events', 'stats', 'players', 'admin', 'teamCols', 'playerCols'],

	components: {
		'rc-edit-event': _EditEvent2.default,
		'rc-stats': _Stats2.default,
		'rc-basketball': _EditBasketballStats2.default
	},

	data: function data() {
		var prefix = this.$parent.prefix;

		return {
			prefix: prefix,
			event: {
				start: 0,
				title: '',
				type: 0
			},
			teamStatCols: [],
			playerStatCols: [],
			editEvent: false,

			currStats: {}
		};
	},


	watch: {
		event: function event() {
			// new event, reset this flag to hide EditEvent.vue
			this.editEvent = false;
		}
	},

	computed: {

		// FUTURE EVENTS

		// event has NOT happened yet, user is admin
		canEditEvent: function canEditEvent() {
			return moment().isBefore(moment.unix(this.event.start)) && this.admin;
		},


		// event has NOT happened yet, user is NOT an admin
		futureEvent: function futureEvent() {
			return moment().isBefore(moment.unix(this.event.start)) && !this.admin;
		},


		// PAST EVENTS

		// event has happened, user is admin, event was a game
		canEditStats: function canEditStats() {
			if (this.editEvent) {
				// user wants to specifically edit the event regardless of date
				return false;
			} else return moment().isAfter(moment.unix(this.event.start)) && this.admin && (this.event.type === 'home_game' || this.event.type === 'away_game');
		},


		// event has happened, user is an admin, event was NOT a game
		pastEventNoStats: function pastEventNoStats() {
			if (this.editEvent) return false;else return moment().isAfter(moment.unix(this.event.start)) && this.admin && (this.event.type !== 'home_game' || this.event.type !== 'away_game');
		},


		// event has happened, user is NOT an admin, event was a game
		pastEventStats: function pastEventStats() {
			return moment().isAfter(moment.unix(this.event.start)) && !this.admin && (this.event.type === 'home_game' || this.event.type === 'away_game');
		},


		// event has happened, user is NOT an admin, event was NOT a game
		pastEvent: function pastEvent() {
			return moment().isAfter(moment.unix(this.event.start)) && !this.admin && !this.pastEventStats;
		},


		// SOME EXTRA LOGIC FOR CHOOSING WHAT TO SHOW

		// only for choosing how wide to make the modal window
		showStats: function showStats() {
			if (this.editEvent) {
				// user wants to specifically edit the event regardless of date
				return false;
			} else return this.pastEventStats || this.canEditStats;
		},


		// show basketball stats
		basketball: function basketball() {
			return this.team.sport === 'basketball';
		}
	},

	methods: {

		// find which event was clicked and display
		viewEvent: function viewEvent(id) {
			// pass along event data
			var event = this.events.filter(function (event) {
				return event.id === id;
			});

			// pass along any existing user stats for this event
			var stats = this.stats.filter(function (stat) {
				return stat.event_id === id;
			});

			this.event = event[0];

			if (this.futureEvent || this.pastEvent) {
				// if just showing info about the event to a non admin, pick CSS class for title
				switch (this.event.type) {
					case 0:
						// practice
						this.event.titleClass = 'practice';
						break;
					case 1:
						// home game
						this.event.titleClass = 'home';
						break;
					case 2:
						// away game
						this.event.titleClass = 'away';
						break;
					case 3:
						// special event
						this.event.titleClass = 'other';
						break;
				}
			}

			this.currStats = stats;

			// show modal
			this.$root.showModal('viewEventModal');
		}
	},

	ready: function ready() {

		// attach jquery listeners for click on events
		// wait long enough to ensure calendar is fully loaded
		setTimeout(function () {
			// for clicks on calendar events
			$('.Calendar__container').on('click touchstart', 'a.event-trigger', function (e) {
				this.viewEvent($(e.target).data('event-id'));
			}.bind(this));

			// for clicks on news feed event links
			$('.Feed').on('click touchstart', 'a.event-trigger', function (e) {
				this.viewEvent($(e.target).data('event-id'));
			}.bind(this));
		}.bind(this), 1000);
	}
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n\t\t\n\n    <div class=\"modal\" :class=\"showStats ? 'stats-modal' : ''\" id=\"viewEventModal\">\n    \t<!-- modal window for viewing an event when clicked from the calendar -->\n      <div class=\"modal-dialog\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n            <h3 class=\"modal-title\">{{ event.title }}&nbsp;</h3>\n          </div>\n          <div class=\"modal-body\">\n\t\t\t\t\t\t<div class=\"row\">\n\n\n\t\t\t\t\t\t\t<!-- the following shows the correct content based on date, event type, admin status, sport -->\n\n\n\t\t\t\t\t\t\n\t\t\t\t\t\t\t<!-- show stats if they aren't admin and is past event -->\n\t\t\t\t\t\t\t<rc-stats v-show=\"pastEventStats\" type=\"event\" :sport=\"team.sport\" :stats=\"currStats\" :team=\"team\" :players=\"players\" :event=\"event\" :team-cols=\"teamStatCols\" :player-cols=\"playerStatCols\"></rc-stats>\n\n\n\t\t\t\t\t\t\t<!-- show edit event page if admin and event is in the future -->\n\t\t\t\t\t\t\t<rc-edit-event v-show=\"canEditEvent || editEvent\" :event=\"event\" :edit-event.sync=\"editEvent\"></rc-edit-event>\n\n\n\n\t\t\t\t\t\t\t<!-- if showing edit stats, choose the correct sport -->\n\t\t\t\t\t\t\t<div v-show=\"canEditStats\">\n\n\t\t\t\t\t\t\t\t<rc-basketball v-if=\"basketball\" :stats=\"currStats\" :players=\"players\" :edit-event.sync=\"editEvent\" :event=\"event\" :team=\"team\" :team-cols=\"teamCols\" :player-cols=\"playerCols\"></rc-basketball>\n\t\t\t\t\t\t\t</div>\t\t\n\n\n\t\t\t\t\t\t\t<div v-show=\"pastEventNoStats\" class=\"col-xs-12 ViewEvent\">\n\t\t\t\t\t\t\t\t<div class=\"edit-button\">\n\t\t\t\t\t\t\t\t\t<a class=\"btn btn-primary\" @click=\"editEvent = true\">Edit Event Details</a>\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t<div v-if=\"event.details\" class=\"ViewEvent__details\">\n\t\t\t\t\t\t\t\t\t<p>This event is over and wasn't set up as a Game, so there are no stats</p>\n\t\t\t\t\t\t\t\t</div>\n\t\n\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t\t\t\t\n\n\n\t\t\t\t\t\t\t\n\n\t\t\t\t\t\t\t<div v-show=\"(futureEvent || pastEvent) &amp;&amp; event.id\" class=\"col-xs-12 ViewEvent\">\n\n\t\t\t\t\t\t\t\t<div class=\"ViewEvent__type --{{ event.titleClass }}\">{{ event.title }}</div>\n\t\t\t\t\t\t\t\t<div class=\"ViewEvent__time\">{{ event.start | formatTimeString event.end }}</div>\n\t\t\t\t\t\t\t\t<div v-if=\"event.details\" class=\"ViewEvent__details\">{{ event.details }}</div>\n\n\t\t\t\t\t\t\t</div>\n\n\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n          </div>\n        </div>\n      </div>\n    \n\t\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache[".edit-button {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row;\n      flex-flow: row;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.edit-button .btn {\n  padding-left: 14px;\n}\n.edit-button #edit-chevron {\n  position: absolute;\n  top: 17px;\n  right: -4px;\n  font-size: 30px;\n}\n.ViewEvent div {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n      flex-flow: row wrap;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  text-align: center;\n  font-size: 25px;\n  margin-bottom: 25px;\n}\n.ViewEvent__details {\n  font-weight: bold;\n}\n.ViewEvent__type.--practice {\n  color: #329acf;\n}\n.ViewEvent__type.--home {\n  color: #c90018;\n}\n.ViewEvent__type.--away {\n  color: #f2d500;\n}\n.ViewEvent__type.--special {\n  color: #76af00;\n}\n.modal {\n  padding: 0;\n}\n.stats-modal .modal-dialog {\n  width: 90%;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-ab103d8a", module.exports)
  } else {
    hotAPI.update("_v-ab103d8a", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"./EditBasketballStats.vue":59,"./EditEvent.vue":60,"./Stats.vue":65,"vue":51,"vue-hot-reload-api":25,"vueify/lib/insert-css":52}],68:[function(require,module,exports){
'use strict';

//formats the json version of a stat name to the basketball version
module.exports = function (val) {

	//if key is 'win', return 'W/L'
	if (val === 'win') return 'W/L';

	//'astto' becomes 'AST/TO'
	if (val === 'astto') return 'AST/TO';

	if (val === 'opp') return 'OPPONENT';

	//everywhere with a _ becomes a %
	val = val.replace(/_/g, '%');

	//everywhere with a - becomes a /
	val = val.replace(/-/g, '/');

	//everywhere there's a 'three' becomes a '3'
	val = val.replace(/three/g, '3');

	//and also return all capitalized
	return val.toUpperCase();
};

},{}],69:[function(require,module,exports){
'use strict';

//converts column name to human for stats table tooltips

module.exports = function (val) {
	switch (val) {
		case 'date':
			return 'Date of Game';
			break;
		case 'opp':
			return 'Opponent';
			break;
		case 'win':
			return 'Win or Loss';
			break;
		case 'gs':
			return 'Games Started';
			break;
		case 'gp':
			return 'Games Played';
			break;
		case 'min':
			return 'Minutes Played';
			break;
		case 'dnp':
			return 'Did Not Play';
			break;
		case 'pts':
			return 'Points';
			break;
		case 'fgm':
			return 'Field Goals Made';
			break;
		case 'fga':
			return 'Field Goals Attempted';
			break;
		case 'fg_':
			return 'Field Goal Percentage';
			break;
		case 'threepm':
			return 'Three Pointers Made';
			break;
		case 'threepa':
			return 'Three Pointers Attempted';
			break;
		case 'threep_':
			return 'Three Point Percentage';
			break;
		case 'ftm':
			return 'Free Throws Made';
			break;
		case 'fta':
			return 'Free Throws Attempted';
			break;
		case 'ft_':
			return 'Free Throw Percentage';
			break;
		case 'ast':
			return 'Assists';
			break;
		case 'reb':
			return 'Rebounds';
			break;
		case 'oreb':
			return 'Offensive Rebounds';
			break;
		case 'stl':
			return 'Steals';
			break;
		case 'blk':
			return 'Blocks';
			break;
		case 'to':
			return 'Turnovers';
			break;
		case 'pf':
			return 'Personal Fouls';
			break;
		case 'dd2':
			return 'Double Doubles';
			break;
		case 'td3':
			return 'Triple Doubles';
			break;
		case 'efg_':
			return 'Effective Field Goal Percentage';
			break;
		case 'ts_':
			return 'True Shooting Percentage';
			break;
		case 'astto':
			return 'Assist to Turnover Ratio';
			break;
		case 'eff':
			return 'Player Efficiency';
			break;

		default:
			return '';
			break;
	}
};

},{}],70:[function(require,module,exports){
'use strict';

module.exports = function (string) {

  //split up string of data into array
  var data = string.split(':');

  var start = moment(data[0] * 1000);
  var end = moment(data[1] * 1000);
  var daysOfWeek = data[2].split(',');
  var count = daysOfWeek.length;

  //initialize the human version of repeating string
  var prefix = 'Repeats every';
  var suffix = ' from ' + start.format('MMM. D') + ' until ' + end.format('MMM. D');

  //trivial if it repeats everyday
  if (count === 7) {
    prefix = 'Everyday';
    return prefix + suffix;
  }

  var done = false;
  for (var x = 0; x < count; x++) {
    if (x === count - 1) {
      if (count > 1)
        //on last repeating day, add an 'and'
        prefix = prefix + ' and';
      done = true;
    }
    switch (daysOfWeek[x]) {
      //tack on name of day of week
      case 'Su':
        prefix = prefix + ' Sunday';
        break;
      case 'M':
        prefix = prefix + ' Monday';
        break;
      case 'T':
        prefix = prefix + ' Tuesday';
        break;
      case 'W':
        prefix = prefix + ' Wednesday';
        break;
      case 'R':
        prefix = prefix + ' Thursday';
        break;
      case 'F':
        prefix = prefix + ' Friday';
        break;
      case 'S':
        prefix = prefix + ' Saturday';
        break;
    }
    if (!done && count > 2)
      //and add a comma
      prefix = prefix + ',';
  }

  return prefix + suffix;
};

},{}],71:[function(require,module,exports){
'use strict';

//formats the time string to be as readable as possible
module.exports = function (start, end) {

  start = moment.utc(start * 1000).local();
  end = moment.utc(end * 1000).local();

  var startTime, endTime;

  if (moment(start).isSame(end, 'day')) {
    //starts and stops on same day, drop date in string

    if (moment(start).hour() < 12 && moment(end).hour() < 12 || moment(start).hour() >= 12 && moment(end).hour() >= 12) {
      //both are am or pm, drop that from string as well
      var startTime = moment(start).format('MMM.   Do h:mm');
      var endTime = moment(end).format('h:mm a');
    } else {
      var startTime = moment(start).format('MMM.   Do h:mm a');
      var endTime = moment(end).format('h:mm a');
    }
    return startTime + " – " + endTime;
  } else {
    return moment(start).format('MMM.   Do h:mm a') + ' - ' + moment(end).format('MMM.   Do h:mm a');
  }
};

},{}],72:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {
	methods: {
		// send a GET request with the given parameters
		// execute the given event string when finished
		get: function get(url) {
			var successEvent = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var data = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
			var failEvent = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			var self = this;
			this.$http.get(url, data).then(function (response) {
				if (!response.data.ok) {
					throw response.data.error;
				}

				if (successEvent) {
					self.$broadcast(successEvent, response);
				}
			}).catch(function (response) {
				if (failEvent) {
					self.$broadcast(failEvent, response);
				} else {
					self.errorMsg(response);
				}
			});
		},


		// send a POST request with the given parameters
		// execute the given event string when finished
		post: function post(url) {
			var successEvent = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var data = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
			var failEvent = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			var self = this;
			this.$http.post(url, data).then(function (response) {
				if (!response.data.ok) {
					throw response.data.error;
				}

				if (successEvent) {
					self.$broadcast(successEvent, response);
				}
			}).catch(function (response) {
				if (failEvent) {
					self.$broadcast(failEvent, response);
				} else {
					self.errorMsg(response);
				}
			});
		},


		// send a PUT request with the given parameters
		// execute the given event string when finished
		put: function put(url) {
			var successEvent = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var data = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
			var failEvent = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			var self = this;
			this.$http.put(url, data).then(function (response) {
				if (!response.data.ok) {
					throw response.data.error;
				}

				if (successEvent) {
					self.$broadcast(successEvent, response);
				}
			}).catch(function (response) {
				if (failEvent) {
					self.$broadcast(failEvent, response);
				} else {
					self.errorMsg(response);
				}
			});
		},


		// send a DELETE request with the given parameters
		// execute the given event string when finished
		delete: function _delete(url) {
			var successEvent = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var data = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
			var failEvent = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			var self = this;
			this.$http.delete(url, data).then(function (response) {
				if (!response.data.ok) {
					throw response.data.error;
				}

				if (successEvent) {
					self.$broadcast(successEvent, response);
				}
			}).catch(function (response) {
				if (failEvent) {
					self.$broadcast(failEvent, response);
				} else {
					self.errorMsg(response);
				}
			});
		}
	}
};

},{}],73:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
// set up detection on stats tables for whether or not there is more data hidden and needs to be scrolled
// jQuery listeners wait for scroll, update overflow object in parent
exports.default = {
	data: function data() {
		return {
			overflowed: {}
		};
	},


	methods: {

		// checks to see if that element is visible on screen or not
		isHidden: function isHidden(element) {
			element = element[0];
			var rect = element.getBoundingClientRect();
			return !(rect.top >= 0 && rect.left >= 0 && rect.bottom <= ($(window).innerHeight() || $(window).height()) && rect.right <= ($(window).innerWidth() || $(window).width()));
		},


		// set up listeners to constantly check visibility on scroll
		attachScrollListener: function attachScrollListener(element, overflowIndex) {
			var firstElement = $(element + ' th:first-child');
			var lastElement = $(element + ' th:last-child');
			var parent = $(element);

			this.$set('overflowed.' + overflowIndex, { first: false, last: false });

			this.overflowed[overflowIndex].last = this.isHidden(lastElement);

			var self = this;
			// listen for scroll, update the flag if now in view
			parent.on('scroll', function () {
				self.overflowed[overflowIndex].first = self.isHidden(firstElement);
				self.overflowed[overflowIndex].last = self.isHidden(lastElement);
			});
		}
	}

};

},{}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {
	data: function data() {
		return {
			// optional stats inputted by user
			userStatsList: {},

			// stats calculated by rookiecard
			rcStatsList: {},

			// the pre-selected ones for user inputs
			userSelected: [],

			// the pre-selected ones for rc calculated
			rcSelected: [],

			// array of the keys of the objects
			userStatKeys: [],
			rcStatKeys: []
		};
	},


	methods: {
		initSelections: function initSelections(sport) {
			this.getStatsBySport(sport);
		},


		// calculates which stats are disabled or not
		setDependencies: function setDependencies() {
			var stats = this.rcStatsList;

			// loop through all the keys, check their dependencies and enable/disable
			var count = 0;
			for (var key in stats) {
				var disabled = false;
				var text = '';
				for (var x = 0; x < stats[key].req.length; x++) {
					// check that the required stats are already checked
					var req = stats[key].req[x];
					if (this.userSelected.indexOf(req) === -1 && this.rcSelected.indexOf(req) === -1) {
						// they don't have all the requirements needed for this statistic, disable the option
						disabled = true;
						text = stats[key].subtext;

						// uncheck on the picker if it's selected already
						var index = this.userSelected.indexOf(key);
						if (index !== -1) {
							this.userSelected.splice(index, 1);
						}
						var index = this.rcSelected.indexOf(key);
						if (index !== -1) {
							this.rcSelected.splice(index, 1);
						}
					}
				}
				// is this stat option currently disabled?
				stats[key].disabled = disabled;
				// add option subtext to explain disabled stat's requirements
				$('[CreateTeam="rcStats"] > option:eq(' + count + ')').data('subtext', text);
				count++;
			}
			this.rcStatsList = stats;

			setTimeout(function () {
				this.$dispatch('renderSelectPicker');
			}.bind(this), 50);
		},


		// request all the stat columns for this sport from the server
		getStatsBySport: function getStatsBySport(sport) {
			var url = this.prefix + '/stats/' + sport;
			var self = this;
			this.$http.get(url).then(function (response) {
				self.userStatsList = response.data.user;
				self.rcStatsList = response.data.rc;
				self.userSelected = response.data.userSelected;
				self.rcSelected = response.data.rcSelected;
				self.userStatKeys = Object.keys(response.data.user);
				self.rcStatKeys = Object.keys(response.data.rc);
				self.setDependencies();
				setTimeout(function () {
					self.$dispatch('initSelectPicker');
				}, 50);
			}).catch(function () {
				self.$root.banner('bad', 'There was a server problem, try refreshing the page before continuing');
			});
		}
	}
};

},{}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Validator mixin inspired by Laravel's Validator API
 */
exports.default = {
	data: function data() {
		return {
			errors: {},
			vars_: {},
			errMsg_: {},
			validRules_: {
				required: function required(args) {
					return this.required_(args);
				}, // the field needs to have something in it
				max: function max(args) {
					return this.max_(args);
				}, // the field must be less than a given argument in length or size
				min: function min(args) {
					return this.min_(args);
				}, // the field must be greater than a given argument in length or size
				size: function size(args) {
					return this.size_(args);
				}, // the field must be of a given size in length or value
				equals: function equals(args) {
					return this.equals_(args);
				}, // the field must equal to a given value
				in: function _in(args) {
					return this.in_(args);
				}, // the field must equal one of the given arguments
				boolean: function boolean(args) {
					return this.boolean_(args);
				}, // the field must be a boolean
				string: function string(args) {
					return this.string_(args);
				}, // the field must be a string
				number: function number(args) {
					return this.number_(args);
				}, // the field must be a number
				array: function array(args) {
					return this.array_(args);
				}, // the field must be an array
				regex: function regex(args) {
					return this.regex_(args);
				}, // the field must be a string that matches a given regular expression. BE CAREFUL, DON'T INCLUDE PIPES! 
				alpha_num: function alpha_num(args) {
					return this.alphaNum(args);
				}, // the field must be a string with only alphanumeric characters
				email: function email(args) {
					return this.email_(args);
				}, // the field must be a valid email
				jersey: function jersey(args) {
					return this.jersey_(args);
				} },
			value_: null, // the value of the variable in question
			path_: null, // the full path of the variable (e.g. user.name.firstname)
			root_: null, // the name of the root of the variable (e.g. user)
			key_: null, // string of keys off of the root variable that make up the full path
			rules_: null, // the rules applied to this variable
			messages_: null, // the error messages to set
			count_: null, // the index into the array counter
			isArray_: null, // whether or not the given variable is an array
			arrayIndex_: null, // which index of the given array to error check
			temp_: {} };
	},


	methods: {
		/**
   * Register a given variable for error checking against given rules
   * 
   * @param {string} variable The variable being registered for error checking		
   * @param {string} rules    Rules that should be applied to the variable
   * @param {array} messages  Error messages (can be up to one-to-one with rules or less)
   * @param {boolean} watch  	Whether or not to run error checking when the variable changes
   * @return {void} 
   */
		registerErrorChecking: function registerErrorChecking(variable, rules) {
			var messages = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
			var watch = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

			this.path_ = variable;
			this.root_ = variable;
			this.rules_ = rules;
			this.messages_ = messages;
			this.count_ = 0;
			this.isArray_ = false;
			this.key_ = '';

			// variable could have various indices beyond just the root
			// split into an array for ease
			variable = variable.split('.');

			if (variable.length > 1) {

				this.root_ = variable[0];

				if (variable[1] === '*') {
					// dealing with an array
					this.isArray_ = true;
					this.path_ = this.root_;
					this.key_ = '';

					if (variable.length > 2) {
						// variable looks like 'players.*.name.firstname', save those extra keys
						this.key_ = variable.slice(2).join('.');
						this.path_ = this.root_ + '.' + this.key_;
					}
				} else {
					// variable looks like 'player.name'
					this.key_ = variable.slice(1).join('.');
					this.path_ = this.root_ + '.' + this.key_;
				}
			}

			this.register_();

			if (watch) {
				// whenever this variable changes, re-run the error check
				var root_ = this.root_;
				this.$watch(this.root_, function () {
					this.errorCheck(root_);
				});
			}
		},


		/**
   * Register the saved attributes for error checking
   *
   * @return {void}
   */
		register_: function register_() {
			if (typeof this.vars_[this.root_] === 'undefined') {
				// new entry
				this.$set('vars_.' + this.root_, {
					rules: [this.addRules()],
					isArray: this.isArray_,
					keys: [this.key_]
				});
			} else {
				// add these rules
				if (this.checkForConflicts()) {
					return;
				}
				this.vars_[this.root_].rules.push(this.addRules());
				this.vars_[this.root_].keys.push(this.key_);
			}

			if (!this.isArray_) {
				// initialize errors to an empty string
				this.$set('errors.' + this.path_, '');
			} else {
				// initialize errors to array of empty strings
				this.initializeErrorArray();
			}
		},


		/**
   * Process for initializing errors object with array of empty strings
   *
   * @return {void} 
   */
		initializeErrorArray: function initializeErrorArray() {
			this.value_ = this.$get(this.root_);

			if (typeof this.errors[this.root_] === 'undefined') {
				this.errors[this.root_] = [];
			}

			this.temp_ = {};
			this.$set('temp_.' + this.key_, ''); // build a placeholder to insert

			// create an error message for each index
			// like: errors.players[x].name.firstname
			for (var x = 0; x < this.value_.length; x++) {
				if (typeof this.errors[this.root_][x] === 'undefined') {
					// new entry
					this.errors[this.root_].$set(x, this.temp_);
				} else {
					// copy over existing content and the new 
					for (var key in this.temp_) {
						this.errors[this.root_][x][key] = this.temp_[key];
					}
				}
			}
		},


		/**
   * Format the rules and store for this variable
   *
   * @return {object}
   */
		addRules: function addRules() {
			var rules = {};
			this.rules_ = this.rules_.split('|');

			for (var rule in this.rules_) {
				// split rule and arguments apart (like: ['in', 'dog,cat,mouse'])
				var splitRule = this.rules_[rule].split(':');
				rule = splitRule[0]; // save the rule (like: 'in');

				this.validateRule(rule);

				// save the error message for this rule
				var msg = this.getErrorMessage();
				this.$set('errMsg_.' + this.path_ + '.' + rule, msg);
				this.count_++;

				if (splitRule.length > 1) {
					rules[rule] = this.formatArguments(splitRule);
				} else {
					// attach no arguments
					rules[rule] = [];
				}
			}

			return rules;
		},


		/**
   * Return the appropriate error message for this rule
   *
   * @return {string}
   */
		getErrorMessage: function getErrorMessage() {
			if (!this.messages_.length) {
				return "Invalid input";
			}

			if (typeof this.messages_ === 'string') {
				return this.messages_;
			}

			if (this.count_ >= this.messages_.length) {
				// use the last given one, it probably applies for both
				return this.messages_[this.messages_.length - 1];
			}

			return this.messages_[this.count_];
		},


		/**
   * Parse and format the arguments given with each rule
   *
   * @param {array} rule (looks like: ['in', 'cat,dog,mouse'])
   * @return {array}
   */
		formatArguments: function formatArguments(rule) {
			if (rule[0] === 'regex') {
				// regex could have commas
				var args = rule[1];
			} else {
				var args = rule[1].split(',');
			}
			for (var arg in args) {
				// if they're able to convert to integers, do so
				if (parseFloat(args[arg])) {
					args[arg] = parseFloat(args[arg]);
				}
			}

			return args;
		},


		/**
   * Make sure the given rule is valid before assigning it
   *
   * @param {string} rule
   * @return {void}
   */
		validateRule: function validateRule(rule) {
			if (!(rule in this.validRules_)) {
				if (rule === '') {
					throw "There is a trailing '|' or duplicate '||' in the rules for " + this.path_;
				} else {
					throw "'" + rule + "' is not a valid rule";
				}
			}
		},


		/**
   * When registering a variable whose root has already been registered,
   * make sure there won't be conflicts with its array status
   *
   * @return {boolean}
   */
		checkForConflicts: function checkForConflicts() {
			if (this.isArray_ && !this.vars_[this.root_].isArray) {
				throw "'" + this.path_ + "' was not previously registered as an array";
				return true;
			} else if (!this.isArray_ && this.vars_[this.root_].isArray) {
				throw "'" + this.path_ + "' was already saved for error checking as an array";
				return true;
			}

			return false;
		},


		/**
   * Create errors.variable object, developer will set/clear as they see fit
   *
   * @param {string} variable  (like: location.city.name)
   * @param {string} msg  Error message to set right now
   * @return {void}
   */
		manualErrorChecking: function manualErrorChecking(variable) {
			var msg = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

			this.root_ = variable.split('.')[0];
			if (typeof this.vars_[this.root_] !== 'undefined') {
				throw "Automatic error checking on '" + this.root_ + "' has been registered already";
				return;
			}

			this.$set('errors.' + variable, msg);
		},


		/**
   * Run error checks on a given variable or every variable
   *
   * @param {string | null} variable
   * @return {int} The number of errors detected
   */
		errorCheck: function errorCheck() {
			var variable = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

			var errors = 0;

			if (variable === null) {
				// check all
				for (variable in this.vars_) {
					errors += this.errorCheckSpecific(variable);
				}
			} else {
				errors = this.errorCheckSpecific(variable);
			}

			return errors;
		},


		/**
   * Refine the error check down to a specific variable, index, and/or key
   *
   * @param {string} variable 
   * @return {int} The number of errors detected
   */
		errorCheckSpecific: function errorCheckSpecific(variable) {
			// split into an array
			variable = variable.split('.');
			this.root_ = variable[0];

			if (!this.checkRootWasRegistered()) {
				return 1;
			}

			if (this.vars_[this.root_].isArray) {
				return this.errorCheckArray_(variable);
			} else {
				this.arrayIndex_ = null;
			}

			if (variable.length > 1) {
				this.key_ = variable.splice(1).join('.');
				return this.checkSpecificKey_(this.key_);
			} else {
				this.key_ = '';
				return this.checkAllKeys_();
			}
		},


		/**
   * The variable being checked is an array, loop through its contents and check indices
   *
   * @param {array} variable
   * @return {int} The number of errors detected
   */
		errorCheckArray_: function errorCheckArray_(variable) {
			this.value_ = this.$get(this.root_);

			if (!this.value_.length) {
				// there are no values, no errors
				return 0;
			}

			// make sure this.errors is correct dimensions for an array
			this.resetErrorsArraySize_();

			// are there indices past the root variable?
			if (variable.length > 1) {

				// is it something like players.1.email?
				if (parseInt(variable[1])) {
					this.arrayIndex_ = parseInt(variable[1]);
					var key = variable.slice(2).join('.');
					if (!key.length) {
						// check all keys at this index
						return this.checkAllKeys_();
					}

					// a given key at this index
					return this.checkSpecificKey_(key);
				} else {
					// check every index of the array but at a specific key value
					return this.checkWholeArray_(variable.slice(1).join('.'));
				}
			} else {
				// check everything in the array
				return this.checkWholeArray_();
			}
		},


		/**
   * Run error checks on just a specific key of the root variable
   *
   * @param {string} key
   * @return {int} The number of errors detected
   */
		checkSpecificKey_: function checkSpecificKey_(key) {
			// convert key string to an index into keys array for this variable
			this.key_ = key;
			key = this.vars_[this.root_].keys.indexOf(key);
			if (key === -1) {
				throw "'" + this.key_ + "' in '" + this.root_ + "' was never registered";
				return 1;
			}

			// build path to this variable
			if (this.vars_[this.root_].keys[key].length) {
				this.path_ = this.root_ + '.' + this.vars_[this.root_].keys[key];
			} else {
				this.path_ = this.root_;
			}

			// return the result of error checking
			return this.runErrorCheckOnRules_(this.vars_[this.root_].rules[key]);
		},


		/**
   * Check every index of the array
   *
   * @param {string | null} key
   * @return {int} The number of errors detected
   */
		checkWholeArray_: function checkWholeArray_() {
			var key = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

			var errors = 0;
			var currentVal = this.value_;

			// loop through every entry in the array variable
			for (this.arrayIndex_ = 0; this.arrayIndex_ < currentVal.length; this.arrayIndex_++) {
				if (!key) {
					// no given key, check them all
					errors += this.checkAllKeys_();
				} else {
					// check only given key every iteration
					errors += this.checkSpecificKey_(key);
				}
			}

			return errors;
		},


		/**
   * Loop through and check all of the regsitered keys
   *
   * @return {int} The number of errors detected
   */
		checkAllKeys_: function checkAllKeys_() {
			var errors = 0;
			for (var key in this.vars_[this.root_].keys) {
				// run a set of rules and save outcome
				errors += this.checkSpecificKey_(this.vars_[this.root_].keys[key]);
			}

			return errors;
		},


		/**
   * Call every rule function bound to this variable
   *
   * @param {object} rules
   */
		runErrorCheckOnRules_: function runErrorCheckOnRules_(rules) {
			var errors = 0;

			// save the value
			if (this.arrayIndex_ === null) {
				this.value_ = this.$get(this.path_);
			} else {
				this.value_ = this.fetchValueOfArray();
			}

			for (var rule in rules) {
				var args = rules[rule];
				if (!this.validRules_[rule].call(this, args)) {
					errors++;
					this.setError_(rule);
					break; // no sense in continuing if it has failed a check already
				} else {
					this.clearError_();
				}
			}

			return errors;
		},


		/**
   * Fetch the value and path of the variable
   */
		fetchValueOfArray: function fetchValueOfArray(key) {
			if (this.key_.length) {
				var splitKeys = this.key_.split('.'); // split 'name.firstname' into ['name', 'firstname'];
				this.path_ = this.root_ + '.' + this.key_;
				var value = this.$get(this.root_)[this.arrayIndex_]; // fetch the object at this array index

				for (var x = 0; x < splitKeys.length; x++) {
					// loop through indexing into the proper object
					value = value[splitKeys[x]];
				}
			} else {
				var value = this.$get(this.root_)[this.arrayIndex_];
				this.path_ = this.root_;
			}

			return value;
		},


		/**
   * Check that the root variable was registered for error checking
   */
		checkRootWasRegistered: function checkRootWasRegistered() {
			if (!(this.root_ in this.vars_)) {
				throw "'" + this.root_ + "' was never registered for error checking";
				return false;
			}

			return true;
		},


		/**
   * Array might have grown since last checked, make sure this.errors is up-to-date in size
   */
		resetErrorsArraySize_: function resetErrorsArraySize_() {
			if (this.errors[this.root_].length !== this.value_.length) {
				var temp = [];
				var copy = this.errors[this.root_][0];
				for (var index = 0; index < this.value_.length; index++) {
					temp.push(copy);
				}
				this.errors[this.root_] = temp;
			}
		},


		/**
   * Set the error message according to the rule that the variable has broken
   *
   * @param {string} rule 
   */
		setError_: function setError_(rule) {
			if (this.arrayIndex_ === null) {
				var error = this.$get('errMsg_.' + this.path_ + '.' + rule); // fetch error message 
				this.$set('errors.' + this.path_, error); // store
			} else {
				var error = this.$get('errMsg_.' + this.path_ + '.' + rule); // fetch error message
				this.$set('temp_', JSON.parse(JSON.stringify(this.errors[this.root_][this.arrayIndex_]))); // create copy
				this.$set('temp_.' + this.key_, error); // move error message to correct key

				this.errors[this.root_].$set(this.arrayIndex_, this.temp_); // merge placeholder with this.errors
				this.errors = JSON.parse(JSON.stringify(this.errors)); // use this technique for reactivity
			}
		},


		/**
   * Clear the errors for the variable
   */
		clearError_: function clearError_() {
			if (this.arrayIndex_ === null) {
				this.$set('errors.' + this.path_, '');
			} else {
				this.temp_ = {};
				this.$set('temp_.' + this.key_, ''); // create placeholder
				for (var key in this.temp_) {
					// store the contents of the placeholder, replacing only the necessary data
					this.errors[this.root_][this.arrayIndex_][key] = this.temp_[key];
				}

				this.errors = JSON.parse(JSON.stringify(this.errors)); // use this technique for reactivity
			}
		},


		/**
   * Get rid of any previously existing error checking logic
   */
		clearErrorChecking: function clearErrorChecking() {
			this.vars_ = {};
			this.errors = {};
			this.errMsg_ = {};
		},


		/**
   * The given method could not give a valid answer about the error status
   *
   * @param {string} method
   */
		uncertainInput: function uncertainInput(method) {
			throw "Having a hard time resolving '" + this.path_ + "' for rule '" + method + "'";

			return false;
		},


		/**
   * The variable must have something inside it
   */
		required_: function required_() {
			if (typeof this.value_ === 'undefined') {
				return false;
			}

			if (typeof this.value_ === 'number') {
				return true;
			}

			if (typeof this.value_ === 'boolean') {
				return true;
			}

			if (typeof this.value_ === 'string') {
				return this.value_.length > 0;
			}

			return this.uncertainInput('required');
		},


		/**
   * The variable must be greater than a given value in size or length
   */
		max_: function max_(args) {
			if (typeof this.value_ === 'number') {
				return this.value_ <= args[0];
			}

			if (typeof this.value_ === 'string') {
				return this.value_.length <= args[0];
			}

			if (_typeof(this.value_) === 'object') {
				return this.value_.length <= args[0];
			}

			return this.uncertainInput('max');
		},


		/**
   * The variable must be less than a given value in size or length
   */
		min_: function min_(args) {
			if (typeof this.value_ === 'number') {
				return this.value_ >= args[0];
			}

			if (typeof this.value_ === 'string') {
				return this.value_.length >= args[0];
			}

			if (_typeof(this.value_) === 'object') {
				return this.value_.length >= args[0];
			}

			return this.uncertainInput('max');
		},


		/**
   * The field must equal one of the given arguments
   */
		in_: function in_(args) {
			if (args.indexOf(this.value_) === -1) {
				return false;
			}

			return true;
		},


		/**
   * The variable must be of a given size
   */
		size_: function size_(args) {
			if (typeof this.value_ === 'number') {
				return this.value_ === args[0];
			}

			if (typeof this.value_ === 'string') {
				return this.value_.length === args[0];
			}

			if (_typeof(this.value_) === 'object') {
				return this.value_.length === args[0];
			}

			return this.uncertainInput('size');
		},


		/**
   * The variable must equal a given argument
   */
		equals_: function equals_(args) {
			return this.value_ == args[0];
		},


		/**
   * The variable must match a given regular expression
   */
		regex_: function regex_(expression) {
			if (typeof this.value_ !== 'string') {
				return false;
			}

			if (!(expression instanceof RegExp)) {
				// the expression isn't a valid regular expression yet

				if ((typeof expression === 'undefined' ? 'undefined' : _typeof(expression)) === 'object') {
					// expression is being passed inside an array of arguments
					expression = expression[0];
				}

				if (expression[0] === '/') {
					// if the developer added their own forward-slashes at front and end, remove
					expression = expression.substring(1, expression.length - 1);
				}

				// create a valid regular expression out of the string with the 'global' flag
				expression = new RegExp(expression);
			}

			if (this.value_.match(expression)) {
				return true;
			} else {
				return false;
			}
		},


		/**
   * The variable must be a boolean
   */
		boolean_: function boolean_() {
			return typeof this.value_ === 'boolean';
		},


		/**
   * The variable must be a string
   */
		string_: function string_() {
			return typeof this.value_ === 'string';
		},


		/**
   * The variable must be a number
   */
		number_: function number_() {
			return typeof this.value_ === 'number';
		},


		/**
   * The variable must be an array/object
   */
		array_: function array_() {
			return _typeof(this.value_) === 'object';
		},


		/**
   * The variable must be a valid email address
   */
		email_: function email_() {
			if (typeof this.value_ === 'string' && !this.value_.length) {
				return true;
			} else {
				return this.regex_(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z]{2,10})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
			}
		},


		/**
   * The variable must be a string with only alphanumeric characters
   */
		alphaNum: function alphaNum() {
			if (typeof this.value_ === 'string' && !this.value_.length) {
				return true;
			} else {
				return this.regex_(/^[a-zA-Z0-9]+$/);
			}
		},


		/**
   * The variable must be a valid jersey number
   */
		jersey_: function jersey_() {
			if (typeof this.value_ === 'string' && !this.value_.length) {
				return true;
			} else {
				return this.regex_(/^[0-9]{1,2}$/);
			}
		}
	}
};

},{}],76:[function(require,module,exports){
'use strict';

var _App = require('./components/App.vue');

var _App2 = _interopRequireDefault(_App);

var _Team = require('./components/Team.vue');

var _Team2 = _interopRequireDefault(_Team);

var _CreateTeam = require('./components/CreateTeam.vue');

var _CreateTeam2 = _interopRequireDefault(_CreateTeam);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Vue = require('vue');
var VueRouter = require('vue-router');
var VueResource = require('vue-resource');
var VueAutosize = require('vue-autosize');

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(VueAutosize);

Vue.config.debug = true;

//pull meta data from server out of tags in <head> of main.blade
Vue.http.headers.common['X-CSRF-TOKEN'] = $('#_token').attr('value');

//set up global filters

//turns LeBron James -> L. James
Vue.filter('statsName', function (first, last) {
	return first[0] + '. ' + last;
});

//returns at time string like 11:25 pm
Vue.filter('justTime', function (val) {
	return moment(val * 1000).format('h:mm a');
});

Vue.filter('checkPercentage', function (val) {
	if (val > 100) return 'ERROR';else return val;
});

Vue.filter('basketballTooltips', require('./filters/BasketballTooltips.js'));
Vue.filter('basketballStats', require('./filters/BasketballStats.js'));
Vue.filter('formatRepeatString', require('./filters/FormatRepeatString.js'));
Vue.filter('formatTimeString', require('./filters/FormatTimeString.js'));

//import components


//enable router, turn on history mode
var router = new VueRouter({
	history: true,
	transitionOnLoad: true
});

router.map({

	'/': {
		name: 'home',
		component: {
			template: "<h1 style='margin-top: 80px'>This is the homepage</h1>"
		}
	},

	'/team/create': {
		name: 'createTeam',
		component: _CreateTeam2.default
	},

	'/team/:name': {
		name: 'team',
		component: _Team2.default
	},

	'/:name': {
		name: 'user',
		component: {
			template: "<h1 style='margin-top: 80px'>Welcome to your very own rookiecard, {{ $route.params.name}}!</h1>"
		}
	},

	'*': {
		component: {
			template: "<div class='text-center'><h1>Uh oh!</br>Page not found!</h1></div>"
		}
	}

});

router.start(_App2.default, '#app');

},{"./components/App.vue":55,"./components/CreateTeam.vue":58,"./components/Team.vue":66,"./filters/BasketballStats.js":68,"./filters/BasketballTooltips.js":69,"./filters/FormatRepeatString.js":70,"./filters/FormatTimeString.js":71,"vue":51,"vue-autosize":24,"vue-resource":39,"vue-router":50}]},{},[76]);

//# sourceMappingURL=routes.js.map
