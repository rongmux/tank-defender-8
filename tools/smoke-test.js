const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../tests/helpers/browser-game-harness");

const root = path.resolve(__dirname, "..");
const quadrantPack = JSON.parse(fs.readFileSync(path.join(root, "data", "sample-quadrant-stage-pack.json"), "utf8"));
const freePack = JSON.parse(fs.readFileSync(path.join(root, "data", "free-35-stage-pack.json"), "utf8"));

const {
  context,
  source,
  actions,
  buttons,
  listeners,
  canvas,
  canvasContext,
  fileInput,
  animationFrameCallback
} = createBrowserGameHarness(root);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function enemyTypeCounts(sequence) {
  return sequence.reduce((counts, enemy) => {
    counts[enemy.typeIndex] = (counts[enemy.typeIndex] || 0) + 1;
    return counts;
  }, [0, 0, 0, 0]);
}

function carrierNumbers(sequence) {
  return sequence.map((enemy, index) => enemy.carrier ? index + 1 : null).filter(Boolean).join(",");
}

function stableJson(value) {
  if (!value || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}

function keyDown(code, options = {}) {
  listeners.keydown({
    code,
    repeat: false,
    shiftKey: false,
    preventDefault() {},
    ...options
  });
}

function keyUp(code) {
  listeners.keyup({ code });
}

function keyPress(code, options = {}) {
  keyDown(code, options);
  keyUp(code);
}

function finishStageSelectClosing() {
  const snapshot = context.window.TankDefender8.debugSnapshot();
  if (snapshot.screen === "stageSelectClosing") {
    context.window.TankDefender8.debugAdvanceStageTransition(16);
  }
}

assert(context.window.TankDefender8, "TankDefender8 API was not exposed");
const pausedStageEndProbe = context.window.TankDefender8.debugPausedStageEndProbe();
assert(pausedStageEndProbe.incomplete.screen === "playing" && pausedStageEndProbe.incomplete.paused === true && pausedStageEndProbe.incomplete.pauseElapsed === 1, "an incomplete stage should remain paused while its display frame advances");
assert(pausedStageEndProbe.incomplete.tick === 41 && pausedStageEndProbe.detected.tick === 0, "paused stage-end checks should freeze incomplete play and reset both battle frame counters when completion is detected");
assert(pausedStageEndProbe.detected.enemyCount === 0 && pausedStageEndProbe.detected.paused === false && pausedStageEndProbe.detected.pauseElapsed === 0, "detecting the final defeated enemy during pause should leave the pausable battle loop");
assert(pausedStageEndProbe.detected.screen === "playing" && pausedStageEndProbe.detected.clearPendingTimer === pausedStageEndProbe.delay, "paused stage completion should load the full active clear delay without consuming a frame on detection");
assert(pausedStageEndProbe.pauseAcceptedDuringDelay === false, "the post-clear activity delay should reject new pause input");
let snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.highScore === 20000, "high score should retain the original 20000-point floor");
const schema = context.window.TankDefender8.stagePackSchema();
canvasContext.calls.length = 0;
assert(typeof animationFrameCallback === "function", "animation frame callback should be registered");
animationFrameCallback(16);
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#e3c64e" && call.w === 4 && call.h === 10), "title should render the menu tank cursor");
assert(snapshot.titleMenu === 0 && snapshot.titleMenuAction === "one", "title menu should default to one-player");
keyPress("ArrowDown");
keyPress("ArrowDown");
for (let visit = 0; visit < 7; visit += 1) {
  keyPress("Enter");
  keyPress("Escape");
}
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title" && snapshot.titleMenuAction === "construction" && snapshot.constructionVisits === 7, "real title/editor key events should arm the seventh Construction exit");
keyDown("ArrowDown");
for (let press = 0; press < 8; press += 1) keyPress("KeyF");
keyUp("ArrowDown");
keyDown("ArrowRight");
for (let press = 0; press < 12; press += 1) keyPress("KeyG");
keyUp("ArrowRight");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.titleMenuAction === "construction" && snapshot.hiddenInputCount === 0x74, "real two-controller key events should preserve the Construction selection and reach the hidden byte total");
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "hiddenMessage" && snapshot.hiddenMessageElapsed === 0, "Start should enter the hidden message through the real key listener");
buttons.find((button) => button.dataset.action === "reset").click();
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title" && snapshot.constructionVisits === 0 && snapshot.hiddenInputCount === 0, "reset should clear hidden-message progress after the end-to-end input test");
keyPress("ArrowDown");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.titleMenu === 1 && snapshot.titleMenuAction === "two", "title menu down should select two-player");
keyPress("ArrowDown");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.titleMenu === 2 && snapshot.titleMenuAction === "construction", "title menu down should select construction");
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "editor" && snapshot.titleMenuAction === "construction", "title menu construction should enter the editor on Enter");
keyPress("Escape");
keyPress("ArrowUp");
keyPress("ArrowUp");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title" && snapshot.titleMenu === 0 && snapshot.titleMenuAction === "one", "title menu should return to one-player after navigating back up");
keyPress("Digit1");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "stageSelectClosing" && snapshot.stageSelectPlayers === 1, "one-player shortcut should begin the original stage-selection curtain close");
finishStageSelectClosing();
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "stageSelect", "the stage-selection screen should appear after the sixteen-frame curtain close");
assert(snapshot.stage === 1 && snapshot.stageSelectLimit === 35, "stage selection should start at stage 1 and stop at the original stage 35 limit");
keyPress("Space");
context.window.TankDefender8.debugAdvanceStageSelect(1);
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stage === 2, "stage-selection A should increment the stage");
keyPress("KeyF");
context.window.TankDefender8.debugAdvanceStageSelect(1);
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stage === 1, "stage-selection B should decrement the stage");
keyPress("KeyF");
context.window.TankDefender8.debugAdvanceStageSelect(1);
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stage === 1, "stage-selection B should remain clamped at stage 1");
const stageSelectInputCadenceProbe = context.window.TankDefender8.debugStageSelectInputCadenceProbe();
assert(stageSelectInputCadenceProbe.initialPress.stage === 11 && stageSelectInputCadenceProbe.initialPress.frameLow === 0, "a fresh stage-selection press should apply on its first sampled frame and reset only the low frame counter");
assert(stageSelectInputCadenceProbe.initialPress.frameHigh === 0x22, "stage-selection input must preserve the independent high frame counter");
assert(stageSelectInputCadenceProbe.beforeHeldRepeat.stage === 11 && stageSelectInputCadenceProbe.beforeHeldRepeat.frameLow === 7, "a held stage-selection button should not repeat during the first seven frames after a change");
assert(stageSelectInputCadenceProbe.heldRepeat.stage === 12 && stageSelectInputCadenceProbe.heldRepeat.frameLow === 0, "a held stage-selection button should repeat on the eighth low-counter frame and restart its cadence");
assert(stageSelectInputCadenceProbe.upperBoundary.stage === 35 && stageSelectInputCadenceProbe.upperBoundary.frameLow === 0, "stage-selection A should clamp at stage 35 while still resetting the low frame counter");
assert(stageSelectInputCadenceProbe.lowerBoundary.stage === 1 && stageSelectInputCadenceProbe.lowerBoundary.frameLow === 0, "stage-selection B should clamp at stage 1 while still resetting the low frame counter");
assert(stageSelectInputCadenceProbe.heldBeforeBoundary.stage === 20 && stageSelectInputCadenceProbe.heldBeforeBoundary.frameLow === 7, "an already-held stage-selection button should wait for the next divisible-by-eight low-counter frame");
assert(stageSelectInputCadenceProbe.heldAtBoundary.stage === 21 && stageSelectInputCadenceProbe.heldAtBoundary.frameLow === 0, "an already-held stage-selection button should trigger exactly at that low-counter boundary");
assert(stageSelectInputCadenceProbe.simultaneousPress.stage === 21, "stage-selection A should retain priority when A and B are newly sampled together");
assert(stageSelectInputCadenceProbe.heldAPriority.stage === 21, "an A hold repeat should retain priority over a fresh B press on the same low-counter boundary");
assert(stageSelectInputCadenceProbe.freshBOutsideARepeat.stage === 19, "a fresh B press should be accepted while A is held outside its repeat boundary");
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "stageIntro" && snapshot.stage === 1 && snapshot.paused === false, "stage-selection Start should begin the selected stage intro");
assert(snapshot.stageStartAudio.active === true && snapshot.stageStartAudio.frame === 0, "starting a stage should trigger all stage-start voices at frame zero");
assert(snapshot.movementAudioMode === "none", "stage-start audio should initially suppress the movement pulse channel");
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "stageIntro" && snapshot.paused === false, "Start-equivalent Enter should not pause before active gameplay begins");
const stageIntroBeforeFinalFrame = context.window.TankDefender8.debugAdvanceStageTransition(94);
assert(stageIntroBeforeFinalFrame.screen === "stageIntro" && stageIntroBeforeFinalFrame.transitionTimer === 1, "stage intro should remain inactive through its first ninety-four frames");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stageStartAudio.active === true && snapshot.stageStartAudio.frame === 94, "stage-start audio should advance with each fixed stage-intro frame");
const stageIntroAfterFinalFrame = context.window.TankDefender8.debugAdvanceStageTransition(1);
assert(stageIntroAfterFinalFrame.screen === "playing" && stageIntroAfterFinalFrame.transitionTimer === 0, "the ninety-fifth stage-intro frame should prepare the active battle screen");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stageStartAudio.active === true && snapshot.stageStartAudio.frame === 95 && snapshot.movementAudioMode === "none", "the stage fanfare should continue into battle and keep movement audio suppressed");
keyPress("Enter");
const pausedStageStartAudio = context.window.TankDefender8.debugAdvanceStageStartAudio(10);
assert(pausedStageStartAudio.paused === true && pausedStageStartAudio.frame === 95, "pause should mute and freeze the stage-start audio frame");
keyPress("Enter");
const stageStartBeforeEnd = context.window.TankDefender8.debugAdvanceStageStartAudio(168);
assert(stageStartBeforeEnd.active === true && stageStartBeforeEnd.frame === 263 && stageStartBeforeEnd.movementAudioMode === "none", "stage-start audio should span the first 169 battle frames and retain movement-channel priority through frame 263");
const stageStartAfterEnd = context.window.TankDefender8.debugAdvanceStageStartAudio(1);
assert(stageStartAfterEnd.active === false && stageStartAfterEnd.frame === 264 && stageStartAfterEnd.movementAudioMode === "enemy", "frame 264 should end the fanfare and restore the enemy movement loop");
buttons.find((button) => button.dataset.action === "reset").click();
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title" && snapshot.paused === false, "reset after Start-pause probe should return to the title screen");
assert(schema.enemyTotal === 20, "schema enemy total should be 20");
const stageClearRowLayoutProbe = context.window.TankDefender8.debugStageClearRowLayoutProbe();
assert(
  stageClearRowLayoutProbe.leftArrowX === 112 &&
    stageClearRowLayoutProbe.miniTankX === 121 &&
    stageClearRowLayoutProbe.rightArrowX === 136,
  "stage result enemy rows should use the original left-arrow, tank, and right-arrow anchors"
);
assert(
  stageClearRowLayoutProbe.leftGap === 1 &&
    stageClearRowLayoutProbe.rightGap === 1 &&
    stageClearRowLayoutProbe.leftOverlapsTank === false &&
    stageClearRowLayoutProbe.tankOverlapsRight === false,
  "stage result enemy icons should retain one clear pixel on both sides without touching either arrow"
);
const battleRandomProbe = context.window.TankDefender8.debugBattleRandomProbe();
assert(battleRandomProbe.shared.aiDecision === false && battleRandomProbe.shared.afterAiIndex === 255, "enemy AI should consume the shared NES-style random sequence");
assert(battleRandomProbe.shared.secondType === "shovel" && battleRandomProbe.shared.afterPowerUpIndex === 0, "power-up selection should consume the next byte from the same shared sequence");
assert(battleRandomProbe.shared.locationId === 0 && battleRandomProbe.shared.afterLocationIndex === 2, "power-up placement should consume the original pair of position bytes from the shared sequence");
assert(battleRandomProbe.injected === 128 && battleRandomProbe.injectedPreservedState === true, "deterministic test injection should bypass and preserve runtime random state");
assert(!source.includes("Math.random"), "gameplay should not fall back to the host Math.random source");
assert(schema.enemyTypes[2].wallPower === 1, "the built-in Power Tank should gain bullet speed without stronger wall damage");
const lifeAwardProbe = context.window.TankDefender8.debugLifeAwardProbe();
assert(lifeAwardProbe.thresholdAudio.active && lifeAwardProbe.thresholdAudio.frame === 0, "crossing the score threshold should trigger the two-voice bonus-life event");
assert(lifeAwardProbe.tankAudio.active && lifeAwardProbe.tankAudio.frame === 0, "collecting the extra-tank power-up should restart the same bonus-life event");
assert(lifeAwardProbe.tankPickupAudio.active && lifeAwardProbe.tankPickupAudio.frame === 0 && !lifeAwardProbe.tankPickupAudio.audible, "extra-tank pickup audio should begin silently behind the higher-priority bonus-life pulse voice");
const enemyBulletPlayerProbe = context.window.TankDefender8.debugEnemyBulletPlayerCollisionProbe();
assert(enemyBulletPlayerProbe.protected.bulletRemoved === true && enemyBulletPlayerProbe.protected.alive === true && enemyBulletPlayerProbe.protected.explosions === 0, "player protection should absorb an enemy bullet without a hit explosion");
assert(!enemyBulletPlayerProbe.positiveNine.alive && !enemyBulletPlayerProbe.negativeNine.alive && enemyBulletPlayerProbe.positiveNine.destroying && enemyBulletPlayerProbe.negativeNine.destroying, "unprotected center-range enemy hits should start retained player death states");
assert(enemyBulletPlayerProbe.positiveNine.explosionDetails.map((explosion) => explosion.style).join(",") === "bulletImpact", "an unprotected player hit should create only the detached bullet-impact effect");
assert(enemyBulletPlayerProbe.positiveNine.explosionDetails.map((explosion) => explosion.ttl).join(",") === "9", "the detached player-hit effect should retain the original nine-frame bullet-impact duration");
assert(enemyBulletPlayerProbe.positiveNine.explosionDetails[0].x === 80 && enemyBulletPlayerProbe.positiveNine.explosionDetails[0].y === 80, "the small player-hit explosion should remain at the enemy bullet center");
const playerBulletEnemyProbe = context.window.TankDefender8.debugPlayerBulletEnemyCollisionProbe();
assert(playerBulletEnemyProbe.positiveNine.enemyAlive && playerBulletEnemyProbe.negativeNine.enemyAlive && playerBulletEnemyProbe.positiveNine.enemyDestroying && playerBulletEnemyProbe.negativeNine.enemyDestroying, "center-range player hits should retain one-hit enemies in their destruction states");
assert(playerBulletEnemyProbe.positiveNine.explosionDetails.map((explosion) => explosion.style).join(",") === "bulletImpact", "destroying an enemy should keep only the detached bullet impact while tank destruction renders from enemy state");
assert(playerBulletEnemyProbe.positiveNine.explosionDetails.map((explosion) => explosion.ttl).join(",") === "9", "enemy hits should preserve the separate nine-frame bullet-impact duration");
assert(playerBulletEnemyProbe.positiveNine.explosionDetails[0].x === 80 && playerBulletEnemyProbe.positiveNine.explosionDetails[0].y === 80, "the enemy-hit bullet explosion should remain at the bullet center");
assert(playerBulletEnemyProbe.armored.enemyAlive && playerBulletEnemyProbe.armored.enemyHp === 1, "a surviving armored enemy should lose exactly one hit point");
assert(playerBulletEnemyProbe.armored.explosionDetails.length === 1 && playerBulletEnemyProbe.armored.explosionDetails[0].style === "bulletImpact" && playerBulletEnemyProbe.armored.explosionDetails[0].ttl === 9, "a surviving armored enemy should show only the nine-frame bullet impact");
assert(playerBulletEnemyProbe.spawning.enemyAlive && playerBulletEnemyProbe.spawning.enemyHp === 1 && !playerBulletEnemyProbe.spawning.bulletRemoved, "player bullets should pass through enemies still in their spawn animation");
const spawnLockProbe = context.window.TankDefender8.debugPlayerSpawnLockProbe();
assert(spawnLockProbe.duration === schema.gameSettings.timings.playerSpawnFlash, "player spawn lock should use the configured timing");
assert(spawnLockProbe.locked.spawnFlash === spawnLockProbe.before.spawnFlash - 1, "player spawn lock should count down each frame");
assert(spawnLockProbe.locked.x === spawnLockProbe.before.x && spawnLockProbe.locked.y === spawnLockProbe.before.y, "spawning player should not move");
assert(spawnLockProbe.locked.dir === spawnLockProbe.before.dir, "spawning player should not turn");
assert(spawnLockProbe.locked.bullets === spawnLockProbe.before.bullets, "spawning player should not fire");
assert(spawnLockProbe.before.invuln === 0 && spawnLockProbe.locked.invuln === 0, "spawn countdown should not consume post-spawn protection");
assert(spawnLockProbe.friendlyDuringSpawn.stun === 0, "friendly fire should not stun a spawning player");
assert(spawnLockProbe.friendlyDuringSpawn.bulletRemoved === false, "friendly fire should not be consumed by a spawning player");
assert(spawnLockProbe.enemyDuringSpawn.alive === true && spawnLockProbe.enemyDuringSpawn.bulletRemoved === false, "enemy bullets should not be consumed by a spawning player");
assert(spawnLockProbe.activated.spawnFlash === 0 && spawnLockProbe.activated.invuln === schema.gameSettings.timings.playerInvulnerability, "spawn completion should start the protection timer");
assert(spawnLockProbe.activated.x === spawnLockProbe.locked.x && spawnLockProbe.activated.bullets === spawnLockProbe.locked.bullets, "the spawn-completion tick should remain input locked");
assert(spawnLockProbe.released.dir === 1, "player should turn after the spawn lock ends");
assert(spawnLockProbe.released.x > spawnLockProbe.locked.x, "player should move after the spawn lock ends");
assert(spawnLockProbe.released.bullets === 1, "player should fire after the spawn lock ends");
assert(spawnLockProbe.released.invuln === schema.gameSettings.timings.playerInvulnerability, "post-spawn protection should wait for the next global 64-frame boundary before counting down");
assert(spawnLockProbe.protectedFriendlyAfterSpawn.stun === 0 && spawnLockProbe.protectedFriendlyAfterSpawn.bulletRemoved === true, "post-spawn protection should absorb friendly fire without applying stun");
assert(spawnLockProbe.friendlyAfterProtection.stun === spawnLockProbe.friendlyFireStunFrames, "friendly fire should stun after post-spawn protection ends");
assert(spawnLockProbe.friendlyAfterProtection.bulletRemoved === true, "friendly fire should be consumed after post-spawn protection ends");
assert(spawnLockProbe.enemyAfterSpawn.alive === true && spawnLockProbe.enemyAfterSpawn.bulletRemoved === true, "enemy bullets should be absorbed by post-spawn invulnerability");
const stunProbe = context.window.TankDefender8.debugPlayerStunProbe();
assert(stunProbe.turned === false, "stunned players should not turn");
assert(stunProbe.moved === false, "stunned players should not move");
assert(stunProbe.fired === true, "stunned players should still fire");
assert(stunProbe.after.pendingSnap === false, "stunned direction input should not queue a later snap");
const friendlyFireRefreshProbe = context.window.TankDefender8.debugFriendlyFireRefreshProbe();
assert(friendlyFireRefreshProbe.before === 37 && friendlyFireRefreshProbe.after === 37, "a repeated friendly hit should not refresh an active stun timer");
assert(friendlyFireRefreshProbe.bulletRemoved === true, "a repeated friendly hit should still consume the bullet");
const friendlyProtectionProbe = context.window.TankDefender8.debugFriendlyFireProtectionProbe();
assert(friendlyProtectionProbe.protected.bulletRemoved === true && friendlyProtectionProbe.protected.stun === 0 && friendlyProtectionProbe.protected.explosions === 0, "player protection should absorb a friendly bullet without stun or hit explosion");
assert(friendlyProtectionProbe.positiveNine.stun === schema.gameSettings.friendlyFire.stunFrames && friendlyProtectionProbe.negativeNine.stun === schema.gameSettings.friendlyFire.stunFrames, "unprotected center-range friendly hits should apply the configured stun");
assert(friendlyProtectionProbe.positiveNine.explosion.style === "bulletImpact" && friendlyProtectionProbe.positiveNine.explosion.ttl === 9, "an unprotected friendly hit should use the nine-frame three-phase bullet impact");
assert(friendlyProtectionProbe.positiveNine.explosion.x === 80 && friendlyProtectionProbe.positiveNine.explosion.y === 80, "the friendly-hit explosion should remain centered on the bullet");
const wasdDirectionProbe = context.window.TankDefender8.debugWasdDirectionProbe();
assert(wasdDirectionProbe.singleAfter.x > wasdDirectionProbe.singleBefore.x && wasdDirectionProbe.singleAfter.dir === 1, "single-player WASD should act as player-one direction keys");
assert(wasdDirectionProbe.twoAfter.p1.x === wasdDirectionProbe.twoBefore.p1.x && wasdDirectionProbe.twoAfter.p1.dir === wasdDirectionProbe.twoBefore.p1.dir, "two-player WASD should not move player one");
assert(wasdDirectionProbe.twoAfter.p2.x > wasdDirectionProbe.twoBefore.p2.x && wasdDirectionProbe.twoAfter.p2.dir === 1, "two-player WASD should remain assigned to player two");
const playerTurnProbe = context.window.TankDefender8.debugPlayerTurnAlignmentProbe();
assert(playerTurnProbe.gridSize === 8, "perpendicular player turns should align to the original eight-pixel grid");
assert(playerTurnProbe.perpendicular.x === 64 && playerTurnProbe.perpendicular.y === 73 && playerTurnProbe.perpendicular.dir === 2, "horizontal-to-vertical turns should align both coordinates before moving");
assert(playerTurnProbe.reverse.x === 66 && playerTurnProbe.reverse.y === 70 && playerTurnProbe.reverse.dir === 3, "a 180-degree reverse should move immediately without coordinate snapping");
assert(playerTurnProbe.same.x === 68 && playerTurnProbe.same.y === 70 && playerTurnProbe.same.dir === 1, "continuing in the same direction should not snap coordinates");
assert(playerTurnProbe.perpendicular.pendingSnap === false && playerTurnProbe.reverse.pendingSnap === false, "turn alignment should complete in the current movement tick");
const iceMovementProbe = context.window.TankDefender8.debugIceMovementProbe();
assert(iceMovementProbe.configuredTicks === 28 && iceMovementProbe.configuredSpeed === 1, "ice movement should use the original 28-count full-speed inertia");
assert(iceMovementProbe.afterEntry.slide === 28 && iceMovementProbe.afterEntry.x === 33, "first direction input on ice should arm inertia and move one pixel");
assert(iceMovementProbe.afterForcedWindow.slide === 15 && iceMovementProbe.afterForcedWindow.dir === 1 && iceMovementProbe.afterForcedWindow.x === 46, "the first thirteen inertia ticks should ignore reverse input and continue forward");
assert(iceMovementProbe.afterControlReturns.dir === 2 && iceMovementProbe.afterControlReturns.slide === 15, "direction control should return when the inertia counter drops below sixteen");
assert(iceMovementProbe.tailResult.distance === 15 && iceMovementProbe.tailResult.slide === 0, "releasing input should coast one pixel per tick until the remaining inertia reaches zero");
assert(iceMovementProbe.offIceResult.x === 64 && iceMovementProbe.offIceResult.slide === 10, "leaving ice should preserve but stop consuming inertia");
assert(iceMovementProbe.reentered.x === 65 && iceMovementProbe.reentered.slide === 9, "re-entering ice should resume the preserved inertia");
assert(iceMovementProbe.blockedResult.x === 34 && iceMovementProbe.blockedResult.slide === 4, "blocked ice movement should consume inertia without crossing a wall");
assert(iceMovementProbe.stunnedResult.x === 33 && iceMovementProbe.stunnedResult.dir === 1 && iceMovementProbe.stunnedResult.slide === 2, "stunned players should retain existing ice drift without turning");
assert(schema.maps[0].length === 13, "schema map should have 13 rows");
assert(schema.maps[0][0].length === 13, "schema map rows should have 13 columns");
assert(schema.quadrants[0].length === 26, "schema quadrant map should have 26 rows");
assert(schema.quadrants[0][0].length === 26, "schema quadrant rows should have 26 columns");
assert(schema.enemies[0].length === 20, "schema enemy sequence should have 20 entries");
assert(schema.enemies[0].filter((enemy) => enemy.typeIndex === 0).length === 18, "schema stage 1 should contain 18 basic enemies");
assert(schema.enemies[0].filter((enemy) => enemy.typeIndex === 1).length === 2, "schema stage 1 should contain 2 fast enemies");
assert(carrierNumbers(schema.enemies[0]) === "4,11,18", "schema carriers should be enemies 4, 11, and 18");
assert(Object.prototype.hasOwnProperty.call(schema.enemies[0][3], "powerUpType"), "schema should expose powerUpType");
assert(schema.enemies[0].filter((enemy) => enemy.carrier).every((enemy) => enemy.powerUpType === null), "schema carriers should use random power-up types by default");
assert(Object.prototype.hasOwnProperty.call(schema.enemies[0][0], "spawnDelay"), "schema should expose spawnDelay");

