const fs = require('fs');

const html = fs.readFileSync('public/caddxpert_ai_assistant_widget_demo.html', 'utf8');

// Extract CSS
const cssMatch = html.match(/\/\* ─── CHAT WIDGET STYLES ─── \*\/[\s\S]*?@media \(max-width: 640px\) \{[\s\S]*?\}\s*\}/);
let css = cssMatch ? cssMatch[0] : '';
css = `:root {
  --cx-red: #E31E24;
  --cx-red-hover: #c41318;
  --cx-dark: #1C1C1C;
  --cx-dark-light: #2e2e2e;
  --cx-gray-bg: #f7f7f7;
  --cx-border: #e8e8e8;
  --cx-text-primary: #1C1C1C;
  --cx-text-secondary: #666666;
}\n` + css;

// Add rate-banner css
css += `
/* Rate-limit countdown banner (amber) */
.cx-rate-banner {
  background: #fffbeb !important;
  border-color: #fcd34d !important;
  color: #92400e !important;
}
.cx-rate-banner strong { color: #b45309; font-weight: 700; }
`;

// Extract HTML
const htmlMatch = html.match(/<!-- ─── COMPLETE INTERACTIVE CHAT WIDGET ─── -->[\s\S]*?<\/button>\s*<\/div>/);
let widgetHtml = htmlMatch ? htmlMatch[0] : '';

