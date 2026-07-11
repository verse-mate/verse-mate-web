import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';

/**
 * FeatureOnboarding — first-run onboarding shown the first time a visitor opens
 * the web app. Walks through seven screens: an opening verse-insight screen and
 * two intro screens carried over from the mobile app (rebuilt as desktop mocks),
 * the three reading features (Greek & Hebrew, the inductive study method, and
 * Visuals), and a closing "multiple languages, worldwide" screen — then never
 * shows again.
 *
 * Each screen is a hand-built, theme-reactive preview + a short explainer; no
 * baked-in slide images. Theme-reactive: every colour comes from `vmTokens`
 * (the same CSS-var tokens the rest of the app uses), so the flow renders in
 * light or dark to match the user's current theme with no extra wiring.
 */

const STORAGE_KEY = 'versemate-onboarding-seen';
// Companion cookie to the localStorage flag. localStorage can be wiped by
// privacy tooling (e.g. Safari's Intelligent Tracking Prevention caps
// script-writable storage) — a first-party cookie is a second, independent
// "you've been here before" signal so returning visitors don't get the
// instructional tour again. Either signal suppresses it. No login required.
const COOKIE_KEY = 'vm_onboarded';
// 400 days — the maximum lifetime modern browsers honor for a cookie.
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&');
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// True once the visitor has opened the app before (tour completed, skipped, or
// simply shown once) — recorded in localStorage AND a cookie; either counts.
function hasVisited(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return true;
  } catch {
    /* storage blocked — fall through to the cookie */
  }
  return readCookie(COOKIE_KEY) === '1';
}

// Record the visit in both stores so the tour never shows again — even if the
// visitor closes the tab mid-tour and even if one store is later cleared.
function markVisited(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* private mode — the cookie still records the visit */
  }
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_KEY}=1; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
    }
  } catch {
    /* ignore */
  }
}

// Faint scripture sample sitting behind the lexicon card preview.
const SCRIPTURE =
  'Consider it all joy, my brethren, when you encounter various trials, knowing that the testing of your faith produces endurance. And let endurance have its perfect result, so that you may be perfect and complete, lacking in nothing. But if any of you lacks wisdom, let him ask of God, who gives to all generously and without reproach, and it will be given to him.';

const goldTint = 'rgba(212, 176, 90, 0.14)';

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  return !hasVisited();
}

// ─────────────────────────── feature previews ───────────────────────────

