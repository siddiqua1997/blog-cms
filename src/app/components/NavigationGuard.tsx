'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Prevents rapid double-click navigation by locking clicks briefly.
 */
export default function NavigationGuard() {
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const clearLock = () => {
      lockRef.current = false;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      document.body.removeAttribute('data-nav-lock');
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a');
      if (!link) return;
      if (link.getAttribute('target') === '_blank') return;
      if (link.getAttribute('download')) return;

      if (lockRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      lockRef.current = true;
      document.body.setAttribute('data-nav-lock', 'true');
      timerRef.current = window.setTimeout(() => {
        lockRef.current = false;
        document.body.removeAttribute('data-nav-lock');
        timerRef.current = null;
      }, 800);
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearLock();
    };
  }, []);

  useEffect(() => {
    lockRef.current = false;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    document.body.removeAttribute('data-nav-lock');
  }, [pathname, searchParams]);

  return null;
}
