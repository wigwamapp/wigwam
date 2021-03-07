(self.webpackChunktaky = self.webpackChunktaky || []).push([
  [44],
  {
    4594: (Ae, W, k) => {
      "use strict";
      k.d(W, { Kn: () => x });
      var T = k(3286),
        v = k(2593),
        U = k(8197),
        z = k(711);
      const G = "address/5.0.10",
        Q = new z.Yd(G);
      function Y(n) {
        (0, T.A7)(n, 20) ||
          Q.throwArgumentError("invalid address", "address", n),
          (n = n.toLowerCase());
        const y = n.substring(2).split(""),
          O = new Uint8Array(40);
        for (let ee = 0; ee < 40; ee++) O[ee] = y[ee].charCodeAt(0);
        const R = (0, T.lE)((0, U.w)(O));
        for (let ee = 0; ee < 40; ee += 2)
          R[ee >> 1] >> 4 >= 8 && (y[ee] = y[ee].toUpperCase()),
            (R[ee >> 1] & 15) >= 8 && (y[ee + 1] = y[ee + 1].toUpperCase());
        return "0x" + y.join("");
      }
      const m = 9007199254740991;
      function ae(n) {
        return Math.log10 ? Math.log10(n) : Math.log(n) / Math.LN10;
      }
      const te = {};
      for (let n = 0; n < 10; n++) te[String(n)] = String(n);
      for (let n = 0; n < 26; n++)
        te[String.fromCharCode(65 + n)] = String(10 + n);
      const oe = Math.floor(ae(m));
      function V(n) {
        (n = n.toUpperCase()), (n = n.substring(4) + n.substring(0, 2) + "00");
        let y = n
          .split("")
          .map((R) => te[R])
          .join("");
        for (; y.length >= oe; ) {
          let R = y.substring(0, oe);
          y = (parseInt(R, 10) % 97) + y.substring(R.length);
        }
        let O = String(98 - (parseInt(y, 10) % 97));
        for (; O.length < 2; ) O = "0" + O;
        return O;
      }
      function x(n) {
        let y = null;
        if (
          (typeof n != "string" &&
            Q.throwArgumentError("invalid address", "address", n),
          n.match(/^(0x)?[0-9a-fA-F]{40}$/))
        )
          n.substring(0, 2) !== "0x" && (n = "0x" + n),
            (y = Y(n)),
            n.match(/([A-F].*[a-f])|([a-f].*[A-F])/) &&
              y !== n &&
              Q.throwArgumentError("bad address checksum", "address", n);
        else if (n.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
          for (
            n.substring(2, 4) !== V(n) &&
              Q.throwArgumentError("bad icap checksum", "address", n),
              y = (0, v.g$)(n.substring(4));
            y.length < 40;

          )
            y = "0" + y;
          y = Y("0x" + y);
        } else Q.throwArgumentError("invalid address", "address", n);
        return y;
      }
      function N(n) {
        try {
          return x(n), !0;
        } catch (y) {}
        return !1;
      }
      function L(n) {
        let y = _base16To36(x(n).substring(2)).toUpperCase();
        for (; y.length < 30; ) y = "0" + y;
        return "XE" + V("XE00" + y) + y;
      }
      function H(n) {
        let y = null;
        try {
          y = x(n.from);
        } catch (R) {
          Q.throwArgumentError("missing from address", "transaction", n);
        }
        const O = stripZeros(arrayify(BigNumber.from(n.nonce).toHexString()));
        return x(hexDataSlice(keccak256(encode([y, O])), 12));
      }
      function F(n, y, O) {
        return (
          hexDataLength(y) !== 32 &&
            Q.throwArgumentError("salt must be 32 bytes", "salt", y),
          hexDataLength(O) !== 32 &&
            Q.throwArgumentError(
              "initCodeHash must be 32 bytes",
              "initCodeHash",
              O
            ),
          x(hexDataSlice(keccak256(concat(["0xff", x(n), y, O])), 12))
        );
      }
    },
    2046: (Ae, W, k) => {
      "use strict";
      k.d(W, { id: () => U });
      var T = k(8197),
        v = k(4242);
      function U(z) {
        return (0, T.w)((0, v.Y0)(z));
      }
    },
    3643: (Ae, W, k) => {
      "use strict";
      k.d(W, {
        m$: () => p,
        cD: () => E,
        JJ: () => B,
        xh: () => X,
        oy: () => g,
      });
      var T = k(3286),
        v = k(3587);
      class U {
        constructor(d) {
          (0, v.zG)(this, "alphabet", d),
            (0, v.zG)(this, "base", d.length),
            (0, v.zG)(this, "_alphabetMap", {}),
            (0, v.zG)(this, "_leader", d.charAt(0));
          for (let i = 0; i < d.length; i++) this._alphabetMap[d.charAt(i)] = i;
        }
        encode(d) {
          let i = (0, T.lE)(d);
          if (i.length === 0) return "";
          let b = [0];
          for (let J = 0; J < i.length; ++J) {
            let A = i[J];
            for (let $ = 0; $ < b.length; ++$)
              (A += b[$] << 8),
                (b[$] = A % this.base),
                (A = (A / this.base) | 0);
            for (; A > 0; ) b.push(A % this.base), (A = (A / this.base) | 0);
          }
          let I = "";
          for (let J = 0; i[J] === 0 && J < i.length - 1; ++J)
            I += this._leader;
          for (let J = b.length - 1; J >= 0; --J) I += this.alphabet[b[J]];
          return I;
        }
        decode(d) {
          if (typeof d != "string") throw new TypeError("Expected String");
          let i = [];
          if (d.length === 0) return new Uint8Array(i);
          i.push(0);
          for (let b = 0; b < d.length; b++) {
            let I = this._alphabetMap[d[b]];
            if (I === void 0)
              throw new Error("Non-base" + this.base + " character");
            let J = I;
            for (let A = 0; A < i.length; ++A)
              (J += i[A] * this.base), (i[A] = J & 255), (J >>= 8);
            for (; J > 0; ) i.push(J & 255), (J >>= 8);
          }
          for (let b = 0; d[b] === this._leader && b < d.length - 1; ++b)
            i.push(0);
          return (0, T.lE)(new Uint8Array(i.reverse()));
        }
      }
      const z = new U("abcdefghijklmnopqrstuvwxyz234567"),
        G = new U("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
      var Q = k(2593),
        Y = k(4242),
        m = k(5306),
        ae = k(2768),
        te = k(3951),
        oe = k(1261),
        V = k(1421),
        x = k(2455),
        N = k(711);
      const L = "hdnode/5.0.9",
        H = new N.Yd(L),
        F = Q.O$.from(
          "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
        ),
        n = (0, Y.Y0)("Bitcoin seed"),
        y = 2147483648;
      function O(D) {
        return ((1 << D) - 1) << (8 - D);
      }
      function R(D) {
        return (1 << D) - 1;
      }
      function ee(D) {
        return (0, T.$m)((0, T.Dv)(D), 32);
      }
      function ne(D) {
        return G.encode(
          (0, T.zo)([D, (0, T.p3)((0, te.JQ)((0, te.JQ)(D)), 0, 4)])
        );
      }
      function ie(D) {
        if (D == null) return x.E.en;
        if (typeof D == "string") {
          const d = x.E[D];
          return (
            d == null && H.throwArgumentError("unknown locale", "wordlist", D),
            d
          );
        }
        return D;
      }
      const c = {},
        E = "m/44'/60'/0'/0/0";
      class p {
        constructor(d, i, b, I, J, A, $, xe) {
          if ((H.checkNew(new.target, p), d !== c))
            throw new Error("HDNode constructor cannot be called directly");
          if (i) {
            const be = new ae.Et(i);
            (0, v.zG)(this, "privateKey", be.privateKey),
              (0, v.zG)(this, "publicKey", be.compressedPublicKey);
          } else
            (0, v.zG)(this, "privateKey", null),
              (0, v.zG)(this, "publicKey", (0, T.Dv)(b));
          (0, v.zG)(this, "parentFingerprint", I),
            (0, v.zG)(
              this,
              "fingerprint",
              (0, T.p3)((0, te.bP)((0, te.JQ)(this.publicKey)), 0, 4)
            ),
            (0, v.zG)(this, "address", (0, V.db)(this.publicKey)),
            (0, v.zG)(this, "chainCode", J),
            (0, v.zG)(this, "index", A),
            (0, v.zG)(this, "depth", $),
            xe == null
              ? ((0, v.zG)(this, "mnemonic", null),
                (0, v.zG)(this, "path", null))
              : typeof xe == "string"
              ? ((0, v.zG)(this, "mnemonic", null), (0, v.zG)(this, "path", xe))
              : ((0, v.zG)(this, "mnemonic", xe),
                (0, v.zG)(this, "path", xe.path));
        }
        get extendedKey() {
          if (this.depth >= 256) throw new Error("Depth too large!");
          return ne(
            (0, T.zo)([
              this.privateKey != null ? "0x0488ADE4" : "0x0488B21E",
              (0, T.Dv)(this.depth),
              this.parentFingerprint,
              (0, T.$m)((0, T.Dv)(this.index), 4),
              this.chainCode,
              this.privateKey != null
                ? (0, T.zo)(["0x00", this.privateKey])
                : this.publicKey,
            ])
          );
        }
        neuter() {
          return new p(
            c,
            null,
            this.publicKey,
            this.parentFingerprint,
            this.chainCode,
            this.index,
            this.depth,
            this.path
          );
        }
        _derive(d) {
          if (d > 4294967295) throw new Error("invalid index - " + String(d));
          let i = this.path;
          i && (i += "/" + (d & ~y));
          const b = new Uint8Array(37);
          if (d & y) {
            if (!this.privateKey)
              throw new Error("cannot derive child of neutered node");
            b.set((0, T.lE)(this.privateKey), 1), i && (i += "'");
          } else b.set((0, T.lE)(this.publicKey));
          for (let me = 24; me >= 0; me -= 8)
            b[33 + (me >> 3)] = (d >> (24 - me)) & 255;
          const I = (0, T.lE)((0, te.Gy)(oe.p.sha512, this.chainCode, b)),
            J = I.slice(0, 32),
            A = I.slice(32);
          let $ = null,
            xe = null;
          this.privateKey
            ? ($ = ee(Q.O$.from(J).add(this.privateKey).mod(F)))
            : (xe = new ae.Et((0, T.Dv)(J))._addPoint(this.publicKey));
          let be = i;
          const ce = this.mnemonic;
          return (
            ce &&
              (be = Object.freeze({
                phrase: ce.phrase,
                path: i,
                locale: ce.locale || "en",
              })),
            new p(c, $, xe, this.fingerprint, ee(A), d, this.depth + 1, be)
          );
        }
        derivePath(d) {
          const i = d.split("/");
          if (i.length === 0 || (i[0] === "m" && this.depth !== 0))
            throw new Error("invalid path - " + d);
          i[0] === "m" && i.shift();
          let b = this;
          for (let I = 0; I < i.length; I++) {
            const J = i[I];
            if (J.match(/^[0-9]+'$/)) {
              const A = parseInt(J.substring(0, J.length - 1));
              if (A >= y) throw new Error("invalid path index - " + J);
              b = b._derive(y + A);
            } else if (J.match(/^[0-9]+$/)) {
              const A = parseInt(J);
              if (A >= y) throw new Error("invalid path index - " + J);
              b = b._derive(A);
            } else throw new Error("invalid path component - " + J);
          }
          return b;
        }
        static _fromSeed(d, i) {
          const b = (0, T.lE)(d);
          if (b.length < 16 || b.length > 64) throw new Error("invalid seed");
          const I = (0, T.lE)((0, te.Gy)(oe.p.sha512, n, b));
          return new p(
            c,
            ee(I.slice(0, 32)),
            null,
            "0x00000000",
            ee(I.slice(32)),
            0,
            0,
            i
          );
        }
        static fromMnemonic(d, i, b) {
          return (
            (b = ie(b)),
            (d = B(g(d, b), b)),
            p._fromSeed(w(d, i), { phrase: d, path: "m", locale: b.locale })
          );
        }
        static fromSeed(d) {
          return p._fromSeed(d, null);
        }
        static fromExtendedKey(d) {
          const i = G.decode(d);
          (i.length !== 82 || ne(i.slice(0, 78)) !== d) &&
            H.throwArgumentError(
              "invalid extended key",
              "extendedKey",
              "[REDACTED]"
            );
          const b = i[4],
            I = (0, T.Dv)(i.slice(5, 9)),
            J = parseInt((0, T.Dv)(i.slice(9, 13)).substring(2), 16),
            A = (0, T.Dv)(i.slice(13, 45)),
            $ = i.slice(45, 78);
          switch ((0, T.Dv)(i.slice(0, 4))) {
            case "0x0488b21e":
            case "0x043587cf":
              return new p(c, null, (0, T.Dv)($), I, A, J, b, null);
            case "0x0488ade4":
            case "0x04358394 ":
              if ($[0] !== 0) break;
              return new p(c, (0, T.Dv)($.slice(1)), null, I, A, J, b, null);
          }
          return H.throwArgumentError(
            "invalid extended key",
            "extendedKey",
            "[REDACTED]"
          );
        }
      }
      function w(D, d) {
        d || (d = "");
        const i = (0, Y.Y0)("mnemonic" + d, Y.Uj.NFKD);
        return (0, m.n)((0, Y.Y0)(D, Y.Uj.NFKD), i, 2048, 64, "sha512");
      }
      function g(D, d) {
        (d = ie(d)), H.checkNormalize();
        const i = d.split(D);
        if (i.length % 3 != 0) throw new Error("invalid mnemonic");
        const b = (0, T.lE)(new Uint8Array(Math.ceil((11 * i.length) / 8)));
        let I = 0;
        for (let be = 0; be < i.length; be++) {
          let ce = d.getWordIndex(i[be].normalize("NFKD"));
          if (ce === -1) throw new Error("invalid mnemonic");
          for (let me = 0; me < 11; me++)
            ce & (1 << (10 - me)) && (b[I >> 3] |= 1 << (7 - (I % 8))), I++;
        }
        const J = (32 * i.length) / 3,
          A = i.length / 3,
          $ = O(A);
        if (
          ((0, T.lE)((0, te.JQ)(b.slice(0, J / 8)))[0] & $) !==
          (b[b.length - 1] & $)
        )
          throw new Error("invalid checksum");
        return (0, T.Dv)(b.slice(0, J / 8));
      }
      function B(D, d) {
        if (
          ((d = ie(d)),
          (D = (0, T.lE)(D)),
          D.length % 4 != 0 || D.length < 16 || D.length > 32)
        )
          throw new Error("invalid entropy");
        const i = [0];
        let b = 11;
        for (let A = 0; A < D.length; A++)
          b > 8
            ? ((i[i.length - 1] <<= 8), (i[i.length - 1] |= D[A]), (b -= 8))
            : ((i[i.length - 1] <<= b),
              (i[i.length - 1] |= D[A] >> (8 - b)),
              i.push(D[A] & R(8 - b)),
              (b += 3));
        const I = D.length / 4,
          J = (0, T.lE)((0, te.JQ)(D))[0] & O(I);
        return (
          (i[i.length - 1] <<= I),
          (i[i.length - 1] |= J >> (8 - I)),
          d.join(i.map((A) => d.getWord(A)))
        );
      }
      function X(D, d) {
        try {
          return g(D, d), !0;
        } catch (i) {}
        return !1;
      }
    },
    8197: (Ae, W, k) => {
      "use strict";
      k.d(W, { w: () => z });
      var T = k(1094),
        v = k.n(T),
        U = k(3286);
      function z(G) {
        return "0x" + v().keccak_256((0, U.lE)(G));
      }
    },
    5306: (Ae, W, k) => {
      "use strict";
      k.d(W, { n: () => U });
      var T = k(3286),
        v = k(3951);
      function U(z, G, Q, Y, m) {
        (z = (0, T.lE)(z)), (G = (0, T.lE)(G));
        let ae,
          te = 1;
        const oe = new Uint8Array(Y),
          V = new Uint8Array(G.length + 4);
        V.set(G);
        let x, N;
        for (let L = 1; L <= te; L++) {
          (V[G.length] = (L >> 24) & 255),
            (V[G.length + 1] = (L >> 16) & 255),
            (V[G.length + 2] = (L >> 8) & 255),
            (V[G.length + 3] = L & 255);
          let H = (0, T.lE)((0, v.Gy)(m, z, V));
          ae ||
            ((ae = H.length),
            (N = new Uint8Array(ae)),
            (te = Math.ceil(Y / ae)),
            (x = Y - (te - 1) * ae)),
            N.set(H);
          for (let y = 1; y < Q; y++) {
            H = (0, T.lE)((0, v.Gy)(m, z, H));
            for (let O = 0; O < ae; O++) N[O] ^= H[O];
          }
          const F = (L - 1) * ae,
            n = L === te ? x : ae;
          oe.set((0, T.lE)(N).slice(0, n), F);
        }
        return (0, T.Dv)(oe);
      }
    },
    3587: (Ae, W, k) => {
      "use strict";
      k.d(W, {
        dk: () => N,
        uj: () => m,
        p$: () => x,
        zG: () => G,
        mE: () => Y,
        DC: () => ae,
      });
      var T = k(711);
      const v = "properties/5.0.8";
      var U = function (L, H, F, n) {
        function y(O) {
          return O instanceof F
            ? O
            : new F(function (R) {
                R(O);
              });
        }
        return new (F || (F = Promise))(function (O, R) {
          function ee(c) {
            try {
              ie(n.next(c));
            } catch (E) {
              R(E);
            }
          }
          function ne(c) {
            try {
              ie(n.throw(c));
            } catch (E) {
              R(E);
            }
          }
          function ie(c) {
            c.done ? O(c.value) : y(c.value).then(ee, ne);
          }
          ie((n = n.apply(L, H || [])).next());
        });
      };
      const z = new T.Yd(v);
      function G(L, H, F) {
        Object.defineProperty(L, H, { enumerable: !0, value: F, writable: !1 });
      }
      function Q(L, H) {
        for (let F = 0; F < 32; F++) {
          if (L[H]) return L[H];
          if (!L.prototype || typeof L.prototype != "object") break;
          L = Object.getPrototypeOf(L.prototype).constructor;
        }
        return null;
      }
      function Y(L) {
        return U(this, void 0, void 0, function* () {
          const H = Object.keys(L).map((n) => {
            const y = L[n];
            return Promise.resolve(y).then((O) => ({ key: n, value: O }));
          });
          return (yield Promise.all(H)).reduce(
            (n, y) => ((n[y.key] = y.value), n),
            {}
          );
        });
      }
      function m(L, H) {
        (!L || typeof L != "object") &&
          z.throwArgumentError("invalid object", "object", L),
          Object.keys(L).forEach((F) => {
            H[F] ||
              z.throwArgumentError(
                "invalid object key - " + F,
                "transaction:" + F,
                L
              );
          });
      }
      function ae(L) {
        const H = {};
        for (const F in L) H[F] = L[F];
        return H;
      }
      const te = {
        bigint: !0,
        boolean: !0,
        function: !0,
        number: !0,
        string: !0,
      };
      function oe(L) {
        if (L == null || te[typeof L]) return !0;
        if (Array.isArray(L) || typeof L == "object") {
          if (!Object.isFrozen(L)) return !1;
          const H = Object.keys(L);
          for (let F = 0; F < H.length; F++) if (!oe(L[H[F]])) return !1;
          return !0;
        }
        return z.throwArgumentError(`Cannot deepCopy ${typeof L}`, "object", L);
      }
      function V(L) {
        if (oe(L)) return L;
        if (Array.isArray(L)) return Object.freeze(L.map((H) => x(H)));
        if (typeof L == "object") {
          const H = {};
          for (const F in L) {
            const n = L[F];
            n !== void 0 && G(H, F, x(n));
          }
          return H;
        }
        return z.throwArgumentError(`Cannot deepCopy ${typeof L}`, "object", L);
      }
      function x(L) {
        return V(L);
      }
      class N {
        constructor(H) {
          for (const F in H) this[F] = x(H[F]);
        }
      }
    },
    3951: (Ae, W, k) => {
      "use strict";
      k.d(W, { Gy: () => oe, bP: () => m, JQ: () => ae });
      var T = k(3715),
        v = k.n(T),
        U = k(3286),
        z = k(1261),
        G = k(711);
      const Q = "sha2/5.0.8",
        Y = new G.Yd(Q);
      function m(V) {
        return (
          "0x" +
          v()
            .ripemd160()
            .update((0, U.lE)(V))
            .digest("hex")
        );
      }
      function ae(V) {
        return (
          "0x" +
          v()
            .sha256()
            .update((0, U.lE)(V))
            .digest("hex")
        );
      }
      function te(V) {
        return "0x" + hash.sha512().update(arrayify(V)).digest("hex");
      }
      function oe(V, x, N) {
        return (
          z.p[V] ||
            Y.throwError(
              "unsupported algorithm " + V,
              G.Yd.errors.UNSUPPORTED_OPERATION,
              { operation: "hmac", algorithm: V }
            ),
          "0x" +
            v()
              .hmac(v()[V], (0, U.lE)(x))
              .update((0, U.lE)(N))
              .digest("hex")
        );
      }
    },
    1261: (Ae, W, k) => {
      "use strict";
      k.d(W, { p: () => T });
      var T;
      (function (v) {
        (v.sha256 = "sha256"), (v.sha512 = "sha512");
      })(T || (T = {}));
    },
    2768: (Ae, W, k) => {
      "use strict";
      k.d(W, { Et: () => Oe, VW: () => Fe });
      var T = k(3550),
        v = k.n(T),
        U = k(3715),
        z = k.n(U),
        G =
          typeof globalThis != "undefined"
            ? globalThis
            : typeof window != "undefined"
            ? window
            : typeof global != "undefined"
            ? global
            : typeof self != "undefined"
            ? self
            : {};
      function Q(M) {
        return M &&
          M.__esModule &&
          Object.prototype.hasOwnProperty.call(M, "default")
          ? M.default
          : M;
      }
      function Y(M, t, u) {
        return (
          (u = {
            path: t,
            exports: {},
            require: function (h, P) {
              return oe(h, P == null ? u.path : P);
            },
          }),
          M(u, u.exports),
          u.exports
        );
      }
      function m(M) {
        return M && Object.prototype.hasOwnProperty.call(M, "default")
          ? M.default
          : M;
      }
      function ae(M) {
        return M &&
          Object.prototype.hasOwnProperty.call(M, "default") &&
          Object.keys(M).length === 1
          ? M.default
          : M;
      }
      function te(M) {
        if (M.__esModule) return M;
        var t = Object.defineProperty({}, "__esModule", { value: !0 });
        return (
          Object.keys(M).forEach(function (u) {
            var h = Object.getOwnPropertyDescriptor(M, u);
            Object.defineProperty(
              t,
              u,
              h.get
                ? h
                : {
                    enumerable: !0,
                    get: function () {
                      return M[u];
                    },
                  }
            );
          }),
          t
        );
      }
      function oe() {
        throw new Error(
          "Dynamic requires are not currently supported by @rollup/plugin-commonjs"
        );
      }
      var V = x;
      function x(M, t) {
        if (!M) throw new Error(t || "Assertion failed");
      }
      x.equal = function (t, u, h) {
        if (t != u) throw new Error(h || "Assertion failed: " + t + " != " + u);
      };
      var N = Y(function (M, t) {
          "use strict";
          var u = t;
          function h(a, e) {
            if (Array.isArray(a)) return a.slice();
            if (!a) return [];
            var r = [];
            if (typeof a != "string") {
              for (var o = 0; o < a.length; o++) r[o] = a[o] | 0;
              return r;
            }
            if (e === "hex") {
              (a = a.replace(/[^a-z0-9]+/gi, "")),
                a.length % 2 != 0 && (a = "0" + a);
              for (var o = 0; o < a.length; o += 2)
                r.push(parseInt(a[o] + a[o + 1], 16));
            } else
              for (var o = 0; o < a.length; o++) {
                var s = a.charCodeAt(o),
                  f = s >> 8,
                  S = s & 255;
                f ? r.push(f, S) : r.push(S);
              }
            return r;
          }
          u.toArray = h;
          function P(a) {
            return a.length === 1 ? "0" + a : a;
          }
          u.zero2 = P;
          function K(a) {
            for (var e = "", r = 0; r < a.length; r++)
              e += P(a[r].toString(16));
            return e;
          }
          (u.toHex = K),
            (u.encode = function (e, r) {
              return r === "hex" ? K(e) : e;
            });
        }),
        L = Y(function (M, t) {
          "use strict";
          var u = t;
          (u.assert = V),
            (u.toArray = N.toArray),
            (u.zero2 = N.zero2),
            (u.toHex = N.toHex),
            (u.encode = N.encode);
          function h(r, o, s) {
            var f = new Array(Math.max(r.bitLength(), s) + 1);
            f.fill(0);
            for (
              var S = 1 << (o + 1), j = r.clone(), q = 0;
              q < f.length;
              q++
            ) {
              var re,
                le = j.andln(S - 1);
              j.isOdd()
                ? (le > (S >> 1) - 1 ? (re = (S >> 1) - le) : (re = le),
                  j.isubn(re))
                : (re = 0),
                (f[q] = re),
                j.iushrn(1);
            }
            return f;
          }
          u.getNAF = h;
          function P(r, o) {
            var s = [[], []];
            (r = r.clone()), (o = o.clone());
            for (var f = 0, S = 0, j; r.cmpn(-f) > 0 || o.cmpn(-S) > 0; ) {
              var q = (r.andln(3) + f) & 3,
                re = (o.andln(3) + S) & 3;
              q === 3 && (q = -1), re === 3 && (re = -1);
              var le;
              (q & 1) == 0
                ? (le = 0)
                : ((j = (r.andln(7) + f) & 7),
                  (j === 3 || j === 5) && re === 2 ? (le = -q) : (le = q)),
                s[0].push(le);
              var fe;
              (re & 1) == 0
                ? (fe = 0)
                : ((j = (o.andln(7) + S) & 7),
                  (j === 3 || j === 5) && q === 2 ? (fe = -re) : (fe = re)),
                s[1].push(fe),
                2 * f === le + 1 && (f = 1 - f),
                2 * S === fe + 1 && (S = 1 - S),
                r.iushrn(1),
                o.iushrn(1);
            }
            return s;
          }
          u.getJSF = P;
          function K(r, o, s) {
            var f = "_" + o;
            r.prototype[o] = function () {
              return this[f] !== void 0 ? this[f] : (this[f] = s.call(this));
            };
          }
          u.cachedProperty = K;
          function a(r) {
            return typeof r == "string" ? u.toArray(r, "hex") : r;
          }
          u.parseBytes = a;
          function e(r) {
            return new (v())(r, "hex", "le");
          }
          u.intFromLE = e;
        }),
        H = L.getNAF,
        F = L.getJSF,
        n = L.assert;
      function y(M, t) {
        (this.type = M),
          (this.p = new (v())(t.p, 16)),
          (this.red = t.prime ? v().red(t.prime) : v().mont(this.p)),
          (this.zero = new (v())(0).toRed(this.red)),
          (this.one = new (v())(1).toRed(this.red)),
          (this.two = new (v())(2).toRed(this.red)),
          (this.n = t.n && new (v())(t.n, 16)),
          (this.g = t.g && this.pointFromJSON(t.g, t.gRed)),
          (this._wnafT1 = new Array(4)),
          (this._wnafT2 = new Array(4)),
          (this._wnafT3 = new Array(4)),
          (this._wnafT4 = new Array(4)),
          (this._bitLength = this.n ? this.n.bitLength() : 0);
        var u = this.n && this.p.div(this.n);
        !u || u.cmpn(100) > 0
          ? (this.redN = null)
          : ((this._maxwellTrick = !0), (this.redN = this.n.toRed(this.red)));
      }
      var O = y;
      (y.prototype.point = function () {
        throw new Error("Not implemented");
      }),
        (y.prototype.validate = function () {
          throw new Error("Not implemented");
        }),
        (y.prototype._fixedNafMul = function (t, u) {
          n(t.precomputed);
          var h = t._getDoubles(),
            P = H(u, 1, this._bitLength),
            K = (1 << (h.step + 1)) - (h.step % 2 == 0 ? 2 : 1);
          K /= 3;
          var a = [],
            e,
            r;
          for (e = 0; e < P.length; e += h.step) {
            r = 0;
            for (var o = e + h.step - 1; o >= e; o--) r = (r << 1) + P[o];
            a.push(r);
          }
          for (
            var s = this.jpoint(null, null, null),
              f = this.jpoint(null, null, null),
              S = K;
            S > 0;
            S--
          ) {
            for (e = 0; e < a.length; e++)
              (r = a[e]),
                r === S
                  ? (f = f.mixedAdd(h.points[e]))
                  : r === -S && (f = f.mixedAdd(h.points[e].neg()));
            s = s.add(f);
          }
          return s.toP();
        }),
        (y.prototype._wnafMul = function (t, u) {
          var h = 4,
            P = t._getNAFPoints(h);
          h = P.wnd;
          for (
            var K = P.points,
              a = H(u, h, this._bitLength),
              e = this.jpoint(null, null, null),
              r = a.length - 1;
            r >= 0;
            r--
          ) {
            for (var o = 0; r >= 0 && a[r] === 0; r--) o++;
            if ((r >= 0 && o++, (e = e.dblp(o)), r < 0)) break;
            var s = a[r];
            n(s !== 0),
              t.type === "affine"
                ? s > 0
                  ? (e = e.mixedAdd(K[(s - 1) >> 1]))
                  : (e = e.mixedAdd(K[(-s - 1) >> 1].neg()))
                : s > 0
                ? (e = e.add(K[(s - 1) >> 1]))
                : (e = e.add(K[(-s - 1) >> 1].neg()));
          }
          return t.type === "affine" ? e.toP() : e;
        }),
        (y.prototype._wnafMulAdd = function (t, u, h, P, K) {
          var a = this._wnafT1,
            e = this._wnafT2,
            r = this._wnafT3,
            o = 0,
            s,
            f,
            S;
          for (s = 0; s < P; s++) {
            S = u[s];
            var j = S._getNAFPoints(t);
            (a[s] = j.wnd), (e[s] = j.points);
          }
          for (s = P - 1; s >= 1; s -= 2) {
            var q = s - 1,
              re = s;
            if (a[q] !== 1 || a[re] !== 1) {
              (r[q] = H(h[q], a[q], this._bitLength)),
                (r[re] = H(h[re], a[re], this._bitLength)),
                (o = Math.max(r[q].length, o)),
                (o = Math.max(r[re].length, o));
              continue;
            }
            var le = [u[q], null, null, u[re]];
            u[q].y.cmp(u[re].y) === 0
              ? ((le[1] = u[q].add(u[re])),
                (le[2] = u[q].toJ().mixedAdd(u[re].neg())))
              : u[q].y.cmp(u[re].y.redNeg()) === 0
              ? ((le[1] = u[q].toJ().mixedAdd(u[re])),
                (le[2] = u[q].add(u[re].neg())))
              : ((le[1] = u[q].toJ().mixedAdd(u[re])),
                (le[2] = u[q].toJ().mixedAdd(u[re].neg())));
            var fe = [-3, -1, -5, -7, 0, 7, 5, 1, 3],
              Me = F(h[q], h[re]);
            for (
              o = Math.max(Me[0].length, o),
                r[q] = new Array(o),
                r[re] = new Array(o),
                f = 0;
              f < o;
              f++
            ) {
              var Ie = Me[0][f] | 0,
                Ze = Me[1][f] | 0;
              (r[q][f] = fe[(Ie + 1) * 3 + (Ze + 1)]),
                (r[re][f] = 0),
                (e[q] = le);
            }
          }
          var He = this.jpoint(null, null, null),
            ze = this._wnafT4;
          for (s = o; s >= 0; s--) {
            for (var Ke = 0; s >= 0; ) {
              var Qe = !0;
              for (f = 0; f < P; f++)
                (ze[f] = r[f][s] | 0), ze[f] !== 0 && (Qe = !1);
              if (!Qe) break;
              Ke++, s--;
            }
            if ((s >= 0 && Ke++, (He = He.dblp(Ke)), s < 0)) break;
            for (f = 0; f < P; f++) {
              var Ne = ze[f];
              Ne !== 0 &&
                (Ne > 0
                  ? (S = e[f][(Ne - 1) >> 1])
                  : Ne < 0 && (S = e[f][(-Ne - 1) >> 1].neg()),
                S.type === "affine" ? (He = He.mixedAdd(S)) : (He = He.add(S)));
            }
          }
          for (s = 0; s < P; s++) e[s] = null;
          return K ? He : He.toP();
        });
      function R(M, t) {
        (this.curve = M), (this.type = t), (this.precomputed = null);
      }
      (y.BasePoint = R),
        (R.prototype.eq = function () {
          throw new Error("Not implemented");
        }),
        (R.prototype.validate = function () {
          return this.curve.validate(this);
        }),
        (y.prototype.decodePoint = function (t, u) {
          t = L.toArray(t, u);
          var h = this.p.byteLength();
          if (
            (t[0] === 4 || t[0] === 6 || t[0] === 7) &&
            t.length - 1 == 2 * h
          ) {
            t[0] === 6
              ? n(t[t.length - 1] % 2 == 0)
              : t[0] === 7 && n(t[t.length - 1] % 2 == 1);
            var P = this.point(t.slice(1, 1 + h), t.slice(1 + h, 1 + 2 * h));
            return P;
          } else if ((t[0] === 2 || t[0] === 3) && t.length - 1 === h)
            return this.pointFromX(t.slice(1, 1 + h), t[0] === 3);
          throw new Error("Unknown point format");
        }),
        (R.prototype.encodeCompressed = function (t) {
          return this.encode(t, !0);
        }),
        (R.prototype._encode = function (t) {
          var u = this.curve.p.byteLength(),
            h = this.getX().toArray("be", u);
          return t
            ? [this.getY().isEven() ? 2 : 3].concat(h)
            : [4].concat(h, this.getY().toArray("be", u));
        }),
        (R.prototype.encode = function (t, u) {
          return L.encode(this._encode(u), t);
        }),
        (R.prototype.precompute = function (t) {
          if (this.precomputed) return this;
          var u = { doubles: null, naf: null, beta: null };
          return (
            (u.naf = this._getNAFPoints(8)),
            (u.doubles = this._getDoubles(4, t)),
            (u.beta = this._getBeta()),
            (this.precomputed = u),
            this
          );
        }),
        (R.prototype._hasDoubles = function (t) {
          if (!this.precomputed) return !1;
          var u = this.precomputed.doubles;
          return u
            ? u.points.length >= Math.ceil((t.bitLength() + 1) / u.step)
            : !1;
        }),
        (R.prototype._getDoubles = function (t, u) {
          if (this.precomputed && this.precomputed.doubles)
            return this.precomputed.doubles;
          for (var h = [this], P = this, K = 0; K < u; K += t) {
            for (var a = 0; a < t; a++) P = P.dbl();
            h.push(P);
          }
          return { step: t, points: h };
        }),
        (R.prototype._getNAFPoints = function (t) {
          if (this.precomputed && this.precomputed.naf)
            return this.precomputed.naf;
          for (
            var u = [this],
              h = (1 << t) - 1,
              P = h === 1 ? null : this.dbl(),
              K = 1;
            K < h;
            K++
          )
            u[K] = u[K - 1].add(P);
          return { wnd: t, points: u };
        }),
        (R.prototype._getBeta = function () {
          return null;
        }),
        (R.prototype.dblp = function (t) {
          for (var u = this, h = 0; h < t; h++) u = u.dbl();
          return u;
        });
      var ee = Y(function (M) {
          typeof Object.create == "function"
            ? (M.exports = function (u, h) {
                h &&
                  ((u.super_ = h),
                  (u.prototype = Object.create(h.prototype, {
                    constructor: {
                      value: u,
                      enumerable: !1,
                      writable: !0,
                      configurable: !0,
                    },
                  })));
              })
            : (M.exports = function (u, h) {
                if (h) {
                  u.super_ = h;
                  var P = function () {};
                  (P.prototype = h.prototype),
                    (u.prototype = new P()),
                    (u.prototype.constructor = u);
                }
              });
        }),
        ne = L.assert;
      function ie(M) {
        O.call(this, "short", M),
          (this.a = new (v())(M.a, 16).toRed(this.red)),
          (this.b = new (v())(M.b, 16).toRed(this.red)),
          (this.tinv = this.two.redInvm()),
          (this.zeroA = this.a.fromRed().cmpn(0) === 0),
          (this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0),
          (this.endo = this._getEndomorphism(M)),
          (this._endoWnafT1 = new Array(4)),
          (this._endoWnafT2 = new Array(4));
      }
      ee(ie, O);
      var c = ie;
      (ie.prototype._getEndomorphism = function (t) {
        if (!(!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)) {
          var u, h;
          if (t.beta) u = new (v())(t.beta, 16).toRed(this.red);
          else {
            var P = this._getEndoRoots(this.p);
            (u = P[0].cmp(P[1]) < 0 ? P[0] : P[1]), (u = u.toRed(this.red));
          }
          if (t.lambda) h = new (v())(t.lambda, 16);
          else {
            var K = this._getEndoRoots(this.n);
            this.g.mul(K[0]).x.cmp(this.g.x.redMul(u)) === 0
              ? (h = K[0])
              : ((h = K[1]), ne(this.g.mul(h).x.cmp(this.g.x.redMul(u)) === 0));
          }
          var a;
          return (
            t.basis
              ? (a = t.basis.map(function (e) {
                  return { a: new (v())(e.a, 16), b: new (v())(e.b, 16) };
                }))
              : (a = this._getEndoBasis(h)),
            { beta: u, lambda: h, basis: a }
          );
        }
      }),
        (ie.prototype._getEndoRoots = function (t) {
          var u = t === this.p ? this.red : v().mont(t),
            h = new (v())(2).toRed(u).redInvm(),
            P = h.redNeg(),
            K = new (v())(3).toRed(u).redNeg().redSqrt().redMul(h),
            a = P.redAdd(K).fromRed(),
            e = P.redSub(K).fromRed();
          return [a, e];
        }),
        (ie.prototype._getEndoBasis = function (t) {
          for (
            var u = this.n.ushrn(Math.floor(this.n.bitLength() / 2)),
              h = t,
              P = this.n.clone(),
              K = new (v())(1),
              a = new (v())(0),
              e = new (v())(0),
              r = new (v())(1),
              o,
              s,
              f,
              S,
              j,
              q,
              re,
              le = 0,
              fe,
              Me;
            h.cmpn(0) !== 0;

          ) {
            var Ie = P.div(h);
            (fe = P.sub(Ie.mul(h))), (Me = e.sub(Ie.mul(K)));
            var Ze = r.sub(Ie.mul(a));
            if (!f && fe.cmp(u) < 0)
              (o = re.neg()), (s = K), (f = fe.neg()), (S = Me);
            else if (f && ++le == 2) break;
            (re = fe), (P = h), (h = fe), (e = K), (K = Me), (r = a), (a = Ze);
          }
          (j = fe.neg()), (q = Me);
          var He = f.sqr().add(S.sqr()),
            ze = j.sqr().add(q.sqr());
          return (
            ze.cmp(He) >= 0 && ((j = o), (q = s)),
            f.negative && ((f = f.neg()), (S = S.neg())),
            j.negative && ((j = j.neg()), (q = q.neg())),
            [
              { a: f, b: S },
              { a: j, b: q },
            ]
          );
        }),
        (ie.prototype._endoSplit = function (t) {
          var u = this.endo.basis,
            h = u[0],
            P = u[1],
            K = P.b.mul(t).divRound(this.n),
            a = h.b.neg().mul(t).divRound(this.n),
            e = K.mul(h.a),
            r = a.mul(P.a),
            o = K.mul(h.b),
            s = a.mul(P.b),
            f = t.sub(e).sub(r),
            S = o.add(s).neg();
          return { k1: f, k2: S };
        }),
        (ie.prototype.pointFromX = function (t, u) {
          (t = new (v())(t, 16)), t.red || (t = t.toRed(this.red));
          var h = t
              .redSqr()
              .redMul(t)
              .redIAdd(t.redMul(this.a))
              .redIAdd(this.b),
            P = h.redSqrt();
          if (P.redSqr().redSub(h).cmp(this.zero) !== 0)
            throw new Error("invalid point");
          var K = P.fromRed().isOdd();
          return ((u && !K) || (!u && K)) && (P = P.redNeg()), this.point(t, P);
        }),
        (ie.prototype.validate = function (t) {
          if (t.inf) return !0;
          var u = t.x,
            h = t.y,
            P = this.a.redMul(u),
            K = u.redSqr().redMul(u).redIAdd(P).redIAdd(this.b);
          return h.redSqr().redISub(K).cmpn(0) === 0;
        }),
        (ie.prototype._endoWnafMulAdd = function (t, u, h) {
          for (
            var P = this._endoWnafT1, K = this._endoWnafT2, a = 0;
            a < t.length;
            a++
          ) {
            var e = this._endoSplit(u[a]),
              r = t[a],
              o = r._getBeta();
            e.k1.negative && (e.k1.ineg(), (r = r.neg(!0))),
              e.k2.negative && (e.k2.ineg(), (o = o.neg(!0))),
              (P[a * 2] = r),
              (P[a * 2 + 1] = o),
              (K[a * 2] = e.k1),
              (K[a * 2 + 1] = e.k2);
          }
          for (
            var s = this._wnafMulAdd(1, P, K, a * 2, h), f = 0;
            f < a * 2;
            f++
          )
            (P[f] = null), (K[f] = null);
          return s;
        });
      function E(M, t, u, h) {
        O.BasePoint.call(this, M, "affine"),
          t === null && u === null
            ? ((this.x = null), (this.y = null), (this.inf = !0))
            : ((this.x = new (v())(t, 16)),
              (this.y = new (v())(u, 16)),
              h &&
                (this.x.forceRed(this.curve.red),
                this.y.forceRed(this.curve.red)),
              this.x.red || (this.x = this.x.toRed(this.curve.red)),
              this.y.red || (this.y = this.y.toRed(this.curve.red)),
              (this.inf = !1));
      }
      ee(E, O.BasePoint),
        (ie.prototype.point = function (t, u, h) {
          return new E(this, t, u, h);
        }),
        (ie.prototype.pointFromJSON = function (t, u) {
          return E.fromJSON(this, t, u);
        }),
        (E.prototype._getBeta = function () {
          if (!!this.curve.endo) {
            var t = this.precomputed;
            if (t && t.beta) return t.beta;
            var u = this.curve.point(
              this.x.redMul(this.curve.endo.beta),
              this.y
            );
            if (t) {
              var h = this.curve,
                P = function (K) {
                  return h.point(K.x.redMul(h.endo.beta), K.y);
                };
              (t.beta = u),
                (u.precomputed = {
                  beta: null,
                  naf: t.naf && { wnd: t.naf.wnd, points: t.naf.points.map(P) },
                  doubles: t.doubles && {
                    step: t.doubles.step,
                    points: t.doubles.points.map(P),
                  },
                });
            }
            return u;
          }
        }),
        (E.prototype.toJSON = function () {
          return this.precomputed
            ? [
                this.x,
                this.y,
                this.precomputed && {
                  doubles: this.precomputed.doubles && {
                    step: this.precomputed.doubles.step,
                    points: this.precomputed.doubles.points.slice(1),
                  },
                  naf: this.precomputed.naf && {
                    wnd: this.precomputed.naf.wnd,
                    points: this.precomputed.naf.points.slice(1),
                  },
                },
              ]
            : [this.x, this.y];
        }),
        (E.fromJSON = function (t, u, h) {
          typeof u == "string" && (u = JSON.parse(u));
          var P = t.point(u[0], u[1], h);
          if (!u[2]) return P;
          function K(e) {
            return t.point(e[0], e[1], h);
          }
          var a = u[2];
          return (
            (P.precomputed = {
              beta: null,
              doubles: a.doubles && {
                step: a.doubles.step,
                points: [P].concat(a.doubles.points.map(K)),
              },
              naf: a.naf && {
                wnd: a.naf.wnd,
                points: [P].concat(a.naf.points.map(K)),
              },
            }),
            P
          );
        }),
        (E.prototype.inspect = function () {
          return this.isInfinity()
            ? "<EC Point Infinity>"
            : "<EC Point x: " +
                this.x.fromRed().toString(16, 2) +
                " y: " +
                this.y.fromRed().toString(16, 2) +
                ">";
        }),
        (E.prototype.isInfinity = function () {
          return this.inf;
        }),
        (E.prototype.add = function (t) {
          if (this.inf) return t;
          if (t.inf) return this;
          if (this.eq(t)) return this.dbl();
          if (this.neg().eq(t)) return this.curve.point(null, null);
          if (this.x.cmp(t.x) === 0) return this.curve.point(null, null);
          var u = this.y.redSub(t.y);
          u.cmpn(0) !== 0 && (u = u.redMul(this.x.redSub(t.x).redInvm()));
          var h = u.redSqr().redISub(this.x).redISub(t.x),
            P = u.redMul(this.x.redSub(h)).redISub(this.y);
          return this.curve.point(h, P);
        }),
        (E.prototype.dbl = function () {
          if (this.inf) return this;
          var t = this.y.redAdd(this.y);
          if (t.cmpn(0) === 0) return this.curve.point(null, null);
          var u = this.curve.a,
            h = this.x.redSqr(),
            P = t.redInvm(),
            K = h.redAdd(h).redIAdd(h).redIAdd(u).redMul(P),
            a = K.redSqr().redISub(this.x.redAdd(this.x)),
            e = K.redMul(this.x.redSub(a)).redISub(this.y);
          return this.curve.point(a, e);
        }),
        (E.prototype.getX = function () {
          return this.x.fromRed();
        }),
        (E.prototype.getY = function () {
          return this.y.fromRed();
        }),
        (E.prototype.mul = function (t) {
          return (
            (t = new (v())(t, 16)),
            this.isInfinity()
              ? this
              : this._hasDoubles(t)
              ? this.curve._fixedNafMul(this, t)
              : this.curve.endo
              ? this.curve._endoWnafMulAdd([this], [t])
              : this.curve._wnafMul(this, t)
          );
        }),
        (E.prototype.mulAdd = function (t, u, h) {
          var P = [this, u],
            K = [t, h];
          return this.curve.endo
            ? this.curve._endoWnafMulAdd(P, K)
            : this.curve._wnafMulAdd(1, P, K, 2);
        }),
        (E.prototype.jmulAdd = function (t, u, h) {
          var P = [this, u],
            K = [t, h];
          return this.curve.endo
            ? this.curve._endoWnafMulAdd(P, K, !0)
            : this.curve._wnafMulAdd(1, P, K, 2, !0);
        }),
        (E.prototype.eq = function (t) {
          return (
            this === t ||
            (this.inf === t.inf &&
              (this.inf || (this.x.cmp(t.x) === 0 && this.y.cmp(t.y) === 0)))
          );
        }),
        (E.prototype.neg = function (t) {
          if (this.inf) return this;
          var u = this.curve.point(this.x, this.y.redNeg());
          if (t && this.precomputed) {
            var h = this.precomputed,
              P = function (K) {
                return K.neg();
              };
            u.precomputed = {
              naf: h.naf && { wnd: h.naf.wnd, points: h.naf.points.map(P) },
              doubles: h.doubles && {
                step: h.doubles.step,
                points: h.doubles.points.map(P),
              },
            };
          }
          return u;
        }),
        (E.prototype.toJ = function () {
          if (this.inf) return this.curve.jpoint(null, null, null);
          var t = this.curve.jpoint(this.x, this.y, this.curve.one);
          return t;
        });
      function p(M, t, u, h) {
        O.BasePoint.call(this, M, "jacobian"),
          t === null && u === null && h === null
            ? ((this.x = this.curve.one),
              (this.y = this.curve.one),
              (this.z = new (v())(0)))
            : ((this.x = new (v())(t, 16)),
              (this.y = new (v())(u, 16)),
              (this.z = new (v())(h, 16))),
          this.x.red || (this.x = this.x.toRed(this.curve.red)),
          this.y.red || (this.y = this.y.toRed(this.curve.red)),
          this.z.red || (this.z = this.z.toRed(this.curve.red)),
          (this.zOne = this.z === this.curve.one);
      }
      ee(p, O.BasePoint),
        (ie.prototype.jpoint = function (t, u, h) {
          return new p(this, t, u, h);
        }),
        (p.prototype.toP = function () {
          if (this.isInfinity()) return this.curve.point(null, null);
          var t = this.z.redInvm(),
            u = t.redSqr(),
            h = this.x.redMul(u),
            P = this.y.redMul(u).redMul(t);
          return this.curve.point(h, P);
        }),
        (p.prototype.neg = function () {
          return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
        }),
        (p.prototype.add = function (t) {
          if (this.isInfinity()) return t;
          if (t.isInfinity()) return this;
          var u = t.z.redSqr(),
            h = this.z.redSqr(),
            P = this.x.redMul(u),
            K = t.x.redMul(h),
            a = this.y.redMul(u.redMul(t.z)),
            e = t.y.redMul(h.redMul(this.z)),
            r = P.redSub(K),
            o = a.redSub(e);
          if (r.cmpn(0) === 0)
            return o.cmpn(0) !== 0
              ? this.curve.jpoint(null, null, null)
              : this.dbl();
          var s = r.redSqr(),
            f = s.redMul(r),
            S = P.redMul(s),
            j = o.redSqr().redIAdd(f).redISub(S).redISub(S),
            q = o.redMul(S.redISub(j)).redISub(a.redMul(f)),
            re = this.z.redMul(t.z).redMul(r);
          return this.curve.jpoint(j, q, re);
        }),
        (p.prototype.mixedAdd = function (t) {
          if (this.isInfinity()) return t.toJ();
          if (t.isInfinity()) return this;
          var u = this.z.redSqr(),
            h = this.x,
            P = t.x.redMul(u),
            K = this.y,
            a = t.y.redMul(u).redMul(this.z),
            e = h.redSub(P),
            r = K.redSub(a);
          if (e.cmpn(0) === 0)
            return r.cmpn(0) !== 0
              ? this.curve.jpoint(null, null, null)
              : this.dbl();
          var o = e.redSqr(),
            s = o.redMul(e),
            f = h.redMul(o),
            S = r.redSqr().redIAdd(s).redISub(f).redISub(f),
            j = r.redMul(f.redISub(S)).redISub(K.redMul(s)),
            q = this.z.redMul(e);
          return this.curve.jpoint(S, j, q);
        }),
        (p.prototype.dblp = function (t) {
          if (t === 0) return this;
          if (this.isInfinity()) return this;
          if (!t) return this.dbl();
          var u;
          if (this.curve.zeroA || this.curve.threeA) {
            var h = this;
            for (u = 0; u < t; u++) h = h.dbl();
            return h;
          }
          var P = this.curve.a,
            K = this.curve.tinv,
            a = this.x,
            e = this.y,
            r = this.z,
            o = r.redSqr().redSqr(),
            s = e.redAdd(e);
          for (u = 0; u < t; u++) {
            var f = a.redSqr(),
              S = s.redSqr(),
              j = S.redSqr(),
              q = f.redAdd(f).redIAdd(f).redIAdd(P.redMul(o)),
              re = a.redMul(S),
              le = q.redSqr().redISub(re.redAdd(re)),
              fe = re.redISub(le),
              Me = q.redMul(fe);
            Me = Me.redIAdd(Me).redISub(j);
            var Ie = s.redMul(r);
            u + 1 < t && (o = o.redMul(j)), (a = le), (r = Ie), (s = Me);
          }
          return this.curve.jpoint(a, s.redMul(K), r);
        }),
        (p.prototype.dbl = function () {
          return this.isInfinity()
            ? this
            : this.curve.zeroA
            ? this._zeroDbl()
            : this.curve.threeA
            ? this._threeDbl()
            : this._dbl();
        }),
        (p.prototype._zeroDbl = function () {
          var t, u, h;
          if (this.zOne) {
            var P = this.x.redSqr(),
              K = this.y.redSqr(),
              a = K.redSqr(),
              e = this.x.redAdd(K).redSqr().redISub(P).redISub(a);
            e = e.redIAdd(e);
            var r = P.redAdd(P).redIAdd(P),
              o = r.redSqr().redISub(e).redISub(e),
              s = a.redIAdd(a);
            (s = s.redIAdd(s)),
              (s = s.redIAdd(s)),
              (t = o),
              (u = r.redMul(e.redISub(o)).redISub(s)),
              (h = this.y.redAdd(this.y));
          } else {
            var f = this.x.redSqr(),
              S = this.y.redSqr(),
              j = S.redSqr(),
              q = this.x.redAdd(S).redSqr().redISub(f).redISub(j);
            q = q.redIAdd(q);
            var re = f.redAdd(f).redIAdd(f),
              le = re.redSqr(),
              fe = j.redIAdd(j);
            (fe = fe.redIAdd(fe)),
              (fe = fe.redIAdd(fe)),
              (t = le.redISub(q).redISub(q)),
              (u = re.redMul(q.redISub(t)).redISub(fe)),
              (h = this.y.redMul(this.z)),
              (h = h.redIAdd(h));
          }
          return this.curve.jpoint(t, u, h);
        }),
        (p.prototype._threeDbl = function () {
          var t, u, h;
          if (this.zOne) {
            var P = this.x.redSqr(),
              K = this.y.redSqr(),
              a = K.redSqr(),
              e = this.x.redAdd(K).redSqr().redISub(P).redISub(a);
            e = e.redIAdd(e);
            var r = P.redAdd(P).redIAdd(P).redIAdd(this.curve.a),
              o = r.redSqr().redISub(e).redISub(e);
            t = o;
            var s = a.redIAdd(a);
            (s = s.redIAdd(s)),
              (s = s.redIAdd(s)),
              (u = r.redMul(e.redISub(o)).redISub(s)),
              (h = this.y.redAdd(this.y));
          } else {
            var f = this.z.redSqr(),
              S = this.y.redSqr(),
              j = this.x.redMul(S),
              q = this.x.redSub(f).redMul(this.x.redAdd(f));
            q = q.redAdd(q).redIAdd(q);
            var re = j.redIAdd(j);
            re = re.redIAdd(re);
            var le = re.redAdd(re);
            (t = q.redSqr().redISub(le)),
              (h = this.y.redAdd(this.z).redSqr().redISub(S).redISub(f));
            var fe = S.redSqr();
            (fe = fe.redIAdd(fe)),
              (fe = fe.redIAdd(fe)),
              (fe = fe.redIAdd(fe)),
              (u = q.redMul(re.redISub(t)).redISub(fe));
          }
          return this.curve.jpoint(t, u, h);
        }),
        (p.prototype._dbl = function () {
          var t = this.curve.a,
            u = this.x,
            h = this.y,
            P = this.z,
            K = P.redSqr().redSqr(),
            a = u.redSqr(),
            e = h.redSqr(),
            r = a.redAdd(a).redIAdd(a).redIAdd(t.redMul(K)),
            o = u.redAdd(u);
          o = o.redIAdd(o);
          var s = o.redMul(e),
            f = r.redSqr().redISub(s.redAdd(s)),
            S = s.redISub(f),
            j = e.redSqr();
          (j = j.redIAdd(j)), (j = j.redIAdd(j)), (j = j.redIAdd(j));
          var q = r.redMul(S).redISub(j),
            re = h.redAdd(h).redMul(P);
          return this.curve.jpoint(f, q, re);
        }),
        (p.prototype.trpl = function () {
          if (!this.curve.zeroA) return this.dbl().add(this);
          var t = this.x.redSqr(),
            u = this.y.redSqr(),
            h = this.z.redSqr(),
            P = u.redSqr(),
            K = t.redAdd(t).redIAdd(t),
            a = K.redSqr(),
            e = this.x.redAdd(u).redSqr().redISub(t).redISub(P);
          (e = e.redIAdd(e)), (e = e.redAdd(e).redIAdd(e)), (e = e.redISub(a));
          var r = e.redSqr(),
            o = P.redIAdd(P);
          (o = o.redIAdd(o)), (o = o.redIAdd(o)), (o = o.redIAdd(o));
          var s = K.redIAdd(e).redSqr().redISub(a).redISub(r).redISub(o),
            f = u.redMul(s);
          (f = f.redIAdd(f)), (f = f.redIAdd(f));
          var S = this.x.redMul(r).redISub(f);
          (S = S.redIAdd(S)), (S = S.redIAdd(S));
          var j = this.y.redMul(s.redMul(o.redISub(s)).redISub(e.redMul(r)));
          (j = j.redIAdd(j)), (j = j.redIAdd(j)), (j = j.redIAdd(j));
          var q = this.z.redAdd(e).redSqr().redISub(h).redISub(r);
          return this.curve.jpoint(S, j, q);
        }),
        (p.prototype.mul = function (t, u) {
          return (t = new (v())(t, u)), this.curve._wnafMul(this, t);
        }),
        (p.prototype.eq = function (t) {
          if (t.type === "affine") return this.eq(t.toJ());
          if (this === t) return !0;
          var u = this.z.redSqr(),
            h = t.z.redSqr();
          if (this.x.redMul(h).redISub(t.x.redMul(u)).cmpn(0) !== 0) return !1;
          var P = u.redMul(this.z),
            K = h.redMul(t.z);
          return this.y.redMul(K).redISub(t.y.redMul(P)).cmpn(0) === 0;
        }),
        (p.prototype.eqXToP = function (t) {
          var u = this.z.redSqr(),
            h = t.toRed(this.curve.red).redMul(u);
          if (this.x.cmp(h) === 0) return !0;
          for (var P = t.clone(), K = this.curve.redN.redMul(u); ; ) {
            if ((P.iadd(this.curve.n), P.cmp(this.curve.p) >= 0)) return !1;
            if ((h.redIAdd(K), this.x.cmp(h) === 0)) return !0;
          }
        }),
        (p.prototype.inspect = function () {
          return this.isInfinity()
            ? "<EC JPoint Infinity>"
            : "<EC JPoint x: " +
                this.x.toString(16, 2) +
                " y: " +
                this.y.toString(16, 2) +
                " z: " +
                this.z.toString(16, 2) +
                ">";
        }),
        (p.prototype.isInfinity = function () {
          return this.z.cmpn(0) === 0;
        });
      var w = Y(function (M, t) {
          "use strict";
          var u = t;
          (u.base = O), (u.short = c), (u.mont = null), (u.edwards = null);
        }),
        g = Y(function (M, t) {
          "use strict";
          var u = t,
            h = L.assert;
          function P(e) {
            e.type === "short"
              ? (this.curve = new w.short(e))
              : e.type === "edwards"
              ? (this.curve = new w.edwards(e))
              : (this.curve = new w.mont(e)),
              (this.g = this.curve.g),
              (this.n = this.curve.n),
              (this.hash = e.hash),
              h(this.g.validate(), "Invalid curve"),
              h(this.g.mul(this.n).isInfinity(), "Invalid curve, G*N != O");
          }
          u.PresetCurve = P;
          function K(e, r) {
            Object.defineProperty(u, e, {
              configurable: !0,
              enumerable: !0,
              get: function () {
                var o = new P(r);
                return (
                  Object.defineProperty(u, e, {
                    configurable: !0,
                    enumerable: !0,
                    value: o,
                  }),
                  o
                );
              },
            });
          }
          K("p192", {
            type: "short",
            prime: "p192",
            p: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",
            a: "ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",
            b: "64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",
            n: "ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",
            hash: z().sha256,
            gRed: !1,
            g: [
              "188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012",
              "07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811",
            ],
          }),
            K("p224", {
              type: "short",
              prime: "p224",
              p:
                "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",
              a:
                "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",
              b:
                "b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",
              n:
                "ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",
              hash: z().sha256,
              gRed: !1,
              g: [
                "b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21",
                "bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34",
              ],
            }),
            K("p256", {
              type: "short",
              prime: null,
              p:
                "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",
              a:
                "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",
              b:
                "5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",
              n:
                "ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",
              hash: z().sha256,
              gRed: !1,
              g: [
                "6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296",
                "4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5",
              ],
            }),
            K("p384", {
              type: "short",
              prime: null,
              p:
                "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",
              a:
                "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",
              b:
                "b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",
              n:
                "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",
              hash: z().sha384,
              gRed: !1,
              g: [
                "aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7",
                "3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f",
              ],
            }),
            K("p521", {
              type: "short",
              prime: null,
              p:
                "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",
              a:
                "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",
              b:
                "00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",
              n:
                "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",
              hash: z().sha512,
              gRed: !1,
              g: [
                "000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66",
                "00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650",
              ],
            }),
            K("curve25519", {
              type: "mont",
              prime: "p25519",
              p:
                "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
              a: "76d06",
              b: "1",
              n:
                "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
              hash: z().sha256,
              gRed: !1,
              g: ["9"],
            }),
            K("ed25519", {
              type: "edwards",
              prime: "p25519",
              p:
                "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
              a: "-1",
              c: "1",
              d:
                "52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",
              n:
                "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
              hash: z().sha256,
              gRed: !1,
              g: [
                "216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a",
                "6666666666666666666666666666666666666666666666666666666666666658",
              ],
            });
          var a;
          try {
            a = null.crash();
          } catch (e) {
            a = void 0;
          }
          K("secp256k1", {
            type: "short",
            prime: "k256",
            p:
              "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
            a: "0",
            b: "7",
            n:
              "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
            h: "1",
            hash: z().sha256,
            beta:
              "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
            lambda:
              "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
            basis: [
              {
                a: "3086d221a7d46bcde86c90e49284eb15",
                b: "-e4437ed6010e88286f547fa90abfe4c3",
              },
              {
                a: "114ca50f7a8e2f3f657c1108d9d44cfd8",
                b: "3086d221a7d46bcde86c90e49284eb15",
              },
            ],
            gRed: !1,
            g: [
              "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
              "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
              a,
            ],
          });
        });
      function B(M) {
        if (!(this instanceof B)) return new B(M);
        (this.hash = M.hash),
          (this.predResist = !!M.predResist),
          (this.outLen = this.hash.outSize),
          (this.minEntropy = M.minEntropy || this.hash.hmacStrength),
          (this._reseed = null),
          (this.reseedInterval = null),
          (this.K = null),
          (this.V = null);
        var t = N.toArray(M.entropy, M.entropyEnc || "hex"),
          u = N.toArray(M.nonce, M.nonceEnc || "hex"),
          h = N.toArray(M.pers, M.persEnc || "hex");
        V(
          t.length >= this.minEntropy / 8,
          "Not enough entropy. Minimum is: " + this.minEntropy + " bits"
        ),
          this._init(t, u, h);
      }
      var X = B;
      (B.prototype._init = function (t, u, h) {
        var P = t.concat(u).concat(h);
        (this.K = new Array(this.outLen / 8)),
          (this.V = new Array(this.outLen / 8));
        for (var K = 0; K < this.V.length; K++)
          (this.K[K] = 0), (this.V[K] = 1);
        this._update(P),
          (this._reseed = 1),
          (this.reseedInterval = 281474976710656);
      }),
        (B.prototype._hmac = function () {
          return new (z().hmac)(this.hash, this.K);
        }),
        (B.prototype._update = function (t) {
          var u = this._hmac().update(this.V).update([0]);
          t && (u = u.update(t)),
            (this.K = u.digest()),
            (this.V = this._hmac().update(this.V).digest()),
            !!t &&
              ((this.K = this._hmac()
                .update(this.V)
                .update([1])
                .update(t)
                .digest()),
              (this.V = this._hmac().update(this.V).digest()));
        }),
        (B.prototype.reseed = function (t, u, h, P) {
          typeof u != "string" && ((P = h), (h = u), (u = null)),
            (t = N.toArray(t, u)),
            (h = N.toArray(h, P)),
            V(
              t.length >= this.minEntropy / 8,
              "Not enough entropy. Minimum is: " + this.minEntropy + " bits"
            ),
            this._update(t.concat(h || [])),
            (this._reseed = 1);
        }),
        (B.prototype.generate = function (t, u, h, P) {
          if (this._reseed > this.reseedInterval)
            throw new Error("Reseed is required");
          typeof u != "string" && ((P = h), (h = u), (u = null)),
            h && ((h = N.toArray(h, P || "hex")), this._update(h));
          for (var K = []; K.length < t; )
            (this.V = this._hmac().update(this.V).digest()),
              (K = K.concat(this.V));
          var a = K.slice(0, t);
          return this._update(h), this._reseed++, N.encode(a, u);
        });
      var D = L.assert;
      function d(M, t) {
        (this.ec = M),
          (this.priv = null),
          (this.pub = null),
          t.priv && this._importPrivate(t.priv, t.privEnc),
          t.pub && this._importPublic(t.pub, t.pubEnc);
      }
      var i = d;
      (d.fromPublic = function (t, u, h) {
        return u instanceof d ? u : new d(t, { pub: u, pubEnc: h });
      }),
        (d.fromPrivate = function (t, u, h) {
          return u instanceof d ? u : new d(t, { priv: u, privEnc: h });
        }),
        (d.prototype.validate = function () {
          var t = this.getPublic();
          return t.isInfinity()
            ? { result: !1, reason: "Invalid public key" }
            : t.validate()
            ? t.mul(this.ec.curve.n).isInfinity()
              ? { result: !0, reason: null }
              : { result: !1, reason: "Public key * N != O" }
            : { result: !1, reason: "Public key is not a point" };
        }),
        (d.prototype.getPublic = function (t, u) {
          return (
            typeof t == "string" && ((u = t), (t = null)),
            this.pub || (this.pub = this.ec.g.mul(this.priv)),
            u ? this.pub.encode(u, t) : this.pub
          );
        }),
        (d.prototype.getPrivate = function (t) {
          return t === "hex" ? this.priv.toString(16, 2) : this.priv;
        }),
        (d.prototype._importPrivate = function (t, u) {
          (this.priv = new (v())(t, u || 16)),
            (this.priv = this.priv.umod(this.ec.curve.n));
        }),
        (d.prototype._importPublic = function (t, u) {
          if (t.x || t.y) {
            this.ec.curve.type === "mont"
              ? D(t.x, "Need x coordinate")
              : (this.ec.curve.type === "short" ||
                  this.ec.curve.type === "edwards") &&
                D(t.x && t.y, "Need both x and y coordinate"),
              (this.pub = this.ec.curve.point(t.x, t.y));
            return;
          }
          this.pub = this.ec.curve.decodePoint(t, u);
        }),
        (d.prototype.derive = function (t) {
          return (
            t.validate() || D(t.validate(), "public point not validated"),
            t.mul(this.priv).getX()
          );
        }),
        (d.prototype.sign = function (t, u, h) {
          return this.ec.sign(t, this, u, h);
        }),
        (d.prototype.verify = function (t, u) {
          return this.ec.verify(t, u, this);
        }),
        (d.prototype.inspect = function () {
          return (
            "<Key priv: " +
            (this.priv && this.priv.toString(16, 2)) +
            " pub: " +
            (this.pub && this.pub.inspect()) +
            " >"
          );
        });
      var b = L.assert;
      function I(M, t) {
        if (M instanceof I) return M;
        this._importDER(M, t) ||
          (b(M.r && M.s, "Signature without r or s"),
          (this.r = new (v())(M.r, 16)),
          (this.s = new (v())(M.s, 16)),
          M.recoveryParam === void 0
            ? (this.recoveryParam = null)
            : (this.recoveryParam = M.recoveryParam));
      }
      var J = I;
      function A() {
        this.place = 0;
      }
      function $(M, t) {
        var u = M[t.place++];
        if (!(u & 128)) return u;
        var h = u & 15;
        if (h === 0 || h > 4) return !1;
        for (var P = 0, K = 0, a = t.place; K < h; K++, a++)
          (P <<= 8), (P |= M[a]), (P >>>= 0);
        return P <= 127 ? !1 : ((t.place = a), P);
      }
      function xe(M) {
        for (var t = 0, u = M.length - 1; !M[t] && !(M[t + 1] & 128) && t < u; )
          t++;
        return t === 0 ? M : M.slice(t);
      }
      I.prototype._importDER = function (t, u) {
        t = L.toArray(t, u);
        var h = new A();
        if (t[h.place++] !== 48) return !1;
        var P = $(t, h);
        if (P === !1 || P + h.place !== t.length || t[h.place++] !== 2)
          return !1;
        var K = $(t, h);
        if (K === !1) return !1;
        var a = t.slice(h.place, K + h.place);
        if (((h.place += K), t[h.place++] !== 2)) return !1;
        var e = $(t, h);
        if (e === !1 || t.length !== e + h.place) return !1;
        var r = t.slice(h.place, e + h.place);
        if (a[0] === 0)
          if (a[1] & 128) a = a.slice(1);
          else return !1;
        if (r[0] === 0)
          if (r[1] & 128) r = r.slice(1);
          else return !1;
        return (
          (this.r = new (v())(a)),
          (this.s = new (v())(r)),
          (this.recoveryParam = null),
          !0
        );
      };
      function be(M, t) {
        if (t < 128) {
          M.push(t);
          return;
        }
        var u = 1 + ((Math.log(t) / Math.LN2) >>> 3);
        for (M.push(u | 128); --u; ) M.push((t >>> (u << 3)) & 255);
        M.push(t);
      }
      I.prototype.toDER = function (t) {
        var u = this.r.toArray(),
          h = this.s.toArray();
        for (
          u[0] & 128 && (u = [0].concat(u)),
            h[0] & 128 && (h = [0].concat(h)),
            u = xe(u),
            h = xe(h);
          !h[0] && !(h[1] & 128);

        )
          h = h.slice(1);
        var P = [2];
        be(P, u.length), (P = P.concat(u)), P.push(2), be(P, h.length);
        var K = P.concat(h),
          a = [48];
        return be(a, K.length), (a = a.concat(K)), L.encode(a, t);
      };
      var ce = function () {
          throw new Error("unsupported");
        },
        me = L.assert;
      function Se(M) {
        if (!(this instanceof Se)) return new Se(M);
        typeof M == "string" &&
          (me(Object.prototype.hasOwnProperty.call(g, M), "Unknown curve " + M),
          (M = g[M])),
          M instanceof g.PresetCurve && (M = { curve: M }),
          (this.curve = M.curve.curve),
          (this.n = this.curve.n),
          (this.nh = this.n.ushrn(1)),
          (this.g = this.curve.g),
          (this.g = M.curve.g),
          this.g.precompute(M.curve.n.bitLength() + 1),
          (this.hash = M.hash || M.curve.hash);
      }
      var Be = Se;
      (Se.prototype.keyPair = function (t) {
        return new i(this, t);
      }),
        (Se.prototype.keyFromPrivate = function (t, u) {
          return i.fromPrivate(this, t, u);
        }),
        (Se.prototype.keyFromPublic = function (t, u) {
          return i.fromPublic(this, t, u);
        }),
        (Se.prototype.genKeyPair = function (t) {
          t || (t = {});
          for (
            var u = new X({
                hash: this.hash,
                pers: t.pers,
                persEnc: t.persEnc || "utf8",
                entropy: t.entropy || ce(this.hash.hmacStrength),
                entropyEnc: (t.entropy && t.entropyEnc) || "utf8",
                nonce: this.n.toArray(),
              }),
              h = this.n.byteLength(),
              P = this.n.sub(new (v())(2));
            ;

          ) {
            var K = new (v())(u.generate(h));
            if (!(K.cmp(P) > 0)) return K.iaddn(1), this.keyFromPrivate(K);
          }
        }),
        (Se.prototype._truncateToN = function (t, u) {
          var h = t.byteLength() * 8 - this.n.bitLength();
          return (
            h > 0 && (t = t.ushrn(h)),
            !u && t.cmp(this.n) >= 0 ? t.sub(this.n) : t
          );
        }),
        (Se.prototype.sign = function (t, u, h, P) {
          typeof h == "object" && ((P = h), (h = null)),
            P || (P = {}),
            (u = this.keyFromPrivate(u, h)),
            (t = this._truncateToN(new (v())(t, 16)));
          for (
            var K = this.n.byteLength(),
              a = u.getPrivate().toArray("be", K),
              e = t.toArray("be", K),
              r = new X({
                hash: this.hash,
                entropy: a,
                nonce: e,
                pers: P.pers,
                persEnc: P.persEnc || "utf8",
              }),
              o = this.n.sub(new (v())(1)),
              s = 0;
            ;
            s++
          ) {
            var f = P.k ? P.k(s) : new (v())(r.generate(this.n.byteLength()));
            if (
              ((f = this._truncateToN(f, !0)),
              !(f.cmpn(1) <= 0 || f.cmp(o) >= 0))
            ) {
              var S = this.g.mul(f);
              if (!S.isInfinity()) {
                var j = S.getX(),
                  q = j.umod(this.n);
                if (q.cmpn(0) !== 0) {
                  var re = f.invm(this.n).mul(q.mul(u.getPrivate()).iadd(t));
                  if (((re = re.umod(this.n)), re.cmpn(0) !== 0)) {
                    var le =
                      (S.getY().isOdd() ? 1 : 0) | (j.cmp(q) !== 0 ? 2 : 0);
                    return (
                      P.canonical &&
                        re.cmp(this.nh) > 0 &&
                        ((re = this.n.sub(re)), (le ^= 1)),
                      new J({ r: q, s: re, recoveryParam: le })
                    );
                  }
                }
              }
            }
          }
        }),
        (Se.prototype.verify = function (t, u, h, P) {
          (t = this._truncateToN(new (v())(t, 16))),
            (h = this.keyFromPublic(h, P)),
            (u = new J(u, "hex"));
          var K = u.r,
            a = u.s;
          if (
            K.cmpn(1) < 0 ||
            K.cmp(this.n) >= 0 ||
            a.cmpn(1) < 0 ||
            a.cmp(this.n) >= 0
          )
            return !1;
          var e = a.invm(this.n),
            r = e.mul(t).umod(this.n),
            o = e.mul(K).umod(this.n),
            s;
          return this.curve._maxwellTrick
            ? ((s = this.g.jmulAdd(r, h.getPublic(), o)),
              s.isInfinity() ? !1 : s.eqXToP(K))
            : ((s = this.g.mulAdd(r, h.getPublic(), o)),
              s.isInfinity() ? !1 : s.getX().umod(this.n).cmp(K) === 0);
        }),
        (Se.prototype.recoverPubKey = function (M, t, u, h) {
          me((3 & u) === u, "The recovery param is more than two bits"),
            (t = new J(t, h));
          var P = this.n,
            K = new (v())(M),
            a = t.r,
            e = t.s,
            r = u & 1,
            o = u >> 1;
          if (a.cmp(this.curve.p.umod(this.curve.n)) >= 0 && o)
            throw new Error("Unable to find sencond key candinate");
          o
            ? (a = this.curve.pointFromX(a.add(this.curve.n), r))
            : (a = this.curve.pointFromX(a, r));
          var s = t.r.invm(P),
            f = P.sub(K).mul(s).umod(P),
            S = e.mul(s).umod(P);
          return this.g.mulAdd(f, a, S);
        }),
        (Se.prototype.getKeyRecoveryParam = function (M, t, u, h) {
          if (((t = new J(t, h)), t.recoveryParam !== null))
            return t.recoveryParam;
          for (var P = 0; P < 4; P++) {
            var K;
            try {
              K = this.recoverPubKey(M, t, P);
            } catch (a) {
              continue;
            }
            if (K.eq(u)) return P;
          }
          throw new Error("Unable to find valid recovery factor");
        });
      var Ee = Y(function (M, t) {
          "use strict";
          var u = t;
          (u.version = { version: "6.5.4" }.version),
            (u.utils = L),
            (u.rand = function () {
              throw new Error("unsupported");
            }),
            (u.curve = w),
            (u.curves = g),
            (u.ec = Be),
            (u.eddsa = null);
        }),
        Re = Ee.ec,
        Te = k(3286),
        Pe = k(3587),
        De = k(711);
      const Je = "signing-key/5.0.10",
        ke = new De.Yd(Je);
      let Le = null;
      function ye() {
        return Le || (Le = new Re("secp256k1")), Le;
      }
      class Oe {
        constructor(t) {
          (0, Pe.zG)(this, "curve", "secp256k1"),
            (0, Pe.zG)(this, "privateKey", (0, Te.Dv)(t));
          const u = ye().keyFromPrivate((0, Te.lE)(this.privateKey));
          (0, Pe.zG)(this, "publicKey", "0x" + u.getPublic(!1, "hex")),
            (0, Pe.zG)(
              this,
              "compressedPublicKey",
              "0x" + u.getPublic(!0, "hex")
            ),
            (0, Pe.zG)(this, "_isSigningKey", !0);
        }
        _addPoint(t) {
          const u = ye().keyFromPublic((0, Te.lE)(this.publicKey)),
            h = ye().keyFromPublic((0, Te.lE)(t));
          return "0x" + u.pub.add(h.pub).encodeCompressed("hex");
        }
        signDigest(t) {
          const u = ye().keyFromPrivate((0, Te.lE)(this.privateKey)),
            h = (0, Te.lE)(t);
          h.length !== 32 &&
            ke.throwArgumentError("bad digest length", "digest", t);
          const P = u.sign(h, { canonical: !0 });
          return (0, Te.N)({
            recoveryParam: P.recoveryParam,
            r: (0, Te.$m)("0x" + P.r.toString(16), 32),
            s: (0, Te.$m)("0x" + P.s.toString(16), 32),
          });
        }
        computeSharedSecret(t) {
          const u = ye().keyFromPrivate((0, Te.lE)(this.privateKey)),
            h = ye().keyFromPublic((0, Te.lE)(Fe(t)));
          return (0, Te.$m)("0x" + u.derive(h.getPublic()).toString(16), 32);
        }
        static isSigningKey(t) {
          return !!(t && t._isSigningKey);
        }
      }
      function we(M, t) {
        const u = splitSignature(t),
          h = { r: arrayify(u.r), s: arrayify(u.s) };
        return (
          "0x" +
          ye().recoverPubKey(arrayify(M), h, u.recoveryParam).encode("hex", !1)
        );
      }
      function Fe(M, t) {
        const u = (0, Te.lE)(M);
        if (u.length === 32) {
          const h = new Oe(u);
          return t
            ? "0x" + ye().keyFromPrivate(u).getPublic(!0, "hex")
            : h.publicKey;
        } else {
          if (u.length === 33)
            return t
              ? (0, Te.Dv)(u)
              : "0x" + ye().keyFromPublic(u).getPublic(!1, "hex");
          if (u.length === 65)
            return t
              ? "0x" + ye().keyFromPublic(u).getPublic(!0, "hex")
              : (0, Te.Dv)(u);
        }
        return ke.throwArgumentError(
          "invalid public or private key",
          "key",
          "[REDACTED]"
        );
      }
    },
    4242: (Ae, W, k) => {
      "use strict";
      k.d(W, { Uj: () => G, Y0: () => V, ZN: () => H });
      var T = k(3286),
        v = k(711);
      const U = "strings/5.0.9",
        z = new v.Yd(U);
      var G;
      (function (n) {
        (n.current = ""),
          (n.NFC = "NFC"),
          (n.NFD = "NFD"),
          (n.NFKC = "NFKC"),
          (n.NFKD = "NFKD");
      })(G || (G = {}));
      var Q;
      (function (n) {
        (n.UNEXPECTED_CONTINUE = "unexpected continuation byte"),
          (n.BAD_PREFIX = "bad codepoint prefix"),
          (n.OVERRUN = "string overrun"),
          (n.MISSING_CONTINUE = "missing continuation byte"),
          (n.OUT_OF_RANGE = "out of UTF-8 range"),
          (n.UTF16_SURROGATE = "UTF-16 surrogate"),
          (n.OVERLONG = "overlong representation");
      })(Q || (Q = {}));
      function Y(n, y, O, R, ee) {
        return z.throwArgumentError(
          `invalid codepoint at offset ${y}; ${n}`,
          "bytes",
          O
        );
      }
      function m(n, y, O, R, ee) {
        if (n === Q.BAD_PREFIX || n === Q.UNEXPECTED_CONTINUE) {
          let ne = 0;
          for (let ie = y + 1; ie < O.length && O[ie] >> 6 == 2; ie++) ne++;
          return ne;
        }
        return n === Q.OVERRUN ? O.length - y - 1 : 0;
      }
      function ae(n, y, O, R, ee) {
        return n === Q.OVERLONG
          ? (R.push(ee), 0)
          : (R.push(65533), m(n, y, O, R, ee));
      }
      const te = Object.freeze({ error: Y, ignore: m, replace: ae });
      function oe(n, y) {
        y == null && (y = te.error), (n = (0, T.lE)(n));
        const O = [];
        let R = 0;
        for (; R < n.length; ) {
          const ee = n[R++];
          if (ee >> 7 == 0) {
            O.push(ee);
            continue;
          }
          let ne = null,
            ie = null;
          if ((ee & 224) == 192) (ne = 1), (ie = 127);
          else if ((ee & 240) == 224) (ne = 2), (ie = 2047);
          else if ((ee & 248) == 240) (ne = 3), (ie = 65535);
          else {
            (ee & 192) == 128
              ? (R += y(Q.UNEXPECTED_CONTINUE, R - 1, n, O))
              : (R += y(Q.BAD_PREFIX, R - 1, n, O));
            continue;
          }
          if (R - 1 + ne >= n.length) {
            R += y(Q.OVERRUN, R - 1, n, O);
            continue;
          }
          let c = ee & ((1 << (8 - ne - 1)) - 1);
          for (let E = 0; E < ne; E++) {
            let p = n[R];
            if ((p & 192) != 128) {
              (R += y(Q.MISSING_CONTINUE, R, n, O)), (c = null);
              break;
            }
            (c = (c << 6) | (p & 63)), R++;
          }
          if (c !== null) {
            if (c > 1114111) {
              R += y(Q.OUT_OF_RANGE, R - 1 - ne, n, O, c);
              continue;
            }
            if (c >= 55296 && c <= 57343) {
              R += y(Q.UTF16_SURROGATE, R - 1 - ne, n, O, c);
              continue;
            }
            if (c <= ie) {
              R += y(Q.OVERLONG, R - 1 - ne, n, O, c);
              continue;
            }
            O.push(c);
          }
        }
        return O;
      }
      function V(n, y = G.current) {
        y != G.current && (z.checkNormalize(), (n = n.normalize(y)));
        let O = [];
        for (let R = 0; R < n.length; R++) {
          const ee = n.charCodeAt(R);
          if (ee < 128) O.push(ee);
          else if (ee < 2048) O.push((ee >> 6) | 192), O.push((ee & 63) | 128);
          else if ((ee & 64512) == 55296) {
            R++;
            const ne = n.charCodeAt(R);
            if (R >= n.length || (ne & 64512) != 56320)
              throw new Error("invalid utf-8 string");
            const ie = 65536 + ((ee & 1023) << 10) + (ne & 1023);
            O.push((ie >> 18) | 240),
              O.push(((ie >> 12) & 63) | 128),
              O.push(((ie >> 6) & 63) | 128),
              O.push((ie & 63) | 128);
          } else
            O.push((ee >> 12) | 224),
              O.push(((ee >> 6) & 63) | 128),
              O.push((ee & 63) | 128);
        }
        return (0, T.lE)(O);
      }
      function x(n) {
        const y = "0000" + n.toString(16);
        return "\\u" + y.substring(y.length - 4);
      }
      function N(n, y) {
        return (
          '"' +
          oe(n, y)
            .map((O) => {
              if (O < 256) {
                switch (O) {
                  case 8:
                    return "\\b";
                  case 9:
                    return "\\t";
                  case 10:
                    return "\\n";
                  case 13:
                    return "\\r";
                  case 34:
                    return '\\"';
                  case 92:
                    return "\\\\";
                }
                if (O >= 32 && O < 127) return String.fromCharCode(O);
              }
              return O <= 65535
                ? x(O)
                : ((O -= 65536),
                  x(((O >> 10) & 1023) + 55296) + x((O & 1023) + 56320));
            })
            .join("") +
          '"'
        );
      }
      function L(n) {
        return n
          .map((y) =>
            y <= 65535
              ? String.fromCharCode(y)
              : ((y -= 65536),
                String.fromCharCode(
                  ((y >> 10) & 1023) + 55296,
                  (y & 1023) + 56320
                ))
          )
          .join("");
      }
      function H(n, y) {
        return L(oe(n, y));
      }
      function F(n, y = G.current) {
        return oe(V(n, y));
      }
    },
    1421: (Ae, W, k) => {
      "use strict";
      k.d(W, { db: () => ee, qC: () => ie });
      var T = k(4594),
        v = k(3286),
        U = k(8197),
        z = k(3587),
        G = k(711);
      const Q = "rlp/5.0.8",
        Y = new G.Yd(Q);
      function m(E) {
        const p = [];
        for (; E; ) p.unshift(E & 255), (E >>= 8);
        return p;
      }
      function ae(E, p, w) {
        let g = 0;
        for (let B = 0; B < w; B++) g = g * 256 + E[p + B];
        return g;
      }
      function te(E) {
        if (Array.isArray(E)) {
          let g = [];
          if (
            (E.forEach(function (X) {
              g = g.concat(te(X));
            }),
            g.length <= 55)
          )
            return g.unshift(192 + g.length), g;
          const B = m(g.length);
          return B.unshift(247 + B.length), B.concat(g);
        }
        (0, v.Zq)(E) ||
          Y.throwArgumentError("RLP object must be BytesLike", "object", E);
        const p = Array.prototype.slice.call((0, v.lE)(E));
        if (p.length === 1 && p[0] <= 127) return p;
        if (p.length <= 55) return p.unshift(128 + p.length), p;
        const w = m(p.length);
        return w.unshift(183 + w.length), w.concat(p);
      }
      function oe(E) {
        return (0, v.Dv)(te(E));
      }
      function V(E, p, w, g) {
        const B = [];
        for (; w < p + 1 + g; ) {
          const X = x(E, w);
          B.push(X.result),
            (w += X.consumed),
            w > p + 1 + g &&
              Y.throwError(
                "child data too short",
                Logger.errors.BUFFER_OVERRUN,
                {}
              );
        }
        return { consumed: 1 + g, result: B };
      }
      function x(E, p) {
        if (
          (E.length === 0 &&
            Y.throwError("data too short", Logger.errors.BUFFER_OVERRUN, {}),
          E[p] >= 248)
        ) {
          const w = E[p] - 247;
          p + 1 + w > E.length &&
            Y.throwError(
              "data short segment too short",
              Logger.errors.BUFFER_OVERRUN,
              {}
            );
          const g = ae(E, p + 1, w);
          return (
            p + 1 + w + g > E.length &&
              Y.throwError(
                "data long segment too short",
                Logger.errors.BUFFER_OVERRUN,
                {}
              ),
            V(E, p, p + 1 + w, w + g)
          );
        } else if (E[p] >= 192) {
          const w = E[p] - 192;
          return (
            p + 1 + w > E.length &&
              Y.throwError(
                "data array too short",
                Logger.errors.BUFFER_OVERRUN,
                {}
              ),
            V(E, p, p + 1, w)
          );
        } else if (E[p] >= 184) {
          const w = E[p] - 183;
          p + 1 + w > E.length &&
            Y.throwError(
              "data array too short",
              Logger.errors.BUFFER_OVERRUN,
              {}
            );
          const g = ae(E, p + 1, w);
          p + 1 + w + g > E.length &&
            Y.throwError(
              "data array too short",
              Logger.errors.BUFFER_OVERRUN,
              {}
            );
          const B = hexlify(E.slice(p + 1 + w, p + 1 + w + g));
          return { consumed: 1 + w + g, result: B };
        } else if (E[p] >= 128) {
          const w = E[p] - 128;
          p + 1 + w > E.length &&
            Y.throwError("data too short", Logger.errors.BUFFER_OVERRUN, {});
          const g = hexlify(E.slice(p + 1, p + 1 + w));
          return { consumed: 1 + w, result: g };
        }
        return { consumed: 1, result: hexlify(E[p]) };
      }
      function N(E) {
        const p = arrayify(E),
          w = x(p, 0);
        return (
          w.consumed !== p.length &&
            Y.throwArgumentError("invalid rlp data", "data", E),
          w.result
        );
      }
      var L = k(2768);
      const H = "transactions/5.0.10",
        F = new G.Yd(H);
      function n(E) {
        return E === "0x" ? null : getAddress(E);
      }
      function y(E) {
        return E === "0x" ? Zero : BigNumber.from(E);
      }
      const O = [
          { name: "nonce", maxLength: 32, numeric: !0 },
          { name: "gasPrice", maxLength: 32, numeric: !0 },
          { name: "gasLimit", maxLength: 32, numeric: !0 },
          { name: "to", length: 20 },
          { name: "value", maxLength: 32, numeric: !0 },
          { name: "data" },
        ],
        R = {
          chainId: !0,
          data: !0,
          gasLimit: !0,
          gasPrice: !0,
          nonce: !0,
          to: !0,
          value: !0,
        };
      function ee(E) {
        const p = (0, L.VW)(E);
        return (0, T.Kn)((0, v.p3)((0, U.w)((0, v.p3)(p, 1)), 12));
      }
      function ne(E, p) {
        return ee(recoverPublicKey(arrayify(E), p));
      }
      function ie(E, p) {
        (0, z.uj)(E, R);
        const w = [];
        O.forEach(function (D) {
          let d = E[D.name] || [];
          const i = {};
          D.numeric && (i.hexPad = "left"),
            (d = (0, v.lE)((0, v.Dv)(d, i))),
            D.length &&
              d.length !== D.length &&
              d.length > 0 &&
              F.throwArgumentError(
                "invalid length for " + D.name,
                "transaction:" + D.name,
                d
              ),
            D.maxLength &&
              ((d = (0, v.G1)(d)),
              d.length > D.maxLength &&
                F.throwArgumentError(
                  "invalid length for " + D.name,
                  "transaction:" + D.name,
                  d
                )),
            w.push((0, v.Dv)(d));
        });
        let g = 0;
        if (
          (E.chainId != null
            ? ((g = E.chainId),
              typeof g != "number" &&
                F.throwArgumentError(
                  "invalid transaction.chainId",
                  "transaction",
                  E
                ))
            : p &&
              !(0, v.Zq)(p) &&
              p.v > 28 &&
              (g = Math.floor((p.v - 35) / 2)),
          g !== 0 && (w.push((0, v.Dv)(g)), w.push("0x"), w.push("0x")),
          !p)
        )
          return oe(w);
        const B = (0, v.N)(p);
        let X = 27 + B.recoveryParam;
        return (
          g !== 0
            ? (w.pop(),
              w.pop(),
              w.pop(),
              (X += g * 2 + 8),
              B.v > 28 &&
                B.v !== X &&
                F.throwArgumentError(
                  "transaction.chainId/signature.v mismatch",
                  "signature",
                  p
                ))
            : B.v !== X &&
              F.throwArgumentError(
                "transaction.chainId/signature.v mismatch",
                "signature",
                p
              ),
          w.push((0, v.Dv)(X)),
          w.push((0, v.G1)((0, v.lE)(B.r))),
          w.push((0, v.G1)((0, v.lE)(B.s))),
          oe(w)
        );
      }
      function c(E) {
        const p = RLP.decode(E);
        p.length !== 9 &&
          p.length !== 6 &&
          F.throwArgumentError("invalid raw transaction", "rawTransaction", E);
        const w = {
          nonce: y(p[0]).toNumber(),
          gasPrice: y(p[1]),
          gasLimit: y(p[2]),
          to: n(p[3]),
          value: y(p[4]),
          data: p[5],
          chainId: 0,
        };
        if (p.length === 6) return w;
        try {
          w.v = BigNumber.from(p[6]).toNumber();
        } catch (g) {
          return console.log(g), w;
        }
        if (
          ((w.r = hexZeroPad(p[7], 32)),
          (w.s = hexZeroPad(p[8], 32)),
          BigNumber.from(w.r).isZero() && BigNumber.from(w.s).isZero())
        )
          (w.chainId = w.v), (w.v = 0);
        else {
          (w.chainId = Math.floor((w.v - 35) / 2)),
            w.chainId < 0 && (w.chainId = 0);
          let g = w.v - 27;
          const B = p.slice(0, 6);
          w.chainId !== 0 &&
            (B.push(hexlify(w.chainId)),
            B.push("0x"),
            B.push("0x"),
            (g -= w.chainId * 2 + 8));
          const X = keccak256(RLP.encode(B));
          try {
            w.from = ne(X, {
              r: hexlify(w.r),
              s: hexlify(w.s),
              recoveryParam: g,
            });
          } catch (D) {
            console.log(D);
          }
          w.hash = keccak256(E);
        }
        return w;
      }
    },
    8586: (Ae, W, k) => {
      "use strict";
      k.d(W, { w5: () => Ue });
      var T = k(4594),
        v = k(3587),
        U = k(711);
      const z = "abstract-provider/5.0.9",
        G = new U.Yd(z);
      class Q extends null {
        static isForkEvent(l) {
          return !!(l && l._isForkEvent);
        }
      }
      class Y extends null {
        constructor(l, C) {
          isHexString(l, 32) ||
            G.throwArgumentError("invalid blockHash", "blockHash", l),
            super({
              _isForkEvent: !0,
              _isBlockForkEvent: !0,
              expiry: C || 0,
              blockHash: l,
            });
        }
      }
      class m extends null {
        constructor(l, C) {
          isHexString(l, 32) ||
            G.throwArgumentError("invalid transaction hash", "hash", l),
            super({
              _isForkEvent: !0,
              _isTransactionForkEvent: !0,
              expiry: C || 0,
              hash: l,
            });
        }
      }
      class ae extends null {
        constructor(l, C, _) {
          isHexString(l, 32) ||
            G.throwArgumentError("invalid transaction hash", "beforeHash", l),
            isHexString(C, 32) ||
              G.throwArgumentError("invalid transaction hash", "afterHash", C),
            super({
              _isForkEvent: !0,
              _isTransactionOrderForkEvent: !0,
              expiry: _ || 0,
              beforeHash: l,
              afterHash: C,
            });
        }
      }
      class te {
        constructor() {
          G.checkAbstract(new.target, te), (0, v.zG)(this, "_isProvider", !0);
        }
        addListener(l, C) {
          return this.on(l, C);
        }
        removeListener(l, C) {
          return this.off(l, C);
        }
        static isProvider(l) {
          return !!(l && l._isProvider);
        }
      }
      const oe = "abstract-signer/5.0.13";
      var V = function (Z, l, C, _) {
        function se(de) {
          return de instanceof C
            ? de
            : new C(function (he) {
                he(de);
              });
        }
        return new (C || (C = Promise))(function (de, he) {
          function ue(ve) {
            try {
              ge(_.next(ve));
            } catch (Ce) {
              he(Ce);
            }
          }
          function pe(ve) {
            try {
              ge(_.throw(ve));
            } catch (Ce) {
              he(Ce);
            }
          }
          function ge(ve) {
            ve.done ? de(ve.value) : se(ve.value).then(ue, pe);
          }
          ge((_ = _.apply(Z, l || [])).next());
        });
      };
      const x = new U.Yd(oe),
        N = [
          "chainId",
          "data",
          "from",
          "gasLimit",
          "gasPrice",
          "nonce",
          "to",
          "value",
        ],
        L = [
          U.Yd.errors.INSUFFICIENT_FUNDS,
          U.Yd.errors.NONCE_EXPIRED,
          U.Yd.errors.REPLACEMENT_UNDERPRICED,
        ];
      class H {
        constructor() {
          x.checkAbstract(new.target, H), (0, v.zG)(this, "_isSigner", !0);
        }
        getBalance(l) {
          return V(this, void 0, void 0, function* () {
            return (
              this._checkProvider("getBalance"),
              yield this.provider.getBalance(this.getAddress(), l)
            );
          });
        }
        getTransactionCount(l) {
          return V(this, void 0, void 0, function* () {
            return (
              this._checkProvider("getTransactionCount"),
              yield this.provider.getTransactionCount(this.getAddress(), l)
            );
          });
        }
        estimateGas(l) {
          return V(this, void 0, void 0, function* () {
            this._checkProvider("estimateGas");
            const C = yield (0, v.mE)(this.checkTransaction(l));
            return yield this.provider.estimateGas(C);
          });
        }
        call(l, C) {
          return V(this, void 0, void 0, function* () {
            this._checkProvider("call");
            const _ = yield (0, v.mE)(this.checkTransaction(l));
            return yield this.provider.call(_, C);
          });
        }
        sendTransaction(l) {
          return (
            this._checkProvider("sendTransaction"),
            this.populateTransaction(l).then((C) =>
              this.signTransaction(C).then((_) =>
                this.provider.sendTransaction(_)
              )
            )
          );
        }
        getChainId() {
          return V(this, void 0, void 0, function* () {
            return (
              this._checkProvider("getChainId"),
              (yield this.provider.getNetwork()).chainId
            );
          });
        }
        getGasPrice() {
          return V(this, void 0, void 0, function* () {
            return (
              this._checkProvider("getGasPrice"),
              yield this.provider.getGasPrice()
            );
          });
        }
        resolveName(l) {
          return V(this, void 0, void 0, function* () {
            return (
              this._checkProvider("resolveName"),
              yield this.provider.resolveName(l)
            );
          });
        }
        checkTransaction(l) {
          for (const _ in l)
            N.indexOf(_) === -1 &&
              x.throwArgumentError(
                "invalid transaction key: " + _,
                "transaction",
                l
              );
          const C = (0, v.DC)(l);
          return (
            C.from == null
              ? (C.from = this.getAddress())
              : (C.from = Promise.all([
                  Promise.resolve(C.from),
                  this.getAddress(),
                ]).then(
                  (_) => (
                    _[0].toLowerCase() !== _[1].toLowerCase() &&
                      x.throwArgumentError(
                        "from address mismatch",
                        "transaction",
                        l
                      ),
                    _[0]
                  )
                )),
            C
          );
        }
        populateTransaction(l) {
          return V(this, void 0, void 0, function* () {
            const C = yield (0, v.mE)(this.checkTransaction(l));
            return (
              C.to != null &&
                (C.to = Promise.resolve(C.to).then((_) =>
                  V(this, void 0, void 0, function* () {
                    if (_ == null) return null;
                    const se = yield this.resolveName(_);
                    return (
                      se == null &&
                        x.throwArgumentError(
                          "provided ENS name resolves to null",
                          "tx.to",
                          _
                        ),
                      se
                    );
                  })
                )),
              C.gasPrice == null && (C.gasPrice = this.getGasPrice()),
              C.nonce == null &&
                (C.nonce = this.getTransactionCount("pending")),
              C.gasLimit == null &&
                (C.gasLimit = this.estimateGas(C).catch((_) => {
                  if (L.indexOf(_.code) >= 0) throw _;
                  return x.throwError(
                    "cannot estimate gas; transaction may fail or may require manual gas limit",
                    U.Yd.errors.UNPREDICTABLE_GAS_LIMIT,
                    { error: _, tx: C }
                  );
                })),
              C.chainId == null
                ? (C.chainId = this.getChainId())
                : (C.chainId = Promise.all([
                    Promise.resolve(C.chainId),
                    this.getChainId(),
                  ]).then(
                    (_) => (
                      _[1] !== 0 &&
                        _[0] !== _[1] &&
                        x.throwArgumentError(
                          "chainId address mismatch",
                          "transaction",
                          l
                        ),
                      _[0]
                    )
                  )),
              yield (0, v.mE)(C)
            );
          });
        }
        _checkProvider(l) {
          this.provider ||
            x.throwError(
              "missing provider",
              U.Yd.errors.UNSUPPORTED_OPERATION,
              { operation: l || "_checkProvider" }
            );
        }
        static isSigner(l) {
          return !!(l && l._isSigner);
        }
      }
      class F extends null {
        constructor(l, C) {
          x.checkNew(new.target, F),
            super(),
            defineReadOnly(this, "address", l),
            defineReadOnly(this, "provider", C || null);
        }
        getAddress() {
          return Promise.resolve(this.address);
        }
        _fail(l, C) {
          return Promise.resolve().then(() => {
            x.throwError(l, Logger.errors.UNSUPPORTED_OPERATION, {
              operation: C,
            });
          });
        }
        signMessage(l) {
          return this._fail("VoidSigner cannot sign messages", "signMessage");
        }
        signTransaction(l) {
          return this._fail(
            "VoidSigner cannot sign transactions",
            "signTransaction"
          );
        }
        _signTypedData(l, C, _) {
          return this._fail(
            "VoidSigner cannot sign typed data",
            "signTypedData"
          );
        }
        connect(l) {
          return new F(this.address, l);
        }
      }
      var n = k(3286),
        y = k(8197),
        O = k(4242);
      const R = `Ethereum Signed Message:
`;
      function ee(Z) {
        return (
          typeof Z == "string" && (Z = (0, O.Y0)(Z)),
          (0, y.w)((0, n.zo)([(0, O.Y0)(R), (0, O.Y0)(String(Z.length)), Z]))
        );
      }
      var ne = k(2593);
      const ie = "hash/5.0.11";
      var c = k(2046),
        E = function (Z, l, C, _) {
          function se(de) {
            return de instanceof C
              ? de
              : new C(function (he) {
                  he(de);
                });
          }
          return new (C || (C = Promise))(function (de, he) {
            function ue(ve) {
              try {
                ge(_.next(ve));
              } catch (Ce) {
                he(Ce);
              }
            }
            function pe(ve) {
              try {
                ge(_.throw(ve));
              } catch (Ce) {
                he(Ce);
              }
            }
            function ge(ve) {
              ve.done ? de(ve.value) : se(ve.value).then(ue, pe);
            }
            ge((_ = _.apply(Z, l || [])).next());
          });
        };
      const p = new U.Yd(ie),
        w = new Uint8Array(32);
      w.fill(0);
      const g = ne.O$.from(-1),
        B = ne.O$.from(0),
        X = ne.O$.from(1),
        D = ne.O$.from(
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        );
      function d(Z) {
        const l = (0, n.lE)(Z),
          C = l.length % 32;
        return C ? (0, n.xs)([l, w.slice(C)]) : (0, n.Dv)(l);
      }
      const i = (0, n.$m)(X.toHexString(), 32),
        b = (0, n.$m)(B.toHexString(), 32),
        I = {
          name: "string",
          version: "string",
          chainId: "uint256",
          verifyingContract: "address",
          salt: "bytes32",
        },
        J = ["name", "version", "chainId", "verifyingContract", "salt"];
      function A(Z) {
        return function (l) {
          return (
            typeof l != "string" &&
              p.throwArgumentError(
                `invalid domain value for ${JSON.stringify(Z)}`,
                `domain.${Z}`,
                l
              ),
            l
          );
        };
      }
      const $ = {
        name: A("name"),
        version: A("version"),
        chainId: function (Z) {
          try {
            return ne.O$.from(Z).toString();
          } catch (l) {}
          return p.throwArgumentError(
            'invalid domain value for "chainId"',
            "domain.chainId",
            Z
          );
        },
        verifyingContract: function (Z) {
          try {
            return (0, T.Kn)(Z).toLowerCase();
          } catch (l) {}
          return p.throwArgumentError(
            'invalid domain value "verifyingContract"',
            "domain.verifyingContract",
            Z
          );
        },
        salt: function (Z) {
          try {
            const l = (0, n.lE)(Z);
            if (l.length !== 32) throw new Error("bad length");
            return (0, n.Dv)(l);
          } catch (l) {}
          return p.throwArgumentError(
            'invalid domain value "salt"',
            "domain.salt",
            Z
          );
        },
      };
      function xe(Z) {
        {
          const l = Z.match(/^(u?)int(\d*)$/);
          if (l) {
            const C = l[1] === "",
              _ = parseInt(l[2] || "256");
            (_ % 8 != 0 || _ > 256 || (l[2] && l[2] !== String(_))) &&
              p.throwArgumentError("invalid numeric width", "type", Z);
            const se = D.mask(C ? _ - 1 : _),
              de = C ? se.add(X).mul(g) : B;
            return function (he) {
              const ue = ne.O$.from(he);
              return (
                (ue.lt(de) || ue.gt(se)) &&
                  p.throwArgumentError(
                    `value out-of-bounds for ${Z}`,
                    "value",
                    he
                  ),
                (0, n.$m)(ue.toTwos(256).toHexString(), 32)
              );
            };
          }
        }
        {
          const l = Z.match(/^bytes(\d+)$/);
          if (l) {
            const C = parseInt(l[1]);
            return (
              (C === 0 || C > 32 || l[1] !== String(C)) &&
                p.throwArgumentError("invalid bytes width", "type", Z),
              function (_) {
                return (
                  (0, n.lE)(_).length !== C &&
                    p.throwArgumentError(`invalid length for ${Z}`, "value", _),
                  d(_)
                );
              }
            );
          }
        }
        switch (Z) {
          case "address":
            return function (l) {
              return (0, n.$m)((0, T.Kn)(l), 32);
            };
          case "bool":
            return function (l) {
              return l ? i : b;
            };
          case "bytes":
            return function (l) {
              return (0, y.w)(l);
            };
          case "string":
            return function (l) {
              return (0, c.id)(l);
            };
        }
        return null;
      }
      function be(Z, l) {
        return `${Z}(${l
          .map(({ name: C, type: _ }) => _ + " " + C)
          .join(",")})`;
      }
      class ce {
        constructor(l) {
          (0, v.zG)(this, "types", Object.freeze((0, v.p$)(l))),
            (0, v.zG)(this, "_encoderCache", {}),
            (0, v.zG)(this, "_types", {});
          const C = {},
            _ = {},
            se = {};
          Object.keys(l).forEach((ue) => {
            (C[ue] = {}), (_[ue] = []), (se[ue] = {});
          });
          for (const ue in l) {
            const pe = {};
            l[ue].forEach((ge) => {
              pe[ge.name] &&
                p.throwArgumentError(
                  `duplicate variable name ${JSON.stringify(
                    ge.name
                  )} in ${JSON.stringify(ue)}`,
                  "types",
                  l
                ),
                (pe[ge.name] = !0);
              const ve = ge.type.match(/^([^\x5b]*)(\x5b|$)/)[1];
              ve === ue &&
                p.throwArgumentError(
                  `circular type reference to ${JSON.stringify(ve)}`,
                  "types",
                  l
                ),
                !xe(ve) &&
                  (_[ve] ||
                    p.throwArgumentError(
                      `unknown type ${JSON.stringify(ve)}`,
                      "types",
                      l
                    ),
                  _[ve].push(ue),
                  (C[ue][ve] = !0));
            });
          }
          const de = Object.keys(_).filter((ue) => _[ue].length === 0);
          de.length === 0
            ? p.throwArgumentError("missing primary type", "types", l)
            : de.length > 1 &&
              p.throwArgumentError(
                `ambiguous primary types or unused types: ${de
                  .map((ue) => JSON.stringify(ue))
                  .join(", ")}`,
                "types",
                l
              ),
            (0, v.zG)(this, "primaryType", de[0]);
          function he(ue, pe) {
            pe[ue] &&
              p.throwArgumentError(
                `circular type reference to ${JSON.stringify(ue)}`,
                "types",
                l
              ),
              (pe[ue] = !0),
              Object.keys(C[ue]).forEach((ge) => {
                !_[ge] ||
                  (he(ge, pe),
                  Object.keys(pe).forEach((ve) => {
                    se[ve][ge] = !0;
                  }));
              }),
              delete pe[ue];
          }
          he(this.primaryType, {});
          for (const ue in se) {
            const pe = Object.keys(se[ue]);
            pe.sort(),
              (this._types[ue] =
                be(ue, l[ue]) + pe.map((ge) => be(ge, l[ge])).join(""));
          }
        }
        getEncoder(l) {
          let C = this._encoderCache[l];
          return C || (C = this._encoderCache[l] = this._getEncoder(l)), C;
        }
        _getEncoder(l) {
          {
            const se = xe(l);
            if (se) return se;
          }
          const C = l.match(/^(.*)(\x5b(\d*)\x5d)$/);
          if (C) {
            const se = C[1],
              de = this.getEncoder(se),
              he = parseInt(C[3]);
            return (ue) => {
              he >= 0 &&
                ue.length !== he &&
                p.throwArgumentError(
                  "array length mismatch; expected length ${ arrayLength }",
                  "value",
                  ue
                );
              let pe = ue.map(de);
              return (
                this._types[se] && (pe = pe.map(y.w)), (0, y.w)((0, n.xs)(pe))
              );
            };
          }
          const _ = this.types[l];
          if (_) {
            const se = (0, c.id)(this._types[l]);
            return (de) => {
              const he = _.map(({ name: ue, type: pe }) => {
                const ge = this.getEncoder(pe)(de[ue]);
                return this._types[pe] ? (0, y.w)(ge) : ge;
              });
              return he.unshift(se), (0, n.xs)(he);
            };
          }
          return p.throwArgumentError(`unknown type: ${l}`, "type", l);
        }
        encodeType(l) {
          const C = this._types[l];
          return (
            C ||
              p.throwArgumentError(
                `unknown type: ${JSON.stringify(l)}`,
                "name",
                l
              ),
            C
          );
        }
        encodeData(l, C) {
          return this.getEncoder(l)(C);
        }
        hashStruct(l, C) {
          return (0, y.w)(this.encodeData(l, C));
        }
        encode(l) {
          return this.encodeData(this.primaryType, l);
        }
        hash(l) {
          return this.hashStruct(this.primaryType, l);
        }
        _visit(l, C, _) {
          if (xe(l)) return _(l, C);
          const se = l.match(/^(.*)(\x5b(\d*)\x5d)$/);
          if (se) {
            const he = se[1],
              ue = parseInt(se[3]);
            return (
              ue >= 0 &&
                C.length !== ue &&
                p.throwArgumentError(
                  "array length mismatch; expected length ${ arrayLength }",
                  "value",
                  C
                ),
              C.map((pe) => this._visit(he, pe, _))
            );
          }
          const de = this.types[l];
          return de
            ? de.reduce(
                (he, { name: ue, type: pe }) => (
                  (he[ue] = this._visit(pe, C[ue], _)), he
                ),
                {}
              )
            : p.throwArgumentError(`unknown type: ${l}`, "type", l);
        }
        visit(l, C) {
          return this._visit(this.primaryType, l, C);
        }
        static from(l) {
          return new ce(l);
        }
        static getPrimaryType(l) {
          return ce.from(l).primaryType;
        }
        static hashStruct(l, C, _) {
          return ce.from(C).hashStruct(l, _);
        }
        static hashDomain(l) {
          const C = [];
          for (const _ in l) {
            const se = I[_];
            se ||
              p.throwArgumentError(
                `invalid typed-data domain key: ${JSON.stringify(_)}`,
                "domain",
                l
              ),
              C.push({ name: _, type: se });
          }
          return (
            C.sort((_, se) => J.indexOf(_.name) - J.indexOf(se.name)),
            ce.hashStruct("EIP712Domain", { EIP712Domain: C }, l)
          );
        }
        static encode(l, C, _) {
          return (0, n.xs)(["0x1901", ce.hashDomain(l), ce.from(C).hash(_)]);
        }
        static hash(l, C, _) {
          return (0, y.w)(ce.encode(l, C, _));
        }
        static resolveNames(l, C, _, se) {
          return E(this, void 0, void 0, function* () {
            l = (0, v.DC)(l);
            const de = {};
            l.verifyingContract &&
              !(0, n.A7)(l.verifyingContract, 20) &&
              (de[l.verifyingContract] = "0x");
            const he = ce.from(C);
            he.visit(
              _,
              (ue, pe) => (
                ue === "address" && !(0, n.A7)(pe, 20) && (de[pe] = "0x"), pe
              )
            );
            for (const ue in de) de[ue] = yield se(ue);
            return (
              l.verifyingContract &&
                de[l.verifyingContract] &&
                (l.verifyingContract = de[l.verifyingContract]),
              (_ = he.visit(_, (ue, pe) =>
                ue === "address" && de[pe] ? de[pe] : pe
              )),
              { domain: l, value: _ }
            );
          });
        }
        static getPayload(l, C, _) {
          ce.hashDomain(l);
          const se = {},
            de = [];
          J.forEach((pe) => {
            const ge = l[pe];
            ge != null &&
              ((se[pe] = $[pe](ge)), de.push({ name: pe, type: I[pe] }));
          });
          const he = ce.from(C),
            ue = (0, v.DC)(C);
          return (
            ue.EIP712Domain
              ? p.throwArgumentError(
                  "types must not contain EIP712Domain type",
                  "types.EIP712Domain",
                  C
                )
              : (ue.EIP712Domain = de),
            he.encode(_),
            {
              types: ue,
              domain: se,
              primaryType: he.primaryType,
              message: he.visit(_, (pe, ge) => {
                if (pe.match(/^bytes(\d*)/)) return (0, n.Dv)((0, n.lE)(ge));
                if (pe.match(/^u?int/)) {
                  let ve = "",
                    Ce = ne.O$.from(ge);
                  return (
                    Ce.isNegative() && ((ve = "-"), (Ce = Ce.mul(-1))),
                    ve + (0, n.$P)(Ce.toHexString())
                  );
                }
                switch (pe) {
                  case "address":
                    return ge.toLowerCase();
                  case "bool":
                    return !!ge;
                  case "string":
                    return (
                      typeof ge != "string" &&
                        p.throwArgumentError("invalid string", "value", ge),
                      ge
                    );
                }
                return p.throwArgumentError("unsupported type", "type", pe);
              }),
            }
          );
        }
      }
      var me = k(3643);
      const Se = "random/5.0.8",
        Be = new U.Yd(Se);
      let Ee = null;
      try {
        if (((Ee = window), Ee == null)) throw new Error("try next");
      } catch (Z) {
        try {
          if (((Ee = global), Ee == null)) throw new Error("try next");
        } catch (l) {
          Ee = {};
        }
      }
      let Re = Ee.crypto || Ee.msCrypto;
      (!Re || !Re.getRandomValues) &&
        (Be.warn("WARNING: Missing strong random number source"),
        (Re = {
          getRandomValues: function (Z) {
            return Be.throwError(
              "no secure random source avaialble",
              U.Yd.errors.UNSUPPORTED_OPERATION,
              { operation: "crypto.getRandomValues" }
            );
          },
        }));
      function Te(Z) {
        (Z <= 0 || Z > 1024 || Z % 1) &&
          Be.throwArgumentError("invalid length", "length", Z);
        const l = new Uint8Array(Z);
        return Re.getRandomValues(l), (0, n.lE)(l);
      }
      var Pe = k(2768),
        De = k(8826),
        Je = k.n(De),
        ke = k(5306);
      const Le = "json-wallets/5.0.11";
      function ye(Z) {
        return (
          typeof Z == "string" && Z.substring(0, 2) !== "0x" && (Z = "0x" + Z),
          (0, n.lE)(Z)
        );
      }
      function Oe(Z, l) {
        for (Z = String(Z); Z.length < l; ) Z = "0" + Z;
        return Z;
      }
      function we(Z) {
        return typeof Z == "string" ? (0, O.Y0)(Z, O.Uj.NFKC) : (0, n.lE)(Z);
      }
      function Fe(Z, l) {
        let C = Z;
        const _ = l.toLowerCase().split("/");
        for (let se = 0; se < _.length; se++) {
          let de = null;
          for (const he in C)
            if (he.toLowerCase() === _[se]) {
              de = C[he];
              break;
            }
          if (de === null) return null;
          C = de;
        }
        return C;
      }
      function M(Z) {
        const l = (0, n.lE)(Z);
        (l[6] = (l[6] & 15) | 64), (l[8] = (l[8] & 63) | 128);
        const C = (0, n.Dv)(l);
        return [
          C.substring(2, 10),
          C.substring(10, 14),
          C.substring(14, 18),
          C.substring(18, 22),
          C.substring(22, 34),
        ].join("-");
      }
      const t = new U.Yd(Le);
      class u extends v.dk {
        isCrowdsaleAccount(l) {
          return !!(l && l._isCrowdsaleAccount);
        }
      }
      function h(Z, l) {
        const C = JSON.parse(Z);
        l = we(l);
        const _ = (0, T.Kn)(Fe(C, "ethaddr")),
          se = ye(Fe(C, "encseed"));
        (!se || se.length % 16 != 0) &&
          t.throwArgumentError("invalid encseed", "json", Z);
        const de = (0, n.lE)((0, ke.n)(l, l, 2e3, 32, "sha256")).slice(0, 16),
          he = se.slice(0, 16),
          ue = se.slice(16),
          pe = new (Je().ModeOfOperation.cbc)(de, he),
          ge = Je().padding.pkcs7.strip((0, n.lE)(pe.decrypt(ue)));
        let ve = "";
        for (let _e = 0; _e < ge.length; _e++)
          ve += String.fromCharCode(ge[_e]);
        const Ce = (0, O.Y0)(ve),
          Ge = (0, y.w)(Ce);
        return new u({ _isCrowdsaleAccount: !0, address: _, privateKey: Ge });
      }
      function P(Z) {
        let l = null;
        try {
          l = JSON.parse(Z);
        } catch (C) {
          return !1;
        }
        return l.encseed && l.ethaddr;
      }
      function K(Z) {
        let l = null;
        try {
          l = JSON.parse(Z);
        } catch (C) {
          return !1;
        }
        return !(
          !l.version ||
          parseInt(l.version) !== l.version ||
          parseInt(l.version) !== 3
        );
      }
      function a(Z) {
        if (P(Z))
          try {
            return getAddress(JSON.parse(Z).ethaddr);
          } catch (l) {
            return null;
          }
        if (K(Z))
          try {
            return getAddress(JSON.parse(Z).address);
          } catch (l) {
            return null;
          }
        return null;
      }
      var e = k(7635),
        r = k.n(e),
        o = k(1421),
        s = function (Z, l, C, _) {
          function se(de) {
            return de instanceof C
              ? de
              : new C(function (he) {
                  he(de);
                });
          }
          return new (C || (C = Promise))(function (de, he) {
            function ue(ve) {
              try {
                ge(_.next(ve));
              } catch (Ce) {
                he(Ce);
              }
            }
            function pe(ve) {
              try {
                ge(_.throw(ve));
              } catch (Ce) {
                he(Ce);
              }
            }
            function ge(ve) {
              ve.done ? de(ve.value) : se(ve.value).then(ue, pe);
            }
            ge((_ = _.apply(Z, l || [])).next());
          });
        };
      const f = new U.Yd(Le);
      function S(Z) {
        return Z != null && Z.mnemonic && Z.mnemonic.phrase;
      }
      class j extends v.dk {
        isKeystoreAccount(l) {
          return !!(l && l._isKeystoreAccount);
        }
      }
      function q(Z, l, C) {
        if (Fe(Z, "crypto/cipher") === "aes-128-ctr") {
          const se = ye(Fe(Z, "crypto/cipherparams/iv")),
            de = new (Je().Counter)(se),
            he = new (Je().ModeOfOperation.ctr)(l, de);
          return (0, n.lE)(he.decrypt(C));
        }
        return null;
      }
      function re(Z, l) {
        const C = ye(Fe(Z, "crypto/ciphertext"));
        if (
          (0, n.Dv)((0, y.w)((0, n.zo)([l.slice(16, 32), C]))).substring(2) !==
          Fe(Z, "crypto/mac").toLowerCase()
        )
          throw new Error("invalid password");
        const se = q(Z, l.slice(0, 16), C);
        se ||
          f.throwError(
            "unsupported cipher",
            U.Yd.errors.UNSUPPORTED_OPERATION,
            { operation: "decrypt" }
          );
        const de = l.slice(32, 64),
          he = (0, o.db)(se);
        if (Z.address) {
          let pe = Z.address.toLowerCase();
          if (
            (pe.substring(0, 2) !== "0x" && (pe = "0x" + pe),
            (0, T.Kn)(pe) !== he)
          )
            throw new Error("address mismatch");
        }
        const ue = {
          _isKeystoreAccount: !0,
          address: he,
          privateKey: (0, n.Dv)(se),
        };
        if (Fe(Z, "x-ethers/version") === "0.1") {
          const pe = ye(Fe(Z, "x-ethers/mnemonicCiphertext")),
            ge = ye(Fe(Z, "x-ethers/mnemonicCounter")),
            ve = new (Je().Counter)(ge),
            Ce = new (Je().ModeOfOperation.ctr)(de, ve),
            Ge = Fe(Z, "x-ethers/path") || me.cD,
            _e = Fe(Z, "x-ethers/locale") || "en",
            er = (0, n.lE)(Ce.decrypt(pe));
          try {
            const je = (0, me.JJ)(er, _e),
              Xe = me.m$.fromMnemonic(je, null, _e).derivePath(Ge);
            if (Xe.privateKey != ue.privateKey)
              throw new Error("mnemonic mismatch");
            ue.mnemonic = Xe.mnemonic;
          } catch (je) {
            if (
              je.code !== U.Yd.errors.INVALID_ARGUMENT ||
              je.argument !== "wordlist"
            )
              throw je;
          }
        }
        return new j(ue);
      }
      function le(Z, l, C, _, se) {
        return (0, n.lE)((0, ke.n)(Z, l, C, _, se));
      }
      function fe(Z, l, C, _, se) {
        return Promise.resolve(le(Z, l, C, _, se));
      }
      function Me(Z, l, C, _, se) {
        const de = we(l),
          he = Fe(Z, "crypto/kdf");
        if (he && typeof he == "string") {
          const ue = function (pe, ge) {
            return f.throwArgumentError(
              "invalid key-derivation function parameters",
              pe,
              ge
            );
          };
          if (he.toLowerCase() === "scrypt") {
            const pe = ye(Fe(Z, "crypto/kdfparams/salt")),
              ge = parseInt(Fe(Z, "crypto/kdfparams/n")),
              ve = parseInt(Fe(Z, "crypto/kdfparams/r")),
              Ce = parseInt(Fe(Z, "crypto/kdfparams/p"));
            (!ge || !ve || !Ce) && ue("kdf", he),
              (ge & (ge - 1)) != 0 && ue("N", ge);
            const Ge = parseInt(Fe(Z, "crypto/kdfparams/dklen"));
            return Ge !== 32 && ue("dklen", Ge), _(de, pe, ge, ve, Ce, 64, se);
          } else if (he.toLowerCase() === "pbkdf2") {
            const pe = ye(Fe(Z, "crypto/kdfparams/salt"));
            let ge = null;
            const ve = Fe(Z, "crypto/kdfparams/prf");
            ve === "hmac-sha256"
              ? (ge = "sha256")
              : ve === "hmac-sha512"
              ? (ge = "sha512")
              : ue("prf", ve);
            const Ce = parseInt(Fe(Z, "crypto/kdfparams/c")),
              Ge = parseInt(Fe(Z, "crypto/kdfparams/dklen"));
            return Ge !== 32 && ue("dklen", Ge), C(de, pe, Ce, Ge, ge);
          }
        }
        return f.throwArgumentError(
          "unsupported key-derivation function",
          "kdf",
          he
        );
      }
      function Ie(Z, l) {
        const C = JSON.parse(Z),
          _ = Me(C, l, le, r().syncScrypt);
        return re(C, _);
      }
      function Ze(Z, l, C) {
        return s(this, void 0, void 0, function* () {
          const _ = JSON.parse(Z),
            se = yield Me(_, l, fe, r().scrypt, C);
          return re(_, se);
        });
      }
      function He(Z, l, C, _) {
        try {
          if ((0, T.Kn)(Z.address) !== (0, o.db)(Z.privateKey))
            throw new Error("address/privateKey mismatch");
          if (S(Z)) {
            const Xe = Z.mnemonic;
            if (
              me.m$
                .fromMnemonic(Xe.phrase, null, Xe.locale)
                .derivePath(Xe.path || me.cD).privateKey != Z.privateKey
            )
              throw new Error("mnemonic mismatch");
          }
        } catch (Xe) {
          return Promise.reject(Xe);
        }
        typeof C == "function" && !_ && ((_ = C), (C = {})), C || (C = {});
        const se = (0, n.lE)(Z.privateKey),
          de = we(l);
        let he = null,
          ue = null,
          pe = null;
        if (S(Z)) {
          const Xe = Z.mnemonic;
          (he = (0, n.lE)((0, me.oy)(Xe.phrase, Xe.locale || "en"))),
            (ue = Xe.path || me.cD),
            (pe = Xe.locale || "en");
        }
        let ge = C.client;
        ge || (ge = "ethers.js");
        let ve = null;
        C.salt ? (ve = (0, n.lE)(C.salt)) : (ve = Te(32));
        let Ce = null;
        if (C.iv) {
          if (((Ce = (0, n.lE)(C.iv)), Ce.length !== 16))
            throw new Error("invalid iv");
        } else Ce = Te(16);
        let Ge = null;
        if (C.uuid) {
          if (((Ge = (0, n.lE)(C.uuid)), Ge.length !== 16))
            throw new Error("invalid uuid");
        } else Ge = Te(16);
        let _e = 1 << 17,
          er = 8,
          je = 1;
        return (
          C.scrypt &&
            (C.scrypt.N && (_e = C.scrypt.N),
            C.scrypt.r && (er = C.scrypt.r),
            C.scrypt.p && (je = C.scrypt.p)),
          r()
            .scrypt(de, ve, _e, er, je, 64, _)
            .then((Xe) => {
              Xe = (0, n.lE)(Xe);
              const ar = Xe.slice(0, 16),
                nr = Xe.slice(16, 32),
                ir = Xe.slice(32, 64),
                cr = new (Je().Counter)(Ce),
                fr = new (Je().ModeOfOperation.ctr)(ar, cr),
                tr = (0, n.lE)(fr.encrypt(se)),
                sr = (0, y.w)((0, n.zo)([nr, tr])),
                rr = {
                  address: Z.address.substring(2).toLowerCase(),
                  id: M(Ge),
                  version: 3,
                  Crypto: {
                    cipher: "aes-128-ctr",
                    cipherparams: { iv: (0, n.Dv)(Ce).substring(2) },
                    ciphertext: (0, n.Dv)(tr).substring(2),
                    kdf: "scrypt",
                    kdfparams: {
                      salt: (0, n.Dv)(ve).substring(2),
                      n: _e,
                      dklen: 32,
                      p: je,
                      r: er,
                    },
                    mac: sr.substring(2),
                  },
                };
              if (he) {
                const or = Te(16),
                  ur = new (Je().Counter)(or),
                  lr = new (Je().ModeOfOperation.ctr)(ir, ur),
                  dr = (0, n.lE)(lr.encrypt(he)),
                  qe = new Date(),
                  xr =
                    qe.getUTCFullYear() +
                    "-" +
                    Oe(qe.getUTCMonth() + 1, 2) +
                    "-" +
                    Oe(qe.getUTCDate(), 2) +
                    "T" +
                    Oe(qe.getUTCHours(), 2) +
                    "-" +
                    Oe(qe.getUTCMinutes(), 2) +
                    "-" +
                    Oe(qe.getUTCSeconds(), 2) +
                    ".0Z";
                rr["x-ethers"] = {
                  client: ge,
                  gethFilename: "UTC--" + xr + "--" + rr.address,
                  mnemonicCounter: (0, n.Dv)(or).substring(2),
                  mnemonicCiphertext: (0, n.Dv)(dr).substring(2),
                  path: ue,
                  locale: pe,
                  version: "0.1",
                };
              }
              return JSON.stringify(rr);
            })
        );
      }
      function ze(Z, l, C) {
        if (P(Z)) {
          C && C(0);
          const _ = h(Z, l);
          return C && C(1), Promise.resolve(_);
        }
        return K(Z)
          ? Ze(Z, l, C)
          : Promise.reject(new Error("invalid JSON wallet"));
      }
      function Ke(Z, l) {
        if (P(Z)) return h(Z, l);
        if (K(Z)) return Ie(Z, l);
        throw new Error("invalid JSON wallet");
      }
      const Qe = "wallet/5.0.11";
      var Ne = function (Z, l, C, _) {
        function se(de) {
          return de instanceof C
            ? de
            : new C(function (he) {
                he(de);
              });
        }
        return new (C || (C = Promise))(function (de, he) {
          function ue(ve) {
            try {
              ge(_.next(ve));
            } catch (Ce) {
              he(Ce);
            }
          }
          function pe(ve) {
            try {
              ge(_.throw(ve));
            } catch (Ce) {
              he(Ce);
            }
          }
          function ge(ve) {
            ve.done ? de(ve.value) : se(ve.value).then(ue, pe);
          }
          ge((_ = _.apply(Z, l || [])).next());
        });
      };
      const Ve = new U.Yd(Qe);
      function Ye(Z) {
        return Z != null && (0, n.A7)(Z.privateKey, 32) && Z.address != null;
      }
      function We(Z) {
        const l = Z.mnemonic;
        return l && l.phrase;
      }
      class Ue extends H {
        constructor(l, C) {
          if ((Ve.checkNew(new.target, Ue), super(), Ye(l))) {
            const _ = new Pe.Et(l.privateKey);
            if (
              ((0, v.zG)(this, "_signingKey", () => _),
              (0, v.zG)(this, "address", (0, o.db)(this.publicKey)),
              this.address !== (0, T.Kn)(l.address) &&
                Ve.throwArgumentError(
                  "privateKey/address mismatch",
                  "privateKey",
                  "[REDACTED]"
                ),
              We(l))
            ) {
              const se = l.mnemonic;
              (0, v.zG)(this, "_mnemonic", () => ({
                phrase: se.phrase,
                path: se.path || me.cD,
                locale: se.locale || "en",
              }));
              const de = this.mnemonic,
                he = me.m$
                  .fromMnemonic(de.phrase, null, de.locale)
                  .derivePath(de.path);
              (0, o.db)(he.privateKey) !== this.address &&
                Ve.throwArgumentError(
                  "mnemonic/address mismatch",
                  "privateKey",
                  "[REDACTED]"
                );
            } else (0, v.zG)(this, "_mnemonic", () => null);
          } else {
            if (Pe.Et.isSigningKey(l))
              l.curve !== "secp256k1" &&
                Ve.throwArgumentError(
                  "unsupported curve; must be secp256k1",
                  "privateKey",
                  "[REDACTED]"
                ),
                (0, v.zG)(this, "_signingKey", () => l);
            else {
              typeof l == "string" &&
                l.match(/^[0-9a-f]*$/i) &&
                l.length === 64 &&
                (l = "0x" + l);
              const _ = new Pe.Et(l);
              (0, v.zG)(this, "_signingKey", () => _);
            }
            (0, v.zG)(this, "_mnemonic", () => null),
              (0, v.zG)(this, "address", (0, o.db)(this.publicKey));
          }
          C &&
            !te.isProvider(C) &&
            Ve.throwArgumentError("invalid provider", "provider", C),
            (0, v.zG)(this, "provider", C || null);
        }
        get mnemonic() {
          return this._mnemonic();
        }
        get privateKey() {
          return this._signingKey().privateKey;
        }
        get publicKey() {
          return this._signingKey().publicKey;
        }
        getAddress() {
          return Promise.resolve(this.address);
        }
        connect(l) {
          return new Ue(this, l);
        }
        signTransaction(l) {
          return (0, v.mE)(l).then((C) => {
            C.from != null &&
              ((0, T.Kn)(C.from) !== this.address &&
                Ve.throwArgumentError(
                  "transaction from address mismatch",
                  "transaction.from",
                  l.from
                ),
              delete C.from);
            const _ = this._signingKey().signDigest((0, y.w)((0, o.qC)(C)));
            return (0, o.qC)(C, _);
          });
        }
        signMessage(l) {
          return Ne(this, void 0, void 0, function* () {
            return (0, n.gV)(this._signingKey().signDigest(ee(l)));
          });
        }
        _signTypedData(l, C, _) {
          return Ne(this, void 0, void 0, function* () {
            const se = yield ce.resolveNames(
              l,
              C,
              _,
              (de) => (
                this.provider == null &&
                  Ve.throwError(
                    "cannot resolve ENS names without a provider",
                    U.Yd.errors.UNSUPPORTED_OPERATION,
                    { operation: "resolveName", value: de }
                  ),
                this.provider.resolveName(de)
              )
            );
            return (0,
            n.gV)(this._signingKey().signDigest(ce.hash(se.domain, C, se.value)));
          });
        }
        encrypt(l, C, _) {
          if (
            (typeof C == "function" && !_ && ((_ = C), (C = {})),
            _ && typeof _ != "function")
          )
            throw new Error("invalid callback");
          return C || (C = {}), He(this, l, C, _);
        }
        static createRandom(l) {
          let C = Te(16);
          l || (l = {}),
            l.extraEntropy &&
              (C = (0, n.lE)(
                (0, n.p3)((0, y.w)((0, n.zo)([C, l.extraEntropy])), 0, 16)
              ));
          const _ = (0, me.JJ)(C, l.locale);
          return Ue.fromMnemonic(_, l.path, l.locale);
        }
        static fromEncryptedJson(l, C, _) {
          return ze(l, C, _).then((se) => new Ue(se));
        }
        static fromEncryptedJsonSync(l, C) {
          return new Ue(Ke(l, C));
        }
        static fromMnemonic(l, C, _) {
          return (
            C || (C = me.cD),
            new Ue(me.m$.fromMnemonic(l, null, _).derivePath(C))
          );
        }
      }
      function $e(Z, l) {
        return recoverAddress(hashMessage(Z), l);
      }
      function br(Z, l, C, _) {
        return recoverAddress(_TypedDataEncoder.hash(Z, l, C), _);
      }
    },
    2455: (Ae, W, k) => {
      "use strict";
      k.d(W, { E: () => o });
      var T = k(2046),
        v = k(3587),
        U = k(711);
      const z = "wordlists/5.0.9",
        G = !1,
        Q = new U.Yd(z);
      class Y {
        constructor(f) {
          Q.checkAbstract(new.target, Y), (0, v.zG)(this, "locale", f);
        }
        split(f) {
          return f.toLowerCase().split(/ +/g);
        }
        join(f) {
          return f.join(" ");
        }
        static check(f) {
          const S = [];
          for (let j = 0; j < 2048; j++) {
            const q = f.getWord(j);
            if (j !== f.getWordIndex(q)) return "0x";
            S.push(q);
          }
          return (0, T.id)(
            S.join(`
`) +
              `
`
          );
        }
        static register(f, S) {
          if ((S || (S = f.locale), G))
            try {
              const j = window;
              j._ethers &&
                j._ethers.wordlists &&
                (j._ethers.wordlists[S] ||
                  (0, v.zG)(j._ethers.wordlists, S, f));
            } catch (j) {}
        }
      }
      const m =
        "AbdikaceAbecedaAdresaAgreseAkceAktovkaAlejAlkoholAmputaceAnanasAndulkaAnekdotaAnketaAntikaAnulovatArchaAroganceAsfaltAsistentAspiraceAstmaAstronomAtlasAtletikaAtolAutobusAzylBabkaBachorBacilBaculkaBadatelBagetaBagrBahnoBakterieBaladaBaletkaBalkonBalonekBalvanBalzaBambusBankomatBarbarBaretBarmanBarokoBarvaBaterkaBatohBavlnaBazalkaBazilikaBazukaBednaBeranBesedaBestieBetonBezinkaBezmocBeztakBicyklBidloBiftekBikinyBilanceBiografBiologBitvaBizonBlahobytBlatouchBlechaBleduleBleskBlikatBliznaBlokovatBlouditBludBobekBobrBodlinaBodnoutBohatostBojkotBojovatBokorysBolestBorecBoroviceBotaBoubelBouchatBoudaBouleBouratBoxerBradavkaBramboraBrankaBratrBreptaBriketaBrkoBrlohBronzBroskevBrunetkaBrusinkaBrzdaBrzyBublinaBubnovatBuchtaBuditelBudkaBudovaBufetBujarostBukviceBuldokBulvaBundaBunkrBurzaButikBuvolBuzolaBydletBylinaBytovkaBzukotCapartCarevnaCedrCeduleCejchCejnCelaCelerCelkemCelniceCeninaCennostCenovkaCentrumCenzorCestopisCetkaChalupaChapadloCharitaChataChechtatChemieChichotChirurgChladChlebaChlubitChmelChmuraChobotChocholChodbaCholeraChomoutChopitChorobaChovChrapotChrlitChrtChrupChtivostChudinaChutnatChvatChvilkaChvostChybaChystatChytitCibuleCigaretaCihelnaCihlaCinkotCirkusCisternaCitaceCitrusCizinecCizostClonaCokolivCouvatCtitelCtnostCudnostCuketaCukrCupotCvaknoutCvalCvikCvrkotCyklistaDalekoDarebaDatelDatumDceraDebataDechovkaDecibelDeficitDeflaceDeklDekretDemokratDepreseDerbyDeskaDetektivDikobrazDiktovatDiodaDiplomDiskDisplejDivadloDivochDlahaDlouhoDluhopisDnesDobroDobytekDocentDochutitDodnesDohledDohodaDohraDojemDojniceDokladDokolaDoktorDokumentDolarDolevaDolinaDomaDominantDomluvitDomovDonutitDopadDopisDoplnitDoposudDoprovodDopustitDorazitDorostDortDosahDoslovDostatekDosudDosytaDotazDotekDotknoutDoufatDoutnatDovozceDozaduDoznatDozorceDrahotaDrakDramatikDravecDrazeDrdolDrobnostDrogerieDrozdDrsnostDrtitDrzostDubenDuchovnoDudekDuhaDuhovkaDusitDusnoDutostDvojiceDvorecDynamitEkologEkonomieElektronElipsaEmailEmiseEmoceEmpatieEpizodaEpochaEpopejEposEsejEsenceEskortaEskymoEtiketaEuforieEvoluceExekuceExkurzeExpediceExplozeExportExtraktFackaFajfkaFakultaFanatikFantazieFarmacieFavoritFazoleFederaceFejetonFenkaFialkaFigurantFilozofFiltrFinanceFintaFixaceFjordFlanelFlirtFlotilaFondFosforFotbalFotkaFotonFrakceFreskaFrontaFukarFunkceFyzikaGalejeGarantGenetikaGeologGilotinaGlazuraGlejtGolemGolfistaGotikaGrafGramofonGranuleGrepGrilGrogGroteskaGumaHadiceHadrHalaHalenkaHanbaHanopisHarfaHarpunaHavranHebkostHejkalHejnoHejtmanHektarHelmaHematomHerecHernaHesloHezkyHistorikHladovkaHlasivkyHlavaHledatHlenHlodavecHlohHloupostHltatHlubinaHluchotaHmatHmotaHmyzHnisHnojivoHnoutHoblinaHobojHochHodinyHodlatHodnotaHodovatHojnostHokejHolinkaHolkaHolubHomoleHonitbaHonoraceHoralHordaHorizontHorkoHorlivecHormonHorninaHoroskopHorstvoHospodaHostinaHotovostHoubaHoufHoupatHouskaHovorHradbaHraniceHravostHrazdaHrbolekHrdinaHrdloHrdostHrnekHrobkaHromadaHrotHroudaHrozenHrstkaHrubostHryzatHubenostHubnoutHudbaHukotHumrHusitaHustotaHvozdHybnostHydrantHygienaHymnaHysterikIdylkaIhnedIkonaIluzeImunitaInfekceInflaceInkasoInovaceInspekceInternetInvalidaInvestorInzerceIronieJablkoJachtaJahodaJakmileJakostJalovecJantarJarmarkJaroJasanJasnoJatkaJavorJazykJedinecJedleJednatelJehlanJekotJelenJelitoJemnostJenomJepiceJeseterJevitJezdecJezeroJinakJindyJinochJiskraJistotaJitrniceJizvaJmenovatJogurtJurtaKabaretKabelKabinetKachnaKadetKadidloKahanKajakKajutaKakaoKaktusKalamitaKalhotyKalibrKalnostKameraKamkolivKamnaKanibalKanoeKantorKapalinaKapelaKapitolaKapkaKapleKapotaKaprKapustaKapybaraKaramelKarotkaKartonKasaKatalogKatedraKauceKauzaKavalecKazajkaKazetaKazivostKdekolivKdesiKedlubenKempKeramikaKinoKlacekKladivoKlamKlapotKlasikaKlaunKlecKlenbaKlepatKlesnoutKlidKlimaKlisnaKloboukKlokanKlopaKloubKlubovnaKlusatKluzkostKmenKmitatKmotrKnihaKnotKoaliceKoberecKobkaKoblihaKobylaKocourKohoutKojenecKokosKoktejlKolapsKoledaKolizeKoloKomandoKometaKomikKomnataKomoraKompasKomunitaKonatKonceptKondiceKonecKonfeseKongresKoninaKonkursKontaktKonzervaKopanecKopieKopnoutKoprovkaKorbelKorektorKormidloKoroptevKorpusKorunaKorytoKorzetKosatecKostkaKotelKotletaKotoulKoukatKoupelnaKousekKouzloKovbojKozaKozorohKrabiceKrachKrajinaKralovatKrasopisKravataKreditKrejcarKresbaKrevetaKriketKritikKrizeKrkavecKrmelecKrmivoKrocanKrokKronikaKropitKroupaKrovkaKrtekKruhadloKrupiceKrutostKrvinkaKrychleKryptaKrystalKrytKudlankaKufrKujnostKuklaKulajdaKulichKulkaKulometKulturaKunaKupodivuKurtKurzorKutilKvalitaKvasinkaKvestorKynologKyselinaKytaraKyticeKytkaKytovecKyvadloLabradorLachtanLadnostLaikLakomecLamelaLampaLanovkaLasiceLasoLasturaLatinkaLavinaLebkaLeckdyLedenLedniceLedovkaLedvinaLegendaLegieLegraceLehceLehkostLehnoutLektvarLenochodLentilkaLepenkaLepidloLetadloLetecLetmoLetokruhLevhartLevitaceLevobokLibraLichotkaLidojedLidskostLihovinaLijavecLilekLimetkaLinieLinkaLinoleumListopadLitinaLitovatLobistaLodivodLogikaLogopedLokalitaLoketLomcovatLopataLopuchLordLososLotrLoudalLouhLoukaLouskatLovecLstivostLucernaLuciferLumpLuskLustraceLviceLyraLyrikaLysinaMadamMadloMagistrMahagonMajetekMajitelMajoritaMakakMakoviceMakrelaMalbaMalinaMalovatMalviceMaminkaMandleMankoMarnostMasakrMaskotMasopustMaticeMatrikaMaturitaMazanecMazivoMazlitMazurkaMdlobaMechanikMeditaceMedovinaMelasaMelounMentolkaMetlaMetodaMetrMezeraMigraceMihnoutMihuleMikinaMikrofonMilenecMilimetrMilostMimikaMincovnaMinibarMinometMinulostMiskaMistrMixovatMladostMlhaMlhovinaMlokMlsatMluvitMnichMnohemMobilMocnostModelkaModlitbaMohylaMokroMolekulaMomentkaMonarchaMonoklMonstrumMontovatMonzunMosazMoskytMostMotivaceMotorkaMotykaMouchaMoudrostMozaikaMozekMozolMramorMravenecMrkevMrtvolaMrzetMrzutostMstitelMudrcMuflonMulatMumieMuniceMusetMutaceMuzeumMuzikantMyslivecMzdaNabouratNachytatNadaceNadbytekNadhozNadobroNadpisNahlasNahnatNahodileNahraditNaivitaNajednouNajistoNajmoutNaklonitNakonecNakrmitNalevoNamazatNamluvitNanometrNaokoNaopakNaostroNapadatNapevnoNaplnitNapnoutNaposledNaprostoNaroditNarubyNarychloNasaditNasekatNaslepoNastatNatolikNavenekNavrchNavzdoryNazvatNebeNechatNeckyNedalekoNedbatNeduhNegaceNehetNehodaNejenNejprveNeklidNelibostNemilostNemocNeochotaNeonkaNepokojNerostNervNesmyslNesouladNetvorNeuronNevinaNezvykleNicotaNijakNikamNikdyNiklNikterakNitroNoclehNohaviceNominaceNoraNorekNositelNosnostNouzeNovinyNovotaNozdraNudaNudleNugetNutitNutnostNutrieNymfaObalObarvitObavaObdivObecObehnatObejmoutObezitaObhajobaObilniceObjasnitObjektObklopitOblastOblekOblibaOblohaObludaObnosObohatitObojekOboutObrazecObrnaObrubaObrysObsahObsluhaObstaratObuvObvazObvinitObvodObvykleObyvatelObzorOcasOcelOcenitOchladitOchotaOchranaOcitnoutOdbojOdbytOdchodOdcizitOdebratOdeslatOdevzdatOdezvaOdhadceOdhoditOdjetOdjinudOdkazOdkoupitOdlivOdlukaOdmlkaOdolnostOdpadOdpisOdploutOdporOdpustitOdpykatOdrazkaOdsouditOdstupOdsunOdtokOdtudOdvahaOdvetaOdvolatOdvracetOdznakOfinaOfsajdOhlasOhniskoOhradaOhrozitOhryzekOkapOkeniceOklikaOknoOkouzlitOkovyOkrasaOkresOkrsekOkruhOkupantOkurkaOkusitOlejninaOlizovatOmakOmeletaOmezitOmladinaOmlouvatOmluvaOmylOnehdyOpakovatOpasekOperaceOpiceOpilostOpisovatOporaOpoziceOpravduOprotiOrbitalOrchestrOrgieOrliceOrlojOrtelOsadaOschnoutOsikaOsivoOslavaOslepitOslnitOslovitOsnovaOsobaOsolitOspalecOstenOstrahaOstudaOstychOsvojitOteplitOtiskOtopOtrhatOtrlostOtrokOtrubyOtvorOvanoutOvarOvesOvlivnitOvoceOxidOzdobaPachatelPacientPadouchPahorekPaktPalandaPalecPalivoPalubaPamfletPamlsekPanenkaPanikaPannaPanovatPanstvoPantoflePaprikaParketaParodiePartaParukaParybaPasekaPasivitaPastelkaPatentPatronaPavoukPaznehtPazourekPeckaPedagogPejsekPekloPelotonPenaltaPendrekPenzePeriskopPeroPestrostPetardaPeticePetrolejPevninaPexesoPianistaPihaPijavicePiklePiknikPilinaPilnostPilulkaPinzetaPipetaPisatelPistolePitevnaPivnicePivovarPlacentaPlakatPlamenPlanetaPlastikaPlatitPlavidloPlazPlechPlemenoPlentaPlesPletivoPlevelPlivatPlnitPlnoPlochaPlodinaPlombaPloutPlukPlynPobavitPobytPochodPocitPoctivecPodatPodcenitPodepsatPodhledPodivitPodkladPodmanitPodnikPodobaPodporaPodrazPodstataPodvodPodzimPoeziePohankaPohnutkaPohovorPohromaPohybPointaPojistkaPojmoutPokazitPoklesPokojPokrokPokutaPokynPolednePolibekPolknoutPolohaPolynomPomaluPominoutPomlkaPomocPomstaPomysletPonechatPonorkaPonurostPopadatPopelPopisekPoplachPoprositPopsatPopudPoradcePorcePorodPoruchaPoryvPosaditPosedPosilaPoskokPoslanecPosouditPospoluPostavaPosudekPosypPotahPotkanPotleskPotomekPotravaPotupaPotvoraPoukazPoutoPouzdroPovahaPovidlaPovlakPovozPovrchPovstatPovykPovzdechPozdravPozemekPoznatekPozorPozvatPracovatPrahoryPraktikaPralesPraotecPraporekPrasePravdaPrincipPrknoProbuditProcentoProdejProfeseProhraProjektProlomitPromilePronikatPropadProrokProsbaProtonProutekProvazPrskavkaPrstenPrudkostPrutPrvekPrvohoryPsanecPsovodPstruhPtactvoPubertaPuchPudlPukavecPuklinaPukrlePultPumpaPuncPupenPusaPusinkaPustinaPutovatPutykaPyramidaPyskPytelRacekRachotRadiaceRadniceRadonRaftRagbyRaketaRakovinaRamenoRampouchRandeRarachRaritaRasovnaRastrRatolestRazanceRazidloReagovatReakceReceptRedaktorReferentReflexRejnokReklamaRekordRekrutRektorReputaceRevizeRevmaRevolverRezervaRiskovatRizikoRobotikaRodokmenRohovkaRokleRokokoRomanetoRopovodRopuchaRorejsRosolRostlinaRotmistrRotopedRotundaRoubenkaRouchoRoupRouraRovinaRovniceRozborRozchodRozdatRozeznatRozhodceRozinkaRozjezdRozkazRozlohaRozmarRozpadRozruchRozsahRoztokRozumRozvodRubrikaRuchadloRukaviceRukopisRybaRybolovRychlostRydloRypadloRytinaRyzostSadistaSahatSakoSamecSamizdatSamotaSanitkaSardinkaSasankaSatelitSazbaSazeniceSborSchovatSebrankaSeceseSedadloSedimentSedloSehnatSejmoutSekeraSektaSekundaSekvojeSemenoSenoServisSesaditSeshoraSeskokSeslatSestraSesuvSesypatSetbaSetinaSetkatSetnoutSetrvatSeverSeznamShodaShrnoutSifonSilniceSirkaSirotekSirupSituaceSkafandrSkaliskoSkanzenSkautSkeptikSkicaSkladbaSkleniceSkloSkluzSkobaSkokanSkoroSkriptaSkrzSkupinaSkvostSkvrnaSlabikaSladidloSlaninaSlastSlavnostSledovatSlepecSlevaSlezinaSlibSlinaSlizniceSlonSloupekSlovoSluchSluhaSlunceSlupkaSlzaSmaragdSmetanaSmilstvoSmlouvaSmogSmradSmrkSmrtkaSmutekSmyslSnadSnahaSnobSobotaSochaSodovkaSokolSopkaSotvaSoubojSoucitSoudceSouhlasSouladSoumrakSoupravaSousedSoutokSouvisetSpalovnaSpasitelSpisSplavSpodekSpojenecSpoluSponzorSpornostSpoustaSprchaSpustitSrandaSrazSrdceSrnaSrnecSrovnatSrpenSrstSrubStaniceStarostaStatikaStavbaStehnoStezkaStodolaStolekStopaStornoStoupatStrachStresStrhnoutStromStrunaStudnaStupniceStvolStykSubjektSubtropySucharSudostSuknoSundatSunoutSurikataSurovinaSvahSvalstvoSvetrSvatbaSvazekSvisleSvitekSvobodaSvodidloSvorkaSvrabSykavkaSykotSynekSynovecSypatSypkostSyrovostSyselSytostTabletkaTabuleTahounTajemnoTajfunTajgaTajitTajnostTaktikaTamhleTamponTancovatTanecTankerTapetaTaveninaTazatelTechnikaTehdyTekutinaTelefonTemnotaTendenceTenistaTenorTeplotaTepnaTeprveTerapieTermoskaTextilTichoTiskopisTitulekTkadlecTkaninaTlapkaTleskatTlukotTlupaTmelToaletaTopinkaTopolTorzoTouhaToulecTradiceTraktorTrampTrasaTraverzaTrefitTrestTrezorTrhavinaTrhlinaTrochuTrojiceTroskaTroubaTrpceTrpitelTrpkostTrubecTruchlitTruhliceTrusTrvatTudyTuhnoutTuhostTundraTuristaTurnajTuzemskoTvarohTvorbaTvrdostTvrzTygrTykevUbohostUbozeUbratUbrousekUbrusUbytovnaUchoUctivostUdivitUhraditUjednatUjistitUjmoutUkazatelUklidnitUklonitUkotvitUkrojitUliceUlitaUlovitUmyvadloUnavitUniformaUniknoutUpadnoutUplatnitUplynoutUpoutatUpravitUranUrazitUsednoutUsilovatUsmrtitUsnadnitUsnoutUsouditUstlatUstrnoutUtahovatUtkatUtlumitUtonoutUtopenecUtrousitUvalitUvolnitUvozovkaUzdravitUzelUzeninaUzlinaUznatVagonValchaValounVanaVandalVanilkaVaranVarhanyVarovatVcelkuVchodVdovaVedroVegetaceVejceVelbloudVeletrhVelitelVelmocVelrybaVenkovVerandaVerzeVeselkaVeskrzeVesniceVespoduVestaVeterinaVeverkaVibraceVichrVideohraVidinaVidleVilaViniceVisetVitalitaVizeVizitkaVjezdVkladVkusVlajkaVlakVlasecVlevoVlhkostVlivVlnovkaVloupatVnucovatVnukVodaVodivostVodoznakVodstvoVojenskyVojnaVojskoVolantVolbaVolitVolnoVoskovkaVozidloVozovnaVpravoVrabecVracetVrahVrataVrbaVrcholekVrhatVrstvaVrtuleVsaditVstoupitVstupVtipVybavitVybratVychovatVydatVydraVyfotitVyhledatVyhnoutVyhoditVyhraditVyhubitVyjasnitVyjetVyjmoutVyklopitVykonatVylekatVymazatVymezitVymizetVymysletVynechatVynikatVynutitVypadatVyplatitVypravitVypustitVyrazitVyrovnatVyrvatVyslovitVysokoVystavitVysunoutVysypatVytasitVytesatVytratitVyvinoutVyvolatVyvrhelVyzdobitVyznatVzaduVzbuditVzchopitVzdorVzduchVzdychatVzestupVzhledemVzkazVzlykatVznikVzorekVzpouraVztahVztekXylofonZabratZabydletZachovatZadarmoZadusitZafoukatZahltitZahoditZahradaZahynoutZajatecZajetZajistitZaklepatZakoupitZalepitZamezitZamotatZamysletZanechatZanikatZaplatitZapojitZapsatZarazitZastavitZasunoutZatajitZatemnitZatknoutZaujmoutZavalitZaveletZavinitZavolatZavrtatZazvonitZbavitZbrusuZbudovatZbytekZdalekaZdarmaZdatnostZdivoZdobitZdrojZdvihZdymadloZeleninaZemanZeminaZeptatZezaduZezdolaZhatitZhltnoutZhlubokaZhotovitZhrubaZimaZimniceZjemnitZklamatZkoumatZkratkaZkumavkaZlatoZlehkaZlobaZlomZlostZlozvykZmapovatZmarZmatekZmijeZmizetZmocnitZmodratZmrzlinaZmutovatZnakZnalostZnamenatZnovuZobrazitZotavitZoubekZoufaleZploditZpomalitZpravaZprostitZprudkaZprvuZradaZranitZrcadloZrnitostZrnoZrovnaZrychlitZrzavostZtichaZtratitZubovinaZubrZvednoutZvenkuZveselaZvonZvratZvukovodZvyk";
      let ae = null;
      function te(s) {
        if (
          ae == null &&
          ((ae = m
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .substring(1)
            .split(" ")),
          Y.check(s) !==
            "0x25f44555f4af25b51a711136e1c7d6e50ce9f8917d39d6b1f076b2bb4d2fac1a")
        )
          throw (
            ((ae = null), new Error("BIP39 Wordlist for en (English) FAILED"))
          );
      }
      class oe extends Y {
        constructor() {
          super("cz");
        }
        getWord(f) {
          return te(this), ae[f];
        }
        getWordIndex(f) {
          return te(this), ae.indexOf(f);
        }
      }
      const V = new oe();
      Y.register(V);
      const x =
        "AbandonAbilityAbleAboutAboveAbsentAbsorbAbstractAbsurdAbuseAccessAccidentAccountAccuseAchieveAcidAcousticAcquireAcrossActActionActorActressActualAdaptAddAddictAddressAdjustAdmitAdultAdvanceAdviceAerobicAffairAffordAfraidAgainAgeAgentAgreeAheadAimAirAirportAisleAlarmAlbumAlcoholAlertAlienAllAlleyAllowAlmostAloneAlphaAlreadyAlsoAlterAlwaysAmateurAmazingAmongAmountAmusedAnalystAnchorAncientAngerAngleAngryAnimalAnkleAnnounceAnnualAnotherAnswerAntennaAntiqueAnxietyAnyApartApologyAppearAppleApproveAprilArchArcticAreaArenaArgueArmArmedArmorArmyAroundArrangeArrestArriveArrowArtArtefactArtistArtworkAskAspectAssaultAssetAssistAssumeAsthmaAthleteAtomAttackAttendAttitudeAttractAuctionAuditAugustAuntAuthorAutoAutumnAverageAvocadoAvoidAwakeAwareAwayAwesomeAwfulAwkwardAxisBabyBachelorBaconBadgeBagBalanceBalconyBallBambooBananaBannerBarBarelyBargainBarrelBaseBasicBasketBattleBeachBeanBeautyBecauseBecomeBeefBeforeBeginBehaveBehindBelieveBelowBeltBenchBenefitBestBetrayBetterBetweenBeyondBicycleBidBikeBindBiologyBirdBirthBitterBlackBladeBlameBlanketBlastBleakBlessBlindBloodBlossomBlouseBlueBlurBlushBoardBoatBodyBoilBombBoneBonusBookBoostBorderBoringBorrowBossBottomBounceBoxBoyBracketBrainBrandBrassBraveBreadBreezeBrickBridgeBriefBrightBringBriskBroccoliBrokenBronzeBroomBrotherBrownBrushBubbleBuddyBudgetBuffaloBuildBulbBulkBulletBundleBunkerBurdenBurgerBurstBusBusinessBusyButterBuyerBuzzCabbageCabinCableCactusCageCakeCallCalmCameraCampCanCanalCancelCandyCannonCanoeCanvasCanyonCapableCapitalCaptainCarCarbonCardCargoCarpetCarryCartCaseCashCasinoCastleCasualCatCatalogCatchCategoryCattleCaughtCauseCautionCaveCeilingCeleryCementCensusCenturyCerealCertainChairChalkChampionChangeChaosChapterChargeChaseChatCheapCheckCheeseChefCherryChestChickenChiefChildChimneyChoiceChooseChronicChuckleChunkChurnCigarCinnamonCircleCitizenCityCivilClaimClapClarifyClawClayCleanClerkCleverClickClientCliffClimbClinicClipClockClogCloseClothCloudClownClubClumpClusterClutchCoachCoastCoconutCodeCoffeeCoilCoinCollectColorColumnCombineComeComfortComicCommonCompanyConcertConductConfirmCongressConnectConsiderControlConvinceCookCoolCopperCopyCoralCoreCornCorrectCostCottonCouchCountryCoupleCourseCousinCoverCoyoteCrackCradleCraftCramCraneCrashCraterCrawlCrazyCreamCreditCreekCrewCricketCrimeCrispCriticCropCrossCrouchCrowdCrucialCruelCruiseCrumbleCrunchCrushCryCrystalCubeCultureCupCupboardCuriousCurrentCurtainCurveCushionCustomCuteCycleDadDamageDampDanceDangerDaringDashDaughterDawnDayDealDebateDebrisDecadeDecemberDecideDeclineDecorateDecreaseDeerDefenseDefineDefyDegreeDelayDeliverDemandDemiseDenialDentistDenyDepartDependDepositDepthDeputyDeriveDescribeDesertDesignDeskDespairDestroyDetailDetectDevelopDeviceDevoteDiagramDialDiamondDiaryDiceDieselDietDifferDigitalDignityDilemmaDinnerDinosaurDirectDirtDisagreeDiscoverDiseaseDishDismissDisorderDisplayDistanceDivertDivideDivorceDizzyDoctorDocumentDogDollDolphinDomainDonateDonkeyDonorDoorDoseDoubleDoveDraftDragonDramaDrasticDrawDreamDressDriftDrillDrinkDripDriveDropDrumDryDuckDumbDuneDuringDustDutchDutyDwarfDynamicEagerEagleEarlyEarnEarthEasilyEastEasyEchoEcologyEconomyEdgeEditEducateEffortEggEightEitherElbowElderElectricElegantElementElephantElevatorEliteElseEmbarkEmbodyEmbraceEmergeEmotionEmployEmpowerEmptyEnableEnactEndEndlessEndorseEnemyEnergyEnforceEngageEngineEnhanceEnjoyEnlistEnoughEnrichEnrollEnsureEnterEntireEntryEnvelopeEpisodeEqualEquipEraEraseErodeErosionErrorEruptEscapeEssayEssenceEstateEternalEthicsEvidenceEvilEvokeEvolveExactExampleExcessExchangeExciteExcludeExcuseExecuteExerciseExhaustExhibitExileExistExitExoticExpandExpectExpireExplainExposeExpressExtendExtraEyeEyebrowFabricFaceFacultyFadeFaintFaithFallFalseFameFamilyFamousFanFancyFantasyFarmFashionFatFatalFatherFatigueFaultFavoriteFeatureFebruaryFederalFeeFeedFeelFemaleFenceFestivalFetchFeverFewFiberFictionFieldFigureFileFilmFilterFinalFindFineFingerFinishFireFirmFirstFiscalFishFitFitnessFixFlagFlameFlashFlatFlavorFleeFlightFlipFloatFlockFloorFlowerFluidFlushFlyFoamFocusFogFoilFoldFollowFoodFootForceForestForgetForkFortuneForumForwardFossilFosterFoundFoxFragileFrameFrequentFreshFriendFringeFrogFrontFrostFrownFrozenFruitFuelFunFunnyFurnaceFuryFutureGadgetGainGalaxyGalleryGameGapGarageGarbageGardenGarlicGarmentGasGaspGateGatherGaugeGazeGeneralGeniusGenreGentleGenuineGestureGhostGiantGiftGiggleGingerGiraffeGirlGiveGladGlanceGlareGlassGlideGlimpseGlobeGloomGloryGloveGlowGlueGoatGoddessGoldGoodGooseGorillaGospelGossipGovernGownGrabGraceGrainGrantGrapeGrassGravityGreatGreenGridGriefGritGroceryGroupGrowGruntGuardGuessGuideGuiltGuitarGunGymHabitHairHalfHammerHamsterHandHappyHarborHardHarshHarvestHatHaveHawkHazardHeadHealthHeartHeavyHedgehogHeightHelloHelmetHelpHenHeroHiddenHighHillHintHipHireHistoryHobbyHockeyHoldHoleHolidayHollowHomeHoneyHoodHopeHornHorrorHorseHospitalHostHotelHourHoverHubHugeHumanHumbleHumorHundredHungryHuntHurdleHurryHurtHusbandHybridIceIconIdeaIdentifyIdleIgnoreIllIllegalIllnessImageImitateImmenseImmuneImpactImposeImproveImpulseInchIncludeIncomeIncreaseIndexIndicateIndoorIndustryInfantInflictInformInhaleInheritInitialInjectInjuryInmateInnerInnocentInputInquiryInsaneInsectInsideInspireInstallIntactInterestIntoInvestInviteInvolveIronIslandIsolateIssueItemIvoryJacketJaguarJarJazzJealousJeansJellyJewelJobJoinJokeJourneyJoyJudgeJuiceJumpJungleJuniorJunkJustKangarooKeenKeepKetchupKeyKickKidKidneyKindKingdomKissKitKitchenKiteKittenKiwiKneeKnifeKnockKnowLabLabelLaborLadderLadyLakeLampLanguageLaptopLargeLaterLatinLaughLaundryLavaLawLawnLawsuitLayerLazyLeaderLeafLearnLeaveLectureLeftLegLegalLegendLeisureLemonLendLengthLensLeopardLessonLetterLevelLiarLibertyLibraryLicenseLifeLiftLightLikeLimbLimitLinkLionLiquidListLittleLiveLizardLoadLoanLobsterLocalLockLogicLonelyLongLoopLotteryLoudLoungeLoveLoyalLuckyLuggageLumberLunarLunchLuxuryLyricsMachineMadMagicMagnetMaidMailMainMajorMakeMammalManManageMandateMangoMansionManualMapleMarbleMarchMarginMarineMarketMarriageMaskMassMasterMatchMaterialMathMatrixMatterMaximumMazeMeadowMeanMeasureMeatMechanicMedalMediaMelodyMeltMemberMemoryMentionMenuMercyMergeMeritMerryMeshMessageMetalMethodMiddleMidnightMilkMillionMimicMindMinimumMinorMinuteMiracleMirrorMiseryMissMistakeMixMixedMixtureMobileModelModifyMomMomentMonitorMonkeyMonsterMonthMoonMoralMoreMorningMosquitoMotherMotionMotorMountainMouseMoveMovieMuchMuffinMuleMultiplyMuscleMuseumMushroomMusicMustMutualMyselfMysteryMythNaiveNameNapkinNarrowNastyNationNatureNearNeckNeedNegativeNeglectNeitherNephewNerveNestNetNetworkNeutralNeverNewsNextNiceNightNobleNoiseNomineeNoodleNormalNorthNoseNotableNoteNothingNoticeNovelNowNuclearNumberNurseNutOakObeyObjectObligeObscureObserveObtainObviousOccurOceanOctoberOdorOffOfferOfficeOftenOilOkayOldOliveOlympicOmitOnceOneOnionOnlineOnlyOpenOperaOpinionOpposeOptionOrangeOrbitOrchardOrderOrdinaryOrganOrientOriginalOrphanOstrichOtherOutdoorOuterOutputOutsideOvalOvenOverOwnOwnerOxygenOysterOzonePactPaddlePagePairPalacePalmPandaPanelPanicPantherPaperParadeParentParkParrotPartyPassPatchPathPatientPatrolPatternPausePavePaymentPeacePeanutPearPeasantPelicanPenPenaltyPencilPeoplePepperPerfectPermitPersonPetPhonePhotoPhrasePhysicalPianoPicnicPicturePiecePigPigeonPillPilotPinkPioneerPipePistolPitchPizzaPlacePlanetPlasticPlatePlayPleasePledgePluckPlugPlungePoemPoetPointPolarPolePolicePondPonyPoolPopularPortionPositionPossiblePostPotatoPotteryPovertyPowderPowerPracticePraisePredictPreferPreparePresentPrettyPreventPricePridePrimaryPrintPriorityPrisonPrivatePrizeProblemProcessProduceProfitProgramProjectPromoteProofPropertyProsperProtectProudProvidePublicPuddingPullPulpPulsePumpkinPunchPupilPuppyPurchasePurityPurposePursePushPutPuzzlePyramidQualityQuantumQuarterQuestionQuickQuitQuizQuoteRabbitRaccoonRaceRackRadarRadioRailRainRaiseRallyRampRanchRandomRangeRapidRareRateRatherRavenRawRazorReadyRealReasonRebelRebuildRecallReceiveRecipeRecordRecycleReduceReflectReformRefuseRegionRegretRegularRejectRelaxReleaseReliefRelyRemainRememberRemindRemoveRenderRenewRentReopenRepairRepeatReplaceReportRequireRescueResembleResistResourceResponseResultRetireRetreatReturnReunionRevealReviewRewardRhythmRibRibbonRiceRichRideRidgeRifleRightRigidRingRiotRippleRiskRitualRivalRiverRoadRoastRobotRobustRocketRomanceRoofRookieRoomRoseRotateRoughRoundRouteRoyalRubberRudeRugRuleRunRunwayRuralSadSaddleSadnessSafeSailSaladSalmonSalonSaltSaluteSameSampleSandSatisfySatoshiSauceSausageSaveSayScaleScanScareScatterSceneSchemeSchoolScienceScissorsScorpionScoutScrapScreenScriptScrubSeaSearchSeasonSeatSecondSecretSectionSecuritySeedSeekSegmentSelectSellSeminarSeniorSenseSentenceSeriesServiceSessionSettleSetupSevenShadowShaftShallowShareShedShellSheriffShieldShiftShineShipShiverShockShoeShootShopShortShoulderShoveShrimpShrugShuffleShySiblingSickSideSiegeSightSignSilentSilkSillySilverSimilarSimpleSinceSingSirenSisterSituateSixSizeSkateSketchSkiSkillSkinSkirtSkullSlabSlamSleepSlenderSliceSlideSlightSlimSloganSlotSlowSlushSmallSmartSmileSmokeSmoothSnackSnakeSnapSniffSnowSoapSoccerSocialSockSodaSoftSolarSoldierSolidSolutionSolveSomeoneSongSoonSorrySortSoulSoundSoupSourceSouthSpaceSpareSpatialSpawnSpeakSpecialSpeedSpellSpendSphereSpiceSpiderSpikeSpinSpiritSplitSpoilSponsorSpoonSportSpotSpraySpreadSpringSpySquareSqueezeSquirrelStableStadiumStaffStageStairsStampStandStartStateStaySteakSteelStemStepStereoStickStillStingStockStomachStoneStoolStoryStoveStrategyStreetStrikeStrongStruggleStudentStuffStumbleStyleSubjectSubmitSubwaySuccessSuchSuddenSufferSugarSuggestSuitSummerSunSunnySunsetSuperSupplySupremeSureSurfaceSurgeSurpriseSurroundSurveySuspectSustainSwallowSwampSwapSwarmSwearSweetSwiftSwimSwingSwitchSwordSymbolSymptomSyrupSystemTableTackleTagTailTalentTalkTankTapeTargetTaskTasteTattooTaxiTeachTeamTellTenTenantTennisTentTermTestTextThankThatThemeThenTheoryThereTheyThingThisThoughtThreeThriveThrowThumbThunderTicketTideTigerTiltTimberTimeTinyTipTiredTissueTitleToastTobaccoTodayToddlerToeTogetherToiletTokenTomatoTomorrowToneTongueTonightToolToothTopTopicToppleTorchTornadoTortoiseTossTotalTouristTowardTowerTownToyTrackTradeTrafficTragicTrainTransferTrapTrashTravelTrayTreatTreeTrendTrialTribeTrickTriggerTrimTripTrophyTroubleTruckTrueTrulyTrumpetTrustTruthTryTubeTuitionTumbleTunaTunnelTurkeyTurnTurtleTwelveTwentyTwiceTwinTwistTwoTypeTypicalUglyUmbrellaUnableUnawareUncleUncoverUnderUndoUnfairUnfoldUnhappyUniformUniqueUnitUniverseUnknownUnlockUntilUnusualUnveilUpdateUpgradeUpholdUponUpperUpsetUrbanUrgeUsageUseUsedUsefulUselessUsualUtilityVacantVacuumVagueValidValleyValveVanVanishVaporVariousVastVaultVehicleVelvetVendorVentureVenueVerbVerifyVersionVeryVesselVeteranViableVibrantViciousVictoryVideoViewVillageVintageViolinVirtualVirusVisaVisitVisualVitalVividVocalVoiceVoidVolcanoVolumeVoteVoyageWageWagonWaitWalkWallWalnutWantWarfareWarmWarriorWashWaspWasteWaterWaveWayWealthWeaponWearWeaselWeatherWebWeddingWeekendWeirdWelcomeWestWetWhaleWhatWheatWheelWhenWhereWhipWhisperWideWidthWifeWildWillWinWindowWineWingWinkWinnerWinterWireWisdomWiseWishWitnessWolfWomanWonderWoodWoolWordWorkWorldWorryWorthWrapWreckWrestleWristWriteWrongYardYearYellowYouYoungYouthZebraZeroZoneZoo";
      let N = null;
      function L(s) {
        if (
          N == null &&
          ((N = x
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .substring(1)
            .split(" ")),
          Y.check(s) !==
            "0x3c8acc1e7b08d8e76f9fda015ef48dc8c710a73cb7e0f77b2c18a9b5a7adde60")
        )
          throw (
            ((N = null), new Error("BIP39 Wordlist for en (English) FAILED"))
          );
      }
      class H extends Y {
        constructor() {
          super("en");
        }
        getWord(f) {
          return L(this), N[f];
        }
        getWordIndex(f) {
          return L(this), N.indexOf(f);
        }
      }
      const F = new H();
      Y.register(F);
      var n = k(4242);
      const y =
          "A/bacoAbdomenAbejaAbiertoAbogadoAbonoAbortoAbrazoAbrirAbueloAbusoAcabarAcademiaAccesoAccio/nAceiteAcelgaAcentoAceptarA/cidoAclararAcne/AcogerAcosoActivoActoActrizActuarAcudirAcuerdoAcusarAdictoAdmitirAdoptarAdornoAduanaAdultoAe/reoAfectarAficio/nAfinarAfirmarA/gilAgitarAgoni/aAgostoAgotarAgregarAgrioAguaAgudoA/guilaAgujaAhogoAhorroAireAislarAjedrezAjenoAjusteAlacra/nAlambreAlarmaAlbaA/lbumAlcaldeAldeaAlegreAlejarAlertaAletaAlfilerAlgaAlgodo/nAliadoAlientoAlivioAlmaAlmejaAlmi/barAltarAltezaAltivoAltoAlturaAlumnoAlzarAmableAmanteAmapolaAmargoAmasarA/mbarA/mbitoAmenoAmigoAmistadAmorAmparoAmplioAnchoAncianoAnclaAndarAnde/nAnemiaA/nguloAnilloA/nimoAni/sAnotarAntenaAntiguoAntojoAnualAnularAnuncioA~adirA~ejoA~oApagarAparatoApetitoApioAplicarApodoAporteApoyoAprenderAprobarApuestaApuroAradoAra~aArarA/rbitroA/rbolArbustoArchivoArcoArderArdillaArduoA/reaA/ridoAriesArmoni/aArne/sAromaArpaArpo/nArregloArrozArrugaArteArtistaAsaAsadoAsaltoAscensoAsegurarAseoAsesorAsientoAsiloAsistirAsnoAsombroA/speroAstillaAstroAstutoAsumirAsuntoAtajoAtaqueAtarAtentoAteoA/ticoAtletaA/tomoAtraerAtrozAtu/nAudazAudioAugeAulaAumentoAusenteAutorAvalAvanceAvaroAveAvellanaAvenaAvestruzAvio/nAvisoAyerAyudaAyunoAzafra/nAzarAzoteAzu/carAzufreAzulBabaBaborBacheBahi/aBaileBajarBalanzaBalco/nBaldeBambu/BancoBandaBa~oBarbaBarcoBarnizBarroBa/sculaBasto/nBasuraBatallaBateri/aBatirBatutaBau/lBazarBebe/BebidaBelloBesarBesoBestiaBichoBienBingoBlancoBloqueBlusaBoaBobinaBoboBocaBocinaBodaBodegaBoinaBolaBoleroBolsaBombaBondadBonitoBonoBonsa/iBordeBorrarBosqueBoteBoti/nBo/vedaBozalBravoBrazoBrechaBreveBrilloBrincoBrisaBrocaBromaBronceBroteBrujaBruscoBrutoBuceoBucleBuenoBueyBufandaBufo/nBu/hoBuitreBultoBurbujaBurlaBurroBuscarButacaBuzo/nCaballoCabezaCabinaCabraCacaoCada/verCadenaCaerCafe/Cai/daCaima/nCajaCajo/nCalCalamarCalcioCaldoCalidadCalleCalmaCalorCalvoCamaCambioCamelloCaminoCampoCa/ncerCandilCanelaCanguroCanicaCantoCa~aCa~o/nCaobaCaosCapazCapita/nCapoteCaptarCapuchaCaraCarbo/nCa/rcelCaretaCargaCari~oCarneCarpetaCarroCartaCasaCascoCaseroCaspaCastorCatorceCatreCaudalCausaCazoCebollaCederCedroCeldaCe/lebreCelosoCe/lulaCementoCenizaCentroCercaCerdoCerezaCeroCerrarCertezaCe/spedCetroChacalChalecoChampu/ChanclaChapaCharlaChicoChisteChivoChoqueChozaChuletaChuparCiclo/nCiegoCieloCienCiertoCifraCigarroCimaCincoCineCintaCipre/sCircoCiruelaCisneCitaCiudadClamorClanClaroClaseClaveClienteClimaCli/nicaCobreCoccio/nCochinoCocinaCocoCo/digoCodoCofreCogerCoheteCoji/nCojoColaColchaColegioColgarColinaCollarColmoColumnaCombateComerComidaCo/modoCompraCondeConejoCongaConocerConsejoContarCopaCopiaCorazo/nCorbataCorchoCordo/nCoronaCorrerCoserCosmosCostaCra/neoCra/terCrearCrecerCrei/doCremaCri/aCrimenCriptaCrisisCromoCro/nicaCroquetaCrudoCruzCuadroCuartoCuatroCuboCubrirCucharaCuelloCuentoCuerdaCuestaCuevaCuidarCulebraCulpaCultoCumbreCumplirCunaCunetaCuotaCupo/nCu/pulaCurarCuriosoCursoCurvaCutisDamaDanzaDarDardoDa/tilDeberDe/bilDe/cadaDecirDedoDefensaDefinirDejarDelfi/nDelgadoDelitoDemoraDensoDentalDeporteDerechoDerrotaDesayunoDeseoDesfileDesnudoDestinoDesvi/oDetalleDetenerDeudaDi/aDiabloDiademaDiamanteDianaDiarioDibujoDictarDienteDietaDiezDifi/cilDignoDilemaDiluirDineroDirectoDirigirDiscoDise~oDisfrazDivaDivinoDobleDoceDolorDomingoDonDonarDoradoDormirDorsoDosDosisDrago/nDrogaDuchaDudaDueloDue~oDulceDu/oDuqueDurarDurezaDuroE/banoEbrioEcharEcoEcuadorEdadEdicio/nEdificioEditorEducarEfectoEficazEjeEjemploElefanteElegirElementoElevarElipseE/liteElixirElogioEludirEmbudoEmitirEmocio/nEmpateEmpe~oEmpleoEmpresaEnanoEncargoEnchufeEnci/aEnemigoEneroEnfadoEnfermoEnga~oEnigmaEnlaceEnormeEnredoEnsayoEnse~arEnteroEntrarEnvaseEnvi/oE/pocaEquipoErizoEscalaEscenaEscolarEscribirEscudoEsenciaEsferaEsfuerzoEspadaEspejoEspi/aEsposaEspumaEsqui/EstarEsteEstiloEstufaEtapaEternoE/ticaEtniaEvadirEvaluarEventoEvitarExactoExamenExcesoExcusaExentoExigirExilioExistirE/xitoExpertoExplicarExponerExtremoFa/bricaFa/bulaFachadaFa/cilFactorFaenaFajaFaldaFalloFalsoFaltarFamaFamiliaFamosoFarao/nFarmaciaFarolFarsaFaseFatigaFaunaFavorFaxFebreroFechaFelizFeoFeriaFerozFe/rtilFervorFesti/nFiableFianzaFiarFibraFiccio/nFichaFideoFiebreFielFieraFiestaFiguraFijarFijoFilaFileteFilialFiltroFinFincaFingirFinitoFirmaFlacoFlautaFlechaFlorFlotaFluirFlujoFlu/orFobiaFocaFogataFogo/nFolioFolletoFondoFormaForroFortunaForzarFosaFotoFracasoFra/gilFranjaFraseFraudeFrei/rFrenoFresaFri/oFritoFrutaFuegoFuenteFuerzaFugaFumarFuncio/nFundaFurgo/nFuriaFusilFu/tbolFuturoGacelaGafasGaitaGajoGalaGaleri/aGalloGambaGanarGanchoGangaGansoGarajeGarzaGasolinaGastarGatoGavila/nGemeloGemirGenGe/neroGenioGenteGeranioGerenteGermenGestoGiganteGimnasioGirarGiroGlaciarGloboGloriaGolGolfoGolosoGolpeGomaGordoGorilaGorraGotaGoteoGozarGradaGra/ficoGranoGrasaGratisGraveGrietaGrilloGripeGrisGritoGrosorGru/aGruesoGrumoGrupoGuanteGuapoGuardiaGuerraGui/aGui~oGuionGuisoGuitarraGusanoGustarHaberHa/bilHablarHacerHachaHadaHallarHamacaHarinaHazHaza~aHebillaHebraHechoHeladoHelioHembraHerirHermanoHe/roeHervirHieloHierroHi/gadoHigieneHijoHimnoHistoriaHocicoHogarHogueraHojaHombreHongoHonorHonraHoraHormigaHornoHostilHoyoHuecoHuelgaHuertaHuesoHuevoHuidaHuirHumanoHu/medoHumildeHumoHundirHuraca/nHurtoIconoIdealIdiomaI/doloIglesiaIglu/IgualIlegalIlusio/nImagenIma/nImitarImparImperioImponerImpulsoIncapazI/ndiceInerteInfielInformeIngenioInicioInmensoInmuneInnatoInsectoInstanteIntere/sI/ntimoIntuirInu/tilInviernoIraIrisIroni/aIslaIsloteJabali/Jabo/nJamo/nJarabeJardi/nJarraJaulaJazmi/nJefeJeringaJineteJornadaJorobaJovenJoyaJuergaJuevesJuezJugadorJugoJugueteJuicioJuncoJunglaJunioJuntarJu/piterJurarJustoJuvenilJuzgarKiloKoalaLabioLacioLacraLadoLadro/nLagartoLa/grimaLagunaLaicoLamerLa/minaLa/mparaLanaLanchaLangostaLanzaLa/pizLargoLarvaLa/stimaLataLa/texLatirLaurelLavarLazoLealLeccio/nLecheLectorLeerLegio/nLegumbreLejanoLenguaLentoLe~aLeo/nLeopardoLesio/nLetalLetraLeveLeyendaLibertadLibroLicorLi/derLidiarLienzoLigaLigeroLimaLi/miteLimo/nLimpioLinceLindoLi/neaLingoteLinoLinternaLi/quidoLisoListaLiteraLitioLitroLlagaLlamaLlantoLlaveLlegarLlenarLlevarLlorarLloverLluviaLoboLocio/nLocoLocuraLo/gicaLogroLombrizLomoLonjaLoteLuchaLucirLugarLujoLunaLunesLupaLustroLutoLuzMacetaMachoMaderaMadreMaduroMaestroMafiaMagiaMagoMai/zMaldadMaletaMallaMaloMama/MamboMamutMancoMandoManejarMangaManiqui/ManjarManoMansoMantaMa~anaMapaMa/quinaMarMarcoMareaMarfilMargenMaridoMa/rmolMarro/nMartesMarzoMasaMa/scaraMasivoMatarMateriaMatizMatrizMa/ximoMayorMazorcaMechaMedallaMedioMe/dulaMejillaMejorMelenaMelo/nMemoriaMenorMensajeMenteMenu/MercadoMerengueMe/ritoMesMeso/nMetaMeterMe/todoMetroMezclaMiedoMielMiembroMigaMilMilagroMilitarMillo/nMimoMinaMineroMi/nimoMinutoMiopeMirarMisaMiseriaMisilMismoMitadMitoMochilaMocio/nModaModeloMohoMojarMoldeMolerMolinoMomentoMomiaMonarcaMonedaMonjaMontoMo~oMoradaMorderMorenoMorirMorroMorsaMortalMoscaMostrarMotivoMoverMo/vilMozoMuchoMudarMuebleMuelaMuerteMuestraMugreMujerMulaMuletaMultaMundoMu~ecaMuralMuroMu/sculoMuseoMusgoMu/sicaMusloNa/carNacio/nNadarNaipeNaranjaNarizNarrarNasalNatalNativoNaturalNa/useaNavalNaveNavidadNecioNe/ctarNegarNegocioNegroNeo/nNervioNetoNeutroNevarNeveraNichoNidoNieblaNietoNi~ezNi~oNi/tidoNivelNoblezaNocheNo/minaNoriaNormaNorteNotaNoticiaNovatoNovelaNovioNubeNucaNu/cleoNudilloNudoNueraNueveNuezNuloNu/meroNutriaOasisObesoObispoObjetoObraObreroObservarObtenerObvioOcaOcasoOce/anoOchentaOchoOcioOcreOctavoOctubreOcultoOcuparOcurrirOdiarOdioOdiseaOesteOfensaOfertaOficioOfrecerOgroOi/doOi/rOjoOlaOleadaOlfatoOlivoOllaOlmoOlorOlvidoOmbligoOndaOnzaOpacoOpcio/nO/peraOpinarOponerOptarO/pticaOpuestoOracio/nOradorOralO/rbitaOrcaOrdenOrejaO/rganoOrgi/aOrgulloOrienteOrigenOrillaOroOrquestaOrugaOsadi/aOscuroOseznoOsoOstraOto~oOtroOvejaO/vuloO/xidoOxi/genoOyenteOzonoPactoPadrePaellaPa/ginaPagoPai/sPa/jaroPalabraPalcoPaletaPa/lidoPalmaPalomaPalparPanPanalPa/nicoPanteraPa~ueloPapa/PapelPapillaPaquetePararParcelaParedParirParoPa/rpadoParquePa/rrafoPartePasarPaseoPasio/nPasoPastaPataPatioPatriaPausaPautaPavoPayasoPeato/nPecadoPeceraPechoPedalPedirPegarPeinePelarPelda~oPeleaPeligroPellejoPeloPelucaPenaPensarPe~o/nPeo/nPeorPepinoPeque~oPeraPerchaPerderPerezaPerfilPericoPerlaPermisoPerroPersonaPesaPescaPe/simoPesta~aPe/taloPetro/leoPezPezu~aPicarPicho/nPiePiedraPiernaPiezaPijamaPilarPilotoPimientaPinoPintorPinzaPi~aPiojoPipaPirataPisarPiscinaPisoPistaPito/nPizcaPlacaPlanPlataPlayaPlazaPleitoPlenoPlomoPlumaPluralPobrePocoPoderPodioPoemaPoesi/aPoetaPolenPolici/aPolloPolvoPomadaPomeloPomoPompaPonerPorcio/nPortalPosadaPoseerPosiblePostePotenciaPotroPozoPradoPrecozPreguntaPremioPrensaPresoPrevioPrimoPri/ncipePrisio/nPrivarProaProbarProcesoProductoProezaProfesorProgramaProlePromesaProntoPropioPro/ximoPruebaPu/blicoPucheroPudorPuebloPuertaPuestoPulgaPulirPulmo/nPulpoPulsoPumaPuntoPu~alPu~oPupaPupilaPure/QuedarQuejaQuemarQuererQuesoQuietoQui/micaQuinceQuitarRa/banoRabiaRaboRacio/nRadicalRai/zRamaRampaRanchoRangoRapazRa/pidoRaptoRasgoRaspaRatoRayoRazaRazo/nReaccio/nRealidadReba~oReboteRecaerRecetaRechazoRecogerRecreoRectoRecursoRedRedondoReducirReflejoReformaRefra/nRefugioRegaloRegirReglaRegresoRehe/nReinoRei/rRejaRelatoRelevoRelieveRellenoRelojRemarRemedioRemoRencorRendirRentaRepartoRepetirReposoReptilResRescateResinaRespetoRestoResumenRetiroRetornoRetratoReunirReve/sRevistaReyRezarRicoRiegoRiendaRiesgoRifaRi/gidoRigorRinco/nRi~o/nRi/oRiquezaRisaRitmoRitoRizoRobleRoceRociarRodarRodeoRodillaRoerRojizoRojoRomeroRomperRonRoncoRondaRopaRoperoRosaRoscaRostroRotarRubi/RuborRudoRuedaRugirRuidoRuinaRuletaRuloRumboRumorRupturaRutaRutinaSa/badoSaberSabioSableSacarSagazSagradoSalaSaldoSaleroSalirSalmo/nSalo/nSalsaSaltoSaludSalvarSambaSancio/nSandi/aSanearSangreSanidadSanoSantoSapoSaqueSardinaSarte/nSastreSata/nSaunaSaxofo/nSeccio/nSecoSecretoSectaSedSeguirSeisSelloSelvaSemanaSemillaSendaSensorSe~alSe~orSepararSepiaSequi/aSerSerieSermo/nServirSesentaSesio/nSetaSetentaSeveroSexoSextoSidraSiestaSieteSigloSignoSi/labaSilbarSilencioSillaSi/mboloSimioSirenaSistemaSitioSituarSobreSocioSodioSolSolapaSoldadoSoledadSo/lidoSoltarSolucio/nSombraSondeoSonidoSonoroSonrisaSopaSoplarSoporteSordoSorpresaSorteoSoste/nSo/tanoSuaveSubirSucesoSudorSuegraSueloSue~oSuerteSufrirSujetoSulta/nSumarSuperarSuplirSuponerSupremoSurSurcoSure~oSurgirSustoSutilTabacoTabiqueTablaTabu/TacoTactoTajoTalarTalcoTalentoTallaTalo/nTama~oTamborTangoTanqueTapaTapeteTapiaTapo/nTaquillaTardeTareaTarifaTarjetaTarotTarroTartaTatuajeTauroTazaTazo/nTeatroTechoTeclaTe/cnicaTejadoTejerTejidoTelaTele/fonoTemaTemorTemploTenazTenderTenerTenisTensoTeori/aTerapiaTercoTe/rminoTernuraTerrorTesisTesoroTestigoTeteraTextoTezTibioTiburo/nTiempoTiendaTierraTiesoTigreTijeraTildeTimbreTi/midoTimoTintaTi/oTi/picoTipoTiraTiro/nTita/nTi/tereTi/tuloTizaToallaTobilloTocarTocinoTodoTogaToldoTomarTonoTontoToparTopeToqueTo/raxToreroTormentaTorneoToroTorpedoTorreTorsoTortugaTosToscoToserTo/xicoTrabajoTractorTraerTra/ficoTragoTrajeTramoTranceTratoTraumaTrazarTre/bolTreguaTreintaTrenTreparTresTribuTrigoTripaTristeTriunfoTrofeoTrompaTroncoTropaTroteTrozoTrucoTruenoTrufaTuberi/aTuboTuertoTumbaTumorTu/nelTu/nicaTurbinaTurismoTurnoTutorUbicarU/lceraUmbralUnidadUnirUniversoUnoUntarU~aUrbanoUrbeUrgenteUrnaUsarUsuarioU/tilUtopi/aUvaVacaVaci/oVacunaVagarVagoVainaVajillaValeVa/lidoValleValorVa/lvulaVampiroVaraVariarVaro/nVasoVecinoVectorVehi/culoVeinteVejezVelaVeleroVelozVenaVencerVendaVenenoVengarVenirVentaVenusVerVeranoVerboVerdeVeredaVerjaVersoVerterVi/aViajeVibrarVicioVi/ctimaVidaVi/deoVidrioViejoViernesVigorVilVillaVinagreVinoVi~edoVioli/nViralVirgoVirtudVisorVi/speraVistaVitaminaViudoVivazViveroVivirVivoVolca/nVolumenVolverVorazVotarVotoVozVueloVulgarYacerYateYeguaYemaYernoYesoYodoYogaYogurZafiroZanjaZapatoZarzaZonaZorroZumoZurdo",
        O = {};
      let R = null;
      function ee(s) {
        return (
          Q.checkNormalize(),
          (0, n.ZN)(
            Array.prototype.filter.call(
              (0, n.Y0)(s.normalize("NFD").toLowerCase()),
              (f) => (f >= 65 && f <= 90) || (f >= 97 && f <= 123)
            )
          )
        );
      }
      function ne(s) {
        const f = [];
        return (
          Array.prototype.forEach.call((0, n.Y0)(s), (S) => {
            S === 47
              ? (f.push(204), f.push(129))
              : S === 126
              ? (f.push(110), f.push(204), f.push(131))
              : f.push(S);
          }),
          (0, n.ZN)(f)
        );
      }
      function ie(s) {
        if (
          R == null &&
          ((R = y
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .substring(1)
            .split(" ")
            .map((f) => ne(f))),
          R.forEach((f, S) => {
            O[ee(f)] = S;
          }),
          Y.check(s) !==
            "0xf74fb7092aeacdfbf8959557de22098da512207fb9f109cb526994938cf40300")
        )
          throw (
            ((R = null), new Error("BIP39 Wordlist for es (Spanish) FAILED"))
          );
      }
      class c extends Y {
        constructor() {
          super("es");
        }
        getWord(f) {
          return ie(this), R[f];
        }
        getWordIndex(f) {
          return ie(this), O[ee(f)];
        }
      }
      const E = new c();
      Y.register(E);
      const p =
        "AbaisserAbandonAbdiquerAbeilleAbolirAborderAboutirAboyerAbrasifAbreuverAbriterAbrogerAbruptAbsenceAbsoluAbsurdeAbusifAbyssalAcade/mieAcajouAcarienAccablerAccepterAcclamerAccoladeAccrocheAccuserAcerbeAchatAcheterAcidulerAcierAcompteAcque/rirAcronymeActeurActifActuelAdepteAde/quatAdhe/sifAdjectifAdjugerAdmettreAdmirerAdopterAdorerAdoucirAdresseAdroitAdulteAdverbeAe/rerAe/ronefAffaireAffecterAfficheAffreuxAffublerAgacerAgencerAgileAgiterAgraferAgre/ableAgrumeAiderAiguilleAilierAimableAisanceAjouterAjusterAlarmerAlchimieAlerteAlge-breAlgueAlie/nerAlimentAlle/gerAlliageAllouerAllumerAlourdirAlpagaAltesseAlve/oleAmateurAmbiguAmbreAme/nagerAmertumeAmidonAmiralAmorcerAmourAmovibleAmphibieAmpleurAmusantAnalyseAnaphoreAnarchieAnatomieAncienAne/antirAngleAngoisseAnguleuxAnimalAnnexerAnnonceAnnuelAnodinAnomalieAnonymeAnormalAntenneAntidoteAnxieuxApaiserApe/ritifAplanirApologieAppareilAppelerApporterAppuyerAquariumAqueducArbitreArbusteArdeurArdoiseArgentArlequinArmatureArmementArmoireArmureArpenterArracherArriverArroserArsenicArte/rielArticleAspectAsphalteAspirerAssautAsservirAssietteAssocierAssurerAsticotAstreAstuceAtelierAtomeAtriumAtroceAttaqueAttentifAttirerAttraperAubaineAubergeAudaceAudibleAugurerAuroreAutomneAutrucheAvalerAvancerAvariceAvenirAverseAveugleAviateurAvideAvionAviserAvoineAvouerAvrilAxialAxiomeBadgeBafouerBagageBaguetteBaignadeBalancerBalconBaleineBalisageBambinBancaireBandageBanlieueBannie-reBanquierBarbierBarilBaronBarqueBarrageBassinBastionBatailleBateauBatterieBaudrierBavarderBeletteBe/lierBeloteBe/ne/ficeBerceauBergerBerlineBermudaBesaceBesogneBe/tailBeurreBiberonBicycleBiduleBijouBilanBilingueBillardBinaireBiologieBiopsieBiotypeBiscuitBisonBistouriBitumeBizarreBlafardBlagueBlanchirBlessantBlinderBlondBloquerBlousonBobardBobineBoireBoiserBolideBonbonBondirBonheurBonifierBonusBordureBorneBotteBoucleBoueuxBougieBoulonBouquinBourseBoussoleBoutiqueBoxeurBrancheBrasierBraveBrebisBre-cheBreuvageBricolerBrigadeBrillantBriocheBriqueBrochureBroderBronzerBrousseBroyeurBrumeBrusqueBrutalBruyantBuffleBuissonBulletinBureauBurinBustierButinerButoirBuvableBuvetteCabanonCabineCachetteCadeauCadreCafe/ineCaillouCaissonCalculerCalepinCalibreCalmerCalomnieCalvaireCamaradeCame/raCamionCampagneCanalCanetonCanonCantineCanularCapableCaporalCapriceCapsuleCapterCapucheCarabineCarboneCaresserCaribouCarnageCarotteCarreauCartonCascadeCasierCasqueCassureCauserCautionCavalierCaverneCaviarCe/dilleCeintureCe/lesteCelluleCendrierCensurerCentralCercleCe/re/bralCeriseCernerCerveauCesserChagrinChaiseChaleurChambreChanceChapitreCharbonChasseurChatonChaussonChavirerChemiseChenilleChe/quierChercherChevalChienChiffreChignonChime-reChiotChlorureChocolatChoisirChoseChouetteChromeChuteCigareCigogneCimenterCine/maCintrerCirculerCirerCirqueCiterneCitoyenCitronCivilClaironClameurClaquerClasseClavierClientClignerClimatClivageClocheClonageCloporteCobaltCobraCocasseCocotierCoderCodifierCoffreCognerCohe/sionCoifferCoincerCole-reColibriCollineColmaterColonelCombatCome/dieCommandeCompactConcertConduireConfierCongelerConnoterConsonneContactConvexeCopainCopieCorailCorbeauCordageCornicheCorpusCorrectCorte-geCosmiqueCostumeCotonCoudeCoupureCourageCouteauCouvrirCoyoteCrabeCrainteCravateCrayonCre/atureCre/diterCre/meuxCreuserCrevetteCriblerCrierCristalCrite-reCroireCroquerCrotaleCrucialCruelCrypterCubiqueCueillirCuille-reCuisineCuivreCulminerCultiverCumulerCupideCuratifCurseurCyanureCycleCylindreCyniqueDaignerDamierDangerDanseurDauphinDe/battreDe/biterDe/borderDe/briderDe/butantDe/calerDe/cembreDe/chirerDe/ciderDe/clarerDe/corerDe/crireDe/cuplerDe/daleDe/ductifDe/esseDe/fensifDe/filerDe/frayerDe/gagerDe/givrerDe/glutirDe/graferDe/jeunerDe/liceDe/logerDemanderDemeurerDe/molirDe/nicherDe/nouerDentelleDe/nuderDe/partDe/penserDe/phaserDe/placerDe/poserDe/rangerDe/roberDe/sastreDescenteDe/sertDe/signerDe/sobe/irDessinerDestrierDe/tacherDe/testerDe/tourerDe/tresseDevancerDevenirDevinerDevoirDiableDialogueDiamantDicterDiffe/rerDige/rerDigitalDigneDiluerDimancheDiminuerDioxydeDirectifDirigerDiscuterDisposerDissiperDistanceDivertirDiviserDocileDocteurDogmeDoigtDomaineDomicileDompterDonateurDonjonDonnerDopamineDortoirDorureDosageDoseurDossierDotationDouanierDoubleDouceurDouterDoyenDragonDraperDresserDribblerDroitureDuperieDuplexeDurableDurcirDynastieE/blouirE/carterE/charpeE/chelleE/clairerE/clipseE/cloreE/cluseE/coleE/conomieE/corceE/couterE/craserE/cre/merE/crivainE/crouE/cumeE/cureuilE/difierE/duquerEffacerEffectifEffigieEffortEffrayerEffusionE/galiserE/garerE/jecterE/laborerE/largirE/lectronE/le/gantE/le/phantE/le-veE/ligibleE/litismeE/logeE/luciderE/luderEmballerEmbellirEmbryonE/meraudeE/missionEmmenerE/motionE/mouvoirEmpereurEmployerEmporterEmpriseE/mulsionEncadrerEnche-reEnclaveEncocheEndiguerEndosserEndroitEnduireE/nergieEnfanceEnfermerEnfouirEngagerEnginEngloberE/nigmeEnjamberEnjeuEnleverEnnemiEnnuyeuxEnrichirEnrobageEnseigneEntasserEntendreEntierEntourerEntraverE/nume/rerEnvahirEnviableEnvoyerEnzymeE/olienE/paissirE/pargneE/patantE/pauleE/picerieE/pide/mieE/pierE/pilogueE/pineE/pisodeE/pitapheE/poqueE/preuveE/prouverE/puisantE/querreE/quipeE/rigerE/rosionErreurE/ruptionEscalierEspadonEspe-ceEspie-gleEspoirEspritEsquiverEssayerEssenceEssieuEssorerEstimeEstomacEstradeE/tage-reE/talerE/tancheE/tatiqueE/teindreE/tendoirE/ternelE/thanolE/thiqueEthnieE/tirerE/tofferE/toileE/tonnantE/tourdirE/trangeE/troitE/tudeEuphorieE/valuerE/vasionE/ventailE/videnceE/viterE/volutifE/voquerExactExage/rerExaucerExcellerExcitantExclusifExcuseExe/cuterExempleExercerExhalerExhorterExigenceExilerExisterExotiqueExpe/dierExplorerExposerExprimerExquisExtensifExtraireExulterFableFabuleuxFacetteFacileFactureFaiblirFalaiseFameuxFamilleFarceurFarfeluFarineFaroucheFascinerFatalFatigueFauconFautifFaveurFavoriFe/brileFe/conderFe/de/rerFe/linFemmeFe/murFendoirFe/odalFermerFe/roceFerveurFestivalFeuilleFeutreFe/vrierFiascoFicelerFictifFide-leFigureFilatureFiletageFilie-reFilleulFilmerFilouFiltrerFinancerFinirFioleFirmeFissureFixerFlairerFlammeFlasqueFlatteurFle/auFle-cheFleurFlexionFloconFloreFluctuerFluideFluvialFolieFonderieFongibleFontaineForcerForgeronFormulerFortuneFossileFoudreFouge-reFouillerFoulureFourmiFragileFraiseFranchirFrapperFrayeurFre/gateFreinerFrelonFre/mirFre/ne/sieFre-reFriableFrictionFrissonFrivoleFroidFromageFrontalFrotterFruitFugitifFuiteFureurFurieuxFurtifFusionFuturGagnerGalaxieGalerieGambaderGarantirGardienGarnirGarrigueGazelleGazonGe/antGe/latineGe/luleGendarmeGe/ne/ralGe/nieGenouGentilGe/ologieGe/ome-treGe/raniumGermeGestuelGeyserGibierGiclerGirafeGivreGlaceGlaiveGlisserGlobeGloireGlorieuxGolfeurGommeGonflerGorgeGorilleGoudronGouffreGoulotGoupilleGourmandGoutteGraduelGraffitiGraineGrandGrappinGratuitGravirGrenatGriffureGrillerGrimperGrognerGronderGrotteGroupeGrugerGrutierGruye-reGue/pardGuerrierGuideGuimauveGuitareGustatifGymnasteGyrostatHabitudeHachoirHalteHameauHangarHannetonHaricotHarmonieHarponHasardHe/liumHe/matomeHerbeHe/rissonHermineHe/ronHe/siterHeureuxHibernerHibouHilarantHistoireHiverHomardHommageHomoge-neHonneurHonorerHonteuxHordeHorizonHorlogeHormoneHorribleHouleuxHousseHublotHuileuxHumainHumbleHumideHumourHurlerHydromelHygie-neHymneHypnoseIdylleIgnorerIguaneIlliciteIllusionImageImbiberImiterImmenseImmobileImmuableImpactImpe/rialImplorerImposerImprimerImputerIncarnerIncendieIncidentInclinerIncoloreIndexerIndiceInductifIne/ditIneptieInexactInfiniInfligerInformerInfusionInge/rerInhalerInhiberInjecterInjureInnocentInoculerInonderInscrireInsecteInsigneInsoliteInspirerInstinctInsulterIntactIntenseIntimeIntrigueIntuitifInutileInvasionInventerInviterInvoquerIroniqueIrradierIrre/elIrriterIsolerIvoireIvresseJaguarJaillirJambeJanvierJardinJaugerJauneJavelotJetableJetonJeudiJeunesseJoindreJoncherJonglerJoueurJouissifJournalJovialJoyauJoyeuxJubilerJugementJuniorJuponJuristeJusticeJuteuxJuve/nileKayakKimonoKiosqueLabelLabialLabourerLace/rerLactoseLaguneLaineLaisserLaitierLambeauLamelleLampeLanceurLangageLanterneLapinLargeurLarmeLaurierLavaboLavoirLectureLe/galLe/gerLe/gumeLessiveLettreLevierLexiqueLe/zardLiasseLibe/rerLibreLicenceLicorneLie-geLie-vreLigatureLigoterLigueLimerLimiteLimonadeLimpideLine/aireLingotLionceauLiquideLisie-reListerLithiumLitigeLittoralLivreurLogiqueLointainLoisirLombricLoterieLouerLourdLoutreLouveLoyalLubieLucideLucratifLueurLugubreLuisantLumie-reLunaireLundiLuronLutterLuxueuxMachineMagasinMagentaMagiqueMaigreMaillonMaintienMairieMaisonMajorerMalaxerMale/ficeMalheurMaliceMalletteMammouthMandaterManiableManquantManteauManuelMarathonMarbreMarchandMardiMaritimeMarqueurMarronMartelerMascotteMassifMate/rielMatie-reMatraqueMaudireMaussadeMauveMaximalMe/chantMe/connuMe/dailleMe/decinMe/diterMe/duseMeilleurMe/langeMe/lodieMembreMe/moireMenacerMenerMenhirMensongeMentorMercrediMe/riteMerleMessagerMesureMe/talMe/te/oreMe/thodeMe/tierMeubleMiaulerMicrobeMietteMignonMigrerMilieuMillionMimiqueMinceMine/ralMinimalMinorerMinuteMiracleMiroiterMissileMixteMobileModerneMoelleuxMondialMoniteurMonnaieMonotoneMonstreMontagneMonumentMoqueurMorceauMorsureMortierMoteurMotifMoucheMoufleMoulinMoussonMoutonMouvantMultipleMunitionMurailleMure-neMurmureMuscleMuse/umMusicienMutationMuterMutuelMyriadeMyrtilleMyste-reMythiqueNageurNappeNarquoisNarrerNatationNationNatureNaufrageNautiqueNavireNe/buleuxNectarNe/fasteNe/gationNe/gligerNe/gocierNeigeNerveuxNettoyerNeuroneNeutronNeveuNicheNickelNitrateNiveauNobleNocifNocturneNoirceurNoisetteNomadeNombreuxNommerNormatifNotableNotifierNotoireNourrirNouveauNovateurNovembreNoviceNuageNuancerNuireNuisibleNume/roNuptialNuqueNutritifObe/irObjectifObligerObscurObserverObstacleObtenirObturerOccasionOccuperOce/anOctobreOctroyerOctuplerOculaireOdeurOdorantOffenserOfficierOffrirOgiveOiseauOisillonOlfactifOlivierOmbrageOmettreOnctueuxOndulerOne/reuxOniriqueOpaleOpaqueOpe/rerOpinionOpportunOpprimerOpterOptiqueOrageuxOrangeOrbiteOrdonnerOreilleOrganeOrgueilOrificeOrnementOrqueOrtieOscillerOsmoseOssatureOtarieOuraganOursonOutilOutragerOuvrageOvationOxydeOxyge-neOzonePaisiblePalacePalmare-sPalourdePalperPanachePandaPangolinPaniquerPanneauPanoramaPantalonPapayePapierPapoterPapyrusParadoxeParcelleParesseParfumerParlerParoleParrainParsemerPartagerParureParvenirPassionPaste-quePaternelPatiencePatronPavillonPavoiserPayerPaysagePeignePeintrePelagePe/licanPellePelousePeluchePendulePe/ne/trerPe/niblePensifPe/nuriePe/pitePe/plumPerdrixPerforerPe/riodePermuterPerplexePersilPertePeserPe/talePetitPe/trirPeuplePharaonPhobiePhoquePhotonPhrasePhysiquePianoPicturalPie-cePierrePieuvrePilotePinceauPipettePiquerPiroguePiscinePistonPivoterPixelPizzaPlacardPlafondPlaisirPlanerPlaquePlastronPlateauPleurerPlexusPliagePlombPlongerPluiePlumagePochettePoe/siePoe-tePointePoirierPoissonPoivrePolairePolicierPollenPolygonePommadePompierPonctuelPonde/rerPoneyPortiquePositionPosse/derPosturePotagerPoteauPotionPoucePoulainPoumonPourprePoussinPouvoirPrairiePratiquePre/cieuxPre/direPre/fixePre/ludePre/nomPre/sencePre/textePre/voirPrimitifPrincePrisonPriverProble-meProce/derProdigeProfondProgre-sProieProjeterProloguePromenerPropreProspe-reProte/gerProuesseProverbePrudencePruneauPsychosePublicPuceronPuiserPulpePulsarPunaisePunitifPupitrePurifierPuzzlePyramideQuasarQuerelleQuestionQuie/tudeQuitterQuotientRacineRaconterRadieuxRagondinRaideurRaisinRalentirRallongeRamasserRapideRasageRatisserRavagerRavinRayonnerRe/actifRe/agirRe/aliserRe/animerRecevoirRe/citerRe/clamerRe/colterRecruterReculerRecyclerRe/digerRedouterRefaireRe/flexeRe/formerRefrainRefugeRe/galienRe/gionRe/glageRe/gulierRe/ite/rerRejeterRejouerRelatifReleverReliefRemarqueReme-deRemiseRemonterRemplirRemuerRenardRenfortReniflerRenoncerRentrerRenvoiReplierReporterRepriseReptileRequinRe/serveRe/sineuxRe/soudreRespectResterRe/sultatRe/tablirRetenirRe/ticuleRetomberRetracerRe/unionRe/ussirRevancheRevivreRe/volteRe/vulsifRichesseRideauRieurRigideRigolerRincerRiposterRisibleRisqueRituelRivalRivie-reRocheuxRomanceRompreRonceRondinRoseauRosierRotatifRotorRotuleRougeRouilleRouleauRoutineRoyaumeRubanRubisRucheRuelleRugueuxRuinerRuisseauRuserRustiqueRythmeSablerSaboterSabreSacocheSafariSagesseSaisirSaladeSaliveSalonSaluerSamediSanctionSanglierSarcasmeSardineSaturerSaugrenuSaumonSauterSauvageSavantSavonnerScalpelScandaleSce/le/ratSce/narioSceptreSche/maScienceScinderScoreScrutinSculpterSe/anceSe/cableSe/cherSecouerSe/cre/terSe/datifSe/duireSeigneurSe/jourSe/lectifSemaineSemblerSemenceSe/minalSe/nateurSensibleSentenceSe/parerSe/quenceSereinSergentSe/rieuxSerrureSe/rumServiceSe/sameSe/virSevrageSextupleSide/ralSie-cleSie/gerSifflerSigleSignalSilenceSiliciumSimpleSince-reSinistreSiphonSiropSismiqueSituerSkierSocialSocleSodiumSoigneuxSoldatSoleilSolitudeSolubleSombreSommeilSomnolerSondeSongeurSonnetteSonoreSorcierSortirSosieSottiseSoucieuxSoudureSouffleSouleverSoupapeSourceSoutirerSouvenirSpacieuxSpatialSpe/cialSphe-reSpiralStableStationSternumStimulusStipulerStrictStudieuxStupeurStylisteSublimeSubstratSubtilSubvenirSucce-sSucreSuffixeSugge/rerSuiveurSulfateSuperbeSupplierSurfaceSuricateSurmenerSurpriseSursautSurvieSuspectSyllabeSymboleSyme/trieSynapseSyntaxeSyste-meTabacTablierTactileTaillerTalentTalismanTalonnerTambourTamiserTangibleTapisTaquinerTarderTarifTartineTasseTatamiTatouageTaupeTaureauTaxerTe/moinTemporelTenailleTendreTeneurTenirTensionTerminerTerneTerribleTe/tineTexteThe-meThe/orieThe/rapieThoraxTibiaTie-deTimideTirelireTiroirTissuTitaneTitreTituberTobogganTole/rantTomateToniqueTonneauToponymeTorcheTordreTornadeTorpilleTorrentTorseTortueTotemToucherTournageTousserToxineTractionTraficTragiqueTrahirTrainTrancherTravailTre-fleTremperTre/sorTreuilTriageTribunalTricoterTrilogieTriompheTriplerTriturerTrivialTromboneTroncTropicalTroupeauTuileTulipeTumulteTunnelTurbineTuteurTutoyerTuyauTympanTyphonTypiqueTyranUbuesqueUltimeUltrasonUnanimeUnifierUnionUniqueUnitaireUniversUraniumUrbainUrticantUsageUsineUsuelUsureUtileUtopieVacarmeVaccinVagabondVagueVaillantVaincreVaisseauValableValiseVallonValveVampireVanilleVapeurVarierVaseuxVassalVasteVecteurVedetteVe/ge/talVe/hiculeVeinardVe/loceVendrediVe/ne/rerVengerVenimeuxVentouseVerdureVe/rinVernirVerrouVerserVertuVestonVe/te/ranVe/tusteVexantVexerViaducViandeVictoireVidangeVide/oVignetteVigueurVilainVillageVinaigreViolonVipe-reVirementVirtuoseVirusVisageViseurVisionVisqueuxVisuelVitalVitesseViticoleVitrineVivaceVivipareVocationVoguerVoileVoisinVoitureVolailleVolcanVoltigerVolumeVoraceVortexVoterVouloirVoyageVoyelleWagonXe/nonYachtZe-breZe/nithZesteZoologie";
      let w = null;
      const g = {};
      function B(s) {
        return (
          Q.checkNormalize(),
          (0, n.ZN)(
            Array.prototype.filter.call(
              (0, n.Y0)(s.normalize("NFD").toLowerCase()),
              (f) => (f >= 65 && f <= 90) || (f >= 97 && f <= 123)
            )
          )
        );
      }
      function X(s) {
        const f = [];
        return (
          Array.prototype.forEach.call((0, n.Y0)(s), (S) => {
            S === 47
              ? (f.push(204), f.push(129))
              : S === 45
              ? (f.push(204), f.push(128))
              : f.push(S);
          }),
          (0, n.ZN)(f)
        );
      }
      function D(s) {
        if (
          w == null &&
          ((w = p
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .substring(1)
            .split(" ")
            .map((f) => X(f))),
          w.forEach((f, S) => {
            g[B(f)] = S;
          }),
          Y.check(s) !==
            "0x51deb7ae009149dc61a6bd18a918eb7ac78d2775726c68e598b92d002519b045")
        )
          throw (
            ((w = null), new Error("BIP39 Wordlist for fr (French) FAILED"))
          );
      }
      class d extends Y {
        constructor() {
          super("fr");
        }
        getWord(f) {
          return D(this), w[f];
        }
        getWordIndex(f) {
          return D(this), g[B(f)];
        }
      }
      const i = new d();
      Y.register(i);
      var b = k(3286);
      const I = [
          "AQRASRAGBAGUAIRAHBAghAURAdBAdcAnoAMEAFBAFCBKFBQRBSFBCXBCDBCHBGFBEQBpBBpQBIkBHNBeOBgFBVCBhBBhNBmOBmRBiHBiFBUFBZDBvFBsXBkFBlcBjYBwDBMBBTBBTRBWBBWXXaQXaRXQWXSRXCFXYBXpHXOQXHRXhRXuRXmXXbRXlXXwDXTRXrCXWQXWGaBWaKcaYgasFadQalmaMBacAKaRKKBKKXKKjKQRKDRKCYKCRKIDKeVKHcKlXKjHKrYNAHNBWNaRNKcNIBNIONmXNsXNdXNnBNMBNRBNrXNWDNWMNFOQABQAHQBrQXBQXFQaRQKXQKDQKOQKFQNBQNDQQgQCXQCDQGBQGDQGdQYXQpBQpQQpHQLXQHuQgBQhBQhCQuFQmXQiDQUFQZDQsFQdRQkHQbRQlOQlmQPDQjDQwXQMBQMDQcFQTBQTHQrDDXQDNFDGBDGQDGRDpFDhFDmXDZXDbRDMYDRdDTRDrXSAhSBCSBrSGQSEQSHBSVRShYShkSyQSuFSiBSdcSoESocSlmSMBSFBSFKSFNSFdSFcCByCaRCKcCSBCSRCCrCGbCEHCYXCpBCpQCIBCIHCeNCgBCgFCVECVcCmkCmwCZXCZFCdRClOClmClFCjDCjdCnXCwBCwXCcRCFQCFjGXhGNhGDEGDMGCDGCHGIFGgBGVXGVEGVRGmXGsXGdYGoSGbRGnXGwXGwDGWRGFNGFLGFOGFdGFkEABEBDEBFEXOEaBEKSENBENDEYXEIgEIkEgBEgQEgHEhFEudEuFEiBEiHEiFEZDEvBEsXEsFEdXEdREkFEbBEbRElFEPCEfkEFNYAEYAhYBNYQdYDXYSRYCEYYoYgQYgRYuRYmCYZTYdBYbEYlXYjQYRbYWRpKXpQopQnpSFpCXpIBpISphNpdBpdRpbRpcZpFBpFNpFDpFopFrLADLBuLXQLXcLaFLCXLEhLpBLpFLHXLeVLhILdHLdRLoDLbRLrXIABIBQIBCIBsIBoIBMIBRIXaIaRIKYIKRINBINuICDIGBIIDIIkIgRIxFIyQIiHIdRIbYIbRIlHIwRIMYIcRIRVITRIFBIFNIFQOABOAFOBQOaFONBONMOQFOSFOCDOGBOEQOpBOLXOIBOIFOgQOgFOyQOycOmXOsXOdIOkHOMEOMkOWWHBNHXNHXWHNXHDuHDRHSuHSRHHoHhkHmRHdRHkQHlcHlRHwBHWcgAEgAggAkgBNgBQgBEgXOgYcgLXgHjgyQgiBgsFgdagMYgWSgFQgFEVBTVXEVKBVKNVKDVKYVKRVNBVNYVDBVDxVSBVSRVCjVGNVLXVIFVhBVhcVsXVdRVbRVlRhBYhKYhDYhGShxWhmNhdahdkhbRhjohMXhTRxAXxXSxKBxNBxEQxeNxeQxhXxsFxdbxlHxjcxFBxFNxFQxFOxFoyNYyYoybcyMYuBQuBRuBruDMuCouHBudQukkuoBulVuMXuFEmCYmCRmpRmeDmiMmjdmTFmFQiADiBOiaRiKRiNBiNRiSFiGkiGFiERipRiLFiIFihYibHijBijEiMXiWBiFBiFCUBQUXFUaRUNDUNcUNRUNFUDBUSHUCDUGBUGFUEqULNULoUIRUeEUeYUgBUhFUuRUiFUsXUdFUkHUbBUjSUjYUwXUMDUcHURdUTBUrBUrXUrQZAFZXZZaRZKFZNBZQFZCXZGBZYdZpBZLDZIFZHXZHNZeQZVRZVFZmXZiBZvFZdFZkFZbHZbFZwXZcCZcRZRBvBQvBGvBLvBWvCovMYsAFsBDsaRsKFsNFsDrsSHsSFsCXsCRsEBsEHsEfspBsLBsLDsIgsIRseGsbRsFBsFQsFSdNBdSRdCVdGHdYDdHcdVbdySduDdsXdlRdwXdWYdWcdWRkBMkXOkaRkNIkNFkSFkCFkYBkpRkeNkgBkhVkmXksFklVkMBkWDkFNoBNoaQoaFoNBoNXoNaoNEoSRoEroYXoYCoYbopRopFomXojkowXorFbBEbEIbdBbjYlaRlDElMXlFDjKjjSRjGBjYBjYkjpRjLXjIBjOFjeVjbRjwBnXQnSHnpFnLXnINnMBnTRwXBwXNwXYwNFwQFwSBwGFwLXwLDweNwgBwuHwjDwnXMBXMpFMIBMeNMTHcaQcNBcDHcSFcCXcpBcLXcLDcgFcuFcnXcwXccDcTQcrFTQErXNrCHrpFrgFrbFrTHrFcWNYWNbWEHWMXWTR",
          "ABGHABIJAEAVAYJQALZJAIaRAHNXAHdcAHbRAZJMAZJRAZTRAdVJAklmAbcNAjdRAMnRAMWYAWpRAWgRAFgBAFhBAFdcBNJBBNJDBQKBBQhcBQlmBDEJBYJkBYJTBpNBBpJFBIJBBIJDBIcABOKXBOEJBOVJBOiJBOZJBepBBeLXBeIFBegBBgGJBVJXBuocBiJRBUJQBlXVBlITBwNFBMYVBcqXBTlmBWNFBWiJBWnRBFGHBFwXXKGJXNJBXNZJXDTTXSHSXSVRXSlHXCJDXGQJXEhXXYQJXYbRXOfXXeNcXVJFXhQJXhEJXdTRXjdXXMhBXcQTXRGBXTEBXTnQXFCXXFOFXFgFaBaFaBNJaBCJaBpBaBwXaNJKaNJDaQIBaDpRaEPDaHMFamDJalEJaMZJaFaFaFNBaFQJaFLDaFVHKBCYKBEBKBHDKXaFKXGdKXEJKXpHKXIBKXZDKXwXKKwLKNacKNYJKNJoKNWcKDGdKDTRKChXKGaRKGhBKGbRKEBTKEaRKEPTKLMDKLWRKOHDKVJcKdBcKlIBKlOPKFSBKFEPKFpFNBNJNJBQNBGHNBEPNBHXNBgFNBVXNBZDNBsXNBwXNNaRNNJDNNJENNJkNDCJNDVDNGJRNJiDNZJNNsCJNJFNNFSBNFCXNFEPNFLXNFIFQJBFQCaRQJEQQLJDQLJFQIaRQOqXQHaFQHHQQVJXQVJDQhNJQmEIQZJFQsJXQJrFQWbRDJABDBYJDXNFDXCXDXLXDXZDDXsJDQqXDSJFDJCXDEPkDEqXDYmQDpSJDOCkDOGQDHEIDVJDDuDuDWEBDJFgSBNDSBSFSBGHSBIBSBTQSKVYSJQNSJQiSJCXSEqXSJYVSIiJSOMYSHAHSHaQSeCFSepQSegBSHdHSHrFShSJSJuHSJUFSkNRSrSrSWEBSFaHSJFQSFCXSFGDSFYXSFODSFgBSFVXSFhBSFxFSFkFSFbBSFMFCADdCJXBCXaFCXKFCXNFCXCXCXGBCXEJCXYBCXLDCXIBCXOPCXHXCXgBCXhBCXiBCXlDCXcHCJNBCJNFCDCJCDGBCDVXCDhBCDiDCDJdCCmNCpJFCIaRCOqXCHCHCHZJCViJCuCuCmddCJiFCdNBCdHhClEJCnUJCreSCWlgCWTRCFBFCFNBCFYBCFVFCFhFCFdSCFTBCFWDGBNBGBQFGJBCGBEqGBpBGBgQGNBEGNJYGNkOGNJRGDUFGJpQGHaBGJeNGJeEGVBlGVKjGiJDGvJHGsVJGkEBGMIJGWjNGFBFGFCXGFGBGFYXGFpBGFMFEASJEAWpEJNFECJVEIXSEIQJEOqXEOcFEeNcEHEJEHlFEJgFEhlmEmDJEmZJEiMBEUqXEoSREPBFEPXFEPKFEPSFEPEFEPpFEPLXEPIBEJPdEPcFEPTBEJnXEqlHEMpREFCXEFODEFcFYASJYJAFYBaBYBVXYXpFYDhBYCJBYJGFYYbRYeNcYJeVYiIJYZJcYvJgYvJRYJsXYsJFYMYMYreVpBNHpBEJpBwXpQxFpYEJpeNDpJeDpeSFpeCHpHUJpHbBpHcHpmUJpiiJpUJrpsJuplITpFaBpFQqpFGBpFEfpFYBpFpBpFLJpFIDpFgBpFVXpFyQpFuFpFlFpFjDpFnXpFwXpJFMpFTBLXCJLXEFLXhFLXUJLXbFLalmLNJBLSJQLCLCLGJBLLDJLHaFLeNFLeSHLeCXLepFLhaRLZsJLsJDLsJrLocaLlLlLMdbLFNBLFSBLFEHLFkFIBBFIBXFIBaQIBKXIBSFIBpHIBLXIBgBIBhBIBuHIBmXIBiFIBZXIBvFIBbFIBjQIBwXIBWFIKTRIQUJIDGFICjQIYSRIINXIJeCIVaRImEkIZJFIvJRIsJXIdCJIJoRIbBQIjYBIcqXITFVIreVIFKFIFSFIFCJIFGFIFLDIFIBIJFOIFgBIFVXIJFhIFxFIFmXIFdHIFbBIJFrIJFWOBGBOQfXOOKjOUqXOfXBOqXEOcqXORVJOFIBOFlDHBIOHXiFHNTRHCJXHIaRHHJDHHEJHVbRHZJYHbIBHRsJHRkDHWlmgBKFgBSBgBCDgBGHgBpBgBIBgBVJgBuBgBvFgKDTgQVXgDUJgGSJgOqXgmUMgZIJgTUJgWIEgFBFgFNBgFDJgFSFgFGBgFYXgJFOgFgQgFVXgFhBgFbHgJFWVJABVQKcVDgFVOfXVeDFVhaRVmGdViJYVMaRVFNHhBNDhBCXhBEqhBpFhBLXhNJBhSJRheVXhhKEhxlmhZIJhdBQhkIJhbMNhMUJhMZJxNJgxQUJxDEkxDdFxSJRxplmxeSBxeCXxeGFxeYXxepQxegBxWVcxFEQxFLXxFIBxFgBxFxDxFZtxFdcxFbBxFwXyDJXyDlcuASJuDJpuDIBuCpJuGSJuIJFueEFuZIJusJXudWEuoIBuWGJuFBcuFKEuFNFuFQFuFDJuFGJuFVJuFUtuFdHuFTBmBYJmNJYmQhkmLJDmLJomIdXmiJYmvJRmsJRmklmmMBymMuCmclmmcnQiJABiJBNiJBDiBSFiBCJiBEFiBYBiBpFiBLXiBTHiJNciDEfiCZJiECJiJEqiOkHiHKFieNDiHJQieQcieDHieSFieCXieGFieEFieIHiegFihUJixNoioNXiFaBiFKFiFNDiFEPiFYXitFOitFHiFgBiFVEiFmXiFitiFbBiFMFiFrFUCXQUIoQUIJcUHQJUeCEUHwXUUJDUUqXUdWcUcqXUrnQUFNDUFSHUFCFUFEfUFLXUtFOZBXOZXSBZXpFZXVXZEQJZEJkZpDJZOqXZeNHZeCDZUqXZFBQZFEHZFLXvBAFvBKFvBCXvBEPvBpHvBIDvBgFvBuHvQNJvFNFvFGBvFIBvJFcsXCDsXLXsXsXsXlFsXcHsQqXsJQFsEqXseIFsFEHsFjDdBxOdNpRdNJRdEJbdpJRdhZJdnSJdrjNdFNJdFQHdFhNkNJDkYaRkHNRkHSRkVbRkuMRkjSJkcqDoSJFoEiJoYZJoOfXohEBoMGQocqXbBAFbBXFbBaFbBNDbBGBbBLXbBTBbBWDbGJYbIJHbFQqbFpQlDgQlOrFlVJRjGEBjZJRnXvJnXbBnEfHnOPDngJRnxfXnUJWwXEJwNpJwDpBwEfXwrEBMDCJMDGHMDIJMLJDcQGDcQpHcqXccqNFcqCXcFCJRBSBRBGBRBEJRBpQTBNFTBQJTBpBTBVXTFABTFSBTFCFTFGBTFMDrXCJrXLDrDNJrEfHrFQJrFitWNjdWNTR",
          "AKLJMANOPFASNJIAEJWXAYJNRAIIbRAIcdaAeEfDAgidRAdjNYAMYEJAMIbRAFNJBAFpJFBBIJYBDZJFBSiJhBGdEBBEJfXBEJqXBEJWRBpaUJBLXrXBIYJMBOcfXBeEfFBestXBjNJRBcDJOBFEqXXNvJRXDMBhXCJNYXOAWpXONJWXHDEBXeIaRXhYJDXZJSJXMDJOXcASJXFVJXaBQqXaBZJFasXdQaFSJQaFEfXaFpJHaFOqXKBNSRKXvJBKQJhXKEJQJKEJGFKINJBKIJjNKgJNSKVElmKVhEBKiJGFKlBgJKjnUJKwsJYKMFIJKFNJDKFIJFKFOfXNJBSFNJBCXNBpJFNJBvQNJBMBNJLJXNJOqXNJeCXNJeGFNdsJCNbTKFNwXUJQNFEPQDiJcQDMSJQSFpBQGMQJQJeOcQyCJEQUJEBQJFBrQFEJqDXDJFDJXpBDJXIMDGiJhDIJGRDJeYcDHrDJDVXgFDkAWpDkIgRDjDEqDMvJRDJFNFDJFIBSKclmSJQOFSJQVHSJQjDSJGJBSJGJFSECJoSHEJqSJHTBSJVJDSViJYSZJNBSJsJDSFSJFSFEfXSJFLXCBUJVCJXSBCJXpBCXVJXCJXsXCJXdFCJNJHCLIJgCHiJFCVNJMChCJhCUHEJCsJTRCJdYcCoQJCCFEfXCFIJgCFUJxCFstFGJBaQGJBIDGQJqXGYJNRGJHKFGeQqDGHEJFGJeLXGHIiJGHdBlGUJEBGkIJTGFQPDGJFEqEAGegEJIJBEJVJXEhQJTEiJNcEJZJFEJoEqEjDEqEPDsXEPGJBEPOqXEPeQFEfDiDEJfEFEfepQEfMiJEqXNBEqDIDEqeSFEqVJXEMvJRYXNJDYXEJHYKVJcYYJEBYJeEcYJUqXYFpJFYFstXpAZJMpBSJFpNBNFpeQPDpHLJDpHIJFpHgJFpeitFpHZJFpJFADpFSJFpJFCJpFOqXpFitBpJFZJLXIJFLIJgRLVNJWLVHJMLwNpJLFGJBLFLJDLFOqXLJFUJIBDJXIBGJBIJBYQIJBIBIBOqXIBcqDIEGJFILNJTIIJEBIOiJhIJeNBIJeIBIhiJIIWoTRIJFAHIJFpBIJFuHIFUtFIJFTHOSBYJOEcqXOHEJqOvBpFOkVJrObBVJOncqDOcNJkHhNJRHuHJuHdMhBgBUqXgBsJXgONJBgHNJDgHHJQgJeitgHsJXgJyNagyDJBgZJDrgsVJQgkEJNgkjSJgJFAHgFCJDgFZtMVJXNFVXQfXVJXDJVXoQJVQVJQVDEfXVDvJHVEqNFVeQfXVHpJFVHxfXVVJSRVVmaRVlIJOhCXVJhHjYkhxCJVhWVUJhWiJcxBNJIxeEqDxfXBFxcFEPxFSJFxFYJXyBDQJydaUJyFOPDuYCJYuLvJRuHLJXuZJLDuFOPDuFZJHuFcqXmKHJdmCQJcmOsVJiJAGFitLCFieOfXiestXiZJMEikNJQirXzFiFQqXiFIJFiFZJFiFvtFUHpJFUteIcUteOcUVCJkUhdHcUbEJEUJqXQUMNJhURjYkUFitFZDGJHZJIxDZJVJXZJFDJZJFpQvBNJBvBSJFvJxBrseQqDsVFVJdFLJDkEJNBkmNJYkFLJDoQJOPoGsJRoEAHBoEJfFbBQqDbBZJHbFVJXlFIJBjYIrXjeitcjjCEBjWMNBwXQfXwXOaFwDsJXwCJTRwrCZJMDNJQcDDJFcqDOPRYiJFTBsJXTQIJBTFEfXTFLJDrXEJFrEJXMrFZJFWEJdEWYTlm",
          "ABCDEFACNJTRAMBDJdAcNJVXBLNJEBXSIdWRXErNJkXYDJMBXZJCJaXMNJaYKKVJKcKDEJqXKDcNJhKVJrNYKbgJVXKFVJSBNBYBwDNJeQfXNJeEqXNhGJWENJFiJRQlIJbEQJfXxDQqXcfXQFNDEJQFwXUJDYcnUJDJIBgQDIUJTRDJFEqDSJQSJFSJQIJFSOPeZtSJFZJHCJXQfXCTDEqFGJBSJFGJBOfXGJBcqXGJHNJDGJRLiJEJfXEqEJFEJPEFpBEJYJBZJFYBwXUJYiJMEBYJZJyTYTONJXpQMFXFpeGIDdpJFstXpJFcPDLBVSJRLHQJqXLJFZJFIJBNJDIJBUqXIBkFDJIJEJPTIYJGWRIJeQPDIJeEfHIJFsJXOqGDSFHXEJqXgJCsJCgGQJqXgdQYJEgFMFNBgJFcqDVJwXUJVJFZJchIgJCCxOEJqXxOwXUJyDJBVRuscisciJBiJBieUtqXiJFDJkiFsJXQUGEZJcUJFsJXZtXIrXZDZJDrZJFNJDZJFstXvJFQqXvJFCJEsJXQJqkhkNGBbDJdTRbYJMEBlDwXUJMEFiJFcfXNJDRcNJWMTBLJXC",
          "BraFUtHBFSJFdbNBLJXVJQoYJNEBSJBEJfHSJHwXUJCJdAZJMGjaFVJXEJPNJBlEJfFiJFpFbFEJqIJBVJCrIBdHiJhOPFChvJVJZJNJWxGFNIFLueIBQJqUHEJfUFstOZJDrlXEASJRlXVJXSFwVJNJWD",
          "QJEJNNJDQJEJIBSFQJEJxegBQJEJfHEPSJBmXEJFSJCDEJqXLXNJFQqXIcQsFNJFIFEJqXUJgFsJXIJBUJEJfHNFvJxEqXNJnXUJFQqD",
          "IJBEJqXZJ",
        ],
        J =
          "~~AzB~X~a~KN~Q~D~S~C~G~E~Y~p~L~I~O~eH~g~V~hxyumi~~U~~Z~~v~~s~~dkoblPjfnqwMcRTr~W~~~F~~~~~Jt";
      let A = null;
      function $(s) {
        return (0, b.Dv)((0, n.Y0)(s));
      }
      const xe = "0xe3818de38284e3818f",
        be = "0xe3818de38283e3818f";
      function ce(s) {
        if (A !== null) return;
        A = [];
        const f = {};
        (f[(0, n.ZN)([227, 130, 154])] = !1),
          (f[(0, n.ZN)([227, 130, 153])] = !1),
          (f[(0, n.ZN)([227, 130, 133])] = (0, n.ZN)([227, 130, 134])),
          (f[(0, n.ZN)([227, 129, 163])] = (0, n.ZN)([227, 129, 164])),
          (f[(0, n.ZN)([227, 130, 131])] = (0, n.ZN)([227, 130, 132])),
          (f[(0, n.ZN)([227, 130, 135])] = (0, n.ZN)([227, 130, 136]));
        function S(q) {
          let re = "";
          for (let le = 0; le < q.length; le++) {
            let fe = q[le];
            const Me = f[fe];
            Me !== !1 && (Me && (fe = Me), (re += fe));
          }
          return re;
        }
        function j(q, re) {
          return (q = S(q)), (re = S(re)), q < re ? -1 : q > re ? 1 : 0;
        }
        for (let q = 3; q <= 9; q++) {
          const re = I[q - 3];
          for (let le = 0; le < re.length; le += q) {
            const fe = [];
            for (let Me = 0; Me < q; Me++) {
              const Ie = J.indexOf(re[le + Me]);
              fe.push(227),
                fe.push(Ie & 64 ? 130 : 129),
                fe.push((Ie & 63) + 128);
            }
            A.push((0, n.ZN)(fe));
          }
        }
        if ((A.sort(j), $(A[442]) === xe && $(A[443]) === be)) {
          const q = A[442];
          (A[442] = A[443]), (A[443] = q);
        }
        if (
          Y.check(s) !==
          "0xcb36b09e6baa935787fd762ce65e80b0c6a8dabdfbc3a7f86ac0e2c4fd111600"
        )
          throw (
            ((A = null), new Error("BIP39 Wordlist for ja (Japanese) FAILED"))
          );
      }
      class me extends Y {
        constructor() {
          super("ja");
        }
        getWord(f) {
          return ce(this), A[f];
        }
        getWordIndex(f) {
          return ce(this), A.indexOf(f);
        }
        split(f) {
          return Q.checkNormalize(), f.split(/(?:\u3000| )+/g);
        }
        join(f) {
          return f.join("\u3000");
        }
      }
      const Se = new me();
      Y.register(Se);
      const Be = [
          "OYAa",
          "ATAZoATBl3ATCTrATCl8ATDloATGg3ATHT8ATJT8ATJl3ATLlvATLn4ATMT8ATMX8ATMboATMgoAToLbAToMTATrHgATvHnAT3AnAT3JbAT3MTAT8DbAT8JTAT8LmAT8MYAT8MbAT#LnAUHT8AUHZvAUJXrAUJX8AULnrAXJnvAXLUoAXLgvAXMn6AXRg3AXrMbAX3JTAX3QbAYLn3AZLgvAZrSUAZvAcAZ8AaAZ8AbAZ8AnAZ8HnAZ8LgAZ8MYAZ8MgAZ8OnAaAboAaDTrAaFTrAaJTrAaJboAaLVoAaMXvAaOl8AaSeoAbAUoAbAg8AbAl4AbGnrAbMT8AbMXrAbMn4AbQb8AbSV8AbvRlAb8AUAb8AnAb8HgAb8JTAb8NTAb8RbAcGboAcLnvAcMT8AcMX8AcSToAcrAaAcrFnAc8AbAc8MgAfGgrAfHboAfJnvAfLV8AfLkoAfMT8AfMnoAfQb8AfScrAfSgrAgAZ8AgFl3AgGX8AgHZvAgHgrAgJXoAgJX8AgJboAgLZoAgLn4AgOX8AgoATAgoAnAgoCUAgoJgAgoLXAgoMYAgoSeAgrDUAgrJTAhrFnAhrLjAhrQgAjAgoAjJnrAkMX8AkOnoAlCTvAlCV8AlClvAlFg4AlFl6AlFn3AloSnAlrAXAlrAfAlrFUAlrFbAlrGgAlrOXAlvKnAlvMTAl3AbAl3MnAnATrAnAcrAnCZ3AnCl8AnDg8AnFboAnFl3AnHX4AnHbrAnHgrAnIl3AnJgvAnLXoAnLX4AnLbrAnLgrAnLhrAnMXoAnMgrAnOn3AnSbrAnSeoAnvLnAn3OnCTGgvCTSlvCTvAUCTvKnCTvNTCT3CZCT3GUCT3MTCT8HnCUCZrCULf8CULnvCU3HnCU3JUCY6NUCbDb8CbFZoCbLnrCboOTCboScCbrFnCbvLnCb8AgCb8HgCb$LnCkLfoClBn3CloDUDTHT8DTLl3DTSU8DTrAaDTrLXDTrLjDTrOYDTrOgDTvFXDTvFnDT3HUDT3LfDUCT9DUDT4DUFVoDUFV8DUFkoDUGgrDUJnrDULl8DUMT8DUMXrDUMX4DUMg8DUOUoDUOgvDUOg8DUSToDUSZ8DbDXoDbDgoDbGT8DbJn3DbLg3DbLn4DbMXrDbMg8DbOToDboJXGTClvGTDT8GTFZrGTLVoGTLlvGTLl3GTMg8GTOTvGTSlrGToCUGTrDgGTrJYGTrScGTtLnGTvAnGTvQgGUCZrGUDTvGUFZoGUHXrGULnvGUMT8GUoMgGXoLnGXrMXGXrMnGXvFnGYLnvGZOnvGZvOnGZ8LaGZ8LmGbAl3GbDYvGbDlrGbHX3GbJl4GbLV8GbLn3GbMn4GboJTGboRfGbvFUGb3GUGb4JnGgDX3GgFl$GgJlrGgLX6GgLZoGgLf8GgOXoGgrAgGgrJXGgrMYGgrScGgvATGgvOYGnAgoGnJgvGnLZoGnLg3GnLnrGnQn8GnSbrGnrMgHTClvHTDToHTFT3HTQT8HToJTHToJgHTrDUHTrMnHTvFYHTvRfHT8MnHT8SUHUAZ8HUBb4HUDTvHUoMYHXFl6HXJX6HXQlrHXrAUHXrMnHXrSbHXvFYHXvKXHX3LjHX3MeHYvQlHZrScHZvDbHbAcrHbFT3HbFl3HbJT8HbLTrHbMT8HbMXrHbMbrHbQb8HbSX3HboDbHboJTHbrFUHbrHgHbrJTHb8JTHb8MnHb8QgHgAlrHgDT3HgGgrHgHgrHgJTrHgJT8HgLX@HgLnrHgMT8HgMX8HgMboHgOnrHgQToHgRg3HgoHgHgrCbHgrFnHgrLVHgvAcHgvAfHnAloHnCTrHnCnvHnGTrHnGZ8HnGnvHnJT8HnLf8HnLkvHnMg8HnRTrITvFUITvFnJTAXrJTCV8JTFT3JTFT8JTFn4JTGgvJTHT8JTJT8JTJXvJTJl3JTJnvJTLX4JTLf8JTLhvJTMT8JTMXrJTMnrJTObrJTQT8JTSlvJT8DUJT8FkJT8MTJT8OXJT8OgJT8QUJT8RfJUHZoJXFT4JXFlrJXGZ8JXGnrJXLV8JXLgvJXMXoJXMX3JXNboJXPlvJXoJTJXoLkJXrAXJXrHUJXrJgJXvJTJXvOnJX4KnJYAl3JYJT8JYLhvJYQToJYrQXJY6NUJbAl3JbCZrJbDloJbGT8JbGgrJbJXvJbJboJbLf8JbLhrJbLl3JbMnvJbRg8JbSZ8JboDbJbrCZJbrSUJb3KnJb8LnJfRn8JgAXrJgCZrJgDTrJgGZrJgGZ8JgHToJgJT8JgJXoJgJgvJgLX4JgLZ3JgLZ8JgLn4JgMgrJgMn4JgOgvJgPX6JgRnvJgSToJgoCZJgoJbJgoMYJgrJXJgrJgJgrLjJg6MTJlCn3JlGgvJlJl8Jl4AnJl8FnJl8HgJnAToJnATrJnAbvJnDUoJnGnrJnJXrJnJXvJnLhvJnLnrJnLnvJnMToJnMT8JnMXvJnMX3JnMg8JnMlrJnMn4JnOX8JnST4JnSX3JnoAgJnoAnJnoJTJnoObJnrAbJnrAkJnrHnJnrJTJnrJYJnrOYJnrScJnvCUJnvFaJnvJgJnvJnJnvOYJnvQUJnvRUJn3FnJn3JTKnFl3KnLT6LTDlvLTMnoLTOn3LTRl3LTSb4LTSlrLToAnLToJgLTrAULTrAcLTrCULTrHgLTrMgLT3JnLULnrLUMX8LUoJgLVATrLVDTrLVLb8LVoJgLV8MgLV8RTLXDg3LXFlrLXrCnLXrLXLX3GTLX4GgLX4OYLZAXrLZAcrLZAgrLZAhrLZDXyLZDlrLZFbrLZFl3LZJX6LZJX8LZLc8LZLnrLZSU8LZoJTLZoJnLZrAgLZrAnLZrJYLZrLULZrMgLZrSkLZvAnLZvGULZvJeLZvOTLZ3FZLZ4JXLZ8STLZ8ScLaAT3LaAl3LaHT8LaJTrLaJT8LaJXrLaJgvLaJl4LaLVoLaMXrLaMXvLaMX8LbClvLbFToLbHlrLbJn4LbLZ3LbLhvLbMXrLbMnoLbvSULcLnrLc8HnLc8MTLdrMnLeAgoLeOgvLeOn3LfAl3LfLnvLfMl3LfOX8Lf8AnLf8JXLf8LXLgJTrLgJXrLgJl8LgMX8LgRZrLhCToLhrAbLhrFULhrJXLhvJYLjHTrLjHX4LjJX8LjLhrLjSX3LjSZ4LkFX4LkGZ8LkGgvLkJTrLkMXoLkSToLkSU8LkSZ8LkoOYLl3FfLl3MgLmAZrLmCbrLmGgrLmHboLmJnoLmJn3LmLfoLmLhrLmSToLnAX6LnAb6LnCZ3LnCb3LnDTvLnDb8LnFl3LnGnrLnHZvLnHgvLnITvLnJT8LnJX8LnJlvLnLf8LnLg6LnLhvLnLnoLnMXrLnMg8LnQlvLnSbrLnrAgLnrAnLnrDbLnrFkLnrJdLnrMULnrOYLnrSTLnvAnLnvDULnvHgLnvOYLnvOnLn3GgLn4DULn4JTLn4JnMTAZoMTAloMTDb8MTFT8MTJnoMTJnrMTLZrMTLhrMTLkvMTMX8MTRTrMToATMTrDnMTrOnMT3JnMT4MnMT8FUMT8FaMT8FlMT8GTMT8GbMT8GnMT8HnMT8JTMT8JbMT8OTMUCl8MUJTrMUJU8MUMX8MURTrMUSToMXAX6MXAb6MXCZoMXFXrMXHXrMXLgvMXOgoMXrAUMXrAnMXrHgMXrJYMXrJnMXrMTMXrMgMXrOYMXrSZMXrSgMXvDUMXvOTMX3JgMX3OTMX4JnMX8DbMX8FnMX8HbMX8HgMX8HnMX8LbMX8MnMX8OnMYAb8MYGboMYHTvMYHX4MYLTrMYLnvMYMToMYOgvMYRg3MYSTrMbAToMbAXrMbAl3MbAn8MbGZ8MbJT8MbJXrMbMXvMbMX8MbMnoMbrMUMb8AfMb8FbMb8FkMcJXoMeLnrMgFl3MgGTvMgGXoMgGgrMgGnrMgHT8MgHZrMgJnoMgLnrMgLnvMgMT8MgQUoMgrHnMgvAnMg8HgMg8JYMg8LfMloJnMl8ATMl8AXMl8JYMnAToMnAT4MnAZ8MnAl3MnAl4MnCl8MnHT8MnHg8MnJnoMnLZoMnLhrMnMXoMnMX3MnMnrMnOgvMnrFbMnrFfMnrFnMnrNTMnvJXNTMl8OTCT3OTFV8OTFn3OTHZvOTJXrOTOl3OT3ATOT3JUOT3LZOT3LeOT3MbOT8ATOT8AbOT8AgOT8MbOUCXvOUMX3OXHXvOXLl3OXrMUOXvDbOX6NUOX8JbOYFZoOYLbrOYLkoOYMg8OYSX3ObHTrObHT4ObJgrObLhrObMX3ObOX8Ob8FnOeAlrOeJT8OeJXrOeJnrOeLToOeMb8OgJXoOgLXoOgMnrOgOXrOgOloOgoAgOgoJbOgoMYOgoSTOg8AbOjLX4OjMnoOjSV8OnLVoOnrAgOn3DUPXQlrPXvFXPbvFTPdAT3PlFn3PnvFbQTLn4QToAgQToMTQULV8QURg8QUoJnQXCXvQbFbrQb8AaQb8AcQb8FbQb8MYQb8ScQeAlrQeLhrQjAn3QlFXoQloJgQloSnRTLnvRTrGURTrJTRUJZrRUoJlRUrQnRZrLmRZrMnRZrSnRZ8ATRZ8JbRZ8ScRbMT8RbST3RfGZrRfMX8RfMgrRfSZrRnAbrRnGT8RnvJgRnvLfRnvMTRn8AaSTClvSTJgrSTOXrSTRg3STRnvSToAcSToAfSToAnSToHnSToLjSToMTSTrAaSTrEUST3BYST8AgST8LmSUAZvSUAgrSUDT4SUDT8SUGgvSUJXoSUJXvSULTrSU8JTSU8LjSV8AnSV8JgSXFToSXLf8SYvAnSZrDUSZrMUSZrMnSZ8HgSZ8JTSZ8JgSZ8MYSZ8QUSaQUoSbCT3SbHToSbQYvSbSl4SboJnSbvFbSb8HbSb8JgSb8OTScGZrScHgrScJTvScMT8ScSToScoHbScrMTScvAnSeAZrSeAcrSeHboSeJUoSeLhrSeMT8SeMXrSe6JgSgHTrSkJnoSkLnvSk8CUSlFl3SlrSnSl8GnSmAboSmGT8SmJU8",
          "ATLnDlATrAZoATrJX4ATrMT8ATrMX4ATrRTrATvDl8ATvJUoATvMl8AT3AToAT3MX8AT8CT3AT8DT8AT8HZrAT8HgoAUAgFnAUCTFnAXoMX8AXrAT8AXrGgvAXrJXvAXrOgoAXvLl3AZvAgoAZvFbrAZvJXoAZvJl8AZvJn3AZvMX8AZvSbrAZ8FZoAZ8LZ8AZ8MU8AZ8OTvAZ8SV8AZ8SX3AbAgFZAboJnoAbvGboAb8ATrAb8AZoAb8AgrAb8Al4Ab8Db8Ab8JnoAb8LX4Ab8LZrAb8LhrAb8MT8Ab8OUoAb8Qb8Ab8ST8AcrAUoAcrAc8AcrCZ3AcrFT3AcrFZrAcrJl4AcrJn3AcrMX3AcrOTvAc8AZ8Ac8MT8AfAcJXAgoFn4AgoGgvAgoGnrAgoLc8AgoMXoAgrLnrAkrSZ8AlFXCTAloHboAlrHbrAlrLhrAlrLkoAl3CZrAl3LUoAl3LZrAnrAl4AnrMT8An3HT4BT3IToBX4MnvBb!Ln$CTGXMnCToLZ4CTrHT8CT3JTrCT3RZrCT#GTvCU6GgvCU8Db8CU8GZrCU8HT8CboLl3CbrGgrCbrMU8Cb8DT3Cb8GnrCb8LX4Cb8MT8Cb8ObrCgrGgvCgrKX4Cl8FZoDTrAbvDTrDboDTrGT6DTrJgrDTrMX3DTrRZrDTrRg8DTvAVvDTvFZoDT3DT8DT3Ln3DT4HZrDT4MT8DT8AlrDT8MT8DUAkGbDUDbJnDYLnQlDbDUOYDbMTAnDbMXSnDboAT3DboFn4DboLnvDj6JTrGTCgFTGTGgFnGTJTMnGTLnPlGToJT8GTrCT3GTrLVoGTrLnvGTrMX3GTrMboGTvKl3GZClFnGZrDT3GZ8DTrGZ8FZ8GZ8MXvGZ8On8GZ8ST3GbCnQXGbMbFnGboFboGboJg3GboMXoGb3JTvGb3JboGb3Mn6Gb3Qb8GgDXLjGgMnAUGgrDloGgrHX4GgrSToGgvAXrGgvAZvGgvFbrGgvLl3GgvMnvGnDnLXGnrATrGnrMboGnuLl3HTATMnHTAgCnHTCTCTHTrGTvHTrHTvHTrJX8HTrLl8HTrMT8HTrMgoHTrOTrHTuOn3HTvAZrHTvDTvHTvGboHTvJU8HTvLl3HTvMXrHTvQb4HT4GT6HT4JT8HT4Jb#HT8Al3HT8GZrHT8GgrHT8HX4HT8Jb8HT8JnoHT8LTrHT8LgvHT8SToHT8SV8HUoJUoHUoJX8HUoLnrHXrLZoHXvAl3HX3LnrHX4FkvHX4LhrHX4MXoHX4OnoHZrAZ8HZrDb8HZrGZ8HZrJnrHZvGZ8HZvLnvHZ8JnvHZ8LhrHbCXJlHbMTAnHboJl4HbpLl3HbrJX8HbrLnrHbrMnvHbvRYrHgoSTrHgrFV8HgrGZ8HgrJXoHgrRnvHgvBb!HgvGTrHgvHX4HgvHn!HgvLTrHgvSU8HnDnLbHnFbJbHnvDn8Hn6GgvHn!BTvJTCTLnJTQgFnJTrAnvJTrLX4JTrOUoJTvFn3JTvLnrJTvNToJT3AgoJT3Jn4JT3LhvJT3ObrJT8AcrJT8Al3JT8JT8JT8JnoJT8LX4JT8LnrJT8MX3JT8Rg3JT8Sc8JUoBTvJU8AToJU8GZ8JU8GgvJU8JTrJU8JXrJU8JnrJU8LnvJU8ScvJXHnJlJXrGgvJXrJU8JXrLhrJXrMT8JXrMXrJXrQUoJXvCTvJXvGZ8JXvGgrJXvQT8JX8Ab8JX8DT8JX8GZ8JX8HZvJX8LnrJX8MT8JX8MXoJX8MnvJX8ST3JYGnCTJbAkGbJbCTAnJbLTAcJboDT3JboLb6JbrAnvJbrCn3JbrDl8JbrGboJbrIZoJbrJnvJbrMnvJbrQb4Jb8RZrJeAbAnJgJnFbJgScAnJgrATrJgvHZ8JgvMn4JlJlFbJlLiQXJlLjOnJlRbOlJlvNXoJlvRl3Jl4AcrJl8AUoJl8MnrJnFnMlJnHgGbJnoDT8JnoFV8JnoGgvJnoIT8JnoQToJnoRg3JnrCZ3JnrGgrJnrHTvJnrLf8JnrOX8JnvAT3JnvFZoJnvGT8JnvJl4JnvMT8JnvMX8JnvOXrJnvPX6JnvSX3JnvSZrJn3MT8Jn3MX8Jn3RTrLTATKnLTJnLTLTMXKnLTRTQlLToGb8LTrAZ8LTrCZ8LTrDb8LTrHT8LT3PX6LT4FZoLT$CTvLT$GgrLUvHX3LVoATrLVoAgoLVoJboLVoMX3LVoRg3LV8CZ3LV8FZoLV8GTvLXrDXoLXrFbrLXvAgvLXvFlrLXvLl3LXvRn6LX4Mb8LX8GT8LYCXMnLYrMnrLZoSTvLZrAZvLZrAloLZrFToLZrJXvLZrJboLZrJl4LZrLnrLZrMT8LZrOgvLZrRnvLZrST4LZvMX8LZvSlvLZ8AgoLZ8CT3LZ8JT8LZ8LV8LZ8LZoLZ8Lg8LZ8SV8LZ8SbrLZ$HT8LZ$Mn4La6CTvLbFbMnLbRYFTLbSnFZLboJT8LbrAT9LbrGb3LbrQb8LcrJX8LcrMXrLerHTvLerJbrLerNboLgrDb8LgrGZ8LgrHTrLgrMXrLgrSU8LgvJTrLgvLl3Lg6Ll3LhrLnrLhrMT8LhvAl4LiLnQXLkoAgrLkoJT8LkoJn4LlrSU8Ll3FZoLl3HTrLl3JX8Ll3JnoLl3LToLmLeFbLnDUFbLnLVAnLnrATrLnrAZoLnrAb8LnrAlrLnrGgvLnrJU8LnrLZrLnrLhrLnrMb8LnrOXrLnrSZ8LnvAb4LnvDTrLnvDl8LnvHTrLnvHbrLnvJT8LnvJU8LnvJbrLnvLhvLnvMX8LnvMb8LnvNnoLnvSU8Ln3Al3Ln4FZoLn4GT6Ln4JgvLn4LhrLn4MT8Ln4SToMToCZrMToJX8MToLX4MToLf8MToRg3MTrEloMTvGb6MT3BTrMT3Lb6MT8AcrMT8AgrMT8GZrMT8JnoMT8LnrMT8MX3MUOUAnMXAbFnMXoAloMXoJX8MXoLf8MXoLl8MXrAb8MXrDTvMXrGT8MXrGgrMXrHTrMXrLf8MXrMU8MXrOXvMXrQb8MXvGT8MXvHTrMXvLVoMX3AX3MX3Jn3MX3LhrMX3MX3MX4AlrMX4OboMX8GTvMX8GZrMX8GgrMX8JT8MX8JX8MX8LhrMX8MT8MYDUFbMYMgDbMbGnFfMbvLX4MbvLl3Mb8Mb8Mb8ST4MgGXCnMg8ATrMg8AgoMg8CZrMg8DTrMg8DboMg8HTrMg8JgrMg8LT8MloJXoMl8AhrMl8JT8MnLgAUMnoJXrMnoLX4MnoLhrMnoMT8MnrAl4MnrDb8MnrOTvMnrOgvMnrQb8MnrSU8MnvGgrMnvHZ8Mn3MToMn4DTrMn4LTrMn4Mg8NnBXAnOTFTFnOToAToOTrGgvOTrJX8OT3JXoOT6MTrOT8GgrOT8HTpOT8MToOUoHT8OUoJT8OUoLn3OXrAgoOXrDg8OXrMT8OXvSToOX6CTvOX8CZrOX8OgrOb6HgvOb8AToOb8MT8OcvLZ8OgvAlrOgvHTvOgvJTrOgvJnrOgvLZrOgvLn4OgvMT8OgvRTrOg8AZoOg8DbvOnrOXoOnvJn4OnvLhvOnvRTrOn3GgoOn3JnvOn6JbvOn8OTrPTGYFTPbBnFnPbGnDnPgDYQTPlrAnvPlrETvPlrLnvPlrMXvPlvFX4QTMTAnQTrJU8QYCnJlQYJlQlQbGTQbQb8JnrQb8LZoQb8LnvQb8MT8Qb8Ml8Qb8ST4QloAl4QloHZvQloJX8QloMn8QnJZOlRTrAZvRTrDTrRTvJn4RTvLhvRT4Jb8RZrAZrRZ8AkrRZ8JU8RZ8LV8RZ8LnvRbJlQXRg3GboRg3MnvRg8AZ8Rg8JboRg8Jl4RnLTCbRnvFl3RnvQb8SToAl4SToCZrSToFZoSToHXrSToJU8SToJgvSToJl4SToLhrSToMX3STrAlvSTrCT9STrCgrSTrGgrSTrHXrSTrHboSTrJnoSTrNboSTvLnrST4AZoST8Ab8ST8JT8SUoJn3SU6HZ#SU6JTvSU8Db8SU8HboSU8LgrSV8JT8SZrAcrSZrAl3SZrJT8SZrJnvSZrMT8SZvLUoSZ4FZoSZ8JnoSZ8RZrScoLnrScoMT8ScoMX8ScrAT4ScrAZ8ScrLZ8ScrLkvScvDb8ScvLf8ScvNToSgrFZrShvKnrSloHUoSloLnrSlrMXoSl8HgrSmrJUoSn3BX6",
          "ATFlOn3ATLgrDYAT4MTAnAT8LTMnAYJnRTrAbGgJnrAbLV8LnAbvNTAnAeFbLg3AgOYMXoAlQbFboAnDboAfAnJgoJTBToDgAnBUJbAl3BboDUAnCTDlvLnCTFTrSnCYoQTLnDTwAbAnDUDTrSnDUHgHgrDX8LXFnDbJXAcrETvLTLnGTFTQbrGTMnGToGT3DUFbGUJlPX3GbQg8LnGboJbFnGb3GgAYGgAg8ScGgMbAXrGgvAbAnGnJTLnvGnvATFgHTDT6ATHTrDlJnHYLnMn8HZrSbJTHZ8LTFnHbFTJUoHgSeMT8HgrLjAnHgvAbAnHlFUrDlHnDgvAnHnHTFT3HnQTGnrJTAaMXvJTGbCn3JTOgrAnJXvAXMnJbMg8SnJbMnRg3Jb8LTMnJnAl3OnJnGYrQlJnJlQY3LTDlCn3LTJjLg3LTLgvFXLTMg3GTLV8HUOgLXFZLg3LXNXrMnLX8QXFnLX9AlMYLYLXPXrLZAbJU8LZDUJU8LZMXrSnLZ$AgFnLaPXrDULbFYrMnLbMn8LXLboJgJgLeFbLg3LgLZrSnLgOYAgoLhrRnJlLkCTrSnLkOnLhrLnFX%AYLnFZoJXLnHTvJbLnLloAbMTATLf8MTHgJn3MTMXrAXMT3MTFnMUITvFnMXFX%AYMXMXvFbMXrFTDbMYAcMX3MbLf8SnMb8JbFnMgMXrMTMgvAXFnMgvGgCmMnAloSnMnFnJTrOXvMXSnOX8HTMnObJT8ScObLZFl3ObMXCZoPTLgrQXPUFnoQXPU3RXJlPX3RkQXPbrJXQlPlrJbFnQUAhrDbQXGnCXvQYLnHlvQbLfLnvRTOgvJbRXJYrQlRYLnrQlRbLnrQlRlFT8JlRlFnrQXSTClCn3STHTrAnSTLZQlrSTMnGTrSToHgGbSTrGTDnSTvGXCnST3HgFbSU3HXAXSbAnJn3SbFT8LnScLfLnv",
          "AT3JgJX8AT8FZoSnAT8JgFV8AT8LhrDbAZ8JT8DbAb8GgLhrAb8SkLnvAe8MT8SnAlMYJXLVAl3GYDTvAl3LfLnvBUDTvLl3CTOn3HTrCT3DUGgrCU8MT8AbCbFTrJUoCgrDb8MTDTLV8JX8DTLnLXQlDT8LZrSnDUQb8FZ8DUST4JnvDb8ScOUoDj6GbJl4GTLfCYMlGToAXvFnGboAXvLnGgAcrJn3GgvFnSToGnLf8JnvGn#HTDToHTLnFXJlHTvATFToHTvHTDToHTvMTAgoHT3STClvHT4AlFl6HT8HTDToHUoDgJTrHUoScMX3HbRZrMXoHboJg8LTHgDb8JTrHgMToLf8HgvLnLnoHnHn3HT4Hn6MgvAnJTJU8ScvJT3AaQT8JT8HTrAnJXrRg8AnJbAloMXoJbrATFToJbvMnoSnJgDb6GgvJgDb8MXoJgSX3JU8JguATFToJlPYLnQlJlQkDnLbJlQlFYJlJl8Lf8OTJnCTFnLbJnLTHXMnJnLXGXCnJnoFfRg3JnrMYRg3Jn3HgFl3KT8Dg8LnLTRlFnPTLTvPbLbvLVoSbrCZLXMY6HT3LXNU7DlrLXNXDTATLX8DX8LnLZDb8JU8LZMnoLhrLZSToJU8LZrLaLnrLZvJn3SnLZ8LhrSnLaJnoMT8LbFlrHTvLbrFTLnrLbvATLlvLb6OTFn3LcLnJZOlLeAT6Mn4LeJT3ObrLg6LXFlrLhrJg8LnLhvDlPX4LhvLfLnvLj6JTFT3LnFbrMXoLnQluCTvLnrQXCY6LnvLfLnvLnvMgLnvLnvSeLf8MTMbrJn3MT3JgST3MT8AnATrMT8LULnrMUMToCZrMUScvLf8MXoDT8SnMX6ATFToMX8AXMT8MX8FkMT8MX8HTrDUMX8ScoSnMYJT6CTvMgAcrMXoMg8SToAfMlvAXLg3MnFl3AnvOT3AnFl3OUoATHT8OU3RnLXrOXrOXrSnObPbvFn6Og8HgrSnOg8OX8DbPTvAgoJgPU3RYLnrPXrDnJZrPb8CTGgvPlrLTDlvPlvFUJnoQUvFXrQlQeMnoAl3QlrQlrSnRTFTrJUoSTDlLiLXSTFg6HT3STJgoMn4STrFTJTrSTrLZFl3ST4FnMXoSUrDlHUoScvHTvSnSfLkvMXo",
          "AUoAcrMXoAZ8HboAg8AbOg6ATFgAg8AloMXoAl3AT8JTrAl8MX8MXoCT3SToJU8Cl8Db8MXoDT8HgrATrDboOT8MXoGTOTrATMnGT8LhrAZ8GnvFnGnQXHToGgvAcrHTvAXvLl3HbrAZoMXoHgBlFXLg3HgMnFXrSnHgrSb8JUoHn6HT8LgvITvATrJUoJUoLZrRnvJU8HT8Jb8JXvFX8QT8JXvLToJTrJYrQnGnQXJgrJnoATrJnoJU8ScvJnvMnvMXoLTCTLgrJXLTJlRTvQlLbRnJlQYvLbrMb8LnvLbvFn3RnoLdCVSTGZrLeSTvGXCnLg3MnoLn3MToLlrETvMT8SToAl3MbrDU6GTvMb8LX4LhrPlrLXGXCnSToLf8Rg3STrDb8LTrSTvLTHXMnSb3RYLnMnSgOg6ATFg",
          "HUDlGnrQXrJTrHgLnrAcJYMb8DULc8LTvFgGnCk3Mg8JbAnLX4QYvFYHnMXrRUoJnGnvFnRlvFTJlQnoSTrBXHXrLYSUJgLfoMT8Se8DTrHbDb",
          "AbDl8SToJU8An3RbAb8ST8DUSTrGnrAgoLbFU6Db8LTrMg8AaHT8Jb8ObDl8SToJU8Pb3RlvFYoJl",
        ],
        Ee =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      function Re(s) {
        return (
          s >= 40 ? (s = s + 168 - 40) : s >= 19 && (s = s + 97 - 19),
          (0, n.ZN)([225, (s >> 6) + 132, (s & 63) + 128])
        );
      }
      let Te = null;
      function Pe(s) {
        if (
          Te == null &&
          ((Te = []),
          Be.forEach((f, S) => {
            S += 4;
            for (let j = 0; j < f.length; j += S) {
              let q = "";
              for (let re = 0; re < S; re++) q += Re(Ee.indexOf(f[j + re]));
              Te.push(q);
            }
          }),
          Te.sort(),
          Y.check(s) !==
            "0xf9eddeace9c5d3da9c93cf7d3cd38f6a13ed3affb933259ae865714e8a3ae71a")
        )
          throw (
            ((Te = null), new Error("BIP39 Wordlist for ko (Korean) FAILED"))
          );
      }
      class De extends Y {
        constructor() {
          super("ko");
        }
        getWord(f) {
          return Pe(this), Te[f];
        }
        getWordIndex(f) {
          return Pe(this), Te.indexOf(f);
        }
      }
      const Je = new De();
      Y.register(Je);
      const ke =
        "AbacoAbbaglioAbbinatoAbeteAbissoAbolireAbrasivoAbrogatoAccadereAccennoAccusatoAcetoneAchilleAcidoAcquaAcreAcrilicoAcrobataAcutoAdagioAddebitoAddomeAdeguatoAderireAdipeAdottareAdulareAffabileAffettoAffissoAffrantoAforismaAfosoAfricanoAgaveAgenteAgevoleAggancioAgireAgitareAgonismoAgricoloAgrumetoAguzzoAlabardaAlatoAlbatroAlberatoAlboAlbumeAlceAlcolicoAlettoneAlfaAlgebraAlianteAlibiAlimentoAllagatoAllegroAllievoAllodolaAllusivoAlmenoAlogenoAlpacaAlpestreAltalenaAlternoAlticcioAltroveAlunnoAlveoloAlzareAmalgamaAmanitaAmarenaAmbitoAmbratoAmebaAmericaAmetistaAmicoAmmassoAmmendaAmmirareAmmonitoAmoreAmpioAmpliareAmuletoAnacardoAnagrafeAnalistaAnarchiaAnatraAncaAncellaAncoraAndareAndreaAnelloAngeloAngolareAngustoAnimaAnnegareAnnidatoAnnoAnnuncioAnonimoAnticipoAnziApaticoAperturaApodeApparireAppetitoAppoggioApprodoAppuntoAprileArabicaArachideAragostaAraldicaArancioAraturaArazzoArbitroArchivioArditoArenileArgentoArgineArgutoAriaArmoniaArneseArredatoArringaArrostoArsenicoArsoArteficeArzilloAsciuttoAscoltoAsepsiAsetticoAsfaltoAsinoAsolaAspiratoAsproAssaggioAsseAssolutoAssurdoAstaAstenutoAsticeAstrattoAtavicoAteismoAtomicoAtonoAttesaAttivareAttornoAttritoAttualeAusilioAustriaAutistaAutonomoAutunnoAvanzatoAvereAvvenireAvvisoAvvolgereAzioneAzotoAzzimoAzzurroBabeleBaccanoBacinoBacoBadessaBadilataBagnatoBaitaBalconeBaldoBalenaBallataBalzanoBambinoBandireBaraondaBarbaroBarcaBaritonoBarlumeBaroccoBasilicoBassoBatostaBattutoBauleBavaBavosaBeccoBeffaBelgioBelvaBendaBenevoleBenignoBenzinaBereBerlinaBetaBibitaBiciBidoneBifidoBigaBilanciaBimboBinocoloBiologoBipedeBipolareBirbanteBirraBiscottoBisestoBisnonnoBisonteBisturiBizzarroBlandoBlattaBollitoBonificoBordoBoscoBotanicoBottinoBozzoloBraccioBradipoBramaBrancaBravuraBretellaBrevettoBrezzaBrigliaBrillanteBrindareBroccoloBrodoBronzinaBrulloBrunoBubboneBucaBudinoBuffoneBuioBulboBuonoBurloneBurrascaBussolaBustaCadettoCaducoCalamaroCalcoloCalesseCalibroCalmoCaloriaCambusaCamerataCamiciaCamminoCamolaCampaleCanapaCandelaCaneCaninoCanottoCantinaCapaceCapelloCapitoloCapogiroCapperoCapraCapsulaCarapaceCarcassaCardoCarismaCarovanaCarrettoCartolinaCasaccioCascataCasermaCasoCassoneCastelloCasualeCatastaCatenaCatrameCautoCavilloCedibileCedrataCefaloCelebreCellulareCenaCenoneCentesimoCeramicaCercareCertoCerumeCervelloCesoiaCespoCetoChelaChiaroChiccaChiedereChimeraChinaChirurgoChitarraCiaoCiclismoCifrareCignoCilindroCiottoloCircaCirrosiCitricoCittadinoCiuffoCivettaCivileClassicoClinicaCloroCoccoCodardoCodiceCoerenteCognomeCollareColmatoColoreColposoColtivatoColzaComaCometaCommandoComodoComputerComuneConcisoCondurreConfermaCongelareConiugeConnessoConoscereConsumoContinuoConvegnoCopertoCopioneCoppiaCopricapoCorazzaCordataCoricatoCorniceCorollaCorpoCorredoCorsiaCorteseCosmicoCostanteCotturaCovatoCratereCravattaCreatoCredereCremosoCrescitaCretaCricetoCrinaleCrisiCriticoCroceCronacaCrostataCrucialeCruscaCucireCuculoCuginoCullatoCupolaCuratoreCursoreCurvoCuscinoCustodeDadoDainoDalmataDamerinoDanielaDannosoDanzareDatatoDavantiDavveroDebuttoDecennioDecisoDeclinoDecolloDecretoDedicatoDefinitoDeformeDegnoDelegareDelfinoDelirioDeltaDemenzaDenotatoDentroDepositoDerapataDerivareDerogaDescrittoDesertoDesiderioDesumereDetersivoDevotoDiametroDicembreDiedroDifesoDiffusoDigerireDigitaleDiluvioDinamicoDinnanziDipintoDiplomaDipoloDiradareDireDirottoDirupoDisagioDiscretoDisfareDisgeloDispostoDistanzaDisumanoDitoDivanoDiveltoDividereDivoratoDobloneDocenteDoganaleDogmaDolceDomatoDomenicaDominareDondoloDonoDormireDoteDottoreDovutoDozzinaDragoDruidoDubbioDubitareDucaleDunaDuomoDupliceDuraturoEbanoEccessoEccoEclissiEconomiaEderaEdicolaEdileEditoriaEducareEgemoniaEgliEgoismoEgregioElaboratoElargireEleganteElencatoElettoElevareElficoElicaElmoElsaElusoEmanatoEmblemaEmessoEmiroEmotivoEmozioneEmpiricoEmuloEndemicoEnduroEnergiaEnfasiEnotecaEntrareEnzimaEpatiteEpilogoEpisodioEpocaleEppureEquatoreErarioErbaErbosoEredeEremitaErigereErmeticoEroeErosivoErranteEsagonoEsameEsanimeEsaudireEscaEsempioEsercitoEsibitoEsigenteEsistereEsitoEsofagoEsortatoEsosoEspansoEspressoEssenzaEssoEstesoEstimareEstoniaEstrosoEsultareEtilicoEtnicoEtruscoEttoEuclideoEuropaEvasoEvidenzaEvitatoEvolutoEvvivaFabbricaFaccendaFachiroFalcoFamigliaFanaleFanfaraFangoFantasmaFareFarfallaFarinosoFarmacoFasciaFastosoFasulloFaticareFatoFavolosoFebbreFecolaFedeFegatoFelpaFeltroFemminaFendereFenomenoFermentoFerroFertileFessuraFestivoFettaFeudoFiabaFiduciaFifaFiguratoFiloFinanzaFinestraFinireFioreFiscaleFisicoFiumeFlaconeFlamencoFleboFlemmaFloridoFluenteFluoroFobicoFocacciaFocosoFoderatoFoglioFolataFolcloreFolgoreFondenteFoneticoFoniaFontanaForbitoForchettaForestaFormicaFornaioForoFortezzaForzareFosfatoFossoFracassoFranaFrassinoFratelloFreccettaFrenataFrescoFrigoFrollinoFrondeFrugaleFruttaFucilataFucsiaFuggenteFulmineFulvoFumanteFumettoFumosoFuneFunzioneFuocoFurboFurgoneFuroreFusoFutileGabbianoGaffeGalateoGallinaGaloppoGamberoGammaGaranziaGarboGarofanoGarzoneGasdottoGasolioGastricoGattoGaudioGazeboGazzellaGecoGelatinaGelsoGemelloGemmatoGeneGenitoreGennaioGenotipoGergoGhepardoGhiaccioGhisaGialloGildaGineproGiocareGioielloGiornoGioveGiratoGironeGittataGiudizioGiuratoGiustoGlobuloGlutineGnomoGobbaGolfGomitoGommoneGonfioGonnaGovernoGracileGradoGraficoGrammoGrandeGrattareGravosoGraziaGrecaGreggeGrifoneGrigioGrinzaGrottaGruppoGuadagnoGuaioGuantoGuardareGufoGuidareIbernatoIconaIdenticoIdillioIdoloIdraIdricoIdrogenoIgieneIgnaroIgnoratoIlareIllesoIllogicoIlludereImballoImbevutoImboccoImbutoImmaneImmersoImmolatoImpaccoImpetoImpiegoImportoImprontaInalareInarcareInattivoIncantoIncendioInchinoIncisivoInclusoIncontroIncrocioIncuboIndagineIndiaIndoleIneditoInfattiInfilareInflittoIngaggioIngegnoIngleseIngordoIngrossoInnescoInodoreInoltrareInondatoInsanoInsettoInsiemeInsonniaInsulinaIntasatoInteroIntonacoIntuitoInumidireInvalidoInveceInvitoIperboleIpnoticoIpotesiIppicaIrideIrlandaIronicoIrrigatoIrrorareIsolatoIsotopoIstericoIstitutoIstriceItaliaIterareLabbroLabirintoLaccaLaceratoLacrimaLacunaLaddoveLagoLampoLancettaLanternaLardosoLargaLaringeLastraLatenzaLatinoLattugaLavagnaLavoroLegaleLeggeroLemboLentezzaLenzaLeoneLepreLesivoLessatoLestoLetteraleLevaLevigatoLiberoLidoLievitoLillaLimaturaLimitareLimpidoLineareLinguaLiquidoLiraLiricaLiscaLiteLitigioLivreaLocandaLodeLogicaLombareLondraLongevoLoquaceLorenzoLotoLotteriaLuceLucidatoLumacaLuminosoLungoLupoLuppoloLusingaLussoLuttoMacabroMacchinaMaceroMacinatoMadamaMagicoMagliaMagneteMagroMaiolicaMalafedeMalgradoMalintesoMalsanoMaltoMalumoreManaManciaMandorlaMangiareManifestoMannaroManovraMansardaMantideManubrioMappaMaratonaMarcireMarettaMarmoMarsupioMascheraMassaiaMastinoMaterassoMatricolaMattoneMaturoMazurcaMeandroMeccanicoMecenateMedesimoMeditareMegaMelassaMelisMelodiaMeningeMenoMensolaMercurioMerendaMerloMeschinoMeseMessereMestoloMetalloMetodoMettereMiagolareMicaMicelioMicheleMicroboMidolloMieleMiglioreMilanoMiliteMimosaMineraleMiniMinoreMirinoMirtilloMiscelaMissivaMistoMisurareMitezzaMitigareMitraMittenteMnemonicoModelloModificaModuloMoganoMogioMoleMolossoMonasteroMoncoMondinaMonetarioMonileMonotonoMonsoneMontatoMonvisoMoraMordereMorsicatoMostroMotivatoMotosegaMottoMovenzaMovimentoMozzoMuccaMucosaMuffaMughettoMugnaioMulattoMulinelloMultiploMummiaMuntoMuovereMuraleMusaMuscoloMusicaMutevoleMutoNababboNaftaNanometroNarcisoNariceNarratoNascereNastrareNaturaleNauticaNaviglioNebulosaNecrosiNegativoNegozioNemmenoNeofitaNerettoNervoNessunoNettunoNeutraleNeveNevroticoNicchiaNinfaNitidoNobileNocivoNodoNomeNominaNordicoNormaleNorvegeseNostranoNotareNotiziaNotturnoNovellaNucleoNullaNumeroNuovoNutrireNuvolaNuzialeOasiObbedireObbligoObeliscoOblioOboloObsoletoOccasioneOcchioOccidenteOccorrereOccultareOcraOculatoOdiernoOdorareOffertaOffrireOffuscatoOggettoOggiOgnunoOlandeseOlfattoOliatoOlivaOlogrammaOltreOmaggioOmbelicoOmbraOmegaOmissioneOndosoOnereOniceOnnivoroOnorevoleOntaOperatoOpinioneOppostoOracoloOrafoOrdineOrecchinoOreficeOrfanoOrganicoOrigineOrizzonteOrmaOrmeggioOrnativoOrologioOrrendoOrribileOrtensiaOrticaOrzataOrzoOsareOscurareOsmosiOspedaleOspiteOssaOssidareOstacoloOsteOtiteOtreOttagonoOttimoOttobreOvaleOvestOvinoOviparoOvocitoOvunqueOvviareOzioPacchettoPacePacificoPadellaPadronePaesePagaPaginaPalazzinaPalesarePallidoPaloPaludePandoroPannelloPaoloPaonazzoPapricaParabolaParcellaParerePargoloPariParlatoParolaPartireParvenzaParzialePassivoPasticcaPataccaPatologiaPattumePavonePeccatoPedalarePedonalePeggioPelosoPenarePendicePenisolaPennutoPenombraPensarePentolaPepePepitaPerbenePercorsoPerdonatoPerforarePergamenaPeriodoPermessoPernoPerplessoPersuasoPertugioPervasoPesatorePesistaPesoPestiferoPetaloPettinePetulantePezzoPiacerePiantaPiattinoPiccinoPicozzaPiegaPietraPifferoPigiamaPigolioPigroPilaPiliferoPillolaPilotaPimpantePinetaPinnaPinoloPioggiaPiomboPiramidePireticoPiritePirolisiPitonePizzicoPlaceboPlanarePlasmaPlatanoPlenarioPochezzaPoderosoPodismoPoesiaPoggiarePolentaPoligonoPollicePolmonitePolpettaPolsoPoltronaPolverePomicePomodoroPontePopolosoPorfidoPorosoPorporaPorrePortataPosaPositivoPossessoPostulatoPotassioPoterePranzoPrassiPraticaPreclusoPredicaPrefissoPregiatoPrelievoPremerePrenotarePreparatoPresenzaPretestoPrevalsoPrimaPrincipePrivatoProblemaProcuraProdurreProfumoProgettoProlungaPromessaPronomePropostaProrogaProtesoProvaPrudentePrugnaPruritoPsichePubblicoPudicaPugilatoPugnoPulcePulitoPulsantePuntarePupazzoPupillaPuroQuadroQualcosaQuasiQuerelaQuotaRaccoltoRaddoppioRadicaleRadunatoRafficaRagazzoRagioneRagnoRamarroRamingoRamoRandagioRantolareRapatoRapinaRappresoRasaturaRaschiatoRasenteRassegnaRastrelloRataRavvedutoRealeRecepireRecintoReclutaReconditoRecuperoRedditoRedimereRegalatoRegistroRegolaRegressoRelazioneRemareRemotoRennaReplicaReprimereReputareResaResidenteResponsoRestauroReteRetinaRetoricaRettificaRevocatoRiassuntoRibadireRibelleRibrezzoRicaricaRiccoRicevereRiciclatoRicordoRicredutoRidicoloRidurreRifasareRiflessoRiformaRifugioRigareRigettatoRighelloRilassatoRilevatoRimanereRimbalzoRimedioRimorchioRinascitaRincaroRinforzoRinnovoRinomatoRinsavitoRintoccoRinunciaRinvenireRiparatoRipetutoRipienoRiportareRipresaRipulireRisataRischioRiservaRisibileRisoRispettoRistoroRisultatoRisvoltoRitardoRitegnoRitmicoRitrovoRiunioneRivaRiversoRivincitaRivoltoRizomaRobaRoboticoRobustoRocciaRocoRodaggioRodereRoditoreRogitoRollioRomanticoRompereRonzioRosolareRospoRotanteRotondoRotulaRovescioRubizzoRubricaRugaRullinoRumineRumorosoRuoloRupeRussareRusticoSabatoSabbiareSabotatoSagomaSalassoSaldaturaSalgemmaSalivareSalmoneSaloneSaltareSalutoSalvoSapereSapidoSaporitoSaracenoSarcasmoSartoSassosoSatelliteSatiraSatolloSaturnoSavanaSavioSaziatoSbadiglioSbalzoSbancatoSbarraSbattereSbavareSbendareSbirciareSbloccatoSbocciatoSbrinareSbruffoneSbuffareScabrosoScadenzaScalaScambiareScandaloScapolaScarsoScatenareScavatoSceltoScenicoScettroSchedaSchienaSciarpaScienzaScindereScippoSciroppoScivoloSclerareScodellaScolpitoScompartoSconfortoScoprireScortaScossoneScozzeseScribaScrollareScrutinioScuderiaScultoreScuolaScuroScusareSdebitareSdoganareSeccaturaSecondoSedanoSeggiolaSegnalatoSegregatoSeguitoSelciatoSelettivoSellaSelvaggioSemaforoSembrareSemeSeminatoSempreSensoSentireSepoltoSequenzaSerataSerbatoSerenoSerioSerpenteSerraglioServireSestinaSetolaSettimanaSfaceloSfaldareSfamatoSfarzosoSfaticatoSferaSfidaSfilatoSfingeSfocatoSfoderareSfogoSfoltireSforzatoSfrattoSfruttatoSfuggitoSfumareSfusoSgabelloSgarbatoSgonfiareSgorbioSgrassatoSguardoSibiloSiccomeSierraSiglaSignoreSilenzioSillabaSimboloSimpaticoSimulatoSinfoniaSingoloSinistroSinoSintesiSinusoideSiparioSismaSistoleSituatoSlittaSlogaturaSlovenoSmarritoSmemoratoSmentitoSmeraldoSmilzoSmontareSmottatoSmussatoSnellireSnervatoSnodoSobbalzoSobrioSoccorsoSocialeSodaleSoffittoSognoSoldatoSolenneSolidoSollazzoSoloSolubileSolventeSomaticoSommaSondaSonettoSonniferoSopireSoppesoSopraSorgereSorpassoSorrisoSorsoSorteggioSorvolatoSospiroSostaSottileSpadaSpallaSpargereSpatolaSpaventoSpazzolaSpecieSpedireSpegnereSpelaturaSperanzaSpessoreSpettraleSpezzatoSpiaSpigolosoSpillatoSpinosoSpiraleSplendidoSportivoSposoSprangaSprecareSpronatoSpruzzoSpuntinoSquilloSradicareSrotolatoStabileStaccoStaffaStagnareStampatoStantioStarnutoStaseraStatutoSteloSteppaSterzoStilettoStimaStirpeStivaleStizzosoStonatoStoricoStrappoStregatoStriduloStrozzareStruttoStuccareStufoStupendoSubentroSuccosoSudoreSuggeritoSugoSultanoSuonareSuperboSupportoSurgelatoSurrogatoSussurroSuturaSvagareSvedeseSveglioSvelareSvenutoSveziaSviluppoSvistaSvizzeraSvoltaSvuotareTabaccoTabulatoTacciareTaciturnoTaleTalismanoTamponeTanninoTaraTardivoTargatoTariffaTarpareTartarugaTastoTatticoTavernaTavolataTazzaTecaTecnicoTelefonoTemerarioTempoTemutoTendoneTeneroTensioneTentacoloTeoremaTermeTerrazzoTerzettoTesiTesseratoTestatoTetroTettoiaTifareTigellaTimbroTintoTipicoTipografoTiraggioTiroTitanioTitoloTitubanteTizioTizzoneToccareTollerareToltoTombolaTomoTonfoTonsillaTopazioTopologiaToppaTorbaTornareTorroneTortoraToscanoTossireTostaturaTotanoTraboccoTracheaTrafilaTragediaTralcioTramontoTransitoTrapanoTrarreTraslocoTrattatoTraveTrecciaTremolioTrespoloTributoTrichecoTrifoglioTrilloTrinceaTrioTristezzaTrituratoTrivellaTrombaTronoTroppoTrottolaTrovareTruccatoTubaturaTuffatoTulipanoTumultoTunisiaTurbareTurchinoTutaTutelaUbicatoUccelloUccisoreUdireUditivoUffaUfficioUgualeUlisseUltimatoUmanoUmileUmorismoUncinettoUngereUnghereseUnicornoUnificatoUnisonoUnitarioUnteUovoUpupaUraganoUrgenzaUrloUsanzaUsatoUscitoUsignoloUsuraioUtensileUtilizzoUtopiaVacanteVaccinatoVagabondoVagliatoValangaValgoValicoVallettaValorosoValutareValvolaVampataVangareVanitosoVanoVantaggioVanveraVaporeVaranoVarcatoVarianteVascaVedettaVedovaVedutoVegetaleVeicoloVelcroVelinaVellutoVeloceVenatoVendemmiaVentoVeraceVerbaleVergognaVerificaVeroVerrucaVerticaleVescicaVessilloVestaleVeteranoVetrinaVetustoViandanteVibranteVicendaVichingoVicinanzaVidimareVigiliaVignetoVigoreVileVillanoViminiVincitoreViolaViperaVirgolaVirologoVirulentoViscosoVisioneVispoVissutoVisuraVitaVitelloVittimaVivandaVividoViziareVoceVogaVolatileVolereVolpeVoragineVulcanoZampognaZannaZappatoZatteraZavorraZefiroZelanteZeloZenzeroZerbinoZibettoZincoZirconeZittoZollaZoticoZuccheroZufoloZuluZuppa";
      let Le = null;
      function ye(s) {
        if (
          Le == null &&
          ((Le = ke
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .substring(1)
            .split(" ")),
          Y.check(s) !==
            "0x5c1362d88fd4cf614a96f3234941d29f7d37c08c5292fde03bf62c2db6ff7620")
        )
          throw (
            ((Le = null), new Error("BIP39 Wordlist for it (Italian) FAILED"))
          );
      }
      class Oe extends Y {
        constructor() {
          super("it");
        }
        getWord(f) {
          return ye(this), Le[f];
        }
        getWordIndex(f) {
          return ye(this), Le.indexOf(f);
        }
      }
      const we = new Oe();
      Y.register(we);
      const Fe =
          "}aE#4A=Yv&co#4N#6G=cJ&SM#66|/Z#4t&kn~46#4K~4q%b9=IR#7l,mB#7W_X2*dl}Uo~7s}Uf&Iw#9c&cw~6O&H6&wx&IG%v5=IQ~8a&Pv#47$PR&50%Ko&QM&3l#5f,D9#4L|/H&tQ;v0~6n]nN<di,AM=W5%QO&ka&ua,hM^tm=zV=JA=wR&+X]7P&NB#4J#5L|/b[dA}tJ<Do&6m&u2[U1&Kb.HM&mC=w0&MW<rY,Hq#6M}QG,13&wP}Jp]Ow%ue&Kg<HP<D9~4k~9T&I2_c6$9T#9/[C5~7O~4a=cs&O7=KK=An&l9$6U$8A&uD&QI|/Y&bg}Ux&F2#6b}E2&JN&kW&kp=U/&bb=Xl<Cj}k+~5J#6L&5z&9i}b4&Fo,ho(X0_g3~4O$Fz&QE<HN=Ww]6/%GF-Vw=tj&/D&PN#9g=YO}cL&Of&PI~5I&Ip=vU=IW#9G;0o-wU}ss&QR<BT&R9=tk$PY_dh&Pq-yh]7T,nj.Xu=EP&76=cI&Fs*Xg}z7$Gb&+I=DF,AF=cA}rL#7j=Dz&3y<Aa$52=PQ}b0(iY$Fa}oL&xV#6U=ec=WZ,xh%RY<dp#9N&Fl&44=WH*A7=sh&TB&8P=07;u+&PK}uh}J5#72)V/=xC,AB$k0&f6;1E|+5=1B,3v]6n&wR%b+&xx]7f=Ol}fl;+D^wG]7E;nB;uh^Ir&l5=JL,nS=cf=g5;u6|/Q$Gc=MH%Hg#5d%M6^86=U+$Gz,l/,ir^5y&Ba&/F-IY&FI&be%IZ#77&PW_Nu$kE(Yf&NX]7Z,Jy&FJ(Xo&Nz#/d=y7&MX<Ag}Z+;nE]Dt(iG#4D=13&Pj~4c%v8&Zo%OL&/X#4W<HR&ie~6J_1O(Y2=y5=Ad*cv_eB#6k&PX:BU#7A;uk&Ft&Fx_dD=U2;vB=U5=4F}+O&GN.HH:9s=b0%NV(jO&IH=JT}Z9=VZ<Af,Kx^4m&uJ%c6,6r;9m#+L}cf%Kh&F3~4H=vP}bu,Hz|++,1w]nv}k6;uu$jw*Kl*WX&uM[x7&Fr[m7$NO&QN]hu=JN}nR^8g#/h(ps|KC;vd}xz=V0}p6&FD$G1#7K<bG_4p~8g&cf;u4=tl}+k%5/}fz;uw<cA=u1}gU}VM=LJ=eX&+L&Pr#4U}p2:nC,2K]7H:jF&9x}uX#9O=MB<fz~8X~5m&4D&kN&u5%E/(h7(ZF&VG<de(qM|/e-Wt=3x(a+,/R]f/&ND$Ro&nU}0g=KA%kH&NK$Ke<dS}cB&IX~5g$TN]6m=Uv,Is&Py=Ef%Kz#+/%bi&+A<F4$OG&4C&FL#9V<Zk=2I_eE&6c]nw&kq$HG}y+&A8$P3}OH=XP]70%IS(AJ_gH%GZ&tY&AZ=vb~6y&/r=VI=Wv<Zi=fl=xf&eL}c8}OL=MJ=g8$F7=YT}9u=0+^xC}JH&nL^N0~4T]K2,Cy%OC#6s;vG(AC^xe^cG&MF}Br#9P;wD-7h$O/&xA}Fn^PC]6i]7G&8V$Qs;vl(TB~73~4l<mW&6V=2y&uY&+3)aP}XF;LP&kx$wU=t7;uy<FN&lz)7E=Oo*Y+;wI}9q}le;J6&Ri&4t&Qr#8B=cb&vG=J5|Ql(h5<Yy~4+}QD,Lx=wn%K/&RK=dO&Pw,Q9=co%4u;9u}g0@6a^4I%b0=zo|/c&tX=dQ=OS#+b=yz_AB&wB&Pm=W9$HP_gR=62=AO=ti=hI,oA&jr&dH=tm&b6$P2(x8=zi;nG~7F;05]0n[Ix&3m}rg=Xp=cd&uz]7t;97=cN;vV<jf&FF&F1=6Q&Ik*Kk&P4,2z=fQ]7D&3u,H0=d/}Uw<ZN<7R}Kv;0f$H7,MD]7n$F0#88~9Z%da=by;+T#/u=VF&fO&kr^kf<AB]sU,I5$Ng&Pz;0i&QD&vM=Yl:BM;nJ_xJ]U7&Kf&30,3f|Z9*dC)je_jA&Q4&Kp$NH(Yz#6S&Id%Ib=KX,AD=KV%dP}tW&Pk^+E_Ni=cq,3R}VZ(Si=b+}rv;0j}rZ]uA,/w(Sx&Jv$w9&4d&wE,NJ$Gy=J/]Ls#7k<ZQ<Y/&uj]Ov$PM;v3,2F&+u:up=On&3e,Jv;90=J+&Qm]6q}bK#+d~8Y(h2]hA;99&AS=I/}qB&dQ}yJ-VM}Vl&ui,iB&G3|Dc]7d=eQ%dX%JC_1L~4d^NP;vJ&/1)ZI#7N]9X[bQ&PL=0L(UZ,Lm&kc&IR}n7(iR<AQ<dg=33=vN}ft}au]7I,Ba=x9=dR~6R&Tq=Xi,3d$Nr&Bc}DI&ku&vf]Dn,/F&iD,Ll&Nw=0y&I7=Ls=/A&tU=Qe}Ua&uk&+F=g4=gh=Vj#+1&Qn}Uy*44#5F,Pc&Rz*Xn=oh=5W;0n_Nf(iE<Y7=vr=Zu]oz#5Z%mI=kN=Bv_Jp(T2;vt_Ml<FS&uI=L/&6P]64$M7}86<bo%QX(SI%IY&VK=Al&Ux;vv;ut*E/%uh<ZE|O3,M2(yc]yu=Wk&tp:Ex}hr,Cl&WE)+Z=8U}I2_4Q,hA_si=iw=OM=tM=yZ%Ia=U7;wT}b+;uo=Za}yS!5x}HD}fb#5O_dA;Nv%uB(yB;01(Sf}Fk;v7}Pt#8v<mZ#7L,/r&Pl~4w&f5=Ph$Fw_LF&8m,bL=yJ&BH}p/*Jn}tU~5Q;wB(h6]Df]8p^+B;E4&Wc=d+;Ea&bw$8C&FN,DM=Yf}mP~5w=fT#6V=mC=Fi=AV}jB&AN}lW}aH#/D)dZ;hl;vE}/7,CJ;31&w8,hj%u9_Js=jJ&4M~8k=TN&eC}nL&uc-wi&lX}dj=Mv=e2#6u=cr$uq$6G]8W}Jb:nm=Yg<b3(UA;vX&6n&xF=KT,jC,De&R8&oY=Zv&oB]7/=Z2&Oa}bf,hh(4h^tZ&72&Nx;D2&xL~5h~40)ZG)h+=OJ&RA]Bv$yB=Oq=df,AQ%Jn}OJ;11,3z&Tl&tj;v+^Hv,Dh(id=s+]7N&N3)9Q~8f,S4=uW=w4&uX,LX&3d]CJ&yp&8x<b2_do&lP=y/<cy_dG=Oi=7R(VH(lt_1T,Iq_AA;12^6T%k6#8K[B1{oO<AU[Bt;1b$9S&Ps<8T=St{bY,jB(Zp&63&Uv$9V,PM]6v&Af}zW[bW_oq}sm}nB&Kq&gC&ff_eq_2m&5F&TI}rf}Gf;Zr_z9;ER&jk}iz_sn<BN~+n&vo=Vi%97|ZR=Wc,WE&6t]6z%85(ly#84=KY)6m_5/=aX,N3}Tm&he&6K]tR_B2-I3;u/&hU&lH<AP=iB&IA=XL;/5&Nh=wv<BH#79=vS=zl<AA=0X_RG}Bw&9p$NW,AX&kP_Lp&/Z(Tc]Mu}hs#6I}5B&cI<bq&H9#6m=K9}vH(Y1(Y0#4B&w6,/9&gG<bE,/O=zb}I4_l8<B/;wL%Qo<HO[Mq=XX}0v&BP&F4(mG}0i}nm,EC=9u{I3,xG&/9=JY*DK&hR)BX=EI=cx=b/{6k}yX%A+&wa}Xb=la;wi^lL;0t}jo&Qb=xg=XB}iO<qo{bR=NV&8f=a0&Jy;0v=uK)HK;vN#6h&jB(h/%ud&NI%wY.X7=Pt}Cu-uL&Gs_hl%mH,tm]78=Lb^Q0#7Y=1u<Bt&+Q=Co_RH,w3;1e}ux<aU;ui}U3&Q5%bt]63&UQ|0l&uL}O7&3o,AV&dm|Nj(Xt*5+(Uu&Hh(p7(UF=VR=Bp^Jl&Hd[ix)9/=Iq]C8<67]66}mB%6f}bb}JI]8T$HA}db=YM&pa=2J}tS&Y0=PS&y4=cX$6E,hX,XP&nR;04,FQ&l0&Vm_Dv#5Y~8Z=Bi%MA]6x=JO:+p,Az&9q,Hj~6/}SD=K1:EJ}nA;Qo#/E]9R,Ie&6X%W3]61&v4=xX_MC=0q;06(Xq=fs}IG}Dv=0l}o7$iZ;9v&LH&DP-7a&OY,SZ,Kz,Cv&dh=fx|Nh,F/~7q=XF&w+;9n&Gw;0h}Z7<7O&JK(S7&LS<AD<ac=wo<Dt&zw%4B=4v#8P;9o~6p*vV=Tm,Or&I6=1q}nY=P0=gq&Bl&Uu,Ch%yb}UY=zh}dh}rl(T4_xk(YA#8R*xH,IN}Jn]7V}C4&Ty}j3]7p=cL=3h&wW%Qv<Z3=f0&RI&+S(ic_zq}oN&/Y=z1;Td=LW=0e=OI(Vc,+b^ju(UL;0r:Za%8v=Rp=zw&58&73&wK}qX]6y&8E)a2}WR=wP^ur&nQ<cH}Re=Aq&wk}Q0&+q=PP,Gc|/d^k5,Fw]8Y}Pg]p3=ju=ed}r5_yf&Cs]7z$/G<Cm&Jp&54_1G_gP_Ll}JZ;0u]k8_7k(Sg]65{9i=LN&Sx&WK,iW&fD&Lk{9a}Em-9c#8N&io=sy]8d&nT&IK(lx#7/$lW(Td<s8~49,3o<7Y=MW(T+_Jr&Wd,iL}Ct=xh&5V;v4&8n%Kx=iF&l2_0B{B+,If(J0,Lv;u8=Kx-vB=HC&vS=Z6&fU&vE^xK;3D=4h=MR#45:Jw;0d}iw=LU}I5=I0]gB*im,K9}GU,1k_4U&Tt=Vs(iX&lU(TF#7y,ZO}oA&m5#5P}PN}Uz=hM<B1&FB<aG,e6~7T<tP(UQ_ZT=wu&F8)aQ]iN,1r_Lo&/g:CD}84{J1_Ki&Na&3n$jz&FE=dc;uv;va}in}ll=fv(h1&3h}fp=Cy}BM(+E~8m}lo%v7=hC(T6$cj=BQ=Bw(DR,2j=Ks,NS|F+;00=fU=70}Mb(YU;+G&m7&hr=Sk%Co]t+(X5_Jw}0r}gC(AS-IP&QK<Z2#8Q$WC]WX}T2&pG_Ka,HC=R4&/N;Z+;ch(C7,D4$3p_Mk&B2$8D=n9%Ky#5z(CT&QJ#7B]DC]gW}nf~5M;Iw#80}Tc_1F#4Z-aC}Hl=ph=fz,/3=aW}JM}nn;DG;vm}wn,4P}T3;wx&RG$u+}zK=0b;+J_Ek{re<aZ=AS}yY#5D]7q,Cp}xN=VP*2C}GZ}aG~+m_Cs=OY#6r]6g<GS}LC(UB=3A=Bo}Jy<c4}Is;1P<AG}Op<Z1}ld}nS=1Z,yM&95&98=CJ(4t:2L$Hk=Zo}Vc;+I}np&N1}9y=iv}CO*7p=jL)px]tb^zh&GS&Vl%v/;vR=14=zJ&49|/f]hF}WG;03=8P}o/&Gg&rp;DB,Kv}Ji&Pb;aA^ll(4j%yt}+K$Ht#4y&hY]7Y<F1,eN}bG(Uh%6Z]t5%G7;+F_RE;it}tL=LS&Da=Xx(S+(4f=8G=yI}cJ}WP=37=jS}pX}hd)fp<A8=Jt~+o$HJ=M6}iX=g9}CS=dv=Cj(mP%Kd,xq|+9&LD(4/=Xm&QP=Lc}LX&fL;+K=Op(lu=Qs.qC:+e&L+=Jj#8w;SL]7S(b+#4I=c1&nG_Lf&uH;+R)ZV<bV%B/,TE&0H&Jq&Ah%OF&Ss(p2,Wv&I3=Wl}Vq;1L&lJ#9b_1H=8r=b8=JH(SZ=hD=J2#7U,/U#/X~6P,FU<eL=jx,mG=hG=CE&PU=Se(qX&LY=X6=y4&tk&QQ&tf=4g&xI}W+&mZ=Dc#7w}Lg;DA;wQ_Kb(cJ=hR%yX&Yb,hw{bX_4X;EP;1W_2M}Uc=b5(YF,CM&Tp^OJ{DD]6s=vF=Yo~8q}XH}Fu%P5(SJ=Qt;MO]s8<F3&B3&8T(Ul-BS*dw&dR<87}/8]62$PZ]Lx<Au}9Q]7c=ja=KR,Go,Us&v6(qk}pG&G2=ev^GM%w4&H4]7F&dv]J6}Ew:9w=sj-ZL}Ym$+h(Ut(Um~4n=Xs(U7%eE=Qc_JR<CA#6t<Fv|/I,IS,EG<F2(Xy$/n<Fa(h9}+9_2o&N4#7X<Zq|+f_Dp=dt&na,Ca=NJ)jY=8C=YG=s6&Q+<DO}D3=xB&R1(lw;Qn<bF(Cu|/B}HV=SS&n7,10&u0]Dm%A6^4Q=WR(TD=Xo<GH,Rj(l8)bP&n/=LM&CF,F5&ml=PJ;0k=LG=tq,Rh,D6@4i=1p&+9=YC%er_Mh;nI;0q=Fw]80=xq=FM$Gv;v6&nc;wK%H2&Kj;vs,AA=YP,66}bI(qR~5U=6q~4b$Ni=K5.X3$So&Iu(p+]8G=Cf=RY(TS_O3(iH&57=fE=Dg_Do#9z#7H;FK{qd_2k%JR}en&gh_z8;Rx}9p<cN_Ne,DO;LN_7o~/p=NF=5Y}gN<ce<C1,QE]Wv=3u<BC}GK]yq}DY&u/_hj=II(pz&rC,jV&+Z}ut=NQ;Cg-SR_ZS,+o=u/;Oy_RK_QF(Fx&xP}Wr&TA,Uh&g1=yr{ax[VF$Pg(YB;Ox=Vy;+W(Sp}XV%dd&33(l/]l4#4Y}OE=6c=bw(A7&9t%wd&N/&mo,JH&Qe)fm=Ao}fu=tH",
        M =
          "FAZDC6BALcLZCA+GBARCW8wNCcDDZ8LVFBOqqDUiou+M42TFAyERXFb7EjhP+vmBFpFrUpfDV2F7eB+eCltCHJFWLFCED+pWTojEIHFXc3aFn4F68zqjEuKidS1QBVPDEhE7NA4mhMF7oThD49ot3FgtzHFCK0acW1x8DH1EmLoIlrWFBLE+y5+NA3Cx65wJHTaEZVaK1mWAmPGxgYCdxwOjTDIt/faOEhTl1vqNsKtJCOhJWuio2g07KLZEQsFBUpNtwEByBgxFslFheFbiEPvi61msDvApxCzB6rBCzox7joYA5UdDc+Cb4FSgIabpXFAj3bjkmFAxCZE+mD/SFf/0ELecYCt3nLoxC6WEZf2tKDB4oZvrEmqFkKk7BwILA7gtYBpsTq//D4jD0F0wEB9pyQ1BD5Ba0oYHDI+sbDFhvrHXdDHfgFEIJLi5r8qercNFBgFLC4bo5ERJtamWBDFy73KCEb6M8VpmEt330ygCTK58EIIFkYgF84gtGA9Uyh3m68iVrFbWFbcbqiCYHZ9J1jeRPbL8yswhMiDbhEhdNoSwFbZrLT740ABEqgCkO8J1BLd1VhKKR4sD1yUo0z+FF59Mvg71CFbyEhbHSFBKEIKyoQNgQppq9T0KAqePu0ZFGrXOHdKJqkoTFhYvpDNyuuznrN84thJbsCoO6Cu6Xlvntvy0QYuAExQEYtTUBf3CoCqwgGFZ4u1HJFzDVwEy3cjcpV4QvsPaBC3rCGyCF23o4K3pp2gberGgFEJEHo4nHICtyKH2ZqyxhN05KBBJIQlKh/Oujv/DH32VrlqFdIFC7Fz9Ct4kaqFME0UETLprnN9kfy+kFmtQBB0+5CFu0N9Ij8l/VvJDh2oq3hT6EzjTHKFN7ZjZwoTsAZ4Exsko6Fpa6WC+sduz8jyrLpegTv2h1EBeYpLpm2czQW0KoCcS0bCVXCmuWJDBjN1nQNLdF58SFJ0h7i3pC3oEOKy/FjBklL70XvBEEIWp2yZ04xObzAWDDJG7f+DbqBEA7LyiR95j7MDVdDViz2RE5vWlBMv5e4+VfhP3aXNPhvLSynb9O2x4uFBV+3jqu6d5pCG28/sETByvmu/+IJ0L3wb4rj9DNOLBF6XPIODr4L19U9RRofAG6Nxydi8Bki8BhGJbBAJKzbJxkZSlF9Q2Cu8oKqggB9hBArwLLqEBWEtFowy8XK8bEyw9snT+BeyFk1ZCSrdmgfEwFePTgCjELBEnIbjaDDPJm36rG9pztcEzT8dGk23SBhXBB1H4z+OWze0ooFzz8pDBYFvp9j9tvFByf9y4EFdVnz026CGR5qMr7fxMHN8UUdlyJAzlTBDRC28k+L4FB8078ljyD91tUj1ocnTs8vdEf7znbzm+GIjEZnoZE5rnLL700Xc7yHfz05nWxy03vBB9YGHYOWxgMQGBCR24CVYNE1hpfKxN0zKnfJDmmMgMmBWqNbjfSyFCBWSCGCgR8yFXiHyEj+VtD1FB3FpC1zI0kFbzifiKTLm9yq5zFmur+q8FHqjoOBWsBPiDbnCC2ErunV6cJ6TygXFYHYp7MKN9RUlSIS8/xBAGYLzeqUnBF4QbsTuUkUqGs6CaiDWKWjQK9EJkjpkTmNCPYXL",
        t = { zh_cn: null, zh_tw: null },
        u = {
          zh_cn:
            "0x17bcc4d8547e5a7135e365d1ab443aaae95e76d8230c2782c67305d4f21497a1",
          zh_tw:
            "0x51e720e90c7b87bec1d70eb6e74a21a449bd3ec9c020b01d3a40ed991b60ce5d",
        },
        h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        P = "~!@#$%^&*_-=[]{}|;:,.()<>?";
      function K(s) {
        if (t[s.locale] !== null) return;
        t[s.locale] = [];
        let f = 0;
        for (let S = 0; S < 2048; S++) {
          const j = P.indexOf(Fe[S * 3]),
            q = [
              228 + (j >> 2),
              128 + h.indexOf(Fe[S * 3 + 1]),
              128 + h.indexOf(Fe[S * 3 + 2]),
            ];
          if (s.locale === "zh_tw") {
            const re = j % 4;
            for (let le = re; le < 3; le++)
              q[le] = h.indexOf(M[f++]) + (le == 0 ? 228 : 128);
          }
          t[s.locale].push((0, n.ZN)(q));
        }
        if (Y.check(s) !== u[s.locale])
          throw (
            ((t[s.locale] = null),
            new Error("BIP39 Wordlist for " + s.locale + " (Chinese) FAILED"))
          );
      }
      class a extends Y {
        constructor(f) {
          super("zh_" + f);
        }
        getWord(f) {
          return K(this), t[this.locale][f];
        }
        getWordIndex(f) {
          return K(this), t[this.locale].indexOf(f);
        }
        split(f) {
          return (f = f.replace(/(?:\u3000| )+/g, "")), f.split("");
        }
      }
      const e = new a("cn");
      Y.register(e), Y.register(e, "zh");
      const r = new a("tw");
      Y.register(r);
      const o = {
        cz: V,
        en: F,
        es: E,
        fr: i,
        it: we,
        ja: Se,
        ko: Je,
        zh: e,
        zh_cn: e,
        zh_tw: r,
      };
    },
    8826: function (Ae) {
      "use strict";
      (function (W) {
        function k(i) {
          return parseInt(i) === i;
        }
        function T(i) {
          if (!k(i.length)) return !1;
          for (var b = 0; b < i.length; b++)
            if (!k(i[b]) || i[b] < 0 || i[b] > 255) return !1;
          return !0;
        }
        function v(i, b) {
          if (i.buffer && ArrayBuffer.isView(i) && i.name === "Uint8Array")
            return (
              b &&
                (i.slice
                  ? (i = i.slice())
                  : (i = Array.prototype.slice.call(i))),
              i
            );
          if (Array.isArray(i)) {
            if (!T(i)) throw new Error("Array contains invalid value: " + i);
            return new Uint8Array(i);
          }
          if (k(i.length) && T(i)) return new Uint8Array(i);
          throw new Error("unsupported array-like object");
        }
        function U(i) {
          return new Uint8Array(i);
        }
        function z(i, b, I, J, A) {
          (J != null || A != null) &&
            (i.slice
              ? (i = i.slice(J, A))
              : (i = Array.prototype.slice.call(i, J, A))),
            b.set(i, I);
        }
        var G = (function () {
            function i(I) {
              var J = [],
                A = 0;
              for (I = encodeURI(I); A < I.length; ) {
                var $ = I.charCodeAt(A++);
                $ === 37
                  ? (J.push(parseInt(I.substr(A, 2), 16)), (A += 2))
                  : J.push($);
              }
              return v(J);
            }
            function b(I) {
              for (var J = [], A = 0; A < I.length; ) {
                var $ = I[A];
                $ < 128
                  ? (J.push(String.fromCharCode($)), A++)
                  : $ > 191 && $ < 224
                  ? (J.push(
                      String.fromCharCode((($ & 31) << 6) | (I[A + 1] & 63))
                    ),
                    (A += 2))
                  : (J.push(
                      String.fromCharCode(
                        (($ & 15) << 12) |
                          ((I[A + 1] & 63) << 6) |
                          (I[A + 2] & 63)
                      )
                    ),
                    (A += 3));
              }
              return J.join("");
            }
            return { toBytes: i, fromBytes: b };
          })(),
          Q = (function () {
            function i(J) {
              for (var A = [], $ = 0; $ < J.length; $ += 2)
                A.push(parseInt(J.substr($, 2), 16));
              return A;
            }
            var b = "0123456789abcdef";
            function I(J) {
              for (var A = [], $ = 0; $ < J.length; $++) {
                var xe = J[$];
                A.push(b[(xe & 240) >> 4] + b[xe & 15]);
              }
              return A.join("");
            }
            return { toBytes: i, fromBytes: I };
          })(),
          Y = { 16: 10, 24: 12, 32: 14 },
          m = [
            1,
            2,
            4,
            8,
            16,
            32,
            64,
            128,
            27,
            54,
            108,
            216,
            171,
            77,
            154,
            47,
            94,
            188,
            99,
            198,
            151,
            53,
            106,
            212,
            179,
            125,
            250,
            239,
            197,
            145,
          ],
          ae = [
            99,
            124,
            119,
            123,
            242,
            107,
            111,
            197,
            48,
            1,
            103,
            43,
            254,
            215,
            171,
            118,
            202,
            130,
            201,
            125,
            250,
            89,
            71,
            240,
            173,
            212,
            162,
            175,
            156,
            164,
            114,
            192,
            183,
            253,
            147,
            38,
            54,
            63,
            247,
            204,
            52,
            165,
            229,
            241,
            113,
            216,
            49,
            21,
            4,
            199,
            35,
            195,
            24,
            150,
            5,
            154,
            7,
            18,
            128,
            226,
            235,
            39,
            178,
            117,
            9,
            131,
            44,
            26,
            27,
            110,
            90,
            160,
            82,
            59,
            214,
            179,
            41,
            227,
            47,
            132,
            83,
            209,
            0,
            237,
            32,
            252,
            177,
            91,
            106,
            203,
            190,
            57,
            74,
            76,
            88,
            207,
            208,
            239,
            170,
            251,
            67,
            77,
            51,
            133,
            69,
            249,
            2,
            127,
            80,
            60,
            159,
            168,
            81,
            163,
            64,
            143,
            146,
            157,
            56,
            245,
            188,
            182,
            218,
            33,
            16,
            255,
            243,
            210,
            205,
            12,
            19,
            236,
            95,
            151,
            68,
            23,
            196,
            167,
            126,
            61,
            100,
            93,
            25,
            115,
            96,
            129,
            79,
            220,
            34,
            42,
            144,
            136,
            70,
            238,
            184,
            20,
            222,
            94,
            11,
            219,
            224,
            50,
            58,
            10,
            73,
            6,
            36,
            92,
            194,
            211,
            172,
            98,
            145,
            149,
            228,
            121,
            231,
            200,
            55,
            109,
            141,
            213,
            78,
            169,
            108,
            86,
            244,
            234,
            101,
            122,
            174,
            8,
            186,
            120,
            37,
            46,
            28,
            166,
            180,
            198,
            232,
            221,
            116,
            31,
            75,
            189,
            139,
            138,
            112,
            62,
            181,
            102,
            72,
            3,
            246,
            14,
            97,
            53,
            87,
            185,
            134,
            193,
            29,
            158,
            225,
            248,
            152,
            17,
            105,
            217,
            142,
            148,
            155,
            30,
            135,
            233,
            206,
            85,
            40,
            223,
            140,
            161,
            137,
            13,
            191,
            230,
            66,
            104,
            65,
            153,
            45,
            15,
            176,
            84,
            187,
            22,
          ],
          te = [
            82,
            9,
            106,
            213,
            48,
            54,
            165,
            56,
            191,
            64,
            163,
            158,
            129,
            243,
            215,
            251,
            124,
            227,
            57,
            130,
            155,
            47,
            255,
            135,
            52,
            142,
            67,
            68,
            196,
            222,
            233,
            203,
            84,
            123,
            148,
            50,
            166,
            194,
            35,
            61,
            238,
            76,
            149,
            11,
            66,
            250,
            195,
            78,
            8,
            46,
            161,
            102,
            40,
            217,
            36,
            178,
            118,
            91,
            162,
            73,
            109,
            139,
            209,
            37,
            114,
            248,
            246,
            100,
            134,
            104,
            152,
            22,
            212,
            164,
            92,
            204,
            93,
            101,
            182,
            146,
            108,
            112,
            72,
            80,
            253,
            237,
            185,
            218,
            94,
            21,
            70,
            87,
            167,
            141,
            157,
            132,
            144,
            216,
            171,
            0,
            140,
            188,
            211,
            10,
            247,
            228,
            88,
            5,
            184,
            179,
            69,
            6,
            208,
            44,
            30,
            143,
            202,
            63,
            15,
            2,
            193,
            175,
            189,
            3,
            1,
            19,
            138,
            107,
            58,
            145,
            17,
            65,
            79,
            103,
            220,
            234,
            151,
            242,
            207,
            206,
            240,
            180,
            230,
            115,
            150,
            172,
            116,
            34,
            231,
            173,
            53,
            133,
            226,
            249,
            55,
            232,
            28,
            117,
            223,
            110,
            71,
            241,
            26,
            113,
            29,
            41,
            197,
            137,
            111,
            183,
            98,
            14,
            170,
            24,
            190,
            27,
            252,
            86,
            62,
            75,
            198,
            210,
            121,
            32,
            154,
            219,
            192,
            254,
            120,
            205,
            90,
            244,
            31,
            221,
            168,
            51,
            136,
            7,
            199,
            49,
            177,
            18,
            16,
            89,
            39,
            128,
            236,
            95,
            96,
            81,
            127,
            169,
            25,
            181,
            74,
            13,
            45,
            229,
            122,
            159,
            147,
            201,
            156,
            239,
            160,
            224,
            59,
            77,
            174,
            42,
            245,
            176,
            200,
            235,
            187,
            60,
            131,
            83,
            153,
            97,
            23,
            43,
            4,
            126,
            186,
            119,
            214,
            38,
            225,
            105,
            20,
            99,
            85,
            33,
            12,
            125,
          ],
          oe = [
            3328402341,
            4168907908,
            4000806809,
            4135287693,
            4294111757,
            3597364157,
            3731845041,
            2445657428,
            1613770832,
            33620227,
            3462883241,
            1445669757,
            3892248089,
            3050821474,
            1303096294,
            3967186586,
            2412431941,
            528646813,
            2311702848,
            4202528135,
            4026202645,
            2992200171,
            2387036105,
            4226871307,
            1101901292,
            3017069671,
            1604494077,
            1169141738,
            597466303,
            1403299063,
            3832705686,
            2613100635,
            1974974402,
            3791519004,
            1033081774,
            1277568618,
            1815492186,
            2118074177,
            4126668546,
            2211236943,
            1748251740,
            1369810420,
            3521504564,
            4193382664,
            3799085459,
            2883115123,
            1647391059,
            706024767,
            134480908,
            2512897874,
            1176707941,
            2646852446,
            806885416,
            932615841,
            168101135,
            798661301,
            235341577,
            605164086,
            461406363,
            3756188221,
            3454790438,
            1311188841,
            2142417613,
            3933566367,
            302582043,
            495158174,
            1479289972,
            874125870,
            907746093,
            3698224818,
            3025820398,
            1537253627,
            2756858614,
            1983593293,
            3084310113,
            2108928974,
            1378429307,
            3722699582,
            1580150641,
            327451799,
            2790478837,
            3117535592,
            0,
            3253595436,
            1075847264,
            3825007647,
            2041688520,
            3059440621,
            3563743934,
            2378943302,
            1740553945,
            1916352843,
            2487896798,
            2555137236,
            2958579944,
            2244988746,
            3151024235,
            3320835882,
            1336584933,
            3992714006,
            2252555205,
            2588757463,
            1714631509,
            293963156,
            2319795663,
            3925473552,
            67240454,
            4269768577,
            2689618160,
            2017213508,
            631218106,
            1269344483,
            2723238387,
            1571005438,
            2151694528,
            93294474,
            1066570413,
            563977660,
            1882732616,
            4059428100,
            1673313503,
            2008463041,
            2950355573,
            1109467491,
            537923632,
            3858759450,
            4260623118,
            3218264685,
            2177748300,
            403442708,
            638784309,
            3287084079,
            3193921505,
            899127202,
            2286175436,
            773265209,
            2479146071,
            1437050866,
            4236148354,
            2050833735,
            3362022572,
            3126681063,
            840505643,
            3866325909,
            3227541664,
            427917720,
            2655997905,
            2749160575,
            1143087718,
            1412049534,
            999329963,
            193497219,
            2353415882,
            3354324521,
            1807268051,
            672404540,
            2816401017,
            3160301282,
            369822493,
            2916866934,
            3688947771,
            1681011286,
            1949973070,
            336202270,
            2454276571,
            201721354,
            1210328172,
            3093060836,
            2680341085,
            3184776046,
            1135389935,
            3294782118,
            965841320,
            831886756,
            3554993207,
            4068047243,
            3588745010,
            2345191491,
            1849112409,
            3664604599,
            26054028,
            2983581028,
            2622377682,
            1235855840,
            3630984372,
            2891339514,
            4092916743,
            3488279077,
            3395642799,
            4101667470,
            1202630377,
            268961816,
            1874508501,
            4034427016,
            1243948399,
            1546530418,
            941366308,
            1470539505,
            1941222599,
            2546386513,
            3421038627,
            2715671932,
            3899946140,
            1042226977,
            2521517021,
            1639824860,
            227249030,
            260737669,
            3765465232,
            2084453954,
            1907733956,
            3429263018,
            2420656344,
            100860677,
            4160157185,
            470683154,
            3261161891,
            1781871967,
            2924959737,
            1773779408,
            394692241,
            2579611992,
            974986535,
            664706745,
            3655459128,
            3958962195,
            731420851,
            571543859,
            3530123707,
            2849626480,
            126783113,
            865375399,
            765172662,
            1008606754,
            361203602,
            3387549984,
            2278477385,
            2857719295,
            1344809080,
            2782912378,
            59542671,
            1503764984,
            160008576,
            437062935,
            1707065306,
            3622233649,
            2218934982,
            3496503480,
            2185314755,
            697932208,
            1512910199,
            504303377,
            2075177163,
            2824099068,
            1841019862,
            739644986,
          ],
          V = [
            2781242211,
            2230877308,
            2582542199,
            2381740923,
            234877682,
            3184946027,
            2984144751,
            1418839493,
            1348481072,
            50462977,
            2848876391,
            2102799147,
            434634494,
            1656084439,
            3863849899,
            2599188086,
            1167051466,
            2636087938,
            1082771913,
            2281340285,
            368048890,
            3954334041,
            3381544775,
            201060592,
            3963727277,
            1739838676,
            4250903202,
            3930435503,
            3206782108,
            4149453988,
            2531553906,
            1536934080,
            3262494647,
            484572669,
            2923271059,
            1783375398,
            1517041206,
            1098792767,
            49674231,
            1334037708,
            1550332980,
            4098991525,
            886171109,
            150598129,
            2481090929,
            1940642008,
            1398944049,
            1059722517,
            201851908,
            1385547719,
            1699095331,
            1587397571,
            674240536,
            2704774806,
            252314885,
            3039795866,
            151914247,
            908333586,
            2602270848,
            1038082786,
            651029483,
            1766729511,
            3447698098,
            2682942837,
            454166793,
            2652734339,
            1951935532,
            775166490,
            758520603,
            3000790638,
            4004797018,
            4217086112,
            4137964114,
            1299594043,
            1639438038,
            3464344499,
            2068982057,
            1054729187,
            1901997871,
            2534638724,
            4121318227,
            1757008337,
            0,
            750906861,
            1614815264,
            535035132,
            3363418545,
            3988151131,
            3201591914,
            1183697867,
            3647454910,
            1265776953,
            3734260298,
            3566750796,
            3903871064,
            1250283471,
            1807470800,
            717615087,
            3847203498,
            384695291,
            3313910595,
            3617213773,
            1432761139,
            2484176261,
            3481945413,
            283769337,
            100925954,
            2180939647,
            4037038160,
            1148730428,
            3123027871,
            3813386408,
            4087501137,
            4267549603,
            3229630528,
            2315620239,
            2906624658,
            3156319645,
            1215313976,
            82966005,
            3747855548,
            3245848246,
            1974459098,
            1665278241,
            807407632,
            451280895,
            251524083,
            1841287890,
            1283575245,
            337120268,
            891687699,
            801369324,
            3787349855,
            2721421207,
            3431482436,
            959321879,
            1469301956,
            4065699751,
            2197585534,
            1199193405,
            2898814052,
            3887750493,
            724703513,
            2514908019,
            2696962144,
            2551808385,
            3516813135,
            2141445340,
            1715741218,
            2119445034,
            2872807568,
            2198571144,
            3398190662,
            700968686,
            3547052216,
            1009259540,
            2041044702,
            3803995742,
            487983883,
            1991105499,
            1004265696,
            1449407026,
            1316239930,
            504629770,
            3683797321,
            168560134,
            1816667172,
            3837287516,
            1570751170,
            1857934291,
            4014189740,
            2797888098,
            2822345105,
            2754712981,
            936633572,
            2347923833,
            852879335,
            1133234376,
            1500395319,
            3084545389,
            2348912013,
            1689376213,
            3533459022,
            3762923945,
            3034082412,
            4205598294,
            133428468,
            634383082,
            2949277029,
            2398386810,
            3913789102,
            403703816,
            3580869306,
            2297460856,
            1867130149,
            1918643758,
            607656988,
            4049053350,
            3346248884,
            1368901318,
            600565992,
            2090982877,
            2632479860,
            557719327,
            3717614411,
            3697393085,
            2249034635,
            2232388234,
            2430627952,
            1115438654,
            3295786421,
            2865522278,
            3633334344,
            84280067,
            33027830,
            303828494,
            2747425121,
            1600795957,
            4188952407,
            3496589753,
            2434238086,
            1486471617,
            658119965,
            3106381470,
            953803233,
            334231800,
            3005978776,
            857870609,
            3151128937,
            1890179545,
            2298973838,
            2805175444,
            3056442267,
            574365214,
            2450884487,
            550103529,
            1233637070,
            4289353045,
            2018519080,
            2057691103,
            2399374476,
            4166623649,
            2148108681,
            387583245,
            3664101311,
            836232934,
            3330556482,
            3100665960,
            3280093505,
            2955516313,
            2002398509,
            287182607,
            3413881008,
            4238890068,
            3597515707,
            975967766,
          ],
          x = [
            1671808611,
            2089089148,
            2006576759,
            2072901243,
            4061003762,
            1807603307,
            1873927791,
            3310653893,
            810573872,
            16974337,
            1739181671,
            729634347,
            4263110654,
            3613570519,
            2883997099,
            1989864566,
            3393556426,
            2191335298,
            3376449993,
            2106063485,
            4195741690,
            1508618841,
            1204391495,
            4027317232,
            2917941677,
            3563566036,
            2734514082,
            2951366063,
            2629772188,
            2767672228,
            1922491506,
            3227229120,
            3082974647,
            4246528509,
            2477669779,
            644500518,
            911895606,
            1061256767,
            4144166391,
            3427763148,
            878471220,
            2784252325,
            3845444069,
            4043897329,
            1905517169,
            3631459288,
            827548209,
            356461077,
            67897348,
            3344078279,
            593839651,
            3277757891,
            405286936,
            2527147926,
            84871685,
            2595565466,
            118033927,
            305538066,
            2157648768,
            3795705826,
            3945188843,
            661212711,
            2999812018,
            1973414517,
            152769033,
            2208177539,
            745822252,
            439235610,
            455947803,
            1857215598,
            1525593178,
            2700827552,
            1391895634,
            994932283,
            3596728278,
            3016654259,
            695947817,
            3812548067,
            795958831,
            2224493444,
            1408607827,
            3513301457,
            0,
            3979133421,
            543178784,
            4229948412,
            2982705585,
            1542305371,
            1790891114,
            3410398667,
            3201918910,
            961245753,
            1256100938,
            1289001036,
            1491644504,
            3477767631,
            3496721360,
            4012557807,
            2867154858,
            4212583931,
            1137018435,
            1305975373,
            861234739,
            2241073541,
            1171229253,
            4178635257,
            33948674,
            2139225727,
            1357946960,
            1011120188,
            2679776671,
            2833468328,
            1374921297,
            2751356323,
            1086357568,
            2408187279,
            2460827538,
            2646352285,
            944271416,
            4110742005,
            3168756668,
            3066132406,
            3665145818,
            560153121,
            271589392,
            4279952895,
            4077846003,
            3530407890,
            3444343245,
            202643468,
            322250259,
            3962553324,
            1608629855,
            2543990167,
            1154254916,
            389623319,
            3294073796,
            2817676711,
            2122513534,
            1028094525,
            1689045092,
            1575467613,
            422261273,
            1939203699,
            1621147744,
            2174228865,
            1339137615,
            3699352540,
            577127458,
            712922154,
            2427141008,
            2290289544,
            1187679302,
            3995715566,
            3100863416,
            339486740,
            3732514782,
            1591917662,
            186455563,
            3681988059,
            3762019296,
            844522546,
            978220090,
            169743370,
            1239126601,
            101321734,
            611076132,
            1558493276,
            3260915650,
            3547250131,
            2901361580,
            1655096418,
            2443721105,
            2510565781,
            3828863972,
            2039214713,
            3878868455,
            3359869896,
            928607799,
            1840765549,
            2374762893,
            3580146133,
            1322425422,
            2850048425,
            1823791212,
            1459268694,
            4094161908,
            3928346602,
            1706019429,
            2056189050,
            2934523822,
            135794696,
            3134549946,
            2022240376,
            628050469,
            779246638,
            472135708,
            2800834470,
            3032970164,
            3327236038,
            3894660072,
            3715932637,
            1956440180,
            522272287,
            1272813131,
            3185336765,
            2340818315,
            2323976074,
            1888542832,
            1044544574,
            3049550261,
            1722469478,
            1222152264,
            50660867,
            4127324150,
            236067854,
            1638122081,
            895445557,
            1475980887,
            3117443513,
            2257655686,
            3243809217,
            489110045,
            2662934430,
            3778599393,
            4162055160,
            2561878936,
            288563729,
            1773916777,
            3648039385,
            2391345038,
            2493985684,
            2612407707,
            505560094,
            2274497927,
            3911240169,
            3460925390,
            1442818645,
            678973480,
            3749357023,
            2358182796,
            2717407649,
            2306869641,
            219617805,
            3218761151,
            3862026214,
            1120306242,
            1756942440,
            1103331905,
            2578459033,
            762796589,
            252780047,
            2966125488,
            1425844308,
            3151392187,
            372911126,
          ],
          N = [
            1667474886,
            2088535288,
            2004326894,
            2071694838,
            4075949567,
            1802223062,
            1869591006,
            3318043793,
            808472672,
            16843522,
            1734846926,
            724270422,
            4278065639,
            3621216949,
            2880169549,
            1987484396,
            3402253711,
            2189597983,
            3385409673,
            2105378810,
            4210693615,
            1499065266,
            1195886990,
            4042263547,
            2913856577,
            3570689971,
            2728590687,
            2947541573,
            2627518243,
            2762274643,
            1920112356,
            3233831835,
            3082273397,
            4261223649,
            2475929149,
            640051788,
            909531756,
            1061110142,
            4160160501,
            3435941763,
            875846760,
            2779116625,
            3857003729,
            4059105529,
            1903268834,
            3638064043,
            825316194,
            353713962,
            67374088,
            3351728789,
            589522246,
            3284360861,
            404236336,
            2526454071,
            84217610,
            2593830191,
            117901582,
            303183396,
            2155911963,
            3806477791,
            3958056653,
            656894286,
            2998062463,
            1970642922,
            151591698,
            2206440989,
            741110872,
            437923380,
            454765878,
            1852748508,
            1515908788,
            2694904667,
            1381168804,
            993742198,
            3604373943,
            3014905469,
            690584402,
            3823320797,
            791638366,
            2223281939,
            1398011302,
            3520161977,
            0,
            3991743681,
            538992704,
            4244381667,
            2981218425,
            1532751286,
            1785380564,
            3419096717,
            3200178535,
            960056178,
            1246420628,
            1280103576,
            1482221744,
            3486468741,
            3503319995,
            4025428677,
            2863326543,
            4227536621,
            1128514950,
            1296947098,
            859002214,
            2240123921,
            1162203018,
            4193849577,
            33687044,
            2139062782,
            1347481760,
            1010582648,
            2678045221,
            2829640523,
            1364325282,
            2745433693,
            1077985408,
            2408548869,
            2459086143,
            2644360225,
            943212656,
            4126475505,
            3166494563,
            3065430391,
            3671750063,
            555836226,
            269496352,
            4294908645,
            4092792573,
            3537006015,
            3452783745,
            202118168,
            320025894,
            3974901699,
            1600119230,
            2543297077,
            1145359496,
            387397934,
            3301201811,
            2812801621,
            2122220284,
            1027426170,
            1684319432,
            1566435258,
            421079858,
            1936954854,
            1616945344,
            2172753945,
            1330631070,
            3705438115,
            572679748,
            707427924,
            2425400123,
            2290647819,
            1179044492,
            4008585671,
            3099120491,
            336870440,
            3739122087,
            1583276732,
            185277718,
            3688593069,
            3772791771,
            842159716,
            976899700,
            168435220,
            1229577106,
            101059084,
            606366792,
            1549591736,
            3267517855,
            3553849021,
            2897014595,
            1650632388,
            2442242105,
            2509612081,
            3840161747,
            2038008818,
            3890688725,
            3368567691,
            926374254,
            1835907034,
            2374863873,
            3587531953,
            1313788572,
            2846482505,
            1819063512,
            1448540844,
            4109633523,
            3941213647,
            1701162954,
            2054852340,
            2930698567,
            134748176,
            3132806511,
            2021165296,
            623210314,
            774795868,
            471606328,
            2795958615,
            3031746419,
            3334885783,
            3907527627,
            3722280097,
            1953799400,
            522133822,
            1263263126,
            3183336545,
            2341176845,
            2324333839,
            1886425312,
            1044267644,
            3048588401,
            1718004428,
            1212733584,
            50529542,
            4143317495,
            235803164,
            1633788866,
            892690282,
            1465383342,
            3115962473,
            2256965911,
            3250673817,
            488449850,
            2661202215,
            3789633753,
            4177007595,
            2560144171,
            286339874,
            1768537042,
            3654906025,
            2391705863,
            2492770099,
            2610673197,
            505291324,
            2273808917,
            3924369609,
            3469625735,
            1431699370,
            673740880,
            3755965093,
            2358021891,
            2711746649,
            2307489801,
            218961690,
            3217021541,
            3873845719,
            1111672452,
            1751693520,
            1094828930,
            2576986153,
            757954394,
            252645662,
            2964376443,
            1414855848,
            3149649517,
            370555436,
          ],
          L = [
            1374988112,
            2118214995,
            437757123,
            975658646,
            1001089995,
            530400753,
            2902087851,
            1273168787,
            540080725,
            2910219766,
            2295101073,
            4110568485,
            1340463100,
            3307916247,
            641025152,
            3043140495,
            3736164937,
            632953703,
            1172967064,
            1576976609,
            3274667266,
            2169303058,
            2370213795,
            1809054150,
            59727847,
            361929877,
            3211623147,
            2505202138,
            3569255213,
            1484005843,
            1239443753,
            2395588676,
            1975683434,
            4102977912,
            2572697195,
            666464733,
            3202437046,
            4035489047,
            3374361702,
            2110667444,
            1675577880,
            3843699074,
            2538681184,
            1649639237,
            2976151520,
            3144396420,
            4269907996,
            4178062228,
            1883793496,
            2403728665,
            2497604743,
            1383856311,
            2876494627,
            1917518562,
            3810496343,
            1716890410,
            3001755655,
            800440835,
            2261089178,
            3543599269,
            807962610,
            599762354,
            33778362,
            3977675356,
            2328828971,
            2809771154,
            4077384432,
            1315562145,
            1708848333,
            101039829,
            3509871135,
            3299278474,
            875451293,
            2733856160,
            92987698,
            2767645557,
            193195065,
            1080094634,
            1584504582,
            3178106961,
            1042385657,
            2531067453,
            3711829422,
            1306967366,
            2438237621,
            1908694277,
            67556463,
            1615861247,
            429456164,
            3602770327,
            2302690252,
            1742315127,
            2968011453,
            126454664,
            3877198648,
            2043211483,
            2709260871,
            2084704233,
            4169408201,
            0,
            159417987,
            841739592,
            504459436,
            1817866830,
            4245618683,
            260388950,
            1034867998,
            908933415,
            168810852,
            1750902305,
            2606453969,
            607530554,
            202008497,
            2472011535,
            3035535058,
            463180190,
            2160117071,
            1641816226,
            1517767529,
            470948374,
            3801332234,
            3231722213,
            1008918595,
            303765277,
            235474187,
            4069246893,
            766945465,
            337553864,
            1475418501,
            2943682380,
            4003061179,
            2743034109,
            4144047775,
            1551037884,
            1147550661,
            1543208500,
            2336434550,
            3408119516,
            3069049960,
            3102011747,
            3610369226,
            1113818384,
            328671808,
            2227573024,
            2236228733,
            3535486456,
            2935566865,
            3341394285,
            496906059,
            3702665459,
            226906860,
            2009195472,
            733156972,
            2842737049,
            294930682,
            1206477858,
            2835123396,
            2700099354,
            1451044056,
            573804783,
            2269728455,
            3644379585,
            2362090238,
            2564033334,
            2801107407,
            2776292904,
            3669462566,
            1068351396,
            742039012,
            1350078989,
            1784663195,
            1417561698,
            4136440770,
            2430122216,
            775550814,
            2193862645,
            2673705150,
            1775276924,
            1876241833,
            3475313331,
            3366754619,
            270040487,
            3902563182,
            3678124923,
            3441850377,
            1851332852,
            3969562369,
            2203032232,
            3868552805,
            2868897406,
            566021896,
            4011190502,
            3135740889,
            1248802510,
            3936291284,
            699432150,
            832877231,
            708780849,
            3332740144,
            899835584,
            1951317047,
            4236429990,
            3767586992,
            866637845,
            4043610186,
            1106041591,
            2144161806,
            395441711,
            1984812685,
            1139781709,
            3433712980,
            3835036895,
            2664543715,
            1282050075,
            3240894392,
            1181045119,
            2640243204,
            25965917,
            4203181171,
            4211818798,
            3009879386,
            2463879762,
            3910161971,
            1842759443,
            2597806476,
            933301370,
            1509430414,
            3943906441,
            3467192302,
            3076639029,
            3776767469,
            2051518780,
            2631065433,
            1441952575,
            404016761,
            1942435775,
            1408749034,
            1610459739,
            3745345300,
            2017778566,
            3400528769,
            3110650942,
            941896748,
            3265478751,
            371049330,
            3168937228,
            675039627,
            4279080257,
            967311729,
            135050206,
            3635733660,
            1683407248,
            2076935265,
            3576870512,
            1215061108,
            3501741890,
          ],
          H = [
            1347548327,
            1400783205,
            3273267108,
            2520393566,
            3409685355,
            4045380933,
            2880240216,
            2471224067,
            1428173050,
            4138563181,
            2441661558,
            636813900,
            4233094615,
            3620022987,
            2149987652,
            2411029155,
            1239331162,
            1730525723,
            2554718734,
            3781033664,
            46346101,
            310463728,
            2743944855,
            3328955385,
            3875770207,
            2501218972,
            3955191162,
            3667219033,
            768917123,
            3545789473,
            692707433,
            1150208456,
            1786102409,
            2029293177,
            1805211710,
            3710368113,
            3065962831,
            401639597,
            1724457132,
            3028143674,
            409198410,
            2196052529,
            1620529459,
            1164071807,
            3769721975,
            2226875310,
            486441376,
            2499348523,
            1483753576,
            428819965,
            2274680428,
            3075636216,
            598438867,
            3799141122,
            1474502543,
            711349675,
            129166120,
            53458370,
            2592523643,
            2782082824,
            4063242375,
            2988687269,
            3120694122,
            1559041666,
            730517276,
            2460449204,
            4042459122,
            2706270690,
            3446004468,
            3573941694,
            533804130,
            2328143614,
            2637442643,
            2695033685,
            839224033,
            1973745387,
            957055980,
            2856345839,
            106852767,
            1371368976,
            4181598602,
            1033297158,
            2933734917,
            1179510461,
            3046200461,
            91341917,
            1862534868,
            4284502037,
            605657339,
            2547432937,
            3431546947,
            2003294622,
            3182487618,
            2282195339,
            954669403,
            3682191598,
            1201765386,
            3917234703,
            3388507166,
            0,
            2198438022,
            1211247597,
            2887651696,
            1315723890,
            4227665663,
            1443857720,
            507358933,
            657861945,
            1678381017,
            560487590,
            3516619604,
            975451694,
            2970356327,
            261314535,
            3535072918,
            2652609425,
            1333838021,
            2724322336,
            1767536459,
            370938394,
            182621114,
            3854606378,
            1128014560,
            487725847,
            185469197,
            2918353863,
            3106780840,
            3356761769,
            2237133081,
            1286567175,
            3152976349,
            4255350624,
            2683765030,
            3160175349,
            3309594171,
            878443390,
            1988838185,
            3704300486,
            1756818940,
            1673061617,
            3403100636,
            272786309,
            1075025698,
            545572369,
            2105887268,
            4174560061,
            296679730,
            1841768865,
            1260232239,
            4091327024,
            3960309330,
            3497509347,
            1814803222,
            2578018489,
            4195456072,
            575138148,
            3299409036,
            446754879,
            3629546796,
            4011996048,
            3347532110,
            3252238545,
            4270639778,
            915985419,
            3483825537,
            681933534,
            651868046,
            2755636671,
            3828103837,
            223377554,
            2607439820,
            1649704518,
            3270937875,
            3901806776,
            1580087799,
            4118987695,
            3198115200,
            2087309459,
            2842678573,
            3016697106,
            1003007129,
            2802849917,
            1860738147,
            2077965243,
            164439672,
            4100872472,
            32283319,
            2827177882,
            1709610350,
            2125135846,
            136428751,
            3874428392,
            3652904859,
            3460984630,
            3572145929,
            3593056380,
            2939266226,
            824852259,
            818324884,
            3224740454,
            930369212,
            2801566410,
            2967507152,
            355706840,
            1257309336,
            4148292826,
            243256656,
            790073846,
            2373340630,
            1296297904,
            1422699085,
            3756299780,
            3818836405,
            457992840,
            3099667487,
            2135319889,
            77422314,
            1560382517,
            1945798516,
            788204353,
            1521706781,
            1385356242,
            870912086,
            325965383,
            2358957921,
            2050466060,
            2388260884,
            2313884476,
            4006521127,
            901210569,
            3990953189,
            1014646705,
            1503449823,
            1062597235,
            2031621326,
            3212035895,
            3931371469,
            1533017514,
            350174575,
            2256028891,
            2177544179,
            1052338372,
            741876788,
            1606591296,
            1914052035,
            213705253,
            2334669897,
            1107234197,
            1899603969,
            3725069491,
            2631447780,
            2422494913,
            1635502980,
            1893020342,
            1950903388,
            1120974935,
          ],
          F = [
            2807058932,
            1699970625,
            2764249623,
            1586903591,
            1808481195,
            1173430173,
            1487645946,
            59984867,
            4199882800,
            1844882806,
            1989249228,
            1277555970,
            3623636965,
            3419915562,
            1149249077,
            2744104290,
            1514790577,
            459744698,
            244860394,
            3235995134,
            1963115311,
            4027744588,
            2544078150,
            4190530515,
            1608975247,
            2627016082,
            2062270317,
            1507497298,
            2200818878,
            567498868,
            1764313568,
            3359936201,
            2305455554,
            2037970062,
            1047239e3,
            1910319033,
            1337376481,
            2904027272,
            2892417312,
            984907214,
            1243112415,
            830661914,
            861968209,
            2135253587,
            2011214180,
            2927934315,
            2686254721,
            731183368,
            1750626376,
            4246310725,
            1820824798,
            4172763771,
            3542330227,
            48394827,
            2404901663,
            2871682645,
            671593195,
            3254988725,
            2073724613,
            145085239,
            2280796200,
            2779915199,
            1790575107,
            2187128086,
            472615631,
            3029510009,
            4075877127,
            3802222185,
            4107101658,
            3201631749,
            1646252340,
            4270507174,
            1402811438,
            1436590835,
            3778151818,
            3950355702,
            3963161475,
            4020912224,
            2667994737,
            273792366,
            2331590177,
            104699613,
            95345982,
            3175501286,
            2377486676,
            1560637892,
            3564045318,
            369057872,
            4213447064,
            3919042237,
            1137477952,
            2658625497,
            1119727848,
            2340947849,
            1530455833,
            4007360968,
            172466556,
            266959938,
            516552836,
            0,
            2256734592,
            3980931627,
            1890328081,
            1917742170,
            4294704398,
            945164165,
            3575528878,
            958871085,
            3647212047,
            2787207260,
            1423022939,
            775562294,
            1739656202,
            3876557655,
            2530391278,
            2443058075,
            3310321856,
            547512796,
            1265195639,
            437656594,
            3121275539,
            719700128,
            3762502690,
            387781147,
            218828297,
            3350065803,
            2830708150,
            2848461854,
            428169201,
            122466165,
            3720081049,
            1627235199,
            648017665,
            4122762354,
            1002783846,
            2117360635,
            695634755,
            3336358691,
            4234721005,
            4049844452,
            3704280881,
            2232435299,
            574624663,
            287343814,
            612205898,
            1039717051,
            840019705,
            2708326185,
            793451934,
            821288114,
            1391201670,
            3822090177,
            376187827,
            3113855344,
            1224348052,
            1679968233,
            2361698556,
            1058709744,
            752375421,
            2431590963,
            1321699145,
            3519142200,
            2734591178,
            188127444,
            2177869557,
            3727205754,
            2384911031,
            3215212461,
            2648976442,
            2450346104,
            3432737375,
            1180849278,
            331544205,
            3102249176,
            4150144569,
            2952102595,
            2159976285,
            2474404304,
            766078933,
            313773861,
            2570832044,
            2108100632,
            1668212892,
            3145456443,
            2013908262,
            418672217,
            3070356634,
            2594734927,
            1852171925,
            3867060991,
            3473416636,
            3907448597,
            2614737639,
            919489135,
            164948639,
            2094410160,
            2997825956,
            590424639,
            2486224549,
            1723872674,
            3157750862,
            3399941250,
            3501252752,
            3625268135,
            2555048196,
            3673637356,
            1343127501,
            4130281361,
            3599595085,
            2957853679,
            1297403050,
            81781910,
            3051593425,
            2283490410,
            532201772,
            1367295589,
            3926170974,
            895287692,
            1953757831,
            1093597963,
            492483431,
            3528626907,
            1446242576,
            1192455638,
            1636604631,
            209336225,
            344873464,
            1015671571,
            669961897,
            3375740769,
            3857572124,
            2973530695,
            3747192018,
            1933530610,
            3464042516,
            935293895,
            3454686199,
            2858115069,
            1863638845,
            3683022916,
            4085369519,
            3292445032,
            875313188,
            1080017571,
            3279033885,
            621591778,
            1233856572,
            2504130317,
            24197544,
            3017672716,
            3835484340,
            3247465558,
            2220981195,
            3060847922,
            1551124588,
            1463996600,
          ],
          n = [
            4104605777,
            1097159550,
            396673818,
            660510266,
            2875968315,
            2638606623,
            4200115116,
            3808662347,
            821712160,
            1986918061,
            3430322568,
            38544885,
            3856137295,
            718002117,
            893681702,
            1654886325,
            2975484382,
            3122358053,
            3926825029,
            4274053469,
            796197571,
            1290801793,
            1184342925,
            3556361835,
            2405426947,
            2459735317,
            1836772287,
            1381620373,
            3196267988,
            1948373848,
            3764988233,
            3385345166,
            3263785589,
            2390325492,
            1480485785,
            3111247143,
            3780097726,
            2293045232,
            548169417,
            3459953789,
            3746175075,
            439452389,
            1362321559,
            1400849762,
            1685577905,
            1806599355,
            2174754046,
            137073913,
            1214797936,
            1174215055,
            3731654548,
            2079897426,
            1943217067,
            1258480242,
            529487843,
            1437280870,
            3945269170,
            3049390895,
            3313212038,
            923313619,
            679998e3,
            3215307299,
            57326082,
            377642221,
            3474729866,
            2041877159,
            133361907,
            1776460110,
            3673476453,
            96392454,
            878845905,
            2801699524,
            777231668,
            4082475170,
            2330014213,
            4142626212,
            2213296395,
            1626319424,
            1906247262,
            1846563261,
            562755902,
            3708173718,
            1040559837,
            3871163981,
            1418573201,
            3294430577,
            114585348,
            1343618912,
            2566595609,
            3186202582,
            1078185097,
            3651041127,
            3896688048,
            2307622919,
            425408743,
            3371096953,
            2081048481,
            1108339068,
            2216610296,
            0,
            2156299017,
            736970802,
            292596766,
            1517440620,
            251657213,
            2235061775,
            2933202493,
            758720310,
            265905162,
            1554391400,
            1532285339,
            908999204,
            174567692,
            1474760595,
            4002861748,
            2610011675,
            3234156416,
            3693126241,
            2001430874,
            303699484,
            2478443234,
            2687165888,
            585122620,
            454499602,
            151849742,
            2345119218,
            3064510765,
            514443284,
            4044981591,
            1963412655,
            2581445614,
            2137062819,
            19308535,
            1928707164,
            1715193156,
            4219352155,
            1126790795,
            600235211,
            3992742070,
            3841024952,
            836553431,
            1669664834,
            2535604243,
            3323011204,
            1243905413,
            3141400786,
            4180808110,
            698445255,
            2653899549,
            2989552604,
            2253581325,
            3252932727,
            3004591147,
            1891211689,
            2487810577,
            3915653703,
            4237083816,
            4030667424,
            2100090966,
            865136418,
            1229899655,
            953270745,
            3399679628,
            3557504664,
            4118925222,
            2061379749,
            3079546586,
            2915017791,
            983426092,
            2022837584,
            1607244650,
            2118541908,
            2366882550,
            3635996816,
            972512814,
            3283088770,
            1568718495,
            3499326569,
            3576539503,
            621982671,
            2895723464,
            410887952,
            2623762152,
            1002142683,
            645401037,
            1494807662,
            2595684844,
            1335535747,
            2507040230,
            4293295786,
            3167684641,
            367585007,
            3885750714,
            1865862730,
            2668221674,
            2960971305,
            2763173681,
            1059270954,
            2777952454,
            2724642869,
            1320957812,
            2194319100,
            2429595872,
            2815956275,
            77089521,
            3973773121,
            3444575871,
            2448830231,
            1305906550,
            4021308739,
            2857194700,
            2516901860,
            3518358430,
            1787304780,
            740276417,
            1699839814,
            1592394909,
            2352307457,
            2272556026,
            188821243,
            1729977011,
            3687994002,
            274084841,
            3594982253,
            3613494426,
            2701949495,
            4162096729,
            322734571,
            2837966542,
            1640576439,
            484830689,
            1202797690,
            3537852828,
            4067639125,
            349075736,
            3342319475,
            4157467219,
            4255800159,
            1030690015,
            1155237496,
            2951971274,
            1757691577,
            607398968,
            2738905026,
            499347990,
            3794078908,
            1011452712,
            227885567,
            2818666809,
            213114376,
            3034881240,
            1455525988,
            3414450555,
            850817237,
            1817998408,
            3092726480,
          ],
          y = [
            0,
            235474187,
            470948374,
            303765277,
            941896748,
            908933415,
            607530554,
            708780849,
            1883793496,
            2118214995,
            1817866830,
            1649639237,
            1215061108,
            1181045119,
            1417561698,
            1517767529,
            3767586992,
            4003061179,
            4236429990,
            4069246893,
            3635733660,
            3602770327,
            3299278474,
            3400528769,
            2430122216,
            2664543715,
            2362090238,
            2193862645,
            2835123396,
            2801107407,
            3035535058,
            3135740889,
            3678124923,
            3576870512,
            3341394285,
            3374361702,
            3810496343,
            3977675356,
            4279080257,
            4043610186,
            2876494627,
            2776292904,
            3076639029,
            3110650942,
            2472011535,
            2640243204,
            2403728665,
            2169303058,
            1001089995,
            899835584,
            666464733,
            699432150,
            59727847,
            226906860,
            530400753,
            294930682,
            1273168787,
            1172967064,
            1475418501,
            1509430414,
            1942435775,
            2110667444,
            1876241833,
            1641816226,
            2910219766,
            2743034109,
            2976151520,
            3211623147,
            2505202138,
            2606453969,
            2302690252,
            2269728455,
            3711829422,
            3543599269,
            3240894392,
            3475313331,
            3843699074,
            3943906441,
            4178062228,
            4144047775,
            1306967366,
            1139781709,
            1374988112,
            1610459739,
            1975683434,
            2076935265,
            1775276924,
            1742315127,
            1034867998,
            866637845,
            566021896,
            800440835,
            92987698,
            193195065,
            429456164,
            395441711,
            1984812685,
            2017778566,
            1784663195,
            1683407248,
            1315562145,
            1080094634,
            1383856311,
            1551037884,
            101039829,
            135050206,
            437757123,
            337553864,
            1042385657,
            807962610,
            573804783,
            742039012,
            2531067453,
            2564033334,
            2328828971,
            2227573024,
            2935566865,
            2700099354,
            3001755655,
            3168937228,
            3868552805,
            3902563182,
            4203181171,
            4102977912,
            3736164937,
            3501741890,
            3265478751,
            3433712980,
            1106041591,
            1340463100,
            1576976609,
            1408749034,
            2043211483,
            2009195472,
            1708848333,
            1809054150,
            832877231,
            1068351396,
            766945465,
            599762354,
            159417987,
            126454664,
            361929877,
            463180190,
            2709260871,
            2943682380,
            3178106961,
            3009879386,
            2572697195,
            2538681184,
            2236228733,
            2336434550,
            3509871135,
            3745345300,
            3441850377,
            3274667266,
            3910161971,
            3877198648,
            4110568485,
            4211818798,
            2597806476,
            2497604743,
            2261089178,
            2295101073,
            2733856160,
            2902087851,
            3202437046,
            2968011453,
            3936291284,
            3835036895,
            4136440770,
            4169408201,
            3535486456,
            3702665459,
            3467192302,
            3231722213,
            2051518780,
            1951317047,
            1716890410,
            1750902305,
            1113818384,
            1282050075,
            1584504582,
            1350078989,
            168810852,
            67556463,
            371049330,
            404016761,
            841739592,
            1008918595,
            775550814,
            540080725,
            3969562369,
            3801332234,
            4035489047,
            4269907996,
            3569255213,
            3669462566,
            3366754619,
            3332740144,
            2631065433,
            2463879762,
            2160117071,
            2395588676,
            2767645557,
            2868897406,
            3102011747,
            3069049960,
            202008497,
            33778362,
            270040487,
            504459436,
            875451293,
            975658646,
            675039627,
            641025152,
            2084704233,
            1917518562,
            1615861247,
            1851332852,
            1147550661,
            1248802510,
            1484005843,
            1451044056,
            933301370,
            967311729,
            733156972,
            632953703,
            260388950,
            25965917,
            328671808,
            496906059,
            1206477858,
            1239443753,
            1543208500,
            1441952575,
            2144161806,
            1908694277,
            1675577880,
            1842759443,
            3610369226,
            3644379585,
            3408119516,
            3307916247,
            4011190502,
            3776767469,
            4077384432,
            4245618683,
            2809771154,
            2842737049,
            3144396420,
            3043140495,
            2673705150,
            2438237621,
            2203032232,
            2370213795,
          ],
          O = [
            0,
            185469197,
            370938394,
            487725847,
            741876788,
            657861945,
            975451694,
            824852259,
            1483753576,
            1400783205,
            1315723890,
            1164071807,
            1950903388,
            2135319889,
            1649704518,
            1767536459,
            2967507152,
            3152976349,
            2801566410,
            2918353863,
            2631447780,
            2547432937,
            2328143614,
            2177544179,
            3901806776,
            3818836405,
            4270639778,
            4118987695,
            3299409036,
            3483825537,
            3535072918,
            3652904859,
            2077965243,
            1893020342,
            1841768865,
            1724457132,
            1474502543,
            1559041666,
            1107234197,
            1257309336,
            598438867,
            681933534,
            901210569,
            1052338372,
            261314535,
            77422314,
            428819965,
            310463728,
            3409685355,
            3224740454,
            3710368113,
            3593056380,
            3875770207,
            3960309330,
            4045380933,
            4195456072,
            2471224067,
            2554718734,
            2237133081,
            2388260884,
            3212035895,
            3028143674,
            2842678573,
            2724322336,
            4138563181,
            4255350624,
            3769721975,
            3955191162,
            3667219033,
            3516619604,
            3431546947,
            3347532110,
            2933734917,
            2782082824,
            3099667487,
            3016697106,
            2196052529,
            2313884476,
            2499348523,
            2683765030,
            1179510461,
            1296297904,
            1347548327,
            1533017514,
            1786102409,
            1635502980,
            2087309459,
            2003294622,
            507358933,
            355706840,
            136428751,
            53458370,
            839224033,
            957055980,
            605657339,
            790073846,
            2373340630,
            2256028891,
            2607439820,
            2422494913,
            2706270690,
            2856345839,
            3075636216,
            3160175349,
            3573941694,
            3725069491,
            3273267108,
            3356761769,
            4181598602,
            4063242375,
            4011996048,
            3828103837,
            1033297158,
            915985419,
            730517276,
            545572369,
            296679730,
            446754879,
            129166120,
            213705253,
            1709610350,
            1860738147,
            1945798516,
            2029293177,
            1239331162,
            1120974935,
            1606591296,
            1422699085,
            4148292826,
            4233094615,
            3781033664,
            3931371469,
            3682191598,
            3497509347,
            3446004468,
            3328955385,
            2939266226,
            2755636671,
            3106780840,
            2988687269,
            2198438022,
            2282195339,
            2501218972,
            2652609425,
            1201765386,
            1286567175,
            1371368976,
            1521706781,
            1805211710,
            1620529459,
            2105887268,
            1988838185,
            533804130,
            350174575,
            164439672,
            46346101,
            870912086,
            954669403,
            636813900,
            788204353,
            2358957921,
            2274680428,
            2592523643,
            2441661558,
            2695033685,
            2880240216,
            3065962831,
            3182487618,
            3572145929,
            3756299780,
            3270937875,
            3388507166,
            4174560061,
            4091327024,
            4006521127,
            3854606378,
            1014646705,
            930369212,
            711349675,
            560487590,
            272786309,
            457992840,
            106852767,
            223377554,
            1678381017,
            1862534868,
            1914052035,
            2031621326,
            1211247597,
            1128014560,
            1580087799,
            1428173050,
            32283319,
            182621114,
            401639597,
            486441376,
            768917123,
            651868046,
            1003007129,
            818324884,
            1503449823,
            1385356242,
            1333838021,
            1150208456,
            1973745387,
            2125135846,
            1673061617,
            1756818940,
            2970356327,
            3120694122,
            2802849917,
            2887651696,
            2637442643,
            2520393566,
            2334669897,
            2149987652,
            3917234703,
            3799141122,
            4284502037,
            4100872472,
            3309594171,
            3460984630,
            3545789473,
            3629546796,
            2050466060,
            1899603969,
            1814803222,
            1730525723,
            1443857720,
            1560382517,
            1075025698,
            1260232239,
            575138148,
            692707433,
            878443390,
            1062597235,
            243256656,
            91341917,
            409198410,
            325965383,
            3403100636,
            3252238545,
            3704300486,
            3620022987,
            3874428392,
            3990953189,
            4042459122,
            4227665663,
            2460449204,
            2578018489,
            2226875310,
            2411029155,
            3198115200,
            3046200461,
            2827177882,
            2743944855,
          ],
          R = [
            0,
            218828297,
            437656594,
            387781147,
            875313188,
            958871085,
            775562294,
            590424639,
            1750626376,
            1699970625,
            1917742170,
            2135253587,
            1551124588,
            1367295589,
            1180849278,
            1265195639,
            3501252752,
            3720081049,
            3399941250,
            3350065803,
            3835484340,
            3919042237,
            4270507174,
            4085369519,
            3102249176,
            3051593425,
            2734591178,
            2952102595,
            2361698556,
            2177869557,
            2530391278,
            2614737639,
            3145456443,
            3060847922,
            2708326185,
            2892417312,
            2404901663,
            2187128086,
            2504130317,
            2555048196,
            3542330227,
            3727205754,
            3375740769,
            3292445032,
            3876557655,
            3926170974,
            4246310725,
            4027744588,
            1808481195,
            1723872674,
            1910319033,
            2094410160,
            1608975247,
            1391201670,
            1173430173,
            1224348052,
            59984867,
            244860394,
            428169201,
            344873464,
            935293895,
            984907214,
            766078933,
            547512796,
            1844882806,
            1627235199,
            2011214180,
            2062270317,
            1507497298,
            1423022939,
            1137477952,
            1321699145,
            95345982,
            145085239,
            532201772,
            313773861,
            830661914,
            1015671571,
            731183368,
            648017665,
            3175501286,
            2957853679,
            2807058932,
            2858115069,
            2305455554,
            2220981195,
            2474404304,
            2658625497,
            3575528878,
            3625268135,
            3473416636,
            3254988725,
            3778151818,
            3963161475,
            4213447064,
            4130281361,
            3599595085,
            3683022916,
            3432737375,
            3247465558,
            3802222185,
            4020912224,
            4172763771,
            4122762354,
            3201631749,
            3017672716,
            2764249623,
            2848461854,
            2331590177,
            2280796200,
            2431590963,
            2648976442,
            104699613,
            188127444,
            472615631,
            287343814,
            840019705,
            1058709744,
            671593195,
            621591778,
            1852171925,
            1668212892,
            1953757831,
            2037970062,
            1514790577,
            1463996600,
            1080017571,
            1297403050,
            3673637356,
            3623636965,
            3235995134,
            3454686199,
            4007360968,
            3822090177,
            4107101658,
            4190530515,
            2997825956,
            3215212461,
            2830708150,
            2779915199,
            2256734592,
            2340947849,
            2627016082,
            2443058075,
            172466556,
            122466165,
            273792366,
            492483431,
            1047239e3,
            861968209,
            612205898,
            695634755,
            1646252340,
            1863638845,
            2013908262,
            1963115311,
            1446242576,
            1530455833,
            1277555970,
            1093597963,
            1636604631,
            1820824798,
            2073724613,
            1989249228,
            1436590835,
            1487645946,
            1337376481,
            1119727848,
            164948639,
            81781910,
            331544205,
            516552836,
            1039717051,
            821288114,
            669961897,
            719700128,
            2973530695,
            3157750862,
            2871682645,
            2787207260,
            2232435299,
            2283490410,
            2667994737,
            2450346104,
            3647212047,
            3564045318,
            3279033885,
            3464042516,
            3980931627,
            3762502690,
            4150144569,
            4199882800,
            3070356634,
            3121275539,
            2904027272,
            2686254721,
            2200818878,
            2384911031,
            2570832044,
            2486224549,
            3747192018,
            3528626907,
            3310321856,
            3359936201,
            3950355702,
            3867060991,
            4049844452,
            4234721005,
            1739656202,
            1790575107,
            2108100632,
            1890328081,
            1402811438,
            1586903591,
            1233856572,
            1149249077,
            266959938,
            48394827,
            369057872,
            418672217,
            1002783846,
            919489135,
            567498868,
            752375421,
            209336225,
            24197544,
            376187827,
            459744698,
            945164165,
            895287692,
            574624663,
            793451934,
            1679968233,
            1764313568,
            2117360635,
            1933530610,
            1343127501,
            1560637892,
            1243112415,
            1192455638,
            3704280881,
            3519142200,
            3336358691,
            3419915562,
            3907448597,
            3857572124,
            4075877127,
            4294704398,
            3029510009,
            3113855344,
            2927934315,
            2744104290,
            2159976285,
            2377486676,
            2594734927,
            2544078150,
          ],
          ee = [
            0,
            151849742,
            303699484,
            454499602,
            607398968,
            758720310,
            908999204,
            1059270954,
            1214797936,
            1097159550,
            1517440620,
            1400849762,
            1817998408,
            1699839814,
            2118541908,
            2001430874,
            2429595872,
            2581445614,
            2194319100,
            2345119218,
            3034881240,
            3186202582,
            2801699524,
            2951971274,
            3635996816,
            3518358430,
            3399679628,
            3283088770,
            4237083816,
            4118925222,
            4002861748,
            3885750714,
            1002142683,
            850817237,
            698445255,
            548169417,
            529487843,
            377642221,
            227885567,
            77089521,
            1943217067,
            2061379749,
            1640576439,
            1757691577,
            1474760595,
            1592394909,
            1174215055,
            1290801793,
            2875968315,
            2724642869,
            3111247143,
            2960971305,
            2405426947,
            2253581325,
            2638606623,
            2487810577,
            3808662347,
            3926825029,
            4044981591,
            4162096729,
            3342319475,
            3459953789,
            3576539503,
            3693126241,
            1986918061,
            2137062819,
            1685577905,
            1836772287,
            1381620373,
            1532285339,
            1078185097,
            1229899655,
            1040559837,
            923313619,
            740276417,
            621982671,
            439452389,
            322734571,
            137073913,
            19308535,
            3871163981,
            4021308739,
            4104605777,
            4255800159,
            3263785589,
            3414450555,
            3499326569,
            3651041127,
            2933202493,
            2815956275,
            3167684641,
            3049390895,
            2330014213,
            2213296395,
            2566595609,
            2448830231,
            1305906550,
            1155237496,
            1607244650,
            1455525988,
            1776460110,
            1626319424,
            2079897426,
            1928707164,
            96392454,
            213114376,
            396673818,
            514443284,
            562755902,
            679998e3,
            865136418,
            983426092,
            3708173718,
            3557504664,
            3474729866,
            3323011204,
            4180808110,
            4030667424,
            3945269170,
            3794078908,
            2507040230,
            2623762152,
            2272556026,
            2390325492,
            2975484382,
            3092726480,
            2738905026,
            2857194700,
            3973773121,
            3856137295,
            4274053469,
            4157467219,
            3371096953,
            3252932727,
            3673476453,
            3556361835,
            2763173681,
            2915017791,
            3064510765,
            3215307299,
            2156299017,
            2307622919,
            2459735317,
            2610011675,
            2081048481,
            1963412655,
            1846563261,
            1729977011,
            1480485785,
            1362321559,
            1243905413,
            1126790795,
            878845905,
            1030690015,
            645401037,
            796197571,
            274084841,
            425408743,
            38544885,
            188821243,
            3613494426,
            3731654548,
            3313212038,
            3430322568,
            4082475170,
            4200115116,
            3780097726,
            3896688048,
            2668221674,
            2516901860,
            2366882550,
            2216610296,
            3141400786,
            2989552604,
            2837966542,
            2687165888,
            1202797690,
            1320957812,
            1437280870,
            1554391400,
            1669664834,
            1787304780,
            1906247262,
            2022837584,
            265905162,
            114585348,
            499347990,
            349075736,
            736970802,
            585122620,
            972512814,
            821712160,
            2595684844,
            2478443234,
            2293045232,
            2174754046,
            3196267988,
            3079546586,
            2895723464,
            2777952454,
            3537852828,
            3687994002,
            3234156416,
            3385345166,
            4142626212,
            4293295786,
            3841024952,
            3992742070,
            174567692,
            57326082,
            410887952,
            292596766,
            777231668,
            660510266,
            1011452712,
            893681702,
            1108339068,
            1258480242,
            1343618912,
            1494807662,
            1715193156,
            1865862730,
            1948373848,
            2100090966,
            2701949495,
            2818666809,
            3004591147,
            3122358053,
            2235061775,
            2352307457,
            2535604243,
            2653899549,
            3915653703,
            3764988233,
            4219352155,
            4067639125,
            3444575871,
            3294430577,
            3746175075,
            3594982253,
            836553431,
            953270745,
            600235211,
            718002117,
            367585007,
            484830689,
            133361907,
            251657213,
            2041877159,
            1891211689,
            1806599355,
            1654886325,
            1568718495,
            1418573201,
            1335535747,
            1184342925,
          ];
        function ne(i) {
          for (var b = [], I = 0; I < i.length; I += 4)
            b.push(
              (i[I] << 24) | (i[I + 1] << 16) | (i[I + 2] << 8) | i[I + 3]
            );
          return b;
        }
        var ie = function (i) {
          if (!(this instanceof ie))
            throw Error("AES must be instanitated with `new`");
          Object.defineProperty(this, "key", { value: v(i, !0) }),
            this._prepare();
        };
        (ie.prototype._prepare = function () {
          var i = Y[this.key.length];
          if (i == null)
            throw new Error("invalid key size (must be 16, 24 or 32 bytes)");
          (this._Ke = []), (this._Kd = []);
          for (var b = 0; b <= i; b++)
            this._Ke.push([0, 0, 0, 0]), this._Kd.push([0, 0, 0, 0]);
          for (
            var I = (i + 1) * 4,
              J = this.key.length / 4,
              A = ne(this.key),
              $,
              b = 0;
            b < J;
            b++
          )
            ($ = b >> 2),
              (this._Ke[$][b % 4] = A[b]),
              (this._Kd[i - $][b % 4] = A[b]);
          for (var xe = 0, be = J, ce; be < I; ) {
            if (
              ((ce = A[J - 1]),
              (A[0] ^=
                (ae[(ce >> 16) & 255] << 24) ^
                (ae[(ce >> 8) & 255] << 16) ^
                (ae[ce & 255] << 8) ^
                ae[(ce >> 24) & 255] ^
                (m[xe] << 24)),
              (xe += 1),
              J != 8)
            )
              for (var b = 1; b < J; b++) A[b] ^= A[b - 1];
            else {
              for (var b = 1; b < J / 2; b++) A[b] ^= A[b - 1];
              (ce = A[J / 2 - 1]),
                (A[J / 2] ^=
                  ae[ce & 255] ^
                  (ae[(ce >> 8) & 255] << 8) ^
                  (ae[(ce >> 16) & 255] << 16) ^
                  (ae[(ce >> 24) & 255] << 24));
              for (var b = J / 2 + 1; b < J; b++) A[b] ^= A[b - 1];
            }
            for (var b = 0, me, Se; b < J && be < I; )
              (me = be >> 2),
                (Se = be % 4),
                (this._Ke[me][Se] = A[b]),
                (this._Kd[i - me][Se] = A[b++]),
                be++;
          }
          for (var me = 1; me < i; me++)
            for (var Se = 0; Se < 4; Se++)
              (ce = this._Kd[me][Se]),
                (this._Kd[me][Se] =
                  y[(ce >> 24) & 255] ^
                  O[(ce >> 16) & 255] ^
                  R[(ce >> 8) & 255] ^
                  ee[ce & 255]);
        }),
          (ie.prototype.encrypt = function (i) {
            if (i.length != 16)
              throw new Error("invalid plaintext size (must be 16 bytes)");
            for (
              var b = this._Ke.length - 1, I = [0, 0, 0, 0], J = ne(i), A = 0;
              A < 4;
              A++
            )
              J[A] ^= this._Ke[0][A];
            for (var $ = 1; $ < b; $++) {
              for (var A = 0; A < 4; A++)
                I[A] =
                  oe[(J[A] >> 24) & 255] ^
                  V[(J[(A + 1) % 4] >> 16) & 255] ^
                  x[(J[(A + 2) % 4] >> 8) & 255] ^
                  N[J[(A + 3) % 4] & 255] ^
                  this._Ke[$][A];
              J = I.slice();
            }
            for (var xe = U(16), be, A = 0; A < 4; A++)
              (be = this._Ke[b][A]),
                (xe[4 * A] = (ae[(J[A] >> 24) & 255] ^ (be >> 24)) & 255),
                (xe[4 * A + 1] =
                  (ae[(J[(A + 1) % 4] >> 16) & 255] ^ (be >> 16)) & 255),
                (xe[4 * A + 2] =
                  (ae[(J[(A + 2) % 4] >> 8) & 255] ^ (be >> 8)) & 255),
                (xe[4 * A + 3] = (ae[J[(A + 3) % 4] & 255] ^ be) & 255);
            return xe;
          }),
          (ie.prototype.decrypt = function (i) {
            if (i.length != 16)
              throw new Error("invalid ciphertext size (must be 16 bytes)");
            for (
              var b = this._Kd.length - 1, I = [0, 0, 0, 0], J = ne(i), A = 0;
              A < 4;
              A++
            )
              J[A] ^= this._Kd[0][A];
            for (var $ = 1; $ < b; $++) {
              for (var A = 0; A < 4; A++)
                I[A] =
                  L[(J[A] >> 24) & 255] ^
                  H[(J[(A + 3) % 4] >> 16) & 255] ^
                  F[(J[(A + 2) % 4] >> 8) & 255] ^
                  n[J[(A + 1) % 4] & 255] ^
                  this._Kd[$][A];
              J = I.slice();
            }
            for (var xe = U(16), be, A = 0; A < 4; A++)
              (be = this._Kd[b][A]),
                (xe[4 * A] = (te[(J[A] >> 24) & 255] ^ (be >> 24)) & 255),
                (xe[4 * A + 1] =
                  (te[(J[(A + 3) % 4] >> 16) & 255] ^ (be >> 16)) & 255),
                (xe[4 * A + 2] =
                  (te[(J[(A + 2) % 4] >> 8) & 255] ^ (be >> 8)) & 255),
                (xe[4 * A + 3] = (te[J[(A + 1) % 4] & 255] ^ be) & 255);
            return xe;
          });
        var c = function (i) {
          if (!(this instanceof c))
            throw Error("AES must be instanitated with `new`");
          (this.description = "Electronic Code Block"),
            (this.name = "ecb"),
            (this._aes = new ie(i));
        };
        (c.prototype.encrypt = function (i) {
          if (((i = v(i)), i.length % 16 != 0))
            throw new Error(
              "invalid plaintext size (must be multiple of 16 bytes)"
            );
          for (var b = U(i.length), I = U(16), J = 0; J < i.length; J += 16)
            z(i, I, 0, J, J + 16), (I = this._aes.encrypt(I)), z(I, b, J);
          return b;
        }),
          (c.prototype.decrypt = function (i) {
            if (((i = v(i)), i.length % 16 != 0))
              throw new Error(
                "invalid ciphertext size (must be multiple of 16 bytes)"
              );
            for (var b = U(i.length), I = U(16), J = 0; J < i.length; J += 16)
              z(i, I, 0, J, J + 16), (I = this._aes.decrypt(I)), z(I, b, J);
            return b;
          });
        var E = function (i, b) {
          if (!(this instanceof E))
            throw Error("AES must be instanitated with `new`");
          if (
            ((this.description = "Cipher Block Chaining"),
            (this.name = "cbc"),
            !b)
          )
            b = U(16);
          else if (b.length != 16)
            throw new Error(
              "invalid initialation vector size (must be 16 bytes)"
            );
          (this._lastCipherblock = v(b, !0)), (this._aes = new ie(i));
        };
        (E.prototype.encrypt = function (i) {
          if (((i = v(i)), i.length % 16 != 0))
            throw new Error(
              "invalid plaintext size (must be multiple of 16 bytes)"
            );
          for (var b = U(i.length), I = U(16), J = 0; J < i.length; J += 16) {
            z(i, I, 0, J, J + 16);
            for (var A = 0; A < 16; A++) I[A] ^= this._lastCipherblock[A];
            (this._lastCipherblock = this._aes.encrypt(I)),
              z(this._lastCipherblock, b, J);
          }
          return b;
        }),
          (E.prototype.decrypt = function (i) {
            if (((i = v(i)), i.length % 16 != 0))
              throw new Error(
                "invalid ciphertext size (must be multiple of 16 bytes)"
              );
            for (var b = U(i.length), I = U(16), J = 0; J < i.length; J += 16) {
              z(i, I, 0, J, J + 16), (I = this._aes.decrypt(I));
              for (var A = 0; A < 16; A++)
                b[J + A] = I[A] ^ this._lastCipherblock[A];
              z(i, this._lastCipherblock, 0, J, J + 16);
            }
            return b;
          });
        var p = function (i, b, I) {
          if (!(this instanceof p))
            throw Error("AES must be instanitated with `new`");
          if (((this.description = "Cipher Feedback"), (this.name = "cfb"), !b))
            b = U(16);
          else if (b.length != 16)
            throw new Error(
              "invalid initialation vector size (must be 16 size)"
            );
          I || (I = 1),
            (this.segmentSize = I),
            (this._shiftRegister = v(b, !0)),
            (this._aes = new ie(i));
        };
        (p.prototype.encrypt = function (i) {
          if (i.length % this.segmentSize != 0)
            throw new Error(
              "invalid plaintext size (must be segmentSize bytes)"
            );
          for (
            var b = v(i, !0), I, J = 0;
            J < b.length;
            J += this.segmentSize
          ) {
            I = this._aes.encrypt(this._shiftRegister);
            for (var A = 0; A < this.segmentSize; A++) b[J + A] ^= I[A];
            z(this._shiftRegister, this._shiftRegister, 0, this.segmentSize),
              z(
                b,
                this._shiftRegister,
                16 - this.segmentSize,
                J,
                J + this.segmentSize
              );
          }
          return b;
        }),
          (p.prototype.decrypt = function (i) {
            if (i.length % this.segmentSize != 0)
              throw new Error(
                "invalid ciphertext size (must be segmentSize bytes)"
              );
            for (
              var b = v(i, !0), I, J = 0;
              J < b.length;
              J += this.segmentSize
            ) {
              I = this._aes.encrypt(this._shiftRegister);
              for (var A = 0; A < this.segmentSize; A++) b[J + A] ^= I[A];
              z(this._shiftRegister, this._shiftRegister, 0, this.segmentSize),
                z(
                  i,
                  this._shiftRegister,
                  16 - this.segmentSize,
                  J,
                  J + this.segmentSize
                );
            }
            return b;
          });
        var w = function (i, b) {
          if (!(this instanceof w))
            throw Error("AES must be instanitated with `new`");
          if (((this.description = "Output Feedback"), (this.name = "ofb"), !b))
            b = U(16);
          else if (b.length != 16)
            throw new Error(
              "invalid initialation vector size (must be 16 bytes)"
            );
          (this._lastPrecipher = v(b, !0)),
            (this._lastPrecipherIndex = 16),
            (this._aes = new ie(i));
        };
        (w.prototype.encrypt = function (i) {
          for (var b = v(i, !0), I = 0; I < b.length; I++)
            this._lastPrecipherIndex === 16 &&
              ((this._lastPrecipher = this._aes.encrypt(this._lastPrecipher)),
              (this._lastPrecipherIndex = 0)),
              (b[I] ^= this._lastPrecipher[this._lastPrecipherIndex++]);
          return b;
        }),
          (w.prototype.decrypt = w.prototype.encrypt);
        var g = function (i) {
          if (!(this instanceof g))
            throw Error("Counter must be instanitated with `new`");
          i !== 0 && !i && (i = 1),
            typeof i == "number"
              ? ((this._counter = U(16)), this.setValue(i))
              : this.setBytes(i);
        };
        (g.prototype.setValue = function (i) {
          if (typeof i != "number" || parseInt(i) != i)
            throw new Error("invalid counter value (must be an integer)");
          for (var b = 15; b >= 0; --b)
            (this._counter[b] = i % 256), (i = i >> 8);
        }),
          (g.prototype.setBytes = function (i) {
            if (((i = v(i, !0)), i.length != 16))
              throw new Error("invalid counter bytes size (must be 16 bytes)");
            this._counter = i;
          }),
          (g.prototype.increment = function () {
            for (var i = 15; i >= 0; i--)
              if (this._counter[i] === 255) this._counter[i] = 0;
              else {
                this._counter[i]++;
                break;
              }
          });
        var B = function (i, b) {
          if (!(this instanceof B))
            throw Error("AES must be instanitated with `new`");
          (this.description = "Counter"),
            (this.name = "ctr"),
            b instanceof g || (b = new g(b)),
            (this._counter = b),
            (this._remainingCounter = null),
            (this._remainingCounterIndex = 16),
            (this._aes = new ie(i));
        };
        (B.prototype.encrypt = function (i) {
          for (var b = v(i, !0), I = 0; I < b.length; I++)
            this._remainingCounterIndex === 16 &&
              ((this._remainingCounter = this._aes.encrypt(
                this._counter._counter
              )),
              (this._remainingCounterIndex = 0),
              this._counter.increment()),
              (b[I] ^= this._remainingCounter[this._remainingCounterIndex++]);
          return b;
        }),
          (B.prototype.decrypt = B.prototype.encrypt);
        function X(i) {
          i = v(i, !0);
          var b = 16 - (i.length % 16),
            I = U(i.length + b);
          z(i, I);
          for (var J = i.length; J < I.length; J++) I[J] = b;
          return I;
        }
        function D(i) {
          if (((i = v(i, !0)), i.length < 16))
            throw new Error("PKCS#7 invalid length");
          var b = i[i.length - 1];
          if (b > 16) throw new Error("PKCS#7 padding byte out of range");
          for (var I = i.length - b, J = 0; J < b; J++)
            if (i[I + J] !== b) throw new Error("PKCS#7 invalid padding byte");
          var A = U(I);
          return z(i, A, 0, 0, I), A;
        }
        var d = {
          AES: ie,
          Counter: g,
          ModeOfOperation: { ecb: c, cbc: E, cfb: p, ofb: w, ctr: B },
          utils: { hex: Q, utf8: G },
          padding: { pkcs7: { pad: X, strip: D } },
          _arrayTest: { coerceArray: v, createArray: U, copyArray: z },
        };
        Ae.exports = d;
      })(this);
    },
    9742: (Ae, W) => {
      "use strict";
      (W.byteLength = Y), (W.toByteArray = ae), (W.fromByteArray = V);
      for (
        var k = [],
          T = [],
          v = typeof Uint8Array != "undefined" ? Uint8Array : Array,
          U =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
          z = 0,
          G = U.length;
        z < G;
        ++z
      )
        (k[z] = U[z]), (T[U.charCodeAt(z)] = z);
      (T["-".charCodeAt(0)] = 62), (T["_".charCodeAt(0)] = 63);
      function Q(x) {
        var N = x.length;
        if (N % 4 > 0)
          throw new Error("Invalid string. Length must be a multiple of 4");
        var L = x.indexOf("=");
        L === -1 && (L = N);
        var H = L === N ? 0 : 4 - (L % 4);
        return [L, H];
      }
      function Y(x) {
        var N = Q(x),
          L = N[0],
          H = N[1];
        return ((L + H) * 3) / 4 - H;
      }
      function m(x, N, L) {
        return ((N + L) * 3) / 4 - L;
      }
      function ae(x) {
        var N,
          L = Q(x),
          H = L[0],
          F = L[1],
          n = new v(m(x, H, F)),
          y = 0,
          O = F > 0 ? H - 4 : H,
          R;
        for (R = 0; R < O; R += 4)
          (N =
            (T[x.charCodeAt(R)] << 18) |
            (T[x.charCodeAt(R + 1)] << 12) |
            (T[x.charCodeAt(R + 2)] << 6) |
            T[x.charCodeAt(R + 3)]),
            (n[y++] = (N >> 16) & 255),
            (n[y++] = (N >> 8) & 255),
            (n[y++] = N & 255);
        return (
          F === 2 &&
            ((N = (T[x.charCodeAt(R)] << 2) | (T[x.charCodeAt(R + 1)] >> 4)),
            (n[y++] = N & 255)),
          F === 1 &&
            ((N =
              (T[x.charCodeAt(R)] << 10) |
              (T[x.charCodeAt(R + 1)] << 4) |
              (T[x.charCodeAt(R + 2)] >> 2)),
            (n[y++] = (N >> 8) & 255),
            (n[y++] = N & 255)),
          n
        );
      }
      function te(x) {
        return (
          k[(x >> 18) & 63] + k[(x >> 12) & 63] + k[(x >> 6) & 63] + k[x & 63]
        );
      }
      function oe(x, N, L) {
        for (var H, F = [], n = N; n < L; n += 3)
          (H =
            ((x[n] << 16) & 16711680) +
            ((x[n + 1] << 8) & 65280) +
            (x[n + 2] & 255)),
            F.push(te(H));
        return F.join("");
      }
      function V(x) {
        for (
          var N, L = x.length, H = L % 3, F = [], n = 16383, y = 0, O = L - H;
          y < O;
          y += n
        )
          F.push(oe(x, y, y + n > O ? O : y + n));
        return (
          H === 1
            ? ((N = x[L - 1]), F.push(k[N >> 2] + k[(N << 4) & 63] + "=="))
            : H === 2 &&
              ((N = (x[L - 2] << 8) + x[L - 1]),
              F.push(k[N >> 10] + k[(N >> 4) & 63] + k[(N << 2) & 63] + "=")),
          F.join("")
        );
      }
    },
    8764: (Ae, W, k) => {
      "use strict";
      var T;
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <https://feross.org>
       * @license  MIT
       */ const v = k(9742),
        U = k(645),
        z =
          typeof Symbol == "function" && typeof Symbol.for == "function"
            ? Symbol.for("nodejs.util.inspect.custom")
            : null;
      (W.lW = m), (T = y), (W.h2 = 50);
      const G = 2147483647;
      (T = G),
        (m.TYPED_ARRAY_SUPPORT = Q()),
        !m.TYPED_ARRAY_SUPPORT &&
          typeof console != "undefined" &&
          typeof console.error == "function" &&
          console.error(
            "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
          );
      function Q() {
        try {
          const a = new Uint8Array(1),
            e = {
              foo: function () {
                return 42;
              },
            };
          return (
            Object.setPrototypeOf(e, Uint8Array.prototype),
            Object.setPrototypeOf(a, e),
            a.foo() === 42
          );
        } catch (a) {
          return !1;
        }
      }
      Object.defineProperty(m.prototype, "parent", {
        enumerable: !0,
        get: function () {
          if (!!m.isBuffer(this)) return this.buffer;
        },
      }),
        Object.defineProperty(m.prototype, "offset", {
          enumerable: !0,
          get: function () {
            if (!!m.isBuffer(this)) return this.byteOffset;
          },
        });
      function Y(a) {
        if (a > G)
          throw new RangeError(
            'The value "' + a + '" is invalid for option "size"'
          );
        const e = new Uint8Array(a);
        return Object.setPrototypeOf(e, m.prototype), e;
      }
      function m(a, e, r) {
        if (typeof a == "number") {
          if (typeof e == "string")
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          return V(a);
        }
        return ae(a, e, r);
      }
      m.poolSize = 8192;
      function ae(a, e, r) {
        if (typeof a == "string") return x(a, e);
        if (ArrayBuffer.isView(a)) return L(a);
        if (a == null)
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
              typeof a
          );
        if (
          t(a, ArrayBuffer) ||
          (a && t(a.buffer, ArrayBuffer)) ||
          (typeof SharedArrayBuffer != "undefined" &&
            (t(a, SharedArrayBuffer) || (a && t(a.buffer, SharedArrayBuffer))))
        )
          return H(a, e, r);
        if (typeof a == "number")
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        const o = a.valueOf && a.valueOf();
        if (o != null && o !== a) return m.from(o, e, r);
        const s = F(a);
        if (s) return s;
        if (
          typeof Symbol != "undefined" &&
          Symbol.toPrimitive != null &&
          typeof a[Symbol.toPrimitive] == "function"
        )
          return m.from(a[Symbol.toPrimitive]("string"), e, r);
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
            typeof a
        );
      }
      (m.from = function (a, e, r) {
        return ae(a, e, r);
      }),
        Object.setPrototypeOf(m.prototype, Uint8Array.prototype),
        Object.setPrototypeOf(m, Uint8Array);
      function te(a) {
        if (typeof a != "number")
          throw new TypeError('"size" argument must be of type number');
        if (a < 0)
          throw new RangeError(
            'The value "' + a + '" is invalid for option "size"'
          );
      }
      function oe(a, e, r) {
        return (
          te(a),
          a <= 0
            ? Y(a)
            : e !== void 0
            ? typeof r == "string"
              ? Y(a).fill(e, r)
              : Y(a).fill(e)
            : Y(a)
        );
      }
      m.alloc = function (a, e, r) {
        return oe(a, e, r);
      };
      function V(a) {
        return te(a), Y(a < 0 ? 0 : n(a) | 0);
      }
      (m.allocUnsafe = function (a) {
        return V(a);
      }),
        (m.allocUnsafeSlow = function (a) {
          return V(a);
        });
      function x(a, e) {
        if (
          ((typeof e != "string" || e === "") && (e = "utf8"), !m.isEncoding(e))
        )
          throw new TypeError("Unknown encoding: " + e);
        const r = O(a, e) | 0;
        let o = Y(r);
        const s = o.write(a, e);
        return s !== r && (o = o.slice(0, s)), o;
      }
      function N(a) {
        const e = a.length < 0 ? 0 : n(a.length) | 0,
          r = Y(e);
        for (let o = 0; o < e; o += 1) r[o] = a[o] & 255;
        return r;
      }
      function L(a) {
        if (t(a, Uint8Array)) {
          const e = new Uint8Array(a);
          return H(e.buffer, e.byteOffset, e.byteLength);
        }
        return N(a);
      }
      function H(a, e, r) {
        if (e < 0 || a.byteLength < e)
          throw new RangeError('"offset" is outside of buffer bounds');
        if (a.byteLength < e + (r || 0))
          throw new RangeError('"length" is outside of buffer bounds');
        let o;
        return (
          e === void 0 && r === void 0
            ? (o = new Uint8Array(a))
            : r === void 0
            ? (o = new Uint8Array(a, e))
            : (o = new Uint8Array(a, e, r)),
          Object.setPrototypeOf(o, m.prototype),
          o
        );
      }
      function F(a) {
        if (m.isBuffer(a)) {
          const e = n(a.length) | 0,
            r = Y(e);
          return r.length === 0 || a.copy(r, 0, 0, e), r;
        }
        if (a.length !== void 0)
          return typeof a.length != "number" || u(a.length) ? Y(0) : N(a);
        if (a.type === "Buffer" && Array.isArray(a.data)) return N(a.data);
      }
      function n(a) {
        if (a >= G)
          throw new RangeError(
            "Attempt to allocate Buffer larger than maximum size: 0x" +
              G.toString(16) +
              " bytes"
          );
        return a | 0;
      }
      function y(a) {
        return +a != a && (a = 0), m.alloc(+a);
      }
      (m.isBuffer = function (e) {
        return e != null && e._isBuffer === !0 && e !== m.prototype;
      }),
        (m.compare = function (e, r) {
          if (
            (t(e, Uint8Array) && (e = m.from(e, e.offset, e.byteLength)),
            t(r, Uint8Array) && (r = m.from(r, r.offset, r.byteLength)),
            !m.isBuffer(e) || !m.isBuffer(r))
          )
            throw new TypeError(
              'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
            );
          if (e === r) return 0;
          let o = e.length,
            s = r.length;
          for (let f = 0, S = Math.min(o, s); f < S; ++f)
            if (e[f] !== r[f]) {
              (o = e[f]), (s = r[f]);
              break;
            }
          return o < s ? -1 : s < o ? 1 : 0;
        }),
        (m.isEncoding = function (e) {
          switch (String(e).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return !0;
            default:
              return !1;
          }
        }),
        (m.concat = function (e, r) {
          if (!Array.isArray(e))
            throw new TypeError('"list" argument must be an Array of Buffers');
          if (e.length === 0) return m.alloc(0);
          let o;
          if (r === void 0)
            for (r = 0, o = 0; o < e.length; ++o) r += e[o].length;
          const s = m.allocUnsafe(r);
          let f = 0;
          for (o = 0; o < e.length; ++o) {
            let S = e[o];
            if (t(S, Uint8Array))
              f + S.length > s.length
                ? (m.isBuffer(S) || (S = m.from(S)), S.copy(s, f))
                : Uint8Array.prototype.set.call(s, S, f);
            else if (m.isBuffer(S)) S.copy(s, f);
            else
              throw new TypeError(
                '"list" argument must be an Array of Buffers'
              );
            f += S.length;
          }
          return s;
        });
      function O(a, e) {
        if (m.isBuffer(a)) return a.length;
        if (ArrayBuffer.isView(a) || t(a, ArrayBuffer)) return a.byteLength;
        if (typeof a != "string")
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
              typeof a
          );
        const r = a.length,
          o = arguments.length > 2 && arguments[2] === !0;
        if (!o && r === 0) return 0;
        let s = !1;
        for (;;)
          switch (e) {
            case "ascii":
            case "latin1":
            case "binary":
              return r;
            case "utf8":
            case "utf-8":
              return ye(a).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return r * 2;
            case "hex":
              return r >>> 1;
            case "base64":
              return Fe(a).length;
            default:
              if (s) return o ? -1 : ye(a).length;
              (e = ("" + e).toLowerCase()), (s = !0);
          }
      }
      m.byteLength = O;
      function R(a, e, r) {
        let o = !1;
        if (
          ((e === void 0 || e < 0) && (e = 0),
          e > this.length ||
            ((r === void 0 || r > this.length) && (r = this.length), r <= 0) ||
            ((r >>>= 0), (e >>>= 0), r <= e))
        )
          return "";
        for (a || (a = "utf8"); ; )
          switch (a) {
            case "hex":
              return I(this, e, r);
            case "utf8":
            case "utf-8":
              return X(this, e, r);
            case "ascii":
              return i(this, e, r);
            case "latin1":
            case "binary":
              return b(this, e, r);
            case "base64":
              return B(this, e, r);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return J(this, e, r);
            default:
              if (o) throw new TypeError("Unknown encoding: " + a);
              (a = (a + "").toLowerCase()), (o = !0);
          }
      }
      m.prototype._isBuffer = !0;
      function ee(a, e, r) {
        const o = a[e];
        (a[e] = a[r]), (a[r] = o);
      }
      (m.prototype.swap16 = function () {
        const e = this.length;
        if (e % 2 != 0)
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (let r = 0; r < e; r += 2) ee(this, r, r + 1);
        return this;
      }),
        (m.prototype.swap32 = function () {
          const e = this.length;
          if (e % 4 != 0)
            throw new RangeError("Buffer size must be a multiple of 32-bits");
          for (let r = 0; r < e; r += 4)
            ee(this, r, r + 3), ee(this, r + 1, r + 2);
          return this;
        }),
        (m.prototype.swap64 = function () {
          const e = this.length;
          if (e % 8 != 0)
            throw new RangeError("Buffer size must be a multiple of 64-bits");
          for (let r = 0; r < e; r += 8)
            ee(this, r, r + 7),
              ee(this, r + 1, r + 6),
              ee(this, r + 2, r + 5),
              ee(this, r + 3, r + 4);
          return this;
        }),
        (m.prototype.toString = function () {
          const e = this.length;
          return e === 0
            ? ""
            : arguments.length === 0
            ? X(this, 0, e)
            : R.apply(this, arguments);
        }),
        (m.prototype.toLocaleString = m.prototype.toString),
        (m.prototype.equals = function (e) {
          if (!m.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
          return this === e ? !0 : m.compare(this, e) === 0;
        }),
        (m.prototype.inspect = function () {
          let e = "";
          const r = W.h2;
          return (
            (e = this.toString("hex", 0, r)
              .replace(/(.{2})/g, "$1 ")
              .trim()),
            this.length > r && (e += " ... "),
            "<Buffer " + e + ">"
          );
        }),
        z && (m.prototype[z] = m.prototype.inspect),
        (m.prototype.compare = function (e, r, o, s, f) {
          if (
            (t(e, Uint8Array) && (e = m.from(e, e.offset, e.byteLength)),
            !m.isBuffer(e))
          )
            throw new TypeError(
              'The "target" argument must be one of type Buffer or Uint8Array. Received type ' +
                typeof e
            );
          if (
            (r === void 0 && (r = 0),
            o === void 0 && (o = e ? e.length : 0),
            s === void 0 && (s = 0),
            f === void 0 && (f = this.length),
            r < 0 || o > e.length || s < 0 || f > this.length)
          )
            throw new RangeError("out of range index");
          if (s >= f && r >= o) return 0;
          if (s >= f) return -1;
          if (r >= o) return 1;
          if (((r >>>= 0), (o >>>= 0), (s >>>= 0), (f >>>= 0), this === e))
            return 0;
          let S = f - s,
            j = o - r;
          const q = Math.min(S, j),
            re = this.slice(s, f),
            le = e.slice(r, o);
          for (let fe = 0; fe < q; ++fe)
            if (re[fe] !== le[fe]) {
              (S = re[fe]), (j = le[fe]);
              break;
            }
          return S < j ? -1 : j < S ? 1 : 0;
        });
      function ne(a, e, r, o, s) {
        if (a.length === 0) return -1;
        if (
          (typeof r == "string"
            ? ((o = r), (r = 0))
            : r > 2147483647
            ? (r = 2147483647)
            : r < -2147483648 && (r = -2147483648),
          (r = +r),
          u(r) && (r = s ? 0 : a.length - 1),
          r < 0 && (r = a.length + r),
          r >= a.length)
        ) {
          if (s) return -1;
          r = a.length - 1;
        } else if (r < 0)
          if (s) r = 0;
          else return -1;
        if ((typeof e == "string" && (e = m.from(e, o)), m.isBuffer(e)))
          return e.length === 0 ? -1 : ie(a, e, r, o, s);
        if (typeof e == "number")
          return (
            (e = e & 255),
            typeof Uint8Array.prototype.indexOf == "function"
              ? s
                ? Uint8Array.prototype.indexOf.call(a, e, r)
                : Uint8Array.prototype.lastIndexOf.call(a, e, r)
              : ie(a, [e], r, o, s)
          );
        throw new TypeError("val must be string, number or Buffer");
      }
      function ie(a, e, r, o, s) {
        let f = 1,
          S = a.length,
          j = e.length;
        if (
          o !== void 0 &&
          ((o = String(o).toLowerCase()),
          o === "ucs2" || o === "ucs-2" || o === "utf16le" || o === "utf-16le")
        ) {
          if (a.length < 2 || e.length < 2) return -1;
          (f = 2), (S /= 2), (j /= 2), (r /= 2);
        }
        function q(le, fe) {
          return f === 1 ? le[fe] : le.readUInt16BE(fe * f);
        }
        let re;
        if (s) {
          let le = -1;
          for (re = r; re < S; re++)
            if (q(a, re) === q(e, le === -1 ? 0 : re - le)) {
              if ((le === -1 && (le = re), re - le + 1 === j)) return le * f;
            } else le !== -1 && (re -= re - le), (le = -1);
        } else
          for (r + j > S && (r = S - j), re = r; re >= 0; re--) {
            let le = !0;
            for (let fe = 0; fe < j; fe++)
              if (q(a, re + fe) !== q(e, fe)) {
                le = !1;
                break;
              }
            if (le) return re;
          }
        return -1;
      }
      (m.prototype.includes = function (e, r, o) {
        return this.indexOf(e, r, o) !== -1;
      }),
        (m.prototype.indexOf = function (e, r, o) {
          return ne(this, e, r, o, !0);
        }),
        (m.prototype.lastIndexOf = function (e, r, o) {
          return ne(this, e, r, o, !1);
        });
      function c(a, e, r, o) {
        r = Number(r) || 0;
        const s = a.length - r;
        o ? ((o = Number(o)), o > s && (o = s)) : (o = s);
        const f = e.length;
        o > f / 2 && (o = f / 2);
        let S;
        for (S = 0; S < o; ++S) {
          const j = parseInt(e.substr(S * 2, 2), 16);
          if (u(j)) return S;
          a[r + S] = j;
        }
        return S;
      }
      function E(a, e, r, o) {
        return M(ye(e, a.length - r), a, r, o);
      }
      function p(a, e, r, o) {
        return M(Oe(e), a, r, o);
      }
      function w(a, e, r, o) {
        return M(Fe(e), a, r, o);
      }
      function g(a, e, r, o) {
        return M(we(e, a.length - r), a, r, o);
      }
      (m.prototype.write = function (e, r, o, s) {
        if (r === void 0) (s = "utf8"), (o = this.length), (r = 0);
        else if (o === void 0 && typeof r == "string")
          (s = r), (o = this.length), (r = 0);
        else if (isFinite(r))
          (r = r >>> 0),
            isFinite(o)
              ? ((o = o >>> 0), s === void 0 && (s = "utf8"))
              : ((s = o), (o = void 0));
        else
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        const f = this.length - r;
        if (
          ((o === void 0 || o > f) && (o = f),
          (e.length > 0 && (o < 0 || r < 0)) || r > this.length)
        )
          throw new RangeError("Attempt to write outside buffer bounds");
        s || (s = "utf8");
        let S = !1;
        for (;;)
          switch (s) {
            case "hex":
              return c(this, e, r, o);
            case "utf8":
            case "utf-8":
              return E(this, e, r, o);
            case "ascii":
            case "latin1":
            case "binary":
              return p(this, e, r, o);
            case "base64":
              return w(this, e, r, o);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return g(this, e, r, o);
            default:
              if (S) throw new TypeError("Unknown encoding: " + s);
              (s = ("" + s).toLowerCase()), (S = !0);
          }
      }),
        (m.prototype.toJSON = function () {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0),
          };
        });
      function B(a, e, r) {
        return e === 0 && r === a.length
          ? v.fromByteArray(a)
          : v.fromByteArray(a.slice(e, r));
      }
      function X(a, e, r) {
        r = Math.min(a.length, r);
        const o = [];
        let s = e;
        for (; s < r; ) {
          const f = a[s];
          let S = null,
            j = f > 239 ? 4 : f > 223 ? 3 : f > 191 ? 2 : 1;
          if (s + j <= r) {
            let q, re, le, fe;
            switch (j) {
              case 1:
                f < 128 && (S = f);
                break;
              case 2:
                (q = a[s + 1]),
                  (q & 192) == 128 &&
                    ((fe = ((f & 31) << 6) | (q & 63)), fe > 127 && (S = fe));
                break;
              case 3:
                (q = a[s + 1]),
                  (re = a[s + 2]),
                  (q & 192) == 128 &&
                    (re & 192) == 128 &&
                    ((fe = ((f & 15) << 12) | ((q & 63) << 6) | (re & 63)),
                    fe > 2047 && (fe < 55296 || fe > 57343) && (S = fe));
                break;
              case 4:
                (q = a[s + 1]),
                  (re = a[s + 2]),
                  (le = a[s + 3]),
                  (q & 192) == 128 &&
                    (re & 192) == 128 &&
                    (le & 192) == 128 &&
                    ((fe =
                      ((f & 15) << 18) |
                      ((q & 63) << 12) |
                      ((re & 63) << 6) |
                      (le & 63)),
                    fe > 65535 && fe < 1114112 && (S = fe));
            }
          }
          S === null
            ? ((S = 65533), (j = 1))
            : S > 65535 &&
              ((S -= 65536),
              o.push(((S >>> 10) & 1023) | 55296),
              (S = 56320 | (S & 1023))),
            o.push(S),
            (s += j);
        }
        return d(o);
      }
      const D = 4096;
      function d(a) {
        const e = a.length;
        if (e <= D) return String.fromCharCode.apply(String, a);
        let r = "",
          o = 0;
        for (; o < e; )
          r += String.fromCharCode.apply(String, a.slice(o, (o += D)));
        return r;
      }
      function i(a, e, r) {
        let o = "";
        r = Math.min(a.length, r);
        for (let s = e; s < r; ++s) o += String.fromCharCode(a[s] & 127);
        return o;
      }
      function b(a, e, r) {
        let o = "";
        r = Math.min(a.length, r);
        for (let s = e; s < r; ++s) o += String.fromCharCode(a[s]);
        return o;
      }
      function I(a, e, r) {
        const o = a.length;
        (!e || e < 0) && (e = 0), (!r || r < 0 || r > o) && (r = o);
        let s = "";
        for (let f = e; f < r; ++f) s += h[a[f]];
        return s;
      }
      function J(a, e, r) {
        const o = a.slice(e, r);
        let s = "";
        for (let f = 0; f < o.length - 1; f += 2)
          s += String.fromCharCode(o[f] + o[f + 1] * 256);
        return s;
      }
      m.prototype.slice = function (e, r) {
        const o = this.length;
        (e = ~~e),
          (r = r === void 0 ? o : ~~r),
          e < 0 ? ((e += o), e < 0 && (e = 0)) : e > o && (e = o),
          r < 0 ? ((r += o), r < 0 && (r = 0)) : r > o && (r = o),
          r < e && (r = e);
        const s = this.subarray(e, r);
        return Object.setPrototypeOf(s, m.prototype), s;
      };
      function A(a, e, r) {
        if (a % 1 != 0 || a < 0) throw new RangeError("offset is not uint");
        if (a + e > r)
          throw new RangeError("Trying to access beyond buffer length");
      }
      (m.prototype.readUintLE = m.prototype.readUIntLE = function (e, r, o) {
        (e = e >>> 0), (r = r >>> 0), o || A(e, r, this.length);
        let s = this[e],
          f = 1,
          S = 0;
        for (; ++S < r && (f *= 256); ) s += this[e + S] * f;
        return s;
      }),
        (m.prototype.readUintBE = m.prototype.readUIntBE = function (e, r, o) {
          (e = e >>> 0), (r = r >>> 0), o || A(e, r, this.length);
          let s = this[e + --r],
            f = 1;
          for (; r > 0 && (f *= 256); ) s += this[e + --r] * f;
          return s;
        }),
        (m.prototype.readUint8 = m.prototype.readUInt8 = function (e, r) {
          return (e = e >>> 0), r || A(e, 1, this.length), this[e];
        }),
        (m.prototype.readUint16LE = m.prototype.readUInt16LE = function (e, r) {
          return (
            (e = e >>> 0),
            r || A(e, 2, this.length),
            this[e] | (this[e + 1] << 8)
          );
        }),
        (m.prototype.readUint16BE = m.prototype.readUInt16BE = function (e, r) {
          return (
            (e = e >>> 0),
            r || A(e, 2, this.length),
            (this[e] << 8) | this[e + 1]
          );
        }),
        (m.prototype.readUint32LE = m.prototype.readUInt32LE = function (e, r) {
          return (
            (e = e >>> 0),
            r || A(e, 4, this.length),
            (this[e] | (this[e + 1] << 8) | (this[e + 2] << 16)) +
              this[e + 3] * 16777216
          );
        }),
        (m.prototype.readUint32BE = m.prototype.readUInt32BE = function (e, r) {
          return (
            (e = e >>> 0),
            r || A(e, 4, this.length),
            this[e] * 16777216 +
              ((this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3])
          );
        }),
        (m.prototype.readBigUInt64LE = P(function (e) {
          (e = e >>> 0), De(e, "offset");
          const r = this[e],
            o = this[e + 7];
          (r === void 0 || o === void 0) && Je(e, this.length - 8);
          const s =
              r +
              this[++e] * 2 ** 8 +
              this[++e] * 2 ** 16 +
              this[++e] * 2 ** 24,
            f =
              this[++e] +
              this[++e] * 2 ** 8 +
              this[++e] * 2 ** 16 +
              o * 2 ** 24;
          return BigInt(s) + (BigInt(f) << BigInt(32));
        })),
        (m.prototype.readBigUInt64BE = P(function (e) {
          (e = e >>> 0), De(e, "offset");
          const r = this[e],
            o = this[e + 7];
          (r === void 0 || o === void 0) && Je(e, this.length - 8);
          const s =
              r * 2 ** 24 +
              this[++e] * 2 ** 16 +
              this[++e] * 2 ** 8 +
              this[++e],
            f =
              this[++e] * 2 ** 24 +
              this[++e] * 2 ** 16 +
              this[++e] * 2 ** 8 +
              o;
          return (BigInt(s) << BigInt(32)) + BigInt(f);
        })),
        (m.prototype.readIntLE = function (e, r, o) {
          (e = e >>> 0), (r = r >>> 0), o || A(e, r, this.length);
          let s = this[e],
            f = 1,
            S = 0;
          for (; ++S < r && (f *= 256); ) s += this[e + S] * f;
          return (f *= 128), s >= f && (s -= Math.pow(2, 8 * r)), s;
        }),
        (m.prototype.readIntBE = function (e, r, o) {
          (e = e >>> 0), (r = r >>> 0), o || A(e, r, this.length);
          let s = r,
            f = 1,
            S = this[e + --s];
          for (; s > 0 && (f *= 256); ) S += this[e + --s] * f;
          return (f *= 128), S >= f && (S -= Math.pow(2, 8 * r)), S;
        }),
        (m.prototype.readInt8 = function (e, r) {
          return (
            (e = e >>> 0),
            r || A(e, 1, this.length),
            this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e]
          );
        }),
        (m.prototype.readInt16LE = function (e, r) {
          (e = e >>> 0), r || A(e, 2, this.length);
          const o = this[e] | (this[e + 1] << 8);
          return o & 32768 ? o | 4294901760 : o;
        }),
        (m.prototype.readInt16BE = function (e, r) {
          (e = e >>> 0), r || A(e, 2, this.length);
          const o = this[e + 1] | (this[e] << 8);
          return o & 32768 ? o | 4294901760 : o;
        }),
        (m.prototype.readInt32LE = function (e, r) {
          return (
            (e = e >>> 0),
            r || A(e, 4, this.length),
            this[e] |
              (this[e + 1] << 8) |
              (this[e + 2] << 16) |
              (this[e + 3] << 24)
          );
        }),
        (m.prototype.readInt32BE = function (e, r) {
          return (
            (e = e >>> 0),
            r || A(e, 4, this.length),
            (this[e] << 24) |
              (this[e + 1] << 16) |
              (this[e + 2] << 8) |
              this[e + 3]
          );
        }),
        (m.prototype.readBigInt64LE = P(function (e) {
          (e = e >>> 0), De(e, "offset");
          const r = this[e],
            o = this[e + 7];
          (r === void 0 || o === void 0) && Je(e, this.length - 8);
          const s =
            this[e + 4] +
            this[e + 5] * 2 ** 8 +
            this[e + 6] * 2 ** 16 +
            (o << 24);
          return (
            (BigInt(s) << BigInt(32)) +
            BigInt(
              r + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24
            )
          );
        })),
        (m.prototype.readBigInt64BE = P(function (e) {
          (e = e >>> 0), De(e, "offset");
          const r = this[e],
            o = this[e + 7];
          (r === void 0 || o === void 0) && Je(e, this.length - 8);
          const s =
            (r << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
          return (
            (BigInt(s) << BigInt(32)) +
            BigInt(
              this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + o
            )
          );
        })),
        (m.prototype.readFloatLE = function (e, r) {
          return (
            (e = e >>> 0), r || A(e, 4, this.length), U.read(this, e, !0, 23, 4)
          );
        }),
        (m.prototype.readFloatBE = function (e, r) {
          return (
            (e = e >>> 0), r || A(e, 4, this.length), U.read(this, e, !1, 23, 4)
          );
        }),
        (m.prototype.readDoubleLE = function (e, r) {
          return (
            (e = e >>> 0), r || A(e, 8, this.length), U.read(this, e, !0, 52, 8)
          );
        }),
        (m.prototype.readDoubleBE = function (e, r) {
          return (
            (e = e >>> 0), r || A(e, 8, this.length), U.read(this, e, !1, 52, 8)
          );
        });
      function $(a, e, r, o, s, f) {
        if (!m.isBuffer(a))
          throw new TypeError('"buffer" argument must be a Buffer instance');
        if (e > s || e < f)
          throw new RangeError('"value" argument is out of bounds');
        if (r + o > a.length) throw new RangeError("Index out of range");
      }
      (m.prototype.writeUintLE = m.prototype.writeUIntLE = function (
        e,
        r,
        o,
        s
      ) {
        if (((e = +e), (r = r >>> 0), (o = o >>> 0), !s)) {
          const j = Math.pow(2, 8 * o) - 1;
          $(this, e, r, o, j, 0);
        }
        let f = 1,
          S = 0;
        for (this[r] = e & 255; ++S < o && (f *= 256); )
          this[r + S] = (e / f) & 255;
        return r + o;
      }),
        (m.prototype.writeUintBE = m.prototype.writeUIntBE = function (
          e,
          r,
          o,
          s
        ) {
          if (((e = +e), (r = r >>> 0), (o = o >>> 0), !s)) {
            const j = Math.pow(2, 8 * o) - 1;
            $(this, e, r, o, j, 0);
          }
          let f = o - 1,
            S = 1;
          for (this[r + f] = e & 255; --f >= 0 && (S *= 256); )
            this[r + f] = (e / S) & 255;
          return r + o;
        }),
        (m.prototype.writeUint8 = m.prototype.writeUInt8 = function (e, r, o) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 1, 255, 0),
            (this[r] = e & 255),
            r + 1
          );
        }),
        (m.prototype.writeUint16LE = m.prototype.writeUInt16LE = function (
          e,
          r,
          o
        ) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 2, 65535, 0),
            (this[r] = e & 255),
            (this[r + 1] = e >>> 8),
            r + 2
          );
        }),
        (m.prototype.writeUint16BE = m.prototype.writeUInt16BE = function (
          e,
          r,
          o
        ) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 2, 65535, 0),
            (this[r] = e >>> 8),
            (this[r + 1] = e & 255),
            r + 2
          );
        }),
        (m.prototype.writeUint32LE = m.prototype.writeUInt32LE = function (
          e,
          r,
          o
        ) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 4, 4294967295, 0),
            (this[r + 3] = e >>> 24),
            (this[r + 2] = e >>> 16),
            (this[r + 1] = e >>> 8),
            (this[r] = e & 255),
            r + 4
          );
        }),
        (m.prototype.writeUint32BE = m.prototype.writeUInt32BE = function (
          e,
          r,
          o
        ) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 4, 4294967295, 0),
            (this[r] = e >>> 24),
            (this[r + 1] = e >>> 16),
            (this[r + 2] = e >>> 8),
            (this[r + 3] = e & 255),
            r + 4
          );
        });
      function xe(a, e, r, o, s) {
        Pe(e, o, s, a, r, 7);
        let f = Number(e & BigInt(4294967295));
        (a[r++] = f),
          (f = f >> 8),
          (a[r++] = f),
          (f = f >> 8),
          (a[r++] = f),
          (f = f >> 8),
          (a[r++] = f);
        let S = Number((e >> BigInt(32)) & BigInt(4294967295));
        return (
          (a[r++] = S),
          (S = S >> 8),
          (a[r++] = S),
          (S = S >> 8),
          (a[r++] = S),
          (S = S >> 8),
          (a[r++] = S),
          r
        );
      }
      function be(a, e, r, o, s) {
        Pe(e, o, s, a, r, 7);
        let f = Number(e & BigInt(4294967295));
        (a[r + 7] = f),
          (f = f >> 8),
          (a[r + 6] = f),
          (f = f >> 8),
          (a[r + 5] = f),
          (f = f >> 8),
          (a[r + 4] = f);
        let S = Number((e >> BigInt(32)) & BigInt(4294967295));
        return (
          (a[r + 3] = S),
          (S = S >> 8),
          (a[r + 2] = S),
          (S = S >> 8),
          (a[r + 1] = S),
          (S = S >> 8),
          (a[r] = S),
          r + 8
        );
      }
      (m.prototype.writeBigUInt64LE = P(function (e, r = 0) {
        return xe(this, e, r, BigInt(0), BigInt("0xffffffffffffffff"));
      })),
        (m.prototype.writeBigUInt64BE = P(function (e, r = 0) {
          return be(this, e, r, BigInt(0), BigInt("0xffffffffffffffff"));
        })),
        (m.prototype.writeIntLE = function (e, r, o, s) {
          if (((e = +e), (r = r >>> 0), !s)) {
            const q = Math.pow(2, 8 * o - 1);
            $(this, e, r, o, q - 1, -q);
          }
          let f = 0,
            S = 1,
            j = 0;
          for (this[r] = e & 255; ++f < o && (S *= 256); )
            e < 0 && j === 0 && this[r + f - 1] !== 0 && (j = 1),
              (this[r + f] = (((e / S) >> 0) - j) & 255);
          return r + o;
        }),
        (m.prototype.writeIntBE = function (e, r, o, s) {
          if (((e = +e), (r = r >>> 0), !s)) {
            const q = Math.pow(2, 8 * o - 1);
            $(this, e, r, o, q - 1, -q);
          }
          let f = o - 1,
            S = 1,
            j = 0;
          for (this[r + f] = e & 255; --f >= 0 && (S *= 256); )
            e < 0 && j === 0 && this[r + f + 1] !== 0 && (j = 1),
              (this[r + f] = (((e / S) >> 0) - j) & 255);
          return r + o;
        }),
        (m.prototype.writeInt8 = function (e, r, o) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 1, 127, -128),
            e < 0 && (e = 255 + e + 1),
            (this[r] = e & 255),
            r + 1
          );
        }),
        (m.prototype.writeInt16LE = function (e, r, o) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 2, 32767, -32768),
            (this[r] = e & 255),
            (this[r + 1] = e >>> 8),
            r + 2
          );
        }),
        (m.prototype.writeInt16BE = function (e, r, o) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 2, 32767, -32768),
            (this[r] = e >>> 8),
            (this[r + 1] = e & 255),
            r + 2
          );
        }),
        (m.prototype.writeInt32LE = function (e, r, o) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 4, 2147483647, -2147483648),
            (this[r] = e & 255),
            (this[r + 1] = e >>> 8),
            (this[r + 2] = e >>> 16),
            (this[r + 3] = e >>> 24),
            r + 4
          );
        }),
        (m.prototype.writeInt32BE = function (e, r, o) {
          return (
            (e = +e),
            (r = r >>> 0),
            o || $(this, e, r, 4, 2147483647, -2147483648),
            e < 0 && (e = 4294967295 + e + 1),
            (this[r] = e >>> 24),
            (this[r + 1] = e >>> 16),
            (this[r + 2] = e >>> 8),
            (this[r + 3] = e & 255),
            r + 4
          );
        }),
        (m.prototype.writeBigInt64LE = P(function (e, r = 0) {
          return xe(
            this,
            e,
            r,
            -BigInt("0x8000000000000000"),
            BigInt("0x7fffffffffffffff")
          );
        })),
        (m.prototype.writeBigInt64BE = P(function (e, r = 0) {
          return be(
            this,
            e,
            r,
            -BigInt("0x8000000000000000"),
            BigInt("0x7fffffffffffffff")
          );
        }));
      function ce(a, e, r, o, s, f) {
        if (r + o > a.length) throw new RangeError("Index out of range");
        if (r < 0) throw new RangeError("Index out of range");
      }
      function me(a, e, r, o, s) {
        return (
          (e = +e),
          (r = r >>> 0),
          s || ce(a, e, r, 4, 34028234663852886e22, -34028234663852886e22),
          U.write(a, e, r, o, 23, 4),
          r + 4
        );
      }
      (m.prototype.writeFloatLE = function (e, r, o) {
        return me(this, e, r, !0, o);
      }),
        (m.prototype.writeFloatBE = function (e, r, o) {
          return me(this, e, r, !1, o);
        });
      function Se(a, e, r, o, s) {
        return (
          (e = +e),
          (r = r >>> 0),
          s || ce(a, e, r, 8, 17976931348623157e292, -17976931348623157e292),
          U.write(a, e, r, o, 52, 8),
          r + 8
        );
      }
      (m.prototype.writeDoubleLE = function (e, r, o) {
        return Se(this, e, r, !0, o);
      }),
        (m.prototype.writeDoubleBE = function (e, r, o) {
          return Se(this, e, r, !1, o);
        }),
        (m.prototype.copy = function (e, r, o, s) {
          if (!m.isBuffer(e))
            throw new TypeError("argument should be a Buffer");
          if (
            (o || (o = 0),
            !s && s !== 0 && (s = this.length),
            r >= e.length && (r = e.length),
            r || (r = 0),
            s > 0 && s < o && (s = o),
            s === o || e.length === 0 || this.length === 0)
          )
            return 0;
          if (r < 0) throw new RangeError("targetStart out of bounds");
          if (o < 0 || o >= this.length)
            throw new RangeError("Index out of range");
          if (s < 0) throw new RangeError("sourceEnd out of bounds");
          s > this.length && (s = this.length),
            e.length - r < s - o && (s = e.length - r + o);
          const f = s - o;
          return (
            this === e && typeof Uint8Array.prototype.copyWithin == "function"
              ? this.copyWithin(r, o, s)
              : Uint8Array.prototype.set.call(e, this.subarray(o, s), r),
            f
          );
        }),
        (m.prototype.fill = function (e, r, o, s) {
          if (typeof e == "string") {
            if (
              (typeof r == "string"
                ? ((s = r), (r = 0), (o = this.length))
                : typeof o == "string" && ((s = o), (o = this.length)),
              s !== void 0 && typeof s != "string")
            )
              throw new TypeError("encoding must be a string");
            if (typeof s == "string" && !m.isEncoding(s))
              throw new TypeError("Unknown encoding: " + s);
            if (e.length === 1) {
              const S = e.charCodeAt(0);
              ((s === "utf8" && S < 128) || s === "latin1") && (e = S);
            }
          } else
            typeof e == "number"
              ? (e = e & 255)
              : typeof e == "boolean" && (e = Number(e));
          if (r < 0 || this.length < r || this.length < o)
            throw new RangeError("Out of range index");
          if (o <= r) return this;
          (r = r >>> 0),
            (o = o === void 0 ? this.length : o >>> 0),
            e || (e = 0);
          let f;
          if (typeof e == "number") for (f = r; f < o; ++f) this[f] = e;
          else {
            const S = m.isBuffer(e) ? e : m.from(e, s),
              j = S.length;
            if (j === 0)
              throw new TypeError(
                'The value "' + e + '" is invalid for argument "value"'
              );
            for (f = 0; f < o - r; ++f) this[f + r] = S[f % j];
          }
          return this;
        });
      const Be = {};
      function Ee(a, e, r) {
        Be[a] = class extends r {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: e.apply(this, arguments),
              writable: !0,
              configurable: !0,
            }),
              (this.name = `${this.name} [${a}]`),
              this.stack,
              delete this.name;
          }
          get code() {
            return a;
          }
          set code(s) {
            Object.defineProperty(this, "code", {
              configurable: !0,
              enumerable: !0,
              value: s,
              writable: !0,
            });
          }
          toString() {
            return `${this.name} [${a}]: ${this.message}`;
          }
        };
      }
      Ee(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function (a) {
          return a
            ? `${a} is outside of buffer bounds`
            : "Attempt to access memory outside buffer bounds";
        },
        RangeError
      ),
        Ee(
          "ERR_INVALID_ARG_TYPE",
          function (a, e) {
            return `The "${a}" argument must be of type number. Received type ${typeof e}`;
          },
          TypeError
        ),
        Ee(
          "ERR_OUT_OF_RANGE",
          function (a, e, r) {
            let o = `The value of "${a}" is out of range.`,
              s = r;
            return (
              Number.isInteger(r) && Math.abs(r) > 2 ** 32
                ? (s = Re(String(r)))
                : typeof r == "bigint" &&
                  ((s = String(r)),
                  (r > BigInt(2) ** BigInt(32) ||
                    r < -(BigInt(2) ** BigInt(32))) &&
                    (s = Re(s)),
                  (s += "n")),
              (o += ` It must be ${e}. Received ${s}`),
              o
            );
          },
          RangeError
        );
      function Re(a) {
        let e = "",
          r = a.length;
        const o = a[0] === "-" ? 1 : 0;
        for (; r >= o + 4; r -= 3) e = `_${a.slice(r - 3, r)}${e}`;
        return `${a.slice(0, r)}${e}`;
      }
      function Te(a, e, r) {
        De(e, "offset"),
          (a[e] === void 0 || a[e + r] === void 0) && Je(e, a.length - (r + 1));
      }
      function Pe(a, e, r, o, s, f) {
        if (a > r || a < e) {
          const S = typeof e == "bigint" ? "n" : "";
          let j;
          throw (
            (f > 3
              ? e === 0 || e === BigInt(0)
                ? (j = `>= 0${S} and < 2${S} ** ${(f + 1) * 8}${S}`)
                : (j = `>= -(2${S} ** ${(f + 1) * 8 - 1}${S}) and < 2 ** ${
                    (f + 1) * 8 - 1
                  }${S}`)
              : (j = `>= ${e}${S} and <= ${r}${S}`),
            new Be.ERR_OUT_OF_RANGE("value", j, a))
          );
        }
        Te(o, s, f);
      }
      function De(a, e) {
        if (typeof a != "number")
          throw new Be.ERR_INVALID_ARG_TYPE(e, "number", a);
      }
      function Je(a, e, r) {
        throw Math.floor(a) !== a
          ? (De(a, r), new Be.ERR_OUT_OF_RANGE(r || "offset", "an integer", a))
          : e < 0
          ? new Be.ERR_BUFFER_OUT_OF_BOUNDS()
          : new Be.ERR_OUT_OF_RANGE(
              r || "offset",
              `>= ${r ? 1 : 0} and <= ${e}`,
              a
            );
      }
      const ke = /[^+/0-9A-Za-z-_]/g;
      function Le(a) {
        if (
          ((a = a.split("=")[0]), (a = a.trim().replace(ke, "")), a.length < 2)
        )
          return "";
        for (; a.length % 4 != 0; ) a = a + "=";
        return a;
      }
      function ye(a, e) {
        e = e || Infinity;
        let r;
        const o = a.length;
        let s = null;
        const f = [];
        for (let S = 0; S < o; ++S) {
          if (((r = a.charCodeAt(S)), r > 55295 && r < 57344)) {
            if (!s) {
              if (r > 56319) {
                (e -= 3) > -1 && f.push(239, 191, 189);
                continue;
              } else if (S + 1 === o) {
                (e -= 3) > -1 && f.push(239, 191, 189);
                continue;
              }
              s = r;
              continue;
            }
            if (r < 56320) {
              (e -= 3) > -1 && f.push(239, 191, 189), (s = r);
              continue;
            }
            r = (((s - 55296) << 10) | (r - 56320)) + 65536;
          } else s && (e -= 3) > -1 && f.push(239, 191, 189);
          if (((s = null), r < 128)) {
            if ((e -= 1) < 0) break;
            f.push(r);
          } else if (r < 2048) {
            if ((e -= 2) < 0) break;
            f.push((r >> 6) | 192, (r & 63) | 128);
          } else if (r < 65536) {
            if ((e -= 3) < 0) break;
            f.push((r >> 12) | 224, ((r >> 6) & 63) | 128, (r & 63) | 128);
          } else if (r < 1114112) {
            if ((e -= 4) < 0) break;
            f.push(
              (r >> 18) | 240,
              ((r >> 12) & 63) | 128,
              ((r >> 6) & 63) | 128,
              (r & 63) | 128
            );
          } else throw new Error("Invalid code point");
        }
        return f;
      }
      function Oe(a) {
        const e = [];
        for (let r = 0; r < a.length; ++r) e.push(a.charCodeAt(r) & 255);
        return e;
      }
      function we(a, e) {
        let r, o, s;
        const f = [];
        for (let S = 0; S < a.length && !((e -= 2) < 0); ++S)
          (r = a.charCodeAt(S)),
            (o = r >> 8),
            (s = r % 256),
            f.push(s),
            f.push(o);
        return f;
      }
      function Fe(a) {
        return v.toByteArray(Le(a));
      }
      function M(a, e, r, o) {
        let s;
        for (s = 0; s < o && !(s + r >= e.length || s >= a.length); ++s)
          e[s + r] = a[s];
        return s;
      }
      function t(a, e) {
        return (
          a instanceof e ||
          (a != null &&
            a.constructor != null &&
            a.constructor.name != null &&
            a.constructor.name === e.name)
        );
      }
      function u(a) {
        return a !== a;
      }
      const h = (function () {
        const a = "0123456789abcdef",
          e = new Array(256);
        for (let r = 0; r < 16; ++r) {
          const o = r * 16;
          for (let s = 0; s < 16; ++s) e[o + s] = a[r] + a[s];
        }
        return e;
      })();
      function P(a) {
        return typeof BigInt == "undefined" ? K : a;
      }
      function K() {
        throw new Error("BigInt not supported");
      }
    },
    3715: (Ae, W, k) => {
      var T = W;
      (T.utils = k(6436)),
        (T.common = k(5772)),
        (T.sha = k(9041)),
        (T.ripemd = k(2949)),
        (T.hmac = k(2344)),
        (T.sha1 = T.sha.sha1),
        (T.sha256 = T.sha.sha256),
        (T.sha224 = T.sha.sha224),
        (T.sha384 = T.sha.sha384),
        (T.sha512 = T.sha.sha512),
        (T.ripemd160 = T.ripemd.ripemd160);
    },
    5772: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(9746);
      function U() {
        (this.pending = null),
          (this.pendingTotal = 0),
          (this.blockSize = this.constructor.blockSize),
          (this.outSize = this.constructor.outSize),
          (this.hmacStrength = this.constructor.hmacStrength),
          (this.padLength = this.constructor.padLength / 8),
          (this.endian = "big"),
          (this._delta8 = this.blockSize / 8),
          (this._delta32 = this.blockSize / 32);
      }
      (W.BlockHash = U),
        (U.prototype.update = function (G, Q) {
          if (
            ((G = T.toArray(G, Q)),
            this.pending
              ? (this.pending = this.pending.concat(G))
              : (this.pending = G),
            (this.pendingTotal += G.length),
            this.pending.length >= this._delta8)
          ) {
            G = this.pending;
            var Y = G.length % this._delta8;
            (this.pending = G.slice(G.length - Y, G.length)),
              this.pending.length === 0 && (this.pending = null),
              (G = T.join32(G, 0, G.length - Y, this.endian));
            for (var m = 0; m < G.length; m += this._delta32)
              this._update(G, m, m + this._delta32);
          }
          return this;
        }),
        (U.prototype.digest = function (G) {
          return (
            this.update(this._pad()), v(this.pending === null), this._digest(G)
          );
        }),
        (U.prototype._pad = function () {
          var G = this.pendingTotal,
            Q = this._delta8,
            Y = Q - ((G + this.padLength) % Q),
            m = new Array(Y + this.padLength);
          m[0] = 128;
          for (var ae = 1; ae < Y; ae++) m[ae] = 0;
          if (((G <<= 3), this.endian === "big")) {
            for (var te = 8; te < this.padLength; te++) m[ae++] = 0;
            (m[ae++] = 0),
              (m[ae++] = 0),
              (m[ae++] = 0),
              (m[ae++] = 0),
              (m[ae++] = (G >>> 24) & 255),
              (m[ae++] = (G >>> 16) & 255),
              (m[ae++] = (G >>> 8) & 255),
              (m[ae++] = G & 255);
          } else
            for (
              m[ae++] = G & 255,
                m[ae++] = (G >>> 8) & 255,
                m[ae++] = (G >>> 16) & 255,
                m[ae++] = (G >>> 24) & 255,
                m[ae++] = 0,
                m[ae++] = 0,
                m[ae++] = 0,
                m[ae++] = 0,
                te = 8;
              te < this.padLength;
              te++
            )
              m[ae++] = 0;
          return m;
        });
    },
    2344: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(9746);
      function U(z, G, Q) {
        if (!(this instanceof U)) return new U(z, G, Q);
        (this.Hash = z),
          (this.blockSize = z.blockSize / 8),
          (this.outSize = z.outSize / 8),
          (this.inner = null),
          (this.outer = null),
          this._init(T.toArray(G, Q));
      }
      (Ae.exports = U),
        (U.prototype._init = function (G) {
          G.length > this.blockSize && (G = new this.Hash().update(G).digest()),
            v(G.length <= this.blockSize);
          for (var Q = G.length; Q < this.blockSize; Q++) G.push(0);
          for (Q = 0; Q < G.length; Q++) G[Q] ^= 54;
          for (this.inner = new this.Hash().update(G), Q = 0; Q < G.length; Q++)
            G[Q] ^= 106;
          this.outer = new this.Hash().update(G);
        }),
        (U.prototype.update = function (G, Q) {
          return this.inner.update(G, Q), this;
        }),
        (U.prototype.digest = function (G) {
          return this.outer.update(this.inner.digest()), this.outer.digest(G);
        });
    },
    2949: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(5772),
        U = T.rotl32,
        z = T.sum32,
        G = T.sum32_3,
        Q = T.sum32_4,
        Y = v.BlockHash;
      function m() {
        if (!(this instanceof m)) return new m();
        Y.call(this),
          (this.h = [
            1732584193,
            4023233417,
            2562383102,
            271733878,
            3285377520,
          ]),
          (this.endian = "little");
      }
      T.inherits(m, Y),
        (W.ripemd160 = m),
        (m.blockSize = 512),
        (m.outSize = 160),
        (m.hmacStrength = 192),
        (m.padLength = 64),
        (m.prototype._update = function (F, n) {
          for (
            var y = this.h[0],
              O = this.h[1],
              R = this.h[2],
              ee = this.h[3],
              ne = this.h[4],
              ie = y,
              c = O,
              E = R,
              p = ee,
              w = ne,
              g = 0;
            g < 80;
            g++
          ) {
            var B = z(U(Q(y, ae(g, O, R, ee), F[V[g] + n], te(g)), N[g]), ne);
            (y = ne),
              (ne = ee),
              (ee = U(R, 10)),
              (R = O),
              (O = B),
              (B = z(
                U(Q(ie, ae(79 - g, c, E, p), F[x[g] + n], oe(g)), L[g]),
                w
              )),
              (ie = w),
              (w = p),
              (p = U(E, 10)),
              (E = c),
              (c = B);
          }
          (B = G(this.h[1], R, p)),
            (this.h[1] = G(this.h[2], ee, w)),
            (this.h[2] = G(this.h[3], ne, ie)),
            (this.h[3] = G(this.h[4], y, c)),
            (this.h[4] = G(this.h[0], O, E)),
            (this.h[0] = B);
        }),
        (m.prototype._digest = function (F) {
          return F === "hex"
            ? T.toHex32(this.h, "little")
            : T.split32(this.h, "little");
        });
      function ae(H, F, n, y) {
        return H <= 15
          ? F ^ n ^ y
          : H <= 31
          ? (F & n) | (~F & y)
          : H <= 47
          ? (F | ~n) ^ y
          : H <= 63
          ? (F & y) | (n & ~y)
          : F ^ (n | ~y);
      }
      function te(H) {
        return H <= 15
          ? 0
          : H <= 31
          ? 1518500249
          : H <= 47
          ? 1859775393
          : H <= 63
          ? 2400959708
          : 2840853838;
      }
      function oe(H) {
        return H <= 15
          ? 1352829926
          : H <= 31
          ? 1548603684
          : H <= 47
          ? 1836072691
          : H <= 63
          ? 2053994217
          : 0;
      }
      var V = [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          7,
          4,
          13,
          1,
          10,
          6,
          15,
          3,
          12,
          0,
          9,
          5,
          2,
          14,
          11,
          8,
          3,
          10,
          14,
          4,
          9,
          15,
          8,
          1,
          2,
          7,
          0,
          6,
          13,
          11,
          5,
          12,
          1,
          9,
          11,
          10,
          0,
          8,
          12,
          4,
          13,
          3,
          7,
          15,
          14,
          5,
          6,
          2,
          4,
          0,
          5,
          9,
          7,
          12,
          2,
          10,
          14,
          1,
          3,
          8,
          11,
          6,
          15,
          13,
        ],
        x = [
          5,
          14,
          7,
          0,
          9,
          2,
          11,
          4,
          13,
          6,
          15,
          8,
          1,
          10,
          3,
          12,
          6,
          11,
          3,
          7,
          0,
          13,
          5,
          10,
          14,
          15,
          8,
          12,
          4,
          9,
          1,
          2,
          15,
          5,
          1,
          3,
          7,
          14,
          6,
          9,
          11,
          8,
          12,
          2,
          10,
          0,
          4,
          13,
          8,
          6,
          4,
          1,
          3,
          11,
          15,
          0,
          5,
          12,
          2,
          13,
          9,
          7,
          10,
          14,
          12,
          15,
          10,
          4,
          1,
          5,
          8,
          7,
          6,
          2,
          13,
          14,
          0,
          3,
          9,
          11,
        ],
        N = [
          11,
          14,
          15,
          12,
          5,
          8,
          7,
          9,
          11,
          13,
          14,
          15,
          6,
          7,
          9,
          8,
          7,
          6,
          8,
          13,
          11,
          9,
          7,
          15,
          7,
          12,
          15,
          9,
          11,
          7,
          13,
          12,
          11,
          13,
          6,
          7,
          14,
          9,
          13,
          15,
          14,
          8,
          13,
          6,
          5,
          12,
          7,
          5,
          11,
          12,
          14,
          15,
          14,
          15,
          9,
          8,
          9,
          14,
          5,
          6,
          8,
          6,
          5,
          12,
          9,
          15,
          5,
          11,
          6,
          8,
          13,
          12,
          5,
          12,
          13,
          14,
          11,
          8,
          5,
          6,
        ],
        L = [
          8,
          9,
          9,
          11,
          13,
          15,
          15,
          5,
          7,
          7,
          8,
          11,
          14,
          14,
          12,
          6,
          9,
          13,
          15,
          7,
          12,
          8,
          9,
          11,
          7,
          7,
          12,
          7,
          6,
          15,
          13,
          11,
          9,
          7,
          15,
          11,
          8,
          6,
          6,
          14,
          12,
          13,
          5,
          14,
          13,
          13,
          7,
          5,
          15,
          5,
          8,
          11,
          14,
          14,
          6,
          14,
          6,
          9,
          12,
          9,
          12,
          5,
          15,
          8,
          8,
          5,
          12,
          9,
          12,
          5,
          14,
          6,
          8,
          13,
          6,
          5,
          15,
          13,
          11,
          11,
        ];
    },
    9041: (Ae, W, k) => {
      "use strict";
      (W.sha1 = k(4761)),
        (W.sha224 = k(799)),
        (W.sha256 = k(9344)),
        (W.sha384 = k(772)),
        (W.sha512 = k(5900));
    },
    4761: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(5772),
        U = k(7038),
        z = T.rotl32,
        G = T.sum32,
        Q = T.sum32_5,
        Y = U.ft_1,
        m = v.BlockHash,
        ae = [1518500249, 1859775393, 2400959708, 3395469782];
      function te() {
        if (!(this instanceof te)) return new te();
        m.call(this),
          (this.h = [
            1732584193,
            4023233417,
            2562383102,
            271733878,
            3285377520,
          ]),
          (this.W = new Array(80));
      }
      T.inherits(te, m),
        (Ae.exports = te),
        (te.blockSize = 512),
        (te.outSize = 160),
        (te.hmacStrength = 80),
        (te.padLength = 64),
        (te.prototype._update = function (V, x) {
          for (var N = this.W, L = 0; L < 16; L++) N[L] = V[x + L];
          for (; L < N.length; L++)
            N[L] = z(N[L - 3] ^ N[L - 8] ^ N[L - 14] ^ N[L - 16], 1);
          var H = this.h[0],
            F = this.h[1],
            n = this.h[2],
            y = this.h[3],
            O = this.h[4];
          for (L = 0; L < N.length; L++) {
            var R = ~~(L / 20),
              ee = Q(z(H, 5), Y(R, F, n, y), O, N[L], ae[R]);
            (O = y), (y = n), (n = z(F, 30)), (F = H), (H = ee);
          }
          (this.h[0] = G(this.h[0], H)),
            (this.h[1] = G(this.h[1], F)),
            (this.h[2] = G(this.h[2], n)),
            (this.h[3] = G(this.h[3], y)),
            (this.h[4] = G(this.h[4], O));
        }),
        (te.prototype._digest = function (V) {
          return V === "hex"
            ? T.toHex32(this.h, "big")
            : T.split32(this.h, "big");
        });
    },
    799: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(9344);
      function U() {
        if (!(this instanceof U)) return new U();
        v.call(this),
          (this.h = [
            3238371032,
            914150663,
            812702999,
            4144912697,
            4290775857,
            1750603025,
            1694076839,
            3204075428,
          ]);
      }
      T.inherits(U, v),
        (Ae.exports = U),
        (U.blockSize = 512),
        (U.outSize = 224),
        (U.hmacStrength = 192),
        (U.padLength = 64),
        (U.prototype._digest = function (G) {
          return G === "hex"
            ? T.toHex32(this.h.slice(0, 7), "big")
            : T.split32(this.h.slice(0, 7), "big");
        });
    },
    9344: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(5772),
        U = k(7038),
        z = k(9746),
        G = T.sum32,
        Q = T.sum32_4,
        Y = T.sum32_5,
        m = U.ch32,
        ae = U.maj32,
        te = U.s0_256,
        oe = U.s1_256,
        V = U.g0_256,
        x = U.g1_256,
        N = v.BlockHash,
        L = [
          1116352408,
          1899447441,
          3049323471,
          3921009573,
          961987163,
          1508970993,
          2453635748,
          2870763221,
          3624381080,
          310598401,
          607225278,
          1426881987,
          1925078388,
          2162078206,
          2614888103,
          3248222580,
          3835390401,
          4022224774,
          264347078,
          604807628,
          770255983,
          1249150122,
          1555081692,
          1996064986,
          2554220882,
          2821834349,
          2952996808,
          3210313671,
          3336571891,
          3584528711,
          113926993,
          338241895,
          666307205,
          773529912,
          1294757372,
          1396182291,
          1695183700,
          1986661051,
          2177026350,
          2456956037,
          2730485921,
          2820302411,
          3259730800,
          3345764771,
          3516065817,
          3600352804,
          4094571909,
          275423344,
          430227734,
          506948616,
          659060556,
          883997877,
          958139571,
          1322822218,
          1537002063,
          1747873779,
          1955562222,
          2024104815,
          2227730452,
          2361852424,
          2428436474,
          2756734187,
          3204031479,
          3329325298,
        ];
      function H() {
        if (!(this instanceof H)) return new H();
        N.call(this),
          (this.h = [
            1779033703,
            3144134277,
            1013904242,
            2773480762,
            1359893119,
            2600822924,
            528734635,
            1541459225,
          ]),
          (this.k = L),
          (this.W = new Array(64));
      }
      T.inherits(H, N),
        (Ae.exports = H),
        (H.blockSize = 512),
        (H.outSize = 256),
        (H.hmacStrength = 192),
        (H.padLength = 64),
        (H.prototype._update = function (n, y) {
          for (var O = this.W, R = 0; R < 16; R++) O[R] = n[y + R];
          for (; R < O.length; R++)
            O[R] = Q(x(O[R - 2]), O[R - 7], V(O[R - 15]), O[R - 16]);
          var ee = this.h[0],
            ne = this.h[1],
            ie = this.h[2],
            c = this.h[3],
            E = this.h[4],
            p = this.h[5],
            w = this.h[6],
            g = this.h[7];
          for (z(this.k.length === O.length), R = 0; R < O.length; R++) {
            var B = Y(g, oe(E), m(E, p, w), this.k[R], O[R]),
              X = G(te(ee), ae(ee, ne, ie));
            (g = w),
              (w = p),
              (p = E),
              (E = G(c, B)),
              (c = ie),
              (ie = ne),
              (ne = ee),
              (ee = G(B, X));
          }
          (this.h[0] = G(this.h[0], ee)),
            (this.h[1] = G(this.h[1], ne)),
            (this.h[2] = G(this.h[2], ie)),
            (this.h[3] = G(this.h[3], c)),
            (this.h[4] = G(this.h[4], E)),
            (this.h[5] = G(this.h[5], p)),
            (this.h[6] = G(this.h[6], w)),
            (this.h[7] = G(this.h[7], g));
        }),
        (H.prototype._digest = function (n) {
          return n === "hex"
            ? T.toHex32(this.h, "big")
            : T.split32(this.h, "big");
        });
    },
    772: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(5900);
      function U() {
        if (!(this instanceof U)) return new U();
        v.call(this),
          (this.h = [
            3418070365,
            3238371032,
            1654270250,
            914150663,
            2438529370,
            812702999,
            355462360,
            4144912697,
            1731405415,
            4290775857,
            2394180231,
            1750603025,
            3675008525,
            1694076839,
            1203062813,
            3204075428,
          ]);
      }
      T.inherits(U, v),
        (Ae.exports = U),
        (U.blockSize = 1024),
        (U.outSize = 384),
        (U.hmacStrength = 192),
        (U.padLength = 128),
        (U.prototype._digest = function (G) {
          return G === "hex"
            ? T.toHex32(this.h.slice(0, 12), "big")
            : T.split32(this.h.slice(0, 12), "big");
        });
    },
    5900: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = k(5772),
        U = k(9746),
        z = T.rotr64_hi,
        G = T.rotr64_lo,
        Q = T.shr64_hi,
        Y = T.shr64_lo,
        m = T.sum64,
        ae = T.sum64_hi,
        te = T.sum64_lo,
        oe = T.sum64_4_hi,
        V = T.sum64_4_lo,
        x = T.sum64_5_hi,
        N = T.sum64_5_lo,
        L = v.BlockHash,
        H = [
          1116352408,
          3609767458,
          1899447441,
          602891725,
          3049323471,
          3964484399,
          3921009573,
          2173295548,
          961987163,
          4081628472,
          1508970993,
          3053834265,
          2453635748,
          2937671579,
          2870763221,
          3664609560,
          3624381080,
          2734883394,
          310598401,
          1164996542,
          607225278,
          1323610764,
          1426881987,
          3590304994,
          1925078388,
          4068182383,
          2162078206,
          991336113,
          2614888103,
          633803317,
          3248222580,
          3479774868,
          3835390401,
          2666613458,
          4022224774,
          944711139,
          264347078,
          2341262773,
          604807628,
          2007800933,
          770255983,
          1495990901,
          1249150122,
          1856431235,
          1555081692,
          3175218132,
          1996064986,
          2198950837,
          2554220882,
          3999719339,
          2821834349,
          766784016,
          2952996808,
          2566594879,
          3210313671,
          3203337956,
          3336571891,
          1034457026,
          3584528711,
          2466948901,
          113926993,
          3758326383,
          338241895,
          168717936,
          666307205,
          1188179964,
          773529912,
          1546045734,
          1294757372,
          1522805485,
          1396182291,
          2643833823,
          1695183700,
          2343527390,
          1986661051,
          1014477480,
          2177026350,
          1206759142,
          2456956037,
          344077627,
          2730485921,
          1290863460,
          2820302411,
          3158454273,
          3259730800,
          3505952657,
          3345764771,
          106217008,
          3516065817,
          3606008344,
          3600352804,
          1432725776,
          4094571909,
          1467031594,
          275423344,
          851169720,
          430227734,
          3100823752,
          506948616,
          1363258195,
          659060556,
          3750685593,
          883997877,
          3785050280,
          958139571,
          3318307427,
          1322822218,
          3812723403,
          1537002063,
          2003034995,
          1747873779,
          3602036899,
          1955562222,
          1575990012,
          2024104815,
          1125592928,
          2227730452,
          2716904306,
          2361852424,
          442776044,
          2428436474,
          593698344,
          2756734187,
          3733110249,
          3204031479,
          2999351573,
          3329325298,
          3815920427,
          3391569614,
          3928383900,
          3515267271,
          566280711,
          3940187606,
          3454069534,
          4118630271,
          4000239992,
          116418474,
          1914138554,
          174292421,
          2731055270,
          289380356,
          3203993006,
          460393269,
          320620315,
          685471733,
          587496836,
          852142971,
          1086792851,
          1017036298,
          365543100,
          1126000580,
          2618297676,
          1288033470,
          3409855158,
          1501505948,
          4234509866,
          1607167915,
          987167468,
          1816402316,
          1246189591,
        ];
      function F() {
        if (!(this instanceof F)) return new F();
        L.call(this),
          (this.h = [
            1779033703,
            4089235720,
            3144134277,
            2227873595,
            1013904242,
            4271175723,
            2773480762,
            1595750129,
            1359893119,
            2917565137,
            2600822924,
            725511199,
            528734635,
            4215389547,
            1541459225,
            327033209,
          ]),
          (this.k = H),
          (this.W = new Array(160));
      }
      T.inherits(F, L),
        (Ae.exports = F),
        (F.blockSize = 1024),
        (F.outSize = 512),
        (F.hmacStrength = 192),
        (F.padLength = 128),
        (F.prototype._prepareBlock = function (X, D) {
          for (var d = this.W, i = 0; i < 32; i++) d[i] = X[D + i];
          for (; i < d.length; i += 2) {
            var b = w(d[i - 4], d[i - 3]),
              I = g(d[i - 4], d[i - 3]),
              J = d[i - 14],
              A = d[i - 13],
              $ = E(d[i - 30], d[i - 29]),
              xe = p(d[i - 30], d[i - 29]),
              be = d[i - 32],
              ce = d[i - 31];
            (d[i] = oe(b, I, J, A, $, xe, be, ce)),
              (d[i + 1] = V(b, I, J, A, $, xe, be, ce));
          }
        }),
        (F.prototype._update = function (X, D) {
          this._prepareBlock(X, D);
          var d = this.W,
            i = this.h[0],
            b = this.h[1],
            I = this.h[2],
            J = this.h[3],
            A = this.h[4],
            $ = this.h[5],
            xe = this.h[6],
            be = this.h[7],
            ce = this.h[8],
            me = this.h[9],
            Se = this.h[10],
            Be = this.h[11],
            Ee = this.h[12],
            Re = this.h[13],
            Te = this.h[14],
            Pe = this.h[15];
          U(this.k.length === d.length);
          for (var De = 0; De < d.length; De += 2) {
            var Je = Te,
              ke = Pe,
              Le = ie(ce, me),
              ye = c(ce, me),
              Oe = n(ce, me, Se, Be, Ee, Re),
              we = y(ce, me, Se, Be, Ee, Re),
              Fe = this.k[De],
              M = this.k[De + 1],
              t = d[De],
              u = d[De + 1],
              h = x(Je, ke, Le, ye, Oe, we, Fe, M, t, u),
              P = N(Je, ke, Le, ye, Oe, we, Fe, M, t, u);
            (Je = ee(i, b)),
              (ke = ne(i, b)),
              (Le = O(i, b, I, J, A, $)),
              (ye = R(i, b, I, J, A, $));
            var K = ae(Je, ke, Le, ye),
              a = te(Je, ke, Le, ye);
            (Te = Ee),
              (Pe = Re),
              (Ee = Se),
              (Re = Be),
              (Se = ce),
              (Be = me),
              (ce = ae(xe, be, h, P)),
              (me = te(be, be, h, P)),
              (xe = A),
              (be = $),
              (A = I),
              ($ = J),
              (I = i),
              (J = b),
              (i = ae(h, P, K, a)),
              (b = te(h, P, K, a));
          }
          m(this.h, 0, i, b),
            m(this.h, 2, I, J),
            m(this.h, 4, A, $),
            m(this.h, 6, xe, be),
            m(this.h, 8, ce, me),
            m(this.h, 10, Se, Be),
            m(this.h, 12, Ee, Re),
            m(this.h, 14, Te, Pe);
        }),
        (F.prototype._digest = function (X) {
          return X === "hex"
            ? T.toHex32(this.h, "big")
            : T.split32(this.h, "big");
        });
      function n(B, X, D, d, i) {
        var b = (B & D) ^ (~B & i);
        return b < 0 && (b += 4294967296), b;
      }
      function y(B, X, D, d, i, b) {
        var I = (X & d) ^ (~X & b);
        return I < 0 && (I += 4294967296), I;
      }
      function O(B, X, D, d, i) {
        var b = (B & D) ^ (B & i) ^ (D & i);
        return b < 0 && (b += 4294967296), b;
      }
      function R(B, X, D, d, i, b) {
        var I = (X & d) ^ (X & b) ^ (d & b);
        return I < 0 && (I += 4294967296), I;
      }
      function ee(B, X) {
        var D = z(B, X, 28),
          d = z(X, B, 2),
          i = z(X, B, 7),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
      function ne(B, X) {
        var D = G(B, X, 28),
          d = G(X, B, 2),
          i = G(X, B, 7),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
      function ie(B, X) {
        var D = z(B, X, 14),
          d = z(B, X, 18),
          i = z(X, B, 9),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
      function c(B, X) {
        var D = G(B, X, 14),
          d = G(B, X, 18),
          i = G(X, B, 9),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
      function E(B, X) {
        var D = z(B, X, 1),
          d = z(B, X, 8),
          i = Q(B, X, 7),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
      function p(B, X) {
        var D = G(B, X, 1),
          d = G(B, X, 8),
          i = Y(B, X, 7),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
      function w(B, X) {
        var D = z(B, X, 19),
          d = z(X, B, 29),
          i = Q(B, X, 6),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
      function g(B, X) {
        var D = G(B, X, 19),
          d = G(X, B, 29),
          i = Y(B, X, 6),
          b = D ^ d ^ i;
        return b < 0 && (b += 4294967296), b;
      }
    },
    7038: (Ae, W, k) => {
      "use strict";
      var T = k(6436),
        v = T.rotr32;
      function U(oe, V, x, N) {
        if (oe === 0) return z(V, x, N);
        if (oe === 1 || oe === 3) return Q(V, x, N);
        if (oe === 2) return G(V, x, N);
      }
      W.ft_1 = U;
      function z(oe, V, x) {
        return (oe & V) ^ (~oe & x);
      }
      W.ch32 = z;
      function G(oe, V, x) {
        return (oe & V) ^ (oe & x) ^ (V & x);
      }
      W.maj32 = G;
      function Q(oe, V, x) {
        return oe ^ V ^ x;
      }
      W.p32 = Q;
      function Y(oe) {
        return v(oe, 2) ^ v(oe, 13) ^ v(oe, 22);
      }
      W.s0_256 = Y;
      function m(oe) {
        return v(oe, 6) ^ v(oe, 11) ^ v(oe, 25);
      }
      W.s1_256 = m;
      function ae(oe) {
        return v(oe, 7) ^ v(oe, 18) ^ (oe >>> 3);
      }
      W.g0_256 = ae;
      function te(oe) {
        return v(oe, 17) ^ v(oe, 19) ^ (oe >>> 10);
      }
      W.g1_256 = te;
    },
    6436: (Ae, W, k) => {
      "use strict";
      var T = k(9746),
        v = k(5717);
      W.inherits = v;
      function U(g, B) {
        return (g.charCodeAt(B) & 64512) != 55296 || B < 0 || B + 1 >= g.length
          ? !1
          : (g.charCodeAt(B + 1) & 64512) == 56320;
      }
      function z(g, B) {
        if (Array.isArray(g)) return g.slice();
        if (!g) return [];
        var X = [];
        if (typeof g == "string")
          if (B) {
            if (B === "hex")
              for (
                g = g.replace(/[^a-z0-9]+/gi, ""),
                  g.length % 2 != 0 && (g = "0" + g),
                  d = 0;
                d < g.length;
                d += 2
              )
                X.push(parseInt(g[d] + g[d + 1], 16));
          } else
            for (var D = 0, d = 0; d < g.length; d++) {
              var i = g.charCodeAt(d);
              i < 128
                ? (X[D++] = i)
                : i < 2048
                ? ((X[D++] = (i >> 6) | 192), (X[D++] = (i & 63) | 128))
                : U(g, d)
                ? ((i =
                    65536 + ((i & 1023) << 10) + (g.charCodeAt(++d) & 1023)),
                  (X[D++] = (i >> 18) | 240),
                  (X[D++] = ((i >> 12) & 63) | 128),
                  (X[D++] = ((i >> 6) & 63) | 128),
                  (X[D++] = (i & 63) | 128))
                : ((X[D++] = (i >> 12) | 224),
                  (X[D++] = ((i >> 6) & 63) | 128),
                  (X[D++] = (i & 63) | 128));
            }
        else for (d = 0; d < g.length; d++) X[d] = g[d] | 0;
        return X;
      }
      W.toArray = z;
      function G(g) {
        for (var B = "", X = 0; X < g.length; X++) B += m(g[X].toString(16));
        return B;
      }
      W.toHex = G;
      function Q(g) {
        var B =
          (g >>> 24) |
          ((g >>> 8) & 65280) |
          ((g << 8) & 16711680) |
          ((g & 255) << 24);
        return B >>> 0;
      }
      W.htonl = Q;
      function Y(g, B) {
        for (var X = "", D = 0; D < g.length; D++) {
          var d = g[D];
          B === "little" && (d = Q(d)), (X += ae(d.toString(16)));
        }
        return X;
      }
      W.toHex32 = Y;
      function m(g) {
        return g.length === 1 ? "0" + g : g;
      }
      W.zero2 = m;
      function ae(g) {
        return g.length === 7
          ? "0" + g
          : g.length === 6
          ? "00" + g
          : g.length === 5
          ? "000" + g
          : g.length === 4
          ? "0000" + g
          : g.length === 3
          ? "00000" + g
          : g.length === 2
          ? "000000" + g
          : g.length === 1
          ? "0000000" + g
          : g;
      }
      W.zero8 = ae;
      function te(g, B, X, D) {
        var d = X - B;
        T(d % 4 == 0);
        for (
          var i = new Array(d / 4), b = 0, I = B;
          b < i.length;
          b++, I += 4
        ) {
          var J;
          D === "big"
            ? (J = (g[I] << 24) | (g[I + 1] << 16) | (g[I + 2] << 8) | g[I + 3])
            : (J =
                (g[I + 3] << 24) | (g[I + 2] << 16) | (g[I + 1] << 8) | g[I]),
            (i[b] = J >>> 0);
        }
        return i;
      }
      W.join32 = te;
      function oe(g, B) {
        for (
          var X = new Array(g.length * 4), D = 0, d = 0;
          D < g.length;
          D++, d += 4
        ) {
          var i = g[D];
          B === "big"
            ? ((X[d] = i >>> 24),
              (X[d + 1] = (i >>> 16) & 255),
              (X[d + 2] = (i >>> 8) & 255),
              (X[d + 3] = i & 255))
            : ((X[d + 3] = i >>> 24),
              (X[d + 2] = (i >>> 16) & 255),
              (X[d + 1] = (i >>> 8) & 255),
              (X[d] = i & 255));
        }
        return X;
      }
      W.split32 = oe;
      function V(g, B) {
        return (g >>> B) | (g << (32 - B));
      }
      W.rotr32 = V;
      function x(g, B) {
        return (g << B) | (g >>> (32 - B));
      }
      W.rotl32 = x;
      function N(g, B) {
        return (g + B) >>> 0;
      }
      W.sum32 = N;
      function L(g, B, X) {
        return (g + B + X) >>> 0;
      }
      W.sum32_3 = L;
      function H(g, B, X, D) {
        return (g + B + X + D) >>> 0;
      }
      W.sum32_4 = H;
      function F(g, B, X, D, d) {
        return (g + B + X + D + d) >>> 0;
      }
      W.sum32_5 = F;
      function n(g, B, X, D) {
        var d = g[B],
          i = g[B + 1],
          b = (D + i) >>> 0,
          I = (b < D ? 1 : 0) + X + d;
        (g[B] = I >>> 0), (g[B + 1] = b);
      }
      W.sum64 = n;
      function y(g, B, X, D) {
        var d = (B + D) >>> 0,
          i = (d < B ? 1 : 0) + g + X;
        return i >>> 0;
      }
      W.sum64_hi = y;
      function O(g, B, X, D) {
        var d = B + D;
        return d >>> 0;
      }
      W.sum64_lo = O;
      function R(g, B, X, D, d, i, b, I) {
        var J = 0,
          A = B;
        (A = (A + D) >>> 0),
          (J += A < B ? 1 : 0),
          (A = (A + i) >>> 0),
          (J += A < i ? 1 : 0),
          (A = (A + I) >>> 0),
          (J += A < I ? 1 : 0);
        var $ = g + X + d + b + J;
        return $ >>> 0;
      }
      W.sum64_4_hi = R;
      function ee(g, B, X, D, d, i, b, I) {
        var J = B + D + i + I;
        return J >>> 0;
      }
      W.sum64_4_lo = ee;
      function ne(g, B, X, D, d, i, b, I, J, A) {
        var $ = 0,
          xe = B;
        (xe = (xe + D) >>> 0),
          ($ += xe < B ? 1 : 0),
          (xe = (xe + i) >>> 0),
          ($ += xe < i ? 1 : 0),
          (xe = (xe + I) >>> 0),
          ($ += xe < I ? 1 : 0),
          (xe = (xe + A) >>> 0),
          ($ += xe < A ? 1 : 0);
        var be = g + X + d + b + J + $;
        return be >>> 0;
      }
      W.sum64_5_hi = ne;
      function ie(g, B, X, D, d, i, b, I, J, A) {
        var $ = B + D + i + I + A;
        return $ >>> 0;
      }
      W.sum64_5_lo = ie;
      function c(g, B, X) {
        var D = (B << (32 - X)) | (g >>> X);
        return D >>> 0;
      }
      W.rotr64_hi = c;
      function E(g, B, X) {
        var D = (g << (32 - X)) | (B >>> X);
        return D >>> 0;
      }
      W.rotr64_lo = E;
      function p(g, B, X) {
        return g >>> X;
      }
      W.shr64_hi = p;
      function w(g, B, X) {
        var D = (g << (32 - X)) | (B >>> X);
        return D >>> 0;
      }
      W.shr64_lo = w;
    },
    645: (Ae, W) => {
      /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ (W.read = function (
        k,
        T,
        v,
        U,
        z
      ) {
        var G,
          Q,
          Y = z * 8 - U - 1,
          m = (1 << Y) - 1,
          ae = m >> 1,
          te = -7,
          oe = v ? z - 1 : 0,
          V = v ? -1 : 1,
          x = k[T + oe];
        for (
          oe += V, G = x & ((1 << -te) - 1), x >>= -te, te += Y;
          te > 0;
          G = G * 256 + k[T + oe], oe += V, te -= 8
        );
        for (
          Q = G & ((1 << -te) - 1), G >>= -te, te += U;
          te > 0;
          Q = Q * 256 + k[T + oe], oe += V, te -= 8
        );
        if (G === 0) G = 1 - ae;
        else {
          if (G === m) return Q ? NaN : (x ? -1 : 1) * Infinity;
          (Q = Q + Math.pow(2, U)), (G = G - ae);
        }
        return (x ? -1 : 1) * Q * Math.pow(2, G - U);
      }),
        (W.write = function (k, T, v, U, z, G) {
          var Q,
            Y,
            m,
            ae = G * 8 - z - 1,
            te = (1 << ae) - 1,
            oe = te >> 1,
            V = z === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
            x = U ? 0 : G - 1,
            N = U ? 1 : -1,
            L = T < 0 || (T === 0 && 1 / T < 0) ? 1 : 0;
          for (
            T = Math.abs(T),
              isNaN(T) || T === Infinity
                ? ((Y = isNaN(T) ? 1 : 0), (Q = te))
                : ((Q = Math.floor(Math.log(T) / Math.LN2)),
                  T * (m = Math.pow(2, -Q)) < 1 && (Q--, (m *= 2)),
                  Q + oe >= 1 ? (T += V / m) : (T += V * Math.pow(2, 1 - oe)),
                  T * m >= 2 && (Q++, (m /= 2)),
                  Q + oe >= te
                    ? ((Y = 0), (Q = te))
                    : Q + oe >= 1
                    ? ((Y = (T * m - 1) * Math.pow(2, z)), (Q = Q + oe))
                    : ((Y = T * Math.pow(2, oe - 1) * Math.pow(2, z)),
                      (Q = 0)));
            z >= 8;
            k[v + x] = Y & 255, x += N, Y /= 256, z -= 8
          );
          for (
            Q = (Q << z) | Y, ae += z;
            ae > 0;
            k[v + x] = Q & 255, x += N, Q /= 256, ae -= 8
          );
          k[v + x - N] |= L * 128;
        });
    },
    5717: (Ae) => {
      typeof Object.create == "function"
        ? (Ae.exports = function (k, T) {
            T &&
              ((k.super_ = T),
              (k.prototype = Object.create(T.prototype, {
                constructor: {
                  value: k,
                  enumerable: !1,
                  writable: !0,
                  configurable: !0,
                },
              })));
          })
        : (Ae.exports = function (k, T) {
            if (T) {
              k.super_ = T;
              var v = function () {};
              (v.prototype = T.prototype),
                (k.prototype = new v()),
                (k.prototype.constructor = k);
            }
          });
    },
    1094: (Ae) => {
      /**
       * [js-sha3]{@link https://github.com/emn178/js-sha3}
       *
       * @version 0.5.7
       * @author Chen, Yi-Cyuan [emn178@gmail.com]
       * @copyright Chen, Yi-Cyuan 2015-2016
       * @license MIT
       */ (function () {
        "use strict";
        var W = typeof window == "object" ? window : {},
          k =
            !W.JS_SHA3_NO_NODE_JS &&
            typeof process == "object" &&
            process.versions &&
            process.versions.node;
        k && (W = global);
        for (
          var T = !W.JS_SHA3_NO_COMMON_JS && !0 && Ae.exports,
            v = "0123456789abcdef".split(""),
            U = [31, 7936, 2031616, 520093696],
            z = [1, 256, 65536, 16777216],
            G = [6, 1536, 393216, 100663296],
            Q = [0, 8, 16, 24],
            Y = [
              1,
              0,
              32898,
              0,
              32906,
              2147483648,
              2147516416,
              2147483648,
              32907,
              0,
              2147483649,
              0,
              2147516545,
              2147483648,
              32777,
              2147483648,
              138,
              0,
              136,
              0,
              2147516425,
              0,
              2147483658,
              0,
              2147516555,
              0,
              139,
              2147483648,
              32905,
              2147483648,
              32771,
              2147483648,
              32770,
              2147483648,
              128,
              2147483648,
              32778,
              0,
              2147483658,
              2147483648,
              2147516545,
              2147483648,
              32896,
              2147483648,
              2147483649,
              0,
              2147516424,
              2147483648,
            ],
            m = [224, 256, 384, 512],
            ae = [128, 256],
            te = ["hex", "buffer", "arrayBuffer", "array"],
            oe = function (c, E, p) {
              return function (w) {
                return new ne(c, E, c).update(w)[p]();
              };
            },
            V = function (c, E, p) {
              return function (w, g) {
                return new ne(c, E, g).update(w)[p]();
              };
            },
            x = function (c, E) {
              var p = oe(c, E, "hex");
              (p.create = function () {
                return new ne(c, E, c);
              }),
                (p.update = function (B) {
                  return p.create().update(B);
                });
              for (var w = 0; w < te.length; ++w) {
                var g = te[w];
                p[g] = oe(c, E, g);
              }
              return p;
            },
            N = function (c, E) {
              var p = V(c, E, "hex");
              (p.create = function (B) {
                return new ne(c, E, B);
              }),
                (p.update = function (B, X) {
                  return p.create(X).update(B);
                });
              for (var w = 0; w < te.length; ++w) {
                var g = te[w];
                p[g] = V(c, E, g);
              }
              return p;
            },
            L = [
              { name: "keccak", padding: z, bits: m, createMethod: x },
              { name: "sha3", padding: G, bits: m, createMethod: x },
              { name: "shake", padding: U, bits: ae, createMethod: N },
            ],
            H = {},
            F = [],
            n = 0;
          n < L.length;
          ++n
        )
          for (var y = L[n], O = y.bits, R = 0; R < O.length; ++R) {
            var ee = y.name + "_" + O[R];
            F.push(ee), (H[ee] = y.createMethod(O[R], y.padding));
          }
        function ne(c, E, p) {
          (this.blocks = []),
            (this.s = []),
            (this.padding = E),
            (this.outputBits = p),
            (this.reset = !0),
            (this.block = 0),
            (this.start = 0),
            (this.blockCount = (1600 - (c << 1)) >> 5),
            (this.byteCount = this.blockCount << 2),
            (this.outputBlocks = p >> 5),
            (this.extraBytes = (p & 31) >> 3);
          for (var w = 0; w < 50; ++w) this.s[w] = 0;
        }
        (ne.prototype.update = function (c) {
          var E = typeof c != "string";
          E && c.constructor === ArrayBuffer && (c = new Uint8Array(c));
          for (
            var p = c.length,
              w = this.blocks,
              g = this.byteCount,
              B = this.blockCount,
              X = 0,
              D = this.s,
              d,
              i;
            X < p;

          ) {
            if (this.reset)
              for (this.reset = !1, w[0] = this.block, d = 1; d < B + 1; ++d)
                w[d] = 0;
            if (E)
              for (d = this.start; X < p && d < g; ++X)
                w[d >> 2] |= c[X] << Q[d++ & 3];
            else
              for (d = this.start; X < p && d < g; ++X)
                (i = c.charCodeAt(X)),
                  i < 128
                    ? (w[d >> 2] |= i << Q[d++ & 3])
                    : i < 2048
                    ? ((w[d >> 2] |= (192 | (i >> 6)) << Q[d++ & 3]),
                      (w[d >> 2] |= (128 | (i & 63)) << Q[d++ & 3]))
                    : i < 55296 || i >= 57344
                    ? ((w[d >> 2] |= (224 | (i >> 12)) << Q[d++ & 3]),
                      (w[d >> 2] |= (128 | ((i >> 6) & 63)) << Q[d++ & 3]),
                      (w[d >> 2] |= (128 | (i & 63)) << Q[d++ & 3]))
                    : ((i =
                        65536 +
                        (((i & 1023) << 10) | (c.charCodeAt(++X) & 1023))),
                      (w[d >> 2] |= (240 | (i >> 18)) << Q[d++ & 3]),
                      (w[d >> 2] |= (128 | ((i >> 12) & 63)) << Q[d++ & 3]),
                      (w[d >> 2] |= (128 | ((i >> 6) & 63)) << Q[d++ & 3]),
                      (w[d >> 2] |= (128 | (i & 63)) << Q[d++ & 3]));
            if (((this.lastByteIndex = d), d >= g)) {
              for (this.start = d - g, this.block = w[B], d = 0; d < B; ++d)
                D[d] ^= w[d];
              ie(D), (this.reset = !0);
            } else this.start = d;
          }
          return this;
        }),
          (ne.prototype.finalize = function () {
            var c = this.blocks,
              E = this.lastByteIndex,
              p = this.blockCount,
              w = this.s;
            if (
              ((c[E >> 2] |= this.padding[E & 3]),
              this.lastByteIndex === this.byteCount)
            )
              for (c[0] = c[p], E = 1; E < p + 1; ++E) c[E] = 0;
            for (c[p - 1] |= 2147483648, E = 0; E < p; ++E) w[E] ^= c[E];
            ie(w);
          }),
          (ne.prototype.toString = ne.prototype.hex = function () {
            this.finalize();
            for (
              var c = this.blockCount,
                E = this.s,
                p = this.outputBlocks,
                w = this.extraBytes,
                g = 0,
                B = 0,
                X = "",
                D;
              B < p;

            ) {
              for (g = 0; g < c && B < p; ++g, ++B)
                (D = E[g]),
                  (X +=
                    v[(D >> 4) & 15] +
                    v[D & 15] +
                    v[(D >> 12) & 15] +
                    v[(D >> 8) & 15] +
                    v[(D >> 20) & 15] +
                    v[(D >> 16) & 15] +
                    v[(D >> 28) & 15] +
                    v[(D >> 24) & 15]);
              B % c == 0 && (ie(E), (g = 0));
            }
            return (
              w &&
                ((D = E[g]),
                w > 0 && (X += v[(D >> 4) & 15] + v[D & 15]),
                w > 1 && (X += v[(D >> 12) & 15] + v[(D >> 8) & 15]),
                w > 2 && (X += v[(D >> 20) & 15] + v[(D >> 16) & 15])),
              X
            );
          }),
          (ne.prototype.arrayBuffer = function () {
            this.finalize();
            var c = this.blockCount,
              E = this.s,
              p = this.outputBlocks,
              w = this.extraBytes,
              g = 0,
              B = 0,
              X = this.outputBits >> 3,
              D;
            w ? (D = new ArrayBuffer((p + 1) << 2)) : (D = new ArrayBuffer(X));
            for (var d = new Uint32Array(D); B < p; ) {
              for (g = 0; g < c && B < p; ++g, ++B) d[B] = E[g];
              B % c == 0 && ie(E);
            }
            return w && ((d[g] = E[g]), (D = D.slice(0, X))), D;
          }),
          (ne.prototype.buffer = ne.prototype.arrayBuffer),
          (ne.prototype.digest = ne.prototype.array = function () {
            this.finalize();
            for (
              var c = this.blockCount,
                E = this.s,
                p = this.outputBlocks,
                w = this.extraBytes,
                g = 0,
                B = 0,
                X = [],
                D,
                d;
              B < p;

            ) {
              for (g = 0; g < c && B < p; ++g, ++B)
                (D = B << 2),
                  (d = E[g]),
                  (X[D] = d & 255),
                  (X[D + 1] = (d >> 8) & 255),
                  (X[D + 2] = (d >> 16) & 255),
                  (X[D + 3] = (d >> 24) & 255);
              B % c == 0 && ie(E);
            }
            return (
              w &&
                ((D = B << 2),
                (d = E[g]),
                w > 0 && (X[D] = d & 255),
                w > 1 && (X[D + 1] = (d >> 8) & 255),
                w > 2 && (X[D + 2] = (d >> 16) & 255)),
              X
            );
          });
        var ie = function (c) {
          var E,
            p,
            w,
            g,
            B,
            X,
            D,
            d,
            i,
            b,
            I,
            J,
            A,
            $,
            xe,
            be,
            ce,
            me,
            Se,
            Be,
            Ee,
            Re,
            Te,
            Pe,
            De,
            Je,
            ke,
            Le,
            ye,
            Oe,
            we,
            Fe,
            M,
            t,
            u,
            h,
            P,
            K,
            a,
            e,
            r,
            o,
            s,
            f,
            S,
            j,
            q,
            re,
            le,
            fe,
            Me,
            Ie,
            Ze,
            He,
            ze,
            Ke,
            Qe,
            Ne,
            Ve,
            Ye,
            We,
            Ue,
            $e;
          for (w = 0; w < 48; w += 2)
            (g = c[0] ^ c[10] ^ c[20] ^ c[30] ^ c[40]),
              (B = c[1] ^ c[11] ^ c[21] ^ c[31] ^ c[41]),
              (X = c[2] ^ c[12] ^ c[22] ^ c[32] ^ c[42]),
              (D = c[3] ^ c[13] ^ c[23] ^ c[33] ^ c[43]),
              (d = c[4] ^ c[14] ^ c[24] ^ c[34] ^ c[44]),
              (i = c[5] ^ c[15] ^ c[25] ^ c[35] ^ c[45]),
              (b = c[6] ^ c[16] ^ c[26] ^ c[36] ^ c[46]),
              (I = c[7] ^ c[17] ^ c[27] ^ c[37] ^ c[47]),
              (J = c[8] ^ c[18] ^ c[28] ^ c[38] ^ c[48]),
              (A = c[9] ^ c[19] ^ c[29] ^ c[39] ^ c[49]),
              (E = J ^ ((X << 1) | (D >>> 31))),
              (p = A ^ ((D << 1) | (X >>> 31))),
              (c[0] ^= E),
              (c[1] ^= p),
              (c[10] ^= E),
              (c[11] ^= p),
              (c[20] ^= E),
              (c[21] ^= p),
              (c[30] ^= E),
              (c[31] ^= p),
              (c[40] ^= E),
              (c[41] ^= p),
              (E = g ^ ((d << 1) | (i >>> 31))),
              (p = B ^ ((i << 1) | (d >>> 31))),
              (c[2] ^= E),
              (c[3] ^= p),
              (c[12] ^= E),
              (c[13] ^= p),
              (c[22] ^= E),
              (c[23] ^= p),
              (c[32] ^= E),
              (c[33] ^= p),
              (c[42] ^= E),
              (c[43] ^= p),
              (E = X ^ ((b << 1) | (I >>> 31))),
              (p = D ^ ((I << 1) | (b >>> 31))),
              (c[4] ^= E),
              (c[5] ^= p),
              (c[14] ^= E),
              (c[15] ^= p),
              (c[24] ^= E),
              (c[25] ^= p),
              (c[34] ^= E),
              (c[35] ^= p),
              (c[44] ^= E),
              (c[45] ^= p),
              (E = d ^ ((J << 1) | (A >>> 31))),
              (p = i ^ ((A << 1) | (J >>> 31))),
              (c[6] ^= E),
              (c[7] ^= p),
              (c[16] ^= E),
              (c[17] ^= p),
              (c[26] ^= E),
              (c[27] ^= p),
              (c[36] ^= E),
              (c[37] ^= p),
              (c[46] ^= E),
              (c[47] ^= p),
              (E = b ^ ((g << 1) | (B >>> 31))),
              (p = I ^ ((B << 1) | (g >>> 31))),
              (c[8] ^= E),
              (c[9] ^= p),
              (c[18] ^= E),
              (c[19] ^= p),
              (c[28] ^= E),
              (c[29] ^= p),
              (c[38] ^= E),
              (c[39] ^= p),
              (c[48] ^= E),
              (c[49] ^= p),
              ($ = c[0]),
              (xe = c[1]),
              (j = (c[11] << 4) | (c[10] >>> 28)),
              (q = (c[10] << 4) | (c[11] >>> 28)),
              (Le = (c[20] << 3) | (c[21] >>> 29)),
              (ye = (c[21] << 3) | (c[20] >>> 29)),
              (Ye = (c[31] << 9) | (c[30] >>> 23)),
              (We = (c[30] << 9) | (c[31] >>> 23)),
              (o = (c[40] << 18) | (c[41] >>> 14)),
              (s = (c[41] << 18) | (c[40] >>> 14)),
              (t = (c[2] << 1) | (c[3] >>> 31)),
              (u = (c[3] << 1) | (c[2] >>> 31)),
              (be = (c[13] << 12) | (c[12] >>> 20)),
              (ce = (c[12] << 12) | (c[13] >>> 20)),
              (re = (c[22] << 10) | (c[23] >>> 22)),
              (le = (c[23] << 10) | (c[22] >>> 22)),
              (Oe = (c[33] << 13) | (c[32] >>> 19)),
              (we = (c[32] << 13) | (c[33] >>> 19)),
              (Ue = (c[42] << 2) | (c[43] >>> 30)),
              ($e = (c[43] << 2) | (c[42] >>> 30)),
              (He = (c[5] << 30) | (c[4] >>> 2)),
              (ze = (c[4] << 30) | (c[5] >>> 2)),
              (h = (c[14] << 6) | (c[15] >>> 26)),
              (P = (c[15] << 6) | (c[14] >>> 26)),
              (me = (c[25] << 11) | (c[24] >>> 21)),
              (Se = (c[24] << 11) | (c[25] >>> 21)),
              (fe = (c[34] << 15) | (c[35] >>> 17)),
              (Me = (c[35] << 15) | (c[34] >>> 17)),
              (Fe = (c[45] << 29) | (c[44] >>> 3)),
              (M = (c[44] << 29) | (c[45] >>> 3)),
              (Pe = (c[6] << 28) | (c[7] >>> 4)),
              (De = (c[7] << 28) | (c[6] >>> 4)),
              (Ke = (c[17] << 23) | (c[16] >>> 9)),
              (Qe = (c[16] << 23) | (c[17] >>> 9)),
              (K = (c[26] << 25) | (c[27] >>> 7)),
              (a = (c[27] << 25) | (c[26] >>> 7)),
              (Be = (c[36] << 21) | (c[37] >>> 11)),
              (Ee = (c[37] << 21) | (c[36] >>> 11)),
              (Ie = (c[47] << 24) | (c[46] >>> 8)),
              (Ze = (c[46] << 24) | (c[47] >>> 8)),
              (f = (c[8] << 27) | (c[9] >>> 5)),
              (S = (c[9] << 27) | (c[8] >>> 5)),
              (Je = (c[18] << 20) | (c[19] >>> 12)),
              (ke = (c[19] << 20) | (c[18] >>> 12)),
              (Ne = (c[29] << 7) | (c[28] >>> 25)),
              (Ve = (c[28] << 7) | (c[29] >>> 25)),
              (e = (c[38] << 8) | (c[39] >>> 24)),
              (r = (c[39] << 8) | (c[38] >>> 24)),
              (Re = (c[48] << 14) | (c[49] >>> 18)),
              (Te = (c[49] << 14) | (c[48] >>> 18)),
              (c[0] = $ ^ (~be & me)),
              (c[1] = xe ^ (~ce & Se)),
              (c[10] = Pe ^ (~Je & Le)),
              (c[11] = De ^ (~ke & ye)),
              (c[20] = t ^ (~h & K)),
              (c[21] = u ^ (~P & a)),
              (c[30] = f ^ (~j & re)),
              (c[31] = S ^ (~q & le)),
              (c[40] = He ^ (~Ke & Ne)),
              (c[41] = ze ^ (~Qe & Ve)),
              (c[2] = be ^ (~me & Be)),
              (c[3] = ce ^ (~Se & Ee)),
              (c[12] = Je ^ (~Le & Oe)),
              (c[13] = ke ^ (~ye & we)),
              (c[22] = h ^ (~K & e)),
              (c[23] = P ^ (~a & r)),
              (c[32] = j ^ (~re & fe)),
              (c[33] = q ^ (~le & Me)),
              (c[42] = Ke ^ (~Ne & Ye)),
              (c[43] = Qe ^ (~Ve & We)),
              (c[4] = me ^ (~Be & Re)),
              (c[5] = Se ^ (~Ee & Te)),
              (c[14] = Le ^ (~Oe & Fe)),
              (c[15] = ye ^ (~we & M)),
              (c[24] = K ^ (~e & o)),
              (c[25] = a ^ (~r & s)),
              (c[34] = re ^ (~fe & Ie)),
              (c[35] = le ^ (~Me & Ze)),
              (c[44] = Ne ^ (~Ye & Ue)),
              (c[45] = Ve ^ (~We & $e)),
              (c[6] = Be ^ (~Re & $)),
              (c[7] = Ee ^ (~Te & xe)),
              (c[16] = Oe ^ (~Fe & Pe)),
              (c[17] = we ^ (~M & De)),
              (c[26] = e ^ (~o & t)),
              (c[27] = r ^ (~s & u)),
              (c[36] = fe ^ (~Ie & f)),
              (c[37] = Me ^ (~Ze & S)),
              (c[46] = Ye ^ (~Ue & He)),
              (c[47] = We ^ (~$e & ze)),
              (c[8] = Re ^ (~$ & be)),
              (c[9] = Te ^ (~xe & ce)),
              (c[18] = Fe ^ (~Pe & Je)),
              (c[19] = M ^ (~De & ke)),
              (c[28] = o ^ (~t & h)),
              (c[29] = s ^ (~u & P)),
              (c[38] = Ie ^ (~f & j)),
              (c[39] = Ze ^ (~S & q)),
              (c[48] = Ue ^ (~He & Ke)),
              (c[49] = $e ^ (~ze & Qe)),
              (c[0] ^= Y[w]),
              (c[1] ^= Y[w + 1]);
        };
        if (T) Ae.exports = H;
        else for (var n = 0; n < F.length; ++n) W[F[n]] = H[F[n]];
      })();
    },
    9746: (Ae) => {
      Ae.exports = W;
      function W(k, T) {
        if (!k) throw new Error(T || "Assertion failed");
      }
      W.equal = function (T, v, U) {
        if (T != v) throw new Error(U || "Assertion failed: " + T + " != " + v);
      };
    },
    7635: function (Ae) {
      "use strict";
      (function (W) {
        const k = 2147483647;
        function T(V) {
          const x = new Uint32Array([
            1116352408,
            1899447441,
            3049323471,
            3921009573,
            961987163,
            1508970993,
            2453635748,
            2870763221,
            3624381080,
            310598401,
            607225278,
            1426881987,
            1925078388,
            2162078206,
            2614888103,
            3248222580,
            3835390401,
            4022224774,
            264347078,
            604807628,
            770255983,
            1249150122,
            1555081692,
            1996064986,
            2554220882,
            2821834349,
            2952996808,
            3210313671,
            3336571891,
            3584528711,
            113926993,
            338241895,
            666307205,
            773529912,
            1294757372,
            1396182291,
            1695183700,
            1986661051,
            2177026350,
            2456956037,
            2730485921,
            2820302411,
            3259730800,
            3345764771,
            3516065817,
            3600352804,
            4094571909,
            275423344,
            430227734,
            506948616,
            659060556,
            883997877,
            958139571,
            1322822218,
            1537002063,
            1747873779,
            1955562222,
            2024104815,
            2227730452,
            2361852424,
            2428436474,
            2756734187,
            3204031479,
            3329325298,
          ]);
          let N = 1779033703,
            L = 3144134277,
            H = 1013904242,
            F = 2773480762,
            n = 1359893119,
            y = 2600822924,
            O = 528734635,
            R = 1541459225;
          const ee = new Uint32Array(64);
          function ne(B) {
            let X = 0,
              D = B.length;
            for (; D >= 64; ) {
              let d = N,
                i = L,
                b = H,
                I = F,
                J = n,
                A = y,
                $ = O,
                xe = R,
                be,
                ce,
                me,
                Se,
                Be;
              for (ce = 0; ce < 16; ce++)
                (me = X + ce * 4),
                  (ee[ce] =
                    ((B[me] & 255) << 24) |
                    ((B[me + 1] & 255) << 16) |
                    ((B[me + 2] & 255) << 8) |
                    (B[me + 3] & 255));
              for (ce = 16; ce < 64; ce++)
                (be = ee[ce - 2]),
                  (Se =
                    ((be >>> 17) | (be << (32 - 17))) ^
                    ((be >>> 19) | (be << (32 - 19))) ^
                    (be >>> 10)),
                  (be = ee[ce - 15]),
                  (Be =
                    ((be >>> 7) | (be << (32 - 7))) ^
                    ((be >>> 18) | (be << (32 - 18))) ^
                    (be >>> 3)),
                  (ee[ce] =
                    (((Se + ee[ce - 7]) | 0) + ((Be + ee[ce - 16]) | 0)) | 0);
              for (ce = 0; ce < 64; ce++)
                (Se =
                  ((((((J >>> 6) | (J << (32 - 6))) ^
                    ((J >>> 11) | (J << (32 - 11))) ^
                    ((J >>> 25) | (J << (32 - 25)))) +
                    ((J & A) ^ (~J & $))) |
                    0) +
                    ((xe + ((x[ce] + ee[ce]) | 0)) | 0)) |
                  0),
                  (Be =
                    ((((d >>> 2) | (d << (32 - 2))) ^
                      ((d >>> 13) | (d << (32 - 13))) ^
                      ((d >>> 22) | (d << (32 - 22)))) +
                      ((d & i) ^ (d & b) ^ (i & b))) |
                    0),
                  (xe = $),
                  ($ = A),
                  (A = J),
                  (J = (I + Se) | 0),
                  (I = b),
                  (b = i),
                  (i = d),
                  (d = (Se + Be) | 0);
              (N = (N + d) | 0),
                (L = (L + i) | 0),
                (H = (H + b) | 0),
                (F = (F + I) | 0),
                (n = (n + J) | 0),
                (y = (y + A) | 0),
                (O = (O + $) | 0),
                (R = (R + xe) | 0),
                (X += 64),
                (D -= 64);
            }
          }
          ne(V);
          let ie,
            c = V.length % 64,
            E = (V.length / 536870912) | 0,
            p = V.length << 3,
            w = c < 56 ? 56 : 120,
            g = V.slice(V.length - c, V.length);
          for (g.push(128), ie = c + 1; ie < w; ie++) g.push(0);
          return (
            g.push((E >>> 24) & 255),
            g.push((E >>> 16) & 255),
            g.push((E >>> 8) & 255),
            g.push((E >>> 0) & 255),
            g.push((p >>> 24) & 255),
            g.push((p >>> 16) & 255),
            g.push((p >>> 8) & 255),
            g.push((p >>> 0) & 255),
            ne(g),
            [
              (N >>> 24) & 255,
              (N >>> 16) & 255,
              (N >>> 8) & 255,
              (N >>> 0) & 255,
              (L >>> 24) & 255,
              (L >>> 16) & 255,
              (L >>> 8) & 255,
              (L >>> 0) & 255,
              (H >>> 24) & 255,
              (H >>> 16) & 255,
              (H >>> 8) & 255,
              (H >>> 0) & 255,
              (F >>> 24) & 255,
              (F >>> 16) & 255,
              (F >>> 8) & 255,
              (F >>> 0) & 255,
              (n >>> 24) & 255,
              (n >>> 16) & 255,
              (n >>> 8) & 255,
              (n >>> 0) & 255,
              (y >>> 24) & 255,
              (y >>> 16) & 255,
              (y >>> 8) & 255,
              (y >>> 0) & 255,
              (O >>> 24) & 255,
              (O >>> 16) & 255,
              (O >>> 8) & 255,
              (O >>> 0) & 255,
              (R >>> 24) & 255,
              (R >>> 16) & 255,
              (R >>> 8) & 255,
              (R >>> 0) & 255,
            ]
          );
        }
        function v(V, x, N) {
          V = V.length <= 64 ? V : T(V);
          const L = 64 + x.length + 4,
            H = new Array(L),
            F = new Array(64);
          let n,
            y = [];
          for (n = 0; n < 64; n++) H[n] = 54;
          for (n = 0; n < V.length; n++) H[n] ^= V[n];
          for (n = 0; n < x.length; n++) H[64 + n] = x[n];
          for (n = L - 4; n < L; n++) H[n] = 0;
          for (n = 0; n < 64; n++) F[n] = 92;
          for (n = 0; n < V.length; n++) F[n] ^= V[n];
          function O() {
            for (let R = L - 1; R >= L - 4; R--) {
              if ((H[R]++, H[R] <= 255)) return;
              H[R] = 0;
            }
          }
          for (; N >= 32; ) O(), (y = y.concat(T(F.concat(T(H))))), (N -= 32);
          return (
            N > 0 && (O(), (y = y.concat(T(F.concat(T(H))).slice(0, N)))), y
          );
        }
        function U(V, x, N, L, H) {
          let F;
          for (Y(V, (2 * N - 1) * 16, H, 0, 16), F = 0; F < 2 * N; F++)
            Q(V, F * 16, H, 16), G(H, L), Y(H, 0, V, x + F * 16, 16);
          for (F = 0; F < N; F++) Y(V, x + F * 2 * 16, V, F * 16, 16);
          for (F = 0; F < N; F++)
            Y(V, x + (F * 2 + 1) * 16, V, (F + N) * 16, 16);
        }
        function z(V, x) {
          return (V << x) | (V >>> (32 - x));
        }
        function G(V, x) {
          Y(V, 0, x, 0, 16);
          for (let N = 8; N > 0; N -= 2)
            (x[4] ^= z(x[0] + x[12], 7)),
              (x[8] ^= z(x[4] + x[0], 9)),
              (x[12] ^= z(x[8] + x[4], 13)),
              (x[0] ^= z(x[12] + x[8], 18)),
              (x[9] ^= z(x[5] + x[1], 7)),
              (x[13] ^= z(x[9] + x[5], 9)),
              (x[1] ^= z(x[13] + x[9], 13)),
              (x[5] ^= z(x[1] + x[13], 18)),
              (x[14] ^= z(x[10] + x[6], 7)),
              (x[2] ^= z(x[14] + x[10], 9)),
              (x[6] ^= z(x[2] + x[14], 13)),
              (x[10] ^= z(x[6] + x[2], 18)),
              (x[3] ^= z(x[15] + x[11], 7)),
              (x[7] ^= z(x[3] + x[15], 9)),
              (x[11] ^= z(x[7] + x[3], 13)),
              (x[15] ^= z(x[11] + x[7], 18)),
              (x[1] ^= z(x[0] + x[3], 7)),
              (x[2] ^= z(x[1] + x[0], 9)),
              (x[3] ^= z(x[2] + x[1], 13)),
              (x[0] ^= z(x[3] + x[2], 18)),
              (x[6] ^= z(x[5] + x[4], 7)),
              (x[7] ^= z(x[6] + x[5], 9)),
              (x[4] ^= z(x[7] + x[6], 13)),
              (x[5] ^= z(x[4] + x[7], 18)),
              (x[11] ^= z(x[10] + x[9], 7)),
              (x[8] ^= z(x[11] + x[10], 9)),
              (x[9] ^= z(x[8] + x[11], 13)),
              (x[10] ^= z(x[9] + x[8], 18)),
              (x[12] ^= z(x[15] + x[14], 7)),
              (x[13] ^= z(x[12] + x[15], 9)),
              (x[14] ^= z(x[13] + x[12], 13)),
              (x[15] ^= z(x[14] + x[13], 18));
          for (let N = 0; N < 16; ++N) V[N] += x[N];
        }
        function Q(V, x, N, L) {
          for (let H = 0; H < L; H++) N[H] ^= V[x + H];
        }
        function Y(V, x, N, L, H) {
          for (; H--; ) N[L++] = V[x++];
        }
        function m(V) {
          if (!V || typeof V.length != "number") return !1;
          for (let x = 0; x < V.length; x++) {
            const N = V[x];
            if (typeof N != "number" || N % 1 || N < 0 || N >= 256) return !1;
          }
          return !0;
        }
        function ae(V, x) {
          if (typeof V != "number" || V % 1) throw new Error("invalid " + x);
          return V;
        }
        function te(V, x, N, L, H, F, n) {
          if (
            ((N = ae(N, "N")),
            (L = ae(L, "r")),
            (H = ae(H, "p")),
            (F = ae(F, "dkLen")),
            N === 0 || (N & (N - 1)) != 0)
          )
            throw new Error("N must be power of 2");
          if (N > k / 128 / L) throw new Error("N too large");
          if (L > k / 128 / H) throw new Error("r too large");
          if (!m(V)) throw new Error("password must be an array or buffer");
          if (((V = Array.prototype.slice.call(V)), !m(x)))
            throw new Error("salt must be an array or buffer");
          x = Array.prototype.slice.call(x);
          let y = v(V, x, H * 128 * L);
          const O = new Uint32Array(H * 32 * L);
          for (let J = 0; J < O.length; J++) {
            const A = J * 4;
            O[J] =
              ((y[A + 3] & 255) << 24) |
              ((y[A + 2] & 255) << 16) |
              ((y[A + 1] & 255) << 8) |
              ((y[A + 0] & 255) << 0);
          }
          const R = new Uint32Array(64 * L),
            ee = new Uint32Array(32 * L * N),
            ne = 32 * L,
            ie = new Uint32Array(16),
            c = new Uint32Array(16),
            E = H * N * 2;
          let p = 0,
            w = null,
            g = !1,
            B = 0,
            X = 0,
            D,
            d;
          const i = n ? parseInt(1e3 / L) : 4294967295,
            b = typeof setImmediate != "undefined" ? setImmediate : setTimeout,
            I = function () {
              if (g) return n(new Error("cancelled"), p / E);
              let J;
              switch (B) {
                case 0:
                  (d = X * 32 * L), Y(O, d, R, 0, ne), (B = 1), (D = 0);
                case 1:
                  (J = N - D), J > i && (J = i);
                  for (let $ = 0; $ < J; $++)
                    Y(R, 0, ee, (D + $) * ne, ne), U(R, ne, L, ie, c);
                  if (((D += J), (p += J), n)) {
                    const $ = parseInt((1e3 * p) / E);
                    if ($ !== w) {
                      if (((g = n(null, p / E)), g)) break;
                      w = $;
                    }
                  }
                  if (D < N) break;
                  (D = 0), (B = 2);
                case 2:
                  (J = N - D), J > i && (J = i);
                  for (let $ = 0; $ < J; $++) {
                    const xe = (2 * L - 1) * 16,
                      be = R[xe] & (N - 1);
                    Q(ee, be * ne, R, ne), U(R, ne, L, ie, c);
                  }
                  if (((D += J), (p += J), n)) {
                    const $ = parseInt((1e3 * p) / E);
                    if ($ !== w) {
                      if (((g = n(null, p / E)), g)) break;
                      w = $;
                    }
                  }
                  if (D < N) break;
                  if ((Y(R, 0, O, d, ne), X++, X < H)) {
                    B = 0;
                    break;
                  }
                  y = [];
                  for (let $ = 0; $ < O.length; $++)
                    y.push((O[$] >> 0) & 255),
                      y.push((O[$] >> 8) & 255),
                      y.push((O[$] >> 16) & 255),
                      y.push((O[$] >> 24) & 255);
                  const A = v(V, y, F);
                  return n && n(null, 1, A), A;
              }
              n && b(I);
            };
          if (!n)
            for (;;) {
              const J = I();
              if (J != null) return J;
            }
          I();
        }
        const oe = {
          scrypt: function (V, x, N, L, H, F, n) {
            return new Promise(function (y, O) {
              let R = 0;
              n && n(0),
                te(V, x, N, L, H, F, function (ee, ne, ie) {
                  if (ee) O(ee);
                  else if (ie) n && R !== 1 && n(1), y(new Uint8Array(ie));
                  else if (n && ne !== R) return (R = ne), n(ne);
                });
            });
          },
          syncScrypt: function (V, x, N, L, H, F) {
            return new Uint8Array(te(V, x, N, L, H, F));
          },
        };
        Ae.exports = oe;
      })(this);
    },
    1511: (Ae, W) => {
      "use strict";
      (W.__esModule = !0), (W.__ = W.PatternType = void 0);
      var k;
      (function (T) {
        (T.String = "@ts-pattern/string"),
          (T.Number = "@ts-pattern/number"),
          (T.Boolean = "@ts-pattern/boolean"),
          (T.Guard = "@ts-pattern/guard"),
          (T.Not = "@ts-pattern/not"),
          (T.Select = "@ts-pattern/select");
      })((k = W.PatternType || (W.PatternType = {}))),
        (W.__ = { string: k.String, number: k.Number, boolean: k.Boolean });
    },
    6176: function (Ae, W, k) {
      "use strict";
      var T =
          (this && this.__read) ||
          function (F, n) {
            var y = typeof Symbol == "function" && F[Symbol.iterator];
            if (!y) return F;
            var O = y.call(F),
              R,
              ee = [],
              ne;
            try {
              for (; (n === void 0 || n-- > 0) && !(R = O.next()).done; )
                ee.push(R.value);
            } catch (ie) {
              ne = { error: ie };
            } finally {
              try {
                R && !R.done && (y = O.return) && y.call(O);
              } finally {
                if (ne) throw ne.error;
              }
            }
            return ee;
          },
        v =
          (this && this.__spreadArray) ||
          function (F, n) {
            for (var y = 0, O = n.length, R = F.length; y < O; y++, R++)
              F[R] = n[y];
            return F;
          };
      (W.__esModule = !0),
        (W.match = W.__ = W.select = W.not = W.when = void 0);
      var U = k(1511);
      W.__ = U.__;
      var z = function (F) {
        return {
          "@ts-pattern/__patternKind": U.PatternType.Guard,
          "@ts-pattern/__when": F,
        };
      };
      W.when = z;
      var G = function (F) {
        return {
          "@ts-pattern/__patternKind": U.PatternType.Not,
          "@ts-pattern/__pattern": F,
        };
      };
      W.not = G;
      var Q = function (F) {
        return {
          "@ts-pattern/__patternKind": U.PatternType.Select,
          "@ts-pattern/__key": F,
        };
      };
      W.select = Q;
      var Y = function (F) {
        return m(F, []);
      };
      W.match = Y;
      var m = function (F, n) {
          return {
            with: function () {
              for (var y = [], O = 0; O < arguments.length; O++)
                y[O] = arguments[O];
              var R = T(
                  y.slice(0, -1).reduce(
                    function (E, p) {
                      var w = T(E, 2),
                        g = w[0],
                        B = w[1];
                      return typeof p == "function"
                        ? [g, v(v([], T(B)), [p])]
                        : [v(v([], T(g)), [p]), B];
                    },
                    [[], []]
                  ),
                  2
                ),
                ee = R[0],
                ne = R[1],
                ie = y[y.length - 1],
                c = function (E) {
                  return Boolean(
                    ee.some(function (p) {
                      return L(p)(E);
                    }) &&
                      ne.every(function (p) {
                        return p(E);
                      })
                  );
                };
              return m(
                F,
                v(v([], T(n)), [
                  {
                    test: c,
                    handler: ie,
                    select: function (E) {
                      return ee.length === 1 ? H(ee[0])(E) : {};
                    },
                  },
                ])
              );
            },
            when: function (y, O) {
              return m(
                F,
                v(v([], T(n)), [
                  {
                    test: y,
                    handler: O,
                    select: function () {
                      return {};
                    },
                  },
                ])
              );
            },
            otherwise: function (y) {
              return m(
                F,
                v(v([], T(n)), [
                  {
                    test: L(U.__),
                    handler: y,
                    select: function () {
                      return {};
                    },
                  },
                ])
              ).run();
            },
            run: function () {
              var y = n.find(function (R) {
                var ee = R.test;
                return ee(F);
              });
              if (!y) {
                var O = void 0;
                try {
                  O = JSON.stringify(F);
                } catch (R) {
                  O = F;
                }
                throw new Error(
                  "Pattern matching error: no pattern matches value " + O
                );
              }
              return y.handler(F, y.select(F));
            },
            exhaustive: function () {
              return m(F, n);
            },
          };
        },
        ae = function (F) {
          return Boolean(F && typeof F == "object");
        },
        te = function (F) {
          return Array.isArray(F);
        },
        oe = function (F) {
          var n = F;
          return (
            n &&
            n["@ts-pattern/__patternKind"] === U.PatternType.Guard &&
            typeof n["@ts-pattern/__when"] == "function"
          );
        },
        V = function (F) {
          var n = F;
          return n && n["@ts-pattern/__patternKind"] === U.PatternType.Not;
        },
        x = function (F) {
          var n = F;
          return n && n["@ts-pattern/__patternKind"] === U.PatternType.Select;
        },
        N = function (F) {
          return Array.isArray(F) && F.length === 1;
        },
        L = function (F) {
          return function (n) {
            if (F === U.__ || x(F)) return !0;
            if (F === U.__.string) return typeof n == "string";
            if (F === U.__.boolean) return typeof n == "boolean";
            if (F === U.__.number)
              return typeof n == "number" && !Number.isNaN(n);
            if (oe(F)) return Boolean(F["@ts-pattern/__when"](n));
            if (V(F)) return !L(F["@ts-pattern/__pattern"])(n);
            if (N(F))
              return te(n)
                ? n.every(function (R) {
                    return L(F[0])(R);
                  })
                : !1;
            if (typeof F != typeof n) return !1;
            if (te(F))
              return te(n) && F.length === n.length
                ? F.every(function (R, ee) {
                    return L(R)(n[ee]);
                  })
                : !1;
            if (F instanceof Map)
              return n instanceof Map
                ? v([], T(F.keys())).every(function (R) {
                    return L(F.get(R))(n.get(R));
                  })
                : !1;
            if (F instanceof Set) {
              if (!(n instanceof Set)) return !1;
              var y = v([], T(F.values())),
                O = v([], T(n.values()));
              return y.length === 0
                ? O.length === 0
                : y.length === 1
                ? y.every(function (R) {
                    return Object.values(U.__).includes(R)
                      ? L([R])(O)
                      : n.has(R);
                  })
                : y.every(function (R) {
                    return n.has(R);
                  });
            }
            return ae(F)
              ? ae(n)
                ? Object.keys(F).every(function (R) {
                    return L(F[R])(n[R]);
                  })
                : !1
              : n === F;
          };
        },
        H = function (F) {
          return function (n) {
            var y;
            return x(F)
              ? ((y = {}), (y[F["@ts-pattern/__key"]] = n), y)
              : N(F) && te(n)
              ? n
                  .map(function (O) {
                    return H(F[0])(O);
                  })
                  .reduce(function (O, R) {
                    return Object.keys(R).reduce(function (ee, ne) {
                      return (ee[ne] = (ee[ne] || []).concat([R[ne]])), ee;
                    }, O);
                  }, {})
              : te(F) && te(n)
              ? F.length <= n.length
                ? F.reduce(function (O, R, ee) {
                    return Object.assign(O, H(R)(n[ee]));
                  }, {})
                : {}
              : ae(F) && ae(n)
              ? Object.keys(F).reduce(function (O, R) {
                  return Object.assign(O, H(F[R])(n[R]));
                }, {})
              : {};
          };
        };
    },
    7314: (Ae, W) => {
      "use strict";
      var k;
      k = { value: !0 };
      function T(v) {
        var U,
          z = new Set(),
          G = function (V, x) {
            var N = typeof V == "function" ? V(U) : V;
            if (N !== U) {
              var L = U;
              (U = x ? N : Object.assign({}, U, N)),
                z.forEach(function (H) {
                  return H(U, L);
                });
            }
          },
          Q = function () {
            return U;
          },
          Y = function (V, x, N) {
            x === void 0 && (x = Q), N === void 0 && (N = Object.is);
            var L = x(U);
            function H() {
              var F = x(U);
              if (!N(L, F)) {
                var n = L;
                V((L = F), n);
              }
            }
            return (
              z.add(H),
              function () {
                return z.delete(H);
              }
            );
          },
          m = function (V, x, N) {
            return x || N
              ? Y(V, x, N)
              : (z.add(V),
                function () {
                  return z.delete(V);
                });
          },
          ae = function () {
            return z.clear();
          },
          te = { setState: G, getState: Q, subscribe: m, destroy: ae };
        return (U = v(G, Q, te)), te;
      }
      W.Z = T;
    },
  },
]);
