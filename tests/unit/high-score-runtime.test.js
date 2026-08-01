const assert = require("assert").strict;
const runtime = require("../../src/runtime/high-score-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupHighScoreRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupHighScoreRuntime({ game: {} }, {}),
  /state\.fn must be an object/
);

const writes = [];
let storedValue = "45678.9";
const state = {
  game: { highScore: 0, runHighScoreBaseline: 0 },
  fn: {}
};
const previousStorageDescriptor = Object.getOwnPropertyDescriptor(global, "localStorage");
Object.defineProperty(global, "localStorage", {
  configurable: true,
  value: {
    getItem(key) {
      assert.equal(key, "tank-defender-high-score");
      return storedValue;
    },
    setItem(key, value) {
      writes.push([key, value]);
    }
  }
});

const api = runtime.setupHighScoreRuntime(state, {
  sharedState: {
    DEFAULT_HIGH_SCORE: 20000,
    HIGH_SCORE_STORAGE_KEY: "tank-defender-high-score"
  }
});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["loadHighScore", "saveHighScore", "updateHighScore"]);
assert.equal(state.fn.updateHighScore, api.updateHighScore);

api.loadHighScore();
assert.equal(state.game.highScore, 45678);
assert.equal(state.game.runHighScoreBaseline, 45678);

api.updateHighScore(45000);
assert.equal(state.game.highScore, 45678);
assert.deepEqual(writes, []);

api.updateHighScore(50000);
assert.equal(state.game.highScore, 50000);
assert.deepEqual(writes, [["tank-defender-high-score", "50000"]]);

storedValue = "0";
api.loadHighScore();
assert.equal(state.game.highScore, 20000);
assert.equal(state.game.runHighScoreBaseline, 20000);

Object.defineProperty(global, "localStorage", {
  configurable: true,
  value: {
    getItem() {
      throw new Error("storage disabled");
    },
    setItem() {
      throw new Error("storage disabled");
    }
  }
});
api.loadHighScore();
assert.equal(state.game.highScore, 20000);
state.game.highScore = 30000;
assert.doesNotThrow(() => api.saveHighScore());

if (previousStorageDescriptor) Object.defineProperty(global, "localStorage", previousStorageDescriptor);
else delete global.localStorage;

console.log("high-score-runtime unit test passed");
