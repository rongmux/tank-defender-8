const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../tests/helpers/browser-game-harness");

const root = path.resolve(__dirname, "..");
const quadrantPack = JSON.parse(fs.readFileSync(path.join(root, "data", "sample-quadrant-stage-pack.json"), "utf8"));
const freePack = JSON.parse(fs.readFileSync(path.join(root, "data", "free-35-stage-pack.json"), "utf8"));
const spriteManifest = JSON.parse(fs.readFileSync(path.join(root, "data", "free-sprite-manifest.json"), "utf8"));

const {
  context,
  source,
  actions,
  buttons,
  listeners,
  storage,
  clipboard,
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
const scoreCountAudioLifecycleProbe = context.window.TankDefender8.debugScoreCountAudioLifecycleProbe();
assert(scoreCountAudioLifecycleProbe.simultaneous.active && scoreCountAudioLifecycleProbe.simultaneous.frame === 0 && scoreCountAudioLifecycleProbe.simultaneous.elapsed === 32, "the first result count should start its paired cue on result frame 32");
assert(scoreCountAudioLifecycleProbe.simultaneous.visibleKills === 2 && scoreCountAudioLifecycleProbe.simultaneous.voices.filter(Boolean).length === 2, "both players counting on the same frame should produce one simultaneous two-voice event");
assert(scoreCountAudioLifecycleProbe.nextCadence.active && scoreCountAudioLifecycleProbe.nextCadence.frame === 0 && scoreCountAudioLifecycleProbe.nextCadence.elapsed === 41 && scoreCountAudioLifecycleProbe.nextCadence.visibleKills === 3, "the next visible result count should retrigger once after the original nine-frame cadence");
assert(!scoreCountAudioLifecycleProbe.zeroKills.active && scoreCountAudioLifecycleProbe.zeroKills.frame === 0, "a zero-kill result should not start count audio");
const stageBonusAudioProbe = context.window.TankDefender8.debugStageBonusAudioProbe();
assert(stageBonusAudioProbe.durationFrames === 28 && stageBonusAudioProbe.voiceDurations.join(",") === "28", "the result leader bonus should contain one twenty-eight-frame voice");
assert(stageBonusAudioProbe.waves.join(",") === "square", "the result leader bonus should retain its pulse-two replacement voice");
assert(stageBonusAudioProbe.frames.filter((frame) => [0, 3, 6, 9, 12, 15, 18].includes(frame.frame)).map((frame) => frame.voices[0].frequency).join(",") === "988,659,659,784,784,988,988", "the result leader bonus should preserve the original seven-note pitch order");
assert(stageBonusAudioProbe.frames.find((frame) => frame.frame === 27).voices[0].frequency === 988, "the final result bonus note should remain active through frame twenty-seven");
assert(stageBonusAudioProbe.frames.find((frame) => frame.frame === 28).voices[0] === null, "the result bonus voice should stop on frame twenty-eight");
const stageBonusAudioLifecycleProbe = context.window.TankDefender8.debugStageBonusAudioLifecycleProbe();
assert(stageBonusAudioLifecycleProbe.awarded.active && stageBonusAudioLifecycleProbe.awarded.frame === 0 && stageBonusAudioLifecycleProbe.awarded.frequency === 988 && stageBonusAudioLifecycleProbe.awarded.audible, "revealing a strict two-player leader should start the audible result bonus cue at frame zero");
assert(stageBonusAudioLifecycleProbe.awarded.elapsed === stageBonusAudioLifecycleProbe.bonusRevealFrame && stageBonusAudioLifecycleProbe.awarded.recipients.join(",") === "1", "the result bonus cue should start exactly on the leader bonus reveal frame");
assert(stageBonusAudioLifecycleProbe.awarded.scoreDelta === 1000 && stageBonusAudioLifecycleProbe.awarded.bonusAwarded, "the cue should accompany the original one-thousand-point leader award");
assert(stageBonusAudioLifecycleProbe.finalFrame.active && stageBonusAudioLifecycleProbe.finalFrame.frame === 27 && stageBonusAudioLifecycleProbe.finalFrame.frequency === 988 && stageBonusAudioLifecycleProbe.finalFrame.audible, "the result bonus cue should stay audible through its final frame");
assert(!stageBonusAudioLifecycleProbe.end.active && stageBonusAudioLifecycleProbe.end.frame === 28 && stageBonusAudioLifecycleProbe.end.scoreDelta === 1000, "the result bonus cue should end once without awarding the score twice");
assert(stageBonusAudioLifecycleProbe.bonusLifePriority.scoreDelta === 1000 && stageBonusAudioLifecycleProbe.bonusLifePriority.livesDelta === 1, "crossing the 20000-point threshold with the result bonus should still award both points and one reserve life");
assert(!stageBonusAudioLifecycleProbe.tied.active && stageBonusAudioLifecycleProbe.tied.recipients.length === 0 && stageBonusAudioLifecycleProbe.tied.score === 0, "a tied two-player result should neither award nor play the leader bonus");
assert(!stageBonusAudioLifecycleProbe.gameOver.active && !stageBonusAudioLifecycleProbe.gameOver.bonusAwarded && stageBonusAudioLifecycleProbe.gameOver.score === 0, "a game-over result should not award or play the leader bonus");
assert(!stageBonusAudioLifecycleProbe.stageCleanup.active && stageBonusAudioLifecycleProbe.stageCleanup.frame === 0, "starting the next stage should clear any pending result bonus cue");
const brickHitAudioProbe = context.window.TankDefender8.debugBrickHitAudioProbe();
assert(brickHitAudioProbe.durationFrames === 3 && brickHitAudioProbe.voiceDurations.join(",") === "3", "destructive wall impact audio should contain one three-frame voice");
assert(brickHitAudioProbe.waves.join(",") === "triangle", "destructive wall impact audio should retain its triangle replacement voice");
assert(brickHitAudioProbe.frames.slice(0, 3).map((frame) => frame.voices[0].frequency).join(",") === "165,246,139", "destructive wall impact audio should follow the original three one-frame pitches");
assert(brickHitAudioProbe.frames[3].voices[0] === null, "destructive wall impact audio should stop on frame three");
const brickHitAudioLifecycleProbe = context.window.TankDefender8.debugBrickHitAudioLifecycleProbe();
assert(brickHitAudioLifecycleProbe.playerBrick.active && brickHitAudioLifecycleProbe.playerBrick.frame === 0 && brickHitAudioLifecycleProbe.playerBrick.audible, "a player brick impact should start destructive wall audio at frame zero");
assert(brickHitAudioLifecycleProbe.playerBrick.hit && brickHitAudioLifecycleProbe.playerBrick.bulletRemoved && brickHitAudioLifecycleProbe.playerBrick.wallBrickMask !== 0xffff && brickHitAudioLifecycleProbe.playerBrick.explosionCount === 1, "a player brick impact should remove the bullet, damage brick fragments, and create one impact");
assert(brickHitAudioLifecycleProbe.playerBrick.movementAudioMode === "enemy" && brickHitAudioLifecycleProbe.beforePause.active && brickHitAudioLifecycleProbe.beforePause.frame === 2, "the independent triangle cue should leave movement audio running through frame two");
assert(brickHitAudioLifecycleProbe.paused.paused && brickHitAudioLifecycleProbe.paused.frame === 2 && !brickHitAudioLifecycleProbe.paused.audible && brickHitAudioLifecycleProbe.paused.pauseFrame === 10, "pause should mute and freeze destructive wall audio while its pause cue advances");
assert(!brickHitAudioLifecycleProbe.end.active && brickHitAudioLifecycleProbe.end.frame === 3 && brickHitAudioLifecycleProbe.end.pauseActive && brickHitAudioLifecycleProbe.end.movementAudioMode === "none", "resuming should finish destructive wall audio on frame three while the pause cue retains pulse-two priority");
assert(!brickHitAudioLifecycleProbe.enemyBrick.active && brickHitAudioLifecycleProbe.enemyBrick.frame === 0 && brickHitAudioLifecycleProbe.enemyBrick.hit && brickHitAudioLifecycleProbe.enemyBrick.bulletRemoved && brickHitAudioLifecycleProbe.enemyBrick.wallMask === 15 && brickHitAudioLifecycleProbe.enemyBrick.explosionCount === 1, "an ordinary enemy brick impact should remain silent while retaining wall damage and collision feedback");
assert(brickHitAudioLifecycleProbe.destructibleSteel.active && brickHitAudioLifecycleProbe.destructibleSteel.audible && brickHitAudioLifecycleProbe.destructibleSteel.hit && brickHitAudioLifecycleProbe.destructibleSteel.bulletRemoved && brickHitAudioLifecycleProbe.destructibleSteel.wallMask === 14, "a max-power player shot destroying steel should use destructive wall audio");
assert(!brickHitAudioLifecycleProbe.stageStartSuppressedEnd.active && brickHitAudioLifecycleProbe.stageStartSuppressedEnd.frame === 3, "a stage-start-masked destructive wall impact should still consume its complete three-frame lifetime");
assert(!brickHitAudioLifecycleProbe.stageCleanup.active && brickHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear any pending destructive wall cue");
const steelHitAudioProbe = context.window.TankDefender8.debugSteelHitAudioProbe();
assert(steelHitAudioProbe.durationFrames === 4 && steelHitAudioProbe.voiceDurations.join(",") === "4", "steel-hit audio should contain one four-frame voice");
assert(steelHitAudioProbe.waves.join(",") === "square", "steel-hit audio should retain its pulse-like replacement voice");
assert(steelHitAudioProbe.frames[0].voices[0].frequency === 1045 && steelHitAudioProbe.frames[1].voices[0].frequency === 1045, "the first steel-hit pitch should hold through frame one");
assert(steelHitAudioProbe.frames[2].voices[0].frequency === 2072 && steelHitAudioProbe.frames[3].voices[0].frequency === 2072, "the second steel-hit pitch should span frames two and three");
assert(steelHitAudioProbe.frames[4].voices[0] === null, "steel-hit audio should stop on frame four");
const steelHitAudioLifecycleProbe = context.window.TankDefender8.debugSteelHitAudioLifecycleProbe();
assert(steelHitAudioLifecycleProbe.playerBoundary.active && steelHitAudioLifecycleProbe.playerBoundary.frame === 0 && steelHitAudioLifecycleProbe.playerBoundary.audible, "a player boundary impact should start steel-hit audio at frame zero");
assert(steelHitAudioLifecycleProbe.playerBoundary.bulletRemoved && steelHitAudioLifecycleProbe.playerBoundary.explosionCount === 1 && steelHitAudioLifecycleProbe.playerBoundary.movementAudioMode === "none", "a player boundary impact should remove the bullet, create one impact, and reserve the movement pulse channel");
assert(steelHitAudioLifecycleProbe.beforePause.active && steelHitAudioLifecycleProbe.beforePause.frame === 3, "steel-hit audio should remain active through frame three");
assert(steelHitAudioLifecycleProbe.paused.paused && steelHitAudioLifecycleProbe.paused.frame === 3 && !steelHitAudioLifecycleProbe.paused.audible && steelHitAudioLifecycleProbe.paused.pauseFrame === 10, "pause should mute and freeze steel-hit audio while its pause cue advances");
assert(!steelHitAudioLifecycleProbe.end.active && steelHitAudioLifecycleProbe.end.frame === 4 && steelHitAudioLifecycleProbe.end.pauseActive && steelHitAudioLifecycleProbe.end.movementAudioMode === "none", "resuming should finish the masked final steel-hit frame while the unfinished pause cue keeps pulse-two priority");
assert(!steelHitAudioLifecycleProbe.enemyBoundary.active && steelHitAudioLifecycleProbe.enemyBoundary.frame === 0 && steelHitAudioLifecycleProbe.enemyBoundary.bulletRemoved && steelHitAudioLifecycleProbe.enemyBoundary.explosionCount === 1, "an enemy boundary impact should remain silent while retaining collision feedback");
assert(!steelHitAudioLifecycleProbe.appearanceSuppressedEnd.active && steelHitAudioLifecycleProbe.appearanceSuppressedEnd.frame === 4, "an appearance-masked steel hit should still consume its complete four-frame lifetime");
assert(!steelHitAudioLifecycleProbe.stageStartSuppressedEnd.active && steelHitAudioLifecycleProbe.stageStartSuppressedEnd.frame === 4, "a stage-start-masked steel hit should still consume its complete four-frame lifetime");
assert(!steelHitAudioLifecycleProbe.stageCleanup.active && steelHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear any pending steel-hit cue");
const enemyHitAudioProbe = context.window.TankDefender8.debugEnemyHitAudioProbe();
assert(enemyHitAudioProbe.durationFrames === 5 && enemyHitAudioProbe.voiceDurations.join(",") === "3", "surviving armored-enemy hit audio should retain a five-frame event with three audible frames");
assert(enemyHitAudioProbe.waves.join(",") === "square", "surviving armored-enemy hit audio should retain its pulse-like replacement voice");
assert(enemyHitAudioProbe.frames[0].voices[0].frequency === 2601, "the first armored-hit pitch should last one frame");
assert(enemyHitAudioProbe.frames[1].voices[0].frequency === 2728 && enemyHitAudioProbe.frames[2].voices[0].frequency === 2728, "the second armored-hit pitch should last two frames");
assert(enemyHitAudioProbe.frames[3].voices[0] === null && enemyHitAudioProbe.frames[4].voices[0] === null && enemyHitAudioProbe.frames[5].voices[0] === null, "armored-hit audio should preserve its two silent tail frames and stop on frame five");
const enemyHitAudioLifecycleProbe = context.window.TankDefender8.debugEnemyHitAudioLifecycleProbe();
assert(enemyHitAudioLifecycleProbe.armoredHit.active && enemyHitAudioLifecycleProbe.armoredHit.frame === 0 && enemyHitAudioLifecycleProbe.armoredHit.audible && enemyHitAudioLifecycleProbe.armoredHit.frequency === 2601, "a surviving armored-enemy hit should start its first pulse pitch at frame zero");
assert(enemyHitAudioLifecycleProbe.armoredHit.hit && enemyHitAudioLifecycleProbe.armoredHit.bulletRemoved && enemyHitAudioLifecycleProbe.armoredHit.enemyAlive && enemyHitAudioLifecycleProbe.armoredHit.enemyHp === 1 && enemyHitAudioLifecycleProbe.armoredHit.explosionCount === 1, "the real armored collision should remove the bullet, reduce one hit point, and retain the enemy");
assert(enemyHitAudioLifecycleProbe.armoredHit.movementAudioMode === "none" && enemyHitAudioLifecycleProbe.secondPitch.active && enemyHitAudioLifecycleProbe.secondPitch.frame === 1 && enemyHitAudioLifecycleProbe.secondPitch.frequency === 2728, "the second pulse channel should suppress movement and switch pitch on frame one");
assert(enemyHitAudioLifecycleProbe.silentTail.active && enemyHitAudioLifecycleProbe.silentTail.frame === 3 && !enemyHitAudioLifecycleProbe.silentTail.voiceActive && !enemyHitAudioLifecycleProbe.silentTail.audible && enemyHitAudioLifecycleProbe.silentTail.movementAudioMode === "none", "the two-frame muted tail should retain pulse-two ownership without producing a tone");
assert(enemyHitAudioLifecycleProbe.paused.paused && enemyHitAudioLifecycleProbe.paused.frame === 3 && enemyHitAudioLifecycleProbe.paused.pauseFrame === 10 && enemyHitAudioLifecycleProbe.paused.movementAudioMode === "none", "pause should freeze the armored-hit silent tail while the pause cue advances");
assert(!enemyHitAudioLifecycleProbe.end.active && enemyHitAudioLifecycleProbe.end.frame === 5 && enemyHitAudioLifecycleProbe.end.pauseActive && enemyHitAudioLifecycleProbe.end.movementAudioMode === "none", "resuming should finish the five-frame armored-hit event while the pause cue keeps pulse-two priority");
assert(!enemyHitAudioLifecycleProbe.lethalHit.active && enemyHitAudioLifecycleProbe.lethalHit.enemyDestroyActive && enemyHitAudioLifecycleProbe.lethalHit.enemyDestroyFrame === 0 && enemyHitAudioLifecycleProbe.lethalHit.hit && enemyHitAudioLifecycleProbe.lethalHit.bulletRemoved && enemyHitAudioLifecycleProbe.lethalHit.enemyAlive && enemyHitAudioLifecycleProbe.lethalHit.enemyDestroying && enemyHitAudioLifecycleProbe.lethalHit.enemyHp === 0 && enemyHitAudioLifecycleProbe.lethalHit.enemyKilled === 0 && enemyHitAudioLifecycleProbe.lethalHit.explosionCount === 1, "a lethal enemy hit should start the retained destruction lifecycle instead of armored-hit audio");
assert(!enemyHitAudioLifecycleProbe.friendlyHit.active && enemyHitAudioLifecycleProbe.friendlyHit.hit && enemyHitAudioLifecycleProbe.friendlyHit.bulletRemoved && enemyHitAudioLifecycleProbe.friendlyHit.stun === 200 && enemyHitAudioLifecycleProbe.friendlyHit.explosionCount === 1, "friendly-fire stun should remain silent for the armored-hit event");
assert(!enemyHitAudioLifecycleProbe.playerHit.active && enemyHitAudioLifecycleProbe.playerHit.playerDestroyActive && enemyHitAudioLifecycleProbe.playerHit.playerDestroyFrame === 0 && enemyHitAudioLifecycleProbe.playerHit.hit && enemyHitAudioLifecycleProbe.playerHit.bulletRemoved && !enemyHitAudioLifecycleProbe.playerHit.playerAlive && enemyHitAudioLifecycleProbe.playerHit.playerDestroying && enemyHitAudioLifecycleProbe.playerHit.playerRespawn === 24 && enemyHitAudioLifecycleProbe.playerHit.explosionCount === 1, "an enemy bullet destroying a player should retain the player death state and start its noise without triggering armored-hit audio");
assert(!enemyHitAudioLifecycleProbe.steelSuppressedEnd.active && enemyHitAudioLifecycleProbe.steelSuppressedEnd.frame === 5, "a steel-masked armored hit should still consume its complete five-frame lifetime");
assert(!enemyHitAudioLifecycleProbe.stageCleanup.active && enemyHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending armored-hit audio");
const enemyDestroyAudioProbe = context.window.TankDefender8.debugEnemyDestroyAudioProbe();
assert(enemyDestroyAudioProbe.durationFrames === 14 && enemyDestroyAudioProbe.voiceDurations.join(",") === "14", "enemy destruction audio should contain one fourteen-frame noise voice");
assert(enemyDestroyAudioProbe.waves.join(",") === "noise-long", "enemy destruction audio should retain its long-period noise replacement voice");
assert(enemyDestroyAudioProbe.frames.slice(0, 6).every((frame) => frame.voices[0].frequency === 3523), "enemy destruction should retain the original noise timer rate throughout all audible frames");
assert(enemyDestroyAudioProbe.frames[0].voices[0].gain === 0.05 && enemyDestroyAudioProbe.frames[1].voices[0].gain === 0.05, "the first enemy destruction envelope should span frames zero and one");
assert(enemyDestroyAudioProbe.frames[2].voices[0].gain === 0.045 && enemyDestroyAudioProbe.frames[3].voices[0].gain === 0.045, "the second enemy destruction envelope should span frames two and three");
assert(enemyDestroyAudioProbe.frames[4].voices[0].gain === 0.022 && enemyDestroyAudioProbe.frames[5].voices[0].gain === 0.022, "the enemy destruction tail should span frames four through thirteen");
assert(enemyDestroyAudioProbe.frames[6].voices[0] === null, "enemy destruction noise should stop on frame fourteen");
const enemyDestroyAudioLifecycleProbe = context.window.TankDefender8.debugEnemyDestroyAudioLifecycleProbe();
assert(enemyDestroyAudioLifecycleProbe.lethalHit.active && enemyDestroyAudioLifecycleProbe.lethalHit.frame === 0 && enemyDestroyAudioLifecycleProbe.lethalHit.audible && enemyDestroyAudioLifecycleProbe.lethalHit.wave === "noise-long", "a lethal player shot should start enemy destruction noise at frame zero");
assert(enemyDestroyAudioLifecycleProbe.lethalHit.hit && enemyDestroyAudioLifecycleProbe.lethalHit.bulletRemoved && enemyDestroyAudioLifecycleProbe.lethalHit.enemyAlive && enemyDestroyAudioLifecycleProbe.lethalHit.enemyDestroying && enemyDestroyAudioLifecycleProbe.lethalHit.enemyKilled === 0 && enemyDestroyAudioLifecycleProbe.lethalHit.explosionCount === 1 && !enemyDestroyAudioLifecycleProbe.lethalHit.enemyHitActive, "a lethal shot should retain the enemy slot during destruction and avoid the surviving-armored-hit pulse cue");
assert(enemyDestroyAudioLifecycleProbe.secondEnvelope.active && enemyDestroyAudioLifecycleProbe.secondEnvelope.frame === 2 && enemyDestroyAudioLifecycleProbe.secondEnvelope.gain === 0.045, "enemy destruction should switch to its second envelope on frame two");
assert(enemyDestroyAudioLifecycleProbe.tailEnvelope.active && enemyDestroyAudioLifecycleProbe.tailEnvelope.frame === 4 && enemyDestroyAudioLifecycleProbe.tailEnvelope.gain === 0.022, "enemy destruction should enter its ten-frame tail on frame four");
assert(enemyDestroyAudioLifecycleProbe.paused.active && enemyDestroyAudioLifecycleProbe.paused.frame === 4 && enemyDestroyAudioLifecycleProbe.paused.paused && !enemyDestroyAudioLifecycleProbe.paused.audible, "pause should mute and freeze enemy destruction noise");
assert(enemyDestroyAudioLifecycleProbe.finalFrame.active && enemyDestroyAudioLifecycleProbe.finalFrame.frame === 13 && enemyDestroyAudioLifecycleProbe.finalFrame.audible, "enemy destruction noise should resume and remain active through frame thirteen");
assert(!enemyDestroyAudioLifecycleProbe.end.active && enemyDestroyAudioLifecycleProbe.end.frame === 14, "enemy destruction noise should end exactly on frame fourteen");
assert(enemyDestroyAudioLifecycleProbe.grenade.active && enemyDestroyAudioLifecycleProbe.grenade.frame === 0 && enemyDestroyAudioLifecycleProbe.grenade.activeEnemies === 0 && enemyDestroyAudioLifecycleProbe.grenade.destroyingEnemies === 2 && enemyDestroyAudioLifecycleProbe.grenade.spawningAlive && enemyDestroyAudioLifecycleProbe.grenade.enemyKilled === 0 && enemyDestroyAudioLifecycleProbe.grenade.explosionCount === 0, "one grenade cue should move active enemies into retained destruction states while preserving spawning enemies");
assert(enemyDestroyAudioLifecycleProbe.noActiveTargets.active && enemyDestroyAudioLifecycleProbe.noActiveTargets.frame === 0 && enemyDestroyAudioLifecycleProbe.noActiveTargets.spawningAlive && enemyDestroyAudioLifecycleProbe.noActiveTargets.enemyKilled === 0 && enemyDestroyAudioLifecycleProbe.noActiveTargets.explosionCount === 0, "a grenade should start one destruction cue even when its only target is still spawning");
assert(!enemyDestroyAudioLifecycleProbe.stageCleanup.active && enemyDestroyAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending enemy destruction noise");
const playerDestroyAudioProbe = context.window.TankDefender8.debugPlayerDestroyAudioProbe();
assert(playerDestroyAudioProbe.durationFrames === 26 && playerDestroyAudioProbe.voiceDurations.join(",") === "26", "player destruction audio should contain one twenty-six-frame noise voice");
assert(playerDestroyAudioProbe.waves.join(",") === "noise-long", "player destruction audio should retain its long-period noise replacement voice");
assert(playerDestroyAudioProbe.frames.slice(0, 16).every((frame) => frame.voices[0].frequency === 1762), "player destruction should retain the original noise timer rate throughout all audible frames");
assert(playerDestroyAudioProbe.frames.slice(0, 16).map((frame) => frame.voices[0].gain).join(",") === "0.05,0.05,0.0467,0.0467,0.0433,0.0433,0.04,0.04,0.0367,0.0367,0.0333,0.0333,0.03,0.03,0.0267,0.0267", "player destruction should preserve all eight descending volume stages");
assert(playerDestroyAudioProbe.frames[16].voices[0] === null, "player destruction noise should stop on frame twenty-six");
const playerDestroyAudioLifecycleProbe = context.window.TankDefender8.debugPlayerDestroyAudioLifecycleProbe();
assert(playerDestroyAudioLifecycleProbe.playerHit.active && playerDestroyAudioLifecycleProbe.playerHit.frame === 0 && playerDestroyAudioLifecycleProbe.playerHit.audible && playerDestroyAudioLifecycleProbe.playerHit.wave === "noise-long", "an enemy bullet destroying a player should start player-destruction noise at frame zero");
assert(playerDestroyAudioLifecycleProbe.playerHit.hit && playerDestroyAudioLifecycleProbe.playerHit.bulletRemoved && !playerDestroyAudioLifecycleProbe.playerHit.playerAlive && playerDestroyAudioLifecycleProbe.playerHit.playerDestroying && playerDestroyAudioLifecycleProbe.playerHit.playerRespawn === 24 && playerDestroyAudioLifecycleProbe.playerHit.explosionCount === 1, "the lethal player hit should create one bullet impact while retaining the destruction picture on the player state");
assert(playerDestroyAudioLifecycleProbe.volume14.active && playerDestroyAudioLifecycleProbe.volume14.frame === 4 && playerDestroyAudioLifecycleProbe.volume14.gain === 0.0467, "player destruction should enter its second volume stage on frame four");
assert(playerDestroyAudioLifecycleProbe.volume13.active && playerDestroyAudioLifecycleProbe.volume13.frame === 8 && playerDestroyAudioLifecycleProbe.volume13.gain === 0.0433, "player destruction should enter its third volume stage on frame eight");
assert(playerDestroyAudioLifecycleProbe.paused.active && playerDestroyAudioLifecycleProbe.paused.frame === 8 && playerDestroyAudioLifecycleProbe.paused.paused && !playerDestroyAudioLifecycleProbe.paused.audible, "pause should mute and freeze player-destruction noise");
assert(playerDestroyAudioLifecycleProbe.finalFrame.active && playerDestroyAudioLifecycleProbe.finalFrame.frame === 25 && playerDestroyAudioLifecycleProbe.finalFrame.gain === 0.0267 && playerDestroyAudioLifecycleProbe.finalFrame.audible, "player destruction should resume and remain audible through frame twenty-five");
assert(!playerDestroyAudioLifecycleProbe.end.active && playerDestroyAudioLifecycleProbe.end.frame === 26, "player destruction should end exactly on frame twenty-six");
assert(!playerDestroyAudioLifecycleProbe.shielded.active && playerDestroyAudioLifecycleProbe.shielded.hit && playerDestroyAudioLifecycleProbe.shielded.bulletRemoved && playerDestroyAudioLifecycleProbe.shielded.playerAlive && playerDestroyAudioLifecycleProbe.shielded.explosionCount === 0, "an invulnerable player hit should consume the bullet without starting destruction noise");
assert(playerDestroyAudioLifecycleProbe.baseHit.active && playerDestroyAudioLifecycleProbe.baseHit.frame === 0 && playerDestroyAudioLifecycleProbe.baseHit.baseHitActive && playerDestroyAudioLifecycleProbe.baseHit.baseHitFrame === 0 && playerDestroyAudioLifecycleProbe.baseHit.baseHitAudible && playerDestroyAudioLifecycleProbe.baseHit.screen === "playing" && playerDestroyAudioLifecycleProbe.baseHit.baseDestroyTimer === 39 && !playerDestroyAudioLifecycleProbe.baseHit.baseAlive && playerDestroyAudioLifecycleProbe.baseHit.bulletRemoved && playerDestroyAudioLifecycleProbe.baseHit.explosionCount === 0, "destroying the base should start both destruction voices and load the original pre-banner counter without a generic bullet impact");
assert(playerDestroyAudioLifecycleProbe.gameOverContinuation.active && playerDestroyAudioLifecycleProbe.gameOverContinuation.frame === 1 && playerDestroyAudioLifecycleProbe.gameOverContinuation.baseHitActive && playerDestroyAudioLifecycleProbe.gameOverContinuation.baseHitFrame === 1 && playerDestroyAudioLifecycleProbe.gameOverContinuation.screen === "playing" && playerDestroyAudioLifecycleProbe.gameOverContinuation.baseDestroyTimer === 38, "both base-triggered destruction voices should continue during the base explosion countdown");
assert(playerDestroyAudioLifecycleProbe.simultaneousProgress.frame === 10 && playerDestroyAudioLifecycleProbe.simultaneousProgress.enemyDestroyActive && playerDestroyAudioLifecycleProbe.simultaneousProgress.enemyDestroyFrame === 13 && !playerDestroyAudioLifecycleProbe.simultaneousProgress.enemyDestroyAudible, "a masked enemy-destruction event should continue consuming its own frame lifetime");
assert(playerDestroyAudioLifecycleProbe.enemySuppressedEnd.active && playerDestroyAudioLifecycleProbe.enemySuppressedEnd.frame === 11 && !playerDestroyAudioLifecycleProbe.enemySuppressedEnd.enemyDestroyActive && playerDestroyAudioLifecycleProbe.enemySuppressedEnd.enemyDestroyFrame === 14, "the masked enemy event should end while player-destruction noise continues");
assert(!playerDestroyAudioLifecycleProbe.stageCleanup.active && playerDestroyAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending player-destruction noise");
const baseHitAudioProbe = context.window.TankDefender8.debugBaseHitAudioProbe();
assert(baseHitAudioProbe.durationFrames === 27 && baseHitAudioProbe.voiceDurations.join(",") === "27", "base destruction audio should contain one twenty-seven-frame pulse voice");
assert(baseHitAudioProbe.waves.join(",") === "square", "base destruction audio should retain its pulse-two replacement voice");
assert(baseHitAudioProbe.frames.filter((frame) => frame.frame < 27 && frame.frame % 3 === 0).map((frame) => frame.voices[0].frequency).join(",") === "261,246,196,155,131,123,98,78,65", "base destruction should preserve the original nine-note descending pitch order");
assert(baseHitAudioProbe.frames[0].voices[0].frequency === 261 && baseHitAudioProbe.frames[1].voices[0].frequency === 261 && baseHitAudioProbe.frames[16].voices[0].frequency === 65 && baseHitAudioProbe.frames[17].voices[0].frequency === 65, "the first and final base-destruction notes should each span all three frames");
assert(baseHitAudioProbe.frames[18].voices[0] === null, "base destruction audio should stop on frame twenty-seven");
const baseHitAudioLifecycleProbe = context.window.TankDefender8.debugBaseHitAudioLifecycleProbe();
assert(baseHitAudioLifecycleProbe.triggered.active && baseHitAudioLifecycleProbe.triggered.frame === 0 && baseHitAudioLifecycleProbe.triggered.frequency === 261 && baseHitAudioLifecycleProbe.triggered.audible, "a real base hit should start its first pulse-two note at frame zero");
assert(baseHitAudioLifecycleProbe.triggered.hit && !baseHitAudioLifecycleProbe.triggered.baseAlive && baseHitAudioLifecycleProbe.triggered.bulletRemoved && baseHitAudioLifecycleProbe.triggered.explosionCount === 0 && baseHitAudioLifecycleProbe.triggered.baseDestroyTimer === 39 && baseHitAudioLifecycleProbe.triggered.playerDestroyActive && baseHitAudioLifecycleProbe.triggered.playerDestroyFrame === 0, "destroying the base should remove the bullet, load 0x27, and start both original destruction events");
assert(baseHitAudioLifecycleProbe.triggered.screen === "playing" && baseHitAudioLifecycleProbe.triggered.movementAudioMode === "none", "base destruction should remain on the active battlefield during its pre-banner countdown");
assert(baseHitAudioLifecycleProbe.gameOverContinuation.active && baseHitAudioLifecycleProbe.gameOverContinuation.frame === 1 && baseHitAudioLifecycleProbe.gameOverContinuation.playerDestroyActive && baseHitAudioLifecycleProbe.gameOverContinuation.playerDestroyFrame === 1 && baseHitAudioLifecycleProbe.gameOverContinuation.baseDestroyTimer === 38, "both destruction events should continue on the first base-explosion frame");
assert(baseHitAudioLifecycleProbe.finalFrame.active && baseHitAudioLifecycleProbe.finalFrame.frame === 26 && baseHitAudioLifecycleProbe.finalFrame.frequency === 65 && baseHitAudioLifecycleProbe.finalFrame.audible && !baseHitAudioLifecycleProbe.finalFrame.playerDestroyActive && baseHitAudioLifecycleProbe.finalFrame.playerDestroyFrame === 26, "the base pulse should outlast player noise and remain audible through frame twenty-six");
assert(!baseHitAudioLifecycleProbe.end.active && baseHitAudioLifecycleProbe.end.frame === 27 && baseHitAudioLifecycleProbe.end.screen === "playing" && baseHitAudioLifecycleProbe.end.baseDestroyTimer === 12, "base destruction audio should end exactly on frame twenty-seven while the visual countdown continues");
assert(baseHitAudioLifecycleProbe.lowerPriorityProgress.active && baseHitAudioLifecycleProbe.lowerPriorityProgress.frame === 4 && !baseHitAudioLifecycleProbe.lowerPriorityProgress.steelHitActive && baseHitAudioLifecycleProbe.lowerPriorityProgress.steelHitFrame === 4 && baseHitAudioLifecycleProbe.lowerPriorityProgress.enemyHitActive && baseHitAudioLifecycleProbe.lowerPriorityProgress.enemyHitFrame === 4, "masked lower-priority impact events should keep consuming their own frame lifetimes");
assert(baseHitAudioLifecycleProbe.lowerPriorityEnd.active && baseHitAudioLifecycleProbe.lowerPriorityEnd.frame === 5 && !baseHitAudioLifecycleProbe.lowerPriorityEnd.enemyHitActive && baseHitAudioLifecycleProbe.lowerPriorityEnd.enemyHitFrame === 5, "the masked armored-hit event should end while base destruction continues");
assert(baseHitAudioLifecycleProbe.paused.active && baseHitAudioLifecycleProbe.paused.frame === 0 && baseHitAudioLifecycleProbe.paused.paused && !baseHitAudioLifecycleProbe.paused.audible, "pause should mute and freeze base-destruction audio");
assert(baseHitAudioLifecycleProbe.resumed.active && baseHitAudioLifecycleProbe.resumed.frame === 0 && !baseHitAudioLifecycleProbe.resumed.paused && baseHitAudioLifecycleProbe.resumed.audible, "resuming should restore the retained first base-destruction note");
assert(baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.active && baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.frame === 26 && !baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.audible && baseHitAudioLifecycleProbe.appearanceMaskedFinalFrame.powerUpAppearFrame === 26, "a masked base event should still reach its final frame while the appearance cue continues");
assert(!baseHitAudioLifecycleProbe.appearanceMaskedEnd.active && baseHitAudioLifecycleProbe.appearanceMaskedEnd.frame === 27 && baseHitAudioLifecycleProbe.appearanceMaskedEnd.powerUpAppearActive && baseHitAudioLifecycleProbe.appearanceMaskedEnd.powerUpAppearFrame === 27, "base destruction should end silently beneath the longer appearance cue");
assert(!baseHitAudioLifecycleProbe.stageCleanup.active && baseHitAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear pending base-destruction audio");
const playerShootAudioProbe = context.window.TankDefender8.debugPlayerShootAudioProbe();
assert(playerShootAudioProbe.durationFrames === 15 && playerShootAudioProbe.voiceDurations.join(",") === "15", "player shooting audio should contain one fifteen-frame voice");
assert(playerShootAudioProbe.waves.join(",") === "square", "player shooting audio should retain its pulse-like replacement voice");
assert(playerShootAudioProbe.frames[0].voices[0].frequency === 1165 && playerShootAudioProbe.frames[1].voices[0].frequency === 1165, "player shooting audio should hold its single pitch through frame fourteen");
assert(playerShootAudioProbe.frames[2].voices[0] === null, "player shooting audio should stop on frame fifteen");
const playerShootAudioLifecycleProbe = context.window.TankDefender8.debugPlayerShootAudioLifecycleProbe();
assert(playerShootAudioLifecycleProbe.playerStart.active && playerShootAudioLifecycleProbe.playerStart.frame === 0 && playerShootAudioLifecycleProbe.playerStart.audible && playerShootAudioLifecycleProbe.playerStart.bulletCount === 1, "a successful player shot should create one bullet and start its cue at frame zero");
assert(playerShootAudioLifecycleProbe.failedRetrigger.frame === 5 && playerShootAudioLifecycleProbe.failedRetrigger.bulletCount === 1, "a rejected player shot should not restart the active shooting cue");
assert(playerShootAudioLifecycleProbe.beforePause.active && playerShootAudioLifecycleProbe.beforePause.frame === 14, "player shooting audio should remain active through frame fourteen");
assert(playerShootAudioLifecycleProbe.paused.paused && playerShootAudioLifecycleProbe.paused.frame === 14, "pause should mute and freeze player shooting audio without discarding its frame");
assert(!playerShootAudioLifecycleProbe.end.active && playerShootAudioLifecycleProbe.end.frame === 15, "resuming should finish the final shooting frame exactly on frame fifteen");
assert(!playerShootAudioLifecycleProbe.enemyShot.active && playerShootAudioLifecycleProbe.enemyShot.frame === 0 && playerShootAudioLifecycleProbe.enemyShot.bulletCount === 1, "an enemy shot should create its bullet without starting player shooting audio");
assert(playerShootAudioLifecycleProbe.iceSuppressedEnd.active && playerShootAudioLifecycleProbe.iceSuppressedEnd.frame === 4 && !playerShootAudioLifecycleProbe.iceSuppressedEnd.iceActive && playerShootAudioLifecycleProbe.iceSuppressedEnd.iceFrame === 4, "a shot-masked ice cue should expire after four frames while the shot continues");
assert(!playerShootAudioLifecycleProbe.stageStartSuppressedEnd.active && playerShootAudioLifecycleProbe.stageStartSuppressedEnd.frame === 15, "a stage-start-masked shot should still consume its fifteen-frame lifetime");
assert(!playerShootAudioLifecycleProbe.bonusLifeSuppressedEnd.active && playerShootAudioLifecycleProbe.bonusLifeSuppressedEnd.frame === 15, "a bonus-life-masked shot should still consume its fifteen-frame lifetime");
assert(!playerShootAudioLifecycleProbe.stageCleanup.active && playerShootAudioLifecycleProbe.stageCleanup.frame === 0, "starting a stage should clear any pending player shooting cue");
const movementIceAudioProbe = context.window.TankDefender8.debugMovementIceAudioProbe();
assert(movementIceAudioProbe.durationFrames === 4 && movementIceAudioProbe.voiceDurations.join(",") === "4", "ice movement audio should contain one four-frame voice");
assert(movementIceAudioProbe.waves.join(",") === "square", "ice movement audio should retain its pulse-like replacement voice");
assert(movementIceAudioProbe.frames.slice(0, 4).map((frame) => frame.voices[0].frequency).join(",") === "279,349,415,523", "ice movement audio should rise through four one-frame notes");
assert(movementIceAudioProbe.frames[4].voices[0] === null, "ice movement audio should stop on frame four");
const movementIceAudioLifecycleProbe = context.window.TankDefender8.debugMovementIceAudioLifecycleProbe();
assert(movementIceAudioLifecycleProbe.start.active && movementIceAudioLifecycleProbe.start.frame === 0 && movementIceAudioLifecycleProbe.start.audible, "entering ice movement should trigger the cue at frame zero");
assert(movementIceAudioLifecycleProbe.start.movementAudioMode === "enemy", "the pulse-one ice cue should remain independent from the pulse-two movement loop");
assert(!movementIceAudioLifecycleProbe.stageStartSuppressedEnd.active && movementIceAudioLifecycleProbe.stageStartSuppressedEnd.frame === 4, "a stage-start-masked ice cue should still consume its four-frame lifetime");
assert(!movementIceAudioLifecycleProbe.bonusLifeSuppressedEnd.active && movementIceAudioLifecycleProbe.bonusLifeSuppressedEnd.frame === 4, "a bonus-life-masked ice cue should still consume its four-frame lifetime");
const bonusLifeAudioProbe = context.window.TankDefender8.debugBonusLifeAudioProbe();
assert(bonusLifeAudioProbe.durationFrames === 60, "bonus-life audio should use the original sixty-frame event lifetime");
assert(bonusLifeAudioProbe.voiceDurations.join(",") === "60,54", "bonus-life pulse voices should preserve their distinct sixty- and fifty-four-frame lengths");
assert(bonusLifeAudioProbe.waves.join(",") === "square,square", "bonus-life audio should retain two pulse-like replacement voices");
assert(bonusLifeAudioProbe.frames[0].voices.every(Boolean) && bonusLifeAudioProbe.frames[1].voices[1].frequency === 523, "both bonus-life voices should begin together and hold the two-frame opening pulse");
assert(bonusLifeAudioProbe.frames[2].voices[1].frequency === 784, "the second bonus-life voice should enter its six-frame phrase on frame two");
assert(bonusLifeAudioProbe.frames[4].voices[0].frequency === 784, "the first bonus-life voice should advance after its opening six-frame note");
assert(bonusLifeAudioProbe.frames[6].voices[0].frequency === 988, "the first bonus-life voice should enter its final eighteen-frame note on frame forty-two");
assert(bonusLifeAudioProbe.frames[7].voices.every(Boolean), "both bonus-life voices should remain active through frame fifty-three");
assert(Boolean(bonusLifeAudioProbe.frames[8].voices[0]) && bonusLifeAudioProbe.frames[8].voices[1] === null, "the second bonus-life voice should release the movement pulse channel on frame fifty-four");
assert(Boolean(bonusLifeAudioProbe.frames[9].voices[0]) && bonusLifeAudioProbe.frames[10].voices.every((voice) => voice === null), "the lead bonus-life voice should hold through frame fifty-nine and stop on frame sixty");
const bonusLifeAudioLifecycleProbe = context.window.TankDefender8.debugBonusLifeAudioLifecycleProbe();
const powerUpPickupAudioProbe = context.window.TankDefender8.debugPowerUpPickupAudioProbe();
assert(powerUpPickupAudioProbe.durationFrames === 39 && powerUpPickupAudioProbe.voiceDurations.join(",") === "39", "power-up pickup audio should contain one thirty-nine-frame voice");
assert(powerUpPickupAudioProbe.waves.join(",") === "square", "power-up pickup audio should retain its pulse-like replacement voice");
assert(powerUpPickupAudioProbe.frames[0].voices[0].frequency === 988 && powerUpPickupAudioProbe.frames[1].voices[0].frequency === 988, "the first pickup note should hold through its three-frame interval");
assert(powerUpPickupAudioProbe.frames[2].voices[0].frequency === 659, "the pickup phrase should advance on frame three");
assert(powerUpPickupAudioProbe.frames[4].voices[0].frequency === 784 && powerUpPickupAudioProbe.frames[5].voices[0].frequency === 784, "the final pickup note should span frames thirty-six through thirty-eight");
assert(powerUpPickupAudioProbe.frames[6].voices[0] === null, "the pickup voice should stop on frame thirty-nine");
const powerUpPickupAudioLifecycleProbe = context.window.TankDefender8.debugPowerUpPickupAudioLifecycleProbe();
assert(powerUpPickupAudioLifecycleProbe.start.active && powerUpPickupAudioLifecycleProbe.start.audible && powerUpPickupAudioLifecycleProbe.start.movementAudioMode === "none", "ordinary pickup audio should start audibly and reserve the movement pulse channel");
assert(powerUpPickupAudioLifecycleProbe.beforePause.frame === 38 && powerUpPickupAudioLifecycleProbe.beforePause.active, "pickup audio should remain active through frame thirty-eight");
assert(powerUpPickupAudioLifecycleProbe.paused.paused && powerUpPickupAudioLifecycleProbe.paused.frame === 38, "pause should mute and freeze pickup audio");
assert(!powerUpPickupAudioLifecycleProbe.end.active && powerUpPickupAudioLifecycleProbe.end.frame === 39 && powerUpPickupAudioLifecycleProbe.end.movementAudioMode === "enemy", "pickup audio should finish on frame thirty-nine and restore movement audio");
assert(!powerUpPickupAudioLifecycleProbe.suppressedEnd.active && powerUpPickupAudioLifecycleProbe.suppressedEnd.frame === 39, "a suppressed pickup event should still consume its complete thirty-nine-frame lifetime");
assert(powerUpPickupAudioLifecycleProbe.suppressedEnd.bonusLifeActive && powerUpPickupAudioLifecycleProbe.suppressedEnd.bonusLifeFrame === 39 && powerUpPickupAudioLifecycleProbe.suppressedEnd.movementAudioMode === "none", "bonus-life pulse priority should remain after the silent pickup event expires");
const powerUpAppearAudioProbe = context.window.TankDefender8.debugPowerUpAppearAudioProbe();
assert(powerUpAppearAudioProbe.durationFrames === 32 && powerUpAppearAudioProbe.voiceDurations.join(",") === "32", "power-up appearance audio should contain one thirty-two-frame voice");
assert(powerUpAppearAudioProbe.waves.join(",") === "square", "power-up appearance audio should retain its pulse-like replacement voice");
assert(powerUpAppearAudioProbe.frames[0].voices[0].frequency === 392 && powerUpAppearAudioProbe.frames[1].voices[0].frequency === 392, "the first appearance note should hold through frame three");
assert(powerUpAppearAudioProbe.frames[2].voices[0].frequency === 330 && powerUpAppearAudioProbe.frames[3].voices[0].frequency === 330, "the appearance phrase should advance on frame four");
assert(powerUpAppearAudioProbe.frames[4].voices[0].frequency === 392 && powerUpAppearAudioProbe.frames[5].voices[0].frequency === 494, "the appearance phrase should retain its four-frame note cadence through frame twenty-seven");
assert(powerUpAppearAudioProbe.frames[6].voices[0].frequency === 523 && powerUpAppearAudioProbe.frames[7].voices[0].frequency === 523, "the final appearance note should span frames twenty-eight through thirty-one");
assert(powerUpAppearAudioProbe.frames[8].voices[0] === null, "the appearance voice should stop on frame thirty-two");
const powerUpAppearAudioLifecycleProbe = context.window.TankDefender8.debugPowerUpAppearAudioLifecycleProbe();
assert(powerUpAppearAudioLifecycleProbe.spawned && powerUpAppearAudioLifecycleProbe.start.powerUpType === "star", "a carrier release should create its configured power-up");
assert(powerUpAppearAudioLifecycleProbe.start.active && powerUpAppearAudioLifecycleProbe.start.frame === 0 && powerUpAppearAudioLifecycleProbe.start.audible && powerUpAppearAudioLifecycleProbe.start.movementAudioMode === "none", "a successful carrier release should start the appearance cue and reserve the movement pulse channel");
assert(powerUpAppearAudioLifecycleProbe.beforePause.active && powerUpAppearAudioLifecycleProbe.beforePause.frame === 15, "the appearance cue should advance through its first fifteen frames");
assert(powerUpAppearAudioLifecycleProbe.paused.paused && powerUpAppearAudioLifecycleProbe.paused.frame === 15, "pause should mute and freeze the appearance cue");
assert(powerUpAppearAudioLifecycleProbe.beforeEnd.active && powerUpAppearAudioLifecycleProbe.beforeEnd.frame === 31, "the appearance cue should remain active through frame thirty-one after resume");
assert(!powerUpAppearAudioLifecycleProbe.end.active && powerUpAppearAudioLifecycleProbe.end.frame === 32 && powerUpAppearAudioLifecycleProbe.end.movementAudioMode === "enemy", "frame thirty-two should end the appearance cue and restore movement audio");
assert(!powerUpAppearAudioLifecycleProbe.suppressedEnd.active && powerUpAppearAudioLifecycleProbe.suppressedEnd.frame === 32, "a masked appearance event should still consume its full thirty-two-frame lifetime");
assert(powerUpAppearAudioLifecycleProbe.suppressedEnd.pickupActive && powerUpAppearAudioLifecycleProbe.suppressedEnd.pickupFrame === 32 && powerUpAppearAudioLifecycleProbe.suppressedEnd.movementAudioMode === "none", "pickup-channel priority should remain after the masked appearance cue expires");
assert(powerUpAppearAudioLifecycleProbe.noSpotSpawned === false && !powerUpAppearAudioLifecycleProbe.noSpot.active && powerUpAppearAudioLifecycleProbe.noSpot.powerUpType === null, "a map with no reachable power-up location should not create an item or an empty appearance cue");
const pauseAudioProbe = context.window.TankDefender8.debugPauseAudioProbe();
assert(pauseAudioProbe.durationFrames === 36 && pauseAudioProbe.voiceDurations.join(",") === "36", "pause audio should contain one thirty-six-frame voice");
assert(pauseAudioProbe.waves.join(",") === "square", "pause audio should retain its pulse-like replacement voice");
assert(pauseAudioProbe.frames[0].voices[0].frequency === 659 && pauseAudioProbe.frames[1].voices[0].frequency === 659, "the first pause note should hold through frame three");
assert(pauseAudioProbe.frames[2].voices[0].frequency === 740 && pauseAudioProbe.frames[3].voices[0].frequency === 740, "the pause phrase should advance on frame four");
assert(pauseAudioProbe.frames[4].voices[0].frequency === 784 && pauseAudioProbe.frames[5].voices[0].frequency === 1175, "the six short pause notes should retain their four-frame cadence");
assert(pauseAudioProbe.frames[6].voices[0].frequency === 988 && pauseAudioProbe.frames[7].voices[0].frequency === 988, "the pause tail should span frames twenty-four through thirty-five");
assert(pauseAudioProbe.frames[8].voices[0] === null, "the pause voice should stop on frame thirty-six");
const pauseAudioLifecycleProbe = context.window.TankDefender8.debugPauseAudioLifecycleProbe();
assert(
  pauseAudioLifecycleProbe.exitedEarly &&
    pauseAudioLifecycleProbe.earlyResume.active &&
    pauseAudioLifecycleProbe.earlyResume.stageStartAudibility.join(",") === "true,true,false" &&
    pauseAudioLifecycleProbe.earlyResume.bonusLifeAudibility.join(",") === "true,false" &&
    !pauseAudioLifecycleProbe.earlyResume.powerUpPickupAudible &&
    !pauseAudioLifecycleProbe.earlyResume.powerUpAppearAudible &&
    pauseAudioLifecycleProbe.earlyResume.movementAudioMode === "none",
  "an unfinished pause cue should retain second-pulse priority after an early resume"
);
const pausedStageEndProbe = context.window.TankDefender8.debugPausedStageEndProbe();
assert(pausedStageEndProbe.incomplete.screen === "playing" && pausedStageEndProbe.incomplete.paused === true && pausedStageEndProbe.incomplete.pauseElapsed === 1, "an incomplete stage should remain paused while its display frame advances");
assert(pausedStageEndProbe.incomplete.tick === 41 && pausedStageEndProbe.detected.tick === 0, "paused stage-end checks should freeze incomplete play and reset both battle frame counters when completion is detected");
assert(pausedStageEndProbe.detected.enemyCount === 0 && pausedStageEndProbe.detected.paused === false && pausedStageEndProbe.detected.pauseElapsed === 0, "detecting the final defeated enemy during pause should leave the pausable battle loop");
assert(pausedStageEndProbe.detected.screen === "playing" && pausedStageEndProbe.detected.clearPendingTimer === pausedStageEndProbe.delay, "paused stage completion should load the full active clear delay without consuming a frame on detection");
assert(pausedStageEndProbe.pauseAcceptedDuringDelay === false, "the post-clear activity delay should reject new pause input");
const runtimeSpriteManifest = context.window.TankDefender8.spriteManifest();
assert(runtimeSpriteManifest.id === "free-procedural-sprites", "runtime sprite manifest id should match the free replacement manifest");
assert(runtimeSpriteManifest.sprites.tank.frames.up.length === 7, "runtime sprite manifest should expose tank frames");
assert(Object.keys(runtimeSpriteManifest.sprites.tankTracks.frames).join(",") === "verticalA,verticalB,horizontalA,horizontalB", "tank sprite manifest should expose both tread phases for both orientations");
assert(
  stableJson(runtimeSpriteManifest.sprites.tankTracks.frames.verticalA) !== stableJson(runtimeSpriteManifest.sprites.tankTracks.frames.verticalB) &&
    stableJson(runtimeSpriteManifest.sprites.tankTracks.frames.horizontalA) !== stableJson(runtimeSpriteManifest.sprites.tankTracks.frames.horizontalB),
  "tank tread phases should use visibly different pixel geometry"
);
assert(runtimeSpriteManifest.sprites.powerUp.size === 16, "power-up replacement sprites should retain the original 16x16 footprint");
assert(runtimeSpriteManifest.sprites.powerUp.frames.timer.length === 10, "timer power-up should use a recognizable stopwatch silhouette");
assert(runtimeSpriteManifest.sprites.powerUp.frames.shovel.length === 12, "shovel power-up should use a recognizable handle and blade silhouette");
assert(
  ["grenade", "helmet", "shovel", "star", "timer", "tank"].every((type) =>
    runtimeSpriteManifest.sprites.powerUp.frames[type].some((part) => part.role === "outline")
  ),
  "all six original power-up replacements should expose a dark pixel outline"
);
assert(runtimeSpriteManifest.sprites.wallQuarter.frames.steel.filter((part) => part.role === "bolt").length === 2, "steel walls should expose distinct dark bolt details instead of resembling ice");
assert(runtimeSpriteManifest.sprites.powerUp.frames.star.length >= 8, "runtime sprite manifest should expose a multi-part star power-up frame");
assert(
  runtimeSpriteManifest.sprites.powerUp.frames.star.filter((part) => part.role === "primary").length >= 5,
  "runtime sprite manifest should draw the star as a recognizable five-point upgrade"
);
assert(runtimeSpriteManifest.sprites.terrain.frames.waterA.length === 3, "runtime sprite manifest should expose terrain frames");
assert(
  stableJson(runtimeSpriteManifest.sprites.terrain.frames.waterA.slice(1)) !== stableJson(runtimeSpriteManifest.sprites.terrain.frames.waterB.slice(1)),
  "water terrain frames should use visibly different wave geometry"
);
assert(runtimeSpriteManifest.sprites.base.frames.alive.length === 4, "runtime sprite manifest should expose base frames");
assert(runtimeSpriteManifest.sprites.bullet.frames.default.length === 1, "runtime sprite manifest should expose bullet frames");
assert(runtimeSpriteManifest.sprites.spawn.frames.box[0].op === "stroke", "runtime sprite manifest should expose stroke sprite parts");
assert(Object.keys(runtimeSpriteManifest.sprites.hiddenDrop.frames).join(",") === "morph0,morph1,morph2,morph3,fall", "hidden-message replacement drop should expose all morph and fall frames");
assert(runtimeSpriteManifest.sprites.miniTank.frames.up.length === 5, "runtime sprite manifest should expose mini tank frames");
assert(runtimeSpriteManifest.sprites.explosion.frames.burst.length === 2, "runtime sprite manifest should expose explosion frames");
assert(Object.keys(runtimeSpriteManifest.sprites.destructionExplosion.frames).join(",") === "phase1,phase2,phase3,phase4,phase5", "runtime sprite manifest should expose all five shared tank/HQ destruction frames");
assert(runtimeSpriteManifest.sprites.enemyCounter.frames.remaining.length === 1, "runtime sprite manifest should expose enemy counter frames");
assert(stableJson(runtimeSpriteManifest) === stableJson(spriteManifest), "runtime sprite manifest should match data/free-sprite-manifest.json");
let snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.highScore === 20000, "high score should retain the original 20000-point floor");
const schema = context.window.TankDefender8.stagePackSchema();
canvasContext.calls.length = 0;
assert(typeof animationFrameCallback === "function", "animation frame callback should be registered");
animationFrameCallback(16);
assert(!canvasContext.calls.some((call) => call.op === "fillText"), "canvas text should render through pixel rectangles instead of anti-aliased fillText");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#f05a42" && call.w === 5 && call.h === 4), "title should render the large striped replacement logo with integer pixels");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#e3c64e" && call.w === 4 && call.h === 10), "title should render the menu tank cursor");
assert(snapshot.titleMenu === 0 && snapshot.titleMenuAction === "one", "title menu should default to one-player");
const titleDemoProbe = context.window.TankDefender8.debugTitleDemoLifecycleProbe();
assert(titleDemoProbe.timeoutFrames === 640, "title demo should use ten original 64-frame high-counter intervals");
assert(titleDemoProbe.selectionReset.idleFrames === 0 && titleDemoProbe.selectionReset.frameLow === 0xab && titleDemoProbe.selectionReset.frameHigh === 0, "changing the title selection should clear only the high frame counter and preserve the full low-byte phase");
assert(titleDemoProbe.beforeTimeout.screen === "title" && titleDemoProbe.beforeTimeout.idleFrames === 639 && titleDemoProbe.beforeTimeout.frameLow === 0x7f && titleDemoProbe.beforeTimeout.frameHigh === 9, "title should remain visible through idle frame 639 with high counter nine");
assert(titleDemoProbe.beforeTimeout.demoMode === false, "title should not enter demo before the timeout boundary");
assert(titleDemoProbe.afterTimeout.screen === "playing" && titleDemoProbe.afterTimeout.demoMode === true && titleDemoProbe.afterTimeout.frameLow === 2 && titleDemoProbe.afterTimeout.frameHigh === 0, "idle frame 640 should enter the attract demo after its two original preparation waits");
assert(titleDemoProbe.afterTimeout.stage === 30 && titleDemoProbe.afterTimeout.transitionTimer === 0, "the demo should display stage 30 without a stage-intro curtain");
assert(titleDemoProbe.afterTimeout.playerCount === 2 && titleDemoProbe.afterTimeout.playerIds.join(",") === "1,2", "the demo should spawn both AI-controlled players");
assert(titleDemoProbe.afterTimeout.maxActiveEnemies === 4, "the demo should retain the original four-active-enemy limit");
assert(titleDemoProbe.enemyTargets[0].targetId === 202 && titleDemoProbe.enemyTargets[1].targetId === 203, "demo players should use their original slot-priority enemy targets");
assert(titleDemoProbe.enemyTargets[0].direction === 0 && titleDemoProbe.enemyTargets[1].direction === 1 && titleDemoProbe.axisPhaseTwoTargets[0].direction === 3 && titleDemoProbe.axisPhaseTwoTargets[1].direction === 0, "demo route axis priority should swap when the independent high counter reaches two after 128 display frames");
assert(titleDemoProbe.powerUpTarget.targetKind === "powerUp" && titleDemoProbe.powerUpTarget.targetId === "star", "demo AI should prioritize an available power-up over enemies");
assert(titleDemoProbe.scoreIsolation.score === 0 && titleDemoProbe.scoreIsolation.stagePoints === 0, "demo kills and pickups should not change player scores");
assert(titleDemoProbe.scoreIsolation.stageKills.every((count) => count === 0), "demo kills should not enter stage result counters");
assert(titleDemoProbe.scoreIsolation.level === 1 && titleDemoProbe.scoreIsolation.scorePopupCount === 0, "demo pickups should apply effects without showing score popups");
assert(titleDemoProbe.afterExit.screen === "title" && titleDemoProbe.afterExit.stage === 1 && titleDemoProbe.afterExit.demoMode === false, "leaving the demo should restore a clean stage-1 title state");
assert(titleDemoProbe.afterExit.playerCount === 0 && titleDemoProbe.afterExit.idleFrames === 0, "leaving the demo should clear demo actors and reset its idle timer");
assert(titleDemoProbe.afterConstruction.screen === "title" && titleDemoProbe.afterConstruction.idleFrames === 639 && titleDemoProbe.afterConstruction.frameLow === 0x40 && titleDemoProbe.afterConstruction.frameHigh === 10, "an active Construction-use cycle should suppress the automatic demo without stopping the global counters");
const hiddenMessageProbe = context.window.TankDefender8.debugHiddenMessageLifecycleProbe();
assert(hiddenMessageProbe.requiredVisits === 7 && hiddenMessageProbe.requiredAPresses === 8 && hiddenMessageProbe.requiredBPresses === 12, "hidden message should retain the original seven-visit, eight-A, twelve-B sequence");
assert(hiddenMessageProbe.afterSeventhExit.screen === "title" && hiddenMessageProbe.afterSeventhExit.visits === 7, "the seventh Construction exit should arm hidden title input");
assert(hiddenMessageProbe.afterSeventhExit.inputCount === 0, "each Construction exit should reset the hidden input accumulator");
assert(hiddenMessageProbe.afterA === 0x80 && hiddenMessageProbe.afterB === 0x74, "hidden controller input should use the original +0x10 and -1 byte arithmetic");
assert(hiddenMessageProbe.afterB === hiddenMessageProbe.expectedInputCount && hiddenMessageProbe.triggerReady === true, "the exact hidden input total should arm Start");
assert(hiddenMessageProbe.presentations[0].visibleLines.length === 0 && hiddenMessageProbe.presentations[1].visibleLines.length === 1, "the first hidden-message line should appear on frame 128");
assert(hiddenMessageProbe.presentations[2].visibleLines.length === 4, "all four hidden-message lines should be visible on frame 320");
assert(hiddenMessageProbe.presentations[3].dots === 0 && hiddenMessageProbe.presentations[4].dots === 1 && hiddenMessageProbe.presentations[5].dots === 5, "the five trailing dots should appear one per 64 frames");
assert(hiddenMessageProbe.presentations[5].drop === null && hiddenMessageProbe.presentations[6].drop.frame === "morph3", "the replacement green drop should start one frame after the fifth dot");
assert(hiddenMessageProbe.presentations[7].drop.frame === "morph3" && hiddenMessageProbe.presentations[7].drop.y === 30, "the seven-step drop morph should last 28 frames at the top");
assert(hiddenMessageProbe.presentations[8].drop.frame === "fall" && hiddenMessageProbe.presentations[8].drop.y === 31, "the drop should begin falling after its 28-frame morph");
assert(hiddenMessageProbe.presentations[9].drop.y === 248 && hiddenMessageProbe.endFrame === 887, "the drop should reach the original terminal Y before frame 887 ends the cutscene");
assert(hiddenMessageProbe.afterCutscene.screen === "editor" && hiddenMessageProbe.afterCutscene.visits === 7, "the hidden cutscene should continue into Construction without adding another exit");
assert(hiddenMessageProbe.afterCutscene.inputCount === 0, "finishing the hidden cutscene should clear its input accumulator");
assert(hiddenMessageProbe.wrappedVisits === 0, "Construction visit tracking should preserve the original eight-bit wraparound");
assert(hiddenMessageProbe.alternateSelection.screen === "stageSelectClosing" && hiddenMessageProbe.alternateSelection.players === 1, "the hidden cutscene should continue through the selected title handler and its curtain close");
const gameOverAudioProbe = context.window.TankDefender8.debugGameOverAudioProbe();
assert(gameOverAudioProbe.durationFrames === 108 && gameOverAudioProbe.voiceDurations.join(",") === "108,108,108", "all three game-over voices should cover the complete 108-frame interstitial");
assert(gameOverAudioProbe.waves.join(",") === "square,square,triangle", "game-over audio should expose its two pulse replacements and triangle voice");
const gameOverBoundaryFrames = gameOverAudioProbe.frames.filter((_frame, index) => index % 2 === 0 && index < 20);
assert(gameOverBoundaryFrames.map((frame) => frame.voices[0].frequency).join(",") === "523,464,523,391,348,311,261,261,261,261", "game-over pulse one should preserve the original note order at each segment boundary");
assert(gameOverBoundaryFrames.map((frame) => frame.voices[1].frequency).join(",") === "391,391,391,311,293,246,261,261,261,261", "game-over pulse two should preserve the original note order at each segment boundary");
assert(gameOverBoundaryFrames.map((frame) => frame.voices[2].frequency).join(",") === "329,311,329,261,232,196,196,196,196,196", "game-over triangle should preserve the original note order at each segment boundary");
assert(gameOverAudioProbe.frames[0].voices[0].frequency === gameOverAudioProbe.frames[1].voices[0].frequency && gameOverAudioProbe.frames[4].voices[0].frequency === gameOverAudioProbe.frames[5].voices[0].frequency && gameOverAudioProbe.frames[18].voices[0].frequency === gameOverAudioProbe.frames[19].voices[0].frequency, "game-over notes should remain held through their 6-, 24-, and final 24-frame spans");
assert(gameOverAudioProbe.frames[20].voices.every((voice) => voice === null), "all game-over voices should stop exactly on frame 108");
const highScoreAudioProbe = context.window.TankDefender8.debugHighScoreAudioProbe();
assert(highScoreAudioProbe.durationFrames === 460 && highScoreAudioProbe.voiceDurations.join(",") === "460,460,380", "high-score pulse voices should last 460 frames while triangle ends on frame 380");
assert(highScoreAudioProbe.waves.join(",") === "square,square,triangle", "high-score audio should expose both pulse replacements and its triangle voice");
const highScoreAudioFrames = new Map(highScoreAudioProbe.frames.map((frame) => [frame.frame, frame]));
assert(highScoreAudioFrames.get(0).voices[0].frequency === 924 && highScoreAudioFrames.get(4).voices[0].frequency === 924 && highScoreAudioFrames.get(5).voices[0].frequency === 782 && highScoreAudioFrames.get(10).voices[0].frequency === 924, "high-score pulse one should alternate its opening pair every five frames");
assert(highScoreAudioFrames.get(240).voices[0].frequency === 1243 && highScoreAudioFrames.get(245).voices[0].frequency === 1108 && highScoreAudioFrames.get(319).voices[0].frequency === 1108, "high-score pulse one should preserve its eight repeated upper pairs");
assert(highScoreAudioFrames.get(320).voices[0] === null && highScoreAudioFrames.get(399).voices[0] === null, "high-score pulse one should retain its original eighty-frame muted interval");
assert(highScoreAudioFrames.get(400).voices[0].frequency === 1554 && highScoreAudioFrames.get(459).voices[0].frequency === 1554 && highScoreAudioFrames.get(460).voices[0] === null, "high-score pulse one should hold its final note for sixty frames and stop on frame 460");
assert(highScoreAudioFrames.get(0).voices[1].frequency === 695 && highScoreAudioFrames.get(5).voices[1].frequency === 621 && highScoreAudioFrames.get(240).voices[1].frequency === 981 && highScoreAudioFrames.get(245).voices[1].frequency === 736, "high-score pulse two should preserve both repeated opening pairs");
assert(highScoreAudioFrames.get(320).voices[1].frequency === 78 && highScoreAudioFrames.get(325).voices[1].frequency === 98 && highScoreAudioFrames.get(399).voices[1].frequency === 1165, "high-score pulse two should preserve its sixteen-note five-frame rise");
assert(highScoreAudioFrames.get(400).voices[1].frequency === 1165 && highScoreAudioFrames.get(459).voices[1].frequency === 1165 && highScoreAudioFrames.get(460).voices[1] === null, "high-score pulse two should retain its sixty-frame ending");
assert(highScoreAudioFrames.get(0).voices[2] === null && highScoreAudioFrames.get(129).voices[2] === null && highScoreAudioFrames.get(130).voices[2].frequency === 232, "high-score triangle should retain its initial 130-frame disabled interval");
assert(highScoreAudioFrames.get(160).voices[2].frequency === 311 && highScoreAudioFrames.get(175).voices[2].frequency === 347 && highScoreAudioFrames.get(180).voices[2].frequency === 391, "high-score triangle should preserve its first 15-, 5-, and 30-frame notes");
assert(highScoreAudioFrames.get(320).voices[2].frequency === 155 && highScoreAudioFrames.get(379).voices[2].frequency === 155 && highScoreAudioFrames.get(380).voices[2] === null, "high-score triangle should hold its final note through frame 379 and stop on frame 380");
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
const onePlayerSpawnTimeline = context.window.TankDefender8.debugEnemySpawnTimelineProbe(1, 3);
const twoPlayerSpawnTimeline = context.window.TankDefender8.debugEnemySpawnTimelineProbe(2, 3);
assert(onePlayerSpawnTimeline.frames.join(",") === "1,188,375", `one-player stage 1 spawn frames: ${onePlayerSpawnTimeline.frames.join(",")}`);
assert(twoPlayerSpawnTimeline.frames.join(",") === "1,168,335", `two-player stage 1 spawn frames: ${twoPlayerSpawnTimeline.frames.join(",")}`);
assert(onePlayerSpawnTimeline.slots.join(",") === "5,4,3" && twoPlayerSpawnTimeline.slots.join(",") === "7,6,5", "enemy object slots should allocate from the highest available slot downward");
assert(onePlayerSpawnTimeline.spawnIndices.join(",") === "1,2,0", "the first three enemies should spawn center, right, then left");
assert(schema.enemyTypes[2].wallPower === 1, "the built-in Power Tank should gain bullet speed without stronger wall damage");
assert(schema.wallRules.brickSameSideHits === 4, "normal shots should need four same-side brick hits");
assert(schema.wallRules.poweredBrickSameSideHits === 2, "powered shots should need two same-side brick hits");
assert(schema.wallRules.brickFragmentSize === 4, "brick collision state should use original four-pixel fragments");
assert(schema.wallRules.normalBrickStripLength === 8 && schema.wallRules.normalBrickStripDepth === 4, "normal bullets should peel one 8x4 brick strip per hit");
assert(schema.wallRules.steelRequiredPower === 3, "steel should require max-power shots");
assert(schema.wallRules.steelSameSideHits === 1, "max-power shots should remove one steel subtile on every hit");
const brickPowerProbe = context.window.TankDefender8.debugBrickWallPowerProbe();
assert(brickPowerProbe.integration.hit && brickPowerProbe.integration.bulletRemoved, "the live terrain resolver should consume a bullet that hits a brick fragment");
assert(brickPowerProbe.integration.mask === 15 && brickPowerProbe.integration.brickMask === 65518, "the live terrain resolver should remove one 4x8 strip without dropping the containing 8x8 subtile");
assert(brickPowerProbe.integration.explosions === 1, "a live brick-fragment hit should create one impact explosion");
canvasContext.resetPixels();
const brickFragmentRenderProbe = context.window.TankDefender8.debugBrickFragmentRenderProbe();
const removedBrickPixels = canvasContext.pixelColors(brickFragmentRenderProbe.removed);
const remainingBrickPixels = canvasContext.pixelColors(brickFragmentRenderProbe.remaining);
assert(removedBrickPixels["#000000"] === 32, "the removed 4x8 brick strip should render entirely as battlefield background");
assert(Object.keys(remainingBrickPixels).some((color) => color !== "#000000" && color !== "null"), "the adjacent 4x8 brick strip should remain visibly rendered");
const shovelProbe = context.window.TankDefender8.debugShovelWallProbe();
assert(shovelProbe.durationUnits === 20 && shovelProbe.flashThreshold === 4, "shovel should use twenty 64-frame units and flash below four remaining units");
assert(shovelProbe.protected === "steel", "shovel protection should keep steel before flash");
assert(shovelProbe.flashA !== shovelProbe.flashB, "shovel flash window should alternate wall type");
assert(shovelProbe.expired === "brick", "shovel protection should expire back to brick");
assert(shovelProbe.cells.filter((cell) => cell.type === "steel" && cell.mask === 15).length === 5, "shovel should protect the five wall cells around the base");
assert(shovelProbe.cells.some((cell) => cell.c === 6 && cell.r === 12 && cell.type === "empty"), "shovel should keep the eagle cell open");
const globalTimerProbe = context.window.TankDefender8.debugGlobalTimerCadenceProbe();
assert(globalTimerProbe.unitFrames === 64, "original long-duration timers should use 64-frame units");
assert(globalTimerProbe.boundaries.map((entry) => entry.active).join(",") === "false,false,true,false,false,true", "global timers should tick only when the low frame counter is zero modulo 64");
assert(globalTimerProbe.durations.helmet === 10 && globalTimerProbe.durations.timer === 10 && globalTimerProbe.durations.shovel === 20, "global timer probe should expose original item counter values");
assert(globalTimerProbe.timerDisplayFrames.phase0 === 640 && globalTimerProbe.timerDisplayFrames.phase63 === 577, "ten timer units should last 577 through 640 display frames depending on pickup phase");
assert(globalTimerProbe.spawnShieldDisplayFrames.phase0 === 192 && globalTimerProbe.spawnShieldDisplayFrames.phase63 === 129, "three shield units should last 129 through 192 display frames depending on activation phase");
const timerFinalFrameProbe = context.window.TankDefender8.debugTimerFinalFrameFreezeProbe();
assert(timerFinalFrameProbe.after.activeEnemyX > timerFinalFrameProbe.before.activeEnemyX, "enemies should resume movement on the 64-frame boundary that expires the timer");
assert(timerFinalFrameProbe.after.activeEnemyReload === timerFinalFrameProbe.before.activeEnemyReload - 1, "enemy reload should resume on the timer expiration boundary");
assert(timerFinalFrameProbe.after.spawningEnemyFlash === timerFinalFrameProbe.before.spawningEnemyFlash - 1, "enemy spawn animation should resume on the timer expiration boundary");
assert(timerFinalFrameProbe.after.nextSpawn === timerFinalFrameProbe.before.nextSpawn - 1, "enemy spawn countdown should continue through timer expiration");
assert(timerFinalFrameProbe.after.bulletX > timerFinalFrameProbe.before.bulletX, "timer expiration should not affect player bullets");
assert(timerFinalFrameProbe.after.freezeTimer === 0, "timer should reach zero at the global 64-frame boundary before enemy updates");
const timerSpawnProbe = context.window.TankDefender8.debugTimerSpawnDuringFreezeProbe();
assert(timerSpawnProbe.afterSpawn.enemyCount === 1 && timerSpawnProbe.afterSpawn.enemySpawned === 1, "timer should not block an enemy from spawning");
assert(timerSpawnProbe.afterSpawn.spawnedEnemyFlash === timerSpawnProbe.expectedSpawnFlash, "enemy spawned during timer should enter its normal spawn flash");
assert(timerSpawnProbe.afterFrozenFrame.spawnedEnemyFlash === timerSpawnProbe.afterSpawn.spawnedEnemyFlash - 1, "enemy spawn animation should continue while the timer is active");
assert(timerSpawnProbe.afterSpawnAnimation.spawnedEnemyFlash === 0 && timerSpawnProbe.afterSpawnAnimation.freezeTimer > 0, "an enemy should finish spawning before an active timer expires");
assert(timerSpawnProbe.afterFrozenActiveFrame.enemyX === timerSpawnProbe.afterSpawnAnimation.enemyX && timerSpawnProbe.afterFrozenActiveFrame.enemyY === timerSpawnProbe.afterSpawnAnimation.enemyY, "a newly active enemy should remain stationary while the timer is active");
assert(timerSpawnProbe.afterFrozenActiveFrame.enemyReload === timerSpawnProbe.afterSpawnAnimation.enemyReload, "a newly active enemy should keep its reload timer frozen");
assert(timerSpawnProbe.afterSpawnAnimation.enemyBulletCount === 0 && timerSpawnProbe.afterFrozenActiveFrame.enemyBulletCount === 0, "a newly active enemy should not fire while the timer is active");
canvasContext.calls.length = 0;
canvasContext.resetPixels();
const pickupRenderProbe = context.window.TankDefender8.debugPowerUpPickupRenderProbe();
assert(pickupRenderProbe.powerUpType === null, "collected power-up should be cleared from game state");
assert(pickupRenderProbe.playerLevel === 1, "star pickup should still apply after clearing the power-up object");
assert(pickupRenderProbe.playerScore === pickupRenderProbe.pickupScore, "power-up pickup should still award score");
assert(pickupRenderProbe.popup.style === "powerUp" && pickupRenderProbe.popup.ttl === 49, "power-up pickup should create the original-style fixed score state for 49 visible frames");
assert(pickupRenderProbe.popup.x === pickupRenderProbe.powerCenter.x && pickupRenderProbe.popup.y === pickupRenderProbe.powerCenter.y, "power-up score should remain centered on the collected item position");
assert(pickupRenderProbe.pickupAudio.active && pickupRenderProbe.pickupAudio.frame === 0 && pickupRenderProbe.pickupAudio.audible, "an ordinary star pickup should start the audible thirty-nine-frame pickup event");
assert(pickupRenderProbe.presentation.x === pickupRenderProbe.laterPresentation.x && pickupRenderProbe.presentation.y === pickupRenderProbe.laterPresentation.y, "power-up score should not drift while its timer counts down");
assert(pickupRenderProbe.presentation.color === "#f7f1c6" && pickupRenderProbe.laterPresentation.color === "#f7f1c6", "power-up score should use one stable palette color instead of flashing");
assert(pickupRenderProbe.presentation.width === 15 && pickupRenderProbe.presentation.advance === 5, "the three-digit pickup score should use a compact width close to the original two-sprite graphic");
assert(pickupRenderProbe.visibleFrames === 49, "power-up score should remain visible for exactly 49 rendered frame states");
assert(!canvasContext.calls.some((call) =>
  call.op === "strokeRect" &&
  call.x === pickupRenderProbe.drawRect.x &&
  call.y === pickupRenderProbe.drawRect.y &&
  call.w === pickupRenderProbe.drawRect.w &&
  call.h === pickupRenderProbe.drawRect.h
), "rendering immediately after pickup should not draw the collected power-up frame");
canvasContext.calls.length = 0;
canvasContext.resetPixels();
const footprintProbe = context.window.TankDefender8.debugPowerUpFootprintClearProbe();
const footprintColors = canvasContext.pixelColors(footprintProbe.drawRect);
assert(footprintProbe.powerUpType === null, "collected power-up should stay cleared after applying its effect");
assert(footprintProbe.playerLevel === 1, "footprint probe should still apply the star effect");
assert(footprintProbe.playerScore === footprintProbe.pickupScore, "footprint probe should award the pickup score");
assert(footprintColors["#315b34"] > 0, "collected power-up footprint should redraw the terrain underneath");
assert(!footprintColors["#101114"], "collected power-up footprint should not leave its black backing");
assert(!footprintColors["#f3f0d4"], "collected power-up footprint should not leave its border");
assert(!footprintColors["#e0b84b"], "collected power-up footprint should not leave its sprite color");
assert(footprintColors["#f7f1c6"] > 0, "collected power-up footprint should contain the fixed pickup-score pixels");
const terrainMutationProbe = context.window.TankDefender8.debugPowerUpTerrainMutationProbe();
assert(terrainMutationProbe.length === 6, "terrain mutation probe should cover all six original power-up types");
assert(terrainMutationProbe.every((entry) => entry.beforeIce === entry.afterIce && entry.addedIce.length === 0), "collecting any power-up must never add ice terrain");
assert(terrainMutationProbe.filter((entry) => entry.type !== "shovel").every((entry) => entry.changes.length === 0), "non-shovel power-ups must not mutate terrain cells");
const shovelTerrainMutation = terrainMutationProbe.find((entry) => entry.type === "shovel");
assert(shovelTerrainMutation.changes.length === 5, "shovel should change only the five original base-wall cells");
assert(shovelTerrainMutation.changes.every((change) => change.before === "brick" && change.after === "steel"), "shovel base-wall changes should be brick-to-steel, never ice");
assert(shovelTerrainMutation.expiredIce === shovelTerrainMutation.beforeIce, "shovel flashing and expiry must preserve all existing ice cells without adding any");
assert(shovelTerrainMutation.expiryChanges.length === 0, "shovel expiry should restore the five base-wall cells to their original brick state");
const powerUpTypePoolProbe = context.window.TankDefender8.debugPowerUpTypePoolProbe();
assert(powerUpTypePoolProbe.starFrameParts >= 8 && powerUpTypePoolProbe.starPrimaryParts >= 5, "star power-up should use a recognizable multi-part frame");
const powerUpFlashProbe = context.window.TankDefender8.debugPowerUpFlashCadenceProbe();
assert(powerUpFlashProbe.slice(0, 8).every((frame) => frame.visible === false), "uncollected power-ups should be hidden for the first eight-frame band");
assert(powerUpFlashProbe.slice(8, 16).every((frame) => frame.visible === true), "uncollected power-ups should be visible for the second eight-frame band");
assert(powerUpFlashProbe.slice(16, 24).every((frame) => frame.visible === false), "power-up visibility should repeat with another eight hidden frames");
assert(powerUpFlashProbe.slice(24, 32).every((frame) => frame.visible === true), "power-up visibility should repeat with another eight visible frames");
const pausedPowerUpVisualProbe = context.window.TankDefender8.debugPausedPowerUpVisualProbe();
assert(pausedPowerUpVisualProbe.initial.displayFrame === 7 && pausedPowerUpVisualProbe.initial.powerUpVisible === false, "a paused power-up should start from the current battle display phase");
assert(pausedPowerUpVisualProbe.afterOneFrame.tick === 7 && pausedPowerUpVisualProbe.afterOneFrame.displayFrame === 8 && pausedPowerUpVisualProbe.afterOneFrame.powerUpVisible === true, "paused display frames should keep an uncollected power-up flashing without advancing battle time");
assert(pausedPowerUpVisualProbe.afterNineFrames.displayFrame === 16 && pausedPowerUpVisualProbe.afterNineFrames.powerUpVisible === false, "paused power-up flashing should repeat across the next eight-frame boundary");
assert(pausedPowerUpVisualProbe.initial.waterFrame === pausedPowerUpVisualProbe.afterNineFrames.waterFrame, "water should remain in the same 32-frame animation band across these nine paused frames");
assert(pausedPowerUpVisualProbe.afterResume.tick === 23 && pausedPowerUpVisualProbe.afterResume.displayFrame === 16, "resumed power-up animation should retain the independently advanced NMI-style display phase");
const waterAnimationProbe = context.window.TankDefender8.debugWaterAnimationCadenceProbe();
assert(waterAnimationProbe.map((entry) => entry.frame).join(",") === "waterA,waterA,waterB,waterB,waterA,waterA,waterB", "water animation should switch on bit five of the global frame counter");
const activeBulletProbe = context.window.TankDefender8.debugActiveBulletLimitProbe();
assert(activeBulletProbe.base.maxBullets === 1, "base player tank should have a one-bullet active limit");
assert(activeBulletProbe.base.counts.join(",") === "1,1", "base player tank should not fire a second active bullet");
assert(activeBulletProbe.upgraded.maxBullets === 2, "second-star player tank should have a two-bullet active limit");
assert(activeBulletProbe.upgraded.counts.join(",") === "1,2,2", "second-star player tank should not exceed two active bullets");
assert(activeBulletProbe.upgraded.speeds.every((speed) => speed === schema.playerUpgradeRules[2].bulletSpeed), "upgraded active bullets should use the fast bullet speed");
assert(activeBulletProbe.upgraded.powers.every((power) => power === 1), "second-star active bullets should still use normal wall power");
assert(activeBulletProbe.enemy.maxBullets === 1, "enemy tanks should have a one-bullet active limit");
assert(activeBulletProbe.enemy.counts.join(",") === "1,1", "enemy tanks should not fire a second active bullet while their first remains on screen");
assert(activeBulletProbe.enemy.speeds[0] === schema.enemyTypes[2].bullet, "enemy active bullet probe should use the configured enemy bullet speed");
assert(activeBulletProbe.enemy.powers[0] === schema.enemyTypes[2].wallPower, "enemy active bullet probe should use the configured enemy wall power");
const playerFireInputProbe = context.window.TankDefender8.debugPlayerFireInputProbe();
assert(playerFireInputProbe.firstPress === 1, "a fresh player fire press should create one bullet");
assert(playerFireInputProbe.heldAfterBulletClears === 0, "holding fire should not automatically shoot again after the active bullet clears");
assert(playerFireInputProbe.repressAfterRelease === 1, "releasing and pressing fire again should create a new bullet");
assert(playerFireInputProbe.fullSlotPress === 1 && playerFireInputProbe.fullSlotPressAfterClear === 0, "a fire press made while the bullet slot is full should be discarded");
assert(playerFireInputProbe.fullSlotRepress === 1, "a new fire press should work after a full bullet slot becomes free");
assert(playerFireInputProbe.doubleShotCounts.join(",") === "1,2,2", "second-star tanks should fill two bullet slots with separate presses and discard a press when both are occupied");
assert(playerFireInputProbe.spawnPress === 0 && playerFireInputProbe.spawnPressAfterUnlock === 0, "fire pressed during player spawning should be discarded instead of queued");
assert(playerFireInputProbe.stunnedPress === 1, "a stunned player should still fire from a fresh press");
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
assert(counts.join(",") === "14,4,0,2", "built-in stage 2 enemy groups should be 14 basic, 4 fast, and 2 armor");
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

byAction.edit.click();
byAction.clear.click();
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.editorBrush === "brick", "editor should default to the brick brush");
assert(snapshot.fieldGeometry.x === 16 && snapshot.fieldGeometry.panelX === 224 && snapshot.fieldGeometry.panelWidth === 32, "runtime geometry should match the original 16px left border and 32px side panel");
assert(snapshot.editorCursor.qc === 0 && snapshot.editorCursor.qr === 0, "construction cursor should start at the first 16px cell");
assert(snapshot.editorPattern === 0 && snapshot.editorPatternArmed === false, "construction should start on original block pattern 0");
keyPress("Space");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.editorPattern === 0 && snapshot.editorPatternArmed === true, "first A press should place without advancing the block pattern");
assert(snapshot.editorQuadrants[0].slice(0, 2) === ".B" && snapshot.editorQuadrants[1].slice(0, 2) === ".B", "original block pattern 0 should place the right brick half");
keyPress("Space");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.editorPattern === 1, "second A press should advance to original block pattern 1");
assert(snapshot.editorQuadrants[0].slice(0, 2) === ".." && snapshot.editorQuadrants[1].slice(0, 2) === "BB", "original block pattern 1 should place the lower brick half");
keyPress("ArrowRight");
keyPress("KeyF");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.editorCursor.qc === 2 && snapshot.editorCursor.qr === 0, "construction D-pad should move one 16px cell at a time");
assert(snapshot.editorPattern === 1 && snapshot.editorQuadrants[1].slice(2, 4) === "BB", "moving should reset the A/B cycle so the first B press places the current pattern");
keyPress("KeyF");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.editorPattern === 0 && snapshot.editorQuadrants[0].slice(2, 4) === ".B", "second B press should move backward and place the previous pattern");
keyPress("KeyD");
keyPress("KeyS");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.editorCursor.qc === 4 && snapshot.editorCursor.qr === 2, "construction WASD should mirror the D-pad");
keyPress("Digit2");
canvas.listeners.click({ clientX: 57, clientY: 57, shiftKey: false, altKey: false });
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.editorBrush === "steel", "digit keys should retain the precise browser editor brush shortcuts");
byAction.save.click();
assert(storage["tank-defender-8-editor-stage"], "editor save did not write localStorage");
assert(JSON.parse(storage["tank-defender-8-editor-stage"]).quadrants[0].slice(0, 4) === "...B", "editor save should preserve original half-block patterns");
assert(JSON.parse(storage["tank-defender-8-editor-stage"]).quadrants[5][5] === "S", "editor save should preserve optional 8px mouse edits");
byAction.clear.click();
byAction.load.click();
byAction.export.click();
const exportedPack = JSON.parse(clipboard.text);
assert(Array.isArray(exportedPack.quadrants), "editor export should use quadrant format");
assert(exportedPack.quadrants[0].length === 26, "exported quadrant map should have 26 rows");
assert(exportedPack.quadrants[0][0].length === 26, "exported quadrant rows should have 26 columns");
assert(exportedPack.quadrants[0][0].slice(0, 4) === "...B", "editor export should preserve original construction patterns");
assert(exportedPack.quadrants[0][5][5] === "S", "editor export should preserve optional 8px quadrant edits");
assert(exportedPack.stageSettings[0].powerUpSpawns.length === 16, "editor export should include power-up spawn points");
byAction.import.click();
assert(fileInput.clicked, "import button did not open file input");
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title" && snapshot.stage === 1 && snapshot.hasConstructedStage === true, "Start should leave construction and install the edited stage as stage 1");
byAction.one.click();
finishStageSelectClosing();
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "stageIntro" && snapshot.constructionStageActive === true, "starting stage 1 should activate the constructed map");
assert(snapshot.battleQuadrants[0].slice(0, 4) === "...B" && snapshot.battleQuadrants[5][5] === "S", "constructed stage 1 should preserve the edited terrain without clearing spawn cells");
const constructionAdvanceProbe = context.window.TankDefender8.debugStageClearAdvanceProbe(1);
assert(constructionAdvanceProbe.stage === 2 && constructionAdvanceProbe.constructionStageActive === false, "clearing the constructed stage should continue to the normal stage 2");
byAction.edit.click();
byAction.test.click();
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.players.length === 1, "editor test should start a one-player game");
assert(snapshot.playerSpawns[0].x === 4 && snapshot.playerSpawns[0].y === 12, "editor test should normalize player spawns");
assert(snapshot.powerUpSpawns[0].x === 1 && snapshot.powerUpSpawns[0].y === 1, "editor test should normalize power-up spawns");
assert(snapshot.players[0].stageKills.length === 4, "stage kill table should track four enemy types");
assert(snapshot.players[0].totalKills.length === 4, "total kill table should track four enemy types");
assert(context.window.TankDefender8.currentPackInfo().id === "custom-stage", "editor test should use a temporary custom stage pack");
byAction.reset.click();
snapshot = context.window.TankDefender8.debugSnapshot();
assert(context.window.TankDefender8.currentPackInfo().id === "original-style", "reset should restore the built-in original-style pack");
assert(snapshot.screen === "title" && snapshot.stage === 1, "reset should return to the first title-stage selection");
assert(snapshot.stageCycleLimit === 70, "reset should restore the original-style 70-stage cycle");
assert(snapshot.players.length === 0 && snapshot.enemySpawned === 0, "reset should clear temporary gameplay state");

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
