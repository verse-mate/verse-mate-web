import type { InductiveStudy, StudyStep } from '@versemate/studies/types';

/**
 * Plain-text serialisation of an inductive study, for the Copy / Share
 * buttons. Lives outside the renderer so the Bible side's StudyPanel and the
 * Jesus event's Study tab produce byte-identical payloads for the same study.
 */

// Strip the bare markdown we render in the study content (`#`, `>`,
// `**bold**`, `*italic*`) so the clipboard / share payload reads as plain
// prose on the recipient side.
export function stripStudyMarkdown(text: string): string {
  return text
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

/**
 * Serialise an InductiveStudy to a plain-text payload for the Copy / Share
 * buttons. Walks every step (varying by `kind`), then the interpretation
 * movements, then the application questions. Output looks like:
 *
 *   Inductive Study of James 1
 *   Testing Your Faith
 *
 *   Theme: ...
 *
 *   OBSERVATION — 9 INDUCTIVE STEPS
 *
 *   1. Begin with prayer
 *      [body]
 *
 *   ...
 */
export function buildStudyCopyText(
  study: InductiveStudy,
  options: {
    /** Replaces the "Inductive Study of <chapter>" first line. */
    title?: string;
    /** Extra lines after the theme — the Jesus tab notes its scope there. */
    preamble?: string[];
    /**
     * Lines appended inside a step, keyed by step number. The Jesus tab folds
     * the event's own observations into the step that asks for them, and the
     * clipboard payload follows the page rather than re-ordering it.
     */
    stepAddenda?: Map<number, string[]>;
    /** Lines appended inside a movement, keyed by `mv.number ?? index`. */
    movementAddenda?: Map<string, string[]>;
    /** Lines appended right under the INTERPRETATION heading. */
    interpretationAddenda?: string[];
  } = {},
): string {
  const lines: string[] = [];
  lines.push(options.title ?? `Inductive Study of ${study.title}`);
  if (study.subtitle) lines.push(study.subtitle);
  if (study.themeOneLine) {
    lines.push('');
    lines.push(`Theme: ${study.themeOneLine}`);
  }
  for (const line of options.preamble ?? []) {
    lines.push('');
    lines.push(line);
  }
  lines.push('');
  lines.push('OBSERVATION — 9 INDUCTIVE STEPS');
  for (const step of study.steps) {
    lines.push('');
    lines.push(`${step.number}. ${step.title}`);
    if (step.summary) lines.push(`   ${step.summary}`);
    switch (step.kind) {
      case 'prose':
        lines.push('');
        lines.push(stripStudyMarkdown(step.body));
        break;
      case 'qa':
        for (const item of step.items) {
          lines.push('');
          if (item.tag) lines.push(`   [${item.tag}] ${item.q}`);
          else lines.push(`   ${item.q}`);
          lines.push(`   ${stripStudyMarkdown(item.a)}`);
        }
        break;
      case 'keywords':
        for (const row of step.inventory) {
          lines.push('');
          const greek = row.greek ? ` (${row.greek})` : '';
          lines.push(`   ${row.word}${greek} — ×${row.count} — ${row.verses}`);
          if (row.definition) lines.push(`   ${stripStudyMarkdown(row.definition)}`);
        }
        break;
      case 'lists':
        for (const list of step.lists) {
          lines.push('');
          lines.push(`   ${list.title}`);
          for (const r of list.rows) {
            lines.push(`   • ${r.ref} — ${stripStudyMarkdown(r.truth)}`);
          }
        }
        break;
      case 'contrasts':
        for (const item of step.items) {
          lines.push(`   • ${item.verses} (${item.type}) — ${stripStudyMarkdown(item.pairing)}`);
        }
        break;
      case 'bullets':
        if (step.intro) {
          lines.push('');
          lines.push(`   ${stripStudyMarkdown(step.intro)}`);
        }
        for (const item of step.items) {
          const tag = item.tag ? `[${item.tag}] ` : '';
          lines.push(`   • ${tag}${stripStudyMarkdown(item.text)}`);
        }
        if (step.note) {
          lines.push('');
          lines.push(`   ${stripStudyMarkdown(step.note)}`);
        }
        break;
      case 'segments':
        if (step.themeHeadline) {
          lines.push('');
          lines.push(`   Chapter theme: ${step.themeHeadline}`);
        }
        for (const seg of step.segments) {
          lines.push('');
          lines.push(`   ${seg.title}`);
          lines.push(`   ${stripStudyMarkdown(seg.body)}`);
        }
        break;
    }
    const addendum = options.stepAddenda?.get(step.number);
    if (addendum?.length) {
      lines.push('');
      lines.push(...addendum);
    }
  }
  lines.push('');
  lines.push('INTERPRETATION');
  if (options.interpretationAddenda?.length) {
    lines.push('');
    lines.push(...options.interpretationAddenda);
  }
  study.interpretation.movements.forEach((mv, index) => {
    lines.push('');
    lines.push(`Movement ${mv.number} — ${mv.title} (${mv.range})`);
    if (mv.excerpt) lines.push(`   "${mv.excerpt}"`);
    lines.push('');
    lines.push(stripStudyMarkdown(mv.body));
    const addendum = options.movementAddenda?.get(String(mv.number ?? index));
    if (addendum?.length) {
      lines.push('');
      lines.push(...addendum);
    }
  });
  lines.push('');
  lines.push('APPLICATION');
  if (study.application.intro) {
    lines.push('');
    lines.push(stripStudyMarkdown(study.application.intro));
  }
  for (const q of study.application.questions) {
    lines.push('');
    lines.push(`${q.range} — ${q.question}`);
  }
  return lines.join('\n');
}
