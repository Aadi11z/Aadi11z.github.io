import { INTRO_NAME, INTRO_SEQUENCE, INTRO_TIMING, type IntroSequenceStep } from '@/data/intro-sequence';
import { createIntroAudioEngine, type IntroAudioEngine } from './audio-engine';
import { createKeyboardController, type KeyboardController } from './keyboard-controller';

export type KeyboardIntroPhase =
  | 'awaiting-gesture'
  | 'lighting'
  | 'typing'
  | 'settling'
  | 'enter-armed'
  | 'impact'
  | 'transitioning'
  | 'entered';

type CursorPhase = 'hidden' | 'ready' | 'active' | 'resting' | 'armed' | 'impact';
type GateState = 'active' | 'exiting' | 'entered';

const cursorByPhase: Readonly<Record<KeyboardIntroPhase, CursorPhase>> = Object.freeze({
  'awaiting-gesture': 'hidden',
  lighting: 'ready',
  typing: 'active',
  settling: 'resting',
  'enter-armed': 'armed',
  impact: 'impact',
  transitioning: 'hidden',
  entered: 'hidden',
});

const promptByPhase: Readonly<Record<KeyboardIntroPhase, string>> = Object.freeze({
  'awaiting-gesture': 'Click Begin or press a letter key',
  lighting: 'Waking the keyboard',
  typing: `Typing ${INTRO_NAME}`,
  settling: 'Sequence complete',
  'enter-armed': 'Press Enter to open Overview',
  impact: 'Enter pressed',
  transitioning: 'Opening Overview',
  entered: 'Overview open',
});

export type KeyboardIntroDebugApi = Readonly<{
  readonly state: KeyboardIntroPhase;
  start: () => void;
  enter: () => void;
  skip: () => void;
  replay: () => void;
  pressKey: (code: string) => boolean;
  releaseKey: (code: string) => boolean;
  releaseAll: () => void;
}>;

declare global {
  interface Window {
    __keyboardIntroDebug?: KeyboardIntroDebugApi;
  }
}

const mountedIntros = new WeakSet<HTMLElement>();

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    const abort = () => {
      window.clearTimeout(timer);
      reject(signal.reason);
    };
    signal.addEventListener('abort', abort, { once: true });
  });
}

class KeyboardIntroRuntime {
  private phase: KeyboardIntroPhase = 'awaiting-gesture';
  private readonly root = document.documentElement;
  private readonly gate: HTMLElement;
  private readonly output: HTMLElement;
  private readonly status: HTMLElement | null;
  private readonly startControl: HTMLElement | null;
  private readonly startLabel: HTMLElement | null;
  private readonly skipControl: HTMLElement | null;
  private readonly soundToggle: HTMLButtonElement | null;
  private readonly soundLabel: HTMLElement | null;
  private readonly promptText: HTMLElement | null;
  private readonly heroTitle: HTMLElement | null;
  private readonly keyboard: KeyboardController;
  private readonly audio: IntroAudioEngine;
  private readonly listeners = new AbortController();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly isDesignMode: boolean;
  private readonly sessionKey: string | undefined;
  private runController: AbortController | null = null;
  private transitionStarted = false;
  private enterUnlockPending = false;
  private completed = false;
  private debugApi: KeyboardIntroDebugApi | null = null;

  constructor(private readonly intro: HTMLElement, keyboardElement: HTMLElement) {
    const gate = intro.closest<HTMLElement>('[data-hero-gate]');
    const overview = gate?.querySelector<HTMLElement>('[data-overview-content]');
    const output = intro.querySelector<HTMLElement>('[data-typed-name]');
    if (!gate || !overview || !output) throw new Error('Keyboard intro markup is incomplete.');

    this.gate = gate;
    this.output = output;
    this.status = intro.querySelector<HTMLElement>('[data-intro-status]');
    this.startControl = intro.querySelector<HTMLElement>('[data-intro-start]');
    this.startLabel = this.startControl?.querySelector<HTMLElement>('[data-intro-start-label]') ?? null;
    this.skipControl = intro.querySelector<HTMLElement>('[data-intro-skip]');
    this.soundToggle = intro.querySelector<HTMLButtonElement>('[data-sound-toggle]');
    this.soundLabel = this.soundToggle?.querySelector<HTMLElement>('[data-sound-label]') ?? null;
    this.promptText = intro.querySelector<HTMLElement>('[data-intro-prompt-text]');
    this.heroTitle = overview.querySelector<HTMLElement>('#hero-title');
    this.keyboard = createKeyboardController(keyboardElement);
    this.audio = createIntroAudioEngine();
    this.isDesignMode = this.root.dataset.introMode === 'design';
    this.sessionKey = this.root.dataset.introSessionKey;
  }

