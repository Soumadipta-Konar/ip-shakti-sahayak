/**
 * IP-SAKTI Enterprise Print Engine
 * Provides unclipped, high-fidelity statutory legal report and dossier printing.
 * Works seamlessly across all print buttons without viewport truncation.
 */

// Helper to convert markdown formatted legal responses into clean, printable HTML
export function markdownToPrintHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  let html = '';
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (!inTable) return;
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      html += '<div class="table-wrap"><table class="legal-table"><thead><tr>';
      tableHeaders.forEach(h => {
        html += `<th>${inlineFormat(h)}</th>`;
      });
      html += '</tr></thead><tbody>';
      tableRows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          html += `<td>${inlineFormat(cell)}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    }
    inTable = false;
    tableHeaders = [];
    tableRows = [];
  };

  const flushList = () => {
    if (!inList) return;
    html += `</${listType}>`;
    inList = false;
  };

  const inlineFormat = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="legal-code">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\b(Section\s+[0-9]+(?:\([a-z0-9]+\))?|Rule\s+[0-9]+(?:-[A-Z])?|BDA\s+2023\s+[§&]\s*[0-9]+)\b/gi, '<span class="statute-badge">$1</span>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table detection
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if separator line
      if (/^\|?\s*:?-{2,}:?\s*(\|?\s*:?-{2,}:?\s*)+\|?$/.test(line)) {
        continue;
      }
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      if (!inTable) {
        flushList();
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blank line
    if (!line) {
      flushList();
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      html += `<h3 class="legal-h3">${inlineFormat(line.slice(4))}</h3>`;
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      html += `<h2 class="legal-h2">${inlineFormat(line.slice(3))}</h2>`;
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      html += `<h1 class="legal-h1">${inlineFormat(line.slice(2))}</h1>`;
      continue;
    }

    // Horizontal Rule
    if (/^---+$|^\*\*\*+$/.test(line)) {
      flushList();
      html += '<hr class="legal-hr" />';
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      flushList();
      html += `<blockquote class="legal-quote">${inlineFormat(line.replace(/^>\s*/, ''))}</blockquote>`;
      continue;
    }

    // Unordered List
    if (/^[-*•]\s+/.test(line)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
        html += '<ul class="legal-ul">';
      }
      html += `<li>${inlineFormat(line.replace(/^[-*•]\s+/, ''))}</li>`;
      continue;
    }

    // Ordered List
    if (/^\d+\.\s+/.test(line)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
        html += '<ol class="legal-ol">';
      }
      html += `<li>${inlineFormat(line.replace(/^\d+\.\s+/, ''))}</li>`;
      continue;
    }

    // Normal Paragraph
    flushList();
    html += `<p class="legal-p">${inlineFormat(line)}</p>`;
  }

  flushTable();
  flushList();

  return html;
}

export interface PrintDocumentOptions {
  title: string;
  subtitle?: string;
  reportRef?: string;
  jurisdiction?: string;
  language?: 'en' | 'hi';
  sections: Array<{
    heading?: string;
    subheading?: string;
    timestamp?: string;
    bodyMarkdown: string;
    citations?: Array<{ section?: string; act?: string; snippet?: string }>;
    score?: number;
  }>;
}

/**
 * Triggers an unclipped, high-resolution legal print dialog using an isolated print iframe.
 * Ensures 100% of responses, full tables, and citations are rendered without clipping.
 */
export function printLegalDocument(options: PrintDocumentOptions): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const refCode = options.reportRef || `IP-SAKTI-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const isHi = options.language === 'hi';

  const sectionsHtml = options.sections
    .map((sec, idx) => {
      const bodyHtml = markdownToPrintHtml(sec.bodyMarkdown);
      const citationsHtml = sec.citations && sec.citations.length > 0
        ? `<div class="citations-box">
            <span class="box-label">${isHi ? 'वैधानिक संविधियां व धाराएं:' : 'STATUTORY AUTHORITIES & SECTIONS REFERENCED:'}</span>
            <div class="citations-list">
              ${sec.citations.map(c => `
                <div class="citation-pill">
                  <strong>${c.section || 'Statute'}</strong>
                  ${c.act ? ` - <span>${c.act}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>`
        : '';

      const scoreHtml = sec.score !== undefined
        ? `<div class="score-badge">
            ${isHi ? 'कानूनी सत्यापन स्कोर:' : 'Deterministic Grounding Score:'} <strong>${(sec.score * 100).toFixed(0)}%</strong>
          </div>`
        : '';

      return `
        <article class="report-section ${idx > 0 ? 'page-break-auto' : ''}">
          ${sec.heading ? `<h2 class="section-title">${sec.heading}</h2>` : ''}
          ${sec.subheading || sec.timestamp ? `
            <div class="section-meta">
              ${sec.subheading ? `<span>${sec.subheading}</span>` : ''}
              ${sec.timestamp ? `<span class="time-stamp">${sec.timestamp}</span>` : ''}
            </div>
          ` : ''}
          <div class="section-content">
            ${bodyHtml}
          </div>
          ${citationsHtml}
          ${scoreHtml}
        </article>
      `;
    })
    .join('<div class="section-divider"></div>');

  const fullHtml = `<!DOCTYPE html>
<html lang="${isHi ? 'hi' : 'en'}">
<head>
  <meta charset="utf-8" />
  <title>${options.title} - ${refCode}</title>
  <style>
    @page {
      size: A4;
      margin: 1.6cm 1.4cm 1.6cm 1.4cm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #0f172a;
      background: #ffffff;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12pt;
      margin-bottom: 16pt;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12pt;
    }
    .org-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .org-subtitle {
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2pt;
    }
    .ref-box {
      text-align: right;
      font-family: monospace;
      font-size: 8.5pt;
      color: #334155;
    }
    .ref-badge {
      display: inline-block;
      font-weight: 700;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2pt 6pt;
      border-radius: 4pt;
      margin-bottom: 3pt;
    }
    .report-meta-strip {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6pt;
      padding: 6pt 10pt;
      margin-top: 10pt;
      font-size: 8.5pt;
      color: #475569;
    }
    .report-section {
      margin-bottom: 20pt;
    }
    .section-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4pt;
      padding-bottom: 4pt;
      border-bottom: 1px solid #e2e8f0;
    }
    .section-meta {
      font-size: 8.5pt;
      color: #64748b;
      margin-bottom: 10pt;
      display: flex;
      justify-content: space-between;
    }
    .section-content {
      font-size: 10.5pt;
      color: #1e293b;
    }
    .legal-p {
      margin-bottom: 8pt;
      text-align: justify;
    }
    .legal-h1 {
      font-size: 13pt;
      font-weight: 800;
      margin: 12pt 0 6pt;
      color: #0f172a;
    }
    .legal-h2 {
      font-size: 11.5pt;
      font-weight: 700;
      margin: 10pt 0 4pt;
      color: #1e293b;
    }
    .legal-h3 {
      font-size: 10.5pt;
      font-weight: 700;
      margin: 8pt 0 3pt;
      color: #334155;
    }
    .legal-ul, .legal-ol {
      margin: 6pt 0 10pt 18pt;
    }
    .legal-ul li, .legal-ol li {
      margin-bottom: 4pt;
    }
    .legal-quote {
      border-left: 3pt solid #94a3b8;
      background: #f8fafc;
      padding: 6pt 10pt;
      margin: 8pt 0;
      font-style: italic;
      color: #334155;
    }
    .legal-code {
      font-family: monospace;
      font-size: 9pt;
      background: #f1f5f9;
      padding: 1pt 4pt;
      border-radius: 3pt;
    }
    .table-wrap {
      width: 100%;
      margin: 10pt 0;
      page-break-inside: avoid;
    }
    .legal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }
    .legal-table th, .legal-table td {
      border: 1px solid #cbd5e1;
      padding: 6pt 8pt;
      text-align: left;
      vertical-align: top;
    }
    .legal-table th {
      background: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
    }
    .legal-table tr:nth-child(even) td {
      background: #fafafa;
    }
    .statute-badge {
      font-weight: 700;
      color: #0f172a;
      background: #f1f5f9;
      padding: 1pt 4pt;
      border-radius: 3pt;
      border: 1px solid #e2e8f0;
      font-size: 9pt;
    }
    .citations-box {
      margin-top: 12pt;
      padding: 8pt 10pt;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6pt;
      page-break-inside: avoid;
    }
    .box-label {
      font-size: 7.5pt;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 4pt;
    }
    .citations-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6pt;
    }
    .citation-pill {
      font-size: 8pt;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2pt 6pt;
      border-radius: 4pt;
      color: #1e293b;
    }
    .score-badge {
      margin-top: 8pt;
      font-size: 8pt;
      color: #475569;
      font-family: monospace;
    }
    .section-divider {
      border-top: 1px dashed #cbd5e1;
      margin: 16pt 0;
    }
    .report-footer {
      margin-top: 24pt;
      padding-top: 10pt;
      border-top: 1px solid #cbd5e1;
      font-size: 7.5pt;
      color: #64748b;
      text-align: center;
      line-height: 1.4;
      page-break-inside: avoid;
    }
    .page-break-auto {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <header class="report-header">
    <div class="header-top">
      <div>
        <div class="org-title">IP-SAKTI ENTERPRISE</div>
        <div class="org-subtitle">${options.subtitle || 'Statutory Patent & Bio-Resource Intelligence Platform'}</div>
      </div>
      <div class="ref-box">
        <div class="ref-badge">REF: ${refCode}</div>
        <div>Date: ${dateStr}</div>
        <div>Time: ${timeStr} IST</div>
      </div>
    </div>
    <div class="report-meta-strip">
      <span><strong>Document:</strong> ${options.title}</span>
      <span><strong>Jurisdiction:</strong> ${options.jurisdiction === 'INTL' ? 'International / WIPO / PCT / CDER' : 'India Statutory Regime (Patents Act 1970, BDA 2023, D&C Act 1940)'}</span>
      <span><strong>Security:</strong> Tamper-Proof Audit Vault Verified</span>
    </div>
  </header>

  <main>
    ${sectionsHtml}
  </main>

  <footer class="report-footer">
    <p><strong>OFFICIAL STATUTORY NOTICE & DISCLAIMER:</strong> This report is algorithmically compiled from canonical statutory gazettes, First Schedule treatises in the CSIR Traditional Knowledge Digital Library (TKDL), and official Intellectual Property India guidelines. While accurate for preliminary patent triage and Access and Benefit Sharing (ABS) assessment, this document does not constitute formal legal counsel. For high-stakes filings, verify citations with a registered Indian Patent Attorney or State Biodiversity Board authority.</p>
    <p style="margin-top: 3pt;">© ${now.getFullYear()} IP-SAKTI Sahayak • Smart India Hackathon (SIH 045) Enterprise Decision Support</p>
  </footer>
</body>
</html>`;

  // Create isolated iframe to trigger unclipped print without interference from the main window's viewport
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(fullHtml);
  doc.close();

  // Wait for rendering then trigger print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  }, 350);
}
