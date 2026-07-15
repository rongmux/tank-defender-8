const assert = require("assert").strict;
const {
  DEFAULT_PLAYER_UPGRADE_RULES,
  clonePlayerUpgradeRules,
  normalizePlayerUpgradeRules
} = require("../../src/config/player-upgrades");

assert.deepEqual(DEFAULT_PLAYER_UPGRADE_RULES, [
  { level: 0, maxBullets: 1, bulletSpeed: 2, wallPower: 1, reload: 1 },
  { level: 1, maxBullets: 1, bulletSpeed: 4, wallPower: 1, reload: 1 },
  { level: 2, maxBullets: 2, bulletSpeed: 4, wallPower: 1, reload: 1 },
  { level: 3, maxBullets: 2, bulletSpeed: 4, wallPower: 3, reload: 1 }
]);
assert(Object.isFrozen(DEFAULT_PLAYER_UPGRADE_RULES));
assert(DEFAULT_PLAYER_UPGRADE_RULES.every(Object.isFrozen));

const clone = clonePlayerUpgradeRules(DEFAULT_PLAYER_UPGRADE_RULES);
clone[0].maxBullets = 4;
assert.equal(DEFAULT_PLAYER_UPGRADE_RULES[0].maxBullets, 1);

const defaults = normalizePlayerUpgradeRules();
assert.deepEqual(defaults, clonePlayerUpgradeRules(DEFAULT_PLAYER_UPGRADE_RULES));
defaults[3].wallPower = 1;
assert.equal(normalizePlayerUpgradeRules()[3].wallPower, 3);

const partial = clonePlayerUpgradeRules(DEFAULT_PLAYER_UPGRADE_RULES);
partial[0] = { level: 99, maxBullets: "2", bulletSpeed: "2.75", reload: "21" };
assert.deepEqual(normalizePlayerUpgradeRules(partial)[0], {
  level: 0,
  maxBullets: 2,
  bulletSpeed: 2.75,
  wallPower: 1,
  reload: 21
});

assert.throws(() => normalizePlayerUpgradeRules([]), /must contain exactly 4 entries/);
assert.throws(() => normalizePlayerUpgradeRules([null, {}, {}, {}]), /playerUpgradeRules\[0\] must be an object/);
const invalidCases = [
  ["maxBullets", 0, /maxBullets must be an integer from 1 to 4/],
  ["bulletSpeed", 7, /bulletSpeed must be a number from 0.1 to 6/],
  ["wallPower", 4, /wallPower must be an integer from 1 to 3/],
  ["reload", 0, /reload must be an integer from 1 to 600/]
];
for (const [key, value, message] of invalidCases) {
  const rules = clonePlayerUpgradeRules(DEFAULT_PLAYER_UPGRADE_RULES);
  rules[0] = { ...rules[0], [key]: value };
  assert.throws(() => normalizePlayerUpgradeRules(rules), message);
}

console.log("player-upgrades unit test passed");
