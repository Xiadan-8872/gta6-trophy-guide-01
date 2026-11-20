// Platinum Road — GTA VI trophy guide & tracker.
// Plain static app: loads app/data/trophies.json, saves progress in localStorage,
// export/import, filters, a spoiler setting, roadmap and missables pages.
// No network beyond its own files. Demo mode (?demo=1) seeds example progress
// in-memory for screenshots; it never touches a real save.

const POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
const EARNED_KEY = 'platinum-road-earned-v1';
const SPOILER_KEY = 'platinum-road-spoilers-v1';
const DEMO_EARNED = [16, 19, 20, 21, 35, 36, 44, 46, 47, 49, 50, 51, 55];

const params = new URLSearchParams(location.search);
const demo = params.get('demo') === '1';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const SOURCES = new Map((doc.sources ?? []).map((s) => [s.key, s]));

// ---- state ----
let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]')); } catch { earned = new Set(); }
if (demo) earned = new Set(DEMO_EARNED);
let spoilerOn = true;
try { spoilerOn = JSON.parse(localStorage.getItem(SPOILER_KEY) ?? 'true'); } catch { spoilerOn = true; }
if (params.get('spoilers') === 'on') spoilerOn = true;
if (params.get('spoilers') === 'off') spoilerOn = false;

let kind = 'all';
let grade = 'all';
let show = 'all';
let query = '';
let selectedId = null;
let view = 'checklist';

// ---- elements ----
const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const detailEl = $('detail');

function save() {
  if (demo) return; // demo progress never overwrites a real save
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilerOn));
}

function isConcealed(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.id);
}

function points() {
  let p = 0;
  for (const id of earned) p += POINTS[byId.get(id).grade] ?? 0;
  return p;
}

