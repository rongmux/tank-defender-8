// Comprehensive runtime test — simulates browser loading and game loop
var vm = require('vm');
var fs = require('fs');
var path = require('path');
var root = path.resolve(__dirname, '..');

// Build complete browser mock
var canvasOps = [];
var mockCtx = {
  imageSmoothingEnabled: false,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  fillRect: function(x,y,w,h) { canvasOps.push({op:'fillRect',x:x,y:y,w:w,h:h,style:this.fillStyle}); },
  strokeRect: function(x,y,w,h) { canvasOps.push({op:'strokeRect',x:x,y:y,w:w,h:h,style:this.strokeStyle,lineWidth:this.lineWidth}); },
  save: function(){}, restore: function(){},
  translate: function(){}, scale: function(){},
  beginPath: function(){}, moveTo: function(){}, lineTo: function(){}, closePath: function(){},
  fill: function(){}, stroke: function(){},
  getImageData: function(){ return {data: new Uint8ClampedArray(4)}; },
  putImageData: function(){},
  drawImage: function(){},
  createImageData: function(){ return {data: new Uint8ClampedArray(4)}; }
};

var mockCanvas = {
  getContext: function() { return mockCtx; },
  width: 256,
  height: 240,
  addEventListener: function(){}
};

var mockFileInput = {
  click: function(){},
  addEventListener: function(){},
  value: ''
};

var audioNodeOps = [];
var mockAudioCtx = function() {
  var ctx = {
    state: 'running',
    sampleRate: 44100,
    currentTime: 0,
    destination: {},
    resume: function(){},
    createBuffer: function(channels, length, rate) {
      return { getChannelData: function() { return new Float32Array(length); } };
    },
    createBufferSource: function() {
      var src = {
        buffer: null, loop: false,
        start: function(){ audioNodeOps.push({op:'start',type:'bufferSource'}); },
        stop: function(){ audioNodeOps.push({op:'stop',type:'bufferSource'}); },
        connect: function(dest) { audioNodeOps.push({op:'connect',from:'bufferSource',to:dest}); return dest; },
        onended: null,
        frequency: null,
        playbackRate: {value:1}
      };
      return src;
    },
    createOscillator: function() {
      var osc = {
        type: '',
        frequency: { value: 0 },
        start: function(){ audioNodeOps.push({op:'start',type:'oscillator'}); },
        stop: function(){ audioNodeOps.push({op:'stop',type:'oscillator'}); },
        connect: function(dest) { audioNodeOps.push({op:'connect',from:'oscillator',to:dest}); return dest; },
        onended: null
      };
      return osc;
    },
    createGain: function() {
      var gain = {
        gain: { value: 0, setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){} },
        connect: function(dest) { audioNodeOps.push({op:'connect',from:'gain',to:dest}); return dest; }
      };
      return gain;
    }
  };
  return ctx;
};

var context = {
  window: {
    addEventListener: function(){},
    AudioContext: mockAudioCtx
  },
  document: {
    getElementById: function(id) {
      if (id === 'game') return mockCanvas;
      if (id === 'stage-pack-file') return mockFileInput;
      var el = { addEventListener: function(){}, querySelectorAll: function(){return[];} };
      return el;
    },
    querySelectorAll: function(){ return []; },
    addEventListener: function(){}
  },
  performance: { now: function() { return Date.now(); } },
  requestAnimationFrame: function(cb) { globalThis._rafCb = cb; },
  navigator: { clipboard: { writeText: function(){ return Promise.resolve(); } } },
  localStorage: { getItem: function(){ return null; }, setItem: function(){} },
  console: { log: function(){}, error: function(msg) { console.log('CONSOLE ERROR:', msg); } },
  TankDefender8Modules: {}
};
vm.createContext(context);

// Load HTML scripts in order
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var scriptRegex = /<script src="([^"]+)"><\/script>/g;
var scripts = [];
var match;
while ((match = scriptRegex.exec(html)) !== null) {
  scripts.push(match[1]);
}

console.log('=== Loading ' + scripts.length + ' scripts ===');
var errors = [];
for (var i = 0; i < scripts.length; i++) {
  var s = scripts[i];
  try {
    var code = fs.readFileSync(path.join(root, s), 'utf8');
    vm.runInContext(code, context, { filename: s });
  } catch(e) {
    console.error('FAIL at script ' + (i+1) + ': ' + s);
    console.error('  ' + e.message);
    if (e.stack) {
      var stackLines = e.stack.split('\n');
      for (var j = 1; j < Math.min(stackLines.length, 4); j++) {
        console.error('  ' + stackLines[j].trim());
      }
    }
    errors.push({script: s, error: e.message});
  }
}

if (errors.length > 0) {
  console.error('\n=== ' + errors.length + ' script load errors ===');
  process.exit(1);
}

console.log('All scripts loaded OK');

// Check TankDefender8 API
var api = context.window.TankDefender8;
console.log('TankDefender8 methods:', api ? Object.keys(api).length : 'MISSING!');

// Try running a few frames
console.log('\n=== Running game frames ===');
var rafCb = globalThis._rafCb;
if (!rafCb) {
  console.error('ERROR: requestAnimationFrame callback not set! Game loop not started.');
  process.exit(1);
}

var frameErrors = [];
for (var frame = 0; frame < 10; frame++) {
  try {
    rafCb(performance.now() + frame * 17);
  } catch(e) {
    console.error('Frame ' + frame + ' ERROR: ' + e.message);
    frameErrors.push({frame: frame, error: e.message});
    break;
  }
}

if (frameErrors.length === 0) {
  console.log('10 frames rendered without errors!');
} else {
  console.error('Frame errors:', frameErrors.length);
}
