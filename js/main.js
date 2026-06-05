   (function() {

  const DB = {};
  let ME = null;

  const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const VALID_TLDS = ['com','org','net','edu','gov','ca','fr','uk','de','io','co',
    'us','eu','be','ch','au','nz','jp','br','mx','in','info','biz','me'];

  function validFmt(e) { return EMAIL_RE.test(e); }
  function validDomain(e) {
    const d = (e.split('@')[1]||'').toLowerCase();
    const tld = d.split('.').pop();
    return VALID_TLDS.includes(tld) && d.includes('.') && tld.length >= 2;
  }

  function $id(i) { return document.getElementById(i); }
  function setMsg(id, txt, type) {
    const el = $id(id);
    el.textContent = txt;
    el.className = 'wh-msg' + (txt ? ' wh-show wh-'+type : '');
  }
  function setInp(id, state) {
    const el = $id(id);
    el.classList.remove('wh-err','wh-ok');
    if (state) el.classList.add('wh-'+state);
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

  window.wikiOpen = function() {
    if (ME) { showLoggedIn(); }
    $id('wiki-overlay').classList.add('wiki-open');
  };
  window.wikiClose = function() { $id('wiki-overlay').classList.remove('wiki-open'); };
  window.wikiOverlayClick = function(e) { if(e.target===$id('wiki-overlay')) wikiClose(); };

  document.addEventListener('keydown', e => { if(e.key==='Escape') wikiClose(); });

  window.wikiTab = function(t) {
    $id('wiki-tab-reg').classList.toggle('wh-active', t==='reg');
    $id('wiki-tab-log').classList.toggle('wh-active', t==='log');
    $id('wiki-panel-reg').style.display = t==='reg' ? '' : 'none';
    $id('wiki-panel-log').style.display = t==='log' ? '' : 'none';
    $id('wiki-success').style.display = 'none';
    $id('wiki-loggedin').style.display = 'none';
    $id('wiki-tabs').style.display = '';
    $id('wiki-modal-title').textContent = t==='reg' ? 'Rejoindre le site' : 'Se connecter';
  };

  window.wvEmailLive = function(iid, mid) {
    const v = $id(iid).value.trim();
    if (!v) { setMsg(mid,'',''); setInp(iid,null); return; }
    if (!validFmt(v)) { setMsg(mid,'Format invalide – ex: nom@gmail.com','err'); setInp(iid,'err'); }
    else if (!validDomain(v)) { setMsg(mid,'⚠ Domaine inconnu – vérifiez votre adresse','warn'); setInp(iid,'err'); }
    else { setMsg(mid,'✔ Adresse valide','ok'); setInp(iid,'ok'); }
  };
  window.wvEmailBlur = function(iid, mid) {
    wvEmailLive(iid, mid);
    if (!$id(iid).value.trim()) { setMsg(mid,'Ce champ est requis.','err'); setInp(iid,'err'); }
  };

  window.wvEmailMatch = function() {
    const a = $id('wr-email').value.trim(), b = $id('wr-email2').value.trim();
    if (!b) { setMsg('wm-email2','',''); setInp('wr-email2',null); return; }
    if (a!==b) { setMsg('wm-email2','Les courriels ne correspondent pas.','err'); setInp('wr-email2','err'); }
    else { setMsg('wm-email2','✔ Courriels identiques','ok'); setInp('wr-email2','ok'); }
  };

  window.wvStrength = function() {
    const pw = $id('wr-pw').value;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const levels = [
      {w:'0%',bg:'#eee',txt:''},
      {w:'25%',bg:'#d33',txt:'Très faible'},
      {w:'50%',bg:'#e68a00',txt:'Moyen'},
      {w:'75%',bg:'#3a7d44',txt:'Fort'},
      {w:'100%',bg:'#14866d',txt:'Très fort'},
    ];
    const l = levels[s];
    $id('wstr-fill').style.cssText = `width:${l.w};background:${l.bg}`;
    const lbl = $id('wstr-lbl');
    lbl.textContent = l.txt; lbl.style.color = l.bg;
  };

  window.wvPwMatch = function() {
    const a = $id('wr-pw').value, b = $id('wr-pw2').value;
    if (!b) { setMsg('wm-pw2','',''); setInp('wr-pw2',null); return; }
    if (a!==b) { setMsg('wm-pw2','Les mots de passe ne correspondent pas.','err'); setInp('wr-pw2','err'); }
    else { setMsg('wm-pw2','✔ Mots de passe identiques','ok'); setInp('wr-pw2','ok'); }
  };

  window.wSubmitReg = function() {
    wClearAlert('wa-reg');
    const em = $id('wr-email').value.trim();
    const em2= $id('wr-email2').value.trim();
    const pw = $id('wr-pw').value;
    const pw2= $id('wr-pw2').value;

    if (!em)           return showAlert('wa-reg','wa-reg-txt','Veuillez entrer votre adresse courriel.');
    if (!validFmt(em)) return showAlert('wa-reg','wa-reg-txt','Adresse courriel invalide. Exemple : nom@gmail.com');
    if (!validDomain(em)) return showAlert('wa-reg','wa-reg-txt','Ce domaine courriel n\'est pas reconnu.');
    if (em !== em2)    return showAlert('wa-reg','wa-reg-txt','Les adresses courriel ne correspondent pas.');
    if (pw.length < 8) return showAlert('wa-reg','wa-reg-txt','Mot de passe trop court (8 caractères minimum).');
    if (pw !== pw2)    return showAlert('wa-reg','wa-reg-txt','Les mots de passe ne correspondent pas.');
    if (DB[em])        return showAlert('wa-reg','wa-reg-txt','Ce courriel est déjà enregistré. Connectez-vous.');

    DB[em] = { pw };

    $id('wiki-panel-reg').style.display = 'none';
    $id('wiki-tabs').style.display = 'none';
    $id('wiki-success').style.display = 'block';
    $id('wiki-modal-title').textContent = 'Inscription réussie !';
  };

  window.wSubmitLog = function() {
    wClearAlert('wa-log');
    const em = $id('wl-email').value.trim();
    const pw = $id('wl-pw').value;

    if (!em)            return showAlert('wa-log','wa-log-txt','Veuillez entrer votre adresse courriel.');
    if (!validFmt(em))  return showAlert('wa-log','wa-log-txt','Format de courriel invalide.');
    if (!pw)            return showAlert('wa-log','wa-log-txt','Veuillez entrer votre mot de passe.');
    if (!DB[em])        return showAlert('wa-log','wa-log-txt','Aucun compte trouvé. Inscrivez-vous d\'abord.');
    if (DB[em].pw !== pw) return showAlert('wa-log','wa-log-txt','Mot de passe incorrect. Réessayez.');

    ME = em;
    updateBtn();
    showLoggedIn();
  };

  function showLoggedIn() {
    $id('wiki-panel-reg').style.display = 'none';
    $id('wiki-panel-log').style.display = 'none';
    $id('wiki-success').style.display = 'none';
    $id('wiki-tabs').style.display = 'none';
    $id('wiki-loggedin').style.display = 'block';
    $id('wk-avatar').textContent = ME.charAt(0).toUpperCase();
    $id('wk-greet').textContent = 'Bonjour, ' + ME.split('@')[0] + ' !';
    $id('wk-email').textContent = ME;
    $id('wiki-modal-title').textContent = 'Mon compte';
  }

  window.wLogout = function() {
    ME = null;
    updateBtn();
    wikiClose();
    wikiTab('reg');
    ['wr-email','wr-email2','wr-pw','wr-pw2','wl-email','wl-pw'].forEach(id => {
      const el = $id(id); if(el){ el.value=''; el.className='wh-input'; }
    });
    ['wm-email','wm-email2','wm-pw2'].forEach(id => setMsg(id,'',''));
    $id('wstr-fill').style.cssText = 'width:0%';
    $id('wstr-lbl').textContent = '';
  };

  function updateBtn() {
    $id('wiki-btn-txt').textContent = ME ? ME.split('@')[0] : 'Créer un compte';
  }
})();

  (function() {

    const DB = {};
    let ME = null;

    const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const VALID_TLDS = ['com','org','net','edu','gov','ca','fr','uk','de','io','co',
      'us','eu','be','ch','au','nz','jp','br','mx','in','info','biz','me'];

    function validFmt(e) { return EMAIL_RE.test(e); }
    function validDomain(e) {
      const d = (e.split('@')[1]||'').toLowerCase();
      const tld = d.split('.').pop();
      return VALID_TLDS.includes(tld) && d.includes('.') && tld.length >= 2;
    }

    function $id(i) { return document.getElementById(i); }
    function setMsg(id, txt, type) {
      const el = $id(id);
      el.textContent = txt;
      el.className = 'wh-msg' + (txt ? ' wh-show wh-'+type : '');
    }
    function setInp(id, state) {
      const el = $id(id);
      el.classList.remove('wh-err','wh-ok');
      if (state) el.classList.add('wh-'+state);
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

    window.wikiOpen = function() {
      if (ME) { showLoggedIn(); }
      $id('wiki-overlay').classList.add('wiki-open');
    };
    window.wikiClose = function() { $id('wiki-overlay').classList.remove('wiki-open'); };
    window.wikiOverlayClick = function(e) { if(e.target===$id('wiki-overlay')) wikiClose(); };

    document.addEventListener('keydown', e => { if(e.key==='Escape') wikiClose(); });

    window.wikiTab = function(t) {
      $id('wiki-tab-reg').classList.toggle('wh-active', t==='reg');
      $id('wiki-tab-log').classList.toggle('wh-active', t==='log');
      $id('wiki-panel-reg').style.display = t==='reg' ? '' : 'none';
      $id('wiki-panel-log').style.display = t==='log' ? '' : 'none';
      $id('wiki-success').style.display = 'none';
      $id('wiki-loggedin').style.display = 'none';
      $id('wiki-tabs').style.display = '';
      $id('wiki-modal-title').textContent = t==='reg' ? 'Rejoindre le site' : 'Se connecter';
    };

    window.wvEmailLive = function(iid, mid) {
      const v = $id(iid).value.trim();
      if (!v) { setMsg(mid,'',''); setInp(iid,null); return; }
      if (!validFmt(v)) { setMsg(mid,'Format invalide – ex: nom@gmail.com','err'); setInp(iid,'err'); }
      else if (!validDomain(v)) { setMsg(mid,'⚠ Domaine inconnu – vérifiez votre adresse','warn'); setInp(iid,'err'); }
      else { setMsg(mid,'✔ Adresse valide','ok'); setInp(iid,'ok'); }
    };
    window.wvEmailBlur = function(iid, mid) {
      wvEmailLive(iid, mid);
      if (!$id(iid).value.trim()) { setMsg(mid,'Ce champ est requis.','err'); setInp(iid,'err'); }
    };

    window.wvEmailMatch = function() {
      const a = $id('wr-email').value.trim(), b = $id('wr-email2').value.trim();
      if (!b) { setMsg('wm-email2','',''); setInp('wr-email2',null); return; }
      if (a!==b) { setMsg('wm-email2','Les courriels ne correspondent pas.','err'); setInp('wr-email2','err'); }
      else { setMsg('wm-email2','✔ Courriels identiques','ok'); setInp('wr-email2','ok'); }
    };

    window.wvStrength = function() {
      const pw = $id('wr-pw').value;
      let s = 0;
      if (pw.length >= 8) s++;
      if (/[A-Z]/.test(pw)) s++;
      if (/[0-9]/.test(pw)) s++;
      if (/[^A-Za-z0-9]/.test(pw)) s++;
      const levels = [
        {w:'0%',bg:'#eee',txt:''},
        {w:'25%',bg:'#d33',txt:'Très faible'},
        {w:'50%',bg:'#e68a00',txt:'Moyen'},
        {w:'75%',bg:'#3a7d44',txt:'Fort'},
        {w:'100%',bg:'#14866d',txt:'Très fort'},
      ];
      const l = levels[s];
      $id('wstr-fill').style.cssText = `width:${l.w};background:${l.bg}`;
      const lbl = $id('wstr-lbl');
      lbl.textContent = l.txt; lbl.style.color = l.bg;
    };

    window.wvPwMatch = function() {
      const a = $id('wr-pw').value, b = $id('wr-pw2').value;
      if (!b) { setMsg('wm-pw2','',''); setInp('wr-pw2',null); return; }
      if (a!==b) { setMsg('wm-pw2','Les mots de passe ne correspondent pas.','err'); setInp('wr-pw2','err'); }
      else { setMsg('wm-pw2','✔ Mots de passe identiques','ok'); setInp('wr-pw2','ok'); }
    };

    window.wSubmitReg = function() {
      wClearAlert('wa-reg');
      const em = $id('wr-email').value.trim();
      const em2= $id('wr-email2').value.trim();
      const pw = $id('wr-pw').value;
      const pw2= $id('wr-pw2').value;

      if (!em)           return showAlert('wa-reg','wa-reg-txt','Veuillez entrer votre adresse courriel.');
      if (!validFmt(em)) return showAlert('wa-reg','wa-reg-txt','Adresse courriel invalide. Exemple : nom@gmail.com');
      if (!validDomain(em)) return showAlert('wa-reg','wa-reg-txt','Ce domaine courriel n\'est pas reconnu.');
      if (em !== em2)    return showAlert('wa-reg','wa-reg-txt','Les adresses courriel ne correspondent pas.');
      if (pw.length < 8) return showAlert('wa-reg','wa-reg-txt','Mot de passe trop court (8 caractères minimum).');
      if (pw !== pw2)    return showAlert('wa-reg','wa-reg-txt','Les mots de passe ne correspondent pas.');
      if (DB[em])        return showAlert('wa-reg','wa-reg-txt','Ce courriel est déjà enregistré. Connectez-vous.');

      DB[em] = { pw };

      $id('wiki-panel-reg').style.display = 'none';
      $id('wiki-tabs').style.display = 'none';
      $id('wiki-success').style.display = 'block';
      $id('wiki-modal-title').textContent = 'Inscription réussie !';
    };

    window.wSubmitLog = function() {
      wClearAlert('wa-log');
      const em = $id('wl-email').value.trim();
      const pw = $id('wl-pw').value;

      if (!em)            return showAlert('wa-log','wa-log-txt','Veuillez entrer votre adresse courriel.');
      if (!validFmt(em))  return showAlert('wa-log','wa-log-txt','Format de courriel invalide.');
      if (!pw)            return showAlert('wa-log','wa-log-txt','Veuillez entrer votre mot de passe.');
      if (!DB[em])        return showAlert('wa-log','wa-log-txt','Aucun compte trouvé. Inscrivez-vous d\'abord.');
      if (DB[em].pw !== pw) return showAlert('wa-log','wa-log-txt','Mot de passe incorrect. Réessayez.');

      ME = em;
      updateBtn();
      showLoggedIn();
    };

    function showLoggedIn() {
      $id('wiki-panel-reg').style.display = 'none';
      $id('wiki-panel-log').style.display = 'none';
      $id('wiki-success').style.display = 'none';
      $id('wiki-tabs').style.display = 'none';
      $id('wiki-loggedin').style.display = 'block';
      $id('wk-avatar').textContent = ME.charAt(0).toUpperCase();
      $id('wk-greet').textContent = 'Bonjour, ' + ME.split('@')[0] + ' !';
      $id('wk-email').textContent = ME;
      $id('wiki-modal-title').textContent = 'Mon compte';
    }

    window.wLogout = function() {
      ME = null;
      updateBtn();
      wikiClose();
      wikiTab('reg');
      ['wr-email','wr-email2','wr-pw','wr-pw2','wl-email','wl-pw'].forEach(id => {
        const el = $id(id); if(el){ el.value=''; el.className='wh-input'; }
      });
      ['wm-email','wm-email2','wm-pw2'].forEach(id => setMsg(id,'',''));
      $id('wstr-fill').style.cssText = 'width:0%';
      $id('wstr-lbl').textContent = '';
    };

    function updateBtn() {
      $id('wiki-btn-txt').textContent = ME ? ME.split('@')[0] : 'Créer un compte';
    }
  })();
  
      
import { createClient } from '@supabase/supabase-js'


    const supabaseUrl = 'https://dtwlzarqmeaxyjdiipdr.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2x6YXJxbWVheHlqZGlpcGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjM1OTYsImV4cCI6MjA5MzAzOTU5Nn0.YgOTZqut_2lXjTjXSnUn4rWRR7EmXf1aPcXEZxyDNwE'
    const supabase = createClient(supabaseUrl, supabaseKey)


    async function registerUser(Adresse courriel, Mot de passe) {
      const { data, error } = await supabase.auth.signUp({
        Adresse courriel: emailInput,
        Mot de passe: passwordInput,
      })

      if (error) {
        console.error('Registration failed:', error.message)
        return null
      }

      console.log('User registered successfully:', data.user)
      return data.user
    }

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault()

      const Adresse courriel = document.getElementById('email-field').value
      const Mot de passe = document.getElementById('password-field').value

      await registerUser(email, password)
    })

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const SUPABASE_URL = "https://dtwlzarqmeaxyjdiipdr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2x6YXJxbWVheHlqZGlpcGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjM1OTYsImV4cCI6MjA5MzAzOTU5Nn0.YgOTZqut_2lXjTjXSnUn4rWRR7EmXf1aPcXEZxyDNwE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const Se Connecter = document.getElementById("Se connecter");
const S'inscrire = document.getElementById("btnRegister");

