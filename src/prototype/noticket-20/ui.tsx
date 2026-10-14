import { type CSSProperties, Fragment, type KeyboardEvent, type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle, CircleDot, Lock } from 'lucide-react';
import { api } from '@/services/api';
import { dt } from '@/components/coach/dashboardTheme';
import { useApp } from '@/contexts/AppContext';

export const P = '/noticket-20';

export const to = {
  gate: `${P}/gate/offer-new`,
  start: `${P}/start/intro`,
  path: `${P}/path/continue`,
  lesson: `${P}/lesson/video`,
  lessonDone: `${P}/lesson/done`,
  check: `${P}/check/open`,
  checkIncomplete: `${P}/check/incomplete`,
  completion: `${P}/completion/request-form`,
  adminHome: `${P}/admin-home/requests`,
  adminApprove: `${P}/admin-home/approve`,
  adminDecline: `${P}/admin-home/decline`,
  program: `${P}/admin-program/modules`,
  module: `${P}/admin-module/edit`,
  adminLesson: `${P}/admin-lesson/edit`,
  learners: `${P}/admin-learners/list`,
  leaderHome: `${P}/path/leader`,
};

export function useData<T>(path: string) {
  return useQuery({ queryKey: [path], queryFn: () => api.get<T>(path) });
}

export type NavKey = 'learner' | 'leader' | 'admin';

const NAVS: Record<NavKey, { label: string; to: string; key: string }[]> = {
  learner: [{ label: 'Learning', to: to.path, key: 'learning' }],
  leader: [
    { label: 'Home', to: '/coach', key: 'home' },
    { label: 'Sessions', to: '/coach/sessions', key: 'sessions' },
    { label: 'Trends', to: '/coach/trends', key: 'trends' },
    { label: 'Learning', to: to.leaderHome, key: 'learning' },
  ],
  admin: [
    { label: 'Dashboard', to: to.adminHome, key: 'dashboard' },
    { label: 'Program', to: to.program, key: 'program' },
    { label: 'Trends', to: '/coach', key: 'trends' },
    { label: 'Class links', to: '/coach', key: 'links' },
    { label: 'Pipeline', to: '/coach', key: 'pipeline' },
    { label: 'Parallel run', to: '/coach', key: 'parallel' },
    { label: 'Rotating classes', to: '/coach', key: 'rotating' },
    { label: 'Duplicates', to: '/coach', key: 'duplicates' },
    { label: 'Upload', to: '/coach/upload', key: 'upload' },
  ],
};

