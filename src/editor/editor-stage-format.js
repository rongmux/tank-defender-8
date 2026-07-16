(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    stageGrid: isCommonJs ? require("../stages/stage-grid") : modules.stageGrid,
    stagePack: isCommonJs ? require("../stages/stage-pack") : modules.stagePack,
    enemyTypes: isCommonJs ? require("../config/enemy-types") : modules.enemyTypes,
    stageSettings: isCommonJs ? require("../config/stage-settings") : modules.stageSettings,
    enemySequences: isCommonJs ? require("../stages/enemy-sequences") : modules.enemySequences
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before editor-stage-format.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.editorStageFormat = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const {
    GRID,
    QUAD_GRID,
    gridToQuadrants,
    parseStageQuadrants,
    parseStageRows
  } = dependencies.stageGrid;
  const { normalizeGameSettings } = dependencies.stagePack;
  const {
    DEFAULT_ENEMY_TYPES,
    cloneEnemyTypes
  } = dependencies.enemyTypes;
  const {
    DEFAULT_ENEMY_SPAWNS,
    DEFAULT_MAX_ACTIVE_ENEMIES,
    DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
    DEFAULT_PLAYER_SPAWNS,
    DEFAULT_POWERUP_SPAWNS,
    pixelToTilePoint,
    powerUpPixelToTilePoint
  } = dependencies.stageSettings;
  const {
    DEFAULT_ENEMY_TOTAL,
    buildOriginalStyleEnemySequences
  } = dependencies.enemySequences;

  const EDITOR_STAGE_FORMAT_VERSION = 2;
  const ORIGINAL_STAGE_ONE_ENEMIES = buildOriginalStyleEnemySequences()[0];

  function createEditorStageDocument(grid) {
    return {
      version: EDITOR_STAGE_FORMAT_VERSION,
      quadrants: gridToQuadrants(grid)
    };
  }

  function serializeEditorStage(grid) {
    return JSON.stringify(createEditorStageDocument(grid));
  }

  function parseJsonText(text) {
    try {
      return { ok: true, value: JSON.parse(text), error: "" };
    } catch (error) {
      return {
        ok: false,
        value: null,
        error: error.message || String(error)
      };
    }
  }

  function parseEditorStageDocument(document) {
    if (
      document &&
      Array.isArray(document.quadrants) &&
      document.quadrants.length === QUAD_GRID
    ) {
      return {
        ok: true,
        kind: "",
        encoding: "quadrants",
        grid: parseStageQuadrants(document.quadrants),
        error: ""
      };
    }
    if (
      document &&
      Array.isArray(document.rows) &&
      document.rows.length === GRID
    ) {
      return {
        ok: true,
        kind: "",
        encoding: "rows",
        grid: parseStageRows(document.rows),
        error: ""
      };
    }
    return {
      ok: false,
      kind: "stage",
      encoding: null,
      grid: null,
      error: `editor stage must contain ${QUAD_GRID} quadrant rows or ${GRID} tile rows`
    };
  }

  function parseEditorStageText(text) {
    const parsed = parseJsonText(text);
    if (!parsed.ok) {
      return {
        ok: false,
        kind: "json",
        encoding: null,
        grid: null,
        error: parsed.error
      };
    }
    return parseEditorStageDocument(parsed.value);
  }

  function createEditorStagePack(grid) {
    return {
      id: "custom-stage",
      totalStages: 1,
      enemyTotal: DEFAULT_ENEMY_TOTAL,
      enemyTypes: cloneEnemyTypes(DEFAULT_ENEMY_TYPES),
      gameSettings: normalizeGameSettings(),
      stageSettings: [{
        maxActiveEnemies: DEFAULT_MAX_ACTIVE_ENEMIES,
        maxActiveEnemiesTwoPlayer: DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
        playerSpawns: DEFAULT_PLAYER_SPAWNS.map(pixelToTilePoint),
        enemySpawns: DEFAULT_ENEMY_SPAWNS.map(pixelToTilePoint),
        powerUpSpawns: DEFAULT_POWERUP_SPAWNS.map(powerUpPixelToTilePoint)
      }],
      quadrants: [gridToQuadrants(grid)],
      enemies: [ORIGINAL_STAGE_ONE_ENEMIES.map((enemy) => ({ ...enemy }))]
    };
  }

  function serializeEditorStagePack(grid) {
    return JSON.stringify(createEditorStagePack(grid), null, 2);
  }

  return Object.freeze({
    EDITOR_STAGE_FORMAT_VERSION,
    createEditorStageDocument,
    createEditorStagePack,
    parseEditorStageDocument,
    parseEditorStageText,
    parseJsonText,
    serializeEditorStage,
    serializeEditorStagePack
  });
});