function LexiconPreview({ centered = false }: { centered?: boolean }) {
  const label: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: vmTokens.gold,
    marginBottom: 6,
  };
  const sec: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${vmTokens.divider}`,
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: vmTokens.pageBg }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          padding: '26px 24px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 19,
          lineHeight: '31px',
          color: vmTokens.textPrimary,
          opacity: 0.16,
          overflow: 'hidden',
        }}
      >
        {SCRIPTURE}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: centered ? '50%' : 28,
          transform: centered ? 'translate(-50%, -50%)' : 'translateX(-50%)',
          width: 300,
          background: vmTokens.surfaceRaisedBg,
          border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
          borderRadius: 14,
          boxShadow: '0 22px 60px rgba(0,0,0,0.30)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px 11px', borderBottom: `1px solid ${vmTokens.divider}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 23,
                fontWeight: 500,
                color: vmTokens.textPrimary,
              }}
            >
              ἁπλῶς
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: vmTokens.gold }}>haplōs</span>
          </div>
          <div style={{ marginTop: 5, fontSize: 12, color: vmTokens.textTertiary }}>
            Adverb · G574 · hap-LOSE · 1× in NT
          </div>
        </div>
        <div style={sec}>
          <div style={label}>Basic sense</div>
          <div style={{ fontSize: 14, lineHeight: '20px', color: vmTokens.textPrimary }}>
            generously / single-mindedly / without reservation
          </div>
        </div>
        <div style={sec}>
          <div style={label}>Semantic range</div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              fontSize: 13,
              lineHeight: '21px',
              color: vmTokens.textPrimary,
            }}
          >
            <li>simply, without duplicity</li>
            <li>liberally, generously</li>
            <li>with sincere openness</li>
          </ul>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={label}>Related</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: vmTokens.textPrimary }}>
                ἁπλοῦς
              </span>
              <span style={{ fontSize: 12, color: vmTokens.gold, marginLeft: 7 }}>haplous</span>
              <div style={{ fontSize: 13, color: vmTokens.textSecondary, marginTop: 1 }}>
                adjective — single, undivided
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pills({ active }: { active: string }) {
  const items = ['Summary', 'By Line', 'Study', 'Visuals'];
  return (
    <div
      style={{
        background: vmTokens.pageBg,
        padding: '14px 14px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        {items.map((t) => {
          const on = t === active;
          return (
            <div
              key={t}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: on ? 600 : 500,
                color: on ? vmTokens.gold : vmTokens.textSecondary,
                background: on ? goldTint : 'transparent',
                padding: '7px 4px',
                borderRadius: 9,
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 22, flex: '0 0 auto' }}>
        <span style={{ height: 2, width: 20, background: vmTokens.textPrimary, borderRadius: 2 }} />
        <span style={{ height: 2, width: 20, background: vmTokens.textPrimary, borderRadius: 2 }} />
        <span style={{ height: 2, width: 20, background: vmTokens.textPrimary, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function StudyPreview({ centered = false }: { centered?: boolean }) {
  const Step = ({ n, title, cap, first }: { n: number; title: string; cap: string; first?: boolean }) => (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '14px 4px 14px 0',
        borderTop: first ? 'none' : `1px solid ${vmTokens.divider}`,
      }}
    >
      <div
        style={{
          flex: '0 0 auto',
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: vmTokens.gold,
          color: vmTokens.goldOnLight,
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>{title}</div>
          <span style={{ color: vmTokens.textTertiary, fontSize: 12 }}>▾</span>
        </div>
        <div
          style={{
            fontFamily: '"Roboto Serif", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            lineHeight: '20px',
            color: vmTokens.textSecondary,
            marginTop: 5,
          }}
        >
          {cap}
        </div>
      </div>
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: vmTokens.pageBg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: centered ? 'center' : 'flex-start',
      }}
    >
      <Pills active="Study" />
      <div style={{ padding: '18px 16px' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: vmTokens.gold,
          }}
        >
          Observation — 9 Inductive Steps
        </div>
        <div
          style={{
            marginTop: 14,
            background: vmTokens.surfaceRaisedBg,
            border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
            borderLeft: `2px solid ${vmTokens.gold}`,
            borderRadius: 10,
            padding: '14px 15px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>
              About the nine observation steps
            </div>
            <span style={{ color: vmTokens.textTertiary, fontSize: 12 }}>▴</span>
          </div>
          <div
            style={{
              fontFamily: '"Roboto Serif", Georgia, serif',
              fontSize: 14,
              lineHeight: '22px',
              color: vmTokens.textSecondary,
              marginTop: 10,
            }}
          >
            Observation asks what the text <i>says</i> — slowing down to mark the keywords,
            contrasts, repetitions, and structural cues the author left for you.
          </div>
        </div>
        <div style={{ marginTop: 6 }}>
          <Step n={1} first title="Begin with prayer" cap="Apart from the Holy Spirit's illumination this is just a method." />
          <Step n={2} title="Ask the 5 W's and an H" cap="Setting the table — author, audience, occasion." />
        </div>
      </div>
    </div>
  );
}

function SketchBoard({ sub, cc }: { sub: string; cc?: boolean }) {
  return (
    <div style={{ position: 'relative', height: 168, background: '#E9E3D2', overflow: 'hidden' }}>
      <svg
        viewBox="0 0 360 168"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden
      >
        <g stroke="#2b2620" strokeWidth={1.4} fill="none" opacity={0.5} strokeLinecap="round">
          <path d="M20 70 q14 -16 28 0 t28 0" />
          <circle cx="44" cy="108" r="9" />
          <path d="M44 117 l0 20 M44 124 l-10 6 M44 124 l10 6 M44 137 l-8 14 M44 137 l8 14" />
          <rect x="120" y="92" width="54" height="40" rx="3" />
          <path d="M120 92 l27 -16 l27 16" />
          <circle cx="300" cy="60" r="11" />
          <path d="M300 71 l0 22 M300 78 l-11 7 M300 78 l11 7 M300 93 l-9 16 M300 93 l9 16" />
          <path d="M220 120 q20 -14 40 0" />
          <path d="M250 40 l8 -14 l8 14 z" />
          <path d="M30 150 q40 -10 80 0 t80 0 t80 0" />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: '0.04em',
          color: '#2b2620',
        }}
      >
        THE LETTER OF JAMES
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#2b2620',
          opacity: 0.8,
        }}
      >
        {sub}
      </div>
      {cc && (
        <div
          style={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            background: 'rgba(0,0,0,0.55)',
            color: '#e9d9a8',
            fontSize: 9,
            fontWeight: 600,
            padding: '3px 7px',
            borderRadius: 5,
          }}
        >
          BibleProject · CC BY-SA 4.0
        </div>
      )}
    </div>
  );
}

