import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import { vmTokens } from '@/styles/themeStyles';

/**
 * Chrome shared by the Jesus event's four tab bodies.
 *
 * Lives apart from `JesusTabBodies` so the Study tab — which is big enough to
 * warrant its own file — can use the same toolbar and empty state without the
 * two files importing each other.
 */

const FONT = 'Roboto, sans-serif';

export function JesusTabToolbar({
  title,
  copyText,
}: {
  title: string;
  copyText: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="commentary-toolbar">
      <h2 className="commentary-h2">{title}</h2>
      <div className="commentary-actions">
        <button onClick={copy} className="icon-btn" aria-label={`Copy ${title}`} title="Copy">
          {copied ? (
            <Check size={18} color={vmTokens.gold} strokeWidth={2} />
          ) : (
            <Copy size={18} color={vmTokens.textPrimary} strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={() =>
            navigator.share?.({ title, text: copyText, url: window.location.href }).catch(() => {})
          }
          className="icon-btn"
          aria-label={`Share ${title}`}
        >
          <ShareIcon size={18} color={vmTokens.textPrimary} />
        </button>
      </div>
    </div>
  );
}

export function JesusTabEmpty({
  children,
  testId,
}: {
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <p
      data-testid={testId}
      style={{
        fontFamily: FONT,
        fontSize: 14,
        lineHeight: '21px',
        color: vmTokens.textTertiary,
        fontStyle: 'italic',
      }}
    >
      {children}
    </p>
  );
}

export function JesusTabSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 700,
        color: vmTokens.gold,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        margin: '22px 0 10px',
      }}
    >
      {children}
    </h3>
  );
}
