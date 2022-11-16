document = {};

localStorage = {
  getItem(k) {
    return this[k] ?? null;
  },
  setItem(k, v) {
    this[k] = v;
  },
};

sessionStorage = {
  getItem(k) {
    return this[k] ?? null;
  },
  setItem(k, v) {
    this[k] = v;
  },
};

// const importScriptsOriginal = importScripts;
// globalThis.allScripts = [];

// importScripts = (...paths) => {
//   importScriptsOriginal(...paths);
//   allScripts.push(...paths);
// };
