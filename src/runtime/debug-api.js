(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.debugApi = api;
})(typeof window !== "undefined" ? window : globalThis, function () {

  function setupDebugApi(state, deps) {
    // State aliases
    var game = state.game;

    // Audio state aliases

    // Deps aliases (all non-function properties from module-deps)
    var depsAliases = '';
    for (var key in deps) {
      if (deps.hasOwnProperty(key) && typeof deps[key] !== 'function' && key !== 'sharedState') {
        depsAliases += 'var ' + key + ' = deps["' + key.replace(/"/g, '\\"') + '"];';
      }
    }
    eval(depsAliases);

    // CamelCase renames for debug probes (used alongside UPPER_CASE aliases)
    var powerTypes = deps.POWER_UP_TYPES;
    var originalPowerUpRandomTable = deps.ORIGINAL_POWER_UP_RANDOM_TABLE;

    // sharedState property aliases (TILE, SCREEN_W, etc.)
    var shAliases = '';
    var sh = deps.sharedState;
    for (var shKey in sh) {
      if (sh.hasOwnProperty(shKey) && typeof sh[shKey] !== 'function') {
        shAliases += 'var ' + shKey + ' = sh["' + shKey.replace(/"/g, '\\"') + '"];';
      }
    }
    eval(shAliases);

    // Deps function aliases (for functions like clamp, cloneGrid, etc.)
    // Skip functions that already have state.fn versions (manual aliases)
    for (var key2 in deps) {
      if (deps.hasOwnProperty(key2) && typeof deps[key2] === 'function' && key2 !== 'requireRuntimeModule' && !state.fn.hasOwnProperty(key2)) {
        depsAliases += 'function ' + key2 + '() { return deps["' + key2.replace(/"/g, '\\"') + '"].apply(deps, arguments); }';
      }
    }
    eval(depsAliases);

    // Stage-runtime function aliases (from state.stageRuntime)
    var stageAliases = '';
    var sr = state.stageRuntime;
    if (sr) {
      for (var srKey in sr) {
        if (sr.hasOwnProperty(srKey) && typeof sr[srKey] === 'function') {
          stageAliases += 'function ' + srKey + '() { return sr["' + srKey.replace(/"/g, '\\"') + '"].apply(sr, arguments); }';
        }
      }
    }
    eval(stageAliases);

    // Function aliases (delegate to state.fn)
    function render() { return state.fn.render.apply(state.fn, arguments); }
    function gameSettings() { return state.fn.gameSettings.apply(state.fn, arguments); }
    function enemyTypeDefinitions() { return state.fn.enemyTypeDefinitions.apply(state.fn, arguments); }
    function makeGrid() { return state.fn.makeGrid.apply(state.fn, arguments); }
    function cloneGrid() { return state.fn.cloneGrid.apply(state.fn, arguments); }
    function loadStagePackJsonText() { return state.fn.loadStagePackJsonText.apply(state.fn, arguments); }
    function loadStagePackObject() { return state.fn.loadStagePackObject.apply(state.fn, arguments); }
    function hitTerrain() { return state.fn.hitTerrain.apply(state.fn, arguments); }
    function spawnEnemies() { return state.fn.spawnEnemies.apply(state.fn, arguments); }
    function rectHitsSolidTerrain() { return state.fn.rectHitsSolidTerrain.apply(state.fn, arguments); }
    function solidTerrainOverlapArea() { return state.fn.solidTerrainOverlapArea.apply(state.fn, arguments); }
    function drawBrickCell() { return state.fn.drawBrickCell.apply(state.fn, arguments); }
    function drawTank() { return state.fn.drawTank.apply(state.fn, arguments); }
    function scorePopupPresentation() { return state.fn.scorePopupPresentation.apply(state.fn, arguments); }
    function panelEnemyCounterRemaining() { return state.fn.panelEnemyCounterRemaining.apply(state.fn, arguments); }
    function panelLifeCount() { return state.fn.panelLifeCount.apply(state.fn, arguments); }
      window.TankDefender8 = {
        loadStagePack(pack) {
          return loadStagePackObject(pack).ok;
        },
        loadStagePackJson(text) {
          return loadStagePackJsonText(text);
        },
        validateStagePack(pack) {
          const result = tryNormalizeStagePack(pack);
          return { ok: result.ok, error: result.error };
        },
        ...createAudioDiagnostics(state, deps),
        spriteManifest() {
          return cloneSpriteManifest();
        },
        currentPackInfo() {
          return createCurrentPackInfo(game, state.stageRuntime);
        },
        ...createPauseDiagnostics(state, deps),
        ...createScreenFlowDiagnostics(state, deps),
        debugSnapshot() {
          return createDebugSnapshot(state);
        },
        ...createWallDiagnostics(state, deps),
        ...createEnemyDiagnostics(state, deps),
        ...createTimerDiagnostics(state, deps),
        debugEnemySpawnOverlapProbe() {
          const previous = {
            stage: game.stage,
            playerCount: game.playerCount,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn
          };
          try {
            game.stage = 1;
            game.playerCount = 1;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            const spec = getEnemySpec(game.stage, 0);
            const point = enemySpawnPoint(spec.spawnIndex);
            const blocker = {
              kind: "enemy",
              id: 200,
              slotIndex: 2,
              x: point.x,
              y: point.y,
              w: 14,
              h: 14,
              alive: true,
              respawn: 0,
              spawnFlash: gameSettings().timings.enemySpawnFlash
            };
            game.players = [];
            game.enemies = [blocker];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = 0;
            spawnEnemies();
            const blocked = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              retry: game.nextSpawn
            };
            blocker.x = HALF * 2;
            blocker.y = HALF * 2;
            for (let frame = 0; frame < gameSettings().timings.enemySpawnRetry; frame += 1) spawnEnemies();
            const beforeRetry = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              retry: game.nextSpawn
            };
            spawnEnemies();
            const spawnedEnemy = game.enemies.find((enemy) => enemy !== blocker);
            return {
              blocked,
              beforeRetry,
              afterRetry: {
                enemyCount: game.enemies.length,
                enemySpawned: game.enemySpawned,
                enemyOverlap: Boolean(spawnedEnemy && rectsOverlap(blocker, spawnedEnemy))
              },
              spawnIndex: spec.spawnIndex,
              enemyPosition: spawnedEnemy ? { x: spawnedEnemy.x, y: spawnedEnemy.y } : null
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        ...createPowerUpDiagnostics(state, deps),
        ...createScoreDiagnostics(state, deps),
        ...createUpgradeDiagnostics(state, deps),
        ...createPlayerLifecycleDiagnostics(state, deps),
        ...createCombatDiagnostics(state, deps),
        ...createPlayerMovementDiagnostics(state, deps),
        ...createTerrainDiagnostics(state, deps),
        ...createEffectDiagnostics(state, deps),
        debugEnemyPanelCounterProbe(spawned, killed, total) {
          const spawnedCount = Math.max(0, Math.floor(Number(spawned) || 0));
          const killedCount = Math.max(0, Math.floor(Number(killed) || 0));
          const totalCount = total === undefined ? DEFAULT_ENEMY_TOTAL : Math.max(0, Math.floor(Number(total) || 0));
          return {
            spawned: spawnedCount,
            killed: killedCount,
            remaining: panelEnemyCounterRemaining(totalCount, spawnedCount)
          };
        },
        debugPanelLifeCountProbe(lives) {
          const internalLives = Math.max(0, Math.floor(Number(lives) || 0));
          return {
            internalLives,
            panelLives: panelLifeCount({ lives: internalLives })
          };
        },
        ...createStageFlowDiagnostics(state, deps),
        ...createStageResultDiagnostics({
          getGameSettings: gameSettings,
          getEnemyTypes: enemyTypeDefinitions,
          getStageClearElapsed: () => game.stageClearElapsed,
          getStageClearBonusAwarded: () => game.stageClearBonusAwarded
        }),
        stagePackSchema() {
          return createStagePackSchema();
        }
      };

  }

  return { setupDebugApi: setupDebugApi };
});