  mount(): void {
    this.intro.dataset.enhanced = 'true';
    this.updateSoundControl();

    if (!this.isDesignMode && this.root.dataset.introVisit === 'returning') {
      this.finishEntered(false, false);
      return;
    }

    this.addListeners();
    if (this.isDesignMode) {
      this.intro.dataset.designMode = 'true';
      this.installDebugApi();
    }

    this.setGateState('active');
    if (this.reducedMotion.matches) {
      this.armCompletedSequence(this.isDesignMode
        ? 'Reduced motion is active. Enter previews the impact.'
        : 'Reduced motion is active. Press Enter to open Overview.');
      return;
    }

    this.output.textContent = '';
    this.setPhase('awaiting-gesture');
    this.setStatus('Intro ready. Begin the keyboard sequence or press Escape to skip.');
  }

  private addListeners(): void {
    const options = { signal: this.listeners.signal };
    this.startControl?.addEventListener('click', this.handleStartClick, options);
    this.skipControl?.addEventListener('click', this.handleSkipClick, options);
    this.soundToggle?.addEventListener('click', this.handleSoundClick, options);
    document.addEventListener('keydown', this.handleKeyDown, options);
    document.addEventListener('visibilitychange', this.handleVisibilityChange, options);
    window.addEventListener('pagehide', this.handlePageHide, options);
    this.reducedMotion.addEventListener('change', this.handleReducedMotionChange, options);
  }

  private readonly handleStartClick = (event: Event): void => {
    event.preventDefault();
    if (this.phase === 'enter-armed') void this.unlockThenPressEnter(true);
    else this.startSequence();
  };

  private readonly handleSkipClick = (event: Event): void => {
    event.preventDefault();
    this.skip(true);
  };

  private readonly handleSoundClick = (): void => {
    const muted = this.audio.toggleMuted();
    if (!muted) void this.audio.unlock();
    this.updateSoundControl();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || this.completed) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.skip(true);
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    const isInteractiveTarget = Boolean(target?.closest('a, button, input, select, textarea, summary, [role="button"], [contenteditable="true"]'));
    if (event.key === 'Enter' && !isInteractiveTarget) {
      event.preventDefault();
      if (this.phase === 'awaiting-gesture') this.startSequence();
      else void this.unlockThenPressEnter(true);
      return;
    }

