export async function fetchAccessLevelClient(): Promise<'ADMIN'|'MANAGER'|'BASIC_PLUS'|'BASIC2'|'BASIC1'|'BASIC'|null> {
  try {
    const res = await fetch('/api/me/access', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.accessLevel ?? null;
  } catch {
    return null;
  }
}
