export {};

const documentRoot = document.documentElement;
const stage = /** @type {HTMLElement} */ (document.querySelector("[data-collision-stage]"));
const whiteout = /** @type {HTMLElement} */ (document.querySelector("[data-whiteout]"));
const playButton = /** @type {HTMLButtonElement} */ (document.querySelector("[data-play-animation]"));
const soundButton = /** @type {HTMLButtonElement} */ (document.querySelector("[data-sound-toggle]"));
const soundLabel = /** @type {HTMLSpanElement} */ (soundButton.querySelector("span"));
const statusMessage = /** @type {HTMLElement} */ (document.querySelector("[data-animation-status]"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let playing = false;
let soundEnabled = true;
/** @type {AudioContext | undefined} */
let audioContext;
/** @type {AudioScheduledSourceNode[]} */
let activeAudioNodes = [];
/** @type {number[]} */
let statusTimers = [];

const IMPACT_DELAY = 2.96;

/**
 * @template {AudioScheduledSourceNode} T
 * @param {T} node
 * @returns {T}
 */
const rememberAudioNode = (node) => {
  activeAudioNodes.push(node);
  return node;
};

const stopAudio = () => {
  activeAudioNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // Nodes that have already ended cannot be stopped again.
    }
  });
  activeAudioNodes = [];
};

/**
 * @param {AudioContext} context
 * @param {number} seconds
 */
const createNoiseBuffer = (context, seconds) => {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * seconds), context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }
  return buffer;
};

/**
 * @param {AudioContext} context
 * @param {AudioNode} destination
 * @param {number} start
 * @param {number} peak
 * @param {number} end
 * @param {number} volume
 */
const connectEnvelope = (context, destination, start, peak, end, volume) => {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, peak);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  gain.connect(destination);
  return gain;
};

const scheduleCollisionAudio = async () => {
  if (!soundEnabled) return;

  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();
  stopAudio();

  const context = audioContext;
  const now = context.currentTime + 0.04;
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  master.gain.value = 0.58;
  compressor.threshold.value = -18;
  compressor.ratio.value = 5;
  master.connect(compressor).connect(context.destination);

  const lightningNoise = rememberAudioNode(context.createBufferSource());
  const lightningFilter = context.createBiquadFilter();
  lightningNoise.buffer = createNoiseBuffer(context, IMPACT_DELAY + 0.35);
  lightningFilter.type = "highpass";
  lightningFilter.frequency.value = 1250;
  lightningNoise.connect(lightningFilter);
  lightningFilter.connect(connectEnvelope(context, master, now, now + 0.28, now + IMPACT_DELAY + 0.18, 0.13));
  lightningNoise.start(now);

  for (let offset = 0.18; offset < IMPACT_DELAY; offset += 0.105) {
    const chirp = rememberAudioNode(context.createOscillator());
    const chirpGain = context.createGain();
    const start = now + offset;
    const frequency = 2100 + Math.random() * 2300;
    chirp.type = "sine";
    chirp.frequency.setValueAtTime(frequency, start);
    chirp.frequency.exponentialRampToValueAtTime(frequency * 0.62, start + 0.045);
    chirpGain.gain.setValueAtTime(0.0001, start);
    chirpGain.gain.exponentialRampToValueAtTime(0.018 + Math.random() * 0.018, start + 0.008);
    chirpGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
    chirp.connect(chirpGain).connect(master);
    chirp.start(start);
    chirp.stop(start + 0.06);
  }

  const rotation = rememberAudioNode(context.createOscillator());
  const rotationGain = connectEnvelope(context, master, now, now + 0.35, now + IMPACT_DELAY + 0.2, 0.075);
  rotation.type = "triangle";
  rotation.frequency.setValueAtTime(82, now);
  rotation.frequency.exponentialRampToValueAtTime(176, now + IMPACT_DELAY);
  rotation.connect(rotationGain);
  rotation.start(now);
  rotation.stop(now + IMPACT_DELAY + 0.22);

  const rotationNoise = rememberAudioNode(context.createBufferSource());
  const rotationFilter = context.createBiquadFilter();
  rotationNoise.buffer = createNoiseBuffer(context, IMPACT_DELAY + 0.35);
  rotationFilter.type = "bandpass";
  rotationFilter.Q.value = 2.4;
  rotationFilter.frequency.setValueAtTime(330, now);
  rotationFilter.frequency.exponentialRampToValueAtTime(920, now + IMPACT_DELAY);
  rotationNoise.connect(rotationFilter);
  rotationFilter.connect(connectEnvelope(context, master, now, now + 0.6, now + IMPACT_DELAY + 0.2, 0.1));
  rotationNoise.start(now);

  const impactAt = now + IMPACT_DELAY;
  const impactNoise = rememberAudioNode(context.createBufferSource());
  const impactFilter = context.createBiquadFilter();
  impactNoise.buffer = createNoiseBuffer(context, 1.5);
  impactFilter.type = "lowpass";
  impactFilter.frequency.setValueAtTime(7500, impactAt);
  impactFilter.frequency.exponentialRampToValueAtTime(380, impactAt + 1.3);
  impactNoise.connect(impactFilter);
  impactFilter.connect(connectEnvelope(context, master, impactAt, impactAt + 0.018, impactAt + 1.45, 0.5));
  impactNoise.start(impactAt);

  const impactSub = rememberAudioNode(context.createOscillator());
  const impactSubGain = connectEnvelope(context, master, impactAt, impactAt + 0.025, impactAt + 1.2, 0.38);
  impactSub.type = "sine";
  impactSub.frequency.setValueAtTime(74, impactAt);
  impactSub.frequency.exponentialRampToValueAtTime(29, impactAt + 1.15);
  impactSub.connect(impactSubGain);
  impactSub.start(impactAt);
  impactSub.stop(impactAt + 1.25);
};

