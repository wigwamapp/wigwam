"use strict";

const path = require("path");

module.exports = {
  process(_code, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    return `module.exports = {
      __esModule: true,
      default: ${assetFilename},
    };`;
  },
};
