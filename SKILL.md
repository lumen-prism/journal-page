---
name: journal-page
description: 整页手帐——把一页手帐画成一张图：几张水彩贴纸（淡水彩洇开 + 波浪裁切线）有大有小、歪着放、互相压着，标题压在纸胶带上，宽和纸胶带、票根、横线/方格/牛皮纸卡片、一段草草的英文手写、带虚线箭头的批注、零碎小涂鸦。想"做一页手帐/手帐排版/拼贴一页/画一页手帐"时用。headless Chrome 里 canvas 画，node 出图。
---

# 整页手帐

*by Cedar, with Lumen* · 一支用 canvas 画水彩手帐的笔。

一张 1080×1440 的手帐页，不是一排小物，是一整页拼贴：有主角、有挤成一堆的、有故意空着的白。

**先看 `samples/`。** 《Picnic Day》和《Rainy Sunday》就是这支笔的样子，画完对一眼，不像它就是滑了。代码在 `scenes/autumn_picnic.js`、`scenes/rainy_sunday.js`，抄一个当底板。

## 一页上能放什么（菜单，不是清单）

下面的材料**挑几种就好，别配齐**；东西放多少不限。照单全配，版面再怎么换，页面也会像模板。

- **水彩贴纸**：每样东西是一小块淡水彩，里面几层颜色自己洇开，亮处留白，外面一圈断断续续的波浪裁切线。东西没有脸。
- **一块直接画在纸上的底**：野餐毯、一片天、一块桌布——没有裁切边，可以出血出页面，贴纸散在上面。
- **标题**：大号手写英文压在一条纸胶带上，下面一行小字和一道手画的线（`JP.title`）。
- **宽和纸胶带**：不印字，印小图案（云、雨滴、银杏、松树……），两头撕毛边，有和纸纤维，半透明（`J.washi` + `JP.washiRow`）。可以横贯整页，也可以斜着按住一样东西。
- **窄纸胶带**：贴卡片角，条纹/波点/格子/雪花/循环印字（`J.tape`）。
- **票根**：撕票口、虚线、条码、挂绳（`JP.ticket`），可以塞在卡片底下只露一半。
- **卡片**：横线 / 方格 / 点阵 / 牛皮纸 / 白纸，写待办、清单或几句话（`JP.card`）。
- **正文**：一段英文，草草的连笔手写体 Homemade Apple（`JP.para`）。底下可以再来一句中文。
- **批注**：一句小字 + 一条弯弯的虚线箭头指向某样东西，落在画过的地方就垫一张小纸签（`JP.note`）。
- **涂鸦**：雨滴、云、雪花、星星、闪光、落叶飘过的虚线轨迹。

**每页至少有一样是这一页自己发明的**，不在上面这张单子里：野餐页那块格子毯、那片用胶带按住叶柄的压平银杏。新东西就在 scene 里现画，用过两次、样子稳了，再考虑收进工具。

## 版面：先定三件事再动笔

没有固定格子。动笔前把这三件写在 scene 开头的注释里：
1. **主角**是哪样、放哪个角、多大（野餐页是右下角出血的格子毯，下雨页是右上的大伞）。
2. **白留在哪**：一整块，别均匀撒满（野餐页右边中间只飘两片叶子）。乱不在歪，在每样东西一样重、一样密。
3. **胶带走哪个方向**：横贯、竖贯、斜贴一角、只贴一截。

然后翻 `samples/`，跟每一张都不一样再画。其余的：
- **每样都歪一点**：`put(x, y, 大小, 歪多少)`，歪 -0.15 到 0.15 弧度，大小 0.85 到 1.5 不等。
- **互相压着**：卡片压票根，胶带压卡片角，批注的箭头跨过空白指过去。
- **层次规则**：水彩（贴纸、底）先画，`kit.finish()` 之后画的东西（胶带、卡片、字、涂鸦）永远压在水彩上面。两张水彩叠在一起时，后面那张 `reserve` 掉前面那张。票根这种自己带水彩的纸片，先登记的会被后画的纸片盖住。

## 画一页

