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

  /** Binds fixed-loop movement, recovery, input, and terrain-layer probes. */
  function createPlayerMovementDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      BRICK,
      DOWN,
      FIELD_W,
      FIELD_X,
      FIELD_Y,
      FOREST,
      GRID,
      HALF,
      ICE,
      LEFT,
      POWERUP_SIZE,
      RIGHT,
      STEEL,
      TILE,
      UP,
      createPlayer,
      drawTank,
      entityRect,
      game,
      gameSettings,
      hitTank,
      isPlayerMovementFrame,
      isPlayerTankVisible,
      makeCell,
      makeGrid,
      movementIceAudio,
      playerShootAudio,
      powerUpVisualRect,
      quarterMaskFromBrickFragments,
      renderGame,
      setTile,
      shoot,
      solidTerrainOverlapArea,
      stopMovementIceAudio,
      stopPlayerShootAudio,
      syncMovementIceAudioNodes,
      syncPlayerShootAudioNodes,
      tankTrackFrameName,
      updateEnemyMovement,
      updatePlayerMovement,
      updatePlayers,
      keys
    } = scope;

    return Object.freeze({
        debugPlayerMovementCadenceProbe() {
          const previousTick = game.tick;
          try {
            const frames = [];
            for (let tick = 0; tick < 8; tick += 1) {
              game.tick = tick;
              frames.push({ tick, active: isPlayerMovementFrame(tick) });
            }
            return {
              speed: gameSettings().playerMovement.speed,
              cadence: gameSettings().playerMovement.frameCadence.slice(),
              frames,
              activeFrames: frames.filter((frame) => frame.active).length,
              distanceOverEightFrames: frames.filter((frame) => frame.active).length * gameSettings().playerMovement.speed
            };
          } finally {
            game.tick = previousTick;
          }
        },
        debugTankTrackAnimationProbe() {
          const previous = {
            tick: game.tick,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          try {
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];

            const player = createPlayer(1);
            Object.assign(player, {
              x: 32,
              y: 32,
              dir: RIGHT,
              alive: true,
              respawn: 0,
              spawnFlash: 0,
              invuln: 0,
              stun: 0,
              slide: 0,
              trackPhase: 0
            });
            game.players = [player];
            const playerInitial = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };
            updatePlayerMovement(player, RIGHT);
            const playerMoved = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };
            player.x = 0;
            player.dir = LEFT;
            updatePlayerMovement(player, LEFT);
            const playerBlocked = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };
            updatePlayerMovement(player, -1);
            const playerIdle = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };

            setTile(game.grid, 2, 2, ICE, 15);
            Object.assign(player, { x: 32, y: 32, dir: RIGHT, slide: 2, trackPhase: 0 });
            updatePlayerMovement(player, -1);
            const playerIceCoast = {
              x: player.x,
              slide: player.slide,
              phase: player.trackPhase,
              frame: tankTrackFrameName(player)
            };

            game.players = [];
            const enemy = {
              kind: "enemy",
              id: 100,
              slotIndex: 2,
              x: 32,
              y: 48,
              w: 14,
              h: 14,
              dir: RIGHT,
              speed: 1,
              alternateMovement: false,
              blockedPauseTicks: 0,
              pendingTurn: false,
              trackPhase: 0,
              alive: true
            };
            game.enemies = [enemy];
            updateEnemyMovement(enemy, () => 1 / 256);
            const enemyMoved = { x: enemy.x, phase: enemy.trackPhase, frame: tankTrackFrameName(enemy) };
            Object.assign(enemy, { x: FIELD_W - enemy.w, dir: RIGHT, blockedPauseTicks: 0, pendingTurn: false });
            updateEnemyMovement(enemy, () => 1 / 256);
            const enemyBlocked = {
              x: enemy.x,
              phase: enemy.trackPhase,
              frame: tankTrackFrameName(enemy),
              blockedPauseTicks: enemy.blockedPauseTicks
            };
            const renderedTank = {
              kind: "enemy",
              x: 0,
              y: 0,
              dir: UP,
              trackPhase: 1
            };
            drawTank(renderedTank, "#e3c64e", "#fff0a8");

            return {
              player: {
                initial: playerInitial,
                moved: playerMoved,
                blocked: playerBlocked,
                idle: playerIdle,
                iceCoast: playerIceCoast
              },
              enemy: { moved: enemyMoved, blocked: enemyBlocked },
              render: {
                x: FIELD_X,
                y: FIELD_Y,
                frame: tankTrackFrameName(renderedTank),
                primary: "#e3c64e",
                shadow: "#111111"
              },
              frames: [
                tankTrackFrameName({ dir: UP, trackPhase: 0 }),
                tankTrackFrameName({ dir: UP, trackPhase: 1 }),
                tankTrackFrameName({ dir: LEFT, trackPhase: 0 }),
                tankTrackFrameName({ dir: LEFT, trackPhase: 1 })
              ]
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugFriendlyFireDurationProbe() {
          let remaining = gameSettings().friendlyFire.stunFrames;
          let displayFrames = 0;
          while (remaining > 0 && displayFrames < 10000) {
            displayFrames += 1;
            if (isPlayerMovementFrame(displayFrames)) remaining -= 1;
          }
          return {
            stunTicks: gameSettings().friendlyFire.stunFrames,
            displayFrames,
            remaining,
            visibility: [0, 7, 8, 15, 16].map((tick) => ({
              tick,
              visible: isPlayerTankVisible({ stun: 1 }, tick)
            }))
          };
        },
        debugFriendlyFireRefreshProbe() {
          const previous = {
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions
          };
          const target = {
            kind: "player",
            id: 1,
            x: 32,
            y: 32,
            w: 14,
            h: 14,
            alive: true,
            spawnFlash: 0,
            stun: 37
          };
          try {
            game.players = [target];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            const bullet = {
              x: target.x + 2,
              y: target.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              ownerKind: "player",
              ownerId: 2,
              ownerKey: "player:2",
              remove: false
            };
            hitTank(bullet);
            return { before: 37, after: target.stun, bulletRemoved: bullet.remove };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPlayerStunProbe() {
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const player = {
            kind: "player",
            id: 1,
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            stun: gameSettings().friendlyFire.stunFrames || 1,
            slide: gameSettings().playerMovement.iceSlideFrames,
            pendingSnap: false,
            alive: true,
            reload: 0,
            spawnFlash: 0,
            level: 0
          };
          const before = { x: player.x, y: player.y, dir: player.dir, slide: player.slide };
          updatePlayerMovement(player, RIGHT);
          const previousBullets = game.bullets;
          game.bullets = [];
          stopPlayerShootAudio();
          shoot(player);
          const fired = game.bullets.length === 1;
          game.bullets = previousBullets;
          const result = {
            before,
            after: { x: player.x, y: player.y, dir: player.dir, slide: player.slide, pendingSnap: player.pendingSnap },
            turned: player.dir === RIGHT,
            moved: player.x !== before.x || player.y !== before.y,
            fired
          };
          stopPlayerShootAudio();
          playerShootAudio.active = previousPlayerShoot.active;
          playerShootAudio.frame = previousPlayerShoot.frame;
          syncPlayerShootAudioNodes();
          syncMovementIceAudioNodes();
          return result;
        },
        debugWasdDirectionProbe() {
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
          const previousKeys = Array.from(keys);
          const makeReadyPlayer = (id, x, y) => {
            const player = createPlayer(id);
            player.x = x;
            player.y = y;
            player.spawnX = x;
            player.spawnY = y;
            player.dir = UP;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.reload = 0;
            player.slide = 0;
            player.pendingSnap = false;
            return player;
          };

          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.bullets = [];
            game.powerUp = null;
            game.tick = 1;

            keys.clear();
            game.playerCount = 1;
            const singlePlayer = makeReadyPlayer(1, 32, 32);
            game.players = [singlePlayer];
            const singleBefore = { x: singlePlayer.x, y: singlePlayer.y, dir: singlePlayer.dir };
            keys.add("KeyD");
            updatePlayers();
            const singleAfter = { x: singlePlayer.x, y: singlePlayer.y, dir: singlePlayer.dir };

            keys.clear();
            game.playerCount = 2;
            const p1 = makeReadyPlayer(1, 32, 32);
            const p2 = makeReadyPlayer(2, 80, 32);
            game.players = [p1, p2];
            const twoBefore = {
              p1: { x: p1.x, y: p1.y, dir: p1.dir },
              p2: { x: p2.x, y: p2.y, dir: p2.dir }
            };
            keys.add("KeyD");
            updatePlayers();
            const twoAfter = {
              p1: { x: p1.x, y: p1.y, dir: p1.dir },
              p2: { x: p2.x, y: p2.y, dir: p2.dir }
            };

            return {
              singleBefore,
              singleAfter,
              twoBefore,
              twoAfter
            };
          } finally {
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            Object.assign(game, previous);
          }
        },
        debugPlayerTurnAlignmentProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makePlayer = (dir) => {
            const player = createPlayer(1);
            player.x = 67;
            player.y = 70;
            player.dir = dir;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.slide = 0;
            player.pendingSnap = false;
            return player;
          };
          const run = (fromDir, toDir) => {
            const player = makePlayer(fromDir);
            game.players = [player];
            updatePlayerMovement(player, toDir);
            return { x: player.x, y: player.y, dir: player.dir, pendingSnap: player.pendingSnap };
          };

          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            return {
              perpendicular: run(RIGHT, DOWN),
              reverse: run(RIGHT, LEFT),
              same: run(RIGHT, RIGHT),
              gridSize: HALF
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPlayerBrickRecoveryProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makePlayer = (x, y, dir) => {
            const player = createPlayer(1);
            player.x = x;
            player.y = y;
            player.dir = dir;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.slide = 0;
            player.pendingSnap = false;
            return player;
          };

          try {
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];

            game.grid = makeGrid();
            const turnCell = makeCell(BRICK, 1);
            turnCell.brickMask = 1 << 1;
            turnCell.mask = quarterMaskFromBrickFragments(turnCell.brickMask);
            game.grid[5][5] = turnCell;
            const turningPlayer = makePlayer(69, 70, RIGHT);
            game.players = [turningPlayer];
            const turnBefore = {
              x: turningPlayer.x,
              y: turningPlayer.y,
              overlap: solidTerrainOverlapArea(entityRect(turningPlayer))
            };
            updatePlayerMovement(turningPlayer, DOWN);
            const turnAfter = {
              x: turningPlayer.x,
              y: turningPlayer.y,
              dir: turningPlayer.dir,
              overlap: solidTerrainOverlapArea(entityRect(turningPlayer))
            };

            game.grid = makeGrid();
            setTile(game.grid, 5, 11, BRICK, 15);
            const coveredPlayer = makePlayer(90, 177, RIGHT);
            game.players = [coveredPlayer];
            const overlapHistory = [solidTerrainOverlapArea(entityRect(coveredPlayer))];
            for (let step = 0; step < 6; step += 1) {
              updatePlayerMovement(coveredPlayer, RIGHT);
              overlapHistory.push(solidTerrainOverlapArea(entityRect(coveredPlayer)));
            }

            return {
              blockedTurnSnap: { before: turnBefore, after: turnAfter },
              restoredWallEscape: {
                x: coveredPlayer.x,
                y: coveredPlayer.y,
                overlapHistory
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
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
            for (let tick = 0; tick < 13; tick += 1) updatePlayerMovement(entry, LEFT);
            const afterForcedWindow = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
            updatePlayerMovement(entry, DOWN);
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
          const power = { type: "star", x: 6 * TILE + 2, y: 6 * TILE + 2, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
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
        },

    });
  }

  return Object.freeze({ createPlayerMovementDiagnostics });
});
