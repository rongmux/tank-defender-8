const assert = require("assert").strict;
const proceduralStage = require("../../src/stages/procedural-stage");
const { TILE_TYPES, gridToRows, makeGrid } = require("../../src/stages/stage-grid");

const {
  PROCEDURAL_STAGE_MULTIPLIER,
  PROCEDURAL_STAGE_SEED,
  addStageMotif,
  buildProceduralStage,
  createSeededRandom,
  proceduralStageDensity,
  proceduralTerrainType
} = proceduralStage;
const { EMPTY, BRICK, STEEL, WATER, FOREST, ICE } = TILE_TYPES;

const GOLDEN_STAGE_ROWS = Object.freeze({
  1: [
    ".............", "....B...B....", "B...B.B.B...B", "BF..FB.BF..FB", ".S..BSBSB..S.",
    ".SSBS.B.SBSS.", "....BBSBB....", "F...........F", ".B.BBFBFBB.B.", "F..W.....W..F",
    ".IF.......FI.", ".....BBB.....", ".....B.B....."
  ],
  2: [
    ".............", "..FBF...FBF..", "BBBW.W.W.WBBB", "I..WWBFBWW..I", "BW.WBBFBBW.WB",
    "I.BW.B.B.WB.I", "...W.FWF.W...", "...W.BBB.W...", "BS.W..B..W.SB", "I..BF.B.FB..I",
    "B...........B", ".....BBB.....", ".....B.B....."
  ],
  3: [
    ".............", "..F.I...B....", "..I..BB.SBWI.", ".B.B.SB...BBB", ".F.SB.BWW.FB.",
    "B...B..B.FB.F", "SFFFFFBFFFFFI", "...B.BBS..B.B", "..FBB.B.S..W.", "BB.I...W...BB",
    "BB....B...IBF", ".....BBB.....", ".....B.B....."
  ],
  4: [
    ".............", "..B.......B..", "B...F...F...B", "WIII.SBS.IIIW", "BIB..F.F..BIB",
    ".B.BSB.BSB.B.", "BBF..I.I..FBB", "...SI.F.IS...", "IWBBBBIBBBBWI", "FB.B.B.B.B.BF",
    "W.B.......B.W", ".....BBB.....", ".....B.B....."
  ],
  5: [
    ".............", "....B...B....", "..B..BBB..B..", "F.BB.....BB.F", "..BB..S..BB..",
    ".BBW.BBB.WBB.", ".SBBBB.BBBBS.", ".FBBF.I.FBBF.", ".BBB.SSS.BBB.", "..BS..F..SB..",
    "..B.......B..", ".....BBB.....", ".....B.B....."
  ],
  6: [
    ".............", "..BWB.....W..", ".BB..BB..SBBW", "BB.BBIB.IB.II", "....B.FBBB.S.",
    "...F.BBB.I.BS", ".I.I.FBB..B..", "S..B.BB.BBB.W", "S...F.SB...B.", ".I.IBFIBBB..B",
    ".BS.......B.B", ".....BBB.....", ".....B.B....."
  ],
  7: [
    ".............", ".............", "B...B.S.B...B", "....BBBBB....", ".W.B..B..B.W.",
    "BB.B.F.F.B.BB", "S.I.F...F.I.S", ".B.B.SBS.B.B.", "WFB.......BFW", ".WW.SS.SS.WW.",
    "BB.........BB", ".....BBB.....", ".....B.B....."
  ],
  35: [
    ".............", "..BB.....BB..", ".BIBBBBBBBIB.", "..S..BBB..S..", "BFBW.FBF.WBFB",
    "B.BSSB.BSSB.B", ".S..B...B..S.", "FBBFB...BFBBF", "....SF.FS....", "FB...F.F...BF",
    "B.B.......B.B", ".....BBB.....", ".....B.B....."
  ]
});

assert.equal(Object.isFrozen(proceduralStage), true);
assert.equal(PROCEDURAL_STAGE_SEED, 0x8c0ffee);
assert.equal(PROCEDURAL_STAGE_MULTIPLIER, 2654435761);

const next = createSeededRandom(PROCEDURAL_STAGE_SEED);
assert.deepEqual(Array.from({ length: 6 }, next), [
  0.10928489454090595,
  0.35596492839977145,
  0.7182197778020054,
  0.7085589545313269,
  0.13202352239750326,
  0.6949535680469126
]);

assert.equal(proceduralStageDensity(1), 0.273);
assert.equal(proceduralStageDensity(35), 0.375);
assert.equal(proceduralStageDensity(70), 0.375);

const stage = 10;
const density = proceduralStageDensity(stage);
const steelEnd = density + 0.055 + stage * 0.001;
const waterEnd = density + 0.105;
const forestEnd = density + 0.175;
const iceEnd = density + 0.215;
assert.equal(proceduralTerrainType(density - Number.EPSILON, stage), BRICK);
assert.equal(proceduralTerrainType(density, stage), STEEL);
assert.equal(proceduralTerrainType(steelEnd - Number.EPSILON, stage), STEEL);
assert.equal(proceduralTerrainType(steelEnd, stage), WATER);
assert.equal(proceduralTerrainType(waterEnd, stage), FOREST);
assert.equal(proceduralTerrainType(forestEnd, stage), ICE);
assert.equal(proceduralTerrainType(iceEnd, stage), EMPTY);

const motifRows = [
  [".............", ".............", "......B......", ".............", ".............", "..S.S.B.S.S..", ".............", ".............", "......B......", ".............", ".............", ".............", "............."],
  [".............", ".............", "...W.....W...", "...W.....W...", "...W.....W...", "...W.....W...", "...W.....W...", "...W.....W...", "...W.....W...", ".............", ".............", ".............", "............."],
  [".............", ".............", "......B......", ".............", "......B......", ".............", ".FFFFFBFFFFF.", ".............", "......B......", ".............", "......B......", ".............", "............."],
  [".............", ".............", ".............", ".III.....III.", ".............", ".............", ".............", ".............", ".............", ".B.B.B.B.B.B.", ".............", ".............", "............."],
  [".............", ".............", "..B.......B..", "..B.......B..", "..B...S...B..", "..B.......B..", "..B.......B..", "..B.......B..", "..B...S...B..", "..B.......B..", ".............", ".............", "............."],
  [".............", ".............", "..B.......B..", "...B.....B...", "....B...B....", ".....B.B.....", "......B......", ".............", ".............", ".............", ".............", ".............", "............."],
  Array.from({ length: 13 }, () => ".............")
];
for (let variant = 1; variant <= 7; variant += 1) {
  assert.deepEqual(gridToRows(addStageMotif(makeGrid(), variant)), motifRows[variant - 1]);
}

const mirroredRows = gridToRows(buildProceduralStage(1));
assert.equal(mirroredRows.every((row) => row === row.split("").reverse().join("")), true);
const unmirroredRows = gridToRows(buildProceduralStage(3));
assert.equal(unmirroredRows.some((row) => row !== row.split("").reverse().join("")), true);

for (const [goldenStage, rows] of Object.entries(GOLDEN_STAGE_ROWS)) {
  assert.deepEqual(gridToRows(buildProceduralStage(Number(goldenStage))), rows);
}

const firstGrid = buildProceduralStage(8);
const secondGrid = buildProceduralStage(8);
assert.notEqual(firstGrid, secondGrid);
assert.notEqual(firstGrid[0][0], secondGrid[0][0]);
assert.deepEqual(gridToRows(firstGrid), gridToRows(secondGrid));

console.log("procedural-stage unit test passed");
