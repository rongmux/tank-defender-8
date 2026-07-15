const { loadBrowserScripts } = require("./load-browser-scripts");

const CANVAS_W = 256;
const CANVAS_H = 240;
const TOOLBAR_ACTIONS = Object.freeze([
  "one", "two", "prev", "next", "edit", "test", "save",
  "load", "clear", "export", "import", "pause", "reset"
]);

class FakeButton {
  constructor(action) {
    this.dataset = { action };
    this.textContent = action.toUpperCase();
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
      for (let px = left; px < right; px += 1) pixels[py * CANVAS_W + px] = style;
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
      this.sampleRate = 44100;
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

    createBuffer(channels, length) {
      const channelData = Array.from({ length: channels }, () => new Float32Array(length));
      return {
        getChannelData(channel) {
          return channelData[channel];
        }
      };
    }

    createBufferSource() {
      return {
        buffer: null,
        loop: false,
        connect() {
          return gainNode;
        },
        start() {},
        stop() {}
      };
    }

    resume() {
      this.state = "running";
    }
  };
}

function createBrowserGameHarness(root) {
  const buttons = TOOLBAR_ACTIONS.map((action) => new FakeButton(action));
  const listeners = {};
  const storage = { "tank-defender-8-high-score": "12345" };
  const clipboard = { text: "" };
  const canvasContext = makeCanvasContext();
  const fileInput = new FakeInput();
  let animationFrameCallback = null;

  const canvas = {
    width: CANVAS_W,
    height: CANVAS_H,
    listeners: {},
    getContext(type) {
      if (type !== "2d") throw new Error(`unexpected canvas context: ${type}`);
      return canvasContext;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: CANVAS_W, height: CANVAS_H };
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

  const browserScripts = loadBrowserScripts(root, context);
  return {
    context: browserScripts.context,
    source: browserScripts.sources["src/game.js"],
    actions: TOOLBAR_ACTIONS,
    buttons,
    listeners,
    storage,
    clipboard,
    canvas,
    canvasContext,
    fileInput,
    animationFrameCallback
  };
}

module.exports = {
  createBrowserGameHarness,
  makeCanvasContext
};
