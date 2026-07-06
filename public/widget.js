(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────────────── */
  const scriptTag = document.currentScript;
  const BASE_URL  = (scriptTag && scriptTag.getAttribute('data-api')) || '';
  const ENQUIRY   = 'https://caddxpertai.in/enquiry';

  const COURSE_KW = [
    'course','courses','program','training','mechanical','civil','electrical',
    'mep','autocad','revit','solidworks','catia','creo','ansys','staad',
    'primavera','sap','bim','hvac','fee','fees','duration','batch','admission',
    'enroll','join','certificate','diploma','placement','career','job',
    'digital marketing','tally','excel','power bi','data','learn','scope',
    'price','consult','counsel','class'
  ];

  /* ── State ───────────────────────────────────────────────────────────── */
  let chatOpen    = false;
  let busy        = false;
  let history     = [];

  /* ═══════════════════════════════════════════════════════════════════════
     STYLES
  ═══════════════════════════════════════════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = `
  #_cxw {
    --r : #E31E24; --rd: #c41318;
    --dk: #1C1C1C; --bg: #FAFAFA;
    --b1: #e8e8e8; --b2: rgba(0,0,0,.06);
    --t1: #1C1C1C; --t2: #555; --t3: #aaa;
    --f : -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    --sh: 0 12px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06);
    font-family: var(--f);
  }
  #_cxw, #_cxw * { box-sizing:border-box; margin:0; padding:0; }

  /* ── Keyframes ── */
  @keyframes _cx-popin {
    0%  { transform:scale(.5); opacity:0; }
    65% { transform:scale(1.08); }
    100%{ transform:scale(1);   opacity:1; }
  }
  @keyframes _cx-pulse {
    0%  { transform:scale(1);   opacity:.5; }
    100%{ transform:scale(1.7); opacity:0;  }
  }
  @keyframes _cx-open {
    0%  { transform:translateY(16px) scale(.93); opacity:0; }
    60% { transform:translateY(-2px) scale(1.01); opacity:1; }
    100%{ transform:translateY(0)    scale(1);    opacity:1; }
  }
  @keyframes _cx-close {
    from{ transform:translateY(0)    scale(1);   opacity:1; }
    to  { transform:translateY(16px) scale(.93); opacity:0; }
  }
  @keyframes _cx-up {
    from{ transform:translateY(10px); opacity:0; }
    to  { transform:translateY(0);    opacity:1; }
  }
  @keyframes _cx-dot {
    0%,80%,100%{ transform:translateY(0);   opacity:.4; }
    40%        { transform:translateY(-5px); opacity:1;  }
  }
  @keyframes _cx-badge {
    0%  { transform:scale(0); }
    75% { transform:scale(1.3); }
    100%{ transform:scale(1); }
  }

  /* ── Launcher bubble ── */
  #_cx-btn {
    position:fixed; bottom:26px; right:26px;
    width:60px; height:60px; border-radius:50%;
    background:linear-gradient(135deg,#E31E24 0%,#b81419 100%);
    border:none; outline:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    z-index:2147483640;
    box-shadow:0 4px 20px rgba(227,30,36,.45);
    animation:_cx-popin .5s cubic-bezier(.34,1.56,.64,1) both;
    transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  #_cx-btn:hover  { transform:scale(1.1);  box-shadow:0 6px 26px rgba(227,30,36,.6); }
  #_cx-btn:active { transform:scale(.92); }
  #_cx-btn::before {
    content:'';
    position:absolute; inset:-6px;
    border-radius:50%;
    border:2px solid rgba(227,30,36,.5);
    animation:_cx-pulse 2.2s ease-out infinite;
  }
  #_cx-btn.is-open::before { animation:none; opacity:0; }
  #_cx-btn svg {
    width:26px; height:26px; fill:#fff; position:absolute;
    transition:transform .28s cubic-bezier(.34,1.56,.64,1), opacity .2s;
  }
  ._cx-ico-chat  { transform:scale(1);  opacity:1; }
  ._cx-ico-close { transform:scale(0);  opacity:0; }
  #_cx-btn.is-open ._cx-ico-chat  { transform:rotate(-90deg) scale(0); opacity:0; }
  #_cx-btn.is-open ._cx-ico-close { transform:scale(1); opacity:1; }

  #_cx-badge {
    position:absolute; top:-3px; right:-3px;
    min-width:20px; height:20px; border-radius:10px;
    background:var(--dk); border:2.5px solid #fff;
    font-size:10px; font-weight:700; color:#fff;
    display:none; align-items:center; justify-content:center;
    padding:0 4px;
    animation:_cx-badge .3s cubic-bezier(.34,1.56,.64,1);
  }
  #_cx-badge.on { display:flex; }

  /* ── Tooltip ── */
  #_cx-tip {
    position:fixed; bottom:38px; right:98px;
    background:#fff; border:1px solid var(--b1);
    border-radius:12px; padding:10px 15px;
    box-shadow:0 4px 16px rgba(0,0,0,.08);
    font-size:13px; font-weight:500; color:var(--t1);
    white-space:nowrap; pointer-events:none;
    display:flex; align-items:center; gap:8px;
    z-index:2147483639;
    transition:opacity .3s, transform .3s;
    transform:translateX(0); opacity:1;
  }
  #_cx-tip.hidden { opacity:0; transform:translateX(12px); pointer-events:none; }
  #_cx-tip-dot {
    width:8px; height:8px; border-radius:50%;
    background:var(--r); flex-shrink:0;
  }

  /* ── Panel ── */
  #_cx-panel {
    position:fixed; bottom:98px; right:26px;
    width:400px;
    display:flex; flex-direction:column;
    background:#fff;
    border-radius:20px;
    box-shadow:var(--sh);
    border:1px solid rgba(0,0,0,.06);
    z-index:2147483638;
    overflow:hidden;
    opacity:0; pointer-events:none;
    transform:translateY(16px) scale(.93);
    transform-origin:bottom right;
    max-height:calc(100vh - 120px);
  }
  #_cx-panel.is-open {
    pointer-events:all;
    animation:_cx-open .38s cubic-bezier(.34,1.56,.64,1) forwards;
  }
  #_cx-panel.is-close {
    animation:_cx-close .24s ease forwards;
  }

  /* ── Header ── */
  #_cx-head {
    background:var(--dk);
    padding:15px 18px;
    display:flex; align-items:center; justify-content:space-between;
    border-bottom:2px solid var(--r);
    flex-shrink:0;
  }
  #_cx-head-left { display:flex; align-items:center; gap:12px; }
  #_cx-avi {
    width:40px; height:40px; border-radius:11px;
    background:var(--r);
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:800; color:#fff;
    letter-spacing:-.5px; flex-shrink:0;
    box-shadow:0 2px 10px rgba(227,30,36,.4);
  }
  #_cx-name {
    color:#fff; font-size:14.5px; font-weight:700; line-height:1.2;
    font-family:var(--f);
  }
  #_cx-status {
    display:flex; align-items:center; gap:5px;
    font-size:11.5px; color:rgba(255,255,255,.5);
    margin-top:3px; font-family:var(--f);
  }
  ._cx-sdot {
    width:7px; height:7px; border-radius:50%;
    background:#27c93f;
    box-shadow:0 0 0 2px rgba(39,201,63,.25);
    flex-shrink:0;
  }
  #_cx-close-btn {
    background:transparent; border:none; cursor:pointer;
    color:rgba(255,255,255,.55); padding:6px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    transition:background .2s, color .2s;
  }
  #_cx-close-btn:hover { background:rgba(255,255,255,.12); color:#fff; }
  #_cx-close-btn svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2.5; stroke-linecap:round; }

  /* ── Messages ── */
  #_cx-msgs {
    flex:1; overflow-y:auto;
    padding:20px 16px;
    background:var(--bg);
    display:flex; flex-direction:column; gap:14px;
    min-height:300px; max-height:430px;
    scroll-behavior:smooth;
  }
  #_cx-msgs::-webkit-scrollbar { width:3px; }
  #_cx-msgs::-webkit-scrollbar-thumb { background:rgba(0,0,0,.1); border-radius:3px; }

  /* ── Welcome card ── */
  ._cx-welcome {
    background:#fff; border:1px solid var(--b1);
    border-radius:16px; padding:20px 18px;
    animation:_cx-up .4s ease both;
  }
  ._cx-wtag {
    display:inline-block;
    background:#fff5f5; color:var(--r);
    font-size:10px; font-weight:700; letter-spacing:.07em;
    text-transform:uppercase; padding:3px 10px;
    border-radius:20px; margin-bottom:10px;
    font-family:var(--f);
  }
  ._cx-welcome h3 {
    font-size:14.5px; font-weight:700; color:var(--dk);
    margin-bottom:6px; line-height:1.35; font-family:var(--f);
  }
  ._cx-welcome p { font-size:13px; color:var(--t2); line-height:1.6; font-family:var(--f); margin-top:5px; }

  /* ── Chips ── */
  ._cx-chips {
    display:flex; flex-wrap:wrap; gap:8px;
    animation:_cx-up .4s .1s ease both;
  }
  ._cx-chip {
    background:#fff; border:1.5px solid var(--b1);
    border-radius:20px; padding:7px 14px;
    font-size:12px; font-weight:500; color:var(--t1);
    cursor:pointer; font-family:var(--f);
    transition:background .18s, border-color .18s, color .18s, transform .15s;
    white-space:nowrap; line-height:1;
  }
  ._cx-chip:hover {
    background:var(--r); border-color:var(--r);
    color:#fff; transform:translateY(-1px);
  }

  /* ── Date divider ── */
  ._cx-divider {
    display:flex; align-items:center; gap:10px;
    font-size:11px; color:var(--t3);
    animation:_cx-up .4s .2s ease both; font-family:var(--f);
  }
  ._cx-divider::before, ._cx-divider::after {
    content:''; flex:1; height:1px; background:var(--b1);
  }

  /* ── Message rows ── */
  ._cx-row {
    display:flex; align-items:flex-end; gap:9px;
    animation:_cx-up .28s ease both;
  }
  ._cx-row._cx-u { flex-direction:row-reverse; }

  ._cx-av {
    width:32px; height:32px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; font-size:13px;
    font-family:var(--f);
  }
  ._cx-row._cx-b ._cx-av {
    background:var(--dk); font-size:10px;
    font-weight:800; color:#fff; letter-spacing:-.5px;
  }
  ._cx-row._cx-u ._cx-av { background:#fff5f5; }

  ._cx-col { display:flex; flex-direction:column; gap:4px; max-width:84%; }
  ._cx-row._cx-u ._cx-col { align-items:flex-end; }

  ._cx-bub {
    padding:13px 16px; border-radius:16px;
    font-size:13.5px; line-height:1.65;
    word-break:break-word; overflow-wrap:break-word;
    font-family:var(--f);
  }
  ._cx-row._cx-b ._cx-bub {
    background:#fff; border:1px solid var(--b2);
    color:var(--t1); border-bottom-left-radius:4px;
    box-shadow:0 2px 8px rgba(0,0,0,.05);
  }
  ._cx-row._cx-u ._cx-bub {
    background:var(--dk); color:#fff;
    border-bottom-right-radius:4px;
  }
  ._cx-ts { font-size:10.5px; color:var(--t3); padding:0 4px; font-family:var(--f); }

  /* ── Bubble markdown ── */
  ._cx-bub strong { font-weight:700; color:#111; }
  ._cx-bub em     { font-style:italic; }
  ._cx-bub h3 {
    font-size:13px; font-weight:700; color:var(--r);
    margin:10px 0 5px; padding-bottom:4px;
    border-bottom:1px solid #f0f0f0; font-family:var(--f);
  }
  ._cx-bub h3:first-child { margin-top:0; }
  ._cx-bub ul {
    margin:8px 0 6px; padding:0;
    list-style:none; display:flex; flex-direction:column; gap:5px;
  }
  ._cx-bub li {
    padding-left:18px; position:relative;
    font-size:13.5px; line-height:1.6; font-family:var(--f);
  }
  ._cx-bub li::before {
    content:''; position:absolute; left:2px; top:8px;
    width:6px; height:6px; border-radius:50%; background:var(--r);
  }
  ._cx-bub p { margin:4px 0; }
  ._cx-bub p:first-child { margin-top:0; }
  ._cx-bub p:last-child  { margin-bottom:0; }

  /* ── Typing indicator ── */
  ._cx-typing {
    display:flex; gap:9px; align-items:flex-end;
    animation:_cx-up .25s ease both;
  }
  ._cx-typing-bub {
    background:#fff; border:1px solid var(--b2);
    border-radius:16px; border-bottom-left-radius:4px;
    padding:13px 17px; display:flex; gap:5px; align-items:center;
    box-shadow:0 2px 8px rgba(0,0,0,.05);
  }
  ._cx-typing-bub span {
    width:6px; height:6px; border-radius:50%;
    background:var(--r); display:inline-block;
    animation:_cx-dot 1.4s infinite ease-in-out;
  }
  ._cx-typing-bub span:nth-child(2) { animation-delay:.18s; }
  ._cx-typing-bub span:nth-child(3) { animation-delay:.36s; }

  /* ── Error banners ── */
  ._cx-err {
    font-size:12px; border-radius:10px;
    padding:10px 14px; text-align:center;
    align-self:center; max-width:92%;
    animation:_cx-up .25s ease both; font-family:var(--f);
    background:#fee2e2; border:1px solid #fca5a5; color:#991b1b;
  }
  ._cx-err._cx-rate {
    background:#fffbeb; border-color:#fcd34d; color:#92400e;
  }
  ._cx-err._cx-rate strong { color:#b45309; font-weight:700; }

  /* ── Enquiry CTA card ── */
  ._cx-cta {
    background:linear-gradient(135deg,#fff8f8 0%,#fff1f1 100%);
    border:1px solid rgba(227,30,36,.15);
    border-radius:14px; padding:16px 16px 14px;
    display:flex; flex-direction:column; gap:9px;
    box-shadow:0 4px 15px rgba(227,30,36,.05);
    align-self:flex-start; max-width:92%;
    animation:_cx-up .35s .1s ease both;
  }
  ._cx-cta-title {
    font-size:13.5px; font-weight:700; color:var(--dk);
    display:flex; align-items:center; gap:6px; font-family:var(--f);
  }
  ._cx-cta-desc { font-size:12.5px; color:var(--t2); line-height:1.55; font-family:var(--f); }
  ._cx-cta-btn {
    display:inline-flex; align-items:center; gap:5px;
    background:var(--r); color:#fff !important;
    text-decoration:none !important;
    font-size:12.5px; font-weight:700; font-family:var(--f);
    padding:9px 16px; border-radius:9px;
    transition:background .18s, transform .15s, box-shadow .18s;
    box-shadow:0 2px 8px rgba(227,30,36,.3);
    align-self:flex-start; line-height:1;
  }
  ._cx-cta-btn:hover {
    background:var(--rd); transform:translateY(-1px);
    box-shadow:0 4px 14px rgba(227,30,36,.4);
  }

  /* ── Chips strip ── */
  #_cx-chips-strip {
    padding:10px 14px 12px;
    background:#fff; border-top:1px solid var(--b1);
    display:flex; gap:8px; overflow-x:auto;
    white-space:nowrap; flex-shrink:0;
    scrollbar-width:none;
  }
  #_cx-chips-strip::-webkit-scrollbar { display:none; }

  /* ── Input area ── */
  #_cx-foot {
    padding:12px 14px 14px;
    background:#fff; border-top:1px solid var(--b1);
    display:flex; flex-direction:column; gap:7px;
    flex-shrink:0;
  }
  #_cx-inp-wrap {
    display:flex; align-items:center; gap:10px;
    background:var(--bg); border:1.5px solid var(--b1);
    border-radius:24px; padding:6px 8px 6px 16px;
    transition:border-color .2s, box-shadow .2s;
  }
  #_cx-inp-wrap:focus-within {
    border-color:var(--r);
    box-shadow:0 0 0 3px rgba(227,30,36,.08);
    background:#fff;
  }
  #_cx-inp {
    flex:1; border:none; background:transparent; outline:none;
    resize:none; font-family:var(--f);
    font-size:13.5px; line-height:1.5; color:var(--t1);
    max-height:110px; min-height:24px; height:24px;
    padding:3px 0; scrollbar-width:none;
  }
  #_cx-inp::-webkit-scrollbar { display:none; }
  #_cx-inp::placeholder { color:#bbb; }
  #_cx-send {
    background:var(--r); border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    width:36px; height:36px; border-radius:50%; flex-shrink:0;
    box-shadow:0 2px 8px rgba(227,30,36,.35);
    transition:background .18s, transform .18s, box-shadow .18s;
  }
  #_cx-send:hover { background:var(--rd); transform:scale(1.07); box-shadow:0 4px 14px rgba(227,30,36,.45); }
  #_cx-send:active { transform:scale(.9); }
  #_cx-send:disabled { background:#ddd; box-shadow:none; cursor:not-allowed; }
  #_cx-send svg { width:15px; height:15px; fill:#fff; margin-left:1px; }
  #_cx-pow {
    font-size:10.5px; color:var(--t3); text-align:center;
    letter-spacing:.02em; font-family:var(--f);
  }
  #_cx-pow b { color:var(--r); font-weight:600; }

  /* ── Mobile ── */
  @media (max-width:480px) {
    #_cx-panel {
      position:fixed; top:0; left:0; right:0; bottom:0;
      width:100% !important; height:100% !important;
      max-height:100% !important; border-radius:0 !important;
    }
    #_cx-msgs { max-height:calc(100dvh - 210px); }
    #_cx-btn { right:16px; bottom:16px; }
    #_cx-tip  { display:none; }
  }
  `;
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════════════════════════
     HTML
  ═══════════════════════════════════════════════════════════════════════ */
  const root = document.createElement('div');
  root.id = '_cxw';
  root.innerHTML = `
    <!-- Tooltip -->
    <div id="_cx-tip"><span id="_cx-tip-dot"></span>Ask Caddxpert AI Advisor</div>

    <!-- Panel -->
    <div id="_cx-panel" role="dialog" aria-label="Caddxpert AI Assistant">

      <!-- Header -->
      <div id="_cx-head">
        <div id="_cx-head-left">
          <div id="_cx-avi">CX</div>
          <div>
            <div id="_cx-name">Caddxpert AI Advisor</div>
            <div id="_cx-status"><span class="_cx-sdot"></span>Online · Powered by Gemini</div>
          </div>
        </div>
        <button id="_cx-close-btn" aria-label="Close chat">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Messages -->
      <div id="_cx-msgs" aria-live="polite"></div>

      <!-- Quick chips strip -->
      <div id="_cx-chips-strip"></div>

      <!-- Input -->
      <div id="_cx-foot">
        <div id="_cx-inp-wrap">
          <textarea id="_cx-inp" rows="1" placeholder="Type a message…" maxlength="500" autocomplete="off" aria-label="Message"></textarea>
          <button id="_cx-send" aria-label="Send">
            <svg viewBox="0 0 24 24"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
          </button>
        </div>
        <div id="_cx-pow">Powered by <b>Caddxpert AI Innovations</b> · Press Enter to send</div>
      </div>
    </div>

    <!-- Launcher -->
    <button id="_cx-btn" aria-label="Open Caddxpert AI chat">
      <svg class="_cx-ico-chat"  viewBox="0 0 24 24"><path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-.9,2-2V4C22,2.9,21.1,2,20,2z M20,16H5.2L4,17.2V4h16V16z M7,9h10v2H7V9z M7,5h10v2H7V5z M7,13h7v2H7V13z"/></svg>
      <svg class="_cx-ico-close" viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
      <div id="_cx-badge"></div>
    </button>
  `;
  document.body.appendChild(root);

  /* ── DOM refs ─────────────────────────────────────────────────────────── */
  const btn    = document.getElementById('_cx-btn');
  const panel  = document.getElementById('_cx-panel');
  const msgs   = document.getElementById('_cx-msgs');
  const inp    = document.getElementById('_cx-inp');
  const snd    = document.getElementById('_cx-send');
  const badge  = document.getElementById('_cx-badge');
  const tip    = document.getElementById('_cx-tip');
  const strip  = document.getElementById('_cx-chips-strip');

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const ts    = () => new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const scrl  = () => { msgs.scrollTop = msgs.scrollHeight; };
  const isCtx = t => COURSE_KW.some(k => t.toLowerCase().includes(k));

  /* ── Welcome screen ──────────────────────────────────────────────────── */
  (function welcome() {
    const wc = document.createElement('div');
    wc.className = '_cx-welcome';
    wc.innerHTML = `
      <div class="_cx-wtag">AI Assistant</div>
      <h3>Hi there! 👋 Welcome to Caddxpert</h3>
      <p>I can guide you through our professional courses in CAD, MEP, Civil, Mechanical, and more.</p>
      <p>How can I help shape your engineering career today?</p>
    `;
    msgs.appendChild(wc);

    const div = document.createElement('div');
    div.className = '_cx-divider';
    div.textContent = 'Today';
    msgs.appendChild(div);

    [
      ['📐 CAD Courses',      'Which CAD/Engineering courses do you offer?'],
      ['💼 Placements',       'Are there placements after course completion?'],
      ['💰 Fees & Duration',  'What are the course fees and durations?'],
      ['📞 Free Counselling', 'Can I speak to a counselor for career advice?'],
    ].forEach(([label, msg]) => {
      const c = document.createElement('button');
      c.className = '_cx-chip';
      c.textContent = label;
      c.addEventListener('click', () => { if (!busy) send(msg); });
      strip.appendChild(c);
    });
  })();

  /* ── Panel toggle ────────────────────────────────────────────────────── */
  let unread = 0;
  function openPanel() {
    chatOpen = true;
    btn.classList.add('is-open');
    panel.classList.remove('is-close');
    panel.classList.add('is-open');
    tip.classList.add('hidden');
    badge.classList.remove('on'); unread = 0;
    setTimeout(() => inp.focus(), 320);
    scrl();
  }
  function closePanel() {
    chatOpen = false;
    btn.classList.remove('is-open');
    panel.classList.remove('is-open');
    panel.classList.add('is-close');
    setTimeout(() => panel.classList.remove('is-close'), 260);
  }
  btn.addEventListener('click', () => chatOpen ? closePanel() : openPanel());
  document.getElementById('_cx-close-btn').addEventListener('click', closePanel);
  setTimeout(() => { if (!chatOpen) tip.classList.add('hidden'); }, 7000);

  /* ── Textarea auto-grow ──────────────────────────────────────────────── */
  inp.addEventListener('input', () => {
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 110) + 'px';
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  snd.addEventListener('click', handleSend);

  function handleSend() {
    const text = inp.value.trim();
    if (!text || busy) return;
    inp.value = '';
    inp.style.height = '24px';
    send(text);
  }

  /* ── Markdown parser ─────────────────────────────────────────────────── */
  function md(raw) {
    if (!raw) return '';
    const esc = raw
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const lines = esc.split('\n');
    const out = []; let list = false;
    for (const line of lines) {
      const t = line.trim();
      if (/^\*\*(.+)\*\*[:\s]*$/.test(t)) {
        if (list) { out.push('</ul>'); list = false; }
        out.push(`<h3>${t.replace(/^\*\*(.+?)\*\*[:\s]*$/,'$1')}</h3>`);
      } else if (/^[*\-]\s/.test(line)) {
        if (!list) { out.push('<ul>'); list = true; }
        out.push(`<li>${fmt(line.replace(/^[*\-]\s+/,''))}</li>`);
      } else if (/^#{1,3}\s/.test(t)) {
        if (list) { out.push('</ul>'); list = false; }
        out.push(`<h3>${fmt(t.replace(/^#{1,3}\s/,''))}</h3>`);
      } else {
        if (list) { out.push('</ul>'); list = false; }
        if (!t) out.push('<br>');
        else    out.push(`<p>${fmt(t)}</p>`);
      }
    }
    if (list) out.push('</ul>');
    return out.join('');
  }
  function fmt(t) {
    return t
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>');
  }

  /* ── Append message ──────────────────────────────────────────────────── */
  function appendMsg(text, role) {
    const row = document.createElement('div');
    row.className = `_cx-row ${role==='user' ? '_cx-u' : '_cx-b'}`;

    const av = document.createElement('div');
    av.className = '_cx-av';
    av.textContent = role === 'user' ? '🧑' : 'CX';

    const col = document.createElement('div');
    col.className = '_cx-col';

    const bub = document.createElement('div');
    bub.className = '_cx-bub';
    bub.innerHTML = role === 'bot' ? md(text) : escHtml(text);

    const time = document.createElement('div');
    time.className = '_cx-ts';
    time.textContent = ts();

    col.appendChild(bub); col.appendChild(time);
    row.appendChild(av);  row.appendChild(col);
    msgs.appendChild(row); scrl();
    return row;
  }

  function escHtml(s) {
    return s.replace(/[&<>'"]/g,
      c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]||c));
  }

  /* ── Typing indicator ────────────────────────────────────────────────── */
  let typEl = null;
  function showTyping() {
    if (typEl) return;
    typEl = document.createElement('div');
    typEl.className = '_cx-typing';
    const av = document.createElement('div');
    av.className = '_cx-av _cx-b'; av.textContent = 'CX';
    const bub = document.createElement('div');
    bub.className = '_cx-typing-bub';
    bub.innerHTML = '<span></span><span></span><span></span>';
    typEl.appendChild(av); typEl.appendChild(bub);
    msgs.appendChild(typEl); scrl();
  }
  function hideTyping() { if (typEl) { typEl.remove(); typEl = null; } }

  /* ── CTA card ────────────────────────────────────────────────────────── */
  function showCTA() {
    const old = msgs.querySelector('._cx-cta');
    if (old) old.remove();
    const card = document.createElement('div');
    card.className = '_cx-cta';
    card.innerHTML = `
      <div class="_cx-cta-title">🎓 Free Counselling &amp; Admission Guidance</div>
      <div class="_cx-cta-desc">Talk to our expert advisors and find the best course for your goals.</div>
      <a class="_cx-cta-btn" href="${ENQUIRY}" target="_blank" rel="noopener">
        Register for Free Consultation →
      </a>
    `;
    msgs.appendChild(card); scrl();
  }

  /* ── Error banners ───────────────────────────────────────────────────── */
  function showErr(text) {
    const el = document.createElement('div');
    el.className = '_cx-err';
    el.textContent = '⚠️ ' + text;
    msgs.appendChild(el); scrl();
  }

  function showRateLimit() {
    let secs = 60;
    const el = document.createElement('div');
    el.className = '_cx-err _cx-rate';
    el.innerHTML = `⏳ Too many messages. Please wait <strong id="_cx-cd">${secs}s</strong> and try again.`;
    msgs.appendChild(el); scrl();

    snd.disabled = true; inp.disabled = true;
    inp.placeholder = `Please wait ${secs}s…`;

    const t = setInterval(() => {
      secs--;
      const cd = document.getElementById('_cx-cd');
      if (cd) cd.textContent = secs + 's';
      inp.placeholder = `Please wait ${secs}s…`;
      if (secs <= 0) {
        clearInterval(t);
        snd.disabled = false; inp.disabled = false;
        inp.placeholder = 'Type a message…';
        if (el.parentNode) el.remove();
        inp.focus();
      }
    }, 1000);
  }

  /* ── Core send ───────────────────────────────────────────────────────── */
  async function send(text) {
    if (busy) return;
    busy = true; snd.disabled = true;

    appendMsg(text, 'user');
    history.push({ role:'user', text });
    if (history.length > 6) history = history.slice(-6);

    showTyping();

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(0,-1) })
      });

      hideTyping();

      if (res.status === 429) { showRateLimit(); return; }

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }

      const { reply = "I'm unable to respond right now." } = await res.json();
      appendMsg(reply, 'bot');
      history.push({ role:'model', text:reply });
      if (history.length > 6) history = history.slice(-6);

      if (isCtx(text)) setTimeout(showCTA, 450);

      if (!chatOpen) {
        unread++;
        badge.textContent = unread > 9 ? '9+' : unread;
        badge.classList.add('on');
      }

    } catch (err) {
      hideTyping();
      showErr('Connection trouble. Please try again or call +91 82484 90202.');
      console.error('[CXW]', err);
    } finally {
      busy = false; snd.disabled = false;
    }
  }

})();
