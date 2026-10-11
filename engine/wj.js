// 水彩手帐的小工具箱：坐标变换、湿画填色、钢笔细节、裁切线、标签。
// scene 里 `const kit = WJ.kit(J, WC)` 拿到；水彩先铺，线和字记进 after，kit.finish() 时水彩"干了"再一起画。
window.WJ = {
  kit(J, WC, o = {}) {
    const ctx = J.ctx;
    const WET = { rough: 0.25, soft: 2.2, sharp: 2.2, edge: 0.7, edgeR: 3, mottle: 0.3, mottleScale: 45, gran: 0.1, pool: 0.15, wick: 0.25, ...(o.wet || {}) };
    const after = [];
    const kit = {
      ctx, WET, after, R: J.R,
      // 局部坐标 → 画布：at(x, y, s)(pts)；tf 带旋转
      at: (x, y, s = 1) => pts => pts.map(([px, py]) => [x + px * s, y + py * s]),
      tf: (pts, { x = 0, y = 0, s = 1, rot = 0 } = {}) => pts.map(([px, py]) => [x + (px * Math.cos(rot) - py * Math.sin(rot)) * s, y + (px * Math.sin(rot) + py * Math.cos(rot)) * s]),
      fillP: pts => c => { J.path(c, pts); c.fill(); },
      // 一条粗线（伞杆、杯把、带子）→ 闭合外形，好拿去 paint 和 cut。hw 是半宽，可以是 p => 数字
      strokePoly: (pts, hw) => {
        const n = pts.length, H = typeof hw === 'function' ? hw : () => hw, L = [], Rt = [], tan = [];
        for (let i = 0; i < n; i++) {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
          tan.push([tx / l, ty / l]);
          const h = H(pts[i]);
          L.push([pts[i][0] - ty / l * h, pts[i][1] + tx / l * h]); Rt.push([pts[i][0] + ty / l * h, pts[i][1] - tx / l * h]);
        }
        const cap = (p, [tx, ty], h, sg) => Array.from({ length: 5 }, (_, k) => { const th = Math.PI * (k + 1) / 6; return [p[0] + sg * (-ty * Math.cos(th) + tx * Math.sin(th)) * h, p[1] + sg * (tx * Math.cos(th) + ty * Math.sin(th)) * h]; });
        return [...L, ...cap(pts[n - 1], tan[n - 1], H(pts[n - 1]), 1), ...Rt.reverse(), ...cap(pts[0], tan[0], H(pts[0]), -1)];
      },
      fillAll: list => c => list.forEach(p => { J.path(c, p); c.fill(); }),
      // 湿画一块：region 是外形点列；layers 是这块里的几层颜色（{ color, density, draw?, blur?, grad? }）
      paint: (pts, layers, opt = {}) => WC.wet(kit.fillP(pts), layers, { ...WET, ...opt }),
      wet: (draw, layers, opt = {}) => WC.wet(draw, layers, { ...WET, ...opt }),
      // 等水彩干了再画的：钢笔细节、裁切线、标签、小卷卷
      pen: (pts, opt = {}) => after.push(() => J.line(ctx, pts, { lw: 1.4, ink: 'rgba(70,52,44,0.6)', wob: 0.4, ...opt })),
      cut: (pts, opt = {}) => after.push(() => J.cut(pts, opt)),
      label: (text, x, y, opt = {}) => after.push(() => J.text(ctx, text, x, y, { font: `${opt.size ?? 42}px ${opt.font ?? 'Sunrise'}`, spacing: 1.2, jr: 0.03, color: opt.color, rot: opt.rot })),
      curl: (x, y, rot = 0, s = 1.9) => after.push(() => J.curl(x, y, s, rot)),
      later: f => after.push(f),
      finish: (relief = 0.13) => { WC.finish(ctx.canvas, { relief }); after.forEach(f => f()); },
    };
    return kit;
  },
};
