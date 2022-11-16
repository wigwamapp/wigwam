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
