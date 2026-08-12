export type IntroNavigationType = 'navigate' | 'reload' | 'back_forward' | 'prerender' | 'unknown';

export type IntroVisitSignals = Readonly<{
  designMode: boolean;
  seen: boolean;
  explicitSkip: boolean;
  deepLink: boolean;
  internalHandoff: boolean;
  navigationType: IntroNavigationType;
  historyRestoreWasNotRestored: boolean;
}>;

export type IntroVisit = 'first' | 'returning';

/**
 * Browser APIs do not expose a definitive "reopened closed tab" signal.
 * This policy treats fresh/restored top-level loads as replayable while
 * preserving reload, internal navigation, and ordinary history behavior.
 */
export function classifyIntroVisit(signals: IntroVisitSignals): IntroVisit {
  if (signals.designMode) return 'first';
  if (signals.explicitSkip || signals.deepLink) return 'returning';
  if (!signals.seen) return 'first';
  if (signals.internalHandoff || signals.navigationType === 'reload') return 'returning';
  if (signals.navigationType === 'back_forward') {
    return signals.historyRestoreWasNotRestored ? 'returning' : 'first';
  }
  return signals.navigationType === 'navigate' ? 'first' : 'returning';
}
