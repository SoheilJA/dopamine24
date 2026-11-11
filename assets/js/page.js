/* ==========================================================================
   رندر صفحات داخلی — داده‌محور
   دپارتمان‌ها، خدمات، درباره/تیم، وبلاگ/مقاله، تماس، مشاوره
   ========================================================================== */
(function () {
  'use strict';
  const { qs, qsa, faNum, escapeHtml, icon, colorVars } = DPA.utils;

  /* ================= خدمات ================= */
  function renderServices() {
    const grid = qs('[data-services-grid]');
    if (!grid) return;
    grid.innerHTML = Object.values(DPA.site.departments).map((d) => `
      <article class="card card--hover dept-card" style="${colorVars(d.color)}" data-reveal>
        <div class="card__icon">${icon(d.icon)}</div>
        <h3 class="card__title">${escapeHtml(d.title)}</h3>
        <p class="card__text">${escapeHtml(d.desc.split('؛')[0].split('. ')[0])}.</p>
        <a class="card__link" href="${d.file}">صفحهٔ دپارتمان ${icon('arrow-left')}</a>
      </article>`).join('');
  }

  /* ================= صفحات دپارتمان ================= */
  function renderDept() {
    const root = qs('[data-dept]');
    if (!root) return;
    const d = DPA.site.departments[root.dataset.dept];
    if (!d) return;

    document.title = `${d.title} — دوپامین`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', d.desc.slice(0, 155));

    const feats = d.features.map((f) => `
      <article class="card card--hover feature-card" style="${colorVars(d.color)}" data-reveal>
        <div class="card__icon">${icon(f.icon)}</div>
        <h3 class="card__title" style="font-size:1.06rem">${escapeHtml(f.title)}</h3>
        <p class="card__text">${escapeHtml(f.desc)}</p>
      </article>`).join('');

    root.innerHTML = `
      <header class="page-hero">
        <div class="container">
          <nav class="breadcrumb" aria-label="مسیر">
            <a href="index.html">خانه</a> ${icon('chevron-left')}
            <a href="services.html">خدمات</a> ${icon('chevron-left')}
            <b>${escapeHtml(d.short)}</b>
          </nav>
          <span class="kicker" data-reveal><span class="dot"></span> ${escapeHtml(d.kicker)}</span>
          <h1 style="font-size:var(--fs-h1);margin-top:14px;max-width:22ch" data-reveal data-delay=".06">${escapeHtml(d.title)}</h1>
          <p class="lead section-sub" style="margin-top:14px" data-reveal data-delay=".12">${escapeHtml(d.desc)}</p>
          ${d.intro ? `<p class="section-sub" data-reveal data-delay=".16" style="color:var(--ink-2)">${escapeHtml(d.intro)}</p>` : ''}
        </div>
      </header>

      <section class="section section--tight">
        <div class="container">
          <div class="grid ${d.features.length > 4 ? 'grid-3' : 'grid-3'}" data-reveal-group>${feats}</div>
        </div>
      </section>

      <section class="section section--tight" style="padding-top:0">
        <div class="container">
          <div class="dept-cta" data-reveal style="${colorVars(d.color)}">
            <div class="dept-cta__text">
              <h2 style="font-size:1.4rem">${escapeHtml(d.cta.title)}</h2>
              <p style="color:var(--ink-2)">${escapeHtml(d.cta.desc)}</p>
            </div>
            <a class="btn btn--primary btn--lg" href="${d.cta.href}">اقدام کنید ${icon('arrow-left', 'icon--arrow')}</a>
          </div>
        </div>
      </section>`;
    DPA.icons();
  }

  /* ================= درباره: تایم‌لاین + تیم ================= */
  function renderStory() {
    const root = qs('[data-story]');
    if (!root) return;
    root.innerHTML = DPA.site.story.map((s) => `
      <div class="story-item" data-reveal>
        ${s.year ? `<span class="story-item__year">${escapeHtml(s.year)}</span>` : ''}
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.desc)}</p>
      </div>`).join('');
  }

  function teamCard(m) {
    return `
      <article class="team-card" data-reveal>
        <div class="ph"><img src="${m.photo}" alt="${escapeHtml(m.name)} — ${escapeHtml(m.role)}" loading="lazy"></div>
        <div class="info">
          <b>${escapeHtml(m.name)}</b>
          <span class="role">${escapeHtml(m.role)}</span>
          ${m.cred ? `<span class="cred">${escapeHtml(m.cred)}</span>` : ''}
        </div>
      </article>`;
  }

  function renderTeam() {
    const root = qs('[data-team]');
    if (!root) return;
    root.innerHTML = `
      <div class="section-head" style="margin-bottom:26px">
        <span class="kicker kicker--gold" data-reveal><span class="dot"></span> تیم دوپامین</span>
        <h2 class="section-title" data-reveal data-delay=".06">تیم مدیریتی و اجرایی</h2>
      </div>
      <div class="grid grid-3" data-reveal-group>${DPA.site.team.managers.map(teamCard).join('')}</div>
      <div class="section-head" style="margin:52px 0 26px">
        <h2 class="section-title" data-reveal>مشاورین و درمانگران</h2>
      </div>
      <div class="grid grid-3" data-reveal-group>${DPA.site.team.consultants.map(teamCard).join('')}</div>`;
  }

  /* ================= وبلاگ ================= */
  function renderBlogList() {
    const root = qs('[data-blog-list]');
    if (!root) return;
    const posts = DPA.site.posts;
    const [first, ...rest] = posts;
    root.innerHTML = `
      <a class="blog-featured" href="article.html?id=${first.id}" data-reveal>
        <div class="media"><img src="${first.cover}" alt="${escapeHtml(first.title)}" loading="lazy"></div>
        <div class="body">
          <span class="chip chip--${first.color}">${escapeHtml(first.tag)}</span>
          <h2 style="font-size:clamp(1.3rem,2.4vw,1.9rem)">${escapeHtml(first.title)}</h2>
          <p class="section-sub">${escapeHtml(first.excerpt)}</p>
          <span style="display:inline-flex;align-items:center;gap:8px;font-weight:700;color:var(--brand)">خواندن مقاله ${icon('arrow-left')}</span>
        </div>
      </a>
      <div class="posts-grid" style="margin-top:26px">
        ${rest.map((p, i) => `
          <article class="card card-media card--hover post-card" data-reveal data-delay="${i * .05}">
            <a class="media" href="article.html?id=${p.id}">
              <img src="${p.cover}" alt="${escapeHtml(p.title)}" loading="lazy">
              <span class="chip chip--${p.color}">${escapeHtml(p.tag)}</span>
            </a>
            <div class="body">
              <h3><a href="article.html?id=${p.id}">${escapeHtml(p.title)}</a></h3>
              <p>${escapeHtml(p.excerpt)}</p>
              <div class="meta"><span>${icon('calendar')} ${escapeHtml(p.date)}</span><span>${icon('arrow-left')} خواندن مطلب</span></div>
            </div>
          </article>`).join('')}
      </div>`;
    DPA.icons();
  }

  function renderArticle() {
    const root = qs('[data-article]');
    if (!root) return;
    /* id از پارامتر آدرس یا مقدار ثابت صفحه (دوپاتریپ/دوپاواک) */
    const id = root.dataset.fixedPost || new URLSearchParams(location.search).get('id');
    const p = DPA.site.posts.find((x) => x.id === id) || DPA.site.posts[0];
    document.title = `${p.title} — دوپامین`;

    /* در صفحات برنامه‌های ویژه، تیتر برنامه‌ای نمایش داده می‌شود */
    const isProgram = !!root.dataset.fixedPost;

    const themes = (p.themes || []).map((t) => `
      <div class="article-theme" data-reveal>
        <b>${escapeHtml(t.title)}</b>
        <span class="sub">${escapeHtml(t.sub)}</span>
        <p>${escapeHtml(t.desc)}</p>
      </div>`).join('');

    const related = DPA.site.posts.filter((x) => x.id !== p.id).slice(0, 3);

    root.innerHTML = `
      <header class="page-hero">
        <div class="container">
          <nav class="breadcrumb" aria-label="مسیر">
            <a href="index.html">خانه</a> ${icon('chevron-left')}
            <a href="blog.html">وبلاگ</a> ${icon('chevron-left')}
            <b>${escapeHtml(p.tag)}</b>
          </nav>
          <span class="chip chip--${p.color}" data-reveal>${escapeHtml(p.tag)}</span>
          <h1 style="font-size:var(--fs-h1);margin-top:16px;max-width:24ch" data-reveal data-delay=".06">${escapeHtml(p.title)}</h1>
          <div class="flex gap-4 wrap muted small" style="margin-top:14px" data-reveal data-delay=".12">
            <span>${icon('calendar')} ${escapeHtml(p.date)}</span>
            <span>${icon('clock')} ${faNum(3)} دقیقه مطالعه</span>
          </div>
        </div>
      </header>

      <div class="container" style="padding-bottom:clamp(30px,5vw,60px)">
        <figure class="article-cover" data-reveal>
          <img src="${p.cover}" alt="${escapeHtml(p.title)}">
        </figure>

        <div class="article-body" style="margin-top:clamp(26px,4vw,44px)">
          <p class="lead" data-reveal>${escapeHtml(p.intro)}</p>
          ${themes}
          ${p.closing ? `<div class="final-cta" style="padding:clamp(26px,4vw,48px)" data-reveal>
            <p style="color:var(--bg);font-size:1.15rem;font-weight:700;max-width:none">${escapeHtml(p.closing)}</p>
          </div>` : ''}
        </div>

        <section style="margin-top:clamp(36px,6vw,64px)">
          <div class="section-head"><h2>مطالب مرتبط</h2></div>
          <div class="posts-grid">
            ${related.map((r, i) => `
              <article class="card card-media card--hover post-card" data-reveal data-delay="${i * .05}">
                <a class="media" href="article.html?id=${r.id}">
                  <img src="${r.cover}" alt="${escapeHtml(r.title)}" loading="lazy">
                  <span class="chip chip--${r.color}">${escapeHtml(r.tag)}</span>
                </a>
                <div class="body">
                  <h3><a href="article.html?id=${r.id}">${escapeHtml(r.title)}</a></h3>
                  <p>${escapeHtml(r.excerpt)}</p>
                </div>
              </article>`).join('')}
          </div>
        </section>
      </div>`;
    DPA.icons();
  }

  /* ================= تماس ================= */
  function renderContact() {
    const root = qs('[data-contact]');
    if (!root) return;
    const c = DPA.site.contact;
    root.innerHTML = `
      <div class="contact-cards">
        <div class="contact-card" data-reveal>
          <span class="contact-card__ico">${icon('phone')}</span>
          <div><b>تلفن‌های تماس</b>
            <div class="phones">${c.phones.map((p) => `<a href="tel:${p.tel}" dir="ltr">${escapeHtml(p.label)}</a>`).join('')}</div>
          </div>
        </div>
        <div class="contact-card" data-reveal data-delay=".06">
          <span class="contact-card__ico">${icon('mail')}</span>
          <div><b>ایمیل</b><a href="mailto:${c.email}" dir="ltr">${escapeHtml(c.email)}</a></div>
        </div>
        <div class="contact-card" data-reveal data-delay=".12">
          <span class="contact-card__ico">${icon('map-pin')}</span>
          <div><b>نشانی</b><p>${escapeHtml(c.address)}</p></div>
        </div>
        <div class="contact-card" data-reveal data-delay=".18">
          <span class="contact-card__ico">${icon('clock')}</span>
          <div><b>ساعات پاسخگویی</b><p>${escapeHtml(c.hours)}</p></div>
        </div>
        <div class="contact-card" data-reveal data-delay=".24">
          <span class="contact-card__ico">${icon('share-2')}</span>
          <div><b>شبکه‌های اجتماعی</b>
            <div class="flex gap-3 wrap" style="margin-top:8px">
              ${c.socials.map((s) => `<a class="chip" href="${s.url}" target="_blank" rel="noopener">${icon(s.icon)} ${escapeHtml(s.title)}</a>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
    DPA.icons();
  }

  /* ================= مشاوره (arshad | talent) ================= */
  function renderConsult() {
    const root = qs('[data-consult]');
    if (!root) return;
    const type = root.dataset.consult;
    const isArshad = type === 'arshad';
    const title = isArshad
      ? 'ثبت‌نام جلسهٔ مشاورهٔ فردی ارشد و دکتری رایگان'
      : 'ثبت‌نام جلسهٔ مشاورهٔ فردی استعدادیابی رایگان';
    document.title = `${title} — دوپامین`;

    root.innerHTML = `
      <header class="page-hero" style="padding-bottom:10px">
        <div class="container">
          <nav class="breadcrumb" aria-label="مسیر">
            <a href="index.html">خانه</a> ${icon('chevron-left')}
            <b>${isArshad ? 'مشاورهٔ ارشد و دکتری' : 'مشاورهٔ استعدادیابی'}</b>
          </nav>
          <span class="kicker kicker--mint" data-reveal><span class="dot"></span> رایگان — بدون هزینه</span>
          <h1 style="font-size:var(--fs-h1);margin-top:14px;max-width:20ch" data-reveal data-delay=".06">${title}</h1>
          <p class="lead section-sub" style="margin-top:14px;max-width:62ch" data-reveal data-delay=".12">
            ${isArshad
              ? 'داوطلبان مجموعهٔ روان‌شناسی (وزارت علوم و وزارت بهداشت)، مجموعهٔ مشاوره، علوم شناختی و علوم تربیتی کنکور می‌توانند با ثبت اطلاعات خود از یک جلسهٔ مشاورهٔ فردی رایگان به‌صورت حضوری یا آنلاین (بنا به درخواست شما) بهره‌مند شوند. موعد جلسات بر اساس اولویت ثبت‌نام تعیین می‌شود.'
              : 'برای شناخت استعدادهای خود یا فرزندتان، فرم زیر را تکمیل کنید تا جلسهٔ مشاورهٔ فردی رایگان برای شما هماهنگ شود. موعد جلسات بر اساس اولویت ثبت‌نام تعیین می‌شود.'}
          </p>
        </div>
      </header>

      <section class="section section--tight">
        <div class="container">
          <div class="steps-row" data-reveal-group style="margin-bottom:38px">
            <div class="step-card"><b>فرم را تکمیل کن</b><p>چند دقیقه بیشتر طول نمی‌کشد؛ فقط اطلاعات تماس و زمینهٔ درخواست.</p></div>
            <div class="step-card"><b>هماهنگی زمان</b><p>تیم پشتیبانی دوپامین (۱۰ تا ۱۹) برای تعیین وقت با شما تماس می‌گیرد.</p></div>
            <div class="step-card"><b>جلسهٔ مشاوره</b><p>حضوری در مشهد یا آنلاین — بنا به انتخاب شما عزیزان.</p></div>
          </div>

          <form class="form-card" data-demo novalidate data-reveal>
            <div class="form-grid">
              <div class="field">
                <label for="cf-name">نام و نام خانوادگی</label>
                <input class="input" id="cf-name" name="name" type="text" placeholder="مثلاً سارا محمدی" required>
                <span class="err-msg">لطفاً نام خود را وارد کنید.</span>
              </div>
              <div class="field">
                <label for="cf-phone">شمارهٔ تماس</label>
                <input class="input" id="cf-phone" name="phone" type="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" required>
                <span class="err-msg">شمارهٔ تماس معتبر وارد کنید.</span>
              </div>
              <div class="field">
                <label for="cf-type">نوع جلسه</label>
                <select class="select" id="cf-type" name="type">
                  <option>آنلاین (تلفن یا ویدئو)</option>
                  <option>حضوری — مشهد</option>
                  <option>بنا به پیشنهاد مشاور</option>
                </select>
              </div>
              ${isArshad ? `
              <div class="field">
                <label for="cf-set">مجموعهٔ آزمونی</label>
                <select class="select" id="cf-set" name="set">
                  <option>روان‌شناسی (وزارت علوم)</option>
                  <option>روان‌شناسی (وزارت بهداشت)</option>
                  <option>مشاوره</option>
                  <option>علوم شناختی</option>
                  <option>علوم تربیتی</option>
                </select>
              </div>` : `
              <div class="field">
                <label for="cf-for">مشاوره برای چه کسی است؟</label>
                <select class="select" id="cf-for" name="for">
                  <option>خودم (بزرگسال)</option>
                  <option>فرزندم (کودک ۳ تا ۱۲ سال)</option>
                  <option>فرزندم (نوجوان ۱۲ تا ۱۸ سال)</option>
                </select>
              </div>`}
              <div class="field full">
                <label for="cf-msg">توضیحات (اختیاری)</label>
                <textarea class="textarea" id="cf-msg" name="msg" placeholder="اگر نکته‌ای هست که بهتر است بدانیم، این‌جا بنویسید…"></textarea>
              </div>
            </div>
            <button class="btn btn--primary btn--lg" type="submit" style="justify-self:start">
              ثبت درخواست مشاوره ${icon('arrow-left', 'icon--arrow')}
            </button>
            <p class="hint muted small">اطلاعات شما فقط برای هماهنگی جلسه استفاده می‌شود.</p>
          </form>
        </div>
      </section>`;
    DPA.icons();
  }

  /* ================= اجرا ================= */
  renderServices();
  renderDept();
  renderStory();
  renderTeam();
  renderBlogList();
  renderArticle();
  renderContact();
  renderConsult();
})();
