"use strict";

const { promises: fs } = require("fs");
const glob = require("glob");

module.exports = function (_snowpackConfig, _pluginOptions) {
  return {
    name: "remove-hmrurl-plugin",
    async optimize({ buildDirectory }) {
      const files = await new Promise((res, rej) => {
        glob(
          "**/*.html",
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

      const fileContents = await Promise.all(
        files.map((file) => fs.readFile(file, "utf-8"))
      );

      await Promise.all(
        fileContents.map((fileContent, i) =>
          fs.writeFile(files[i], removeHmrURLScript(fileContent))
        )
      );
    },
  };
};

function removeHmrURLScript(content) {
  return content.replace(
    `<script>window.HMR_WEBSOCKET_URL="ws://localhost:12321"</script>`,
    ""
  );
}
