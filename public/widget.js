(function () {
  'use strict';

  const scriptTag = document.currentScript;
  const BASE_URL  = (scriptTag && scriptTag.getAttribute('data-api')) || '';
  const ENQUIRY   = 'https://caddxpertai.in/enquiry';

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --cx-red: #E31E24;
      --cx-red-hover: #c41318;
      --cx-dark: #1C1C1C;
      --cx-dark-light: #2e2e2e;
      --cx-gray-bg: #f7f7f7;
      --cx-border: #e8e8e8;
      --cx-text-primary: #1C1C1C;
      --cx-text-secondary: #666666;
    }
    /* ─── CHAT WIDGET STYLES ─── */
    .cx-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: 'Inter', sans-serif;
    }

    /* Bubble Launcher */
    .cx-launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cx-red) 0%, #b81419 100%);
      box-shadow: 0 4px 20px rgba(227, 30, 36, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
      border: none;
      outline: none;
      position: relative;
    }
    .cx-launcher:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(227, 30, 36, 0.5);
    }
    .cx-launcher:active {
      transform: scale(0.95);
    }
    
    .cx-launcher svg {
      width: 26px;
      height: 26px;
      fill: white;
      transition: transform 0.3s ease, opacity 0.2s;
    }
    .cx-launcher .cx-icon-close {
      position: absolute;
      opacity: 0;
      transform: rotate(-45deg) scale(0.8);
    }
    .cx-launcher.open .cx-icon-chat {
      opacity: 0;
      transform: rotate(45deg) scale(0.8);
    }
    .cx-launcher.open .cx-icon-close {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }

    /* Notification Badge */
    .cx-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      background: #27c93f;
      border: 2px solid white;
      border-radius: 50%;
      animation: cx-pulse 2s infinite;
    }

    /* Launcher Tooltip */
    .cx-launcher-tooltip {
      position: absolute;
      right: 76px;
      bottom: 10px;
      background: white;
      border: 1px solid var(--cx-border);
      border-radius: 12px;
      padding: 10px 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.06);
      font-size: 13px;
      font-weight: 500;
      color: var(--cx-text-primary);
      white-space: nowrap;
      pointer-events: none;
      opacity: 1;
      transform: translateX(10px);
      transition: opacity 0.3s, transform 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cx-launcher-tooltip.hidden {
      opacity: 0;
      transform: translateX(20px);
    }
    .cx-tooltip-dot {
      width: 8px;
      height: 8px;
      background-color: var(--cx-red);
      border-radius: 50%;
    }

    /* Chat Panel */
    .cx-chat-panel {
      position: absolute;
      bottom: 76px;
      right: 0;
      width: 385px;
      height: 600px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
      border: 1px solid rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cx-chat-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* Panel Header */
    .cx-header {
      background: var(--cx-dark);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .cx-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cx-header-avatar {
      width: 38px;
      height: 38px;
      background: var(--cx-red);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      color: white;
    }
    .cx-header-meta {
      display: flex;
      flex-direction: column;
    }
    .cx-header-title {
      color: white;
      font-weight: 700;
      font-size: 14.5px;
      line-height: 1.2;
    }
    .cx-header-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: rgba(255,255,255,0.5);
      margin-top: 2px;
    }
    .cx-status-dot {
      width: 7px;
      height: 7px;
      background: #27c93f;
      border-radius: 50%;
    }
    
    .cx-header-actions button {
      background: transparent;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.6);
      padding: 6px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, color 0.2s;
    }
    .cx-header-actions button:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    /* Message Area */
    .cx-body {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #FAFAFA;
      scroll-behavior: smooth;
    }

    /* Custom Scrollbar for Message Area */
    .cx-body::-webkit-scrollbar {
      width: 6px;
    }
    .cx-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .cx-body::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.1);
      border-radius: 10px;
    }

    /* Chat Bubbles */
    .cx-msg-wrapper {
      display: flex;
      flex-direction: column;
      max-width: 82%;
      animation: cx-fade-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .cx-msg-wrapper.bot {
      align-self: flex-start;
    }
    .cx-msg-wrapper.user {
      align-self: flex-end;
    }

    .cx-msg-bubble {
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .bot .cx-msg-bubble {
      background: white;
      color: var(--cx-text-primary);
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      border: 1px solid rgba(0,0,0,0.04);
    }
    .user .cx-msg-bubble {
      background: var(--cx-red);
      color: white;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(227, 30, 36, 0.15);
    }

    .cx-msg-timestamp {
      font-size: 10px;
      color: #999;
      margin-top: 4px;
      margin-left: 4px;
    }
    .user .cx-msg-timestamp {
      align-self: flex-end;
      margin-right: 4px;
    }

    /* Markdown Styling in Bot Bubbles */
    .cx-msg-bubble strong, .cx-msg-bubble b {
      font-weight: 700;
      color: #000;
    }
    .cx-msg-bubble p {
      margin-bottom: 8px;
    }
    .cx-msg-bubble p:last-child {
      margin-bottom: 0;
    }
    .cx-msg-bubble ul, .cx-msg-bubble ol {
      padding-left: 18px;
      margin: 8px 0;
    }
    .cx-msg-bubble li {
      margin-bottom: 4px;
    }

    /* Dynamic Typing Indicator */
    .cx-typing-bubble {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 12px 18px;
      background: white;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      border: 1px solid rgba(0,0,0,0.04);
      width: fit-content;
      align-self: flex-start;
      margin-bottom: 12px;
    }
    .cx-typing-dot {
      width: 7px;
      height: 7px;
      background: #c0c0c0;
      border-radius: 50%;
      animation: cx-bounce 1.4s infinite ease-in-out both;
    }
    .cx-typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .cx-typing-dot:nth-child(2) { animation-delay: -0.16s; }

    /* Action CTA Card */
    .cx-cta-card {
      background: linear-gradient(135deg, #FFF8F8 0%, #FFF1F1 100%);
      border: 1px solid rgba(227, 30, 36, 0.15);
      border-radius: 14px;
      padding: 16px;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(227, 30, 36, 0.04);
      align-self: flex-start;
      max-width: 90%;
      animation: cx-fade-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .cx-cta-title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--cx-dark);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cx-cta-desc {
      font-size: 12px;
      color: #555;
      line-height: 1.5;
    }
    .cx-cta-btn {
      background: var(--cx-red);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      text-align: center;
      display: inline-block;
      text-decoration: none;
    }
    .cx-cta-btn:hover {
      background: var(--cx-red-hover);
    }
    .cx-cta-btn:active {
      transform: scale(0.98);
    }

    /* Quick Action Chips */
    .cx-chips-container {
      padding: 10px 14px;
      background: white;
      border-top: 1px solid var(--cx-border);
      display: flex;
      gap: 8px;
      overflow-x: auto;
      white-space: nowrap;
      scroll-behavior: smooth;
    }
    .cx-chips-container::-webkit-scrollbar {
      display: none; /* Hide default scrollbar for sleek iOS-style swipe */
    }
    .cx-chip {
      background: #f1f1f1;
      border: 1px solid #e2e2e2;
      color: #444;
      font-size: 12px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 18px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.1s;
      display: inline-block;
      flex-shrink: 0;
    }
    .cx-chip:hover {
      background: #e8e8e8;
      border-color: #d0d0d0;
      transform: translateY(-1px);
    }
    .cx-chip:active {
      transform: translateY(0);
    }

    /* Footer Input Area */
    .cx-input-area {
      padding: 12px 16px 16px;
      background: white;
      border-top: 1px solid var(--cx-border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cx-input-box-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      background: #FAFAFA;
      border: 1.5px solid var(--cx-border);
      border-radius: 14px;
      padding: 6px 12px 6px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .cx-input-box-wrapper:focus-within {
      border-color: var(--cx-red);
      box-shadow: 0 0 0 3px rgba(227, 30, 36, 0.08);
      background: white;
    }

    /* Auto-growing Textarea */
    .cx-textarea {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      resize: none;
      font-family: inherit;
      font-size: 13.5px;
      line-height: 1.5;
      color: var(--cx-text-primary);
      max-height: 110px;
      min-height: 24px;
      height: 24px;
      padding: 3px 0;
    }
    .cx-textarea::placeholder {
      color: #aaa;
    }

    /* Send Button */
    .cx-send-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      transition: background 0.2s, transform 0.1s;
      color: #999;
      flex-shrink: 0;
    }
    .cx-send-btn.active {
      color: var(--cx-red);
      background: rgba(227, 30, 36, 0.06);
    }
    .cx-send-btn.active:hover {
      background: rgba(227, 30, 36, 0.1);
      transform: scale(1.05);
    }
    .cx-send-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .cx-footer-note {
      font-size: 10px;
      color: rgba(0,0,0,0.5);
      text-align: center;
      line-height: 1.2;
    }

    /* Mock Error Banner inside panel */
    .cx-error-banner {
      background: #FEE2E2;
      border: 1px solid #FCA5A5;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12px;
      color: #991B1B;
      margin-bottom: 8px;
      align-self: center;
      text-align: center;
      max-width: 90%;
      animation: cx-fade-slide 0.3s ease;
    }

    /* Rate-limit countdown banner (amber) */
    .cx-rate-banner {
      background: #fffbeb !important;
      border-color: #fcd34d !important;
      color: #92400e !important;
    }
    .cx-rate-banner strong { color: #b45309; font-weight: 700; }

    /* ── Animations ── */
    @keyframes cx-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
    @keyframes cx-pulse {
      0% { box-shadow: 0 0 0 0 rgba(39, 201, 63, 0.7); }
      70% { box-shadow: 0 0 0 6px rgba(39, 201, 63, 0); }
      100% { box-shadow: 0 0 0 0 rgba(39, 201, 63, 0); }
    }
    @keyframes cx-fade-slide {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ── Tablet (641px – 1024px) ── */
    @media (min-width: 641px) and (max-width: 1024px) {
      .cx-widget-container {
        bottom: 20px;
        right: 20px;
      }
      .cx-chat-panel {
        width: 340px;
        height: 520px;
        max-height: calc(100vh - 110px);
      }
    }

    /* ── Mobile (≤ 640px) – Floating chat widget, NOT full screen ── */
    @media (max-width: 640px) {
      .cx-widget-container {
        bottom: 16px;
        right: 16px;
      }
      .cx-launcher-tooltip {
        display: none;
      }
      .cx-launcher {
        width: 54px;
        height: 54px;
      }

      /* 
       * position: fixed anchors the panel directly to the VIEWPORT.
       * bottom + height together guarantee the panel never covers the full screen.
       * top: auto prevents it from stretching upward.
       */
      .cx-chat-panel {
        position: fixed !important;
        bottom: 86px !important;
        right: 12px !important;
        left: 12px !important;
        top: auto !important;
        width: auto !important;
        height: 440px !important;
        max-height: 55vh !important;
        min-height: 260px !important;
        border-radius: 20px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25) !important;
        z-index: 100000 !important;
      }
      
      .cx-header {
        padding: 12px 16px;
      }
      .cx-body {
        padding: 16px;
      }
      .cx-msg-bubble {
        font-size: 13px;
        padding: 10px 14px;
      }
      .cx-chips-container {
        padding: 8px 12px;
        gap: 8px;
      }
      .cx-chip {
        font-size: 11.5px;
        padding: 6px 12px;
      }
      .cx-input-area {
        padding: 10px 14px 14px;
      }
      .cx-input-box-wrapper {
        padding: 5px 10px 5px 12px;
      }
      .cx-textarea {
        font-size: 13px;
      }
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.innerHTML = `
    <!-- ─── COMPLETE INTERACTIVE CHAT WIDGET ─── -->
    <div class="cx-widget-container" id="cxWidget">
      
      <!-- Tooltip hint -->
      <div class="cx-launcher-tooltip" id="cxTooltip">
        <span class="cx-tooltip-dot"></span>
        Ask Caddxpert AI Advisor
      </div>

      <!-- Chat Panel -->
      <div class="cx-chat-panel" id="cxPanel">
        <!-- Header -->
        <div class="cx-header">
          <div class="cx-header-info">
            <div class="cx-header-avatar">CX</div>
            <div class="cx-header-meta">
              <span class="cx-header-title">Caddxpert AI Advisor</span>
              <div class="cx-header-status">
                <span class="cx-status-dot"></span>
                <span>Online • Powered by Cad Point</span>
              </div>
            </div>
          </div>
          <div class="cx-header-actions">
            <!-- Close / Minimize -->
            <button id="cxCloseBtn" title="Minimize Chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="cx-body" id="cxMessages">
          <!-- Welcome message -->
          <div class="cx-msg-wrapper bot">
            <div class="cx-msg-bubble">
              👋 Welcome to <strong>Caddxpert AI Innovations</strong> (Powered by CAD Point)! 
              <p style="margin-top: 8px;">I can guide you through our professional certificate programs in CAD, MEP, Civil Architecture, Mechanical, and Software Engineering.</p>
              <p style="margin-top: 8px;">How can I help you shape your engineering career today?</p>
            </div>
            <div class="cx-msg-timestamp" id="cxWelcomeTime">12:00 PM</div>
          </div>
        </div>

        <!-- Quick action chips -->
        <div class="cx-chips-container" id="cxChips">
          <div class="cx-chip" data-msg="Which CAD/Engineering courses do you offer?">CAD Courses 📐</div>
          <div class="cx-chip" data-msg="Are there placements after course completion?">Placements 💼</div>
          <div class="cx-chip" data-msg="What are the course fees and durations?">Fees &amp; Duration 💰</div>
          <div class="cx-chip" data-msg="Can I speak to a counselor for career advice?">Free Counselling 📞</div>
        </div>

        <!-- Message input area -->
        <div class="cx-input-area">
          <div class="cx-input-box-wrapper">
            <textarea 
              class="cx-textarea" 
              id="cxTextarea" 
              placeholder="Type a message..." 
              rows="1"
              autocomplete="off"
            ></textarea>
            <button class="cx-send-btn" id="cxSendBtn" title="Send message">
              <svg viewBox="0 0 24 24">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
            </button>
          </div>
          <div class="cx-footer-note">
            Our AI answers immediately. Press Enter to Send.
          </div>
        </div>
      </div>

      <!-- Launcher bubble -->
      <button class="cx-launcher" id="cxLauncher">
        <div class="cx-badge"></div>
        <!-- Chat Icon -->
        <svg class="cx-icon-chat" viewBox="0 0 24 24">
          <path d="M20,2H4C2.9,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M20,16H5.2L4,17.2V4h16V16z M7,9h10v2H7V9z M7,5h10v2H7V5z M7,13h7v2H7V13z"/>
        </svg>
        <!-- Close Icon -->
        <svg class="cx-icon-close" viewBox="0 0 24 24">
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(root);

  // ── Widget DOM Elements ──
  const launcher = document.getElementById('cxLauncher');
  const panel = document.getElementById('cxPanel');
  const closeBtn = document.getElementById('cxCloseBtn');
  const tooltip = document.getElementById('cxTooltip');
  const messagesContainer = document.getElementById('cxMessages');
  const textarea = document.getElementById('cxTextarea');
  const sendBtn = document.getElementById('cxSendBtn');
  const chipsContainer = document.getElementById('cxChips');
  const welcomeTime = document.getElementById('cxWelcomeTime');

  const now = new Date();
  if(welcomeTime) welcomeTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let isChatOpen = false;
  let isGenerating = false;
  let chatHistory = [];

  function toggleChat() {
    isChatOpen = !isChatOpen;
    launcher.classList.toggle('open', isChatOpen);
    panel.classList.toggle('open', isChatOpen);
    if (isChatOpen) {
      tooltip.classList.add('hidden');
      if (window.innerWidth > 640) setTimeout(() => textarea.focus(), 300);
      scrollChatToBottom();
    }
  }

  setTimeout(() => { if (!isChatOpen) tooltip.classList.add('hidden'); }, 7000);
  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight - 6, 110) + 'px';
    if (textarea.value.trim().length > 0) sendBtn.classList.add('active');
    else sendBtn.classList.remove('active');
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserSend(); }
  });
  sendBtn.addEventListener('click', handleUserSend);

  function parseMarkdown(text) {
    if (!text) return '';
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-weight:700; margin-top:8px; margin-bottom:4px;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="font-weight:700; margin-top:10px; margin-bottom:4px;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="font-weight:700; margin-top:12px; margin-bottom:6px;">$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^\s*\n\*/gm, '~');
    html = html.replace(/^-\s+(.*)/gim, '<li>$1</li>');
    html = html.replace(/^\s*\*\s+(.*)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul style="margin:6px 0; padding-left:16px;">$1</ul>');
    html = html.replace(/<\/ul>\s*<ul style="margin:6px 0; padding-left:16px;">/g, '');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function addMessageToUI(sender, text) {
    const msgWrapper = document.createElement('div');
    msgWrapper.className = 'cx-msg-wrapper ' + sender;
    const msgBubble = document.createElement('div');
    msgBubble.className = 'cx-msg-bubble';
    msgBubble.innerHTML = sender === 'bot' ? parseMarkdown(text) : escapeHTML(text);
    const timestamp = document.createElement('div');
    timestamp.className = 'cx-msg-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgWrapper.appendChild(msgBubble);
    msgWrapper.appendChild(timestamp);
    messagesContainer.appendChild(msgWrapper);
    scrollChatToBottom();
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]||t));
  }

  function scrollChatToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  chipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.cx-chip');
    if (!chip || isGenerating) return;
    const chipMessage = chip.getAttribute('data-msg');
    if (chipMessage) { sendUserMessage(chipMessage); }
  });

  function handleUserSend() {
    const msg = textarea.value.trim();
    if (!msg || isGenerating) return;
    sendUserMessage(msg);
    textarea.value = '';
    textarea.style.height = '24px';
    sendBtn.classList.remove('active');
  }

  let typingBubbleRef = null;
  function showTypingIndicator() {
    if (typingBubbleRef) return;
    typingBubbleRef = document.createElement('div');
    typingBubbleRef.className = 'cx-typing-bubble';
    typingBubbleRef.innerHTML = '<span class="cx-typing-dot"></span><span class="cx-typing-dot"></span><span class="cx-typing-dot"></span>';
    messagesContainer.appendChild(typingBubbleRef);
    scrollChatToBottom();
  }
  function removeTypingIndicator() {
    if (typingBubbleRef) { typingBubbleRef.remove(); typingBubbleRef = null; }
  }

  function triggerSmartCTA(textContext) {
    const lowercase = textContext.toLowerCase();
    const triggers = ['course', 'fee', 'admission', 'learn', 'placement', 'class', 'counsel', 'price', 'consult', 'duration', 'career', 'force-show'];
    if (triggers.some(t => lowercase.includes(t))) {
      const existingCTA = messagesContainer.querySelector('.cx-cta-card');
      if (existingCTA) existingCTA.remove();
      setTimeout(() => {
        const ctaCard = document.createElement('div');
        ctaCard.className = 'cx-cta-card';
        ctaCard.innerHTML = `<div class="cx-cta-title"><span>🎓</span> Free Counselling & Admission Guidance</div><div class="cx-cta-desc">Get an instant callback from our expert senior career advisors and secure special discounts on standard course fees.</div><a class="cx-cta-btn" href="${ENQUIRY}" target="_blank" rel="noopener" style="text-decoration:none;">Book Counseling Now</a>`;
        messagesContainer.appendChild(ctaCard);
        scrollChatToBottom();
      }, 600);
    }
  }

  function showInChatError(msg) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'cx-error-banner';
    errorDiv.innerText = msg;
    messagesContainer.appendChild(errorDiv);
    scrollChatToBottom();
  }

  function showRateLimit() {
    let secs = 60;
    const el = document.createElement('div');
    el.className = 'cx-error-banner cx-rate-banner';
    el.innerHTML = `⏳ Too many messages. Please wait <strong id="cxCountdown">${secs}s</strong> before sending again.`;
    messagesContainer.appendChild(el);
    scrollChatToBottom();

    sendBtn.disabled = true;
    textarea.disabled = true;
    textarea.placeholder = `Please wait ${secs}s…`;

    const tick = setInterval(() => {
      secs--;
      const cd = document.getElementById('cxCountdown');
      if (cd) cd.textContent = secs + 's';
      textarea.placeholder = `Please wait ${secs}s…`;

      if (secs <= 0) {
        clearInterval(tick);
        sendBtn.disabled = false;
        textarea.disabled = false;
        textarea.placeholder = 'Type a message...';
        if (el.parentNode) el.remove();
        textarea.focus();
      }
    }, 1000);
  }

  async function sendUserMessage(msgText) {
    addMessageToUI('user', msgText);
    chatHistory.push({ role: 'user', text: msgText });
    if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);

    showTypingIndicator();
    isGenerating = true;
    sendBtn.disabled = true;

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, history: chatHistory.slice(0, -1) })
      });

      removeTypingIndicator();

      if (res.status === 429) {
        showRateLimit();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { reply = "I'm unable to respond right now." } = await res.json();
      addMessageToUI('bot', reply);
      chatHistory.push({ role: 'model', text: reply });
      if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);
      
      triggerSmartCTA(msgText + " " + reply);
    } catch (err) {
      removeTypingIndicator();
      showInChatError("Connection trouble. Please try again or call +91 82484 90202.");
      console.error(err);
    } finally {
      isGenerating = false;
      sendBtn.disabled = false;
      textarea.focus();
    }
  }

})();