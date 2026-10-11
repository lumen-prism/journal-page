// 手帐笔 — 手抖的细线、错开一点的平涂底色、模切白边贴纸、半透明纸胶带、点阵本子纸。
// 噪声借 watercolor.js 的 WC。
(function () {
  const J = {};
  let ctx, W, H, rand;
  J.INK = '#5b4033';

  J.init = (canvas, seed) => {
    WC.init(canvas.width, canvas.height, seed);
    ctx = canvas.getContext('2d'); W = canvas.width; H = canvas.height; rand = WC.rand;
    Object.assign(J, { ctx, W, H, rand });
  };
  const R = (a, b) => a + (b - a) * rand();
  J.R = R;

  // ── 几何
  J.ellipse = (cx, cy, rx, ry, rot = 0, n = 64, rfn) => Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2, r = rfn ? rfn(a) : 1, x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  });
  J.arc = (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  J.catmull = (pts, closed = true, step = 3) => {
    const out = [], n = pts.length, segs = closed ? n : n - 1;
    const at = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < segs; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      const k = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let j = 0; j < k; j++) {
        const t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  };
  // 细分到每段 ≤ step 像素，手抖才均匀
  const densify = (pts, closed, step = 3) => {
    const out = [], n = pts.length, segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const a = pts[i], b = pts[(i + 1) % n], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  };
  // 沿法线推一推；闭合形状用周期噪声，首尾接得上
  J.wobble = (pts0, amp = 1.1, scale = 24, closed = true) => {
    const pts = densify(pts0, closed), n = pts.length, seed = R(0, 500);
    let L = 0; const s = [0];
    for (let i = 1; i < n; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); s.push(L); }
    if (closed) L += Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]);
    const rad = L / (2 * Math.PI * scale);
    return pts.map((p, i) => {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
      const th = s[i] / (L || 1) * Math.PI * 2;
      const d = amp * (closed ? WC.fbm(Math.cos(th) * rad + seed, Math.sin(th) * rad + seed, 3) : WC.fbm(s[i] / scale + seed, seed, 3)) * 2;
      return [p[0] - ty / l * d, p[1] + tx / l * d];
    });
  };
  J.path = (c, pts, closed = true) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (closed) c.closePath(); };

  // ── 一块形状：底色错开一点、亮面反方向压一弯影子、手抖的线首尾搭一下
  J.shape = (c, pts, o = {}) => {
    const [sx, sy] = o.slip ?? [2.2, 1.6];
    if (o.fill) {
      c.save(); c.translate(sx, sy);
      c.fillStyle = o.fill; J.path(c, pts); c.fill();
      if (o.shade) {
        J.path(c, pts); c.clip();
        const [dx, dy] = o.shadeShift ?? [-9, -10];
        c.beginPath(); c.rect(-5000, -5000, 10000, 10000);
        pts.forEach(([x, y], i) => i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy)); c.closePath();
        c.fillStyle = o.shade; c.fill('evenodd');
      }
      c.restore();
    }
    if (o.ink !== null) {
      const wp = J.wobble(pts, o.wob ?? 1.1, 24, true), k = Math.max(2, Math.round(wp.length * 0.04));
      const tail = wp.slice(0, k).map(([x, y], i) => [x + (i + 1) * 0.22, y + (i + 1) * 0.3]);
      c.strokeStyle = o.ink ?? J.INK; c.lineWidth = o.lw ?? 3; c.lineCap = c.lineJoin = 'round';
      J.path(c, [...wp, ...tail], false); c.stroke();
    }
  };
  J.line = (c, pts, o = {}) => {
    const wp = J.wobble(o.smooth ? J.catmull(pts, false) : pts, o.wob ?? 0.9, 22, false);
    c.strokeStyle = o.ink ?? J.INK; c.lineWidth = o.lw ?? 3; c.lineCap = c.lineJoin = 'round';
    if (o.dash) c.setLineDash(o.dash);
    J.path(c, wp, false); c.stroke(); c.setLineDash([]);
  };
  J.dot = (c, x, y, r, color) => { c.fillStyle = color ?? J.INK; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  // 豆豆眼 + 小嘴 + 腮红
  J.face = (c, x, y, s = 1, o = {}) => {
    const g = 10 * s;
    if (o.blush !== false) for (const side of [-1, 1]) { c.fillStyle = 'rgba(244,140,140,0.5)'; c.beginPath(); c.ellipse(x + side * g * 2.1, y + g * 0.75, g * 0.85, g * 0.5, 0, 0, 7); c.fill(); }
    if (o.sleepy) for (const side of [-1, 1]) J.line(c, J.arc(x + side * g, y, g * 0.45, g * 0.35, 0.2, Math.PI - 0.2, 8), { lw: 2.4 * s, wob: 0.2 });
    else for (const side of [-1, 1]) { J.dot(c, x + side * g, y, 3.2 * s); J.dot(c, x + side * g - 1 * s, y - 1.2 * s, 1 * s, '#fff'); }
    J.line(c, J.arc(x, y + g * 0.45, g * 0.42, g * 0.4, 0.3, Math.PI - 0.3, 10), { lw: 2.2 * s, wob: 0.2 });
  };
  J.star = (c, x, y, r, o = {}) => {
    const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; });
    J.shape(c, pts, { fill: o.fill, lw: o.lw ?? 2.2, wob: 0.5, slip: [1.5, 1.2] });
  };
  J.sparkle = (c, x, y, r, o = {}) => {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    J.shape(c, J.catmull(pts, true, 2), { fill: o.fill, lw: o.lw ?? 2, wob: 0.3, slip: [1.2, 1] });
  };
  J.heart = (c, x, y, s, o = {}) => {
    const pts = Array.from({ length: 48 }, (_, i) => { const t = i / 48 * Math.PI * 2; return [x + s * 8 * Math.sin(t) ** 3, y - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 2]; });
    J.shape(c, pts, { fill: o.fill ?? '#ef8a8a', lw: o.lw ?? 2.2, wob: 0.4, slip: [1.2, 1] });
  };

  // ── 裁切线：沿外轮廓往外让几像素，一段段波浪形的粗虚线，两头收尖；exclude 里的形状挡住的部分不画
  J.cut = (pts0, o = {}) => {
    const pts = densify(pts0, true, 1.5), n = pts.length;
    let area = 0;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    const sgn = area > 0 ? 1 : -1, off = o.off ?? 4, nrm = [];
    const P = pts.map((p, i) => {
      const a = pts[(i - 3 + n) % n], b = pts[(i + 3) % n], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
      nrm.push([sgn * ty / l, -sgn * tx / l]);
      return [p[0] + nrm[i][0] * off, p[1] + nrm[i][1] * off];
    });
    const S = [0];
    for (let i = 1; i < n; i++) S.push(S[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const L = S[n - 1], amp = o.amp ?? 2.1, lw = o.lw ?? 4.2, ph = R(0, 6);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.strokeStyle = o.ink ?? '#33292a'; c.lineCap = 'round';
    let i = Math.floor(R(0, n));
    let s = 0;
    while (s < L) {
      const dash = rand() < 0.15 ? R(3, 7) : R(o.dmin ?? 14, o.dmax ?? 46), gap = R(4, 11), wl = R(0.8, 1.25) * (o.wave ?? 16), lwd = lw * R(0.8, 1.1);
      const seg = [];
      for (let k = 0; k < n && S[k] !== undefined; k++) {
        const j = (i + k) % n, d = (S[j] - S[i] + L) % L;
        if (d > dash) break;
        const w = amp * Math.sin(2 * Math.PI * (S[j] / wl) + ph);
        seg.push([P[j][0] + nrm[j][0] * w, P[j][1] + nrm[j][1] * w, d / dash]);
      }
      for (let k = 1; k < seg.length; k++) {
        c.lineWidth = lwd * (0.5 + 0.5 * Math.sin(Math.PI * seg[k][2]));
        c.beginPath(); c.moveTo(seg[k - 1][0], seg[k - 1][1]); c.lineTo(seg[k][0], seg[k][1]); c.stroke();
      }
      let adv = 0;
      while (adv < dash + gap && s < L) { const j = (i + 1) % n; const st = Math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1]); adv += st; s += st; i = j; }
    }
    if (o.exclude) { c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; for (const ex of o.exclude) { J.path(c, ex); c.fill(); } }
    ctx.drawImage(cv, 0, 0);
  };
  // 标签旁边那个小卷卷箭头
  J.curl = (x, y, s = 1, rot = 0, o = {}) => {
    const pts = [[0, 0], [5, -3], [6.5, -8.5], [2.5, -11], [-1, -8], [1, -2.5], [6, 1.5], [11, 8]].map(([px, py]) => {
      const qx = px * s, qy = py * s; return [x + qx * Math.cos(rot) - qy * Math.sin(rot), y + qx * Math.sin(rot) + qy * Math.cos(rot)];
    });
    J.line(ctx, pts, { smooth: true, lw: o.lw ?? 2.6, ink: o.ink ?? '#33292a', wob: 0.25 });
  };

  // ── 手写字：每个字微微歪一下、上下错一点
  J.text = (c, str, x, y, o = {}) => {
    c.save(); c.translate(x, y); c.rotate(o.rot ?? 0);
    c.font = o.font; c.fillStyle = o.color ?? J.INK; c.textBaseline = 'alphabetic';
    let cx = 0;
    for (const ch of str) {
      const w = c.measureText(ch).width;
      c.save(); c.translate(cx + w / 2, R(-1, 1) * (o.jy ?? 1.4)); c.rotate(R(-1, 1) * (o.jr ?? 0.04)); c.fillText(ch, -w / 2, 0); c.restore();
      cx += w + (o.spacing ?? 0);
    }
    c.restore();
    return cx;
  };

  // ── 贴纸：画在小画布上，外扩一圈白边，压一点影子贴上去
  J.sticker = (x, y, w, h, draw, o = {}) => {
    const s = document.createElement('canvas'); s.width = w; s.height = h;
    const sc = s.getContext('2d'); sc.translate(w / 2, h / 2); draw(sc);
    const b = o.border ?? 10, ol = document.createElement('canvas'); ol.width = w; ol.height = h;
    const oc = ol.getContext('2d');
    for (const r of [b, b * 0.5]) for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; oc.drawImage(s, Math.cos(a) * r, Math.sin(a) * r); }
    oc.drawImage(s, 0, 0);
    oc.globalCompositeOperation = 'source-in'; oc.fillStyle = o.paper ?? '#fffdf8'; oc.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
    ctx.shadowColor = 'rgba(90,70,50,0.22)'; ctx.shadowBlur = 9; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 4;
    ctx.drawImage(ol, -w / 2, -h / 2);
    ctx.shadowColor = 'transparent';
    ctx.drawImage(s, -w / 2, -h / 2);
    ctx.restore();
  };

  // ── 纸胶带：半透明，两头撕出锯齿，正片叠底透出底下的东西
  J.tape = (x, y, len, wid, rot, o = {}) => {
    const t = document.createElement('canvas'); t.width = len + 24; t.height = wid + 24;
    const tc = t.getContext('2d'); tc.translate(12, 12);
    const n = Math.max(4, Math.round(wid / 5)), pts = [[0, 0], [len, 0]];
    for (let i = 1; i <= n; i++) pts.push([len + (i % 2 ? 3.5 : -1) * R(0.5, 1.2), i / n * wid]);
    pts.push([0, wid]);
    for (let i = n - 1; i >= 1; i--) pts.push([(i % 2 ? -3.5 : 1) * R(0.5, 1.2), i / n * wid]);
    J.path(tc, pts); tc.fillStyle = o.color; tc.fill(); tc.save(); tc.clip();
    tc.fillStyle = o.pattern ?? 'rgba(255,255,255,0.55)';
    if (o.kind === 'snow') {
      for (let xx = 14; xx < len; xx += 30) {
        const yy = wid / 2 + ((xx / 30) % 2 ? -wid * 0.18 : wid * 0.18), r = wid * 0.2;
        tc.strokeStyle = o.pattern ?? 'rgba(255,255,255,0.85)'; tc.lineWidth = 1.6; tc.lineCap = 'round';
        for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; tc.beginPath(); tc.moveTo(xx - Math.cos(a) * r, yy - Math.sin(a) * r); tc.lineTo(xx + Math.cos(a) * r, yy + Math.sin(a) * r); tc.stroke(); }
      }
    } else if (o.kind === 'text') {
      tc.font = o.font ?? `${Math.round(wid * 0.5)}px Georgia`; tc.textBaseline = 'middle';
      const w0 = tc.measureText(o.text).width + 18;
      for (let xx = 8; xx < len; xx += w0) tc.fillText(o.text, xx, wid / 2 + 1);
    } else if (o.kind === 'dots') { for (let yy = 7; yy < wid; yy += 14) for (let xx = (yy / 14 % 2) * 9 + 6; xx < len; xx += 18) { tc.beginPath(); tc.arc(xx, yy, 3, 0, 7); tc.fill(); } }
    else if (o.kind === 'grid') { for (let xx = 0; xx < len; xx += 12) tc.fillRect(xx, 0, 2, wid); for (let yy = 0; yy < wid; yy += 12) tc.fillRect(0, yy, len, 2); }
    else { tc.rotate(-0.6); for (let xx = -wid * 2; xx < len + wid * 2; xx += 16) tc.fillRect(xx, -wid * 2, 7, wid * 5); }
    tc.restore();
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = o.alpha ?? 0.85; ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(t, -len / 2 - 12, -wid / 2 - 12); ctx.restore();
  };

  // ── 和纸胶带（宽、带图案）：两头撕出细毛边，和纸纤维，边缘一道浅浅的压痕；
  //    先正片叠底（半透明，底下的东西透上来），再薄薄盖一层正常色（白色图案才看得见）。
  //    pattern(tc, len, wid) 在胶带坐标里画图案，已经 clip 在胶带里。
  J.washi = (x, y, len, wid, rot, o = {}) => {
    const pad = 16, t = document.createElement('canvas'); t.width = len + pad * 2; t.height = wid + pad * 2;
    const tc = t.getContext('2d'); tc.translate(pad, pad);
    const tear = (xb, dir) => { const a = []; for (let yy = 0; yy <= wid; yy += R(2, 4.5)) a.push([xb + dir * R(0, 5.5), Math.min(wid, yy)]); a.push([xb + dir * R(0, 4), wid]); return a; };
    const L = tear(0, 1), Rr = tear(len, -1);
    // 左边从上到下，右边从下到上
    const poly = [...L, ...Rr.slice().reverse()];
    J.path(tc, poly); tc.fillStyle = o.color ?? '#cfe0ef'; tc.fill();
    tc.save(); J.path(tc, poly); tc.clip();
    // 和纸的深浅：顺着长度方向的云状起伏 + 纤维
    for (let xx = 0; xx < len; xx += 3) { const v = WC.fbm(xx / 60 + 3.3, 0.7, 2); tc.fillStyle = v > 0 ? `rgba(255,255,255,${v * 0.22})` : `rgba(0,0,40,${-v * 0.06})`; tc.fillRect(xx, 0, 3, wid); }
    if (o.pattern) o.pattern(tc, len, wid);
    tc.lineCap = 'round';
    for (let i = 0; i < len * 0.5; i++) {
      const fx = R(0, len), fy = R(0, wid), a = R(-0.4, 0.4), l = R(4, 16);
      tc.strokeStyle = R(0, 1) < 0.7 ? `rgba(255,255,255,${R(0.12, 0.3)})` : `rgba(60,60,90,${R(0.04, 0.1)})`; tc.lineWidth = R(0.5, 1.1);
      tc.beginPath(); tc.moveTo(fx, fy); tc.lineTo(fx + Math.cos(a) * l, fy + Math.sin(a) * l); tc.stroke();
    }
    tc.fillStyle = 'rgba(255,255,255,0.35)'; tc.fillRect(0, 1, len, 1.5); tc.fillStyle = 'rgba(40,40,70,0.08)'; tc.fillRect(0, wid - 2.5, len, 1.5);
    tc.restore();
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha = o.alpha ?? 0.88; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(t, -len / 2 - pad, -wid / 2 - pad);
    ctx.globalAlpha = o.cover ?? 0.3; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(t, -len / 2 - pad, -wid / 2 - pad);
    ctx.restore();
  };

  // ── 点阵本子纸
  J.paper = (o = {}) => {
    ctx.fillStyle = o.bg ?? '#f8f2e7'; ctx.fillRect(0, 0, W, H);
    const g = o.grid ?? 36;
    ctx.fillStyle = o.dot ?? 'rgba(150,128,105,0.38)';
    for (let y = g / 2 + 6; y < H; y += g) for (let x = g / 2 + 4; x < W; x += g) { ctx.beginPath(); ctx.arc(x, y, 1.7, 0, 7); ctx.fill(); }
  };
  // 最后整张撒一层纸纹
  J.grain = (amt = 9) => {
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, n = (rand() - 0.5) * amt + 10 * WC.fbm(x / 160, y / 160, 3);
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  };

  window.J = J;
})();
