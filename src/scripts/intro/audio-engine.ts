import key01Url from '@/assets/audio/keyboard/key-01.webm?url&no-inline';
import key02Url from '@/assets/audio/keyboard/key-02.webm?url&no-inline';
import key03Url from '@/assets/audio/keyboard/key-03.webm?url&no-inline';
import key04Url from '@/assets/audio/keyboard/key-04.webm?url&no-inline';
import spaceUrl from '@/assets/audio/keyboard/space.webm?url&no-inline';
import enterUrl from '@/assets/audio/keyboard/enter.webm?url&no-inline';
import { resumeAudioContext } from './audio-context';

export type IntroSoundKind = 'normal' | 'space' | 'enter';
export type IntroAudioState = 'idle' | 'loading' | 'blocked' | 'ready' | 'muted' | 'error';

export type IntroAudioEngine = {
  prepare: () => Promise<boolean>;
  unlock: () => Promise<boolean>;
  play: (kind: IntroSoundKind) => void;
  toggleMuted: () => boolean;
  readonly muted: boolean;
  readonly state: IntroAudioState;
  destroy: () => void;
};

const soundUrls: Record<IntroSoundKind, readonly string[]> = {
  normal: [key01Url, key02Url, key03Url, key04Url],
  space: [spaceUrl],
  enter: [enterUrl],
};

const maxVoices = 6;
const masterLevel = .42;
const resumeTimeoutMs = 800;
const soundPreferenceKey = 'portfolio-intro-sound-v1';
const audioCacheMode: RequestCache = import.meta.env.DEV ? 'no-store' : 'force-cache';

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
  let preparePromise: Promise<boolean> | undefined;
  let mutedState = readMutedPreference();
  let audioState: IntroAudioState = mutedState ? 'muted' : 'idle';
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
    const response = await fetch(url, { cache: audioCacheMode, signal: loadController.signal });
    if (!response.ok) throw new Error(`Keyboard audio request failed: ${response.status}`);
    return audioContext.decodeAudioData(await response.arrayBuffer());
  };

  const ensureContext = (): AudioContext | undefined => {
    if (context && context.state !== 'closed') return context;
    const AudioContextConstructor = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return undefined;
    buffers.clear();
    masterGain?.disconnect();
    context = new AudioContextConstructor({ latencyHint: 'interactive' });
    masterGain = context.createGain();
    masterGain.gain.value = masterLevel;
    masterGain.connect(context.destination);
    return context;
  };

  const prepare = async (): Promise<boolean> => {
    if (destroyed || mutedState) return false;
    if (buffers.size > 0) {
      audioState = context?.state === 'running' ? 'ready' : 'blocked';
      return true;
    }
    if (preparePromise) return preparePromise;

    const attempt = (async () => {
      try {
        const activeContext = ensureContext();
        if (!activeContext) {
          audioState = 'error';
          return false;
        }
        audioState = 'loading';
        await Promise.all((Object.keys(soundUrls) as IntroSoundKind[]).map(async (kind) => {
          const loaded = await Promise.allSettled(soundUrls[kind].map((url) => load(activeContext, url)));
          const decoded = loaded.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
          if (!destroyed && decoded.length) buffers.set(kind, decoded);
        }));
        const prepared = !destroyed && buffers.size > 0;
        audioState = mutedState
          ? 'muted'
          : prepared
            ? (activeContext.state === 'running' ? 'ready' : 'blocked')
            : 'error';
        return prepared;
      } catch {
        audioState = destroyed ? audioState : 'error';
        return false;
      }
    })();
    preparePromise = attempt;
    try {
      return await attempt;
    } finally {
      if (preparePromise === attempt) preparePromise = undefined;
    }
  };

  const unlock = async (): Promise<boolean> => {
    if (destroyed || mutedState) return false;
    if (context?.state === 'running' && buffers.size > 0) {
      audioState = 'ready';
      return true;
    }
    return (async () => {
      try {
        const activeContext = ensureContext();
        if (!activeContext) {
          audioState = 'error';
          return false;
        }
        const [, prepared] = await Promise.all([
          resumeAudioContext(activeContext, resumeTimeoutMs),
          prepare(),
        ]);
        // A trusted gesture may have resumed the shared context while an older
        // best-effort autoplay attempt was still pending.
        const unlocked = !destroyed && prepared && activeContext.state === 'running';
        audioState = mutedState ? 'muted' : (unlocked ? 'ready' : (prepared ? 'blocked' : 'error'));
        return unlocked;
      } catch {
        audioState = destroyed ? audioState : 'error';
        return false;
      }
    })();
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
    if (masterGain && context) masterGain.gain.setValueAtTime(mutedState ? 0 : masterLevel, context.currentTime);
    audioState = mutedState
      ? 'muted'
      : (context?.state === 'running' && buffers.size > 0 ? 'ready' : 'idle');
    return mutedState;
  };

  return {
    prepare,
    unlock,
    play,
    toggleMuted,
    get muted() { return mutedState; },
    get state() { return audioState; },
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
