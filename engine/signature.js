// 落款：一行细笔花体，名字 + 日期，颜色跟标签一样。
// 每个 scene 用 SCENES.x.sign 写：{ name, tail, x, y, size, font, color, rot }，page.html 画完按它签；null 或不写就不签。
// 示例里的 "Cedar" 是原作者的名字，换成你自己的。
(function () {
  const Sig = {};
  Sig.script = (ctx, o = {}) => {
    const size = o.size ?? 44;
    ctx.save();
    ctx.globalAlpha = (o.alpha ?? 235) / 255;
    ctx.translate(o.x, o.y); ctx.rotate(o.rot ?? -0.04);
    ctx.fillStyle = o.color ?? '#3a2f31';
    ctx.font = `${size}px ${o.font ?? 'Cedarville'}`;
    ctx.fillText((o.name ?? 'Your Name') + (o.tail ?? ''), 0, 0);
    ctx.restore();
  };
  Sig.sign = (ctx, cfg) => { if (cfg) Sig.script(ctx, cfg); };
  window.Sig = Sig;
})();
