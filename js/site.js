/* Shared layout and page rendering. All content lives in /data/*.json */
const NAV = [
  ['index.html', 'Home', 'home'],
  ['research.html', 'Research', 'research'],
  ['publications.html', 'Publications', 'publications'],
  ['tools.html', 'Tools', 'tools'],
  ['teaching.html', 'Teaching', 'teaching'],
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
    <a class="wordmark" href="index.html">${esc(site.name)}<span>Soil health and geospatial modeling</span></a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Main">
      ${NAV.filter(n => n[2] !== 'home').map(([h, l, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
      <a class="btn btn-primary" href="${esc(site.cv_file)}" download><i class="ti ti-download" aria-hidden="true"></i>Download CV</a>
    </nav></div>`;
  document.body.prepend(header);
  const skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
  document.body.prepend(skip);
  const btn = $('.menu-toggle', header), nav = $('#nav', header);
  btn.addEventListener('click', () => { const o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div class="wrap">
    <div>${esc(site.name)}<br>${esc(site.department)}<br>${esc(site.institution)}</div>
    <div><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><br>
    <a href="${esc(site.links.scholar)}">Google Scholar</a> &nbsp; <a href="${esc(site.links.orcid)}">ORCID</a>
    ${site.links.researchgate ? ` &nbsp; <a href="${esc(site.links.researchgate)}">ResearchGate</a>` : ''}
    ${site.links.linkedin ? ` &nbsp; <a href="${esc(site.links.linkedin)}">LinkedIn</a>` : ''}</div></div>`;
  document.body.append(footer);
  return site;
}

function newsCard(n) {
  const ph = n.image ? `<div class="ph"><img src="${esc(n.image)}" alt="" loading="lazy"></div>` : `<div class="ph empty">${esc(n.category)}</div>`;
  return `<a class="card" href="article.html#${encodeURIComponent(n.id)}">${ph}
    <div class="body"><div class="meta"><span class="tag">${esc(n.category)}</span><span>${month(n.date)}</span></div>
    <h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p></div></a>`;
}
const byDate = (a, b) => String(b.date).localeCompare(String(a.date));

/* ---------- pages ---------- */
const PAGES = {
  async home(site) {
    $('#h-name').textContent = site.name;
    $('#h-role').textContent = site.role;
    $('#h-headline').textContent = site.headline;
    $('#h-cv').href = site.cv_file;
    $('#hero-caption').textContent = site.hero_caption;

    const news = (await load('news')).items.slice().sort(byDate).slice(0, 3);
    $('#updates').innerHTML = news.map(newsCard).join('');

    const m = site.metrics;
    $('#stats').innerHTML = [[m.citations, 'Citations'], [m.h_index, 'h-index'], [m.i10_index, 'i10-index'], [m.papers, 'Peer-reviewed papers']]
      .map(([v, l]) => `<div class="stat"><b>${esc(v)}</b><span>${l}</span></div>`).join('');
    $('#asof').textContent = `Google Scholar, ${m.as_of}.`;
    const L = site.links;
    $('#profiles').innerHTML = [[L.scholar, 'ti-school', 'Google Scholar'], [L.orcid, 'ti-id', 'ORCID'], [L.researchgate, 'ti-flask', 'ResearchGate'], [L.linkedin, 'ti-brand-linkedin', 'LinkedIn']]
      .filter(x => x[0]).map(([u, i, l]) => `<a href="${esc(u)}"><i class="ti ${i}" aria-hidden="true"></i>${l}</a>`).join('');

    $('#contact-list').innerHTML = `
      <li><i class="ti ti-mail" aria-hidden="true"></i><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      <li><i class="ti ti-building" aria-hidden="true"></i><span>${esc(site.department)}<br>${esc(site.institution)}</span></li>`;
    $('#place').innerHTML = `<div class="pin"><i class="ti ti-map-pin" aria-hidden="true"></i><span>McCarty Hall A</span></div>
      <h3>${esc(site.office)}</h3><p>${esc(site.department)}<br>${esc(site.institution)}<br>${esc(site.address)}</p>
      <a class="btn btn-line" href="${esc(site.map_url)}"><i class="ti ti-map" aria-hidden="true"></i>Open in Google Maps</a>`;
  },

  async research() {
    const d = await load('research');
    $('#lede').textContent = d.intro;
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
      .filter(x => x[0]).map(([u, i, l]) => `<a class="btn btn-line" href="${esc(u)}"><i class="ti ${i}" aria-hidden="true"></i>${l}</a>`).join('');
    const link = p => p.doi || scholarSearch(p.title);
    const authors = a => esc(a).replace(ME, '<strong>$1</strong>');
    $('#featured').innerHTML = d.items.filter(p => p.featured).sort((a, b) => (/^Biru/.test(b.authors) - /^Biru/.test(a.authors)) || b.year - a.year).map(p => `<div class="feat">${p.image ? `<div class="fimg"><img src="${esc(p.image)}" alt="" loading="lazy"></div>` : ''}
      <div class="meta"><span class="tag green">${esc(p.theme)}</span><span>${p.year}</span></div>
      <a class="t" href="${esc(link(p))}">${esc(p.title)}</a><div class="a">${authors(p.authors)}</div>
      <div class="j">${esc(p.citation)}</div></div>`).join('');

    const themes = ['All', ...new Set(d.items.map(p => p.theme))];
    let sort = 'new', theme = 'All';
    $('#themes').innerHTML = themes.map(t => `<button type="button" aria-pressed="${t === 'All'}" data-t="${esc(t)}">${esc(t)}</button>`).join('');
    const hasCites = d.items.some(p => typeof p.citations === 'number');
    const render = () => {
      let list = d.items.filter(p => theme === 'All' || p.theme === theme);
      const item = p => `<div class="pub"><div><a class="t" href="${esc(link(p))}">${esc(p.title)}</a>
        <div class="a">${authors(p.authors)}</div><div class="j">${esc(p.citation)}</div></div>
        <div class="side">${typeof p.citations === 'number' ? `<b>${p.citations}</b>citations` : `<span class="tag green">${esc(p.theme)}</span>`}</div></div>`;
      if (sort === 'cited' && hasCites) {
        list = list.slice().sort((a, b) => (b.citations ?? -1) - (a.citations ?? -1));
        $('#list').innerHTML = list.map(item).join('');
      } else {
        const years = [...new Set(list.map(p => p.year))].sort((a, b) => b - a);
        $('#list').innerHTML = years.map(y => `<h2 class="year">${y}</h2>` + list.filter(p => p.year === y).map(item).join('')).join('');
      }
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
      theme = b.dataset.t;
      document.querySelectorAll('#themes button').forEach(x => x.setAttribute('aria-pressed', x === b));
      render();
    });
    render();
    $('#review').innerHTML = d.under_review.map(p => `<div class="pub"><div><span class="t">${esc(p.title)}</span>
      <div class="a">${authors(p.authors)}</div><div class="j">${esc(p.journal)}</div></div>
      <div class="side"><span class="tag">${esc(p.status)}</span></div></div>`).join('');
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
    $('#quick').innerHTML = `
      <li><i class="ti ti-mail" aria-hidden="true"></i><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      ${site.phone ? `<li><i class="ti ti-phone" aria-hidden="true"></i><a href="tel:${esc(site.phone.replace(/[^+\d]/g, ''))}">${esc(site.phone)}</a></li>` : ''}
      <li><i class="ti ti-building" aria-hidden="true"></i><span>${esc(site.office)}, ${esc(site.department)}, ${esc(site.institution)}</span></li>`;
    $('#cv-btn').href = site.cv_file;
    const row = (y, main, sub) => `<li><span class="y">${esc(y)}</span><span><b>${esc(main)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></li>`;
    $('#education').innerHTML = d.education.map(e => row(e.period, e.degree, `${e.place}. ${e.note}`)).join('');
    $('#experience').innerHTML = d.experience.map(e => row(e.period, e.title, e.place)).join('');
    $('#leadership').innerHTML = d.leadership.map(e => row(e.period, e.title, `${e.place}. ${e.note}`)).join('');
    $('#awards').innerHTML = d.awards.map(a => row(a.year, a.title, a.org)).join('');
    $('#certificates').innerHTML = d.certificates.map(a => row(a.year, a.title, a.org)).join('');
    $('#service').innerHTML = d.service.map(s => `<li>${esc(s)}</li>`).join('');
    $('#affiliations').innerHTML = d.affiliations.map(s => `<li>${esc(s)}</li>`).join('');
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
      ${n.image ? `<img src="${esc(n.image)}" alt="">` : ''}
      <div class="content">${n.body}</div>
      ${n.link ? `<p><a class="btn btn-line" href="${esc(n.link)}"><i class="ti ti-external-link" aria-hidden="true"></i>Read more</a></p>` : ''}
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
