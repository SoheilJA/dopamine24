/* ==========================================================================
   گزارش نتیجهٔ آزمون — result.html?id=xxx
   گزارش شخصی‌سازی‌شده بر پایهٔ پاسخ‌های واقعی (ذخیره‌شده در localStorage)
   ========================================================================== */
(function () {
  'use strict';
  const { qs, qsa, faNum, escapeHtml, icon } = DPA.utils;

  const id = new URLSearchParams(location.search).get('id');
  const A = DPA.assessments._get(id);
  const root = qs('[data-result]');
  if (!A || !root) return;

  const saved = DPA.engine.getResult(A.id);
  if (!saved || !saved.profileKey) {
    /* نتیجه‌ای نیست → برگرد به معرفی آزمون */
    root.innerHTML = `
      <div class="container empty-state">
        <div class="empty-state__ico">${icon('file-question')}</div>
        <h1 style="font-size:var(--fs-h2)">هنوز نتیجه‌ای ثبت نشده است</h1>
        <p class="lead" style="text-align:center">برای دیدن گزارش، اول آزمون را کامل کن؛ کمتر از ۲ دقیقه طول می‌کشد.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
          <a class="btn btn--primary" href="quiz.html?id=${A.id}">شروع آزمون ${icon('arrow-left', 'icon--arrow')}</a>
          <a class="btn btn--ghost" href="assessments.html">سایر آزمون‌ها</a>
        </div>
      </div>`;
    DPA.icons();
    if (DPA.initReveals) DPA.initReveals(root);
    return;
  }

  const profile = A.profiles[saved.profileKey] || Object.values(A.profiles)[0];
  const maxes = DPA.engine.dimensionMax(A);
  const scores = saved.scores || {};

  document.title = `${profile.title} — نتیجهٔ ${A.short} | دوپامین`;

  const colorVars = (() => {
    const map = { brand: 'var(--brand)', gold: 'var(--gold-deep)', mint: 'var(--mint)', sky: 'var(--sky)', sun: 'var(--sun)', lilac: 'var(--lilac)' };
    const tint = { brand: 'var(--brand-ink)', gold: 'var(--gold-ink)', mint: 'var(--mint-ink)', sky: 'var(--sky-ink)', sun: 'var(--sun-ink)', lilac: 'var(--lilac-ink)' };
    const bd = { brand: '#F0D6D2', gold: '#EADFCB', mint: '#DDE9CE', sky: '#D8E0F3', sun: '#F0E2BE', lilac: '#E2DDF2' };
    return `--tc:${map[A.color]};--tc-tint:${tint[A.color]};--tc-bd:${bd[A.color]};`;
  })();

  const dateFa = saved.ts
    ? new Date(saved.ts).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  /* ---------- ابعاد برای نمودار ---------- */
  const dims = A.dimensions.map((d) => ({
    key: d.key, title: d.title, desc: d.desc,
    score: scores[d.key] || 0,
    max: maxes[d.key] || 1
  }));

  /* ---------- بخش‌های گزارش ---------- */
  const codeHtml = A.id === 'mbti' ? `<div class="result-hero__code">${escapeHtml(saved.profileKey)}</div>` : '';
  /* نشان تزئینی برای آزمون‌های بدون کد لاتین (پرکردن تعادل بصری کارت) */
  const markHtml = A.id !== 'mbti' ? `
    <div class="result-hero__mark" aria-hidden="true">
      <span class="mark-ico">${icon(A.icon)}</span>
      <span class="mark-badge sticker sticker--sun">${escapeHtml(A.category)}</span>
    </div>` : '';

  const strengths = (profile.strengths || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const challenges = (profile.challenges || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const suggestions = (profile.suggestions || []).map((s) =>
    `<div class="suggest-item"><p>${escapeHtml(s)}</p></div>`).join('');

  const infoCards = [];
  if (profile.communication) infoCards.push(['messages-square', 'سبک ارتباطی تو', profile.communication]);
  if (profile.workStyle) infoCards.push(['briefcase', 'محیط مناسب تو', profile.workStyle]);
  if (profile.studyPlan) infoCards.push(['graduation-cap', 'برنامهٔ مطالعهٔ پیشنهادی', profile.studyPlan]);
  const infoHtml = infoCards.length ? `
    <section class="info-duo" data-reveal-group>
      ${infoCards.map(([ic, title, text]) => `
        <div class="info-card">
          <h3 class="info-card__head">${icon(ic)} ${escapeHtml(title)}</h3>
          <p>${escapeHtml(text)}</p>
        </div>`).join('')}
    </section>` : '';

  /* نمودار مناسب هر آزمون */
  let vizHtml = '';
  if (A.viz === 'axes' && A.pairs) {
    const code = saved.profileKey;
    vizHtml = `<div class="chart-axes" data-axes></div>`;
    window.__dpaPairs = A.pairs.map((p) => ({
      ...p,
      leftScore: scores[p.left] || 0,
      rightScore: scores[p.right] || 0,
      winner: code.includes(p.left) ? p.left : p.right
    }));
  } else if (A.viz === 'radar') {
    vizHtml = `<div data-radar></div>`;
  } else {
    vizHtml = `<div data-bars></div>`;
  }

  /* آزمون‌های پیشنهادی بعدی */
  const others = DPA.assessments._all().filter((x) => x.id !== A.id).slice(0, 3);

  root.innerHTML = `
  <div class="container" style="${colorVars};padding-top:calc(var(--header-h) + clamp(24px,4vw,48px));padding-bottom:clamp(40px,6vw,80px)">
    <nav class="breadcrumb" aria-label="مسیر">
      <a href="index.html">خانه</a> ${icon('chevron-left')}
      <a href="assessments.html">آزمون‌ها</a> ${icon('chevron-left')}
      <span>${escapeHtml(A.short)}</span> ${icon('chevron-left')} <b>نتیجه</b>
    </nav>

    <div class="result-grid">
      <!-- هدر نتیجه -->
      <header class="result-hero" data-reveal>
        ${markHtml}
        ${codeHtml}
        <span class="q-num-chip">${icon(A.icon)} ${escapeHtml(A.title)}</span>
        <h1 class="result-hero__title">${escapeHtml(profile.title)}</h1>
        <p class="result-hero__tagline">${escapeHtml(profile.tagline)}</p>
        <div class="result-hero__meta">
          <span>${icon('calendar')} ${escapeHtml(dateFa)}</span>
          <span>${icon('list-checks')} ${faNum(A.questionsCount)} سؤال</span>
          <span>${icon('lock')} محرمانه — فقط روی همین مرورگر ذخیره شده است</span>
        </div>
      </header>

      <!-- خلاصه -->
      <section class="result-viz" data-reveal>
        <h2 class="result-viz__title">خلاصهٔ پروفایل تو</h2>
        <p class="lead" style="max-width:none">${escapeHtml(profile.summary)}</p>
      </section>

      <!-- نمودار -->
      <section class="result-viz" data-reveal>
        <h2 class="result-viz__title">${A.viz === 'axes' ? 'نقشهٔ ترجیح‌های تو' : 'امتیاز تو در هر بعد'}</h2>
        ${vizHtml}
      </section>

      <!-- قوت‌ها و چالش‌ها -->
      <section class="sc-grid" data-reveal-group>
        <div class="sc-card sc-card--strength">
          <h3 class="sc-card__head">${icon('thumbs-up')} نقاط قوت تو</h3>
          <ul>${strengths}</ul>
        </div>
        <div class="sc-card sc-card--challenge">
          <h3 class="sc-card__head">${icon('compass')} فرصت‌های رشد</h3>
          <ul>${challenges}</ul>
        </div>
      </section>

      <!-- ارتباط/محیط/مطالعه -->
      ${infoHtml}

      <!-- پیشنهادها -->
      ${suggestions ? `
      <section data-reveal>
        <div class="section-head" style="margin-bottom:24px">
          <h2>قدم‌های عملی بعدی</h2>
        </div>
        <div class="suggest-list">${suggestions}</div>
      </section>` : ''}

      <!-- یادداشت علمی -->
      <section class="disclaimer-box" data-reveal>
        ${icon('info')}
        <div><b>محدودیت این آزمون:</b> ${escapeHtml(A.disclaimer)}</div>
      </section>

      <!-- اکشن‌ها -->
      <section class="result-actions" data-reveal style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn btn--outline" data-retake>${icon('rotate-ccw')} آزمون دوباره</button>
        <a class="btn btn--ghost" href="assessments.html">${icon('layout-grid')} همهٔ آزمون‌ها</a>
        <button class="btn btn--ghost" data-print>${icon('printer')} چاپ گزارش</button>
      </section>

      <!-- قدم‌های بعدی -->
      <section class="next-steps" data-reveal>
        <span class="kicker">${icon('sparkles')} مسیر رشد ادامه دارد</span>
        <h2 style="color:var(--bg);margin-top:12px">آزمون بعدی‌ات کدام باشد؟</h2>
        <div class="next-tests">
          ${others.map((o) => `
            <a class="next-test" href="assessment.html?id=${o.id}" style="--tc:var(--brand)">
              <span class="next-test__ico" style="--tc-tint:var(--${o.color === 'gold' ? 'gold-ink' : o.color + '-ink'});--tc:var(--${o.color === 'gold' ? 'gold-deep' : o.color});--tc-bd:transparent">${icon(o.icon)}</span>
              <span><b>${escapeHtml(o.short)}</b><small>${escapeHtml(o.category)}</small></span>
            </a>`).join('')}
        </div>
        <p style="color:#B4AB98;margin-top:22px;font-size:var(--fs-sm)">
          برای تفسیر تخصصی نتایج یا آزمون‌های استاندارد روان‌سنجی، تیم دوپامین کنار توست:
          <a href="contact.html" style="color:var(--gold);font-weight:700">درخواست مشاوره</a>
        </p>
      </section>
    </div>
  </div>`;

  DPA.icons();

  /* ---------- نمودارها (بعد از آماده‌شدن صفحه تا زیر پیش‌لودر پنهان نمانند) ---------- */
  function initCharts() {
    if (A.viz === 'axes' && window.__dpaPairs) {
      DPA.charts.axes(qs('[data-axes]', root), window.__dpaPairs);
    } else if (A.viz === 'radar') {
      DPA.charts.radar(qs('[data-radar]', root), dims);
    } else {
      DPA.charts.bars(qs('[data-bars]', root), dims);
    }
  }
  document.documentElement.addEventListener('dpa:ready', initCharts, { once: true });

  /* ---------- اکشن‌ها ---------- */
  qs('[data-retake]', root).addEventListener('click', () => {
    DPA.engine.resetAssessment(A.id);
    window.location.href = `quiz.html?id=${A.id}`;
  });
  qs('[data-print]', root).addEventListener('click', () => window.print());

  /* reveal روی محتوای جدید */
  if (DPA.initReveals) DPA.initReveals(root);
})();