    if (
      this.phase === 'awaiting-gesture'
      && !event.altKey
      && !event.ctrlKey
      && !event.metaKey
      && /^[a-z]$/i.test(event.key)
    ) {
      this.startSequence();
    }
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState !== 'hidden' || this.completed) return;
    this.keyboard.releaseAll('physical');
    if (this.isDesignMode) this.armCompletedSequence('Sequence paused while the page was hidden.');
    else this.finishEntered(false, true);
  };

  private readonly handlePageHide = (): void => {
    if (!this.completed) this.finishEntered(false, true);
  };

  private readonly handleReducedMotionChange = (event: MediaQueryListEvent): void => {
    if (!event.matches || this.completed) return;
    this.armCompletedSequence(this.isDesignMode
      ? 'Reduced motion is active. Enter previews the impact.'
      : 'Reduced motion is active. Press Enter to open Overview.');
  };

  private startSequence(): void {
    if (this.completed || this.transitionStarted) return;
    if (this.phase !== 'awaiting-gesture' && !(this.isDesignMode && this.phase === 'enter-armed')) return;

    this.cancelRun();
    this.output.textContent = '';
    this.startControl?.setAttribute('aria-disabled', 'true');
    const controller = new AbortController();
    this.runController = controller;
    // Decoding local audio must never hold the visual sequence hostage. If
    // audio is unavailable or slow, the intro remains fully functional.
    void this.audio.unlock();
    void this.playSequence(controller);
  }

  private async playSequence(controller: AbortController): Promise<void> {
    try {
      this.setPhase('lighting');
      this.setStatus('Lighting the keyboard.');
      await wait(INTRO_TIMING.lightingMs, controller.signal);
      if (controller.signal.aborted) return;

      this.setPhase('typing');
      this.setStatus(`Typing ${INTRO_NAME}.`);
      for (const step of INTRO_SEQUENCE) await this.typeStep(step, controller.signal);

      this.setPhase('settling');
      this.setStatus(`${INTRO_NAME} typed. Preparing Enter.`);
      await wait(INTRO_TIMING.settlingMs, controller.signal);
      this.setPhase('enter-armed');
      this.setStatus(this.isDesignMode
        ? 'Design mode complete. Enter previews the impact without opening Overview.'
        : 'Typing complete. Press Enter or wait to open Overview.');

      if (!this.isDesignMode) {
        await wait(INTRO_TIMING.enterArmedMs, controller.signal);
        this.pressEnter(false);
      }
    } catch {
      // Aborting a sequential run is the normal path for Enter, Skip, visibility,
      // reduced motion, replay, and completion.
    } finally {
      if (this.runController === controller) {
        this.keyboard.releaseAll('script');
        this.runController = null;
      }
    }
  }

  private async typeStep(step: IntroSequenceStep, signal: AbortSignal): Promise<void> {
    try {
      for (const modifier of step.modifiers) this.keyboard.pressKey(modifier, 'script');
      if (step.modifiers.length) await wait(INTRO_TIMING.shiftLeadMs, signal);

      this.keyboard.pressKey(step.key, 'script');
      await wait(INTRO_TIMING.bottomOutMs, signal);
      this.audio.play(step.sound);
      this.output.textContent = `${this.output.textContent ?? ''}${step.character}`;
      await wait(step.holdMs, signal);
    } finally {
      this.keyboard.releaseKey(step.key, 'script');
      for (const modifier of [...step.modifiers].reverse()) this.keyboard.releaseKey(modifier, 'script');
    }
    await wait(step.gapMs, signal);
  }

  private pressEnter(focusHeading: boolean): void {
    if (this.completed) return;
    if (this.isDesignMode) {
      this.previewEnter();
      return;
    }
    if (this.transitionStarted) return;

    this.transitionStarted = true;
    this.cancelRun();
    this.output.textContent = INTRO_NAME;
    const controller = new AbortController();
    this.runController = controller;
    void this.enterAndTransition(controller, focusHeading);
  }

  private async unlockThenPressEnter(focusHeading: boolean): Promise<void> {
    if (this.enterUnlockPending || this.completed || this.transitionStarted) return;
    this.enterUnlockPending = true;
    let timeoutId: number | undefined;
    const timeout = new Promise<false>((resolve) => {
      timeoutId = window.setTimeout(() => resolve(false), 180);
    });
    try {
      await Promise.race([this.audio.unlock(), timeout]);
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      this.enterUnlockPending = false;
    }
    this.pressEnter(focusHeading);
  }

  private async enterAndTransition(controller: AbortController, focusHeading: boolean): Promise<void> {
    try {
      this.setPhase('impact');
      this.setStatus('Enter reaching bottom-out.');
      this.keyboard.pressKey('Enter', 'script');
      await wait(INTRO_TIMING.bottomOutMs, controller.signal);
      this.audio.play('enter');
      this.setStatus('Enter pressed. Opening the portfolio overview.');
      await wait(INTRO_TIMING.enterHoldMs, controller.signal);
      this.keyboard.releaseKey('Enter', 'script');
      await wait(INTRO_TIMING.impactSettleMs, controller.signal);

      await this.transitionToOverview(focusHeading, controller.signal);
    } catch {
      // A skip can intentionally replace this transition with immediate entry.
    }
  }

  private previewEnter(): void {
    if (this.completed || this.phase === 'impact') return;
    this.cancelRun();
    this.output.textContent = INTRO_NAME;
    const controller = new AbortController();
    this.runController = controller;

    void (async () => {
      try {
        this.setPhase('impact');
        this.keyboard.pressKey('Enter', 'script');
        await wait(INTRO_TIMING.bottomOutMs, controller.signal);
        this.audio.play('enter');
        this.setStatus('Design preview: Enter bottomed out. Overview remains closed.');
        await wait(INTRO_TIMING.enterHoldMs, controller.signal);
        this.keyboard.releaseKey('Enter', 'script');
        await wait(INTRO_TIMING.impactSettleMs, controller.signal);
        this.setPhase('enter-armed');
      } catch {
        // Replay, Skip, and visibility intentionally cancel a preview.
      } finally {
        if (this.runController === controller) {
          this.keyboard.releaseAll('script');
          this.runController = null;
        }
      }
    })();
  }

  private armCompletedSequence(status: string): void {
    this.cancelRun();
    this.output.textContent = INTRO_NAME;
    this.setGateState('active');
    this.setPhase('enter-armed');
    this.setStatus(status);
    this.startControl?.setAttribute('aria-disabled', 'false');
  }

  private skip(focusHeading: boolean): void {
    if (this.completed) return;
    this.transitionStarted = true;
    this.cancelRun();
    this.output.textContent = INTRO_NAME;
    this.setPhase('transitioning');
    this.setGateState('exiting');
    this.finishEntered(focusHeading, true);
  }

  private async transitionToOverview(focusHeading: boolean, signal: AbortSignal): Promise<void> {
    const shouldFocusHeading = focusHeading || this.intro.contains(document.activeElement);
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => ViewTransition;
    };

    if (!this.reducedMotion.matches && transitionDocument.startViewTransition) {
      this.root.dataset.introTransition = 'keyboard';
      let transition: ViewTransition | undefined;
      try {
        transition = transitionDocument.startViewTransition(() => {
          this.gate.dataset.introTransitioned = 'true';
          this.finishEntered(shouldFocusHeading, true);
        });
      } catch {
        delete this.root.dataset.introTransition;
      }

      if (transition) {
        try {
          await transition.finished;
        } catch {
          // A superseding navigation may cancel the pixels. If the update did
          // not commit, the fallback below still opens a valid Overview.
        } finally {
          delete this.root.dataset.introTransition;
        }
        if (this.completed) return;
      }
    }

    this.setPhase('transitioning');
    this.setGateState('exiting');
    await wait(this.reducedMotion.matches ? 0 : INTRO_TIMING.transitionMs, signal);
    this.finishEntered(shouldFocusHeading, true);
  }

  private finishEntered(focusHeading: boolean, persist: boolean): void {
    if (this.completed) return;
    this.completed = true;
    this.transitionStarted = true;
    this.cancelRun();
    if (persist) this.persistSeen();
    this.output.textContent = INTRO_NAME;
    this.setPhase('entered');
    this.setGateState('entered');
    this.setStatus('Portfolio overview open.');
    this.dispose();

    if (focusHeading && this.heroTitle) {
      this.heroTitle.setAttribute('tabindex', '-1');
      this.heroTitle.focus({ preventScroll: true });
    }
  }

  private cancelRun(): void {
    this.runController?.abort();
    this.runController = null;
    this.keyboard.releaseAll('script');
  }

  private persistSeen(): void {
    try {
      if (!this.isDesignMode && this.sessionKey) sessionStorage.setItem(this.sessionKey, 'seen');
    } catch {
      // Session storage may be unavailable in hardened browsing contexts.
    }
  }

  private setPhase(phase: KeyboardIntroPhase): void {
    this.phase = phase;
    this.intro.dataset.phase = phase;
    this.intro.dataset.cursorPhase = cursorByPhase[phase];
    if (this.promptText) this.promptText.textContent = promptByPhase[phase];
    if (this.startLabel) {
      this.startLabel.textContent = phase === 'enter-armed'
        ? (this.isDesignMode ? 'Preview Enter' : 'Open Overview')
        : 'Begin intro';
    }
    this.startControl?.setAttribute('aria-disabled', String(phase !== 'awaiting-gesture' && phase !== 'enter-armed'));
  }

  private setGateState(state: GateState): void {
    this.gate.dataset.introState = state;
    this.root.dataset.heroIntroState = state;
  }

  private setStatus(message: string): void {
    if (this.status) this.status.textContent = message;
  }

  private updateSoundControl(): void {
    const muted = this.audio.muted;
    this.soundToggle?.setAttribute('aria-pressed', String(muted));
    if (this.soundLabel) this.soundLabel.textContent = muted ? 'Sound off' : 'Sound on';
  }

  private installDebugApi(): void {
    const runtime = this;
    this.debugApi = Object.freeze({
      get state() { return runtime.phase; },
      start: () => this.startSequence(),
      enter: () => this.pressEnter(false),
      skip: () => this.skip(false),
      replay: () => {
        if (this.completed) return;
        this.cancelRun();
        this.transitionStarted = false;
        this.output.textContent = '';
        this.setPhase('awaiting-gesture');
        this.startSequence();
      },
      pressKey: (code) => this.keyboard.pressKey(code, 'debug'),
      releaseKey: (code) => this.keyboard.releaseKey(code, 'debug'),
      releaseAll: () => this.keyboard.releaseAll('debug'),
    });
    window.__keyboardIntroDebug = this.debugApi;
  }

  private dispose(): void {
    this.listeners.abort();
    this.keyboard.destroy();
    this.audio.destroy();
    if (this.debugApi && window.__keyboardIntroDebug === this.debugApi) delete window.__keyboardIntroDebug;
    this.debugApi = null;
  }
}

function failOpen(intro: HTMLElement): void {
  const gate = intro.closest<HTMLElement>('[data-hero-gate]');
  if (gate) gate.dataset.introState = 'entered';
  document.documentElement.dataset.heroIntroState = 'entered';
  intro.dataset.phase = 'entered';
  intro.dataset.cursorPhase = 'hidden';
}

/** Mount the single keyboard intro emitted by the homepage component. */
export function mountKeyboardIntros(): void {
  const intro = document.querySelector<HTMLElement>('[data-keyboard-intro]');
  if (!intro || mountedIntros.has(intro)) return;
  mountedIntros.add(intro);

  if (document.documentElement.dataset.introMode !== 'design') delete window.__keyboardIntroDebug;
  const keyboard = intro.querySelector<HTMLElement>('[data-keyboard]');
  if (!keyboard) {
    failOpen(intro);
    return;
  }

  try {
    new KeyboardIntroRuntime(intro, keyboard).mount();
  } catch {
    failOpen(intro);
  }
}