function VisualsPreview({ centered = false }: { centered?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: vmTokens.pageBg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: centered ? 'center' : 'flex-start',
      }}
    >
      <Pills active="Visuals" />
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontFamily: '"Roboto Serif", Georgia, serif',
              fontSize: 21,
              fontWeight: 600,
              color: vmTokens.textPrimary,
            }}
          >
            Visuals for James 1
          </div>
          <div style={{ display: 'flex', gap: 14, color: vmTokens.textSecondary }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
              <path d="M12 16V3M8 7l4-4 4 4" />
            </svg>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 13,
            overflow: 'hidden',
            border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
            position: 'relative',
          }}
        >
          <SketchBoard sub="12 TEACHINGS · WHOLEHEARTED DEVOTION TO JESUS" />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '46%',
              transform: 'translate(-50%,-50%)',
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            <span
              style={{
                width: 0,
                height: 0,
                borderLeft: '18px solid #1B1B1B',
                borderTop: '11px solid transparent',
                borderBottom: '11px solid transparent',
                marginLeft: 4,
              }}
            />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 14px' }}>
            <div
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 600,
                textAlign: 'center',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}
            >
              James — Overview
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.88)',
                fontSize: 11,
                textAlign: 'center',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                marginTop: 2,
              }}
            >
              BibleProject overview · animated explainer
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              background: 'rgba(0,0,0,0.55)',
              color: '#e9d9a8',
              fontSize: 9,
              fontWeight: 600,
              padding: '3px 7px',
              borderRadius: 5,
            }}
          >
            BibleProject · CC BY-SA 4.0
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 13,
            overflow: 'hidden',
            border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
          }}
        >
          <SketchBoard sub="INTRODUCTION · READ SCRIPTURE" cc />
          <div
            style={{
              padding: '11px 14px',
              fontSize: 14,
              fontWeight: 500,
              color: vmTokens.textPrimary,
              background: vmTokens.surfaceRaisedBg,
            }}
          >
            BibleProject — Read Scripture: James
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── segmented toggle / pill row shared by the welcome-screen mocks ───────