const byAction = Object.fromEntries(buttons.map((button) => [button.dataset.action, button]));
for (const action of actions) {
  assert(typeof byAction[action].listeners.click === "function", `${action} button listener missing`);
}

let counts = enemyTypeCounts(snapshot.enemySequence);
assert(counts.join(",") === "18,2,0,0", "built-in stage 1 enemy groups should be 18 basic and 2 fast");
assert(carrierNumbers(snapshot.enemySequence) === "4,11,18", "built-in stage 1 carriers should be enemies 4, 11, and 18");
byAction.next.click();
snapshot = context.window.TankDefender8.debugSnapshot();
counts = enemyTypeCounts(snapshot.enemySequence);
assert(snapshot.stage === 2, "next should select stage 2");
assert(counts.join(",") === "14,0,4,2", "built-in stage 2 enemy groups should be 14 basic, 4 power, and 2 armor");
assert(carrierNumbers(snapshot.enemySequence) === "4,11,18", "built-in stage 2 carriers should be enemies 4, 11, and 18");
byAction.prev.click();
byAction.prev.click();
snapshot = context.window.TankDefender8.debugSnapshot();
counts = enemyTypeCounts(snapshot.enemySequence);
assert(snapshot.stage === 70, "prev from stage 1 should wrap to stage 70 in the original-style cycle");
assert(snapshot.stageCycleLimit === 70, "built-in original-style cycle should expose 70 selectable stages");
assert(snapshot.mapDataStage === 35, "built-in stage 70 should reuse stage 35 map data");
assert(snapshot.enemyDataStage === 35, "built-in stage 70 should reuse stage 35 enemy data");
assert(counts.join(",") === "0,6,4,10", "built-in stage 70 should use stage 35 enemy groups");
assert(carrierNumbers(snapshot.enemySequence) === "4,11,18", "built-in stage 70 carriers should match stage 35");
byAction.next.click();

