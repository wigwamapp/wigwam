function e({
  node: e = [],
  from: t,
  source: r,
  parent: n = t || r,
  to: a,
  target: o,
  child: l = a || o,
  scope: s = {},
  meta: i = {},
  family: f = { type: "regular" },
} = {}) {
  let c = qe(n),
    u = qe(f.links),
    p = qe(f.owners),
    d = [],
    m = {};
  for (let t = 0; t < e.length; t++) {
    let r = e[t];
    r && (d.push(r), xe(r, m));
  }
  let h = {
    id: L(),
    seq: d,
    next: qe(l),
    meta: i,
    scope: s,
    family: { type: f.type || "crosslink", links: u, owners: p },
    reg: m,
  };
  for (let e = 0; e < u.length; e++) de(u[e]).push(h);
  for (let e = 0; e < p.length; e++) me(p[e]).push(h);
  for (let e = 0; e < c.length; e++) c[e].next.push(h);
  return h;
}
function t(e, t = "combine") {
  let r = t + "(",
    n = "",
    a = 0;
  for (let t in e) {
    let o = e[t];
    if (
      (null != o &&
        ((r += n), (r += O(o) ? o.compositeName.fullName : o.toString())),
      (a += 1),
      25 === a)
    )
      break;
    n = ", ";
  }
  return (r += ")"), r;
}
function r(e, t) {
  let r = n(t, ve(e));
  if (((e.shortName = t), !e.compositeName)) return void (e.compositeName = r);
  let a = e.compositeName;
  (a.path = r.path), (a.shortName = r.shortName), (a.fullName = r.fullName);
}
function n(e, t) {
  let r,
    n,
    a,
    o = e;
  return (
    t
      ? ((a = t.compositeName),
        0 === e.length
          ? ((r = a.path), (n = a.fullName))
          : ((r = a.path.concat([e])),
            (n = 0 === a.fullName.length ? e : a.fullName + "/" + e)))
      : ((r = 0 === e.length ? [] : [e]), (n = e)),
    { shortName: o, fullName: n, path: r }
  );
}
function a(e, t) {
  e.forEach(t);
}
function o(e, t) {
  let r = pe(e).meta;
  tt = {
    parent: tt,
    value: e,
    template: r.template || rt(),
    sidRoot: r.sidRoot || (tt && tt.sidRoot),
  };
  try {
    return t();
  } finally {
    tt = ve(tt);
  }
}
function l(t, r) {
  let n = (e, ...t) =>
    Ee
      ? ((e, t, r, n) => {
          let a = Ee,
            o = null;
          if (t) for (o = Ee; o && o.template !== t; ) o = ve(o);
          We(o);
          let l = e.create(r, n);
          return We(a), l;
        })(n, a, e, t)
      : n.create(e, t);
  (n.graphite = e({ meta: pt("event", n, r, t) })),
    (n.create = (e) => {
      let t = Oe ? Oe.find(n) : n;
      return Te(t, e), e;
    }),
    (n.watch = Q(st, n)),
    (n.map = (e) => {
      let t, r;
      H(e) && ((t = e), (r = e.name), (e = e.fn));
      let a = l(Ge(n, r), t);
      return mt(n, a, M, e), a;
    }),
    (n.filter = (e) => ht(n, "filter", e.fn ? e : e.fn, [ne({ fn: ue })])),
    (n.filterMap = (e) =>
      ht(n, "filterMap", e, [re({ fn: ue }), te.defined()])),
    (n.prepend = (e) => {
      let t = l("* → " + n.shortName, { parent: ve(n) }),
        r = rt();
      return r && pe(t).seq.push(r.upward), mt(t, n, "prepend", e), ut(n, t), t;
    });
  let a = rt();
  return et(n);
}
function s(t, r) {
  function n(e, t) {
    c.off(e), be(c).set(e, Ze(gt(e, c, "on", 1, t)));
  }
  let a = se(t),
    o = se(t),
    l = dt("updates"),
    i = rt();
  (a.after = [{ type: "copy", to: o }]), i && i.plain.push(a, o);
  let f = a.id,
    c = {
      subscribers: new Map(),
      updates: l,
      defaultState: t,
      stateRef: a,
      getState() {
        let e,
          t = a;
        if (Ee) {
          let t = Ee;
          for (; t && !t.reg[f]; ) t = ve(t);
          t && (e = t);
        }
        return !e && Oe && Oe.reg[f] && (e = Oe), e && (t = e.reg[f]), ie(t);
      },
      setState(e) {
        let t;
        Oe && (t = Oe.nodeMap[pe(c).id]),
          t || (t = c),
          Te({ target: t, params: e, defer: 1 });
      },
      reset(...e) {
        for (let t of e) c.on(t, () => c.defaultState);
        return c;
      },
      on(e, t) {
        if (Array.isArray(e)) for (let r of e) n(r, t);
        else n(e, t);
        return c;
      },
      off(e) {
        let t = be(c).get(e);
        return t && (t(), be(c).delete(e)), c;
      },
      map(e, t) {
        let r, n, o;
        H(e) && ((r = e), (n = e.name), (t = e.firstState), (e = e.fn));
        let l = c.getState(),
          i = rt();
        i ? (o = null) : void 0 !== l && (o = e(l, t));
        let f = s(o, { name: Ge(c, n), config: r, strict: 0 }),
          u = gt(c, f, M, 0, e);
        return (
          (he(f).before = [{ type: M, fn: e, from: a }]),
          i &&
            (Ke(i.plain, a) || Ke(u.seq, i.loader) || u.seq.unshift(i.loader)),
          f
        );
      },
      watch(e, t) {
        if (!t || !O(e)) {
          let t = st(c, e),
            r = rt();
          return r ? r.watch.push({ of: a, fn: e }) : e(c.getState()), t;
        }
        return (
          G(t) || $("second argument should be a function"),
          e.watch((e) => t(c.getState(), e))
        );
      },
    };
  return (
    (c.graphite = e({
      scope: { state: a },
      node: [
        te.defined(),
        oe({ store: a }),
        te.changed({ store: o }),
        oe({ store: o }),
      ],
      child: l,
      meta: pt(D, c, r),
    })),
    ct &&
      void 0 === t &&
      $("current state can't be undefined, use null instead"),
    Se(c, [l]),
    et(c)
  );
}
function i(...e) {
  let t, r, n;
  Ue(e[0], (t, r) => {
    (n = t), (e = r);
  });
  let a,
    o,
    l = e[e.length - 1];
  if ((G(l) ? ((r = e.slice(0, -1)), (t = l)) : (r = e), 1 === r.length)) {
    let e = r[0];
    _(e) || ((a = e), (o = 1));
  }
  return (
    o || ((a = r), t && (t = yt(t))),
    H(a) || $("shape should be an object"),
    kt(Array.isArray(a), a, n, t)
  );
}
function f() {
  let e = {};
  return (
    (e.req = new Promise((t, r) => {
      (e.rs = t), (e.rj = r);
    })),
    e.req.catch(() => {}),
    e
  );
}
function c(t, r) {
  let n = l(t, r),
    a =
      n.defaultConfig.handler || (() => $("no handler used in " + n.getType())),
    o = pe(n);
  (o.meta.onCopy = ["runner"]),
    (o.meta.unit = n.kind = "effect"),
    (n.use = (e) => (
      G(e) || $(".use argument should be a function"), (a = e), n
    ));
  let i = (n.finally = dt("finally")),
    c = (n.done = i.filterMap({
      named: "done",
      fn({ status: e, params: t, result: r }) {
        if ("done" === e) return { params: t, result: r };
      },
    })),
    u = (n.fail = i.filterMap({
      named: "fail",
      fn({ status: e, params: t, error: r }) {
        if ("fail" === e) return { params: t, error: r };
      },
    })),
    p = (n.doneData = c.map({ named: "doneData", fn: ({ result: e }) => e })),
    d = (n.failData = u.map({ named: "failData", fn: ({ error: e }) => e })),
    m = e({
      scope: { getHandler: (n.use.getCurrent = () => a), finally: i },
      node: [
        ae({
          fn({ params: e, req: t }, { finally: r, getHandler: n }, a) {
            let o,
              l = bt({ params: e, req: t, ok: 1, anyway: r, stack: a }),
              s = bt({ params: e, req: t, ok: 0, anyway: r, stack: a });
            try {
              o = n()(e);
            } catch (e) {
              return void s(e);
            }
            H(o) && G(o.then) ? o.then(l, s) : l(o);
          },
        }),
      ],
      meta: { op: "fx", fx: "runner", onCopy: ["finally"] },
    });
  (o.scope.runner = m),
    o.seq.push(
      re({
        fn: (e, t, r) =>
          ve(r) ? { params: e, req: { rs(e) {}, rj(e) {} } } : e,
      }),
      ae({
        fn: (e, { runner: t }, r) => (
          Te({ target: t, params: e, defer: 1, forkPage: we(r) }), e.params
        ),
      })
    ),
    (n.create = (e) => {
      let t = f(),
        r = { params: e, req: t };
      if (Oe) {
        if (!_e) {
          let e = Oe;
          t.req.finally(() => {
            ze(e);
          });
        }
        Te(Oe.find(n), r);
      } else Te(n, r);
      return t.req;
    });
  let h = (n.inFlight = s(0, { named: "inFlight" })
      .on(n, (e) => e + 1)
      .on(i, (e) => e - 1)),
    g = (n.pending = h.map({ fn: (e) => e > 0, named: "pending" }));
  return Se(n, [i, c, u, p, d, g, h, m]), n;
}
function u(e) {
  let t;
  Ue(e, (r, n) => {
    (t = r), (e = n);
  });
  let { source: r, effect: n, mapParams: a } = e;
  a || (a = r ? (e, t) => t : (e) => e);
  let o,
    l = c(e, t),
    { runner: s } = pe(l).scope,
    f = ({ params: e, req: t }, { finally: r, effect: n }, o) => {
      let l,
        s = bt({ params: e, req: t, ok: 0, anyway: r, stack: o });
      try {
        l = a(e, o.a);
      } catch (e) {
        return s(e);
      }
      Te({
        target: n,
        params: {
          params: l,
          req: {
            rs: bt({ params: e, req: t, ok: 1, anyway: r, stack: o }),
            rj: s,
          },
        },
        page: o.page,
        defer: 1,
      });
    };
  if (r) {
    let e;
    _(r) ? (e = r) : ((e = i(r)), Se(l, [e]));
    let t = ee({ from: D, store: he(e), to: "a" });
    (o = [ae({ fn: (e) => e }), t, re({ fn: f })]), xe(t, s.reg);
  } else o = [ae({ fn: f })];
  return (
    (s.scope.effect = n),
    s.meta.onCopy.push("effect"),
    s.seq.splice(0, 1, ...o),
    ut(n, l, "effect"),
    l
  );
}
function p(...e) {
  let [[t, r], n] = Be(e),
    a = {};
  return (
    Je(r, (e, r) => {
      let o = (a[r] = l(r, { parent: ve(t), config: n }));
      t.on(o, e), ut(t, o);
    }),
    a
  );
}
function d(t, r) {
  let n = new Set(),
    a = new Set(),
    o = new Set(),
    i = new Set(),
    f = e({ family: { type: "domain" } }),
    u = {
      history: { domains: n, stores: a, effects: o, events: i },
      graphite: f,
    };
  f.meta = pt("domain", u, r, t);
  let [p, m, h, g] = ["onEvent", "onEffect", "onStore", "onDomain"].map(dt);
  (u.hooks = { event: p, effect: m, store: h, domain: g }),
    (u.onCreateEvent = wt(p, i, u)),
    (u.onCreateEffect = wt(m, o, u)),
    (u.onCreateStore = wt(h, a, u)),
    (u.onCreateDomain = wt(g, n, u)),
    (u.createEvent = u.event = (e, t) => p(l(e, { parent: u, config: t }))),
    (u.createEffect = u.effect = (e, t) => m(c(e, { parent: u, config: t }))),
    (u.createDomain = u.domain = (e, t) =>
      d({ name: e, parent: u, config: t })),
    (u.createStore = u.store = (e, t) => h(s(e, { parent: u, config: t }))),
    et(u);
  let y = ve(u);
  return (
    y &&
      (Je(u.hooks, (e, t) => {
        lt({ from: e, to: y.hooks[t] });
      }),
      y.hooks.domain(u)),
    u
  );
}
function m(e) {
  U(e);
  let t = j in e ? e[j]() : e;
  t.subscribe || $("expect observable to have .subscribe");
  let r = l(),
    n = V(Ye, r, void 0);
  return t.subscribe({ next: r, error: n, complete: n }), r;
}
function h(...t) {
  let r,
    n,
    a,
    o,
    [[f, c, u], p] = Be(t);
  void 0 === c &&
    "source" in f &&
    ("clock" in f && null == f.clock && $("config.clock should be defined"),
    (c = f.clock),
    (u = f.fn),
    (o = f.greedy),
    (r = f.target),
    (n = f.name),
    (a = f.sid),
    (f = f.source)),
    O(f) || (f = i(f)),
    void 0 === c && (c = f),
    (n = p || n || f.shortName);
  let d = rt(),
    m = !!r;
  r ||
    (_(f) && _(c)
      ? (r = s(u ? u(ie(he(f)), ie(he(c))) : ie(he(f)), { name: n, sid: a }))
      : ((r = l(n)), d && pe(r).seq.push(d.loader)));
  let h = m && O(r) && pe(r).meta.nativeTemplate;
  if (_(f)) {
    let e = he(f);
    Se(f, [
      ot(c, r, {
        scope: { fn: u, targetTemplate: h },
        node: [
          d && d.loader,
          !o && Z({ priority: "sampler" }),
          ee({ store: e, to: u ? "a" : "stack" }),
          u && re({ fn: ce }),
          d && m && d.upward,
        ],
        meta: { op: "sample", sample: D },
      }),
    ]),
      d && (Ke(d.plain, e) || Ke(d.closure, e) || d.closure.push(e));
  } else {
    let t = se(0),
      n = se(),
      a = se();
    d && d.plain.push(t, n, a),
      et(
        e({
          parent: f,
          node: [oe({ store: n }), ee({ from: "value", store: 1, target: t })],
          family: { owners: [f, r, c], links: r },
          meta: { op: "sample", sample: "source" },
        })
      ),
      Se(f, [
        ot(c, r, {
          scope: { fn: u, targetTemplate: h },
          node: [
            d && d.loader,
            oe({ store: a }),
            ee({ store: t }),
            ne({ fn: (e) => e }),
            !o && Z({ priority: "sampler" }),
            ee({ store: n }),
            ee({ store: a, to: "a" }),
            u && re({ fn: fe }),
            d && m && d.upward,
          ],
          meta: { op: "sample", sample: "clock" },
        }),
      ]);
  }
  return r;
}
function g(...t) {
  let r = { op: "guard" },
    n = "guard",
    [[a, o], s] = Be(t);
  s && ((r.config = s), s.name && (n = s.name)), o || ((o = a), (a = o.source));
  let { filter: f, greedy: c, name: u = n } = o,
    p = o.target || l(u, r.config);
  return (
    O(a) || (a = i(a)),
    O(f)
      ? h({
          source: f,
          clock: a,
          target: et(
            e({
              node: [
                ne({ fn: ({ guard: e }) => e }),
                re({ fn: ({ data: e }) => e }),
              ],
              child: p,
              meta: r,
              family: { owners: [a, f, p], links: p },
            })
          ),
          fn: (e, t) => ({ guard: e, data: t }),
          greedy: c,
          name: u,
        })
      : (G(f) || $("`filter` should be function or unit"),
        ot(a, p, { scope: { fn: f }, node: [ne({ fn: ue })], meta: r })),
    p
  );
}
function y(e, r) {
  let n = l(r || t(e, "merge"));
  return lt({ from: e, to: n, meta: { op: "merge" } }), n;
}
function k(e, t, r) {
  if (_(e)) return e;
  if (O(e)) {
    let n,
      a = ve(e);
    return (
      E(e) &&
        (n = s(t, { parent: a, name: e.shortName, cc: r }).on(e, (e, t) => t)),
      z(e) &&
        (n = s(t, { parent: a, name: e.shortName, cc: r }).on(
          e.done,
          (e, { result: t }) => t
        )),
      a && a.hooks.store(n),
      n
    );
  }
  let n = Array.isArray(e) ? [] : {};
  return (
    Je(e, (e, t) => {
      n[t] = _(e) ? e : s(e, { name: t });
    }),
    n
  );
}
function b(...e) {
  let t,
    [[r, n], a] = Be(e),
    o = !n;
  o && ((t = r.cases), (n = r.match), (r = r.source));
  let l = {},
    s = _(r) ? r.updates : r;
  if (
    (Je(n, (e, t) => {
      (l[t] = s.filter({ fn: e, config: a })),
        (s = s.filter({ fn: (t) => !e(t), config: a }));
    }),
    (l.__ = s),
    !o)
  )
    return l;
  Je(l, (e, r) => {
    t[r] && lt({ from: e, to: t[r] });
  });
}
function v(e, { values: t }) {
  let r = H(e) && e.cloneOf;
  W(e) || r || $("first argument of hydrate should be domain or scope"),
    H(t) || $("values property should be an object");
  let n,
    o,
    l = x(t);
  if (r)
    (n = []),
      (o = []),
      Je(l, (t, r) => {
        let a = e.sidMap[r];
        a && (n.push(a), o.push(t));
      });
  else {
    let t = (({ flatGraphUnits: e, values: t, collectWatches: r }) => {
      let n = [],
        o = [],
        l = {},
        s = new Set(),
        i = Object.getOwnPropertyNames(t);
      for (let a of e) {
        let { reg: e } = a,
          { op: f, unit: c, sid: u } = a.meta;
        if (c === D && u && Ke(i, u)) {
          let { state: e } = a.scope;
          (e.current = t[u]), s.add(e);
        }
        if (r && "watch" === f) {
          let e = a.family.owners[0];
          e.meta.unit === D && (n.push(a), o.push(e.scope.state));
        }
        for (let t in e) l[t] = e[t];
      }
      return (
        a(A(w(l)), (e) => {
          ((e) => {
            let t = 0;
            if (e.before && !s.has(e))
              for (let r of e.before)
                switch (r.type) {
                  case M:
                    e.current = r.fn(r.from.current);
                    break;
                  case "field": {
                    let n = r.from;
                    t ||
                      ((t = 1),
                      (e.current = Array.isArray(e.current)
                        ? [...e.current]
                        : { ...e.current })),
                      (e.current[r.field] = n.current);
                    break;
                  }
                }
            if (!e.after) return;
            let r = e.current;
            for (let t of e.after) {
              let e = t.to;
              switch (t.type) {
                case "copy":
                  e.current = r;
                  break;
                case M:
                  e.current = t.fn(r);
              }
            }
          })(l[e]);
        }),
        { storeWatches: n, storeWatchesRefs: o }
      );
    })({ flatGraphUnits: P(e), values: l, collectWatches: 1 });
    (n = t.storeWatches), (o = t.storeWatchesRefs.map(({ current: e }) => e));
  }
  Te({ target: n, params: o, forkPage: r ? e : 0 });
}
function w(e) {
  let t = Object.values(e),
    r = {};
  for (let { id: e } of t) r[e] = [];
  for (let { id: e, before: n, after: o } of t)
    n &&
      a(n, (t) => {
        r[t.from.id].push(e);
      }),
      o &&
        a(o, (t) => {
          r[e].push(t.to.id);
        });
  return r;
}
function S(
  { clones: e, getState: t, cloneOf: r },
  { ignore: n = [], onlyChanges: a } = {}
) {
  let o = {};
  if (a) {
    n = [...n];
    for (let e of r.history.stores) t(e) === e.defaultState && n.push(e);
  }
  for (let { meta: t, scope: r, reg: n } of e) {
    if (t.unit !== D) continue;
    let { sid: e } = t;
    e && (o[e] = n[r.state.id].current);
  }
  for (let { sid: e } of n) e && delete o[e];
  return o;
}
function q(e) {
  Oe || $("scopeBind cannot be called outside of forked .watch");
  let t = Oe.find(e),
    r = Oe;
  return (e) => {
    Te({ target: t, params: e, forkPage: r });
  };
}
function x(e) {
  if (e instanceof Map) {
    let t = {};
    for (let [r, n] of e) O(r) || $("Map key should be a unit"), (t[r.sid] = n);
    return t;
  }
  return e;
}
function N(t, { values: r, handlers: n } = {}) {
  W(t) || $("first argument of fork should be domain");
  let o = !!r;
  r = x(r || {});
  let l = ((t) => {
    function r(e) {
      let t = pe(e),
        r = n.indexOf(t);
      if (-1 === r) {
        let r = "unit";
        e !== t && e.id !== e.shortName && (r = e.shortName),
          $(r + " not found in forked scope");
      }
      return c[r];
    }
    let n = P(t),
      o = new Map(),
      l = re({ fn: (e, t, r) => (ze(we(r)), e) }),
      s = e({
        scope: { defers: [], inFlight: 0, fxID: 0 },
        node: [
          re({
            fn(e, t, r) {
              r.parent
                ? "finally" === r.parent.node.meta.named
                  ? (t.inFlight -= 1)
                  : ((t.inFlight += 1), (t.fxID += 1))
                : (t.fxID += 1);
            },
          }),
          Z({ priority: "sampler" }),
          ae({
            fn(e, t) {
              let { inFlight: r, defers: n, fxID: o } = t;
              r > 0 ||
                0 === n.length ||
                Promise.resolve().then(() => {
                  t.fxID === o &&
                    a(n.splice(0, n.length), (e) => {
                      ze(e.parentFork), e.rs(e.value);
                    });
                });
            },
          }),
        ],
        meta: { unit: "forkInFlightCounter" },
      }),
      i = {},
      f = {},
      c = n.map((t) => {
        let { seq: r, next: n, meta: a, scope: o } = t,
          l = e({
            node: r.map((e) => ({
              id: e.id,
              type: e.type,
              data: { ...e.data },
              hasRef: e.hasRef,
            })),
            child: [...n],
            meta: { forkOf: t, ...a },
            scope: { ...o },
          });
        return (
          (l.family = {
            type: t.family.type,
            links: [...me(t)],
            owners: [...de(t)],
          }),
          (i[t.id] = l),
          a.sid && (f[a.sid] = l),
          l
        );
      }),
      u = {};
    return (
      a(c, (e) => {
        let {
          reg: t,
          scope: n,
          meta: { onCopy: a, op: i, unit: f },
        } = e;
        for (let e in t) {
          let r = t[e],
            n = o.get(r);
          n || ((n = { id: r.id, current: r.current }), o.set(r, n)),
            (u[e] = t[e] = n);
        }
        if (a) for (let e = 0; e < a.length; e++) n[a[e]] = r(n[a[e]]);
        switch (
          (R(e, (e, t, n) => {
            n[t] = r(e);
          }),
          i || f)
        ) {
          case D:
            e.meta.wrapped = ((e) => ({
              kind: D,
              getState: () => e.reg[e.scope.state.id].current,
              updates: { watch: Q(st, e) },
              graphite: e,
              family: e.family,
            }))(e);
            break;
          case "event":
            e.seq.unshift(l);
            break;
          case I:
            e.next.push(s), e.seq.unshift(l);
            break;
          case "fx":
            n.finally.next.push(s), e.seq.unshift(l);
            break;
          case "watch":
            e.seq.unshift(l);
        }
      }),
      {
        cloneOf: t,
        nodeMap: i,
        sidMap: f,
        clones: c,
        find: r,
        reg: u,
        getState: (e) => r(e).meta.wrapped.getState(),
        graphite: e({
          family: { type: "domain", links: [s, ...c] },
          meta: { unit: "fork" },
          scope: { forkInFlightCounter: s },
        }),
      }
    );
  })(t);
  if (
    (o &&
      (() => {
        let e = P(t),
          n = {},
          o = {},
          s = new Set(),
          i = new Set(),
          f = Object.getOwnPropertyNames(r);
        for (let { reg: t, meta: r } of e) {
          let { nativeTemplate: e } = r;
          for (let r in t) (n[r] = t[r]), e && i.add(r);
        }
        for (let e of l.clones) {
          let { reg: t } = e,
            { unit: n, sid: a } = e.meta;
          if (n === D && a && Ke(f, a)) {
            let { state: n } = e.scope;
            (t[n.id].current = r[a]), s.add(n);
          }
          for (let e in t) o[e] = t[e];
        }
        a(A(w(n), i), (e) => {
          ((e, t) => {
            let r = 0;
            if (t && t.before && !s.has(e))
              for (let n of t.before)
                switch (n.type) {
                  case M:
                    e.current = n.fn(o[n.from.id].current);
                    break;
                  case "field": {
                    let t = o[n.from.id];
                    r ||
                      ((r = 1),
                      (e.current = Array.isArray(e.current)
                        ? [...e.current]
                        : { ...e.current })),
                      (e.current[n.field] = t.current);
                    break;
                  }
                }
            if (!t || !t.after) return;
            let n = e.current;
            for (let e of t.after) {
              let t = o[e.to.id];
              switch (e.type) {
                case "copy":
                  t.current = n;
                  break;
                case M:
                  t.current = e.fn(n);
              }
            }
          })(o[e], n[e]);
        });
      })(),
    n)
  ) {
    n = x(n);
    let e = Object.keys(n);
    for (let { scope: t, meta: r } of l.clones)
      r.sid && Ke(e, r.sid) && (t.runner.scope.getHandler = () => n[r.sid]);
  }
  return l;
}
function A(e, t) {
  function r(e) {
    s[e] = 1;
    let t = n[e];
    for (let e = 0; e < t.length; e++) {
      let n = t[e];
      s[n] || l[n] || r(n);
    }
    (s[e] = 0), (l[e] = 1), o.push(e);
  }
  let n = {};
  for (let t in e) n[t] = [...new Set(e[t])];
  let o = [],
    l = {},
    s = {};
  for (let e in n) l[e] || s[e] || r(e);
  if ((o.reverse(), t && t.size > 0)) {
    let e,
      r = [],
      l = [...t];
    for (; (e = l.shift()); )
      r.push(e),
        a(n[e], (e) => {
          Ke(r, e) || Ke(l, e) || l.push(e);
        });
    a(r, (e) => {
      Le(o, e);
    });
  }
  return o;
}
function C(e, { scope: t, params: r }) {
  if (!O(e)) return Promise.reject(Error("first argument should be unit"));
  let n = f();
  n.parentFork = Oe;
  let { forkInFlightCounter: a } = t.graphite.scope;
  a.scope.defers.push(n);
  let o = [t.find(e)],
    l = [];
  return (
    z(e)
      ? l.push({
          params: r,
          req: {
            rs(e) {
              n.value = { status: "done", value: e };
            },
            rj(e) {
              n.value = { status: "fail", value: e };
            },
          },
        })
      : l.push(r),
    o.push(a),
    l.push(null),
    Te({ target: o, params: l, forkPage: t }),
    n.req
  );
}
function P(e) {
  let t = [];
  return (
    (function e(r) {
      Ke(t, r) || (t.push(r), R(r, e));
    })(pe(e)),
    t
  );
}
function R(e, t) {
  let r = e.meta.unit;
  "fork" !== r &&
    "forkInFlightCounter" !== r &&
    (a(e.next, t), a(de(e), t), a(me(e), t));
}
let j = ("undefined" != typeof Symbol && Symbol.observable) || "@@observable",
  D = "store",
  I = "effect",
  M = "map",
  O = (e) => (G(e) || H(e)) && "kind" in e;
