(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    battleHudPresentation: isCommonJs
      ? require("../presentation/battle-hud-presentation")
      : modules.battleHudPresentation,
    enemySequences: isCommonJs ? require("../stages/enemy-sequences") : modules.enemySequences,
    freeAudioManifest: isCommonJs ? require("../audio/free-audio-manifest") : modules.freeAudioManifest,
    sharedState: isCommonJs ? require("./shared-state") : modules.sharedState,
    stageGrid: isCommonJs ? require("../stages/stage-grid") : modules.stageGrid,
    stagePackDiagnostics: isCommonJs
      ? require("./stage-pack-diagnostics")
      : modules.stagePackDiagnostics
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before debug-snapshot.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.debugSnapshot = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { panelEnemyCounterRemaining } = dependencies.battleHudPresentation;
  const { DEFAULT_ORIGINAL_STAGE_COUNT } = dependencies.enemySequences;
  const { FREE_AUDIO_MANIFEST } = dependencies.freeAudioManifest;
  const {
    FIELD_H,
    FIELD_W,
    FIELD_X,
    FIELD_Y,
    PANEL_X,
    SCREEN_W,
    TITLE_DEMO_IDLE_FRAMES,
    TITLE_MENU_ITEMS
  } = dependencies.sharedState;
  const { TILE_TYPES, gridToQuadrants } = dependencies.stageGrid;
  const { createDebugPackInfo } = dependencies.stagePackDiagnostics;

  const AUDIO_SNAPSHOT_FIELDS = Object.freeze([
    Object.freeze(["stageStartAudio", "stageStart", "stageStart"]),
    Object.freeze(["bonusLifeAudio", "bonusLife", "bonusLife"]),
    Object.freeze(["powerUpPickupAudio", "powerUpPickup", "powerUp"]),
    Object.freeze(["powerUpAppearAudio", "powerUpAppear", "powerUpAppear"]),
    Object.freeze(["brickHitAudio", "brickHit", "brickHit"]),
    Object.freeze(["steelHitAudio", "steelHit", "steelHit"]),
    Object.freeze(["enemyHitAudio", "enemyHit", "enemyHit"]),
    Object.freeze(["baseHitAudio", "baseHit", "baseHit"]),
    Object.freeze(["enemyDestroyAudio", "enemyDestroy", "enemyDestroy"]),
    Object.freeze(["playerDestroyAudio", "playerDestroy", "playerDestroy"]),
    Object.freeze(["playerShootAudio", "playerShoot", "playerShoot"]),
    Object.freeze(["movementIceAudio", "movementIce", "movementIce"]),
    Object.freeze(["pauseAudio", "pause", "pause"]),
    Object.freeze(["scoreCountAudio", "scoreCount", "scoreCount"]),
    Object.freeze(["stageBonusAudio", "stageBonus", "stageBonus"]),
    Object.freeze(["gameOverAudio", "gameOver", "gameOver"]),
    Object.freeze(["highScoreAudio", "highScore", "highScore"])
  ]);

  function tileTypeName(type) {
    if (type === TILE_TYPES.BRICK) return "brick";
    if (type === TILE_TYPES.STEEL) return "steel";
    if (type === TILE_TYPES.WATER) return "water";
    if (type === TILE_TYPES.FOREST) return "forest";
    if (type === TILE_TYPES.ICE) return "ice";
    return "empty";
  }

  function createAudioSnapshot(audio) {
    return Object.fromEntries(AUDIO_SNAPSHOT_FIELDS.map(([outputKey, stateKey, eventKey]) => {
      const current = audio[stateKey];
      return [
        outputKey,
        {
          active: current.active,
          frame: current.frame,
          durationFrames: FREE_AUDIO_MANIFEST.events[eventKey].durationFrames
        }
      ];
    }));
  }

  function createPlayerSnapshot(player) {
    return {
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
    };
  }

  function validateState(state) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.stageRuntime || typeof state.stageRuntime.stageCount !== "function") {
      throw new Error("state.stageRuntime must provide stage lookup functions");
    }
    if (!state.audio || typeof state.audio !== "object") throw new Error("state.audio must be an object");
  }

  /** Creates the independently editable public debugSnapshot() projection. */
  function createDebugSnapshot(state) {
    validateState(state);
    const game = state.game;
    const stageRuntime = state.stageRuntime;
    const audioSnapshot = createAudioSnapshot(state.audio);

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
      stageSelectLimit: Math.max(1, Math.min(DEFAULT_ORIGINAL_STAGE_COUNT, stageRuntime.stageCount())),
      stageCycleLimit: stageRuntime.stageCycleLimit(),
      mapDataStage: stageRuntime.mapDataStage(game.stage),
      enemyDataStage: stageRuntime.enemyDataStage(game.stage),
      highScore: game.highScore,
      runHighScoreBaseline: game.runHighScoreBaseline,
      newHighScoreAtGameOver: game.newHighScoreAtGameOver,
      fullGameOverElapsed: game.fullGameOverElapsed,
      highScoreScreenElapsed: game.highScoreScreenElapsed,
      enemySpawned: game.enemySpawned,
      enemyKilled: game.enemyKilled,
      panelEnemyCounter: panelEnemyCounterRemaining(stageRuntime.enemyTotal(), game.enemySpawned),
      nextSpawn: game.nextSpawn,
      clearPendingTimer: game.clearPendingTimer,
      baseDestroyTimer: game.baseDestroyTimer,
      stageResultReason: game.stageResultReason,
      stageClearElapsed: game.stageClearElapsed,
      stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
      stageClearBonusAwarded: game.stageClearBonusAwarded,
      gameOverTimer: game.gameOverTimer,
      playerGameOverMessage: game.playerGameOverMessage
        ? {
            ...game.playerGameOverMessage,
            active: Boolean(game.playerGameOverMessage.timer > 0)
          }
        : null,
      freezeTimer: game.freezeTimer,
      shovelTimer: game.shovelTimer,
      movementAudioMode: state.movementAudio.mode,
      ...audioSnapshot,
      ...createDebugPackInfo(game, stageRuntime),
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
      players: game.players.map(createPlayerSnapshot)
    };
  }

  return Object.freeze({
    AUDIO_SNAPSHOT_FIELDS,
    createDebugSnapshot
  });
});
