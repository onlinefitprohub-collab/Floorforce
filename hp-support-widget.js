(function () {
  'use strict';

  if (document.getElementById('hp-support-trigger')) return; // prevent double-init

  /* ── STYLES ─────────────────────────────────────────────────────────── */
  const STYLES = `
    #hp-support-trigger {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 64px;
      height: 64px;
      background: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2147483647;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      border: none;
      padding: 0;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      user-select: none;
    }
    #hp-support-trigger img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
      pointer-events: none;
    }
    #hp-support-trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0,0,0,0.45);
    }

    #hp-support-panel {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 360px;
      height: 520px;
      background: #f2f2f7;
      border-radius: 18px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.22);
      z-index: 2147483646;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    #hp-support-panel.hp-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* ── HEADER ── */
    .hp-panel-header {
      background: #1a1a2e;
      padding: 24px 20px 30px;
      color: white;
      position: relative;
      flex-shrink: 0;
    }
    .hp-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #e8a04a, #c4843a);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
      margin-bottom: 12px;
      color: white;
      letter-spacing: 0.5px;
    }
    .hp-panel-header h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.35;
      color: white;
    }
    .hp-close-x {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 30px;
      height: 30px;
      background: rgba(255,255,255,0.12);
      border: none;
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      font-family: inherit;
    }
    .hp-close-x:hover {
      background: rgba(255,255,255,0.22);
    }

    /* ── SEARCH ── */
    .hp-search-wrap {
      padding: 0 14px;
      margin-top: -17px;
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }
    .hp-search-wrap input {
      width: 100%;
      padding: 13px 40px 13px 15px;
      border-radius: 12px;
      border: none;
      background: white;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      color: #333;
    }
    .hp-search-wrap input::placeholder { color: #aaa; }
    .hp-search-icon-btn {
      position: absolute;
      right: 26px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #aaa;
      font-size: 15px;
      padding: 0;
      line-height: 1;
    }

    /* ── BODY ── */
    .hp-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
    }
    .hp-section-label {
      font-size: 11px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 4px 2px 0;
    }

    /* ── LINK CARD ── */
    .hp-card {
      background: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .hp-card a {
      display: flex;
      align-items: center;
      padding: 15px 14px;
      text-decoration: none;
      border-bottom: 1px solid #f2f2f2;
      transition: background 0.15s;
      gap: 12px;
    }
    .hp-card a:last-child { border-bottom: none; }
    .hp-card a:hover { background: #fafafa; }
    .hp-card-icon { font-size: 20px; flex-shrink: 0; }
    .hp-card-text { flex: 1; }
    .hp-card-title {
      font-size: 14px;
      font-weight: 600;
      color: #4a6cf7;
    }
    .hp-card-desc {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }
    .hp-card-arrow { color: #ccc; font-size: 20px; }

    /* ── TICKET CARD ── */
    .hp-ticket-card {
      background: white;
      border-radius: 14px;
      padding: 15px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 13px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .hp-ticket-card:hover { background: #fafafa; }
    .hp-ticket-icon-wrap {
      width: 44px;
      height: 44px;
      background: #eff2ff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .hp-ticket-text strong {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #111;
    }
    .hp-ticket-text span {
      font-size: 12px;
      color: #4a6cf7;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 3px;
    }
    .hp-online-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* ── FOOTER NAV ── */
    .hp-footer-nav {
      display: flex;
      background: white;
      border-top: 1px solid #ebebeb;
      padding: 8px 0 10px;
      flex-shrink: 0;
    }
    .hp-footer-nav a {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      text-decoration: none;
      color: #bbb;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 0;
      transition: color 0.15s;
    }
    .hp-footer-nav a.hp-active,
    .hp-footer-nav a:hover { color: #1a1a2e; }
    .hp-footer-nav svg { width: 20px; height: 20px; }
  `;

  /* ── HTML ────────────────────────────────────────────────────────────── */
  const PANEL_HTML = `
    <div class="hp-panel-header">
      <div class="hp-avatar">HP</div>
      <button class="hp-close-x" id="hp-close-btn" aria-label="Close">&#x2715;</button>
      <h2>Hi there &#x1F44B;<br>How can we help?</h2>
    </div>

    <div class="hp-search-wrap">
      <input type="text" id="hp-search-input" placeholder="Search for Help" />
      <button class="hp-search-icon-btn" id="hp-search-btn" aria-label="Search">&#x1F50D;</button>
    </div>

    <div class="hp-body">
      <p class="hp-section-label">Resources</p>

      <div class="hp-card">
        <a href="https://start.healthpreneurgroup.com/sop" target="_blank" rel="noopener">
          <span class="hp-card-icon">&#x1F4DA;</span>
          <div class="hp-card-text">
            <div class="hp-card-title">SOP &amp; Help Docs</div>
            <div class="hp-card-desc">Browse our standard operating procedures</div>
          </div>
          <span class="hp-card-arrow">&#x203A;</span>
        </a>
      </div>

      <a class="hp-ticket-card"
         href="https://hbasupport.hipporello.net/desk/form/d272f9daf0f443fb92e6423bc9671f22"
         target="_blank" rel="noopener">
        <div class="hp-ticket-icon-wrap">&#x1F4AC;</div>
        <div class="hp-ticket-text">
          <strong>Submit a Tech Ticket</strong>
          <span><span class="hp-online-dot"></span>We are online! How can we help you?</span>
        </div>
      </a>
    </div>

    <nav class="hp-footer-nav">
      <a href="#" class="hp-active" id="hp-home-tab" aria-label="Home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Home
      </a>
      <a href="https://start.healthpreneurgroup.com/sop" target="_blank" rel="noopener" aria-label="Help Docs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Help
      </a>
      <a href="https://hbasupport.hipporello.net/desk/form/d272f9daf0f443fb92e6423bc9671f22"
         target="_blank" rel="noopener" aria-label="Submit Ticket">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Tickets
      </a>
    </nav>
  `;

  /* ── INJECT ──────────────────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  const trigger = document.createElement('button');
  trigger.id = 'hp-support-trigger';
  trigger.title = 'Support';
  trigger.innerHTML = '<img src="https://assets.cdn.filesafe.space/fjZxRMubk5kWXBOExKNb/media/69e8b483717d5dd4e1026e5a.gif" alt="Support" />';
  document.body.appendChild(trigger);

  const panel = document.createElement('div');
  panel.id = 'hp-support-panel';
  panel.innerHTML = PANEL_HTML;
  document.body.appendChild(panel);

  /* ── BEHAVIOUR ───────────────────────────────────────────────────────── */
  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('hp-open');
  });

  document.getElementById('hp-close-btn').addEventListener('click', function () {
    panel.classList.remove('hp-open');
  });

  // Search → open SOP page
  function doSearch() {
    var q = document.getElementById('hp-search-input').value.trim();
    window.open('https://start.healthpreneurgroup.com/sop' + (q ? '?s=' + encodeURIComponent(q) : ''), '_blank');
  }
  document.getElementById('hp-search-btn').addEventListener('click', doSearch);
  document.getElementById('hp-search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doSearch();
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && e.target !== trigger) {
      panel.classList.remove('hp-open');
    }
  });

  // Prevent panel clicks from bubbling to document close handler
  panel.addEventListener('click', function (e) { e.stopPropagation(); });

})();