const F = (e) => (t) => O(t) && t.kind === e;
let _ = F(D),
  E = F("event"),
  z = F(I),
  W = F("domain");
var T = { __proto__: null, unit: O, store: _, event: E, effect: z, domain: W };
let $ = (e) => {
    throw Error(e);
  },
  H = (e) => "object" == typeof e && null !== e,
  G = (e) => "function" == typeof e,
  U = (e) => {
    H(e) || G(e) || $("expect first argument be an object");
  };
const B = () => {
  let e = 0;
  return () => (++e).toString(36);
};
let J = B(),
  K = B(),
  L = B(),
  Q = (e, t) => e.bind(null, t),
  V = (e, t, r) => e.bind(null, t, r);
const X = (e, t, r) => ({ id: K(), type: e, data: r, hasRef: t });
let Y = 0,
  Z = ({ priority: e = "barrier" }) =>
    X("barrier", 0, { barrierID: ++Y, priority: e }),
  ee = ({ from: e = D, store: t, target: r, to: n = r ? D : "stack" }) =>
    X("mov", e === D, { from: e, store: t, to: n, target: r }),
  te = {
    defined: () => X("check", 0, { type: "defined" }),
    changed: ({ store: e }) => X("check", 1, { type: "changed", store: e }),
  },
  re = V(X, "compute", 0),
  ne = V(X, "filter", 0),
  ae = V(X, "run", 0),
  oe = ({ store: e }) => ee({ from: "stack", target: e });
