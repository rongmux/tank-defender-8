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

  var debugBattleRuntime = deps.requireRuntimeModule("debugBattleRuntime").setupDebugBattleRuntime(state, deps);
  var preparePausedDebugBattle = debugBattleRuntime.preparePausedDebugBattle;

  // ── Setup runtime modules ──────────────────────────────────────────────
  deps.requireRuntimeModule("applicationFlowCompositionRuntime").setupApplicationFlowCompositionRuntime(state, deps, {
    tileTypeName: tileTypeName
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
  var UP = deps.UP;
  var advanceFixedFrameAudioState = deps.advanceFixedFrameAudioState;
  var advanceFrameCounter = deps.advanceFrameCounter;
  // (baseDestructionPresentation — local wrapper, not deps alias)
  var beginFixedFrameAudioState = deps.beginFixedFrameAudioState;
  var brickFragmentRect = deps.brickFragmentRect;
  var brickFragmentsFromQuarterMask = deps.brickFragmentsFromQuarterMask;
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

  var renderPipelineCompositionRuntime = deps.requireRuntimeModule("renderPipelineCompositionRuntime").setupRenderPipelineCompositionRuntime(state, deps, {
    stageRuntime: stageExports
  });
  var renderAdapterRuntime = renderPipelineCompositionRuntime.renderAdapterRuntime;
  var battleCompositionRuntime = deps.requireRuntimeModule("battleCompositionRuntime").setupBattleCompositionRuntime(state, deps, {
    render: render,
    shouldSpawnEnemies: shouldSpawnEnemies,
    update: update
  });
  var frameLoopRuntime = battleCompositionRuntime.frameLoopRuntime;
  var screenUpdateRuntime = battleCompositionRuntime.screenUpdateRuntime;
  var renderPipelineCompletion = renderPipelineCompositionRuntime.finishRenderCompositionRuntime();
  var screenRenderRuntime = renderPipelineCompletion.screenRenderRuntime;

  // Runtime methods are referenced only after all extracted modules register them.
  var loadHighScore = fn.loadHighScore;
  deps.requireRuntimeModule("inputCompositionRuntime").setupInputCompositionRuntime(state, {
    dom: { document: document, window: window },
    isEditorDirectionCode: isEditorDirectionCode,
    requireRuntimeModule: deps.requireRuntimeModule,
    sharedState: sh
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

  // ── Register local functions on state.fn (for debug-api access) ──────
  deps.requireRuntimeModule("legacyApiCompositionRuntime").setupLegacyApiCompositionRuntime(state, deps, {
    preparePausedDebugBattle: preparePausedDebugBattle,
    renderAdapterRuntime: renderAdapterRuntime,
    stageRuntime: stageExports,
    update: update,
    render: render,
    tileTypeName: tileTypeName,
    shouldSpawnEnemies: shouldSpawnEnemies
  });

  // ── Debug API (must be last) ───────────────────────────────────────────
  deps.requireRuntimeModule("debugApi").setupDebugApi(state, deps);

  // ── Main loop ──────────────────────────────────────────────────────────
  loadHighScore();
  state.game.grid = createStageGrid(state.game.stage);
  frameLoopRuntime.start();
})();
