export type KeyboardPressSource = 'physical' | 'script' | 'debug';

export type PhysicalKeyboardEvent = Pick<KeyboardEvent, 'code' | 'key' | 'location'>;

const keyValueToCode: Readonly<Record<string, string>> = Object.freeze({
  ' ': 'Space',
  Spacebar: 'Space',
  Esc: 'Escape',
  Del: 'Delete',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Control: 'ControlLeft',
  Alt: 'AltLeft',
  Meta: 'MetaLeft',
  OS: 'MetaLeft',
  Shift: 'ShiftLeft',
  '-': 'Minus',
  '=': 'Equal',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  '\\': 'Backslash',
  ';': 'Semicolon',
  "'": 'Quote',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',
  '`': 'Backquote',
});

/** Convert a physical KeyboardEvent to the canonical KeyboardEvent.code contract. */
export function getPhysicalKeyCode(event: PhysicalKeyboardEvent): string | null {
  if (event.code && event.code !== 'Unidentified') return event.code;

  if (/^[a-z]$/i.test(event.key)) return `Key${event.key.toUpperCase()}`;
  if (/^[0-9]$/.test(event.key)) return `Digit${event.key}`;
  if (event.key === 'Shift') return event.location === 2 ? 'ShiftRight' : 'ShiftLeft';
  if (event.key === 'Control') return event.location === 2 ? 'ControlRight' : 'ControlLeft';
  if (event.key === 'Alt') return event.location === 2 ? 'AltRight' : 'AltLeft';
  if (event.key === 'Meta' || event.key === 'OS') return event.location === 2 ? 'MetaRight' : 'MetaLeft';

  return keyValueToCode[event.key] ?? (event.key ? event.key : null);
}

const impactDurationMs = 150;

export class KeyboardController {
  readonly keys: ReadonlyMap<string, HTMLElement>;

  private readonly keyMap: Map<string, HTMLElement>;
  private readonly owners = new Map<string, Set<KeyboardPressSource>>();
  private readonly neighbors = new Map<string, readonly HTMLElement[]>();
  private readonly neighborOwners = new Map<HTMLElement, Set<string>>();
  private readonly listenerController = new AbortController();
  private readonly keyImpactTimers = new Map<string, number>();
  private chassisImpactTimer: number | undefined;
  private destroyed = false;

  constructor(readonly keyboard: HTMLElement) {
    const keyElements = Array.from(keyboard.querySelectorAll<HTMLElement>('.kb-key[data-key]'));
    this.keyMap = new Map(
      keyElements.flatMap((element) => {
        const code = element.dataset.key?.trim();
        return code ? [[code, element] as const] : [];
      }),
    );
    this.keys = this.keyMap;

    keyElements.forEach((element, index) => {
      const code = element.dataset.key?.trim();
      if (!code || this.keyMap.get(code) !== element) return;

      const explicitCodes = element.dataset.neighbors?.trim().split(/\s+/).filter(Boolean) ?? [];
      const explicitNeighbors = explicitCodes.flatMap((neighborCode) => {
        const neighbor = this.keyMap.get(neighborCode);
        return neighbor ? [neighbor] : [];
      });

      if (explicitNeighbors.length) {
        this.neighbors.set(code, explicitNeighbors);
        return;
      }

      // The scene supplies explicit neighbors. Adjacent DOM keys remain a safe
      // fallback for isolated previews and small controller fixtures.
      this.neighbors.set(code, [keyElements[index - 1], keyElements[index + 1]].filter(
        (neighbor): neighbor is HTMLElement => neighbor instanceof HTMLElement,
      ));
    });

    const document = keyboard.ownerDocument;
    const view = document.defaultView;
    document.addEventListener('keydown', this.handlePhysicalKeyDown, { signal: this.listenerController.signal });
    document.addEventListener('keyup', this.handlePhysicalKeyUp, { signal: this.listenerController.signal });
    view?.addEventListener('blur', this.handleWindowBlur, { signal: this.listenerController.signal });
  }

