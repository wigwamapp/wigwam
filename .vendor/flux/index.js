// A very simple `flux` implementation
// Used as sub-dependency for `react-json-view`
export class Dispatcher {
  latestId = 0;
  handlers = new Map();

  register(callback) {
    const id = latestId++;
    this.handlers.set(id, callback);
    return id;
  }

  unregister(id) {
    this.handlers.delete(id);
  }

  dispatch(payload) {
    for (const callback of this.handlers.values()) {
      callback(payload);
    }
  }
}