function renderProgress() {
  $('earnedCount').textContent = earned.size;
  $('pointsCount').textContent = points().toLocaleString('en-US');
  $('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  $('makeup').innerHTML =
    '<b>1</b> Platinum · <b>2</b> Gold · <b>6</b> Silver · <b>46</b> Bronze · <b>28</b> hidden';
}

const KIND_LABELS = {
  all: 'All', story: 'Story', missable: 'Missable', collectible: 'Collectibles',
  activity: 'Activities', combat: 'Combat', exploration: 'Exploration', money: 'Money',
};
function renderChips() {
  const wrap = $('kindChips');
  wrap.replaceChildren();
  for (const [key, label] of Object.entries(KIND_LABELS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (kind === key ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => { kind = key; renderList(); renderChips(); });
    wrap.append(b);
  }
}

function filtered() {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind === 'story' && t.kind !== 'story') return false;
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'collectible' && t.kind !== 'collectible') return false;
    if (kind === 'activity' && t.kind !== 'activity') return false;
    if (kind === 'combat' && t.kind !== 'combat') return false;
    if (kind === 'exploration' && t.kind !== 'exploration') return false;
    if (kind === 'money' && t.kind !== 'money') return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (show === 'earned' && !earned.has(t.id)) return false;
    if (show === 'todo' && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function gradeChip(t) {
  const s = document.createElement('span');
  s.className = `gradechip ${t.grade}`;
  const dot = document.createElement('span');
  dot.className = 'dot';
  s.append(dot, document.createTextNode(t.grade));
  return s;
}

function tag(text, cls) {
  const s = document.createElement('span');
  s.className = 'tag' + (cls ? ' ' + cls : '');
  s.textContent = text;
  return s;
}

function renderList() {
  const list = filtered();
  rowsEl.replaceChildren();
  for (const t of list) {
    const tr = document.createElement('tr');
    if (earned.has(t.id)) tr.classList.add('earned');
    if (selectedId === t.id) tr.classList.add('selected');
    const concealed = isConcealed(t);

    const tdBox = document.createElement('td');
    tdBox.className = 'c-earned';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${concealed ? 'hidden story trophy' : t.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save(); renderProgress(); renderList();
      if (selectedId === t.id) renderDetail();
    });
    tdBox.append(box);

    const tdName = document.createElement('td');
    if (concealed) {
      const n = document.createElement('div');
      n.className = 'tname concealed';
      n.textContent = 'Hidden story trophy';
      const d = document.createElement('div');
      d.className = 'tdesc concealed';
      d.textContent = 'Earn it to reveal its name and description — or turn the spoiler setting off.';
      tdName.append(n, d);
    } else {
      const n = document.createElement('div');
      n.className = 'tname';
      n.textContent = t.name;
      const d = document.createElement('div');
      d.className = 'tdesc';
      d.textContent = t.description;
      tdName.append(n, d);
    }
    const tags = document.createElement('div');
    tags.className = 'ttags';
    if (t.missable) tags.append(tag('Missable', 'missable'));
    if (t.hidden && !concealed) tags.append(tag('Hidden', 'hidden'));
    if (t.kind !== 'misc' && t.kind !== 'platinum') tags.append(tag(t.kind));
    tdName.append(tags);

    const tdGrade = document.createElement('td');
    tdGrade.className = 'c-grade';
    tdGrade.append(concealed ? document.createTextNode('—') : gradeChip(t));

    const tdTarget = document.createElement('td');
    tdTarget.className = 'c-target';
    tdTarget.textContent = t.target == null ? '—' : `0/${t.target.toLocaleString('en-US')}`;

    const tdKind = document.createElement('td');
    tdKind.className = 'c-kind';
    tdKind.textContent = t.kind;

    tr.append(tdBox, tdName, tdGrade, tdTarget, tdKind);
    tr.addEventListener('click', (e) => {
      if (e.target === box) return;
      location.hash = `#/trophy/${t.id}`;
    });
    rowsEl.append(tr);
  }
  const shownEarned = list.filter((t) => earned.has(t.id)).length;
  $('listMeta').textContent =
    `Showing ${list.length} of ${trophies.length} trophies · ${shownEarned} earned in this view` +
    (spoilerOn ? ' · story trophies hidden until earned' : '');
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = selectedId == null ? null : byId.get(selectedId);
  if (!t) {
    const d = document.createElement('div');
    d.className = 'd-empty';
    d.innerHTML = '<h2>Pick a trophy</h2><p>Click any row to open its guide here — what to do, what to watch out for, and where each fact comes from.</p><p>The guide is written from the official descriptions. Where a place or a step is not pinned down, it says so instead of inventing one.</p>';
    detailEl.append(d);
    return;
  }
  if (isConcealed(t)) {
    const d = document.createElement('div');
    d.className = 'd-empty';
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.textContent = 'This story trophy stays hidden until you earn it — the spoiler setting is on. Earn it in the game and tick it off, or show it now.';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Show story trophies';
    btn.addEventListener('click', () => {
      spoilerOn = false; save();
      $('spoilerToggle').checked = false;
      renderList(); renderDetail();
    });
    d.append(h, p, btn);
    detailEl.append(d);
    return;
  }

  const g = document.createElement('div');
  g.className = 'd-grade';
  g.append(gradeChip(t));
  const h = document.createElement('h2');
  h.textContent = t.name;
  const desc = document.createElement('p');
  desc.className = 'd-desc';
  desc.textContent = t.description;
  g.append(h, desc);
  const sp = document.createElement('p');
  sp.className = 'd-sources';
  sp.append(document.createTextNode('Sources: '));
  t.sources.forEach((key, i) => {
    const s = SOURCES.get(key);
    if (!s) return;
    if (i > 0) sp.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label.split(' — ')[0];
    sp.append(a);
  });
  sp.append(document.createTextNode(' — official list; guidance is our own words, not yet checked in the game.'));
  g.append(sp);
  if (t.target != null) {
    const tg = document.createElement('p');
    tg.className = 'd-target';
    tg.innerHTML = `PSN progress target: <b>0/${t.target.toLocaleString('en-US')}</b>`;
    g.append(tg);
  }
  const gh = document.createElement('h3');
  gh.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'd-guide';
  guide.textContent = t.guide;
  g.append(gh, guide);
  if (t.missable) {
    const w = document.createElement('p');
    w.className = 'd-warn';
    w.innerHTML = '<strong>Missable.</strong> PowerPyx flags this as the only potentially missable trophy: the first meditation spot is offered at home in Chapter 1 and is gone after that chapter. Do it the first time it is offered.';
    g.append(w);
  }

  const nav = document.createElement('div');
  nav.className = 'd-nav';
  const list = filtered();
  const i = list.findIndex((x) => x.id === t.id);
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = '← Previous';
  prev.disabled = i <= 0;
  prev.addEventListener('click', () => { location.hash = `#/trophy/${list[i - 1].id}`; });
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next →';
  next.disabled = i < 0 || i >= list.length - 1;
  next.addEventListener('click', () => { location.hash = `#/trophy/${list[i + 1].id}`; });
  nav.append(prev, next);
  g.append(nav);
  detailEl.append(g);
}

function renderSources() {
  const ul = $('sourceList');
  ul.replaceChildren();
  for (const s of doc.sources ?? []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    li.append(a);
    ul.append(li);
  }
}

function setView(v) {
  view = v;
  for (const sec of document.querySelectorAll('.view')) sec.hidden = sec.id !== `view-${v}`;
  for (const tab of document.querySelectorAll('.tab')) tab.classList.toggle('active', tab.dataset.view === v);
  $('toolbar').style.display = v === 'checklist' ? '' : 'none';
}

function route() {
  const h = location.hash || '#/';
  if (h.startsWith('#/trophy/')) {
    const id = Number(h.slice(9));
    selectedId = byId.has(id) ? id : null;
    setView('checklist');
  } else if (h === '#/roadmap') {
    selectedId = null;
    setView('roadmap');
  } else if (h === '#/missables') {
    selectedId = null;
    setView('missables');
  } else {
    selectedId = null;
    setView('checklist');
  }
  renderList();
  renderDetail();
}

window.addEventListener('hashchange', route);

$('search').addEventListener('input', (e) => { query = e.target.value; renderList(); });
$('gradeFilter').addEventListener('change', (e) => { grade = e.target.value; renderList(); });
$('earnedFilter').addEventListener('change', (e) => { show = e.target.value; renderList(); });
$('spoilerToggle').checked = spoilerOn;
$('spoilerToggle').addEventListener('change', (e) => {
  spoilerOn = e.target.checked;
  save(); renderList(); renderDetail();
});
$('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: doc.game, earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = (Array.isArray(data) ? data : data.earned ?? []).filter((id) => byId.has(Number(id)));
    earned = new Set(ids.map(Number));
    save(); renderProgress(); renderList(); renderDetail();
  } catch { alert('That file is not a Platinum Road progress export.'); }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  save(); renderProgress(); renderList(); renderDetail();
});

if (demo) $('demoNote').hidden = false;
renderSources();
renderChips();
renderProgress();
route();
