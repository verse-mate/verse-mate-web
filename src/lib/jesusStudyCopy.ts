import { spanRangeLabel, type EventVerseSpan, type NarrowedStudy } from '@/lib/jesusStudy';
import {
  planObservationPlacement,
  planRevealPlacement,
  REVEAL_GROUPS,
  type EventObservationKey,
} from '@/lib/jesusStudyEmbed';
import { buildStudyCopyText, stripStudyMarkdown } from '@/lib/studyCopy';
import type { JesusEventDetail, JesusFacet } from '@/services/types';

/**
 * The Copy / Share payload for a Jesus event's Study tab, and the four
 * reveal voices both it and the renderer walk.
 *
 * Kept out of the component so `JesusStudyBody` exports only a component
 * (fast refresh) and so the serialisation is unit-testable on its own.
 */

function facetLines(facets: JesusFacet[]): string[] {
  return facets.map((f) => {
    const who = f.speaker ?? f.actor;
    const parts = [f.text ? `"${f.text}"` : f.title];
    if (who) parts.push(who);
    if (f.reference) parts.push(f.reference);
    return `   • [${f.type_label ?? f.type}] ${parts.join(' — ')}`;
  });
}

/** The event's own observations, as the plain-text block they render as. */
function observationLines(detail: JesusEventDetail, key: EventObservationKey): string[] {
  const { event, words, actions, reactions, passages } = detail;
  switch (key) {
    case 'setting': {
      const lines = [`   The event in its setting`];
      lines.push(`   • Passage — ${passages.map((p) => p.display).join(' · ')}`);
      if (event.location) lines.push(`   • Where — ${event.location}`);
      const when = [event.approximate_date, event.period_name].filter(Boolean).join(' · ');
      if (when) lines.push(`   • When — ${when}`);
      if (event.people.length) {
        lines.push(
          `   • Who — ${event.people.map((p) => (p.role ? `${p.person} (${p.role})` : p.person)).join(', ')}`,
        );
      }
      if (event.gospels.length) lines.push(`   • Recorded by — ${event.gospels.join(', ')}`);
      return lines;
    }
    case 'words':
      return ['   What He says', ...facetLines(words)];
    case 'actions':
      return ['   What He does', ...facetLines(actions)];
    case 'reactions':
      return [
        '   How people responded',
        ...reactions.map(
          (r) => `   • ${r.who} — ${r.what}${r.source_ref ? ` (${r.source_ref})` : ''}`,
        ),
      ];
  }
}

function revealLines(groups: { label: string; items: JesusEventDetail['reveals'][keyof JesusEventDetail['reveals']] }[]): string[] {
  const lines = ['   What this event reveals'];
  for (const group of groups) {
    lines.push(`   ${group.label}`);
    for (const item of group.items) {
      lines.push(
        `   • ${stripStudyMarkdown(item.content)}${item.source_ref ? ` (${item.source_ref})` : ''}`,
      );
    }
  }
  return lines;
}

/**
 * The payload follows the page: with a chapter study, the event's own record
 * is folded into the step and the movement that host it on screen; without
 * one, it is all there is, so it leads.
 */
export function buildEventStudyCopyText(
  detail: JesusEventDetail,
  span: EventVerseSpan | null,
  narrowed: NarrowedStudy | null,
  title: string,
): string {
  const { event, words, actions, reactions, reveals } = detail;
  const heading = span ? `${title} (${span.display})` : title;

  const present: EventObservationKey[] = ['setting'];
  if (words.length) present.push('words');
  if (actions.length) present.push('actions');
  if (reactions.length) present.push('reactions');

  if (!narrowed) {
    const lines: string[] = [];
    for (const key of present) {
      lines.push('');
      lines.push(...observationLines(detail, key));
    }
    const revealed = REVEAL_GROUPS.filter((g) => reveals[g.key]?.length).map((g) => ({
      label: g.label,
      items: reveals[g.key],
    }));
    if (revealed.length) {
      lines.push('');
      lines.push(...revealLines(revealed));
    }
    return `${heading}\n${lines.join('\n')}`.trim();
  }

  const placement = planObservationPlacement(narrowed.study.steps, present);
  const stepAddenda = new Map<number, string[]>();
  for (const [step, keys] of placement.byStep) {
    const lines: string[] = ['   FROM THIS EVENT'];
    for (const key of keys) lines.push(...observationLines(detail, key));
    stepAddenda.set(step, lines);
  }

  const revealPlacement = planRevealPlacement(
    reveals,
    narrowed.study.interpretation.movements,
    narrowed.study,
  );
  const movementAddenda = new Map<string, string[]>();
  for (const [key, groups] of revealPlacement.byMovement) {
    movementAddenda.set(key, revealLines(groups));
  }

  // Blocks and reveals with no home on screen lead the section they belong
  // to, exactly as the page renders them.
  const observationLead = placement.unplaced.flatMap((key) => ['', ...observationLines(detail, key)]);
  const interpretationAddenda = revealPlacement.leftovers.length
    ? revealLines(revealPlacement.leftovers)
    : undefined;

  const preamble = span
    ? [
        `Scope: ${span.display} — narrowed from the ${narrowed.study.title} inductive study (${spanRangeLabel(span)}).`,
      ]
    : [];

  return `${heading}${observationLead.join('\n')}\n\n${buildStudyCopyText(narrowed.study, {
    title: `Inductive Study of ${narrowed.study.title}, scoped to ${span?.display ?? event.title}`,
    preamble,
    stepAddenda,
    movementAddenda,
    interpretationAddenda,
  })}`.trim();
}
