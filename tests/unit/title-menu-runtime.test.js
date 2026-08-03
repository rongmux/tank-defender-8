const assert = require("assert").strict;
const runtime = require("../../src/runtime/title-menu-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(() => runtime.setupTitleMenuRuntime(), /state must be an object/);
assert.throws(
  () => runtime.setupTitleMenuRuntime({ game: {}, fn: {} }, { sharedState: { TITLE_MENU_ITEMS: [] }, clamp() {} }),
  /TITLE_MENU_ITEMS must be a non-empty array/
);

const calls = [];
const state = {
  game: { titleMenu: 0 },
  fn: {
    beginStageSelect(players) {
      calls.push(["beginStageSelect", players]);
    },
    enterEditor() {
      calls.push("enterEditor");
    },
    resetTitleIdleHighByte() {
      calls.push("resetTitleIdleHighByte");
    }
  }
};
const api = runtime.setupTitleMenuRuntime(state, {
  clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  },
  sharedState: {
    TITLE_MENU_ITEMS: [
      { action: "one" },
      { action: "two" },
      { action: "construction" }
    ]
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["moveTitleMenu", "setTitleMenu", "activateTitleMenu"]);
assert.equal(state.fn.moveTitleMenu, api.moveTitleMenu);

api.moveTitleMenu(1);
assert.equal(state.game.titleMenu, 1);
api.moveTitleMenu(2);
assert.equal(state.game.titleMenu, 0);
api.moveTitleMenu(-1);
assert.equal(state.game.titleMenu, 2);
assert.deepEqual(calls, ["resetTitleIdleHighByte", "resetTitleIdleHighByte", "resetTitleIdleHighByte"]);

calls.length = 0;
api.setTitleMenu(-3);
assert.equal(state.game.titleMenu, 0);
api.setTitleMenu(1.8);
assert.equal(state.game.titleMenu, 1);
api.setTitleMenu(99);
assert.equal(state.game.titleMenu, 2);
assert.deepEqual(calls, ["resetTitleIdleHighByte", "resetTitleIdleHighByte", "resetTitleIdleHighByte"]);

calls.length = 0;
state.game.titleMenu = 0;
api.activateTitleMenu();
state.game.titleMenu = 1;
api.activateTitleMenu();
state.game.titleMenu = 2;
api.activateTitleMenu();
state.game.titleMenu = 99;
api.activateTitleMenu();
assert.deepEqual(calls, [
  ["beginStageSelect", 1],
  ["beginStageSelect", 2],
  "enterEditor",
  ["beginStageSelect", 1]
]);

console.log("title-menu-runtime unit test passed");
