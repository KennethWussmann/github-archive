import { build } from "esbuild";

void build({
  entryPoints: ["src/start.ts"],
  outfile: "build/index.js",
  bundle: true,
  minify: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  banner: {
    js: "const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;",
  },
  define: {
    "import.meta.url": "__importMetaUrl",
  },
}).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
