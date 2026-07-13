const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src", "game.js"), "utf8");
const samplePack = JSON.parse(fs.readFileSync(path.join(root, "data", "sample-stage-pack.json"), "utf8"));
const quadrantPack = JSON.parse(fs.readFileSync(path.join(root, "data", "sample-quadrant-stage-pack.json"), "utf8"));
const freePack = JSON.parse(fs.readFileSync(path.join(root, "data", "free-35-stage-pack.json"), "utf8"));
const audioManifest = JSON.parse(fs.readFileSync(path.join(root, "data", "free-audio-manifest.json"), "utf8"));
const spriteManifest = JSON.parse(fs.readFileSync(path.join(root, "data", "free-sprite-manifest.json"), "utf8"));

class FakeButton {
  constructor(action, text) {
    this.dataset = { action };
    this.textContent = text;
    this.listeners = {};
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  click() {
    if (this.listeners.click) return this.listeners.click({ type: "click" });
    return undefined;
  }
}

class FakeInput {
  constructor() {
    this.files = [];
    this.value = "";
    this.listeners = {};
    this.clicked = false;
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  click() {
    this.clicked = true;
  }
}

const CANVAS_W = 256;
const CANVAS_H = 240;

function makeCanvasContext() {
  const calls = [];
  const pixels = Array(CANVAS_W * CANVAS_H).fill(null);

  function clampPixel(value, max) {
    return Math.max(0, Math.min(max, value));
  }

  function paintRect(x, y, w, h, style) {
    const left = clampPixel(Math.floor(x), CANVAS_W);
    const top = clampPixel(Math.floor(y), CANVAS_H);
    const right = clampPixel(Math.ceil(x + w), CANVAS_W);
    const bottom = clampPixel(Math.ceil(y + h), CANVAS_H);
    for (let py = top; py < bottom; py += 1) {
      for (let px = left; px < right; px += 1) {
        pixels[py * CANVAS_W + px] = style;
      }
    }
  }

  function pixelColors(rect) {
    const counts = {};
    const left = clampPixel(Math.floor(rect.x), CANVAS_W);
    const top = clampPixel(Math.floor(rect.y), CANVAS_H);
    const right = clampPixel(Math.ceil(rect.x + rect.w), CANVAS_W);
    const bottom = clampPixel(Math.ceil(rect.y + rect.h), CANVAS_H);
    for (let py = top; py < bottom; py += 1) {
      for (let px = left; px < right; px += 1) {
        const color = pixels[py * CANVAS_W + px];
        counts[color] = (counts[color] || 0) + 1;
      }
    }
    return counts;
  }

  return {
    calls,
    pixels,
    fillStyle: "#000",
    strokeStyle: "#000",
    lineWidth: 1,
    font: "",
    textBaseline: "top",
    imageSmoothingEnabled: false,
    fillRect(x, y, w, h) {
      calls.push({ op: "fillRect", style: this.fillStyle, x, y, w, h });
      paintRect(x, y, w, h, this.fillStyle);
    },
    strokeRect(x, y, w, h) {
      calls.push({ op: "strokeRect", style: this.strokeStyle, x, y, w, h });
      paintRect(x, y, w, 1, this.strokeStyle);
      paintRect(x, y + h - 1, w, 1, this.strokeStyle);
      paintRect(x, y, 1, h, this.strokeStyle);
      paintRect(x + w - 1, y, 1, h, this.strokeStyle);
    },
    pixelColors,
    resetPixels() {
      pixels.fill(null);
    },
    clearRect(x, y, w, h) {
      paintRect(x, y, w, h, null);
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fillText(text, x, y) {
      calls.push({ op: "fillText", text, x, y, font: this.font, style: this.fillStyle });
    }
  };
}

function makeAudioContext() {
  const gainNode = {
    gain: {
      setValueAtTime() {},
      exponentialRampToValueAtTime() {}
    },
    connect() {
      return this;
    }
  };
  return class FakeAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = "running";
      this.destination = {};
    }

    createOscillator() {
      return {
        frequency: { value: 0 },
        type: "square",
        connect() {
          return gainNode;
        },
        start() {},
        stop() {}
      };
    }

    createGain() {
      return gainNode;
    }

    resume() {
      this.state = "running";
    }
  };
}

const actions = ["one", "two", "prev", "next", "edit", "test", "save", "load", "clear", "export", "import", "pause", "reset"];
const buttons = actions.map((action) => new FakeButton(action, action.toUpperCase()));
const listeners = {};
const storage = { "tank-defender-8-high-score": "12345" };
const clipboard = { text: "" };
const canvasContext = makeCanvasContext();
const fileInput = new FakeInput();
let animationFrameCallback = null;

const canvas = {
  width: 256,
  height: 240,
  listeners: {},
  getContext(type) {
    if (type !== "2d") throw new Error(`unexpected canvas context: ${type}`);
    return canvasContext;
  },
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 256, height: 240 };
  },
  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }
};

const document = {
  getElementById(id) {
    if (id === "game") return canvas;
    if (id === "stage-pack-file") return fileInput;
    return null;
  },
  querySelectorAll(selector) {
    return selector === "[data-action]" ? buttons : [];
  },
  querySelector(selector) {
    return selector === "#game" ? canvas : null;
  }
};

const window = {
  AudioContext: makeAudioContext(),
  addEventListener(type, listener) {
    listeners[type] = listener;
  }
};

const context = {
  console,
  document,
  window,
  navigator: {
    clipboard: {
      async writeText(text) {
        clipboard.text = text;
      }
    }
  },
  localStorage: {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
    setItem(key, value) {
      storage[key] = String(value);
    }
  },
  performance: { now: () => 0 },
  requestAnimationFrame(listener) {
    animationFrameCallback = listener;
  },
  setTimeout(listener) {
    listener();
  }
};

context.globalThis = context;

vm.runInNewContext(source, context, { filename: "src/game.js" });

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

function enemyGroupCounts(groups) {
  return groups.reduce((counts, group) => {
    counts[group[1]] += group[0];
    return counts;
  }, [0, 0, 0, 0]);
}

