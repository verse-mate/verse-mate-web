import { useEffect, useState } from 'react';
import {
  flattenJesusChronology,
  type JesusChronologyEntry,
} from '@/lib/jesusChronology';
import { fetchJesusEventLife } from '@/services/jesusService';

/**
 * The ordered arc, fetched once per Bible version.
 *
 * Every event page asks for it, and paging through events is exactly the case
 * where the same answer is wanted again a second later — so the in-flight
 * promise is shared rather than the request repeated per screen. The service
 * already swallows failures into an empty array, which lands here as "no
 * neighbours": the pager simply does nothing instead of the page erroring.
 */
const cache = new Map<string, Promise<JesusChronologyEntry[]>>();

function loadChronology(version: string): Promise<JesusChronologyEntry[]> {
  const key = version || 'default';
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchJesusEventLife(version).then(flattenJesusChronology);
    // A failed load must not be cached as the answer forever — the next screen
    // that asks should get a fresh attempt.
    pending.catch(() => cache.delete(key));
    cache.set(key, pending);
  }
  return pending;
}

export function useJesusChronology(version: string): JesusChronologyEntry[] {
  const [chronology, setChronology] = useState<JesusChronologyEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadChronology(version).then((entries) => {
      if (!cancelled) setChronology(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return chronology;
}
