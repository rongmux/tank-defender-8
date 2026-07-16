(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageResultRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const STAGE_RESULT_TIMING = Object.freeze({
    initialWait: 30,
    rowSetup: 1,
    countUpdate: 1,
    countHold: 8,
    betweenRows: 20,
    beforeTotals: 30,
    beforeBonus: 15,
    finalHold: 120
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function stageKillCount(player, typeIndex) {
    if (!player || !Array.isArray(player.stageKills)) return 0;
    return Math.max(0, Math.floor(Number(player.stageKills[typeIndex]) || 0));
  }

  function emptyResultPlayer(id, typeCount) {
    return {
      id,
      stagePoints: 0,
      stageKills: Array(typeCount).fill(0)
    };
  }

  function createStageResultRows(p1, p2, enemyTypes) {
    return enemyTypes.map((type, index) => {
      const p1Kills = stageKillCount(p1, index);
      const p2Kills = stageKillCount(p2, index);
      return {
        typeIndex: index,
        name: type.name,
        color: type.color,
        score: type.score,
        p1Kills,
        p1Points: p1Kills * type.score,
        p2Kills,
        p2Points: p2Kills * type.score
      };
    });
  }

  function createStageResultSummary(players, enemyTypes) {
    const participants = players || [];
    const p1 = participants[0] || emptyResultPlayer(1, enemyTypes.length);
    const p2 = participants[1] || emptyResultPlayer(2, enemyTypes.length);
    const rows = createStageResultRows(p1, p2, enemyTypes);
    const p1EnemyPoints = rows.reduce((sum, row) => sum + row.p1Points, 0);
    const p2EnemyPoints = rows.reduce((sum, row) => sum + row.p2Points, 0);
    return {
      p1,
      p2,
      rows,
      p1EnemyPoints,
      p2EnemyPoints,
      p1BonusPoints: Math.max(0, (p1.stagePoints || 0) - p1EnemyPoints),
      p2BonusPoints: Math.max(0, (p2.stagePoints || 0) - p2EnemyPoints),
      p1StagePoints: p1.stagePoints || 0,
      p2StagePoints: p2.stagePoints || 0
    };
  }

  function selectStageClearBonusRecipients(players, bonus) {
    if (!bonus.points) return [];
    if (bonus.twoPlayerOnly && players.length < 2) return [];
    const presentPlayers = players.filter(Boolean);
    if (!presentPlayers.length) return [];
    const counts = presentPlayers.map((player) => ({
      player,
      count: player.stageKills.reduce((sum, value) => sum + value, 0)
    }));
    const maxCount = Math.max(...counts.map((entry) => entry.count));
    if (maxCount <= 0) return [];
    const leaders = counts.filter((entry) => entry.count === maxCount).map((entry) => entry.player);
    if (bonus.requireStrictLead && leaders.length !== 1) return [];
    return leaders.filter((player) => player.lives > 0);
  }

  /** Builds the original result-table count timeline, including each row's final empty loop. */
  function createStageResultPresentation(players, enemyTypes, elapsed, bonusAwarded) {
    const result = createStageResultSummary(players, enemyTypes);
    const frame = Math.max(0, Math.floor(elapsed));
    const countStep = STAGE_RESULT_TIMING.countUpdate + STAGE_RESULT_TIMING.countHold;
    let cursor = STAGE_RESULT_TIMING.initialWait;
    const rows = result.rows.map((row, index) => {
      const steps = Math.max(row.p1Kills, row.p2Kills);
      const firstCountFrame = cursor + STAGE_RESULT_TIMING.rowSetup + STAGE_RESULT_TIMING.countUpdate;
      const countedSteps = steps <= 0 || frame < firstCountFrame
        ? 0
        : clamp(Math.floor((frame - firstCountFrame) / countStep) + 1, 0, steps);
      const visible = {
        ...row,
        firstCountFrame,
        countStep,
        p1VisibleKills: Math.min(row.p1Kills, countedSteps),
        p2VisibleKills: Math.min(row.p2Kills, countedSteps)
      };
      visible.p1VisiblePoints = visible.p1VisibleKills * row.score;
      visible.p2VisiblePoints = visible.p2VisibleKills * row.score;
      cursor += STAGE_RESULT_TIMING.rowSetup + (steps + 1) * countStep;
      if (index < result.rows.length - 1) cursor += STAGE_RESULT_TIMING.betweenRows;
      return visible;
    });
    const totalsRevealFrame = cursor + STAGE_RESULT_TIMING.beforeTotals;
    const bonusRevealFrame = totalsRevealFrame + STAGE_RESULT_TIMING.beforeBonus;
    const endFrame = bonusRevealFrame + STAGE_RESULT_TIMING.finalHold;
    return {
      result,
      rows,
      frame,
      totalsRevealFrame,
      bonusRevealFrame,
      endFrame,
      showTotals: frame >= totalsRevealFrame,
      showBonus: frame >= bonusRevealFrame || Boolean(bonusAwarded)
    };
  }

  function stageResultVisibleKillCount(presentation) {
    return presentation.rows.reduce(
      (sum, row) => sum + row.p1VisibleKills + row.p2VisibleKills,
      0
    );
  }

  return Object.freeze({
    STAGE_RESULT_TIMING,
    createStageResultPresentation,
    createStageResultRows,
    createStageResultSummary,
    selectStageClearBonusRecipients,
    stageKillCount,
    stageResultVisibleKillCount
  });
});
