(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    sharedState: isCommonJs ? require("./shared-state") : modules.sharedState,
    stageResultRules: isCommonJs
      ? require("../rules/stage-result-rules")
      : modules.stageResultRules
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before stage-result-diagnostics.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.stageResultDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { STAGE_RESULT_ROW_LAYOUT } = dependencies.sharedState;
  const {
    createStageResultPresentation,
    createStageResultSummary,
    selectStageClearBonusRecipients
  } = dependencies.stageResultRules;

  function nonNegativeInteger(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function requireEnemyTypes(enemyTypes) {
    if (!Array.isArray(enemyTypes) || enemyTypes.length === 0) {
      throw new Error("enemyTypes must be a non-empty array");
    }
    return enemyTypes;
  }

  /** Creates the normalized player record used by stage-result diagnostic probes. */
  function createStageResultProbePlayer(enemyTypes, id, kills, bonusPoints) {
    const types = requireEnemyTypes(enemyTypes);
    const stageKills = types.map((type, index) => (
      Array.isArray(kills) ? nonNegativeInteger(kills[index]) : 0
    ));
    const enemyPoints = stageKills.reduce(
      (sum, count, index) => sum + count * types[index].score,
      0
    );
    return {
      id,
      stageKills,
      stagePoints: enemyPoints + nonNegativeInteger(bonusPoints)
    };
  }

  function requireDiagnosticOptions(options) {
    if (!options || typeof options !== "object") {
      throw new Error("options must be an object");
    }
    for (const name of [
      "getGameSettings",
      "getEnemyTypes",
      "getStageClearElapsed",
      "getStageClearBonusAwarded"
    ]) {
      if (typeof options[name] !== "function") {
        throw new Error(`${name} must be a function`);
      }
    }
    return options;
  }

  function createStageResultDiagnostics(options) {
    const {
      getGameSettings,
      getEnemyTypes,
      getStageClearElapsed,
      getStageClearBonusAwarded
    } = requireDiagnosticOptions(options);

    function probePlayer(id, kills, bonusPoints) {
      return createStageResultProbePlayer(getEnemyTypes(), id, kills, bonusPoints);
    }

    function presentationFor(players, elapsed) {
      const frame = Math.max(
        0,
        Math.floor(elapsed === undefined ? getStageClearElapsed() : elapsed)
      );
      return createStageResultPresentation(
        players,
        getEnemyTypes(),
        frame,
        getStageClearBonusAwarded()
      );
    }

    return Object.freeze({
      debugStageClearBonusProbe(p1Kills, p2Kills, p1Lives, p2Lives) {
        const players = [
          {
            id: 1,
            lives: p1Lives === undefined ? 1 : nonNegativeInteger(p1Lives),
            stageKills: [nonNegativeInteger(p1Kills)]
          },
          {
            id: 2,
            lives: p2Lives === undefined ? 1 : nonNegativeInteger(p2Lives),
            stageKills: [nonNegativeInteger(p2Kills)]
          }
        ];
        const bonus = getGameSettings().stageClearBonus;
        return {
          points: bonus.points,
          recipients: selectStageClearBonusRecipients(players, bonus).map((player) => player.id)
        };
      },

      debugStageClearResultRowsProbe(p1Kills, p2Kills, p1BonusPoints, p2BonusPoints) {
        const summary = createStageResultSummary([
          probePlayer(1, p1Kills, p1BonusPoints),
          probePlayer(2, p2Kills, p2BonusPoints)
        ], getEnemyTypes());
        return {
          rows: summary.rows.map((row) => ({
            typeIndex: row.typeIndex,
            score: row.score,
            p1Kills: row.p1Kills,
            p1Points: row.p1Points,
            p2Kills: row.p2Kills,
            p2Points: row.p2Points
          })),
          p1EnemyPoints: summary.p1EnemyPoints,
          p2EnemyPoints: summary.p2EnemyPoints,
          p1BonusPoints: summary.p1BonusPoints,
          p2BonusPoints: summary.p2BonusPoints,
          p1StagePoints: summary.p1StagePoints,
          p2StagePoints: summary.p2StagePoints
        };
      },

      debugStageClearRowLayoutProbe() {
        const layout = STAGE_RESULT_ROW_LAYOUT;
        const leftArrowRight = layout.leftArrowX + layout.arrowWidth;
        const miniTankRight = layout.miniTankX + layout.miniTankWidth;
        return {
          ...layout,
          leftGap: layout.miniTankX - leftArrowRight,
          rightGap: layout.rightArrowX - miniTankRight,
          leftOverlapsTank: leftArrowRight > layout.miniTankX,
          tankOverlapsRight: miniTankRight > layout.rightArrowX
        };
      },

      debugStageClearPresentationProbe(p1Kills, p2Kills, elapsed) {
        const players = [
          probePlayer(1, p1Kills, 0),
          probePlayer(2, p2Kills, 0)
        ];
        const presentation = presentationFor(players, elapsed);
        const override = getGameSettings().timings.stageClear;
        const duration = override > 0 ? override : presentationFor(players, 0).endFrame;
        return {
          rows: presentation.rows.map((row) => ({
            typeIndex: row.typeIndex,
            p1Kills: row.p1Kills,
            p2Kills: row.p2Kills,
            firstCountFrame: row.firstCountFrame,
            countStep: row.countStep,
            p1VisibleKills: row.p1VisibleKills,
            p2VisibleKills: row.p2VisibleKills,
            p1VisiblePoints: row.p1VisiblePoints,
            p2VisiblePoints: row.p2VisiblePoints
          })),
          totalsRevealFrame: presentation.totalsRevealFrame,
          bonusRevealFrame: presentation.bonusRevealFrame,
          endFrame: presentation.endFrame,
          duration,
          showTotals: presentation.showTotals,
          showBonus: presentation.showBonus
        };
      }
    });
  }

  return Object.freeze({
    createStageResultDiagnostics,
    createStageResultProbePlayer
  });
});
