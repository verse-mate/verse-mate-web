import { useEffect, useState } from 'react';
import { Play, X, Copy, Check } from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import { vmTokens } from '@/styles/themeStyles';

type Visual = {
  id: string;
  title: string;
  caption: string;
  thumb: string;
  full: string;
  attribution: { label: string; href: string };
  /** Optional download link (PDF) shown on the lightbox. */
  download?: { label: string; href: string };
};

type Props = {
  book: string;
  bookId: number | null;
  chapter: number;
};

// BibleProject "Book of James Summary: A Complete Animated Overview" — CC BY-SA 4.0.
// YouTube is the most reliable cross-browser embed source for their videos.
const BP_VIDEO_YT_ID = 'qn-hLHWwRYY';
const BP_VIDEO_EMBED = `https://www.youtube-nocookie.com/embed/${BP_VIDEO_YT_ID}?autoplay=1&rel=0&modestbranding=1`;
const BP_VIDEO_PAGE = 'https://bibleproject.com/videos/james/';

const JAMES_VISUALS: Visual[] = [
  {
    id: 'bp-poster',
    title: 'BibleProject — Read Scripture: James',
    caption:
      'Hand-illustrated single-page overview: introduction, twelve teachings on wholehearted devotion to Jesus, cross-references to the Sermon on the Mount.',
    thumb: '/visuals/james/bibleproject_james_poster.jpg',
    full: '/visuals/james/bibleproject_james_poster.jpg',
    attribution: {
      label: 'BibleProject · CC BY-SA 4.0',
      href: 'https://bibleproject.com/guides/book-of-james/',
    },
  },
  {
    id: 'swindoll-chart',
    title: 'Chuck Swindoll — Structural Chart',
    caption:
      "Divides James into major sections, anchoring each with theme and key verse. From Insight for Living's free Bible charts.",
    thumb: '/visuals/james/swindoll_james_chart.png',
    full: '/visuals/james/swindoll_james_chart.png',
    attribution: {
      label: 'Insight for Living Ministries',
      href: 'https://insight.org/resources/bible/the-general-epistles/james',
    },
    download: {
      label: 'Original PDF',
      href: 'https://cdn.iflmedia.com/pdf/bible-charts/James-Bible-chart.pdf',
    },
  },
  {
    id: 'vm-parallels',
    title: 'VerseMate Original — James & Proverbs',
    caption:
      'Twelve thematic parallels in NASB 1995 showing how James drew his teaching from Solomon’s wisdom well.',
    thumb: '/visuals/james/versemate_james_proverbs_parallels.png',
    full: '/visuals/james/versemate_james_proverbs_parallels.png',
    attribution: { label: 'VerseMate Original', href: '#' },
    download: {
      label: 'Print-ready PDF',
      href: '/visuals/james/versemate_james_proverbs_parallels.pdf',
    },
  },
  {
    id: 'vm-heatmap',
    title: 'VerseMate Original — Architecture of James',
    caption:
      'Dot-matrix heatmap of faith, works, tongue, and wisdom across all 108 verses. Chapter 2 = the faith/works debate; chapter 3 = the tongue treatise.',
    thumb: '/visuals/james/versemate_james_keyword_heatmap.png',
    full: '/visuals/james/versemate_james_keyword_heatmap.png',
    attribution: { label: 'VerseMate Original', href: '#' },
    download: {
      label: 'Print-ready PDF',
      href: '/visuals/james/versemate_james_keyword_heatmap.pdf',
    },
  },
];

