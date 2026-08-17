import { createDirectus, rest, readItems, readItem, createItem, staticToken } from '@directus/sdk';
import { ParsedPage } from '../types';

// Directus API URL from environment variable or fallback
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || '';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_STATIC_TOKEN || '';

/**
 * Directus client instance with REST features
 */
export const directusClient = (() => {
  if (!DIRECTUS_URL) return null;
  try {
    const client = createDirectus(DIRECTUS_URL).with(rest());
    if (DIRECTUS_TOKEN) {
      return client.with(staticToken(DIRECTUS_TOKEN));
    }
    return client;
  } catch (err) {
    console.warn('[Directus] Failed to initialize Directus client:', err);
    return null;
  }
})();

/**
 * Check if Directus is configured and active
 */
export function isDirectusEnabled(): boolean {
  return Boolean(DIRECTUS_URL && directusClient);
}

/**
 * Resolve directus image asset URL
 */
export function getDirectusAssetUrl(assetIdOrPath?: string): string {
  if (!assetIdOrPath) return '';
  if (assetIdOrPath.startsWith('http://') || assetIdOrPath.startsWith('https://') || assetIdOrPath.startsWith('/')) {
    return assetIdOrPath;
  }
  if (!DIRECTUS_URL) return assetIdOrPath;
  return `${DIRECTUS_URL.replace(/\/$/, '')}/assets/${assetIdOrPath}`;
}

/**
 * Fetch all pages from Directus `website_pages` collection
 */
export async function fetchDirectusPages(): Promise<ParsedPage[] | null> {
  if (!directusClient) return null;
  try {
    const response = await directusClient.request(
      readItems('website_pages' as any, {
        fields: ['*'],
        limit: 100,
        sort: ['sort_order' as any]
      })
    );
    return response as unknown as ParsedPage[];
  } catch (err) {
    console.warn('[Directus] Could not fetch pages from Directus, falling back to local dataset:', err);
    return null;
  }
}

/**
 * Fetch a single page by slug/id
 */
export async function fetchDirectusPage(slug: string): Promise<ParsedPage | null> {
  if (!directusClient) return null;
  try {
    const response = await directusClient.request(
      readItem('website_pages' as any, slug)
    );
    return response as unknown as ParsedPage;
  } catch (err) {
    console.warn(`[Directus] Could not fetch page '${slug}':`, err);
    return null;
  }
}

/**
 * Fetch Hero slides from Directus
 */
export async function fetchDirectusHeroSlides(): Promise<any[] | null> {
  if (!directusClient) return null;
  try {
    const response = await directusClient.request(
      readItems('hero_slides' as any, {
        fields: ['*'],
        filter: { status: { _eq: 'published' } },
        sort: ['sort_order' as any]
      })
    );
    return response as any[];
  } catch (err) {
    return null;
  }
}

/**
 * Fetch Notices from Directus
 */
export async function fetchDirectusNotices(): Promise<any[] | null> {
  if (!directusClient) return null;
  try {
    const response = await directusClient.request(
      readItems('notices' as any, {
        fields: ['*'],
        sort: ['-publish_date' as any]
      })
    );
    return response as any[];
  } catch (err) {
    return null;
  }
}

/**
 * Submit inquiry or application form to Directus `inquiries` collection
 */
export async function submitDirectusInquiry(data: Record<string, any>): Promise<boolean> {
  if (!directusClient) return false;
  try {
    await directusClient.request(
      createItem('inquiries' as any, {
        ...data,
        submitted_at: new Date().toISOString()
      })
    );
    return true;
  } catch (err) {
    console.error('[Directus] Failed to submit inquiry:', err);
    return false;
  }
}
