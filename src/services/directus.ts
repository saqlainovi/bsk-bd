import { createDirectus, rest, readItems, readItem, createItem, updateItem, staticToken } from '@directus/sdk';
import { ParsedPage } from '../types';

// Directus API URL from environment variable or fallback
const DIRECTUS_URL = (import.meta as any).env?.VITE_DIRECTUS_URL || 'https://directus.ovisoft.tech';
const DIRECTUS_TOKEN = (import.meta as any).env?.VITE_DIRECTUS_STATIC_TOKEN || '';

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
 * Helper to map raw Directus record (e.g. from bskdb or website_pages) to ParsedPage
 */
function mapRawToParsedPage(item: any): ParsedPage {
  const id = item.page_id || item.id || item.slug || '';
  const titleBn = item.title || item.title_bn || item.name || id;
  const contentText = typeof item.content === 'string' ? item.content : JSON.stringify(item.content || '');

  return {
    id,
    title_bn: titleBn,
    title_en: item.title_en || titleBn,
    html_title: `${titleBn} - বিশ্বসাহিত্য কেন্দ্র`,
    category: item.category || 'general',
    sections: item.sections && Array.isArray(item.sections) ? item.sections : [
      {
        title: titleBn,
        content: contentText ? [contentText] : []
      }
    ],
    updated_at: item.date_updated || item.date_created || new Date().toISOString()
  };
}

/**
 * Fetch all pages from Directus (`bskdb` or `website_pages` collections)
 */
export async function fetchDirectusPages(): Promise<ParsedPage[] | null> {
  if (!directusClient) return null;
  
  // Try fetching from bskdb first
  try {
    const response = await directusClient.request(
      readItems('bskdb' as any, {
        fields: ['*'],
        limit: 200
      })
    );
    if (response && Array.isArray(response) && response.length > 0) {
      console.log(`[Directus] Loaded ${response.length} pages from 'bskdb' collection.`);
      return response.map(mapRawToParsedPage);
    }
  } catch (err) {
    console.log('[Directus] bskdb query attempt:', err);
  }

  // Fallback to website_pages if bskdb is empty or not found
  try {
    const response = await directusClient.request(
      readItems('website_pages' as any, {
        fields: ['*'],
        limit: 200
      })
    );
    if (response && Array.isArray(response) && response.length > 0) {
      return response.map(mapRawToParsedPage);
    }
  } catch (err) {
    console.warn('[Directus] website_pages query attempt:', err);
  }

  return null;
}

/**
 * Fetch a single page by slug/id
 */
export async function fetchDirectusPage(slug: string): Promise<ParsedPage | null> {
  if (!directusClient) return null;
  try {
    // Try from bskdb by page_id filter
    const response = await directusClient.request(
      readItems('bskdb' as any, {
        filter: { page_id: { _eq: slug } },
        limit: 1
      })
    );
    if (response && Array.isArray(response) && response.length > 0) {
      return mapRawToParsedPage(response[0]);
    }
  } catch (err) {
    // ignore
  }

  try {
    const fallback = await directusClient.request(
      readItem('website_pages' as any, slug)
    );
    if (fallback) return mapRawToParsedPage(fallback);
  } catch (err) {
    console.warn(`[Directus] Could not fetch page '${slug}':`, err);
  }
  return null;
}

/**
 * Sync/Save a page to Directus `bskdb` collection directly from Admin CMS
 */
export async function syncPageToDirectus(page: Partial<ParsedPage>): Promise<boolean> {
  if (!directusClient || !page.id) return false;
  try {
    const pageId = page.id;
    const title = page.title_bn || page.title_en || pageId;
    const contentText = page.sections?.map(s => (s.title ? s.title + ': ' : '') + (Array.isArray(s.content) ? s.content.join(' ') : s.content)).join('\n\n') || '';

    // Check if item exists in bskdb
    const existing = await directusClient.request(
      readItems('bskdb' as any, {
        filter: { page_id: { _eq: pageId } },
        limit: 1
      })
    );

    if (existing && Array.isArray(existing) && existing.length > 0) {
      const recordId = (existing[0] as any).id;
      await directusClient.request(
        updateItem('bskdb' as any, recordId, {
          title,
          category: page.category || (existing[0] as any).category || 'main',
          content: contentText,
          status: 'published'
        })
      );
    } else {
      await directusClient.request(
        createItem('bskdb' as any, {
          page_id: pageId,
          title,
          category: page.category || 'main',
          content: contentText,
          status: 'published'
        })
      );
    }
    return true;
  } catch (err) {
    console.warn('[Directus] syncPageToDirectus failed:', err);
    return false;
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
