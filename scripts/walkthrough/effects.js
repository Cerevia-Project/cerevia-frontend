// Injected into every page during recording: an animated cursor, click
// ripples and smooth zoom. Zoom transforms <body> so text re-renders sharp.
(() => {
  if (window.__wt) return;

  const CURSOR = `<svg width="30" height="30" viewBox="0 0 30 30" style="transform-origin:4px 2.5px">
    <path d="M4 2.5 L4 24 L9.6 18.6 L13.4 27.2 L17.1 25.6 L13.4 17.2 L21 17.2 Z"
      fill="#111827" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

  const state = { scale: 1, tx: 0, ty: 0, base: null, root: null };
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function root() {
    if (state.root?.isConnected) return state.root;
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    const cursor = document.createElement("div");
    cursor.style.cssText =
      "position:absolute;left:-4px;top:-2.5px;will-change:transform;" +
      "filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))";
    cursor.innerHTML = CURSOR;
    el.appendChild(cursor);
    document.documentElement.appendChild(el);
    state.root = el;
    state.cursor = cursor;
    state.base ??= { x: innerWidth * 0.55, y: innerHeight * 0.62 };
    place(0);
    return el;
  }

  const visual = () => ({
    x: state.scale * state.base.x + state.tx,
    y: state.scale * state.base.y + state.ty,
  });

  function place(ms) {
    const { x, y } = visual();
    state.cursor.style.transition = `transform ${ms}ms cubic-bezier(.45,0,.2,1)`;
    state.cursor.style.transform = `translate(${x}px, ${y}px)`;
  }

  window.__wt = {
    distanceTo(x, y) {
      root();
      const v = visual();
      return Math.hypot(x - v.x, y - v.y);
    },

    moveTo(x, y, ms) {
      root();
      state.base = { x: (x - state.tx) / state.scale, y: (y - state.ty) / state.scale };
      place(ms);
    },

    click() {
      const layer = root();
      const { x, y } = visual();
      const ring = document.createElement("div");
      ring.style.cssText =
        `position:absolute;left:${x - 20}px;top:${y - 20}px;width:40px;height:40px;` +
        "border-radius:50%;border:3px solid rgba(96,134,206,.95);background:rgba(96,134,206,.2)";
      layer.appendChild(ring);
      ring.animate(
        [{ transform: "scale(.25)", opacity: 1 }, { transform: "scale(1.5)", opacity: 0 }],
        { duration: 700, easing: "cubic-bezier(.2,.7,.3,1)" },
      ).onfinish = () => ring.remove();
      state.cursor.firstElementChild.animate(
        [{ transform: "scale(1)" }, { transform: "scale(.8)" }, { transform: "scale(1)" }],
        { duration: 280, easing: "ease-out" },
      );
    },

    zoom(rect, maxScale, ms) {
      root();
      let scale = 1;
      let tx = 0;
      let ty = 0;
      if (rect) {
        const w = rect.width / state.scale;
        const h = rect.height / state.scale;
        scale = clamp(Math.min((innerWidth * 0.82) / w, (innerHeight * 0.82) / h), 1, maxScale);
        const cx = (rect.x + rect.width / 2 - state.tx) / state.scale;
        const cy = (rect.y + rect.height / 2 - state.ty) / state.scale;
        tx = clamp(innerWidth / 2 - scale * cx, innerWidth - scale * innerWidth, 0);
        ty = clamp(innerHeight / 2 - scale * cy, innerHeight - scale * innerHeight, 0);
      }
      Object.assign(state, { scale, tx, ty });
      const body = document.body;
      body.style.transformOrigin = "0 0";
      body.style.transition = `transform ${ms}ms cubic-bezier(.65,0,.35,1)`;
      body.style.transform = scale === 1 ? "" : `translate(${tx}px, ${ty}px) scale(${scale})`;
      place(ms);
    },
  };
})();
