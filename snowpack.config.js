"use strict";

const PROD =
  process.env.NODE_ENV === "production" && !process.argv.includes("--watch");

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: "/", static: true },
    src: { url: "/main" },
  },
  alias: {
    app: "./src/app",
    core: "./src/core",
    lib: "./src/lib",
    "react-query/devtools": PROD
      ? "react-query/devtools"
      : "react-query/devtools/development",
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-typescript",
    "@snowpack/plugin-postcss",
    [
      "@snowpack/plugin-build-script",
      {
        input: ["content.ts"], // files to watch
        output: [".bundle.js"], // files to export
        cmd: [
          "esbuild",
          "$FILE",
          `--define:process.env.NODE_ENV=\'"${process.env.NODE_ENV}"\'`,
          "--bundle",
          PROD && "--minify",
        ]
          .filter(Boolean)
          .join(" "),
      },
    ],
    "./remove-hmrurl-plugin.js",
    "./optimize-manifest-plugin.js",
  ],
  optimize: {
    bundle: PROD,
    minify: PROD,
    treeshake: PROD,
    splitting: PROD,
    target: "es2020",
  },
  devOptions: {
    open: "none",
  },
  buildOptions: {
    metaUrlPath: "meta", // chrome issue with __snowpack__ because _ is reserved for system,
    // sourcemap: !PROD,
  },
};
