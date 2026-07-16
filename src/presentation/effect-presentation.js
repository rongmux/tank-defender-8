(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const geometry = isCommonJs ? require("../core/geometry") : browserModules.geometry;
  if (!geometry) throw new Error("geometry module must load before effect-presentation.js");

  const api = factory(geometry);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.effectPresentation = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry) {
  "use strict";

  const { clamp } = geometry;
  const BASE_DESTRUCTION_TAIL_FRAMES = 4;
  const BASE_DESTRUCTION_REFERENCE_PHASES = Object.freeze([
    1, 1, 1,
    2, 2, 2, 2,
    3, 3, 3, 3,
    4, 4, 4, 4,
    5, 5, 5, 5,
    4, 4, 4, 4,
    3, 3, 3, 3,
    2, 2, 2, 2,
    1, 1, 1, 1
  ]);
  const ENEMY_DESTRUCTION_REFERENCE_PHASES = Object.freeze([
    1, 1, 1,
    2, 2, 2,
    3, 3, 3,
    4, 4, 4,
    5, 5, 5,
    3, 3, 3
  ]);
  const PLAYER_DESTRUCTION_REFERENCE_PHASES = Object.freeze([
    ...ENEMY_DESTRUCTION_REFERENCE_PHASES,
    1, 1, 1, 1, 1, 1
  ]);
  const BULLET_IMPACT_PHASE_SIZES = Object.freeze([8, 12, 16]);
  const TANK_DESTRUCTION_STYLES = new Set(["enemyDestroy", "playerDestroy"]);

  function normalizeLayout(layout) {
    const source = layout || {};
    return {
      x: Number(source.x) || 0,
      y: Number(source.y) || 0,
      width: Math.max(0, Number(source.width) || 0),
      height: Math.max(0, Number(source.height) || 0)
    };
  }

  function isTankDestructionStyle(style) {
    return TANK_DESTRUCTION_STYLES.has(style);
  }

  function destructionExplosionGeometry(phase, centerX, centerY) {
    const large = phase >= 4;
    const width = large ? 32 : 16;
    const height = large ? 32 : 8;
    return {
      phase,
      frameName: `phase${phase}`,
      size: width,
      width,
      height,
      x: Math.round(centerX - width / 2),
      y: Math.round(centerY - (large ? height / 2 : 8)),
      spriteX: Math.round(centerX - 16),
      spriteY: Math.round(centerY - 16)
    };
  }

  /** Projects the retained player death counter onto the explosion and final-picture sequence. */
  function playerDestructionPresentation(player, options) {
    const source = options || {};
    const layout = normalizeLayout(source.layout);
    const totalTicks = Math.max(
      1,
      Math.floor(Number(player.destroyTotalTicks) || Number(source.totalTicks) || 1)
    );
    const remainingTicks = clamp(Math.floor(Number(player.respawn) || 0), 1, totalTicks);
    const tick = totalTicks - remainingTicks;
    const explosionTicks = clamp(
      Math.floor(Number(player.destroyExplosionTicks) || Number(source.explosionTicks) || 1),
      1,
      totalTicks
    );
    const finalState = tick >= explosionTicks;
    const referenceFrame = finalState
      ? 0
      : Math.min(
        ENEMY_DESTRUCTION_REFERENCE_PHASES.length - 1,
        Math.floor((tick * ENEMY_DESTRUCTION_REFERENCE_PHASES.length) / explosionTicks)
      );
    const phase = finalState ? 1 : ENEMY_DESTRUCTION_REFERENCE_PHASES[referenceFrame];
    const centerX = layout.x + player.x + player.w / 2;
    const centerY = layout.y + player.y + player.h / 2;
    return {
      kind: finalState ? "final" : "explosion",
      tick,
      referenceFrame,
      ...destructionExplosionGeometry(phase, centerX, centerY)
    };
  }

  /** Projects enemy destruction onto explosion frames followed by the fixed score state. */
  function enemyDestructionPresentation(enemy, options) {
    const source = options || {};
    const layout = normalizeLayout(source.layout);
    const explosionTicks = Math.max(
      1,
      Math.floor(Number(enemy.destroyExplosionTicks) || Number(source.explosionTicks) || 1)
    );
    const scoreTicks = Math.max(0, Math.floor(Number(source.scoreTicks) || 0));
    const totalTicks = explosionTicks + scoreTicks;
    const tick = clamp(Math.floor(Number(enemy.destroyTicks) || 0), 0, totalTicks - 1);
    const centerX = layout.x + enemy.x + enemy.w / 2;
    const centerY = layout.y + enemy.y + enemy.h / 2;
    if (tick >= explosionTicks && enemy.destroyShowScore !== false) {
      return {
        kind: "score",
        tick,
        text: String(enemy.score),
        x: Math.round(centerX - 8),
        y: Math.round(centerY - 8)
      };
    }
    const explosionTick = tick >= explosionTicks ? 0 : tick;
    const referenceFrame = Math.min(
      ENEMY_DESTRUCTION_REFERENCE_PHASES.length - 1,
      Math.floor((explosionTick * ENEMY_DESTRUCTION_REFERENCE_PHASES.length) / explosionTicks)
    );
    const phase = ENEMY_DESTRUCTION_REFERENCE_PHASES[referenceFrame];
    return {
      kind: "explosion",
      tick,
      referenceFrame,
      ...destructionExplosionGeometry(phase, centerX, centerY)
    };
  }

  /** Maps a configurable visible lifetime onto the original 35-picture HQ sequence and tail. */
  function baseDestructionPresentation(timer, base, options) {
    const source = options || {};
    const layout = normalizeLayout(source.layout);
    const visibleFrames = Math.max(0, Math.floor(Number(source.visibleFrames) || 0));
    const tailFrames = Math.max(
      0,
      Math.floor(Number(source.tailFrames) || BASE_DESTRUCTION_TAIL_FRAMES)
    );
    const duration = visibleFrames + tailFrames;
    const remaining = clamp(Math.floor(Number(timer) || 0), 0, duration);
    const elapsed = duration - remaining;
    if (elapsed <= 0 || elapsed > visibleFrames) return null;
    const frame = elapsed - 1;
    const referenceFrame = visibleFrames <= 1
      ? 0
      : Math.round((frame * (BASE_DESTRUCTION_REFERENCE_PHASES.length - 1)) / (visibleFrames - 1));
    const phase = BASE_DESTRUCTION_REFERENCE_PHASES[referenceFrame];
    const centerX = layout.x + base.x + base.w / 2;
    const centerY = layout.y + base.y + base.h / 2;
    return {
      frame,
      referenceFrame,
      ...destructionExplosionGeometry(phase, centerX, centerY)
    };
  }

  function tankDestructionPresentation(explosion, layoutValue) {
    const layout = normalizeLayout(layoutValue);
    const phases = explosion.style === "playerDestroy"
      ? PLAYER_DESTRUCTION_REFERENCE_PHASES
      : ENEMY_DESTRUCTION_REFERENCE_PHASES;
    const visibleFrames = Math.max(1, Math.floor(Number(explosion.max) || 1));
    const elapsed = clamp(visibleFrames - Math.floor(Number(explosion.ttl) || 0), 0, visibleFrames - 1);
    const referenceFrame = Math.min(phases.length - 1, Math.floor((elapsed * phases.length) / visibleFrames));
    return {
      frame: elapsed,
      referenceFrame,
      ...destructionExplosionGeometry(
        phases[referenceFrame],
        layout.x + explosion.x,
        layout.y + explosion.y
      )
    };
  }

  function explosionPresentation(explosion, layoutValue) {
    const layout = normalizeLayout(layoutValue);
    const elapsed = Math.max(0, explosion.max - explosion.ttl);
    let phase = null;
    let size;
    if (explosion.style === "bulletImpact") {
      phase = Math.min(2, Math.floor((elapsed * 3) / Math.max(1, explosion.max)));
      size = BULLET_IMPACT_PHASE_SIZES[phase];
    } else {
      const age = 1 - explosion.ttl / explosion.max;
      size = 3 + Math.floor(age * 13);
    }
    return {
      phase,
      size,
      x: Math.round(layout.x + explosion.x - size / 2),
      y: Math.round(layout.y + explosion.y - size / 2)
    };
  }

  function scorePopupPresentation(popup, layoutValue) {
    const layout = normalizeLayout(layoutValue);
    const text = String(popup.value);
    const fixed = popup.style === "powerUp";
    const advance = fixed ? 5 : 6;
    const width = text.length * advance;
    const age = fixed ? 0 : 1 - popup.ttl / popup.max;
    return {
      text,
      width,
      advance,
      x: clamp(Math.round(layout.x + popup.x - width / 2), layout.x, layout.x + layout.width - width),
      y: clamp(
        Math.round(layout.y + popup.y - (fixed ? 4 : 7 + age * 6)),
        layout.y,
        layout.y + layout.height - 7
      ),
      color: fixed ? "#f7f1c6" : popup.ttl % 10 < 5 ? "#f7f1c6" : "#e0b84b"
    };
  }

  return Object.freeze({
    BASE_DESTRUCTION_REFERENCE_PHASES,
    BASE_DESTRUCTION_TAIL_FRAMES,
    BULLET_IMPACT_PHASE_SIZES,
    ENEMY_DESTRUCTION_REFERENCE_PHASES,
    PLAYER_DESTRUCTION_REFERENCE_PHASES,
    baseDestructionPresentation,
    destructionExplosionGeometry,
    enemyDestructionPresentation,
    explosionPresentation,
    isTankDestructionStyle,
    playerDestructionPresentation,
    scorePopupPresentation,
    tankDestructionPresentation
  });
});