const validPack = {
  id: "smoke",
  totalStages: 1,
  enemyTotal: 20,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0]]
};
const loaded = context.window.TankDefender8.loadStagePack(validPack);
assert(loaded === true, "loadStagePack should accept a valid pack");
assert(context.window.TankDefender8.currentPackInfo().id === "smoke", "current pack id should update");
byAction.one.click();
finishStageSelectClosing();
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.players.length === 1 && snapshot.screen === "stageIntro", "pack state cleanup probe should start from active gameplay");
assert(context.window.TankDefender8.loadStagePack(validPack) === true, "loadStagePack should reload while gameplay is active");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title", "loading a stage pack should return to the title screen");
assert(snapshot.players.length === 0 && snapshot.enemySpawned === 0 && snapshot.enemyKilled === 0, "loading a stage pack should clear active player and enemy counters");
assert(snapshot.powerUpType === null && snapshot.clearPendingTimer === 0 && snapshot.gameOverTimer === 0, "loading a stage pack should clear transient power-up and transition state");
assert(snapshot.stageResultReason === "clear" && snapshot.stageClearElapsed === 0, "loading a stage pack should reset stage-result routing state");

const shortPack = {
  id: "short",
  totalStages: 1,
  enemyTypes: schema.enemyTypes.map((enemyType, index) => index === 0 ? { ...enemyType, hp: 2, wallPower: 2, fireChance: 0.25, score: 150, color: "#ffffff", hitColors: ["#111111", "#ffffff"] } : enemyType),
  gameSettings: {
    initialLives: 5,
    bonusLifeScores: [100],
    deathPowerLevel: 2,
    powerUpDurations: { helmet: 30, shovel: 40, shovelFlash: 16, timer: 50 },
    powerUpRules: { carrierRelease: "hit", clearUncollectedOnCarrierSpawn: false, pickupScore: 750 },
    timings: { stageIntro: 7, stageClearDelay: 6, stageClear: 8, playerRespawn: 9, playerInvulnerability: 10, enemySpawnFlash: 11, enemyInitialReload: 12, enemySpawnRetry: 13, powerUpTtl: 14 },
    enemySpawnPacing: { firstDelay: 5, baseDelay: 9, stageStep: 1, minDelay: 4 },
    playerMovement: { speed: 1.5, iceSlideFrames: 3, iceSlideSpeed: 0.4 },
    projectileRules: { bulletSize: 6, spawnOffset: 11, boundsPadding: 2 },
    friendlyFire: { enabled: false, stunFrames: 12 },
    explosionRules: { enemyDestroy: { ttl: 22, color: "#123456", coreColor: "#abcdef" } },
    stageAdvance: { loopAfterFinalStage: false },
    stageClearBonus: { points: 777, twoPlayerOnly: true, requireStrictLead: true },
    enemyAi: { intersectionTurnChance: 0.33, blockedRetryChance: 0.44, blockedRetryTicks: 5, horizontalFirstChance: 0.22 },
    playerUpgradeRules: schema.playerUpgradeRules.map((rule, index) => index === 0 ? { ...rule, maxBullets: 2, bulletSpeed: 2.75, reload: 21 } : rule),
    timerFreezesEnemyTime: false
  },
  maps: [schema.maps[0]],
  stageSettings: [{
    maxActiveEnemies: 2,
    playerSpawns: [{ x: 3, y: 12 }, { x: 9, y: 12 }],
    enemySpawns: [{ x: 1, y: 0 }, { x: 6, y: 0 }, { x: 11, y: 0 }],
    powerUpSpawns: [{ x: 2, y: 2 }, { x: 10, y: 10 }]
  }],
  enemies: [schema.enemies[0].slice(0, 3).map((enemy) => ({ ...enemy, spawnDelay: null }))]
};
assert(context.window.TankDefender8.validateStagePack(shortPack).ok === true, "short per-stage enemy list should validate");
assert(context.window.TankDefender8.loadStagePack(shortPack) === true, "short per-stage enemy list should load");
assert(context.window.TankDefender8.currentPackInfo().enemyTotal === 3, "current stage enemy total should derive from sequence length");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[0].hp === 2, "current pack should expose custom enemy hp");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[0].wallPower === 2, "current pack should expose custom enemy wall power");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[0].fireChance === 0.25, "current pack should expose custom enemy fire chance");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[0].score === 150, "current pack should expose custom enemy score");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[0].hitColors[0] === "#111111", "current pack should expose custom enemy hit colors");
assert(context.window.TankDefender8.debugEnemyColorProbe(0, 1) === "#111111", "custom enemy hit colors should apply at low HP");
assert(context.window.TankDefender8.debugEnemyColorProbe(0, 2) === "#ffffff", "custom enemy hit colors should apply at high HP");
assert(context.window.TankDefender8.currentPackInfo().maxActiveEnemies === 2, "current stage max active enemies should use stageSettings");
const stageClearDelayStartProbe = context.window.TankDefender8.debugStageClearDelayProbe(0, true);
assert(
  stageClearDelayStartProbe.screen === "playing" &&
    stageClearDelayStartProbe.clearPendingTimer === context.window.TankDefender8.currentPackInfo().timings.stageClearDelay,
  "stage completion detection should load the full clear delay without decrementing it"
);
assert(context.window.TankDefender8.debugStageClearDelayProbe(2, true).screen === "playing", "stage clear delay should keep gameplay active before result");
assert(context.window.TankDefender8.debugStageClearDelayProbe(1, true).screen === "stageClear", "stage clear delay should eventually enter result screen");
const stageClearLowKillProbe = context.window.TankDefender8.debugStageClearDelayProbe(1, true, 0);
assert(
  stageClearLowKillProbe.screen === "stageClear" &&
    stageClearLowKillProbe.enemySpawned === context.window.TankDefender8.currentPackInfo().enemyTotal &&
    stageClearLowKillProbe.enemyKilled === 0,
  "stage clear should depend on all spawned enemies being gone, not on the kill-table counter"
);
assert(context.window.TankDefender8.debugStageClearDelayProbe(2, false).screen === "gameOver", "base destruction should win during stage clear delay");
const gameOverBattleProbe = context.window.TankDefender8.debugGameOverBattleProbe();
assert(gameOverBattleProbe.after.screen === "gameOver" && gameOverBattleProbe.after.tick === gameOverBattleProbe.before.tick + 1, "game-over field frames should keep the battle clock active");
assert(gameOverBattleProbe.after.timer === gameOverBattleProbe.before.timer - 1, "game-over field frames should consume one total-duration frame");
assert(gameOverBattleProbe.after.playerX === gameOverBattleProbe.before.playerX && gameOverBattleProbe.after.bulletCount === gameOverBattleProbe.before.bulletCount, "game-over field frames should clear movement and queued fire input");
assert(gameOverBattleProbe.after.playerReload === gameOverBattleProbe.before.playerReload - 1, "game-over field frames should keep player tank state advancing");
assert(gameOverBattleProbe.after.enemySpawnFlash === gameOverBattleProbe.before.enemySpawnFlash - 1, "game-over field frames should keep enemy spawn animation advancing");
assert(gameOverBattleProbe.after.bulletX === gameOverBattleProbe.before.bulletX + 1, "game-over field frames should keep bullets moving");
assert(gameOverBattleProbe.after.explosionTtl === gameOverBattleProbe.before.explosionTtl - 1 && gameOverBattleProbe.after.popupTtl === gameOverBattleProbe.before.popupTtl - 1, "game-over field frames should keep explosions and score popups advancing");
assert(gameOverBattleProbe.after.powerUpTtl === gameOverBattleProbe.before.powerUpTtl - 1, "game-over field frames should keep power-up simulation advancing");
const gameOverReturnProbe = context.window.TankDefender8.debugGameOverReturnProbe();
assert(gameOverReturnProbe.finalFrame.screen === "gameOver" && gameOverReturnProbe.finalFrame.timer === 0, "game-over should render the centered final frame before leaving");
assert(gameOverReturnProbe.afterFinalFrame.screen === "stageClear" && gameOverReturnProbe.afterFinalFrame.reason === "gameOver", "the in-field game-over banner should continue into the shared stage-result screen");
const gameOverStageResultProbe = context.window.TankDefender8.debugGameOverStageResultProbe();
assert(gameOverStageResultProbe.duration === 358 && gameOverStageResultProbe.duration === gameOverStageResultProbe.entry.timer, "game-over stage result should derive its duration from the visible kill counts");
assert(
  gameOverStageResultProbe.entry.screen === "stageClear" &&
    gameOverStageResultProbe.entry.reason === "gameOver" &&
    gameOverStageResultProbe.entry.stage === 5 &&
    gameOverStageResultProbe.entry.elapsed === 0,
  "game over should enter the current stage's result table before the full-screen interstitial"
);
assert(gameOverStageResultProbe.entry.bonusPlayerIds.length === 0 && gameOverStageResultProbe.entry.bonusAwarded === false, "game-over result should suppress the two-player kill-leader bonus");
assert(gameOverStageResultProbe.entry.newHighScore === true, "game-over result should preserve the run-start high-score decision");
assert(gameOverStageResultProbe.visibleRows[0].p1VisibleKills === 5 && gameOverStageResultProbe.visibleRows[0].p2VisibleKills === 2, "game-over result should count the same per-type kill rows as a cleared stage");
assert(gameOverStageResultProbe.visibleRows[1].p1VisibleKills === 1 && gameOverStageResultProbe.visibleRows[2].p2VisibleKills === 1, "game-over result should retain later enemy-type rows");
assert(
  gameOverStageResultProbe.beforeEnd.screen === "stageClear" &&
    gameOverStageResultProbe.beforeEnd.stage === 5 &&
    gameOverStageResultProbe.beforeEnd.timer === 1,
  "game-over result should keep the completed stage number through its final visible frame"
);
assert(gameOverStageResultProbe.beforeEnd.score === gameOverStageResultProbe.scoreBeforeFinish && gameOverStageResultProbe.beforeEnd.bonusAwarded === false, "game-over result should not add the skipped leader bonus before its final frame");
assert(
  gameOverStageResultProbe.afterEnd.screen === "fullGameOver" &&
    gameOverStageResultProbe.afterEnd.stage === 6 &&
    gameOverStageResultProbe.afterEnd.elapsed === 0,
  "finishing the game-over result should advance the stage index and start full-screen game over at frame zero"
);
assert(gameOverStageResultProbe.afterEnd.score === gameOverStageResultProbe.scoreBeforeFinish && gameOverStageResultProbe.afterEnd.bonusAwarded === false, "game-over result should never award the two-player leader bonus");
assert(gameOverStageResultProbe.afterEnd.newHighScore === true && gameOverStageResultProbe.highScoreRoute.screen === "highScore", "the high-score celebration should remain after the result and full-screen game-over sequence");
assert(gameOverStageResultProbe.wrappedStage.screen === "fullGameOver" && gameOverStageResultProbe.wrappedStage.stage === 1, "a stage-70 game-over result should preserve the original extended-loop wrap before full-screen game over");
assert(context.window.TankDefender8.debugStageClearPresentationProbe([20, 0, 0, 0], [0, 0, 0, 0], 0).duration === 8, "a positive custom stage-clear timing should override the dynamic result duration");
assert(context.window.TankDefender8.currentPackInfo().playerUpgradeRules[0].maxBullets === 2, "current pack should expose custom player upgrade rules");
assert(context.window.TankDefender8.currentPackInfo().playerUpgradeRules[0].bulletSpeed === 2.75, "current pack should expose custom player bullet speed");
assert(context.window.TankDefender8.currentPackInfo().playerSpawns[0].x === 3, "current stage should expose custom player spawns");
assert(context.window.TankDefender8.currentPackInfo().enemySpawns[0].x === 1, "current stage should expose custom enemy spawns");
assert(context.window.TankDefender8.currentPackInfo().powerUpSpawns[1].x === 10, "current stage should expose custom power-up spawns");
byAction.one.click();
finishStageSelectClosing();
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.nextSpawn === 5, "custom enemy spawn pacing should control the first default spawn delay");
assert(snapshot.clearPendingTimer === 0, "new stage should not start with stage clear pending");
assert(snapshot.enemySpawnPacing.minDelay === 4, "debug snapshot should expose custom enemy spawn pacing");
assert(snapshot.playerMovement.iceSlideFrames === 3, "debug snapshot should expose custom player movement rules");
assert(snapshot.projectileRules.spawnOffset === 11, "debug snapshot should expose custom projectile rules");
assert(snapshot.friendlyFire.enabled === false, "debug snapshot should expose custom friendly-fire rules");
assert(snapshot.explosionRules.enemyDestroy.color === "#123456", "debug snapshot should expose custom explosion rules");
assert(snapshot.stageAdvance.loopAfterFinalStage === false, "debug snapshot should expose custom stage advance rules");
assert(snapshot.stageClearBonus.points === 777, "debug snapshot should expose custom stage clear bonus");
assert(freePack.totalStages === 35, "free replacement pack should contain 35 stages");
assert(freePack.maps.length === 35, "free replacement pack should contain 35 maps");
assert(freePack.enemies.length === 35, "free replacement pack should contain 35 enemy sequences");
assert(freePack.enemies.every((sequence) => sequence.length === 20), "free replacement pack should keep 20 enemies per stage");
assert(freePack.gameSettings.playerMovement.speed === 1, "generated 35-stage pack should retain one-pixel player movement steps");
assert(freePack.gameSettings.playerMovement.frameCadence.join(",") === "true,true,false,true", "generated 35-stage pack should retain the original player movement cadence");
assert(freePack.gameSettings.friendlyFire.stunFrames === 200, "generated 35-stage pack should retain the original friendly-fire stun ticks");
assert(freePack.gameSettings.timings.stageClearDelay === 128, "generated 35-stage pack should retain the original 128-frame post-stage battle loop");
assert(context.window.TankDefender8.validateStagePack(freePack).ok === true, "free replacement stage pack should validate");
assert(context.window.TankDefender8.loadStagePack(freePack) === true, "free replacement stage pack should load");
assert(context.window.TankDefender8.currentPackInfo().totalStages === 35, "free replacement pack should expose 35 stages");
assert(context.window.TankDefender8.currentPackInfo().enemySequence.filter((enemy) => enemy.carrier).every((enemy) => enemy.powerUpType === null), "free replacement carriers should use random power-up types by default");
const completedStageAdvanceProbe = context.window.TankDefender8.debugCompletedStageAdvanceProbe(1);
assert(completedStageAdvanceProbe.screen === "stageIntro" && completedStageAdvanceProbe.stage === 2, "completed playing stage should automatically start the next stage");
assert(completedStageAdvanceProbe.transitions.some((entry) => entry.screen === "stageClear"), "completed playing stage should enter the result screen before advancing");
assert(completedStageAdvanceProbe.transitions.find((entry) => entry.screen === "stageClear").frame === freePack.gameSettings.timings.stageClearDelay + 1, "stage result should begin only after 128 complete active updates following detection");
const completedStageCloseTransition = completedStageAdvanceProbe.transitions.find((entry) => entry.screen === "stageClearClosing");
const completedStageIntroTransition = completedStageAdvanceProbe.transitions.find((entry) => entry.screen === "stageIntro");
assert(completedStageCloseTransition && completedStageCloseTransition.stage === 1, "the result curtain should begin while the completed stage number is still visible");
assert(completedStageIntroTransition && completedStageIntroTransition.stage === 2, "the next stage number should apply only after the result curtain closes");
assert(completedStageIntroTransition.frame - completedStageCloseTransition.frame === 16, "the result curtain should close over exactly sixteen display frames");
const completedLowKillAdvanceProbe = context.window.TankDefender8.debugCompletedStageAdvanceProbe(1, 0);
assert(completedLowKillAdvanceProbe.screen === "stageIntro" && completedLowKillAdvanceProbe.stage === 2, "cleared stages should advance even if kill-table credit is lower than the enemy total");
assert(completedLowKillAdvanceProbe.transitions.some((entry) => entry.screen === "stageClear"), "low-credit cleared stages should still show the result screen before advancing");
const stageClearAdvanceProbe = context.window.TankDefender8.debugStageClearAdvanceProbe(1);
assert(stageClearAdvanceProbe.screen === "stageIntro" && stageClearAdvanceProbe.stage === 2, "stage clear completion should automatically start the next stage");
assert(stageClearAdvanceProbe.enemySpawned === 0 && stageClearAdvanceProbe.clearPendingTimer === 0, "new stage should reset stage-clear and enemy-spawn counters");
assert(stageClearAdvanceProbe.closingStart.screen === "stageClearClosing" && stageClearAdvanceProbe.closingStart.stage === 1 && stageClearAdvanceProbe.closingStart.transitionTimer === 16, "stage result completion should enter a separate sixteen-frame curtain state");
assert(stageClearAdvanceProbe.closingStart.curtain.coverRows === 0 && stageClearAdvanceProbe.closingFirstStep.curtain.coverRows === 1, "the result curtain should close from the top and bottom one row at a time");
assert(stageClearAdvanceProbe.closingLastStep.transitionTimer === 1 && stageClearAdvanceProbe.closingLastStep.curtain.coverRows === 15, "the final result-curtain frame should fully cover all thirty rows");
assert(context.window.TankDefender8.currentPackInfo().stageCycleLimit === 70, "free replacement pack should run the original-style 70-stage cycle");
assert(context.window.TankDefender8.currentPackInfo().enemyTotal === 20, "free replacement stage should expose 20 enemies");
assert(context.window.TankDefender8.currentPackInfo().enemySpawnPacing.baseDelay === 190, "free replacement pack should expose original spawn pacing");
assert(context.window.TankDefender8.currentPackInfo().enemySpawnPacing.extendedLoopMinDelay === 50, "free replacement pack should expose stage-35 extended-loop pacing");
assert(context.window.TankDefender8.currentPackInfo().playerMovement.frameCadence.join(",") === "true,true,false,true", "free replacement pack should apply the original player movement cadence at runtime");
assert(context.window.TankDefender8.currentPackInfo().friendlyFire.stunFrames === 200, "free replacement pack should apply the original friendly-fire stun ticks at runtime");
assert(context.window.TankDefender8.currentPackInfo().projectileRules.bulletSize === 4, "free replacement pack should expose default projectile rules");
assert(context.window.TankDefender8.currentPackInfo().explosionRules.enemyDestroy.ttl === 18, "free replacement pack should expose default explosion rules");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[2].speed === 0.5 && context.window.TankDefender8.currentPackInfo().enemyTypes[3].speed === 0.5, "free replacement pack should expose alternate-frame movement for power and armor enemies");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[1].bullet === 2 && context.window.TankDefender8.currentPackInfo().enemyTypes[2].bullet === 4, "free replacement pack should expose exact enemy bullet speed tiers");
const stage35CycleProbe = context.window.TankDefender8.debugStageCycleProbe(35);
const stage36CycleProbe = context.window.TankDefender8.debugStageCycleProbe(36);
const stage70CycleProbe = context.window.TankDefender8.debugStageCycleProbe(70);
assert(stage35CycleProbe.advance.stage === 36 && stage35CycleProbe.advance.wraps === false, "original-style stage 35 should advance to stage 36");
assert(stableJson(stage36CycleProbe.enemyTypeCounts) === stableJson(stage35CycleProbe.enemyTypeCounts), "stage 36 enemy group should match stage 35");
assert(stage36CycleProbe.carrierNumbers.join(",") === stage35CycleProbe.carrierNumbers.join(","), "stage 36 carriers should match stage 35");
assert(stage35CycleProbe.defaultEnemySpawnDelay === 50, "stage 35 should use the original fifty-frame interval value");
assert(stage36CycleProbe.defaultEnemySpawnDelay === stage35CycleProbe.defaultEnemySpawnDelay, "stage 36 should retain the stage-35 enemy spawn interval");
assert(stage35CycleProbe.twoPlayerDefaultEnemySpawnDelay === 30, "two-player mode should subtract twenty frames from the stage-35 interval");
assert(stage35CycleProbe.firstEnemySpawnDelay === 0 && stage35CycleProbe.twoPlayerFirstEnemySpawnDelay === 0, "the first enemy should spawn immediately in both player modes");
assert(stage35CycleProbe.onePlayerMaxActiveEnemies === 4 && stage35CycleProbe.twoPlayerMaxActiveEnemies === 6, "original modes should expose four and six enemy slots");
assert(stage35CycleProbe.spawnIndices.slice(0, 6).join(",") === "1,2,0,1,2,0", "enemy spawn points should cycle center, right, left");
assert(stage70CycleProbe.advance.wraps === true && stage70CycleProbe.advance.stage === 1, "original-style stage 70 should wrap to stage 1");
const stageCyclePreserveProbe = context.window.TankDefender8.debugStageCyclePreservesPlayerStateProbe(70);
assert(stageCyclePreserveProbe.screen === "stageIntro" && stageCyclePreserveProbe.stage === 1, "original-style cycle completion should start a new stage 1");
assert(stageCyclePreserveProbe.score === 54321, "original-style cycle completion should preserve player score");
assert(stageCyclePreserveProbe.level === 3, "original-style cycle completion should preserve player power level");
assert(stageCyclePreserveProbe.lives === 4, "original-style cycle completion should preserve remaining lives");
assert(stageCyclePreserveProbe.stagePoints === 0, "new cycle stage should reset per-stage points");
assert(stageCyclePreserveProbe.stageKills.every((count) => count === 0), "new cycle stage should reset per-stage kill counters");
assert(stageCyclePreserveProbe.totalKills.join(",") === "7,5,3,1", "new cycle stage should preserve cumulative kill counters");
assert(stageCyclePreserveProbe.enemySpawned === 0 && stageCyclePreserveProbe.clearPendingTimer === 0, "new cycle stage should reset spawn and clear timers");
assert(stageCyclePreserveProbe.powerUp === null && stageCyclePreserveProbe.lastPowerUpSpawn === null, "new cycle stage should clear active and remembered power-up state");
assert(context.window.TankDefender8.currentPackInfo().stageClearBonus.points === 1000, "free replacement pack should expose default stage clear bonus");
assert(carrierNumbers(context.window.TankDefender8.currentPackInfo().enemySequence) === "4,11,18", "free replacement pack should preserve carrier positions");
assert(context.window.TankDefender8.loadStagePack(quadrantPack) === true, "quadrant stage pack should reload after free pack");
byAction.one.click();
finishStageSelectClosing();
keyPress("Enter");
canvasContext.calls.length = 0;
assert(typeof animationFrameCallback === "function", "animation frame callback should be registered");
animationFrameCallback(1000);
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.players[0].lives === 3, "sample pack should start with configured initial lives");
assert(snapshot.enemyTypes[3].score === 400, "sample pack should expose configured enemy type scores");
assert(snapshot.enemyTypes[3].hitColors[1] === "#9aa2ad", "sample pack should expose armor hit colors");
assert(context.window.TankDefender8.debugEnemyColorProbe(3, 1) === "#b0b5c3", "sample armor low HP should use gray hit color");
assert(context.window.TankDefender8.debugEnemyColorProbe(3, 4) === "#7fba72", "sample armor full HP should use green base hit color");
assert(snapshot.enemyTypes.every((enemy) => enemy.wallPower === 1), "sample pack enemy bullets should not destroy steel");
assert(snapshot.enemyTypes[0].speed === 0.5 && snapshot.enemyTypes[2].speed === 0.5 && snapshot.enemyTypes[3].speed === 0.5 && snapshot.enemyTypes[1].speed === 1, "sample pack should expose exact enemy movement speed tiers");
assert(snapshot.enemyTypes[0].bullet === 2 && snapshot.enemyTypes[1].bullet === 2 && snapshot.enemyTypes[2].bullet === 4 && snapshot.enemyTypes[3].bullet === 2, "sample pack should expose exact enemy bullet speed tiers");
assert(snapshot.players[0].level === 0, "new player should start at base power level");
assert(snapshot.deathPowerLevel === 0, "sample pack should use base power level after death");
assert(snapshot.powerUpDurations.shovel === 20, "sample pack should use configured shovel timer units");
assert(snapshot.powerUpDurations.shovelFlash === 4, "sample pack should use configured shovel flash threshold");
assert(snapshot.powerUpRules.carrierRelease === "hit", "sample pack should use hit-based carrier release rule");
assert(snapshot.powerUpRules.pickupScore === 500, "sample pack should use configured power-up pickup score");
assert(snapshot.timings.stageClearDelay === 128, "sample pack should use the original 128-frame stage clear delay");
assert(snapshot.timings.playerInvulnerability === 3, "sample pack should use configured post-spawn shield units");
assert(snapshot.timings.powerUpTtl === 0, "sample pack should use non-expiring default power-up TTL");
assert(snapshot.enemySpawnPacing.stageStep === 4, "sample pack should expose original enemy spawn pacing");
assert(snapshot.enemySpawnPacing.twoPlayerDelayReduction === 20, "sample pack should expose two-player enemy spawn acceleration");
assert(snapshot.playerMovement.speed === 1, "sample pack should expose player movement rules");
assert(snapshot.playerMovement.frameCadence.join(",") === "true,true,false,true", "sample pack should expose the original player movement cadence");
assert(snapshot.playerMovement.iceSlideFrames === 28 && snapshot.playerMovement.iceSlideSpeed === 1, "sample pack should expose the original ice inertia rules");
assert(snapshot.projectileRules.spawnOffset === 9, "sample pack should expose projectile rules");
assert(snapshot.friendlyFire.enabled === true && snapshot.friendlyFire.stunFrames === 200, "sample pack should expose friendly-fire stun rules");
assert(context.window.TankDefender8.debugFriendlyFireProbe().stunFrames === 200, "default friendly-fire should stun the other player");
assert(snapshot.explosionRules.enemyDestroy.ttl === 18, "sample pack should expose enemy destruction explosion rules");
assert(context.window.TankDefender8.debugExplosionRuleProbe("baseDestroy").ttl === 35, "default base destruction should use the original thirty-five visible-frame timing");
assert(snapshot.stageAdvance.loopAfterFinalStage === true, "sample pack should expose final-stage loop rule");
assert(snapshot.stageClearBonus.points === 1000, "sample pack should expose stage clear bonus");
assert(snapshot.enemyAi.intersectionTurnChance === 1 / 16 && snapshot.enemyAi.blockedRetryChance === 3 / 4, "sample pack should expose original enemy AI rolls");
assert(snapshot.playerUpgradeRules[3].wallPower === 3, "sample pack should expose player upgrade rules");
assert(snapshot.timerFreezesEnemyTime === true, "sample pack should freeze enemy time during timer");
assert(snapshot.powerUpSpawns.length === 16, "sample pack should expose power-up spawn points");
assert(snapshot.players[0].stagePoints === 0, "new stage should reset stage points");
assert(snapshot.players[0].stageKills.every((count) => count === 0), "new stage should reset stage kill counts");
assert(snapshot.panelEnemyCounter === 20, "new stage panel counter should show all reserve enemies before spawning");
assert(snapshot.nextSpawn === 70, "stage should use the first enemy spawnDelay");
assert(snapshot.players[0].spawnFlash === snapshot.timings.playerSpawnFlash, "new player should start with the spawn flash timer");
assert(snapshot.players[0].invuln === 0, "new player protection should wait until the spawn animation completes");
assert(!canvasContext.calls.some((call) => call.op === "strokeRect" && (call.style === "#f3f0d4" || call.style === "#e0b84b") && call.w <= 14 && call.h <= 14), "stage-intro loading should not draw player spawn sprites before tank preparation finishes");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#173b67" && call.w === 16 && call.h === 16), "render should draw terrain sprite parts from the manifest");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#d8c17a" && call.w === 10 && call.h === 10), "render should draw base sprite parts from the manifest");
assert(!canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#15161a" && call.w === 7 && call.h === 6), "stage-intro loading should not draw the side-panel enemy icons early");

context.window.TankDefender8.debugAdvanceStageTransition(context.window.TankDefender8.debugStageIntroCurtainProbe().remaining);
canvasContext.calls.length = 0;
animationFrameCallback(1017);
assert(canvasContext.calls.some((call) => call.op === "strokeRect" && (call.style === "#f3f0d4" || call.style === "#e0b84b") && call.w <= 14 && call.h <= 14), "the prepared battle frame should draw player spawn outline sprite parts");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#15161a" && call.w === 7 && call.h === 6), "the prepared battle frame should draw enemy counter sprite parts");

canvasContext.calls.length = 0;
for (let i = 0; i < 50; i += 1) {
  animationFrameCallback(1100 + i * 100);
}
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.w === 4 && call.h === 12), "render should draw tank sprite parts from the manifest after the spawn flash");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.w === 2 && call.h === 6), "render should draw directional tank barrel parts from the manifest after the spawn flash");
assert(canvasContext.calls.some((call) => call.op === "strokeRect" && call.w === 18 && call.h === 18), "render should draw shield outline sprite parts from the manifest after the spawn flash");
assert(canvasContext.calls.some((call) => call.op === "strokeRect" && (call.style === "#f3f0d4" || call.style === "#e0b84b") && call.w <= 14 && call.h <= 14), "render should draw spawn outline sprite parts from the manifest");

