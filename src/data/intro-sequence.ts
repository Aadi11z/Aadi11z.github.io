import { profile } from './profile.ts';

export const INTRO_NAME = profile.name;

export type IntroLetterKeyCode =
  | 'KeyA'
  | 'KeyB'
  | 'KeyD'
  | 'KeyG'
  | 'KeyH'
  | 'KeyI'
  | 'KeyN'
  | 'KeyR'
  | 'KeyT'
  | 'KeyY';

export type IntroKeyCode = IntroLetterKeyCode | 'Space';
export type IntroModifierCode = 'ShiftLeft';
export type IntroKeystrokeSound = 'normal' | 'space';

export type IntroSequenceStep = Readonly<{
  character: string;
  key: IntroKeyCode;
  modifiers: readonly IntroModifierCode[];
  sound: IntroKeystrokeSound;
  /** Pause after the key is released and before the next chord begins. */
  gapMs: number;
  /** Time the key remains held after it reaches bottom-out. */
  holdMs: number;
}>;

export const INTRO_TIMING = Object.freeze({
  bottomOutMs: 18,
  shiftLeadMs: 14,
  lightingMs: 260,
  settlingMs: 260,
  enterArmedMs: 780,
  enterHoldMs: 75,
  impactSettleMs: 90,
  transitionMs: 280,
});

/**
 * Deliberately authored instead of randomized so the rhythm is repeatable.
 * Gaps stay within 65-120ms and bottom-out holds within 45-75ms.
 */
export const INTRO_SEQUENCE = [
  { character: 'A', key: 'KeyA', modifiers: ['ShiftLeft'], sound: 'normal', gapMs: 92, holdMs: 66 },
  { character: 'a', key: 'KeyA', modifiers: [], sound: 'normal', gapMs: 74, holdMs: 52 },
  { character: 'd', key: 'KeyD', modifiers: [], sound: 'normal', gapMs: 86, holdMs: 58 },
  { character: 'i', key: 'KeyI', modifiers: [], sound: 'normal', gapMs: 68, holdMs: 49 },
  { character: 't', key: 'KeyT', modifiers: [], sound: 'normal', gapMs: 103, holdMs: 61 },
  { character: 'y', key: 'KeyY', modifiers: [], sound: 'normal', gapMs: 77, holdMs: 54 },
  { character: 'a', key: 'KeyA', modifiers: [], sound: 'normal', gapMs: 88, holdMs: 47 },
  { character: ' ', key: 'Space', modifiers: [], sound: 'space', gapMs: 120, holdMs: 75 },
  { character: 'B', key: 'KeyB', modifiers: ['ShiftLeft'], sound: 'normal', gapMs: 96, holdMs: 67 },
  { character: 'h', key: 'KeyH', modifiers: [], sound: 'normal', gapMs: 72, holdMs: 52 },
  { character: 'a', key: 'KeyA', modifiers: [], sound: 'normal', gapMs: 83, holdMs: 48 },
  { character: 't', key: 'KeyT', modifiers: [], sound: 'normal', gapMs: 69, holdMs: 57 },
  { character: 'n', key: 'KeyN', modifiers: [], sound: 'normal', gapMs: 106, holdMs: 63 },
  { character: 'a', key: 'KeyA', modifiers: [], sound: 'normal', gapMs: 78, holdMs: 46 },
  { character: 'g', key: 'KeyG', modifiers: [], sound: 'normal', gapMs: 91, holdMs: 59 },
  { character: 'a', key: 'KeyA', modifiers: [], sound: 'normal', gapMs: 65, holdMs: 45 },
  { character: 'r', key: 'KeyR', modifiers: [], sound: 'normal', gapMs: 98, holdMs: 55 },
] as const satisfies readonly IntroSequenceStep[];
