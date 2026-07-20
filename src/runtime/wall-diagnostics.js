(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.wallDiagnostics = api;
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
      brickHitAudio: state.audio.brickHit
    };
  }

  /** Binds wall damage, brick rendering, and shovel-wall probes. */
  function createWallDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      applyPowerUp,
      BRICK,
      brickHitAudio,
      buildBaseWall,
      cloneWallRules,
      damageWall,
      DOWN,
      drawBrickCell,
      FIELD_X,
      FIELD_Y,
      FULL_BRICK_FRAGMENT_MASK,
      game,
      gameSettings,
      HALF,
      hitTerrain,
      LEFT,
      makeCell,
      makeGrid,
      overlappedBrickFragments,
      rectHitsSolidTerrain,
      RIGHT,
      shovelWallTypeForTimer,
      STEEL,
      stopBrickHitAudio,
      syncBrickHitAudioNodes,
      TILE,
      tileTypeName,
      UP,
      WALL_FRAGMENT
    } = scope;

    return Object.freeze({
        debugSteelRuleProbe() {
          const blockedCell = makeCell(STEEL, 15);
          const blocked = damageWall(blockedCell, 0, 0, { power: 2, dir: UP }, 1 << 2);
          const cell = makeCell(STEEL, 15);
          const first = damageWall(cell, 0, 0, { power: 3, dir: UP }, 1 << 2);
          const afterFirst = { type: cell.type, mask: cell.mask, steelHits: cell.steelHits.slice() };
          const second = damageWall(cell, 0, 0, { power: 3, dir: UP }, 1 << 3);
          return {
            blocked,
            blockedMask: blockedCell.mask,
            first,
            afterFirst,
            second,
            afterSecond: { type: cell.type, mask: cell.mask, steelHits: cell.steelHits.slice() }
          };
        },
        debugBrickWallPowerProbe() {
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const normalCell = makeCell(BRICK, 15);
          const powerCell = makeCell(BRICK, 15);
          const powerTwoCell = makeCell(BRICK, 15);
          const normalMasks = [];
          const normalBrickMasks = [];
          for (const hitFragment of [0, 1, 2, 3]) {
            damageWall(normalCell, 0, 0, { power: 1, dir: RIGHT }, 1 << hitFragment);
            normalMasks.push(normalCell.mask);
            normalBrickMasks.push(normalCell.brickMask);
          }
          damageWall(powerCell, 0, 0, { power: 3, dir: RIGHT }, 1 << 0);
          damageWall(powerTwoCell, 0, 0, { power: 2, dir: RIGHT }, 1 << 0);

          const directionMasks = {};
          const directions = [
            ["up", UP, 12, 8],
            ["down", DOWN, 0, 4],
            ["left", LEFT, 3, 2],
            ["right", RIGHT, 0, 1]
          ];
          for (const [name, dir, firstHit, secondHit] of directions) {
            const cell = makeCell(BRICK, 15);
            damageWall(cell, 0, 0, { power: 1, dir }, 1 << firstHit);
            const first = cell.mask;
            const firstBrickMask = cell.brickMask;
            damageWall(cell, 0, 0, { power: 1, dir }, 1 << secondHit);
            directionMasks[name] = {
              first,
              firstBrickMask,
              firstRemovedFragments: FULL_BRICK_FRAGMENT_MASK ^ firstBrickMask,
              second: cell.mask,
              removedAfterTwo: 15 ^ cell.mask
            };
          }

          const collisionCell = makeCell(BRICK, 15);
          damageWall(collisionCell, 0, 0, { power: 1, dir: RIGHT }, 1 << 0);
          const removedStripHit = overlappedBrickFragments({ x: 0, y: 0, w: 4, h: 8 }, 0, 0, collisionCell);
          const remainingStripHit = overlappedBrickFragments({ x: 4, y: 0, w: 4, h: 8 }, 0, 0, collisionCell);
          const previousGrid = game.grid;
          const collisionGrid = makeGrid();
          collisionGrid[0][0] = collisionCell;
          let removedStripSolid;
          let remainingStripSolid;
          try {
            game.grid = collisionGrid;
            removedStripSolid = rectHitsSolidTerrain({ x: 0, y: 0, w: 4, h: 8 });
            remainingStripSolid = rectHitsSolidTerrain({ x: 4, y: 0, w: 4, h: 8 });
          } finally {
            game.grid = previousGrid;
          }

          const previousExplosions = game.explosions;
          const integrationGrid = makeGrid();
          integrationGrid[1][1] = makeCell(BRICK, 15);
          const integrationBullet = {
            x: TILE,
            y: TILE,
            w: WALL_FRAGMENT,
            h: WALL_FRAGMENT,
            dir: RIGHT,
            power: 1,
            ownerKind: "player",
            remove: false
          };
          let integration;
          try {
            stopBrickHitAudio();
            game.grid = integrationGrid;
            game.explosions = [];
            const hit = hitTerrain(integrationBullet);
            integration = {
              hit,
              bulletRemoved: integrationBullet.remove,
              mask: integrationGrid[1][1].mask,
              brickMask: integrationGrid[1][1].brickMask,
              explosions: game.explosions.length
            };
          } finally {
            stopBrickHitAudio();
            game.grid = previousGrid;
            game.explosions = previousExplosions;
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            syncBrickHitAudioNodes();
          }

          return {
            normalMasks,
            normalBrickMasks,
            normalTypeAfterFour: tileTypeName(normalCell.type),
            powerMask: powerCell.mask,
            powerBrickMask: powerCell.brickMask,
            powerTwoMask: powerTwoCell.mask,
            powerTwoBrickMask: powerTwoCell.brickMask,
            powerRemoved: 15 ^ powerCell.mask,
            directionMasks,
            removedStripHit,
            remainingStripHit,
            removedStripSolid,
            remainingStripSolid,
            integration,
            rules: cloneWallRules()
          };
        },
        debugBrickFragmentRenderProbe() {
          const cell = makeCell(BRICK, 15);
          damageWall(cell, 0, 0, { power: 1, dir: RIGHT }, 1 << 0);
          drawBrickCell(FIELD_X, FIELD_Y, cell);
          return {
            removed: { x: FIELD_X, y: FIELD_Y, w: WALL_FRAGMENT, h: HALF },
            remaining: { x: FIELD_X + WALL_FRAGMENT, y: FIELD_Y, w: WALL_FRAGMENT, h: HALF },
            mask: cell.mask,
            brickMask: cell.brickMask
          };
        },
        debugShovelWallProbe() {
          const durations = gameSettings().powerUpDurations;
          const grid = makeGrid();
          buildBaseWall(grid, STEEL);
          const cells = [
            [5, 11],
            [6, 11],
            [7, 11],
            [5, 12],
            [6, 12],
            [7, 12]
          ].map(([c, r]) => ({ c, r, type: tileTypeName(grid[r][c].type), mask: grid[r][c].mask }));
          const flashingTimer = Math.max(1, durations.shovelFlash - 1);
          const wallTypeForTimer = (timer, tick) => tileTypeName(
            shovelWallTypeForTimer(timer, tick, durations.shovelFlash)
          );
          return {
            durationUnits: durations.shovel,
            flashThreshold: durations.shovelFlash,
            protected: wallTypeForTimer(durations.shovelFlash, 0),
            flashA: wallTypeForTimer(flashingTimer, 0),
            flashB: wallTypeForTimer(flashingTimer, 16),
            expired: wallTypeForTimer(0, 0),
            cells
          };
        },
        debugShovelDestroyedBaseProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            shovelTimer: game.shovelTimer,
            scorePopups: game.scorePopups,
            highScore: game.highScore
          };
          const player = {
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            score: 0,
            nextBonusLifeIndex: 0,
            lives: 2
          };
          const wallTypes = () => [[5, 11], [6, 11], [7, 11], [5, 12], [7, 12]].map(([c, r]) => tileTypeName(game.grid[r][c].type));
          try {
            game.grid = makeGrid();
            buildBaseWall(game.grid, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
            game.shovelTimer = 0;
            game.scorePopups = [];
            applyPowerUp(player, "shovel");
            return {
              score: player.score,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              shovelTimer: game.shovelTimer,
              wallTypes: wallTypes(),
              popupCount: game.scorePopups.length
            };
          } finally {
            Object.assign(game, previous);
          }
        },
    });
  }

  return Object.freeze({ createWallDiagnostics });
});
