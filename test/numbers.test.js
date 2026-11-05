import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_MAX, keyLabel, selectKeys, tabNumbers, tooltip } from "../mods/tab-numbers/numbers.js";

const bind = (keys, action, section = "global") => ({ section, keys, action });

test("selectKeys collects tab.select:<n> keys from global and the shown layout", () => {
  const map = selectKeys([
    bind("ctrl-1", "tab.select:1"),
    bind("ctrl-&", "tab.select:1"),
    bind("ctrl-2", "tab.select:2"),
    bind("alt-3", "tab.select:3", "layout:my-layout"),
    bind("alt-4", "tab.select:4", "layout:other"),
    bind("ctrl-5", "tab.select:5", "terminal"),
    bind("ctrl-tab", "tab.next"),
  ], "my-layout");
  assert.deepEqual([...map], [[1, ["ctrl-1", "ctrl-&"]], [2, ["ctrl-2"]], [3, ["alt-3"]]]);
  assert.equal(selectKeys(null, "x").size, 0);
});

test("keyLabel spells keys the way people read them", () => {
  assert.equal(keyLabel("ctrl-1"), "Ctrl+1");
  assert.equal(keyLabel("ctrl-shift-a"), "Ctrl+Shift+A");
  assert.equal(keyLabel("cmd-é"), "Cmd+É");
  assert.equal(keyLabel("ctrl--"), "Ctrl+-");
  assert.equal(keyLabel("ctrl-pagedown"), "Ctrl+pagedown");
});

test("tabNumbers numbers the tabs that have a key, skipping settled ones", () => {
  const keymap = new Map([[1, ["ctrl-1"]], [2, ["ctrl-2"]], [3, ["ctrl-3"]]]);
  const tabs = [{ id: "a" }, { id: "b", settled: true }, { id: "c" }, { id: "d" }, { id: "e" }];
  const out = tabNumbers(tabs, keymap);
  assert.deepEqual([...out].map(([id, { n }]) => [id, n]), [["a", 1], ["c", 2], ["d", 3]]);
  assert.equal(out.has("b"), false, "a settled tab has no number");
  assert.equal(out.has("e"), false, "a tab past the last key has none");
});

test("with no tab.select key bound, tabs 1 to 9 are numbered", () => {
  const tabs = Array.from({ length: 11 }, (_, i) => ({ id: `t${i + 1}` }));
  const out = tabNumbers(tabs, new Map());
  assert.equal(out.size, DEFAULT_MAX);
  assert.deepEqual(out.get("t9"), { n: 9, keys: [] });
});

test("tooltip lists the keys, or names the tab", () => {
  assert.equal(tooltip({ n: 1, keys: ["ctrl-1", "ctrl-&"] }), "Ctrl+1 · Ctrl+&");
  assert.equal(tooltip({ n: 4, keys: [] }), "Tab 4");
});
