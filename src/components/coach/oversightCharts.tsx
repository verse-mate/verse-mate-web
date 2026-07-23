/**
 * Custom inline-SVG charts for the Coach Oversight page — faithful recreations
 * of the design handoff's prototype charts (do not port the prototype runtime).
 * All share the handoff's muted, low-ink style.
 *
 *   AxisLineChart  — line + area, Y-axis ticks, emphasized last point
 *   BandedTrend    — session score over time with the 5 composite bands shaded
 *   RadarChart     — 12-dimension shape (gold) overlaid with a dashed 3-session avg
 *   MultiLineChart — overlaid leader trajectories across months
 */

const SANS = "'Public Sans', system-ui, sans-serif";

// ── Line chart with Y-axis + area fill + emphasized last point ──────────────
export function AxisLineChart({
  values,
  min,
  max,
  color = '#9A6E1F',
  labels,
}: {
  values: number[];
  min: number;
  max: number;
  color?: string;
  labels: string[];
}) {
  const W = 640;
  const H = 170;
  const L = 42;
  const R = 14;
  const T = 18;
  const B = 34;
  const n = values.length;
  if (n === 0) return null;
  const px = (i: number) => (n > 1 ? L + (i * (W - L - R)) / (n - 1) : (L + W - R) / 2);
  const py = (v: number) => H - B - ((v - min) / (max - min)) * (H - B - T);
  const pts = values.map((v, i) => [px(i), py(v)] as const);
  const lp = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const ap = `${px(0).toFixed(1)},${H - B} ${lp} ${px(n - 1).toFixed(1)},${H - B}`;
  const ticks = [min, (min + max) / 2, max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', height: 'auto', overflow: 'visible' }} role="img" aria-label="Trend line">
      {ticks.map((tv, i) => (
        <line key={`g${i}`} x1={L} x2={W - R} y1={py(tv)} y2={py(tv)} stroke="#E6E6E4" strokeWidth={1} />
      ))}
      {ticks.map((tv, i) => (
        <text key={`y${i}`} x={L - 9} y={py(tv) + 4} textAnchor="end" fontSize={10} fill="#B0A992" fontFamily={SANS}>{Math.round(tv)}</text>
      ))}
      <polygon points={ap} fill={color} fillOpacity={0.09} />
      {n > 1 && <polyline points={lp} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map((p, i) => (
        <circle key={`d${i}`} cx={p[0]} cy={p[1]} r={i === n - 1 ? 5.5 : 4} fill={i === n - 1 ? color : '#FFFFFF'} stroke={color} strokeWidth={2} />
      ))}
      {labels.map((t, i) => (
        <text key={`t${i}`} x={px(i)} y={H - 12} textAnchor="middle" fontSize={11} fill="#8A8272" fontFamily={SANS}>{t}</text>
      ))}
      <text x={px(n - 1)} y={py(values[n - 1]) - 12} textAnchor="middle" fontSize={13} fontWeight={700} fill={color} fontFamily={SANS}>{values[n - 1]}</text>
    </svg>
  );
}

// ── Session score over time with the five composite bands shaded ────────────
export function BandedTrend({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 640;
  const H = 200;
  const L = 40;
  const R = 14;
  const T = 12;
  const B = 34;
  const n = values.length;
  const min = 40;
  const max = 100;
  if (n === 0) return null;
  const px = (i: number) => (n > 1 ? L + (i * (W - L - R)) / (n - 1) : (L + W - R) / 2);
  const py = (v: number) => H - B - ((v - min) / (max - min)) * (H - B - T);
  const bands: [number, number, string][] = [
    [85, 100, '#E1EAF4'],
    [72, 85, '#E2EEE2'],
    [60, 72, '#F7EDD6'],
    [45, 60, '#F2E2D5'],
    [40, 45, '#F4DFD5'],
  ];
  const pts = values.map((v, i) => [px(i), py(v)] as const);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', height: 'auto', overflow: 'visible' }} role="img" aria-label="Session score over time">
      {bands.map((b, i) => (
        <rect key={`b${i}`} x={L} y={py(b[1])} width={W - L - R} height={py(b[0]) - py(b[1])} fill={b[2]} />
      ))}
      {[45, 60, 72, 85].map((tv, i) => (
        <text key={`y${i}`} x={L - 8} y={py(tv) + 3} textAnchor="end" fontSize={9} fill="#9A9484" fontFamily={SANS}>{tv}</text>
      ))}
      {n > 1 && <polyline points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke="#4A453B" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map((p, i) => (
        <circle key={`d${i}`} cx={p[0]} cy={p[1]} r={i === n - 1 ? 5 : 3.5} fill={i === n - 1 ? '#211E18' : '#FFFFFF'} stroke="#211E18" strokeWidth={2} />
      ))}
      <text x={pts[n - 1][0]} y={py(values[n - 1]) - 10} textAnchor="end" fontSize={12} fontWeight={700} fill="#211E18" fontFamily={SANS}>{values[n - 1]}</text>
      {labels.map((t, i) => (
        <text key={`x${i}`} x={px(i)} y={H - 11} textAnchor="middle" fontSize={10} fill="#8A8272" fontFamily={SANS}>{t}</text>
      ))}
    </svg>
  );
}

