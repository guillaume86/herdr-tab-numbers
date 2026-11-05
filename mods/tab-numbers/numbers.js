// Which tab carries which number, kept free of Herdr imports so Node's test runner can
// load this file directly (see test/numbers.test.js).

/** @typedef {{ section: string, keys: string, action: string }} Binding */
/** @typedef {{ id: string, settled?: boolean }} Tab */

/** Without any `tab.select:<n>` key (keys() not loaded, or none bound): number these. */
export const DEFAULT_MAX = 9;

/**
 * The keys that select each tab number: `tab.select:<n>` bindings in `global` or the shown
 * layout's own section (`layout:<name>`). Other sections (a mod's, `terminal`) only apply
 * while something else has focus, so they don't make a number a shortcut.
 * @param {Binding[] | null | undefined} bindings
 * @param {string | null | undefined} layoutName
 * @returns {Map<number, string[]>}
 */
export function selectKeys(bindings, layoutName) {
  /** @type {Map<number, string[]>} */
  const out = new Map();
  for (const b of bindings ?? []) {
    if (b?.section !== "global" && b?.section !== `layout:${layoutName}`) continue;
    const m = /^tab\.select:(\d+)$/.exec(String(b.action ?? "").trim());
    if (!m) continue;
    const n = Number(m[1]);
    if (!out.has(n)) out.set(n, []);
    out.get(n).push(String(b.keys));
  }
  return out;
}

const MODIFIERS = { ctrl: "Ctrl", shift: "Shift", alt: "Alt", cmd: "Cmd", super: "Super", fn: "Fn" };

/**
 * A key as people read it: `ctrl-shift-1` -> `Ctrl+Shift+1`, `ctrl--` -> `Ctrl+-`.
 * @param {string} key
 */
export function keyLabel(key) {
  const parts = String(key).split(/-(?=.)/);
  return parts.map((p, i) => (i < parts.length - 1 ? MODIFIERS[p] ?? p : p.length === 1 ? p.toUpperCase() : p)).join("+");
}

/**
 * Each tab's number and the keys that reach it, in the order the tab bar shows them.
 * `tab.select:<n>` counts tabs that aren't settled, so settled ones get no number and
 * don't use one up. A number with no key gets no badge, unless no `tab.select` key is
 * bound at all: then tabs 1 to DEFAULT_MAX are numbered.
 * @param {Tab[]} tabs
 * @param {Map<number, string[]>} keymap
 * @returns {Map<string, { n: number, keys: string[] }>}
 */
export function tabNumbers(tabs, keymap) {
  /** @type {Map<string, { n: number, keys: string[] }>} */
  const out = new Map();
  let n = 0;
  for (const tab of tabs ?? []) {
    if (tab.settled) continue;
    n += 1;
    const keys = keymap.get(n);
    if (keys) out.set(tab.id, { n, keys });
    else if (!keymap.size && n <= DEFAULT_MAX) out.set(tab.id, { n, keys: [] });
  }
  return out;
}

/**
 * The badge's tooltip: `Ctrl+1 · Ctrl+&`, or the number alone without keys.
 * @param {{ n: number, keys: string[] }} entry
 */
export function tooltip(entry) {
  return entry.keys.length ? entry.keys.map(keyLabel).join(" · ") : `Tab ${entry.n}`;
}
