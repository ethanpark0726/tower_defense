import assert from 'node:assert/strict';
import {
  DIFFICULTIES,
  TOTAL_WAVES,
  getEnemyStatsForWave,
  getWaveComposition
} from '../src/gameStore.js';

assert.equal(TOTAL_WAVES, 20, 'Tooth Guardians should run for 20 waves.');

assert.deepEqual(getWaveComposition(21), { normal: 0, fast: 0, boss: 0, total: 0 });

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

const normalSnack = getEnemyStatsForWave(1, 'normal', 'normal');
const challengeSnack = getEnemyStatsForWave(1, 'normal', 'challenge');

assert.ok(challengeSnack.hp > normalSnack.hp, 'Challenge snacks should have more HP than Normal snacks.');
assert.ok(challengeSnack.speed > normalSnack.speed, 'Challenge snacks should move faster than Normal snacks.');
assert.ok(challengeSnack.reward < normalSnack.reward, 'Challenge snacks should pay fewer Smile Coins than Normal snacks.');

console.log('Game rule checks passed.');
