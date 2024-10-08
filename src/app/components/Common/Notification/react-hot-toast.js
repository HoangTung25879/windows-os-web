"use strict";
var D = Object.defineProperty;
var I = Object.getOwnPropertyDescriptor;
var v = Object.getOwnPropertyNames;
var M = Object.prototype.hasOwnProperty;
var U = (e, t) => {
    for (var o in t) D(e, o, { get: t[o], enumerable: !0 });
  },
  F = (e, t, o, a) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let r of v(t))
        !M.call(e, r) &&
          r !== o &&
          D(e, r, {
            get: () => t[r],
            enumerable: !(a = I(t, r)) || a.enumerable,
          });
    return e;
  };
var w = (e) => F(D({}, "__esModule", { value: !0 }), e);
var Y = {};
U(Y, {
  default: () => W,
  resolveValue: () => l,
  toast: () => n,
  useToaster: () => R,
  useToasterStore: () => g,
});
module.exports = w(Y);
var N = (e) => typeof e == "function",
  l = (e, t) => (N(e) ? e(t) : e);
var _ = (() => {
    let e = 0;
    return () => (++e).toString();
  })(),
  G = (() => {
    let e;
    return () => {
      if (e === void 0 && typeof window < "u") {
        let t = matchMedia("(prefers-reduced-motion: reduce)");
        e = !t || t.matches;
      }
      return e;
    };
  })();
var y = require("react"),
  k = 20;
var f = new Map(),
  C = 1e3,
  x = (e) => {
    if (f.has(e)) return;
    let t = setTimeout(() => {
      f.delete(e), T({ type: 4, toastId: e });
    }, C);
    f.set(e, t);
  },
  H = (e) => {
    let t = f.get(e);
    t && clearTimeout(t);
  },
  E = (e, t) => {
    switch (t.type) {
      case 0:
        return { ...e, toasts: [t.toast, ...e.toasts].slice(0, k) };
      case 1:
        return (
          t.toast.id && H(t.toast.id),
          {
            ...e,
            toasts: e.toasts.map((s) =>
              s.id === t.toast.id ? { ...s, ...t.toast } : s,
            ),
          }
        );
      case 2:
        let { toast: o } = t;
        return e.toasts.find((s) => s.id === o.id)
          ? E(e, { type: 1, toast: o })
          : E(e, { type: 0, toast: o });
      case 3:
        let { toastId: a } = t;
        return (
          a
            ? x(a)
            : e.toasts.forEach((s) => {
                x(s.id);
              }),
          {
            ...e,
            toasts: e.toasts.map((s) =>
              s.id === a || a === void 0 ? { ...s, visible: !1 } : s,
            ),
          }
        );
      case 4:
        return t.toastId === void 0
          ? { ...e, toasts: [] }
          : { ...e, toasts: e.toasts.filter((s) => s.id !== t.toastId) };
      case 5:
        return { ...e, pausedAt: t.time };
      case 6:
        let r = t.time - (e.pausedAt || 0);
        return {
          ...e,
          pausedAt: void 0,
          toasts: e.toasts.map((s) => ({
            ...s,
            pauseDuration: s.pauseDuration + r,
          })),
        };
    }
  },
  S = [],
  A = { toasts: [], pausedAt: void 0 },
  T = (e) => {
    (A = E(A, e)),
      S.forEach((t) => {
        t(A);
      });
  },
  L = { blank: 4e3, error: 4e3, success: 2e3, loading: 1 / 0, custom: 4e3 },
  g = (e = {}) => {
    let [t, o] = (0, y.useState)(A);
    (0, y.useEffect)(
      () => (
        S.push(o),
        () => {
          let r = S.indexOf(o);
          r > -1 && S.splice(r, 1);
        }
      ),
      [t],
    );
    let a = t.toasts.map((r) => {
      var s, c;
      return {
        ...e,
        ...e[r.type],
        ...r,
        duration:
          r.duration ||
          ((s = e[r.type]) == null ? void 0 : s.duration) ||
          (e == null ? void 0 : e.duration) ||
          L[r.type],
        style: {
          ...e.style,
          ...((c = e[r.type]) == null ? void 0 : c.style),
          ...r.style,
        },
      };
    });
    return { ...t, toasts: a };
  };
var X = (e, t = "blank", o) => ({
    createdAt: Date.now(),
    visible: !0,
    type: t,
    ariaProps: { role: "status", "aria-live": "polite" },
    message: e,
    pauseDuration: 0,
    ...o,
    id: (o == null ? void 0 : o.id) || _(),
  }),
  d = (e) => (t, o) => {
    let a = X(t, e, o);
    return T({ type: 2, toast: a }), a.id;
  },
  n = (e, t) => d("blank")(e, t);
n.error = d("error");
n.success = d("success");
n.loading = d("loading");
n.custom = d("custom");
n.dismiss = (e) => {
  T({ type: 3, toastId: e });
};
n.remove = (e) => T({ type: 4, toastId: e });
n.promise = (e, t, o) => {
  let a = n.loading(t.loading, { ...o, ...(o == null ? void 0 : o.loading) });
  return (
    e
      .then(
        (r) => (
          n.success(l(t.success, r), {
            id: a,
            ...o,
            ...(o == null ? void 0 : o.success),
          }),
          r
        ),
      )
      .catch((r) => {
        n.error(l(t.error, r), {
          id: a,
          ...o,
          ...(o == null ? void 0 : o.error),
        });
      }),
    e
  );
};
var p = require("react");
var J = (e, t) => {
    T({ type: 1, toast: { id: e, height: t } });
  },
  B = () => {
    T({ type: 5, time: Date.now() });
  },
  R = (e) => {
    let { toasts: t, pausedAt: o } = g(e);
    (0, p.useEffect)(() => {
      if (o) return;
      let s = Date.now(),
        c = t.map((i) => {
          if (i.duration === 1 / 0) return;
          let m = (i.duration || 0) + i.pauseDuration - (s - i.createdAt);
          if (m < 0) {
            i.visible && n.dismiss(i.id);
            return;
          }
          return setTimeout(() => n.dismiss(i.id), m);
        });
      return () => {
        c.forEach((i) => i && clearTimeout(i));
      };
    }, [t, o]);
    let a = (0, p.useCallback)(() => {
        o && T({ type: 6, time: Date.now() });
      }, [o]),
      r = (0, p.useCallback)(
        (s, c) => {
          let {
              reverseOrder: i = !1,
              gutter: m = 8,
              defaultPosition: b,
            } = c || {},
            O = t.filter(
              (u) => (u.position || b) === (s.position || b) && u.height,
            ),
            V = O.findIndex((u) => u.id === s.id),
            h = O.filter((u, P) => P < V && u.visible).length;
          return O.filter((u) => u.visible)
            .slice(...(i ? [h + 1] : [0, h]))
            .reduce((u, P) => u + (P.height || 0) + m, 0);
        },
        [t],
      );
    return {
      toasts: t,
      handlers: {
        updateHeight: J,
        startPause: B,
        endPause: a,
        calculateOffset: r,
      },
    };
  };
var W = n;
0 && (module.exports = { resolveValue, toast, useToaster, useToasterStore });
//# sourceMappingURL=index.js.map
