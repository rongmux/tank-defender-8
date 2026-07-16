const assert = require("assert").strict;
const {
  addScorePoints,
  awardBonusLives
} = require("../../src/rules/score-rules");

const scorePlayer = { score: 100 };
assert.deepEqual(addScorePoints(scorePlayer, 250), {
  previousScore: 100,
  nextScore: 350
});
assert.equal(scorePlayer.score, 350);

const noCrossing = { lives: 2, nextBonusLifeIndex: 0 };
assert.equal(awardBonusLives(noCrossing, 50, 99, [100, 300]), 0);
assert.deepEqual(noCrossing, { lives: 2, nextBonusLifeIndex: 0 });

const consecutive = { lives: 1, nextBonusLifeIndex: 0 };
assert.equal(awardBonusLives(consecutive, 99, 300, [100, 300]), 2);
assert.deepEqual(consecutive, { lives: 3, nextBonusLifeIndex: 2 });

const duplicates = { lives: 1, nextBonusLifeIndex: 0 };
assert.equal(awardBonusLives(duplicates, 99, 100, [100, 100]), 2);
assert.deepEqual(duplicates, { lives: 3, nextBonusLifeIndex: 2 });

const staleProgress = { lives: 2, nextBonusLifeIndex: 0 };
assert.equal(awardBonusLives(staleProgress, 300, 301, [100, 300, 500]), 0);
assert.deepEqual(staleProgress, { lives: 2, nextBonusLifeIndex: 2 });

const partialProgress = { lives: 4, nextBonusLifeIndex: 1 };
assert.equal(awardBonusLives(partialProgress, 150, 500, [100, 300, 500]), 2);
assert.deepEqual(partialProgress, { lives: 6, nextBonusLifeIndex: 3 });

console.log("score-rules unit test passed");
