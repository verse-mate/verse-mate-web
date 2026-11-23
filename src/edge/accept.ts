interface Range {
  type: string;
  subtype: string;
  q: number;
}

function parseAccept(header: string): Range[] {
  return header.split(',').flatMap((part) => {
    const [mediaRange, ...params] = part.trim().split(';');
    const [type, subtype] = mediaRange.trim().toLowerCase().split('/');
    if (!type || !subtype) return [];
    const qParam = params.map((param) => param.trim().toLowerCase()).find((param) => param.startsWith('q='));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    return [{ type, subtype, q: Number.isFinite(q) ? q : 0 }];
  });
}

function qualityOf(ranges: Range[], type: string, subtype: string) {
  const exact = ranges.find((range) => range.type === type && range.subtype === subtype);
  if (exact) return exact.q;
  const anySubtype = ranges.find((range) => range.type === type && range.subtype === '*');
  if (anySubtype) return anySubtype.q;
  const any = ranges.find((range) => range.type === '*' && range.subtype === '*');
  return any ? any.q : 0;
}

export function prefersMarkdown(header: string | null) {
  if (!header) return false;
  const ranges = parseAccept(header);
  const markdown = ranges.find((range) => range.type === 'text' && range.subtype === 'markdown');
  if (!markdown || markdown.q <= 0) return false;
  return markdown.q >= qualityOf(ranges, 'text', 'html');
}
