(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.scoreRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function addScorePoints(player, points) {
    const previousScore = player.score;
    player.score += points;
    return { previousScore, nextScore: player.score };
  }

  /** Advances threshold progress and returns how many reserve lives were awarded. */
  function awardBonusLives(player, previousScore, nextScore, thresholds) {
    let awarded = 0;
    while (player.nextBonusLifeIndex < thresholds.length && previousScore >= thresholds[player.nextBonusLifeIndex]) {
      player.nextBonusLifeIndex += 1;
    }
    while (player.nextBonusLifeIndex < thresholds.length && nextScore >= thresholds[player.nextBonusLifeIndex]) {
      const threshold = thresholds[player.nextBonusLifeIndex];
      player.nextBonusLifeIndex += 1;
      if (previousScore < threshold) {
        player.lives += 1;
        awarded += 1;
      }
    }
    return awarded;
  }

  return Object.freeze({
    addScorePoints,
    awardBonusLives
  });
});
