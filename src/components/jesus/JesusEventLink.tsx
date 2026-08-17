/**
 * "View Jesus Event" — the bridge from ordinary reading into the Jesus graph.
 *
 * Rendered inside the reader. The design constraint is that it must not compete
 * with the text: it appears only when the chapter actually contains an event,
 * sits below the passage rather than interrupting it, and never intercepts a
 * tap meant for verse selection or highlighting.
 *
 * The lookup fails silently. Most chapters have no event, and a reader should
 * never see an error because the Jesus API was unreachable.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buildJesusEventUrl, jesusTestId } from '@/lib/jesusSlugs';
import { fetchJesusEventsForPassage } from '@/services/jesusService';
import type { JesusEventCard } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

interface Props {
  bookId?: number;
  chapter: number;
  /** Narrows to the event covering this verse when one is selected. */
  verse?: number;
  bibleVersion?: string;
}

export default function JesusEventLink({ bookId, chapter, verse, bibleVersion }: Props) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<JesusEventCard[]>([]);

  useEffect(() => {
    if (!bookId || !chapter) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    fetchJesusEventsForPassage(bookId, chapter, verse, bibleVersion).then((found) => {
      if (!cancelled) setEvents(found);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, verse, bibleVersion]);

  if (events.length === 0) return null;

  // One chapter can contain several events; show a couple rather than a wall.
  const shown = events.slice(0, 3);

  return (
    <section
      data-testid="jesus-event-link"
      style={{
        marginTop: 20,
        paddingTop: 14,
        borderTop: `1px solid ${vmTokens.divider}`,
      }}
    >
      <p
        style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: vmTokens.textTertiary,
          marginBottom: 8,
        }}
      >
        {shown.length > 1 ? 'Jesus events here' : 'Jesus event'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shown.map((event) => {
          // The parallels are the payoff: reading Mark, you learn Matthew and
          // Luke tell it too, at the moment that matters.
          const others = event.passages.filter((p) => p.book_id !== bookId);

          return (
            <button
              key={event.slug}
              type="button"
              onClick={() => navigate(buildJesusEventUrl(event.slug))}
              data-testid={jesusTestId('jesus-event-link', event.slug)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                backgroundColor: 'rgba(176,154,109,0.10)',
                border: `1px solid ${vmTokens.gold}`,
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: FONT,
                    fontSize: 14,
                    fontWeight: 500,
                    color: vmTokens.textPrimary,
                  }}
                >
                  {event.title}
                </span>
                {others.length > 0 && (
                  <span
                    style={{
                      display: 'block',
                      marginTop: 2,
                      fontFamily: FONT,
                      fontSize: 12,
                      color: vmTokens.textSecondary,
                    }}
                  >
                    Also in {others.map((p) => p.display).join(' and ')}
                  </span>
                )}
              </span>
              <ArrowRight size={16} style={{ color: vmTokens.gold, flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
