(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerMovementDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Preserves each legacy adapter's receiver while building an explicit probe scope. */
  function bindFunctions(source) {
    if (!source || typeof source !== "object") return {};
    return Object.fromEntries(
      Object.entries(source)
        .filter((entry) => typeof entry[1] === "function")
        .map((entry) => [entry[0], entry[1].bind(source)])
    );
  }

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.keys || typeof state.keys !== "object") {
      throw new Error("state.keys must be an object");
    }
    if (!state.audio || typeof state.audio !== "object") {
      throw new Error("state.audio must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  function createRuntimeScope(state, deps) {
    requireInputs(state, deps);
    return {
      ...deps,
      ...deps.sharedState,
      ...bindFunctions(deps),
      ...bindFunctions(state.stageRuntime),
      ...bindFunctions(state.fn),
      game: state.game,
      keys: state.keys,
      movementIceAudio: state.audio.movementIce,
      playerShootAudio: state.audio.playerShoot
    };
  }

  /** Composes movement-state, input/recovery, and terrain-layer probes. */
  function createPlayerMovementDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      FOREST,
      GRID,
      ICE,
      POWERUP_SIZE,
      RIGHT,
      STEEL,
      TILE,
      createPlayer,
      createPlayerMovementInputDiagnostics,
      createPlayerMovementMotionDiagnostics,
      game,
      gameSettings,
      makeCell,
      makeGrid,
      movementIceAudio,
      powerUpVisualRect,
      renderGame,
      setTile,
      stopMovementIceAudio,
      syncMovementIceAudioNodes,
      updatePlayerMovement
    } = scope;

    return Object.freeze({
      ...createPlayerMovementMotionDiagnostics(scope),
      ...createPlayerMovementInputDiagnostics(scope),
      debugIceMovementProbe() {
        const previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          powerUp: game.powerUp,
          playerCount: game.playerCount
        };
        const previousMovementIce = {
          active: movementIceAudio.active,
          frame: movementIceAudio.frame
        };
        const makePlayer = (x, y, dir, slide) => {
          const player = createPlayer(1);
          player.x = x;
          player.y = y;
          player.spawnX = x;
          player.spawnY = y;
          player.dir = dir;
          player.alive = true;
          player.respawn = 0;
          player.spawnFlash = 0;
          player.invuln = 0;
          player.stun = 0;
          player.reload = 0;
          player.slide = slide;
          player.pendingSnap = false;
          return player;
        };
        const iceGrid = () => Array.from(
          { length: GRID },
          () => Array.from({ length: GRID }, () => makeCell(ICE, 0))
        );

        try {
          stopMovementIceAudio();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemies = [];
          game.bullets = [];
          game.powerUp = null;
          game.playerCount = 1;

          game.grid = iceGrid();
          const entry = makePlayer(32, 32, RIGHT, 0);
          game.players = [entry];
          updatePlayerMovement(entry, RIGHT);
          const afterEntry = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
          for (let tick = 0; tick < 13; tick += 1) updatePlayerMovement(entry, scope.LEFT);
          const afterForcedWindow = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
          updatePlayerMovement(entry, scope.DOWN);
          const afterControlReturns = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };

          const tail = makePlayer(64, 64, RIGHT, 15);
          game.players = [tail];
          const tailStartX = tail.x;
          for (let tick = 0; tick < 15; tick += 1) updatePlayerMovement(tail, -1);
          const tailResult = { distance: tail.x - tailStartX, slide: tail.slide };

          game.grid = makeGrid();
          const offIce = makePlayer(64, 64, RIGHT, 10);
          game.players = [offIce];
          updatePlayerMovement(offIce, -1);
          const offIceResult = { x: offIce.x, slide: offIce.slide };
          setTile(game.grid, 4, 4, ICE, 0);
          updatePlayerMovement(offIce, -1);
          const reentered = { x: offIce.x, slide: offIce.slide };

          game.grid = makeGrid();
          setTile(game.grid, 2, 2, ICE, 0);
          setTile(game.grid, 3, 2, STEEL, 15);
          const blocked = makePlayer(34, 32, RIGHT, 5);
          game.players = [blocked];
          updatePlayerMovement(blocked, -1);
          const blockedResult = { x: blocked.x, slide: blocked.slide };

          game.grid = iceGrid();
          const stunned = makePlayer(32, 32, RIGHT, 3);
          stunned.stun = 5;
          game.players = [stunned];
          updatePlayerMovement(stunned, -1, true);
          const stunnedResult = { x: stunned.x, dir: stunned.dir, slide: stunned.slide };

          return {
            configuredTicks: gameSettings().playerMovement.iceSlideFrames,
            configuredSpeed: gameSettings().playerMovement.iceSlideSpeed,
            afterEntry,
            afterForcedWindow,
            afterControlReturns,
            tailResult,
            offIceResult,
            reentered,
            blockedResult,
            stunnedResult
          };
        } finally {
          stopMovementIceAudio();
          Object.assign(game, previous);
          movementIceAudio.active = previousMovementIce.active;
          movementIceAudio.frame = previousMovementIce.frame;
          syncMovementIceAudioNodes();
        }
      },
      debugIceCoverRenderProbe() {
        const previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          powerUp: game.powerUp,
          playerCount: game.playerCount
        };
        const grid = makeGrid();
        setTile(grid, 6, 6, ICE, 0);
        game.grid = grid;
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [];
        game.enemies = [];
        game.bullets = [{ x: 6 * TILE + 6, y: 6 * TILE + 6, w: 4, h: 4, ownerKind: "player" }];
        game.powerUp = null;
        game.playerCount = 1;
        renderGame();
        Object.assign(game, previous);
        return {
          bulletColor: "#f8e08b",
          iceCoverColor: "rgba(241, 248, 255, 0.72)"
        };
      },
      debugForestPowerUpLayerProbe() {
        const previous = {
          grid: game.grid,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          powerUp: game.powerUp,
          playerCount: game.playerCount,
          tick: game.tick
        };
        const grid = makeGrid();
        setTile(grid, 6, 6, FOREST, 0);
        const power = {
          type: "star",
          x: 6 * TILE + 2,
          y: 6 * TILE + 2,
          w: POWERUP_SIZE,
          h: POWERUP_SIZE,
          ttl: 0
        };
        try {
          game.grid = grid;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [];
          game.enemies = [];
          game.bullets = [{ x: 6 * TILE + 6, y: 6 * TILE + 6, w: 4, h: 4, ownerKind: "player" }];
          game.powerUp = power;
          game.playerCount = 1;
          game.tick = 8;
          renderGame();
          return {
            forestColor: "#315b34",
            bulletColor: "#f8e08b",
            powerFrameColor: "#102748",
            powerRect: powerUpVisualRect(power)
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({ createPlayerMovementDiagnostics });
});
