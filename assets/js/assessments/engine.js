/* ==========================================================================
   موتور آزمون — امتیازدهی، تحلیل و ذخیره‌سازی (localStorage)
   ----------------------------------------------------------------------------
   این لایه از رابط کاربری کاملاً جدا است:
   • compute(assessment, answers)  → تحلیل قطعی از پاسخ‌ها
   • determineProfile              → انتخاب پروفایل با الگوریتم خود آزمون
   ذخیره‌سازی:
   • dpa_progress_<id>   { answers, current, ts }   ادامهٔ آزمون نیمه‌تمام
   • dpa_result_<id>     { profileKey, scores, ts } نتیجهٔ نهایی
   ========================================================================== */
window.DPA = window.DPA || {};
DPA.engine = (function () {
  'use strict';

  const KEYS = {
    progress: (id) => `dpa_progress_${id}`,
    result: (id) => `dpa_result_${id}`
  };

  function safeParse(json, fallback) {
    try { return JSON.parse(json) || fallback; } catch (e) { return fallback; }
  }

  /* ---------- امتیازدهی ---------- */
  function compute(assessment, answers) {
    /* answers: آرایهٔ اندیس گزینهٔ انتخاب‌شده (یا null) */
    const scores = {};
    assessment.dimensions.forEach((d) => { scores[d.key] = 0; });
    let answered = 0;

    assessment.questions.forEach((q, qi) => {
      const optIdx = answers[qi];
      if (optIdx == null) return;
      const opt = q.options[optIdx];
      if (!opt || !opt.scores) return;
      answered++;
      Object.keys(opt.scores).forEach((k) => {
        scores[k] = (scores[k] || 0) + opt.scores[k];
      });
    });

    /* بیشینهٔ هر بعد: مجموع بزرگ‌ترین وزنی که یک گزینهٔ هر سؤال به آن می‌دهد */
    const maxes = {};
    assessment.dimensions.forEach((d) => { maxes[d.key] = 0; });
    assessment.questions.forEach((q) => {
      assessment.dimensions.forEach((d) => {
        const best = Math.max(0, ...q.options.map((o) => (o.scores && o.scores[d.key]) || 0));
        maxes[d.key] += best;
      });
    });

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxTotal = assessment.questions.length
      ? Math.max(...assessment.questions.map((q) =>
          Math.max(...q.options.map((o) => Object.values(o.scores || {}).reduce((a, b) => a + b, 0)))))
      : 1;

    return { scores, maxes, answered, total, maxTotal, answers: answers.slice() };
  }

  function determineProfile(assessment, analysis) {
    const key = assessment.determine(analysis);
    return { key, profile: assessment.profiles[key] || null };
  }

  /* بیشینهٔ هر بعد (مستقل از پاسخ‌ها — برای صفحهٔ نتیجه) */
  function dimensionMax(assessment) {
    const maxes = {};
    assessment.dimensions.forEach((d) => { maxes[d.key] = 0; });
    assessment.questions.forEach((q) => {
      assessment.dimensions.forEach((d) => {
        const best = Math.max(0, ...q.options.map((o) => (o.scores && o.scores[d.key]) || 0));
        maxes[d.key] += best;
      });
    });
    return maxes;
  }

  /* ---------- ذخیره‌سازی ---------- */
  function saveProgress(id, answers, current) {
    try {
      localStorage.setItem(KEYS.progress(id), JSON.stringify({ answers, current, ts: Date.now() }));
    } catch (e) { /* حالت خصوصی مرورگر */ }
  }

  function getProgress(id) {
    try {
      const p = safeParse(localStorage.getItem(KEYS.progress(id)), null);
      if (!p || !Array.isArray(p.answers)) return null;
      p.answers = p.answers.map((a) => (typeof a === 'number' ? a : null));
      return p;
    } catch (e) { return null; }
  }

  function clearProgress(id) {
    try { localStorage.removeItem(KEYS.progress(id)); } catch (e) {}
  }

  function saveResult(id, profileKey, analysis) {
    try {
      localStorage.setItem(KEYS.result(id), JSON.stringify({
        profileKey, scores: analysis.scores, ts: Date.now()
      }));
    } catch (e) {}
  }

  function getResult(id) {
    try { return safeParse(localStorage.getItem(KEYS.result(id)), null); } catch (e) { return null; }
  }

  function clearResult(id) {
    try { localStorage.removeItem(KEYS.result(id)); } catch (e) {}
  }

  /* برای «آزمون دوباره»: همه‌چیز پاک شود */
  function resetAssessment(id) {
    clearProgress(id);
    clearResult(id);
  }

  /* ---------- وضعیت کامل کاربر (برای فهرست آزمون‌ها) ---------- */
  function listStates() {
    return DPA.assessments._all().map((a) => {
      const progress = getProgress(a.id);
      const result = getResult(a.id);
      return {
        id: a.id,
        started: !!(progress && progress.answers.some((x) => x != null)),
        answered: progress ? progress.answers.filter((x) => x != null).length : 0,
        current: progress ? progress.current : 0,
        completed: !!result
      };
    });
  }

  return {
    compute, determineProfile, dimensionMax,
    saveProgress, getProgress, clearProgress,
    saveResult, getResult, clearResult, resetAssessment,
    listStates
  };
})();
