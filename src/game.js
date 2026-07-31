(function () {
  "use strict";

  // ── Module imports ─────────────────────────────────────────────────────
  var deps = (window.TankDefender8Modules || {}).moduleDeps;
  if (!deps) throw new Error("module-deps.js must load before game.js");
  var sh = deps.sharedState;

  // ── DOM references ─────────────────────────────────────────────────────
  var canvas = document.getElementById("game");
  var packFileInput = document.getElementById("stage-pack-file");
  var ctx = canvas.getContext("2d");

  // ── Shared state ───────────────────────────────────────────────────────
  var state = sh.createSharedState({
    canvas: canvas,
    packFileInput: packFileInput,
    ctx: ctx,
    builtInStagePack: deps.createBuiltInStagePack()
  });
  state.fn = {};

  // ── Initialize game state ──────────────────────────────────────────────
  state.game.stagePack = state.builtInStagePack;

  // ── Stage runtime (must be before lifecycle/audio setups) ──────────────
  var stageExports = deps.createStageRuntime({
    getState: function () { return state.game; },
    builtInStagePack: state.builtInStagePack,
    demoMaxActiveEnemies: sh.DEMO_MAX_ACTIVE_ENEMIES
  });
  state.stageRuntime = stageExports;

  var debugBattleRuntime = deps.requireRuntimeModule("debugBattleRuntime").setupDebugBattleRuntime(state, deps);
  var preparePausedDebugBattle = debugBattleRuntime.preparePausedDebugBattle;

  // ── Setup runtime modules ──────────────────────────────────────────────
  deps.requireRuntimeModule("applicationFlowCompositionRuntime").setupApplicationFlowCompositionRuntime(state, deps, {
    tileTypeName: tileTypeName
  });

  // ── Stage runtime ──────────────────────────────────────────────────────

  // ── Tile type constants ────────────────────────────────────────────────
  var BRICK = deps.TILE_TYPES.BRICK;
  var STEEL = deps.TILE_TYPES.STEEL;
  var WATER = deps.TILE_TYPES.WATER;
  var FOREST = deps.TILE_TYPES.FOREST;
  var ICE = deps.TILE_TYPES.ICE;



  var renderPipelineCompositionRuntime = deps.requireRuntimeModule("renderPipelineCompositionRuntime").setupRenderPipelineCompositionRuntime(state, deps, {
    stageRuntime: stageExports
  });
  var renderAdapterRuntime = renderPipelineCompositionRuntime.renderAdapterRuntime;
  var battleCompositionRuntime = deps.requireRuntimeModule("battleCompositionRuntime").setupBattleCompositionRuntime(state, deps, {
    render: render,
    shouldSpawnEnemies: shouldSpawnEnemies,
    update: update
  });
  var frameLoopRuntime = battleCompositionRuntime.frameLoopRuntime;
  var screenUpdateRuntime = battleCompositionRuntime.screenUpdateRuntime;
  var renderPipelineCompletion = renderPipelineCompositionRuntime.finishRenderCompositionRuntime();
  var screenRenderRuntime = renderPipelineCompletion.screenRenderRuntime;

  // Runtime methods are referenced only after all extracted modules register them.
  deps.requireRuntimeModule("inputCompositionRuntime").setupInputCompositionRuntime(state, {
    dom: { document: document, window: window },
    isEditorDirectionCode: deps.isEditorDirectionCode,
    requireRuntimeModule: deps.requireRuntimeModule,
    sharedState: sh
  });

  function update() {
    return screenUpdateRuntime.updateFrame();
  }

  function tileTypeName(type) {
    if (type === BRICK) return "brick";
    if (type === STEEL) return "steel";
    if (type === WATER) return "water";
    if (type === FOREST) return "forest";
    if (type === ICE) return "ice";
    return "empty";
  }

  function shouldSpawnEnemies() {
    return true;
  }

  function render() {
    return screenRenderRuntime.render();
  }

  // ── Register local functions on state.fn (for debug-api access) ──────
  deps.requireRuntimeModule("legacyApiCompositionRuntime").setupLegacyApiCompositionRuntime(state, deps, {
    preparePausedDebugBattle: preparePausedDebugBattle,
    renderAdapterRuntime: renderAdapterRuntime,
    stageRuntime: stageExports,
    update: update,
    render: render,
    tileTypeName: tileTypeName,
    shouldSpawnEnemies: shouldSpawnEnemies
  });

  // ── Debug API (must be last) ───────────────────────────────────────────
  deps.requireRuntimeModule("debugApi").setupDebugApi(state, deps);

  // ── Main loop ──────────────────────────────────────────────────────────
  state.fn.loadHighScore();
  state.game.grid = stageExports.createStageGrid(state.game.stage);
  frameLoopRuntime.start();
})();