1. 定主题，定一个色系（野餐：砖红 + 焦糖 + 芥末黄 + 一点橄榄绿；雨天：灰蓝 + 芥末黄 + 豆沙粉）。
2. 抄一个示例 scene，新建 `scenes/<名字>.js`，注册成 `window.SCENES.<名字>`。
3. 每样东西：在局部坐标里写外形点列（`J.catmull` 平滑、`J.ellipse`、`J.arc`），`put(x, y, s, rot)` 放到页上；
   - `paint(外形, [底色层, 影子层(blur 10–18), …], { reserve: 高光/挡在前面的东西 })`
   - `pen(…)` 极细的钢笔细节，`cut(外形, { exclude: [挡在前面的] })` 裁切线
4. `kit.finish()`，然后：胶带 → 标题 → 卡片 → 正文 → 批注 → 涂鸦。
5. 出图，**自己看**：整张看一遍，再裁几块放大看（字有没有叠、箭头指没指对、裁切线有没有缠成一团）。不像就改。

```
cd journal-page                 # 一定要先 cd 进来，--out 是相对当前目录的
npm i puppeteer-core            # 第一次
node render.mjs --scene=autumn_picnic --seed=5 --out=out/x.png
```
Chrome 自动找：Mac 自带的、`~/.cache/ms-playwright/chromium-*`，或者设 `CHROME_PATH`。

## 工具箱

**`kit = WJ.kit(J, WC)`**（`engine/wj.js`）：
| | |
|---|---|
| `tf(pts, {x, y, s, rot})` | 局部坐标 → 画布（示例里包成 `put`） |
| `fillP(pts)` / `fillAll([pts…])` | 画蒙版用的填充函数（reserve、layer.draw 都用它） |
| `strokePoly(pts, hw)` | 一条粗线（伞杆、杯把、提手）→ 闭合外形，好拿去 `paint` 和 `cut`；hw 半宽，可以是 `p => 数字` |
| `paint(pts, layers, opt)` | 湿画一块。layer：`{ color, density, draw?, blur?, grad? }`，每层自动被外形裁掉（条纹可以画出界） |
| `wet(draw, layers, opt)` | 同上，外形用任意 draw（比如 evenodd 挖洞的杯把）。只能上色，`cut` 要另给闭合外形 |
| `pen` / `cut` / `later(fn)` | 水彩干了以后再画的东西 |
| `finish(relief)` | 水彩落纸、打光，再把 later 的全画上 |

**`JP`**（`engine/page.js`）——"买来的材料"，只管它本身长什么样，画什么、放哪由 scene 定：

| 在 finish 之前（多传 kit） | |
|---|---|
| `JP.ticket(J, kit, { x, y, rot, w, h, title, titleSize, titleFont, titleBold, font, lines, number, stub, paper, ink, string, stringInk, barcode, exclude })` | 票根。标题太长会自动缩到条码前；想要打字机感就换 `titleFont`。返回外形 |

| 在 finish 之后 | |
|---|---|
| `JP.title(J, text, x, y, { size, font, rot, sub, subFont, color, tape, tapeLen, tapeColor, tapeKind, tapeRot, tapeDx, tapeDy, underline, lineColor })` | 标题 + 小字 + 手画线。胶带、下划线跟着字长和 rot 走；`tape: false` 自己贴 |
| `JP.card(J, { x, y, w, h, rot, paper, color, title, titleFont, titleInk, todos, lines, font, ink, lineHeight, top, lineColor, tape, tapeColor, tapeKind })` | 卡片。paper：`lined` / `grid` / `dot` / `kraft` / `plain`；tape：`diagonal` / `top` / `none`；小卡小字：`lineHeight: 32, font: '22px …'` |
| `JP.note(J, text, x, y, [tx, ty] \| null, { from, bend, font, color, rot, bg })` | 批注 + 虚线箭头（给 null 就只写字）；`bg: true` 垫小纸签 |
| `JP.para(J, text, x, y, maxW, { font, cjk, color, lineHeight, rot })` | 一段正文自动折行，默认 `22px Homemade` |
| `JP.washiRow(tc, len, wid, [motif…], { start, step, scale, dots, dotColor })` | 在 `J.washi` 的 pattern 回调里用：把这一页现画的小图案沿胶带排开 |
| `J.washi(x, y, len, wid, rot, { color, pattern, alpha, cover })` / `J.tape(x, y, len, wid, rot, { color, kind, alpha })` | 宽和纸胶带 / 窄纸胶带（kind：stripes / dots / grid / snow / text） |
| `JP.flake` / `JP.drop` / `JP.cloud`、`J.star` / `J.sparkle` / `J.heart` | 小涂鸦 |

