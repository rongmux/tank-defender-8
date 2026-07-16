(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const directions = isCommonJs
    ? require("../core/directions")
    : (root.TankDefender8Modules || {}).directions;
  const stageGrid = isCommonJs
    ? require("../stages/stage-grid")
    : (root.TankDefender8Modules || {}).stageGrid;
  if (!directions) throw new Error("directions module must load before wall-damage-rules.js");
  if (!stageGrid) throw new Error("stageGrid module must load before wall-damage-rules.js");

  const api = factory(directions, stageGrid);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.wallDamageRules = api;
})(typeof window !== "undefined" ? window : globalThis, function (directions, stageGrid) {
  "use strict";

  const { DOWN, LEFT, UP } = directions;
  const {
    BRICK_QUARTER_FRAGMENT_MASKS,
    TILE_TYPES,
    normalizeBrickFragmentMask,
    quarterMaskFromBrickFragments
  } = stageGrid;
  const { EMPTY, STEEL } = TILE_TYPES;

  function brickImpactOrder(dir) {
    if (dir === UP) return [2, 3, 0, 1];
    if (dir === DOWN) return [0, 1, 2, 3];
    if (dir === LEFT) return [1, 3, 0, 2];
    return [0, 2, 1, 3];
  }

  function brickImpactStripMasks(quarter, dir) {
    const row = quarter >= 2 ? 2 : 0;
    const col = (quarter & 1) * 2;
    const rowMask = (targetRow) => (1 << (targetRow * 4 + col)) | (1 << (targetRow * 4 + col + 1));
    const colMask = (targetCol) => (1 << (row * 4 + targetCol)) | (1 << ((row + 1) * 4 + targetCol));
    if (dir === UP) return [rowMask(row + 1), rowMask(row)];
    if (dir === DOWN) return [rowMask(row), rowMask(row + 1)];
    if (dir === LEFT) return [colMask(col + 1), colMask(col)];
    return [colMask(col), colMask(col + 1)];
  }

  /** Selects the first intact 4px-deep strip, or the full 8px quarter for powered shots. */
  function brickDamageMask(fragments, hitFragments, dir, power) {
    const quarter = brickImpactOrder(dir).find((q) => hitFragments & BRICK_QUARTER_FRAGMENT_MASKS[q]);
    if (quarter === undefined) return 0;
    const quarterFragments = fragments & BRICK_QUARTER_FRAGMENT_MASKS[quarter];
    if (power >= 2) return quarterFragments;
    return brickImpactStripMasks(quarter, dir)
      .map((stripMask) => stripMask & quarterFragments)
      .find((stripMask) => stripMask !== 0) || 0;
  }

  function damageSteelWall(cell, bullet, hitMask) {
    if (bullet.power < 3) return false;
    const candidates = cell.mask & (hitMask === undefined ? cell.mask : hitMask);
    const clearMask = brickImpactOrder(bullet.dir)
      .map((quarter) => 1 << quarter)
      .find((quarterMask) => candidates & quarterMask) || 0;
    if (!clearMask) return false;

    cell.mask &= ~clearMask;
    cell.steelHits = [0, 0, 0, 0];
    if (cell.mask === 0) cell.type = EMPTY;
    return true;
  }

  /** Mutates one brick/steel cell; grid coordinates remain in the signature for runtime compatibility. */
  function damageWall(cell, _c, _r, bullet, hitMask) {
    if (cell.type === STEEL) return damageSteelWall(cell, bullet, hitMask);
    const fragments = normalizeBrickFragmentMask(cell.brickMask, cell.mask);
    const clearMask = brickDamageMask(fragments, hitMask, bullet.dir, bullet.power);
    cell.brickMask = fragments & ~clearMask;
    cell.mask = quarterMaskFromBrickFragments(cell.brickMask);
    if (cell.mask === 0) {
      cell.type = EMPTY;
      cell.brickMask = 0;
    }
    return clearMask !== 0;
  }

  return Object.freeze({
    brickDamageMask,
    brickImpactOrder,
    brickImpactStripMasks,
    damageSteelWall,
    damageWall
  });
});
