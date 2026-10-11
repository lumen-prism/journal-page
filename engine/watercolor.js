// 草纸水彩 — rough straw-paper watercolor pen.
// 颜料按 Beer–Lambert 叠：每层 wash 往三个通道里加光密度，所以叠色是透明罩染，不是盖色。
// 纸的起伏最后统一打一次侧光，颗粒穿过所有颜色——这是"像纸"的关键。
(function () {
  const WC = {};
  let W, H, N, rand, perm;
  let hgt, fib, pr, pg, pb, ar, ag, ab, mctx;

  function mulberry32(a) {
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  function grad(h, x, y) {
    switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; }
  }
  function noise(x, y) {
    const X = Math.floor(x), Y = Math.floor(y), xf = x - X, yf = y - Y, xi = X & 255, yi = Y & 255;
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const g1 = grad(perm[perm[xi] + yi], xf, yf), g2 = grad(perm[perm[xi + 1] + yi], xf - 1, yf);
    const g3 = grad(perm[perm[xi] + yi + 1], xf, yf - 1), g4 = grad(perm[perm[xi + 1] + yi + 1], xf - 1, yf - 1);
    const x1 = g1 + u * (g2 - g1), x2 = g3 + u * (g4 - g3);
    return x1 + v * (x2 - x1);
  }
  function fbm(x, y, oct = 4) {
    let s = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { s += a * noise(x * f, y * f); n += a; a *= 0.5; f *= 2.03; }
    return s / n;
  }

  // 3 passes of a box blur ≈ gaussian with sigma ≈ r
  function boxBlur(src, w, h, r) {
    const tmp = new Float32Array(w * h), dst = new Float32Array(w * h), d = 2 * r + 1;
    for (let y = 0; y < h; y++) {
      const o = y * w; let s = 0;
      for (let x = -r; x <= r; x++) s += src[o + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) { tmp[o + x] = s / d; s += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) { dst[y * w + x] = s / d; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
    }
    return dst;
  }
  function blur(a, w, h, r) {
    r = Math.max(1, Math.round(r));
    return boxBlur(boxBlur(boxBlur(a, w, h, r), w, h, r), w, h, r);
  }

  WC.init = (w, h, seed) => {
    W = w; H = h; N = W * H; rand = mulberry32(seed);
    perm = new Uint8Array(512);
    const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    ar = new Float32Array(N); ag = new Float32Array(N); ab = new Float32Array(N);
    const mc = document.createElement('canvas'); mc.width = W; mc.height = H;
    mctx = mc.getContext('2d', { willReadFrequently: true });
    Object.assign(WC, { rand, W, H });
  };
  Object.assign(WC, { noise, fbm, smooth, clamp01 });

  // 草纸: 粗齿 + 纤维 + 草屑 + 斑点 + 云状厚薄
  WC.paper = (o = {}) => {
    const tooth = o.tooth ?? 9;
    const raw = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      raw[y * W + x] = 0.6 * fbm(x / tooth, y / tooth, 3)
        + 0.3 * fbm(x / (tooth * 4) + 31.7, y / (tooth * 4) + 17.3, 3)
        + 0.1 * noise(x / (tooth * 0.3) + 7.1, y / (tooth * 0.3) + 3.3);
    }
    const fc = document.createElement('canvas'); fc.width = W; fc.height = H;
    const f = fc.getContext('2d', { willReadFrequently: true }); f.lineCap = 'round';
    const fiber = (L0, L1, w0, w1, style) => {
      const x = rand() * W, y = rand() * H, a = rand() * Math.PI * 2, L = L0 + rand() * rand() * (L1 - L0), bend = (rand() - 0.5) * L * 0.7;
      const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L;
      f.strokeStyle = style; f.lineWidth = w0 + rand() * (w1 - w0);
      f.beginPath(); f.moveTo(x, y); f.quadraticCurveTo((x + x2) / 2 - Math.sin(a) * bend, (y + y2) / 2 + Math.cos(a) * bend, x2, y2); f.stroke();
    };
    // raised fibers lift the height map
    for (let k = 0; k < (o.fibers ?? 2500); k++) fiber(10, 120, 0.6, 1.8, `rgba(255,255,255,${0.2 + rand() * 0.5})`);
    const fd = f.getImageData(0, 0, W, H).data;
    const lift = o.fiberLift ?? 0.22;
    fib = new Float32Array(N);
    for (let i = 0; i < N; i++) { fib[i] = fd[i * 4 + 3] / 255; raw[i] += lift * fib[i]; }
    let m = 0, s = 0;
    for (let i = 0; i < N; i++) m += raw[i];
    m /= N;
    for (let i = 0; i < N; i++) s += (raw[i] - m) ** 2;
    s = Math.sqrt(s / N);
    hgt = new Float32Array(N);
    for (let i = 0; i < N; i++) hgt[i] = clamp01(0.5 + (raw[i] - m) / (4 * s));

    // colored inclusions: dark fibers, straw bits, specks
    f.clearRect(0, 0, W, H);
    const c3 = (r, g, b, a) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
    for (let k = 0; k < (o.darkFibers ?? 500); k++) fiber(8, 90, 0.5, 1.4, c3(120 + rand() * 40, 95 + rand() * 30, 60 + rand() * 20, 0.12 + rand() * 0.3));
    for (let k = 0; k < (o.straw ?? 90); k++) fiber(5, 28, 1.4, 3.2, c3(150 + rand() * 40, 110 + rand() * 30, 55 + rand() * 25, 0.3 + rand() * 0.4));
    for (let k = 0; k < (o.specks ?? 350); k++) {
      f.fillStyle = c3(70 + rand() * 40, 50 + rand() * 30, 35 + rand() * 20, 0.35 + rand() * 0.5);
      f.beginPath(); f.arc(rand() * W, rand() * H, 0.5 + rand() * rand() * 2.2, 0, 7); f.fill();
    }
    const cd = f.getImageData(0, 0, W, H).data;
    const tint = o.tint ?? [238, 229, 208], form = o.formation ?? 0.04;
    pr = new Float32Array(N); pg = new Float32Array(N); pb = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, j = i * 4, a = cd[j + 3] / 255;
      const fm = 1 + form * 2 * fbm(x / 230 + 5.5, y / 230 + 9.1, 3);
      pr[i] = tint[0] * fm * (1 - a + a * cd[j] / 255);
      pg[i] = tint[1] * fm * (1 - a + a * cd[j + 1] / 255);
      pb[i] = tint[2] * fm * (1 - a + a * cd[j + 2] / 255);
    }
  };

  const alphaOf = (draw, reserve) => {
    mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.globalCompositeOperation = 'source-over'; mctx.clearRect(0, 0, W, H);
    mctx.save(); mctx.fillStyle = mctx.strokeStyle = '#fff'; mctx.lineCap = mctx.lineJoin = 'round'; draw(mctx); mctx.restore();
    if (reserve) {
      mctx.save(); mctx.globalCompositeOperation = 'destination-out'; mctx.fillStyle = mctx.strokeStyle = '#fff'; mctx.lineCap = mctx.lineJoin = 'round';
      reserve(mctx); mctx.restore();
    }
    return mctx.getImageData(0, 0, W, H).data;
  };
  const bboxOf = (img, mg) => {
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (img[(y * W + x) * 4 + 3] > 0) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < 0) return null;
    x0 = Math.max(0, x0 - mg); y0 = Math.max(0, y0 - mg); x1 = Math.min(W - 1, x1 + mg); y1 = Math.min(H - 1, y1 + mg);
    return { x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  };
  const crop = (img, { x0, y0, w, h }) => {
    const A = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) A[y * w + x] = img[((y + y0) * W + x + x0) * 4 + 3] / 255;
    return A;
  };

  // 一层水彩。draw(ctx) 用白色画出形状；reserve(ctx) 画要留白的地方。
  // rough: 边缘跟着纸齿走的程度   edge: 干边积色   gran: 颜料沉进纸谷   dry: 干笔，只挂在纸峰上
  // wet: 湿接湿的软边（px），mottle: 水痕斑驳   grad(x,y): 浓淡   blooms: 水渍花 [{x,y,r,s,ring}]
  WC.wash = (draw, o = {}) => {
    const k = o.color.map(c => -Math.log(Math.max(0.03, c / 255)));
    const dens = o.density ?? 0.6, rough = o.rough ?? 0.3, soft = o.soft ?? 1.5, sharp = o.sharp ?? 3;
    const edge = o.edge ?? 0.6, edgeR = o.edgeR ?? 5, mottle = o.mottle ?? 0.22, ms = o.mottleScale ?? 80;
    const gran = o.gran ?? 0.35, dry = o.dry ?? 0, wet = o.wet ?? 0, blooms = o.blooms || [];
    const img = alphaOf(draw, o.reserve), bb = bboxOf(img, Math.ceil(3 * Math.max(soft, edgeR, wet) + 6));
    if (!bb) return;
    const { x0, y0, w, h } = bb, n = w * h;
    let M = crop(img, bb);

    if (wet > 0) {
      M = blur(M, w, h, wet);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, hp = hgt[(y + y0) * W + x + x0];
        M[i] = clamp01(M[i] + (hp - 0.5) * rough * M[i] * (1 - M[i]) * 4);
      }
    } else {
      const Mb = blur(M, w, h, soft);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, hp = hgt[(y + y0) * W + x + x0];
        M[i] = clamp01((Mb[i] - 0.5 + (hp - 0.5) * rough) * sharp + 0.5);
      }
    }
    // 干边：水往边上跑，颜料在边缘积成一圈
    let E = null;
    if (edge > 0 && wet === 0) {
      const B = blur(M, w, h, edgeR); E = new Float32Array(n);
      for (let i = 0; i < n; i++) E[i] = Math.max(0, M[i] - B[i]) * 2;
    }
    const ox = rand() * 1000, oy = rand() * 1000;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, m = M[i];
      if (m <= 0.002) continue;
      const gx = x + x0, gy = y + y0, gi = gy * W + gx, hp = hgt[gi];
      let d = dens * m;
      if (mottle) d *= 1 + mottle * 2 * fbm(gx / ms + ox, gy / ms + oy, 3);
      if (o.grad) d *= o.grad(gx, gy);
      if (E) d *= 1 + edge * E[i];
      d *= Math.max(0, 1 + gran * (0.5 - hp) * 2);
      if (dry) { const t = hp + 0.18 * noise(gx / 4 + ox, gy / 4 + oy); d *= smooth(dry - 0.12, dry + 0.12, t); }
      for (const b of blooms) {
        const r = Math.hypot(gx - b.x, gy - b.y) / b.r + 0.25 * fbm(gx / 16 + b.x, gy / 16 + b.y, 3);
        if (r < 1.2) {
          if (r < 1) d *= 1 - b.s * (1 - 0.5 * smooth(0.4, 1, r));
          d += dens * m * (b.ring ?? 0.5) * Math.exp(-(((r - 1) / 0.03) ** 2));
        }
      }
      if (d <= 0) continue;
      ar[gi] += d * k[0]; ag[gi] += d * k[1]; ab[gi] += d * k[2];
    }
  };

  // 湿画：一块区域先刷清水，颜色点进去自己洇开。外沿一道水线，里面全是软过渡；水顺着纸纤维往外渗。
  // layers: [{ draw?, blur, color, density, grad }]，draw 缺省就是整块区域。
  // wick: 顺纤维渗出去的程度   pool: 颜料往下沉（纸是斜着放的）   其余同 wash
  WC.wet = (region, layers, o = {}) => {
    const rough = o.rough ?? 0.3, soft = o.soft ?? 2, sharp = o.sharp ?? 2.6, wick = o.wick ?? 0.4;
    const edge = o.edge ?? 0.9, edgeR = o.edgeR ?? 2.5, mottle = o.mottle ?? 0.3, ms = o.mottleScale ?? 90;
    const gran = o.gran ?? 0.15, pool = o.pool ?? 0.2, blooms = o.blooms || [];
    const img = alphaOf(region, o.reserve);
    const bb = bboxOf(img, Math.ceil(3 * Math.max(soft * 2, edgeR, ...layers.map(l => l.blur || 0)) + 8));
    if (!bb) return;
    const { x0, y0, w, h } = bb, n = w * h;
    const Mb = blur(crop(img, bb), w, h, soft), M = new Float32Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, gi = (y + y0) * W + x + x0;
      M[i] = clamp01((Mb[i] - 0.5 + (hgt[gi] - 0.5) * rough + wick * fib[gi] * smooth(0.03, 0.35, Mb[i])) * sharp + 0.5);
    }
    const B = blur(M, w, h, edgeR);
    // 整块共用的水流：大块斑驳 + 往下沉 + 水渍花 + 外沿水线 + 少量沉淀
    const ox = rand() * 1000, oy = rand() * 1000, Fl = new Float32Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (M[i] <= 0.002) continue;
      const gx = x + x0, gy = y + y0;
      let f = 1 + mottle * 2 * fbm(gx / ms + ox, gy / ms + oy, 3) + pool * (y / h - 0.5) * 2;
      for (const b of blooms) {
        const r = Math.hypot(gx - b.x, gy - b.y) / b.r + 0.25 * fbm(gx / 16 + b.x, gy / 16 + b.y, 3);
        if (r < 1.2) {
          if (r < 1) f *= 1 - b.s * (1 - 0.5 * smooth(0.4, 1, r));
          f += (b.ring ?? 0.5) * Math.exp(-(((r - 1) / 0.03) ** 2));
        }
      }
      Fl[i] = Math.max(0, f) * (1 + edge * Math.max(0, M[i] - B[i]) * 2) * Math.max(0, 1 + gran * (0.5 - hgt[gy * W + gx]) * 2);
    }
    for (const L of layers) {
      let A = null;
      if (L.draw) { A = crop(alphaOf(L.draw), bb); if (L.blur) A = blur(A, w, h, L.blur); }
      const k = L.color.map(c => -Math.log(Math.max(0.03, c / 255)));
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, m = M[i];
        if (m <= 0.002) continue;
        const a = A ? A[i] : 1;
        if (a <= 0.002) continue;
        const gx = x + x0, gy = y + y0, gi = gy * W + gx;
        const d = L.density * m * a * Fl[i] * (L.grad ? L.grad(gx, gy) : 1);
        ar[gi] += d * k[0]; ag[gi] += d * k[1]; ab[gi] += d * k[2];
      }
    }
  };

  // 钢笔/墨线/印字：边更利，几乎不晕
  WC.ink = (draw, o = {}) => WC.wash(draw, { rough: 0.12, soft: 0.6, sharp: 2.2, edge: 0.15, edgeR: 1.5, mottle: 0.12, gran: 0.2, density: 1.1, ...o });

  WC.finish = (canvas, o = {}) => {
    const ctx = canvas.getContext('2d'), img = ctx.createImageData(W, H), d = img.data, S = o.relief ?? 0.45;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const xl = x > 0 ? i - 1 : i, xr = x < W - 1 ? i + 1 : i, yu = y > 0 ? i - W : i, yd = y < H - 1 ? i + W : i;
      const sh = 1 + S * ((hgt[xr] - hgt[xl]) + (hgt[yd] - hgt[yu])); // 光从左上来
      d[i * 4] = pr[i] * Math.exp(-ar[i]) * sh;
      d[i * 4 + 1] = pg[i] * Math.exp(-ag[i]) * sh;
      d[i * 4 + 2] = pb[i] * Math.exp(-ab[i]) * sh;
      d[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };

  window.WC = WC;
})();
