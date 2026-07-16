(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const directions = isCommonJs
    ? require("../core/directions")
    : (root.TankDefender8Modules || {}).directions;
  if (!directions) throw new Error("directions module must load before enemy-ai-rules.js");

  const api = factory(directions);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyAiRules = api;
})(typeof window !== "undefined" ? window : globalThis, function (directions) {
  "use strict";

  const { DOWN, LEFT, RIGHT, UP } = directions;
  const ENEMY_TURN_INTERSECTION_SIZE = 8;

  function enemyAiPhaseForInterval(interval, frameHigh) {
    const phaseCounter = Math.max(0, Math.floor(Number(frameHigh) || 0)) & 0xff;
    if (phaseCounter > Math.floor(interval / 4)) return "hq";
    if (phaseCounter > Math.floor(interval / 8)) return "player";
    return "random";
  }

  function isEnemyMovementFrame(enemy, frameLow) {
    if (!enemy.alternateMovement) return true;
    const slot = Number.isInteger(enemy.slotIndex) ? enemy.slotIndex : 2;
    return ((slot ^ frameLow) & 1) === 1;
  }

  function isEnemyAtTurnIntersection(enemy) {
    return Math.round(enemy.x + enemy.w / 2) % ENEMY_TURN_INTERSECTION_SIZE === 0
      && Math.round(enemy.y + enemy.h / 2) % ENEMY_TURN_INTERSECTION_SIZE === 0;
  }

  function targetableEnemyPlayers(players) {
    return players.filter((player) => player.alive);
  }

  /** Selects P2 for odd enemy slots and P1 for even slots, then falls back to P1. */
  function selectEnemyTargetPlayer(enemy, players) {
    const targetable = targetableEnemyPlayers(players);
    if (!targetable.length) return null;
    const slot = Number.isInteger(enemy.slotIndex) ? enemy.slotIndex : 2;
    const preferredId = slot & 1 ? 2 : 1;
    return targetable.find((player) => player.id === preferredId)
      || targetable.find((player) => player.id === 1)
      || targetable[0];
  }

  function directionTowardTarget(tank, target, horizontalFirst) {
    const dx = target.x - (tank.x + tank.w / 2);
    const dy = target.y - (tank.y + tank.h / 2);
    if (horizontalFirst) {
      if (dx < 0) return LEFT;
      if (dx > 0) return RIGHT;
      if (dy < 0) return UP;
      if (dy > 0) return DOWN;
      return UP;
    }
    if (dy < 0) return UP;
    if (dy > 0) return DOWN;
    if (dx < 0) return LEFT;
    if (dx > 0) return RIGHT;
    return UP;
  }

  function enemyAiChanceMatches(chance, byte) {
    if (chance === 1 / 16) return (byte & 0x0f) === 0;
    if (chance === 3 / 4) return (byte & 0x03) !== 0;
    if (chance === 1 / 2) return (byte & 0x01) !== 0;
    return byte / 256 < chance;
  }

  function shouldEnemyFireForByte(fireChance, defaultFireChance, byte) {
    if (fireChance === defaultFireChance) return (byte & 0x1f) === 0;
    return byte / 256 < fireChance;
  }

  return Object.freeze({
    ENEMY_TURN_INTERSECTION_SIZE,
    directionTowardTarget,
    enemyAiChanceMatches,
    enemyAiPhaseForInterval,
    isEnemyAtTurnIntersection,
    isEnemyMovementFrame,
    selectEnemyTargetPlayer,
    shouldEnemyFireForByte,
    targetableEnemyPlayers
  });
});
