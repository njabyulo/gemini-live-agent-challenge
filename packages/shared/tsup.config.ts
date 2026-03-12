import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "consts/index": "src/consts/index.ts",
    "types/index": "src/types/index.ts",
    "utils/index": "src/utils/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
