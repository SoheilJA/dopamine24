/* ==========================================================================
   صفحهٔ اصلی — رندر سکشن‌های داده‌محور + کورئوگرافی هیرو
   ========================================================================== */
(function () {
  'use strict';
  const { qs, qsa, faNum, escapeHtml, icon, colorVars } = DPA.utils;

  /* ================= رندر سکشن‌ها ================= */

  /* تیکر خدمات */
  function renderTicker() {
    const track = qs('[data-ticker]');
    if (!track) return;
    const items = DPA.site.services.map((s) =>
      `<span class="ticker__item">${icon(s.icon)} ${escapeHtml(s.title)}</span>`).join('');
    track.innerHTML = items + items; /* دو نسخه برای لوپ بی‌درز */
  }

  /* کارت‌های دپارتمان */
  function renderDepts() {
    const grid = qs('[data-depts-grid]');
    if (!grid) return;
    grid.innerHTML = Object.values(DPA.site.departments).map((d) => `
      <article class="card card--hover dept-card" style="${colorVars(d.color)}" data-reveal>
        <div class="card__icon">${icon(d.icon)}</div>
        <h3 class="card__title">${escapeHtml(d.title)}</h3>
        <p class="card__text">${escapeHtml(d.tagline)} — ${escapeHtml(d.desc.split('؛')[0])}</p>
        <a class="card__link" href="${d.file}">اطلاعات بیشتر ${icon('arrow-left')}</a>
      </article>`).join('');
  }

  /* کارت‌های آموزشی */
  function renderEdu() {
    const grid = qs('[data-edu-grid]');
    if (!grid) return;
    const cards = [
      { t: 'مشاورهٔ ارشد روان‌شناسی', d: 'برنامه‌ریزی تخصصی برای کنکور کارشناسی ارشد روان‌شناسی.', icon: 'graduation-cap', color: 'brand', href: 'dept-masters.html' },
      { t: 'مشاورهٔ دکتری', d: 'راهنمایی دقیق آزمون دکتری نیمه‌متمرکز روان‌شناسی و مصاحبه‌ها.', icon: 'award', color: 'brand', href: 'dept-masters.html' },
      { t: 'انتخاب رشته نهم به دهم', d: 'انتخاب رشته بر اساس استعدادهای واقعی فرزند شما.', icon: 'route', color: 'sky', href: 'dept-education.html' },
      { t: 'بورسیهٔ خارج از کشور', d: 'راهنمایی در مسیر بورسیه‌های تحصیلی و ادامهٔ تحصیل در خارج از کشور.', icon: 'plane', color: 'sky', href: 'dept-masters.html' }
    ];
    grid.innerHTML = cards.map((c) => `
      <article class="card card--hover" style="${colorVars(c.color)}" data-reveal>
        <div class="card__icon">${icon(c.icon)}</div>
        <h3 class="card__title" style="font-size:1.05rem">${escapeHtml(c.t)}</h3>
        <p class="card__text">${escapeHtml(c.d)}</p>
        <a class="card__link" href="${c.href}">جزئیات ${icon('arrow-left')}</a>
      </article>`).join('') + `
      <a class="card-flat card-flat--brand" href="consult-arshad.html" data-reveal
         style="display:flex;flex-direction:column;gap:10px;align-items:flex-start">
        <span style="width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:rgba(255,255,255,.16)">
          ${icon('gift')}
        </span>
        <h3 style="color:#fff;font-size:1.1rem">جلسهٔ مشاورهٔ رایگان</h3>
        <p style="color:rgba(255,255,255,.85);font-size:.92rem">ویژهٔ داوطلبان ارشد و دکتری — حضوری یا آنلاین.</p>
        <span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;font-size:.9rem;color:#fff">ثبت درخواست ${icon('arrow-left')}</span>
      </a>`;
  }

  /* آمار */
  function renderStats() {
    const grid = qs('[data-stats-grid]');
    if (!grid) return;
    grid.innerHTML = DPA.site.stats.map((s) => `
      <div class="stat">
        <span class="stat__ico">${icon(s.icon)}</span>
        <span class="stat__num"><span data-count="${s.value}" data-suffix="${s.suffix}">۰</span></span>
        <span class="stat__label">${escapeHtml(s.label)}</span>
      </div>`).join('');
  }

  /* چرا دوپامین */
  function renderWhy() {
    const grid = qs('[data-why-grid]');
    if (!grid) return;
    grid.innerHTML = DPA.site.why.map((w) => `
      <article class="card card--hover why-card" style="${colorVars(w.color)}" data-reveal>
        <div class="card__icon">${icon(w.icon)}</div>
        <h3 class="card__title" style="font-size:1.08rem">${escapeHtml(w.title)}</h3>
        <p class="card__text">${escapeHtml(w.desc)}</p>
      </article>`).join('');
  }

  /* وبلاگ */
  function renderPosts() {
    const grid = qs('[data-posts-grid]');
    if (!grid) return;
    grid.innerHTML = DPA.site.posts.map((p, i) => `
      <article class="card card-media card--hover post-card" data-reveal data-delay="${i * .05}">
        <a class="media" href="article.html?id=${p.id}">
          <img src="${p.cover}" alt="${escapeHtml(p.title)}" loading="lazy">
          <span class="chip chip--${p.color}">${escapeHtml(p.tag)}</span>
        </a>
        <div class="body">
          <h3><a href="article.html?id=${p.id}">${escapeHtml(p.title)}</a></h3>
          <p>${escapeHtml(p.excerpt)}</p>
          <div class="meta">
            <span>${icon('calendar')} ${escapeHtml(p.date)}</span>
            <span>${icon('arrow-left')} خواندن مطلب</span>
          </div>
        </div>
      </article>`).join('');
  }

  /* سوالات متداول */
  function renderFaq() {
    const wrap = qs('[data-faq]');
    if (!wrap) return;
    wrap.innerHTML = DPA.site.faq.map((f, i) => `
      <div class="acc-item">
        <button class="acc-q" aria-expanded="${i === 0}" aria-controls="faq-a-${i}" id="faq-q-${i}">
          ${escapeHtml(f.q)}
          <span class="acc-ico">${icon('chevron-down')}</span>
        </button>
        <div class="acc-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">
          <div><p>${escapeHtml(f.a)}</p></div>
        </div>
      </div>`).join('');
    /* اولی باز باشد */
    const first = qs('.acc-item', wrap);
    if (first) first.classList.add('is-open');
  }

  /* ================= تیزر هیرو ================= */
  function initTeaser() {
    const teaser = qs('[data-hero="teaser"]');
    if (!teaser) return;
    const stepQ = qs('[data-teaser-step="q"]', teaser);
    const stepR = qs('[data-teaser-step="r"]', teaser);
    qsa('[data-teaser-pick]', teaser).forEach((btn) => {
      btn.addEventListener('click', () => {
        qsa('[data-teaser-pick]', teaser).forEach((b) => b.classList.remove('is-picked'));
        btn.classList.add('is-picked');
        setTimeout(() => {
          if (window.gsap && !DPA.env.reduced) {
            gsap.to(stepQ, {
              x: -26, autoAlpha: 0, duration: .3, ease: 'power2.in',
              onComplete: () => {
                stepQ.hidden = true; stepR.hidden = false;
                gsap.fromTo(stepR, { x: 26, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .45, ease: 'power3.out' });
                DPA.icons();
              }
            });
          } else {
            stepQ.hidden = true; stepR.hidden = false; DPA.icons();
          }
        }, 420);
      });
    });
  }

  /* ================= کورئوگرافی هیرو ================= */
  const HERO_SEL = '[data-hero], [data-hero-blob], [data-hero-ring], [data-hero-flower]';

  function heroIntro() {
    if (!window.gsap) { qsa(HERO_SEL).forEach((el) => { el.style.opacity = 1; }); return; }
    if (DPA.env.reduced) {
      qsa(HERO_SEL).forEach((el) => gsap.set(el, { autoAlpha: 1 }));
      return;
    }
    /* اگر هیرو در این صفحه نیست (مثل صفحهٔ رتبه‌ها) هیچ انیمیشنی نساز */
    if (!qs('[data-hero="title"]')) return;

    /* ریتم ورود هیرو — کادنس واحد: محتوای متنی ۰.۰ تا ۰.7،
       اجزای بصری ۰.2 تا ۰.9، جزئیات کوچک ۰.7 تا 1.05 */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('[data-hero-blob]',
      { scale: .7, autoAlpha: 0, rotate: -10 },
      { scale: 1, autoAlpha: 1, rotate: 0, duration: .9 }, 0)
      .fromTo('[data-hero="kicker"]',
        { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45 }, .08)
      .fromTo('[data-hero="title"]',
        { y: 38, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7 }, .16)
      .fromTo('[data-hero="sub"]',
        { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55 }, .36)
      .fromTo('[data-hero="cta"] .btn',
        { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, stagger: .08 }, .46)
      .fromTo('[data-hero="trust"]',
        { autoAlpha: 0 }, { autoAlpha: 1, duration: .45 }, .6)
      .fromTo('[data-hero="portrait"]',
        { y: 46, autoAlpha: 0, rotate: 1.5 },
        { y: 0, autoAlpha: 1, rotate: 0, duration: .8 }, .22)
      .fromTo('[data-hero-ring]',
        { autoAlpha: 0, rotate: -12, scale: .9 },
        { autoAlpha: 1, rotate: 0, scale: 1, duration: .85, ease: 'power2.out' }, .42)
      .fromTo('[data-hero="teaser"]',
        { y: 34, autoAlpha: 0, rotate: 2 },
        { y: 0, autoAlpha: 1, rotate: 0, duration: .6, ease: 'back.out(1.4)' }, .58)
      .fromTo('[data-hero-flower]',
        { scale: 0, rotate: -90 },
        { scale: 1, rotate: 0, duration: .6, ease: 'back.out(1.8)' }, .72)
      .fromTo('[data-hero="badge1"]',
        { scale: .4, autoAlpha: 0, rotate: 18 },
        { scale: 1, autoAlpha: 1, rotate: 4, duration: .45, ease: 'back.out(2)' }, .82)
      .fromTo('[data-hero="badge2"]',
        { scale: .4, autoAlpha: 0, rotate: -18 },
        { scale: 1, autoAlpha: 1, rotate: -5, duration: .45, ease: 'back.out(2)' }, .92);

    /* خط موج‌دار زیر کلمهٔ هایلایت، پس از ورود تیتر */
    tl.fromTo('[data-hero="title"] .squiggle path',
      { strokeDasharray: 130, strokeDashoffset: 130 },
      { strokeDashoffset: 0, duration: .6, ease: 'power2.inOut' }, .62);
  }

  /* ================= بوت ================= */
  renderTicker();
  renderDepts();
  renderEdu();
  renderStats();
  renderWhy();
  renderPosts();
  renderFaq();
  initTeaser();

  document.documentElement.addEventListener('dpa:ready', heroIntro, { once: true });
})();