function Seg({
  items,
  active,
  small,
  inline,
}: {
  items: string[];
  active: string;
  small?: boolean;
  inline?: boolean;
}) {
  return (
    <div
      style={{
        display: inline ? 'inline-flex' : 'flex',
        background: 'rgba(127,127,127,0.14)',
        borderRadius: 999,
        padding: 3,
        gap: 2,
      }}
    >
      {items.map((t) => {
        const on = t === active;
        return (
          <span
            key={t}
            style={{
              flex: inline ? '0 0 auto' : 1,
              textAlign: 'center',
              fontSize: small ? 11 : 12,
              fontWeight: on ? 700 : 500,
              color: on ? vmTokens.goldOnLight : vmTokens.textSecondary,
              background: on ? vmTokens.gold : 'transparent',
              borderRadius: 999,
              padding: small ? '4px 11px' : '7px 10px',
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}

// Faint scripture wash reused as the backdrop behind floating card mocks.
function ScriptureWash() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        padding: '26px 24px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 19,
        lineHeight: '31px',
        color: vmTokens.textPrimary,
        opacity: 0.1,
        overflow: 'hidden',
      }}
    >
      {SCRIPTURE}
    </div>
  );
}

// Shared style for a floating card centred (desktop) / pinned near top (mobile).
function floatCard(centered: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    left: '50%',
    top: centered ? '50%' : 26,
    transform: centered ? 'translate(-50%, -50%)' : 'translateX(-50%)',
    width: 320,
    background: vmTokens.surfaceRaisedBg,
    border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
    borderRadius: 16,
    boxShadow: '0 22px 60px rgba(0,0,0,0.30)',
    overflow: 'hidden',
  };
}

// Understand at every level: Insight → By Line analysis.
function UnderstandPreview({ centered = false }: { centered?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: vmTokens.pageBg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: centered ? 'center' : 'flex-start',
      }}
    >
      <div style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Seg items={['Bible', 'Insight']} active="Insight" inline small />
        </div>
        <div style={{ marginTop: 12 }}>
          <Seg items={['Summary', 'By Line', 'Detailed']} active="By Line" />
        </div>
        <div style={{ height: 2, background: vmTokens.gold, opacity: 0.5, marginTop: 12, borderRadius: 2 }} />
        <div style={{ marginTop: 16, fontSize: 15, fontWeight: 700, color: vmTokens.textPrimary }}>
          Line-by-Line Analysis of Genesis 1
        </div>
        <div style={{ marginTop: 14, fontSize: 12, fontWeight: 600, color: vmTokens.textSecondary }}>
          Genesis 1:1
        </div>
        <div
          style={{
            marginTop: 8,
            borderLeft: `2px solid ${vmTokens.gold}`,
            background: goldTint,
            borderRadius: '0 8px 8px 0',
            padding: '10px 13px',
            fontFamily: '"Roboto Serif", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 14,
            lineHeight: '21px',
            color: vmTokens.textPrimary,
          }}
        >
          In the beginning God created the heavens and the earth.
        </div>
        <div style={{ marginTop: 12, fontSize: 13, lineHeight: '21px', color: vmTokens.textSecondary }}>
          This opening says God is the uncaused origin of everything — He started time, space, and matter,
          bringing something from nothing.
        </div>
      </div>
    </div>
  );
}

