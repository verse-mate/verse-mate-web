/**
 * The Jesus event's right-pane tabs.
 *
 * Deliberately the same four the Bible side uses, so the pill group in the
 * header means the same thing wherever the reader is. They live here rather
 * than in `JesusViewContext` so that context file only exports components and
 * hooks — which is what keeps fast refresh working for it.
 */
export const JESUS_TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'byline', label: 'By-Line' },
  { id: 'study', label: 'Study' },
  { id: 'compare', label: 'Compare' },
] as const;

export type JesusTab = (typeof JESUS_TABS)[number]['id'];

export function isJesusTab(value: string | null): value is JesusTab {
  return !!value && JESUS_TABS.some((t) => t.id === value);
}
