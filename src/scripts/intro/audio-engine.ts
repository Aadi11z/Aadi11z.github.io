import key01Url from '@/assets/audio/keyboard/key-01.webm?url&no-inline';
import key02Url from '@/assets/audio/keyboard/key-02.webm?url&no-inline';
import key03Url from '@/assets/audio/keyboard/key-03.webm?url&no-inline';
import key04Url from '@/assets/audio/keyboard/key-04.webm?url&no-inline';
import spaceUrl from '@/assets/audio/keyboard/space.webm?url&no-inline';
import enterUrl from '@/assets/audio/keyboard/enter.webm?url&no-inline';

export type IntroSoundKind = 'normal' | 'space' | 'enter';

export type IntroAudioEngine = {
  unlock: () => Promise<boolean>;
  play: (kind: IntroSoundKind) => void;
  toggleMuted: () => boolean;
  readonly muted: boolean;
  destroy: () => void;
};

const soundUrls: Record<IntroSoundKind, readonly string[]> = {
  normal: [key01Url, key02Url, key03Url, key04Url],
  space: [spaceUrl],
  enter: [enterUrl],
};

const soundPreferenceKey = 'portfolio-intro-sound-v1';
const maxVoices = 6;

function readMutedPreference(): boolean {
  try {
    return localStorage.getItem(soundPreferenceKey) === 'muted';
  } catch {
    return false;
  }
}

export function createIntroAudioEngine(): IntroAudioEngine {
  let context: AudioContext | undefined;
  let masterGain: GainNode | undefined;
  let unlockPromise: Promise<boolean> | undefined;
  let mutedState = readMutedPreference();
  let destroyed = false;
  const loadController = new AbortController();
  const buffers = new Map<IntroSoundKind, AudioBuffer[]>();
  const voices: AudioBufferSourceNode[] = [];

  const stopVoices = (): void => {
    voices.splice(0).forEach((voice) => {
      try { voice.stop(); } catch { /* The source may already have ended. */ }
      voice.disconnect();
    });
  };

  const load = async (audioContext: AudioContext, url: string): Promise<AudioBuffer> => {
    const response = await fetch(url, { cache: 'force-cache', signal: loadController.signal });
    if (!response.ok) throw new Error(`Keyboard audio request failed: ${response.status}`);
    return audioContext.decodeAudioData(await response.arrayBuffer());
  };

  const unlock = async (): Promise<boolean> => {
    if (destroyed || mutedState) return false;
    if (unlockPromise) return unlockPromise;

    unlockPromise = (async () => {
      try {
        const AudioContextConstructor = window.AudioContext
          ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextConstructor) return false;
        context = new AudioContextConstructor({ latencyHint: 'interactive' });
        masterGain = context.createGain();
        masterGain.gain.value = .28;
        masterGain.connect(context.destination);
        await context.resume();
        if (destroyed) return false;

        await Promise.all((Object.keys(soundUrls) as IntroSoundKind[]).map(async (kind) => {
          const loaded = await Promise.allSettled(soundUrls[kind].map((url) => load(context as AudioContext, url)));
          const decoded = loaded.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
          if (!destroyed && decoded.length) buffers.set(kind, decoded);
        }));
        return !destroyed && context.state === 'running' && buffers.size > 0;
      } catch {
        return false;
      }
    })();

    return unlockPromise;
  };

  const play = (kind: IntroSoundKind): void => {
    if (destroyed || mutedState || !context || !masterGain || context.state !== 'running') return;
    const choices = buffers.get(kind);
    if (!choices?.length) return;

    if (voices.length >= maxVoices) {
      const oldest = voices.shift();
      try { oldest?.stop(); } catch { /* The source may already have ended. */ }
      oldest?.disconnect();
    }

    const source = context.createBufferSource();
    const voiceGain = context.createGain();
    const bufferIndex = kind === 'normal' ? Math.floor(Math.random() * choices.length) : 0;
    source.buffer = choices[bufferIndex];
    source.playbackRate.value = kind === 'enter'
      ? .97 + Math.random() * .025
      : .96 + Math.random() * .08;
    voiceGain.gain.value = kind === 'enter'
      ? .96
      : .84 + Math.random() * .16;
    source.connect(voiceGain);
    voiceGain.connect(masterGain);
    voices.push(source);
    source.addEventListener('ended', () => {
      const index = voices.indexOf(source);
      if (index >= 0) voices.splice(index, 1);
      source.disconnect();
      voiceGain.disconnect();
    }, { once: true });
    source.start();
  };

  const toggleMuted = (): boolean => {
    mutedState = !mutedState;
    try { localStorage.setItem(soundPreferenceKey, mutedState ? 'muted' : 'enabled'); } catch { /* Storage may be disabled. */ }
    if (mutedState) stopVoices();
    if (masterGain && context) masterGain.gain.setValueAtTime(mutedState ? 0 : .28, context.currentTime);
    return mutedState;
  };

  return {
    unlock,
    play,
    toggleMuted,
    get muted() { return mutedState; },
    destroy() {
      destroyed = true;
      loadController.abort();
      stopVoices();
      buffers.clear();
      void context?.close().catch(() => undefined);
      context = undefined;
      masterGain = undefined;
    },
  };
}
