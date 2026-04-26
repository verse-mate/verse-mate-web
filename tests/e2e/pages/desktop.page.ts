import type { Page, Locator } from '@playwright/test';

/**
 * Page object for `DesktopLayout` (≥1024px viewports).
 *
 * DesktopLayout renders alongside the inner ReadingScreen `<Outlet />` and
 * exposes its own shared header and chrome (sidebar + drag-divider +
 * right panel for commentary or menu pages). Mobile and desktop chrome
 * coexist in the DOM (mobile is `display: none` via CSS at ≥1024px) so
 * the desktop chrome uses a `desktop-` prefix on every testid to avoid
 * strict-mode conflicts with mobile screen testids.
 */
export class DesktopReaderPage {
  readonly page: Page;
  readonly layoutRoot: Locator;
  readonly sidebar: Locator;
  readonly leftPanel: Locator;
  readonly rightPanel: Locator;
  readonly splitBody: Locator;
  readonly splitDivider: Locator;
  readonly chapterSelector: Locator;
  readonly hamburgerMenu: Locator;
  readonly tabSummary: Locator;
  readonly tabByline: Locator;
  readonly tabDetailed: Locator;

  constructor(page: Page) {
    this.page = page;
    this.layoutRoot = page.getByTestId('desktop-layout');
    this.sidebar = page.getByTestId('desktop-sidebar');
    this.leftPanel = page.getByTestId('desktop-left-panel');
    this.rightPanel = page.getByTestId('desktop-right-panel');
    this.splitBody = page.getByTestId('desktop-split-body');
    this.splitDivider = page.getByTestId('desktop-split-divider');
    this.chapterSelector = page.getByTestId('desktop-chapter-selector-button');
    this.hamburgerMenu = page.getByTestId('desktop-hamburger-menu-button');
    this.tabSummary = page.getByTestId('desktop-tab-summary');
    this.tabByline = page.getByTestId('desktop-tab-byline');
    this.tabDetailed = page.getByTestId('desktop-tab-detailed');
  }

  async goto(book = 'genesis', chapter: number = 1) {
    await this.page.goto(`/bible/${book}/${chapter}`);
    await this.layoutRoot.waitFor({ state: 'visible' });
  }

  /** Drag the split divider by `dx` pixels (relative). */
  async dragDivider(dx: number) {
    const box = await this.splitDivider.boundingBox();
    if (!box) throw new Error('Split divider not found');
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + dx, startY, { steps: 10 });
    await this.page.mouse.up();
  }
}
