/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: "/", static: true },
    src: { url: "/main" },
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-typescript",
    [
      "@snowpack/plugin-optimize",
      {
        target: "es2019",
        preloadModules: true,
        preloadCSS: true,
        preloadCSSFileName: "/styles.css",
      },
    ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    // bundle: true,
    // minify: true,
    treeshake: true,
    splitting: true,
    target: "es2019",
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    open: "none",
  },
  buildOptions: {
    metaUrlPath: "meta", // chrome issue with __snowpack__ because _ is reserved for system
  },
};