var le = {
  __proto__: null,
  barrier: Z,
  mov: ee,
  check: te,
  compute: re,
  filter: ne,
  run: ae,
  update: oe,
};
let se = (e) => ({ id: K(), current: e }),
  ie = ({ current: e }) => e,
  fe = (e, { fn: t }, { a: r }) => t(e, r),
  ce = (e, { fn: t }, { a: r }) => t(r, e),
  ue = (e, { fn: t }) => t(e),
  pe = (e) => e.graphite || e,
  de = (e) => e.family.owners,
  me = (e) => e.family.links,
  he = (e) => e.stateRef,
  ge = (e) => e.config,
  ye = (e) => e.cc,
  ke = (e) => e.value,
  be = (e) => e.subscribers,
  ve = (e) => e.parent,
  we = (e) => e.forkPage,
  Se = (e, t) => {
    let r = pe(e);
    for (let e = 0; e < t.length; e++) {
      let n = pe(t[e]);
      "domain" !== r.family.type && (n.family.type = "crosslink"),
        de(n).push(r),
        me(r).push(n);
    }
  };
const qe = (e = []) => {
  let t = [];
  if (Array.isArray(e))
    for (let r = 0; r < e.length; r++)
      Array.isArray(e[r]) ? t.push(...e[r]) : t.push(e[r]);
  else t.push(e);
  return t.map(pe);
};
let xe = ({ hasRef: e, type: t, data: r }, n) => {
    let a;
    e && ((a = r.store), (n[a.id] = a)),
      "mov" === t && r.to === D && ((a = r.target), (n[a.id] = a));
  },
  Ne = null;
