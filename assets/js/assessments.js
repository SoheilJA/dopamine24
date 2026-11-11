/* ==========================================================================
   فهرست آزمون‌ها + صفحهٔ معرفی هر آزمون
   کارت‌ها، وضعیت پیشرفت کاربر (از engine) و بخش آزمون‌های تخصصی
   ========================================================================== */
(function () {
  'use strict';
  const { qs, qsa, faNum, escapeHtml, icon, colorVars } = DPA.utils;

  function colorVarsOf(a) {
    const map = { brand: 'var(--brand)', gold: 'var(--gold-deep)', mint: 'var(--mint)', sky: 'var(--sky)', sun: 'var(--sun)', lilac: 'var(--lilac)' };
    const tint = { brand: 'var(--brand-ink)', gold: 'var(--gold-ink)', mint: 'var(--mint-ink)', sky: 'var(--sky-ink)', sun: 'var(--sun-ink)', lilac: 'var(--lilac-ink)' };
    const bd = { brand: '#F0D6D2', gold: '#EADFCB', mint: '#DDE9CE', sky: '#D8E0F3', sun: '#F0E2BE', lilac: '#E2DDF2' };
    return `--tc:${map[a.color] || map.brand};--tc-tint:${tint[a.color] || tint.brand};--tc-bd:${bd[a.color] || bd.brand};`;
  }

  /* ================= صفحهٔ فهرست ================= */
  function renderList() {
    const grid = qs('[data-tests-grid]');
    if (!grid) return;
    const states = {};
    DPA.engine.listStates().forEach((s) => { states[s.id] = s; });

    grid.innerHTML = DPA.assessments._all().map((a) => {
      const st = states[a.id] || {};
      const done = !!st.completed;
      const started = !!st.started;
      let stateHtml = '';
      if (done) {
        stateHtml = `<span class="test-card__state" style="color:var(--mint)">${icon('badge-check')} نتیجه آماده است</span>`;
      } else if (started) {
        stateHtml = `<span class="test-card__state" style="color:var(--gold-deep)">${faNum(st.answered)} از ${faNum(a.questionsCount)} پاسخ داده‌ای</span>`;
      } else {
        stateHtml = `<span class="test-card__state muted">${icon('mouse-pointer-click')} رایگان و بدون ثبت‌نام</span>`;
      }
      const ctaLabel = done ? 'مشاهدهٔ نتیجه' : (started ? 'ادامهٔ آزمون' : 'شروع آزمون');
      const ctaHref = done ? `result.html?id=${a.id}` : (started ? `quiz.html?id=${a.id}` : `assessment.html?id=${a.id}`);
      const progressPct = started && !done ? Math.round((st.answered / a.questionsCount) * 100) : 0;
      return `
        <article class="test-card ${done ? 'test-card--done' : ''}" style="${colorVarsOf(a)}" data-reveal>
          <div class="test-card__blob" style="background:var(--tc-tint)"></div>
          <div class="test-card__top">
            <div class="test-card__icon"><i data-lucide="${a.icon}"></i></div>
            <span class="chip chip--${a.color}">${escapeHtml(a.category)}</span>
          </div>
          <h3 class="test-card__title">${escapeHtml(a.title)}</h3>
          <p class="test-card__desc">${escapeHtml(a.desc)}</p>
          ${started && !done ? `<div class="test-card__progress-mini"><i style="width:${progressPct}%"></i></div>` : ''}
          <div class="test-card__meta">
            <span>${icon('list-checks')} ${faNum(a.questionsCount)} سؤال</span>
            <span>${icon('clock')} حدود ${faNum(a.duration)} دقیقه</span>
            <span>${icon('zap')} نتیجهٔ فوری</span>
          </div>
          <div class="test-card__foot">
            ${stateHtml}
            <a class="btn btn--sm ${done ? 'btn--outline' : 'btn--primary'}" href="${ctaHref}">${ctaLabel} ${icon('arrow-left', 'icon--arrow')}</a>
          </div>
        </article>`;
    }).join('');
    DPA.icons();
  }

  function renderClinical() {
    const wrap = qs('[data-clinical]');
    if (!wrap) return;
    const cats = DPA.site.clinicalTests.map((c) => {
      const tests = c.tests.map((t) => `<li>${escapeHtml(t)}</li>`).join('');
      return `<div class="clinical-cat" data-reveal>
        <h3>${icon('flask-conical')} ${escapeHtml(c.cat)}</h3>
        <ul>${tests}</ul>
      </div>`;
    }).join('');
    wrap.innerHTML = `
      <div class="section-head">
        <span class="kicker kicker--sky">${icon('flask-conical')} روان‌سنجی تخصصی</span>
        <h2 class="section-title">آزمون‌های تخصصی روان‌سنجی</h2>
        <p class="section-sub">آزمون‌های استاندارد و بالینی دوپامین با کد اختصاصی برگزار می‌شوند و نتیجه توسط متخصص تفسیر می‌شود. برای دریافت کد و هماهنگی، با تیم پشتیبانی در تماس باشید.</p>
      </div>
      <div class="clinical-cats" data-reveal-group>${cats}</div>`;
    DPA.icons();
  }

  /* ================= صفحهٔ معرفی ================= */
  function renderIntro() {
    const root = qs('[data-intro]');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id');
    const a = DPA.assessments._get(id);
    if (!a) { location.replace('assessments.html'); return; }

    document.title = `${a.title} — دوپامین`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', a.desc.slice(0, 155));

    const progress = DPA.engine.getProgress(a.id);
    const result = DPA.engine.getResult(a.id);
    const answered = progress ? progress.answers.filter((x) => x != null).length : 0;
    const inProgress = progress && answered > 0 && answered < a.questionsCount;

    const measures = a.measures.map((m) => `<span class="chip">${escapeHtml(m)}</span>`).join('');

    root.innerHTML = `
      <div class="container intro-grid">
        <div style="${colorVarsOf(a)}">
          <span class="q-num-chip">${icon(a.icon)} ${escapeHtml(a.category)}</span>
          <h1 class="section-title" style="font-size:var(--fs-h1)" data-reveal>${escapeHtml(a.title)}</h1>
          <p class="lead" data-reveal data-delay=".08">${escapeHtml(a.desc)}</p>
          <div class="measures" data-reveal data-delay=".14">${measures}</div>
          <div class="disclaimer-box" data-reveal data-delay=".2" style="margin-top:22px">
            ${icon('info')}
            <div><b>یادداشت مهم:</b> ${escapeHtml(a.disclaimer)}</div>
          </div>
          <div data-reveal data-delay=".26" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:26px">
            ${result ? `<a class="btn btn--outline" href="result.html?id=${a.id}">${icon('badge-check')} مشاهدهٔ نتیجهٔ قبلی</a>` : ''}
            ${inProgress
              ? `<a class="btn btn--primary" href="quiz.html?id=${a.id}">ادامهٔ آزمون (${faNum(answered)} از ${faNum(a.questionsCount)}) ${icon('arrow-left', 'icon--arrow')}</a>`
              : `<a class="btn btn--primary" href="quiz.html?id=${a.id}">شروع آزمون ${icon('arrow-left', 'icon--arrow')}</a>`}
            <a class="btn btn--ghost" href="assessments.html">سایر آزمون‌ها</a>
          </div>
        </div>
        <aside class="intro-meta" data-reveal data-delay=".12" style="${colorVarsOf(a)}">
          <div class="intro-meta__item">
            <span class="intro-meta__ico">${icon('list-checks')}</span>
            <div><div class="intro-meta__label">تعداد سؤال</div><div class="intro-meta__value">${faNum(a.questionsCount)} سؤال</div></div>
          </div>
          <div class="intro-meta__item">
            <span class="intro-meta__ico">${icon('clock')}</span>
            <div><div class="intro-meta__label">زمان تقریبی</div><div class="intro-meta__value">حدود ${faNum(a.duration)} دقیقه</div></div>
          </div>
          <div class="intro-meta__item">
            <span class="intro-meta__ico">${icon('gift')}</span>
            <div><div class="intro-meta__label">هزینه</div><div class="intro-meta__value">رایگان</div></div>
          </div>
          <div class="intro-meta__item">
            <span class="intro-meta__ico">${icon('user-round')}</span>
            <div><div class="intro-meta__label">نیاز به ثبت‌نام</div><div class="intro-meta__value">ندارد</div></div>
          </div>
        </aside>
      </div>`;
    DPA.icons();
  }

  /* ================= اجرای رندر =================
     رندر هم‌زمان با اجرای اسکریپت انجام می‌شود (پیش از DOMContentLoaded)
     تا app.js فقط یک‌بار سیستم reveal را روی همهٔ عناصر مقداردهی کند. */
  renderList();
  renderClinical();
  renderIntro();
})();
