export type KeyboardKeyKind =
  | 'letter'
  | 'number'
  | 'punctuation'
  | 'modifier'
  | 'utility'
  | 'space'
  | 'arrow';

type KeyboardKeySpec = Readonly<{
  code: string;
  legend: string;
  shiftLegend?: string;
  units?: number;
  kind: KeyboardKeyKind;
}>;

const rows = [
  [
    { code: 'Escape', legend: 'Esc', kind: 'utility' },
    { code: 'Digit1', legend: '1', shiftLegend: '!', kind: 'number' },
    { code: 'Digit2', legend: '2', shiftLegend: '@', kind: 'number' },
    { code: 'Digit3', legend: '3', shiftLegend: '#', kind: 'number' },
    { code: 'Digit4', legend: '4', shiftLegend: '$', kind: 'number' },
    { code: 'Digit5', legend: '5', shiftLegend: '%', kind: 'number' },
    { code: 'Digit6', legend: '6', shiftLegend: '^', kind: 'number' },
    { code: 'Digit7', legend: '7', shiftLegend: '&', kind: 'number' },
    { code: 'Digit8', legend: '8', shiftLegend: '*', kind: 'number' },
    { code: 'Digit9', legend: '9', shiftLegend: '(', kind: 'number' },
    { code: 'Digit0', legend: '0', shiftLegend: ')', kind: 'number' },
    { code: 'Minus', legend: '−', shiftLegend: '_', kind: 'punctuation' },
    { code: 'Equal', legend: '=', shiftLegend: '+', kind: 'punctuation' },
    { code: 'Backspace', legend: 'Backspace', units: 2, kind: 'utility' },
    { code: 'Delete', legend: 'Del', kind: 'utility' },
  ],
  [
    { code: 'Tab', legend: 'Tab', units: 1.5, kind: 'utility' },
    { code: 'KeyQ', legend: 'Q', kind: 'letter' },
    { code: 'KeyW', legend: 'W', kind: 'letter' },
    { code: 'KeyE', legend: 'E', kind: 'letter' },
    { code: 'KeyR', legend: 'R', kind: 'letter' },
    { code: 'KeyT', legend: 'T', kind: 'letter' },
    { code: 'KeyY', legend: 'Y', kind: 'letter' },
    { code: 'KeyU', legend: 'U', kind: 'letter' },
    { code: 'KeyI', legend: 'I', kind: 'letter' },
    { code: 'KeyO', legend: 'O', kind: 'letter' },
    { code: 'KeyP', legend: 'P', kind: 'letter' },
    { code: 'BracketLeft', legend: '[', shiftLegend: '{', kind: 'punctuation' },
    { code: 'BracketRight', legend: ']', shiftLegend: '}', kind: 'punctuation' },
    { code: 'Backslash', legend: '\\', shiftLegend: '|', units: 1.5, kind: 'punctuation' },
    { code: 'PageUp', legend: 'PgUp', kind: 'utility' },
  ],
  [
    { code: 'CapsLock', legend: 'Caps', units: 1.8, kind: 'modifier' },
    { code: 'KeyA', legend: 'A', kind: 'letter' },
    { code: 'KeyS', legend: 'S', kind: 'letter' },
    { code: 'KeyD', legend: 'D', kind: 'letter' },
    { code: 'KeyF', legend: 'F', kind: 'letter' },
    { code: 'KeyG', legend: 'G', kind: 'letter' },
    { code: 'KeyH', legend: 'H', kind: 'letter' },
    { code: 'KeyJ', legend: 'J', kind: 'letter' },
    { code: 'KeyK', legend: 'K', kind: 'letter' },
    { code: 'KeyL', legend: 'L', kind: 'letter' },
    { code: 'Semicolon', legend: ';', shiftLegend: ':', kind: 'punctuation' },
    { code: 'Quote', legend: "'", shiftLegend: '"', kind: 'punctuation' },
    { code: 'Enter', legend: 'Enter ↵', units: 2.2, kind: 'utility' },
    { code: 'PageDown', legend: 'PgDn', kind: 'utility' },
  ],
  [
    { code: 'ShiftLeft', legend: '⇧ Shift', units: 2.55, kind: 'modifier' },
    { code: 'KeyZ', legend: 'Z', kind: 'letter' },
    { code: 'KeyX', legend: 'X', kind: 'letter' },
    { code: 'KeyC', legend: 'C', kind: 'letter' },
    { code: 'KeyV', legend: 'V', kind: 'letter' },
    { code: 'KeyB', legend: 'B', kind: 'letter' },
    { code: 'KeyN', legend: 'N', kind: 'letter' },
    { code: 'KeyM', legend: 'M', kind: 'letter' },
    { code: 'Comma', legend: ',', shiftLegend: '<', kind: 'punctuation' },
    { code: 'Period', legend: '.', shiftLegend: '>', kind: 'punctuation' },
    { code: 'Slash', legend: '/', shiftLegend: '?', kind: 'punctuation' },
    { code: 'ShiftRight', legend: 'Shift ⇧', units: 2.55, kind: 'modifier' },
    { code: 'ArrowUp', legend: '↑', kind: 'arrow' },
  ],
  [
    { code: 'ControlLeft', legend: 'Ctrl', units: 1.25, kind: 'modifier' },
    { code: 'MetaLeft', legend: 'Meta', units: 1.25, kind: 'modifier' },
    { code: 'AltLeft', legend: 'Alt', units: 1.25, kind: 'modifier' },
    { code: 'Space', legend: '', units: 6.25, kind: 'space' },
    { code: 'AltRight', legend: 'Alt', units: 1.25, kind: 'modifier' },
    { code: 'Fn', legend: 'Fn', kind: 'modifier' },
    { code: 'ControlRight', legend: 'Ctrl', units: 1.25, kind: 'modifier' },
    { code: 'ArrowLeft', legend: '←', kind: 'arrow' },
    { code: 'ArrowDown', legend: '↓', kind: 'arrow' },
    { code: 'ArrowRight', legend: '→', kind: 'arrow' },
  ],
] as const satisfies readonly (readonly KeyboardKeySpec[])[];