const Ae = (e, t) => {
    if (!e) return t;
    if (!t) return e;
    let r,
      n = e.v.type === t.v.type;
    return (
      ((n && e.v.id > t.v.id) || (!n && "sampler" === e.v.type)) &&
        ((r = e), (e = t), (t = r)),
      (r = Ae(e.r, t)),
      (e.r = e.l),
      (e.l = r),
      e
    );
  },
  Ce = [];
let Pe = 0;
for (; Pe < 5; ) Ce.push({ first: null, last: null, size: 0 }), (Pe += 1);
const Re = () => {
    for (let e = 0; e < 5; e++) {
      let t = Ce[e];
      if (t.size > 0) {
        if (2 === e || 3 === e) {
          t.size -= 1;
          let e = Ne.v;
          return (Ne = Ae(Ne.l, Ne.r)), e;
        }
        1 === t.size && (t.last = null);
        let r = t.first;
        return (t.first = r.r), (t.size -= 1), r.v;
      }
    }
  },
  je = (e, t, r, n, a, o) =>
    De(
      0,
      { a: null, b: null, node: r, parent: n, value: a, page: t, forkPage: o },
      e
    ),
  De = (e, t, r, n = 0) => {
    let a = Ie(r),
      o = Ce[a],
      l = { v: { idx: e, stack: t, type: r, id: n }, l: 0, r: 0 };
    2 === a || 3 === a
      ? (Ne = Ae(Ne, l))
      : (0 === o.size ? (o.first = l) : (o.last.r = l), (o.last = l)),
      (o.size += 1);
  },
  Ie = (e) => {
    switch (e) {
      case "child":
        return 0;
      case "pure":
        return 1;
      case "barrier":
        return 2;
      case "sampler":
        return 3;
      case I:
        return 4;
      default:
        return -1;
    }
  },
  Me = new Set();
