(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.moduleDeps = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var runtimeModules = null;

  function requireRuntimeModule(name) {
    if (!runtimeModules) {
      runtimeModules = (
        (typeof window !== "undefined" ? window : globalThis).TankDefender8Modules || {}
      );
    }
    if (!runtimeModules[name]) {
      throw new Error(name + " module must load before moduleDeps");
    }
    return runtimeModules[name];
  }

  // ── Core ───────────────────────────────────────────────────────────────────
  var battleRandom = requireRuntimeModule("battleRandom");
  var directions = requireRuntimeModule("directions");
  var frameCounter = requireRuntimeModule("frameCounter");
  var geometry = requireRuntimeModule("geometry");

  // ── Config ─────────────────────────────────────────────────────────────────
  var combatSettings = requireRuntimeModule("combatSettings");
  var enemyAiSettings = requireRuntimeModule("enemyAiSettings");
  var enemySpawnSettings = requireRuntimeModule("enemySpawnSettings");
  var enemyTypes = requireRuntimeModule("enemyTypes");
  var explosionSettings = requireRuntimeModule("explosionSettings");
  var gameSessionSettings = requireRuntimeModule("gameSessionSettings");
  var playerMovementSettings = requireRuntimeModule("playerMovementSettings");
  var playerUpgrades = requireRuntimeModule("playerUpgrades");
  var powerUpSettings = requireRuntimeModule("powerUpSettings");
  var stageFlowSettings = requireRuntimeModule("stageFlowSettings");
  var stageSettings = requireRuntimeModule("stageSettings");
  var timingSettings = requireRuntimeModule("timingSettings");
  var valueNormalization = requireRuntimeModule("valueNormalization");

  // ── Entities ───────────────────────────────────────────────────────────────
  var enemyState = requireRuntimeModule("enemyState");
  var playerState = requireRuntimeModule("playerState");
  var powerUpState = requireRuntimeModule("powerUpState");
  var projectileState = requireRuntimeModule("projectileState");
  var transientEffectState = requireRuntimeModule("transientEffectState");

  // ── Rules ──────────────────────────────────────────────────────────────────
  var enemyAiRules = requireRuntimeModule("enemyAiRules");
  var enemySpawnRules = requireRuntimeModule("enemySpawnRules");
  var powerUpCollectionRules = requireRuntimeModule("powerUpCollectionRules");
  var powerUpEffectRules = requireRuntimeModule("powerUpEffectRules");
  var powerUpSpawnRules = requireRuntimeModule("powerUpSpawnRules");
  var projectileCollisionRules = requireRuntimeModule("projectileCollisionRules");
  var projectileImpactRules = requireRuntimeModule("projectileImpactRules");
  var scoreRules = requireRuntimeModule("scoreRules");
  var stageResultRules = requireRuntimeModule("stageResultRules");
  var tankCollisionRules = requireRuntimeModule("tankCollisionRules");
  var terrainCollisionRules = requireRuntimeModule("terrainCollisionRules");
  var wallDamageRules = requireRuntimeModule("wallDamageRules");

  // ── Stages ─────────────────────────────────────────────────────────────────
  var battlefieldGrid = requireRuntimeModule("battlefieldGrid");
  var builtInStagePack = requireRuntimeModule("builtInStagePack");
  var enemySequences = requireRuntimeModule("enemySequences");
  var proceduralStage = requireRuntimeModule("proceduralStage");
  var stageGrid = requireRuntimeModule("stageGrid");
  var stagePack = requireRuntimeModule("stagePack");
  var stagePackSchema = requireRuntimeModule("stagePackSchema");
  var stageRouting = requireRuntimeModule("stageRouting");
  var stageRuntime = requireRuntimeModule("stageRuntime");
  var stagePackDiagnostics = requireRuntimeModule("stagePackDiagnostics");
  var stageResultDiagnostics = requireRuntimeModule("stageResultDiagnostics");
  var stageFlowDiagnostics = requireRuntimeModule("stageFlowDiagnostics");
  var screenFlowDiagnostics = requireRuntimeModule("screenFlowDiagnostics");
  var wallDiagnostics = requireRuntimeModule("wallDiagnostics");
  var enemyDiagnostics = requireRuntimeModule("enemyDiagnostics");
  var effectDiagnostics = requireRuntimeModule("effectDiagnostics");
  var debugSnapshot = requireRuntimeModule("debugSnapshot");

  // ── Presentation ───────────────────────────────────────────────────────────
  var audioPresentation = requireRuntimeModule("audioPresentation");
  var battleHudPresentation = requireRuntimeModule("battleHudPresentation");
  var effectPresentation = requireRuntimeModule("effectPresentation");
  var freeSpriteManifest = requireRuntimeModule("freeSpriteManifest");
  var pixelFont = requireRuntimeModule("pixelFont");
  var screenPresentation = requireRuntimeModule("screenPresentation");
  var tankPresentation = requireRuntimeModule("tankPresentation");

  // ── Audio ──────────────────────────────────────────────────────────────────
  var audioMixRules = requireRuntimeModule("audioMixRules");
  var fixedFrameAudioState = requireRuntimeModule("fixedFrameAudioState");
  var freeAudioManifest = requireRuntimeModule("freeAudioManifest");
  var audioDiagnostics = requireRuntimeModule("audioDiagnostics");

  // ── Editor ─────────────────────────────────────────────────────────────────
  var editorRules = requireRuntimeModule("editorRules");
  var editorStageFormat = requireRuntimeModule("editorStageFormat");

  // ── Runtime (shared-state) ─────────────────────────────────────────────────
  var sharedState = requireRuntimeModule("sharedState");

  return {
    // Core
    advanceBattleRandom: battleRandom.advanceBattleRandom,
    DIR_X: directions.DIR_X,
    DIR_Y: directions.DIR_Y,
    DOWN: directions.DOWN,
    LEFT: directions.LEFT,
    RIGHT: directions.RIGHT,
    UP: directions.UP,
    advanceFrameCounter: frameCounter.advanceFrameCounter,
    resetFrameCounter: frameCounter.resetFrameCounter,
    clamp: geometry.clamp,
    rectOverlapArea: geometry.rectOverlapArea,
    rectsOverlap: geometry.rectsOverlap,

    // Config — combat
    combatSettings: combatSettings,

    // Config — enemy AI
    enemyAiSettings: enemyAiSettings,

    // Config — enemy spawn
    DEFAULT_ENEMY_SPAWN_PACING: enemySpawnSettings.DEFAULT_ENEMY_SPAWN_PACING,
    calculateEnemySpawnDelay: enemySpawnSettings.calculateEnemySpawnDelay,
    scaleEnemySpawnDelay: enemySpawnSettings.scaleEnemySpawnDelay,

    // Config — enemy types
    DEFAULT_ENEMY_TYPES: enemyTypes.DEFAULT_ENEMY_TYPES,
    ENEMY_FIRE_CHANCE: enemyTypes.ENEMY_FIRE_CHANCE,
    ENEMY_MOVE_SPEED: enemyTypes.ENEMY_MOVE_SPEED,
    POWER_UP_TYPES: enemyTypes.POWER_UP_TYPES,
    cloneEnemyTypes: enemyTypes.cloneEnemyTypes,

    // Config — explosion
    DEFAULT_EXPLOSION_CORE_COLOR: explosionSettings.DEFAULT_EXPLOSION_CORE_COLOR,
    DEFAULT_EXPLOSION_RULES: explosionSettings.DEFAULT_EXPLOSION_RULES,
    cloneExplosionRules: explosionSettings.cloneExplosionRules,

    // Config — game session
    gameSessionSettings: gameSessionSettings,

    // Config — player movement
    DEFAULT_PLAYER_MOVEMENT: playerMovementSettings.DEFAULT_PLAYER_MOVEMENT,
    clonePlayerMovementSettings: playerMovementSettings.clonePlayerMovementSettings,

    // Config — player upgrades
    DEFAULT_PLAYER_UPGRADE_RULES: playerUpgrades.DEFAULT_PLAYER_UPGRADE_RULES,
    clonePlayerUpgradeRules: playerUpgrades.clonePlayerUpgradeRules,

    // Config — power-up
    shouldClearPowerUpForCarrierSpawn: powerUpSettings.shouldClearPowerUpForCarrierSpawn,
    shouldReleaseCarrierPowerUp: powerUpSettings.shouldReleaseCarrierPowerUp,

    // Config — stage flow
    stageFlowSettings: stageFlowSettings,

    // Config — stage
    DEFAULT_POWERUP_SPAWNS: stageSettings.DEFAULT_POWERUP_SPAWNS,
    powerUpPixelToTilePoint: stageSettings.powerUpPixelToTilePoint,

    // Config — timing
    timingSettings: timingSettings,

    // Config — value normalization
    valueNormalization: valueNormalization,

    // Entities
    ENEMY_DESTRUCTION_SCORE_TICKS: enemyState.ENEMY_DESTRUCTION_SCORE_TICKS,
    advanceEnemyDestructionState: enemyState.advanceEnemyDestructionState,
    createEnemyState: enemyState.createEnemyState,
    advancePlayerDestructionState: playerState.advancePlayerDestructionState,
    beginPlayerDestructionState: playerState.beginPlayerDestructionState,
    createPlayerState: playerState.createPlayerState,
    resetPlayerState: playerState.resetPlayerState,
    resolvePlayerDeathState: playerState.resolvePlayerDeathState,
    POWER_UP_SIZE: powerUpState.POWER_UP_SIZE,
    POWERUP_SIZE: powerUpState.POWER_UP_SIZE,
    advancePowerUpState: powerUpState.advancePowerUpState,
    createPowerUpState: powerUpState.createPowerUpState,
    createProjectileState: projectileState.createProjectileState,
    advanceTimedStates: transientEffectState.advanceTimedStates,
    createExplosionState: transientEffectState.createExplosionState,
    createScorePopupState: transientEffectState.createScorePopupState,

    // Rules
    directionTowardTarget: enemyAiRules.directionTowardTarget,
    enemyAiChanceMatches: enemyAiRules.enemyAiChanceMatches,
    enemyAiPhaseForInterval: enemyAiRules.enemyAiPhaseForInterval,
    isEnemyAtTurnIntersection: enemyAiRules.isEnemyAtTurnIntersection,
    isEnemyMovementFrame: enemyAiRules.isEnemyMovementFrame,
    selectEnemyTargetPlayer: enemyAiRules.selectEnemyTargetPlayer,
    shouldEnemyFireForByte: enemyAiRules.shouldEnemyFireForByte,
    targetableEnemyPlayers: enemyAiRules.targetableEnemyPlayers,
    activeEnemyCount: enemySpawnRules.activeEnemyCount,
    findAvailableEnemySlot: enemySpawnRules.findAvailableEnemySlot,
    isEnemySpawnPointOccupied: enemySpawnRules.isEnemySpawnPointOccupied,
    selectEnemySpawnIndex: enemySpawnRules.selectEnemySpawnIndex,
    canPlayerCollectPowerUp: powerUpCollectionRules.canPlayerCollectPowerUp,
    findPowerUpCollector: powerUpCollectionRules.findPowerUpCollector,
    applyPowerUpEffect: powerUpEffectRules.applyPowerUpEffect,
    ORIGINAL_POWER_UP_RANDOM_TABLE: powerUpSpawnRules.ORIGINAL_POWER_UP_RANDOM_TABLE,
    dedupePowerUpSpots: powerUpSpawnRules.dedupePowerUpSpots,
    powerUpSpawnKey: powerUpSpawnRules.powerUpSpawnKey,
    powerUpTypeForRandomByte: powerUpSpawnRules.powerUpTypeForRandomByte,
    selectPowerUpSpawnSpot: powerUpSpawnRules.selectPowerUpSpawnSpot,
    resolveBulletCollisions: projectileCollisionRules.resolveBulletCollisions,
    projectileBoundaryImpactPoint: projectileImpactRules.projectileBoundaryImpactPoint,
    projectileOutsideField: projectileImpactRules.projectileOutsideField,
    wallHitSoundName: projectileImpactRules.wallHitSoundName,
    addScorePoints: scoreRules.addScorePoints,
    awardBonusLives: scoreRules.awardBonusLives,
    createStageResultPresentation: stageResultRules.createStageResultPresentation,
    selectStageClearBonusRecipients: stageResultRules.selectStageClearBonusRecipients,
    stageResultVisibleKillCount: stageResultRules.stageResultVisibleKillCount,
    bulletHitsTankByCenter: tankCollisionRules.bulletHitsTankByCenter,
    canTankOccupyRect: tankCollisionRules.canTankOccupyRect,
    entityRect: tankCollisionRules.entityRect,
    filterActiveTankCollisionPeers: tankCollisionRules.filterActiveTankCollisionPeers,
    totalRectOverlapArea: tankCollisionRules.totalRectOverlapArea,
    brickFragmentRect: terrainCollisionRules.brickFragmentRect,
    overlappedBrickFragments: terrainCollisionRules.overlappedBrickFragments,
    overlappedQuarters: terrainCollisionRules.overlappedQuarters,
    quarterRect: terrainCollisionRules.quarterRect,
    rectHitsSolidTerrain: terrainCollisionRules.rectHitsSolidTerrain,
    solidTerrainOverlapArea: terrainCollisionRules.solidTerrainOverlapArea,
    cloneWallRules: wallDamageRules.cloneWallRules,
    damageWall: wallDamageRules.damageWall,

    // Stages
    buildBaseWall: battlefieldGrid.buildBaseWall,
    makeOriginalConstructionGrid: battlefieldGrid.makeOriginalConstructionGrid,
    prepareBattleGrid: battlefieldGrid.prepareBattleGrid,
    prepareConstructedBattleGrid: battlefieldGrid.prepareConstructedBattleGrid,
    shovelWallTypeForTimer: battlefieldGrid.shovelWallTypeForTimer,
    createBuiltInStagePack: builtInStagePack.createBuiltInStagePack,
    DEFAULT_ENEMY_TOTAL: enemySequences.DEFAULT_ENEMY_TOTAL,
    DEFAULT_ORIGINAL_STAGE_COUNT: enemySequences.DEFAULT_ORIGINAL_STAGE_COUNT,
    summarizeEnemySequences: enemySequences.summarizeEnemySequences,
    proceduralStage: proceduralStage,
    BRICK_QUARTER_FRAGMENT_MASKS: stageGrid.BRICK_QUARTER_FRAGMENT_MASKS,
    FULL_BRICK_FRAGMENT_MASK: stageGrid.FULL_BRICK_FRAGMENT_MASK,
    GRID: stageGrid.GRID,
    QUAD_GRID: stageGrid.QUAD_GRID,
    TILE_TYPES: stageGrid.TILE_TYPES,
    EMPTY: stageGrid.TILE_TYPES.EMPTY,
    BRICK: stageGrid.TILE_TYPES.BRICK,
    STEEL: stageGrid.TILE_TYPES.STEEL,
    WATER: stageGrid.TILE_TYPES.WATER,
    FOREST: stageGrid.TILE_TYPES.FOREST,
    ICE: stageGrid.TILE_TYPES.ICE,
    WALL_FRAGMENT: stageGrid.WALL_FRAGMENT,
    brickFragmentsFromQuarterMask: stageGrid.brickFragmentsFromQuarterMask,
    clearTile: stageGrid.clearTile,
    cloneGrid: stageGrid.cloneGrid,
    gridToQuadrants: stageGrid.gridToQuadrants,
    makeCell: stageGrid.makeCell,
    makeGrid: stageGrid.makeGrid,
    normalizeBrickFragmentMask: stageGrid.normalizeBrickFragmentMask,
    parseStageQuadrants: stageGrid.parseStageQuadrants,
    quarterMaskFromBrickFragments: stageGrid.quarterMaskFromBrickFragments,
    setTile: stageGrid.setTile,
    tryNormalizeStagePack: stagePack.tryNormalizeStagePack,
    createStagePackSchema: stagePackSchema.createStagePackSchema,
    stageRouting: stageRouting,
    createStageRuntime: stageRuntime.createStageRuntime,
    createCurrentPackInfo: stagePackDiagnostics.createCurrentPackInfo,
    createStageResultDiagnostics: stageResultDiagnostics.createStageResultDiagnostics,
    createStageResultProbePlayer: stageResultDiagnostics.createStageResultProbePlayer,
    createStageFlowDiagnostics: stageFlowDiagnostics.createStageFlowDiagnostics,
    createScreenFlowDiagnostics: screenFlowDiagnostics.createScreenFlowDiagnostics,
    createWallDiagnostics: wallDiagnostics.createWallDiagnostics,
    createEnemyDiagnostics: enemyDiagnostics.createEnemyDiagnostics,
    createEffectDiagnostics: effectDiagnostics.createEffectDiagnostics,
    createDebugSnapshot: debugSnapshot.createDebugSnapshot,

    // Presentation
    fixedFrameAudioPresentation: audioPresentation.fixedFrameAudioPresentation,
    fixedFrameVoiceDuration: audioPresentation.fixedFrameVoiceDuration,
    fixedFrameVoiceIsAudible: audioPresentation.fixedFrameVoiceIsAudible,
    movementAudioPresentation: audioPresentation.movementAudioPresentation,
    gameOverBannerPresentation: battleHudPresentation.gameOverBannerPresentation,
    panelEnemyCounterRemaining: battleHudPresentation.panelEnemyCounterRemaining,
    panelLifeCount: battleHudPresentation.panelLifeCount,
    pausePresentation: battleHudPresentation.pausePresentation,
    playerGameOverMessagePresentation: battleHudPresentation.playerGameOverMessagePresentation,
    BASE_DESTRUCTION_TAIL_FRAMES: effectPresentation.BASE_DESTRUCTION_TAIL_FRAMES,
    baseDestructionPresentation: effectPresentation.baseDestructionPresentation,
    enemyDestructionPresentation: effectPresentation.enemyDestructionPresentation,
    explosionPresentation: effectPresentation.explosionPresentation,
    isTankDestructionStyle: effectPresentation.isTankDestructionStyle,
    playerDestructionPresentation: effectPresentation.playerDestructionPresentation,
    scorePopupPresentation: effectPresentation.scorePopupPresentation,
    tankDestructionPresentation: effectPresentation.tankDestructionPresentation,
    FREE_SPRITE_MANIFEST: freeSpriteManifest.FREE_SPRITE_MANIFEST,
    cloneSpriteManifest: freeSpriteManifest.cloneSpriteManifest,
    compactGameOverGlyph: pixelFont.compactGameOverGlyph,
    pixelGlyph: pixelFont.pixelGlyph,
    rightAlignedPixelTextX: pixelFont.rightAlignedPixelTextX,
    FULL_GAME_OVER_SCREEN_FRAMES: screenPresentation.FULL_GAME_OVER_SCREEN_FRAMES,
    HIGH_SCORE_SCREEN_FRAMES: screenPresentation.HIGH_SCORE_SCREEN_FRAMES,
    STAGE_CURTAIN_CLOSE_FRAMES: screenPresentation.STAGE_CURTAIN_CLOSE_FRAMES,
    fullGameOverPresentation: screenPresentation.fullGameOverPresentation,
    highScorePresentation: screenPresentation.highScorePresentation,
    stageIntroCurtainState: screenPresentation.stageIntroCurtainState,
    stageSelectCurtainState: screenPresentation.stageSelectCurtainState,
    titleScoreLayout: screenPresentation.titleScoreLayout,
    CARRIER_FLASH_COLOR: tankPresentation.CARRIER_FLASH_COLOR,
    CARRIER_FLASH_PHASE_FRAMES: tankPresentation.CARRIER_FLASH_PHASE_FRAMES,
    PLAYER_UPGRADE_OVERLAY_COLORS: tankPresentation.PLAYER_UPGRADE_OVERLAY_COLORS,
    directionName: tankPresentation.directionName,
    enemyColor: tankPresentation.enemyColor,
    isPlayerShieldVisible: tankPresentation.isPlayerShieldVisible,
    isPlayerTankVisible: tankPresentation.isPlayerTankVisible,
    playerUpgradeOverlayParts: tankPresentation.playerUpgradeOverlayParts,
    shieldColorForTick: tankPresentation.shieldColorForTick,
    spawnAnimationPresentation: tankPresentation.spawnAnimationPresentation,
    tankPrimaryColor: tankPresentation.tankPrimaryColor,
    tankTrackFrameName: tankPresentation.tankTrackFrameName,

    // Audio
    isMovementAudioBlocked: audioMixRules.isMovementAudioBlocked,
    resolveAudioAudibility: audioMixRules.resolveAudioAudibility,
    resolveMovementAudioMode: audioMixRules.resolveMovementAudioMode,
    FIXED_FRAME_AUDIO_UPDATE_MODE: fixedFrameAudioState.FIXED_FRAME_AUDIO_UPDATE_MODE,
    advanceFixedFrameAudioState: fixedFrameAudioState.advanceFixedFrameAudioState,
    beginFixedFrameAudioState: fixedFrameAudioState.beginFixedFrameAudioState,
    createFixedFrameAudioState: fixedFrameAudioState.createFixedFrameAudioState,
    fixedFrameAudioUpdateMode: fixedFrameAudioState.fixedFrameAudioUpdateMode,
    resetFixedFrameAudioState: fixedFrameAudioState.resetFixedFrameAudioState,
    FREE_AUDIO_MANIFEST: freeAudioManifest.FREE_AUDIO_MANIFEST,
    cloneAudioManifest: freeAudioManifest.cloneAudioManifest,
    createAudioDiagnostics: audioDiagnostics.createAudioDiagnostics,

    // Editor
    EDITOR_TILE_TYPES: editorRules.EDITOR_TILE_TYPES,
    ORIGINAL_EDITOR_PATTERNS: editorRules.ORIGINAL_EDITOR_PATTERNS,
    editorBrushAt: editorRules.editorBrushAt,
    editorCellForCursor: editorRules.editorCellForCursor,
    editorDirectionForCode: editorRules.editorDirectionForCode,
    editorPatternAt: editorRules.editorPatternAt,
    heldEditorDirection: editorRules.heldEditorDirection,
    isEditorDirectionCode: editorRules.isEditorDirectionCode,
    moveEditorCursor: editorRules.moveEditorCursor,
    nextEditorPatternIndex: editorRules.nextEditorPatternIndex,
    nextEditorTileType: editorRules.nextEditorTileType,
    originalEditorButtonHeld: editorRules.originalEditorButtonHeld,
    quadrantType: editorRules.quadrantType,
    setEditorQuadrant: editorRules.setEditorQuadrant,
    createEditorStagePack: editorStageFormat.createEditorStagePack,
    parseEditorStageText: editorStageFormat.parseEditorStageText,
    parseJsonText: editorStageFormat.parseJsonText,
    serializeEditorStage: editorStageFormat.serializeEditorStage,
    serializeEditorStagePack: editorStageFormat.serializeEditorStagePack,

    // Shared state module
    sharedState: sharedState,

    // Utility
    requireRuntimeModule: requireRuntimeModule
  };
});
