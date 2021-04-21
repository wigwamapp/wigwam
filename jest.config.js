module.exports = {
  roots: ["<rootDir>/src"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
  setupFiles: ["jest-webextension-mock"],
  setupFilesAfterEnv: ["<rootDir>/.jest/setup.js"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "<rootDir>/.jest/esbuildTransform.js",
    "^.+\\.css$": "<rootDir>/.jest/cssTransform.js",
    "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)":
      "<rootDir>/.jest/fileTransform.js",
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  moduleDirectories: ["node_modules", "src"],
  modulePaths: [],
  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
  },
  moduleFileExtensions: ["js", "ts", "tsx", "json", "jsx", "node"],
};
