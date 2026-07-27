(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.tankMovementRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  /** Registers fixed-frame tank movement and occupancy checks on state.fn. */
  function setupTankMovementRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var shared = deps.sharedState;
    var fn = state.fn;

    function moveTank(tank, dx, dy) {
      var nx = tank.x + dx;
      var ny = tank.y + dy;
      if (!canTankOccupy(tank, nx, ny)) return false;
      tank.x = nx;
      tank.y = ny;
      return true;
    }

    function advanceTankTracks(tank) {
      tank.trackPhase = ((Math.floor(Number(tank.trackPhase) || 0) & 1) ^ 1);
    }

    function canTankOccupy(tank, x, y) {
      return deps.canTankOccupyRect(deps.entityRect(tank), deps.entityRect(tank, x, y), {
        fieldWidth: shared.FIELD_W,
        fieldHeight: shared.FIELD_H,
        base: game.base,
        baseAlive: game.base.alive,
        terrainOverlapArea: solidTerrainOverlapArea,
        peers: activeTankCollisionPeers(tank)
      });
    }

    function activeTankCollisionPeers(tank) {
      return deps.filterActiveTankCollisionPeers(tank, game.players.concat(game.enemies));
    }

    function totalTankOverlapArea(tank, rect) {
      return deps.totalRectOverlapArea(rect, activeTankCollisionPeers(tank));
    }

    function rectHitsSolidTerrain(rect) {
      return deps.rectHitsSolidTerrain(rect, game.grid);
    }

    function solidTerrainOverlapArea(rect) {
      return deps.solidTerrainOverlapArea(rect, game.grid);
    }

    function isTankOnIce(tank) {
      var cx = deps.clamp(Math.floor((tank.x + tank.w / 2) / shared.TILE), 0, shared.GRID - 1);
      var cy = deps.clamp(Math.floor((tank.y + tank.h / 2) / shared.TILE), 0, shared.GRID - 1);
      return game.grid[cy][cx].type === deps.ICE;
    }

    function snapForDirection(tank) {
      var x = Math.floor((tank.x + 4) / shared.HALF) * shared.HALF;
      var y = Math.floor((tank.y + 4) / shared.HALF) * shared.HALF;
      if (!canTankOccupy(tank, x, y)) return false;
      tank.x = x;
      tank.y = y;
      return true;
    }

    function isPerpendicularTurn(fromDir, toDir) {
      return fromDir !== toDir && (fromDir ^ 2) !== toDir;
    }

    var api = {
      moveTank: moveTank,
      advanceTankTracks: advanceTankTracks,
      canTankOccupy: canTankOccupy,
      activeTankCollisionPeers: activeTankCollisionPeers,
      totalTankOverlapArea: totalTankOverlapArea,
      rectHitsSolidTerrain: rectHitsSolidTerrain,
      solidTerrainOverlapArea: solidTerrainOverlapArea,
      isTankOnIce: isTankOnIce,
      snapForDirection: snapForDirection,
      isPerpendicularTurn: isPerpendicularTurn
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTankMovementRuntime: setupTankMovementRuntime });
});