canvasContext.calls.length = 0;
const iceCoverProbe = context.window.TankDefender8.debugIceCoverRenderProbe();
const bulletDrawIndex = canvasContext.calls.findIndex((call) => call.op === "fillRect" && call.style === "#f8e08b" && call.w === 4 && call.h === 4);
const iceCoverIndex = canvasContext.calls.findIndex((call) => call.op === "fillRect" && call.style === iceCoverProbe.iceCoverColor && call.w === 10 && call.h === 1);
assert(bulletDrawIndex !== -1, "render should draw a player bullet after firing");
assert(iceCoverIndex !== -1, "render should draw the ice projectile cover layer");
assert(iceCoverIndex > bulletDrawIndex, "ice should visually obfuscate flying bullets by drawing after bullets");
canvasContext.calls.length = 0;
const forestPowerProbe = context.window.TankDefender8.debugForestPowerUpLayerProbe();
const forestBulletIndex = canvasContext.calls.findIndex((call) => call.op === "fillRect" && call.style === forestPowerProbe.bulletColor && call.w === 4 && call.h === 4);
const forestCoverIndex = canvasContext.calls.findIndex((call) => call.op === "fillRect" && call.style === forestPowerProbe.forestColor && call.w === 16 && call.h === 16);
const forestPowerFrameIndex = canvasContext.calls.findIndex((call) =>
  call.op === "fillRect" &&
  call.style === forestPowerProbe.powerFrameColor &&
  call.x === forestPowerProbe.powerRect.x &&
  call.y === forestPowerProbe.powerRect.y &&
  call.w === forestPowerProbe.powerRect.w &&
  call.h === forestPowerProbe.powerRect.h
);
assert(forestBulletIndex !== -1, "forest layer probe should draw a bullet under the forest");
assert(forestCoverIndex !== -1, "forest layer probe should draw the forest cover");
assert(forestPowerFrameIndex !== -1, "forest layer probe should draw the power-up frame");
assert(forestCoverIndex > forestBulletIndex, "forest should visually obfuscate flying bullets");
assert(forestPowerFrameIndex > forestCoverIndex, "power-ups should render above forest cover");
const baseWallPriorityProbe = context.window.TankDefender8.debugBaseWallPriorityProbe();
assert(baseWallPriorityProbe.shielded.baseAlive === true, "base wall should absorb a bullet before the base is destroyed");
assert(baseWallPriorityProbe.shielded.bulletRemoved === true, "base-shielding wall should consume the bullet");
assert(baseWallPriorityProbe.shielded.screen === "playing", "base should not enter game over while its wall absorbs the hit");
assert(baseWallPriorityProbe.shielded.explosions.length === 1, "base-shielding wall should produce only its own bullet impact");
assert(baseWallPriorityProbe.exposed.baseAlive === false, "exposed base should be destroyed by an overlapping bullet");
assert(baseWallPriorityProbe.exposed.screen === "playing" && baseWallPriorityProbe.exposed.baseDestroyTimer === 39, "exposed base destruction should load the original pre-banner countdown");
assert(baseWallPriorityProbe.exposed.explosions.length === 0 && baseWallPriorityProbe.exposed.presentation === null, "the hit frame should show only the destroyed base before the first HQ explosion frame");
fileInput.files = [{ text: async () => JSON.stringify(validPack) }];
assert(typeof fileInput.listeners.change === "function", "file input change listener missing");
Promise.resolve(fileInput.listeners.change()).then(() => {
  assert(fileInput.value === "", "file input value should reset after import");
  console.log("smoke-test passed");
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
