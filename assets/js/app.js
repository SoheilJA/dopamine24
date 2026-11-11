/* ==========================================================================
   دوپامین — هستهٔ مشترک برنامه
   پیش‌لودر، هدر و فوتر مشترک، ناوبری، اسکرول نرم (Lenis)،
   سیستم انیمیشن ورود (GSAP ScrollTrigger)، پردهٔ ترنزیشن صفحه، توست
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* Promise آماده‌بودن DOM — اسکریپت‌های defer قبل از DOMContentLoaded اجرا می‌شوند؛
     بنابراین این listener همیشه درست کار می‌کند و بعد از رندر همهٔ صفحات resolve می‌شود. */
  window.__dpaReady = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });

  /* ---------- محیط ---------- */
  const ENV = {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    touch: window.matchMedia('(pointer: coarse)').matches,
    desktop: window.matchMedia('(min-width: 1025px) and (pointer: fine)').matches,
    hasGsap: typeof window.gsap !== 'undefined',
    hasLenis: typeof window.Lenis !== 'undefined',
    hasLucide: typeof window.lucide !== 'undefined'
  };
  const hasGSAP = ENV.hasGsap;

  /* ---------- ابزارها ---------- */
  const qs  = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const faNum = (n) => String(n).replace(/\d/g, (d) => FA_DIGITS[+d]);

  const escapeHtml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const icon = (name, cls) => `<i data-lucide="${name}" class="icon ${cls || ''}"></i>`;

  /* ---------- توکن‌های موشن (هماهنگ با CSS) ----------
     سیستم زمان‌بندی واحد در کل سایت:
     • dur1 (0.16s) میکرو  • dur2 (0.26s) هاور/رابط  • dur3 (0.5s) ورود عناصر
     • dur4 (0.75s) سکانس‌های بلند  • stagger واحد 0.08s  • rise واحد 24px */
  const MOTION = {
    dur1: .16, dur2: .26, dur3: .5, dur4: .75,
    ease: 'power2.out', revealEase: 'power3.out', popEase: 'back.out(1.7)',
    stagger: .08, rise: 24
  };

  /* ---------- GSAP راه‌اندازی ---------- */
  if (hasGSAP) {
    gsap.defaults({ ease: MOTION.ease, duration: MOTION.dur3 });
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  }

  /* ==========================================================================
     هدر و فوتر مشترک
     ========================================================================== */
  function colorVars(color) {
    const c = (window.DPA.colorMap && DPA.colorMap[color]) || DPA.colorMap.brand;
    return `--card-accent:${c.accent};--card-icon-bg:${c.tint};--card-icon-bd:${c.bd};--dd-bg:${c.tint};--dd-fg:${c.accent}`;
  }

  function buildHeader() {
    const site = DPA.site;
    const page = document.body.dataset.page || '';
    const links = site.nav.map((item) => {
      const active = (item.href === 'index.html' && page === 'home') ||
                     (item.href !== 'index.html' && item.href.replace('.html', '') === page) ||
                     (page.startsWith('dept-') && item.href === 'services.html') ||
                     ((page === 'assessment' || page === 'quiz' || page === 'result') && item.href === 'assessments.html')
                       ? ' is-active' : '';
      if (item.dropdown) {
        const subs = item.dropdown.map((d) => `
          <a href="${d.href}">
            <span class="d-ico" style="${colorVars(d.bg)}">${icon(d.icon)}</span>
            <span>${escapeHtml(d.title)}<small>${escapeHtml(d.desc)}</small></span>
          </a>`).join('');
        return `<li class="has-dropdown">
          <a class="nav-link${active}" href="${item.href}" aria-haspopup="true">${escapeHtml(item.title)} ${icon('chevron-down')}</a>
          <div class="dropdown">${subs}</div>
        </li>`;
      }
      return `<li><a class="nav-link${active}" href="${item.href}">${escapeHtml(item.title)}<span class="u"></span></a></li>`;
    }).join('');

    const mobile = site.nav.map((item) => {
      if (item.dropdown) {
        const subs = item.dropdown.map((d) =>
          `<a href="${d.href}"><span class="dot"></span>${escapeHtml(d.title)}</a>`).join('');
        return `<a class="m-link" href="${item.href}">${escapeHtml(item.title)} ${icon('chevron-down')}</a>
                <div class="m-sub">${subs}</div>`;
      }
      return `<a class="m-link" href="${item.href}">${escapeHtml(item.title)} ${icon('arrow-left')}</a>`;
    }).join('');

    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="header-inner">
        <a class="header-logo" href="index.html" aria-label="دوپامین — صفحه اصلی">
          <img src="${site.brand.logo}" alt="لوگوی دوپامین" width="203" height="59">
        </a>
        <nav aria-label="ناوبری اصلی"><ul class="main-nav">${links}</ul></nav>
        <div class="header-actions">
          <a class="btn btn--ghost btn--sm btn--login" href="login.html">${icon('user-round')} ورود</a>
          <a class="btn btn--primary btn--sm btn--register" href="register.html">ثبت‌نام ${icon('arrow-left', 'icon--arrow')}</a>
          <button class="burger" aria-label="باز کردن منو" aria-expanded="false" aria-controls="mobile-drawer">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>`;
    document.body.prepend(header);

    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobile-drawer';
    drawer.innerHTML = `
      <nav aria-label="ناوبری موبایل">${mobile}</nav>
      <div class="m-cta">
        <a class="btn btn--primary" href="register.html">ثبت‌نام ${icon('arrow-left', 'icon--arrow')}</a>
        <a class="btn btn--outline" href="login.html">${icon('user-round')} ورود</a>
      </div>`;
    document.body.append(drawer);

    /* رفتار همبرگر */
    const burger = qs('.burger', header);
    const setOpen = (open) => {
      burger.classList.toggle('is-open', open);
      drawer.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
    qsa('a', drawer).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    /* سایهٔ هدر هنگام اسکرول */
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function buildFooter() {
    const site = DPA.site;
    const deptLinks = Object.values(site.departments).map((d) =>
      `<a href="${d.file}">${icon('minus')} ${escapeHtml(d.short)}</a>`).join('');
    const quickLinks = `
      <a href="assessments.html">${icon('minus')} آزمون‌های روانشناختی</a>
      <a href="ranks.html">${icon('minus')} رتبه برترها</a>
      <a href="blog.html">${icon('minus')} وبلاگ</a>
      <a href="dopatrip.html">${icon('minus')} دوپاتریپ</a>
      <a href="dopawalk.html">${icon('minus')} دوپاواک</a>
      <a href="register.html">${icon('minus')} ثبت‌نام</a>`;
    const socials = site.contact.socials.map((s) =>
      `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${escapeHtml(s.title)}">${icon(s.icon)}</a>`).join('');
    const phones = site.contact.phones.map((p) =>
      `<a href="tel:${p.tel}" dir="ltr">${icon('phone')} ${escapeHtml(p.label)}</a>`).join('');

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container footer-grid">
        <div>
          <a class="f-logo" href="index.html" aria-label="دوپامین">
            <img src="${site.brand.logoFooter}" alt="لوگوی دوپامین" width="220" height="70" loading="lazy">
          </a>
          <p class="f-about">${escapeHtml(site.fullName)} با یک دهه سابقه فعالیت تخصصی در حوزه‌های آموزشی و مشاوره‌ای و با بهره‌گیری از متخصصان دانشگاه‌های برتر کشور، در راستای افزایش آگاهی فردی و اجتماعی و بهبود سلامت روان گام برمی‌دارد.</p>
          <div class="f-socials">${socials}</div>
        </div>
        <nav aria-label="دپارتمان‌ها">
          <h3 class="f-title">دپارتمان‌ها</h3>
          <div class="f-links">${deptLinks}</div>
        </nav>
        <nav aria-label="دسترسی سریع">
          <h3 class="f-title">دسترسی سریع</h3>
          <div class="f-links">${quickLinks}</div>
        </nav>
        <div>
          <h3 class="f-title">راه‌های ارتباطی</h3>
          <div class="f-contact">
            ${phones}
            <a href="mailto:${site.contact.email}">${icon('mail')} ${escapeHtml(site.contact.email)}</a>
            <span>${icon('map-pin')} ${escapeHtml(site.contact.address)}</span>
            <span>${icon('clock')} ${escapeHtml(site.contact.hours)}</span>
          </div>
        </div>
      </div>
      <div class="container f-bottom">
        <span>© ${faNum(1405)} — کلیه حقوق این وب‌سایت برای مجموعه دوپامین محفوظ است.</span>
        <span>بازطراحی رابط کاربری — نسخهٔ نمایشی فرانت‌اند</span>
      </div>`;
    document.body.append(footer);
  }

  /* ==========================================================================
     آیکون‌ها
     ========================================================================== */
  function refreshIcons() {
    if (ENV.hasLucide) {
      lucide.createIcons({ attrs: { 'stroke-width': 2 } });
    }
  }
  function watchIcons() {
    refreshIcons();
    /* هر بار محتوای داینامیک اضافه شد، DPA.icons() صدا زده می‌شود */
  }

  /* ==========================================================================
     پیش‌لودر
     ========================================================================== */
  function initPreloader(done) {
    const shown = sessionStorage.getItem('dpa-pl');
    if (shown || ENV.reduced || !hasGSAP) {
      if (ENV.reduced) sessionStorage.setItem('dpa-pl', '1');
      done(true);
      return;
    }
    sessionStorage.setItem('dpa-pl', '1');
    const pl = document.createElement('div');
    pl.className = 'preloader';
    pl.setAttribute('aria-hidden', 'true');
    pl.innerHTML = `
      <div class="preloader__inner">
        <div class="preloader__logo"><img src="${DPA.site.brand.logo}" alt=""></div>
        <div class="dots-fun"><i></i><i></i><i></i></div>
      </div>`;
    document.body.append(pl);
    document.body.classList.add('is-loading');

    const tl = gsap.timeline({ onComplete: () => { pl.remove(); document.body.classList.remove('is-loading'); } });
    tl.fromTo(pl, { autoAlpha: 0 }, { autoAlpha: 1, duration: .15 })
      .fromTo('.preloader__logo img', { yPercent: 120 }, { yPercent: 0, duration: .45, ease: 'power3.out' }, .04)
      .fromTo('.dots-fun i', { y: 8, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .26 }, .22)
      .to(pl, { yPercent: -100, duration: .58, ease: 'power3.inOut',
        onStart: () => done(false) /* محتوای صفحه هم‌زمان با بالا رفتن پرده شروع شود */ }, '+=.28');
  }

  /* ==========================================================================
     اسکرول نرم (فقط دسکتاپ بدون کاهش حرکت)
     ========================================================================== */
  function initSmoothScroll() {
    if (!ENV.hasLenis || !ENV.desktop || ENV.reduced) return null;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', () => { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update(); });
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    return lenis;
  }

  /* ==========================================================================
     سیستم ورود عناصر (ScrollTrigger)
     ========================================================================== */
  function splitWords(el) {
    const text = el.textContent.trim();
    el.textContent = '';
    const frag = document.createDocumentFragment();
    text.split(/\s+/).forEach((w, i, arr) => {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;margin-bottom:-.08em;';
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.textContent = w;
      wrap.append(inner);
      frag.append(wrap);
      if (i < arr.length - 1) frag.append(document.createTextNode(' '));
    });
    el.append(frag);
    return qsa('span > span', el);
  }

  function initReveals(scope) {
    scope = scope || document;
    const fresh = (sel) => qsa(sel, scope).filter((el) => !el.classList.contains('revealed') && !el.dataset.revealBound);
    if (!hasGSAP) { fresh('[data-reveal],[data-reveal-group]').forEach((el) => el.classList.add('revealed')); return; }
    if (ENV.reduced) {
      fresh('[data-reveal],[data-reveal-group]').forEach((el) => el.classList.add('revealed'));
      qsa('[data-count]', scope).forEach((el) => { el.textContent = faNum(el.dataset.count) + (el.dataset.suffix || ''); });
      return;
    }

    /* تک عناصر: fade + rise (گارد خالی برای جلوگیری از هشدار GSAP) */
    const singles = fresh('[data-reveal]');
    if (singles.length) {
      singles.forEach((el) => {
        el.dataset.revealBound = '1';
        const delay = parseFloat(el.dataset.delay || 0);
        gsap.fromTo(el, { y: MOTION.rise, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: MOTION.dur4, ease: MOTION.revealEase, delay,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onStart: () => el.classList.add('revealed')
        });
      });
    }

    /* گروه‌ها: ورود پلکانی فرزندان */
    fresh('[data-reveal-group]').forEach((group) => {
      group.dataset.revealBound = '1';
      const kids = Array.from(group.children);
      if (!kids.length) return;
      gsap.fromTo(kids, { y: 30, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: MOTION.dur4, ease: MOTION.revealEase,
        stagger: parseFloat(group.dataset.stagger || MOTION.stagger),
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        onStart: () => group.classList.add('revealed')
      });
    });

    /* تیترها: ورود کلمه به کلمه */
    fresh('[data-words]').forEach((el) => {
      el.dataset.revealBound = '1';
      const words = splitWords(el);
      if (!words.length) return;
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(words, { yPercent: 115 }, {
        yPercent: 0, duration: .8, ease: MOTION.revealEase, stagger: .045,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* شمارنده‌های عددی */
    qsa('[data-count]', scope).forEach((el) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = '1';
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = faNum(Math.round(obj.v)) + suffix; }
      });
    });

    /* رسم مسیر SVG */
    qsa('[data-draw]', scope).forEach((svgEl) => {
      if (svgEl.dataset.revealBound) return;
      svgEl.dataset.revealBound = '1';
      const paths = qsa('path', svgEl);
      if (!paths.length) return;
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      gsap.to(paths, {
        strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: .12,
        scrollTrigger: { trigger: svgEl, start: 'top 85%', once: true }
      });
    });

    /* پارالاکس خیلی ملایم — فقط دسکتاپ */
    if (ENV.desktop) {
      qsa('[data-parallax]', scope).forEach((el) => {
        if (el.dataset.revealBound) return;
        el.dataset.revealBound = '1';
        const speed = parseFloat(el.dataset.parallax || 0.08);
        gsap.fromTo(el, { yPercent: speed * 60 }, {
          yPercent: speed * -60, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
        });
      });
    }
  }

  /* ==========================================================================
     پردهٔ ترنزیشن بین صفحات
     ========================================================================== */
  function initCurtain() {
    if (ENV.reduced || !hasGSAP) return;
    const curtain = document.createElement('div');
    curtain.className = 'page-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = `<img class="curtain-logo" src="${DPA.site.brand.logo}" alt="">`;
    document.body.append(curtain);

    /* ورود به صفحهٔ جدید: پرده از بالا کنار می‌رود */
    if (sessionStorage.getItem('dpa-curtain') === '1') {
      sessionStorage.removeItem('dpa-curtain');
      gsap.set(curtain, { yPercent: 0 });
      gsap.timeline()
        .to(curtain, { yPercent: -101, duration: .55, ease: 'power3.inOut', delay: .06 })
        .fromTo('.curtain-logo', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .18 }, 0)
        .to('.curtain-logo', { autoAlpha: 0, duration: .16 }, .3)
        .set(curtain, { yPercent: 101 });
    } else {
      gsap.set(curtain, { yPercent: 101 });
    }

    /* خروج: پرده از پایین بالا می‌آید و سپس صفحه عوض می‌شود */
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (a.target === '_blank' || a.hasAttribute('download') || a.dataset.noCurtain !== undefined) return;
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
      e.preventDefault();
      sessionStorage.setItem('dpa-curtain', '1');
      gsap.timeline({ onComplete: () => { window.location.href = href; } })
        .set(curtain, { yPercent: 101 })
        .to(curtain, { yPercent: 0, duration: .42, ease: 'power3.inOut' })
        .fromTo('.curtain-logo', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .2 }, .24);
    });
  }

  /* ==========================================================================
     توست
     ========================================================================== */
  function toast(msg, ico) {
    let wrap = qs('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.append(wrap); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icon(ico || 'check-circle-2')} <span>${escapeHtml(msg)}</span>`;
    wrap.append(t);
    refreshIcons();
    requestAnimationFrame(() => t.classList.add('is-show'));
    setTimeout(() => {
      t.classList.remove('is-show');
      setTimeout(() => t.remove(), 400);
    }, 3400);
  }

  /* ==========================================================================
     آکاردئون (delegate سراسری)
     ========================================================================== */
  function initAccordions() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.acc-q');
      if (!btn) return;
      const item = btn.closest('.acc-item');
      const isOpen = item.classList.contains('is-open');
      const group = item.closest('.accordion');
      if (group && group.dataset.single !== undefined) {
        qsa('.acc-item.is-open', group).forEach((it) => {
          it.classList.remove('is-open');
          const b = qs('.acc-q', it); b.setAttribute('aria-expanded', 'false');
        });
      }
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  /* ==========================================================================
     فرم‌ها (اعتبارسنجی + شبیه‌سازی ارسال — بدون بک‌اند)
     ========================================================================== */
  function bindForm(form) {
    if (!form) return;
    form.setAttribute('novalidate', 'novalidate');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      qsa('[required]', form).forEach((input) => {
        const field = input.closest('.field');
        let valid = input.value.trim().length > 1;
        if (valid && input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        if (valid && input.type === 'tel') valid = /^[\d\s+\-()]{8,}$/.test(input.value.trim());
        if (field) field.classList.toggle('has-error', !valid);
        if (!valid) ok = false;
      });
      if (!ok) { toast('لطفاً فیلدهای مشخص‌شده را کامل کنید.', 'alert-circle'); return; }
      const btn = qs('button[type="submit"]', form);
      if (btn) btn.classList.add('is-loading');
      setTimeout(() => {
        if (btn) btn.classList.remove('is-loading');
        form.reset();
        toast('در نسخهٔ نمایشی، اطلاعات شما ذخیره نمی‌شود؛ به‌زودی به سامانه متصل می‌شود.', 'info');
      }, 1200);
    });
    qsa('.input, .textarea, .select', form).forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.closest('.field');
        if (field) field.classList.remove('has-error');
      });
    });
  }
  function initForms() { qsa('form[data-demo]').forEach(bindForm); }

  /* برای محتوای داینامیکِ بعدی: DPA.initReveals(scope) را صدا بزنید */
  DPA.initReveals = initReveals;

  /* ==========================================================================
     بوت
     ========================================================================== */
  function boot() {
    buildHeader();
    buildFooter();
    initSmoothScroll();
    initAccordions();
    initForms();
    watchIcons();

    /* تور ایمنی: هر محتوای داینامیکی که اسکریپت‌های صفحه (home.js و page.js و ...)
       بعد از boot رندر کرده‌اند، آیکون‌هایشان اینجا تبدیل می‌شود. */
    window.__dpaReady.then(refreshIcons);

    const startReveals = () => {
      initReveals();
      if (hasGSAP && typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      document.documentElement.dispatchEvent(new CustomEvent('dpa:ready'));
    };

    initCurtain();
    initPreloader((instant) => {
      /* حتی در حالت instant صبر کن DOM آماده شود تا همهٔ رندرهای داینامیک انجام شده باشند */
      const go = () => window.__dpaReady.then(() => {
        startReveals();
      });
      if (instant) go();
      else setTimeout(go, 60); /* هم‌گام با حرکت پرده */
    });

    /* در صورت لود دیرترِ فونت/تصاویر، ScrollTrigger را به‌روز کن */
    window.addEventListener('load', () => {
      if (hasGSAP && typeof ScrollTrigger !== 'undefined') setTimeout(() => ScrollTrigger.refresh(), 120);
    });
  }

  /* ---------- API عمومی ---------- */
  DPA.env = ENV;
  DPA.motion = MOTION;
  DPA.utils = { qs, qsa, faNum, escapeHtml, icon, colorVars };
  DPA.icons = refreshIcons;
  DPA.toast = toast;
  DPA.splitWords = splitWords;
  DPA.bindForm = bindForm;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
