export default async function handler(request, response) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.authorization !== `Bearer ${secret}`) {
    return response.status(401).json({ ok: false });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return response.status(500).json({ ok: false, error: "Supabase server environment is missing" });
  try {
    const result = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000)
    });
    if (!result.ok) return response.status(502).json({ ok: false, status: result.status });
    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ ok: false });
  }
}
