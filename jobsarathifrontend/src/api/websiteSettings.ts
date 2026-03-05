const rawBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const API_BASE = String(rawBase).replace(/\/+$/, '');

export interface WebsiteSettings {
  name: string | null;
  logo: string | null;
}

export async function fetchWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/api/website-settings/`, { credentials: 'omit' });
    if (!res.ok) {
      console.warn('Website settings responded with non-OK status:', res.status);
      return { name: null, logo: null };
    }
    return (await res.json()) as WebsiteSettings;
  } catch (e) {
    console.warn('Website settings fetch failed:', e);
    return { name: null, logo: null };
  }
}
