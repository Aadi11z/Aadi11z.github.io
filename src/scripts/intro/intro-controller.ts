import { INTRO_NAME, INTRO_SEQUENCE, INTRO_TIMING, type IntroSequenceStep } from '@/data/intro-sequence';
import { createIntroAudioEngine, type IntroAudioEngine } from './audio-engine';
import { shouldAutoEnterCurrentDevice } from './device-policy';
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
  'awaiting-gesture': 'Starting automatically',
  lighting: 'Waking the keyboard',
  typing: `Typing ${INTRO_NAME}`,
  settling: 'Sequence complete',
  'enter-armed': 'Click anywhere or press Enter',
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

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    && Boolean(target.closest('a, button, input, select, textarea, summary, [role="button"], [contenteditable="true"]'));
}

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
  private readonly skipControl: HTMLElement | null;
  private readonly soundToggle: HTMLButtonElement | null;
  private readonly promptText: HTMLElement | null;
  private readonly heroTitle: HTMLElement | null;
  private readonly keyboard: KeyboardController;
  private readonly audio: IntroAudioEngine;
  private readonly listeners = new AbortController();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly isDesignMode: boolean;
  private readonly autoEnter: boolean;
  private readonly sessionKey: string | undefined;
  private autoStartTimer: number | undefined;
  private autoEnterTimer: number | undefined;
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
    this.skipControl = intro.querySelector<HTMLElement>('[data-intro-skip]');
    this.soundToggle = intro.querySelector<HTMLButtonElement>('[data-sound-toggle]');
    this.promptText = intro.querySelector<HTMLElement>('[data-intro-prompt-text]');
    this.heroTitle = overview.querySelector<HTMLElement>('#hero-title');
    this.keyboard = createKeyboardController(keyboardElement);
    this.audio = createIntroAudioEngine();
    this.isDesignMode = this.root.dataset.introMode === 'design';
    this.autoEnter = !this.isDesignMode && shouldAutoEnterCurrentDevice();
    this.sessionKey = this.root.dataset.introSessionKey;
  }

  mount(): void {
    this.intro.dataset.enhanced = 'true';
    this.intro.dataset.enterMode = this.autoEnter ? 'automatic' : 'manual';

    if (!this.isDesignMode && this.root.dataset.introVisit === 'returning') {
      this.finishEntered(false, false);
      return;
    }

    this.addListeners();
    this.updateSoundControl();
    if (this.isDesignMode) {
      this.intro.dataset.designMode = 'true';
      this.installDebugApi();
    }

    this.setGateState('active');
    if (this.reducedMotion.matches) {
      this.armCompletedSequence(this.getReducedMotionStatus());
      return;
    }

    this.output.textContent = '';
    this.setPhase('awaiting-gesture');
    if (document.visibilityState === 'visible') {
      this.setStatus('Keyboard intro starting automatically. Press Escape to skip.');
      this.scheduleAutomaticStart();
    } else {
      this.setStatus('Keyboard intro will start when this tab becomes visible.');
    }
  }

  private addListeners(): void {
    const options = { signal: this.listeners.signal };
    this.intro.addEventListener('pointerdown', this.handleIntroPointerDown, options);
    this.skipControl?.addEventListener('click', this.handleSkipClick, options);
    this.soundToggle?.addEventListener('click', this.handleSoundClick, options);
    document.addEventListener('keydown', this.handleKeyDown, options);
    document.addEventListener('visibilitychange', this.handleVisibilityChange, options);
    window.addEventListener('pagehide', this.handlePageHide, options);
    this.reducedMotion.addEventListener('change', this.handleReducedMotionChange, options);
  }

  private readonly handleIntroPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.completed || isInteractiveTarget(event.target)) return;
    if (this.phase === 'awaiting-gesture') {
      event.preventDefault();
      this.startSequence(event.isTrusted);
    } else if (this.phase === 'enter-armed') {
      event.preventDefault();
      if (event.isTrusted) void this.unlockThenPressEnter(true);
      else this.pressEnter(true);
    } else if (event.isTrusted && (this.phase === 'lighting' || this.phase === 'typing' || this.phase === 'settling')) {
      void this.audio.unlock();
    }
  };

  private readonly handleSkipClick = (event: Event): void => {
    event.preventDefault();
    this.skip(true);
  };

  private readonly handleSoundClick = (event: MouseEvent): void => {
    const muted = this.audio.toggleMuted();
    this.updateSoundControl();
    if (!muted && event.isTrusted) void this.audio.unlock();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || this.completed) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.skip(true);
      return;
    }

    const interactiveTarget = isInteractiveTarget(event.target);
    if (event.key === 'Enter' && !interactiveTarget) {
      if (this.phase === 'awaiting-gesture') {
        event.preventDefault();
        this.startSequence(event.isTrusted);
      } else if (this.phase === 'enter-armed') {
        event.preventDefault();
        if (event.isTrusted) void this.unlockThenPressEnter(true);
        else this.pressEnter(true);
      } else if (event.isTrusted && (this.phase === 'lighting' || this.phase === 'typing' || this.phase === 'settling')) {
        void this.audio.unlock();
      }
      return;
    }

    if (
      this.phase === 'awaiting-gesture'
      && !interactiveTarget
      && !event.altKey
      && !event.ctrlKey
      && !event.metaKey
      && !['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)
    ) {
      if (event.key === ' ' || event.key.startsWith('Arrow')) event.preventDefault();
      this.startSequence(event.isTrusted);
      return;
    }

    if (
      !interactiveTarget
      && event.isTrusted
      && (this.phase === 'lighting' || this.phase === 'typing' || this.phase === 'settling')
    ) {
      void this.audio.unlock();
    }
  };

  private readonly handleVisibilityChange = (): void => {
    if (this.completed) return;
    if (document.visibilityState === 'hidden') {
      this.keyboard.releaseAll('physical');
      if (this.phase === 'awaiting-gesture') {
        this.cancelAutomaticStart();
        this.setStatus('Keyboard intro will start when this tab becomes visible.');
      } else if (this.phase === 'lighting' || this.phase === 'typing' || this.phase === 'settling') {
        this.cancelRun();
        this.output.textContent = '';
        this.setPhase('awaiting-gesture');
        this.setStatus('Keyboard intro paused until this tab becomes visible.');
      } else if (this.phase === 'enter-armed') {
        this.cancelAutomaticEnter();
      } else if (this.phase === 'impact' || this.phase === 'transitioning') {
        this.cancelRun();
        this.transitionStarted = false;
        this.output.textContent = INTRO_NAME;
        delete this.root.dataset.introTransition;
        delete this.gate.dataset.introTransitioned;
        this.setGateState('active');
        this.setPhase('enter-armed');
        this.setStatus('Opening Overview paused until this tab becomes visible.');
      }
      return;
    }

    if (this.phase === 'awaiting-gesture') {
      this.setStatus('Keyboard intro starting automatically. Press Escape to skip.');
      this.scheduleAutomaticStart();
    } else if (this.phase === 'enter-armed') {
      this.setStatus(this.autoEnter
        ? 'Typing complete. Opening Overview automatically.'
        : 'Typing complete. Click anywhere or press Enter to open Overview.');
      if (this.autoEnter) this.scheduleAutomaticEnter();
    }
  };

  private readonly handlePageHide = (): void => {
    if (!this.completed) this.finishEntered(false, true);
  };

  private readonly handleReducedMotionChange = (event: MediaQueryListEvent): void => {
    if (!event.matches || this.completed) return;
    this.armCompletedSequence(this.getReducedMotionStatus());
  };

  private startSequence(requestAudio = false): void {
    if (this.completed || this.transitionStarted) return;
    if (this.phase !== 'awaiting-gesture' && !(this.isDesignMode && this.phase === 'enter-armed')) return;

    this.cancelRun();
    this.output.textContent = '';
    const controller = new AbortController();
    this.runController = controller;
    // Audio initialization never blocks the visual timeline. Browsers that
    // allow autoplay can play from the first key; a later trusted gesture can
    // retry the same engine when autoplay is denied.
    if (requestAudio) void this.audio.unlock();
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
        : (this.autoEnter
          ? 'Typing complete. Opening Overview automatically.'
          : 'Typing complete. Click anywhere or press Enter to open Overview.'));

      if (this.autoEnter) this.scheduleAutomaticEnter();
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
    this.cancelAutomaticEnter();
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
    if (this.autoEnter && document.visibilityState === 'visible') this.scheduleAutomaticEnter();
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
          if (signal.aborted) return;
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
        if (this.completed || signal.aborted) return;
      }
    }

    if (signal.aborted) return;
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
    this.cancelAutomaticStart();
    this.cancelAutomaticEnter();
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
    if (this.promptText) {
      this.promptText.textContent = phase === 'enter-armed' && this.autoEnter
        ? 'Opening Overview automatically'
        : promptByPhase[phase];
    }
  }

  private scheduleAutomaticStart(): void {
    if (this.autoStartTimer !== undefined || document.visibilityState !== 'visible') return;
    this.autoStartTimer = window.setTimeout(() => {
      this.autoStartTimer = undefined;
      if (document.visibilityState !== 'visible' || this.phase !== 'awaiting-gesture') return;
      this.startSequence(true);
    }, INTRO_TIMING.autoStartMs);
  }

  private cancelAutomaticStart(): void {
    if (this.autoStartTimer === undefined) return;
    window.clearTimeout(this.autoStartTimer);
    this.autoStartTimer = undefined;
  }

  private scheduleAutomaticEnter(): void {
    if (!this.autoEnter || this.autoEnterTimer !== undefined || document.visibilityState !== 'visible') return;
    this.autoEnterTimer = window.setTimeout(() => {
      this.autoEnterTimer = undefined;
      if (document.visibilityState !== 'visible' || this.phase !== 'enter-armed') return;
      this.pressEnter(false);
    }, INTRO_TIMING.enterArmedMs);
  }

  private cancelAutomaticEnter(): void {
    if (this.autoEnterTimer === undefined) return;
    window.clearTimeout(this.autoEnterTimer);
    this.autoEnterTimer = undefined;
  }

  private setGateState(state: GateState): void {
    this.gate.dataset.introState = state;
    this.root.dataset.heroIntroState = state;
  }

  private setStatus(message: string): void {
    if (this.status) this.status.textContent = message;
  }

  private getReducedMotionStatus(): string {
    if (this.isDesignMode) return 'Reduced motion is active. Click the scene or press Enter to preview the impact.';
    return this.autoEnter
      ? 'Reduced motion is active. Opening Overview automatically.'
      : 'Reduced motion is active. Click the scene or press Enter to open Overview.';
  }

  private updateSoundControl(): void {
    if (!this.soundToggle) return;
    const enabled = !this.audio.muted;
    const action = enabled ? 'Mute keyboard sound' : 'Enable keyboard sound';
    this.soundToggle.setAttribute('aria-pressed', String(enabled));
    this.soundToggle.title = action;
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
