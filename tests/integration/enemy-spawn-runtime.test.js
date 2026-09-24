const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const harness = createBrowserGameHarness(root);
const modules = harness.context.window.TankDefender8Modules;
const deps = modules.moduleDeps;

function createBattle(players, frozen) {
  const state = deps.sharedState.createSharedState({
    canvas: harness.canvas,
    ctx: harness.canvasContext,
    builtInStagePack: deps.createBuiltInStagePack()
  });
  state.fn = {};
  state.game.stagePack = state.builtInStagePack;
  state.stageRuntime = deps.createStageRuntime({
    getState: () => state.game,
    builtInStagePack: state.builtInStagePack
  });
  modules.applicationFlowCompositionRuntime.setupApplicationFlowCompositionRuntime(state, deps, {
    tileTypeName: () => "empty"
  });
  const runtime = modules.battleCompositionRuntime.setupBattleCompositionRuntime(state, deps, {
    render() {},
    shouldSpawnEnemies: () => true,
    update() {}
  });
  const update = runtime.screenUpdateRuntime.updateFrame;
  state.fn.startGame(players);
  for (let frame = 0; frame < 200 && state.game.screen === "stageIntro"; frame += 1) update();
  assert.equal(state.game.screen, "playing");

  const capacity = state.stageRuntime.maxActiveEnemies();
  for (let index = 0; index < capacity; index += 1) {
    state.game.nextSpawn = 0;
    state.fn.spawnEnemies();
    // Keep the real enemy records off the spawn points and out of unrelated AI combat.
    Object.assign(state.game.enemies[index], {
      x: 16 + index * 24,
      y: 64,
      spawnFlash: 0,
      reload: 10000,
      blockedPauseTicks: 10000
    });
  }
  state.game.freezeTimer = frozen ? 10 : 0;
  return { state, update, capacity };
}

// Reference: bank_FF.asm, sub_DB48_enemy_spawn_handler ($DB48-$DB74).
// Countdown runs before slot checks; a zero counter retries without reloading.
for (const players of [1, 2]) {
  for (const frozen of [false, true]) {
    for (const releaseAfterTimeout of [false, true]) {
      const { state, update, capacity } = createBattle(players, frozen);
      const { game, fn } = state;
      const interval = players === 1 ? 186 : 166;
      const label = `${players}P, frozen=${frozen}, expired=${releaseAfterTimeout}`;
      assert.equal(game.enemySpawned, capacity);
      assert.equal(game.nextSpawn, interval);
      update();
      assert.equal(game.nextSpawn, interval - 1, `${label}: full capacity still consumes a frame`);

      game.paused = true;
      for (let frame = 0; frame < 3; frame += 1) update();
      assert.equal(game.nextSpawn, interval - 1, `${label}: Start pause must freeze the countdown`);
      game.paused = false;

      if (releaseAfterTimeout) {
        for (let frame = 0; frame < interval + 3; frame += 1) update();
        assert.equal(game.nextSpawn, 0, `${label}: the full battlefield holds an expired counter`);
        assert.equal(game.enemySpawned, capacity, `${label}: no spawn above capacity`);
      }

      const dying = game.enemies[0];
      const releasedSlot = dying.slotIndex;
      fn.destroyEnemy(dying, 1);
      let destructionFrames = 0;
      while (dying.alive && destructionFrames < 60) {
        update();
        destructionFrames += 1;
        if (dying.alive) {
          assert.equal(game.enemySpawned, capacity, `${label}: destruction still owns its slot`);
        }
      }
      assert.equal(dying.alive, false, `${label}: destruction must release its slot`);
      assert.equal(game.enemyKilled, 1);

      if (!releaseAfterTimeout) {
        assert.equal(game.enemySpawned, capacity, `${label}: releasing early does not skip the delay`);
        assert.equal(game.nextSpawn, interval - 1 - destructionFrames);
        const remaining = game.nextSpawn;
        for (let frame = 0; frame < remaining; frame += 1) update();
        assert.equal(game.nextSpawn, 0);
        assert.equal(game.enemySpawned, capacity, `${label}: zero is checked on the following frame`);
        update();
      }

      assert.equal(game.enemySpawned, capacity + 1, `${label}: refill without an extra interval`);
      assert.equal(deps.activeEnemyCount(game.enemies), capacity);
      assert.equal(game.nextSpawn, interval, `${label}: only a successful spawn reloads the interval`);
      const replacement = game.enemies.find((enemy) => enemy.id === 100 + capacity);
      assert.equal(replacement.slotIndex, releasedSlot);
      assert.equal(replacement.spawnFlash, state.stageRuntime.gameSettings().timings.enemySpawnFlash);

      if (frozen) {
        const position = [replacement.x, replacement.y, replacement.reload];
        const flashFrames = replacement.spawnFlash;
        for (let frame = 0; frame < flashFrames + 2; frame += 1) update();
        assert(game.freezeTimer > 0, `${label}: the clock is still active`);
        assert.equal(replacement.spawnFlash, 0, `${label}: the clock allows spawn animation`);
        assert.deepEqual([replacement.x, replacement.y, replacement.reload], position);
        assert.equal(game.bullets.length, 0, `${label}: the frozen replacement cannot fire`);
      }
    }
  }
}

console.log("enemy-spawn-runtime integration test passed");
