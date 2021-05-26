"use strict";

const { transform } = require("sucrase");

module.exports = {
  process(src, filename) {
    const transforms = getTransforms(filename);
    if (transforms !== null) {
      return transform(src, { transforms, filePath: filename }).code;
    } else {
      return src;
    }
  },
};

function getTransforms(filename) {
  if (filename.endsWith(".js") || filename.endsWith(".jsx")) {
    return ["flow", "jsx", "imports", "jest"];
  } else if (filename.endsWith(".ts")) {
    return ["typescript", "imports", "jest"];
  } else if (filename.endsWith(".tsx")) {
    return ["typescript", "jsx", "imports", "jest"];
  }
  return null;
}
