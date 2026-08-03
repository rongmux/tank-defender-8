(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.effectEnemyDestructionDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds the lifecycle probe for enemy destruction, slot release, and stage clearing. */
  function createEffectEnemyDestructionDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    const {
      canTankOccupy,
      checkEndState,
      createPlayer,
      destroyEnemy,
      DOWN,
      enemyDestructionPresentation,
      ENEMY_DESTRUCTION_SCORE_TICKS,
      enemyTotal,
      enemyTypeDefinitions,
      explosionRule,
      game,
      hitTank,
      makeGrid,
      maxActiveEnemies,
      spawnEnemies,
      TILE,
      updateEnemies,
      updateEnemyDestruction
    } = scope;

    return Object.freeze({
      debugEnemyDestructionLifecycleProbe() {
        const previous = { ...game };
        const type = enemyTypeDefinitions()[0];
        const player = createPlayer(1);
        player.spawnFlash = 0;
        player.invuln = 0;
        const makeEnemy = (id, slotIndex, alternateMovement, x) => ({
          kind: "enemy",
          id,
          slotIndex,
          x: x === undefined ? 64 : x,
          y: 64,
          w: 14,
          h: 14,
          dir: DOWN,
          speed: type.speed,
          hp: 1,
          maxHp: 1,
          bulletSpeed: type.bullet,
          bulletPower: type.wallPower,
          reloadBase: type.reload,
          reload: 0,
          score: type.score,
          color: type.color,
          accent: "#2b2a28",
          typeIndex: 0,
          carrier: false,
          fireChance: 0,
          alternateMovement,
          blockedPauseTicks: 0,
          pendingTurn: false,
          spawnFlash: 0,
          alive: true,
          destroying: false,
          destroyTicks: 0,
          slide: 0,
          trackPhase: 0
        });
        const runLifecycle = (enemy) => {
          game.tick = 0;
          game.frameLow = 0;
          game.enemies = [enemy];
          game.enemyKilled = 0;
          destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false });
          const frames = [];
          while (enemy.alive && frames.length < 200) {
            const presentation = enemyDestructionPresentation(enemy);
            frames.push({
              destroyTicks: enemy.destroyTicks,
              kind: presentation.kind,
              phase: presentation.phase || null,
              text: presentation.text || null
            });
            game.tick += 1;
            game.frameLow = (game.frameLow + 1) & 0xff;
            updateEnemyDestruction(enemy);
          }
          return {
            displayFrames: frames.length,
            explosionFrames: frames.filter((frame) => frame.kind === "explosion").length,
            scoreFrames: frames.filter((frame) => frame.kind === "score").length,
            phases: frames
              .map((frame) => frame.phase)
              .filter((phase, index, phases) => phase && (index === 0 || phase !== phases[index - 1])),
            scoreText: frames.find((frame) => frame.kind === "score")?.text || null,
            released: !enemy.alive,
            enemyKilled: game.enemyKilled
          };
        };

        try {
          game.screen = "playing";
          game.demoMode = false;
          game.paused = false;
          game.playerCount = 1;
          game.stage = 1;
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [player];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          game.powerUp = null;

          const fast = runLifecycle(makeEnemy(100, 2, false));
          const normal = runLifecycle(makeEnemy(101, 2, true));

          const frozenEnemy = makeEnemy(102, 2, false);
          game.enemies = [frozenEnemy];
          game.enemyKilled = 0;
          game.freezeTimer = 999;
          destroyEnemy(frozenEnemy, player.id, { awardScore: false, trackKill: false });
          for (let tick = 0; tick < frozenEnemy.destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
            updateEnemies();
          }
          const timerFrozen = {
            released: !frozenEnemy.alive,
            enemyKilled: game.enemyKilled,
            freezeTimer: game.freezeTimer
          };
          game.freezeTimer = 0;

          const collisionEnemy = makeEnemy(103, 2, false, 40);
          const collisionPlayer = createPlayer(1);
          collisionPlayer.x = 26;
          collisionPlayer.y = 64;
          collisionPlayer.spawnFlash = 0;
          collisionPlayer.invuln = 0;
          game.players = [collisionPlayer];
          game.enemies = [collisionEnemy];
          destroyEnemy(collisionEnemy, collisionPlayer.id, { awardScore: false, trackKill: false });
          const collisionIgnored = canTankOccupy(collisionPlayer, collisionPlayer.x + 1, collisionPlayer.y);
          const duplicateBullet = {
            x: collisionEnemy.x + 5,
            y: collisionEnemy.y + 5,
            w: 4,
            h: 4,
            ownerKind: "player",
            ownerId: collisionPlayer.id,
            ownerKey: `player:${collisionPlayer.id}`,
            remove: false
          };
          const duplicateHit = hitTank(duplicateBullet);

          game.players = [player];
          const capacity = maxActiveEnemies();
          const capacityEnemies = Array.from({ length: capacity }, (_, index) =>
            makeEnemy(200 + index, capacity + 1 - index, false, 24 + index * 24)
          );
          for (const enemy of capacityEnemies) {
            destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false });
          }
          game.enemies = capacityEnemies;
          game.enemyKilled = 0;
          game.enemySpawned = capacity;
          game.nextSpawn = 0;
          spawnEnemies();
          const capacityBeforeRelease = {
            enemySpawned: game.enemySpawned,
            aliveSlots: game.enemies.filter((enemy) => enemy.alive).length
          };
          const releasedSlot = capacityEnemies[0].slotIndex;
          for (let tick = 0; tick < capacityEnemies[0].destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
            updateEnemyDestruction(capacityEnemies[0]);
          }
          spawnEnemies();
          const spawnedAfterRelease = game.enemies.find((enemy) => enemy.id === 100 + capacity);
          const capacityAfterRelease = {
            enemySpawned: game.enemySpawned,
            activeSlots: game.enemies.filter((enemy) => enemy.alive).length,
            reusedSlot: spawnedAfterRelease ? spawnedAfterRelease.slotIndex : null,
            releasedSlot
          };

          const grenadeEnemy = makeEnemy(300, 2, false);
          game.players = [player];
          game.enemies = [grenadeEnemy];
          game.scorePopups = [];
          destroyEnemy(grenadeEnemy, player.id, { awardScore: false, trackKill: false, showScore: false });
          grenadeEnemy.destroyTicks = grenadeEnemy.destroyExplosionTicks;
          const grenadeFinalState = enemyDestructionPresentation(grenadeEnemy);

          const lastEnemy = makeEnemy(400, 2, false);
          game.screen = "playing";
          game.players = [player];
          game.enemies = [lastEnemy];
          game.enemySpawned = enemyTotal();
          game.enemyKilled = enemyTotal() - 1;
          game.clearPendingTimer = 0;
          destroyEnemy(lastEnemy, player.id, { awardScore: false, trackKill: false });
          checkEndState();
          const clearOnHit = game.clearPendingTimer;
          for (let tick = 0; tick < lastEnemy.destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS - 1; tick += 1) {
            updateEnemyDestruction(lastEnemy);
          }
          checkEndState();
          const clearBeforeRelease = game.clearPendingTimer;
          updateEnemyDestruction(lastEnemy);
          checkEndState();
          const clearAfterRelease = {
            timer: game.clearPendingTimer,
            screen: game.screen,
            enemyKilled: game.enemyKilled
          };

          return {
            explosionTicks: explosionRule("enemyDestroy").ttl,
            scoreTicks: ENEMY_DESTRUCTION_SCORE_TICKS,
            fast,
            normal,
            timerFrozen,
            collisionIgnored,
            duplicateHit,
            duplicateBulletRemoved: duplicateBullet.remove,
            capacityBeforeRelease,
            capacityAfterRelease,
            grenadeFinalState,
            clearOnHit,
            clearBeforeRelease,
            clearAfterRelease
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createEffectEnemyDestructionDiagnostics: createEffectEnemyDestructionDiagnostics
  });
});