const LoginContainer = document.getElementById("loginFormContainer");
const RegisterContainer = document.getElementById("registerFormContainer");


const LoginForm = document.getElementById("loginForm");
const RegisterForm = document.getElementById("registerForm");

const LoginError = document.getElementById("loginError");
const RegisterError = document.getElementById("registerError")


const LoginEmail = document.getElementById("loginEmail");
const LoginPassword = document.getElementById("loginPassword");



const RegisterEmail = document.getElementById("registerEmail");
const RegisterPassword = document.getElementById("registerPassword");
const RegisterPrenom = document.getElementById("registerPrenom");
const RegisterNom = document.getElementById("registerNom");


BtnLogin.addEventListener("click", () => {
    LoginContainer.classList.remove("hidden");
    RegisterContainer.classList.add("hidden");
    LoginError.textContent = "";
});


BtnRegister.addEventListener("click", () => {
    RegisterContainer.classList.remove("hidden");
    LoginContainer.classList.add("hidden");
    LoginError.textContent = "";
});



function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
}





function validatePassword (password) {
    const miniLength = /.{6,}/;
    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%?&*(),.?":{}|<>]/;


    return (
        miniLength.test(password) &&
        lowercase.test(password) &&
        uppercase.test(password) &&
        number.test(password) &&
        specialChar.test(password)
    );
}

console.log("Tentative inscription", Email, Prenom, Nom);



RegisterForm.addEventListener("submit", async (event) => {
    event.preventDefault();


    const Email = RegisterEmail.value.trim();
    const Password = RegisterPassword.value;
    const Prenom = RegisterPrenom.value.trim();
    const Nom = RegisterNom.value.trim();



    
    if (!validateEmail(Email)) {
        RegisterError.textContent = "Adresse email invalide.";
        return;
    }

    
    if (!validatePassword(Password)) {
        RegisterError.textContent = "Le mot de passe doit contenir au moins 6 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial.";
        return;
    }
    RegisterError.textContent ="";


const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
        data: {
            prenom: prenom,
            nom: nom
        }
    }
});

    if (error) {
        RegisterError.textContent = error.message;
        return;
    }
console.log("Réponse Supabase", data, error);



    RegisterError.textContent = "";
    LoginContainer.classList.remove("hidden");
    RegisterContainer.classList.add("hidden");

}

)

});
