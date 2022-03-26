"use strict";

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const webpack = require("webpack");
const loaderUtils = require("loader-utils");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const WebpackBar = require("webpackbar");
const hash = require("string-hash");
const pkg = require("./package.json");
const tsConfig = require("./tsconfig.json");

// Steal ENV vars from .env files
const DOTENV_PATH = path.resolve(__dirname, ".env");
const { NODE_ENV = "development" } = process.env;
const ENV_SHORT =
  NODE_ENV === "development"
    ? "dev"
    : NODE_ENV === "production"
    ? "prod"
    : NODE_ENV;

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${DOTENV_PATH}.${ENV_SHORT}.local`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== "test" && `${DOTENV_PATH}.local`,
  `${DOTENV_PATH}.${ENV_SHORT}`,
  DOTENV_PATH,
].filter(Boolean);

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
for (const path of dotenvFiles) {
  if (fs.existsSync(path)) {
    dotenv.config({ path });
  }
}

// Grab default and VIGVAM_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
const VIGVAM_ENV_PATTERN = /^VIGVAM_/i;
const {
  RELEASE_ENV = "false",
  TARGET_BROWSER = "chrome",
  VIGVAM_WEBSITE_ORIGIN = "",
  SOURCE_MAP: SOURCE_MAP_ENV,
  IMAGE_INLINE_SIZE_LIMIT: IMAGE_INLINE_SIZE_LIMIT_ENV = "10000",
  WEBPACK_ANALYZE = "false",
} = process.env;
const ENV_BADGE = [
  ENV_SHORT === "prod" ? null : ENV_SHORT,
  RELEASE_ENV === "true" ? null : "staging",
].find(Boolean);
const VERSION = pkg.version;
const ES_TARGET = tsConfig.compilerOptions.target;
const SOURCE_MAP = RELEASE_ENV === "false" && SOURCE_MAP_ENV !== "false";
const IMAGE_INLINE_SIZE_LIMIT = parseInt(IMAGE_INLINE_SIZE_LIMIT_ENV);
const CWD_PATH = fs.realpathSync(process.cwd());
const NODE_MODULES_PATH = path.join(CWD_PATH, "node_modules");
const SOURCE_PATH = path.join(CWD_PATH, "src");
const PUBLIC_PATH = path.join(CWD_PATH, "public");
const DEST_PATH = path.join(CWD_PATH, "dist", ENV_SHORT);
const OUTPUT_PATH = path.join(DEST_PATH, `${TARGET_BROWSER}_unpacked`);
const PACKED_EXTENSION = TARGET_BROWSER === "firefox" ? "xpi" : "zip";
const OUTPUT_PACKED_PATH = path.join(
  DEST_PATH,
  `${TARGET_BROWSER}.${PACKED_EXTENSION}`
);

const MODULE_FILE_EXTENSIONS = [".js", ".mjs", ".jsx", ".ts", ".tsx", ".json"];
const ADDITIONAL_MODULE_PATHS = [
  tsConfig.compilerOptions.baseUrl &&
    path.join(CWD_PATH, tsConfig.compilerOptions.baseUrl),
].filter(Boolean);
const CSS_REGEX = /\.css$/;
const CSS_MODULE_REGEX = /\.module\.css$/;

const HTML_TEMPLATES = [
  {
    path: path.join(PUBLIC_PATH, "back.html"),
    chunks: ["back"],
  },
  {
    path: path.join(PUBLIC_PATH, "main.html"),
    chunks: ["main"],
  },
  {
    path: path.join(PUBLIC_PATH, "popup.html"),
    chunks: ["popup"],
  },
  {
    path: path.join(PUBLIC_PATH, "approve.html"),
    chunks: ["approve"],
  },
];
const SOLO_ENTRIES = ["content", "inpage", "version"];

const entry = (...files) =>
  files.filter(Boolean).map((f) => path.join(SOURCE_PATH, f));

module.exports = {
  mode: NODE_ENV,
  bail: NODE_ENV === "production",
  devtool: SOURCE_MAP && "inline-cheap-module-source-map",

  target: ["web", ES_TARGET],

  entry: {
    back: entry("back.ts", NODE_ENV === "development" && "hot-reload.ts"),
    main: entry("main.tsx", RELEASE_ENV === "false" && "dev-tools.ts"),
    popup: entry("popup.tsx"),
    approve: entry("approve.tsx"),
    content: entry("content.ts"),
    inpage: entry("inpage.ts"),
    version: entry("version.ts"),
  },

  output: {
    path: OUTPUT_PATH,
    pathinfo: NODE_ENV === "development",
    filename: "scripts/[name].js",
    chunkFilename: "scripts/[name].chunk.js",
  },

  resolve: {
    modules: [NODE_MODULES_PATH, ...ADDITIONAL_MODULE_PATHS],
    extensions: MODULE_FILE_EXTENSIONS,
    alias: {
      "@toruslabs/openlogin": require.resolve(
        "@toruslabs/openlogin/dist/openlogin.umd.min.js"
      ),
      "@ethersproject/random": "lib/ethers-random",
      "fuse.js": "fuse.js/dist/fuse.basic.esm.js",
      "argon2-browser": "argon2-browser/dist/argon2-bundled.min.js",
    },
    fallback: {
      process: false,
      path: false,
      fs: false,
      crypto: false,
    },
  },

  module: {
    strictExportPresence: true,

    rules: [
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve("url-loader"),
            options: {
              limit: IMAGE_INLINE_SIZE_LIMIT,
              name: "media/[hash:8].[ext]",
            },
          },

          {
            test: /\.svg$/,
            use: ({ resource }) => [
              {
                loader: require.resolve("@svgr/webpack"),
                options: {
                  prettier: false,
                  svgoConfig: {
                    plugins: [
                      {
                        name: "preset-default",
                        params: {
                          overrides: {
                            removeViewBox: false,
                            cleanupIDs: {
                              prefix: `svg-${hash(resource)}`,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
              {
                loader: require.resolve("url-loader"),
                options: {
                  limit: IMAGE_INLINE_SIZE_LIMIT,
                  name: "media/[hash:8].[ext]",
                },
              },
            ],
          },

          // Process application JS with Sucrase.
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: [SOURCE_PATH],
            loader: require.resolve("@sucrase/webpack-loader"),
            options: {
              transforms: ["jsx", "typescript"],
              production: NODE_ENV === "production",
            },
          },

          // "postcss" loader applies autoprefixer to our CSS.
          // "css" loader resolves paths in CSS and adds assets as dependencies.
          // "style" loader turns CSS into JS modules that inject <style> tags.
          // In production, we use MiniCSSExtractPlugin to extract that CSS
          // to a file, but in development "style" loader enables hot editing
          // of CSS.
          // By default we support CSS Modules with the extension .module.css
          {
            test: CSS_REGEX,
            exclude: CSS_MODULE_REGEX,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: SOURCE_MAP,
              modules: false,
            }),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
          },

          // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
          // using the extension .module.css
          {
            test: CSS_MODULE_REGEX,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: SOURCE_MAP,
              modules: {
                getLocalIdent: getCSSModuleLocalIdent,
              },
            }),
          },

          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: require.resolve("file-loader"),
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              name: "media/[hash:8].[ext]",
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [OUTPUT_PATH, OUTPUT_PACKED_PATH],
      cleanStaleWebpackAssets: false,
      verbose: false,
    }),

    new CaseSensitivePathsPlugin(),

    new webpack.DefinePlugin({
      // for web extensions
      SharedArrayBuffer: "_SharedArrayBuffer",
      // for env vars
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
      "process.env.RELEASE_ENV": JSON.stringify(RELEASE_ENV),
      "process.env.VERSION": JSON.stringify(VERSION),
      "process.env.TARGET_BROWSER": JSON.stringify(TARGET_BROWSER),
      ...(() => {
        const appEnvs = {};
        for (const k of Object.keys(process.env)) {
          if (VIGVAM_ENV_PATTERN.test(k)) {
            appEnvs[`process.env.${k}`] = JSON.stringify(process.env[k]);
          }
        }
        return appEnvs;
      })(),
    }),

    new webpack.ProvidePlugin({
      React: "react",
    }),

    new MiniCssExtractPlugin({
      filename: "styles/[name].css",
      chunkFilename: "styles/[name].chunk.css",
    }),

    ...HTML_TEMPLATES.map(
      (htmlTemplate) =>
        new HtmlWebpackPlugin({
          template: htmlTemplate.path,
          filename: path.basename(htmlTemplate.path),
          chunks: htmlTemplate.chunks,
          inject: "body",
          minify: false,
        })
    ),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: PUBLIC_PATH,
          to: OUTPUT_PATH,
          globOptions: {
            dot: false,
            ignore: ["**/*.html", "**/manifest.json", "**/locales"],
          },
        },
        {
          from: path.join(PUBLIC_PATH, "manifest.json"),
          to: path.join(OUTPUT_PATH, "manifest.json"),
          toType: "file",
          transform: {
            cache: true,
            transformer: (content) => {
              const json = JSON.parse(
                processTemplate(content.toString("utf8"), {
                  pkg,
                  env: ENV_SHORT,
                  envBadge: ENV_BADGE ? `[${ENV_BADGE.toUpperCase()}] ` : "",
                  website: VIGVAM_WEBSITE_ORIGIN,
                })
              );
              const manifest = transformManifestKeys(json, TARGET_BROWSER);
              return JSON.stringify(manifest, null, 2);
            },
          },
        },
        {
          from: path.join(PUBLIC_PATH, "locales/"),
          to: ({ absoluteFilename }) => {
            const name = path.parse(absoluteFilename).name.replace(/-/g, "_");
            return path.join(OUTPUT_PATH, `_locales/${name}/messages.json`);
          },
          transform: {
            cache: true,
            transformer: (content) => {
              const json = JSON.parse(content);
              const extJson = Object.fromEntries(
                Object.entries(json).map(([name, val]) => {
                  const keySet = new Set();
                  const message = val.replace(/{{(.*?)}}/g, (_, key) => {
                    keySet.add(key);
                    return `$${key}$`;
                  });

                  const extVal = { message };
                  if (keySet.size > 0) {
                    extVal.placeholders = Object.fromEntries(
                      Array.from(keySet).map((key, i) => [
                        key,
                        { content: `$${i + 1}` },
                      ])
                    );
                  }

                  return [name, extVal];
                })
              );
              return JSON.stringify(extJson, null, 2);
            },
          },
        },
      ],
    }),

    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: "src/**/*.{js,mjs,jsx,ts,tsx}",
        options: {
          cache: true,
          cacheLocation: path.resolve(NODE_MODULES_PATH, ".cache/.eslintcache"),
          cwd: CWD_PATH,
          resolvePluginsRelativeTo: __dirname,
        },
      },
    }),

    new WebpackBar({
      name: "Vigvam",
      color: "#ffffff",
    }),

    WEBPACK_ANALYZE === "true" && new BundleAnalyzerPlugin(),
  ].filter(Boolean),

  optimization: {
    splitChunks: {
      chunks(chunk) {
        return !SOLO_ENTRIES.includes(chunk.name);
      },
    },
    mergeDuplicateChunks: true,
    runtimeChunk: {
      name: (entrypoint) =>
        SOLO_ENTRIES.includes(entrypoint.name) ? false : "runtime",
    },
    minimize: NODE_ENV === "production",
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 8,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
            // Drop console for release
            drop_console: RELEASE_ENV === "true",
          },
          output: {
            ecma: 8,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
      new ZipPlugin({
        path: DEST_PATH,
        extension: PACKED_EXTENSION,
        filename: TARGET_BROWSER,
      }),
    ],
  },

  node: false,

  // Turn off performance processing because we utilize
  // our own hints via the FileSizeReporter
  performance: false,
};

function getStyleLoaders(cssOptions = {}) {
  return [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: "../",
      },
    },
    {
      loader: require.resolve("css-loader"),
      options: cssOptions,
    },
    {
      loader: require.resolve("postcss-loader"),
      options: {
        postcssOptions: {
          plugins: [
            require("tailwindcss"),
            NODE_ENV === "production" && require("autoprefixer"),
          ].filter(Boolean),
          sourceMap: SOURCE_MAP,
        },
      },
    },
  ].filter(Boolean);
}

function getCSSModuleLocalIdent(context, _localIdentName, localName, options) {
  // Use the filename or folder name, based on some uses the index.js / index.module.(css|scss|sass) project style
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|scss|sass)$/
  )
    ? "[folder]"
    : "[name]";
  // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
  const hash = loaderUtils.getHashDigest(
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    "md5",
    "base64",
    5
  );
  // Use loaderUtils to find the file or folder name
  const className = loaderUtils.interpolateName(
    context,
    fileNameOrFolder + "_" + localName + "__" + hash,
    options
  );
  // Remove the .module that appears in every classname when based on the file and replace all "." with "_".
  return className.replace(".module_", "_").replace(/\./g, "_");
}

/**
 *  Fork of `wext-manifest`
 */
const browserVendors = ["chrome", "firefox", "opera", "edge", "safari"];
const vendorRegExp = new RegExp(
  `^__((?:(?:${browserVendors.join("|")})\\|?)+)__(.*)`
);

const transformManifestKeys = (manifest, vendor) => {
  if (Array.isArray(manifest)) {
    return manifest.map((newManifest) => {
      return transformManifestKeys(newManifest, vendor);
    });
  }

  if (typeof manifest === "object") {
    return Object.entries(manifest).reduce((newManifest, [key, value]) => {
      const match = key.match(vendorRegExp);

      if (match) {
        const vendors = match[1].split("|");

        // Swap key with non prefixed name
        if (vendors.indexOf(vendor) > -1) {
          newManifest[match[2]] = value;
        }
      } else {
        newManifest[key] = transformManifestKeys(value, vendor);
      }

      return newManifest;
    }, {});
  }

  return manifest;
};

function processTemplate(str, mix) {
  return str.replace(/\{{(.*?)\}}/g, (x, key, y) => {
    x = 0;
    y = mix;
    key = key.trim().split(".");
    while (y && x < key.length) {
      y = y[key[x++]];
    }
    return y != null ? y : "";
  });
}
