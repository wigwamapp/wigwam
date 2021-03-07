"use strict";

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const { ESBuildPlugin, ESBuildMinifyPlugin } = require("esbuild-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackBar = require("webpackbar");
const pkg = require("./package.json");
const tsConfig = require("./tsconfig.json");

const {
  NODE_ENV = "development",
  TARGET_BROWSER = "chrome",
  SOURCE_MAP: SOURCE_MAP_ENV,
  IMAGE_INLINE_SIZE_LIMIT: IMAGE_INLINE_SIZE_LIMIT_ENV = "10000",
} = process.env;
const VERSION = pkg.version;
const SOURCE_MAP = NODE_ENV !== "production" && SOURCE_MAP_ENV !== "false";
const IMAGE_INLINE_SIZE_LIMIT = parseInt(IMAGE_INLINE_SIZE_LIMIT_ENV);
const CWD_PATH = fs.realpathSync(process.cwd());
const NODE_MODULES_PATH = path.join(CWD_PATH, "node_modules");
const SOURCE_PATH = path.join(CWD_PATH, "src");
const PUBLIC_PATH = path.join(CWD_PATH, "public");
const DEST_PATH = path.join(CWD_PATH, "dist");
const OUTPUT_PATH = path.join(DEST_PATH, `${TARGET_BROWSER}_unpacked`);
const MANIFEST_PATH = path.join(PUBLIC_PATH, "manifest.json");
const MODULE_FILE_EXTENSIONS = [".js", ".mjs", ".jsx", ".ts", ".tsx", ".json"];
const ADDITIONAL_MODULE_PATHS = [
  tsConfig.compilerOptions.baseUrl &&
    path.join(CWD_PATH, tsConfig.compilerOptions.baseUrl),
].filter(Boolean);
const CSS_REGEX = /\.css$/;
const CSS_MODULE_REGEX = /\.module\.css$/;

const HTML_TEMPLATES = [
  // {
  //   path: path.join(PUBLIC_PATH, "popup.html"),
  //   chunks: ["popup"],
  // },
  {
    path: path.join(PUBLIC_PATH, "index.html"),
    chunks: ["index"],
  },
  {
    path: path.join(PUBLIC_PATH, "back.html"),
    chunks: ["back"],
  },
];

module.exports = {
  mode: NODE_ENV,
  bail: NODE_ENV === "production",
  devtool: SOURCE_MAP && "inline-cheap-module-source-map",

  target: ["web", "es2017"],

  entry: {
    back: path.join(SOURCE_PATH, "back.ts"),
    content: path.join(SOURCE_PATH, "content.ts"),
    index: path.join(SOURCE_PATH, "index.tsx"),
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
  },

  module: {
    strictExportPresence: true,

    rules: [
      { parser: { requireEnsure: false } },

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

          // Process application JS with Babel.
          // The preset includes JSX, Flow, TypeScript, and some ESnext features.
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: SOURCE_PATH,
            loader: require.resolve("esbuild-loader"),
            options: {
              loader: "tsx",
              target: "es2017",
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
              // modules: {
              //   getLocalIdent: getCSSModuleLocalIdent,
              // },
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
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
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
      cleanOnceBeforeBuildPatterns: [OUTPUT_PATH /*, OUTPUT_PACKED_PATH*/],
      cleanStaleWebpackAssets: false,
      verbose: false,
    }),

    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
      "process.env.VERSION": JSON.stringify(VERSION),
      "process.env.TARGET_BROWSER": JSON.stringify(TARGET_BROWSER),
    }),

    new ESBuildPlugin(),

    new MiniCssExtractPlugin({
      filename: "styles/[name].css",
      chunkFilename: "styles/[name].chunk.css",
    }),

    ...HTML_TEMPLATES.map(
      (htmlTemplate) =>
        new HtmlWebpackPlugin({
          template: htmlTemplate.path,
          filename: path.basename(htmlTemplate.path),
          chunks: ["runtime", ...htmlTemplate.chunks],
          inject: "body",
          ...(NODE_ENV === "production"
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : {}),
        })
    ),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: PUBLIC_PATH,
          to: OUTPUT_PATH,
          globOptions: {
            dot: false,
            ignore: ["**/*.html"],
          },
        },
        // {
        //   from: MANIFEST_PATH,
        //   to: path.join(OUTPUT_PATH, "manifest.json"),
        //   toType: "file",
        //   // transform: (content) =>
        //   //   wextManifest[TARGET_BROWSER](JSON.parse(content)).content,
        // },
      ],
    }),

    new WebpackBar({
      name: "Taky",
      color: "#355DFF",
    }),
  ],

  optimization: {
    splitChunks: {
      //chunks: "all"
      chunks(chunk) {
        // exclude `my-excluded-chunk`
        return chunk.name !== "content";
      },
    },
    mergeDuplicateChunks: true,
    runtimeChunk: "single",
    minimize: NODE_ENV === "production",
    minimizer: [
      new ESBuildMinifyPlugin({
        target: "es2017", // Syntax to compile to (see options below for possible values)
      }),
      new CssMinimizerPlugin(),
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
