import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  calculateStars,
  getNoiseRadius,
  updateSanity,
  updateStamina,
  verifyPianoPuzzle,
  evaluateGhostDetection,
  getDifficultyLives,
  checkRiddleAnswer,
  shouldAwakenGhost,
  checkCircleBoxCollision,
  CHARACTERS,
  calculateFurnitureBuffs,
  DEFAULT_FURNITURE_SETUP,
  resolveStoryChoice,
  FURNITURE_CATALOG,
  calculateProximityThreat,
  calculateStruggleTapGain,
  evaluateDoorAlignment,
} from './rules.ts';

test('noise radius increases with high-impact actions and accounts for carpet stealth', () => {
  const crouchRadius = getNoiseRadius('CROUCH');
  const walkRadius = getNoiseRadius('WALK');
  const runRadius = getNoiseRadius('RUN');
  const slamRadius = getNoiseRadius('SLAM_DOOR');

  assert.equal(crouchRadius, 2.0);
  assert.equal(walkRadius, 6.0);
  assert.equal(runRadius, 14.0);
  assert.equal(slamRadius, 20.0);
  assert.ok(runRadius > walkRadius);
  assert.ok(slamRadius > runRadius);

  // With carpet stealth buff (e.g. 2.5m reduction)
  const muffledWalk = getNoiseRadius('WALK', 2.5);
  assert.equal(muffledWalk, 3.5);
});

test('furniture setup computes active aggregate gameplay buffs', () => {
  const buffs = calculateFurnitureBuffs(DEFAULT_FURNITURE_SETUP);
  assert.ok(buffs.staminaRecoveryBonus >= 0.25);
  assert.ok(buffs.batteryEfficiency >= 0.30);
  assert.ok(buffs.ghostDetectionReduction >= 3.0);
  assert.ok(buffs.sanityDrainReduction >= 0.20);
});

test('furniture catalog contains all 5 distinct categories with unique items', () => {
  const categories = new Set(FURNITURE_CATALOG.map((f) => f.category));
  assert.ok(categories.has('BED'));
  assert.ok(categories.has('ALTAR'));
  assert.ok(categories.has('LAMP'));
  assert.ok(categories.has('WALL_RELIC'));
  assert.ok(categories.has('CARPET'));
  assert.ok(FURNITURE_CATALOG.length >= 15);
});

test('interactive story choice resolves consequences accurately', () => {
  // Test pacify choice
  const pacifyRes = resolveStoryChoice({
    id: 'c1',
    text: 'Bicara baik-baik dengan arwah',
    response: 'Arwah Mbah Karto terdiam dan meredam hawa amarahnya...',
    consequenceType: 'GHOST_PACIFY',
    consequenceDesc: 'Menenangkan arwah',
  });
  assert.equal(pacifyRes.pacifyGhost, true);
  assert.ok(pacifyRes.sanityChange > 0);

  // Test enrage high risk high reward
  const enrageRes = resolveStoryChoice({
    id: 'c2',
    text: 'Tantang arwah dengan berani',
    response: 'Arwah berteriak murka memanggil pocong!',
    consequenceType: 'GHOST_ENRAGE',
    consequenceValue: 500,
    consequenceDesc: 'Memicu amarah arwah',
  });
  assert.equal(enrageRes.enrageGhost, true);
  assert.equal(enrageRes.scoreBonus, 500);
});

test('score calculation includes camera multipliers, stealth bonuses, and story decision points', () => {
  // First person multiplier = 1.5
  const fpScore = calculateScore(1000, 180, 240, 3, 3, 0, 1.5, 300);
  // Top down multiplier = 1.0
  const tdScore = calculateScore(1000, 180, 240, 3, 3, 0, 1.0, 300);
  assert.ok(fpScore > tdScore);
  assert.equal(fpScore, Math.round(tdScore * 1.5));
});

test('level star rating rewards flawless execution', () => {
  assert.equal(calculateStars(true, 3, 0, 200, 240), 3);
  assert.equal(calculateStars(true, 2, 1, 200, 240), 2);
  assert.equal(calculateStars(true, 1, 2, 200, 240), 1);
  assert.equal(calculateStars(false, 3, 0, 200, 240), 0);
});

test('sanity drains in darkness and heals near candle with furniture drain reduction', () => {
  const initial = 80;
  // In darkness without buff
  const drainedNormal = updateSanity(initial, true, 20, false, false, 2.0, 1.0, 0.0);
  // In darkness with 20% reduction buff
  const drainedBuffed = updateSanity(initial, true, 20, false, false, 2.0, 1.0, 0.20);
  assert.ok(drainedNormal < initial);
  assert.ok(drainedBuffed > drainedNormal); // drained less!
});

test('stamina consumes when running and regenerates faster with furniture buff', () => {
  const max = 100;
  const running = updateStamina(max, true, false, false, 1.0, max);
  assert.ok(running < max);
  const crouchRecover = updateStamina(40, false, true, false, 1.0, max, 0.25);
  assert.ok(crouchRecover > 40);
});

test('piano puzzle correctly validates note order', () => {
  const target = ['C4', 'E4', 'G4', 'B4'];
  assert.equal(verifyPianoPuzzle(['C4', 'E4', 'G4', 'B4'], target), true);
  assert.equal(verifyPianoPuzzle(['C4', 'G4', 'E4', 'B4'], target), false);
  assert.equal(verifyPianoPuzzle(['C4', 'E4'], target), false);
});

