const fs = require('fs');
const html = fs.readFileSync('public/caddxpert_ai_assistant_widget_demo.html', 'utf8');

const cssStart = html.indexOf('/* ─── CHAT WIDGET STYLES ─── */');
const cssEnd = html.indexOf('</style>', cssStart);
let css = html.substring(cssStart, cssEnd);

css = `:root {
  --cx-red: #E31E24;
  --cx-red-hover: #c41318;
  --cx-dark: #1C1C1C;
  --cx-dark-light: #2e2e2e;
  --cx-gray-bg: #f7f7f7;
  --cx-border: #e8e8e8;
  --cx-text-primary: #1C1C1C;
  --cx-text-secondary: #666666;
}\n` + css + `
/* Rate-limit countdown banner (amber) */
.cx-rate-banner {
  background: #fffbeb !important;
  border-color: #fcd34d !important;
  color: #92400e !important;
}
.cx-rate-banner strong { color: #b45309; font-weight: 700; }
`;

const htmlStart = html.indexOf('<!-- ─── COMPLETE INTERACTIVE CHAT WIDGET ─── -->');
const htmlEnd = html.indexOf('<!-- ─── ENQUIRY FORM MODAL (SMART CTA INTEGRATION) ─── -->', htmlStart);
const widgetHtml = html.substring(htmlStart, htmlEnd).trim();

const jsContent = fs.readFileSync('scripts/generate-widget.cjs', 'utf8');
const newJsContent = jsContent
  .replace(/root\.innerHTML = .*?;/s, 'root.innerHTML = ' + JSON.stringify(widgetHtml) + ';')
  .replace(/style\.textContent = .*?;/s, 'style.textContent = ' + JSON.stringify(css) + ';');

fs.writeFileSync('public/widget.js', newJsContent);
console.log('Fixed truncation!');
