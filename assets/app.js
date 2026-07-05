// elip resources — light interactivity
(function () {
  // Resolve WhatsApp community + Elip agent links from config.js
  var cfg = window.ELIP_CONFIG || {};
  var src = (document.body.getAttribute('data-source') || 'general').toLowerCase();
  var community = cfg.whatsappFor ? cfg.whatsappFor(src) : (cfg.WHATSAPP_COMMUNITY_URL || '#');
  document.querySelectorAll('[data-wa-community]').forEach(function (a) {
    a.setAttribute('href', community);
    a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
  });
  document.querySelectorAll('[data-elip-agent]').forEach(function (a) {
    a.setAttribute('href', cfg.ELIP_AGENT_URL || 'https://tryelip.ai');
    a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
  });
})();
(function () {
  // mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // jump-nav active state (track pages)
  var jumpLinks = Array.prototype.slice.call(document.querySelectorAll('.jump a'));
  if (jumpLinks.length) {
    var targets = jumpLinks.map(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          jumpLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { if (t) spy.observe(t); });
  }
})();