export default function VisualsPanel({ book, chapter }: Props) {
  const [openImageId, setOpenImageId] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const visuals = JAMES_VISUALS;
  const openImage = visuals.find((v) => v.id === openImageId) ?? null;

  // Clear modals when book/chapter changes — the YouTube iframe unmounts
  // with the modal so playback stops automatically.
  useEffect(() => {
    setOpenImageId(null);
    setVideoOpen(false);
    setZoomed(false);
  }, [book, chapter]);

  // Reset zoom when switching between images or closing the lightbox.
  useEffect(() => {
    setZoomed(false);
  }, [openImageId]);

  // Close any open modal on Escape.
  useEffect(() => {
    if (!openImageId && !videoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenImageId(null);
        setVideoOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openImageId, videoOpen]);

  const shareText = () => {
    const lines = [
      `Visuals for ${book} ${chapter}`,
      '',
      `Video: ${BP_VIDEO_PAGE}`,
      '',
      ...visuals.flatMap((v) => [`${v.title} — ${v.caption}`, `Source: ${v.attribution.label}`, '']),
    ];
    return lines.join('\n').trim();
  };

  const handleCopy = async () => {
    try {
      const text = shareText();
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleShare = () => {
    navigator
      .share?.({
        title: `Visuals for ${book} ${chapter}`,
        text: shareText(),
        url: window.location.href,
      })
      .catch(() => {});
  };

  return (
    <div>
      {/* Toolbar — title + copy/share, matches the Study tab pattern. */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 700,
            fontSize: 20,
            lineHeight: '28px',
            color: vmTokens.textPrimary,
            margin: 0,
          }}
        >
          Visuals for {book} {chapter}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={handleCopy}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Copy visuals reference list"
            data-testid="copy-visuals-button"
          >
            {copied ? (
              <Check size={20} color={vmTokens.gold} strokeWidth={2} />
            ) : (
              <Copy size={20} color={vmTokens.textPrimary} strokeWidth={1.5} />
            )}
          </button>
          <button
            onClick={handleShare}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Share visuals"
            data-testid="share-visuals-button"
          >
            <ShareIcon size={20} color={vmTokens.textPrimary} />
          </button>
        </div>
      </div>

      {/* Video card — full-width, clickable, opens overlay player. */}
      <button
        onClick={() => setVideoOpen(true)}
        data-testid="visuals-video-card"
        aria-label="Play the BibleProject Book of James overview video"
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          position: 'relative',
          border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          padding: 0,
          background: vmTokens.surfaceRaisedBg,
          marginBottom: 8,
        }}
      >
        <img
          src="/visuals/james/bibleproject_james_poster.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: vmTokens.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
            }}
          >
            <Play size={28} color="#1B1B1B" fill="#1B1B1B" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 700,
                fontSize: 18,
                color: '#FAF6EA',
                marginBottom: 2,
              }}
            >
              Book of James — Overview
            </div>
            <div
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 13,
                color: 'rgba(250,246,234,0.85)',
              }}
            >
              8 min · animated explainer
            </div>
          </div>
        </div>
        {/* Tiny attribution corner badge — keeps CC BY-SA 4.0 credit on
            the video card without crowding the layout below. */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(0,0,0,0.55)',
            color: 'rgba(250,246,234,0.9)',
            padding: '2px 8px',
            borderRadius: 4,
            fontFamily: 'Roboto, sans-serif',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: 0.2,
            pointerEvents: 'none',
          }}
        >
          BibleProject · CC BY-SA 4.0
        </div>
      </button>
      {/* Video attribution is shown as a small corner badge on the video card
          itself (see below) and again inside the play overlay; no separate
          attribution row below the card. Spacer keeps the image grid from
          colliding with the card. */}
      <div style={{ height: 20 }} />

      {/* Image grid — 2 columns on tablet/desktop, 1 on narrow mobile. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {visuals.map((v) => (
          <button
            key={v.id}
            onClick={() => setOpenImageId(v.id)}
            data-testid={`visuals-card-${v.id}`}
            aria-label={`Expand ${v.title}`}
            style={{
              background: vmTokens.surfaceRaisedBg,
              border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
              borderRadius: 12,
              padding: 0,
              textAlign: 'left',
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                background: vmTokens.pageBg,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={v.thumb}
                alt={v.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              {/* Corner attribution badge — small, dark, doesn't fight the image. */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  background: 'rgba(0,0,0,0.55)',
                  color: 'rgba(250,246,234,0.9)',
                  padding: '2px 7px',
                  borderRadius: 4,
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  pointerEvents: 'none',
                  maxWidth: '70%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.attribution.label}
              </div>
            </div>
            <div style={{ padding: '8px 12px 10px' }}>
              <div
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  color: vmTokens.textPrimary,
                  lineHeight: '18px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {v.title}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Minimal credit line — full attribution lives on each card's badge
          and inside the lightbox; this is the catch-all required by CC BY-SA. */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 10,
          borderTop: `1px solid ${vmTokens.divider}`,
          fontFamily: 'Roboto, sans-serif',
          fontSize: 10.5,
          color: vmTokens.textSecondary,
          lineHeight: '14px',
          opacity: 0.75,
        }}
      >
        Credits: BibleProject (
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: vmTokens.textSecondary, textDecoration: 'underline' }}
        >
          CC BY-SA 4.0
        </a>
        ) · Insight for Living · VerseMate originals
      </div>

      {/* === Video Modal === */}
      {videoOpen && (
        <Overlay onClose={() => setVideoOpen(false)} testId="visuals-video-overlay">
          <div
            style={{
              width: '100%',
              maxWidth: 960,
              background: '#000',
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClose={() => setVideoOpen(false)} />
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%' /* 16:9 */,
                background: '#000',
              }}
            >
              <iframe
                src={BP_VIDEO_EMBED}
                title="Book of James — BibleProject Overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                data-testid="visuals-video-iframe"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
              />
            </div>
            <div
              style={{
                padding: '10px 16px',
                background: '#000',
                color: 'rgba(250,246,234,0.75)',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              Video by{' '}
              <a
                href={BP_VIDEO_PAGE}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: vmTokens.gold, textDecoration: 'none' }}
              >
                BibleProject
              </a>{' '}
              · CC BY-SA 4.0
            </div>
          </div>
        </Overlay>
      )}

      {/* === Image Lightbox — image-first, minimal chrome === */}
      {openImage && (
        <Overlay onClose={() => setOpenImageId(null)} testId="visuals-image-overlay" fill>
          <div
            style={{
              width: '100vw',
              height: '100vh',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thin top bar: title + download + close. No card chrome below. */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#FAF6EA',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {openImage.title}
              </div>
              {openImage.download && (
                <a
                  href={openImage.download.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#FAF6EA',
                    background: 'rgba(0,0,0,0.55)',
                    border: `1px solid ${vmTokens.gold}`,
                    padding: '4px 10px',
                    borderRadius: 4,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  data-testid="visuals-lightbox-download"
                >
                  PDF ↓
                </a>
              )}
              <button
                onClick={() => setOpenImageId(null)}
                aria-label="Close"
                data-testid="visuals-overlay-close"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={20} color="#FAF6EA" />
              </button>
            </div>

            {/* Image area — fills the entire viewport. Click toggles between
                fit-to-screen and 1:1 native size (which scrolls). Mobile
                browsers can also pinch-zoom natively via touch-action. */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                alignItems: zoomed ? 'flex-start' : 'center',
                justifyContent: zoomed ? 'flex-start' : 'center',
                touchAction: 'pinch-zoom',
                WebkitOverflowScrolling: 'touch',
              }}
              onClick={() => setZoomed((z) => !z)}
            >
              <img
                src={openImage.full}
                alt={openImage.title}
                draggable={false}
                style={
                  zoomed
                    ? {
                        width: 'auto',
                        maxWidth: 'none',
                        height: 'auto',
                        cursor: 'zoom-out',
                        display: 'block',
                        userSelect: 'none',
                      }
                    : {
                        maxWidth: '100%',
                        maxHeight: '100%',
                        height: 'auto',
                        cursor: 'zoom-in',
                        display: 'block',
                        objectFit: 'contain',
                        userSelect: 'none',
                      }
                }
              />
            </div>

            {/* Tiny corner attribution — required by CC BY-SA but unobtrusive. */}
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                zIndex: 3,
                fontFamily: 'Roboto, sans-serif',
                fontSize: 10,
                color: 'rgba(250,246,234,0.85)',
                background: 'rgba(0,0,0,0.55)',
                padding: '3px 8px',
                borderRadius: 4,
                pointerEvents: 'auto',
              }}
            >
              <a
                href={openImage.attribution.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {openImage.attribution.label}
              </a>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({
  children,
  onClose,
  testId,
  fill,
}: {
  children: React.ReactNode;
  onClose: () => void;
  testId?: string;
  /** Fully-opaque dark backdrop — used for the image lightbox where we
   *  want zero bleed-through from the underlying gallery. */
  fill?: boolean;
}) {
  return (
    <div
      onClick={onClose}
      data-testid={testId}
      style={{
        position: 'fixed',
        inset: 0,
        background: fill ? '#0a0a0a' : 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: fill ? 0 : 16,
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      data-testid="visuals-overlay-close"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <X size={22} color="#FAF6EA" />
    </button>
  );
}
