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
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);

  // Inject HTML
  const root = document.createElement('div');
  root.innerHTML = ${JSON.stringify(widgetHtml)};
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
