import { useState, useEffect } from "react";

/**
 * Preloads an array of video URLs by fetching them as blobs.
 * Returns { ready, progress (0-1), objectUrls }.
 * Call revokeAll() on unmount to free memory.
 */
export function useVideoPreloader(urls: string[]) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!urls.length) { setReady(true); return; }

    let cancelled = false;
    const revoke: string[] = [];
    const result: Record<string, string> = {};
    let completed = 0;

    const load = async (url: string) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        if (cancelled) return;
        const obj = URL.createObjectURL(blob);
        revoke.push(obj);
        result[url] = obj;
      } catch {
        // If fetch fails just map to original URL so the game still works
        result[url] = url;
      }
      completed++;
      setProgress(completed / urls.length);
      if (completed === urls.length && !cancelled) {
        setObjectUrls({ ...result });
        setReady(true);
      }
    };

    urls.forEach(load);

    return () => {
      cancelled = true;
      revoke.forEach((u) => URL.revokeObjectURL(u));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join("|")]);

  return { ready, progress, objectUrls };
}
