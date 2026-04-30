(function () {
  'use strict';

  function init() {
    if (document.getElementById('hp-support-trigger')) return;

    // After SPA navigation the nav bar is rebuilt, destroying the trigger with it.
    // The panel stays in body since it's a direct child. Remove it so the fresh
    // init doesn't end up with two panels and a broken close-button listener.
    var stalePanel = document.getElementById('hp-support-panel');
    if (stalePanel && stalePanel.parentNode) stalePanel.parentNode.removeChild(stalePanel);

    var path = window.location.pathname;
    var skipPaths = ['/workflow/', '/email-builder/', '/funnel-builder/', '/page-builder/', '/form-builder/', '/survey-builder/'];
    for (var s = 0; s < skipPaths.length; s++) {
      if (path.indexOf(skipPaths[s]) !== -1) return;
    }

    var GIF_URL = 'https://assets.cdn.filesafe.space/fjZxRMubk5kWXBOExKNb/media/69e8b483717d5dd4e1026e5a.gif';

    /* ── STYLES ────────────────────────────────────────────────────────── */
    var css = ''
      + '#hp-support-trigger {'
      + '  width:40px;'
      + '  height:40px;'
      + '  border-radius:50%;'
      + '  border:none;'
      + '  padding:0;'
      + '  overflow:hidden;'
      + '  background:transparent;'
      + '  cursor:pointer;'
      + '  z-index:2147483647;'
      + '  transition:transform .2s ease;'
      + '  user-select:none;'
      + '  flex-shrink:0;'
      + '  align-self:center;'
      + '  margin:0 4px;'
      + '}'
      + '#hp-support-trigger:hover{transform:scale(1.12);}'
      + '#hp-support-trigger img{'
      + '  width:100%;height:100%;'
      + '  object-fit:cover;'
      + '  border-radius:50%;'
      + '  display:block;'
      + '  pointer-events:none;'
      + '}'
      + '#hp-support-panel{'
      + '  position:fixed;'
      + '  width:360px;'
      + '  height:520px;'
      + '  background:#f2f2f7;'
      + '  border-radius:18px;'
      + '  box-shadow:0 10px 50px rgba(0,0,0,.22);'
      + '  z-index:2147483646;'
      + '  display:flex;'
      + '  flex-direction:column;'
      + '  overflow:hidden;'
      + '  font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;'
      + '  opacity:0;'
      + '  transform:translateY(-10px) scale(.95);'
      + '  pointer-events:none;'
      + '  transition:opacity .25s ease,transform .25s ease;'
      + '}'
      + '#hp-support-panel.hp-open{'
      + '  opacity:1;'
      + '  transform:translateY(0) scale(1);'
      + '  pointer-events:all;'
      + '}'
      /* All class selectors scoped under #hp-support-panel to prevent leaking into HL's own styles */
      + '#hp-support-panel .hp-panel-header{'
      + '  background:#1a1a2e;'
      + '  padding:24px 20px;'
      + '  color:#fff!important;'
      + '  position:relative;'
      + '  flex-shrink:0;'
      + '}'
      + '#hp-support-panel .hp-avatar{'
      + '  width:44px;height:44px;'
      + '  background:#202b31;'
      + '  border-radius:12px;'
      + '  display:flex;align-items:center;justify-content:center;'
      + '  font-weight:800;font-size:15px;'
      + '  margin-bottom:12px;color:#fff!important;letter-spacing:.5px;'
      + '}'
      + '#hp-support-panel .hp-panel-header h2{'
      + '  margin:0;font-size:22px;font-weight:700;line-height:1.35;color:#fff!important;'
      + '}'
      + '#hp-support-panel .hp-close-x{'
      + '  position:absolute;top:14px;right:14px;'
      + '  width:30px;height:30px;'
      + '  background:rgba(255,255,255,.12);'
      + '  border:none;color:#fff!important;border-radius:50%;cursor:pointer;'
      + '  font-size:14px;display:flex;align-items:center;justify-content:center;'
      + '  transition:background .15s;font-family:inherit;'
      + '}'
      + '#hp-support-panel .hp-close-x:hover{background:rgba(255,255,255,.22);}'
      + '#hp-support-panel .hp-body{'
      + '  flex:1;overflow-y:auto;padding:14px;'
      + '  display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;'
      + '}'
      + '#hp-support-panel .hp-section-label{'
      + '  font-size:11px;font-weight:600;color:#999;'
      + '  text-transform:uppercase;letter-spacing:.8px;padding:4px 2px 0;'
      + '}'
      + '#hp-support-panel .hp-card{background:white;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);}'
      + '#hp-support-panel .hp-card a{'
      + '  display:flex;align-items:center;padding:15px 14px;'
      + '  text-decoration:none;border-bottom:1px solid #f2f2f2;'
      + '  transition:background .15s;gap:12px;'
      + '}'
      + '#hp-support-panel .hp-card a:last-child{border-bottom:none;}'
      + '#hp-support-panel .hp-card a:hover{background:#fafafa;}'
      + '#hp-support-panel .hp-card-icon{font-size:20px;flex-shrink:0;}'
      + '#hp-support-panel .hp-card-text{flex:1;}'
      + '#hp-support-panel .hp-card-title{font-size:14px;font-weight:600;color:#4a6cf7;}'
      + '#hp-support-panel .hp-card-desc{font-size:12px;color:#999;margin-top:2px;}'
      + '#hp-support-panel .hp-card-arrow{color:#ccc;font-size:20px;}'
      + '#hp-support-panel .hp-ticket-card{'
      + '  background:white;border-radius:14px;padding:15px;'
      + '  box-shadow:0 1px 4px rgba(0,0,0,.06);'
      + '  display:flex;align-items:center;gap:13px;'
      + '  text-decoration:none;transition:background .15s;'
      + '}'
      + '#hp-support-panel .hp-ticket-card:hover{background:#fafafa;}'
      + '#hp-support-panel .hp-ticket-icon-wrap{'
      + '  width:44px;height:44px;background:#eff2ff;border-radius:12px;'
      + '  display:flex;align-items:center;justify-content:center;'
      + '  font-size:22px;flex-shrink:0;'
      + '}'
      + '#hp-support-panel .hp-ticket-text strong{display:block;font-size:14px;font-weight:600;color:#111;}'
      + '#hp-support-panel .hp-ticket-text span{'
      + '  font-size:12px;color:#4a6cf7;'
      + '  display:flex;align-items:center;gap:5px;margin-top:3px;'
      + '}'
      + '#hp-support-panel .hp-online-dot{'
      + '  display:inline-block;width:7px;height:7px;'
      + '  background:#22c55e;border-radius:50%;flex-shrink:0;'
      + '}'
      + '#hp-support-panel .hp-footer-nav{'
      + '  display:flex;background:white;'
      + '  border-top:1px solid #ebebeb;padding:8px 0 10px;flex-shrink:0;'
      + '}'
      + '#hp-support-panel .hp-footer-nav a{'
      + '  flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;'
      + '  text-decoration:none;color:#bbb;font-size:11px;font-weight:500;'
      + '  padding:4px 0;transition:color .15s;'
      + '}'
      + '#hp-support-panel .hp-footer-nav a.hp-active,#hp-support-panel .hp-footer-nav a:hover{color:#1a1a2e;}'
      + '#hp-support-panel .hp-footer-nav svg{width:20px;height:20px;}';

    if (!document.getElementById('hp-support-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'hp-support-styles';
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    }

    /* ── TRIGGER BUTTON ────────────────────────────────────────────────── */
    var trigger = document.createElement('button');
    trigger.id = 'hp-support-trigger';
    trigger.title = 'Support';
    var img = document.createElement('img');
    img.alt = 'Support';
    trigger.appendChild(img);
    trigger.style.display = 'none';
    document.body.appendChild(trigger);

    // Capture first frame as static default; swap to live GIF on hover.
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
      } catch (e) {
        img.src = GIF_URL;
      }
    };
    loader.onerror = function () { img.src = GIF_URL; };
    loader.src = GIF_URL;

    trigger.addEventListener('mouseenter', function () {
      if (staticFrame) img.src = GIF_URL;
    });
    trigger.addEventListener('mouseleave', function () {
      if (staticFrame) img.src = staticFrame;
    });

    /* ── ADAPTIVE INJECTION ─────────────────────────────────────────────
       Two anchors:
       1. "Ask AI" text button  → main nav pages (insert before phone icon)
       2. User avatar           → editor/config pages (insert before avatar)
       Both are always present in their respective top bars and insert the
       trigger as a proper flex sibling, so nothing overlaps.
    ────────────────────────────────────────────────────────────────────── */
    function injectAdaptive() {
      var allEls = document.querySelectorAll('*');
      var askAIEl = null;
      var avatarEl = null;
      var bestAvatarRight = 0;

      for (var i = 0; i < allEls.length; i++) {
        var el = allEls[i];
        if (el === trigger || el.contains(trigger)) continue;
        var rect = el.getBoundingClientRect();
        if (rect.top < 0 || rect.top > 60) continue;

        // Primary anchor: Ask AI button
        if (!askAIEl && rect.width >= 50 && rect.width <= 220 && rect.height >= 20 && rect.height <= 55) {
          var txt = (el.innerText || '').replace(/\s+/g, ' ').trim();
          if (txt.indexOf('Ask AI') !== -1) askAIEl = el;
        }

        // Fallback anchor: user avatar — rightmost small square element in top bar
        if (rect.width >= 24 && rect.width <= 54 && rect.height >= 24 && rect.height <= 54) {
          if (rect.right > window.innerWidth - 80 && rect.right > bestAvatarRight) {
            avatarEl = el;
            bestAvatarRight = rect.right;
          }
        }
      }

      if (askAIEl && askAIEl.parentNode) {
        if (trigger.parentNode) trigger.parentNode.removeChild(trigger);
        var phoneEl = askAIEl.previousElementSibling;
        askAIEl.parentNode.insertBefore(trigger, phoneEl || askAIEl);
        trigger.style.position = 'static';
        trigger.style.top = 'auto'; trigger.style.right = 'auto'; trigger.style.bottom = 'auto';
        trigger.style.display = 'inline-flex';
        return true;
      }

      if (avatarEl && avatarEl.parentNode) {
        if (trigger.parentNode) trigger.parentNode.removeChild(trigger);
        avatarEl.parentNode.insertBefore(trigger, avatarEl);
        trigger.style.position = 'static';
        trigger.style.top = 'auto'; trigger.style.right = 'auto'; trigger.style.bottom = 'auto';
        trigger.style.display = 'inline-flex';
        return true;
      }

      return false;
    }

    if (!injectAdaptive()) {
      var obsTimer = null;
      var obs = new MutationObserver(function () {
        clearTimeout(obsTimer);
        obsTimer = setTimeout(function () {
          if (injectAdaptive()) obs.disconnect();
        }, 150);
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { obs.disconnect(); }, 6000);
    }

    /* ── PANEL ─────────────────────────────────────────────────────────── */
    var panel = document.createElement('div');
    panel.id = 'hp-support-panel';
    panel.innerHTML = ''
      + '<div class="hp-panel-header">'
      + '  <div class="hp-avatar">HP</div>'
      + '  <button class="hp-close-x" id="hp-close-btn">&#x2715;</button>'
      + '  <h2>Hi there &#x1F44B;<br>How can we help?</h2>'
      + '</div>'
      + '<div class="hp-body">'
      + '  <p class="hp-section-label">Resources</p>'
      + '  <div class="hp-card">'
      + '    <a href="https://start.healthpreneurgroup.com/sop" target="_blank" rel="noopener">'
      + '      <span class="hp-card-icon">&#x1F4DA;</span>'
      + '      <div class="hp-card-text">'
      + '        <div class="hp-card-title">PCP Help Guides</div>'
      + '        <div class="hp-card-desc">Browse our standard operating procedures</div>'
      + '      </div>'
      + '      <span class="hp-card-arrow">&#x203A;</span>'
      + '    </a>'
      + '  </div>'
      + '  <a class="hp-ticket-card" href="https://hbasupport.hipporello.net/desk/form/d272f9daf0f443fb92e6423bc9671f22" target="_blank" rel="noopener">'
      + '    <div class="hp-ticket-icon-wrap">&#x1F4AC;</div>'
      + '    <div class="hp-ticket-text">'
      + '      <strong>Submit a Tech Ticket</strong>'
      + '      <span><span class="hp-online-dot"></span>Get Dedicated Expert Support</span>'
      + '    </div>'
      + '  </a>'
      + '</div>'
      + '<nav class="hp-footer-nav">'
      + '  <a href="#" class="hp-active">'
      + '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
      + '    Home'
      + '  </a>'
      + '  <a href="https://start.healthpreneurgroup.com/sop" target="_blank" rel="noopener">'
      + '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
      + '    Help'
      + '  </a>'
      + '  <a href="https://hbasupport.hipporello.net/desk/form/d272f9daf0f443fb92e6423bc9671f22" target="_blank" rel="noopener">'
      + '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
      + '    Tickets'
      + '  </a>'
      + '</nav>';
    document.body.appendChild(panel);

    /* ── PANEL POSITION ─────────────────────────────────────────────────── */
    function positionPanel() {
      var r = trigger.getBoundingClientRect();
      var pw = 360;
      var rightGap = window.innerWidth - r.right;
      if (rightGap + pw > window.innerWidth) rightGap = window.innerWidth - pw - 8;
      if (rightGap < 8) rightGap = 8;
      panel.style.top = (r.bottom + 8) + 'px';
      panel.style.right = rightGap + 'px';
      panel.style.left = 'auto';
      panel.style.bottom = 'auto';
    }

    /* ── EVENTS ─────────────────────────────────────────────────────────── */
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

  /* ── SPA NAVIGATION (HL uses pushState routing) ─────────────────────────
     When the user navigates between pages the nav bar DOM is torn down and
     rebuilt. Re-run init() after each route change so the widget re-injects.
     The guard at the top of init() prevents double-initialisation.
  ────────────────────────────────────────────────────────────────────────── */
  var _origPushState = history.pushState;
  history.pushState = function () {
    _origPushState.apply(this, arguments);
    setTimeout(init, 500);
  };
  window.addEventListener('popstate', function () { setTimeout(init, 500); });

})();
