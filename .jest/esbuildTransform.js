"use strict";

const path = require("path");
const execa = require("execa");
const esbuildPath = require.resolve("esbuild");
const esbuildBin = path.resolve(esbuildPath, "..", "..", "bin", "esbuild");
const tsConfig = require("../tsconfig.json");

module.exports = {
  process(code, filename) {
    const result = execa.sync(
      esbuildBin,
      [
        `--loader=${path.extname(filename).substr(1)}`,
        "--format=cjs",
        `--target=${tsConfig.compilerOptions.target}`,
      ],
      { input: code }
    );
    return { code: result.stdout };
  },
};