let Oe,
  Fe = 1,
  _e = 0,
  Ee = null,
  ze = (e) => {
    Oe = e;
  },
  We = (e) => {
    Ee = e;
  },
  Te = (e, t, r) => {
    let n = Ee,
      a = null,
      o = Oe;
    if (
      (e.target &&
        ((t = e.params),
        (r = e.defer),
        (n = "page" in e ? e.page : n),
        e.stack && (a = e.stack),
        (o = we(e) || o),
        (e = e.target)),
      Array.isArray(e))
    )
      for (let r = 0; r < e.length; r++) je("pure", n, pe(e[r]), a, t[r], o);
    else je("pure", n, pe(e), a, t, o);
    (r && !Fe) ||
      (() => {
        let e,
          t,
          r,
          n,
          a,
          o,
          l = { isRoot: Fe, currentPage: Ee, forkPage: Oe, isWatch: _e };
        Fe = 0;
        e: for (; (n = Re()); ) {
          let { idx: s, stack: i, type: f } = n;
          (r = i.node), (Ee = a = i.page), (Oe = we(i)), (o = (a || r).reg);
          let c = { fail: 0, scope: r.scope };
          e = t = 0;
          for (let n = s; n < r.seq.length && !e; n++) {
            let u = r.seq[n],
              p = u.data;
            switch (u.type) {
              case "barrier": {
                let e = p.barrierID;
                a && (e = `${a.fullID}_${e}`);
                let t = p.priority;
                if (n !== s || f !== t) {
                  Me.has(e) || (Me.add(e), De(n, i, t, e));
                  continue e;
                }
                Me.delete(e);
                break;
              }
              case "mov": {
                let e;
                switch (p.from) {
                  case "stack":
                    e = ke(i);
                    break;
                  case "a":
                  case "b":
                    e = i[p.from];
                    break;
                  case "value":
                    e = p.store;
                    break;
                  case D:
                    o[p.store.id] || ((i.page = a = null), (o = r.reg)),
                      (e = ie(o[p.store.id]));
                }
                switch (p.to) {
                  case "stack":
                    i.value = e;
                    break;
                  case "a":
                  case "b":
                    i[p.to] = e;
                    break;
                  case D:
                    o[p.target.id].current = e;
                }
                break;
              }
              case "check":
                switch (p.type) {
                  case "defined":
                    t = void 0 === ke(i);
                    break;
                  case "changed":
                    t = ke(i) === ie(o[p.store.id]);
                }
                break;
              case "filter":
                t = !$e(c, p, i);
                break;
              case "run":
                if (n !== s || f !== I) {
                  De(n, i, I);
                  continue e;
                }
              case "compute":
                (_e = "watch" === r.meta.op),
                  (i.value = $e(c, p, i)),
                  (_e = l.isWatch);
            }
            e = c.fail || t;
          }
          if (!e)
            for (let e = 0; e < r.next.length; e++)
              je("child", a, r.next[e], i, ke(i), we(i));
        }
        (Fe = l.isRoot), (Ee = l.currentPage), (Oe = we(l));
      })();
  };