export type KeyboardCode = (typeof rows)[number][number]['code'];

export type KeyboardKey = Readonly<{
  code: KeyboardCode;
  legend: string;
  shiftLegend?: string;
  kind: KeyboardKeyKind;
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  hue: number;
  neighbors: readonly KeyboardCode[];
}>;

const unit = 56;
const gap = 7;
const keyHeight = 50;
const rowGap = 8;

type PositionedKey = Omit<KeyboardKey, 'xPercent' | 'yPercent' | 'widthPercent' | 'heightPercent' | 'hue' | 'neighbors'>;

const positionedRows: PositionedKey[][] = rows.map((row, rowIndex) => {
  let x = 0;

  return row.map((rawSpec, column) => {
    const spec: KeyboardKeySpec = rawSpec;
    const width = (spec.units ?? 1) * unit;
    const key: PositionedKey = {
      code: spec.code as KeyboardCode,
      legend: spec.legend,
      shiftLegend: spec.shiftLegend,
      kind: spec.kind,
      row: rowIndex,
      column,
      x,
      y: rowIndex * (keyHeight + rowGap),
      width,
      height: keyHeight,
    };

    x += width + gap;
    return key;
  });
});

const contentWidth = Math.max(...positionedRows.map((row) => {
  const lastKey = row.at(-1);
  return lastKey ? lastKey.x + lastKey.width : 0;
}));
const contentHeight = rows.length * keyHeight + (rows.length - 1) * rowGap;

const centerX = (key: PositionedKey) => key.x + key.width / 2;

function findNeighbors(key: PositionedKey): KeyboardCode[] {
  const sameRow = positionedRows[key.row];
  const neighbors = [sameRow[key.column - 1]?.code, sameRow[key.column + 1]?.code]
    .filter((code): code is KeyboardCode => Boolean(code));

  for (const adjacentRowIndex of [key.row - 1, key.row + 1]) {
    const adjacentRow = positionedRows[adjacentRowIndex];
    if (!adjacentRow) continue;

    const touching = adjacentRow
      .filter((candidate) => candidate.x <= key.x + key.width + gap && candidate.x + candidate.width >= key.x - gap)
      .sort((a, b) => Math.abs(centerX(a) - centerX(key)) - Math.abs(centerX(b) - centerX(key)))
      .slice(0, 2);

    neighbors.push(...touching.map((candidate) => candidate.code));
  }

  return [...new Set(neighbors)];
}

const neighborSets = new Map<KeyboardCode, Set<KeyboardCode>>(
  positionedRows.flat().map((key) => [key.code, new Set(findNeighbors(key))]),
);

// Adjacency is a physical relationship, so keep it symmetric even where a wide
// key (notably Space) spans more keys than the two closest candidates above it.
for (const [code, neighbors] of neighborSets) {
  for (const neighbor of neighbors) neighborSets.get(neighbor)?.add(code);
}

export const KEYBOARD_LAYOUT: readonly KeyboardKey[] = Object.freeze(positionedRows.flatMap((row) => row.map((key) => Object.freeze({
  ...key,
  xPercent: (key.x / contentWidth) * 100,
  yPercent: (key.y / contentHeight) * 100,
  widthPercent: (key.width / contentWidth) * 100,
  heightPercent: (key.height / contentHeight) * 100,
  hue: Math.round(190 + (centerX(key) / contentWidth) * 225),
  neighbors: Object.freeze([...(neighborSets.get(key.code) ?? [])]),
}))));

export const KEYBOARD_NEIGHBORS: Readonly<Record<KeyboardCode, readonly KeyboardCode[]>> = Object.freeze(
  Object.fromEntries(KEYBOARD_LAYOUT.map((key) => [key.code, key.neighbors])) as Record<KeyboardCode, readonly KeyboardCode[]>,
);

export const KEYBOARD_BOUNDS = Object.freeze({
  width: contentWidth,
  height: contentHeight,
  chassisWidth: contentWidth + 56,
  chassisHeight: contentHeight + 60,
  keyCount: KEYBOARD_LAYOUT.length,
  rowCount: rows.length,
});
