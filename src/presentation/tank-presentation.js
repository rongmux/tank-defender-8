(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const directions = isCommonJs ? require("../core/directions") : browserModules.directions;
  const geometry = isCommonJs ? require("../core/geometry") : browserModules.geometry;
  const timingSettings = isCommonJs ? require("../config/timing-settings") : browserModules.timingSettings;
  if (!directions) throw new Error("directions module must load before tank-presentation.js");
  if (!geometry) throw new Error("geometry module must load before tank-presentation.js");
  if (!timingSettings) throw new Error("timingSettings module must load before tank-presentation.js");

  const api = factory(directions, geometry, timingSettings);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.tankPresentation = api;
})(typeof window !== "undefined" ? window : globalThis, function (directions, geometry, timingSettings) {
  "use strict";

  const { DOWN, LEFT, RIGHT, UP } = directions;
  const { clamp } = geometry;
  const { SPAWN_ANIMATION_FRAMES } = timingSettings;
  const CARRIER_FLASH_COLOR = "#dd3d33";
  const CARRIER_FLASH_PHASE_FRAMES = 8;
  const PLAYER_UPGRADE_OVERLAY_COLORS = Object.freeze({
    level1: "#f7f1c6",
    level2: "#f8e08b",
    level3: "#dbe0ef"
  });
  const SPAWN_ANIMATION_CYCLE = 14;
  const SPAWN_PHASE_SIZES = Object.freeze([6, 8, 11, 14]);

  function directionName(direction) {
    if (direction === UP) return "up";
    if (direction === RIGHT) return "right";
    if (direction === DOWN) return "down";
    return "left";
  }

  function tankTrackFrameName(tank) {
    const orientation = tank.dir === UP || tank.dir === DOWN ? "vertical" : "horizontal";
    const phase = (Math.floor(Number(tank.trackPhase) || 0) & 1) === 0 ? "A" : "B";
    return `${orientation}${phase}`;
  }

  function playerUpgradeOverlayParts(level, direction) {
    const value = clamp(Math.floor(Number(level) || 0), 0, 3);
    const parts = [];
    if (value >= 1) {
      if (direction === UP) {
        parts.push({ role: "level1", rect: [6, 0, 2, 3] }, { role: "level1", rect: [5, 2, 4, 1] });
      } else if (direction === DOWN) {
        parts.push({ role: "level1", rect: [6, 11, 2, 3] }, { role: "level1", rect: [5, 11, 4, 1] });
      } else if (direction === LEFT) {
        parts.push({ role: "level1", rect: [0, 6, 3, 2] }, { role: "level1", rect: [2, 5, 1, 4] });
      } else {
        parts.push({ role: "level1", rect: [11, 6, 3, 2] }, { role: "level1", rect: [11, 5, 1, 4] });
      }
    }
    if (value >= 2) {
      parts.push(
        { role: "level2", rect: [0, 1, 2, 2] },
        { role: "level2", rect: [12, 1, 2, 2] },
        { role: "level2", rect: [0, 11, 2, 2] },
        { role: "level2", rect: [12, 11, 2, 2] }
      );
    }
    if (value >= 3) {
      if (direction === UP) {
        parts.push({ role: "level3", rect: [5, 0, 4, 1] }, { role: "level3", rect: [6, 1, 2, 2] });
      } else if (direction === DOWN) {
        parts.push({ role: "level3", rect: [5, 13, 4, 1] }, { role: "level3", rect: [6, 11, 2, 2] });
      } else if (direction === LEFT) {
        parts.push({ role: "level3", rect: [0, 5, 1, 4] }, { role: "level3", rect: [1, 6, 2, 2] });
      } else {
        parts.push({ role: "level3", rect: [13, 5, 1, 4] }, { role: "level3", rect: [11, 6, 2, 2] });
      }
    }
    return parts;
  }

  function tankPrimaryColor(tank, color, tick) {
    const frame = Math.max(0, Math.floor(Number(tick) || 0));
    return tank.carrier && Math.floor(frame / CARRIER_FLASH_PHASE_FRAMES) % 2 === 0
      ? CARRIER_FLASH_COLOR
      : color;
  }

  function isPlayerTankVisible(player, tick) {
    const frame = Math.max(0, Math.floor(Number(tick) || 0));
    return !(player.stun > 0 && (frame & CARRIER_FLASH_PHASE_FRAMES) !== 0);
  }

  function enemyColor(enemy) {
    if (enemy.hitColors && enemy.hitColors.length) {
      const index = clamp(Math.ceil(enemy.hp) - 1, 0, enemy.hitColors.length - 1);
      if (enemy.hitColors[index]) return enemy.hitColors[index];
    }
    return enemy.color;
  }

  function isPlayerShieldVisible(player, paused) {
    return player.invuln > 0 && !paused;
  }

  function shieldColorForTick(tick) {
    const frame = Math.max(0, Math.floor(Number(tick) || 0));
    return (frame & 2) === 0 ? "#78d9ff" : "#ffffff";
  }

  function spawnAnimationPresentation(remaining, total) {
    const duration = Math.max(1, Math.floor(Number(total) || SPAWN_ANIMATION_FRAMES));
    const elapsed = Math.max(0, duration - Math.max(1, Math.floor(Number(remaining) || 1)));
    const low = elapsed % SPAWN_ANIMATION_CYCLE;
    const phase = Math.floor(Math.abs(low - 7) / 2);
    return { elapsed, low, phase, size: SPAWN_PHASE_SIZES[phase] };
  }

  return Object.freeze({
    CARRIER_FLASH_COLOR,
    CARRIER_FLASH_PHASE_FRAMES,
    PLAYER_UPGRADE_OVERLAY_COLORS,
    SPAWN_ANIMATION_CYCLE,
    SPAWN_PHASE_SIZES,
    directionName,
    enemyColor,
    isPlayerShieldVisible,
    isPlayerTankVisible,
    playerUpgradeOverlayParts,
    shieldColorForTick,
    spawnAnimationPresentation,
    tankPrimaryColor,
    tankTrackFrameName
  });
});
