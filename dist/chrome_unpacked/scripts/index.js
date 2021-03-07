(self.webpackChunktaky = self.webpackChunktaky || []).push([
  [826],
  {
    549: () => {},
    1463: (p, i, t) => {
      "use strict";
      t.d(i, { P: () => r, Q: () => a });
      var r;
      (function (o) {
        (o[(o.Idle = 0)] = "Idle"),
          (o[(o.Welcome = 1)] = "Welcome"),
          (o[(o.Locked = 2)] = "Locked"),
          (o[(o.Ready = 3)] = "Ready");
      })(r || (r = {}));
      var a;
      (function (o) {
        (o.HD = "HD"),
          (o.Imported = "IMPORTED"),
          (o.Hardware = "HARDWARE"),
          (o.Void = "VOID");
      })(a || (a = {}));
    },
    3437: (p, i, t) => {
      "use strict";
      t.d(i, { Q: () => r.Q, P: () => r.P, MessageType: () => v.C });
      var r = t(1463),
        a = t(549),
        o = t.n(a);
      t.o(a, "MessageType") &&
        t.d(i, {
          MessageType: function () {
            return a.MessageType;
          },
        });
      var v = t(8785);
    },
    8785: (p, i, t) => {
      "use strict";
      t.d(i, { C: () => r });
      var r;
      (function (a) {
        (a.GetWalletStatus = "GET_WALLET_STATUS"),
          (a.WalletStatusUpdated = "WALLET_STATUS_UPDATED"),
          (a.SetupWallet = "SETUP_WALLET"),
          (a.UnlockWallet = "UNLOCK_WALLET"),
          (a.LockWallet = "LOCK_WALLET"),
          (a.AddSeedPhrase = "ADD_SEED_PHRASE"),
          (a.AddAccount = "ADD_ACCOUNT"),
          (a.DeleteAccount = "DELETE_ACCOUNT"),
          (a.GetSeedPhrase = "GET_SEED_PHRASE"),
          (a.GetPrivateKey = "GET_PRIVATE_KEY");
      })(r || (r = {}));
    },
    4002: (p, i, t) => {
      "use strict";
      var r = t(231),
        a = t(3385),
        o = t(3437);
      const v = new r.w("UI");
      (async () => {
        try {
          const n = await v.request({ type: o.MessageType.GetWalletStatus });
          (0, a.h)(
            (n == null ? void 0 : n.type) === o.MessageType.GetWalletStatus
          ),
            console.info(n.status);
        } catch (n) {
          console.error(n);
        }
      })();
      var e = t(7294),
        m = t(3935),
        d = t(3538);
      const f = { "focus-disabled": "_3O0U7MlDR76tWCyw7J66dG" },
        u = 9,
        h = f["focus-disabled"];
      function y() {
        const n = document.documentElement;
        return n.addEventListener("mousedown", l), s;
        function l() {
          s(), n.classList.add(h), n.addEventListener("keydown", c);
        }
        function c(A) {
          A.which === u && (s(), n.addEventListener("mousedown", l));
        }
        function s() {
          n.classList.remove(h),
            n.removeEventListener("keydown", c),
            n.removeEventListener("mousedown", l);
        }
      }
      var E = t(8767),
        M = t(938),
        b = t(8279),
        x = t(8679),
        O = t(1330),
        D = t(2593),
        _ = t(7616),
        R = t(6010),
        g = Object.prototype.hasOwnProperty,
        C = Object.getOwnPropertySymbols,
        N = Object.prototype.propertyIsEnumerable,
        S = Object.assign,
        I = (n, l) => {
          var c = {};
          for (var s in n) g.call(n, s) && l.indexOf(s) < 0 && (c[s] = n[s]);
          if (n != null && C)
            for (var s of C(n))
              l.indexOf(s) < 0 && N.call(n, s) && (c[s] = n[s]);
          return c;
        };
      const U = (n) => {
          var { className: l, children: c } = n,
            s = I(n, ["className", "children"]);
          return e.createElement(
            "div",
            S({ className: (0, R.Z)("w-full max-w-6xl mx-auto px-4", l) }, s),
            c
          );
        },
        W = ({ children: n }) => {
          const [l, c] = e.useState(!0),
            s = e.useCallback(() => {
              c(!1);
            }, [c]);
          return e.createElement(
            "div",
            {
              className: (0, R.Z)(
                l && "animate-bootfadein",
                "min-h-screen flex flex-col"
              ),
              onAnimationEnd: l ? s : void 0,
            },
            e.createElement(
              U,
              null,
              e.createElement(
                "header",
                { className: "flex items-center py-8" },
                e.createElement(
                  "h1",
                  { className: "font-semibold text-xl" },
                  "Header"
                )
              ),
              e.createElement("main", null, n)
            )
          );
        },
        B = () =>
          e.createElement(
            W,
            null,
            e.createElement(
              "div",
              { className: "py-8" },
              e.createElement(
                "h1",
                { className: "text-4xl font-bold text-brand-primary" },
                "Hello!"
              ),
              e.createElement(F, null),
              e.createElement(
                "div",
                { className: "my-4" },
                _.bM(D.O$.from("10000000"))
              )
            )
          ),
        L = [
          "Wade Cooper",
          "Arlene Mccoy",
          "Devon Webb",
          "Tom Cook",
          "Tanya Fox",
          "Hellen Schmidt",
          "Caroline Schultz",
          "Mason Heaney",
          "Claudie Smitham",
          "Emil Schaefer",
        ],
        F = () => {
          const [n, l] = (0, e.useState)(L[0]);
          return e.createElement(
            "div",
            { className: "py-12" },
            e.createElement(
              "div",
              { className: "w-full max-w-xs" },
              e.createElement(
                O.Ri,
                { as: "div", className: "space-y-1", value: n, onChange: l },
                ({ open: c }) =>
                  e.createElement(
                    e.Fragment,
                    null,
                    e.createElement(
                      O.Ri.Label,
                      { className: "block text-sm leading-5 font-medium" },
                      "Assigned to"
                    ),
                    e.createElement(
                      "div",
                      { className: "relative" },
                      e.createElement(
                        "span",
                        {
                          className: "inline-block w-full rounded-md shadow-sm",
                        },
                        e.createElement(
                          O.Ri.Button,
                          {
                            className:
                              "cursor-default relative w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 text-left focus:outline-none focus:shadow-outline-blue focus:border-brand-primary transition ease-in-out duration-150 sm:text-sm sm:leading-5",
                          },
                          e.createElement(
                            "span",
                            { className: "block truncate" },
                            n
                          ),
                          e.createElement(
                            "span",
                            {
                              className:
                                "absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none",
                            },
                            e.createElement(
                              "svg",
                              {
                                className: "h-5 w-5 text-gray-400",
                                viewBox: "0 0 20 20",
                                fill: "none",
                                stroke: "currentColor",
                              },
                              e.createElement("path", {
                                d: "M7 7l3-3 3 3m0 6l-3 3-3-3",
                                strokeWidth: "1.5",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                              })
                            )
                          )
                        )
                      ),
                      e.createElement(
                        O.uT,
                        {
                          show: c,
                          leave: "transition ease-in duration-100",
                          leaveFrom: "opacity-100",
                          leaveTo: "opacity-0",
                          className:
                            "absolute mt-1 w-full rounded-md bg-white dark:bg-brand-darkover shadow-lg",
                        },
                        e.createElement(
                          O.Ri.Options,
                          {
                            static: !0,
                            className:
                              "max-h-60 rounded-md py-1 text-base leading-6 shadow-xs overflow-auto focus:outline-none sm:text-sm sm:leading-5",
                          },
                          L.map((s) =>
                            e.createElement(
                              O.Ri.Option,
                              { key: s, value: s },
                              ({ selected: A, active: w }) =>
                                e.createElement(
                                  "div",
                                  {
                                    className: `${
                                      w
                                        ? "text-white bg-blue-600"
                                        : "text-brand-darktext dark:text-white"
                                    } cursor-default select-none relative py-2 pl-8 pr-4`,
                                  },
                                  e.createElement(
                                    "span",
                                    {
                                      className: `${
                                        A ? "font-semibold" : "font-normal"
                                      } block truncate`,
                                    },
                                    s
                                  ),
                                  A &&
                                    e.createElement(
                                      "span",
                                      {
                                        className: `${
                                          w ? "text-white" : "text-blue-600"
                                        } absolute inset-y-0 left-0 flex items-center pl-1.5`,
                                      },
                                      e.createElement(
                                        "svg",
                                        {
                                          className: "h-5 w-5",
                                          xmlns: "http://www.w3.org/2000/svg",
                                          viewBox: "0 0 20 20",
                                          fill: "currentColor",
                                        },
                                        e.createElement("path", {
                                          fillRule: "evenodd",
                                          d:
                                            "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                          clipRule: "evenodd",
                                        })
                                      )
                                    )
                                )
                            )
                          )
                        )
                      )
                    )
                  )
              )
            )
          );
        },
        G = d.F0.createMap([
          ["/", () => e.createElement(B, null)],
          ["*", () => e.createElement(d.l_, { to: "/" })],
        ]),
        k = new x.S({
          defaultOptions: {
            queries: { suspense: !0, refetchOnWindowFocus: !1 },
          },
        }),
        K = [["Inter", [300, 400, 600, 700]]];
      var H = t(5800),
        Q = Object.assign;
      const j = (n) =>
        e.createElement(
          H.ErrorBoundary,
          Q(
            {
              fallbackRender: ({ resetErrorBoundary: l }) =>
                e.createElement(
                  "div",
                  null,
                  "There was an error!",
                  e.createElement("button", { onClick: () => l() }, "Try again")
                ),
            },
            n
          )
        );
      var V = t(7347),
        P = t.n(V);
      const z = {},
        $ = ({ fonts: n }) => {
          const l = (0, e.useCallback)(async () => {
            try {
              const c = [];
              for (const s of n)
                if (Array.isArray(s)) {
                  const [A, w] = s;
                  for (const J of w) c.push(new (P())(A, { weight: J }));
                } else c.push(new (P())(s));
              await Promise.all(c.map((s) => s.load(void 0, 5e3)));
            } catch (c) {
              z.env.SNOWPACK_PUBLIC_DEBUG === "true" && console.error(c);
            } finally {
              return null;
            }
          }, [n]);
          return (
            (0, E.useQuery)(["fonts", { fonts: n }], l, {
              retry: !1,
              refetchOnWindowFocus: !1,
              refetchOnReconnect: !1,
              refetchOnMount: !1,
            }),
            null
          );
        },
        Y = () => {
          const { trigger: n, pathname: l } = (0, d.TH)();
          return (
            (0, e.useLayoutEffect)(() => {
              n === d.lC.Push && window.scrollTo(0, 0);
            }, [n, l]),
            (0, e.useMemo)(() => d.F0.resolve(G, l, null), [l])
          );
        },
        Z = () =>
          e.createElement(
            d.vR,
            null,
            e.createElement(
              E.QueryClientProvider,
              { client: k },
              e.createElement(
                e.Fragment,
                null,
                e.createElement(
                  j,
                  null,
                  e.createElement(
                    e.Suspense,
                    { fallback: null },
                    e.createElement($, { fonts: K }),
                    e.createElement(Y, null)
                  )
                ),
                e.createElement(b.x7, null),
                e.createElement(M.ReactQueryDevtools, null)
              )
            )
          ),
        T = {};
      (0, d.Fp)(),
        y(),
        (0, m.render)(
          e.createElement(e.StrictMode, null, e.createElement(Z, null)),
          document.getElementById("root")
        ),
        T.hot && T.hot.accept();
    },
    231: (p, i, t) => {
      "use strict";
      t.d(i, { w: () => v });
      var r = t(9416),
        a = t(716),
        o = t(9812);
      class v {
        constructor(m) {
          (this.port = r.browser.runtime.connect(void 0, { name: m })),
            (this.reqId = 0);
        }
        get name() {
          return this.port.name;
        }
        async request(m, d = 6e4) {
          const f = this.reqId++;
          return (
            this.send({ type: a.G.Req, reqId: f, data: m }),
            new Promise((u, h) => {
              const y = (E) => {
                switch (!0) {
                  case (E == null ? void 0 : E.reqId) !== f:
                    return;
                  case (E == null ? void 0 : E.type) === a.G.Res:
                    u(E.data);
                    break;
                  case (E == null ? void 0 : E.type) === a.G.Err:
                    h((0, o.Fq)(E.data));
                    break;
                }
                this.port.onMessage.removeListener(y);
              };
              this.port.onMessage.addListener(y),
                setTimeout(() => {
                  this.port.onMessage.removeListener(y), h(new o.B());
                }, d);
            })
          );
        }
        onMessage(m) {
          const d = (f) => {
            (f == null ? void 0 : f.type) === a.G.Void && m(f.data);
          };
          return (
            this.port.onMessage.addListener(d),
            () => this.port.onMessage.removeListener(d)
          );
        }
        destroy() {
          this.port.disconnect();
        }
        send(m) {
          this.port.postMessage(m);
        }
      }
    },
    9812: (p, i, t) => {
      "use strict";
      t.d(i, { oK: () => a, Xy: () => e, Fq: () => m, B: () => f });
      var r = t(716);
      const a = Object.values(r.G),
        o = "Unexpected error occured",
        v = "Timeout";
      function e(u) {
        return {
          message: (u == null ? void 0 : u.message) || o,
          data: u == null ? void 0 : u.data,
        };
      }
      function m({ message: u, data: h }) {
        return new d(u, h);
      }
      class d extends Error {
        constructor(h, y) {
          super(h);
          (this.data = y), (this.name = "IntercomError");
        }
      }
      class f extends d {
        constructor() {
          super(v);
          this.name = "IntercomTimeoutError";
        }
      }
    },
    716: (p, i, t) => {
      "use strict";
      t.d(i, { G: () => r });
      var r;
      (function (a) {
        (a.Req = "INTERCOM_REQUEST"),
          (a.Res = "INTERCOM_RESPONSE"),
          (a.Err = "INTERCOM_ERROR"),
          (a.Void = "INTERCOM_VOID");
      })(r || (r = {}));
    },
    3385: (p, i, t) => {
      "use strict";
      t.d(i, { h: () => r });
      function r(o, v, e = a) {
        if (!o) throw new e(v != null ? v : `${o} == true`);
      }
      class a extends Error {
        constructor() {
          super(...arguments);
          this.name = "AssertionError";
        }
      }
    },
    2574: () => {},
  },
  0,
  [[4002, 666, 425, 120]],
]);