export function Shell({ nav, active, children, wide }: { nav: NavKey | null; active?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="nt20" style={{ minHeight: '100vh', background: dt.pageBg, color: dt.textPrimary, fontFamily: dt.sans, WebkitFontSmoothing: 'antialiased', padding: 'clamp(12px, 4vw, 44px) clamp(10px, 4vw, 44px) 80px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ width: wide ? 1240 : 1080, maxWidth: '100%' }}>
        <div style={{ background: dt.cardBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 18, padding: '28px clamp(16px, 4vw, 44px) 46px', boxShadow: dt.shadow }}>
          <TopBar nav={nav} active={active} />
          {children}
        </div>
      </div>
    </div>
  );
}

const GLOBAL_CSS = `
html, body, #root { background: ${dt.pageBg} !important; }
.nt20 ::selection, .nt20::selection { background: ${dt.goldChip}; color: ${dt.textPrimary}; }
.nt20 a:focus-visible, .nt20 button:focus-visible, .nt20 input:focus-visible, .nt20 textarea:focus-visible, .nt20 select:focus-visible, .nt20 video:focus-visible, .nt20 summary:focus-visible { outline: 2px solid ${dt.gold}; outline-offset: 2px; }
.nt20 input::placeholder, .nt20 textarea::placeholder { color: ${dt.textMuted}; opacity: 1; }
@media (max-width: 520px) { .nt20-coaching { display: none; } }
@media (max-width: 640px) {
  .nt20-table table, .nt20-table tbody, .nt20-table tr, .nt20-table td { display: block; min-width: 0 !important; width: auto; }
  .nt20-table thead { display: none; }
  .nt20-table tr { padding: 12px 14px; border-top: 1px solid ${dt.rowDivider}; }
  .nt20-table td { border: none !important; padding: 3px 0 !important; }
  .nt20-table td[data-label]::before { content: attr(data-label) ": "; color: ${dt.textMuted}; font-size: 13px; }
}
.nt20 input, .nt20 textarea, .nt20 select { caret-color: ${dt.gold}; }
.nt20 a { text-underline-offset: 3px; }
.nt20-num { font-variant-numeric: tabular-nums; }
.nt20-lesson { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; max-width: 780px; }
.nt20-lesson > aside { position: static !important; }
.nt20-radio { position: relative; }
.nt20-radio > input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: inherit; font-size: 16px; }
.nt20-dot { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; box-sizing: border-box; border: 2px solid ${dt.textMuted}; margin-top: 2px; }
.nt20-radio > input:checked + .nt20-dot { border-color: ${dt.gold}; background: radial-gradient(${dt.gold} 0 4px, transparent 5px); }
.nt20-radio:has(input:focus-visible) { outline: 2px solid ${dt.gold}; outline-offset: 2px; }
`;

function TopBar({ nav, active }: { nav: NavKey | null; active?: string }) {
  const { state } = useApp();
  const initials = ((state.userFirstName || '')[0] ?? '') + ((state.userLastName || '')[0] ?? '') || (state.userEmail || '?')[0];
  return (
    <div className="nt20" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', paddingBottom: 22, borderBottom: `1px solid ${dt.border2}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div aria-hidden style={{ width: 30, height: 30, borderRadius: 8, background: dt.darkBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: dt.goldChip, fontFamily: dt.serif, fontWeight: 600, fontSize: 17 }}>V</div>
        <span style={{ fontFamily: dt.serif, fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }}>VerseMate</span>
        <span className="nt20-coaching" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.14em', color: dt.gold, borderLeft: '1px solid #DEDEDC', paddingLeft: 11 }}>COACHING</span>
      </div>
      <nav aria-label="Coaching" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 'auto', gap: '0 clamp(14px, 2vw, 22px)', fontSize: 14, fontWeight: 500, flexWrap: 'wrap' }}>
        {nav &&
          NAVS[nav].map((n) => (
            <NavLink key={n.key} to={n.to} aria-current={active === n.key ? 'page' : undefined} style={{ color: active === n.key ? dt.textPrimary : dt.textMuted, textDecoration: 'none', fontWeight: active === n.key ? 700 : 500, borderBottom: `2px solid ${active === n.key ? dt.brightGold : 'transparent'}`, minHeight: 44, minWidth: 44, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box' }}>
              {n.label}
            </NavLink>
          ))}
        {state.isSignedIn && (
          <span aria-label="Your account" role="img" style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8E8E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: dt.goldHover, fontSize: 13 }}>
            {initials.toUpperCase()}
          </span>
        )}
      </nav>
    </div>
  );
}

export const h1: CSSProperties = { fontFamily: dt.serif, fontWeight: 500, fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: 1.1, letterSpacing: '-.02em', margin: 0, textWrap: 'balance' };
export const h2: CSSProperties = { fontFamily: dt.serif, fontWeight: 500, fontSize: 24, lineHeight: 1.2, letterSpacing: '-.01em', margin: 0, textWrap: 'balance' };
export const h3: CSSProperties = { fontFamily: dt.serif, fontWeight: 500, fontSize: 20, lineHeight: 1.25, margin: 0 };
export const lead: CSSProperties = { fontSize: 16, lineHeight: 1.6, color: dt.body, margin: 0, maxWidth: '62ch' };
export const muted: CSSProperties = { fontSize: 14, lineHeight: 1.55, color: dt.textMuted, margin: 0 };

const btnBase: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '0 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', fontFamily: dt.sans, whiteSpace: 'nowrap' };
export const btn = {
  primary: { ...btnBase, background: dt.brightGold, color: dt.textPrimary, border: 'none' } as CSSProperties,
  dark: { ...btnBase, background: dt.darkBg, color: dt.goldChip, border: 'none' } as CSSProperties,
  outline: { ...btnBase, background: dt.cardBg, color: dt.textPrimary, border: `1px solid ${dt.inputBorder}`, fontWeight: 600 } as CSSProperties,
  quiet: { ...btnBase, background: 'transparent', color: dt.gold, border: 'none', padding: '0 8px', fontWeight: 700 } as CSSProperties,
  danger: { ...btnBase, background: dt.cardBg, color: dt.rust, border: `1px solid ${dt.rust}`, fontWeight: 600 } as CSSProperties,
  disabled: { background: dt.fill2, color: dt.textMuted, border: `1px solid ${dt.cardBorder}`, cursor: 'not-allowed' } as CSSProperties,
};

