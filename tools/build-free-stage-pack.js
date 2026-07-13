const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const samplePack = JSON.parse(fs.readFileSync(path.join(root, "data", "sample-stage-pack.json"), "utf8"));

const GRID = 13;
const DEFAULT_ENEMY_TOTAL = 20;
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

function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGrid() {
  return Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => "."));
}

function reserved(c, r) {
  if (r <= 1 && (c <= 1 || (c >= 5 && c <= 7) || c >= 11)) return true;
  if (r >= 11 && ((c >= 3 && c <= 4) || (c >= 5 && c <= 7) || (c >= 8 && c <= 9))) return true;
  if (c === 6 && r === 12) return true;
  return false;
}

function place(grid, c, r, tile) {
  if (c < 0 || c >= GRID || r < 0 || r >= GRID || reserved(c, r)) return;
  grid[r][c] = tile;
}

function mirrorPlace(grid, c, r, tile) {
  place(grid, c, r, tile);
  if (c !== 6) place(grid, 12 - c, r, tile);
}

function buildMap(stage) {
  const grid = makeGrid();
  const next = rng(0x5eed0000 ^ Math.imul(stage, 2654435761));
  const variant = stage % 7;

  for (let r = 2; r <= 10; r += 1) {
    for (let c = 1; c <= 6; c += 1) {
      const roll = next();
      let tile = ".";
      if (roll < 0.19) tile = "B";
      else if (roll < 0.235 + stage * 0.0015) tile = "S";
      else if (roll < 0.285) tile = "W";
      else if (roll < 0.34) tile = "F";
      else if (roll < 0.37) tile = "I";
      if (tile !== ".") mirrorPlace(grid, c, r, tile);
    }
  }

  for (let r = 2 + (stage % 3); r <= 9; r += 3) {
    mirrorPlace(grid, 2, r, "B");
    mirrorPlace(grid, 4, r + 1, stage % 5 === 0 ? "S" : "B");
  }

  if (variant === 0) {
    for (let r = 3; r <= 8; r += 1) mirrorPlace(grid, 1, r, "B");
    for (let c = 4; c <= 8; c += 1) place(grid, c, 6, "W");
  } else if (variant === 1) {
    for (let r = 3; r <= 9; r += 2) mirrorPlace(grid, 3, r, "S");
    for (let c = 3; c <= 9; c += 1) place(grid, c, 5, "F");
  } else if (variant === 2) {
    for (let c = 2; c <= 10; c += 2) place(grid, c, 4, "B");
    for (let c = 1; c <= 11; c += 2) place(grid, c, 8, "B");
  } else if (variant === 3) {
    for (let r = 4; r <= 8; r += 1) place(grid, 6, r, r === 6 ? "S" : "B");
    for (let c = 2; c <= 10; c += 1) place(grid, c, 3, "F");
  } else if (variant === 4) {
    for (let c = 2; c <= 10; c += 1) place(grid, c, 4, "I");
    for (let r = 6; r <= 9; r += 1) mirrorPlace(grid, 2, r, "W");
  } else if (variant === 5) {
    for (let r = 2; r <= 10; r += 2) mirrorPlace(grid, 5, r, "B");
    for (let r = 3; r <= 9; r += 3) mirrorPlace(grid, 1, r, "S");
  } else {
    for (let c = 2; c <= 10; c += 1) place(grid, c, 6, c % 3 === 0 ? "S" : "B");
    for (let r = 2; r <= 10; r += 1) mirrorPlace(grid, 4, r, r % 2 === 0 ? "F" : "B");
  }

  for (let r = 0; r < GRID; r += 1) {
    for (let c = 0; c < GRID; c += 1) {
      if (reserved(c, r)) grid[r][c] = ".";
    }
  }
  grid[11][5] = "B";
  grid[11][6] = "B";
  grid[11][7] = "B";
  grid[12][5] = "B";
  grid[12][7] = "B";
  return grid.map((row) => row.join(""));
}

function buildEnemySequence(groups) {
  const sequence = [];
  for (const [count, typeIndex] of groups) {
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
    throw new Error(`enemy sequence must contain ${DEFAULT_ENEMY_TOTAL} enemies`);
  }
  return sequence;
}

const pack = {
  id: "free-35-stage-pack",
  totalStages: ORIGINAL_STYLE_ENEMY_GROUPS.length,
  enemyTotal: DEFAULT_ENEMY_TOTAL,
  enemyTypes: samplePack.enemyTypes,
  gameSettings: samplePack.gameSettings,
  stageSettings: Array.from({ length: ORIGINAL_STYLE_ENEMY_GROUPS.length }, () => samplePack.stageSettings[0]),
  maps: ORIGINAL_STYLE_ENEMY_GROUPS.map((_, index) => buildMap(index + 1)),
  enemies: ORIGINAL_STYLE_ENEMY_GROUPS.map(buildEnemySequence)
};

const outPath = path.join(root, "data", "free-35-stage-pack.json");
fs.writeFileSync(outPath, `${JSON.stringify(pack, null, 2)}\n`);
console.log(`wrote ${path.relative(root, outPath)}`);
