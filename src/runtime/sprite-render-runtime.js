(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.spriteRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.FREE_SPRITE_MANIFEST || typeof deps.FREE_SPRITE_MANIFEST !== "object") {
      throw new Error("deps.FREE_SPRITE_MANIFEST must be an object");
    }
  }

  /** Owns manifest frame lookup and native/scaled rectangle submission. */
  function setupSpriteRenderRuntime(state, deps) {
    requireInputs(state, deps);

    var ctx = state.ctx;
    var spriteManifest = deps.FREE_SPRITE_MANIFEST;

    function drawManifestSprite(spriteName, frameName, x, y, palette) {
      var sprite = spriteManifest.sprites[spriteName];
      var frame = sprite && sprite.frames[frameName];
      if (!frame) return;
      for (var i = 0; i < frame.length; i += 1) {
        var part = frame[i];
        var rect = part.rect;
        var color = palette[part.role] || part.color || "#ffffff";
        if (part.op === "stroke") {
          ctx.strokeStyle = color;
          ctx.strokeRect(x + rect[0], y + rect[1], rect[2], rect[3]);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x + rect[0], y + rect[1], rect[2], rect[3]);
        }
      }
    }

    function drawMiniTank(x, y, color, typeIndex) {
      drawManifestSprite("miniTank", "up", x, y, {
        primary: color,
        shadow: "#111111"
      });
      drawMiniTankTypeDetails(x, y, color, typeIndex);
    }

    function drawMiniTankTypeDetails(x, y, color, typeIndex) {
      var type = Math.max(0, Math.min(3, Math.floor(Number(typeIndex) || 0)));
      if (type === 0) return;
      if (type === 1) {
        // Fast tanks use offset tread marks in the NES result-table silhouette.
        ctx.fillStyle = "#111111";
        ctx.fillRect(x + 1, y + 4, 2, 2);
        ctx.fillRect(x + 11, y + 8, 2, 2);
        return;
      }
      if (type === 2) {
        // Power tanks have the characteristic split barrel.
        ctx.fillStyle = color;
        ctx.fillRect(x + 5, y + 1, 1, 4);
        ctx.fillRect(x + 8, y + 1, 1, 4);
        return;
      }
      // Armor tanks carry a visible plate around the central hull.
      ctx.strokeStyle = "#f3f0d4";
      ctx.strokeRect(x + 3, y + 3, 8, 8);
    }

    function drawScaledManifestSprite(spriteName, frameName, x, y, scale, palette) {
      var sprite = spriteManifest.sprites[spriteName];
      var frame = sprite && sprite.frames[frameName];
      if (!frame) return;
      for (var i = 0; i < frame.length; i += 1) {
        var part = frame[i];
        var rect = part.rect;
        var color = palette[part.role] || part.color || "#ffffff";
        var rx = x + rect[0] * scale;
        var ry = y + rect[1] * scale;
        var rw = rect[2] * scale;
        var rh = rect[3] * scale;
        if (part.op === "stroke") {
          ctx.strokeStyle = color;
          ctx.strokeRect(rx, ry, rw, rh);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(rx, ry, rw, rh);
        }
      }
    }

    var api = {
      drawManifestSprite: drawManifestSprite,
      drawMiniTank: drawMiniTank,
      drawScaledManifestSprite: drawScaledManifestSprite
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupSpriteRenderRuntime: setupSpriteRenderRuntime });
});
