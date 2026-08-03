(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.effectExplosionDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds the ordered rule and destruction-explosion presentation probes. */
  function createEffectExplosionDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var addRuleExplosion = scope.addRuleExplosion;
    var explosionRule = scope.explosionRule;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var playerDestructionPresentation = scope.playerDestructionPresentation;
    var tankDestructionPresentation = scope.tankDestructionPresentation;

    return Object.freeze({
      debugExplosionRuleProbe(ruleName) {
        var key = String(ruleName || "enemyDestroy");
        return { key: key, ...explosionRule(key) };
      },
      debugTankDestructionExplosionProbe() {
        var enemyFrames = function () {
          var ruleName = "enemyDestroy";
          addRuleExplosion(ruleName, 64, 64);
          var explosion = game.explosions.pop();
          return Array.from({ length: explosion.max }, function (_, elapsed) {
            explosion.ttl = explosion.max - elapsed;
            var presentation = tankDestructionPresentation(explosion);
            return {
              elapsed: elapsed,
              style: explosion.style,
              phase: presentation.phase,
              frameName: presentation.frameName,
              width: presentation.width,
              height: presentation.height,
              x: presentation.x,
              y: presentation.y
            };
          });
        };
        var playerFrames = function () {
          var rule = explosionRule("playerDestroy");
          var totalTicks = Math.max(1, gameSettings().timings.playerRespawn);
          var player = {
            x: 57,
            y: 57,
            w: 14,
            h: 14,
            respawn: totalTicks,
            destroyTotalTicks: totalTicks,
            destroyExplosionTicks: Math.min(totalTicks, rule.ttl)
          };
          return Array.from({ length: totalTicks }, function (_, elapsed) {
            player.respawn = totalTicks - elapsed;
            var presentation = playerDestructionPresentation(player);
            return {
              elapsed: elapsed,
              style: "playerDestroy",
              kind: presentation.kind,
              phase: presentation.phase,
              frameName: presentation.frameName,
              width: presentation.width,
              height: presentation.height,
              x: presentation.x,
              y: presentation.y
            };
          });
        };
        var previousExplosions = game.explosions;
        try {
          game.explosions = [];
          return {
            enemy: enemyFrames(),
            player: playerFrames()
          };
        } finally {
          game.explosions = previousExplosions;
        }
      }
    });
  }

  /** Builds the ordered destruction-frame and ordinary bullet-impact probes. */
  function createEffectImpactDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var addRuleExplosion = scope.addRuleExplosion;
    var BULLET_IMPACT_EXPLOSION_RULES = scope.BULLET_IMPACT_EXPLOSION_RULES;
    var clamp = scope.clamp;
    var DEFAULT_EXPLOSION_CORE_COLOR = scope.DEFAULT_EXPLOSION_CORE_COLOR;
    var drawManifestSprite = scope.drawManifestSprite;
    var drawTankDestructionExplosion = scope.drawTankDestructionExplosion;
    var explosionPresentation = scope.explosionPresentation;
    var explosionRule = scope.explosionRule;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var playerDestructionPresentation = scope.playerDestructionPresentation;
    var preparePausedDebugBattle = scope.preparePausedDebugBattle;
    var update = scope.update;
    var updateExplosions = scope.updateExplosions;

    return Object.freeze({
      debugRenderTankDestructionExplosionFrame(ruleName, elapsed) {
        var key = ruleName === "playerDestroy" ? "playerDestroy" : "enemyDestroy";
        var rule = explosionRule(key);
        if (key === "playerDestroy") {
          var totalTicks = Math.max(1, gameSettings().timings.playerRespawn);
          var frame = clamp(Math.floor(Number(elapsed) || 0), 0, totalTicks - 1);
          var player = {
            x: 57,
            y: 57,
            w: 14,
            h: 14,
            respawn: totalTicks - frame,
            destroyTotalTicks: totalTicks,
            destroyExplosionTicks: Math.min(totalTicks, rule.ttl)
          };
          var presentation = playerDestructionPresentation(player);
          drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
            primary: rule.color,
            core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
          });
          return presentation;
        }
        var enemyFrame = clamp(Math.floor(Number(elapsed) || 0), 0, rule.ttl - 1);
        var explosion = {
          x: 64,
          y: 64,
          ttl: rule.ttl - enemyFrame,
          max: rule.ttl,
          color: rule.color,
          coreColor: rule.coreColor,
          style: key
        };
        return drawTankDestructionExplosion(explosion);
      },
      debugBulletImpactExplosionProbe() {
        var previous = { ...game };
        try {
          preparePausedDebugBattle(0);
          game.explosions = [];
          addRuleExplosion("brickHit", 64, 64);
          var beforePause = game.explosions[0].ttl;
          update();
          var afterPause = game.explosions[0].ttl;
          var frames = [];
          while (game.explosions.length) {
            var explosion = game.explosions[0];
            var presentation = explosionPresentation(explosion);
            frames.push({ ttl: explosion.ttl, phase: presentation.phase, size: presentation.size });
            updateExplosions();
          }
          return {
            ruleTtls: Object.fromEntries(Array.from(BULLET_IMPACT_EXPLOSION_RULES, function (key) {
              return [key, explosionRule(key).ttl];
            })),
            beforePause: beforePause,
            afterPause: afterPause,
            frames: frames
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createEffectExplosionDiagnostics: createEffectExplosionDiagnostics,
    createEffectImpactDiagnostics: createEffectImpactDiagnostics
  });
});
