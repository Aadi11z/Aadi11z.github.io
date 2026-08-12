import assert from 'node:assert/strict';
import { KEYBOARD_BOUNDS, KEYBOARD_LAYOUT, KEYBOARD_NEIGHBORS } from '../src/data/keyboard-layout.ts';
import { INTRO_NAME, INTRO_SEQUENCE, INTRO_TIMING } from '../src/data/intro-sequence.ts';
import { profile } from '../src/data/profile.ts';
import { shouldAutoEnterIntro } from '../src/scripts/intro/device-policy.ts';
import { classifyIntroVisit } from '../src/scripts/intro/visit-policy.ts';

assert.equal(KEYBOARD_LAYOUT.length, 67, 'The compact keyboard must contain exactly 67 physical keys.');
assert.equal(KEYBOARD_BOUNDS.keyCount, 67, 'Keyboard bounds must expose the physical key count.');
assert.equal(KEYBOARD_BOUNDS.rowCount, 5, 'The compact keyboard must contain exactly five rows.');

const codes = KEYBOARD_LAYOUT.map((key) => key.code);
const codeSet = new Set(codes);
assert.equal(codeSet.size, KEYBOARD_LAYOUT.length, 'Every physical key code must be unique.');
assert.deepEqual([...new Set(KEYBOARD_LAYOUT.map((key) => key.row))], [0, 1, 2, 3, 4], 'Keyboard rows must be contiguous.');

/** @type {Array<(typeof KEYBOARD_LAYOUT)[number]['code']>} */
const requiredCodes = [
  'Escape',
  'Tab',
  'CapsLock',
  'Backspace',
  'ShiftLeft',
  'ShiftRight',
  'Space',
  'Enter',
  'KeyA',
  'KeyB',
  'KeyD',
  'KeyG',
  'KeyH',
  'KeyI',
  'KeyN',
  'KeyR',
  'KeyT',
  'KeyY',
];
for (const code of requiredCodes) assert(codeSet.has(code), `Keyboard layout is missing ${code}.`);

for (const key of KEYBOARD_LAYOUT) {
  for (const [label, value] of Object.entries({
    x: key.x,
    y: key.y,
    width: key.width,
    height: key.height,
    xPercent: key.xPercent,
    yPercent: key.yPercent,
    widthPercent: key.widthPercent,
    heightPercent: key.heightPercent,
    hue: key.hue,
  })) {
    assert(Number.isFinite(value), `${key.code} has a non-finite ${label}.`);
  }

  assert(key.x >= 0 && key.y >= 0, `${key.code} must start within the keyboard bounds.`);
  assert(key.width > 0 && key.height > 0, `${key.code} must have positive geometry.`);
  assert(key.x + key.width <= KEYBOARD_BOUNDS.width + Number.EPSILON, `${key.code} exceeds the keyboard width.`);
  assert(key.y + key.height <= KEYBOARD_BOUNDS.height + Number.EPSILON, `${key.code} exceeds the keyboard height.`);
  assert(key.xPercent >= 0 && key.yPercent >= 0, `${key.code} has a negative percentage position.`);
  assert(key.xPercent + key.widthPercent <= 100.0001, `${key.code} exceeds percentage width bounds.`);
  assert(key.yPercent + key.heightPercent <= 100.0001, `${key.code} exceeds percentage height bounds.`);
  assert(key.hue >= 190 && key.hue <= 415, `${key.code} leaves the intended atmospheric RGB spectrum.`);

  assert.equal(new Set(key.neighbors).size, key.neighbors.length, `${key.code} has duplicate neighbors.`);
  assert(!key.neighbors.includes(key.code), `${key.code} cannot neighbor itself.`);
  for (const neighbor of key.neighbors) {
    assert(codeSet.has(neighbor), `${key.code} references unknown neighbor ${neighbor}.`);
    assert(KEYBOARD_NEIGHBORS[neighbor].includes(key.code), `${key.code}/${neighbor} adjacency must be symmetric.`);
  }
}

for (const row of [0, 1, 2, 3, 4]) {
  const rowKeys = KEYBOARD_LAYOUT.filter((key) => key.row === row).sort((a, b) => a.x - b.x);
  for (let index = 1; index < rowKeys.length; index += 1) {
    const previous = rowKeys[index - 1];
    const current = rowKeys[index];
    assert(previous.x + previous.width < current.x, `${previous.code} overlaps ${current.code}.`);
  }
}

/** @param {(typeof KEYBOARD_LAYOUT)[number]['code']} code */
const widthOf = (code) => KEYBOARD_LAYOUT.find((key) => key.code === code)?.width ?? 0;
const normalKeyWidth = widthOf('KeyA');
/** @type {Array<(typeof KEYBOARD_LAYOUT)[number]['code']>} */
const wideCodes = ['Tab', 'CapsLock', 'ShiftLeft', 'ShiftRight', 'Backspace', 'Enter', 'Space'];
for (const wideCode of wideCodes) {
  assert(widthOf(wideCode) > normalKeyWidth, `${wideCode} must use a realistic wider keycap.`);
}
assert(KEYBOARD_BOUNDS.chassisWidth > KEYBOARD_BOUNDS.width, 'The chassis must extend beyond the key bed.');
assert(KEYBOARD_BOUNDS.chassisHeight > KEYBOARD_BOUNDS.height, 'The chassis must extend beyond the key bed.');

