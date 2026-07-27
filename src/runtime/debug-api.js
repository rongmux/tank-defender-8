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
    var audioCtx = state.audioCtx;
    var canvas = state.canvas;
    var ctx = state.ctx;
    var keys = state.keys;
    var pendingFirePresses = state.pendingFirePresses;
    var movementAudio = state.movementAudio;
    var packFileInput = state.packFileInput;
    var activeSequencedSounds = state.activeSequencedSounds;
    var noiseBufferCache = state.noiseBufferCache;

    // Audio state aliases
    var enemyDestroyAudio = state.audio.enemyDestroy;
    var playerDestroyAudio = state.audio.playerDestroy;
    var baseHitAudio = state.audio.baseHit;
    var brickHitAudio = state.audio.brickHit;
    var bonusLifeAudio = state.audio.bonusLife;
    var powerUpPickupAudio = state.audio.powerUpPickup;
    var pauseAudio = state.audio.pause;

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
    function update() { return state.fn.update.apply(state.fn, arguments); }
    function render() { return state.fn.render.apply(state.fn, arguments); }
    function createPlayer() { return state.fn.createPlayer.apply(state.fn, arguments); }
    function gameSettings() { return state.fn.gameSettings.apply(state.fn, arguments); }
    function enemyTypeDefinitions() { return state.fn.enemyTypeDefinitions.apply(state.fn, arguments); }
    function makeGrid() { return state.fn.makeGrid.apply(state.fn, arguments); }
    function setTile() { return state.fn.setTile.apply(state.fn, arguments); }
    function cloneGrid() { return state.fn.cloneGrid.apply(state.fn, arguments); }
    function syncMovementAudio() { return state.fn.syncMovementAudio.apply(state.fn, arguments); }
    function stopMovementAudio() { return state.fn.stopMovementAudio.apply(state.fn, arguments); }
    function stopBonusLifeAudio() { return state.fn.stopBonusLifeAudio.apply(state.fn, arguments); }
    function syncBonusLifeAudioNodes() { return state.fn.syncBonusLifeAudioNodes.apply(state.fn, arguments); }
    function stopPowerUpPickupAudio() { return state.fn.stopPowerUpPickupAudio.apply(state.fn, arguments); }
    function powerUpPickupAudioAudible() { return state.fn.powerUpPickupAudioAudible.apply(state.fn, arguments); }
    function syncPowerUpPickupAudioNodes() { return state.fn.syncPowerUpPickupAudioNodes.apply(state.fn, arguments); }
    function stopBrickHitAudio() { return state.fn.stopBrickHitAudio.apply(state.fn, arguments); }
    function syncBrickHitAudioNodes() { return state.fn.syncBrickHitAudioNodes.apply(state.fn, arguments); }
    function stopBaseHitAudio() { return state.fn.stopBaseHitAudio.apply(state.fn, arguments); }
    function syncBaseHitAudioNodes() { return state.fn.syncBaseHitAudioNodes.apply(state.fn, arguments); }
    function stopEnemyDestroyAudio() { return state.fn.stopEnemyDestroyAudio.apply(state.fn, arguments); }
    function syncEnemyDestroyAudioNodes() { return state.fn.syncEnemyDestroyAudioNodes.apply(state.fn, arguments); }
    function stopPlayerDestroyAudio() { return state.fn.stopPlayerDestroyAudio.apply(state.fn, arguments); }
    function syncPlayerDestroyAudioNodes() { return state.fn.syncPlayerDestroyAudioNodes.apply(state.fn, arguments); }
    function stopPauseAudio() { return state.fn.stopPauseAudio.apply(state.fn, arguments); }
    function syncPauseAudioNodes() { return state.fn.syncPauseAudioNodes.apply(state.fn, arguments); }
    function loadStagePackJsonText() { return state.fn.loadStagePackJsonText.apply(state.fn, arguments); }
    function loadStagePackObject() { return state.fn.loadStagePackObject.apply(state.fn, arguments); }
    function updatePlayers() { return state.fn.updatePlayers.apply(state.fn, arguments); }
    function updateEnemies() { return state.fn.updateEnemies.apply(state.fn, arguments); }
    function updateEnemyMovement() { return state.fn.updateEnemyMovement.apply(state.fn, arguments); }
    function resolveBullet() { return state.fn.resolveBullet.apply(state.fn, arguments); }
    function hitBase() { return state.fn.hitBase.apply(state.fn, arguments); }
    function hitTerrain() { return state.fn.hitTerrain.apply(state.fn, arguments); }
    function destroyEnemy() { return state.fn.destroyEnemy.apply(state.fn, arguments); }
    function addPlayerScore() { return state.fn.addPlayerScore.apply(state.fn, arguments); }
    function killPlayer() { return state.fn.killPlayer.apply(state.fn, arguments); }
    function finishPlayerDeath() { return state.fn.finishPlayerDeath.apply(state.fn, arguments); }
    function updatePlayerGameOverMessage() { return state.fn.updatePlayerGameOverMessage.apply(state.fn, arguments); }
    function collectPowerUp() { return state.fn.collectPowerUp.apply(state.fn, arguments); }
    function applyPowerUp() { return state.fn.applyPowerUp.apply(state.fn, arguments); }
    function spawnEnemies() { return state.fn.spawnEnemies.apply(state.fn, arguments); }
    function moveTank() { return state.fn.moveTank.apply(state.fn, arguments); }
    function canTankOccupy() { return state.fn.canTankOccupy.apply(state.fn, arguments); }
    function rectHitsSolidTerrain() { return state.fn.rectHitsSolidTerrain.apply(state.fn, arguments); }
    function solidTerrainOverlapArea() { return state.fn.solidTerrainOverlapArea.apply(state.fn, arguments); }
    function explosionRule() { return state.fn.explosionRule.apply(state.fn, arguments); }
    function baseDestructionDuration() { return state.fn.baseDestructionDuration.apply(state.fn, arguments); }
    function updateScorePopups() { return state.fn.updateScorePopups.apply(state.fn, arguments); }
    function checkEndState() { return state.fn.checkEndState.apply(state.fn, arguments); }
    function enterGameOver() { return state.fn.enterGameOver.apply(state.fn, arguments); }
    function renderGame() { return state.fn.renderGame.apply(state.fn, arguments); }
    function drawBrickCell() { return state.fn.drawBrickCell.apply(state.fn, arguments); }
    function drawTank() { return state.fn.drawTank.apply(state.fn, arguments); }
    function playerDestructionPresentation() { return state.fn.playerDestructionPresentation.apply(state.fn, arguments); }
    function enemyDestructionPresentation() { return state.fn.enemyDestructionPresentation.apply(state.fn, arguments); }
    function baseDestructionPresentation() { return state.fn.baseDestructionPresentation.apply(state.fn, arguments); }
    function scorePopupPresentation() { return state.fn.scorePopupPresentation.apply(state.fn, arguments); }
    function panelEnemyCounterRemaining() { return state.fn.panelEnemyCounterRemaining.apply(state.fn, arguments); }
    function panelLifeCount() { return state.fn.panelLifeCount.apply(state.fn, arguments); }
    function renderPlayerGameOverMessage() { return state.fn.renderPlayerGameOverMessage.apply(state.fn, arguments); }
    function playerGameOverMessagePresentation() { return state.fn.playerGameOverMessagePresentation.apply(state.fn, arguments); }
    function renderPause() { return state.fn.renderPause.apply(state.fn, arguments); }
    function pausePresentation() { return state.fn.pausePresentation.apply(state.fn, arguments); }
    function preparePausedDebugBattle() { return state.fn.preparePausedDebugBattle.apply(state.fn, arguments); }
    function isPauseInputCode() { return state.fn.isPauseInputCode.apply(state.fn, arguments); }
    function togglePause() { return state.fn.togglePause.apply(state.fn, arguments); }
    function tileTypeName() { return state.fn.tileTypeName.apply(state.fn, arguments); }
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
        debugPauseBehaviorProbe() {
          const previous = { ...game };
          const previousFirePresses = Array.from(pendingFirePresses);
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          try {
            stopPauseAudio();
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.pauseElapsed = 99;
            game.tick = 15;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [{ alive: true, lives: 1, respawn: 0 }];
            game.enemies = [];
            game.enemySpawned = 0;
            game.clearPendingTimer = 0;
            game.scorePopups = [];
            pendingFirePresses.clear();
            pendingFirePresses.add("Space");
    
            const entered = togglePause();
            const entry = {
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              pendingFirePresses: pendingFirePresses.size,
              pauseAudioActive: pauseAudio.active,
              pauseAudioFrame: pauseAudio.frame
            };
            update();
            const pausedUpdate = {
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              pauseAudioFrame: pauseAudio.frame
            };
            const exited = togglePause();
            const exit = {
              paused: game.paused,
              pauseAudioActive: pauseAudio.active,
              pauseAudioFrame: pauseAudio.frame
            };
    
            game.screen = "stageIntro";
            game.paused = false;
            game.demoMode = false;
            const stageIntroAccepted = togglePause();
            game.screen = "playing";
            game.demoMode = true;
            const demoAccepted = togglePause();
    
            return {
              entered,
              exited,
              entry,
              exit,
              pausedUpdate,
              stageIntroAccepted,
              demoAccepted,
              inputs: ["Enter", "KeyP", "Escape"].map((code) => ({ code, accepted: isPauseInputCode(code) })),
              frames: [15, 16, 31, 32].map(pausePresentation)
            };
          } finally {
            stopPauseAudio();
            pendingFirePresses.clear();
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            Object.assign(game, previous);
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugPausedStageEndProbe() {
          const previous = { ...game };
          const total = enemyTotal();
          const player = { alive: true, lives: 1, respawn: 0 };
          try {
            game.screen = "playing";
            game.demoMode = false;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.enemySpawned = Math.max(0, total - 1);
            game.clearPendingTimer = 0;
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = 41;
            game.scorePopups = [];
            update();
            const incomplete = {
              screen: game.screen,
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              tick: game.tick
            };
    
            game.screen = "playing";
            game.enemies = [{ alive: false }];
            game.enemySpawned = total;
            game.clearPendingTimer = 0;
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = 41;
            game.scorePopups = [];
            update();
            const detected = {
              screen: game.screen,
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              tick: game.tick,
              enemyCount: game.enemies.length,
              clearPendingTimer: game.clearPendingTimer
            };
            const pauseAcceptedDuringDelay = togglePause();
            return {
              delay: gameSettings().timings.stageClearDelay,
              incomplete,
              detected,
              pauseAcceptedDuringDelay
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderPauseFrame(frame) {
          const previous = {
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          try {
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = Math.max(0, Math.floor(Number(frame) || 0));
            game.frameLow = game.tick & 0xff;
            renderPause();
            return pausePresentation(game.frameLow);
          } finally {
            Object.assign(game, previous);
          }
        },
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
        debugGrenadeScoreProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const previousEnemyKilled = game.enemyKilled;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const types = enemyTypeDefinitions();
          const player = {
            id: 1,
            score: 1000,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2
          };
    
          game.players = [player];
          game.enemies = [0, Math.min(2, types.length - 1)].map((typeIndex, index) => ({
            alive: true,
            hp: 1,
            typeIndex,
            score: types[typeIndex].score,
            x: 32 + index * 16,
            y: 32
          }));
          game.enemyKilled = 0;
          game.explosions = [];
          game.scorePopups = [];
          stopEnemyDestroyAudio();
    
          try {
            applyPowerUp(player, "grenade");
            const beforeRelease = {
              enemyKilled: game.enemyKilled,
              aliveEnemies: game.enemies.filter((enemy) => enemy.alive).length,
              destroyingEnemies: game.enemies.filter((enemy) => enemy.destroying).length
            };
            for (let tick = 0; tick < explosionRule("enemyDestroy").ttl + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemies();
            }
            return {
              scoreGain: player.score - 1000,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              stagePoints: player.stagePoints,
              stageKills: player.stageKills.slice(),
              totalKills: player.totalKills.slice(),
              beforeRelease,
              enemyKilled: game.enemyKilled,
              aliveEnemies: game.enemies.filter((enemy) => enemy.alive).length
            };
          } finally {
            game.players = previousPlayers;
            game.enemies = previousEnemies;
            game.enemyKilled = previousEnemyKilled;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugGrenadeSpawnProtectionProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previous = {
            players: game.players,
            enemies: game.enemies,
            enemyKilled: game.enemyKilled,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            highScore: game.highScore
          };
          const types = enemyTypeDefinitions();
          const player = {
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            score: 0,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2
          };
          const makeEnemy = (id, spawnFlash) => ({
            id,
            alive: true,
            hp: 1,
            spawnFlash,
            typeIndex: 0,
            score: types[0].score,
            x: 32 + id * 16,
            y: 32,
            w: 14,
            h: 14
          });
          const active = makeEnemy(0, 0);
          const spawning = makeEnemy(1, 12);
          try {
            stopEnemyDestroyAudio();
            game.players = [player];
            game.enemies = [active, spawning];
            game.enemyKilled = 0;
            game.explosions = [];
            game.scorePopups = [];
            applyPowerUp(player, "grenade");
            const beforeRelease = {
              activeAlive: active.alive,
              activeDestroying: active.destroying,
              spawningAlive: spawning.alive,
              spawningHp: spawning.hp,
              spawningFlash: spawning.spawnFlash,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length
            };
            for (let tick = 0; tick < explosionRule("enemyDestroy").ttl + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemies();
            }
            return {
              activeAlive: active.alive,
              activeDestroying: active.destroying,
              spawningAlive: beforeRelease.spawningAlive,
              spawningHp: beforeRelease.spawningHp,
              spawningFlash: beforeRelease.spawningFlash,
              spawningFlashAfterLifecycle: spawning.spawnFlash,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length,
              beforeRelease,
              stageKills: player.stageKills.slice(),
              totalKills: player.totalKills.slice()
            };
          } finally {
            Object.assign(game, previous);
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugScorePopupProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const previousEnemyKilled = game.enemyKilled;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const types = enemyTypeDefinitions();
          const armorIndex = Math.min(3, types.length - 1);
          const player = {
            id: 1,
            kind: "player",
            x: 72,
            y: 72,
            w: 14,
            h: 14,
            score: 0,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2,
            level: 0,
            invuln: 0,
            alive: true
          };
          const enemy = {
            alive: true,
            hp: 1,
            typeIndex: armorIndex,
            score: types[armorIndex].score,
            x: 64,
            y: 64,
            w: 14,
            h: 14
          };
    
          try {
            stopEnemyDestroyAudio();
            game.players = [player];
            game.enemies = [enemy];
            game.enemyKilled = 0;
            game.explosions = [];
            game.scorePopups = [];
            destroyEnemy(enemy, player.id);
            const enemyScoreAward = {
              score: player.score,
              stagePoints: player.stagePoints,
              stageKills: player.stageKills.slice()
            };
            enemy.destroyTicks = enemy.destroyExplosionTicks;
            const enemyPresentation = enemyDestructionPresentation(enemy);
            const enemyPopup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;
    
            game.scorePopups = [];
            applyPowerUp(player, "star");
            const pickupPopup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;
    
            game.scorePopups = [];
            game.enemies = [0, Math.min(2, types.length - 1)].map((typeIndex, index) => ({
              alive: true,
              hp: 1,
              typeIndex,
              score: types[typeIndex].score,
              x: 32 + index * 16,
              y: 32,
              w: 14,
              h: 14
            }));
            applyPowerUp(player, "grenade");
            const grenadePopups = game.scorePopups.map((popup) => ({ ...popup }));
    
            updateScorePopups();
            const afterUpdate = game.scorePopups.map((popup) => ({ ...popup }));
    
            return {
              enemyPopup,
              enemyScoreAward,
              enemyPresentation,
              pickupPopup,
              grenadePopups,
              afterUpdate,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              armorScore: types[armorIndex].score
            };
          } finally {
            game.players = previousPlayers;
            game.enemies = previousEnemies;
            game.enemyKilled = previousEnemyKilled;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPausedScorePopupProbe() {
          const previous = { ...game };
          try {
            preparePausedDebugBattle(27);
            game.scorePopups = [{ value: 500, x: 64, y: 64, ttl: 2, max: 2, style: "powerUp" }];
            update();
            const afterOneFrame = { tick: game.tick, ttl: game.scorePopups[0] ? game.scorePopups[0].ttl : 0 };
            update();
            return {
              afterOneFrame,
              afterTwoFrames: { tick: game.tick, popupCount: game.scorePopups.length }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        ...createUpgradeDiagnostics(state, deps),
        debugPlayerDeathRespawnProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          const previousKeys = Array.from(keys);
          const makePlayer = (lives) => {
            const player = createPlayer(1);
            player.lives = lives;
            player.level = 3;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.reload = 0;
            player.slide = 0;
            return player;
          };
    
          try {
            stopPlayerDestroyAudio();
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.playerCount = 1;
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            keys.clear();
    
            const player = makePlayer(2);
            game.players = [player];
            killPlayer(player);
            const afterHit = {
              alive: player.alive,
              destroying: player.destroying,
              lives: player.lives,
              level: player.level,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };
    
            let deathDisplayFrames = 0;
            const deathPresentations = [];
            while (!player.alive && player.respawn > 0 && deathDisplayFrames < 1000) {
              deathPresentations.push(playerDestructionPresentation(player));
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              deathDisplayFrames += 1;
              updatePlayers();
            }
            const deathResolved = {
              tick: game.tick,
              alive: player.alive,
              destroying: player.destroying,
              lives: player.lives,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };
    
            let spawnDisplayFrames = 0;
            while (player.spawnFlash > 0 && spawnDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              spawnDisplayFrames += 1;
              updatePlayers();
            }
            const activated = {
              tick: game.tick,
              alive: player.alive,
              lives: player.lives,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };
    
            const lastLifePlayer = makePlayer(1);
            game.players = [lastLifePlayer];
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            killPlayer(lastLifePlayer);
            let lastLifeDisplayFrames = 0;
            while (lastLifePlayer.respawn > 0 && lastLifeDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              lastLifeDisplayFrames += 1;
              updatePlayers();
            }
    
            return {
              deathTicks: gameSettings().timings.playerRespawn,
              spawnTicks: gameSettings().timings.playerSpawnFlash,
              afterHit,
              deathDisplayFrames,
              destructionExplosionFrames: deathPresentations.filter((presentation) => presentation.kind === "explosion").length,
              destructionFinalFrames: deathPresentations.filter((presentation) => presentation.kind === "final").length,
              destructionPhases: deathPresentations
                .map((presentation) => presentation.phase)
                .filter((phase, index, phases) => index === 0 || phase !== phases[index - 1]),
              deathResolved,
              spawnDisplayFrames,
              totalDisplayFrames: deathDisplayFrames + spawnDisplayFrames,
              activated,
              lastLife: {
                displayFrames: lastLifeDisplayFrames,
                alive: lastLifePlayer.alive,
                destroying: lastLifePlayer.destroying,
                lives: lastLifePlayer.lives,
                respawn: lastLifePlayer.respawn
              }
            };
          } finally {
            stopPlayerDestroyAudio();
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            Object.assign(game, previous);
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerGameOverMessageProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            demoMode: game.demoMode,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            playerCount: game.playerCount,
            players: game.players,
            enemies: game.enemies,
            enemySpawned: game.enemySpawned,
            enemyKilled: game.enemyKilled,
            base: game.base,
            clearPendingTimer: game.clearPendingTimer,
            playerGameOverMessage: game.playerGameOverMessage
          };
          const state = () => {
            const message = game.playerGameOverMessage;
            return message
              ? {
                playerId: message.playerId,
                timer: message.timer,
                x: message.x,
                y: message.y,
                dx: message.dx,
                presentation: playerGameOverMessagePresentation()
              }
              : null;
          };
          const setup = (eliminatedId, partnerLives) => {
            const p1 = createPlayer(1);
            const p2 = createPlayer(2);
            for (const player of [p1, p2]) {
              player.spawnFlash = 0;
              player.invuln = 0;
              player.respawn = 0;
              player.destroying = false;
            }
            const eliminated = eliminatedId === 2 ? p2 : p1;
            const partner = eliminatedId === 2 ? p1 : p2;
            eliminated.alive = false;
            eliminated.destroying = true;
            eliminated.lives = 1;
            partner.lives = Math.max(0, Math.floor(Number(partnerLives) || 0));
            partner.alive = partner.lives > 0;
            game.screen = "playing";
            game.paused = false;
            game.pauseElapsed = 0;
            game.demoMode = false;
            game.tick = 0x123;
            game.frameLow = 0x23;
            game.frameHigh = 0x45;
            game.playerCount = 2;
            game.players = [p1, p2];
            game.enemies = [];
            game.enemySpawned = 0;
            game.enemyKilled = 0;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.clearPendingTimer = 0;
            game.playerGameOverMessage = null;
            finishPlayerDeath(eliminated);
            return { eliminated, partner, baseTick: game.tick, baseFrameHigh: game.frameHigh };
          };
          const run = (playerId) => {
            const context = setup(playerId, 2);
            const initial = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
            const frames = [];
            const sampleFrames = new Set([0, 15, 16, 31, 32, 47, 48, 191, 192]);
            for (let frame = 0; frame <= 192; frame += 1) {
              game.tick = context.baseTick + frame;
              game.frameLow = frame & 0xff;
              updatePlayerGameOverMessage();
              if (sampleFrames.has(frame)) frames.push({ frame, ...state() });
            }
            return {
              initial,
              frames,
              eliminatedLives: context.eliminated.lives,
              partnerAlive: context.partner.alive
            };
          };
    
          try {
            const p1 = run(1);
            const p2 = run(2);
    
            setup(1, 2);
            game.paused = true;
            const pausedBefore = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
            update();
            const pausedAfter = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
    
            setup(1, 2);
            game.enemySpawned = enemyTotal();
            checkEndState();
            const clearDelay = {
              screen: game.screen,
              timer: game.clearPendingTimer,
              tick: game.tick,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              message: state()
            };
    
            setup(1, 0);
            const noSurvivingPartner = state();
    
            game.players = [game.players[0]];
            game.playerGameOverMessage = null;
            const solo = game.players[0];
            solo.lives = 1;
            solo.alive = false;
            solo.destroying = true;
            finishPlayerDeath(solo);
            const onePlayer = state();
    
            setup(1, 2);
            enterGameOver();
            const commonGameOver = {
              screen: game.screen,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              message: state()
            };
    
            return {
              initialTimer: PLAYER_GAME_OVER_MESSAGE_TIMER,
              moveThreshold: PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD,
              stageEndDelay: PLAYER_GAME_OVER_STAGE_END_DELAY,
              p1,
              p2,
              pausedBefore,
              pausedAfter,
              clearDelay,
              noSurvivingPartner,
              onePlayer,
              commonGameOver
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderPlayerGameOverMessage(playerId, elapsed) {
          const previous = {
            paused: game.paused,
            demoMode: game.demoMode,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            playerGameOverMessage: game.playerGameOverMessage
          };
          const id = playerId === 2 ? 2 : 1;
          const frame = clamp(Math.floor(Number(elapsed) || 0), 0, 191);
          try {
            game.paused = false;
            game.demoMode = false;
            game.playerGameOverMessage = {
              playerId: id,
              timer: PLAYER_GAME_OVER_MESSAGE_TIMER,
              x: id === 2 ? 0xc0 : 0x20,
              y: PLAYER_GAME_OVER_MESSAGE_Y,
              dx: id === 2 ? -1 : 1
            };
            for (let current = 0; current <= frame; current += 1) {
              game.tick = current;
              game.frameLow = current & 0xff;
              updatePlayerGameOverMessage();
            }
            const presentation = playerGameOverMessagePresentation();
            renderPlayerGameOverMessage();
            return presentation;
          } finally {
            Object.assign(game, previous);
          }
        },
        debugLifeAwardProbe() {
          const previousHighScore = game.highScore;
          const previousScorePopups = game.scorePopups;
          const previousDemoMode = game.demoMode;
          const previousPowerUp = game.powerUp;
          const previousBonusLife = {
            active: bonusLifeAudio.active,
            frame: bonusLifeAudio.frame
          };
          const previousPowerUpPickup = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame
          };
          const threshold = gameSettings().bonusLifeScores[0];
          const player = {
            id: 1,
            score: Math.max(0, threshold - 1),
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 1,
            level: 0,
            invuln: 0,
            alive: true
          };
          const tankPlayer = {
            ...player,
            score: 0,
            lives: 1,
            nextBonusLifeIndex: 0
          };
    
          try {
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            game.demoMode = false;
            game.scorePopups = [];
            addPlayerScore(player, 0);
            const beforeCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            addPlayerScore(player, 1);
            const afterCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            const thresholdAudio = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
            addPlayerScore(player, 1);
            const afterRepeat = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            stopBonusLifeAudio();
            const tankPowerUp = { type: "tank", x: 32, y: 48, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
            game.powerUp = tankPowerUp;
            collectPowerUp(tankPlayer, tankPowerUp);
            const tankAudio = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
            const tankPickupAudio = {
              active: powerUpPickupAudio.active,
              frame: powerUpPickupAudio.frame,
              audible: powerUpPickupAudioAudible()
            };
            return {
              threshold,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              beforeCrossing,
              afterCrossing,
              afterRepeat,
              thresholdAudio,
              tankAudio,
              tankPickupAudio,
              tank: {
                score: tankPlayer.score,
                lives: tankPlayer.lives
              }
            };
          } finally {
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            game.demoMode = previousDemoMode;
            game.powerUp = previousPowerUp;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
            game.highScore = previousHighScore;
            game.scorePopups = previousScorePopups;
          }
        },
        ...createCombatDiagnostics(state, deps),
        ...createPlayerMovementDiagnostics(state, deps),
        debugTerrainCollisionProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions
          };
          const types = [
            ["water", WATER],
            ["forest", FOREST],
            ["ice", ICE]
          ];
          const result = {};
    
          try {
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.explosions = [];
    
            for (const [name, type] of types) {
              const grid = makeGrid();
              setTile(grid, 6, 6, type, 0);
              game.grid = grid;
              const tank = { kind: "player", x: 6 * TILE + 1, y: 6 * TILE + 1, w: 14, h: 14, alive: true };
              const bullet = {
                x: 6 * TILE + 6,
                y: 6 * TILE + 6,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                dir: RIGHT,
                power: 1,
                ownerKind: "player",
                ownerId: 1,
                ownerKey: "player:1",
                remove: false
              };
              resolveBullet(bullet);
              result[name] = {
                tankCanOccupy: canTankOccupy(tank, tank.x, tank.y),
                bulletRemoved: bullet.remove
              };
            }
          } finally {
            Object.assign(game, previous);
          }
    
          return result;
        },
        debugBaseWallPriorityProbe() {
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousBaseHit = { active: baseHitAudio.active, frame: baseHitAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            screen: game.screen,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions,
            baseDestroyTimer: game.baseDestroyTimer,
            gameOverTimer: game.gameOverTimer
          };
          const makeBaseBullet = () => ({
            x: 6 * TILE + 6,
            y: 12 * TILE - 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          });
          try {
            stopBrickHitAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            game.screen = "playing";
            game.players = [];
            game.enemies = [];
            game.explosions = [];
            game.baseDestroyTimer = 0;
    
            game.grid = makeGrid();
            setTile(game.grid, 6, 11, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            const shieldedBullet = makeBaseBullet();
            resolveBullet(shieldedBullet);
            const shielded = {
              baseAlive: game.base.alive,
              bulletRemoved: shieldedBullet.remove,
              topWallMask: game.grid[11][6].mask,
              screen: game.screen,
              baseDestroyTimer: game.baseDestroyTimer,
              explosions: game.explosions.map(({ x, y, ttl, style }) => ({ x, y, ttl, style }))
            };
    
            game.screen = "playing";
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.explosions = [];
            game.baseDestroyTimer = 0;
            const exposedBullet = makeBaseBullet();
            resolveBullet(exposedBullet);
            const exposed = {
              baseAlive: game.base.alive,
              bulletRemoved: exposedBullet.remove,
              screen: game.screen,
              baseDestroyTimer: game.baseDestroyTimer,
              presentation: baseDestructionPresentation(game.baseDestroyTimer),
              explosions: game.explosions.map(({ x, y, ttl, style }) => ({ x, y, ttl, style }))
            };
    
            return { shielded, exposed };
          } finally {
            stopBrickHitAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugBaseDestructionSequenceProbe() {
          const previous = { ...game };
          const previousFirePresses = new Set(pendingFirePresses);
          const rightWasHeld = keys.has("ArrowRight");
          const previousBaseHit = { active: baseHitAudio.active, frame: baseHitAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const player = createPlayer(1);
          const spawningEnemy = { alive: true, spawnFlash: 40 };
          const fieldBullet = {
            x: 32,
            y: 120,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 1,
            power: 1,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          };
          const baseBullet = {
            x: 6 * TILE + 5,
            y: 12 * TILE + 5,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            speed: 0,
            power: 1,
            ownerKind: "enemy",
            ownerId: 101,
            ownerKey: "enemy:101",
            remove: false
          };
          try {
            stopMovementAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            player.x = 48;
            player.y = 48;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.reload = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.playerCount = 1;
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [spawningEnemy];
            game.bullets = [fieldBullet];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
            game.enemySpawned = enemyTotal();
            game.enemyKilled = 0;
            game.nextSpawn = 0;
            game.clearPendingTimer = 0;
            game.baseDestroyTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 0;
            game.shovelTimer = 0;
    
            const hit = hitBase(baseBullet);
            const entry = {
              hit,
              screen: game.screen,
              timer: game.baseDestroyTimer,
              duration: baseDestructionDuration(),
              baseAlive: game.base.alive,
              bulletRemoved: baseBullet.remove,
              explosionCount: game.explosions.length,
              presentation: baseDestructionPresentation(game.baseDestroyTimer)
            };
            const pauseAccepted = togglePause();
            keys.add("ArrowRight");
            pendingFirePresses.add("Space");
            const playerStartX = player.x;
            const bulletStartX = fieldBullet.x;
            const enemyStartFlash = spawningEnemy.spawnFlash;
            const frames = [];
            for (let frame = 1; frame <= entry.duration; frame += 1) {
              update();
              const presentation = baseDestructionPresentation(game.baseDestroyTimer);
              frames.push({
                frame,
                timer: game.baseDestroyTimer,
                screen: game.screen,
                phase: presentation ? presentation.phase : 0,
                size: presentation ? presentation.size : 0,
                width: presentation ? presentation.width : 0,
                height: presentation ? presentation.height : 0,
                frameName: presentation ? presentation.frameName : null,
                movementAudioMode: movementAudio.mode
              });
            }
            return {
              entry,
              pauseAccepted,
              playerStartX,
              playerEndX: player.x,
              bulletStartX,
              bulletEndX: fieldBullet.x,
              enemyStartFlash,
              enemyEndFlash: spawningEnemy.spawnFlash,
              playerBulletCount: game.bullets.filter((bullet) => bullet.ownerKind === "player").length,
              gameOverTimer: game.gameOverTimer,
              frames
            };
          } finally {
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            pendingFirePresses.clear();
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            if (!rightWasHeld) keys.delete("ArrowRight");
            syncBaseHitAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugRenderBaseDestructionFrame(timer) {
          const previous = { ...game };
          try {
            game.screen = "playing";
            game.playerCount = 1;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
            game.baseDestroyTimer = clamp(Math.floor(Number(timer) || 0), 0, baseDestructionDuration());
            renderGame();
            return baseDestructionPresentation(game.baseDestroyTimer);
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTankCollisionProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const player = { kind: "player", id: 1, x: 32, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          const teammate = { kind: "player", id: 2, x: 46, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          const enemy = { kind: "enemy", id: 100, x: 46, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
    
            game.players = [player];
            game.enemies = [enemy];
            const enemyBlocks = !canTankOccupy(player, player.x + 1, player.y);
            const movingAwayFromEnemyAllowed = moveTank(player, -1, 0);
    
            player.x = 32;
            player.y = 32;
            game.players = [player, teammate];
            game.enemies = [];
            const teammateBlocks = !canTankOccupy(player, player.x + 1, player.y);
    
            return {
              enemyBlocks,
              teammateBlocks,
              movingAwayFromEnemyAllowed,
              finalX: player.x
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyOverlapRecoveryProbe() {
          const previous = {
            tick: game.tick,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makeEnemy = (id, x) => ({
            kind: "enemy",
            id,
            slotIndex: id - 98,
            x,
            y: 32,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            alternateMovement: false,
            blockedPauseTicks: 2,
            pendingTurn: true,
            alive: true,
            respawn: 0,
            spawnFlash: 0
          });
          try {
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            const blocker = makeEnemy(100, 32);
            const recovering = makeEnemy(101, 40);
            game.enemies = [blocker, recovering];
            const startOverlapArea = rectOverlapArea(blocker, recovering);
            updateEnemyMovement(recovering, () => 0);
            const firstTick = {
              x: recovering.x,
              dir: recovering.dir,
              overlapArea: rectOverlapArea(blocker, recovering),
              blockedPauseTicks: recovering.blockedPauseTicks,
              pendingTurn: recovering.pendingTurn
            };
            for (let tick = 1; tick < 6; tick += 1) updateEnemyMovement(recovering, () => 0);
            const finalOverlapArea = rectOverlapArea(blocker, recovering);
            const contactMoveBlocked = !canTankOccupy(recovering, recovering.x - 1, recovering.y);
            return {
              startOverlapArea,
              firstTick,
              finalX: recovering.x,
              finalOverlapArea,
              contactMoveBlocked
            };
          } finally {
            Object.assign(game, previous);
          }
        },
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
