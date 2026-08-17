/**
 * Safely cache list data to localStorage without exceeding quota by stripping huge base64 strings.
 */
export function safeCacheData(key: string, list: any[]) {
  try {
    // 1. First try to save as-is
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e: any) {
    if (
      e.name === 'QuotaExceededError' || 
      e.code === 22 || 
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      String(e).includes('quota')
    ) {
      console.warn(`LocalStorage quota exceeded for key "${key}". Stripping large data-URIs and retrying...`);
      try {
        // 2. Strip large data-URI values (e.g. PDFs, base64 images)
        const cleanedList = list.map(item => {
          const newItem = { ...item };
          for (const prop in newItem) {
            if (Object.prototype.hasOwnProperty.call(newItem, prop)) {
              const value = newItem[prop];
              if (typeof value === 'string' && value.startsWith('data:') && value.length > 2000) {
                // Replace large data URIs with empty string
                newItem[prop] = '';
              } else if (Array.isArray(value)) {
                // If it's an array of photos, filter or strip large data URIs
                newItem[prop] = value.map(val => 
                  (typeof val === 'string' && val.startsWith('data:') && val.length > 2000) ? '' : val
                ).filter(Boolean);
              }
            }
          }
          return newItem;
        });
        localStorage.setItem(key, JSON.stringify(cleanedList));
      } catch (retryErr) {
        console.error(`Failed to cache even after stripping large properties for key "${key}":`, retryErr);
        // Clear this key entirely if it fails to prevent corrupted JSON
        try {
          localStorage.removeItem(key);
        } catch (_) {}
      }
    } else {
      console.error(`Error saving to localStorage for key "${key}":`, e);
    }
  }
}
