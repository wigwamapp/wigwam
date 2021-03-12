"use strict";

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const webpack = require("webpack");
const loaderUtils = require("loader-utils");
const { ESBuildPlugin, ESBuildMinifyPlugin } = require("esbuild-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const WebpackBar = require("webpackbar");
const pkg = require("./package.json");
const tsConfig = require("./tsconfig.json");

// Steal ENV vars from .env file
dotenv.config();

// Grab default and VIGVAM_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
const VIGVAM_ENV_PATTERN = /^VIGVAM_/i;
const {
  NODE_ENV = "development",
  TARGET_BROWSER = "chrome",
  SOURCE_MAP: SOURCE_MAP_ENV,
  IMAGE_INLINE_SIZE_LIMIT: IMAGE_INLINE_SIZE_LIMIT_ENV = "10000",
} = process.env;
const VERSION = pkg.version;
const ES_TARGET = tsConfig.compilerOptions.target;
const SOURCE_MAP = NODE_ENV !== "production" && SOURCE_MAP_ENV !== "false";
const IMAGE_INLINE_SIZE_LIMIT = parseInt(IMAGE_INLINE_SIZE_LIMIT_ENV);
const CWD_PATH = fs.realpathSync(process.cwd());
const NODE_MODULES_PATH = path.join(CWD_PATH, "node_modules");
const SOURCE_PATH = path.join(CWD_PATH, "src");
const PUBLIC_PATH = path.join(CWD_PATH, "public");
const DEST_PATH = path.join(CWD_PATH, "dist");
const OUTPUT_PATH = path.join(DEST_PATH, `${TARGET_BROWSER}_unpacked`);
const PACKED_EXTENSION = TARGET_BROWSER === "firefox" ? "xpi" : "zip";
const OUTPUT_PACKED_PATH = path.join(
  DEST_PATH,
  `${TARGET_BROWSER}.${PACKED_EXTENSION}`
);

// const MANIFEST_PATH = path.join(PUBLIC_PATH, "manifest.json");
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
    chunks: ["back", NODE_ENV === "development" && "hot-reload"].filter(
      Boolean
    ),
  },
  {
    path: path.join(PUBLIC_PATH, "index.html"),
    chunks: ["index"],
  },
];

module.exports = {
  mode: NODE_ENV,
  bail: NODE_ENV === "production",
  devtool: SOURCE_MAP && "inline-cheap-module-source-map",

  target: ["web", ES_TARGET],

  entry: {
    back: path.join(SOURCE_PATH, "back.ts"),
    content: path.join(SOURCE_PATH, "content.ts"),
    index: path.join(SOURCE_PATH, "index.tsx"),
    ["hot-reload"]:
      NODE_ENV === "development" && path.join(SOURCE_PATH, "hot-reload.ts"),
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

          // Process application JS with ESBuild.
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: SOURCE_PATH,
            loader: require.resolve("esbuild-loader"),
            options: {
              loader: "tsx",
              target: ES_TARGET,
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
      cleanOnceBeforeBuildPatterns: [OUTPUT_PATH, OUTPUT_PACKED_PATH],
      cleanStaleWebpackAssets: false,
      verbose: false,
    }),

    new ForkTsCheckerWebpackPlugin(),

    new ESLintPlugin({
      extensions: ["js", "mjs", "jsx", "ts", "tsx"],
      eslintPath: require.resolve("eslint"),
      failOnError: NODE_ENV === "production",
      context: SOURCE_PATH,
      cache: true,
      cacheLocation: path.resolve(NODE_MODULES_PATH, ".cache/.eslintcache"),
      // ESLint class options
      cwd: CWD_PATH,
      resolvePluginsRelativeTo: __dirname,
    }),

    new CaseSensitivePathsPlugin(),

    new webpack.DefinePlugin({
      SharedArrayBuffer: "_SharedArrayBuffer",
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
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
      name: "",
      color: "#4F46E5",
    }),
  ].filter(Boolean),

  optimization: {
    splitChunks: {
      chunks(chunk) {
        return chunk.name !== "content";
      },
    },
    mergeDuplicateChunks: true,
    runtimeChunk: "single",
    minimize: NODE_ENV === "production",
    minimizer: [
      new ESBuildMinifyPlugin({
        target: ES_TARGET, // Syntax to compile to (see options below for possible values)
      }),
      new CssMinimizerPlugin(),
      new ZipPlugin({
        path: DEST_PATH,
        extension: PACKED_EXTENSION,
        filename: TARGET_BROWSER,
      }),
    ].filter(Boolean),
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
