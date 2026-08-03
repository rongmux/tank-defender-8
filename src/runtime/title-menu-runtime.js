(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.titleMenuRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!Array.isArray(deps.sharedState.TITLE_MENU_ITEMS) || deps.sharedState.TITLE_MENU_ITEMS.length === 0) {
      throw new Error("deps.sharedState.TITLE_MENU_ITEMS must be a non-empty array");
    }
    if (typeof deps.clamp !== "function") throw new Error("deps.clamp must be a function");
  }

  /** Owns title-menu selection and its single-player, two-player, and Construction routes. */
  function setupTitleMenuRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var fn = state.fn;
    var items = deps.sharedState.TITLE_MENU_ITEMS;

    function moveTitleMenu(delta) {
      fn.resetTitleIdleHighByte();
      game.titleMenu = (game.titleMenu + delta + items.length) % items.length;
    }

    function setTitleMenu(index) {
      fn.resetTitleIdleHighByte();
      game.titleMenu = deps.clamp(Math.floor(Number(index) || 0), 0, items.length - 1);
    }

    function activateTitleMenu() {
      var item = items[game.titleMenu] || items[0];
      if (item.action === "one") fn.beginStageSelect(1);
      else if (item.action === "two") fn.beginStageSelect(2);
      else if (item.action === "construction") fn.enterEditor();
    }

    var api = {
      moveTitleMenu: moveTitleMenu,
      setTitleMenu: setTitleMenu,
      activateTitleMenu: activateTitleMenu
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTitleMenuRuntime: setupTitleMenuRuntime });
});
