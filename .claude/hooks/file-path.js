// Reads the hook JSON from stdin and prints tool_input.file_path (forward slashes).
// Claude Code passes tool info to hooks via stdin, not via env vars.
let s = "";
process.stdin.on("data", (d) => (s += d));
process.stdin.on("end", () => {
  try {
    const p = JSON.parse(s).tool_input.file_path || "";
    process.stdout.write(p.replace(/\\/g, "/"));
  } catch (_) {}
});
