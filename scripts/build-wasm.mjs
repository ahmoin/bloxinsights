import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const crateDir = join(rootDir, "crates", "rbxlx-to-rojo-wasm");
const outDir = join(rootDir, "public", "wasm", "rbxlx-to-rojo");

const result = spawnSync(
  "wasm-pack",
  ["build", "--target", "web", "--out-dir", "pkg", "--release"],
  { cwd: crateDir, stdio: "inherit", shell: true }
);
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

mkdirSync(outDir, { recursive: true });
for (const file of ["rbxlx_to_rojo_wasm.js", "rbxlx_to_rojo_wasm_bg.wasm"]) {
  copyFileSync(join(crateDir, "pkg", file), join(outDir, file));
}

console.log(`Copied wasm build output to ${outDir}`);
