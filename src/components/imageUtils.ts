import { getApiUrl } from '../services/cpanelApi';

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  let normalized = url.trim();
  
  // If it's a full URL or data URI, return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized;
  }
  
  // Remove duplicate leading slashes if any
  normalized = normalized.replace(/^\/+/, '/');
  
  // Ensure starts with a slash
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  // Replace case variations of assets/imgs/ or assets/Imgs/ with assets/IMGS/
  normalized = normalized.replace(/\/assets\/imgs\//gi, '/assets/IMGS/');
  
  // Replace LIBRARY/ or library/ or libary/ with LIBARY/ inside assets/IMGS/
  normalized = normalized.replace(/\/assets\/IMGS\/library\//gi, '/assets/IMGS/LIBARY/');
  normalized = normalized.replace(/\/assets\/IMGS\/LIBRARY\//gi, '/assets/IMGS/LIBARY/');
  normalized = normalized.replace(/\/assets\/IMGS\/libary\//gi, '/assets/IMGS/LIBARY/');
  
  return normalized;
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  let trimmed = url.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('./')) {
    trimmed = trimmed.substring(2);
  } else if (trimmed.startsWith('/')) {
    trimmed = trimmed.substring(1);
  }

  if (trimmed.startsWith('uploads/')) {
    try {
      const apiUrl = getApiUrl();
      if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
        const baseUrl = apiUrl.substring(0, apiUrl.lastIndexOf('/'));
        return `${baseUrl}/${trimmed}`;
      }
    } catch (_) {}
    return '/' + trimmed;
  }

  return normalizeImageUrl('/' + trimmed);
}

