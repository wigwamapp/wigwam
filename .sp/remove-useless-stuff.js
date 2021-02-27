"use strict";

const glob = require("glob");
const rimraf = require("rimraf");

module.exports = function (_snowpackConfig, _pluginOptions) {
  return {
    name: "optimize-manifest-plugin",
    async optimize({ buildDirectory }) {
      const toRemove = await new Promise((res, rej) => {
        glob(
          "{main/*/,build-manifest.json}",
          {
            cwd: buildDirectory,
            absolute: true,
          },
          (err, result) => {
            if (err) return rej(err);
            res(result);
          }
        );
      });

      await Promise.all(
        toRemove.map(
          (path) =>
            new Promise((res, rej) => {
              rimraf(path, (err) => {
                if (err) return rej(err);
                res();
              });
            })
        )
      );
    },
  };
};