**`J`**（`engine/journal.js`）：`J.text(ctx, str, x, y, {font, color, rot, spacing})`、`J.line`、`J.curl(x, y, s, rot)`、`J.catmull`、`J.ellipse`、`J.arc`、`J.wobble`。
**`WC`**（`engine/watercolor.js`）：纸、`wash` 干画、`wet` 湿画、`ink`。

## 手感

- 单个物件的颜色淡：density 0.35–0.65，亮处直接留白（reserve），不涂白。
- **大面积的底**（野餐毯、一片天）：每层 density 不超过约 0.25——两层色带一叠就 0.5，太重。格子布就是两层透明色带交叉，重叠处自己变深。
- 影子做成同一块里的一层 `{ draw: 椭圆, blur: 12–18 }`，让它自己化进去，别硬边压上去。贴纸落在底上的影子，做成底里的一层。
- 两层透明色一叠就脏：比如天空，蓝只铺上半截、橘只铺下半截，各自 blur，交界处自己化。
- 白的东西（奶油、毛球、书页）：底色 density 0.08–0.35，靠一层冷灰影子和裁切线立住。
- 小字母、小图案别用 reserve 留白（会被纸纹吃掉）：干了以后用 `later` 拿白色直接写。
- **多零件物件只描外轮廓**：每个零件 `cut` 时 `exclude` 掉相邻零件。零件边贴着别的零件内部时（杯身顶边贴着杯口），不 exclude 裁切线就会横穿过去。
- 裁切线默认 `lw 4.2`；小零件用 `lw 2.6–3.2, dmin 6–10, dmax 14–22`；小于 25px 的东西别画裁切线。
- 和纸胶带宽 60–90，图案放大 1.2–1.4 倍、间距 55–75。
- 正文 `22px Homemade`，行高 41，宽 340–460。中文用系统手写体 `"HanziPen SC"`（Mac 自带），scene 开头 `await document.fonts.load(...)`。

## 坑

- **`kit.finish()` 会把画布整张盖掉**：finish 之前直接画在 ctx 上的东西全没了。纸片、胶带、字要么在 finish 之后画，要么登记进 `kit.later`。
- **`J.catmull` 会过冲打结**：相邻点距差太多（长直线接一串短弧点）就自交，裁切线会缠成一团。直线和弧拼接的地方别过 catmull，直接按 2–3px 铺点。
- **`pen` / `later` 的线不会被前面的东西挡住**：后面物件的钢笔细节会画到前面物件上，要自己把被挡住的那段去掉。
- **HanziPen 的数字 1 带小旗，像 7**：日期、数字用 Sunrise（`'40px Sunrise, "HanziPen SC"'`，中文自动回退）。
- **文字别叠**：标题副标题后面再加小字前，先估一下前面那行多宽。
- zsh 里 `set -- $x` 不按空格拆，要拆用 `${=x}`。
- 裁图看细节：`sips -c 高 宽 --cropOffset y x in.png --out out.png`（先高后宽、先 y 后 x）。

## 落款

一行细笔花体：名字 + 日期，颜色跟标签一样，找标题对角或者白里一个角落，别压在主角上。写在 scene 末尾：

```js
window.SCENES.<名字>.sign = { name: '你的名字', tail: ' · 10.11', x: 812, y: 88, size: 40, color: '#3a2f31' };
```

示例页上签的 "Cedar" 是原作者的名字，**拿去用的时候换成你自己的**。不想签就写 `null`。

## 许可

代码 AGPL-3.0（见 `LICENSE`），闭源商用请到仓库开 Issue 联系作者。`samples/` 里的图 CC BY-NC-SA 4.0，不可商用。字体各自沿用原协议（`fonts/FONTS.md`）。
