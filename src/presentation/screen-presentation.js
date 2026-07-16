(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const geometry = isCommonJs ? require("../core/geometry") : browserModules.geometry;
  if (!geometry) throw new Error("geometry module must load before screen-presentation.js");

  const api = factory(geometry);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.screenPresentation = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry) {
  "use strict";

  const { clamp } = geometry;
  const FULL_GAME_OVER_SCREEN_FRAMES = 108;
  const HIGH_SCORE_SCREEN_FRAMES = 460;
  const HIGH_SCORE_PALETTE_COLORS = Object.freeze([
    "#111111",
    "#345fd1",
    "#6b6f78",
    "#f3f0d4"
  ]);
  const STAGE_CURTAIN_CLOSE_FRAMES = 16;
  const STAGE_CURTAIN_OPEN_FRAMES = 16;
  const STAGE_PREPARE_FRAMES = 2;
  const DEFAULT_SCREEN_WIDTH = 256;
  const DEFAULT_SCREEN_HEIGHT = 240;
  const CURTAIN_ROW_HEIGHT = 8;
  const CURTAIN_MAX_ROWS = 15;

  function normalizePositiveInteger(value, fallback) {
    const normalized = Math.floor(Number(value));
    return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
  }

  function formatScore5(score) {
    return String(clamp(Math.floor(Number(score) || 0), 0, 99999)).padStart(5, "0");
  }

  function fullGameOverPresentation(elapsed) {
    return {
      elapsed: clamp(Math.floor(Number(elapsed) || 0), 0, FULL_GAME_OVER_SCREEN_FRAMES - 1),
      duration: FULL_GAME_OVER_SCREEN_FRAMES,
      gameText: "GAME",
      overText: "OVER",
      x: 0x3c,
      gameY: 0x46,
      overY: 0x78,
      letterAdvance: 0x20,
      scale: 5
    };
  }

  function highScorePresentation(elapsed, score, options) {
    const source = options || {};
    const frame = Math.max(0, Math.floor(Number(elapsed) || 0));
    const screenWidth = normalizePositiveInteger(source.screenWidth, DEFAULT_SCREEN_WIDTH);
    const glyphAdvance = normalizePositiveInteger(source.glyphAdvance, 30);
    const scoreText = String(clamp(Math.floor(Number(score) || 0), 0, 9999999));
    const palettePhase = frame & 3;
    return {
      frame,
      duration: HIGH_SCORE_SCREEN_FRAMES,
      palettePhase,
      color: HIGH_SCORE_PALETTE_COLORS[palettePhase],
      scoreText,
      scoreX: Math.round((screenWidth - scoreText.length * glyphAdvance) / 2)
    };
  }

  /** Builds fixed score groups so the two-player title row cannot overlap. */
  function titleScoreLayout(menuIndex, highScore) {
    const selected = Math.floor(Number(menuIndex) || 0);
    const items = [
      { id: "p1Label", text: "I-", x: 16, y: 24 },
      { id: "p1Score", text: "00", x: 60, y: 24 },
      { id: "highLabel", text: "HI-", x: 88, y: 24 },
      { id: "highScore", text: formatScore5(highScore), x: 128, y: 24 }
    ];
    if (selected === 1) {
      items.push(
        { id: "p2Label", text: "II-", x: 168, y: 24 },
        { id: "p2Score", text: "00", x: 220, y: 24 }
      );
    }
    return items.map((item) => Object.freeze({
      ...item,
      width: item.text.length * 6 - 1,
      right: item.x + item.text.length * 6 - 2
    }));
  }

  function curtainRects(coverRows, options) {
    const source = options || {};
    const screenWidth = normalizePositiveInteger(source.screenWidth, DEFAULT_SCREEN_WIDTH);
    const screenHeight = normalizePositiveInteger(source.screenHeight, DEFAULT_SCREEN_HEIGHT);
    const rowHeight = normalizePositiveInteger(source.rowHeight, CURTAIN_ROW_HEIGHT);
    const maxRows = normalizePositiveInteger(source.maxRows, CURTAIN_MAX_ROWS);
    const rows = clamp(Math.floor(Number(coverRows) || 0), 0, maxRows);
    const coverHeight = rows * rowHeight;
    return {
      coverRows: rows,
      coverHeight,
      top: { x: 0, y: 0, w: screenWidth, h: coverHeight },
      bottom: { x: 0, y: screenHeight - coverHeight, w: screenWidth, h: coverHeight }
    };
  }

  /** Reproduces the sixteen waits that replace paired top and bottom rows with grey tiles. */
  function stageSelectCurtainState(timer, options) {
    const source = options || {};
    const duration = normalizePositiveInteger(source.duration, STAGE_CURTAIN_CLOSE_FRAMES);
    const remaining = clamp(Math.floor(Number(timer) || 0), 0, duration);
    const elapsed = duration - remaining;
    return {
      duration,
      remaining,
      elapsed,
      progress: elapsed / duration,
      ...curtainRects(Math.min(CURTAIN_MAX_ROWS, elapsed), source)
    };
  }

  function openingCurtainRows(completedFrames, openingFrames) {
    const duration = normalizePositiveInteger(openingFrames, STAGE_CURTAIN_OPEN_FRAMES);
    const completed = clamp(Math.floor(Number(completedFrames) || 0), 0, duration);
    if (completed === 0) return CURTAIN_MAX_ROWS;
    return Math.max(0, Math.min(CURTAIN_MAX_ROWS - 1, duration - completed));
  }

  /** Splits the intro window into map loading, discrete opening, and tank preparation phases. */
  function stageIntroCurtainState(timer, stage, options) {
    const source = options || {};
    const duration = normalizePositiveInteger(source.duration, 1);
    const remaining = clamp(Math.floor(Number(timer) || 0), 0, duration);
    const elapsed = duration - remaining;
    const configuredPrepareFrames = Math.max(
      0,
      Math.floor(Number(source.prepareFrames === undefined ? STAGE_PREPARE_FRAMES : source.prepareFrames) || 0)
    );
    const configuredOpeningFrames = normalizePositiveInteger(
      source.openingFrames,
      STAGE_CURTAIN_OPEN_FRAMES
    );
    const prepareFrames = Math.min(configuredPrepareFrames, Math.max(0, duration - 1));
    const openingFrames = Math.min(configuredOpeningFrames, Math.max(1, duration - prepareFrames));
    const loadingFrames = Math.max(0, duration - openingFrames - prepareFrames);
    const openingElapsed = clamp(elapsed - loadingFrames, 0, openingFrames);
    const openingStep = Math.floor((openingElapsed / openingFrames) * configuredOpeningFrames);
    const phase = elapsed < loadingFrames
      ? "loading"
      : elapsed < loadingFrames + openingFrames
        ? "opening"
        : "prepare";
    const stageNumber = Math.max(1, Math.floor(Number(stage) || 1));
    return {
      duration,
      remaining,
      elapsed,
      progress: elapsed / duration,
      phase,
      loadingFrames,
      openingFrames,
      prepareFrames,
      openingElapsed,
      openingStep,
      ...curtainRects(
        phase === "loading" ? CURTAIN_MAX_ROWS : openingCurtainRows(openingStep, configuredOpeningFrames),
        source
      ),
      label: `STAGE ${stageNumber}`,
      labelX: 96,
      labelY: 112
    };
  }

  return Object.freeze({
    CURTAIN_MAX_ROWS,
    CURTAIN_ROW_HEIGHT,
    DEFAULT_SCREEN_HEIGHT,
    DEFAULT_SCREEN_WIDTH,
    FULL_GAME_OVER_SCREEN_FRAMES,
    HIGH_SCORE_PALETTE_COLORS,
    HIGH_SCORE_SCREEN_FRAMES,
    STAGE_CURTAIN_CLOSE_FRAMES,
    STAGE_CURTAIN_OPEN_FRAMES,
    STAGE_PREPARE_FRAMES,
    curtainRects,
    fullGameOverPresentation,
    highScorePresentation,
    openingCurtainRows,
    stageIntroCurtainState,
    stageSelectCurtainState,
    titleScoreLayout
  });
});