function namedEnemyGroups(groups) {
  const names = ["basic", "fast", "power", "armor"];
  return groups.map((group) => ({
    count: group[0],
    typeIndex: group[1],
    type: names[group[1]]
  }));
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

assert(context.window.TankDefender8, "TankDefender8 API was not exposed");
const runtimeAudioManifest = context.window.TankDefender8.audioManifest();
assert(runtimeAudioManifest.id === "free-synth-audio", "runtime audio manifest id should match the free replacement manifest");
assert(Object.keys(runtimeAudioManifest.events).length >= 18, "runtime audio manifest should expose gameplay sound events");
assert(runtimeAudioManifest.events.powerUp.wave === "triangle", "runtime audio manifest should expose power-up sound shape");
assert(runtimeAudioManifest.events.pause.wave === "square", "entering pause should use the replacement pause sound");
assert(runtimeAudioManifest.events.scoreCount.wave === "square", "result-table count ticks should use the replacement score-count sound");
assert(runtimeAudioManifest.events.stageBonus.wave === "triangle", "result-table leader bonus should use the replacement bonus sound");
assert(runtimeAudioManifest.events.gameOver.duration === 3, "full-screen game-over replacement fanfare should last three seconds");
assert(runtimeAudioManifest.events.gameOver.voices.length === 3, "game-over replacement fanfare should preserve a three-voice arrangement");
assert(runtimeAudioManifest.events.gameOver.voices.every((voice) => voice.notes.length === 15), "each game-over voice should cover the full 180-frame interstitial");
assert(runtimeAudioManifest.events.highScore.duration === 9.6 && runtimeAudioManifest.events.highScore.repeat === 3, "high-score replacement fanfare should span the original-style celebration window");
assert(runtimeAudioManifest.events.highScore.notes.length === 16, "high-score replacement fanfare should expose its complete procedural phrase");
assert(stableJson(runtimeAudioManifest) === stableJson(audioManifest), "runtime audio manifest should match data/free-audio-manifest.json");
const pauseProbe = context.window.TankDefender8.debugPauseBehaviorProbe();
assert(pauseProbe.entered === true && pauseProbe.exited === true, "active gameplay should accept both pause and unpause toggles");
assert(pauseProbe.entry.paused === true && pauseProbe.entry.pauseElapsed === 0, "entering pause should reset its display-frame counter");
assert(pauseProbe.entry.pendingFirePresses === 0, "entering pause should discard queued fire presses");
assert(pauseProbe.pausedUpdate.tick === 15 && pauseProbe.pausedUpdate.pauseElapsed === 1, "paused display frames should advance pause flashing without advancing gameplay time");
assert(pauseProbe.stageIntroAccepted === false && pauseProbe.demoAccepted === false, "stage intro and title demo should reject pause toggles");
assert(pauseProbe.inputs.map((entry) => `${entry.code}:${entry.accepted}`).join(",") === "Enter:true,KeyP:true,Escape:false", "only Start and the documented P extension should pause active gameplay");
assert(pauseProbe.frames[0].visible === false && pauseProbe.frames[1].visible === true && pauseProbe.frames[2].visible === true && pauseProbe.frames[3].visible === false, "PAUSE should alternate through sixteen hidden and sixteen visible frames");
assert(pauseProbe.frames[1].text === "PAUSE" && pauseProbe.frames[1].x === 100 && pauseProbe.frames[1].y === 128, "PAUSE should use the original sprite coordinates without a backing panel");
const pausedStageEndProbe = context.window.TankDefender8.debugPausedStageEndProbe();
assert(pausedStageEndProbe.incomplete.screen === "playing" && pausedStageEndProbe.incomplete.paused === true && pausedStageEndProbe.incomplete.pauseElapsed === 1, "an incomplete stage should remain paused while its display frame advances");
assert(pausedStageEndProbe.incomplete.tick === 41 && pausedStageEndProbe.detected.tick === 41, "paused stage-end checks should not advance battle time");
assert(pausedStageEndProbe.detected.enemyCount === 0 && pausedStageEndProbe.detected.paused === false && pausedStageEndProbe.detected.pauseElapsed === 0, "detecting the final defeated enemy during pause should leave the pausable battle loop");
assert(pausedStageEndProbe.detected.screen === "playing" && pausedStageEndProbe.detected.clearPendingTimer === pausedStageEndProbe.delay, "paused stage completion should load the full active clear delay without consuming a frame on detection");
assert(pausedStageEndProbe.pauseAcceptedDuringDelay === false, "the post-clear activity delay should reject new pause input");
canvasContext.calls.length = 0;
context.window.TankDefender8.debugRenderPauseFrame(15);
assert(canvasContext.calls.length === 0, "a hidden PAUSE phase should not draw any overlay pixels");
canvasContext.calls.length = 0;
const renderedPause = context.window.TankDefender8.debugRenderPauseFrame(16);
assert(canvasContext.calls.length > 0 && renderedPause.visible === true, "a visible PAUSE phase should render its pixel lettering");
assert(!canvasContext.calls.some((call) => call.op === "fillRect" && call.w === 100 && call.h === 30), "PAUSE should not retain the previous backing panel");
assert(canvasContext.calls.every((call) => call.x >= 100 && call.x < 130 && call.y >= 128 && call.y < 136), "PAUSE glyph pixels should stay within the original five-sprite footprint");
const runtimeSpriteManifest = context.window.TankDefender8.spriteManifest();
assert(runtimeSpriteManifest.id === "free-procedural-sprites", "runtime sprite manifest id should match the free replacement manifest");
assert(runtimeSpriteManifest.sprites.tank.frames.up.length === 7, "runtime sprite manifest should expose tank frames");
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
assert(titleDemoProbe.timeoutFrames === 2560, "title demo should use the original ten high-byte frame timeout");
assert(titleDemoProbe.selectionResetFrames === 0xab, "changing the title selection should clear only the high frame counter and preserve its low-byte phase");
assert(titleDemoProbe.beforeTimeout.screen === "title" && titleDemoProbe.beforeTimeout.idleFrames === 2559, "title should remain visible through idle frame 2559");
assert(titleDemoProbe.beforeTimeout.demoMode === false, "title should not enter demo before the timeout boundary");
assert(titleDemoProbe.afterTimeout.screen === "playing" && titleDemoProbe.afterTimeout.demoMode === true, "idle frame 2560 should enter the attract demo directly");
assert(titleDemoProbe.afterTimeout.stage === 30 && titleDemoProbe.afterTimeout.transitionTimer === 0, "the demo should display stage 30 without a stage-intro curtain");
assert(titleDemoProbe.afterTimeout.playerCount === 2 && titleDemoProbe.afterTimeout.playerIds.join(",") === "1,2", "the demo should spawn both AI-controlled players");
assert(titleDemoProbe.afterTimeout.maxActiveEnemies === 4, "the demo should retain the original four-active-enemy limit");
assert(titleDemoProbe.enemyTargets[0].targetId === 202 && titleDemoProbe.enemyTargets[1].targetId === 203, "demo players should use their original slot-priority enemy targets");
assert(titleDemoProbe.powerUpTarget.targetKind === "powerUp" && titleDemoProbe.powerUpTarget.targetId === "star", "demo AI should prioritize an available power-up over enemies");
assert(titleDemoProbe.scoreIsolation.score === 0 && titleDemoProbe.scoreIsolation.stagePoints === 0, "demo kills and pickups should not change player scores");
assert(titleDemoProbe.scoreIsolation.stageKills.every((count) => count === 0), "demo kills should not enter stage result counters");
assert(titleDemoProbe.scoreIsolation.level === 1 && titleDemoProbe.scoreIsolation.scorePopupCount === 0, "demo pickups should apply effects without showing score popups");
assert(titleDemoProbe.afterExit.screen === "title" && titleDemoProbe.afterExit.stage === 1 && titleDemoProbe.afterExit.demoMode === false, "leaving the demo should restore a clean stage-1 title state");
assert(titleDemoProbe.afterExit.playerCount === 0 && titleDemoProbe.afterExit.idleFrames === 0, "leaving the demo should clear demo actors and reset its idle timer");
assert(titleDemoProbe.afterConstruction.screen === "title" && titleDemoProbe.afterConstruction.idleFrames === 2559, "an active Construction-use cycle should suppress the automatic demo");
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
assert(hiddenMessageProbe.alternateSelection.screen === "stageSelect" && hiddenMessageProbe.alternateSelection.players === 1, "the hidden cutscene should continue through the currently selected title handler");
const fullGameOverProbe = context.window.TankDefender8.debugFullGameOverScreenProbe();
assert(fullGameOverProbe.duration === 180, "full-screen game over should match its three-second replacement fanfare at 60 Hz");
assert(fullGameOverProbe.entry.screen === "fullGameOver" && fullGameOverProbe.entry.elapsed === 0, "game-over interstitial should start on its own screen at frame zero");
assert(fullGameOverProbe.entry.paused === false, "game-over interstitial should not retain a paused game state");
assert(
  fullGameOverProbe.presentation.x === 0x3c &&
    fullGameOverProbe.presentation.gameY === 0x46 &&
    fullGameOverProbe.presentation.overY === 0x78 &&
    fullGameOverProbe.presentation.letterAdvance === 0x20,
  "full-screen game-over lettering should retain the original coordinates and 32-pixel advance"
);
assert(fullGameOverProbe.beforeEnd.screen === "fullGameOver" && fullGameOverProbe.beforeEnd.elapsed === 179, "full-screen game over should remain visible through frame 179");
assert(fullGameOverProbe.afterEnd.screen === "title" && fullGameOverProbe.afterEnd.elapsed === 0, "frame 180 should return a non-record run to the title");
assert(fullGameOverProbe.ignoredInput.handled === false && fullGameOverProbe.ignoredInput.screen === "fullGameOver", "ordinary controls should not dismiss full-screen game over");
assert(fullGameOverProbe.startSkip.handled === true && fullGameOverProbe.startSkip.screen === "title", "keyboard Start should skip full-screen game over");
assert(fullGameOverProbe.selectSkip.handled === true && fullGameOverProbe.selectSkip.screen === "title", "keyboard Select should skip full-screen game over");
assert(fullGameOverProbe.highScoreRoute.screen === "highScore" && fullGameOverProbe.highScoreRoute.elapsed === 0, "a new record should follow full-screen game over with the high-score celebration");
canvasContext.calls.length = 0;
canvasContext.resetPixels();
const renderedFullGameOver = context.window.TankDefender8.debugRenderFullGameOverFrame(42);
assert(renderedFullGameOver.elapsed === 42, "full-screen game-over renderer should preserve the requested logic frame");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#000000" && call.x === 0 && call.y === 0 && call.w === 256 && call.h === 240), "full-screen game over should clear the complete canvas to black");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#f05a42"), "full-screen game over should render striped replacement lettering");
assert(!canvasContext.calls.some((call) => call.op === "fillText"), "full-screen game-over text should remain pixel-rendered without anti-aliasing");
assert(
  canvasContext.calls.filter((call) => call.op === "fillRect").every((call) => [call.x, call.y, call.w, call.h].every(Number.isInteger)),
  "full-screen game-over rectangles should stay on integer pixel boundaries"
);
const highScoreScreenProbe = context.window.TankDefender8.debugHighScoreScreenProbe();
assert(highScoreScreenProbe.duration === 576, "new-high-score celebration should match its 9.6-second replacement fanfare at 60 Hz");
assert(highScoreScreenProbe.tie.triggered === false, "matching the old high score should not trigger the celebration");
assert(highScoreScreenProbe.strictBeat.triggered === true && highScoreScreenProbe.strictBeat.screen === "gameOver", "strictly beating the run-start record should arm the celebration after GAME OVER");
assert(highScoreScreenProbe.started.screen === "highScore" && highScoreScreenProbe.started.elapsed === 0, "finishing GAME OVER with a new record should enter the high-score screen at frame zero");
assert(new Set(highScoreScreenProbe.paletteFrames.slice(0, 4).map((frame) => frame.color)).size === 4, "high-score lettering should cycle through four palette colors on consecutive frames");
assert(highScoreScreenProbe.paletteFrames[0].color === highScoreScreenProbe.paletteFrames[4].color, "high-score palette should repeat every four frames");
assert(highScoreScreenProbe.sevenDigit.scoreText === "1234567" && highScoreScreenProbe.sevenDigit.scoreX === 23, "high-score screen should retain and center all seven score digits");
assert(highScoreScreenProbe.beforeEnd.screen === "highScore" && highScoreScreenProbe.beforeEnd.elapsed === 575, "high-score celebration should remain visible through frame 575");
assert(highScoreScreenProbe.afterEnd.screen === "title" && highScoreScreenProbe.afterEnd.elapsed === 0 && highScoreScreenProbe.afterEnd.triggered === false, "frame 576 should return to a clean title state");
assert(highScoreScreenProbe.belowRecord.screen === "title" && highScoreScreenProbe.belowRecord.triggered === false, "a below-record game should bypass the high-score screen");
canvasContext.calls.length = 0;
canvasContext.resetPixels();
const renderedHighScore = context.window.TankDefender8.debugRenderHighScoreFrame(1, 1234567);
assert(renderedHighScore.color === "#345fd1", "rendered high-score frame should use its matching palette phase");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#345fd1"), "high-score replacement letters should render the phase color with integer rectangles");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#f7f1c6"), "high-score replacement letters should retain bright stripe highlights");
assert(!canvasContext.calls.some((call) => call.op === "fillText"), "high-score text should remain pixel-rendered without anti-aliasing");
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
const twoPlayerTitleScoreLayout = context.window.TankDefender8.debugTitleScoreLayoutProbe(1).sort((a, b) => a.x - b.x);
assert(twoPlayerTitleScoreLayout.map((item) => item.id).join(",") === "p1Label,p1Score,highLabel,highScore,p2Label,p2Score", "two-player title should expose all six score groups in display order");
assert(
  twoPlayerTitleScoreLayout.every((item, index) => index === 0 || twoPlayerTitleScoreLayout[index - 1].right < item.x),
  "two-player title score groups must not overlap"
);
assert(twoPlayerTitleScoreLayout.find((item) => item.id === "highScore").x === 128, "title high score should start at the original non-overlapping character column");
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
assert(snapshot.screen === "stageSelect" && snapshot.stageSelectPlayers === 1, "one-player shortcut should enter the original stage-selection screen");
assert(snapshot.stage === 1 && snapshot.stageSelectLimit === 35, "stage selection should start at stage 1 and stop at the original stage 35 limit");
keyPress("Space");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stage === 2, "stage-selection A should increment the stage");
keyPress("KeyF");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stage === 1, "stage-selection B should decrement the stage");
keyPress("KeyF");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.stage === 35, "stage-selection B should wrap stage 1 to stage 35");
keyPress("Space");
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "stageIntro" && snapshot.stage === 1 && snapshot.paused === false, "stage-selection Start should begin the selected stage intro");
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "stageIntro" && snapshot.paused === false, "Start-equivalent Enter should not pause before active gameplay begins");
buttons.find((button) => button.dataset.action === "reset").click();
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title" && snapshot.paused === false, "reset after Start-pause probe should return to the title screen");
assert(schema.enemyTotal === 20, "schema enemy total should be 20");
assert(schema.enemyTypes.length === 4, "schema should expose four enemy types");
assert(schema.enemyTypes[3].hp === 4, "schema should expose armor enemy hp");
assert(schema.enemyTypes[3].hitColors[0] === "#b0b5c3", "schema should expose armor low-health gray color");
assert(schema.enemyTypes[3].hitColors[3] === "#7fba72", "schema should expose armor full-health green color");
assert(schema.enemyTypes[2].score === 300, "schema should expose enemy scores");
assert(schema.enemyTypes.every((enemy) => enemy.fireChance === 1 / 32), "every enemy should use the original 1-in-32 per-frame fire roll");
assert(schema.enemyTypes.every((enemy) => enemy.wallPower === 1), "enemy bullets should not gain player-style steel-breaking power");
assert(schema.enemyTypes[0].speed === 0.5 && schema.enemyTypes[2].speed === 0.5 && schema.enemyTypes[3].speed === 0.5, "basic, power, and armor enemies should move on alternate frames");
assert(schema.enemyTypes[1].speed === 1, "fast enemies should move every frame");
assert(schema.enemyTypes[0].speed < schema.enemyTypes[1].speed, "fast enemies should move twice as quickly as the other enemy types");
assert(schema.enemyTypes[0].bullet === 2 && schema.enemyTypes[1].bullet === 2 && schema.enemyTypes[3].bullet === 2, "basic, fast, and armor enemies should use two-pixel bullets");
assert(schema.enemyTypes[2].bullet === 4, "power enemies should use four-pixel fast bullets");
assert(schema.enemyTypes.every((enemy) => enemy.reload === 1), "enemy firing should be limited by its active bullet slot rather than a long cooldown");
assert(schema.gameSettings.initialLives === 3, "schema should expose initial lives");
assert(schema.gameSettings.bonusLifeScores[0] === 20000, "schema should expose bonus life scores");
assert(schema.gameSettings.deathPowerLevel === 0, "schema should expose death power level");
assert(schema.gameSettings.powerUpDurations.helmet === 10, "schema should expose helmet 64-frame timer units");
assert(schema.gameSettings.powerUpDurations.shovel === 20, "schema should expose shovel 64-frame timer units");
assert(schema.gameSettings.powerUpDurations.shovelFlash === 4, "schema should expose the shovel flash threshold");
assert(schema.gameSettings.powerUpDurations.timer === 10, "schema should expose timer power-up 64-frame units");
assert(schema.gameSettings.powerUpRules.carrierRelease === "hit", "schema should expose carrier release rule");
assert(schema.gameSettings.powerUpRules.clearUncollectedOnCarrierSpawn === true, "schema should expose carrier spawn power-up clearing rule");
assert(schema.gameSettings.powerUpRules.pickupScore === 500, "schema should expose power-up pickup score");
assert(schema.gameSettings.timings.stageIntro === 86, "schema should expose stage intro timing");
assert(schema.gameSettings.timings.stageClearDelay === 128, "schema should expose the original 128-frame stage clear delay");
assert(schema.gameSettings.timings.stageClear === 0, "zero stage-clear timing should select the dynamic original result schedule");
const stageIntroStartProbe = context.window.TankDefender8.debugStageIntroCurtainProbe(schema.gameSettings.timings.stageIntro);
const stageIntroMidProbe = context.window.TankDefender8.debugStageIntroCurtainProbe(Math.floor(schema.gameSettings.timings.stageIntro / 2));
const stageIntroEndProbe = context.window.TankDefender8.debugStageIntroCurtainProbe(0);
assert(stageIntroStartProbe.coverWidth === 104, "stage intro curtain should begin fully covering both battlefield halves");
assert(stageIntroStartProbe.left.x === 16 && stageIntroStartProbe.left.y === 16 && stageIntroStartProbe.left.h === 208, "stage intro curtain should start inside the original left border");
assert(stageIntroStartProbe.right.x === 120 && stageIntroStartProbe.right.x + stageIntroStartProbe.right.w === 224, "stage intro right curtain should cover through the original battlefield edge");
assert(stageIntroMidProbe.coverWidth > 0 && stageIntroMidProbe.coverWidth < stageIntroStartProbe.coverWidth, "stage intro curtain should open during the countdown");
assert(stageIntroEndProbe.coverWidth === 0 && stageIntroEndProbe.left.w === 0 && stageIntroEndProbe.right.w === 0, "stage intro curtain should be fully open at the end");
assert(schema.gameSettings.timings.gameOverSlide === 127, "schema should expose the original 127-frame game-over slide");
assert(schema.gameSettings.timings.gameOverHold === 129, "schema should expose the original 129-frame centered game-over hold");
assert(schema.gameSettings.timings.playerRespawn === 24, "schema should expose the original player death-state ticks");
assert(schema.gameSettings.timings.playerSpawnFlash === 28, "schema should expose the original player spawn-state ticks");
assert(schema.gameSettings.timings.playerInvulnerability === 3, "schema should expose post-spawn shield 64-frame units");
assert(schema.gameSettings.timings.enemySpawnFlash === 28, "schema should expose the original twenty-eight-frame enemy spawn state");
assert(schema.gameSettings.timings.enemyInitialReload === 0, "new enemies should not receive an artificial firing cooldown");
assert(schema.gameSettings.timings.enemySpawnRetry === 25, "schema should expose enemy spawn retry timing");
assert(schema.gameSettings.timings.powerUpTtl === 0, "schema should expose non-expiring default power-up TTL");
assert(schema.gameSettings.enemySpawnPacing.firstDelay === 0, "the first enemy should be eligible to spawn immediately");
assert(schema.gameSettings.enemySpawnPacing.baseDelay === 190, "schema should expose the original enemy spawn base interval");
assert(schema.gameSettings.enemySpawnPacing.stageStep === 4, "schema should expose the original four-frame stage step");
assert(schema.gameSettings.enemySpawnPacing.minDelay === 50, "schema should expose the stage-35 spawn interval floor");
assert(schema.gameSettings.enemySpawnPacing.extendedLoopMinDelay === 50, "extended-loop stages should retain the stage-35 interval");
assert(schema.gameSettings.enemySpawnPacing.twoPlayerDelayReduction === 20, "two-player mode should subtract twenty frames from spawn intervals");
assert(schema.gameSettings.playerMovement.speed === 1, "schema should expose the original one-pixel active-frame movement speed");
assert(schema.gameSettings.playerMovement.frameCadence.join(",") === "true,true,false,true", "schema should expose the original three-of-four player movement cadence");
assert(schema.gameSettings.playerMovement.iceSlideFrames === 28, "schema should expose the original ice inertia counter");
assert(schema.gameSettings.playerMovement.iceSlideSpeed === 1, "schema should expose full-speed ice movement");
assert(schema.gameSettings.projectileRules.bulletSize === 4, "schema should expose projectile bullet size");
assert(schema.gameSettings.projectileRules.spawnOffset === 9, "schema should expose projectile spawn offset");
assert(schema.gameSettings.projectileRules.boundsPadding === 4, "schema should expose projectile bounds padding");
assert(schema.gameSettings.friendlyFire.enabled === true, "schema should expose friendly-fire enabled rule");
assert(schema.gameSettings.friendlyFire.stunFrames === 200, "schema should expose the original friendly-fire stun ticks");
assert(schema.gameSettings.explosionRules.bulletCancel.ttl === 10, "schema should expose bullet cancel explosion timing");
assert(schema.gameSettings.explosionRules.brickHit.ttl === 9, "brick impacts should use the original nine-frame bullet explosion");
assert(schema.gameSettings.explosionRules.steelHit.ttl === 9 && schema.gameSettings.explosionRules.steelBlocked.ttl === 9, "steel impacts and field boundaries should share the original nine-frame bullet explosion");
assert(schema.gameSettings.explosionRules.baseDestroy.color === "#f05a42", "schema should expose base destruction explosion color");
assert(schema.gameSettings.explosionRules.enemyDestroy.coreColor === "#f7f1c6", "schema should expose explosion core color");
assert(schema.gameSettings.explosionRules.playerDestroy.ttl === 32, "player destruction replacement should remain visible for the original death duration");
const bulletImpactExplosionProbe = context.window.TankDefender8.debugBulletImpactExplosionProbe();
assert(Object.values(bulletImpactExplosionProbe.ruleTtls).every((ttl) => ttl === 9), "all wall and boundary bullet impacts should share a nine-frame default");
assert(bulletImpactExplosionProbe.beforePause === 9 && bulletImpactExplosionProbe.afterPause === 9, "pausing should freeze a bullet impact on its current frame");
assert(bulletImpactExplosionProbe.frames.map((frame) => frame.ttl).join(",") === "9,8,7,6,5,4,3,2,1", "bullet impact should remain visible for exactly nine frames");
assert(bulletImpactExplosionProbe.frames.map((frame) => frame.phase).join(",") === "0,0,0,1,1,1,2,2,2", "bullet impact should show three animation phases for three frames each");
assert(bulletImpactExplosionProbe.frames.map((frame) => frame.size).join(",") === "8,8,8,12,12,12,16,16,16", "replacement impact art should hold one footprint for each three-frame phase");
assert(schema.gameSettings.stageAdvance.loopAfterFinalStage === true, "schema should expose final-stage loop rule");
assert(schema.gameSettings.stageAdvance.extendedLoopEndStage === 70, "schema should expose original-style extended loop end stage");
assert(schema.gameSettings.stageAdvance.extendedLoopEnemyStage === 35, "schema should expose extended-loop enemy pattern stage");
assert(schema.gameSettings.stageClearBonus.points === 1000, "schema should expose stage clear bonus points");
assert(schema.gameSettings.stageClearBonus.twoPlayerOnly === true, "schema should expose stage clear two-player bonus rule");
assert(schema.gameSettings.stageClearBonus.requireStrictLead === true, "schema should expose strict lead bonus rule");
const stageClearRowsProbe = context.window.TankDefender8.debugStageClearResultRowsProbe([1, 2, 3, 4], [4, 3, 2, 1], 500, 250);
const expectedP1EnemyPoints = stageClearRowsProbe.rows.reduce((sum, row) => sum + row.p1Kills * row.score, 0);
const expectedP2EnemyPoints = stageClearRowsProbe.rows.reduce((sum, row) => sum + row.p2Kills * row.score, 0);
assert(stageClearRowsProbe.rows[0].p1Points === stageClearRowsProbe.rows[0].score, "stage clear rows should show per-type P1 score subtotal");
assert(stageClearRowsProbe.rows[3].p2Points === stageClearRowsProbe.rows[3].score, "stage clear rows should show per-type P2 score subtotal");
assert(stageClearRowsProbe.p1EnemyPoints === expectedP1EnemyPoints, "stage clear result should total P1 kill points from row subtotals");
assert(stageClearRowsProbe.p2EnemyPoints === expectedP2EnemyPoints, "stage clear result should total P2 kill points from row subtotals");
assert(stageClearRowsProbe.p1BonusPoints === 500 && stageClearRowsProbe.p2BonusPoints === 250, "stage clear result should expose non-kill bonus points separately");
assert(stageClearRowsProbe.p1StagePoints === expectedP1EnemyPoints + 500, "stage clear result should include P1 bonus in the stage total");
assert(stageClearRowsProbe.p2StagePoints === expectedP2EnemyPoints + 250, "stage clear result should include P2 bonus in the stage total");
const stageClearPresentationStart = context.window.TankDefender8.debugStageClearPresentationProbe([2, 1, 0, 0], [1, 0, 0, 0], 31);
assert(stageClearPresentationStart.rows.every((row) => row.p1VisibleKills === 0 && row.p2VisibleKills === 0), "stage result should keep the first enemy row at zero through its setup frame");
const stageClearPresentationFirstTick = context.window.TankDefender8.debugStageClearPresentationProbe([2, 1, 0, 0], [1, 0, 0, 0], 32);
assert(stageClearPresentationFirstTick.rows[0].firstCountFrame === 32 && stageClearPresentationFirstTick.rows[0].countStep === 9, "stage result should start row one on frame 32 and use a nine-frame count cadence");
assert(stageClearPresentationFirstTick.rows[0].p1VisibleKills === 1 && stageClearPresentationFirstTick.rows[0].p2VisibleKills === 1, "stage result should count both players together on the first count update");
const stageClearPresentationFirstHold = context.window.TankDefender8.debugStageClearPresentationProbe([2, 1, 0, 0], [1, 0, 0, 0], 40);
assert(stageClearPresentationFirstHold.rows[0].p1VisibleKills === 1, "stage result should hold the first value for eight frames");
const stageClearPresentationSecondTick = context.window.TankDefender8.debugStageClearPresentationProbe([2, 1, 0, 0], [1, 0, 0, 0], 41);
assert(stageClearPresentationSecondTick.rows[0].p1VisibleKills === 2 && stageClearPresentationSecondTick.rows[0].p2VisibleKills === 1, "stage result should advance kill counts once every nine frames");
assert(stageClearPresentationSecondTick.totalsRevealFrame === 187 && stageClearPresentationSecondTick.bonusRevealFrame === 202, "stage result should preserve the per-row gaps before TOTAL and the leader bonus");
assert(stageClearPresentationSecondTick.endFrame === 322 && stageClearPresentationSecondTick.duration === 322, "default stage result duration should include the original 120-frame final hold");
assert(context.window.TankDefender8.debugStageClearPresentationProbe([0, 0, 0, 0], [0, 0, 0, 0], 0).endFrame === 295, "a zero-kill result should use the 295-frame minimum schedule");
assert(context.window.TankDefender8.debugStageClearPresentationProbe([20, 0, 0, 0], [0, 0, 0, 0], 0).endFrame === 475, "a 20-count result should extend to 475 frames instead of ending at a fixed duration");
const stageClearPresentationBeforeTotal = context.window.TankDefender8.debugStageClearPresentationProbe(
  [2, 1, 0, 0],
  [1, 0, 0, 0],
  stageClearPresentationSecondTick.totalsRevealFrame - 1
);
const stageClearPresentationAtTotal = context.window.TankDefender8.debugStageClearPresentationProbe(
  [2, 1, 0, 0],
  [1, 0, 0, 0],
  stageClearPresentationSecondTick.totalsRevealFrame
);
assert(stageClearPresentationBeforeTotal.showTotals === false && stageClearPresentationAtTotal.showTotals === true, "stage result should reveal TOTAL only after all four type counts and the original pause");
assert(schema.gameSettings.enemyAi.intersectionTurnChance === 1 / 16, "schema should expose the original intersection turn roll");
assert(schema.gameSettings.enemyAi.blockedRetryChance === 3 / 4, "schema should expose the original blocked retry roll");
assert(schema.gameSettings.enemyAi.blockedRetryTicks === 2, "schema should expose the two movement-tick blocked pause");
assert(schema.gameSettings.enemyAi.horizontalFirstChance === 1 / 2, "schema should expose equal horizontal and vertical target routing");
const enemyTargetProbe = context.window.TankDefender8.debugEnemyTargetEligibilityProbe();
assert(enemyTargetProbe.targetableIds.join(",") === "1,2", "enemy AI should retain spawning players as valid original-style targets");
assert(enemyTargetProbe.targetableIds.includes(enemyTargetProbe.spawningId), "enemy AI should be able to target a player during spawn flash");
assert(!enemyTargetProbe.targetableIds.includes(enemyTargetProbe.respawningId), "enemy AI should ignore players waiting to respawn");
const stage1EnemyAiProbe = context.window.TankDefender8.debugEnemyAiPhaseProbe(1, 1);
const stage35EnemyAiProbe = context.window.TankDefender8.debugEnemyAiPhaseProbe(35, 1);
const stage1TwoPlayerEnemyAiProbe = context.window.TankDefender8.debugEnemyAiPhaseProbe(1, 2);
assert(stage1EnemyAiProbe.interval === 186 && stage1EnemyAiProbe.randomEnd === 23 && stage1EnemyAiProbe.playerEnd === 46, "stage 1 AI phases should derive from the 186-frame spawn interval");
assert(stage35EnemyAiProbe.interval === 50 && stage35EnemyAiProbe.randomEnd === 6 && stage35EnemyAiProbe.playerEnd === 12, "stage 35 AI phases should derive from the 50-frame spawn interval");
assert(stage1TwoPlayerEnemyAiProbe.interval === 166 && stage1TwoPlayerEnemyAiProbe.randomEnd === 20 && stage1TwoPlayerEnemyAiProbe.playerEnd === 41, "two-player AI phases should use the twenty-frame-reduced interval");
assert(stage1EnemyAiProbe.phases.map((entry) => entry.phase).join(",") === "random,player,hq", "enemy AI should progress from random routing to players and then HQ");
const enemyTargetingProbe = context.window.TankDefender8.debugEnemyTargetingProbe();
assert(enemyTargetingProbe.oddSlotTargetId === 2 && enemyTargetingProbe.evenSlotTargetId === 1 && enemyTargetingProbe.fallbackTargetId === 1, "enemy slot parity should select and fall back between players like the original");
assert(enemyTargetingProbe.upperLeftVerticalFirst === "up" && enemyTargetingProbe.upperLeftHorizontalFirst === "left", "target routing should resolve the selected axis first in the upper-left quadrant");
assert(enemyTargetingProbe.lowerRightVerticalFirst === "down" && enemyTargetingProbe.lowerRightHorizontalFirst === "right", "target routing should resolve the selected axis first in the lower-right quadrant");
const enemyCadenceProbe = context.window.TankDefender8.debugEnemyMovementCadenceProbe();
assert(enemyCadenceProbe.map((entry) => entry.normal).join(",") === "true,false,true,false", "normal enemies should move on alternating slot-parity frames");
assert(enemyCadenceProbe.every((entry) => entry.fast), "fast enemies should move every frame");
const enemyBlockedStateProbe = context.window.TankDefender8.debugEnemyBlockedStateProbe();
assert(enemyBlockedStateProbe.retry.dir === 0 && enemyBlockedStateProbe.retry.blockedPauseTicks === 2 && enemyBlockedStateProbe.retry.pendingTurn === false, "the three-in-four blocked branch should pause and retain direction");
assert(enemyBlockedStateProbe.retryPause1 === 1 && enemyBlockedStateProbe.retryPause2 === 0, "blocked retry pauses should consume exactly two movement ticks");
assert(enemyBlockedStateProbe.turn.dir === 2 && enemyBlockedStateProbe.turn.blockedPauseTicks === 0 && enemyBlockedStateProbe.turn.pendingTurn === true, "the one-in-four blocked branch should reverse and enter the turn state");
const onePlayerSpawnTimeline = context.window.TankDefender8.debugEnemySpawnTimelineProbe(1, 3);
const twoPlayerSpawnTimeline = context.window.TankDefender8.debugEnemySpawnTimelineProbe(2, 3);
assert(onePlayerSpawnTimeline.frames.join(",") === "1,188,375", `one-player stage 1 spawn frames: ${onePlayerSpawnTimeline.frames.join(",")}`);
assert(twoPlayerSpawnTimeline.frames.join(",") === "1,168,335", `two-player stage 1 spawn frames: ${twoPlayerSpawnTimeline.frames.join(",")}`);
assert(onePlayerSpawnTimeline.slots.join(",") === "5,4,3" && twoPlayerSpawnTimeline.slots.join(",") === "7,6,5", "enemy object slots should allocate from the highest available slot downward");
assert(onePlayerSpawnTimeline.spawnIndices.join(",") === "1,2,0", "the first three enemies should spawn center, right, then left");
const spawnAnimationProbe = context.window.TankDefender8.debugSpawnAnimationCadenceProbe();
assert(spawnAnimationProbe.playerDuration === 28 && spawnAnimationProbe.enemyDuration === 28, "players and enemies should share the original two fourteen-frame spawn states");
assert(spawnAnimationProbe.playerDisplayFrames === 28 && spawnAnimationProbe.enemyDisplayFrames === 28, "spawn locks should last exactly twenty-eight display frames");
assert(spawnAnimationProbe.beforeSkippedCadenceFrame === 28 && spawnAnimationProbe.afterSkippedCadenceFrame === 27, "player spawn state should advance even on a skipped movement-cadence frame");
assert(spawnAnimationProbe.lows.join(",") === "0,1,2,3,4,5,6,7,8,9,10,11,12,13,0,1,2,3,4,5,6,7,8,9,10,11,12,13", "spawn animation should run the original low-nibble sequence twice");
assert(spawnAnimationProbe.phases.join(",") === "3,3,2,2,1,1,0,0,0,1,1,2,2,3,3,3,2,2,1,1,0,0,0,1,1,2,2,3", "spawn animation should shrink and expand symmetrically in each fourteen-frame state");
assert(spawnAnimationProbe.sizes.join(",") === "14,14,11,11,8,8,6,6,6,8,8,11,11,14,14,14,11,11,8,8,6,6,6,8,8,11,11,14", "replacement spawn art should hold the matching four discrete footprints");
assert(schema.gameSettings.playerUpgradeRules[0].maxBullets === 1, "schema game settings should expose player upgrade rules");
assert(schema.gameSettings.playerUpgradeRules.every((rule) => rule.reload === 1), "player firing should be limited by active bullet slots rather than long cooldowns");
assert(schema.gameSettings.timerFreezesEnemyTime === true, "schema should expose timer freeze rule");
assert(schema.playerUpgradeRules[0].maxBullets === 1, "level 0 should allow one bullet");
assert(schema.playerUpgradeRules[1].bulletSpeed === schema.playerUpgradeRules[2].bulletSpeed, "levels 1 and 2 should use the same fast bullet speed");
assert(schema.playerUpgradeRules[0].bulletSpeed === 2 && schema.playerUpgradeRules[1].bulletSpeed === 4, "stars should upgrade player bullets from two to four pixels per frame");
assert(schema.playerUpgradeRules[2].maxBullets === 2, "level 2 should allow two bullets");
assert(schema.playerUpgradeRules[2].wallPower === 1, "level 2 should not destroy steel");
assert(schema.playerUpgradeRules[3].wallPower === 3, "level 3 should destroy steel and double-damage brick");
assert(schema.enemyTypes[2].wallPower === 1, "the built-in Power Tank should gain bullet speed without stronger wall damage");
assert(schema.wallRules.brickSameSideHits === 4, "normal shots should need four same-side brick hits");
assert(schema.wallRules.poweredBrickSameSideHits === 2, "powered shots should need two same-side brick hits");
assert(schema.wallRules.brickFragmentSize === 4, "brick collision state should use original four-pixel fragments");
assert(schema.wallRules.normalBrickStripLength === 8 && schema.wallRules.normalBrickStripDepth === 4, "normal bullets should peel one 8x4 brick strip per hit");
assert(schema.wallRules.steelRequiredPower === 3, "steel should require max-power shots");
assert(schema.wallRules.steelSameSideHits === 1, "max-power shots should remove one steel subtile on every hit");
const steelProbe = context.window.TankDefender8.debugSteelRuleProbe();
assert(steelProbe.blocked === false && steelProbe.blockedMask === 15, "non-max-power shots should not damage steel");
assert(steelProbe.first === true, "the first max-power steel hit should damage steel immediately");
assert(steelProbe.afterFirst.mask === 11, "one max-power hit should remove only its targeted 8x8 steel subtile");
assert(steelProbe.afterFirst.steelHits.every((hits) => hits === 0), "steel damage should not retain a hidden hit accumulator");
assert(steelProbe.second === true && steelProbe.afterSecond.mask === 3, "a second hit on the adjacent subtile should remove that subtile independently");
const brickPowerProbe = context.window.TankDefender8.debugBrickWallPowerProbe();
assert(brickPowerProbe.rules.brickSameSideHits === 4, "brick probe should expose normal same-side hit count");
assert(brickPowerProbe.rules.poweredBrickSameSideHits === 2, "brick probe should expose powered same-side hit count");
assert(brickPowerProbe.normalMasks.join(",") === "15,14,14,12", "four normal shots should tunnel through one eight-pixel lane without deleting the other lane");
assert(brickPowerProbe.normalBrickMasks.join(",") === "65518,65484,65416,65280", "normal shots should remove successive four-pixel-deep strips");
assert(brickPowerProbe.normalTypeAfterFour === "brick", "a tunneled wall should retain the untouched eight-pixel lane");
assert(brickPowerProbe.powerMask === 14 && brickPowerProbe.powerBrickMask === 65484, "one max-power hit should remove exactly one targeted 8x8 brick subtile");
assert(brickPowerProbe.powerTwoMask === brickPowerProbe.powerMask && brickPowerProbe.powerTwoBrickMask === brickPowerProbe.powerBrickMask, "custom wall power two should retain powered brick damage without gaining steel damage");
assert(brickPowerProbe.powerRemoved === 1, "max-power brick damage should not remove the adjacent eight-pixel lane");
assert(brickPowerProbe.directionMasks.up.firstRemovedFragments === 0x3000 && brickPowerProbe.directionMasks.up.second === 11, "upward shots should peel the lower 8x4 strip before the upper strip");
assert(brickPowerProbe.directionMasks.down.firstRemovedFragments === 0x0003 && brickPowerProbe.directionMasks.down.second === 14, "downward shots should peel the upper 8x4 strip before the lower strip");
assert(brickPowerProbe.directionMasks.left.firstRemovedFragments === 0x0088 && brickPowerProbe.directionMasks.left.second === 13, "leftward shots should peel the right 4x8 strip before the left strip");
assert(brickPowerProbe.directionMasks.right.firstRemovedFragments === 0x0011 && brickPowerProbe.directionMasks.right.second === 14, "rightward shots should peel the left 4x8 strip before the right strip");
assert(brickPowerProbe.removedStripHit === 0 && brickPowerProbe.remainingStripHit !== 0, "bullet collision should pass through removed four-pixel fragments and still hit the remaining strip");
assert(brickPowerProbe.removedStripSolid === false && brickPowerProbe.remainingStripSolid === true, "world collision should ignore removed brick fragments and retain adjacent solid fragments");
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
const destroyedBaseShovelProbe = context.window.TankDefender8.debugShovelDestroyedBaseProbe();
assert(destroyedBaseShovelProbe.score === destroyedBaseShovelProbe.pickupScore && destroyedBaseShovelProbe.popupCount === 1, "shovel collected after base destruction should still award and display pickup score");
assert(destroyedBaseShovelProbe.shovelTimer === 0, "shovel collected after base destruction should not start the protection timer");
assert(destroyedBaseShovelProbe.wallTypes.every((type) => type === "brick"), "shovel collected after base destruction should not replace the base wall with steel");
const carrierProbe = context.window.TankDefender8.debugCarrierReleaseProbe(4);
assert(carrierProbe.rule === "hit", "carrier power-up should release on hit by default");
assert(carrierProbe.releaseOnThisHit === true, "multi-hit carriers should release power-ups on the first hit by default");
assert(context.window.TankDefender8.debugCarrierReleaseProbe(1).releaseOnThisHit === true, "one-hit carriers should release when hit");
const carrierFlashProbe = context.window.TankDefender8.debugCarrierFlashProbe();
assert(carrierFlashProbe.flashColor === carrierFlashProbe.flashColorValue, "carrier enemies should flash with the warning color");
assert(carrierFlashProbe.normalPhaseColor === carrierFlashProbe.baseColor, "carrier enemies should alternate back to their base tank color");
assert(carrierFlashProbe.phaseFrames === 8, "carrier flash phase should use the configured 8-frame visual cadence");
const pausedTankVisualProbe = context.window.TankDefender8.debugPausedTankVisualProbe();
assert(pausedTankVisualProbe.initial.displayFrame === 7 && pausedTankVisualProbe.initial.carrierColor === pausedTankVisualProbe.initial.carrierFlashColor && pausedTankVisualProbe.initial.stunnedVisible === true, "paused tank visuals should begin from the frozen battle frame");
assert(pausedTankVisualProbe.afterOneFrame.tick === 7 && pausedTankVisualProbe.afterOneFrame.displayFrame === 8, "paused tank display time should advance without advancing the battle tick");
assert(pausedTankVisualProbe.afterOneFrame.carrierColor === pausedTankVisualProbe.afterOneFrame.carrierBaseColor && pausedTankVisualProbe.afterOneFrame.stunnedVisible === false, "carrier color and stunned-player visibility should cross their eight-frame boundary during pause");
assert(pausedTankVisualProbe.afterNineFrames.displayFrame === 16 && pausedTankVisualProbe.afterNineFrames.carrierColor === pausedTankVisualProbe.afterNineFrames.carrierFlashColor && pausedTankVisualProbe.afterNineFrames.stunnedVisible === true, "paused tank flashing should repeat across the next eight-frame boundary");
assert(pausedTankVisualProbe.afterResume.displayFrame === 23, "resumed tank animation should ignore elapsed pause frames");
const carrierClearProbe = context.window.TankDefender8.debugCarrierSpawnClearsPowerUpProbe(true);
assert(carrierClearProbe.cleared === true && carrierClearProbe.hasPowerUp === false, "carrier spawn should clear uncollected power-ups by default");
const timerProbe = context.window.TankDefender8.debugTimerRuleProbe();
assert(timerProbe.frozen === true, "timer should freeze enemy time by default");
assert(timerProbe.canSpawn === true, "timer should let enemy spawning continue by default");
const globalTimerProbe = context.window.TankDefender8.debugGlobalTimerCadenceProbe();
assert(globalTimerProbe.unitFrames === 64, "original long-duration timers should use 64-frame units");
assert(globalTimerProbe.boundaries.map((entry) => entry.active).join(",") === "false,false,true,false,false,true", "global timers should tick only when the low frame counter is zero modulo 64");
assert(globalTimerProbe.durations.helmet === 10 && globalTimerProbe.durations.timer === 10 && globalTimerProbe.durations.shovel === 20, "global timer probe should expose original item counter values");
assert(globalTimerProbe.timerDisplayFrames.phase0 === 640 && globalTimerProbe.timerDisplayFrames.phase63 === 577, "ten timer units should last 577 through 640 display frames depending on pickup phase");
assert(globalTimerProbe.spawnShieldDisplayFrames.phase0 === 192 && globalTimerProbe.spawnShieldDisplayFrames.phase63 === 129, "three shield units should last 129 through 192 display frames depending on activation phase");
const shieldCadenceProbe = context.window.TankDefender8.debugShieldCadenceProbe();
assert(shieldCadenceProbe.every((entry) => entry.visible), "active shield should remain visible instead of blinking off");
assert(shieldCadenceProbe.map((entry) => entry.color).join(",") === "#78d9ff,#78d9ff,#ffffff,#ffffff,#78d9ff,#78d9ff,#ffffff,#ffffff", "shield replacement should alternate its animation color every two frames");
const pausedShieldProbe = context.window.TankDefender8.debugPausedShieldProbe();
assert(pausedShieldProbe.activeVisible === true && pausedShieldProbe.pausedVisible === false, "pausing should omit active shield sprites from the original-style display loop");
assert(pausedShieldProbe.afterPausedUpdate.tick === pausedShieldProbe.beforePausedUpdate.tick && pausedShieldProbe.afterPausedUpdate.invuln === pausedShieldProbe.beforePausedUpdate.invuln, "pause should hide the shield without advancing battle time or consuming protection");
assert(pausedShieldProbe.afterPausedUpdate.pauseElapsed === 1, "the shield omission should still occur on an advancing paused display frame");
assert(pausedShieldProbe.resumedVisible === true && pausedShieldProbe.expiredVisible === false, "resuming should reveal retained protection while expired protection remains hidden");
const timerBehaviorProbe = context.window.TankDefender8.debugTimerFreezeBehaviorProbe();
assert(timerBehaviorProbe.before.freezeTimer === timerBehaviorProbe.duration, "timer power-up should set the freeze duration");
assert(timerBehaviorProbe.before.score === timerBehaviorProbe.pickupScore, "timer power-up should award the pickup score");
assert(timerBehaviorProbe.after.enemyX === timerBehaviorProbe.before.enemyX, "timer should freeze enemy movement");
assert(timerBehaviorProbe.after.enemyReload === timerBehaviorProbe.before.enemyReload, "timer should freeze enemy reload timers");
assert(timerBehaviorProbe.after.bulletX > timerBehaviorProbe.before.bulletX, "timer should not freeze already-fired bullets");
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
assert(timerSpawnProbe.afterFrozenFrame.spawnedEnemyFlash === timerSpawnProbe.afterSpawn.spawnedEnemyFlash, "enemy spawned during timer should stay frozen until the timer expires");
const noExpirePowerUpProbe = context.window.TankDefender8.debugPowerUpTtlProbe(0);
assert(noExpirePowerUpProbe.survives === true && noExpirePowerUpProbe.ttl === 0, "zero power-up TTL should not expire by time");
const expiringPowerUpProbe = context.window.TankDefender8.debugPowerUpTtlProbe(1);
assert(expiringPowerUpProbe.survives === false, "positive power-up TTL should still expire when it reaches zero");
const pickupBoundaryProbe = context.window.TankDefender8.debugPowerUpPickupBoundaryProbe();
assert(pickupBoundaryProbe.samePosition && pickupBoundaryProbe.positiveEleven && pickupBoundaryProbe.negativeEleven, "power-up pickup should accept absolute center-coordinate differences below twelve pixels");
assert(!pickupBoundaryProbe.positiveTwelveX && !pickupBoundaryProbe.negativeTwelveX && !pickupBoundaryProbe.positiveTwelveY && !pickupBoundaryProbe.negativeTwelveY, "power-up pickup should reject center-coordinate differences of twelve pixels on either axis");
assert(!pickupBoundaryProbe.spawning && !pickupBoundaryProbe.respawning && !pickupBoundaryProbe.dead, "power-ups should not be collected by spawning, respawning, or destroyed players");
assert(pickupBoundaryProbe.stunned && pickupBoundaryProbe.invulnerable, "active stunned or protected players should still collect power-ups");
const pickupPriorityProbe = context.window.TankDefender8.debugPowerUpPickupPriorityProbe();
assert(pickupPriorityProbe.simultaneousPlayerId === 2, "player two should receive a power-up when both player slots qualify on the same frame");
assert(pickupPriorityProbe.player2SpawningPlayerId === 1, "player-one pickup should remain available while player two is spawning");
assert(pickupPriorityProbe.onePlayerId === 1, "one-player power-up pickup should still select player one");
canvasContext.calls.length = 0;
canvasContext.resetPixels();
const pickupRenderProbe = context.window.TankDefender8.debugPowerUpPickupRenderProbe();
assert(pickupRenderProbe.powerUpType === null, "collected power-up should be cleared from game state");
assert(pickupRenderProbe.playerLevel === 1, "star pickup should still apply after clearing the power-up object");
assert(pickupRenderProbe.playerScore === pickupRenderProbe.pickupScore, "power-up pickup should still award score");
assert(pickupRenderProbe.popup.style === "powerUp" && pickupRenderProbe.popup.ttl === 49, "power-up pickup should create the original-style fixed score state for 49 visible frames");
assert(pickupRenderProbe.popup.x === pickupRenderProbe.powerCenter.x && pickupRenderProbe.popup.y === pickupRenderProbe.powerCenter.y, "power-up score should remain centered on the collected item position");
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
const powerUpSpawnTerrainProbe = context.window.TankDefender8.debugPowerUpSpawnTerrainProbe();
assert(powerUpSpawnTerrainProbe.openTiles.length === 1, "power-up spawning should reject blocked terrain candidates");
assert(powerUpSpawnTerrainProbe.openTiles[0].x === 2 && powerUpSpawnTerrainProbe.openTiles[0].y === 1, "power-up spawning should keep the reachable open candidate");
assert(powerUpSpawnTerrainProbe.candidateTiles.length > powerUpSpawnTerrainProbe.openTiles.length, "power-up spawning should expand the pool when only one configured candidate is reachable");
assert(!powerUpSpawnTerrainProbe.candidateTiles.some((tile) => tile.x === 1 && tile.y === 1), "power-up spawning should not add steel-blocked candidates back into the pool");
assert(!(powerUpSpawnTerrainProbe.nonRepeatTile.x === 2 && powerUpSpawnTerrainProbe.nonRepeatTile.y === 1), "power-up spawning should avoid repeating the previous location when alternatives exist");
assert(powerUpSpawnTerrainProbe.fallbackTile.x === 3 && powerUpSpawnTerrainProbe.fallbackTile.y === 3, "power-up spawning should fall back to a reachable map tile if all configured candidates are blocked");
const powerUpSpawnRandomProbe = context.window.TankDefender8.debugPowerUpSpawnRandomProbe(8);
assert(powerUpSpawnRandomProbe.candidateCount === 4, "power-up random probe should expose four reachable candidates");
assert(powerUpSpawnRandomProbe.pickedFromCandidates === true, "power-up spawning should pick from reachable candidate locations");
assert(powerUpSpawnRandomProbe.uniquePickCount > 1, "power-up spawning should not get stuck on one fixed location");
assert(powerUpSpawnRandomProbe.uniquePickCount < powerUpSpawnRandomProbe.candidateCount, "power-up spawning should not force a full rotation before repeating");
assert(powerUpSpawnRandomProbe.immediateRepeats === false, "power-up spawning should not repeat the same location on consecutive releases");
const powerUpTypePoolProbe = context.window.TankDefender8.debugPowerUpTypePoolProbe();
assert(powerUpTypePoolProbe.types.join(",") === "grenade,helmet,shovel,star,timer,tank", "random power-up type pool should include the original six power-up types");
assert(powerUpTypePoolProbe.randomTable.join(",") === "helmet,timer,shovel,star,grenade,tank,grenade,star", "random power-up lookup should match the original eight-entry table");
assert(powerUpTypePoolProbe.sampledTable.join(",") === powerUpTypePoolProbe.randomTable.join(","), "random bytes zero through seven should pass through the production selector in original table order");
assert(JSON.stringify(powerUpTypePoolProbe.weights) === JSON.stringify({ grenade: 2, helmet: 1, shovel: 1, star: 2, timer: 1, tank: 1 }), "random power-up weights should preserve the original star and grenade double chance");
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
assert(pausedPowerUpVisualProbe.initial.waterFrame === pausedPowerUpVisualProbe.afterNineFrames.waterFrame, "pause should keep water animation tied to the frozen battle frame");
assert(pausedPowerUpVisualProbe.afterResume.displayFrame === 23, "resumed display animation should ignore elapsed pause frames");
const waterAnimationProbe = context.window.TankDefender8.debugWaterAnimationCadenceProbe();
assert(waterAnimationProbe.map((entry) => entry.frame).join(",") === "waterA,waterA,waterB,waterB,waterA,waterA,waterB", "water animation should switch on bit five of the global frame counter");
const grenadeScoreProbe = context.window.TankDefender8.debugGrenadeScoreProbe();
assert(grenadeScoreProbe.scoreGain === grenadeScoreProbe.pickupScore, "grenade should award only the power-up pickup score");
assert(grenadeScoreProbe.stagePoints === 0, "grenade should not add enemy score to stage points");
assert(grenadeScoreProbe.stageKills.every((count) => count === 0), "grenade should not credit the stage kill table");
assert(grenadeScoreProbe.totalKills.every((count) => count === 0), "grenade should not credit total kill counts");
assert(grenadeScoreProbe.enemyKilled === 2 && grenadeScoreProbe.aliveEnemies === 0, "grenade should still clear live enemies");
const grenadeSpawnProbe = context.window.TankDefender8.debugGrenadeSpawnProtectionProbe();
assert(grenadeSpawnProbe.activeAlive === false && grenadeSpawnProbe.enemyKilled === 1, "grenade should destroy an active fully spawned enemy");
assert(grenadeSpawnProbe.spawningAlive === true && grenadeSpawnProbe.spawningHp === 1 && grenadeSpawnProbe.spawningFlash === 12, "grenade should leave an enemy in its spawn animation untouched");
assert(grenadeSpawnProbe.explosionCount === 1, "grenade should create one explosion for each active enemy it destroys and none for spawning enemies");
assert(grenadeSpawnProbe.stageKills.every((count) => count === 0) && grenadeSpawnProbe.totalKills.every((count) => count === 0), "grenade spawn protection should not change kill-table credit rules");
const scorePopupProbe = context.window.TankDefender8.debugScorePopupProbe();
assert(scorePopupProbe.enemyPopup.value === scorePopupProbe.armorScore, "destroyed enemies should show their score value in the playfield");
assert(scorePopupProbe.pickupPopup.value === scorePopupProbe.pickupScore, "collected power-ups should show their pickup score value in the playfield");
assert(scorePopupProbe.enemyPopup.style === "float" && scorePopupProbe.enemyPopup.ttl === 54, "enemy score popups should retain their existing floating style");
assert(scorePopupProbe.pickupPopup.style === "powerUp" && scorePopupProbe.pickupPopup.ttl === 49, "direct power-up effects should use the fixed original-style score popup");
assert(scorePopupProbe.grenadePopups.length === 1 && scorePopupProbe.grenadePopups[0].value === scorePopupProbe.pickupScore, "grenade should show only the power-up score popup");
assert(scorePopupProbe.afterUpdate[0].ttl === scorePopupProbe.grenadePopups[0].ttl - 1, "score popups should count down each frame");
const pausedScorePopupProbe = context.window.TankDefender8.debugPausedScorePopupProbe();
assert(pausedScorePopupProbe.afterOneFrame.tick === 27 && pausedScorePopupProbe.afterOneFrame.ttl === 1, "paused gameplay should count down the pickup score without advancing the gameplay tick");
assert(pausedScorePopupProbe.afterTwoFrames.tick === 27 && pausedScorePopupProbe.afterTwoFrames.popupCount === 0, "pickup score should expire on schedule while gameplay remains paused");
const starUpgradeProbe = context.window.TankDefender8.debugStarUpgradeProbe();
assert(starUpgradeProbe.tiers[0].level === 0 && starUpgradeProbe.tiers[0].maxBullets === 1, "base player tank should start with one bullet");
assert(starUpgradeProbe.tiers[1].level === 1 && starUpgradeProbe.tiers[1].bulletSpeed === starUpgradeProbe.powerTankBulletSpeed, "first star should increase bullet speed");
assert(starUpgradeProbe.tiers[2].level === 2 && starUpgradeProbe.tiers[2].maxBullets === 2, "second star should allow two bullets");
assert(starUpgradeProbe.tiers[2].wallPower === 1, "second star should not destroy steel");
assert(starUpgradeProbe.tiers[3].level === 3 && starUpgradeProbe.tiers[3].wallPower === 3, "third star should enable steel destruction");
assert(starUpgradeProbe.capped.level === 3, "additional stars should not exceed max player power");
assert(starUpgradeProbe.afterDeath.level === schema.gameSettings.deathPowerLevel, "player death should reset power to the configured death level");
assert(starUpgradeProbe.afterDeath.lives === 2 && starUpgradeProbe.afterDeath.respawn === schema.gameSettings.timings.playerRespawn, "player hit should enter the death state before consuming a life");
const starVisualLevels = [0, 1, 2, 3].map((level) => {
  canvasContext.calls.length = 0;
  const probe = context.window.TankDefender8.debugPlayerUpgradeVisualProbe(level);
  return {
    ...probe,
    maxPowerDraws: canvasContext.calls.filter((call) => call.op === "fillRect" && call.style === probe.maxPowerColor).length
  };
});
assert(starVisualLevels[0].overlayParts === 0, "base player tank should not draw upgrade overlay parts");
assert(new Set(starVisualLevels.map((probe) => probe.overlaySignature)).size === 4, "each player star level should draw a distinct tank shape");
assert(starVisualLevels[3].maxPowerParts > 0 && starVisualLevels[3].maxPowerDraws === starVisualLevels[3].maxPowerParts, "max-power player tank should draw its steel-piercing visual overlay");
const starSurvivabilityProbe = context.window.TankDefender8.debugStarSurvivabilityProbe();
assert(starSurvivabilityProbe.alive === false && starSurvivabilityProbe.lives === 2, "star upgrades should not add armor and life consumption should wait for the death animation");
const deathRespawnProbe = context.window.TankDefender8.debugPlayerDeathRespawnProbe();
assert(deathRespawnProbe.deathTicks === 24 && deathRespawnProbe.spawnTicks === 28, "player death and spawn states should use the original status-tick counts");
assert(deathRespawnProbe.afterHit.alive === false && deathRespawnProbe.afterHit.lives === 2 && deathRespawnProbe.afterHit.respawn === 24, "enemy hit should begin the death state without immediately consuming a life");
assert(deathRespawnProbe.afterHit.level === schema.gameSettings.deathPowerLevel && deathRespawnProbe.afterHit.invuln === 0, "death should reset tank power and clear protection immediately");
assert(deathRespawnProbe.deathDisplayFrames === 32, "24 death-state ticks should resolve after 32 display frames from tick zero");
assert(deathRespawnProbe.deathResolved.alive === true && deathRespawnProbe.deathResolved.lives === 1 && deathRespawnProbe.deathResolved.spawnFlash === 28, "death completion should consume one life and immediately begin spawning");
assert(deathRespawnProbe.deathResolved.invuln === 0, "spawn animation should begin before the post-spawn shield timer");
assert(deathRespawnProbe.spawnDisplayFrames === 28 && deathRespawnProbe.totalDisplayFrames === 60, "the twenty-eight-frame spawn state should complete sixty display frames after the hit");
assert(deathRespawnProbe.activated.spawnFlash === 0 && deathRespawnProbe.activated.invuln === schema.gameSettings.timings.playerInvulnerability, "post-spawn protection should start when the spawn animation completes");
assert(deathRespawnProbe.lastLife.displayFrames === 32 && deathRespawnProbe.lastLife.alive === false && deathRespawnProbe.lastLife.lives === 0, "the final life should be consumed only after the death animation completes");
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
const crossingBulletProbe = context.window.TankDefender8.debugCrossingBulletCancelProbe();
assert(crossingBulletProbe.speed === 6, "crossing bullet probe should use high-speed bullets that can pass through each other in one frame");
assert(crossingBulletProbe.remainingBullets === 2 && crossingBulletProbe.crossingPositions[0].x === 46 && crossingBulletProbe.crossingPositions[1].x === 40, "high-speed bullets should finish their full-frame movement before one collision check and may cross without canceling");
assert(crossingBulletProbe.thresholdFiveCanceled === true && crossingBulletProbe.thresholdSixCanceled === false, "bullets from different tanks should cancel below six center pixels but not at the six-pixel boundary");
assert(crossingBulletProbe.sameOwnerCanceled === false, "two active bullets owned by the same tank should not cancel each other");
assert(crossingBulletProbe.explosionCount === 0, "original-style bullet cancellation should remove both bullets without an explosion");
const fieldBoundaryBulletProbe = context.window.TankDefender8.debugFieldBoundaryBulletProbe();
assert(fieldBoundaryBulletProbe.length === 8, "field-boundary probe should cover four edges for player and enemy bullets");
assert(fieldBoundaryBulletProbe.every((entry) => entry.removed && entry.explosionCount === 1), "every bullet leaving the battlefield should become one boundary explosion");
assert(fieldBoundaryBulletProbe.filter((entry) => entry.ownerKind === "player").every((entry) => entry.sound === "steelHit"), "player bullets hitting the field boundary should use the wall-hit sound");
assert(fieldBoundaryBulletProbe.filter((entry) => entry.ownerKind === "enemy").every((entry) => entry.sound === null), "enemy bullets hitting the field boundary should not use the player wall-hit sound");
assert(fieldBoundaryBulletProbe.filter((entry) => entry.edge === "left").every((entry) => entry.explosion.x === 0), "left-boundary explosions should be clamped to the battlefield edge");
assert(fieldBoundaryBulletProbe.filter((entry) => entry.edge === "right").every((entry) => entry.explosion.x === 208), "right-boundary explosions should be clamped to the battlefield edge");
assert(fieldBoundaryBulletProbe.filter((entry) => entry.edge === "top").every((entry) => entry.explosion.y === 0), "top-boundary explosions should be clamped to the battlefield edge");
assert(fieldBoundaryBulletProbe.filter((entry) => entry.edge === "bottom").every((entry) => entry.explosion.y === 208), "bottom-boundary explosions should be clamped to the battlefield edge");
const terrainHitSoundProbe = context.window.TankDefender8.debugTerrainHitSoundProbe();
assert(terrainHitSoundProbe.find((entry) => entry.ownerKind === "player" && entry.terrain === "brick").sound === "brickHit", "player bullets hitting brick should use the brick-hit sound");
assert(terrainHitSoundProbe.find((entry) => entry.ownerKind === "player" && entry.terrain === "steelBlocked").sound === "steelHit", "blocked player bullets hitting steel should use the wall-hit sound");
assert(terrainHitSoundProbe.find((entry) => entry.ownerKind === "player" && entry.terrain === "steelDestroyed").sound === "brickHit", "max-power player bullets destroying steel should use the destruction sound");
assert(terrainHitSoundProbe.filter((entry) => entry.ownerKind === "enemy").every((entry) => entry.sound === null), "enemy bullets hitting brick or steel should not trigger player wall-hit sounds");
const lifeAwardProbe = context.window.TankDefender8.debugLifeAwardProbe();
assert(lifeAwardProbe.threshold === 20000, "default extra-life threshold should be 20000 points");
assert(lifeAwardProbe.beforeCrossing.lives === 1, "score below the threshold should not award an extra life");
assert(lifeAwardProbe.afterCrossing.score === 20000 && lifeAwardProbe.afterCrossing.lives === 2, "crossing the threshold should award one extra life");
assert(lifeAwardProbe.afterRepeat.lives === 2, "the same extra-life score threshold should not award twice");
assert(lifeAwardProbe.tank.score === lifeAwardProbe.pickupScore && lifeAwardProbe.tank.lives === 2, "tank power-up should award pickup score and one extra life");
const helmetProbe = context.window.TankDefender8.debugHelmetProtectionProbe();
assert(helmetProbe.duration === schema.gameSettings.powerUpDurations.helmet, "helmet should use the configured protection duration");
assert(helmetProbe.unprotected.alive === false && helmetProbe.unprotected.bulletRemoved === true, "enemy bullets should destroy an unprotected player");
assert(helmetProbe.protected.alive === true && helmetProbe.protected.lives === 2, "helmet should protect the player from enemy bullets");
assert(helmetProbe.protected.invuln === helmetProbe.duration, "helmet should set the player invulnerability timer");
assert(helmetProbe.protected.score === helmetProbe.pickupScore, "helmet should award the power-up pickup score");
assert(helmetProbe.protected.bulletRemoved === true, "helmet should absorb the incoming enemy bullet");
const enemyBulletPlayerProbe = context.window.TankDefender8.debugEnemyBulletPlayerCollisionProbe();
assert(enemyBulletPlayerProbe.protected.bulletRemoved === true && enemyBulletPlayerProbe.protected.alive === true && enemyBulletPlayerProbe.protected.explosions === 0, "player protection should absorb an enemy bullet without a hit explosion");
assert(enemyBulletPlayerProbe.positiveNine.bulletRemoved && enemyBulletPlayerProbe.negativeNine.bulletRemoved, "enemy bullets should hit within nine pixels of the player center on both axes");
assert(!enemyBulletPlayerProbe.positiveNine.alive && !enemyBulletPlayerProbe.negativeNine.alive, "unprotected center-range enemy hits should start player death");
assert(!enemyBulletPlayerProbe.positiveTen.bulletRemoved && !enemyBulletPlayerProbe.negativeTen.bulletRemoved, "enemy bullets should miss at a ten-pixel player-center difference");
const playerBulletEnemyProbe = context.window.TankDefender8.debugPlayerBulletEnemyCollisionProbe();
assert(playerBulletEnemyProbe.positiveNine.bulletRemoved && playerBulletEnemyProbe.negativeNine.bulletRemoved, "player bullets should hit within nine pixels of the enemy center on both axes");
assert(!playerBulletEnemyProbe.positiveNine.enemyAlive && !playerBulletEnemyProbe.negativeNine.enemyAlive, "center-range player hits should destroy one-hit enemies");
assert(!playerBulletEnemyProbe.positiveTen.bulletRemoved && !playerBulletEnemyProbe.negativeTen.bulletRemoved, "player bullets should miss at a ten-pixel enemy-center difference");
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
const playerCadenceProbe = context.window.TankDefender8.debugPlayerMovementCadenceProbe();
assert(playerCadenceProbe.speed === 1, "default player movement should advance one pixel per active frame");
assert(playerCadenceProbe.cadence.join(",") === "true,true,false,true", "default player cadence should skip only the third frame in each four-frame cycle");
assert(playerCadenceProbe.frames.map((frame) => frame.active).join(",") === "true,true,false,true,true,true,false,true", "player cadence should repeat over successive four-frame cycles");
assert(playerCadenceProbe.activeFrames === 6 && playerCadenceProbe.distanceOverEightFrames === 6, "player should travel six pixels over eight unobstructed display frames");
const friendlyFireDurationProbe = context.window.TankDefender8.debugFriendlyFireDurationProbe();
assert(friendlyFireDurationProbe.stunTicks === 200 && friendlyFireDurationProbe.displayFrames === 267 && friendlyFireDurationProbe.remaining === 0, "friendly-fire stun should consume 200 movement ticks over 267 display frames");
assert(friendlyFireDurationProbe.visibility.map((frame) => frame.visible).join(",") === "true,true,false,false,true", "stunned player tank should blink in eight-frame visible and hidden bands");
const friendlyFireRefreshProbe = context.window.TankDefender8.debugFriendlyFireRefreshProbe();
assert(friendlyFireRefreshProbe.before === 37 && friendlyFireRefreshProbe.after === 37, "a repeated friendly hit should not refresh an active stun timer");
assert(friendlyFireRefreshProbe.bulletRemoved === true, "a repeated friendly hit should still consume the bullet");
const friendlyProtectionProbe = context.window.TankDefender8.debugFriendlyFireProtectionProbe();
assert(friendlyProtectionProbe.protected.bulletRemoved === true && friendlyProtectionProbe.protected.stun === 0 && friendlyProtectionProbe.protected.explosions === 0, "player protection should absorb a friendly bullet without stun or hit explosion");
assert(friendlyProtectionProbe.positiveNine.bulletRemoved && friendlyProtectionProbe.negativeNine.bulletRemoved, "friendly bullets should hit within nine pixels of the teammate center on both axes");
assert(friendlyProtectionProbe.positiveNine.stun === schema.gameSettings.friendlyFire.stunFrames && friendlyProtectionProbe.negativeNine.stun === schema.gameSettings.friendlyFire.stunFrames, "unprotected center-range friendly hits should apply the configured stun");
assert(!friendlyProtectionProbe.positiveTen.bulletRemoved && !friendlyProtectionProbe.negativeTen.bulletRemoved, "friendly bullets should miss at a ten-pixel center difference in either horizontal direction");
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
const panelProbe = context.window.TankDefender8.debugEnemyPanelCounterProbe(4, 2, 20);
assert(panelProbe.remaining === 16, "enemy panel counter should track unspawned reserve enemies");
assert(panelProbe.remaining !== 18, "enemy panel counter should not derive from killed enemies");
assert(context.window.TankDefender8.debugPanelLifeCountProbe(3).panelLives === 2, "life panel should show reserve lives and exclude the active tank");
assert(context.window.TankDefender8.debugPanelLifeCountProbe(1).panelLives === 0, "life panel should show zero reserves for the final active tank");
assert(context.window.TankDefender8.debugPanelLifeCountProbe(0).panelLives === 0, "life panel should not show negative reserve lives");
assert(schema.stageSettings[0].maxActiveEnemies === 4, "schema should expose maxActiveEnemies");
assert(schema.stageSettings[0].maxActiveEnemiesTwoPlayer === 6, "schema should expose the two-player six-enemy limit");
assert(schema.stageSettings[0].playerSpawns[0].x === 4, "schema should expose player spawns");
assert(schema.stageSettings[0].enemySpawns[2].x === 12, "schema should expose enemy spawns");
assert(schema.stageSettings[0].powerUpSpawns.length === 16, "schema should expose power-up spawn points");
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

