// 手帐材料：票根、横线卡片、标题、批注、正文、和纸胶带上的一排小图案、小涂鸦。
// 这些是"买来的材料"——只管它本身长什么样。这一页画什么、摆在哪、歪多少、印什么花纹，都由 scene 现写，这里不管。
// 版面永远不做成工具。新东西先留在那一页里，用过两次、样子稳了再收进来。
//
// 用法：JP.xxx(J, …)；要上水彩的（ticket）多传一个 kit，在 kit.finish() 之前调；其余在 finish 之后调。
window.JP = {
  INK: '#3a2f31', NOTE: '#7a5a4c',

  // ── 票根：左边一截撕票口（stub 颜色），虚线撕痕，右边条码，可挂一根绳。返回外形（给别人 reserve/exclude 用）
  ticket(J, kit, o) {
    const { x, y, rot = 0, s = 1, w = 280, h = 124 } = o, hw = w / 2, hh = h / 2, sx = -hw + (o.stubW ?? 74);
    const T = pts => kit.tf(pts, { x, y, s, rot });
    const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const outline = T([[-hw, -hh], [hw, -hh], [hw, -10], ...J.arc(hw, 0, 9, 10, -Math.PI / 2, -Math.PI * 1.5, 12), [hw, hh], [-hw, hh], [-hw, 10], ...J.arc(-hw, 0, 9, 10, Math.PI / 2, -Math.PI / 2, 12), [-hw, -10]]);
    const hole = T(J.ellipse(-hw + 32, -hh + 24, 6, 6, 0, 20));
    kit.paint(outline, [
      { color: o.paper ?? [246, 238, 220], density: 0.3 },
      { draw: kit.fillP(T(rect(-hw - 10, -hh - 8, sx, hh + 8))), blur: 1.5, color: o.stub ?? [150, 186, 222], density: 0.6 },
      { draw: kit.fillP(T(J.ellipse(hw * 0.6, hh * 0.6, hw * 0.45, hh * 0.5))), blur: 14, color: [190, 180, 170], density: 0.3 },
    ], { reserve: o.string === false ? null : kit.fillP(hole), edge: 0.5 });
    kit.pen(T([[sx, -hh + 4], [sx, hh - 4]]), { ink: 'rgba(60,70,100,0.55)', lw: 1.4, dash: [5, 5] });
    if (o.string !== false) kit.pen(T([[-hw + 32, -hh + 18], [-hw + 8, -hh - 18], [-hw + 20, -hh - 50], [-hw + 44, -hh - 60]]), { smooth: true, ink: o.stringInk ?? 'rgba(200,90,90,0.8)', lw: 2 });
    kit.later(() => {
      const c = J.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
      c.fillStyle = o.ink ?? '#2f3d63';
      const room = hw - 56 - (sx + 14);   // 撕票口到条码之间
      if (o.title) {
        let ts = o.titleSize ?? 23; const tf = sz => `${o.titleBold === false ? '' : 'bold '}${sz}px ${o.titleFont ?? 'Georgia'}`;
        c.font = tf(ts); while (c.measureText(o.title).width > room && ts > 10) c.font = tf(--ts);
        c.fillText(o.title, sx + 14, -16);
      }
      c.font = `13px ${o.font ?? 'Georgia'}`; (o.lines ?? []).forEach((t, i) => c.fillText(t, sx + 14, 6 + i * 20));
      if (o.number) { c.save(); c.translate((-hw + sx) / 2 + 4, 8); c.rotate(-Math.PI / 2); c.font = 'bold 15px Georgia'; c.fillStyle = 'rgba(250,248,244,0.95)'; c.fillText(o.number, -30, 0); c.restore(); }
      if (o.barcode !== false) for (let bx = hw - 48; bx < hw - 12; bx += 2) { if (J.R(0, 1) < 0.75) c.fillRect(bx, -hh + 20, J.R(0.8, 2.4), h - 60); }
      c.restore();
    });
    kit.cut(outline, { lw: 3.6, exclude: o.exclude });
    return outline;
  },

  // ── 标题：一条纸胶带垫在底下，大号手写字歪一点，下面一行小字和一道手画的线
  title(J, text, x, y, o = {}) {
    const c = J.ctx, size = o.size ?? 92, font = `${size}px ${o.font ?? 'Sunrise'}`, rot = o.rot ?? -0.04;
    c.save(); c.font = font; const tw = c.measureText(text).width + (o.spacing ?? 0) * text.length; c.restore();
    const at = (dx, dy) => [x + dx * Math.cos(rot) - dy * Math.sin(rot), y + dx * Math.sin(rot) + dy * Math.cos(rot)];
    if (o.tape !== false) {
      const len = o.tapeLen ?? tw * 0.82;
      J.tape(...at(len / 2 - 10 + (o.tapeDx ?? 0), -size * 0.4 + (o.tapeDy ?? 0)), len, size * 0.56, rot + (o.tapeRot ?? -0.01), { color: o.tapeColor ?? '#bfe0d6', kind: o.tapeKind ?? 'stripes' });
    }
    J.text(c, text, x - 4, y, { font, rot, jr: 0.03, color: o.color ?? JP.INK });
    let subW = 0;
    if (o.sub) {
      const sf = o.subFont ?? '40px Sunrise, "HanziPen SC"';
      c.save(); c.font = sf; subW = c.measureText(o.sub).width; c.restore();
      J.text(c, o.sub, ...at(14, size * 0.78), { font: sf, color: o.color ?? JP.INK, rot: rot + 0.02 });
    }
    if (o.underline !== false) {
      const L = Math.max(tw * 0.75, subW + 30), yy = size * (o.sub ? 0.95 : 0.22);
      J.line(c, [at(12, yy), at(12 + L * 0.28, yy - 5), at(12 + L * 0.55, yy), at(12 + L, yy - 10)], { smooth: true, ink: o.lineColor ?? 'rgba(120,150,200,0.8)', lw: 2.6 });
    }
    return { width: tw };
  },

  // ── 卡片：paper = 'lined'（横线，默认）| 'grid'（方格）| 'dot'（点阵）| 'kraft'（牛皮纸）| 'plain'
  //    todos: [[文字, 打钩?]]；lines: ['一行一行的字']；tape: 'diagonal'（两个对角，默认）| 'top' | 'none'
  card(J, o) {
    const c = J.ctx, w = o.w ?? 410, h = o.h ?? 250, rot = o.rot ?? 0, ink = o.ink ?? JP.INK, paper = o.paper ?? 'lined';
    const kraft = paper === 'kraft';
    c.save(); c.translate(o.x, o.y); c.rotate(rot);
    c.shadowColor = 'rgba(90,70,50,0.2)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
    c.fillStyle = o.color ?? (kraft ? '#d8c19c' : '#fffdf8'); c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'transparent';
    c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
    if (kraft) for (let i = 0; i < w * h / 120; i++) { c.strokeStyle = J.R(0, 1) < 0.5 ? 'rgba(120,90,50,0.18)' : 'rgba(255,245,225,0.25)'; c.lineWidth = J.R(0.5, 1.2); const fx = J.R(-w / 2, w / 2), fy = J.R(-h / 2, h / 2), a = J.R(0, 6.3), l = J.R(3, 10); c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.cos(a) * l, fy + Math.sin(a) * l); c.stroke(); }
    const lc = o.lineColor ?? (kraft ? 'rgba(120,90,60,0.35)' : 'rgba(160,190,220,0.7)');
    const LH = o.lineHeight ?? 44, TOP = o.top ?? 56;
    if (paper === 'lined' || kraft) { c.strokeStyle = lc; c.lineWidth = 1.4; for (let yy = -h / 2 + TOP; yy < h / 2 - 4; yy += LH) { c.beginPath(); c.moveTo(-w / 2 + 15, yy); c.lineTo(w / 2 - 15, yy); c.stroke(); } }
    if (paper === 'grid') { c.strokeStyle = 'rgba(160,190,220,0.45)'; c.lineWidth = 1; for (let xx = -w / 2 + 22; xx < w / 2; xx += 22) { c.beginPath(); c.moveTo(xx, -h / 2); c.lineTo(xx, h / 2); c.stroke(); } for (let yy = -h / 2 + 22; yy < h / 2; yy += 22) { c.beginPath(); c.moveTo(-w / 2, yy); c.lineTo(w / 2, yy); c.stroke(); } }
    if (paper === 'dot') { c.fillStyle = 'rgba(150,140,130,0.45)'; for (let yy = -h / 2 + 22; yy < h / 2; yy += 22) for (let xx = -w / 2 + 22; xx < w / 2; xx += 22) { c.beginPath(); c.arc(xx, yy, 1.4, 0, 7); c.fill(); } }
    c.restore();
    if (o.title) J.text(c, o.title, -w / 2 + 25, -h / 2 + 40, { font: o.titleFont ?? '34px Sunrise', color: o.titleInk ?? (kraft ? '#5a4030' : '#6a86b8') });
    (o.todos ?? []).forEach(([t, done], i) => {
      const yy = -h / 2 + TOP + LH * (i + 1) - 4, bs = Math.min(22, LH * 0.5);
      J.shape(c, [[-w / 2 + 25, yy - bs - 2], [-w / 2 + 25 + bs, yy - bs - 2], [-w / 2 + 25 + bs, yy - 2], [-w / 2 + 25, yy - 2]], { lw: 2.2, wob: 0.5, ink });
      if (done) J.line(c, [[-w / 2 + 27, yy - bs * 0.6], [-w / 2 + 25 + bs * 0.45, yy - 4], [-w / 2 + 31 + bs, yy - bs * 1.45]], { ink: '#e0675f', lw: 3.2, wob: 0.3 });
      J.text(c, t, -w / 2 + 43 + bs, yy - 2, { font: o.font ?? '30px "HanziPen SC"', color: ink });
    });
    (o.lines ?? []).forEach((t, i) => J.text(c, t, -w / 2 + 25, -h / 2 + (o.title ? TOP + LH - 6 : TOP - 6) + i * LH, { font: o.font ?? '30px "HanziPen SC"', color: ink }));
    c.restore();
    const at = (dx, dy) => [o.x + dx * Math.cos(rot) - dy * Math.sin(rot), o.y + dx * Math.sin(rot) + dy * Math.cos(rot)];
    const tape = o.tape ?? 'diagonal', tcol = o.tapeColor ?? '#f6d77a', tk = o.tapeKind ?? 'grid';
    if (tape === 'diagonal') { J.tape(...at(-w / 2 + 10, -h / 2 + 4), 110, 34, rot - 0.62, { color: tcol, kind: tk }); J.tape(...at(w / 2 - 10, h / 2 - 4), 110, 34, rot - 0.62, { color: tcol, kind: tk }); }
    else if (tape === 'top') J.tape(...at(0, -h / 2 + 2), 140, 36, rot + 0.03, { color: tcol, kind: tk });
  },

  // ── 批注：一句小字 + 一条弯弯的虚线箭头指过去。from 是箭头起点（默认字的左上角），bend 控制往哪边弯、多弯
  note(J, text, x, y, to, o = {}) {
    const c = J.ctx, ink = o.color ?? JP.NOTE;
    const font = o.font ?? '26px "HanziPen SC"';
    if (o.bg) {   // 垫一张小纸签：落在水彩上也看得清
      c.save(); c.font = font; const tw = c.measureText(text).width, fs = parseInt(font) || 26; c.restore();
      c.save(); c.translate(x, y); c.rotate(o.rot ?? 0);
      c.shadowColor = 'rgba(90,70,50,0.18)'; c.shadowBlur = 6; c.shadowOffsetY = 2; c.fillStyle = o.bg === true ? '#fffdf8' : o.bg;
      c.fillRect(-10, -fs * 0.95, tw + 20, fs * 1.35); c.restore();
    }
    J.text(c, text, x, y, { font, color: ink, rot: o.rot ?? 0, jr: 0.04 });
    if (!to) return;
    const [fx, fy] = o.from ?? [x - 6, y - 10], [tx, ty] = to, b = o.bend ?? 18, mx = (fx + tx) / 2 + b, my = (fy + ty) / 2 - b;
    J.line(c, [[fx, fy], [mx, my], [tx, ty]], { smooth: true, ink, lw: 1.6, dash: [5, 5] });
    const a = Math.atan2(ty - my, tx - mx);
    for (const d of [-0.5, 0.5]) J.line(c, [[tx, ty], [tx - Math.cos(a + d) * 9, ty - Math.sin(a + d) * 9]], { ink, lw: 1.6, wob: 0.1 });
  },

  // ── 一段正文：按宽度折行（中文传 cjk: true 按字折），每行起点左右错几个像素，整体歪一点。返回最后一行的 y
  para(J, text, x, y, maxW, o = {}) {
    const c = J.ctx, font = o.font ?? '22px Homemade', lh = o.lineHeight ?? 41;
    c.save(); c.font = font;
    const lines = []; let cur = '';
    const words = o.cjk ? [...text] : text.split(' '), sep = o.cjk ? '' : ' ';
    for (const w of words) { const t = cur ? cur + sep + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    c.restore();
    lines.forEach((t, i) => J.text(c, t, x + J.R(-4, 4), y + i * lh, { font, color: o.color ?? JP.INK, rot: o.rot ?? -0.035, jr: 0.015, jy: 0.8 }));
    return y + (lines.length - 1) * lh;
  },

  // ── 和纸胶带上的一排小图案：motifs 是这一页现画的小图案函数 (tc) => {}（原点在图案中心），
  //    这里只负责沿胶带排开、轮着用、随机歪一点、上下两排小点。给 J.washi 的 pattern 回调里用。
  washiRow(tc, len, wid, motifs, o = {}) {
    const cy = wid / 2;
    if (o.dots !== false) for (let x = 8; x < len; x += 14) for (const yy of [7, wid - 7]) { tc.fillStyle = o.dotColor ?? 'rgba(255,255,255,0.7)'; tc.beginPath(); tc.arc(x + (yy > cy ? 7 : 0), yy, 1.8, 0, 7); tc.fill(); }
    let i = 0;
    for (let x = o.start ?? 40; x < len - 30; x += o.step ?? 70) {
      tc.save(); tc.translate(x, cy + J.R(-2, 2)); tc.rotate(J.R(-0.08, 0.08)); tc.scale(o.scale ?? 1.3, o.scale ?? 1.3);
      motifs[i++ % motifs.length](tc);
      tc.restore();
    }
  },

  // ── 小涂鸦
  flake(J, x, y, r, ink = 'rgba(70,96,150,0.7)') {
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3 + 0.2, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r;
      J.line(J.ctx, [[x, y], [ex, ey]], { ink, lw: 1.6, wob: 0.15 });
      const mx = x + Math.cos(a) * r * 0.6, my = y + Math.sin(a) * r * 0.6;
      for (const d of [-0.6, 0.6]) J.line(J.ctx, [[mx, my], [mx + Math.cos(a + d) * r * 0.3, my + Math.sin(a + d) * r * 0.3]], { ink, lw: 1.4, wob: 0.1 });
    }
  },
  drop(J, x, y, s = 1, ink = 'rgba(96,126,176,0.75)') {
    const pts = J.catmull([[0, -9], [3.6, -2], [5, 3.5], [0, 8], [-5, 3.5], [-3.6, -2]].map(([a, b]) => [x + a * s, y + b * s]), true, 1.5);
    J.line(J.ctx, [...pts, pts[0]], { ink, lw: 1.6, wob: 0.2 });
  },
  cloud(J, x, y, s = 1, ink = 'rgba(110,120,150,0.75)') {
    const pts = [...J.arc(x - 14 * s, y, 10 * s, 9 * s, Math.PI * 0.95, Math.PI * 1.9, 8), ...J.arc(x + 2 * s, y - 6 * s, 13 * s, 12 * s, Math.PI * 1.1, Math.PI * 1.95, 10), ...J.arc(x + 18 * s, y, 9 * s, 8 * s, Math.PI * 1.2, Math.PI * 2.05, 8), [x + 26 * s, y + 6 * s], [x - 24 * s, y + 6 * s]];
    J.line(J.ctx, [...pts, pts[0]], { ink, lw: 1.6, wob: 0.25 });
  },
};
