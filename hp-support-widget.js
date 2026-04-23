(function () {
  'use strict';

  function init() {
    if (document.getElementById('hp-support-trigger')) return;

    var GIF_URL = 'https://assets.cdn.filesafe.space/fjZxRMubk5kWXBOExKNb/media/69e8b483717d5dd4e1026e5a.gif';

    // GHL user email injected by HighLevel template variable.
    // In HighLevel header tracking code, add BEFORE this script:
    //   <script>window.HP_USER_EMAIL = '{{user.email}}';</script>
    var USER_EMAIL = (window.HP_USER_EMAIL || '').trim();

    // Your Cloudflare Worker URL — replace after deploying hp-tickets-worker.js
    var WORKER_URL = 'https://hp-tickets-worker.YOUR_ACCOUNT.workers.dev';

    /* ── STYLES ────────────────────────────────────────────────────────── */
    var css = ''
      + '#hp-support-trigger {'
      + '  width:40px;height:40px;border-radius:50%;border:none;padding:0;'
      + '  overflow:hidden;background:transparent;cursor:pointer;'
      + '  z-index:2147483647;transition:transform .2s ease;user-select:none;'
      + '  flex-shrink:0;align-self:center;margin:0 4px;'
      + '}'
      + '#hp-support-trigger:hover{transform:scale(1.12);}'
      + '#hp-support-trigger img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;pointer-events:none;}'

      + '#hp-support-panel{'
      + '  position:fixed;width:360px;height:520px;background:#f2f2f7;'
      + '  border-radius:18px;box-shadow:0 10px 50px rgba(0,0,0,.22);'
      + '  z-index:2147483646;display:flex;flex-direction:column;overflow:hidden;'
      + '  font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;'
      + '  opacity:0;transform:translateY(-10px) scale(.95);pointer-events:none;'
      + '  transition:opacity .25s ease,transform .25s ease;'
      + '}'
      + '#hp-support-panel.hp-open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}'

      /* Header — scoped under panel ID to avoid leaking into HL's own classes */
      + '#hp-support-panel .hp-panel-header{background:#1a1a2e;padding:24px 20px;color:#fff!important;position:relative;flex-shrink:0;}'
      + '#hp-support-panel .hp-avatar{width:44px;height:44px;background:#202b31;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;margin-bottom:12px;color:#fff!important;letter-spacing:.5px;}'
      + '#hp-support-panel .hp-panel-header h2{margin:0;font-size:22px;font-weight:700;line-height:1.35;color:#fff!important;}'
      + '#hp-support-panel .hp-close-x{position:absolute;top:14px;right:14px;width:30px;height:30px;background:rgba(255,255,255,.12);border:none;color:#fff!important;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s;font-family:inherit;}'
      + '#hp-support-panel .hp-close-x:hover{background:rgba(255,255,255,.22);}'

      /* Views */
      + '#hp-support-panel .hp-view{display:none;flex-direction:column;flex:1;overflow-y:auto;padding:14px;gap:10px;scrollbar-width:thin;}'
      + '#hp-support-panel .hp-view.hp-view-active{display:flex;}'

      /* Home view cards */
      + '#hp-support-panel .hp-section-label{font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.8px;padding:4px 2px 0;}'
      + '#hp-support-panel .hp-card{background:white;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);}'
      + '#hp-support-panel .hp-card a{display:flex;align-items:center;padding:15px 14px;text-decoration:none;border-bottom:1px solid #f2f2f2;transition:background .15s;gap:12px;}'
      + '#hp-support-panel .hp-card a:last-child{border-bottom:none;}'
      + '#hp-support-panel .hp-card a:hover{background:#fafafa;}'
      + '#hp-support-panel .hp-card-icon{font-size:20px;flex-shrink:0;}'
      + '#hp-support-panel .hp-card-text{flex:1;}'
      + '#hp-support-panel .hp-card-title{font-size:14px;font-weight:600;color:#4a6cf7;}'
      + '#hp-support-panel .hp-card-desc{font-size:12px;color:#999;margin-top:2px;}'
      + '#hp-support-panel .hp-card-arrow{color:#ccc;font-size:20px;}'
      + '#hp-support-panel .hp-submit-card{background:white;border-radius:14px;padding:15px;box-shadow:0 1px 4px rgba(0,0,0,.06);display:flex;align-items:center;gap:13px;text-decoration:none;transition:background .15s;}'
      + '#hp-support-panel .hp-submit-card:hover{background:#fafafa;}'
      + '#hp-support-panel .hp-submit-icon{width:44px;height:44px;background:#eff2ff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}'
      + '#hp-support-panel .hp-submit-text strong{display:block;font-size:14px;font-weight:600;color:#111;}'
      + '#hp-support-panel .hp-submit-text span{font-size:12px;color:#4a6cf7;display:flex;align-items:center;gap:5px;margin-top:3px;}'
      + '#hp-support-panel .hp-online-dot{display:inline-block;width:7px;height:7px;background:#22c55e;border-radius:50%;flex-shrink:0;}'

      /* Tickets view */
      + '#hp-support-panel .hp-state-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;text-align:center;}'
      + '#hp-support-panel .hp-state-msg{font-size:13px;color:#888;line-height:1.5;}'
      + '#hp-support-panel .hp-state-msg a{color:#4a6cf7;text-decoration:none;}'
      + '#hp-support-panel .hp-spinner{width:28px;height:28px;border:3px solid #eee;border-top-color:#4a6cf7;border-radius:50%;animation:hp-spin .7s linear infinite;}'
      + '@keyframes hp-spin{to{transform:rotate(360deg);}}'
      + '#hp-support-panel .hp-ticket-list{display:flex;flex-direction:column;gap:8px;}'
      + '#hp-support-panel .hp-ticket-item{background:white;border-radius:12px;padding:13px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);}'
      + '#hp-support-panel .hp-ticket-item-body{flex:1;min-width:0;}'
      + '#hp-support-panel .hp-ticket-item-title{font-size:13px;font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '#hp-support-panel .hp-ticket-item-date{font-size:11px;color:#aaa;margin-top:2px;}'
      + '#hp-support-panel .hp-ticket-item-link{font-size:12px;color:#4a6cf7;text-decoration:none;flex-shrink:0;font-weight:500;white-space:nowrap;}'
      + '#hp-support-panel .hp-ticket-item-link:hover{text-decoration:underline;}'
      + '#hp-support-panel .hp-tickets-header{font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.8px;padding:2px 2px 0;flex-shrink:0;}'

      /* Footer nav */
      + '#hp-support-panel .hp-footer-nav{display:flex;background:white;border-top:1px solid #ebebeb;padding:8px 0 10px;flex-shrink:0;}'
      + '#hp-support-panel .hp-footer-nav a,#hp-support-panel .hp-nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;color:#bbb;font-size:11px;font-weight:500;padding:4px 0;transition:color .15s;background:none;border:none;cursor:pointer;font-family:inherit;}'
      + '#hp-support-panel .hp-footer-nav a.hp-active,#hp-support-panel .hp-nav-btn.hp-active,#hp-support-panel .hp-footer-nav a:hover,#hp-support-panel .hp-nav-btn:hover{color:#1a1a2e;}'
      + '#hp-support-panel .hp-footer-nav svg,#hp-support-panel .hp-nav-btn svg{width:20px;height:20px;}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* ── TRIGGER BUTTON ────────────────────────────────────────────────── */
    var trigger = document.createElement('button');
    trigger.id = 'hp-support-trigger';
    trigger.title = 'Support';
    var img = document.createElement('img');
    img.alt = 'Support';
    trigger.appendChild(img);
    trigger.style.display = 'none';
    document.body.appendChild(trigger);

    // Capture first frame as static; animate on hover. Falls back if CORS blocked.
    var staticFrame = null;
    var loader = new Image();
    loader.crossOrigin = 'anonymous';
    loader.onload = function () {
      try {
        var c = document.createElement('canvas');
        c.width = loader.naturalWidth || 40;
        c.height = loader.naturalHeight || 40;
        c.getContext('2d').drawImage(loader, 0, 0);
        staticFrame = c.toDataURL('image/png');
        img.src = staticFrame;
      } catch (e) { img.src = GIF_URL; }
    };
    loader.onerror = function () { img.src = GIF_URL; };
    loader.src = GIF_URL;

    trigger.addEventListener('mouseenter', function () { if (staticFrame) img.src = GIF_URL; });
    trigger.addEventListener('mouseleave', function () { if (staticFrame) img.src = staticFrame; });

    /* ── ADAPTIVE NAVBAR INJECTION ──────────────────────────────────────── */
    function findNavContainer() {
      var allEls = document.querySelectorAll('*');
      var best = null, bestWidth = Infinity;
      for (var i = 0; i < allEls.length; i++) {
        var el = allEls[i];
        if (el === trigger || el.contains(trigger)) continue;
        var rect = el.getBoundingClientRect();
        if (rect.height < 10 || rect.height > 80) continue;
        if (rect.top < 0 || rect.top > 40) continue;
        if (rect.right < window.innerWidth * 0.5) continue;
        var kids = el.children, iconCount = 0;
        for (var j = 0; j < kids.length; j++) {
          var kr = kids[j].getBoundingClientRect();
          if (kr.width >= 20 && kr.width <= 160 && kr.height >= 20 && kr.height <= 60) iconCount++;
        }
        if (iconCount >= 3 && rect.width < bestWidth) { best = el; bestWidth = rect.width; }
      }
      return best;
    }

    function injectAdaptive() {
      var container = findNavContainer();
      if (!container) return false;
      document.body.removeChild(trigger);
      container.insertBefore(trigger, container.firstChild);
      trigger.style.position = 'static';
      trigger.style.top = 'auto';
      trigger.style.right = 'auto';
      trigger.style.display = 'inline-flex';
      return true;
    }

    if (!injectAdaptive()) {
      var obs = new MutationObserver(function () { if (injectAdaptive()) obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () {
        obs.disconnect();
        if (trigger.parentNode === document.body) {
          trigger.style.position = 'fixed';
          trigger.style.top = '9px';
          trigger.style.right = '95px';
          trigger.style.display = 'inline-flex';
        }
      }, 6000);
    }

    /* ── PANEL HTML ────────────────────────────────────────────────────── */
    var panel = document.createElement('div');
    panel.id = 'hp-support-panel';
    panel.innerHTML = ''
      // Header
      + '<div class="hp-panel-header">'
      +   '<div class="hp-avatar">HP</div>'
      +   '<button class="hp-close-x" id="hp-close-btn">&#x2715;</button>'
      +   '<h2>Hi there &#x1F44B;<br>How can we help?</h2>'
      + '</div>'

      // ── View: Home ──
      + '<div class="hp-view hp-view-active" id="hp-view-home">'
      +   '<p class="hp-section-label">Resources</p>'
      +   '<div class="hp-card">'
      +     '<a href="https://start.healthpreneurgroup.com/sop" target="_blank" rel="noopener">'
      +       '<span class="hp-card-icon">&#x1F4DA;</span>'
      +       '<div class="hp-card-text"><div class="hp-card-title">PCP Help Guides</div><div class="hp-card-desc">Browse our standard operating procedures</div></div>'
      +       '<span class="hp-card-arrow">&#x203A;</span>'
      +     '</a>'
      +   '</div>'
      +   '<a class="hp-submit-card" href="https://hbasupport.hipporello.net/desk/form/d272f9daf0f443fb92e6423bc9671f22" target="_blank" rel="noopener">'
      +     '<div class="hp-submit-icon">&#x1F4AC;</div>'
      +     '<div class="hp-submit-text">'
      +       '<strong>Submit a Tech Ticket</strong>'
      +       '<span><span class="hp-online-dot"></span>Get Dedicated Expert Support</span>'
      +     '</div>'
      +   '</a>'
      + '</div>'

      // ── View: Tickets ──
      + '<div class="hp-view" id="hp-view-tickets">'
      +   '<p class="hp-tickets-header">Your Open Tickets</p>'
      +   '<div id="hp-tickets-loading" class="hp-state-wrap"><div class="hp-spinner"></div></div>'
      +   '<div id="hp-tickets-error" class="hp-state-wrap" style="display:none">'
      +     '<span style="font-size:24px">&#x26A0;&#xFE0F;</span>'
      +     '<p class="hp-state-msg">Couldn\'t load tickets.<br>'
      +       '<a href="https://hbasupport.hipporello.net/desk/form/d272f9daf0f443fb92e6423bc9671f22" target="_blank" rel="noopener">Submit a new ticket instead</a>'
      +     '</p>'
      +   '</div>'
      +   '<div id="hp-tickets-empty" class="hp-state-wrap" style="display:none">'
      +     '<span style="font-size:32px">&#x2705;</span>'
      +     '<p class="hp-state-msg">No open tickets found.<br>You\'re all caught up!</p>'
      +   '</div>'
      +   '<div id="hp-tickets-list" class="hp-ticket-list" style="display:none"></div>'
      + '</div>'

      // Footer nav
      + '<nav class="hp-footer-nav">'
      +   '<button class="hp-nav-btn hp-active" id="hp-nav-home">'
      +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home'
      +   '</button>'
      +   '<a href="https://start.healthpreneurgroup.com/sop" target="_blank" rel="noopener">'
      +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Help'
      +   '</a>'
      +   '<button class="hp-nav-btn" id="hp-nav-tickets">'
      +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Tickets'
      +   '</button>'
      + '</nav>';

    document.body.appendChild(panel);

    /* ── PANEL POSITIONING ───────────────────────────────────────────────── */
    function positionPanel() {
      var r = trigger.getBoundingClientRect();
      var pw = 360, rightGap = window.innerWidth - r.right;
      if (rightGap + pw > window.innerWidth) rightGap = window.innerWidth - pw - 8;
      if (rightGap < 8) rightGap = 8;
      panel.style.top = (r.bottom + 8) + 'px';
      panel.style.right = rightGap + 'px';
      panel.style.left = 'auto';
      panel.style.bottom = 'auto';
    }

    /* ── VIEW SWITCHING ──────────────────────────────────────────────────── */
    var viewHome    = document.getElementById('hp-view-home');
    var viewTickets = document.getElementById('hp-view-tickets');
    var navHome     = document.getElementById('hp-nav-home');
    var navTickets  = document.getElementById('hp-nav-tickets');

    function showView(name) {
      viewHome.classList.remove('hp-view-active');
      viewTickets.classList.remove('hp-view-active');
      navHome.classList.remove('hp-active');
      navTickets.classList.remove('hp-active');
      if (name === 'tickets') {
        viewTickets.classList.add('hp-view-active');
        navTickets.classList.add('hp-active');
        loadTickets();
      } else {
        viewHome.classList.add('hp-view-active');
        navHome.classList.add('hp-active');
      }
    }

    navHome.addEventListener('click', function () { showView('home'); });
    navTickets.addEventListener('click', function () { showView('tickets'); });

    /* ── TICKETS FETCH ───────────────────────────────────────────────────── */
    var ticketsCache = null; // cache result so repeat clicks don't re-fetch

    function loadTickets() {
      if (ticketsCache !== null) {
        renderTickets(ticketsCache);
        return;
      }

      var loadingEl = document.getElementById('hp-tickets-loading');
      var errorEl   = document.getElementById('hp-tickets-error');
      var emptyEl   = document.getElementById('hp-tickets-empty');
      var listEl    = document.getElementById('hp-tickets-list');

      // Show spinner
      loadingEl.style.display = 'flex';
      errorEl.style.display   = 'none';
      emptyEl.style.display   = 'none';
      listEl.style.display    = 'none';

      if (!USER_EMAIL) {
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'flex';
        return;
      }

      fetch(WORKER_URL + '?email=' + encodeURIComponent(USER_EMAIL))
        .then(function (res) {
          if (!res.ok) throw new Error('Worker responded ' + res.status);
          return res.json();
        })
        .then(function (data) {
          ticketsCache = data.tickets || [];
          renderTickets(ticketsCache);
        })
        .catch(function () {
          loadingEl.style.display = 'none';
          errorEl.style.display   = 'flex';
        });
    }

    function renderTickets(tickets) {
      var loadingEl = document.getElementById('hp-tickets-loading');
      var errorEl   = document.getElementById('hp-tickets-error');
      var emptyEl   = document.getElementById('hp-tickets-empty');
      var listEl    = document.getElementById('hp-tickets-list');

      loadingEl.style.display = 'none';
      errorEl.style.display   = 'none';

      if (tickets.length === 0) {
        emptyEl.style.display = 'flex';
        listEl.style.display  = 'none';
        return;
      }

      emptyEl.style.display = 'none';
      listEl.style.display  = 'flex';
      listEl.innerHTML = '';

      tickets.forEach(function (t) {
        var date = t.date ? new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        var item = document.createElement('div');
        item.className = 'hp-ticket-item';
        item.innerHTML = ''
          + '<div class="hp-ticket-item-body">'
          +   '<div class="hp-ticket-item-title">' + escHtml(t.title) + '</div>'
          +   (date ? '<div class="hp-ticket-item-date">' + date + '</div>' : '')
          + '</div>'
          + '<a class="hp-ticket-item-link" href="' + escHtml(t.url) + '" target="_blank" rel="noopener">View &#x2192;</a>';
        listEl.appendChild(item);
      });
    }

    function escHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /* ── PANEL OPEN / CLOSE ──────────────────────────────────────────────── */
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      positionPanel();
      panel.classList.toggle('hp-open');
    });

    document.getElementById('hp-close-btn').addEventListener('click', function () {
      panel.classList.remove('hp-open');
    });

    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== trigger) panel.classList.remove('hp-open');
    });

    panel.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  /* ── DOM READY ───────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
