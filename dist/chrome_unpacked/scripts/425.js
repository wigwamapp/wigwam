(self.webpackChunktaky = self.webpackChunktaky || []).push([
  [425],
  {
    8794: (Et, bt, U) => {
      "use strict";
      U.d(bt, { i: () => wt });
      const wt = "bignumber/5.0.14";
    },
    2593: (Et, bt, U) => {
      "use strict";
      U.d(bt, { Zm: () => Nt, O$: () => x, g$: () => D });
      var wt = U(3550),
        _t = U.n(wt),
        d = U(3286),
        B = U(711),
        l = U(8794),
        At = _t().BN;
      const P = new B.Yd(l.i),
        C = {},
        xt = 9007199254740991;
      function Nt(A) {
        return (
          A != null &&
          (x.isBigNumber(A) ||
            (typeof A == "number" && A % 1 == 0) ||
            (typeof A == "string" && !!A.match(/^-?[0-9]+$/)) ||
            (0, d.A7)(A) ||
            typeof A == "bigint" ||
            (0, d._t)(A))
        );
      }
      let S = !1;
      class x {
        constructor(v, N) {
          P.checkNew(new.target, x),
            v !== C &&
              P.throwError(
                "cannot call constructor directly; use BigNumber.from",
                B.Yd.errors.UNSUPPORTED_OPERATION,
                { operation: "new (BigNumber)" }
              ),
            (this._hex = N),
            (this._isBigNumber = !0),
            Object.freeze(this);
        }
        fromTwos(v) {
          return p(w(this).fromTwos(v));
        }
        toTwos(v) {
          return p(w(this).toTwos(v));
        }
        abs() {
          return this._hex[0] === "-" ? x.from(this._hex.substring(1)) : this;
        }
        add(v) {
          return p(w(this).add(w(v)));
        }
        sub(v) {
          return p(w(this).sub(w(v)));
        }
        div(v) {
          return (
            x.from(v).isZero() && R("division by zero", "div"),
            p(w(this).div(w(v)))
          );
        }
        mul(v) {
          return p(w(this).mul(w(v)));
        }
        mod(v) {
          const N = w(v);
          return (
            N.isNeg() && R("cannot modulo negative values", "mod"),
            p(w(this).umod(N))
          );
        }
        pow(v) {
          const N = w(v);
          return (
            N.isNeg() && R("cannot raise to negative values", "pow"),
            p(w(this).pow(N))
          );
        }
        and(v) {
          const N = w(v);
          return (
            (this.isNegative() || N.isNeg()) &&
              R("cannot 'and' negative values", "and"),
            p(w(this).and(N))
          );
        }
        or(v) {
          const N = w(v);
          return (
            (this.isNegative() || N.isNeg()) &&
              R("cannot 'or' negative values", "or"),
            p(w(this).or(N))
          );
        }
        xor(v) {
          const N = w(v);
          return (
            (this.isNegative() || N.isNeg()) &&
              R("cannot 'xor' negative values", "xor"),
            p(w(this).xor(N))
          );
        }
        mask(v) {
          return (
            (this.isNegative() || v < 0) &&
              R("cannot mask negative values", "mask"),
            p(w(this).maskn(v))
          );
        }
        shl(v) {
          return (
            (this.isNegative() || v < 0) &&
              R("cannot shift negative values", "shl"),
            p(w(this).shln(v))
          );
        }
        shr(v) {
          return (
            (this.isNegative() || v < 0) &&
              R("cannot shift negative values", "shr"),
            p(w(this).shrn(v))
          );
        }
        eq(v) {
          return w(this).eq(w(v));
        }
        lt(v) {
          return w(this).lt(w(v));
        }
        lte(v) {
          return w(this).lte(w(v));
        }
        gt(v) {
          return w(this).gt(w(v));
        }
        gte(v) {
          return w(this).gte(w(v));
        }
        isNegative() {
          return this._hex[0] === "-";
        }
        isZero() {
          return w(this).isZero();
        }
        toNumber() {
          try {
            return w(this).toNumber();
          } catch (v) {
            R("overflow", "toNumber", this.toString());
          }
          return null;
        }
        toString() {
          return (
            arguments.length > 0 &&
              (arguments[0] === 10
                ? S ||
                  ((S = !0),
                  P.warn(
                    "BigNumber.toString does not accept any parameters; base-10 is assumed"
                  ))
                : arguments[0] === 16
                ? P.throwError(
                    "BigNumber.toString does not accept any parameters; use bigNumber.toHexString()",
                    B.Yd.errors.UNEXPECTED_ARGUMENT,
                    {}
                  )
                : P.throwError(
                    "BigNumber.toString does not accept parameters",
                    B.Yd.errors.UNEXPECTED_ARGUMENT,
                    {}
                  )),
            w(this).toString(10)
          );
        }
        toHexString() {
          return this._hex;
        }
        toJSON(v) {
          return { type: "BigNumber", hex: this.toHexString() };
        }
        static from(v) {
          if (v instanceof x) return v;
          if (typeof v == "string")
            return v.match(/^-?0x[0-9a-f]+$/i)
              ? new x(C, M(v))
              : v.match(/^-?[0-9]+$/)
              ? new x(C, M(new At(v)))
              : P.throwArgumentError("invalid BigNumber string", "value", v);
          if (typeof v == "number")
            return (
              v % 1 && R("underflow", "BigNumber.from", v),
              (v >= xt || v <= -xt) && R("overflow", "BigNumber.from", v),
              x.from(String(v))
            );
          const N = v;
          if (typeof N == "bigint") return x.from(N.toString());
          if ((0, d._t)(N)) return x.from((0, d.Dv)(N));
          if (N)
            if (N.toHexString) {
              const F = N.toHexString();
              if (typeof F == "string") return x.from(F);
            } else {
              let F = N._hex;
              if (
                (F == null && N.type === "BigNumber" && (F = N.hex),
                typeof F == "string" &&
                  ((0, d.A7)(F) || (F[0] === "-" && (0, d.A7)(F.substring(1)))))
              )
                return x.from(F);
            }
          return P.throwArgumentError("invalid BigNumber value", "value", v);
        }
        static isBigNumber(v) {
          return !!(v && v._isBigNumber);
        }
      }
      function M(A) {
        if (typeof A != "string") return M(A.toString(16));
        if (A[0] === "-")
          return (
            (A = A.substring(1)),
            A[0] === "-" && P.throwArgumentError("invalid hex", "value", A),
            (A = M(A)),
            A === "0x00" ? A : "-" + A
          );
        if ((A.substring(0, 2) !== "0x" && (A = "0x" + A), A === "0x"))
          return "0x00";
        for (
          A.length % 2 && (A = "0x0" + A.substring(2));
          A.length > 4 && A.substring(0, 4) === "0x00";

        )
          A = "0x" + A.substring(4);
        return A;
      }
      function p(A) {
        return x.from(M(A));
      }
      function w(A) {
        const v = x.from(A).toHexString();
        return v[0] === "-"
          ? new At("-" + v.substring(3), 16)
          : new At(v.substring(2), 16);
      }
      function R(A, v, N) {
        const F = { fault: A, operation: v };
        return (
          N != null && (F.value = N),
          P.throwError(A, B.Yd.errors.NUMERIC_FAULT, F)
        );
      }
      function D(A) {
        return new At(A, 36).toString(16);
      }
      function yt(A) {
        return new At(A, 16).toString(36);
      }
    },
    3286: (Et, bt, U) => {
      "use strict";
      U.d(bt, {
        lE: () => C,
        zo: () => xt,
        xs: () => D,
        p3: () => R,
        $P: () => yt,
        $m: () => v,
        Dv: () => p,
        _t: () => P,
        Zq: () => At,
        A7: () => x,
        gV: () => F,
        N: () => N,
        G1: () => Nt,
      });
      var wt = U(711);
      const _t = "bytes/5.0.10",
        d = new wt.Yd(_t);
      function B(g) {
        return !!g.toHexString;
      }
      function l(g) {
        return (
          g.slice ||
            (g.slice = function () {
              const u = Array.prototype.slice.call(arguments);
              return l(new Uint8Array(Array.prototype.slice.apply(g, u)));
            }),
          g
        );
      }
      function At(g) {
        return (x(g) && !(g.length % 2)) || P(g);
      }
      function P(g) {
        if (g == null) return !1;
        if (g.constructor === Uint8Array) return !0;
        if (typeof g == "string" || g.length == null) return !1;
        for (let u = 0; u < g.length; u++) {
          const c = g[u];
          if (typeof c != "number" || c < 0 || c >= 256 || c % 1) return !1;
        }
        return !0;
      }
      function C(g, u) {
        if ((u || (u = {}), typeof g == "number")) {
          d.checkSafeUint53(g, "invalid arrayify value");
          const c = [];
          for (; g; ) c.unshift(g & 255), (g = parseInt(String(g / 256)));
          return c.length === 0 && c.push(0), l(new Uint8Array(c));
        }
        if (
          (u.allowMissingPrefix &&
            typeof g == "string" &&
            g.substring(0, 2) !== "0x" &&
            (g = "0x" + g),
          B(g) && (g = g.toHexString()),
          x(g))
        ) {
          let c = g.substring(2);
          c.length % 2 &&
            (u.hexPad === "left"
              ? (c = "0x0" + c.substring(2))
              : u.hexPad === "right"
              ? (c += "0")
              : d.throwArgumentError("hex data is odd-length", "value", g));
          const f = [];
          for (let t = 0; t < c.length; t += 2)
            f.push(parseInt(c.substring(t, t + 2), 16));
          return l(new Uint8Array(f));
        }
        return P(g)
          ? l(new Uint8Array(g))
          : d.throwArgumentError("invalid arrayify value", "value", g);
      }
      function xt(g) {
        const u = g.map((t) => C(t)),
          c = u.reduce((t, e) => t + e.length, 0),
          f = new Uint8Array(c);
        return u.reduce((t, e) => (f.set(e, t), t + e.length), 0), l(f);
      }
      function Nt(g) {
        let u = C(g);
        if (u.length === 0) return u;
        let c = 0;
        for (; c < u.length && u[c] === 0; ) c++;
        return c && (u = u.slice(c)), u;
      }
      function S(g, u) {
        (g = C(g)),
          g.length > u &&
            d.throwArgumentError("value out of range", "value", arguments[0]);
        const c = new Uint8Array(u);
        return c.set(g, u - g.length), l(c);
      }
      function x(g, u) {
        return !(
          typeof g != "string" ||
          !g.match(/^0x[0-9A-Fa-f]*$/) ||
          (u && g.length !== 2 + 2 * u)
        );
      }
      const M = "0123456789abcdef";
      function p(g, u) {
        if ((u || (u = {}), typeof g == "number")) {
          d.checkSafeUint53(g, "invalid hexlify value");
          let c = "";
          for (; g; ) (c = M[g & 15] + c), (g = Math.floor(g / 16));
          return c.length ? (c.length % 2 && (c = "0" + c), "0x" + c) : "0x00";
        }
        if (
          (u.allowMissingPrefix &&
            typeof g == "string" &&
            g.substring(0, 2) !== "0x" &&
            (g = "0x" + g),
          B(g))
        )
          return g.toHexString();
        if (x(g))
          return (
            g.length % 2 &&
              (u.hexPad === "left"
                ? (g = "0x0" + g.substring(2))
                : u.hexPad === "right"
                ? (g += "0")
                : d.throwArgumentError("hex data is odd-length", "value", g)),
            g.toLowerCase()
          );
        if (P(g)) {
          let c = "0x";
          for (let f = 0; f < g.length; f++) {
            let t = g[f];
            c += M[(t & 240) >> 4] + M[t & 15];
          }
          return c;
        }
        return d.throwArgumentError("invalid hexlify value", "value", g);
      }
      function w(g) {
        if (typeof g != "string") g = p(g);
        else if (!x(g) || g.length % 2) return null;
        return (g.length - 2) / 2;
      }
      function R(g, u, c) {
        return (
          typeof g != "string"
            ? (g = p(g))
            : (!x(g) || g.length % 2) &&
              d.throwArgumentError("invalid hexData", "value", g),
          (u = 2 + 2 * u),
          c != null ? "0x" + g.substring(u, 2 + 2 * c) : "0x" + g.substring(u)
        );
      }
      function D(g) {
        let u = "0x";
        return (
          g.forEach((c) => {
            u += p(c).substring(2);
          }),
          u
        );
      }
      function yt(g) {
        const u = A(p(g, { hexPad: "left" }));
        return u === "0x" ? "0x0" : u;
      }
      function A(g) {
        typeof g != "string" && (g = p(g)),
          x(g) || d.throwArgumentError("invalid hex string", "value", g),
          (g = g.substring(2));
        let u = 0;
        for (; u < g.length && g[u] === "0"; ) u++;
        return "0x" + g.substring(u);
      }
      function v(g, u) {
        for (
          typeof g != "string"
            ? (g = p(g))
            : x(g) || d.throwArgumentError("invalid hex string", "value", g),
            g.length > 2 * u + 2 &&
              d.throwArgumentError("value out of range", "value", arguments[1]);
          g.length < 2 * u + 2;

        )
          g = "0x0" + g.substring(2);
        return g;
      }
      function N(g) {
        const u = { r: "0x", s: "0x", _vs: "0x", recoveryParam: 0, v: 0 };
        if (At(g)) {
          const c = C(g);
          c.length !== 65 &&
            d.throwArgumentError(
              "invalid signature string; must be 65 bytes",
              "signature",
              g
            ),
            (u.r = p(c.slice(0, 32))),
            (u.s = p(c.slice(32, 64))),
            (u.v = c[64]),
            u.v < 27 &&
              (u.v === 0 || u.v === 1
                ? (u.v += 27)
                : d.throwArgumentError(
                    "signature invalid v byte",
                    "signature",
                    g
                  )),
            (u.recoveryParam = 1 - (u.v % 2)),
            u.recoveryParam && (c[32] |= 128),
            (u._vs = p(c.slice(32, 64)));
        } else {
          if (
            ((u.r = g.r),
            (u.s = g.s),
            (u.v = g.v),
            (u.recoveryParam = g.recoveryParam),
            (u._vs = g._vs),
            u._vs != null)
          ) {
            const t = S(C(u._vs), 32);
            u._vs = p(t);
            const e = t[0] >= 128 ? 1 : 0;
            u.recoveryParam == null
              ? (u.recoveryParam = e)
              : u.recoveryParam !== e &&
                d.throwArgumentError(
                  "signature recoveryParam mismatch _vs",
                  "signature",
                  g
                ),
              (t[0] &= 127);
            const i = p(t);
            u.s == null
              ? (u.s = i)
              : u.s !== i &&
                d.throwArgumentError(
                  "signature v mismatch _vs",
                  "signature",
                  g
                );
          }
          u.recoveryParam == null
            ? u.v == null
              ? d.throwArgumentError(
                  "signature missing v and recoveryParam",
                  "signature",
                  g
                )
              : (u.recoveryParam = 1 - (u.v % 2))
            : u.v == null
            ? (u.v = 27 + u.recoveryParam)
            : u.recoveryParam !== 1 - (u.v % 2) &&
              d.throwArgumentError(
                "signature recoveryParam mismatch v",
                "signature",
                g
              ),
            u.r == null || !x(u.r)
              ? d.throwArgumentError(
                  "signature missing or invalid r",
                  "signature",
                  g
                )
              : (u.r = v(u.r, 32)),
            u.s == null || !x(u.s)
              ? d.throwArgumentError(
                  "signature missing or invalid s",
                  "signature",
                  g
                )
              : (u.s = v(u.s, 32));
          const c = C(u.s);
          c[0] >= 128 &&
            d.throwArgumentError("signature s out of range", "signature", g),
            u.recoveryParam && (c[0] |= 128);
          const f = p(c);
          u._vs &&
            (x(u._vs) ||
              d.throwArgumentError("signature invalid _vs", "signature", g),
            (u._vs = v(u._vs, 32))),
            u._vs == null
              ? (u._vs = f)
              : u._vs !== f &&
                d.throwArgumentError(
                  "signature _vs mismatch v and s",
                  "signature",
                  g
                );
        }
        return u;
      }
      function F(g) {
        return (g = N(g)), p(xt([g.r, g.s, g.recoveryParam ? "0x1c" : "0x1b"]));
      }
    },
    711: (Et, bt, U) => {
      "use strict";
      U.d(bt, { Yd: () => S });
      const wt = "logger/5.0.9";
      let _t = !1,
        d = !1;
      const B = { debug: 1, default: 2, info: 2, warning: 3, error: 4, off: 5 };
      let l = B.default,
        At = null;
      function P() {
        try {
          const x = [];
          if (
            (["NFD", "NFC", "NFKD", "NFKC"].forEach((M) => {
              try {
                if ("test".normalize(M) !== "test")
                  throw new Error("bad normalize");
              } catch (p) {
                x.push(M);
              }
            }),
            x.length)
          )
            throw new Error("missing " + x.join(", "));
          if (
            String.fromCharCode(233).normalize("NFD") !==
            String.fromCharCode(101, 769)
          )
            throw new Error("broken implementation");
        } catch (x) {
          return x.message;
        }
        return null;
      }
      const C = P();
      var xt;
      (function (x) {
        (x.DEBUG = "DEBUG"),
          (x.INFO = "INFO"),
          (x.WARNING = "WARNING"),
          (x.ERROR = "ERROR"),
          (x.OFF = "OFF");
      })(xt || (xt = {}));
      var Nt;
      (function (x) {
        (x.UNKNOWN_ERROR = "UNKNOWN_ERROR"),
          (x.NOT_IMPLEMENTED = "NOT_IMPLEMENTED"),
          (x.UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION"),
          (x.NETWORK_ERROR = "NETWORK_ERROR"),
          (x.SERVER_ERROR = "SERVER_ERROR"),
          (x.TIMEOUT = "TIMEOUT"),
          (x.BUFFER_OVERRUN = "BUFFER_OVERRUN"),
          (x.NUMERIC_FAULT = "NUMERIC_FAULT"),
          (x.MISSING_NEW = "MISSING_NEW"),
          (x.INVALID_ARGUMENT = "INVALID_ARGUMENT"),
          (x.MISSING_ARGUMENT = "MISSING_ARGUMENT"),
          (x.UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT"),
          (x.CALL_EXCEPTION = "CALL_EXCEPTION"),
          (x.INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"),
          (x.NONCE_EXPIRED = "NONCE_EXPIRED"),
          (x.REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED"),
          (x.UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT");
      })(Nt || (Nt = {}));
      class S {
        constructor(M) {
          Object.defineProperty(this, "version", {
            enumerable: !0,
            value: M,
            writable: !1,
          });
        }
        _log(M, p) {
          const w = M.toLowerCase();
          B[w] == null &&
            this.throwArgumentError("invalid log level name", "logLevel", M),
            !(l > B[w]) && console.log.apply(console, p);
        }
        debug(...M) {
          this._log(S.levels.DEBUG, M);
        }
        info(...M) {
          this._log(S.levels.INFO, M);
        }
        warn(...M) {
          this._log(S.levels.WARNING, M);
        }
        makeError(M, p, w) {
          if (d) return this.makeError("censored error", p, {});
          p || (p = S.errors.UNKNOWN_ERROR), w || (w = {});
          const R = [];
          Object.keys(w).forEach((A) => {
            try {
              R.push(A + "=" + JSON.stringify(w[A]));
            } catch (v) {
              R.push(A + "=" + JSON.stringify(w[A].toString()));
            }
          }),
            R.push(`code=${p}`),
            R.push(`version=${this.version}`);
          const D = M;
          R.length && (M += " (" + R.join(", ") + ")");
          const yt = new Error(M);
          return (
            (yt.reason = D),
            (yt.code = p),
            Object.keys(w).forEach(function (A) {
              yt[A] = w[A];
            }),
            yt
          );
        }
        throwError(M, p, w) {
          throw this.makeError(M, p, w);
        }
        throwArgumentError(M, p, w) {
          return this.throwError(M, S.errors.INVALID_ARGUMENT, {
            argument: p,
            value: w,
          });
        }
        assert(M, p, w, R) {
          M || this.throwError(p, w, R);
        }
        assertArgument(M, p, w, R) {
          M || this.throwArgumentError(p, w, R);
        }
        checkNormalize(M) {
          M == null && (M = "platform missing String.prototype.normalize"),
            C &&
              this.throwError(
                "platform missing String.prototype.normalize",
                S.errors.UNSUPPORTED_OPERATION,
                { operation: "String.prototype.normalize", form: C }
              );
        }
        checkSafeUint53(M, p) {
          typeof M == "number" &&
            (p == null && (p = "value not safe"),
            (M < 0 || M >= 9007199254740991) &&
              this.throwError(p, S.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "out-of-safe-range",
                value: M,
              }),
            M % 1 &&
              this.throwError(p, S.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "non-integer",
                value: M,
              }));
        }
        checkArgumentCount(M, p, w) {
          w ? (w = ": " + w) : (w = ""),
            M < p &&
              this.throwError(
                "missing argument" + w,
                S.errors.MISSING_ARGUMENT,
                { count: M, expectedCount: p }
              ),
            M > p &&
              this.throwError(
                "too many arguments" + w,
                S.errors.UNEXPECTED_ARGUMENT,
                { count: M, expectedCount: p }
              );
        }
        checkNew(M, p) {
          (M === Object || M == null) &&
            this.throwError("missing new", S.errors.MISSING_NEW, {
              name: p.name,
            });
        }
        checkAbstract(M, p) {
          M === p
            ? this.throwError(
                "cannot instantiate abstract class " +
                  JSON.stringify(p.name) +
                  " directly; use a sub-class",
                S.errors.UNSUPPORTED_OPERATION,
                { name: M.name, operation: "new" }
              )
            : (M === Object || M == null) &&
              this.throwError("missing new", S.errors.MISSING_NEW, {
                name: p.name,
              });
        }
        static globalLogger() {
          return At || (At = new S(wt)), At;
        }
        static setCensorship(M, p) {
          if (
            (!M &&
              p &&
              this.globalLogger().throwError(
                "cannot permanently disable censorship",
                S.errors.UNSUPPORTED_OPERATION,
                { operation: "setCensorship" }
              ),
            _t)
          ) {
            if (!M) return;
            this.globalLogger().throwError(
              "error censorship permanent",
              S.errors.UNSUPPORTED_OPERATION,
              { operation: "setCensorship" }
            );
          }
          (d = !!M), (_t = !!p);
        }
        static setLogLevel(M) {
          const p = B[M.toLowerCase()];
          if (p == null) {
            S.globalLogger().warn("invalid log level - " + M);
            return;
          }
          l = p;
        }
        static from(M) {
          return new S(M);
        }
      }
      (S.errors = Nt), (S.levels = xt);
    },
    3550: function (Et, bt, U) {
      (Et = U.nmd(Et)),
        (function (wt, _t) {
          "use strict";
          function d(f, t) {
            if (!f) throw new Error(t || "Assertion failed");
          }
          function B(f, t) {
            f.super_ = t;
            var e = function () {};
            (e.prototype = t.prototype),
              (f.prototype = new e()),
              (f.prototype.constructor = f);
          }
          function l(f, t, e) {
            if (l.isBN(f)) return f;
            (this.negative = 0),
              (this.words = null),
              (this.length = 0),
              (this.red = null),
              f !== null &&
                ((t === "le" || t === "be") && ((e = t), (t = 10)),
                this._init(f || 0, t || 10, e || "be"));
          }
          typeof wt == "object" ? (wt.exports = l) : (_t.BN = l),
            (l.BN = l),
            (l.wordSize = 26);
          var At;
          try {
            At = U(2574).Buffer;
          } catch (f) {}
          (l.isBN = function (t) {
            return t instanceof l
              ? !0
              : t !== null &&
                  typeof t == "object" &&
                  t.constructor.wordSize === l.wordSize &&
                  Array.isArray(t.words);
          }),
            (l.max = function (t, e) {
              return t.cmp(e) > 0 ? t : e;
            }),
            (l.min = function (t, e) {
              return t.cmp(e) < 0 ? t : e;
            }),
            (l.prototype._init = function (t, e, i) {
              if (typeof t == "number") return this._initNumber(t, e, i);
              if (typeof t == "object") return this._initArray(t, e, i);
              e === "hex" && (e = 16),
                d(e === (e | 0) && e >= 2 && e <= 36),
                (t = t.toString().replace(/\s+/g, ""));
              var n = 0;
              t[0] === "-" && n++,
                e === 16 ? this._parseHex(t, n) : this._parseBase(t, e, n),
                t[0] === "-" && (this.negative = 1),
                this.strip(),
                i === "le" && this._initArray(this.toArray(), e, i);
            }),
            (l.prototype._initNumber = function (t, e, i) {
              t < 0 && ((this.negative = 1), (t = -t)),
                t < 67108864
                  ? ((this.words = [t & 67108863]), (this.length = 1))
                  : t < 4503599627370496
                  ? ((this.words = [t & 67108863, (t / 67108864) & 67108863]),
                    (this.length = 2))
                  : (d(t < 9007199254740992),
                    (this.words = [t & 67108863, (t / 67108864) & 67108863, 1]),
                    (this.length = 3)),
                i === "le" && this._initArray(this.toArray(), e, i);
            }),
            (l.prototype._initArray = function (t, e, i) {
              if ((d(typeof t.length == "number"), t.length <= 0))
                return (this.words = [0]), (this.length = 1), this;
              (this.length = Math.ceil(t.length / 3)),
                (this.words = new Array(this.length));
              for (var n = 0; n < this.length; n++) this.words[n] = 0;
              var s,
                a,
                m = 0;
              if (i === "be")
                for (n = t.length - 1, s = 0; n >= 0; n -= 3)
                  (a = t[n] | (t[n - 1] << 8) | (t[n - 2] << 16)),
                    (this.words[s] |= (a << m) & 67108863),
                    (this.words[s + 1] = (a >>> (26 - m)) & 67108863),
                    (m += 24),
                    m >= 26 && ((m -= 26), s++);
              else if (i === "le")
                for (n = 0, s = 0; n < t.length; n += 3)
                  (a = t[n] | (t[n + 1] << 8) | (t[n + 2] << 16)),
                    (this.words[s] |= (a << m) & 67108863),
                    (this.words[s + 1] = (a >>> (26 - m)) & 67108863),
                    (m += 24),
                    m >= 26 && ((m -= 26), s++);
              return this.strip();
            });
          function P(f, t, e) {
            for (var i = 0, n = Math.min(f.length, e), s = t; s < n; s++) {
              var a = f.charCodeAt(s) - 48;
              (i <<= 4),
                a >= 49 && a <= 54
                  ? (i |= a - 49 + 10)
                  : a >= 17 && a <= 22
                  ? (i |= a - 17 + 10)
                  : (i |= a & 15);
            }
            return i;
          }
          l.prototype._parseHex = function (t, e) {
            (this.length = Math.ceil((t.length - e) / 6)),
              (this.words = new Array(this.length));
            for (var i = 0; i < this.length; i++) this.words[i] = 0;
            var n,
              s,
              a = 0;
            for (i = t.length - 6, n = 0; i >= e; i -= 6)
              (s = P(t, i, i + 6)),
                (this.words[n] |= (s << a) & 67108863),
                (this.words[n + 1] |= (s >>> (26 - a)) & 4194303),
                (a += 24),
                a >= 26 && ((a -= 26), n++);
            i + 6 !== e &&
              ((s = P(t, e, i + 6)),
              (this.words[n] |= (s << a) & 67108863),
              (this.words[n + 1] |= (s >>> (26 - a)) & 4194303)),
              this.strip();
          };
          function C(f, t, e, i) {
            for (var n = 0, s = Math.min(f.length, e), a = t; a < s; a++) {
              var m = f.charCodeAt(a) - 48;
              (n *= i),
                m >= 49
                  ? (n += m - 49 + 10)
                  : m >= 17
                  ? (n += m - 17 + 10)
                  : (n += m);
            }
            return n;
          }
          (l.prototype._parseBase = function (t, e, i) {
            (this.words = [0]), (this.length = 1);
            for (var n = 0, s = 1; s <= 67108863; s *= e) n++;
            n--, (s = (s / e) | 0);
            for (
              var a = t.length - i,
                m = a % n,
                o = Math.min(a, a - m) + i,
                r = 0,
                h = i;
              h < o;
              h += n
            )
              (r = C(t, h, h + n, e)),
                this.imuln(s),
                this.words[0] + r < 67108864
                  ? (this.words[0] += r)
                  : this._iaddn(r);
            if (m !== 0) {
              var y = 1;
              for (r = C(t, h, t.length, e), h = 0; h < m; h++) y *= e;
              this.imuln(y),
                this.words[0] + r < 67108864
                  ? (this.words[0] += r)
                  : this._iaddn(r);
            }
          }),
            (l.prototype.copy = function (t) {
              t.words = new Array(this.length);
              for (var e = 0; e < this.length; e++) t.words[e] = this.words[e];
              (t.length = this.length),
                (t.negative = this.negative),
                (t.red = this.red);
            }),
            (l.prototype.clone = function () {
              var t = new l(null);
              return this.copy(t), t;
            }),
            (l.prototype._expand = function (t) {
              for (; this.length < t; ) this.words[this.length++] = 0;
              return this;
            }),
            (l.prototype.strip = function () {
              for (; this.length > 1 && this.words[this.length - 1] === 0; )
                this.length--;
              return this._normSign();
            }),
            (l.prototype._normSign = function () {
              return (
                this.length === 1 && this.words[0] === 0 && (this.negative = 0),
                this
              );
            }),
            (l.prototype.inspect = function () {
              return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
            });
          var xt = [
              "",
              "0",
              "00",
              "000",
              "0000",
              "00000",
              "000000",
              "0000000",
              "00000000",
              "000000000",
              "0000000000",
              "00000000000",
              "000000000000",
              "0000000000000",
              "00000000000000",
              "000000000000000",
              "0000000000000000",
              "00000000000000000",
              "000000000000000000",
              "0000000000000000000",
              "00000000000000000000",
              "000000000000000000000",
              "0000000000000000000000",
              "00000000000000000000000",
              "000000000000000000000000",
              "0000000000000000000000000",
            ],
            Nt = [
              0,
              0,
              25,
              16,
              12,
              11,
              10,
              9,
              8,
              8,
              7,
              7,
              7,
              7,
              6,
              6,
              6,
              6,
              6,
              6,
              6,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
              5,
            ],
            S = [
              0,
              0,
              33554432,
              43046721,
              16777216,
              48828125,
              60466176,
              40353607,
              16777216,
              43046721,
              1e7,
              19487171,
              35831808,
              62748517,
              7529536,
              11390625,
              16777216,
              24137569,
              34012224,
              47045881,
              64e6,
              4084101,
              5153632,
              6436343,
              7962624,
              9765625,
              11881376,
              14348907,
              17210368,
              20511149,
              243e5,
              28629151,
              33554432,
              39135393,
              45435424,
              52521875,
              60466176,
            ];
          (l.prototype.toString = function (t, e) {
            (t = t || 10), (e = e | 0 || 1);
            var i;
            if (t === 16 || t === "hex") {
              i = "";
              for (var n = 0, s = 0, a = 0; a < this.length; a++) {
                var m = this.words[a],
                  o = (((m << n) | s) & 16777215).toString(16);
                (s = (m >>> (24 - n)) & 16777215),
                  s !== 0 || a !== this.length - 1
                    ? (i = xt[6 - o.length] + o + i)
                    : (i = o + i),
                  (n += 2),
                  n >= 26 && ((n -= 26), a--);
              }
              for (s !== 0 && (i = s.toString(16) + i); i.length % e != 0; )
                i = "0" + i;
              return this.negative !== 0 && (i = "-" + i), i;
            }
            if (t === (t | 0) && t >= 2 && t <= 36) {
              var r = Nt[t],
                h = S[t];
              i = "";
              var y = this.clone();
              for (y.negative = 0; !y.isZero(); ) {
                var b = y.modn(h).toString(t);
                (y = y.idivn(h)),
                  y.isZero() ? (i = b + i) : (i = xt[r - b.length] + b + i);
              }
              for (this.isZero() && (i = "0" + i); i.length % e != 0; )
                i = "0" + i;
              return this.negative !== 0 && (i = "-" + i), i;
            }
            d(!1, "Base should be between 2 and 36");
          }),
            (l.prototype.toNumber = function () {
              var t = this.words[0];
              return (
                this.length === 2
                  ? (t += this.words[1] * 67108864)
                  : this.length === 3 && this.words[2] === 1
                  ? (t += 4503599627370496 + this.words[1] * 67108864)
                  : this.length > 2 &&
                    d(!1, "Number can only safely store up to 53 bits"),
                this.negative !== 0 ? -t : t
              );
            }),
            (l.prototype.toJSON = function () {
              return this.toString(16);
            }),
            (l.prototype.toBuffer = function (t, e) {
              return d(typeof At != "undefined"), this.toArrayLike(At, t, e);
            }),
            (l.prototype.toArray = function (t, e) {
              return this.toArrayLike(Array, t, e);
            }),
            (l.prototype.toArrayLike = function (t, e, i) {
              var n = this.byteLength(),
                s = i || Math.max(1, n);
              d(n <= s, "byte array longer than desired length"),
                d(s > 0, "Requested array length <= 0"),
                this.strip();
              var a = e === "le",
                m = new t(s),
                o,
                r,
                h = this.clone();
              if (a) {
                for (r = 0; !h.isZero(); r++)
                  (o = h.andln(255)), h.iushrn(8), (m[r] = o);
                for (; r < s; r++) m[r] = 0;
              } else {
                for (r = 0; r < s - n; r++) m[r] = 0;
                for (r = 0; !h.isZero(); r++)
                  (o = h.andln(255)), h.iushrn(8), (m[s - r - 1] = o);
              }
              return m;
            }),
            Math.clz32
              ? (l.prototype._countBits = function (t) {
                  return 32 - Math.clz32(t);
                })
              : (l.prototype._countBits = function (t) {
                  var e = t,
                    i = 0;
                  return (
                    e >= 4096 && ((i += 13), (e >>>= 13)),
                    e >= 64 && ((i += 7), (e >>>= 7)),
                    e >= 8 && ((i += 4), (e >>>= 4)),
                    e >= 2 && ((i += 2), (e >>>= 2)),
                    i + e
                  );
                }),
            (l.prototype._zeroBits = function (t) {
              if (t === 0) return 26;
              var e = t,
                i = 0;
              return (
                (e & 8191) == 0 && ((i += 13), (e >>>= 13)),
                (e & 127) == 0 && ((i += 7), (e >>>= 7)),
                (e & 15) == 0 && ((i += 4), (e >>>= 4)),
                (e & 3) == 0 && ((i += 2), (e >>>= 2)),
                (e & 1) == 0 && i++,
                i
              );
            }),
            (l.prototype.bitLength = function () {
              var t = this.words[this.length - 1],
                e = this._countBits(t);
              return (this.length - 1) * 26 + e;
            });
          function x(f) {
            for (var t = new Array(f.bitLength()), e = 0; e < t.length; e++) {
              var i = (e / 26) | 0,
                n = e % 26;
              t[e] = (f.words[i] & (1 << n)) >>> n;
            }
            return t;
          }
          (l.prototype.zeroBits = function () {
            if (this.isZero()) return 0;
            for (var t = 0, e = 0; e < this.length; e++) {
              var i = this._zeroBits(this.words[e]);
              if (((t += i), i !== 26)) break;
            }
            return t;
          }),
            (l.prototype.byteLength = function () {
              return Math.ceil(this.bitLength() / 8);
            }),
            (l.prototype.toTwos = function (t) {
              return this.negative !== 0
                ? this.abs().inotn(t).iaddn(1)
                : this.clone();
            }),
            (l.prototype.fromTwos = function (t) {
              return this.testn(t - 1)
                ? this.notn(t).iaddn(1).ineg()
                : this.clone();
            }),
            (l.prototype.isNeg = function () {
              return this.negative !== 0;
            }),
            (l.prototype.neg = function () {
              return this.clone().ineg();
            }),
            (l.prototype.ineg = function () {
              return this.isZero() || (this.negative ^= 1), this;
            }),
            (l.prototype.iuor = function (t) {
              for (; this.length < t.length; ) this.words[this.length++] = 0;
              for (var e = 0; e < t.length; e++)
                this.words[e] = this.words[e] | t.words[e];
              return this.strip();
            }),
            (l.prototype.ior = function (t) {
              return d((this.negative | t.negative) == 0), this.iuor(t);
            }),
            (l.prototype.or = function (t) {
              return this.length > t.length
                ? this.clone().ior(t)
                : t.clone().ior(this);
            }),
            (l.prototype.uor = function (t) {
              return this.length > t.length
                ? this.clone().iuor(t)
                : t.clone().iuor(this);
            }),
            (l.prototype.iuand = function (t) {
              var e;
              this.length > t.length ? (e = t) : (e = this);
              for (var i = 0; i < e.length; i++)
                this.words[i] = this.words[i] & t.words[i];
              return (this.length = e.length), this.strip();
            }),
            (l.prototype.iand = function (t) {
              return d((this.negative | t.negative) == 0), this.iuand(t);
            }),
            (l.prototype.and = function (t) {
              return this.length > t.length
                ? this.clone().iand(t)
                : t.clone().iand(this);
            }),
            (l.prototype.uand = function (t) {
              return this.length > t.length
                ? this.clone().iuand(t)
                : t.clone().iuand(this);
            }),
            (l.prototype.iuxor = function (t) {
              var e, i;
              this.length > t.length
                ? ((e = this), (i = t))
                : ((e = t), (i = this));
              for (var n = 0; n < i.length; n++)
                this.words[n] = e.words[n] ^ i.words[n];
              if (this !== e)
                for (; n < e.length; n++) this.words[n] = e.words[n];
              return (this.length = e.length), this.strip();
            }),
            (l.prototype.ixor = function (t) {
              return d((this.negative | t.negative) == 0), this.iuxor(t);
            }),
            (l.prototype.xor = function (t) {
              return this.length > t.length
                ? this.clone().ixor(t)
                : t.clone().ixor(this);
            }),
            (l.prototype.uxor = function (t) {
              return this.length > t.length
                ? this.clone().iuxor(t)
                : t.clone().iuxor(this);
            }),
            (l.prototype.inotn = function (t) {
              d(typeof t == "number" && t >= 0);
              var e = Math.ceil(t / 26) | 0,
                i = t % 26;
              this._expand(e), i > 0 && e--;
              for (var n = 0; n < e; n++)
                this.words[n] = ~this.words[n] & 67108863;
              return (
                i > 0 &&
                  (this.words[n] = ~this.words[n] & (67108863 >> (26 - i))),
                this.strip()
              );
            }),
            (l.prototype.notn = function (t) {
              return this.clone().inotn(t);
            }),
            (l.prototype.setn = function (t, e) {
              d(typeof t == "number" && t >= 0);
              var i = (t / 26) | 0,
                n = t % 26;
              return (
                this._expand(i + 1),
                e
                  ? (this.words[i] = this.words[i] | (1 << n))
                  : (this.words[i] = this.words[i] & ~(1 << n)),
                this.strip()
              );
            }),
            (l.prototype.iadd = function (t) {
              var e;
              if (this.negative !== 0 && t.negative === 0)
                return (
                  (this.negative = 0),
                  (e = this.isub(t)),
                  (this.negative ^= 1),
                  this._normSign()
                );
              if (this.negative === 0 && t.negative !== 0)
                return (
                  (t.negative = 0),
                  (e = this.isub(t)),
                  (t.negative = 1),
                  e._normSign()
                );
              var i, n;
              this.length > t.length
                ? ((i = this), (n = t))
                : ((i = t), (n = this));
              for (var s = 0, a = 0; a < n.length; a++)
                (e = (i.words[a] | 0) + (n.words[a] | 0) + s),
                  (this.words[a] = e & 67108863),
                  (s = e >>> 26);
              for (; s !== 0 && a < i.length; a++)
                (e = (i.words[a] | 0) + s),
                  (this.words[a] = e & 67108863),
                  (s = e >>> 26);
              if (((this.length = i.length), s !== 0))
                (this.words[this.length] = s), this.length++;
              else if (i !== this)
                for (; a < i.length; a++) this.words[a] = i.words[a];
              return this;
            }),
            (l.prototype.add = function (t) {
              var e;
              return t.negative !== 0 && this.negative === 0
                ? ((t.negative = 0), (e = this.sub(t)), (t.negative ^= 1), e)
                : t.negative === 0 && this.negative !== 0
                ? ((this.negative = 0),
                  (e = t.sub(this)),
                  (this.negative = 1),
                  e)
                : this.length > t.length
                ? this.clone().iadd(t)
                : t.clone().iadd(this);
            }),
            (l.prototype.isub = function (t) {
              if (t.negative !== 0) {
                t.negative = 0;
                var e = this.iadd(t);
                return (t.negative = 1), e._normSign();
              } else if (this.negative !== 0)
                return (
                  (this.negative = 0),
                  this.iadd(t),
                  (this.negative = 1),
                  this._normSign()
                );
              var i = this.cmp(t);
              if (i === 0)
                return (
                  (this.negative = 0),
                  (this.length = 1),
                  (this.words[0] = 0),
                  this
                );
              var n, s;
              i > 0 ? ((n = this), (s = t)) : ((n = t), (s = this));
              for (var a = 0, m = 0; m < s.length; m++)
                (e = (n.words[m] | 0) - (s.words[m] | 0) + a),
                  (a = e >> 26),
                  (this.words[m] = e & 67108863);
              for (; a !== 0 && m < n.length; m++)
                (e = (n.words[m] | 0) + a),
                  (a = e >> 26),
                  (this.words[m] = e & 67108863);
              if (a === 0 && m < n.length && n !== this)
                for (; m < n.length; m++) this.words[m] = n.words[m];
              return (
                (this.length = Math.max(this.length, m)),
                n !== this && (this.negative = 1),
                this.strip()
              );
            }),
            (l.prototype.sub = function (t) {
              return this.clone().isub(t);
            });
          function M(f, t, e) {
            e.negative = t.negative ^ f.negative;
            var i = (f.length + t.length) | 0;
            (e.length = i), (i = (i - 1) | 0);
            var n = f.words[0] | 0,
              s = t.words[0] | 0,
              a = n * s,
              m = a & 67108863,
              o = (a / 67108864) | 0;
            e.words[0] = m;
            for (var r = 1; r < i; r++) {
              for (
                var h = o >>> 26,
                  y = o & 67108863,
                  b = Math.min(r, t.length - 1),
                  _ = Math.max(0, r - f.length + 1);
                _ <= b;
                _++
              ) {
                var E = (r - _) | 0;
                (n = f.words[E] | 0),
                  (s = t.words[_] | 0),
                  (a = n * s + y),
                  (h += (a / 67108864) | 0),
                  (y = a & 67108863);
              }
              (e.words[r] = y | 0), (o = h | 0);
            }
            return o !== 0 ? (e.words[r] = o | 0) : e.length--, e.strip();
          }
          var p = function (t, e, i) {
            var n = t.words,
              s = e.words,
              a = i.words,
              m = 0,
              o,
              r,
              h,
              y = n[0] | 0,
              b = y & 8191,
              _ = y >>> 13,
              E = n[1] | 0,
              T = E & 8191,
              k = E >>> 13,
              St = n[2] | 0,
              I = St & 8191,
              O = St >>> 13,
              Ht = n[3] | 0,
              L = Ht & 8191,
              Z = Ht >>> 13,
              Vt = n[4] | 0,
              q = Vt & 8191,
              z = Vt >>> 13,
              Xt = n[5] | 0,
              W = Xt & 8191,
              G = Xt >>> 13,
              Yt = n[6] | 0,
              $ = Yt & 8191,
              K = Yt >>> 13,
              Jt = n[7] | 0,
              H = Jt & 8191,
              V = Jt >>> 13,
              Qt = n[8] | 0,
              X = Qt & 8191,
              Y = Qt >>> 13,
              jt = n[9] | 0,
              J = jt & 8191,
              Q = jt >>> 13,
              tr = s[0] | 0,
              j = tr & 8191,
              tt = tr >>> 13,
              rr = s[1] | 0,
              rt = rr & 8191,
              et = rr >>> 13,
              er = s[2] | 0,
              it = er & 8191,
              nt = er >>> 13,
              ir = s[3] | 0,
              st = ir & 8191,
              ot = ir >>> 13,
              nr = s[4] | 0,
              ht = nr & 8191,
              ft = nr >>> 13,
              sr = s[5] | 0,
              at = sr & 8191,
              lt = sr >>> 13,
              or = s[6] | 0,
              ut = or & 8191,
              mt = or >>> 13,
              hr = s[7] | 0,
              gt = hr & 8191,
              ct = hr >>> 13,
              fr = s[8] | 0,
              dt = fr & 8191,
              vt = fr >>> 13,
              ar = s[9] | 0,
              pt = ar & 8191,
              Mt = ar >>> 13;
            (i.negative = t.negative ^ e.negative),
              (i.length = 19),
              (o = Math.imul(b, j)),
              (r = Math.imul(b, tt)),
              (r = (r + Math.imul(_, j)) | 0),
              (h = Math.imul(_, tt));
            var Rt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Rt >>> 26)) | 0),
              (Rt &= 67108863),
              (o = Math.imul(T, j)),
              (r = Math.imul(T, tt)),
              (r = (r + Math.imul(k, j)) | 0),
              (h = Math.imul(k, tt)),
              (o = (o + Math.imul(b, rt)) | 0),
              (r = (r + Math.imul(b, et)) | 0),
              (r = (r + Math.imul(_, rt)) | 0),
              (h = (h + Math.imul(_, et)) | 0);
            var Tt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Tt >>> 26)) | 0),
              (Tt &= 67108863),
              (o = Math.imul(I, j)),
              (r = Math.imul(I, tt)),
              (r = (r + Math.imul(O, j)) | 0),
              (h = Math.imul(O, tt)),
              (o = (o + Math.imul(T, rt)) | 0),
              (r = (r + Math.imul(T, et)) | 0),
              (r = (r + Math.imul(k, rt)) | 0),
              (h = (h + Math.imul(k, et)) | 0),
              (o = (o + Math.imul(b, it)) | 0),
              (r = (r + Math.imul(b, nt)) | 0),
              (r = (r + Math.imul(_, it)) | 0),
              (h = (h + Math.imul(_, nt)) | 0);
            var Pt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Pt >>> 26)) | 0),
              (Pt &= 67108863),
              (o = Math.imul(L, j)),
              (r = Math.imul(L, tt)),
              (r = (r + Math.imul(Z, j)) | 0),
              (h = Math.imul(Z, tt)),
              (o = (o + Math.imul(I, rt)) | 0),
              (r = (r + Math.imul(I, et)) | 0),
              (r = (r + Math.imul(O, rt)) | 0),
              (h = (h + Math.imul(O, et)) | 0),
              (o = (o + Math.imul(T, it)) | 0),
              (r = (r + Math.imul(T, nt)) | 0),
              (r = (r + Math.imul(k, it)) | 0),
              (h = (h + Math.imul(k, nt)) | 0),
              (o = (o + Math.imul(b, st)) | 0),
              (r = (r + Math.imul(b, ot)) | 0),
              (r = (r + Math.imul(_, st)) | 0),
              (h = (h + Math.imul(_, ot)) | 0);
            var kt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (kt >>> 26)) | 0),
              (kt &= 67108863),
              (o = Math.imul(q, j)),
              (r = Math.imul(q, tt)),
              (r = (r + Math.imul(z, j)) | 0),
              (h = Math.imul(z, tt)),
              (o = (o + Math.imul(L, rt)) | 0),
              (r = (r + Math.imul(L, et)) | 0),
              (r = (r + Math.imul(Z, rt)) | 0),
              (h = (h + Math.imul(Z, et)) | 0),
              (o = (o + Math.imul(I, it)) | 0),
              (r = (r + Math.imul(I, nt)) | 0),
              (r = (r + Math.imul(O, it)) | 0),
              (h = (h + Math.imul(O, nt)) | 0),
              (o = (o + Math.imul(T, st)) | 0),
              (r = (r + Math.imul(T, ot)) | 0),
              (r = (r + Math.imul(k, st)) | 0),
              (h = (h + Math.imul(k, ot)) | 0),
              (o = (o + Math.imul(b, ht)) | 0),
              (r = (r + Math.imul(b, ft)) | 0),
              (r = (r + Math.imul(_, ht)) | 0),
              (h = (h + Math.imul(_, ft)) | 0);
            var It = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (It >>> 26)) | 0),
              (It &= 67108863),
              (o = Math.imul(W, j)),
              (r = Math.imul(W, tt)),
              (r = (r + Math.imul(G, j)) | 0),
              (h = Math.imul(G, tt)),
              (o = (o + Math.imul(q, rt)) | 0),
              (r = (r + Math.imul(q, et)) | 0),
              (r = (r + Math.imul(z, rt)) | 0),
              (h = (h + Math.imul(z, et)) | 0),
              (o = (o + Math.imul(L, it)) | 0),
              (r = (r + Math.imul(L, nt)) | 0),
              (r = (r + Math.imul(Z, it)) | 0),
              (h = (h + Math.imul(Z, nt)) | 0),
              (o = (o + Math.imul(I, st)) | 0),
              (r = (r + Math.imul(I, ot)) | 0),
              (r = (r + Math.imul(O, st)) | 0),
              (h = (h + Math.imul(O, ot)) | 0),
              (o = (o + Math.imul(T, ht)) | 0),
              (r = (r + Math.imul(T, ft)) | 0),
              (r = (r + Math.imul(k, ht)) | 0),
              (h = (h + Math.imul(k, ft)) | 0),
              (o = (o + Math.imul(b, at)) | 0),
              (r = (r + Math.imul(b, lt)) | 0),
              (r = (r + Math.imul(_, at)) | 0),
              (h = (h + Math.imul(_, lt)) | 0);
            var Ot = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Ot >>> 26)) | 0),
              (Ot &= 67108863),
              (o = Math.imul($, j)),
              (r = Math.imul($, tt)),
              (r = (r + Math.imul(K, j)) | 0),
              (h = Math.imul(K, tt)),
              (o = (o + Math.imul(W, rt)) | 0),
              (r = (r + Math.imul(W, et)) | 0),
              (r = (r + Math.imul(G, rt)) | 0),
              (h = (h + Math.imul(G, et)) | 0),
              (o = (o + Math.imul(q, it)) | 0),
              (r = (r + Math.imul(q, nt)) | 0),
              (r = (r + Math.imul(z, it)) | 0),
              (h = (h + Math.imul(z, nt)) | 0),
              (o = (o + Math.imul(L, st)) | 0),
              (r = (r + Math.imul(L, ot)) | 0),
              (r = (r + Math.imul(Z, st)) | 0),
              (h = (h + Math.imul(Z, ot)) | 0),
              (o = (o + Math.imul(I, ht)) | 0),
              (r = (r + Math.imul(I, ft)) | 0),
              (r = (r + Math.imul(O, ht)) | 0),
              (h = (h + Math.imul(O, ft)) | 0),
              (o = (o + Math.imul(T, at)) | 0),
              (r = (r + Math.imul(T, lt)) | 0),
              (r = (r + Math.imul(k, at)) | 0),
              (h = (h + Math.imul(k, lt)) | 0),
              (o = (o + Math.imul(b, ut)) | 0),
              (r = (r + Math.imul(b, mt)) | 0),
              (r = (r + Math.imul(_, ut)) | 0),
              (h = (h + Math.imul(_, mt)) | 0);
            var Ut = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Ut >>> 26)) | 0),
              (Ut &= 67108863),
              (o = Math.imul(H, j)),
              (r = Math.imul(H, tt)),
              (r = (r + Math.imul(V, j)) | 0),
              (h = Math.imul(V, tt)),
              (o = (o + Math.imul($, rt)) | 0),
              (r = (r + Math.imul($, et)) | 0),
              (r = (r + Math.imul(K, rt)) | 0),
              (h = (h + Math.imul(K, et)) | 0),
              (o = (o + Math.imul(W, it)) | 0),
              (r = (r + Math.imul(W, nt)) | 0),
              (r = (r + Math.imul(G, it)) | 0),
              (h = (h + Math.imul(G, nt)) | 0),
              (o = (o + Math.imul(q, st)) | 0),
              (r = (r + Math.imul(q, ot)) | 0),
              (r = (r + Math.imul(z, st)) | 0),
              (h = (h + Math.imul(z, ot)) | 0),
              (o = (o + Math.imul(L, ht)) | 0),
              (r = (r + Math.imul(L, ft)) | 0),
              (r = (r + Math.imul(Z, ht)) | 0),
              (h = (h + Math.imul(Z, ft)) | 0),
              (o = (o + Math.imul(I, at)) | 0),
              (r = (r + Math.imul(I, lt)) | 0),
              (r = (r + Math.imul(O, at)) | 0),
              (h = (h + Math.imul(O, lt)) | 0),
              (o = (o + Math.imul(T, ut)) | 0),
              (r = (r + Math.imul(T, mt)) | 0),
              (r = (r + Math.imul(k, ut)) | 0),
              (h = (h + Math.imul(k, mt)) | 0),
              (o = (o + Math.imul(b, gt)) | 0),
              (r = (r + Math.imul(b, ct)) | 0),
              (r = (r + Math.imul(_, gt)) | 0),
              (h = (h + Math.imul(_, ct)) | 0);
            var Bt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Bt >>> 26)) | 0),
              (Bt &= 67108863),
              (o = Math.imul(X, j)),
              (r = Math.imul(X, tt)),
              (r = (r + Math.imul(Y, j)) | 0),
              (h = Math.imul(Y, tt)),
              (o = (o + Math.imul(H, rt)) | 0),
              (r = (r + Math.imul(H, et)) | 0),
              (r = (r + Math.imul(V, rt)) | 0),
              (h = (h + Math.imul(V, et)) | 0),
              (o = (o + Math.imul($, it)) | 0),
              (r = (r + Math.imul($, nt)) | 0),
              (r = (r + Math.imul(K, it)) | 0),
              (h = (h + Math.imul(K, nt)) | 0),
              (o = (o + Math.imul(W, st)) | 0),
              (r = (r + Math.imul(W, ot)) | 0),
              (r = (r + Math.imul(G, st)) | 0),
              (h = (h + Math.imul(G, ot)) | 0),
              (o = (o + Math.imul(q, ht)) | 0),
              (r = (r + Math.imul(q, ft)) | 0),
              (r = (r + Math.imul(z, ht)) | 0),
              (h = (h + Math.imul(z, ft)) | 0),
              (o = (o + Math.imul(L, at)) | 0),
              (r = (r + Math.imul(L, lt)) | 0),
              (r = (r + Math.imul(Z, at)) | 0),
              (h = (h + Math.imul(Z, lt)) | 0),
              (o = (o + Math.imul(I, ut)) | 0),
              (r = (r + Math.imul(I, mt)) | 0),
              (r = (r + Math.imul(O, ut)) | 0),
              (h = (h + Math.imul(O, mt)) | 0),
              (o = (o + Math.imul(T, gt)) | 0),
              (r = (r + Math.imul(T, ct)) | 0),
              (r = (r + Math.imul(k, gt)) | 0),
              (h = (h + Math.imul(k, ct)) | 0),
              (o = (o + Math.imul(b, dt)) | 0),
              (r = (r + Math.imul(b, vt)) | 0),
              (r = (r + Math.imul(_, dt)) | 0),
              (h = (h + Math.imul(_, vt)) | 0);
            var Ct = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Ct >>> 26)) | 0),
              (Ct &= 67108863),
              (o = Math.imul(J, j)),
              (r = Math.imul(J, tt)),
              (r = (r + Math.imul(Q, j)) | 0),
              (h = Math.imul(Q, tt)),
              (o = (o + Math.imul(X, rt)) | 0),
              (r = (r + Math.imul(X, et)) | 0),
              (r = (r + Math.imul(Y, rt)) | 0),
              (h = (h + Math.imul(Y, et)) | 0),
              (o = (o + Math.imul(H, it)) | 0),
              (r = (r + Math.imul(H, nt)) | 0),
              (r = (r + Math.imul(V, it)) | 0),
              (h = (h + Math.imul(V, nt)) | 0),
              (o = (o + Math.imul($, st)) | 0),
              (r = (r + Math.imul($, ot)) | 0),
              (r = (r + Math.imul(K, st)) | 0),
              (h = (h + Math.imul(K, ot)) | 0),
              (o = (o + Math.imul(W, ht)) | 0),
              (r = (r + Math.imul(W, ft)) | 0),
              (r = (r + Math.imul(G, ht)) | 0),
              (h = (h + Math.imul(G, ft)) | 0),
              (o = (o + Math.imul(q, at)) | 0),
              (r = (r + Math.imul(q, lt)) | 0),
              (r = (r + Math.imul(z, at)) | 0),
              (h = (h + Math.imul(z, lt)) | 0),
              (o = (o + Math.imul(L, ut)) | 0),
              (r = (r + Math.imul(L, mt)) | 0),
              (r = (r + Math.imul(Z, ut)) | 0),
              (h = (h + Math.imul(Z, mt)) | 0),
              (o = (o + Math.imul(I, gt)) | 0),
              (r = (r + Math.imul(I, ct)) | 0),
              (r = (r + Math.imul(O, gt)) | 0),
              (h = (h + Math.imul(O, ct)) | 0),
              (o = (o + Math.imul(T, dt)) | 0),
              (r = (r + Math.imul(T, vt)) | 0),
              (r = (r + Math.imul(k, dt)) | 0),
              (h = (h + Math.imul(k, vt)) | 0),
              (o = (o + Math.imul(b, pt)) | 0),
              (r = (r + Math.imul(b, Mt)) | 0),
              (r = (r + Math.imul(_, pt)) | 0),
              (h = (h + Math.imul(_, Mt)) | 0);
            var Dt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Dt >>> 26)) | 0),
              (Dt &= 67108863),
              (o = Math.imul(J, rt)),
              (r = Math.imul(J, et)),
              (r = (r + Math.imul(Q, rt)) | 0),
              (h = Math.imul(Q, et)),
              (o = (o + Math.imul(X, it)) | 0),
              (r = (r + Math.imul(X, nt)) | 0),
              (r = (r + Math.imul(Y, it)) | 0),
              (h = (h + Math.imul(Y, nt)) | 0),
              (o = (o + Math.imul(H, st)) | 0),
              (r = (r + Math.imul(H, ot)) | 0),
              (r = (r + Math.imul(V, st)) | 0),
              (h = (h + Math.imul(V, ot)) | 0),
              (o = (o + Math.imul($, ht)) | 0),
              (r = (r + Math.imul($, ft)) | 0),
              (r = (r + Math.imul(K, ht)) | 0),
              (h = (h + Math.imul(K, ft)) | 0),
              (o = (o + Math.imul(W, at)) | 0),
              (r = (r + Math.imul(W, lt)) | 0),
              (r = (r + Math.imul(G, at)) | 0),
              (h = (h + Math.imul(G, lt)) | 0),
              (o = (o + Math.imul(q, ut)) | 0),
              (r = (r + Math.imul(q, mt)) | 0),
              (r = (r + Math.imul(z, ut)) | 0),
              (h = (h + Math.imul(z, mt)) | 0),
              (o = (o + Math.imul(L, gt)) | 0),
              (r = (r + Math.imul(L, ct)) | 0),
              (r = (r + Math.imul(Z, gt)) | 0),
              (h = (h + Math.imul(Z, ct)) | 0),
              (o = (o + Math.imul(I, dt)) | 0),
              (r = (r + Math.imul(I, vt)) | 0),
              (r = (r + Math.imul(O, dt)) | 0),
              (h = (h + Math.imul(O, vt)) | 0),
              (o = (o + Math.imul(T, pt)) | 0),
              (r = (r + Math.imul(T, Mt)) | 0),
              (r = (r + Math.imul(k, pt)) | 0),
              (h = (h + Math.imul(k, Mt)) | 0);
            var Ft = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Ft >>> 26)) | 0),
              (Ft &= 67108863),
              (o = Math.imul(J, it)),
              (r = Math.imul(J, nt)),
              (r = (r + Math.imul(Q, it)) | 0),
              (h = Math.imul(Q, nt)),
              (o = (o + Math.imul(X, st)) | 0),
              (r = (r + Math.imul(X, ot)) | 0),
              (r = (r + Math.imul(Y, st)) | 0),
              (h = (h + Math.imul(Y, ot)) | 0),
              (o = (o + Math.imul(H, ht)) | 0),
              (r = (r + Math.imul(H, ft)) | 0),
              (r = (r + Math.imul(V, ht)) | 0),
              (h = (h + Math.imul(V, ft)) | 0),
              (o = (o + Math.imul($, at)) | 0),
              (r = (r + Math.imul($, lt)) | 0),
              (r = (r + Math.imul(K, at)) | 0),
              (h = (h + Math.imul(K, lt)) | 0),
              (o = (o + Math.imul(W, ut)) | 0),
              (r = (r + Math.imul(W, mt)) | 0),
              (r = (r + Math.imul(G, ut)) | 0),
              (h = (h + Math.imul(G, mt)) | 0),
              (o = (o + Math.imul(q, gt)) | 0),
              (r = (r + Math.imul(q, ct)) | 0),
              (r = (r + Math.imul(z, gt)) | 0),
              (h = (h + Math.imul(z, ct)) | 0),
              (o = (o + Math.imul(L, dt)) | 0),
              (r = (r + Math.imul(L, vt)) | 0),
              (r = (r + Math.imul(Z, dt)) | 0),
              (h = (h + Math.imul(Z, vt)) | 0),
              (o = (o + Math.imul(I, pt)) | 0),
              (r = (r + Math.imul(I, Mt)) | 0),
              (r = (r + Math.imul(O, pt)) | 0),
              (h = (h + Math.imul(O, Mt)) | 0);
            var Lt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Lt >>> 26)) | 0),
              (Lt &= 67108863),
              (o = Math.imul(J, st)),
              (r = Math.imul(J, ot)),
              (r = (r + Math.imul(Q, st)) | 0),
              (h = Math.imul(Q, ot)),
              (o = (o + Math.imul(X, ht)) | 0),
              (r = (r + Math.imul(X, ft)) | 0),
              (r = (r + Math.imul(Y, ht)) | 0),
              (h = (h + Math.imul(Y, ft)) | 0),
              (o = (o + Math.imul(H, at)) | 0),
              (r = (r + Math.imul(H, lt)) | 0),
              (r = (r + Math.imul(V, at)) | 0),
              (h = (h + Math.imul(V, lt)) | 0),
              (o = (o + Math.imul($, ut)) | 0),
              (r = (r + Math.imul($, mt)) | 0),
              (r = (r + Math.imul(K, ut)) | 0),
              (h = (h + Math.imul(K, mt)) | 0),
              (o = (o + Math.imul(W, gt)) | 0),
              (r = (r + Math.imul(W, ct)) | 0),
              (r = (r + Math.imul(G, gt)) | 0),
              (h = (h + Math.imul(G, ct)) | 0),
              (o = (o + Math.imul(q, dt)) | 0),
              (r = (r + Math.imul(q, vt)) | 0),
              (r = (r + Math.imul(z, dt)) | 0),
              (h = (h + Math.imul(z, vt)) | 0),
              (o = (o + Math.imul(L, pt)) | 0),
              (r = (r + Math.imul(L, Mt)) | 0),
              (r = (r + Math.imul(Z, pt)) | 0),
              (h = (h + Math.imul(Z, Mt)) | 0);
            var Zt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Zt >>> 26)) | 0),
              (Zt &= 67108863),
              (o = Math.imul(J, ht)),
              (r = Math.imul(J, ft)),
              (r = (r + Math.imul(Q, ht)) | 0),
              (h = Math.imul(Q, ft)),
              (o = (o + Math.imul(X, at)) | 0),
              (r = (r + Math.imul(X, lt)) | 0),
              (r = (r + Math.imul(Y, at)) | 0),
              (h = (h + Math.imul(Y, lt)) | 0),
              (o = (o + Math.imul(H, ut)) | 0),
              (r = (r + Math.imul(H, mt)) | 0),
              (r = (r + Math.imul(V, ut)) | 0),
              (h = (h + Math.imul(V, mt)) | 0),
              (o = (o + Math.imul($, gt)) | 0),
              (r = (r + Math.imul($, ct)) | 0),
              (r = (r + Math.imul(K, gt)) | 0),
              (h = (h + Math.imul(K, ct)) | 0),
              (o = (o + Math.imul(W, dt)) | 0),
              (r = (r + Math.imul(W, vt)) | 0),
              (r = (r + Math.imul(G, dt)) | 0),
              (h = (h + Math.imul(G, vt)) | 0),
              (o = (o + Math.imul(q, pt)) | 0),
              (r = (r + Math.imul(q, Mt)) | 0),
              (r = (r + Math.imul(z, pt)) | 0),
              (h = (h + Math.imul(z, Mt)) | 0);
            var qt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (qt >>> 26)) | 0),
              (qt &= 67108863),
              (o = Math.imul(J, at)),
              (r = Math.imul(J, lt)),
              (r = (r + Math.imul(Q, at)) | 0),
              (h = Math.imul(Q, lt)),
              (o = (o + Math.imul(X, ut)) | 0),
              (r = (r + Math.imul(X, mt)) | 0),
              (r = (r + Math.imul(Y, ut)) | 0),
              (h = (h + Math.imul(Y, mt)) | 0),
              (o = (o + Math.imul(H, gt)) | 0),
              (r = (r + Math.imul(H, ct)) | 0),
              (r = (r + Math.imul(V, gt)) | 0),
              (h = (h + Math.imul(V, ct)) | 0),
              (o = (o + Math.imul($, dt)) | 0),
              (r = (r + Math.imul($, vt)) | 0),
              (r = (r + Math.imul(K, dt)) | 0),
              (h = (h + Math.imul(K, vt)) | 0),
              (o = (o + Math.imul(W, pt)) | 0),
              (r = (r + Math.imul(W, Mt)) | 0),
              (r = (r + Math.imul(G, pt)) | 0),
              (h = (h + Math.imul(G, Mt)) | 0);
            var zt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (zt >>> 26)) | 0),
              (zt &= 67108863),
              (o = Math.imul(J, ut)),
              (r = Math.imul(J, mt)),
              (r = (r + Math.imul(Q, ut)) | 0),
              (h = Math.imul(Q, mt)),
              (o = (o + Math.imul(X, gt)) | 0),
              (r = (r + Math.imul(X, ct)) | 0),
              (r = (r + Math.imul(Y, gt)) | 0),
              (h = (h + Math.imul(Y, ct)) | 0),
              (o = (o + Math.imul(H, dt)) | 0),
              (r = (r + Math.imul(H, vt)) | 0),
              (r = (r + Math.imul(V, dt)) | 0),
              (h = (h + Math.imul(V, vt)) | 0),
              (o = (o + Math.imul($, pt)) | 0),
              (r = (r + Math.imul($, Mt)) | 0),
              (r = (r + Math.imul(K, pt)) | 0),
              (h = (h + Math.imul(K, Mt)) | 0);
            var Wt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Wt >>> 26)) | 0),
              (Wt &= 67108863),
              (o = Math.imul(J, gt)),
              (r = Math.imul(J, ct)),
              (r = (r + Math.imul(Q, gt)) | 0),
              (h = Math.imul(Q, ct)),
              (o = (o + Math.imul(X, dt)) | 0),
              (r = (r + Math.imul(X, vt)) | 0),
              (r = (r + Math.imul(Y, dt)) | 0),
              (h = (h + Math.imul(Y, vt)) | 0),
              (o = (o + Math.imul(H, pt)) | 0),
              (r = (r + Math.imul(H, Mt)) | 0),
              (r = (r + Math.imul(V, pt)) | 0),
              (h = (h + Math.imul(V, Mt)) | 0);
            var Gt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + (Gt >>> 26)) | 0),
              (Gt &= 67108863),
              (o = Math.imul(J, dt)),
              (r = Math.imul(J, vt)),
              (r = (r + Math.imul(Q, dt)) | 0),
              (h = Math.imul(Q, vt)),
              (o = (o + Math.imul(X, pt)) | 0),
              (r = (r + Math.imul(X, Mt)) | 0),
              (r = (r + Math.imul(Y, pt)) | 0),
              (h = (h + Math.imul(Y, Mt)) | 0);
            var $t = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            (m = (((h + (r >>> 13)) | 0) + ($t >>> 26)) | 0),
              ($t &= 67108863),
              (o = Math.imul(J, pt)),
              (r = Math.imul(J, Mt)),
              (r = (r + Math.imul(Q, pt)) | 0),
              (h = Math.imul(Q, Mt));
            var Kt = (((m + o) | 0) + ((r & 8191) << 13)) | 0;
            return (
              (m = (((h + (r >>> 13)) | 0) + (Kt >>> 26)) | 0),
              (Kt &= 67108863),
              (a[0] = Rt),
              (a[1] = Tt),
              (a[2] = Pt),
              (a[3] = kt),
              (a[4] = It),
              (a[5] = Ot),
              (a[6] = Ut),
              (a[7] = Bt),
              (a[8] = Ct),
              (a[9] = Dt),
              (a[10] = Ft),
              (a[11] = Lt),
              (a[12] = Zt),
              (a[13] = qt),
              (a[14] = zt),
              (a[15] = Wt),
              (a[16] = Gt),
              (a[17] = $t),
              (a[18] = Kt),
              m !== 0 && ((a[19] = m), i.length++),
              i
            );
          };
          Math.imul || (p = M);
          function w(f, t, e) {
            (e.negative = t.negative ^ f.negative),
              (e.length = f.length + t.length);
            for (var i = 0, n = 0, s = 0; s < e.length - 1; s++) {
              var a = n;
              n = 0;
              for (
                var m = i & 67108863,
                  o = Math.min(s, t.length - 1),
                  r = Math.max(0, s - f.length + 1);
                r <= o;
                r++
              ) {
                var h = s - r,
                  y = f.words[h] | 0,
                  b = t.words[r] | 0,
                  _ = y * b,
                  E = _ & 67108863;
                (a = (a + ((_ / 67108864) | 0)) | 0),
                  (E = (E + m) | 0),
                  (m = E & 67108863),
                  (a = (a + (E >>> 26)) | 0),
                  (n += a >>> 26),
                  (a &= 67108863);
              }
              (e.words[s] = m), (i = a), (a = n);
            }
            return i !== 0 ? (e.words[s] = i) : e.length--, e.strip();
          }
          function R(f, t, e) {
            var i = new D();
            return i.mulp(f, t, e);
          }
          l.prototype.mulTo = function (t, e) {
            var i,
              n = this.length + t.length;
            return (
              this.length === 10 && t.length === 10
                ? (i = p(this, t, e))
                : n < 63
                ? (i = M(this, t, e))
                : n < 1024
                ? (i = w(this, t, e))
                : (i = R(this, t, e)),
              i
            );
          };
          function D(f, t) {
            (this.x = f), (this.y = t);
          }
          (D.prototype.makeRBT = function (t) {
            for (
              var e = new Array(t), i = l.prototype._countBits(t) - 1, n = 0;
              n < t;
              n++
            )
              e[n] = this.revBin(n, i, t);
            return e;
          }),
            (D.prototype.revBin = function (t, e, i) {
              if (t === 0 || t === i - 1) return t;
              for (var n = 0, s = 0; s < e; s++)
                (n |= (t & 1) << (e - s - 1)), (t >>= 1);
              return n;
            }),
            (D.prototype.permute = function (t, e, i, n, s, a) {
              for (var m = 0; m < a; m++) (n[m] = e[t[m]]), (s[m] = i[t[m]]);
            }),
            (D.prototype.transform = function (t, e, i, n, s, a) {
              this.permute(a, t, e, i, n, s);
              for (var m = 1; m < s; m <<= 1)
                for (
                  var o = m << 1,
                    r = Math.cos((2 * Math.PI) / o),
                    h = Math.sin((2 * Math.PI) / o),
                    y = 0;
                  y < s;
                  y += o
                )
                  for (var b = r, _ = h, E = 0; E < m; E++) {
                    var T = i[y + E],
                      k = n[y + E],
                      St = i[y + E + m],
                      I = n[y + E + m],
                      O = b * St - _ * I;
                    (I = b * I + _ * St),
                      (St = O),
                      (i[y + E] = T + St),
                      (n[y + E] = k + I),
                      (i[y + E + m] = T - St),
                      (n[y + E + m] = k - I),
                      E !== o &&
                        ((O = r * b - h * _), (_ = r * _ + h * b), (b = O));
                  }
            }),
            (D.prototype.guessLen13b = function (t, e) {
              var i = Math.max(e, t) | 1,
                n = i & 1,
                s = 0;
              for (i = (i / 2) | 0; i; i = i >>> 1) s++;
              return 1 << (s + 1 + n);
            }),
            (D.prototype.conjugate = function (t, e, i) {
              if (!(i <= 1))
                for (var n = 0; n < i / 2; n++) {
                  var s = t[n];
                  (t[n] = t[i - n - 1]),
                    (t[i - n - 1] = s),
                    (s = e[n]),
                    (e[n] = -e[i - n - 1]),
                    (e[i - n - 1] = -s);
                }
            }),
            (D.prototype.normalize13b = function (t, e) {
              for (var i = 0, n = 0; n < e / 2; n++) {
                var s =
                  Math.round(t[2 * n + 1] / e) * 8192 +
                  Math.round(t[2 * n] / e) +
                  i;
                (t[n] = s & 67108863),
                  s < 67108864 ? (i = 0) : (i = (s / 67108864) | 0);
              }
              return t;
            }),
            (D.prototype.convert13b = function (t, e, i, n) {
              for (var s = 0, a = 0; a < e; a++)
                (s = s + (t[a] | 0)),
                  (i[2 * a] = s & 8191),
                  (s = s >>> 13),
                  (i[2 * a + 1] = s & 8191),
                  (s = s >>> 13);
              for (a = 2 * e; a < n; ++a) i[a] = 0;
              d(s === 0), d((s & ~8191) == 0);
            }),
            (D.prototype.stub = function (t) {
              for (var e = new Array(t), i = 0; i < t; i++) e[i] = 0;
              return e;
            }),
            (D.prototype.mulp = function (t, e, i) {
              var n = 2 * this.guessLen13b(t.length, e.length),
                s = this.makeRBT(n),
                a = this.stub(n),
                m = new Array(n),
                o = new Array(n),
                r = new Array(n),
                h = new Array(n),
                y = new Array(n),
                b = new Array(n),
                _ = i.words;
              (_.length = n),
                this.convert13b(t.words, t.length, m, n),
                this.convert13b(e.words, e.length, h, n),
                this.transform(m, a, o, r, n, s),
                this.transform(h, a, y, b, n, s);
              for (var E = 0; E < n; E++) {
                var T = o[E] * y[E] - r[E] * b[E];
                (r[E] = o[E] * b[E] + r[E] * y[E]), (o[E] = T);
              }
              return (
                this.conjugate(o, r, n),
                this.transform(o, r, _, a, n, s),
                this.conjugate(_, a, n),
                this.normalize13b(_, n),
                (i.negative = t.negative ^ e.negative),
                (i.length = t.length + e.length),
                i.strip()
              );
            }),
            (l.prototype.mul = function (t) {
              var e = new l(null);
              return (
                (e.words = new Array(this.length + t.length)), this.mulTo(t, e)
              );
            }),
            (l.prototype.mulf = function (t) {
              var e = new l(null);
              return (
                (e.words = new Array(this.length + t.length)), R(this, t, e)
              );
            }),
            (l.prototype.imul = function (t) {
              return this.clone().mulTo(t, this);
            }),
            (l.prototype.imuln = function (t) {
              d(typeof t == "number"), d(t < 67108864);
              for (var e = 0, i = 0; i < this.length; i++) {
                var n = (this.words[i] | 0) * t,
                  s = (n & 67108863) + (e & 67108863);
                (e >>= 26),
                  (e += (n / 67108864) | 0),
                  (e += s >>> 26),
                  (this.words[i] = s & 67108863);
              }
              return e !== 0 && ((this.words[i] = e), this.length++), this;
            }),
            (l.prototype.muln = function (t) {
              return this.clone().imuln(t);
            }),
            (l.prototype.sqr = function () {
              return this.mul(this);
            }),
            (l.prototype.isqr = function () {
              return this.imul(this.clone());
            }),
            (l.prototype.pow = function (t) {
              var e = x(t);
              if (e.length === 0) return new l(1);
              for (
                var i = this, n = 0;
                n < e.length && e[n] === 0;
                n++, i = i.sqr()
              );
              if (++n < e.length)
                for (var s = i.sqr(); n < e.length; n++, s = s.sqr())
                  e[n] !== 0 && (i = i.mul(s));
              return i;
            }),
            (l.prototype.iushln = function (t) {
              d(typeof t == "number" && t >= 0);
              var e = t % 26,
                i = (t - e) / 26,
                n = (67108863 >>> (26 - e)) << (26 - e),
                s;
              if (e !== 0) {
                var a = 0;
                for (s = 0; s < this.length; s++) {
                  var m = this.words[s] & n,
                    o = ((this.words[s] | 0) - m) << e;
                  (this.words[s] = o | a), (a = m >>> (26 - e));
                }
                a && ((this.words[s] = a), this.length++);
              }
              if (i !== 0) {
                for (s = this.length - 1; s >= 0; s--)
                  this.words[s + i] = this.words[s];
                for (s = 0; s < i; s++) this.words[s] = 0;
                this.length += i;
              }
              return this.strip();
            }),
            (l.prototype.ishln = function (t) {
              return d(this.negative === 0), this.iushln(t);
            }),
            (l.prototype.iushrn = function (t, e, i) {
              d(typeof t == "number" && t >= 0);
              var n;
              e ? (n = (e - (e % 26)) / 26) : (n = 0);
              var s = t % 26,
                a = Math.min((t - s) / 26, this.length),
                m = 67108863 ^ ((67108863 >>> s) << s),
                o = i;
              if (((n -= a), (n = Math.max(0, n)), o)) {
                for (var r = 0; r < a; r++) o.words[r] = this.words[r];
                o.length = a;
              }
              if (a !== 0)
                if (this.length > a)
                  for (this.length -= a, r = 0; r < this.length; r++)
                    this.words[r] = this.words[r + a];
                else (this.words[0] = 0), (this.length = 1);
              var h = 0;
              for (r = this.length - 1; r >= 0 && (h !== 0 || r >= n); r--) {
                var y = this.words[r] | 0;
                (this.words[r] = (h << (26 - s)) | (y >>> s)), (h = y & m);
              }
              return (
                o && h !== 0 && (o.words[o.length++] = h),
                this.length === 0 && ((this.words[0] = 0), (this.length = 1)),
                this.strip()
              );
            }),
            (l.prototype.ishrn = function (t, e, i) {
              return d(this.negative === 0), this.iushrn(t, e, i);
            }),
            (l.prototype.shln = function (t) {
              return this.clone().ishln(t);
            }),
            (l.prototype.ushln = function (t) {
              return this.clone().iushln(t);
            }),
            (l.prototype.shrn = function (t) {
              return this.clone().ishrn(t);
            }),
            (l.prototype.ushrn = function (t) {
              return this.clone().iushrn(t);
            }),
            (l.prototype.testn = function (t) {
              d(typeof t == "number" && t >= 0);
              var e = t % 26,
                i = (t - e) / 26,
                n = 1 << e;
              if (this.length <= i) return !1;
              var s = this.words[i];
              return !!(s & n);
            }),
            (l.prototype.imaskn = function (t) {
              d(typeof t == "number" && t >= 0);
              var e = t % 26,
                i = (t - e) / 26;
              if (
                (d(
                  this.negative === 0,
                  "imaskn works only with positive numbers"
                ),
                this.length <= i)
              )
                return this;
              if (
                (e !== 0 && i++,
                (this.length = Math.min(i, this.length)),
                e !== 0)
              ) {
                var n = 67108863 ^ ((67108863 >>> e) << e);
                this.words[this.length - 1] &= n;
              }
              return this.strip();
            }),
            (l.prototype.maskn = function (t) {
              return this.clone().imaskn(t);
            }),
            (l.prototype.iaddn = function (t) {
              return (
                d(typeof t == "number"),
                d(t < 67108864),
                t < 0
                  ? this.isubn(-t)
                  : this.negative !== 0
                  ? this.length === 1 && (this.words[0] | 0) < t
                    ? ((this.words[0] = t - (this.words[0] | 0)),
                      (this.negative = 0),
                      this)
                    : ((this.negative = 0),
                      this.isubn(t),
                      (this.negative = 1),
                      this)
                  : this._iaddn(t)
              );
            }),
            (l.prototype._iaddn = function (t) {
              this.words[0] += t;
              for (var e = 0; e < this.length && this.words[e] >= 67108864; e++)
                (this.words[e] -= 67108864),
                  e === this.length - 1
                    ? (this.words[e + 1] = 1)
                    : this.words[e + 1]++;
              return (this.length = Math.max(this.length, e + 1)), this;
            }),
            (l.prototype.isubn = function (t) {
              if ((d(typeof t == "number"), d(t < 67108864), t < 0))
                return this.iaddn(-t);
              if (this.negative !== 0)
                return (
                  (this.negative = 0), this.iaddn(t), (this.negative = 1), this
                );
              if (
                ((this.words[0] -= t), this.length === 1 && this.words[0] < 0)
              )
                (this.words[0] = -this.words[0]), (this.negative = 1);
              else
                for (var e = 0; e < this.length && this.words[e] < 0; e++)
                  (this.words[e] += 67108864), (this.words[e + 1] -= 1);
              return this.strip();
            }),
            (l.prototype.addn = function (t) {
              return this.clone().iaddn(t);
            }),
            (l.prototype.subn = function (t) {
              return this.clone().isubn(t);
            }),
            (l.prototype.iabs = function () {
              return (this.negative = 0), this;
            }),
            (l.prototype.abs = function () {
              return this.clone().iabs();
            }),
            (l.prototype._ishlnsubmul = function (t, e, i) {
              var n = t.length + i,
                s;
              this._expand(n);
              var a,
                m = 0;
              for (s = 0; s < t.length; s++) {
                a = (this.words[s + i] | 0) + m;
                var o = (t.words[s] | 0) * e;
                (a -= o & 67108863),
                  (m = (a >> 26) - ((o / 67108864) | 0)),
                  (this.words[s + i] = a & 67108863);
              }
              for (; s < this.length - i; s++)
                (a = (this.words[s + i] | 0) + m),
                  (m = a >> 26),
                  (this.words[s + i] = a & 67108863);
              if (m === 0) return this.strip();
              for (d(m === -1), m = 0, s = 0; s < this.length; s++)
                (a = -(this.words[s] | 0) + m),
                  (m = a >> 26),
                  (this.words[s] = a & 67108863);
              return (this.negative = 1), this.strip();
            }),
            (l.prototype._wordDiv = function (t, e) {
              var i = this.length - t.length,
                n = this.clone(),
                s = t,
                a = s.words[s.length - 1] | 0,
                m = this._countBits(a);
              (i = 26 - m),
                i !== 0 &&
                  ((s = s.ushln(i)),
                  n.iushln(i),
                  (a = s.words[s.length - 1] | 0));
              var o = n.length - s.length,
                r;
              if (e !== "mod") {
                (r = new l(null)),
                  (r.length = o + 1),
                  (r.words = new Array(r.length));
                for (var h = 0; h < r.length; h++) r.words[h] = 0;
              }
              var y = n.clone()._ishlnsubmul(s, 1, o);
              y.negative === 0 && ((n = y), r && (r.words[o] = 1));
              for (var b = o - 1; b >= 0; b--) {
                var _ =
                  (n.words[s.length + b] | 0) * 67108864 +
                  (n.words[s.length + b - 1] | 0);
                for (
                  _ = Math.min((_ / a) | 0, 67108863), n._ishlnsubmul(s, _, b);
                  n.negative !== 0;

                )
                  _--,
                    (n.negative = 0),
                    n._ishlnsubmul(s, 1, b),
                    n.isZero() || (n.negative ^= 1);
                r && (r.words[b] = _);
              }
              return (
                r && r.strip(),
                n.strip(),
                e !== "div" && i !== 0 && n.iushrn(i),
                { div: r || null, mod: n }
              );
            }),
            (l.prototype.divmod = function (t, e, i) {
              if ((d(!t.isZero()), this.isZero()))
                return { div: new l(0), mod: new l(0) };
              var n, s, a;
              return this.negative !== 0 && t.negative === 0
                ? ((a = this.neg().divmod(t, e)),
                  e !== "mod" && (n = a.div.neg()),
                  e !== "div" &&
                    ((s = a.mod.neg()), i && s.negative !== 0 && s.iadd(t)),
                  { div: n, mod: s })
                : this.negative === 0 && t.negative !== 0
                ? ((a = this.divmod(t.neg(), e)),
                  e !== "mod" && (n = a.div.neg()),
                  { div: n, mod: a.mod })
                : (this.negative & t.negative) != 0
                ? ((a = this.neg().divmod(t.neg(), e)),
                  e !== "div" &&
                    ((s = a.mod.neg()), i && s.negative !== 0 && s.isub(t)),
                  { div: a.div, mod: s })
                : t.length > this.length || this.cmp(t) < 0
                ? { div: new l(0), mod: this }
                : t.length === 1
                ? e === "div"
                  ? { div: this.divn(t.words[0]), mod: null }
                  : e === "mod"
                  ? { div: null, mod: new l(this.modn(t.words[0])) }
                  : {
                      div: this.divn(t.words[0]),
                      mod: new l(this.modn(t.words[0])),
                    }
                : this._wordDiv(t, e);
            }),
            (l.prototype.div = function (t) {
              return this.divmod(t, "div", !1).div;
            }),
            (l.prototype.mod = function (t) {
              return this.divmod(t, "mod", !1).mod;
            }),
            (l.prototype.umod = function (t) {
              return this.divmod(t, "mod", !0).mod;
            }),
            (l.prototype.divRound = function (t) {
              var e = this.divmod(t);
              if (e.mod.isZero()) return e.div;
              var i = e.div.negative !== 0 ? e.mod.isub(t) : e.mod,
                n = t.ushrn(1),
                s = t.andln(1),
                a = i.cmp(n);
              return a < 0 || (s === 1 && a === 0)
                ? e.div
                : e.div.negative !== 0
                ? e.div.isubn(1)
                : e.div.iaddn(1);
            }),
            (l.prototype.modn = function (t) {
              d(t <= 67108863);
              for (
                var e = (1 << 26) % t, i = 0, n = this.length - 1;
                n >= 0;
                n--
              )
                i = (e * i + (this.words[n] | 0)) % t;
              return i;
            }),
            (l.prototype.idivn = function (t) {
              d(t <= 67108863);
              for (var e = 0, i = this.length - 1; i >= 0; i--) {
                var n = (this.words[i] | 0) + e * 67108864;
                (this.words[i] = (n / t) | 0), (e = n % t);
              }
              return this.strip();
            }),
            (l.prototype.divn = function (t) {
              return this.clone().idivn(t);
            }),
            (l.prototype.egcd = function (t) {
              d(t.negative === 0), d(!t.isZero());
              var e = this,
                i = t.clone();
              e.negative !== 0 ? (e = e.umod(t)) : (e = e.clone());
              for (
                var n = new l(1),
                  s = new l(0),
                  a = new l(0),
                  m = new l(1),
                  o = 0;
                e.isEven() && i.isEven();

              )
                e.iushrn(1), i.iushrn(1), ++o;
              for (var r = i.clone(), h = e.clone(); !e.isZero(); ) {
                for (
                  var y = 0, b = 1;
                  (e.words[0] & b) == 0 && y < 26;
                  ++y, b <<= 1
                );
                if (y > 0)
                  for (e.iushrn(y); y-- > 0; )
                    (n.isOdd() || s.isOdd()) && (n.iadd(r), s.isub(h)),
                      n.iushrn(1),
                      s.iushrn(1);
                for (
                  var _ = 0, E = 1;
                  (i.words[0] & E) == 0 && _ < 26;
                  ++_, E <<= 1
                );
                if (_ > 0)
                  for (i.iushrn(_); _-- > 0; )
                    (a.isOdd() || m.isOdd()) && (a.iadd(r), m.isub(h)),
                      a.iushrn(1),
                      m.iushrn(1);
                e.cmp(i) >= 0
                  ? (e.isub(i), n.isub(a), s.isub(m))
                  : (i.isub(e), a.isub(n), m.isub(s));
              }
              return { a, b: m, gcd: i.iushln(o) };
            }),
            (l.prototype._invmp = function (t) {
              d(t.negative === 0), d(!t.isZero());
              var e = this,
                i = t.clone();
              e.negative !== 0 ? (e = e.umod(t)) : (e = e.clone());
              for (
                var n = new l(1), s = new l(0), a = i.clone();
                e.cmpn(1) > 0 && i.cmpn(1) > 0;

              ) {
                for (
                  var m = 0, o = 1;
                  (e.words[0] & o) == 0 && m < 26;
                  ++m, o <<= 1
                );
                if (m > 0)
                  for (e.iushrn(m); m-- > 0; )
                    n.isOdd() && n.iadd(a), n.iushrn(1);
                for (
                  var r = 0, h = 1;
                  (i.words[0] & h) == 0 && r < 26;
                  ++r, h <<= 1
                );
                if (r > 0)
                  for (i.iushrn(r); r-- > 0; )
                    s.isOdd() && s.iadd(a), s.iushrn(1);
                e.cmp(i) >= 0 ? (e.isub(i), n.isub(s)) : (i.isub(e), s.isub(n));
              }
              var y;
              return (
                e.cmpn(1) === 0 ? (y = n) : (y = s),
                y.cmpn(0) < 0 && y.iadd(t),
                y
              );
            }),
            (l.prototype.gcd = function (t) {
              if (this.isZero()) return t.abs();
              if (t.isZero()) return this.abs();
              var e = this.clone(),
                i = t.clone();
              (e.negative = 0), (i.negative = 0);
              for (var n = 0; e.isEven() && i.isEven(); n++)
                e.iushrn(1), i.iushrn(1);
              do {
                for (; e.isEven(); ) e.iushrn(1);
                for (; i.isEven(); ) i.iushrn(1);
                var s = e.cmp(i);
                if (s < 0) {
                  var a = e;
                  (e = i), (i = a);
                } else if (s === 0 || i.cmpn(1) === 0) break;
                e.isub(i);
              } while (!0);
              return i.iushln(n);
            }),
            (l.prototype.invm = function (t) {
              return this.egcd(t).a.umod(t);
            }),
            (l.prototype.isEven = function () {
              return (this.words[0] & 1) == 0;
            }),
            (l.prototype.isOdd = function () {
              return (this.words[0] & 1) == 1;
            }),
            (l.prototype.andln = function (t) {
              return this.words[0] & t;
            }),
            (l.prototype.bincn = function (t) {
              d(typeof t == "number");
              var e = t % 26,
                i = (t - e) / 26,
                n = 1 << e;
              if (this.length <= i)
                return this._expand(i + 1), (this.words[i] |= n), this;
              for (var s = n, a = i; s !== 0 && a < this.length; a++) {
                var m = this.words[a] | 0;
                (m += s), (s = m >>> 26), (m &= 67108863), (this.words[a] = m);
              }
              return s !== 0 && ((this.words[a] = s), this.length++), this;
            }),
            (l.prototype.isZero = function () {
              return this.length === 1 && this.words[0] === 0;
            }),
            (l.prototype.cmpn = function (t) {
              var e = t < 0;
              if (this.negative !== 0 && !e) return -1;
              if (this.negative === 0 && e) return 1;
              this.strip();
              var i;
              if (this.length > 1) i = 1;
              else {
                e && (t = -t), d(t <= 67108863, "Number is too big");
                var n = this.words[0] | 0;
                i = n === t ? 0 : n < t ? -1 : 1;
              }
              return this.negative !== 0 ? -i | 0 : i;
            }),
            (l.prototype.cmp = function (t) {
              if (this.negative !== 0 && t.negative === 0) return -1;
              if (this.negative === 0 && t.negative !== 0) return 1;
              var e = this.ucmp(t);
              return this.negative !== 0 ? -e | 0 : e;
            }),
            (l.prototype.ucmp = function (t) {
              if (this.length > t.length) return 1;
              if (this.length < t.length) return -1;
              for (var e = 0, i = this.length - 1; i >= 0; i--) {
                var n = this.words[i] | 0,
                  s = t.words[i] | 0;
                if (n !== s) {
                  n < s ? (e = -1) : n > s && (e = 1);
                  break;
                }
              }
              return e;
            }),
            (l.prototype.gtn = function (t) {
              return this.cmpn(t) === 1;
            }),
            (l.prototype.gt = function (t) {
              return this.cmp(t) === 1;
            }),
            (l.prototype.gten = function (t) {
              return this.cmpn(t) >= 0;
            }),
            (l.prototype.gte = function (t) {
              return this.cmp(t) >= 0;
            }),
            (l.prototype.ltn = function (t) {
              return this.cmpn(t) === -1;
            }),
            (l.prototype.lt = function (t) {
              return this.cmp(t) === -1;
            }),
            (l.prototype.lten = function (t) {
              return this.cmpn(t) <= 0;
            }),
            (l.prototype.lte = function (t) {
              return this.cmp(t) <= 0;
            }),
            (l.prototype.eqn = function (t) {
              return this.cmpn(t) === 0;
            }),
            (l.prototype.eq = function (t) {
              return this.cmp(t) === 0;
            }),
            (l.red = function (t) {
              return new u(t);
            }),
            (l.prototype.toRed = function (t) {
              return (
                d(!this.red, "Already a number in reduction context"),
                d(this.negative === 0, "red works only with positives"),
                t.convertTo(this)._forceRed(t)
              );
            }),
            (l.prototype.fromRed = function () {
              return (
                d(
                  this.red,
                  "fromRed works only with numbers in reduction context"
                ),
                this.red.convertFrom(this)
              );
            }),
            (l.prototype._forceRed = function (t) {
              return (this.red = t), this;
            }),
            (l.prototype.forceRed = function (t) {
              return (
                d(!this.red, "Already a number in reduction context"),
                this._forceRed(t)
              );
            }),
            (l.prototype.redAdd = function (t) {
              return (
                d(this.red, "redAdd works only with red numbers"),
                this.red.add(this, t)
              );
            }),
            (l.prototype.redIAdd = function (t) {
              return (
                d(this.red, "redIAdd works only with red numbers"),
                this.red.iadd(this, t)
              );
            }),
            (l.prototype.redSub = function (t) {
              return (
                d(this.red, "redSub works only with red numbers"),
                this.red.sub(this, t)
              );
            }),
            (l.prototype.redISub = function (t) {
              return (
                d(this.red, "redISub works only with red numbers"),
                this.red.isub(this, t)
              );
            }),
            (l.prototype.redShl = function (t) {
              return (
                d(this.red, "redShl works only with red numbers"),
                this.red.shl(this, t)
              );
            }),
            (l.prototype.redMul = function (t) {
              return (
                d(this.red, "redMul works only with red numbers"),
                this.red._verify2(this, t),
                this.red.mul(this, t)
              );
            }),
            (l.prototype.redIMul = function (t) {
              return (
                d(this.red, "redMul works only with red numbers"),
                this.red._verify2(this, t),
                this.red.imul(this, t)
              );
            }),
            (l.prototype.redSqr = function () {
              return (
                d(this.red, "redSqr works only with red numbers"),
                this.red._verify1(this),
                this.red.sqr(this)
              );
            }),
            (l.prototype.redISqr = function () {
              return (
                d(this.red, "redISqr works only with red numbers"),
                this.red._verify1(this),
                this.red.isqr(this)
              );
            }),
            (l.prototype.redSqrt = function () {
              return (
                d(this.red, "redSqrt works only with red numbers"),
                this.red._verify1(this),
                this.red.sqrt(this)
              );
            }),
            (l.prototype.redInvm = function () {
              return (
                d(this.red, "redInvm works only with red numbers"),
                this.red._verify1(this),
                this.red.invm(this)
              );
            }),
            (l.prototype.redNeg = function () {
              return (
                d(this.red, "redNeg works only with red numbers"),
                this.red._verify1(this),
                this.red.neg(this)
              );
            }),
            (l.prototype.redPow = function (t) {
              return (
                d(this.red && !t.red, "redPow(normalNum)"),
                this.red._verify1(this),
                this.red.pow(this, t)
              );
            });
          var yt = { k256: null, p224: null, p192: null, p25519: null };
          function A(f, t) {
            (this.name = f),
              (this.p = new l(t, 16)),
              (this.n = this.p.bitLength()),
              (this.k = new l(1).iushln(this.n).isub(this.p)),
              (this.tmp = this._tmp());
          }
          (A.prototype._tmp = function () {
            var t = new l(null);
            return (t.words = new Array(Math.ceil(this.n / 13))), t;
          }),
            (A.prototype.ireduce = function (t) {
              var e = t,
                i;
              do
                this.split(e, this.tmp),
                  (e = this.imulK(e)),
                  (e = e.iadd(this.tmp)),
                  (i = e.bitLength());
              while (i > this.n);
              var n = i < this.n ? -1 : e.ucmp(this.p);
              return (
                n === 0
                  ? ((e.words[0] = 0), (e.length = 1))
                  : n > 0
                  ? e.isub(this.p)
                  : e.strip !== void 0
                  ? e.strip()
                  : e._strip(),
                e
              );
            }),
            (A.prototype.split = function (t, e) {
              t.iushrn(this.n, 0, e);
            }),
            (A.prototype.imulK = function (t) {
              return t.imul(this.k);
            });
          function v() {
            A.call(
              this,
              "k256",
              "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
            );
          }
          B(v, A),
            (v.prototype.split = function (t, e) {
              for (
                var i = 4194303, n = Math.min(t.length, 9), s = 0;
                s < n;
                s++
              )
                e.words[s] = t.words[s];
              if (((e.length = n), t.length <= 9)) {
                (t.words[0] = 0), (t.length = 1);
                return;
              }
              var a = t.words[9];
              for (e.words[e.length++] = a & i, s = 10; s < t.length; s++) {
                var m = t.words[s] | 0;
                (t.words[s - 10] = ((m & i) << 4) | (a >>> 22)), (a = m);
              }
              (a >>>= 22),
                (t.words[s - 10] = a),
                a === 0 && t.length > 10 ? (t.length -= 10) : (t.length -= 9);
            }),
            (v.prototype.imulK = function (t) {
              (t.words[t.length] = 0),
                (t.words[t.length + 1] = 0),
                (t.length += 2);
              for (var e = 0, i = 0; i < t.length; i++) {
                var n = t.words[i] | 0;
                (e += n * 977),
                  (t.words[i] = e & 67108863),
                  (e = n * 64 + ((e / 67108864) | 0));
              }
              return (
                t.words[t.length - 1] === 0 &&
                  (t.length--, t.words[t.length - 1] === 0 && t.length--),
                t
              );
            });
          function N() {
            A.call(
              this,
              "p224",
              "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
            );
          }
          B(N, A);
          function F() {
            A.call(
              this,
              "p192",
              "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
            );
          }
          B(F, A);
          function g() {
            A.call(
              this,
              "25519",
              "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
            );
          }
          B(g, A),
            (g.prototype.imulK = function (t) {
              for (var e = 0, i = 0; i < t.length; i++) {
                var n = (t.words[i] | 0) * 19 + e,
                  s = n & 67108863;
                (n >>>= 26), (t.words[i] = s), (e = n);
              }
              return e !== 0 && (t.words[t.length++] = e), t;
            }),
            (l._prime = function (t) {
              if (yt[t]) return yt[t];
              var e;
              if (t === "k256") e = new v();
              else if (t === "p224") e = new N();
              else if (t === "p192") e = new F();
              else if (t === "p25519") e = new g();
              else throw new Error("Unknown prime " + t);
              return (yt[t] = e), e;
            });
          function u(f) {
            if (typeof f == "string") {
              var t = l._prime(f);
              (this.m = t.p), (this.prime = t);
            } else
              d(f.gtn(1), "modulus must be greater than 1"),
                (this.m = f),
                (this.prime = null);
          }
          (u.prototype._verify1 = function (t) {
            d(t.negative === 0, "red works only with positives"),
              d(t.red, "red works only with red numbers");
          }),
            (u.prototype._verify2 = function (t, e) {
              d(
                (t.negative | e.negative) == 0,
                "red works only with positives"
              ),
                d(t.red && t.red === e.red, "red works only with red numbers");
            }),
            (u.prototype.imod = function (t) {
              return this.prime
                ? this.prime.ireduce(t)._forceRed(this)
                : t.umod(this.m)._forceRed(this);
            }),
            (u.prototype.neg = function (t) {
              return t.isZero() ? t.clone() : this.m.sub(t)._forceRed(this);
            }),
            (u.prototype.add = function (t, e) {
              this._verify2(t, e);
              var i = t.add(e);
              return i.cmp(this.m) >= 0 && i.isub(this.m), i._forceRed(this);
            }),
            (u.prototype.iadd = function (t, e) {
              this._verify2(t, e);
              var i = t.iadd(e);
              return i.cmp(this.m) >= 0 && i.isub(this.m), i;
            }),
            (u.prototype.sub = function (t, e) {
              this._verify2(t, e);
              var i = t.sub(e);
              return i.cmpn(0) < 0 && i.iadd(this.m), i._forceRed(this);
            }),
            (u.prototype.isub = function (t, e) {
              this._verify2(t, e);
              var i = t.isub(e);
              return i.cmpn(0) < 0 && i.iadd(this.m), i;
            }),
            (u.prototype.shl = function (t, e) {
              return this._verify1(t), this.imod(t.ushln(e));
            }),
            (u.prototype.imul = function (t, e) {
              return this._verify2(t, e), this.imod(t.imul(e));
            }),
            (u.prototype.mul = function (t, e) {
              return this._verify2(t, e), this.imod(t.mul(e));
            }),
            (u.prototype.isqr = function (t) {
              return this.imul(t, t.clone());
            }),
            (u.prototype.sqr = function (t) {
              return this.mul(t, t);
            }),
            (u.prototype.sqrt = function (t) {
              if (t.isZero()) return t.clone();
              var e = this.m.andln(3);
              if ((d(e % 2 == 1), e === 3)) {
                var i = this.m.add(new l(1)).iushrn(2);
                return this.pow(t, i);
              }
              for (
                var n = this.m.subn(1), s = 0;
                !n.isZero() && n.andln(1) === 0;

              )
                s++, n.iushrn(1);
              d(!n.isZero());
              var a = new l(1).toRed(this),
                m = a.redNeg(),
                o = this.m.subn(1).iushrn(1),
                r = this.m.bitLength();
              for (
                r = new l(2 * r * r).toRed(this);
                this.pow(r, o).cmp(m) !== 0;

              )
                r.redIAdd(m);
              for (
                var h = this.pow(r, n),
                  y = this.pow(t, n.addn(1).iushrn(1)),
                  b = this.pow(t, n),
                  _ = s;
                b.cmp(a) !== 0;

              ) {
                for (var E = b, T = 0; E.cmp(a) !== 0; T++) E = E.redSqr();
                d(T < _);
                var k = this.pow(h, new l(1).iushln(_ - T - 1));
                (y = y.redMul(k)), (h = k.redSqr()), (b = b.redMul(h)), (_ = T);
              }
              return y;
            }),
            (u.prototype.invm = function (t) {
              var e = t._invmp(this.m);
              return e.negative !== 0
                ? ((e.negative = 0), this.imod(e).redNeg())
                : this.imod(e);
            }),
            (u.prototype.pow = function (t, e) {
              if (e.isZero()) return new l(1).toRed(this);
              if (e.cmpn(1) === 0) return t.clone();
              var i = 4,
                n = new Array(1 << i);
              (n[0] = new l(1).toRed(this)), (n[1] = t);
              for (var s = 2; s < n.length; s++) n[s] = this.mul(n[s - 1], t);
              var a = n[0],
                m = 0,
                o = 0,
                r = e.bitLength() % 26;
              for (r === 0 && (r = 26), s = e.length - 1; s >= 0; s--) {
                for (var h = e.words[s], y = r - 1; y >= 0; y--) {
                  var b = (h >> y) & 1;
                  if ((a !== n[0] && (a = this.sqr(a)), b === 0 && m === 0)) {
                    o = 0;
                    continue;
                  }
                  (m <<= 1),
                    (m |= b),
                    o++,
                    !(o !== i && (s !== 0 || y !== 0)) &&
                      ((a = this.mul(a, n[m])), (o = 0), (m = 0));
                }
                r = 26;
              }
              return a;
            }),
            (u.prototype.convertTo = function (t) {
              var e = t.umod(this.m);
              return e === t ? e.clone() : e;
            }),
            (u.prototype.convertFrom = function (t) {
              var e = t.clone();
              return (e.red = null), e;
            }),
            (l.mont = function (t) {
              return new c(t);
            });
          function c(f) {
            u.call(this, f),
              (this.shift = this.m.bitLength()),
              this.shift % 26 != 0 && (this.shift += 26 - (this.shift % 26)),
              (this.r = new l(1).iushln(this.shift)),
              (this.r2 = this.imod(this.r.sqr())),
              (this.rinv = this.r._invmp(this.m)),
              (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
              (this.minv = this.minv.umod(this.r)),
              (this.minv = this.r.sub(this.minv));
          }
          B(c, u),
            (c.prototype.convertTo = function (t) {
              return this.imod(t.ushln(this.shift));
            }),
            (c.prototype.convertFrom = function (t) {
              var e = this.imod(t.mul(this.rinv));
              return (e.red = null), e;
            }),
            (c.prototype.imul = function (t, e) {
              if (t.isZero() || e.isZero())
                return (t.words[0] = 0), (t.length = 1), t;
              var i = t.imul(e),
                n = i
                  .maskn(this.shift)
                  .mul(this.minv)
                  .imaskn(this.shift)
                  .mul(this.m),
                s = i.isub(n).iushrn(this.shift),
                a = s;
              return (
                s.cmp(this.m) >= 0
                  ? (a = s.isub(this.m))
                  : s.cmpn(0) < 0 && (a = s.iadd(this.m)),
                a._forceRed(this)
              );
            }),
            (c.prototype.mul = function (t, e) {
              if (t.isZero() || e.isZero()) return new l(0)._forceRed(this);
              var i = t.mul(e),
                n = i
                  .maskn(this.shift)
                  .mul(this.minv)
                  .imaskn(this.shift)
                  .mul(this.m),
                s = i.isub(n).iushrn(this.shift),
                a = s;
              return (
                s.cmp(this.m) >= 0
                  ? (a = s.isub(this.m))
                  : s.cmpn(0) < 0 && (a = s.iadd(this.m)),
                a._forceRed(this)
              );
            }),
            (c.prototype.invm = function (t) {
              var e = this.imod(t._invmp(this.m).mul(this.r2));
              return e._forceRed(this);
            });
        })(Et, this);
    },
    9416: (Et, bt, U) => {
      "use strict";
      var wt;
      (wt = { value: !0 }), (bt.browser = U(3150));
    },
    3150: function (Et, bt) {
      var U, wt, _t;
      (function (d, B) {
        if (!0)
          (wt = [Et]),
            (U = B),
            (_t = typeof U == "function" ? U.apply(bt, wt) : U),
            _t !== void 0 && (Et.exports = _t);
        else var l;
      })(
        typeof globalThis != "undefined"
          ? globalThis
          : typeof self != "undefined"
          ? self
          : this,
        function (d) {
          "use strict";
          if (
            typeof browser == "undefined" ||
            Object.getPrototypeOf(browser) !== Object.prototype
          ) {
            const B = "The message port closed before a response was received.",
              l =
                "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",
              At = (P) => {
                const C = {
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
                if (Object.keys(C).length === 0)
                  throw new Error(
                    "api-metadata.json has not been included in browser-polyfill"
                  );
                class xt extends WeakMap {
                  constructor(c, f = void 0) {
                    super(f);
                    this.createItem = c;
                  }
                  get(c) {
                    return (
                      this.has(c) || this.set(c, this.createItem(c)),
                      super.get(c)
                    );
                  }
                }
                const Nt = (u) =>
                    u && typeof u == "object" && typeof u.then == "function",
                  S = (u, c) => (...f) => {
                    P.runtime.lastError
                      ? u.reject(P.runtime.lastError)
                      : c.singleCallbackArg ||
                        (f.length <= 1 && c.singleCallbackArg !== !1)
                      ? u.resolve(f[0])
                      : u.resolve(f);
                  },
                  x = (u) => (u == 1 ? "argument" : "arguments"),
                  M = (u, c) =>
                    function (t, ...e) {
                      if (e.length < c.minArgs)
                        throw new Error(
                          `Expected at least ${c.minArgs} ${x(
                            c.minArgs
                          )} for ${u}(), got ${e.length}`
                        );
                      if (e.length > c.maxArgs)
                        throw new Error(
                          `Expected at most ${c.maxArgs} ${x(
                            c.maxArgs
                          )} for ${u}(), got ${e.length}`
                        );
                      return new Promise((i, n) => {
                        if (c.fallbackToNoCallback)
                          try {
                            t[u](...e, S({ resolve: i, reject: n }, c));
                          } catch (s) {
                            console.warn(
                              `${u} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,
                              s
                            ),
                              t[u](...e),
                              (c.fallbackToNoCallback = !1),
                              (c.noCallback = !0),
                              i();
                          }
                        else
                          c.noCallback
                            ? (t[u](...e), i())
                            : t[u](...e, S({ resolve: i, reject: n }, c));
                      });
                    },
                  p = (u, c, f) =>
                    new Proxy(c, {
                      apply(t, e, i) {
                        return f.call(e, u, ...i);
                      },
                    });
                let w = Function.call.bind(Object.prototype.hasOwnProperty);
                const R = (u, c = {}, f = {}) => {
                    let t = Object.create(null),
                      e = {
                        has(n, s) {
                          return s in u || s in t;
                        },
                        get(n, s, a) {
                          if (s in t) return t[s];
                          if (!(s in u)) return;
                          let m = u[s];
                          if (typeof m == "function")
                            if (typeof c[s] == "function") m = p(u, u[s], c[s]);
                            else if (w(f, s)) {
                              let o = M(s, f[s]);
                              m = p(u, u[s], o);
                            } else m = m.bind(u);
                          else if (
                            typeof m == "object" &&
                            m !== null &&
                            (w(c, s) || w(f, s))
                          )
                            m = R(m, c[s], f[s]);
                          else if (w(f, "*")) m = R(m, c[s], f["*"]);
                          else
                            return (
                              Object.defineProperty(t, s, {
                                configurable: !0,
                                enumerable: !0,
                                get() {
                                  return u[s];
                                },
                                set(o) {
                                  u[s] = o;
                                },
                              }),
                              m
                            );
                          return (t[s] = m), m;
                        },
                        set(n, s, a, m) {
                          return s in t ? (t[s] = a) : (u[s] = a), !0;
                        },
                        defineProperty(n, s, a) {
                          return Reflect.defineProperty(t, s, a);
                        },
                        deleteProperty(n, s) {
                          return Reflect.deleteProperty(t, s);
                        },
                      },
                      i = Object.create(u);
                    return new Proxy(i, e);
                  },
                  D = (u) => ({
                    addListener(c, f, ...t) {
                      c.addListener(u.get(f), ...t);
                    },
                    hasListener(c, f) {
                      return c.hasListener(u.get(f));
                    },
                    removeListener(c, f) {
                      c.removeListener(u.get(f));
                    },
                  });
                let yt = !1;
                const A = new xt((u) =>
                    typeof u != "function"
                      ? u
                      : function (f, t, e) {
                          let i = !1,
                            n,
                            s = new Promise((r) => {
                              n = function (h) {
                                yt ||
                                  (console.warn(l, new Error().stack),
                                  (yt = !0)),
                                  (i = !0),
                                  r(h);
                              };
                            }),
                            a;
                          try {
                            a = u(f, t, n);
                          } catch (r) {
                            a = Promise.reject(r);
                          }
                          const m = a !== !0 && Nt(a);
                          if (a !== !0 && !m && !i) return !1;
                          const o = (r) => {
                            r.then(
                              (h) => {
                                e(h);
                              },
                              (h) => {
                                let y;
                                h &&
                                (h instanceof Error ||
                                  typeof h.message == "string")
                                  ? (y = h.message)
                                  : (y = "An unexpected error occurred"),
                                  e({
                                    __mozWebExtensionPolyfillReject__: !0,
                                    message: y,
                                  });
                              }
                            ).catch((h) => {
                              console.error(
                                "Failed to send onMessage rejected reply",
                                h
                              );
                            });
                          };
                          return o(m ? a : s), !0;
                        }
                  ),
                  v = ({ reject: u, resolve: c }, f) => {
                    P.runtime.lastError
                      ? P.runtime.lastError.message === B
                        ? c()
                        : u(P.runtime.lastError)
                      : f && f.__mozWebExtensionPolyfillReject__
                      ? u(new Error(f.message))
                      : c(f);
                  },
                  N = (u, c, f, ...t) => {
                    if (t.length < c.minArgs)
                      throw new Error(
                        `Expected at least ${c.minArgs} ${x(
                          c.minArgs
                        )} for ${u}(), got ${t.length}`
                      );
                    if (t.length > c.maxArgs)
                      throw new Error(
                        `Expected at most ${c.maxArgs} ${x(
                          c.maxArgs
                        )} for ${u}(), got ${t.length}`
                      );
                    return new Promise((e, i) => {
                      const n = v.bind(null, { resolve: e, reject: i });
                      t.push(n), f.sendMessage(...t);
                    });
                  },
                  F = {
                    runtime: {
                      onMessage: D(A),
                      onMessageExternal: D(A),
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
                  g = {
                    clear: { minArgs: 1, maxArgs: 1 },
                    get: { minArgs: 1, maxArgs: 1 },
                    set: { minArgs: 1, maxArgs: 1 },
                  };
                return (
                  (C.privacy = {
                    network: { "*": g },
                    services: { "*": g },
                    websites: { "*": g },
                  }),
                  R(P, F, C)
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
            d.exports = At(chrome);
          } else d.exports = browser;
        }
      );
    },
  },
]);