test('suster ngesot is blind but detects loud sound with stealth offset', () => {
  const runningRes = evaluateGhostDetection('SUSTER_NGESOT', 8.0, 5.0, true, true, true, false, 99, 0);
  assert.equal(runningRes.detected, true);
  assert.equal(runningRes.reason, 'SOUND');

  // With strong stealth bonus offset
  const stealthRes = evaluateGhostDetection('SUSTER_NGESOT', 8.0, 5.0, true, true, true, false, 99, 10);
  assert.equal(stealthRes.detected, false);
});

test('noni belanda freezes when hit by flashlight beam', () => {
  const res = evaluateGhostDetection('NONI_BELANDA', 6.0, 0.0, false, true, true, false, 99);
  assert.equal(res.detected, true);
  assert.equal(res.frozen, true);
});

test('difficulty lives scale correctly and include furniture bonus', () => {
  assert.equal(getDifficultyLives('MUDAH'), 5);
  assert.equal(getDifficultyLives('NORMAL'), 3);
  assert.equal(getDifficultyLives('MIMPI_BURUK'), 1);
  assert.equal(getDifficultyLives('NORMAL', 1), 4); // +1 from Topeng Klana
});

test('characters have unique distinct perks, skills, and outfit descriptions', () => {
  assert.equal(CHARACTERS.raka.speedMult, 1.10);
  assert.equal(CHARACTERS.sari.sanityRecoveryMult, 2.0);
  assert.equal(CHARACTERS.joko.unlockedByDefault, false);
  assert.equal(CHARACTERS.dewi.requiredLevelToUnlock, 4);
  assert.ok(CHARACTERS.raka.outfitDesc.length > 10);
  assert.ok(CHARACTERS.sari.outfitDesc.length > 10);
});

test('riddle answer checks correctly against correct index', () => {
  assert.equal(checkRiddleAnswer(0, 0), true);
  assert.equal(checkRiddleAnswer(0, 1), false);
  assert.equal(checkRiddleAnswer(2, 2), true);
});

test('ghost remains dormant until player discovers clues, keys, or interacts with story', () => {
  assert.equal(shouldAwakenGhost(0, 0, 0, 0), false);
  assert.equal(shouldAwakenGhost(1, 0, 0, 0), true);
  assert.equal(shouldAwakenGhost(0, 1, 0, 0), true);
  assert.equal(shouldAwakenGhost(0, 0, 0, 1), true);
});

test('circle box collision prevents clipping into walls and closed doors', () => {
  assert.equal(checkCircleBoxCollision(4.5, 4.5, 0.4, 4, 6, 4, 6), true);
  assert.equal(checkCircleBoxCollision(3.7, 5.0, 0.4, 4, 6, 4, 6), true);
  assert.equal(checkCircleBoxCollision(2.0, 5.0, 0.4, 4, 6, 4, 6), false);
});

test('proximity threat levels escalate correctly and trigger flashlight flicker warnings', () => {
  const far = calculateProximityThreat(20.0, false);
  assert.equal(far.threatLevel, 'CALM');
  assert.equal(far.warningText, null);
  assert.equal(far.shouldFlickerFlashlight, false);

  const tense = calculateProximityThreat(9.0, false);
  assert.equal(tense.threatLevel, 'TENSE');
  assert.ok(tense.warningText !== null);
  assert.equal(tense.shouldFlickerFlashlight, false);

  const danger = calculateProximityThreat(4.0, false);
  assert.equal(danger.threatLevel, 'DANGER');
  assert.equal(danger.shouldFlickerFlashlight, true);

  const chase = calculateProximityThreat(12.0, true);
  assert.equal(chase.threatLevel, 'CHASE');
  assert.equal(chase.shouldFlickerFlashlight, true);
});

test('struggle tap progress rewards character perks and flashlight focus', () => {
  const rakaBase = calculateStruggleTapGain('raka', false);
  const sariBase = calculateStruggleTapGain('sari', false);
  const rakaFlashlight = calculateStruggleTapGain('raka', true);

  assert.ok(rakaBase > sariBase);
  assert.ok(rakaFlashlight > rakaBase);
  assert.ok(rakaBase >= 20.0); // 4-5 taps max
});

test('door alignment detects horizontal and vertical doorway spans from grid', () => {
  const sampleGrid = [
    'WWWWWW',
    'W.W..W',
    'W.D..W',
    'W.W..W',
    'WWWDWW',
    'WWWWWW',
  ];

  // Door at row 2, col 2 is bordered North (r1,c2: 'W') and South (r3,c2: 'W')
  const verticalDoor = evaluateDoorAlignment(sampleGrid, 2, 2);
  assert.equal(verticalDoor.isVertical, true);
  assert.equal(verticalDoor.rotationY, Math.PI / 2);

  // Door at row 4, col 3 is bordered West (r4,c2: 'W') and East (r4,c4: 'W')
  const horizontalDoor = evaluateDoorAlignment(sampleGrid, 4, 3);
  assert.equal(horizontalDoor.isVertical, false);
  assert.equal(horizontalDoor.rotationY, 0);
});