// Mirrors StrategyWiki's Battle City Walkthrough "Tank Groups" table.
const expectedOriginalEnemyGroups = [
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
const originalEnemyGroupsProbe = context.window.TankDefender8.debugOriginalEnemyGroupsProbe();
assert(originalEnemyGroupsProbe.length === 35, "built-in original enemy group probe should cover all 35 stages");
for (let stageIndex = 0; stageIndex < expectedOriginalEnemyGroups.length; stageIndex += 1) {
  const stage = stageIndex + 1;
  const expectedGroups = expectedOriginalEnemyGroups[stageIndex];
  const expectedCounts = enemyGroupCounts(expectedGroups);
  const actual = originalEnemyGroupsProbe[stageIndex];
  assert(actual.stage === stage, `original enemy group stage ${stage} should keep its stage number`);
  assert(actual.total === 20, `original enemy group stage ${stage} should contain 20 enemies`);
  assert(stableJson(actual.groups) === stableJson(namedEnemyGroups(expectedGroups)), `original enemy group stage ${stage} should match the source group order`);
  assert(actual.counts.join(",") === expectedCounts.join(","), `original enemy group stage ${stage} should match source enemy type counts`);
  assert(actual.carriers.join(",") === "4,11,18", `original enemy group stage ${stage} should keep carriers at enemies 4, 11, and 18`);
}

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
keyPress("Enter");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.players.length === 1 && snapshot.screen === "stageIntro", "pack state cleanup probe should start from active gameplay");
assert(context.window.TankDefender8.loadStagePack(validPack) === true, "loadStagePack should reload while gameplay is active");
snapshot = context.window.TankDefender8.debugSnapshot();
assert(snapshot.screen === "title", "loading a stage pack should return to the title screen");
assert(snapshot.players.length === 0 && snapshot.enemySpawned === 0 && snapshot.enemyKilled === 0, "loading a stage pack should clear active player and enemy counters");
assert(snapshot.powerUpType === null && snapshot.clearPendingTimer === 0 && snapshot.gameOverTimer === 0, "loading a stage pack should clear transient power-up and transition state");
assert(snapshot.stageResultReason === "clear" && snapshot.stageClearElapsed === 0, "loading a stage pack should reset stage-result routing state");