const clearStatusTimers = () => {
  statusTimers.forEach(window.clearTimeout);
  statusTimers = [];
};

const resetSequence = (message = "Animation ready.") => {
  clearStatusTimers();
  stopAudio();
  documentRoot.classList.remove("is-sequence-playing");
  playing = false;
  playButton.disabled = false;
  statusMessage.textContent = message;
};

/** @param {{ withSound?: boolean }} [options] */
const playSequence = (options = {}) => {
  const { withSound = false } = options;
  if (playing) return;

  clearStatusTimers();
  documentRoot.classList.remove("is-sequence-playing");
  void stage.offsetWidth;

  playing = true;
  playButton.disabled = true;
  statusMessage.textContent = "Energy forms are approaching the center.";
  documentRoot.classList.add("is-sequence-playing");
  if (withSound) {
    scheduleCollisionAudio().catch(() => {
      statusMessage.textContent = "The animation is playing without sound because audio could not start.";
    });
  }

  if (!reducedMotion.matches) {
    statusTimers.push(
      window.setTimeout(() => {
        statusMessage.textContent = "The energy forms collide.";
      }, 2960),
      window.setTimeout(() => {
        statusMessage.textContent = "The screen whites out, then returns to the prototype.";
      }, 3450),
    );
  }
};

playButton.addEventListener("click", () => playSequence({ withSound: true }));

soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundLabel.textContent = soundEnabled ? "Sound on" : "Sound off";
  if (!soundEnabled) stopAudio();
});

whiteout.addEventListener("animationend", (event) => {
  if (event.target === whiteout && playing) {
    resetSequence("Animation complete. Replay is available.");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && playing) {
    resetSequence("Animation skipped. Replay is available.");
    playButton.focus();
  }
});

reducedMotion.addEventListener("change", () => {
  if (playing) resetSequence("Motion preference changed. Animation reset.");
});

window.addEventListener("load", () => {
  if (!reducedMotion.matches && new URLSearchParams(window.location.search).get("autoplay") !== "0") {
    window.setTimeout(() => playSequence({ withSound: false }), 650);
  }
});
