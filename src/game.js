(function () {
  "use strict";

  // ── Module imports ─────────────────────────────────────────────────────
  var deps = (window.TankDefender8Modules || {}).moduleDeps;
  if (!deps) throw new Error("module-deps.js must load before game.js");
  var sh = deps.sharedState;

  // ── Shared-state constant aliases ───────────────────────────────────────
  var SCREEN_W = sh.SCREEN_W;
  var SCREEN_H = sh.SCREEN_H;
  var TILE = sh.TILE;
  var HALF = sh.HALF;
  var FIELD_X = sh.FIELD_X;
  var FIELD_Y = sh.FIELD_Y;
  var FIELD_W = sh.FIELD_W;
  var FIELD_H = sh.FIELD_H;
  var PANEL_X = sh.PANEL_X;
  var STEP_MS = sh.STEP_MS;
  var DEFAULT_HIGH_SCORE = sh.DEFAULT_HIGH_SCORE;
  var TITLE_DEMO_IDLE_FRAMES = sh.TITLE_DEMO_IDLE_FRAMES;
  var DEMO_DISPLAY_STAGE = sh.DEMO_DISPLAY_STAGE;
  var DEMO_MAX_ACTIVE_ENEMIES = sh.DEMO_MAX_ACTIVE_ENEMIES;
  var HIDDEN_MESSAGE_REQUIRED_VISITS = sh.HIDDEN_MESSAGE_REQUIRED_VISITS;
  var HIDDEN_MESSAGE_A_PRESSES = sh.HIDDEN_MESSAGE_A_PRESSES;
  var HIDDEN_MESSAGE_B_PRESSES = sh.HIDDEN_MESSAGE_B_PRESSES;
  var HIDDEN_MESSAGE_TEXT_START = sh.HIDDEN_MESSAGE_TEXT_START;
  var HIDDEN_MESSAGE_STEP_FRAMES = sh.HIDDEN_MESSAGE_STEP_FRAMES;
  var HIDDEN_MESSAGE_DROP_START = sh.HIDDEN_MESSAGE_DROP_START;
  var HIDDEN_MESSAGE_DROP_MORPH_FRAMES = sh.HIDDEN_MESSAGE_DROP_MORPH_FRAMES;
  var HIDDEN_MESSAGE_DROP_FALL_FRAMES = sh.HIDDEN_MESSAGE_DROP_FALL_FRAMES;
  var HIDDEN_MESSAGE_END_FRAME = sh.HIDDEN_MESSAGE_END_FRAME;
  var PLAYER_GAME_OVER_STAGE_END_DELAY = sh.PLAYER_GAME_OVER_STAGE_END_DELAY;
  var EXTENDED_STAGE_END_FRAME_HIGH = sh.EXTENDED_STAGE_END_FRAME_HIGH;
  var DEMO_INITIAL_FRAME_LOW = sh.DEMO_INITIAL_FRAME_LOW;
  var STAGE_MAP_DRAW_FRAMES = sh.STAGE_MAP_DRAW_FRAMES;
  var STAGE_ATTRIBUTE_COPY_FRAMES = sh.STAGE_ATTRIBUTE_COPY_FRAMES;
  var TITLE_MENU_ITEMS = sh.TITLE_MENU_ITEMS;
  var EDITOR_STORAGE_KEY = sh.EDITOR_STORAGE_KEY;
  var HIGH_SCORE_STORAGE_KEY = sh.HIGH_SCORE_STORAGE_KEY;

  // ── DOM references ─────────────────────────────────────────────────────
  var canvas = document.getElementById("game");
  var packFileInput = document.getElementById("stage-pack-file");
  var ctx = canvas.getContext("2d");

  // ── Shared state ───────────────────────────────────────────────────────
  var state = sh.createSharedState({
    canvas: canvas,
    packFileInput: packFileInput,
    ctx: ctx,
    builtInStagePack: deps.createBuiltInStagePack()
  });
  state.fn = {};
  var fn = state.fn;

  // ── Initialize game state ──────────────────────────────────────────────
  state.game.stagePack = state.builtInStagePack;

  // ── Stage runtime (must be before lifecycle/audio setups) ──────────────
  var stageExports = deps.createStageRuntime({
    getState: function () { return state.game; },
    builtInStagePack: state.builtInStagePack,
    demoMaxActiveEnemies: sh.DEMO_MAX_ACTIVE_ENEMIES
  });
  state.stageRuntime = stageExports;

  var createStageGrid = stageExports.createStageGrid;
  var currentEnemySpawns = stageExports.currentEnemySpawns;
  var currentPlayerSpawns = stageExports.currentPlayerSpawns;
  var currentPowerUpSpawns = stageExports.currentPowerUpSpawns;
  var enemyDataStage = stageExports.enemyDataStage;
  var enemySequenceForStage = stageExports.enemySequenceForStage;
  var enemySpawnPoint = stageExports.enemySpawnPoint;
  var enemyTotal = stageExports.enemyTotal;
  var enemyTypeDefinitions = stageExports.enemyTypeDefinitions;
  var gameSettings = stageExports.gameSettings;
  var getEnemySpec = stageExports.getEnemySpec;
  var isExtendedLoopStage = stageExports.isExtendedLoopStage;
  var mapDataStage = stageExports.mapDataStage;
  var maxActiveEnemies = stageExports.maxActiveEnemies;
  var playerSpawnPoint = stageExports.playerSpawnPoint;
  var stageCount = stageExports.stageCount;
  var stageCycleLimit = stageExports.stageCycleLimit;
  var stageRoute = stageExports.stageRoute;
  var stageSettings = stageExports.stageSettings;

  // ── Setup runtime modules ──────────────────────────────────────────────
  deps.requireRuntimeModule("gameLifecycle").setupGameLifecycle(state, deps);
  deps.requireRuntimeModule("audioBridge").setupAudioBridge(state, deps);
  deps.requireRuntimeModule("editorInputRuntime").setupEditorInputRuntime(state, deps, {
    playSound: fn.playSound,
    showEditorMessage: fn.showEditorMessage,
    tileTypeName: tileTypeName
  });
  deps.requireRuntimeModule("stageSelectRuntime").setupStageSelectRuntime(state, deps, {
    changeStageSelection: fn.changeStageSelection
  });
  deps.requireRuntimeModule("postGameRuntime").setupPostGameRuntime(state, deps, {
    fullGameOverScreenFrames: function () { return FULL_GAME_OVER_SCREEN_FRAMES; },
    highScoreScreenFrames: function () { return HIGH_SCORE_SCREEN_FRAMES; },
    playSound: fn.playSound,
    resetTitleIdleTimer: fn.resetTitleIdleTimer,
    stopAllAudio: fn.stopAllAudio,
    stopGameOverAudio: fn.stopGameOverAudio,
    stopStageResultAudio: fn.stopStageResultAudio
  });

  // ── Stage runtime ──────────────────────────────────────────────────────

  // ── Local aliases (so existing code works unchanged) ────────────────────
  var game = state.game;
  var keys = state.keys;
  var pendingFirePresses = state.pendingFirePresses;
  var pendingStageSelectPresses = state.pendingStageSelectPresses;
  var movementAudio = state.movementAudio;

  // Audio state aliases
  var movementIceAudio = state.audio.movementIce;
  var playerShootAudio = state.audio.playerShoot;
  var steelHitAudio = state.audio.steelHit;
  var enemyHitAudio = state.audio.enemyHit;
  var enemyDestroyAudio = state.audio.enemyDestroy;
  var playerDestroyAudio = state.audio.playerDestroy;
  var baseHitAudio = state.audio.baseHit;
  var brickHitAudio = state.audio.brickHit;
  var stageStartAudio = state.audio.stageStart;
  var bonusLifeAudio = state.audio.bonusLife;
  var powerUpPickupAudio = state.audio.powerUpPickup;
  var powerUpAppearAudio = state.audio.powerUpAppear;
  var pauseAudio = state.audio.pause;
  var scoreCountAudio = state.audio.scoreCount;
  var stageBonusAudio = state.audio.stageBonus;
  var gameOverAudio = state.audio.gameOver;
  var highScoreAudio = state.audio.highScore;

  // ── Tile type constants ────────────────────────────────────────────────
  var BRICK = deps.TILE_TYPES.BRICK;
  var STEEL = deps.TILE_TYPES.STEEL;
  var WATER = deps.TILE_TYPES.WATER;
  var FOREST = deps.TILE_TYPES.FOREST;
  var ICE = deps.TILE_TYPES.ICE;

  // Audio methods are registered before this bridge and do not depend on a receiver.
  var initAudio = fn.initAudio;
  var trackSequencedSound = fn.trackSequencedSound;
  var stopSound = fn.stopSound;
  var fixedFrameAudioPresentation = fn.fixedFrameAudioPresentation;
  var shortNoiseBuffer = fn.shortNoiseBuffer;
  var longNoiseBuffer = fn.longNoiseBuffer;
  var createFixedFrameAudioSource = fn.createFixedFrameAudioSource;
  var stopFixedFrameAudioNodes = fn.stopFixedFrameAudioNodes;
  var syncFixedFrameAudioNodes = fn.syncFixedFrameAudioNodes;
  var startFixedFrameAudio = fn.startFixedFrameAudio;
  var stopFixedFrameAudio = fn.stopFixedFrameAudio;
  var updateFixedFrameAudio = fn.updateFixedFrameAudio;
  var stageStartAudioPresentation = fn.stageStartAudioPresentation;
  var currentAudioMixState = fn.currentAudioMixState;
  var currentAudioAudibility = fn.currentAudioAudibility;
  var stageStartAudioAudibility = fn.stageStartAudioAudibility;
  var syncStageStartAudioNodes = fn.syncStageStartAudioNodes;
  var startStageStartAudio = fn.startStageStartAudio;
  var stopStageStartAudio = fn.stopStageStartAudio;
  var updateStageStartAudio = fn.updateStageStartAudio;
  var bonusLifeAudioPresentation = fn.bonusLifeAudioPresentation;
  var bonusLifeAudioAudibility = fn.bonusLifeAudioAudibility;
  var syncBonusLifeAudioNodes = fn.syncBonusLifeAudioNodes;
  var startBonusLifeAudio = fn.startBonusLifeAudio;
  var stopBonusLifeAudio = fn.stopBonusLifeAudio;
  var updateBonusLifeAudio = fn.updateBonusLifeAudio;
  var bonusLifePulse1Active = fn.bonusLifePulse1Active;
  var bonusLifePulse2Active = fn.bonusLifePulse2Active;
  var powerUpPickupAudioPresentation = fn.powerUpPickupAudioPresentation;
  var powerUpPickupAudioAudible = fn.powerUpPickupAudioAudible;
  var syncPowerUpPickupAudioNodes = fn.syncPowerUpPickupAudioNodes;
  var startPowerUpPickupAudio = fn.startPowerUpPickupAudio;
  var stopPowerUpPickupAudio = fn.stopPowerUpPickupAudio;
  var updatePowerUpPickupAudio = fn.updatePowerUpPickupAudio;
  var powerUpAppearAudioPresentation = fn.powerUpAppearAudioPresentation;
  var powerUpAppearAudioAudible = fn.powerUpAppearAudioAudible;
  var syncPowerUpAppearAudioNodes = fn.syncPowerUpAppearAudioNodes;
  var startPowerUpAppearAudio = fn.startPowerUpAppearAudio;
  var stopPowerUpAppearAudio = fn.stopPowerUpAppearAudio;
  var updatePowerUpAppearAudio = fn.updatePowerUpAppearAudio;
  var brickHitAudioPresentation = fn.brickHitAudioPresentation;
  var brickHitAudioAudible = fn.brickHitAudioAudible;
  var syncBrickHitAudioNodes = fn.syncBrickHitAudioNodes;
  var startBrickHitAudio = fn.startBrickHitAudio;
  var stopBrickHitAudio = fn.stopBrickHitAudio;
  var updateBrickHitAudio = fn.updateBrickHitAudio;
  var baseHitAudioPresentation = fn.baseHitAudioPresentation;
  var baseHitAudioAudible = fn.baseHitAudioAudible;
  var syncBaseHitAudioNodes = fn.syncBaseHitAudioNodes;
  var syncLowerPriorityPulse2AudioNodes = fn.syncLowerPriorityPulse2AudioNodes;
  var startBaseHitAudio = fn.startBaseHitAudio;
  var stopBaseHitAudio = fn.stopBaseHitAudio;
  var updateBaseHitAudio = fn.updateBaseHitAudio;
  var steelHitAudioPresentation = fn.steelHitAudioPresentation;
  var steelHitAudioAudible = fn.steelHitAudioAudible;
  var syncSteelHitAudioNodes = fn.syncSteelHitAudioNodes;
  var startSteelHitAudio = fn.startSteelHitAudio;
  var stopSteelHitAudio = fn.stopSteelHitAudio;
  var updateSteelHitAudio = fn.updateSteelHitAudio;
  var enemyHitAudioPresentation = fn.enemyHitAudioPresentation;
  var enemyHitAudioAudible = fn.enemyHitAudioAudible;
  var syncEnemyHitAudioNodes = fn.syncEnemyHitAudioNodes;
  var startEnemyHitAudio = fn.startEnemyHitAudio;
  var stopEnemyHitAudio = fn.stopEnemyHitAudio;
  var updateEnemyHitAudio = fn.updateEnemyHitAudio;
  var enemyDestroyAudioPresentation = fn.enemyDestroyAudioPresentation;
  var enemyDestroyAudioAudible = fn.enemyDestroyAudioAudible;
  var syncEnemyDestroyAudioNodes = fn.syncEnemyDestroyAudioNodes;
  var startEnemyDestroyAudio = fn.startEnemyDestroyAudio;
  var stopEnemyDestroyAudio = fn.stopEnemyDestroyAudio;
  var updateEnemyDestroyAudio = fn.updateEnemyDestroyAudio;
  var playerDestroyAudioPresentation = fn.playerDestroyAudioPresentation;
  var syncPlayerDestroyAudioNodes = fn.syncPlayerDestroyAudioNodes;
  var startPlayerDestroyAudio = fn.startPlayerDestroyAudio;
  var stopPlayerDestroyAudio = fn.stopPlayerDestroyAudio;
  var updatePlayerDestroyAudio = fn.updatePlayerDestroyAudio;
  var playerShootAudioPresentation = fn.playerShootAudioPresentation;
  var playerShootAudioAudible = fn.playerShootAudioAudible;
  var syncPlayerShootAudioNodes = fn.syncPlayerShootAudioNodes;
  var startPlayerShootAudio = fn.startPlayerShootAudio;
  var stopPlayerShootAudio = fn.stopPlayerShootAudio;
  var updatePlayerShootAudio = fn.updatePlayerShootAudio;
  var movementIceAudioPresentation = fn.movementIceAudioPresentation;
  var movementIceAudioAudible = fn.movementIceAudioAudible;
  var syncMovementIceAudioNodes = fn.syncMovementIceAudioNodes;
  var startMovementIceAudio = fn.startMovementIceAudio;
  var stopMovementIceAudio = fn.stopMovementIceAudio;
  var updateMovementIceAudio = fn.updateMovementIceAudio;
  var pauseAudioPresentation = fn.pauseAudioPresentation;
  var syncPauseAudioNodes = fn.syncPauseAudioNodes;
  var startPauseAudio = fn.startPauseAudio;
  var stopPauseAudio = fn.stopPauseAudio;
  var updatePauseAudio = fn.updatePauseAudio;
  var scoreCountAudioPresentation = fn.scoreCountAudioPresentation;
  var syncScoreCountAudioNodes = fn.syncScoreCountAudioNodes;
  var startScoreCountAudio = fn.startScoreCountAudio;
  var stopScoreCountAudio = fn.stopScoreCountAudio;
  var updateScoreCountAudio = fn.updateScoreCountAudio;
  var stageBonusAudioPresentation = fn.stageBonusAudioPresentation;
  var stageBonusAudioAudible = fn.stageBonusAudioAudible;
  var syncStageBonusAudioNodes = fn.syncStageBonusAudioNodes;
  var startStageBonusAudio = fn.startStageBonusAudio;
  var stopStageBonusAudio = fn.stopStageBonusAudio;
  var updateStageBonusAudio = fn.updateStageBonusAudio;
  var gameOverAudioPresentation = fn.gameOverAudioPresentation;
  var syncGameOverAudioNodes = fn.syncGameOverAudioNodes;
  var startGameOverAudio = fn.startGameOverAudio;
  var stopGameOverAudio = fn.stopGameOverAudio;
  var updateGameOverAudio = fn.updateGameOverAudio;
  var highScoreAudioPresentation = fn.highScoreAudioPresentation;
  var syncHighScoreAudioNodes = fn.syncHighScoreAudioNodes;
  var startHighScoreAudio = fn.startHighScoreAudio;
  var stopHighScoreAudio = fn.stopHighScoreAudio;
  var updateHighScoreAudio = fn.updateHighScoreAudio;
  var movementAudioPresentation = fn.movementAudioPresentation;
  var stopMovementAudioNode = fn.stopMovementAudioNode;
  var startMovementAudioNode = fn.startMovementAudioNode;
  var setMovementAudioMode = fn.setMovementAudioMode;
  var stopMovementAudio = fn.stopMovementAudio;
  var playerHasMovementSoundState = fn.playerHasMovementSoundState;
  var playerMovementAudioRequested = fn.playerMovementAudioRequested;
  var movementAudioModeForState = fn.movementAudioModeForState;
  var syncMovementAudio = fn.syncMovementAudio;
  var beep = fn.beep;
  var playSoundVoice = fn.playSoundVoice;
  var playSound = fn.playSound;


  // Deps module aliases
  var CARRIER_FLASH_COLOR = deps.CARRIER_FLASH_COLOR;
  var CARRIER_FLASH_PHASE_FRAMES = deps.CARRIER_FLASH_PHASE_FRAMES;
  var DEFAULT_ENEMY_TOTAL = deps.DEFAULT_ENEMY_TOTAL;
  var DEFAULT_ENEMY_TYPES = deps.DEFAULT_ENEMY_TYPES;
  var DEFAULT_ORIGINAL_STAGE_COUNT = deps.DEFAULT_ORIGINAL_STAGE_COUNT;
  var DEFAULT_PLAYER_UPGRADE_RULES = deps.DEFAULT_PLAYER_UPGRADE_RULES;
  var DIR_X = deps.DIR_X;
  var DIR_Y = deps.DIR_Y;
  var DOWN = deps.DOWN;
  var FIXED_FRAME_AUDIO_UPDATE_MODE = deps.FIXED_FRAME_AUDIO_UPDATE_MODE;
  var FREE_AUDIO_MANIFEST = deps.FREE_AUDIO_MANIFEST;
  var FULL_BRICK_FRAGMENT_MASK = deps.FULL_BRICK_FRAGMENT_MASK;
  var FULL_GAME_OVER_SCREEN_FRAMES = deps.FULL_GAME_OVER_SCREEN_FRAMES;
  var HIGH_SCORE_SCREEN_FRAMES = deps.HIGH_SCORE_SCREEN_FRAMES;
  var LEFT = deps.LEFT;
  var ORIGINAL_EDITOR_PATTERNS = deps.ORIGINAL_EDITOR_PATTERNS;
  var RIGHT = deps.RIGHT;
  var STAGE_CURTAIN_CLOSE_FRAMES = deps.STAGE_CURTAIN_CLOSE_FRAMES;
  var UP = deps.UP;
  var advanceFixedFrameAudioState = deps.advanceFixedFrameAudioState;
  var advanceFrameCounter = deps.advanceFrameCounter;
  // (baseDestructionPresentation — local wrapper, not deps alias)
  var beginFixedFrameAudioState = deps.beginFixedFrameAudioState;
  var brickFragmentRect = deps.brickFragmentRect;
  var brickFragmentsFromQuarterMask = deps.brickFragmentsFromQuarterMask;
  var buildBaseWall = deps.buildBaseWall;
  var canPlayerCollectPowerUp = deps.canPlayerCollectPowerUp;
  var clamp = deps.clamp;
  var clearTile = deps.clearTile;
  var cloneAudioManifest = deps.cloneAudioManifest;
  var cloneEnemyTypes = deps.cloneEnemyTypes;
  var cloneExplosionRules = deps.cloneExplosionRules;
  var cloneGrid = deps.cloneGrid;
  var clonePlayerMovementSettings = deps.clonePlayerMovementSettings;
  var clonePlayerUpgradeRules = deps.clonePlayerUpgradeRules;
  var cloneSpriteManifest = deps.cloneSpriteManifest;
  var cloneWallRules = deps.cloneWallRules;
  var combatSettings = deps.combatSettings;
  var createBuiltInStagePack = deps.createBuiltInStagePack;
  var createEditorStagePack = deps.createEditorStagePack;
  var createFixedFrameAudioState = deps.createFixedFrameAudioState;
  var createPlayerState = deps.createPlayerState;
  var createStagePackSchema = deps.createStagePackSchema;
  var createStageRuntime = deps.createStageRuntime;
  var directionName = deps.directionName;
  var directionTowardTarget = deps.directionTowardTarget;
  var enemyAiSettings = deps.enemyAiSettings;
  var enemyColor = deps.enemyColor;
  // (enemyDestructionPresentation — local wrapper, not deps alias)
  // (explosionPresentation — local wrapper, not deps alias)
  var fixedFrameAudioPresentation = deps.fixedFrameAudioPresentation;
  var fixedFrameAudioUpdateMode = deps.fixedFrameAudioUpdateMode;
  var fixedFrameVoiceDuration = deps.fixedFrameVoiceDuration;
  var fixedFrameVoiceIsAudible = deps.fixedFrameVoiceIsAudible;
  // (fullGameOverPresentation — local wrapper, not deps alias)
  var gameOverBannerPresentation = deps.gameOverBannerPresentation;
  var gameSessionSettings = deps.gameSessionSettings;
  var gridToQuadrants = deps.gridToQuadrants;
  // (highScorePresentation — local wrapper, not deps alias)
  var isEditorDirectionCode = deps.isEditorDirectionCode;
  var isEnemyAtTurnIntersection = deps.isEnemyAtTurnIntersection;
  var isMovementAudioBlocked = deps.isMovementAudioBlocked;
  var isPlayerShieldVisible = deps.isPlayerShieldVisible;
  var isPlayerTankVisible = deps.isPlayerTankVisible;
  var makeCell = deps.makeCell;
  var makeGrid = deps.makeGrid;
  var makeOriginalConstructionGrid = deps.makeOriginalConstructionGrid;
  // (moveEditorCursor — local wrapper, not deps alias)
  var movementAudioPresentation = deps.movementAudioPresentation;
  var normalizeBrickFragmentMask = deps.normalizeBrickFragmentMask;
  // (panelEnemyCounterRemaining — local wrapper, not deps alias)
  // (panelLifeCount — local wrapper, not deps alias)
  var parseEditorStageText = deps.parseEditorStageText;
  var parseJsonText = deps.parseJsonText;
  var parseStageQuadrants = deps.parseStageQuadrants;
  // (pausePresentation — local wrapper, not deps alias)
  var pixelGlyph = deps.pixelGlyph;
  // (playerDestructionPresentation — local wrapper, not deps alias)
  // (playerGameOverMessagePresentation — local wrapper, not deps alias)
  var playerUpgradeOverlayParts = deps.playerUpgradeOverlayParts;
  var powerUpPixelToTilePoint = deps.powerUpPixelToTilePoint;
  var prepareBattleGrid = deps.prepareBattleGrid;
  var prepareConstructedBattleGrid = deps.prepareConstructedBattleGrid;
  var proceduralStage = deps.proceduralStage;
  var quarterMaskFromBrickFragments = deps.quarterMaskFromBrickFragments;
  var quarterRect = deps.quarterRect;
  var rectOverlapArea = deps.rectOverlapArea;
  var resetFixedFrameAudioState = deps.resetFixedFrameAudioState;
  var resetFrameCounter = deps.resetFrameCounter;
  var resetPlayerState = deps.resetPlayerState;
  var resolveAudioAudibility = deps.resolveAudioAudibility;
  var resolveMovementAudioMode = deps.resolveMovementAudioMode;
  // (scorePopupPresentation — local wrapper, not deps alias)
  var serializeEditorStage = deps.serializeEditorStage;
  var serializeEditorStagePack = deps.serializeEditorStagePack;
  var sharedState = deps.sharedState;
  var shieldColorForTick = deps.shieldColorForTick;
  var spawnAnimationPresentation = deps.spawnAnimationPresentation;
  var stageFlowSettings = deps.stageFlowSettings;
  // (stageIntroCurtainState — local wrapper, not deps alias)
  var stageResultVisibleKillCount = deps.stageResultVisibleKillCount;
  var stageRouting = deps.stageRouting;
  // (stageSelectCurtainState — local wrapper, not deps alias)
  var summarizeEnemySequences = deps.summarizeEnemySequences;
  // (tankDestructionPresentation — local wrapper, not deps alias)
  var tankPrimaryColor = deps.tankPrimaryColor;
  var tankTrackFrameName = deps.tankTrackFrameName;
  var targetableEnemyPlayers = deps.targetableEnemyPlayers;
  var timingSettings = deps.timingSettings;
  // (titleScoreLayout — local wrapper, not deps alias)
  var tryNormalizeStagePack = deps.tryNormalizeStagePack;
  var valueNormalization = deps.valueNormalization;

  // Renamed import aliases (original → local name)
  var selectFixedFrameAudioPresentation = deps.fixedFrameAudioPresentation;
  var selectMovementAudioPresentation = deps.movementAudioPresentation;
  var selectAudioAudibility = deps.resolveAudioAudibility;
  var selectMovementAudioMode = deps.resolveMovementAudioMode;
  var selectFullGameOverPresentation = deps.fullGameOverPresentation;
  var selectHighScorePresentation = deps.highScorePresentation;
  var selectTitleScoreLayout = deps.titleScoreLayout;
  var defaultEnemyTypes = deps.DEFAULT_ENEMY_TYPES;

  var textRenderRuntime = deps.requireRuntimeModule("textRenderRuntime").setupTextRenderRuntime(state, deps);
  var spriteRenderRuntime = deps.requireRuntimeModule("spriteRenderRuntime").setupSpriteRenderRuntime(state, deps);
  var drawMiniTank = spriteRenderRuntime.drawMiniTank;
  var battleSceneRenderRuntime = deps.requireRuntimeModule("battleSceneRenderRuntime").setupBattleSceneRenderRuntime(state, deps, {
    battleDisplayFrame: battleDisplayFrame,
    drawBullet: drawBullet,
    drawPowerUp: drawPowerUp,
    drawShield: drawShield,
    drawSpawn: drawSpawn,
    drawTank: drawTank,
    enemyColor: enemyColor,
    isPlayerShieldVisible: isPlayerShieldVisible,
    isPlayerTankVisible: isPlayerTankVisible,
    renderBase: renderBase,
    renderBaseDestruction: renderBaseDestruction,
    renderEnemyDestructions: renderEnemyDestructions,
    renderExplosions: renderExplosions,
    renderPanel: renderPanel,
    renderPlayerDestructions: renderPlayerDestructions,
    renderPlayerGameOverMessage: renderPlayerGameOverMessage,
    renderProjectileTerrainCover: renderProjectileTerrainCover,
    renderScorePopups: renderScorePopups,
    renderTerrain: renderTerrain
  });
  deps.requireRuntimeModule("tankMovementRuntime").setupTankMovementRuntime(state, deps);
  var frameCounterRuntime = deps.requireRuntimeModule("frameCounterRuntime").setupFrameCounterRuntime(state, deps);
  deps.requireRuntimeModule("playerMovementRuntime").setupPlayerMovementRuntime(state, deps, {
    advanceTankTracks: fn.advanceTankTracks,
    gameSettings: gameSettings,
    isPerpendicularTurn: fn.isPerpendicularTurn,
    isTankOnIce: fn.isTankOnIce,
    moveTank: fn.moveTank,
    playSound: playSound,
    snapForDirection: fn.snapForDirection
  });
  deps.requireRuntimeModule("transientEffectsRuntime").setupTransientEffectsRuntime(state, deps, {
    gameSettings: gameSettings
  });
  deps.requireRuntimeModule("projectileRuntime").setupProjectileRuntime(state, deps, {
    gameSettings: gameSettings,
    playSound: playSound
  });
  deps.requireRuntimeModule("battleCombatRuntime").setupBattleCombatRuntime(state, deps, {
    explosionRule: fn.explosionRule,
    gameSettings: gameSettings,
    playSound: playSound,
    resetFrameCounterLow: frameCounterRuntime.resetFrameCounterLow,
    resetPlayerPosition: fn.resetPlayerPosition,
    updateHighScore: fn.updateHighScore
  });
  deps.requireRuntimeModule("stageResultRuntime").setupStageResultRuntime(state, deps, {
    addPlayerScore: fn.addPlayerScore,
    enemyDataStage: enemyDataStage,
    enemyTypeDefinitions: enemyTypeDefinitions,
    gameSettings: gameSettings,
    mapDataStage: mapDataStage,
    playSound: playSound,
    stageCycleLimit: stageCycleLimit
  });
  deps.requireRuntimeModule("stageFlowRuntime").setupStageFlowRuntime(state, deps, {
    awardPendingStageClearBonus: fn.awardPendingStageClearBonus,
    gameSettings: gameSettings,
    resetTitleIdleTimer: fn.resetTitleIdleTimer,
    stageAdvanceResult: fn.stageAdvanceResult,
    stageClearBonusRecipients: fn.stageClearBonusRecipients,
    stageCurtainCloseFrames: function () { return STAGE_CURTAIN_CLOSE_FRAMES; },
    stageResultDuration: fn.stageResultDuration,
    startFullGameOverScreen: fn.startFullGameOverScreen,
    startStage: fn.startStage,
    stopGameplayAudioBeforeResult: fn.stopGameplayAudioBeforeResult,
    stopStageResultAudio: fn.stopStageResultAudio
  });
  var gameOverEntryRuntime = deps.requireRuntimeModule("gameOverEntryRuntime").setupGameOverEntryRuntime(state, deps, {
    endTitleDemo: fn.endTitleDemo,
    extendedStageEndFrameHigh: function () { return EXTENDED_STAGE_END_FRAME_HIGH; },
    gameOverFieldDuration: fn.gameOverFieldDuration,
    resetFrameCounters: frameCounterRuntime.resetFrameCounters,
    stopBonusLifeAudio: stopBonusLifeAudio,
    stopBrickHitAudio: stopBrickHitAudio,
    stopEnemyDestroyAudio: stopEnemyDestroyAudio,
    stopEnemyHitAudio: stopEnemyHitAudio,
    stopMovementAudio: stopMovementAudio,
    stopMovementIceAudio: stopMovementIceAudio,
    stopPauseAudio: stopPauseAudio,
    stopPlayerShootAudio: stopPlayerShootAudio,
    stopPowerUpAppearAudio: stopPowerUpAppearAudio,
    stopPowerUpPickupAudio: stopPowerUpPickupAudio,
    stopScoreCountAudio: stopScoreCountAudio,
    stopStageBonusAudio: stopStageBonusAudio,
    stopStageStartAudio: stopStageStartAudio,
    stopSteelHitAudio: stopSteelHitAudio
  });
  deps.requireRuntimeModule("battleOutcomeRuntime").setupBattleOutcomeRuntime(state, deps, {
    endTitleDemo: fn.endTitleDemo,
    enterGameOver: gameOverEntryRuntime.enterGameOver,
    enterStageClear: fn.enterStageClear,
    extendedStageEndFrameHigh: function () { return EXTENDED_STAGE_END_FRAME_HIGH; },
    gameSettings: gameSettings,
    playerGameOverMessageActive: function () { return fn.playerGameOverMessageActive(); },
    playerGameOverStageEndDelay: function () { return PLAYER_GAME_OVER_STAGE_END_DELAY; },
    resetFrameCounters: frameCounterRuntime.resetFrameCounters,
    stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); }
  });
  deps.requireRuntimeModule("playerUpdateRuntime").setupPlayerUpdateRuntime(state, deps, {
    directionTowardTarget: directionTowardTarget,
    finishPlayerDeath: fn.finishPlayerDeath,
    gameSettings: gameSettings,
    shoot: fn.shoot,
    updatePlayerMovement: fn.updatePlayerMovement
  });
  deps.requireRuntimeModule("battleTimingRuntime").setupBattleTimingRuntime(state, deps, {
    enemyTotal: enemyTotal,
    gameSettings: gameSettings
  });
  deps.requireRuntimeModule("battleRandomRuntime").setupBattleRandomRuntime(state, deps, {
    enemyTotal: enemyTotal,
    getEnemySpec: getEnemySpec
  });
  deps.requireRuntimeModule("powerUpRuntime").setupPowerUpRuntime(state, deps, {
    addPlayerScore: fn.addPlayerScore,
    addScorePopup: fn.addScorePopup,
    buildBaseWall: buildBaseWall,
    canTankOccupy: fn.canTankOccupy,
    destroyEnemy: fn.destroyEnemy,
    gameSettings: gameSettings,
    playSound: playSound,
    randomByte: fn.randomByte,
    rectHitsSolidTerrain: fn.rectHitsSolidTerrain,
    stageSettings: stageSettings
  });
  deps.requireRuntimeModule("enemySpawnRuntime").setupEnemySpawnRuntime(state, deps, {
    clearPowerUpForCarrierSpawn: function (carrier) {
      return fn.clearPowerUpForCarrierSpawn(carrier);
    },
    enemyTypeDefinitions: enemyTypeDefinitions,
    enemySpawnPoint: enemySpawnPoint,
    enemyTotal: enemyTotal,
    gameSettings: gameSettings,
    getEnemySpec: getEnemySpec,
    isExtendedLoopStage: isExtendedLoopStage,
    maxActiveEnemies: maxActiveEnemies,
    stageCycleLimit: stageCycleLimit
  });
  deps.requireRuntimeModule("enemyAiRuntime").setupEnemyAiRuntime(state, deps, {
    defaultEnemySpawnDelay: fn.defaultEnemySpawnDelay,
    directionTowardTarget: directionTowardTarget,
    gameSettings: gameSettings,
    randomByte: fn.randomByte,
    scaleEnemySpawnDelayForPlayers: fn.scaleEnemySpawnDelayForPlayers,
    selectEnemyTargetPlayer: deps.selectEnemyTargetPlayer
  });
  deps.requireRuntimeModule("enemyMovementRuntime").setupEnemyMovementRuntime(state, deps, {
    advanceTankTracks: fn.advanceTankTracks,
    aiRoll: fn.aiRoll,
    canTankOccupy: fn.canTankOccupy,
    chooseEnemyDirectionByPhase: fn.chooseEnemyDirectionByPhase,
    gameSettings: gameSettings,
    isEnemyAtTurnIntersection: isEnemyAtTurnIntersection,
    moveTank: fn.moveTank,
    randomByte: fn.randomByte,
    totalTankOverlapArea: fn.totalTankOverlapArea
  });
  deps.requireRuntimeModule("enemyUpdateRuntime").setupEnemyUpdateRuntime(state, deps, {
    explosionRule: fn.explosionRule,
    gameSettings: gameSettings,
    shoot: fn.shoot,
    shouldEnemyFire: fn.shouldEnemyFire,
    updateEnemyMovement: fn.updateEnemyMovement
  });
  deps.requireRuntimeModule("projectileTargetRuntime").setupProjectileTargetRuntime(state, deps, {
    addRuleExplosion: fn.addRuleExplosion,
    baseDestructionDuration: fn.baseDestructionDuration,
    destroyEnemy: fn.destroyEnemy,
    gameSettings: gameSettings,
    killPlayer: fn.killPlayer,
    playSound: playSound,
    releaseCarrierPowerUp: fn.releaseCarrierPowerUp
  });
  deps.requireRuntimeModule("projectileResolutionRuntime").setupProjectileResolutionRuntime(state, deps, {
    addRuleExplosion: fn.addRuleExplosion,
    gameSettings: gameSettings,
    hitBase: fn.hitBase,
    hitTank: fn.hitTank,
    hitTerrain: fn.hitTerrain,
    playSound: playSound
  });
  deps.requireRuntimeModule("projectileMotionRuntime").setupProjectileMotionRuntime(state, deps, {
    resolveBullet: fn.resolveBullet
  });
  deps.requireRuntimeModule("battleLoopRuntime").setupBattleLoopRuntime(state, deps, {
    checkEndState: fn.checkEndState,
    spawnEnemies: fn.spawnEnemies,
    shouldSpawnEnemies: shouldSpawnEnemies,
    syncMovementAudio: syncMovementAudio,
    updateBaseDestructionTimer: fn.updateBaseDestructionTimer,
    updateBullets: fn.updateBullets,
    updateEnemies: fn.updateEnemies,
    updateExplosions: fn.updateExplosions,
    updateFreezeTimer: fn.updateFreezeTimer,
    updatePlayerGameOverMessage: fn.updatePlayerGameOverMessage,
    updatePlayerInvulnerabilityTimers: fn.updatePlayerInvulnerabilityTimers,
    updatePlayers: fn.updatePlayers,
    updatePowerUp: fn.updatePowerUp,
    updateScorePopups: fn.updateScorePopups,
    updateShovelTimer: fn.updateShovelTimer
  });
  var frameLoopRuntime = deps.requireRuntimeModule("frameLoopRuntime").setupFrameLoopRuntime(state, deps, {
    now: function () { return performance.now(); },
    render: render,
    requestAnimationFrame: function (callback) { return requestAnimationFrame(callback); },
    stepMs: function () { return sh.STEP_MS; },
    update: update
  });
  var screenUpdateRuntime = deps.requireRuntimeModule("screenUpdateRuntime").setupScreenUpdateRuntime(state, deps, {
    advanceFrameCounters: frameCounterRuntime.advanceFrameCounters,
    awardPendingStageClearBonus: fn.awardPendingStageClearBonus,
    checkEndState: fn.checkEndState,
    finishGameOverScreen: fn.finishGameOverScreen,
    finishStageClearClosing: fn.finishStageClearClosing,
    finishStageResult: fn.finishStageResult,
    playSound: playSound,
    resetFrameCounterHigh: frameCounterRuntime.resetFrameCounterHigh,
    stageClearPresentation: fn.stageClearPresentation,
    stageResultVisibleKillCount: stageResultVisibleKillCount,
    syncMovementAudio: syncMovementAudio,
    updateAudio: fn.updateAllAudio,
    updateBattle: fn.updateBattle,
    updateEditorControls: fn.updateEditorControls,
    updateExplosions: fn.updateExplosions,
    updateFullGameOverScreen: fn.updateFullGameOverScreen,
    updateHighScoreScreen: fn.updateHighScoreScreen,
    updateHiddenMessage: fn.updateHiddenMessage,
    updateScorePopups: fn.updateScorePopups,
    updateStageSelectControls: fn.updateStageSelectControls,
    updateTitleIdle: fn.updateTitleIdle
  });
  var renderCompositionRuntime = deps.requireRuntimeModule("renderCompositionRuntime").setupRenderCompositionRuntime(state, deps, {
    battleDisplayFrame: battleDisplayFrame,
    createStageGrid: createStageGrid,
    directionName: directionName,
    drawBrickCell: drawBrickCell,
    drawForest: drawForest,
    drawIce: drawIce,
    drawManifestSprite: drawManifestSprite,
    drawMiniTank: drawMiniTank,
    drawScaledManifestSprite: drawScaledManifestSprite,
    drawText: drawText,
    drawTextClipped: drawTextClipped,
    drawTextRight: drawTextRight,
    drawWallCell: drawWallCell,
    drawWater: drawWater,
    enemyTotal: enemyTotal,
    explosionRule: fn.explosionRule,
    fullGameOverPresentation: fullGameOverPresentation,
    gameSettings: gameSettings,
    highScorePresentation: highScorePresentation,
    hiddenMessagePresentation: fn.hiddenMessagePresentation,
    normalizeBrickFragmentMask: normalizeBrickFragmentMask,
    pixelGlyph: pixelGlyph,
    playerUpgradeOverlayParts: playerUpgradeOverlayParts,
    quarterMaskFromBrickFragments: quarterMaskFromBrickFragments,
    renderBase: renderBase,
    renderCurtain: renderCurtain,
    renderEditor: renderEditor,
    renderFullGameOver: renderFullGameOver,
    renderGame: renderGame,
    renderGameBackdrop: renderGameBackdrop,
    renderGameOver: renderGameOver,
    renderHighScore: renderHighScore,
    renderHiddenMessage: renderHiddenMessage,
    renderPause: renderPause,
    renderStageClear: renderStageClear,
    renderStageClearClosing: renderStageClearClosing,
    renderStageIntro: renderStageIntro,
    renderStageSelect: renderStageSelect,
    renderStageSelectClosing: renderStageSelectClosing,
    renderTerrain: renderTerrain,
    renderTitle: renderTitle,
    shieldColorForTick: shieldColorForTick,
    spawnAnimationPresentation: spawnAnimationPresentation,
    stageClearPresentation: fn.stageClearPresentation,
    stageSelectCurtainState: stageSelectCurtainState,
    tankPrimaryColor: tankPrimaryColor,
    tankTrackFrameName: tankTrackFrameName,
    titleScoreLayout: titleScoreLayout
  });
  var titleRenderRuntime = renderCompositionRuntime.titleRenderRuntime;
  var terrainRenderRuntime = renderCompositionRuntime.terrainRenderRuntime;
  var tankRenderRuntime = renderCompositionRuntime.tankRenderRuntime;
  var powerUpRenderRuntime = renderCompositionRuntime.powerUpRenderRuntime;
  var projectileRenderRuntime = renderCompositionRuntime.projectileRenderRuntime;
  var effectRenderRuntime = renderCompositionRuntime.effectRenderRuntime;
  var stageResultRenderRuntime = renderCompositionRuntime.stageResultRenderRuntime;
  var battleHudRenderRuntime = renderCompositionRuntime.battleHudRenderRuntime;
  var editorRenderRuntime = renderCompositionRuntime.editorRenderRuntime;
  var screenTransitionRenderRuntime = renderCompositionRuntime.screenTransitionRenderRuntime;
  var screenRenderRuntime = renderCompositionRuntime.screenRenderRuntime;

  // Runtime methods are referenced only after all extracted modules register them.
  var loadHighScore = fn.loadHighScore;
  var saveHighScore = fn.saveHighScore;
  var updateHighScore = fn.updateHighScore;
  var createPlayer = fn.createPlayer;
  var resetPlayerPosition = fn.resetPlayerPosition;
  var startGame = fn.startGame;
  var startTitleDemo = fn.startTitleDemo;
  var endTitleDemo = fn.endTitleDemo;
  var updateTitleIdle = fn.updateTitleIdle;
  var resetTitleIdleTimer = fn.resetTitleIdleTimer;
  var resetTitleIdleHighByte = fn.resetTitleIdleHighByte;
  var hiddenMessageTriggerReady = fn.hiddenMessageTriggerReady;
  var reserveTitleDirectionForHiddenInput = fn.reserveTitleDirectionForHiddenInput;
  var recordHiddenTitleInput = fn.recordHiddenTitleInput;
  var startHiddenMessage = fn.startHiddenMessage;
  var updateHiddenMessage = fn.updateHiddenMessage;
  var hiddenMessagePresentation = fn.hiddenMessagePresentation;
  var beginStageSelect = fn.beginStageSelect;
  var startSelectedGame = fn.startSelectedGame;
  var stageSelectLimit = fn.stageSelectLimit;
  var changeStageSelection = fn.changeStageSelection;
  var startStage = fn.startStage;
  var resetStageStats = fn.resetStageStats;
  var enterEditor = fn.enterEditor;
  var exitEditorToTitle = fn.exitEditorToTitle;
  var moveTitleMenu = fn.moveTitleMenu;
  var setTitleMenu = fn.setTitleMenu;
  var activateTitleMenu = fn.activateTitleMenu;
  var testEditorStage = fn.testEditorStage;
  var saveEditorStage = fn.saveEditorStage;
  var loadEditorStage = fn.loadEditorStage;
  var clearEditorStage = fn.clearEditorStage;
  var exportEditorStage = fn.exportEditorStage;
  var importStagePackFile = fn.importStagePackFile;
  var loadStagePackJsonText = fn.loadStagePackJsonText;
  var loadStagePackObject = fn.loadStagePackObject;
  var applyStagePack = fn.applyStagePack;
  var clearTransientBattleState = fn.clearTransientBattleState;
  var restoreBuiltInStagePack = fn.restoreBuiltInStagePack;
  var showEditorMessage = fn.showEditorMessage;
  var nextStage = fn.nextStage;
  var moveEditorFromCode = fn.moveEditorFromCode;
  var moveEditorCursor = fn.moveEditorCursor;
  var useOriginalEditorButton = fn.useOriginalEditorButton;
  var pasteOriginalEditorPattern = fn.pasteOriginalEditorPattern;
  var editAtEditorCursor = fn.editAtEditorCursor;
  var paintEditorCell = fn.paintEditorCell;
  var paintEditorQuadrant = fn.paintEditorQuadrant;
  var selectEditorBrush = fn.selectEditorBrush;
  var selectEditorBrushFromPanel = fn.selectEditorBrushFromPanel;
  var cycleEditorCell = fn.cycleEditorCell;
  var cycleEditorQuadrant = fn.cycleEditorQuadrant;
  var updateEditorControls = fn.updateEditorControls;
  var stageSelectAHeld = fn.stageSelectAHeld;
  var stageSelectBHeld = fn.stageSelectBHeld;
  var updateStageSelectControls = fn.updateStageSelectControls;
  var startFullGameOverScreen = fn.startFullGameOverScreen;
  var updateFullGameOverScreen = fn.updateFullGameOverScreen;
  var handleFullGameOverInput = fn.handleFullGameOverInput;
  var finishFullGameOverScreen = fn.finishFullGameOverScreen;
  var startHighScoreScreen = fn.startHighScoreScreen;
  var updateHighScoreScreen = fn.updateHighScoreScreen;
  var returnToTitleAfterGame = fn.returnToTitleAfterGame;
  var enterStageClear = fn.enterStageClear;
  var enterStageResult = fn.enterStageResult;
  var finishStageResult = fn.finishStageResult;
  var finishStageClearClosing = fn.finishStageClearClosing;
  var finishGameOverScreen = fn.finishGameOverScreen;
  var gameOverFieldDuration = fn.gameOverFieldDuration;
  var checkEndState = fn.checkEndState;
  var updateBattle = fn.updateBattle;

  deps.requireRuntimeModule("inputRuntime").setupInputRuntime(state, {
    dom: { document: document, window: window },
    isEditorDirectionCode: isEditorDirectionCode,
    sharedState: sh
  }, {
    activateTitleMenu: activateTitleMenu,
    beginStageSelect: beginStageSelect,
    clearEditorStage: clearEditorStage,
    cycleEditorCell: cycleEditorCell,
    cycleEditorQuadrant: cycleEditorQuadrant,
    endTitleDemo: endTitleDemo,
    enterEditor: enterEditor,
    exitEditorToTitle: exitEditorToTitle,
    exportEditorStage: exportEditorStage,
    handleFullGameOverInput: handleFullGameOverInput,
    hiddenMessageTriggerReady: hiddenMessageTriggerReady,
    importStagePackFile: importStagePackFile,
    initAudio: initAudio,
    loadEditorStage: loadEditorStage,
    loadStagePackJsonText: loadStagePackJsonText,
    moveEditorFromCode: moveEditorFromCode,
    moveTitleMenu: moveTitleMenu,
    nextStage: nextStage,
    paintEditorCell: paintEditorCell,
    paintEditorQuadrant: paintEditorQuadrant,
    playSound: playSound,
    recordHiddenTitleInput: recordHiddenTitleInput,
    reserveTitleDirectionForHiddenInput: reserveTitleDirectionForHiddenInput,
    restoreBuiltInStagePack: restoreBuiltInStagePack,
    saveEditorStage: saveEditorStage,
    selectEditorBrush: selectEditorBrush,
    setTitleMenu: setTitleMenu,
    showEditorMessage: showEditorMessage,
    stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); },
    startHiddenMessage: startHiddenMessage,
    startSelectedGame: startSelectedGame,
    syncBaseHitAudioNodes: syncBaseHitAudioNodes,
    syncBonusLifeAudioNodes: syncBonusLifeAudioNodes,
    syncBrickHitAudioNodes: syncBrickHitAudioNodes,
    syncEnemyDestroyAudioNodes: syncEnemyDestroyAudioNodes,
    syncEnemyHitAudioNodes: syncEnemyHitAudioNodes,
    syncMovementAudio: syncMovementAudio,
    syncMovementIceAudioNodes: syncMovementIceAudioNodes,
    syncPauseAudioNodes: syncPauseAudioNodes,
    syncPlayerDestroyAudioNodes: syncPlayerDestroyAudioNodes,
    syncPlayerShootAudioNodes: syncPlayerShootAudioNodes,
    syncPowerUpAppearAudioNodes: syncPowerUpAppearAudioNodes,
    syncPowerUpPickupAudioNodes: syncPowerUpPickupAudioNodes,
    syncStageStartAudioNodes: syncStageStartAudioNodes,
    syncSteelHitAudioNodes: syncSteelHitAudioNodes,
    testEditorStage: testEditorStage,
    useOriginalEditorButton: useOriginalEditorButton
  });

  function update() {
    return screenUpdateRuntime.updateFrame();
  }

  function tileTypeName(type) {
    if (type === BRICK) return "brick";
    if (type === STEEL) return "steel";
    if (type === WATER) return "water";
    if (type === FOREST) return "forest";
    if (type === ICE) return "ice";
    return "empty";
  }

  function shouldSpawnEnemies() {
    return true;
  }

  function render() {
    return screenRenderRuntime.render();
  }

  function renderTitle() {
    return titleRenderRuntime.renderTitle();
  }

  function renderHiddenMessage() {
    return titleRenderRuntime.renderHiddenMessage();
  }

  function renderHighScore() {
    return titleRenderRuntime.renderHighScore();
  }

  function renderFullGameOver() {
    return titleRenderRuntime.renderFullGameOver();
  }

  function fullGameOverPresentation(elapsed) {
    return selectFullGameOverPresentation(elapsed);
  }

  function highScorePresentation(elapsed, score) {
    return selectHighScorePresentation(elapsed, score, { screenWidth: SCREEN_W });
  }

  function titleScoreLayout(menuIndex) {
    const selected = menuIndex === undefined ? game.titleMenu : menuIndex;
    return selectTitleScoreLayout(selected, game.highScore);
  }

  function drawStripedTitleText(text, x, y, scale, palette) {
    return titleRenderRuntime.drawStripedTitleText(text, x, y, scale, palette);
  }

  function drawTitleMenuCursor(item) {
    return titleRenderRuntime.drawTitleMenuCursor(item);
  }

  function renderStageSelect() {
    return screenTransitionRenderRuntime.renderStageSelect();
  }

  function renderStageSelectClosing() {
    return screenTransitionRenderRuntime.renderStageSelectClosing();
  }

  function renderGame() {
    return battleSceneRenderRuntime.renderGame();
  }

  function renderGameBackdrop(grid) {
    return terrainRenderRuntime.renderGameBackdrop(grid);
  }

  function renderTerrain(topLayer, grid) {
    return terrainRenderRuntime.renderTerrain(topLayer, grid);
  }

  function drawWallCell(x, y, mask, dark, light) {
    return terrainRenderRuntime.drawWallCell(x, y, mask, dark, light);
  }

  function drawBrickCell(x, y, cell) {
    return terrainRenderRuntime.drawBrickCell(x, y, cell);
  }

  function drawWater(x, y) {
    return terrainRenderRuntime.drawWater(x, y);
  }

  function waterFrameName(tick) {
    return terrainRenderRuntime.waterFrameName(tick);
  }

  function drawIce(x, y) {
    return terrainRenderRuntime.drawIce(x, y);
  }

  function renderProjectileTerrainCover(grid) {
    return terrainRenderRuntime.renderProjectileTerrainCover(grid);
  }

  function drawIceProjectileCover(x, y) {
    return terrainRenderRuntime.drawIceProjectileCover(x, y);
  }

  function drawForest(x, y) {
    return terrainRenderRuntime.drawForest(x, y);
  }

  function renderBase() {
    return terrainRenderRuntime.renderBase();
  }

  function drawTank(tank, color, accent) {
    return tankRenderRuntime.drawTank(tank, color, accent);
  }

  function drawPlayerUpgradeOverlay(tank, x, y, accent) {
    return tankRenderRuntime.drawPlayerUpgradeOverlay(tank, x, y, accent);
  }

  function drawShield(tank) {
    return tankRenderRuntime.drawShield(tank);
  }

  function drawSpawn(tank) {
    return tankRenderRuntime.drawSpawn(tank);
  }

  function drawBullet(bullet) {
    return projectileRenderRuntime.drawBullet(bullet);
  }

  function drawPowerUp(power) {
    return powerUpRenderRuntime.drawPowerUp(power);
  }

  function isPowerUpVisible(tick) {
    return powerUpRenderRuntime.isPowerUpVisible(tick);
  }

  /**
   * Returns the visual frame phase used by display handlers that keep running
   * while the battle simulation is paused.
   */
  function battleDisplayFrame() {
    return game.frameLow;
  }

  function powerUpVisualRect(power) {
    return powerUpRenderRuntime.powerUpVisualRect(power);
  }

  function drawManifestSprite(spriteName, frameName, x, y, palette) {
    return spriteRenderRuntime.drawManifestSprite(spriteName, frameName, x, y, palette);
  }

  function drawScaledManifestSprite(spriteName, frameName, x, y, scale, palette) {
    return spriteRenderRuntime.drawScaledManifestSprite(spriteName, frameName, x, y, scale, palette);
  }

  function renderExplosions() {
    return effectRenderRuntime.renderExplosions();
  }

  function drawTankDestructionExplosion(explosion) {
    return effectRenderRuntime.drawTankDestructionExplosion(explosion);
  }

  function renderPlayerDestructions() {
    return effectRenderRuntime.renderPlayerDestructions();
  }

  function playerDestructionPresentation(player) {
    return effectRenderRuntime.playerDestructionPresentation(player);
  }

  function renderEnemyDestructions() {
    return effectRenderRuntime.renderEnemyDestructions();
  }

  function enemyDestructionPresentation(enemy) {
    return effectRenderRuntime.enemyDestructionPresentation(enemy);
  }

  function renderBaseDestruction() {
    return effectRenderRuntime.renderBaseDestruction();
  }

  function baseDestructionPresentation(timer) {
    return effectRenderRuntime.baseDestructionPresentation(timer);
  }

  function tankDestructionPresentation(explosion) {
    return effectRenderRuntime.tankDestructionPresentation(explosion);
  }

  function explosionPresentation(explosion) {
    return effectRenderRuntime.explosionPresentation(explosion);
  }

  function renderScorePopups() {
    return effectRenderRuntime.renderScorePopups();
  }

  function scorePopupPresentation(popup) {
    return effectRenderRuntime.scorePopupPresentation(popup);
  }

  function renderPanel() {
    return battleHudRenderRuntime.renderPanel();
  }

  function drawStageFlag(x, y) {
    return battleHudRenderRuntime.drawStageFlag(x, y);
  }

  function panelEnemyCounterRemaining(total, spawned) {
    return battleHudRenderRuntime.panelEnemyCounterRemaining(total, spawned);
  }

  function panelLifeCount(player) {
    return battleHudRenderRuntime.panelLifeCount(player);
  }

  function drawSmallScore(score, x, y, color) {
    return stageResultRenderRuntime.drawSmallScore(score, x, y, color);
  }

  function formatScore5(score) {
    return stageResultRenderRuntime.formatScore5(score);
  }

  function renderStageIntro() {
    return screenTransitionRenderRuntime.renderStageIntro();
  }

  function renderCurtain(curtain) {
    return screenTransitionRenderRuntime.renderCurtain(curtain);
  }

  function stageSelectCurtainState(timer) {
    return screenTransitionRenderRuntime.stageSelectCurtainState(timer);
  }

  function stageIntroCurtainState(timer) {
    return screenTransitionRenderRuntime.stageIntroCurtainState(timer);
  }

  function renderStageClear() {
    return stageResultRenderRuntime.renderStageClear();
  }

  function renderStageClearClosing() {
    return stageResultRenderRuntime.renderStageClearClosing();
  }

  function totalStageKills(player) {
    return stageResultRenderRuntime.totalStageKills(player);
  }

  function drawResultArrow(x, y, direction) {
    return stageResultRenderRuntime.drawResultArrow(x, y, direction);
  }

  function renderGameOver() {
    return battleHudRenderRuntime.renderGameOver();
  }

  function renderPlayerGameOverMessage() {
    return battleHudRenderRuntime.renderPlayerGameOverMessage();
  }

  function playerGameOverMessagePresentation() {
    return battleHudRenderRuntime.playerGameOverMessagePresentation();
  }

  function drawCompactGameOverWord(word, x, y) {
    return battleHudRenderRuntime.drawCompactGameOverWord(word, x, y);
  }

  function gameOverBannerY(timer) {
    return battleHudRenderRuntime.gameOverBannerY(timer);
  }

  function renderPause() {
    return battleHudRenderRuntime.renderPause();
  }

  function pausePresentation(frame) {
    return battleHudRenderRuntime.pausePresentation(frame);
  }

  function renderEditor() {
    return editorRenderRuntime.renderEditor();
  }

  function drawTileLegend(x, y) {
    return editorRenderRuntime.drawTileLegend(x, y);
  }

  function drawText(text, x, y, scale, color, advance) {
    return textRenderRuntime.drawText(text, x, y, scale, color, advance);
  }

  function drawTextClipped(text, x, y, scale, color, clips) {
    return textRenderRuntime.drawTextClipped(text, x, y, scale, color, clips);
  }

  function drawTextRight(text, right, y, scale, color) {
    return textRenderRuntime.drawTextRight(text, right, y, scale, color);
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function preparePausedDebugBattle(tick) {
    game.screen = "playing";
    game.demoMode = false;
    game.paused = true;
    game.pauseElapsed = 0;
    game.tick = Math.max(0, Math.floor(Number(tick) || 0));
    game.frameLow = game.tick & 0xff;
    game.frameHigh = Math.floor(game.tick / 0x40) & 0xff;
    game.base = { x: 6 * sh.TILE, y: 12 * sh.TILE, w: sh.TILE, h: sh.TILE, alive: true };
    game.players = [{ alive: true, lives: 1, respawn: 0 }];
    game.enemies = [];
    game.enemySpawned = 0;
    game.clearPendingTimer = 0;
    game.scorePopups = [];
  }


  // ── Register local functions on state.fn (for debug-api access) ──────
  deps.requireRuntimeModule("legacyApiRuntime").setupLegacyApiRuntime(state, {
    update: update,
    render: render,
    tileTypeName: tileTypeName,
    shouldSpawnEnemies: shouldSpawnEnemies,
    renderTitle: renderTitle,
    renderHiddenMessage: renderHiddenMessage,
    renderHighScore: renderHighScore,
    renderFullGameOver: renderFullGameOver,
    fullGameOverPresentation: fullGameOverPresentation,
    highScorePresentation: highScorePresentation,
    titleScoreLayout: titleScoreLayout,
    drawStripedTitleText: drawStripedTitleText,
    drawTitleMenuCursor: drawTitleMenuCursor,
    renderStageSelect: renderStageSelect,
    renderStageSelectClosing: renderStageSelectClosing,
    renderGame: renderGame,
    renderGameBackdrop: renderGameBackdrop,
    renderTerrain: renderTerrain,
    drawWallCell: drawWallCell,
    drawBrickCell: drawBrickCell,
    drawWater: drawWater,
    waterFrameName: waterFrameName,
    drawIce: drawIce,
    renderProjectileTerrainCover: renderProjectileTerrainCover,
    drawIceProjectileCover: drawIceProjectileCover,
    drawForest: drawForest,
    renderBase: renderBase,
    drawTank: drawTank,
    drawPlayerUpgradeOverlay: drawPlayerUpgradeOverlay,
    drawShield: drawShield,
    drawSpawn: drawSpawn,
    drawBullet: drawBullet,
    drawPowerUp: drawPowerUp,
    isPowerUpVisible: isPowerUpVisible,
    battleDisplayFrame: battleDisplayFrame,
    powerUpVisualRect: powerUpVisualRect,
    drawManifestSprite: drawManifestSprite,
    drawScaledManifestSprite: drawScaledManifestSprite,
    renderExplosions: renderExplosions,
    drawTankDestructionExplosion: drawTankDestructionExplosion,
    renderPlayerDestructions: renderPlayerDestructions,
    playerDestructionPresentation: playerDestructionPresentation,
    renderEnemyDestructions: renderEnemyDestructions,
    enemyDestructionPresentation: enemyDestructionPresentation,
    renderBaseDestruction: renderBaseDestruction,
    baseDestructionPresentation: baseDestructionPresentation,
    tankDestructionPresentation: tankDestructionPresentation,
    explosionPresentation: explosionPresentation,
    renderScorePopups: renderScorePopups,
    scorePopupPresentation: scorePopupPresentation,
    renderPanel: renderPanel,
    drawStageFlag: drawStageFlag,
    panelEnemyCounterRemaining: panelEnemyCounterRemaining,
    panelLifeCount: panelLifeCount,
    drawSmallScore: drawSmallScore,
    formatScore5: formatScore5,
    renderStageIntro: renderStageIntro,
    renderCurtain: renderCurtain,
    stageSelectCurtainState: stageSelectCurtainState,
    stageIntroCurtainState: stageIntroCurtainState,
    renderStageClear: renderStageClear,
    renderStageClearClosing: renderStageClearClosing,
    totalStageKills: totalStageKills,
    drawResultArrow: drawResultArrow,
    renderGameOver: renderGameOver,
    renderPlayerGameOverMessage: renderPlayerGameOverMessage,
    playerGameOverMessagePresentation: playerGameOverMessagePresentation,
    drawCompactGameOverWord: drawCompactGameOverWord,
    gameOverBannerY: gameOverBannerY,
    renderPause: renderPause,
    pausePresentation: pausePresentation,
    renderEditor: renderEditor,
    drawTileLegend: drawTileLegend,
    drawText: drawText,
    drawTextClipped: drawTextClipped,
    drawTextRight: drawTextRight,
    pad2: pad2,
    preparePausedDebugBattle: preparePausedDebugBattle,
    gameSettings: gameSettings,
    enemyTypeDefinitions: enemyTypeDefinitions,
    stageCount: stageCount,
    stageCycleLimit: stageCycleLimit,
    stageRoute: stageRoute,
    enemySequenceForStage: enemySequenceForStage,
    enemyTotal: enemyTotal,
    enemySpawnPoint: enemySpawnPoint,
    maxActiveEnemies: maxActiveEnemies,
    getEnemySpec: getEnemySpec,
    currentEnemySpawns: currentEnemySpawns,
    currentPlayerSpawns: currentPlayerSpawns,
    currentPowerUpSpawns: currentPowerUpSpawns,
    enemyDataStage: enemyDataStage,
    mapDataStage: mapDataStage,
    playerSpawnPoint: playerSpawnPoint,
    isExtendedLoopStage: isExtendedLoopStage,
    stageSettings: stageSettings,
    createStageGrid: createStageGrid
  });

  // ── Debug API (must be last) ───────────────────────────────────────────
  deps.requireRuntimeModule("debugApi").setupDebugApi(state, deps);

  // ── Main loop ──────────────────────────────────────────────────────────
  loadHighScore();
  state.game.grid = createStageGrid(state.game.stage);
  frameLoopRuntime.start();
})();