const $e = (e, { fn: t }, r) => {
  try {
    return t(ke(r), e.scope, r);
  } catch (t) {
    console.error(t), (e.fail = 1);
  }
};
let He = (e, t) => "" + e.shortName + t,
  Ge = (e, t) => (null == t ? He(e, " → *") : t),
  Ue = (e, t) => {
    U(e), ye(e) && t(ge(e), ye(e));
  },
  Be = (e) => {
    let t;
    return (
      Ue(e[0], (r, n) => {
        (t = r), (e = n);
      }),
      [e, t]
    );
  },
  Je = (e, t) => {
    for (let r in e) t(e[r], r);
  },
  Ke = (e, t) => e.includes(t),
  Le = (e, t) => {
    let r = e.indexOf(t);
    -1 !== r && e.splice(r, 1);
  };
const Qe = (e, t) => {
    Le(e.next, t), Le(de(e), t), Le(me(e), t);
  },
  Ve = (e, t, r) => {
    let n;
    (e.next.length = 0), (e.seq.length = 0), (e.scope = null);
    let a = me(e);
    for (; (n = a.pop()); )
      Qe(n, e),
        (t || (r && !e.meta.sample) || "crosslink" === n.family.type) &&
          Ve(n, t, "on" !== n.meta.op && r);
    for (a = de(e); (n = a.pop()); )
      Qe(n, e),
        r && "crosslink" === n.family.type && Ve(n, t, "on" !== n.meta.op && r);
  },
  Xe = (e) => e.clear();
