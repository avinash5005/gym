(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches, calm = matchMedia('(prefers-reduced-motion:reduce)').matches;

/* page transitions: orange wipe between pages */
if (!calm) {
  const w = document.createElement('div'); w.className = 'wipe'; document.body.append(w);
  w.style.transition = 'none'; w.style.transform = 'translateX(0)'; void w.offsetWidth;
  requestAnimationFrame(() => { w.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)'; w.style.transform = 'translateX(101%)'; });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html$|\/$/.test(u.pathname)) return;
    e.preventDefault(); w.style.transition = 'none'; w.style.transform = 'translateX(-101%)'; void w.offsetWidth;
    w.style.transition = 'transform .55s cubic-bezier(.7,0,.2,1)'; w.style.transform = 'translateX(0)';
    setTimeout(() => { location.href = u.href; }, 560);
  });
  addEventListener('pageshow', e => { if (e.persisted) { w.style.transition = 'none'; w.style.transform = 'translateX(101%)'; } });
}

/* scroll progress */
const pr = document.createElement('div'); pr.className = 'prog'; document.body.append(pr);
const prog = () => { pr.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`; };
addEventListener('scroll', prog, { passive: true }); prog();

/* smoothed pointer + hero parallax */
let mx = 0, my = 0, tx = 0, ty = 0; const hero = $('.hero');
addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
(function loop() {
  mx += (tx - mx) * .06; my += (ty - my) * .06;
  if (hero && !calm) { hero.style.setProperty('--mx', mx.toFixed(3)); hero.style.setProperty('--my', my.toFixed(3)); hero.style.setProperty('--sy', (Math.min(scrollY, innerHeight) / innerHeight).toFixed(3)); }
  requestAnimationFrame(loop);
})();

/* 3D tilt on hover */
if (fine && !calm) $$('[data-tilt]').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) scale3d(1.02,1.02,1.02)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

/* 3D weight plate (pure CSS 3D, built from stacked discs) */
const pl = $('#plate');
if (pl) {
  let h = ''; for (let z = -24; z <= 24; z += 2) h += `<i class="sl3" style="transform:translateZ(${z}px)"></i>`;
  const face = '<i class="rim"></i><i class="hole" style="--a:0deg"></i><i class="hole" style="--a:120deg"></i><i class="hole" style="--a:240deg"></i><b class="hub"></b><span class="txt">20 KG</span>';
  pl.innerHTML = h + `<div class="face">${face}</div><div class="face bk">${face}</div>`;
  let on = false, t = 0; new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(pl);
  (function spin() {
    if (on && !calm) { t += .35; pl.style.setProperty('--ry', (-28 + t + mx * 40 + scrollY * .08) + 'deg'); pl.style.setProperty('--rx', (-14 + my * -22) + 'deg'); }
    requestAnimationFrame(spin);
  })();
}

/* 3D ring gallery: auto-rotates, drag to spin */
const rg = $('#ring');
if (rg) {
  const figs = $$('figure', rg); rg.style.setProperty('--n', figs.length); figs.forEach((f, i) => f.style.setProperty('--i', i));
  const sc = rg.parentElement; let rot = 0, v = .12, drag = false, lx = 0, on = true;
  sc.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; sc.setPointerCapture(e.pointerId); sc.classList.add('g'); });
  sc.addEventListener('pointermove', e => { if (!drag) return; v = (e.clientX - lx) * .25; rot += v; lx = e.clientX; });
  const up = () => { drag = false; sc.classList.remove('g'); };
  sc.addEventListener('pointerup', up); sc.addEventListener('pointercancel', up);
  new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(sc);
  (function go() {
    if (on) { if (!drag && !calm) { v += (.12 - v) * .03; rot += v; } rg.style.setProperty('--rot', rot.toFixed(2) + 'deg'); }
    requestAnimationFrame(go);
  })();
}

/* cursor ring */
if (fine && !calm) {
  const c = document.createElement('div'); c.className = 'cur'; document.body.append(c);
  let cx = 0, cy = 0, px = 0, py = 0;
  addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; c.style.opacity = 1; });
  (function f() { cx += (px - cx) * .18; cy += (py - cy) * .18; c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(f); })();
  document.addEventListener('pointerover', e => c.classList.toggle('h', !!e.target.closest('a,button,[data-tilt],input,select,textarea,.row')));
}
})();
