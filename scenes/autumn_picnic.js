// 《Picnic Day》— 整页手帐示例：秋天去郊外野餐的一个下午。
// 主角是右下角一大块直接画在纸上的格子野餐毯（没裁切边，出血出页面），篮子、保温壶、搪瓷杯、果酱罐、苹果、落叶当贴纸散在毯子上；
// 左上一片压平的大银杏用和纸胶带按在纸上，票根塞在牛皮纸清单底下；右边中间留一块白，只飘两片叶子。
// 色系：砖红格子 + 焦糖藤编 + 芥末黄银杏 + 一点橄榄绿。
window.SCENES = window.SCENES || {};
window.SCENES.autumn_picnic = async (J, WC) => {
  const kit = WJ.kit(J, WC);
  const { R, ctx, tf, fillP, fillAll, paint, pen, cut, later, strokePoly } = kit;
  await document.fonts.load('30px "HanziPen SC"', '郊外野餐清单格子毯三明治一壶热红茶回程别睡着叶子掉进茶里了捡的什么都没做晒了一下午太阳最后');
  const HAN = s => `${s}px "HanziPen SC"`, SUN = s => `${s}px Sunrise, "HanziPen SC"`;
  const INK = JP.INK, NOTE = JP.NOTE;
  const place = (x, y, s = 1, rot = 0) => pts => tf(pts, { x, y, s, rot });
  const shade = (T, x, y, rx, ry, blur, color, density) => ({ draw: fillP(T(J.ellipse(x, y, rx, ry))), blur, color, density });
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const inside = ([x, y], poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };

  const RUST = [204, 104, 78], RUST_L = [226, 150, 120], WICKER = [214, 166, 104], WICKER_D = [150, 100, 60];
  const MUSTARD = [234, 182, 70], OLIVE = [134, 150, 100], OLIVE_D = [92, 106, 72], CREAM = [246, 236, 214];
  const STK = [];      // 毯子上所有贴纸的外形：毯子最后画、把它们留出来
  const SHADOWS = [];  // 贴纸落在毯子上的影子：做成毯子里的一层

  // 小图案（落叶、胶带上、章里都用）
  const MAPLE = [[0, -44], [7, -27], [19, -32], [15, -14], [35, -21], [29, -6], [41, 2], [23, 8], [26, 19], [7, 13], [3, 26], [-3, 26], [-7, 13], [-26, 19], [-23, 8], [-41, 2], [-29, -6], [-35, -21], [-15, -14], [-19, -32], [-7, -27]];
  const GINKGO = (() => {
    const L = J.arc(0, 14, 44, 40, -Math.PI * 0.88, -Math.PI * 0.54, 10).map(([x, y], i) => [x, y + Math.sin(i * 1.7) * 1.2]);
    const Rr = J.arc(0, 14, 44, 40, -Math.PI * 0.46, -Math.PI * 0.12, 10).map(([x, y], i) => [x, y + Math.sin(i * 1.3) * 1.2]);
    return [[0, 12], [-8, 6], ...L, [0, -14], ...Rr, [8, 6]];
  })();

  // ── 一片落叶贴纸：maple / ginkgo；onBlanket 的进 STK
  const leaf = (kind, x, y, s, rot, onBlanket, opt = {}) => {
    const T = place(x, y, s, rot);
    if (kind === 'maple') {
      const sh = T(MAPLE);
      const base = opt.color ?? RUST;
      paint(sh, [
        { color: base, density: 0.52 },
        { draw: fillP(T(J.ellipse(0, -30, 26, 18))), blur: 12, color: MUSTARD, density: 0.35 },
        { draw: fillP(T(J.ellipse(12, 10, 22, 16))), blur: 10, color: [160, 70, 50], density: 0.25 },
      ], { edge: 0.8 });
      for (const [ex, ey] of [[0, -38], [30, -18], [-30, -18], [20, 14], [-20, 14]]) pen(T([[0, 18], [ex * 0.8, ey * 0.8]]), { ink: 'rgba(140,60,40,0.5)', lw: 1.2, wob: 0.2 });
      pen(T([[0, 22], [2, 36], [6, 46]]), { smooth: true, ink: 'rgba(120,64,40,0.85)', lw: 2.2, wob: 0.2 });
      cut(sh, { lw: 3, dmin: 8, dmax: 22, wave: 12, amp: 1.6 });
      if (onBlanket) { STK.push(sh); SHADOWS.push([x + 6, y + 10, 34 * s, 22 * s]); }
    } else {
      const sh = T(GINKGO);
      paint(sh, [
        { color: opt.color ?? MUSTARD, density: 0.5 },
        { draw: fillP(T(J.ellipse(0, 8, 14, 12))), blur: 8, color: [180, 160, 70], density: 0.3 },
        { draw: fillP(T(J.ellipse(-24, -12, 20, 14))), blur: 12, color: [226, 140, 60], density: 0.2 },
      ], { edge: 0.8 });
      for (const a of [-2.5, -2.1, -1.75, -1.4, -1.05, -0.7]) pen(T([[0, 10], [Math.cos(a) * 32, 14 + Math.sin(a) * 32]]), { ink: 'rgba(150,110,40,0.4)', lw: 1, wob: 0.2 });
      pen(T([[0, 10], [-1, 26], [2, 40]]), { smooth: true, ink: 'rgba(130,100,50,0.85)', lw: 2, wob: 0.2 });
      cut(sh, { lw: 3, dmin: 8, dmax: 24, wave: 12, amp: 1.6 });
      if (onBlanket) { STK.push(sh); SHADOWS.push([x + 6, y + 10, 34 * s, 22 * s]); }
    }
  };

  // ── 票根：郊区线来回票，塞在清单底下（清单是 finish 之后画的纸，会盖住它）
  JP.ticket(J, kit, { x: 182, y: 712, rot: -0.2, title: 'MAPLE HILL', titleSize: 19, lines: ['SUBURB LINE · 13:40', 'RETURN · ADULT ×2'], number: 'No.1011', stub: [214, 150, 96], paper: [248, 238, 218], ink: '#6a3a2c', stringInk: 'rgba(190,96,70,0.8)' });

  // ── 篮子（主角）
  const BK = { x: 770, y: 978, s: 1.28, rot: -0.04 };
  const T = pts => tf(pts, BK);
  {
    const opening = T(J.ellipse(0, -8, 114, 24, 0, 80));
    const body = T([
      [114, -8], [111, 20], [106, 50], [101, 80],
      ...J.arc(80, 90, 20, 18, -0.15, Math.PI / 2, 6),
      ...J.arc(-80, 90, 20, 18, Math.PI / 2, Math.PI + 0.15, 6),
      [-101, 80], [-106, 50], [-111, 20], [-114, -8],
      ...J.arc(0, -8, 114, 24, Math.PI, 0, 44).slice(1, -1),
    ]);
    const napkin = T(J.catmull([[-98, -12], [-66, -26], [-30, -24], [-14, -10], [-20, 14], [-30, 38], [-44, 58], [-58, 48], [-70, 30], [-86, 20], [-100, 6]], true, 3));
    const baguette = T(strokePoly([[22, -2], [52, -40], [86, -80], [118, -116]], p => 17 - Math.max(0, p[1] + 90) * 0.0));
    const handle = T(strokePoly(J.arc(0, -10, 106, 122, Math.PI, Math.PI * 2, 40), 6.5));
    const straps = [-1, 1].map(sd => T(rect(sd * 48 - 7, 10, sd * 48 + 7, 58)));
    const shine = T(J.ellipse(-60, 50, 6, 26, 0.1));

    paint(handle, [
      { color: WICKER, density: 0.55 },
      { draw: fillP(T(rect(-120, -60, 120, 0))), blur: 14, color: WICKER_D, density: 0.25 },
    ], { reserve: fillAll([baguette, body]) });
    paint(opening, [
      { color: WICKER, density: 0.5 },
      { draw: fillP(T(J.ellipse(0, -4, 98, 15))), blur: 5, color: [96, 62, 40], density: 0.65 },
    ], { reserve: fillAll([body, napkin, baguette]) });
    paint(baguette, [
      { color: [226, 176, 104], density: 0.55 },
      { draw: fillP(T(strokePoly([[30, 8], [60, -30], [94, -70], [126, -106]], 9))), blur: 6, color: [170, 104, 54], density: 0.4 },
    ], { reserve: c => { fillP(body)(c); for (const [bx, by] of [[44, -32], [70, -64], [96, -94]]) fillP(T(tf(rect(-9, -2.5, 9, 2.5), { x: bx, y: by, rot: -0.35 })))(c); } });
    paint(body, [
      { color: WICKER, density: 0.55 },
      shade(T, 60, 60, 60, 70, 18, WICKER_D, 0.35),
      { draw: fillP(T(rect(-130, 86, 130, 120))), blur: 10, color: WICKER_D, density: 0.25 },
    ], { reserve: fillAll([napkin, ...straps, shine]) });
    // 搭在篮口的格子餐巾
    const NB = pts => tf(pts, { ...BK, rot: BK.rot + 0.45 });
    const checks = dir => c => { for (let k = -14; k <= 14; k++) { J.path(c, NB(dir ? rect(k * 14 - 3.5 - 60, -120, k * 14 + 3.5 - 60, 120) : rect(-260, k * 14 - 3.5, 140, k * 14 + 3.5))); c.fill(); } };
    paint(napkin, [
      { color: CREAM, density: 0.2 },
      { draw: checks(0), blur: 1.2, color: RUST_L, density: 0.3 },
      { draw: checks(1), blur: 1.2, color: RUST_L, density: 0.3 },
      shade(T, -40, 40, 24, 22, 10, [170, 110, 90], 0.25),
    ], { edge: 0.5 });
    straps.forEach(sp => paint(sp, [{ color: [146, 88, 62], density: 0.6 }], { edge: 0.5 }));

    // 藤编纹：一排排交错的小弧（像编进去的藤条），不画成方格
    const blocked = p => inside(p, napkin) || straps.some(sp => inside(p, sp));
    for (let ri = 0; ri < 7; ri++) {
      const ry = 24 + ri * 12.5;
      for (let x = -106 + (ri % 2) * 9; x < 100; x += 18) {
        const cy = ry + 5 * (1 - (x / 110) ** 2) - 3, q = T([[x, cy], [x + 7, cy + 3.2], [x + 14, cy]]);
        if (q.some(blocked) || Math.abs(x + 7) > 100 - ri * 1.5) continue;
        pen(q, { smooth: true, ink: `rgba(120,78,46,${R(0.32, 0.5)})`, lw: 1.2, wob: 0.15 });
      }
    }
    // 篮口那圈：斜斜的绞绳
    for (let a = Math.PI - 0.06; a > 0.06; a -= 0.075) {
      const x = Math.cos(a) * 114, y = -8 + Math.sin(a) * 24, q = T([[x - 2, y - 3], [x + 3, y + 4]]);
      if (blocked(q[0])) continue;
      pen(q, { ink: 'rgba(120,78,46,0.5)', lw: 1.3, wob: 0.1 });
    }
    // 皮带扣
    for (const sd of [-1, 1]) pen(T(rect(sd * 48 - 9, 30, sd * 48 + 9, 42)).concat(T([[sd * 48 - 9, 30]])), { ink: 'rgba(196,160,90,0.95)', lw: 1.8, wob: 0.2 });
    // 法棍上的割口
    for (const [bx, by] of [[44, -32], [70, -64], [96, -94]]) pen(T(tf([[-10, 3], [0, 4], [10, 2]], { x: bx, y: by, rot: -0.35 })), { smooth: true, ink: 'rgba(150,90,50,0.55)', lw: 1.3 });

    cut(body, { exclude: [opening] });
    cut(opening, { exclude: [body, baguette, handle] });
    cut(handle, { exclude: [opening, baguette, body], lw: 3.4 });
    cut(baguette, { exclude: [opening, body, handle] });
    STK.push(body, opening, handle, baguette);
    SHADOWS.push([BK.x + 20, BK.y + 112 * BK.s, 150, 24]);
  }

  // ── 保温壶：橄榄绿，盖子是个杯子
  {
    const S = place(560, 1072, 1.0, 0.07);
    const body = S([[-26, -94], [26, -94], [33, -86], [36, -72], [36, 90], ...J.arc(24, 92, 12, 12, 0, Math.PI / 2, 6), ...J.arc(-24, 92, 12, 12, Math.PI / 2, Math.PI, 6), [-36, -72], [-33, -86]]);
    const cap = S([[-29, -92], [-28, -118], ...J.arc(-20, -118, 8, 8, Math.PI, Math.PI * 1.5, 5), ...J.arc(20, -118, 8, 8, Math.PI * 1.5, Math.PI * 2, 5), [28, -118], [29, -92]]);
    const hl = S(rect(-25, -70, -17, 84));
    paint(body, [
      { color: OLIVE, density: 0.55 },
      { draw: fillP(S(rect(12, -100, 50, 120))), blur: 12, color: OLIVE_D, density: 0.35 },
      { draw: fillP(S(rect(-50, 70, 50, 120))), blur: 10, color: OLIVE_D, density: 0.2 },
    ], { reserve: fillAll([cap, hl]) });
    paint(cap, [
      { color: [196, 190, 178], density: 0.32 },
      { draw: fillP(S(rect(10, -130, 40, -88))), blur: 8, color: [130, 128, 120], density: 0.3 },
    ], { reserve: fillP(S(rect(-20, -112, -14, -96))) });
    pen(S([[-36, -64], [36, -64]]), { ink: 'rgba(60,70,46,0.45)', lw: 1.2 });
    pen(S([[-36, 70], [36, 70]]), { ink: 'rgba(60,70,46,0.45)', lw: 1.2 });
    cut(body, { exclude: [cap] }); cut(cap, { exclude: [body], lw: 3.4 });
    STK.push(body, cap); SHADOWS.push([566, 1180, 54, 12]);
  }

  // ── 搪瓷杯：奶白杯身、砖红杯口，茶里漂着一片银杏
  const CUP = { x: 650, y: 1262 };
  {
    const C = place(CUP.x, CUP.y, 1.0, -0.04);
    const body = C([[-40, -34], ...J.arc(0, -34, 40, 11, Math.PI, 0, 30).slice(1, -1), [40, -34], [37, 30], ...J.arc(25, 32, 12, 10, 0, Math.PI / 2, 5), ...J.arc(-25, 32, 12, 10, Math.PI / 2, Math.PI, 5), [-37, 30]]);
    const tea = C(J.ellipse(0, -33, 36, 10, 0, 40));
    const hO = C(J.ellipse(48, -2, 19, 21, 0, 40)), hI = C(J.ellipse(48, -2, 9, 11, 0, 30));
    const floatLeaf = C(tf(GINKGO, { x: -4, y: -33, s: 0.5, rot: 0.75 }).map(([x, y]) => [x, -33 + (y + 33) * 0.5]));
    const rimO = C(J.ellipse(0, -34, 40, 11, 0, 60));
    kit.wet(c => { J.path(c, hO); J.path(c, hI); c.fill('evenodd'); }, [{ color: [244, 238, 228], density: 0.18 }, { color: [150, 150, 160], density: 0.15 }], { reserve: fillP(body) });
    paint(body, [
      { color: [246, 240, 230], density: 0.14 },
      { draw: fillP(C(rect(14, -40, 50, 50))), blur: 12, color: [150, 150, 162], density: 0.28 },
      { draw: fillP(C(rect(-50, 22, 50, 50))), blur: 8, color: [150, 150, 162], density: 0.18 },
    ], { reserve: fillP(tea) });
    paint(tea, [{ color: [170, 92, 48], density: 0.72 }, { draw: fillP(C(J.ellipse(-16, -38, 22, 5))), blur: 4, color: [110, 60, 30], density: 0.35 }], { reserve: fillP(floatLeaf), edge: 0.6 });
    paint(floatLeaf, [{ color: [244, 204, 80], density: 0.5 }], { edge: 0.6 });
    pen(C([[-4, -31], [2, -27], [8, -25]]), { smooth: true, ink: 'rgba(150,110,40,0.8)', lw: 1.2, wob: 0.1 });
    later(() => {
      const top = C(J.ellipse(0, -34, 40, 11, 0, 60));
      J.line(ctx, [...top, top[0]], { ink: 'rgba(186,92,66,0.9)', lw: 3, wob: 0.3 });
      J.line(ctx, C([[-37, 30], [-20, 41], [20, 41], [37, 30]]), { smooth: true, ink: 'rgba(186,92,66,0.75)', lw: 2.4, wob: 0.3 });
    });
    for (const x0 of [-14, 6, 24]) pen(C([[x0, -52], [x0 - 6, -66], [x0 + 4, -80], [x0 - 3, -94]]), { smooth: true, ink: 'rgba(150,130,118,0.6)', lw: 1.7 });
    cut(body, { exclude: [hO, rimO] }); cut(rimO, { exclude: [body, hO] }); cut(hO, { exclude: [body, rimO], lw: 3.2 }); cut(hI, { exclude: [body], lw: 2.4, dmin: 6, dmax: 16 });
    STK.push(body, hO); SHADOWS.push([CUP.x + 8, CUP.y + 42, 52, 11]);
  }

  // ── 果酱罐：格子布盖、麻绳、小标签
  const JAR = { x: 868, y: 1250 };
  {
    const Jr = place(JAR.x, JAR.y, 1.05, 0.06);
    const glass = Jr([[-34, -30], [34, -30], [36, -20], [36, 42], ...J.arc(26, 44, 10, 10, 0, Math.PI / 2, 5), ...J.arc(-26, 44, 10, 10, Math.PI / 2, Math.PI, 5), [-36, 42], [-36, -20]]);
    const jam = Jr([[-31, -14], [31, -14], [31, 42], [-31, 42]]);
    const cloth = Jr(J.catmull([[-28, -58], [0, -62], [28, -58], [36, -40], [46, -24], [34, -20], [24, -26], [12, -18], [0, -24], [-12, -18], [-24, -26], [-34, -20], [-46, -24], [-36, -40]], true, 2.5));
    const label = Jr(rect(-22, 2, 22, 26));
    paint(glass, [
      { color: [230, 232, 230], density: 0.1 },
      { draw: fillP(jam), blur: 2.5, color: [222, 136, 56], density: 0.62 },
      { draw: fillP(Jr(rect(10, -20, 40, 50))), blur: 8, color: [140, 80, 40], density: 0.25 },
    ], { reserve: fillAll([cloth, label, Jr(rect(-28, -8, -22, 36))]) });
    const CB = pts => tf(pts, { x: JAR.x, y: JAR.y, rot: 0.06 + 0.5 });
    const cks = dir => c => { for (let k = -10; k <= 10; k++) { J.path(c, CB(dir ? rect(k * 11 - 3, -120, k * 11 + 3, 120) : rect(-120, k * 11 - 3, 120, k * 11 + 3))); c.fill(); } };
    paint(cloth, [{ color: CREAM, density: 0.2 }, { draw: cks(0), blur: 1, color: OLIVE, density: 0.3 }, { draw: cks(1), blur: 1, color: OLIVE, density: 0.3 }], { edge: 0.6 });
    paint(label, [{ color: CREAM, density: 0.18 }], { edge: 0.4 });
    pen(Jr([[-36, -28], [-12, -25], [12, -25], [36, -28]]), { smooth: true, ink: 'rgba(150,110,70,0.9)', lw: 2.2 });
    pen(Jr([[-4, -26], [-14, -16], [-10, -10]]), { smooth: true, ink: 'rgba(150,110,70,0.9)', lw: 1.8 });
    pen(Jr([[4, -26], [12, -14], [18, -12]]), { smooth: true, ink: 'rgba(150,110,70,0.9)', lw: 1.8 });
    later(() => J.text(ctx, 'jam', ...Jr([[-15, 20]])[0], { font: SUN(19), color: '#8a4a3a', rot: 0.06, jr: 0.02 }));
    cut(glass, { exclude: [cloth] }); cut(cloth, { exclude: [glass] });
    STK.push(glass, cloth); SHADOWS.push([JAR.x + 8, JAR.y + 50, 50, 11]);
  }

  // ── 苹果
  {
    const A = place(985, 1088, 1.0, 0.1);
    const apple = A(J.catmull([[0, -28], [18, -38], [36, -28], [42, -4], [36, 22], [18, 38], [0, 34], [-18, 38], [-36, 22], [-42, -4], [-36, -28], [-18, -38]], true, 3));
    const lf = A(J.catmull([[2, -40], [14, -54], [32, -58], [24, -46], [10, -40]], true, 2));
    paint(apple, [
      { color: [226, 150, 90], density: 0.5 },
      { draw: fillP(A(J.ellipse(14, 8, 34, 32))), blur: 18, color: [190, 60, 50], density: 0.5 },
      { draw: fillP(A(J.ellipse(18, 22, 24, 16))), blur: 12, color: [140, 50, 44], density: 0.25 },
    ], { reserve: fillAll([lf, A(J.ellipse(-20, -12, 5, 11, 0.3))]) });
    paint(lf, [{ color: OLIVE, density: 0.6 }], { edge: 0.5 });
    pen(A([[0, -28], [2, -40], [6, -48]]), { smooth: true, ink: 'rgba(100,70,50,0.9)', lw: 2.4 });
    cut(apple, { exclude: [lf] }); cut(lf, { exclude: [apple], lw: 2.6, dmin: 6, dmax: 14 });
    STK.push(apple, lf); SHADOWS.push([992, 1128, 44, 10]);
  }

  // ── 压平的大银杏：这一页自己发明的东西，用和纸胶带按住叶柄
  leaf('ginkgo', 292, 336, 3.1, -0.35, false, { color: [240, 190, 74] });
  leaf('maple', 122, 478, 1.25, 0.5, false, { color: [214, 120, 70] });

  // ── 落叶：毯子上两片，页面上飘三片
  leaf('ginkgo', 760, 1370, 1.0, -0.5, true);
  leaf('maple', 1010, 1300, 0.95, 0.4, true);
  leaf('maple', 470, 1110, 0.8, -0.3, true, { color: [214, 120, 70] });
  leaf('maple', 980, 470, 1.05, 0.5, false);
  leaf('ginkgo', 692, 604, 1.3, 0.75, false);

  // ── 格子野餐毯：直接画在纸上，没有裁切边，右下角出血出页面
  const BL = { x: 812, y: 1112, rot: -0.3 }, half = 320;
  const BT = pts => tf(pts, BL);
  const blanket = BT(J.wobble([[-half, -half], [half, -half], [half, half], [-half, half]], 3, 60));
  const bandH = c => { for (let k = -12; k <= 12; k++) { J.path(c, BT(rect(-500, k * 64 - 16, 500, k * 64 + 16))); c.fill(); } };
  const bandV = c => { for (let k = -12; k <= 12; k++) { J.path(c, BT(rect(k * 64 - 16, -500, k * 64 + 16, 500))); c.fill(); } };
  const thin = c => { for (let k = -12; k <= 12; k++) { J.path(c, BT(rect(-500, k * 64 + 30, 500, k * 64 + 33))); c.fill(); J.path(c, BT(rect(k * 64 + 30, -500, k * 64 + 33, 500))); c.fill(); } };
  kit.wet(fillP(blanket), [
    { color: [248, 238, 222], density: 0.16 },
    { draw: bandH, blur: 2.2, color: RUST, density: 0.22 },
    { draw: bandV, blur: 2.2, color: RUST, density: 0.22 },
    { draw: thin, blur: 1, color: [180, 120, 70], density: 0.12 },
    ...SHADOWS.map(([x, y, rx, ry]) => ({ draw: fillP(J.ellipse(x, y, rx, ry)), blur: 14, color: [120, 70, 50], density: 0.32 })),
    { draw: fillP(BT(rect(-half - 40, half * 0.2, half + 40, half + 40))), blur: 60, color: [170, 100, 70], density: 0.12 },
  ], { reserve: fillAll(STK), edge: 1.0, mottle: 0.28, mottleScale: 70, wick: 0.3, pool: 0.1 });
  // 毯边一圈缝线
  pen(BT([[-half + 16, half + 60], [-half + 16, -half + 16], [half + 60, -half + 16]]), { ink: 'rgba(150,70,50,0.45)', lw: 1.4, dash: [6, 6], wob: 0.3 });

  kit.finish(0.13);

  // ════ 干了以后：纸、胶带、字 ════
  // 标题
  JP.title(J, 'Picnic Day', 600, 214, { size: 96, sub: '郊外野餐  10.11 Sun.', subFont: '40px Sunrise, "HanziPen SC"', rot: -0.055, tapeRot: 0.035, tapeColor: '#f2cf8f', tapeKind: 'stripes', tapeLen: 360, lineColor: 'rgba(196,110,80,0.75)' });

  // 和纸胶带：斜着按住大银杏的叶柄，上面排银杏/枫叶/橡果
  const motifs = [
    tc => { tc.fillStyle = '#e2a94a'; J.path(tc, tf(GINKGO, { s: 0.3 })); tc.fill(); tc.strokeStyle = '#b48838'; tc.lineWidth = 1; tc.beginPath(); tc.moveTo(0, 4); tc.lineTo(0, 12); tc.stroke(); },
    tc => { tc.fillStyle = '#d98060'; J.path(tc, tf(MAPLE, { s: 0.28 })); tc.fill(); },
    tc => { tc.fillStyle = '#c8925c'; tc.beginPath(); tc.ellipse(0, 3, 6, 8, 0, 0, 7); tc.fill(); tc.fillStyle = '#8a6040'; tc.beginPath(); tc.ellipse(0, -3, 8, 4.5, 0, Math.PI, 0); tc.fill(); tc.fillRect(-0.8, -10, 1.6, 4); },
  ];
  J.washi(340, 446, 220, 64, 0.62, { color: '#efe0bf', pattern: (tc, len, wid) => JP.washiRow(tc, len, wid, motifs, { step: 54, scale: 1.2, start: 30, dotColor: 'rgba(206,120,90,0.7)' }) });

  // 牛皮纸清单：压住票根和毯子一角
  JP.card(J, { x: 280, y: 884, w: 372, h: 262, rot: 0.045, paper: 'kraft', title: 'picnic list', todos: [['格子毯', true], ['三明治 ×2', true], ['一壶热红茶', true], ['回程别睡着', false]], tape: 'top', tapeColor: '#e9a58c', tapeKind: 'dots' });

  // 正文：左下一段英文
  JP.para(J, "Last stop, then a long walk to the big ginkgo. Tea from the thermos, crumbs on the checks, a leaf landing right in your cup. Nobody checked the time. The light went gold, then honey, then gone.", 64, 1100, 352, { color: INK });
  J.text(ctx, '什么都没做，晒了一下午太阳。', 70, 1404, { font: HAN(30), color: INK, rot: -0.02 });

  // 批注。毯子上的那句写在一小条白纸签上，不然格子上看不清
  const tag = (text, x, y, to, o = {}) => {
    ctx.save(); ctx.font = HAN(26); const tw = ctx.measureText(text).width; ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
    ctx.shadowColor = 'rgba(90,60,40,0.22)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#fffdf7'; ctx.beginPath(); ctx.rect(-12, -28, tw + 24, 40); ctx.fill(); ctx.restore();
    JP.note(J, text, x, y, to, { rot: o.rot ?? 0, bend: o.bend, from: o.from, color: INK });
  };
  tag('叶子掉进茶里了', 468, 1352, [616, 1236], { rot: -0.04, bend: -16, from: [560, 1318] });
  JP.note(J, '捡的！', 790, 650, [748, 626], { bend: -8, from: [798, 628] });
  // 页面上飘的叶子：身后一道虚线
  J.line(ctx, [[1046, 318], [1000, 352], [1030, 392], [1006, 420]], { smooth: true, ink: 'rgba(150,104,84,0.6)', lw: 1.5, dash: [4, 7] });
  J.line(ctx, [[600, 452], [650, 488], [622, 524], [648, 548]], { smooth: true, ink: 'rgba(150,104,84,0.6)', lw: 1.5, dash: [4, 7] });
  J.text(ctx, 'pressed, for later.', 210, 574, { font: SUN(34), color: INK, spacing: 1.2, jr: 0.03, rot: -0.04 });
  // 一个小标签 + 卷卷
  J.text(ctx, 'packed at 9am.', 566, 782, { font: SUN(36), color: INK, spacing: 1.2, jr: 0.03, rot: -0.05 });
  J.curl(812, 770, 1.8, 0.9);
  J.sparkle(ctx, 1030, 640, 10, { fill: '#f2cf8f' }); J.sparkle(ctx, 560, 470, 8, { fill: '#e9a58c' }); J.star(ctx, 1020, 120, 8, { fill: '#f2cf8f' });
};
// 落款（换成你自己的名字）：右上角一行花体
window.SCENES.autumn_picnic.sign = { name: 'Cedar', tail: ' · 10.11', x: 812, y: 88, size: 40, color: '#3a2f31', rot: -0.04 };
