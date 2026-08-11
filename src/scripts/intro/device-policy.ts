export type IntroDeviceSignals = Readonly<{
  coarsePrimaryPointer: boolean;
  anyHoverAvailable: boolean;
}>;

/**
 * Phones and tablets should complete the intro without an input gate. The
 * When any hover-capable pointer is present, the explicit Enter interaction
 * is retained for hybrid devices because browsers expose input capability,
 * not physical device class.
 */
export function shouldAutoEnterIntro(signals: IntroDeviceSignals): boolean {
  return signals.coarsePrimaryPointer && !signals.anyHoverAvailable;
}

export function shouldAutoEnterCurrentDevice(): boolean {
  return shouldAutoEnterIntro({
    coarsePrimaryPointer: window.matchMedia('(pointer: coarse)').matches,
    anyHoverAvailable: window.matchMedia('(any-hover: hover)').matches,
  });
}