const customEnemySequencePack = {
  id: "custom-enemy-sequence",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [[
    { typeIndex: 3, carrier: true, spawnIndex: 2, powerUpType: "tank", spawnDelay: 12 },
    { typeIndex: 2, carrier: false, spawnIndex: 1, powerUpType: null, spawnDelay: 24 },
    { typeIndex: 1, carrier: false, spawnIndex: 0, powerUpType: null, spawnDelay: null }
  ]]
};
assert(context.window.TankDefender8.validateStagePack(customEnemySequencePack).ok === true, "custom enemy sequence pack should validate");
assert(context.window.TankDefender8.loadStagePack(customEnemySequencePack) === true, "custom enemy sequence pack should load");
const customEnemySequence = context.window.TankDefender8.currentPackInfo().enemySequence;
assert(customEnemySequence.length === 3, "custom enemy sequence should control the active stage enemy count");
assert(customEnemySequence.map((enemy) => enemy.typeIndex).join(",") === "3,2,1", "custom enemy sequence should preserve type order");
assert(customEnemySequence[0].carrier === true && customEnemySequence[0].powerUpType === "tank", "custom enemy sequence should preserve carrier metadata");
assert(customEnemySequence[0].spawnIndex === 2 && customEnemySequence[0].spawnDelay === 12, "custom enemy sequence should preserve spawn metadata");
assert(context.window.TankDefender8.loadStagePack(validPack) === true, "valid pack should reload after custom enemy sequence check");

