'use client';

import React from 'react';
import { InlineCitation } from './InlineCitation';

interface MarkdownContentProps {
  content: string;
}

// Regex matching statutory citations in bracketed or bolded forms
// Examples: [Patents Act, Sec 3(p)], [Section 3(p)], [Section 3(e)], [Section 3(d)], [Rule 158-B], [Rule 122-E], [1], [2]
const CITATION_REGEX = /(\[(?:Patents Act[^\]]*|Section 3\([pPedDa]\)|Section [367]|Rule 158-B|Rule 122-E|BDA[^\]]*|Form [A-Za-z0-9]+|\d+)\]|\b(?:Section 3\([pPeEdD]\)|Section [67]|Rule 158-B|Rule 122-E)\b)/gi;

interface ParsedTable {
  headers: string[];
  rows: string[][];
}

function parseMarkdownTable(lines: string[]): ParsedTable | null {
  const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 0 && l.includes('|'));
  if (cleanLines.length < 2) return null;

  // Find the separator row (e.g. |---|---| or |:---|---:|)
  const separatorIdx = cleanLines.findIndex(l => /^\|?\s*:?-{2,}:?\s*(\|?\s*:?-{2,}:?\s*)+\|?$/.test(l));
  if (separatorIdx === -1) return null;

  const splitRow = (rowStr: string): string[] => {
    let trimmed = rowStr.trim();
    if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
    if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
    return trimmed.split('|').map(c => c.trim());
  };

  const headerLine = cleanLines[0];
  const dataLines = cleanLines.slice(separatorIdx + 1);

  const headers = splitRow(headerLine);
  const rows = dataLines.map(splitRow).filter(r => r.length > 0 && r.some(c => c.length > 0));

  if (headers.length === 0) return null;
  return { headers, rows };
}

