const PROBE = 'vm_storage_probe';

export function storageAvailable(win: Window): boolean {
  try {
    win.localStorage.setItem(PROBE, '1');
    win.localStorage.removeItem(PROBE);
    win.document.cookie = `${PROBE}=1; path=/; SameSite=Lax`;
    const cookieKept = win.document.cookie.includes(`${PROBE}=1`);
    win.document.cookie = `${PROBE}=; path=/; max-age=0; SameSite=Lax`;
    return cookieKept;
  } catch {
    return false;
  }
}