const badPack = {
  id: "bad",
  totalStages: 1,
  enemyTotal: 20,
  maps: [["too short"]],
  enemies: [schema.enemies[0]]
};
assert(context.window.TankDefender8.validateStagePack(badPack).ok === false, "bad pack should fail validation");
assert(context.window.TankDefender8.loadStagePack(badPack) === false, "bad pack should not load");

const mixedPack = {
  id: "mixed",
  totalStages: 1,
  enemyTotal: 20,
  maps: [schema.maps[0]],
  quadrants: [schema.quadrants[0]],
  enemies: [schema.enemies[0]]
};
assert(context.window.TankDefender8.validateStagePack(mixedPack).ok === false, "mixed map formats should fail validation");

const badPowerPack = {
  id: "bad-power",
  totalStages: 1,
  enemyTotal: 20,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].map((enemy, index) => index === 3 ? { ...enemy, powerUpType: "bad" } : enemy)]
};
assert(context.window.TankDefender8.validateStagePack(badPowerPack).ok === false, "bad powerUpType should fail validation");

const badDelayPack = {
  id: "bad-delay",
  totalStages: 1,
  enemyTotal: 20,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].map((enemy, index) => index === 0 ? { ...enemy, spawnDelay: -1 } : enemy)]
};
assert(context.window.TankDefender8.validateStagePack(badDelayPack).ok === false, "bad spawnDelay should fail validation");

