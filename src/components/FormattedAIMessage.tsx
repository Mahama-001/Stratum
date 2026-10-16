'use client';

import React from 'react';

interface FormattedAIMessageProps {
  content?: string | null;
  themeColor?: string;
  className?: string;
}

/**
 * Cleanly formats AI responses into structured, elegant React elements.
 * Completely eliminates raw markdown artifacts like `**`, `###`, `__`, or stray asterisks.
 */
export default function FormattedAIMessage({
  content,
  themeColor = '#50d8e9',
  className = ''
}: FormattedAIMessageProps) {
  if (!content) return null;

  // Clean raw content: ensure any dangling open ** from streaming is closed so it doesn't show raw syntax
  let sanitized = content;
  const count = (sanitized.match(/\*\*/g) || []).length;
  if (count % 2 === 1) {
    sanitized += '**';
  }

  const lines = sanitized.split('\n');

  return (
    <div className={`space-y-1.5 text-[11px] leading-relaxed break-words ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // 1. Heading 1-4
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headingText = trimmed.replace(/^#{1,4}\s+/, '');
          return (
            <div
              key={idx}
              className="text-[12px] font-bold text-[#1d1d1f] pt-1.5 pb-0.5 border-b border-black/[0.08] flex items-center gap-1.5 font-sans"
              style={{ color: themeColor }}
            >
              {renderInlineSpans(headingText, themeColor)}
            </div>
          );
        }

        // 2. Full-line section titles like "**Title:**" or "**Title**"
        if (
          (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) ||
          (trimmed.startsWith('**') && trimmed.endsWith(':**') && !trimmed.slice(2, -3).includes('**'))
        ) {
          const rawTitle = trimmed.endsWith(':**') ? trimmed.slice(2, -3) + ':' : trimmed.slice(2, -2);
          return (
            <div key={idx} className="font-bold text-[#1d1d1f] pt-1 text-[11.5px]">
              {rawTitle}
            </div>
          );
        }

        // 3. Bullet list items (- , * , • , 1. )
        const bulletMatch = trimmed.match(/^([-*•]|\d+\.)\s+(.+)$/);
        if (bulletMatch) {
          const bulletSymbol = bulletMatch[1];
          const bulletContent = bulletMatch[2];
          const isNumber = /^\d+\./.test(bulletSymbol);

          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 text-[#3a3a3c]">
              <span
                className={`shrink-0 font-mono-data text-[10px] ${
                  isNumber ? 'font-bold' : 'mt-1 w-1.5 h-1.5 rounded-full'
                }`}
                style={
                  isNumber
                    ? { color: themeColor }
                    : { backgroundColor: themeColor }
                }
              >
                {isNumber ? bulletSymbol : ''}
              </span>
              <div className="flex-1">
                {renderInlineSpans(bulletContent, themeColor)}
              </div>
            </div>
          );
        }

        // 4. Standard Paragraph
        return (
          <div key={idx} className="text-[#3a3a3c]">
            {renderInlineSpans(trimmed, themeColor)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Parses inline tokens:
 * - Code: `code`
 * - Bold Italic: ***text***
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Guarantees ZERO stray raw `**` or `__` in plain text
 */
function renderInlineSpans(text: string, themeColor: string): React.ReactNode[] {
  if (!text) return [];

  // Ensure balanced asterisks in line fragment
  let lineText = text;
  const count = (lineText.match(/\*\*/g) || []).length;
  if (count % 2 === 1) {
    lineText += '**';
  }

  // Split on code, bold-italic, and bold
  const tokenRegex = /(`[^`]+`|\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|__[\s\S]+?__)/g;
  const parts = lineText.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Inline Code
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-black/[0.04] border border-black/[0.08] text-[10px] font-mono-data text-[#1d1d1f]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold + Italic (***text***)
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
      return (
        <strong key={i} className="font-bold text-[#1d1d1f] italic">
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold (**text** or __text__)
    if (
      ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) &&
      part.length > 4
    ) {
      const boldInner = part.slice(2, -2);
      // Clean any accidental asterisks inside bold
      const cleaned = boldInner.replace(/\*\*/g, '');
      return (
        <strong key={i} className="font-bold text-[#1d1d1f]">
          {cleaned}
        </strong>
      );
    }

    // Normal text segment: parse single *italics* and strip any remaining accidental **
    const italicParts = part.split(/(\*[^*\n]+?\*|_[^_\n]+?_)/g);
    if (italicParts.length > 1) {
      return (
        <React.Fragment key={i}>
          {italicParts.map((sub, j) => {
            if ((sub.startsWith('*') && sub.endsWith('*')) || (sub.startsWith('_') && sub.endsWith('_'))) {
              return (
                <em key={j} className="italic text-[#6e6e73]">
                  {sub.slice(1, -1).replace(/\*\*/g, '')}
                </em>
              );
            }
            // Strip any raw ** syntax
            return sub.replace(/\*\*/g, '');
          })}
        </React.Fragment>
      );
    }

    // Strip any raw ** syntax that might have slipped through
    const safeText = part.replace(/\*\*/g, '');
    return <React.Fragment key={i}>{safeText}</React.Fragment>;
  });
}
