/* Shared layout and page rendering. All content lives in /data/*.json */
const NAV = [
  ['index.html', 'Home', 'home'],
  ['research.html', 'Research', 'research'],
  ['publications.html', 'Publications', 'publications'],
  ['tools.html', 'Tools', 'tools'],
  ['teaching.html', 'Teaching', 'teaching'],
  ['spotlight.html', 'Spotlight', 'spotlight'],
  ['about.html', 'About', 'about']
];
const ME = /\b(Biru, Moges Kidane|Biru, Moges K|Biru, M\.K\.|Biru, M\.K|Kidane, Moges|Kidane, M\.|Moges, Kidane|Biru, Moges)\b/g;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const cache = {};
const page = document.body.dataset.page;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const month = d => { if (!d) return ''; const [y, m] = String(d).split('-'); return m ? `${MONTHS[+m - 1]} ${y}` : y; };
const load = name => cache[name] || (cache[name] = fetch(`data/${name}.json`, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(name); return r.json(); }));
const $ = (sel, root = document) => root.querySelector(sel);
const scholarSearch = t => `https://scholar.google.com/scholar?q=${encodeURIComponent('"' + t + '"')}`;

async function layout() {
  const site = await load('site');
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `<div class="wrap">
    <a class="wordmark" href="index.html">${esc(site.name)}</a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Main">
      ${NAV.filter(n => n[2] !== 'home').map(([h, l, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
      <a class="btn btn-hemp" href="${esc(site.cv_file)}" download><i class="ti ti-download" aria-hidden="true"></i>Download CV</a>
    </nav></div>`;
  document.body.prepend(header);
  const skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
  document.body.prepend(skip);
  const btn = $('.menu-toggle', header), nav = $('#nav', header);
  btn.addEventListener('click', () => { const o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
  if (page === 'home') {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.45);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  const L = site.links;
  footer.innerHTML = `<div class="wrap">
    <div><b>&copy; ${new Date().getFullYear()} ${esc(site.name)}</b><br>${esc(site.lab)}, ${esc(site.department)}, ${esc(site.institution)}</div>
    <div style="text-align:right"><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><br>
    ${[[L.scholar, 'Google Scholar'], [L.orcid, 'ORCID'], [L.linkedin, 'LinkedIn'], [L.researchgate, 'ResearchGate']].filter(x => x[0]).map(([u, l]) => `<a href="${esc(u)}">${l}</a>`).join(' &nbsp; ')}
    &nbsp; <a href="credits.html">Credits</a></div></div>`;
  document.body.append(footer);
  return site;
}

function newsCard(n) {
  const ph = n.image ? `<div class="ph${/cover-/.test(n.image) ? ' cov' : ''}"><img src="${esc(n.image)}" alt="" loading="lazy"></div>` : `<div class="ph empty">${esc(n.category)}</div>`;
  return `<a class="card" href="article.html#${encodeURIComponent(n.id)}">${ph}
    <div class="body"><div class="meta"><span class="tag">${esc(n.category)}</span><span>${n.journal ? esc(n.journal) : month(n.date)}</span></div>
    <h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p></div></a>`;
}
const byDate = (a, b) => String(b.date).localeCompare(String(a.date));

async function renderSpotlights() {
  const box = $('#spotlights'); if (!box) return;
  const d = await load('spotlights');
  box.innerHTML = d.items.map((sp, k) => `<article class="spot" id="${esc(sp.id)}">
    <div class="spot-top">
      <div class="slides" data-k="${k}" aria-roledescription="carousel" aria-label="${esc(sp.title)} photos">
        ${sp.photos.map((ph, i) => `<figure class="slide${i === 0 ? ' on' : ''}" aria-hidden="${i !== 0}">
          <img src="${esc(ph.src)}" alt="${esc(ph.caption)}" loading="${i === 0 ? 'eager' : 'lazy'}"><figcaption>${esc(ph.caption)}</figcaption></figure>`).join('')}
        ${sp.map_embed ? `<figure class="slide map-slide" aria-hidden="true"><iframe src="${esc(sp.map_embed)}" title="Map: ${esc(sp.place)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><figcaption>${esc(sp.map_caption || sp.place)}</figcaption></figure>` : ''}
        <button class="nav-btn prev" type="button" aria-label="Previous photo"><i class="ti ti-chevron-left" aria-hidden="true"></i></button>
        <button class="nav-btn next" type="button" aria-label="Next photo"><i class="ti ti-chevron-right" aria-hidden="true"></i></button>
        <div class="dots">${[...sp.photos, ...(sp.map_embed ? [1] : [])].map((_, i) => `<span class="${i === 0 ? 'on' : ''}"></span>`).join('')}</div>
      </div>
      <div class="spot-text">
        <p class="spot-meta">${esc(sp.place)} &nbsp;|&nbsp; ${esc(sp.date)}</p>
        <h3>${esc(sp.title)}</h3>
        <p>${esc(sp.summary)}</p>
        <ul class="roles">${sp.roles.map(r => `<li><i class="ti ${esc(r.icon)}" aria-hidden="true"></i><span><b>${esc(r.label)}</b>${esc(r.detail)}</span></li>`).join('')}</ul>
        ${sp.paper_link ? `<a class="btn btn-primary" href="${esc(sp.paper_link)}"><i class="ti ti-file-text" aria-hidden="true"></i>See the presentation</a>` : ''}
      </div>
    </div>
  </article>`).join('');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.querySelectorAll('.slides').forEach(el => {
    const slides = [...el.querySelectorAll('.slide')], dots = [...el.querySelectorAll('.dots span')];
    let i = 0, timer = null;
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, j) => { s.classList.toggle('on', j === i); s.setAttribute('aria-hidden', j !== i); });
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
    };
    const play = () => { if (!reduce) { clearInterval(timer); timer = setInterval(() => show(i + 1), 4500); } };
    el.querySelector('.prev').onclick = () => { show(i - 1); play(); };
    el.querySelector('.next').onclick = () => { show(i + 1); play(); };
    el.addEventListener('mouseenter', () => clearInterval(timer));
    el.addEventListener('focusin', () => clearInterval(timer));
    el.addEventListener('mouseleave', play);
    play();
  });
}

/* ---------- pages ---------- */
const PAGES = {
  async home(site) {
    $('#h-name').textContent = site.name;
    $('#h-tagline').textContent = site.tagline;
    $('#h-role').textContent = 'PhD Candidate | Soil, Water, and Ecosystem Sciences';
    $('#h-headline').textContent = site.headline;
    $('#h-scholar').href = site.links.scholar;

    const papers = (await load('news')).items.filter(n => n.home).slice(0, 4);
    $('#updates').innerHTML = papers.map(n => `<article class="paper">
      <div class="cov${/cover-cee/.test(n.image) ? ' sq' : ''}">${n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy">` : ''}</div>
      <div class="body"><div class="jr">${esc(n.journal)}</div>
      <h3><a href="article.html#${encodeURIComponent(n.id)}">${esc(n.title)}</a></h3>
      <p>${esc(n.summary)}</p>
      ${n.link ? `<a class="read" href="${esc(n.link)}">Read the paper <i class="ti ti-arrow-up-right" aria-hidden="true"></i></a>` : ''}</div></article>`).join('');

    const m = site.metrics;
    $('#asof').textContent = `Google Scholar, ${m.as_of}`;
    $('#stats').innerHTML = [[m.citations, 'Citations'], [m.h_index, 'h-index'], [m.i10_index, 'i10-index'], [m.papers, 'Peer-reviewed papers']]
      .map(([v, l]) => `<div class="stat"><b>${esc(v)}</b><span>${l}</span></div>`).join('');
    const L = site.links;
    $('#profiles').innerHTML = [[L.scholar, 'ti-school', 'Google Scholar'], [L.orcid, 'ti-id', 'ORCID'], [L.linkedin, 'ti-brand-linkedin', 'LinkedIn'], [L.researchgate, 'ti-flask', 'ResearchGate'], [L.github, 'ti-brand-github', 'GitHub']]
      .filter(x => x[0]).map(([u, i, l]) => `<a href="${esc(u)}"><i class="ti ${i}" aria-hidden="true"></i>${l}</a>`).join('');

    $('#collab').textContent = site.collab;
    $('#contact-list').innerHTML = `
      <li><i class="ti ti-mail" aria-hidden="true"></i><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      <li><i class="ti ti-building" aria-hidden="true"></i><span>${esc(site.lab)}<br>${esc(site.department)}, ${esc(site.institution)}</span></li>`;
    $('#place').innerHTML = `
      <figure><img src="${esc(site.building_photo)}" alt="McCarty Hall, University of Florida" loading="lazy"><figcaption>${esc(site.building_credit)}</figcaption></figure>
      <iframe src="${esc(site.map_embed)}" title="Map of McCarty Hall, University of Florida" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div class="addr"><span><b>${esc(site.office)}</b><br>${esc(site.address)}</span>
      <a class="btn btn-line" href="${esc(site.map_url)}"><i class="ti ti-map" aria-hidden="true"></i>Open in Google Maps</a></div>`;
  },

  async research() {
    const d = await load('research');
    $('#lede').textContent = d.intro;
    if (window.L && d.sites && $('#sites-map')) {
      const map = L.map('sites-map', { scrollWheelZoom: false, worldCopyJump: true }).setView([12, -20], 2);
      const viirs = L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2025-12-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
        { maxZoom: 9, attribution: 'Imagery: <a href="https://earthdata.nasa.gov/gibs">NASA EOSDIS GIBS</a>' }).addTo(map);
      const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
      L.control.layers({ 'Satellite (NASA VIIRS)': viirs, 'Streets (OpenStreetMap)': osm }).addTo(map);
      let fell = false;
      viirs.on('tileerror', () => { if (fell) return; fell = true; map.removeLayer(viirs); osm.addTo(map); });
      d.sites.forEach(x => L.circleMarker([x.lat, x.lon], { radius: 9, color: '#fff', weight: 2, fillColor: '#E2B007', fillOpacity: 1 })
        .addTo(map).bindPopup(`<b>${esc(x.name)}</b><br>${esc(x.detail)}<br><a href="${esc(x.earth)}">Open in Google Earth</a>`));
    }
    $('#themes').innerHTML = d.themes.map(t => `<div class="theme" id="${esc(t.id)}">
      <div><h2>${esc(t.title)}</h2><p class="sum">${esc(t.summary)}</p>
        ${t.image ? `<figure><img src="${esc(t.image)}" alt="${esc(t.caption)}" loading="lazy"><figcaption>${esc(t.caption)}</figcaption></figure>` : ''}</div>
      <div>${t.projects.map(p => `<article class="project">
        <h3>${esc(p.title)}<span class="status ${esc(p.status)}">${esc(p.status)}</span></h3>
        <div class="facts"><span><i class="ti ti-calendar" aria-hidden="true"></i>${esc(p.period)}</span>
        <span><i class="ti ti-map-pin" aria-hidden="true"></i>${esc(p.region)}</span>
        <span><i class="ti ti-user" aria-hidden="true"></i>${esc(p.role)}</span>
        ${p.partners ? `<span><i class="ti ti-users" aria-hidden="true"></i>${esc(p.partners)}</span>` : ''}</div>
        <p>${esc(p.summary)}</p></article>`).join('')}</div></div>`).join('');
  },

  async publications(site) {
    const d = await load('publications');
    const L = site.links;
    $('#pub-links').innerHTML = [[L.scholar, 'ti-school', 'Google Scholar'], [L.researchgate, 'ti-flask', 'ResearchGate'], [L.orcid, 'ti-id', 'ORCID']]
      .filter(x => x[0]).map(([u, i, l]) => `<a href="${esc(u)}"><i class="ti ${i}" aria-hidden="true"></i>${l}</a>`).join('');
    const GROUP = { 'Soil health': 'Soil health', 'Digital soil mapping': 'DSM', 'Land use and watersheds': 'LULC & watershed management' };
    const group = p => GROUP[p.theme] || 'Others';
    const link = p => p.doi || scholarSearch(p.title);
    const authors = a => esc(a).replace(ME, '<strong>$1</strong>');
    const cite = p => `${esc(p.citation)}${p.year ? ` (${p.year})` : ''}`;
    $('#featured').innerHTML = d.items.filter(p => p.featured)
      .sort((a, b) => (/^Biru/.test(b.authors) - /^Biru/.test(a.authors)) || b.year - a.year)
      .map(p => `<a class="feat" href="${esc(link(p))}"><span class="t">${esc(p.title)}</span>
        <span class="j">${cite(p)}</span><span class="go">Read the paper <i class="ti ti-arrow-up-right" aria-hidden="true"></i></span></a>`).join('');

    const groups = ['All', 'Soil health', 'DSM', 'LULC & watershed management', 'Others'];
    let sort = 'new', g = 'All';
    $('#themes').innerHTML = groups.map(t => `<button type="button" aria-pressed="${t === 'All'}" data-t="${esc(t)}">${esc(t)}</button>`).join('');
    const hasCites = d.items.some(p => typeof p.citations === 'number');
    const item = p => `<li><a class="t" href="${esc(link(p))}">${esc(p.title)}</a>
      <div class="ind"><div class="a">${authors(p.authors)}</div><div class="j">${cite(p)}${typeof p.citations === 'number' ? ` &middot; ${p.citations} citations` : ''}</div></div></li>`;
    const render = () => {
      let list = d.items.filter(p => g === 'All' || group(p) === g);
      list = (sort === 'cited' && hasCites) ? list.slice().sort((a, b) => (b.citations ?? -1) - (a.citations ?? -1)) : list.slice().sort((a, b) => b.year - a.year);
      $('#list').innerHTML = list.map(item).join('');
      $('#count').textContent = `${list.length} ${list.length === 1 ? 'paper' : 'papers'}`;
    };
    document.querySelectorAll('#sort button').forEach(b => b.addEventListener('click', () => {
      sort = b.dataset.s;
      document.querySelectorAll('#sort button').forEach(x => x.setAttribute('aria-pressed', x === b));
      $('#cite-note').style.display = (sort === 'cited' && !hasCites) ? 'block' : 'none';
      render();
    }));
    $('#themes').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      g = b.dataset.t;
      document.querySelectorAll('#themes button').forEach(x => x.setAttribute('aria-pressed', x === b));
      render();
    });
    render();
    $('#review').innerHTML = d.under_review.map(p => `<li><span class="t">${esc(p.title)}</span>
      <div class="ind"><div class="a">${authors(p.authors)}</div><div class="j">${esc(p.journal)}, under review</div></div></li>`).join('');
  },

  async tools() {
    const d = await load('tools');
    $('#tools').innerHTML = d.items.map(t => `<div class="tool" id="${esc(t.id)}">
      <div><h2>${esc(t.name)} <span class="status ${esc(t.status)}">${esc(t.status)}</span></h2>
        <p class="sub">${esc(t.subtitle)}</p>
        <h3>What it is</h3><p>${esc(t.what)}</p>
        <h3>Why it exists</h3><p>${esc(t.why)}</p>
        <h3>How to use it</h3><ol class="steps">${t.how.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        <p style="margin-top:20px;font-size:14px;color:var(--muted)">${esc(t.note)}</p>
        ${t.url ? `<a class="btn btn-hemp" href="${esc(t.url)}"><i class="ti ti-external-link" aria-hidden="true"></i>Open ${esc(t.name)}</a>` : ''}
      </div>
      <div class="shot"><div class="bar"><i></i><i></i><i></i></div>
        ${t.image ? `<img src="${esc(t.image)}" alt="${esc(t.name)} screenshot">`
          : `<div class="screen">Screenshot of ${esc(t.name)} goes here</div>`}
      </div></div>`).join('');
    if (d.code && d.code.length) $('#tools').insertAdjacentHTML('beforeend', `<section style="padding:56px 0 0"><h2>Code</h2>
      <p class="lede">Open code behind the papers, on GitHub.</p><div class="code">${d.code.map(c => `<a href="${esc(c.url)}">
      <b><i class="ti ti-brand-github" aria-hidden="true"></i>${esc(c.name)}</b><p>${esc(c.description)}</p></a>`).join('')}</div></section>`);
  },

  async teaching() {
    const d = await load('teaching');
    $('#lede').textContent = d.intro;
    $('#timeline').innerHTML = d.roles.map(r => `<li class="${/Ethiopia/.test(r.place) ? 'eth' : ''}">
      <div class="when">${esc(r.period)}</div><div class="where">${esc(r.place)}</div>
      <h3>${esc(r.title)}</h3><p>${esc(r.detail)}</p></li>`).join('');
    $('#courses').innerHTML = d.courses_taught.map(c => `<span>${esc(c)}</span>`).join('');
    $('#mentoring').textContent = d.mentoring;
    $('#training').innerHTML = d.training.map(t => `<div><i class="ti ${esc(t.icon)}" aria-hidden="true"></i><h3>${esc(t.title)}</h3><p>${esc(t.detail)}</p></div>`).join('');
  },

  async about(site) {
    const d = await load('about');
    $('#portrait').src = d.portrait;
    $('#bio').innerHTML = d.bio.map(p => `<p>${esc(p)}</p>`).join('');
    $('#expertise').innerHTML = (d.expertise || []).map(e => `<span>${esc(e)}</span>`).join('');
    $('#quick').innerHTML = `
      <li><i class="ti ti-mail" aria-hidden="true"></i><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      ${site.phone ? `<li><i class="ti ti-phone" aria-hidden="true"></i><a href="tel:${esc(site.phone.replace(/[^+\d]/g, ''))}">${esc(site.phone)}</a></li>` : ''}
      <li><i class="ti ti-building" aria-hidden="true"></i><span>${esc(site.office)}<br>${esc(site.department)}<br>${esc(site.institution)}</span></li>
      <li><i class="ti ti-brand-linkedin" aria-hidden="true"></i><a href="${esc(site.links.linkedin)}">LinkedIn</a></li>`;
    const row = (y, main, sub) => `<li><span class="y">${esc(y)}</span><span><b>${esc(main)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></li>`;
    $('#education').innerHTML = d.education.map(e => row(e.period, e.degree, `${e.place}. ${e.note}`)).join('');
    $('#leadership').innerHTML = d.leadership.map(e => row(e.period, e.title, `${e.place}. ${e.note}`)).join('');
    $('#awards').innerHTML = d.awards.map(a => row(a.year, a.title, a.org)).join('');
    $('#certificates').innerHTML = d.certificates.map(a => row(a.year, a.title, a.org)).join('');
    $('#service').innerHTML = d.service.map(s => `<li>${esc(s)}</li>`).join('');
    $('#affiliations').innerHTML = d.affiliations.map(s => `<li>${esc(s)}</li>`).join('');
  },

  async spotlight() { await renderSpotlights(); },

  async credits() {
    const d = await load('credits');
    $('#credits').innerHTML = d.items.map(c => `<tr><td>${esc(c.what)}</td><td>${esc(c.where)}</td>
      <td>${esc(c.source)}${c.url ? ` <a href="${esc(c.url)}">Link</a>` : ''}</td><td>${esc(c.license)}</td></tr>`).join('');
  },

  async news() {
    const items = (await load('news')).items.slice().sort(byDate);
    const per = 6; let pg = 0; const pages = Math.max(1, Math.ceil(items.length / per));
    const render = () => {
      $('#news').innerHTML = items.slice(pg * per, pg * per + per).map(newsCard).join('');
      $('#pg').textContent = `Page ${pg + 1} of ${pages}`;
      $('#prev').disabled = pg === 0; $('#next').disabled = pg >= pages - 1;
    };
    $('#prev').onclick = () => { pg--; render(); window.scrollTo(0, 0); };
    $('#next').onclick = () => { pg++; render(); window.scrollTo(0, 0); };
    render();
  },

  async article() {
    const items = (await load('news')).items.slice().sort(byDate);
    const id = decodeURIComponent(location.hash.slice(1)) || new URLSearchParams(location.search).get('id');
    const i = items.findIndex(n => n.id === id);
    if (i < 0) { $('#article').innerHTML = '<h1>Update not found</h1><p>This update may have been moved. <a href="news.html">See all updates</a>.</p>'; return; }
    const n = items[i];
    document.title = `${n.title} | Moges Kidane Biru`;
    $('#article').innerHTML = `<a class="back" href="news.html">All updates</a>
      <div class="meta"><span class="tag">${esc(n.category)}</span><span>${month(n.date)}</span></div>
      <h1 style="font-size:clamp(32px,4vw,46px)">${esc(n.title)}</h1>
      ${n.image ? `<img class="${/cover-/.test(n.image) ? 'cover' : ''}" src="${esc(n.image)}" alt="">` : ''}
      <div class="content">${n.body}</div>
      ${n.journal ? `<p style="color:var(--muted);font-size:15px">${esc(n.journal)}</p>` : ''}
      ${n.link ? `<p><a class="btn btn-primary" href="${esc(n.link)}"><i class="ti ti-external-link" aria-hidden="true"></i>${n.category === 'Publication' ? 'Read the paper' : 'Read more'}</a></p>` : ''}
      <div class="pager">
        ${items[i + 1] ? `<a href="article.html#${encodeURIComponent(items[i + 1].id)}">Previous update</a>` : ''}
        ${items[i - 1] ? `<a href="article.html#${encodeURIComponent(items[i - 1].id)}">Next update</a>` : ''}
      </div>`;
  }
};

window.addEventListener('hashchange', () => { if (page === 'article') PAGES.article(); });
layout().then(site => PAGES[page] && PAGES[page](site)).catch(err => {
  console.error(err);
  const m = document.getElementById('main');
  if (m) m.insertAdjacentHTML('afterbegin', '<div class="wrap"><p class="notice" style="display:block">Content could not load. If you opened this file directly, run it through a web server.</p></div>');
});
