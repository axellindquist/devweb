   (function () {
 
  let ME = null; 
 

  const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const VALID_TLDS = [
    'com','org','net','edu','gov','ca','fr','uk','de','io','co',
    'us','eu','be','ch','au','nz','jp','br','mx','in','info','biz','me'
  ];
 
  function validFmt(e)    { return EMAIL_RE.test(e); }
  function validDomain(e) {
    const d   = (e.split('@')[1] || '').toLowerCase();
    const tld = d.split('.').pop();
    return VALID_TLDS.includes(tld) && d.includes('.') && tld.length >= 2;
  }
 
  function $id(i) { return document.getElementById(i); }
 
  function setMsg(id, txt, type) {
    const el = $id(id);
    el.textContent = txt;
    el.className = 'wh-msg' + (txt ? ' wh-show wh-' + type : '');
  }
 
  function setInp(id, state) {
    const el = $id(id);
    el.classList.remove('wh-err', 'wh-ok');
    if (state) el.classList.add('wh-' + state);
  }
 
  function showAlert(alertId, txtId, msg) {
    $id(alertId).className = 'wh-alert wh-err wh-show';
    $id(txtId).textContent  = msg;
    const m = $id('wiki-modal');
    m.classList.remove('wiki-shake');
    void m.offsetWidth; // reflow to restart animation
    m.classList.add('wiki-shake');
  }
 
  function wClearAlert(id) { $id(id).className = 'wh-alert wh-err'; }
  window.wClearAlert = wClearAlert; // expose for inline HTML oninput
 
  window.wikiOpen = function () {
    if (ME) showLoggedIn();
    $id('wiki-overlay').classList.add('wiki-open');
  };
 
  window.wikiClose = function () {
    $id('wiki-overlay').classList.remove('wiki-open');
  };
 
  window.wikiOverlayClick = function (e) {
    if (e.target === $id('wiki-overlay')) window.wikiClose();
  };
 
  document.addEventListener('keydown', e => { if (e.key === 'Escape') window.wikiClose(); });

  window.wikiTab = function (t) {
    $id('wiki-tab-reg').classList.toggle('wh-active', t === 'reg');
    $id('wiki-tab-log').classList.toggle('wh-active', t === 'log');
    $id('wiki-panel-reg').style.display  = t === 'reg' ? '' : 'none';
    $id('wiki-panel-log').style.display  = t === 'log' ? '' : 'none';
    $id('wiki-success').style.display    = 'none';
    $id('wiki-loggedin').style.display   = 'none';
    $id('wiki-tabs').style.display       = '';
    $id('wiki-modal-title').textContent  = t === 'reg' ? 'Rejoindre le site' : 'Se connecter';
  };
 
  window.wvEmailLive = function (iid, mid) {
    const v = $id(iid).value.trim();
    if (!v) { setMsg(mid, '', ''); setInp(iid, null); return; }
    if (!validFmt(v))    { setMsg(mid, 'Format invalide – ex: nom@gmail.com', 'err'); setInp(iid, 'err'); }
    else if (!validDomain(v)) { setMsg(mid, '⚠ Domaine inconnu – vérifiez votre adresse', 'warn'); setInp(iid, 'err'); }
    else                 { setMsg(mid, '✔ Adresse valide', 'ok'); setInp(iid, 'ok'); }
  };
 
  window.wvEmailBlur = function (iid, mid) {
    window.wvEmailLive(iid, mid);
    if (!$id(iid).value.trim()) { setMsg(mid, 'Ce champ est requis.', 'err'); setInp(iid, 'err'); }
  };
 
  window.wvEmailMatch = function () {
    const a = $id('wr-email').value.trim();
    const b = $id('wr-email2').value.trim();
    if (!b) { setMsg('wm-email2', '', ''); setInp('wr-email2', null); return; }
    if (a !== b) { setMsg('wm-email2', 'Les courriels ne correspondent pas.', 'err'); setInp('wr-email2', 'err'); }
    else         { setMsg('wm-email2', '✔ Courriels identiques', 'ok'); setInp('wr-email2', 'ok'); }
  };
 
  window.wvStrength = function () {
    const pw = $id('wr-pw').value;
    let s = 0;
    if (pw.length >= 8)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const levels = [
      { w: '0%',   bg: '#eee',     txt: '' },
      { w: '25%',  bg: '#d33',     txt: 'Très faible' },
      { w: '50%',  bg: '#e68a00',  txt: 'Moyen' },
      { w: '75%',  bg: '#3a7d44',  txt: 'Fort' },
      { w: '100%', bg: '#14866d',  txt: 'Très fort' },
    ];
    const l = levels[s];
    $id('wstr-fill').style.cssText = `width:${l.w};background:${l.bg}`;
    const lbl = $id('wstr-lbl');
    lbl.textContent = l.txt;
    lbl.style.color = l.bg;
  };
 
  window.wvPwMatch = function () {
    const a = $id('wr-pw').value;
    const b = $id('wr-pw2').value;
    if (!b) { setMsg('wm-pw2', '', ''); setInp('wr-pw2', null); return; }
    if (a !== b) { setMsg('wm-pw2', 'Les mots de passe ne correspondent pas.', 'err'); setInp('wr-pw2', 'err'); }
    else         { setMsg('wm-pw2', '✔ Mots de passe identiques', 'ok'); setInp('wr-pw2', 'ok'); }
  };
 
  window.wSubmitReg = async function () {
    wClearAlert('wa-reg');
    const em  = $id('wr-email').value.trim();
    const em2 = $id('wr-email2').value.trim();
    const pw  = $id('wr-pw').value;
    const pw2 = $id('wr-pw2').value;
 
    if (!em)              return showAlert('wa-reg', 'wa-reg-txt', 'Veuillez entrer votre adresse courriel.');
    if (!validFmt(em))    return showAlert('wa-reg', 'wa-reg-txt', 'Adresse courriel invalide. Exemple : nom@gmail.com');
    if (!validDomain(em)) return showAlert('wa-reg', 'wa-reg-txt', 'Ce domaine courriel n\'est pas reconnu.');
    if (em !== em2)       return showAlert('wa-reg', 'wa-reg-txt', 'Les adresses courriel ne correspondent pas.');
    if (pw.length < 8)    return showAlert('wa-reg', 'wa-reg-txt', 'Mot de passe trop court (8 caractères minimum).');
    if (pw !== pw2)       return showAlert('wa-reg', 'wa-reg-txt', 'Les mots de passe ne correspondent pas.');
 
    // Call Supabase (client is set as window.supabase by the ESM module block)
    const { data, error } = await window.supabase.auth.signUp({ email: em, password: pw });
 
    if (error) return showAlert('wa-reg', 'wa-reg-txt', error.message);
 
    // Supabase may require email confirmation — handle both cases
    ME = data.user ? data.user.email : em;
    $id('wiki-panel-reg').style.display = 'none';
    $id('wiki-tabs').style.display      = 'none';
    $id('wiki-success').style.display   = 'block';
    $id('wiki-modal-title').textContent = 'Inscription réussie !';
  };
 
  window.wSubmitLog = async function () {
    wClearAlert('wa-log');
    const em = $id('wl-email').value.trim();
    const pw = $id('wl-pw').value;
 
    if (!em)           return showAlert('wa-log', 'wa-log-txt', 'Veuillez entrer votre adresse courriel.');
    if (!validFmt(em)) return showAlert('wa-log', 'wa-log-txt', 'Format de courriel invalide.');
    if (!pw)           return showAlert('wa-log', 'wa-log-txt', 'Veuillez entrer votre mot de passe.');
 
    const { data, error } = await window.supabase.auth.signInWithPassword({ email: em, password: pw });
 
    if (error) return showAlert('wa-log', 'wa-log-txt', error.message);
 
    ME = data.user.email;
    updateBtn();
    showLoggedIn();
  };
 
  function showLoggedIn() {
    $id('wiki-panel-reg').style.display = 'none';
    $id('wiki-panel-log').style.display = 'none';
    $id('wiki-success').style.display   = 'none';
    $id('wiki-tabs').style.display      = 'none';
    $id('wiki-loggedin').style.display  = 'block';
    $id('wk-avatar').textContent        = ME.charAt(0).toUpperCase();
    $id('wk-greet').textContent         = 'Bonjour, ' + ME.split('@')[0] + ' !';
    $id('wk-email').textContent         = ME;
    $id('wiki-modal-title').textContent = 'Mon compte';
  }
 
  window.wLogout = async function () {
    await window.supabase.auth.signOut();
    ME = null;
    updateBtn();
    window.wikiClose();
    window.wikiTab('reg');
    ['wr-email','wr-email2','wr-pw','wr-pw2','wl-email','wl-pw'].forEach(id => {
      const el = $id(id);
      if (el) { el.value = ''; el.className = 'wh-input'; }
    });
    ['wm-email','wm-email2','wm-pw2'].forEach(id => setMsg(id, '', ''));
    $id('wstr-fill').style.cssText = 'width:0%';
    $id('wstr-lbl').textContent    = '';
  };
 
  function updateBtn() {
    $id('wiki-btn-txt').textContent = ME ? ME.split('@')[0] : 'Créer un compte';
  }
 
  // Wait for supabase to be ready (set by the ESM module block)
  window.addEventListener('load', async () => {
    // Small poll in case the ESM module hasn't resolved yet
    let attempts = 0;
    while (!window.supabase && attempts < 20) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (!window.supabase) return;
 
    const { data } = await window.supabase.auth.getSession();
    if (data.session) {
      ME = data.session.user.email;
      updateBtn();
    }
  });
 
})();
