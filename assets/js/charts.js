/* ==========================================================================
   نمودارهای SVG سفارشی — بدون وابستگی، با انیمیشن GSAP
   ----------------------------------------------------------------------------
   DPA.charts.bars(...)   نمودار میله‌ای افقی (امتیاز ابعاد)
   DPA.charts.radar(...)  نمودار عنکبوتی (۴ محور)
   DPA.charts.axes(...)   محورهای ترجیح MBTI (E↔I و ...)
   DPA.charts.ring(...)   حلقهٔ درصد
   همهٔ توابع یک عنصر SVG برمی‌گردانند که با GSAP متحرک می‌شوند.
   ========================================================================== */
window.DPA = window.DPA || {};
DPA.charts = (function () {
  'use strict';
  const { faNum, escapeHtml } = DPA.utils;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.append(n);
    return n;
  }

  /* رنگ هر بعد از نقشهٔ رنگ سایت یا پیش‌فرض قرمز برند */
  const PALETTE = ['var(--brand)', 'var(--sky)', 'var(--mint)', 'var(--sun)', 'var(--lilac)', 'var(--gold-deep)'];

  /* ---------- میله‌ای افقی ---------- */
  function bars(container, dims, opts) {
    opts = opts || {};
    const showPercent = opts.percent !== false;
    const rows = dims.map((d, i) => {
      const pct = Math.round((d.score / (d.max || 1)) * 100);
      const color = d.color || PALETTE[i % PALETTE.length];
      return `
        <div class="chart-row" data-bar data-pct="${pct}">
          <div class="chart-row__head">
            <span class="chart-row__label">${escapeHtml(d.title)}</span>
            <span class="chart-row__val num" data-val>${showPercent ? faNum(pct) + '٪' : faNum(d.score)}</span>
          </div>
          <div class="chart-row__track">
            <div class="chart-row__fill" style="background:${color}"></div>
          </div>
          ${d.desc ? `<p class="chart-row__desc">${escapeHtml(d.desc)}</p>` : ''}
        </div>`;
    }).join('');
    container.innerHTML = `<div class="chart-bars">${rows}</div>`;
    container.querySelectorAll('.chart-row__fill').forEach((f) => { f.style.width = '0%'; });
    if (hasGSAP && !DPA.env.reduced) {
      DPA.utils.qsa('.chart-row', container).forEach((row, i) => {
        gsap.to(qsFill(row), {
          width: row.dataset.pct + '%', duration: .9, ease: 'power3.out', delay: .15 + i * .12
        });
      });
    } else {
      container.querySelectorAll('.chart-row__fill').forEach((f, i) => {
        f.style.width = f.closest('.chart-row').dataset.pct + '%';
      });
    }
    function qsFill(row) { return row.querySelector('.chart-row__fill'); }
    return container;
  }

  /* ---------- رادار (۴+ محور) ---------- */
  function radar(container, dims, opts) {
    opts = opts || {};
    const size = opts.size || 300, cx = size / 2, cy = size / 2, R = size * .36;
    const n = dims.length;
    const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const pt = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

    const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, class: 'chart-radar', role: 'img', 'aria-label': opts.aria || 'نمودار امتیازها' });
    /* حلقه‌های راهنما */
    [0.33, 0.66, 1].forEach((f) => {
      const pts = dims.map((_, i) => pt(i, R * f).join(',')).join(' ');
      el('polygon', { points: pts, fill: 'none', stroke: 'var(--line)', 'stroke-width': 1 }, svg);
    });
    /* خطوط محور + برچسب‌ها */
    dims.forEach((d, i) => {
      const [x, y] = pt(i, R);
      el('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: 'var(--line)', 'stroke-width': 1 }, svg);
      const [lx, ly] = pt(i, R + size * .11);
      const t = el('text', {
        x: lx, y: ly, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        fill: 'var(--ink-2)', 'font-size': size * .045, 'font-weight': 700, 'font-family': 'inherit'
      }, svg);
      t.textContent = d.title;
    });
    /* چندضلعی امتیاز */
    const vals = dims.map((d) => Math.max(0.06, d.score / (d.max || 1)));
    const poly = el('polygon', {
      points: vals.map((v, i) => pt(i, R * v).join(',')).join(' '),
      fill: 'rgba(156,24,31,.16)', stroke: 'var(--brand)', 'stroke-width': 2.5,
      'stroke-linejoin': 'round'
    }, svg);
    /* نقاط رأس */
    const dots = vals.map((v, i) => {
      const [x, y] = pt(i, R * v);
      return el('circle', { cx: x, cy: y, r: size * .022, fill: 'var(--brand)' }, svg);
    });
    /* مقدار عددی کنار رأس‌ها */
    vals.forEach((v, i) => {
      const [x, y] = pt(i, R * v + size * .055);
      const t = el('text', {
        x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        fill: 'var(--brand)', 'font-size': size * .042, 'font-weight': 800
      }, svg);
      t.textContent = faNum(Math.round(v * 100)) + '٪';
      if (hasGSAP && !DPA.env.reduced) gsap.set(t, { opacity: 0, y: 6, svgOrigin: `${x} ${y}` });
    });

    container.append(svg);
    if (hasGSAP && !DPA.env.reduced) {
      const from = vals.map(() => .06);
      const obj = { t: 0 };
      gsap.set(poly, { transformOrigin: '50% 50%' });
      gsap.fromTo(poly, { scale: .55, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, ease: 'power3.out' });
      gsap.to(obj, {
        t: 1, duration: 1.1, ease: 'power3.out',
        onUpdate: () => {
          const cur = from.map((f, i) => f + (vals[i] - f) * obj.t);
          poly.setAttribute('points', cur.map((v, i) => pt(i, R * v).join(',')).join(' '));
          cur.forEach((v, i) => {
            const [x, y] = pt(i, R * v);
            dots[i].setAttribute('cx', x); dots[i].setAttribute('cy', y);
          });
        },
        onComplete: () => {
          svg.querySelectorAll('text').forEach((t, i) => {
            if (i >= dims.length) gsap.to(t, { opacity: 1, y: 0, duration: .35, delay: (i - dims.length) * .08 });
          });
        }
      });
    }
    return svg;
  }

  /* ---------- محور ترجیح (MBTI) ---------- */
  function axes(container, pairs) {
    /* pairs: [{left, right, leftTitle, rightTitle, leftScore, rightScore, winner}] */
    const rows = pairs.map((p) => {
      const total = (p.leftScore || 0) + (p.rightScore || 0) || 1;
      const leftPct = Math.round((p.leftScore / total) * 100);
      const rightPct = 100 - leftPct;
      /* مارکر در بازهٔ ۴ تا ۹۶ درصد می‌ماند تا در حالت غالبِ کامل هم دیده شود */
      const marker = Math.min(96, Math.max(4, leftPct));
      const winLeft = p.winner === p.left;
      const winRight = p.winner === p.right;
      return `
        <div class="axis-row" data-marker="${marker}" data-pct="${leftPct}">
          <div class="axis-row__letters">
            <span class="axis-letter ${winLeft ? 'is-win' : ''}">${escapeHtml(p.left)}<small>${escapeHtml(p.leftTitle)}</small></span>
            <span class="axis-letter ${winRight ? 'is-win' : ''}">${escapeHtml(p.right)}<small>${escapeHtml(p.rightTitle)}</small></span>
          </div>
          <div class="axis-track">
            <div class="axis-fill" style="inset-inline-start:0;width:${leftPct}%"></div>
            <div class="axis-fill axis-fill--alt" style="inset-inline-start:${leftPct}%;width:${rightPct}%"></div>
            <span class="axis-marker" style="inset-inline-start:${leftPct}%"></span>
          </div>
          <div class="axis-row__pcts">
            <span class="num">${faNum(leftPct)}٪</span>
            <span class="num">${faNum(rightPct)}٪</span>
          </div>
        </div>`;
    }).join('');
    container.innerHTML = `<div class="chart-axes">${rows}</div>`;
    if (hasGSAP && !DPA.env.reduced) {
      DPA.utils.qsa('.axis-row', container).forEach((row, i) => {
        const marker = row.querySelector('.axis-marker');
        const pcts = row.querySelector('.axis-row__pcts');
        gsap.set(marker, { insetInlineStart: '50%' });
        gsap.set(pcts, { opacity: 0 });
        gsap.to(marker, { insetInlineStart: row.dataset.marker + '%', duration: 1, ease: 'power3.inOut', delay: .2 + i * .15 });
        gsap.to(pcts, { opacity: 1, duration: .4, delay: .8 + i * .15 });
      });
    }
    return container;
  }

  /* ---------- حلقهٔ درصد ---------- */
  function ring(container, percent, opts) {
    opts = opts || {};
    const size = opts.size || 168, r = size * .42, c = 2 * Math.PI * r;
    const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, class: 'chart-ring', role: 'img', 'aria-label': opts.aria || 'درصد' });
    el('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--line)', 'stroke-width': size * .075 }, svg);
    const arc = el('circle', {
      cx: size / 2, cy: size / 2, r, fill: 'none',
      stroke: opts.color || 'var(--brand)', 'stroke-width': size * .075,
      'stroke-linecap': 'round',
      'stroke-dasharray': c, 'stroke-dashoffset': c,
      transform: `rotate(-90 ${size / 2} ${size / 2})`
    }, svg);
    const txt = el('text', {
      x: '50%', y: '50%', 'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: 'var(--ink)', 'font-size': size * .2, 'font-weight': 800
    }, svg);
    txt.textContent = faNum(0) + '٪';
    container.append(svg);
    const target = Math.max(0, Math.min(100, percent));
    if (hasGSAP && !DPA.env.reduced) {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.3, ease: 'power2.out', delay: .25,
        onUpdate: () => {
          arc.setAttribute('stroke-dashoffset', c * (1 - obj.v / 100));
          txt.textContent = faNum(Math.round(obj.v)) + '٪';
        }
      });
    } else {
      arc.setAttribute('stroke-dashoffset', c * (1 - target / 100));
      txt.textContent = faNum(Math.round(target)) + '٪';
    }
    return svg;
  }

  return { bars, radar, axes, ring };
})();
