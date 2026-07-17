(function () {
  "use strict";

  const runtimeModules = window.TankDefender8Modules || {};
  function requireRuntimeModule(name) {
    if (!runtimeModules[name]) throw new Error(`${name} module must load before game.js`);
    return runtimeModules[name];
  }
  const { advanceBattleRandom } = requireRuntimeModule("battleRandom");
  const { DIR_X, DIR_Y, DOWN, LEFT, RIGHT, UP } = requireRuntimeModule("directions");
  const { advanceFrameCounter, resetFrameCounter } = requireRuntimeModule("frameCounter");
  const { clamp, rectOverlapArea, rectsOverlap } = requireRuntimeModule("geometry");
  const {
    fixedFrameAudioPresentation: selectFixedFrameAudioPresentation,
    fixedFrameVoiceDuration,
    fixedFrameVoiceIsAudible,
    movementAudioPresentation: selectMovementAudioPresentation
  } = requireRuntimeModule("audioPresentation");
  const {
    isMovementAudioBlocked,
    resolveAudioAudibility: selectAudioAudibility,
    resolveMovementAudioMode: selectMovementAudioMode
  } = requireRuntimeModule("audioMixRules");
  const {
    FIXED_FRAME_AUDIO_UPDATE_MODE,
    advanceFixedFrameAudioState,
    beginFixedFrameAudioState,
    createFixedFrameAudioState,
    fixedFrameAudioUpdateMode,
    resetFixedFrameAudioState
  } = requireRuntimeModule("fixedFrameAudioState");
  const {
    FREE_AUDIO_MANIFEST,
    cloneAudioManifest
  } = requireRuntimeModule("freeAudioManifest");
  const {
    FREE_SPRITE_MANIFEST,
    cloneSpriteManifest
  } = requireRuntimeModule("freeSpriteManifest");
  const {
    compactGameOverGlyph,
    pixelGlyph,
    rightAlignedPixelTextX
  } = requireRuntimeModule("pixelFont");
  const {
    directionTowardTarget,
    enemyAiChanceMatches,
    enemyAiPhaseForInterval,
    isEnemyAtTurnIntersection,
    isEnemyMovementFrame,
    selectEnemyTargetPlayer,
    shouldEnemyFireForByte,
    targetableEnemyPlayers
  } = requireRuntimeModule("enemyAiRules");
  const {
    activeEnemyCount,
    findAvailableEnemySlot,
    isEnemySpawnPointOccupied,
    selectEnemySpawnIndex
  } = requireRuntimeModule("enemySpawnRules");
  const {
    DEFAULT_ENEMY_SPAWN_PACING,
    calculateEnemySpawnDelay,
    scaleEnemySpawnDelay
  } = requireRuntimeModule("enemySpawnSettings");
  const {
    DEFAULT_EXPLOSION_CORE_COLOR,
    DEFAULT_EXPLOSION_RULES,
    cloneExplosionRules
  } = requireRuntimeModule("explosionSettings");
  const {
    DEFAULT_PLAYER_MOVEMENT,
    clonePlayerMovementSettings
  } = requireRuntimeModule("playerMovementSettings");
  const {
    shouldClearPowerUpForCarrierSpawn,
    shouldReleaseCarrierPowerUp
  } = requireRuntimeModule("powerUpSettings");
  const {
    CARRIER_FLASH_COLOR,
    CARRIER_FLASH_PHASE_FRAMES,
    PLAYER_UPGRADE_OVERLAY_COLORS,
    directionName,
    enemyColor,
    isPlayerShieldVisible,
    isPlayerTankVisible,
    playerUpgradeOverlayParts,
    shieldColorForTick,
    spawnAnimationPresentation,
    tankPrimaryColor,
    tankTrackFrameName
  } = requireRuntimeModule("tankPresentation");
  const {
    BASE_DESTRUCTION_TAIL_FRAMES,
    baseDestructionPresentation: selectBaseDestructionPresentation,
    enemyDestructionPresentation: selectEnemyDestructionPresentation,
    explosionPresentation: selectExplosionPresentation,
    isTankDestructionStyle,
    playerDestructionPresentation: selectPlayerDestructionPresentation,
    scorePopupPresentation: selectScorePopupPresentation,
    tankDestructionPresentation: selectTankDestructionPresentation
  } = requireRuntimeModule("effectPresentation");
  const {
    FULL_GAME_OVER_SCREEN_FRAMES,
    HIGH_SCORE_SCREEN_FRAMES,
    STAGE_CURTAIN_CLOSE_FRAMES,
    fullGameOverPresentation: selectFullGameOverPresentation,
    highScorePresentation: selectHighScorePresentation,
    stageIntroCurtainState: selectStageIntroCurtainState,
    stageSelectCurtainState: selectStageSelectCurtainState,
    titleScoreLayout: selectTitleScoreLayout
  } = requireRuntimeModule("screenPresentation");
  const {
    gameOverBannerPresentation: selectGameOverBannerPresentation,
    panelEnemyCounterRemaining: selectPanelEnemyCounterRemaining,
    panelLifeCount: selectPanelLifeCount,
    pausePresentation: selectPausePresentation,
    playerGameOverMessagePresentation: selectPlayerGameOverMessagePresentation
  } = requireRuntimeModule("battleHudPresentation");
  const { DEFAULT_STAGE_ADVANCE } = requireRuntimeModule("stageFlowSettings");
  const {
    DEFAULT_ENEMY_TYPES: defaultEnemyTypes,
    ENEMY_FIRE_CHANCE,
    ENEMY_MOVE_SPEED,
    POWER_UP_TYPES: powerTypes,
    cloneEnemyTypes
  } = requireRuntimeModule("enemyTypes");
  const {
    DEFAULT_PLAYER_UPGRADE_RULES: defaultPlayerUpgradeRules,
    clonePlayerUpgradeRules
  } = requireRuntimeModule("playerUpgrades");
  const {
    BRICK_QUARTER_FRAGMENT_MASKS,
    FULL_BRICK_FRAGMENT_MASK,
    GRID,
    QUAD_GRID,
    TILE_TYPES,
    WALL_FRAGMENT,
    brickFragmentsFromQuarterMask,
    clearTile,
    cloneGrid,
    gridToQuadrants,
    makeCell,
    makeGrid,
    normalizeBrickFragmentMask,
    parseStageQuadrants,
    parseStageRows,
    quarterMaskFromBrickFragments,
    setTile
  } = requireRuntimeModule("stageGrid");
  const {
    buildBaseWall,
    makeOriginalConstructionGrid,
    prepareBattleGrid,
    prepareConstructedBattleGrid,
    shovelWallTypeForTimer
  } = requireRuntimeModule("battlefieldGrid");
  const { buildProceduralStage } = requireRuntimeModule("proceduralStage");
  const {
    EDITOR_TILE_TYPES,
    ORIGINAL_EDITOR_PATTERNS,
    editorBrushAt,
    editorCellForCursor,
    editorDirectionForCode,
    editorPatternAt,
    heldEditorDirection,
    isEditorDirectionCode,
    moveEditorCursor: selectEditorCursorMove,
    nextEditorPatternIndex,
    nextEditorTileType,
    originalEditorButtonHeld,
    quadrantType,
    setEditorQuadrant
  } = requireRuntimeModule("editorRules");
  const {
    createEditorStagePack,
    parseEditorStageText,
    parseJsonText,
    serializeEditorStage,
    serializeEditorStagePack
  } = requireRuntimeModule("editorStageFormat");
  const {
    DEFAULT_ENEMY_SPAWNS,
    DEFAULT_MAX_ACTIVE_ENEMIES,
    DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
    DEFAULT_PLAYER_SPAWNS,
    DEFAULT_POWERUP_SPAWNS,
    pixelToTilePoint,
    powerUpPixelToTilePoint
  } = requireRuntimeModule("stageSettings");
  const { tryNormalizeStagePack } = requireRuntimeModule("stagePack");
  const {
    resolveEnemyTotal,
    resolveMaxActiveEnemies,
    resolveStageRoute
  } = requireRuntimeModule("stageRouting");
  const {
    DEFAULT_ENEMY_TOTAL,
    DEFAULT_ORIGINAL_STAGE_COUNT,
    summarizeEnemySequences
  } = requireRuntimeModule("enemySequences");
  const { createBuiltInStagePack } = requireRuntimeModule("builtInStagePack");
  const { createStagePackSchema } = requireRuntimeModule("stagePackSchema");
  const {
    advancePlayerDestructionState,
    beginPlayerDestructionState,
    createPlayerState,
    resetPlayerState,
    resolvePlayerDeathState
  } = requireRuntimeModule("playerState");
  const { createProjectileState } = requireRuntimeModule("projectileState");
  const { resolveBulletCollisions } = requireRuntimeModule("projectileCollisionRules");
  const {
    projectileBoundaryImpactPoint,
    projectileOutsideField,
    wallHitSoundName
  } = requireRuntimeModule("projectileImpactRules");
  const {
    ENEMY_DESTRUCTION_SCORE_TICKS,
    advanceEnemyDestructionState,
    createEnemyState
  } = requireRuntimeModule("enemyState");
  const {
    POWER_UP_SIZE: POWERUP_SIZE,
    advancePowerUpState,
    createPowerUpState
  } = requireRuntimeModule("powerUpState");
  const {
    canPlayerCollectPowerUp,
    findPowerUpCollector
  } = requireRuntimeModule("powerUpCollectionRules");
  const { applyPowerUpEffect: applyPowerUpStateEffect } = requireRuntimeModule("powerUpEffectRules");
  const {
    ORIGINAL_POWER_UP_RANDOM_TABLE: originalPowerUpRandomTable,
    dedupePowerUpSpots,
    powerUpSpawnKey,
    powerUpTypeForRandomByte,
    selectPowerUpSpawnSpot
  } = requireRuntimeModule("powerUpSpawnRules");
  const {
    advanceTimedStates,
    createExplosionState,
    createScorePopupState
  } = requireRuntimeModule("transientEffectState");
  const { addScorePoints, awardBonusLives } = requireRuntimeModule("scoreRules");
  const {
    createStageResultPresentation,
    createStageResultSummary,
    selectStageClearBonusRecipients,
    stageResultVisibleKillCount
  } = requireRuntimeModule("stageResultRules");
  const {
    bulletHitsTankByCenter,
    canTankOccupyRect,
    entityRect,
    filterActiveTankCollisionPeers,
    totalRectOverlapArea
  } = requireRuntimeModule("tankCollisionRules");
  const {
    brickFragmentRect,
    overlappedBrickFragments,
    overlappedQuarters,
    quarterRect,
    rectHitsSolidTerrain: gridRectHitsSolidTerrain,
    solidTerrainOverlapArea: gridSolidTerrainOverlapArea
  } = requireRuntimeModule("terrainCollisionRules");
  const { cloneWallRules, damageWall } = requireRuntimeModule("wallDamageRules");
  const { EMPTY, BRICK, STEEL, WATER, FOREST, ICE } = TILE_TYPES;

  const canvas = document.getElementById("game");
  const packFileInput = document.getElementById("stage-pack-file");
  const ctx = canvas.getContext("2d");

  const SCREEN_W = 256;
  const SCREEN_H = 240;
  const TILE = 16;
  const HALF = 8;
  const FIELD_X = 16;
  const FIELD_Y = 16;
  const FIELD_W = GRID * TILE;
  const FIELD_H = GRID * TILE;
  const BATTLE_PRESENTATION_LAYOUT = Object.freeze({
    x: FIELD_X,
    y: FIELD_Y,
    width: FIELD_W,
    height: FIELD_H
  });
  const PANEL_X = FIELD_X + FIELD_W;
  const STEP_MS = 1000 / 60;
  const DEFAULT_HIGH_SCORE = 20000;
  const TITLE_DEMO_IDLE_FRAMES = 0x0a * 0x40;
  const DEMO_DISPLAY_STAGE = 30;
  const DEMO_MAX_ACTIVE_ENEMIES = 4;
  const HIDDEN_MESSAGE_REQUIRED_VISITS = 7;
  const HIDDEN_MESSAGE_A_PRESSES = 8;
  const HIDDEN_MESSAGE_B_PRESSES = 12;
  const HIDDEN_MESSAGE_TEXT_START = 128;
  const HIDDEN_MESSAGE_STEP_FRAMES = 64;
  const HIDDEN_MESSAGE_DROP_START = 640;
  const HIDDEN_MESSAGE_DROP_MORPH_FRAMES = 28;
  const HIDDEN_MESSAGE_DROP_FALL_FRAMES = 218;
  const HIDDEN_MESSAGE_END_FRAME = 887;
  const GAME_OVER_TEXT = "GAME OVER";
  const PLAYER_GAME_OVER_MESSAGE_TIMER = 0x0d;
  const PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD = 0x0a;
  const PLAYER_GAME_OVER_MESSAGE_Y = 0xd8;
  const PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y = 0xf0;
  const PLAYER_GAME_OVER_STAGE_END_DELAY = 0x100;
  const EXTENDED_STAGE_END_FRAME_HIGH = 0xfe;
  const DEMO_INITIAL_FRAME_LOW = 0x02;
  const STAGE_MAP_DRAW_FRAMES = 13;
  const STAGE_ATTRIBUTE_COPY_FRAMES = 64;
  const STAGE_RESULT_ROW_LAYOUT = Object.freeze({
    p1KillsRightX: 104,
    leftArrowX: 112,
    arrowWidth: 8,
    miniTankX: 121,
    miniTankWidth: 14,
    rightArrowX: 136,
    p2KillsX: 152
  });
  const BULLET_IMPACT_EXPLOSION_RULES = new Set(["brickHit", "steelHit", "steelBlocked", "enemyHit", "playerStun"]);
  const TITLE_MENU_ITEMS = [
    { label: "1 PLAYER", action: "one", x: 88, y: 136, color: "#f3f0d4" },
    { label: "2 PLAYERS", action: "two", x: 88, y: 152, color: "#f3f0d4" },
    { label: "CONSTRUCTION", action: "construction", x: 88, y: 168, color: "#f3f0d4" }
  ];
  const EDITOR_STORAGE_KEY = "tank-defender-8-editor-stage";
  const HIGH_SCORE_STORAGE_KEY = "tank-defender-8-high-score";

  const builtInStagePack = createBuiltInStagePack();
  const keys = new Set();
  const pendingFirePresses = new Set();
  const pendingStageSelectPresses = new Set();
  let audioCtx = null;
  const activeSequencedSounds = new Map();
  const movementAudio = {
    mode: "none",
    oscillator: null,
    gain: null,
    phase: -1
  };
  const movementIceAudio = createFixedFrameAudioState();
  const playerShootAudio = createFixedFrameAudioState();
  const steelHitAudio = createFixedFrameAudioState();
  const enemyHitAudio = createFixedFrameAudioState();
  const enemyDestroyAudio = createFixedFrameAudioState();
  const playerDestroyAudio = createFixedFrameAudioState();
  const baseHitAudio = createFixedFrameAudioState();
  const brickHitAudio = createFixedFrameAudioState();
  const stageStartAudio = createFixedFrameAudioState();
  const bonusLifeAudio = createFixedFrameAudioState();
  const powerUpPickupAudio = createFixedFrameAudioState();
  const powerUpAppearAudio = createFixedFrameAudioState();
  const pauseAudio = createFixedFrameAudioState();
  const scoreCountAudio = createFixedFrameAudioState();
  const stageBonusAudio = createFixedFrameAudioState();
  const gameOverAudio = createFixedFrameAudioState();
  const highScoreAudio = createFixedFrameAudioState();
  let fixedShortNoiseBuffer = null;
  let fixedShortNoiseSampleRate = 0;
  let fixedShortNoiseClockRate = 0;
  let fixedLongNoiseBuffer = null;
  let fixedLongNoiseSampleRate = 0;
  let fixedLongNoiseClockRate = 0;

  const game = {
    screen: "title",
    paused: false,
    pauseElapsed: 0,
    stage: 1,
    playerCount: 1,
    tick: 0,
    frameLow: 0,
    frameHigh: 0,
    randomValue: 0,
    randomIndex: 0,
    transitionTimer: 0,
    grid: makeGrid(),
    customGrid: null,
    constructedGrid: null,
    constructionStageActive: false,
    players: [],
    enemies: [],
    bullets: [],
    explosions: [],
    scorePopups: [],
    powerUp: null,
    lastPowerUpSpawn: null,
    powerUpSpawnBag: [],
    powerUpSpawnBagKey: "",
    base: { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true },
    enemySpawned: 0,
    enemyKilled: 0,
    nextSpawn: 0,
    clearPendingTimer: 0,
    baseDestroyTimer: 0,
    gameOverTimer: 0,
    playerGameOverMessage: null,
    fullGameOverElapsed: 0,
    freezeTimer: 0,
    shovelTimer: 0,
    highScore: DEFAULT_HIGH_SCORE,
    runHighScoreBaseline: DEFAULT_HIGH_SCORE,
    newHighScoreAtGameOver: false,
    highScoreScreenElapsed: 0,
    stagePack: builtInStagePack,
    titleMenu: 0,
    titleIdleFrames: 0,
    demoMode: false,
    constructionUsed: false,
    constructionVisits: 0,
    hiddenInputCount: 0,
    hiddenMessageElapsed: 0,
    stageSelectPlayers: 1,
    stageResultReason: "clear",
    stageClearElapsed: 0,
    stageClearBonusPlayerIds: [],
    stageClearBonusAwarded: false,
    editorGrid: null,
    editorCursor: { qc: -1, qr: -1 },
    editorBrush: BRICK,
    editorPattern: 0,
    editorPatternArmed: false,
    editorMoveHoldTimer: 0,
    editorTick: 0,
    editorMessage: "",
    editorMessageTimer: 0
  };

  function loadHighScore() {
    try {
      const value = Number(localStorage.getItem(HIGH_SCORE_STORAGE_KEY));
      game.highScore = Number.isFinite(value) && value > 0
        ? Math.max(DEFAULT_HIGH_SCORE, Math.floor(value))
        : DEFAULT_HIGH_SCORE;
    } catch (error) {
      game.highScore = DEFAULT_HIGH_SCORE;
    }
    game.runHighScoreBaseline = game.highScore;
  }

  function saveHighScore() {
    try {
      localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(game.highScore));
    } catch (error) {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }

  function updateHighScore(score) {
    if (score > game.highScore) {
      game.highScore = score;
      saveHighScore();
    }
  }

  function stageRoute(stage) {
    const pack = game.stagePack || builtInStagePack;
    return resolveStageRoute({
      stage,
      currentStage: game.stage,
      totalStages: pack.totalStages || builtInStagePack.totalStages,
      stageAdvance: (pack.gameSettings || builtInStagePack.gameSettings).stageAdvance || DEFAULT_STAGE_ADVANCE,
      originalStageCount: DEFAULT_ORIGINAL_STAGE_COUNT
    });
  }

  function stageCount() {
    return stageRoute().stageCount;
  }

  function stageCycleLimit() {
    return stageRoute().stageCycleLimit;
  }

  function isExtendedLoopStage(stage) {
    return stageRoute(stage).isExtendedLoopStage;
  }

  function mapDataStage(stage) {
    return stageRoute(stage).mapDataStage;
  }

  function enemyDataStage(stage) {
    return stageRoute(stage).enemyDataStage;
  }

  function enemyTotal(stage) {
    const pack = game.stagePack || builtInStagePack;
    return resolveEnemyTotal(pack, enemyDataStage(stage || game.stage), DEFAULT_ENEMY_TOTAL);
  }

  function maxActiveEnemies(stage, players) {
    if (game.demoMode) return DEMO_MAX_ACTIVE_ENEMIES;
    const pack = game.stagePack || builtInStagePack;
    const playerCount = Math.max(1, Math.floor(Number(players) || game.playerCount || 1));
    return resolveMaxActiveEnemies(pack, mapDataStage(stage || game.stage), playerCount, {
      onePlayer: DEFAULT_MAX_ACTIVE_ENEMIES,
      twoPlayer: DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER
    });
  }

  function gameSettings() {
    const pack = game.stagePack || builtInStagePack;
    return pack.gameSettings || builtInStagePack.gameSettings;
  }

  function enemyTypeDefinitions() {
    const pack = game.stagePack || builtInStagePack;
    return pack.enemyTypes || builtInStagePack.enemyTypes || defaultEnemyTypes;
  }

  function stageSettings(stage) {
    const pack = game.stagePack || builtInStagePack;
    const stageIndex = mapDataStage(stage || game.stage) - 1;
    return pack.stageSettings && pack.stageSettings[stageIndex] ? pack.stageSettings[stageIndex] : null;
  }

  function playerSpawnPoint(id, stage) {
    const settings = stageSettings(stage);
    const spawns = settings ? settings.playerSpawns : DEFAULT_PLAYER_SPAWNS;
    return spawns[id - 1] || DEFAULT_PLAYER_SPAWNS[id - 1] || DEFAULT_PLAYER_SPAWNS[0];
  }

  function enemySpawnPoint(index, stage) {
    const settings = stageSettings(stage);
    const spawns = settings ? settings.enemySpawns : DEFAULT_ENEMY_SPAWNS;
    return spawns[index] || spawns[index % spawns.length] || DEFAULT_ENEMY_SPAWNS[index % DEFAULT_ENEMY_SPAWNS.length];
  }

  function currentPlayerSpawns() {
    const settings = stageSettings();
    return (settings ? settings.playerSpawns : DEFAULT_PLAYER_SPAWNS).map(pixelToTilePoint);
  }

  function currentEnemySpawns() {
    const settings = stageSettings();
    return (settings ? settings.enemySpawns : DEFAULT_ENEMY_SPAWNS).map(pixelToTilePoint);
  }

  function currentPowerUpSpawns() {
    const settings = stageSettings();
    return (settings ? settings.powerUpSpawns : DEFAULT_POWERUP_SPAWNS).map(powerUpPixelToTilePoint);
  }

  function createStageGrid(stage) {
    const pack = game.stagePack || builtInStagePack;
    const dataStage = mapDataStage(stage);
    if (typeof pack.createGrid === "function") return pack.createGrid(dataStage);
    if (pack.quadrants && pack.quadrants[dataStage - 1]) return parseStageQuadrants(pack.quadrants[dataStage - 1]);
    if (pack.maps && pack.maps[dataStage - 1]) return parseStageRows(pack.maps[dataStage - 1]);
    return buildProceduralStage(dataStage);
  }

  function getEnemySpec(stage, index) {
    const pack = game.stagePack || builtInStagePack;
    const dataStage = enemyDataStage(stage);
    if (typeof pack.enemyAt === "function") return pack.enemyAt(dataStage, index);
    if (pack.enemies && pack.enemies[dataStage - 1] && pack.enemies[dataStage - 1][index]) {
      return pack.enemies[dataStage - 1][index];
    }
    return builtInStagePack.enemyAt(dataStage, index);
  }

  function enemySequenceForStage(stage) {
    return Array.from({ length: enemyTotal(stage) }, (_, index) => {
      const spec = getEnemySpec(stage, index);
      return {
        typeIndex: spec.typeIndex,
        carrier: Boolean(spec.carrier),
        spawnIndex: spec.spawnIndex,
        powerUpType: spec.powerUpType || null,
        spawnDelay: spec.spawnDelay === undefined ? null : spec.spawnDelay
      };
    });
  }

  function createPlayer(id) {
    return createPlayerState({
      id,
      spawn: playerSpawnPoint(id),
      settings: gameSettings(),
      enemyTypeCount: enemyTypeDefinitions().length,
      direction: UP
    });
  }

  function resetPlayerPosition(player) {
    resetPlayerState(player, { settings: gameSettings(), direction: UP });
  }

  function startGame(players, options) {
    const opts = options || {};
    if (!opts.demo) {
      initAudio();
      game.constructionUsed = false;
      game.constructionVisits = 0;
      game.hiddenInputCount = 0;
      game.runHighScoreBaseline = game.highScore;
      game.newHighScoreAtGameOver = false;
      game.fullGameOverElapsed = 0;
      game.highScoreScreenElapsed = 0;
    }
    game.demoMode = Boolean(opts.demo);
    game.playerCount = players;
    game.paused = false;
    game.pauseElapsed = 0;
    game.stage = opts.stage || game.stage || 1;
    game.customGrid = opts.customGrid ? cloneGrid(opts.customGrid) : null;
    game.constructionStageActive = Boolean(
      !game.customGrid &&
      opts.useConstruction !== false &&
      game.stage === 1 &&
      game.constructedGrid
    );
    game.players = [];
    for (let i = 1; i <= players; i += 1) game.players.push(createPlayer(i));
    startStage(game.stage);
  }

  function startTitleDemo() {
    startGame(2, { stage: DEMO_DISPLAY_STAGE, useConstruction: false, demo: true });
    game.screen = "playing";
    game.transitionTimer = 0;
    game.titleIdleFrames = 0;
    resetFrameCounters();
    game.frameLow = DEMO_INITIAL_FRAME_LOW;
    syncMovementAudio();
  }

  function endTitleDemo() {
    stopMovementAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopBaseHitAudio();
    stopEnemyDestroyAudio();
    stopPlayerDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    game.demoMode = false;
    game.stage = 1;
    game.screen = "title";
    game.paused = false;
    resetTitleIdleTimer();
    clearTransientBattleState();
  }

  function updateTitleIdle() {
    if (game.constructionUsed || game.demoMode) return;
    game.titleIdleFrames += 1;
    if (game.frameHigh === 0x0a) startTitleDemo();
  }

  function resetTitleIdleTimer() {
    game.titleIdleFrames = 0;
    resetFrameCounterHigh();
  }

  function resetTitleIdleHighByte() {
    game.titleIdleFrames = 0;
    resetFrameCounterHigh();
  }

  function hiddenMessageTriggerReady() {
    return game.constructionVisits === HIDDEN_MESSAGE_REQUIRED_VISITS &&
      game.hiddenInputCount === 0x74;
  }

  function reserveTitleDirectionForHiddenInput(code) {
    return game.screen === "title" &&
      game.constructionVisits === HIDDEN_MESSAGE_REQUIRED_VISITS &&
      (code === "ArrowDown" || code === "ArrowRight");
  }

  function recordHiddenTitleInput(code) {
    if (game.screen !== "title" || game.constructionVisits !== HIDDEN_MESSAGE_REQUIRED_VISITS) return false;
    if (code === "KeyF" && keys.has("ArrowDown")) {
      game.hiddenInputCount = (game.hiddenInputCount + 0x10) & 0xff;
      return true;
    }
    if (code === "KeyG" && keys.has("ArrowRight")) {
      game.hiddenInputCount = (game.hiddenInputCount - 1) & 0xff;
      return true;
    }
    return false;
  }

  function startHiddenMessage() {
    game.screen = "hiddenMessage";
    game.paused = false;
    game.demoMode = false;
    game.hiddenMessageElapsed = 0;
    pendingFirePresses.clear();
  }

  function updateHiddenMessage() {
    game.hiddenMessageElapsed += 1;
    if (game.hiddenMessageElapsed < HIDDEN_MESSAGE_END_FRAME) return;
    game.hiddenInputCount = 0;
    activateTitleMenu();
  }

  function hiddenMessagePresentation(elapsed) {
    const frame = Math.max(0, Math.floor(Number(elapsed) || 0));
    const lines = ["THIS PROGRAM WAS", "WRITTEN BY", "OPEN-REACH", "WHO LOVES NORIKO"];
    const visibleLines = lines.filter((line, index) => frame >= HIDDEN_MESSAGE_TEXT_START + index * HIDDEN_MESSAGE_STEP_FRAMES);
    const firstDotFrame = HIDDEN_MESSAGE_TEXT_START + lines.length * HIDDEN_MESSAGE_STEP_FRAMES;
    const dots = frame < firstDotFrame
      ? 0
      : clamp(Math.floor((frame - firstDotFrame) / HIDDEN_MESSAGE_STEP_FRAMES) + 1, 0, 5);
    let drop = null;
    if (frame > HIDDEN_MESSAGE_DROP_START && frame < HIDDEN_MESSAGE_END_FRAME) {
      const age = frame - HIDDEN_MESSAGE_DROP_START;
      if (age <= HIDDEN_MESSAGE_DROP_MORPH_FRAMES) {
        const morphSequence = [3, 2, 1, 0, 1, 2, 3];
        const phase = morphSequence[Math.floor((age - 1) / 4)];
        drop = { x: 120, y: 30, frame: `morph${phase}` };
      } else {
        const fallAge = Math.min(HIDDEN_MESSAGE_DROP_FALL_FRAMES, age - HIDDEN_MESSAGE_DROP_MORPH_FRAMES);
        drop = { x: 120, y: 30 + fallAge, frame: "fall" };
      }
    }
    return { frame, visibleLines, dots, drop };
  }

  function beginStageSelect(players) {
    initAudio();
    game.demoMode = false;
    resetTitleIdleTimer();
    game.stageSelectPlayers = players === 2 ? 2 : 1;
    game.stage = 1;
    game.screen = "stageSelectClosing";
    game.paused = false;
    game.transitionTimer = STAGE_CURTAIN_CLOSE_FRAMES;
    pendingStageSelectPresses.clear();
  }

  function startSelectedGame() {
    pendingStageSelectPresses.clear();
    startGame(game.stageSelectPlayers, { stage: game.stage });
  }

  function stageSelectLimit() {
    return Math.max(1, Math.min(DEFAULT_ORIGINAL_STAGE_COUNT, stageCount()));
  }

  function changeStageSelection(delta) {
    const limit = stageSelectLimit();
    resetFrameCounterLow();
    game.stage = clamp(game.stage + delta, 1, limit);
  }

  function startStage(stage) {
    stopMovementAudio();
    stopStageStartAudio();
    stopBonusLifeAudio();
    stopPowerUpPickupAudio();
    stopPowerUpAppearAudio();
    stopPauseAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopBaseHitAudio();
    stopEnemyDestroyAudio();
    stopPlayerDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    game.screen = "stageIntro";
    game.tick = 0;
    game.transitionTimer = gameSettings().timings.stageIntro;
    const constructionGrid = game.constructionStageActive && stage === 1 ? game.constructedGrid : null;
    game.grid = game.customGrid
      ? cloneGrid(game.customGrid)
      : constructionGrid
        ? cloneGrid(constructionGrid)
        : createStageGrid(stage);
    if (game.customGrid || constructionGrid) prepareConstructedBattleGrid(game.grid);
    else prepareBattleGrid(game.grid);
    game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
    game.enemies = [];
    game.bullets = [];
    game.explosions = [];
    game.scorePopups = [];
    game.powerUp = null;
    game.lastPowerUpSpawn = null;
    resetPowerUpSpawnBag();
    game.enemySpawned = 0;
    game.enemyKilled = 0;
    game.nextSpawn = enemySpawnDelay(stage, 0);
    game.clearPendingTimer = 0;
    game.baseDestroyTimer = 0;
    game.gameOverTimer = 0;
    game.playerGameOverMessage = null;
    game.fullGameOverElapsed = 0;
    game.freezeTimer = 0;
    game.shovelTimer = 0;
    game.stageResultReason = "clear";
    game.stageClearElapsed = 0;
    game.stageClearBonusPlayerIds = [];
    game.stageClearBonusAwarded = false;
    for (const player of game.players) {
      resetStageStats(player);
      resetPlayerPosition(player);
    }
    startStageStartAudio();
  }

  function resetStageStats(player) {
    player.stagePoints = 0;
    player.stageKills = Array(enemyTypeDefinitions().length).fill(0);
  }

  function enterEditor() {
    stopMovementAudio();
    stopStageStartAudio();
    stopBonusLifeAudio();
    stopPowerUpPickupAudio();
    stopPowerUpAppearAudio();
    stopPauseAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopBaseHitAudio();
    stopEnemyDestroyAudio();
    stopPlayerDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    initAudio();
    game.screen = "editor";
    game.paused = false;
    if (!game.editorGrid) game.editorGrid = makeOriginalConstructionGrid();
    game.editorCursor = { qc: 0, qr: 0 };
    game.editorPattern = 0;
    game.editorPatternArmed = false;
    game.editorMoveHoldTimer = 0;
    game.editorTick = 0;
    game.editorBrush = ORIGINAL_EDITOR_PATTERNS[0].type;
    showEditorMessage("EDIT");
  }

  function exitEditorToTitle() {
    if (game.editorGrid) game.constructedGrid = cloneGrid(game.editorGrid);
    game.constructionVisits = (game.constructionVisits + 1) & 0xff;
    game.constructionUsed = game.constructionVisits > 0;
    game.hiddenInputCount = 0;
    game.customGrid = null;
    game.constructionStageActive = false;
    game.stage = 1;
    game.screen = "title";
    game.paused = false;
    game.demoMode = false;
    resetTitleIdleTimer();
    game.editorMoveHoldTimer = 0;
  }

  function moveTitleMenu(delta) {
    resetTitleIdleHighByte();
    game.titleMenu = (game.titleMenu + delta + TITLE_MENU_ITEMS.length) % TITLE_MENU_ITEMS.length;
  }

  function setTitleMenu(index) {
    resetTitleIdleHighByte();
    game.titleMenu = clamp(Math.floor(Number(index) || 0), 0, TITLE_MENU_ITEMS.length - 1);
  }

  function activateTitleMenu() {
    const item = TITLE_MENU_ITEMS[game.titleMenu] || TITLE_MENU_ITEMS[0];
    if (item.action === "one") beginStageSelect(1);
    else if (item.action === "two") beginStageSelect(2);
    else if (item.action === "construction") enterEditor();
  }

  function testEditorStage() {
    if (!game.editorGrid) return;
    const pack = createEditorStagePack(game.editorGrid);
    const result = tryNormalizeStagePack(pack);
    if (!result.ok) {
      showEditorMessage("BAD");
      return;
    }
    game.stagePack = result.pack;
    startGame(1, { stage: 1, customGrid: parseStageQuadrants(pack.quadrants[0]) });
  }

  function saveEditorStage() {
    if (!game.editorGrid) return;
    try {
      localStorage.setItem(EDITOR_STORAGE_KEY, serializeEditorStage(game.editorGrid));
      showEditorMessage("SAVED");
      playSound("editorSave");
    } catch (error) {
      showEditorMessage("ERR");
    }
  }

  function loadEditorStage() {
    try {
      const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
      if (!raw) {
        showEditorMessage("EMPTY");
        return;
      }
      const result = parseEditorStageText(raw);
      if (!result.ok) {
        showEditorMessage(result.kind === "stage" ? "BAD" : "ERR");
        return;
      }
      game.editorGrid = result.grid;
      showEditorMessage("LOADED");
      playSound("editorLoad");
    } catch (error) {
      showEditorMessage("ERR");
    }
  }

  function clearEditorStage() {
    game.editorGrid = makeOriginalConstructionGrid();
    game.editorCursor = { qc: 0, qr: 0 };
    game.editorPattern = 0;
    game.editorPatternArmed = false;
    game.editorMoveHoldTimer = 0;
    game.editorBrush = ORIGINAL_EDITOR_PATTERNS[0].type;
    showEditorMessage("CLEAR");
    playSound("editorClear");
  }

  async function exportEditorStage() {
    if (!game.editorGrid) return;
    const text = serializeEditorStagePack(game.editorGrid);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showEditorMessage("COPIED");
      } else {
        console.log(text);
        showEditorMessage("LOGGED");
      }
    } catch (error) {
      console.log(text);
      showEditorMessage("LOGGED");
    }
  }

  function importStagePackFile() {
    if (packFileInput) {
      packFileInput.click();
    } else {
      showEditorMessage("NOFILE");
    }
  }

  function loadStagePackJsonText(text) {
    const parsed = parseJsonText(text);
    return parsed.ok
      ? loadStagePackObject(parsed.value)
      : { ok: false, error: parsed.error };
  }

  function loadStagePackObject(pack) {
    const result = tryNormalizeStagePack(pack);
    if (!result.ok) return { ok: false, error: result.error };
    applyStagePack(result.pack);
    return { ok: true, error: "" };
  }

  function applyStagePack(pack) {
    game.stagePack = pack;
    game.stage = 1;
    game.titleMenu = 0;
    resetTitleIdleTimer();
    game.demoMode = false;
    game.constructionUsed = false;
    game.constructionVisits = 0;
    game.hiddenInputCount = 0;
    game.hiddenMessageElapsed = 0;
    game.customGrid = null;
    game.constructedGrid = null;
    game.constructionStageActive = false;
    game.grid = createStageGrid(game.stage);
    prepareBattleGrid(game.grid);
    game.editorGrid = null;
    game.editorCursor = { qc: -1, qr: -1 };
    game.editorPattern = 0;
    game.editorPatternArmed = false;
    game.editorMoveHoldTimer = 0;
    game.editorTick = 0;
    game.editorBrush = BRICK;
    game.stageSelectPlayers = 1;
    game.screen = "title";
    game.paused = false;
    resetBattleRandom();
    clearTransientBattleState();
  }

  function clearTransientBattleState() {
    stopMovementAudio();
    stopStageStartAudio();
    stopBonusLifeAudio();
    stopPowerUpPickupAudio();
    stopPowerUpAppearAudio();
    stopPauseAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopBaseHitAudio();
    stopEnemyDestroyAudio();
    stopPlayerDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    stopGameOverAudio();
    stopHighScoreAudio();
    game.demoMode = false;
    game.runHighScoreBaseline = game.highScore;
    game.newHighScoreAtGameOver = false;
    game.fullGameOverElapsed = 0;
    game.highScoreScreenElapsed = 0;
    game.stageResultReason = "clear";
    game.players = [];
    game.enemies = [];
    game.bullets = [];
    game.explosions = [];
    game.scorePopups = [];
    game.powerUp = null;
    game.lastPowerUpSpawn = null;
    resetPowerUpSpawnBag();
    game.enemySpawned = 0;
    game.enemyKilled = 0;
    game.nextSpawn = 0;
    game.clearPendingTimer = 0;
    game.baseDestroyTimer = 0;
    game.gameOverTimer = 0;
    game.playerGameOverMessage = null;
    game.freezeTimer = 0;
    game.shovelTimer = 0;
    game.stageClearElapsed = 0;
    game.stageClearBonusPlayerIds = [];
    game.stageClearBonusAwarded = false;
    pendingStageSelectPresses.clear();
  }

  function restoreBuiltInStagePack() {
    applyStagePack(builtInStagePack);
  }

  function showEditorMessage(message) {
    game.editorMessage = message;
    game.editorMessageTimer = 120;
  }

  function nextStage(delta) {
    if (game.screen === "stageSelectClosing" || game.screen === "stageClearClosing") return;
    if (game.screen === "stageSelect") {
      pendingStageSelectPresses.clear();
      changeStageSelection(delta);
      return;
    }
    game.stage += delta;
    if (game.stage < 1) game.stage = stageCycleLimit();
    if (game.stage > stageCycleLimit()) game.stage = 1;
    if (game.screen === "playing" || game.screen === "stageIntro" || game.screen === "stageClear") {
      game.customGrid = null;
      game.constructionStageActive = false;
      startStage(game.stage);
    }
  }

  function initAudio() {
    if (!audioCtx && window.AudioContext) {
      audioCtx = new window.AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    syncStageStartAudioNodes();
    syncBonusLifeAudioNodes();
    syncPowerUpPickupAudioNodes();
    syncPowerUpAppearAudioNodes();
    syncBrickHitAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
    syncEnemyDestroyAudioNodes();
    syncPlayerDestroyAudioNodes();
    syncPlayerShootAudioNodes();
    syncMovementIceAudioNodes();
    syncPauseAudioNodes();
    syncScoreCountAudioNodes();
    syncStageBonusAudioNodes();
    syncGameOverAudioNodes();
    syncHighScoreAudioNodes();
    syncMovementAudio();
  }

  function trackSequencedSound(name, oscillator) {
    if (!name) return;
    let nodes = activeSequencedSounds.get(name);
    if (!nodes) {
      nodes = new Set();
      activeSequencedSounds.set(name, nodes);
    }
    nodes.add(oscillator);
    oscillator.onended = () => {
      nodes.delete(oscillator);
      if (nodes.size === 0 && activeSequencedSounds.get(name) === nodes) {
        activeSequencedSounds.delete(name);
      }
    };
  }

  function stopSound(name) {
    const nodes = activeSequencedSounds.get(name);
    if (!nodes) return;
    activeSequencedSounds.delete(name);
    for (const oscillator of nodes) {
      try {
        oscillator.stop(audioCtx ? audioCtx.currentTime : 0);
      } catch (_error) {
        // A naturally ended oscillator no longer needs to be stopped.
      }
    }
  }

  function fixedFrameAudioPresentation(eventName, frame) {
    return selectFixedFrameAudioPresentation(FREE_AUDIO_MANIFEST.events[eventName], frame);
  }

  function shortNoiseBuffer(clockRate) {
    if (!audioCtx || typeof audioCtx.createBuffer !== "function") return null;
    const sampleRate = Math.max(8000, Math.floor(Number(audioCtx.sampleRate) || 44100));
    const normalizedClockRate = Math.max(1, Math.floor(Number(clockRate) || 27965));
    if (
      fixedShortNoiseBuffer &&
      fixedShortNoiseSampleRate === sampleRate &&
      fixedShortNoiseClockRate === normalizedClockRate
    ) return fixedShortNoiseBuffer;

    const lfsrPeriod = 93;
    const sampleCount = Math.max(2, Math.round(sampleRate * lfsrPeriod / normalizedClockRate));
    const buffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
    const samples = buffer.getChannelData(0);
    let lfsr = 1;
    let currentStep = -1;
    for (let index = 0; index < sampleCount; index += 1) {
      const targetStep = Math.floor(index * normalizedClockRate / sampleRate);
      while (currentStep < targetStep) {
        const feedback = (lfsr & 1) ^ ((lfsr >> 6) & 1);
        lfsr = (lfsr >> 1) | (feedback << 14);
        currentStep += 1;
      }
      samples[index] = (lfsr & 1) ? 1 : -1;
    }
    fixedShortNoiseBuffer = buffer;
    fixedShortNoiseSampleRate = sampleRate;
    fixedShortNoiseClockRate = normalizedClockRate;
    return buffer;
  }

  function longNoiseBuffer(clockRate) {
    if (!audioCtx || typeof audioCtx.createBuffer !== "function") return null;
    const sampleRate = Math.max(8000, Math.floor(Number(audioCtx.sampleRate) || 44100));
    const normalizedClockRate = Math.max(1, Math.floor(Number(clockRate) || 3523));
    if (
      fixedLongNoiseBuffer &&
      fixedLongNoiseSampleRate === sampleRate &&
      fixedLongNoiseClockRate === normalizedClockRate
    ) return fixedLongNoiseBuffer;

    const lfsrPeriod = 32767;
    const sampleCount = Math.max(2, Math.round(sampleRate * lfsrPeriod / normalizedClockRate));
    const buffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
    const samples = buffer.getChannelData(0);
    let lfsr = 1;
    let currentStep = -1;
    for (let index = 0; index < sampleCount; index += 1) {
      const targetStep = Math.floor(index * normalizedClockRate / sampleRate);
      while (currentStep < targetStep) {
        const feedback = (lfsr & 1) ^ ((lfsr >> 1) & 1);
        lfsr = (lfsr >> 1) | (feedback << 14);
        currentStep += 1;
      }
      samples[index] = (lfsr & 1) ? 1 : -1;
    }
    fixedLongNoiseBuffer = buffer;
    fixedLongNoiseSampleRate = sampleRate;
    fixedLongNoiseClockRate = normalizedClockRate;
    return buffer;
  }

  function createFixedFrameAudioSource(voice) {
    if (
      (voice.wave === "noise-short" || voice.wave === "noise-long") &&
      audioCtx &&
      typeof audioCtx.createBufferSource === "function"
    ) {
      const buffer = voice.wave === "noise-short"
        ? shortNoiseBuffer(voice.frequency)
        : longNoiseBuffer(voice.frequency);
      if (buffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return source;
      }
    }
    const oscillator = audioCtx.createOscillator();
    oscillator.type = voice.wave === "noise-short" || voice.wave === "noise-long" ? "square" : voice.wave;
    oscillator.frequency.value = voice.frequency;
    return oscillator;
  }

  function stopFixedFrameAudioNodes(state) {
    for (const node of state.nodes) {
      if (!node) continue;
      try {
        node.source.stop(audioCtx ? audioCtx.currentTime : 0);
      } catch (_error) {
        // Pausing or leaving a screen discards these nodes; resume creates fresh ones.
      }
    }
    state.nodes = [];
  }

  function syncFixedFrameAudioNodes(state, eventName, audible, runsWhilePaused) {
    if (!audioCtx || !state.active || (game.paused && !runsWhilePaused)) {
      stopFixedFrameAudioNodes(state);
      return;
    }
    const presentation = fixedFrameAudioPresentation(eventName, state.frame);
    if (state.nodes.length !== presentation.voices.length) {
      stopFixedFrameAudioNodes(state);
      state.nodes = Array(presentation.voices.length).fill(null);
    }
    presentation.voices.forEach((presentedVoice, index) => {
      const voice = fixedFrameVoiceIsAudible(audible, index) ? presentedVoice : null;
      let node = state.nodes[index];
      if (!voice) {
        if (node) {
          try {
            node.source.stop(audioCtx.currentTime);
          } catch (_error) {
            // A voice that ended on the previous frame is already silent.
          }
          state.nodes[index] = null;
        }
        return;
      }
      if (!node) {
        const source = createFixedFrameAudioSource(voice);
        const gain = audioCtx.createGain();
        gain.gain.value = voice.gain;
        source.connect(gain);
        gain.connect(audioCtx.destination);
        source.start();
        node = { source, gain };
        state.nodes[index] = node;
      }
      if (node.source.frequency) node.source.frequency.value = voice.frequency;
      node.gain.gain.value = voice.gain;
    });
  }

  function startFixedFrameAudio(state, eventName, audible, runsWhilePaused) {
    stopFixedFrameAudioNodes(state);
    beginFixedFrameAudioState(state);
    syncMovementAudio();
    syncFixedFrameAudioNodes(state, eventName, audible, runsWhilePaused);
  }

  function stopFixedFrameAudio(state) {
    resetFixedFrameAudioState(state);
    stopFixedFrameAudioNodes(state);
  }

  function updateFixedFrameAudio(state, eventName, audible, runsWhilePaused) {
    const updateMode = fixedFrameAudioUpdateMode(state, game.paused, runsWhilePaused);
    if (updateMode === FIXED_FRAME_AUDIO_UPDATE_MODE.INACTIVE) return;
    if (updateMode === FIXED_FRAME_AUDIO_UPDATE_MODE.HELD) {
      syncFixedFrameAudioNodes(state, eventName, audible, runsWhilePaused);
      return;
    }
    const durationFrames = fixedFrameAudioPresentation(eventName, state.frame).durationFrames;
    if (advanceFixedFrameAudioState(state, durationFrames)) {
      stopFixedFrameAudioNodes(state);
      syncMovementAudio();
      return;
    }
    syncFixedFrameAudioNodes(state, eventName, audible, runsWhilePaused);
    syncMovementAudio();
  }

  function stageStartAudioPresentation(frame) {
    return fixedFrameAudioPresentation("stageStart", frame);
  }

  function currentAudioMixState() {
    return {
      screen: game.screen, paused: game.paused,
      clearPendingTimer: game.clearPendingTimer, baseDestroyTimer: game.baseDestroyTimer,
      bonusLifePulse1Active: bonusLifePulse1Active(), bonusLifePulse2Active: bonusLifePulse2Active(),
      active: {
        pause: pauseAudio.active, stageStart: stageStartAudio.active,
        powerUpPickup: powerUpPickupAudio.active, powerUpAppear: powerUpAppearAudio.active,
        baseHit: baseHitAudio.active, steelHit: steelHitAudio.active, enemyHit: enemyHitAudio.active,
        playerDestroy: playerDestroyAudio.active, playerShoot: playerShootAudio.active
      }
    };
  }

  function currentAudioAudibility() {
    return selectAudioAudibility(currentAudioMixState());
  }

  function stageStartAudioAudibility() {
    return currentAudioAudibility().stageStartAudibility;
  }

  function syncStageStartAudioNodes() {
    syncFixedFrameAudioNodes(stageStartAudio, "stageStart", stageStartAudioAudibility());
  }

  function startStageStartAudio() {
    startFixedFrameAudio(stageStartAudio, "stageStart");
    syncBrickHitAudioNodes();
    syncBaseHitAudioNodes();
    syncEnemyHitAudioNodes();
  }

  function stopStageStartAudio() {
    stopFixedFrameAudio(stageStartAudio);
    syncBaseHitAudioNodes();
  }

  function updateStageStartAudio() {
    updateFixedFrameAudio(stageStartAudio, "stageStart");
    syncBrickHitAudioNodes();
    syncBaseHitAudioNodes();
    syncEnemyHitAudioNodes();
  }

  function bonusLifeAudioPresentation(frame) {
    return fixedFrameAudioPresentation("bonusLife", frame);
  }

  function bonusLifeAudioAudibility() {
    return currentAudioAudibility().bonusLifeAudibility;
  }

  function syncBonusLifeAudioNodes() {
    syncFixedFrameAudioNodes(bonusLifeAudio, "bonusLife", bonusLifeAudioAudibility());
  }

  function startBonusLifeAudio() {
    startFixedFrameAudio(bonusLifeAudio, "bonusLife");
    syncPowerUpPickupAudioNodes();
    syncPowerUpAppearAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
    syncPlayerShootAudioNodes();
    syncMovementIceAudioNodes();
    syncStageBonusAudioNodes();
  }

  function stopBonusLifeAudio() {
    stopFixedFrameAudio(bonusLifeAudio);
    syncBaseHitAudioNodes();
    syncStageBonusAudioNodes();
  }

  function updateBonusLifeAudio() {
    updateFixedFrameAudio(bonusLifeAudio, "bonusLife");
    syncPowerUpPickupAudioNodes();
    syncPowerUpAppearAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
    syncPlayerShootAudioNodes();
    syncMovementIceAudioNodes();
    syncStageBonusAudioNodes();
  }

  function bonusLifePulse1Active() {
    return bonusLifeAudio.active && Boolean(bonusLifeAudioPresentation(bonusLifeAudio.frame).voices[0]);
  }

  function bonusLifePulse2Active() {
    return bonusLifeAudio.active && Boolean(bonusLifeAudioPresentation(bonusLifeAudio.frame).voices[1]);
  }

  function powerUpPickupAudioPresentation(frame) {
    return fixedFrameAudioPresentation("powerUp", frame);
  }

  function powerUpPickupAudioAudible() {
    return currentAudioAudibility().powerUpPickupAudible;
  }

  function syncPowerUpPickupAudioNodes() {
    syncFixedFrameAudioNodes(powerUpPickupAudio, "powerUp", powerUpPickupAudioAudible());
  }

  function startPowerUpPickupAudio() {
    startFixedFrameAudio(powerUpPickupAudio, "powerUp", powerUpPickupAudioAudible());
    syncPowerUpAppearAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
  }

  function stopPowerUpPickupAudio() {
    stopFixedFrameAudio(powerUpPickupAudio);
    syncBaseHitAudioNodes();
  }

  function updatePowerUpPickupAudio() {
    updateFixedFrameAudio(powerUpPickupAudio, "powerUp", powerUpPickupAudioAudible());
    syncPowerUpAppearAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
  }

  function powerUpAppearAudioPresentation(frame) {
    return fixedFrameAudioPresentation("powerUpAppear", frame);
  }

  // Lower-index original pulse-two events keep the channel while this cue still advances silently.
  function powerUpAppearAudioAudible() {
    return currentAudioAudibility().powerUpAppearAudible;
  }

  function syncPowerUpAppearAudioNodes() {
    syncFixedFrameAudioNodes(powerUpAppearAudio, "powerUpAppear", powerUpAppearAudioAudible());
  }

  function startPowerUpAppearAudio() {
    startFixedFrameAudio(powerUpAppearAudio, "powerUpAppear", powerUpAppearAudioAudible());
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
  }

  function stopPowerUpAppearAudio() {
    stopFixedFrameAudio(powerUpAppearAudio);
    syncBaseHitAudioNodes();
  }

  function updatePowerUpAppearAudio() {
    updateFixedFrameAudio(powerUpAppearAudio, "powerUpAppear", powerUpAppearAudioAudible());
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
  }

  function brickHitAudioPresentation(frame) {
    return fixedFrameAudioPresentation("brickHit", frame);
  }

  function brickHitAudioAudible() {
    return currentAudioAudibility().brickHitAudible;
  }

  function syncBrickHitAudioNodes() {
    syncFixedFrameAudioNodes(brickHitAudio, "brickHit", brickHitAudioAudible());
  }

  function startBrickHitAudio() {
    startFixedFrameAudio(brickHitAudio, "brickHit", brickHitAudioAudible());
  }

  function stopBrickHitAudio() {
    stopFixedFrameAudio(brickHitAudio);
  }

  function updateBrickHitAudio() {
    updateFixedFrameAudio(brickHitAudio, "brickHit", brickHitAudioAudible());
  }

  function baseHitAudioPresentation(frame) {
    return fixedFrameAudioPresentation("baseHit", frame);
  }

  function baseHitAudioAudible() {
    return currentAudioAudibility().baseHitAudible;
  }

  function syncBaseHitAudioNodes() {
    syncFixedFrameAudioNodes(baseHitAudio, "baseHit", baseHitAudioAudible());
  }

  function syncLowerPriorityPulse2AudioNodes() {
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
    syncMovementAudio();
  }

  function startBaseHitAudio() {
    startFixedFrameAudio(baseHitAudio, "baseHit", baseHitAudioAudible());
    syncLowerPriorityPulse2AudioNodes();
  }

  function stopBaseHitAudio() {
    stopFixedFrameAudio(baseHitAudio);
    syncLowerPriorityPulse2AudioNodes();
  }

  function updateBaseHitAudio() {
    updateFixedFrameAudio(baseHitAudio, "baseHit", baseHitAudioAudible());
    syncLowerPriorityPulse2AudioNodes();
  }

  function steelHitAudioPresentation(frame) {
    return fixedFrameAudioPresentation("steelHit", frame);
  }

  function steelHitAudioAudible() {
    return currentAudioAudibility().steelHitAudible;
  }

  function syncSteelHitAudioNodes() {
    syncFixedFrameAudioNodes(steelHitAudio, "steelHit", steelHitAudioAudible());
  }

  function startSteelHitAudio() {
    startFixedFrameAudio(steelHitAudio, "steelHit", steelHitAudioAudible());
    syncEnemyHitAudioNodes();
  }

  function stopSteelHitAudio() {
    stopFixedFrameAudio(steelHitAudio);
    syncEnemyHitAudioNodes();
  }

  function updateSteelHitAudio() {
    updateFixedFrameAudio(steelHitAudio, "steelHit", steelHitAudioAudible());
    syncEnemyHitAudioNodes();
  }

  function enemyHitAudioPresentation(frame) {
    return fixedFrameAudioPresentation("enemyHit", frame);
  }

  function enemyHitAudioAudible() {
    return currentAudioAudibility().enemyHitAudible;
  }

  function syncEnemyHitAudioNodes() {
    syncFixedFrameAudioNodes(enemyHitAudio, "enemyHit", enemyHitAudioAudible());
  }

  function startEnemyHitAudio() {
    startFixedFrameAudio(enemyHitAudio, "enemyHit", enemyHitAudioAudible());
  }

  function stopEnemyHitAudio() {
    stopFixedFrameAudio(enemyHitAudio);
  }

  function updateEnemyHitAudio() {
    updateFixedFrameAudio(enemyHitAudio, "enemyHit", enemyHitAudioAudible());
  }

  function enemyDestroyAudioPresentation(frame) {
    return fixedFrameAudioPresentation("enemyDestroy", frame);
  }

  function enemyDestroyAudioAudible() {
    return currentAudioAudibility().enemyDestroyAudible;
  }

  function syncEnemyDestroyAudioNodes() {
    syncFixedFrameAudioNodes(enemyDestroyAudio, "enemyDestroy", enemyDestroyAudioAudible());
  }

  function startEnemyDestroyAudio() {
    startFixedFrameAudio(enemyDestroyAudio, "enemyDestroy", enemyDestroyAudioAudible());
  }

  function stopEnemyDestroyAudio() {
    stopFixedFrameAudio(enemyDestroyAudio);
  }

  function updateEnemyDestroyAudio() {
    updateFixedFrameAudio(enemyDestroyAudio, "enemyDestroy", enemyDestroyAudioAudible());
  }

  function playerDestroyAudioPresentation(frame) {
    return fixedFrameAudioPresentation("playerDestroy", frame);
  }

  function syncPlayerDestroyAudioNodes() {
    syncFixedFrameAudioNodes(playerDestroyAudio, "playerDestroy", true);
  }

  function startPlayerDestroyAudio() {
    startFixedFrameAudio(playerDestroyAudio, "playerDestroy", true);
    syncEnemyDestroyAudioNodes();
  }

  function stopPlayerDestroyAudio() {
    stopFixedFrameAudio(playerDestroyAudio);
    syncEnemyDestroyAudioNodes();
  }

  function updatePlayerDestroyAudio() {
    updateFixedFrameAudio(playerDestroyAudio, "playerDestroy", true);
    syncEnemyDestroyAudioNodes();
  }

  function playerShootAudioPresentation(frame) {
    return fixedFrameAudioPresentation("playerShoot", frame);
  }

  function playerShootAudioAudible() {
    return currentAudioAudibility().playerShootAudible;
  }

  function syncPlayerShootAudioNodes() {
    syncFixedFrameAudioNodes(playerShootAudio, "playerShoot", playerShootAudioAudible());
  }

  function startPlayerShootAudio() {
    startFixedFrameAudio(playerShootAudio, "playerShoot", playerShootAudioAudible());
    syncMovementIceAudioNodes();
  }

  function stopPlayerShootAudio() {
    stopFixedFrameAudio(playerShootAudio);
  }

  function updatePlayerShootAudio() {
    updateFixedFrameAudio(playerShootAudio, "playerShoot", playerShootAudioAudible());
    syncMovementIceAudioNodes();
  }

  function movementIceAudioPresentation(frame) {
    return fixedFrameAudioPresentation("movementIce", frame);
  }

  function movementIceAudioAudible() {
    return currentAudioAudibility().movementIceAudible;
  }

  function syncMovementIceAudioNodes() {
    syncFixedFrameAudioNodes(movementIceAudio, "movementIce", movementIceAudioAudible());
  }

  function startMovementIceAudio() {
    startFixedFrameAudio(movementIceAudio, "movementIce", movementIceAudioAudible());
  }

  function stopMovementIceAudio() {
    stopFixedFrameAudio(movementIceAudio);
  }

  function updateMovementIceAudio() {
    updateFixedFrameAudio(movementIceAudio, "movementIce", movementIceAudioAudible());
  }

  function pauseAudioPresentation(frame) {
    return fixedFrameAudioPresentation("pause", frame);
  }

  function syncPauseAudioNodes() {
    syncFixedFrameAudioNodes(pauseAudio, "pause", true, true);
  }

  function startPauseAudio() {
    startFixedFrameAudio(pauseAudio, "pause", true, true);
    syncStageStartAudioNodes();
    syncBonusLifeAudioNodes();
    syncPowerUpPickupAudioNodes();
    syncPowerUpAppearAudioNodes();
    syncBrickHitAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
    syncEnemyDestroyAudioNodes();
    syncPlayerDestroyAudioNodes();
    syncPlayerShootAudioNodes();
    syncMovementIceAudioNodes();
  }

  function stopPauseAudio() {
    stopFixedFrameAudio(pauseAudio);
  }

  function updatePauseAudio() {
    const wasActive = pauseAudio.active;
    updateFixedFrameAudio(pauseAudio, "pause", true, true);
    if (!wasActive || pauseAudio.active) return;
    syncStageStartAudioNodes();
    syncBonusLifeAudioNodes();
    syncPowerUpPickupAudioNodes();
    syncPowerUpAppearAudioNodes();
    syncBrickHitAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
    syncEnemyDestroyAudioNodes();
    syncPlayerDestroyAudioNodes();
    syncPlayerShootAudioNodes();
    syncMovementIceAudioNodes();
    syncMovementAudio();
  }

  function scoreCountAudioPresentation(frame) {
    return fixedFrameAudioPresentation("scoreCount", frame);
  }

  function syncScoreCountAudioNodes() {
    syncFixedFrameAudioNodes(scoreCountAudio, "scoreCount", true);
  }

  function startScoreCountAudio() {
    startFixedFrameAudio(scoreCountAudio, "scoreCount", true);
  }

  function stopScoreCountAudio() {
    stopFixedFrameAudio(scoreCountAudio);
  }

  function updateScoreCountAudio() {
    updateFixedFrameAudio(scoreCountAudio, "scoreCount", true);
  }

  function stageBonusAudioPresentation(frame) {
    return fixedFrameAudioPresentation("stageBonus", frame);
  }

  function stageBonusAudioAudible() {
    return currentAudioAudibility().stageBonusAudible;
  }

  function syncStageBonusAudioNodes() {
    syncFixedFrameAudioNodes(stageBonusAudio, "stageBonus", stageBonusAudioAudible());
  }

  function startStageBonusAudio() {
    startFixedFrameAudio(stageBonusAudio, "stageBonus", stageBonusAudioAudible());
  }

  function stopStageBonusAudio() {
    stopFixedFrameAudio(stageBonusAudio);
  }

  function updateStageBonusAudio() {
    updateFixedFrameAudio(stageBonusAudio, "stageBonus", stageBonusAudioAudible());
  }

  function gameOverAudioPresentation(frame) {
    return fixedFrameAudioPresentation("gameOver", frame);
  }

  function syncGameOverAudioNodes() {
    syncFixedFrameAudioNodes(gameOverAudio, "gameOver", true);
  }

  function startGameOverAudio() {
    startFixedFrameAudio(gameOverAudio, "gameOver", true);
  }

  function stopGameOverAudio() {
    stopFixedFrameAudio(gameOverAudio);
  }

  function updateGameOverAudio() {
    updateFixedFrameAudio(gameOverAudio, "gameOver", true);
  }

  function highScoreAudioPresentation(frame) {
    return fixedFrameAudioPresentation("highScore", frame);
  }

  function syncHighScoreAudioNodes() {
    syncFixedFrameAudioNodes(highScoreAudio, "highScore", true);
  }

  function startHighScoreAudio() {
    startFixedFrameAudio(highScoreAudio, "highScore", true);
  }

  function stopHighScoreAudio() {
    stopFixedFrameAudio(highScoreAudio);
  }

  function updateHighScoreAudio() {
    updateFixedFrameAudio(highScoreAudio, "highScore", true);
  }

  function movementAudioPresentation(mode, tick) {
    return selectMovementAudioPresentation(mode, tick, FREE_AUDIO_MANIFEST.events);
  }

  function stopMovementAudioNode() {
    if (movementAudio.oscillator) {
      try {
        movementAudio.oscillator.stop(audioCtx ? audioCtx.currentTime : 0);
      } catch (_error) {
        // A stopped oscillator cannot be reused; the next active mode creates a new one.
      }
    }
    movementAudio.oscillator = null;
    movementAudio.gain = null;
    movementAudio.phase = -1;
  }

  function startMovementAudioNode() {
    if (!audioCtx || movementAudio.mode === "none") return;
    const presentation = movementAudioPresentation(movementAudio.mode, game.tick);
    if (!presentation) return;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = presentation.wave || "square";
    oscillator.frequency.value = presentation.frequency;
    gain.gain.value = presentation.gain || 0.01;
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    movementAudio.oscillator = oscillator;
    movementAudio.gain = gain;
    movementAudio.phase = presentation.phase;
    oscillator.start();
  }

  function setMovementAudioMode(mode) {
    const nextMode = mode === "player" || mode === "enemy" ? mode : "none";
    if (movementAudio.mode !== nextMode) {
      stopMovementAudioNode();
      movementAudio.mode = nextMode;
    }
    if (nextMode === "none") {
      stopMovementAudioNode();
      return;
    }
    if (!movementAudio.oscillator) startMovementAudioNode();
    const presentation = movementAudioPresentation(nextMode, game.tick);
    if (!presentation || !movementAudio.oscillator || movementAudio.phase === presentation.phase) return;
    movementAudio.phase = presentation.phase;
    movementAudio.oscillator.frequency.value = presentation.frequency;
  }

  function stopMovementAudio() {
    setMovementAudioMode("none");
  }

  function playerHasMovementSoundState(player) {
    return Boolean(player && (player.alive || player.respawn > 0));
  }

  function playerMovementAudioRequested() {
    for (const player of game.players) {
      if (!playerHasMovementSoundState(player)) continue;
      if (game.demoMode) {
        if (demoControlForPlayer(player).direction !== -1) return true;
        continue;
      }
      const control = getPlayerControl(player.id);
      if ([control.up, control.right, control.down, control.left].some((binding) => hasControlKey(binding))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Mirrors the original pulse-channel priority: held player movement replaces
   * the always-running enemy engine loop while an active battle is accepting input.
   */
  function movementAudioModeForState() {
    const state = currentAudioMixState();
    if (isMovementAudioBlocked(state)) return "none";
    return selectMovementAudioMode({
      ...state,
      playerMovementRequested: playerMovementAudioRequested()
    });
  }

  function syncMovementAudio() {
    setMovementAudioMode(movementAudioModeForState());
  }

  function beep(freq, duration, gain, type, delay, sequenceName) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime + Math.max(0, Number(delay) || 0);
    const osc = audioCtx.createOscillator();
    const vol = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = type || "square";
    vol.gain.setValueAtTime(gain || 0.025, now);
    vol.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(vol).connect(audioCtx.destination);
    trackSequencedSound(sequenceName, osc);
    osc.start(now);
    osc.stop(now + duration);
  }

  function playSoundVoice(name, voice, defaults) {
    const notes = Array.isArray(voice.notes) ? voice.notes : [];
    const repeat = Math.max(1, Math.floor(Number(voice.repeat ?? defaults.repeat) || 1));
    const noteFrames = Array.isArray(voice.noteFrames) && voice.noteFrames.length === notes.length
      ? voice.noteFrames.map((frames) => Math.max(1, Math.floor(Number(frames) || 1)))
      : null;
    const step = Math.max(0.01, Number(voice.step ?? defaults.step) || 0.2);
    const noteDuration = Number(voice.noteDuration ?? defaults.noteDuration) || step * 0.7;
    const gain = Number(voice.gain ?? defaults.gain) || 0.025;
    const wave = voice.wave || defaults.wave;
    if (noteFrames) {
      const phraseDuration = noteFrames.reduce((sum, frames) => sum + frames, 0) / 60;
      for (let loop = 0; loop < repeat; loop += 1) {
        let offset = loop * phraseDuration;
        for (let index = 0; index < notes.length; index += 1) {
          const frequency = Number(notes[index]);
          const duration = noteFrames[index] / 60;
          if (frequency > 0) beep(frequency, duration, gain, wave, offset, name);
          offset += duration;
        }
      }
      return;
    }
    for (let loop = 0; loop < repeat; loop += 1) {
      for (let index = 0; index < notes.length; index += 1) {
        const frequency = Number(notes[index]);
        if (!(frequency > 0)) continue;
        const offset = (loop * notes.length + index) * step;
        beep(frequency, noteDuration, gain, wave, offset, name);
      }
    }
  }

  function playSound(name, options) {
    const event = FREE_AUDIO_MANIFEST.events[name];
    if (!event) return;
    if (name === "brickHit") {
      startBrickHitAudio();
      return;
    }
    if (name === "steelHit") {
      startSteelHitAudio();
      return;
    }
    if (name === "enemyHit") {
      startEnemyHitAudio();
      return;
    }
    if (name === "enemyDestroy") {
      startEnemyDestroyAudio();
      return;
    }
    if (name === "baseHit") {
      startBaseHitAudio();
      return;
    }
    if (name === "playerDestroy") {
      startPlayerDestroyAudio();
      return;
    }
    if (name === "playerShoot") {
      startPlayerShootAudio();
      return;
    }
    if (name === "movementIce") {
      startMovementIceAudio();
      return;
    }
    if (name === "bonusLife") {
      startBonusLifeAudio();
      return;
    }
    if (name === "powerUp") {
      startPowerUpPickupAudio();
      return;
    }
    if (name === "powerUpAppear") {
      startPowerUpAppearAudio();
      return;
    }
    if (name === "pause") {
      startPauseAudio();
      return;
    }
    if (name === "scoreCount") {
      startScoreCountAudio();
      return;
    }
    if (name === "stageBonus") {
      startStageBonusAudio();
      return;
    }
    if (name === "gameOver") {
      startGameOverAudio();
      return;
    }
    if (name === "highScore") {
      startHighScoreAudio();
      return;
    }
    const opts = options || {};
    if (Array.isArray(event.voices) && event.voices.length) {
      stopSound(name);
      for (const voice of event.voices) playSoundVoice(name, voice, event);
      return;
    }
    if (Array.isArray(event.notes) && event.notes.length) {
      stopSound(name);
      playSoundVoice(name, event, event);
      return;
    }
    const pitch = opts.brush === undefined ? 0 : Number(opts.brush) * (event.brushPitch || 0);
    beep(event.freq + pitch, event.duration, event.gain, event.wave);
  }

  function handleAction(action) {
    initAudio();
    if (action === "one") {
      setTitleMenu(0);
      beginStageSelect(1);
    } else if (action === "two") {
      setTitleMenu(1);
      beginStageSelect(2);
    }
    else if (action === "prev") nextStage(-1);
    else if (action === "next") nextStage(1);
    else if (action === "edit") {
      setTitleMenu(2);
      enterEditor();
    }
    else if (action === "test" && game.screen === "editor") testEditorStage();
    else if (action === "save" && game.screen === "editor") saveEditorStage();
    else if (action === "load" && game.screen === "editor") loadEditorStage();
    else if (action === "clear" && game.screen === "editor") clearEditorStage();
    else if (action === "export" && game.screen === "editor") exportEditorStage();
    else if (action === "import") importStagePackFile();
    else if (action === "pause") togglePause();
    else if (action === "reset") {
      restoreBuiltInStagePack();
    }
  }

  function isPauseInputCode(code) {
    return code === "Enter" || code === "KeyP";
  }

  /**
   * Toggles the active battle pause state. The original pause sound is triggered only on entry.
   * @returns {boolean} Whether an active battle accepted the pause input.
   */
  function togglePause() {
    if (
      game.screen !== "playing" ||
      game.demoMode ||
      game.clearPendingTimer > 0 ||
      game.baseDestroyTimer > 0 ||
      stageEnemiesCleared()
    ) return false;
    game.paused = !game.paused;
    game.pauseElapsed = 0;
    pendingFirePresses.clear();
    syncStageStartAudioNodes();
    syncBonusLifeAudioNodes();
    syncPowerUpPickupAudioNodes();
    syncPowerUpAppearAudioNodes();
    syncBrickHitAudioNodes();
    syncBaseHitAudioNodes();
    syncSteelHitAudioNodes();
    syncEnemyHitAudioNodes();
    syncEnemyDestroyAudioNodes();
    syncPlayerDestroyAudioNodes();
    syncPlayerShootAudioNodes();
    syncMovementIceAudioNodes();
    syncPauseAudioNodes();
    syncMovementAudio();
    if (game.paused) {
      playSound("pause");
    }
    return true;
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });

  if (packFileInput) {
    packFileInput.addEventListener("change", async () => {
      const file = packFileInput.files && packFileInput.files[0];
      if (!file) return;
      try {
        const result = loadStagePackJsonText(await file.text());
        showEditorMessage(result.ok ? "IMPORTED" : "BAD");
        if (!result.ok) console.warn(result.error);
      } catch (error) {
        showEditorMessage("ERR");
        console.warn(error);
      } finally {
        packFileInput.value = "";
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    const wasHeld = keys.has(event.code);
    keys.add(event.code);
    const handledCodes = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "Enter",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyF",
      "KeyG",
      "KeyZ",
      "Digit1",
      "Digit2",
      "KeyC",
      "KeyE",
      "KeyL",
      "KeyP",
      "KeyR",
      "KeyX",
      "Digit0",
      "Digit3",
      "Digit4",
      "Digit5",
      "Escape"
    ];
    if (handledCodes.includes(event.code)) event.preventDefault();
    if (event.repeat || wasHeld) return;

    if (game.demoMode && (event.code === "Enter" || event.code === "Space" || event.code === "Escape")) {
      keys.delete(event.code);
      endTitleDemo();
      return;
    }
    initAudio();

    if (game.screen === "playing" && !game.paused) pendingFirePresses.add(event.code);

    if (game.screen === "title") {
      if (recordHiddenTitleInput(event.code)) return;
      if (event.code === "Enter" && hiddenMessageTriggerReady()) startHiddenMessage();
      else if (event.code === "Enter" || event.code === "Space") activateTitleMenu();
      else if (event.code === "Digit1") {
        setTitleMenu(0);
        beginStageSelect(1);
      } else if (event.code === "Digit2") {
        setTitleMenu(1);
        beginStageSelect(2);
      }
      else if (event.code === "ArrowUp" || event.code === "KeyW") moveTitleMenu(-1);
      else if (event.code === "ArrowDown" || event.code === "KeyS") {
        if (!reserveTitleDirectionForHiddenInput(event.code)) moveTitleMenu(1);
      }
      else if (event.code === "KeyC" || event.code === "KeyE") {
        setTitleMenu(2);
        enterEditor();
      }
    } else if (game.screen === "stageSelect") {
      if (event.code === "Enter") startSelectedGame();
      else if (event.code === "Space" || event.code === "KeyZ") {
        pendingStageSelectPresses.add(event.code);
      } else if (event.code === "KeyF" || event.code === "KeyX") {
        pendingStageSelectPresses.add(event.code);
      } else if (event.code === "Escape") {
        pendingStageSelectPresses.clear();
        game.screen = "title";
        game.stage = 1;
      }
    } else if (game.screen === "editor") {
      if (event.ctrlKey && event.code === "KeyS") {
        keys.delete(event.code);
        saveEditorStage();
      } else if (event.ctrlKey && event.code === "KeyX") {
        keys.delete(event.code);
        exportEditorStage();
      } else if (isEditorDirectionCode(event.code)) {
        moveEditorFromCode(event.code);
      } else if (event.code === "Space" || event.code === "KeyZ") useOriginalEditorButton(1);
      else if (event.code === "KeyF" || event.code === "KeyX") useOriginalEditorButton(-1);
      else if (event.code === "Enter") exitEditorToTitle();
      else if (event.code === "KeyE") testEditorStage();
      else if (event.code === "KeyL") loadEditorStage();
      else if (event.code === "KeyR") clearEditorStage();
      else if (/^Digit[0-5]$/.test(event.code)) selectEditorBrush(Number(event.code.slice(-1)));
      else if (event.code === "Escape") exitEditorToTitle();
    } else if (game.screen === "gameOver") {
      return;
    } else if (game.screen === "fullGameOver") {
      handleFullGameOverInput(event.code);
    } else if (game.screen === "highScore" || game.screen === "hiddenMessage") {
      return;
    } else if (game.screen === "stageClear" || game.screen === "stageClearClosing") {
      return;
    } else if (isPauseInputCode(event.code)) {
      togglePause();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  canvas.addEventListener("mousemove", (event) => {
    if (game.screen !== "editor") return;
    const pos = canvasToGame(event);
    game.editorCursor = {
      qc: Math.floor((pos.x - FIELD_X) / HALF),
      qr: Math.floor((pos.y - FIELD_Y) / HALF)
    };
  });

  canvas.addEventListener("mouseleave", () => {
    game.editorCursor = { qc: -1, qr: -1 };
  });

  canvas.addEventListener("click", (event) => {
    if (game.screen !== "editor") return;
    initAudio();
    const pos = canvasToGame(event);
    if (pos.x >= PANEL_X) {
      return;
    }
    if (event.shiftKey) {
      if (event.altKey) {
        cycleEditorCell(Math.floor((pos.x - FIELD_X) / TILE), Math.floor((pos.y - FIELD_Y) / TILE));
      } else {
        paintEditorCell(Math.floor((pos.x - FIELD_X) / TILE), Math.floor((pos.y - FIELD_Y) / TILE));
      }
    } else if (event.altKey) {
      cycleEditorQuadrant(Math.floor((pos.x - FIELD_X) / HALF), Math.floor((pos.y - FIELD_Y) / HALF));
    } else {
      paintEditorQuadrant(Math.floor((pos.x - FIELD_X) / HALF), Math.floor((pos.y - FIELD_Y) / HALF));
    }
  });

  function canvasToGame(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SCREEN_W,
      y: ((event.clientY - rect.top) / rect.height) * SCREEN_H
    };
  }

  function moveEditorFromCode(code) {
    const direction = editorDirectionForCode(code);
    if (!direction) return;
    game.editorMoveHoldTimer = 0;
    moveEditorCursor(direction.dx, direction.dy);
    if (originalEditorButtonHeld(keys)) pasteOriginalEditorPattern();
  }

  function moveEditorCursor(dx, dy) {
    if (game.screen !== "editor") return;
    game.editorCursor = selectEditorCursorMove(game.editorCursor, dx, dy);
    game.editorPatternArmed = false;
  }

  function useOriginalEditorButton(delta) {
    if (!game.editorGrid) return;
    if (game.editorPatternArmed) {
      game.editorPattern = nextEditorPatternIndex(game.editorPattern, delta);
    } else {
      game.editorPatternArmed = true;
    }
    const pattern = editorPatternAt(game.editorPattern);
    game.editorBrush = pattern.type;
    pasteOriginalEditorPattern();
  }

  function pasteOriginalEditorPattern() {
    if (!game.editorGrid) return;
    const cell = editorCellForCursor(game.editorCursor);
    if (!cell) return;
    const pattern = editorPatternAt(game.editorPattern);
    setTile(game.editorGrid, cell.c, cell.r, pattern.type, pattern.mask);
    playSound("editorPaint", { brush: pattern.type });
  }

  function editAtEditorCursor(fullTile) {
    const cursor = game.editorCursor;
    if (cursor.qc < 0 || cursor.qr < 0) return;
    if (fullTile) {
      paintEditorCell(Math.floor(cursor.qc / 2), Math.floor(cursor.qr / 2));
    } else {
      paintEditorQuadrant(cursor.qc, cursor.qr);
    }
  }

  function paintEditorCell(c, r) {
    if (!game.editorGrid || c < 0 || c >= GRID || r < 0 || r >= GRID) return;
    setTile(game.editorGrid, c, r, game.editorBrush, 15);
    playSound("editorPaint", { brush: game.editorBrush });
  }

  function paintEditorQuadrant(qc, qr) {
    if (!game.editorGrid || qc < 0 || qc >= QUAD_GRID || qr < 0 || qr >= QUAD_GRID) return;
    setEditorQuadrant(game.editorGrid, qc, qr, game.editorBrush);
    playSound("editorPaintSubtile", { brush: game.editorBrush });
  }

  function selectEditorBrush(type) {
    if (!EDITOR_TILE_TYPES.includes(type)) return;
    game.editorBrush = type;
    showEditorMessage(tileTypeName(type).toUpperCase().slice(0, 6));
    playSound("editorBrush", { brush: type });
  }

  function selectEditorBrushFromPanel(x, y) {
    const type = editorBrushAt(x, y, PANEL_X + 12, 176);
    if (type !== null) selectEditorBrush(type);
  }

  function cycleEditorCell(c, r) {
    if (!game.editorGrid || c < 0 || c >= GRID || r < 0 || r >= GRID) return;
    const current = game.editorGrid[r][c].type;
    const nextType = nextEditorTileType(current);
    setTile(game.editorGrid, c, r, nextType, 15);
    playSound("editorPaint", { brush: nextType });
  }

  function cycleEditorQuadrant(qc, qr) {
    if (!game.editorGrid || qc < 0 || qc >= QUAD_GRID || qr < 0 || qr >= QUAD_GRID) return;
    const c = Math.floor(qc / 2);
    const r = Math.floor(qr / 2);
    const q = (qr % 2) * 2 + (qc % 2);
    const cell = game.editorGrid[r][c];
    const current = quadrantType(cell, q);
    const nextType = nextEditorTileType(current);
    setEditorQuadrant(game.editorGrid, qc, qr, nextType);
    playSound("editorPaintSubtile", { brush: nextType });
  }

  function updateEditorControls() {
    game.editorTick += 1;
    const direction = heldEditorDirection(keys);
    if (!direction) {
      game.editorMoveHoldTimer = 0;
      return;
    }
    game.editorPatternArmed = false;
    game.editorMoveHoldTimer += 1;
    if (game.editorMoveHoldTimer < 20) return;
    game.editorMoveHoldTimer = 15;
    moveEditorCursor(direction.dx, direction.dy);
    if (originalEditorButtonHeld(keys)) pasteOriginalEditorPattern();
  }

  function stageSelectAHeld(input) {
    return input.has("Space") || input.has("KeyZ");
  }

  function stageSelectBHeld(input) {
    return input.has("KeyF") || input.has("KeyX");
  }

  function updateStageSelectControls() {
    const aPressed = stageSelectAHeld(pendingStageSelectPresses);
    const bPressed = stageSelectBHeld(pendingStageSelectPresses);
    pendingStageSelectPresses.clear();
    const repeatFrame = (game.frameLow & 0x07) === 0;
    if (aPressed || (repeatFrame && stageSelectAHeld(keys))) {
      changeStageSelection(1);
      return;
    }
    if (bPressed || (repeatFrame && stageSelectBHeld(keys))) changeStageSelection(-1);
  }

  function update() {
    advanceFrameCounters();
    if (game.editorMessageTimer > 0) game.editorMessageTimer -= 1;
    updateStageStartAudio();
    updateBonusLifeAudio();
    updatePowerUpPickupAudio();
    updatePowerUpAppearAudio();
    updateBrickHitAudio();
    updateBaseHitAudio();
    updateSteelHitAudio();
    updateEnemyHitAudio();
    updateEnemyDestroyAudio();
    updatePlayerDestroyAudio();
    updatePlayerShootAudio();
    updateMovementIceAudio();
    updatePauseAudio();
    updateScoreCountAudio();
    updateStageBonusAudio();
    updateGameOverAudio();
    updateHighScoreAudio();

    if (game.screen === "title") {
      updateTitleIdle();
      return;
    }

    if (game.screen === "hiddenMessage") {
      updateHiddenMessage();
      return;
    }

    if (game.screen === "highScore") {
      updateHighScoreScreen();
      return;
    }

    if (game.screen === "fullGameOver") {
      updateFullGameOverScreen();
      return;
    }

    if (game.screen === "stageSelectClosing") {
      game.transitionTimer -= 1;
      if (game.transitionTimer <= 0) game.screen = "stageSelect";
      return;
    }

    if (game.screen === "stageSelect") {
      updateStageSelectControls();
      return;
    }

    if (game.screen === "stageClearClosing") {
      game.transitionTimer -= 1;
      if (game.transitionTimer <= 0) finishStageClearClosing();
      return;
    }

    if (game.screen === "stageIntro") {
      game.transitionTimer -= 1;
      if (game.transitionTimer <= 0) {
        game.screen = "playing";
        resetFrameCounterHigh();
        syncMovementAudio();
      }
      return;
    }

    if (game.screen === "stageClear") {
      const previousVisibleKills = stageResultVisibleKillCount(stageClearPresentation());
      game.stageClearElapsed += 1;
      const presentation = stageClearPresentation();
      if (stageResultVisibleKillCount(presentation) > previousVisibleKills) playSound("scoreCount");
      if (
        game.stageResultReason === "clear" &&
        !game.stageClearBonusAwarded &&
        game.stageClearElapsed >= presentation.bonusRevealFrame
      ) {
        awardPendingStageClearBonus();
      }
      game.transitionTimer -= 1;
      updateExplosions();
      updateScorePopups();
      if (game.transitionTimer <= 0) finishStageResult();
      return;
    }

    if (game.screen === "gameOver") {
      if (game.gameOverTimer <= 0) {
        finishGameOverScreen();
        return;
      }
      updateBattle({ playerInputEnabled: false, checkEnding: false });
      game.gameOverTimer -= 1;
      return;
    }

    if (game.screen === "editor") {
      updateEditorControls();
      return;
    }

    if (game.screen !== "playing") return;
    if (game.paused) {
      game.pauseElapsed += 1;
      updateScorePopups();
      checkEndState();
      syncMovementAudio();
      return;
    }

    updateBattle();
  }

  function advanceFrameCounters() {
    applyFrameCounter(advanceFrameCounter(game));
  }

  function resetFrameCounterLow() {
    applyFrameCounter(resetFrameCounter(game, true, false));
  }

  function resetFrameCounterHigh() {
    applyFrameCounter(resetFrameCounter(game, false, true));
  }

  function resetFrameCounters() {
    applyFrameCounter(resetFrameCounter(game));
  }

  function applyFrameCounter(counter) {
    game.frameLow = counter.frameLow;
    game.frameHigh = counter.frameHigh;
  }

  /**
   * Advances one active battle frame. Post-game field frames use the same
   * simulation with controller input cleared and end detection disabled.
   * @param {{playerInputEnabled?: boolean, checkEnding?: boolean}} [options]
   */
  function updateBattle(options) {
    const opts = options || {};
    const playerInputEnabled = opts.playerInputEnabled !== false && game.baseDestroyTimer <= 0;
    const checkEnding = opts.checkEnding !== false;
    game.tick += 1;
    updateFreezeTimer();

    updatePlayers(playerInputEnabled);
    updateEnemies();
    updateShovelTimer();
    updatePlayerInvulnerabilityTimers();
    updateExplosions();
    updateBaseDestructionTimer();
    updateBullets();
    updateScorePopups();
    updatePowerUp();
    updatePlayerGameOverMessage();
    if (shouldSpawnEnemies()) spawnEnemies();
    if (checkEnding) checkEndState();
    syncMovementAudio();
  }

  function isGlobalTimerTick(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 63) === 0;
  }

  function updateFreezeTimer() {
    if (game.freezeTimer > 0 && isGlobalTimerTick(game.frameLow)) game.freezeTimer -= 1;
  }

  function updateShovelTimer() {
    if (game.shovelTimer <= 0 || (game.frameLow & 15) !== 0) return;
    if (isGlobalTimerTick(game.frameLow)) {
      game.shovelTimer -= 1;
      if (game.shovelTimer <= 0) {
        buildBaseWall(game.grid, BRICK);
        return;
      }
    }
    if (game.shovelTimer < gameSettings().powerUpDurations.shovelFlash) {
      buildBaseWall(game.grid, shovelWallTypeForTimer(
        game.shovelTimer,
        game.frameLow,
        gameSettings().powerUpDurations.shovelFlash
      ));
    }
  }

  function updatePlayerInvulnerabilityTimers() {
    if (!isGlobalTimerTick(game.frameLow)) return;
    for (const player of game.players) {
      if (player.invuln > 0) player.invuln -= 1;
    }
  }

  function tileTypeName(type) {
    if (type === BRICK) return "brick";
    if (type === STEEL) return "steel";
    if (type === WATER) return "water";
    if (type === FOREST) return "forest";
    if (type === ICE) return "ice";
    return "empty";
  }

  function updatePlayers(inputEnabled) {
    if (game.demoMode) {
      updateDemoPlayers();
      return;
    }
    const controlsEnabled = inputEnabled !== false;
    const firePresses = controlsEnabled ? new Set(pendingFirePresses) : new Set();
    const movementFrame = isPlayerMovementFrame(game.frameLow);
    pendingFirePresses.clear();
    for (const player of game.players) {
      const control = getPlayerControl(player.id);
      const firePressed = controlsEnabled && hasControlKey(control.fire, firePresses);
      if (player.respawn > 0) {
        if (advancePlayerDestructionState(player, movementFrame)) finishPlayerDeath(player);
        continue;
      }
      if (!player.alive) continue;

      if (player.reload > 0) player.reload -= 1;
      if (player.spawnFlash > 0) {
        player.spawnFlash -= 1;
        if (player.spawnFlash === 0) player.invuln = gameSettings().timings.playerInvulnerability;
        continue;
      }
      if (movementFrame) {
        if (player.stun > 0) {
          player.stun -= 1;
          updatePlayerMovement(player, -1, true);
        } else {
          let desiredDir = -1;
          if (controlsEnabled && hasControlKey(control.up)) desiredDir = UP;
          else if (controlsEnabled && hasControlKey(control.right)) desiredDir = RIGHT;
          else if (controlsEnabled && hasControlKey(control.down)) desiredDir = DOWN;
          else if (controlsEnabled && hasControlKey(control.left)) desiredDir = LEFT;
          updatePlayerMovement(player, desiredDir);
        }
      }

      if (firePressed) shoot(player);
    }
  }

  function updateDemoPlayers() {
    pendingFirePresses.clear();
    for (const player of game.players) {
      const movementFrame = isPlayerMovementFrame(game.frameLow);
      if (player.respawn > 0) {
        if (advancePlayerDestructionState(player, movementFrame)) finishPlayerDeath(player);
        continue;
      }
      if (!player.alive) continue;
      if (player.reload > 0) player.reload -= 1;
      if (player.spawnFlash > 0) {
        player.spawnFlash -= 1;
        if (player.spawnFlash === 0) player.invuln = gameSettings().timings.playerInvulnerability;
        continue;
      }

      const control = demoControlForPlayer(player);
      if (movementFrame) {
        if (player.stun > 0) {
          player.stun -= 1;
          updatePlayerMovement(player, -1, true);
        } else {
          updatePlayerMovement(player, control.direction);
        }
      }
      if (control.fire) shoot(player);
    }
  }

  function demoControlForPlayer(player) {
    const target = demoTargetForPlayer(player);
    if (!target) return { direction: -1, fire: false, targetKind: "none", targetId: null };
    const horizontalFirst = ((((player.id - 1) << 1) ^ game.frameHigh) & 2) !== 0;
    return {
      direction: directionTowardTarget(player, target, horizontalFirst),
      fire: player.y < FIELD_H - 32,
      targetKind: target.kind,
      targetId: target.id === undefined ? null : target.id
    };
  }

  function demoTargetForPlayer(player) {
    if (game.powerUp) {
      return {
        kind: "powerUp",
        id: game.powerUp.type,
        x: game.powerUp.x + game.powerUp.w / 2,
        y: game.powerUp.y + game.powerUp.h / 2
      };
    }
    const slotOrder = player.id === 2 ? [3, 5, 4] : [2, 4, 3];
    for (const slotIndex of slotOrder) {
      const enemy = game.enemies.find((candidate) =>
        candidate.alive && !candidate.destroying && candidate.spawnFlash <= 0 && candidate.slotIndex === slotIndex
      );
      if (enemy) {
        return {
          kind: "enemy",
          id: enemy.id,
          x: enemy.x + enemy.w / 2,
          y: enemy.y + enemy.h / 2
        };
      }
    }
    return null;
  }

  function isPlayerMovementFrame(tick) {
    const cadence = gameSettings().playerMovement.frameCadence || DEFAULT_PLAYER_MOVEMENT.frameCadence;
    const frame = Math.max(0, Math.floor(Number(tick) || 0));
    return cadence[frame % cadence.length];
  }

  function updatePlayerMovement(player, desiredDir, stunned) {
    if (player.stun > 0 && !stunned) return;
    const onIce = isTankOnIce(player);
    const inputDir = stunned || (onIce && (player.slide & 16) !== 0) ? -1 : desiredDir;
    if (inputDir !== -1) {
      if (onIce && (player.slide & 31) === 0) {
        player.slide = gameSettings().playerMovement.iceSlideFrames;
        playSound("movementIce");
      }
      if (player.dir !== inputDir) {
        player.pendingSnap = isPerpendicularTurn(player.dir, inputDir);
        player.dir = inputDir;
      }
      if (player.pendingSnap) {
        snapForDirection(player);
        player.pendingSnap = false;
      }
      moveTank(player, DIR_X[player.dir] * player.speed, DIR_Y[player.dir] * player.speed);
      advanceTankTracks(player);
    } else if (player.slide > 0 && onIce) {
      player.slide -= 1;
      moveTank(
        player,
        DIR_X[player.dir] * gameSettings().playerMovement.iceSlideSpeed,
        DIR_Y[player.dir] * gameSettings().playerMovement.iceSlideSpeed
      );
      advanceTankTracks(player);
    }
  }

  function getPlayerControl(id) {
    if (id === 1) {
      const control = { up: "ArrowUp", right: "ArrowRight", down: "ArrowDown", left: "ArrowLeft", fire: "Space" };
      if (game.playerCount < 2) {
        control.up = ["ArrowUp", "KeyW"];
        control.right = ["ArrowRight", "KeyD"];
        control.down = ["ArrowDown", "KeyS"];
        control.left = ["ArrowLeft", "KeyA"];
      }
      return control;
    }
    return { up: "KeyW", right: "KeyD", down: "KeyS", left: "KeyA", fire: "KeyF" };
  }

  function hasControlKey(binding, source) {
    const pressed = source || keys;
    if (Array.isArray(binding)) return binding.some((key) => pressed.has(key));
    return pressed.has(binding);
  }

  function updateEnemies() {
    const enemyTimeFrozen = isEnemyTimeFrozen();

    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      if (enemy.destroying) {
        updateEnemyDestruction(enemy);
        continue;
      }
      if (enemy.spawnFlash > 0) {
        enemy.spawnFlash -= 1;
        continue;
      }
      if (enemyTimeFrozen) continue;
      if (enemy.reload > 0) enemy.reload -= 1;
      updateEnemyMovement(enemy);
      if (enemy.reload <= 0 && shouldEnemyFire(enemy)) shoot(enemy);
    }
  }

  function isEnemyTimeFrozen() {
    return game.freezeTimer > 0 && gameSettings().timerFreezesEnemyTime;
  }

  /** Advances the original $73 enemy explosion timer on that tank's movement cadence. */
  function updateEnemyDestruction(enemy) {
    const released = advanceEnemyDestructionState(
      enemy,
      isEnemyMovementFrame(enemy, game.frameLow),
      explosionRule("enemyDestroy").ttl
    );
    if (released) game.enemyKilled += 1;
  }

  function shouldSpawnEnemies() {
    return true;
  }

  function updateEnemyMovement(enemy, random) {
    const nextRandom = typeof random === "function" ? random : undefined;
    if (!isEnemyMovementFrame(enemy, game.frameLow)) return;

    if (recoverEnemyTankOverlap(enemy)) return;

    if (enemy.blockedPauseTicks > 0) {
      enemy.blockedPauseTicks -= 1;
      return;
    }

    if (enemy.pendingTurn) {
      enemy.pendingTurn = false;
      if ((randomByte(nextRandom) & 1) === 0) {
        chooseEnemyDirectionByPhase(enemy, nextRandom);
      } else {
        enemy.dir = (enemy.dir + ((randomByte(nextRandom) & 1) === 0 ? 3 : 1)) & 3;
      }
      return;
    }

    const ai = gameSettings().enemyAi;
    if (isEnemyAtTurnIntersection(enemy) && aiRoll(ai.intersectionTurnChance, nextRandom)) {
      chooseEnemyDirectionByPhase(enemy, nextRandom);
      return;
    }

    const distance = enemy.alternateMovement ? 1 : enemy.speed;
    const moved = moveTank(enemy, DIR_X[enemy.dir] * distance, DIR_Y[enemy.dir] * distance);
    advanceTankTracks(enemy);
    if (moved) return;

    if (aiRoll(ai.blockedRetryChance, nextRandom)) {
      enemy.blockedPauseTicks = ai.blockedRetryTicks;
      return;
    }

    if (isEnemyAtTurnIntersection(enemy)) enemy.pendingTurn = true;
    enemy.dir ^= 2;
  }

  /**
   * Moves an enemy out of an invalid tank overlap before normal blocked-state
   * handling can keep both tanks trapped inside each other's collision boxes.
   */
  function recoverEnemyTankOverlap(enemy) {
    const currentRect = entityRect(enemy);
    const currentArea = totalTankOverlapArea(enemy, currentRect);
    if (currentArea <= 0) return false;

    const distance = enemy.alternateMovement ? 1 : Math.max(1, Number(enemy.speed) || 1);
    const directions = [enemy.dir, enemy.dir ^ 2, (enemy.dir + 1) & 3, (enemy.dir + 3) & 3];
    let best = null;
    for (const dir of directions) {
      const x = enemy.x + DIR_X[dir] * distance;
      const y = enemy.y + DIR_Y[dir] * distance;
      if (!canTankOccupy(enemy, x, y)) continue;
      const area = totalTankOverlapArea(enemy, { x, y, w: enemy.w, h: enemy.h });
      if (area >= currentArea || (best && area >= best.area)) continue;
      best = { x, y, dir, area };
    }
    if (!best) return false;

    enemy.x = best.x;
    enemy.y = best.y;
    enemy.dir = best.dir;
    enemy.blockedPauseTicks = 0;
    enemy.pendingTurn = false;
    advanceTankTracks(enemy);
    return true;
  }

  function chooseEnemyDirectionByPhase(enemy, random) {
    const nextRandom = typeof random === "function" ? random : undefined;
    const phase = enemyAiPhase(game.stage, game.frameHigh);
    if (phase === "random") {
      enemy.dir = randomByte(nextRandom) & 3;
      return phase;
    }

    let target = { x: game.base.x + game.base.w / 2, y: game.base.y + game.base.h / 2 };
    if (phase === "player") {
      const player = selectEnemyTargetPlayer(enemy, game.players);
      if (player) target = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    }
    const horizontalFirst = aiRoll(gameSettings().enemyAi.horizontalFirstChance, nextRandom);
    enemy.dir = directionTowardTarget(enemy, target, horizontalFirst);
    return phase;
  }

  function enemyAiPhase(stage, frameHigh) {
    const interval = scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(stage), game.playerCount);
    return enemyAiPhaseForInterval(interval, frameHigh);
  }

  function shouldEnemyFire(enemy) {
    return shouldEnemyFireForByte(enemy.fireChance, ENEMY_FIRE_CHANCE, randomByte());
  }

  function aiRoll(chance, random) {
    return enemyAiChanceMatches(chance, randomByte(random));
  }

  function randomByte(random) {
    if (typeof random === "function") return Math.floor(random() * 256) & 0xff;
    return nextBattleRandomByte();
  }

  function nextBattleRandomByte() {
    const nextIndex = (game.randomIndex + 1) & 0xff;
    const next = advanceBattleRandom(
      game.randomValue,
      game.randomIndex,
      game.frameHigh,
      battleRandomZeroPageByte(nextIndex, game.randomValue)
    );
    game.randomValue = next.value;
    game.randomIndex = next.index;
    return next.value;
  }

  function resetBattleRandom() {
    game.randomValue = 0;
    game.randomIndex = 0;
  }

  /**
   * Projects the live browser battle into the zero-page addresses sampled by D44D.
   * Unmodelled scratch bytes retain the cold-start value used by the original RAM clear.
   */
  function battleRandomZeroPageByte(index, previousRandomValue) {
    const address = Math.floor(Number(index) || 0) & 0xff;
    if (address === 0x0a) return game.frameHigh;
    if (address === 0x0b) return game.frameLow;
    if (address === 0x0f) return previousRandomValue;
    if (address === 0x10) return address;
    if (address === 0x6a) return currentEnemySpawnPositionIndex();
    if (address === 0x7f) return Math.max(0, enemyTotal() - game.enemySpawned);
    if (address === 0x82) return game.nextSpawn;
    if (address === 0x84) {
      return scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(game.stage), game.playerCount);
    }
    if (address >= 0x90 && address <= 0x97) {
      return tankRandomMemoryByte(address - 0x90, "x");
    }
    if (address >= 0x98 && address <= 0x9f) {
      return tankRandomMemoryByte(address - 0x98, "y");
    }
    if (address >= 0xa8 && address <= 0xaf) {
      return tankRandomTypeByte(address - 0xa8);
    }
    return 0;
  }

  function currentEnemySpawnPositionIndex() {
    if (game.enemySpawned <= 0) return 0;
    const spec = getEnemySpec(game.stage, game.enemySpawned - 1);
    return spec.spawnIndex === undefined ? game.enemySpawned % 3 : spec.spawnIndex;
  }

  function tankForOriginalSlot(slotIndex) {
    if (slotIndex < 2) return game.players.find((player) => player.id === slotIndex + 1) || null;
    return game.enemies.find((enemy) => enemy.alive && enemy.slotIndex === slotIndex) || null;
  }

  function tankRandomMemoryByte(slotIndex, axis) {
    const tank = tankForOriginalSlot(slotIndex);
    if (!tank) return 0;
    const fieldOffset = axis === "x" ? FIELD_X : FIELD_Y;
    return (Math.round(Number(tank[axis]) || 0) + fieldOffset) & 0xff;
  }

  function tankRandomTypeByte(slotIndex) {
    const tank = tankForOriginalSlot(slotIndex);
    if (!tank) return 0;
    if (tank.kind === "player") return ((tank.level & 3) << 4) | (tank.dir & 3);
    return 0x80 | ((tank.typeIndex & 3) << 5) | (tank.carrier ? 0x04 : 0) | (tank.dir & 3);
  }

  function updateBullets() {
    for (const bullet of game.bullets) bullet.remove = false;

    for (const bullet of game.bullets) {
      if (bullet.remove) continue;
      const steps = Math.max(1, Math.ceil(bullet.speed));
      for (let i = 0; i < steps && !bullet.remove; i += 1) {
        bullet.x += (DIR_X[bullet.dir] * bullet.speed) / steps;
        bullet.y += (DIR_Y[bullet.dir] * bullet.speed) / steps;
        resolveBullet(bullet);
      }
    }

    resolveBulletCollisions(game.bullets);
    game.bullets = game.bullets.filter((bullet) => !bullet.remove);
  }

  function resolveBullet(bullet) {
    const padding = gameSettings().projectileRules.boundsPadding;
    if (projectileOutsideField(bullet, FIELD_W, FIELD_H, padding)) {
      const impact = projectileBoundaryImpactPoint(bullet, FIELD_W, FIELD_H);
      bullet.remove = true;
      addRuleExplosion("steelBlocked", impact.x, impact.y);
      const sound = wallHitSoundName(bullet, true, false);
      if (sound) playSound(sound);
      return;
    }

    if (hitTerrain(bullet)) return;
    if (hitBase(bullet)) return;
    hitTank(bullet);
  }

  function hitBase(bullet) {
    if (!game.base.alive) return false;
    if (!rectsOverlap(entityRect(bullet), game.base)) return false;
    game.base.alive = false;
    game.baseDestroyTimer = game.demoMode ? 0 : baseDestructionDuration();
    bullet.remove = true;
    playSound("baseHit");
    playSound("playerDestroy");
    return true;
  }

  function hitTerrain(bullet) {
    const rect = entityRect(bullet);
    const c0 = clamp(Math.floor(rect.x / TILE), 0, GRID - 1);
    const r0 = clamp(Math.floor(rect.y / TILE), 0, GRID - 1);
    const c1 = clamp(Math.floor((rect.x + rect.w - 1) / TILE), 0, GRID - 1);
    const r1 = clamp(Math.floor((rect.y + rect.h - 1) / TILE), 0, GRID - 1);

    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        const cell = game.grid[r][c];
        if ((cell.type !== BRICK && cell.type !== STEEL) || cell.mask === 0) continue;
        const hitMask = cell.type === BRICK
          ? overlappedBrickFragments(rect, c, r, cell)
          : overlappedQuarters(rect, c, r, cell.mask);
        if (!hitMask) continue;
        const wasSteel = cell.type === STEEL;
        let damaged = false;
        if (cell.type === BRICK || bullet.power >= 3) {
          damaged = damageWall(cell, c, r, bullet, hitMask);
          addRuleExplosion(damaged ? (wasSteel ? "steelHit" : "brickHit") : "steelBlocked", bullet.x, bullet.y);
        } else {
          addRuleExplosion("steelBlocked", bullet.x, bullet.y);
        }
        bullet.remove = true;
        const sound = wallHitSoundName(bullet, wasSteel, damaged);
        if (sound) playSound(sound);
        return true;
      }
    }
    return false;
  }

  function hitTank(bullet) {
    if (bullet.ownerKind === "player") {
      for (const enemy of game.enemies) {
        if (!enemy.alive || enemy.destroying || enemy.spawnFlash > 0) continue;
        if (bulletHitsTankByCenter(bullet, enemy)) {
          const wasCarrier = enemy.carrier;
          enemy.hp -= 1;
          bullet.remove = true;
          addRuleExplosion("enemyHit", bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
          playSound(enemy.hp <= 0 ? "enemyDestroy" : "enemyHit");
          if (shouldReleaseCarrierPowerUp(
            wasCarrier,
            enemy.hp <= 0,
            gameSettings().powerUpRules.carrierRelease
          )) releaseCarrierPowerUp(enemy);
          if (enemy.hp <= 0) destroyEnemy(enemy, bullet.ownerId);
          return true;
        }
      }

      for (const player of game.players) {
        if (!player.alive || player.id === bullet.ownerId || player.spawnFlash > 0) continue;
        if (bulletHitsTankByCenter(bullet, player)) {
          if (player.invuln > 0) {
            bullet.remove = true;
            return true;
          }
          if (gameSettings().friendlyFire.enabled && player.stun <= 0) player.stun = gameSettings().friendlyFire.stunFrames;
          bullet.remove = true;
          addRuleExplosion("playerStun", bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
          return true;
        }
      }
    } else {
      for (const player of game.players) {
        if (!player.alive || player.spawnFlash > 0) continue;
        if (bulletHitsTankByCenter(bullet, player)) {
          if (player.invuln > 0) {
            bullet.remove = true;
            return true;
          }
          bullet.remove = true;
          addRuleExplosion(
            "steelBlocked",
            bullet.x + bullet.w / 2,
            bullet.y + bullet.h / 2
          );
          killPlayer(player);
          return true;
        }
      }
    }
    return false;
  }

  function destroyEnemy(enemy, ownerId, options) {
    if (!enemy.alive || enemy.destroying) return;
    const opts = options || {};
    const awardScore = !game.demoMode && opts.awardScore !== false;
    const trackKill = !game.demoMode && opts.trackKill !== false;
    enemy.destroying = true;
    enemy.destroyTicks = 0;
    enemy.destroyExplosionTicks = explosionRule("enemyDestroy").ttl;
    enemy.destroyShowScore = opts.showScore !== false;
    const player = game.players.find((candidate) => candidate.id === ownerId);
    if (player) {
      if (awardScore) {
        addPlayerScore(player, enemy.score);
        player.stagePoints += enemy.score;
      }
      if (trackKill) {
        player.stageKills[enemy.typeIndex] = (player.stageKills[enemy.typeIndex] || 0) + 1;
        player.totalKills[enemy.typeIndex] = (player.totalKills[enemy.typeIndex] || 0) + 1;
      }
    }
  }

  function addPlayerScore(player, points) {
    const { previousScore, nextScore } = addScorePoints(player, points);
    updateHighScore(nextScore);
    const awarded = awardBonusLives(player, previousScore, nextScore, gameSettings().bonusLifeScores);
    for (let index = 0; index < awarded; index += 1) playSound("bonusLife");
  }

  function killPlayer(player) {
    const started = beginPlayerDestructionState(player, {
      deathPowerLevel: gameSettings().deathPowerLevel,
      explosionTicks: explosionRule("playerDestroy").ttl,
      respawnTicks: gameSettings().timings.playerRespawn
    });
    if (!started) return;
    playSound("playerDestroy");
    if (player.respawn === 0) finishPlayerDeath(player);
  }

  function finishPlayerDeath(player) {
    const outcome = resolvePlayerDeathState(player);
    if (!outcome.eliminated) {
      resetPlayerPosition(player);
      return;
    }
    startPlayerGameOverMessage(player);
  }

  function startPlayerGameOverMessage(player) {
    if (game.demoMode || game.screen !== "playing") return;
    if (!game.players.some((candidate) => candidate.id !== player.id && candidate.lives > 0)) return;
    const isPlayerTwo = player.id === 2;
    game.playerGameOverMessage = {
      playerId: player.id,
      timer: PLAYER_GAME_OVER_MESSAGE_TIMER,
      x: isPlayerTwo ? 0xc0 : 0x20,
      y: PLAYER_GAME_OVER_MESSAGE_Y,
      dx: isPlayerTwo ? -1 : 1
    };
    resetFrameCounterLow();
  }

  function playerGameOverMessageActive() {
    return Boolean(game.playerGameOverMessage && game.playerGameOverMessage.timer > 0);
  }

  function updatePlayerGameOverMessage() {
    const message = game.playerGameOverMessage;
    if (!message || message.timer <= 0 || game.demoMode) return;
    if ((game.frameLow & 0x0f) === 0) {
      message.timer -= 1;
      if (message.timer <= 0) {
        message.timer = 0;
        message.y = PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y;
        return;
      }
    }
    if (message.timer >= PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD) message.x += message.dx;
  }

  function releaseCarrierPowerUp(enemy) {
    enemy.carrier = false;
    spawnPowerUp(enemy.powerUpType);
  }

  function clearPowerUpForCarrierSpawn(carrier) {
    if (!shouldClearPowerUpForCarrierSpawn(
      carrier,
      gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn
    )) return false;
    game.powerUp = null;
    return true;
  }

  function spawnPowerUp(forcedType) {
    const settings = stageSettings();
    const spot = pickPowerUpSpawnSpot(settings ? settings.powerUpSpawns : DEFAULT_POWERUP_SPAWNS);
    if (!spot) return false;
    const type = forcedType && powerTypes.includes(forcedType)
      ? forcedType
      : randomPowerUpType();
    game.powerUp = createPowerUpState({
      type,
      position: spot,
      ttl: gameSettings().timings.powerUpTtl
    });
    playSound("powerUpAppear");
    return true;
  }

  function randomPowerUpType(random) {
    return powerUpTypeForRandomByte(randomByte(random));
  }

  function pickPowerUpSpawnSpot(spots, random) {
    const source = powerUpSpawnCandidates(spots);
    if (!source.length) return null;
    const positionSample = (randomByte(random) << 8) | randomByte(random);
    const picked = selectPowerUpSpawnSpot(source, positionSample, game.lastPowerUpSpawn);
    game.lastPowerUpSpawn = powerUpSpawnKey(picked);
    return picked;
  }

  function resetPowerUpSpawnBag() {
    game.powerUpSpawnBag = [];
    game.powerUpSpawnBagKey = "";
  }

  function powerUpSpawnCandidates(spots) {
    const openSpots = dedupePowerUpSpots(spots.filter(canPowerUpSpawnAt));
    if (openSpots.length > 1) return openSpots;
    return dedupePowerUpSpots(openSpots.concat(fallbackPowerUpSpawnSpots()));
  }

  function fallbackPowerUpSpawnSpots() {
    const spots = [];
    for (let r = 0; r < GRID; r += 1) {
      for (let c = 0; c < GRID; c += 1) {
        const spot = { x: c * TILE + 2, y: r * TILE + 2 };
        if (canPowerUpSpawnAt(spot)) spots.push(spot);
      }
    }
    return spots;
  }

  function canPowerUpSpawnAt(point) {
    const powerRect = { x: point.x, y: point.y, w: POWERUP_SIZE, h: POWERUP_SIZE };
    if (powerRect.x < 0 || powerRect.y < 0 || powerRect.x + powerRect.w > FIELD_W || powerRect.y + powerRect.h > FIELD_H) return false;
    if (game.base.alive && rectsOverlap(powerRect, game.base)) return false;
    if (rectHitsSolidTerrain(powerRect)) return false;
    return canTankOccupy({ w: 14, h: 14 }, point.x - 1, point.y - 1);
  }

  function updatePowerUp() {
    if (!game.powerUp) return;
    game.powerUp = advancePowerUpState(game.powerUp);
    if (!game.powerUp) return;
    const player = findPowerUpCollector(game.players, game.powerUp);
    if (player) collectPowerUp(player, game.powerUp);
  }

  function collectPowerUp(player, power) {
    const powerType = power.type;
    game.powerUp = null;
    applyPowerUp(player, powerType, {
      popupX: power.x + power.w / 2,
      popupY: power.y + power.h / 2
    });
    game.powerUp = null;
    if (!game.demoMode) playSound("powerUp");
  }

  function applyPowerUp(player, type, options) {
    const opts = options || {};
    const pickupScore = gameSettings().powerUpRules.pickupScore;
    if (!game.demoMode) {
      addPlayerScore(player, pickupScore);
      addScorePopup(
        pickupScore,
        Number.isFinite(opts.popupX) ? opts.popupX : player.x + player.w / 2,
        Number.isFinite(opts.popupY) ? opts.popupY : player.y + player.h / 2,
        { style: "powerUp", ttl: 49 }
      );
    }
    const effect = applyPowerUpStateEffect(player, game, type, {
      baseAlive: game.base.alive,
      durations: gameSettings().powerUpDurations,
      maxPlayerLevel: gameSettings().playerUpgradeRules.length - 1
    });
    if (effect.soundName) playSound(effect.soundName);
    if (effect.rebuildBaseWall) buildBaseWall(game.grid, STEEL);
    if (effect.destroyActiveEnemies) {
      for (const enemy of game.enemies) {
        if (!enemy.alive || enemy.destroying || enemy.spawnFlash > 0) continue;
        enemy.hp = 0;
        destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false, showScore: false });
      }
    }
  }

  function spawnEnemies() {
    if (game.enemySpawned >= enemyTotal()) return;
    const capacity = maxActiveEnemies();
    if (activeEnemyCount(game.enemies) >= capacity) return;
    if (game.nextSpawn > 0) {
      game.nextSpawn -= 1;
      return;
    }
    const enemySpec = getEnemySpec(game.stage, game.enemySpawned);
    const spawnIndex = selectEnemySpawnIndex(enemySpec, game.enemySpawned);
    const point = enemySpawnPoint(spawnIndex);
    const typeIndex = enemySpec.typeIndex;
    const type = enemyTypeDefinitions()[typeIndex] || enemyTypeDefinitions()[0];
    const carrier = enemySpec.carrier;
    const slotIndex = findAvailableEnemySlot(game.enemies, capacity);
    if (slotIndex === null) return;
    if (isEnemySpawnPointOccupied(point, game.players, game.enemies)) {
      game.nextSpawn = gameSettings().timings.enemySpawnRetry;
      return;
    }
    clearPowerUpForCarrierSpawn(carrier);
    game.enemies.push(createEnemyState({
      id: 100 + game.enemySpawned,
      slotIndex,
      spawn: point,
      direction: DOWN,
      type,
      typeIndex,
      spec: enemySpec,
      settings: gameSettings(),
      normalMoveSpeed: ENEMY_MOVE_SPEED.normal
    }));
    game.enemySpawned += 1;
    game.nextSpawn = enemySpawnDelay(game.stage, game.enemySpawned);
  }

  function enemySpawnDelay(stage, index) {
    if (index >= enemyTotal(stage)) return 0;
    const spec = getEnemySpec(stage, index);
    if (spec && spec.spawnDelay !== null && spec.spawnDelay !== undefined) return spec.spawnDelay;
    const pacing = gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING;
    return scaleEnemySpawnDelayForPlayers(index === 0 ? pacing.firstDelay : defaultEnemySpawnDelay(stage));
  }

  function defaultEnemySpawnDelay(stage) {
    const pacing = gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING;
    const stageValue = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
    return calculateEnemySpawnDelay(pacing, stageValue, stageCycleLimit(), isExtendedLoopStage(stageValue));
  }

  function scaleEnemySpawnDelayForPlayers(delay, players) {
    const pacing = gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING;
    const playerCount = Math.max(1, Math.floor(Number(players) || game.playerCount || 1));
    return scaleEnemySpawnDelay(delay, playerCount, pacing);
  }

  function shoot(tank) {
    if (!tank.alive || tank.destroying || tank.reload > 0 || tank.spawnFlash > 0) return;
    const key = `${tank.kind}:${tank.id}`;
    const upgrade = tank.kind === "player" ? playerUpgradeRule(tank.level) : null;
    const maxBullets = upgrade ? upgrade.maxBullets : 1;
    const active = game.bullets.filter((bullet) => bullet.ownerKey === key).length;
    if (active >= maxBullets) return;

    game.bullets.push(createBullet(tank, key, upgrade));
    tank.reload = upgrade ? upgrade.reload : tank.reloadBase;
    if (tank.kind === "player") playSound("playerShoot");
  }

  function createBullet(tank, key, upgrade) {
    return createProjectileState({
      tank,
      ownerKey: key,
      upgrade,
      rules: gameSettings().projectileRules
    });
  }

  function playerUpgradeRule(level) {
    const rules = gameSettings().playerUpgradeRules || defaultPlayerUpgradeRules;
    return rules[clamp(Math.floor(level || 0), 0, rules.length - 1)];
  }

  function moveTank(tank, dx, dy) {
    const nx = tank.x + dx;
    const ny = tank.y + dy;
    if (!canTankOccupy(tank, nx, ny)) return false;
    tank.x = nx;
    tank.y = ny;
    return true;
  }

  function advanceTankTracks(tank) {
    tank.trackPhase = ((Math.floor(Number(tank.trackPhase) || 0) & 1) ^ 1);
  }

  function canTankOccupy(tank, x, y) {
    return canTankOccupyRect(entityRect(tank), entityRect(tank, x, y), {
      fieldWidth: FIELD_W,
      fieldHeight: FIELD_H,
      base: game.base,
      baseAlive: game.base.alive,
      terrainOverlapArea: solidTerrainOverlapArea,
      peers: activeTankCollisionPeers(tank)
    });
  }

  function activeTankCollisionPeers(tank) {
    return filterActiveTankCollisionPeers(tank, game.players.concat(game.enemies));
  }

  function totalTankOverlapArea(tank, rect) {
    return totalRectOverlapArea(rect, activeTankCollisionPeers(tank));
  }

  function rectHitsSolidTerrain(rect) {
    return gridRectHitsSolidTerrain(rect, game.grid);
  }

  function solidTerrainOverlapArea(rect) {
    return gridSolidTerrainOverlapArea(rect, game.grid);
  }

  function isTankOnIce(tank) {
    const cx = clamp(Math.floor((tank.x + tank.w / 2) / TILE), 0, GRID - 1);
    const cy = clamp(Math.floor((tank.y + tank.h / 2) / TILE), 0, GRID - 1);
    return game.grid[cy][cx].type === ICE;
  }

  function snapForDirection(tank) {
    const x = Math.floor((tank.x + 4) / HALF) * HALF;
    const y = Math.floor((tank.y + 4) / HALF) * HALF;
    if (!canTankOccupy(tank, x, y)) return false;
    tank.x = x;
    tank.y = y;
    return true;
  }

  function isPerpendicularTurn(fromDir, toDir) {
    return fromDir !== toDir && (fromDir ^ 2) !== toDir;
  }

  function addRuleExplosion(ruleName, x, y) {
    const rule = explosionRule(ruleName);
    const style = BULLET_IMPACT_EXPLOSION_RULES.has(ruleName)
      ? "bulletImpact"
      : (isTankDestructionStyle(ruleName) ? ruleName : "default");
    addExplosion(
      x,
      y,
      rule.ttl,
      rule.color,
      rule.coreColor,
      style
    );
  }

  function explosionRule(ruleName) {
    const rules = gameSettings().explosionRules || DEFAULT_EXPLOSION_RULES;
    return rules[ruleName] || DEFAULT_EXPLOSION_RULES[ruleName] || DEFAULT_EXPLOSION_RULES.enemyHit;
  }

  function baseDestructionDuration() {
    return explosionRule("baseDestroy").ttl + BASE_DESTRUCTION_TAIL_FRAMES;
  }

  function addExplosion(x, y, ttl, color, coreColor, style) {
    game.explosions.push(createExplosionState({
      x,
      y,
      ttl,
      color,
      coreColor,
      defaultCoreColor: DEFAULT_EXPLOSION_CORE_COLOR,
      style
    }));
  }

  function updateExplosions() {
    game.explosions = advanceTimedStates(game.explosions);
  }

  /** Runs before bullet collision so a newly hit base retains its full loaded $27 counter for the hit frame. */
  function updateBaseDestructionTimer() {
    if (game.baseDestroyTimer > 0) game.baseDestroyTimer -= 1;
  }

  function addScorePopup(points, x, y, options) {
    const popup = createScorePopupState(points, x, y, {
      ...(options || {}),
      defaultX: FIELD_W / 2,
      defaultY: FIELD_H / 2
    });
    if (popup) game.scorePopups.push(popup);
  }

  function updateScorePopups() {
    game.scorePopups = advanceTimedStates(game.scorePopups);
  }

  function stageEnemiesCleared() {
    return game.enemySpawned >= enemyTotal() && game.enemies.length === 0;
  }

  function checkEndState() {
    game.enemies = game.enemies.filter((enemy) => enemy.alive);
    if (game.demoMode) {
      const demoPlayersDone = game.players.every((player) => !player.alive && player.respawn <= 0 && player.lives <= 0);
      if (!game.base.alive || demoPlayersDone || stageEnemiesCleared()) endTitleDemo();
      return;
    }
    if (!game.base.alive) {
      if (game.baseDestroyTimer > 0) return;
      enterGameOver();
      return;
    }
    const playersDone = game.players.every((player) => !player.alive && player.respawn <= 0 && player.lives <= 0);
    if (playersDone) {
      enterGameOver();
      return;
    }
    if (stageEnemiesCleared()) {
      game.paused = false;
      game.pauseElapsed = 0;
      if (game.clearPendingTimer <= 0) {
        const extendedStageEnd = playerGameOverMessageActive();
        game.clearPendingTimer = Math.max(
          gameSettings().timings.stageClearDelay,
          extendedStageEnd ? PLAYER_GAME_OVER_STAGE_END_DELAY : 0
        );
        game.tick = 0;
        resetFrameCounters();
        if (extendedStageEnd) game.frameHigh = EXTENDED_STAGE_END_FRAME_HIGH;
        if (game.clearPendingTimer > 0) return;
      }
      if (game.clearPendingTimer > 0) {
        game.clearPendingTimer -= 1;
        if (game.clearPendingTimer > 0) return;
      }
      enterStageClear();
    }
  }

  function enterStageClear() {
    enterStageResult("clear");
  }

  /**
   * Starts the shared result count-up while preserving the distinct clear and game-over exits.
   * @param {"clear" | "gameOver"} reason
   */
  function enterStageResult(reason) {
    stopMovementAudio();
    stopStageStartAudio();
    stopBonusLifeAudio();
    stopPowerUpPickupAudio();
    stopPowerUpAppearAudio();
    stopPauseAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopBaseHitAudio();
    stopEnemyDestroyAudio();
    stopPlayerDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    const resultReason = reason === "gameOver" ? "gameOver" : "clear";
    game.clearPendingTimer = 0;
    game.playerGameOverMessage = null;
    game.stageResultReason = resultReason;
    game.stageClearElapsed = 0;
    game.stageClearBonusPlayerIds = resultReason === "clear"
      ? stageClearBonusRecipients(game.players).map((player) => player.id)
      : [];
    game.stageClearBonusAwarded = false;
    game.screen = "stageClear";
    game.transitionTimer = stageResultDuration(game.players);
  }

  function finishStageResult() {
    stopScoreCountAudio();
    stopStageBonusAudio();
    if (game.stageResultReason === "gameOver") {
      const advance = stageAdvanceResult(game.stage);
      if (!game.customGrid && !advance.stops) game.stage = advance.stage;
      startFullGameOverScreen();
      return;
    }
    awardPendingStageClearBonus();
    const advance = stageAdvanceResult(game.stage);
    if (!game.customGrid && advance.stops) {
      game.screen = "title";
      resetTitleIdleTimer();
      return;
    }
    game.constructionStageActive = false;
    game.screen = "stageClearClosing";
    game.transitionTimer = STAGE_CURTAIN_CLOSE_FRAMES;
  }

  function finishStageClearClosing() {
    if (!game.customGrid) game.stage = stageAdvanceResult(game.stage).stage;
    startStage(game.stage);
  }

  function enterGameOver() {
    if (game.demoMode) {
      endTitleDemo();
      return;
    }
    if (game.screen === "gameOver" || game.screen === "fullGameOver") return;
    stopMovementAudio();
    stopStageStartAudio();
    stopBonusLifeAudio();
    stopPowerUpPickupAudio();
    stopPowerUpAppearAudio();
    stopPauseAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopEnemyDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    game.screen = "gameOver";
    game.paused = false;
    game.tick = 0;
    resetFrameCounters();
    game.frameHigh = EXTENDED_STAGE_END_FRAME_HIGH;
    game.baseDestroyTimer = 0;
    game.playerGameOverMessage = null;
    game.newHighScoreAtGameOver = game.players.some((player) => player.score > game.runHighScoreBaseline);
    game.gameOverTimer = gameOverFieldDuration();
  }

  function gameOverFieldDuration() {
    const timings = gameSettings().timings;
    return timings.gameOverSlide + timings.gameOverHold;
  }

  function finishGameOverScreen() {
    enterStageResult("gameOver");
  }

  function startFullGameOverScreen() {
    stopScoreCountAudio();
    stopStageBonusAudio();
    game.screen = "fullGameOver";
    game.paused = false;
    game.fullGameOverElapsed = 0;
    playSound("gameOver");
  }

  function updateFullGameOverScreen() {
    game.fullGameOverElapsed += 1;
    if (game.fullGameOverElapsed < FULL_GAME_OVER_SCREEN_FRAMES) return;
    finishFullGameOverScreen();
  }

  function handleFullGameOverInput(code) {
    if (code !== "Enter" && code !== "Escape") return false;
    finishFullGameOverScreen();
    return true;
  }

  function finishFullGameOverScreen() {
    stopGameOverAudio();
    if (game.newHighScoreAtGameOver) {
      startHighScoreScreen();
      return;
    }
    returnToTitleAfterGame();
  }

  function startHighScoreScreen() {
    game.screen = "highScore";
    game.paused = false;
    game.highScoreScreenElapsed = 0;
    playSound("highScore");
  }

  function updateHighScoreScreen() {
    game.highScoreScreenElapsed += 1;
    if (game.highScoreScreenElapsed < HIGH_SCORE_SCREEN_FRAMES) return;
    returnToTitleAfterGame();
  }

  function returnToTitleAfterGame() {
    stopMovementAudio();
    stopStageStartAudio();
    stopBonusLifeAudio();
    stopPowerUpPickupAudio();
    stopPowerUpAppearAudio();
    stopPauseAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopBaseHitAudio();
    stopEnemyDestroyAudio();
    stopPlayerDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    stopGameOverAudio();
    stopHighScoreAudio();
    game.screen = "title";
    game.paused = false;
    game.newHighScoreAtGameOver = false;
    game.fullGameOverElapsed = 0;
    game.highScoreScreenElapsed = 0;
    game.stageResultReason = "clear";
    game.constructionUsed = false;
    game.constructionVisits = 0;
    game.hiddenInputCount = 0;
    resetTitleIdleTimer();
  }

  function stageAdvanceResult(stage) {
    const current = Math.max(1, Math.floor(Number(stage) || 1));
    const limit = stageCycleLimit();
    if (current < limit) {
      const next = current + 1;
      return {
        stage: next,
        wraps: false,
        stops: false,
        stageCycleLimit: limit,
        mapDataStage: mapDataStage(next),
        enemyDataStage: enemyDataStage(next)
      };
    }
    if (gameSettings().stageAdvance.loopAfterFinalStage) {
      return {
        stage: 1,
        wraps: true,
        stops: false,
        stageCycleLimit: limit,
        mapDataStage: mapDataStage(1),
        enemyDataStage: enemyDataStage(1)
      };
    }
    return {
      stage: current,
      wraps: false,
      stops: true,
      stageCycleLimit: limit,
      mapDataStage: mapDataStage(current),
      enemyDataStage: enemyDataStage(current)
    };
  }

  function awardPendingStageClearBonus() {
    if (game.stageClearBonusAwarded) return;
    game.stageClearBonusAwarded = true;
    const bonus = gameSettings().stageClearBonus;
    let awarded = false;
    for (const player of game.players) {
      if (!game.stageClearBonusPlayerIds.includes(player.id)) continue;
      addPlayerScore(player, bonus.points);
      player.stagePoints += bonus.points;
      awarded = true;
    }
    if (awarded) playSound("stageBonus");
  }

  /**
   * Builds the original result-table timeline, including its final empty count loop per row.
   * @param {Array<object>} players Result participants with per-type stage kill counts.
   * @param {number} elapsed Display frames elapsed since entering the result screen.
   * @returns {object} Visible row values and reveal-frame boundaries for the supplied frame.
   */
  function stageClearPresentation(players, elapsed) {
    const frame = Math.max(0, Math.floor(elapsed === undefined ? game.stageClearElapsed : elapsed));
    return createStageResultPresentation(
      players || game.players,
      enemyTypeDefinitions(),
      frame,
      game.stageClearBonusAwarded
    );
  }

  function stageResultDuration(players) {
    const override = gameSettings().timings.stageClear;
    return override > 0 ? override : stageClearPresentation(players, 0).endFrame;
  }

  function stageClearBonusRecipients(players) {
    return selectStageClearBonusRecipients(players, gameSettings().stageClearBonus);
  }

  function stageClearResultSummary(players) {
    return createStageResultSummary(players, enemyTypeDefinitions());
  }

  function makeStageClearResultProbePlayer(id, kills, bonusPoints) {
    const types = enemyTypeDefinitions();
    const stageKills = types.map((type, index) => {
      if (!Array.isArray(kills)) return 0;
      return Math.max(0, Math.floor(Number(kills[index]) || 0));
    });
    const enemyPoints = stageKills.reduce((sum, count, index) => sum + count * types[index].score, 0);
    return {
      id,
      stageKills,
      stagePoints: enemyPoints + Math.max(0, Math.floor(Number(bonusPoints) || 0))
    };
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    if (game.screen === "title") renderTitle();
    else if (game.screen === "hiddenMessage") renderHiddenMessage();
    else if (game.screen === "highScore") renderHighScore();
    else if (game.screen === "fullGameOver") renderFullGameOver();
    else if (game.screen === "stageSelectClosing") renderStageSelectClosing();
    else if (game.screen === "stageSelect") renderStageSelect();
    else if (game.screen === "editor") renderEditor();
    else if (game.screen === "stageClear") renderStageClear();
    else if (game.screen === "stageClearClosing") renderStageClearClosing();
    else if (game.screen === "stageIntro") renderStageIntro();
    else {
      renderGame();
      if (game.screen === "gameOver") renderGameOver();
      if (game.paused) renderPause();
    }
  }

  function renderTitle() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (const item of titleScoreLayout()) drawText(item.text, item.x, item.y, 1, "#f05a42");
    drawStripedTitleText("TANK", 68, 46, 5);
    drawStripedTitleText("DEFENDER", 56, 86, 3);
    for (let i = 0; i < TITLE_MENU_ITEMS.length; i += 1) {
      const item = TITLE_MENU_ITEMS[i];
      if (i === game.titleMenu) drawTitleMenuCursor(item);
      drawText(item.label, item.x, item.y, 1, item.color);
    }
    drawText("PIXEL LAB", 88, 184, 1, "#f05a42");
    drawText("2026 OPEN PIXEL LAB", 32, 200, 1, "#f3f0d4");
    drawText("ALL RIGHTS RESERVED", 48, 216, 1, "#f3f0d4");
  }

  function renderHiddenMessage() {
    const presentation = hiddenMessagePresentation(game.hiddenMessageElapsed);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (let index = 0; index < presentation.visibleLines.length; index += 1) {
      drawText(presentation.visibleLines[index], 64, 64 + index * 16, 1, "#f3f0d4");
    }
    if (presentation.dots > 0) drawText(".".repeat(presentation.dots), 64, 128, 1, "#f3f0d4");
    if (presentation.drop) {
      drawManifestSprite("hiddenDrop", presentation.drop.frame, presentation.drop.x, presentation.drop.y, {
        primary: "#55b96a",
        light: "#b7ffbd",
        shadow: "#245c33"
      });
    }
  }

  function renderHighScore() {
    const presentation = highScorePresentation(game.highScoreScreenElapsed, game.highScore);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const palette = {
      dark: "#1b1512",
      primary: presentation.color,
      highlight: "#f7f1c6"
    };
    drawStripedTitleText("HISCORE", 23, 50, 5, palette);
    drawStripedTitleText(presentation.scoreText, presentation.scoreX, 100, 5, palette);
  }

  function renderFullGameOver() {
    const presentation = fullGameOverPresentation(game.fullGameOverElapsed);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (let index = 0; index < presentation.gameText.length; index += 1) {
      drawStripedTitleText(
        presentation.gameText[index],
        presentation.x + index * presentation.letterAdvance,
        presentation.gameY,
        presentation.scale
      );
    }
    for (let index = 0; index < presentation.overText.length; index += 1) {
      drawStripedTitleText(
        presentation.overText[index],
        presentation.x + index * presentation.letterAdvance,
        presentation.overY,
        presentation.scale
      );
    }
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
    const size = Math.max(2, Math.floor(scale || 2));
    const colors = palette || { dark: "#a8322c", primary: "#f05a42", highlight: "#f3f0d4" };
    let cursorX = Math.round(x);
    const top = Math.round(y);
    for (const ch of String(text).toUpperCase()) {
      const glyph = pixelGlyph(ch);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] !== "1") continue;
          const px = cursorX + col * size;
          const py = top + row * size;
          ctx.fillStyle = colors.dark;
          ctx.fillRect(px, py, size, size);
          ctx.fillStyle = colors.primary;
          ctx.fillRect(px, py, size, Math.max(1, size - 1));
          ctx.fillStyle = colors.highlight;
          ctx.fillRect(px, py + Math.floor(size / 2), size, 1);
        }
      }
      cursorX += 6 * size;
    }
  }

  function drawTitleMenuCursor(item) {
    drawMiniTank(item.x - 20, item.y - 4, "#e3c64e");
  }

  function renderStageSelect() {
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    drawText("STAGE", 96, 112, 1, "#15161a");
    drawText(String(game.stage), 152, 112, 1, "#15161a");
  }

  function renderStageSelectClosing() {
    renderTitle();
    renderCurtain(stageSelectCurtainState());
  }

  function renderGame() {
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = "#000000";
    ctx.fillRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H);
    renderTerrain(false, game.grid);
    renderBase();

    for (const player of game.players) {
      if (!player.alive || player.respawn > 0) continue;
      if (player.spawnFlash > 0) {
        drawSpawn(player);
      } else {
        if (isPlayerShieldVisible(player, game.paused)) drawShield(player);
        if (isPlayerTankVisible(player, battleDisplayFrame())) drawTank(player, player.color, player.accent);
      }
    }

    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      if (enemy.destroying) continue;
      if (enemy.spawnFlash > 0) drawSpawn(enemy);
      else drawTank(enemy, enemyColor(enemy), enemy.accent);
    }

    for (const bullet of game.bullets) drawBullet(bullet);
    renderProjectileTerrainCover(game.grid);
    renderTerrain(true, game.grid);
    if (game.powerUp) drawPowerUp(game.powerUp);
    renderExplosions();
    renderPlayerDestructions();
    renderEnemyDestructions();
    renderBaseDestruction();
    renderScorePopups();
    renderPlayerGameOverMessage();
    renderPanel();
  }

  function renderGameBackdrop(grid) {
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = "#000";
    ctx.fillRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H);
    renderTerrain(false, grid);
    renderTerrain(true, grid);
  }

  function renderTerrain(topLayer, grid) {
    for (let r = 0; r < GRID; r += 1) {
      for (let c = 0; c < GRID; c += 1) {
        const cell = grid[r][c];
        const x = FIELD_X + c * TILE;
        const y = FIELD_Y + r * TILE;
        if (topLayer) {
          if (cell.type === FOREST) drawForest(x, y);
          continue;
        }
        if (cell.type === BRICK) drawBrickCell(x, y, cell);
        else if (cell.type === STEEL) drawWallCell(x, y, cell.mask, "#626a76", "#c9d0d9");
        else if (cell.type === WATER) drawWater(x, y);
        else if (cell.type === ICE) drawIce(x, y);
      }
    }
  }

  function drawWallCell(x, y, mask, dark, light) {
    const frameName = dark === "#a24f32" ? "brick" : "steel";
    for (let q = 0; q < 4; q += 1) {
      if (!(mask & (1 << q))) continue;
      const qx = x + (q % 2) * HALF;
      const qy = y + (q >= 2 ? HALF : 0);
      drawManifestSprite("wallQuarter", frameName, qx, qy, {
        dark,
        light,
        seam: frameName === "steel" ? "#5a6370" : light,
        bolt: frameName === "steel" ? "#333943" : dark,
        shadow: "#1b1512"
      });
    }
  }

  function drawBrickCell(x, y, cell) {
    const fragments = normalizeBrickFragmentMask(cell.brickMask, cell.mask);
    drawWallCell(x, y, quarterMaskFromBrickFragments(fragments), "#a24f32", "#d38658");
    ctx.fillStyle = "#000000";
    for (let fragment = 0; fragment < 16; fragment += 1) {
      const quarter = Math.floor(fragment / 8) * 2 + Math.floor((fragment % 4) / 2);
      if (!(fragments & BRICK_QUARTER_FRAGMENT_MASKS[quarter])) continue;
      if (fragments & (1 << fragment)) continue;
      ctx.fillRect(
        x + (fragment % 4) * WALL_FRAGMENT,
        y + Math.floor(fragment / 4) * WALL_FRAGMENT,
        WALL_FRAGMENT,
        WALL_FRAGMENT
      );
    }
  }

  function drawWater(x, y) {
    const frame = waterFrameName(game.frameLow);
    drawManifestSprite("terrain", frame, x, y, {
      base: "#173b67",
      wave: frame === "waterA" ? "#56a6d5" : "#2d789e"
    });
  }

  function waterFrameName(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 32) === 0 ? "waterA" : "waterB";
  }

  function drawIce(x, y) {
    drawManifestSprite("terrain", "ice", x, y, {
      base: "#b7c8d8",
      highlight: "#f1f8ff",
      shadow: "#7e96aa"
    });
  }

  function renderProjectileTerrainCover(grid) {
    for (let r = 0; r < GRID; r += 1) {
      for (let c = 0; c < GRID; c += 1) {
        if (grid[r][c].type === ICE) drawIceProjectileCover(FIELD_X + c * TILE, FIELD_Y + r * TILE);
      }
    }
  }

  function drawIceProjectileCover(x, y) {
    ctx.fillStyle = "rgba(241, 248, 255, 0.72)";
    ctx.fillRect(x + 2, y + 2, 10, 1);
    ctx.fillRect(x + 4, y + 7, 9, 1);
    ctx.fillStyle = "rgba(126, 150, 170, 0.42)";
    ctx.fillRect(x + 1, y + 14, 14, 1);
  }

  function drawForest(x, y) {
    drawManifestSprite("terrain", "forest", x, y, {
      base: "#315b34",
      light: "#3f7f42",
      dark: "#244327"
    });
  }

  function renderBase() {
    const x = FIELD_X + game.base.x;
    const y = FIELD_Y + game.base.y;
    drawManifestSprite("base", game.base.alive ? "alive" : "dead", x, y, {
      primary: game.base.alive ? "#d8c17a" : "#5c514a",
      shadow: game.base.alive ? "#181818" : "#2e2624"
    });
  }

  function drawTank(tank, color, accent) {
    const x = Math.round(FIELD_X + tank.x);
    const y = Math.round(FIELD_Y + tank.y);
    const primary = tankPrimaryColor(tank, color, battleDisplayFrame());
    drawManifestSprite("tank", directionName(tank.dir), x, y, {
      primary,
      accent,
      shadow: "#111111"
    });
    drawManifestSprite("tankTracks", tankTrackFrameName(tank), x, y, {
      primary,
      shadow: "#111111"
    });
    if (tank.kind === "player") drawPlayerUpgradeOverlay(tank, x, y, accent);
  }

  function drawPlayerUpgradeOverlay(tank, x, y, accent) {
    const parts = playerUpgradeOverlayParts(tank.level, tank.dir);
    if (!parts.length) return;
    const palette = {
      level1: accent || PLAYER_UPGRADE_OVERLAY_COLORS.level1,
      level2: PLAYER_UPGRADE_OVERLAY_COLORS.level2,
      level3: PLAYER_UPGRADE_OVERLAY_COLORS.level3
    };
    for (const part of parts) {
      const rect = part.rect;
      ctx.fillStyle = palette[part.role] || PLAYER_UPGRADE_OVERLAY_COLORS.level1;
      ctx.fillRect(x + rect[0], y + rect[1], rect[2], rect[3]);
    }
  }

  function drawShield(tank) {
    const x = Math.round(FIELD_X + tank.x - 2);
    const y = Math.round(FIELD_Y + tank.y - 2);
    ctx.lineWidth = 1;
    drawManifestSprite("shield", "box", x, y, {
      primary: shieldColorForTick(game.frameLow)
    });
  }

  function drawSpawn(tank) {
    const x = Math.round(FIELD_X + tank.x + 7);
    const y = Math.round(FIELD_Y + tank.y + 7);
    const total = tank.kind === "player"
      ? gameSettings().timings.playerSpawnFlash
      : gameSettings().timings.enemySpawnFlash;
    const presentation = spawnAnimationPresentation(tank.spawnFlash, total);
    const scale = presentation.size / 14;
    drawScaledManifestSprite(
      "spawn",
      "box",
      x - presentation.size / 2,
      y - presentation.size / 2,
      scale,
      { primary: "#f3f0d4" }
    );
  }

  function drawBullet(bullet) {
    const sprite = FREE_SPRITE_MANIFEST.sprites.bullet;
    const scale = bullet.w / (sprite && sprite.size ? sprite.size : bullet.w);
    drawScaledManifestSprite("bullet", "default", Math.round(FIELD_X + bullet.x), Math.round(FIELD_Y + bullet.y), scale, {
      primary: bullet.ownerKind === "player" ? "#f8e08b" : "#f7f1c6"
    });
  }

  function drawPowerUp(power) {
    if (!isPowerUpVisible(battleDisplayFrame())) return;
    const visual = powerUpVisualRect(power);
    const x = visual.x;
    const y = visual.y;
    ctx.fillStyle = "#102748";
    ctx.fillRect(x, y, visual.w, visual.h);
    ctx.fillStyle = "#aab4c2";
    ctx.fillRect(x + 2, y + 2, visual.w - 4, visual.h - 4);
    ctx.fillStyle = "#dbe1e8";
    ctx.fillRect(x + 3, y + 3, visual.w - 6, 1);
    drawManifestSprite("powerUp", power.type, x, y, {
      outline: "#102748",
      primary: "#f3f0d4",
      shade: "#77869a",
      cutout: "#aab4c2"
    });
  }

  function isPowerUpVisible(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 8) !== 0;
  }

  /**
   * Returns the visual frame phase used by display handlers that keep running
   * while the battle simulation is paused.
   */
  function battleDisplayFrame() {
    return game.frameLow;
  }

  function powerUpVisualRect(power) {
    const sprite = FREE_SPRITE_MANIFEST.sprites.powerUp;
    const size = sprite && sprite.size ? sprite.size : POWERUP_SIZE;
    const inset = (size - power.w) / 2;
    return {
      x: FIELD_X + power.x - inset,
      y: FIELD_Y + power.y - inset,
      w: size,
      h: size
    };
  }

  function drawManifestSprite(spriteName, frameName, x, y, palette) {
    const sprite = FREE_SPRITE_MANIFEST.sprites[spriteName];
    const frame = sprite && sprite.frames[frameName];
    if (!frame) return;
    for (const part of frame) {
      const rect = part.rect;
      const color = palette[part.role] || part.color || "#ffffff";
      if (part.op === "stroke") {
        ctx.strokeStyle = color;
        ctx.strokeRect(x + rect[0], y + rect[1], rect[2], rect[3]);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(x + rect[0], y + rect[1], rect[2], rect[3]);
      }
    }
  }

  function drawScaledManifestSprite(spriteName, frameName, x, y, scale, palette) {
    const sprite = FREE_SPRITE_MANIFEST.sprites[spriteName];
    const frame = sprite && sprite.frames[frameName];
    if (!frame) return;
    for (const part of frame) {
      const rect = part.rect;
      const color = palette[part.role] || part.color || "#ffffff";
      const rx = x + rect[0] * scale;
      const ry = y + rect[1] * scale;
      const rw = rect[2] * scale;
      const rh = rect[3] * scale;
      if (part.op === "stroke") {
        ctx.strokeStyle = color;
        ctx.strokeRect(rx, ry, rw, rh);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(rx, ry, rw, rh);
      }
    }
  }

  function renderExplosions() {
    for (const explosion of game.explosions) {
      if (isTankDestructionStyle(explosion.style)) {
        drawTankDestructionExplosion(explosion);
        continue;
      }
      const presentation = explosionPresentation(explosion);
      drawScaledManifestSprite("explosion", "burst", presentation.x, presentation.y, presentation.size / 16, {
        primary: explosion.color,
        core: explosion.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
      });
    }
  }

  function drawTankDestructionExplosion(explosion) {
    const presentation = tankDestructionPresentation(explosion);
    drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
      primary: explosion.color,
      core: explosion.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
    });
    return presentation;
  }

  function renderPlayerDestructions() {
    const rule = explosionRule("playerDestroy");
    for (const player of game.players) {
      if (!player.destroying || player.respawn <= 0) continue;
      const presentation = playerDestructionPresentation(player);
      drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
        primary: rule.color,
        core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
      });
    }
  }

  function playerDestructionPresentation(player) {
    return selectPlayerDestructionPresentation(player, {
      layout: BATTLE_PRESENTATION_LAYOUT,
      totalTicks: gameSettings().timings.playerRespawn,
      explosionTicks: explosionRule("playerDestroy").ttl
    });
  }

  function renderEnemyDestructions() {
    const rule = explosionRule("enemyDestroy");
    for (const enemy of game.enemies) {
      if (!enemy.alive || !enemy.destroying) continue;
      const presentation = enemyDestructionPresentation(enemy);
      if (presentation.kind === "score") {
        drawText(presentation.text, presentation.x, presentation.y, 1, DEFAULT_EXPLOSION_CORE_COLOR, 5);
        continue;
      }
      drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
        primary: rule.color,
        core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
      });
    }
  }

  function enemyDestructionPresentation(enemy) {
    return selectEnemyDestructionPresentation(enemy, {
      layout: BATTLE_PRESENTATION_LAYOUT,
      explosionTicks: explosionRule("enemyDestroy").ttl,
      scoreTicks: ENEMY_DESTRUCTION_SCORE_TICKS
    });
  }

  function renderBaseDestruction() {
    const presentation = baseDestructionPresentation(game.baseDestroyTimer);
    if (!presentation) return;
    const rule = explosionRule("baseDestroy");
    drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
      primary: rule.color,
      core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
    });
  }

  function baseDestructionPresentation(timer) {
    return selectBaseDestructionPresentation(timer, game.base, {
      layout: BATTLE_PRESENTATION_LAYOUT,
      visibleFrames: explosionRule("baseDestroy").ttl,
      tailFrames: BASE_DESTRUCTION_TAIL_FRAMES
    });
  }

  function tankDestructionPresentation(explosion) {
    return selectTankDestructionPresentation(explosion, BATTLE_PRESENTATION_LAYOUT);
  }

  function explosionPresentation(explosion) {
    return selectExplosionPresentation(explosion, BATTLE_PRESENTATION_LAYOUT);
  }

  function renderScorePopups() {
    for (const popup of game.scorePopups) {
      const presentation = scorePopupPresentation(popup);
      drawText(presentation.text, presentation.x, presentation.y, 1, presentation.color, presentation.advance);
    }
  }

  function scorePopupPresentation(popup) {
    return selectScorePopupPresentation(popup, BATTLE_PRESENTATION_LAYOUT);
  }

  function renderPanel() {
    const count = panelEnemyCounterRemaining();
    for (let i = 0; i < enemyTotal(); i += 1) {
      const x = PANEL_X + 8 + (i % 2) * 8;
      const y = 24 + Math.floor(i / 2) * 8;
      drawManifestSprite("enemyCounter", i < count ? "remaining" : "cleared", x, y, {
        primary: i < count ? "#15161a" : "#686c75"
      });
    }
    drawText("1P", PANEL_X + 8, 112, 1, "#15161a");
    drawScaledManifestSprite("miniTank", "up", PANEL_X + 8, 124, 0.57, {
      primary: "#15161a",
      shadow: "#6b6f78"
    });
    drawText(String(panelLifeCount(game.players[0])), PANEL_X + 20, 125, 1, "#15161a");
    if (game.playerCount > 1) {
      drawText("2P", PANEL_X + 8, 144, 1, "#15161a");
      drawScaledManifestSprite("miniTank", "up", PANEL_X + 8, 156, 0.57, {
        primary: "#15161a",
        shadow: "#6b6f78"
      });
      drawText(String(panelLifeCount(game.players[1])), PANEL_X + 20, 157, 1, "#15161a");
    }
    drawStageFlag(PANEL_X + 8, 192);
    drawText(pad2(game.stage), PANEL_X + 10, 211, 1, "#15161a");
    if (game.freezeTimer > 0) drawText("TM", PANEL_X + 8, 176, 1, "#173b67");
  }

  function drawStageFlag(x, y) {
    ctx.fillStyle = "#15161a";
    ctx.fillRect(x, y, 2, 15);
    ctx.fillRect(x + 2, y + 1, 10, 7);
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(x + 4, y + 3, 6, 3);
  }

  function panelEnemyCounterRemaining(total, spawned) {
    const countTotal = total === undefined ? enemyTotal() : Math.max(0, Math.floor(Number(total) || 0));
    const spawnedCount = spawned === undefined ? game.enemySpawned : Math.max(0, Math.floor(Number(spawned) || 0));
    return selectPanelEnemyCounterRemaining(countTotal, spawnedCount);
  }

  function panelLifeCount(player) {
    return selectPanelLifeCount(player);
  }

  function drawSmallScore(score, x, y, color) {
    drawText(formatScore5(score), x, y, 1, color);
  }

  function formatScore5(score) {
    return String(Math.min(99999, Math.max(0, Math.floor(score || 0)))).padStart(5, "0");
  }

  function renderStageIntro() {
    renderGameBackdrop(game.grid);
    renderBase();
    const curtain = stageIntroCurtainState();
    renderCurtain(curtain);
    const clips = [curtain.top, curtain.bottom].filter((rect) => rect.h > 0);
    drawTextClipped("STAGE", 96, 112, 1, "#15161a", clips);
    drawTextClipped(String(game.stage), 152, 112, 1, "#15161a", clips);
  }

  function renderCurtain(curtain) {
    ctx.fillStyle = "#6b6f78";
    if (curtain.top.h > 0) ctx.fillRect(curtain.top.x, curtain.top.y, curtain.top.w, curtain.top.h);
    if (curtain.bottom.h > 0) ctx.fillRect(curtain.bottom.x, curtain.bottom.y, curtain.bottom.w, curtain.bottom.h);
  }

  function stageSelectCurtainState(timer) {
    const remaining = timer === undefined ? game.transitionTimer : timer;
    return selectStageSelectCurtainState(remaining, {
      screenWidth: SCREEN_W,
      screenHeight: SCREEN_H
    });
  }

  function stageIntroCurtainState(timer) {
    const duration = Math.max(1, gameSettings().timings.stageIntro);
    const remaining = timer === undefined ? game.transitionTimer : timer;
    return selectStageIntroCurtainState(remaining, game.stage, {
      duration,
      screenWidth: SCREEN_W,
      screenHeight: SCREEN_H
    });
  }

  function renderStageClear() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const presentation = stageClearPresentation();
    const result = presentation.result;
    const p1 = result.p1;
    const p2 = result.p2;

    drawText("HI-SCORE", 64, 24, 1, "#f05a42");
    drawText(formatScore5(game.highScore), 152, 24, 1, "#f05a42");
    drawText("STAGE", 96, 40, 1, "#f3f0d4");
    drawText(String(game.stage), 152, 40, 1, "#f3f0d4");
    drawText("I-PLAYER", 24, 56, 1, "#f05a42");
    drawTextRight(String(p1.score || 0), 88, 72, 1, "#d08b52");
    if (game.playerCount > 1) {
      drawText("II-PLAYER", 168, 56, 1, "#f05a42");
      drawTextRight(String(p2.score || 0), 232, 72, 1, "#d08b52");
    }

    for (const row of presentation.rows) {
      const y = 96 + row.typeIndex * 24;
      drawTextRight(String(row.p1VisiblePoints), 56, y, 1, "#f3f0d4");
      drawText("PTS", 64, y, 1, "#f3f0d4");
      drawTextRight(String(row.p1VisibleKills), STAGE_RESULT_ROW_LAYOUT.p1KillsRightX, y, 1, "#f3f0d4");
      drawResultArrow(STAGE_RESULT_ROW_LAYOUT.leftArrowX, y + 2, -1);
      drawMiniTank(STAGE_RESULT_ROW_LAYOUT.miniTankX, y - 3, row.color);
      if (game.playerCount > 1) {
        drawResultArrow(STAGE_RESULT_ROW_LAYOUT.rightArrowX, y + 2, 1);
        drawText(String(row.p2VisibleKills), STAGE_RESULT_ROW_LAYOUT.p2KillsX, y, 1, "#f3f0d4");
        drawTextRight(String(row.p2VisiblePoints), 200, y, 1, "#f3f0d4");
        drawText("PTS", 208, y, 1, "#f3f0d4");
      }
    }

    ctx.fillStyle = "#f3f0d4";
    ctx.fillRect(96, 180, 64, 1);
    drawText("TOTAL", 48, 184, 1, "#f3f0d4");
    if (presentation.showTotals) {
      drawTextRight(String(totalStageKills(p1)), 104, 184, 1, "#f3f0d4");
      if (game.playerCount > 1) drawText(String(totalStageKills(p2)), 152, 184, 1, "#f3f0d4");
    }

    if (presentation.showBonus && game.stageClearBonusPlayerIds.includes(1)) {
      drawText("BONUS!", 24, 200, 1, "#f05a42");
      drawTextRight(String(gameSettings().stageClearBonus.points), 56, 208, 1, "#f3f0d4");
      drawText("PTS", 64, 208, 1, "#f3f0d4");
    }
    if (presentation.showBonus && game.stageClearBonusPlayerIds.includes(2)) {
      drawText("BONUS!", 176, 200, 1, "#f05a42");
      drawTextRight(String(gameSettings().stageClearBonus.points), 200, 208, 1, "#f3f0d4");
      drawText("PTS", 216, 208, 1, "#f3f0d4");
    }
  }

  function renderStageClearClosing() {
    renderStageClear();
    renderCurtain(stageSelectCurtainState());
  }

  function totalStageKills(player) {
    return player && Array.isArray(player.stageKills)
      ? player.stageKills.reduce((sum, value) => sum + Math.max(0, Math.floor(Number(value) || 0)), 0)
      : 0;
  }

  function drawResultArrow(x, y, direction) {
    ctx.fillStyle = "#f3f0d4";
    if (direction < 0) {
      ctx.fillRect(x, y + 2, 8, 1);
      ctx.fillRect(x, y + 1, 2, 3);
      ctx.fillRect(x + 2, y, 2, 5);
    } else {
      ctx.fillRect(x, y + 2, 8, 1);
      ctx.fillRect(x + 6, y + 1, 2, 3);
      ctx.fillRect(x + 4, y, 2, 5);
    }
  }

  function drawMiniTank(x, y, color) {
    drawManifestSprite("miniTank", "up", x, y, {
      primary: color,
      shadow: "#111111"
    });
  }

  function renderGameOver() {
    const y = gameOverBannerY(game.gameOverTimer);
    const width = GAME_OVER_TEXT.length * 6 - 1;
    drawText(GAME_OVER_TEXT, Math.round((SCREEN_W - width) / 2), y, 1, "#f05a42");
  }

  function renderPlayerGameOverMessage() {
    const presentation = playerGameOverMessagePresentation();
    if (!presentation || !presentation.visible) return;
    drawCompactGameOverWord("GAME", presentation.left, presentation.y + 1);
    drawCompactGameOverWord("OVER", presentation.left + 16, presentation.y + 1);
  }

  function playerGameOverMessagePresentation() {
    return selectPlayerGameOverMessagePresentation(game.playerGameOverMessage, {
      paused: game.paused,
      demoMode: game.demoMode
    });
  }

  function drawCompactGameOverWord(word, x, y) {
    ctx.fillStyle = "#f05a42";
    let cursorX = Math.round(x);
    const top = Math.round(y);
    for (const char of word) {
      const glyph = compactGameOverGlyph(char);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let column = 0; column < glyph[row].length; column += 1) {
          if (glyph[row][column] === "1") ctx.fillRect(cursorX + column, top + row, 1, 1);
        }
      }
      cursorX += 4;
    }
  }

  function gameOverBannerY(timer) {
    const timings = gameSettings().timings;
    return selectGameOverBannerPresentation(timer, {
      slideFrames: timings.gameOverSlide,
      holdFrames: timings.gameOverHold
    }).y;
  }

  function renderPause() {
    const presentation = pausePresentation(battleDisplayFrame());
    if (!presentation.visible) return;
    drawText(presentation.text, presentation.x, presentation.y, 1, "#f3f0d4");
  }

  function pausePresentation(frame) {
    return selectPausePresentation(frame);
  }

  function renderEditor() {
    const grid = game.editorGrid || createStageGrid(game.stage);
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = "#000";
    ctx.fillRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H);
    renderTerrain(false, grid);
    renderBase();
    renderTerrain(true, grid);

    const cursor = game.editorCursor;
    if (
      cursor.qc >= 0 && cursor.qc < QUAD_GRID &&
      cursor.qr >= 0 && cursor.qr < QUAD_GRID &&
      Math.floor(game.editorTick / 16) % 2 === 0
    ) {
      const c = Math.floor(cursor.qc / 2);
      const r = Math.floor(cursor.qr / 2);
      drawManifestSprite("tank", "up", FIELD_X + c * TILE + 1, FIELD_Y + r * TILE + 1, {
        primary: "#e3c64e",
        accent: "#fff0a8",
        shadow: "#111111"
      });
    }
  }

  function drawTileLegend(x, y) {
    for (let i = 0; i < EDITOR_TILE_TYPES.length; i += 1) {
      const px = x + (i % 2) * 14;
      const py = y + Math.floor(i / 2) * 18;
      ctx.fillStyle = "#000";
      ctx.fillRect(px, py, 10, 10);
      const cell = { type: EDITOR_TILE_TYPES[i], mask: 15 };
      if (cell.type === BRICK) drawBrickCell(px, py, cell);
      else if (cell.type === STEEL) drawWallCell(px, py, cell.mask, "#626a76", "#c9d0d9");
      else if (cell.type === WATER) drawWater(px, py);
      else if (cell.type === FOREST) drawForest(px, py);
      else if (cell.type === ICE) drawIce(px, py);
      else {
        ctx.strokeStyle = "#575b64";
        ctx.strokeRect(px, py, 10, 10);
      }
      if (cell.type === game.editorBrush) {
        ctx.strokeStyle = "#e0b84b";
        ctx.strokeRect(px, py, 10, 10);
      }
    }
  }

  function drawText(text, x, y, scale, color, advance) {
    ctx.fillStyle = color || "#ffffff";
    const size = Math.max(1, Math.floor(scale || 1));
    const glyphAdvance = Math.max(5, Math.floor(advance || 6));
    let cursorX = Math.round(x);
    const top = Math.round(y);
    const value = String(text).toUpperCase();
    for (const ch of value) {
      const glyph = pixelGlyph(ch);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] === "1") {
            ctx.fillRect(cursorX + col * size, top + row * size, size, size);
          }
        }
      }
      cursorX += glyphAdvance * size;
    }
  }

  function drawTextClipped(text, x, y, scale, color, clips) {
    if (!clips || !clips.length) return;
    ctx.fillStyle = color || "#ffffff";
    const size = Math.max(1, Math.floor(scale || 1));
    let cursorX = Math.round(x);
    const top = Math.round(y);
    for (const ch of String(text).toUpperCase()) {
      const glyph = pixelGlyph(ch);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] !== "1") continue;
          const px = cursorX + col * size;
          const py = top + row * size;
          for (const clip of clips) {
            const left = Math.max(px, clip.x);
            const right = Math.min(px + size, clip.x + clip.w);
            const clipTop = Math.max(py, clip.y);
            const bottom = Math.min(py + size, clip.y + clip.h);
            if (right > left && bottom > clipTop) ctx.fillRect(left, clipTop, right - left, bottom - clipTop);
          }
        }
      }
      cursorX += 6 * size;
    }
  }

  function drawTextRight(text, right, y, scale, color) {
    const value = String(text);
    const size = Math.max(1, Math.floor(scale || 1));
    drawText(value, rightAlignedPixelTextX(value, right, size), y, size, color);
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
    game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
    game.players = [{ alive: true, lives: 1, respawn: 0 }];
    game.enemies = [];
    game.enemySpawned = 0;
    game.clearPendingTimer = 0;
    game.scorePopups = [];
  }

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
    audioManifest() {
      return cloneAudioManifest();
    },
    debugScoreCountAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.scoreCount;
      const frames = [0, 1];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map((voice) => fixedFrameVoiceDuration(voice)),
        frames: frames.map((frame) => {
          const presentation = scoreCountAudioPresentation(frame);
          return {
            frame,
            voices: presentation.voices.map((voice) => voice
              ? { frequency: voice.frequency, gain: voice.gain, wave: voice.wave }
              : null)
          };
        })
      };
    },
    debugScoreCountAudioLifecycleProbe() {
      const previous = { ...game };
      const audioStates = [
        stageStartAudio,
        bonusLifeAudio,
        powerUpPickupAudio,
        powerUpAppearAudio,
        brickHitAudio,
        baseHitAudio,
        steelHitAudio,
        enemyHitAudio,
        enemyDestroyAudio,
        playerDestroyAudio,
        playerShootAudio,
        movementIceAudio,
        pauseAudio,
        scoreCountAudio,
        stageBonusAudio
      ];
      const previousAudio = audioStates.map((state) => ({ active: state.active, frame: state.frame }));
      const state = () => {
        const presentation = scoreCountAudioPresentation(scoreCountAudio.frame);
        return {
          active: scoreCountAudio.active,
          frame: scoreCountAudio.frame,
          voices: presentation.voices.map((voice) => voice
            ? { frequency: voice.frequency, wave: voice.wave }
            : null)
        };
      };
      try {
        stopMovementAudio();
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        game.screen = "stageClear";
        game.paused = false;
        game.stageResultReason = "clear";
        game.stageClearBonusAwarded = true;
        game.stageClearBonusPlayerIds = [];
        game.stageClearElapsed = 31;
        game.transitionTimer = 999;
        game.players = [
          makeStageClearResultProbePlayer(1, [2, 0, 0, 0], 0),
          makeStageClearResultProbePlayer(2, [1, 0, 0, 0], 0)
        ];

        update();
        const firstPresentation = stageClearPresentation();
        const simultaneous = {
          ...state(),
          elapsed: game.stageClearElapsed,
          visibleKills: stageResultVisibleKillCount(firstPresentation)
        };
        update();
        const afterOneFrame = state();

        game.stageClearElapsed = 40;
        update();
        const nextCadence = {
          ...state(),
          elapsed: game.stageClearElapsed,
          visibleKills: stageResultVisibleKillCount(stageClearPresentation())
        };

        stopScoreCountAudio();
        game.players = [
          makeStageClearResultProbePlayer(1, [0, 0, 0, 0], 0),
          makeStageClearResultProbePlayer(2, [0, 0, 0, 0], 0)
        ];
        game.stageClearElapsed = 31;
        update();
        const zeroKills = state();

        game.players = [createPlayer(1)];
        startScoreCountAudio();
        startStage(game.stage);
        const stageCleanup = state();

        return { simultaneous, afterOneFrame, nextCadence, zeroKills, stageCleanup };
      } finally {
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        Object.assign(game, previous);
        audioStates.forEach((audioState, index) => {
          audioState.active = previousAudio[index].active;
          audioState.frame = previousAudio[index].frame;
        });
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncBaseHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncEnemyDestroyAudioNodes();
        syncPlayerDestroyAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncScoreCountAudioNodes();
        syncStageBonusAudioNodes();
        syncMovementAudio();
      }
    },
    debugStageBonusAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.stageBonus;
      const frames = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 27, 28];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map((voice) => fixedFrameVoiceDuration(voice)),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => {
          const presentation = stageBonusAudioPresentation(frame);
          return {
            frame,
            voices: presentation.voices.map((voice) => voice
              ? { frequency: voice.frequency, gain: voice.gain, wave: voice.wave }
              : null)
          };
        })
      };
    },
    debugStageBonusAudioLifecycleProbe() {
      const previous = { ...game };
      const audioStates = [
        stageStartAudio,
        bonusLifeAudio,
        powerUpPickupAudio,
        powerUpAppearAudio,
        brickHitAudio,
        baseHitAudio,
        steelHitAudio,
        enemyHitAudio,
        enemyDestroyAudio,
        playerDestroyAudio,
        playerShootAudio,
        movementIceAudio,
        pauseAudio,
        scoreCountAudio,
        stageBonusAudio
      ];
      const previousAudio = audioStates.map((state) => ({ active: state.active, frame: state.frame }));
      const makeResultPlayer = (id, kills) => {
        const player = createPlayer(id);
        return Object.assign(player, makeStageClearResultProbePlayer(id, kills, 0));
      };
      const state = () => {
        const presentation = stageBonusAudioPresentation(stageBonusAudio.frame);
        return {
          active: stageBonusAudio.active,
          frame: stageBonusAudio.frame,
          frequency: presentation.voices[0] ? presentation.voices[0].frequency : null,
          audible: stageBonusAudio.active && Boolean(presentation.voices[0]) && stageBonusAudioAudible()
        };
      };
      try {
        stopMovementAudio();
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        game.screen = "stageClear";
        game.paused = false;
        game.stageResultReason = "clear";
        game.stageClearBonusAwarded = false;
        game.transitionTimer = 999;
        game.players = [
          makeResultPlayer(1, [4, 0, 0, 0]),
          makeResultPlayer(2, [3, 0, 0, 0])
        ];
        game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
        const bonusRevealFrame = stageClearPresentation(game.players, 0).bonusRevealFrame;
        game.stageClearElapsed = bonusRevealFrame - 1;
        const scoreBefore = game.players[0].score;

        update();
        const awarded = {
          ...state(),
          elapsed: game.stageClearElapsed,
          recipients: game.stageClearBonusPlayerIds.slice(),
          scoreDelta: game.players[0].score - scoreBefore,
          bonusAwarded: game.stageClearBonusAwarded
        };
        for (let frame = 0; frame < 27; frame += 1) update();
        const finalFrame = state();
        update();
        const end = {
          ...state(),
          scoreDelta: game.players[0].score - scoreBefore
        };

        stopStageBonusAudio();
        stopBonusLifeAudio();
        game.players = [
          makeResultPlayer(1, [4, 0, 0, 0]),
          makeResultPlayer(2, [3, 0, 0, 0])
        ];
        game.players[0].score = 19000;
        game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
        game.stageClearBonusAwarded = false;
        game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
        const thresholdScoreBefore = game.players[0].score;
        const thresholdLivesBefore = game.players[0].lives;
        update();
        const bonusLifePriority = {
          ...state(),
          bonusLifeActive: bonusLifeAudio.active,
          bonusLifeFrame: bonusLifeAudio.frame,
          scoreDelta: game.players[0].score - thresholdScoreBefore,
          livesDelta: game.players[0].lives - thresholdLivesBefore
        };

        stopStageBonusAudio();
        stopBonusLifeAudio();
        game.players = [
          makeResultPlayer(1, [3, 0, 0, 0]),
          makeResultPlayer(2, [3, 0, 0, 0])
        ];
        game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
        game.stageClearBonusAwarded = false;
        game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
        update();
        const tied = {
          ...state(),
          recipients: game.stageClearBonusPlayerIds.slice(),
          score: game.players[0].score + game.players[1].score
        };

        stopStageBonusAudio();
        game.players = [
          makeResultPlayer(1, [4, 0, 0, 0]),
          makeResultPlayer(2, [3, 0, 0, 0])
        ];
        game.stageResultReason = "gameOver";
        game.stageClearBonusPlayerIds = [];
        game.stageClearBonusAwarded = false;
        game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
        update();
        const gameOver = {
          ...state(),
          bonusAwarded: game.stageClearBonusAwarded,
          score: game.players[0].score + game.players[1].score
        };

        game.players = [createPlayer(1)];
        startStageBonusAudio();
        startStage(game.stage);
        const stageCleanup = state();

        return { bonusRevealFrame, awarded, finalFrame, end, bonusLifePriority, tied, gameOver, stageCleanup };
      } finally {
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        Object.assign(game, previous);
        audioStates.forEach((audioState, index) => {
          audioState.active = previousAudio[index].active;
          audioState.frame = previousAudio[index].frame;
        });
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncBaseHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncEnemyDestroyAudioNodes();
        syncPlayerDestroyAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncScoreCountAudioNodes();
        syncStageBonusAudioNodes();
        syncMovementAudio();
      }
    },
    debugMovementAudioProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = {
        active: stageStartAudio.active,
        frame: stageStartAudio.frame
      };
      const previousBonusLife = {
        active: bonusLifeAudio.active,
        frame: bonusLifeAudio.frame
      };
      const previousPowerUpPickup = {
        active: powerUpPickupAudio.active,
        frame: powerUpPickupAudio.frame
      };
      const previousPowerUpAppear = {
        active: powerUpAppearAudio.active,
        frame: powerUpAppearAudio.frame
      };
      const previousBaseHit = {
        active: baseHitAudio.active,
        frame: baseHitAudio.frame
      };
      const previousMovementIce = {
        active: movementIceAudio.active,
        frame: movementIceAudio.frame
      };
      const previousPlayerShoot = {
        active: playerShootAudio.active,
        frame: playerShootAudio.frame
      };
      const previousSteelHit = {
        active: steelHitAudio.active,
        frame: steelHitAudio.frame
      };
      const previousEnemyHit = {
        active: enemyHitAudio.active,
        frame: enemyHitAudio.frame
      };
      const previousPause = {
        active: pauseAudio.active,
        frame: pauseAudio.frame
      };
      try {
        const player = createPlayer(1);
        player.spawnFlash = 0;
        player.invuln = 0;
        player.respawn = 0;
        game.playerCount = 1;
        game.players = [player];
        game.enemies = [];
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.screen = "title";
        stageStartAudio.active = false;
        bonusLifeAudio.active = false;
        powerUpPickupAudio.active = false;
        powerUpAppearAudio.active = false;
        baseHitAudio.active = false;
        movementIceAudio.active = false;
        playerShootAudio.active = false;
        steelHitAudio.active = false;
        enemyHitAudio.active = false;
        pauseAudio.active = false;
        keys.clear();
        const title = movementAudioModeForState();

        game.screen = "playing";
        const idleBattle = movementAudioModeForState();
        stageStartAudio.active = true;
        const stageStart = movementAudioModeForState();
        stageStartAudio.active = false;
        bonusLifeAudio.active = true;
        bonusLifeAudio.frame = 0;
        const bonusLifePulse2 = movementAudioModeForState();
        bonusLifeAudio.frame = 54;
        const bonusLifePulse1Tail = movementAudioModeForState();
        bonusLifeAudio.active = false;
        powerUpPickupAudio.active = true;
        powerUpPickupAudio.frame = 0;
        const powerUpPickup = movementAudioModeForState();
        powerUpPickupAudio.active = false;
        powerUpAppearAudio.active = true;
        const powerUpAppear = movementAudioModeForState();
        powerUpAppearAudio.active = false;
        baseHitAudio.active = true;
        const baseHit = movementAudioModeForState();
        baseHitAudio.active = false;
        enemyHitAudio.active = true;
        const enemyHit = movementAudioModeForState();
        enemyHitAudio.active = false;
        pauseAudio.active = true;
        const pauseCue = movementAudioModeForState();
        pauseAudio.active = false;
        keys.add("ArrowUp");
        const heldDirection = movementAudioModeForState();
        player.alive = false;
        player.respawn = 12;
        const heldDuringDeathState = movementAudioModeForState();
        player.respawn = 0;
        const heldAfterTankRemoved = movementAudioModeForState();
        player.alive = true;
        game.paused = true;
        const paused = movementAudioModeForState();
        game.paused = false;
        game.clearPendingTimer = 128;
        const clearDelay = movementAudioModeForState();
        game.clearPendingTimer = 0;
        game.screen = "gameOver";
        const gameOver = movementAudioModeForState();

        return {
          modes: {
            title,
            idleBattle,
            stageStart,
            bonusLifePulse2,
            bonusLifePulse1Tail,
            powerUpPickup,
            powerUpAppear,
            baseHit,
            enemyHit,
            pauseCue,
            heldDirection,
            heldDuringDeathState,
            heldAfterTankRemoved,
            paused,
            clearDelay,
            gameOver
          },
          enemyFrames: [0, 3, 4, 7, 8].map((tick) => movementAudioPresentation("enemy", tick)),
          playerFrames: [0, 15, 16, 31, 32].map((tick) => movementAudioPresentation("player", tick)),
          ice: { ...FREE_AUDIO_MANIFEST.events.movementIce }
        };
      } finally {
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        baseHitAudio.active = previousBaseHit.active;
        baseHitAudio.frame = previousBaseHit.frame;
        movementIceAudio.active = previousMovementIce.active;
        movementIceAudio.frame = previousMovementIce.frame;
        playerShootAudio.active = previousPlayerShoot.active;
        playerShootAudio.frame = previousPlayerShoot.frame;
        steelHitAudio.active = previousSteelHit.active;
        steelHitAudio.frame = previousSteelHit.frame;
        enemyHitAudio.active = previousEnemyHit.active;
        enemyHitAudio.frame = previousEnemyHit.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        Object.assign(game, previous);
      }
    },
    debugMovementIceAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.movementIce;
      const frames = [0, 1, 2, 3, 4];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => movementIceAudioPresentation(frame))
      };
    },
    debugBrickHitAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.brickHit;
      const frames = [0, 1, 2, 3];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => brickHitAudioPresentation(frame))
      };
    },
    debugBrickHitAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
      const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
      const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
      const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
      const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
      const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
      const state = () => ({
        active: brickHitAudio.active,
        frame: brickHitAudio.frame,
        paused: game.paused,
        audible: brickHitAudio.active && brickHitAudioAudible(),
        movementAudioMode: movementAudio.mode,
        steelHitActive: steelHitAudio.active,
        steelHitAudible: steelHitAudio.active && steelHitAudioAudible(),
        playerShootActive: playerShootAudio.active,
        playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
        pauseActive: pauseAudio.active,
        pauseFrame: pauseAudio.frame,
        stageStartActive: stageStartAudio.active
      });
      const wallBullet = (ownerKind, power) => ({
        x: TILE,
        y: TILE,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: RIGHT,
        speed: 0,
        power,
        ownerKind,
        ownerId: 1,
        ownerKey: `${ownerKind}:1`,
        remove: false
      });
      const prepareWall = (type) => {
        game.grid = makeGrid();
        game.grid[1][1] = makeCell(type, 15);
        game.explosions = [];
      };
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.players = [];
        game.enemies = [];
        game.bullets = [];
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        keys.clear();
        syncMovementAudio();

        prepareWall(BRICK);
        const playerBrickBullet = wallBullet("player", 1);
        const playerBrickHit = hitTerrain(playerBrickBullet);
        const playerBrick = {
          ...state(),
          hit: playerBrickHit,
          bulletRemoved: playerBrickBullet.remove,
          wallMask: game.grid[1][1].mask,
          wallBrickMask: game.grid[1][1].brickMask,
          explosionCount: game.explosions.length
        };
        for (let frame = 0; frame < 2; frame += 1) updateBrickHitAudio();
        const beforePause = state();
        game.paused = true;
        startPauseAudio();
        syncBrickHitAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 10; frame += 1) {
          updateBrickHitAudio();
          updatePauseAudio();
        }
        const paused = state();
        game.paused = false;
        syncBrickHitAudioNodes();
        syncMovementAudio();
        updateBrickHitAudio();
        const end = state();

        stopPauseAudio();
        stopBrickHitAudio();
        syncMovementAudio();
        prepareWall(BRICK);
        const enemyBrickBullet = wallBullet("enemy", 1);
        const enemyBrickHit = hitTerrain(enemyBrickBullet);
        const enemyBrick = {
          ...state(),
          hit: enemyBrickHit,
          bulletRemoved: enemyBrickBullet.remove,
          wallMask: game.grid[1][1].mask,
          explosionCount: game.explosions.length
        };

        prepareWall(STEEL);
        const maxPowerSteelBullet = wallBullet("player", 3);
        const maxPowerSteelHit = hitTerrain(maxPowerSteelBullet);
        const destructibleSteel = {
          ...state(),
          hit: maxPowerSteelHit,
          bulletRemoved: maxPowerSteelBullet.remove,
          wallMask: game.grid[1][1].mask,
          explosionCount: game.explosions.length
        };

        startSteelHitAudio();
        startPlayerShootAudio();
        const separateChannels = state();

        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopBrickHitAudio();
        startBrickHitAudio();
        startStageStartAudio();
        const stageStartPriority = state();
        for (let frame = 0; frame < 3; frame += 1) updateBrickHitAudio();
        const stageStartSuppressedEnd = state();

        stopStageStartAudio();
        startBrickHitAudio();
        startStage(game.stage);
        const stageCleanup = state();
        return {
          playerBrick,
          beforePause,
          paused,
          end,
          enemyBrick,
          destructibleSteel,
          separateChannels,
          stageStartPriority,
          stageStartSuppressedEnd,
          stageCleanup
        };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        brickHitAudio.active = previousBrickHit.active;
        brickHitAudio.frame = previousBrickHit.frame;
        steelHitAudio.active = previousSteelHit.active;
        steelHitAudio.frame = previousSteelHit.frame;
        enemyHitAudio.active = previousEnemyHit.active;
        enemyHitAudio.frame = previousEnemyHit.frame;
        playerShootAudio.active = previousPlayerShoot.active;
        playerShootAudio.frame = previousPlayerShoot.frame;
        movementIceAudio.active = previousMovementIce.active;
        movementIceAudio.frame = previousMovementIce.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncMovementAudio();
      }
    },
    debugSteelHitAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.steelHit;
      const frames = [0, 1, 2, 3, 4];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => steelHitAudioPresentation(frame))
      };
    },
    debugSteelHitAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
      const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
      const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
      const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
      const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
      const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
      const state = () => ({
        active: steelHitAudio.active,
        frame: steelHitAudio.frame,
        paused: game.paused,
        audible: steelHitAudio.active && steelHitAudioAudible(),
        movementAudioMode: movementAudio.mode,
        powerUpAppearActive: powerUpAppearAudio.active,
        playerShootActive: playerShootAudio.active,
        playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
        pauseActive: pauseAudio.active,
        pauseFrame: pauseAudio.frame
      });
      const boundaryBullet = (ownerKind) => {
        const rules = gameSettings().projectileRules;
        return {
          x: -rules.boundsPadding - 1,
          y: FIELD_H / 2,
          w: rules.bulletSize,
          h: rules.bulletSize,
          dir: LEFT,
          speed: 0,
          power: 1,
          ownerKind,
          ownerId: 1,
          ownerKey: `${ownerKind}:1`,
          remove: false
        };
      };
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.players = [];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        keys.clear();
        syncMovementAudio();

        const playerBullet = boundaryBullet("player");
        resolveBullet(playerBullet);
        const playerBoundary = {
          ...state(),
          bulletRemoved: playerBullet.remove,
          explosionCount: game.explosions.length
        };
        for (let frame = 0; frame < 3; frame += 1) updateSteelHitAudio();
        const beforePause = state();
        game.paused = true;
        startPauseAudio();
        syncSteelHitAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 10; frame += 1) {
          updateSteelHitAudio();
          updatePauseAudio();
        }
        const paused = state();
        game.paused = false;
        syncSteelHitAudioNodes();
        syncMovementAudio();
        updateSteelHitAudio();
        const end = state();

        stopPauseAudio();
        stopSteelHitAudio();
        syncMovementAudio();
        game.explosions = [];
        const enemyBullet = boundaryBullet("enemy");
        resolveBullet(enemyBullet);
        const enemyBoundary = {
          ...state(),
          bulletRemoved: enemyBullet.remove,
          explosionCount: game.explosions.length
        };

        startSteelHitAudio();
        startPlayerShootAudio();
        const separatePulseChannels = state();

        stopPlayerShootAudio();
        stopSteelHitAudio();
        startSteelHitAudio();
        startPowerUpAppearAudio();
        const appearancePriority = state();
        for (let frame = 0; frame < 4; frame += 1) updateSteelHitAudio();
        const appearanceSuppressedEnd = state();

        stopPowerUpAppearAudio();
        startSteelHitAudio();
        startStageStartAudio();
        syncSteelHitAudioNodes();
        const stageStartPriority = state();
        for (let frame = 0; frame < 4; frame += 1) updateSteelHitAudio();
        const stageStartSuppressedEnd = state();

        stopStageStartAudio();
        startSteelHitAudio();
        startStage(game.stage);
        const stageCleanup = state();
        return {
          playerBoundary,
          beforePause,
          paused,
          end,
          enemyBoundary,
          separatePulseChannels,
          appearancePriority,
          appearanceSuppressedEnd,
          stageStartPriority,
          stageStartSuppressedEnd,
          stageCleanup
        };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        brickHitAudio.active = previousBrickHit.active;
        brickHitAudio.frame = previousBrickHit.frame;
        steelHitAudio.active = previousSteelHit.active;
        steelHitAudio.frame = previousSteelHit.frame;
        enemyHitAudio.active = previousEnemyHit.active;
        enemyHitAudio.frame = previousEnemyHit.frame;
        playerShootAudio.active = previousPlayerShoot.active;
        playerShootAudio.frame = previousPlayerShoot.frame;
        movementIceAudio.active = previousMovementIce.active;
        movementIceAudio.frame = previousMovementIce.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncMovementAudio();
      }
    },
    debugEnemyHitAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.enemyHit;
      const frames = [0, 1, 2, 3, 4, 5];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => enemyHitAudioPresentation(frame))
      };
    },
    debugEnemyHitAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
      const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
      const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
      const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
      const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
      const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
      const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
      const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
      const state = () => {
        const voice = enemyHitAudioPresentation(enemyHitAudio.frame).voices[0];
        const voiceActive = Boolean(voice);
        return {
          active: enemyHitAudio.active,
          frame: enemyHitAudio.frame,
          paused: game.paused,
          voiceActive,
          frequency: voice ? voice.frequency : null,
          audible: enemyHitAudio.active && voiceActive && enemyHitAudioAudible(),
          movementAudioMode: movementAudio.mode,
          brickHitActive: brickHitAudio.active,
          brickHitAudible: brickHitAudio.active && brickHitAudioAudible(),
          steelHitActive: steelHitAudio.active,
          enemyDestroyActive: enemyDestroyAudio.active,
          enemyDestroyFrame: enemyDestroyAudio.frame,
          playerDestroyActive: playerDestroyAudio.active,
          playerDestroyFrame: playerDestroyAudio.frame,
          playerShootActive: playerShootAudio.active,
          playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
          pauseActive: pauseAudio.active,
          pauseFrame: pauseAudio.frame
        };
      };
      const makeEnemy = (hp) => ({
        kind: "enemy",
        id: 100,
        x: 64,
        y: 64,
        w: 14,
        h: 14,
        alive: true,
        hp,
        spawnFlash: 0,
        carrier: false,
        typeIndex: 3,
        score: enemyTypeDefinitions()[3].score
      });
      const makeBullet = (ownerKind, ownerId) => ({
        x: 69,
        y: 69,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: RIGHT,
        speed: 0,
        power: 1,
        ownerKind,
        ownerId,
        ownerKey: `${ownerKind}:${ownerId}`,
        remove: false
      });
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopEnemyDestroyAudio();
        stopPlayerDestroyAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.players = [];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        game.enemyKilled = 0;
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        keys.clear();
        syncMovementAudio();

        const armoredEnemy = makeEnemy(2);
        const armoredBullet = makeBullet("player", 1);
        game.enemies = [armoredEnemy];
        const armoredHitResult = hitTank(armoredBullet);
        const armoredHit = {
          ...state(),
          hit: armoredHitResult,
          bulletRemoved: armoredBullet.remove,
          enemyAlive: armoredEnemy.alive,
          enemyHp: armoredEnemy.hp,
          explosionCount: game.explosions.length
        };
        updateEnemyHitAudio();
        const secondPitch = state();
        updateEnemyHitAudio();
        updateEnemyHitAudio();
        const silentTail = state();

        game.paused = true;
        startPauseAudio();
        syncEnemyHitAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 10; frame += 1) {
          updateEnemyHitAudio();
          updatePauseAudio();
        }
        const paused = state();
        game.paused = false;
        syncEnemyHitAudioNodes();
        syncMovementAudio();
        updateEnemyHitAudio();
        updateEnemyHitAudio();
        const end = state();

        stopPauseAudio();
        stopEnemyHitAudio();
        syncMovementAudio();
        game.explosions = [];
        game.enemyKilled = 0;
        const lethalEnemy = makeEnemy(1);
        const lethalBullet = makeBullet("player", 1);
        game.enemies = [lethalEnemy];
        const lethalHitResult = hitTank(lethalBullet);
        const lethalHit = {
          ...state(),
          hit: lethalHitResult,
          bulletRemoved: lethalBullet.remove,
          enemyAlive: lethalEnemy.alive,
          enemyDestroying: lethalEnemy.destroying,
          enemyHp: lethalEnemy.hp,
          enemyKilled: game.enemyKilled,
          explosionCount: game.explosions.length
        };

        stopEnemyDestroyAudio();

        game.explosions = [];
        game.enemies = [];
        const teammate = createPlayer(2);
        teammate.x = 64;
        teammate.y = 64;
        teammate.spawnFlash = 0;
        teammate.invuln = 0;
        teammate.stun = 0;
        game.players = [teammate];
        const friendlyBullet = makeBullet("player", 1);
        const friendlyHitResult = hitTank(friendlyBullet);
        const friendlyHit = {
          ...state(),
          hit: friendlyHitResult,
          bulletRemoved: friendlyBullet.remove,
          stun: teammate.stun,
          explosionCount: game.explosions.length
        };

        game.explosions = [];
        const targetPlayer = createPlayer(1);
        targetPlayer.x = 64;
        targetPlayer.y = 64;
        targetPlayer.spawnFlash = 0;
        targetPlayer.invuln = 0;
        game.players = [targetPlayer];
        const enemyBullet = makeBullet("enemy", 100);
        const playerHitResult = hitTank(enemyBullet);
        const playerHit = {
          ...state(),
          hit: playerHitResult,
          bulletRemoved: enemyBullet.remove,
          playerAlive: targetPlayer.alive,
          playerDestroying: targetPlayer.destroying,
          playerRespawn: targetPlayer.respawn,
          explosionCount: game.explosions.length
        };
        stopPlayerDestroyAudio();

        stopEnemyHitAudio();
        startEnemyHitAudio();
        startBrickHitAudio();
        startPlayerShootAudio();
        const separateChannels = state();

        stopBrickHitAudio();
        stopPlayerShootAudio();
        stopEnemyHitAudio();
        startEnemyHitAudio();
        startSteelHitAudio();
        const steelPriority = state();
        for (let frame = 0; frame < 5; frame += 1) {
          updateSteelHitAudio();
          updateEnemyHitAudio();
        }
        const steelSuppressedEnd = state();

        stopSteelHitAudio();
        startEnemyHitAudio();
        startStage(game.stage);
        const stageCleanup = state();
        return {
          armoredHit,
          secondPitch,
          silentTail,
          paused,
          end,
          lethalHit,
          friendlyHit,
          playerHit,
          separateChannels,
          steelPriority,
          steelSuppressedEnd,
          stageCleanup
        };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopEnemyDestroyAudio();
        stopPlayerDestroyAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        brickHitAudio.active = previousBrickHit.active;
        brickHitAudio.frame = previousBrickHit.frame;
        steelHitAudio.active = previousSteelHit.active;
        steelHitAudio.frame = previousSteelHit.frame;
        enemyHitAudio.active = previousEnemyHit.active;
        enemyHitAudio.frame = previousEnemyHit.frame;
        enemyDestroyAudio.active = previousEnemyDestroy.active;
        enemyDestroyAudio.frame = previousEnemyDestroy.frame;
        playerDestroyAudio.active = previousPlayerDestroy.active;
        playerDestroyAudio.frame = previousPlayerDestroy.frame;
        playerShootAudio.active = previousPlayerShoot.active;
        playerShootAudio.frame = previousPlayerShoot.frame;
        movementIceAudio.active = previousMovementIce.active;
        movementIceAudio.frame = previousMovementIce.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncEnemyDestroyAudioNodes();
        syncPlayerDestroyAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncMovementAudio();
      }
    },
    debugEnemyDestroyAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.enemyDestroy;
      const frames = [0, 1, 2, 3, 4, 13, 14];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => enemyDestroyAudioPresentation(frame))
      };
    },
    debugEnemyDestroyAudioLifecycleProbe() {
      const previous = { ...game };
      const audioStates = [
        stageStartAudio,
        bonusLifeAudio,
        powerUpPickupAudio,
        powerUpAppearAudio,
        brickHitAudio,
        baseHitAudio,
        steelHitAudio,
        enemyHitAudio,
        enemyDestroyAudio,
        playerDestroyAudio,
        playerShootAudio,
        movementIceAudio,
        pauseAudio,
        scoreCountAudio,
        stageBonusAudio
      ];
      const previousAudio = audioStates.map((audioState) => ({
        active: audioState.active,
        frame: audioState.frame
      }));
      const state = () => {
        const voice = enemyDestroyAudioPresentation(enemyDestroyAudio.frame).voices[0];
        return {
          active: enemyDestroyAudio.active,
          frame: enemyDestroyAudio.frame,
          frequency: voice ? voice.frequency : null,
          gain: voice ? voice.gain : null,
          wave: voice ? voice.wave : null,
          audible: enemyDestroyAudio.active && Boolean(voice) && !game.paused,
          paused: game.paused,
          enemyHitActive: enemyHitAudio.active
        };
      };
      const makeEnemy = (id, spawnFlash) => ({
        kind: "enemy",
        id,
        x: 64 + id * 16,
        y: 64,
        w: 14,
        h: 14,
        alive: true,
        hp: 1,
        spawnFlash: Math.max(0, Math.floor(Number(spawnFlash) || 0)),
        carrier: false,
        typeIndex: 0,
        score: enemyTypeDefinitions()[0].score
      });
      const makeBullet = () => ({
        x: 85,
        y: 69,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: RIGHT,
        speed: 0,
        power: 1,
        ownerKind: "player",
        ownerId: 1,
        ownerKey: "player:1",
        remove: false
      });
      try {
        stopMovementAudio();
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [createPlayer(1)];
        game.enemies = [makeEnemy(1, 0)];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        game.enemyKilled = 0;
        const lethalBullet = makeBullet();
        const lethalHitResult = hitTank(lethalBullet);
        const lethalHit = {
          ...state(),
          hit: lethalHitResult,
          bulletRemoved: lethalBullet.remove,
          enemyAlive: game.enemies[0].alive,
          enemyDestroying: game.enemies[0].destroying,
          enemyKilled: game.enemyKilled,
          explosionCount: game.explosions.length
        };

        updateEnemyDestroyAudio();
        updateEnemyDestroyAudio();
        const secondEnvelope = state();
        updateEnemyDestroyAudio();
        updateEnemyDestroyAudio();
        const tailEnvelope = state();

        game.paused = true;
        startPauseAudio();
        syncEnemyDestroyAudioNodes();
        for (let frame = 0; frame < 10; frame += 1) {
          updateEnemyDestroyAudio();
          updatePauseAudio();
        }
        const paused = state();
        game.paused = false;
        syncEnemyDestroyAudioNodes();
        for (let frame = 0; frame < 9; frame += 1) updateEnemyDestroyAudio();
        const finalFrame = state();
        updateEnemyDestroyAudio();
        const end = state();

        stopPauseAudio();
        stopEnemyDestroyAudio();
        game.players = [createPlayer(1)];
        const grenadeTargets = [makeEnemy(1, 0), makeEnemy(2, 0), makeEnemy(3, 12)];
        game.enemies = grenadeTargets;
        game.enemyKilled = 0;
        game.explosions = [];
        applyPowerUp(game.players[0], "grenade");
        const grenade = {
          ...state(),
          activeEnemies: grenadeTargets.filter((enemy) => enemy.alive && !enemy.destroying && enemy.spawnFlash <= 0).length,
          destroyingEnemies: grenadeTargets.filter((enemy) => enemy.destroying).length,
          spawningAlive: grenadeTargets[2].alive,
          enemyKilled: game.enemyKilled,
          explosionCount: game.explosions.length
        };

        stopEnemyDestroyAudio();
        game.enemies = [makeEnemy(1, 12)];
        game.enemyKilled = 0;
        game.explosions = [];
        applyPowerUp(game.players[0], "grenade");
        const noActiveTargets = {
          ...state(),
          spawningAlive: game.enemies[0].alive,
          enemyKilled: game.enemyKilled,
          explosionCount: game.explosions.length
        };

        startEnemyDestroyAudio();
        startStage(game.stage);
        const stageCleanup = state();

        return { lethalHit, secondEnvelope, tailEnvelope, paused, finalFrame, end, grenade, noActiveTargets, stageCleanup };
      } finally {
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        Object.assign(game, previous);
        audioStates.forEach((audioState, index) => {
          audioState.active = previousAudio[index].active;
          audioState.frame = previousAudio[index].frame;
        });
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncBaseHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncEnemyDestroyAudioNodes();
        syncPlayerDestroyAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncScoreCountAudioNodes();
        syncStageBonusAudioNodes();
        syncMovementAudio();
      }
    },
    debugPlayerDestroyAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.playerDestroy;
      const frames = [0, 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => playerDestroyAudioPresentation(frame))
      };
    },
    debugPlayerDestroyAudioLifecycleProbe() {
      const previous = { ...game };
      const audioStates = [
        stageStartAudio,
        bonusLifeAudio,
        powerUpPickupAudio,
        powerUpAppearAudio,
        brickHitAudio,
        baseHitAudio,
        steelHitAudio,
        enemyHitAudio,
        enemyDestroyAudio,
        playerDestroyAudio,
        playerShootAudio,
        movementIceAudio,
        pauseAudio,
        scoreCountAudio,
        stageBonusAudio
      ];
      const previousAudio = audioStates.map((audioState) => ({
        active: audioState.active,
        frame: audioState.frame
      }));
      const state = () => {
        const voice = playerDestroyAudioPresentation(playerDestroyAudio.frame).voices[0];
        const enemyVoice = enemyDestroyAudioPresentation(enemyDestroyAudio.frame).voices[0];
        return {
          active: playerDestroyAudio.active,
          frame: playerDestroyAudio.frame,
          frequency: voice ? voice.frequency : null,
          gain: voice ? voice.gain : null,
          wave: voice ? voice.wave : null,
          audible: playerDestroyAudio.active && Boolean(voice) && !game.paused,
          paused: game.paused,
          baseHitActive: baseHitAudio.active,
          baseHitFrame: baseHitAudio.frame,
          baseHitAudible: baseHitAudio.active && baseHitAudioAudible() && !game.paused,
          enemyDestroyActive: enemyDestroyAudio.active,
          enemyDestroyFrame: enemyDestroyAudio.frame,
          enemyDestroyAudible: enemyDestroyAudio.active && Boolean(enemyVoice) && enemyDestroyAudioAudible() && !game.paused,
          baseDestroyTimer: game.baseDestroyTimer,
          screen: game.screen
        };
      };
      const makePlayer = (invuln) => {
        const player = createPlayer(1);
        player.x = 64;
        player.y = 64;
        player.alive = true;
        player.lives = 2;
        player.level = 3;
        player.respawn = 0;
        player.spawnFlash = 0;
        player.invuln = Math.max(0, Math.floor(Number(invuln) || 0));
        return player;
      };
      const makeEnemyBullet = (x, y) => ({
        x,
        y,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: DOWN,
        speed: 0,
        power: 1,
        ownerKind: "enemy",
        ownerId: 100,
        ownerKey: "enemy:100",
        remove: false
      });
      try {
        stopMovementAudio();
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.baseDestroyTimer = 0;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        const player = makePlayer(0);
        game.players = [player];
        const lethalBullet = makeEnemyBullet(player.x + 5, player.y + 5);
        const lethalHitResult = hitTank(lethalBullet);
        const playerHit = {
          ...state(),
          hit: lethalHitResult,
          bulletRemoved: lethalBullet.remove,
          playerAlive: player.alive,
          playerDestroying: player.destroying,
          playerRespawn: player.respawn,
          playerLevel: player.level,
          explosionCount: game.explosions.length
        };

        for (let frame = 0; frame < 4; frame += 1) updatePlayerDestroyAudio();
        const volume14 = state();
        for (let frame = 0; frame < 4; frame += 1) updatePlayerDestroyAudio();
        const volume13 = state();

        game.paused = true;
        startPauseAudio();
        syncPlayerDestroyAudioNodes();
        for (let frame = 0; frame < 10; frame += 1) {
          updatePlayerDestroyAudio();
          updatePauseAudio();
        }
        const paused = state();
        game.paused = false;
        syncPlayerDestroyAudioNodes();
        for (let frame = 0; frame < 17; frame += 1) updatePlayerDestroyAudio();
        const finalFrame = state();
        updatePlayerDestroyAudio();
        const end = state();

        stopPauseAudio();
        stopPlayerDestroyAudio();
        game.players = [makePlayer(1)];
        game.explosions = [];
        const shieldedBullet = makeEnemyBullet(game.players[0].x + 5, game.players[0].y + 5);
        const shieldedHitResult = hitTank(shieldedBullet);
        const shielded = {
          ...state(),
          hit: shieldedHitResult,
          bulletRemoved: shieldedBullet.remove,
          playerAlive: game.players[0].alive,
          explosionCount: game.explosions.length
        };

        stopPlayerDestroyAudio();
        game.screen = "playing";
        game.players = [makePlayer(0)];
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.explosions = [];
        const baseBullet = makeEnemyBullet(game.base.x + 5, game.base.y + 5);
        resolveBullet(baseBullet);
        const baseHit = {
          ...state(),
          baseAlive: game.base.alive,
          bulletRemoved: baseBullet.remove,
          explosionCount: game.explosions.length
        };
        update();
        const gameOverContinuation = state();
        stopBaseHitAudio();

        stopPlayerDestroyAudio();
        stopEnemyDestroyAudio();
        game.screen = "playing";
        game.paused = false;
        startEnemyDestroyAudio();
        for (let frame = 0; frame < 3; frame += 1) updateEnemyDestroyAudio();
        const enemyBeforePriority = state();
        startPlayerDestroyAudio();
        const playerPriority = state();
        for (let frame = 0; frame < 10; frame += 1) {
          updateEnemyDestroyAudio();
          updatePlayerDestroyAudio();
        }
        const simultaneousProgress = state();
        updateEnemyDestroyAudio();
        updatePlayerDestroyAudio();
        const enemySuppressedEnd = state();

        startPlayerDestroyAudio();
        startStage(game.stage);
        const stageCleanup = state();

        return {
          playerHit,
          volume14,
          volume13,
          paused,
          finalFrame,
          end,
          shielded,
          baseHit,
          gameOverContinuation,
          enemyBeforePriority,
          playerPriority,
          simultaneousProgress,
          enemySuppressedEnd,
          stageCleanup
        };
      } finally {
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        Object.assign(game, previous);
        audioStates.forEach((audioState, index) => {
          audioState.active = previousAudio[index].active;
          audioState.frame = previousAudio[index].frame;
        });
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncBaseHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncEnemyDestroyAudioNodes();
        syncPlayerDestroyAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncScoreCountAudioNodes();
        syncStageBonusAudioNodes();
        syncMovementAudio();
      }
    },
    debugBaseHitAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.baseHit;
      const frames = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => baseHitAudioPresentation(frame))
      };
    },
    debugBaseHitAudioLifecycleProbe() {
      const previous = { ...game };
      const audioStates = [
        stageStartAudio,
        bonusLifeAudio,
        powerUpPickupAudio,
        powerUpAppearAudio,
        brickHitAudio,
        baseHitAudio,
        steelHitAudio,
        enemyHitAudio,
        enemyDestroyAudio,
        playerDestroyAudio,
        playerShootAudio,
        movementIceAudio,
        pauseAudio,
        scoreCountAudio,
        stageBonusAudio
      ];
      const previousAudio = audioStates.map((audioState) => ({
        active: audioState.active,
        frame: audioState.frame
      }));
      const state = () => {
        const voice = baseHitAudioPresentation(baseHitAudio.frame).voices[0];
        return {
          active: baseHitAudio.active,
          frame: baseHitAudio.frame,
          frequency: voice ? voice.frequency : null,
          audible: baseHitAudio.active && Boolean(voice) && baseHitAudioAudible() && !game.paused,
          paused: game.paused,
          playerDestroyActive: playerDestroyAudio.active,
          playerDestroyFrame: playerDestroyAudio.frame,
          powerUpAppearActive: powerUpAppearAudio.active,
          powerUpAppearFrame: powerUpAppearAudio.frame,
          steelHitActive: steelHitAudio.active,
          steelHitFrame: steelHitAudio.frame,
          steelHitAudible: steelHitAudio.active && steelHitAudioAudible(),
          enemyHitActive: enemyHitAudio.active,
          enemyHitFrame: enemyHitAudio.frame,
          enemyHitAudible: enemyHitAudio.active && enemyHitAudioAudible(),
          movementAudioMode: movementAudio.mode,
          baseDestroyTimer: game.baseDestroyTimer,
          screen: game.screen
        };
      };
      const makePlayer = () => {
        const player = createPlayer(1);
        player.spawnFlash = 0;
        player.invuln = 0;
        return player;
      };
      const makeBaseBullet = () => ({
        x: 6 * TILE + 5,
        y: 12 * TILE + 5,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: DOWN,
        speed: 0,
        power: 1,
        ownerKind: "enemy",
        ownerId: 100,
        ownerKey: "enemy:100",
        remove: false
      });
      try {
        stopMovementAudio();
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.baseDestroyTimer = 0;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [makePlayer()];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        const baseBullet = makeBaseBullet();
        const baseHitResult = hitBase(baseBullet);
        const triggered = {
          ...state(),
          hit: baseHitResult,
          baseAlive: game.base.alive,
          bulletRemoved: baseBullet.remove,
          explosionCount: game.explosions.length
        };
        update();
        const gameOverContinuation = state();
        for (let frame = 0; frame < 25; frame += 1) update();
        const finalFrame = state();
        update();
        const end = state();

        stopBaseHitAudio();
        stopPlayerDestroyAudio();
        stopSteelHitAudio();
        stopEnemyHitAudio();
        game.screen = "playing";
        game.paused = false;
        startSteelHitAudio();
        startEnemyHitAudio();
        startBaseHitAudio();
        const lowerPriority = state();
        for (let frame = 0; frame < 4; frame += 1) {
          updateBaseHitAudio();
          updateSteelHitAudio();
          updateEnemyHitAudio();
        }
        const lowerPriorityProgress = state();
        updateBaseHitAudio();
        updateEnemyHitAudio();
        const lowerPriorityEnd = state();

        stopBaseHitAudio();
        game.paused = false;
        startBaseHitAudio();
        game.paused = true;
        syncBaseHitAudioNodes();
        for (let frame = 0; frame < 10; frame += 1) updateBaseHitAudio();
        const paused = state();
        game.paused = false;
        syncBaseHitAudioNodes();
        const resumed = state();

        stopBaseHitAudio();
        stopPowerUpAppearAudio();
        startBaseHitAudio();
        startPowerUpAppearAudio();
        const appearancePriority = state();
        for (let frame = 0; frame < 26; frame += 1) {
          updateBaseHitAudio();
          updatePowerUpAppearAudio();
        }
        const appearanceMaskedFinalFrame = state();
        updateBaseHitAudio();
        updatePowerUpAppearAudio();
        const appearanceMaskedEnd = state();

        stopPowerUpAppearAudio();
        startBaseHitAudio();
        startStage(game.stage);
        const stageCleanup = state();

        return {
          triggered,
          gameOverContinuation,
          finalFrame,
          end,
          lowerPriority,
          lowerPriorityProgress,
          lowerPriorityEnd,
          paused,
          resumed,
          appearancePriority,
          appearanceMaskedFinalFrame,
          appearanceMaskedEnd,
          stageCleanup
        };
      } finally {
        for (const audioState of audioStates) stopFixedFrameAudio(audioState);
        Object.assign(game, previous);
        audioStates.forEach((audioState, index) => {
          audioState.active = previousAudio[index].active;
          audioState.frame = previousAudio[index].frame;
        });
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncBaseHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncEnemyDestroyAudioNodes();
        syncPlayerDestroyAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncScoreCountAudioNodes();
        syncStageBonusAudioNodes();
        syncMovementAudio();
      }
    },
    debugPlayerShootAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.playerShoot;
      const frames = [0, 14, 15];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => playerShootAudioPresentation(frame))
      };
    },
    debugPlayerShootAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
      const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
      const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
      const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
      const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
      const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
      const state = () => ({
        active: playerShootAudio.active,
        frame: playerShootAudio.frame,
        paused: game.paused,
        audible: playerShootAudio.active && playerShootAudioAudible(),
        iceActive: movementIceAudio.active,
        iceFrame: movementIceAudio.frame,
        iceAudible: movementIceAudio.active && movementIceAudioAudible()
      });
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        const player = createPlayer(1);
        player.x = 32;
        player.y = 32;
        player.dir = RIGHT;
        player.spawnFlash = 0;
        player.invuln = 0;
        player.respawn = 0;
        player.reload = 0;
        const enemyType = enemyTypeDefinitions()[0];
        const enemy = {
          kind: "enemy",
          id: 100,
          x: 64,
          y: 32,
          w: 14,
          h: 14,
          dir: LEFT,
          alive: true,
          spawnFlash: 0,
          reload: 0,
          reloadBase: enemyType.reload,
          bulletSpeed: enemyType.bullet,
          bulletPower: enemyType.wallPower
        };
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.players = [player];
        game.enemies = [enemy];
        game.bullets = [];
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        keys.clear();

        shoot(player);
        const playerStart = { ...state(), bulletCount: game.bullets.length };
        for (let frame = 0; frame < 5; frame += 1) updatePlayerShootAudio();
        player.reload = 0;
        shoot(player);
        const failedRetrigger = { ...state(), bulletCount: game.bullets.length };
        for (let frame = 0; frame < 9; frame += 1) updatePlayerShootAudio();
        const beforePause = state();
        game.paused = true;
        syncPlayerShootAudioNodes();
        for (let frame = 0; frame < 10; frame += 1) updatePlayerShootAudio();
        const paused = state();
        game.paused = false;
        syncPlayerShootAudioNodes();
        updatePlayerShootAudio();
        const end = state();

        stopPlayerShootAudio();
        game.bullets = [];
        shoot(enemy);
        const enemyShot = { ...state(), bulletCount: game.bullets.length };

        game.bullets = [];
        player.reload = 0;
        shoot(player);
        startMovementIceAudio();
        const shotPriority = state();
        for (let frame = 0; frame < 4; frame += 1) {
          updatePlayerShootAudio();
          updateMovementIceAudio();
        }
        const iceSuppressedEnd = state();

        stopPlayerShootAudio();
        player.reload = 0;
        game.bullets = [];
        shoot(player);
        startStageStartAudio();
        syncPlayerShootAudioNodes();
        const stageStartPriority = state();
        for (let frame = 0; frame < 15; frame += 1) updatePlayerShootAudio();
        const stageStartSuppressedEnd = state();

        stopStageStartAudio();
        player.reload = 0;
        game.bullets = [];
        shoot(player);
        startBonusLifeAudio();
        const bonusLifePriority = state();
        for (let frame = 0; frame < 15; frame += 1) updatePlayerShootAudio();
        const bonusLifeSuppressedEnd = state();

        stopBonusLifeAudio();
        player.reload = 0;
        game.bullets = [];
        shoot(player);
        startStage(game.stage);
        const stageCleanup = state();
        return {
          playerStart,
          failedRetrigger,
          beforePause,
          paused,
          end,
          enemyShot,
          shotPriority,
          iceSuppressedEnd,
          stageStartPriority,
          stageStartSuppressedEnd,
          bonusLifePriority,
          bonusLifeSuppressedEnd,
          stageCleanup
        };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        brickHitAudio.active = previousBrickHit.active;
        brickHitAudio.frame = previousBrickHit.frame;
        steelHitAudio.active = previousSteelHit.active;
        steelHitAudio.frame = previousSteelHit.frame;
        enemyHitAudio.active = previousEnemyHit.active;
        enemyHitAudio.frame = previousEnemyHit.frame;
        playerShootAudio.active = previousPlayerShoot.active;
        playerShootAudio.frame = previousPlayerShoot.frame;
        movementIceAudio.active = previousMovementIce.active;
        movementIceAudio.frame = previousMovementIce.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncMovementAudio();
      }
    },
    debugMovementIceAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
      const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
      const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
      const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
      const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
      const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
      const state = () => ({
        active: movementIceAudio.active,
        frame: movementIceAudio.frame,
        paused: game.paused,
        audible: movementIceAudio.active && movementIceAudioAudible(),
        movementAudioMode: movementAudio.mode
      });
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        const player = createPlayer(1);
        player.x = 32;
        player.y = 32;
        player.dir = RIGHT;
        player.spawnFlash = 0;
        player.invuln = 0;
        player.respawn = 0;
        player.slide = 0;
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.players = [player];
        game.enemies = [];
        game.grid = Array.from(
          { length: GRID },
          () => Array.from({ length: GRID }, () => makeCell(ICE, 0))
        );
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        keys.clear();
        syncMovementAudio();

        updatePlayerMovement(player, RIGHT);
        const start = state();
        for (let frame = 0; frame < 3; frame += 1) updateMovementIceAudio();
        const beforePause = state();
        game.paused = true;
        syncMovementIceAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 10; frame += 1) updateMovementIceAudio();
        const paused = state();
        game.paused = false;
        syncMovementIceAudioNodes();
        syncMovementAudio();
        updateMovementIceAudio();
        const end = state();

        player.slide = 0;
        updatePlayerMovement(player, RIGHT);
        const retriggered = state();
        startStageStartAudio();
        syncMovementIceAudioNodes();
        const stageStartPriority = state();
        for (let frame = 0; frame < 4; frame += 1) updateMovementIceAudio();
        const stageStartSuppressedEnd = state();

        stopStageStartAudio();
        startMovementIceAudio();
        startBonusLifeAudio();
        const bonusLifePriority = state();
        for (let frame = 0; frame < 4; frame += 1) updateMovementIceAudio();
        const bonusLifeSuppressedEnd = state();

        stopBonusLifeAudio();
        startMovementIceAudio();
        startStage(game.stage);
        const stageCleanup = state();
        return {
          start,
          beforePause,
          paused,
          end,
          retriggered,
          stageStartPriority,
          stageStartSuppressedEnd,
          bonusLifePriority,
          bonusLifeSuppressedEnd,
          stageCleanup
        };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopBrickHitAudio();
        stopEnemyHitAudio();
        stopSteelHitAudio();
        stopPlayerShootAudio();
        stopMovementIceAudio();
        stopPauseAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        brickHitAudio.active = previousBrickHit.active;
        brickHitAudio.frame = previousBrickHit.frame;
        steelHitAudio.active = previousSteelHit.active;
        steelHitAudio.frame = previousSteelHit.frame;
        enemyHitAudio.active = previousEnemyHit.active;
        enemyHitAudio.frame = previousEnemyHit.frame;
        playerShootAudio.active = previousPlayerShoot.active;
        playerShootAudio.frame = previousPlayerShoot.frame;
        movementIceAudio.active = previousMovementIce.active;
        movementIceAudio.frame = previousMovementIce.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncBrickHitAudioNodes();
        syncSteelHitAudioNodes();
        syncEnemyHitAudioNodes();
        syncPlayerShootAudioNodes();
        syncMovementIceAudioNodes();
        syncPauseAudioNodes();
        syncMovementAudio();
      }
    },
    debugStageStartAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.stageStart;
      const frames = [0, 7, 8, 47, 48, 94, 95, 263, 264];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => stageStartAudioPresentation(frame))
      };
    },
    debugBonusLifeAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.bonusLife;
      const frames = [0, 1, 2, 5, 6, 41, 42, 53, 54, 59, 60];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => bonusLifeAudioPresentation(frame))
      };
    },
    debugPowerUpPickupAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.powerUp;
      const frames = [0, 2, 3, 35, 36, 38, 39];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => powerUpPickupAudioPresentation(frame))
      };
    },
    debugPowerUpAppearAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.powerUpAppear;
      const frames = [0, 3, 4, 7, 8, 27, 28, 31, 32];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => powerUpAppearAudioPresentation(frame))
      };
    },
    debugPowerUpAppearAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
      const state = () => ({
        active: powerUpAppearAudio.active,
        frame: powerUpAppearAudio.frame,
        paused: game.paused,
        audible: powerUpAppearAudioAudible(),
        movementAudioMode: movementAudio.mode,
        powerUpType: game.powerUp ? game.powerUp.type : null,
        powerUp: game.powerUp ? { ...game.powerUp } : null
      });
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopPauseAudio();
        const player = createPlayer(1);
        player.spawnFlash = 0;
        player.respawn = 0;
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.pauseElapsed = 0;
        game.tick = 25;
        game.clearPendingTimer = 0;
        game.players = [player];
        game.enemies = [];
        game.enemySpawned = 0;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.powerUp = null;
        game.lastPowerUpSpawn = null;
        keys.clear();

        const carrier = { carrier: true, powerUpType: "star" };
        releaseCarrierPowerUp(carrier);
        const spawned = !carrier.carrier && Boolean(game.powerUp) && game.powerUp.type === "star";
        const start = state();
        for (let frame = 0; frame < 15; frame += 1) updatePowerUpAppearAudio();
        const beforePause = state();
        game.paused = true;
        syncPowerUpAppearAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 10; frame += 1) updatePowerUpAppearAudio();
        const paused = state();
        game.paused = false;
        syncPowerUpAppearAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 16; frame += 1) updatePowerUpAppearAudio();
        const beforeEnd = state();
        updatePowerUpAppearAudio();
        const end = state();

        spawnPowerUp("helmet");
        stageStartAudio.active = true;
        const stageStartPriority = state();
        stageStartAudio.active = false;
        bonusLifeAudio.active = true;
        bonusLifeAudio.frame = 0;
        const bonusLifePriority = state();
        bonusLifeAudio.active = false;
        startPowerUpPickupAudio();
        const pickupPriority = state();
        for (let frame = 0; frame < 32; frame += 1) {
          updatePowerUpPickupAudio();
          updatePowerUpAppearAudio();
        }
        const suppressedEnd = {
          ...state(),
          pickupActive: powerUpPickupAudio.active,
          pickupFrame: powerUpPickupAudio.frame
        };

        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        game.powerUp = null;
        game.base.alive = false;
        for (let r = 0; r < GRID; r += 1) {
          for (let c = 0; c < GRID; c += 1) setTile(game.grid, c, r, STEEL, 15);
        }
        const noSpotSpawned = spawnPowerUp("timer");
        const noSpot = state();

        return {
          spawned,
          start,
          beforePause,
          paused,
          beforeEnd,
          end,
          stageStartPriority,
          bonusLifePriority,
          pickupPriority,
          suppressedEnd,
          noSpotSpawned,
          noSpot
        };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopPauseAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncEnemyHitAudioNodes();
        syncPauseAudioNodes();
        syncMovementAudio();
      }
    },
    debugPauseAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.pause;
      const frames = [0, 3, 4, 7, 8, 23, 24, 35, 36];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => pauseAudioPresentation(frame))
      };
    },
    debugPauseAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
      const state = () => ({
        paused: game.paused,
        pauseElapsed: game.pauseElapsed,
        tick: game.tick,
        active: pauseAudio.active,
        frame: pauseAudio.frame,
        stageStartFrame: stageStartAudio.frame,
        bonusLifeFrame: bonusLifeAudio.frame,
        powerUpPickupFrame: powerUpPickupAudio.frame,
        powerUpAppearFrame: powerUpAppearAudio.frame,
        stageStartAudibility: stageStartAudioAudibility(),
        bonusLifeAudibility: bonusLifeAudioAudibility(),
        powerUpPickupAudible: powerUpPickupAudioAudible(),
        powerUpAppearAudible: powerUpAppearAudioAudible(),
        movementAudioMode: movementAudio.mode
      });
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopPauseAudio();
        const player = createPlayer(1);
        player.spawnFlash = 0;
        player.respawn = 0;
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.pauseElapsed = 0;
        game.tick = 25;
        game.clearPendingTimer = 0;
        game.players = [player];
        game.enemies = [];
        game.enemySpawned = 0;
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        keys.clear();

        startStageStartAudio();
        startBonusLifeAudio();
        startPowerUpPickupAudio();
        startPowerUpAppearAudio();
        const entered = togglePause();
        const entry = state();
        for (let frame = 0; frame < 10; frame += 1) update();
        const paused = state();
        const exitedEarly = togglePause();
        const earlyResume = state();
        const reentered = togglePause();
        const restart = state();

        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        for (let frame = 0; frame < 35; frame += 1) update();
        const finalPausedFrame = state();
        const exitedBeforeEnd = togglePause();
        const finalActiveFrame = state();
        update();
        const ended = state();

        return {
          entered,
          exitedEarly,
          reentered,
          exitedBeforeEnd,
          entry,
          paused,
          earlyResume,
          restart,
          finalPausedFrame,
          finalActiveFrame,
          ended
        };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        stopPauseAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        pauseAudio.active = previousPause.active;
        pauseAudio.frame = previousPause.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncEnemyHitAudioNodes();
        syncPauseAudioNodes();
        syncMovementAudio();
      }
    },
    debugPowerUpPickupAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const state = () => ({
        active: powerUpPickupAudio.active,
        frame: powerUpPickupAudio.frame,
        paused: game.paused,
        audible: powerUpPickupAudioAudible(),
        movementAudioMode: movementAudio.mode
      });
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        const player = createPlayer(1);
        player.spawnFlash = 0;
        player.respawn = 0;
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.players = [player];
        game.enemies = [];
        keys.clear();

        startPowerUpPickupAudio();
        const start = state();
        for (let frame = 0; frame < 38; frame += 1) updatePowerUpPickupAudio();
        const beforePause = state();
        game.paused = true;
        syncPowerUpPickupAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 10; frame += 1) updatePowerUpPickupAudio();
        const paused = state();
        game.paused = false;
        syncPowerUpPickupAudioNodes();
        syncMovementAudio();
        updatePowerUpPickupAudio();
        const end = state();

        startPowerUpPickupAudio();
        startBonusLifeAudio();
        const suppressedStart = state();
        for (let frame = 0; frame < 39; frame += 1) {
          updateBonusLifeAudio();
          updatePowerUpPickupAudio();
        }
        const suppressedEnd = {
          ...state(),
          bonusLifeActive: bonusLifeAudio.active,
          bonusLifeFrame: bonusLifeAudio.frame
        };
        return { start, beforePause, paused, end, suppressedStart, suppressedEnd };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpPickupAudio();
        stopPowerUpAppearAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpPickupAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncEnemyHitAudioNodes();
        syncMovementAudio();
      }
    },
    debugBonusLifeAudioLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
      const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
      const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
      const state = () => ({
        active: bonusLifeAudio.active,
        frame: bonusLifeAudio.frame,
        paused: game.paused,
        pulse2Active: bonusLifePulse2Active(),
        movementAudioMode: movementAudio.mode
      });
      try {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpAppearAudio();
        const player = createPlayer(1);
        player.spawnFlash = 0;
        player.respawn = 0;
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.clearPendingTimer = 0;
        game.players = [player];
        game.enemies = [];
        keys.clear();

        startBonusLifeAudio();
        const start = state();
        for (let frame = 0; frame < 53; frame += 1) updateBonusLifeAudio();
        const beforePulse2End = state();
        updateBonusLifeAudio();
        const pulse2End = state();

        game.paused = true;
        syncBonusLifeAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 10; frame += 1) updateBonusLifeAudio();
        const paused = state();

        game.paused = false;
        syncBonusLifeAudioNodes();
        syncMovementAudio();
        for (let frame = 0; frame < 5; frame += 1) updateBonusLifeAudio();
        const beforeEnd = state();
        updateBonusLifeAudio();
        const end = state();
        return { start, beforePulse2End, pulse2End, paused, beforeEnd, end };
      } finally {
        stopMovementAudio();
        stopStageStartAudio();
        stopBonusLifeAudio();
        stopPowerUpAppearAudio();
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        stageStartAudio.active = previousStageStart.active;
        stageStartAudio.frame = previousStageStart.frame;
        bonusLifeAudio.active = previousBonusLife.active;
        bonusLifeAudio.frame = previousBonusLife.frame;
        powerUpAppearAudio.active = previousPowerUpAppear.active;
        powerUpAppearAudio.frame = previousPowerUpAppear.frame;
        syncStageStartAudioNodes();
        syncBonusLifeAudioNodes();
        syncPowerUpAppearAudioNodes();
        syncEnemyHitAudioNodes();
        syncMovementAudio();
      }
    },
    spriteManifest() {
      return cloneSpriteManifest();
    },
    currentPackInfo() {
      return {
        id: game.stagePack.id || "built-in",
        totalStages: stageCount(),
        stageCycleLimit: stageCycleLimit(),
        mapDataStage: mapDataStage(game.stage),
        enemyDataStage: enemyDataStage(game.stage),
        enemyTotal: enemyTotal(),
        maxActiveEnemies: maxActiveEnemies(),
        initialLives: gameSettings().initialLives,
        bonusLifeScores: gameSettings().bonusLifeScores.slice(),
        deathPowerLevel: gameSettings().deathPowerLevel,
        powerUpDurations: { ...gameSettings().powerUpDurations },
        powerUpRules: { ...gameSettings().powerUpRules },
        timings: { ...gameSettings().timings },
        enemySpawnPacing: { ...gameSettings().enemySpawnPacing },
        playerMovement: clonePlayerMovementSettings(gameSettings().playerMovement),
        projectileRules: { ...gameSettings().projectileRules },
        friendlyFire: { ...gameSettings().friendlyFire },
        explosionRules: cloneExplosionRules(gameSettings().explosionRules),
        stageAdvance: { ...gameSettings().stageAdvance },
        stageClearBonus: { ...gameSettings().stageClearBonus },
        enemyAi: { ...gameSettings().enemyAi },
        timerFreezesEnemyTime: gameSettings().timerFreezesEnemyTime,
        enemyTypes: cloneEnemyTypes(enemyTypeDefinitions()),
        playerUpgradeRules: clonePlayerUpgradeRules(gameSettings().playerUpgradeRules),
        wallRules: cloneWallRules(),
        playerSpawns: currentPlayerSpawns(),
        enemySpawns: currentEnemySpawns(),
        powerUpSpawns: currentPowerUpSpawns(),
        enemySequence: enemySequenceForStage(game.stage),
        stage: game.stage
      };
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
    debugTitleScoreLayoutProbe(menuIndex) {
      return titleScoreLayout(menuIndex).map((item) => ({ ...item }));
    },
    debugFrameCounterProbe() {
      const previous = { ...game };
      const snapshot = () => ({ frameLow: game.frameLow, frameHigh: game.frameHigh });
      const advance = (frames) => {
        for (let frame = 0; frame < frames; frame += 1) advanceFrameCounters();
        return snapshot();
      };
      try {
        resetFrameCounters();
        const initial = snapshot();
        const frame63 = advance(63);
        const frame64 = advance(1);
        const frame128 = advance(64);
        const frame192 = advance(64);
        const frame256 = advance(64);

        game.frameLow = 0xab;
        game.frameHigh = 0x05;
        resetFrameCounterHigh();
        const highReset = snapshot();
        const nextQuarterBoundary = advance(0x15);

        game.frameLow = 0xab;
        game.frameHigh = 0x05;
        resetFrameCounterLow();
        const lowReset = snapshot();

        game.frameLow = 0;
        game.frameHigh = EXTENDED_STAGE_END_FRAME_HIGH;
        const extendedStageEndStart = snapshot();
        const extendedStageEndFinish = advance(PLAYER_GAME_OVER_STAGE_END_DELAY);

        game.screen = "playing";
        game.demoMode = false;
        game.paused = true;
        game.pauseElapsed = 0;
        game.tick = 31;
        game.frameLow = 0x3f;
        game.frameHigh = 0x07;
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [{ alive: true, lives: 1, respawn: 0 }];
        game.enemies = [];
        game.enemySpawned = 0;
        game.clearPendingTimer = 0;
        game.scorePopups = [];
        update();
        const paused = {
          ...snapshot(),
          tick: game.tick,
          pauseElapsed: game.pauseElapsed
        };

        game.screen = "stageIntro";
        game.transitionTimer = 1;
        game.paused = false;
        game.frameLow = 0x3f;
        game.frameHigh = 0x09;
        update();
        const stageActivation = {
          ...snapshot(),
          screen: game.screen
        };

        return {
          initial,
          frame63,
          frame64,
          frame128,
          frame192,
          frame256,
          highReset,
          nextQuarterBoundary,
          lowReset,
          extendedStageEndStart,
          extendedStageEndFinish,
          paused,
          stageActivation
        };
      } finally {
        Object.assign(game, previous);
        syncMovementAudio();
      }
    },
    debugStageSelectInputCadenceProbe() {
      const previous = { ...game };
      const previousKeys = Array.from(keys);
      const previousPresses = Array.from(pendingStageSelectPresses);
      const snapshot = () => ({ stage: game.stage, frameLow: game.frameLow, frameHigh: game.frameHigh });
      const step = () => {
        advanceFrameCounters();
        updateStageSelectControls();
      };
      try {
        keys.clear();
        pendingStageSelectPresses.clear();
        game.screen = "stageSelect";
        game.stage = 10;
        game.frameLow = 5;
        game.frameHigh = 0x22;

        keys.add("Space");
        pendingStageSelectPresses.add("Space");
        step();
        const initialPress = snapshot();
        for (let frame = 0; frame < 7; frame += 1) step();
        const beforeHeldRepeat = snapshot();
        step();
        const heldRepeat = snapshot();

        keys.clear();
        game.stage = stageSelectLimit();
        game.frameLow = 3;
        game.frameHigh = 0x22;
        pendingStageSelectPresses.add("Space");
        step();
        const upperBoundary = snapshot();

        game.stage = 1;
        game.frameLow = 3;
        game.frameHigh = 0x22;
        pendingStageSelectPresses.add("KeyF");
        step();
        const lowerBoundary = snapshot();

        game.stage = 20;
        game.frameLow = 6;
        game.frameHigh = 0x22;
        keys.add("Space");
        step();
        const heldBeforeBoundary = snapshot();
        step();
        const heldAtBoundary = snapshot();

        keys.clear();
        game.stage = 20;
        game.frameLow = 4;
        game.frameHigh = 0x22;
        pendingStageSelectPresses.add("Space");
        pendingStageSelectPresses.add("KeyF");
        step();
        const simultaneousPress = snapshot();

        keys.clear();
        keys.add("Space");
        game.stage = 20;
        game.frameLow = 7;
        game.frameHigh = 0x22;
        pendingStageSelectPresses.add("KeyF");
        step();
        const heldAPriority = snapshot();

        game.stage = 20;
        game.frameLow = 6;
        game.frameHigh = 0x22;
        pendingStageSelectPresses.add("KeyF");
        step();
        const freshBOutsideARepeat = snapshot();

        return {
          initialPress,
          beforeHeldRepeat,
          heldRepeat,
          upperBoundary,
          lowerBoundary,
          heldBeforeBoundary,
          heldAtBoundary,
          simultaneousPress,
          heldAPriority,
          freshBOutsideARepeat
        };
      } finally {
        Object.assign(game, previous);
        keys.clear();
        for (const code of previousKeys) keys.add(code);
        pendingStageSelectPresses.clear();
        for (const code of previousPresses) pendingStageSelectPresses.add(code);
      }
    },
    debugTitleDemoLifecycleProbe() {
      const previous = { ...game };
      try {
        game.screen = "title";
        game.stage = 1;
        game.titleIdleFrames = 0;
        resetFrameCounters();
        game.demoMode = false;
        game.constructionUsed = false;
        clearTransientBattleState();
        game.screen = "title";

        game.frameLow = 0xab;
        game.frameHigh = 0x05;
        game.titleIdleFrames = 0x05ab;
        resetTitleIdleHighByte();
        const selectionReset = {
          idleFrames: game.titleIdleFrames,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh
        };
        resetFrameCounters();
        game.titleIdleFrames = 0;

        for (let frame = 0; frame < TITLE_DEMO_IDLE_FRAMES - 1; frame += 1) update();
        const beforeTimeout = {
          screen: game.screen,
          idleFrames: game.titleIdleFrames,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh,
          demoMode: game.demoMode
        };
        update();
        const afterTimeout = {
          screen: game.screen,
          stage: game.stage,
          playerCount: game.playerCount,
          playerIds: game.players.map((player) => player.id),
          maxActiveEnemies: maxActiveEnemies(),
          transitionTimer: game.transitionTimer,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh,
          demoMode: game.demoMode
        };

        const player1 = game.players[0];
        const player2 = game.players[1];
        player1.spawnFlash = 0;
        player2.spawnFlash = 0;
        player1.x = 80;
        player1.y = 160;
        player2.x = 112;
        player2.y = 160;
        game.enemies = [
          { id: 202, slotIndex: 2, alive: true, spawnFlash: 0, x: 32, y: 32, w: 14, h: 14 },
          { id: 203, slotIndex: 3, alive: true, spawnFlash: 0, x: 160, y: 32, w: 14, h: 14 },
          { id: 204, slotIndex: 4, alive: true, spawnFlash: 0, x: 96, y: 48, w: 14, h: 14 }
        ];
        game.powerUp = null;
        const enemyTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
        game.frameHigh = 2;
        const axisPhaseTwoTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
        game.powerUp = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
        const powerUpTarget = demoControlForPlayer(player1);

        player1.score = 0;
        player1.stagePoints = 0;
        player1.level = 0;
        player1.stageKills = Array(enemyTypeDefinitions().length).fill(0);
        game.scorePopups = [];
        applyPowerUp(player1, "star");
        const scoredEnemy = {
          id: 299,
          alive: true,
          score: 400,
          typeIndex: 3,
          x: 80,
          y: 80,
          w: 14,
          h: 14
        };
        destroyEnemy(scoredEnemy, player1.id);
        const scoreIsolation = {
          score: player1.score,
          stagePoints: player1.stagePoints,
          stageKills: player1.stageKills.slice(),
          level: player1.level,
          scorePopupCount: game.scorePopups.length
        };

        endTitleDemo();
        const afterExit = {
          screen: game.screen,
          stage: game.stage,
          demoMode: game.demoMode,
          playerCount: game.players.length,
          idleFrames: game.titleIdleFrames
        };

        game.constructionUsed = true;
        game.frameLow = 0x3f;
        game.frameHigh = 0x09;
        game.titleIdleFrames = TITLE_DEMO_IDLE_FRAMES - 1;
        update();
        const afterConstruction = {
          screen: game.screen,
          idleFrames: game.titleIdleFrames,
          frameLow: game.frameLow,
          frameHigh: game.frameHigh,
          demoMode: game.demoMode
        };
        return {
          timeoutFrames: TITLE_DEMO_IDLE_FRAMES,
          displayStage: DEMO_DISPLAY_STAGE,
          selectionReset,
          beforeTimeout,
          afterTimeout,
          enemyTargets,
          axisPhaseTwoTargets,
          powerUpTarget,
          scoreIsolation,
          afterExit,
          afterConstruction
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugHiddenMessageLifecycleProbe() {
      const previous = { ...game };
      const previousKeys = new Set(keys);
      try {
        game.screen = "editor";
        game.titleMenu = 2;
        game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS - 1;
        game.constructionUsed = true;
        game.hiddenInputCount = 0;
        if (!game.editorGrid) game.editorGrid = makeOriginalConstructionGrid();
        exitEditorToTitle();
        const afterSeventhExit = {
          screen: game.screen,
          visits: game.constructionVisits,
          constructionUsed: game.constructionUsed,
          inputCount: game.hiddenInputCount
        };

        keys.clear();
        keys.add("ArrowDown");
        for (let press = 0; press < HIDDEN_MESSAGE_A_PRESSES; press += 1) recordHiddenTitleInput("KeyF");
        const afterA = game.hiddenInputCount;
        keys.delete("ArrowDown");
        keys.add("ArrowRight");
        for (let press = 0; press < HIDDEN_MESSAGE_B_PRESSES; press += 1) recordHiddenTitleInput("KeyG");
        const afterB = game.hiddenInputCount;
        const triggerReady = hiddenMessageTriggerReady();

        startHiddenMessage();
        const presentations = [127, 128, 320, 383, 384, 640, 641, 668, 669, 886]
          .map((frame) => hiddenMessagePresentation(frame));
        game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
        update();
        const afterCutscene = {
          screen: game.screen,
          visits: game.constructionVisits,
          elapsed: game.hiddenMessageElapsed,
          inputCount: game.hiddenInputCount
        };
        game.constructionVisits = 0xff;
        exitEditorToTitle();
        const wrappedVisits = game.constructionVisits;
        game.titleMenu = 0;
        game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS;
        game.hiddenInputCount = 0x74;
        startHiddenMessage();
        game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
        update();
        const alternateSelection = {
          screen: game.screen,
          players: game.stageSelectPlayers
        };
        return {
          requiredVisits: HIDDEN_MESSAGE_REQUIRED_VISITS,
          requiredAPresses: HIDDEN_MESSAGE_A_PRESSES,
          requiredBPresses: HIDDEN_MESSAGE_B_PRESSES,
          expectedInputCount: 0x74,
          endFrame: HIDDEN_MESSAGE_END_FRAME,
          afterSeventhExit,
          afterA,
          afterB,
          triggerReady,
          presentations,
          afterCutscene,
          wrappedVisits,
          alternateSelection
        };
      } finally {
        keys.clear();
        for (const key of previousKeys) keys.add(key);
        Object.assign(game, previous);
      }
    },
    debugHighScoreScreenProbe() {
      const previous = { ...game };
      const previousGameOverAudio = {
        active: gameOverAudio.active,
        frame: gameOverAudio.frame
      };
      const previousHighScoreAudio = {
        active: highScoreAudio.active,
        frame: highScoreAudio.frame
      };
      try {
        const player = (score) => ({ id: 1, score, alive: false, respawn: 0, lives: 0 });
        game.runHighScoreBaseline = 20000;
        game.highScore = 20000;
        game.players = [player(20000)];
        game.screen = "playing";
        enterGameOver();
        const tie = {
          triggered: game.newHighScoreAtGameOver,
          screen: game.screen
        };

        game.players = [player(20100)];
        game.highScore = 20100;
        game.screen = "playing";
        enterGameOver();
        const strictBeat = {
          triggered: game.newHighScoreAtGameOver,
          screen: game.screen
        };
        finishGameOverScreen();
        finishStageResult();
        finishFullGameOverScreen();
        const started = {
          screen: game.screen,
          elapsed: game.highScoreScreenElapsed,
          audioActive: highScoreAudio.active,
          audioFrame: highScoreAudio.frame
        };
        const paletteFrames = [0, 1, 2, 3, 4].map((frame) => highScorePresentation(frame, 20100));
        const sevenDigit = highScorePresentation(0, 1234567);
        game.highScoreScreenElapsed = HIGH_SCORE_SCREEN_FRAMES - 2;
        highScoreAudio.frame = HIGH_SCORE_SCREEN_FRAMES - 2;
        syncHighScoreAudioNodes();
        update();
        const beforeEnd = {
          screen: game.screen,
          elapsed: game.highScoreScreenElapsed,
          audioActive: highScoreAudio.active,
          audioFrame: highScoreAudio.frame
        };
        update();
        const afterEnd = {
          screen: game.screen,
          elapsed: game.highScoreScreenElapsed,
          triggered: game.newHighScoreAtGameOver,
          audioActive: highScoreAudio.active
        };

        game.players = [player(19900)];
        game.runHighScoreBaseline = 20000;
        game.screen = "playing";
        enterGameOver();
        finishGameOverScreen();
        finishStageResult();
        finishFullGameOverScreen();
        const belowRecord = {
          screen: game.screen,
          triggered: game.newHighScoreAtGameOver
        };
        return {
          duration: HIGH_SCORE_SCREEN_FRAMES,
          tie,
          strictBeat,
          started,
          paletteFrames,
          sevenDigit,
          beforeEnd,
          afterEnd,
          belowRecord
        };
      } finally {
        stopGameOverAudio();
        stopHighScoreAudio();
        Object.assign(game, previous);
        gameOverAudio.active = previousGameOverAudio.active;
        gameOverAudio.frame = previousGameOverAudio.frame;
        highScoreAudio.active = previousHighScoreAudio.active;
        highScoreAudio.frame = previousHighScoreAudio.frame;
        syncGameOverAudioNodes();
        syncHighScoreAudioNodes();
      }
    },
    debugHighScoreAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.highScore;
      const frames = [
        0, 4, 5, 9, 10, 129, 130, 159, 160, 174, 175, 179, 180, 209, 210, 239, 240,
        244, 245, 254, 255, 259, 260, 289, 290, 319, 320, 324, 325, 379, 380, 399,
        400, 459, 460
      ];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => highScoreAudioPresentation(frame))
      };
    },
    debugFullGameOverScreenProbe() {
      const previous = { ...game };
      const previousAudio = {
        active: gameOverAudio.active,
        frame: gameOverAudio.frame
      };
      const previousHighScoreAudio = {
        active: highScoreAudio.active,
        frame: highScoreAudio.frame
      };
      try {
        game.newHighScoreAtGameOver = false;
        startFullGameOverScreen();
        const entry = {
          screen: game.screen,
          elapsed: game.fullGameOverElapsed,
          paused: game.paused,
          audioActive: gameOverAudio.active,
          audioFrame: gameOverAudio.frame
        };
        const presentation = fullGameOverPresentation(game.fullGameOverElapsed);
        game.fullGameOverElapsed = FULL_GAME_OVER_SCREEN_FRAMES - 2;
        gameOverAudio.frame = FULL_GAME_OVER_SCREEN_FRAMES - 2;
        syncGameOverAudioNodes();
        update();
        const beforeEnd = {
          screen: game.screen,
          elapsed: game.fullGameOverElapsed,
          audioActive: gameOverAudio.active,
          audioFrame: gameOverAudio.frame
        };
        update();
        const afterEnd = {
          screen: game.screen,
          elapsed: game.fullGameOverElapsed,
          audioActive: gameOverAudio.active,
          audioFrame: gameOverAudio.frame
        };

        game.newHighScoreAtGameOver = false;
        startFullGameOverScreen();
        const ignoredInput = {
          handled: handleFullGameOverInput("KeyA"),
          screen: game.screen
        };
        const startSkip = {
          handled: handleFullGameOverInput("Enter"),
          screen: game.screen,
          audioActive: gameOverAudio.active
        };

        game.newHighScoreAtGameOver = false;
        startFullGameOverScreen();
        const selectSkip = {
          handled: handleFullGameOverInput("Escape"),
          screen: game.screen,
          audioActive: gameOverAudio.active
        };

        game.newHighScoreAtGameOver = true;
        startFullGameOverScreen();
        finishFullGameOverScreen();
        const highScoreRoute = {
          screen: game.screen,
          elapsed: game.highScoreScreenElapsed,
          audioActive: gameOverAudio.active
        };
        return {
          duration: FULL_GAME_OVER_SCREEN_FRAMES,
          entry,
          presentation,
          beforeEnd,
          afterEnd,
          ignoredInput,
          startSkip,
          selectSkip,
          highScoreRoute
        };
      } finally {
        stopGameOverAudio();
        stopHighScoreAudio();
        Object.assign(game, previous);
        gameOverAudio.active = previousAudio.active;
        gameOverAudio.frame = previousAudio.frame;
        highScoreAudio.active = previousHighScoreAudio.active;
        highScoreAudio.frame = previousHighScoreAudio.frame;
        syncGameOverAudioNodes();
        syncHighScoreAudioNodes();
      }
    },
    debugGameOverAudioProbe() {
      const event = FREE_AUDIO_MANIFEST.events.gameOver;
      const frames = [0, 5, 6, 11, 12, 35, 36, 43, 44, 51, 52, 59, 60, 67, 68, 75, 76, 83, 84, 107, 108];
      return {
        durationFrames: event.durationFrames,
        voiceDurations: event.voices.map(fixedFrameVoiceDuration),
        waves: event.voices.map((voice) => voice.wave),
        frames: frames.map((frame) => gameOverAudioPresentation(frame))
      };
    },
    debugRenderFullGameOverFrame(frame) {
      const previous = {
        screen: game.screen,
        fullGameOverElapsed: game.fullGameOverElapsed
      };
      try {
        game.screen = "fullGameOver";
        game.fullGameOverElapsed = Math.max(0, Math.floor(Number(frame) || 0));
        render();
        return fullGameOverPresentation(game.fullGameOverElapsed);
      } finally {
        Object.assign(game, previous);
      }
    },
    debugRenderHighScoreFrame(frame, score) {
      const previous = {
        screen: game.screen,
        highScore: game.highScore,
        highScoreScreenElapsed: game.highScoreScreenElapsed
      };
      try {
        game.screen = "highScore";
        game.highScore = Math.max(0, Math.floor(Number(score) || 0));
        game.highScoreScreenElapsed = Math.max(0, Math.floor(Number(frame) || 0));
        render();
        return highScorePresentation(game.highScoreScreenElapsed, game.highScore);
      } finally {
        Object.assign(game, previous);
      }
    },
    debugSnapshot() {
      return {
        screen: game.screen,
        paused: game.paused,
        pauseElapsed: game.pauseElapsed,
        titleMenu: game.titleMenu,
        titleMenuAction: (TITLE_MENU_ITEMS[game.titleMenu] || TITLE_MENU_ITEMS[0]).action,
        titleIdleFrames: game.titleIdleFrames,
        titleDemoIdleFrames: TITLE_DEMO_IDLE_FRAMES,
        battleTick: game.tick,
        frameLow: game.frameLow,
        frameHigh: game.frameHigh,
        randomValue: game.randomValue,
        randomIndex: game.randomIndex,
        demoMode: game.demoMode,
        constructionUsed: game.constructionUsed,
        constructionVisits: game.constructionVisits,
        hiddenInputCount: game.hiddenInputCount,
        hiddenMessageElapsed: game.hiddenMessageElapsed,
        stage: game.stage,
        stageSelectPlayers: game.stageSelectPlayers,
        stageSelectLimit: stageSelectLimit(),
        stageCycleLimit: stageCycleLimit(),
        mapDataStage: mapDataStage(game.stage),
        enemyDataStage: enemyDataStage(game.stage),
        highScore: game.highScore,
        runHighScoreBaseline: game.runHighScoreBaseline,
        newHighScoreAtGameOver: game.newHighScoreAtGameOver,
        fullGameOverElapsed: game.fullGameOverElapsed,
        highScoreScreenElapsed: game.highScoreScreenElapsed,
        enemySpawned: game.enemySpawned,
        enemyKilled: game.enemyKilled,
        panelEnemyCounter: panelEnemyCounterRemaining(),
        nextSpawn: game.nextSpawn,
        clearPendingTimer: game.clearPendingTimer,
        baseDestroyTimer: game.baseDestroyTimer,
        stageResultReason: game.stageResultReason,
        stageClearElapsed: game.stageClearElapsed,
        stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
        stageClearBonusAwarded: game.stageClearBonusAwarded,
        gameOverTimer: game.gameOverTimer,
        playerGameOverMessage: game.playerGameOverMessage
          ? { ...game.playerGameOverMessage, active: playerGameOverMessageActive() }
          : null,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer,
        movementAudioMode: movementAudio.mode,
        stageStartAudio: {
          active: stageStartAudio.active,
          frame: stageStartAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.stageStart.durationFrames
        },
        bonusLifeAudio: {
          active: bonusLifeAudio.active,
          frame: bonusLifeAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.bonusLife.durationFrames
        },
        powerUpPickupAudio: {
          active: powerUpPickupAudio.active,
          frame: powerUpPickupAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.powerUp.durationFrames
        },
        powerUpAppearAudio: {
          active: powerUpAppearAudio.active,
          frame: powerUpAppearAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.powerUpAppear.durationFrames
        },
        brickHitAudio: {
          active: brickHitAudio.active,
          frame: brickHitAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.brickHit.durationFrames
        },
        steelHitAudio: {
          active: steelHitAudio.active,
          frame: steelHitAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.steelHit.durationFrames
        },
        enemyHitAudio: {
          active: enemyHitAudio.active,
          frame: enemyHitAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.enemyHit.durationFrames
        },
        baseHitAudio: {
          active: baseHitAudio.active,
          frame: baseHitAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.baseHit.durationFrames
        },
        enemyDestroyAudio: {
          active: enemyDestroyAudio.active,
          frame: enemyDestroyAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.enemyDestroy.durationFrames
        },
        playerDestroyAudio: {
          active: playerDestroyAudio.active,
          frame: playerDestroyAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.playerDestroy.durationFrames
        },
        playerShootAudio: {
          active: playerShootAudio.active,
          frame: playerShootAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.playerShoot.durationFrames
        },
        movementIceAudio: {
          active: movementIceAudio.active,
          frame: movementIceAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.movementIce.durationFrames
        },
        pauseAudio: {
          active: pauseAudio.active,
          frame: pauseAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.pause.durationFrames
        },
        scoreCountAudio: {
          active: scoreCountAudio.active,
          frame: scoreCountAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.scoreCount.durationFrames
        },
        stageBonusAudio: {
          active: stageBonusAudio.active,
          frame: stageBonusAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.stageBonus.durationFrames
        },
        gameOverAudio: {
          active: gameOverAudio.active,
          frame: gameOverAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.gameOver.durationFrames
        },
        highScoreAudio: {
          active: highScoreAudio.active,
          frame: highScoreAudio.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events.highScore.durationFrames
        },
        maxActiveEnemies: maxActiveEnemies(),
        initialLives: gameSettings().initialLives,
        bonusLifeScores: gameSettings().bonusLifeScores.slice(),
        deathPowerLevel: gameSettings().deathPowerLevel,
        powerUpDurations: { ...gameSettings().powerUpDurations },
        powerUpRules: { ...gameSettings().powerUpRules },
        timings: { ...gameSettings().timings },
        enemySpawnPacing: { ...gameSettings().enemySpawnPacing },
        playerMovement: clonePlayerMovementSettings(gameSettings().playerMovement),
        projectileRules: { ...gameSettings().projectileRules },
        friendlyFire: { ...gameSettings().friendlyFire },
        explosionRules: cloneExplosionRules(gameSettings().explosionRules),
        stageAdvance: { ...gameSettings().stageAdvance },
        stageClearBonus: { ...gameSettings().stageClearBonus },
        enemyAi: { ...gameSettings().enemyAi },
        timerFreezesEnemyTime: gameSettings().timerFreezesEnemyTime,
        enemyTypes: cloneEnemyTypes(enemyTypeDefinitions()),
        playerUpgradeRules: clonePlayerUpgradeRules(gameSettings().playerUpgradeRules),
        wallRules: cloneWallRules(),
        playerSpawns: currentPlayerSpawns(),
        enemySpawns: currentEnemySpawns(),
        powerUpSpawns: currentPowerUpSpawns(),
        enemySequence: enemySequenceForStage(game.stage),
        scorePopups: game.scorePopups.map((popup) => ({ ...popup })),
        battleQuadrants: gridToQuadrants(game.grid),
        fieldGeometry: {
          x: FIELD_X,
          y: FIELD_Y,
          width: FIELD_W,
          height: FIELD_H,
          panelX: PANEL_X,
          panelWidth: SCREEN_W - PANEL_X
        },
        editorCursor: { ...game.editorCursor },
        editorBrush: tileTypeName(game.editorBrush),
        editorPattern: game.editorPattern,
        editorPatternArmed: game.editorPatternArmed,
        editorQuadrants: game.editorGrid ? gridToQuadrants(game.editorGrid) : null,
        hasConstructedStage: Boolean(game.constructedGrid),
        constructionStageActive: game.constructionStageActive,
        powerUpType: game.powerUp ? game.powerUp.type : null,
        players: game.players.map((player) => ({
          id: player.id,
          score: player.score,
          stagePoints: player.stagePoints,
          stageKills: player.stageKills.slice(),
          totalKills: player.totalKills.slice(),
          nextBonusLifeIndex: player.nextBonusLifeIndex,
          level: player.level,
          lives: player.lives,
          respawn: player.respawn,
          spawnFlash: player.spawnFlash || 0,
          invuln: player.invuln,
          x: player.x,
          y: player.y,
          speed: player.speed,
          slide: player.slide,
          pendingSnap: player.pendingSnap
        }))
      };
    },
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
    debugCarrierReleaseProbe(hpBeforeHit) {
      const hp = Math.max(1, Math.floor(Number(hpBeforeHit) || 1));
      return {
        rule: gameSettings().powerUpRules.carrierRelease,
        clearUncollectedOnCarrierSpawn: gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn,
        pickupScore: gameSettings().powerUpRules.pickupScore,
        releaseOnThisHit: shouldReleaseCarrierPowerUp(
          true,
          hp - 1 <= 0,
          gameSettings().powerUpRules.carrierRelease
        )
      };
    },
    debugCarrierFlashProbe() {
      const type = enemyTypeDefinitions()[0];
      const baseTank = { carrier: false, stun: 0 };
      const carrierTank = { carrier: true, stun: 0 };
      return {
        baseColor: tankPrimaryColor(baseTank, type.color, 0),
        flashColor: tankPrimaryColor(carrierTank, type.color, 0),
        normalPhaseColor: tankPrimaryColor(carrierTank, type.color, 8),
        flashColorValue: CARRIER_FLASH_COLOR,
        phaseFrames: CARRIER_FLASH_PHASE_FRAMES
      };
    },
    debugPausedTankVisualProbe() {
      const previous = { ...game };
      const type = enemyTypeDefinitions()[0];
      const carrier = { carrier: true };
      const stunnedPlayer = { stun: 1 };
      try {
        preparePausedDebugBattle(7);

        const snapshot = () => {
          const displayFrame = battleDisplayFrame();
          return {
            tick: game.tick,
            pauseElapsed: game.pauseElapsed,
            displayFrame,
            carrierColor: tankPrimaryColor(carrier, type.color, displayFrame),
            carrierBaseColor: type.color,
            carrierFlashColor: CARRIER_FLASH_COLOR,
            stunnedVisible: isPlayerTankVisible(stunnedPlayer, displayFrame)
          };
        };
        const initial = snapshot();
        update();
        const afterOneFrame = snapshot();
        for (let frame = 0; frame < 8; frame += 1) update();
        const afterNineFrames = snapshot();

        game.paused = false;
        game.tick = 23;
        const afterResume = snapshot();
        return { initial, afterOneFrame, afterNineFrames, afterResume };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugEnemyColorProbe(typeIndex, hp) {
      const type = enemyTypeDefinitions()[clamp(Math.floor(Number(typeIndex) || 0), 0, enemyTypeDefinitions().length - 1)];
      return enemyColor({
        hp: Math.max(1, Math.floor(Number(hp) || type.hp)),
        maxHp: type.hp,
        color: type.color,
        hitColors: type.hitColors ? type.hitColors.slice() : null
      });
    },
    debugEnemyTargetEligibilityProbe() {
      const previousPlayers = game.players;
      try {
        game.players = [
          { id: 1, alive: true, spawnFlash: 0, respawn: 0 },
          { id: 2, alive: true, spawnFlash: gameSettings().timings.playerSpawnFlash, respawn: 0 },
          { id: 3, alive: false, spawnFlash: 0, respawn: gameSettings().timings.playerRespawn },
          { id: 4, alive: false, spawnFlash: 0, respawn: 0 }
        ];
        return {
          targetableIds: targetableEnemyPlayers(game.players).map((player) => player.id),
          spawningId: 2,
          respawningId: 3
        };
      } finally {
        game.players = previousPlayers;
      }
    },
    debugEnemyAiPhaseProbe(stage, players) {
      const previousPlayerCount = game.playerCount;
      const stageValue = Math.max(1, Math.floor(Number(stage) || 1));
      try {
        game.playerCount = Math.max(1, Math.min(2, Math.floor(Number(players) || 1)));
        const interval = scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(stageValue), game.playerCount);
        const randomEnd = Math.floor(interval / 8);
        const playerEnd = Math.floor(interval / 4);
        return {
          stage: stageValue,
          players: game.playerCount,
          interval,
          randomEnd,
          playerEnd,
          phases: [
            { frameHigh: randomEnd, displayFrames: randomEnd * 64, phase: enemyAiPhase(stageValue, randomEnd) },
            { frameHigh: randomEnd + 1, displayFrames: (randomEnd + 1) * 64, phase: enemyAiPhase(stageValue, randomEnd + 1) },
            { frameHigh: playerEnd + 1, displayFrames: (playerEnd + 1) * 64, phase: enemyAiPhase(stageValue, playerEnd + 1) }
          ]
        };
      } finally {
        game.playerCount = previousPlayerCount;
      }
    },
    debugEnemyTargetingProbe() {
      const previousPlayers = game.players;
      const enemy = { x: 73, y: 73, w: 14, h: 14, slotIndex: 7 };
      const upperLeft = { x: 64, y: 64 };
      const lowerRight = { x: 96, y: 96 };
      try {
        game.players = [
          { id: 1, alive: true, x: 32, y: 160, w: 14, h: 14 },
          { id: 2, alive: true, x: 128, y: 160, w: 14, h: 14 }
        ];
        const oddSlotTarget = selectEnemyTargetPlayer(enemy, game.players);
        enemy.slotIndex = 6;
        const evenSlotTarget = selectEnemyTargetPlayer(enemy, game.players);
        game.players[1].alive = false;
        enemy.slotIndex = 7;
        const fallbackTarget = selectEnemyTargetPlayer(enemy, game.players);
        return {
          oddSlotTargetId: oddSlotTarget ? oddSlotTarget.id : null,
          evenSlotTargetId: evenSlotTarget ? evenSlotTarget.id : null,
          fallbackTargetId: fallbackTarget ? fallbackTarget.id : null,
          upperLeftVerticalFirst: directionName(directionTowardTarget(enemy, upperLeft, false)),
          upperLeftHorizontalFirst: directionName(directionTowardTarget(enemy, upperLeft, true)),
          lowerRightVerticalFirst: directionName(directionTowardTarget(enemy, lowerRight, false)),
          lowerRightHorizontalFirst: directionName(directionTowardTarget(enemy, lowerRight, true))
        };
      } finally {
        game.players = previousPlayers;
      }
    },
    debugEnemyMovementCadenceProbe() {
      const previous = { tick: game.tick, frameLow: game.frameLow };
      const normal = { slotIndex: 5, alternateMovement: true };
      const fast = { slotIndex: 5, alternateMovement: false };
      try {
        const frames = [];
        for (let tick = 0; tick < 4; tick += 1) {
          game.tick = tick;
          game.frameLow = tick;
          frames.push({
            tick,
            normal: isEnemyMovementFrame(normal, game.frameLow),
            fast: isEnemyMovementFrame(fast, game.frameLow)
          });
        }
        return frames;
      } finally {
        Object.assign(game, previous);
      }
    },
    debugEnemyBlockedStateProbe() {
      const previous = {
        tick: game.tick,
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies
      };
      const makeEnemy = () => ({
        kind: "enemy",
        id: 100,
        slotIndex: 5,
        x: 1,
        y: 17,
        w: 14,
        h: 14,
        dir: UP,
        speed: 8,
        alternateMovement: false,
        blockedPauseTicks: 0,
        pendingTurn: false,
        alive: true,
        respawn: 0
      });
      const byteSequence = (bytes) => {
        let index = 0;
        return () => ((bytes[Math.min(index++, bytes.length - 1)] || 0) + 0.01) / 256;
      };
      try {
        game.tick = 0;
        game.grid = makeGrid();
        setTile(game.grid, 0, 0, BRICK);
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [];
        const retryEnemy = makeEnemy();
        game.enemies = [retryEnemy];
        updateEnemyMovement(retryEnemy, byteSequence([1, 3]));
        const retry = { dir: retryEnemy.dir, blockedPauseTicks: retryEnemy.blockedPauseTicks, pendingTurn: retryEnemy.pendingTurn };
        updateEnemyMovement(retryEnemy, byteSequence([0]));
        const retryPause1 = retryEnemy.blockedPauseTicks;
        updateEnemyMovement(retryEnemy, byteSequence([0]));
        const retryPause2 = retryEnemy.blockedPauseTicks;

        const turnEnemy = makeEnemy();
        game.enemies = [turnEnemy];
        updateEnemyMovement(turnEnemy, byteSequence([1, 0]));
        const turn = { dir: turnEnemy.dir, blockedPauseTicks: turnEnemy.blockedPauseTicks, pendingTurn: turnEnemy.pendingTurn };
        return { retry, retryPause1, retryPause2, turn };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugEnemySpawnTimelineProbe(players, count) {
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
      const targetCount = Math.max(1, Math.min(6, Math.floor(Number(count) || 3)));
      try {
        game.stage = 1;
        game.playerCount = Math.max(1, Math.min(2, Math.floor(Number(players) || 1)));
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.powerUp = null;
        game.enemySpawned = 0;
        game.nextSpawn = enemySpawnDelay(game.stage, 0);
        const frames = [];
        for (let frame = 1; frame <= 1200 && frames.length < targetCount; frame += 1) {
          const before = game.enemySpawned;
          spawnEnemies();
          if (game.enemySpawned > before) frames.push(frame);
        }
        return {
          players: game.playerCount,
          interval: scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(1), game.playerCount),
          frames,
          slots: game.enemies.map((enemy) => enemy.slotIndex),
          spawnIndices: game.enemies.map((enemy) => getEnemySpec(1, enemy.id - 100).spawnIndex),
          states: game.enemies.map((enemy) => ({
            ...enemy,
            hitColors: enemy.hitColors ? enemy.hitColors.slice() : null
          }))
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugSpawnAnimationCadenceProbe() {
      const playerDuration = gameSettings().timings.playerSpawnFlash;
      const enemyDuration = gameSettings().timings.enemySpawnFlash;
      const frames = Array.from({ length: enemyDuration }, (_, elapsed) =>
        spawnAnimationPresentation(enemyDuration - elapsed, enemyDuration)
      );
      const previous = {
        players: game.players,
        enemies: game.enemies,
        grid: game.grid,
        tick: game.tick,
        frameLow: game.frameLow,
        frameHigh: game.frameHigh,
        freezeTimer: game.freezeTimer,
        firePresses: Array.from(pendingFirePresses)
      };
      try {
        game.grid = makeGrid();
        game.freezeTimer = 0;
        game.enemies = [];
        const player = {
          kind: "player",
          id: 1,
          alive: true,
          respawn: 0,
          spawnFlash: playerDuration,
          invuln: 0,
          reload: 0
        };
        game.players = [player];
        game.tick = 2;
        game.frameLow = 2;
        game.frameHigh = 0;
        const beforeSkippedCadenceFrame = player.spawnFlash;
        updatePlayers();
        const afterSkippedCadenceFrame = player.spawnFlash;
        let playerDisplayFrames = 1;
        while (player.spawnFlash > 0 && playerDisplayFrames < 1000) {
          game.tick += 1;
          game.frameLow = (game.frameLow + 1) & 0xff;
          updatePlayers();
          playerDisplayFrames += 1;
        }

        const enemy = { kind: "enemy", id: 100, alive: true, spawnFlash: enemyDuration };
        game.enemies = [enemy];
        let enemyDisplayFrames = 0;
        while (enemy.spawnFlash > 0 && enemyDisplayFrames < 1000) {
          updateEnemies();
          enemyDisplayFrames += 1;
        }
        return {
          playerDuration,
          enemyDuration,
          playerDisplayFrames,
          enemyDisplayFrames,
          beforeSkippedCadenceFrame,
          afterSkippedCadenceFrame,
          lows: frames.map((frame) => frame.low),
          phases: frames.map((frame) => frame.phase),
          sizes: frames.map((frame) => frame.size)
        };
      } finally {
        game.players = previous.players;
        game.enemies = previous.enemies;
        game.grid = previous.grid;
        game.tick = previous.tick;
        game.frameLow = previous.frameLow;
        game.frameHigh = previous.frameHigh;
        game.freezeTimer = previous.freezeTimer;
        pendingFirePresses.clear();
        for (const code of previous.firePresses) pendingFirePresses.add(code);
      }
    },
    debugTimerRuleProbe() {
      const previousFreezeTimer = game.freezeTimer;
      game.freezeTimer = 1;
      const frozen = isEnemyTimeFrozen();
      const canSpawn = shouldSpawnEnemies();
      game.freezeTimer = previousFreezeTimer;
      return { frozen, canSpawn };
    },
    debugGlobalTimerCadenceProbe() {
      const countdownFrames = (units, startTick) => {
        let remaining = units;
        let tick = startTick;
        let frames = 0;
        while (remaining > 0 && frames < 100000) {
          tick += 1;
          frames += 1;
          if (isGlobalTimerTick(tick)) remaining -= 1;
        }
        return frames;
      };
      return {
        unitFrames: 64,
        boundaries: [62, 63, 64, 65, 127, 128].map((tick) => ({ tick, active: isGlobalTimerTick(tick) })),
        durations: { ...gameSettings().powerUpDurations },
        spawnShieldUnits: gameSettings().timings.playerInvulnerability,
        timerDisplayFrames: {
          phase0: countdownFrames(gameSettings().powerUpDurations.timer, 0),
          phase63: countdownFrames(gameSettings().powerUpDurations.timer, 63)
        },
        spawnShieldDisplayFrames: {
          phase0: countdownFrames(gameSettings().timings.playerInvulnerability, 0),
          phase63: countdownFrames(gameSettings().timings.playerInvulnerability, 63)
        }
      };
    },
    debugShieldCadenceProbe() {
      return Array.from({ length: 8 }, (_, tick) => ({ tick, color: shieldColorForTick(tick), visible: true }));
    },
    debugPausedShieldProbe() {
      const previous = { ...game };
      const player = { alive: true, lives: 1, respawn: 0, invuln: 2 };
      try {
        preparePausedDebugBattle(63);
        game.paused = false;
        game.players = [player];

        const activeVisible = isPlayerShieldVisible(player, game.paused);
        game.paused = true;
        const pausedVisible = isPlayerShieldVisible(player, game.paused);
        const beforePausedUpdate = { tick: game.tick, invuln: player.invuln };
        update();
        const afterPausedUpdate = {
          tick: game.tick,
          pauseElapsed: game.pauseElapsed,
          invuln: player.invuln
        };
        game.paused = false;
        const resumedVisible = isPlayerShieldVisible(player, game.paused);
        player.invuln = 0;
        const expiredVisible = isPlayerShieldVisible(player, game.paused);
        return { activeVisible, pausedVisible, resumedVisible, expiredVisible, beforePausedUpdate, afterPausedUpdate };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugTimerFreezeBehaviorProbe() {
      const previous = {
        grid: game.grid,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        scorePopups: game.scorePopups,
        freezeTimer: game.freezeTimer,
        highScore: game.highScore
      };
      const player = {
        id: 1,
        score: 0,
        stagePoints: 0,
        stageKills: Array(enemyTypeDefinitions().length).fill(0),
        totalKills: Array(enemyTypeDefinitions().length).fill(0),
        nextBonusLifeIndex: 0,
        lives: 2,
        alive: true
      };
      const enemy = {
        kind: "enemy",
        id: 100,
        x: 64,
        y: 64,
        w: 14,
        h: 14,
        dir: RIGHT,
        speed: 1,
        reload: 9,
        reloadBase: 9,
        blockedPauseTicks: 0,
        pendingTurn: false,
        alternateMovement: false,
        spawnFlash: 0,
        fireChance: 0,
        alive: true
      };
      const bullet = {
        x: 16,
        y: 144,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: RIGHT,
        speed: 2,
        power: 1,
        ownerKind: "player",
        ownerId: 1,
        ownerKey: "player:1",
        remove: false
      };

      try {
        game.grid = makeGrid();
        game.players = [player];
        game.enemies = [enemy];
        game.bullets = [bullet];
        game.explosions = [];
        game.scorePopups = [];
        applyPowerUp(player, "timer");
        const before = {
          enemyX: enemy.x,
          enemyReload: enemy.reload,
          bulletX: bullet.x,
          freezeTimer: game.freezeTimer,
          score: player.score
        };
        updateEnemies();
        updateBullets();
        return {
          duration: gameSettings().powerUpDurations.timer,
          pickupScore: gameSettings().powerUpRules.pickupScore,
          before,
          after: {
            enemyX: enemy.x,
            enemyReload: enemy.reload,
            bulletX: bullet.x,
            freezeTimer: game.freezeTimer,
            score: player.score
          }
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugTimerFinalFrameFreezeProbe() {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        stage: game.stage,
        tick: game.tick,
        frameLow: game.frameLow,
        frameHigh: game.frameHigh,
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        powerUp: game.powerUp,
        enemySpawned: game.enemySpawned,
        nextSpawn: game.nextSpawn,
        clearPendingTimer: game.clearPendingTimer,
        gameOverTimer: game.gameOverTimer,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer
      };
      const player = {
        kind: "player",
        id: 1,
        x: 32,
        y: 160,
        w: 14,
        h: 14,
        dir: UP,
        speed: gameSettings().playerMovement.speed,
        alive: true,
        lives: 1,
        respawn: 0,
        spawnFlash: 0,
        invuln: 0,
        stun: 0,
        pendingSnap: false,
        level: 0,
        reload: 0,
        score: 0,
        stagePoints: 0,
        stageKills: Array(enemyTypeDefinitions().length).fill(0),
        totalKills: Array(enemyTypeDefinitions().length).fill(0),
        nextBonusLifeIndex: 0,
        slide: 0
      };
      const activeEnemy = {
        kind: "enemy",
        id: 100,
        x: 64,
        y: 64,
        w: 14,
        h: 14,
        dir: RIGHT,
        speed: 1,
        hp: 1,
        reload: 9,
        reloadBase: 9,
        blockedPauseTicks: 0,
        pendingTurn: false,
        alternateMovement: false,
        spawnFlash: 0,
        fireChance: 0,
        alive: true
      };
      const spawningEnemy = {
        kind: "enemy",
        id: 101,
        x: 96,
        y: 16,
        w: 14,
        h: 14,
        dir: DOWN,
        speed: 1,
        hp: 1,
        reload: 9,
        reloadBase: 9,
        blockedPauseTicks: 2,
        pendingTurn: false,
        alternateMovement: false,
        spawnFlash: 5,
        fireChance: 0,
        alive: true
      };
      const bullet = {
        x: 16,
        y: 144,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: RIGHT,
        speed: 2,
        power: 1,
        ownerKind: "player",
        ownerId: 1,
        ownerKey: "player:1",
        remove: false
      };
      try {
        game.screen = "playing";
        game.paused = false;
        game.stage = 1;
        game.tick = 63;
        game.frameLow = 0x3f;
        game.frameHigh = 0;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [player];
        game.enemies = [activeEnemy, spawningEnemy];
        game.bullets = [bullet];
        game.explosions = [];
        game.powerUp = null;
        game.enemySpawned = 0;
        game.nextSpawn = 5;
        game.clearPendingTimer = 0;
        game.gameOverTimer = 0;
        game.freezeTimer = 1;
        game.shovelTimer = 0;
        const before = {
          activeEnemyX: activeEnemy.x,
          activeEnemyReload: activeEnemy.reload,
          activeEnemyBlockedPauseTicks: activeEnemy.blockedPauseTicks,
          spawningEnemyFlash: spawningEnemy.spawnFlash,
          nextSpawn: game.nextSpawn,
          bulletX: bullet.x,
          freezeTimer: game.freezeTimer
        };
        update();
        return {
          before,
          after: {
            activeEnemyX: activeEnemy.x,
            activeEnemyReload: activeEnemy.reload,
            activeEnemyBlockedPauseTicks: activeEnemy.blockedPauseTicks,
            spawningEnemyFlash: spawningEnemy.spawnFlash,
            nextSpawn: game.nextSpawn,
            bulletX: game.bullets[0] ? game.bullets[0].x : null,
            freezeTimer: game.freezeTimer
          }
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugTimerSpawnDuringFreezeProbe() {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        stage: game.stage,
        tick: game.tick,
        frameLow: game.frameLow,
        frameHigh: game.frameHigh,
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        powerUp: game.powerUp,
        enemySpawned: game.enemySpawned,
        nextSpawn: game.nextSpawn,
        clearPendingTimer: game.clearPendingTimer,
        gameOverTimer: game.gameOverTimer,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer
      };
      const player = {
        kind: "player",
        id: 1,
        x: 32,
        y: 160,
        w: 14,
        h: 14,
        dir: UP,
        speed: gameSettings().playerMovement.speed,
        alive: true,
        lives: 1,
        respawn: 0,
        spawnFlash: 0,
        invuln: 0,
        stun: 0,
        pendingSnap: false,
        level: 0,
        reload: 0,
        score: 0,
        stagePoints: 0,
        stageKills: Array(enemyTypeDefinitions().length).fill(0),
        totalKills: Array(enemyTypeDefinitions().length).fill(0),
        nextBonusLifeIndex: 0,
        slide: 0
      };

      try {
        game.screen = "playing";
        game.paused = false;
        game.stage = 1;
        game.tick = 0;
        game.frameLow = 0;
        game.frameHigh = 0;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [player];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.powerUp = null;
        game.enemySpawned = 0;
        game.nextSpawn = 0;
        game.clearPendingTimer = 0;
        game.gameOverTimer = 0;
        game.freezeTimer = 2;
        game.shovelTimer = 0;

        update();
        const spawnedEnemy = game.enemies[0];
        const afterSpawn = {
          enemyCount: game.enemies.length,
          enemySpawned: game.enemySpawned,
          spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
          freezeTimer: game.freezeTimer,
          nextSpawn: game.nextSpawn
        };

        update();
        const afterFrozenFrame = {
          enemyCount: game.enemies.length,
          enemySpawned: game.enemySpawned,
          spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
          freezeTimer: game.freezeTimer,
          nextSpawn: game.nextSpawn
        };
        for (let frame = 1; frame < gameSettings().timings.enemySpawnFlash; frame += 1) update();
        if (spawnedEnemy) {
          spawnedEnemy.reload = 0;
          spawnedEnemy.fireChance = 1;
        }
        const afterSpawnAnimation = {
          spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
          enemyX: spawnedEnemy ? spawnedEnemy.x : null,
          enemyY: spawnedEnemy ? spawnedEnemy.y : null,
          enemyReload: spawnedEnemy ? spawnedEnemy.reload : null,
          enemyBulletCount: spawnedEnemy
            ? game.bullets.filter((bullet) => bullet.ownerKey === `enemy:${spawnedEnemy.id}`).length
            : null,
          freezeTimer: game.freezeTimer,
          nextSpawn: game.nextSpawn
        };
        update();
        return {
          expectedSpawnFlash: gameSettings().timings.enemySpawnFlash,
          afterSpawn,
          afterFrozenFrame,
          afterSpawnAnimation,
          afterFrozenActiveFrame: {
            spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
            enemyX: spawnedEnemy ? spawnedEnemy.x : null,
            enemyY: spawnedEnemy ? spawnedEnemy.y : null,
            enemyReload: spawnedEnemy ? spawnedEnemy.reload : null,
            enemyBulletCount: spawnedEnemy
              ? game.bullets.filter((bullet) => bullet.ownerKey === `enemy:${spawnedEnemy.id}`).length
              : null,
            freezeTimer: game.freezeTimer,
            nextSpawn: game.nextSpawn
          }
        };
      } finally {
        Object.assign(game, previous);
      }
    },
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
    debugPowerUpTypePoolProbe() {
      const starFrame = FREE_SPRITE_MANIFEST.sprites.powerUp.frames.star || [];
      const weights = Object.fromEntries(powerTypes.map((type) => [type, 0]));
      for (const type of originalPowerUpRandomTable) weights[type] += 1;
      return {
        types: powerTypes.slice(),
        randomTable: originalPowerUpRandomTable.slice(),
        sampledTable: Array.from({ length: 8 }, (_, byte) => randomPowerUpType(() => byte / 256)),
        weights,
        starFrameParts: starFrame.length,
        starPrimaryParts: starFrame.filter((part) => part.role === "primary").length
      };
    },
    debugBattleRandomProbe() {
      const previous = {
        randomValue: game.randomValue,
        randomIndex: game.randomIndex,
        frameHigh: game.frameHigh
      };
      try {
        game.randomValue = 0x5a;
        game.randomIndex = 0xfe;
        game.frameHigh = 0x22;
        const aiDecision = aiRoll(1 / 16);
        const afterAiIndex = game.randomIndex;
        const secondType = randomPowerUpType();
        const afterPowerUpIndex = game.randomIndex;
        const location = selectPowerUpSpawnSpot(
          [{ id: 0 }, { id: 1 }],
          (randomByte() << 8) | randomByte(),
          null
        );
        const afterLocationIndex = game.randomIndex;
        const beforeInjected = { value: game.randomValue, index: game.randomIndex };
        const injected = randomByte(() => 0.5);
        return {
          shared: { aiDecision, afterAiIndex, secondType, afterPowerUpIndex, locationId: location.id, afterLocationIndex },
          injected,
          injectedPreservedState: game.randomValue === beforeInjected.value && game.randomIndex === beforeInjected.index
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugPowerUpFlashCadenceProbe() {
      return Array.from({ length: 32 }, (_, tick) => ({ tick, visible: isPowerUpVisible(tick) }));
    },
    debugPausedPowerUpVisualProbe() {
      const previous = { ...game };
      try {
        preparePausedDebugBattle(7);

        const snapshot = () => ({
          tick: game.tick,
          pauseElapsed: game.pauseElapsed,
          displayFrame: battleDisplayFrame(),
          powerUpVisible: isPowerUpVisible(battleDisplayFrame()),
          waterFrame: waterFrameName(game.frameLow)
        });
        const initial = snapshot();
        update();
        const afterOneFrame = snapshot();
        for (let frame = 0; frame < 8; frame += 1) update();
        const afterNineFrames = snapshot();

        game.paused = false;
        game.tick = 23;
        const afterResume = snapshot();
        return { initial, afterOneFrame, afterNineFrames, afterResume };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugWaterAnimationCadenceProbe() {
      return [0, 31, 32, 63, 64, 95, 96].map((tick) => ({ tick, frame: waterFrameName(tick) }));
    },
    debugPowerUpTtlProbe(ttl) {
      const previousPowerUp = game.powerUp;
      game.powerUp = { type: "helmet", x: 0, y: 0, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: Math.max(0, Math.floor(Number(ttl) || 0)) };
      updatePowerUp();
      const result = {
        survives: Boolean(game.powerUp),
        ttl: game.powerUp ? game.powerUp.ttl : 0
      };
      game.powerUp = previousPowerUp;
      return result;
    },
    debugPowerUpPickupBoundaryProbe() {
      const player = { alive: true, respawn: 0, spawnFlash: 0, stun: 0, invuln: 0, x: 63, y: 63, w: 14, h: 14 };
      const power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
      const check = (centerDx, centerDy) => canPlayerCollectPowerUp({
        ...player,
        x: power.x + power.w / 2 - player.w / 2 + centerDx,
        y: power.y + power.h / 2 - player.h / 2 + centerDy
      }, power);
      return {
        samePosition: check(0, 0),
        positiveEleven: check(11, 11),
        negativeEleven: check(-11, -11),
        positiveTwelveX: check(12, 0),
        negativeTwelveX: check(-12, 0),
        positiveTwelveY: check(0, 12),
        negativeTwelveY: check(0, -12),
        spawning: canPlayerCollectPowerUp({ ...player, spawnFlash: 1 }, power),
        respawning: canPlayerCollectPowerUp({ ...player, respawn: 1 }, power),
        dead: canPlayerCollectPowerUp({ ...player, alive: false }, power),
        stunned: canPlayerCollectPowerUp({ ...player, stun: 1 }, power),
        invulnerable: canPlayerCollectPowerUp({ ...player, invuln: 1 }, power)
      };
    },
    debugPowerUpPickupPriorityProbe() {
      const previousPlayers = game.players;
      const makePlayer = (id, spawnFlash) => ({ id, alive: true, respawn: 0, spawnFlash: spawnFlash || 0, x: 63, y: 63, w: 14, h: 14 });
      const power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
      try {
        const player1 = makePlayer(1);
        const player2 = makePlayer(2);
        game.players = [player1, player2];
        const simultaneous = findPowerUpCollector(game.players, power);
        player2.spawnFlash = 1;
        const player2Spawning = findPowerUpCollector(game.players, power);
        game.players = [player1];
        const onePlayer = findPowerUpCollector(game.players, power);
        return {
          simultaneousPlayerId: simultaneous ? simultaneous.id : null,
          player2SpawningPlayerId: player2Spawning ? player2Spawning.id : null,
          onePlayerId: onePlayer ? onePlayer.id : null
        };
      } finally {
        game.players = previousPlayers;
      }
    },
    debugPowerUpPickupRenderProbe() {
      const previous = {
        screen: game.screen,
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        scorePopups: game.scorePopups,
        powerUp: game.powerUp,
        highScore: game.highScore,
        tick: game.tick,
        frameLow: game.frameLow,
        frameHigh: game.frameHigh
      };
      const previousPowerUpPickup = {
        active: powerUpPickupAudio.active,
        frame: powerUpPickupAudio.frame
      };
      const power = { type: "star", x: 34, y: 50, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
      const player = {
        kind: "player",
        id: 1,
        x: power.x,
        y: power.y,
        w: 14,
        h: 14,
        dir: UP,
        speed: gameSettings().playerMovement.speed,
        alive: true,
        lives: 3,
        nextBonusLifeIndex: 0,
        respawn: 0,
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
        stopPowerUpPickupAudio();
        game.screen = "playing";
        game.grid = makeGrid();
        buildBaseWall(game.grid, BRICK);
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [player];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        game.powerUp = power;

        updatePowerUp();
        const pickupAudio = {
          active: powerUpPickupAudio.active,
          frame: powerUpPickupAudio.frame,
          audible: powerUpPickupAudioAudible()
        };
        const popup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;
        const presentation = popup ? scorePopupPresentation(popup) : null;
        const laterPresentation = popup ? scorePopupPresentation({ ...popup, ttl: Math.max(1, popup.ttl - 24) }) : null;
        renderGame();
        let visibleFrames = 0;
        while (game.scorePopups.length) {
          visibleFrames += 1;
          updateScorePopups();
        }

        return {
          powerUpType: game.powerUp ? game.powerUp.type : null,
          playerLevel: player.level,
          playerScore: player.score,
          pickupScore: gameSettings().powerUpRules.pickupScore,
          popup,
          presentation,
          laterPresentation,
          pickupAudio,
          visibleFrames,
          powerCenter: { x: power.x + power.w / 2, y: power.y + power.h / 2 },
          drawRect: { x: FIELD_X + power.x, y: FIELD_Y + power.y, w: power.w, h: power.h }
        };
      } finally {
        stopPowerUpPickupAudio();
        Object.assign(game, previous);
        powerUpPickupAudio.active = previousPowerUpPickup.active;
        powerUpPickupAudio.frame = previousPowerUpPickup.frame;
        syncPowerUpPickupAudioNodes();
        syncMovementAudio();
      }
    },
    debugPowerUpFootprintClearProbe() {
      const previous = {
        screen: game.screen,
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        scorePopups: game.scorePopups,
        powerUp: game.powerUp,
        highScore: game.highScore
      };
      const power = { type: "star", x: 48, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
      const player = {
        kind: "player",
        id: 1,
        x: power.x,
        y: power.y,
        w: 14,
        h: 14,
        dir: UP,
        speed: gameSettings().playerMovement.speed,
        alive: true,
        lives: 3,
        nextBonusLifeIndex: 0,
        respawn: 0,
        spawnFlash: 0,
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
        game.screen = "playing";
        game.grid = makeGrid();
        game.grid[4][3] = makeCell(FOREST);
        buildBaseWall(game.grid, BRICK);
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [player];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        game.powerUp = power;

        renderGame();
        updatePowerUp();
        player.x = 160;
        player.y = 160;
        renderGame();

        return {
          powerUpType: game.powerUp ? game.powerUp.type : null,
          playerLevel: player.level,
          playerScore: player.score,
          pickupScore: gameSettings().powerUpRules.pickupScore,
          drawRect: { x: FIELD_X + power.x, y: FIELD_Y + power.y, w: power.w, h: power.h }
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugPowerUpTerrainMutationProbe() {
      const previous = {
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        explosions: game.explosions,
        scorePopups: game.scorePopups,
        powerUp: game.powerUp,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer,
        highScore: game.highScore,
        tick: game.tick,
        frameLow: game.frameLow,
        frameHigh: game.frameHigh
      };
      const baseline = makeGrid();
      buildBaseWall(baseline, BRICK);
      setTile(baseline, 2, 8, ICE, 0);
      setTile(baseline, 10, 9, ICE, 0);
      const countIce = (grid) => grid.reduce(
        (total, row) => total + row.filter((cell) => cell.type === ICE).length,
        0
      );
      const changesFrom = (before, after) => {
        const changes = [];
        for (let r = 0; r < GRID; r += 1) {
          for (let c = 0; c < GRID; c += 1) {
            const a = before[r][c];
            const b = after[r][c];
            if (a.type === b.type && a.mask === b.mask) continue;
            changes.push({ c, r, before: tileTypeName(a.type), after: tileTypeName(b.type) });
          }
        }
        return changes;
      };

      try {
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.enemies = [];
        game.explosions = [];
        game.scorePopups = [];
        game.freezeTimer = 0;
        game.shovelTimer = 0;
        return powerTypes.map((type) => {
          game.tick = 0;
          game.frameLow = 0;
          game.frameHigh = 0;
          const before = cloneGrid(baseline);
          const player = createPlayer(1);
          player.spawnFlash = 0;
          player.invuln = 0;
          player.score = 0;
          player.stagePoints = 0;
          game.grid = cloneGrid(before);
          game.players = [player];
          game.powerUp = { type, x: player.x, y: player.y, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          collectPowerUp(player, game.powerUp);
          const changes = changesFrom(before, game.grid);
          const afterIce = countIce(game.grid);
          let expiredIce = afterIce;
          let expiryChanges = changes;
          if (type === "shovel") {
            let guard = 0;
            while (game.shovelTimer > 0 && guard < 1000) {
              game.tick += 16;
              game.frameLow = (game.frameLow + 16) & 0xff;
              guard += 1;
              updateShovelTimer();
            }
            expiredIce = countIce(game.grid);
            expiryChanges = changesFrom(before, game.grid);
          }
          return {
            type,
            beforeIce: countIce(before),
            afterIce,
            expiredIce,
            addedIce: changes.filter((change) => change.after === "ice"),
            changes,
            expiryChanges
          };
        });
      } finally {
        Object.assign(game, previous);
      }
    },
    debugPowerUpSpawnTerrainProbe() {
      const previous = {
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        powerUp: game.powerUp,
        lastPowerUpSpawn: game.lastPowerUpSpawn,
        powerUpSpawnBag: game.powerUpSpawnBag.slice(),
        powerUpSpawnBagKey: game.powerUpSpawnBagKey
      };
      const steelSpot = { x: 1 * TILE + 2, y: 1 * TILE + 2 };
      const waterSpot = { x: 5 * TILE + 2, y: 5 * TILE + 2 };
      const brickSpot = { x: 9 * TILE + 2, y: 9 * TILE + 2 };
      const openSpot = { x: 2 * TILE + 2, y: 1 * TILE + 2 };

      try {
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [];
        game.enemies = [];
        game.powerUp = null;
        setTile(game.grid, 1, 1, STEEL);
        setTile(game.grid, 5, 5, WATER);
        setTile(game.grid, 9, 9, BRICK);

        const candidates = [steelSpot, waterSpot, brickSpot, openSpot];
        const openTiles = candidates.filter(canPowerUpSpawnAt).map(powerUpPixelToTilePoint);
        const candidateTiles = powerUpSpawnCandidates(candidates).map(powerUpPixelToTilePoint);
        game.lastPowerUpSpawn = powerUpSpawnKey(openSpot);
        const nonRepeatPick = pickPowerUpSpawnSpot(candidates);

        game.grid = Array.from({ length: GRID }, () =>
          Array.from({ length: GRID }, () => makeCell(STEEL, 15))
        );
        clearTile(game.grid, 3, 3);
        const fallback = pickPowerUpSpawnSpot([steelSpot]);

        return {
          openTiles,
          candidateTiles,
          nonRepeatTile: nonRepeatPick ? powerUpPixelToTilePoint(nonRepeatPick) : null,
          fallbackTile: fallback ? powerUpPixelToTilePoint(fallback) : null
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugPowerUpSpawnRandomProbe(count) {
      const previous = {
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        powerUp: game.powerUp,
        lastPowerUpSpawn: game.lastPowerUpSpawn,
        powerUpSpawnBag: game.powerUpSpawnBag.slice(),
        powerUpSpawnBagKey: game.powerUpSpawnBagKey
      };
      const spots = [
        { x: 2 * TILE + 2, y: 2 * TILE + 2 },
        { x: 4 * TILE + 2, y: 2 * TILE + 2 },
        { x: 8 * TILE + 2, y: 2 * TILE + 2 },
        { x: 10 * TILE + 2, y: 2 * TILE + 2 }
      ];

      try {
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [];
        game.enemies = [];
        game.powerUp = null;
        game.lastPowerUpSpawn = null;
        resetPowerUpSpawnBag();
        const candidateTiles = powerUpSpawnCandidates(spots).map(powerUpPixelToTilePoint);
        const pickCount = Math.max(1, Math.floor(Number(count) || spots.length * 2));
        const picks = [];
        for (let i = 0; i < pickCount; i += 1) {
          const picked = pickPowerUpSpawnSpot(spots, () => 0);
          if (picked) picks.push(powerUpPixelToTilePoint(picked));
        }

        return {
          candidateTiles,
          picks,
          candidateCount: candidateTiles.length,
          pickedFromCandidates: picks.every((tile) =>
            candidateTiles.some((candidate) => candidate.x === tile.x && candidate.y === tile.y)
          ),
          uniquePickCount: new Set(picks.map((tile) => `${tile.x},${tile.y}`)).size,
          immediateRepeats: picks.some((tile, index) =>
            index > 0 && tile.x === picks[index - 1].x && tile.y === picks[index - 1].y
          )
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugPowerUpSpawnRotationProbe(count) {
      return this.debugPowerUpSpawnRandomProbe(count);
    },
    debugCarrierSpawnClearsPowerUpProbe(carrier) {
      const previousPowerUp = game.powerUp;
      game.powerUp = { type: "helmet", x: 0, y: 0, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
      const cleared = clearPowerUpForCarrierSpawn(carrier !== false);
      const result = {
        cleared,
        hasPowerUp: Boolean(game.powerUp),
        rule: gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn
      };
      game.powerUp = previousPowerUp;
      return result;
    },
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
    debugStarUpgradeProbe() {
      const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
      const previousExplosions = game.explosions;
      const previousScorePopups = game.scorePopups;
      const previousHighScore = game.highScore;
      const player = {
        id: 1,
        score: 0,
        stagePoints: 0,
        stageKills: Array(enemyTypeDefinitions().length).fill(0),
        totalKills: Array(enemyTypeDefinitions().length).fill(0),
        nextBonusLifeIndex: 0,
        lives: 2,
        level: 0,
        invuln: 0,
        alive: true,
        x: 16,
        y: 16
      };
      const tiers = [];

      try {
        stopPlayerDestroyAudio();
        game.explosions = [];
        game.scorePopups = [];
        for (let i = 0; i < 4; i += 1) {
          const rule = playerUpgradeRule(player.level);
          tiers.push({
            level: player.level,
            maxBullets: rule.maxBullets,
            bulletSpeed: rule.bulletSpeed,
            wallPower: rule.wallPower
          });
          applyPowerUp(player, "star");
        }
        const cappedRule = playerUpgradeRule(player.level);
        const beforeDeathLevel = player.level;
        const cappedLevel = player.level;
        killPlayer(player);
        return {
          tiers,
          capped: {
            level: cappedLevel,
            beforeDeathLevel,
            maxBullets: cappedRule.maxBullets,
            bulletSpeed: cappedRule.bulletSpeed,
            wallPower: cappedRule.wallPower
          },
          afterDeath: {
            alive: player.alive,
            destroying: player.destroying,
            lives: player.lives,
            level: player.level,
            respawn: player.respawn || 0
          },
          powerTankBulletSpeed: enemyTypeDefinitions()[2].bullet,
          pickupScore: gameSettings().powerUpRules.pickupScore
        };
      } finally {
        stopPlayerDestroyAudio();
        game.explosions = previousExplosions;
        game.scorePopups = previousScorePopups;
        game.highScore = previousHighScore;
        playerDestroyAudio.active = previousPlayerDestroy.active;
        playerDestroyAudio.frame = previousPlayerDestroy.frame;
        syncPlayerDestroyAudioNodes();
        syncEnemyDestroyAudioNodes();
      }
    },
    debugPlayerUpgradeVisualProbe(level) {
      const value = clamp(Math.floor(Number(level) || 0), 0, 3);
      const tank = {
        kind: "player",
        id: 1,
        x: 16,
        y: 16,
        w: 14,
        h: 14,
        dir: UP,
        level: value,
        stun: 0
      };
      const parts = playerUpgradeOverlayParts(value, UP);
      drawTank(tank, "#e3c64e", "#fff0a8");
      return {
        level: value,
        overlayParts: parts.length,
        overlaySignature: parts.map((part) => `${part.role}:${part.rect.join(",")}`).join(";"),
        maxPowerColor: PLAYER_UPGRADE_OVERLAY_COLORS.level3,
        maxPowerParts: parts.filter((part) => part.role === "level3").length
      };
    },
    debugStarSurvivabilityProbe() {
      const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
      const previousPlayers = game.players;
      const previousExplosions = game.explosions;
      const player = {
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
        spawnFlash: 0,
        level: 3,
        score: 0,
        stagePoints: 0,
        stageKills: Array(enemyTypeDefinitions().length).fill(0),
        totalKills: Array(enemyTypeDefinitions().length).fill(0),
        nextBonusLifeIndex: 0
      };
      const bullet = {
        x: 18,
        y: 18,
        w: gameSettings().projectileRules.bulletSize,
        h: gameSettings().projectileRules.bulletSize,
        dir: LEFT,
        ownerKind: "enemy",
        ownerId: 100,
        ownerKey: "enemy:100",
        remove: false
      };

      try {
        stopPlayerDestroyAudio();
        game.players = [player];
        game.explosions = [];
        hitTank(bullet);
        return {
          level: player.level,
          alive: player.alive,
          lives: player.lives,
          respawn: player.respawn || 0,
          bulletRemoved: bullet.remove
        };
      } finally {
        stopPlayerDestroyAudio();
        game.players = previousPlayers;
        game.explosions = previousExplosions;
        playerDestroyAudio.active = previousPlayerDestroy.active;
        playerDestroyAudio.frame = previousPlayerDestroy.frame;
        syncPlayerDestroyAudioNodes();
        syncEnemyDestroyAudioNodes();
      }
    },
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
    debugExplosionRuleProbe(ruleName) {
      const key = String(ruleName || "enemyDestroy");
      return { key, ...explosionRule(key) };
    },
    debugTankDestructionExplosionProbe() {
      const enemyFrames = () => {
        const ruleName = "enemyDestroy";
        addRuleExplosion(ruleName, 64, 64);
        const explosion = game.explosions.pop();
        return Array.from({ length: explosion.max }, (_, elapsed) => {
          explosion.ttl = explosion.max - elapsed;
          const presentation = tankDestructionPresentation(explosion);
          return {
            elapsed,
            style: explosion.style,
            phase: presentation.phase,
            frameName: presentation.frameName,
            width: presentation.width,
            height: presentation.height,
            x: presentation.x,
            y: presentation.y
          };
        });
      };
      const playerFrames = () => {
        const rule = explosionRule("playerDestroy");
        const totalTicks = Math.max(1, gameSettings().timings.playerRespawn);
        const player = {
          x: 57,
          y: 57,
          w: 14,
          h: 14,
          respawn: totalTicks,
          destroyTotalTicks: totalTicks,
          destroyExplosionTicks: Math.min(totalTicks, rule.ttl)
        };
        return Array.from({ length: totalTicks }, (_, elapsed) => {
          player.respawn = totalTicks - elapsed;
          const presentation = playerDestructionPresentation(player);
          return {
            elapsed,
            style: "playerDestroy",
            kind: presentation.kind,
            phase: presentation.phase,
            frameName: presentation.frameName,
            width: presentation.width,
            height: presentation.height,
            x: presentation.x,
            y: presentation.y
          };
        });
      };
      const previousExplosions = game.explosions;
      try {
        game.explosions = [];
        return {
          enemy: enemyFrames(),
          player: playerFrames()
        };
      } finally {
        game.explosions = previousExplosions;
      }
    },
    debugEnemyDestructionLifecycleProbe() {
      const previous = { ...game };
      const type = enemyTypeDefinitions()[0];
      const player = createPlayer(1);
      player.spawnFlash = 0;
      player.invuln = 0;
      const makeEnemy = (id, slotIndex, alternateMovement, x) => ({
        kind: "enemy",
        id,
        slotIndex,
        x: x === undefined ? 64 : x,
        y: 64,
        w: 14,
        h: 14,
        dir: DOWN,
        speed: type.speed,
        hp: 1,
        maxHp: 1,
        bulletSpeed: type.bullet,
        bulletPower: type.wallPower,
        reloadBase: type.reload,
        reload: 0,
        score: type.score,
        color: type.color,
        accent: "#2b2a28",
        typeIndex: 0,
        carrier: false,
        fireChance: 0,
        alternateMovement,
        blockedPauseTicks: 0,
        pendingTurn: false,
        spawnFlash: 0,
        alive: true,
        destroying: false,
        destroyTicks: 0,
        slide: 0,
        trackPhase: 0
      });
      const runLifecycle = (enemy) => {
        game.tick = 0;
        game.frameLow = 0;
        game.enemies = [enemy];
        game.enemyKilled = 0;
        destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false });
        const frames = [];
        while (enemy.alive && frames.length < 200) {
          const presentation = enemyDestructionPresentation(enemy);
          frames.push({
            destroyTicks: enemy.destroyTicks,
            kind: presentation.kind,
            phase: presentation.phase || null,
            text: presentation.text || null
          });
          game.tick += 1;
          game.frameLow = (game.frameLow + 1) & 0xff;
          updateEnemyDestruction(enemy);
        }
        return {
          displayFrames: frames.length,
          explosionFrames: frames.filter((frame) => frame.kind === "explosion").length,
          scoreFrames: frames.filter((frame) => frame.kind === "score").length,
          phases: frames
            .map((frame) => frame.phase)
            .filter((phase, index, phases) => phase && (index === 0 || phase !== phases[index - 1])),
          scoreText: frames.find((frame) => frame.kind === "score")?.text || null,
          released: !enemy.alive,
          enemyKilled: game.enemyKilled
        };
      };

      try {
        game.screen = "playing";
        game.demoMode = false;
        game.paused = false;
        game.playerCount = 1;
        game.stage = 1;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.players = [player];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        game.powerUp = null;

        const fast = runLifecycle(makeEnemy(100, 2, false));
        const normal = runLifecycle(makeEnemy(101, 2, true));

        const frozenEnemy = makeEnemy(102, 2, false);
        game.enemies = [frozenEnemy];
        game.enemyKilled = 0;
        game.freezeTimer = 999;
        destroyEnemy(frozenEnemy, player.id, { awardScore: false, trackKill: false });
        for (let tick = 0; tick < frozenEnemy.destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
          updateEnemies();
        }
        const timerFrozen = {
          released: !frozenEnemy.alive,
          enemyKilled: game.enemyKilled,
          freezeTimer: game.freezeTimer
        };
        game.freezeTimer = 0;

        const collisionEnemy = makeEnemy(103, 2, false, 40);
        const collisionPlayer = createPlayer(1);
        collisionPlayer.x = 26;
        collisionPlayer.y = 64;
        collisionPlayer.spawnFlash = 0;
        collisionPlayer.invuln = 0;
        game.players = [collisionPlayer];
        game.enemies = [collisionEnemy];
        destroyEnemy(collisionEnemy, collisionPlayer.id, { awardScore: false, trackKill: false });
        const collisionIgnored = canTankOccupy(collisionPlayer, collisionPlayer.x + 1, collisionPlayer.y);
        const duplicateBullet = {
          x: collisionEnemy.x + 5,
          y: collisionEnemy.y + 5,
          w: 4,
          h: 4,
          ownerKind: "player",
          ownerId: collisionPlayer.id,
          ownerKey: `player:${collisionPlayer.id}`,
          remove: false
        };
        const duplicateHit = hitTank(duplicateBullet);

        game.players = [player];
        const capacity = maxActiveEnemies();
        const capacityEnemies = Array.from({ length: capacity }, (_, index) =>
          makeEnemy(200 + index, capacity + 1 - index, false, 24 + index * 24)
        );
        for (const enemy of capacityEnemies) {
          destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false });
        }
        game.enemies = capacityEnemies;
        game.enemyKilled = 0;
        game.enemySpawned = capacity;
        game.nextSpawn = 0;
        spawnEnemies();
        const capacityBeforeRelease = {
          enemySpawned: game.enemySpawned,
          aliveSlots: game.enemies.filter((enemy) => enemy.alive).length
        };
        const releasedSlot = capacityEnemies[0].slotIndex;
        for (let tick = 0; tick < capacityEnemies[0].destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
          updateEnemyDestruction(capacityEnemies[0]);
        }
        spawnEnemies();
        const spawnedAfterRelease = game.enemies.find((enemy) => enemy.id === 100 + capacity);
        const capacityAfterRelease = {
          enemySpawned: game.enemySpawned,
          activeSlots: game.enemies.filter((enemy) => enemy.alive).length,
          reusedSlot: spawnedAfterRelease ? spawnedAfterRelease.slotIndex : null,
          releasedSlot
        };

        const grenadeEnemy = makeEnemy(300, 2, false);
        game.players = [player];
        game.enemies = [grenadeEnemy];
        game.scorePopups = [];
        destroyEnemy(grenadeEnemy, player.id, { awardScore: false, trackKill: false, showScore: false });
        grenadeEnemy.destroyTicks = grenadeEnemy.destroyExplosionTicks;
        const grenadeFinalState = enemyDestructionPresentation(grenadeEnemy);

        const lastEnemy = makeEnemy(400, 2, false);
        game.screen = "playing";
        game.players = [player];
        game.enemies = [lastEnemy];
        game.enemySpawned = enemyTotal();
        game.enemyKilled = enemyTotal() - 1;
        game.clearPendingTimer = 0;
        destroyEnemy(lastEnemy, player.id, { awardScore: false, trackKill: false });
        checkEndState();
        const clearOnHit = game.clearPendingTimer;
        for (let tick = 0; tick < lastEnemy.destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS - 1; tick += 1) {
          updateEnemyDestruction(lastEnemy);
        }
        checkEndState();
        const clearBeforeRelease = game.clearPendingTimer;
        updateEnemyDestruction(lastEnemy);
        checkEndState();
        const clearAfterRelease = {
          timer: game.clearPendingTimer,
          screen: game.screen,
          enemyKilled: game.enemyKilled
        };

        return {
          explosionTicks: explosionRule("enemyDestroy").ttl,
          scoreTicks: ENEMY_DESTRUCTION_SCORE_TICKS,
          fast,
          normal,
          timerFrozen,
          collisionIgnored,
          duplicateHit,
          duplicateBulletRemoved: duplicateBullet.remove,
          capacityBeforeRelease,
          capacityAfterRelease,
          grenadeFinalState,
          clearOnHit,
          clearBeforeRelease,
          clearAfterRelease
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugRenderTankDestructionExplosionFrame(ruleName, elapsed) {
      const key = ruleName === "playerDestroy" ? "playerDestroy" : "enemyDestroy";
      const rule = explosionRule(key);
      if (key === "playerDestroy") {
        const totalTicks = Math.max(1, gameSettings().timings.playerRespawn);
        const frame = clamp(Math.floor(Number(elapsed) || 0), 0, totalTicks - 1);
        const player = {
          x: 57,
          y: 57,
          w: 14,
          h: 14,
          respawn: totalTicks - frame,
          destroyTotalTicks: totalTicks,
          destroyExplosionTicks: Math.min(totalTicks, rule.ttl)
        };
        const presentation = playerDestructionPresentation(player);
        drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
          primary: rule.color,
          core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
        });
        return presentation;
      }
      const frame = clamp(Math.floor(Number(elapsed) || 0), 0, rule.ttl - 1);
      const explosion = {
        x: 64,
        y: 64,
        ttl: rule.ttl - frame,
        max: rule.ttl,
        color: rule.color,
        coreColor: rule.coreColor,
        style: key
      };
      return drawTankDestructionExplosion(explosion);
    },
    debugBulletImpactExplosionProbe() {
      const previous = { ...game };
      try {
        preparePausedDebugBattle(0);
        game.explosions = [];
        addRuleExplosion("brickHit", 64, 64);
        const beforePause = game.explosions[0].ttl;
        update();
        const afterPause = game.explosions[0].ttl;
        const frames = [];
        while (game.explosions.length) {
          const explosion = game.explosions[0];
          const presentation = explosionPresentation(explosion);
          frames.push({ ttl: explosion.ttl, phase: presentation.phase, size: presentation.size });
          updateExplosions();
        }
        return {
          ruleTtls: Object.fromEntries(Array.from(BULLET_IMPACT_EXPLOSION_RULES, (key) => [key, explosionRule(key).ttl])),
          beforePause,
          afterPause,
          frames
        };
      } finally {
        Object.assign(game, previous);
      }
    },
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
    debugStageIntroCurtainProbe(timer) {
      return stageIntroCurtainState(timer);
    },
    debugStageSelectCurtainProbe(timer) {
      return stageSelectCurtainState(timer);
    },
    debugRenderStageClearClosingFrame(timer) {
      const previous = {
        screen: game.screen,
        stage: game.stage,
        playerCount: game.playerCount,
        transitionTimer: game.transitionTimer,
        players: game.players,
        stageResultReason: game.stageResultReason,
        stageClearElapsed: game.stageClearElapsed,
        stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
        stageClearBonusAwarded: game.stageClearBonusAwarded
      };
      try {
        const player = createPlayer(1);
        player.score = 12300;
        player.stageKills = [1, 2, 3, 4];
        game.screen = "stageClearClosing";
        game.stage = 1;
        game.playerCount = 1;
        game.transitionTimer = clamp(Math.floor(Number(timer) || 0), 0, STAGE_CURTAIN_CLOSE_FRAMES);
        game.players = [player];
        game.stageResultReason = "clear";
        game.stageClearElapsed = stageResultDuration(game.players);
        game.stageClearBonusPlayerIds = [];
        game.stageClearBonusAwarded = true;
        render();
        return stageSelectCurtainState();
      } finally {
        Object.assign(game, previous);
      }
    },
    debugAdvanceStageTransition(frames) {
      const count = Math.max(0, Math.floor(Number(frames) || 0));
      for (let index = 0; index < count; index += 1) {
        if (game.screen !== "stageSelectClosing" && game.screen !== "stageIntro") break;
        update();
      }
      return {
        screen: game.screen,
        transitionTimer: game.transitionTimer,
        stage: game.stage,
        players: game.players.length
      };
    },
    debugAdvanceStageSelect(frames) {
      const count = Math.max(0, Math.floor(Number(frames) || 0));
      for (let index = 0; index < count; index += 1) {
        if (game.screen !== "stageSelect") break;
        update();
      }
      return {
        screen: game.screen,
        stage: game.stage,
        frameLow: game.frameLow,
        frameHigh: game.frameHigh
      };
    },
    debugAdvanceStageStartAudio(frames) {
      const count = Math.max(0, Math.floor(Number(frames) || 0));
      for (let index = 0; index < count; index += 1) {
        updateStageStartAudio();
        updatePauseAudio();
      }
      return {
        active: stageStartAudio.active,
        frame: stageStartAudio.frame,
        durationFrames: FREE_AUDIO_MANIFEST.events.stageStart.durationFrames,
        movementAudioMode: movementAudio.mode,
        paused: game.paused,
        pauseAudioActive: pauseAudio.active,
        pauseAudioFrame: pauseAudio.frame
      };
    },
    debugStageAdvanceProbe(stage) {
      return stageAdvanceResult(stage === undefined ? stageCount() : Number(stage));
    },
    debugStageCycleProbe(stage) {
      const value = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
      const sequence = enemySequenceForStage(value);
      const counts = sequence.reduce((result, enemy) => {
        result[enemy.typeIndex] = (result[enemy.typeIndex] || 0) + 1;
        return result;
      }, {});
      return {
        stage: value,
        stageCount: stageCount(),
        stageCycleLimit: stageCycleLimit(),
        mapDataStage: mapDataStage(value),
        enemyDataStage: enemyDataStage(value),
        enemyTotal: enemyTotal(value),
        carrierNumbers: sequence.map((enemy, index) => enemy.carrier ? index + 1 : null).filter(Boolean),
        enemyTypeCounts: counts,
        spawnIndices: sequence.map((enemy) => enemy.spawnIndex),
        onePlayerMaxActiveEnemies: maxActiveEnemies(value, 1),
        twoPlayerMaxActiveEnemies: maxActiveEnemies(value, 2),
        defaultEnemySpawnDelay: defaultEnemySpawnDelay(value),
        twoPlayerDefaultEnemySpawnDelay: scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(value), 2),
        firstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers((gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay, 1),
        twoPlayerFirstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers((gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay, 2),
        advance: stageAdvanceResult(value)
      };
    },
    debugOriginalEnemyGroupsProbe() {
      const names = defaultEnemyTypes.map((type) => type.name);
      return summarizeEnemySequences(builtInStagePack.enemies, names);
    },
    debugStageClearDelayProbe(framesLeft, baseAlive, killedCount) {
      const timer = Math.max(0, Math.floor(Number(framesLeft) || 0));
      const previous = {
        screen: game.screen,
        paused: game.paused,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        enemyKilled: game.enemyKilled,
        enemySpawned: game.enemySpawned,
        clearPendingTimer: game.clearPendingTimer,
        transitionTimer: game.transitionTimer,
        gameOverTimer: game.gameOverTimer,
        stageClearElapsed: game.stageClearElapsed,
        stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
        stageClearBonusAwarded: game.stageClearBonusAwarded
      };
      const total = enemyTotal();
      const player = {
        id: 1,
        alive: true,
        lives: 1,
        respawn: 0,
        score: 0,
        nextBonusLifeIndex: 0,
        stagePoints: 0,
        stageKills: Array(enemyTypeDefinitions().length).fill(0)
      };
      try {
        game.screen = "playing";
        game.paused = false;
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: baseAlive !== false };
        game.players = [player];
        game.enemies = [];
        game.enemyKilled = killedCount === undefined ? total : Math.max(0, Math.floor(Number(killedCount) || 0));
        game.enemySpawned = total;
        game.clearPendingTimer = timer;
        game.transitionTimer = 0;
        checkEndState();
        return {
          screen: game.screen,
          enemyKilled: game.enemyKilled,
          enemySpawned: game.enemySpawned,
          clearPendingTimer: game.clearPendingTimer,
          transitionTimer: game.transitionTimer,
          gameOverTimer: game.gameOverTimer
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugStageClearAdvanceProbe(stage) {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        stage: game.stage,
        tick: game.tick,
        transitionTimer: game.transitionTimer,
        grid: game.grid,
        customGrid: game.customGrid,
        constructedGrid: game.constructedGrid,
        constructionStageActive: game.constructionStageActive,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        powerUp: game.powerUp,
        lastPowerUpSpawn: game.lastPowerUpSpawn,
        powerUpSpawnBag: game.powerUpSpawnBag.slice(),
        powerUpSpawnBagKey: game.powerUpSpawnBagKey,
        base: game.base,
        enemySpawned: game.enemySpawned,
        enemyKilled: game.enemyKilled,
        nextSpawn: game.nextSpawn,
        clearPendingTimer: game.clearPendingTimer,
        gameOverTimer: game.gameOverTimer,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer,
        stageClearElapsed: game.stageClearElapsed,
        stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
        stageClearBonusAwarded: game.stageClearBonusAwarded
      };
      try {
        game.screen = "stageClear";
        game.paused = false;
        game.stage = Math.max(1, Math.floor(Number(stage) || 1));
        game.customGrid = null;
        game.players = [createPlayer(1)];
        game.stageClearElapsed = 0;
        game.stageClearBonusPlayerIds = [];
        game.stageClearBonusAwarded = true;
        game.transitionTimer = 1;
        update();
        const closingStart = {
          screen: game.screen,
          stage: game.stage,
          transitionTimer: game.transitionTimer,
          curtain: stageSelectCurtainState()
        };
        update();
        const closingFirstStep = {
          screen: game.screen,
          stage: game.stage,
          transitionTimer: game.transitionTimer,
          curtain: stageSelectCurtainState()
        };
        while (game.screen === "stageClearClosing" && game.transitionTimer > 1) update();
        const closingLastStep = {
          screen: game.screen,
          stage: game.stage,
          transitionTimer: game.transitionTimer,
          curtain: stageSelectCurtainState()
        };
        if (game.screen === "stageClearClosing") update();
        return {
          screen: game.screen,
          stage: game.stage,
          transitionTimer: game.transitionTimer,
          clearPendingTimer: game.clearPendingTimer,
          enemySpawned: game.enemySpawned,
          nextSpawn: game.nextSpawn,
          constructionStageActive: game.constructionStageActive,
          closingStart,
          closingFirstStep,
          closingLastStep
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugStageCyclePreservesPlayerStateProbe(stage) {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        stage: game.stage,
        tick: game.tick,
        transitionTimer: game.transitionTimer,
        grid: game.grid,
        customGrid: game.customGrid,
        constructedGrid: game.constructedGrid,
        constructionStageActive: game.constructionStageActive,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        powerUp: game.powerUp,
        lastPowerUpSpawn: game.lastPowerUpSpawn,
        powerUpSpawnBag: game.powerUpSpawnBag.slice(),
        powerUpSpawnBagKey: game.powerUpSpawnBagKey,
        base: game.base,
        enemySpawned: game.enemySpawned,
        enemyKilled: game.enemyKilled,
        nextSpawn: game.nextSpawn,
        clearPendingTimer: game.clearPendingTimer,
        gameOverTimer: game.gameOverTimer,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer,
        stageClearElapsed: game.stageClearElapsed,
        stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
        stageClearBonusAwarded: game.stageClearBonusAwarded
      };
      const player = createPlayer(1);
      player.score = 54321;
      player.level = 3;
      player.lives = 4;
      player.nextBonusLifeIndex = 1;
      player.stagePoints = 1200;
      player.stageKills = [2, 1, 0, 0];
      player.totalKills = [7, 5, 3, 1];
      try {
        game.screen = "stageClear";
        game.paused = false;
        game.stage = Math.max(1, Math.floor(Number(stage) || stageCycleLimit()));
        game.customGrid = null;
        game.players = [player];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.powerUp = null;
        game.lastPowerUpSpawn = "6,6";
        resetPowerUpSpawnBag();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.enemySpawned = enemyTotal(game.stage);
        game.enemyKilled = enemyTotal(game.stage);
        game.nextSpawn = 0;
        game.clearPendingTimer = 0;
        game.gameOverTimer = 0;
        game.freezeTimer = 0;
        game.shovelTimer = 0;
        game.stageClearElapsed = 0;
        game.stageClearBonusPlayerIds = [];
        game.stageClearBonusAwarded = true;
        game.transitionTimer = 1;

        update();
        while (game.screen === "stageClearClosing") update();
        const after = game.players[0];
        return {
          screen: game.screen,
          stage: game.stage,
          mapDataStage: mapDataStage(game.stage),
          enemyDataStage: enemyDataStage(game.stage),
          score: after.score,
          level: after.level,
          lives: after.lives,
          nextBonusLifeIndex: after.nextBonusLifeIndex,
          stagePoints: after.stagePoints,
          stageKills: after.stageKills.slice(),
          totalKills: after.totalKills.slice(),
          enemySpawned: game.enemySpawned,
          clearPendingTimer: game.clearPendingTimer,
          powerUp: game.powerUp,
          lastPowerUpSpawn: game.lastPowerUpSpawn,
          powerUpSpawnBagLength: game.powerUpSpawnBag.length
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugCompletedStageAdvanceProbe(stage, killedCount) {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        stage: game.stage,
        tick: game.tick,
        transitionTimer: game.transitionTimer,
        grid: game.grid,
        customGrid: game.customGrid,
        constructedGrid: game.constructedGrid,
        constructionStageActive: game.constructionStageActive,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        powerUp: game.powerUp,
        lastPowerUpSpawn: game.lastPowerUpSpawn,
        powerUpSpawnBag: game.powerUpSpawnBag.slice(),
        powerUpSpawnBagKey: game.powerUpSpawnBagKey,
        base: game.base,
        enemySpawned: game.enemySpawned,
        enemyKilled: game.enemyKilled,
        nextSpawn: game.nextSpawn,
        clearPendingTimer: game.clearPendingTimer,
        gameOverTimer: game.gameOverTimer,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer,
        stageClearElapsed: game.stageClearElapsed,
        stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
        stageClearBonusAwarded: game.stageClearBonusAwarded
      };
      const stageValue = Math.max(1, Math.floor(Number(stage) || 1));
      const total = enemyTotal(stageValue);
      const timings = gameSettings().timings;
      const transitions = [];
      try {
        game.screen = "playing";
        game.paused = false;
        game.stage = stageValue;
        game.tick = 0;
        game.transitionTimer = 0;
        game.grid = createStageGrid(stageValue);
        prepareBattleGrid(game.grid);
        game.customGrid = null;
        game.players = [createPlayer(1)];
        const maxFrames = timings.stageClearDelay + stageResultDuration(game.players) + STAGE_CURTAIN_CLOSE_FRAMES + timings.stageIntro + 5;
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.powerUp = null;
        game.lastPowerUpSpawn = null;
        resetPowerUpSpawnBag();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.enemySpawned = total;
        game.enemyKilled = killedCount === undefined ? total : Math.max(0, Math.floor(Number(killedCount) || 0));
        game.nextSpawn = 0;
        game.clearPendingTimer = 0;
        game.gameOverTimer = 0;
        game.freezeTimer = 0;
        game.shovelTimer = 0;

        let frames = 0;
        for (; frames < maxFrames;) {
          const before = game.screen;
          update();
          frames += 1;
          if (game.screen !== before) {
            transitions.push({
              frame: frames,
              screen: game.screen,
              stage: game.stage,
              clearPendingTimer: game.clearPendingTimer,
              transitionTimer: game.transitionTimer
            });
          }
          if (game.screen === "stageIntro" && game.stage !== stageValue) break;
        }

        return {
          screen: game.screen,
          stage: game.stage,
          frames,
          transitions,
          enemySpawned: game.enemySpawned,
          enemyKilled: game.enemyKilled,
          clearPendingTimer: game.clearPendingTimer,
          transitionTimer: game.transitionTimer
        };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugGameOverSlideProbe() {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        gameOverTimer: game.gameOverTimer
      };
      const timings = gameSettings().timings;
      const slideDuration = timings.gameOverSlide;
      const holdDuration = timings.gameOverHold;
      const duration = gameOverFieldDuration();
      const timers = [
        { phase: "start", timer: duration },
        { phase: "firstMove", timer: Math.max(0, duration - 1) },
        { phase: "slideEnd", timer: holdDuration },
        { phase: "firstHold", timer: Math.max(0, holdDuration - 1) },
        { phase: "end", timer: 0 }
      ];
      try {
        game.screen = "playing";
        game.paused = true;
        game.gameOverTimer = 0;
        enterGameOver();
        const entry = {
          screen: game.screen,
          paused: game.paused,
          timer: game.gameOverTimer
        };
        const frames = timers.map(({ phase, timer }) => {
          game.gameOverTimer = timer;
          renderGameOver();
          return { phase, timer, y: gameOverBannerY(timer) };
        });
        return { slideDuration, holdDuration, duration, entry, frames };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugGameOverBattleProbe() {
      const previous = { ...game };
      const previousFirePresses = new Set(pendingFirePresses);
      const rightWasHeld = keys.has("ArrowRight");
      const player = createPlayer(1);
      const enemy = { alive: true, spawnFlash: 2 };
      const bullet = {
        x: 96,
        y: 96,
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
      try {
        player.x = 48;
        player.y = 48;
        player.spawnFlash = 0;
        player.invuln = 0;
        player.reload = 2;
        game.screen = "gameOver";
        game.demoMode = false;
        game.paused = false;
        game.tick = 0;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
        game.players = [player];
        game.enemies = [enemy];
        game.bullets = [bullet];
        game.explosions = [{ x: 80, y: 80, ttl: 2, max: 2, rule: "enemyHit" }];
        game.scorePopups = [{ value: 100, x: 80, y: 80, ttl: 2, max: 2, style: "float" }];
        game.powerUp = { type: "helmet", x: 8, y: 8, w: 16, h: 16, ttl: 2 };
        game.enemySpawned = enemyTotal();
        game.nextSpawn = 0;
        game.gameOverTimer = 2;
        game.freezeTimer = 0;
        game.shovelTimer = 0;
        keys.add("ArrowRight");
        pendingFirePresses.add("Space");

        const before = {
          tick: game.tick,
          timer: game.gameOverTimer,
          playerX: player.x,
          playerReload: player.reload,
          enemySpawnFlash: enemy.spawnFlash,
          bulletX: bullet.x,
          explosionTtl: game.explosions[0].ttl,
          popupTtl: game.scorePopups[0].ttl,
          powerUpTtl: game.powerUp.ttl,
          bulletCount: game.bullets.length
        };
        update();
        return {
          before,
          after: {
            screen: game.screen,
            tick: game.tick,
            timer: game.gameOverTimer,
            playerX: player.x,
            playerReload: player.reload,
            enemySpawnFlash: enemy.spawnFlash,
            bulletX: bullet.x,
            explosionTtl: game.explosions[0] ? game.explosions[0].ttl : 0,
            popupTtl: game.scorePopups[0] ? game.scorePopups[0].ttl : 0,
            powerUpTtl: game.powerUp ? game.powerUp.ttl : 0,
            bulletCount: game.bullets.length
          }
        };
      } finally {
        Object.assign(game, previous);
        pendingFirePresses.clear();
        for (const code of previousFirePresses) pendingFirePresses.add(code);
        if (!rightWasHeld) keys.delete("ArrowRight");
      }
    },
    debugGameOverReturnProbe() {
      const previous = { ...game };
      try {
        game.screen = "gameOver";
        game.paused = false;
        game.tick = 0;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
        game.players = [];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.scorePopups = [];
        game.powerUp = null;
        game.enemySpawned = enemyTotal();
        game.nextSpawn = 0;
        game.gameOverTimer = 1;
        game.fullGameOverElapsed = 0;
        game.newHighScoreAtGameOver = false;
        update();
        const finalFrame = {
          screen: game.screen,
          timer: game.gameOverTimer
        };
        update();
        const afterFinalFrame = {
          screen: game.screen,
          timer: game.gameOverTimer,
          reason: game.stageResultReason
        };
        return { finalFrame, afterFinalFrame };
      } finally {
        stopGameOverAudio();
        Object.assign(game, previous);
      }
    },
    debugGameOverStageResultProbe() {
      const previous = { ...game };
      const p1 = createPlayer(1);
      const p2 = createPlayer(2);
      p1.alive = false;
      p1.lives = 0;
      p1.score = 21000;
      p1.stageKills = [5, 1, 0, 0];
      p1.stagePoints = 700;
      p2.alive = false;
      p2.lives = 0;
      p2.score = 800;
      p2.stageKills = [2, 0, 1, 0];
      p2.stagePoints = 500;
      try {
        game.stagePack = builtInStagePack;
        game.screen = "playing";
        game.paused = false;
        game.stage = 5;
        game.playerCount = 2;
        game.customGrid = null;
        game.players = [p1, p2];
        game.runHighScoreBaseline = 20000;
        game.newHighScoreAtGameOver = false;
        enterGameOver();
        game.gameOverTimer = 0;
        finishGameOverScreen();
        const entry = {
          screen: game.screen,
          reason: game.stageResultReason,
          stage: game.stage,
          elapsed: game.stageClearElapsed,
          timer: game.transitionTimer,
          bonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
          bonusAwarded: game.stageClearBonusAwarded,
          newHighScore: game.newHighScoreAtGameOver
        };
        const counted = stageClearPresentation(game.players, 200);
        const scoreBeforeFinish = p1.score;
        game.transitionTimer = 2;
        update();
        const beforeEnd = {
          screen: game.screen,
          reason: game.stageResultReason,
          stage: game.stage,
          timer: game.transitionTimer,
          score: p1.score,
          bonusAwarded: game.stageClearBonusAwarded
        };
        update();
        const afterEnd = {
          screen: game.screen,
          stage: game.stage,
          elapsed: game.fullGameOverElapsed,
          score: p1.score,
          bonusAwarded: game.stageClearBonusAwarded,
          newHighScore: game.newHighScoreAtGameOver
        };
        finishFullGameOverScreen();
        const highScoreRoute = {
          screen: game.screen,
          elapsed: game.highScoreScreenElapsed
        };

        stopHighScoreAudio();
        game.stage = gameSettings().stageAdvance.extendedLoopEndStage;
        game.customGrid = null;
        game.newHighScoreAtGameOver = false;
        enterStageResult("gameOver");
        game.transitionTimer = 1;
        update();
        const wrappedStage = {
          screen: game.screen,
          stage: game.stage
        };
        return {
          duration: entry.timer,
          entry,
          visibleRows: counted.rows.map((row) => ({
            typeIndex: row.typeIndex,
            p1VisibleKills: row.p1VisibleKills,
            p2VisibleKills: row.p2VisibleKills
          })),
          scoreBeforeFinish,
          beforeEnd,
          afterEnd,
          highScoreRoute,
          wrappedStage
        };
      } finally {
        stopGameOverAudio();
        stopHighScoreAudio();
        Object.assign(game, previous);
      }
    },
    debugStageClearBonusProbe(p1Kills, p2Kills, p1Lives, p2Lives) {
      const players = [
        {
          id: 1,
          lives: p1Lives === undefined ? 1 : Math.max(0, Math.floor(Number(p1Lives) || 0)),
          stageKills: [Math.max(0, Math.floor(Number(p1Kills) || 0))]
        },
        {
          id: 2,
          lives: p2Lives === undefined ? 1 : Math.max(0, Math.floor(Number(p2Lives) || 0)),
          stageKills: [Math.max(0, Math.floor(Number(p2Kills) || 0))]
        }
      ];
      return {
        points: gameSettings().stageClearBonus.points,
        recipients: stageClearBonusRecipients(players).map((player) => player.id)
      };
    },
    debugStageClearResultRowsProbe(p1Kills, p2Kills, p1BonusPoints, p2BonusPoints) {
      const summary = stageClearResultSummary([
        makeStageClearResultProbePlayer(1, p1Kills, p1BonusPoints),
        makeStageClearResultProbePlayer(2, p2Kills, p2BonusPoints)
      ]);
      return {
        rows: summary.rows.map((row) => ({
          typeIndex: row.typeIndex,
          score: row.score,
          p1Kills: row.p1Kills,
          p1Points: row.p1Points,
          p2Kills: row.p2Kills,
          p2Points: row.p2Points
        })),
        p1EnemyPoints: summary.p1EnemyPoints,
        p2EnemyPoints: summary.p2EnemyPoints,
        p1BonusPoints: summary.p1BonusPoints,
        p2BonusPoints: summary.p2BonusPoints,
        p1StagePoints: summary.p1StagePoints,
        p2StagePoints: summary.p2StagePoints
      };
    },
    debugStageClearRowLayoutProbe() {
      const layout = STAGE_RESULT_ROW_LAYOUT;
      const leftArrowRight = layout.leftArrowX + layout.arrowWidth;
      const miniTankRight = layout.miniTankX + layout.miniTankWidth;
      return {
        ...layout,
        leftGap: layout.miniTankX - leftArrowRight,
        rightGap: layout.rightArrowX - miniTankRight,
        leftOverlapsTank: leftArrowRight > layout.miniTankX,
        tankOverlapsRight: miniTankRight > layout.rightArrowX
      };
    },
    debugStageClearPresentationProbe(p1Kills, p2Kills, elapsed) {
      const players = [
        makeStageClearResultProbePlayer(1, p1Kills, 0),
        makeStageClearResultProbePlayer(2, p2Kills, 0)
      ];
      const presentation = stageClearPresentation(players, elapsed);
      return {
        rows: presentation.rows.map((row) => ({
          typeIndex: row.typeIndex,
          p1Kills: row.p1Kills,
          p2Kills: row.p2Kills,
          firstCountFrame: row.firstCountFrame,
          countStep: row.countStep,
          p1VisibleKills: row.p1VisibleKills,
          p2VisibleKills: row.p2VisibleKills,
          p1VisiblePoints: row.p1VisiblePoints,
          p2VisiblePoints: row.p2VisiblePoints
        })),
        totalsRevealFrame: presentation.totalsRevealFrame,
        bonusRevealFrame: presentation.bonusRevealFrame,
        endFrame: presentation.endFrame,
        duration: stageResultDuration(players),
        showTotals: presentation.showTotals,
        showBonus: presentation.showBonus
      };
    },
    stagePackSchema() {
      return createStagePackSchema();
    }
  };

  let last = performance.now();
  let accumulator = 0;

  function frame(now) {
    const elapsed = Math.min(80, now - last);
    last = now;
    accumulator += elapsed;
    while (accumulator >= STEP_MS) {
      update();
      accumulator -= STEP_MS;
    }
    render();
    requestAnimationFrame(frame);
  }

  loadHighScore();
  game.grid = createStageGrid(game.stage);
  requestAnimationFrame(frame);
})();
