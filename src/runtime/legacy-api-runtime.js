(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.legacyApiRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    var names = Object.keys(callbacks);
    if (names.length === 0) throw new Error("callbacks must contain at least one function");
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
    return names;
  }

  /** Registers the retained state.fn compatibility surface after runtime setup. */
  function setupLegacyApiRuntime(state, callbacks) {
    var names = requireInputs(state, callbacks);
    Object.assign(state.fn, callbacks);
    return Object.freeze({ registeredNames: Object.freeze(names.slice()) });
  }

  return Object.freeze({ setupLegacyApiRuntime: setupLegacyApiRuntime });
});