const badEnemyTypesPack = {
  id: "bad-enemy-types",
  totalStages: 1,
  enemyTypes: schema.enemyTypes.map((enemyType, index) => index === 0 ? { ...enemyType, wallPower: 4 } : enemyType),
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badEnemyTypesPack).ok === false, "bad enemyTypes should fail validation");

const badEnemyHitColorsPack = {
  id: "bad-enemy-hit-colors",
  totalStages: 1,
  enemyTypes: schema.enemyTypes.map((enemyType, index) => index === 3 ? { ...enemyType, hitColors: ["red"] } : enemyType),
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badEnemyHitColorsPack).ok === false, "bad enemy hit colors should fail validation");

const badSettingsPack = {
  id: "bad-settings",
  totalStages: 1,
  maps: [schema.maps[0]],
  stageSettings: [{ maxActiveEnemies: 0 }],
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badSettingsPack).ok === false, "bad maxActiveEnemies should fail validation");

const badGameSettingsPack = {
  id: "bad-game-settings",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { initialLives: 3, bonusLifeScores: [100], deathPowerLevel: 0, powerUpDurations: { helmet: 0 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badGameSettingsPack).ok === false, "bad gameSettings should fail validation");

const badTimerFreezePack = {
  id: "bad-timer-freeze",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { timerFreezesEnemyTime: "yes" },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badTimerFreezePack).ok === false, "bad timer freeze setting should fail validation");

