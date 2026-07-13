(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const packFileInput = document.getElementById("stage-pack-file");
  const ctx = canvas.getContext("2d");

  const SCREEN_W = 256;
  const SCREEN_H = 240;
  const TILE = 16;
  const HALF = 8;
  const GRID = 13;
  const QUAD_GRID = GRID * 2;
  const FIELD_X = 16;
  const FIELD_Y = 16;
  const FIELD_W = GRID * TILE;
  const FIELD_H = GRID * TILE;
  const PANEL_X = FIELD_X + FIELD_W;
  const STEP_MS = 1000 / 60;
  const DEFAULT_ENEMY_TOTAL = 20;
  const DEFAULT_ORIGINAL_STAGE_COUNT = 35;
  const DEFAULT_HIGH_SCORE = 20000;
  const DEFAULT_MAX_ACTIVE_ENEMIES = 4;
  const DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER = 6;
  const DEFAULT_INITIAL_LIVES = 3;
  const DEFAULT_BONUS_LIFE_SCORES = [20000];
  const DEFAULT_DEATH_POWER_LEVEL = 0;
  const DEFAULT_POWERUP_DURATIONS = {
    helmet: 10,
    shovel: 20,
    shovelFlash: 4,
    timer: 10
  };
  const DEFAULT_POWERUP_RULES = {
    carrierRelease: "hit",
    clearUncollectedOnCarrierSpawn: true,
    pickupScore: 500
  };
  const DEFAULT_TIMINGS = {
    stageIntro: 86,
    stageClearDelay: 60,
    stageClear: 420,
    gameOverSlide: 96,
    playerRespawn: 24,
    playerSpawnFlash: 28,
    playerInvulnerability: 3,
    enemySpawnFlash: 56,
    enemyInitialReload: 0,
    enemySpawnRetry: 25,
    powerUpTtl: 0
  };
  const DEFAULT_ENEMY_SPAWN_PACING = {
    firstDelay: 0,
    baseDelay: 190,
    stageStep: 4,
    minDelay: 50,
    extendedLoopMinDelay: 50,
    twoPlayerDelayReduction: 20
  };
  const DEFAULT_PLAYER_MOVEMENT = {
    speed: 1,
    frameCadence: [true, true, false, true],
    iceSlideFrames: 28,
    iceSlideSpeed: 1
  };
  const DEFAULT_PROJECTILE_RULES = {
    bulletSize: 4,
    spawnOffset: 9,
    boundsPadding: 4
  };
  const DEFAULT_FRIENDLY_FIRE = {
    enabled: true,
    stunFrames: 200
  };
  const CARRIER_FLASH_COLOR = "#dd3d33";
  const DEFAULT_EXPLOSION_CORE_COLOR = "#f7f1c6";
  const DEFAULT_EXPLOSION_RULES = {
    bulletCancel: { ttl: 10, color: "#f8e08b", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    baseDestroy: { ttl: 80, color: "#f05a42", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    brickHit: { ttl: 12, color: "#d08b52", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    steelHit: { ttl: 12, color: "#dbe0ef", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    steelBlocked: { ttl: 8, color: "#dbe0ef", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    enemyHit: { ttl: 14, color: "#ffffff", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    enemyDestroy: { ttl: 34, color: "#f0b546", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    playerStun: { ttl: 12, color: "#f7f1c6", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    playerDestroy: { ttl: 32, color: "#f05a42", coreColor: DEFAULT_EXPLOSION_CORE_COLOR }
  };
  const DEFAULT_STAGE_ADVANCE = {
    loopAfterFinalStage: true,
    extendedLoopEndStage: 70,
    extendedLoopEnemyStage: 35
  };
  const DEFAULT_STAGE_CLEAR_BONUS = {
    points: 1000,
    twoPlayerOnly: true,
    requireStrictLead: true
  };
  const DEFAULT_ENEMY_AI = {
    intersectionTurnChance: 1 / 16,
    blockedRetryChance: 3 / 4,
    blockedRetryTicks: 2,
    horizontalFirstChance: 1 / 2
  };
  const DEFAULT_TIMER_FREEZES_ENEMY_TIME = true;
  const TITLE_MENU_ITEMS = [
    { label: "1 PLAYER", action: "one", x: 88, y: 136, color: "#f3f0d4" },
    { label: "2 PLAYERS", action: "two", x: 88, y: 152, color: "#f3f0d4" },
    { label: "CONSTRUCTION", action: "construction", x: 88, y: 168, color: "#f3f0d4" }
  ];
  const FREE_AUDIO_MANIFEST = {
    id: "free-synth-audio",
    type: "procedural-web-audio",
    sampleRate: "browser",
    events: {
      editorSave: { freq: 640, duration: 0.05, gain: 0.025, wave: "triangle" },
      editorLoad: { freq: 520, duration: 0.05, gain: 0.025, wave: "triangle" },
      editorClear: { freq: 230, duration: 0.05, gain: 0.02, wave: "square" },
      editorPaint: { freq: 360, duration: 0.03, gain: 0.02, wave: "square", brushPitch: 45 },
      editorPaintSubtile: { freq: 360, duration: 0.025, gain: 0.018, wave: "square", brushPitch: 45 },
      editorBrush: { freq: 300, duration: 0.025, gain: 0.016, wave: "triangle", brushPitch: 60 },
      bulletCancel: { freq: 210, duration: 0.025, gain: 0.015, wave: "square" },
      baseHit: { freq: 82, duration: 0.28, gain: 0.06, wave: "sawtooth" },
      brickHit: { freq: 260, duration: 0.035, gain: 0.02, wave: "square" },
      steelHit: { freq: 155, duration: 0.035, gain: 0.02, wave: "square" },
      enemyHit: { freq: 330, duration: 0.025, gain: 0.02, wave: "square" },
      enemyDestroy: { freq: 94, duration: 0.12, gain: 0.05, wave: "square" },
      bonusLife: { freq: 880, duration: 0.08, gain: 0.028, wave: "triangle" },
      playerDestroy: { freq: 76, duration: 0.2, gain: 0.055, wave: "sawtooth" },
      powerUp: { freq: 740, duration: 0.08, gain: 0.035, wave: "triangle" },
      playerShoot: { freq: 460, duration: 0.03, gain: 0.018, wave: "square" },
      enemyShoot: { freq: 310, duration: 0.03, gain: 0.018, wave: "square" },
      stageClearA: { freq: 660, duration: 0.08, gain: 0.03, wave: "triangle" },
      stageClearB: { freq: 880, duration: 0.1, gain: 0.025, wave: "triangle" }
    }
  };
  const FREE_SPRITE_MANIFEST = {
    id: "free-procedural-sprites",
    type: "procedural-rect-sprites",
    sprites: {
      tank: {
        size: 14,
        frames: {
          up: [
            { role: "primary", rect: [0, 1, 4, 12] },
            { role: "primary", rect: [10, 1, 4, 12] },
            { role: "primary", rect: [4, 3, 6, 8] },
            { role: "primary", rect: [6, 0, 2, 6] },
            { role: "accent", rect: [5, 5, 4, 4] },
            { role: "shadow", rect: [1, 3, 2, 2] },
            { role: "shadow", rect: [11, 9, 2, 2] }
          ],
          down: [
            { role: "primary", rect: [0, 1, 4, 12] },
            { role: "primary", rect: [10, 1, 4, 12] },
            { role: "primary", rect: [4, 3, 6, 8] },
            { role: "primary", rect: [6, 8, 2, 6] },
            { role: "accent", rect: [5, 5, 4, 4] },
            { role: "shadow", rect: [1, 3, 2, 2] },
            { role: "shadow", rect: [11, 9, 2, 2] }
          ],
          left: [
            { role: "primary", rect: [1, 0, 12, 4] },
            { role: "primary", rect: [1, 10, 12, 4] },
            { role: "primary", rect: [3, 4, 8, 6] },
            { role: "primary", rect: [0, 6, 6, 2] },
            { role: "accent", rect: [5, 5, 4, 4] },
            { role: "shadow", rect: [3, 1, 2, 2] },
            { role: "shadow", rect: [9, 11, 2, 2] }
          ],
          right: [
            { role: "primary", rect: [1, 0, 12, 4] },
            { role: "primary", rect: [1, 10, 12, 4] },
            { role: "primary", rect: [3, 4, 8, 6] },
            { role: "primary", rect: [8, 6, 6, 2] },
            { role: "accent", rect: [5, 5, 4, 4] },
            { role: "shadow", rect: [3, 1, 2, 2] },
            { role: "shadow", rect: [9, 11, 2, 2] }
          ]
      }
    },
      wallQuarter: {
        size: 8,
        frames: {
          brick: [
            { role: "dark", rect: [0, 0, 8, 8] },
            { role: "light", rect: [1, 1, 6, 2] },
            { role: "light", rect: [1, 5, 6, 1] },
            { role: "shadow", rect: [7, 0, 1, 8] },
            { role: "shadow", rect: [0, 7, 8, 1] }
          ],
          steel: [
            { role: "dark", rect: [0, 0, 8, 8] },
            { role: "light", rect: [1, 1, 6, 1] },
            { role: "seam", rect: [0, 4, 8, 1] },
            { role: "bolt", rect: [1, 2, 1, 1] },
            { role: "bolt", rect: [6, 6, 1, 1] },
            { role: "shadow", rect: [7, 0, 1, 8] },
            { role: "shadow", rect: [0, 7, 8, 1] }
          ]
        }
      },
      terrain: {
        size: 16,
        frames: {
          waterA: [
            { role: "base", rect: [0, 0, 16, 16] },
            { role: "wave", rect: [2, 4, 12, 2] },
            { role: "wave", rect: [1, 10, 10, 2] }
          ],
          waterB: [
            { role: "base", rect: [0, 0, 16, 16] },
            { role: "wave", rect: [1, 6, 10, 2] },
            { role: "wave", rect: [5, 12, 9, 2] }
          ],
          ice: [
            { role: "base", rect: [0, 0, 16, 16] },
            { role: "highlight", rect: [2, 2, 10, 1] },
            { role: "highlight", rect: [4, 7, 9, 1] },
            { role: "shadow", rect: [1, 14, 14, 1] }
          ],
          forest: [
            { role: "base", rect: [0, 0, 16, 16] },
            { role: "light", rect: [2, 1, 5, 12] },
            { role: "light", rect: [9, 3, 5, 11] },
            { role: "dark", rect: [5, 6, 7, 9] }
          ]
        }
      },
      base: {
        size: 16,
        frames: {
          alive: [
            { role: "primary", rect: [3, 3, 10, 10] },
            { role: "shadow", rect: [7, 2, 2, 11] },
            { role: "shadow", rect: [4, 5, 8, 2] },
            { role: "shadow", rect: [5, 10, 6, 2] }
          ],
          dead: [
            { role: "primary", rect: [3, 3, 10, 10] },
            { role: "shadow", rect: [7, 2, 2, 11] },
            { role: "shadow", rect: [4, 5, 8, 2] },
            { role: "shadow", rect: [5, 10, 6, 2] }
          ]
        }
      },
      bullet: {
        size: 4,
        frames: {
          default: [
            { role: "primary", rect: [0, 0, 4, 4] }
          ]
        }
      },
      miniTank: {
        size: 14,
        frames: {
          up: [
            { role: "primary", rect: [0, 2, 4, 10] },
            { role: "primary", rect: [10, 2, 4, 10] },
            { role: "primary", rect: [4, 4, 6, 6] },
            { role: "primary", rect: [6, 0, 2, 7] },
            { role: "shadow", rect: [5, 6, 4, 3] }
          ]
        }
      },
      shield: {
        size: 18,
        frames: {
          box: [
            { op: "stroke", role: "primary", rect: [0, 0, 18, 18] }
          ]
        }
      },
      spawn: {
        size: 14,
        frames: {
          box: [
            { op: "stroke", role: "primary", rect: [0, 0, 14, 14] },
            { op: "stroke", role: "primary", rect: [3, 3, 8, 8] }
          ]
        }
      },
      explosion: {
        size: 16,
        frames: {
          burst: [
            { role: "primary", rect: [0, 0, 16, 16] },
            { role: "core", rect: [5, 5, 6, 6] }
          ]
        }
      },
      enemyCounter: {
        size: 7,
        frames: {
          remaining: [
            { role: "primary", rect: [0, 0, 7, 6] }
          ],
          cleared: [
            { role: "primary", rect: [0, 0, 7, 6] }
          ]
        }
      },
      powerUp: {
        size: 16,
        frames: {
          grenade: [
            { role: "outline", rect: [7, 3, 3, 2] },
            { role: "outline", rect: [10, 2, 2, 2] },
            { role: "outline", rect: [5, 4, 6, 1] },
            { role: "outline", rect: [4, 5, 8, 2] },
            { role: "outline", rect: [3, 7, 10, 4] },
            { role: "outline", rect: [5, 11, 6, 2] },
            { role: "shade", rect: [5, 6, 6, 5] },
            { role: "primary", rect: [5, 6, 2, 3] },
            { role: "primary", rect: [7, 5, 2, 1] },
            { role: "primary", rect: [10, 7, 1, 3] },
            { role: "cutout", rect: [7, 8, 2, 2] }
          ],
          helmet: [
            { role: "outline", rect: [5, 4, 6, 1] },
            { role: "outline", rect: [4, 5, 8, 1] },
            { role: "outline", rect: [3, 6, 10, 5] },
            { role: "outline", rect: [2, 10, 12, 3] },
            { role: "shade", rect: [4, 6, 8, 4] },
            { role: "primary", rect: [5, 5, 6, 1] },
            { role: "primary", rect: [4, 6, 1, 3] },
            { role: "primary", rect: [3, 10, 10, 1] },
            { role: "cutout", rect: [5, 10, 6, 1] }
          ],
          shovel: [
            { role: "outline", rect: [10, 2, 3, 2] },
            { role: "outline", rect: [9, 3, 3, 3] },
            { role: "outline", rect: [8, 5, 3, 3] },
            { role: "outline", rect: [7, 7, 3, 3] },
            { role: "outline", rect: [3, 8, 5, 1] },
            { role: "outline", rect: [2, 9, 6, 4] },
            { role: "outline", rect: [3, 13, 4, 1] },
            { role: "primary", rect: [10, 3, 2, 1] },
            { role: "primary", rect: [9, 4, 2, 2] },
            { role: "primary", rect: [8, 6, 2, 2] },
            { role: "primary", rect: [4, 9, 3, 3] },
            { role: "shade", rect: [3, 11, 4, 2] }
          ],
          star: [
            { role: "outline", rect: [7, 2, 2, 3] },
            { role: "outline", rect: [5, 4, 6, 2] },
            { role: "outline", rect: [2, 6, 12, 3] },
            { role: "outline", rect: [4, 9, 8, 2] },
            { role: "outline", rect: [3, 11, 3, 3] },
            { role: "outline", rect: [10, 11, 3, 3] },
            { role: "primary", rect: [7, 3, 2, 3] },
            { role: "primary", rect: [4, 7, 8, 2] },
            { role: "primary", rect: [6, 6, 4, 5] },
            { role: "primary", rect: [5, 10, 2, 2] },
            { role: "primary", rect: [9, 10, 2, 2] },
            { role: "shade", rect: [7, 7, 2, 2] }
          ],
          timer: [
            { role: "outline", rect: [7, 2, 3, 2] },
            { role: "outline", rect: [10, 3, 2, 2] },
            { role: "outline", rect: [5, 4, 6, 1] },
            { role: "outline", rect: [4, 5, 8, 2] },
            { role: "outline", rect: [3, 7, 10, 4] },
            { role: "outline", rect: [4, 11, 8, 2] },
            { role: "outline", rect: [5, 13, 6, 1] },
            { role: "primary", rect: [5, 6, 6, 6] },
            { role: "cutout", rect: [7, 6, 2, 4] },
            { role: "cutout", rect: [8, 9, 3, 2] }
          ],
          tank: [
            { role: "outline", rect: [7, 3, 3, 2] },
            { role: "outline", rect: [9, 4, 4, 2] },
            { role: "outline", rect: [4, 5, 8, 2] },
            { role: "outline", rect: [3, 7, 10, 4] },
            { role: "outline", rect: [2, 10, 12, 3] },
            { role: "primary", rect: [5, 6, 6, 4] },
            { role: "primary", rect: [8, 4, 2, 3] },
            { role: "primary", rect: [10, 5, 3, 1] },
            { role: "shade", rect: [4, 10, 8, 2] },
            { role: "cutout", rect: [5, 10, 2, 2] },
            { role: "cutout", rect: [9, 10, 2, 2] }
          ]
        }
      }
    }
  };
  const EDITOR_STORAGE_KEY = "tank-defender-8-editor-stage";
  const HIGH_SCORE_STORAGE_KEY = "tank-defender-8-high-score";
  const DEFAULT_PLAYER_SPAWNS = [
    { x: 4 * TILE + 1, y: 12 * TILE + 1 },
    { x: 8 * TILE + 1, y: 12 * TILE + 1 }
  ];
  const DEFAULT_ENEMY_SPAWNS = [
    { x: 0 * TILE + 1, y: 0 * TILE + 1 },
    { x: 6 * TILE + 1, y: 0 * TILE + 1 },
    { x: 12 * TILE + 1, y: 0 * TILE + 1 }
  ];
  const DEFAULT_POWERUP_SPAWNS = [
    { x: 1 * TILE + 2, y: 1 * TILE + 2 },
    { x: 6 * TILE + 2, y: 1 * TILE + 2 },
    { x: 11 * TILE + 2, y: 1 * TILE + 2 },
    { x: 3 * TILE + 2, y: 2 * TILE + 2 },
    { x: 9 * TILE + 2, y: 2 * TILE + 2 },
    { x: 1 * TILE + 2, y: 5 * TILE + 2 },
    { x: 5 * TILE + 2, y: 4 * TILE + 2 },
    { x: 7 * TILE + 2, y: 4 * TILE + 2 },
    { x: 11 * TILE + 2, y: 5 * TILE + 2 },
    { x: 3 * TILE + 2, y: 7 * TILE + 2 },
    { x: 9 * TILE + 2, y: 7 * TILE + 2 },
    { x: 1 * TILE + 2, y: 10 * TILE + 2 },
    { x: 5 * TILE + 2, y: 9 * TILE + 2 },
    { x: 7 * TILE + 2, y: 9 * TILE + 2 },
    { x: 11 * TILE + 2, y: 10 * TILE + 2 },
    { x: 6 * TILE + 2, y: 11 * TILE + 2 }
  ];
  const POWERUP_SIZE = 12;

  const EMPTY = 0;
  const BRICK = 1;
  const STEEL = 2;
  const WATER = 3;
  const FOREST = 4;
  const ICE = 5;
  const EDITOR_TILE_TYPES = [EMPTY, BRICK, STEEL, WATER, FOREST, ICE];
  const ORIGINAL_EDITOR_PATTERNS = [
    { type: BRICK, mask: 10 },
    { type: BRICK, mask: 12 },
    { type: BRICK, mask: 5 },
    { type: BRICK, mask: 3 },
    { type: BRICK, mask: 15 },
    { type: STEEL, mask: 10 },
    { type: STEEL, mask: 12 },
    { type: STEEL, mask: 5 },
    { type: STEEL, mask: 3 },
    { type: STEEL, mask: 15 },
    { type: WATER, mask: 0 },
    { type: FOREST, mask: 0 },
    { type: ICE, mask: 0 },
    { type: EMPTY, mask: 0 }
  ];

  const UP = 0;
  const RIGHT = 1;
  const DOWN = 2;
  const LEFT = 3;
  const DIR_X = [0, 1, 0, -1];
  const DIR_Y = [-1, 0, 1, 0];
  const PIXEL_FONT = {
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "11100"],
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00100", "00100"],
    "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"]
  };
  const TILE_CODE_TO_TYPE = {
    ".": EMPTY,
    B: BRICK,
    "#": BRICK,
    S: STEEL,
    W: WATER,
    "~": WATER,
    F: FOREST,
    I: ICE
  };
  const NORMALIZED_TILE_CODE = {
    ".": ".",
    B: "B",
    "#": "B",
    S: "S",
    W: "W",
    "~": "W",
    F: "F",
    I: "I"
  };

  const ENEMY_MOVE_SPEED = { normal: 0.5, fast: 1.0 };
  const ENEMY_BULLET_SPEED = { normal: 2.0, fast: 4.0 };
  const ENEMY_FIRE_CHANCE = 1 / 32;
  const defaultEnemyTypes = [
    { name: "basic", hp: 1, speed: ENEMY_MOVE_SPEED.normal, bullet: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 100, color: "#a9a176" },
    { name: "fast", hp: 1, speed: ENEMY_MOVE_SPEED.fast, bullet: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 200, color: "#b87854" },
    { name: "power", hp: 1, speed: ENEMY_MOVE_SPEED.normal, bullet: ENEMY_BULLET_SPEED.fast, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 300, color: "#7fba72" },
    { name: "armor", hp: 4, speed: ENEMY_MOVE_SPEED.normal, bullet: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1, fireChance: ENEMY_FIRE_CHANCE, score: 400, color: "#7fba72", hitColors: ["#b0b5c3", "#9aa2ad", "#79a95e", "#7fba72"] }
  ];
  const defaultPlayerUpgradeRules = [
    { level: 0, maxBullets: 1, bulletSpeed: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1 },
    { level: 1, maxBullets: 1, bulletSpeed: ENEMY_BULLET_SPEED.fast, wallPower: 1, reload: 1 },
    { level: 2, maxBullets: 2, bulletSpeed: ENEMY_BULLET_SPEED.fast, wallPower: 1, reload: 1 },
    { level: 3, maxBullets: 2, bulletSpeed: ENEMY_BULLET_SPEED.fast, wallPower: 3, reload: 1 }
  ];

  const powerTypes = ["grenade", "helmet", "shovel", "star", "timer", "tank"];
  const originalPowerUpRandomTable = ["helmet", "timer", "shovel", "star", "grenade", "tank", "grenade", "star"];
  const PLAYER_UPGRADE_OVERLAY_COLORS = {
    level1: "#f7f1c6",
    level2: "#f8e08b",
    level3: "#dbe0ef"
  };
  const BONUS_ENEMY_INDICES = [3, 10, 17];
  const ORIGINAL_STYLE_ENEMY_GROUPS = [
    [[18, 0], [2, 1]],
    [[2, 3], [4, 1], [14, 0]],
    [[14, 0], [4, 1], [2, 3]],
    [[10, 2], [5, 1], [2, 0], [3, 3]],
    [[5, 2], [2, 3], [8, 0], [5, 1]],
    [[7, 2], [2, 1], [9, 0], [2, 3]],
    [[3, 0], [4, 1], [6, 2], [7, 0]],
    [[7, 2], [2, 3], [4, 1], [7, 0]],
    [[6, 0], [4, 1], [7, 2], [3, 3]],
    [[12, 0], [2, 1], [4, 2], [2, 3]],
    [[5, 1], [6, 3], [4, 2], [5, 1]],
    [[8, 2], [6, 1], [6, 3]],
    [[8, 2], [8, 1], [4, 3]],
    [[10, 2], [4, 1], [6, 3]],
    [[2, 0], [10, 1], [8, 3]],
    [[16, 0], [2, 1], [2, 3]],
    [[2, 3], [2, 1], [8, 3], [8, 0]],
    [[4, 3], [2, 0], [6, 2], [8, 1]],
    [[4, 1], [8, 3], [4, 0], [4, 2]],
    [[8, 1], [2, 0], [2, 2], [8, 3]],
    [[8, 2], [2, 1], [6, 0], [4, 3]],
    [[8, 1], [6, 0], [2, 2], [4, 3]],
    [[6, 3], [4, 2], [10, 1]],
    [[4, 2], [2, 3], [4, 1], [10, 0]],
    [[2, 2], [8, 1], [10, 3]],
    [[6, 1], [6, 3], [4, 0], [4, 2]],
    [[2, 2], [8, 3], [8, 1], [2, 0]],
    [[2, 1], [1, 3], [15, 0], [2, 2]],
    [[10, 2], [4, 1], [6, 3]],
    [[4, 0], [8, 1], [4, 2], [4, 3]],
    [[3, 2], [8, 1], [6, 3], [3, 2]],
    [[8, 3], [6, 0], [2, 2], [4, 1]],
    [[4, 1], [8, 3], [4, 2], [4, 1]],
    [[4, 2], [10, 1], [6, 3]],
    [[4, 2], [6, 1], [10, 3]]
  ];
  const builtInStagePack = {
    id: "original-style",
    totalStages: 35,
    enemyTotal: DEFAULT_ENEMY_TOTAL,
    enemyTotals: Array.from({ length: 35 }, () => DEFAULT_ENEMY_TOTAL),
    enemyTypes: cloneEnemyTypes(defaultEnemyTypes),
    gameSettings: {
      initialLives: DEFAULT_INITIAL_LIVES,
      bonusLifeScores: DEFAULT_BONUS_LIFE_SCORES.slice(),
      deathPowerLevel: DEFAULT_DEATH_POWER_LEVEL,
      powerUpDurations: { ...DEFAULT_POWERUP_DURATIONS },
      powerUpRules: { ...DEFAULT_POWERUP_RULES },
      timings: { ...DEFAULT_TIMINGS },
      enemySpawnPacing: { ...DEFAULT_ENEMY_SPAWN_PACING },
      playerMovement: { ...DEFAULT_PLAYER_MOVEMENT },
      projectileRules: { ...DEFAULT_PROJECTILE_RULES },
      friendlyFire: { ...DEFAULT_FRIENDLY_FIRE },
      explosionRules: cloneExplosionRules(DEFAULT_EXPLOSION_RULES),
      stageAdvance: { ...DEFAULT_STAGE_ADVANCE },
      stageClearBonus: { ...DEFAULT_STAGE_CLEAR_BONUS },
      enemyAi: { ...DEFAULT_ENEMY_AI },
      playerUpgradeRules: clonePlayerUpgradeRules(defaultPlayerUpgradeRules),
      timerFreezesEnemyTime: DEFAULT_TIMER_FREEZES_ENEMY_TIME
    },
    maps: [],
    enemies: buildOriginalStyleEnemySequences(),
    createGrid(stage) {
      const rows = this.maps[stage - 1];
      return rows ? parseStageRows(rows) : buildStage(stage);
    },
    enemyAt(stage, index) {
      const sequence = this.enemies[stage - 1];
      if (sequence && sequence[index]) {
        return {
          typeIndex: clamp(sequence[index].typeIndex || 0, 0, (this.enemyTypes || defaultEnemyTypes).length - 1),
          carrier: Boolean(sequence[index].carrier),
          spawnIndex: sequence[index].spawnIndex === undefined ? (index + 1) % 3 : clamp(sequence[index].spawnIndex, 0, 2),
          powerUpType: sequence[index].powerUpType || null,
          spawnDelay: sequence[index].spawnDelay === undefined || sequence[index].spawnDelay === null
            ? null
            : Math.max(0, Math.floor(sequence[index].spawnDelay))
        };
      }
      return {
        typeIndex: pickEnemyType(stage, index),
        carrier: BONUS_ENEMY_INDICES.includes(index),
        spawnIndex: (index + 1) % 3,
        powerUpType: null,
        spawnDelay: null
      };
    }
  };
  const keys = new Set();
  const pendingFirePresses = new Set();
  let audioCtx = null;

  const game = {
    screen: "title",
    paused: false,
    stage: 1,
    playerCount: 1,
    tick: 0,
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
    gameOverTimer: 0,
    freezeTimer: 0,
    shovelTimer: 0,
    highScore: DEFAULT_HIGH_SCORE,
    stagePack: builtInStagePack,
    titleMenu: 0,
    stageSelectPlayers: 1,
    stageSelectHoldTimer: 0,
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

  function makeGrid() {
    return Array.from({ length: GRID }, () =>
      Array.from({ length: GRID }, () => makeCell())
    );
  }

  function makeCell(type, mask) {
    return { type: type || EMPTY, mask: mask || 0, steelHits: [0, 0, 0, 0] };
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.map((cell) => ({
      type: cell.type,
      mask: cell.mask,
      steelHits: (cell.steelHits || [0, 0, 0, 0]).slice()
    })));
  }

  function rng(seed) {
    let t = seed >>> 0;
    return function next() {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function loadHighScore() {
    try {
      const value = Number(localStorage.getItem(HIGH_SCORE_STORAGE_KEY));
      game.highScore = Number.isFinite(value) && value > 0
        ? Math.max(DEFAULT_HIGH_SCORE, Math.floor(value))
        : DEFAULT_HIGH_SCORE;
    } catch (error) {
      game.highScore = DEFAULT_HIGH_SCORE;
    }
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

  function setTile(grid, c, r, type, mask) {
    if (c < 0 || c >= GRID || r < 0 || r >= GRID) return;
    const cell = grid[r][c];
    cell.type = type;
    cell.mask = type === BRICK || type === STEEL ? mask || 15 : 0;
    cell.steelHits = [0, 0, 0, 0];
  }

  function clearTile(grid, c, r) {
    setTile(grid, c, r, EMPTY, 0);
  }

  function clearRect(grid, c0, r0, c1, r1) {
    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        clearTile(grid, c, r);
      }
    }
  }

  function buildStage(stage) {
    const grid = makeGrid();
    const next = rng(0x8c0ffee ^ Math.imul(stage, 2654435761));
    const mirror = stage % 3 !== 0;
    const density = 0.27 + Math.min(stage, 35) * 0.003;

    for (let r = 1; r < 11; r += 1) {
      const cLimit = mirror ? 6 : 12;
      for (let c = 0; c <= cLimit; c += 1) {
        const targetCols = mirror && c !== 6 ? [c, 12 - c] : [c];
        const roll = next();
        let type = EMPTY;
        if (roll < density) type = BRICK;
        else if (roll < density + 0.055 + stage * 0.001) type = STEEL;
        else if (roll < density + 0.105) type = WATER;
        else if (roll < density + 0.175) type = FOREST;
        else if (roll < density + 0.215) type = ICE;

        for (const col of targetCols) {
          if (isReservedCell(col, r)) continue;
          setTile(grid, col, r, type, 15);
        }
      }
    }

    addStageMotif(grid, stage);
    prepareBattleGrid(grid);
    return grid;
  }

  function parseStageRows(rows) {
    const grid = makeGrid();
    for (let r = 0; r < Math.min(GRID, rows.length); r += 1) {
      const row = rows[r] || "";
      for (let c = 0; c < Math.min(GRID, row.length); c += 1) {
        const ch = row[c];
        const type = TILE_CODE_TO_TYPE[ch] || EMPTY;
        setTile(grid, c, r, type, 15);
      }
    }
    return grid;
  }

  function parseStageQuadrants(rows) {
    const grid = makeGrid();
    for (let r = 0; r < QUAD_GRID; r += 1) {
      const row = rows[r] || "";
      for (let c = 0; c < QUAD_GRID; c += 1) {
        const ch = row[c] || ".";
        const type = TILE_CODE_TO_TYPE[ch] || EMPTY;
        const tileC = Math.floor(c / 2);
        const tileR = Math.floor(r / 2);
        const q = (r % 2) * 2 + (c % 2);
        const cell = grid[tileR][tileC];
        if (type === BRICK || type === STEEL) {
          if (cell.type !== type) {
            cell.type = type;
            cell.mask = 0;
            cell.steelHits = [0, 0, 0, 0];
          }
          cell.mask |= 1 << q;
        } else if (type !== EMPTY) {
          cell.type = type;
          cell.mask = 0;
          cell.steelHits = [0, 0, 0, 0];
        }
      }
    }
    return grid;
  }

  function normalizeStageRows(rows, label) {
    if (!Array.isArray(rows) || rows.length !== GRID) {
      throw new Error(`${label} must contain ${GRID} rows`);
    }
    return rows.map((row, r) => {
      if (typeof row !== "string" || row.length !== GRID) {
        throw new Error(`${label} row ${r + 1} must contain ${GRID} characters`);
      }
      return Array.from(row, (ch, c) => {
        if (!Object.prototype.hasOwnProperty.call(NORMALIZED_TILE_CODE, ch)) {
          throw new Error(`${label} row ${r + 1}, column ${c + 1} has unknown tile '${ch}'`);
        }
        return NORMALIZED_TILE_CODE[ch];
      }).join("");
    });
  }

  function normalizeStageQuadrants(rows, label) {
    if (!Array.isArray(rows) || rows.length !== QUAD_GRID) {
      throw new Error(`${label} must contain ${QUAD_GRID} rows`);
    }
    return rows.map((row, r) => {
      if (typeof row !== "string" || row.length !== QUAD_GRID) {
        throw new Error(`${label} row ${r + 1} must contain ${QUAD_GRID} characters`);
      }
      return Array.from(row, (ch, c) => {
        if (!Object.prototype.hasOwnProperty.call(NORMALIZED_TILE_CODE, ch)) {
          throw new Error(`${label} row ${r + 1}, column ${c + 1} has unknown tile '${ch}'`);
        }
        return NORMALIZED_TILE_CODE[ch];
      }).join("");
    });
  }

  function normalizeEnemyTypes(types) {
    if (types === undefined) return cloneEnemyTypes(defaultEnemyTypes);
    if (!Array.isArray(types) || types.length !== defaultEnemyTypes.length) {
      throw new Error(`enemyTypes must contain exactly ${defaultEnemyTypes.length} entries`);
    }
    return types.map((enemyType, index) => normalizeEnemyType(enemyType, index));
  }

  function normalizeEnemyType(enemyType, index) {
    if (!enemyType || typeof enemyType !== "object") {
      throw new Error(`enemyTypes[${index}] must be an object`);
    }
    const fallback = defaultEnemyTypes[index];
    const name = enemyType.name === undefined ? fallback.name : String(enemyType.name);
    if (!name || name.length > 24) throw new Error(`enemyTypes[${index}].name must be 1 to 24 characters`);
    const hp = normalizeNumber(enemyType.hp, fallback.hp, 1, 9, true, `enemyTypes[${index}].hp`);
    const speed = normalizeNumber(enemyType.speed, fallback.speed, 0.1, 3, false, `enemyTypes[${index}].speed`);
    const bullet = normalizeNumber(enemyType.bullet, fallback.bullet, 0.1, 6, false, `enemyTypes[${index}].bullet`);
    const wallPower = normalizeNumber(enemyType.wallPower, fallback.wallPower, 1, 3, true, `enemyTypes[${index}].wallPower`);
    const reload = normalizeNumber(enemyType.reload, fallback.reload, 1, 600, true, `enemyTypes[${index}].reload`);
    const fireChance = normalizeNumber(enemyType.fireChance, fallback.fireChance, 0, 1, false, `enemyTypes[${index}].fireChance`);
    const score = normalizeNumber(enemyType.score, fallback.score, 0, 9999, true, `enemyTypes[${index}].score`);
    const color = enemyType.color === undefined ? fallback.color : String(enemyType.color);
    if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`enemyTypes[${index}].color must be a #rrggbb color`);
    const hitColors = normalizeHitColors(enemyType.hitColors, fallback.hitColors, `enemyTypes[${index}].hitColors`);
    return { name, hp, speed, bullet, wallPower, reload, fireChance, score, color, hitColors };
  }

  function normalizeHitColors(colors, fallback, label) {
    const source = colors === undefined ? fallback : colors;
    if (source === undefined || source === null) return null;
    if (!Array.isArray(source) || source.length < 1 || source.length > 9) {
      throw new Error(`${label} must contain 1 to 9 #rrggbb colors`);
    }
    return source.map((color, index) => {
      const value = String(color);
      if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${label}[${index}] must be a #rrggbb color`);
      return value;
    });
  }

  function normalizeNumber(value, fallback, min, max, integer, label) {
    const normalized = value === undefined ? fallback : Number(value);
    if (!Number.isFinite(normalized) || normalized < min || normalized > max || (integer && !Number.isInteger(normalized))) {
      throw new Error(`${label} must be ${integer ? "an integer" : "a number"} from ${min} to ${max}`);
    }
    return normalized;
  }

  function cloneEnemyTypes(types) {
    return types.map((enemyType) => ({
      ...enemyType,
      hitColors: enemyType.hitColors ? enemyType.hitColors.slice() : null
    }));
  }

  function clonePlayerUpgradeRules(rules) {
    return rules.map((rule) => ({ ...rule }));
  }

  function cloneExplosionRules(rules) {
    return Object.fromEntries(Object.entries(rules).map(([key, rule]) => [key, { ...rule }]));
  }

  function cloneAudioManifest() {
    return JSON.parse(JSON.stringify(FREE_AUDIO_MANIFEST));
  }

  function cloneSpriteManifest() {
    return JSON.parse(JSON.stringify(FREE_SPRITE_MANIFEST));
  }

  function normalizePlayerUpgradeRules(rules) {
    if (rules === undefined) return clonePlayerUpgradeRules(defaultPlayerUpgradeRules);
    if (!Array.isArray(rules) || rules.length !== defaultPlayerUpgradeRules.length) {
      throw new Error(`gameSettings.playerUpgradeRules must contain exactly ${defaultPlayerUpgradeRules.length} entries`);
    }
    return rules.map((rule, index) => normalizePlayerUpgradeRule(rule, index));
  }

  function normalizePlayerUpgradeRule(rule, index) {
    if (!rule || typeof rule !== "object") {
      throw new Error(`gameSettings.playerUpgradeRules[${index}] must be an object`);
    }
    const fallback = defaultPlayerUpgradeRules[index];
    return {
      level: index,
      maxBullets: normalizeNumber(rule.maxBullets, fallback.maxBullets, 1, 4, true, `gameSettings.playerUpgradeRules[${index}].maxBullets`),
      bulletSpeed: normalizeNumber(rule.bulletSpeed, fallback.bulletSpeed, 0.1, 6, false, `gameSettings.playerUpgradeRules[${index}].bulletSpeed`),
      wallPower: normalizeNumber(rule.wallPower, fallback.wallPower, 1, 3, true, `gameSettings.playerUpgradeRules[${index}].wallPower`),
      reload: normalizeNumber(rule.reload, fallback.reload, 1, 600, true, `gameSettings.playerUpgradeRules[${index}].reload`)
    };
  }

  function normalizeEnemySequence(sequence, label, enemyTypeCount) {
    if (!Array.isArray(sequence) || sequence.length < 1) {
      throw new Error(`${label} must contain at least one enemy`);
    }
    return sequence.map((enemy, index) => normalizeEnemySpec(enemy, index, label, enemyTypeCount));
  }

  function normalizeEnemySpec(enemy, index, label, enemyTypeCount) {
    if (!enemy || typeof enemy !== "object") {
      throw new Error(`${label} enemy ${index + 1} must be an object`);
    }
    const typeIndex = Number(enemy.typeIndex);
    if (!Number.isInteger(typeIndex) || typeIndex < 0 || typeIndex >= enemyTypeCount) {
      throw new Error(`${label} enemy ${index + 1} has invalid typeIndex`);
    }
    const spawnIndex = enemy.spawnIndex === undefined ? (index + 1) % 3 : Number(enemy.spawnIndex);
    if (!Number.isInteger(spawnIndex) || spawnIndex < 0 || spawnIndex > 7) {
      throw new Error(`${label} enemy ${index + 1} has invalid spawnIndex`);
    }
    let powerUpType = null;
    if (enemy.powerUpType !== undefined && enemy.powerUpType !== null && enemy.powerUpType !== "") {
      if (!powerTypes.includes(enemy.powerUpType)) {
        throw new Error(`${label} enemy ${index + 1} has invalid powerUpType`);
      }
      powerUpType = enemy.powerUpType;
    }
    let spawnDelay = null;
    if (enemy.spawnDelay !== undefined && enemy.spawnDelay !== null && enemy.spawnDelay !== "") {
      spawnDelay = Number(enemy.spawnDelay);
      if (!Number.isInteger(spawnDelay) || spawnDelay < 0 || spawnDelay > 3600) {
        throw new Error(`${label} enemy ${index + 1} has invalid spawnDelay`);
      }
    }
    return {
      typeIndex,
      carrier: Boolean(enemy.carrier),
      spawnIndex,
      powerUpType,
      spawnDelay
    };
  }

  function normalizeStageSettings(settings, totalStages) {
    const source = Array.isArray(settings) ? settings : [];
    if (source.length > totalStages) {
      throw new Error(`stageSettings must not contain more than ${totalStages} stages`);
    }
    return Array.from({ length: totalStages }, (_, index) => {
      const entry = source[index] || {};
      if (!entry || typeof entry !== "object") {
        throw new Error(`stageSettings[${index}] must be an object`);
      }
      const maxActiveEnemies = entry.maxActiveEnemies === undefined
        ? DEFAULT_MAX_ACTIVE_ENEMIES
        : Number(entry.maxActiveEnemies);
      if (!Number.isInteger(maxActiveEnemies) || maxActiveEnemies < 1 || maxActiveEnemies > 8) {
        throw new Error(`stageSettings[${index}].maxActiveEnemies must be an integer from 1 to 8`);
      }
      const maxActiveEnemiesTwoPlayer = entry.maxActiveEnemiesTwoPlayer === undefined
        ? (entry.maxActiveEnemies === undefined ? DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER : maxActiveEnemies)
        : Number(entry.maxActiveEnemiesTwoPlayer);
      if (!Number.isInteger(maxActiveEnemiesTwoPlayer) || maxActiveEnemiesTwoPlayer < 1 || maxActiveEnemiesTwoPlayer > 8) {
        throw new Error(`stageSettings[${index}].maxActiveEnemiesTwoPlayer must be an integer from 1 to 8`);
      }
      return {
        maxActiveEnemies,
        maxActiveEnemiesTwoPlayer,
        playerSpawns: normalizeSpawnList(entry.playerSpawns, 2, DEFAULT_PLAYER_SPAWNS, `stageSettings[${index}].playerSpawns`),
        enemySpawns: normalizeSpawnList(entry.enemySpawns, 3, DEFAULT_ENEMY_SPAWNS, `stageSettings[${index}].enemySpawns`),
        powerUpSpawns: normalizePowerUpSpawnList(entry.powerUpSpawns, `stageSettings[${index}].powerUpSpawns`)
      };
    });
  }

  function normalizeSpawnList(spawns, minLength, defaults, label) {
    if (spawns === undefined) return defaults.map((point) => ({ x: point.x, y: point.y }));
    if (!Array.isArray(spawns) || spawns.length < minLength) {
      throw new Error(`${label} must contain at least ${minLength} spawn points`);
    }
    return spawns.map((spawn, index) => normalizeSpawnPoint(spawn, `${label}[${index}]`));
  }

  function normalizeSpawnPoint(spawn, label) {
    if (!spawn || typeof spawn !== "object") throw new Error(`${label} must be an object`);
    const tileX = Number(spawn.x);
    const tileY = Number(spawn.y);
    if (!Number.isInteger(tileX) || tileX < 0 || tileX >= GRID) {
      throw new Error(`${label}.x must be an integer from 0 to ${GRID - 1}`);
    }
    if (!Number.isInteger(tileY) || tileY < 0 || tileY >= GRID) {
      throw new Error(`${label}.y must be an integer from 0 to ${GRID - 1}`);
    }
    return { x: tileX * TILE + 1, y: tileY * TILE + 1 };
  }

  function normalizePowerUpSpawnList(spawns, label) {
    if (spawns === undefined) return DEFAULT_POWERUP_SPAWNS.map((point) => ({ x: point.x, y: point.y }));
    if (!Array.isArray(spawns) || spawns.length < 1) {
      throw new Error(`${label} must contain at least one spawn point`);
    }
    return spawns.map((spawn, index) => normalizePowerUpSpawnPoint(spawn, `${label}[${index}]`));
  }

  function normalizePowerUpSpawnPoint(spawn, label) {
    if (!spawn || typeof spawn !== "object") throw new Error(`${label} must be an object`);
    const tileX = Number(spawn.x);
    const tileY = Number(spawn.y);
    if (!Number.isInteger(tileX) || tileX < 0 || tileX >= GRID) {
      throw new Error(`${label}.x must be an integer from 0 to ${GRID - 1}`);
    }
    if (!Number.isInteger(tileY) || tileY < 0 || tileY >= GRID) {
      throw new Error(`${label}.y must be an integer from 0 to ${GRID - 1}`);
    }
    return { x: tileX * TILE + 2, y: tileY * TILE + 2 };
  }

  function normalizeGameSettings(settings) {
    const source = settings || {};
    if (typeof source !== "object") throw new Error("gameSettings must be an object");
    const initialLives = source.initialLives === undefined ? DEFAULT_INITIAL_LIVES : Number(source.initialLives);
    if (!Number.isInteger(initialLives) || initialLives < 1 || initialLives > 9) {
      throw new Error("gameSettings.initialLives must be an integer from 1 to 9");
    }
    const rawBonusScores = source.bonusLifeScores === undefined ? DEFAULT_BONUS_LIFE_SCORES : source.bonusLifeScores;
    if (!Array.isArray(rawBonusScores)) throw new Error("gameSettings.bonusLifeScores must be an array");
    const bonusLifeScores = rawBonusScores.map((score, index) => {
      const value = Number(score);
      if (!Number.isInteger(value) || value < 1 || value > 999999) {
        throw new Error(`gameSettings.bonusLifeScores[${index}] must be an integer from 1 to 999999`);
      }
      return value;
    }).sort((a, b) => a - b);
    const deathPowerLevel = source.deathPowerLevel === undefined ? DEFAULT_DEATH_POWER_LEVEL : Number(source.deathPowerLevel);
    if (!Number.isInteger(deathPowerLevel) || deathPowerLevel < 0 || deathPowerLevel > 3) {
      throw new Error("gameSettings.deathPowerLevel must be an integer from 0 to 3");
    }
    return {
      initialLives,
      bonusLifeScores,
      deathPowerLevel,
      powerUpDurations: normalizePowerUpDurations(source.powerUpDurations),
      powerUpRules: normalizePowerUpRules(source.powerUpRules),
      timings: normalizeTimings(source.timings),
      enemySpawnPacing: normalizeEnemySpawnPacing(source.enemySpawnPacing),
      playerMovement: normalizePlayerMovement(source.playerMovement),
      projectileRules: normalizeProjectileRules(source.projectileRules),
      friendlyFire: normalizeFriendlyFire(source.friendlyFire),
      explosionRules: normalizeExplosionRules(source.explosionRules),
      stageAdvance: normalizeStageAdvance(source.stageAdvance),
      stageClearBonus: normalizeStageClearBonus(source.stageClearBonus),
      enemyAi: normalizeEnemyAi(source.enemyAi),
      playerUpgradeRules: normalizePlayerUpgradeRules(source.playerUpgradeRules),
      timerFreezesEnemyTime: normalizeBooleanSetting(
        source.timerFreezesEnemyTime,
        DEFAULT_TIMER_FREEZES_ENEMY_TIME,
        "gameSettings.timerFreezesEnemyTime"
      )
    };
  }

  function normalizeBooleanSetting(value, fallback, label) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
    return value;
  }

  function normalizePowerUpDurations(durations) {
    const source = durations || {};
    if (typeof source !== "object") throw new Error("gameSettings.powerUpDurations must be an object");
    return Object.fromEntries(Object.entries(DEFAULT_POWERUP_DURATIONS).map(([key, defaultValue]) => {
      const value = source[key] === undefined ? defaultValue : Number(source[key]);
      if (!Number.isInteger(value) || value < 1 || value > 3600) {
        throw new Error(`gameSettings.powerUpDurations.${key} must be an integer from 1 to 3600`);
      }
      return [key, value];
    }));
  }

  function normalizePowerUpRules(rules) {
    const source = rules || {};
    if (typeof source !== "object") throw new Error("gameSettings.powerUpRules must be an object");
    const carrierRelease = source.carrierRelease === undefined ? DEFAULT_POWERUP_RULES.carrierRelease : String(source.carrierRelease);
    if (!["destroyed", "hit"].includes(carrierRelease)) {
      throw new Error("gameSettings.powerUpRules.carrierRelease must be destroyed or hit");
    }
    return {
      carrierRelease,
      clearUncollectedOnCarrierSpawn: normalizeBooleanSetting(
        source.clearUncollectedOnCarrierSpawn,
        DEFAULT_POWERUP_RULES.clearUncollectedOnCarrierSpawn,
        "gameSettings.powerUpRules.clearUncollectedOnCarrierSpawn"
      ),
      pickupScore: normalizeNumber(source.pickupScore, DEFAULT_POWERUP_RULES.pickupScore, 0, 999999, true, "gameSettings.powerUpRules.pickupScore")
    };
  }

  function normalizeTimings(timings) {
    const source = timings || {};
    if (typeof source !== "object") throw new Error("gameSettings.timings must be an object");
    return Object.fromEntries(Object.entries(DEFAULT_TIMINGS).map(([key, defaultValue]) => {
      const value = source[key] === undefined ? defaultValue : Number(source[key]);
      if (!Number.isInteger(value) || value < 0 || value > 3600) {
        throw new Error(`gameSettings.timings.${key} must be an integer from 0 to 3600`);
      }
      return [key, value];
    }));
  }

  function normalizeEnemySpawnPacing(pacing) {
    const source = pacing || {};
    if (typeof source !== "object") throw new Error("gameSettings.enemySpawnPacing must be an object");
    const normalized = {
      firstDelay: normalizeNumber(source.firstDelay, DEFAULT_ENEMY_SPAWN_PACING.firstDelay, 0, 3600, true, "gameSettings.enemySpawnPacing.firstDelay"),
      baseDelay: normalizeNumber(source.baseDelay, DEFAULT_ENEMY_SPAWN_PACING.baseDelay, 0, 3600, true, "gameSettings.enemySpawnPacing.baseDelay"),
      stageStep: normalizeNumber(source.stageStep, DEFAULT_ENEMY_SPAWN_PACING.stageStep, 0, 3600, true, "gameSettings.enemySpawnPacing.stageStep"),
      minDelay: normalizeNumber(source.minDelay, DEFAULT_ENEMY_SPAWN_PACING.minDelay, 0, 3600, true, "gameSettings.enemySpawnPacing.minDelay"),
      extendedLoopMinDelay: normalizeNumber(
        source.extendedLoopMinDelay,
        DEFAULT_ENEMY_SPAWN_PACING.extendedLoopMinDelay,
        0,
        3600,
        true,
        "gameSettings.enemySpawnPacing.extendedLoopMinDelay"
      )
    };
    if (source.twoPlayerDelayReduction !== undefined || source.twoPlayerDelayMultiplier === undefined) {
      normalized.twoPlayerDelayReduction = normalizeNumber(
        source.twoPlayerDelayReduction,
        DEFAULT_ENEMY_SPAWN_PACING.twoPlayerDelayReduction,
        0,
        3600,
        true,
        "gameSettings.enemySpawnPacing.twoPlayerDelayReduction"
      );
    } else {
      normalized.twoPlayerDelayMultiplier = normalizeNumber(
        source.twoPlayerDelayMultiplier,
        1,
        0.1,
        1,
        false,
        "gameSettings.enemySpawnPacing.twoPlayerDelayMultiplier"
      );
    }
    return normalized;
  }

  function normalizePlayerMovement(movement) {
    const source = movement || {};
    if (typeof source !== "object") throw new Error("gameSettings.playerMovement must be an object");
    const defaultCadence = source.speed === undefined ? DEFAULT_PLAYER_MOVEMENT.frameCadence : [true];
    return {
      speed: normalizeNumber(source.speed, DEFAULT_PLAYER_MOVEMENT.speed, 0.1, 6, false, "gameSettings.playerMovement.speed"),
      frameCadence: normalizePlayerFrameCadence(source.frameCadence, defaultCadence),
      iceSlideFrames: normalizeNumber(source.iceSlideFrames, DEFAULT_PLAYER_MOVEMENT.iceSlideFrames, 0, 3600, true, "gameSettings.playerMovement.iceSlideFrames"),
      iceSlideSpeed: normalizeNumber(source.iceSlideSpeed, DEFAULT_PLAYER_MOVEMENT.iceSlideSpeed, 0, 6, false, "gameSettings.playerMovement.iceSlideSpeed")
    };
  }

  function normalizePlayerFrameCadence(cadence, fallback) {
    const source = cadence === undefined ? fallback : cadence;
    if (!Array.isArray(source) || source.length < 1 || source.length > 16 || source.every((active) => active !== true)) {
      throw new Error("gameSettings.playerMovement.frameCadence must contain 1 to 16 booleans with at least one true value");
    }
    if (source.some((active) => typeof active !== "boolean")) {
      throw new Error("gameSettings.playerMovement.frameCadence must contain only booleans");
    }
    return source.slice();
  }

  function normalizeProjectileRules(rules) {
    const source = rules || {};
    if (typeof source !== "object") throw new Error("gameSettings.projectileRules must be an object");
    return {
      bulletSize: normalizeNumber(source.bulletSize, DEFAULT_PROJECTILE_RULES.bulletSize, 1, 16, true, "gameSettings.projectileRules.bulletSize"),
      spawnOffset: normalizeNumber(source.spawnOffset, DEFAULT_PROJECTILE_RULES.spawnOffset, 0, 32, false, "gameSettings.projectileRules.spawnOffset"),
      boundsPadding: normalizeNumber(source.boundsPadding, DEFAULT_PROJECTILE_RULES.boundsPadding, 0, 32, false, "gameSettings.projectileRules.boundsPadding")
    };
  }

  function normalizeFriendlyFire(friendlyFire) {
    const source = friendlyFire || {};
    if (typeof source !== "object") throw new Error("gameSettings.friendlyFire must be an object");
    return {
      enabled: normalizeBooleanSetting(source.enabled, DEFAULT_FRIENDLY_FIRE.enabled, "gameSettings.friendlyFire.enabled"),
      stunFrames: normalizeNumber(source.stunFrames, DEFAULT_FRIENDLY_FIRE.stunFrames, 0, 3600, true, "gameSettings.friendlyFire.stunFrames")
    };
  }

  function normalizeExplosionRules(rules) {
    const source = rules || {};
    if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("gameSettings.explosionRules must be an object");
    return Object.fromEntries(Object.entries(DEFAULT_EXPLOSION_RULES).map(([key, defaults]) => {
      const rule = source[key] === undefined ? {} : source[key];
      if (!rule || typeof rule !== "object" || Array.isArray(rule)) throw new Error(`gameSettings.explosionRules.${key} must be an object`);
      return [key, {
        ttl: normalizeNumber(rule.ttl, defaults.ttl, 1, 3600, true, `gameSettings.explosionRules.${key}.ttl`),
        color: normalizeHexColor(rule.color, defaults.color, `gameSettings.explosionRules.${key}.color`),
        coreColor: normalizeHexColor(rule.coreColor, defaults.coreColor, `gameSettings.explosionRules.${key}.coreColor`)
      }];
    }));
  }

  function normalizeHexColor(value, fallback, label) {
    const color = value === undefined ? fallback : String(value);
    if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`${label} must be a #rrggbb color`);
    return color;
  }

  function normalizeStageAdvance(advance) {
    const source = advance || {};
    if (typeof source !== "object") throw new Error("gameSettings.stageAdvance must be an object");
    return {
      loopAfterFinalStage: normalizeBooleanSetting(
        source.loopAfterFinalStage,
        DEFAULT_STAGE_ADVANCE.loopAfterFinalStage,
        "gameSettings.stageAdvance.loopAfterFinalStage"
      ),
      extendedLoopEndStage: normalizeNumber(
        source.extendedLoopEndStage,
        DEFAULT_STAGE_ADVANCE.extendedLoopEndStage,
        1,
        999,
        true,
        "gameSettings.stageAdvance.extendedLoopEndStage"
      ),
      extendedLoopEnemyStage: normalizeNumber(
        source.extendedLoopEnemyStage,
        DEFAULT_STAGE_ADVANCE.extendedLoopEnemyStage,
        1,
        999,
        true,
        "gameSettings.stageAdvance.extendedLoopEnemyStage"
      )
    };
  }

  function normalizeStageClearBonus(bonus) {
    const source = bonus || {};
    if (typeof source !== "object") throw new Error("gameSettings.stageClearBonus must be an object");
    return {
      points: normalizeNumber(source.points, DEFAULT_STAGE_CLEAR_BONUS.points, 0, 999999, true, "gameSettings.stageClearBonus.points"),
      twoPlayerOnly: normalizeBooleanSetting(
        source.twoPlayerOnly,
        DEFAULT_STAGE_CLEAR_BONUS.twoPlayerOnly,
        "gameSettings.stageClearBonus.twoPlayerOnly"
      ),
      requireStrictLead: normalizeBooleanSetting(
        source.requireStrictLead,
        DEFAULT_STAGE_CLEAR_BONUS.requireStrictLead,
        "gameSettings.stageClearBonus.requireStrictLead"
      )
    };
  }

  function normalizeEnemyAi(enemyAi) {
    const source = enemyAi || {};
    if (typeof source !== "object") throw new Error("gameSettings.enemyAi must be an object");
    return {
      intersectionTurnChance: normalizeNumber(
        source.intersectionTurnChance,
        source.randomTurnChance === undefined ? DEFAULT_ENEMY_AI.intersectionTurnChance : source.randomTurnChance,
        0,
        1,
        false,
        "gameSettings.enemyAi.intersectionTurnChance"
      ),
      blockedRetryChance: normalizeNumber(source.blockedRetryChance, DEFAULT_ENEMY_AI.blockedRetryChance, 0, 1, false, "gameSettings.enemyAi.blockedRetryChance"),
      blockedRetryTicks: normalizeNumber(source.blockedRetryTicks, DEFAULT_ENEMY_AI.blockedRetryTicks, 0, 60, true, "gameSettings.enemyAi.blockedRetryTicks"),
      horizontalFirstChance: normalizeNumber(
        source.horizontalFirstChance,
        source.targetAxisBias === undefined ? DEFAULT_ENEMY_AI.horizontalFirstChance : source.targetAxisBias,
        0,
        1,
        false,
        "gameSettings.enemyAi.horizontalFirstChance"
      )
    };
  }

  function normalizeStagePack(pack) {
    if (!pack || typeof pack !== "object") throw new Error("stage pack must be an object");
    const totalStages = Number(pack.totalStages);
    const enemyTotalValue = pack.enemyTotal === undefined ? null : Number(pack.enemyTotal);
    if (!Number.isInteger(totalStages) || totalStages < 1) {
      throw new Error("totalStages must be a positive integer");
    }
    if (enemyTotalValue !== null && (!Number.isInteger(enemyTotalValue) || enemyTotalValue < 1)) {
      throw new Error("enemyTotal must be a positive integer");
    }
    const hasMaps = Array.isArray(pack.maps);
    const hasQuadrants = Array.isArray(pack.quadrants);
    if (hasMaps === hasQuadrants) {
      throw new Error("stage pack must contain exactly one of maps or quadrants");
    }
    if (hasMaps && pack.maps.length !== totalStages) {
      throw new Error(`maps must contain exactly ${totalStages} stages`);
    }
    if (hasQuadrants && pack.quadrants.length !== totalStages) {
      throw new Error(`quadrants must contain exactly ${totalStages} stages`);
    }
    if (!Array.isArray(pack.enemies) || pack.enemies.length !== totalStages) {
      throw new Error(`enemies must contain exactly ${totalStages} stages`);
    }

    const enemyTypes = normalizeEnemyTypes(pack.enemyTypes);
    const maps = hasMaps ? pack.maps.map((rows, index) => normalizeStageRows(rows, `maps[${index}]`)) : null;
    const quadrants = hasQuadrants
      ? pack.quadrants.map((rows, index) => normalizeStageQuadrants(rows, `quadrants[${index}]`))
      : null;
    const enemies = pack.enemies.map((sequence, index) => normalizeEnemySequence(sequence, `enemies[${index}]`, enemyTypes.length));
    const stageSettings = normalizeStageSettings(pack.stageSettings, totalStages);
    const gameSettings = normalizeGameSettings(pack.gameSettings);

    return {
      id: String(pack.id || "stage-pack"),
      totalStages,
      enemyTotal: enemyTotalValue || Math.max(...enemies.map((sequence) => sequence.length)),
      enemyTotals: enemies.map((sequence) => sequence.length),
      enemyTypes,
      gameSettings,
      maps,
      quadrants,
      enemies,
      stageSettings,
      createGrid(stage) {
        return this.quadrants ? parseStageQuadrants(this.quadrants[stage - 1]) : parseStageRows(this.maps[stage - 1]);
      },
      enemyAt(stage, index) {
        return this.enemies[stage - 1][index];
      }
    };
  }

  function tryNormalizeStagePack(pack) {
    try {
      return { ok: true, pack: normalizeStagePack(pack), error: "" };
    } catch (error) {
      return { ok: false, pack: null, error: error.message || String(error) };
    }
  }

  function buildOriginalStyleEnemySequences() {
    return ORIGINAL_STYLE_ENEMY_GROUPS.map((groups, stageIndex) => buildEnemySequenceFromGroups(groups, stageIndex + 1));
  }

  function buildEnemySequenceFromGroups(groups, stage) {
    const sequence = [];
    for (const group of groups) {
      const count = group[0];
      const typeIndex = group[1];
      for (let i = 0; i < count; i += 1) {
        const index = sequence.length;
        sequence.push({
          typeIndex,
          carrier: BONUS_ENEMY_INDICES.includes(index),
          spawnIndex: (index + 1) % 3,
          powerUpType: null,
          spawnDelay: null
        });
      }
    }
    if (sequence.length !== DEFAULT_ENEMY_TOTAL) {
      throw new Error(`built-in stage ${stage} enemy sequence must contain ${DEFAULT_ENEMY_TOTAL} enemies`);
    }
    return sequence;
  }

  function gridToRows(grid) {
    return grid.map((row) =>
      row.map((cell) => {
        if (cell.type === BRICK && cell.mask) return "B";
        if (cell.type === STEEL && cell.mask) return "S";
        if (cell.type === WATER) return "W";
        if (cell.type === FOREST) return "F";
        if (cell.type === ICE) return "I";
        return ".";
      }).join("")
    );
  }

  function gridToQuadrants(grid) {
    return Array.from({ length: QUAD_GRID }, (_, r) =>
      Array.from({ length: QUAD_GRID }, (_, c) => {
        const cell = grid[Math.floor(r / 2)][Math.floor(c / 2)];
        const q = (r % 2) * 2 + (c % 2);
        if (cell.type === BRICK && cell.mask & (1 << q)) return "B";
        if (cell.type === STEEL && cell.mask & (1 << q)) return "S";
        if (cell.type === WATER) return "W";
        if (cell.type === FOREST) return "F";
        if (cell.type === ICE) return "I";
        return ".";
      }).join("")
    );
  }

  function makeSingleStagePack(rows) {
    return {
      id: "custom-stage",
      totalStages: 1,
      enemyTotal: DEFAULT_ENEMY_TOTAL,
      enemyTypes: cloneEnemyTypes(defaultEnemyTypes),
      gameSettings: {
        initialLives: DEFAULT_INITIAL_LIVES,
        bonusLifeScores: DEFAULT_BONUS_LIFE_SCORES.slice(),
        deathPowerLevel: DEFAULT_DEATH_POWER_LEVEL,
        powerUpDurations: { ...DEFAULT_POWERUP_DURATIONS },
        powerUpRules: { ...DEFAULT_POWERUP_RULES },
        timings: { ...DEFAULT_TIMINGS },
        enemySpawnPacing: { ...DEFAULT_ENEMY_SPAWN_PACING },
        playerMovement: { ...DEFAULT_PLAYER_MOVEMENT },
        projectileRules: { ...DEFAULT_PROJECTILE_RULES },
        friendlyFire: { ...DEFAULT_FRIENDLY_FIRE },
        explosionRules: cloneExplosionRules(DEFAULT_EXPLOSION_RULES),
        stageAdvance: { ...DEFAULT_STAGE_ADVANCE },
        stageClearBonus: { ...DEFAULT_STAGE_CLEAR_BONUS },
        enemyAi: { ...DEFAULT_ENEMY_AI },
        playerUpgradeRules: clonePlayerUpgradeRules(defaultPlayerUpgradeRules),
        timerFreezesEnemyTime: DEFAULT_TIMER_FREEZES_ENEMY_TIME
      },
      stageSettings: [{
        maxActiveEnemies: DEFAULT_MAX_ACTIVE_ENEMIES,
        maxActiveEnemiesTwoPlayer: DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
        playerSpawns: [{ x: 4, y: 12 }, { x: 8, y: 12 }],
        enemySpawns: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }],
        powerUpSpawns: DEFAULT_POWERUP_SPAWNS.map(powerUpPixelToTilePoint)
      }],
      quadrants: [rows.length === QUAD_GRID ? rows : gridToQuadrants(parseStageRows(rows))],
      enemies: [builtInStagePack.enemies[0].map((enemy) => ({ ...enemy }))]
    };
  }

  function stageCount() {
    return game.stagePack.totalStages || builtInStagePack.totalStages;
  }

  function stageCycleLimit() {
    const count = stageCount();
    const advance = gameSettings().stageAdvance || DEFAULT_STAGE_ADVANCE;
    if (
      advance.loopAfterFinalStage &&
      count === DEFAULT_ORIGINAL_STAGE_COUNT &&
      advance.extendedLoopEndStage > count
    ) {
      return advance.extendedLoopEndStage;
    }
    return count;
  }

  function isExtendedLoopStage(stage) {
    const value = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
    return value > stageCount() && value <= stageCycleLimit();
  }

  function mapDataStage(stage) {
    const count = stageCount();
    const value = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
    if (isExtendedLoopStage(value)) return ((value - 1) % count) + 1;
    return clamp(value, 1, count);
  }

  function enemyDataStage(stage) {
    const count = stageCount();
    const value = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
    if (isExtendedLoopStage(value)) {
      const repeated = gameSettings().stageAdvance.extendedLoopEnemyStage;
      return clamp(repeated, 1, count);
    }
    return clamp(value, 1, count);
  }

  function enemyTotal(stage) {
    const pack = game.stagePack || builtInStagePack;
    const stageIndex = enemyDataStage(stage || game.stage) - 1;
    if (pack.enemyTotals && pack.enemyTotals[stageIndex]) return pack.enemyTotals[stageIndex];
    if (pack.enemies && pack.enemies[stageIndex]) return pack.enemies[stageIndex].length;
    return pack.enemyTotal || DEFAULT_ENEMY_TOTAL;
  }

  function maxActiveEnemies(stage, players) {
    const pack = game.stagePack || builtInStagePack;
    const stageIndex = mapDataStage(stage || game.stage) - 1;
    const playerCount = Math.max(1, Math.floor(Number(players) || game.playerCount || 1));
    if (pack.stageSettings && pack.stageSettings[stageIndex]) {
      const settings = pack.stageSettings[stageIndex];
      return playerCount > 1 ? settings.maxActiveEnemiesTwoPlayer : settings.maxActiveEnemies;
    }
    return playerCount > 1 ? DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER : DEFAULT_MAX_ACTIVE_ENEMIES;
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

  function pixelToTilePoint(point) {
    return {
      x: Math.floor((point.x - 1) / TILE),
      y: Math.floor((point.y - 1) / TILE)
    };
  }

  function powerUpPixelToTilePoint(point) {
    return {
      x: Math.floor((point.x - 2) / TILE),
      y: Math.floor((point.y - 2) / TILE)
    };
  }

  function createStageGrid(stage) {
    const pack = game.stagePack || builtInStagePack;
    const dataStage = mapDataStage(stage);
    if (typeof pack.createGrid === "function") return pack.createGrid(dataStage);
    if (pack.quadrants && pack.quadrants[dataStage - 1]) return parseStageQuadrants(pack.quadrants[dataStage - 1]);
    if (pack.maps && pack.maps[dataStage - 1]) return parseStageRows(pack.maps[dataStage - 1]);
    return buildStage(dataStage);
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

  function addStageMotif(grid, stage) {
    const variant = stage % 7;
    if (variant === 1) {
      for (let c = 2; c <= 10; c += 2) setTile(grid, c, 5, STEEL, 15);
      for (let r = 2; r <= 9; r += 3) setTile(grid, 6, r, BRICK, 15);
    } else if (variant === 2) {
      for (let r = 2; r <= 8; r += 1) {
        setTile(grid, 3, r, WATER, 0);
        setTile(grid, 9, r, WATER, 0);
      }
    } else if (variant === 3) {
      for (let c = 1; c <= 11; c += 1) if (c !== 6) setTile(grid, c, 6, FOREST, 0);
      for (let r = 2; r <= 10; r += 2) setTile(grid, 6, r, BRICK, 15);
    } else if (variant === 4) {
      for (let c = 1; c <= 11; c += 1) {
        if (c < 4 || c > 8) setTile(grid, c, 3, ICE, 0);
        setTile(grid, c, 9, c % 2 ? BRICK : EMPTY, 15);
      }
    } else if (variant === 5) {
      for (let r = 2; r <= 9; r += 1) {
        setTile(grid, 2, r, BRICK, 15);
        setTile(grid, 10, r, BRICK, 15);
      }
      setTile(grid, 6, 4, STEEL, 15);
      setTile(grid, 6, 8, STEEL, 15);
    } else if (variant === 6) {
      for (let i = 0; i < 5; i += 1) {
        setTile(grid, 2 + i, 2 + i, BRICK, 15);
        setTile(grid, 10 - i, 2 + i, BRICK, 15);
      }
    }
  }

  function isReservedCell(c, r) {
    if (r <= 1 && (c <= 1 || (c >= 5 && c <= 7) || c >= 11)) return true;
    if (r >= 10 && c >= 3 && c <= 9) return true;
    if (r >= 11 && c >= 5 && c <= 7) return true;
    return false;
  }

  function prepareBattleGrid(grid) {
    clearRect(grid, 0, 0, 1, 1);
    clearRect(grid, 5, 0, 7, 1);
    clearRect(grid, 11, 0, 12, 1);
    clearRect(grid, 3, 11, 4, 12);
    clearRect(grid, 8, 11, 9, 12);
    clearRect(grid, 5, 11, 7, 12);
    buildBaseWall(grid, BRICK);
  }

  function prepareConstructedBattleGrid(grid) {
    clearTile(grid, 6, 12);
  }

  function makeOriginalConstructionGrid() {
    const grid = makeGrid();
    buildBaseWall(grid, BRICK);
    return grid;
  }

  function buildBaseWall(grid, type) {
    const cells = [
      [5, 11],
      [6, 11],
      [7, 11],
      [5, 12],
      [7, 12]
    ];
    for (const [c, r] of cells) setTile(grid, c, r, type, 15);
    clearTile(grid, 6, 12);
  }

  function createPlayer(id) {
    const spawn = playerSpawnPoint(id);
    const spawnFlash = gameSettings().timings.playerSpawnFlash;
    return {
      kind: "player",
      id,
      x: spawn.x,
      y: spawn.y,
      spawnX: spawn.x,
      spawnY: spawn.y,
      w: 14,
      h: 14,
      dir: UP,
      speed: gameSettings().playerMovement.speed,
      alive: true,
      lives: gameSettings().initialLives,
      nextBonusLifeIndex: 0,
      respawn: 0,
      spawnFlash,
      invuln: spawnFlash > 0 ? 0 : gameSettings().timings.playerInvulnerability,
      stun: 0,
      pendingSnap: false,
      level: 0,
      reload: 0,
      score: 0,
      stagePoints: 0,
      stageKills: Array(enemyTypeDefinitions().length).fill(0),
      totalKills: Array(enemyTypeDefinitions().length).fill(0),
      slide: 0,
      color: id === 1 ? "#e3c64e" : "#55b96a",
      accent: id === 1 ? "#fff0a8" : "#b7ffbd"
    };
  }

  function resetPlayerPosition(player) {
    player.x = player.spawnX;
    player.y = player.spawnY;
    player.dir = UP;
    player.alive = player.lives > 0;
    player.respawn = 0;
    player.spawnFlash = gameSettings().timings.playerSpawnFlash;
    player.invuln = player.spawnFlash > 0 ? 0 : gameSettings().timings.playerInvulnerability;
    player.stun = 0;
    player.pendingSnap = false;
    player.reload = 0;
    player.slide = 0;
  }

  function startGame(players, options) {
    const opts = options || {};
    initAudio();
    game.playerCount = players;
    game.paused = false;
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

  function beginStageSelect(players) {
    initAudio();
    game.stageSelectPlayers = players === 2 ? 2 : 1;
    game.stage = 1;
    game.screen = "stageSelect";
    game.paused = false;
    game.stageSelectHoldTimer = 0;
  }

  function startSelectedGame() {
    startGame(game.stageSelectPlayers, { stage: game.stage });
  }

  function stageSelectLimit() {
    return Math.max(1, Math.min(DEFAULT_ORIGINAL_STAGE_COUNT, stageCount()));
  }

  function changeStageSelection(delta) {
    const limit = stageSelectLimit();
    game.stage += delta;
    if (game.stage < 1) game.stage = limit;
    if (game.stage > limit) game.stage = 1;
  }

  function startStage(stage) {
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
    game.gameOverTimer = 0;
    game.freezeTimer = 0;
    game.shovelTimer = 0;
    game.stageClearElapsed = 0;
    game.stageClearBonusPlayerIds = [];
    game.stageClearBonusAwarded = false;
    for (const player of game.players) {
      resetStageStats(player);
      resetPlayerPosition(player);
    }
  }

  function resetStageStats(player) {
    player.stagePoints = 0;
    player.stageKills = Array(enemyTypeDefinitions().length).fill(0);
  }

  function enterEditor() {
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
    game.customGrid = null;
    game.constructionStageActive = false;
    game.stage = 1;
    game.screen = "title";
    game.paused = false;
    game.editorMoveHoldTimer = 0;
  }

  function moveTitleMenu(delta) {
    game.titleMenu = (game.titleMenu + delta + TITLE_MENU_ITEMS.length) % TITLE_MENU_ITEMS.length;
  }

  function setTitleMenu(index) {
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
    const rows = gridToQuadrants(game.editorGrid);
    const result = tryNormalizeStagePack(makeSingleStagePack(rows));
    if (!result.ok) {
      showEditorMessage("BAD");
      return;
    }
    game.stagePack = result.pack;
    startGame(1, { stage: 1, customGrid: parseStageQuadrants(rows) });
  }

  function saveEditorStage() {
    if (!game.editorGrid) return;
    try {
      localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify({
        version: 2,
        quadrants: gridToQuadrants(game.editorGrid)
      }));
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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.quadrants) && parsed.quadrants.length === QUAD_GRID) {
        game.editorGrid = parseStageQuadrants(parsed.quadrants);
      } else if (Array.isArray(parsed.rows) && parsed.rows.length === GRID) {
        game.editorGrid = parseStageRows(parsed.rows);
      } else {
        showEditorMessage("BAD");
        return;
      }
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
    const pack = makeSingleStagePack(gridToQuadrants(game.editorGrid));
    const text = JSON.stringify(pack, null, 2);
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
    try {
      return loadStagePackObject(JSON.parse(text));
    } catch (error) {
      return { ok: false, error: error.message || String(error) };
    }
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
    game.stageSelectHoldTimer = 0;
    game.screen = "title";
    game.paused = false;
    clearTransientBattleState();
  }

  function clearTransientBattleState() {
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
    game.gameOverTimer = 0;
    game.freezeTimer = 0;
    game.shovelTimer = 0;
    game.stageClearElapsed = 0;
    game.stageClearBonusPlayerIds = [];
    game.stageClearBonusAwarded = false;
  }

  function restoreBuiltInStagePack() {
    applyStagePack(builtInStagePack);
  }

  function showEditorMessage(message) {
    game.editorMessage = message;
    game.editorMessageTimer = 120;
  }

  function nextStage(delta) {
    if (game.screen === "stageSelect") {
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
  }

  function beep(freq, duration, gain, type) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const vol = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = type || "square";
    vol.gain.setValueAtTime(gain || 0.025, now);
    vol.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(vol).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  function playSound(name, options) {
    const event = FREE_AUDIO_MANIFEST.events[name];
    if (!event) return;
    const opts = options || {};
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
    else if (action === "pause") game.paused = !game.paused;
    else if (action === "reset") {
      restoreBuiltInStagePack();
    }
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
    initAudio();

    if (game.screen === "playing" && !game.paused) pendingFirePresses.add(event.code);

    if (game.screen === "title") {
      if (event.code === "Enter" || event.code === "Space") activateTitleMenu();
      else if (event.code === "Digit1") {
        setTitleMenu(0);
        beginStageSelect(1);
      } else if (event.code === "Digit2") {
        setTitleMenu(1);
        beginStageSelect(2);
      }
      else if (event.code === "ArrowUp" || event.code === "KeyW") moveTitleMenu(-1);
      else if (event.code === "ArrowDown" || event.code === "KeyS") moveTitleMenu(1);
      else if (event.code === "KeyC" || event.code === "KeyE") {
        setTitleMenu(2);
        enterEditor();
      }
    } else if (game.screen === "stageSelect") {
      if (event.code === "Enter") startSelectedGame();
      else if (event.code === "Space" || event.code === "KeyZ") {
        game.stageSelectHoldTimer = 0;
        changeStageSelection(1);
      } else if (event.code === "KeyF" || event.code === "KeyX") {
        game.stageSelectHoldTimer = 0;
        changeStageSelection(-1);
      } else if (event.code === "Escape") {
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
      if (event.code === "Enter" || event.code === "Escape") game.screen = "title";
    } else if (game.screen === "stageClear") {
      if (event.code === "Enter" || event.code === "Space") game.transitionTimer = 1;
    } else if (event.code === "KeyP" || event.code === "Escape" || event.code === "Enter") {
      game.paused = !game.paused;
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

  function isEditorDirectionCode(code) {
    return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(code);
  }

  function editorDirectionForCode(code) {
    if (code === "ArrowRight" || code === "KeyD") return { dx: 1, dy: 0 };
    if (code === "ArrowLeft" || code === "KeyA") return { dx: -1, dy: 0 };
    if (code === "ArrowDown" || code === "KeyS") return { dx: 0, dy: 1 };
    if (code === "ArrowUp" || code === "KeyW") return { dx: 0, dy: -1 };
    return null;
  }

  function heldEditorDirection() {
    if (keys.has("ArrowRight") || keys.has("KeyD")) return { dx: 1, dy: 0 };
    if (keys.has("ArrowLeft") || keys.has("KeyA")) return { dx: -1, dy: 0 };
    if (keys.has("ArrowDown") || keys.has("KeyS")) return { dx: 0, dy: 1 };
    if (keys.has("ArrowUp") || keys.has("KeyW")) return { dx: 0, dy: -1 };
    return null;
  }

  function originalEditorButtonHeld() {
    return keys.has("Space") || keys.has("KeyZ") || keys.has("KeyF") || keys.has("KeyX");
  }

  function moveEditorFromCode(code) {
    const direction = editorDirectionForCode(code);
    if (!direction) return;
    game.editorMoveHoldTimer = 0;
    moveEditorCursor(direction.dx, direction.dy);
    if (originalEditorButtonHeld()) pasteOriginalEditorPattern();
  }

  function moveEditorCursor(dx, dy) {
    if (game.screen !== "editor") return;
    const c = game.editorCursor.qc < 0 ? 0 : Math.floor(game.editorCursor.qc / 2);
    const r = game.editorCursor.qr < 0 ? 0 : Math.floor(game.editorCursor.qr / 2);
    game.editorCursor = {
      qc: clamp(c + dx, 0, GRID - 1) * 2,
      qr: clamp(r + dy, 0, GRID - 1) * 2
    };
    game.editorPatternArmed = false;
  }

  function useOriginalEditorButton(delta) {
    if (!game.editorGrid) return;
    if (game.editorPatternArmed) {
      game.editorPattern = (game.editorPattern + delta + ORIGINAL_EDITOR_PATTERNS.length) % ORIGINAL_EDITOR_PATTERNS.length;
    } else {
      game.editorPatternArmed = true;
    }
    const pattern = ORIGINAL_EDITOR_PATTERNS[game.editorPattern];
    game.editorBrush = pattern.type;
    pasteOriginalEditorPattern();
  }

  function pasteOriginalEditorPattern() {
    if (!game.editorGrid) return;
    const cursor = game.editorCursor;
    if (cursor.qc < 0 || cursor.qr < 0) return;
    const c = clamp(Math.floor(cursor.qc / 2), 0, GRID - 1);
    const r = clamp(Math.floor(cursor.qr / 2), 0, GRID - 1);
    const pattern = ORIGINAL_EDITOR_PATTERNS[game.editorPattern] || ORIGINAL_EDITOR_PATTERNS[0];
    setTile(game.editorGrid, c, r, pattern.type, pattern.mask);
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
    setQuadrant(game.editorGrid, qc, qr, game.editorBrush);
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

  function editorBrushAt(x, y, legendX, legendY) {
    for (let i = 0; i < EDITOR_TILE_TYPES.length; i += 1) {
      const px = legendX + (i % 2) * 14;
      const py = legendY + Math.floor(i / 2) * 18;
      if (x >= px && x < px + 10 && y >= py && y < py + 10) return EDITOR_TILE_TYPES[i];
    }
    return null;
  }

  function cycleEditorCell(c, r) {
    if (!game.editorGrid || c < 0 || c >= GRID || r < 0 || r >= GRID) return;
    const current = game.editorGrid[r][c].type;
    const nextType = current === ICE ? EMPTY : current + 1;
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
    const nextType = current === ICE ? EMPTY : current + 1;
    setQuadrant(game.editorGrid, qc, qr, nextType);
    playSound("editorPaintSubtile", { brush: nextType });
  }

  function quadrantType(cell, q) {
    if ((cell.type === BRICK || cell.type === STEEL) && !(cell.mask & (1 << q))) return EMPTY;
    return cell.type;
  }

  function setQuadrant(grid, qc, qr, type) {
    const c = Math.floor(qc / 2);
    const r = Math.floor(qr / 2);
    const q = (qr % 2) * 2 + (qc % 2);
    const cell = grid[r][c];
    if (type === BRICK || type === STEEL) {
      if (cell.type !== type) {
        cell.type = type;
        cell.mask = 0;
        cell.steelHits = [0, 0, 0, 0];
      }
      cell.mask |= 1 << q;
    } else if (type === EMPTY && (cell.type === BRICK || cell.type === STEEL)) {
      cell.mask &= ~(1 << q);
      if (!cell.mask) cell.type = EMPTY;
      cell.steelHits = [0, 0, 0, 0];
    } else {
      cell.type = type;
      cell.mask = 0;
      cell.steelHits = [0, 0, 0, 0];
    }
  }

  function updateEditorControls() {
    game.editorTick += 1;
    const direction = heldEditorDirection();
    if (!direction) {
      game.editorMoveHoldTimer = 0;
      return;
    }
    game.editorPatternArmed = false;
    game.editorMoveHoldTimer += 1;
    if (game.editorMoveHoldTimer < 20) return;
    game.editorMoveHoldTimer = 15;
    moveEditorCursor(direction.dx, direction.dy);
    if (originalEditorButtonHeld()) pasteOriginalEditorPattern();
  }

  function updateStageSelectControls() {
    let delta = 0;
    if (keys.has("Space") || keys.has("KeyZ")) delta = 1;
    else if (keys.has("KeyF") || keys.has("KeyX")) delta = -1;
    if (!delta) {
      game.stageSelectHoldTimer = 0;
      return;
    }
    game.stageSelectHoldTimer += 1;
    if (game.stageSelectHoldTimer < 8) return;
    game.stageSelectHoldTimer = 0;
    changeStageSelection(delta);
  }

  function update() {
    if (game.editorMessageTimer > 0) game.editorMessageTimer -= 1;

    if (game.screen === "stageSelect") {
      updateStageSelectControls();
      return;
    }

    if (game.screen === "stageIntro") {
      game.transitionTimer -= 1;
      if (game.transitionTimer <= 0) game.screen = "playing";
      return;
    }

    if (game.screen === "stageClear") {
      game.stageClearElapsed += 1;
      const presentation = stageClearPresentation();
      if (!game.stageClearBonusAwarded && game.stageClearElapsed >= presentation.bonusRevealFrame) {
        awardPendingStageClearBonus();
      }
      game.transitionTimer -= 1;
      updateExplosions();
      updateScorePopups();
      if (game.transitionTimer <= 0) {
        awardPendingStageClearBonus();
        const advance = stageAdvanceResult(game.stage);
        if (!game.customGrid && advance.stops) {
          game.screen = "title";
          return;
        }
        if (!game.customGrid) game.stage = advance.stage;
        game.constructionStageActive = false;
        startStage(game.stage);
      }
      return;
    }

    if (game.screen === "gameOver") {
      updateExplosions();
      updateScorePopups();
      if (game.gameOverTimer > 0) {
        game.gameOverTimer -= 1;
        return;
      }
      game.screen = "title";
      return;
    }

    if (game.screen === "editor") {
      updateEditorControls();
      return;
    }

    if (game.screen !== "playing") return;
    if (game.paused) {
      updateScorePopups();
      return;
    }

    game.tick += 1;
    updateFreezeTimer();

    updatePlayers();
    updateEnemies();
    updateShovelTimer();
    updatePlayerInvulnerabilityTimers();
    updateExplosions();
    updateBullets();
    updateScorePopups();
    updatePowerUp();
    if (shouldSpawnEnemies()) spawnEnemies();
    checkEndState();
  }

  function isGlobalTimerTick(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 63) === 0;
  }

  function updateFreezeTimer() {
    if (game.freezeTimer > 0 && isGlobalTimerTick(game.tick)) game.freezeTimer -= 1;
  }

  function updateShovelTimer() {
    if (game.shovelTimer <= 0 || (game.tick & 15) !== 0) return;
    if (isGlobalTimerTick(game.tick)) {
      game.shovelTimer -= 1;
      if (game.shovelTimer <= 0) {
        buildBaseWall(game.grid, BRICK);
        return;
      }
    }
    if (game.shovelTimer < gameSettings().powerUpDurations.shovelFlash) {
      buildBaseWall(game.grid, shovelWallTypeForTimer(game.shovelTimer, game.tick));
    }
  }

  function shovelWallTypeForTimer(timer, tick) {
    if (timer <= 0) return BRICK;
    if (timer >= gameSettings().powerUpDurations.shovelFlash) return STEEL;
    return ((Math.max(0, Math.floor(Number(tick) || 0)) & 16) !== 0) ? STEEL : BRICK;
  }

  function updatePlayerInvulnerabilityTimers() {
    if (!isGlobalTimerTick(game.tick)) return;
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

  function updatePlayers() {
    const firePresses = new Set(pendingFirePresses);
    pendingFirePresses.clear();
    for (const player of game.players) {
      const control = getPlayerControl(player.id);
      const firePressed = hasControlKey(control.fire, firePresses);
      const movementFrame = isPlayerMovementFrame(game.tick);
      if (player.respawn > 0) {
        if (movementFrame) {
          player.respawn -= 1;
          if (player.respawn === 0) finishPlayerDeath(player);
        }
        continue;
      }
      if (!player.alive) continue;

      if (player.reload > 0) player.reload -= 1;
      if (player.spawnFlash > 0) {
        if (movementFrame) {
          player.spawnFlash -= 1;
          if (player.spawnFlash === 0) player.invuln = gameSettings().timings.playerInvulnerability;
        }
        continue;
      }
      if (movementFrame) {
        if (player.stun > 0) {
          player.stun -= 1;
          updatePlayerMovement(player, -1, true);
        } else {
          let desiredDir = -1;
          if (hasControlKey(control.up)) desiredDir = UP;
          else if (hasControlKey(control.right)) desiredDir = RIGHT;
          else if (hasControlKey(control.down)) desiredDir = DOWN;
          else if (hasControlKey(control.left)) desiredDir = LEFT;
          updatePlayerMovement(player, desiredDir);
        }
      }

      if (firePressed) shoot(player);
    }
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
    } else if (player.slide > 0 && onIce) {
      player.slide -= 1;
      moveTank(
        player,
        DIR_X[player.dir] * gameSettings().playerMovement.iceSlideSpeed,
        DIR_Y[player.dir] * gameSettings().playerMovement.iceSlideSpeed
      );
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
    if (isEnemyTimeFrozen()) return;

    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      if (enemy.spawnFlash > 0) {
        enemy.spawnFlash -= 1;
        continue;
      }
      if (enemy.reload > 0) enemy.reload -= 1;
      updateEnemyMovement(enemy);
      if (enemy.reload <= 0 && shouldEnemyFire(enemy)) shoot(enemy);
    }
  }

  function isEnemyTimeFrozen() {
    return game.freezeTimer > 0 && gameSettings().timerFreezesEnemyTime;
  }

  function shouldSpawnEnemies() {
    return true;
  }

  function updateEnemyMovement(enemy, random) {
    const nextRandom = random || Math.random;
    if (!isEnemyMovementFrame(enemy)) return;

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
    if (moved) return;

    if (aiRoll(ai.blockedRetryChance, nextRandom)) {
      enemy.blockedPauseTicks = ai.blockedRetryTicks;
      return;
    }

    if (isEnemyAtTurnIntersection(enemy)) enemy.pendingTurn = true;
    enemy.dir ^= 2;
  }

  function isEnemyMovementFrame(enemy) {
    if (!enemy.alternateMovement) return true;
    const slot = Number.isInteger(enemy.slotIndex) ? enemy.slotIndex : 2;
    return ((slot ^ game.tick) & 1) === 1;
  }

  function isEnemyAtTurnIntersection(enemy) {
    return Math.round(enemy.x + enemy.w / 2) % HALF === 0 && Math.round(enemy.y + enemy.h / 2) % HALF === 0;
  }

  function chooseEnemyDirectionByPhase(enemy, random) {
    const nextRandom = random || Math.random;
    const phase = enemyAiPhase(game.stage, game.tick);
    if (phase === "random") {
      enemy.dir = randomByte(nextRandom) & 3;
      return phase;
    }

    let target = { x: game.base.x + game.base.w / 2, y: game.base.y + game.base.h / 2 };
    if (phase === "player") {
      const player = enemyTargetPlayer(enemy);
      if (player) target = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    }
    const horizontalFirst = aiRoll(gameSettings().enemyAi.horizontalFirstChance, nextRandom);
    enemy.dir = directionTowardTarget(enemy, target, horizontalFirst);
    return phase;
  }

  function enemyAiPhase(stage, tick) {
    const interval = scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(stage), game.playerCount);
    const frameHigh = (Math.max(0, Math.floor(Number(tick) || 0)) >>> 8) & 0xff;
    if (frameHigh > Math.floor(interval / 4)) return "hq";
    if (frameHigh > Math.floor(interval / 8)) return "player";
    return "random";
  }

  function enemyTargetPlayer(enemy) {
    const targetable = enemyTargetablePlayers();
    if (!targetable.length) return null;
    const slot = Number.isInteger(enemy.slotIndex) ? enemy.slotIndex : 2;
    const preferredId = slot & 1 ? 2 : 1;
    return targetable.find((player) => player.id === preferredId) || targetable.find((player) => player.id === 1) || targetable[0];
  }

  function directionTowardTarget(enemy, target, horizontalFirst) {
    const dx = target.x - (enemy.x + enemy.w / 2);
    const dy = target.y - (enemy.y + enemy.h / 2);
    if (horizontalFirst) {
      if (dx < 0) return LEFT;
      if (dx > 0) return RIGHT;
      if (dy < 0) return UP;
      if (dy > 0) return DOWN;
      return UP;
    }
    if (dy < 0) return UP;
    if (dy > 0) return DOWN;
    if (dx < 0) return LEFT;
    if (dx > 0) return RIGHT;
    return UP;
  }

  function enemyTargetablePlayers() {
    return game.players.filter((player) => player.alive);
  }

  function shouldEnemyFire(enemy) {
    if (enemy.fireChance === ENEMY_FIRE_CHANCE) return (randomByte() & 0x1f) === 0;
    return Math.random() < enemy.fireChance;
  }

  function aiRoll(chance, random) {
    const byte = randomByte(random);
    if (chance === 1 / 16) return (byte & 0x0f) === 0;
    if (chance === 3 / 4) return (byte & 0x03) !== 0;
    if (chance === 1 / 2) return (byte & 0x01) !== 0;
    return byte / 256 < chance;
  }

  function randomByte(random) {
    const nextRandom = random || Math.random;
    return Math.floor(nextRandom() * 256) & 0xff;
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
        resolveBulletCollisions();
      }
    }

    resolveBulletCollisions();
    game.bullets = game.bullets.filter((bullet) => !bullet.remove);
  }

  function resolveBulletCollisions() {
    for (let i = 0; i < game.bullets.length; i += 1) {
      const a = game.bullets[i];
      if (a.remove) continue;
      for (let j = i + 1; j < game.bullets.length; j += 1) {
        const b = game.bullets[j];
        if (b.remove) continue;
        if (a.ownerKey !== b.ownerKey && rectsOverlap(bulletRect(a), bulletRect(b))) {
          a.remove = true;
          b.remove = true;
          addRuleExplosion("bulletCancel", (a.x + b.x) / 2, (a.y + b.y) / 2);
          playSound("bulletCancel");
          break;
        }
      }
    }
  }

  function resolveBullet(bullet) {
    const padding = gameSettings().projectileRules.boundsPadding;
    if (bullet.x < -padding || bullet.x > FIELD_W + padding || bullet.y < -padding || bullet.y > FIELD_H + padding) {
      bullet.remove = true;
      return;
    }

    if (hitTerrain(bullet)) return;
    if (hitBase(bullet)) return;
    hitTank(bullet);
  }

  function hitBase(bullet) {
    if (!game.base.alive) return false;
    if (!rectsOverlap(bulletRect(bullet), game.base)) return false;
    game.base.alive = false;
    bullet.remove = true;
    addRuleExplosion("baseDestroy", game.base.x + 8, game.base.y + 8);
    playSound("baseHit");
    enterGameOver();
    return true;
  }

  function hitTerrain(bullet) {
    const rect = bulletRect(bullet);
    const c0 = clamp(Math.floor(rect.x / TILE), 0, GRID - 1);
    const r0 = clamp(Math.floor(rect.y / TILE), 0, GRID - 1);
    const c1 = clamp(Math.floor((rect.x + rect.w - 1) / TILE), 0, GRID - 1);
    const r1 = clamp(Math.floor((rect.y + rect.h - 1) / TILE), 0, GRID - 1);

    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        const cell = game.grid[r][c];
        if ((cell.type !== BRICK && cell.type !== STEEL) || cell.mask === 0) continue;
        const hitMask = overlappedQuarters(rect, c, r, cell.mask);
        if (!hitMask) continue;
        const wasSteel = cell.type === STEEL;
        if (cell.type === BRICK || bullet.power >= 3) {
          const damaged = damageWall(cell, c, r, bullet);
          addRuleExplosion(damaged ? (wasSteel ? "steelHit" : "brickHit") : "steelBlocked", bullet.x, bullet.y);
        } else {
          addRuleExplosion("steelBlocked", bullet.x, bullet.y);
        }
        bullet.remove = true;
        playSound(wasSteel ? "steelHit" : "brickHit");
        return true;
      }
    }
    return false;
  }

  function overlappedQuarters(rect, c, r, mask) {
    let hit = 0;
    for (let q = 0; q < 4; q += 1) {
      if (!(mask & (1 << q))) continue;
      const qRect = quarterRect(c, r, q);
      if (rectsOverlap(rect, qRect)) hit |= 1 << q;
    }
    return hit;
  }

  function damageWall(cell, c, r, bullet) {
    if (cell.type === STEEL) return damageSteelWall(cell, bullet);
    const clearMask = brickDamageMask(cell, bullet.dir, bullet.power);
    cell.mask &= ~clearMask;
    if (cell.mask === 0) cell.type = EMPTY;
    return clearMask !== 0;
  }

  function brickDamageMask(cell, dir, power) {
    const order = brickImpactOrder(dir);
    const hits = power >= 2 ? 2 : 1;
    let clearMask = 0;
    for (const q of order) {
      if (!(cell.mask & (1 << q))) continue;
      clearMask |= 1 << q;
      if (bitCount(clearMask) >= hits) break;
    }
    return clearMask;
  }

  function brickImpactOrder(dir) {
    if (dir === UP) return [2, 3, 0, 1];
    if (dir === DOWN) return [0, 1, 2, 3];
    if (dir === LEFT) return [1, 3, 0, 2];
    return [0, 2, 1, 3];
  }

  function bitCount(value) {
    let count = 0;
    let bits = value;
    while (bits) {
      count += bits & 1;
      bits >>= 1;
    }
    return count;
  }

  function damageSteelWall(cell, bullet) {
    if (bullet.power < 3) return false;
    const side = bullet.dir;
    cell.steelHits = cell.steelHits || [0, 0, 0, 0];
    cell.steelHits[side] += 1;
    if (cell.steelHits[side] < 2) return false;

    cell.mask &= ~impactHalfMask(side);
    cell.steelHits[side] = 0;
    if (cell.mask === 0) cell.type = EMPTY;
    return true;
  }

  function impactHalfMask(dir) {
    if (dir === UP) return (1 << 2) | (1 << 3);
    if (dir === DOWN) return (1 << 0) | (1 << 1);
    if (dir === LEFT) return (1 << 1) | (1 << 3);
    return (1 << 0) | (1 << 2);
  }

  function quarterRect(c, r, q) {
    return {
      x: c * TILE + (q % 2) * HALF,
      y: r * TILE + (q >= 2 ? HALF : 0),
      w: HALF,
      h: HALF
    };
  }

  function hitTank(bullet) {
    if (bullet.ownerKind === "player") {
      for (const enemy of game.enemies) {
        if (!enemy.alive || enemy.spawnFlash > 0) continue;
        if (rectsOverlap(bulletRect(bullet), enemy)) {
          const wasCarrier = enemy.carrier;
          enemy.hp -= 1;
          bullet.remove = true;
          addRuleExplosion(enemy.hp <= 0 ? "enemyDestroy" : "enemyHit", enemy.x + 7, enemy.y + 7);
          playSound(enemy.hp <= 0 ? "enemyDestroy" : "enemyHit");
          if (shouldReleaseCarrierPowerUp(wasCarrier, enemy.hp <= 0)) releaseCarrierPowerUp(enemy);
          if (enemy.hp <= 0) destroyEnemy(enemy, bullet.ownerId);
          return true;
        }
      }

      for (const player of game.players) {
        if (!player.alive || player.id === bullet.ownerId || player.spawnFlash > 0) continue;
        if (rectsOverlap(bulletRect(bullet), player)) {
          if (gameSettings().friendlyFire.enabled && player.stun <= 0) player.stun = gameSettings().friendlyFire.stunFrames;
          bullet.remove = true;
          addRuleExplosion("playerStun", player.x + 7, player.y + 7);
          return true;
        }
      }
    } else {
      for (const player of game.players) {
        if (!player.alive || player.spawnFlash > 0) continue;
        if (rectsOverlap(bulletRect(bullet), player)) {
          if (player.invuln > 0) {
            bullet.remove = true;
            addRuleExplosion("bulletCancel", bullet.x, bullet.y);
            return true;
          }
          bullet.remove = true;
          killPlayer(player);
          return true;
        }
      }
    }
    return false;
  }

  function destroyEnemy(enemy, ownerId, options) {
    if (!enemy.alive) return;
    const opts = options || {};
    const awardScore = opts.awardScore !== false;
    const trackKill = opts.trackKill !== false;
    enemy.alive = false;
    game.enemyKilled += 1;
    const player = game.players.find((candidate) => candidate.id === ownerId);
    if (player) {
      if (awardScore) {
        addPlayerScore(player, enemy.score);
        player.stagePoints += enemy.score;
        addScorePopup(enemy.score, enemy.x + enemy.w / 2, enemy.y + 3);
      }
      if (trackKill) {
        player.stageKills[enemy.typeIndex] = (player.stageKills[enemy.typeIndex] || 0) + 1;
        player.totalKills[enemy.typeIndex] = (player.totalKills[enemy.typeIndex] || 0) + 1;
      }
    }
  }

  function addPlayerScore(player, points) {
    const previousScore = player.score;
    player.score += points;
    updateHighScore(player.score);
    awardBonusLives(player, previousScore, player.score);
  }

  function awardBonusLives(player, previousScore, nextScore) {
    const thresholds = gameSettings().bonusLifeScores;
    while (player.nextBonusLifeIndex < thresholds.length && previousScore >= thresholds[player.nextBonusLifeIndex]) {
      player.nextBonusLifeIndex += 1;
    }
    while (player.nextBonusLifeIndex < thresholds.length && nextScore >= thresholds[player.nextBonusLifeIndex]) {
      const threshold = thresholds[player.nextBonusLifeIndex];
      player.nextBonusLifeIndex += 1;
      if (previousScore < threshold) {
        player.lives += 1;
        playSound("bonusLife");
      }
    }
  }

  function killPlayer(player) {
    if (player.invuln > 0) return;
    player.alive = false;
    player.level = Math.min(player.level, gameSettings().deathPowerLevel);
    player.respawn = gameSettings().timings.playerRespawn;
    player.spawnFlash = 0;
    player.invuln = 0;
    player.stun = 0;
    player.reload = 0;
    player.slide = 0;
    addRuleExplosion("playerDestroy", player.x + 7, player.y + 7);
    playSound("playerDestroy");
    if (player.respawn === 0) finishPlayerDeath(player);
  }

  function finishPlayerDeath(player) {
    player.lives = Math.max(0, player.lives - 1);
    if (player.lives > 0) resetPlayerPosition(player);
  }

  function releaseCarrierPowerUp(enemy) {
    enemy.carrier = false;
    spawnPowerUp(enemy.powerUpType);
  }

  function shouldReleaseCarrierPowerUp(wasCarrier, destroyed) {
    if (!wasCarrier) return false;
    const rule = gameSettings().powerUpRules.carrierRelease;
    return rule === "hit" || (rule === "destroyed" && destroyed);
  }

  function clearPowerUpForCarrierSpawn(carrier) {
    if (!carrier || !gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn) return false;
    game.powerUp = null;
    return true;
  }

  function spawnPowerUp(forcedType) {
    const type = forcedType && powerTypes.includes(forcedType)
      ? forcedType
      : randomPowerUpType();
    const settings = stageSettings();
    const spot = pickPowerUpSpawnSpot(settings ? settings.powerUpSpawns : DEFAULT_POWERUP_SPAWNS);
    if (!spot) return;
    game.powerUp = { type, x: spot.x, y: spot.y, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: gameSettings().timings.powerUpTtl };
  }

  function randomPowerUpType(random) {
    return originalPowerUpRandomTable[randomByte(random) & 7];
  }

  function pickPowerUpSpawnSpot(spots) {
    const source = powerUpSpawnCandidates(spots);
    if (!source.length) return null;
    const pool = source.length > 1 && game.lastPowerUpSpawn
      ? source.filter((spot) => powerUpSpawnKey(spot) !== game.lastPowerUpSpawn)
      : source;
    const picked = randomPowerUpSpawnSpot(pool.length ? pool : source);
    game.lastPowerUpSpawn = powerUpSpawnKey(picked);
    return picked;
  }

  function resetPowerUpSpawnBag() {
    game.powerUpSpawnBag = [];
    game.powerUpSpawnBagKey = "";
  }

  function randomPowerUpSpawnSpot(spots) {
    return spots[Math.floor(Math.random() * spots.length)];
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

  function dedupePowerUpSpots(spots) {
    const seen = new Set();
    const result = [];
    for (const spot of spots) {
      const key = powerUpSpawnKey(spot);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(spot);
    }
    return result;
  }

  function powerUpSpawnKey(point) {
    return `${point.x},${point.y}`;
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
    if (game.powerUp.ttl > 0) {
      game.powerUp.ttl -= 1;
      if (game.powerUp.ttl <= 0) {
        game.powerUp = null;
        return;
      }
    }
    const player = powerUpCollector(game.powerUp);
    if (player) collectPowerUp(player, game.powerUp);
  }

  function powerUpCollector(power) {
    for (let index = game.players.length - 1; index >= 0; index -= 1) {
      if (canPlayerCollectPowerUp(game.players[index], power)) return game.players[index];
    }
    return null;
  }

  function canPlayerCollectPowerUp(player, power) {
    if (!player.alive || player.respawn > 0 || player.spawnFlash > 0) return false;
    const playerCenterX = player.x + player.w / 2;
    const playerCenterY = player.y + player.h / 2;
    const powerCenterX = power.x + power.w / 2;
    const powerCenterY = power.y + power.h / 2;
    return Math.abs(playerCenterX - powerCenterX) < 12 && Math.abs(playerCenterY - powerCenterY) < 12;
  }

  function collectPowerUp(player, power) {
    const powerType = power.type;
    game.powerUp = null;
    applyPowerUp(player, powerType, {
      popupX: power.x + power.w / 2,
      popupY: power.y + power.h / 2
    });
    game.powerUp = null;
    playSound("powerUp");
  }

  function applyPowerUp(player, type, options) {
    const opts = options || {};
    const pickupScore = gameSettings().powerUpRules.pickupScore;
    addPlayerScore(player, pickupScore);
    addScorePopup(
      pickupScore,
      Number.isFinite(opts.popupX) ? opts.popupX : player.x + player.w / 2,
      Number.isFinite(opts.popupY) ? opts.popupY : player.y + player.h / 2,
      { style: "powerUp", ttl: 49 }
    );
    if (type === "grenade") {
      for (const enemy of game.enemies) {
        if (enemy.alive) {
          enemy.hp = 0;
          destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false });
          addRuleExplosion("enemyDestroy", enemy.x + 7, enemy.y + 7);
        }
      }
    } else if (type === "helmet") {
      player.invuln = Math.max(player.invuln, gameSettings().powerUpDurations.helmet);
    } else if (type === "shovel") {
      buildBaseWall(game.grid, STEEL);
      game.shovelTimer = gameSettings().powerUpDurations.shovel;
    } else if (type === "star") {
      player.level = Math.min(3, player.level + 1);
    } else if (type === "timer") {
      game.freezeTimer = gameSettings().powerUpDurations.timer;
    } else if (type === "tank") {
      player.lives += 1;
    }
  }

  function spawnEnemies() {
    if (game.enemySpawned >= enemyTotal()) return;
    if (game.enemies.filter((enemy) => enemy.alive).length >= maxActiveEnemies()) return;
    if (game.nextSpawn > 0) {
      game.nextSpawn -= 1;
      return;
    }
    const enemySpec = getEnemySpec(game.stage, game.enemySpawned);
    const spawnIndex = enemySpec.spawnIndex === undefined ? (game.enemySpawned + 1) % 3 : enemySpec.spawnIndex;
    const point = enemySpawnPoint(spawnIndex);
    const typeIndex = enemySpec.typeIndex;
    const type = enemyTypeDefinitions()[typeIndex] || enemyTypeDefinitions()[0];
    const carrier = enemySpec.carrier;
    const slotIndex = nextEnemySlot();
    if (slotIndex === null) return;
    clearPowerUpForCarrierSpawn(carrier);
    game.enemies.push({
      kind: "enemy",
      id: 100 + game.enemySpawned,
      slotIndex,
      x: point.x,
      y: point.y,
      w: 14,
      h: 14,
      dir: DOWN,
      speed: type.speed,
      hp: type.hp,
      maxHp: type.hp,
      bulletSpeed: type.bullet,
      bulletPower: type.wallPower,
      reloadBase: type.reload,
      reload: gameSettings().timings.enemyInitialReload,
      score: type.score,
      color: type.color,
      hitColors: type.hitColors ? type.hitColors.slice() : null,
      accent: "#2b2a28",
      typeIndex,
      carrier,
      powerUpType: enemySpec.powerUpType || null,
      fireChance: type.fireChance,
      alternateMovement: typeIndex !== 1 && type.speed === ENEMY_MOVE_SPEED.normal,
      blockedPauseTicks: 0,
      pendingTurn: false,
      spawnFlash: gameSettings().timings.enemySpawnFlash,
      alive: true,
      slide: 0
    });
    game.enemySpawned += 1;
    game.nextSpawn = enemySpawnDelay(game.stage, game.enemySpawned);
  }

  function nextEnemySlot() {
    const highestSlot = maxActiveEnemies() + 1;
    const used = new Set(game.enemies.filter((enemy) => enemy.alive).map((enemy) => enemy.slotIndex));
    for (let slot = highestSlot; slot >= 2; slot -= 1) {
      if (!used.has(slot)) return slot;
    }
    return null;
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
    const minDelay = isExtendedLoopStage(stageValue)
      ? Math.min(pacing.minDelay, pacing.extendedLoopMinDelay)
      : pacing.minDelay;
    return Math.max(minDelay, pacing.baseDelay - Math.min(stageValue, stageCycleLimit()) * pacing.stageStep);
  }

  function scaleEnemySpawnDelayForPlayers(delay, players) {
    const pacing = gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING;
    const playerCount = Math.max(1, Math.floor(Number(players) || game.playerCount || 1));
    if (playerCount < 2) return delay;
    if (Number.isFinite(pacing.twoPlayerDelayReduction)) {
      return Math.max(0, delay - pacing.twoPlayerDelayReduction);
    }
    return Math.max(0, Math.round(delay * pacing.twoPlayerDelayMultiplier));
  }

  function pickEnemyType(stage, spawned) {
    const curve = (stage + Math.floor(spawned / 4)) % 10;
    if (stage > 15 && spawned % 5 === 4) return 3;
    if (curve >= 8) return 3;
    if (curve >= 6) return 2;
    if (curve >= 3) return 1;
    return 0;
  }

  function shoot(tank) {
    if (!tank.alive || tank.reload > 0 || tank.spawnFlash > 0) return;
    const key = `${tank.kind}:${tank.id}`;
    const upgrade = tank.kind === "player" ? playerUpgradeRule(tank.level) : null;
    const maxBullets = upgrade ? upgrade.maxBullets : 1;
    const active = game.bullets.filter((bullet) => bullet.ownerKey === key).length;
    if (active >= maxBullets) return;

    game.bullets.push(createBullet(tank, key, upgrade));
    tank.reload = upgrade ? upgrade.reload : tank.reloadBase;
    playSound(tank.kind === "player" ? "playerShoot" : "enemyShoot");
  }

  function createBullet(tank, key, upgrade) {
    const rules = gameSettings().projectileRules;
    const cx = tank.x + tank.w / 2;
    const cy = tank.y + tank.h / 2;
    return {
      x: cx - rules.bulletSize / 2 + DIR_X[tank.dir] * rules.spawnOffset,
      y: cy - rules.bulletSize / 2 + DIR_Y[tank.dir] * rules.spawnOffset,
      w: rules.bulletSize,
      h: rules.bulletSize,
      dir: tank.dir,
      speed: upgrade ? upgrade.bulletSpeed : tank.bulletSpeed,
      power: upgrade ? upgrade.wallPower : tank.bulletPower || 1,
      ownerKind: tank.kind,
      ownerId: tank.id,
      ownerKey: key,
      remove: false
    };
  }

  function playerUpgradeRule(level) {
    const rules = gameSettings().playerUpgradeRules || defaultPlayerUpgradeRules;
    return rules[clamp(Math.floor(level || 0), 0, rules.length - 1)];
  }

  function wallRules() {
    return {
      brickSameSideHits: 4,
      poweredBrickSameSideHits: 2,
      steelRequiredPower: 3,
      steelSameSideHits: 2,
      maxPowerBrickHalfDamage: true
    };
  }

  function bulletRect(bullet) {
    return { x: bullet.x, y: bullet.y, w: bullet.w, h: bullet.h };
  }

  function moveTank(tank, dx, dy) {
    const nx = tank.x + dx;
    const ny = tank.y + dy;
    if (!canTankOccupy(tank, nx, ny)) return false;
    tank.x = nx;
    tank.y = ny;
    return true;
  }

  function canTankOccupy(tank, x, y) {
    const rect = { x, y, w: tank.w, h: tank.h };
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > FIELD_W || rect.y + rect.h > FIELD_H) return false;
    if (rectsOverlap(rect, game.base) && game.base.alive) return false;
    if (rectHitsSolidTerrain(rect)) return false;
    const tanks = game.players.concat(game.enemies);
    for (const other of tanks) {
      if (other === tank || !other.alive || other.respawn > 0) continue;
      if (rectsOverlap(rect, other)) return false;
    }
    return true;
  }

  function rectHitsSolidTerrain(rect) {
    const c0 = clamp(Math.floor(rect.x / TILE), 0, GRID - 1);
    const r0 = clamp(Math.floor(rect.y / TILE), 0, GRID - 1);
    const c1 = clamp(Math.floor((rect.x + rect.w - 1) / TILE), 0, GRID - 1);
    const r1 = clamp(Math.floor((rect.y + rect.h - 1) / TILE), 0, GRID - 1);

    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        const cell = game.grid[r][c];
        if (cell.type === WATER) {
          const tileRect = { x: c * TILE, y: r * TILE, w: TILE, h: TILE };
          if (rectsOverlap(rect, tileRect)) return true;
        }
        if ((cell.type === BRICK || cell.type === STEEL) && cell.mask) {
          for (let q = 0; q < 4; q += 1) {
            if (cell.mask & (1 << q)) {
              if (rectsOverlap(rect, quarterRect(c, r, q))) return true;
            }
          }
        }
      }
    }
    return false;
  }

  function isTankOnIce(tank) {
    const cx = clamp(Math.floor((tank.x + tank.w / 2) / TILE), 0, GRID - 1);
    const cy = clamp(Math.floor((tank.y + tank.h / 2) / TILE), 0, GRID - 1);
    return game.grid[cy][cx].type === ICE;
  }

  function snapForDirection(tank) {
    tank.x = Math.floor((tank.x + 4) / HALF) * HALF;
    tank.y = Math.floor((tank.y + 4) / HALF) * HALF;
  }

  function isPerpendicularTurn(fromDir, toDir) {
    return fromDir !== toDir && (fromDir ^ 2) !== toDir;
  }

  function addRuleExplosion(ruleName, x, y) {
    const rule = explosionRule(ruleName);
    addExplosion(x, y, rule.ttl, rule.color, rule.coreColor);
  }

  function explosionRule(ruleName) {
    const rules = gameSettings().explosionRules || DEFAULT_EXPLOSION_RULES;
    return rules[ruleName] || DEFAULT_EXPLOSION_RULES[ruleName] || DEFAULT_EXPLOSION_RULES.enemyHit;
  }

  function addExplosion(x, y, ttl, color, coreColor) {
    game.explosions.push({ x, y, ttl, max: ttl, color, coreColor: coreColor || DEFAULT_EXPLOSION_CORE_COLOR });
  }

  function updateExplosions() {
    for (const explosion of game.explosions) explosion.ttl -= 1;
    game.explosions = game.explosions.filter((explosion) => explosion.ttl > 0);
  }

  function addScorePopup(points, x, y, options) {
    const value = Math.max(0, Math.floor(Number(points) || 0));
    if (!value) return;
    const opts = options || {};
    const px = Number.isFinite(Number(x)) ? Number(x) : FIELD_W / 2;
    const py = Number.isFinite(Number(y)) ? Number(y) : FIELD_H / 2;
    const ttl = Math.max(1, Math.floor(Number(opts.ttl) || 54));
    game.scorePopups.push({ value, x: px, y: py, ttl, max: ttl, style: opts.style || "float" });
  }

  function updateScorePopups() {
    for (const popup of game.scorePopups) popup.ttl -= 1;
    game.scorePopups = game.scorePopups.filter((popup) => popup.ttl > 0);
  }

  function stageEnemiesCleared() {
    return game.enemySpawned >= enemyTotal() && game.enemies.length === 0;
  }

  function checkEndState() {
    game.enemies = game.enemies.filter((enemy) => enemy.alive);
    if (!game.base.alive) {
      enterGameOver();
      return;
    }
    const playersDone = game.players.every((player) => !player.alive && player.respawn <= 0 && player.lives <= 0);
    if (playersDone) {
      enterGameOver();
      return;
    }
    if (stageEnemiesCleared()) {
      if (game.clearPendingTimer <= 0) {
        game.clearPendingTimer = gameSettings().timings.stageClearDelay;
      }
      if (game.clearPendingTimer > 0) {
        game.clearPendingTimer -= 1;
        if (game.clearPendingTimer > 0) return;
      }
      enterStageClear();
    }
  }

  function enterStageClear() {
    game.clearPendingTimer = 0;
    game.stageClearElapsed = 0;
    game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
    game.stageClearBonusAwarded = false;
    game.screen = "stageClear";
    game.transitionTimer = gameSettings().timings.stageClear;
    playSound("stageClearA");
    setTimeout(() => playSound("stageClearB"), 90);
  }

  function enterGameOver() {
    if (game.screen === "gameOver") return;
    game.screen = "gameOver";
    game.paused = false;
    game.gameOverTimer = gameSettings().timings.gameOverSlide;
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
    for (const player of game.players) {
      if (!game.stageClearBonusPlayerIds.includes(player.id)) continue;
      addPlayerScore(player, bonus.points);
      player.stagePoints += bonus.points;
    }
  }

  function stageClearPresentation(players, elapsed) {
    const result = stageClearResultSummary(players || game.players);
    const frame = Math.max(0, Math.floor(elapsed === undefined ? game.stageClearElapsed : elapsed));
    let cursor = 30;
    const rows = result.rows.map((row, index) => {
      const steps = Math.max(1, row.p1Kills, row.p2Kills);
      const countedSteps = frame < cursor ? 0 : clamp(Math.floor((frame - cursor) / 8) + 1, 0, steps);
      const visible = {
        ...row,
        p1VisibleKills: Math.min(row.p1Kills, countedSteps),
        p2VisibleKills: Math.min(row.p2Kills, countedSteps)
      };
      visible.p1VisiblePoints = visible.p1VisibleKills * row.score;
      visible.p2VisiblePoints = visible.p2VisibleKills * row.score;
      cursor += steps * 8;
      if (index < result.rows.length - 1) cursor += 20;
      return visible;
    });
    const totalsRevealFrame = cursor + 30;
    const bonusRevealFrame = totalsRevealFrame + 15;
    return {
      result,
      rows,
      frame,
      totalsRevealFrame,
      bonusRevealFrame,
      showTotals: frame >= totalsRevealFrame,
      showBonus: frame >= bonusRevealFrame || game.stageClearBonusAwarded
    };
  }

  function stageClearBonusRecipients(players) {
    const bonus = gameSettings().stageClearBonus;
    if (!bonus.points) return [];
    if (bonus.twoPlayerOnly && players.length < 2) return [];
    const alivePlayers = players.filter(Boolean);
    if (!alivePlayers.length) return [];
    const counts = alivePlayers.map((player) => ({
      player,
      count: player.stageKills.reduce((sum, value) => sum + value, 0)
    }));
    const maxCount = Math.max(...counts.map((entry) => entry.count));
    if (maxCount <= 0) return [];
    const leaders = counts.filter((entry) => entry.count === maxCount).map((entry) => entry.player);
    if (bonus.requireStrictLead && leaders.length !== 1) return [];
    return leaders;
  }

  function stageClearResultSummary(players) {
    const p1 = players[0] || emptyResultPlayer(1);
    const p2 = players[1] || emptyResultPlayer(2);
    const rows = stageClearResultRows(p1, p2);
    const p1EnemyPoints = rows.reduce((sum, row) => sum + row.p1Points, 0);
    const p2EnemyPoints = rows.reduce((sum, row) => sum + row.p2Points, 0);
    return {
      p1,
      p2,
      rows,
      p1EnemyPoints,
      p2EnemyPoints,
      p1BonusPoints: Math.max(0, (p1.stagePoints || 0) - p1EnemyPoints),
      p2BonusPoints: Math.max(0, (p2.stagePoints || 0) - p2EnemyPoints),
      p1StagePoints: p1.stagePoints || 0,
      p2StagePoints: p2.stagePoints || 0
    };
  }

  function stageClearResultRows(p1, p2) {
    return enemyTypeDefinitions().map((type, index) => {
      const p1Kills = stageKillCount(p1, index);
      const p2Kills = stageKillCount(p2, index);
      return {
        typeIndex: index,
        name: type.name,
        color: type.color,
        score: type.score,
        p1Kills,
        p1Points: p1Kills * type.score,
        p2Kills,
        p2Points: p2Kills * type.score
      };
    });
  }

  function stageKillCount(player, typeIndex) {
    if (!player || !Array.isArray(player.stageKills)) return 0;
    return Math.max(0, Math.floor(Number(player.stageKills[typeIndex]) || 0));
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

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    if (game.screen === "title") renderTitle();
    else if (game.screen === "stageSelect") renderStageSelect();
    else if (game.screen === "editor") renderEditor();
    else if (game.screen === "stageClear") renderStageClear();
    else {
      renderGame();
      if (game.screen === "stageIntro") renderStageIntro();
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

  function titleScoreLayout(menuIndex) {
    const selected = menuIndex === undefined ? game.titleMenu : menuIndex;
    const items = [
      { id: "p1Label", text: "I-", x: 16, y: 24 },
      { id: "p1Score", text: "00", x: 60, y: 24 },
      { id: "highLabel", text: "HI-", x: 88, y: 24 },
      { id: "highScore", text: formatScore5(game.highScore), x: 128, y: 24 }
    ];
    if (selected === 1) {
      items.push(
        { id: "p2Label", text: "II-", x: 168, y: 24 },
        { id: "p2Score", text: "00", x: 220, y: 24 }
      );
    }
    return items.map((item) => ({
      ...item,
      width: item.text.length * 6 - 1,
      right: item.x + item.text.length * 6 - 2
    }));
  }

  function drawStripedTitleText(text, x, y, scale) {
    const size = Math.max(2, Math.floor(scale || 2));
    let cursorX = Math.round(x);
    const top = Math.round(y);
    for (const ch of String(text).toUpperCase()) {
      const glyph = PIXEL_FONT[ch] || PIXEL_FONT["?"];
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] !== "1") continue;
          const px = cursorX + col * size;
          const py = top + row * size;
          ctx.fillStyle = "#a8322c";
          ctx.fillRect(px, py, size, size);
          ctx.fillStyle = "#f05a42";
          ctx.fillRect(px, py, size, Math.max(1, size - 1));
          ctx.fillStyle = "#f3f0d4";
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
        if (player.invuln > 0) drawShield(player);
        if (isPlayerTankVisible(player, game.tick)) drawTank(player, player.color, player.accent);
      }
    }

    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      if (enemy.spawnFlash > 0) drawSpawn(enemy);
      else drawTank(enemy, enemyColor(enemy), enemy.accent);
    }

    for (const bullet of game.bullets) drawBullet(bullet);
    renderProjectileTerrainCover(game.grid);
    renderTerrain(true, game.grid);
    if (game.powerUp) drawPowerUp(game.powerUp);
    renderExplosions();
    renderScorePopups();
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
        if (cell.type === BRICK) drawWallCell(x, y, cell.mask, "#a24f32", "#d38658");
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

  function drawWater(x, y) {
    drawManifestSprite("terrain", game.tick % 40 < 20 ? "waterA" : "waterB", x, y, {
      base: "#173b67",
      wave: game.tick % 40 < 20 ? "#56a6d5" : "#2d789e"
    });
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
    const primary = tankPrimaryColor(tank, color, game.tick);
    drawManifestSprite("tank", directionName(tank.dir), x, y, {
      primary,
      accent,
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

  function playerUpgradeOverlayParts(level, dir) {
    const value = clamp(Math.floor(Number(level) || 0), 0, 3);
    const parts = [];
    if (value >= 1) {
      if (dir === UP) {
        parts.push({ role: "level1", rect: [6, 0, 2, 3] }, { role: "level1", rect: [5, 2, 4, 1] });
      } else if (dir === DOWN) {
        parts.push({ role: "level1", rect: [6, 11, 2, 3] }, { role: "level1", rect: [5, 11, 4, 1] });
      } else if (dir === LEFT) {
        parts.push({ role: "level1", rect: [0, 6, 3, 2] }, { role: "level1", rect: [2, 5, 1, 4] });
      } else {
        parts.push({ role: "level1", rect: [11, 6, 3, 2] }, { role: "level1", rect: [11, 5, 1, 4] });
      }
    }
    if (value >= 2) {
      parts.push(
        { role: "level2", rect: [0, 1, 2, 2] },
        { role: "level2", rect: [12, 1, 2, 2] },
        { role: "level2", rect: [0, 11, 2, 2] },
        { role: "level2", rect: [12, 11, 2, 2] }
      );
    }
    if (value >= 3) {
      if (dir === UP) {
        parts.push({ role: "level3", rect: [5, 0, 4, 1] }, { role: "level3", rect: [6, 1, 2, 2] });
      } else if (dir === DOWN) {
        parts.push({ role: "level3", rect: [5, 13, 4, 1] }, { role: "level3", rect: [6, 11, 2, 2] });
      } else if (dir === LEFT) {
        parts.push({ role: "level3", rect: [0, 5, 1, 4] }, { role: "level3", rect: [1, 6, 2, 2] });
      } else {
        parts.push({ role: "level3", rect: [13, 5, 1, 4] }, { role: "level3", rect: [11, 6, 2, 2] });
      }
    }
    return parts;
  }

  function tankPrimaryColor(tank, color, tick) {
    let primary = tank.carrier && Math.floor(tick / 8) % 2 === 0 ? CARRIER_FLASH_COLOR : color;
    return primary;
  }

  function isPlayerTankVisible(player, tick) {
    return !(player.stun > 0 && (tick & 8) !== 0);
  }

  function directionName(dir) {
    if (dir === UP) return "up";
    if (dir === RIGHT) return "right";
    if (dir === DOWN) return "down";
    return "left";
  }

  function enemyColor(enemy) {
    if (enemy.hitColors && enemy.hitColors.length) {
      const index = clamp(Math.ceil(enemy.hp) - 1, 0, enemy.hitColors.length - 1);
      if (enemy.hitColors[index]) return enemy.hitColors[index];
    }
    return enemy.color;
  }

  function drawShield(tank) {
    const x = Math.round(FIELD_X + tank.x - 2);
    const y = Math.round(FIELD_Y + tank.y - 2);
    ctx.lineWidth = 1;
    drawManifestSprite("shield", "box", x, y, {
      primary: shieldColorForTick(game.tick)
    });
  }

  function shieldColorForTick(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 2) === 0 ? "#78d9ff" : "#ffffff";
  }

  function drawSpawn(enemy) {
    const x = Math.round(FIELD_X + enemy.x + 7);
    const y = Math.round(FIELD_Y + enemy.y + 7);
    const s = 14 - Math.floor(enemy.spawnFlash / 5) % 5;
    const scale = s / 14;
    const color = enemy.spawnFlash % 10 < 5 ? "#f3f0d4" : "#e0b84b";
    drawScaledManifestSprite("spawn", "box", x - s / 2, y - s / 2, scale, { primary: color });
  }

  function drawBullet(bullet) {
    const sprite = FREE_SPRITE_MANIFEST.sprites.bullet;
    const scale = bullet.w / (sprite && sprite.size ? sprite.size : bullet.w);
    drawScaledManifestSprite("bullet", "default", Math.round(FIELD_X + bullet.x), Math.round(FIELD_Y + bullet.y), scale, {
      primary: bullet.ownerKind === "player" ? "#f8e08b" : "#f7f1c6"
    });
  }

  function drawPowerUp(power) {
    if (!isPowerUpVisible(game.tick)) return;
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
      const age = 1 - explosion.ttl / explosion.max;
      const size = 3 + Math.floor(age * 13);
      const x = Math.round(FIELD_X + explosion.x - size / 2);
      const y = Math.round(FIELD_Y + explosion.y - size / 2);
      drawScaledManifestSprite("explosion", "burst", x, y, size / 16, {
        primary: explosion.color,
        core: explosion.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
      });
    }
  }

  function renderScorePopups() {
    for (const popup of game.scorePopups) {
      const presentation = scorePopupPresentation(popup);
      drawText(presentation.text, presentation.x, presentation.y, 1, presentation.color, presentation.advance);
    }
  }

  function scorePopupPresentation(popup) {
    const text = String(popup.value);
    const fixed = popup.style === "powerUp";
    const advance = fixed ? 5 : 6;
    const width = text.length * advance;
    const age = fixed ? 0 : 1 - popup.ttl / popup.max;
    return {
      text,
      width,
      advance,
      x: clamp(Math.round(FIELD_X + popup.x - width / 2), FIELD_X, FIELD_X + FIELD_W - width),
      y: clamp(Math.round(FIELD_Y + popup.y - (fixed ? 4 : 7 + age * 6)), FIELD_Y, FIELD_Y + FIELD_H - 7),
      color: fixed ? "#f7f1c6" : popup.ttl % 10 < 5 ? "#f7f1c6" : "#e0b84b"
    };
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
    return clamp(countTotal - spawnedCount, 0, countTotal);
  }

  function panelLifeCount(player) {
    const lives = player ? Math.max(0, Math.floor(Number(player.lives) || 0)) : 0;
    return Math.max(0, lives - 1);
  }

  function drawSmallScore(score, x, y, color) {
    drawText(formatScore5(score), x, y, 1, color);
  }

  function formatScore5(score) {
    return String(Math.min(99999, Math.max(0, Math.floor(score || 0)))).padStart(5, "0");
  }

  function renderStageIntro() {
    const curtain = stageIntroCurtainState();
    ctx.fillStyle = "#6b6f78";
    if (curtain.left.w > 0) ctx.fillRect(curtain.left.x, curtain.left.y, curtain.left.w, curtain.left.h);
    if (curtain.right.w > 0) ctx.fillRect(curtain.right.x, curtain.right.y, curtain.right.w, curtain.right.h);
    if (curtain.edgeLeft) {
      ctx.fillStyle = "#8a8e98";
      ctx.fillRect(curtain.edgeLeft.x, curtain.edgeLeft.y, curtain.edgeLeft.w, curtain.edgeLeft.h);
      ctx.fillRect(curtain.edgeRight.x, curtain.edgeRight.y, curtain.edgeRight.w, curtain.edgeRight.h);
    }
    const clips = [curtain.left, curtain.right].filter((rect) => rect.w > 0);
    drawTextClipped("STAGE", 96, 112, 1, "#15161a", clips);
    drawTextClipped(String(game.stage), 152, 112, 1, "#15161a", clips);
  }

  function stageIntroCurtainState(timer) {
    const duration = Math.max(1, gameSettings().timings.stageIntro);
    const remaining = clamp(Math.floor(Number(timer === undefined ? game.transitionTimer : timer) || 0), 0, duration);
    const progress = 1 - remaining / duration;
    const coverWidth = Math.ceil((FIELD_W / 2) * (1 - progress));
    const left = { x: FIELD_X, y: FIELD_Y, w: coverWidth, h: FIELD_H };
    const right = { x: FIELD_X + FIELD_W - coverWidth, y: FIELD_Y, w: coverWidth, h: FIELD_H };
    const edgeWidth = coverWidth > 0 ? Math.min(2, coverWidth) : 0;
    return {
      duration,
      remaining,
      progress,
      coverWidth,
      left,
      right,
      edgeLeft: edgeWidth ? { x: FIELD_X + coverWidth - edgeWidth, y: FIELD_Y, w: edgeWidth, h: FIELD_H } : null,
      edgeRight: edgeWidth ? { x: FIELD_X + FIELD_W - coverWidth, y: FIELD_Y, w: edgeWidth, h: FIELD_H } : null,
      label: `STAGE ${game.stage}`,
      labelX: 96,
      labelY: 112
    };
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
      drawTextRight(String(row.p1VisibleKills), 104, y, 1, "#f3f0d4");
      drawResultArrow(112, y + 2, -1);
      drawMiniTank(129, y - 3, row.color);
      if (game.playerCount > 1) {
        drawResultArrow(144, y + 2, 1);
        drawText(String(row.p2VisibleKills), 152, y, 1, "#f3f0d4");
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

  function emptyResultPlayer(id) {
    return {
      id,
      stagePoints: 0,
      stageKills: Array(enemyTypeDefinitions().length).fill(0)
    };
  }

  function drawMiniTank(x, y, color) {
    drawManifestSprite("miniTank", "up", x, y, {
      primary: color,
      shadow: "#111111"
    });
  }

  function renderGameOver() {
    const y = gameOverBannerY(game.gameOverTimer);
    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(FIELD_X + 34, y, 140, 44);
    drawText("GAME OVER", FIELD_X + 58, y + 18, 1, "#f05a42");
  }

  function gameOverBannerY(timer) {
    const targetY = 88;
    const startY = SCREEN_H;
    const duration = Math.max(0, gameSettings().timings.gameOverSlide);
    if (duration <= 0) return targetY;
    const remaining = clamp(Math.floor(Number(timer) || 0), 0, duration);
    const progress = 1 - remaining / duration;
    return Math.round(startY + (targetY - startY) * progress);
  }

  function renderPause() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
    ctx.fillRect(FIELD_X + 54, 96, 100, 30);
    drawText("PAUSE", FIELD_X + 84, 108, 1, "#f3f0d4");
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
      if (cell.type === BRICK) drawWallCell(px, py, cell.mask, "#a24f32", "#d38658");
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
      const glyph = PIXEL_FONT[ch] || PIXEL_FONT["?"];
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
      const glyph = PIXEL_FONT[ch] || PIXEL_FONT["?"];
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
    drawText(value, Math.round(right) - value.length * 6 * size, y, size, color);
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
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
        playerMovement: { ...gameSettings().playerMovement },
        projectileRules: { ...gameSettings().projectileRules },
        friendlyFire: { ...gameSettings().friendlyFire },
        explosionRules: cloneExplosionRules(gameSettings().explosionRules),
        stageAdvance: { ...gameSettings().stageAdvance },
        stageClearBonus: { ...gameSettings().stageClearBonus },
        enemyAi: { ...gameSettings().enemyAi },
        timerFreezesEnemyTime: gameSettings().timerFreezesEnemyTime,
        enemyTypes: cloneEnemyTypes(enemyTypeDefinitions()),
        playerUpgradeRules: clonePlayerUpgradeRules(gameSettings().playerUpgradeRules),
        wallRules: wallRules(),
        playerSpawns: currentPlayerSpawns(),
        enemySpawns: currentEnemySpawns(),
        powerUpSpawns: currentPowerUpSpawns(),
        enemySequence: enemySequenceForStage(game.stage),
        stage: game.stage
      };
    },
    debugTitleScoreLayoutProbe(menuIndex) {
      return titleScoreLayout(menuIndex).map((item) => ({ ...item }));
    },
    debugSnapshot() {
      return {
        screen: game.screen,
        paused: game.paused,
        titleMenu: game.titleMenu,
        titleMenuAction: (TITLE_MENU_ITEMS[game.titleMenu] || TITLE_MENU_ITEMS[0]).action,
        stage: game.stage,
        stageSelectPlayers: game.stageSelectPlayers,
        stageSelectLimit: stageSelectLimit(),
        stageCycleLimit: stageCycleLimit(),
        mapDataStage: mapDataStage(game.stage),
        enemyDataStage: enemyDataStage(game.stage),
        highScore: game.highScore,
        enemySpawned: game.enemySpawned,
        enemyKilled: game.enemyKilled,
        panelEnemyCounter: panelEnemyCounterRemaining(),
        nextSpawn: game.nextSpawn,
        clearPendingTimer: game.clearPendingTimer,
        stageClearElapsed: game.stageClearElapsed,
        stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
        stageClearBonusAwarded: game.stageClearBonusAwarded,
        gameOverTimer: game.gameOverTimer,
        freezeTimer: game.freezeTimer,
        shovelTimer: game.shovelTimer,
        maxActiveEnemies: maxActiveEnemies(),
        initialLives: gameSettings().initialLives,
        bonusLifeScores: gameSettings().bonusLifeScores.slice(),
        deathPowerLevel: gameSettings().deathPowerLevel,
        powerUpDurations: { ...gameSettings().powerUpDurations },
        powerUpRules: { ...gameSettings().powerUpRules },
        timings: { ...gameSettings().timings },
        enemySpawnPacing: { ...gameSettings().enemySpawnPacing },
        playerMovement: { ...gameSettings().playerMovement },
        projectileRules: { ...gameSettings().projectileRules },
        friendlyFire: { ...gameSettings().friendlyFire },
        explosionRules: cloneExplosionRules(gameSettings().explosionRules),
        stageAdvance: { ...gameSettings().stageAdvance },
        stageClearBonus: { ...gameSettings().stageClearBonus },
        enemyAi: { ...gameSettings().enemyAi },
        timerFreezesEnemyTime: gameSettings().timerFreezesEnemyTime,
        enemyTypes: cloneEnemyTypes(enemyTypeDefinitions()),
        playerUpgradeRules: clonePlayerUpgradeRules(gameSettings().playerUpgradeRules),
        wallRules: wallRules(),
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
      const cell = makeCell(STEEL, 15);
      const first = damageWall(cell, 0, 0, { power: 3, dir: UP, x: 4, y: 15 });
      const afterFirst = { type: cell.type, mask: cell.mask, steelHits: cell.steelHits.slice() };
      const second = damageWall(cell, 0, 0, { power: 3, dir: UP, x: 4, y: 15 });
      return {
        first,
        afterFirst,
        second,
        afterSecond: { type: cell.type, mask: cell.mask, steelHits: cell.steelHits.slice() }
      };
    },
    debugBrickWallPowerProbe() {
      const normalCell = makeCell(BRICK, 15);
      const powerCell = makeCell(BRICK, 15);
      const normalMasks = [];
      for (let i = 0; i < 4; i += 1) {
        damageWall(normalCell, 0, 0, { power: 1, dir: RIGHT, x: 0, y: 8 });
        normalMasks.push(normalCell.mask);
      }
      damageWall(powerCell, 0, 0, { power: 2, dir: RIGHT, x: 0, y: 8 });

      const directionMasks = {};
      const directions = [
        ["up", UP],
        ["down", DOWN],
        ["left", LEFT],
        ["right", RIGHT]
      ];
      for (const [name, dir] of directions) {
        const cell = makeCell(BRICK, 15);
        damageWall(cell, 0, 0, { power: 1, dir, x: 8, y: 8 });
        const first = cell.mask;
        damageWall(cell, 0, 0, { power: 1, dir, x: 8, y: 8 });
        directionMasks[name] = { first, second: cell.mask, removedAfterTwo: 15 ^ cell.mask };
      }

      return {
        normalMasks,
        normalTypeAfterFour: tileTypeName(normalCell.type),
        powerMask: powerCell.mask,
        powerRemoved: 15 ^ powerCell.mask,
        directionMasks,
        rules: wallRules()
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
      return {
        durationUnits: durations.shovel,
        flashThreshold: durations.shovelFlash,
        protected: tileTypeName(shovelWallTypeForTimer(durations.shovelFlash, 0)),
        flashA: tileTypeName(shovelWallTypeForTimer(flashingTimer, 0)),
        flashB: tileTypeName(shovelWallTypeForTimer(flashingTimer, 16)),
        expired: tileTypeName(shovelWallTypeForTimer(0, 0)),
        cells
      };
    },
    debugCarrierReleaseProbe(hpBeforeHit) {
      const hp = Math.max(1, Math.floor(Number(hpBeforeHit) || 1));
      return {
        rule: gameSettings().powerUpRules.carrierRelease,
        clearUncollectedOnCarrierSpawn: gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn,
        pickupScore: gameSettings().powerUpRules.pickupScore,
        releaseOnThisHit: shouldReleaseCarrierPowerUp(true, hp - 1 <= 0)
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
        phaseFrames: 8
      };
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
          targetableIds: enemyTargetablePlayers().map((player) => player.id),
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
            { frameHigh: randomEnd, phase: enemyAiPhase(stageValue, randomEnd * 256) },
            { frameHigh: randomEnd + 1, phase: enemyAiPhase(stageValue, (randomEnd + 1) * 256) },
            { frameHigh: playerEnd + 1, phase: enemyAiPhase(stageValue, (playerEnd + 1) * 256) }
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
        const oddSlotTarget = enemyTargetPlayer(enemy);
        enemy.slotIndex = 6;
        const evenSlotTarget = enemyTargetPlayer(enemy);
        game.players[1].alive = false;
        enemy.slotIndex = 7;
        const fallbackTarget = enemyTargetPlayer(enemy);
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
      const previousTick = game.tick;
      const normal = { slotIndex: 5, alternateMovement: true };
      const fast = { slotIndex: 5, alternateMovement: false };
      try {
        const frames = [];
        for (let tick = 0; tick < 4; tick += 1) {
          game.tick = tick;
          frames.push({ tick, normal: isEnemyMovementFrame(normal), fast: isEnemyMovementFrame(fast) });
        }
        return frames;
      } finally {
        game.tick = previousTick;
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
          spawnIndices: game.enemies.map((enemy) => getEnemySpec(1, enemy.id - 100).spawnIndex)
        };
      } finally {
        Object.assign(game, previous);
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
        return {
          expectedSpawnFlash: gameSettings().timings.enemySpawnFlash,
          afterSpawn,
          afterFrozenFrame: {
            enemyCount: game.enemies.length,
            enemySpawned: game.enemySpawned,
            spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
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
        game.players = [{ kind: "player", id: 1, x: point.x, y: point.y, w: 14, h: 14, alive: true, respawn: 0 }];
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.powerUp = null;
        game.enemySpawned = 0;
        game.nextSpawn = 0;
        spawnEnemies();
        return {
          playerOverlap: game.enemies.length === 1 && rectsOverlap(game.players[0], game.enemies[0]),
          enemySpawned: game.enemySpawned,
          spawnIndex: spec.spawnIndex,
          enemyPosition: game.enemies[0] ? { x: game.enemies[0].x, y: game.enemies[0].y } : null
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
    debugPowerUpFlashCadenceProbe() {
      return Array.from({ length: 32 }, (_, tick) => ({ tick, visible: isPowerUpVisible(tick) }));
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
        const simultaneous = powerUpCollector(power);
        player2.spawnFlash = 1;
        const player2Spawning = powerUpCollector(power);
        game.players = [player1];
        const onePlayer = powerUpCollector(power);
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
        tick: game.tick
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
          visibleFrames,
          powerCenter: { x: power.x + power.w / 2, y: power.y + power.h / 2 },
          drawRect: { x: FIELD_X + power.x, y: FIELD_Y + power.y, w: power.w, h: power.h }
        };
      } finally {
        Object.assign(game, previous);
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
        tick: game.tick
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
      const previousRandom = Math.random;
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
        Math.random = () => 0;

        const candidateTiles = powerUpSpawnCandidates(spots).map(powerUpPixelToTilePoint);
        const pickCount = Math.max(1, Math.floor(Number(count) || spots.length * 2));
        const picks = [];
        for (let i = 0; i < pickCount; i += 1) {
          const picked = pickPowerUpSpawnSpot(spots);
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
        Math.random = previousRandom;
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

      try {
        applyPowerUp(player, "grenade");
        return {
          scoreGain: player.score - 1000,
          pickupScore: gameSettings().powerUpRules.pickupScore,
          stagePoints: player.stagePoints,
          stageKills: player.stageKills.slice(),
          totalKills: player.totalKills.slice(),
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
      }
    },
    debugScorePopupProbe() {
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
        game.players = [player];
        game.enemies = [enemy];
        game.enemyKilled = 0;
        game.explosions = [];
        game.scorePopups = [];
        destroyEnemy(enemy, player.id);
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
      }
    },
    debugPausedScorePopupProbe() {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        tick: game.tick,
        scorePopups: game.scorePopups
      };
      try {
        game.screen = "playing";
        game.paused = true;
        game.tick = 27;
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
            lives: player.lives,
            level: player.level,
            respawn: player.respawn || 0
          },
          powerTankBulletSpeed: enemyTypeDefinitions()[2].bullet,
          pickupScore: gameSettings().powerUpRules.pickupScore
        };
      } finally {
        game.explosions = previousExplosions;
        game.scorePopups = previousScorePopups;
        game.highScore = previousHighScore;
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
        game.players = previousPlayers;
        game.explosions = previousExplosions;
      }
    },
    debugPlayerDeathRespawnProbe() {
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
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        game.enemies = [];
        game.bullets = [];
        game.explosions = [];
        game.powerUp = null;
        game.playerCount = 1;
        game.tick = 0;
        keys.clear();

        const player = makePlayer(2);
        game.players = [player];
        killPlayer(player);
        const afterHit = {
          alive: player.alive,
          lives: player.lives,
          level: player.level,
          respawn: player.respawn,
          spawnFlash: player.spawnFlash,
          invuln: player.invuln
        };

        let deathDisplayFrames = 0;
        while (!player.alive && player.respawn > 0 && deathDisplayFrames < 1000) {
          game.tick += 1;
          deathDisplayFrames += 1;
          updatePlayers();
        }
        const deathResolved = {
          tick: game.tick,
          alive: player.alive,
          lives: player.lives,
          respawn: player.respawn,
          spawnFlash: player.spawnFlash,
          invuln: player.invuln
        };

        let spawnDisplayFrames = 0;
        while (player.spawnFlash > 0 && spawnDisplayFrames < 1000) {
          game.tick += 1;
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
        killPlayer(lastLifePlayer);
        let lastLifeDisplayFrames = 0;
        while (lastLifePlayer.respawn > 0 && lastLifeDisplayFrames < 1000) {
          game.tick += 1;
          lastLifeDisplayFrames += 1;
          updatePlayers();
        }

        return {
          deathTicks: gameSettings().timings.playerRespawn,
          spawnTicks: gameSettings().timings.playerSpawnFlash,
          afterHit,
          deathDisplayFrames,
          deathResolved,
          spawnDisplayFrames,
          totalDisplayFrames: deathDisplayFrames + spawnDisplayFrames,
          activated,
          lastLife: {
            displayFrames: lastLifeDisplayFrames,
            alive: lastLifePlayer.alive,
            lives: lastLifePlayer.lives,
            respawn: lastLifePlayer.respawn
          }
        };
      } finally {
        keys.clear();
        for (const key of previousKeys) keys.add(key);
        Object.assign(game, previous);
      }
    },
    debugLifeAwardProbe() {
      const previousHighScore = game.highScore;
      const previousScorePopups = game.scorePopups;
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
        game.scorePopups = [];
        addPlayerScore(player, 0);
        const beforeCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
        addPlayerScore(player, 1);
        const afterCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
        addPlayerScore(player, 1);
        const afterRepeat = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
        applyPowerUp(tankPlayer, "tank");
        return {
          threshold,
          pickupScore: gameSettings().powerUpRules.pickupScore,
          beforeCrossing,
          afterCrossing,
          afterRepeat,
          tank: {
            score: tankPlayer.score,
            lives: tankPlayer.lives
          }
        };
      } finally {
        game.highScore = previousHighScore;
        game.scorePopups = previousScorePopups;
      }
    },
    debugHelmetProtectionProbe() {
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
        game.players = previousPlayers;
        game.explosions = previousExplosions;
        game.scorePopups = previousScorePopups;
        game.highScore = previousHighScore;
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
        const friendlyAfterSpawn = {
          stun: player.stun,
          bulletRemoved: activeFriendlyBullet.remove
        };
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
          friendlyAfterSpawn,
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
        return {
          base: attempt(0, 2),
          upgraded: attempt(2, 3),
          enemy: attemptEnemy(2)
        };
      } finally {
        game.bullets = previousBullets;
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
        keys.clear();
        for (const key of previousKeys) keys.add(key);
        pendingFirePresses.clear();
        for (const key of previousFirePresses) pendingFirePresses.add(key);
        Object.assign(game, previous);
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
        return {
          remainingBullets: game.bullets.length,
          speed,
          explosionCount: game.explosions.length,
          explosion: game.explosions[0] ? {
            ttl: game.explosions[0].ttl,
            color: game.explosions[0].color,
            coreColor: game.explosions[0].coreColor
          } : null
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
    debugFriendlyFireProbe() {
      return {
        enabled: gameSettings().friendlyFire.enabled,
        stunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
      };
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
      shoot(player);
      const fired = game.bullets.length === 1;
      game.bullets = previousBullets;
      return {
        before,
        after: { x: player.x, y: player.y, dir: player.dir, slide: player.slide, pendingSnap: player.pendingSnap },
        turned: player.dir === RIGHT,
        moved: player.x !== before.x || player.y !== before.y,
        fired
      };
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
        Object.assign(game, previous);
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
      const previous = {
        screen: game.screen,
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        explosions: game.explosions,
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
        game.screen = "playing";
        game.players = [];
        game.enemies = [];
        game.explosions = [];

        game.grid = makeGrid();
        setTile(game.grid, 6, 11, BRICK);
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        const shieldedBullet = makeBaseBullet();
        resolveBullet(shieldedBullet);
        const shielded = {
          baseAlive: game.base.alive,
          bulletRemoved: shieldedBullet.remove,
          topWallMask: game.grid[11][6].mask,
          screen: game.screen
        };

        game.screen = "playing";
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        const exposedBullet = makeBaseBullet();
        resolveBullet(exposedBullet);
        const exposed = {
          baseAlive: game.base.alive,
          bulletRemoved: exposedBullet.remove,
          screen: game.screen
        };

        return { shielded, exposed };
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
    debugExplosionRuleProbe(ruleName) {
      const key = String(ruleName || "enemyDestroy");
      return { key, ...explosionRule(key) };
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
      return builtInStagePack.enemies.map((sequence, stageIndex) => {
        const groups = [];
        const counts = Array(defaultEnemyTypes.length).fill(0);
        for (const enemy of sequence) {
          counts[enemy.typeIndex] += 1;
          const last = groups[groups.length - 1];
          if (last && last.typeIndex === enemy.typeIndex) {
            last.count += 1;
          } else {
            groups.push({
              count: 1,
              typeIndex: enemy.typeIndex,
              type: names[enemy.typeIndex]
            });
          }
        }
        return {
          stage: stageIndex + 1,
          total: sequence.length,
          groups,
          counts,
          carriers: sequence.map((enemy, index) => enemy.carrier ? index + 1 : null).filter(Boolean)
        };
      });
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
        return {
          screen: game.screen,
          stage: game.stage,
          transitionTimer: game.transitionTimer,
          clearPendingTimer: game.clearPendingTimer,
          enemySpawned: game.enemySpawned,
          nextSpawn: game.nextSpawn,
          constructionStageActive: game.constructionStageActive
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
      const maxFrames = timings.stageClearDelay + timings.stageClear + timings.stageIntro + 5;
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
      const duration = gameSettings().timings.gameOverSlide;
      const timers = [duration, Math.floor(duration / 2), 0];
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
        const frames = timers.map((timer) => {
          game.gameOverTimer = timer;
          renderGameOver();
          return { timer, y: gameOverBannerY(timer) };
        });
        return { duration, entry, frames };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugGameOverReturnProbe() {
      const previous = {
        screen: game.screen,
        paused: game.paused,
        gameOverTimer: game.gameOverTimer,
        explosions: game.explosions
      };
      try {
        game.screen = "gameOver";
        game.paused = false;
        game.gameOverTimer = 1;
        game.explosions = [];
        update();
        const finalFrame = {
          screen: game.screen,
          timer: game.gameOverTimer
        };
        update();
        const afterFinalFrame = {
          screen: game.screen,
          timer: game.gameOverTimer
        };
        return { finalFrame, afterFinalFrame };
      } finally {
        Object.assign(game, previous);
      }
    },
    debugStageClearBonusProbe(p1Kills, p2Kills) {
      const players = [
        { id: 1, stageKills: [Math.max(0, Math.floor(Number(p1Kills) || 0))] },
        { id: 2, stageKills: [Math.max(0, Math.floor(Number(p2Kills) || 0))] }
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
          p1VisibleKills: row.p1VisibleKills,
          p2VisibleKills: row.p2VisibleKills,
          p1VisiblePoints: row.p1VisiblePoints,
          p2VisiblePoints: row.p2VisiblePoints
        })),
        totalsRevealFrame: presentation.totalsRevealFrame,
        bonusRevealFrame: presentation.bonusRevealFrame,
        showTotals: presentation.showTotals,
        showBonus: presentation.showBonus
      };
    },
    stagePackSchema() {
      return {
        totalStages: 35,
        enemyTotal: 20,
        enemyTypes: cloneEnemyTypes(defaultEnemyTypes),
        gameSettings: {
          initialLives: DEFAULT_INITIAL_LIVES,
          bonusLifeScores: DEFAULT_BONUS_LIFE_SCORES.slice(),
          deathPowerLevel: DEFAULT_DEATH_POWER_LEVEL,
          powerUpDurations: { ...DEFAULT_POWERUP_DURATIONS },
          powerUpRules: { ...DEFAULT_POWERUP_RULES },
          timings: { ...DEFAULT_TIMINGS },
          enemySpawnPacing: { ...DEFAULT_ENEMY_SPAWN_PACING },
          playerMovement: { ...DEFAULT_PLAYER_MOVEMENT },
          projectileRules: { ...DEFAULT_PROJECTILE_RULES },
          friendlyFire: { ...DEFAULT_FRIENDLY_FIRE },
          explosionRules: cloneExplosionRules(DEFAULT_EXPLOSION_RULES),
          stageAdvance: { ...DEFAULT_STAGE_ADVANCE },
          stageClearBonus: { ...DEFAULT_STAGE_CLEAR_BONUS },
          enemyAi: { ...DEFAULT_ENEMY_AI },
          playerUpgradeRules: clonePlayerUpgradeRules(defaultPlayerUpgradeRules),
          timerFreezesEnemyTime: DEFAULT_TIMER_FREEZES_ENEMY_TIME
        },
        playerUpgradeRules: clonePlayerUpgradeRules(defaultPlayerUpgradeRules),
        wallRules: wallRules(),
        stageSettings: [
          {
            maxActiveEnemies: DEFAULT_MAX_ACTIVE_ENEMIES,
            maxActiveEnemiesTwoPlayer: DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
            playerSpawns: [{ x: 4, y: 12 }, { x: 8, y: 12 }],
            enemySpawns: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }],
            powerUpSpawns: DEFAULT_POWERUP_SPAWNS.map(powerUpPixelToTilePoint)
          }
        ],
        maps: [
          [
            ".............",
            ".............",
            ".............",
            ".............",
            ".............",
            ".............",
            ".............",
            ".............",
            ".............",
            ".............",
            ".............",
            ".....BBB.....",
            ".....B.B....."
          ]
        ],
        quadrants: [
          Array.from({ length: 26 }, () => "..........................")
        ],
        mapFormat: "Use either maps for 13x13 full tiles or quadrants for 26x26 8px subtiles, not both.",
        enemies: [
          builtInStagePack.enemies[0].map((enemy, index) => ({
            ...enemy,
            powerUpType: null,
            spawnDelay: index === 0 ? DEFAULT_ENEMY_SPAWN_PACING.firstDelay : 96
          }))
        ],
        tileCodes: {
          ".": "empty",
          B: "brick",
          "#": "brick",
          S: "steel",
          W: "water",
          "~": "water",
          F: "forest",
          I: "ice"
        }
      };
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
