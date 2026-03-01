const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export interface WebsiteSettings {
  name: string | null;
  logo: string | null;
}

export async function fetchWebsiteSettings(): Promise<WebsiteSettings> {
  const res = await fetch(`${API_BASE}/api/website-settings/`);
  if (!res.ok) throw new Error("Failed to fetch website settings");
  return res.json();
}
