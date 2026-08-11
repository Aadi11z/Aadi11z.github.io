import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const sampleRate = 48_000;
const outputDirectory = resolve('src/assets/audio/keyboard');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'portfolio-keyboard-audio-'));

const samples = [
  { name: 'key-01', seed: 0x10a1, duration: .105, bodyFrequency: 910, click: .62, body: .32 },
  { name: 'key-02', seed: 0x20b2, duration: .112, bodyFrequency: 980, click: .58, body: .35 },
  { name: 'key-03', seed: 0x30c3, duration: .101, bodyFrequency: 845, click: .66, body: .3 },
  { name: 'key-04', seed: 0x40d4, duration: .116, bodyFrequency: 1_060, click: .56, body: .37 },
  { name: 'space', seed: 0x50e5, duration: .17, bodyFrequency: 515, click: .44, body: .5 },
  { name: 'enter', seed: 0x60f6, duration: .205, bodyFrequency: 430, click: .5, body: .56 },
];

/** @param {number} seed */
function createNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 0xffffffff) * 2 - 1;
  };
}

/**
 * @param {{ seed: number; duration: number; bodyFrequency: number; click: number; body: number }} definition
 */
function synthesize({ seed, duration, bodyFrequency, click, body }) {
  const frameCount = Math.ceil(sampleRate * duration);
  const pcm = new Float32Array(frameCount);
  const random = createNoise(seed);
  let previousNoise = 0;
  let lowNoise = 0;

  for (let frame = 0; frame < frameCount; frame += 1) {
    const time = frame / sampleRate;
    const noise = random();
    lowNoise += .12 * (noise - lowNoise);
    const highNoise = noise - previousNoise * .82;
    previousNoise = noise;

    const attack = 1 - Math.exp(-time * 1_800);
    const clickEnvelope = attack * Math.exp(-time * 92);
    const bodyEnvelope = attack * Math.exp(-time * 34);
    const clickSignal = highNoise * clickEnvelope * click;
    const bodySignal = (
      Math.sin(2 * Math.PI * bodyFrequency * time)
      + .43 * Math.sin(2 * Math.PI * bodyFrequency * 1.91 * time + .5)
      + .19 * Math.sin(2 * Math.PI * bodyFrequency * 3.08 * time + 1.2)
    ) * bodyEnvelope * body;
    const housing = lowNoise * Math.exp(-time * 28) * .16;

    const returnTime = time - Math.min(.048, duration * .44);
    const returnClick = returnTime > 0
      ? (noise - lowNoise) * Math.exp(-returnTime * 135) * .095
      : 0;
    const fadeOut = Math.min(1, (duration - time) * 180);
    pcm[frame] = Math.tanh((clickSignal + bodySignal + housing + returnClick) * 1.18) * fadeOut;
  }

  return pcm;
}

/** @param {string} file @param {Float32Array} pcm */
function writeWave(file, pcm) {
  const dataSize = pcm.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcm.forEach((sample, index) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32_767), 44 + index * 2));
  writeFileSync(file, buffer);
}

mkdirSync(outputDirectory, { recursive: true });

try {
  for (const definition of samples) {
    const wavePath = join(temporaryDirectory, `${definition.name}.wav`);
    const outputPath = join(outputDirectory, `${definition.name}.webm`);
    writeWave(wavePath, synthesize(definition));
    const result = spawnSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', wavePath,
      '-ac', '1', '-ar', String(sampleRate), '-c:a', 'libopus', '-b:a', '24k', '-application', 'audio', outputPath,
    ], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`ffmpeg failed while creating ${definition.name}.webm`);
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log(`Generated ${samples.length} original keyboard samples in ${outputDirectory}.`);
