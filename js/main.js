import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

(function () {

const SUPABASE_URL = "https://dtwlzarqmeaxyjdiipdr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2x6YXJxbWVheHlqZGlpcGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjM1OTYsImV4cCI6MjA5MzAzOTU5Nn0.YgOTZqut_2lXjTjXSnUn4rWRR7EmXf1aPcXEZxyDNwE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let ME = null;

const EMAIL_RE   = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const VALID_TLDS = ['com','org','net','edu','gov','ca','fr','uk','de','io','co',
                    'us','eu','be','ch','au','nz','jp','br','mx','in','info','biz','me'];

function validFmt(e)    { return EMAIL_RE.test(e); }
function validDomain(e) {
  const d = (e.split('@')[1] || '').toLowerCase();
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
  $id(txtId).textContent = msg;
  const m = $id('wiki-modal');
  m.classList.remove('wiki-shake');
  void m.offsetWidth;
  m.classList.add('wiki-shake');
}

function wClearAlert(id) { $id(id).className = 'wh-alert wh-err'; }

function wikiOpen() {
  if (ME) showLoggedIn();
  $id('wiki-overlay').classList.add('wiki-open');
}
function wikiClose() { $id('wiki-overlay').classList.remove('wiki-open'); }
function wikiOverlayClick(e) { if (e.target === $id('wiki-overlay')) wikiClose(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') wikiClose(); });

function wikiTab(t) {
  $id('wiki-tab-reg').classList.toggle('wh-active', t === 'reg');
  $id('wiki-tab-log').classList.toggle('wh-active', t === 'log');
  $id('wiki-panel-reg').style.display = t === 'reg' ? '' : 'none';
  $id('wiki-panel-log').style.display = t === 'log' ? '' : 'none';
  $id('wiki-success').style.display   = 'none';
  $id('wiki-loggedin').style.display  = 'none';
  $id('wiki-tabs').style.display      = '';
  $id('wiki-modal-title').textContent = t === 'reg' ? 'Rejoindre le site' : 'Se connecter';
}

function wvEmailLive(iid, mid) {
  const v = $id(iid).value.trim();
  if (!v) { setMsg(mid, '', ''); setInp(iid, null); return; }
  if (!validFmt(v))         { setMsg(mid, 'Format invalide – ex: nom@gmail.com', 'err');          setInp(iid, 'err'); }
  else if (!validDomain(v)) { setMsg(mid, '⚠ Domaine inconnu – vérifiez votre adresse', 'warn'); setInp(iid, 'err'); }
  else                      { setMsg(mid, '✔ Adresse valide', 'ok');                              setInp(iid, 'ok');  }
}

function wvEmailBlur(iid, mid) {
  wvEmailLive(iid, mid);
  if (!$id(iid).value.trim()) { setMsg(mid, 'Ce champ est requis.', 'err'); setInp(iid, 'err'); }
}

function wvEmailMatch() {
  const a = $id('wr-email').value.trim(), b = $id('wr-email2').value.trim();
  if (!b) { setMsg('wm-email2', '', ''); setInp('wr-email2', null); return; }
  if (a !== b) { setMsg('wm-email2', 'Les courriels ne correspondent pas.', 'err'); setInp('wr-email2', 'err'); }
  else         { setMsg('wm-email2', '✔ Courriels identiques', 'ok');               setInp('wr-email2', 'ok');  }
}

function wvStrength() {
  const pw = $id('wr-pw').value;
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    { w: '0%',   bg: '#eee',    txt: '' },
    { w: '25%',  bg: '#d33',    txt: 'Très faible' },
    { w: '50%',  bg: '#e68a00', txt: 'Moyen' },
    { w: '75%',  bg: '#3a7d44', txt: 'Fort' },
    { w: '100%', bg: '#14866d', txt: 'Très fort' },
  ];
  const l = levels[s];
  $id('wstr-fill').style.cssText = `width:${l.w};background:${l.bg}`;
  const lbl = $id('wstr-lbl');
  lbl.textContent = l.txt;
  lbl.style.color = l.bg;
}

function wvPwMatch() {
  const a = $id('wr-pw').value, b = $id('wr-pw2').value;
  if (!b) { setMsg('wm-pw2', '', ''); setInp('wr-pw2', null); return; }
  if (a !== b) { setMsg('wm-pw2', 'Les mots de passe ne correspondent pas.', 'err'); setInp('wr-pw2', 'err'); }
  else         { setMsg('wm-pw2', '✔ Mots de passe identiques', 'ok');               setInp('wr-pw2', 'ok');  }
}

async function wSubmitReg() {
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

  const { data, error } = await supabase.auth.signUp({ email: em, password: pw });
  if (error) return showAlert('wa-reg', 'wa-reg-txt', error.message);

  if (data.session) { ME = data.user.email; updateBtn(); }

  $id('wiki-panel-reg').style.display = 'none';
  $id('wiki-tabs').style.display      = 'none';
  $id('wiki-success').style.display   = 'block';
  $id('wiki-modal-title').textContent = 'Inscription réussie !';
}

async function wSubmitLog() {
  wClearAlert('wa-log');
  const em = $id('wl-email').value.trim();
  const pw = $id('wl-pw').value;

  if (!em)           return showAlert('wa-log', 'wa-log-txt', 'Veuillez entrer votre adresse courriel.');
  if (!validFmt(em)) return showAlert('wa-log', 'wa-log-txt', 'Format de courriel invalide.');
  if (!pw)           return showAlert('wa-log', 'wa-log-txt', 'Veuillez entrer votre mot de passe.');

  const { data, error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
  if (error) {
    const msg = error.message.includes('Email not confirmed')
      ? 'Veuillez confirmer votre courriel avant de vous connecter.'
      : error.message.includes('Invalid login')
      ? 'Courriel ou mot de passe incorrect.'
      : error.message;
    return showAlert('wa-log', 'wa-log-txt', msg);
  }

  ME = data.user.email;
  updateBtn();
  showLoggedIn();
}

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

async function wLogout() {
  await supabase.auth.signOut();
  ME = null;
  updateBtn();
  wikiClose();
  wikiTab('reg');
  ['wr-email','wr-email2','wr-pw','wr-pw2','wl-email','wl-pw'].forEach(id => {
    const el = $id(id);
    if (el) { el.value = ''; el.className = 'wh-input'; }
  });
  ['wm-email','wm-email2','wm-pw2'].forEach(id => setMsg(id, '', ''));
  $id('wstr-fill').style.cssText = 'width:0%';
  $id('wstr-lbl').textContent    = '';
}

function updateBtn() {
  $id('wiki-btn-txt').textContent = ME ? ME.split('@')[0] : 'Créer un compte';
}

// ── Expose to window FIRST so onclick handlers always work ─────────────────────
Object.assign(window, {
  wikiOpen, wikiClose, wikiOverlayClick, wikiTab,
  wvEmailLive, wvEmailBlur, wvEmailMatch,
  wvStrength, wvPwMatch,
  wSubmitReg, wSubmitLog, wLogout,
  wClearAlert,
});

// ── Restore session (wrapped so any error doesn't block the above) ─────────────
try {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    ME = sessionData.session.user.email;
    updateBtn();
  }
} catch (e) {
  console.warn('Could not restore session:', e);
}

supabase.auth.onAuthStateChange((_event, session) => {
  ME = session ? session.user.email : null;
  updateBtn();
});
 
})();