// ── 12-dimension radar (gold) + dashed 3-session average ────────────────────
export function RadarChart({ vals, avg }: { vals: number[]; avg?: number[] }) {
  const W = 380;
  const H = 330;
  const cx = 190;
  const cy = 160;
  const rad = 112;
  const N = 12;
  const ang = (i: number) => ((-90 + i * (360 / N)) * Math.PI) / 180;
  const pt = (v: number, i: number) => [cx + rad * (v / 5) * Math.cos(ang(i)), cy + rad * (v / 5) * Math.sin(ang(i))] as const;
  const polyPoints = (arr: number[]) => arr.map((v, i) => { const q = pt(v, i); return `${q[0].toFixed(1)},${q[1].toFixed(1)}`; }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', height: 'auto', overflow: 'visible', maxWidth: 380, margin: '0 auto' }} role="img" aria-label="12-dimension radar">
      {[1, 2, 3, 4, 5].map((lv, ri) => {
        const p = [];
        for (let i = 0; i < N; i++) { const q = pt(lv, i); p.push(`${q[0].toFixed(1)},${q[1].toFixed(1)}`); }
        return <polygon key={`r${ri}`} points={p.join(' ')} fill="none" stroke="#EAE6DC" strokeWidth={1} />;
      })}
      {Array.from({ length: N }, (_, i) => { const q = pt(5, i); return <line key={`ax${i}`} x1={cx} y1={cy} x2={q[0]} y2={q[1]} stroke="#EAE6DC" strokeWidth={1} />; })}
      {avg && <polygon points={polyPoints(avg)} fill="none" stroke="#8A8272" strokeWidth={2} strokeDasharray="5 4" />}
      <polygon points={polyPoints(vals)} fill="#C9A24B" fillOpacity={0.16} stroke="#9A6E1F" strokeWidth={2} />
      {Array.from({ length: N }, (_, i) => { const q = pt(5.9, i); return <text key={`t${i}`} x={q[0]} y={q[1] + 3} textAnchor="middle" fontSize={9} fontWeight={700} fill="#8A8272" fontFamily={SANS}>{`D${i + 1}`}</text>; })}
    </svg>
  );
}

// ── Overlaid leader trajectories across months ──────────────────────────────
export function MultiLineChart({
  series,
  min,
  max,
  labels,
}: {
  series: { name: string; color: string; values: number[] }[];
  min: number;
  max: number;
  labels: string[];
}) {
  const W = 680;
  const H = 210;
  const L = 46;
  const R = 16;
  const T = 18;
  const B = 34;
  const n = labels.length;
  const px = (i: number) => (n > 1 ? L + (i * (W - L - R)) / (n - 1) : (L + W - R) / 2);
  const py = (v: number) => H - B - ((v - min) / (max - min)) * (H - B - T);
  const ticks = [min, (min + max) / 2, max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', height: 'auto', overflow: 'visible' }} role="img" aria-label="Leader trajectories">
      {ticks.map((tv, i) => (
        <line key={`g${i}`} x1={L} x2={W - R} y1={py(tv)} y2={py(tv)} stroke="#E6E6E4" strokeWidth={1} />
      ))}
      {ticks.map((tv, i) => (
        <text key={`y${i}`} x={L - 9} y={py(tv) + 4} textAnchor="end" fontSize={10} fill="#B0A992" fontFamily={SANS}>{Math.round(tv)}</text>
      ))}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => [px(i), py(v)] as const);
        return (
          <g key={`s${si}`}>
            <polyline points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => (
              <circle key={`d${si}-${i}`} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4.5 : 3} fill={i === pts.length - 1 ? s.color : '#FFFFFF'} stroke={s.color} strokeWidth={2} />
            ))}
          </g>
        );
      })}
      {labels.map((t, i) => (
        <text key={`t${i}`} x={px(i)} y={H - 12} textAnchor="middle" fontSize={11} fill="#8A8272" fontFamily={SANS}>{t}</text>
      ))}
    </svg>
  );
}
