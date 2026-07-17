(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.sharedState = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // ── Screen layout constants ────────────────────────────────────────────────
  const SCREEN_W = 256;
  const SCREEN_H = 240;
  const TILE = 16;
  const HALF = 8;
  const GRID = 13;
  const FIELD_X = 16;
  const FIELD_Y = 16;
  const FIELD_W = GRID * TILE;
  const FIELD_H = GRID * TILE;
  const PANEL_X = FIELD_X + FIELD_W;

  const BATTLE_PRESENTATION_LAYOUT = Object.freeze({
    x: FIELD_X,
    y: FIELD_Y,
    width: FIELD_W,
    height: FIELD_H
  });

  const STEP_MS = 1000 / 60;

  // ── Game balance constants ─────────────────────────────────────────────────
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

  const BULLET_IMPACT_EXPLOSION_RULES = new Set([
    "brickHit", "steelHit", "steelBlocked", "enemyHit", "playerStun"
  ]);

  const TITLE_MENU_ITEMS = [
    { label: "1 PLAYER", action: "one", x: 88, y: 136, color: "#f3f0d4" },
    { label: "2 PLAYERS", action: "two", x: 88, y: 152, color: "#f3f0d4" },
    { label: "CONSTRUCTION", action: "construction", x: 88, y: 168, color: "#f3f0d4" }
  ];

  const EDITOR_STORAGE_KEY = "tank-defender-8-editor-stage";
  const HIGH_SCORE_STORAGE_KEY = "tank-defender-8-high-score";

  // ── Default game state factory ─────────────────────────────────────────────
  function createDefaultGameState() {
    return {
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
      grid: null,
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
      stagePack: null,
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
      editorBrush: null,
      editorPattern: 0,
      editorPatternArmed: false,
      editorMoveHoldTimer: 0,
      editorTick: 0,
      editorMessage: "",
      editorMessageTimer: 0
    };
  }

  // ── Audio state factories ──────────────────────────────────────────────────
  function createMovementAudioState() {
    return {
      mode: "none",
      oscillator: null,
      gain: null,
      phase: -1
    };
  }

  function createNoiseBufferCache() {
    return {
      shortBuffer: null,
      shortSampleRate: 0,
      shortClockRate: 0,
      longBuffer: null,
      longSampleRate: 0,
      longClockRate: 0
    };
  }

  // ── Full shared state factory ──────────────────────────────────────────────
  function createSharedState(options) {
    options = options || {};

    const state = {
      // DOM references
      canvas: options.canvas || null,
      packFileInput: options.packFileInput || null,
      ctx: options.ctx || null,

      // Input state
      keys: new Set(),
      pendingFirePresses: new Set(),
      pendingStageSelectPresses: new Set(),

      // Audio core
      audioCtx: null,
      activeSequencedSounds: new Map(),
      movementAudio: createMovementAudioState(),
      noiseBufferCache: createNoiseBufferCache(),

      // The main game state
      game: createDefaultGameState(),

      // Stage runtime (set later by game-lifecycle)
      stageRuntime: null,

      // Built-in stage pack (set later)
      builtInStagePack: options.builtInStagePack || null
    };

    return state;
  }

  // ── Exports ────────────────────────────────────────────────────────────────
  return {
    // Constants
    SCREEN_W: SCREEN_W,
    SCREEN_H: SCREEN_H,
    TILE: TILE,
    HALF: HALF,
    GRID: GRID,
    FIELD_X: FIELD_X,
    FIELD_Y: FIELD_Y,
    FIELD_W: FIELD_W,
    FIELD_H: FIELD_H,
    PANEL_X: PANEL_X,
    BATTLE_PRESENTATION_LAYOUT: BATTLE_PRESENTATION_LAYOUT,
    STEP_MS: STEP_MS,
    DEFAULT_HIGH_SCORE: DEFAULT_HIGH_SCORE,
    TITLE_DEMO_IDLE_FRAMES: TITLE_DEMO_IDLE_FRAMES,
    DEMO_DISPLAY_STAGE: DEMO_DISPLAY_STAGE,
    DEMO_MAX_ACTIVE_ENEMIES: DEMO_MAX_ACTIVE_ENEMIES,
    HIDDEN_MESSAGE_REQUIRED_VISITS: HIDDEN_MESSAGE_REQUIRED_VISITS,
    HIDDEN_MESSAGE_A_PRESSES: HIDDEN_MESSAGE_A_PRESSES,
    HIDDEN_MESSAGE_B_PRESSES: HIDDEN_MESSAGE_B_PRESSES,
    HIDDEN_MESSAGE_TEXT_START: HIDDEN_MESSAGE_TEXT_START,
    HIDDEN_MESSAGE_STEP_FRAMES: HIDDEN_MESSAGE_STEP_FRAMES,
    HIDDEN_MESSAGE_DROP_START: HIDDEN_MESSAGE_DROP_START,
    HIDDEN_MESSAGE_DROP_MORPH_FRAMES: HIDDEN_MESSAGE_DROP_MORPH_FRAMES,
    HIDDEN_MESSAGE_DROP_FALL_FRAMES: HIDDEN_MESSAGE_DROP_FALL_FRAMES,
    HIDDEN_MESSAGE_END_FRAME: HIDDEN_MESSAGE_END_FRAME,
    GAME_OVER_TEXT: GAME_OVER_TEXT,
    PLAYER_GAME_OVER_MESSAGE_TIMER: PLAYER_GAME_OVER_MESSAGE_TIMER,
    PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD: PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD,
    PLAYER_GAME_OVER_MESSAGE_Y: PLAYER_GAME_OVER_MESSAGE_Y,
    PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y: PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y,
    PLAYER_GAME_OVER_STAGE_END_DELAY: PLAYER_GAME_OVER_STAGE_END_DELAY,
    EXTENDED_STAGE_END_FRAME_HIGH: EXTENDED_STAGE_END_FRAME_HIGH,
    DEMO_INITIAL_FRAME_LOW: DEMO_INITIAL_FRAME_LOW,
    STAGE_MAP_DRAW_FRAMES: STAGE_MAP_DRAW_FRAMES,
    STAGE_ATTRIBUTE_COPY_FRAMES: STAGE_ATTRIBUTE_COPY_FRAMES,
    STAGE_RESULT_ROW_LAYOUT: STAGE_RESULT_ROW_LAYOUT,
    BULLET_IMPACT_EXPLOSION_RULES: BULLET_IMPACT_EXPLOSION_RULES,
    TITLE_MENU_ITEMS: TITLE_MENU_ITEMS,
    EDITOR_STORAGE_KEY: EDITOR_STORAGE_KEY,
    HIGH_SCORE_STORAGE_KEY: HIGH_SCORE_STORAGE_KEY,

    // Factories
    createDefaultGameState: createDefaultGameState,
    createMovementAudioState: createMovementAudioState,
    createNoiseBufferCache: createNoiseBufferCache,
    createSharedState: createSharedState
  };
});
