(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    builtInStagePack: isCommonJs ? require("./built-in-stage-pack") : modules.builtInStagePack,
    playerUpgrades: isCommonJs ? require("../config/player-upgrades") : modules.playerUpgrades,
    stageGrid: isCommonJs ? require("./stage-grid") : modules.stageGrid,
    stageSettings: isCommonJs ? require("../config/stage-settings") : modules.stageSettings,
    wallDamageRules: isCommonJs ? require("../rules/wall-damage-rules") : modules.wallDamageRules
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before stage-pack-schema.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.stagePackSchema = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { createBuiltInStagePack } = dependencies.builtInStagePack;
  const { clonePlayerUpgradeRules } = dependencies.playerUpgrades;
  const { GRID, QUAD_GRID } = dependencies.stageGrid;
  const {
    DEFAULT_ENEMY_SPAWNS,
    DEFAULT_MAX_ACTIVE_ENEMIES,
    DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
    DEFAULT_PLAYER_SPAWNS,
    DEFAULT_POWERUP_SPAWNS,
    pixelToTilePoint,
    powerUpPixelToTilePoint
  } = dependencies.stageSettings;
  const { cloneWallRules } = dependencies.wallDamageRules;

  const SAMPLE_ENEMY_SPAWN_DELAY = 96;
  const STAGE_PACK_MAP_FORMAT = "Use either maps for 13x13 full tiles or quadrants for 26x26 8px subtiles, not both.";
  const SAMPLE_STAGE_ROWS = Object.freeze([
    ...Array.from({ length: GRID - 2 }, () => ".".repeat(GRID)),
    ".....BBB.....",
    ".....B.B....."
  ]);
  const STAGE_PACK_TILE_CODES = Object.freeze({
    ".": "empty",
    B: "brick",
    "#": "brick",
    S: "steel",
    W: "water",
    "~": "water",
    F: "forest",
    I: "ice"
  });

  /** Returns a fresh, directly editable example document for the public browser API. */
  function createStagePackSchema() {
    const pack = createBuiltInStagePack();
    return {
      totalStages: pack.totalStages,
      enemyTotal: pack.enemyTotal,
      enemyTypes: pack.enemyTypes,
      gameSettings: pack.gameSettings,
      playerUpgradeRules: clonePlayerUpgradeRules(pack.gameSettings.playerUpgradeRules),
      wallRules: cloneWallRules(),
      stageSettings: [
        {
          maxActiveEnemies: DEFAULT_MAX_ACTIVE_ENEMIES,
          maxActiveEnemiesTwoPlayer: DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
          playerSpawns: DEFAULT_PLAYER_SPAWNS.map(pixelToTilePoint),
          enemySpawns: DEFAULT_ENEMY_SPAWNS.map(pixelToTilePoint),
          powerUpSpawns: DEFAULT_POWERUP_SPAWNS.map(powerUpPixelToTilePoint)
        }
      ],
      maps: [SAMPLE_STAGE_ROWS.slice()],
      quadrants: [Array.from({ length: QUAD_GRID }, () => ".".repeat(QUAD_GRID))],
      mapFormat: STAGE_PACK_MAP_FORMAT,
      enemies: [
        pack.enemies[0].map((enemy, index) => ({
          ...enemy,
          powerUpType: null,
          spawnDelay: index === 0 ? pack.gameSettings.enemySpawnPacing.firstDelay : SAMPLE_ENEMY_SPAWN_DELAY
        }))
      ],
      tileCodes: { ...STAGE_PACK_TILE_CODES }
    };
  }

  return Object.freeze({
    SAMPLE_ENEMY_SPAWN_DELAY,
    SAMPLE_STAGE_ROWS,
    STAGE_PACK_MAP_FORMAT,
    STAGE_PACK_TILE_CODES,
    createStagePackSchema
  });
});