let Ye = (e, { deep: t } = {}) => {
    let r = 0;
    if ((e.ownerSet && e.ownerSet.delete(e), _(e))) Xe(be(e));
    else if (W(e)) {
      r = 1;
      let t = e.history;
      Xe(t.events), Xe(t.effects), Xe(t.stores), Xe(t.domains);
    }
    Ve(pe(e), !!t, r);
  },
  Ze = (e) => {
    let t = V(Ye, e, void 0);
    return (t.unsubscribe = t), t;
  },
  et = (e) => (tt && Se(ke(tt), [e]), e),
  tt = null,
  rt = () => tt && tt.template,
  nt = (e) => (e && tt && tt.sidRoot && (e = `${tt.sidRoot}cc${e}`), e),
  at = ({ sid: t, name: r, loc: n, method: a, fn: l }) =>
    o(e({ meta: { sidRoot: nt(t), name: r, loc: n, method: a } }), l),
  ot = (t, r, { node: n, scope: a, meta: o }) =>
    et(
      e({
        node: n,
        parent: t,
        child: r,
        scope: a,
        meta: o,
        family: { owners: [t, r], links: r },
      })
    ),
  lt = (t) => {
    let r;
    Ue(t, (e, n) => {
      (r = e), (t = n);
    });
    let { from: n, to: a, meta: o = { op: "forward" } } = t;
    return (
      (n && a) || $("from and to fields should be defined"),
      r && (o.config = r),
      Ze(et(e({ parent: n, child: a, meta: o, family: {} })))
    );
  },
  st = (t, r) => {
    if ((G(r) || $(".watch argument should be a function"), Oe)) {
      let e = Oe.nodeMap[pe(t).id];
      e && (t = e);
    }
    return Ze(
      et(
        e({
          scope: { fn: r },
          node: [ae({ fn: ue })],
          parent: t,
          meta: { op: "watch" },
          family: { owners: t },
        })
      )
    );
  };
