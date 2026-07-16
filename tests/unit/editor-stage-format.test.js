const assert = require("assert").strict;
const editorStageFormat = require("../../src/editor/editor-stage-format");
const stageGrid = require("../../src/stages/stage-grid");

const {
  EDITOR_STAGE_FORMAT_VERSION,
  createEditorStageDocument,
  createEditorStagePack,
  parseEditorStageDocument,
  parseEditorStageText,
  parseJsonText,
  serializeEditorStage,
  serializeEditorStagePack
} = editorStageFormat;
const {
  GRID,
  QUAD_GRID,
  TILE_TYPES,
  gridToQuadrants,
  makeGrid,
  setTile
} = stageGrid;
const { BRICK, STEEL } = TILE_TYPES;

const grid = makeGrid();
setTile(grid, 0, 0, BRICK, 10);
setTile(grid, 2, 2, STEEL, 1);
const quadrants = gridToQuadrants(grid);

assert.equal(Object.isFrozen(editorStageFormat), true);
assert.equal(EDITOR_STAGE_FORMAT_VERSION, 2);

const document = createEditorStageDocument(grid);
assert.equal(document.version, 2);
assert.deepEqual(document.quadrants, quadrants);
assert.deepEqual(JSON.parse(serializeEditorStage(grid)), document);

const parsedQuadrants = parseEditorStageDocument({
  version: 2,
  quadrants
});
assert.equal(parsedQuadrants.ok, true);
assert.equal(parsedQuadrants.encoding, "quadrants");
assert.deepEqual(gridToQuadrants(parsedQuadrants.grid), quadrants);

const rows = Array.from({ length: GRID }, () => ".".repeat(GRID));
rows[0] = "BS" + ".".repeat(GRID - 2);
const parsedRows = parseEditorStageText(JSON.stringify({ version: 1, rows }));
assert.equal(parsedRows.ok, true);
assert.equal(parsedRows.encoding, "rows");
assert.equal(parsedRows.grid[0][0].type, BRICK);
assert.equal(parsedRows.grid[0][1].type, STEEL);

const malformedJson = parseEditorStageText("{");
assert.equal(malformedJson.ok, false);
assert.equal(malformedJson.kind, "json");
assert.equal(malformedJson.grid, null);

const malformedStage = parseEditorStageDocument({
  quadrants: quadrants.slice(0, QUAD_GRID - 1)
});
assert.equal(malformedStage.ok, false);
assert.equal(malformedStage.kind, "stage");
assert.match(malformedStage.error, /26 quadrant rows or 13 tile rows/);

const parsedValue = parseJsonText('{"value":7}');
assert.equal(parsedValue.ok, true);
assert.deepEqual(parsedValue.value, { value: 7 });
assert.equal(parseJsonText("{").ok, false);

const firstPack = createEditorStagePack(grid);
const secondPack = createEditorStagePack(grid);
assert.equal(firstPack.id, "custom-stage");
assert.equal(firstPack.totalStages, 1);
assert.equal(firstPack.enemyTotal, 20);
assert.equal(firstPack.enemyTypes.length, 4);
assert.equal(firstPack.enemies[0].length, 20);
assert.deepEqual(firstPack.quadrants[0], quadrants);
assert.deepEqual(firstPack.stageSettings[0].playerSpawns, [
  { x: 4, y: 12 },
  { x: 8, y: 12 }
]);
assert.deepEqual(firstPack.stageSettings[0].enemySpawns, [
  { x: 0, y: 0 },
  { x: 6, y: 0 },
  { x: 12, y: 0 }
]);
assert.equal(firstPack.stageSettings[0].powerUpSpawns.length, 16);
assert.equal(firstPack.gameSettings.initialLives, 3);

firstPack.enemyTypes[0].name = "changed";
firstPack.enemies[0][0].typeIndex = 3;
firstPack.gameSettings.playerMovement.frameCadence[0] = false;
assert.equal(secondPack.enemyTypes[0].name, "basic");
assert.equal(secondPack.enemies[0][0].typeIndex, 0);
assert.equal(secondPack.gameSettings.playerMovement.frameCadence[0], true);

const serializedPack = serializeEditorStagePack(grid);
assert.equal(serializedPack.startsWith('{\n  "id": "custom-stage"'), true);
assert.deepEqual(JSON.parse(serializedPack).quadrants[0], quadrants);

console.log("editor-stage-format unit test passed");