const jsContent = `(function () {
  'use strict';

  const scriptTag = document.currentScript;
  const BASE_URL  = (scriptTag && scriptTag.getAttribute('data-api')) || '';
  const ENQUIRY   = 'https://caddxpertai.in/enquiry';

  // Inject styles
  const style = document.createElement('style');
  style.textContent = ":root {\n  --cx-red: #E31E24;\n  --cx-red-hover: #c41318;\n  --cx-dark: #1C1C1C;\n  --cx-dark-light: #2e2e2e;\n  --cx-gray-bg: #f7f7f7;\n  --cx-border: #e8e8e8;\n  --cx-text-primary: #1C1C1C;\n  --cx-text-secondary: #666666;\n}\n/* ─── CHAT WIDGET STYLES ─── */\n    .cx-widget-container {\n      position: fixed;\n      bottom: 24px;\n      right: 24px;\n      z-index: 9999;\n      display: flex;\n      flex-direction: column;\n      align-items: flex-end;\n      font-family: 'Inter', sans-serif;\n    }\n\n    /* Bubble Launcher */\n    .cx-launcher {\n      width: 60px;\n      height: 60px;\n      border-radius: 50%;\n      background: linear-gradient(135deg, var(--cx-red) 0%, #b81419 100%);\n      box-shadow: 0 4px 20px rgba(227, 30, 36, 0.4);\n      cursor: pointer;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;\n      border: none;\n      outline: none;\n      position: relative;\n    }\n    .cx-launcher:hover {\n      transform: scale(1.08);\n      box-shadow: 0 6px 24px rgba(227, 30, 36, 0.5);\n    }\n    .cx-launcher:active {\n      transform: scale(0.95);\n    }\n    .cx-launcher svg {\n      width: 26px;\n      height: 26px;\n      fill: white;\n      transition: transform 0.3s ease, opacity 0.2s;\n    }\n    .cx-launcher .cx-icon-close {\n      position: absolute;\n      opacity: 0;\n      transform: rotate(-45deg) scale(0.8);\n    }\n    .cx-launcher.open .cx-icon-chat {\n      opacity: 0;\n      transform: rotate(45deg) scale(0.8);\n    }\n    .cx-launcher.open .cx-icon-close {\n      opacity: 1;\n      transform: rotate(0deg) scale(1);\n    }\n\n    /* Notification Badge */\n    .cx-badge {\n      position: absolute;\n      top: -2px;\n      right: -2px;\n      width: 14px;\n      height: 14px;\n      background: #27c93f;\n      border: 2px solid white;\n      border-radius: 50%;\n      animation: cx-pulse 2s infinite;\n    }\n\n    /* Launcher Tooltip */\n    .cx-launcher-tooltip {\n      position: absolute;\n      right: 76px;\n      bottom: 10px;\n      background: white;\n      border: 1px solid var(--cx-border);\n      border-radius: 12px;\n      padding: 10px 16px;\n      box-shadow: 0 4px 15px rgba(0,0,0,0.06);\n      font-size: 13px;\n      font-weight: 500;\n      color: var(--cx-text-primary);\n      white-space: nowrap;\n      pointer-events: none;\n      opacity: 1;\n      transform: translateX(10px);\n      transition: opacity 0.3s, transform 0.3s;\n      display: flex;\n      align-items: center;\n      gap: 8px;\n    }\n    .cx-launcher-tooltip.hidden {\n      opacity: 0;\n      transform: translateX(20px);\n    }\n    .cx-tooltip-dot {\n      width: 8px;\n      height: 8px;\n      background-color: var(--cx-red);\n      border-radius: 50%;\n    }\n\n    /* Chat Panel */\n    .cx-chat-panel {\n      position: absolute;\n      bottom: 76px;\n      right: 0;\n      width: 385px;\n      height: 600px;\n      max-height: calc(100vh - 120px);\n      background: white;\n      border-radius: 20px;\n      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);\n      border: 1px solid rgba(0,0,0,0.05);\n      display: flex;\n      flex-direction: column;\n      overflow: hidden;\n      opacity: 0;\n      transform: translateY(20px) scale(0.95);\n      pointer-events: none;\n      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n    }\n    .cx-chat-panel.open {\n      opacity: 1;\n      transform: translateY(0) scale(1);\n      pointer-events: all;\n    }\n\n    /* Panel Header */\n    .cx-header {\n      background: var(--cx-dark);\n      padding: 16px 20px;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      border-bottom: 1px solid rgba(255,255,255,0.08);\n    }\n    .cx-header-info {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n    }\n    .cx-header-avatar {\n      width: 38px;\n      height: 38px;\n      background: var(--cx-red);\n      border-radius: 10px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-weight: 800;\n      font-size: 13px;\n      color: white;\n    }\n    .cx-header-meta {\n      display: flex;\n      flex-direction: column;\n    }\n    .cx-header-title {\n      color: white;\n      font-weight: 700;\n      font-size: 14.5px;\n      line-height: 1.2;\n    }\n    .cx-header-status {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      font-size: 11.5px;\n      color: rgba(255,255,255,0.5);\n      margin-top: 2px;\n    }\n    .cx-status-dot {\n      width: 7px;\n      height: 7px;\n      background: #27c93f;\n      border-radius: 50%;\n    }\n    .cx-header-actions button {\n      background: transparent;\n      border: none;\n      cursor: pointer;\n      color: rgba(255,255,255,0.6);\n      padding: 6px;\n      border-radius: 50%;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      transition: background 0.2s, color 0.2s;\n    }\n    .cx-header-actions button:hover {\n      background: rgba(255,255,255,0.1);\n      color: white;\n    }\n\n    /* Message Area */\n    .cx-body {\n      flex: 1;\n      padding: 20px;\n      overflow-y: auto;\n      display: flex;\n      flex-direction: column;\n      gap: 16px;\n      background: #FAFAFA;\n      scroll-behavior: smooth;\n    }\n\n    /* Custom Scrollbar for Message Area */\n    .cx-body::-webkit-scrollbar {\n      width: 6px;\n    }\n    .cx-body::-webkit-scrollbar-track {\n      background: transparent;\n    }\n    .cx-body::-webkit-scrollbar-thumb {\n      background-color: rgba(0,0,0,0.1);\n      border-radius: 10px;\n    }\n\n    /* Chat Bubbles */\n    .cx-msg-wrapper {\n      display: flex;\n      flex-direction: column;\n      max-width: 82%;\n      animation: cx-fade-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n    }\n    .cx-msg-wrapper.bot {\n      align-self: flex-start;\n    }\n    .cx-msg-wrapper.user {\n      align-self: flex-end;\n    }\n\n    .cx-msg-bubble {\n      padding: 12px 16px;\n      border-radius: 16px;\n      font-size: 13.5px;\n      line-height: 1.5;\n      word-wrap: break-word;\n    }\n    .bot .cx-msg-bubble {\n      background: white;\n      color: var(--cx-text-primary);\n      border-bottom-left-radius: 4px;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.03);\n      border: 1px solid rgba(0,0,0,0.04);\n    }\n    .user .cx-msg-bubble {\n      background: var(--cx-red);\n      color: white;\n      border-bottom-right-radius: 4px;\n      box-shadow: 0 4px 12px rgba(227, 30, 36, 0.15);\n    }\n\n    .cx-msg-timestamp {\n      font-size: 10px;\n      color: #999;\n      margin-top: 4px;\n      margin-left: 4px;\n    }\n    .user .cx-msg-timestamp {\n      align-self: flex-end;\n      margin-right: 4px;\n    }\n\n    /* Markdown Styling in Bot Bubbles */\n    .cx-msg-bubble strong, .cx-msg-bubble b {\n      font-weight: 700;\n      color: #000;\n    }\n    .cx-msg-bubble p {\n      margin-bottom: 8px;\n    }\n    .cx-msg-bubble p:last-child {\n      margin-bottom: 0;\n    }\n    .cx-msg-bubble ul, .cx-msg-bubble ol {\n      padding-left: 18px;\n      margin: 8px 0;\n    }\n    .cx-msg-bubble li {\n      margin-bottom: 4px;\n    }\n\n    /* Dynamic Typing Indicator */\n    .cx-typing-bubble {\n      display: flex;\n      align-items: center;\n      gap: 5px;\n      padding: 12px 18px;\n      background: white;\n      border-radius: 16px;\n      border-bottom-left-radius: 4px;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.03);\n      border: 1px solid rgba(0,0,0,0.04);\n      width: fit-content;\n      align-self: flex-start;\n      margin-bottom: 12px;\n    }\n    .cx-typing-dot {\n      width: 7px;\n      height: 7px;\n      background: #c0c0c0;\n      border-radius: 50%;\n      animation: cx-bounce 1.4s infinite ease-in-out both;\n    }\n    .cx-typing-dot:nth-child(1) { animation-delay: -0.32s; }\n    .cx-typing-dot:nth-child(2) { animation-delay: -0.16s; }\n\n    /* Action CTA Card */\n    .cx-cta-card {\n      background: linear-gradient(135deg, #FFF8F8 0%, #FFF1F1 100%);\n      border: 1px solid rgba(227, 30, 36, 0.15);\n      border-radius: 14px;\n      padding: 16px;\n      margin-top: 8px;\n      display: flex;\n      flex-direction: column;\n      gap: 12px;\n      box-shadow: 0 4px 15px rgba(227, 30, 36, 0.04);\n      align-self: flex-start;\n      max-width: 90%;\n      animation: cx-fade-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n    }\n    .cx-cta-title {\n      font-size: 13.5px;\n      font-weight: 700;\n      color: var(--cx-dark);\n      display: flex;\n      align-items: center;\n      gap: 6px;\n    }\n    .cx-cta-desc {\n      font-size: 12px;\n      color: #555;\n      line-height: 1.5;\n    }\n    .cx-cta-btn {\n      background: var(--cx-red);\n      color: white;\n      border: none;\n      border-radius: 8px;\n      padding: 8px 14px;\n      font-size: 12.5px;\n      font-weight: 600;\n      cursor: pointer;\n      transition: background 0.2s, transform 0.1s;\n      text-align: center;\n      display: inline-block;\n      text-decoration: none;\n    }\n    .cx-cta-btn:hover {\n      background: var(--cx-red-hover);\n    }\n    .cx-cta-btn:active {\n      transform: scale(0.98);\n    }\n\n    /* Quick Action Chips */\n    .cx-chips-container {\n      padding: 10px 14px;\n      background: white;\n      border-top: 1px solid var(--cx-border);\n      display: flex;\n      gap: 8px;\n      overflow-x: auto;\n      white-space: nowrap;\n      scroll-behavior: smooth;\n    }\n    .cx-chips-container::-webkit-scrollbar {\n      display: none; /* Hide default scrollbar for sleek iOS-style swipe */\n    }\n    .cx-chip {\n      background: #f1f1f1;\n      border: 1px solid #e2e2e2;\n      color: #444;\n      font-size: 12px;\n      font-weight: 500;\n      padding: 8px 14px;\n      border-radius: 18px;\n      cursor: pointer;\n      transition: background 0.2s, border-color 0.2s, transform 0.1s;\n      display: inline-block;\n      flex-shrink: 0;\n    }\n    .cx-chip:hover {\n      background: #e8e8e8;\n      border-color: #d0d0d0;\n      transform: translateY(-1px);\n    }\n    .cx-chip:active {\n      transform: translateY(0);\n    }\n\n    /* Footer Input Area */\n    .cx-input-area {\n      padding: 12px 16px 16px;\n      background: white;\n      border-top: 1px solid var(--cx-border);\n      display: flex;\n      flex-direction: column;\n      gap: 8px;\n    }\n    .cx-input-box-wrapper {\n      display: flex;\n      align-items: flex-end;\n      gap: 10px;\n      background: #FAFAFA;\n      border: 1.5px solid var(--cx-border);\n      border-radius: 14px;\n      padding: 6px 12px 6px 14px;\n      transition: border-color 0.2s, box-shadow 0.2s;\n    }\n    .cx-input-box-wrapper:focus-within {\n      border-color: var(--cx-red);\n      box-shadow: 0 0 0 3px rgba(227, 30, 36, 0.08);\n      background: white;\n    }\n\n    /* Auto-growing Textarea */\n    .cx-textarea {\n      flex: 1;\n      border: none;\n      background: transparent;\n      outline: none;\n      resize: none;\n      font-family: inherit;\n      font-size: 13.5px;\n      line-height: 1.5;\n      color: var(--cx-text-primary);\n      max-height: 110px;\n      min-height: 24px;\n      height: 24px;\n      padding: 3px 0;\n    }\n    .cx-textarea::placeholder {\n      color: #aaa;\n    }\n\n    /* Send Button */\n    .cx-send-btn {\n      background: transparent;\n      border: none;\n      cursor: pointer;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      width: 34px;\n      height: 34px;\n      border-radius: 50%;\n      transition: background 0.2s, transform 0.1s;\n      color: #999;\n      flex-shrink: 0;\n    }\n    .cx-send-btn.active {\n      color: var(--cx-red);\n      background: rgba(227, 30, 36, 0.06);\n    }\n    .cx-send-btn.active:hover {\n      background: rgba(227, 30, 36, 0.1);\n      transform: scale(1.05);\n    }\n    .cx-send-btn svg {\n      width: 18px;\n      height: 18px;\n      fill: currentColor;\n    }\n\n    .cx-footer-note {\n      font-size: 10px;\n      color: rgba(0,0,0,0.5);\n      text-align: center;\n      line-height: 1.2;\n    }\n\n    /* ─── ENQUIRY FORM MODAL ─── */\n    .cx-modal {\n      position: fixed;\n      top: 0; left: 0; right: 0; bottom: 0;\n      background: rgba(0,0,0,0.5);\n      backdrop-filter: blur(4px);\n      z-index: 100000;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      opacity: 0;\n      pointer-events: none;\n      transition: opacity 0.3s ease;\n      padding: 16px;\n    }\n    .cx-modal.open {\n      opacity: 1;\n      pointer-events: all;\n    }\n    .cx-modal-card {\n      background: white;\n      border-radius: 20px;\n      width: 100%;\n      max-width: 420px;\n      box-shadow: 0 20px 50px rgba(0,0,0,0.3);\n      overflow: hidden;\n      transform: scale(0.9) translateY(20px);\n      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n    }\n    .cx-modal.open .cx-modal-card {\n      transform: scale(1) translateY(0);\n    }\n    .cx-modal-header {\n      background: var(--cx-dark);\n      padding: 20px 24px;\n      color: white;\n      position: relative;\n    }\n    .cx-modal-header h3 {\n      font-size: 16px;\n      font-weight: 700;\n      margin-bottom: 4px;\n    }\n    .cx-modal-header p {\n      color: rgba(255,255,255,0.6);\n      font-size: 12px;\n    }\n    .cx-modal-close {\n      position: absolute;\n      top: 20px;\n      right: 20px;\n      background: transparent;\n      border: none;\n      color: rgba(255,255,255,0.6);\n      cursor: pointer;\n      transition: color 0.2s;\n    }\n    .cx-modal-close:hover {\n      color: white;\n    }\n    .cx-modal-body {\n      padding: 24px;\n      display: flex;\n      flex-direction: column;\n      gap: 16px;\n    }\n    .cx-form-group {\n      display: flex;\n      flex-direction: column;\n      gap: 6px;\n    }\n    .cx-form-group label {\n      font-size: 12.5px;\n      font-weight: 600;\n      color: var(--cx-text-primary);\n    }\n    .cx-form-group input, .cx-form-group select {\n      padding: 10px 14px;\n      border: 1.5px solid var(--cx-border);\n      border-radius: 10px;\n      font-size: 13.5px;\n      font-family: inherit;\n      outline: none;\n      transition: border-color 0.2s;\n    }\n    .cx-form-group input:focus, .cx-form-group select:focus {\n      border-color: var(--cx-red);\n    }\n    .cx-form-submit {\n      background: var(--cx-red);\n      color: white;\n      border: none;\n      border-radius: 10px;\n      padding: 12px;\n      font-size: 14px;\n      font-weight: 600;\n      cursor: pointer;\n      transition: background 0.2s;\n      margin-top: 8px;\n    }\n    .cx-form-submit:hover {\n      background: var(--cx-red-hover);\n    }\n\n    /* Mock Error Banner inside panel */\n    .cx-error-banner {\n      background: #FEE2E2;\n      border: 1px solid #FCA5A5;\n      border-radius: 10px;\n      padding: 10px 14px;\n      font-size: 12px;\n      color: #991B1B;\n      margin-bottom: 8px;\n      align-self: center;\n      text-align: center;\n      max-width: 90%;\n      animation: cx-fade-slide 0.3s ease;\n    }\n\n    /* ── Animations ── */\n    @keyframes cx-bounce {\n      0%, 80%, 100% { transform: scale(0); }\n      40% { transform: scale(1.0); }\n    }\n    @keyframes cx-pulse {\n      0% { box-shadow: 0 0 0 0 rgba(39, 201, 63, 0.7); }\n      70% { box-shadow: 0 0 0 6px rgba(39, 201, 63, 0); }\n      100% { box-shadow: 0 0 0 0 rgba(39, 201, 63, 0); }\n    }\n    @keyframes cx-fade-slide {\n      from {\n        opacity: 0;\n        transform: translateY(8px);\n      }\n      to {\n        opacity: 1;\n        transform: translateY(0);\n      }\n    }\n\n    /* ── Responsive Adjustment ── */\n    @media (max-width: 640px) {\n      .cx-widget-container {\n        bottom: 16px;\n        right: 16px;\n      }\n      .cx-launcher-tooltip {\n        display: none; /* Hide tooltip on small mobile screens */\n      }\n      .cx-chat-panel {\n        position: fixed;\n        bottom: 0 !important;\n        right: 0 !important;\n        top: 0 !important;\n        left: 0 !important;\n        width: 100% !important;\n        height: 100% !important;\n        max-height: 100% !important;\n        border-radius: 0 !important;\n        z-index: 100000;\n      }\n      .cx-header {\n        padding: 14px 16px;\n      }\n      nav {\n        padding: 0 20px;\n      }\n      .hero {\n        padding: 60px 20px;\n      }\n      main {\n        padding: 40px 16px 80px;\n      }\n    }\n  \n/* Rate-limit countdown banner (amber) */\n.cx-rate-banner {\n  background: #fffbeb !important;\n  border-color: #fcd34d !important;\n  color: #92400e !important;\n}\n.cx-rate-banner strong { color: #b45309; font-weight: 700; }\n";
  document.head.appendChild(style);

  // Inject HTML
  const root = document.createElement('div');
  root.innerHTML = "<!-- ─── COMPLETE INTERACTIVE CHAT WIDGET ─── -->\n<div class=\"cx-widget-container\" id=\"cxWidget\">\n  \n  <!-- Tooltip hint -->\n  <div class=\"cx-launcher-tooltip\" id=\"cxTooltip\">\n    <span class=\"cx-tooltip-dot\"></span>\n    Ask Caddxpert AI Advisor\n  </div>\n\n  <!-- Chat Panel -->\n  <div class=\"cx-chat-panel\" id=\"cxPanel\">\n    <!-- Header -->\n    <div class=\"cx-header\">\n      <div class=\"cx-header-info\">\n        <div class=\"cx-header-avatar\">CX</div>\n        <div class=\"cx-header-meta\">\n          <span class=\"cx-header-title\">Caddxpert AI Advisor</span>\n          <div class=\"cx-header-status\">\n            <span class=\"cx-status-dot\"></span>\n            <span>Online • Powered by Cad Point</span>\n          </div>\n        </div>\n      </div>\n      <div class=\"cx-header-actions\">\n        <!-- Close / Minimize -->\n        <button id=\"cxCloseBtn\" title=\"Minimize Chat\">\n          <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\n            <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\n          </svg>\n        </button>\n      </div>\n    </div>\n\n    <!-- Messages Container -->\n    <div class=\"cx-body\" id=\"cxMessages\">\n      <!-- Welcome message -->\n      <div class=\"cx-msg-wrapper bot\">\n        <div class=\"cx-msg-bubble\">\n          👋 Welcome to <strong>Caddxpert AI Innovations</strong> (Powered by CAD Point)! \n          <p style=\"margin-top: 8px;\">I can guide you through our professional certificate programs in CAD, MEP, Civil Architecture, Mechanical, and Software Engineering.</p>\n          <p style=\"margin-top: 8px;\">How can I help you shape your engineering career today?</p>\n        </div>\n        <div class=\"cx-msg-timestamp\" id=\"cxWelcomeTime\">12:00 PM</div>\n      </div>\n    </div>\n\n    <!-- Quick action chips -->\n    <div class=\"cx-chips-container\" id=\"cxChips\">\n      <div class=\"cx-chip\" data-msg=\"Which CAD/Engineering courses do you offer?\">CAD Courses 📐</div>\n      <div class=\"cx-chip\" data-msg=\"Are there placements after course completion?\">Placements 💼</div>\n      <div class=\"cx-chip\" data-msg=\"What are the course fees and durations?\">Fees &amp; Duration 💰</div>\n      <div class=\"cx-chip\" data-msg=\"Can I speak to a counselor for career advice?\">Free Counselling 📞</div>\n    </div>\n\n    <!-- Message input area -->\n    <div class=\"cx-input-area\">\n      <div class=\"cx-input-box-wrapper\">\n        <textarea \n          class=\"cx-textarea\" \n          id=\"cxTextarea\" \n          placeholder=\"Type a message...\" \n          rows=\"1\"\n          autocomplete=\"off\"\n        ></textarea>\n        <button class=\"cx-send-btn\" id=\"cxSendBtn\" title=\"Send message\">\n          <svg viewBox=\"0 0 24 24\">\n            <path d=\"M2,21L23,12L2,3V10L17,12L2,14V21Z\" />\n          </svg>\n        </button>\n      </div>\n      <div class=\"cx-footer-note\">\n        Our AI answers immediately. Press Enter to Send.\n      </div>\n    </div>\n  </div>\n\n  <!-- Launcher bubble -->\n  <button class=\"cx-launcher\" id=\"cxLauncher\">\n    <div class=\"cx-badge\"></div>\n    <!-- Chat Icon -->\n    <svg class=\"cx-icon-chat\" viewBox=\"0 0 24 24\">\n      <path d=\"M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M20,16H5.2L4,17.2V4h16V16z M7,9h10v2H7V9z M7,5h10v2H7V5z M7,13h7v2H7V13z\"/>\n    </svg>\n    <!-- Close Icon -->\n    <svg class=\"cx-icon-close\" viewBox=\"0 0 24 24\">\n      <path d=\"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z\"/>\n    </svg>\n  </button>\n</div>";
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
    html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    html = html.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
    html = html.replace(/^\\s*\\n\\*/gm, '~');
    html = html.replace(/^-\\s+(.*)/gim, '<li>$1</li>');
    html = html.replace(/^\\s*\\*\\s+(.*)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\\/li>)/gim, '<ul style="margin:6px 0; padding-left:16px;">$1</ul>');
    html = html.replace(/<\\/ul>\\s*<ul style="margin:6px 0; padding-left:16px;">/g, '');
    html = html.replace(/\\n/g, '<br>');
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
        ctaCard.innerHTML = \`<div class="cx-cta-title"><span>🎓</span> Free Counselling & Admission Guidance</div><div class="cx-cta-desc">Get an instant callback from our expert senior career advisors and secure special discounts on standard course fees.</div><a class="cx-cta-btn" href="\${ENQUIRY}" target="_blank" rel="noopener" style="text-decoration:none;">Book Counseling Now</a>\`;
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
    el.innerHTML = \`⏳ Too many messages. Please wait <strong id="cxCountdown">\${secs}s</strong> before sending again.\`;
    messagesContainer.appendChild(el);
    scrollChatToBottom();

    sendBtn.disabled = true;
    textarea.disabled = true;
    textarea.placeholder = \`Please wait \${secs}s…\`;

    const tick = setInterval(() => {
      secs--;
      const cd = document.getElementById('cxCountdown');
      if (cd) cd.textContent = secs + 's';
      textarea.placeholder = \`Please wait \${secs}s…\`;

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
      const res = await fetch(\`\${BASE_URL}/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, history: chatHistory.slice(0, -1) })
      });

      removeTypingIndicator();

      if (res.status === 429) {
        showRateLimit();
        return;
      }

      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);

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
`;

fs.writeFileSync('public/widget.js', jsContent);
console.log('Saved public/widget.js with exact UI!');
