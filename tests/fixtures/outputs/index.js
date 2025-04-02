(function (thisObj) {// ----- EXTENDSCRIPT INCLUDES ------ //// ---------------------------------- //// ----- EXTENDSCRIPT PONYFILLS -----function __defineProperty(obj, prop, descriptor) { if (descriptor && descriptor.value !== undefined) { obj[prop] = descriptor.value; } return obj; };// ---------------------------------- //function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? __defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

var TestBulder = /*#__PURE__*/function () {
  function TestBulder(version) {
    _defineProperty(this, "version", void 0);
    this.version = version;
  }
  var _proto = TestBulder.prototype;
  _proto.salute = function salute() {
    $.writeln('Hello from TestBuilder ' + this.version);
  };
  return TestBulder;
}();
var testBuilder = new TestBulder('1.0.0');
testBuilder.salute();
thisObj.KT = KT;
})(this);//# sourceMappingURL=index.js.map
