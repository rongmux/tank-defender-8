(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.textRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.pixelGlyph !== "function") throw new Error("deps.pixelGlyph must be a function");
    if (typeof deps.rightAlignedPixelTextX !== "function") {
      throw new Error("deps.rightAlignedPixelTextX must be a function");
    }
  }

  /** Owns all integer pixel-font Canvas submission used by the game UI. */
  function setupTextRenderRuntime(state, deps) {
    requireInputs(state, deps);

    var ctx = state.ctx;
    var pixelGlyph = deps.pixelGlyph;
    var rightAlignedPixelTextX = deps.rightAlignedPixelTextX;

    function drawText(text, x, y, scale, color, advance) {
      ctx.fillStyle = color || "#ffffff";
      var size = Math.max(1, Math.floor(scale || 1));
      var glyphAdvance = Math.max(5, Math.floor(advance || 6));
      var cursorX = Math.round(x);
      var top = Math.round(y);
      var value = String(text).toUpperCase();
      for (var charIndex = 0; charIndex < value.length; charIndex += 1) {
        var glyph = pixelGlyph(value[charIndex]);
        for (var row = 0; row < glyph.length; row += 1) {
          for (var column = 0; column < glyph[row].length; column += 1) {
            if (glyph[row][column] === "1") {
              ctx.fillRect(cursorX + column * size, top + row * size, size, size);
            }
          }
        }
        cursorX += glyphAdvance * size;
      }
    }

    function drawTextClipped(text, x, y, scale, color, clips) {
      if (!clips || !clips.length) return;
      ctx.fillStyle = color || "#ffffff";
      var size = Math.max(1, Math.floor(scale || 1));
      var cursorX = Math.round(x);
      var top = Math.round(y);
      var value = String(text).toUpperCase();
      for (var charIndex = 0; charIndex < value.length; charIndex += 1) {
        var glyph = pixelGlyph(value[charIndex]);
        for (var row = 0; row < glyph.length; row += 1) {
          for (var column = 0; column < glyph[row].length; column += 1) {
            if (glyph[row][column] !== "1") continue;
            var px = cursorX + column * size;
            var py = top + row * size;
            for (var clipIndex = 0; clipIndex < clips.length; clipIndex += 1) {
              var clip = clips[clipIndex];
              var left = Math.max(px, clip.x);
              var right = Math.min(px + size, clip.x + clip.w);
              var clipTop = Math.max(py, clip.y);
              var bottom = Math.min(py + size, clip.y + clip.h);
              if (right > left && bottom > clipTop) ctx.fillRect(left, clipTop, right - left, bottom - clipTop);
            }
          }
        }
        cursorX += 6 * size;
      }
    }

    function drawTextRight(text, right, y, scale, color) {
      var value = String(text);
      var size = Math.max(1, Math.floor(scale || 1));
      drawText(value, rightAlignedPixelTextX(value, right, size), y, size, color);
    }

    var api = {
      drawText: drawText,
      drawTextClipped: drawTextClipped,
      drawTextRight: drawTextRight
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTextRenderRuntime: setupTextRenderRuntime });
});