type Block =
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'header'; level: number; text: string }
  | { type: 'hr' }
  | { type: 'blockquote'; text: string }
  | { type: 'code'; code: string; lang?: string }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'paragraph'; lines: string[] };

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  // Normalize line breaks
  const normalized = (content || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Handle edge case where table rows were glued without newlines e.g. | col ||---|
    .replace(/\|\s*\|\s*(?=:?-{2,}:?)/g, '|\n|');

  const rawLines = normalized.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Skip empty lines between blocks
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Code blocks (```...```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
        codeLines.push(rawLines[i]);
        i++;
      }
      if (i < rawLines.length && rawLines[i].trim().startsWith('```')) {
        i++;
      }
      blocks.push({ type: 'code', code: codeLines.join('\n'), lang });
      continue;
    }

    // 2. Horizontal rules (--- or ***)
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 3. Markdown Tables (starts/contains '|' and lookahead finds separator row)
    if (trimmed.includes('|')) {
      let isTable = false;
      let sepIndex = -1;

      for (let look = i; look < Math.min(i + 3, rawLines.length); look++) {
        const lookTrimmed = rawLines[look].trim();
        if (/^\|?\s*:?-{2,}:?\s*(\|?\s*:?-{2,}:?\s*)+\|?$/.test(lookTrimmed)) {
          isTable = true;
          sepIndex = look;
          break;
        }
      }

      if (isTable && sepIndex > i) {
        const tableLines: string[] = [];
        while (i < rawLines.length && rawLines[i].trim().includes('|')) {
          tableLines.push(rawLines[i].trim());
          i++;
        }
        const parsed = parseMarkdownTable(tableLines);
        if (parsed) {
          blocks.push({ type: 'table', headers: parsed.headers, rows: parsed.rows });
          continue;
        }
      }
    }

    // 4. Headings (# Header)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        blocks.push({ type: 'header', level: match[1].length, text: match[2] });
        i++;
        continue;
      }
    }

    // 5. Blockquotes (> Quote)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('>')) {
        quoteLines.push(rawLines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    // 6. Unordered lists (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < rawLines.length && /^[-*]\s+/.test(rawLines[i].trim())) {
        items.push(rawLines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items, ordered: false });
      continue;
    }

    // 7. Ordered lists (1. or 2.) or standalone numbered section headers
    if (/^\d+\.\s+/.test(trimmed)) {
      // Check if this is a standalone section heading like:
      // "1. Patentability under the Patents Act, 1970"
      const isNextLineNumbered = i + 1 < rawLines.length && /^\d+\.\s+/.test(rawLines[i + 1].trim());
      const isShortHeading = trimmed.length < 90 && !trimmed.endsWith('.');

      if (!isNextLineNumbered && isShortHeading) {
        blocks.push({ type: 'header', level: 3, text: trimmed });
        i++;
        continue;
      }

      const items: string[] = [];
      while (i < rawLines.length && /^\d+\.\s+/.test(rawLines[i].trim())) {
        items.push(rawLines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items, ordered: true });
      continue;
    }

    // 8. General Paragraphs (gather contiguous non-block lines)
    const paraLines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() &&
      !rawLines[i].trim().startsWith('```') &&
      !rawLines[i].trim().startsWith('#') &&
      !/^(?:-{3,}|\*{3,}|_{3,})$/.test(rawLines[i].trim()) &&
      !rawLines[i].trim().startsWith('>') &&
      !/^[-*]\s+/.test(rawLines[i].trim()) &&
      !/^\d+\.\s+/.test(rawLines[i].trim()) &&
      !(rawLines[i].trim().includes('|') && i + 1 < rawLines.length && /^\|?\s*:?-{2,}:?\s*(\|?\s*:?-{2,}:?\s*)+\|?$/.test(rawLines[i + 1].trim()))
    ) {
      paraLines.push(rawLines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', lines: paraLines });
    }
  }

  // Parse inline text: bold, italics, code, citations, links
  const parseInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return null;

    // 1. Split on statutory citations first
    const citationParts = text.split(CITATION_REGEX);

    return citationParts.map((part, pIdx) => {
      if (!part) return null;

      // Check citation match
      if (
        part.match(/Section 3\([pPeEdDa]\)/i) || 
        part.match(/\[Patents Act/i) ||
        part.match(/Rule 158-B/i) ||
        part.match(/Rule 122-E/i) ||
        part.match(/\[Section/i) ||
        part.match(/\[Rule/i) ||
        part.match(/\[Form/i) ||
        part.match(/^\[\d+\]$/)
      ) {
        return <InlineCitation key={`cit-${pIdx}`} rawMatch={part} matchedText={part} />;
      }

      // 2. Parse inline code: `code`
      if (part.includes('`')) {
        const codeParts = part.split(/(`[^`]+`)/g);
        return codeParts.map((cSub, cIdx) => {
          if (cSub.startsWith('`') && cSub.endsWith('`')) {
            return (
              <code key={`code-${pIdx}-${cIdx}`} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-[11px] border border-slate-200">
                {cSub.slice(1, -1)}
              </code>
            );
          }
          return parseTextStyling(cSub, `${pIdx}-${cIdx}`);
        });
      }

      return parseTextStyling(part, `${pIdx}`);
    });
  };

  const parseTextStyling = (text: string, keyPrefix: string): React.ReactNode => {
    if (!text) return null;

    // Handle [!NOTE] or [!WARNING] tags
    if (text.includes('[!NOTE]') || text.includes('[!WARNING]') || text.includes('[!CAUTION]')) {
      const clean = text
        .replace(/\[!NOTE\]/g, '⚠️ NOTE: ')
        .replace(/\[!WARNING\]/g, '⚠️ WARNING: ')
        .replace(/\[!CAUTION\]/g, '⚠️ CAUTION: ');
      return parseTextStyling(clean, `${keyPrefix}-alert`);
    }

    // Handle bold: **text**
    if (text.includes('**')) {
      const boldParts = text.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((bSub, bIdx) => {
        if (bSub.startsWith('**') && bSub.endsWith('**')) {
          return (
            <strong key={`b-${keyPrefix}-${bIdx}`} className="font-bold text-slate-900">
              {bSub.slice(2, -2)}
            </strong>
          );
        }
        return parseItalics(bSub, `${keyPrefix}-${bIdx}`);
      });
    }

    return parseItalics(text, keyPrefix);
  };

  const parseItalics = (text: string, keyPrefix: string): React.ReactNode => {
    if (!text) return null;

    if (text.includes('*') && !text.includes('**')) {
      const italicParts = text.split(/(\*[^*]+\*)/g);
      return italicParts.map((iSub, iIdx) => {
        if (iSub.startsWith('*') && iSub.endsWith('*')) {
          return (
            <em key={`i-${keyPrefix}-${iIdx}`} className="italic text-slate-700">
              {iSub.slice(1, -1)}
            </em>
          );
        }
        return iSub;
      });
    }

    return text;
  };

  return (
    <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'table':
            return (
              <div key={idx} className="my-3 overflow-x-auto rounded border border-slate-300 shadow-2xs bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-[#002147] text-white">
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] border-b border-slate-300 whitespace-nowrap"
                        >
                          {parseInlineFormatting(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-blue-50/40 transition-colors odd:bg-white even:bg-slate-50/70"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-3.5 py-2.5 text-slate-800 align-top leading-relaxed border-r border-slate-100 last:border-r-0"
                          >
                            {parseInlineFormatting(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'header':
            if (block.level === 1 || block.level === 2) {
              return (
                <h3
                  key={idx}
                  className="text-base sm:text-lg font-black text-[#002147] pt-2 pb-1 border-b border-slate-200"
                >
                  {parseInlineFormatting(block.text)}
                </h3>
              );
            }
            if (block.level === 3) {
              return (
                <h4
                  key={idx}
                  className="text-sm sm:text-base font-bold text-[#002147] pt-2 pb-0.5"
                >
                  {parseInlineFormatting(block.text)}
                </h4>
              );
            }
            return (
              <h5
                key={idx}
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#002147] pt-1"
              >
                {parseInlineFormatting(block.text)}
              </h5>
            );

          case 'hr':
            return <hr key={idx} className="my-3 border-t border-slate-200" />;

          case 'blockquote': {
            const isErrorOrNote = 
              block.text.includes('[!NOTE]') || 
              block.text.includes('[!WARNING]') || 
              block.text.includes('[!CAUTION]') ||
              block.text.toLowerCase().includes('strictly limited to ayurveda') ||
              block.text.toLowerCase().includes('not solve general') ||
              block.text.toLowerCase().includes('error');

            const isSuccess =
              block.text.includes('[!TIP]') ||
              block.text.toLowerCase().includes('successfully') ||
              block.text.toLowerCase().includes('cleared') ||
              block.text.toLowerCase().includes('approved');

            if (isErrorOrNote) {
              return (
                <div
                  key={idx}
                  className="my-3 border-l-4 border-red-400 bg-red-50/40 border border-l-4 border-red-100/60 px-4 py-3 text-xs sm:text-sm text-red-900 rounded-r-2xl leading-relaxed shadow-2xs"
                >
                  {parseInlineFormatting(block.text)}
                </div>
              );
            }

            if (isSuccess) {
              return (
                <div
                  key={idx}
                  className="my-3 border-l-4 border-emerald-400 bg-emerald-50/40 border border-l-4 border-emerald-100/60 px-4 py-3 text-xs sm:text-sm text-emerald-900 rounded-r-2xl leading-relaxed shadow-2xs"
                >
                  {parseInlineFormatting(block.text)}
                </div>
              );
            }

            return (
              <blockquote
                key={idx}
                className="my-3 border-l-4 border-slate-400 bg-slate-50 border border-slate-200/80 px-4 py-3 text-xs sm:text-sm text-slate-800 italic rounded-r-2xl leading-relaxed shadow-2xs"
              >
                {parseInlineFormatting(block.text)}
              </blockquote>
            );
          }

          case 'code':
            return (
              <pre
                key={idx}
                className="my-2.5 p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto leading-relaxed"
              >
                <code>{block.code}</code>
              </pre>
            );

          case 'list':
            if (block.ordered) {
              return (
                <ol key={idx} className="space-y-1.5 my-2 pl-2">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <span className="text-[#002147] font-bold font-mono text-xs select-none">
                        {itemIdx + 1}.
                      </span>
                      <div className="flex-1 leading-relaxed">
                        {parseInlineFormatting(item)}
                      </div>
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={idx} className="space-y-1.5 my-2 pl-2">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="text-blue-700 font-bold select-none">&bull;</span>
                    <div className="flex-1 leading-relaxed">
                      {parseInlineFormatting(item)}
                    </div>
                  </li>
                ))}
              </ul>
            );

          case 'paragraph': {
            const combinedText = block.lines.join(' ');
            const isNoteOrRefusal = 
              combinedText.includes('[!NOTE]') || 
              combinedText.includes('[!WARNING]') || 
              combinedText.includes('[!CAUTION]') ||
              combinedText.toLowerCase().includes('strictly limited to ayurveda') ||
              combinedText.toLowerCase().includes('not solve general') ||
              combinedText.toLowerCase().includes('connectivity notice');

            if (isNoteOrRefusal) {
              return (
                <div
                  key={idx}
                  className="my-3 border-l-4 border-red-400 bg-red-50/40 border border-l-4 border-red-100/60 px-4 py-3 text-xs sm:text-sm text-red-900 rounded-r-2xl leading-relaxed shadow-2xs"
                >
                  {block.lines.map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {parseInlineFormatting(line)}
                      {lIdx < block.lines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              );
            }

            return (
              <p key={idx} className="leading-relaxed">
                {block.lines.map((line, lIdx) => (
                  <React.Fragment key={lIdx}>
                    {parseInlineFormatting(line)}
                    {lIdx < block.lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
