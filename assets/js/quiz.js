/* ==========================================================================
   رابط سؤال‌های آزمون — quiz.html?id=xxx
   یک سؤال در هر صفحه، ترنزیشن جهت‌دار، ذخیرهٔ خودکار، ناوبری کیبورد
   ========================================================================== */
(function () {
  'use strict';
  const { qs, qsa, faNum, escapeHtml, icon } = DPA.utils;
  const KEY_LETTERS = ['الف', 'ب', 'ج', 'د'];

  const id = new URLSearchParams(location.search).get('id');
  const A = DPA.assessments._get(id);
  if (!A) location.replace('assessments.html');

  const shell = qs('[data-quiz]');
  if (!A || !shell) return;

  /* ---------- وضعیت ---------- */
  const progress = DPA.engine.getProgress(A.id) || { answers: [], current: 0 };
  let answers = A.questions.map((_, i) =>
    (typeof progress.answers[i] === 'number' && progress.answers[i] < A.questions[i].options.length)
      ? progress.answers[i] : null);
  let current = Math.min(progress.current || 0, A.questions.length - 1);
  let busy = false;

  document.title = `${A.title} — دوپامین`;

  const colorVars = (() => {
    const map = { brand: 'var(--brand)', gold: 'var(--gold-deep)', mint: 'var(--mint)', sky: 'var(--sky)', sun: 'var(--sun)', lilac: 'var(--lilac)' };
    const tint = { brand: 'var(--brand-ink)', gold: 'var(--gold-ink)', mint: 'var(--mint-ink)', sky: 'var(--sky-ink)', sun: 'var(--sun-ink)', lilac: 'var(--lilac-ink)' };
    const bd = { brand: '#F0D6D2', gold: '#EADFCB', mint: '#DDE9CE', sky: '#D8E0F3', sun: '#F0E2BE', lilac: '#E2DDF2' };
    return `--tc:${map[A.color]};--tc-tint:${tint[A.color]};--tc-bd:${bd[A.color]};`;
  })();

  /* ---------- اسکلت صفحه ---------- */
  shell.innerHTML = `
    <div class="container quiz-shell" style="${colorVars}">
      <div class="quiz-top">
        <div class="quiz-top__row">
          <button class="btn btn--ghost btn--sm" data-exit>${icon('x')} خروج</button>
          <div class="quiz-dots" role="progressbar" aria-label="پیشرفت آزمون" aria-valuemin="1" aria-valuemax="${A.questions.length}">${A.questions.map(() => '<i></i>').join('')}</div>
          <span class="quiz-counter">سؤال <b data-counter>۱</b> از ${faNum(A.questions.length)}</span>
        </div>
        <div class="progress"><div class="progress__fill" data-fill></div></div>
      </div>
      <main class="q-card" data-stage aria-live="polite"></main>
    </div>`;
  DPA.icons();

  const stage = qs('[data-stage]', shell);
  const fill = qs('[data-fill]', shell);
  const counter = qs('[data-counter]', shell);
  const dots = qsa('.quiz-dots i', shell);

  /* ---------- رندر یک سؤال ---------- */
  function renderQuestion(qi, dir) {
    const q = A.questions[qi];
    const selected = answers[qi];

    const opts = q.options.map((o, oi) => `
      <button class="q-opt ${selected === oi ? 'is-selected' : ''}" data-opt="${oi}"
              aria-pressed="${selected === oi}">
        <span class="q-opt__key">${KEY_LETTERS[oi] || faNum(oi + 1)}</span>
        <span>${escapeHtml(o.label)}</span>
        <span class="q-opt__check">${icon('check')}</span>
      </button>`).join('');

    const isLast = qi === A.questions.length - 1;
    stage.innerHTML = `
      <span class="q-num-chip">${icon(A.icon)} ${escapeHtml(A.category)}</span>
      <h2 class="q-text">${escapeHtml(q.text)}</h2>
      <div class="q-options">${opts}</div>
      <div class="q-nav">
        <button class="btn btn--ghost" data-prev ${qi === 0 ? 'disabled' : ''}>${icon('arrow-right')} قبلی</button>
        <span class="q-nav__hint">با کلیدهای ۱ تا ۴ هم می‌توانی انتخاب کنی</span>
        <button class="btn btn--primary" data-next>
          ${isLast ? 'مشاهدهٔ نتیجه' : 'سؤال بعدی'} ${icon(isLast ? 'sparkles' : 'arrow-left', 'icon--arrow')}
        </button>
      </div>`;
    DPA.icons();

    /* اتصال رویدادها */
    qsa('.q-opt', stage).forEach((btn) => {
      btn.addEventListener('click', () => select(qi, +btn.dataset.opt));
    });
    qs('[data-prev]', stage)?.addEventListener('click', () => go(qi - 1, -1));
    qs('[data-next]', stage).addEventListener('click', () => next(qi));

    /* به‌روزرسانی وضعیت بالا */
    counter.textContent = faNum(qi + 1);
    dots.forEach((d, i) => {
      d.classList.toggle('is-done', i < qi || (i === qi && answers[i] != null));
      d.classList.toggle('is-current', i === qi);
    });
    fill.style.width = ((qi) / A.questions.length) * 100 + '%';
    shell.querySelector('.quiz-dots').setAttribute('aria-valuenow', qi + 1);

    /* انیمیشن ورود جهت‌دار */
    if (window.gsap && !DPA.env.reduced) {
      const dirIn = dir >= 0 ? -46 : 46;
      gsap.fromTo(stage,
        { x: dirIn, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: .5, ease: 'power3.out' });
      gsap.fromTo(qsa('.q-opt', stage),
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: .45, ease: 'power3.out', stagger: .06, delay: .12 });
      gsap.fromTo(qs('.q-text', stage),
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: .45, ease: 'power3.out', delay: .06 });
    }
  }

  /* ---------- انتخاب گزینه ---------- */
  function select(qi, oi) {
    if (busy) return;
    answers[qi] = oi;
    qsa('.q-opt', stage).forEach((b, i) => {
      b.classList.toggle('is-selected', i === oi);
      b.setAttribute('aria-pressed', String(i === oi));
    });
    /* پاپ کوچک روی تیک */
    if (window.gsap && !DPA.env.reduced) {
      const check = qs('.q-opt.is-selected .q-opt__check', stage);
      if (check) gsap.fromTo(check, { scale: .4 }, { scale: 1, duration: .35, ease: 'back.out(2.4)' });
    }
    dots[qi].classList.add('is-done');
    save(qi);
  }

  /* ---------- ناوبری ---------- */
  function save(qi) {
    DPA.engine.saveProgress(A.id, answers, qi);
  }

  function go(qi, dir) {
    if (busy || qi < 0 || qi >= A.questions.length) return;
    busy = true;
    const finish = () => { current = qi; renderQuestion(qi, dir); busy = false; };
    if (window.gsap && !DPA.env.reduced) {
      gsap.to(stage, {
        x: dir >= 0 ? 52 : -52, autoAlpha: 0, duration: .26, ease: 'power2.in', onComplete: finish
      });
    } else finish();
  }

  function next(qi) {
    if (busy) return;
    if (answers[qi] == null) {
      DPA.toast('اول یکی از گزینه‌ها را انتخاب کن.', 'mouse-pointer-click');
      if (window.gsap && !DPA.env.reduced) {
        gsap.fromTo(stage, { x: 0 }, { x: 7, duration: .07, repeat: 4, yoyo: true, ease: 'none', clearProps: 'x' });
      }
      return;
    }
    if (qi < A.questions.length - 1) { go(qi + 1, 1); return; }
    finish();
  }

  function finish() {
    if (busy) return;
    busy = true;
    const btn = qs('[data-next]', stage);
    if (btn) btn.classList.add('is-loading');
    const analysis = DPA.engine.compute(A, answers);
    const { key } = DPA.engine.determineProfile(A, analysis);
    DPA.engine.saveResult(A.id, key, analysis);
    DPA.engine.clearProgress(A.id);
    setTimeout(() => { window.location.href = `result.html?id=${A.id}`; }, 650);
  }

  /* ---------- کیبورد ---------- */
  document.addEventListener('keydown', (e) => {
    if (busy) return;
    if (['1', '2', '3', '4'].includes(e.key)) {
      const oi = +e.key - 1;
      if (oi < A.questions[current].options.length) select(current, oi);
    } else if (e.key === 'Enter') {
      next(current);
    } else if (e.key === 'ArrowLeft') { /* در RTL چپ یعنی جلو */
      if (answers[current] != null && current < A.questions.length - 1) go(current + 1, 1);
    } else if (e.key === 'ArrowRight') {
      if (current > 0) go(current - 1, -1);
    }
  });

  qs('[data-exit]', shell).addEventListener('click', () => {
    save(current);
    window.location.href = 'assessments.html';
  });

  /* شروع */
  renderQuestion(current, 1);
  /* پیشرفت اولیه */
  fill.style.width = (current / A.questions.length) * 100 + '%';
})();
