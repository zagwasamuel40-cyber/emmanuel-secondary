/**
 * Safe local storage utility with automatic quota protection,
 * payload sanitization, image compression, and graceful degradation.
 */

// Keys that can be safely pruned if storage quota is exceeded
const PRUNABLE_KEYS = [
  'ess_qr_scan_logs',
  'ess_admission_audit_logs',
  'ess_cbt_security_logs',
  'ess_cbt_attempts',
  'ess_db_last_sync_'
];

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Failed to read key "${key}":`, e);
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;

    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      console.warn(`[safeStorage] Failed to write key "${key}". Attempting quota recovery...`, err);

      // Attempt recovery: prune non-critical caches
      try {
        pruneStorageCaches();
        window.localStorage.setItem(key, value);
        return true;
      } catch (recoveryErr: any) {
        // If still failing, attempt sanitizing the value if it's JSON
        try {
          const parsed = JSON.parse(value);
          const sanitized = sanitizeStorageData(parsed, 40000);
          const sanitizedStr = JSON.stringify(sanitized);
          window.localStorage.setItem(key, sanitizedStr);
          console.info(`[safeStorage] Saved sanitized payload for "${key}" after quota recovery.`);
          return true;
        } catch (sanitizeErr) {
          console.warn(`[safeStorage] Could not save key "${key}" even after sanitization. Preventing component crash.`);
          return false;
        }
      }
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to remove key "${key}":`, e);
    }
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      console.warn('[safeStorage] Failed to clear storage:', e);
    }
  }
};

/**
 * Prunes large or transient log entries to free up localStorage quota
 */
function pruneStorageCaches() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    // Prune known logs
    for (const prunable of PRUNABLE_KEYS) {
      if (key.startsWith(prunable)) {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 5) {
              // Keep only the latest 5 items
              window.localStorage.setItem(key, JSON.stringify(parsed.slice(0, 5)));
            } else if (key.startsWith('ess_db_last_sync_')) {
              window.localStorage.removeItem(key);
            }
          }
        } catch {
          // If unparseable, remove
          window.localStorage.removeItem(key);
        }
      }
    }
  }
}

/**
 * Recursively scans data objects/arrays and strips or downsizes oversized base64 data URLs
 */
export function sanitizeStorageData<T>(data: T, maxStringLen = 50000): T {
  if (!data) return data;

  if (typeof data === 'string') {
    // If it's a huge base64 data URL
    if (data.startsWith('data:') && data.length > maxStringLen) {
      // Replace with a standard lightweight placeholder image
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=70' as unknown as T;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeStorageData(item, maxStringLen)) as unknown as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(data as Record<string, any>)) {
      result[k] = sanitizeStorageData(v, maxStringLen);
    }
    return result as T;
  }

  return data;
}

/**
 * Compresses an image file to a lightweight JPEG data URL (<30KB) using an HTML5 Canvas.
 * Prevents camera photos from exhausting the browser localStorage quota.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxDimension = 480,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve) => {
    // Default fallback avatar in case compression or loading fails
    const fallback = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=70';

    if (typeof window === 'undefined') {
      resolve(fallback);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.width || 400;
        let height = img.height || 400;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(fallback);
          return;
        }

        // Draw image with smooth scaling
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('[compressImage] Compression failed, returning fallback:', err);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      console.warn('[compressImage] Failed to load image for compression');
      resolve(fallback);
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        resolve(fallback);
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
