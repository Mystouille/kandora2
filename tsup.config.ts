import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // Mark node_modules as external by default
  skipNodeModulesBundle: true,
  // But bundle these problematic CJS packages that have ESM interop issues
  noExternal: ["protobufjs", "syanten", "user-agents"],
  // Avoid issues with __dirname in ESM
  shims: true,
  // Handle mixed CJS/ESM
  banner: {
    js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
  },
});
