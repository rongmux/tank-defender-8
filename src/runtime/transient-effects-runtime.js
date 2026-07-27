(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.transientEffectsRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.isTankDestructionStyle !== "function") {
      throw new Error("deps.isTankDestructionStyle must be a function");
    }
    if (typeof deps.createExplosionState !== "function") {
      throw new Error("deps.createExplosionState must be a function");
    }
    if (typeof deps.createScorePopupState !== "function") {
      throw new Error("deps.createScorePopupState must be a function");
    }
    if (typeof deps.advanceTimedStates !== "function") {
      throw new Error("deps.advanceTimedStates must be a function");
    }
    if (!callbacks || typeof callbacks.gameSettings !== "function") {
      throw new Error("callbacks.gameSettings must be a function");
    }
  }

  /** Owns mutable explosion and score-popup queues while keeping Canvas rendering in game.js. */
  function setupTransientEffectsRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var shared = deps.sharedState;
    var settings = callbacks.gameSettings;

    function explosionRule(ruleName) {
      var rules = settings().explosionRules || deps.DEFAULT_EXPLOSION_RULES;
      return rules[ruleName] || deps.DEFAULT_EXPLOSION_RULES[ruleName] || deps.DEFAULT_EXPLOSION_RULES.enemyHit;
    }

    function baseDestructionDuration() {
      return explosionRule("baseDestroy").ttl + deps.BASE_DESTRUCTION_TAIL_FRAMES;
    }

    function addRuleExplosion(ruleName, x, y) {
      var rule = explosionRule(ruleName);
      var style = shared.BULLET_IMPACT_EXPLOSION_RULES.has(ruleName)
        ? "bulletImpact"
        : (deps.isTankDestructionStyle(ruleName) ? ruleName : "default");
      addExplosion(x, y, rule.ttl, rule.color, rule.coreColor, style);
    }

    function addExplosion(x, y, ttl, color, coreColor, style) {
      game.explosions.push(deps.createExplosionState({
        x: x,
        y: y,
        ttl: ttl,
        color: color,
        coreColor: coreColor,
        defaultCoreColor: deps.DEFAULT_EXPLOSION_CORE_COLOR,
        style: style
      }));
    }

    function updateExplosions() {
      game.explosions = deps.advanceTimedStates(game.explosions);
    }

    function addScorePopup(points, x, y, options) {
      var source = options || {};
      var popup = deps.createScorePopupState(points, x, y, Object.assign({}, source, {
        defaultX: shared.FIELD_W / 2,
        defaultY: shared.FIELD_H / 2
      }));
      if (popup) game.scorePopups.push(popup);
    }

    function updateScorePopups() {
      game.scorePopups = deps.advanceTimedStates(game.scorePopups);
    }

    var api = {
      addRuleExplosion: addRuleExplosion,
      explosionRule: explosionRule,
      baseDestructionDuration: baseDestructionDuration,
      addExplosion: addExplosion,
      updateExplosions: updateExplosions,
      addScorePopup: addScorePopup,
      updateScorePopups: updateScorePopups
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTransientEffectsRuntime: setupTransientEffectsRuntime });
});
