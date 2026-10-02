import React from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "", block = false }) => {
  if (!content) return null;

  // If the whole content is intended as a block LaTeX equation (starts with $$ or has block flag)
  if (block) {
    const cleanFormula = content.replace(/^\$\$|\$\$$/g, "").trim();
    try {
      const html = katex.renderToString(cleanFormula, {
        displayMode: true,
        throwOnError: false,
      });
      return (
        <div
          className={`katex-block overflow-x-auto py-1.5 my-1 text-slate-100 ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <pre className="font-mono text-sm text-sky-400 bg-sky-950/20 p-2 rounded">{cleanFormula}</pre>;
    }
  }

  // Parse inline and display math from mixed text:
  // Split on $$...$$ and $...$
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
  const parts = content.split(regex);

  return (
    <span className={`inline-math-container leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="block my-2 overflow-x-auto text-slate-100"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code key={index} className="block my-1 font-mono text-xs text-sky-400 bg-black/40 px-2 py-1 rounded">
                {formula}
              </code>
            );
          }
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="inline-block mx-0.5 text-slate-100 align-baseline"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code key={index} className="font-mono text-xs text-sky-400 bg-black/40 px-1 py-0.5 rounded">
                {formula}
              </code>
            );
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
