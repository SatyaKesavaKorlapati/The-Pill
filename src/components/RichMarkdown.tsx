import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface RichMarkdownProps {
  content: string;
  accentHex?: string;
  isLightSurface?: boolean;
}

function renderInlineSegments(
  text: string,
  accentHex: string,
  isLightSurface: boolean
): React.ReactNode[] {
  // Tokenize inline code, links, bold, and italics safely without dangerouslySetInnerHTML
  const pattern =
    /(`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
            isLightSurface
              ? 'bg-stone-900/10 text-stone-900 border border-stone-900/15'
              : 'bg-white/10 text-sky-200 border border-white/10'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          style={{ color: isLightSurface ? '#9a3412' : accentHex }}
          className="inline-flex items-center gap-0.5 underline underline-offset-2 font-medium hover:opacity-85"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
        </a>
      );
    }

    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      return (
        <strong
          key={idx}
          className={`font-semibold ${isLightSurface ? 'text-stone-950' : 'text-white'}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic opacity-95">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

const CodeFenceBlock: React.FC<{
  lang: string;
  code: string;
  isLightSurface: boolean;
}> = ({ lang, code, isLightSurface }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`my-1.5 rounded-xl overflow-hidden border select-text ${
        isLightSurface
          ? 'bg-stone-900 text-stone-100 border-stone-900/20'
          : 'bg-[#05070c] text-slate-100 border-white/12'
      }`}
    >
      <div className="flex items-center justify-between px-2.5 py-1 bg-white/[0.06] border-b border-white/10 text-[10px] font-mono text-slate-300">
        <span>{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/12 text-slate-200 transition-colors cursor-pointer select-none"
        >
          {copied ? (
            <>
              <Check className="w-2.5 h-2.5 text-emerald-300" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-2.5 h-2.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-2.5 text-[11px] font-mono leading-relaxed overflow-x-auto pill-scroll select-text cursor-text">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * Clean, ChatGPT/Gemini-grade Markdown renderer with full text highlighting (`select-text`),
 * bold/italic/inline-code formatting, fenced code blocks with Copy button, lists, tables, and links.
 */
export const RichMarkdown: React.FC<RichMarkdownProps> = ({
  content,
  accentHex = '#38bdf8',
  isLightSurface = false,
}) => {
  const blocks: React.ReactNode[] = [];
  const fenceRegex = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockKey = 0;

  const pushProseSegment = (segment: string) => {
    const lines = segment.replace(/\r\n/g, '\n').split('\n');
    let i = 0;

    while (i < lines.length) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Markdown Table
      if (
        trimmed.startsWith('|') &&
        i + 1 < lines.length &&
        /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])
      ) {
        const parseRow = (r: string) =>
          r
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => c.trim());
        const headers = parseRow(lines[i]);
        i += 2;
        const rows: string[][] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          rows.push(parseRow(lines[i]));
          i++;
        }
        blocks.push(
          <div key={`tbl-${blockKey++}`} className="my-1.5 overflow-x-auto pill-scroll">
            <table
              className={`w-full text-[11px] border-collapse rounded-lg overflow-hidden ${
                isLightSurface ? 'border border-stone-900/15' : 'border border-white/12'
              }`}
            >
              <thead>
                <tr className={isLightSurface ? 'bg-stone-900/10' : 'bg-white/[0.07]'}>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-2 py-1 text-left font-semibold">
                      {renderInlineSegments(h, accentHex, isLightSurface)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={
                      isLightSurface ? 'border-t border-stone-900/10' : 'border-t border-white/8'
                    }
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1">
                        {renderInlineSegments(cell, accentHex, isLightSurface)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Headings
      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const sizeCls =
          level === 1
            ? 'text-sm font-bold mt-1.5 mb-0.5'
            : level === 2
              ? 'text-[13px] font-bold mt-1.5 mb-0.5'
              : 'text-xs font-semibold mt-1 mb-0.5';
        blocks.push(
          <div
            key={`h-${blockKey++}`}
            className={`${sizeCls} ${isLightSurface ? 'text-stone-950' : 'text-white'}`}
          >
            {renderInlineSegments(headingMatch[2], accentHex, isLightSurface)}
          </div>
        );
        i++;
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('> ')) {
          quoteLines.push(lines[i].trim().slice(2));
          i++;
        }
        blocks.push(
          <blockquote
            key={`q-${blockKey++}`}
            style={{ borderLeftColor: accentHex }}
            className={`my-1 pl-2.5 border-l-2 italic text-[11.5px] ${
              isLightSurface ? 'text-stone-700' : 'text-slate-300'
            }`}
          >
            {renderInlineSegments(quoteLines.join(' '), accentHex, isLightSurface)}
          </blockquote>
        );
        continue;
      }

      // Unordered List
      if (/^[-*•]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
          i++;
        }
        blocks.push(
          <ul key={`ul-${blockKey++}`} className="my-1 pl-4 list-disc space-y-0.5">
            {items.map((it, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineSegments(it, accentHex, isLightSurface)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered List
      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        blocks.push(
          <ol key={`ol-${blockKey++}`} className="my-1 pl-4 list-decimal space-y-0.5">
            {items.map((it, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineSegments(it, accentHex, isLightSurface)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Standard paragraph
      blocks.push(
        <p key={`p-${blockKey++}`} className="leading-relaxed my-0.5 break-words">
          {renderInlineSegments(trimmed, accentHex, isLightSurface)}
        </p>
      );
      i++;
    }
  };

  while ((match = fenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      pushProseSegment(content.slice(lastIndex, match.index));
    }
    blocks.push(
      <CodeFenceBlock
        key={`code-${blockKey++}`}
        lang={match[1] ?? ''}
        code={(match[2] ?? '').replace(/\n$/, '')}
        isLightSurface={isLightSurface}
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    pushProseSegment(content.slice(lastIndex));
  }

  return (
    <div className="select-text cursor-text space-y-1 text-xs leading-relaxed">
      {blocks}
    </div>
  );
};