export function Btn({ to: href, kind = 'primary', children, onClick, disabled, type = 'button', style, label }: { to?: string; kind?: keyof typeof btn; children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; style?: CSSProperties; label?: string }) {
  const s = { ...btn[kind], ...(disabled ? btn.disabled : null), ...style };
  if (href && !disabled) return <Link to={href} style={s} aria-label={label}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} aria-disabled={disabled} style={s} aria-label={label}>{children}</button>;
}

export function BackLink({ to: href, children }: { to: string; children: ReactNode }) {
  return <Link to={href} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, color: dt.gold, fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>← {children}</Link>;
}

type Tone = 'green' | 'rust' | 'gold' | 'grey' | 'blue';
const TONES: Record<Tone, [string, string]> = { green: [dt.green, dt.greenBg], rust: [dt.rust, dt.rustBg], gold: [dt.gold2, dt.goldChip], grey: [dt.textMuted, dt.fill1], blue: [dt.blue, dt.blueBg] };

export function Tag({ tone, children }: { tone: Tone; children: ReactNode }) {
  const [c, bg] = TONES[tone];
  return <span className="nt20-num" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: `color-mix(in srgb, ${c} 78%, black)`, background: bg, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{children}</span>;
}

export type StepState = 'done' | 'open' | 'next' | 'locked';

export function StepMark({ state }: { state: StepState }) {
  const props = { size: 20, strokeWidth: 2, 'aria-hidden': true } as const;
  if (state === 'done') return <CheckCircle2 {...props} color={dt.green} />;
  if (state === 'next') return <CircleDot {...props} color={dt.gold} />;
  if (state === 'locked') return <Lock {...props} size={18} color={dt.textLight} />;
  return <Circle {...props} color={dt.textMuted} />;
}

export const STEP_WORD: Record<StepState, string> = { done: 'Done', open: 'Open', next: 'Next', locked: 'Locked' };

