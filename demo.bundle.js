(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var gum = require('getusermedia');
var ams = require('attachmediastream');
var addClass = require('amp-add-class');
var removeClass = require('amp-remove-class');
var domready = require('domready');
var raf = require('raf');
var debounce = require('amp-debounce');
var floodVideo = require('./flood-video');

domready(function () {
    gum({ video: true, audio: false }, function (err, stream) {
        var wrapper1 = document.querySelector('.wrapper-1');
        var video1 = wrapper1.querySelector('video');

        var wrapper2 = document.querySelector('.wrapper-2');
        var video2 = wrapper2.querySelector('video');

        ams(stream, video1);
        ams(stream, video2);

        window.floodController = floodVideo(wrapper1, video1, {
            minVisibleHeight: 0.5,
            minVisibleWidth: 0.5
        });

        window.floodController2 = floodVideo(wrapper2, video2, {
            minVisibleHeight: 0.5,
            minVisibleWidth: 0.5
        });

        document.querySelector('[name=minVisibleHeight]').addEventListener('input', function(e) {
            floodController.configure({
                minVisibleHeight: e.target.valueAsNumber
            });
            floodController2.configure({
                minVisibleHeight: e.target.valueAsNumber
            });
        }, false);

        document.querySelector('[name=minVisibleWidth]').addEventListener('input', function(e) {
            floodController.configure({
                minVisibleWidth: e.target.valueAsNumber
            });
            floodController2.configure({
                minVisibleWidth: e.target.valueAsNumber
            });
        }, false);
    });
});

},{"./flood-video":3,"amp-add-class":4,"amp-debounce":9,"amp-remove-class":13,"attachmediastream":14,"domready":17,"getusermedia":18,"raf":19}],2:[function(require,module,exports){
var css = ".flood-video {\n  display: block;\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n      -ms-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n}\n\n.flood-video--fit-height {\n  max-height: none;\n  height: 100%;\n  width: auto;\n  min-width: 100%;\n  max-width: 100%;\n  -webkit-transition: max-height 100ms linear, max-width 100ms linear;\n          transition: max-height 100ms linear, max-width 100ms linear;\n}\n\n.flood-video--fit-width {\n  max-width: none;\n  width: 100%;\n  height: auto;\n  min-height: 100%;\n  max-height: 100%;\n}\n"; (require("/Users/latentflip/Code/github/andyet/flood-video/node_modules/cssify"))(css); module.exports = css;
},{"/Users/latentflip/Code/github/andyet/flood-video/node_modules/cssify":16}],3:[function(require,module,exports){
/* jshint eqnull:true */

require('./flood-video.css');
var raf = require('raf');
var addClass = require('amp-add-class');
var removeClass = require('amp-remove-class');
var debounce = require('amp-debounce');

/*
var controller = floodVideo(wrapper, video, {...});
controller.forceFlood();
controller.configure({ ... });
controller.stop();
*/

/* options:
 *   - minVisibleHeight: 0...1
 *   - minVisibleWidth: 0...1
 */

function aspectRatio(dims) {
    return dims.width / dims.height;
}

module.exports = function floodVideo(wrapper, video, options) {
    options = options || {};
    var maxWidth = 100;
    var maxHeight = 100;

    var configure = function (options) {
        options = options || {};
        if (options.minVisibleHeight != null) {
            if (options.minVisibleHeight === 0) {
                maxHeight = 'none';
            } else {
                maxHeight = 100/(options.minVisibleHeight);
            }
        }
        if (options.minVisibleWidth != null) {
            if (options.minVisibleWidth === 0) {
                maxWidth = 'none';
            } else {
                maxWidth = 100/(options.minVisibleWidth);
            }
        }
        flood();
    };
    
    var wrapperInitialStyle = {};
    var initialSetup = function () {
        raf(function () {
            wrapperInitialStyle.overflow = wrapper.style.overflow;
            wrapperInitialStyle.position = wrapper.style.position;

            var wrapperStyle = window.getComputedStyle(wrapper);
            if (wrapperStyle.position === 'static') {
                wrapper.style.position = 'relative';
            }
            wrapper.style.overflow = 'hidden';

            addClass(video, ['flood-video']);
        });

        video.addEventListener('loadedmetadata', flood, false);
        window.addEventListener('resize', floodDebounced, false);
    };

    var flood = function () {
        raf(function () {
            var wrapperSize = wrapper.getBoundingClientRect();
            var videoSize = {
                height: video.videoHeight || 1,
                width: video.videoWidth || 1
            };

            if (aspectRatio(videoSize) > aspectRatio(wrapperSize)) {
                video.style.maxWidth = maxWidth + '%';
                video.style.maxHeight = 'none';
                removeClass(video, ['flood-video--fit-width']);
                addClass(video, ['flood-video--fit-height']);
            } else {
                video.style.maxWidth = 'none';
                video.style.maxHeight = maxHeight + '%';
                removeClass(video, ['flood-video--fit-height']);
                addClass(video, ['flood-video--fit-width']);
            }
        });
    };

    var floodDebounced = debounce(flood, 50);

    var stop = function () {
        video.removeEventListener('loadedmetadata', flood, false);
        window.removeEventListener('resize', floodDebounced, false);
        removeClass(video, ['flood-video', 'flood-video--fit-width', 'flood-video--fit-height']);
        wrapper.style.position = wrapperInitialStyle.position;
        wrapper.style.overflow = wrapperInitialStyle.overflow;
    };

    // Go!
    if (!wrapper || !video) {
        throw new TypeError("floodVideo: wrapper and video elements are required");
    }

    configure(options);
    initialSetup();
    flood();

    return {
        configure: configure,
        forceFlood: flood,
        stop: stop
    };
};

},{"./flood-video.css":2,"amp-add-class":4,"amp-debounce":9,"amp-remove-class":13,"raf":19}],4:[function(require,module,exports){
var hasClass = require('amp-has-class');
var isString = require('amp-is-string');
var isArray = require('amp-is-array');
var trim = require('amp-trim');
var slice = Array.prototype.slice;
var cleanup = /\s{2,}/g;
var ws = /\s+/;


module.exports = function addClass(el, cls) {
    if (arguments.length === 2 && isString(cls)) {
        cls = trim(cls).split(ws);
    } else {
        cls = isArray(cls) ? cls : slice.call(arguments, 1);    
    }
    // optimize for best, most common case
    if (cls.length === 1 && el.classList) {
        if (cls[0]) el.classList.add(cls[0]);
        return el;
    }
    var toAdd = [];
    var i = 0;
    var l = cls.length;
    var item;
    var clsName = el.className;
    // see if we have anything to add
    for (; i < l; i++) {
        item = cls[i];
        if (item && !hasClass(clsName, item)) {
            toAdd.push(item);
        }
    }
    if (toAdd.length) {
        el.className = trim((clsName + ' ' + toAdd.join(' ')).replace(cleanup, ' '));
    }
    return el;
};

},{"amp-has-class":5,"amp-is-array":6,"amp-is-string":7,"amp-trim":8}],5:[function(require,module,exports){
var isString = require('amp-is-string');
var whitespaceRE = /[\t\r\n\f]/g;


// note: this is jQuery's approach
module.exports = function hasClass(el, cls) {
    var cName = (isString(el) ? el : el.className).replace(whitespaceRE, ' ');
    return (' ' + cName + ' ').indexOf(' ' + cls + ' ') !== -1;
};

},{"amp-is-string":7}],6:[function(require,module,exports){
var toString = Object.prototype.toString;
var nativeIsArray = Array.isArray;


module.exports = nativeIsArray || function isArray(obj) {
    return toString.call(obj) === '[object Array]';
};

},{}],7:[function(require,module,exports){
var toString = Object.prototype.toString;


module.exports = function isString(obj) {
    return toString.call(obj) === '[object String]';
};

},{}],8:[function(require,module,exports){
var trimRE = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;


module.exports = function trim(string) {
    return string.replace(trimRE, '');
};

},{}],9:[function(require,module,exports){
var now = Date.now;

// IE < 9
if (!now) {
    now = function () {
        return (new Date()).valueOf();
    };
}

module.exports = function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function () {
        var last = now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function () {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

},{}],10:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],11:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],12:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],13:[function(require,module,exports){
var isString = require('amp-is-string');
var isArray = require('amp-is-array');
var trim = require('amp-trim');
var slice = Array.prototype.slice;
var cleanup = /\s{2,}/g;
var ws = /\s+/;


module.exports = function removeClass(el, cls) {
    if (arguments.length === 2 && isString(cls)) {
        cls = trim(cls).split(ws);
    } else {
        cls = isArray(cls) ? cls : slice.call(arguments, 1);    
    }
    // optimize for best, most common case
    if (cls.length === 1 && el.classList) {
        if (cls[0]) el.classList.remove(cls[0]);
        return el;
    }
    // store two copies
    var clsName = ' ' + el.className + ' ';
    var result = clsName;
    var current;
    var start;
    for (var i = 0, l = cls.length; i < l; i++) {
        current = cls[i];
        start = current ? result.indexOf(' ' + current + ' ') : -1;
        if (start !== -1) {
            start += 1;
            result = result.slice(0, start) + result.slice(start + current.length);
        }
    }
    // only write if modified
    if (clsName !== result) {
        el.className = trim(result.replace(cleanup, ' '));
    }
    return el;
};

},{"amp-is-array":10,"amp-is-string":11,"amp-trim":12}],14:[function(require,module,exports){
module.exports = function (stream, el, options) {
    var item;
    var URL = window.URL;
    var element = el;
    var opts = {
        autoplay: true,
        mirror: false,
        muted: false,
        audio: false
    };

    if (options) {
        for (item in options) {
            opts[item] = options[item];
        }
    }

    if (!element) {
        element = document.createElement(opts.audio ? 'audio' : 'video');
    } else if (element.tagName.toLowerCase() === 'audio') {
        opts.audio = true;
    }

    if (opts.autoplay) element.autoplay = 'autoplay';
    if (opts.muted) element.muted = true;
    if (!opts.audio && opts.mirror) {
        ['', 'moz', 'webkit', 'o', 'ms'].forEach(function (prefix) {
            var styleName = prefix ? prefix + 'Transform' : 'transform';
            element.style[styleName] = 'scaleX(-1)';
        });
    }

    // this first one should work most everywhere now
    // but we have a few fallbacks just in case.
    if (URL && URL.createObjectURL) {
        element.src = URL.createObjectURL(stream);
    } else if (element.srcObject) {
        element.srcObject = stream;
    } else if (element.mozSrcObject) {
        element.mozSrcObject = stream;
    } else {
        return false;
    }

    return element;
};

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],17:[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , hack = doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? fn() : fns.push(fn)
  }

});

},{}],18:[function(require,module,exports){
// getUserMedia helper by @HenrikJoreteg
var func = (window.navigator.getUserMedia ||
            window.navigator.webkitGetUserMedia ||
            window.navigator.mozGetUserMedia ||
            window.navigator.msGetUserMedia);


module.exports = function (constraints, cb) {
    var options, error;
    var haveOpts = arguments.length === 2;
    var defaultOpts = {video: true, audio: true};
    var denied = 'PermissionDeniedError';
    var notSatisfied = 'ConstraintNotSatisfiedError';

    // make constraints optional
    if (!haveOpts) {
        cb = constraints;
        constraints = defaultOpts;
    }

    // treat lack of browser support like an error
    if (!func) {
        // throw proper error per spec
        error = new Error('MediaStreamError');
        error.name = 'NotSupportedError';

        // keep all callbacks async
        return window.setTimeout(function () {
            cb(error);
        }, 0);
    }

    // make requesting media from non-http sources trigger an error
    // current browsers silently drop the request instead
    var protocol = window.location.protocol;
    if (protocol !== 'http:' && protocol !== 'https:') {
        error = new Error('MediaStreamError');
        error.name = 'NotSupportedError';

        // keep all callbacks async
        return window.setTimeout(function () {
            cb(error);
        }, 0);
    }

    // normalize error handling when no media types are requested
    if (!constraints.audio && !constraints.video) {
        error = new Error('MediaStreamError');
        error.name = 'NoMediaRequestedError';

        // keep all callbacks async
        return window.setTimeout(function () {
            cb(error);
        }, 0);
    }

    if (localStorage && localStorage.useFirefoxFakeDevice === "true") {
        constraints.fake = true;
    }

    func.call(window.navigator, constraints, function (stream) {
        cb(null, stream);
    }, function (err) {
        var error;
        // coerce into an error object since FF gives us a string
        // there are only two valid names according to the spec
        // we coerce all non-denied to "constraint not satisfied".
        if (typeof err === 'string') {
            error = new Error('MediaStreamError');
            if (err === denied) {
                error.name = denied;
            } else {
                error.name = notSatisfied;
            }
        } else {
            // if we get an error object make sure '.name' property is set
            // according to spec: http://dev.w3.org/2011/webrtc/editor/getusermedia.html#navigatorusermediaerror-and-navigatorusermediaerrorcallback
            error = err;
            if (!error.name) {
                // this is likely chrome which
                // sets a property called "ERROR_DENIED" on the error object
                // if so we make sure to set a name
                if (error[denied]) {
                    err.name = denied;
                } else {
                    err.name = notSatisfied;
                }
            }
        }

        cb(error);
    });
};

},{}],19:[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":20}],20:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,require('_process'))
},{"_process":15}]},{},[1]);
