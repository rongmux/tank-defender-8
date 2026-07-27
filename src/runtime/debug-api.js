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
    var movementIceAudio = state.audio.movementIce;
    var playerShootAudio = state.audio.playerShoot;
    var steelHitAudio = state.audio.steelHit;
    var enemyHitAudio = state.audio.enemyHit;
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
    function makeCell() { return state.fn.makeCell.apply(state.fn, arguments); }
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
    function stopSteelHitAudio() { return state.fn.stopSteelHitAudio.apply(state.fn, arguments); }
    function syncSteelHitAudioNodes() { return state.fn.syncSteelHitAudioNodes.apply(state.fn, arguments); }
    function stopEnemyHitAudio() { return state.fn.stopEnemyHitAudio.apply(state.fn, arguments); }
    function syncEnemyHitAudioNodes() { return state.fn.syncEnemyHitAudioNodes.apply(state.fn, arguments); }
    function stopEnemyDestroyAudio() { return state.fn.stopEnemyDestroyAudio.apply(state.fn, arguments); }
    function syncEnemyDestroyAudioNodes() { return state.fn.syncEnemyDestroyAudioNodes.apply(state.fn, arguments); }
    function stopPlayerDestroyAudio() { return state.fn.stopPlayerDestroyAudio.apply(state.fn, arguments); }
    function syncPlayerDestroyAudioNodes() { return state.fn.syncPlayerDestroyAudioNodes.apply(state.fn, arguments); }
    function stopPlayerShootAudio() { return state.fn.stopPlayerShootAudio.apply(state.fn, arguments); }
    function syncPlayerShootAudioNodes() { return state.fn.syncPlayerShootAudioNodes.apply(state.fn, arguments); }
    function stopMovementIceAudio() { return state.fn.stopMovementIceAudio.apply(state.fn, arguments); }
    function syncMovementIceAudioNodes() { return state.fn.syncMovementIceAudioNodes.apply(state.fn, arguments); }
    function stopPauseAudio() { return state.fn.stopPauseAudio.apply(state.fn, arguments); }
    function syncPauseAudioNodes() { return state.fn.syncPauseAudioNodes.apply(state.fn, arguments); }
    function loadStagePackJsonText() { return state.fn.loadStagePackJsonText.apply(state.fn, arguments); }
    function loadStagePackObject() { return state.fn.loadStagePackObject.apply(state.fn, arguments); }
    function updatePlayers() { return state.fn.updatePlayers.apply(state.fn, arguments); }
    function isPlayerMovementFrame() { return state.fn.isPlayerMovementFrame.apply(state.fn, arguments); }
    function updatePlayerMovement() { return state.fn.updatePlayerMovement.apply(state.fn, arguments); }
    function updateEnemies() { return state.fn.updateEnemies.apply(state.fn, arguments); }
    function updateEnemyMovement() { return state.fn.updateEnemyMovement.apply(state.fn, arguments); }
    function updateBullets() { return state.fn.updateBullets.apply(state.fn, arguments); }
    function resolveBullet() { return state.fn.resolveBullet.apply(state.fn, arguments); }
    function hitBase() { return state.fn.hitBase.apply(state.fn, arguments); }
    function hitTerrain() { return state.fn.hitTerrain.apply(state.fn, arguments); }
    function hitTank() { return state.fn.hitTank.apply(state.fn, arguments); }
    function destroyEnemy() { return state.fn.destroyEnemy.apply(state.fn, arguments); }
    function addPlayerScore() { return state.fn.addPlayerScore.apply(state.fn, arguments); }
    function killPlayer() { return state.fn.killPlayer.apply(state.fn, arguments); }
    function finishPlayerDeath() { return state.fn.finishPlayerDeath.apply(state.fn, arguments); }
    function updatePlayerGameOverMessage() { return state.fn.updatePlayerGameOverMessage.apply(state.fn, arguments); }
    function collectPowerUp() { return state.fn.collectPowerUp.apply(state.fn, arguments); }
    function applyPowerUp() { return state.fn.applyPowerUp.apply(state.fn, arguments); }
    function spawnEnemies() { return state.fn.spawnEnemies.apply(state.fn, arguments); }
    function shoot() { return state.fn.shoot.apply(state.fn, arguments); }
    function createBullet() { return state.fn.createBullet.apply(state.fn, arguments); }
    function playerUpgradeRule() { return state.fn.playerUpgradeRule.apply(state.fn, arguments); }
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
    function powerUpVisualRect() { return state.fn.powerUpVisualRect.apply(state.fn, arguments); }
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
        debugHelmetProtectionProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const makePlayer = () => ({
            id: 1,
            kind: "player",
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            alive: true,
            invuln: 0,
            lives: 2,
            respawn: 0,
            level: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0
          });
          const makeBullet = () => ({
            x: 18,
            y: 18,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: LEFT,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });
    
          try {
            stopPlayerDestroyAudio();
            game.explosions = [];
            game.scorePopups = [];
            const unprotectedPlayer = makePlayer();
            const unprotectedBullet = makeBullet();
            game.players = [unprotectedPlayer];
            hitTank(unprotectedBullet);
    
            const protectedPlayer = makePlayer();
            applyPowerUp(protectedPlayer, "helmet");
            const protectedBullet = makeBullet();
            game.players = [protectedPlayer];
            hitTank(protectedBullet);
    
            return {
              duration: gameSettings().powerUpDurations.helmet,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              unprotected: {
                alive: unprotectedPlayer.alive,
                lives: unprotectedPlayer.lives,
                bulletRemoved: unprotectedBullet.remove
              },
              protected: {
                alive: protectedPlayer.alive,
                lives: protectedPlayer.lives,
                invuln: protectedPlayer.invuln,
                score: protectedPlayer.score,
                bulletRemoved: protectedBullet.remove,
                explosions: game.explosions.length
              }
            };
          } finally {
            stopPlayerDestroyAudio();
            game.players = previousPlayers;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugEnemyBulletPlayerCollisionProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            players: game.players,
            explosions: game.explosions
          };
          const makePlayer = (invuln) => ({
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            lives: 2,
            respawn: 0,
            spawnFlash: 0,
            invuln,
            stun: 0,
            level: 0
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });
          const run = (invuln, centerDx, centerDy) => {
            const player = makePlayer(invuln);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [player];
            game.explosions = [];
            hitTank(bullet);
            const explosionDetails = game.explosions.map((explosion) => ({
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            }));
            return {
              bulletRemoved: bullet.remove,
              alive: player.alive,
              destroying: Boolean(player.destroying),
              respawn: player.respawn,
              explosions: explosionDetails.length,
              explosionDetails
            };
          };
          try {
            stopPlayerDestroyAudio();
            return {
              protected: run(1, 0, 0),
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0)
            };
          } finally {
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerBulletEnemyCollisionProbe() {
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            players: game.players,
            enemies: game.enemies,
            enemyKilled: game.enemyKilled,
            explosions: game.explosions
          };
          const type = enemyTypeDefinitions()[0];
          const makeEnemy = (spawnFlash, hp) => ({
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            hp,
            spawnFlash,
            carrier: false,
            typeIndex: 0,
            score: type.score
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          });
          const run = (spawnFlash, centerDx, centerDy, hp) => {
            const enemy = makeEnemy(spawnFlash, hp === undefined ? 1 : hp);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [];
            game.enemies = [enemy];
            game.enemyKilled = 0;
            game.explosions = [];
            hitTank(bullet);
            const explosionDetails = game.explosions.map((explosion) => ({
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            }));
            return {
              bulletRemoved: bullet.remove,
              enemyAlive: enemy.alive,
              enemyDestroying: Boolean(enemy.destroying),
              enemyHp: enemy.hp,
              enemyKilled: game.enemyKilled,
              explosions: explosionDetails.length,
              explosionDetails
            };
          };
          try {
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            return {
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0),
              spawning: run(12, 0, 0),
              armored: run(0, 9, 9, 2)
            };
          } finally {
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugPlayerSpawnLockProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            highScore: game.highScore,
            tick: game.tick
          };
          const previousKeys = Array.from(keys);
          const previousFirePresses = Array.from(pendingFirePresses);
          const player = {
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 3,
            nextBonusLifeIndex: 0,
            respawn: 0,
            spawnFlash: gameSettings().timings.playerSpawnFlash,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            slide: 0,
            color: "#e3c64e",
            accent: "#fff0a8"
          };
    
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.tick = 1;
            keys.clear();
            keys.add("ArrowRight");
            keys.add("Space");
            pendingFirePresses.clear();
            pendingFirePresses.add("Space");
    
            const before = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            updatePlayers();
            const locked = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            const friendlyBullet = () => ({
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: RIGHT,
              ownerKind: "player",
              ownerId: 2,
              ownerKey: "player:2",
              remove: false
            });
            const enemyBullet = () => ({
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: LEFT,
              ownerKind: "enemy",
              ownerId: 100,
              ownerKey: "enemy:100",
              remove: false
            });
            const spawningFriendlyBullet = friendlyBullet();
            hitTank(spawningFriendlyBullet);
            const friendlyDuringSpawn = {
              stun: player.stun,
              bulletRemoved: spawningFriendlyBullet.remove
            };
            const spawningEnemyBullet = enemyBullet();
            hitTank(spawningEnemyBullet);
            const enemyDuringSpawn = {
              alive: player.alive,
              lives: player.lives,
              invuln: player.invuln,
              bulletRemoved: spawningEnemyBullet.remove
            };
    
            player.spawnFlash = 1;
            game.tick = 3;
            player.reload = 0;
            updatePlayers();
            const activated = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            game.tick = 4;
            pendingFirePresses.add("Space");
            updatePlayers();
            const released = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            player.stun = 0;
            const activeFriendlyBullet = friendlyBullet();
            hitTank(activeFriendlyBullet);
            const protectedFriendlyAfterSpawn = {
              stun: player.stun,
              bulletRemoved: activeFriendlyBullet.remove
            };
            const postSpawnInvuln = player.invuln;
            player.invuln = 0;
            const unprotectedFriendlyBullet = friendlyBullet();
            hitTank(unprotectedFriendlyBullet);
            const friendlyAfterProtection = {
              stun: player.stun,
              bulletRemoved: unprotectedFriendlyBullet.remove
            };
            player.invuln = postSpawnInvuln;
            player.stun = 0;
            const activeEnemyBullet = enemyBullet();
            hitTank(activeEnemyBullet);
            const enemyAfterSpawn = {
              alive: player.alive,
              lives: player.lives,
              invuln: player.invuln,
              bulletRemoved: activeEnemyBullet.remove
            };
    
            return {
              duration: gameSettings().timings.playerSpawnFlash,
              before,
              locked,
              activated,
              released,
              friendlyDuringSpawn,
              protectedFriendlyAfterSpawn,
              friendlyAfterProtection,
              enemyDuringSpawn,
              enemyAfterSpawn,
              friendlyFireStunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
            };
          } finally {
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            pendingFirePresses.clear();
            for (const key of previousFirePresses) pendingFirePresses.add(key);
            Object.assign(game, previous);
          }
        },
        debugActiveBulletLimitProbe() {
          const previousBullets = game.bullets;
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const makePlayer = (level) => ({
            kind: "player",
            id: 1,
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            dir: RIGHT,
            alive: true,
            spawnFlash: 0,
            reload: 0,
            level
          });
          const attempt = (level, shots) => {
            const player = makePlayer(level);
            game.bullets = [];
            const counts = [];
            for (let i = 0; i < shots; i += 1) {
              player.reload = 0;
              shoot(player);
              counts.push(game.bullets.filter((bullet) => bullet.ownerKey === "player:1").length);
            }
            return {
              level,
              maxBullets: playerUpgradeRule(level).maxBullets,
              counts,
              speeds: game.bullets.map((bullet) => bullet.speed),
              powers: game.bullets.map((bullet) => bullet.power)
            };
          };
          const attemptEnemy = (shots) => {
            const type = enemyTypeDefinitions()[2];
            const enemy = {
              kind: "enemy",
              id: 100,
              x: 48,
              y: 16,
              w: 14,
              h: 14,
              dir: DOWN,
              alive: true,
              spawnFlash: 0,
              reload: 0,
              reloadBase: type.reload,
              bulletSpeed: type.bullet,
              bulletPower: type.wallPower
            };
            game.bullets = [];
            const counts = [];
            for (let i = 0; i < shots; i += 1) {
              enemy.reload = 0;
              shoot(enemy);
              counts.push(game.bullets.filter((bullet) => bullet.ownerKey === "enemy:100").length);
            }
            return {
              maxBullets: 1,
              counts,
              speeds: game.bullets.map((bullet) => bullet.speed),
              powers: game.bullets.map((bullet) => bullet.power)
            };
          };
    
          try {
            stopPlayerShootAudio();
            return {
              base: attempt(0, 2),
              upgraded: attempt(2, 3),
              enemy: attemptEnemy(2)
            };
          } finally {
            stopPlayerShootAudio();
            game.bullets = previousBullets;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
          }
        },
        debugPlayerFireInputProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick
          };
          const previousKeys = Array.from(keys);
          const previousFirePresses = Array.from(pendingFirePresses);
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const player = createPlayer(1);
          const bulletCount = () => game.bullets.filter((bullet) => bullet.ownerKey === "player:1").length;
          const updateWithPress = () => {
            pendingFirePresses.add("Space");
            game.tick += 1;
            updatePlayers();
            return bulletCount();
          };
          const updateWithoutPress = () => {
            game.tick += 1;
            updatePlayers();
            return bulletCount();
          };
    
          try {
            stopPlayerShootAudio();
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.playerCount = 1;
            game.tick = 0;
            keys.clear();
            keys.add("Space");
            pendingFirePresses.clear();
            player.x = 64;
            player.y = 64;
            player.spawnX = 64;
            player.spawnY = 64;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.reload = 0;
            player.stun = 0;
            player.level = 0;
    
            const firstPress = updateWithPress();
            game.bullets = [];
            player.reload = 0;
            const heldAfterBulletClears = updateWithoutPress();
            const repressAfterRelease = updateWithPress();
    
            player.reload = 0;
            const fullSlotPress = updateWithPress();
            game.bullets = [];
            player.reload = 0;
            const fullSlotPressAfterClear = updateWithoutPress();
            const fullSlotRepress = updateWithPress();
    
            game.bullets = [];
            player.level = 2;
            player.reload = 0;
            const doubleShotCounts = [updateWithPress(), updateWithPress(), updateWithPress()];
    
            game.bullets = [];
            player.level = 0;
            player.reload = 0;
            player.spawnFlash = 2;
            const spawnPress = updateWithPress();
            player.spawnFlash = 0;
            const spawnPressAfterUnlock = updateWithoutPress();
    
            player.stun = 10;
            player.reload = 0;
            const stunnedPress = updateWithPress();
    
            return {
              firstPress,
              heldAfterBulletClears,
              repressAfterRelease,
              fullSlotPress,
              fullSlotPressAfterClear,
              fullSlotRepress,
              doubleShotCounts,
              spawnPress,
              spawnPressAfterUnlock,
              stunnedPress
            };
          } finally {
            stopPlayerShootAudio();
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            pendingFirePresses.clear();
            for (const key of previousFirePresses) pendingFirePresses.add(key);
            Object.assign(game, previous);
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
          }
        },
        debugCrossingBulletCancelProbe() {
          const previousBullets = game.bullets;
          const previousExplosions = game.explosions;
          const previousGrid = game.grid;
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const speed = 6;
          try {
            game.grid = makeGrid();
            game.players = [];
            game.enemies = [];
            game.explosions = [];
            game.bullets = [
              {
                x: 40,
                y: 80,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                dir: RIGHT,
                speed,
                power: 1,
                ownerKind: "player",
                ownerId: 1,
                ownerKey: "player:1"
              },
              {
                x: 46,
                y: 80,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                dir: LEFT,
                speed,
                power: 1,
                ownerKind: "enemy",
                ownerId: 100,
                ownerKey: "enemy:100"
              }
            ];
            updateBullets();
            const crossingRemaining = game.bullets.length;
            const crossingPositions = game.bullets.map((bullet) => ({ x: bullet.x, y: bullet.y }));
    
            const makeStaticPair = (difference, sameOwner) => [
              {
                x: 40,
                y: 96,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                ownerKey: "player:1",
                remove: false
              },
              {
                x: 40 + difference,
                y: 96,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                ownerKey: sameOwner ? "player:1" : "enemy:100",
                remove: false
              }
            ];
            game.bullets = makeStaticPair(5, false);
            resolveBulletCollisions(game.bullets);
            const thresholdFiveCanceled = game.bullets.every((bullet) => bullet.remove);
            game.bullets = makeStaticPair(6, false);
            resolveBulletCollisions(game.bullets);
            const thresholdSixCanceled = game.bullets.some((bullet) => bullet.remove);
            game.bullets = makeStaticPair(0, true);
            resolveBulletCollisions(game.bullets);
            const sameOwnerCanceled = game.bullets.some((bullet) => bullet.remove);
            return {
              remainingBullets: crossingRemaining,
              crossingPositions,
              speed,
              explosionCount: game.explosions.length,
              thresholdFiveCanceled,
              thresholdSixCanceled,
              sameOwnerCanceled
            };
          } finally {
            game.bullets = previousBullets;
            game.explosions = previousExplosions;
            game.grid = previousGrid;
            game.players = previousPlayers;
            game.enemies = previousEnemies;
          }
        },
        debugProjectileRuleProbe() {
          const bullet = createBullet(
            { kind: "player", id: 1, x: 16, y: 16, w: 14, h: 14, dir: RIGHT, bulletSpeed: 2.25, bulletPower: 1 },
            "player:1",
            playerUpgradeRule(0)
          );
          return {
            x: bullet.x,
            y: bullet.y,
            w: bullet.w,
            h: bullet.h,
            speed: bullet.speed,
            power: bullet.power,
            spawnOffset: gameSettings().projectileRules.spawnOffset,
            boundsPadding: gameSettings().projectileRules.boundsPadding
          };
        },
        debugFieldBoundaryBulletProbe() {
          const previousBullets = game.bullets;
          const previousExplosions = game.explosions;
          const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
          const rules = gameSettings().projectileRules;
          const makeBullet = (x, y, ownerKind) => ({
            x,
            y,
            w: rules.bulletSize,
            h: rules.bulletSize,
            dir: UP,
            speed: 0,
            power: 1,
            ownerKind,
            ownerId: 1,
            ownerKey: `${ownerKind}:1`,
            remove: false
          });
          const cases = [
            ["left", -rules.boundsPadding - 1, FIELD_H / 2],
            ["right", FIELD_W + rules.boundsPadding + 1, FIELD_H / 2],
            ["top", FIELD_W / 2, -rules.boundsPadding - 1],
            ["bottom", FIELD_W / 2, FIELD_H + rules.boundsPadding + 1]
          ];
          try {
            stopSteelHitAudio();
            return ["player", "enemy"].flatMap((ownerKind) => cases.map(([edge, x, y]) => {
              const bullet = makeBullet(x, y, ownerKind);
              game.bullets = [bullet];
              game.explosions = [];
              resolveBullet(bullet);
              const explosion = game.explosions[0] || null;
              return {
                edge,
                ownerKind,
                removed: bullet.remove,
                explosionCount: game.explosions.length,
                explosion: explosion ? { x: explosion.x, y: explosion.y, ttl: explosion.ttl } : null,
                sound: wallHitSoundName(bullet, true, false)
              };
            }));
          } finally {
            stopSteelHitAudio();
            game.bullets = previousBullets;
            game.explosions = previousExplosions;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            syncSteelHitAudioNodes();
            syncMovementAudio();
          }
        },
        debugTerrainHitSoundProbe() {
          const impacts = [
            { terrain: "brick", wasSteel: false, damaged: true },
            { terrain: "steelBlocked", wasSteel: true, damaged: false },
            { terrain: "steelDestroyed", wasSteel: true, damaged: true }
          ];
          return ["player", "enemy"].flatMap((ownerKind) => impacts.map((impact) => ({
            ownerKind,
            terrain: impact.terrain,
            sound: wallHitSoundName({ ownerKind }, impact.wasSteel, impact.damaged)
          })));
        },
        debugFriendlyFireProbe() {
          return {
            enabled: gameSettings().friendlyFire.enabled,
            stunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
          };
        },
        debugFriendlyFireProtectionProbe() {
          const previous = {
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions
          };
          const makeTarget = (invuln) => ({
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            spawnFlash: 0,
            invuln,
            stun: 0
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 2,
            ownerKey: "player:2",
            remove: false
          });
          const run = (invuln, centerDx, centerDy) => {
            const target = makeTarget(invuln);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [target];
            game.enemies = [];
            game.explosions = [];
            hitTank(bullet);
            const explosion = game.explosions[0] || null;
            return {
              bulletRemoved: bullet.remove,
              stun: target.stun,
              explosions: game.explosions.length,
              explosion: explosion ? {
                x: explosion.x,
                y: explosion.y,
                ttl: explosion.ttl,
                style: explosion.style
              } : null
            };
          };
          try {
            return {
              protected: run(1, 0, 0),
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0)
            };
          } finally {
            Object.assign(game, previous);
          }
        },
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
