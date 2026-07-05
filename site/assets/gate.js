/* ============================================================
   elip resources — access gate (link-triggered)
   The whole site is freely browsable. The gate only appears when a
   visitor clicks a curated OUTBOUND resource link (<a class="res">
   or any element with [data-gate]). Capture the lead once, store it
   in Supabase, then forward them to the resource. After that first
   unlock every resource link opens straight through.
   ============================================================ */
(function () {
  var STORAGE_KEY = 'elip_access';
  var cfg = window.ELIP_CONFIG || {};
  var source = (document.body.getAttribute('data-source') || 'general').toLowerCase();

  var ROLE_LABELS = {
    swe: 'Software Engineers',
    pm: 'Product Managers',
    consulting: 'Consultants',
    analyst: 'Analysts',
    general: 'job seekers'
  };
  var roleLabel = ROLE_LABELS[source] || ROLE_LABELS.general;

  function isUnlocked() {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
  }

  // ---- Supabase client (only if real keys are present) ----
  var supa = null;
  var configured = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf('YOUR_') !== 0 &&
                   cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf('YOUR_') !== 0;
  if (configured && window.supabase && window.supabase.createClient) {
    try { supa = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }
    catch (e) { console.warn('[elip] Supabase init failed:', e); }
  }
  if (!configured) {
    console.warn('[elip] Supabase not configured yet — capturing lead to localStorage only. Add your keys in assets/config.js.');
  }

  var waLink = (cfg.whatsappFor ? cfg.whatsappFor(source) : (cfg.WHATSAPP_COMMUNITY_URL || '#'));

  var GATE_SEL = 'a.res, a[data-gate]';

  // ============================================================
  //  Lock / unlock the outbound links themselves
  // ============================================================
  // Left-click interception alone is not enough: middle-click, ⌘/Ctrl-click
  // and "Open link in new tab" would follow the real href and skip the gate.
  // So while the visitor is un-gated we move each resource's real URL into
  // data-gate-href and neutralise the visible href. Once they convert we put
  // the real hrefs back and every link (incl. new-tab) works normally.
  function armLinks() {
    if (isUnlocked()) return;                 // already a lead → leave hrefs intact
    document.querySelectorAll(GATE_SEL).forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
      if (a.hasAttribute('data-gate-href')) return;
      a.setAttribute('data-gate-href', href);
      a.setAttribute('href', '#unlock');      // real destination now lives only in data-gate-href
    });
  }
  function disarmLinks() {
    document.querySelectorAll('a[data-gate-href]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('data-gate-href'));
      a.removeAttribute('data-gate-href');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', armLinks);
  else armLinks();

  // ============================================================
  //  Intercept clicks on gated outbound links
  // ============================================================
  // A gated link is a curated external resource: <a class="res"> or
  // anything explicitly marked [data-gate]. Site nav, WhatsApp/agent
  // CTAs and in-page anchors are NOT gated.
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest(GATE_SEL) : null;
    if (!a) return;
    // Real destination is stashed in data-gate-href while locked.
    var href = a.getAttribute('data-gate-href') || a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
    if (isUnlocked()) return;                 // already a lead → let the click through
    // Locked: swallow every click variant (incl. modifier / middle) and gate.
    ev.preventDefault();
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    openGate(href);
  }, true);

  // ============================================================
  //  Gate overlay
  // ============================================================
  var overlay = null;

  function closeGate() {
    if (!overlay) return;
    var el = overlay; overlay = null;
    el.classList.add('gate-done');
    document.body.classList.remove('gate-blur');
    document.documentElement.classList.remove('gate-open');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { if (el && el.parentNode) el.remove(); }, 400);
  }

  function onKey(e) { if (e.key === 'Escape') closeGate(); }

  function openGate(pendingUrl) {
    if (overlay) return;                        // already open

    overlay = document.createElement('div');
    overlay.className = 'gate';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="gate-card">' +
        '<button type="button" class="gate-close" aria-label="Close">&times;</button>' +
        '<div class="gate-brand"><span class="dot"></span>elip <small>/ resources</small></div>' +
        '<h2 class="gate-title">One step to open<br/>this resource 🎯</h2>' +
        '<p class="gate-sub">Tell us where to send the good stuff and this link — plus every other resource on the site — opens instantly.</p>' +
        '<form class="gate-form" novalidate>' +
          '<label>Name<input name="name" type="text" autocomplete="name" placeholder="Your name" required /></label>' +
          '<label>WhatsApp number<input name="whatsapp" type="tel" autocomplete="tel" placeholder="+91 98765 43210" required /></label>' +
          '<label>Email <span class="opt">(optional)</span><input name="email" type="email" autocomplete="email" placeholder="you@email.com" /></label>' +
          '<label>I\'m aiming for' +
            '<select name="role">' +
              '<option value="swe">Software Engineering</option>' +
              '<option value="pm">Product Management</option>' +
              '<option value="consulting">Consulting</option>' +
              '<option value="analyst">Analyst (Data / Business / Finance)</option>' +
              '<option value="general">Still figuring it out</option>' +
            '</select>' +
          '</label>' +
          '<p class="gate-err" hidden></p>' +
          '<button type="submit" class="btn btn-ink gate-submit">Open the resource →</button>' +
        '</form>' +
        '<a class="gate-community" href="' + waLink + '" target="_blank" rel="noopener">💬 Or join the WhatsApp community first →</a>' +
        '<p class="gate-fine">Free forever · no spam · we\'ll only ping you with genuinely useful things.</p>' +
      '</div>';

    // Lock scroll + blur background, mount overlay outside <body> so it stays sharp.
    document.documentElement.classList.add('gate-open');
    document.body.classList.add('gate-blur');
    document.documentElement.appendChild(overlay);

    // Preselect role from the page source.
    var roleSel = overlay.querySelector('select[name="role"]');
    if (roleSel && ROLE_LABELS[source]) roleSel.value = source;

    var form = overlay.querySelector('.gate-form');
    var errEl = overlay.querySelector('.gate-err');
    var submitBtn = overlay.querySelector('.gate-submit');
    overlay.querySelector('input[name="name"]').focus();

    // ---- Dismissal: close button, backdrop click, Escape ----
    overlay.querySelector('.gate-close').addEventListener('click', closeGate);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeGate(); });
    document.addEventListener('keydown', onKey);

    function showErr(msg) { errEl.textContent = msg; errEl.hidden = false; }

    function forward(win) {
      // Send the visitor to the resource they originally clicked.
      if (!pendingUrl) return;
      if (win && !win.closed) { try { win.opener = null; } catch (e) {} win.location = pendingUrl; }
      else window.open(pendingUrl, '_blank', 'noopener');
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      errEl.hidden = true;
      // Use FormData rather than form.name/form.email — `form.name` collides with
      // the HTMLFormElement.name property and would not return the input.
      var fd = new FormData(form);
      var data = {
        name: (fd.get('name') || '').trim(),
        whatsapp: (fd.get('whatsapp') || '').trim(),
        email: (fd.get('email') || '').trim() || null,
        role: fd.get('role'),
        source_page: source
      };
      if (!data.name) return showErr('Please add your name.');
      if (!data.whatsapp || data.whatsapp.replace(/\D/g, '').length < 8) return showErr('Please add a valid WhatsApp number.');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Opening…';

      // Open the destination tab NOW, inside the user gesture, so the async
      // lead-insert below can't get the pop-up blocked. We set its URL once done.
      var win = pendingUrl ? window.open('about:blank', '_blank') : null;

      function unlock() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), source: source })); } catch (e) {}
        disarmLinks();          // restore real hrefs so every link now opens directly
        forward(win);
        closeGate();
      }
      function fail(msg) {
        // Never trap the user behind a backend hiccup — queue locally and let them through.
        console.warn('[elip] lead insert failed, storing locally:', msg);
        try {
          var q = JSON.parse(localStorage.getItem('elip_leads_queue') || '[]');
          q.push(Object.assign({ ts: new Date().toISOString() }, data));
          localStorage.setItem('elip_leads_queue', JSON.stringify(q));
        } catch (e) {}
        unlock();
      }

      if (supa) {
        supa.from('leads').insert([data]).then(function (res) {
          if (res && res.error) fail(res.error.message); else unlock();
        }).catch(function (e) { fail(e && e.message); });
      } else {
        fail('supabase-not-configured');
      }
    });
  }
})();