const badTimingPack = {
  id: "bad-timing",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { timings: { stageIntro: -1 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badTimingPack).ok === false, "bad timing setting should fail validation");

const badPowerUpRulesPack = {
  id: "bad-power-up-rules",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { powerUpRules: { carrierRelease: "first" } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badPowerUpRulesPack).ok === false, "bad power-up rule should fail validation");

const badPowerUpScorePack = {
  id: "bad-power-up-score",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { powerUpRules: { pickupScore: -1 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badPowerUpScorePack).ok === false, "bad power-up score should fail validation");

const badEnemyAiPack = {
  id: "bad-enemy-ai",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { enemyAi: { targetAxisBias: 2 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badEnemyAiPack).ok === false, "bad enemy AI setting should fail validation");

const badEnemySpawnPacingPack = {
  id: "bad-enemy-spawn-pacing",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { enemySpawnPacing: { minDelay: -1 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badEnemySpawnPacingPack).ok === false, "bad enemy spawn pacing should fail validation");

const badPlayerMovementPack = {
  id: "bad-player-movement",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { playerMovement: { speed: 0 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badPlayerMovementPack).ok === false, "bad player movement should fail validation");

const badPlayerCadencePack = {
  id: "bad-player-cadence",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { playerMovement: { frameCadence: [false, false] } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badPlayerCadencePack).ok === false, "player movement cadence without an active frame should fail validation");

const badProjectileRulesPack = {
  id: "bad-projectile-rules",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { projectileRules: { bulletSize: 0 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badProjectileRulesPack).ok === false, "bad projectile rules should fail validation");

const badFriendlyFirePack = {
  id: "bad-friendly-fire",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { friendlyFire: { stunFrames: -1 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badFriendlyFirePack).ok === false, "bad friendly-fire rules should fail validation");

const badExplosionRulesPack = {
  id: "bad-explosion-rules",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { explosionRules: { enemyDestroy: { color: "orange" } } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badExplosionRulesPack).ok === false, "bad explosion rules should fail validation");

const badStageAdvancePack = {
  id: "bad-stage-advance",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { stageAdvance: { loopAfterFinalStage: "yes" } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badStageAdvancePack).ok === false, "bad stage advance rule should fail validation");

const badStageClearBonusPack = {
  id: "bad-stage-clear-bonus",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { stageClearBonus: { points: -1 } },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badStageClearBonusPack).ok === false, "bad stage clear bonus should fail validation");

const badUpgradePack = {
  id: "bad-upgrade",
  totalStages: 1,
  maps: [schema.maps[0]],
  gameSettings: { playerUpgradeRules: schema.playerUpgradeRules.map((rule, index) => index === 3 ? { ...rule, wallPower: 4 } : rule) },
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badUpgradePack).ok === false, "bad player upgrade rule should fail validation");

const badSpawnPack = {
  id: "bad-spawn",
  totalStages: 1,
  maps: [schema.maps[0]],
  stageSettings: [{
    maxActiveEnemies: 2,
    playerSpawns: [{ x: 99, y: 12 }, { x: 8, y: 12 }],
    enemySpawns: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }]
  }],
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badSpawnPack).ok === false, "bad spawn point should fail validation");

const badPowerSpawnPack = {
  id: "bad-power-spawn",
  totalStages: 1,
  maps: [schema.maps[0]],
  stageSettings: [{
    maxActiveEnemies: 2,
    powerUpSpawns: [{ x: 13, y: 1 }]
  }],
  enemies: [schema.enemies[0].slice(0, 3)]
};
assert(context.window.TankDefender8.validateStagePack(badPowerSpawnPack).ok === false, "bad power-up spawn point should fail validation");

const jsonResult = context.window.TankDefender8.loadStagePackJson(JSON.stringify(validPack));
assert(jsonResult.ok === true, "loadStagePackJson should accept valid JSON");

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
assert(context.window.TankDefender8.currentPackInfo().initialLives === 5, "current pack should expose custom initial lives");
assert(context.window.TankDefender8.currentPackInfo().bonusLifeScores[0] === 100, "current pack should expose custom bonus life scores");
assert(context.window.TankDefender8.currentPackInfo().deathPowerLevel === 2, "current pack should expose custom death power level");
assert(context.window.TankDefender8.currentPackInfo().powerUpDurations.timer === 50, "current pack should expose custom power-up durations");
assert(context.window.TankDefender8.currentPackInfo().powerUpDurations.shovelFlash === 16, "current pack should expose custom shovel flash duration");
assert(context.window.TankDefender8.currentPackInfo().powerUpRules.carrierRelease === "hit", "current pack should expose custom carrier release rule");
const customCarrierProbe = context.window.TankDefender8.debugCarrierReleaseProbe(4);
assert(customCarrierProbe.releaseOnThisHit === true, "hit-based carrier rule should release even before destruction");
assert(customCarrierProbe.clearUncollectedOnCarrierSpawn === false, "custom carrier spawn clearing rule should be exposed");
assert(customCarrierProbe.pickupScore === 750, "custom power-up pickup score should be exposed");
const customCarrierClearProbe = context.window.TankDefender8.debugCarrierSpawnClearsPowerUpProbe(true);
assert(customCarrierClearProbe.cleared === false && customCarrierClearProbe.hasPowerUp === true, "custom carrier clearing rule should preserve uncollected power-ups when disabled");
const destructionCarrierPack = {
  ...shortPack,
  id: "destruction-carrier",
  gameSettings: {
    ...shortPack.gameSettings,
    powerUpRules: { ...shortPack.gameSettings.powerUpRules, carrierRelease: "destroyed" }
  }
};
assert(context.window.TankDefender8.loadStagePack(destructionCarrierPack) === true, "destruction-only carrier pack should load");
assert(context.window.TankDefender8.debugCarrierReleaseProbe(4).releaseOnThisHit === false, "destruction-only carriers should not release before destruction");
assert(context.window.TankDefender8.debugCarrierReleaseProbe(1).releaseOnThisHit === true, "destruction-only carriers should release on the final hit");
assert(context.window.TankDefender8.loadStagePack(shortPack) === true, "short per-stage enemy list should reload after destruction-only carrier check");
assert(context.window.TankDefender8.currentPackInfo().timings.enemySpawnFlash === 11, "current pack should expose custom timing settings");
assert(context.window.TankDefender8.currentPackInfo().timings.stageClearDelay === 6, "current pack should expose custom stage clear delay");
assert(context.window.TankDefender8.currentPackInfo().enemySpawnPacing.firstDelay === 5, "current pack should expose custom first spawn delay");
assert(context.window.TankDefender8.currentPackInfo().enemySpawnPacing.baseDelay === 9, "current pack should expose custom enemy spawn base delay");
assert(context.window.TankDefender8.currentPackInfo().playerMovement.speed === 1.5, "current pack should expose custom player movement speed");
assert(context.window.TankDefender8.currentPackInfo().playerMovement.frameCadence.join(",") === "true", "legacy custom movement speed should remain active on every frame when cadence is omitted");
assert(context.window.TankDefender8.currentPackInfo().projectileRules.bulletSize === 6, "current pack should expose custom projectile bullet size");
assert(context.window.TankDefender8.currentPackInfo().friendlyFire.enabled === false, "current pack should expose custom friendly-fire enabled rule");
assert(context.window.TankDefender8.currentPackInfo().friendlyFire.stunFrames === 12, "current pack should expose custom friendly-fire stun frames");
assert(context.window.TankDefender8.currentPackInfo().explosionRules.enemyDestroy.ttl === 22, "current pack should expose custom explosion timing");
assert(context.window.TankDefender8.currentPackInfo().explosionRules.enemyDestroy.color === "#123456", "current pack should expose custom explosion color");
const explosionProbe = context.window.TankDefender8.debugExplosionRuleProbe("enemyDestroy");
assert(explosionProbe.ttl === 22 && explosionProbe.coreColor === "#abcdef", "custom explosion rules should apply through the runtime probe");
assert(context.window.TankDefender8.currentPackInfo().stageAdvance.loopAfterFinalStage === false, "current pack should expose custom stage advance rule");
assert(context.window.TankDefender8.currentPackInfo().stageClearBonus.points === 777, "current pack should expose custom stage clear bonus");
const projectileProbe = context.window.TankDefender8.debugProjectileRuleProbe();
assert(projectileProbe.w === 6 && projectileProbe.h === 6, "custom projectile rules should control bullet size");
assert(projectileProbe.x === 31 && projectileProbe.y === 20, "custom projectile rules should control bullet spawn offset");
assert(projectileProbe.boundsPadding === 2, "custom projectile rules should expose bounds padding");
const friendlyFireProbe = context.window.TankDefender8.debugFriendlyFireProbe();
assert(friendlyFireProbe.enabled === false && friendlyFireProbe.stunFrames === 0, "disabled friendly-fire should report no stun frames");
const finiteAdvanceProbe = context.window.TankDefender8.debugStageAdvanceProbe();
assert(finiteAdvanceProbe.stops === true && finiteAdvanceProbe.stage === 1, "finite packs should stop after the final stage when looping is disabled");
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
const gameOverSlideProbe = context.window.TankDefender8.debugGameOverSlideProbe();
assert(gameOverSlideProbe.slideDuration === 127 && gameOverSlideProbe.holdDuration === 129, "game-over field timing should split the original movement and hold phases");
assert(gameOverSlideProbe.duration === 256, "game-over field should keep running for the original 256 active frames");
assert(gameOverSlideProbe.entry.screen === "gameOver", "game-over entry should switch to the game-over screen");
assert(gameOverSlideProbe.entry.paused === false, "game-over entry should clear pause");
assert(gameOverSlideProbe.entry.timer === gameOverSlideProbe.duration, "game-over entry should initialize the full field timer");
assert(gameOverSlideProbe.frames[0].phase === "start" && gameOverSlideProbe.frames[0].y === 240, "game-over text should begin below the visible field");
assert(gameOverSlideProbe.frames[1].phase === "firstMove" && gameOverSlideProbe.frames[1].y === 239, "game-over text should move upward by one pixel on the first field frame");
assert(gameOverSlideProbe.frames[2].phase === "slideEnd" && gameOverSlideProbe.frames[2].y === 0x71, "game-over text should reach the original Y position after 127 movement frames");
assert(gameOverSlideProbe.frames[3].phase === "firstHold" && gameOverSlideProbe.frames[3].y === 0x71, "game-over text should stop moving for the remaining field frames");
assert(gameOverSlideProbe.frames[4].phase === "end" && gameOverSlideProbe.frames[4].y === 0x71, "game-over text should remain centered through the final field frame");
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
const bonusProbe = context.window.TankDefender8.debugStageClearBonusProbe(4, 3);
assert(bonusProbe.points === 777 && bonusProbe.recipients.join(",") === "1", "stage clear bonus should go to the strict kill leader");
assert(context.window.TankDefender8.debugStageClearBonusProbe(4, 4).recipients.length === 0, "stage clear bonus should not award ties by default");
assert(context.window.TankDefender8.debugStageClearBonusProbe(4, 3, 0, 1).recipients.length === 0, "an eliminated kill leader should not pass the result bonus to the runner-up");
assert(context.window.TankDefender8.debugStageClearPresentationProbe([20, 0, 0, 0], [0, 0, 0, 0], 0).duration === 8, "a positive custom stage-clear timing should override the dynamic result duration");
assert(context.window.TankDefender8.currentPackInfo().enemyAi.intersectionTurnChance === 0.33, "current pack should expose custom enemy intersection turn settings");
assert(context.window.TankDefender8.currentPackInfo().enemyAi.blockedRetryTicks === 5, "current pack should expose custom blocked retry timing");
assert(context.window.TankDefender8.currentPackInfo().playerUpgradeRules[0].maxBullets === 2, "current pack should expose custom player upgrade rules");
assert(context.window.TankDefender8.currentPackInfo().playerUpgradeRules[0].bulletSpeed === 2.75, "current pack should expose custom player bullet speed");
assert(context.window.TankDefender8.currentPackInfo().timerFreezesEnemyTime === false, "current pack should expose custom timer freeze rule");
const customTimerProbe = context.window.TankDefender8.debugTimerRuleProbe();
assert(customTimerProbe.frozen === false, "custom timer rule should allow enemy time to continue when disabled");
assert(customTimerProbe.canSpawn === true, "custom timer rule should still allow spawn countdown during timer");
assert(context.window.TankDefender8.currentPackInfo().playerSpawns[0].x === 3, "current stage should expose custom player spawns");
assert(context.window.TankDefender8.currentPackInfo().enemySpawns[0].x === 1, "current stage should expose custom enemy spawns");
assert(context.window.TankDefender8.currentPackInfo().powerUpSpawns[1].x === 10, "current stage should expose custom power-up spawns");
byAction.one.click();
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
assert(snapshot.players[0].speed === 1.5, "custom player movement speed should apply to new players");

assert(context.window.TankDefender8.validateStagePack(samplePack).ok === true, "sample stage pack should validate");
assert(context.window.TankDefender8.loadStagePack(samplePack) === true, "sample stage pack should load");
assert(context.window.TankDefender8.validateStagePack(quadrantPack).ok === true, "quadrant stage pack should validate");
assert(context.window.TankDefender8.loadStagePack(quadrantPack) === true, "quadrant stage pack should load");
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
const completedLowKillAdvanceProbe = context.window.TankDefender8.debugCompletedStageAdvanceProbe(1, 0);
assert(completedLowKillAdvanceProbe.screen === "stageIntro" && completedLowKillAdvanceProbe.stage === 2, "cleared stages should advance even if kill-table credit is lower than the enemy total");
assert(completedLowKillAdvanceProbe.transitions.some((entry) => entry.screen === "stageClear"), "low-credit cleared stages should still show the result screen before advancing");
const stageClearAdvanceProbe = context.window.TankDefender8.debugStageClearAdvanceProbe(1);
assert(stageClearAdvanceProbe.screen === "stageIntro" && stageClearAdvanceProbe.stage === 2, "stage clear completion should automatically start the next stage");
assert(stageClearAdvanceProbe.enemySpawned === 0 && stageClearAdvanceProbe.clearPendingTimer === 0, "new stage should reset stage-clear and enemy-spawn counters");
assert(context.window.TankDefender8.currentPackInfo().stageCycleLimit === 70, "free replacement pack should run the original-style 70-stage cycle");
assert(context.window.TankDefender8.currentPackInfo().enemyTotal === 20, "free replacement stage should expose 20 enemies");
assert(context.window.TankDefender8.currentPackInfo().enemySpawnPacing.baseDelay === 190, "free replacement pack should expose original spawn pacing");
assert(context.window.TankDefender8.currentPackInfo().enemySpawnPacing.extendedLoopMinDelay === 50, "free replacement pack should expose stage-35 extended-loop pacing");
assert(context.window.TankDefender8.currentPackInfo().playerMovement.frameCadence.join(",") === "true,true,false,true", "free replacement pack should apply the original player movement cadence at runtime");
assert(context.window.TankDefender8.currentPackInfo().friendlyFire.stunFrames === 200, "free replacement pack should apply the original friendly-fire stun ticks at runtime");
assert(context.window.TankDefender8.currentPackInfo().projectileRules.bulletSize === 4, "free replacement pack should expose default projectile rules");
assert(context.window.TankDefender8.currentPackInfo().explosionRules.enemyDestroy.ttl === 34, "free replacement pack should expose default explosion rules");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[2].speed === 0.5 && context.window.TankDefender8.currentPackInfo().enemyTypes[3].speed === 0.5, "free replacement pack should expose alternate-frame movement for power and armor enemies");
assert(context.window.TankDefender8.currentPackInfo().enemyTypes[1].bullet === 2 && context.window.TankDefender8.currentPackInfo().enemyTypes[2].bullet === 4, "free replacement pack should expose exact enemy bullet speed tiers");
const stage35CycleProbe = context.window.TankDefender8.debugStageCycleProbe(35);
const stage36CycleProbe = context.window.TankDefender8.debugStageCycleProbe(36);
const stage70CycleProbe = context.window.TankDefender8.debugStageCycleProbe(70);
assert(stage35CycleProbe.advance.stage === 36 && stage35CycleProbe.advance.wraps === false, "original-style stage 35 should advance to stage 36");
assert(stage36CycleProbe.mapDataStage === 1, "original-style stage 36 should reuse stage 1 map data");
assert(stage36CycleProbe.enemyDataStage === 35, "original-style stage 36 should use stage 35 enemy pattern data");
assert(stableJson(stage36CycleProbe.enemyTypeCounts) === stableJson(stage35CycleProbe.enemyTypeCounts), "stage 36 enemy group should match stage 35");
assert(stage36CycleProbe.carrierNumbers.join(",") === stage35CycleProbe.carrierNumbers.join(","), "stage 36 carriers should match stage 35");
assert(stage35CycleProbe.defaultEnemySpawnDelay === 50, "stage 35 should use the original fifty-frame interval value");
assert(stage36CycleProbe.defaultEnemySpawnDelay === stage35CycleProbe.defaultEnemySpawnDelay, "stage 36 should retain the stage-35 enemy spawn interval");
assert(stage35CycleProbe.twoPlayerDefaultEnemySpawnDelay === 30, "two-player mode should subtract twenty frames from the stage-35 interval");
assert(stage35CycleProbe.firstEnemySpawnDelay === 0 && stage35CycleProbe.twoPlayerFirstEnemySpawnDelay === 0, "the first enemy should spawn immediately in both player modes");
assert(stage35CycleProbe.onePlayerMaxActiveEnemies === 4 && stage35CycleProbe.twoPlayerMaxActiveEnemies === 6, "original modes should expose four and six enemy slots");
assert(stage35CycleProbe.spawnIndices.slice(0, 6).join(",") === "1,2,0,1,2,0", "enemy spawn points should cycle center, right, left");
const enemySpawnOverlapProbe = context.window.TankDefender8.debugEnemySpawnOverlapProbe();
assert(enemySpawnOverlapProbe.enemySpawned === 1 && enemySpawnOverlapProbe.playerOverlap === true, "an occupied spawn coordinate should not delay an enemy when an object slot is free");
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
assert(snapshot.explosionRules.enemyDestroy.ttl === 34, "sample pack should expose enemy destruction explosion rules");
assert(context.window.TankDefender8.debugExplosionRuleProbe("baseDestroy").ttl === 80, "default base destruction explosion should use configured timing");
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
assert(canvasContext.calls.some((call) => call.op === "strokeRect" && (call.style === "#f3f0d4" || call.style === "#e0b84b") && call.w <= 14 && call.h <= 14), "initial render should draw player spawn outline sprite parts");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#173b67" && call.w === 16 && call.h === 16), "render should draw terrain sprite parts from the manifest");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#d8c17a" && call.w === 10 && call.h === 10), "render should draw base sprite parts from the manifest");
assert(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#15161a" && call.w === 7 && call.h === 6), "render should draw enemy counter sprite parts from the manifest");

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
const terrainCollisionProbe = context.window.TankDefender8.debugTerrainCollisionProbe();
assert(terrainCollisionProbe.water.tankCanOccupy === false, "water should block tanks");
assert(terrainCollisionProbe.water.bulletRemoved === false, "water should not block bullets");
assert(terrainCollisionProbe.forest.tankCanOccupy === true, "forest should not block tanks");
assert(terrainCollisionProbe.forest.bulletRemoved === false, "forest should not block bullets");
assert(terrainCollisionProbe.ice.tankCanOccupy === true, "ice should not block tanks");
assert(terrainCollisionProbe.ice.bulletRemoved === false, "ice should not block bullets");
const baseWallPriorityProbe = context.window.TankDefender8.debugBaseWallPriorityProbe();
assert(baseWallPriorityProbe.shielded.baseAlive === true, "base wall should absorb a bullet before the base is destroyed");
assert(baseWallPriorityProbe.shielded.bulletRemoved === true, "base-shielding wall should consume the bullet");
assert(baseWallPriorityProbe.shielded.screen === "playing", "base should not enter game over while its wall absorbs the hit");
assert(baseWallPriorityProbe.exposed.baseAlive === false, "exposed base should be destroyed by an overlapping bullet");
assert(baseWallPriorityProbe.exposed.screen === "gameOver", "exposed base destruction should enter game over");
const tankCollisionProbe = context.window.TankDefender8.debugTankCollisionProbe();
assert(tankCollisionProbe.enemyBlocks === true, "enemy tanks should physically block player movement");
assert(tankCollisionProbe.teammateBlocks === true, "teammate tanks should physically block player movement");
assert(tankCollisionProbe.movingAwayFromEnemyAllowed === true, "blocked tanks should still be able to move away from the collision");

fileInput.files = [{ text: async () => JSON.stringify(validPack) }];
assert(typeof fileInput.listeners.change === "function", "file input change listener missing");
Promise.resolve(fileInput.listeners.change()).then(() => {
  assert(fileInput.value === "", "file input value should reset after import");
  console.log("smoke-test passed");
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
