import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useHitTestPassthrough<T extends HTMLElement>(isExpandedOrMenuOpen: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    let rafId: number;
    let lastRect = { x: 0, y: 0, width: 0, height: 0 };

    const syncRect = () => {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect();
        // Expand hit box slightly if a custom popdown flyout is open
        const extraHeight = isExpandedOrMenuOpen ? 90 : 0;
        if (
          Math.abs(r.x - lastRect.x) > 1 ||
          Math.abs(r.y - lastRect.y) > 1 ||
          Math.abs(r.width - lastRect.width) > 1 ||
          Math.abs(r.height + extraHeight - lastRect.height) > 1
        ) {
          lastRect = {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height + extraHeight,
          };
          try {
            if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
              invoke('update_pill_hit_rect', { rect: lastRect }).catch(() => {});
            }
          } catch {
            // Ignore non-Tauri preview environments
          }
        }
      }
      rafId = requestAnimationFrame(syncRect);
    };

    rafId = requestAnimationFrame(syncRect);
    return () => cancelAnimationFrame(rafId);
  }, [isExpandedOrMenuOpen]);

  return ref;
}