// Explore the bigger story: the Topics search.
function ExplorePreview({ centered = false }: { centered?: boolean }) {
  const row = (title: string, desc: string, first?: boolean) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 2px',
        borderTop: first ? 'none' : `1px solid ${vmTokens.divider}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>{title}</div>
        <div style={{ fontSize: 12, lineHeight: '17px', color: vmTokens.textSecondary, marginTop: 2 }}>{desc}</div>
      </div>
      <span style={{ color: vmTokens.textTertiary, fontSize: 18, flex: '0 0 auto' }}>›</span>
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: vmTokens.pageBg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: centered ? 'center' : 'flex-start',
      }}
    >
      <div style={{ padding: '18px 16px' }}>
        <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: vmTokens.textPrimary, marginBottom: 12 }}>
          Search
        </div>
        <Seg items={['Old Testament', 'New Testament', 'Topics']} active="Topics" small />
        <div style={{ marginTop: 8 }}>
          <Seg items={['Events', 'Prophecies', 'Parables', 'Themes']} active="Prophecies" small />
        </div>
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(127,127,127,0.12)',
            borderRadius: 10,
            padding: '9px 12px',
            color: vmTokens.textTertiary,
            fontSize: 13,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          Filter topics…
        </div>
        <div style={{ marginTop: 6 }}>
          {row('Protoevangelium: The Seed of the Woman', 'God foretells that the woman’s seed will crush the serpent’s head, hinting at a future Redeemer.', true)}
          {row('Blessing to All Nations through Abraham', 'God promises Abraham that all nations will be blessed through his offspring.')}
          {row('The Scepter from Judah', 'Jacob prophesies a ruler will come from Judah to whom the nations belong.')}
        </div>
      </div>
    </div>
  );
}

// Multiple languages, worldwide: dotted globe + language chips.
function LanguagesPreview({ centered = false }: { centered?: boolean }) {
  const chips = ['English', 'Español', 'Português', 'Français', 'Deutsch', '中文', '한국어', 'العربية', 'हिन्दी'];
  const pins: [number, number][] = [[30, 70], [170, 78], [40, 140], [165, 120], [100, 40], [120, 150], [70, 110]];
  const dust: [number, number][] = [[60, 60], [140, 60], [80, 90], [120, 90], [100, 120], [60, 130], [150, 140], [90, 62], [112, 132]];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: vmTokens.pageBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 28px',
        gap: 24,
      }}
    >
      <svg viewBox="0 0 200 200" width={188} height={188} aria-hidden>
        <circle cx="100" cy="100" r="86" fill="none" stroke={vmTokens.gold} strokeOpacity="0.35" strokeWidth="1.2" />
        <ellipse cx="100" cy="100" rx="34" ry="86" fill="none" stroke={vmTokens.gold} strokeOpacity="0.18" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="68" ry="86" fill="none" stroke={vmTokens.gold} strokeOpacity="0.12" strokeWidth="1" />
        <line x1="14" y1="100" x2="186" y2="100" stroke={vmTokens.gold} strokeOpacity="0.18" strokeWidth="1" />
        <path d="M30 70 Q100 30 170 78" fill="none" stroke={vmTokens.gold} strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
        <path d="M40 140 Q110 175 165 120" fill="none" stroke={vmTokens.gold} strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
        {dust.map(([x, y], i) => (
          <circle key={`d${i}`} cx={x} cy={y} r="1.6" fill={vmTokens.textTertiary} opacity={0.5} />
        ))}
        {pins.map(([x, y], i) => (
          <circle key={`p${i}`} cx={x} cy={y} r="4" fill={vmTokens.gold} />
        ))}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 300 }}>
        {chips.map((c, i) => (
          <span
            key={c}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: i === 0 ? vmTokens.goldOnLight : vmTokens.textSecondary,
              background: i === 0 ? vmTokens.gold : 'transparent',
              border: `1px solid ${i === 0 ? vmTokens.gold : vmTokens.surfaceRaisedBorder}`,
              borderRadius: 999,
              padding: '6px 12px',
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

// Explore any book / any verse: the Verse Insight card.
function VerseInsightPreview({ centered = false }: { centered?: boolean }) {
  const btn = (label: string) => (
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 600,
        color: vmTokens.textPrimary,
        background: vmTokens.pageBg,
        border: `1px solid ${vmTokens.divider}`,
        borderRadius: 9,
        padding: '9px 6px',
      }}
    >
      {label}
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: vmTokens.pageBg }}>
      <ScriptureWash />
      <div style={floatCard(centered)}>
        <div
          style={{
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: vmTokens.gold,
            borderBottom: `1px solid ${vmTokens.divider}`,
          }}
        >
          Verse Insight
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: vmTokens.textPrimary }}>Genesis 1:1</div>
          <div
            style={{
              marginTop: 6,
              fontFamily: '"Roboto Serif", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 14,
              lineHeight: '21px',
              color: vmTokens.textSecondary,
            }}
          >
            “In the beginning God created the heavens and the earth.”
          </div>
          <div style={{ marginTop: 13, fontSize: 12, fontWeight: 700, color: vmTokens.textPrimary }}>Analysis</div>
          <div
            style={{
              marginTop: 7,
              border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
              borderRadius: 10,
              padding: '11px 13px',
              fontSize: 13,
              lineHeight: '20px',
              color: vmTokens.textSecondary,
            }}
          >
            This opening says God is the uncaused origin of everything. In Hebrew, the word{' '}
            <b style={{ color: vmTokens.textPrimary }}>bara</b> means He creates by His own power; the subject is{' '}
            <b style={{ color: vmTokens.textPrimary }}>Elohim</b>, the mighty God above the universe.
          </div>
        </div>
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {btn('Copy')}
            {btn('Share')}
          </div>
          {btn('Save as My Highlight')}
        </div>
      </div>
    </div>
  );
}

interface Feature {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  Preview: (props: { centered?: boolean }) => JSX.Element;
}

const FEATURES: Feature[] = [
  {
    id: 'verse',
    eyebrow: 'Verse Insight',
    title: 'Explore any book. Any verse.',
    desc: 'Tap any verse to open Verse Insight — a focused take on what it means, the key original-language words, and how it connects to the rest of Scripture.',
    Preview: VerseInsightPreview,
  },
  {
    id: 'levels',
    eyebrow: 'Layered Insight',
    title: 'Understand Scripture at every level',
    desc: 'Turn on Insight and choose how deep you want to go — a quick summary, a verse-by-verse walkthrough, or a detailed analysis.',
    Preview: UnderstandPreview,
  },
  {
    id: 'topics',
    eyebrow: 'Topics & Themes',
    title: 'Explore the bigger story',
    desc: 'Look beyond a single chapter — browse the events, prophecies, parables, and themes that trace one connected story across the whole Bible.',
    Preview: ExplorePreview,
  },
  {
    id: 'lexicon',
    eyebrow: 'Original Languages',
    title: 'Greek & Hebrew, one tap away',
    desc: 'Tap any highlighted word to reveal its original-language definition — Strong’s number, pronunciation, semantic range, and related words. Read Scripture in the language it was written.',
    Preview: LexiconPreview,
  },
  {
    id: 'study',
    eyebrow: 'Guided Study',
    title: 'The inductive method, step by step',
    desc: 'Work through the proven 9-step Precept method: observe what the text says, interpret what it means, then apply it. Each chapter unfolds as guided, collapsible steps.',
    Preview: StudyPreview,
  },
  {
    id: 'visuals',
    eyebrow: 'Visual Learning',
    title: 'See the whole book at a glance',
    desc: 'Watch animated overviews and explore hand-drawn visual summaries for every book — from BibleProject, Insight for Living, and VerseMate originals. Tap any image to zoom in.',
    Preview: VisualsPreview,
  },
  {
    id: 'languages',
    eyebrow: 'For Everyone',
    title: 'Multiple languages. Always free. Worldwide.',
    desc: 'VerseMate speaks your language and is free for everyone, everywhere — no subscription, no paywall, wherever you are.',
    Preview: LanguagesPreview,
  },
];

export default function FeatureOnboarding() {
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [visible, setVisible] = useState<boolean>(() => shouldShow());
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Don't cover transient auth / redirect routes.
  const onAuthRoute =
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/create-account') ||
    location.pathname.startsWith('/logout');

  const open = visible && !onAuthRoute;

  const finish = useCallback(() => {
    setVisible(false);
    markVisited();
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= FEATURES.length - 1) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [finish]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Record the visit the moment the tour is shown — not only when it's
  // completed/skipped. That way a returning visitor who saw it once (even if
  // they closed the tab mid-tour) won't get it again. The current session's
  // tour stays open via React state until they dismiss it.
  useEffect(() => {
    if (open) markVisited();
  }, [open]);

  // Lock background scroll + focus the overlay for keyboard nav while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlayRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const last = index === FEATURES.length - 1;
  const feature = FEATURES[index];
  const { Preview } = feature;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') finish();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -45) next();
    else if (dx > 45) prev();
  };

  const copy = (titleSize: number) => (
    <div>
      <div
        style={{
          color: vmTokens.gold,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        {feature.eyebrow}
      </div>
      <div
        style={{
          fontFamily: '"Roboto Serif", Georgia, serif',
          fontWeight: 600,
          fontSize: titleSize,
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
          color: vmTokens.textPrimary,
          marginTop: 12,
        }}
      >
        {feature.title}
      </div>
      <div
        style={{
          fontSize: titleSize >= 30 ? 16 : 15,
          lineHeight: titleSize >= 30 ? '26px' : '23px',
          color: vmTokens.textSecondary,
          marginTop: 14,
          maxWidth: 400,
        }}
      >
        {feature.desc}
      </div>
    </div>
  );

  const dots = (
    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
      {FEATURES.map((f, i) => (
        <span
          key={f.id}
          style={{
            display: 'block',
            height: 7,
            width: i === index ? 22 : 7,
            borderRadius: 9,
            background: i === index ? vmTokens.gold : vmTokens.textTertiary,
            opacity: i === index ? 1 : 0.5,
            transition: 'width 0.2s ease',
          }}
        />
      ))}
    </div>
  );

  const actions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      {!last && (
        <button
          type="button"
          onClick={finish}
          style={{
            background: 'none',
            border: 'none',
            color: vmTokens.textSecondary,
            fontSize: 15,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
            padding: '8px 4px',
          }}
        >
          Skip
        </button>
      )}
      <button
        type="button"
        onClick={next}
        style={{
          background: vmTokens.gold,
          color: vmTokens.goldOnLight,
          border: 'none',
          borderRadius: 11,
          padding: '13px 24px',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {last ? 'Start reading' : 'Next'}
      </button>
    </div>
  );

  // ── Desktop: centred landscape modal (preview left, copy right) ──
  if (isDesktop) {
    return (
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to VerseMate"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Roboto, system-ui, sans-serif',
          outline: 'none',
        }}
      >
        <div
          style={{
            width: 'min(960px, 94vw)',
            height: 'min(600px, 88vh)',
            display: 'flex',
            background: vmTokens.pageBg,
            borderRadius: 22,
            overflow: 'hidden',
            border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
            boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
          }}
        >
          <div
            style={{
              flex: '1.05',
              position: 'relative',
              overflow: 'hidden',
              borderRight: `1px solid ${vmTokens.divider}`,
              background: vmTokens.pageBg,
            }}
          >
            <Preview centered />
          </div>
          <div
            style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '48px 44px',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={finish}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: vmTokens.textTertiary,
                cursor: 'pointer',
                padding: 8,
                lineHeight: 0,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {copy(31)}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 40,
              }}
            >
              {dots}
              {actions}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile: full-screen vertical splash ──
  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="What's new in VerseMate"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: vmTokens.pageBg,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Roboto, system-ui, sans-serif',
        outline: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div style={{ flex: '0 0 auto', padding: '28px 24px 0' }}>
          <div
            style={{
              height: 'min(466px, 52vh)',
              minHeight: 320,
              borderRadius: 20,
              overflow: 'hidden',
              border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
              boxShadow: '0 12px 44px rgba(0,0,0,0.22)',
              position: 'relative',
              background: vmTokens.pageBg,
            }}
          >
            <Preview />
          </div>
          <div style={{ paddingTop: 28 }}>{copy(26)}</div>
        </div>

        <div
          style={{
            flex: '1 0 auto',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '24px 24px 28px',
            minHeight: 90,
          }}
        >
          {dots}
          {actions}
        </div>
      </div>
    </div>
  );
}
