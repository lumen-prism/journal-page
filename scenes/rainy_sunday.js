// 《Rainy Sunday》— 整页手帐示例：标题压在纸胶带上，六张水彩贴纸有大有小、歪着放，
// 一条宽和纸胶带横贯整页，一张横线待办卡斜压在胶带上，右下一段草草的英文，几处带箭头的批注，零碎的雨滴和云。
// 贴纸本身照 watercolor-journal 的下雨天那页画；这里只管怎么把它们排成一整页。
window.SCENES = window.SCENES || {};
window.SCENES.rainy_sunday = async (J, WC) => {
  const kit = WJ.kit(J, WC);
  const { R, ctx, at, tf, fillP, fillAll, paint, wet, pen, cut, later } = kit;
  const K = 1.2;
  const SLATE = [126, 148, 182], STORM = [86, 102, 140], MUSTARD = [232, 190, 100], OCHRE = [184, 130, 62],
    ROSE = [224, 166, 160], ROSE_D = [182, 108, 110], CREAM = [242, 234, 218], OAT = [234, 222, 200], RAIN = [168, 192, 216];
  const shade = (T, x, y, rx, ry, blur = 14, color = [118, 132, 168], density = 0.42) => ({ draw: fillP(T(J.ellipse(x, y, rx, ry))), blur, color, density });
  const put = (x, y, s = 1, rot = 0) => pts => tf(pts, { x, y, s, rot });   // 放到页上：位置、大小、歪多少
  // 一条粗线 → 闭合外形（两边各让 hw，两头圆），给 paint/cut 用；hw 可以是 p => 半宽
  const strokePoly = (pts, hw) => {
    const n = pts.length, H = typeof hw === 'function' ? hw : () => hw, L = [], Rt = [], tan = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
      tan.push([tx / l, ty / l]);
      const h = H(pts[i]);
      L.push([pts[i][0] - ty / l * h, pts[i][1] + tx / l * h]); Rt.push([pts[i][0] + ty / l * h, pts[i][1] - tx / l * h]);
    }
    const cap = (p, [tx, ty], h, sg) => Array.from({ length: 5 }, (_, k) => { const th = Math.PI * (k + 1) / 6; return [p[0] + sg * (-ty * Math.cos(th) + tx * Math.sin(th)) * h, p[1] + sg * (tx * Math.cos(th) + ty * Math.sin(th)) * h]; });
    return [...L, ...cap(pts[n - 1], tan[n - 1], H(pts[n - 1]), 1), ...Rt.reverse(), ...cap(pts[0], tan[0], H(pts[0]), -1)];
  };
  // 折线上按 x 取 y
  const yAt = (curve, x) => {
    for (let i = 1; i < curve.length; i++) { const [x0, y0] = curve[i - 1], [x1, y1] = curve[i]; if (x0 !== x1 && (x - x0) * (x - x1) <= 0) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
    return curve[0][1];
  };

  // ── 还在滴水的伞：灰蓝伞面，伞片深浅交替，木头弯把
  {
    const T = put(800, 330, 1.45, 0.14);
    const tips = [-112, -68, -23, 23, 68, 112];
    const rib = x => Array.from({ length: 17 }, (_, i) => { const t = i / 16 * Math.PI / 2; return [x * Math.sin(t), -6 - 92 * Math.cos(t)]; });
    const scallop = (xa, xb) => J.arc((xa + xb) / 2, -6, (xb - xa) / 2, 10, 0, -Math.PI, 12); // 从 xb 往上拱到 xa
    const bottom = []; for (let k = tips.length - 1; k >= 1; k--) bottom.push(...scallop(tips[k - 1], tips[k]).slice(1));
    const left = rib(-112).reverse(), right = rib(112).slice(1), under = bottom.slice(0, -1);
    const canopy = T([...left, ...right, ...under]);
    const canopyCut = T([...left, [-3.4, -98], [-1.2, -118], [0, -122], [1.2, -118], [3.4, -98], ...right, ...under]);
    const panel = k => T([...rib(tips[k]), ...scallop(tips[k], tips[k + 1]).reverse().slice(1, -1), ...rib(tips[k + 1]).reverse()]);
    const tipC = T([[-3.2, -94], [-1.2, -118], [0, -122], [1.2, -118], [3.2, -94]]);
    // 直线段 + 弯钩直接按 2px 一点铺，不走 catmull（长短段混着会过冲打结）
    const line = (y0, y1) => Array.from({ length: Math.ceil((y1 - y0) / 2) + 1 }, (_, i) => [0, Math.min(y1, y0 + i * 2)]);
    const bend = [...J.arc(-17, 92, 17, 17, 0, Math.PI, 28).slice(1), [-34, 88], [-34, 84]];
    const shaftC = line(-20, 66), handleC = [...line(60, 92), ...bend], stickC = [...line(-20, 92), ...bend];
    const stick = T(strokePoly(stickC, p => p[1] < 56 || p[0] > 1 && p[1] < 60 ? 2.4 : p[1] < 66 && p[0] > -1 ? 2.4 + (p[1] - 56) * 0.38 : 6.2));
    const shaft = T(strokePoly(shaftC, 2.4)), handle = T(strokePoly(handleC, 6.2));
    const drop = (x, y, s) => T(J.catmull([[0, -9], [3.6, -2], [5, 3.5], [0, 8], [-5, 3.5], [-3.6, -2]].map(([a, b]) => [x + a * s, y + b * s]), true, 1.5));
    const drops = [drop(-112, 22, 1.2), drop(68, 30, 1.3), drop(112, 56, 1.05), drop(-68, 50, 0.95)];

    paint(shaft, [{ color: [140, 142, 152], density: 0.55 }], { reserve: fillAll([canopy, handle]), edge: 0.4 });
    paint(handle, [{ color: [204, 150, 92], density: 0.6 }, shade(T, -14, 106, 16, 10, 4, [150, 98, 56], 0.4)], { edge: 0.5 });
    paint(canopy, [
      { color: SLATE, density: 0.5 },
      { draw: fillAll([panel(1), panel(3)]), blur: 2, color: STORM, density: 0.28 },
      shade(T, 64, -26, 54, 48, 16, [70, 86, 130], 0.32),
    ], { reserve: fillAll([T(J.ellipse(-58, -60, 6, 24, 0.62)), tipC]) });
    paint(tipC, [{ color: [130, 132, 144], density: 0.6 }], { edge: 0.4 });
    drops.forEach(d => paint(d, [{ color: RAIN, density: 0.6 }], { edge: 0.8 }));
    for (const x of [-68, -23, 23, 68]) pen(T(rib(x)), { ink: 'rgba(60,70,104,0.32)', lw: 1.2 });
    later(() => tips.forEach(x => J.dot(ctx, ...T([[x, -6]])[0], 2.4, 'rgba(60,64,80,0.85)')));
    cut(canopyCut); cut(stick, { exclude: [canopy], lw: 3, dmin: 8, dmax: 22 });
  }

  // ── 伯爵茶：奶油白马克杯两道灰蓝条纹，茶包的线挂在外面，吊牌芥末黄
  {
    const T = put(864, 902, 1.05, 0.1);
    const body = T([...J.catmull([[-56, -58], [-55, 0], [-52, 54], [-40, 70], [40, 70], [52, 54], [55, 0], [56, -58]], false, 3), ...J.arc(0, -58, 56, 14, 0, -Math.PI, 30).slice(1, -1)]);
    const opening = T(J.ellipse(0, -58, 52, 11.5, 0, 56)), tea = T(J.ellipse(0, -55.5, 47, 8.5, 0, 56));
    const handleO = T(J.ellipse(72, 2, 26, 32)), handleI = T(J.ellipse(72, 2, 14, 20));
    const stripe = (y0, y1) => T([...Array.from({ length: 13 }, (_, i) => { const x = -60 + i * 10; return [x, y0 + 7 * (1 - (x / 56) ** 2)]; }), ...Array.from({ length: 13 }, (_, i) => { const x = 60 - i * 10; return [x, y1 + 7 * (1 - (x / 56) ** 2)]; })]);
    const tag = T(tf([[-11, -13], [11, -13], [11, 13], [-11, 13]], { x: -76, y: 26, rot: 0.12 }));
    wet(c => { J.path(c, handleO); J.path(c, handleI); c.fill('evenodd'); }, [{ color: CREAM, density: 0.32 }, shade(T, 84, 14, 20, 26, 6, [150, 160, 186], 0.4)], { reserve: fillP(body) });
    paint(body, [
      { color: CREAM, density: 0.3 },
      { draw: fillAll([stripe(6, 16), stripe(24, 30)]), blur: 1.2, color: SLATE, density: 0.55 },
      shade(T, 44, 20, 34, 56, 14, [150, 160, 186], 0.42),
    ], { reserve: c => { fillP(T(J.ellipse(-38, 4, 6, 30, 0.04)))(c); fillP(opening)(c); } });
    paint(opening, [{ color: [226, 220, 210], density: 0.3 }], { reserve: fillP(tea), edge: 0.4 });
    paint(tea, [{ color: [184, 120, 64], density: 0.62 }, shade(T, 26, -52, 30, 8, 5, [140, 84, 44], 0.35)], { reserve: fillP(T(J.ellipse(-24, -57, 9, 2, -0.05))) });
    paint(tag, [{ color: MUSTARD, density: 0.55 }], { edge: 0.6 });
    pen(T([[-18, -56], [-34, -66], [-50, -68], [-58, -60], [-66, -30], [-74, 0], [-76, 13]]), { smooth: true, ink: 'rgba(110,96,84,0.65)', lw: 1.2 });
    pen(T(Array.from({ length: 21 }, (_, i) => { const t = i / 20 * Math.PI * 2; return [-76 + 0.45 * 8 * Math.sin(t) ** 3, 28 - 0.45 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 2]; })), { ink: 'rgba(150,90,60,0.7)', lw: 1.2, wob: 0.1 });
    for (const x0 of [-18, 4, 26]) pen(T([[x0, -78], [x0 - 6, -94], [x0 + 4, -110], [x0 - 3, -126]]), { smooth: true, ink: 'rgba(150,140,140,0.55)', lw: 1.8 });
    cut(body); cut(handleO, { exclude: [body], lw: 3.6 }); cut(handleI, { exclude: [body], lw: 2.6, dmin: 8, dmax: 20 }); cut(tag, { lw: 2.6, dmin: 6, dmax: 14 });
  }

  // ── 热水袋：豆沙粉针织套，罗纹高领裹住瓶口，只露出灰蓝的盖子；套子上缝了一颗奶油色的心
  {
    const T = put(176, 964, 1.0, -0.12);
    const bodyL = J.catmull([[-30, -72], [0, -74], [30, -72], [52, -64], [66, -46], [72, -18], [73, 14], [73, 46], [71, 72], [62, 90], [40, 99], [0, 101], [-40, 99], [-62, 90], [-71, 72], [-73, 46], [-73, 14], [-72, -18], [-66, -46], [-52, -64]], true, 3);
    const body = T(bodyL);
    const collarL = J.catmull([[-25, -108], [-13, -111], [0, -108], [13, -111], [25, -108], [24, -96], [25, -84], [29, -74], [35, -66], [17, -63], [0, -62], [-17, -63], [-35, -66], [-29, -74], [-25, -84], [-24, -96]], true, 2);
    const collar = T(collarL);
    const cap = T(J.catmull([[-20, -131], [0, -133], [20, -131], [22, -122], [21, -110], [0, -108], [-21, -110], [-22, -122]], true, 2));
    const heartAt = s => Array.from({ length: 48 }, (_, i) => { const t = i / 48 * Math.PI * 2; return [s * 8 * Math.sin(t) ** 3, 26 - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 1.6]; });
    const heart = T(heartAt(1.9));
    const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
    const inner = bodyL.map(([x, y]) => [x * 0.84, y * 0.86 + 4]);
    paint(cap, [{ color: STORM, density: 0.5 }, shade(T, 14, -120, 14, 14, 5, [60, 72, 104], 0.35)], { reserve: fillAll([collar, T(J.ellipse(-14, -122, 2.5, 6))]) });
    paint(body, [
      { color: ROSE, density: 0.5 },
      { draw: fillP(T(J.ellipse(0, -66, 46, 12))), blur: 6, color: ROSE_D, density: 0.3 },
      shade(T, 40, 30, 40, 70, 16, ROSE_D, 0.38),
    ], { reserve: fillAll([heart, collar]) });
    paint(collar, [{ color: ROSE, density: 0.52 }, shade(T, 22, -80, 14, 26, 6, ROSE_D, 0.35)], { edge: 0.8 });
    paint(heart, [{ color: CREAM, density: 0.25 }, shade(T, 8, 32, 10, 10, 5, [190, 186, 196], 0.35)], { edge: 0.5 });
    const hs = T(heartAt(1.45)); pen([...hs, hs[0]], { ink: 'rgba(150,80,84,0.55)', lw: 1.2, wob: 0.15, dash: [3, 4] });
    for (let x = -16; x <= 16; x += 5.5) pen(T([[x, -129], [x, -112]]), { ink: 'rgba(40,50,80,0.35)', lw: 1.2, wob: 0.15 });
    // 高领罗纹：上窄下宽，跟着领口张开
    for (let u = -0.84; u <= 0.85; u += 0.168) pen(T([[u * 24, -106], [u * 24.5, -86], [u * 30, -66 - 3 * (1 - u * u)]]), { smooth: true, ink: 'rgba(140,72,78,0.5)', lw: 1.2, wob: 0.15 });
    // 套子上的针织纹：一列列小 v
    for (let y = -46; y <= 88; y += 12) for (let x = -60; x <= 60; x += 12) {
      if (Math.abs(x) < 26 && y > 0 && y < 54) continue;
      if (!inside([x, y], inner)) continue;
      pen(T([[x - 3, y - 3], [x, y + 2], [x + 3, y - 3]]), { ink: 'rgba(150,80,84,0.38)', lw: 1.2, wob: 0.15 });
    }
    cut(body, { exclude: [collar] }); cut(collar, { exclude: [body, cap], lw: 3.6 }); cut(cap, { exclude: [collar], lw: 3.4 });
  }

  // ── 看了一半的书：灰蓝布面，奶油色书页往书脊弯，豆沙粉丝带书签垂出来
  {
    const T = put(330, 488, 1.12, -0.07);
    const topL = J.catmull([[-132, -40], [-70, -56], [-18, -52], [0, -40]], false, 3);
    const topR = J.catmull([[0, -40], [18, -52], [70, -56], [132, -40]], false, 3);
    const botR = J.catmull([[134, 54], [70, 42], [18, 48], [0, 60]], false, 3);
    const botL = J.catmull([[0, 60], [-18, 48], [-70, 42], [-134, 54]], false, 3);
    const outlineL = [...topL, ...topR.slice(1), ...botR, ...botL.slice(1)];
    const pages = T(outlineL);
    const stack = T(outlineL.map(([x, y]) => [x * 1.01, y + 8]));
    const coverL = outlineL.map(([x, y]) => [x * 1.045, y + 14]);
    const cover = T(coverL);
    const coverB = [...botR, ...botL.slice(1)].map(([x, y]) => [x * 1.045, y + 14]);
    const whole = T([...topL, ...topR.slice(1), [138, -26], ...coverB, [-138, -26]]);
    const ribbon = T([[-3.5, -36], [3.5, -36], [4.5, 60], [9, 106], [3.5, 100], [-1, 109], [-3.5, 62]]);
    paint(cover, [{ color: SLATE, density: 0.6 }, shade(T, 60, 60, 80, 20, 10, STORM, 0.3)], { reserve: fillAll([stack, ribbon]) });
    paint(stack, [{ color: [236, 228, 212], density: 0.25 }], { reserve: fillAll([pages, ribbon]), edge: 0.4 });
    paint(pages, [
      { color: CREAM, density: 0.18 },
      shade(T, 0, 10, 16, 56, 10, [168, 158, 158], 0.35),
      shade(T, 120, 10, 14, 50, 12, [180, 176, 184], 0.2),
      shade(T, -120, 10, 14, 50, 12, [180, 176, 184], 0.2),
    ]);
    paint(ribbon, [{ color: ROSE, density: 0.6 }], { edge: 0.5 });
    pen(T([[0, -40], [0, 60]]), { ink: 'rgba(110,90,80,0.4)', lw: 1.2 });
    for (const dy of [3, 5.5]) pen(T([...botR, ...botL.slice(1)].map(([x, y]) => [x * 1.005, y + dy])), { ink: 'rgba(150,136,120,0.35)', lw: 1 });
    // 字行：跟着书页弯
    for (const side of [-1, 1]) {
      const top = side < 0 ? topL : topR, bot = side < 0 ? botL : botR;
      [0.14, 0.23, 0.32, 0.41, 0.5, 0.59, 0.68].forEach((f, li) => {
        const end = li === 3 || li === 6 ? R(60, 90) : 116;
        let x = 18;
        while (x < end) {
          const w = R(8, 22), x1 = Math.min(x + w, end), seg = [];
          for (let k = 0; k <= 3; k++) { const sx = side * (x + (x1 - x) * k / 3); seg.push([sx, yAt(top, sx) + (yAt(bot, sx) - yAt(top, sx)) * f]); }
          pen(T(seg), { ink: 'rgba(96,84,84,0.38)', lw: 1.1, wob: 0.1 });
          x = x1 + R(4, 7);
        }
      });
    }
    cut(whole); cut(ribbon, { exclude: [whole], lw: 2.6, dmin: 6, dmax: 14 });
  }

  // ── 雨靴：芥末黄一双，站在门口的小水洼里
  {
    const T = put(224, 1262, 0.95, -0.06);
    const bootPts = J.catmull([...J.arc(14, -96, 32, 9, Math.PI, 2 * Math.PI, 10), [45.5, -70], [45, -40], [45.5, -10], [47, 18], [50, 42], [54, 64], [56, 80], [50, 88], [30, 88], [0, 88], [-30, 88], [-56, 87], [-68, 82], [-73, 72], [-70, 60], [-60, 51], [-44, 44], [-28, 37], [-18, 26], [-14, 8], [-14, -14], [-15, -40], [-16, -66]], true, 3);
    const place = (dx, dy, s = 1) => p => p.map(([x, y]) => [x * s + dx, y * s + dy]);
    const PB = place(38, -10, 0.96), PF = place(-30, 6);
    const back = T(PB(bootPts)), front = T(PF(bootPts));
    const puddle = T(J.ellipse(4, 96, 124, 25, 0, 80, a => 1 + 0.05 * Math.sin(a * 3) + 0.03 * Math.sin(a * 7)));
    paint(puddle, [{ color: RAIN, density: 0.35 }, shade(T, 50, 104, 60, 14, 10, [120, 140, 176], 0.3)], { reserve: fillAll([back, front]) });
    for (const [P, ahead] of [[PB, front], [PF, null]]) {
      const TP = p => T(P(p));
      paint(TP(bootPts), [
        { color: MUSTARD, density: ahead ? 0.6 : 0.55 },
        { draw: fillP(TP([[-80, 75], [70, 75], [70, 96], [-80, 96]])), blur: 1.2, color: [140, 100, 64], density: 0.5 },
        { draw: fillP(TP(J.ellipse(14, -96, 28.5, 6.2))), blur: 1, color: [126, 84, 42], density: 0.65 },
        shade(TP, 40, 20, 24, 80, 14, OCHRE, ahead ? 0.45 : 0.35),
      ], { reserve: c => { fillP(TP(J.ellipse(0, -44, 4.5, 30, 0.02)))(c); fillP(TP(J.ellipse(-54, 60, 8, 4, -0.4)))(c); if (ahead) fillP(ahead)(c); } });
      pen(TP(J.catmull(ahead ? [[-8, 75], [20, 75], [53, 76]] : [[-56, 76], [-20, 75], [20, 75], [53, 76]], false, 3)), { ink: 'rgba(110,76,44,0.45)', lw: 1.2 }); // 后面那只被挡住的部分不画
    }
    pen(T(J.arc(-30, 108, 34, 5, 0.3, 2.8, 16)), { ink: 'rgba(90,110,140,0.45)', lw: 1.2 });
    pen(T(J.arc(78, 102, 20, 3.5, 0.2, 2.9, 12)), { ink: 'rgba(90,110,140,0.4)', lw: 1.1 });
    cut(puddle, { exclude: [back, front] }); cut(back, { exclude: [front] }); cut(front);
  }

  // ── 羊毛袜：燕麦色，两道灰蓝条纹，脚跟脚尖芥末黄，罗纹袜口
  {
    const sockPts = J.catmull([[-30, -104], [-4, -105], [22, -104], [23, -70], [24, -36], [26, -4], [36, 10], [56, 16], [78, 20], [96, 26], [106, 36], [108, 50], [100, 62], [84, 67], [60, 69], [30, 70], [2, 70], [-22, 68], [-38, 58], [-44, 40], [-42, 20], [-36, -4], [-33, -36], [-31, -70]], true, 3);
    const SX = 878, SY = 1244, SS = 0.95;
    const PB = p => tf(p, { x: SX + 20 * SS, y: SY - 14 * SS, s: SS, rot: 0.16 }), PF = p => tf(p, { x: SX - 52 * SS, y: SY + 8 * SS, s: SS, rot: 0.02 });
    const back = PB(sockPts), front = PF(sockPts);
    const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (const [P, ahead] of [[PB, front], [PF, null]]) {
      paint(P(sockPts), [
        { color: OAT, density: 0.4 },
        { draw: fillP(P(rect(-50, -110, 40, -84))), blur: 1, color: [196, 180, 156], density: 0.18 },
        { draw: fillAll([P(rect(-50, -70, 40, -62)), P(rect(-50, -54, 40, -48))]), blur: 1.2, color: SLATE, density: 0.5 },
        { draw: fillAll([P(J.ellipse(-46, 66, 36, 32)), P(J.ellipse(114, 46, 30, 34))]), blur: 1.5, color: MUSTARD, density: 0.6 },
        { draw: fillP(P(J.ellipse(14, 30, 44, 60))), blur: 16, color: [150, 150, 170], density: 0.28 },
      ], { reserve: ahead ? fillP(ahead) : null });
      for (let x = -27; x <= 19; x += 5.75) pen(P([[x, -101], [x, -87]]), { ink: 'rgba(120,100,80,0.42)', lw: 1.1, wob: 0.15 });
      for (let y = -34; y <= 4; y += 11) for (let x = -24; x <= 14; x += 11) pen(P([[x - 3, y - 3], [x, y + 2], [x + 3, y - 3]]), { ink: 'rgba(120,100,80,0.35)', lw: 1.1, wob: 0.15 });
      pen(P(J.arc(-46, 66, 36, 32, -1.72, -0.06, 14)), { smooth: true, ink: 'rgba(150,104,40,0.45)', lw: 1.1, dash: [2.5, 3] });
      pen(P(J.arc(114, 46, 30, 34, 2.55, 3.85, 12)), { smooth: true, ink: 'rgba(150,104,40,0.45)', lw: 1.1, dash: [2.5, 3] });
    }
    cut(back, { exclude: [front] }); cut(front);
  }

  kit.finish(0.13);

  // ════ 干了以后：胶带、纸片、字 ════
  // 宽和纸胶带：灰蓝底，上下两排小点，中间轮流印云朵和雨滴
  const rainPattern = (tc, len, wid) => {
    const cy = wid / 2;
    for (let x = 8; x < len; x += 14) for (const yy of [7, wid - 7]) { tc.fillStyle = 'rgba(232,190,100,0.8)'; tc.beginPath(); tc.arc(x + (yy > cy ? 7 : 0), yy, 1.8, 0, 7); tc.fill(); }
    let i = 0;
    for (let x = 40; x < len - 30; x += 74) {
      tc.save(); tc.translate(x, cy + R(-2, 2)); tc.rotate(R(-0.08, 0.08)); tc.scale(1.4, 1.4);
      if (i++ % 2 === 0) {
        tc.fillStyle = '#fbfbfd';
        for (const [cx, cyy, r] of [[-9, 2, 7], [0, -3, 9], [9, 2, 7]]) { tc.beginPath(); tc.arc(cx, cyy, r, 0, 7); tc.fill(); }
        tc.fillRect(-16, 2, 32, 7);
      } else {
        tc.fillStyle = '#8fa6cc';
        for (const [dx, dy] of [[-8, -6], [6, 2], [-2, 10]]) { tc.beginPath(); tc.moveTo(dx, dy - 6); tc.quadraticCurveTo(dx + 4, dy + 1, dx, dy + 4); tc.quadraticCurveTo(dx - 4, dy + 1, dx, dy - 6); tc.fill(); }
      }
      tc.restore();
    }
  };
  J.washi(540, 716, 1140, 88, 0.03, { color: '#d9deea', pattern: rainPattern });

  JP.title(J, 'Rainy Sunday', 84, 158, { sub: '下雨天，哪儿也不去', tapeColor: '#cfd9ea' });
  J.text(ctx, '(a slow one)', 408, 270, { font: '30px Sunrise', color: JP.NOTE, rot: 0.04 });

  JP.card(J, { x: 500, y: 930, w: 380, h: 230, rot: -0.045, title: 'today, maybe', todos: [['泡一壶伯爵茶', true], ['把第四章看完', false], ['袜子穿上', true], ['哪儿也不去', true]] });

  JP.para(J, "Rain all day. The tea went cold twice, and I read the same page three times and didn't mind. Wellies by the door, socks on, nowhere to be. Some Sundays are just for staying in.", 404, 1132, 344);

  JP.note(J, 'still dripping', 560, 560, [668, 500], { font: '30px Sunrise', bend: 14, from: [640, 540] });
  JP.note(J, '快看完了', 420, 330, [410, 418], { bend: -12, from: [452, 340] });
  JP.note(J, 'no sugar', 940, 1060, [916, 1000], { font: '30px Sunrise', bend: -10, from: [960, 1036] });
  JP.note(J, 'left at the door', 64, 1418, [150, 1372], { font: '30px Sunrise', bend: 12, from: [120, 1394] });
  JP.note(J, '暖暖的', 948, 1400, [930, 1336], { bend: -10, from: [960, 1376] });

  for (const [x, y, s] of [[560, 150, 1], [620, 210, 0.8], [588, 300, 1.1], [1010, 560, 0.9], [62, 620, 1], [1016, 1110, 0.9], [360, 1110, 0.8]]) JP.drop(J, x, y, s);
  JP.cloud(J, 670, 112, 1.1); JP.cloud(J, 1000, 1180, 0.9);
  J.sparkle(ctx, 1012, 820, 11, { fill: '#e8c48a' }); J.sparkle(ctx, 60, 860, 9, { fill: '#e8b8b4' });
};
// 落款（换成你自己的名字）：页右上角一行花体，名字 + 日期
window.SCENES.rainy_sunday.sign = { name: 'Cedar', tail: ' · 10.11', x: 790, y: 96, size: 44, color: '#3a2f31', rot: -0.03 };
