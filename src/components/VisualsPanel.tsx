import { useEffect, useMemo, useState } from 'react';
import { Play, X, Copy, Check, ZoomIn, Minimize2 } from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import { vmTokens } from '@/styles/themeStyles';
import {
  getVisualsForBook,
  getVideoForChapter,
  type VisualCard,
} from '@/data/visuals/registry';

type Props = {
  book: string;
  bookId: number | null;
  chapter: number;
};

export default function VisualsPanel({ book, chapter }: Props) {
  const [openImageId, setOpenImageId] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // Per-book manifest from the generated registry. Falls back to null when
  // the user lands on a book without curated visuals — we show an empty
  // state instead of crashing.
  const manifest = useMemo(() => getVisualsForBook(book), [book]);
  const visuals: VisualCard[] = manifest?.cards ?? [];
  // Pick the BibleProject overview whose chapter range covers the current
  // chapter — Genesis 5 → Part 1 (1–11), Genesis 25 → Part 2 (12–50).
  const video = useMemo(
    () => getVideoForChapter(manifest, chapter),
    [manifest, chapter],
  );
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
      ...(video ? [`Video: ${video.page}`, ''] : []),
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

  // Empty state — book has no curated visuals yet. Shouldn't normally
  // appear because the Visuals tab is gated on BOOKS_WITH_VISUALS, but
  // we render a graceful message instead of a blank page just in case
  // the registry and the tab-gate ever drift apart.
  if (!manifest) {
    return (
      <div style={{ paddingTop: 32, textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 700,
            fontSize: 20,
            color: vmTokens.textPrimary,
            marginBottom: 12,
          }}
        >
          Visuals for {book} {chapter}
        </h2>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: vmTokens.textSecondary }}>
          No curated visuals for this book yet.
        </p>
      </div>
    );
  }

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

      {/* Video card — only rendered when a YouTube ID is known for this
          book. (The James launch had a verified ID; we'll add more book
          videos as they're verified into the registry.) */}
      {video && (
      <button
        onClick={() => setVideoOpen(true)}
        data-testid="visuals-video-card"
        aria-label={`Play the BibleProject ${book} overview video`}
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
          src={visuals[0]?.thumb ?? ''}
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
              {video.title}
            </div>
            <div
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 13,
                color: 'rgba(250,246,234,0.85)',
              }}
            >
              BibleProject overview · animated explainer
            </div>
            <div
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 11,
                color: 'rgba(250,246,234,0.75)',
                marginTop: 4,
              }}
            >
              Covers chapters {video.chapterStart}–{video.chapterEnd}
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
      )}
      {/* Spacer between the video card (when shown) and the image grid. */}
      <div style={{ height: video ? 20 : 0 }} />

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
      {videoOpen && video && (
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
                src={video.embedUrl}
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
                href={video.page}
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
              {/* Zoom toggle — explicit control so the user is never trapped
                  in zoom mode with no obvious way out. Clicking the image
                  enters zoom; this button (or pressing Escape) exits. */}
              <button
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? 'Fit to screen' : 'Zoom to actual size'}
                title={zoomed ? 'Fit to screen' : 'Zoom in'}
                data-testid="visuals-lightbox-zoom-toggle"
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
                {zoomed ? (
                  <Minimize2 size={18} color="#FAF6EA" />
                ) : (
                  <ZoomIn size={18} color="#FAF6EA" />
                )}
              </button>
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

            {/* Image area — fills the entire viewport.
             *  - Fit mode: tap the image to zoom to 1:1 (the container
             *    becomes scrollable so the user can read fine print).
             *  - Zoom mode: tapping the image does NOT toggle back —
             *    otherwise it would fight the user trying to scroll/pan.
             *    Exit via the "fit screen" button in the top bar, by
             *    tapping the dead space outside the image, or Esc.
             *
             *  touch-action: pan-x pan-y pinch-zoom — explicitly allow
             *  single-finger pan AND two-finger pinch. The earlier
             *  `touch-action: pinch-zoom` blocked single-finger pan,
             *  which on mobile meant you couldn't scroll the zoomed
             *  image with one finger. */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                alignItems: zoomed ? 'flex-start' : 'center',
                justifyContent: zoomed ? 'flex-start' : 'center',
                touchAction: 'pan-x pan-y pinch-zoom',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  if (zoomed) setZoomed(false);
                  else setOpenImageId(null);
                }
              }}
            >
              <img
                src={openImage.full}
                alt={openImage.title}
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!zoomed) setZoomed(true);
                }}
                style={
                  zoomed
                    ? {
                        width: 'auto',
                        maxWidth: 'none',
                        height: 'auto',
                        cursor: 'grab',
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
