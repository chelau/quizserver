/*
 * debouncedresize: special jQuery event that happens once after a window resize
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work?
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function($) {
  var $event = $.event,
    $special,
    resizeTimeout;

  $special = $event.special.debouncedresize = {
    setup: function() {
      $(this).on("resize", $special.handler);
    },
    teardown: function() {
      $(this).off("resize", $special.handler);
    },
    handler: function(event, execAsap) {
      // Save the context
      var context = this,
        args = arguments,
        dispatch = function() {
          // set correct event type
          event.type = "debouncedresize";
          $event.dispatch.apply(context, args);
        };

      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      execAsap
        ? dispatch()
        : (resizeTimeout = setTimeout(dispatch, $special.threshold));
    },
    threshold: 150
  };
})(jQuery);
//http://stackoverflow.com/questions/8354786/determine-the-width-of-a-dynamic-css3-multicolumn-div-width-fixed-column-width
(function($) {
  $.fn.extend({
    getColumnsWidth: function() {
      // append an empty <span>
      $this = $(this).append("<span></span>");

      // grab left position
      var pos = $this.find("span:last-of-type").position().left;

      // get prefix for css3
      var prefix;
      if (jQuery.browser.webkit) prefix = "-webkit-";
      else if (jQuery.browser.opera) prefix = "-o-";
      else if (jQuery.browser.mozilla) prefix = "-moz-";
      else if (jQuery.browser.msie) prefix = "-ms-";

      // add the width of the final column
      pos += parseInt($this.css(prefix + "column-width"), 10);

      // subtract one column gap (not sure why this is necessary?)
      pos -= parseInt($this.css(prefix + "column-gap"), 10);

      // remove empty <span>
      $(this)
        .find("span:last-of-type")
        .remove();

      // return position
      return pos;
    }
  });
})(jQuery);
/*! Hammer.JS - v2.0.4 - 2014-09-28
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2014 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  "use strict";

  var VENDOR_PREFIXES = ["", "webkit", "moz", "MS", "ms", "o"];
  var TEST_ELEMENT = document.createElement("div");

  var TYPE_FUNCTION = "function";

  var round = Math.round;
  var abs = Math.abs;
  var now = Date.now;

  /**
   * set a timeout with a given scope
   * @param {Function} fn
   * @param {Number} timeout
   * @param {Object} context
   * @returns {number}
   */
  function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
  }

  /**
   * if the argument is an array, we want to execute the fn on each entry
   * if it aint an array we don't want to do a thing.
   * this is used by all the methods that accept a single and array argument.
   * @param {*|Array} arg
   * @param {String} fn
   * @param {Object} [context]
   * @returns {Boolean}
   */
  function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
      each(arg, context[fn], context);
      return true;
    }
    return false;
  }

  /**
   * walk objects and arrays
   * @param {Object} obj
   * @param {Function} iterator
   * @param {Object} context
   */
  function each(obj, iterator, context) {
    var i;

    if (!obj) {
      return;
    }

    if (obj.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
      i = 0;
      while (i < obj.length) {
        iterator.call(context, obj[i], i, obj);
        i++;
      }
    } else {
      for (i in obj) {
        obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
      }
    }
  }

  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge]
   * @returns {Object} dest
   */
  function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
      if (!merge || (merge && dest[keys[i]] === undefined)) {
        dest[keys[i]] = src[keys[i]];
      }
      i++;
    }
    return dest;
  }

  /**
   * merge the values from src in the dest.
   * means that properties that exist in dest will not be overwritten by src
   * @param {Object} dest
   * @param {Object} src
   * @returns {Object} dest
   */
  function merge(dest, src) {
    return extend(dest, src, true);
  }

  /**
   * simple class inheritance
   * @param {Function} child
   * @param {Function} base
   * @param {Object} [properties]
   */
  function inherit(child, base, properties) {
    var baseP = base.prototype,
      childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
      extend(childP, properties);
    }
  }

  /**
   * simple function bind
   * @param {Function} fn
   * @param {Object} context
   * @returns {Function}
   */
  function bindFn(fn, context) {
    return function boundFn() {
      return fn.apply(context, arguments);
    };
  }

  /**
   * let a boolean value also be a function that must return a boolean
   * this first item in args will be used as the context
   * @param {Boolean|Function} val
   * @param {Array} [args]
   * @returns {Boolean}
   */
  function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
      return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
  }

  /**
   * use the val2 when val1 is undefined
   * @param {*} val1
   * @param {*} val2
   * @returns {*}
   */
  function ifUndefined(val1, val2) {
    return val1 === undefined ? val2 : val1;
  }

  /**
   * addEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
      target.addEventListener(type, handler, false);
    });
  }

  /**
   * removeEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
      target.removeEventListener(type, handler, false);
    });
  }

  /**
   * find if a node is in the given parent
   * @method hasParent
   * @param {HTMLElement} node
   * @param {HTMLElement} parent
   * @return {Boolean} found
   */
  function hasParent(node, parent) {
    while (node) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * small indexOf wrapper
   * @param {String} str
   * @param {String} find
   * @returns {Boolean} found
   */
  function inStr(str, find) {
    return str.indexOf(find) > -1;
  }

  /**
   * split string on whitespace
   * @param {String} str
   * @returns {Array} words
   */
  function splitStr(str) {
    return str.trim().split(/\s+/g);
  }

  /**
   * find if a array contains the object using indexOf or a simple polyFill
   * @param {Array} src
   * @param {String} find
   * @param {String} [findByKey]
   * @return {Boolean|Number} false when not found, or the index
   */
  function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
      return src.indexOf(find);
    } else {
      var i = 0;
      while (i < src.length) {
        if (
          (findByKey && src[i][findByKey] == find) ||
          (!findByKey && src[i] === find)
        ) {
          return i;
        }
        i++;
      }
      return -1;
    }
  }

  /**
   * convert array-like objects to real arrays
   * @param {Object} obj
   * @returns {Array}
   */
  function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
  }

  /**
   * unique array with objects based on a key (like 'id') or just by the array's value
   * @param {Array} src [{id:1},{id:2},{id:1}]
   * @param {String} [key]
   * @param {Boolean} [sort=False]
   * @returns {Array} [{id:1},{id:2}]
   */
  function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
      var val = key ? src[i][key] : src[i];
      if (inArray(values, val) < 0) {
        results.push(src[i]);
      }
      values[i] = val;
      i++;
    }

    if (sort) {
      if (!key) {
        results = results.sort();
      } else {
        results = results.sort(function sortUniqueArray(a, b) {
          return a[key] > b[key];
        });
      }
    }

    return results;
  }

  /**
   * get the prefixed property
   * @param {Object} obj
   * @param {String} property
   * @returns {String|Undefined} prefixed
   */
  function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
      prefix = VENDOR_PREFIXES[i];
      prop = prefix ? prefix + camelProp : property;

      if (prop in obj) {
        return prop;
      }
      i++;
    }
    return undefined;
  }

  /**
   * get a unique id
   * @returns {number} uniqueId
   */
  var _uniqueId = 1;
  function uniqueId() {
    return _uniqueId++;
  }

  /**
   * get the window object of an element
   * @param {HTMLElement} element
   * @returns {DocumentView|Window}
   */
  function getWindowForElement(element) {
    var doc = element.ownerDocument;
    return doc.defaultView || doc.parentWindow;
  }

  var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

  var SUPPORT_TOUCH = "ontouchstart" in window;
  var SUPPORT_POINTER_EVENTS = prefixed(window, "PointerEvent") !== undefined;
  var SUPPORT_ONLY_TOUCH =
    SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

  var INPUT_TYPE_TOUCH = "touch";
  var INPUT_TYPE_PEN = "pen";
  var INPUT_TYPE_MOUSE = "mouse";
  var INPUT_TYPE_KINECT = "kinect";

  var COMPUTE_INTERVAL = 25;

  var INPUT_START = 1;
  var INPUT_MOVE = 2;
  var INPUT_END = 4;
  var INPUT_CANCEL = 8;

  var DIRECTION_NONE = 1;
  var DIRECTION_LEFT = 2;
  var DIRECTION_RIGHT = 4;
  var DIRECTION_UP = 8;
  var DIRECTION_DOWN = 16;

  var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
  var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
  var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

  var PROPS_XY = ["x", "y"];
  var PROPS_CLIENT_XY = ["clientX", "clientY"];

  /**
   * create new input type manager
   * @param {Manager} manager
   * @param {Function} callback
   * @returns {Input}
   * @constructor
   */
  function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
      if (boolOrFn(manager.options.enable, [manager])) {
        self.handler(ev);
      }
    };

    this.init();
  }

  Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() {},

    /**
     * bind the events
     */
    init: function() {
      this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget &&
        addEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin &&
        addEventListeners(
          getWindowForElement(this.element),
          this.evWin,
          this.domHandler
        );
    },

    /**
     * unbind the events
     */
    destroy: function() {
      this.evEl &&
        removeEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget &&
        removeEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin &&
        removeEventListeners(
          getWindowForElement(this.element),
          this.evWin,
          this.domHandler
        );
    }
  };

  /**
   * create new input type manager
   * called by the Manager constructor
   * @param {Hammer} manager
   * @returns {Input}
   */
  function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
      Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
      Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
      Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
      Type = MouseInput;
    } else {
      Type = TouchMouseInput;
    }
    return new Type(manager, inputHandler);
  }

  /**
   * handle input events
   * @param {Manager} manager
   * @param {String} eventType
   * @param {Object} input
   */
  function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst =
      eventType & INPUT_START && pointersLen - changedPointersLen === 0;
    var isFinal =
      eventType & (INPUT_END | INPUT_CANCEL) &&
      pointersLen - changedPointersLen === 0;

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
      manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit("hammer.input", input);

    manager.recognize(input);
    manager.session.prevInput = input;
  }

  /**
   * extend the data with some usable properties like scale, rotate, velocity etc
   * @param {Object} manager
   * @param {Object} input
   */
  function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
      session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
      session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
      session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = (input.center = getCenter(pointers));
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    input.scale = firstMultiple
      ? getScale(firstMultiple.pointers, pointers)
      : 1;
    input.rotation = firstMultiple
      ? getRotation(firstMultiple.pointers, pointers)
      : 0;

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
      target = input.srcEvent.target;
    }
    input.target = target;
  }

  function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
      prevDelta = session.prevDelta = {
        x: prevInput.deltaX || 0,
        y: prevInput.deltaY || 0
      };

      offset = session.offsetDelta = {
        x: center.x,
        y: center.y
      };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
  }

  /**
   * velocity is calculated every x ms
   * @param {Object} session
   * @param {Object} input
   */
  function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
      deltaTime = input.timeStamp - last.timeStamp,
      velocity,
      velocityX,
      velocityY,
      direction;

    if (
      input.eventType != INPUT_CANCEL &&
      (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)
    ) {
      var deltaX = last.deltaX - input.deltaX;
      var deltaY = last.deltaY - input.deltaY;

      var v = getVelocity(deltaTime, deltaX, deltaY);
      velocityX = v.x;
      velocityY = v.y;
      velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
      direction = getDirection(deltaX, deltaY);

      session.lastInterval = input;
    } else {
      // use latest velocity info if it doesn't overtake a minimum period
      velocity = last.velocity;
      velocityX = last.velocityX;
      velocityY = last.velocityY;
      direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
  }

  /**
   * create a simple clone from the input used for storage of firstInput and firstMultiple
   * @param {Object} input
   * @returns {Object} clonedInputData
   */
  function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
      pointers[i] = {
        clientX: round(input.pointers[i].clientX),
        clientY: round(input.pointers[i].clientY)
      };
      i++;
    }

    return {
      timeStamp: now(),
      pointers: pointers,
      center: getCenter(pointers),
      deltaX: input.deltaX,
      deltaY: input.deltaY
    };
  }

  /**
   * get the center of all the pointers
   * @param {Array} pointers
   * @return {Object} center contains `x` and `y` properties
   */
  function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
      return {
        x: round(pointers[0].clientX),
        y: round(pointers[0].clientY)
      };
    }

    var x = 0,
      y = 0,
      i = 0;
    while (i < pointersLength) {
      x += pointers[i].clientX;
      y += pointers[i].clientY;
      i++;
    }

    return {
      x: round(x / pointersLength),
      y: round(y / pointersLength)
    };
  }

  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @param {Number} deltaTime
   * @param {Number} x
   * @param {Number} y
   * @return {Object} velocity `x` and `y`
   */
  function getVelocity(deltaTime, x, y) {
    return {
      x: x / deltaTime || 0,
      y: y / deltaTime || 0
    };
  }

  /**
   * get the direction between two points
   * @param {Number} x
   * @param {Number} y
   * @return {Number} direction
   */
  function getDirection(x, y) {
    if (x === y) {
      return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
      return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
  }

  /**
   * calculate the absolute distance between two points
   * @param {Object} p1 {x, y}
   * @param {Object} p2 {x, y}
   * @param {Array} [props] containing x and y keys
   * @return {Number} distance
   */
  function getDistance(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
      y = p2[props[1]] - p1[props[1]];

    return Math.sqrt(x * x + y * y);
  }

  /**
   * calculate the angle between two coordinates
   * @param {Object} p1
   * @param {Object} p2
   * @param {Array} [props] containing x and y keys
   * @return {Number} angle
   */
  function getAngle(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
      y = p2[props[1]] - p1[props[1]];
    return (Math.atan2(y, x) * 180) / Math.PI;
  }

  /**
   * calculate the rotation degrees between two pointersets
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} rotation
   */
  function getRotation(start, end) {
    return (
      getAngle(end[1], end[0], PROPS_CLIENT_XY) -
      getAngle(start[1], start[0], PROPS_CLIENT_XY)
    );
  }

  /**
   * calculate the scale factor between two pointersets
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} scale
   */
  function getScale(start, end) {
    return (
      getDistance(end[0], end[1], PROPS_CLIENT_XY) /
      getDistance(start[0], start[1], PROPS_CLIENT_XY)
    );
  }

  var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
  };

  var MOUSE_ELEMENT_EVENTS = "mousedown";
  var MOUSE_WINDOW_EVENTS = "mousemove mouseup";

  /**
   * Mouse events input
   * @constructor
   * @extends Input
   */
  function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
  }

  inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
      var eventType = MOUSE_INPUT_MAP[ev.type];

      // on start we want to have the left mouse button down
      if (eventType & INPUT_START && ev.button === 0) {
        this.pressed = true;
      }

      if (eventType & INPUT_MOVE && ev.which !== 1) {
        eventType = INPUT_END;
      }

      // mouse must be down, and mouse events are allowed (see the TouchMouse input)
      if (!this.pressed || !this.allow) {
        return;
      }

      if (eventType & INPUT_END) {
        this.pressed = false;
      }

      this.callback(this.manager, eventType, {
        pointers: [ev],
        changedPointers: [ev],
        pointerType: INPUT_TYPE_MOUSE,
        srcEvent: ev
      });
    }
  });

  var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
  };

  // in IE10 the pointer types is defined as an enum
  var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
  };

  var POINTER_ELEMENT_EVENTS = "pointerdown";
  var POINTER_WINDOW_EVENTS = "pointermove pointerup pointercancel";

  // IE10 has prefixed support, and case-sensitive
  if (window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = "MSPointerDown";
    POINTER_WINDOW_EVENTS = "MSPointerMove MSPointerUp MSPointerCancel";
  }

  /**
   * Pointer events input
   * @constructor
   * @extends Input
   */
  function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = this.manager.session.pointerEvents = [];
  }

  inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
      var store = this.store;
      var removePointer = false;

      var eventTypeNormalized = ev.type.toLowerCase().replace("ms", "");
      var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
      var pointerType =
        IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

      var isTouch = pointerType == INPUT_TYPE_TOUCH;

      // get index of the event in the store
      var storeIndex = inArray(store, ev.pointerId, "pointerId");

      // start and mouse must be down
      if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
        if (storeIndex < 0) {
          store.push(ev);
          storeIndex = store.length - 1;
        }
      } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        removePointer = true;
      }

      // it not found, so the pointer hasn't been down (so it's probably a hover)
      if (storeIndex < 0) {
        return;
      }

      // update the event in the store
      store[storeIndex] = ev;

      this.callback(this.manager, eventType, {
        pointers: store,
        changedPointers: [ev],
        pointerType: pointerType,
        srcEvent: ev
      });

      if (removePointer) {
        // remove from the store
        store.splice(storeIndex, 1);
      }
    }
  });

  var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };

  var SINGLE_TOUCH_TARGET_EVENTS = "touchstart";
  var SINGLE_TOUCH_WINDOW_EVENTS = "touchstart touchmove touchend touchcancel";

  /**
   * Touch events input
   * @constructor
   * @extends Input
   */
  function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
  }

  inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
      var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

      // should we handle the touch events?
      if (type === INPUT_START) {
        this.started = true;
      }

      if (!this.started) {
        return;
      }

      var touches = normalizeSingleTouches.call(this, ev, type);

      // when done, reset the started state
      if (
        type & (INPUT_END | INPUT_CANCEL) &&
        touches[0].length - touches[1].length === 0
      ) {
        this.started = false;
      }

      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });

  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
      all = uniqueArray(all.concat(changed), "identifier", true);
    }

    return [all, changed];
  }

  var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };

  var TOUCH_TARGET_EVENTS = "touchstart touchmove touchend touchcancel";

  /**
   * Multi-user touch events input
   * @constructor
   * @extends Input
   */
  function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
  }

  inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
      var type = TOUCH_INPUT_MAP[ev.type];
      var touches = getTouches.call(this, ev, type);
      if (!touches) {
        return;
      }

      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });

  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
      targetIds[allTouches[0].identifier] = true;
      return [allTouches, allTouches];
    }

    var i,
      targetTouches,
      changedTouches = toArray(ev.changedTouches),
      changedTargetTouches = [],
      target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
      return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
      i = 0;
      while (i < targetTouches.length) {
        targetIds[targetTouches[i].identifier] = true;
        i++;
      }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
      if (targetIds[changedTouches[i].identifier]) {
        changedTargetTouches.push(changedTouches[i]);
      }

      // cleanup removed touches
      if (type & (INPUT_END | INPUT_CANCEL)) {
        delete targetIds[changedTouches[i].identifier];
      }
      i++;
    }

    if (!changedTargetTouches.length) {
      return;
    }

    return [
      // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
      uniqueArray(
        targetTouches.concat(changedTargetTouches),
        "identifier",
        true
      ),
      changedTargetTouches
    ];
  }

  /**
   * Combined touch and mouse input
   *
   * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
   * This because touch devices also emit mouse events while doing a touch.
   *
   * @constructor
   * @extends Input
   */
  function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
  }

  inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
      var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH,
        isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;

      // when we're in a touch event, so  block all upcoming mouse events
      // most mobile browser also emit mouseevents, right after touchstart
      if (isTouch) {
        this.mouse.allow = false;
      } else if (isMouse && !this.mouse.allow) {
        return;
      }

      // reset the allowMouse when we're done
      if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
        this.mouse.allow = true;
      }

      this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
      this.touch.destroy();
      this.mouse.destroy();
    }
  });

  var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, "touchAction");
  var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

  // magical touchAction value
  var TOUCH_ACTION_COMPUTE = "compute";
  var TOUCH_ACTION_AUTO = "auto";
  var TOUCH_ACTION_MANIPULATION = "manipulation"; // not implemented
  var TOUCH_ACTION_NONE = "none";
  var TOUCH_ACTION_PAN_X = "pan-x";
  var TOUCH_ACTION_PAN_Y = "pan-y";

  /**
   * Touch Action
   * sets the touchAction property or uses the js alternative
   * @param {Manager} manager
   * @param {String} value
   * @constructor
   */
  function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
  }

  TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
      // find out the touch-action by the event handlers
      if (value == TOUCH_ACTION_COMPUTE) {
        value = this.compute();
      }

      if (NATIVE_TOUCH_ACTION) {
        this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
      }
      this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
      this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
      var actions = [];
      each(this.manager.recognizers, function(recognizer) {
        if (boolOrFn(recognizer.options.enable, [recognizer])) {
          actions = actions.concat(recognizer.getTouchAction());
        }
      });
      return cleanTouchActions(actions.join(" "));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
      // not needed with native support for the touchAction property
      if (NATIVE_TOUCH_ACTION) {
        return;
      }

      var srcEvent = input.srcEvent;
      var direction = input.offsetDirection;

      // if the touch action did prevented once this session
      if (this.manager.session.prevented) {
        srcEvent.preventDefault();
        return;
      }

      var actions = this.actions;
      var hasNone = inStr(actions, TOUCH_ACTION_NONE);
      var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
      var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

      if (
        hasNone ||
        (hasPanY && direction & DIRECTION_HORIZONTAL) ||
        (hasPanX && direction & DIRECTION_VERTICAL)
      ) {
        return this.preventSrc(srcEvent);
      }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
      this.manager.session.prevented = true;
      srcEvent.preventDefault();
    }
  };

  /**
   * when the touchActions are collected they are not a valid value, so we need to clean things up. *
   * @param {String} actions
   * @returns {*}
   */
  function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
      return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // pan-x and pan-y can be combined
    if (hasPanX && hasPanY) {
      return TOUCH_ACTION_PAN_X + " " + TOUCH_ACTION_PAN_Y;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
      return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
      return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
  }

  /**
   * Recognizer flow explained; *
   * All recognizers have the initial state of POSSIBLE when a input session starts.
   * The definition of a input session is from the first input until the last input, with all it's movement in it. *
   * Example session for mouse-input: mousedown -> mousemove -> mouseup
   *
   * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
   * which determines with state it should be.
   *
   * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
   * POSSIBLE to give it another change on the next cycle.
   *
   *               Possible
   *                  |
   *            +-----+---------------+
   *            |                     |
   *      +-----+-----+               |
   *      |           |               |
   *   Failed      Cancelled          |
   *                          +-------+------+
   *                          |              |
   *                      Recognized       Began
   *                                         |
   *                                      Changed
   *                                         |
   *                                  Ended/Recognized
   */
  var STATE_POSSIBLE = 1;
  var STATE_BEGAN = 2;
  var STATE_CHANGED = 4;
  var STATE_ENDED = 8;
  var STATE_RECOGNIZED = STATE_ENDED;
  var STATE_CANCELLED = 16;
  var STATE_FAILED = 32;

  /**
   * Recognizer
   * Every recognizer needs to extend from this class.
   * @constructor
   * @param {Object} options
   */
  function Recognizer(options) {
    this.id = uniqueId();

    this.manager = null;
    this.options = merge(options || {}, this.defaults);

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
  }

  Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
      extend(this.options, options);

      // also update the touchAction, in case something changed about the directions/enabled state
      this.manager && this.manager.touchAction.update();
      return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "recognizeWith", this)) {
        return this;
      }

      var simultaneous = this.simultaneous;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (!simultaneous[otherRecognizer.id]) {
        simultaneous[otherRecognizer.id] = otherRecognizer;
        otherRecognizer.recognizeWith(this);
      }
      return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "dropRecognizeWith", this)) {
        return this;
      }

      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      delete this.simultaneous[otherRecognizer.id];
      return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "requireFailure", this)) {
        return this;
      }

      var requireFail = this.requireFail;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (inArray(requireFail, otherRecognizer) === -1) {
        requireFail.push(otherRecognizer);
        otherRecognizer.requireFailure(this);
      }
      return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "dropRequireFailure", this)) {
        return this;
      }

      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      var index = inArray(this.requireFail, otherRecognizer);
      if (index > -1) {
        this.requireFail.splice(index, 1);
      }
      return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
      return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
      return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
      var self = this;
      var state = this.state;

      function emit(withState) {
        self.manager.emit(
          self.options.event + (withState ? stateStr(state) : ""),
          input
        );
      }

      // 'panstart' and 'panmove'
      if (state < STATE_ENDED) {
        emit(true);
      }

      emit(); // simple 'eventName' events

      // panend and pancancel
      if (state >= STATE_ENDED) {
        emit(true);
      }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
      if (this.canEmit()) {
        return this.emit(input);
      }
      // it's failing anyway
      this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
      var i = 0;
      while (i < this.requireFail.length) {
        if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
          return false;
        }
        i++;
      }
      return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
      // make a new copy of the inputData
      // so we can change the inputData without messing up the other recognizers
      var inputDataClone = extend({}, inputData);

      // is is enabled and allow recognizing?
      if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
        this.reset();
        this.state = STATE_FAILED;
        return;
      }

      // reset when we've reached the end
      if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
        this.state = STATE_POSSIBLE;
      }

      this.state = this.process(inputDataClone);

      // the recognizer has recognized a gesture
      // so trigger an event
      if (
        this.state &
        (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)
      ) {
        this.tryEmit(inputDataClone);
      }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) {}, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() {},

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() {}
  };

  /**
   * get a usable string, used as event postfix
   * @param {Const} state
   * @returns {String} state
   */
  function stateStr(state) {
    if (state & STATE_CANCELLED) {
      return "cancel";
    } else if (state & STATE_ENDED) {
      return "end";
    } else if (state & STATE_CHANGED) {
      return "move";
    } else if (state & STATE_BEGAN) {
      return "start";
    }
    return "";
  }

  /**
   * direction cons to string
   * @param {Const} direction
   * @returns {String}
   */
  function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
      return "down";
    } else if (direction == DIRECTION_UP) {
      return "up";
    } else if (direction == DIRECTION_LEFT) {
      return "left";
    } else if (direction == DIRECTION_RIGHT) {
      return "right";
    }
    return "";
  }

  /**
   * get a recognizer by name if it is bound to a manager
   * @param {Recognizer|String} otherRecognizer
   * @param {Recognizer} recognizer
   * @returns {Recognizer}
   */
  function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
      return manager.get(otherRecognizer);
    }
    return otherRecognizer;
  }

  /**
   * This recognizer is just used as a base for the simple attribute recognizers.
   * @constructor
   * @extends Recognizer
   */
  function AttrRecognizer() {
    Recognizer.apply(this, arguments);
  }

  inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
      /**
       * @type {Number}
       * @default 1
       */
      pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
      var optionPointers = this.options.pointers;
      return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
      var state = this.state;
      var eventType = input.eventType;

      var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
      var isValid = this.attrTest(input);

      // on cancel input and we've recognized before, return STATE_CANCELLED
      if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
        return state | STATE_CANCELLED;
      } else if (isRecognized || isValid) {
        if (eventType & INPUT_END) {
          return state | STATE_ENDED;
        } else if (!(state & STATE_BEGAN)) {
          return STATE_BEGAN;
        }
        return state | STATE_CHANGED;
      }
      return STATE_FAILED;
    }
  });

  /**
   * Pan
   * Recognized when the pointer is down and moved in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
  }

  inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
      event: "pan",
      threshold: 10,
      pointers: 1,
      direction: DIRECTION_ALL
    },

    getTouchAction: function() {
      var direction = this.options.direction;
      var actions = [];
      if (direction & DIRECTION_HORIZONTAL) {
        actions.push(TOUCH_ACTION_PAN_Y);
      }
      if (direction & DIRECTION_VERTICAL) {
        actions.push(TOUCH_ACTION_PAN_X);
      }
      return actions;
    },

    directionTest: function(input) {
      var options = this.options;
      var hasMoved = true;
      var distance = input.distance;
      var direction = input.direction;
      var x = input.deltaX;
      var y = input.deltaY;

      // lock to axis?
      if (!(direction & options.direction)) {
        if (options.direction & DIRECTION_HORIZONTAL) {
          direction =
            x === 0 ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
          hasMoved = x != this.pX;
          distance = Math.abs(input.deltaX);
        } else {
          direction =
            y === 0 ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
          hasMoved = y != this.pY;
          distance = Math.abs(input.deltaY);
        }
      }
      input.direction = direction;
      return (
        hasMoved &&
        distance > options.threshold &&
        direction & options.direction
      );
    },

    attrTest: function(input) {
      return (
        AttrRecognizer.prototype.attrTest.call(this, input) &&
        (this.state & STATE_BEGAN ||
          (!(this.state & STATE_BEGAN) && this.directionTest(input)))
      );
    },

    emit: function(input) {
      this.pX = input.deltaX;
      this.pY = input.deltaY;

      var direction = directionStr(input.direction);
      if (direction) {
        this.manager.emit(this.options.event + direction, input);
      }

      this._super.emit.call(this, input);
    }
  });

  /**
   * Pinch
   * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
   * @constructor
   * @extends AttrRecognizer
   */
  function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: "pinch",
      threshold: 0,
      pointers: 2
    },

    getTouchAction: function() {
      return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
      return (
        this._super.attrTest.call(this, input) &&
        (Math.abs(input.scale - 1) > this.options.threshold ||
          this.state & STATE_BEGAN)
      );
    },

    emit: function(input) {
      this._super.emit.call(this, input);
      if (input.scale !== 1) {
        var inOut = input.scale < 1 ? "in" : "out";
        this.manager.emit(this.options.event + inOut, input);
      }
    }
  });

  /**
   * Press
   * Recognized when the pointer is down for x ms without any movement.
   * @constructor
   * @extends Recognizer
   */
  function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
  }

  inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
      event: "press",
      pointers: 1,
      time: 500, // minimal time of the pointer to be pressed
      threshold: 5 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
      return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTime = input.deltaTime > options.time;

      this._input = input;

      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (
        !validMovement ||
        !validPointers ||
        (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)
      ) {
        this.reset();
      } else if (input.eventType & INPUT_START) {
        this.reset();
        this._timer = setTimeoutContext(
          function() {
            this.state = STATE_RECOGNIZED;
            this.tryEmit();
          },
          options.time,
          this
        );
      } else if (input.eventType & INPUT_END) {
        return STATE_RECOGNIZED;
      }
      return STATE_FAILED;
    },

    reset: function() {
      clearTimeout(this._timer);
    },

    emit: function(input) {
      if (this.state !== STATE_RECOGNIZED) {
        return;
      }

      if (input && input.eventType & INPUT_END) {
        this.manager.emit(this.options.event + "up", input);
      } else {
        this._input.timeStamp = now();
        this.manager.emit(this.options.event, this._input);
      }
    }
  });

  /**
   * Rotate
   * Recognized when two or more pointer are moving in a circular motion.
   * @constructor
   * @extends AttrRecognizer
   */
  function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
      event: "rotate",
      threshold: 0,
      pointers: 2
    },

    getTouchAction: function() {
      return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
      return (
        this._super.attrTest.call(this, input) &&
        (Math.abs(input.rotation) > this.options.threshold ||
          this.state & STATE_BEGAN)
      );
    }
  });

  /**
   * Swipe
   * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
      event: "swipe",
      threshold: 10,
      velocity: 0.65,
      direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
      pointers: 1
    },

    getTouchAction: function() {
      return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
      var direction = this.options.direction;
      var velocity;

      if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
        velocity = input.velocity;
      } else if (direction & DIRECTION_HORIZONTAL) {
        velocity = input.velocityX;
      } else if (direction & DIRECTION_VERTICAL) {
        velocity = input.velocityY;
      }

      return (
        this._super.attrTest.call(this, input) &&
        direction & input.direction &&
        input.distance > this.options.threshold &&
        abs(velocity) > this.options.velocity &&
        input.eventType & INPUT_END
      );
    },

    emit: function(input) {
      var direction = directionStr(input.direction);
      if (direction) {
        this.manager.emit(this.options.event + direction, input);
      }

      this.manager.emit(this.options.event, input);
    }
  });

  /**
   * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
   * between the given interval and position. The delay option can be used to recognize multi-taps without firing
   * a single tap.
   *
   * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
   * multi-taps being recognized.
   * @constructor
   * @extends Recognizer
   */
  function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
  }

  inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: "tap",
      pointers: 1,
      taps: 1,
      interval: 300, // max time between the multi-tap taps
      time: 250, // max time of the pointer to be down (like finger on the screen)
      threshold: 2, // a minimal movement is ok, but keep it low
      posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
      return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
      var options = this.options;

      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTouchTime = input.deltaTime < options.time;

      this.reset();

      if (input.eventType & INPUT_START && this.count === 0) {
        return this.failTimeout();
      }

      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (validMovement && validTouchTime && validPointers) {
        if (input.eventType != INPUT_END) {
          return this.failTimeout();
        }

        var validInterval = this.pTime
          ? input.timeStamp - this.pTime < options.interval
          : true;
        var validMultiTap =
          !this.pCenter ||
          getDistance(this.pCenter, input.center) < options.posThreshold;

        this.pTime = input.timeStamp;
        this.pCenter = input.center;

        if (!validMultiTap || !validInterval) {
          this.count = 1;
        } else {
          this.count += 1;
        }

        this._input = input;

        // if tap count matches we have recognized it,
        // else it has began recognizing...
        var tapCount = this.count % options.taps;
        if (tapCount === 0) {
          // no failing requirements, immediately trigger the tap event
          // or wait as long as the multitap interval to trigger
          if (!this.hasRequireFailures()) {
            return STATE_RECOGNIZED;
          } else {
            this._timer = setTimeoutContext(
              function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
              },
              options.interval,
              this
            );
            return STATE_BEGAN;
          }
        }
      }
      return STATE_FAILED;
    },

    failTimeout: function() {
      this._timer = setTimeoutContext(
        function() {
          this.state = STATE_FAILED;
        },
        this.options.interval,
        this
      );
      return STATE_FAILED;
    },

    reset: function() {
      clearTimeout(this._timer);
    },

    emit: function() {
      if (this.state == STATE_RECOGNIZED) {
        this._input.tapCount = this.count;
        this.manager.emit(this.options.event, this._input);
      }
    }
  });

  /**
   * Simple way to create an manager with a default set of recognizers.
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(
      options.recognizers,
      Hammer.defaults.preset
    );
    return new Manager(element, options);
  }

  /**
   * @const {string}
   */
  Hammer.VERSION = "2.0.4";

  /**
   * default settings
   * @namespace
   */
  Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
      // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
      [RotateRecognizer, { enable: false }],
      [PinchRecognizer, { enable: false }, ["rotate"]],
      [SwipeRecognizer, { direction: DIRECTION_HORIZONTAL }],
      [PanRecognizer, { direction: DIRECTION_HORIZONTAL }, ["swipe"]],
      [TapRecognizer],
      [TapRecognizer, { event: "doubletap", taps: 2 }, ["tap"]],
      [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
      /**
       * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userSelect: "none",

      /**
       * Disable the Windows Phone grippers when pressing an element.
       * @type {String}
       * @default 'none'
       */
      touchSelect: "none",

      /**
       * Disables the default callout shown when you touch and hold a touch target.
       * On iOS, when you touch and hold a touch target such as a link, Safari displays
       * a callout containing information about the link. This property allows you to disable that callout.
       * @type {String}
       * @default 'none'
       */
      touchCallout: "none",

      /**
       * Specifies whether zooming is enabled. Used by IE10>
       * @type {String}
       * @default 'none'
       */
      contentZooming: "none",

      /**
       * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userDrag: "none",

      /**
       * Overrides the highlight color shown when the user taps a link or a JavaScript
       * clickable element in iOS. This property obeys the alpha value, if specified.
       * @type {String}
       * @default 'rgba(0,0,0,0)'
       */
      tapHighlightColor: "rgba(0,0,0,0)"
    }
  };

  var STOP = 1;
  var FORCED_STOP = 2;

  /**
   * Manager
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Manager(element, options) {
    options = options || {};

    this.options = merge(options, Hammer.defaults);
    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(
      options.recognizers,
      function(item) {
        var recognizer = this.add(new item[0](item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
      },
      this
    );
  }

  Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
      extend(this.options, options);

      // Options that need a little more setup
      if (options.touchAction) {
        this.touchAction.update();
      }
      if (options.inputTarget) {
        // Clean up existing event listeners and reinitialize
        this.input.destroy();
        this.input.target = options.inputTarget;
        this.input.init();
      }
      return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
      this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
      var session = this.session;
      if (session.stopped) {
        return;
      }

      // run the touch-action polyfill
      this.touchAction.preventDefaults(inputData);

      var recognizer;
      var recognizers = this.recognizers;

      // this holds the recognizer that is being recognized.
      // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
      // if no recognizer is detecting a thing, it is set to `null`
      var curRecognizer = session.curRecognizer;

      // reset when the last recognizer is recognized
      // or when we're in a new session
      if (
        !curRecognizer ||
        (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)
      ) {
        curRecognizer = session.curRecognizer = null;
      }

      var i = 0;
      while (i < recognizers.length) {
        recognizer = recognizers[i];

        // find out if we are allowed try to recognize the input for this one.
        // 1.   allow if the session is NOT forced stopped (see the .stop() method)
        // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
        //      that is being recognized.
        // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
        //      this can be setup with the `recognizeWith()` method on the recognizer.
        if (
          session.stopped !== FORCED_STOP && // 1
          (!curRecognizer ||
          recognizer == curRecognizer || // 2
            recognizer.canRecognizeWith(curRecognizer))
        ) {
          // 3
          recognizer.recognize(inputData);
        } else {
          recognizer.reset();
        }

        // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
        // current active recognizer. but only if we don't already have an active recognizer
        if (
          !curRecognizer &&
          recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)
        ) {
          curRecognizer = session.curRecognizer = recognizer;
        }
        i++;
      }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
      if (recognizer instanceof Recognizer) {
        return recognizer;
      }

      var recognizers = this.recognizers;
      for (var i = 0; i < recognizers.length; i++) {
        if (recognizers[i].options.event == recognizer) {
          return recognizers[i];
        }
      }
      return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
      if (invokeArrayArg(recognizer, "add", this)) {
        return this;
      }

      // remove existing
      var existing = this.get(recognizer.options.event);
      if (existing) {
        this.remove(existing);
      }

      this.recognizers.push(recognizer);
      recognizer.manager = this;

      this.touchAction.update();
      return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
      if (invokeArrayArg(recognizer, "remove", this)) {
        return this;
      }

      var recognizers = this.recognizers;
      recognizer = this.get(recognizer);
      recognizers.splice(inArray(recognizers, recognizer), 1);

      this.touchAction.update();
      return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
      var handlers = this.handlers;
      each(splitStr(events), function(event) {
        handlers[event] = handlers[event] || [];
        handlers[event].push(handler);
      });
      return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
      var handlers = this.handlers;
      each(splitStr(events), function(event) {
        if (!handler) {
          delete handlers[event];
        } else {
          handlers[event].splice(inArray(handlers[event], handler), 1);
        }
      });
      return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
      // we also want to trigger dom events
      if (this.options.domEvents) {
        triggerDomEvent(event, data);
      }

      // no handlers, so skip it all
      var handlers = this.handlers[event] && this.handlers[event].slice();
      if (!handlers || !handlers.length) {
        return;
      }

      data.type = event;
      data.preventDefault = function() {
        data.srcEvent.preventDefault();
      };

      var i = 0;
      while (i < handlers.length) {
        handlers[i](data);
        i++;
      }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
      this.element && toggleCssProps(this, false);

      this.handlers = {};
      this.session = {};
      this.input.destroy();
      this.element = null;
    }
  };

  /**
   * add/remove the css properties as defined in manager.options.cssProps
   * @param {Manager} manager
   * @param {Boolean} add
   */
  function toggleCssProps(manager, add) {
    var element = manager.element;
    each(manager.options.cssProps, function(value, name) {
      element.style[prefixed(element.style, name)] = add ? value : "";
    });
  }

  /**
   * trigger dom event
   * @param {String} event
   * @param {Object} data
   */
  function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent("Event");
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
  }

  extend(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
  });

  if (typeof define == TYPE_FUNCTION && define.amd) {
    define(function() {
      return Hammer;
    });
  } else if (typeof module != "undefined" && module.exports) {
    module.exports = Hammer;
  } else {
    window[exportName] = Hammer;
  }
})(window, document, "Hammer");
/*!
 * imagesLoaded PACKAGED v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

/*!
 * EventEmitter v4.2.6 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function() {
  /**
   * Class for managing events.
   * Can be extended to provide event functionality in other classes.
   *
   * @class EventEmitter Manages event registering and emitting.
   */
  function EventEmitter() {}

  // Shortcuts to improve speed and size
  var proto = EventEmitter.prototype;
  var exports = this;
  var originalGlobalValue = exports.EventEmitter;

  /**
   * Finds the index of the listener for the event in it's storage array.
   *
   * @param {Function[]} listeners Array of listeners to search through.
   * @param {Function} listener Method to look for.
   * @return {Number} Index of the specified listener, -1 if not found
   * @api private
   */
  function indexOfListener(listeners, listener) {
    var i = listeners.length;
    while (i--) {
      if (listeners[i].listener === listener) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Alias a method while keeping the context correct, to allow for overwriting of target method.
   *
   * @param {String} name The name of the target method.
   * @return {Function} The aliased method
   * @api private
   */
  function alias(name) {
    return function aliasClosure() {
      return this[name].apply(this, arguments);
    };
  }

  /**
   * Returns the listener array for the specified event.
   * Will initialise the event object and listener arrays if required.
   * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
   * Each property in the object response is an array of listener functions.
   *
   * @param {String|RegExp} evt Name of the event to return the listeners from.
   * @return {Function[]|Object} All listener functions for the event.
   */
  proto.getListeners = function getListeners(evt) {
    var events = this._getEvents();
    var response;
    var key;

    // Return a concatenated array of all matching events if
    // the selector is a regular expression.
    if (typeof evt === "object") {
      response = {};
      for (key in events) {
        if (events.hasOwnProperty(key) && evt.test(key)) {
          response[key] = events[key];
        }
      }
    } else {
      response = events[evt] || (events[evt] = []);
    }

    return response;
  };

  /**
   * Takes a list of listener objects and flattens it into a list of listener functions.
   *
   * @param {Object[]} listeners Raw listener objects.
   * @return {Function[]} Just the listener functions.
   */
  proto.flattenListeners = function flattenListeners(listeners) {
    var flatListeners = [];
    var i;

    for (i = 0; i < listeners.length; i += 1) {
      flatListeners.push(listeners[i].listener);
    }

    return flatListeners;
  };

  /**
   * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
   *
   * @param {String|RegExp} evt Name of the event to return the listeners from.
   * @return {Object} All listener functions for an event in an object.
   */
  proto.getListenersAsObject = function getListenersAsObject(evt) {
    var listeners = this.getListeners(evt);
    var response;

    if (listeners instanceof Array) {
      response = {};
      response[evt] = listeners;
    }

    return response || listeners;
  };

  /**
   * Adds a listener function to the specified event.
   * The listener will not be added if it is a duplicate.
   * If the listener returns true then it will be removed after it is called.
   * If you pass a regular expression as the event name then the listener will be added to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to attach the listener to.
   * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addListener = function addListener(evt, listener) {
    var listeners = this.getListenersAsObject(evt);
    var listenerIsWrapped = typeof listener === "object";
    var key;

    for (key in listeners) {
      if (
        listeners.hasOwnProperty(key) &&
        indexOfListener(listeners[key], listener) === -1
      ) {
        listeners[key].push(
          listenerIsWrapped
            ? listener
            : {
                listener: listener,
                once: false
              }
        );
      }
    }

    return this;
  };

  /**
   * Alias of addListener
   */
  proto.on = alias("addListener");

  /**
   * Semi-alias of addListener. It will add a listener that will be
   * automatically removed after it's first execution.
   *
   * @param {String|RegExp} evt Name of the event to attach the listener to.
   * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addOnceListener = function addOnceListener(evt, listener) {
    return this.addListener(evt, {
      listener: listener,
      once: true
    });
  };

  /**
   * Alias of addOnceListener.
   */
  proto.once = alias("addOnceListener");

  /**
   * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
   * You need to tell it what event names should be matched by a regex.
   *
   * @param {String} evt Name of the event to create.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.defineEvent = function defineEvent(evt) {
    this.getListeners(evt);
    return this;
  };

  /**
   * Uses defineEvent to define multiple events.
   *
   * @param {String[]} evts An array of event names to define.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.defineEvents = function defineEvents(evts) {
    for (var i = 0; i < evts.length; i += 1) {
      this.defineEvent(evts[i]);
    }
    return this;
  };

  /**
   * Removes a listener function from the specified event.
   * When passed a regular expression as the event name, it will remove the listener from all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to remove the listener from.
   * @param {Function} listener Method to remove from the event.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeListener = function removeListener(evt, listener) {
    var listeners = this.getListenersAsObject(evt);
    var index;
    var key;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        index = indexOfListener(listeners[key], listener);

        if (index !== -1) {
          listeners[key].splice(index, 1);
        }
      }
    }

    return this;
  };

  /**
   * Alias of removeListener
   */
  proto.off = alias("removeListener");

  /**
   * Adds listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
   * You can also pass it a regular expression to add the array of listeners to all events that match it.
   * Yeah, this function does quite a bit. That's probably a bad thing.
   *
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addListeners = function addListeners(evt, listeners) {
    // Pass through to manipulateListeners
    return this.manipulateListeners(false, evt, listeners);
  };

  /**
   * Removes listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be removed.
   * You can also pass it a regular expression to remove the listeners from all events that match it.
   *
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to remove.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeListeners = function removeListeners(evt, listeners) {
    // Pass through to manipulateListeners
    return this.manipulateListeners(true, evt, listeners);
  };

  /**
   * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
   * The first argument will determine if the listeners are removed (true) or added (false).
   * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be added/removed.
   * You can also pass it a regular expression to manipulate the listeners of all events that match it.
   *
   * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.manipulateListeners = function manipulateListeners(
    remove,
    evt,
    listeners
  ) {
    var i;
    var value;
    var single = remove ? this.removeListener : this.addListener;
    var multiple = remove ? this.removeListeners : this.addListeners;

    // If evt is an object then pass each of it's properties to this method
    if (typeof evt === "object" && !(evt instanceof RegExp)) {
      for (i in evt) {
        if (evt.hasOwnProperty(i) && (value = evt[i])) {
          // Pass the single listener straight through to the singular method
          if (typeof value === "function") {
            single.call(this, i, value);
          } else {
            // Otherwise pass back to the multiple function
            multiple.call(this, i, value);
          }
        }
      }
    } else {
      // So evt must be a string
      // And listeners must be an array of listeners
      // Loop over it and pass each one to the multiple method
      i = listeners.length;
      while (i--) {
        single.call(this, evt, listeners[i]);
      }
    }

    return this;
  };

  /**
   * Removes all listeners from a specified event.
   * If you do not specify an event then all listeners will be removed.
   * That means every event will be emptied.
   * You can also pass a regex to remove all events that match it.
   *
   * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeEvent = function removeEvent(evt) {
    var type = typeof evt;
    var events = this._getEvents();
    var key;

    // Remove different things depending on the state of evt
    if (type === "string") {
      // Remove all listeners for the specified event
      delete events[evt];
    } else if (type === "object") {
      // Remove all events matching the regex.
      for (key in events) {
        if (events.hasOwnProperty(key) && evt.test(key)) {
          delete events[key];
        }
      }
    } else {
      // Remove all listeners in all events
      delete this._events;
    }

    return this;
  };

  /**
   * Alias of removeEvent.
   *
   * Added to mirror the node API.
   */
  proto.removeAllListeners = alias("removeEvent");

  /**
   * Emits an event of your choice.
   * When emitted, every listener attached to that event will be executed.
   * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
   * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
   * So they will not arrive within the array on the other side, they will be separate.
   * You can also pass a regular expression to emit to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
   * @param {Array} [args] Optional array of arguments to be passed to each listener.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.emitEvent = function emitEvent(evt, args) {
    var listeners = this.getListenersAsObject(evt);
    var listener;
    var i;
    var key;
    var response;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        i = listeners[key].length;

        while (i--) {
          // If the listener returns true then it shall be removed from the event
          // The function is executed either with a basic call or an apply if there is an args array
          listener = listeners[key][i];

          if (listener.once === true) {
            this.removeListener(evt, listener.listener);
          }

          response = listener.listener.apply(this, args || []);

          if (response === this._getOnceReturnValue()) {
            this.removeListener(evt, listener.listener);
          }
        }
      }
    }

    return this;
  };

  /**
   * Alias of emitEvent
   */
  proto.trigger = alias("emitEvent");

  /**
   * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
   * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
   * @param {...*} Optional additional arguments to be passed to each listener.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.emit = function emit(evt) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.emitEvent(evt, args);
  };

  /**
   * Sets the current value to check against when executing listeners. If a
   * listeners return value matches the one set here then it will be removed
   * after execution. This value defaults to true.
   *
   * @param {*} value The new value to check for when executing listeners.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.setOnceReturnValue = function setOnceReturnValue(value) {
    this._onceReturnValue = value;
    return this;
  };

  /**
   * Fetches the current value to check against when executing listeners. If
   * the listeners return value matches this one then it should be removed
   * automatically. It will return true by default.
   *
   * @return {*|Boolean} The current value to check for or the default, true.
   * @api private
   */
  proto._getOnceReturnValue = function _getOnceReturnValue() {
    if (this.hasOwnProperty("_onceReturnValue")) {
      return this._onceReturnValue;
    } else {
      return true;
    }
  };

  /**
   * Fetches the events object and creates one if required.
   *
   * @return {Object} The events storage object.
   * @api private
   */
  proto._getEvents = function _getEvents() {
    return this._events || (this._events = {});
  };

  /**
   * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
   *
   * @return {Function} Non conflicting EventEmitter class.
   */
  EventEmitter.noConflict = function noConflict() {
    exports.EventEmitter = originalGlobalValue;
    return EventEmitter;
  };

  // Expose the class either via AMD, CommonJS or the global object
  if (typeof define === "function" && define.amd) {
    define("eventEmitter/EventEmitter", [], function() {
      return EventEmitter;
    });
  } else if (typeof module === "object" && module.exports) {
    module.exports = EventEmitter;
  } else {
    this.EventEmitter = EventEmitter;
  }
}.call(this));

/*!
 * eventie v1.0.4
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false */

(function(window) {
  var docElem = document.documentElement;

  var bind = function() {};

  function getIEEvent(obj) {
    var event = window.event;
    // add event.target
    event.target = event.target || event.srcElement || obj;
    return event;
  }

  if (docElem.addEventListener) {
    bind = function(obj, type, fn) {
      obj.addEventListener(type, fn, false);
    };
  } else if (docElem.attachEvent) {
    bind = function(obj, type, fn) {
      obj[type + fn] = fn.handleEvent
        ? function() {
            var event = getIEEvent(obj);
            fn.handleEvent.call(fn, event);
          }
        : function() {
            var event = getIEEvent(obj);
            fn.call(obj, event);
          };
      obj.attachEvent("on" + type, obj[type + fn]);
    };
  }

  var unbind = function() {};

  if (docElem.removeEventListener) {
    unbind = function(obj, type, fn) {
      obj.removeEventListener(type, fn, false);
    };
  } else if (docElem.detachEvent) {
    unbind = function(obj, type, fn) {
      obj.detachEvent("on" + type, obj[type + fn]);
      try {
        delete obj[type + fn];
      } catch (err) {
        // can't delete window object properties
        obj[type + fn] = undefined;
      }
    };
  }

  var eventie = {
    bind: bind,
    unbind: unbind
  };

  // transport
  if (typeof define === "function" && define.amd) {
    // AMD
    define("eventie/eventie", eventie);
  } else {
    // browser global
    window.eventie = eventie;
  }
})(this);

/*!
 * imagesLoaded v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function(window, factory) {
  // universal module definition

  /*global define: false, module: false, require: false */

  if (typeof define === "function" && define.amd) {
    // AMD
    define(["eventEmitter/EventEmitter", "eventie/eventie"], function(
      EventEmitter,
      eventie
    ) {
      return factory(window, EventEmitter, eventie);
    });
  } else if (typeof exports === "object") {
    // CommonJS
    module.exports = factory(
      window,
      require("wolfy87-eventemitter"),
      require("eventie")
    );
  } else {
    // browser global
    window.imagesLoaded = factory(window, window.EventEmitter, window.eventie);
  }
})(
  window,

  // --------------------------  factory -------------------------- //

  function factory(window, EventEmitter, eventie) {
    var $ = window.jQuery;
    var console = window.console;
    var hasConsole = typeof console !== "undefined";

    // -------------------------- helpers -------------------------- //

    // extend objects
    function extend(a, b) {
      for (var prop in b) {
        a[prop] = b[prop];
      }
      return a;
    }

    var objToString = Object.prototype.toString;
    function isArray(obj) {
      return objToString.call(obj) === "[object Array]";
    }

    // turn element or nodeList into an array
    function makeArray(obj) {
      var ary = [];
      if (isArray(obj)) {
        // use object if already an array
        ary = obj;
      } else if (typeof obj.length === "number") {
        // convert nodeList to array
        for (var i = 0, len = obj.length; i < len; i++) {
          ary.push(obj[i]);
        }
      } else {
        // array of single index
        ary.push(obj);
      }
      return ary;
    }

    // -------------------------- imagesLoaded -------------------------- //

    /**
     * @param {Array, Element, NodeList, String} elem
     * @param {Object or Function} options - if function, use as callback
     * @param {Function} onAlways - callback function
     */
    function ImagesLoaded(elem, options, onAlways) {
      // coerce ImagesLoaded() without new, to be new ImagesLoaded()
      if (!(this instanceof ImagesLoaded)) {
        return new ImagesLoaded(elem, options);
      }
      // use elem as selector string
      if (typeof elem === "string") {
        elem = document.querySelectorAll(elem);
      }

      this.elements = makeArray(elem);
      this.options = extend({}, this.options);

      if (typeof options === "function") {
        onAlways = options;
      } else {
        extend(this.options, options);
      }

      if (onAlways) {
        this.on("always", onAlways);
      }

      this.getImages();

      if ($) {
        // add jQuery Deferred object
        this.jqDeferred = new $.Deferred();
      }

      // HACK check async to allow time to bind listeners
      var _this = this;
      setTimeout(function() {
        _this.check();
      });
    }

    ImagesLoaded.prototype = new EventEmitter();

    ImagesLoaded.prototype.options = {};

    ImagesLoaded.prototype.getImages = function() {
      this.images = [];

      // filter & find items if we have an item selector
      for (var i = 0, len = this.elements.length; i < len; i++) {
        var elem = this.elements[i];
        // filter siblings
        if (elem.nodeName === "IMG") {
          this.addImage(elem);
        }
        // find children
        // no non-element nodes, #143
        var nodeType = elem.nodeType;
        if (
          !nodeType ||
          !(nodeType === 1 || nodeType === 9 || nodeType === 11)
        ) {
          continue;
        }
        var childElems = elem.querySelectorAll("img");
        // concat childElems to filterFound array
        for (var j = 0, jLen = childElems.length; j < jLen; j++) {
          var img = childElems[j];
          this.addImage(img);
        }
      }
    };

    /**
     * @param {Image} img
     */
    ImagesLoaded.prototype.addImage = function(img) {
      var loadingImage = new LoadingImage(img);
      this.images.push(loadingImage);
    };

    ImagesLoaded.prototype.check = function() {
      var _this = this;
      var checkedCount = 0;
      var length = this.images.length;
      this.hasAnyBroken = false;
      // complete if no images
      if (!length) {
        this.complete();
        return;
      }

      function onConfirm(image, message) {
        if (_this.options.debug && hasConsole) {
          console.log("confirm", image, message);
        }

        _this.progress(image);
        checkedCount++;
        if (checkedCount === length) {
          _this.complete();
        }
        return true; // bind once
      }

      for (var i = 0; i < length; i++) {
        var loadingImage = this.images[i];
        loadingImage.on("confirm", onConfirm);
        loadingImage.check();
      }
    };

    ImagesLoaded.prototype.progress = function(image) {
      this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
      // HACK - Chrome triggers event before object properties have changed. #83
      var _this = this;
      setTimeout(function() {
        _this.emit("progress", _this, image);
        if (_this.jqDeferred && _this.jqDeferred.notify) {
          _this.jqDeferred.notify(_this, image);
        }
      });
    };

    ImagesLoaded.prototype.complete = function() {
      var eventName = this.hasAnyBroken ? "fail" : "done";
      this.isComplete = true;
      var _this = this;
      // HACK - another setTimeout so that confirm happens after progress
      setTimeout(function() {
        _this.emit(eventName, _this);
        _this.emit("always", _this);
        if (_this.jqDeferred) {
          var jqMethod = _this.hasAnyBroken ? "reject" : "resolve";
          _this.jqDeferred[jqMethod](_this);
        }
      });
    };

    // -------------------------- jquery -------------------------- //

    if ($) {
      $.fn.imagesLoaded = function(options, callback) {
        var instance = new ImagesLoaded(this, options, callback);
        return instance.jqDeferred.promise($(this));
      };
    }

    // --------------------------  -------------------------- //

    function LoadingImage(img) {
      this.img = img;
    }

    LoadingImage.prototype = new EventEmitter();

    LoadingImage.prototype.check = function() {
      // first check cached any previous images that have same src
      var resource = cache[this.img.src] || new Resource(this.img.src);
      if (resource.isConfirmed) {
        this.confirm(resource.isLoaded, "cached was confirmed");
        return;
      }

      // If complete is true and browser supports natural sizes,
      // try to check for image status manually.
      if (this.img.complete && this.img.naturalWidth !== undefined) {
        // report based on naturalWidth
        this.confirm(this.img.naturalWidth !== 0, "naturalWidth");
        return;
      }

      // If none of the checks above matched, simulate loading on detached element.
      var _this = this;
      resource.on("confirm", function(resrc, message) {
        _this.confirm(resrc.isLoaded, message);
        return true;
      });

      resource.check();
    };

    LoadingImage.prototype.confirm = function(isLoaded, message) {
      this.isLoaded = isLoaded;
      this.emit("confirm", this, message);
    };

    // -------------------------- Resource -------------------------- //

    // Resource checks each src, only once
    // separate class from LoadingImage to prevent memory leaks. See #115

    var cache = {};

    function Resource(src) {
      this.src = src;
      // add to cache
      cache[src] = this;
    }

    Resource.prototype = new EventEmitter();

    Resource.prototype.check = function() {
      // only trigger checking once
      if (this.isChecked) {
        return;
      }
      // simulate loading on detached element
      var proxyImage = new Image();
      eventie.bind(proxyImage, "load", this);
      eventie.bind(proxyImage, "error", this);
      proxyImage.src = this.src;
      // set flag
      this.isChecked = true;
    };

    // ----- events ----- //

    // trigger specified handler for event type
    Resource.prototype.handleEvent = function(event) {
      var method = "on" + event.type;
      if (this[method]) {
        this[method](event);
      }
    };

    Resource.prototype.onload = function(event) {
      this.confirm(true, "onload");
      this.unbindProxyEvents(event);
    };

    Resource.prototype.onerror = function(event) {
      this.confirm(false, "onerror");
      this.unbindProxyEvents(event);
    };

    // ----- confirm ----- //

    Resource.prototype.confirm = function(isLoaded, message) {
      this.isConfirmed = true;
      this.isLoaded = isLoaded;
      this.emit("confirm", this, message);
    };

    Resource.prototype.unbindProxyEvents = function(event) {
      eventie.unbind(event.target, "load", this);
      eventie.unbind(event.target, "error", this);
    };

    // -----  ----- //

    return ImagesLoaded;
  }
);
/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.6
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var defaults = {
    interval: 250,
    force_process: false
  };
  var $window = $(window);

  var $prior_appeared = [];

  function process() {
    check_lock = false;
    for (
      var index = 0, selectorsLength = selectors.length;
      index < selectorsLength;
      index++
    ) {
      var $appeared = $(selectors[index]).filter(function() {
        return $(this).is(":appeared");
      });

      $appeared.trigger("appear", [$appeared]);

      if ($prior_appeared[index]) {
        var $disappeared = $prior_appeared[index].not($appeared);
        $disappeared.trigger("disappear", [$disappeared]);
      }
      $prior_appeared[index] = $appeared;
    }
  }

  function add_selector(selector) {
    selectors.push(selector);
    $prior_appeared.push();
  }

  // "appeared" custom filter
  $.expr[":"]["appeared"] = function(element) {
    var $element = $(element);
    if (!$element.is(":visible")) {
      return false;
    }

    var window_left = $window.scrollLeft();
    var window_top = $window.scrollTop();
    var offset = $element.offset();
    var left = offset.left;
    var top = offset.top;

    if (
      top + $element.height() >= window_top &&
      top - ($element.data("appear-top-offset") || 0) <=
        window_top + $window.height() &&
      left + $element.width() >= window_left &&
      left - ($element.data("appear-left-offset") || 0) <=
        window_left + $window.width()
    ) {
      return true;
    } else {
      return false;
    }
  };

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var opts = $.extend({}, defaults, options || {});
      var selector = this.selector || this;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, opts.interval);
        };

        $(window)
          .scroll(on_check)
          .resize(on_check);
        check_binded = true;
      }

      if (opts.force_process) {
        setTimeout(process, opts.interval);
      }
      add_selector(selector);
      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        process();
        return true;
      }
      return false;
    }
  });
})(
  (function() {
    if (typeof module !== "undefined") {
      // Node
      return require("jquery");
    } else {
      return jQuery;
    }
  })()
);

/* --- $DJAX --- */

/*
 * jQuery djax
 *
 * @version v0.122
 *
 * Copyright 2012, Brian Zeligson
 * Released under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Homepage:
 *   http://beezee.github.com/djax.html
 *
 * Authors:
 *   Brian Zeligson
 *
 * Contributors:
 *  Gary Jones @GaryJones
 *
 * Maintainer:
 *   Brian Zeligson github @beezee
 *
 */

/*jslint browser: true, indent: 4, maxerr: 50, sub: true */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, noarg:true, noempty:true, nomen:true, nonew:true, onevar:true, plusplus:true, regexp:true, smarttabs:true, strict:true, trailing:true, undef:true, white:true, browser:true, jquery:true, indent:4, maxerr:50, */
/*global jQuery */

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name jquery.djax.js
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.7.js
// ==/ClosureCompiler==
// http://closure-compiler.appspot.com/home

(function($, exports) {
  "use strict";

  $.support.cors = true;

  $.fn.djax = function(selector, exceptions, replaceBlockWithFunc) {
    // If browser doesn't support pushState, abort now
    if (!history.pushState) {
      return $(this);
    }

    var self = this,
      blockSelector = selector,
      excludes = exceptions && exceptions.length ? exceptions : [],
      replaceBlockWith = replaceBlockWithFunc
        ? replaceBlockWithFunc
        : $.fn.replaceWith,
      djaxing = false;

    // Ensure that the history is correct when going from 2nd page to 1st
    window.history.replaceState(
      {
        url: window.location.href,
        title: $("title").text()
      },
      $("title").text(),
      window.location.href
    );

    //if (globalDebug) {console.log("djax::replaceState url:" + window.location.href);}

    self.clearDjaxing = function() {
      self.djaxing = false;
    };

    // Exclude the link exceptions
    self.attachClick = function(element, event) {
      var link = $(element),
        exception = false;

      $.each(excludes, function(index, exclusion) {
        if (link.attr("href").indexOf(exclusion) !== -1) {
          exception = true;
        }
        if (window.location.href.indexOf(exclusion) !== -1) {
          exception = true;
        }
      });

      if ($(element).is("[target^=_blank], [rel^=external]")) {
        exception = true;
      }

      // If the link is one of the exceptions, return early so that
      // the link can be clicked and a full page load as normal
      if (exception) {
        return $(element);
      }

      // From this point on, we handle the behaviour
      event.preventDefault();

      // If we're already doing djaxing, return now and silently fail
      if (self.djaxing) {
        setTimeout(self.clearDjaxing, 1000);
        return $(element);
      }

      $(window).trigger("djaxClick", [element]);
      self.reqUrl = link.attr("href");
      self.triggered = false;
      self.navigate(link.attr("href"), true);
    };

    // Handle the navigation
    self.navigate = function(url, add) {
      var blocks = $(blockSelector);

      self.djaxing = true;

      // Get the new page
      $(window).trigger("djaxLoading", [
        {
          url: url
        }
      ]);

      var replaceBlocks = function(response) {
        if (url !== self.reqUrl) {
          self.navigate(self.reqUrl, false);
          return true;
        }

        var result = $(response),
          newBlocks = $(result).find(blockSelector);

        if (add === true) {
          window.history.pushState(
            {
              url: url,
              title: $(result)
                .filter("title")
                .text()
            },
            $(result)
              .filter("title")
              .text(),
            url
          );

          //if (globalDebug) {console.log("djax::pushState url:" + url);}
        }

        // Set page title as new page title
        // Set title cross-browser:
        // - $('title').text(title_text); returns an error on IE7
        //
        document.title = $(result)
          .filter("title")
          .text();

        // Loop through each block and find new page equivalent
        blocks.each(function() {
          var id = "#" + $(this).attr("id"),
            newBlock = newBlocks.filter(id),
            block = $(this);

          $("a", newBlock)
            .filter(function() {
              return this.hostname === location.hostname;
            })
            .addClass("dJAX_internal")
            .on("click", function(event) {
              return self.attachClick(this, event);
            });

          if (newBlock.length) {
            if (block.html() !== newBlock.html()) {
              replaceBlockWith.call(block, newBlock);
            }
          } else {
            block.remove();
          }
        });

        // Loop through new page blocks and add in as needed
        $.each(newBlocks, function() {
          var newBlock = $(this),
            id = "#" + $(this).attr("id"),
            $previousSibling;

          // If there is a new page block without an equivalent block
          // in the old page, we need to find out where to insert it
          if (!$(id).length) {
            // Find the previous sibling
            $previousSibling = $(result)
              .find(id)
              .prev();

            if ($previousSibling.length) {
              // Insert after the previous element
              newBlock.insertAfter("#" + $previousSibling.attr("id"));
            } else {
              // There's no previous sibling, so prepend to parent instead
              newBlock.prependTo("#" + newBlock.parent().attr("id"));
            }

            // Only add a class to internal links
            $("a", newBlock)
              .filter(function() {
                return this.hostname === location.hostname;
              })
              .addClass("dJAX_internal")
              .on("click", function(event) {
                return self.attachClick(this, event);
              });
          }
        });

        // Trigger djaxLoad event as a pseudo ready()
        if (!self.triggered) {
          $(window).trigger("djaxLoad", [
            {
              url: url,
              title: $(result)
                .filter("title")
                .text(),
              response: response
            }
          ]);
          self.triggered = true;
          self.djaxing = false;
        }

        // Trigger a djaxLoaded event when done
        $(window).trigger("djaxLoaded", [
          {
            url: url,
            title: $(result)
              .filter("title")
              .text(),
            response: response
          }
        ]);
      };

      $.ajax({
        url: url,
        success: function(response) {
          replaceBlocks(response);
        },
        error: function(response, textStatus, errorThrown) {
          // handle error
          console.log("error", response, textStatus, errorThrown);
          replaceBlocks(response["responseText"]);
        }
      });
    }; /* End self.navigate */

    // Only add a class to internal links
    $(this)
      .find("a")
      .filter(function() {
        return this.hostname === location.hostname;
      })
      .addClass("dJAX_internal");
    // attachClick to links with '.dJAX_internal'. Includes links loaded via ajax.
    $(this).on("click", ".dJAX_internal", function(event) {
      if (this.hostname !== location.hostname) return;
      return self.attachClick(this, event);
    });

    // On new page load
    $(window).bind("popstate", function(event) {
      self.triggered = false;
      if (event.originalEvent.state) {
        self.reqUrl = event.originalEvent.state.url;
        self.navigate(event.originalEvent.state.url, false);
      }
    });
  };
})(jQuery, window);
/* jquery.nicescroll
-- version 3.7.6
-- copyright 2017-07-19 InuYaksa*2017
-- licensed under the MIT
--
-- https://nicescroll.areaaperta.com/
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/

/* jshint expr: true */

(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    // Node/CommonJS.
    module.exports = factory(require("jquery"));
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function(jQuery) {
  "use strict";

  // globals
  var domfocus = false,
    mousefocus = false,
    tabindexcounter = 0,
    ascrailcounter = 2000,
    globalmaxzindex = 0;

  var $ = jQuery, // sandbox
    _doc = document,
    _win = window,
    $window = $(_win);

  var delegatevents = [];

  // http://stackoverflow.com/questions/2161159/get-script-path
  function getScriptPath() {
    var scripts =
      _doc.currentScript ||
      (function() {
        var s = _doc.getElementsByTagName("script");
        return s.length ? s[s.length - 1] : false;
      })();
    var path = scripts ? scripts.src.split("?")[0] : "";
    return path.split("/").length > 0
      ? path
          .split("/")
          .slice(0, -1)
          .join("/") + "/"
      : "";
  }

  // based on code by Paul Irish https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  var setAnimationFrame =
    _win.requestAnimationFrame ||
    _win.webkitRequestAnimationFrame ||
    _win.mozRequestAnimationFrame ||
    false;
  var clearAnimationFrame =
    _win.cancelAnimationFrame ||
    _win.webkitCancelAnimationFrame ||
    _win.mozCancelAnimationFrame ||
    false;

  if (!setAnimationFrame) {
    var anilasttime = 0;
    setAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - anilasttime));
      var id = _win.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      anilasttime = currTime + timeToCall;
      return id;
    };
    clearAnimationFrame = function(id) {
      _win.clearTimeout(id);
    };
  } else {
    if (!_win.cancelAnimationFrame) clearAnimationFrame = function(id) {};
  }

  var ClsMutationObserver =
    _win.MutationObserver || _win.WebKitMutationObserver || false;

  var now =
    Date.now ||
    function() {
      return new Date().getTime();
    };

  var _globaloptions = {
    zindex: "auto",
    cursoropacitymin: 0,
    cursoropacitymax: 1,
    cursorcolor: "#424242",
    cursorwidth: "6px",
    cursorborder: "1px solid #fff",
    cursorborderradius: "5px",
    scrollspeed: 40,
    mousescrollstep: 9 * 3,
    touchbehavior: false, // deprecated
    emulatetouch: false, // replacing touchbehavior
    hwacceleration: true,
    usetransition: true,
    boxzoom: false,
    dblclickzoom: true,
    gesturezoom: true,
    grabcursorenabled: true,
    autohidemode: true,
    background: "",
    iframeautoresize: true,
    cursorminheight: 32,
    preservenativescrolling: true,
    railoffset: false,
    railhoffset: false,
    bouncescroll: true,
    spacebarenabled: true,
    railpadding: {
      top: 0,
      right: 0,
      left: 0,
      bottom: 0
    },
    disableoutline: true,
    horizrailenabled: true,
    railalign: "right",
    railvalign: "bottom",
    enabletranslate3d: true,
    enablemousewheel: true,
    enablekeyboard: true,
    smoothscroll: true,
    sensitiverail: true,
    enablemouselockapi: true,
    //      cursormaxheight:false,
    cursorfixedheight: false,
    directionlockdeadzone: 6,
    hidecursordelay: 400,
    nativeparentscrolling: true,
    enablescrollonselection: true,
    overflowx: true,
    overflowy: true,
    cursordragspeed: 0.3,
    rtlmode: "auto",
    cursordragontouch: false,
    oneaxismousemode: "auto",
    scriptpath: getScriptPath(),
    preventmultitouchscrolling: true,
    disablemutationobserver: false,
    enableobserver: true,
    scrollbarid: false
  };

  var browserdetected = false;

  var getBrowserDetection = function() {
    if (browserdetected) return browserdetected;

    var _el = _doc.createElement("DIV"),
      _style = _el.style,
      _agent = navigator.userAgent,
      _platform = navigator.platform,
      d = {};

    d.haspointerlock =
      "pointerLockElement" in _doc ||
      "webkitPointerLockElement" in _doc ||
      "mozPointerLockElement" in _doc;

    d.isopera = "opera" in _win; // 12-
    d.isopera12 = d.isopera && "getUserMedia" in navigator;
    d.isoperamini =
      Object.prototype.toString.call(_win.operamini) === "[object OperaMini]";

    d.isie = "all" in _doc && "attachEvent" in _el && !d.isopera; //IE10-
    d.isieold = d.isie && !("msInterpolationMode" in _style); // IE6 and older
    d.isie7 =
      d.isie &&
      !d.isieold &&
      (!("documentMode" in _doc) || _doc.documentMode === 7);
    d.isie8 = d.isie && "documentMode" in _doc && _doc.documentMode === 8;
    d.isie9 = d.isie && "performance" in _win && _doc.documentMode === 9;
    d.isie10 = d.isie && "performance" in _win && _doc.documentMode === 10;
    d.isie11 = "msRequestFullscreen" in _el && _doc.documentMode >= 11; // IE11+

    d.ismsedge = "msCredentials" in _win; // MS Edge 14+

    d.ismozilla = "MozAppearance" in _style;

    d.iswebkit = !d.ismsedge && "WebkitAppearance" in _style;

    d.ischrome = d.iswebkit && "chrome" in _win;
    d.ischrome38 = d.ischrome && "touchAction" in _style; // behavior changed in touch emulation
    d.ischrome22 = !d.ischrome38 && (d.ischrome && d.haspointerlock);
    d.ischrome26 = !d.ischrome38 && (d.ischrome && "transition" in _style); // issue with transform detection (maintain prefix)

    d.cantouch =
      "ontouchstart" in _doc.documentElement || "ontouchstart" in _win; // with detection for Chrome Touch Emulation
    d.hasw3ctouch =
      (_win.PointerEvent || false) &&
      (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0); //IE11 pointer events, following W3C Pointer Events spec
    d.hasmstouch = !d.hasw3ctouch && (_win.MSPointerEvent || false); // IE10 pointer events

    d.ismac = /^mac$/i.test(_platform);

    d.isios = d.cantouch && /iphone|ipad|ipod/i.test(_platform);
    d.isios4 = d.isios && !("seal" in Object);
    d.isios7 = d.isios && "webkitHidden" in _doc; //iOS 7+
    d.isios8 = d.isios && "hidden" in _doc; //iOS 8+
    d.isios10 = d.isios && _win.Proxy; //iOS 10+

    d.isandroid = /android/i.test(_agent);

    d.haseventlistener = "addEventListener" in _el;

    d.trstyle = false;
    d.hastransform = false;
    d.hastranslate3d = false;
    d.transitionstyle = false;
    d.hastransition = false;
    d.transitionend = false;

    d.trstyle = "transform";
    d.hastransform =
      "transform" in _style ||
      (function() {
        var check = [
          "msTransform",
          "webkitTransform",
          "MozTransform",
          "OTransform"
        ];
        for (var a = 0, c = check.length; a < c; a++) {
          if (_style[check[a]] !== undefined) {
            d.trstyle = check[a];
            break;
          }
        }
        d.hastransform = !!d.trstyle;
      })();

    if (d.hastransform) {
      _style[d.trstyle] = "translate3d(1px,2px,3px)";
      d.hastranslate3d = /translate3d/.test(_style[d.trstyle]);
    }

    d.transitionstyle = "transition";
    d.prefixstyle = "";
    d.transitionend = "transitionend";

    d.hastransition =
      "transition" in _style ||
      (function() {
        d.transitionend = false;
        var check = [
          "webkitTransition",
          "msTransition",
          "MozTransition",
          "OTransition",
          "OTransition",
          "KhtmlTransition"
        ];
        var prefix = ["-webkit-", "-ms-", "-moz-", "-o-", "-o", "-khtml-"];
        var evs = [
          "webkitTransitionEnd",
          "msTransitionEnd",
          "transitionend",
          "otransitionend",
          "oTransitionEnd",
          "KhtmlTransitionEnd"
        ];
        for (var a = 0, c = check.length; a < c; a++) {
          if (check[a] in _style) {
            d.transitionstyle = check[a];
            d.prefixstyle = prefix[a];
            d.transitionend = evs[a];
            break;
          }
        }
        if (d.ischrome26) d.prefixstyle = prefix[1]; // always use prefix

        d.hastransition = d.transitionstyle;
      })();

    function detectCursorGrab() {
      var lst = ["grab", "-webkit-grab", "-moz-grab"];
      if ((d.ischrome && !d.ischrome38) || d.isie) lst = []; // force setting for IE returns false positive and chrome cursor bug
      for (var a = 0, l = lst.length; a < l; a++) {
        var p = lst[a];
        _style.cursor = p;
        if (_style.cursor == p) return p;
      }
      return "url(https://cdnjs.cloudflare.com/ajax/libs/slider-pro/1.3.0/css/images/openhand.cur),n-resize"; // thanks to https://cdnjs.com/ for the openhand cursor!
    }
    d.cursorgrabvalue = detectCursorGrab();

    d.hasmousecapture = "setCapture" in _el;

    d.hasMutationObserver = ClsMutationObserver !== false;

    _el = null; //memory released

    browserdetected = d;

    return d;
  };

  var NiceScrollClass = function(myopt, me) {
    var self = this;

    this.version = "3.7.6";
    this.name = "nicescroll";

    this.me = me;

    var $body = $("body");

    var opt = (this.opt = {
      doc: $body,
      win: false
    });

    $.extend(opt, _globaloptions); // clone opts

    // Options for internal use
    opt.snapbackspeed = 80;

    if (myopt || false) {
      for (var a in opt) {
        if (myopt[a] !== undefined) opt[a] = myopt[a];
      }
    }

    if (opt.disablemutationobserver) ClsMutationObserver = false;

    this.doc = opt.doc;
    this.iddoc = this.doc && this.doc[0] ? this.doc[0].id || "" : "";
    this.ispage = /^BODY|HTML/.test(
      opt.win ? opt.win[0].nodeName : this.doc[0].nodeName
    );
    this.haswrapper = opt.win !== false;
    this.win = opt.win || (this.ispage ? $window : this.doc);
    this.docscroll = this.ispage && !this.haswrapper ? $window : this.win;
    this.body = $body;
    this.viewport = false;

    this.isfixed = false;

    this.iframe = false;
    this.isiframe =
      this.doc[0].nodeName == "IFRAME" && this.win[0].nodeName == "IFRAME";

    this.istextarea = this.win[0].nodeName == "TEXTAREA";

    this.forcescreen = false; //force to use screen position on events

    this.canshowonmouseevent = opt.autohidemode != "scroll";

    // Events jump table
    this.onmousedown = false;
    this.onmouseup = false;
    this.onmousemove = false;
    this.onmousewheel = false;
    this.onkeypress = false;
    this.ongesturezoom = false;
    this.onclick = false;

    // Nicescroll custom events
    this.onscrollstart = false;
    this.onscrollend = false;
    this.onscrollcancel = false;

    this.onzoomin = false;
    this.onzoomout = false;

    // Let's start!
    this.view = false;
    this.page = false;

    this.scroll = {
      x: 0,
      y: 0
    };
    this.scrollratio = {
      x: 0,
      y: 0
    };
    this.cursorheight = 20;
    this.scrollvaluemax = 0;

    // http://dev.w3.org/csswg/css-writing-modes-3/#logical-to-physical
    // http://dev.w3.org/csswg/css-writing-modes-3/#svg-writing-mode
    if (opt.rtlmode == "auto") {
      var target = this.win[0] == _win ? this.body : this.win;
      var writingMode =
        target.css("writing-mode") ||
        target.css("-webkit-writing-mode") ||
        target.css("-ms-writing-mode") ||
        target.css("-moz-writing-mode");

      if (
        writingMode == "horizontal-tb" ||
        writingMode == "lr-tb" ||
        writingMode === ""
      ) {
        this.isrtlmode = target.css("direction") == "rtl";
        this.isvertical = false;
      } else {
        this.isrtlmode =
          writingMode == "vertical-rl" ||
          writingMode == "tb" ||
          writingMode == "tb-rl" ||
          writingMode == "rl-tb";
        this.isvertical =
          writingMode == "vertical-rl" ||
          writingMode == "tb" ||
          writingMode == "tb-rl";
      }
    } else {
      this.isrtlmode = opt.rtlmode === true;
      this.isvertical = false;
    }
    //    this.checkrtlmode = false;

    this.scrollrunning = false;

    this.scrollmom = false;

    this.observer = false; // observer div changes
    this.observerremover = false; // observer on parent for remove detection
    this.observerbody = false; // observer on body for position change

    if (opt.scrollbarid !== false) {
      this.id = opt.scrollbarid;
    } else {
      do {
        this.id = "ascrail" + ascrailcounter++;
      } while (_doc.getElementById(this.id));
    }

    this.rail = false;
    this.cursor = false;
    this.cursorfreezed = false;
    this.selectiondrag = false;

    this.zoom = false;
    this.zoomactive = false;

    this.hasfocus = false;
    this.hasmousefocus = false;

    //this.visibility = true;
    this.railslocked = false; // locked by resize
    this.locked = false; // prevent lost of locked status sets by user
    this.hidden = false; // rails always hidden
    this.cursoractive = true; // user can interact with cursors

    this.wheelprevented = false; //prevent mousewheel event

    this.overflowx = opt.overflowx;
    this.overflowy = opt.overflowy;

    this.nativescrollingarea = false;
    this.checkarea = 0;

    this.events = []; // event list for unbind

    this.saved = {}; // style saved

    this.delaylist = {};
    this.synclist = {};

    this.lastdeltax = 0;
    this.lastdeltay = 0;

    this.detected = getBrowserDetection();

    var cap = $.extend({}, this.detected);

    this.canhwscroll = cap.hastransform && opt.hwacceleration;
    this.ishwscroll = this.canhwscroll && self.haswrapper;

    if (!this.isrtlmode) {
      this.hasreversehr = false;
    } else if (this.isvertical) {
      // RTL mode with reverse horizontal axis
      this.hasreversehr = !(cap.iswebkit || cap.isie || cap.isie11);
    } else {
      this.hasreversehr = !(
        cap.iswebkit ||
        (cap.isie && !cap.isie10 && !cap.isie11)
      );
    }

    this.istouchcapable = false; // desktop devices with touch screen support

    //## Check WebKit-based desktop with touch support
    //## + Firefox 18 nightly build (desktop) false positive (or desktop with touch support)

    if (!cap.cantouch && (cap.hasw3ctouch || cap.hasmstouch)) {
      // desktop device with multiple input
      this.istouchcapable = true;
    } else if (
      cap.cantouch &&
      !cap.isios &&
      !cap.isandroid &&
      (cap.iswebkit || cap.ismozilla)
    ) {
      this.istouchcapable = true;
    }

    //## disable MouseLock API on user request
    if (!opt.enablemouselockapi) {
      cap.hasmousecapture = false;
      cap.haspointerlock = false;
    }

    this.debounced = function(name, fn, tm) {
      if (!self) return;
      var dd = self.delaylist[name] || false;
      if (!dd) {
        self.delaylist[name] = {
          h: setAnimationFrame(function() {
            self.delaylist[name].fn.call(self);
            self.delaylist[name] = false;
          }, tm)
        };
        fn.call(self);
      }
      self.delaylist[name].fn = fn;
    };

    this.synched = function(name, fn) {
      if (self.synclist[name]) self.synclist[name] = fn;
      else {
        self.synclist[name] = fn;
        setAnimationFrame(function() {
          if (!self) return;
          self.synclist[name] && self.synclist[name].call(self);
          self.synclist[name] = null;
        });
      }
    };

    this.unsynched = function(name) {
      if (self.synclist[name]) self.synclist[name] = false;
    };

    this.css = function(el, pars) {
      // save & set
      for (var n in pars) {
        self.saved.css.push([el, n, el.css(n)]);
        el.css(n, pars[n]);
      }
    };

    this.scrollTop = function(val) {
      return val === undefined ? self.getScrollTop() : self.setScrollTop(val);
    };

    this.scrollLeft = function(val) {
      return val === undefined ? self.getScrollLeft() : self.setScrollLeft(val);
    };

    // derived by by Dan Pupius www.pupius.net
    var BezierClass = function(st, ed, spd, p1, p2, p3, p4) {
      this.st = st;
      this.ed = ed;
      this.spd = spd;

      this.p1 = p1 || 0;
      this.p2 = p2 || 1;
      this.p3 = p3 || 0;
      this.p4 = p4 || 1;

      this.ts = now();
      this.df = ed - st;
    };
    BezierClass.prototype = {
      B2: function(t) {
        return 3 * (1 - t) * (1 - t) * t;
      },
      B3: function(t) {
        return 3 * (1 - t) * t * t;
      },
      B4: function(t) {
        return t * t * t;
      },
      getPos: function() {
        return (now() - this.ts) / this.spd;
      },
      getNow: function() {
        var pc = (now() - this.ts) / this.spd;
        var bz = this.B2(pc) + this.B3(pc) + this.B4(pc);
        return pc >= 1 ? this.ed : (this.st + this.df * bz) | 0;
      },
      update: function(ed, spd) {
        this.st = this.getNow();
        this.ed = ed;
        this.spd = spd;
        this.ts = now();
        this.df = this.ed - this.st;
        return this;
      }
    };

    //derived from http://stackoverflow.com/questions/11236090/
    function getMatrixValues() {
      var tr = self.doc.css(cap.trstyle);
      if (tr && tr.substr(0, 6) == "matrix") {
        return tr
          .replace(/^.*\((.*)\)$/g, "$1")
          .replace(/px/g, "")
          .split(/, +/);
      }
      return false;
    }

    if (this.ishwscroll) {
      // hw accelerated scroll

      this.doc.translate = {
        x: 0,
        y: 0,
        tx: "0px",
        ty: "0px"
      };

      //this one can help to enable hw accel on ios6 http://indiegamr.com/ios6-html-hardware-acceleration-changes-and-how-to-fix-them/
      if (cap.hastranslate3d && cap.isios)
        this.doc.css("-webkit-backface-visibility", "hidden"); // prevent flickering http://stackoverflow.com/questions/3461441/

      this.getScrollTop = function(last) {
        if (!last) {
          var mtx = getMatrixValues();
          if (mtx) return mtx.length == 16 ? -mtx[13] : -mtx[5]; //matrix3d 16 on IE10
          if (self.timerscroll && self.timerscroll.bz)
            return self.timerscroll.bz.getNow();
        }
        return self.doc.translate.y;
      };

      this.getScrollLeft = function(last) {
        if (!last) {
          var mtx = getMatrixValues();
          if (mtx) return mtx.length == 16 ? -mtx[12] : -mtx[4]; //matrix3d 16 on IE10
          if (self.timerscroll && self.timerscroll.bh)
            return self.timerscroll.bh.getNow();
        }
        return self.doc.translate.x;
      };

      this.notifyScrollEvent = function(el) {
        var e = _doc.createEvent("UIEvents");
        e.initUIEvent("scroll", false, false, _win, 1);
        e.niceevent = true;
        el.dispatchEvent(e);
      };

      var cxscrollleft = this.isrtlmode ? 1 : -1;

      if (cap.hastranslate3d && opt.enabletranslate3d) {
        this.setScrollTop = function(val, silent) {
          self.doc.translate.y = val;
          self.doc.translate.ty = val * -1 + "px";
          self.doc.css(
            cap.trstyle,
            "translate3d(" +
              self.doc.translate.tx +
              "," +
              self.doc.translate.ty +
              ",0)"
          );
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
        this.setScrollLeft = function(val, silent) {
          self.doc.translate.x = val;
          self.doc.translate.tx = val * cxscrollleft + "px";
          self.doc.css(
            cap.trstyle,
            "translate3d(" +
              self.doc.translate.tx +
              "," +
              self.doc.translate.ty +
              ",0)"
          );
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
      } else {
        this.setScrollTop = function(val, silent) {
          self.doc.translate.y = val;
          self.doc.translate.ty = val * -1 + "px";
          self.doc.css(
            cap.trstyle,
            "translate(" +
              self.doc.translate.tx +
              "," +
              self.doc.translate.ty +
              ")"
          );
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
        this.setScrollLeft = function(val, silent) {
          self.doc.translate.x = val;
          self.doc.translate.tx = val * cxscrollleft + "px";
          self.doc.css(
            cap.trstyle,
            "translate(" +
              self.doc.translate.tx +
              "," +
              self.doc.translate.ty +
              ")"
          );
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
      }
    } else {
      // native scroll

      this.getScrollTop = function() {
        return self.docscroll.scrollTop();
      };
      this.setScrollTop = function(val) {
        self.docscroll.scrollTop(val);
      };

      this.getScrollLeft = function() {
        var val;
        if (!self.hasreversehr) {
          val = self.docscroll.scrollLeft();
        } else if (self.detected.ismozilla) {
          val = self.page.maxw - Math.abs(self.docscroll.scrollLeft());
        } else {
          val = self.page.maxw - self.docscroll.scrollLeft();
        }
        return val;
      };
      this.setScrollLeft = function(val) {
        return setTimeout(function() {
          if (!self) return;
          if (self.hasreversehr) {
            if (self.detected.ismozilla) {
              val = -(self.page.maxw - val);
            } else {
              val = self.page.maxw - val;
            }
          }
          return self.docscroll.scrollLeft(val);
        }, 1);
      };
    }

    this.getTarget = function(e) {
      if (!e) return false;
      if (e.target) return e.target;
      if (e.srcElement) return e.srcElement;
      return false;
    };

    this.hasParent = function(e, id) {
      if (!e) return false;
      var el = e.target || e.srcElement || e || false;
      while (el && el.id != id) {
        el = el.parentNode || false;
      }
      return el !== false;
    };

    function getZIndex() {
      var dom = self.win;
      if ("zIndex" in dom) return dom.zIndex(); // use jQuery UI method when available
      while (dom.length > 0) {
        if (dom[0].nodeType == 9) return false;
        var zi = dom.css("zIndex");
        if (!isNaN(zi) && zi !== 0) return parseInt(zi);
        dom = dom.parent();
      }
      return false;
    }

    //inspired by http://forum.jquery.com/topic/width-includes-border-width-when-set-to-thin-medium-thick-in-ie
    var _convertBorderWidth = {
      thin: 1,
      medium: 3,
      thick: 5
    };

    function getWidthToPixel(dom, prop, chkheight) {
      var wd = dom.css(prop);
      var px = parseFloat(wd);
      if (isNaN(px)) {
        px = _convertBorderWidth[wd] || 0;
        var brd =
          px == 3
            ? chkheight
              ? self.win.outerHeight() - self.win.innerHeight()
              : self.win.outerWidth() - self.win.innerWidth()
            : 1; //DON'T TRUST CSS
        if (self.isie8 && px) px += 1;
        return brd ? px : 0;
      }
      return px;
    }

    this.getDocumentScrollOffset = function() {
      return {
        top: _win.pageYOffset || _doc.documentElement.scrollTop,
        left: _win.pageXOffset || _doc.documentElement.scrollLeft
      };
    };

    this.getOffset = function() {
      if (self.isfixed) {
        var ofs = self.win.offset(); // fix Chrome auto issue (when right/bottom props only)
        var scrl = self.getDocumentScrollOffset();
        ofs.top -= scrl.top;
        ofs.left -= scrl.left;
        return ofs;
      }
      var ww = self.win.offset();
      if (!self.viewport) return ww;
      var vp = self.viewport.offset();
      return {
        top: ww.top - vp.top,
        left: ww.left - vp.left
      };
    };

    this.updateScrollBar = function(len) {
      var pos, off;
      if (self.ishwscroll) {
        self.rail.css({
          height:
            self.win.innerHeight() -
            (opt.railpadding.top + opt.railpadding.bottom)
        });
        if (self.railh)
          self.railh.css({
            width:
              self.win.innerWidth() -
              (opt.railpadding.left + opt.railpadding.right)
          });
      } else {
        var wpos = self.getOffset();
        pos = {
          top: wpos.top,
          left: wpos.left - (opt.railpadding.left + opt.railpadding.right)
        };
        pos.top += getWidthToPixel(self.win, "border-top-width", true);
        pos.left += self.rail.align
          ? self.win.outerWidth() -
            getWidthToPixel(self.win, "border-right-width") -
            self.rail.width
          : getWidthToPixel(self.win, "border-left-width");

        off = opt.railoffset;
        if (off) {
          if (off.top) pos.top += off.top;
          if (off.left) pos.left += off.left;
        }

        if (!self.railslocked)
          self.rail.css({
            top: pos.top,
            left: pos.left,
            height:
              (len ? len.h : self.win.innerHeight()) -
              (opt.railpadding.top + opt.railpadding.bottom)
          });

        if (self.zoom) {
          self.zoom.css({
            top: pos.top + 1,
            left:
              self.rail.align == 1
                ? pos.left - 20
                : pos.left + self.rail.width + 4
          });
        }

        if (self.railh && !self.railslocked) {
          pos = {
            top: wpos.top,
            left: wpos.left
          };
          off = opt.railhoffset;
          if (off) {
            if (off.top) pos.top += off.top;
            if (off.left) pos.left += off.left;
          }
          var y = self.railh.align
            ? pos.top +
              getWidthToPixel(self.win, "border-top-width", true) +
              self.win.innerHeight() -
              self.railh.height
            : pos.top + getWidthToPixel(self.win, "border-top-width", true);
          var x = pos.left + getWidthToPixel(self.win, "border-left-width");
          self.railh.css({
            top: y - (opt.railpadding.top + opt.railpadding.bottom),
            left: x,
            width: self.railh.width
          });
        }
      }
    };

    this.doRailClick = function(e, dbl, hr) {
      var fn, pg, cur, pos;

      if (self.railslocked) return;

      self.cancelEvent(e);

      if (!("pageY" in e)) {
        e.pageX = e.clientX + _doc.documentElement.scrollLeft;
        e.pageY = e.clientY + _doc.documentElement.scrollTop;
      }

      if (dbl) {
        fn = hr ? self.doScrollLeft : self.doScrollTop;
        cur = hr
          ? (e.pageX - self.railh.offset().left - self.cursorwidth / 2) *
            self.scrollratio.x
          : (e.pageY - self.rail.offset().top - self.cursorheight / 2) *
            self.scrollratio.y;
        self.unsynched("relativexy");
        fn(cur | 0);
      } else {
        fn = hr ? self.doScrollLeftBy : self.doScrollBy;
        cur = hr ? self.scroll.x : self.scroll.y;
        pos = hr
          ? e.pageX - self.railh.offset().left
          : e.pageY - self.rail.offset().top;
        pg = hr ? self.view.w : self.view.h;
        fn(cur >= pos ? pg : -pg);
      }
    };

    self.newscrolly = self.newscrollx = 0;

    self.hasanimationframe = "requestAnimationFrame" in _win;
    self.hascancelanimationframe = "cancelAnimationFrame" in _win;

    self.hasborderbox = false;

    this.init = function() {
      self.saved.css = [];

      if (cap.isoperamini) return true; // SORRY, DO NOT WORK!
      if (cap.isandroid && !("hidden" in _doc)) return true; // Android 3- SORRY, DO NOT WORK!

      opt.emulatetouch = opt.emulatetouch || opt.touchbehavior; // mantain compatibility with "touchbehavior"

      self.hasborderbox =
        _win.getComputedStyle &&
        _win.getComputedStyle(_doc.body)["box-sizing"] === "border-box";

      var _scrollyhidden = { "overflow-y": "hidden" };
      if (cap.isie11 || cap.isie10)
        _scrollyhidden["-ms-overflow-style"] = "none"; // IE 10 & 11 is always a world apart!

      if (self.ishwscroll) {
        this.doc.css(
          cap.transitionstyle,
          cap.prefixstyle + "transform 0ms ease-out"
        );
        if (cap.transitionend)
          self.bind(
            self.doc,
            cap.transitionend,
            self.onScrollTransitionEnd,
            false
          ); //I have got to do something usefull!!
      }

      self.zindex = "auto";
      if (!self.ispage && opt.zindex == "auto") {
        self.zindex = getZIndex() || "auto";
      } else {
        self.zindex = opt.zindex;
      }

      if (
        !self.ispage &&
        self.zindex != "auto" &&
        self.zindex > globalmaxzindex
      ) {
        globalmaxzindex = self.zindex;
      }

      if (self.isie && self.zindex === 0 && opt.zindex == "auto") {
        // fix IE auto == 0
        self.zindex = "auto";
      }

      if (!self.ispage || !cap.isieold) {
        var cont = self.docscroll;
        if (self.ispage) cont = self.haswrapper ? self.win : self.doc;

        self.css(cont, _scrollyhidden);

        if (self.ispage && (cap.isie11 || cap.isie)) {
          // IE 7-11
          self.css($("html"), _scrollyhidden);
        }

        if (cap.isios && !self.ispage && !self.haswrapper)
          self.css($body, {
            "-webkit-overflow-scrolling": "touch"
          }); //force hw acceleration

        var cursor = $(_doc.createElement("div"));
        cursor.css({
          position: "relative",
          top: 0,
          float: "right",
          width: opt.cursorwidth,
          height: 0,
          "background-color": opt.cursorcolor,
          border: opt.cursorborder,
          "background-clip": "padding-box",
          "-webkit-border-radius": opt.cursorborderradius,
          "-moz-border-radius": opt.cursorborderradius,
          "border-radius": opt.cursorborderradius
        });

        cursor.addClass("nicescroll-cursors");

        self.cursor = cursor;

        var rail = $(_doc.createElement("div"));
        rail.attr("id", self.id);
        rail.addClass("nicescroll-rails nicescroll-rails-vr");

        var v,
          a,
          kp = ["left", "right", "top", "bottom"]; //**
        for (var n in kp) {
          a = kp[n];
          v = opt.railpadding[a] || 0;
          v && rail.css("padding-" + a, v + "px");
        }

        rail.append(cursor);

        rail.width = Math.max(parseFloat(opt.cursorwidth), cursor.outerWidth());
        rail.css({
          width: rail.width + "px",
          zIndex: self.zindex,
          background: opt.background,
          cursor: "default"
        });

        rail.visibility = true;
        rail.scrollable = true;

        rail.align = opt.railalign == "left" ? 0 : 1;

        self.rail = rail;

        self.rail.drag = false;

        var zoom = false;
        if (opt.boxzoom && !self.ispage && !cap.isieold) {
          zoom = _doc.createElement("div");

          self.bind(zoom, "click", self.doZoom);
          self.bind(zoom, "mouseenter", function() {
            self.zoom.css("opacity", opt.cursoropacitymax);
          });
          self.bind(zoom, "mouseleave", function() {
            self.zoom.css("opacity", opt.cursoropacitymin);
          });

          self.zoom = $(zoom);
          self.zoom.css({
            cursor: "pointer",
            zIndex: self.zindex,
            backgroundImage: "url(" + opt.scriptpath + "zoomico.png)",
            height: 18,
            width: 18,
            backgroundPosition: "0 0"
          });
          if (opt.dblclickzoom) self.bind(self.win, "dblclick", self.doZoom);
          if (cap.cantouch && opt.gesturezoom) {
            self.ongesturezoom = function(e) {
              if (e.scale > 1.5) self.doZoomIn(e);
              if (e.scale < 0.8) self.doZoomOut(e);
              return self.cancelEvent(e);
            };
            self.bind(self.win, "gestureend", self.ongesturezoom);
          }
        }

        // init HORIZ

        self.railh = false;
        var railh;

        if (opt.horizrailenabled) {
          self.css(cont, {
            overflowX: "hidden"
          });

          cursor = $(_doc.createElement("div"));
          cursor.css({
            position: "absolute",
            top: 0,
            height: opt.cursorwidth,
            width: 0,
            backgroundColor: opt.cursorcolor,
            border: opt.cursorborder,
            backgroundClip: "padding-box",
            "-webkit-border-radius": opt.cursorborderradius,
            "-moz-border-radius": opt.cursorborderradius,
            "border-radius": opt.cursorborderradius
          });

          if (cap.isieold) cursor.css("overflow", "hidden"); //IE6 horiz scrollbar issue

          cursor.addClass("nicescroll-cursors");

          self.cursorh = cursor;

          railh = $(_doc.createElement("div"));
          railh.attr("id", self.id + "-hr");
          railh.addClass("nicescroll-rails nicescroll-rails-hr");
          railh.height = Math.max(
            parseFloat(opt.cursorwidth),
            cursor.outerHeight()
          );
          railh.css({
            height: railh.height + "px",
            zIndex: self.zindex,
            background: opt.background
          });

          railh.append(cursor);

          railh.visibility = true;
          railh.scrollable = true;

          railh.align = opt.railvalign == "top" ? 0 : 1;

          self.railh = railh;

          self.railh.drag = false;
        }

        if (self.ispage) {
          rail.css({
            position: "fixed",
            top: 0,
            height: "100%"
          });

          rail.css(rail.align ? { right: 0 } : { left: 0 });

          self.body.append(rail);
          if (self.railh) {
            railh.css({
              position: "fixed",
              left: 0,
              width: "100%"
            });

            railh.css(railh.align ? { bottom: 0 } : { top: 0 });

            self.body.append(railh);
          }
        } else {
          if (self.ishwscroll) {
            if (self.win.css("position") == "static")
              self.css(self.win, { position: "relative" });
            var bd = self.win[0].nodeName == "HTML" ? self.body : self.win;
            $(bd)
              .scrollTop(0)
              .scrollLeft(0); // fix rail position if content already scrolled
            if (self.zoom) {
              self.zoom.css({
                position: "absolute",
                top: 1,
                right: 0,
                "margin-right": rail.width + 4
              });
              bd.append(self.zoom);
            }
            rail.css({
              position: "absolute",
              top: 0
            });
            rail.css(rail.align ? { right: 0 } : { left: 0 });
            bd.append(rail);
            if (railh) {
              railh.css({
                position: "absolute",
                left: 0,
                bottom: 0
              });
              railh.css(railh.align ? { bottom: 0 } : { top: 0 });
              bd.append(railh);
            }
          } else {
            self.isfixed = self.win.css("position") == "fixed";
            var rlpos = self.isfixed ? "fixed" : "absolute";

            if (!self.isfixed) self.viewport = self.getViewport(self.win[0]);
            if (self.viewport) {
              self.body = self.viewport;
              if (!/fixed|absolute/.test(self.viewport.css("position")))
                self.css(self.viewport, {
                  position: "relative"
                });
            }

            rail.css({
              position: rlpos
            });
            if (self.zoom)
              self.zoom.css({
                position: rlpos
              });
            self.updateScrollBar();
            self.body.append(rail);
            if (self.zoom) self.body.append(self.zoom);
            if (self.railh) {
              railh.css({
                position: rlpos
              });
              self.body.append(railh);
            }
          }

          if (cap.isios)
            self.css(self.win, {
              "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
              "-webkit-touch-callout": "none"
            }); // prevent grey layer on click

          if (opt.disableoutline) {
            if (cap.isie) self.win.attr("hideFocus", "true"); // IE, prevent dotted rectangle on focused div
            if (cap.iswebkit) self.win.css("outline", "none"); // Webkit outline
          }
        }

        if (opt.autohidemode === false) {
          self.autohidedom = false;
          self.rail.css({
            opacity: opt.cursoropacitymax
          });
          if (self.railh)
            self.railh.css({
              opacity: opt.cursoropacitymax
            });
        } else if (opt.autohidemode === true || opt.autohidemode === "leave") {
          self.autohidedom = $().add(self.rail);
          if (cap.isie8) self.autohidedom = self.autohidedom.add(self.cursor);
          if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
          if (self.railh && cap.isie8)
            self.autohidedom = self.autohidedom.add(self.cursorh);
        } else if (opt.autohidemode == "scroll") {
          self.autohidedom = $().add(self.rail);
          if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
        } else if (opt.autohidemode == "cursor") {
          self.autohidedom = $().add(self.cursor);
          if (self.railh) self.autohidedom = self.autohidedom.add(self.cursorh);
        } else if (opt.autohidemode == "hidden") {
          self.autohidedom = false;
          self.hide();
          self.railslocked = false;
        }

        if (
          cap.cantouch ||
          self.istouchcapable ||
          opt.emulatetouch ||
          cap.hasmstouch
        ) {
          self.scrollmom = new ScrollMomentumClass2D(self);

          var delayedclick = null;

          self.ontouchstart = function(e) {
            if (self.locked) return false;

            //if (e.pointerType && e.pointerType != 2 && e.pointerType != "touch") return false;
            if (
              e.pointerType &&
              (e.pointerType === "mouse" ||
                e.pointerType === e.MSPOINTER_TYPE_MOUSE)
            )
              return false; // need test on surface!!

            self.hasmoving = false;

            if (self.scrollmom.timer) {
              self.triggerScrollEnd();
              self.scrollmom.stop();
            }

            if (!self.railslocked) {
              var tg = self.getTarget(e);

              if (tg) {
                var skp = /INPUT/i.test(tg.nodeName) && /range/i.test(tg.type);
                if (skp) return self.stopPropagation(e);
              }

              var ismouse = e.type === "mousedown";

              if (!("clientX" in e) && "changedTouches" in e) {
                e.clientX = e.changedTouches[0].clientX;
                e.clientY = e.changedTouches[0].clientY;
              }

              if (self.forcescreen) {
                var le = e;
                e = {
                  original: e.original ? e.original : e
                };
                e.clientX = le.screenX;
                e.clientY = le.screenY;
              }

              self.rail.drag = {
                x: e.clientX,
                y: e.clientY,
                sx: self.scroll.x,
                sy: self.scroll.y,
                st: self.getScrollTop(),
                sl: self.getScrollLeft(),
                pt: 2,
                dl: false,
                tg: tg
              };

              if (self.ispage || !opt.directionlockdeadzone) {
                self.rail.drag.dl = "f";
              } else {
                var view = {
                  w: $window.width(),
                  h: $window.height()
                };

                var page = self.getContentSize();

                var maxh = page.h - view.h;
                var maxw = page.w - view.w;

                if (self.rail.scrollable && !self.railh.scrollable)
                  self.rail.drag.ck = maxh > 0 ? "v" : false;
                else if (!self.rail.scrollable && self.railh.scrollable)
                  self.rail.drag.ck = maxw > 0 ? "h" : false;
                else self.rail.drag.ck = false;
              }

              if (opt.emulatetouch && self.isiframe && cap.isie) {
                var wp = self.win.position();
                self.rail.drag.x += wp.left;
                self.rail.drag.y += wp.top;
              }

              self.hasmoving = false;
              self.lastmouseup = false;
              self.scrollmom.reset(e.clientX, e.clientY);

              if (tg && ismouse) {
                var ip = /INPUT|SELECT|BUTTON|TEXTAREA/i.test(tg.nodeName);
                if (!ip) {
                  if (cap.hasmousecapture) tg.setCapture();
                  if (opt.emulatetouch) {
                    if (tg.onclick && !(tg._onclick || false)) {
                      // intercept DOM0 onclick event
                      tg._onclick = tg.onclick;
                      tg.onclick = function(e) {
                        if (self.hasmoving) return false;
                        tg._onclick.call(this, e);
                      };
                    }
                    return self.cancelEvent(e);
                  }
                  return self.stopPropagation(e);
                }

                if (/SUBMIT|CANCEL|BUTTON/i.test($(tg).attr("type"))) {
                  self.preventclick = {
                    tg: tg,
                    click: false
                  };
                }
              }
            }
          };

          self.ontouchend = function(e) {
            if (!self.rail.drag) return true;

            if (self.rail.drag.pt == 2) {
              //if (e.pointerType && e.pointerType != 2 && e.pointerType != "touch") return false;
              if (
                e.pointerType &&
                (e.pointerType === "mouse" ||
                  e.pointerType === e.MSPOINTER_TYPE_MOUSE)
              )
                return false;

              self.rail.drag = false;

              var ismouse = e.type === "mouseup";

              if (self.hasmoving) {
                self.scrollmom.doMomentum();
                self.lastmouseup = true;
                self.hideCursor();
                if (cap.hasmousecapture) _doc.releaseCapture();
                if (ismouse) return self.cancelEvent(e);
              }
            } else if (self.rail.drag.pt == 1) {
              return self.onmouseup(e);
            }
          };

          var moveneedoffset =
            opt.emulatetouch && self.isiframe && !cap.hasmousecapture;

          var locktollerance = (opt.directionlockdeadzone * 0.3) | 0;

          self.ontouchmove = function(e, byiframe) {
            if (!self.rail.drag) return true;

            if (e.targetTouches && opt.preventmultitouchscrolling) {
              if (e.targetTouches.length > 1) return true; // multitouch
            }

            //if (e.pointerType && e.pointerType != 2 && e.pointerType != "touch") return false;
            if (
              e.pointerType &&
              (e.pointerType === "mouse" ||
                e.pointerType === e.MSPOINTER_TYPE_MOUSE)
            )
              return true;

            if (self.rail.drag.pt == 2) {
              if ("changedTouches" in e) {
                e.clientX = e.changedTouches[0].clientX;
                e.clientY = e.changedTouches[0].clientY;
              }

              var ofy, ofx;
              ofx = ofy = 0;

              if (moveneedoffset && !byiframe) {
                var wp = self.win.position();
                ofx = -wp.left;
                ofy = -wp.top;
              }

              var fy = e.clientY + ofy;
              var my = fy - self.rail.drag.y;
              var fx = e.clientX + ofx;
              var mx = fx - self.rail.drag.x;

              var ny = self.rail.drag.st - my;

              if (self.ishwscroll && opt.bouncescroll) {
                if (ny < 0) {
                  ny = Math.round(ny / 2);
                } else if (ny > self.page.maxh) {
                  ny = self.page.maxh + Math.round((ny - self.page.maxh) / 2);
                }
              } else {
                if (ny < 0) {
                  ny = 0;
                  fy = 0;
                } else if (ny > self.page.maxh) {
                  ny = self.page.maxh;
                  fy = 0;
                }
                if (fy === 0 && !self.hasmoving) {
                  if (!self.ispage) self.rail.drag = false;
                  return true;
                }
              }

              var nx = self.getScrollLeft();

              if (self.railh && self.railh.scrollable) {
                nx = self.isrtlmode
                  ? mx - self.rail.drag.sl
                  : self.rail.drag.sl - mx;

                if (self.ishwscroll && opt.bouncescroll) {
                  if (nx < 0) {
                    nx = Math.round(nx / 2);
                  } else if (nx > self.page.maxw) {
                    nx = self.page.maxw + Math.round((nx - self.page.maxw) / 2);
                  }
                } else {
                  if (nx < 0) {
                    nx = 0;
                    fx = 0;
                  }
                  if (nx > self.page.maxw) {
                    nx = self.page.maxw;
                    fx = 0;
                  }
                }
              }

              if (!self.hasmoving) {
                if (
                  self.rail.drag.y === e.clientY &&
                  self.rail.drag.x === e.clientX
                )
                  return self.cancelEvent(e); // prevent first useless move event

                var ay = Math.abs(my);
                var ax = Math.abs(mx);
                var dz = opt.directionlockdeadzone;

                if (!self.rail.drag.ck) {
                  if (ay > dz && ax > dz) self.rail.drag.dl = "f";
                  else if (ay > dz)
                    self.rail.drag.dl = ax > locktollerance ? "f" : "v";
                  else if (ax > dz)
                    self.rail.drag.dl = ay > locktollerance ? "f" : "h";
                } else if (self.rail.drag.ck == "v") {
                  if (ax > dz && ay <= locktollerance) {
                    self.rail.drag = false;
                  } else if (ay > dz) self.rail.drag.dl = "v";
                } else if (self.rail.drag.ck == "h") {
                  if (ay > dz && ax <= locktollerance) {
                    self.rail.drag = false;
                  } else if (ax > dz) self.rail.drag.dl = "h";
                }

                if (!self.rail.drag.dl) return self.cancelEvent(e);

                self.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0);
                self.hasmoving = true;
              }

              if (self.preventclick && !self.preventclick.click) {
                self.preventclick.click = self.preventclick.tg.onclick || false;
                self.preventclick.tg.onclick = self.onpreventclick;
              }

              if (self.rail.drag.dl) {
                if (self.rail.drag.dl == "v") nx = self.rail.drag.sl;
                else if (self.rail.drag.dl == "h") ny = self.rail.drag.st;
              }

              self.synched("touchmove", function() {
                if (self.rail.drag && self.rail.drag.pt == 2) {
                  if (self.prepareTransition) self.resetTransition();
                  if (self.rail.scrollable) self.setScrollTop(ny);
                  self.scrollmom.update(fx, fy);
                  if (self.railh && self.railh.scrollable) {
                    self.setScrollLeft(nx);
                    self.showCursor(ny, nx);
                  } else {
                    self.showCursor(ny);
                  }
                  if (cap.isie10) _doc.selection.clear();
                }
              });

              return self.cancelEvent(e);
            } else if (self.rail.drag.pt == 1) {
              // drag on cursor
              return self.onmousemove(e);
            }
          };

          self.ontouchstartCursor = function(e, hronly) {
            if (self.rail.drag && self.rail.drag.pt != 3) return;
            if (self.locked) return self.cancelEvent(e);
            self.cancelScroll();
            self.rail.drag = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              sx: self.scroll.x,
              sy: self.scroll.y,
              pt: 3,
              hr: !!hronly
            };
            var tg = self.getTarget(e);
            if (!self.ispage && cap.hasmousecapture) tg.setCapture();
            if (self.isiframe && !cap.hasmousecapture) {
              self.saved.csspointerevents = self.doc.css("pointer-events");
              self.css(self.doc, { "pointer-events": "none" });
            }
            return self.cancelEvent(e);
          };

          self.ontouchendCursor = function(e) {
            if (self.rail.drag) {
              if (cap.hasmousecapture) _doc.releaseCapture();
              if (self.isiframe && !cap.hasmousecapture)
                self.doc.css("pointer-events", self.saved.csspointerevents);
              if (self.rail.drag.pt != 3) return;
              self.rail.drag = false;
              return self.cancelEvent(e);
            }
          };

          self.ontouchmoveCursor = function(e) {
            if (self.rail.drag) {
              if (self.rail.drag.pt != 3) return;

              self.cursorfreezed = true;

              if (self.rail.drag.hr) {
                self.scroll.x =
                  self.rail.drag.sx + (e.touches[0].clientX - self.rail.drag.x);
                if (self.scroll.x < 0) self.scroll.x = 0;
                var mw = self.scrollvaluemaxw;
                if (self.scroll.x > mw) self.scroll.x = mw;
              } else {
                self.scroll.y =
                  self.rail.drag.sy + (e.touches[0].clientY - self.rail.drag.y);
                if (self.scroll.y < 0) self.scroll.y = 0;
                var my = self.scrollvaluemax;
                if (self.scroll.y > my) self.scroll.y = my;
              }

              self.synched("touchmove", function() {
                if (self.rail.drag && self.rail.drag.pt == 3) {
                  self.showCursor();
                  if (self.rail.drag.hr)
                    self.doScrollLeft(
                      Math.round(self.scroll.x * self.scrollratio.x),
                      opt.cursordragspeed
                    );
                  else
                    self.doScrollTop(
                      Math.round(self.scroll.y * self.scrollratio.y),
                      opt.cursordragspeed
                    );
                }
              });

              return self.cancelEvent(e);
            }
          };
        }

        self.onmousedown = function(e, hronly) {
          if (self.rail.drag && self.rail.drag.pt != 1) return;
          if (self.railslocked) return self.cancelEvent(e);
          self.cancelScroll();
          self.rail.drag = {
            x: e.clientX,
            y: e.clientY,
            sx: self.scroll.x,
            sy: self.scroll.y,
            pt: 1,
            hr: hronly || false
          };
          var tg = self.getTarget(e);

          if (cap.hasmousecapture) tg.setCapture();
          if (self.isiframe && !cap.hasmousecapture) {
            self.saved.csspointerevents = self.doc.css("pointer-events");
            self.css(self.doc, {
              "pointer-events": "none"
            });
          }
          self.hasmoving = false;
          return self.cancelEvent(e);
        };

        self.onmouseup = function(e) {
          if (self.rail.drag) {
            if (self.rail.drag.pt != 1) return true;

            if (cap.hasmousecapture) _doc.releaseCapture();
            if (self.isiframe && !cap.hasmousecapture)
              self.doc.css("pointer-events", self.saved.csspointerevents);
            self.rail.drag = false;
            self.cursorfreezed = false;
            if (self.hasmoving) self.triggerScrollEnd();
            return self.cancelEvent(e);
          }
        };

        self.onmousemove = function(e) {
          if (self.rail.drag) {
            if (self.rail.drag.pt !== 1) return;

            if (cap.ischrome && e.which === 0) return self.onmouseup(e);

            self.cursorfreezed = true;

            if (!self.hasmoving)
              self.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0);

            self.hasmoving = true;

            if (self.rail.drag.hr) {
              self.scroll.x =
                self.rail.drag.sx + (e.clientX - self.rail.drag.x);
              if (self.scroll.x < 0) self.scroll.x = 0;
              var mw = self.scrollvaluemaxw;
              if (self.scroll.x > mw) self.scroll.x = mw;
            } else {
              self.scroll.y =
                self.rail.drag.sy + (e.clientY - self.rail.drag.y);
              if (self.scroll.y < 0) self.scroll.y = 0;
              var my = self.scrollvaluemax;
              if (self.scroll.y > my) self.scroll.y = my;
            }

            self.synched("mousemove", function() {
              if (self.cursorfreezed) {
                self.showCursor();

                if (self.rail.drag.hr) {
                  self.scrollLeft(
                    Math.round(self.scroll.x * self.scrollratio.x)
                  );
                } else {
                  self.scrollTop(
                    Math.round(self.scroll.y * self.scrollratio.y)
                  );
                }
              }
            });

            return self.cancelEvent(e);
          } else {
            self.checkarea = 0;
          }
        };

        if (cap.cantouch || opt.emulatetouch) {
          self.onpreventclick = function(e) {
            if (self.preventclick) {
              self.preventclick.tg.onclick = self.preventclick.click;
              self.preventclick = false;
              return self.cancelEvent(e);
            }
          };

          self.onclick = cap.isios
            ? false
            : function(e) {
                // it needs to check IE11 ???
                if (self.lastmouseup) {
                  self.lastmouseup = false;
                  return self.cancelEvent(e);
                } else {
                  return true;
                }
              };

          if (opt.grabcursorenabled && cap.cursorgrabvalue) {
            self.css(self.ispage ? self.doc : self.win, {
              cursor: cap.cursorgrabvalue
            });
            self.css(self.rail, {
              cursor: cap.cursorgrabvalue
            });
          }
        } else {
          var checkSelectionScroll = function(e) {
            if (!self.selectiondrag) return;

            if (e) {
              var ww = self.win.outerHeight();
              var df = e.pageY - self.selectiondrag.top;
              if (df > 0 && df < ww) df = 0;
              if (df >= ww) df -= ww;
              self.selectiondrag.df = df;
            }
            if (self.selectiondrag.df === 0) return;

            var rt = -((self.selectiondrag.df * 2) / 6) | 0;
            self.doScrollBy(rt);

            self.debounced(
              "doselectionscroll",
              function() {
                checkSelectionScroll();
              },
              50
            );
          };

          if ("getSelection" in _doc) {
            // A grade - Major browsers
            self.hasTextSelected = function() {
              return _doc.getSelection().rangeCount > 0;
            };
          } else if ("selection" in _doc) {
            //IE9-
            self.hasTextSelected = function() {
              return _doc.selection.type != "None";
            };
          } else {
            self.hasTextSelected = function() {
              // no support
              return false;
            };
          }

          self.onselectionstart = function(e) {
            //  More testing - severe chrome issues
            /*
                          if (!self.haswrapper&&(e.which&&e.which==2)) {  // fool browser to manage middle button scrolling
                            self.win.css({'overflow':'auto'});
                            setTimeout(function(){
                              self.win.css({'overflow':'hidden'});
                            },10);
                            return true;
                          }
            */
            if (self.ispage) return;
            self.selectiondrag = self.win.offset();
          };

          self.onselectionend = function(e) {
            self.selectiondrag = false;
          };
          self.onselectiondrag = function(e) {
            if (!self.selectiondrag) return;
            if (self.hasTextSelected())
              self.debounced(
                "selectionscroll",
                function() {
                  checkSelectionScroll(e);
                },
                250
              );
          };
        }

        if (cap.hasw3ctouch) {
          //IE11+
          self.css(self.ispage ? $("html") : self.win, {
            "touch-action": "none"
          });
          self.css(self.rail, {
            "touch-action": "none"
          });
          self.css(self.cursor, {
            "touch-action": "none"
          });
          self.bind(self.win, "pointerdown", self.ontouchstart);
          self.bind(_doc, "pointerup", self.ontouchend);
          self.delegate(_doc, "pointermove", self.ontouchmove);
        } else if (cap.hasmstouch) {
          //IE10
          self.css(self.ispage ? $("html") : self.win, {
            "-ms-touch-action": "none"
          });
          self.css(self.rail, {
            "-ms-touch-action": "none"
          });
          self.css(self.cursor, {
            "-ms-touch-action": "none"
          });
          self.bind(self.win, "MSPointerDown", self.ontouchstart);
          self.bind(_doc, "MSPointerUp", self.ontouchend);
          self.delegate(_doc, "MSPointerMove", self.ontouchmove);
          self.bind(self.cursor, "MSGestureHold", function(e) {
            e.preventDefault();
          });
          self.bind(self.cursor, "contextmenu", function(e) {
            e.preventDefault();
          });
        } else if (cap.cantouch) {
          // smartphones/touch devices
          self.bind(self.win, "touchstart", self.ontouchstart, false, true);
          self.bind(_doc, "touchend", self.ontouchend, false, true);
          self.bind(_doc, "touchcancel", self.ontouchend, false, true);
          self.delegate(_doc, "touchmove", self.ontouchmove, false, true);
        }

        if (opt.emulatetouch) {
          self.bind(self.win, "mousedown", self.ontouchstart, false, true);
          self.bind(_doc, "mouseup", self.ontouchend, false, true);
          self.bind(_doc, "mousemove", self.ontouchmove, false, true);
        }

        if (opt.cursordragontouch || (!cap.cantouch && !opt.emulatetouch)) {
          self.rail.css({
            cursor: "default"
          });
          self.railh &&
            self.railh.css({
              cursor: "default"
            });

          self.jqbind(self.rail, "mouseenter", function() {
            if (!self.ispage && !self.win.is(":visible")) return false;
            if (self.canshowonmouseevent) self.showCursor();
            self.rail.active = true;
          });
          self.jqbind(self.rail, "mouseleave", function() {
            self.rail.active = false;
            if (!self.rail.drag) self.hideCursor();
          });

          if (opt.sensitiverail) {
            self.bind(self.rail, "click", function(e) {
              self.doRailClick(e, false, false);
            });
            self.bind(self.rail, "dblclick", function(e) {
              self.doRailClick(e, true, false);
            });
            self.bind(self.cursor, "click", function(e) {
              self.cancelEvent(e);
            });
            self.bind(self.cursor, "dblclick", function(e) {
              self.cancelEvent(e);
            });
          }

          if (self.railh) {
            self.jqbind(self.railh, "mouseenter", function() {
              if (!self.ispage && !self.win.is(":visible")) return false;
              if (self.canshowonmouseevent) self.showCursor();
              self.rail.active = true;
            });
            self.jqbind(self.railh, "mouseleave", function() {
              self.rail.active = false;
              if (!self.rail.drag) self.hideCursor();
            });

            if (opt.sensitiverail) {
              self.bind(self.railh, "click", function(e) {
                self.doRailClick(e, false, true);
              });
              self.bind(self.railh, "dblclick", function(e) {
                self.doRailClick(e, true, true);
              });
              self.bind(self.cursorh, "click", function(e) {
                self.cancelEvent(e);
              });
              self.bind(self.cursorh, "dblclick", function(e) {
                self.cancelEvent(e);
              });
            }
          }
        }

        if (opt.cursordragontouch && (this.istouchcapable || cap.cantouch)) {
          self.bind(self.cursor, "touchstart", self.ontouchstartCursor);
          self.bind(self.cursor, "touchmove", self.ontouchmoveCursor);
          self.bind(self.cursor, "touchend", self.ontouchendCursor);
          self.cursorh &&
            self.bind(self.cursorh, "touchstart", function(e) {
              self.ontouchstartCursor(e, true);
            });
          self.cursorh &&
            self.bind(self.cursorh, "touchmove", self.ontouchmoveCursor);
          self.cursorh &&
            self.bind(self.cursorh, "touchend", self.ontouchendCursor);
        }

        //        if (!cap.cantouch && !opt.emulatetouch) {
        if (!opt.emulatetouch && !cap.isandroid && !cap.isios) {
          self.bind(
            cap.hasmousecapture ? self.win : _doc,
            "mouseup",
            self.onmouseup
          );
          self.bind(_doc, "mousemove", self.onmousemove);
          if (self.onclick) self.bind(_doc, "click", self.onclick);

          self.bind(self.cursor, "mousedown", self.onmousedown);
          self.bind(self.cursor, "mouseup", self.onmouseup);

          if (self.railh) {
            self.bind(self.cursorh, "mousedown", function(e) {
              self.onmousedown(e, true);
            });
            self.bind(self.cursorh, "mouseup", self.onmouseup);
          }

          if (!self.ispage && opt.enablescrollonselection) {
            self.bind(self.win[0], "mousedown", self.onselectionstart);
            self.bind(_doc, "mouseup", self.onselectionend);
            self.bind(self.cursor, "mouseup", self.onselectionend);
            if (self.cursorh)
              self.bind(self.cursorh, "mouseup", self.onselectionend);
            self.bind(_doc, "mousemove", self.onselectiondrag);
          }

          if (self.zoom) {
            self.jqbind(self.zoom, "mouseenter", function() {
              if (self.canshowonmouseevent) self.showCursor();
              self.rail.active = true;
            });
            self.jqbind(self.zoom, "mouseleave", function() {
              self.rail.active = false;
              if (!self.rail.drag) self.hideCursor();
            });
          }
        } else {
          self.bind(
            cap.hasmousecapture ? self.win : _doc,
            "mouseup",
            self.ontouchend
          );
          if (self.onclick) self.bind(_doc, "click", self.onclick);

          if (opt.cursordragontouch) {
            self.bind(self.cursor, "mousedown", self.onmousedown);
            self.bind(self.cursor, "mouseup", self.onmouseup);
            self.cursorh &&
              self.bind(self.cursorh, "mousedown", function(e) {
                self.onmousedown(e, true);
              });
            self.cursorh && self.bind(self.cursorh, "mouseup", self.onmouseup);
          } else {
            self.bind(self.rail, "mousedown", function(e) {
              e.preventDefault();
            }); // prevent text selection
            self.railh &&
              self.bind(self.railh, "mousedown", function(e) {
                e.preventDefault();
              });
          }
        }

        if (opt.enablemousewheel) {
          if (!self.isiframe)
            self.mousewheel(
              cap.isie && self.ispage ? _doc : self.win,
              self.onmousewheel
            );
          self.mousewheel(self.rail, self.onmousewheel);
          if (self.railh) self.mousewheel(self.railh, self.onmousewheelhr);
        }

        if (
          !self.ispage &&
          !cap.cantouch &&
          !/HTML|^BODY/.test(self.win[0].nodeName)
        ) {
          if (!self.win.attr("tabindex"))
            self.win.attr({
              tabindex: ++tabindexcounter
            });

          self.bind(self.win, "focus", function(e) {
            // better using native events
            domfocus = self.getTarget(e).id || self.getTarget(e) || false;
            self.hasfocus = true;
            if (self.canshowonmouseevent) self.noticeCursor();
          });
          self.bind(self.win, "blur", function(e) {
            // *
            domfocus = false;
            self.hasfocus = false;
          });

          self.bind(self.win, "mouseenter", function(e) {
            // *
            mousefocus = self.getTarget(e).id || self.getTarget(e) || false;
            self.hasmousefocus = true;
            if (self.canshowonmouseevent) self.noticeCursor();
          });
          self.bind(self.win, "mouseleave", function(e) {
            // *
            mousefocus = false;
            self.hasmousefocus = false;
            if (!self.rail.drag) self.hideCursor();
          });
        }

        //Thanks to http://www.quirksmode.org !!
        self.onkeypress = function(e) {
          if (self.railslocked && self.page.maxh === 0) return true;

          e = e || _win.event;
          var tg = self.getTarget(e);
          if (tg && /INPUT|TEXTAREA|SELECT|OPTION/.test(tg.nodeName)) {
            var tp = tg.getAttribute("type") || tg.type || false;
            if (!tp || !/submit|button|cancel/i.tp) return true;
          }

          if ($(tg).attr("contenteditable")) return true;

          if (
            self.hasfocus ||
            (self.hasmousefocus && !domfocus) ||
            (self.ispage && !domfocus && !mousefocus)
          ) {
            var key = e.keyCode;

            if (self.railslocked && key != 27) return self.cancelEvent(e);

            var ctrl = e.ctrlKey || false;
            var shift = e.shiftKey || false;

            var ret = false;
            switch (key) {
              case 38:
              case 63233: //safari
                self.doScrollBy(24 * 3);
                ret = true;
                break;
              case 40:
              case 63235: //safari
                self.doScrollBy(-24 * 3);
                ret = true;
                break;
              case 37:
              case 63232: //safari
                if (self.railh) {
                  ctrl ? self.doScrollLeft(0) : self.doScrollLeftBy(24 * 3);
                  ret = true;
                }
                break;
              case 39:
              case 63234: //safari
                if (self.railh) {
                  ctrl
                    ? self.doScrollLeft(self.page.maxw)
                    : self.doScrollLeftBy(-24 * 3);
                  ret = true;
                }
                break;
              case 33:
              case 63276: // safari
                self.doScrollBy(self.view.h);
                ret = true;
                break;
              case 34:
              case 63277: // safari
                self.doScrollBy(-self.view.h);
                ret = true;
                break;
              case 36:
              case 63273: // safari
                self.railh && ctrl
                  ? self.doScrollPos(0, 0)
                  : self.doScrollTo(0);
                ret = true;
                break;
              case 35:
              case 63275: // safari
                self.railh && ctrl
                  ? self.doScrollPos(self.page.maxw, self.page.maxh)
                  : self.doScrollTo(self.page.maxh);
                ret = true;
                break;
              case 32:
                if (opt.spacebarenabled) {
                  shift
                    ? self.doScrollBy(self.view.h)
                    : self.doScrollBy(-self.view.h);
                  ret = true;
                }
                break;
              case 27: // ESC
                if (self.zoomactive) {
                  self.doZoom();
                  ret = true;
                }
                break;
            }
            if (ret) return self.cancelEvent(e);
          }
        };

        if (opt.enablekeyboard)
          self.bind(
            _doc,
            cap.isopera && !cap.isopera12 ? "keypress" : "keydown",
            self.onkeypress
          );

        self.bind(_doc, "keydown", function(e) {
          var ctrl = e.ctrlKey || false;
          if (ctrl) self.wheelprevented = true;
        });
        self.bind(_doc, "keyup", function(e) {
          var ctrl = e.ctrlKey || false;
          if (!ctrl) self.wheelprevented = false;
        });
        self.bind(_win, "blur", function(e) {
          self.wheelprevented = false;
        });

        self.bind(_win, "resize", self.onscreenresize);
        self.bind(_win, "orientationchange", self.onscreenresize);

        self.bind(_win, "load", self.lazyResize);

        if (cap.ischrome && !self.ispage && !self.haswrapper) {
          //chrome void scrollbar bug - it persists in version 26
          var tmp = self.win.attr("style");
          var ww = parseFloat(self.win.css("width")) + 1;
          self.win.css("width", ww);
          self.synched("chromefix", function() {
            self.win.attr("style", tmp);
          });
        }

        // Trying a cross-browser implementation - good luck!

        self.onAttributeChange = function(e) {
          self.lazyResize(self.isieold ? 250 : 30);
        };

        if (opt.enableobserver) {
          if (!self.isie11 && ClsMutationObserver !== false) {
            // IE11 crashes  #568
            self.observerbody = new ClsMutationObserver(function(mutations) {
              mutations.forEach(function(mut) {
                if (mut.type == "attributes") {
                  return $body.hasClass("modal-open") &&
                    $body.hasClass("modal-dialog") &&
                    !$.contains($(".modal-dialog")[0], self.doc[0])
                    ? self.hide()
                    : self.show(); // Support for Bootstrap modal; Added check if the nice scroll element is inside a modal
                }
              });
              if (
                self.me.clientWidth != self.page.width ||
                self.me.clientHeight != self.page.height
              )
                return self.lazyResize(30);
            });
            self.observerbody.observe(_doc.body, {
              childList: true,
              subtree: true,
              characterData: false,
              attributes: true,
              attributeFilter: ["class"]
            });
          }

          if (!self.ispage && !self.haswrapper) {
            var _dom = self.win[0];

            // redesigned MutationObserver for Chrome18+/Firefox14+/iOS6+ with support for: remove div, add/remove content
            if (ClsMutationObserver !== false) {
              self.observer = new ClsMutationObserver(function(mutations) {
                mutations.forEach(self.onAttributeChange);
              });
              self.observer.observe(_dom, {
                childList: true,
                characterData: false,
                attributes: true,
                subtree: false
              });
              self.observerremover = new ClsMutationObserver(function(
                mutations
              ) {
                mutations.forEach(function(mo) {
                  if (mo.removedNodes.length > 0) {
                    for (var dd in mo.removedNodes) {
                      if (!!self && mo.removedNodes[dd] === _dom)
                        return self.remove();
                    }
                  }
                });
              });
              self.observerremover.observe(_dom.parentNode, {
                childList: true,
                characterData: false,
                attributes: false,
                subtree: false
              });
            } else {
              self.bind(
                _dom,
                cap.isie && !cap.isie9 ? "propertychange" : "DOMAttrModified",
                self.onAttributeChange
              );
              if (cap.isie9)
                _dom.attachEvent("onpropertychange", self.onAttributeChange); //IE9 DOMAttrModified bug
              self.bind(_dom, "DOMNodeRemoved", function(e) {
                if (e.target === _dom) self.remove();
              });
            }
          }
        }

        //

        if (!self.ispage && opt.boxzoom)
          self.bind(_win, "resize", self.resizeZoom);
        if (self.istextarea) {
          self.bind(self.win, "keydown", self.lazyResize);
          self.bind(self.win, "mouseup", self.lazyResize);
        }

        self.lazyResize(30);
      }

      if (this.doc[0].nodeName == "IFRAME") {
        var oniframeload = function() {
          self.iframexd = false;
          var doc;
          try {
            doc =
              "contentDocument" in this
                ? this.contentDocument
                : this.contentWindow._doc;
            var a = doc.domain;
          } catch (e) {
            self.iframexd = true;
            doc = false;
          }

          if (self.iframexd) {
            if ("console" in _win)
              console.log("NiceScroll error: policy restriced iframe");
            return true; //cross-domain - I can't manage this
          }

          self.forcescreen = true;

          if (self.isiframe) {
            self.iframe = {
              doc: $(doc),
              html: self.doc.contents().find("html")[0],
              body: self.doc.contents().find("body")[0]
            };
            self.getContentSize = function() {
              return {
                w: Math.max(
                  self.iframe.html.scrollWidth,
                  self.iframe.body.scrollWidth
                ),
                h: Math.max(
                  self.iframe.html.scrollHeight,
                  self.iframe.body.scrollHeight
                )
              };
            };
            self.docscroll = $(self.iframe.body);
          }

          if (!cap.isios && opt.iframeautoresize && !self.isiframe) {
            self.win.scrollTop(0); // reset position
            self.doc.height(""); //reset height to fix browser bug
            var hh = Math.max(
              doc.getElementsByTagName("html")[0].scrollHeight,
              doc.body.scrollHeight
            );
            self.doc.height(hh);
          }
          self.lazyResize(30);

          self.css($(self.iframe.body), _scrollyhidden);

          if (cap.isios && self.haswrapper) {
            self.css($(doc.body), {
              "-webkit-transform": "translate3d(0,0,0)"
            }); // avoid iFrame content clipping - thanks to http://blog.derraab.com/2012/04/02/avoid-iframe-content-clipping-with-css-transform-on-ios/
          }

          if ("contentWindow" in this) {
            self.bind(this.contentWindow, "scroll", self.onscroll); //IE8 & minor
          } else {
            self.bind(doc, "scroll", self.onscroll);
          }

          if (opt.enablemousewheel) {
            self.mousewheel(doc, self.onmousewheel);
          }

          if (opt.enablekeyboard)
            self.bind(
              doc,
              cap.isopera ? "keypress" : "keydown",
              self.onkeypress
            );

          if (cap.cantouch) {
            self.bind(doc, "touchstart", self.ontouchstart);
            self.bind(doc, "touchmove", self.ontouchmove);
          } else if (opt.emulatetouch) {
            self.bind(doc, "mousedown", self.ontouchstart);
            self.bind(doc, "mousemove", function(e) {
              return self.ontouchmove(e, true);
            });
            if (opt.grabcursorenabled && cap.cursorgrabvalue)
              self.css($(doc.body), {
                cursor: cap.cursorgrabvalue
              });
          }

          self.bind(doc, "mouseup", self.ontouchend);

          if (self.zoom) {
            if (opt.dblclickzoom) self.bind(doc, "dblclick", self.doZoom);
            if (self.ongesturezoom)
              self.bind(doc, "gestureend", self.ongesturezoom);
          }
        };

        if (this.doc[0].readyState && this.doc[0].readyState === "complete") {
          setTimeout(function() {
            oniframeload.call(self.doc[0], false);
          }, 500);
        }
        self.bind(this.doc, "load", oniframeload);
      }
    };

    this.showCursor = function(py, px) {
      if (self.cursortimeout) {
        clearTimeout(self.cursortimeout);
        self.cursortimeout = 0;
      }
      if (!self.rail) return;
      if (self.autohidedom) {
        self.autohidedom.stop().css({
          opacity: opt.cursoropacitymax
        });
        self.cursoractive = true;
      }

      if (!self.rail.drag || self.rail.drag.pt != 1) {
        if (py !== undefined && py !== false) {
          self.scroll.y = (py / self.scrollratio.y) | 0;
        }
        if (px !== undefined) {
          self.scroll.x = (px / self.scrollratio.x) | 0;
        }
      }

      self.cursor.css({
        height: self.cursorheight,
        top: self.scroll.y
      });
      if (self.cursorh) {
        var lx = self.hasreversehr
          ? self.scrollvaluemaxw - self.scroll.x
          : self.scroll.x;
        self.cursorh.css({
          width: self.cursorwidth,
          left:
            !self.rail.align && self.rail.visibility ? lx + self.rail.width : lx
        });
        self.cursoractive = true;
      }

      if (self.zoom)
        self.zoom.stop().css({
          opacity: opt.cursoropacitymax
        });
    };

    this.hideCursor = function(tm) {
      if (self.cursortimeout) return;
      if (!self.rail) return;
      if (!self.autohidedom) return;

      if (self.hasmousefocus && opt.autohidemode === "leave") return;
      self.cursortimeout = setTimeout(function() {
        if (!self.rail.active || !self.showonmouseevent) {
          self.autohidedom.stop().animate({
            opacity: opt.cursoropacitymin
          });
          if (self.zoom)
            self.zoom.stop().animate({
              opacity: opt.cursoropacitymin
            });
          self.cursoractive = false;
        }
        self.cursortimeout = 0;
      }, tm || opt.hidecursordelay);
    };

    this.noticeCursor = function(tm, py, px) {
      self.showCursor(py, px);
      if (!self.rail.active) self.hideCursor(tm);
    };

    this.getContentSize = self.ispage
      ? function() {
          return {
            w: Math.max(
              _doc.body.scrollWidth,
              _doc.documentElement.scrollWidth
            ),
            h: Math.max(
              _doc.body.scrollHeight,
              _doc.documentElement.scrollHeight
            )
          };
        }
      : self.haswrapper
      ? function() {
          return {
            w: self.doc[0].offsetWidth,
            h: self.doc[0].offsetHeight
          };
        }
      : function() {
          return {
            w: self.docscroll[0].scrollWidth,
            h: self.docscroll[0].scrollHeight
          };
        };

    this.onResize = function(e, page) {
      if (!self || !self.win) return false;

      var premaxh = self.page.maxh,
        premaxw = self.page.maxw,
        previewh = self.view.h,
        previeww = self.view.w;

      self.view = {
        w: self.ispage ? self.win.width() : self.win[0].clientWidth,
        h: self.ispage ? self.win.height() : self.win[0].clientHeight
      };

      self.page = page ? page : self.getContentSize();

      self.page.maxh = Math.max(0, self.page.h - self.view.h);
      self.page.maxw = Math.max(0, self.page.w - self.view.w);

      if (
        self.page.maxh == premaxh &&
        self.page.maxw == premaxw &&
        self.view.w == previeww &&
        self.view.h == previewh
      ) {
        // test position
        if (!self.ispage) {
          var pos = self.win.offset();
          if (self.lastposition) {
            var lst = self.lastposition;
            if (lst.top == pos.top && lst.left == pos.left) return self; //nothing to do
          }
          self.lastposition = pos;
        } else {
          return self; //nothing to do
        }
      }

      if (self.page.maxh === 0) {
        self.hideRail();
        self.scrollvaluemax = 0;
        self.scroll.y = 0;
        self.scrollratio.y = 0;
        self.cursorheight = 0;
        self.setScrollTop(0);
        if (self.rail) self.rail.scrollable = false;
      } else {
        self.page.maxh -= opt.railpadding.top + opt.railpadding.bottom;
        self.rail.scrollable = true;
      }

      if (self.page.maxw === 0) {
        self.hideRailHr();
        self.scrollvaluemaxw = 0;
        self.scroll.x = 0;
        self.scrollratio.x = 0;
        self.cursorwidth = 0;
        self.setScrollLeft(0);
        if (self.railh) {
          self.railh.scrollable = false;
        }
      } else {
        self.page.maxw -= opt.railpadding.left + opt.railpadding.right;
        if (self.railh) self.railh.scrollable = opt.horizrailenabled;
      }

      self.railslocked =
        self.locked || (self.page.maxh === 0 && self.page.maxw === 0);
      if (self.railslocked) {
        if (!self.ispage) self.updateScrollBar(self.view);
        return false;
      }

      if (!self.hidden) {
        if (!self.rail.visibility) self.showRail();
        if (self.railh && !self.railh.visibility) self.showRailHr();
      }

      if (
        self.istextarea &&
        self.win.css("resize") &&
        self.win.css("resize") != "none"
      )
        self.view.h -= 20;

      self.cursorheight = Math.min(
        self.view.h,
        Math.round(self.view.h * (self.view.h / self.page.h))
      );
      self.cursorheight = opt.cursorfixedheight
        ? opt.cursorfixedheight
        : Math.max(opt.cursorminheight, self.cursorheight);

      self.cursorwidth = Math.min(
        self.view.w,
        Math.round(self.view.w * (self.view.w / self.page.w))
      );
      self.cursorwidth = opt.cursorfixedheight
        ? opt.cursorfixedheight
        : Math.max(opt.cursorminheight, self.cursorwidth);

      self.scrollvaluemax =
        self.view.h -
        self.cursorheight -
        (opt.railpadding.top + opt.railpadding.bottom);
      if (!self.hasborderbox)
        self.scrollvaluemax -=
          self.cursor[0].offsetHeight - self.cursor[0].clientHeight;

      if (self.railh) {
        self.railh.width =
          self.page.maxh > 0 ? self.view.w - self.rail.width : self.view.w;
        self.scrollvaluemaxw =
          self.railh.width -
          self.cursorwidth -
          (opt.railpadding.left + opt.railpadding.right);
      }

      if (!self.ispage) self.updateScrollBar(self.view);

      self.scrollratio = {
        x: self.page.maxw / self.scrollvaluemaxw,
        y: self.page.maxh / self.scrollvaluemax
      };

      var sy = self.getScrollTop();
      if (sy > self.page.maxh) {
        self.doScrollTop(self.page.maxh);
      } else {
        self.scroll.y = (self.getScrollTop() / self.scrollratio.y) | 0;
        self.scroll.x = (self.getScrollLeft() / self.scrollratio.x) | 0;
        if (self.cursoractive) self.noticeCursor();
      }

      if (self.scroll.y && self.getScrollTop() === 0)
        self.doScrollTo((self.scroll.y * self.scrollratio.y) | 0);

      return self;
    };

    this.resize = self.onResize;

    var hlazyresize = 0;

    this.onscreenresize = function(e) {
      clearTimeout(hlazyresize);

      var hiderails = !self.ispage && !self.haswrapper;
      if (hiderails) self.hideRails();

      hlazyresize = setTimeout(function() {
        if (self) {
          if (hiderails) self.showRails();
          self.resize();
        }
        hlazyresize = 0;
      }, 120);
    };

    this.lazyResize = function(tm) {
      // event debounce

      clearTimeout(hlazyresize);

      tm = isNaN(tm) ? 240 : tm;

      hlazyresize = setTimeout(function() {
        self && self.resize();
        hlazyresize = 0;
      }, tm);

      return self;
    };

    // derived by MDN https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/wheel
    function _modernWheelEvent(dom, name, fn, bubble) {
      self._bind(
        dom,
        name,
        function(e) {
          e = e || _win.event;
          var event = {
            original: e,
            target: e.target || e.srcElement,
            type: "wheel",
            deltaMode: e.type == "MozMousePixelScroll" ? 0 : 1,
            deltaX: 0,
            deltaZ: 0,
            preventDefault: function() {
              e.preventDefault ? e.preventDefault() : (e.returnValue = false);
              return false;
            },
            stopImmediatePropagation: function() {
              e.stopImmediatePropagation
                ? e.stopImmediatePropagation()
                : (e.cancelBubble = true);
            }
          };

          if (name == "mousewheel") {
            e.wheelDeltaX && (event.deltaX = (-1 / 40) * e.wheelDeltaX);
            e.wheelDeltaY && (event.deltaY = (-1 / 40) * e.wheelDeltaY);
            !event.deltaY &&
              !event.deltaX &&
              (event.deltaY = (-1 / 40) * e.wheelDelta);
          } else {
            event.deltaY = e.detail;
          }

          return fn.call(dom, event);
        },
        bubble
      );
    }

    this.jqbind = function(dom, name, fn) {
      // use jquery bind for non-native events (mouseenter/mouseleave)
      self.events.push({
        e: dom,
        n: name,
        f: fn,
        q: true
      });
      $(dom).on(name, fn);
    };

    this.mousewheel = function(dom, fn, bubble) {
      // bind mousewheel
      var el = "jquery" in dom ? dom[0] : dom;
      if ("onwheel" in _doc.createElement("div")) {
        // Modern browsers support "wheel"
        self._bind(el, "wheel", fn, bubble || false);
      } else {
        var wname =
          _doc.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll"; // older Webkit+IE support or older Firefox
        _modernWheelEvent(el, wname, fn, bubble || false);
        if (wname == "DOMMouseScroll")
          _modernWheelEvent(el, "MozMousePixelScroll", fn, bubble || false); // Firefox legacy
      }
    };

    var passiveSupported = false;

    if (cap.haseventlistener) {
      // W3C standard event model

      // thanks to https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
      try {
        var options = Object.defineProperty({}, "passive", {
          get: function() {
            passiveSupported = !0;
          }
        });
        _win.addEventListener("test", null, options);
      } catch (err) {}

      this.stopPropagation = function(e) {
        if (!e) return false;
        e = e.original ? e.original : e;
        e.stopPropagation();
        return false;
      };

      this.cancelEvent = function(e) {
        if (e.cancelable) e.preventDefault();
        e.stopImmediatePropagation();
        if (e.preventManipulation) e.preventManipulation(); // IE10+
        return false;
      };
    } else {
      // inspired from https://gist.github.com/jonathantneal/2415137

      Event.prototype.preventDefault = function() {
        this.returnValue = false;
      };

      Event.prototype.stopPropagation = function() {
        this.cancelBubble = true;
      };

      _win.constructor.prototype.addEventListener = _doc.constructor.prototype.addEventListener = Element.prototype.addEventListener = function(
        type,
        listener,
        useCapture
      ) {
        this.attachEvent("on" + type, listener);
      };
      _win.constructor.prototype.removeEventListener = _doc.constructor.prototype.removeEventListener = Element.prototype.removeEventListener = function(
        type,
        listener,
        useCapture
      ) {
        this.detachEvent("on" + type, listener);
      };

      // Thanks to http://www.switchonthecode.com !!
      this.cancelEvent = function(e) {
        e = e || _win.event;
        if (e) {
          e.cancelBubble = true;
          e.cancel = true;
          e.returnValue = false;
        }
        return false;
      };

      this.stopPropagation = function(e) {
        e = e || _win.event;
        if (e) e.cancelBubble = true;
        return false;
      };
    }

    this.delegate = function(dom, name, fn, bubble, active) {
      var de = delegatevents[name] || false;

      if (!de) {
        de = {
          a: [],
          l: [],
          f: function(e) {
            var lst = de.l,
              l = lst.length - 1;
            var r = false;
            for (var a = l; a >= 0; a--) {
              r = lst[a].call(e.target, e);
              if (r === false) return false;
            }
            return r;
          }
        };

        self.bind(dom, name, de.f, bubble, active);

        delegatevents[name] = de;
      }

      if (self.ispage) {
        de.a = [self.id].concat(de.a);
        de.l = [fn].concat(de.l);
      } else {
        de.a.push(self.id);
        de.l.push(fn);
      }
    };

    this.undelegate = function(dom, name, fn, bubble, active) {
      var de = delegatevents[name] || false;
      if (de && de.l) {
        // quick fix #683
        for (var a = 0, l = de.l.length; a < l; a++) {
          if (de.a[a] === self.id) {
            de.a.splice(a);
            de.l.splice(a);
            if (de.a.length === 0) {
              self._unbind(dom, name, de.l.f);
              delegatevents[name] = null;
            }
          }
        }
      }
    };

    this.bind = function(dom, name, fn, bubble, active) {
      var el = "jquery" in dom ? dom[0] : dom;
      self._bind(el, name, fn, bubble || false, active || false);
    };

    this._bind = function(el, name, fn, bubble, active) {
      // primitive bind

      self.events.push({
        e: el,
        n: name,
        f: fn,
        b: bubble,
        q: false
      });

      passiveSupported && active
        ? el.addEventListener(name, fn, { passive: false, capture: bubble })
        : el.addEventListener(name, fn, bubble || false);
    };

    this._unbind = function(el, name, fn, bub) {
      // primitive unbind
      if (delegatevents[name]) self.undelegate(el, name, fn, bub);
      else el.removeEventListener(name, fn, bub);
    };

    this.unbindAll = function() {
      for (var a = 0; a < self.events.length; a++) {
        var r = self.events[a];
        r.q ? r.e.unbind(r.n, r.f) : self._unbind(r.e, r.n, r.f, r.b);
      }
    };

    this.showRails = function() {
      return self.showRail().showRailHr();
    };

    this.showRail = function() {
      if (
        self.page.maxh !== 0 &&
        (self.ispage || self.win.css("display") != "none")
      ) {
        //self.visibility = true;
        self.rail.visibility = true;
        self.rail.css("display", "block");
      }
      return self;
    };

    this.showRailHr = function() {
      if (self.railh) {
        if (
          self.page.maxw !== 0 &&
          (self.ispage || self.win.css("display") != "none")
        ) {
          self.railh.visibility = true;
          self.railh.css("display", "block");
        }
      }
      return self;
    };

    this.hideRails = function() {
      return self.hideRail().hideRailHr();
    };

    this.hideRail = function() {
      //self.visibility = false;
      self.rail.visibility = false;
      self.rail.css("display", "none");
      return self;
    };

    this.hideRailHr = function() {
      if (self.railh) {
        self.railh.visibility = false;
        self.railh.css("display", "none");
      }
      return self;
    };

    this.show = function() {
      self.hidden = false;
      self.railslocked = false;
      return self.showRails();
    };

    this.hide = function() {
      self.hidden = true;
      self.railslocked = true;
      return self.hideRails();
    };

    this.toggle = function() {
      return self.hidden ? self.show() : self.hide();
    };

    this.remove = function() {
      self.stop();
      if (self.cursortimeout) clearTimeout(self.cursortimeout);
      for (var n in self.delaylist)
        if (self.delaylist[n]) clearAnimationFrame(self.delaylist[n].h);
      self.doZoomOut();
      self.unbindAll();

      if (cap.isie9)
        self.win[0].detachEvent("onpropertychange", self.onAttributeChange); //IE9 DOMAttrModified bug

      if (self.observer !== false) self.observer.disconnect();
      if (self.observerremover !== false) self.observerremover.disconnect();
      if (self.observerbody !== false) self.observerbody.disconnect();

      self.events = null;

      if (self.cursor) {
        self.cursor.remove();
      }
      if (self.cursorh) {
        self.cursorh.remove();
      }
      if (self.rail) {
        self.rail.remove();
      }
      if (self.railh) {
        self.railh.remove();
      }
      if (self.zoom) {
        self.zoom.remove();
      }
      for (var a = 0; a < self.saved.css.length; a++) {
        var d = self.saved.css[a];
        d[0].css(d[1], d[2] === undefined ? "" : d[2]);
      }
      self.saved = false;
      self.me.data("__nicescroll", ""); //erase all traces

      // memory leak fixed by GianlucaGuarini - thanks a lot!
      // remove the current nicescroll from the $.nicescroll array & normalize array
      var lst = $.nicescroll;
      lst.each(function(i) {
        if (!this) return;
        if (this.id === self.id) {
          delete lst[i];
          for (var b = ++i; b < lst.length; b++, i++) lst[i] = lst[b];
          lst.length--;
          if (lst.length) delete lst[lst.length];
        }
      });

      for (var i in self) {
        self[i] = null;
        delete self[i];
      }

      self = null;
    };

    this.scrollstart = function(fn) {
      this.onscrollstart = fn;
      return self;
    };
    this.scrollend = function(fn) {
      this.onscrollend = fn;
      return self;
    };
    this.scrollcancel = function(fn) {
      this.onscrollcancel = fn;
      return self;
    };

    this.zoomin = function(fn) {
      this.onzoomin = fn;
      return self;
    };
    this.zoomout = function(fn) {
      this.onzoomout = fn;
      return self;
    };

    this.isScrollable = function(e) {
      var dom = e.target ? e.target : e;
      if (dom.nodeName == "OPTION") return true;
      while (
        dom &&
        dom.nodeType == 1 &&
        dom !== this.me[0] &&
        !/^BODY|HTML/.test(dom.nodeName)
      ) {
        var dd = $(dom);
        var ov =
          dd.css("overflowY") ||
          dd.css("overflowX") ||
          dd.css("overflow") ||
          "";
        if (/scroll|auto/.test(ov)) return dom.clientHeight != dom.scrollHeight;
        dom = dom.parentNode ? dom.parentNode : false;
      }
      return false;
    };

    this.getViewport = function(me) {
      var dom = me && me.parentNode ? me.parentNode : false;
      while (dom && dom.nodeType == 1 && !/^BODY|HTML/.test(dom.nodeName)) {
        var dd = $(dom);
        if (/fixed|absolute/.test(dd.css("position"))) return dd;
        var ov =
          dd.css("overflowY") ||
          dd.css("overflowX") ||
          dd.css("overflow") ||
          "";
        if (/scroll|auto/.test(ov) && dom.clientHeight != dom.scrollHeight)
          return dd;
        if (dd.getNiceScroll().length > 0) return dd;
        dom = dom.parentNode ? dom.parentNode : false;
      }
      return false;
    };

    this.triggerScrollStart = function(cx, cy, rx, ry, ms) {
      if (self.onscrollstart) {
        var info = {
          type: "scrollstart",
          current: {
            x: cx,
            y: cy
          },
          request: {
            x: rx,
            y: ry
          },
          end: {
            x: self.newscrollx,
            y: self.newscrolly
          },
          speed: ms
        };
        self.onscrollstart.call(self, info);
      }
    };

    this.triggerScrollEnd = function() {
      if (self.onscrollend) {
        var px = self.getScrollLeft();
        var py = self.getScrollTop();

        var info = {
          type: "scrollend",
          current: {
            x: px,
            y: py
          },
          end: {
            x: px,
            y: py
          }
        };

        self.onscrollend.call(self, info);
      }
    };

    var scrolldiry = 0,
      scrolldirx = 0,
      scrolltmr = 0,
      scrollspd = 1;

    function doScrollRelative(px, py, chkscroll, iswheel) {
      if (!self.scrollrunning) {
        self.newscrolly = self.getScrollTop();
        self.newscrollx = self.getScrollLeft();
        scrolltmr = now();
      }

      var gap = now() - scrolltmr;
      scrolltmr = now();

      if (gap > 350) {
        scrollspd = 1;
      } else {
        scrollspd += (2 - scrollspd) / 10;
      }

      px = (px * scrollspd) | 0;
      py = (py * scrollspd) | 0;

      if (px) {
        if (iswheel) {
          // mouse-only
          if (px < 0) {
            // fix apple magic mouse swipe back/forward
            if (self.getScrollLeft() >= self.page.maxw) return true;
          } else {
            if (self.getScrollLeft() <= 0) return true;
          }
        }

        var dx = px > 0 ? 1 : -1;

        if (scrolldirx !== dx) {
          if (self.scrollmom) self.scrollmom.stop();
          self.newscrollx = self.getScrollLeft();
          scrolldirx = dx;
        }

        self.lastdeltax -= px;
      }

      if (py) {
        var chk = (function() {
          var top = self.getScrollTop();
          if (py < 0) {
            if (top >= self.page.maxh) return true;
          } else {
            if (top <= 0) return true;
          }
        })();

        if (chk) {
          if (
            opt.nativeparentscrolling &&
            chkscroll &&
            !self.ispage &&
            !self.zoomactive
          )
            return true;
          var ny = self.view.h >> 1;
          if (self.newscrolly < -ny) {
            self.newscrolly = -ny;
            py = -1;
          } else if (self.newscrolly > self.page.maxh + ny) {
            self.newscrolly = self.page.maxh + ny;
            py = 1;
          } else py = 0;
        }

        var dy = py > 0 ? 1 : -1;

        if (scrolldiry !== dy) {
          if (self.scrollmom) self.scrollmom.stop();
          self.newscrolly = self.getScrollTop();
          scrolldiry = dy;
        }

        self.lastdeltay -= py;
      }

      if (py || px) {
        self.synched("relativexy", function() {
          var dty = self.lastdeltay + self.newscrolly;
          self.lastdeltay = 0;

          var dtx = self.lastdeltax + self.newscrollx;
          self.lastdeltax = 0;

          if (!self.rail.drag) self.doScrollPos(dtx, dty);
        });
      }
    }

    var hasparentscrollingphase = false;

    function execScrollWheel(e, hr, chkscroll) {
      var px, py;

      if (!chkscroll && hasparentscrollingphase) return true;

      if (e.deltaMode === 0) {
        // PIXEL
        px = -(e.deltaX * (opt.mousescrollstep / (18 * 3))) | 0;
        py = -(e.deltaY * (opt.mousescrollstep / (18 * 3))) | 0;
      } else if (e.deltaMode === 1) {
        // LINE
        px = -((e.deltaX * opt.mousescrollstep * 50) / 80) | 0;
        py = -((e.deltaY * opt.mousescrollstep * 50) / 80) | 0;
      }

      if (hr && opt.oneaxismousemode && px === 0 && py) {
        // classic vertical-only mousewheel + browser with x/y support
        px = py;
        py = 0;

        if (chkscroll) {
          var hrend =
            px < 0
              ? self.getScrollLeft() >= self.page.maxw
              : self.getScrollLeft() <= 0;
          if (hrend) {
            // preserve vertical scrolling
            py = px;
            px = 0;
          }
        }
      }

      // invert horizontal direction for rtl mode
      if (self.isrtlmode) px = -px;

      var chk = doScrollRelative(px, py, chkscroll, true);

      if (chk) {
        if (chkscroll) hasparentscrollingphase = true;
      } else {
        hasparentscrollingphase = false;
        e.stopImmediatePropagation();
        return e.preventDefault();
      }
    }

    this.onmousewheel = function(e) {
      if (self.wheelprevented || self.locked) return false;
      if (self.railslocked) {
        self.debounced("checkunlock", self.resize, 250);
        return false;
      }
      if (self.rail.drag) return self.cancelEvent(e);

      if (opt.oneaxismousemode === "auto" && e.deltaX !== 0)
        opt.oneaxismousemode = false; // check two-axis mouse support (not very elegant)

      if (opt.oneaxismousemode && e.deltaX === 0) {
        if (!self.rail.scrollable) {
          if (self.railh && self.railh.scrollable) {
            return self.onmousewheelhr(e);
          } else {
            return true;
          }
        }
      }

      var nw = now();
      var chk = false;
      if (opt.preservenativescrolling && self.checkarea + 600 < nw) {
        self.nativescrollingarea = self.isScrollable(e);
        chk = true;
      }
      self.checkarea = nw;
      if (self.nativescrollingarea) return true; // this isn't my business
      var ret = execScrollWheel(e, false, chk);
      if (ret) self.checkarea = 0;
      return ret;
    };

    this.onmousewheelhr = function(e) {
      if (self.wheelprevented) return;
      if (self.railslocked || !self.railh.scrollable) return true;
      if (self.rail.drag) return self.cancelEvent(e);

      var nw = now();
      var chk = false;
      if (opt.preservenativescrolling && self.checkarea + 600 < nw) {
        self.nativescrollingarea = self.isScrollable(e);
        chk = true;
      }
      self.checkarea = nw;
      if (self.nativescrollingarea) return true; // this is not my business
      if (self.railslocked) return self.cancelEvent(e);

      return execScrollWheel(e, true, chk);
    };

    this.stop = function() {
      self.cancelScroll();
      if (self.scrollmon) self.scrollmon.stop();
      self.cursorfreezed = false;
      self.scroll.y = Math.round(
        self.getScrollTop() * (1 / self.scrollratio.y)
      );
      self.noticeCursor();
      return self;
    };

    this.getTransitionSpeed = function(dif) {
      return (80 + (dif / 72) * opt.scrollspeed) | 0;
    };

    if (!opt.smoothscroll) {
      this.doScrollLeft = function(x, spd) {
        //direct
        var y = self.getScrollTop();
        self.doScrollPos(x, y, spd);
      };
      this.doScrollTop = function(y, spd) {
        //direct
        var x = self.getScrollLeft();
        self.doScrollPos(x, y, spd);
      };
      this.doScrollPos = function(x, y, spd) {
        //direct
        var nx = x > self.page.maxw ? self.page.maxw : x;
        if (nx < 0) nx = 0;
        var ny = y > self.page.maxh ? self.page.maxh : y;
        if (ny < 0) ny = 0;
        self.synched("scroll", function() {
          self.setScrollTop(ny);
          self.setScrollLeft(nx);
        });
      };
      this.cancelScroll = function() {}; // direct
    } else if (
      self.ishwscroll &&
      cap.hastransition &&
      opt.usetransition &&
      !!opt.smoothscroll
    ) {
      var lasttransitionstyle = "";

      this.resetTransition = function() {
        lasttransitionstyle = "";
        self.doc.css(cap.prefixstyle + "transition-duration", "0ms");
      };

      this.prepareTransition = function(dif, istime) {
        var ex = istime ? dif : self.getTransitionSpeed(dif);
        var trans = ex + "ms";
        if (lasttransitionstyle !== trans) {
          lasttransitionstyle = trans;
          self.doc.css(cap.prefixstyle + "transition-duration", trans);
        }
        return ex;
      };

      this.doScrollLeft = function(x, spd) {
        //trans
        var y = self.scrollrunning ? self.newscrolly : self.getScrollTop();
        self.doScrollPos(x, y, spd);
      };

      this.doScrollTop = function(y, spd) {
        //trans
        var x = self.scrollrunning ? self.newscrollx : self.getScrollLeft();
        self.doScrollPos(x, y, spd);
      };

      this.cursorupdate = {
        running: false,
        start: function() {
          var m = this;

          if (m.running) return;
          m.running = true;

          var loop = function() {
            if (m.running) setAnimationFrame(loop);
            self.showCursor(self.getScrollTop(), self.getScrollLeft());
            self.notifyScrollEvent(self.win[0]);
          };

          setAnimationFrame(loop);
        },
        stop: function() {
          this.running = false;
        }
      };

      this.doScrollPos = function(x, y, spd) {
        //trans

        var py = self.getScrollTop();
        var px = self.getScrollLeft();

        if (
          (self.newscrolly - py) * (y - py) < 0 ||
          (self.newscrollx - px) * (x - px) < 0
        )
          self.cancelScroll(); //inverted movement detection

        if (!opt.bouncescroll) {
          if (y < 0) y = 0;
          else if (y > self.page.maxh) y = self.page.maxh;
          if (x < 0) x = 0;
          else if (x > self.page.maxw) x = self.page.maxw;
        } else {
          if (y < 0) y = (y / 2) | 0;
          else if (y > self.page.maxh)
            y = (self.page.maxh + (y - self.page.maxh) / 2) | 0;
          if (x < 0) x = (x / 2) | 0;
          else if (x > self.page.maxw)
            x = (self.page.maxw + (x - self.page.maxw) / 2) | 0;
        }

        if (self.scrollrunning && x == self.newscrollx && y == self.newscrolly)
          return false;

        self.newscrolly = y;
        self.newscrollx = x;

        var top = self.getScrollTop();
        var lft = self.getScrollLeft();

        var dst = {};
        dst.x = x - lft;
        dst.y = y - top;

        var dd = Math.sqrt(dst.x * dst.x + dst.y * dst.y) | 0;

        var ms = self.prepareTransition(dd);

        if (!self.scrollrunning) {
          self.scrollrunning = true;
          self.triggerScrollStart(lft, top, x, y, ms);
          self.cursorupdate.start();
        }

        self.scrollendtrapped = true;

        if (!cap.transitionend) {
          if (self.scrollendtrapped) clearTimeout(self.scrollendtrapped);
          self.scrollendtrapped = setTimeout(self.onScrollTransitionEnd, ms); // simulate transitionend event
        }

        self.setScrollTop(self.newscrolly);
        self.setScrollLeft(self.newscrollx);
      };

      this.cancelScroll = function() {
        if (!self.scrollendtrapped) return true;
        var py = self.getScrollTop();
        var px = self.getScrollLeft();
        self.scrollrunning = false;
        if (!cap.transitionend) clearTimeout(cap.transitionend);
        self.scrollendtrapped = false;
        self.resetTransition();
        self.setScrollTop(py); // fire event onscroll
        if (self.railh) self.setScrollLeft(px);
        if (self.timerscroll && self.timerscroll.tm)
          clearInterval(self.timerscroll.tm);
        self.timerscroll = false;

        self.cursorfreezed = false;

        self.cursorupdate.stop();
        self.showCursor(py, px);
        return self;
      };

      this.onScrollTransitionEnd = function() {
        if (!self.scrollendtrapped) return;

        var py = self.getScrollTop();
        var px = self.getScrollLeft();

        if (py < 0) py = 0;
        else if (py > self.page.maxh) py = self.page.maxh;
        if (px < 0) px = 0;
        else if (px > self.page.maxw) px = self.page.maxw;
        if (py != self.newscrolly || px != self.newscrollx)
          return self.doScrollPos(px, py, opt.snapbackspeed);

        if (self.scrollrunning) self.triggerScrollEnd();
        self.scrollrunning = false;

        self.scrollendtrapped = false;
        self.resetTransition();
        self.timerscroll = false;
        self.setScrollTop(py); // fire event onscroll
        if (self.railh) self.setScrollLeft(px); // fire event onscroll left

        self.cursorupdate.stop();
        self.noticeCursor(false, py, px);

        self.cursorfreezed = false;
      };
    } else {
      this.doScrollLeft = function(x, spd) {
        //no-trans
        var y = self.scrollrunning ? self.newscrolly : self.getScrollTop();
        self.doScrollPos(x, y, spd);
      };

      this.doScrollTop = function(y, spd) {
        //no-trans
        var x = self.scrollrunning ? self.newscrollx : self.getScrollLeft();
        self.doScrollPos(x, y, spd);
      };

      this.doScrollPos = function(x, y, spd) {
        //no-trans

        var py = self.getScrollTop();
        var px = self.getScrollLeft();

        if (
          (self.newscrolly - py) * (y - py) < 0 ||
          (self.newscrollx - px) * (x - px) < 0
        )
          self.cancelScroll(); //inverted movement detection

        var clipped = false;

        if (!self.bouncescroll || !self.rail.visibility) {
          if (y < 0) {
            y = 0;
            clipped = true;
          } else if (y > self.page.maxh) {
            y = self.page.maxh;
            clipped = true;
          }
        }
        if (!self.bouncescroll || !self.railh.visibility) {
          if (x < 0) {
            x = 0;
            clipped = true;
          } else if (x > self.page.maxw) {
            x = self.page.maxw;
            clipped = true;
          }
        }

        if (
          self.scrollrunning &&
          self.newscrolly === y &&
          self.newscrollx === x
        )
          return true;

        self.newscrolly = y;
        self.newscrollx = x;

        self.dst = {};
        self.dst.x = x - px;
        self.dst.y = y - py;
        self.dst.px = px;
        self.dst.py = py;

        var dd =
          Math.sqrt(self.dst.x * self.dst.x + self.dst.y * self.dst.y) | 0;
        var ms = self.getTransitionSpeed(dd);

        self.bzscroll = {};

        var p3 = clipped ? 1 : 0.58;
        self.bzscroll.x = new BezierClass(px, self.newscrollx, ms, 0, 0, p3, 1);
        self.bzscroll.y = new BezierClass(py, self.newscrolly, ms, 0, 0, p3, 1);

        var loopid = now();

        var loop = function() {
          if (!self.scrollrunning) return;
          var x = self.bzscroll.y.getPos();

          self.setScrollLeft(self.bzscroll.x.getNow());
          self.setScrollTop(self.bzscroll.y.getNow());

          if (x <= 1) {
            self.timer = setAnimationFrame(loop);
          } else {
            self.scrollrunning = false;
            self.timer = 0;
            self.triggerScrollEnd();
          }
        };

        if (!self.scrollrunning) {
          self.triggerScrollStart(px, py, x, y, ms);
          self.scrollrunning = true;
          self.timer = setAnimationFrame(loop);
        }
      };

      this.cancelScroll = function() {
        if (self.timer) clearAnimationFrame(self.timer);
        self.timer = 0;
        self.bzscroll = false;
        self.scrollrunning = false;
        return self;
      };
    }

    this.doScrollBy = function(stp, relative) {
      doScrollRelative(0, stp);
    };

    this.doScrollLeftBy = function(stp, relative) {
      doScrollRelative(stp, 0);
    };

    this.doScrollTo = function(pos, relative) {
      var ny = relative ? Math.round(pos * self.scrollratio.y) : pos;
      if (ny < 0) ny = 0;
      else if (ny > self.page.maxh) ny = self.page.maxh;
      self.cursorfreezed = false;
      self.doScrollTop(pos);
    };

    this.checkContentSize = function() {
      var pg = self.getContentSize();
      if (pg.h != self.page.h || pg.w != self.page.w) self.resize(false, pg);
    };

    self.onscroll = function(e) {
      if (self.rail.drag) return;
      if (!self.cursorfreezed) {
        self.synched("scroll", function() {
          self.scroll.y = Math.round(self.getScrollTop() / self.scrollratio.y);
          if (self.railh)
            self.scroll.x = Math.round(
              self.getScrollLeft() / self.scrollratio.x
            );
          self.noticeCursor();
        });
      }
    };
    self.bind(self.docscroll, "scroll", self.onscroll);

    this.doZoomIn = function(e) {
      if (self.zoomactive) return;
      self.zoomactive = true;

      self.zoomrestore = {
        style: {}
      };
      var lst = [
        "position",
        "top",
        "left",
        "zIndex",
        "backgroundColor",
        "marginTop",
        "marginBottom",
        "marginLeft",
        "marginRight"
      ];
      var win = self.win[0].style;
      for (var a in lst) {
        var pp = lst[a];
        self.zoomrestore.style[pp] = win[pp] !== undefined ? win[pp] : "";
      }

      self.zoomrestore.style.width = self.win.css("width");
      self.zoomrestore.style.height = self.win.css("height");

      self.zoomrestore.padding = {
        w: self.win.outerWidth() - self.win.width(),
        h: self.win.outerHeight() - self.win.height()
      };

      if (cap.isios4) {
        self.zoomrestore.scrollTop = $window.scrollTop();
        $window.scrollTop(0);
      }

      self.win.css({
        position: cap.isios4 ? "absolute" : "fixed",
        top: 0,
        left: 0,
        zIndex: globalmaxzindex + 100,
        margin: 0
      });
      var bkg = self.win.css("backgroundColor");
      if (
        "" === bkg ||
        /transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(bkg)
      )
        self.win.css("backgroundColor", "#fff");
      self.rail.css({
        zIndex: globalmaxzindex + 101
      });
      self.zoom.css({
        zIndex: globalmaxzindex + 102
      });
      self.zoom.css("backgroundPosition", "0 -18px");
      self.resizeZoom();

      if (self.onzoomin) self.onzoomin.call(self);

      return self.cancelEvent(e);
    };

    this.doZoomOut = function(e) {
      if (!self.zoomactive) return;
      self.zoomactive = false;

      self.win.css("margin", "");
      self.win.css(self.zoomrestore.style);

      if (cap.isios4) {
        $window.scrollTop(self.zoomrestore.scrollTop);
      }

      self.rail.css({
        "z-index": self.zindex
      });
      self.zoom.css({
        "z-index": self.zindex
      });
      self.zoomrestore = false;
      self.zoom.css("backgroundPosition", "0 0");
      self.onResize();

      if (self.onzoomout) self.onzoomout.call(self);

      return self.cancelEvent(e);
    };

    this.doZoom = function(e) {
      return self.zoomactive ? self.doZoomOut(e) : self.doZoomIn(e);
    };

    this.resizeZoom = function() {
      if (!self.zoomactive) return;

      var py = self.getScrollTop(); //preserve scrolling position
      self.win.css({
        width: $window.width() - self.zoomrestore.padding.w + "px",
        height: $window.height() - self.zoomrestore.padding.h + "px"
      });
      self.onResize();

      self.setScrollTop(Math.min(self.page.maxh, py));
    };

    this.init();

    $.nicescroll.push(this);
  };

  // Inspired by the work of Kin Blas
  // http://webpro.host.adobe.com/people/jblas/momentum/includes/jquery.momentum.0.7.js
  var ScrollMomentumClass2D = function(nc) {
    var self = this;
    this.nc = nc;

    this.lastx = 0;
    this.lasty = 0;
    this.speedx = 0;
    this.speedy = 0;
    this.lasttime = 0;
    this.steptime = 0;
    this.snapx = false;
    this.snapy = false;
    this.demulx = 0;
    this.demuly = 0;

    this.lastscrollx = -1;
    this.lastscrolly = -1;

    this.chkx = 0;
    this.chky = 0;

    this.timer = 0;

    this.reset = function(px, py) {
      self.stop();
      self.steptime = 0;
      self.lasttime = now();
      self.speedx = 0;
      self.speedy = 0;
      self.lastx = px;
      self.lasty = py;
      self.lastscrollx = -1;
      self.lastscrolly = -1;
    };

    this.update = function(px, py) {
      var tm = now();
      self.steptime = tm - self.lasttime;
      self.lasttime = tm;
      var dy = py - self.lasty;
      var dx = px - self.lastx;
      var sy = self.nc.getScrollTop();
      var sx = self.nc.getScrollLeft();
      var newy = sy + dy;
      var newx = sx + dx;
      self.snapx = newx < 0 || newx > self.nc.page.maxw;
      self.snapy = newy < 0 || newy > self.nc.page.maxh;
      self.speedx = dx;
      self.speedy = dy;
      self.lastx = px;
      self.lasty = py;
    };

    this.stop = function() {
      self.nc.unsynched("domomentum2d");
      if (self.timer) clearTimeout(self.timer);
      self.timer = 0;
      self.lastscrollx = -1;
      self.lastscrolly = -1;
    };

    this.doSnapy = function(nx, ny) {
      var snap = false;

      if (ny < 0) {
        ny = 0;
        snap = true;
      } else if (ny > self.nc.page.maxh) {
        ny = self.nc.page.maxh;
        snap = true;
      }

      if (nx < 0) {
        nx = 0;
        snap = true;
      } else if (nx > self.nc.page.maxw) {
        nx = self.nc.page.maxw;
        snap = true;
      }

      snap
        ? self.nc.doScrollPos(nx, ny, self.nc.opt.snapbackspeed)
        : self.nc.triggerScrollEnd();
    };

    this.doMomentum = function(gp) {
      var t = now();
      var l = gp ? t + gp : self.lasttime;

      var sl = self.nc.getScrollLeft();
      var st = self.nc.getScrollTop();

      var pageh = self.nc.page.maxh;
      var pagew = self.nc.page.maxw;

      self.speedx = pagew > 0 ? Math.min(60, self.speedx) : 0;
      self.speedy = pageh > 0 ? Math.min(60, self.speedy) : 0;

      var chk = l && t - l <= 60;

      if (st < 0 || st > pageh || sl < 0 || sl > pagew) chk = false;

      var sy = self.speedy && chk ? self.speedy : false;
      var sx = self.speedx && chk ? self.speedx : false;

      if (sy || sx) {
        var tm = Math.max(16, self.steptime); //timeout granularity

        if (tm > 50) {
          // do smooth
          var xm = tm / 50;
          self.speedx *= xm;
          self.speedy *= xm;
          tm = 50;
        }

        self.demulxy = 0;

        self.lastscrollx = self.nc.getScrollLeft();
        self.chkx = self.lastscrollx;
        self.lastscrolly = self.nc.getScrollTop();
        self.chky = self.lastscrolly;

        var nx = self.lastscrollx;
        var ny = self.lastscrolly;

        var onscroll = function() {
          var df = now() - t > 600 ? 0.04 : 0.02;

          if (self.speedx) {
            nx = Math.floor(
              self.lastscrollx - self.speedx * (1 - self.demulxy)
            );
            self.lastscrollx = nx;
            if (nx < 0 || nx > pagew) df = 0.1;
          }

          if (self.speedy) {
            ny = Math.floor(
              self.lastscrolly - self.speedy * (1 - self.demulxy)
            );
            self.lastscrolly = ny;
            if (ny < 0 || ny > pageh) df = 0.1;
          }

          self.demulxy = Math.min(1, self.demulxy + df);

          self.nc.synched("domomentum2d", function() {
            if (self.speedx) {
              var scx = self.nc.getScrollLeft();
              //              if (scx != self.chkx) self.stop();
              self.chkx = nx;
              self.nc.setScrollLeft(nx);
            }

            if (self.speedy) {
              var scy = self.nc.getScrollTop();
              //              if (scy != self.chky) self.stop();
              self.chky = ny;
              self.nc.setScrollTop(ny);
            }

            if (!self.timer) {
              self.nc.hideCursor();
              self.doSnapy(nx, ny);
            }
          });

          if (self.demulxy < 1) {
            self.timer = setTimeout(onscroll, tm);
          } else {
            self.stop();
            self.nc.hideCursor();
            self.doSnapy(nx, ny);
          }
        };

        onscroll();
      } else {
        self.doSnapy(self.nc.getScrollLeft(), self.nc.getScrollTop());
      }
    };
  };

  // override jQuery scrollTop
  var _scrollTop = jQuery.fn.scrollTop; // preserve original function

  jQuery.cssHooks.pageYOffset = {
    get: function(elem, computed, extra) {
      var nice = $.data(elem, "__nicescroll") || false;
      return nice && nice.ishwscroll
        ? nice.getScrollTop()
        : _scrollTop.call(elem);
    },
    set: function(elem, value) {
      var nice = $.data(elem, "__nicescroll") || false;
      nice && nice.ishwscroll
        ? nice.setScrollTop(parseInt(value))
        : _scrollTop.call(elem, value);
      return this;
    }
  };

  jQuery.fn.scrollTop = function(value) {
    if (value === undefined) {
      var nice = this[0] ? $.data(this[0], "__nicescroll") || false : false;
      return nice && nice.ishwscroll
        ? nice.getScrollTop()
        : _scrollTop.call(this);
    } else {
      return this.each(function() {
        var nice = $.data(this, "__nicescroll") || false;
        nice && nice.ishwscroll
          ? nice.setScrollTop(parseInt(value))
          : _scrollTop.call($(this), value);
      });
    }
  };

  // override jQuery scrollLeft
  var _scrollLeft = jQuery.fn.scrollLeft; // preserve original function

  $.cssHooks.pageXOffset = {
    get: function(elem, computed, extra) {
      var nice = $.data(elem, "__nicescroll") || false;
      return nice && nice.ishwscroll
        ? nice.getScrollLeft()
        : _scrollLeft.call(elem);
    },
    set: function(elem, value) {
      var nice = $.data(elem, "__nicescroll") || false;
      nice && nice.ishwscroll
        ? nice.setScrollLeft(parseInt(value))
        : _scrollLeft.call(elem, value);
      return this;
    }
  };

  jQuery.fn.scrollLeft = function(value) {
    if (value === undefined) {
      var nice = this[0] ? $.data(this[0], "__nicescroll") || false : false;
      return nice && nice.ishwscroll
        ? nice.getScrollLeft()
        : _scrollLeft.call(this);
    } else {
      return this.each(function() {
        var nice = $.data(this, "__nicescroll") || false;
        nice && nice.ishwscroll
          ? nice.setScrollLeft(parseInt(value))
          : _scrollLeft.call($(this), value);
      });
    }
  };

  var NiceScrollArray = function(doms) {
    var self = this;
    this.length = 0;
    this.name = "nicescrollarray";

    this.each = function(fn) {
      $.each(self, fn);
      return self;
    };

    this.push = function(nice) {
      self[self.length] = nice;
      self.length++;
    };

    this.eq = function(idx) {
      return self[idx];
    };

    if (doms) {
      for (var a = 0; a < doms.length; a++) {
        var nice = $.data(doms[a], "__nicescroll") || false;
        if (nice) {
          this[this.length] = nice;
          this.length++;
        }
      }
    }

    return this;
  };

  function mplex(el, lst, fn) {
    for (var a = 0, l = lst.length; a < l; a++) fn(el, lst[a]);
  }
  mplex(
    NiceScrollArray.prototype,
    [
      "show",
      "hide",
      "toggle",
      "onResize",
      "resize",
      "remove",
      "stop",
      "doScrollPos"
    ],
    function(e, n) {
      e[n] = function() {
        var args = arguments;
        return this.each(function() {
          this[n].apply(this, args);
        });
      };
    }
  );

  jQuery.fn.getNiceScroll = function(index) {
    if (index === undefined) {
      return new NiceScrollArray(this);
    } else {
      return (this[index] && $.data(this[index], "__nicescroll")) || false;
    }
  };

  var pseudos = jQuery.expr.pseudos || jQuery.expr[":"]; // jQuery 3 migration
  pseudos.nicescroll = function(a) {
    return $.data(a, "__nicescroll") !== undefined;
  };

  $.fn.niceScroll = function(wrapper, _opt) {
    if (
      _opt === undefined &&
      typeof wrapper == "object" &&
      !("jquery" in wrapper)
    ) {
      _opt = wrapper;
      wrapper = false;
    }

    var ret = new NiceScrollArray();

    this.each(function() {
      var $this = $(this);

      var opt = $.extend({}, _opt); // cloning

      if (wrapper || false) {
        var wrp = $(wrapper);
        opt.doc = wrp.length > 1 ? $(wrapper, $this) : wrp;
        opt.win = $this;
      }
      var docundef = !("doc" in opt);
      if (!docundef && !("win" in opt)) opt.win = $this;

      var nice = $this.data("__nicescroll") || false;
      if (!nice) {
        opt.doc = opt.doc || $this;
        nice = new NiceScrollClass(opt, $this);
        $this.data("__nicescroll", nice);
      }
      ret.push(nice);
    });

    return ret.length === 1 ? ret[0] : ret;
  };

  _win.NiceScroll = {
    getjQuery: function() {
      return jQuery;
    }
  };

  if (!$.nicescroll) {
    $.nicescroll = new NiceScrollArray();
    $.nicescroll.options = _globaloptions;
  }
});
/* --- ORGANIC TABS --- */

// --- MODIFIED
// https://github.com/CSS-Tricks/jQuery-Organic-Tabs
(function($) {
  "use strict";
  $.organicTabs = function(el, options) {
    var base = this;
    base.$el = $(el);
    base.$nav = base.$el.find(".tabs__nav");
    base.init = function() {
      base.options = $.extend({}, $.organicTabs.defaultOptions, options);
      var $allListWrap = base.$el.find(".tabs__content"),
        curList = base.$el
          .find("a.current")
          .attr("href")
          .substring(1);
      $allListWrap.height(base.$el.find("#" + curList).height());
      base.$nav.find("li > a").click(function(event) {
        var curList = base.$el
            .find("a.current")
            .attr("href")
            .substring(1),
          $newList = $(this),
          listID = $newList.attr("href").substring(1);
        if (listID != curList && base.$el.find(":animated").length == 0) {
          base.$el.find("#" + curList).css({
            opacity: 0,
            "z-index": 10,
            "pointer-events": "none"
          });
          var newHeight = base.$el.find("#" + listID).height();
          $allListWrap.css({
            height: newHeight
          });
          setTimeout(function() {
            base.$el.find("#" + curList);
            base.$el.find("#" + listID).css({
              opacity: 1,
              "z-index": 100,
              "pointer-events": "auto"
            });
            base.$el.find(".tabs__nav li a").removeClass("current");
            $newList.addClass("current");
          }, 250);
        }
        event.preventDefault();
      });
    };
    base.init();
  };
  $.organicTabs.defaultOptions = {
    speed: 300
  };
  $.fn.organicTabs = function(options) {
    return this.each(function() {
      new $.organicTabs(this, options);
    });
  };
})(jQuery);
/**
 * requestAnimationFrame polyfill by Erik Möller.
 * Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
 *
 * MIT license
 */
if (!Date.now)
  Date.now = function() {
    return new Date().getTime();
  };

(function() {
  "use strict";

  var vendors = ["webkit", "moz"];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vp + "CancelAnimationFrame"] ||
      window[vp + "CancelRequestAnimationFrame"];
  }
  if (
    /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
    !window.requestAnimationFrame ||
    !window.cancelAnimationFrame
  ) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback) {
      var now = Date.now();
      var nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function() {
        callback((lastTime = nextTime));
      }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
})();
// Snap.svg 0.5.1
//
// Copyright (c) 2013 – 2017 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// build: 2017-02-07

// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.5.0 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function(glob) {
  var version = "0.5.0",
    has = "hasOwnProperty",
    separator = /[\.\/]/,
    comaseparator = /\s*,\s*/,
    wildcard = "*",
    fun = function() {},
    numsort = function(a, b) {
      return a - b;
    },
    current_event,
    stop,
    events = { n: {} },
    firstDefined = function() {
      for (var i = 0, ii = this.length; i < ii; i++) {
        if (typeof this[i] != "undefined") {
          return this[i];
        }
      }
    },
    lastDefined = function() {
      var i = this.length;
      while (--i) {
        if (typeof this[i] != "undefined") {
          return this[i];
        }
      }
    },
    objtos = Object.prototype.toString,
    Str = String,
    isArray =
      Array.isArray ||
      function(ar) {
        return ar instanceof Array || objtos.call(ar) == "[object Array]";
      };
  /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners. Array has two methods `.firstDefined()` and `.lastDefined()` to get first or last not `undefined` value.
    \*/
  eve = function(name, scope) {
    var e = events,
      oldstop = stop,
      args = Array.prototype.slice.call(arguments, 2),
      listeners = eve.listeners(name),
      z = 0,
      f = false,
      l,
      indexed = [],
      queue = {},
      out = [],
      ce = current_event,
      errors = [];
    out.firstDefined = firstDefined;
    out.lastDefined = lastDefined;
    current_event = name;
    stop = 0;
    for (var i = 0, ii = listeners.length; i < ii; i++)
      if ("zIndex" in listeners[i]) {
        indexed.push(listeners[i].zIndex);
        if (listeners[i].zIndex < 0) {
          queue[listeners[i].zIndex] = listeners[i];
        }
      }
    indexed.sort(numsort);
    while (indexed[z] < 0) {
      l = queue[indexed[z++]];
      out.push(l.apply(scope, args));
      if (stop) {
        stop = oldstop;
        return out;
      }
    }
    for (i = 0; i < ii; i++) {
      l = listeners[i];
      if ("zIndex" in l) {
        if (l.zIndex == indexed[z]) {
          out.push(l.apply(scope, args));
          if (stop) {
            break;
          }
          do {
            z++;
            l = queue[indexed[z]];
            l && out.push(l.apply(scope, args));
            if (stop) {
              break;
            }
          } while (l);
        } else {
          queue[l.zIndex] = l;
        }
      } else {
        out.push(l.apply(scope, args));
        if (stop) {
          break;
        }
      }
    }
    stop = oldstop;
    current_event = ce;
    return out;
  };
  // Undocumented. Debug only.
  eve._events = events;
  /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
    \*/
  eve.listeners = function(name) {
    var names = isArray(name) ? name : name.split(separator),
      e = events,
      item,
      items,
      k,
      i,
      ii,
      j,
      jj,
      nes,
      es = [e],
      out = [];
    for (i = 0, ii = names.length; i < ii; i++) {
      nes = [];
      for (j = 0, jj = es.length; j < jj; j++) {
        e = es[j].n;
        items = [e[names[i]], e[wildcard]];
        k = 2;
        while (k--) {
          item = items[k];
          if (item) {
            nes.push(item);
            out = out.concat(item.f || []);
          }
        }
      }
      es = nes;
    }
    return out;
  };
  /*\
     * eve.separator
     [ method ]

     * If for some reasons you don’t like default separators (`.` or `/`) you can specify yours
     * here. Be aware that if you pass a string longer than one character it will be treated as
     * a list of characters.

     - separator (string) new separator. Empty string resets to default: `.` or `/`.
    \*/
  eve.separator = function(sep) {
    if (sep) {
      sep = Str(sep).replace(/(?=[\.\^\]\[\-])/g, "\\");
      sep = "[" + sep + "]";
      separator = new RegExp(sep);
    } else {
      separator = /[\.\/]/;
    }
  };
  /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     - name (array) if you don’t want to use separators, you can use array of strings
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment.
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt` function will be called before `eatIt`.
     *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
  eve.on = function(name, f) {
    if (typeof f != "function") {
      return function() {};
    }
    var names = isArray(name)
      ? isArray(name[0])
        ? name
        : [name]
      : Str(name).split(comaseparator);
    for (var i = 0, ii = names.length; i < ii; i++) {
      (function(name) {
        var names = isArray(name) ? name : Str(name).split(separator),
          e = events,
          exist;
        for (var i = 0, ii = names.length; i < ii; i++) {
          e = e.n;
          e =
            (e.hasOwnProperty(names[i]) && e[names[i]]) ||
            (e[names[i]] = { n: {} });
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++)
          if (e.f[i] == f) {
            exist = true;
            break;
          }
        !exist && e.f.push(f);
      })(names[i]);
    }
    return function(zIndex) {
      if (+zIndex == +zIndex) {
        f.zIndex = +zIndex;
      }
    };
  };
  /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
     * Arguments that will be passed to the result function will be also
     * concated to the list of final arguments.
     | el.onclick = eve.f("click", 1, 2);
     | eve.on("click", function (a, b, c) {
     |     console.log(a, b, c); // 1, 2, [event object]
     | });
     > Arguments
     - event (string) event name
     - varargs (…) and any other arguments
     = (function) possible event handler function
    \*/
  eve.f = function(event) {
    var attrs = [].slice.call(arguments, 1);
    return function() {
      eve.apply(
        null,
        [event, null].concat(attrs).concat([].slice.call(arguments, 0))
      );
    };
  };
  /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
  eve.stop = function() {
    stop = 1;
  };
  /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
  eve.nt = function(subname) {
    var cur = isArray(current_event) ? current_event.join(".") : current_event;
    if (subname) {
      return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(cur);
    }
    return cur;
  };
  /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
    \*/
  eve.nts = function() {
    return isArray(current_event)
      ? current_event
      : current_event.split(separator);
  };
  /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
     * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
  /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
    \*/
  eve.off = eve.unbind = function(name, f) {
    if (!name) {
      eve._events = events = { n: {} };
      return;
    }
    var names = isArray(name)
      ? isArray(name[0])
        ? name
        : [name]
      : Str(name).split(comaseparator);
    if (names.length > 1) {
      for (var i = 0, ii = names.length; i < ii; i++) {
        eve.off(names[i], f);
      }
      return;
    }
    names = isArray(name) ? name : Str(name).split(separator);
    var e,
      key,
      splice,
      i,
      ii,
      j,
      jj,
      cur = [events],
      inodes = [];
    for (i = 0, ii = names.length; i < ii; i++) {
      for (j = 0; j < cur.length; j += splice.length - 2) {
        splice = [j, 1];
        e = cur[j].n;
        if (names[i] != wildcard) {
          if (e[names[i]]) {
            splice.push(e[names[i]]);
            inodes.unshift({
              n: e,
              name: names[i]
            });
          }
        } else {
          for (key in e)
            if (e[has](key)) {
              splice.push(e[key]);
              inodes.unshift({
                n: e,
                name: key
              });
            }
        }
        cur.splice.apply(cur, splice);
      }
    }
    for (i = 0, ii = cur.length; i < ii; i++) {
      e = cur[i];
      while (e.n) {
        if (f) {
          if (e.f) {
            for (j = 0, jj = e.f.length; j < jj; j++)
              if (e.f[j] == f) {
                e.f.splice(j, 1);
                break;
              }
            !e.f.length && delete e.f;
          }
          for (key in e.n)
            if (e.n[has](key) && e.n[key].f) {
              var funcs = e.n[key].f;
              for (j = 0, jj = funcs.length; j < jj; j++)
                if (funcs[j] == f) {
                  funcs.splice(j, 1);
                  break;
                }
              !funcs.length && delete e.n[key].f;
            }
        } else {
          delete e.f;
          for (key in e.n)
            if (e.n[has](key) && e.n[key].f) {
              delete e.n[key].f;
            }
        }
        e = e.n;
      }
    }
    // prune inner nodes in path
    prune: for (i = 0, ii = inodes.length; i < ii; i++) {
      e = inodes[i];
      for (key in e.n[e.name].f) {
        // not empty (has listeners)
        continue prune;
      }
      for (key in e.n[e.name].n) {
        // not empty (has children)
        continue prune;
      }
      // is empty
      delete e.n[e.name];
    }
  };
  /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
  eve.once = function(name, f) {
    var f2 = function() {
      eve.off(name, f2);
      return f.apply(this, arguments);
    };
    return eve.on(name, f2);
  };
  /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
  eve.version = version;
  eve.toString = function() {
    return "You are running Eve " + version;
  };
  typeof module != "undefined" && module.exports
    ? (module.exports = eve)
    : typeof define === "function" && define.amd
    ? define("eve", [], function() {
        return eve;
      })
    : (glob.eve = eve);
})(this);

(function(glob, factory) {
  // AMD support
  if (typeof define == "function" && define.amd) {
    // Define as an anonymous module
    define(["eve"], function(eve) {
      return factory(glob, eve);
    });
  } else if (typeof exports != "undefined") {
    // Next for Node.js or CommonJS
    var eve = require("eve");
    module.exports = factory(glob, eve);
  } else {
    // Browser globals (glob is window)
    // Snap adds itself to window
    factory(glob, glob.eve);
  }
})(window || this, function(window, eve) {
  // Copyright (c) 2017 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  var mina = (function(eve) {
    var animations = {},
      requestAnimFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
          setTimeout(callback, 16, new Date().getTime());
          return true;
        },
      requestID,
      isArray =
        Array.isArray ||
        function(a) {
          return (
            a instanceof Array ||
            Object.prototype.toString.call(a) == "[object Array]"
          );
        },
      idgen = 0,
      idprefix = "M" + (+new Date()).toString(36),
      ID = function() {
        return idprefix + (idgen++).toString(36);
      },
      diff = function(a, b, A, B) {
        if (isArray(a)) {
          res = [];
          for (var i = 0, ii = a.length; i < ii; i++) {
            res[i] = diff(a[i], b, A[i], B);
          }
          return res;
        }
        var dif = (A - a) / (B - b);
        return function(bb) {
          return a + dif * (bb - b);
        };
      },
      timer =
        Date.now ||
        function() {
          return +new Date();
        },
      sta = function(val) {
        var a = this;
        if (val == null) {
          return a.s;
        }
        var ds = a.s - val;
        a.b += a.dur * ds;
        a.B += a.dur * ds;
        a.s = val;
      },
      speed = function(val) {
        var a = this;
        if (val == null) {
          return a.spd;
        }
        a.spd = val;
      },
      duration = function(val) {
        var a = this;
        if (val == null) {
          return a.dur;
        }
        a.s = (a.s * val) / a.dur;
        a.dur = val;
      },
      stopit = function() {
        var a = this;
        delete animations[a.id];
        a.update();
        eve("mina.stop." + a.id, a);
      },
      pause = function() {
        var a = this;
        if (a.pdif) {
          return;
        }
        delete animations[a.id];
        a.update();
        a.pdif = a.get() - a.b;
      },
      resume = function() {
        var a = this;
        if (!a.pdif) {
          return;
        }
        a.b = a.get() - a.pdif;
        delete a.pdif;
        animations[a.id] = a;
        frame();
      },
      update = function() {
        var a = this,
          res;
        if (isArray(a.start)) {
          res = [];
          for (var j = 0, jj = a.start.length; j < jj; j++) {
            res[j] = +a.start[j] + (a.end[j] - a.start[j]) * a.easing(a.s);
          }
        } else {
          res = +a.start + (a.end - a.start) * a.easing(a.s);
        }
        a.set(res);
      },
      frame = function(timeStamp) {
        // Manual invokation?
        if (!timeStamp) {
          // Frame loop stopped?
          if (!requestID) {
            // Start frame loop...
            requestID = requestAnimFrame(frame);
          }
          return;
        }
        var len = 0;
        for (var i in animations)
          if (animations.hasOwnProperty(i)) {
            var a = animations[i],
              b = a.get(),
              res;
            len++;
            a.s = (b - a.b) / (a.dur / a.spd);
            if (a.s >= 1) {
              delete animations[i];
              a.s = 1;
              len--;
              (function(a) {
                setTimeout(function() {
                  eve("mina.finish." + a.id, a);
                });
              })(a);
            }
            a.update();
          }
        requestID = len ? requestAnimFrame(frame) : false;
      },
      /*\
     * mina
     [ method ]
     **
     * Generic animation of numbers
     **
     - a (number) start _slave_ number
     - A (number) end _slave_ number
     - b (number) start _master_ number (start time in general case)
     - B (number) end _master_ number (end time in general case)
     - get (function) getter of _master_ number (see @mina.time)
     - set (function) setter of _slave_ number
     - easing (function) #optional easing function, default is @mina.linear
     = (object) animation descriptor
     o {
     o         id (string) animation id,
     o         start (number) start _slave_ number,
     o         end (number) end _slave_ number,
     o         b (number) start _master_ number,
     o         s (number) animation status (0..1),
     o         dur (number) animation duration,
     o         spd (number) animation speed,
     o         get (function) getter of _master_ number (see @mina.time),
     o         set (function) setter of _slave_ number,
     o         easing (function) easing function, default is @mina.linear,
     o         status (function) status getter/setter,
     o         speed (function) speed getter/setter,
     o         duration (function) duration getter/setter,
     o         stop (function) animation stopper
     o         pause (function) pauses the animation
     o         resume (function) resumes the animation
     o         update (function) calles setter with the right value of the animation
     o }
    \*/
      mina = function(a, A, b, B, get, set, easing) {
        var anim = {
          id: ID(),
          start: a,
          end: A,
          b: b,
          s: 0,
          dur: B - b,
          spd: 1,
          get: get,
          set: set,
          easing: easing || mina.linear,
          status: sta,
          speed: speed,
          duration: duration,
          stop: stopit,
          pause: pause,
          resume: resume,
          update: update
        };
        animations[anim.id] = anim;
        var len = 0,
          i;
        for (i in animations)
          if (animations.hasOwnProperty(i)) {
            len++;
            if (len == 2) {
              break;
            }
          }
        len == 1 && frame();
        return anim;
      };
    /*\
     * mina.time
     [ method ]
     **
     * Returns the current time. Equivalent to:
     | function () {
     |     return (new Date).getTime();
     | }
    \*/
    mina.time = timer;
    /*\
     * mina.getById
     [ method ]
     **
     * Returns an animation by its id
     - id (string) animation's id
     = (object) See @mina
    \*/
    mina.getById = function(id) {
      return animations[id] || null;
    };

    /*\
     * mina.linear
     [ method ]
     **
     * Default linear easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.linear = function(n) {
      return n;
    };
    /*\
     * mina.easeout
     [ method ]
     **
     * Easeout easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.easeout = function(n) {
      return Math.pow(n, 1.7);
    };
    /*\
     * mina.easein
     [ method ]
     **
     * Easein easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.easein = function(n) {
      return Math.pow(n, 0.48);
    };
    /*\
     * mina.easeinout
     [ method ]
     **
     * Easeinout easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.easeinout = function(n) {
      if (n == 1) {
        return 1;
      }
      if (n == 0) {
        return 0;
      }
      var q = 0.48 - n / 1.04,
        Q = Math.sqrt(0.1734 + q * q),
        x = Q - q,
        X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1),
        y = -Q - q,
        Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1),
        t = X + Y + 0.5;
      return (1 - t) * 3 * t * t + t * t * t;
    };
    /*\
     * mina.backin
     [ method ]
     **
     * Backin easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.backin = function(n) {
      if (n == 1) {
        return 1;
      }
      var s = 1.70158;
      return n * n * ((s + 1) * n - s);
    };
    /*\
     * mina.backout
     [ method ]
     **
     * Backout easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.backout = function(n) {
      if (n == 0) {
        return 0;
      }
      n = n - 1;
      var s = 1.70158;
      return n * n * ((s + 1) * n + s) + 1;
    };
    /*\
     * mina.elastic
     [ method ]
     **
     * Elastic easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.elastic = function(n) {
      if (n == !!n) {
        return n;
      }
      return (
        Math.pow(2, -10 * n) * Math.sin(((n - 0.075) * (2 * Math.PI)) / 0.3) + 1
      );
    };
    /*\
     * mina.bounce
     [ method ]
     **
     * Bounce easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/
    mina.bounce = function(n) {
      var s = 7.5625,
        p = 2.75,
        l;
      if (n < 1 / p) {
        l = s * n * n;
      } else {
        if (n < 2 / p) {
          n -= 1.5 / p;
          l = s * n * n + 0.75;
        } else {
          if (n < 2.5 / p) {
            n -= 2.25 / p;
            l = s * n * n + 0.9375;
          } else {
            n -= 2.625 / p;
            l = s * n * n + 0.984375;
          }
        }
      }
      return l;
    };
    window.mina = mina;
    return mina;
  })(typeof eve == "undefined" ? function() {} : eve);

  // Copyright (c) 2013 - 2017 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  var Snap = (function(root) {
    Snap.version = "0.5.1";
    /*\
 * Snap
 [ method ]
 **
 * Creates a drawing surface or wraps existing SVG element.
 **
 - width (number|string) width of surface
 - height (number|string) height of surface
 * or
 - DOM (SVGElement) element to be wrapped into Snap structure
 * or
 - array (array) array of elements (will return set of elements)
 * or
 - query (string) CSS query selector
 = (object) @Element
\*/
    function Snap(w, h) {
      if (w) {
        if (w.nodeType) {
          return wrap(w);
        }
        if (is(w, "array") && Snap.set) {
          return Snap.set.apply(Snap, w);
        }
        if (w instanceof Element) {
          return w;
        }
        if (h == null) {
          try {
            w = glob.doc.querySelector(String(w));
            return wrap(w);
          } catch (e) {
            return null;
          }
        }
      }
      w = w == null ? "100%" : w;
      h = h == null ? "100%" : h;
      return new Paper(w, h);
    }
    Snap.toString = function() {
      return "Snap v" + this.version;
    };
    Snap._ = {};
    var glob = {
      win: root.window,
      doc: root.window.document
    };
    Snap._.glob = glob;
    var has = "hasOwnProperty",
      Str = String,
      toFloat = parseFloat,
      toInt = parseInt,
      math = Math,
      mmax = math.max,
      mmin = math.min,
      abs = math.abs,
      pow = math.pow,
      PI = math.PI,
      round = math.round,
      E = "",
      S = " ",
      objectToString = Object.prototype.toString,
      ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
      colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i,
      bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
      separator = (Snap._.separator = /[,\s]+/),
      whitespace = /[\s]/g,
      commaSpaces = /[\s]*,[\s]*/,
      hsrg = { hs: 1, rg: 1 },
      pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/gi,
      tCommand = /([rstm])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/gi,
      pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\s]*,?[\s]*/gi,
      idgen = 0,
      idprefix = "S" + (+new Date()).toString(36),
      ID = function(el) {
        return (
          (el && el.type ? el.type : E) + idprefix + (idgen++).toString(36)
        );
      },
      xlink = "http://www.w3.org/1999/xlink",
      xmlns = "http://www.w3.org/2000/svg",
      hub = {},
      /*\
     * Snap.url
     [ method ]
     **
     * Wraps path into `"url('<path>')"`.
     - value (string) path
     = (string) wrapped path
    \*/
      URL = (Snap.url = function(url) {
        return "url('#" + url + "')";
      });

    function $(el, attr) {
      if (attr) {
        if (el == "#text") {
          el = glob.doc.createTextNode(attr.text || attr["#text"] || "");
        }
        if (el == "#comment") {
          el = glob.doc.createComment(attr.text || attr["#text"] || "");
        }
        if (typeof el == "string") {
          el = $(el);
        }
        if (typeof attr == "string") {
          if (el.nodeType == 1) {
            if (attr.substring(0, 6) == "xlink:") {
              return el.getAttributeNS(xlink, attr.substring(6));
            }
            if (attr.substring(0, 4) == "xml:") {
              return el.getAttributeNS(xmlns, attr.substring(4));
            }
            return el.getAttribute(attr);
          } else if (attr == "text") {
            return el.nodeValue;
          } else {
            return null;
          }
        }
        if (el.nodeType == 1) {
          for (var key in attr)
            if (attr[has](key)) {
              var val = Str(attr[key]);
              if (val) {
                if (key.substring(0, 6) == "xlink:") {
                  el.setAttributeNS(xlink, key.substring(6), val);
                } else if (key.substring(0, 4) == "xml:") {
                  el.setAttributeNS(xmlns, key.substring(4), val);
                } else {
                  el.setAttribute(key, val);
                }
              } else {
                el.removeAttribute(key);
              }
            }
        } else if ("text" in attr) {
          el.nodeValue = attr.text;
        }
      } else {
        el = glob.doc.createElementNS(xmlns, el);
      }
      return el;
    }
    Snap._.$ = $;
    Snap._.id = ID;
    function getAttrs(el) {
      var attrs = el.attributes,
        name,
        out = {};
      for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].namespaceURI == xlink) {
          name = "xlink:";
        } else {
          name = "";
        }
        name += attrs[i].name;
        out[name] = attrs[i].textContent;
      }
      return out;
    }
    function is(o, type) {
      type = Str.prototype.toLowerCase.call(type);
      if (type == "finite") {
        return isFinite(o);
      }
      if (
        type == "array" &&
        (o instanceof Array || (Array.isArray && Array.isArray(o)))
      ) {
        return true;
      }
      return (
        (type == "null" && o === null) ||
        (type == typeof o && o !== null) ||
        (type == "object" && o === Object(o)) ||
        objectToString
          .call(o)
          .slice(8, -1)
          .toLowerCase() == type
      );
    }
    /*\
 * Snap.format
 [ method ]
 **
 * Replaces construction of type `{<name>}` to the corresponding argument
 **
 - token (string) string to format
 - json (object) object which properties are used as a replacement
 = (string) formatted string
 > Usage
 | // this draws a rectangular shape equivalent to "M10,20h40v50h-40z"
 | paper.path(Snap.format("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
 |     x: 10,
 |     y: 20,
 |     dim: {
 |         width: 40,
 |         height: 50,
 |         "negative width": -40
 |     }
 | }));
\*/
    Snap.format = (function() {
      var tokenRegex = /\{([^\}]+)\}/g,
        objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
        replacer = function(all, key, obj) {
          var res = obj;
          key.replace(objNotationRegex, function(
            all,
            name,
            quote,
            quotedName,
            isFunc
          ) {
            name = name || quotedName;
            if (res) {
              if (name in res) {
                res = res[name];
              }
              typeof res == "function" && isFunc && (res = res());
            }
          });
          res = (res == null || res == obj ? all : res) + "";
          return res;
        };
      return function(str, obj) {
        return Str(str).replace(tokenRegex, function(all, key) {
          return replacer(all, key, obj);
        });
      };
    })();
    function clone(obj) {
      if (typeof obj == "function" || Object(obj) !== obj) {
        return obj;
      }
      var res = new obj.constructor();
      for (var key in obj)
        if (obj[has](key)) {
          res[key] = clone(obj[key]);
        }
      return res;
    }
    Snap._.clone = clone;
    function repush(array, item) {
      for (var i = 0, ii = array.length; i < ii; i++)
        if (array[i] === item) {
          return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
      function newf() {
        var arg = Array.prototype.slice.call(arguments, 0),
          args = arg.join("\u2400"),
          cache = (newf.cache = newf.cache || {}),
          count = (newf.count = newf.count || []);
        if (cache[has](args)) {
          repush(count, args);
          return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        count.length >= 1e3 && delete cache[count.shift()];
        count.push(args);
        cache[args] = f.apply(scope, arg);
        return postprocessor ? postprocessor(cache[args]) : cache[args];
      }
      return newf;
    }
    Snap._.cacher = cacher;
    function angle(x1, y1, x2, y2, x3, y3) {
      if (x3 == null) {
        var x = x1 - x2,
          y = y1 - y2;
        if (!x && !y) {
          return 0;
        }
        return (180 + (math.atan2(-y, -x) * 180) / PI + 360) % 360;
      } else {
        return angle(x1, y1, x3, y3) - angle(x2, y2, x3, y3);
      }
    }
    function rad(deg) {
      return ((deg % 360) * PI) / 180;
    }
    function deg(rad) {
      return ((rad * 180) / PI) % 360;
    }
    function x_y() {
      return this.x + S + this.y;
    }
    function x_y_w_h() {
      return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }

    /*\
 * Snap.rad
 [ method ]
 **
 * Transform angle to radians
 - deg (number) angle in degrees
 = (number) angle in radians
\*/
    Snap.rad = rad;
    /*\
 * Snap.deg
 [ method ]
 **
 * Transform angle to degrees
 - rad (number) angle in radians
 = (number) angle in degrees
\*/
    Snap.deg = deg;
    /*\
 * Snap.sin
 [ method ]
 **
 * Equivalent to `Math.sin()` only works with degrees, not radians.
 - angle (number) angle in degrees
 = (number) sin
\*/
    Snap.sin = function(angle) {
      return math.sin(Snap.rad(angle));
    };
    /*\
 * Snap.tan
 [ method ]
 **
 * Equivalent to `Math.tan()` only works with degrees, not radians.
 - angle (number) angle in degrees
 = (number) tan
\*/
    Snap.tan = function(angle) {
      return math.tan(Snap.rad(angle));
    };
    /*\
 * Snap.cos
 [ method ]
 **
 * Equivalent to `Math.cos()` only works with degrees, not radians.
 - angle (number) angle in degrees
 = (number) cos
\*/
    Snap.cos = function(angle) {
      return math.cos(Snap.rad(angle));
    };
    /*\
 * Snap.asin
 [ method ]
 **
 * Equivalent to `Math.asin()` only works with degrees, not radians.
 - num (number) value
 = (number) asin in degrees
\*/
    Snap.asin = function(num) {
      return Snap.deg(math.asin(num));
    };
    /*\
 * Snap.acos
 [ method ]
 **
 * Equivalent to `Math.acos()` only works with degrees, not radians.
 - num (number) value
 = (number) acos in degrees
\*/
    Snap.acos = function(num) {
      return Snap.deg(math.acos(num));
    };
    /*\
 * Snap.atan
 [ method ]
 **
 * Equivalent to `Math.atan()` only works with degrees, not radians.
 - num (number) value
 = (number) atan in degrees
\*/
    Snap.atan = function(num) {
      return Snap.deg(math.atan(num));
    };
    /*\
 * Snap.atan2
 [ method ]
 **
 * Equivalent to `Math.atan2()` only works with degrees, not radians.
 - num (number) value
 = (number) atan2 in degrees
\*/
    Snap.atan2 = function(num) {
      return Snap.deg(math.atan2(num));
    };
    /*\
 * Snap.angle
 [ method ]
 **
 * Returns an angle between two or three points
 - x1 (number) x coord of first point
 - y1 (number) y coord of first point
 - x2 (number) x coord of second point
 - y2 (number) y coord of second point
 - x3 (number) #optional x coord of third point
 - y3 (number) #optional y coord of third point
 = (number) angle in degrees
\*/
    Snap.angle = angle;
    /*\
 * Snap.len
 [ method ]
 **
 * Returns distance between two points
 - x1 (number) x coord of first point
 - y1 (number) y coord of first point
 - x2 (number) x coord of second point
 - y2 (number) y coord of second point
 = (number) distance
\*/
    Snap.len = function(x1, y1, x2, y2) {
      return Math.sqrt(Snap.len2(x1, y1, x2, y2));
    };
    /*\
 * Snap.len2
 [ method ]
 **
 * Returns squared distance between two points
 - x1 (number) x coord of first point
 - y1 (number) y coord of first point
 - x2 (number) x coord of second point
 - y2 (number) y coord of second point
 = (number) distance
\*/
    Snap.len2 = function(x1, y1, x2, y2) {
      return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    };
    /*\
 * Snap.closestPoint
 [ method ]
 **
 * Returns closest point to a given one on a given path.
 - path (Element) path element
 - x (number) x coord of a point
 - y (number) y coord of a point
 = (object) in format
 {
    x (number) x coord of the point on the path
    y (number) y coord of the point on the path
    length (number) length of the path to the point
    distance (number) distance from the given point to the path
 }
\*/
    // Copied from http://bl.ocks.org/mbostock/8027637
    Snap.closestPoint = function(path, x, y) {
      function distance2(p) {
        var dx = p.x - x,
          dy = p.y - y;
        return dx * dx + dy * dy;
      }
      var pathNode = path.node,
        pathLength = pathNode.getTotalLength(),
        precision = (pathLength / pathNode.pathSegList.numberOfItems) * 0.125,
        best,
        bestLength,
        bestDistance = Infinity;

      // linear scan for coarse approximation
      for (
        var scan, scanLength = 0, scanDistance;
        scanLength <= pathLength;
        scanLength += precision
      ) {
        if (
          (scanDistance = distance2(
            (scan = pathNode.getPointAtLength(scanLength))
          )) < bestDistance
        ) {
          best = scan;
          bestLength = scanLength;
          bestDistance = scanDistance;
        }
      }

      // binary search for precise estimate
      precision *= 0.5;
      while (precision > 0.5) {
        var before,
          after,
          beforeLength,
          afterLength,
          beforeDistance,
          afterDistance;
        if (
          (beforeLength = bestLength - precision) >= 0 &&
          (beforeDistance = distance2(
            (before = pathNode.getPointAtLength(beforeLength))
          )) < bestDistance
        ) {
          best = before;
          bestLength = beforeLength;
          bestDistance = beforeDistance;
        } else if (
          (afterLength = bestLength + precision) <= pathLength &&
          (afterDistance = distance2(
            (after = pathNode.getPointAtLength(afterLength))
          )) < bestDistance
        ) {
          best = after;
          bestLength = afterLength;
          bestDistance = afterDistance;
        } else {
          precision *= 0.5;
        }
      }

      best = {
        x: best.x,
        y: best.y,
        length: bestLength,
        distance: Math.sqrt(bestDistance)
      };
      return best;
    };
    /*\
 * Snap.is
 [ method ]
 **
 * Handy replacement for the `typeof` operator
 - o (…) any object or primitive
 - type (string) name of the type, e.g., `string`, `function`, `number`, etc.
 = (boolean) `true` if given value is of given type
\*/
    Snap.is = is;
    /*\
 * Snap.snapTo
 [ method ]
 **
 * Snaps given value to given grid
 - values (array|number) given array of values or step of the grid
 - value (number) value to adjust
 - tolerance (number) #optional maximum distance to the target value that would trigger the snap. Default is `10`.
 = (number) adjusted value
\*/
    Snap.snapTo = function(values, value, tolerance) {
      tolerance = is(tolerance, "finite") ? tolerance : 10;
      if (is(values, "array")) {
        var i = values.length;
        while (i--)
          if (abs(values[i] - value) <= tolerance) {
            return values[i];
          }
      } else {
        values = +values;
        var rem = value % values;
        if (rem < tolerance) {
          return value - rem;
        }
        if (rem > values - tolerance) {
          return value - rem + values;
        }
      }
      return value;
    };
    // Colour
    /*\
 * Snap.getRGB
 [ method ]
 **
 * Parses color string as RGB object
 - color (string) color string in one of the following formats:
 # <ul>
 #     <li>Color name (<code>red</code>, <code>green</code>, <code>cornflowerblue</code>, etc)</li>
 #     <li>#••• — shortened HTML color: (<code>#000</code>, <code>#fc0</code>, etc.)</li>
 #     <li>#•••••• — full length HTML color: (<code>#000000</code>, <code>#bd2300</code>)</li>
 #     <li>rgb(•••, •••, •••) — red, green and blue channels values: (<code>rgb(200,&nbsp;100,&nbsp;0)</code>)</li>
 #     <li>rgba(•••, •••, •••, •••) — also with opacity</li>
 #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>)</li>
 #     <li>rgba(•••%, •••%, •••%, •••%) — also with opacity</li>
 #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>)</li>
 #     <li>hsba(•••, •••, •••, •••) — also with opacity</li>
 #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
 #     <li>hsba(•••%, •••%, •••%, •••%) — also with opacity</li>
 #     <li>hsl(•••, •••, •••) — hue, saturation and luminosity values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;0.5)</code>)</li>
 #     <li>hsla(•••, •••, •••, •••) — also with opacity</li>
 #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
 #     <li>hsla(•••%, •••%, •••%, •••%) — also with opacity</li>
 # </ul>
 * Note that `%` can be used any time: `rgb(20%, 255, 50%)`.
 = (object) RGB object in the following format:
 o {
 o     r (number) red,
 o     g (number) green,
 o     b (number) blue,
 o     hex (string) color in HTML/CSS format: #••••••,
 o     error (boolean) true if string can't be parsed
 o }
\*/
    Snap.getRGB = cacher(function(colour) {
      if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
        return {
          r: -1,
          g: -1,
          b: -1,
          hex: "none",
          error: 1,
          toString: rgbtoString
        };
      }
      if (colour == "none") {
        return { r: -1, g: -1, b: -1, hex: "none", toString: rgbtoString };
      }
      !(
        hsrg[has](colour.toLowerCase().substring(0, 2)) ||
        colour.charAt() == "#"
      ) && (colour = toHex(colour));
      if (!colour) {
        return {
          r: -1,
          g: -1,
          b: -1,
          hex: "none",
          error: 1,
          toString: rgbtoString
        };
      }
      var res,
        red,
        green,
        blue,
        opacity,
        t,
        values,
        rgb = colour.match(colourRegExp);
      if (rgb) {
        if (rgb[2]) {
          blue = toInt(rgb[2].substring(5), 16);
          green = toInt(rgb[2].substring(3, 5), 16);
          red = toInt(rgb[2].substring(1, 3), 16);
        }
        if (rgb[3]) {
          blue = toInt((t = rgb[3].charAt(3)) + t, 16);
          green = toInt((t = rgb[3].charAt(2)) + t, 16);
          red = toInt((t = rgb[3].charAt(1)) + t, 16);
        }
        if (rgb[4]) {
          values = rgb[4].split(commaSpaces);
          red = toFloat(values[0]);
          values[0].slice(-1) == "%" && (red *= 2.55);
          green = toFloat(values[1]);
          values[1].slice(-1) == "%" && (green *= 2.55);
          blue = toFloat(values[2]);
          values[2].slice(-1) == "%" && (blue *= 2.55);
          rgb[1].toLowerCase().slice(0, 4) == "rgba" &&
            (opacity = toFloat(values[3]));
          values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
        }
        if (rgb[5]) {
          values = rgb[5].split(commaSpaces);
          red = toFloat(values[0]);
          values[0].slice(-1) == "%" && (red /= 100);
          green = toFloat(values[1]);
          values[1].slice(-1) == "%" && (green /= 100);
          blue = toFloat(values[2]);
          values[2].slice(-1) == "%" && (blue /= 100);
          (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") &&
            (red /= 360);
          rgb[1].toLowerCase().slice(0, 4) == "hsba" &&
            (opacity = toFloat(values[3]));
          values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
          return Snap.hsb2rgb(red, green, blue, opacity);
        }
        if (rgb[6]) {
          values = rgb[6].split(commaSpaces);
          red = toFloat(values[0]);
          values[0].slice(-1) == "%" && (red /= 100);
          green = toFloat(values[1]);
          values[1].slice(-1) == "%" && (green /= 100);
          blue = toFloat(values[2]);
          values[2].slice(-1) == "%" && (blue /= 100);
          (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") &&
            (red /= 360);
          rgb[1].toLowerCase().slice(0, 4) == "hsla" &&
            (opacity = toFloat(values[3]));
          values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
          return Snap.hsl2rgb(red, green, blue, opacity);
        }
        red = mmin(math.round(red), 255);
        green = mmin(math.round(green), 255);
        blue = mmin(math.round(blue), 255);
        opacity = mmin(mmax(opacity, 0), 1);
        rgb = { r: red, g: green, b: blue, toString: rgbtoString };
        rgb.hex =
          "#" +
          (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
        rgb.opacity = is(opacity, "finite") ? opacity : 1;
        return rgb;
      }
      return {
        r: -1,
        g: -1,
        b: -1,
        hex: "none",
        error: 1,
        toString: rgbtoString
      };
    }, Snap);
    /*\
 * Snap.hsb
 [ method ]
 **
 * Converts HSB values to a hex representation of the color
 - h (number) hue
 - s (number) saturation
 - b (number) value or brightness
 = (string) hex representation of the color
\*/
    Snap.hsb = cacher(function(h, s, b) {
      return Snap.hsb2rgb(h, s, b).hex;
    });
    /*\
 * Snap.hsl
 [ method ]
 **
 * Converts HSL values to a hex representation of the color
 - h (number) hue
 - s (number) saturation
 - l (number) luminosity
 = (string) hex representation of the color
\*/
    Snap.hsl = cacher(function(h, s, l) {
      return Snap.hsl2rgb(h, s, l).hex;
    });
    /*\
 * Snap.rgb
 [ method ]
 **
 * Converts RGB values to a hex representation of the color
 - r (number) red
 - g (number) green
 - b (number) blue
 = (string) hex representation of the color
\*/
    Snap.rgb = cacher(function(r, g, b, o) {
      if (is(o, "finite")) {
        var round = math.round;
        return "rgba(" + [round(r), round(g), round(b), +o.toFixed(2)] + ")";
      }
      return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    var toHex = function(color) {
        var i =
            glob.doc.getElementsByTagName("head")[0] ||
            glob.doc.getElementsByTagName("svg")[0],
          red = "rgb(255, 0, 0)";
        toHex = cacher(function(color) {
          if (color.toLowerCase() == "red") {
            return red;
          }
          i.style.color = red;
          i.style.color = color;
          var out = glob.doc.defaultView
            .getComputedStyle(i, E)
            .getPropertyValue("color");
          return out == red ? null : out;
        });
        return toHex(color);
      },
      hsbtoString = function() {
        return "hsb(" + [this.h, this.s, this.b] + ")";
      },
      hsltoString = function() {
        return "hsl(" + [this.h, this.s, this.l] + ")";
      },
      rgbtoString = function() {
        return this.opacity == 1 || this.opacity == null
          ? this.hex
          : "rgba(" + [this.r, this.g, this.b, this.opacity] + ")";
      },
      prepareRGB = function(r, g, b) {
        if (g == null && is(r, "object") && "r" in r && "g" in r && "b" in r) {
          b = r.b;
          g = r.g;
          r = r.r;
        }
        if (g == null && is(r, string)) {
          var clr = Snap.getRGB(r);
          r = clr.r;
          g = clr.g;
          b = clr.b;
        }
        if (r > 1 || g > 1 || b > 1) {
          r /= 255;
          g /= 255;
          b /= 255;
        }

        return [r, g, b];
      },
      packageRGB = function(r, g, b, o) {
        r = math.round(r * 255);
        g = math.round(g * 255);
        b = math.round(b * 255);
        var rgb = {
          r: r,
          g: g,
          b: b,
          opacity: is(o, "finite") ? o : 1,
          hex: Snap.rgb(r, g, b),
          toString: rgbtoString
        };
        is(o, "finite") && (rgb.opacity = o);
        return rgb;
      };
    /*\
 * Snap.color
 [ method ]
 **
 * Parses the color string and returns an object featuring the color's component values
 - clr (string) color string in one of the supported formats (see @Snap.getRGB)
 = (object) Combined RGB/HSB object in the following format:
 o {
 o     r (number) red,
 o     g (number) green,
 o     b (number) blue,
 o     hex (string) color in HTML/CSS format: #••••••,
 o     error (boolean) `true` if string can't be parsed,
 o     h (number) hue,
 o     s (number) saturation,
 o     v (number) value (brightness),
 o     l (number) lightness
 o }
\*/
    Snap.color = function(clr) {
      var rgb;
      if (is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
        rgb = Snap.hsb2rgb(clr);
        clr.r = rgb.r;
        clr.g = rgb.g;
        clr.b = rgb.b;
        clr.opacity = 1;
        clr.hex = rgb.hex;
      } else if (is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
        rgb = Snap.hsl2rgb(clr);
        clr.r = rgb.r;
        clr.g = rgb.g;
        clr.b = rgb.b;
        clr.opacity = 1;
        clr.hex = rgb.hex;
      } else {
        if (is(clr, "string")) {
          clr = Snap.getRGB(clr);
        }
        if (
          is(clr, "object") &&
          "r" in clr &&
          "g" in clr &&
          "b" in clr &&
          !("error" in clr)
        ) {
          rgb = Snap.rgb2hsl(clr);
          clr.h = rgb.h;
          clr.s = rgb.s;
          clr.l = rgb.l;
          rgb = Snap.rgb2hsb(clr);
          clr.v = rgb.b;
        } else {
          clr = { hex: "none" };
          clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
          clr.error = 1;
        }
      }
      clr.toString = rgbtoString;
      return clr;
    };
    /*\
 * Snap.hsb2rgb
 [ method ]
 **
 * Converts HSB values to an RGB object
 - h (number) hue
 - s (number) saturation
 - v (number) value or brightness
 = (object) RGB object in the following format:
 o {
 o     r (number) red,
 o     g (number) green,
 o     b (number) blue,
 o     hex (string) color in HTML/CSS format: #••••••
 o }
\*/
    Snap.hsb2rgb = function(h, s, v, o) {
      if (is(h, "object") && "h" in h && "s" in h && "b" in h) {
        v = h.b;
        s = h.s;
        o = h.o;
        h = h.h;
      }
      h *= 360;
      var R, G, B, X, C;
      h = (h % 360) / 60;
      C = v * s;
      X = C * (1 - abs((h % 2) - 1));
      R = G = B = v - C;

      h = ~~h;
      R += [C, X, 0, 0, X, C][h];
      G += [X, C, C, X, 0, 0][h];
      B += [0, 0, X, C, C, X][h];
      return packageRGB(R, G, B, o);
    };
    /*\
 * Snap.hsl2rgb
 [ method ]
 **
 * Converts HSL values to an RGB object
 - h (number) hue
 - s (number) saturation
 - l (number) luminosity
 = (object) RGB object in the following format:
 o {
 o     r (number) red,
 o     g (number) green,
 o     b (number) blue,
 o     hex (string) color in HTML/CSS format: #••••••
 o }
\*/
    Snap.hsl2rgb = function(h, s, l, o) {
      if (is(h, "object") && "h" in h && "s" in h && "l" in h) {
        l = h.l;
        s = h.s;
        h = h.h;
      }
      if (h > 1 || s > 1 || l > 1) {
        h /= 360;
        s /= 100;
        l /= 100;
      }
      h *= 360;
      var R, G, B, X, C;
      h = (h % 360) / 60;
      C = 2 * s * (l < 0.5 ? l : 1 - l);
      X = C * (1 - abs((h % 2) - 1));
      R = G = B = l - C / 2;

      h = ~~h;
      R += [C, X, 0, 0, X, C][h];
      G += [X, C, C, X, 0, 0][h];
      B += [0, 0, X, C, C, X][h];
      return packageRGB(R, G, B, o);
    };
    /*\
 * Snap.rgb2hsb
 [ method ]
 **
 * Converts RGB values to an HSB object
 - r (number) red
 - g (number) green
 - b (number) blue
 = (object) HSB object in the following format:
 o {
 o     h (number) hue,
 o     s (number) saturation,
 o     b (number) brightness
 o }
\*/
    Snap.rgb2hsb = function(r, g, b) {
      b = prepareRGB(r, g, b);
      r = b[0];
      g = b[1];
      b = b[2];

      var H, S, V, C;
      V = mmax(r, g, b);
      C = V - mmin(r, g, b);
      H =
        C == 0
          ? null
          : V == r
          ? (g - b) / C
          : V == g
          ? (b - r) / C + 2
          : (r - g) / C + 4;
      H = (((H + 360) % 6) * 60) / 360;
      S = C == 0 ? 0 : C / V;
      return { h: H, s: S, b: V, toString: hsbtoString };
    };
    /*\
 * Snap.rgb2hsl
 [ method ]
 **
 * Converts RGB values to an HSL object
 - r (number) red
 - g (number) green
 - b (number) blue
 = (object) HSL object in the following format:
 o {
 o     h (number) hue,
 o     s (number) saturation,
 o     l (number) luminosity
 o }
\*/
    Snap.rgb2hsl = function(r, g, b) {
      b = prepareRGB(r, g, b);
      r = b[0];
      g = b[1];
      b = b[2];

      var H, S, L, M, m, C;
      M = mmax(r, g, b);
      m = mmin(r, g, b);
      C = M - m;
      H =
        C == 0
          ? null
          : M == r
          ? (g - b) / C
          : M == g
          ? (b - r) / C + 2
          : (r - g) / C + 4;
      H = (((H + 360) % 6) * 60) / 360;
      L = (M + m) / 2;
      S = C == 0 ? 0 : L < 0.5 ? C / (2 * L) : C / (2 - 2 * L);
      return { h: H, s: S, l: L, toString: hsltoString };
    };

    // Transformations
    /*\
 * Snap.parsePathString
 [ method ]
 **
 * Utility method
 **
 * Parses given path string into an array of arrays of path segments
 - pathString (string|array) path string or array of segments (in the last case it is returned straight away)
 = (array) array of segments
\*/
    Snap.parsePathString = function(pathString) {
      if (!pathString) {
        return null;
      }
      var pth = Snap.path(pathString);
      if (pth.arr) {
        return Snap.path.clone(pth.arr);
      }

      var paramCounts = {
          a: 7,
          c: 6,
          o: 2,
          h: 1,
          l: 2,
          m: 2,
          r: 4,
          q: 4,
          s: 4,
          t: 2,
          v: 1,
          u: 3,
          z: 0
        },
        data = [];
      if (is(pathString, "array") && is(pathString[0], "array")) {
        // rough assumption
        data = Snap.path.clone(pathString);
      }
      if (!data.length) {
        Str(pathString).replace(pathCommand, function(a, b, c) {
          var params = [],
            name = b.toLowerCase();
          c.replace(pathValues, function(a, b) {
            b && params.push(+b);
          });
          if (name == "m" && params.length > 2) {
            data.push([b].concat(params.splice(0, 2)));
            name = "l";
            b = b == "m" ? "l" : "L";
          }
          if (name == "o" && params.length == 1) {
            data.push([b, params[0]]);
          }
          if (name == "r") {
            data.push([b].concat(params));
          } else
            while (params.length >= paramCounts[name]) {
              data.push([b].concat(params.splice(0, paramCounts[name])));
              if (!paramCounts[name]) {
                break;
              }
            }
        });
      }
      data.toString = Snap.path.toString;
      pth.arr = Snap.path.clone(data);
      return data;
    };
    /*\
 * Snap.parseTransformString
 [ method ]
 **
 * Utility method
 **
 * Parses given transform string into an array of transformations
 - TString (string|array) transform string or array of transformations (in the last case it is returned straight away)
 = (array) array of transformations
\*/
    var parseTransformString = (Snap.parseTransformString = function(TString) {
      if (!TString) {
        return null;
      }
      var paramCounts = { r: 3, s: 4, t: 2, m: 6 },
        data = [];
      if (is(TString, "array") && is(TString[0], "array")) {
        // rough assumption
        data = Snap.path.clone(TString);
      }
      if (!data.length) {
        Str(TString).replace(tCommand, function(a, b, c) {
          var params = [],
            name = b.toLowerCase();
          c.replace(pathValues, function(a, b) {
            b && params.push(+b);
          });
          data.push([b].concat(params));
        });
      }
      data.toString = Snap.path.toString;
      return data;
    });
    function svgTransform2string(tstr) {
      var res = [];
      tstr = tstr.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g, function(
        all,
        name,
        params
      ) {
        params = params.split(/\s*,\s*|\s+/);
        if (name == "rotate" && params.length == 1) {
          params.push(0, 0);
        }
        if (name == "scale") {
          if (params.length > 2) {
            params = params.slice(0, 2);
          } else if (params.length == 2) {
            params.push(0, 0);
          }
          if (params.length == 1) {
            params.push(params[0], 0, 0);
          }
        }
        if (name == "skewX") {
          res.push(["m", 1, 0, math.tan(rad(params[0])), 1, 0, 0]);
        } else if (name == "skewY") {
          res.push(["m", 1, math.tan(rad(params[0])), 0, 1, 0, 0]);
        } else {
          res.push([name.charAt(0)].concat(params));
        }
        return all;
      });
      return res;
    }
    Snap._.svgTransform2string = svgTransform2string;
    Snap._.rgTransform = /^[a-z][\s]*-?\.?\d/i;
    function transform2matrix(tstr, bbox) {
      var tdata = parseTransformString(tstr),
        m = new Snap.Matrix();
      if (tdata) {
        for (var i = 0, ii = tdata.length; i < ii; i++) {
          var t = tdata[i],
            tlen = t.length,
            command = Str(t[0]).toLowerCase(),
            absolute = t[0] != command,
            inver = absolute ? m.invert() : 0,
            x1,
            y1,
            x2,
            y2,
            bb;
          if (command == "t" && tlen == 2) {
            m.translate(t[1], 0);
          } else if (command == "t" && tlen == 3) {
            if (absolute) {
              x1 = inver.x(0, 0);
              y1 = inver.y(0, 0);
              x2 = inver.x(t[1], t[2]);
              y2 = inver.y(t[1], t[2]);
              m.translate(x2 - x1, y2 - y1);
            } else {
              m.translate(t[1], t[2]);
            }
          } else if (command == "r") {
            if (tlen == 2) {
              bb = bb || bbox;
              m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
            } else if (tlen == 4) {
              if (absolute) {
                x2 = inver.x(t[2], t[3]);
                y2 = inver.y(t[2], t[3]);
                m.rotate(t[1], x2, y2);
              } else {
                m.rotate(t[1], t[2], t[3]);
              }
            }
          } else if (command == "s") {
            if (tlen == 2 || tlen == 3) {
              bb = bb || bbox;
              m.scale(
                t[1],
                t[tlen - 1],
                bb.x + bb.width / 2,
                bb.y + bb.height / 2
              );
            } else if (tlen == 4) {
              if (absolute) {
                x2 = inver.x(t[2], t[3]);
                y2 = inver.y(t[2], t[3]);
                m.scale(t[1], t[1], x2, y2);
              } else {
                m.scale(t[1], t[1], t[2], t[3]);
              }
            } else if (tlen == 5) {
              if (absolute) {
                x2 = inver.x(t[3], t[4]);
                y2 = inver.y(t[3], t[4]);
                m.scale(t[1], t[2], x2, y2);
              } else {
                m.scale(t[1], t[2], t[3], t[4]);
              }
            }
          } else if (command == "m" && tlen == 7) {
            m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
          }
        }
      }
      return m;
    }
    Snap._.transform2matrix = transform2matrix;
    Snap._unit2px = unit2px;
    var contains =
      glob.doc.contains || glob.doc.compareDocumentPosition
        ? function(a, b) {
            var adown = a.nodeType == 9 ? a.documentElement : a,
              bup = b && b.parentNode;
            return (
              a == bup ||
              !!(
                bup &&
                bup.nodeType == 1 &&
                (adown.contains
                  ? adown.contains(bup)
                  : a.compareDocumentPosition &&
                    a.compareDocumentPosition(bup) & 16)
              )
            );
          }
        : function(a, b) {
            if (b) {
              while (b) {
                b = b.parentNode;
                if (b == a) {
                  return true;
                }
              }
            }
            return false;
          };
    function getSomeDefs(el) {
      var p =
          (el.node.ownerSVGElement && wrap(el.node.ownerSVGElement)) ||
          (el.node.parentNode && wrap(el.node.parentNode)) ||
          Snap.select("svg") ||
          Snap(0, 0),
        pdefs = p.select("defs"),
        defs = pdefs == null ? false : pdefs.node;
      if (!defs) {
        defs = make("defs", p.node).node;
      }
      return defs;
    }
    function getSomeSVG(el) {
      return (
        (el.node.ownerSVGElement && wrap(el.node.ownerSVGElement)) ||
        Snap.select("svg")
      );
    }
    Snap._.getSomeDefs = getSomeDefs;
    Snap._.getSomeSVG = getSomeSVG;
    function unit2px(el, name, value) {
      var svg = getSomeSVG(el).node,
        out = {},
        mgr = svg.querySelector(".svg---mgr");
      if (!mgr) {
        mgr = $("rect");
        $(mgr, {
          x: -9e9,
          y: -9e9,
          width: 10,
          height: 10,
          class: "svg---mgr",
          fill: "none"
        });
        svg.appendChild(mgr);
      }
      function getW(val) {
        if (val == null) {
          return E;
        }
        if (val == +val) {
          return val;
        }
        $(mgr, { width: val });
        try {
          return mgr.getBBox().width;
        } catch (e) {
          return 0;
        }
      }
      function getH(val) {
        if (val == null) {
          return E;
        }
        if (val == +val) {
          return val;
        }
        $(mgr, { height: val });
        try {
          return mgr.getBBox().height;
        } catch (e) {
          return 0;
        }
      }
      function set(nam, f) {
        if (name == null) {
          out[nam] = f(el.attr(nam) || 0);
        } else if (nam == name) {
          out = f(value == null ? el.attr(nam) || 0 : value);
        }
      }
      switch (el.type) {
        case "rect":
          set("rx", getW);
          set("ry", getH);
        case "image":
          set("width", getW);
          set("height", getH);
        case "text":
          set("x", getW);
          set("y", getH);
          break;
        case "circle":
          set("cx", getW);
          set("cy", getH);
          set("r", getW);
          break;
        case "ellipse":
          set("cx", getW);
          set("cy", getH);
          set("rx", getW);
          set("ry", getH);
          break;
        case "line":
          set("x1", getW);
          set("x2", getW);
          set("y1", getH);
          set("y2", getH);
          break;
        case "marker":
          set("refX", getW);
          set("markerWidth", getW);
          set("refY", getH);
          set("markerHeight", getH);
          break;
        case "radialGradient":
          set("fx", getW);
          set("fy", getH);
          break;
        case "tspan":
          set("dx", getW);
          set("dy", getH);
          break;
        default:
          set(name, getW);
      }
      svg.removeChild(mgr);
      return out;
    }
    /*\
 * Snap.select
 [ method ]
 **
 * Wraps a DOM element specified by CSS selector as @Element
 - query (string) CSS selector of the element
 = (Element) the current element
\*/
    Snap.select = function(query) {
      query = Str(query).replace(/([^\\]):/g, "$1\\:");
      return wrap(glob.doc.querySelector(query));
    };
    /*\
 * Snap.selectAll
 [ method ]
 **
 * Wraps DOM elements specified by CSS selector as set or array of @Element
 - query (string) CSS selector of the element
 = (Element) the current element
\*/
    Snap.selectAll = function(query) {
      var nodelist = glob.doc.querySelectorAll(query),
        set = (Snap.set || Array)();
      for (var i = 0; i < nodelist.length; i++) {
        set.push(wrap(nodelist[i]));
      }
      return set;
    };

    function add2group(list) {
      if (!is(list, "array")) {
        list = Array.prototype.slice.call(arguments, 0);
      }
      var i = 0,
        j = 0,
        node = this.node;
      while (this[i]) delete this[i++];
      for (i = 0; i < list.length; i++) {
        if (list[i].type == "set") {
          list[i].forEach(function(el) {
            node.appendChild(el.node);
          });
        } else {
          node.appendChild(list[i].node);
        }
      }
      var children = node.childNodes;
      for (i = 0; i < children.length; i++) {
        this[j++] = wrap(children[i]);
      }
      return this;
    }
    // Hub garbage collector every 10s
    setInterval(function() {
      for (var key in hub)
        if (hub[has](key)) {
          var el = hub[key],
            node = el.node;
          if (
            (el.type != "svg" && !node.ownerSVGElement) ||
            (el.type == "svg" &&
              (!node.parentNode ||
                ("ownerSVGElement" in node.parentNode &&
                  !node.ownerSVGElement)))
          ) {
            delete hub[key];
          }
        }
    }, 1e4);
    function Element(el) {
      if (el.snap in hub) {
        return hub[el.snap];
      }
      var svg;
      try {
        svg = el.ownerSVGElement;
      } catch (e) {}
      /*\
     * Element.node
     [ property (object) ]
     **
     * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
     > Usage
     | // draw a circle at coordinate 10,10 with radius of 10
     | var c = paper.circle(10, 10, 10);
     | c.node.onclick = function () {
     |     c.attr("fill", "red");
     | };
    \*/
      this.node = el;
      if (svg) {
        this.paper = new Paper(svg);
      }
      /*\
     * Element.type
     [ property (string) ]
     **
     * SVG tag name of the given element.
    \*/
      this.type = el.tagName || el.nodeName;
      var id = (this.id = ID(this));
      this.anims = {};
      this._ = {
        transform: []
      };
      el.snap = id;
      hub[id] = this;
      if (this.type == "g") {
        this.add = add2group;
      }
      if (this.type in { g: 1, mask: 1, pattern: 1, symbol: 1 }) {
        for (var method in Paper.prototype)
          if (Paper.prototype[has](method)) {
            this[method] = Paper.prototype[method];
          }
      }
    }
    /*\
     * Element.attr
     [ method ]
     **
     * Gets or sets given attributes of the element.
     **
     - params (object) contains key-value pairs of attributes you want to set
     * or
     - param (string) name of the attribute
     = (Element) the current element
     * or
     = (string) value of attribute
     > Usage
     | el.attr({
     |     fill: "#fc0",
     |     stroke: "#000",
     |     strokeWidth: 2, // CamelCase...
     |     "fill-opacity": 0.5, // or dash-separated names
     |     width: "*=2" // prefixed values
     | });
     | console.log(el.attr("fill")); // #fc0
     * Prefixed values in format `"+=10"` supported. All four operations
     * (`+`, `-`, `*` and `/`) could be used. Optionally you can use units for `+`
     * and `-`: `"+=2em"`.
    \*/
    Element.prototype.attr = function(params, value) {
      var el = this,
        node = el.node;
      if (!params) {
        if (node.nodeType != 1) {
          return {
            text: node.nodeValue
          };
        }
        var attr = node.attributes,
          out = {};
        for (var i = 0, ii = attr.length; i < ii; i++) {
          out[attr[i].nodeName] = attr[i].nodeValue;
        }
        return out;
      }
      if (is(params, "string")) {
        if (arguments.length > 1) {
          var json = {};
          json[params] = value;
          params = json;
        } else {
          return eve("snap.util.getattr." + params, el).firstDefined();
        }
      }
      for (var att in params) {
        if (params[has](att)) {
          eve("snap.util.attr." + att, el, params[att]);
        }
      }
      return el;
    };
    /*\
 * Snap.parse
 [ method ]
 **
 * Parses SVG fragment and converts it into a @Fragment
 **
 - svg (string) SVG string
 = (Fragment) the @Fragment
\*/
    Snap.parse = function(svg) {
      var f = glob.doc.createDocumentFragment(),
        full = true,
        div = glob.doc.createElement("div");
      svg = Str(svg);
      if (!svg.match(/^\s*<\s*svg(?:\s|>)/)) {
        svg = "<svg>" + svg + "</svg>";
        full = false;
      }
      div.innerHTML = svg;
      svg = div.getElementsByTagName("svg")[0];
      if (svg) {
        if (full) {
          f = svg;
        } else {
          while (svg.firstChild) {
            f.appendChild(svg.firstChild);
          }
        }
      }
      return new Fragment(f);
    };
    function Fragment(frag) {
      this.node = frag;
    }
    /*\
 * Snap.fragment
 [ method ]
 **
 * Creates a DOM fragment from a given list of elements or strings
 **
 - varargs (…) SVG string
 = (Fragment) the @Fragment
\*/
    Snap.fragment = function() {
      var args = Array.prototype.slice.call(arguments, 0),
        f = glob.doc.createDocumentFragment();
      for (var i = 0, ii = args.length; i < ii; i++) {
        var item = args[i];
        if (item.node && item.node.nodeType) {
          f.appendChild(item.node);
        }
        if (item.nodeType) {
          f.appendChild(item);
        }
        if (typeof item == "string") {
          f.appendChild(Snap.parse(item).node);
        }
      }
      return new Fragment(f);
    };

    function make(name, parent) {
      var res = $(name);
      parent.appendChild(res);
      var el = wrap(res);
      return el;
    }
    function Paper(w, h) {
      var res,
        desc,
        defs,
        proto = Paper.prototype;
      if (w && w.tagName && w.tagName.toLowerCase() == "svg") {
        if (w.snap in hub) {
          return hub[w.snap];
        }
        var doc = w.ownerDocument;
        res = new Element(w);
        desc = w.getElementsByTagName("desc")[0];
        defs = w.getElementsByTagName("defs")[0];
        if (!desc) {
          desc = $("desc");
          desc.appendChild(doc.createTextNode("Created with Snap"));
          res.node.appendChild(desc);
        }
        if (!defs) {
          defs = $("defs");
          res.node.appendChild(defs);
        }
        res.defs = defs;
        for (var key in proto)
          if (proto[has](key)) {
            res[key] = proto[key];
          }
        res.paper = res.root = res;
      } else {
        res = make("svg", glob.doc.body);
        $(res.node, {
          height: h,
          version: 1.1,
          width: w,
          xmlns: xmlns
        });
      }
      return res;
    }
    function wrap(dom) {
      if (!dom) {
        return dom;
      }
      if (dom instanceof Element || dom instanceof Fragment) {
        return dom;
      }
      if (dom.tagName && dom.tagName.toLowerCase() == "svg") {
        return new Paper(dom);
      }
      if (
        dom.tagName &&
        dom.tagName.toLowerCase() == "object" &&
        dom.type == "image/svg+xml"
      ) {
        return new Paper(dom.contentDocument.getElementsByTagName("svg")[0]);
      }
      return new Element(dom);
    }

    Snap._.make = make;
    Snap._.wrap = wrap;
    /*\
 * Paper.el
 [ method ]
 **
 * Creates an element on paper with a given name and no attributes
 **
 - name (string) tag name
 - attr (object) attributes
 = (Element) the current element
 > Usage
 | var c = paper.circle(10, 10, 10); // is the same as...
 | var c = paper.el("circle").attr({
 |     cx: 10,
 |     cy: 10,
 |     r: 10
 | });
 | // and the same as
 | var c = paper.el("circle", {
 |     cx: 10,
 |     cy: 10,
 |     r: 10
 | });
\*/
    Paper.prototype.el = function(name, attr) {
      var el = make(name, this.node);
      attr && el.attr(attr);
      return el;
    };
    /*\
 * Element.children
 [ method ]
 **
 * Returns array of all the children of the element.
 = (array) array of Elements
\*/
    Element.prototype.children = function() {
      var out = [],
        ch = this.node.childNodes;
      for (var i = 0, ii = ch.length; i < ii; i++) {
        out[i] = Snap(ch[i]);
      }
      return out;
    };
    function jsonFiller(root, o) {
      for (var i = 0, ii = root.length; i < ii; i++) {
        var item = {
            type: root[i].type,
            attr: root[i].attr()
          },
          children = root[i].children();
        o.push(item);
        if (children.length) {
          jsonFiller(children, (item.childNodes = []));
        }
      }
    }
    /*\
 * Element.toJSON
 [ method ]
 **
 * Returns object representation of the given element and all its children.
 = (object) in format
 o {
 o     type (string) this.type,
 o     attr (object) attributes map,
 o     childNodes (array) optional array of children in the same format
 o }
\*/
    Element.prototype.toJSON = function() {
      var out = [];
      jsonFiller([this], out);
      return out[0];
    };
    // default
    eve.on("snap.util.getattr", function() {
      var att = eve.nt();
      att = att.substring(att.lastIndexOf(".") + 1);
      var css = att.replace(/[A-Z]/g, function(letter) {
        return "-" + letter.toLowerCase();
      });
      if (cssAttr[has](css)) {
        return this.node.ownerDocument.defaultView
          .getComputedStyle(this.node, null)
          .getPropertyValue(css);
      } else {
        return $(this.node, att);
      }
    });
    var cssAttr = {
      "alignment-baseline": 0,
      "baseline-shift": 0,
      clip: 0,
      "clip-path": 0,
      "clip-rule": 0,
      color: 0,
      "color-interpolation": 0,
      "color-interpolation-filters": 0,
      "color-profile": 0,
      "color-rendering": 0,
      cursor: 0,
      direction: 0,
      display: 0,
      "dominant-baseline": 0,
      "enable-background": 0,
      fill: 0,
      "fill-opacity": 0,
      "fill-rule": 0,
      filter: 0,
      "flood-color": 0,
      "flood-opacity": 0,
      font: 0,
      "font-family": 0,
      "font-size": 0,
      "font-size-adjust": 0,
      "font-stretch": 0,
      "font-style": 0,
      "font-variant": 0,
      "font-weight": 0,
      "glyph-orientation-horizontal": 0,
      "glyph-orientation-vertical": 0,
      "image-rendering": 0,
      kerning: 0,
      "letter-spacing": 0,
      "lighting-color": 0,
      marker: 0,
      "marker-end": 0,
      "marker-mid": 0,
      "marker-start": 0,
      mask: 0,
      opacity: 0,
      overflow: 0,
      "pointer-events": 0,
      "shape-rendering": 0,
      "stop-color": 0,
      "stop-opacity": 0,
      stroke: 0,
      "stroke-dasharray": 0,
      "stroke-dashoffset": 0,
      "stroke-linecap": 0,
      "stroke-linejoin": 0,
      "stroke-miterlimit": 0,
      "stroke-opacity": 0,
      "stroke-width": 0,
      "text-anchor": 0,
      "text-decoration": 0,
      "text-rendering": 0,
      "unicode-bidi": 0,
      visibility: 0,
      "word-spacing": 0,
      "writing-mode": 0
    };

    eve.on("snap.util.attr", function(value) {
      var att = eve.nt(),
        attr = {};
      att = att.substring(att.lastIndexOf(".") + 1);
      attr[att] = value;
      var style = att.replace(/-(\w)/gi, function(all, letter) {
          return letter.toUpperCase();
        }),
        css = att.replace(/[A-Z]/g, function(letter) {
          return "-" + letter.toLowerCase();
        });
      if (cssAttr[has](css)) {
        this.node.style[style] = value == null ? E : value;
      } else {
        $(this.node, attr);
      }
    });
    (function(proto) {})(Paper.prototype);

    // simple ajax
    /*\
 * Snap.ajax
 [ method ]
 **
 * Simple implementation of Ajax
 **
 - url (string) URL
 - postData (object|string) data for post request
 - callback (function) callback
 - scope (object) #optional scope of callback
 * or
 - url (string) URL
 - callback (function) callback
 - scope (object) #optional scope of callback
 = (XMLHttpRequest) the XMLHttpRequest object, just in case
\*/
    Snap.ajax = function(url, postData, callback, scope) {
      var req = new XMLHttpRequest(),
        id = ID();
      if (req) {
        if (is(postData, "function")) {
          scope = callback;
          callback = postData;
          postData = null;
        } else if (is(postData, "object")) {
          var pd = [];
          for (var key in postData)
            if (postData.hasOwnProperty(key)) {
              pd.push(
                encodeURIComponent(key) +
                  "=" +
                  encodeURIComponent(postData[key])
              );
            }
          postData = pd.join("&");
        }
        req.open(postData ? "POST" : "GET", url, true);
        if (postData) {
          req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          req.setRequestHeader(
            "Content-type",
            "application/x-www-form-urlencoded"
          );
        }
        if (callback) {
          eve.once("snap.ajax." + id + ".0", callback);
          eve.once("snap.ajax." + id + ".200", callback);
          eve.once("snap.ajax." + id + ".304", callback);
        }
        req.onreadystatechange = function() {
          if (req.readyState != 4) return;
          eve("snap.ajax." + id + "." + req.status, scope, req);
        };
        if (req.readyState == 4) {
          return req;
        }
        req.send(postData);
        return req;
      }
    };
    /*\
 * Snap.load
 [ method ]
 **
 * Loads external SVG file as a @Fragment (see @Snap.ajax for more advanced AJAX)
 **
 - url (string) URL
 - callback (function) callback
 - scope (object) #optional scope of callback
\*/
    Snap.load = function(url, callback, scope) {
      Snap.ajax(url, function(req) {
        var f = Snap.parse(req.responseText);
        scope ? callback.call(scope, f) : callback(f);
      });
    };
    var getOffset = function(elem) {
      var box = elem.getBoundingClientRect(),
        doc = elem.ownerDocument,
        body = doc.body,
        docElem = doc.documentElement,
        clientTop = docElem.clientTop || body.clientTop || 0,
        clientLeft = docElem.clientLeft || body.clientLeft || 0,
        top =
          box.top +
          (g.win.pageYOffset || docElem.scrollTop || body.scrollTop) -
          clientTop,
        left =
          box.left +
          (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) -
          clientLeft;
      return {
        y: top,
        x: left
      };
    };
    /*\
 * Snap.getElementByPoint
 [ method ]
 **
 * Returns you topmost element under given point.
 **
 = (object) Snap element object
 - x (number) x coordinate from the top left corner of the window
 - y (number) y coordinate from the top left corner of the window
 > Usage
 | Snap.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
\*/
    Snap.getElementByPoint = function(x, y) {
      var paper = this,
        svg = paper.canvas,
        target = glob.doc.elementFromPoint(x, y);
      if (glob.win.opera && target.tagName == "svg") {
        var so = getOffset(target),
          sr = target.createSVGRect();
        sr.x = x - so.x;
        sr.y = y - so.y;
        sr.width = sr.height = 1;
        var hits = target.getIntersectionList(sr, null);
        if (hits.length) {
          target = hits[hits.length - 1];
        }
      }
      if (!target) {
        return null;
      }
      return wrap(target);
    };
    /*\
 * Snap.plugin
 [ method ]
 **
 * Let you write plugins. You pass in a function with five arguments, like this:
 | Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
 |     Snap.newmethod = function () {};
 |     Element.prototype.newmethod = function () {};
 |     Paper.prototype.newmethod = function () {};
 | });
 * Inside the function you have access to all main objects (and their
 * prototypes). This allow you to extend anything you want.
 **
 - f (function) your plugin body
\*/
    Snap.plugin = function(f) {
      f(Snap, Element, Paper, glob, Fragment);
    };
    glob.win.Snap = Snap;
    return Snap;
  })(window || this);

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var elproto = Element.prototype,
      is = Snap.is,
      Str = String,
      unit2px = Snap._unit2px,
      $ = Snap._.$,
      make = Snap._.make,
      getSomeDefs = Snap._.getSomeDefs,
      has = "hasOwnProperty",
      wrap = Snap._.wrap;
    /*\
     * Element.getBBox
     [ method ]
     **
     * Returns the bounding box descriptor for the given element
     **
     = (object) bounding box descriptor:
     o {
     o     cx: (number) x of the center,
     o     cy: (number) x of the center,
     o     h: (number) height,
     o     height: (number) height,
     o     path: (string) path command for the box,
     o     r0: (number) radius of a circle that fully encloses the box,
     o     r1: (number) radius of the smallest circle that can be enclosed,
     o     r2: (number) radius of the largest circle that can be enclosed,
     o     vb: (string) box as a viewbox command,
     o     w: (number) width,
     o     width: (number) width,
     o     x2: (number) x of the right side,
     o     x: (number) x of the left side,
     o     y2: (number) y of the bottom edge,
     o     y: (number) y of the top edge
     o }
    \*/
    elproto.getBBox = function(isWithoutTransform) {
      if (this.type == "tspan") {
        return Snap._.box(this.node.getClientRects().item(0));
      }
      if (!Snap.Matrix || !Snap.path) {
        return this.node.getBBox();
      }
      var el = this,
        m = new Snap.Matrix();
      if (el.removed) {
        return Snap._.box();
      }
      while (el.type == "use") {
        if (!isWithoutTransform) {
          m = m.add(
            el
              .transform()
              .localMatrix.translate(el.attr("x") || 0, el.attr("y") || 0)
          );
        }
        if (el.original) {
          el = el.original;
        } else {
          var href = el.attr("xlink:href");
          el = el.original = el.node.ownerDocument.getElementById(
            href.substring(href.indexOf("#") + 1)
          );
        }
      }
      var _ = el._,
        pathfinder = Snap.path.get[el.type] || Snap.path.get.deflt;
      try {
        if (isWithoutTransform) {
          _.bboxwt = pathfinder
            ? Snap.path.getBBox((el.realPath = pathfinder(el)))
            : Snap._.box(el.node.getBBox());
          return Snap._.box(_.bboxwt);
        } else {
          el.realPath = pathfinder(el);
          el.matrix = el.transform().localMatrix;
          _.bbox = Snap.path.getBBox(
            Snap.path.map(el.realPath, m.add(el.matrix))
          );
          return Snap._.box(_.bbox);
        }
      } catch (e) {
        // Firefox doesn’t give you bbox of hidden element
        return Snap._.box();
      }
    };
    var propString = function() {
      return this.string;
    };
    function extractTransform(el, tstr) {
      if (tstr == null) {
        var doReturn = true;
        if (el.type == "linearGradient" || el.type == "radialGradient") {
          tstr = el.node.getAttribute("gradientTransform");
        } else if (el.type == "pattern") {
          tstr = el.node.getAttribute("patternTransform");
        } else {
          tstr = el.node.getAttribute("transform");
        }
        if (!tstr) {
          return new Snap.Matrix();
        }
        tstr = Snap._.svgTransform2string(tstr);
      } else {
        if (!Snap._.rgTransform.test(tstr)) {
          tstr = Snap._.svgTransform2string(tstr);
        } else {
          tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || "");
        }
        if (is(tstr, "array")) {
          tstr = Snap.path ? Snap.path.toString.call(tstr) : Str(tstr);
        }
        el._.transform = tstr;
      }
      var m = Snap._.transform2matrix(tstr, el.getBBox(1));
      if (doReturn) {
        return m;
      } else {
        el.matrix = m;
      }
    }
    /*\
     * Element.transform
     [ method ]
     **
     * Gets or sets transformation of the element
     **
     - tstr (string) transform string in Snap or SVG format
     = (Element) the current element
     * or
     = (object) transformation descriptor:
     o {
     o     string (string) transform string,
     o     globalMatrix (Matrix) matrix of all transformations applied to element or its parents,
     o     localMatrix (Matrix) matrix of transformations applied only to the element,
     o     diffMatrix (Matrix) matrix of difference between global and local transformations,
     o     global (string) global transformation as string,
     o     local (string) local transformation as string,
     o     toString (function) returns `string` property
     o }
    \*/
    elproto.transform = function(tstr) {
      var _ = this._;
      if (tstr == null) {
        var papa = this,
          global = new Snap.Matrix(this.node.getCTM()),
          local = extractTransform(this),
          ms = [local],
          m = new Snap.Matrix(),
          i,
          localString = local.toTransformString(),
          string =
            Str(local) == Str(this.matrix) ? Str(_.transform) : localString;
        while (papa.type != "svg" && (papa = papa.parent())) {
          ms.push(extractTransform(papa));
        }
        i = ms.length;
        while (i--) {
          m.add(ms[i]);
        }
        return {
          string: string,
          globalMatrix: global,
          totalMatrix: m,
          localMatrix: local,
          diffMatrix: global.clone().add(local.invert()),
          global: global.toTransformString(),
          total: m.toTransformString(),
          local: localString,
          toString: propString
        };
      }
      if (tstr instanceof Snap.Matrix) {
        this.matrix = tstr;
        this._.transform = tstr.toTransformString();
      } else {
        extractTransform(this, tstr);
      }

      if (this.node) {
        if (this.type == "linearGradient" || this.type == "radialGradient") {
          $(this.node, { gradientTransform: this.matrix });
        } else if (this.type == "pattern") {
          $(this.node, { patternTransform: this.matrix });
        } else {
          $(this.node, { transform: this.matrix });
        }
      }

      return this;
    };
    /*\
     * Element.parent
     [ method ]
     **
     * Returns the element's parent
     **
     = (Element) the parent element
    \*/
    elproto.parent = function() {
      return wrap(this.node.parentNode);
    };
    /*\
     * Element.append
     [ method ]
     **
     * Appends the given element to current one
     **
     - el (Element|Set) element to append
     = (Element) the parent element
    \*/
    /*\
     * Element.add
     [ method ]
     **
     * See @Element.append
    \*/
    elproto.append = elproto.add = function(el) {
      if (el) {
        if (el.type == "set") {
          var it = this;
          el.forEach(function(el) {
            it.add(el);
          });
          return this;
        }
        el = wrap(el);
        this.node.appendChild(el.node);
        el.paper = this.paper;
      }
      return this;
    };
    /*\
     * Element.appendTo
     [ method ]
     **
     * Appends the current element to the given one
     **
     - el (Element) parent element to append to
     = (Element) the child element
    \*/
    elproto.appendTo = function(el) {
      if (el) {
        el = wrap(el);
        el.append(this);
      }
      return this;
    };
    /*\
     * Element.prepend
     [ method ]
     **
     * Prepends the given element to the current one
     **
     - el (Element) element to prepend
     = (Element) the parent element
    \*/
    elproto.prepend = function(el) {
      if (el) {
        if (el.type == "set") {
          var it = this,
            first;
          el.forEach(function(el) {
            if (first) {
              first.after(el);
            } else {
              it.prepend(el);
            }
            first = el;
          });
          return this;
        }
        el = wrap(el);
        var parent = el.parent();
        this.node.insertBefore(el.node, this.node.firstChild);
        this.add && this.add();
        el.paper = this.paper;
        this.parent() && this.parent().add();
        parent && parent.add();
      }
      return this;
    };
    /*\
     * Element.prependTo
     [ method ]
     **
     * Prepends the current element to the given one
     **
     - el (Element) parent element to prepend to
     = (Element) the child element
    \*/
    elproto.prependTo = function(el) {
      el = wrap(el);
      el.prepend(this);
      return this;
    };
    /*\
     * Element.before
     [ method ]
     **
     * Inserts given element before the current one
     **
     - el (Element) element to insert
     = (Element) the parent element
    \*/
    elproto.before = function(el) {
      if (el.type == "set") {
        var it = this;
        el.forEach(function(el) {
          var parent = el.parent();
          it.node.parentNode.insertBefore(el.node, it.node);
          parent && parent.add();
        });
        this.parent().add();
        return this;
      }
      el = wrap(el);
      var parent = el.parent();
      this.node.parentNode.insertBefore(el.node, this.node);
      this.parent() && this.parent().add();
      parent && parent.add();
      el.paper = this.paper;
      return this;
    };
    /*\
     * Element.after
     [ method ]
     **
     * Inserts given element after the current one
     **
     - el (Element) element to insert
     = (Element) the parent element
    \*/
    elproto.after = function(el) {
      el = wrap(el);
      var parent = el.parent();
      if (this.node.nextSibling) {
        this.node.parentNode.insertBefore(el.node, this.node.nextSibling);
      } else {
        this.node.parentNode.appendChild(el.node);
      }
      this.parent() && this.parent().add();
      parent && parent.add();
      el.paper = this.paper;
      return this;
    };
    /*\
     * Element.insertBefore
     [ method ]
     **
     * Inserts the element after the given one
     **
     - el (Element) element next to whom insert to
     = (Element) the parent element
    \*/
    elproto.insertBefore = function(el) {
      el = wrap(el);
      var parent = this.parent();
      el.node.parentNode.insertBefore(this.node, el.node);
      this.paper = el.paper;
      parent && parent.add();
      el.parent() && el.parent().add();
      return this;
    };
    /*\
     * Element.insertAfter
     [ method ]
     **
     * Inserts the element after the given one
     **
     - el (Element) element next to whom insert to
     = (Element) the parent element
    \*/
    elproto.insertAfter = function(el) {
      el = wrap(el);
      var parent = this.parent();
      el.node.parentNode.insertBefore(this.node, el.node.nextSibling);
      this.paper = el.paper;
      parent && parent.add();
      el.parent() && el.parent().add();
      return this;
    };
    /*\
     * Element.remove
     [ method ]
     **
     * Removes element from the DOM
     = (Element) the detached element
    \*/
    elproto.remove = function() {
      var parent = this.parent();
      this.node.parentNode && this.node.parentNode.removeChild(this.node);
      delete this.paper;
      this.removed = true;
      parent && parent.add();
      return this;
    };
    /*\
     * Element.select
     [ method ]
     **
     * Gathers the nested @Element matching the given set of CSS selectors
     **
     - query (string) CSS selector
     = (Element) result of query selection
    \*/
    elproto.select = function(query) {
      return wrap(this.node.querySelector(query));
    };
    /*\
     * Element.selectAll
     [ method ]
     **
     * Gathers nested @Element objects matching the given set of CSS selectors
     **
     - query (string) CSS selector
     = (Set|array) result of query selection
    \*/
    elproto.selectAll = function(query) {
      var nodelist = this.node.querySelectorAll(query),
        set = (Snap.set || Array)();
      for (var i = 0; i < nodelist.length; i++) {
        set.push(wrap(nodelist[i]));
      }
      return set;
    };
    /*\
     * Element.asPX
     [ method ]
     **
     * Returns given attribute of the element as a `px` value (not %, em, etc.)
     **
     - attr (string) attribute name
     - value (string) #optional attribute value
     = (Element) result of query selection
    \*/
    elproto.asPX = function(attr, value) {
      if (value == null) {
        value = this.attr(attr);
      }
      return +unit2px(this, attr, value);
    };
    // SIERRA Element.use(): I suggest adding a note about how to access the original element the returned <use> instantiates. It's a part of SVG with which ordinary web developers may be least familiar.
    /*\
     * Element.use
     [ method ]
     **
     * Creates a `<use>` element linked to the current element
     **
     = (Element) the `<use>` element
    \*/
    elproto.use = function() {
      var use,
        id = this.node.id;
      if (!id) {
        id = this.id;
        $(this.node, {
          id: id
        });
      }
      if (
        this.type == "linearGradient" ||
        this.type == "radialGradient" ||
        this.type == "pattern"
      ) {
        use = make(this.type, this.node.parentNode);
      } else {
        use = make("use", this.node.parentNode);
      }
      $(use.node, {
        "xlink:href": "#" + id
      });
      use.original = this;
      return use;
    };
    function fixids(el) {
      var els = el.selectAll("*"),
        it,
        url = /^\s*url\(("|'|)(.*)\1\)\s*$/,
        ids = [],
        uses = {};
      function urltest(it, name) {
        var val = $(it.node, name);
        val = val && val.match(url);
        val = val && val[2];
        if (val && val.charAt() == "#") {
          val = val.substring(1);
        } else {
          return;
        }
        if (val) {
          uses[val] = (uses[val] || []).concat(function(id) {
            var attr = {};
            attr[name] = Snap.url(id);
            $(it.node, attr);
          });
        }
      }
      function linktest(it) {
        var val = $(it.node, "xlink:href");
        if (val && val.charAt() == "#") {
          val = val.substring(1);
        } else {
          return;
        }
        if (val) {
          uses[val] = (uses[val] || []).concat(function(id) {
            it.attr("xlink:href", "#" + id);
          });
        }
      }
      for (var i = 0, ii = els.length; i < ii; i++) {
        it = els[i];
        urltest(it, "fill");
        urltest(it, "stroke");
        urltest(it, "filter");
        urltest(it, "mask");
        urltest(it, "clip-path");
        linktest(it);
        var oldid = $(it.node, "id");
        if (oldid) {
          $(it.node, { id: it.id });
          ids.push({
            old: oldid,
            id: it.id
          });
        }
      }
      for (i = 0, ii = ids.length; i < ii; i++) {
        var fs = uses[ids[i].old];
        if (fs) {
          for (var j = 0, jj = fs.length; j < jj; j++) {
            fs[j](ids[i].id);
          }
        }
      }
    }
    /*\
     * Element.clone
     [ method ]
     **
     * Creates a clone of the element and inserts it after the element
     **
     = (Element) the clone
    \*/
    elproto.clone = function() {
      var clone = wrap(this.node.cloneNode(true));
      if ($(clone.node, "id")) {
        $(clone.node, { id: clone.id });
      }
      fixids(clone);
      clone.insertAfter(this);
      return clone;
    };
    /*\
     * Element.toDefs
     [ method ]
     **
     * Moves element to the shared `<defs>` area
     **
     = (Element) the element
    \*/
    elproto.toDefs = function() {
      var defs = getSomeDefs(this);
      defs.appendChild(this.node);
      return this;
    };
    /*\
     * Element.toPattern
     [ method ]
     **
     * Creates a `<pattern>` element from the current element
     **
     * To create a pattern you have to specify the pattern rect:
     - x (string|number)
     - y (string|number)
     - width (string|number)
     - height (string|number)
     = (Element) the `<pattern>` element
     * You can use pattern later on as an argument for `fill` attribute:
     | var p = paper.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
     |         fill: "none",
     |         stroke: "#bada55",
     |         strokeWidth: 5
     |     }).pattern(0, 0, 10, 10),
     |     c = paper.circle(200, 200, 100);
     | c.attr({
     |     fill: p
     | });
    \*/
    elproto.pattern = elproto.toPattern = function(x, y, width, height) {
      var p = make("pattern", getSomeDefs(this));
      if (x == null) {
        x = this.getBBox();
      }
      if (is(x, "object") && "x" in x) {
        y = x.y;
        width = x.width;
        height = x.height;
        x = x.x;
      }
      $(p.node, {
        x: x,
        y: y,
        width: width,
        height: height,
        patternUnits: "userSpaceOnUse",
        id: p.id,
        viewBox: [x, y, width, height].join(" ")
      });
      p.node.appendChild(this.node);
      return p;
    };
    // SIERRA Element.marker(): clarify what a reference point is. E.g., helps you offset the object from its edge such as when centering it over a path.
    // SIERRA Element.marker(): I suggest the method should accept default reference point values.  Perhaps centered with (refX = width/2) and (refY = height/2)? Also, couldn't it assume the element's current _width_ and _height_? And please specify what _x_ and _y_ mean: offsets? If so, from where?  Couldn't they also be assigned default values?
    /*\
     * Element.marker
     [ method ]
     **
     * Creates a `<marker>` element from the current element
     **
     * To create a marker you have to specify the bounding rect and reference point:
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - refX (number)
     - refY (number)
     = (Element) the `<marker>` element
     * You can specify the marker later as an argument for `marker-start`, `marker-end`, `marker-mid`, and `marker` attributes. The `marker` attribute places the marker at every point along the path, and `marker-mid` places them at every point except the start and end.
    \*/
    // TODO add usage for markers
    elproto.marker = function(x, y, width, height, refX, refY) {
      var p = make("marker", getSomeDefs(this));
      if (x == null) {
        x = this.getBBox();
      }
      if (is(x, "object") && "x" in x) {
        y = x.y;
        width = x.width;
        height = x.height;
        refX = x.refX || x.cx;
        refY = x.refY || x.cy;
        x = x.x;
      }
      $(p.node, {
        viewBox: [x, y, width, height].join(" "),
        markerWidth: width,
        markerHeight: height,
        orient: "auto",
        refX: refX || 0,
        refY: refY || 0,
        id: p.id
      });
      p.node.appendChild(this.node);
      return p;
    };
    var eldata = {};
    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value associated with given key. (Don’t confuse
     * with `data-` attributes)
     *
     * See also @Element.removeData
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
    \*/
    elproto.data = function(key, value) {
      var data = (eldata[this.id] = eldata[this.id] || {});
      if (arguments.length == 0) {
        eve("snap.data.get." + this.id, this, data, null);
        return data;
      }
      if (arguments.length == 1) {
        if (Snap.is(key, "object")) {
          for (var i in key)
            if (key[has](i)) {
              this.data(i, key[i]);
            }
          return this;
        }
        eve("snap.data.get." + this.id, this, data[key], key);
        return data[key];
      }
      data[key] = value;
      eve("snap.data.set." + this.id, this, value, key);
      return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     - key (string) #optional key
     = (object) @Element
    \*/
    elproto.removeData = function(key) {
      if (key == null) {
        eldata[this.id] = {};
      } else {
        eldata[this.id] && delete eldata[this.id][key];
      }
      return this;
    };
    /*\
     * Element.outerSVG
     [ method ]
     **
     * Returns SVG code for the element, equivalent to HTML's `outerHTML`.
     *
     * See also @Element.innerSVG
     = (string) SVG code for the element
    \*/
    /*\
     * Element.toString
     [ method ]
     **
     * See @Element.outerSVG
    \*/
    elproto.outerSVG = elproto.toString = toString(1);
    /*\
     * Element.innerSVG
     [ method ]
     **
     * Returns SVG code for the element's contents, equivalent to HTML's `innerHTML`
     = (string) SVG code for the element
    \*/
    elproto.innerSVG = toString();
    function toString(type) {
      return function() {
        var res = type ? "<" + this.type : "",
          attr = this.node.attributes,
          chld = this.node.childNodes;
        if (type) {
          for (var i = 0, ii = attr.length; i < ii; i++) {
            res +=
              " " +
              attr[i].name +
              '="' +
              attr[i].value.replace(/"/g, '\\"') +
              '"';
          }
        }
        if (chld.length) {
          type && (res += ">");
          for (i = 0, ii = chld.length; i < ii; i++) {
            if (chld[i].nodeType == 3) {
              res += chld[i].nodeValue;
            } else if (chld[i].nodeType == 1) {
              res += wrap(chld[i]).toString();
            }
          }
          type && (res += "</" + this.type + ">");
        } else {
          type && (res += "/>");
        }
        return res;
      };
    }
    elproto.toDataURL = function() {
      if (window && window.btoa) {
        var bb = this.getBBox(),
          svg = Snap.format(
            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}" height="{height}" viewBox="{x} {y} {width} {height}">{contents}</svg>',
            {
              x: +bb.x.toFixed(3),
              y: +bb.y.toFixed(3),
              width: +bb.width.toFixed(3),
              height: +bb.height.toFixed(3),
              contents: this.outerSVG()
            }
          );
        return (
          "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)))
        );
      }
    };
    /*\
     * Fragment.select
     [ method ]
     **
     * See @Element.select
    \*/
    Fragment.prototype.select = elproto.select;
    /*\
     * Fragment.selectAll
     [ method ]
     **
     * See @Element.selectAll
    \*/
    Fragment.prototype.selectAll = elproto.selectAll;
  });

  // Copyright (c) 2016 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var elproto = Element.prototype,
      is = Snap.is,
      Str = String,
      has = "hasOwnProperty";
    function slice(from, to, f) {
      return function(arr) {
        var res = arr.slice(from, to);
        if (res.length == 1) {
          res = res[0];
        }
        return f ? f(res) : res;
      };
    }
    var Animation = function(attr, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }
      this.attr = attr;
      this.dur = ms;
      easing && (this.easing = easing);
      callback && (this.callback = callback);
    };
    Snap._.Animation = Animation;
    /*\
     * Snap.animation
     [ method ]
     **
     * Creates an animation object
     **
     - attr (object) attributes of final destination
     - duration (number) duration of the animation, in milliseconds
     - easing (function) #optional one of easing functions of @mina or custom one
     - callback (function) #optional callback function that fires when animation ends
     = (object) animation object
    \*/
    Snap.animation = function(attr, ms, easing, callback) {
      return new Animation(attr, ms, easing, callback);
    };
    /*\
     * Element.inAnim
     [ method ]
     **
     * Returns a set of animations that may be able to manipulate the current element
     **
     = (object) in format:
     o {
     o     anim (object) animation object,
     o     mina (object) @mina object,
     o     curStatus (number) 0..1 — status of the animation: 0 — just started, 1 — just finished,
     o     status (function) gets or sets the status of the animation,
     o     stop (function) stops the animation
     o }
    \*/
    elproto.inAnim = function() {
      var el = this,
        res = [];
      for (var id in el.anims)
        if (el.anims[has](id)) {
          (function(a) {
            res.push({
              anim: new Animation(a._attrs, a.dur, a.easing, a._callback),
              mina: a,
              curStatus: a.status(),
              status: function(val) {
                return a.status(val);
              },
              stop: function() {
                a.stop();
              }
            });
          })(el.anims[id]);
        }
      return res;
    };
    /*\
     * Snap.animate
     [ method ]
     **
     * Runs generic animation of one number into another with a caring function
     **
     - from (number|array) number or array of numbers
     - to (number|array) number or array of numbers
     - setter (function) caring function that accepts one number argument
     - duration (number) duration, in milliseconds
     - easing (function) #optional easing function from @mina or custom
     - callback (function) #optional callback function to execute when animation ends
     = (object) animation object in @mina format
     o {
     o     id (string) animation id, consider it read-only,
     o     duration (function) gets or sets the duration of the animation,
     o     easing (function) easing,
     o     speed (function) gets or sets the speed of the animation,
     o     status (function) gets or sets the status of the animation,
     o     stop (function) stops the animation
     o }
     | var rect = Snap().rect(0, 0, 10, 10);
     | Snap.animate(0, 10, function (val) {
     |     rect.attr({
     |         x: val
     |     });
     | }, 1000);
     | // in given context is equivalent to
     | rect.animate({x: 10}, 1000);
    \*/
    Snap.animate = function(from, to, setter, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }
      var now = mina.time(),
        anim = mina(from, to, now, now + ms, mina.time, setter, easing);
      callback && eve.once("mina.finish." + anim.id, callback);
      return anim;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops all the animations for the current element
     **
     = (Element) the current element
    \*/
    elproto.stop = function() {
      var anims = this.inAnim();
      for (var i = 0, ii = anims.length; i < ii; i++) {
        anims[i].stop();
      }
      return this;
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Animates the given attributes of the element
     **
     - attrs (object) key-value pairs of destination attributes
     - duration (number) duration of the animation in milliseconds
     - easing (function) #optional easing function from @mina or custom
     - callback (function) #optional callback function that executes when the animation ends
     = (Element) the current element
    \*/
    elproto.animate = function(attrs, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }
      if (attrs instanceof Animation) {
        callback = attrs.callback;
        easing = attrs.easing;
        ms = attrs.dur;
        attrs = attrs.attr;
      }
      var fkeys = [],
        tkeys = [],
        keys = {},
        from,
        to,
        f,
        eq,
        el = this;
      for (var key in attrs)
        if (attrs[has](key)) {
          if (el.equal) {
            eq = el.equal(key, Str(attrs[key]));
            from = eq.from;
            to = eq.to;
            f = eq.f;
          } else {
            from = +el.attr(key);
            to = +attrs[key];
          }
          var len = is(from, "array") ? from.length : 1;
          keys[key] = slice(fkeys.length, fkeys.length + len, f);
          fkeys = fkeys.concat(from);
          tkeys = tkeys.concat(to);
        }
      var now = mina.time(),
        anim = mina(
          fkeys,
          tkeys,
          now,
          now + ms,
          mina.time,
          function(val) {
            var attr = {};
            for (var key in keys)
              if (keys[has](key)) {
                attr[key] = keys[key](val);
              }
            el.attr(attr);
          },
          easing
        );
      el.anims[anim.id] = anim;
      anim._attrs = attrs;
      anim._callback = callback;
      eve("snap.animcreated." + el.id, anim);
      eve.once("mina.finish." + anim.id, function() {
        eve.off("mina.*." + anim.id);
        delete el.anims[anim.id];
        callback && callback.call(el);
      });
      eve.once("mina.stop." + anim.id, function() {
        eve.off("mina.*." + anim.id);
        delete el.anims[anim.id];
      });
      return el;
    };
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var objectToString = Object.prototype.toString,
      Str = String,
      math = Math,
      E = "";
    function Matrix(a, b, c, d, e, f) {
      if (b == null && objectToString.call(a) == "[object SVGMatrix]") {
        this.a = a.a;
        this.b = a.b;
        this.c = a.c;
        this.d = a.d;
        this.e = a.e;
        this.f = a.f;
        return;
      }
      if (a != null) {
        this.a = +a;
        this.b = +b;
        this.c = +c;
        this.d = +d;
        this.e = +e;
        this.f = +f;
      } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
      }
    }
    (function(matrixproto) {
      /*\
         * Matrix.add
         [ method ]
         **
         * Adds the given matrix to existing one
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         * or
         - matrix (object) @Matrix
        \*/
      matrixproto.add = function(a, b, c, d, e, f) {
        if (a && a instanceof Matrix) {
          return this.add(a.a, a.b, a.c, a.d, a.e, a.f);
        }
        var aNew = a * this.a + b * this.c,
          bNew = a * this.b + b * this.d;
        this.e += e * this.a + f * this.c;
        this.f += e * this.b + f * this.d;
        this.c = c * this.a + d * this.c;
        this.d = c * this.b + d * this.d;

        this.a = aNew;
        this.b = bNew;
        return this;
      };
      /*\
         * Matrix.multLeft
         [ method ]
         **
         * Multiplies a passed affine transform to the left: M * this.
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         * or
         - matrix (object) @Matrix
        \*/
      Matrix.prototype.multLeft = function(a, b, c, d, e, f) {
        if (a && a instanceof Matrix) {
          return this.multLeft(a.a, a.b, a.c, a.d, a.e, a.f);
        }
        var aNew = a * this.a + c * this.b,
          cNew = a * this.c + c * this.d,
          eNew = a * this.e + c * this.f + e;
        this.b = b * this.a + d * this.b;
        this.d = b * this.c + d * this.d;
        this.f = b * this.e + d * this.f + f;

        this.a = aNew;
        this.c = cNew;
        this.e = eNew;
        return this;
      };
      /*\
         * Matrix.invert
         [ method ]
         **
         * Returns an inverted version of the matrix
         = (object) @Matrix
        \*/
      matrixproto.invert = function() {
        var me = this,
          x = me.a * me.d - me.b * me.c;
        return new Matrix(
          me.d / x,
          -me.b / x,
          -me.c / x,
          me.a / x,
          (me.c * me.f - me.d * me.e) / x,
          (me.b * me.e - me.a * me.f) / x
        );
      };
      /*\
         * Matrix.clone
         [ method ]
         **
         * Returns a copy of the matrix
         = (object) @Matrix
        \*/
      matrixproto.clone = function() {
        return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
      };
      /*\
         * Matrix.translate
         [ method ]
         **
         * Translate the matrix
         - x (number) horizontal offset distance
         - y (number) vertical offset distance
        \*/
      matrixproto.translate = function(x, y) {
        this.e += x * this.a + y * this.c;
        this.f += x * this.b + y * this.d;
        return this;
      };
      /*\
         * Matrix.scale
         [ method ]
         **
         * Scales the matrix
         - x (number) amount to be scaled, with `1` resulting in no change
         - y (number) #optional amount to scale along the vertical axis. (Otherwise `x` applies to both axes.)
         - cx (number) #optional horizontal origin point from which to scale
         - cy (number) #optional vertical origin point from which to scale
         * Default cx, cy is the middle point of the element.
        \*/
      matrixproto.scale = function(x, y, cx, cy) {
        y == null && (y = x);
        (cx || cy) && this.translate(cx, cy);
        this.a *= x;
        this.b *= x;
        this.c *= y;
        this.d *= y;
        (cx || cy) && this.translate(-cx, -cy);
        return this;
      };
      /*\
         * Matrix.rotate
         [ method ]
         **
         * Rotates the matrix
         - a (number) angle of rotation, in degrees
         - x (number) horizontal origin point from which to rotate
         - y (number) vertical origin point from which to rotate
        \*/
      matrixproto.rotate = function(a, x, y) {
        a = Snap.rad(a);
        x = x || 0;
        y = y || 0;
        var cos = +math.cos(a).toFixed(9),
          sin = +math.sin(a).toFixed(9);
        this.add(cos, sin, -sin, cos, x, y);
        return this.add(1, 0, 0, 1, -x, -y);
      };
      /*\
         * Matrix.skewX
         [ method ]
         **
         * Skews the matrix along the x-axis
         - x (number) Angle to skew along the x-axis (in degrees).
        \*/
      matrixproto.skewX = function(x) {
        return this.skew(x, 0);
      };
      /*\
         * Matrix.skewY
         [ method ]
         **
         * Skews the matrix along the y-axis
         - y (number) Angle to skew along the y-axis (in degrees).
        \*/
      matrixproto.skewY = function(y) {
        return this.skew(0, y);
      };
      /*\
         * Matrix.skew
         [ method ]
         **
         * Skews the matrix
         - y (number) Angle to skew along the y-axis (in degrees).
         - x (number) Angle to skew along the x-axis (in degrees).
        \*/
      matrixproto.skew = function(x, y) {
        x = x || 0;
        y = y || 0;
        x = Snap.rad(x);
        y = Snap.rad(y);
        var c = math.tan(x).toFixed(9);
        var b = math.tan(y).toFixed(9);
        return this.add(1, b, c, 1, 0, 0);
      };
      /*\
         * Matrix.x
         [ method ]
         **
         * Returns x coordinate for given point after transformation described by the matrix. See also @Matrix.y
         - x (number)
         - y (number)
         = (number) x
        \*/
      matrixproto.x = function(x, y) {
        return x * this.a + y * this.c + this.e;
      };
      /*\
         * Matrix.y
         [ method ]
         **
         * Returns y coordinate for given point after transformation described by the matrix. See also @Matrix.x
         - x (number)
         - y (number)
         = (number) y
        \*/
      matrixproto.y = function(x, y) {
        return x * this.b + y * this.d + this.f;
      };
      matrixproto.get = function(i) {
        return +this[Str.fromCharCode(97 + i)].toFixed(4);
      };
      matrixproto.toString = function() {
        return (
          "matrix(" +
          [
            this.get(0),
            this.get(1),
            this.get(2),
            this.get(3),
            this.get(4),
            this.get(5)
          ].join() +
          ")"
        );
      };
      matrixproto.offset = function() {
        return [this.e.toFixed(4), this.f.toFixed(4)];
      };
      function norm(a) {
        return a[0] * a[0] + a[1] * a[1];
      }
      function normalize(a) {
        var mag = math.sqrt(norm(a));
        a[0] && (a[0] /= mag);
        a[1] && (a[1] /= mag);
      }
      /*\
         * Matrix.determinant
         [ method ]
         **
         * Finds determinant of the given matrix.
         = (number) determinant
        \*/
      matrixproto.determinant = function() {
        return this.a * this.d - this.b * this.c;
      };
      /*\
         * Matrix.split
         [ method ]
         **
         * Splits matrix into primitive transformations
         = (object) in format:
         o dx (number) translation by x
         o dy (number) translation by y
         o scalex (number) scale by x
         o scaley (number) scale by y
         o shear (number) shear
         o rotate (number) rotation in deg
         o isSimple (boolean) could it be represented via simple transformations
        \*/
      matrixproto.split = function() {
        var out = {};
        // translation
        out.dx = this.e;
        out.dy = this.f;

        // scale and shear
        var row = [[this.a, this.b], [this.c, this.d]];
        out.scalex = math.sqrt(norm(row[0]));
        normalize(row[0]);

        out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
        row[1] = [
          row[1][0] - row[0][0] * out.shear,
          row[1][1] - row[0][1] * out.shear
        ];

        out.scaley = math.sqrt(norm(row[1]));
        normalize(row[1]);
        out.shear /= out.scaley;

        if (this.determinant() < 0) {
          out.scalex = -out.scalex;
        }

        // rotation
        var sin = row[0][1],
          cos = row[1][1];
        if (cos < 0) {
          out.rotate = Snap.deg(math.acos(cos));
          if (sin < 0) {
            out.rotate = 360 - out.rotate;
          }
        } else {
          out.rotate = Snap.deg(math.asin(sin));
        }

        out.isSimple =
          !+out.shear.toFixed(9) &&
          (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
        out.isSuperSimple =
          !+out.shear.toFixed(9) &&
          out.scalex.toFixed(9) == out.scaley.toFixed(9) &&
          !out.rotate;
        out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
        return out;
      };
      /*\
         * Matrix.toTransformString
         [ method ]
         **
         * Returns transform string that represents given matrix
         = (string) transform string
        \*/
      matrixproto.toTransformString = function(shorter) {
        var s = shorter || this.split();
        if (!+s.shear.toFixed(9)) {
          s.scalex = +s.scalex.toFixed(4);
          s.scaley = +s.scaley.toFixed(4);
          s.rotate = +s.rotate.toFixed(4);
          return (
            (s.dx || s.dy ? "t" + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) +
            (s.rotate ? "r" + [+s.rotate.toFixed(4), 0, 0] : E) +
            (s.scalex != 1 || s.scaley != 1
              ? "s" + [s.scalex, s.scaley, 0, 0]
              : E)
          );
        } else {
          return (
            "m" +
            [
              this.get(0),
              this.get(1),
              this.get(2),
              this.get(3),
              this.get(4),
              this.get(5)
            ]
          );
        }
      };
    })(Matrix.prototype);
    /*\
     * Snap.Matrix
     [ method ]
     **
     * Matrix constructor, extend on your own risk.
     * To create matrices use @Snap.matrix.
    \*/
    Snap.Matrix = Matrix;
    /*\
     * Snap.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns a matrix based on the given parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     * or
     - svgMatrix (SVGMatrix)
     = (object) @Matrix
    \*/
    Snap.matrix = function(a, b, c, d, e, f) {
      return new Matrix(a, b, c, d, e, f);
    };
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var has = "hasOwnProperty",
      make = Snap._.make,
      wrap = Snap._.wrap,
      is = Snap.is,
      getSomeDefs = Snap._.getSomeDefs,
      reURLValue = /^url\((['"]?)([^)]+)\1\)$/,
      $ = Snap._.$,
      URL = Snap.url,
      Str = String,
      separator = Snap._.separator,
      E = "";
    /*\
     * Snap.deurl
     [ method ]
     **
     * Unwraps path from `"url(<path>)"`.
     - value (string) url path
     = (string) unwrapped path
    \*/
    Snap.deurl = function(value) {
      var res = String(value).match(reURLValue);
      return res ? res[2] : value;
    };
    // Attributes event handlers
    eve.on("snap.util.attr.mask", function(value) {
      if (value instanceof Element || value instanceof Fragment) {
        eve.stop();
        if (value instanceof Fragment && value.node.childNodes.length == 1) {
          value = value.node.firstChild;
          getSomeDefs(this).appendChild(value);
          value = wrap(value);
        }
        if (value.type == "mask") {
          var mask = value;
        } else {
          mask = make("mask", getSomeDefs(this));
          mask.node.appendChild(value.node);
        }
        !mask.node.id &&
          $(mask.node, {
            id: mask.id
          });
        $(this.node, {
          mask: URL(mask.id)
        });
      }
    });
    (function(clipIt) {
      eve.on("snap.util.attr.clip", clipIt);
      eve.on("snap.util.attr.clip-path", clipIt);
      eve.on("snap.util.attr.clipPath", clipIt);
    })(function(value) {
      if (value instanceof Element || value instanceof Fragment) {
        eve.stop();
        var clip,
          node = value.node;
        while (node) {
          if (node.nodeName === "clipPath") {
            clip = new Element(node);
            break;
          }
          if (node.nodeName === "svg") {
            clip = undefined;
            break;
          }
          node = node.parentNode;
        }
        if (!clip) {
          clip = make("clipPath", getSomeDefs(this));
          clip.node.appendChild(value.node);
          !clip.node.id &&
            $(clip.node, {
              id: clip.id
            });
        }
        $(this.node, {
          "clip-path": URL(clip.node.id || clip.id)
        });
      }
    });
    function fillStroke(name) {
      return function(value) {
        eve.stop();
        if (
          value instanceof Fragment &&
          value.node.childNodes.length == 1 &&
          (value.node.firstChild.tagName == "radialGradient" ||
            value.node.firstChild.tagName == "linearGradient" ||
            value.node.firstChild.tagName == "pattern")
        ) {
          value = value.node.firstChild;
          getSomeDefs(this).appendChild(value);
          value = wrap(value);
        }
        if (value instanceof Element) {
          if (
            value.type == "radialGradient" ||
            value.type == "linearGradient" ||
            value.type == "pattern"
          ) {
            if (!value.node.id) {
              $(value.node, {
                id: value.id
              });
            }
            var fill = URL(value.node.id);
          } else {
            fill = value.attr(name);
          }
        } else {
          fill = Snap.color(value);
          if (fill.error) {
            var grad = Snap(getSomeDefs(this).ownerSVGElement).gradient(value);
            if (grad) {
              if (!grad.node.id) {
                $(grad.node, {
                  id: grad.id
                });
              }
              fill = URL(grad.node.id);
            } else {
              fill = value;
            }
          } else {
            fill = Str(fill);
          }
        }
        var attrs = {};
        attrs[name] = fill;
        $(this.node, attrs);
        this.node.style[name] = E;
      };
    }
    eve.on("snap.util.attr.fill", fillStroke("fill"));
    eve.on("snap.util.attr.stroke", fillStroke("stroke"));
    var gradrg = /^([lr])(?:\(([^)]*)\))?(.*)$/i;
    eve.on("snap.util.grad.parse", function parseGrad(string) {
      string = Str(string);
      var tokens = string.match(gradrg);
      if (!tokens) {
        return null;
      }
      var type = tokens[1],
        params = tokens[2],
        stops = tokens[3];
      params = params.split(/\s*,\s*/).map(function(el) {
        return +el == el ? +el : el;
      });
      if (params.length == 1 && params[0] == 0) {
        params = [];
      }
      stops = stops.split("-");
      stops = stops.map(function(el) {
        el = el.split(":");
        var out = {
          color: el[0]
        };
        if (el[1]) {
          out.offset = parseFloat(el[1]);
        }
        return out;
      });
      var len = stops.length,
        start = 0,
        j = 0;
      function seed(i, end) {
        var step = (end - start) / (i - j);
        for (var k = j; k < i; k++) {
          stops[k].offset = +(+start + step * (k - j)).toFixed(2);
        }
        j = i;
        start = end;
      }
      len--;
      for (var i = 0; i < len; i++)
        if ("offset" in stops[i]) {
          seed(i, stops[i].offset);
        }
      stops[len].offset = stops[len].offset || 100;
      seed(len, stops[len].offset);
      return {
        type: type,
        params: params,
        stops: stops
      };
    });

    eve.on("snap.util.attr.d", function(value) {
      eve.stop();
      if (is(value, "array") && is(value[0], "array")) {
        value = Snap.path.toString.call(value);
      }
      value = Str(value);
      if (value.match(/[ruo]/i)) {
        value = Snap.path.toAbsolute(value);
      }
      $(this.node, { d: value });
    })(-1);
    eve.on("snap.util.attr.#text", function(value) {
      eve.stop();
      value = Str(value);
      var txt = glob.doc.createTextNode(value);
      while (this.node.firstChild) {
        this.node.removeChild(this.node.firstChild);
      }
      this.node.appendChild(txt);
    })(-1);
    eve.on("snap.util.attr.path", function(value) {
      eve.stop();
      this.attr({ d: value });
    })(-1);
    eve.on("snap.util.attr.class", function(value) {
      eve.stop();
      this.node.className.baseVal = value;
    })(-1);
    eve.on("snap.util.attr.viewBox", function(value) {
      var vb;
      if (is(value, "object") && "x" in value) {
        vb = [value.x, value.y, value.width, value.height].join(" ");
      } else if (is(value, "array")) {
        vb = value.join(" ");
      } else {
        vb = value;
      }
      $(this.node, {
        viewBox: vb
      });
      eve.stop();
    })(-1);
    eve.on("snap.util.attr.transform", function(value) {
      this.transform(value);
      eve.stop();
    })(-1);
    eve.on("snap.util.attr.r", function(value) {
      if (this.type == "rect") {
        eve.stop();
        $(this.node, {
          rx: value,
          ry: value
        });
      }
    })(-1);
    eve.on("snap.util.attr.textpath", function(value) {
      eve.stop();
      if (this.type == "text") {
        var id, tp, node;
        if (!value && this.textPath) {
          tp = this.textPath;
          while (tp.node.firstChild) {
            this.node.appendChild(tp.node.firstChild);
          }
          tp.remove();
          delete this.textPath;
          return;
        }
        if (is(value, "string")) {
          var defs = getSomeDefs(this),
            path = wrap(defs.parentNode).path(value);
          defs.appendChild(path.node);
          id = path.id;
          path.attr({ id: id });
        } else {
          value = wrap(value);
          if (value instanceof Element) {
            id = value.attr("id");
            if (!id) {
              id = value.id;
              value.attr({ id: id });
            }
          }
        }
        if (id) {
          tp = this.textPath;
          node = this.node;
          if (tp) {
            tp.attr({ "xlink:href": "#" + id });
          } else {
            tp = $("textPath", {
              "xlink:href": "#" + id
            });
            while (node.firstChild) {
              tp.appendChild(node.firstChild);
            }
            node.appendChild(tp);
            this.textPath = wrap(tp);
          }
        }
      }
    })(-1);
    eve.on("snap.util.attr.text", function(value) {
      if (this.type == "text") {
        var i = 0,
          node = this.node,
          tuner = function(chunk) {
            var out = $("tspan");
            if (is(chunk, "array")) {
              for (var i = 0; i < chunk.length; i++) {
                out.appendChild(tuner(chunk[i]));
              }
            } else {
              out.appendChild(glob.doc.createTextNode(chunk));
            }
            out.normalize && out.normalize();
            return out;
          };
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
        var tuned = tuner(value);
        while (tuned.firstChild) {
          node.appendChild(tuned.firstChild);
        }
      }
      eve.stop();
    })(-1);
    function setFontSize(value) {
      eve.stop();
      if (value == +value) {
        value += "px";
      }
      this.node.style.fontSize = value;
    }
    eve.on("snap.util.attr.fontSize", setFontSize)(-1);
    eve.on("snap.util.attr.font-size", setFontSize)(-1);

    eve.on("snap.util.getattr.transform", function() {
      eve.stop();
      return this.transform();
    })(-1);
    eve.on("snap.util.getattr.textpath", function() {
      eve.stop();
      return this.textPath;
    })(-1);
    // Markers
    (function() {
      function getter(end) {
        return function() {
          eve.stop();
          var style = glob.doc.defaultView
            .getComputedStyle(this.node, null)
            .getPropertyValue("marker-" + end);
          if (style == "none") {
            return style;
          } else {
            return Snap(glob.doc.getElementById(style.match(reURLValue)[1]));
          }
        };
      }
      function setter(end) {
        return function(value) {
          eve.stop();
          var name = "marker" + end.charAt(0).toUpperCase() + end.substring(1);
          if (value == "" || !value) {
            this.node.style[name] = "none";
            return;
          }
          if (value.type == "marker") {
            var id = value.node.id;
            if (!id) {
              $(value.node, { id: value.id });
            }
            this.node.style[name] = URL(id);
            return;
          }
        };
      }
      eve.on("snap.util.getattr.marker-end", getter("end"))(-1);
      eve.on("snap.util.getattr.markerEnd", getter("end"))(-1);
      eve.on("snap.util.getattr.marker-start", getter("start"))(-1);
      eve.on("snap.util.getattr.markerStart", getter("start"))(-1);
      eve.on("snap.util.getattr.marker-mid", getter("mid"))(-1);
      eve.on("snap.util.getattr.markerMid", getter("mid"))(-1);
      eve.on("snap.util.attr.marker-end", setter("end"))(-1);
      eve.on("snap.util.attr.markerEnd", setter("end"))(-1);
      eve.on("snap.util.attr.marker-start", setter("start"))(-1);
      eve.on("snap.util.attr.markerStart", setter("start"))(-1);
      eve.on("snap.util.attr.marker-mid", setter("mid"))(-1);
      eve.on("snap.util.attr.markerMid", setter("mid"))(-1);
    })();
    eve.on("snap.util.getattr.r", function() {
      if (this.type == "rect" && $(this.node, "rx") == $(this.node, "ry")) {
        eve.stop();
        return $(this.node, "rx");
      }
    })(-1);
    function textExtract(node) {
      var out = [];
      var children = node.childNodes;
      for (var i = 0, ii = children.length; i < ii; i++) {
        var chi = children[i];
        if (chi.nodeType == 3) {
          out.push(chi.nodeValue);
        }
        if (chi.tagName == "tspan") {
          if (chi.childNodes.length == 1 && chi.firstChild.nodeType == 3) {
            out.push(chi.firstChild.nodeValue);
          } else {
            out.push(textExtract(chi));
          }
        }
      }
      return out;
    }
    eve.on("snap.util.getattr.text", function() {
      if (this.type == "text" || this.type == "tspan") {
        eve.stop();
        var out = textExtract(this.node);
        return out.length == 1 ? out[0] : out;
      }
    })(-1);
    eve.on("snap.util.getattr.#text", function() {
      return this.node.textContent;
    })(-1);
    eve.on("snap.util.getattr.fill", function(internal) {
      if (internal) {
        return;
      }
      eve.stop();
      var value = eve("snap.util.getattr.fill", this, true).firstDefined();
      return Snap(Snap.deurl(value)) || value;
    })(-1);
    eve.on("snap.util.getattr.stroke", function(internal) {
      if (internal) {
        return;
      }
      eve.stop();
      var value = eve("snap.util.getattr.stroke", this, true).firstDefined();
      return Snap(Snap.deurl(value)) || value;
    })(-1);
    eve.on("snap.util.getattr.viewBox", function() {
      eve.stop();
      var vb = $(this.node, "viewBox");
      if (vb) {
        vb = vb.split(separator);
        return Snap._.box(+vb[0], +vb[1], +vb[2], +vb[3]);
      } else {
        return;
      }
    })(-1);
    eve.on("snap.util.getattr.points", function() {
      var p = $(this.node, "points");
      eve.stop();
      if (p) {
        return p.split(separator);
      } else {
        return;
      }
    })(-1);
    eve.on("snap.util.getattr.path", function() {
      var p = $(this.node, "d");
      eve.stop();
      return p;
    })(-1);
    eve.on("snap.util.getattr.class", function() {
      return this.node.className.baseVal;
    })(-1);
    function getFontSize() {
      eve.stop();
      return this.node.style.fontSize;
    }
    eve.on("snap.util.getattr.fontSize", getFontSize)(-1);
    eve.on("snap.util.getattr.font-size", getFontSize)(-1);
  });

  // Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var rgNotSpace = /\S+/g,
      rgBadSpace = /[\t\r\n\f]/g,
      rgTrim = /(^\s+|\s+$)/g,
      Str = String,
      elproto = Element.prototype;
    /*\
     * Element.addClass
     [ method ]
     **
     * Adds given class name or list of class names to the element.
     - value (string) class name or space separated list of class names
     **
     = (Element) original element.
    \*/
    elproto.addClass = function(value) {
      var classes = Str(value || "").match(rgNotSpace) || [],
        elem = this.node,
        className = elem.className.baseVal,
        curClasses = className.match(rgNotSpace) || [],
        j,
        pos,
        clazz,
        finalValue;

      if (classes.length) {
        j = 0;
        while ((clazz = classes[j++])) {
          pos = curClasses.indexOf(clazz);
          if (!~pos) {
            curClasses.push(clazz);
          }
        }

        finalValue = curClasses.join(" ");
        if (className != finalValue) {
          elem.className.baseVal = finalValue;
        }
      }
      return this;
    };
    /*\
     * Element.removeClass
     [ method ]
     **
     * Removes given class name or list of class names from the element.
     - value (string) class name or space separated list of class names
     **
     = (Element) original element.
    \*/
    elproto.removeClass = function(value) {
      var classes = Str(value || "").match(rgNotSpace) || [],
        elem = this.node,
        className = elem.className.baseVal,
        curClasses = className.match(rgNotSpace) || [],
        j,
        pos,
        clazz,
        finalValue;
      if (curClasses.length) {
        j = 0;
        while ((clazz = classes[j++])) {
          pos = curClasses.indexOf(clazz);
          if (~pos) {
            curClasses.splice(pos, 1);
          }
        }

        finalValue = curClasses.join(" ");
        if (className != finalValue) {
          elem.className.baseVal = finalValue;
        }
      }
      return this;
    };
    /*\
     * Element.hasClass
     [ method ]
     **
     * Checks if the element has a given class name in the list of class names applied to it.
     - value (string) class name
     **
     = (boolean) `true` if the element has given class
    \*/
    elproto.hasClass = function(value) {
      var elem = this.node,
        className = elem.className.baseVal,
        curClasses = className.match(rgNotSpace) || [];
      return !!~curClasses.indexOf(value);
    };
    /*\
     * Element.toggleClass
     [ method ]
     **
     * Add or remove one or more classes from the element, depending on either
     * the class’s presence or the value of the `flag` argument.
     - value (string) class name or space separated list of class names
     - flag (boolean) value to determine whether the class should be added or removed
     **
     = (Element) original element.
    \*/
    elproto.toggleClass = function(value, flag) {
      if (flag != null) {
        if (flag) {
          return this.addClass(value);
        } else {
          return this.removeClass(value);
        }
      }
      var classes = (value || "").match(rgNotSpace) || [],
        elem = this.node,
        className = elem.className.baseVal,
        curClasses = className.match(rgNotSpace) || [],
        j,
        pos,
        clazz,
        finalValue;
      j = 0;
      while ((clazz = classes[j++])) {
        pos = curClasses.indexOf(clazz);
        if (~pos) {
          curClasses.splice(pos, 1);
        } else {
          curClasses.push(clazz);
        }
      }

      finalValue = curClasses.join(" ");
      if (className != finalValue) {
        elem.className.baseVal = finalValue;
      }
      return this;
    };
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var operators = {
        "+": function(x, y) {
          return x + y;
        },
        "-": function(x, y) {
          return x - y;
        },
        "/": function(x, y) {
          return x / y;
        },
        "*": function(x, y) {
          return x * y;
        }
      },
      Str = String,
      reUnit = /[a-z]+$/i,
      reAddon = /^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;
    function getNumber(val) {
      return val;
    }
    function getUnit(unit) {
      return function(val) {
        return +val.toFixed(3) + unit;
      };
    }
    eve.on("snap.util.attr", function(val) {
      var plus = Str(val).match(reAddon);
      if (plus) {
        var evnt = eve.nt(),
          name = evnt.substring(evnt.lastIndexOf(".") + 1),
          a = this.attr(name),
          atr = {};
        eve.stop();
        var unit = plus[3] || "",
          aUnit = a.match(reUnit),
          op = operators[plus[1]];
        if (aUnit && aUnit == unit) {
          val = op(parseFloat(a), +plus[2]);
        } else {
          a = this.asPX(name);
          val = op(this.asPX(name), this.asPX(name, plus[2] + unit));
        }
        if (isNaN(a) || isNaN(val)) {
          return;
        }
        atr[name] = val;
        this.attr(atr);
      }
    })(-10);
    eve.on("snap.util.equal", function(name, b) {
      var A,
        B,
        a = Str(this.attr(name) || ""),
        el = this,
        bplus = Str(b).match(reAddon);
      if (bplus) {
        eve.stop();
        var unit = bplus[3] || "",
          aUnit = a.match(reUnit),
          op = operators[bplus[1]];
        if (aUnit && aUnit == unit) {
          return {
            from: parseFloat(a),
            to: op(parseFloat(a), +bplus[2]),
            f: getUnit(aUnit)
          };
        } else {
          a = this.asPX(name);
          return {
            from: a,
            to: op(a, this.asPX(name, bplus[2] + unit)),
            f: getNumber
          };
        }
      }
    })(-10);
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var proto = Paper.prototype,
      is = Snap.is;
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - rx (number) #optional horizontal radius for rounded corners, default is 0
     - ry (number) #optional vertical radius for rounded corners, default is rx or 0
     = (object) the `rect` element
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
    \*/
    proto.rect = function(x, y, w, h, rx, ry) {
      var attr;
      if (ry == null) {
        ry = rx;
      }
      if (is(x, "object") && x == "[object Object]") {
        attr = x;
      } else if (x != null) {
        attr = {
          x: x,
          y: y,
          width: w,
          height: h
        };
        if (rx != null) {
          attr.rx = rx;
          attr.ry = ry;
        }
      }
      return this.el("rect", attr);
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) the `circle` element
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
    \*/
    proto.circle = function(cx, cy, r) {
      var attr;
      if (is(cx, "object") && cx == "[object Object]") {
        attr = cx;
      } else if (cx != null) {
        attr = {
          cx: cx,
          cy: cy,
          r: r
        };
      }
      return this.el("circle", attr);
    };

    var preload = (function() {
      function onerror() {
        this.parentNode.removeChild(this);
      }
      return function(src, f) {
        var img = glob.doc.createElement("img"),
          body = glob.doc.body;
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function() {
          f.call(img);
          img.onload = img.onerror = null;
          body.removeChild(img);
        };
        img.onerror = onerror;
        body.appendChild(img);
        img.src = src;
      };
    })();

    /*\
     * Paper.image
     [ method ]
     **
     * Places an image on the surface
     **
     - src (string) URI of the source image
     - x (number) x offset position
     - y (number) y offset position
     - width (number) width of the image
     - height (number) height of the image
     = (object) the `image` element
     * or
     = (object) Snap element object with type `image`
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
    \*/
    proto.image = function(src, x, y, width, height) {
      var el = this.el("image");
      if (is(src, "object") && "src" in src) {
        el.attr(src);
      } else if (src != null) {
        var set = {
          "xlink:href": src,
          preserveAspectRatio: "none"
        };
        if (x != null && y != null) {
          set.x = x;
          set.y = y;
        }
        if (width != null && height != null) {
          set.width = width;
          set.height = height;
        } else {
          preload(src, function() {
            Snap._.$(el.node, {
              width: this.offsetWidth,
              height: this.offsetHeight
            });
          });
        }
        Snap._.$(el.node, set);
      }
      return el;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) the `ellipse` element
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
    \*/
    proto.ellipse = function(cx, cy, rx, ry) {
      var attr;
      if (is(cx, "object") && cx == "[object Object]") {
        attr = cx;
      } else if (cx != null) {
        attr = {
          cx: cx,
          cy: cy,
          rx: rx,
          ry: ry
        };
      }
      return this.el("ellipse", attr);
    };
    // SIERRA Paper.path(): Unclear from the link what a Catmull-Rom curveto is, and why it would make life any easier.
    /*\
     * Paper.path
     [ method ]
     **
     * Creates a `<path>` element using the given string as the path's definition
     - pathString (string) #optional path string in SVG format
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numerical form. Example:
     | "M10,20L30,40"
     * This example features two commands: `M`, with arguments `(10, 20)` and `L` with arguments `(30, 40)`. Uppercase letter commands express coordinates in absolute terms, while lowercase commands express them in relative terms from the most recently declared coordinates.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a> or <a href="https://developer.mozilla.org/en/SVG/Tutorial/Paths">article about path strings at MDN</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * _Catmull-Rom curveto_ is a not standard SVG command and added to make life easier.
     * Note: there is a special case when a path consists of only three commands: `M10,10R…z`. In this case the path connects back to its starting point.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
    \*/
    proto.path = function(d) {
      var attr;
      if (is(d, "object") && !is(d, "array")) {
        attr = d;
      } else if (d) {
        attr = { d: d };
      }
      return this.el("path", attr);
    };
    /*\
     * Paper.g
     [ method ]
     **
     * Creates a group element
     **
     - varargs (…) #optional elements to nest within the group
     = (object) the `g` element
     **
     > Usage
     | var c1 = paper.circle(),
     |     c2 = paper.rect(),
     |     g = paper.g(c2, c1); // note that the order of elements is different
     * or
     | var c1 = paper.circle(),
     |     c2 = paper.rect(),
     |     g = paper.g();
     | g.add(c2, c1);
    \*/
    /*\
     * Paper.group
     [ method ]
     **
     * See @Paper.g
    \*/
    proto.group = proto.g = function(first) {
      var attr,
        el = this.el("g");
      if (arguments.length == 1 && first && !first.type) {
        el.attr(first);
      } else if (arguments.length) {
        el.add(Array.prototype.slice.call(arguments, 0));
      }
      return el;
    };
    /*\
     * Paper.svg
     [ method ]
     **
     * Creates a nested SVG element.
     - x (number) @optional X of the element
     - y (number) @optional Y of the element
     - width (number) @optional width of the element
     - height (number) @optional height of the element
     - vbx (number) @optional viewbox X
     - vby (number) @optional viewbox Y
     - vbw (number) @optional viewbox width
     - vbh (number) @optional viewbox height
     **
     = (object) the `svg` element
     **
    \*/
    proto.svg = function(x, y, width, height, vbx, vby, vbw, vbh) {
      var attrs = {};
      if (is(x, "object") && y == null) {
        attrs = x;
      } else {
        if (x != null) {
          attrs.x = x;
        }
        if (y != null) {
          attrs.y = y;
        }
        if (width != null) {
          attrs.width = width;
        }
        if (height != null) {
          attrs.height = height;
        }
        if (vbx != null && vby != null && vbw != null && vbh != null) {
          attrs.viewBox = [vbx, vby, vbw, vbh];
        }
      }
      return this.el("svg", attrs);
    };
    /*\
     * Paper.mask
     [ method ]
     **
     * Equivalent in behaviour to @Paper.g, except it’s a mask.
     **
     = (object) the `mask` element
     **
    \*/
    proto.mask = function(first) {
      var attr,
        el = this.el("mask");
      if (arguments.length == 1 && first && !first.type) {
        el.attr(first);
      } else if (arguments.length) {
        el.add(Array.prototype.slice.call(arguments, 0));
      }
      return el;
    };
    /*\
     * Paper.ptrn
     [ method ]
     **
     * Equivalent in behaviour to @Paper.g, except it’s a pattern.
     - x (number) @optional X of the element
     - y (number) @optional Y of the element
     - width (number) @optional width of the element
     - height (number) @optional height of the element
     - vbx (number) @optional viewbox X
     - vby (number) @optional viewbox Y
     - vbw (number) @optional viewbox width
     - vbh (number) @optional viewbox height
     **
     = (object) the `pattern` element
     **
    \*/
    proto.ptrn = function(x, y, width, height, vx, vy, vw, vh) {
      if (is(x, "object")) {
        var attr = x;
      } else {
        attr = { patternUnits: "userSpaceOnUse" };
        if (x) {
          attr.x = x;
        }
        if (y) {
          attr.y = y;
        }
        if (width != null) {
          attr.width = width;
        }
        if (height != null) {
          attr.height = height;
        }
        if (vx != null && vy != null && vw != null && vh != null) {
          attr.viewBox = [vx, vy, vw, vh];
        } else {
          attr.viewBox = [x || 0, y || 0, width || 0, height || 0];
        }
      }
      return this.el("pattern", attr);
    };
    /*\
     * Paper.use
     [ method ]
     **
     * Creates a <use> element.
     - id (string) @optional id of element to link
     * or
     - id (Element) @optional element to link
     **
     = (object) the `use` element
     **
    \*/
    proto.use = function(id) {
      if (id != null) {
        if (id instanceof Element) {
          if (!id.attr("id")) {
            id.attr({ id: Snap._.id(id) });
          }
          id = id.attr("id");
        }
        if (String(id).charAt() == "#") {
          id = id.substring(1);
        }
        return this.el("use", { "xlink:href": "#" + id });
      } else {
        return Element.prototype.use.call(this);
      }
    };
    /*\
     * Paper.symbol
     [ method ]
     **
     * Creates a <symbol> element.
     - vbx (number) @optional viewbox X
     - vby (number) @optional viewbox Y
     - vbw (number) @optional viewbox width
     - vbh (number) @optional viewbox height
     = (object) the `symbol` element
     **
    \*/
    proto.symbol = function(vx, vy, vw, vh) {
      var attr = {};
      if (vx != null && vy != null && vw != null && vh != null) {
        attr.viewBox = [vx, vy, vw, vh];
      }

      return this.el("symbol", attr);
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string|array) The text string to draw or array of strings to nest within separate `<tspan>` elements
     = (object) the `text` element
     **
     > Usage
     | var t1 = paper.text(50, 50, "Snap");
     | var t2 = paper.text(50, 50, ["S","n","a","p"]);
     | // Text path usage
     | t1.attr({textpath: "M10,10L100,100"});
     | // or
     | var pth = paper.path("M10,10L100,100");
     | t1.attr({textpath: pth});
    \*/
    proto.text = function(x, y, text) {
      var attr = {};
      if (is(x, "object")) {
        attr = x;
      } else if (x != null) {
        attr = {
          x: x,
          y: y,
          text: text || ""
        };
      }
      return this.el("text", attr);
    };
    /*\
     * Paper.line
     [ method ]
     **
     * Draws a line
     **
     - x1 (number) x coordinate position of the start
     - y1 (number) y coordinate position of the start
     - x2 (number) x coordinate position of the end
     - y2 (number) y coordinate position of the end
     = (object) the `line` element
     **
     > Usage
     | var t1 = paper.line(50, 50, 100, 100);
    \*/
    proto.line = function(x1, y1, x2, y2) {
      var attr = {};
      if (is(x1, "object")) {
        attr = x1;
      } else if (x1 != null) {
        attr = {
          x1: x1,
          x2: x2,
          y1: y1,
          y2: y2
        };
      }
      return this.el("line", attr);
    };
    /*\
     * Paper.polyline
     [ method ]
     **
     * Draws a polyline
     **
     - points (array) array of points
     * or
     - varargs (…) points
     = (object) the `polyline` element
     **
     > Usage
     | var p1 = paper.polyline([10, 10, 100, 100]);
     | var p2 = paper.polyline(10, 10, 100, 100);
    \*/
    proto.polyline = function(points) {
      if (arguments.length > 1) {
        points = Array.prototype.slice.call(arguments, 0);
      }
      var attr = {};
      if (is(points, "object") && !is(points, "array")) {
        attr = points;
      } else if (points != null) {
        attr = { points: points };
      }
      return this.el("polyline", attr);
    };
    /*\
     * Paper.polygon
     [ method ]
     **
     * Draws a polygon. See @Paper.polyline
    \*/
    proto.polygon = function(points) {
      if (arguments.length > 1) {
        points = Array.prototype.slice.call(arguments, 0);
      }
      var attr = {};
      if (is(points, "object") && !is(points, "array")) {
        attr = points;
      } else if (points != null) {
        attr = { points: points };
      }
      return this.el("polygon", attr);
    };
    // gradients
    (function() {
      var $ = Snap._.$;
      // gradients' helpers
      /*\
         * Element.stops
         [ method ]
         **
         * Only for gradients!
         * Returns array of gradient stops elements.
         = (array) the stops array.
        \*/
      function Gstops() {
        return this.selectAll("stop");
      }
      /*\
         * Element.addStop
         [ method ]
         **
         * Only for gradients!
         * Adds another stop to the gradient.
         - color (string) stops color
         - offset (number) stops offset 0..100
         = (object) gradient element
        \*/
      function GaddStop(color, offset) {
        var stop = $("stop"),
          attr = {
            offset: +offset + "%"
          };
        color = Snap.color(color);
        attr["stop-color"] = color.hex;
        if (color.opacity < 1) {
          attr["stop-opacity"] = color.opacity;
        }
        $(stop, attr);
        var stops = this.stops(),
          inserted;
        for (var i = 0; i < stops.length; i++) {
          var stopOffset = parseFloat(stops[i].attr("offset"));
          if (stopOffset > offset) {
            this.node.insertBefore(stop, stops[i].node);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          this.node.appendChild(stop);
        }
        return this;
      }
      function GgetBBox() {
        if (this.type == "linearGradient") {
          var x1 = $(this.node, "x1") || 0,
            x2 = $(this.node, "x2") || 1,
            y1 = $(this.node, "y1") || 0,
            y2 = $(this.node, "y2") || 0;
          return Snap._.box(x1, y1, math.abs(x2 - x1), math.abs(y2 - y1));
        } else {
          var cx = this.node.cx || 0.5,
            cy = this.node.cy || 0.5,
            r = this.node.r || 0;
          return Snap._.box(cx - r, cy - r, r * 2, r * 2);
        }
      }
      /*\
         * Element.setStops
         [ method ]
         **
         * Only for gradients!
         * Updates stops of the gradient based on passed gradient descriptor. See @Ppaer.gradient
         - str (string) gradient descriptor part after `()`.
         = (object) gradient element
         | var g = paper.gradient("l(0, 0, 1, 1)#000-#f00-#fff");
         | g.setStops("#fff-#000-#f00-#fc0");
        \*/
      function GsetStops(str) {
        var grad = str,
          stops = this.stops();
        if (typeof str == "string") {
          grad = eve(
            "snap.util.grad.parse",
            null,
            "l(0,0,0,1)" + str
          ).firstDefined().stops;
        }
        if (!Snap.is(grad, "array")) {
          return;
        }
        for (var i = 0; i < stops.length; i++) {
          if (grad[i]) {
            var color = Snap.color(grad[i].color),
              attr = { offset: grad[i].offset + "%" };
            attr["stop-color"] = color.hex;
            if (color.opacity < 1) {
              attr["stop-opacity"] = color.opacity;
            }
            stops[i].attr(attr);
          } else {
            stops[i].remove();
          }
        }
        for (i = stops.length; i < grad.length; i++) {
          this.addStop(grad[i].color, grad[i].offset);
        }
        return this;
      }
      function gradient(defs, str) {
        var grad = eve("snap.util.grad.parse", null, str).firstDefined(),
          el;
        if (!grad) {
          return null;
        }
        grad.params.unshift(defs);
        if (grad.type.toLowerCase() == "l") {
          el = gradientLinear.apply(0, grad.params);
        } else {
          el = gradientRadial.apply(0, grad.params);
        }
        if (grad.type != grad.type.toLowerCase()) {
          $(el.node, {
            gradientUnits: "userSpaceOnUse"
          });
        }
        var stops = grad.stops,
          len = stops.length;
        for (var i = 0; i < len; i++) {
          var stop = stops[i];
          el.addStop(stop.color, stop.offset);
        }
        return el;
      }
      function gradientLinear(defs, x1, y1, x2, y2) {
        var el = Snap._.make("linearGradient", defs);
        el.stops = Gstops;
        el.addStop = GaddStop;
        el.getBBox = GgetBBox;
        el.setStops = GsetStops;
        if (x1 != null) {
          $(el.node, {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
          });
        }
        return el;
      }
      function gradientRadial(defs, cx, cy, r, fx, fy) {
        var el = Snap._.make("radialGradient", defs);
        el.stops = Gstops;
        el.addStop = GaddStop;
        el.getBBox = GgetBBox;
        if (cx != null) {
          $(el.node, {
            cx: cx,
            cy: cy,
            r: r
          });
        }
        if (fx != null && fy != null) {
          $(el.node, {
            fx: fx,
            fy: fy
          });
        }
        return el;
      }
      /*\
         * Paper.gradient
         [ method ]
         **
         * Creates a gradient element
         **
         - gradient (string) gradient descriptor
         > Gradient Descriptor
         * The gradient descriptor is an expression formatted as
         * follows: `<type>(<coords>)<colors>`.  The `<type>` can be
         * either linear or radial.  The uppercase `L` or `R` letters
         * indicate absolute coordinates offset from the SVG surface.
         * Lowercase `l` or `r` letters indicate coordinates
         * calculated relative to the element to which the gradient is
         * applied.  Coordinates specify a linear gradient vector as
         * `x1`, `y1`, `x2`, `y2`, or a radial gradient as `cx`, `cy`,
         * `r` and optional `fx`, `fy` specifying a focal point away
         * from the center of the circle. Specify `<colors>` as a list
         * of dash-separated CSS color values.  Each color may be
         * followed by a custom offset value, separated with a colon
         * character.
         > Examples
         * Linear gradient, relative from top-left corner to bottom-right
         * corner, from black through red to white:
         | var g = paper.gradient("l(0, 0, 1, 1)#000-#f00-#fff");
         * Linear gradient, absolute from (0, 0) to (100, 100), from black
         * through red at 25% to white:
         | var g = paper.gradient("L(0, 0, 100, 100)#000-#f00:25-#fff");
         * Radial gradient, relative from the center of the element with radius
         * half the width, from black to white:
         | var g = paper.gradient("r(0.5, 0.5, 0.5)#000-#fff");
         * To apply the gradient:
         | paper.circle(50, 50, 40).attr({
         |     fill: g
         | });
         = (object) the `gradient` element
        \*/
      proto.gradient = function(str) {
        return gradient(this.defs, str);
      };
      proto.gradientLinear = function(x1, y1, x2, y2) {
        return gradientLinear(this.defs, x1, y1, x2, y2);
      };
      proto.gradientRadial = function(cx, cy, r, fx, fy) {
        return gradientRadial(this.defs, cx, cy, r, fx, fy);
      };
      /*\
         * Paper.toString
         [ method ]
         **
         * Returns SVG code for the @Paper
         = (string) SVG code for the @Paper
        \*/
      proto.toString = function() {
        var doc = this.node.ownerDocument,
          f = doc.createDocumentFragment(),
          d = doc.createElement("div"),
          svg = this.node.cloneNode(true),
          res;
        f.appendChild(d);
        d.appendChild(svg);
        Snap._.$(svg, { xmlns: "http://www.w3.org/2000/svg" });
        res = d.innerHTML;
        f.removeChild(f.firstChild);
        return res;
      };
      /*\
         * Paper.toDataURL
         [ method ]
         **
         * Returns SVG code for the @Paper as Data URI string.
         = (string) Data URI string
        \*/
      proto.toDataURL = function() {
        if (window && window.btoa) {
          return (
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(this)))
          );
        }
      };
      /*\
         * Paper.clear
         [ method ]
         **
         * Removes all child nodes of the paper, except <defs>.
        \*/
      proto.clear = function() {
        var node = this.node.firstChild,
          next;
        while (node) {
          next = node.nextSibling;
          if (node.tagName != "defs") {
            node.parentNode.removeChild(node);
          } else {
            proto.clear.call({ node: node });
          }
          node = next;
        }
      };
    })();
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob) {
    var elproto = Element.prototype,
      is = Snap.is,
      clone = Snap._.clone,
      has = "hasOwnProperty",
      p2s = /,?([a-z]),?/gi,
      toFloat = parseFloat,
      math = Math,
      PI = math.PI,
      mmin = math.min,
      mmax = math.max,
      pow = math.pow,
      abs = math.abs;
    function paths(ps) {
      var p = (paths.ps = paths.ps || {});
      if (p[ps]) {
        p[ps].sleep = 100;
      } else {
        p[ps] = {
          sleep: 100
        };
      }
      setTimeout(function() {
        for (var key in p)
          if (p[has](key) && key != ps) {
            p[key].sleep--;
            !p[key].sleep && delete p[key];
          }
      });
      return p[ps];
    }
    function box(x, y, width, height) {
      if (x == null) {
        x = y = width = height = 0;
      }
      if (y == null) {
        y = x.y;
        width = x.width;
        height = x.height;
        x = x.x;
      }
      return {
        x: x,
        y: y,
        width: width,
        w: width,
        height: height,
        h: height,
        x2: x + width,
        y2: y + height,
        cx: x + width / 2,
        cy: y + height / 2,
        r1: math.min(width, height) / 2,
        r2: math.max(width, height) / 2,
        r0: math.sqrt(width * width + height * height) / 2,
        path: rectPath(x, y, width, height),
        vb: [x, y, width, height].join(" ")
      };
    }
    function toString() {
      return this.join(",").replace(p2s, "$1");
    }
    function pathClone(pathArray) {
      var res = clone(pathArray);
      res.toString = toString;
      return res;
    }
    function getPointAtSegmentLength(
      p1x,
      p1y,
      c1x,
      c1y,
      c2x,
      c2y,
      p2x,
      p2y,
      length
    ) {
      if (length == null) {
        return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
      } else {
        return findDotsAtSegment(
          p1x,
          p1y,
          c1x,
          c1y,
          c2x,
          c2y,
          p2x,
          p2y,
          getTotLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length)
        );
      }
    }
    function getLengthFactory(istotal, subpath) {
      function O(val) {
        return +(+val).toFixed(3);
      }
      return Snap._.cacher(
        function(path, length, onlystart) {
          if (path instanceof Element) {
            path = path.attr("d");
          }
          path = path2curve(path);
          var x,
            y,
            p,
            l,
            sp = "",
            subpaths = {},
            point,
            len = 0;
          for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
              x = +p[1];
              y = +p[2];
            } else {
              l = getPointAtSegmentLength(
                x,
                y,
                p[1],
                p[2],
                p[3],
                p[4],
                p[5],
                p[6]
              );
              if (len + l > length) {
                if (subpath && !subpaths.start) {
                  point = getPointAtSegmentLength(
                    x,
                    y,
                    p[1],
                    p[2],
                    p[3],
                    p[4],
                    p[5],
                    p[6],
                    length - len
                  );
                  sp += [
                    "C" + O(point.start.x),
                    O(point.start.y),
                    O(point.m.x),
                    O(point.m.y),
                    O(point.x),
                    O(point.y)
                  ];
                  if (onlystart) {
                    return sp;
                  }
                  subpaths.start = sp;
                  sp = [
                    "M" + O(point.x),
                    O(point.y) + "C" + O(point.n.x),
                    O(point.n.y),
                    O(point.end.x),
                    O(point.end.y),
                    O(p[5]),
                    O(p[6])
                  ].join();
                  len += l;
                  x = +p[5];
                  y = +p[6];
                  continue;
                }
                if (!istotal && !subpath) {
                  point = getPointAtSegmentLength(
                    x,
                    y,
                    p[1],
                    p[2],
                    p[3],
                    p[4],
                    p[5],
                    p[6],
                    length - len
                  );
                  return point;
                }
              }
              len += l;
              x = +p[5];
              y = +p[6];
            }
            sp += p.shift() + p;
          }
          subpaths.end = sp;
          point = istotal
            ? len
            : subpath
            ? subpaths
            : findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
          return point;
        },
        null,
        Snap._.clone
      );
    }
    var getTotalLength = getLengthFactory(1),
      getPointAtLength = getLengthFactory(),
      getSubpathsAtLength = getLengthFactory(0, 1);
    function findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
      var t1 = 1 - t,
        t13 = pow(t1, 3),
        t12 = pow(t1, 2),
        t2 = t * t,
        t3 = t2 * t,
        x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
        y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
        mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
        my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
        nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
        ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
        ax = t1 * p1x + t * c1x,
        ay = t1 * p1y + t * c1y,
        cx = t1 * c2x + t * p2x,
        cy = t1 * c2y + t * p2y,
        alpha = 90 - (math.atan2(mx - nx, my - ny) * 180) / PI;
      // (mx > nx || my < ny) && (alpha += 180);
      return {
        x: x,
        y: y,
        m: { x: mx, y: my },
        n: { x: nx, y: ny },
        start: { x: ax, y: ay },
        end: { x: cx, y: cy },
        alpha: alpha
      };
    }
    function bezierBBox(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
      if (!Snap.is(p1x, "array")) {
        p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
      }
      var bbox = curveDim.apply(null, p1x);
      return box(
        bbox.min.x,
        bbox.min.y,
        bbox.max.x - bbox.min.x,
        bbox.max.y - bbox.min.y
      );
    }
    function isPointInsideBBox(bbox, x, y) {
      return (
        x >= bbox.x &&
        x <= bbox.x + bbox.width &&
        y >= bbox.y &&
        y <= bbox.y + bbox.height
      );
    }
    function isBBoxIntersect(bbox1, bbox2) {
      bbox1 = box(bbox1);
      bbox2 = box(bbox2);
      return (
        isPointInsideBBox(bbox2, bbox1.x, bbox1.y) ||
        isPointInsideBBox(bbox2, bbox1.x2, bbox1.y) ||
        isPointInsideBBox(bbox2, bbox1.x, bbox1.y2) ||
        isPointInsideBBox(bbox2, bbox1.x2, bbox1.y2) ||
        isPointInsideBBox(bbox1, bbox2.x, bbox2.y) ||
        isPointInsideBBox(bbox1, bbox2.x2, bbox2.y) ||
        isPointInsideBBox(bbox1, bbox2.x, bbox2.y2) ||
        isPointInsideBBox(bbox1, bbox2.x2, bbox2.y2) ||
        (((bbox1.x < bbox2.x2 && bbox1.x > bbox2.x) ||
          (bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)) &&
          ((bbox1.y < bbox2.y2 && bbox1.y > bbox2.y) ||
            (bbox2.y < bbox1.y2 && bbox2.y > bbox1.y)))
      );
    }
    function base3(t, p1, p2, p3, p4) {
      var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
        t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
      return t * t2 - 3 * p1 + 3 * p2;
    }
    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
      if (z == null) {
        z = 1;
      }
      z = z > 1 ? 1 : z < 0 ? 0 : z;
      var z2 = z / 2,
        n = 12,
        Tvalues = [
          -0.1252,
          0.1252,
          -0.3678,
          0.3678,
          -0.5873,
          0.5873,
          -0.7699,
          0.7699,
          -0.9041,
          0.9041,
          -0.9816,
          0.9816
        ],
        Cvalues = [
          0.2491,
          0.2491,
          0.2335,
          0.2335,
          0.2032,
          0.2032,
          0.1601,
          0.1601,
          0.1069,
          0.1069,
          0.0472,
          0.0472
        ],
        sum = 0;
      for (var i = 0; i < n; i++) {
        var ct = z2 * Tvalues[i] + z2,
          xbase = base3(ct, x1, x2, x3, x4),
          ybase = base3(ct, y1, y2, y3, y4),
          comb = xbase * xbase + ybase * ybase;
        sum += Cvalues[i] * math.sqrt(comb);
      }
      return z2 * sum;
    }
    function getTotLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
      if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
        return;
      }
      var t = 1,
        step = t / 2,
        t2 = t - step,
        l,
        e = 0.01;
      l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
      while (abs(l - ll) > e) {
        step /= 2;
        t2 += (l < ll ? 1 : -1) * step;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
      }
      return t2;
    }
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
      if (
        mmax(x1, x2) < mmin(x3, x4) ||
        mmin(x1, x2) > mmax(x3, x4) ||
        mmax(y1, y2) < mmin(y3, y4) ||
        mmin(y1, y2) > mmax(y3, y4)
      ) {
        return;
      }
      var nx =
          (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
        ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
        denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

      if (!denominator) {
        return;
      }
      var px = nx / denominator,
        py = ny / denominator,
        px2 = +px.toFixed(2),
        py2 = +py.toFixed(2);
      if (
        px2 < +mmin(x1, x2).toFixed(2) ||
        px2 > +mmax(x1, x2).toFixed(2) ||
        px2 < +mmin(x3, x4).toFixed(2) ||
        px2 > +mmax(x3, x4).toFixed(2) ||
        py2 < +mmin(y1, y2).toFixed(2) ||
        py2 > +mmax(y1, y2).toFixed(2) ||
        py2 < +mmin(y3, y4).toFixed(2) ||
        py2 > +mmax(y3, y4).toFixed(2)
      ) {
        return;
      }
      return { x: px, y: py };
    }
    function inter(bez1, bez2) {
      return interHelper(bez1, bez2);
    }
    function interCount(bez1, bez2) {
      return interHelper(bez1, bez2, 1);
    }
    function interHelper(bez1, bez2, justCount) {
      var bbox1 = bezierBBox(bez1),
        bbox2 = bezierBBox(bez2);
      if (!isBBoxIntersect(bbox1, bbox2)) {
        return justCount ? 0 : [];
      }
      var l1 = bezlen.apply(0, bez1),
        l2 = bezlen.apply(0, bez2),
        n1 = ~~(l1 / 8),
        n2 = ~~(l2 / 8),
        dots1 = [],
        dots2 = [],
        xy = {},
        res = justCount ? 0 : [];
      for (var i = 0; i < n1 + 1; i++) {
        var p = findDotsAtSegment.apply(0, bez1.concat(i / n1));
        dots1.push({ x: p.x, y: p.y, t: i / n1 });
      }
      for (i = 0; i < n2 + 1; i++) {
        p = findDotsAtSegment.apply(0, bez2.concat(i / n2));
        dots2.push({ x: p.x, y: p.y, t: i / n2 });
      }
      for (i = 0; i < n1; i++) {
        for (var j = 0; j < n2; j++) {
          var di = dots1[i],
            di1 = dots1[i + 1],
            dj = dots2[j],
            dj1 = dots2[j + 1],
            ci = abs(di1.x - di.x) < 0.001 ? "y" : "x",
            cj = abs(dj1.x - dj.x) < 0.001 ? "y" : "x",
            is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
          if (is) {
            if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
              continue;
            }
            xy[is.x.toFixed(4)] = is.y.toFixed(4);
            var t1 =
                di.t +
                abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
              t2 =
                dj.t +
                abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
            if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
              if (justCount) {
                res++;
              } else {
                res.push({
                  x: is.x,
                  y: is.y,
                  t1: t1,
                  t2: t2
                });
              }
            }
          }
        }
      }
      return res;
    }
    function pathIntersection(path1, path2) {
      return interPathHelper(path1, path2);
    }
    function pathIntersectionNumber(path1, path2) {
      return interPathHelper(path1, path2, 1);
    }
    function interPathHelper(path1, path2, justCount) {
      path1 = path2curve(path1);
      path2 = path2curve(path2);
      var x1,
        y1,
        x2,
        y2,
        x1m,
        y1m,
        x2m,
        y2m,
        bez1,
        bez2,
        res = justCount ? 0 : [];
      for (var i = 0, ii = path1.length; i < ii; i++) {
        var pi = path1[i];
        if (pi[0] == "M") {
          x1 = x1m = pi[1];
          y1 = y1m = pi[2];
        } else {
          if (pi[0] == "C") {
            bez1 = [x1, y1].concat(pi.slice(1));
            x1 = bez1[6];
            y1 = bez1[7];
          } else {
            bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
            x1 = x1m;
            y1 = y1m;
          }
          for (var j = 0, jj = path2.length; j < jj; j++) {
            var pj = path2[j];
            if (pj[0] == "M") {
              x2 = x2m = pj[1];
              y2 = y2m = pj[2];
            } else {
              if (pj[0] == "C") {
                bez2 = [x2, y2].concat(pj.slice(1));
                x2 = bez2[6];
                y2 = bez2[7];
              } else {
                bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                x2 = x2m;
                y2 = y2m;
              }
              var intr = interHelper(bez1, bez2, justCount);
              if (justCount) {
                res += intr;
              } else {
                for (var k = 0, kk = intr.length; k < kk; k++) {
                  intr[k].segment1 = i;
                  intr[k].segment2 = j;
                  intr[k].bez1 = bez1;
                  intr[k].bez2 = bez2;
                }
                res = res.concat(intr);
              }
            }
          }
        }
      }
      return res;
    }
    function isPointInsidePath(path, x, y) {
      var bbox = pathBBox(path);
      return (
        isPointInsideBBox(bbox, x, y) &&
        interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1
      );
    }
    function pathBBox(path) {
      var pth = paths(path);
      if (pth.bbox) {
        return clone(pth.bbox);
      }
      if (!path) {
        return box();
      }
      path = path2curve(path);
      var x = 0,
        y = 0,
        X = [],
        Y = [],
        p;
      for (var i = 0, ii = path.length; i < ii; i++) {
        p = path[i];
        if (p[0] == "M") {
          x = p[1];
          y = p[2];
          X.push(x);
          Y.push(y);
        } else {
          var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
          X = X.concat(dim.min.x, dim.max.x);
          Y = Y.concat(dim.min.y, dim.max.y);
          x = p[5];
          y = p[6];
        }
      }
      var xmin = mmin.apply(0, X),
        ymin = mmin.apply(0, Y),
        xmax = mmax.apply(0, X),
        ymax = mmax.apply(0, Y),
        bb = box(xmin, ymin, xmax - xmin, ymax - ymin);
      pth.bbox = clone(bb);
      return bb;
    }
    function rectPath(x, y, w, h, r) {
      if (r) {
        return [
          ["M", +x + +r, y],
          ["l", w - r * 2, 0],
          ["a", r, r, 0, 0, 1, r, r],
          ["l", 0, h - r * 2],
          ["a", r, r, 0, 0, 1, -r, r],
          ["l", r * 2 - w, 0],
          ["a", r, r, 0, 0, 1, -r, -r],
          ["l", 0, r * 2 - h],
          ["a", r, r, 0, 0, 1, r, -r],
          ["z"]
        ];
      }
      var res = [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
      res.toString = toString;
      return res;
    }
    function ellipsePath(x, y, rx, ry, a) {
      if (a == null && ry == null) {
        ry = rx;
      }
      x = +x;
      y = +y;
      rx = +rx;
      ry = +ry;
      if (a != null) {
        var rad = Math.PI / 180,
          x1 = x + rx * Math.cos(-ry * rad),
          x2 = x + rx * Math.cos(-a * rad),
          y1 = y + rx * Math.sin(-ry * rad),
          y2 = y + rx * Math.sin(-a * rad),
          res = [["M", x1, y1], ["A", rx, rx, 0, +(a - ry > 180), 0, x2, y2]];
      } else {
        res = [
          ["M", x, y],
          ["m", 0, -ry],
          ["a", rx, ry, 0, 1, 1, 0, 2 * ry],
          ["a", rx, ry, 0, 1, 1, 0, -2 * ry],
          ["z"]
        ];
      }
      res.toString = toString;
      return res;
    }
    var unit2px = Snap._unit2px,
      getPath = {
        path: function(el) {
          return el.attr("path");
        },
        circle: function(el) {
          var attr = unit2px(el);
          return ellipsePath(attr.cx, attr.cy, attr.r);
        },
        ellipse: function(el) {
          var attr = unit2px(el);
          return ellipsePath(attr.cx || 0, attr.cy || 0, attr.rx, attr.ry);
        },
        rect: function(el) {
          var attr = unit2px(el);
          return rectPath(
            attr.x || 0,
            attr.y || 0,
            attr.width,
            attr.height,
            attr.rx,
            attr.ry
          );
        },
        image: function(el) {
          var attr = unit2px(el);
          return rectPath(attr.x || 0, attr.y || 0, attr.width, attr.height);
        },
        line: function(el) {
          return (
            "M" +
            [
              el.attr("x1") || 0,
              el.attr("y1") || 0,
              el.attr("x2"),
              el.attr("y2")
            ]
          );
        },
        polyline: function(el) {
          return "M" + el.attr("points");
        },
        polygon: function(el) {
          return "M" + el.attr("points") + "z";
        },
        deflt: function(el) {
          var bbox = el.node.getBBox();
          return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
        }
      };
    function pathToRelative(pathArray) {
      var pth = paths(pathArray),
        lowerCase = String.prototype.toLowerCase;
      if (pth.rel) {
        return pathClone(pth.rel);
      }
      if (
        !Snap.is(pathArray, "array") ||
        !Snap.is(pathArray && pathArray[0], "array")
      ) {
        pathArray = Snap.parsePathString(pathArray);
      }
      var res = [],
        x = 0,
        y = 0,
        mx = 0,
        my = 0,
        start = 0;
      if (pathArray[0][0] == "M") {
        x = pathArray[0][1];
        y = pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res.push(["M", x, y]);
      }
      for (var i = start, ii = pathArray.length; i < ii; i++) {
        var r = (res[i] = []),
          pa = pathArray[i];
        if (pa[0] != lowerCase.call(pa[0])) {
          r[0] = lowerCase.call(pa[0]);
          switch (r[0]) {
            case "a":
              r[1] = pa[1];
              r[2] = pa[2];
              r[3] = pa[3];
              r[4] = pa[4];
              r[5] = pa[5];
              r[6] = +(pa[6] - x).toFixed(3);
              r[7] = +(pa[7] - y).toFixed(3);
              break;
            case "v":
              r[1] = +(pa[1] - y).toFixed(3);
              break;
            case "m":
              mx = pa[1];
              my = pa[2];
            default:
              for (var j = 1, jj = pa.length; j < jj; j++) {
                r[j] = +(pa[j] - (j % 2 ? x : y)).toFixed(3);
              }
          }
        } else {
          r = res[i] = [];
          if (pa[0] == "m") {
            mx = pa[1] + x;
            my = pa[2] + y;
          }
          for (var k = 0, kk = pa.length; k < kk; k++) {
            res[i][k] = pa[k];
          }
        }
        var len = res[i].length;
        switch (res[i][0]) {
          case "z":
            x = mx;
            y = my;
            break;
          case "h":
            x += +res[i][len - 1];
            break;
          case "v":
            y += +res[i][len - 1];
            break;
          default:
            x += +res[i][len - 2];
            y += +res[i][len - 1];
        }
      }
      res.toString = toString;
      pth.rel = pathClone(res);
      return res;
    }
    function pathToAbsolute(pathArray) {
      var pth = paths(pathArray);
      if (pth.abs) {
        return pathClone(pth.abs);
      }
      if (!is(pathArray, "array") || !is(pathArray && pathArray[0], "array")) {
        // rough assumption
        pathArray = Snap.parsePathString(pathArray);
      }
      if (!pathArray || !pathArray.length) {
        return [["M", 0, 0]];
      }
      var res = [],
        x = 0,
        y = 0,
        mx = 0,
        my = 0,
        start = 0,
        pa0;
      if (pathArray[0][0] == "M") {
        x = +pathArray[0][1];
        y = +pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res[0] = ["M", x, y];
      }
      var crz =
        pathArray.length == 3 &&
        pathArray[0][0] == "M" &&
        pathArray[1][0].toUpperCase() == "R" &&
        pathArray[2][0].toUpperCase() == "Z";
      for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
        res.push((r = []));
        pa = pathArray[i];
        pa0 = pa[0];
        if (pa0 != pa0.toUpperCase()) {
          r[0] = pa0.toUpperCase();
          switch (r[0]) {
            case "A":
              r[1] = pa[1];
              r[2] = pa[2];
              r[3] = pa[3];
              r[4] = pa[4];
              r[5] = pa[5];
              r[6] = +pa[6] + x;
              r[7] = +pa[7] + y;
              break;
            case "V":
              r[1] = +pa[1] + y;
              break;
            case "H":
              r[1] = +pa[1] + x;
              break;
            case "R":
              var dots = [x, y].concat(pa.slice(1));
              for (var j = 2, jj = dots.length; j < jj; j++) {
                dots[j] = +dots[j] + x;
                dots[++j] = +dots[j] + y;
              }
              res.pop();
              res = res.concat(catmullRom2bezier(dots, crz));
              break;
            case "O":
              res.pop();
              dots = ellipsePath(x, y, pa[1], pa[2]);
              dots.push(dots[0]);
              res = res.concat(dots);
              break;
            case "U":
              res.pop();
              res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
              r = ["U"].concat(res[res.length - 1].slice(-2));
              break;
            case "M":
              mx = +pa[1] + x;
              my = +pa[2] + y;
            default:
              for (j = 1, jj = pa.length; j < jj; j++) {
                r[j] = +pa[j] + (j % 2 ? x : y);
              }
          }
        } else if (pa0 == "R") {
          dots = [x, y].concat(pa.slice(1));
          res.pop();
          res = res.concat(catmullRom2bezier(dots, crz));
          r = ["R"].concat(pa.slice(-2));
        } else if (pa0 == "O") {
          res.pop();
          dots = ellipsePath(x, y, pa[1], pa[2]);
          dots.push(dots[0]);
          res = res.concat(dots);
        } else if (pa0 == "U") {
          res.pop();
          res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
          r = ["U"].concat(res[res.length - 1].slice(-2));
        } else {
          for (var k = 0, kk = pa.length; k < kk; k++) {
            r[k] = pa[k];
          }
        }
        pa0 = pa0.toUpperCase();
        if (pa0 != "O") {
          switch (r[0]) {
            case "Z":
              x = +mx;
              y = +my;
              break;
            case "H":
              x = r[1];
              break;
            case "V":
              y = r[1];
              break;
            case "M":
              mx = r[r.length - 2];
              my = r[r.length - 1];
            default:
              x = r[r.length - 2];
              y = r[r.length - 1];
          }
        }
      }
      res.toString = toString;
      pth.abs = pathClone(res);
      return res;
    }
    function l2c(x1, y1, x2, y2) {
      return [x1, y1, x2, y2, x2, y2];
    }
    function q2c(x1, y1, ax, ay, x2, y2) {
      var _13 = 1 / 3,
        _23 = 2 / 3;
      return [
        _13 * x1 + _23 * ax,
        _13 * y1 + _23 * ay,
        _13 * x2 + _23 * ax,
        _13 * y2 + _23 * ay,
        x2,
        y2
      ];
    }
    function a2c(
      x1,
      y1,
      rx,
      ry,
      angle,
      large_arc_flag,
      sweep_flag,
      x2,
      y2,
      recursive
    ) {
      // for more information of where this math came from visit:
      // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
      var _120 = (PI * 120) / 180,
        rad = (PI / 180) * (+angle || 0),
        res = [],
        xy,
        rotate = Snap._.cacher(function(x, y, rad) {
          var X = x * math.cos(rad) - y * math.sin(rad),
            Y = x * math.sin(rad) + y * math.cos(rad);
          return { x: X, y: Y };
        });
      if (!rx || !ry) {
        return [x1, y1, x2, y2, x2, y2];
      }
      if (!recursive) {
        xy = rotate(x1, y1, -rad);
        x1 = xy.x;
        y1 = xy.y;
        xy = rotate(x2, y2, -rad);
        x2 = xy.x;
        y2 = xy.y;
        var cos = math.cos((PI / 180) * angle),
          sin = math.sin((PI / 180) * angle),
          x = (x1 - x2) / 2,
          y = (y1 - y2) / 2;
        var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (h > 1) {
          h = math.sqrt(h);
          rx = h * rx;
          ry = h * ry;
        }
        var rx2 = rx * rx,
          ry2 = ry * ry,
          k =
            (large_arc_flag == sweep_flag ? -1 : 1) *
            math.sqrt(
              abs(
                (rx2 * ry2 - rx2 * y * y - ry2 * x * x) /
                  (rx2 * y * y + ry2 * x * x)
              )
            ),
          cx = (k * rx * y) / ry + (x1 + x2) / 2,
          cy = (k * -ry * x) / rx + (y1 + y2) / 2,
          f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
          f2 = math.asin(((y2 - cy) / ry).toFixed(9));

        f1 = x1 < cx ? PI - f1 : f1;
        f2 = x2 < cx ? PI - f2 : f2;
        f1 < 0 && (f1 = PI * 2 + f1);
        f2 < 0 && (f2 = PI * 2 + f2);
        if (sweep_flag && f1 > f2) {
          f1 = f1 - PI * 2;
        }
        if (!sweep_flag && f2 > f1) {
          f2 = f2 - PI * 2;
        }
      } else {
        f1 = recursive[0];
        f2 = recursive[1];
        cx = recursive[2];
        cy = recursive[3];
      }
      var df = f2 - f1;
      if (abs(df) > _120) {
        var f2old = f2,
          x2old = x2,
          y2old = y2;
        f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
        x2 = cx + rx * math.cos(f2);
        y2 = cy + ry * math.sin(f2);
        res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [
          f2,
          f2old,
          cx,
          cy
        ]);
      }
      df = f2 - f1;
      var c1 = math.cos(f1),
        s1 = math.sin(f1),
        c2 = math.cos(f2),
        s2 = math.sin(f2),
        t = math.tan(df / 4),
        hx = (4 / 3) * rx * t,
        hy = (4 / 3) * ry * t,
        m1 = [x1, y1],
        m2 = [x1 + hx * s1, y1 - hy * c1],
        m3 = [x2 + hx * s2, y2 - hy * c2],
        m4 = [x2, y2];
      m2[0] = 2 * m1[0] - m2[0];
      m2[1] = 2 * m1[1] - m2[1];
      if (recursive) {
        return [m2, m3, m4].concat(res);
      } else {
        res = [m2, m3, m4]
          .concat(res)
          .join()
          .split(",");
        var newres = [];
        for (var i = 0, ii = res.length; i < ii; i++) {
          newres[i] =
            i % 2
              ? rotate(res[i - 1], res[i], rad).y
              : rotate(res[i], res[i + 1], rad).x;
        }
        return newres;
      }
    }
    function findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
      var t1 = 1 - t;
      return {
        x:
          pow(t1, 3) * p1x +
          pow(t1, 2) * 3 * t * c1x +
          t1 * 3 * t * t * c2x +
          pow(t, 3) * p2x,
        y:
          pow(t1, 3) * p1y +
          pow(t1, 2) * 3 * t * c1y +
          t1 * 3 * t * t * c2y +
          pow(t, 3) * p2y
      };
    }

    // Returns bounding box of cubic bezier curve.
    // Source: http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    // Original version: NISHIO Hirokazu
    // Modifications: https://github.com/timo22345
    function curveDim(x0, y0, x1, y1, x2, y2, x3, y3) {
      var tvalues = [],
        bounds = [[], []],
        a,
        b,
        c,
        t,
        t1,
        t2,
        b2ac,
        sqrtb2ac;
      for (var i = 0; i < 2; ++i) {
        if (i == 0) {
          b = 6 * x0 - 12 * x1 + 6 * x2;
          a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
          c = 3 * x1 - 3 * x0;
        } else {
          b = 6 * y0 - 12 * y1 + 6 * y2;
          a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
          c = 3 * y1 - 3 * y0;
        }
        if (abs(a) < 1e-12) {
          if (abs(b) < 1e-12) {
            continue;
          }
          t = -c / b;
          if (0 < t && t < 1) {
            tvalues.push(t);
          }
          continue;
        }
        b2ac = b * b - 4 * c * a;
        sqrtb2ac = math.sqrt(b2ac);
        if (b2ac < 0) {
          continue;
        }
        t1 = (-b + sqrtb2ac) / (2 * a);
        if (0 < t1 && t1 < 1) {
          tvalues.push(t1);
        }
        t2 = (-b - sqrtb2ac) / (2 * a);
        if (0 < t2 && t2 < 1) {
          tvalues.push(t2);
        }
      }

      var x,
        y,
        j = tvalues.length,
        jlen = j,
        mt;
      while (j--) {
        t = tvalues[j];
        mt = 1 - t;
        bounds[0][j] =
          mt * mt * mt * x0 +
          3 * mt * mt * t * x1 +
          3 * mt * t * t * x2 +
          t * t * t * x3;
        bounds[1][j] =
          mt * mt * mt * y0 +
          3 * mt * mt * t * y1 +
          3 * mt * t * t * y2 +
          t * t * t * y3;
      }

      bounds[0][jlen] = x0;
      bounds[1][jlen] = y0;
      bounds[0][jlen + 1] = x3;
      bounds[1][jlen + 1] = y3;
      bounds[0].length = bounds[1].length = jlen + 2;

      return {
        min: { x: mmin.apply(0, bounds[0]), y: mmin.apply(0, bounds[1]) },
        max: { x: mmax.apply(0, bounds[0]), y: mmax.apply(0, bounds[1]) }
      };
    }

    function path2curve(path, path2) {
      var pth = !path2 && paths(path);
      if (!path2 && pth.curve) {
        return pathClone(pth.curve);
      }
      var p = pathToAbsolute(path),
        p2 = path2 && pathToAbsolute(path2),
        attrs = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
        attrs2 = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
        processPath = function(path, d, pcom) {
          var nx, ny;
          if (!path) {
            return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
          }
          !(path[0] in { T: 1, Q: 1 }) && (d.qx = d.qy = null);
          switch (path[0]) {
            case "M":
              d.X = path[1];
              d.Y = path[2];
              break;
            case "A":
              path = ["C"].concat(
                a2c.apply(0, [d.x, d.y].concat(path.slice(1)))
              );
              break;
            case "S":
              if (pcom == "C" || pcom == "S") {
                // In "S" case we have to take into account, if the previous command is C/S.
                nx = d.x * 2 - d.bx; // And reflect the previous
                ny = d.y * 2 - d.by; // command's control point relative to the current point.
              } else {
                // or some else or nothing
                nx = d.x;
                ny = d.y;
              }
              path = ["C", nx, ny].concat(path.slice(1));
              break;
            case "T":
              if (pcom == "Q" || pcom == "T") {
                // In "T" case we have to take into account, if the previous command is Q/T.
                d.qx = d.x * 2 - d.qx; // And make a reflection similar
                d.qy = d.y * 2 - d.qy; // to case "S".
              } else {
                // or something else or nothing
                d.qx = d.x;
                d.qy = d.y;
              }
              path = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
              break;
            case "Q":
              d.qx = path[1];
              d.qy = path[2];
              path = ["C"].concat(
                q2c(d.x, d.y, path[1], path[2], path[3], path[4])
              );
              break;
            case "L":
              path = ["C"].concat(l2c(d.x, d.y, path[1], path[2]));
              break;
            case "H":
              path = ["C"].concat(l2c(d.x, d.y, path[1], d.y));
              break;
            case "V":
              path = ["C"].concat(l2c(d.x, d.y, d.x, path[1]));
              break;
            case "Z":
              path = ["C"].concat(l2c(d.x, d.y, d.X, d.Y));
              break;
          }
          return path;
        },
        fixArc = function(pp, i) {
          if (pp[i].length > 7) {
            pp[i].shift();
            var pi = pp[i];
            while (pi.length) {
              pcoms1[i] = "A"; // if created multiple C:s, their original seg is saved
              p2 && (pcoms2[i] = "A"); // the same as above
              pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
            }
            pp.splice(i, 1);
            ii = mmax(p.length, (p2 && p2.length) || 0);
          }
        },
        fixM = function(path1, path2, a1, a2, i) {
          if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
            path2.splice(i, 0, ["M", a2.x, a2.y]);
            a1.bx = 0;
            a1.by = 0;
            a1.x = path1[i][1];
            a1.y = path1[i][2];
            ii = mmax(p.length, (p2 && p2.length) || 0);
          }
        },
        pcoms1 = [], // path commands of original path p
        pcoms2 = [], // path commands of original path p2
        pfirst = "", // temporary holder for original path command
        pcom = ""; // holder for previous path command of original path
      for (
        var i = 0, ii = mmax(p.length, (p2 && p2.length) || 0);
        i < ii;
        i++
      ) {
        p[i] && (pfirst = p[i][0]); // save current path command

        if (pfirst != "C") {
          // C is not saved yet, because it may be result of conversion
          pcoms1[i] = pfirst; // Save current path command
          i && (pcom = pcoms1[i - 1]); // Get previous path command pcom
        }
        p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

        if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C"; // A is the only command
        // which may produce multiple C:s
        // so we have to make sure that C is also C in original path

        fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1

        if (p2) {
          // the same procedures is done to p2
          p2[i] && (pfirst = p2[i][0]);
          if (pfirst != "C") {
            pcoms2[i] = pfirst;
            i && (pcom = pcoms2[i - 1]);
          }
          p2[i] = processPath(p2[i], attrs2, pcom);

          if (pcoms2[i] != "A" && pfirst == "C") {
            pcoms2[i] = "C";
          }

          fixArc(p2, i);
        }
        fixM(p, p2, attrs, attrs2, i);
        fixM(p2, p, attrs2, attrs, i);
        var seg = p[i],
          seg2 = p2 && p2[i],
          seglen = seg.length,
          seg2len = p2 && seg2.length;
        attrs.x = seg[seglen - 2];
        attrs.y = seg[seglen - 1];
        attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
        attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
        attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
        attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
        attrs2.x = p2 && seg2[seg2len - 2];
        attrs2.y = p2 && seg2[seg2len - 1];
      }
      if (!p2) {
        pth.curve = pathClone(p);
      }
      return p2 ? [p, p2] : p;
    }
    function mapPath(path, matrix) {
      if (!matrix) {
        return path;
      }
      var x, y, i, j, ii, jj, pathi;
      path = path2curve(path);
      for (i = 0, ii = path.length; i < ii; i++) {
        pathi = path[i];
        for (j = 1, jj = pathi.length; j < jj; j += 2) {
          x = matrix.x(pathi[j], pathi[j + 1]);
          y = matrix.y(pathi[j], pathi[j + 1]);
          pathi[j] = x;
          pathi[j + 1] = y;
        }
      }
      return path;
    }

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp, z) {
      var d = [];
      for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
        var p = [
          { x: +crp[i - 2], y: +crp[i - 1] },
          { x: +crp[i], y: +crp[i + 1] },
          { x: +crp[i + 2], y: +crp[i + 3] },
          { x: +crp[i + 4], y: +crp[i + 5] }
        ];
        if (z) {
          if (!i) {
            p[0] = { x: +crp[iLen - 2], y: +crp[iLen - 1] };
          } else if (iLen - 4 == i) {
            p[3] = { x: +crp[0], y: +crp[1] };
          } else if (iLen - 2 == i) {
            p[2] = { x: +crp[0], y: +crp[1] };
            p[3] = { x: +crp[2], y: +crp[3] };
          }
        } else {
          if (iLen - 4 == i) {
            p[3] = p[2];
          } else if (!i) {
            p[0] = { x: +crp[i], y: +crp[i + 1] };
          }
        }
        d.push([
          "C",
          (-p[0].x + 6 * p[1].x + p[2].x) / 6,
          (-p[0].y + 6 * p[1].y + p[2].y) / 6,
          (p[1].x + 6 * p[2].x - p[3].x) / 6,
          (p[1].y + 6 * p[2].y - p[3].y) / 6,
          p[2].x,
          p[2].y
        ]);
      }

      return d;
    }

    // export
    Snap.path = paths;

    /*\
     * Snap.path.getTotalLength
     [ method ]
     **
     * Returns the length of the given path in pixels
     **
     - path (string) SVG path string
     **
     = (number) length
    \*/
    Snap.path.getTotalLength = getTotalLength;
    /*\
     * Snap.path.getPointAtLength
     [ method ]
     **
     * Returns the coordinates of the point located at the given length along the given path
     **
     - path (string) SVG path string
     - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate,
     o     y: (number) y coordinate,
     o     alpha: (number) angle of derivative
     o }
    \*/
    Snap.path.getPointAtLength = getPointAtLength;
    /*\
     * Snap.path.getSubpath
     [ method ]
     **
     * Returns the subpath of a given path between given start and end lengths
     **
     - path (string) SVG path string
     - from (number) length, in pixels, from the start of the path to the start of the segment
     - to (number) length, in pixels, from the start of the path to the end of the segment
     **
     = (string) path string definition for the segment
    \*/
    Snap.path.getSubpath = function(path, from, to) {
      if (this.getTotalLength(path) - to < 1e-6) {
        return getSubpathsAtLength(path, from).end;
      }
      var a = getSubpathsAtLength(path, to, 1);
      return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns the length of the path in pixels (only works for `path` elements)
     = (number) length
    \*/
    elproto.getTotalLength = function() {
      if (this.node.getTotalLength) {
        return this.node.getTotalLength();
      }
    };
    // SIERRA Element.getPointAtLength()/Element.getTotalLength(): If a <path> is broken into different segments, is the jump distance to the new coordinates set by the _M_ or _m_ commands calculated as part of the path's total length?
    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Returns coordinates of the point located at the given length on the given path (only works for `path` elements)
     **
     - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate,
     o     y: (number) y coordinate,
     o     alpha: (number) angle of derivative
     o }
    \*/
    elproto.getPointAtLength = function(length) {
      return getPointAtLength(this.attr("d"), length);
    };
    // SIERRA Element.getSubpath(): Similar to the problem for Element.getPointAtLength(). Unclear how this would work for a segmented path. Overall, the concept of _subpath_ and what I'm calling a _segment_ (series of non-_M_ or _Z_ commands) is unclear.
    /*\
     * Element.getSubpath
     [ method ]
     **
     * Returns subpath of a given element from given start and end lengths (only works for `path` elements)
     **
     - from (number) length, in pixels, from the start of the path to the start of the segment
     - to (number) length, in pixels, from the start of the path to the end of the segment
     **
     = (string) path string definition for the segment
    \*/
    elproto.getSubpath = function(from, to) {
      return Snap.path.getSubpath(this.attr("d"), from, to);
    };
    Snap._.box = box;
    /*\
     * Snap.path.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Finds dot coordinates on the given cubic beziér curve at the given t
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point,
     o     y: (number) y coordinate of the point,
     o     m: {
     o         x: (number) x coordinate of the left anchor,
     o         y: (number) y coordinate of the left anchor
     o     },
     o     n: {
     o         x: (number) x coordinate of the right anchor,
     o         y: (number) y coordinate of the right anchor
     o     },
     o     start: {
     o         x: (number) x coordinate of the start of the curve,
     o         y: (number) y coordinate of the start of the curve
     o     },
     o     end: {
     o         x: (number) x coordinate of the end of the curve,
     o         y: (number) y coordinate of the end of the curve
     o     },
     o     alpha: (number) angle of the curve derivative at the point
     o }
    \*/
    Snap.path.findDotsAtSegment = findDotsAtSegment;
    /*\
     * Snap.path.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Returns the bounding box of a given cubic beziér curve
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for beziér curve
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box,
     o     y: (number) y coordinate of the left top point of the box,
     o     x2: (number) x coordinate of the right bottom point of the box,
     o     y2: (number) y coordinate of the right bottom point of the box,
     o     width: (number) width of the box,
     o     height: (number) height of the box
     o }
    \*/
    Snap.path.bezierBBox = bezierBBox;
    /*\
     * Snap.path.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding box
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point is inside
    \*/
    Snap.path.isPointInsideBBox = isPointInsideBBox;
    Snap.closest = function(x, y, X, Y) {
      var r = 100,
        b = box(x - r / 2, y - r / 2, r, r),
        inside = [],
        getter = X[0].hasOwnProperty("x")
          ? function(i) {
              return {
                x: X[i].x,
                y: X[i].y
              };
            }
          : function(i) {
              return {
                x: X[i],
                y: Y[i]
              };
            },
        found = 0;
      while (r <= 1e6 && !found) {
        for (var i = 0, ii = X.length; i < ii; i++) {
          var xy = getter(i);
          if (isPointInsideBBox(b, xy.x, xy.y)) {
            found++;
            inside.push(xy);
            break;
          }
        }
        if (!found) {
          r *= 2;
          b = box(x - r / 2, y - r / 2, r, r);
        }
      }
      if (r == 1e6) {
        return;
      }
      var len = Infinity,
        res;
      for (i = 0, ii = inside.length; i < ii; i++) {
        var l = Snap.len(x, y, inside[i].x, inside[i].y);
        if (len > l) {
          len = l;
          inside[i].len = l;
          res = inside[i];
        }
      }
      return res;
    };
    /*\
     * Snap.path.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if bounding boxes intersect
    \*/
    Snap.path.isBBoxIntersect = isBBoxIntersect;
    /*\
     * Snap.path.intersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point,
     o         y: (number) y coordinate of the point,
     o         t1: (number) t value for segment of path1,
     o         t2: (number) t value for segment of path2,
     o         segment1: (number) order number for segment of path1,
     o         segment2: (number) order number for segment of path2,
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1,
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
    \*/
    Snap.path.intersection = pathIntersection;
    Snap.path.intersectionNumber = pathIntersectionNumber;
    /*\
     * Snap.path.isPointInside
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     *
     * Note: fill mode doesn’t affect the result of this method.
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) `true` if point is inside the path
    \*/
    Snap.path.isPointInside = isPointInsidePath;
    /*\
     * Snap.path.getBBox
     [ method ]
     **
     * Utility method
     **
     * Returns the bounding box of a given path
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box,
     o     y: (number) y coordinate of the left top point of the box,
     o     x2: (number) x coordinate of the right bottom point of the box,
     o     y2: (number) y coordinate of the right bottom point of the box,
     o     width: (number) width of the box,
     o     height: (number) height of the box
     o }
    \*/
    Snap.path.getBBox = pathBBox;
    Snap.path.get = getPath;
    /*\
     * Snap.path.toRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path coordinates into relative values
     - path (string) path string
     = (array) path string
    \*/
    Snap.path.toRelative = pathToRelative;
    /*\
     * Snap.path.toAbsolute
     [ method ]
     **
     * Utility method
     **
     * Converts path coordinates into absolute values
     - path (string) path string
     = (array) path string
    \*/
    Snap.path.toAbsolute = pathToAbsolute;
    /*\
     * Snap.path.toCubic
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic beziér curves
     - pathString (string|array) path string or array of segments
     = (array) array of segments
    \*/
    Snap.path.toCubic = path2curve;
    /*\
     * Snap.path.map
     [ method ]
     **
     * Transform the path string with the given matrix
     - path (string) path string
     - matrix (object) see @Matrix
     = (string) transformed path string
    \*/
    Snap.path.map = mapPath;
    Snap.path.toString = toString;
    Snap.path.clone = pathClone;
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob) {
    var mmax = Math.max,
      mmin = Math.min;

    // Set
    var Set = function(items) {
        this.items = [];
        this.bindings = {};
        this.length = 0;
        this.type = "set";
        if (items) {
          for (var i = 0, ii = items.length; i < ii; i++) {
            if (items[i]) {
              this[this.items.length] = this.items[this.items.length] =
                items[i];
              this.length++;
            }
          }
        }
      },
      setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set
     = (object) original element
    \*/
    setproto.push = function() {
      var item, len;
      for (var i = 0, ii = arguments.length; i < ii; i++) {
        item = arguments[i];
        if (item) {
          len = this.items.length;
          this[len] = this.items[len] = item;
          this.length++;
        }
      }
      return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it
     = (object) element
    \*/
    setproto.pop = function() {
      this.length && delete this[this.length--];
      return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set
     *
     * If the function returns `false`, the loop stops running.
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
    \*/
    setproto.forEach = function(callback, thisArg) {
      for (var i = 0, ii = this.items.length; i < ii; i++) {
        if (callback.call(thisArg, this.items[i], i) === false) {
          return this;
        }
      }
      return this;
    };
    /*\
     * Set.animate
     [ method ]
     **
     * Animates each element in set in sync.
     *
     **
     - attrs (object) key-value pairs of destination attributes
     - duration (number) duration of the animation in milliseconds
     - easing (function) #optional easing function from @mina or custom
     - callback (function) #optional callback function that executes when the animation ends
     * or
     - animation (array) array of animation parameter for each element in set in format `[attrs, duration, easing, callback]`
     > Usage
     | // animate all elements in set to radius 10
     | set.animate({r: 10}, 500, mina.easein);
     | // or
     | // animate first element to radius 10, but second to radius 20 and in different time
     | set.animate([{r: 10}, 500, mina.easein], [{r: 20}, 1500, mina.easein]);
     = (Element) the current element
    \*/
    setproto.animate = function(attrs, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }
      if (attrs instanceof Snap._.Animation) {
        callback = attrs.callback;
        easing = attrs.easing;
        ms = easing.dur;
        attrs = attrs.attr;
      }
      var args = arguments;
      if (Snap.is(attrs, "array") && Snap.is(args[args.length - 1], "array")) {
        var each = true;
      }
      var begin,
        handler = function() {
          if (begin) {
            this.b = begin;
          } else {
            begin = this.b;
          }
        },
        cb = 0,
        set = this,
        callbacker =
          callback &&
          function() {
            if (++cb == set.length) {
              callback.call(this);
            }
          };
      return this.forEach(function(el, i) {
        eve.once("snap.animcreated." + el.id, handler);
        if (each) {
          args[i] && el.animate.apply(el, args[i]);
        } else {
          el.animate(attrs, ms, easing, callbacker);
        }
      });
    };
    /*\
     * Set.remove
     [ method ]
     **
     * Removes all children of the set.
     *
     = (object) Set object
    \*/
    setproto.remove = function() {
      while (this.length) {
        this.pop().remove();
      }
      return this;
    };
    /*\
     * Set.bind
     [ method ]
     **
     * Specifies how to handle a specific attribute when applied
     * to a set.
     *
     **
     - attr (string) attribute name
     - callback (function) function to run
     * or
     - attr (string) attribute name
     - element (Element) specific element in the set to apply the attribute to
     * or
     - attr (string) attribute name
     - element (Element) specific element in the set to apply the attribute to
     - eattr (string) attribute on the element to bind the attribute to
     = (object) Set object
    \*/
    setproto.bind = function(attr, a, b) {
      var data = {};
      if (typeof a == "function") {
        this.bindings[attr] = a;
      } else {
        var aname = b || attr;
        this.bindings[attr] = function(v) {
          data[aname] = v;
          a.attr(data);
        };
      }
      return this;
    };
    /*\
     * Set.attr
     [ method ]
     **
     * Equivalent of @Element.attr.
     = (object) Set object
    \*/
    setproto.attr = function(value) {
      var unbound = {};
      for (var k in value) {
        if (this.bindings[k]) {
          this.bindings[k](value[k]);
        } else {
          unbound[k] = value[k];
        }
      }
      for (var i = 0, ii = this.items.length; i < ii; i++) {
        this.items[i].attr(unbound);
      }
      return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removes all elements from the set
    \*/
    setproto.clear = function() {
      while (this.length) {
        this.pop();
      }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes range of elements from the set
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
    \*/
    setproto.splice = function(index, count, insertion) {
      index = index < 0 ? mmax(this.length + index, 0) : index;
      count = mmax(0, mmin(this.length - index, count));
      var tail = [],
        todel = [],
        args = [],
        i;
      for (i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      for (i = 0; i < count; i++) {
        todel.push(this[index + i]);
      }
      for (; i < this.length - index; i++) {
        tail.push(this[index + i]);
      }
      var arglen = args.length;
      for (i = 0; i < arglen + tail.length; i++) {
        this.items[index + i] = this[index + i] =
          i < arglen ? args[i] : tail[i - arglen];
      }
      i = this.items.length = this.length -= count - arglen;
      while (this[i]) {
        delete this[i++];
      }
      return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     - element (object) element to remove
     = (boolean) `true` if object was found and removed from the set
    \*/
    setproto.exclude = function(el) {
      for (var i = 0, ii = this.length; i < ii; i++)
        if (this[i] == el) {
          this.splice(i, 1);
          return true;
        }
      return false;
    };
    /*\
     * Set.insertAfter
     [ method ]
     **
     * Inserts set elements after given element.
     **
     - element (object) set will be inserted after this element
     = (object) Set object
    \*/
    setproto.insertAfter = function(el) {
      var i = this.items.length;
      while (i--) {
        this.items[i].insertAfter(el);
      }
      return this;
    };
    /*\
     * Set.getBBox
     [ method ]
     **
     * Union of all bboxes of the set. See @Element.getBBox.
     = (object) bounding box descriptor. See @Element.getBBox.
    \*/
    setproto.getBBox = function() {
      var x = [],
        y = [],
        x2 = [],
        y2 = [];
      for (var i = this.items.length; i--; )
        if (!this.items[i].removed) {
          var box = this.items[i].getBBox();
          x.push(box.x);
          y.push(box.y);
          x2.push(box.x + box.width);
          y2.push(box.y + box.height);
        }
      x = mmin.apply(0, x);
      y = mmin.apply(0, y);
      x2 = mmax.apply(0, x2);
      y2 = mmax.apply(0, y2);
      return {
        x: x,
        y: y,
        x2: x2,
        y2: y2,
        width: x2 - x,
        height: y2 - y,
        cx: x + (x2 - x) / 2,
        cy: y + (y2 - y) / 2
      };
    };
    /*\
     * Set.insertAfter
     [ method ]
     **
     * Creates a clone of the set.
     **
     = (object) New Set object
    \*/
    setproto.clone = function(s) {
      s = new Set();
      for (var i = 0, ii = this.items.length; i < ii; i++) {
        s.push(this.items[i].clone());
      }
      return s;
    };
    setproto.toString = function() {
      return "Snap\u2018s set";
    };
    setproto.type = "set";
    // export
    /*\
     * Snap.Set
     [ property ]
     **
     * Set constructor.
    \*/
    Snap.Set = Set;
    /*\
     * Snap.set
     [ method ]
     **
     * Creates a set and fills it with list of arguments.
     **
     = (object) New Set object
     | var r = paper.rect(0, 0, 10, 10),
     |     s1 = Snap.set(), // empty set
     |     s2 = Snap.set(r, paper.circle(100, 100, 20)); // prefilled set
    \*/
    Snap.set = function() {
      var set = new Set();
      if (arguments.length) {
        set.push.apply(set, Array.prototype.slice.call(arguments, 0));
      }
      return set;
    };
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob) {
    var names = {},
      reUnit = /[%a-z]+$/i,
      Str = String;
    names.stroke = names.fill = "colour";
    function getEmpty(item) {
      var l = item[0];
      switch (l.toLowerCase()) {
        case "t":
          return [l, 0, 0];
        case "m":
          return [l, 1, 0, 0, 1, 0, 0];
        case "r":
          if (item.length == 4) {
            return [l, 0, item[2], item[3]];
          } else {
            return [l, 0];
          }
        case "s":
          if (item.length == 5) {
            return [l, 1, 1, item[3], item[4]];
          } else if (item.length == 3) {
            return [l, 1, 1];
          } else {
            return [l, 1];
          }
      }
    }
    function equaliseTransform(t1, t2, getBBox) {
      t1 = t1 || new Snap.Matrix();
      t2 = t2 || new Snap.Matrix();
      t1 = Snap.parseTransformString(t1.toTransformString()) || [];
      t2 = Snap.parseTransformString(t2.toTransformString()) || [];
      var maxlength = Math.max(t1.length, t2.length),
        from = [],
        to = [],
        i = 0,
        j,
        jj,
        tt1,
        tt2;
      for (; i < maxlength; i++) {
        tt1 = t1[i] || getEmpty(t2[i]);
        tt2 = t2[i] || getEmpty(tt1);
        if (
          tt1[0] != tt2[0] ||
          (tt1[0].toLowerCase() == "r" &&
            (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
          (tt1[0].toLowerCase() == "s" &&
            (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
        ) {
          t1 = Snap._.transform2matrix(t1, getBBox());
          t2 = Snap._.transform2matrix(t2, getBBox());
          from = [["m", t1.a, t1.b, t1.c, t1.d, t1.e, t1.f]];
          to = [["m", t2.a, t2.b, t2.c, t2.d, t2.e, t2.f]];
          break;
        }
        from[i] = [];
        to[i] = [];
        for (j = 0, jj = Math.max(tt1.length, tt2.length); j < jj; j++) {
          j in tt1 && (from[i][j] = tt1[j]);
          j in tt2 && (to[i][j] = tt2[j]);
        }
      }
      return {
        from: path2array(from),
        to: path2array(to),
        f: getPath(from)
      };
    }
    function getNumber(val) {
      return val;
    }
    function getUnit(unit) {
      return function(val) {
        return +val.toFixed(3) + unit;
      };
    }
    function getViewBox(val) {
      return val.join(" ");
    }
    function getColour(clr) {
      return Snap.rgb(clr[0], clr[1], clr[2], clr[3]);
    }
    function getPath(path) {
      var k = 0,
        i,
        ii,
        j,
        jj,
        out,
        a,
        b = [];
      for (i = 0, ii = path.length; i < ii; i++) {
        out = "[";
        a = ['"' + path[i][0] + '"'];
        for (j = 1, jj = path[i].length; j < jj; j++) {
          a[j] = "val[" + k++ + "]";
        }
        out += a + "]";
        b[i] = out;
      }
      return Function("val", "return Snap.path.toString.call([" + b + "])");
    }
    function path2array(path) {
      var out = [];
      for (var i = 0, ii = path.length; i < ii; i++) {
        for (var j = 1, jj = path[i].length; j < jj; j++) {
          out.push(path[i][j]);
        }
      }
      return out;
    }
    function isNumeric(obj) {
      return isFinite(obj);
    }
    function arrayEqual(arr1, arr2) {
      if (!Snap.is(arr1, "array") || !Snap.is(arr2, "array")) {
        return false;
      }
      return arr1.toString() == arr2.toString();
    }
    Element.prototype.equal = function(name, b) {
      return eve("snap.util.equal", this, name, b).firstDefined();
    };
    eve.on("snap.util.equal", function(name, b) {
      var A,
        B,
        a = Str(this.attr(name) || ""),
        el = this;
      if (names[name] == "colour") {
        A = Snap.color(a);
        B = Snap.color(b);
        return {
          from: [A.r, A.g, A.b, A.opacity],
          to: [B.r, B.g, B.b, B.opacity],
          f: getColour
        };
      }
      if (name == "viewBox") {
        A = this.attr(name)
          .vb.split(" ")
          .map(Number);
        B = b.split(" ").map(Number);
        return {
          from: A,
          to: B,
          f: getViewBox
        };
      }
      if (
        name == "transform" ||
        name == "gradientTransform" ||
        name == "patternTransform"
      ) {
        if (typeof b == "string") {
          b = Str(b).replace(/\.{3}|\u2026/g, a);
        }
        a = this.matrix;
        if (!Snap._.rgTransform.test(b)) {
          b = Snap._.transform2matrix(
            Snap._.svgTransform2string(b),
            this.getBBox()
          );
        } else {
          b = Snap._.transform2matrix(b, this.getBBox());
        }
        return equaliseTransform(a, b, function() {
          return el.getBBox(1);
        });
      }
      if (name == "d" || name == "path") {
        A = Snap.path.toCubic(a, b);
        return {
          from: path2array(A[0]),
          to: path2array(A[1]),
          f: getPath(A[0])
        };
      }
      if (name == "points") {
        A = Str(a).split(Snap._.separator);
        B = Str(b).split(Snap._.separator);
        return {
          from: A,
          to: B,
          f: function(val) {
            return val;
          }
        };
      }
      if (isNumeric(a) && isNumeric(b)) {
        return {
          from: parseFloat(a),
          to: parseFloat(b),
          f: getNumber
        };
      }
      var aUnit = a.match(reUnit),
        bUnit = Str(b).match(reUnit);
      if (aUnit && arrayEqual(aUnit, bUnit)) {
        return {
          from: parseFloat(a),
          to: parseFloat(b),
          f: getUnit(aUnit)
        };
      } else {
        return {
          from: this.asPX(name),
          to: this.asPX(name, b),
          f: getNumber
        };
      }
    });
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob) {
    var elproto = Element.prototype,
      has = "hasOwnProperty",
      supportsTouch = "createTouch" in glob.doc,
      events = [
        "click",
        "dblclick",
        "mousedown",
        "mousemove",
        "mouseout",
        "mouseover",
        "mouseup",
        "touchstart",
        "touchmove",
        "touchend",
        "touchcancel"
      ],
      touchMap = {
        mousedown: "touchstart",
        mousemove: "touchmove",
        mouseup: "touchend"
      },
      getScroll = function(xy, el) {
        var name = xy == "y" ? "scrollTop" : "scrollLeft",
          doc = el && el.node ? el.node.ownerDocument : glob.doc;
        return doc[name in doc.documentElement ? "documentElement" : "body"][
          name
        ];
      },
      preventDefault = function() {
        this.returnValue = false;
      },
      preventTouch = function() {
        return this.originalEvent.preventDefault();
      },
      stopPropagation = function() {
        this.cancelBubble = true;
      },
      stopTouch = function() {
        return this.originalEvent.stopPropagation();
      },
      addEvent = function(obj, type, fn, element) {
        var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
          f = function(e) {
            var scrollY = getScroll("y", element),
              scrollX = getScroll("x", element);
            if (supportsTouch && touchMap[has](type)) {
              for (
                var i = 0, ii = e.targetTouches && e.targetTouches.length;
                i < ii;
                i++
              ) {
                if (
                  e.targetTouches[i].target == obj ||
                  obj.contains(e.targetTouches[i].target)
                ) {
                  var olde = e;
                  e = e.targetTouches[i];
                  e.originalEvent = olde;
                  e.preventDefault = preventTouch;
                  e.stopPropagation = stopTouch;
                  break;
                }
              }
            }
            var x = e.clientX + scrollX,
              y = e.clientY + scrollY;
            return fn.call(element, e, x, y);
          };

        if (type !== realName) {
          obj.addEventListener(type, f, false);
        }

        obj.addEventListener(realName, f, false);

        return function() {
          if (type !== realName) {
            obj.removeEventListener(type, f, false);
          }

          obj.removeEventListener(realName, f, false);
          return true;
        };
      },
      drag = [],
      dragMove = function(e) {
        var x = e.clientX,
          y = e.clientY,
          scrollY = getScroll("y"),
          scrollX = getScroll("x"),
          dragi,
          j = drag.length;
        while (j--) {
          dragi = drag[j];
          if (supportsTouch) {
            var i = e.touches && e.touches.length,
              touch;
            while (i--) {
              touch = e.touches[i];
              if (
                touch.identifier == dragi.el._drag.id ||
                dragi.el.node.contains(touch.target)
              ) {
                x = touch.clientX;
                y = touch.clientY;
                (e.originalEvent ? e.originalEvent : e).preventDefault();
                break;
              }
            }
          } else {
            e.preventDefault();
          }
          var node = dragi.el.node,
            o,
            next = node.nextSibling,
            parent = node.parentNode,
            display = node.style.display;
          // glob.win.opera && parent.removeChild(node);
          // node.style.display = "none";
          // o = dragi.el.paper.getElementByPoint(x, y);
          // node.style.display = display;
          // glob.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
          // o && eve("snap.drag.over." + dragi.el.id, dragi.el, o);
          x += scrollX;
          y += scrollY;
          eve(
            "snap.drag.move." + dragi.el.id,
            dragi.move_scope || dragi.el,
            x - dragi.el._drag.x,
            y - dragi.el._drag.y,
            x,
            y,
            e
          );
        }
      },
      dragUp = function(e) {
        Snap.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
          dragi;
        while (i--) {
          dragi = drag[i];
          dragi.el._drag = {};
          eve(
            "snap.drag.end." + dragi.el.id,
            dragi.end_scope ||
              dragi.start_scope ||
              dragi.move_scope ||
              dragi.el,
            e
          );
          eve.off("snap.drag.*." + dragi.el.id);
        }
        drag = [];
      };
    /*\
     * Element.click
     [ method ]
     **
     * Adds a click event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unclick
     [ method ]
     **
     * Removes a click event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds a double click event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes a double click event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds a mousedown event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes a mousedown event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds a mousemove event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes a mousemove event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds a mouseout event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes a mouseout event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds a mouseover event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes a mouseover event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds a mouseup event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes a mouseup event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds a touchstart event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes a touchstart event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds a touchmove event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes a touchmove event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchend
     [ method ]
     **
     * Adds a touchend event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes a touchend event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds a touchcancel event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes a touchcancel event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/
    for (var i = events.length; i--; ) {
      (function(eventName) {
        Snap[eventName] = elproto[eventName] = function(fn, scope) {
          if (Snap.is(fn, "function")) {
            this.events = this.events || [];
            this.events.push({
              name: eventName,
              f: fn,
              unbind: addEvent(
                this.node || document,
                eventName,
                fn,
                scope || this
              )
            });
          } else {
            for (var i = 0, ii = this.events.length; i < ii; i++)
              if (this.events[i].name == eventName) {
                try {
                  this.events[i].f.call(this);
                } catch (e) {}
              }
          }
          return this;
        };
        Snap["un" + eventName] = elproto["un" + eventName] = function(fn) {
          var events = this.events || [],
            l = events.length;
          while (l--)
            if (events[l].name == eventName && (events[l].f == fn || !fn)) {
              events[l].unbind();
              events.splice(l, 1);
              !events.length && delete this.events;
              return this;
            }
          return this;
        };
      })(events[i]);
    }
    /*\
     * Element.hover
     [ method ]
     **
     * Adds hover event handlers to the element
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
    \*/
    elproto.hover = function(f_in, f_out, scope_in, scope_out) {
      return this.mouseover(f_in, scope_in).mouseout(
        f_out,
        scope_out || scope_in
      );
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes hover event handlers from the element
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
    \*/
    elproto.unhover = function(f_in, f_out) {
      return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    // SIERRA unclear what _context_ refers to for starting, ending, moving the drag gesture.
    // SIERRA Element.drag(): _x position of the mouse_: Where are the x/y values offset from?
    // SIERRA Element.drag(): much of this member's doc appears to be duplicated for some reason.
    // SIERRA Unclear about this sentence: _Additionally following drag events will be triggered: drag.start.<id> on start, drag.end.<id> on end and drag.move.<id> on every move._ Is there a global _drag_ object to which you can assign handlers keyed by an element's ID?
    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for an element's drag gesture
     **
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events are triggered: `drag.start.<id>` on start,
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element is dragged over another element
     * `drag.over.<id>` fires as well.
     *
     * Start event and start handler are called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler are called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler are called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
    \*/
    elproto.drag = function(
      onmove,
      onstart,
      onend,
      move_scope,
      start_scope,
      end_scope
    ) {
      var el = this;
      if (!arguments.length) {
        var origTransform;
        return el.drag(
          function(dx, dy) {
            this.attr({
              transform: origTransform + (origTransform ? "T" : "t") + [dx, dy]
            });
          },
          function() {
            origTransform = this.transform().local;
          }
        );
      }
      function start(e, x, y) {
        (e.originalEvent || e).preventDefault();
        el._drag.x = x;
        el._drag.y = y;
        el._drag.id = e.identifier;
        !drag.length && Snap.mousemove(dragMove).mouseup(dragUp);
        drag.push({
          el: el,
          move_scope: move_scope,
          start_scope: start_scope,
          end_scope: end_scope
        });
        onstart && eve.on("snap.drag.start." + el.id, onstart);
        onmove && eve.on("snap.drag.move." + el.id, onmove);
        onend && eve.on("snap.drag.end." + el.id, onend);
        eve(
          "snap.drag.start." + el.id,
          start_scope || move_scope || el,
          x,
          y,
          e
        );
      }
      function init(e, x, y) {
        eve("snap.draginit." + el.id, el, e, x, y);
      }
      eve.on("snap.draginit." + el.id, start);
      el._drag = {};
      draggable.push({ el: el, start: start, init: init });
      el.mousedown(init);
      return el;
    };
    /*
     * Element.onDragOver
     [ method ]
     **
     * Shortcut to assign event handler for `drag.over.<id>` event, where `id` is the element's `id` (see @Element.id)
     - f (function) handler for event, first argument would be the element you are dragging over
    \*/
    // elproto.onDragOver = function (f) {
    //     f ? eve.on("snap.drag.over." + this.id, f) : eve.unbind("snap.drag.over." + this.id);
    // };
    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from the given element
    \*/
    elproto.undrag = function() {
      var i = draggable.length;
      while (i--)
        if (draggable[i].el == this) {
          this.unmousedown(draggable[i].init);
          draggable.splice(i, 1);
          eve.unbind("snap.drag.*." + this.id);
          eve.unbind("snap.draginit." + this.id);
        }
      !draggable.length && Snap.unmousemove(dragMove).unmouseup(dragUp);
      return this;
    };
  });

  // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob) {
    var elproto = Element.prototype,
      pproto = Paper.prototype,
      rgurl = /^\s*url\((.+)\)/,
      Str = String,
      $ = Snap._.$;
    Snap.filter = {};
    /*\
     * Paper.filter
     [ method ]
     **
     * Creates a `<filter>` element
     **
     - filstr (string) SVG fragment of filter provided as a string
     = (object) @Element
     * Note: It is recommended to use filters embedded into the page inside an empty SVG element.
     > Usage
     | var f = paper.filter('<feGaussianBlur stdDeviation="2"/>'),
     |     c = paper.circle(10, 10, 10).attr({
     |         filter: f
     |     });
    \*/
    pproto.filter = function(filstr) {
      var paper = this;
      if (paper.type != "svg") {
        paper = paper.paper;
      }
      var f = Snap.parse(Str(filstr)),
        id = Snap._.id(),
        width = paper.node.offsetWidth,
        height = paper.node.offsetHeight,
        filter = $("filter");
      $(filter, {
        id: id,
        filterUnits: "userSpaceOnUse"
      });
      filter.appendChild(f.node);
      paper.defs.appendChild(filter);
      return new Element(filter);
    };

    eve.on("snap.util.getattr.filter", function() {
      eve.stop();
      var p = $(this.node, "filter");
      if (p) {
        var match = Str(p).match(rgurl);
        return match && Snap.select(match[1]);
      }
    });
    eve.on("snap.util.attr.filter", function(value) {
      if (value instanceof Element && value.type == "filter") {
        eve.stop();
        var id = value.node.id;
        if (!id) {
          $(value.node, { id: value.id });
          id = value.id;
        }
        $(this.node, {
          filter: Snap.url(id)
        });
      }
      if (!value || value == "none") {
        eve.stop();
        this.node.removeAttribute("filter");
      }
    });
    /*\
     * Snap.filter.blur
     [ method ]
     **
     * Returns an SVG markup string for the blur filter
     **
     - x (number) amount of horizontal blur, in pixels
     - y (number) #optional amount of vertical blur, in pixels
     = (string) filter representation
     > Usage
     | var f = paper.filter(Snap.filter.blur(5, 10)),
     |     c = paper.circle(10, 10, 10).attr({
     |         filter: f
     |     });
    \*/
    Snap.filter.blur = function(x, y) {
      if (x == null) {
        x = 2;
      }
      var def = y == null ? x : [x, y];
      return Snap.format('<feGaussianBlur stdDeviation="{def}"/>', {
        def: def
      });
    };
    Snap.filter.blur.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.shadow
     [ method ]
     **
     * Returns an SVG markup string for the shadow filter
     **
     - dx (number) #optional horizontal shift of the shadow, in pixels
     - dy (number) #optional vertical shift of the shadow, in pixels
     - blur (number) #optional amount of blur
     - color (string) #optional color of the shadow
     - opacity (number) #optional `0..1` opacity of the shadow
     * or
     - dx (number) #optional horizontal shift of the shadow, in pixels
     - dy (number) #optional vertical shift of the shadow, in pixels
     - color (string) #optional color of the shadow
     - opacity (number) #optional `0..1` opacity of the shadow
     * which makes blur default to `4`. Or
     - dx (number) #optional horizontal shift of the shadow, in pixels
     - dy (number) #optional vertical shift of the shadow, in pixels
     - opacity (number) #optional `0..1` opacity of the shadow
     = (string) filter representation
     > Usage
     | var f = paper.filter(Snap.filter.shadow(0, 2, .3)),
     |     c = paper.circle(10, 10, 10).attr({
     |         filter: f
     |     });
    \*/
    Snap.filter.shadow = function(dx, dy, blur, color, opacity) {
      if (opacity == null) {
        if (color == null) {
          opacity = blur;
          blur = 4;
          color = "#000";
        } else {
          opacity = color;
          color = blur;
          blur = 4;
        }
      }
      if (blur == null) {
        blur = 4;
      }
      if (opacity == null) {
        opacity = 1;
      }
      if (dx == null) {
        dx = 0;
        dy = 2;
      }
      if (dy == null) {
        dy = dx;
      }
      color = Snap.color(color);
      return Snap.format(
        '<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>',
        {
          color: color,
          dx: dx,
          dy: dy,
          blur: blur,
          opacity: opacity
        }
      );
    };
    Snap.filter.shadow.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.grayscale
     [ method ]
     **
     * Returns an SVG markup string for the grayscale filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/
    Snap.filter.grayscale = function(amount) {
      if (amount == null) {
        amount = 1;
      }
      return Snap.format(
        '<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>',
        {
          a: 0.2126 + 0.7874 * (1 - amount),
          b: 0.7152 - 0.7152 * (1 - amount),
          c: 0.0722 - 0.0722 * (1 - amount),
          d: 0.2126 - 0.2126 * (1 - amount),
          e: 0.7152 + 0.2848 * (1 - amount),
          f: 0.0722 - 0.0722 * (1 - amount),
          g: 0.2126 - 0.2126 * (1 - amount),
          h: 0.0722 + 0.9278 * (1 - amount)
        }
      );
    };
    Snap.filter.grayscale.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.sepia
     [ method ]
     **
     * Returns an SVG markup string for the sepia filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/
    Snap.filter.sepia = function(amount) {
      if (amount == null) {
        amount = 1;
      }
      return Snap.format(
        '<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>',
        {
          a: 0.393 + 0.607 * (1 - amount),
          b: 0.769 - 0.769 * (1 - amount),
          c: 0.189 - 0.189 * (1 - amount),
          d: 0.349 - 0.349 * (1 - amount),
          e: 0.686 + 0.314 * (1 - amount),
          f: 0.168 - 0.168 * (1 - amount),
          g: 0.272 - 0.272 * (1 - amount),
          h: 0.534 - 0.534 * (1 - amount),
          i: 0.131 + 0.869 * (1 - amount)
        }
      );
    };
    Snap.filter.sepia.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.saturate
     [ method ]
     **
     * Returns an SVG markup string for the saturate filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/
    Snap.filter.saturate = function(amount) {
      if (amount == null) {
        amount = 1;
      }
      return Snap.format('<feColorMatrix type="saturate" values="{amount}"/>', {
        amount: 1 - amount
      });
    };
    Snap.filter.saturate.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.hueRotate
     [ method ]
     **
     * Returns an SVG markup string for the hue-rotate filter
     **
     - angle (number) angle of rotation
     = (string) filter representation
    \*/
    Snap.filter.hueRotate = function(angle) {
      angle = angle || 0;
      return Snap.format('<feColorMatrix type="hueRotate" values="{angle}"/>', {
        angle: angle
      });
    };
    Snap.filter.hueRotate.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.invert
     [ method ]
     **
     * Returns an SVG markup string for the invert filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/
    Snap.filter.invert = function(amount) {
      if (amount == null) {
        amount = 1;
      }
      //        <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" color-interpolation-filters="sRGB"/>
      return Snap.format(
        '<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>',
        {
          amount: amount,
          amount2: 1 - amount
        }
      );
    };
    Snap.filter.invert.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.brightness
     [ method ]
     **
     * Returns an SVG markup string for the brightness filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/
    Snap.filter.brightness = function(amount) {
      if (amount == null) {
        amount = 1;
      }
      return Snap.format(
        '<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>',
        {
          amount: amount
        }
      );
    };
    Snap.filter.brightness.toString = function() {
      return this();
    };
    /*\
     * Snap.filter.contrast
     [ method ]
     **
     * Returns an SVG markup string for the contrast filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/
    Snap.filter.contrast = function(amount) {
      if (amount == null) {
        amount = 1;
      }
      return Snap.format(
        '<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>',
        {
          amount: amount,
          amount2: 0.5 - amount / 2
        }
      );
    };
    Snap.filter.contrast.toString = function() {
      return this();
    };
  });

  // Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob, Fragment) {
    var box = Snap._.box,
      is = Snap.is,
      firstLetter = /^[^a-z]*([tbmlrc])/i,
      toString = function() {
        return "T" + this.dx + "," + this.dy;
      };
    /*\
     * Element.getAlign
     [ method ]
     **
     * Returns shift needed to align the element relatively to given element.
     * If no elements specified, parent `<svg>` container will be used.
     - el (object) @optional alignment element
     - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
     = (object|string) Object in format `{dx: , dy: }` also has a string representation as a transformation string
     > Usage
     | el.transform(el.getAlign(el2, "top"));
     * or
     | var dy = el.getAlign(el2, "top").dy;
    \*/
    Element.prototype.getAlign = function(el, way) {
      if (way == null && is(el, "string")) {
        way = el;
        el = null;
      }
      el = el || this.paper;
      var bx = el.getBBox ? el.getBBox() : box(el),
        bb = this.getBBox(),
        out = {};
      way = way && way.match(firstLetter);
      way = way ? way[1].toLowerCase() : "c";
      switch (way) {
        case "t":
          out.dx = 0;
          out.dy = bx.y - bb.y;
          break;
        case "b":
          out.dx = 0;
          out.dy = bx.y2 - bb.y2;
          break;
        case "m":
          out.dx = 0;
          out.dy = bx.cy - bb.cy;
          break;
        case "l":
          out.dx = bx.x - bb.x;
          out.dy = 0;
          break;
        case "r":
          out.dx = bx.x2 - bb.x2;
          out.dy = 0;
          break;
        default:
          out.dx = bx.cx - bb.cx;
          out.dy = 0;
          break;
      }
      out.toString = toString;
      return out;
    };
    /*\
     * Element.align
     [ method ]
     **
     * Aligns the element relatively to given one via transformation.
     * If no elements specified, parent `<svg>` container will be used.
     - el (object) @optional alignment element
     - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
     = (object) this element
     > Usage
     | el.align(el2, "top");
     * or
     | el.align("middle");
    \*/
    Element.prototype.align = function(el, way) {
      return this.transform("..." + this.getAlign(el, way));
    };
  });

  // Copyright (c) 2017 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  Snap.plugin(function(Snap, Element, Paper, glob) {
    // Colours are from https://www.materialui.co
    var red =
        "#ffebee#ffcdd2#ef9a9a#e57373#ef5350#f44336#e53935#d32f2f#c62828#b71c1c#ff8a80#ff5252#ff1744#d50000",
      pink =
        "#FCE4EC#F8BBD0#F48FB1#F06292#EC407A#E91E63#D81B60#C2185B#AD1457#880E4F#FF80AB#FF4081#F50057#C51162",
      purple =
        "#F3E5F5#E1BEE7#CE93D8#BA68C8#AB47BC#9C27B0#8E24AA#7B1FA2#6A1B9A#4A148C#EA80FC#E040FB#D500F9#AA00FF",
      deeppurple =
        "#EDE7F6#D1C4E9#B39DDB#9575CD#7E57C2#673AB7#5E35B1#512DA8#4527A0#311B92#B388FF#7C4DFF#651FFF#6200EA",
      indigo =
        "#E8EAF6#C5CAE9#9FA8DA#7986CB#5C6BC0#3F51B5#3949AB#303F9F#283593#1A237E#8C9EFF#536DFE#3D5AFE#304FFE",
      blue =
        "#E3F2FD#BBDEFB#90CAF9#64B5F6#64B5F6#2196F3#1E88E5#1976D2#1565C0#0D47A1#82B1FF#448AFF#2979FF#2962FF",
      lightblue =
        "#E1F5FE#B3E5FC#81D4FA#4FC3F7#29B6F6#03A9F4#039BE5#0288D1#0277BD#01579B#80D8FF#40C4FF#00B0FF#0091EA",
      cyan =
        "#E0F7FA#B2EBF2#80DEEA#4DD0E1#26C6DA#00BCD4#00ACC1#0097A7#00838F#006064#84FFFF#18FFFF#00E5FF#00B8D4",
      teal =
        "#E0F2F1#B2DFDB#80CBC4#4DB6AC#26A69A#009688#00897B#00796B#00695C#004D40#A7FFEB#64FFDA#1DE9B6#00BFA5",
      green =
        "#E8F5E9#C8E6C9#A5D6A7#81C784#66BB6A#4CAF50#43A047#388E3C#2E7D32#1B5E20#B9F6CA#69F0AE#00E676#00C853",
      lightgreen =
        "#F1F8E9#DCEDC8#C5E1A5#AED581#9CCC65#8BC34A#7CB342#689F38#558B2F#33691E#CCFF90#B2FF59#76FF03#64DD17",
      lime =
        "#F9FBE7#F0F4C3#E6EE9C#DCE775#D4E157#CDDC39#C0CA33#AFB42B#9E9D24#827717#F4FF81#EEFF41#C6FF00#AEEA00",
      yellow =
        "#FFFDE7#FFF9C4#FFF59D#FFF176#FFEE58#FFEB3B#FDD835#FBC02D#F9A825#F57F17#FFFF8D#FFFF00#FFEA00#FFD600",
      amber =
        "#FFF8E1#FFECB3#FFE082#FFD54F#FFCA28#FFC107#FFB300#FFA000#FF8F00#FF6F00#FFE57F#FFD740#FFC400#FFAB00",
      orange =
        "#FFF3E0#FFE0B2#FFCC80#FFB74D#FFA726#FF9800#FB8C00#F57C00#EF6C00#E65100#FFD180#FFAB40#FF9100#FF6D00",
      deeporange =
        "#FBE9E7#FFCCBC#FFAB91#FF8A65#FF7043#FF5722#F4511E#E64A19#D84315#BF360C#FF9E80#FF6E40#FF3D00#DD2C00",
      brown =
        "#EFEBE9#D7CCC8#BCAAA4#A1887F#8D6E63#795548#6D4C41#5D4037#4E342E#3E2723",
      grey =
        "#FAFAFA#F5F5F5#EEEEEE#E0E0E0#BDBDBD#9E9E9E#757575#616161#424242#212121",
      bluegrey =
        "#ECEFF1#CFD8DC#B0BEC5#90A4AE#78909C#607D8B#546E7A#455A64#37474F#263238";
    /*\
     * Snap.mui
     [ property ]
     **
     * Contain Material UI colours.
     | Snap().rect(0, 0, 10, 10).attr({fill: Snap.mui.deeppurple, stroke: Snap.mui.amber[600]});
     # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
    \*/
    Snap.mui = {};
    /*\
     * Snap.flat
     [ property ]
     **
     * Contain Flat UI colours.
     | Snap().rect(0, 0, 10, 10).attr({fill: Snap.flat.carrot, stroke: Snap.flat.wetasphalt});
     # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
    \*/
    Snap.flat = {};
    function saveColor(colors) {
      colors = colors.split(/(?=#)/);
      var color = new String(colors[5]);
      color[50] = colors[0];
      color[100] = colors[1];
      color[200] = colors[2];
      color[300] = colors[3];
      color[400] = colors[4];
      color[500] = colors[5];
      color[600] = colors[6];
      color[700] = colors[7];
      color[800] = colors[8];
      color[900] = colors[9];
      if (colors[10]) {
        color.A100 = colors[10];
        color.A200 = colors[11];
        color.A400 = colors[12];
        color.A700 = colors[13];
      }
      return color;
    }
    Snap.mui.red = saveColor(red);
    Snap.mui.pink = saveColor(pink);
    Snap.mui.purple = saveColor(purple);
    Snap.mui.deeppurple = saveColor(deeppurple);
    Snap.mui.indigo = saveColor(indigo);
    Snap.mui.blue = saveColor(blue);
    Snap.mui.lightblue = saveColor(lightblue);
    Snap.mui.cyan = saveColor(cyan);
    Snap.mui.teal = saveColor(teal);
    Snap.mui.green = saveColor(green);
    Snap.mui.lightgreen = saveColor(lightgreen);
    Snap.mui.lime = saveColor(lime);
    Snap.mui.yellow = saveColor(yellow);
    Snap.mui.amber = saveColor(amber);
    Snap.mui.orange = saveColor(orange);
    Snap.mui.deeporange = saveColor(deeporange);
    Snap.mui.brown = saveColor(brown);
    Snap.mui.grey = saveColor(grey);
    Snap.mui.bluegrey = saveColor(bluegrey);
    Snap.flat.turquoise = "#1abc9c";
    Snap.flat.greensea = "#16a085";
    Snap.flat.sunflower = "#f1c40f";
    Snap.flat.orange = "#f39c12";
    Snap.flat.emerland = "#2ecc71";
    Snap.flat.nephritis = "#27ae60";
    Snap.flat.carrot = "#e67e22";
    Snap.flat.pumpkin = "#d35400";
    Snap.flat.peterriver = "#3498db";
    Snap.flat.belizehole = "#2980b9";
    Snap.flat.alizarin = "#e74c3c";
    Snap.flat.pomegranate = "#c0392b";
    Snap.flat.amethyst = "#9b59b6";
    Snap.flat.wisteria = "#8e44ad";
    Snap.flat.clouds = "#ecf0f1";
    Snap.flat.silver = "#bdc3c7";
    Snap.flat.wetasphalt = "#34495e";
    Snap.flat.midnightblue = "#2c3e50";
    Snap.flat.concrete = "#95a5a6";
    Snap.flat.asbestos = "#7f8c8d";
    /*\
     * Snap.importMUIColors
     [ method ]
     **
     * Imports Material UI colours into global object.
     | Snap.importMUIColors();
     | Snap().rect(0, 0, 10, 10).attr({fill: deeppurple, stroke: amber[600]});
     # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
    \*/
    Snap.importMUIColors = function() {
      for (var color in Snap.mui) {
        if (Snap.mui.hasOwnProperty(color)) {
          window[color] = Snap.mui[color];
        }
      }
    };
  });

  return Snap;
});
/**
 * Shared variables
 */
var ua = navigator.userAgent.toLowerCase(),
  platform = navigator.platform.toLowerCase(),
  $window = $(window),
  $document = $(document),
  $html = $("html"),
  $body = $("body"),
  android_ancient =
    ua.indexOf("mozilla/5.0") !== -1 &&
    ua.indexOf("android") !== -1 &&
    ua.indexOf("applewebKit") !== -1 &&
    ua.indexOf("chrome") === -1,
  apple = ua.match(/(iPad|iPhone|iPod|Macintosh)/i),
  webkit = ua.indexOf("webkit") != -1,
  isiPhone = false,
  isiPod = false,
  isAndroidPhone = false,
  android = false,
  iOS = false,
  isIE = false,
  ieMobile = false,
  isSafari = false,
  isMac = false,
  isWindows = false,
  isiele10 = false,
  isiPad = false,
  firefox = ua.indexOf("gecko") != -1,
  safari = ua.indexOf("safari") != -1 && ua.indexOf("chrome") == -1,
  is_small = $(".js-nav-trigger").is(":visible"),
  windowHeight = $window.height(),
  windowWidth = $window.width(),
  documentHeight = $document.height(),
  myOrientation = windowWidth > windowHeight ? "portrait" : "landscape",
  filmWidth,
  contentWidth,
  sidebarWidth,
  latestKnownScrollY = window.scrollY,
  latestKnownScrollX = window.scrollX,
  latestKnownMouseX = 0,
  latestKnownMouseY = 0,
  latestDeviceAlpha = 0,
  latestDeviceBeta = 0,
  latestDeviceGamma = 0,
  ticking = false,
  horToVertScroll = false,
  globalDebug = false;

(function($, undefined) {
  "use strict";
  var Blog = (function() {
    var $filmstrip_container,
      fullviewWidth,
      fullviewHeight,
      isFirstFilterClick,
      isLoadingPosts,
      filterBy;

    function init() {
      $filmstrip_container = $(".filmstrip");
      fullviewWidth = windowWidth;
      fullviewHeight = windowHeight;
      isFirstFilterClick = true;
      isLoadingPosts = false;
      filterBy = "";

      if (
        !$filmstrip_container.length ||
        !$filmstrip_container.children(".filmstrip__item").length
      ) {
        //this is not a blog archive so bail
        return;
      }

      $(".navigation").hide();

      if (isiele10) {
        calcIEFilmstrip();
      }

      var layoutMode = "flex";

      if (isSafari) {
        layoutMode = "-webkit-flex";
      }
      if ($("html").hasClass("is--ie-le10")) {
        layoutMode = "block";
      }

      //mixitup init without filtering
      $filmstrip_container.mixItUp({
        animation: {
          enable: false
        },
        selectors: {
          filter: ".no-real-selector-for-filtering",
          target: ".filmstrip__item"
        },
        layout: {
          display: layoutMode
        },
        callbacks: {
          onMixEnd: function(state) {
            if (isiele10) {
              calcIEFilmstrip();
            }
          }
        }
      });

      bindEvents();

      //if there are not sufficient posts to have scroll - load the next page also (prepending)
      var $last_child = $filmstrip_container
        .children(".filmstrip__item")
        .last();
      if (windowWidth - ($last_child.offset().left + $last_child.width()) > 0) {
        loadNextPosts();
      }
    }

    function bindEvents() {
      //we will handle the binding of filter links because we need to load all posts on first filter click
      $(".filter").on("click", ".filter__item", function() {
        filterBy = $(this).data("filter");

        // first make the current filter link active
        $(".filter__item").removeClass("active");
        $(this).addClass("active");

        if (isFirstFilterClick == true) {
          //this is the first time the user has clicked a filter link
          //we need to first load all posts before proceeding
          loadAllPosts();
        } else {
          //just regular filtering from the second click onwards
          $filmstrip_container.mixItUp("filter", filterBy);
        }

        return false;
      });

      $(".js-filter-mobile-journal").change(function() {
        filterBy = $(this)
          .children(":selected")
          .data("filter");

        // first make the current filter link active
        $(".filter__item").removeClass("active");
        $(this).addClass("active");

        if (isFirstFilterClick == true) {
          //this is the first time the user has clicked a filter link
          //we need to first load all posts before proceeding
          loadAllPosts();
        } else {
          //just regular filtering from the second click onwards
          $filmstrip_container.mixItUp("filter", filterBy);
        }

        return false;
      });
    }

    function loadAllPosts() {
      var offset = $filmstrip_container.find(".filmstrip__item").length;

      if (globalDebug) {
        console.log("Loading All Posts - AJAX Offset = " + offset);
      }

      isLoadingPosts = true;

      var args = {
        action: "timber_load_next_posts",
        nonce: timber_ajax.nonce,
        offset: offset,
        post_type: "post",
        posts_number: "all"
      };

      if (!empty($filmstrip_container.data("post_type"))) {
        args["post_type"] = $filmstrip_container.data("post_type");
      }

      if (!empty($filmstrip_container.data("taxonomy"))) {
        args["taxonomy"] = $filmstrip_container.data("taxonomy");
        args["term_id"] = $filmstrip_container.data("term_id");
      } else if (!empty($filmstrip_container.data("search"))) {
        args["search"] = $filmstrip_container.data("search");
      }

      $.post(timber_ajax.ajax_url, args, function(response_data) {
        if (response_data.success) {
          if (globalDebug) {
            console.log("Loaded all posts");
          }

          var $result = $(response_data.data.posts).filter(".filmstrip__item");

          if (globalDebug) {
            console.log("Adding new " + $result.length + " items to the DOM");
          }

          $(".navigation")
            .hide()
            .remove();

          $result.imagesLoaded(function() {
            if (globalDebug) {
              console.log("MixItUp Filtering - Images Loaded");
            }

            $filmstrip_container.mixItUp("append", $result, {
              filter: filterBy
            });

            //next time the user filters we will know
            isFirstFilterClick = false;

            isLoadingPosts = false;

            if (globalDebug) {
              console.log("MixItUp Filtering - Filter by " + filterBy);
            }
          });
        } else {
          //something didn't quite make it - maybe there are no more posts (be optimistic about it)
          //so we will assume that all posts are already loaded and proceed as usual
          if (globalDebug) {
            console.log(
              "MixItUp Filtering - There were no more posts to load - so filter please"
            );
          }

          isFirstFilterClick = false;
          isLoadingPosts = false;

          $filmstrip_container.mixItUp("filter", filterBy);
        }
      });
    }

    function loadNextPosts() {
      var offset = $filmstrip_container.find(".filmstrip__item").length;

      if (globalDebug) {
        console.log("Loading More Posts - AJAX Offset = " + offset);
      }

      isLoadingPosts = true;
      $(".preloader").css("opacity", 1);

      var args = {
        action: "timber_load_next_posts",
        nonce: timber_ajax.nonce,
        post_type: "post",
        offset: offset,
        posts_number: timber_ajax.posts_number
      };

      if (!empty($filmstrip_container.data("post_type"))) {
        args["post_type"] = $filmstrip_container.data("post_type");
      }

      if (!empty($filmstrip_container.data("taxonomy"))) {
        args["taxonomy"] = $filmstrip_container.data("taxonomy");
        args["term_id"] = $filmstrip_container.data("term_id");
      } else if (!empty($filmstrip_container.data("search"))) {
        args["search"] = $filmstrip_container.data("search");
      }

      $.post(timber_ajax.ajax_url, args, function(response_data) {
        if (response_data.success) {
          if (globalDebug) {
            console.log("Loaded next posts");
          }

          var $result = $(response_data.data.posts).filter(".filmstrip__item");

          if (globalDebug) {
            console.log("Adding new " + $result.length + " items to the DOM");
          }

          $result.imagesLoaded(function() {
            if (globalDebug) {
              console.log("MixItUp Filtering - Images Loaded");
            }
            $filmstrip_container.mixItUp("append", $result);

            if (isiele10) {
              calcIEFilmstrip();
            }

            isLoadingPosts = false;
          });
        } else {
          //we have failed
          //it's time to call it a day
          if (globalDebug) {
            console.log("It seems that there are no more posts to load");
          }

          $(".navigation").fadeOut();

          //don't make isLoadingPosts true so we won't load any more posts
        }

        $(".preloader").css("opacity", 0);
      });
    }

    function maybeLoadNextPosts() {
      if (!$filmstrip_container.length || isLoadingPosts) {
        return;
      }

      var $lastChild = $filmstrip_container.children(".filmstrip__item").last();

      //if the last child is in view then load more posts
      if ($lastChild.is(":appeared")) {
        loadNextPosts();
      }
    }

    function calcIEFilmstrip() {
      $filmstrip_container.width(
        ($(".filmstrip__item ")
          .first()
          .width() +
          50) *
          $(".filmstrip__item").length +
          100
      );
    }

    return {
      init: init,
      loadAllPosts: loadAllPosts,
      loadNextPosts: loadNextPosts,
      maybeLoadNextPosts: maybeLoadNextPosts,
      calcIeFilmstrip: calcIEFilmstrip
    };
  })();
  var frontpageSlider = (function() {
    var $slider,
      $content,
      $prevTrigger,
      $nextTrigger,
      $triggers,
      sliderWidth,
      sliderHeight,
      totalWidth,
      $slides,
      slidesNumber,
      $current,
      $prev,
      $next,
      nextWidth;

    function init() {
      $slider = $(".projects-slider");

      if (
        typeof $slider.data("loaded") !== "undefined" &&
        $slider.data("loaded") === true
      ) {
        return;
      }

      $content = $(".project-slide__content");
      $prevTrigger = $(".vertical-title.prev");
      $nextTrigger = $(".vertical-title.next");
      $triggers = $nextTrigger.add($prevTrigger);
      sliderWidth = $slider.width();
      sliderHeight = $slider.height();
      totalWidth = 0;
      $slides = $slider.children();
      slidesNumber = $slides.length;
      $current = $slides.eq(0);
      nextWidth = $nextTrigger.width() - 100;

      var minSlides = 5,
        offset;

      // assure minimum number of slides
      if (slidesNumber < 2) {
        $slider.css({
          opacity: 1,
          margin: 0
        });
        animateContentIn();
        return;
      }

      if (slidesNumber < 3) {
        $slider.css({
          marginLeft: 0
        });
        sliderWidth = $slider.width();
        $prevTrigger.hide();
      }

      if (slidesNumber < minSlides) {
        $slides.clone().appendTo($slider);
        $slides = $slider.children();
      }

      $slides.not($current).width(nextWidth);

      $slider.imagesLoaded(function() {
        $slides.each(function(i, obj) {
          var $slide = $(obj);

          if (i != 0) {
            totalWidth += nextWidth;
            $slide.css("left", sliderWidth + (i - 1) * nextWidth);
          } else {
            totalWidth += sliderWidth;
          }

          scaleImage($slide.find("img"));
        });

        TweenMax.to($slider, 0.3, { opacity: 1 });

        // balance slides to left and right
        offset = parseInt(($slides.length - 1) / 2, 10);
        $slides
          .slice(-offset)
          .prependTo($slider)
          .each(function(i, obj) {
            $(obj).css("left", "-=" + totalWidth);
          });

        $slides = $slider.children();

        $prev = $current.prev();
        $next = $current.next();

        createBullets();
        setZindex();

        unbindEvents();
        bindEvents();

        animateContentIn();
      });

      $slider.data("loaded", true);
    }

    function onResize() {
      var newWidth = $slider.width(),
        $nextSlides = $current.nextAll(),
        difference = newWidth - sliderWidth;

      sliderHeight = $slider.height();
      totalWidth = totalWidth + difference;
      sliderWidth = newWidth;

      $current.width(sliderWidth);

      $nextSlides.each(function(i, obj) {
        $(obj).css("left", "+=" + difference);
      });

      $slides.each(function(i, obj) {
        scaleImage($(obj).find("img"));
      });
    }

    function scaleImage($img) {
      var imageWidth = $img.attr("width"),
        imageHeight = $img.attr("height"),
        scaleX = sliderWidth / imageWidth,
        scaleY = sliderHeight / imageHeight,
        scale = Math.max(scaleX, scaleY);

      $img.width(scale * imageWidth);
      $img.height(scale * imageHeight);
    }

    function createBullets() {
      var $container = $(".projects-slider__bullets");

      for (var i = 0; i < slidesNumber; i++) {
        $container.append('<div class="rsBullet"><span></span></div>');
      }

      $container
        .children()
        .first()
        .addClass("rsNavSelected");
    }

    function slider_keys_controls_callback(e) {
      switch (e.which) {
        case 37:
          if (
            $(".slider--show_next").length > 0 ||
            $current.prev("div").length <= 0
          )
            return;
          onPrevEnter();
          onPrevClick();
          onPrevLeave();
          e.preventDefault();
          break; // left

        case 39:
          if ($current.next("div").length <= 0) return;
          onNextEnter();
          onNextClick();
          onNextLeave();
          e.preventDefault();
          break; // right

        default:
          return;
      }
    }

    function unbindEvents() {
      $nextTrigger.off("click", onNextClick);
      $prevTrigger.off("click", onPrevClick);

      if (Modernizr.touchevents) {
        $slider
          .add(".vertical-title")
          .hammer()
          .unbind("swipeleft");
        $slider
          .add(".vertical-title")
          .hammer()
          .unbind("swiperight");
      }

      $(document).off("keydown", slider_keys_controls_callback);
    }

    function bindEvents() {
      if (nextWidth > 70 && !$("html").is(".is--ie9, .is--ie-le10")) {
        $nextTrigger.off("mouseenter").on("mouseenter", onNextEnter);
        $nextTrigger.off("mouseleave").on("mouseleave", onNextLeave);
      }
      $nextTrigger.on("click", onNextClick);

      if (nextWidth > 70 && !$("html").is(".is--ie9, .is--ie-le10")) {
        $prevTrigger.off("mouseenter").on("mouseenter", onPrevEnter);
        $prevTrigger.off("mouseleave").on("mouseleave", onPrevLeave);
      }
      $prevTrigger.on("click", onPrevClick);

      if (Modernizr.touchevents) {
        $slider
          .add(".vertical-title")
          .hammer()
          .bind("swipeleft", onSwipeLeft);
        $slider
          .add(".vertical-title")
          .hammer()
          .bind("swiperight", onSwipeRight);
      }

      $(document).on("keydown", slider_keys_controls_callback);
    }

    function onSwipeLeft() {
      onNextClick();
      onNextLeave();
    }

    function onSwipeRight() {
      onPrevClick();
      onPrevLeave();
    }

    function onNextEnter() {
      TweenMax.to($next.find(".project-slide__image"), 0.4, {
        opacity: 1,
        ease: Quint.easeOut
      });
      TweenMax.to(
        $next.add(".project-slide__content"),
        0.4,
        { x: -60, ease: Back.easeOut },
        "-=.4"
      );
      TweenMax.to($next, 0.4, { width: 160, ease: Back.easeOut }, "-=.4");
      TweenMax.to($nextTrigger, 0.4, { x: -30, ease: Back.easeOut }, "-=.4");
    }

    function onPrevEnter() {
      TweenMax.to($prev.find(".project-slide__image"), 0.4, {
        opacity: 1,
        ease: Quint.easeOut
      });
      TweenMax.to($(".project-slide__content"), 0.4, {
        x: 60,
        ease: Back.easeOut
      });
      TweenMax.to($prev, 0.4, { width: 160, ease: Back.easeOut });
      TweenMax.to($prevTrigger, 0.4, { x: 30, ease: Back.easeOut });
    }

    function onNextLeave() {
      TweenMax.to($next.find(".project-slide__image"), 0.4, {
        opacity: 0.6,
        ease: Quint.easeOut
      });
      TweenMax.to($next.add(".project-slide__content"), 0.4, {
        x: 0,
        ease: Quint.easeOut
      });
      TweenMax.to($next, 0.4, { width: nextWidth, ease: Quint.easeOut });
      TweenMax.to($(".vertical-title.next"), 0.4, {
        x: 0,
        ease: Quint.easeOut
      });
    }

    function onPrevLeave() {
      TweenMax.to($prev.find(".project-slide__image"), 0.4, {
        opacity: 0.6,
        ease: Quint.easeOut
      });
      TweenMax.to($prev.add($(".project-slide__content")), 0.4, {
        x: 0,
        ease: Quint.easeOut
      });
      TweenMax.to($prev, 0.4, { width: nextWidth, ease: Quint.easeOut });
      TweenMax.to($(".vertical-title.prev"), 0.4, {
        x: 0,
        ease: Quint.easeOut
      });
    }

    function onNextClick() {
      var timeline = getNextTimeline();

      $prev = $current;
      $current = $next;
      $next = $next.next();

      unbindEvents();
      animateContentTo($current);

      timeline.play();

      updateBullets(1);
    }

    function onNextComplete() {
      $slides
        .first()
        .appendTo($slider)
        .css("left", "+=" + totalWidth);
      $slides = $slider.children();
      setZindex();
      bindEvents();
    }

    function getNextTimeline() {
      var timeline = new TimelineMax({
        paused: true,
        onComplete: onNextComplete
      });
      timeline.to($next.next().find(".project-slide__image"), 0, {
        opacity: 1,
        ease: Power1.easeOut
      });
      timeline.to($slider, 0.7, { x: "-=" + nextWidth, ease: Quint.easeOut });
      timeline.to(
        $current,
        0.7,
        { width: nextWidth, ease: Quint.easeOut },
        "-=.7"
      );
      timeline.to(
        $next,
        0.7,
        {
          width: sliderWidth,
          left: "-=" + (sliderWidth - nextWidth),
          x: 0,
          ease: Quint.easeOut
        },
        "-=.7"
      );
      if (nextWidth > 70 && !$("html").is(".is--ie9, .is--ie-le10")) {
        timeline.to(
          $next.next(),
          0.4,
          { width: 160, x: -60, ease: Quint.easeOut },
          "-=.7"
        );
      } else {
        timeline.to(
          $next.find(".project-slide__image"),
          0.4,
          { opacity: 1, ease: Power1.easeOut },
          "-=.4"
        );
        timeline.to(
          $next.next().find(".project-slide__image"),
          0.4,
          { opacity: 0.6, ease: Power1.easeOut },
          "-=.4"
        );
      }
      timeline.to(
        $current.find(".project-slide__image"),
        0.4,
        { opacity: 0.6, ease: Power1.easeOut },
        "-=.4"
      );
      return timeline;
    }

    function onPrevClick() {
      var timeline = getPrevTimeline();

      $next = $current;
      $current = $prev;
      $prev = $prev.prev();

      unbindEvents();
      animateContentTo($current);

      timeline.play();

      updateBullets(-1);
    }

    function onPrevComplete() {
      $slides
        .last()
        .prependTo($slider)
        .css("left", "-=" + totalWidth);
      $slides = $slider.children();
      setZindex();
      bindEvents();
    }

    function getPrevTimeline() {
      var timeline = new TimelineMax({
        paused: true,
        onComplete: onPrevComplete
      });
      timeline.to($prev.prev().find(".project-slide__image"), 0, {
        opacity: 1,
        ease: Quint.easeOut
      });
      timeline.to($slider, 0.7, { x: "+=" + nextWidth, ease: Quint.easeOut });
      timeline.to(
        $current,
        0.7,
        {
          width: nextWidth,
          left: "+=" + (sliderWidth - nextWidth),
          ease: Quint.easeOut
        },
        "-=.7"
      );
      timeline.to(
        $prev,
        0.7,
        { width: sliderWidth, x: 0, ease: Quint.easeOut },
        "-=.7"
      );
      if (!$("html").is(".is--ie9, .is--ie-le10")) {
        timeline.to(
          $prev.prev(),
          0.4,
          { width: 160, ease: Quint.easeOut },
          "-=.7"
        );
      }
      timeline.to(
        $current.find(".project-slide__image"),
        0.4,
        { opacity: 0.6, ease: Quint.easeOut },
        "-=.4"
      );
      return timeline;
    }

    function updateBullets(offset) {
      var $selectedBullet = $(".rsNavSelected"),
        count = $selectedBullet.index();

      $selectedBullet.removeClass("rsNavSelected");

      if (count + offset == slidesNumber) {
        $(".rsBullet")
          .eq(0)
          .addClass("rsNavSelected");
      } else if (count + offset == -1) {
        $(".rsBullet")
          .eq(slidesNumber - 1)
          .addClass("rsNavSelected");
      } else {
        $(".rsBullet")
          .eq(count + offset)
          .addClass("rsNavSelected");
      }
    }

    function animateContentIn() {
      $content.find(".portfolio_types").html($current.data("types"));
      $content
        .find("a")
        .attr("href", $current.data("link"))
        .attr("title", $current.data("link-title"));

      $current.find(".project-slide__image").css("opacity", 1);
      TweenMax.fromTo(
        $content.find(".project-slide__title h1"),
        0.7,
        { y: "-100%" },
        { y: "0%", delay: 0.5, ease: Expo.easeInOut }
      );
      TweenMax.fromTo(
        $content.find(".js-title-mask"),
        0.7,
        { y: "100%" },
        { y: "0%", delay: 0.5, ease: Expo.easeInOut }
      );
      TweenMax.fromTo(
        $content.find(".portfolio_types"),
        0.3,
        { opacity: 0 },
        { opacity: 1, delay: 0.9, ease: Quint.easeIn }
      );
      TweenMax.fromTo(
        $content.find(".project-slide__text"),
        0.4,
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, delay: 1, ease: Quint.easeOut }
      );
      // TweenMax.to($('.site-content__mask'), .6, {scaleX: 0, ease: Expo.easeInOut});
    }

    function animateContentTo($slide) {
      var $title = $content.find(".project-slide__title h1"),
        $clone = $content.clone(),
        $cloneTitle = $clone.find(".project-slide__title h1"),
        $cloneTypes = $clone.find(".portfolio_types"),
        slideTitle = $slide.data("title"),
        slideTypes = $slide.data("types"),
        slideLink = $slide.data("link"),
        slideLinkTitle = $slide.data("link-title"),
        $nextTitle = $(".vertical-title.next span"),
        $nextClone = $nextTitle.clone(),
        nextTitle = $slide.next().data("title"),
        $prevTitle = $(".vertical-title.prev span"),
        $prevClone = $prevTitle.clone(),
        prevTitle = $slide.prev().data("title"),
        timeline = new TimelineMax({
          paused: true,
          onComplete: function() {
            $prevTitle.remove();
            $nextTitle.remove();
            $content.remove();
            $content = $clone;
          }
        });

      $prevClone.text(prevTitle);
      $nextClone.text(nextTitle);
      $cloneTitle.text(slideTitle);
      $cloneTypes.html(slideTypes);

      $clone.find("a").attr({
        href: slideLink,
        title: slideLinkTitle
      });

      // les types
      var $fadeOut = $content
          .find(".portfolio_types")
          .add($nextTitle)
          .add($prevTitle),
        $fadeIn = $cloneTypes.add($nextClone).add($prevClone);

      timeline.fromTo(
        $fadeOut,
        0.3,
        { opacity: 1 },
        { opacity: 0, ease: Quint.easeIn }
      );
      timeline.fromTo(
        $fadeIn,
        0.3,
        { opacity: 0 },
        { opacity: 1, ease: Quint.easeIn },
        "-=0.2"
      );

      // le title
      timeline.fromTo(
        $title,
        0.3,
        { opacity: 1 },
        { opacity: 0, ease: Quint.easeOut },
        "-=0.3"
      );
      timeline.fromTo(
        $cloneTitle,
        0.5,
        { y: "-100%" },
        { y: "0%", ease: Expo.easeOut },
        "-=0.2"
      );
      timeline.fromTo(
        $clone.find(".js-title-mask"),
        0.5,
        { y: "100%" },
        { y: "0%", ease: Expo.easeOut },
        "-=0.5"
      );

      $content.find(".project-slide__text").css("opacity", 0);

      $nextClone.insertAfter($nextTitle);
      $prevClone.insertAfter($prevTitle);
      $clone.insertAfter($content);

      timeline.play();
    }

    function setZindex() {
      $current.css("z-index", "");
      $prev
        .css("z-index", 10)
        .prev()
        .css("z-index", 20);
      $next
        .css("z-index", 10)
        .next()
        .css("z-index", 20);
    }

    return {
      init: init,
      onResize: onResize
    };
  })();

  /*
 The MIT License (MIT)

 Copyright (c) 2014 Hammer.js

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 Status API Training Shop Blog About

URL: https://github.com/hammerjs/jquery.hammer.js
 */
  (function(factory) {
    if (typeof define === "function" && define.amd) {
      define(["jquery", "hammerjs"], factory);
    } else if (typeof exports === "object") {
      factory(require("jquery"), require("hammerjs"));
    } else {
      factory(jQuery, Hammer);
    }
  })(function($, Hammer) {
    function hammerify(el, options) {
      var $el = $(el);
      if (!$el.data("hammer")) {
        $el.data("hammer", new Hammer($el[0], options));
      }
    }

    $.fn.hammer = function(options) {
      return this.each(function() {
        hammerify(this, options);
      });
    };

    // extend the emit method to also trigger jQuery events
    Hammer.Manager.prototype.emit = (function(originalEmit) {
      return function(type, data) {
        originalEmit.call(this, type, data);
        $(this.element).trigger({
          type: type,
          gesture: data
        });
      };
    })(Hammer.Manager.prototype.emit);
  });
  var Nav = (function() {
    var isOpen,
      $mobileHeader = $(".mobile-header");

    function init() {
      isOpen = false;
      onResize();
      bindEvents();
    }

    function bindEvents() {
      $(".js-nav-toggle")
        .off("click", toggle)
        .on("click", toggle);
    }

    function toggle(e) {
      e.preventDefault();
      if (isOpen) {
        close();
      } else {
        open();
      }
    }

    function onResize() {
      $(".js-nav-toggle").css({
        marginTop: $mobileHeader.outerHeight() / 2
      });
    }

    function open() {
      $body.addClass("navigation--is-visible");
      isOpen = true;
    }

    function close() {
      $body.removeClass("navigation--is-visible");
      isOpen = false;
    }

    return {
      init: init,
      onResize: onResize,
      open: open,
      close: close
    };
  })();

  var Placeholder = (function() {
    var $items;

    function update($container, src) {
      var $container = $container || $("body");

      $items = $container.find(".js-placeholder");

      $items.each(function(i, item) {
        var $item = $(item);
      });

      $items.each(function(i, item) {
        var $item = $(item).data("loaded", false),
          width = $item.data("width"),
          height = $item.data("height"),
          newHeight = $item.height(),
          newWidth = Math.round((newHeight * width) / height),
          $image = $(document.createElement("img")).css("opacity", 0);

        $item.data("newHeight", newHeight);
        $item.data("newWidth", newWidth);
        $item.data("image", $image);
      });

      $items.each(function(i, item) {
        var $item = $(item);
        $item.width($item.data("newWidth"));
      });

      $(window).on("DOMContentLoaded load resize scroll", bindImageLoad);
      $(".portfolio--grid, .site-content").on("scroll", bindImageLoad);

      bindImageLoad();
    }

    function bindImageLoad() {
      $items.each(function(i, item) {
        var $item = $(item),
          $image = $item.data("image"),
          src = $item.data("src");

        if (typeof src == "undefined") {
          src = $item.data("srcsmall");
        }

        if ($item.data("loaded")) return;

        if (isElementInViewport($item)) {
          $item.data("loaded", true);
          $image.attr("src", src);
          $image.prependTo($item);
          $image.imagesLoaded(function() {
            TweenMax.to($image, 0.3, { opacity: 1 });
            $item.addClass("js-loaded");
          });
        }
      });
    }

    function onResize() {
      $items.each(function(i, item) {
        var $item = $(item),
          width = $item.data("width"),
          height = $item.data("height"),
          newHeight = $item.height(),
          newWidth = Math.round((newHeight * width) / height);

        $item.data("newWidth", newWidth);
      });

      $items.each(function(i, item) {
        var $item = $(item);
        $item.width($item.data("newWidth"));
      });
    }

    return {
      update: update,
      resize: onResize
    };
  })();

  // Platform Detection
  function getIOSVersion(ua) {
    ua = ua || navigator.userAgent;
    return (
      parseFloat(
        (
          "" +
          (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(
            ua
          ) || [0, ""])[1]
        )
          .replace("undefined", "3_2")
          .replace("_", ".")
          .replace("_", "")
      ) || false
    );
  }

  function getAndroidVersion(ua) {
    var matches;
    ua = ua || navigator.userAgent;
    matches = ua.match(/[A|a]ndroid\s([0-9\.]*)/);
    return matches ? matches[1] : false;
  }

  /**
   * detect IE
   * returns version of IE or false, if browser is not Internet Explorer
   */
  function detectIE() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf("MSIE ");
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
    }

    var trident = ua.indexOf("Trident/");
    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf("rv:");
      return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
    }

    var edge = ua.indexOf("Edge/");
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
    }

    // other browser
    return false;
  }

  function platformDetect() {
    var navUA = navigator.userAgent.toLowerCase(),
      navPlat = navigator.platform.toLowerCase();

    isiPhone = navPlat.indexOf("iphone");
    isiPod = navPlat.indexOf("ipod");
    isAndroidPhone = navPlat.indexOf("android");
    isSafari = navUA.indexOf("safari") != -1 && navUA.indexOf("chrome") == -1;
    isIE =
      typeof is_ie !== "undefined" ||
      (!window.ActiveXObject && "ActiveXObject" in window);
    (isiele10 = ua.match(/msie (9|([1-9][0-9]))/i)),
      (ieMobile = ua.match(/Windows Phone/i) ? true : false);
    iOS = getIOSVersion();
    android = getAndroidVersion();
    isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    isWindows = navigator.platform.toUpperCase().indexOf("WIN") !== -1;
    isiPad = navigator.userAgent.match(/iPad/i) != null;

    if (iOS && iOS < 8) {
      $html.addClass("no-scroll-fx");
    }

    if (detectIE()) {
      $html.addClass("is--ie");
    }

    if (isiele10) {
      $html.addClass("is--ie-le10");
    }

    if (ieMobile) {
      $html.addClass("is--ie-mobile");
    }

    if (isiPad) {
      $html.addClass("is--ipad");
    }

    var browser = {
      isIe: function() {
        return navigator.appVersion.indexOf("MSIE") != -1;
      },
      navigator: navigator.appVersion,
      getVersion: function() {
        var version = 999; // we assume a sane browser
        if (navigator.appVersion.indexOf("MSIE") != -1) {
          // bah, IE again, lets downgrade version number
          version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        }
        return version;
      }
    };

    if (browser.isIe() && browser.getVersion() == 9) {
      $("html").addClass("is--ie9");
    }
  }
  var Portfolio = (function() {
    var $portfolio_container,
      isLoadingProjects = false,
      filterBy,
      isFirstFilterClick,
      init = function() {
        $portfolio_container = $(".portfolio-wrapper");
        filterBy = "*";
        isFirstFilterClick = true;
        isLoadingProjects = false;

        if (!$portfolio_container.length) {
          return;
        }

        $(".navigation").hide();

        var layoutMode = "flex";

        if (isSafari) {
          layoutMode = "-webkit-flex";
        }
        if ($("html").hasClass("is--ie")) {
          layoutMode = "block";
        }

        // mixitup init without filtering
        $portfolio_container.mixItUp({
          animation: {
            effects: "fade"
          },
          selectors: {
            filter: ".no-real-selector-for-filtering",
            target: ".portfolio--project"
          },
          layout: {
            display: layoutMode
          },
          callbacks: {
            onMixEnd: function(state) {
              if (isiele10) {
                calcIEFilmstrip();
              }
            }
          }
        });

        bindEvents();

        //if there are not sufficient projects to have scroll - load the next page also (prepending)
        if (
          $portfolio_container
            .children("article")
            .last()
            .offset().top < window.innerHeight
        ) {
          loadNextProjects();
        }
      },
      bindEvents = function() {
        $(".site-content.portfolio-archive").on("scroll", function() {
          requestTick();
        });

        //we will handle the binding of filter links because we need to load all posts on first filter click
        $(".js-projects-filter").on("click", ".filter__item", function() {
          filterBy = $(this).data("filter");

          // first make the current filter link active
          $(".filter__item").removeClass("active");
          $(this).addClass("active");

          if (isFirstFilterClick == true) {
            //this is the first time the user has clicked a filter link
            //we need to first load all posts before proceeding
            loadAllProjects();
          } else {
            //just regular filtering from the second click onwards
            $portfolio_container.mixItUp("filter", filterBy);
          }

          return false;
        });

        $(".js-filter-mobile-portfolio").change(function() {
          filterBy = $(this)
            .children(":selected")
            .data("filter");

          // first make the current filter link active
          $(".filter__item").removeClass("active");
          $(this).addClass("active");

          if (isFirstFilterClick == true) {
            //this is the first time the user has clicked a filter link
            //we need to first load all posts before proceeding
            loadAllProjects();
          } else {
            //just regular filtering from the second click onwards
            $portfolio_container.mixItUp("filter", filterBy);
          }

          return false;
        });
      },
      loadAllProjects = function() {
        var offset = $portfolio_container.find(".portfolio--project").length;

        if (globalDebug) {
          console.log("Loading All Projects - AJAX Offset = " + offset);
        }

        isLoadingProjects = true;

        var args = {
          action: "timber_load_next_projects",
          nonce: timber_ajax.nonce,
          offset: offset,
          posts_number: "all"
        };

        if (!empty($portfolio_container.data("taxonomy"))) {
          args["taxonomy"] = $portfolio_container.data("taxonomy");
          args["term_id"] = $portfolio_container.data("termid");
        }

        $.post(timber_ajax.ajax_url, args, function(response_data) {
          if (response_data.success) {
            if (globalDebug) {
              console.log("Loaded all projects");
            }

            var $result = $(response_data.data.posts).filter("article");

            if (globalDebug) {
              console.log("Adding new " + $result.length + " items to the DOM");
            }

            $(".navigation")
              .hide()
              .remove();

            $result.imagesLoaded(function() {
              $portfolio_container.mixItUp("append", $result, {
                filter: filterBy
              });

              // next time the user filters we will know
              isFirstFilterClick = false;
              isLoadingProjects = false;

              Placeholder.update($result);
            });
          } else {
            //something didn't quite make it - maybe there are no more posts (be optimistic about it)
            //so we will assume that all posts are already loaded and proceed as usual
            if (globalDebug) {
              console.log(
                "MixItUp Filtering - There were no more posts to load - so filter please"
              );
            }

            isFirstFilterClick = false;
            isLoadingProjects = false;

            $portfolio_container.mixItUp("filter", filterBy);
          }
        });
      },
      loadNextProjects = function() {
        var offset = $portfolio_container.find(".portfolio--project").length;

        if (globalDebug) {
          console.log("Loading More Projects - AJAX Offset = " + offset);
        }

        isLoadingProjects = true;
        $(".preloader").css("opacity", 1);

        var args = {
          action: "timber_load_next_projects",
          nonce: timber_ajax.nonce,
          offset: offset
        };

        if (!empty($portfolio_container.data("taxonomy"))) {
          args["taxonomy"] = $portfolio_container.data("taxonomy");
          args["term_id"] = $portfolio_container.data("termid");
        }

        $.post(timber_ajax.ajax_url, args, function(response_data) {
          if (response_data.success) {
            if (globalDebug) {
              console.log("Loaded next projects");
            }

            var $result = $(response_data.data.posts).filter("article");

            if (globalDebug) {
              console.log("Adding new " + $result.length + " items to the DOM");
            }

            $result.imagesLoaded(function() {
              //$portfolio_container.append( $result );
              $portfolio_container.mixItUp("append", $result, {
                filter: filterBy
              });
              isLoadingProjects = false;

              Placeholder.update($result);
            });
          } else {
            //we have failed
            //it's time to call it a day
            if (globalDebug) {
              console.log("It seems that there are no more projects to load");
            }

            $(".navigation").fadeOut();

            $portfolio_container.mixItUp("filter", filterBy);

            //don't make isLoadingProjects true so we won't load any more projects
          }

          $(".preloader").css("opacity", 0);
        });
      },
      maybeloadNextProjects = function() {
        if (!$portfolio_container.length || isLoadingProjects) {
          return;
        }

        var $lastChild = $portfolio_container.children("article").last();

        //if the last child is in view then load more projects
        if ($lastChild.is(":appeared")) {
          loadNextProjects();
        }
      };

    return {
      init: init,
      loadAllProjects: loadAllProjects,
      loadNextProjects: loadNextProjects,
      maybeloadNextProjects: maybeloadNextProjects
    };
  })();
  var Project = (function() {
    var $film,
      $grid,
      $fullview,
      start,
      end,
      current,
      initialized = false,
      fullviewWidth = 0,
      fullviewHeight = 0,
      initialAlpha = 0,
      initialBeta = 0,
      initialGamma = 0,
      imageScaling = "fill";

    fullviewWidth = windowWidth;
    fullviewHeight = windowHeight;

    function init() {
      if (!$(".single-jetpack-portfolio").length) {
        return;
      }

      if (initialized) {
        return;
      }

      if (
        $(".image-scaling--fit").length ||
        (Modernizr.touchevents &&
          typeof window.disable_mobile_panning !== "undefined" &&
          window.disable_mobile_panning == true)
      ) {
        imageScaling = "fit";
      }

      if ($(".project_layout-filmstrip").length) {
        $film = $(".js-portfolio");
        $grid = $film
          .clone(true, true)
          .addClass("portfolio--grid")
          .insertBefore($film);
        $film.addClass("portfolio--filmstrip").addClass("portfolio--visible");
      } else {
        // this is some project type that we don't handle here - like fullscreen
        return;
      }

      $grid.find(".js-portfolio-item").each(function(i, obj) {
        var $item = $(obj);
        $item.data("src", $item.data("srcsmall"));
      });

      $film.find(".js-portfolio-item").each(function(i, obj) {
        var $item = $(obj);
        $item.data("src", $item.data("srcfull"));
      });

      $fullview = $(".fullview");

      addMetadata();
      bindEvents();

      initialized = true;
    }

    function onResize() {
      if ($(".single-jetpack-portfolio").length) {
        resizeFullView();
        resizeFilmstrip();
        getMiddlePoints();
        getReferenceBounds();
      }
    }

    function resizeFilmstrip() {
      $(".portfolio__item").each(function(i, item) {
        var $item = $(item),
          width = $item.data("width"),
          height = $item.data("height"),
          newHeight = $item.height(),
          newWidth = (newHeight * $item.data("width")) / $item.data("height");

        $item.width(newWidth);
      });
    }

    function resizeFullView() {
      $document.off("mousemove", panFullview);
      $(window).off("deviceorientation", panFullview);

      if (Modernizr.touchevents) {
        initialAlpha = latestDeviceAlpha;
        initialBeta = latestDeviceBeta;
        initialGamma = latestDeviceGamma;

        TweenMax.to($(".fullview__image img"), 0, {
          x: 0,
          y: 0
        });
      }

      if (typeof $fullview === "undefined") {
        return;
      }

      var $target = $(".fullview__image"),
        targetWidth = $target.width(),
        targetHeight = $target.height(),
        newWidth = $fullview.width(),
        newHeight = $fullview.height(),
        scaleX = newWidth / targetWidth,
        scaleY = newHeight / targetHeight,
        scale =
          imageScaling === "fill"
            ? Math.max(scaleX, scaleY)
            : Math.min(scaleX, scaleY);

      fullviewWidth = targetWidth * scale;
      fullviewHeight = targetHeight * scale;

      $target.find("img").removeAttr("style");
      $target.css({
        width: fullviewWidth,
        height: fullviewHeight,
        top: (fullviewHeight - newHeight) / -2,
        left: (fullviewWidth - newWidth) / -2
      });

      $document.on("mousemove", panFullview);
      $(window).on("deviceorientation", panFullview);
    }

    function addMetadata() {
      var $target = $(".single-proof_gallery").length
        ? $film.add($grid)
        : $film;

      $target.find(".js-portfolio-item").each(function(i, obj) {
        var $item = $(obj),
          captionText = $item.data("caption"),
          $caption = $('<div class="photometa__caption"></div>').html(
            captionText
          ),
          descriptionText = $item.data("description"),
          $description = $('<div class="photometa__description"></div>').html(
            "<div>" + descriptionText + "</div>"
          ),
          $exif = $('<ul class="photometa__exif  exif"></ul>'),
          $meta = $('<div class="portfolio__meta  photometa"></div>'),
          exifText = $item.data("exif"),
          $full = $('<button class="button-full js-button-full"></button>');

        if (empty(captionText)) {
          $meta.css("opacity", 0);
          $meta.addClass("no-caption");

          if (empty(descriptionText) && empty(exifText)) {
            $meta.hide();
          }
        }

        if (!empty(exifText)) {
          $.each(exifText, function(key, value) {
            $(
              '<li class="exif__item"><i class="exif__icon exif__icon--' +
                key +
                '"></i>' +
                value +
                "</li>"
            ).appendTo($exif);
          });
        }

        $full.prependTo($item);
        $caption.appendTo($meta);
        $exif.appendTo($meta);
        $description.appendTo($meta);

        $meta.appendTo($item);
      });
    }

    function prepare() {
      if (
        (!$(".project_layout-filmstrip").length &&
          !$(".project_layout-thumbnails").length) ||
        $(".password-required").length
      ) {
        // we are not in a single project so bail
        return;
      }

      filmWidth = $film.width();
      contentWidth = $(".site-content").width();
      sidebarWidth = $(".site-sidebar").width();

      getMiddlePoints();
      getReferenceBounds();

      $grid.show();

      var $first = $film
        .find(".js-portfolio-item")
        .first()
        .addClass("portfolio__item--active");

      setCurrent($first);

      if (!$(".project_layout-filmstrip").length) {
        showThumbnails(null, true);
      }
    }

    function bindEvents() {
      $(window).on("project:resize", onResize);

      // if ( Modernizr.touchevents ) {
      // 	$('.portfolio--grid').on('click', '.js-portfolio-item', showFullView);
      // } else {
      $(".portfolio--grid").on("click", ".js-portfolio-item", showFilmstrip);
      $(".portfolio--filmstrip").on(
        "click",
        ".js-portfolio-item",
        showFullView
      );
      // }

      $(".fullview__close").on("click", hideFullView);
      $(".fullview .rsArrowRight").on("click", showNext);
      $(".fullview .rsArrowLeft").on("click", showPrev);
      $(".fullview").on("click", hideFullView);
      $(".js-details").on("click", toggleDetails);

      $(".js-thumbs").on("click", function(e) {
        e.preventDefault();
        showThumbnails();
      });

      $(document).keydown(function(e) {
        if (!$(".portfolio--filmstrip.portfolio--visible").length) {
          return;
        }

        var $items = $film.find(".js-portfolio-item"),
          current,
          $current,
          next,
          $next;

        $items.each(function(i, obj) {
          if ($(obj).hasClass("portfolio__item--active")) {
            current = i;
          }
        });

        if (typeof current === "undefined") {
          return;
        }

        // a close is a close and nothing else
        switch (e.which) {
          case 27:
            if ($(".fullview--visible").length) {
              hideFullView();
              e.preventDefault();
              return;
            }
            if ($(".portfolio--filmstrip.portfolio--visible").length) {
              showThumbnails();
              e.preventDefault();
              return;
            }
          case 13:
            if (
              $(".portfolio--filmstrip.portfolio--visible").length &&
              !$(".fullview--visible").length
            ) {
              showFullView.call($(".portfolio__item--active"));
              e.preventDefault();
              return;
            }
        }

        // in the fullview mode the next/prev keys should change the entire image
        if ($(".fullview--visible").length > 0) {
          switch (e.which) {
            case 37:
              showPrev();
              e.preventDefault();
              break; // left
            case 39:
              showNext();
              e.preventDefault();
              break; // right
          }
          return;
        } else {
          // but in the filmstrip mode the next/prev keys should move only the current position of the scroll
          switch (e.which) {
            case 37:
              if (current === 0) {
                return;
              }
              next = current - 1;
              e.preventDefault();
              break;
            case 39:
              if (current === $items.length - 1) {
                return;
              }
              next = current + 1;
              e.preventDefault();
              break;
            default:
              return;
          }
        }

        $next = $items.eq(next);

        var offset = parseInt($(".bar--fixed").css("left"), 10),
          newScrollX =
            $next.data("middle") - $(".site-content").width() / 2 + offset;

        TweenLite.to(window, 0.6, {
          scrollTo: {
            x: newScrollX
          },
          ease: Power1.easeInOut
        });
      });
    }

    function unbindEvents() {
      $(window).off("project:resize", onResize);
      $(".portfolio--grid").off("click", ".js-portfolio-item", showFilmstrip);
      $(".portfolio--filmstrip").off(
        "click",
        ".js-portfolio-item",
        showFullView
      );
      $(".fullview__close").off("click", hideFullView);
      $(".fullview .rsArrowRight").off("click", showNext);
      $(".fullview .rsArrowLeft").off("click", showPrev);
      $(".fullview").off("click", hideFullView);
      $(".js-details").off("click", toggleDetails);
    }

    function toggleDetails() {
      $body.toggleClass("portfolio--details");
    }

    function destroy() {
      unbindEvents();
      initialized = false;
    }

    function showPrev(e) {
      var $items = $film.find(".js-portfolio-item"),
        items = $items.length;

      if (typeof e !== "undefined") {
        e.stopPropagation();
        e.preventDefault();
      }

      $items.each(function(i, obj) {
        if ($(obj).hasClass("portfolio__item--active")) {
          if (i === 0) {
            fullViewTransition($items.eq(items - 1));
          } else {
            fullViewTransition($items.eq(i - 1));
          }
          return false;
        }
      });
      panFullview();
    }

    function showNext(e) {
      var $items = $film.find(".js-portfolio-item"),
        items = $items.length;

      if (typeof e !== "undefined") {
        e.stopPropagation();
        e.preventDefault();
      }

      $items.each(function(i, obj) {
        if ($(obj).hasClass("portfolio__item--active")) {
          if (i === items - 1) {
            fullViewTransition($items.eq(0));
          } else {
            fullViewTransition($items.eq(i + 1));
          }
          return false;
        }
      });
      panFullview();
    }

    function fullViewTransition($source) {
      var $target = addImageToFullView($source),
        $toRemove = $(".fullview__image").not($target);

      setCurrent($source);
      panFullview();

      if (imageScaling == "fit") {
        TweenMax.fromTo($toRemove, 0.3, { opacity: 1 }, { opacity: 0 });
      }

      TweenMax.fromTo(
        $target,
        0.3,
        { opacity: 0 },
        {
          opacity: 1,
          onComplete: function() {
            $toRemove.remove();
            centerFilmToTarget($source);
          }
        }
      );
    }

    // loop through each portfolio item and find the one closest to center
    function getCurrent() {
      if (
        typeof $film === "undefined" ||
        !$(".single-jetpack-portfolio").length ||
        $(".fullview--visible").length
      ) {
        return;
      }

      if (!initialized) {
        return;
      }

      var current = $(".portfolio__item--active").data("middle"),
        reference =
          latestKnownScrollX +
          start +
          ((end - start) * latestKnownScrollX) / (filmWidth - contentWidth),
        min = Math.abs(reference - current),
        $next;

      $(".js-reference")
        .css("left", reference)
        .text(parseInt(reference, 10));

      $film.find(".js-portfolio-item").each(function(i, obj) {
        var compare = $(obj).data("middle");

        if (Math.abs(compare - reference) < min) {
          min = Math.abs(compare - reference);
          $next = $(obj);
        }
      });

      if (typeof $next !== "undefined") {
        setCurrent($next);
      }
    }

    function getReferenceBounds() {
      if (typeof $film === "undefined") {
        return;
      }

      var $items = $film.find(".js-portfolio-item"),
        items = $items.length,
        max;

      if (items < 2) {
        return;
      }

      var threshold = 10;
      start = $items.first().offset().left + $items.first().width();
      start = Math.min(start, windowWidth / 2) - threshold;
      end = windowWidth - $items.last().width();
      end = Math.max(end, windowWidth / 2) + threshold;
    }

    function getMiddlePoints() {
      $(".portfolio").each(function(i, portfolio) {
        $(portfolio)
          .find(".js-portfolio-item")
          .each(function(i, obj) {
            var $obj = $(obj);
            $obj.data("middle", getMiddle($obj));
            $obj.data("count", i);
          });
      });
    }

    function showThumbnails(e, initial) {
      var $active = $(".portfolio__item--active"),
        $target = $grid.find(".js-portfolio-item").eq($active.data("count")),
        selector = ".site-footer";

      TweenMax.to(selector, 0.3, { opacity: 0 });

      $(".site-footer").css("pointer-events", "none");
      $(".site-footer").fadeOut();

      $(".photometa")
        .addClass("no-transition")
        .css("opacity", 0);

      $grid.css("opacity", 1);

      $(".js-portfolio-item").addClass("no-transition");

      TweenMax.to($(".mask--project"), 0, {
        "transform-origin": "0 100%",
        "z-index": 300,
        scaleX: 0
      });

      $film.css("z-index", 200);
      $grid.css("z-index", 400);

      if (typeof initial === "undefined") {
        morph(
          $active,
          $target,
          { delay: 0.3 },
          function() {
            $target.imagesLoaded(function() {
              $target.find(".portfolio__item--clone").remove();
              $(".photometa")
                .removeClass("no-transition")
                .css("opacity", "");
            });
          },
          false
        );
      } else {
        $(".photometa")
          .removeClass("no-transition")
          .css("opacity", "");
      }

      $grid.find(".js-portfolio-item img").css("opacity", "");

      if (typeof initial === "undefined") {
        setTimeout(function() {
          var $items = $grid.find(".js-portfolio-item img");
          $items.sort(function() {
            return 0.5 - Math.random();
          });

          TweenMax.staggerTo(
            $items,
            0.3,
            { opacity: 1, ease: Quad.easeInOut },
            0.05
          );
          $(".js-portfolio-item").removeClass("no-transition");
        }, 600);
      }

      TweenMax.to($(".mask--project"), 0.6, {
        x: 0,
        scaleX: 1,
        ease: Expo.easeInOut,
        onComplete: function() {
          $(".site").css("overflow-x", "hidden");
          $film.removeClass("portfolio--visible");
          $grid.addClass("portfolio--visible");
          TweenMax.to(".mask--project", 0, { scaleX: 0 });
        }
      });
    }

    function showFilmstrip(e) {
      if (
        typeof e !== "undefined" &&
        $(e.target).is(".js-thumbs, .js-plus, .js-minus")
      ) {
        return;
      }

      var $clicked = $(this),
        $target = $film.find(".js-portfolio-item").eq($clicked.data("count")),
        selector = ".site-footer";

      $(".site").css("overflow-x", "");

      $(".photometa")
        .addClass("no-transition")
        .css("opacity", 0);

      TweenMax.to(selector, 0.3, { opacity: 1, delay: 0.3 });

      $(".site-footer").css("pointer-events", "auto");
      $(".site-footer").fadeIn();

      $(".js-portfolio-item").addClass("no-transition");

      $clicked.css("opacity", 0);
      $film.find(".js-portfolio-item").css("opacity", 0);
      $film.find(".js-portfolio-item img").css("opacity", "");

      $target.addClass("portfolio__item--target");

      $film.addClass("portfolio--visible");

      TweenMax.to($(".mask--project"), 0, {
        "transform-origin": "100% 0",
        "z-index": 300
      });
      $film.css("z-index", 400);
      $grid.css("z-index", 200);

      TweenMax.to($(".mask--project"), 0.6, {
        scale: 1,
        ease: Expo.easeInOut,
        onComplete: function() {
          $grid.removeClass("portfolio--visible");
          $grid.css("opacity", "");
          TweenMax.to($film.find(".js-portfolio-item"), 0.3, {
            opacity: 1,
            onComplete: function() {
              $(".js-portfolio-item").removeClass("no-transition");
              $film
                .find(".photometa")
                .removeClass("no-transition")
                .css("opacity", "");
            }
          });
          $target.removeClass("portfolio__item--target");
          TweenMax.to(".mask--project", 0, { scaleX: 0 });
        }
      });

      centerFilmToTarget($target);
      morph(
        $clicked,
        $target,
        {},
        function() {
          $target.imagesLoaded(function() {
            $target.find(".portfolio__item--clone").remove();
          });
        },
        false
      );
    }

    function centerFilmToTarget($target) {
      var offset = parseInt($(".bar--fixed").css("left"), 10);

      if (Modernizr.touchevents || $("html").hasClass(".is--ie-le10")) {
        TweenLite.to(".site-content", 0, {
          scrollTo: {
            x: $target.data("middle") - $(".site-content").width() / 2 + offset
          },
          ease: Power1.easeInOut
        });
      } else {
        TweenLite.to(window, 0, {
          scrollTo: {
            x: $target.data("middle") - $(".site-content").width() / 2 + offset
          },
          ease: Power1.easeInOut
        });
      }
    }

    function addImageToFullView($source) {
      // prepare current for fullview
      var isVideo = $source.is(".portfolio__item--video"),
        width = $source.data("width"),
        height = $source.data("height"),
        newWidth = $fullview.width(),
        newHeight = $fullview.height(),
        scaleX = newWidth / width,
        scaleY = newHeight / height,
        scale =
          imageScaling == "fill"
            ? Math.max(scaleX, scaleY)
            : Math.min(scaleX, scaleY),
        $target = $("<div>").addClass("fullview__image"),
        $image = $(document.createElement("img"));

      fullviewWidth = width * scale;
      fullviewHeight = height * scale;

      setCurrent($source);

      $target.css({
        width: fullviewWidth,
        height: fullviewHeight,
        top: (fullviewHeight - newHeight) / -2,
        left: (fullviewWidth - newWidth) / -2
      });

      $fullview.append($target);

      if (isVideo) {
        $source
          .find("iframe")
          .clone()
          .prependTo($target);
      } else {
        $image.attr("src", $source.data("srcfull")).prependTo($target);
      }

      return $target;
    }

    function showFullView(e) {
      if (
        typeof e !== "undefined" &&
        $(e.target).is(".js-thumbs, .js-plus, .js-minus")
      ) {
        return;
      }

      // prepare current for fullview
      var $source = $(this),
        $target = addImageToFullView($source);

      $(".button-full").css("opacity", 0);

      $source.addClass("hide-meta");

      initialAlpha = latestDeviceAlpha;
      initialBeta = latestDeviceBeta;
      initialGamma = latestDeviceGamma;

      morph($source, $target);

      if (imageScaling === "fit") {
        $fullview.css("backgroundColor", "#222222");
      } else if (Modernizr.touchevents) {
        $(window).on("deviceorientation", panFullview);
        $document.on("mousemove", panFullview);
      } else {
        setTimeout(function() {
          TweenMax.to($(".fullview__image img"), 0.5, {
            x:
              ((windowWidth / 2 - latestKnownMouseX) *
                (fullviewWidth - windowWidth)) /
              windowWidth,
            y:
              ((windowHeight / 2 - latestKnownMouseY) *
                (fullviewHeight - windowHeight)) /
              windowHeight,
            ease: Back.easeOut,
            onComplete: function() {
              $document.on("mousemove", panFullview);
              $(window).on("deviceorientation", panFullview);
              setCurrent($source);
            }
          });
        }, 500);
      }

      $fullview.addClass("fullview--visible");
    }

    function panFullview() {
      $(".fullview__image img").each(function(i, obj) {
        var $img = $(obj),
          imgWidth = $img.width(),
          imgHeight = $img.height();

        if (Modernizr.touchevents) {
          var a = initialAlpha - latestDeviceAlpha,
            b = initialBeta - latestDeviceBeta,
            g = initialGamma - latestDeviceGamma,
            x,
            y;

          b = b < -30 ? -30 : b > 30 ? 30 : b;
          g = g < -30 ? -30 : g > 30 ? 30 : g;

          x = g;
          y = b;

          if (windowWidth > windowHeight) {
            x = -b;
            y = -g;
          }

          if (imgWidth > windowWidth) {
            TweenMax.to($img, 0, {
              x: (x / 60) * (imgWidth - windowWidth)
            });
          }

          if (imgHeight > windowHeight) {
            TweenMax.to($img, 0, {
              y: (y / 60) * (imgHeight - windowHeight)
            });
          }
        } else {
          if (imgWidth > windowWidth) {
            TweenMax.to($img, 0, {
              x:
                ((windowWidth / 2 - latestKnownMouseX) *
                  (imgWidth - windowWidth)) /
                windowWidth
            });
          }

          if (imgHeight > windowHeight) {
            TweenMax.to($img, 0, {
              y:
                ((windowHeight / 2 - latestKnownMouseY) *
                  (imgHeight - windowHeight)) /
                windowHeight
            });
          }
        }
      });
    }

    function hideFullView(e) {
      var $source = $(".fullview__image"),
        $target = $(".portfolio__item--active").addClass("hide-meta"),
        isVideo = $target.is(".portfolio__item--video");

      if (typeof e !== "undefined") {
        e.stopPropagation();
        e.preventDefault();
      }

      $target
        .children()
        .not(".jetpack-video-wrapper")
        .add($target)
        .addClass("no-transition")
        .css("opacity", 0);
      setTimeout(function() {
        $target
          .children()
          .add($target)
          .removeClass("no-transition");
      }, 10);

      if (imageScaling == "fit") {
        $fullview.css("backgroundColor", "transparent");
      }

      $document.off("mousemove", panFullview);
      $(window).off("deviceorientation", panFullview);

      setCurrent($target);
      centerFilmToTarget($target);

      $(".site-content").addClass("site-content--fullview");

      function finishHideFullView() {
        morph($source, $target, {}, function() {
          $(".site-content").removeClass("site-content--fullview");
          $(".button-full").css("opacity", 1);
          $target.removeClass("hide-meta");
        });
        setTimeout(function() {
          $fullview.removeClass("fullview--visible");
          $source.remove();
        }, 10);
      }

      if (isVideo) {
        finishHideFullView();
        return;
      }

      if (imageScaling === "fill") {
        TweenMax.to($(".fullview__image img"), 0.2, {
          x: 0,
          y: 0,
          onComplete: finishHideFullView
        });
      } else {
        $fullview.css("backgroundColor", "transparent");
        setTimeout(function() {
          finishHideFullView();
        }, 200);
      }
    }

    function morph($source, $target, options, callback, remove) {
      var sourceOffset = $source.offset(),
        sourceWidth = $source.width(),
        sourceHeight = $source.height(),
        targetOffset = $target.offset(),
        targetWidth = $target.width(),
        targetHeight = $target.height(),
        $clone = $source.clone().addClass("portfolio__item--clone");

      remove = typeof remove === "undefined" ? true : remove;

      $clone.css({
        position: "absolute",
        top: sourceOffset.top - targetOffset.top,
        left: sourceOffset.left - targetOffset.left,
        width: sourceWidth,
        height: sourceHeight,
        background: "none"
      });

      $target.css({
        position: "relative",
        transition: "none",
        "z-index": "10000",
        opacity: 1,
        background: "none"
      });

      $clone.css("opacity", 1);
      $clone.find("img").css("opacity", 1);
      $target.find("img").css("opacity", 0);

      var defaults = {
          x:
            targetOffset.left -
            sourceOffset.left +
            (targetWidth - sourceWidth) / 2,
          y:
            targetOffset.top -
            sourceOffset.top +
            (targetHeight - sourceHeight) / 2,
          scale: targetWidth / sourceWidth,
          force3D: true,
          ease: Expo.easeInOut,
          onComplete: function() {
            $target.find("img").css("opacity", 1);
            $target.css({
              background: "",
              position: "",
              "z-index": "",
              transition: "",
              opacity: ""
            });

            if (!empty($target.data("caption"))) {
              $target.children(".photometa").css("opacity", 1);
            }

            $source.css("opacity", "");

            if (remove) {
              $clone.remove();
            }

            if (typeof callback !== "undefined") {
              callback();
            }
          }
        },
        config = $.extend(defaults, options);

      requestAnimationFrame(function() {
        TweenMax.to($target.children(".photometa"), 0, { opacity: 0 });
        $clone.prependTo($target);
        TweenMax.to($clone.children(".photometa"), 0.3, { opacity: 0 });
        TweenMax.to($clone, 0.5, config);
      });
    }

    function getMiddle($image) {
      return $image.offset().left + $image.width() / 2 - $film.offset().left;
    }

    function setCurrent($current) {
      $film.find(".js-portfolio-item").removeClass("portfolio__item--active");
      $current.addClass("portfolio__item--active");
      $(".portfolio__position").text(
        $current.data("count") +
          1 +
          " " +
          objectl10n.tCounter +
          " " +
          $film.find(".js-portfolio-item").not(".portfolio__item--clone").length
      );
    }

    return {
      init: init,
      prepare: prepare,
      onResize: onResize,
      getCurrent: getCurrent,
      destroy: destroy
    };
  })();

  /* --- Royal Slider Init --- */

  function royalSliderInit($container) {
    $container = typeof $container !== "undefined" ? $container : $("body");

    // Find and initialize each slider
    $container.find(".js-pixslider").each(function() {
      sliderInit($(this));

      var slider = $(this).data("royalSlider");

      if (!slider.slides.length) {
        return;
      }

      var firstSlide = slider.slides[0],
        firstSlideContent = $(firstSlide.content),
        $video = firstSlideContent.hasClass("video")
          ? firstSlideContent
          : firstSlideContent.find(".video"),
        firstSlideAutoPlay =
          typeof $video.data("video_autoplay") !== "undefined";

      if (firstSlideAutoPlay || ieMobile || iOS || android) {
        firstSlide.holder.on("rsAfterContentSet", function() {
          slider.playVideo();
        });
      }

      slider.ev.on("rsBeforeAnimStart", function(event) {
        slider.stopVideo();
      });

      // auto play video sliders if is set so
      slider.ev.on("rsAfterSlideChange", function(event) {
        var $slide_content = $(slider.currSlide.content),
          $video = $slide_content.hasClass("video")
            ? $slide_content
            : $slide_content.find(".video"),
          rs_videoAutoPlay =
            typeof $video.data("video_autoplay") !== "undefined";

        if (rs_videoAutoPlay || ieMobile || iOS || android) {
          slider.stopVideo();
          slider.playVideo();
        }
      });

      // after destroying a video remove the autoplay class (this way the image gets visible)
      slider.ev.on("rsOnDestroyVideoElement", function(i, el) {
        var $slide_content = $(this.currSlide.content),
          $video = $slide_content.hasClass("video")
            ? $slide_content
            : $slide_content.find(".video");

        $video.removeClass("video_autoplay");
      });
    });
  }

  /*
   * Slider Initialization
   */
  function sliderInit($slider) {
    // Helper function
    // examples
    // console.log(padLeft(23,5));       //=> '00023'
    // console.log(padLeft(23,5,'>>'));  //=> '>>>>>>23'
    function padLeft(nr, n, str) {
      return Array(n - String(nr).length + 1).join(str || "0") + nr;
    }

    if (globalDebug) {
      console.log("Royal Slider Init");
    }

    $slider.find("img").removeClass("invisible");

    var $children = $(this).children(),
      rs_arrows = typeof $slider.data("arrows") !== "undefined",
      rs_bullets =
        typeof $slider.data("bullets") !== "undefined" ? "bullets" : "none",
      rs_autoheight = typeof $slider.data("autoheight") !== "undefined",
      rs_autoScaleSlider = false,
      rs_autoScaleSliderWidth =
        typeof $slider.data("autoscalesliderwidth") !== "undefined" &&
        $slider.data("autoscalesliderwidth") != ""
          ? $slider.data("autoscalesliderwidth")
          : false,
      rs_autoScaleSliderHeight =
        typeof $slider.data("autoscalesliderheight") !== "undefined" &&
        $slider.data("autoscalesliderheight") != ""
          ? $slider.data("autoscalesliderheight")
          : false,
      rs_customArrows = typeof $slider.data("customarrows") !== "undefined",
      rs_slidesSpacing =
        typeof $slider.data("slidesspacing") !== "undefined"
          ? parseInt($slider.data("slidesspacing"))
          : 0,
      rs_imageScale = $slider.data("imagescale"),
      rs_keyboardNav = typeof $slider.data("keyboardnav") !== "undefined",
      rs_visibleNearby = typeof $slider.data("visiblenearby") !== "undefined",
      rs_nearbyCenter = typeof $slider.data("nearbycenter") !== "undefined",
      rs_imageAlignCenter =
        typeof $slider.data("imagealigncenter") !== "undefined",
      rs_transition =
        typeof $slider.data("slidertransition") !== "undefined" &&
        $slider.data("slidertransition") != ""
          ? $slider.data("slidertransition")
          : "fade",
      rs_transitionSpeed =
        typeof $slider.data("slidertransitionspeed") !== "undefined" &&
        $slider.data("slidertransitionspeed") != ""
          ? $slider.data("slidertransitionspeed")
          : 600,
      rs_autoPlay = typeof $slider.data("sliderautoplay") !== "undefined",
      rs_delay =
        typeof $slider.data("sliderdelay") !== "undefined" &&
        $slider.data("sliderdelay") != ""
          ? $slider.data("sliderdelay")
          : "1000",
      rs_drag = true,
      rs_globalCaption = typeof $slider.data("showcaptions") !== "undefined",
      hoverArrows = typeof $slider.data("hoverarrows") !== "undefined";

    if (rs_autoheight) {
      rs_autoScaleSlider = false;
    } else {
      rs_autoScaleSlider = true;
    }

    // Single slide case
    if ($children.length == 1) {
      rs_arrows = false;
      rs_bullets = "none";
      rs_keyboardNav = false;
      rs_drag = false;
      rs_transition = "fade";
      rs_customArrows = false;
    }

    // make sure default arrows won't appear if customArrows is set
    if (rs_customArrows) rs_arrows = false;

    //the main params for Royal Slider
    var royalSliderParams = {
      autoHeight: rs_autoheight,
      autoScaleSlider: rs_autoScaleSlider,
      loop: true,
      autoScaleSliderWidth: rs_autoScaleSliderWidth,
      autoScaleSliderHeight: rs_autoScaleSliderHeight,
      imageScaleMode: rs_imageScale,
      imageAlignCenter: rs_imageAlignCenter,
      slidesSpacing: rs_slidesSpacing,
      arrowsNav: rs_arrows,
      controlNavigation: rs_bullets,
      keyboardNavEnabled: rs_keyboardNav,
      arrowsNavAutoHide: false,
      sliderDrag: rs_drag,
      transitionType: rs_transition,
      transitionSpeed: rs_transitionSpeed,
      imageScalePadding: 0,
      autoPlay: {
        enabled: rs_autoPlay,
        stopAtAction: true,
        pauseOnHover: true,
        delay: rs_delay
      },
      addActiveClass: true,
      globalCaption: rs_globalCaption,
      numImagesToPreload: 4
    };

    var rs_centerArea = rs_nearbyCenter == true ? 0.9 : 0.95;

    if (rs_visibleNearby) {
      royalSliderParams["visibleNearby"] = {
        enabled: rs_visibleNearby,
        centerArea: rs_centerArea,
        center: rs_nearbyCenter,
        breakpoint: 650,
        breakpointCenterArea: 0.64,
        navigateByCenterClick: true
      };
    }

    //lets fire it up
    $slider.royalSlider(royalSliderParams);

    var royalSlider = $slider.data("royalSlider"),
      slidesNumber = royalSlider.numSlides;

    // create the markup for the customArrows
    // don't need it if we have only one slide
    if (royalSlider && slidesNumber > 1) {
      var $slides_total = $(".js-gallery-slides-total"),
        $decimal = $(".js-decimal"),
        $unit = $(".js-unit");

      //slidesNumber = (slidesNumber < 10) ? padLeft(slidesNumber, 2) : slidesNumber;
      $slides_total.html(slidesNumber);

      royalSlider.ev.on("rsBeforeAnimStart", function(event) {
        var currentSlide = royalSlider.currSlideId + 1;
        $unit.html(currentSlide);
      });
    }

    if (slidesNumber == 1) {
      $slider.addClass("single-slide");
    }

    $slider.addClass("slider--loaded");

    if ($slider.hasClass("pixslider")) {
      var $arrows = $slider.find(".rsArrow");
      $arrows.appendTo($slider);

      var tl = new TimelineLite({ delay: 0.5, paused: true });
      tl.to($slider, 0, { overflow: "visible" }).fromTo(
        $arrows,
        0.3,
        { opacity: 0 },
        { opacity: 1 }
      );
      tl.play();
    }
  }
  window.videos = (function() {
    function init() {
      if (globalDebug) {
        console.group("videos::init");
      }

      var videos = $(".portfolio__item--video iframe, iframe[width][height]");

      // Figure out and save aspect ratio for each video
      videos.each(function() {
        var w = $(this).attr("width") ? $(this).attr("width") : $(this).width(),
          h = $(this).attr("height")
            ? $(this).attr("height")
            : $(this).height();

        $(this)
          .attr("data-aspectRatio", w / h)
          // and remove the hard coded width/height
          .removeAttr("height")
          .removeAttr("width")
          .width(w)
          .height(h);
      });

      // Firefox Opacity Video Hack
      $("iframe").each(function() {
        var url = $(this).attr("src");

        if (!empty(url)) {
          $(this).attr("src", setQueryParameter(url, "wmode", "transparent"));
        }

        $(this).on("load", function() {
          resize();
          $(window).trigger("project:resize");
        });
      });

      if (globalDebug) {
        console.groupEnd();
      }
    }

    function resize() {
      if (globalDebug) {
        console.group("videos::resize");
      }

      var videos = $(
        ".portfolio__item--video iframe, iframe[data-aspectRatio]"
      );

      videos.each(function() {
        var video = $(this),
          ratio = video.attr("data-aspectRatio"),
          w,
          h;

        if (video.closest(".portfolio__item--video").length) {
          if (globalDebug) {
            console.log(w, h, ratio);
          }
          h = video.closest(".portfolio__item--video").height();
          w = h * ratio;

          video.width(w);
          video.height(h);
        } else {
          (w = video.css("width", "100%").width()), (h = w / ratio);

          var container_width = video.parent().width();

          if (w > container_width) {
            video.width(w).height(container_width * ratio);
          } else {
            video.width(w).height(h);
          }
        }
      });

      if (globalDebug) {
        console.groupEnd();
      }
    }

    return {
      init: init,
      resize: resize
    };
  })();
  // /* ====== ON DOCUMENT READY ====== */

  $(function() {
    init();
  });

  function init() {
    browserSupport();
    platformDetect();
    browserSize();
    scrollToTop();

    Nav.init();
    updateHeader();
    $html.addClass("ready");

    $(".site-header, #page, .site-footer").css("opacity", 1);

    if (Modernizr.touchevents) {
      HandleParentMenuItems.bindOuterNavClick();
    }
  }

  function softInit() {
    niceScrollInit();
    sizeColumns();

    $("html, body, *").unbind("mousewheel", vertToHorScroll);
    horToVertScroll = false;

    if (windowWidth > 900 && Modernizr.touchevents) {
      HandleParentMenuItems.handle();
    }

    if ($(".single-jetpack-portfolio").length) {
      Project.init();
      Placeholder.update();
      Project.prepare();
    } else {
      Placeholder.update();
    }

    Portfolio.init();
    Blog.init();

    frontpageSlider.init();

    royalSliderInit();
    videos.init();

    filterHandler();

    $(".site-header, #page, .site-footer").css("opacity", 1);

    $(".pixcode--tabs").organicTabs();

    if (!Modernizr.touchevents && !horToVertScroll) {
      bindVertToHorScroll();
    }
  }

  // /* ====== ON WINDOW LOAD ====== */
  $window.load(function() {
    softInit();
    eventHandlers();
    loop();
  });

  // /* ====== ON RESIZE ====== */

  function onResize() {
    browserSize();
    sizeColumns();

    if (Modernizr.touchevents) {
      if (windowWidth >= 900) {
        // Handle parent menu items
        HandleParentMenuItems.handle();
      } else if (windowWidth < 900) {
        // Remove handlers
        HandleParentMenuItems.unHandle();
      }
    }

    Project.onResize();
    Nav.onResize();

    frontpageSlider.onResize();
    videos.resize();

    if (isiele10) {
      Blog.calcIeFilmstrip();
    }

    Placeholder.resize();
  }

  function updateHeader() {
    if (
      $(".page-has-featured-image").length &&
      latestKnownScrollY > windowHeight - 62
    ) {
      $("body").addClass("header--not-light");
    } else {
      $("body").removeClass("header--not-light");
    }
  }

  var scrollTimeout,
    isScrolling = false;

  function onScroll(e) {
    if (
      $(".filmstrip").length ||
      $(".portfolio--filmstrip.portfolio--visible").length
    ) {
      latestKnownScrollX = $(this).scrollLeft();
    } else {
      latestKnownScrollY = $(this).scrollTop();
    }
    if (!isScrolling) {
      isScrolling = true;
      $body.addClass("is-scrolling");
    }
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(doneScrolling, 1000);
  }

  function doneScrolling() {
    $body.removeClass("is-scrolling");
    isScrolling = false;
  }

  function loop() {
    Project.getCurrent();
    Portfolio.maybeloadNextProjects();
    Blog.maybeLoadNextPosts();
    updateHeader();

    requestAnimationFrame(loop);
  }

  function eventHandlers() {
    $window.on("debouncedresize", onResize);

    $window.on("scroll", onScroll);

    if (Modernizr.touchevents && isFilmstrip()) {
      $(".site-content").on("scroll", onScroll);
    }

    $window.on("mousemove", function(e) {
      latestKnownMouseX = e.clientX;
      latestKnownMouseY = e.clientY;
    });

    $window.on("deviceorientation", function(e) {
      latestDeviceAlpha = e.originalEvent.alpha;
      latestDeviceBeta = e.originalEvent.beta;
      latestDeviceGamma = e.originalEvent.gamma;
    });

    if (windowWidth > 740) {
      bindVertToHorScroll();
    }
  }

  (function() {
    window.disable_mobile_panning = true;

    window.addEventListener(
      "touchstart",
      function onFirstTouch() {
        Modernizr.touchevents = true;
        window.removeEventListener("touchstart", onFirstTouch, false);
      },
      false
    );

    function onPointerDownHandler(event) {
      if (event.pointerType === "touch") {
        Modernizr.touchevents = true;
      }
    }

    // For IE 10
    window.addEventListener("MSPointerDown", onPointerDownHandler);
    // For IE 11+
    window.addEventListener("pointerdown", onPointerDownHandler);
    window.addEventListener("devicemotion", function(event) {
      if (!event.rotationRate) {
        return;
      }

      if (
        event.rotationRate.alpha ||
        event.rotationRate.beta ||
        event.rotationRate.gamma
      ) {
        window.disable_mobile_panning = false;
      }
    });
  })();

  /* ====== HELPER FUNCTIONS ====== */

  /**
   * Detect what platform are we on (browser, mobile, etc)
   */

  function browserSupport() {
    $.support.touch = Modernizr.touchevents;
    $.support.svg = document.implementation.hasFeature(
      "http://www.w3.org/TR/SVG11/feature#BasicStructure",
      "1.1"
    )
      ? true
      : false;
    $.support.transform = getSupportedTransform();

    $html
      .addClass($.support.touch ? "touch" : "no-touch")
      .addClass($.support.svg ? "svg" : "no-svg")
      .addClass(!!$.support.transform ? "transform" : "no-transform");
  }

  function browserSize() {
    windowHeight = $window.height();
    windowWidth = $window.width();
    documentHeight = $document.height();
    myOrientation = windowWidth > windowHeight ? "portrait" : "landscape";
  }

  function getSupportedTransform() {
    var prefixes = [
      "transform",
      "WebkitTransform",
      "MozTransform",
      "OTransform",
      "msTransform"
    ];
    for (var i = 0; i < prefixes.length; i++) {
      if (document.createElement("div").style[prefixes[i]] !== undefined) {
        return prefixes[i];
      }
    }
    return false;
  }

  /**
   * Handler for the back to top button
   */
  function scrollToTop() {
    $(document).on("click", 'a[href="#top"]', function(event) {
      event.preventDefault();
      event.stopPropagation();

      TweenMax.to($(window), 1, {
        scrollTo: {
          y: 0,
          autoKill: true
        },
        ease: Power3.easeOut
      });
    });
  }

  /**
   * function similar to PHP's empty function
   */

  function empty(data) {
    if (typeof data == "number" || typeof data == "boolean") {
      return false;
    }
    if (typeof data == "undefined" || data === null) {
      return true;
    }
    if (typeof data.length != "undefined") {
      return data.length === 0;
    }
    var count = 0;
    for (var i in data) {
      // if(data.hasOwnProperty(i))
      //
      // This doesn't work in ie8/ie9 due the fact that hasOwnProperty works only on native objects.
      // http://stackoverflow.com/questions/8157700/object-has-no-hasownproperty-method-i-e-its-undefined-ie8
      //
      // for hosts objects we do this
      if (Object.prototype.hasOwnProperty.call(data, i)) {
        count++;
      }
    }
    return count === 0;
  }

  /**
   * function to add/modify a GET parameter
   */

  function setQueryParameter(uri, key, value) {
    var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i"),
      separator = "";
    separator = uri.indexOf("?") !== -1 ? "&" : "?";
    if (uri.match(re)) {
      return uri.replace(re, "$1" + key + "=" + value + "$2");
    } else {
      return uri + separator + key + "=" + value;
    }
  }

  function is_touch() {
    return $.support.touch;
  }

  function isElementInViewport(el) {
    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }

    var rect = el.getBoundingClientRect(),
      height = window.innerHeight || document.documentElement.clientHeight,
      width = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top <= height * 1.5 /*or $(window).height() */ &&
      rect.left <= width * 1.5 /*or $(window).width() */ &&
      rect.bottom >= -0.5 * height &&
      rect.right >= -0.5 * width
    );
  }

  function sizeColumns() {
    $(".portfolio__item--text").each(function(i, obj) {
      var $item = $(obj).css("width", ""),
        itemOffset = $item.offset().left,
        $children,
        $last,
        height,
        width,
        totalHeight,
        totalWidth;

      $children = $(obj).children();
      height = $item.outerHeight();

      if (!$children.length) {
        $item.remove();
        return;
      }

      $last = $children.filter(":visible").last();

      if (!$last.length) {
        return;
      }

      totalHeight =
        $last.offset().top - $item.offset().top + $last.outerHeight();
      totalWidth =
        $last.offset().left - $item.offset().left + $last.outerWidth();

      if (totalHeight > height) {
        width = $item.outerWidth() * (parseInt(totalHeight / height) + 1);
      } else {
        width = $last.offset().left - itemOffset + $last.outerWidth();
      }

      $item.width(width);
    });
  }

  function isFilmstrip() {
    return (
      $body.hasClass("blog") ||
      $body.hasClass("project_layout-filmstrip") ||
      $body.hasClass("project_layout-thumbnails")
    );
  }

  function bindVertToHorScroll() {
    if (isFilmstrip() && !$html.hasClass("is--ie-le10")) {
      // html body are for ie
      $("html, body, .filmstrip, .portfolio--filmstrip").bind(
        "mousewheel",
        vertToHorScroll
      );
      horToVertScroll = true;
    }
  }

  function vertToHorScroll(event, delta) {
    if (
      $(".filmstrip").length ||
      $(".portfolio--filmstrip.portfolio--visible").length
    ) {
      this.scrollLeft -= delta * event.deltaFactor; // delta for macos
      event.preventDefault();
    }
  }

  function niceScrollInit() {
    var niceScrollOptions = {
      zindex: 5000,
      smoothscroll: false // because it interferes with the hor to ver scroll script
    };

    if (isWindows) {
      $html.niceScroll(niceScrollOptions);
      $html.addClass("has--nicescroll");
      $html.addClass("is--windows");

      $(document).on("jp_carousel.afterClose", function() {
        $html.getNiceScroll().resize();
      });
    }
  }

  function filterHandler() {
    var $projectsFilter = $(".js-projects-filter");
    var $filterContent = $(".js-projects-filter-content");
    var $filterList = $(".js-projects-filter-list");

    $(".js-projects-filter-trigger").on("mouseenter", function() {
      $projectsFilter.addClass("is-open");
      TweenMax.to($filterContent, 0.2, {
        opacity: 1,
        onStart: function() {
          $filterList.css("display", "block");
        }
      });
    });

    $projectsFilter.on("mouseleave", function() {
      $projectsFilter.removeClass("is-open");
      TweenMax.to($filterContent, 0.2, {
        opacity: 0,
        onComplete: function() {
          $filterList.css("display", "none");
        }
      });
    });
  }

  var HandleParentMenuItems = (function() {
    // Handle parent menu items on tablet in landscape mode;
    // use case: normal, horizontal menu, touch events,
    // sub menus are not visible.
    function handleParentMenuItems() {
      // Make sure there are no open menu items
      $(".menu-item-has-children").removeClass("hover");

      $(".menu-item-has-children > a").each(function() {
        // Add a class so we know the items to handle
        $(this).addClass("prevent-one");

        // Store the original href
        $(this).attr("href-original", $(this).attr("href"));
        // Add a '#' at the end of href so dJax won't interfere
        $(this).attr("href", $(this).attr("href") + "#");
      });

      $("a.prevent-one").on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();

        // When a parent menu item is activated,
        // close other menu items on the same level
        $(this)
          .parent()
          .siblings()
          .removeClass("hover");

        // Restore the original href so that
        // the menu item can now be used
        $(this).attr("href", $(this).attr("href-original"));

        // Open the sub menu of this parent item
        $(this)
          .parent()
          .addClass("hover");
      });
    }

    // Restore the original behaviour when in portrait mode;
    // use case: vertical menu, all menu items are visible.
    function unHandleParentMenuItems() {
      $("a.prevent-one").each(function() {
        // Unbind te click handler
        $(this).unbind();
        // Restore the original href so dJax can do its job
        $(this).attr("href", $(this).attr("href-original"));
        $(this).removeClass("prevent-one");
      });
    }

    // When a sub menu is open, close it by a touch on
    // any other part of the viewport than navigation.
    // use case: normal, horizontal menu, touch events,
    // sub menus are not visible.
    function bindOuterNavClick() {
      $("body").on("touchstart", function(e) {
        var container = $(".nav--main");

        if (
          !container.is(e.target) && // if the target of the click isn't the container...
          container.has(e.target).length === 0
        ) {
          // ... nor a descendant of the container
          $(".menu-item-has-children").removeClass("hover");
          $("a.prevent-one").each(function() {
            $(this).attr("href", $(this).attr("href-original") + "#");
          });
        }
      });
    }

    return {
      handle: handleParentMenuItems,
      unHandle: unHandleParentMenuItems,
      bindOuterNavClick: bindOuterNavClick
    };
  })();
})(jQuery);
