(function () {
  'use strict';

  const scriptTag = document.currentScript;
  const BASE_URL  = (scriptTag && scriptTag.getAttribute('data-api')) || '';
  const ENQUIRY   = 'https://caddxpertai.in/enquiry';

  // Inject styles
  const style = document.createElement('style');
  style.textContent = ":root {\n  --cx-red: #E31E24;\n  --cx-red-hover: #c41318;\n  --cx-dark: #1C1C1C;\n  --cx-dark-light: #2e2e2e;\n  --cx-gray-bg: #f7f7f7;\n  --cx-border: #e8e8e8;\n  --cx-text-primary: #1C1C1C;\n  --cx-text-secondary: #666666;\n}\n/* ─── CHAT WIDGET STYLES ─── */\r\n    .cx-widget-container {\r\n      position: fixed;\r\n      bottom: 24px;\r\n      right: 24px;\r\n      z-index: 9999;\r\n      display: flex;\r\n      flex-direction: column;\r\n      align-items: flex-end;\r\n      font-family: 'Inter', sans-serif;\r\n    }\r\n\r\n    /* Bubble Launcher */\r\n    .cx-launcher {\r\n      width: 60px;\r\n      height: 60px;\r\n      border-radius: 50%;\r\n      background: linear-gradient(135deg, var(--cx-red) 0%, #b81419 100%);\r\n      box-shadow: 0 4px 20px rgba(227, 30, 36, 0.4);\r\n      cursor: pointer;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;\r\n      border: none;\r\n      outline: none;\r\n      position: relative;\r\n    }\r\n    .cx-launcher:hover {\r\n      transform: scale(1.08);\r\n      box-shadow: 0 6px 24px rgba(227, 30, 36, 0.5);\r\n    }\r\n    .cx-launcher:active {\r\n      transform: scale(0.95);\r\n    }\r\n    .cx-launcher svg {\r\n      width: 26px;\r\n      height: 26px;\r\n      fill: white;\r\n      transition: transform 0.3s ease, opacity 0.2s;\r\n    }\r\n    .cx-launcher .cx-icon-close {\r\n      position: absolute;\r\n      opacity: 0;\r\n      transform: rotate(-45deg) scale(0.8);\r\n    }\r\n    .cx-launcher.open .cx-icon-chat {\r\n      opacity: 0;\r\n      transform: rotate(45deg) scale(0.8);\r\n    }\r\n    .cx-launcher.open .cx-icon-close {\r\n      opacity: 1;\r\n      transform: rotate(0deg) scale(1);\r\n    }\r\n\r\n    /* Notification Badge */\r\n    .cx-badge {\r\n      position: absolute;\r\n      top: -2px;\r\n      right: -2px;\r\n      width: 14px;\r\n      height: 14px;\r\n      background: #27c93f;\r\n      border: 2px solid white;\r\n      border-radius: 50%;\r\n      animation: cx-pulse 2s infinite;\r\n    }\r\n\r\n    /* Launcher Tooltip */\r\n    .cx-launcher-tooltip {\r\n      position: absolute;\r\n      right: 76px;\r\n      bottom: 10px;\r\n      background: white;\r\n      border: 1px solid var(--cx-border);\r\n      border-radius: 12px;\r\n      padding: 10px 16px;\r\n      box-shadow: 0 4px 15px rgba(0,0,0,0.06);\r\n      font-size: 13px;\r\n      font-weight: 500;\r\n      color: var(--cx-text-primary);\r\n      white-space: nowrap;\r\n      pointer-events: none;\r\n      opacity: 1;\r\n      transform: translateX(10px);\r\n      transition: opacity 0.3s, transform 0.3s;\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 8px;\r\n    }\r\n    .cx-launcher-tooltip.hidden {\r\n      opacity: 0;\r\n      transform: translateX(20px);\r\n    }\r\n    .cx-tooltip-dot {\r\n      width: 8px;\r\n      height: 8px;\r\n      background-color: var(--cx-red);\r\n      border-radius: 50%;\r\n    }\r\n\r\n    /* Chat Panel */\r\n    .cx-chat-panel {\r\n      position: absolute;\r\n      bottom: 76px;\r\n      right: 0;\r\n      width: 385px;\r\n      height: 600px;\r\n      max-height: calc(100vh - 120px);\r\n      background: white;\r\n      border-radius: 20px;\r\n      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);\r\n      border: 1px solid rgba(0,0,0,0.05);\r\n      display: flex;\r\n      flex-direction: column;\r\n      overflow: hidden;\r\n      opacity: 0;\r\n      transform: translateY(20px) scale(0.95);\r\n      pointer-events: none;\r\n      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);\r\n    }\r\n    .cx-chat-panel.open {\r\n      opacity: 1;\r\n      transform: translateY(0) scale(1);\r\n      pointer-events: all;\r\n    }\r\n\r\n    /* Panel Header */\r\n    .cx-header {\r\n      background: var(--cx-dark);\r\n      padding: 16px 20px;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: space-between;\r\n      border-bottom: 1px solid rgba(255,255,255,0.08);\r\n    }\r\n    .cx-header-info {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 12px;\r\n    }\r\n    .cx-header-avatar {\r\n      width: 38px;\r\n      height: 38px;\r\n      background: var(--cx-red);\r\n      border-radius: 10px;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      font-weight: 800;\r\n      font-size: 13px;\r\n      color: white;\r\n    }\r\n    .cx-header-meta {\r\n      display: flex;\r\n      flex-direction: column;\r\n    }\r\n    .cx-header-title {\r\n      color: white;\r\n      font-weight: 700;\r\n      font-size: 14.5px;\r\n      line-height: 1.2;\r\n    }\r\n    .cx-header-status {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 6px;\r\n      font-size: 11.5px;\r\n      color: rgba(255,255,255,0.5);\r\n      margin-top: 2px;\r\n    }\r\n    .cx-status-dot {\r\n      width: 7px;\r\n      height: 7px;\r\n      background: #27c93f;\r\n      border-radius: 50%;\r\n    }\r\n    .cx-header-actions button {\r\n      background: transparent;\r\n      border: none;\r\n      cursor: pointer;\r\n      color: rgba(255,255,255,0.6);\r\n      padding: 6px;\r\n      border-radius: 50%;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      transition: background 0.2s, color 0.2s;\r\n    }\r\n    .cx-header-actions button:hover {\r\n      background: rgba(255,255,255,0.1);\r\n      color: white;\r\n    }\r\n\r\n    /* Message Area */\r\n    .cx-body {\r\n      flex: 1;\r\n      padding: 20px;\r\n      overflow-y: auto;\r\n      display: flex;\r\n      flex-direction: column;\r\n      gap: 16px;\r\n      background: #FAFAFA;\r\n      scroll-behavior: smooth;\r\n    }\r\n\r\n    /* Custom Scrollbar for Message Area */\r\n    .cx-body::-webkit-scrollbar {\r\n      width: 6px;\r\n    }\r\n    .cx-body::-webkit-scrollbar-track {\r\n      background: transparent;\r\n    }\r\n    .cx-body::-webkit-scrollbar-thumb {\r\n      background-color: rgba(0,0,0,0.1);\r\n      border-radius: 10px;\r\n    }\r\n\r\n    /* Chat Bubbles */\r\n    .cx-msg-wrapper {\r\n      display: flex;\r\n      flex-direction: column;\r\n      max-width: 82%;\r\n      animation: cx-fade-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;\r\n    }\r\n    .cx-msg-wrapper.bot {\r\n      align-self: flex-start;\r\n    }\r\n    .cx-msg-wrapper.user {\r\n      align-self: flex-end;\r\n    }\r\n\r\n    .cx-msg-bubble {\r\n      padding: 12px 16px;\r\n      border-radius: 16px;\r\n      font-size: 13.5px;\r\n      line-height: 1.5;\r\n      word-wrap: break-word;\r\n    }\r\n    .bot .cx-msg-bubble {\r\n      background: white;\r\n      color: var(--cx-text-primary);\r\n      border-bottom-left-radius: 4px;\r\n      box-shadow: 0 2px 8px rgba(0,0,0,0.03);\r\n      border: 1px solid rgba(0,0,0,0.04);\r\n    }\r\n    .user .cx-msg-bubble {\r\n      background: var(--cx-red);\r\n      color: white;\r\n      border-bottom-right-radius: 4px;\r\n      box-shadow: 0 4px 12px rgba(227, 30, 36, 0.15);\r\n    }\r\n\r\n    .cx-msg-timestamp {\r\n      font-size: 10px;\r\n      color: #999;\r\n      margin-top: 4px;\r\n      margin-left: 4px;\r\n    }\r\n    .user .cx-msg-timestamp {\r\n      align-self: flex-end;\r\n      margin-right: 4px;\r\n    }\r\n\r\n    /* Markdown Styling in Bot Bubbles */\r\n    .cx-msg-bubble strong, .cx-msg-bubble b {\r\n      font-weight: 700;\r\n      color: #000;\r\n    }\r\n    .cx-msg-bubble p {\r\n      margin-bottom: 8px;\r\n    }\r\n    .cx-msg-bubble p:last-child {\r\n      margin-bottom: 0;\r\n    }\r\n    .cx-msg-bubble ul, .cx-msg-bubble ol {\r\n      padding-left: 18px;\r\n      margin: 8px 0;\r\n    }\r\n    .cx-msg-bubble li {\r\n      margin-bottom: 4px;\r\n    }\r\n\r\n    /* Dynamic Typing Indicator */\r\n    .cx-typing-bubble {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 5px;\r\n      padding: 12px 18px;\r\n      background: white;\r\n      border-radius: 16px;\r\n      border-bottom-left-radius: 4px;\r\n      box-shadow: 0 2px 8px rgba(0,0,0,0.03);\r\n      border: 1px solid rgba(0,0,0,0.04);\r\n      width: fit-content;\r\n      align-self: flex-start;\r\n      margin-bottom: 12px;\r\n    }\r\n    .cx-typing-dot {\r\n      width: 7px;\r\n      height: 7px;\r\n      background: #c0c0c0;\r\n      border-radius: 50%;\r\n      animation: cx-bounce 1.4s infinite ease-in-out both;\r\n    }\r\n    .cx-typing-dot:nth-child(1) { animation-delay: -0.32s; }\r\n    .cx-typing-dot:nth-child(2) { animation-delay: -0.16s; }\r\n\r\n    /* Action CTA Card */\r\n    .cx-cta-card {\r\n      background: linear-gradient(135deg, #FFF8F8 0%, #FFF1F1 100%);\r\n      border: 1px solid rgba(227, 30, 36, 0.15);\r\n      border-radius: 14px;\r\n      padding: 16px;\r\n      margin-top: 8px;\r\n      display: flex;\r\n      flex-direction: column;\r\n      gap: 12px;\r\n      box-shadow: 0 4px 15px rgba(227, 30, 36, 0.04);\r\n      align-self: flex-start;\r\n      max-width: 90%;\r\n      animation: cx-fade-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;\r\n    }\r\n    .cx-cta-title {\r\n      font-size: 13.5px;\r\n      font-weight: 700;\r\n      color: var(--cx-dark);\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 6px;\r\n    }\r\n    .cx-cta-desc {\r\n      font-size: 12px;\r\n      color: #555;\r\n      line-height: 1.5;\r\n    }\r\n    .cx-cta-btn {\r\n      background: var(--cx-red);\r\n      color: white;\r\n      border: none;\r\n      border-radius: 8px;\r\n      padding: 8px 14px;\r\n      font-size: 12.5px;\r\n      font-weight: 600;\r\n      cursor: pointer;\r\n      transition: background 0.2s, transform 0.1s;\r\n      text-align: center;\r\n      display: inline-block;\r\n      text-decoration: none;\r\n    }\r\n    .cx-cta-btn:hover {\r\n      background: var(--cx-red-hover);\r\n    }\r\n    .cx-cta-btn:active {\r\n      transform: scale(0.98);\r\n    }\r\n\r\n    /* Quick Action Chips */\r\n    .cx-chips-container {\r\n      padding: 10px 14px;\r\n      background: white;\r\n      border-top: 1px solid var(--cx-border);\r\n      display: flex;\r\n      gap: 8px;\r\n      overflow-x: auto;\r\n      white-space: nowrap;\r\n      scroll-behavior: smooth;\r\n    }\r\n    .cx-chips-container::-webkit-scrollbar {\r\n      display: none; /* Hide default scrollbar for sleek iOS-style swipe */\r\n    }\r\n    .cx-chip {\r\n      background: #f1f1f1;\r\n      border: 1px solid #e2e2e2;\r\n      color: #444;\r\n      font-size: 12px;\r\n      font-weight: 500;\r\n      padding: 8px 14px;\r\n      border-radius: 18px;\r\n      cursor: pointer;\r\n      transition: background 0.2s, border-color 0.2s, transform 0.1s;\r\n      display: inline-block;\r\n      flex-shrink: 0;\r\n    }\r\n    .cx-chip:hover {\r\n      background: #e8e8e8;\r\n      border-color: #d0d0d0;\r\n      transform: translateY(-1px);\r\n    }\r\n    .cx-chip:active {\r\n      transform: translateY(0);\r\n    }\r\n\r\n    /* Footer Input Area */\r\n    .cx-input-area {\r\n      padding: 12px 16px 16px;\r\n      background: white;\r\n      border-top: 1px solid var(--cx-border);\r\n      display: flex;\r\n      flex-direction: column;\r\n      gap: 8px;\r\n    }\r\n    .cx-input-box-wrapper {\r\n      display: flex;\r\n      align-items: flex-end;\r\n      gap: 10px;\r\n      background: #FAFAFA;\r\n      border: 1.5px solid var(--cx-border);\r\n      border-radius: 14px;\r\n      padding: 6px 12px 6px 14px;\r\n      transition: border-color 0.2s, box-shadow 0.2s;\r\n    }\r\n    .cx-input-box-wrapper:focus-within {\r\n      border-color: var(--cx-red);\r\n      box-shadow: 0 0 0 3px rgba(227, 30, 36, 0.08);\r\n      background: white;\r\n    }\r\n\r\n    /* Auto-growing Textarea */\r\n    .cx-textarea {\r\n      flex: 1;\r\n      border: none;\r\n      background: transparent;\r\n      outline: none;\r\n      resize: none;\r\n      font-family: inherit;\r\n      font-size: 13.5px;\r\n      line-height: 1.5;\r\n      color: var(--cx-text-primary);\r\n      max-height: 110px;\r\n      min-height: 24px;\r\n      height: 24px;\r\n      padding: 3px 0;\r\n    }\r\n    .cx-textarea::placeholder {\r\n      color: #aaa;\r\n    }\r\n\r\n    /* Send Button */\r\n    .cx-send-btn {\r\n      background: transparent;\r\n      border: none;\r\n      cursor: pointer;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      width: 34px;\r\n      height: 34px;\r\n      border-radius: 50%;\r\n      transition: background 0.2s, transform 0.1s;\r\n      color: #999;\r\n      flex-shrink: 0;\r\n    }\r\n    .cx-send-btn.active {\r\n      color: var(--cx-red);\r\n      background: rgba(227, 30, 36, 0.06);\r\n    }\r\n    .cx-send-btn.active:hover {\r\n      background: rgba(227, 30, 36, 0.1);\r\n      transform: scale(1.05);\r\n    }\r\n    .cx-send-btn svg {\r\n      width: 18px;\r\n      height: 18px;\r\n      fill: currentColor;\r\n    }\r\n\r\n    .cx-footer-note {\r\n      font-size: 10px;\r\n      color: rgba(0,0,0,0.5);\r\n      text-align: center;\r\n      line-height: 1.2;\r\n    }\r\n\r\n    /* ─── ENQUIRY FORM MODAL ─── */\r\n    .cx-modal {\r\n      position: fixed;\r\n      top: 0; left: 0; right: 0; bottom: 0;\r\n      background: rgba(0,0,0,0.5);\r\n      backdrop-filter: blur(4px);\r\n      z-index: 100000;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      opacity: 0;\r\n      pointer-events: none;\r\n      transition: opacity 0.3s ease;\r\n      padding: 16px;\r\n    }\r\n    .cx-modal.open {\r\n      opacity: 1;\r\n      pointer-events: all;\r\n    }\r\n    .cx-modal-card {\r\n      background: white;\r\n      border-radius: 20px;\r\n      width: 100%;\r\n      max-width: 420px;\r\n      box-shadow: 0 20px 50px rgba(0,0,0,0.3);\r\n      overflow: hidden;\r\n      transform: scale(0.9) translateY(20px);\r\n      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);\r\n    }\r\n    .cx-modal.open .cx-modal-card {\r\n      transform: scale(1) translateY(0);\r\n    }\r\n    .cx-modal-header {\r\n      background: var(--cx-dark);\r\n      padding: 20px 24px;\r\n      color: white;\r\n      position: relative;\r\n    }\r\n    .cx-modal-header h3 {\r\n      font-size: 16px;\r\n      font-weight: 700;\r\n      margin-bottom: 4px;\r\n    }\r\n    .cx-modal-header p {\r\n      color: rgba(255,255,255,0.6);\r\n      font-size: 12px;\r\n    }\r\n    .cx-modal-close {\r\n      position: absolute;\r\n      top: 20px;\r\n      right: 20px;\r\n      background: transparent;\r\n      border: none;\r\n      color: rgba(255,255,255,0.6);\r\n      cursor: pointer;\r\n      transition: color 0.2s;\r\n    }\r\n    .cx-modal-close:hover {\r\n      color: white;\r\n    }\r\n    .cx-modal-body {\r\n      padding: 24px;\r\n      display: flex;\r\n      flex-direction: column;\r\n      gap: 16px;\r\n    }\r\n    .cx-form-group {\r\n      display: flex;\r\n      flex-direction: column;\r\n      gap: 6px;\r\n    }\r\n    .cx-form-group label {\r\n      font-size: 12.5px;\r\n      font-weight: 600;\r\n      color: var(--cx-text-primary);\r\n    }\r\n    .cx-form-group input, .cx-form-group select {\r\n      padding: 10px 14px;\r\n      border: 1.5px solid var(--cx-border);\r\n      border-radius: 10px;\r\n      font-size: 13.5px;\r\n      font-family: inherit;\r\n      outline: none;\r\n      transition: border-color 0.2s;\r\n    }\r\n    .cx-form-group input:focus, .cx-form-group select:focus {\r\n      border-color: var(--cx-red);\r\n    }\r\n    .cx-form-submit {\r\n      background: var(--cx-red);\r\n      color: white;\r\n      border: none;\r\n      border-radius: 10px;\r\n      padding: 12px;\r\n      font-size: 14px;\r\n      font-weight: 600;\r\n      cursor: pointer;\r\n      transition: background 0.2s;\r\n      margin-top: 8px;\r\n    }\r\n    .cx-form-submit:hover {\r\n      background: var(--cx-red-hover);\r\n    }\r\n\r\n    /* Mock Error Banner inside panel */\r\n    .cx-error-banner {\r\n      background: #FEE2E2;\r\n      border: 1px solid #FCA5A5;\r\n      border-radius: 10px;\r\n      padding: 10px 14px;\r\n      font-size: 12px;\r\n      color: #991B1B;\r\n      margin-bottom: 8px;\r\n      align-self: center;\r\n      text-align: center;\r\n      max-width: 90%;\r\n      animation: cx-fade-slide 0.3s ease;\r\n    }\r\n\r\n    /* ── Animations ── */\r\n    @keyframes cx-bounce {\r\n      0%, 80%, 100% { transform: scale(0); }\r\n      40% { transform: scale(1.0); }\r\n    }\r\n    @keyframes cx-pulse {\r\n      0% { box-shadow: 0 0 0 0 rgba(39, 201, 63, 0.7); }\r\n      70% { box-shadow: 0 0 0 6px rgba(39, 201, 63, 0); }\r\n      100% { box-shadow: 0 0 0 0 rgba(39, 201, 63, 0); }\r\n    }\r\n    @keyframes cx-fade-slide {\r\n      from {\r\n        opacity: 0;\r\n        transform: translateY(8px);\r\n      }\r\n      to {\r\n        opacity: 1;\r\n        transform: translateY(0);\r\n      }\r\n    }\r\n\r\n    /* ── Responsive Adjustment ── */\r\n    @media (max-width: 640px) {\r\n      .cx-widget-container {\r\n        bottom: 16px;\r\n        right: 16px;\r\n      }\r\n      .cx-launcher-tooltip {\r\n        display: none; /* Hide tooltip on small mobile screens */\r\n      }\r\n      .cx-chat-panel {\r\n        position: fixed;\r\n        bottom: 0 !important;\r\n        right: 0 !important;\r\n        top: 0 !important;\r\n        left: 0 !important;\r\n        width: 100% !important;\r\n        height: 100% !important;\r\n        max-height: 100% !important;\r\n        border-radius: 0 !important;\r\n        z-index: 100000;\r\n      }\r\n      .cx-header {\r\n        padding: 14px 16px;\r\n      }\r\n      nav {\r\n        padding: 0 20px;\r\n      }\r\n      .hero {\r\n        padding: 60px 20px;\r\n      }\r\n      main {\r\n        padding: 40px 16px 80px;\r\n      }\r\n    }\n/* Rate-limit countdown banner (amber) */\n.cx-rate-banner {\n  background: #fffbeb !important;\n  border-color: #fcd34d !important;\n  color: #92400e !important;\n}\n.cx-rate-banner strong { color: #b45309; font-weight: 700; }\n";
  document.head.appendChild(style);

  // Inject HTML
  const root = document.createElement('div');
  root.innerHTML = "<!-- ─── COMPLETE INTERACTIVE CHAT WIDGET ─── -->\r\n<div class=\"cx-widget-container\" id=\"cxWidget\">\r\n  \r\n  <!-- Tooltip hint -->\r\n  <div class=\"cx-launcher-tooltip\" id=\"cxTooltip\">\r\n    <span class=\"cx-tooltip-dot\"></span>\r\n    Ask Caddxpert AI Advisor\r\n  </div>\r\n\r\n  <!-- Chat Panel -->\r\n  <div class=\"cx-chat-panel\" id=\"cxPanel\">\r\n    <!-- Header -->\r\n    <div class=\"cx-header\">\r\n      <div class=\"cx-header-info\">\r\n        <div class=\"cx-header-avatar\">CX</div>\r\n        <div class=\"cx-header-meta\">\r\n          <span class=\"cx-header-title\">Caddxpert AI Advisor</span>\r\n          <div class=\"cx-header-status\">\r\n            <span class=\"cx-status-dot\"></span>\r\n            <span>Online • Powered by Cad Point</span>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"cx-header-actions\">\r\n        <!-- Close / Minimize -->\r\n        <button id=\"cxCloseBtn\" title=\"Minimize Chat\">\r\n          <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n            <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\r\n            <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\r\n          </svg>\r\n        </button>\r\n      </div>";
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