assert.equal(INTRO_NAME, profile.name, 'The intro name must come from the canonical profile data.');
assert.equal(INTRO_SEQUENCE.length, 17, 'The sequence must contain one event per typed character.');
assert.equal(INTRO_SEQUENCE.map((step) => step.character).join(''), INTRO_NAME, 'The physical sequence must drive the exact visible name.');

const shiftedSteps = INTRO_SEQUENCE.filter((step) => step.modifiers[0] === 'ShiftLeft');
assert.equal(shiftedSteps.length, 2, 'Exactly two character events must use Shift.');
assert.deepEqual(shiftedSteps.map((step) => step.character), ['A', 'B'], 'Shift must chord with capital A and B.');
assert(shiftedSteps.every((step) => step.modifiers.length === 1), 'Capital chords must use only the left Shift modifier.');

const spaceSteps = INTRO_SEQUENCE.filter((step) => step.key === 'Space');
assert.equal(spaceSteps.length, 1, 'The name sequence must press Space exactly once.');
assert.equal(spaceSteps[0].character, ' ', 'The Space press must emit the name separator.');
assert.equal(spaceSteps[0].sound, 'space', 'The Space press must request its distinct sound.');

for (const step of INTRO_SEQUENCE) {
  assert(codeSet.has(step.key), `Typing event references missing physical key ${step.key}.`);
  for (const modifier of step.modifiers) assert(codeSet.has(modifier), `Typing event references missing modifier ${modifier}.`);
  assert(step.gapMs >= 65 && step.gapMs <= 120, `${step.character} gap must stay within 65-120ms.`);
  assert(step.holdMs >= 45 && step.holdMs <= 75, `${step.character} hold must stay within 45-75ms.`);
  if (step.key !== 'Space') assert.equal(step.sound, 'normal', `${step.key} must use the normal-key sound pool.`);
}

assert(INTRO_TIMING.bottomOutMs > 0, 'A key must reach bottom-out before its character appears.');
assert(INTRO_TIMING.autoStartMs >= 0 && INTRO_TIMING.autoStartMs <= 150, 'Automatic typing must begin promptly after first paint.');
assert(INTRO_TIMING.enterHoldMs >= 45 && INTRO_TIMING.enterHoldMs <= 100, 'Enter must have a perceptible but brief hold.');
assert(INTRO_TIMING.transitionMs <= 500, 'The final transition must remain concise.');

assert.equal(shouldAutoEnterIntro({
  coarsePrimaryPointer: false,
  anyHoverAvailable: true,
}), false, 'A conventional laptop must wait for Enter or a scene click.');
assert.equal(shouldAutoEnterIntro({
  coarsePrimaryPointer: true,
  anyHoverAvailable: false,
}), true, 'A touch-first phone must press Enter automatically.');
assert.equal(shouldAutoEnterIntro({
  coarsePrimaryPointer: true,
  anyHoverAvailable: true,
}), false, 'A hybrid device with a hover pointer must retain the explicit Enter interaction.');
assert.equal(shouldAutoEnterIntro({
  coarsePrimaryPointer: false,
  anyHoverAvailable: false,
}), false, 'Unknown pointer capability must not assume touch-only behavior.');

const visit = (overrides = {}) => classifyIntroVisit({
  designMode: false,
  seen: true,
  explicitSkip: false,
  deepLink: false,
  internalHandoff: false,
  navigationType: 'navigate',
  historyRestoreWasNotRestored: false,
  ...overrides,
});
assert.equal(visit({ seen: false }), 'first', 'A fresh tab must play the intro.');
assert.equal(visit({ navigationType: 'reload' }), 'returning', 'A refresh must not replay the intro.');
assert.equal(visit({ internalHandoff: true }), 'returning', 'Known same-tab navigation must not replay the intro.');
assert.equal(visit({ navigationType: 'back_forward', historyRestoreWasNotRestored: true }), 'returning', 'Ordinary non-BFCache history traversal must not replay.');
assert.equal(visit({ navigationType: 'back_forward', historyRestoreWasNotRestored: false }), 'first', 'A browser-restored page session should replay when distinguishable.');
assert.equal(visit({ explicitSkip: true }), 'returning', 'Explicit skip must override replay signals.');
assert.equal(visit({ designMode: true }), 'first', 'Design mode must always expose the intro.');

console.log(`Intro model checks passed: ${KEYBOARD_LAYOUT.length} unique keys across ${KEYBOARD_BOUNDS.rowCount} rows and ${INTRO_SEQUENCE.length} synchronized typing events verified.`);