export function Progress({ passed, total, done, lessons }: { passed: number; total: number; done?: number; lessons?: number }) {
  const byLessons = lessons !== undefined && done !== undefined;
  const [now, max] = byLessons ? [done, lessons] : [passed, total];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div role="progressbar" aria-label={byLessons ? 'Lessons done' : 'Modules passed'} aria-valuemin={0} aria-valuemax={max} aria-valuenow={now} style={{ flex: '1 1 160px', maxWidth: 280, height: 7, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${max ? (now / max) * 100 : 0}%`, height: '100%', background: dt.brightGold, borderRadius: 99 }} />
      </div>
      <span className="nt20-num" style={{ fontSize: 14, fontWeight: 600, color: dt.body }}>
        {byLessons ? `${done} of ${lessons} lessons done · ` : ''}{passed} of {total} modules passed
      </span>
    </div>
  );
}

export function Notice({ tone, title, children, action }: { tone: 'rust' | 'green' | 'gold' | 'grey'; title: string; children?: ReactNode; action?: ReactNode }) {
  const [c, bg] = TONES[tone];
  return (
    <div role={tone === 'rust' ? 'alert' : 'status'} style={{ background: bg, borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0, flex: '1 1 260px' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, color: `color-mix(in srgb, ${c} 78%, black)` }}>{title}</p>
        {children && <div style={{ margin: '4px 0 0', fontSize: 14, lineHeight: 1.55, color: dt.body }}>{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, hint, error, children, count }: { label: string; hint?: string; error?: string; children: ReactNode; count?: string }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, fontWeight: 600, color: dt.textMuted, marginBottom: 6 }}>
        <span>{label}</span>
        {count && <span className="nt20-num" style={{ fontWeight: 500 }}>{count}</span>}
      </span>
      {children}
      {hint && !error && <span style={{ display: 'block', fontSize: 12.5, color: dt.textMuted, marginTop: 6 }}>{hint}</span>}
      {error && <span role="alert" style={{ display: 'block', fontSize: 13, color: dt.rust, marginTop: 6, fontWeight: 600 }}>{error}</span>}
    </label>
  );
}

export const input: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: 44, padding: '10px 13px', borderRadius: 9, border: `1px solid ${dt.inputBorder}`, background: dt.inputBg, fontSize: 16, fontFamily: dt.sans, color: dt.textPrimary };
export const inputError: CSSProperties = { ...input, border: `1px solid ${dt.rust}` };

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('input, textarea, button')?.focus();
  }, []);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose?.();
    if (e.key !== 'Tab' || !ref.current) return;
    const items = [...ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([readonly]), textarea, select')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,18,16,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <style>{GLOBAL_CSS}</style>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="nt20-dialog-title" onKeyDown={onKeyDown} onClick={(e) => e.stopPropagation()} className="nt20" style={{ width: 500, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', background: dt.cardBg, borderRadius: 16, padding: 'clamp(20px, 4vw, 30px)', boxShadow: '0 30px 70px -20px rgba(20,18,16,.6)', fontFamily: dt.sans, color: dt.textPrimary }}>
        <h2 id="nt20-dialog-title" style={{ ...h2, marginBottom: 6 }}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Loading() {
  return <div aria-busy="true" style={{ padding: '64px 0' }} />;
}

export function Rows({ children }: { children: ReactNode }) {
  return <div style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>{children}</div>;
}

export function Row({ children, first, style }: { children: ReactNode; first?: boolean; style?: CSSProperties }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '13px 16px', borderTop: first ? 'none' : `1px solid ${dt.rowDivider}`, ...style }}>{children}</div>;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function pct(n: number) {
  return `${Number.isInteger(n) ? n : n.toFixed(2)}%`;
}

type Inline = string | { b: Inline[] } | { i: Inline[] } | { a: string; c: Inline[] };

const SAFE_LINK = /^(https?:\/\/|mailto:|\/)/i;

function inline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /!\[([^\]]*)\]\([^)]*\)|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    if (m[0].startsWith('![')) out.push(m[1] ? `[image: ${m[1]}]` : '[image]');
    else if (m[2]) out.push({ b: inline(m[2]) });
    else if (m[3]) out.push({ i: inline(m[3]) });
    else out.push({ a: m[5], c: inline(m[4]) });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderInline(parts: Inline[]): ReactNode {
  return parts.map((p, i) => {
    if (typeof p === 'string') return <Fragment key={i}>{p}</Fragment>;
    if ('b' in p) return <strong key={i} style={{ fontWeight: 600 }}>{renderInline(p.b)}</strong>;
    if ('i' in p) return <em key={i}>{renderInline(p.i)}</em>;
    if (!SAFE_LINK.test(p.a)) return <span key={i}>{renderInline(p.c)}</span>;
    return <a key={i} href={p.a} target="_blank" rel="noopener noreferrer" style={{ color: dt.gold, fontWeight: 600 }}>{renderInline(p.c)}</a>;
  });
}

export function Markdown({ source, size = 18 }: { source: string; size?: number }) {
  const blocks = source.replace(/\r/g, '').split(/\n{2,}/);
  const body: CSSProperties = { fontFamily: dt.serif, fontSize: size, lineHeight: 1.65, color: dt.textPrimary, margin: '0 0 1em' };
  return (
    <div style={{ maxWidth: '34em' }}>
      {blocks.map((block, i) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith('## ')) return <h2 key={i} style={{ ...h3, fontSize: size + 4, margin: '1.5em 0 .5em' }}>{renderInline(inline(b.slice(3)))}</h2>;
        if (b.startsWith('### ')) return <h3 key={i} style={{ fontFamily: dt.sans, fontSize: size - 2, fontWeight: 700, margin: '1.4em 0 .4em' }}>{renderInline(inline(b.slice(4)))}</h3>;
        if (b.startsWith('> ')) return <blockquote key={i} style={{ ...body, fontStyle: 'italic', color: dt.body, margin: '0 0 1em', padding: '2px 0 2px 18px', borderLeft: `1px solid ${dt.brightGold}` }}>{renderInline(inline(b.replace(/^> ?/gm, '')))}</blockquote>;
        if (/^[-*] /.test(b)) return <ul key={i} style={{ ...body, paddingLeft: '1.2em', listStyle: 'disc' }}>{b.split('\n').map((l, j) => <li key={j} style={{ marginBottom: '.35em' }}>{renderInline(inline(l.replace(/^[-*] /, '')))}</li>)}</ul>;
        if (/^\d+\. /.test(b)) return <ol key={i} style={{ ...body, paddingLeft: '1.4em', listStyle: 'decimal' }}>{b.split('\n').map((l, j) => <li key={j} style={{ marginBottom: '.35em' }}>{renderInline(inline(l.replace(/^\d+\. /, '')))}</li>)}</ol>;
        return <p key={i} style={body}>{renderInline(inline(b.replace(/\n/g, ' ')))}</p>;
      })}
    </div>
  );
}
