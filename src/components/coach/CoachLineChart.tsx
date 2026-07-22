/**
 * Minimal, low-ink inline-SVG line chart for the coaching dashboard — a direct
 * recreation of the handoff prototype's `lineChart` (gridlines, a single
 * accent line with a soft area fill, labelled x-axis, and an emphasized last
 * point). Kept as its own primitive so Home's trajectory and Trends' score
 * trajectory render identically.
 */

import { dt } from './dashboardTheme';

export default function CoachLineChart({
  values,
  max,
  color = dt.gold,
  labels,
}: {
  values: number[];
  max: number;
  color?: string;
  labels: string[];
}) {
  const W = 720;
  const H = 200;
  const L = 34;
  const R = 16;
  const T = 20;
  const B = 40;
  const n = values.length;

  if (n === 0) return null;

  const px = (i: number) => (n === 1 ? (L + (W - R)) / 2 : L + (i * (W - L - R)) / (n - 1));
  const py = (v: number) => H - B - (v / max) * (H - B - T);

  const pts = values.map((v, i) => [px(i), py(v)] as const);
  const linePts = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPts = `${px(0).toFixed(1)},${H - B} ${linePts} ${px(n - 1).toFixed(1)},${H - B}`;

  const gridLevels = [0, 0.5, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', height: 'auto', overflow: 'visible' }}
      role="img"
      aria-label="Trend line chart"
    >
      {gridLevels.map((f, i) => {
        const y = H - B - f * (H - B - T);
        return (
          <line key={`g${i}`} x1={L} x2={W - R} y1={y} y2={y} stroke="#E7DFCE" strokeWidth={1} />
        );
      })}
      <polygon points={areaPts} fill={color} fillOpacity={0.09} />
      {n > 1 && (
        <polyline
          points={linePts}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {pts.map((p, i) => (
        <circle
          key={`d${i}`}
          cx={p[0]}
          cy={p[1]}
          r={i === n - 1 ? 6 : 4}
          fill={i === n - 1 ? color : '#FFFDF8'}
          stroke={color}
          strokeWidth={2}
        />
      ))}
      {labels.map((t, i) => (
        <text
          key={`l${i}`}
          x={px(i)}
          y={H - 14}
          textAnchor="middle"
          fontSize={12}
          fill={dt.textLight}
          fontFamily={dt.sans}
        >
          {t}
        </text>
      ))}
      <text
        x={px(n - 1)}
        y={py(values[n - 1]) - 14}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill={color}
        fontFamily={dt.sans}
      >
        {values[n - 1]}
      </text>
    </svg>
  );
}
