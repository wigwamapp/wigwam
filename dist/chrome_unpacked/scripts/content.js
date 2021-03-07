(self.webpackChunktaky = self.webpackChunktaky || []).push([
  [998],
  {
    7798: (p, o, t) => {
      "use strict";
      var i = t(231),
        r = t(3385),
        g = t(3437);
      const d = new i.w("CONTENT_SCRIPT");
      (async () => {
        try {
          const A = await d.request(
            { type: g.MessageType.GetWalletStatus },
            5e3
          );
          (0, r.h)(
            (A == null ? void 0 : A.type) === g.MessageType.GetWalletStatus
          ),
            console.info(A.status);
        } catch (A) {
          console.error(A);
        }
      })();
      class P extends null {
        async enable() {}
        async request(u) {}
      }
    },
    549: () => {},
    1463: (p, o, t) => {
      "use strict";
      t.d(o, { P: () => i, Q: () => r });
      var i;
      (function (g) {
        (g[(g.Idle = 0)] = "Idle"),
          (g[(g.Welcome = 1)] = "Welcome"),
          (g[(g.Locked = 2)] = "Locked"),
          (g[(g.Ready = 3)] = "Ready");
      })(i || (i = {}));
      var r;
      (function (g) {
        (g.HD = "HD"),
          (g.Imported = "IMPORTED"),
          (g.Hardware = "HARDWARE"),
          (g.Void = "VOID");
      })(r || (r = {}));
    },
    3437: (p, o, t) => {
      "use strict";
      t.d(o, { Q: () => i.Q, P: () => i.P, MessageType: () => d.C });
      var i = t(1463),
        r = t(549),
        g = t.n(r);
      t.o(r, "MessageType") &&
        t.d(o, {
          MessageType: function () {
            return r.MessageType;
          },
        });
      var d = t(8785);
    },
    8785: (p, o, t) => {
      "use strict";
      t.d(o, { C: () => i });
      var i;
      (function (r) {
        (r.GetWalletStatus = "GET_WALLET_STATUS"),
          (r.WalletStatusUpdated = "WALLET_STATUS_UPDATED"),
          (r.SetupWallet = "SETUP_WALLET"),
          (r.UnlockWallet = "UNLOCK_WALLET"),
          (r.LockWallet = "LOCK_WALLET"),
          (r.AddSeedPhrase = "ADD_SEED_PHRASE"),
          (r.AddAccount = "ADD_ACCOUNT"),
          (r.DeleteAccount = "DELETE_ACCOUNT"),
          (r.GetSeedPhrase = "GET_SEED_PHRASE"),
          (r.GetPrivateKey = "GET_PRIVATE_KEY");
      })(i || (i = {}));
    },
    231: (p, o, t) => {
      "use strict";
      t.d(o, { w: () => d });
      var i = t(9416),
        r = t(716),
        g = t(9812);
      class d {
        constructor(A) {
          (this.port = i.browser.runtime.connect(void 0, { name: A })),
            (this.reqId = 0);
        }
        get name() {
          return this.port.name;
        }
        async request(A, u = 6e4) {
          const E = this.reqId++;
          return (
            this.send({ type: r.G.Req, reqId: E, data: A }),
            new Promise((f, C) => {
              const w = (x) => {
                switch (!0) {
                  case (x == null ? void 0 : x.reqId) !== E:
                    return;
                  case (x == null ? void 0 : x.type) === r.G.Res:
                    f(x.data);
                    break;
                  case (x == null ? void 0 : x.type) === r.G.Err:
                    C((0, g.Fq)(x.data));
                    break;
                }
                this.port.onMessage.removeListener(w);
              };
              this.port.onMessage.addListener(w),
                setTimeout(() => {
                  this.port.onMessage.removeListener(w), C(new g.B());
                }, u);
            })
          );
        }
        onMessage(A) {
          const u = (E) => {
            (E == null ? void 0 : E.type) === r.G.Void && A(E.data);
          };
          return (
            this.port.onMessage.addListener(u),
            () => this.port.onMessage.removeListener(u)
          );
        }
        destroy() {
          this.port.disconnect();
        }
        send(A) {
          this.port.postMessage(A);
        }
      }
    },
    9812: (p, o, t) => {
      "use strict";
      t.d(o, { oK: () => r, Xy: () => P, Fq: () => A, B: () => E });
      var i = t(716);
      const r = Object.values(i.G),
        g = "Unexpected error occured",
        d = "Timeout";
      function P(f) {
        return {
          message: (f == null ? void 0 : f.message) || g,
          data: f == null ? void 0 : f.data,
        };
      }
      function A({ message: f, data: C }) {
        return new u(f, C);
      }
      class u extends Error {
        constructor(C, w) {
          super(C);
          (this.data = w), (this.name = "IntercomError");
        }
      }
      class E extends u {
        constructor() {
          super(d);
          this.name = "IntercomTimeoutError";
        }
      }
    },
    716: (p, o, t) => {
      "use strict";
      t.d(o, { G: () => i });
      var i;
      (function (r) {
        (r.Req = "INTERCOM_REQUEST"),
          (r.Res = "INTERCOM_RESPONSE"),
          (r.Err = "INTERCOM_ERROR"),
          (r.Void = "INTERCOM_VOID");
      })(i || (i = {}));
    },
    3385: (p, o, t) => {
      "use strict";
      t.d(o, { h: () => i });
      function i(g, d, P = r) {
        if (!g) throw new P(d != null ? d : `${g} == true`);
      }
      class r extends Error {
        constructor() {
          super(...arguments);
          this.name = "AssertionError";
        }
      }
    },
    9416: (p, o, t) => {
      "use strict";
      var i;
      (i = { value: !0 }), (o.browser = t(3150));
    },
    3150: function (p, o) {
      var t, i, r;
      (function (g, d) {
        if (!0)
          (i = [p]),
            (t = d),
            (r = typeof t == "function" ? t.apply(o, i) : t),
            r !== void 0 && (p.exports = r);
        else var P;
      })(
        typeof globalThis != "undefined"
          ? globalThis
          : typeof self != "undefined"
          ? self
          : this,
        function (g) {
          "use strict";
          if (
            typeof browser == "undefined" ||
            Object.getPrototypeOf(browser) !== Object.prototype
          ) {
            const d = "The message port closed before a response was received.",
              P =
                "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",
              A = (u) => {
                const E = {
                  alarms: {
                    clear: { minArgs: 0, maxArgs: 1 },
                    clearAll: { minArgs: 0, maxArgs: 0 },
                    get: { minArgs: 0, maxArgs: 1 },
                    getAll: { minArgs: 0, maxArgs: 0 },
                  },
                  bookmarks: {
                    create: { minArgs: 1, maxArgs: 1 },
                    get: { minArgs: 1, maxArgs: 1 },
                    getChildren: { minArgs: 1, maxArgs: 1 },
                    getRecent: { minArgs: 1, maxArgs: 1 },
                    getSubTree: { minArgs: 1, maxArgs: 1 },
                    getTree: { minArgs: 0, maxArgs: 0 },
                    move: { minArgs: 2, maxArgs: 2 },
                    remove: { minArgs: 1, maxArgs: 1 },
                    removeTree: { minArgs: 1, maxArgs: 1 },
                    search: { minArgs: 1, maxArgs: 1 },
                    update: { minArgs: 2, maxArgs: 2 },
                  },
                  browserAction: {
                    disable: {
                      minArgs: 0,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                    enable: {
                      minArgs: 0,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                    getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                    getBadgeText: { minArgs: 1, maxArgs: 1 },
                    getPopup: { minArgs: 1, maxArgs: 1 },
                    getTitle: { minArgs: 1, maxArgs: 1 },
                    openPopup: { minArgs: 0, maxArgs: 0 },
                    setBadgeBackgroundColor: {
                      minArgs: 1,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                    setBadgeText: {
                      minArgs: 1,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                    setIcon: { minArgs: 1, maxArgs: 1 },
                    setPopup: {
                      minArgs: 1,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                    setTitle: {
                      minArgs: 1,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                  },
                  browsingData: {
                    remove: { minArgs: 2, maxArgs: 2 },
                    removeCache: { minArgs: 1, maxArgs: 1 },
                    removeCookies: { minArgs: 1, maxArgs: 1 },
                    removeDownloads: { minArgs: 1, maxArgs: 1 },
                    removeFormData: { minArgs: 1, maxArgs: 1 },
                    removeHistory: { minArgs: 1, maxArgs: 1 },
                    removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                    removePasswords: { minArgs: 1, maxArgs: 1 },
                    removePluginData: { minArgs: 1, maxArgs: 1 },
                    settings: { minArgs: 0, maxArgs: 0 },
                  },
                  commands: { getAll: { minArgs: 0, maxArgs: 0 } },
                  contextMenus: {
                    remove: { minArgs: 1, maxArgs: 1 },
                    removeAll: { minArgs: 0, maxArgs: 0 },
                    update: { minArgs: 2, maxArgs: 2 },
                  },
                  cookies: {
                    get: { minArgs: 1, maxArgs: 1 },
                    getAll: { minArgs: 1, maxArgs: 1 },
                    getAllCookieStores: { minArgs: 0, maxArgs: 0 },
                    remove: { minArgs: 1, maxArgs: 1 },
                    set: { minArgs: 1, maxArgs: 1 },
                  },
                  devtools: {
                    inspectedWindow: {
                      eval: { minArgs: 1, maxArgs: 2, singleCallbackArg: !1 },
                    },
                    panels: {
                      create: { minArgs: 3, maxArgs: 3, singleCallbackArg: !0 },
                      elements: {
                        createSidebarPane: { minArgs: 1, maxArgs: 1 },
                      },
                    },
                  },
                  downloads: {
                    cancel: { minArgs: 1, maxArgs: 1 },
                    download: { minArgs: 1, maxArgs: 1 },
                    erase: { minArgs: 1, maxArgs: 1 },
                    getFileIcon: { minArgs: 1, maxArgs: 2 },
                    open: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                    pause: { minArgs: 1, maxArgs: 1 },
                    removeFile: { minArgs: 1, maxArgs: 1 },
                    resume: { minArgs: 1, maxArgs: 1 },
                    search: { minArgs: 1, maxArgs: 1 },
                    show: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                  },
                  extension: {
                    isAllowedFileSchemeAccess: { minArgs: 0, maxArgs: 0 },
                    isAllowedIncognitoAccess: { minArgs: 0, maxArgs: 0 },
                  },
                  history: {
                    addUrl: { minArgs: 1, maxArgs: 1 },
                    deleteAll: { minArgs: 0, maxArgs: 0 },
                    deleteRange: { minArgs: 1, maxArgs: 1 },
                    deleteUrl: { minArgs: 1, maxArgs: 1 },
                    getVisits: { minArgs: 1, maxArgs: 1 },
                    search: { minArgs: 1, maxArgs: 1 },
                  },
                  i18n: {
                    detectLanguage: { minArgs: 1, maxArgs: 1 },
                    getAcceptLanguages: { minArgs: 0, maxArgs: 0 },
                  },
                  identity: { launchWebAuthFlow: { minArgs: 1, maxArgs: 1 } },
                  idle: { queryState: { minArgs: 1, maxArgs: 1 } },
                  management: {
                    get: { minArgs: 1, maxArgs: 1 },
                    getAll: { minArgs: 0, maxArgs: 0 },
                    getSelf: { minArgs: 0, maxArgs: 0 },
                    setEnabled: { minArgs: 2, maxArgs: 2 },
                    uninstallSelf: { minArgs: 0, maxArgs: 1 },
                  },
                  notifications: {
                    clear: { minArgs: 1, maxArgs: 1 },
                    create: { minArgs: 1, maxArgs: 2 },
                    getAll: { minArgs: 0, maxArgs: 0 },
                    getPermissionLevel: { minArgs: 0, maxArgs: 0 },
                    update: { minArgs: 2, maxArgs: 2 },
                  },
                  pageAction: {
                    getPopup: { minArgs: 1, maxArgs: 1 },
                    getTitle: { minArgs: 1, maxArgs: 1 },
                    hide: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                    setIcon: { minArgs: 1, maxArgs: 1 },
                    setPopup: {
                      minArgs: 1,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                    setTitle: {
                      minArgs: 1,
                      maxArgs: 1,
                      fallbackToNoCallback: !0,
                    },
                    show: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                  },
                  permissions: {
                    contains: { minArgs: 1, maxArgs: 1 },
                    getAll: { minArgs: 0, maxArgs: 0 },
                    remove: { minArgs: 1, maxArgs: 1 },
                    request: { minArgs: 1, maxArgs: 1 },
                  },
                  runtime: {
                    getBackgroundPage: { minArgs: 0, maxArgs: 0 },
                    getPlatformInfo: { minArgs: 0, maxArgs: 0 },
                    openOptionsPage: { minArgs: 0, maxArgs: 0 },
                    requestUpdateCheck: { minArgs: 0, maxArgs: 0 },
                    sendMessage: { minArgs: 1, maxArgs: 3 },
                    sendNativeMessage: { minArgs: 2, maxArgs: 2 },
                    setUninstallURL: { minArgs: 1, maxArgs: 1 },
                  },
                  sessions: {
                    getDevices: { minArgs: 0, maxArgs: 1 },
                    getRecentlyClosed: { minArgs: 0, maxArgs: 1 },
                    restore: { minArgs: 0, maxArgs: 1 },
                  },
                  storage: {
                    local: {
                      clear: { minArgs: 0, maxArgs: 0 },
                      get: { minArgs: 0, maxArgs: 1 },
                      getBytesInUse: { minArgs: 0, maxArgs: 1 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      set: { minArgs: 1, maxArgs: 1 },
                    },
                    managed: {
                      get: { minArgs: 0, maxArgs: 1 },
                      getBytesInUse: { minArgs: 0, maxArgs: 1 },
                    },
                    sync: {
                      clear: { minArgs: 0, maxArgs: 0 },
                      get: { minArgs: 0, maxArgs: 1 },
                      getBytesInUse: { minArgs: 0, maxArgs: 1 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      set: { minArgs: 1, maxArgs: 1 },
                    },
                  },
                  tabs: {
                    captureVisibleTab: { minArgs: 0, maxArgs: 2 },
                    create: { minArgs: 1, maxArgs: 1 },
                    detectLanguage: { minArgs: 0, maxArgs: 1 },
                    discard: { minArgs: 0, maxArgs: 1 },
                    duplicate: { minArgs: 1, maxArgs: 1 },
                    executeScript: { minArgs: 1, maxArgs: 2 },
                    get: { minArgs: 1, maxArgs: 1 },
                    getCurrent: { minArgs: 0, maxArgs: 0 },
                    getZoom: { minArgs: 0, maxArgs: 1 },
                    getZoomSettings: { minArgs: 0, maxArgs: 1 },
                    goBack: { minArgs: 0, maxArgs: 1 },
                    goForward: { minArgs: 0, maxArgs: 1 },
                    highlight: { minArgs: 1, maxArgs: 1 },
                    insertCSS: { minArgs: 1, maxArgs: 2 },
                    move: { minArgs: 2, maxArgs: 2 },
                    query: { minArgs: 1, maxArgs: 1 },
                    reload: { minArgs: 0, maxArgs: 2 },
                    remove: { minArgs: 1, maxArgs: 1 },
                    removeCSS: { minArgs: 1, maxArgs: 2 },
                    sendMessage: { minArgs: 2, maxArgs: 3 },
                    setZoom: { minArgs: 1, maxArgs: 2 },
                    setZoomSettings: { minArgs: 1, maxArgs: 2 },
                    update: { minArgs: 1, maxArgs: 2 },
                  },
                  topSites: { get: { minArgs: 0, maxArgs: 0 } },
                  webNavigation: {
                    getAllFrames: { minArgs: 1, maxArgs: 1 },
                    getFrame: { minArgs: 1, maxArgs: 1 },
                  },
                  webRequest: {
                    handlerBehaviorChanged: { minArgs: 0, maxArgs: 0 },
                  },
                  windows: {
                    create: { minArgs: 0, maxArgs: 1 },
                    get: { minArgs: 1, maxArgs: 2 },
                    getAll: { minArgs: 0, maxArgs: 1 },
                    getCurrent: { minArgs: 0, maxArgs: 1 },
                    getLastFocused: { minArgs: 0, maxArgs: 1 },
                    remove: { minArgs: 1, maxArgs: 1 },
                    update: { minArgs: 2, maxArgs: 2 },
                  },
                };
                if (Object.keys(E).length === 0)
                  throw new Error(
                    "api-metadata.json has not been included in browser-polyfill"
                  );
                class f extends WeakMap {
                  constructor(s, a = void 0) {
                    super(a);
                    this.createItem = s;
                  }
                  get(s) {
                    return (
                      this.has(s) || this.set(s, this.createItem(s)),
                      super.get(s)
                    );
                  }
                }
                const C = (e) =>
                    e && typeof e == "object" && typeof e.then == "function",
                  w = (e, s) => (...a) => {
                    u.runtime.lastError
                      ? e.reject(u.runtime.lastError)
                      : s.singleCallbackArg ||
                        (a.length <= 1 && s.singleCallbackArg !== !1)
                      ? e.resolve(a[0])
                      : e.resolve(a);
                  },
                  x = (e) => (e == 1 ? "argument" : "arguments"),
                  W = (e, s) =>
                    function (m, ...c) {
                      if (c.length < s.minArgs)
                        throw new Error(
                          `Expected at least ${s.minArgs} ${x(
                            s.minArgs
                          )} for ${e}(), got ${c.length}`
                        );
                      if (c.length > s.maxArgs)
                        throw new Error(
                          `Expected at most ${s.maxArgs} ${x(
                            s.maxArgs
                          )} for ${e}(), got ${c.length}`
                        );
                      return new Promise((_, h) => {
                        if (s.fallbackToNoCallback)
                          try {
                            m[e](...c, w({ resolve: _, reject: h }, s));
                          } catch (n) {
                            console.warn(
                              `${e} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,
                              n
                            ),
                              m[e](...c),
                              (s.fallbackToNoCallback = !1),
                              (s.noCallback = !0),
                              _();
                          }
                        else
                          s.noCallback
                            ? (m[e](...c), _())
                            : m[e](...c, w({ resolve: _, reject: h }, s));
                      });
                    },
                  D = (e, s, a) =>
                    new Proxy(s, {
                      apply(m, c, _) {
                        return a.call(c, e, ..._);
                      },
                    });
                let M = Function.call.bind(Object.prototype.hasOwnProperty);
                const R = (e, s = {}, a = {}) => {
                    let m = Object.create(null),
                      c = {
                        has(h, n) {
                          return n in e || n in m;
                        },
                        get(h, n, b) {
                          if (n in m) return m[n];
                          if (!(n in e)) return;
                          let l = e[n];
                          if (typeof l == "function")
                            if (typeof s[n] == "function") l = D(e, e[n], s[n]);
                            else if (M(a, n)) {
                              let v = W(n, a[n]);
                              l = D(e, e[n], v);
                            } else l = l.bind(e);
                          else if (
                            typeof l == "object" &&
                            l !== null &&
                            (M(s, n) || M(a, n))
                          )
                            l = R(l, s[n], a[n]);
                          else if (M(a, "*")) l = R(l, s[n], a["*"]);
                          else
                            return (
                              Object.defineProperty(m, n, {
                                configurable: !0,
                                enumerable: !0,
                                get() {
                                  return e[n];
                                },
                                set(v) {
                                  e[n] = v;
                                },
                              }),
                              l
                            );
                          return (m[n] = l), l;
                        },
                        set(h, n, b, l) {
                          return n in m ? (m[n] = b) : (e[n] = b), !0;
                        },
                        defineProperty(h, n, b) {
                          return Reflect.defineProperty(m, n, b);
                        },
                        deleteProperty(h, n) {
                          return Reflect.deleteProperty(m, n);
                        },
                      },
                      _ = Object.create(e);
                    return new Proxy(_, c);
                  },
                  S = (e) => ({
                    addListener(s, a, ...m) {
                      s.addListener(e.get(a), ...m);
                    },
                    hasListener(s, a) {
                      return s.hasListener(e.get(a));
                    },
                    removeListener(s, a) {
                      s.removeListener(e.get(a));
                    },
                  });
                let L = !1;
                const I = new f((e) =>
                    typeof e != "function"
                      ? e
                      : function (a, m, c) {
                          let _ = !1,
                            h,
                            n = new Promise((y) => {
                              h = function (T) {
                                L ||
                                  (console.warn(P, new Error().stack),
                                  (L = !0)),
                                  (_ = !0),
                                  y(T);
                              };
                            }),
                            b;
                          try {
                            b = e(a, m, h);
                          } catch (y) {
                            b = Promise.reject(y);
                          }
                          const l = b !== !0 && C(b);
                          if (b !== !0 && !l && !_) return !1;
                          const v = (y) => {
                            y.then(
                              (T) => {
                                c(T);
                              },
                              (T) => {
                                let O;
                                T &&
                                (T instanceof Error ||
                                  typeof T.message == "string")
                                  ? (O = T.message)
                                  : (O = "An unexpected error occurred"),
                                  c({
                                    __mozWebExtensionPolyfillReject__: !0,
                                    message: O,
                                  });
                              }
                            ).catch((T) => {
                              console.error(
                                "Failed to send onMessage rejected reply",
                                T
                              );
                            });
                          };
                          return v(l ? b : n), !0;
                        }
                  ),
                  U = ({ reject: e, resolve: s }, a) => {
                    u.runtime.lastError
                      ? u.runtime.lastError.message === d
                        ? s()
                        : e(u.runtime.lastError)
                      : a && a.__mozWebExtensionPolyfillReject__
                      ? e(new Error(a.message))
                      : s(a);
                  },
                  N = (e, s, a, ...m) => {
                    if (m.length < s.minArgs)
                      throw new Error(
                        `Expected at least ${s.minArgs} ${x(
                          s.minArgs
                        )} for ${e}(), got ${m.length}`
                      );
                    if (m.length > s.maxArgs)
                      throw new Error(
                        `Expected at most ${s.maxArgs} ${x(
                          s.maxArgs
                        )} for ${e}(), got ${m.length}`
                      );
                    return new Promise((c, _) => {
                      const h = U.bind(null, { resolve: c, reject: _ });
                      m.push(h), a.sendMessage(...m);
                    });
                  },
                  B = {
                    runtime: {
                      onMessage: S(I),
                      onMessageExternal: S(I),
                      sendMessage: N.bind(null, "sendMessage", {
                        minArgs: 1,
                        maxArgs: 3,
                      }),
                    },
                    tabs: {
                      sendMessage: N.bind(null, "sendMessage", {
                        minArgs: 2,
                        maxArgs: 3,
                      }),
                    },
                  },
                  k = {
                    clear: { minArgs: 1, maxArgs: 1 },
                    get: { minArgs: 1, maxArgs: 1 },
                    set: { minArgs: 1, maxArgs: 1 },
                  };
                return (
                  (E.privacy = {
                    network: { "*": k },
                    services: { "*": k },
                    websites: { "*": k },
                  }),
                  R(u, B, E)
                );
              };
            if (
              typeof chrome != "object" ||
              !chrome ||
              !chrome.runtime ||
              !chrome.runtime.id
            )
              throw new Error(
                "This script should only be loaded in a browser extension."
              );
            g.exports = A(chrome);
          } else g.exports = browser;
        }
      );
    },
  },
  0,
  [[7798, 666]],
]);
