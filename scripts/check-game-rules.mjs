import assert from 'node:assert/strict';
import {
  DIFFICULTIES,
  TOTAL_WAVES,
  getBoardRouteWave,
  getEnemyMoveSpeed,
  getEnemyStatsForWave,
  getRouteForWave,
  isCellOnPath,
  ROUTE_LAYOUTS,
  TOWER_TYPES,
  getWaveComposition
} from '../src/gameStore.js';

assert.equal(TOTAL_WAVES, 20, 'Tooth Guardians should run for 20 waves.');

assert.deepEqual(getWaveComposition(21), { normal: 0, fast: 0, boss: 0, total: 0 });

assert.equal(ROUTE_LAYOUTS.length, 2, 'Tooth Guardians should use one early route and one late route.');
assert.deepEqual(getRouteForWave(1), getRouteForWave(10), 'Waves 1 through 10 should keep the same route.');
assert.notDeepEqual(getRouteForWave(10), getRouteForWave(11), 'Wave 11 should introduce the late-game route.');
assert.deepEqual(getRouteForWave(11), getRouteForWave(20), 'Waves 11 through 20 should keep the late-game route.');
assert.deepEqual(getRouteForWave(getBoardRouteWave(1, false)), getRouteForWave(1), 'The board should keep the early route while preparing early waves.');
assert.equal(getBoardRouteWave(1, true), 1, 'The board should keep the active route during a wave.');
assert.equal(getBoardRouteWave(10, false), 11, 'The board should preview the late route after Wave 10.');
assert.ok(isCellOnPath(-3, 3, 1), 'Wave 1 should block the visible route centerline.');
assert.equal(isCellOnPath(-4, 4, 1), false, 'Wave 1 should allow the empty tongue tile beside the route.');
assert.equal(isCellOnPath(8, -8, 1), false, 'Wave 1 should allow an off-route tower cell.');
assert.equal(isCellOnPath(-8, -6, 1), false, 'Wave 1 should allow a tile that only belongs to a future route.');

const wave10 = getWaveComposition(10);
const wave11 = getWaveComposition(11);
const wave12 = getWaveComposition(12);
const wave20 = getWaveComposition(20);

assert.ok(wave11.total > wave10.total, 'Wave 11 should extend the pressure after the old finale.');
assert.equal(wave12.boss, 1, 'Wave 12 should introduce an extra mid-game Jelly King.');
assert.equal(wave20.boss, 4, 'Wave 20 should be a real final Jelly King rush.');
assert.ok(wave20.total > wave10.total, 'Wave 20 should be bigger than the old final wave.');

assert.ok(DIFFICULTIES.challenge.startingGold <= 250, 'Challenge should start with fewer Smile Coins.');
assert.ok(DIFFICULTIES.challenge.startingLives <= 12, 'Challenge should start with lower Tooth Health.');
assert.ok(DIFFICULTIES.challenge.spawnDelay <= 0.6, 'Challenge snacks should spawn closer together.');

assert.equal(TOWER_TYPES.tomato.name, 'Tomato Splash', 'Tomato Splash should be available as a defender.');
assert.equal(TOWER_TYPES.tomato.attackStyle, 'ketchup', 'Tomato Splash should spray slowing ketchup.');
assert.ok(TOWER_TYPES.tomato.cost > TOWER_TYPES.laser.cost, 'Tomato Splash should cost more than Carrot Shooter.');
assert.ok(TOWER_TYPES.tomato.cost < TOWER_TYPES.cannon.cost, 'Tomato Splash should be cheaper than Broccoli Bomber.');

const ketchupTarget = { speed: 4, slowMultiplier: 0.75, slowUntil: 2_000 };
assert.equal(getEnemyMoveSpeed(ketchupTarget, 1_500), 3, 'Fresh ketchup should slow a snack by 25%.');
assert.equal(getEnemyMoveSpeed(ketchupTarget, 2_000), 4, 'A snack should recover when the ketchup slow expires.');

const normalSnack = getEnemyStatsForWave(1, 'normal', 'normal');
const challengeSnack = getEnemyStatsForWave(1, 'normal', 'challenge');

assert.ok(challengeSnack.hp > normalSnack.hp, 'Challenge snacks should have more HP than Normal snacks.');
assert.ok(challengeSnack.speed > normalSnack.speed, 'Challenge snacks should move faster than Normal snacks.');
assert.ok(challengeSnack.reward < normalSnack.reward, 'Challenge snacks should pay fewer Smile Coins than Normal snacks.');

console.log('Game rule checks passed.');
