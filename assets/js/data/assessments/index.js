/* ==========================================================================
   رجیستری آزمون‌ها — ترتیب نمایش و دسترسی یکپارچه
   برای افزودن آزمون جدید: فایل دیتاست بساز، اینجا اضافه کن، تمام.
   رابط کاربری به‌صورت خودکار کارت، معرفی، سؤال‌ها و نتیجه را می‌سازد.
   ========================================================================== */
window.DPA = window.DPA || {};
DPA.assessments = DPA.assessments || {};

DPA.assessments._order = ['disc', 'mbti', 'eq', 'stress', 'learning', 'motivation'];

DPA.assessments._all = function () {
  return DPA.assessments._order
    .filter((id) => DPA.assessments[id])
    .map((id) => DPA.assessments[id]);
};

DPA.assessments._get = function (id) {
  return DPA.assessments[id] || null;
};
