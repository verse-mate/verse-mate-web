import { ImageResponse } from 'workers-og';

import type { Language } from './config';
import bold from './fonts/Roboto-Bold.subset.ttf';
import regular from './fonts/Roboto-Regular.subset.ttf';
import { pageName } from './head';
import type { Indexing } from './indexing';
import { LABELS } from './labels';
import type { ChapterPage } from './pageData';
import { firstParagraph, firstSentence } from './text';

const WIDTH = 1200;
const HEIGHT = 630;

type Node = { type: string; props: Record<string, unknown> };

const node = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

export function matchCard(pathname: string) {
  const match = pathname.match(/^\/og\/bible\/([^/]+)\/([^/]+)\.png$/);
  return match ? { kind: 'chapter' as const, bookParam: match[1], chapterParam: match[2] } : null;
}

export function cardLine(data: ChapterPage, lang: Language, indexing: Indexing) {
  const line = indexing.explained ? firstSentence(firstParagraph(data.summary), 140) : '';
  return line || LABELS[lang].chapterDescription(pageName(data));
}

function toBase64(bytes: ArrayBuffer) {
  let binary = '';
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i += 0x8000) binary += String.fromCharCode(...view.subarray(i, i + 0x8000));
  return btoa(binary);
}

export async function renderCard(data: ChapterPage, lang: Language, indexing: Indexing, logo: ArrayBuffer | null) {
  const wordmark = logo
    ? node('img', { width: 208, height: 56 }, undefined, { src: `data:image/png;base64,${toBase64(logo)}`, width: 208, height: 56 })
    : node('div', { fontSize: 44, fontWeight: 700, color: '#ffffff' }, 'VerseMate');
  const element = node(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: '#1B1B1B',
      fontFamily: 'Roboto',
    },
    [
      wordmark,
      node('div', { display: 'flex', flexDirection: 'column' }, [
        node('div', { fontSize: 104, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }, pageName(data)),
        node('div', { marginTop: 28, fontSize: 40, fontWeight: 400, color: '#d9d2c3', lineHeight: 1.35 }, cardLine(data, lang, indexing)),
      ]),
      node('div', { display: 'flex', alignItems: 'center' }, [
        node('div', { width: 64, height: 6, backgroundColor: '#b09a6d', marginRight: 24 }),
        node('div', { fontSize: 28, color: '#b09a6d' }, 'app.versemate.org'),
      ]),
    ],
  );
  const response = new ImageResponse(element as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Roboto', data: regular, weight: 400, style: 'normal' },
      { name: 'Roboto', data: bold, weight: 700, style: 'normal' },
    ],
  });
  return response.arrayBuffer();
}