  pressKey(code: string, source: KeyboardPressSource = 'script'): boolean {
    if (this.destroyed) return false;
    const key = this.keyMap.get(code);
    if (!key) return false;

    const owners = this.owners.get(code) ?? new Set<KeyboardPressSource>();
    const wasPressed = owners.size > 0;
    const isNewOwner = !owners.has(source);
    owners.add(source);
    this.owners.set(code, owners);

    key.dataset.pressed = 'true';
    key.dataset.pressSource = [...owners].join(' ');
    if (!wasPressed) this.addNeighborState(code);
    if (isNewOwner) this.triggerImpact(code, key);
    return true;
  }

  releaseKey(code: string, source: KeyboardPressSource = 'script'): boolean {
    const key = this.keyMap.get(code);
    const owners = this.owners.get(code);
    if (!key || !owners?.delete(source)) return false;

    if (owners.size) {
      key.dataset.pressSource = [...owners].join(' ');
      return true;
    }

    this.owners.delete(code);
    delete key.dataset.pressed;
    delete key.dataset.pressSource;
    this.removeNeighborState(code);
    return true;
  }

  releaseAll(source?: KeyboardPressSource): void {
    if (source) {
      for (const code of [...this.owners.keys()]) this.releaseKey(code, source);
      return;
    }

    this.owners.clear();
    this.neighborOwners.clear();
    for (const key of this.keyMap.values()) {
      delete key.dataset.pressed;
      delete key.dataset.pressSource;
      delete key.dataset.neighbor;
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.listenerController.abort();
    this.releaseAll();

    const view = this.keyboard.ownerDocument.defaultView;
    for (const timer of this.keyImpactTimers.values()) view?.clearTimeout(timer);
    if (this.chassisImpactTimer !== undefined) view?.clearTimeout(this.chassisImpactTimer);
    this.keyImpactTimers.clear();
    delete this.keyboard.dataset.impact;
    delete this.keyboard.dataset.impactKey;
    for (const key of this.keyMap.values()) delete key.dataset.impact;
  }

  private readonly handlePhysicalKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return;
    const code = getPhysicalKeyCode(event);
    if (code) this.pressKey(code, 'physical');
  };

  private readonly handlePhysicalKeyUp = (event: KeyboardEvent): void => {
    const code = getPhysicalKeyCode(event);
    if (code) this.releaseKey(code, 'physical');
  };

  private readonly handleWindowBlur = (): void => {
    this.releaseAll('physical');
  };

  private addNeighborState(code: string): void {
    for (const neighbor of this.neighbors.get(code) ?? []) {
      const owners = this.neighborOwners.get(neighbor) ?? new Set<string>();
      owners.add(code);
      this.neighborOwners.set(neighbor, owners);
      neighbor.dataset.neighbor = 'true';
    }
  }

  private removeNeighborState(code: string): void {
    for (const neighbor of this.neighbors.get(code) ?? []) {
      const owners = this.neighborOwners.get(neighbor);
      owners?.delete(code);
      if (owners?.size) continue;
      this.neighborOwners.delete(neighbor);
      delete neighbor.dataset.neighbor;
    }
  }

  private triggerImpact(code: string, key: HTMLElement): void {
    const view = this.keyboard.ownerDocument.defaultView;
    if (!view) return;

    const previousKeyTimer = this.keyImpactTimers.get(code);
    if (previousKeyTimer !== undefined) view.clearTimeout(previousKeyTimer);
    key.dataset.impact = 'true';
    this.keyImpactTimers.set(code, view.setTimeout(() => {
      delete key.dataset.impact;
      this.keyImpactTimers.delete(code);
    }, impactDurationMs));

    if (this.chassisImpactTimer !== undefined) view.clearTimeout(this.chassisImpactTimer);
    this.keyboard.dataset.impact = 'true';
    this.keyboard.dataset.impactKey = code;
    this.chassisImpactTimer = view.setTimeout(() => {
      delete this.keyboard.dataset.impact;
      delete this.keyboard.dataset.impactKey;
      this.chassisImpactTimer = undefined;
    }, impactDurationMs);
  }
}

export function createKeyboardController(keyboard: HTMLElement): KeyboardController {
  return new KeyboardController(keyboard);
}
