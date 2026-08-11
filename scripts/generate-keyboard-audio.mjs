import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const outputDirectory = resolve('src/assets/audio/keyboard');
const defaultSource = resolve(outputDirectory, 'yzaak-keyboard-sound-satisfying-304411.mp3');
const sourcePath = resolve(process.env.KEYBOARD_AUDIO_SOURCE ?? defaultSource);
const expectedSourceSha256 = 'bdfa594696dea0570ad6771fd5b7c4a9fd81e173ec38690ff56fb9c5e1f00707';
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'portfolio-keyboard-audio-'));

/**
 * @typedef {object} SampleDefinition
 * @property {string} name
 * @property {number} start
 * @property {number} duration
 * @property {number} gainDb
 * @property {number} highpass
 * @property {number} lowpass
 * @property {number} fadeOut
 * @property {number} [eqFrequency]
 * @property {number} [eqGainDb]
 * @property {number} [pitchRate]
 */

/** @type {SampleDefinition[]} */
const samples = [
  { name: 'key-01', start: .825, duration: .16, gainDb: 3.5, highpass: 55, lowpass: 11_000, fadeOut: .04 },
  { name: 'key-02', start: 2.315, duration: .16, gainDb: 6, highpass: 55, lowpass: 11_000, fadeOut: .04 },
  { name: 'key-03', start: 6.18, duration: .16, gainDb: 1.5, highpass: 55, lowpass: 11_000, fadeOut: .04 },
  { name: 'key-04', start: 8.435, duration: .16, gainDb: 4, highpass: 55, lowpass: 11_000, fadeOut: .04 },
  { name: 'space', start: 9.59, duration: .2, gainDb: 0, highpass: 45, lowpass: 8_500, fadeOut: .05, eqFrequency: 500, eqGainDb: 3 },
  { name: 'enter', start: 17.97, duration: .22, gainDb: 4.5, highpass: 40, lowpass: 7_000, fadeOut: .05, eqFrequency: 360, eqGainDb: 4, pitchRate: 44_000 },
];

/** @param {string} message */
function fail(message) {
  throw new Error(`${message}\nSee src/assets/audio/keyboard/PROVENANCE.md for source setup.`);
}

if (!existsSync(sourcePath)) {
  fail(`Missing local keyboard recording: ${sourcePath}`);
}

const sourceSha256 = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
if (sourceSha256 !== expectedSourceSha256) {
  fail(`Keyboard recording checksum mismatch. Expected ${expectedSourceSha256}, received ${sourceSha256}.`);
}

/** @param {SampleDefinition} definition */
function createFilter(definition) {
  const filters = [
    'pan=mono|c0=.5*c0+.5*c1',
    `atrim=start=${definition.start}:duration=${definition.duration}`,
    'asetpts=PTS-STARTPTS',
    `highpass=f=${definition.highpass}`,
    `lowpass=f=${definition.lowpass}`,
  ];

  if (definition.eqFrequency && definition.eqGainDb) {
    filters.push(`equalizer=f=${definition.eqFrequency}:t=q:w=1:g=${definition.eqGainDb}`);
  }
  if (definition.pitchRate) {
    filters.push('aresample=48000', `asetrate=${definition.pitchRate}`, 'aresample=48000');
  }

  filters.push(
    `volume=${definition.gainDb}dB`,
    'afade=t=in:st=0:d=0.003',
    `afade=t=out:st=${definition.duration - definition.fadeOut}:d=${definition.fadeOut}`,
  );
  return filters.join(',');
}

mkdirSync(outputDirectory, { recursive: true });

try {
  for (const definition of samples) {
    const temporaryOutput = join(temporaryDirectory, `${definition.name}.webm`);
    const result = spawnSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', sourcePath,
      '-af', createFilter(definition),
      '-ac', '1', '-ar', '48000', '-c:a', 'libopus', '-b:a', '24k', '-application', 'audio',
      '-fflags', '+bitexact', '-flags:a', '+bitexact', '-map_metadata', '-1',
      temporaryOutput,
    ], { stdio: 'inherit' });
    if (result.status !== 0) fail(`ffmpeg failed while creating ${definition.name}.webm`);
  }

  for (const definition of samples) {
    renameSync(
      join(temporaryDirectory, `${definition.name}.webm`),
      join(outputDirectory, `${definition.name}.webm`),
    );
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log(`Extracted ${samples.length} keyboard samples from verified local source ${basename(sourcePath)}.`);
