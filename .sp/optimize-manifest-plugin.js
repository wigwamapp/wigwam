"use strict";

const { join } = require("path");
const { promises: fs } = require("fs");

module.exports = function (_snowpackConfig, _pluginOptions) {
  return {
    name: "optimize-manifest-plugin",
    async optimize({ buildDirectory }) {
      const filePath = join(buildDirectory, "manifest.json");
      const content = await fs.readFile(filePath, "utf-8");
      const manifest = JSON.parse(content);

      // Remove HMR scripts
      manifest.content_security_policy = manifest.content_security_policy
        .split(" ")
        .filter(
          (item) =>
            ![
              "'sha256-IuAdsMm/zBYzKQ9PHU8+Gm2xlCjV34Cepcl04ifYzUw='",
              "'sha256-JKdiWbFYPWshDThcHMRMPiqX4YP+/vmCU367fFNz29s='",
            ].includes(item)
        )
        .join(" ");

      await fs.writeFile(filePath, JSON.stringify(manifest, null, 2));
    },
  };
};
