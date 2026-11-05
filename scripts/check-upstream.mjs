// Tells whether Herdr's shipped tab bar changed since this mod was made from it.
//   node scripts/check-upstream.mjs [path/to/herdr-app/home]
// Compares <home>/mods/tabs/main.js (default: $HERDR_APP_HOME, else ~/.config/herdr-app)
// with upstream/tabs-main.js, the copy this mod's main.js was made from. When they differ,
// port Herdr's change into mods/tab-numbers/main.js (keep the "tab-numbers:" lines), then
// copy the new file over upstream/tabs-main.js and update its version in README.md.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = process.argv[2] ?? process.env.HERDR_APP_HOME ?? join(homedir(), ".config", "herdr-app");
const shipped = join(home, "mods", "tabs", "main.js");
const base = join(repo, "upstream", "tabs-main.js");

const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
let now;
try { now = read(shipped); } catch {
  console.error(`No shipped tab bar at ${shipped}. Pass the herdr-app home folder.`);
  process.exit(2);
}
if (now === read(base)) {
  console.log("Herdr's tab bar is unchanged: nothing to port.");
  process.exit(0);
}
console.log(`Herdr's tab bar changed (${shipped}):\n`);
spawnSync("git", ["--no-pager", "diff", "--no-index", "--ignore-cr-at-eol", base, shipped], { stdio: "inherit" });
process.exit(1);
