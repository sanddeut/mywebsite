(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const won = n => n.toLocaleString('ko-KR') + '원';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- 저장소 (이 브라우저에만 저장) ----
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('yg:' + key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('yg:' + key, JSON.stringify(value)); } catch { /* 저장 못 해도 화면은 동작 */ }
    }
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const addDays = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const daysUntil = iso => Math.round((new Date(iso + 'T00:00:00') - today) / 86400000);

  const samples = window.SAMPLE_STUDIES.map((s, i) => ({ ...s, deadline: addDays(s.daysLeft), startDate: addDays(s.startIn), endDate: addDays(s.endIn), createdAt: i }));
  let myPosts = store.get('posts', []);
  let apps = store.get('apps', []);
  let profile = { age: '', gender: '', matchOnly: false, ...store.get('profile', {}) };
  const state = { q: '', region: '', district: '', from: '', to: '', sort: 'deadline' };
  const SIDO = Object.keys(window.REGIONS);
  const place = s => [s.region, s.district].filter(Boolean).join(' ');
  const districtOpts = (sido, blank) => `<option value="">${blank}</option>` + (window.REGIONS[sido] || []).map(d => `<option>${d}</option>`).join('');

  const allStudies = () => [...myPosts, ...samples].filter(s => daysUntil(s.deadline) >= 0);
  const appliedCount = s => s.applied + apps.filter(a => a.studyId === s.id).length;
  const hasApplied = id => apps.some(a => a.studyId === id);

  // ---- 매칭: 참여할 수 없는 이유를 모아요 ----
  function mismatch(s) {
    const why = [];
    const age = Number(profile.age);
    if (profile.age && (age < s.ageMin || age > s.ageMax)) why.push(`만 ${s.ageMin}~${s.ageMax}세 대상`);
    if (profile.gender && s.gender !== '무관' && s.gender !== profile.gender) why.push(`${s.gender}만 모집`);
    return why;
  }
  const profileFilled = () => profile.age || profile.gender;

  // ---- 공통 조각 ----
  function ddayLabel(s) {
    const d = daysUntil(s.deadline);
    return d === 0 ? '오늘 마감' : `D-${d}`;
  }
  const md = iso => iso ? `${Number(iso.slice(5, 7))}.${Number(iso.slice(8, 10))}` : '';
  const period = s => s.startDate ? (s.startDate === s.endDate ? md(s.startDate) : `${md(s.startDate)} ~ ${md(s.endDate)}`) : '';
  function duration(m) { return m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ' ' + (m % 60) + '분' : ''}` : `${m}분`; }

  // ---- 연구 찾기 ----
  function initPickers() {
    $('#region-filter').innerHTML = '<option value="">지역 전체</option><option value="온라인">온라인</option>' +
      SIDO.map(r => `<option value="${r}">${r}</option>`).join('');
    $('#region-filter').addEventListener('change', e => {
      state.region = e.target.value; state.district = '';
      const has = !!window.REGIONS[state.region];
      $('#district-wrap').hidden = !has;
      if (has) $('#district-filter').innerHTML = districtOpts(state.region, `${state.region} 전체`);
      renderBoard();
    });
    $('#district-filter').addEventListener('change', e => { state.district = e.target.value; renderBoard(); });
    const onDate = () => {
      state.from = $('#date-from').value; state.to = $('#date-to').value;
      $('#date-to').min = state.from || addDays(0);
      $('#date-clear').hidden = !(state.from || state.to);
      renderBoard();
    };
    $('#date-from').min = addDays(0);
    $('#date-to').min = addDays(0);
    $('#date-from').addEventListener('change', onDate);
    $('#date-to').addEventListener('change', onDate);
    $('#date-clear').addEventListener('click', () => { $('#date-from').value = ''; $('#date-to').value = ''; onDate(); });
  }

  function renderStats() {
    const list = allStudies();
    const open = list.reduce((n, s) => n + Math.max(0, s.capacity - appliedCount(s)), 0);
    const online = list.filter(s => s.mode === '온라인').length;
    $('#hero-stats').innerHTML =
      `<span>모집 중 <b>${list.length}</b>건</span><span>남은 자리 <b>${open.toLocaleString('ko-KR')}</b>명</span><span>온라인 <b>${online}</b>건</span>`;
  }

  function renderBoard() {
    const q = state.q.trim().toLowerCase();
    let list = allStudies().filter(s => {
      if (state.region === '온라인' && s.mode !== '온라인') return false;
      if (state.region && state.region !== '온라인' && !(s.mode === '대면' && s.region === state.region)) return false;
      if (state.district && s.district !== state.district) return false;
      // 고른 날짜 범위와 연구 기간이 하루라도 겹치면 보여요
      if (state.from && s.endDate && s.endDate < state.from) return false;
      if (state.to && s.startDate && s.startDate > state.to) return false;
      if (profile.matchOnly && profileFilled() && mismatch(s).length) return false;
      if (q && ![s.title, s.school, s.lab, s.summary, s.type].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
    const sorters = {
      deadline: (a, b) => a.deadline.localeCompare(b.deadline),
      pay: (a, b) => b.pay - a.pay,
      short: (a, b) => a.minutes - b.minutes,
      new: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0) || (a.mine ? -1 : 1)
    };
    list.sort(sorters[state.sort]);

    $('#count').textContent = `${list.length}건의 연구`;
    if (!list.length) {
      $('#board').innerHTML = `<div class="empty"><strong>조건에 맞는 연구가 없어요.</strong><span>검색어나 날짜를 지우거나 지역을 「전체」로 바꿔 보세요.</span></div>`;
      return;
    }
    $('#board').innerHTML = list.map(card).join('');
  }

  function card(s) {
    const filled = appliedCount(s);
    const ratio = Math.min(1, filled / s.capacity);
    const d = daysUntil(s.deadline);
    const why = profileFilled() ? mismatch(s) : null;
    const matchChip = why === null ? '' : why.length
      ? `<span class="chip no" title="${esc(why.join(', '))}">${esc(why[0])}</span>`
      : `<span class="chip ok">조건 맞음</span>`;
    return `
    <article class="flyer${d <= 3 ? ' urgent' : ''}">
      <button class="flyer-hit" data-open="${esc(s.id)}" aria-label="${esc(s.title)} 자세히 보기"></button>
      <header class="flyer-head">
        <span class="type">${esc(s.type)}</span>
        <span class="mode ${s.mode === '온라인' ? 'online' : ''}">${s.mode === '온라인' ? '온라인' : esc(place(s)) + ' 대면'}</span>
        <span class="dday">${ddayLabel(s)}</span>
      </header>
      <h3>${esc(s.title)}</h3>
      <p class="org">${esc(s.school)} · ${esc(s.lab)}</p>
      <div class="meta">
        <span>${period(s) ? '연구 ' + period(s) + ' · ' : ''}만 ${s.ageMin}~${s.ageMax}세${s.gender !== '무관' ? ' · ' + esc(s.gender) : ''}</span>
        ${matchChip}
        ${hasApplied(s.id) ? '<span class="chip done">신청함</span>' : ''}
        ${s.mine ? '<span class="chip mine">내 공고</span>' : ''}
      </div>
      <div class="fill" aria-label="모집 ${filled}명 / ${s.capacity}명">
        <div class="bar"><i style="width:${(ratio * 100).toFixed(0)}%"></i></div>
        <span>${filled}/${s.capacity}명</span>
      </div>
      <footer class="tabs-tear" aria-hidden="true">
        <span>사례비 <b>${won(s.pay)}</b></span>
        <span>소요 <b>${duration(s.minutes)}</b></span>
      </footer>
    </article>`;
  }

  // ---- 상세 + 신청 ----
  const dialog = $('#detail');
  function openDetail(id) {
    const s = allStudies().find(x => x.id === id);
    if (!s) return;
    const why = profileFilled() ? mismatch(s) : [];
    const filled = appliedCount(s);
    const full = filled >= s.capacity;
    const conds = [`만 ${s.ageMin}~${s.ageMax}세`, ...(s.gender !== '무관' ? [`${s.gender}`] : []), ...s.conditions];

    $('#detail-body').innerHTML = `
      <button class="close" type="button" data-close aria-label="닫기">×</button>
      <p class="eyebrow">${esc(s.type)} · ${s.mode === '온라인' ? '온라인' : esc(place(s)) + ' 대면'} · ${ddayLabel(s)}</p>
      <h2 id="d-title">${esc(s.title)}</h2>
      <p class="org">${esc(s.school)} · ${esc(s.lab)}</p>
      <p class="summary">${esc(s.summary)}</p>
      <dl class="facts">
        <div><dt>사례비</dt><dd>${won(s.pay)}</dd></div>
        <div><dt>소요 시간</dt><dd>${duration(s.minutes)}</dd></div>
        <div><dt>연구 기간</dt><dd>${period(s) || '-'}</dd></div>
        <div><dt>장소</dt><dd>${esc(s.location || '-')}</dd></div>
        <div><dt>모집</dt><dd>${filled}/${s.capacity}명</dd></div>
        <div><dt>마감</dt><dd>${s.deadline.replaceAll('-', '.')}</dd></div>
        <div><dt>IRB 승인번호</dt><dd class="mono">${esc(s.irb)}</dd></div>
      </dl>
      ${why.length ? `<p class="warn">입력한 조건으로는 참여하기 어려워요: ${esc(why.join(', '))}</p>` : ''}
      ${hasApplied(s.id) ? `<p class="okmsg">이미 신청한 연구예요. 「내 활동」에서 확인할 수 있어요.</p>`
        : full ? `<p class="warn">모집 인원이 다 찼어요.</p>`
        : `
      <form id="apply-form" class="apply" novalidate>
        <h3>참여 신청</h3>
        <fieldset class="conds">
          <legend>참여 조건을 모두 확인해 주세요</legend>
          ${conds.map((c, i) => `<label class="check"><input type="checkbox" id="c-${i}" required><span>${esc(c)}</span></label>`).join('')}
        </fieldset>
        <div class="row">
          <label class="field"><span>이름</span><input id="a-name" required maxlength="20" autocomplete="name"></label>
          <label class="field"><span>연락처 (이메일 또는 전화)</span><input id="a-contact" required maxlength="60" autocomplete="email"></label>
        </div>
        <label class="field"><span>가능한 시간 (선택)</span><input id="a-time" maxlength="80" placeholder="예: 평일 오후 2시 이후"></label>
        <label class="check"><input type="checkbox" id="a-consent" required><span>연구자에게 이름과 연락처를 전달하는 데 동의해요.</span></label>
        <p class="form-error" id="apply-error" role="alert" hidden></p>
        <button class="btn primary" type="submit">신청하기</button>
      </form>`}
      <p class="contact">문의: <span class="mono sel">${esc(s.contact)}</span></p>`;

    const form = $('#apply-form');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      const err = $('#apply-error');
      if (!$$('.conds input', form).every(c => c.checked)) return showErr(err, '참여 조건을 모두 확인해야 신청할 수 있어요.');
      if (!$('#a-name').value.trim() || !$('#a-contact').value.trim()) return showErr(err, '이름과 연락처를 입력해 주세요.');
      if (!$('#a-consent').checked) return showErr(err, '연락처 전달에 동의해야 연구자가 연락할 수 있어요.');
      apps.push({ studyId: s.id, title: s.title, school: s.school, name: $('#a-name').value.trim(),
        contact: $('#a-contact').value.trim(), time: $('#a-time').value.trim(), at: new Date().toISOString() });
      store.set('apps', apps);
      dialog.close();
      toast('신청했어요. 「내 활동」에서 확인할 수 있어요.');
      refresh();
    });

    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function showErr(el, msg) { el.textContent = msg; el.hidden = false; }

  dialog.addEventListener('click', e => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });

  // ---- 연구 등록 ----
  function initPostForm() {
    const opts = (arr, blank) => (blank ? `<option value="">${blank}</option>` : '') + arr.map(x => `<option>${x}</option>`).join('');
    $('#f-type').innerHTML = opts(window.TYPES);
    $('#f-region').innerHTML = opts(SIDO, '온라인이면 비워 두세요');
    $('#f-region').addEventListener('change', e => {
      $('#f-district').innerHTML = e.target.value ? districtOpts(e.target.value, '시·군·구 선택') : '<option value="">시·도를 먼저 골라 주세요</option>';
    });
    $('#f-deadline').min = addDays(0);
    $('#f-deadline').value = addDays(14);

    $('#post-form').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      const err = $('#post-error');
      err.hidden = true;
      const bad = $$('input[required], textarea[required], select[required]', f).find(i => !i.value.trim() || !i.checkValidity());
      if (bad) { bad.focus(); return showErr(err, `「${bad.closest('label').querySelector('span').textContent}」을(를) 확인해 주세요.`); }
      const v = id => $('#' + id).value.trim();
      const mode = v('f-mode');
      if (mode === '대면' && !v('f-region')) { $('#f-region').focus(); return showErr(err, '대면 연구는 지역을 골라 주세요.'); }
      if (mode === '대면' && !v('f-district')) { $('#f-district').focus(); return showErr(err, '대면 연구는 시·군·구까지 골라 주세요.'); }
      if (v('f-end') < v('f-start')) { $('#f-end').focus(); return showErr(err, '연구 종료일이 시작일보다 빠를 수 없어요.'); }
      const ageMin = Number(v('f-agemin')), ageMax = Number(v('f-agemax'));
      if (ageMin > ageMax) return showErr(err, '최소 나이가 최대 나이보다 클 수 없어요.');

      const post = {
        id: 'm' + Date.now(), mine: true, createdAt: Date.now(),
        title: v('f-title'), school: v('f-school'), lab: v('f-lab'), summary: v('f-summary'),
        type: v('f-type'), mode, region: mode === '대면' ? v('f-region') : '', district: mode === '대면' ? v('f-district') : '',
        location: v('f-location') || (mode === '온라인' ? '온라인' : ''),
        minutes: Number(v('f-minutes')), pay: Number(v('f-pay')), capacity: Number(v('f-capacity')), applied: 0,
        ageMin, ageMax, gender: v('f-gender'),
        conditions: v('f-conditions').split('\n').map(x => x.trim()).filter(Boolean),
        irb: v('f-irb'), deadline: v('f-deadline'), startDate: v('f-start'), endDate: v('f-end'), contact: v('f-contact')
      };
      myPosts.unshift(post);
      store.set('posts', myPosts);
      f.reset();
      $('#f-district').innerHTML = '<option value="">시·도를 먼저 골라 주세요</option>';
      $('#f-deadline').value = addDays(14);
      toast('공고를 올렸어요.');
      location.hash = 'find';
      refresh();
    });
  }

  // ---- 내 활동 ----
  function renderMine() {
    const all = allStudies();
    $('#my-apps').innerHTML = apps.length ? apps.slice().reverse().map(a => {
      const s = all.find(x => x.id === a.studyId);
      return `<div class="item">
        <div><strong>${esc(a.title)}</strong><span>${esc(a.school)} · ${new Date(a.at).toLocaleDateString('ko-KR')} 신청</span></div>
        ${s ? `<button class="btn ghost" data-open="${esc(s.id)}">공고 보기</button>` : '<span class="muted">마감됨</span>'}
        <button class="btn ghost" data-cancel="${esc(a.studyId)}">신청 취소</button>
      </div>`;
    }).join('') : `<div class="empty"><strong>아직 신청한 연구가 없어요.</strong><span>「연구 찾기」에서 마음에 드는 공고를 눌러 신청해 보세요.</span></div>`;

    $('#my-posts').innerHTML = myPosts.length ? myPosts.map(p => {
      const list = apps.filter(a => a.studyId === p.id);
      return `<div class="item col">
        <div class="item-top">
          <div><strong>${esc(p.title)}</strong><span>${esc(p.type)} · 마감 ${p.deadline.replaceAll('-', '.')} · 신청 ${list.length}/${p.capacity}명</span></div>
          <button class="btn ghost" data-remove="${esc(p.id)}">공고 내리기</button>
        </div>
        ${list.length ? `<div class="table-wrap"><table><thead><tr><th>이름</th><th>연락처</th><th>가능한 시간</th></tr></thead><tbody>
          ${list.map(a => `<tr><td>${esc(a.name)}</td><td class="mono">${esc(a.contact)}</td><td>${esc(a.time || '-')}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">아직 신청자가 없어요.</p>'}
      </div>`;
    }).join('') : `<div class="empty"><strong>올린 공고가 없어요.</strong><span>「연구 등록」에서 참여자 모집 공고를 올릴 수 있어요.</span></div>`;
  }

  // ---- 내 조건 ----
  function initProfile() {
    const btn = $('#profile-toggle'), panel = $('#profile-form');
    const label = () => {
      const parts = [profile.age && `${profile.age}세`, profile.gender].filter(Boolean);
      btn.textContent = parts.length ? parts.join(' · ') : '내 조건';
      btn.classList.toggle('on', parts.length > 0);
    };
    $('#p-age').value = profile.age;
    $('#p-gender').value = profile.gender;
    $('#p-match').checked = profile.matchOnly;
    label();
    btn.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) $('#p-age').focus();
    });
    panel.addEventListener('submit', e => e.preventDefault());
    panel.addEventListener('input', () => {
      profile = { age: $('#p-age').value, gender: $('#p-gender').value, matchOnly: $('#p-match').checked };
      store.set('profile', profile);
      label();
      renderBoard();
    });
  }

  // ---- 화면 전환 ----
  function route() {
    const tab = (location.hash || '#find').slice(1);
    const view = ['find', 'post', 'mine'].includes(tab) ? tab : 'find';
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== view; });
    $$('.tabs a').forEach(a => a.setAttribute('aria-current', a.dataset.tab === view ? 'page' : 'false'));
    if (view === 'mine') renderMine();
    window.scrollTo(0, 0);
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  function refresh() { renderStats(); renderBoard(); if (!$('#view-mine').hidden) renderMine(); }

  document.addEventListener('click', e => {
    const open = e.target.closest('[data-open]');
    if (open) return openDetail(open.dataset.open);
    const cancel = e.target.closest('[data-cancel]');
    if (cancel) { apps = apps.filter(a => a.studyId !== cancel.dataset.cancel); store.set('apps', apps); toast('신청을 취소했어요.'); return refresh(); }
    const remove = e.target.closest('[data-remove]');
    if (remove) { myPosts = myPosts.filter(p => p.id !== remove.dataset.remove); store.set('posts', myPosts); toast('공고를 내렸어요.'); return refresh(); }
  });
  $('#q').addEventListener('input', e => { state.q = e.target.value; renderBoard(); });
  $('#search-form').addEventListener('submit', e => { e.preventDefault(); state.q = $('#q').value; renderBoard(); $('#q').blur(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderBoard(); });
  window.addEventListener('hashchange', route);

  initPickers();
  initProfile();
  initPostForm();
  refresh();
  route();
})();