const ft = (e, t) => (
  H(e) &&
    (ft(ge(e), t),
    null != e.name &&
      (H(e.name)
        ? ft(e.name, t)
        : G(e.name)
        ? (t.handler = e.name)
        : (t.name = e.name)),
    e.loc && (t.loc = e.loc),
    (e.sid || null === e.sid) && (t.sid = e.sid),
    e.handler && (t.handler = e.handler),
    ve(e) && (t.parent = ve(e)),
    "strict" in e && (t.strict = e.strict),
    e.named && (t.named = e.named),
    ft(ye(e), t)),
  t
);
let ct,
  ut = (e, t, r = "event") => {
    ve(e) && ve(e).hooks[r](t);
  },
  pt = (e, t, r, a) => {
    let o = ft({ name: a, config: r }, {}),
      l = "domain" === e,
      s = J(),
      { parent: i = null, sid: f = null, strict: c = 1, named: u = null } = o,
      p = u || o.name || (l ? "" : s),
      d = n(p, i),
      m = {
        unit: (t.kind = e),
        name: (t.shortName = p),
        sid: (t.sid = nt(f)),
        named: u,
        unitId: (t.id = s),
      };
    if (
      ((t.parent = i),
      (t.compositeName = d),
      (t.defaultConfig = o),
      (t.thru = (e) => e(t)),
      (t.getType = () => d.fullName),
      !l)
    ) {
      (t.subscribe = (e) => (
        U(e),
        t.watch(
          G(e)
            ? e
            : (t) => {
                e.next && e.next(t);
              }
        )
      )),
        (t[j] = () => t);
      let e = rt();
      e && (m.nativeTemplate = e);
    }
    return (ct = c), m;
  },
  dt = (e) => l({ named: e });
const mt = (e, t, r, n) =>
    ot(e, t, { scope: { fn: n }, node: [re({ fn: ue })], meta: { op: r } }),
  ht = (e, t, r, n) => {
    let a;
    H(r) && ((a = r), (r = r.fn));
    let o = l(He(e, " →? *"), a);
    return ot(e, o, { scope: { fn: r }, node: n, meta: { op: t } }), o;
  },
  gt = (e, t, r, n, a) => {
    let o = he(t),
      l = [
        ee({ store: o, to: "a" }),
        re({ fn: n ? ce : fe }),
        te.defined(),
        te.changed({ store: o }),
        oe({ store: o }),
      ],
      s = rt();
    if (s && (l.unshift(s.loader), l.push(s.upward), _(e))) {
      let t = he(e);
      Ke(s.plain, t) ||
        (Ke(s.closure, t) || s.closure.push(t),
        o.before || (o.before = []),
        o.before.push({ type: "closure", of: t }));
    }
    return ot(e, t, { scope: { fn: a }, node: l, meta: { op: r } });
  },
  yt = (e) => (t) => e(...t),
  kt = (e, r, n, a) => {
    let o = e ? (e) => e.slice() : (e) => ({ ...e }),
      l = e ? [] : {},
      i = rt(),
      f = o(l),
      c = se(f),
      u = se(1);
    (c.type = e ? "list" : "shape"), i && i.plain.push(c, u);
    let p = s(f, { name: n || t(r) }),
      d = [
        te.defined(),
        ee({ store: c, to: "a" }),
        ne({ fn: (e, { key: t }, { a: r }) => e !== r[t] }),
        ee({ store: u, to: "b" }),
        re({
          fn(e, { clone: t, key: r }, n) {
            n.b && (n.a = t(n.a)), (n.a[r] = e);
          },
        }),
        ee({ from: "a", target: c }),
        ee({ from: "value", store: 0, target: u }),
        Z({ priority: "barrier" }),
        ee({ from: "value", store: 1, target: u }),
        ee({ store: c }),
        a && re({ fn: a }),
        te.changed({ store: he(p) }),
      ],
      m = (c.before = []);
    return (
      Je(r, (e, t) => {
        if (!_(e)) return void (f[t] = l[t] = e);
        (l[t] = e.defaultState), (f[t] = e.getState());
        let r = ot(e, p, {
            scope: { key: t, clone: o },
            node: d,
            meta: { op: "combine" },
          }),
          n = he(e);
        m.push({ type: "field", field: t, from: n }),
          i && (Ke(i.plain, n) || r.seq.unshift(i.loader));
      }),
      (p.defaultShape = r),
      (c.after = [
        a ? { type: M, to: he(p), fn: a } : { type: "copy", to: he(p) },
      ]),
      i || (p.defaultState = a ? (he(p).current = a(f)) : l),
      p
    );
  };
let bt = ({ params: e, req: t, ok: r, anyway: n, stack: a }) => (o) =>
  Te({
    target: [n, vt],
    params: [
      r
        ? { status: "done", params: e, result: o }
        : { status: "fail", params: e, error: o },
      { fn: r ? t.rs : t.rj, value: o },
    ],
    defer: 1,
    page: a.page,
    forkPage: we(a),
  });
const vt = e({
    node: [
      ae({
        fn({ fn: e, value: t }) {
          e(t);
        },
      }),
    ],
    meta: { op: "fx", fx: "sidechain" },
  }),
  wt = (e, t, r) => (
    e.watch((e) => {
      Se(r, [e]),
        t.add(e),
        e.ownerSet || (e.ownerSet = t),
        ve(e) || (e.parent = r);
    }),
    Se(r, [e]),
    (r) => (t.forEach(r), e.watch(r))
  ),
  St = "21.7.5";
export {
  C as allSettled,
  u as attach,
  Ye as clearNode,
  i as combine,
  p as createApi,
  d as createDomain,
  c as createEffect,
  l as createEvent,
  e as createNode,
  s as createStore,
  i as createStoreObject,
  N as fork,
  lt as forward,
  m as fromObservable,
  g as guard,
  v as hydrate,
  T as is,
  Te as launch,
  y as merge,
  k as restore,
  h as sample,
  q as scopeBind,
  S as serialize,
  r as setStoreName,
  b as split,
  le as step,
  St as version,
  at as withFactory,
  o as withRegion,
};
//# sourceMappingURL=effector.mjs.map
