(self.webpackChunktaky = self.webpackChunktaky || []).push([
  [408],
  {
    9901: (g, h, n) => {
      "use strict";
      var a = n(9416),
        o = n(6176),
        d = n(3385),
        w = n(716),
        P = n(9812);
      class k {
        constructor() {
          (this.ports = new Set()),
            (this.msgHandlers = new Set()),
            a.browser.runtime.onConnect.addListener((e) => {
              this.addPort(e),
                e.onDisconnect.addListener(() => {
                  this.removePort(e);
                });
            }),
            (this.handleMessage = this.handleMessage.bind(this));
        }
        onMessage(e) {
          return this.addMessageHandler(e), () => this.removeMessageHandler(e);
        }
        isConnected(e) {
          return this.ports.has(e);
        }
        handleMessage(e, s) {
          var r, i;
          if (
            ((r = s.sender) == null ? void 0 : r.id) === a.browser.runtime.id &&
            ((i = s.sender) == null ? void 0 : i.frameId) === 0 &&
            P.oK.includes(e == null ? void 0 : e.type)
          ) {
            const u = new M(s, e, this);
            for (const y of this.msgHandlers)
              try {
                y(u);
              } catch (W) {}
          }
        }
        addPort(e) {
          e.onMessage.addListener(this.handleMessage), this.ports.add(e);
        }
        removePort(e) {
          e.onMessage.removeListener(this.handleMessage), this.ports.delete(e);
        }
        addMessageHandler(e) {
          this.msgHandlers.add(e);
        }
        removeMessageHandler(e) {
          this.msgHandlers.delete(e);
        }
      }
      class M {
        constructor(e, s, r) {
          (this.port = e),
            (this.msg = s),
            (this.server = r),
            (this.data = s.data);
        }
        get connected() {
          return this.server.isConnected(this.port);
        }
        get request() {
          return this.msg.type === w.G.Req;
        }
        reply(e) {
          L(this.msg),
            this.port.postMessage({
              type: w.G.Res,
              reqId: this.msg.reqId,
              data: e,
            });
        }
        replyError(e) {
          L(this.msg),
            this.send({
              type: w.G.Err,
              reqId: this.msg.reqId,
              data: (0, P.Xy)(e),
            });
        }
        send(e) {
          this.connected && this.port.postMessage(e);
        }
      }
      function L(t) {
        (0, d.h)(t.type === w.G.Req, "Not allowed for non-request messages");
      }
      var c = n(3437),
        S = n(7314),
        D = n(8586),
        H = n(2768),
        N = n(1421),
        V = n(3286),
        B = n(2455),
        m = n(8764);
      async function q(t, e) {
        const s = JSON.stringify(t),
          r = crypto.getRandomValues(new Uint8Array(16)),
          i = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: r },
            e,
            m.lW.from(s)
          );
        return {
          dt: m.lW.from(i).toString("hex"),
          iv: m.lW.from(r).toString("hex"),
        };
      }
      async function ee({ dt: t, iv: e }, s) {
        const r = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: m.lW.from(e, "hex") },
            s,
            m.lW.from(t, "hex")
          ),
          i = m.lW.from(r).toString();
        return JSON.parse(i);
      }
      function _(t) {
        return crypto.subtle.importKey("raw", m.lW.alloc(32, t), "PBKDF2", !1, [
          "deriveBits",
          "deriveKey",
        ]);
      }
      function Q(t, e) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: e, iterations: 1e4, hash: "SHA-256" },
          t,
          { name: "AES-GCM", length: 256 },
          !1,
          ["encrypt", "decrypt"]
        );
      }
      function te(t = 32) {
        const e = new Uint8Array(t);
        return crypto.getRandomValues(e), e;
      }
      function se() {
        let t = Promise.resolve();
        return (e) =>
          new Promise((s, r) => {
            t = t.then(() => e().then(s).catch(r));
          });
      }
      const A = se();
      async function O(t) {
        const e = await a.browser.storage.local.get([t]);
        return t in e && e[t] !== void 0;
      }
      async function re(t) {
        const e = await a.browser.storage.local.get([t]);
        if (t in e && e[t] !== void 0) return e[t];
        throw new Error("Some storage item not found");
      }
      function Pe(t, e) {
        return j([[t, e]]);
      }
      function j(t) {
        return (
          Array.isArray(t) && (t = Object.fromEntries(t)),
          a.browser.storage.local.set(t)
        );
      }
      function ne(t) {
        return a.browser.storage.local.remove(t);
      }
      function ae() {
        return a.browser.storage.local.clear();
      }
      async function E(t, e) {
        const s = await re(t);
        return ie(s, e);
      }
      async function K(t, e) {
        const s = await Promise.all(
          t.map(async ([r, i]) => {
            const u = await oe(i, e);
            return [r, u];
          })
        );
        await j(s);
      }
      async function oe(t, e) {
        const s = te(),
          r = await Q(e, s);
        return { payload: await q(t, r), salt: m.lW.from(s).toString("hex") };
      }
      async function ie(t, e) {
        const { salt: s, payload: r } = t,
          i = m.lW.from(s, "hex"),
          u = await Q(e, i);
        return ee(r, u);
      }
      var ce = n(3643);
      class f extends Error {
        constructor() {
          super(...arguments);
          this.name = "PublicError";
        }
      }
      async function v(t, e) {
        try {
          return await e(() => {
            throw new Error("<stub>");
          });
        } catch (s) {
          throw s instanceof f ? s : new f(t);
        }
      }
      function X(t) {
        (0, o.match)(t)
          .with({ type: c.Q.HD }, (e) => {
            de(e.derivationPath);
          })
          .with({ type: c.Q.Imported }, (e) => {
            ue(e.privateKey);
          })
          .with({ type: c.Q.Hardware }, (e) => {
            le(e.publicKey);
          });
      }
      function Y({ phrase: t, lang: e }) {
        (0, d.h)(ce.xh(t), "Seed phrase in not valid", f),
          (0, d.h)(e in B.E, "Seed phrase language not supported", f);
      }
      function de(t) {
        if (
          !(() =>
            !(
              !t.startsWith("m") ||
              (t.length > 1 && t[1] !== "/") ||
              !t
                .replace("m", "")
                .split("/")
                .filter(Boolean)
                .every((r) => {
                  const i = +(r.includes("'") ? r.replace("'", "") : r);
                  return Number.isSafeInteger(i) && i >= 0;
                })
            ))()
        )
          throw new f("Derivation path is invalid");
      }
      function ue(t) {
        try {
          new H.Et(t);
        } catch (e) {
          throw new f("Invalid private key");
        }
      }
      function le(t) {
        try {
          N.db(t);
        } catch (e) {
          throw new f("Invalid public key");
        }
      }
      var p;
      (function (t) {
        (t.Check = "check"),
          (t.MigrationLevel = "mgrnlvl"),
          (t.SeedPhrase = "seedphrase"),
          (t.AccPrivKey = "accprivkey"),
          (t.AccPubKey = "accpubkey");
      })(p || (p = {}));
      const z = "v",
        U = [],
        x = G(p.Check),
        T = G(p.MigrationLevel),
        C = G(p.SeedPhrase),
        R = J(p.AccPrivKey),
        b = J(p.AccPubKey);
      function G(t) {
        return F(z, t);
      }
      function J(t) {
        const e = F(z, t);
        return (s) => F(e, s);
      }
      function F(...t) {
        return t.join("_");
      }
      const he = {};
      class l {
        constructor(e) {
          this.passwordKey = e;
        }
        static async unlock(e) {
          const s = await l.toPasswordKey(e);
          return v(
            "Failed to unlock wallet",
            async () => (await l.runMigrations(s), new l(s))
          );
        }
        static async setup(e, s, r) {
          return v("Failed to create wallet", async () => {
            r && Y(r), X(s);
            const i = await _(e);
            return A(async () => {
              await ae(),
                await K(
                  [
                    [x, null],
                    [T, U.length],
                  ],
                  i
                );
              const u = new l(i);
              r && (await u.addSeedPhraseForce(r));
              const y = await u.addAccountForce(s);
              return { vault: u, accountAddress: y };
            });
          });
        }
        static isExist() {
          return O(x);
        }
        static hasSeedPhrase() {
          return O(C);
        }
        static async fetchSeedPhrase(e) {
          const s = await l.toPasswordKey(e);
          return v("Failed to fetch seed phrase", async () => {
            if (!(await l.hasSeedPhrase()))
              throw new f("Seed phrase has not yet been established");
            return E(C, s);
          });
        }
        static async fetchPrivateKey(e, s) {
          const r = await l.toPasswordKey(e);
          return v("Failed to fetch private key", () => E(R(s), r));
        }
        static async deleteAccount(e, s) {
          return (
            await l.toPasswordKey(e),
            v("Failed to delete account", () => A(() => ne([R(s), b(s)])))
          );
        }
        static toPasswordKey(e) {
          return v("Invalid password", async (s) => {
            const r = await _(e);
            return (await E(x, r)) !== null && s(), r;
          });
        }
        static async runMigrations(e) {
          return A(async () => {
            try {
              const r = (await O(T)) ? await E(T, e) : 0,
                i = U.filter((u, y) => y >= r);
              for (const u of i) await u(e);
            } catch (s) {
              he.env.SNOWPACK_PUBLIC_DEBUG === "true" && console.error(s);
            } finally {
              await K([[T, U.length]], e);
            }
          });
        }
        addSeedPhrase(e) {
          return Y(e), A(() => this.addSeedPhraseForce(e));
        }
        addAccount(e) {
          return X(e), A(() => this.addAccountForce(e));
        }
        fetchPublicKey(e) {
          return v("Failed to fetch public key", () =>
            E(b(e), this.passwordKey)
          );
        }
        sign(e, s) {
          return v("Failed to sign", async () => {
            const r = R(e);
            if (!(await O(r))) throw new f("Cannot sign for this account");
            const u = await E(r, this.passwordKey);
            return new H.Et(u).signDigest(s);
          });
        }
        addSeedPhraseForce(e) {
          return v("Failed to add Seed Phrase", async () => {
            if (await l.hasSeedPhrase())
              throw new f("Seed phrase already exists");
            await K([[C, e]], this.passwordKey);
          });
        }
        addAccountForce(e) {
          return v("Failed to add account", () =>
            (0, o.match)(e)
              .exhaustive()
              .with({ type: c.Q.HD }, async (s) => {
                if (!(await l.hasSeedPhrase()))
                  throw new f("Seed phrase has not yet been established");
                const { phrase: i, lang: u } = await E(C, this.passwordKey),
                  {
                    address: y,
                    privateKey: W,
                    publicKey: ge,
                  } = D.w5.fromMnemonic(i, s.derivationPath, B.E[u]);
                return (
                  await K(
                    [
                      [R(y), W],
                      [b(y), ge],
                    ],
                    this.passwordKey
                  ),
                  y
                );
              })
              .with({ type: c.Q.Imported }, async (s) => {
                const { publicKey: r, address: i } = new D.w5(s.privateKey);
                return (
                  await K(
                    [
                      [R(i), s.privateKey],
                      [b(i), r],
                    ],
                    this.passwordKey
                  ),
                  i
                );
              })
              .with({ type: c.Q.Hardware }, async (s) => {
                const r = N.db(V.lE(s.publicKey));
                return await K([[b(r), s.publicKey]], this.passwordKey), r;
              })
              .run()
          );
        }
      }
      async function ye() {
        if (I.getState().status === c.P.Idle) {
          const e = await l.isExist();
          I.getState().init(e);
        }
      }
      function we() {
        const { status: t } = I.getState();
        return t;
      }
      function fe(t) {
        const e = I.getState();
        return ve(e), t(e);
      }
      function Z(t) {
        const e = I.getState();
        return me(e), t(e);
      }
      function ve(t) {
        (0, d.h)(
          t.status === c.P.Ready && t.vault instanceof l,
          "Wallet locked"
        );
      }
      function me(t) {
        (0, d.h)(t.status !== c.P.Ready, "Disallowed for unlocked wallet");
      }
      const I = (0, S.Z)((t) => ({
        status: c.P.Idle,
        vault: null,
        init: (e) => t({ status: e ? c.P.Locked : c.P.Welcome, vault: null }),
        unlock: (e) => t({ status: c.P.Ready, vault: e }),
        lock: () =>
          t((e) => ({
            status: e.status === c.P.Ready ? c.P.Locked : e.status,
            vault: null,
          })),
      }));
      function Ee() {
        new k().onMessage(pe);
      }
      async function pe(t) {
        if (!!t.request)
          try {
            await ye(),
              await (0, o.match)(t.data)
                .with(
                  { type: c.MessageType.GetWalletStatus },
                  async ({ type: e }) => {
                    const s = we();
                    t.reply({ type: e, status: s });
                  }
                )
                .with(
                  { type: c.MessageType.SetupWallet },
                  ({ type: e, password: s, accountParams: r, seedPhrase: i }) =>
                    Z(async (u) => {
                      const { vault: y, accountAddress: W } = await l.setup(
                        s,
                        r,
                        i
                      );
                      u.unlock(y), t.reply({ type: e, accountAddress: W });
                    })
                )
                .with(
                  { type: c.MessageType.UnlockWallet },
                  ({ type: e, password: s }) =>
                    Z(async (r) => {
                      const i = await l.unlock(s);
                      r.unlock(i), t.reply({ type: e });
                    })
                )
                .with({ type: c.MessageType.LockWallet }, ({ type: e }) =>
                  fe(async (s) => {
                    s.lock(), t.reply({ type: e });
                  })
                )
                .run();
          } catch (e) {
            t.replyError(e);
          }
      }
      const $ = {};
      Ee(),
        a.browser.runtime.onInstalled.addListener(({ reason: t }) => {
          switch (t) {
            case "install":
              a.browser.tabs.create({
                url: a.browser.runtime.getURL("index.html"),
                active: !0,
              });
              break;
          }
        }),
        a.browser.browserAction.onClicked.addListener((t) => {
          a.browser.tabs.create({
            windowId: t.windowId,
            index: t.index + 1,
            url: a.browser.runtime.getURL("index.html"),
            active: !0,
          });
        }),
        $.hot && $.hot.accept();
    },
    549: () => {},
    1463: (g, h, n) => {
      "use strict";
      n.d(h, { P: () => a, Q: () => o });
      var a;
      (function (d) {
        (d[(d.Idle = 0)] = "Idle"),
          (d[(d.Welcome = 1)] = "Welcome"),
          (d[(d.Locked = 2)] = "Locked"),
          (d[(d.Ready = 3)] = "Ready");
      })(a || (a = {}));
      var o;
      (function (d) {
        (d.HD = "HD"),
          (d.Imported = "IMPORTED"),
          (d.Hardware = "HARDWARE"),
          (d.Void = "VOID");
      })(o || (o = {}));
    },
    3437: (g, h, n) => {
      "use strict";
      n.d(h, { Q: () => a.Q, P: () => a.P, MessageType: () => w.C });
      var a = n(1463),
        o = n(549),
        d = n.n(o);
      n.o(o, "MessageType") &&
        n.d(h, {
          MessageType: function () {
            return o.MessageType;
          },
        });
      var w = n(8785);
    },
    8785: (g, h, n) => {
      "use strict";
      n.d(h, { C: () => a });
      var a;
      (function (o) {
        (o.GetWalletStatus = "GET_WALLET_STATUS"),
          (o.WalletStatusUpdated = "WALLET_STATUS_UPDATED"),
          (o.SetupWallet = "SETUP_WALLET"),
          (o.UnlockWallet = "UNLOCK_WALLET"),
          (o.LockWallet = "LOCK_WALLET"),
          (o.AddSeedPhrase = "ADD_SEED_PHRASE"),
          (o.AddAccount = "ADD_ACCOUNT"),
          (o.DeleteAccount = "DELETE_ACCOUNT"),
          (o.GetSeedPhrase = "GET_SEED_PHRASE"),
          (o.GetPrivateKey = "GET_PRIVATE_KEY");
      })(a || (a = {}));
    },
    9812: (g, h, n) => {
      "use strict";
      n.d(h, { oK: () => o, Xy: () => P, Fq: () => k, B: () => L });
      var a = n(716);
      const o = Object.values(a.G),
        d = "Unexpected error occured",
        w = "Timeout";
      function P(c) {
        return {
          message: (c == null ? void 0 : c.message) || d,
          data: c == null ? void 0 : c.data,
        };
      }
      function k({ message: c, data: S }) {
        return new M(c, S);
      }
      class M extends Error {
        constructor(S, D) {
          super(S);
          (this.data = D), (this.name = "IntercomError");
        }
      }
      class L extends M {
        constructor() {
          super(w);
          this.name = "IntercomTimeoutError";
        }
      }
    },
    716: (g, h, n) => {
      "use strict";
      n.d(h, { G: () => a });
      var a;
      (function (o) {
        (o.Req = "INTERCOM_REQUEST"),
          (o.Res = "INTERCOM_RESPONSE"),
          (o.Err = "INTERCOM_ERROR"),
          (o.Void = "INTERCOM_VOID");
      })(a || (a = {}));
    },
    3385: (g, h, n) => {
      "use strict";
      n.d(h, { h: () => a });
      function a(d, w, P = o) {
        if (!d) throw new P(w != null ? w : `${d} == true`);
      }
      class o extends Error {
        constructor() {
          super(...arguments);
          this.name = "AssertionError";
        }
      }
    },
    2574: () => {},
  },
  0,
  [[9901, 666, 425, 44]],
]);
