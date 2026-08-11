import assert from 'node:assert/strict';
import { resumeAudioContext } from '../src/scripts/intro/audio-context.ts';

/** @type {import('../src/scripts/intro/audio-context.ts').AudioResumeScheduler} */
const scheduler = {
  schedule: (callback, delayMs) => setTimeout(callback, delayMs),
  cancel: (timer) => clearTimeout(/** @type {ReturnType<typeof setTimeout>} */ (timer)),
};

/** @type {{ state: AudioContextState, resumeCalls: number, resume: () => Promise<void> }} */
const runningContext = {
  state: 'running',
  resumeCalls: 0,
  async resume() { this.resumeCalls += 1; },
};
assert.equal(await resumeAudioContext(runningContext, 10, scheduler), true);
assert.equal(runningContext.resumeCalls, 0, 'A running context must not be resumed again.');

/** @type {{ state: AudioContextState, resumeCalls: number, resume: () => Promise<void> }} */
const retryableContext = {
  state: 'suspended',
  resumeCalls: 0,
  async resume() {
    this.resumeCalls += 1;
    if (this.resumeCalls === 1) throw new Error('Browser kept the context suspended.');
    this.state = 'running';
  },
};
assert.equal(await resumeAudioContext(retryableContext, 10, scheduler), false, 'A rejected resume must fail open.');
assert.equal(await resumeAudioContext(retryableContext, 10, scheduler), true, 'A later trusted gesture must be able to retry resume.');
assert.equal(retryableContext.resumeCalls, 2, 'The suspended context must receive a second resume attempt.');

/** @type {{ state: AudioContextState, resume: () => Promise<void> }} */
const stalledContext = {
  state: 'suspended',
  resume: () => new Promise(() => undefined),
};
assert.equal(await resumeAudioContext(stalledContext, 1, scheduler), false, 'A stalled resume must time out.');

console.log('Audio resume checks passed: running, rejected, retry, and timeout states verified.');
