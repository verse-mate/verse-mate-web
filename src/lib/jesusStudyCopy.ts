import { spanRangeLabel, type EventVerseSpan, type NarrowedStudy } from '@/lib/jesusStudy';
import { buildStudyCopyText, stripStudyMarkdown } from '@/lib/studyCopy';
import type { JesusEventDetail, JesusFacet } from '@/services/types';

/**
 * The Copy / Share payload for a Jesus event's Study tab, and the four
 * reveal voices both it and the renderer walk.
 *
 * Kept out of the component so `JesusStudyBody` exports only a component
 * (fast refresh) and so the serialisation is unit-testable on its own.
 */

/** The event graph keeps Jesus' claims apart from everyone else's. */
export const REVEAL_GROUPS: { key: keyof JesusEventDetail['reveals']; label: string }[] = [
  { key: 'says_about_himself', label: 'What He says about Himself' },
  { key: 'demonstrates', label: 'What He demonstrates' },
  { key: 'others_say', label: 'What others say' },
  { key: 'narrator_says', label: 'What the narrator says' },
];

function facetLines(facets: JesusFacet[]): string[] {
  return facets.map((f) => {
    const who = f.speaker ?? f.actor;
    const parts = [f.text ? `"${f.text}"` : f.title];
    if (who) parts.push(who);
    if (f.reference) parts.push(f.reference);
    return `   • [${f.type_label ?? f.type}] ${parts.join(' — ')}`;
  });
}

/**
 * The event sections first — they are what makes this an event study — then
 * the narrowed chapter study through the shared serializer, so the Bible side
 * and this tab produce the same text for the same content.
 */
export function buildEventStudyCopyText(
  detail: JesusEventDetail,
  span: EventVerseSpan | null,
  narrowed: NarrowedStudy | null,
  title: string,
): string {
  const { event, words, actions, reactions, reveals } = detail;
  const lines: string[] = [];
  const heading = span ? `${title} (${span.display})` : title;

  if (words.length) {
    lines.push('');
    lines.push('OBSERVATION — WHAT HE SAYS');
    lines.push(...facetLines(words));
  }
  if (actions.length) {
    lines.push('');
    lines.push('OBSERVATION — WHAT HE DOES');
    lines.push(...facetLines(actions));
  }
  if (reactions.length) {
    lines.push('');
    lines.push('OBSERVATION — HOW PEOPLE RESPONDED');
    for (const r of reactions) {
      lines.push(`   • ${r.who} — ${r.what}${r.source_ref ? ` (${r.source_ref})` : ''}`);
    }
  }
  const revealed = REVEAL_GROUPS.filter((g) => reveals[g.key]?.length);
  if (revealed.length) {
    lines.push('');
    lines.push('INTERPRETATION — WHAT THIS REVEALS');
    for (const group of revealed) {
      lines.push(`   ${group.label}`);
      for (const item of reveals[group.key]) {
        lines.push(
          `   • ${stripStudyMarkdown(item.content)}${item.source_ref ? ` (${item.source_ref})` : ''}`,
        );
      }
    }
  }

  const eventPart = lines.join('\n');
  if (!narrowed) return `${heading}\n${eventPart}`.trim();

  const preamble = span
    ? [
        `Scope: ${span.display} — narrowed from the ${narrowed.study.title} inductive study (${spanRangeLabel(span)}).`,
      ]
    : [];
  return `${heading}\n${eventPart}\n\n${buildStudyCopyText(narrowed.study, {
    title: `Inductive Study of ${narrowed.study.title}, scoped to ${span?.display ?? event.title}`,
    preamble,
  })}`.trim();
}
