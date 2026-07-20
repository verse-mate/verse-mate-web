/**
 * Per-session PDF download for the coach portal.
 *
 * Rather than link out to Google Docs, we render the feedback on-page and let
 * the leader download a PDF built from that same content. This composes a
 * clean, self-contained printable report into a hidden iframe and invokes the
 * browser's print dialog (which offers "Save as PDF"). No external file, no
 * dependency — the PDF always matches what's shown on-site.
 */

import type { CoachFeedbackPoint, CoachReport } from '@/services/coachService';

const GOLD = '#B09A6D';

function statusHex(status: string): string {
  switch (status) {
    case 'Exceptional':
      return GOLD;
    case 'Strong':
      return '#15803D';
    case 'On Target':
      return '#B08900';
    case 'Developing':
      return '#C2620F';
    default:
      return '#B91C1C';
  }
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function list(items: string[]): string {
  if (!items.length) return '<p class="muted">None recorded.</p>';
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
}

/** Full prose from the pipeline when present (titled write-ups), otherwise the
 *  terse bullet list — so the PDF mirrors the on-page desktop report. */
function proseOrList(points: CoachFeedbackPoint[] | undefined, bullets: string[]): string {
  if (points?.length) {
    return points
      .map(
        (p) =>
          `${p.title ? `<p class="prose-title">${esc(p.title)}</p>` : ''}${p.paragraphs
            .map((para) => `<p>${esc(para)}</p>`)
            .join('')}`,
      )
      .join('');
  }
  return list(bullets);
}

function clusterRows(report: CoachReport): string {
  return report.clusters
    .map((c) => {
      const pct = c.scorePct == null ? 0 : c.scorePct;
      const label = c.scorePct == null ? 'N/A' : `${c.scorePct}%`;
      return `<tr>
        <td>${esc(c.name)}</td>
        <td class="num">${label}</td>
        <td class="num">${c.contribution.toFixed(1)}</td>
        <td class="barcell"><span class="bar" style="width:${pct}%"></span></td>
      </tr>`;
    })
    .join('');
}

function dimensionRows(report: CoachReport): string {
  return report.dimensions
    .map(
      (d) =>
        `<tr><td>${esc(d.name)}</td><td class="num">${d.score == null ? 'N/A' : `${d.score}/5`}</td><td class="note">${esc(d.note || '')}</td></tr>`,
    )
    .join('');
}

function buildHtml(report: CoachReport, leaderName: string): string {
  const color = statusHex(report.status);
  const title = `VerseMate Coaching — ${leaderName} — ${report.session} — ${report.dateLabel}`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Roboto', Arial, sans-serif; color: #1b1b1b; margin: 0; font-size: 12px; line-height: 1.5; }
  .banner { background: ${GOLD}; color: #241d0e; padding: 16px 20px; border-radius: 8px; }
  .banner .kicker { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; opacity: .8; }
  .banner h1 { margin: 2px 0 0; font-size: 22px; }
  .banner .sub { margin-top: 4px; font-size: 12px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 24px; margin: 16px 0; }
  .meta div { font-size: 12px; }
  .meta b { color: #555; font-weight: 600; }
  .scorewrap { display: flex; align-items: center; gap: 16px; margin: 8px 0 16px; }
  .score { font-size: 40px; font-weight: 800; color: ${color}; line-height: 1; }
  .score small { font-size: 14px; color: #888; font-weight: 600; }
  .pill { display: inline-block; padding: 3px 12px; border-radius: 999px; font-weight: 700; font-size: 12px;
          color: ${color}; border: 1.5px solid ${color}; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .5px; color: #333; border-bottom: 2px solid #eee;
       padding-bottom: 4px; margin: 20px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin: 4px 0; }
  td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  td.num { text-align: right; white-space: nowrap; color: #444; }
  td.note { font-size: 10.5px; color: #666; line-height: 1.4; }
  .barcell { width: 34%; }
  .bar { display: block; height: 7px; background: ${GOLD}; border-radius: 4px; }
  ul { margin: 4px 0 4px 0; padding-left: 18px; }
  li { margin-bottom: 5px; }
  .headline { font-size: 14px; font-weight: 600; margin: 6px 0 14px; }
  .prose-title { font-size: 12.5px; font-weight: 700; margin: 10px 0 2px; color: #241d0e; }
  p { margin: 0 0 7px; }
  .muted { color: #999; font-style: italic; }
  .foot { margin-top: 24px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 8px; }
</style></head><body>
  <div class="banner">
    <div class="kicker">Bible Leader Coaching</div>
    <h1>${esc(leaderName)}</h1>
    <div class="sub">${esc(report.session)} &middot; ${esc(report.dateLabel)}</div>
  </div>

  <div class="meta">
    <div><b>Topic:</b> ${esc(report.topic)}</div>
    <div><b>Duration:</b> ${esc(report.duration)}</div>
    <div><b>Attendees:</b> ${report.attendees}</div>
    <div><b>Newcomers:</b> ${report.newcomers}</div>
  </div>

  <div class="scorewrap">
    <div class="score">${Math.round(report.score)}<small> / 100</small></div>
    <div><span class="pill">${esc(report.statusEmoji)} ${esc(report.status)}</span></div>
  </div>

  <p class="headline">${esc(report.feedback.headline)}</p>
  ${(report.feedback.overview || []).map((p) => `<p>${esc(p)}</p>`).join('')}

  <h2>Cluster breakdown</h2>
  <table><tbody>${clusterRows(report)}</tbody></table>

  <h2>Top strengths</h2>
  ${proseOrList(report.feedback.strengthsProse, report.feedback.strengths)}

  <h2>Growth areas</h2>
  ${proseOrList(report.feedback.improvementsProse, report.feedback.improvements)}

  <h2>Recommendations for next session</h2>
  ${proseOrList(report.feedback.recommendationsProse, report.feedback.recommendations)}

  ${report.bigIdeas.length ? `<h2>Big ideas</h2>${list(report.bigIdeas)}` : ''}

  <h2>12 dimensions</h2>
  <table><tbody>${dimensionRows(report)}</tbody></table>

  <div class="foot">Generated from VerseMate coaching data &middot; ${esc(report.dateLabel)}</div>
</body></html>`;
}

/**
 * Compose the printable report and open the browser's print/save-as-PDF
 * dialog. Uses a hidden iframe so no popup is blocked.
 */
export function downloadReportPdf(report: CoachReport, leaderName: string): void {
  if (typeof document === 'undefined') return;
  const html = buildHtml(report, leaderName || 'Leader');

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  let removed = false;
  const cleanup = () => {
    if (removed) return;
    removed = true;
    setTimeout(() => iframe.remove(), 500);
  };

  const win = iframe.contentWindow;
  if (win) win.onafterprint = cleanup;

  // Let the iframe lay out before invoking print.
  setTimeout(() => {
    try {
      win?.focus();
      win?.print();
    } finally {
      // Fallback removal in case onafterprint never fires (some browsers).
      setTimeout(cleanup, 60000);
    }
  }, 350);
}
