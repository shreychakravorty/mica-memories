import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { loadJellyfinConfig, jellyfinFetch, signToken } from '../../shared/jellyfin.ts';

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in to view the archive.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const itemId = String(body.itemId || '').trim();
    if (!/^[a-zA-Z0-9]{1,64}$/.test(itemId)) return Response.json({ error: 'That video is unavailable.' }, { status: 400 });

    const config = await loadJellyfinConfig(base44);
    if (!config) return Response.json({ error: 'The video library is not connected yet.' }, { status: 503 });

    if (body.action === 'poster') {
      const upstream = await jellyfinFetch(config, `/Items/${itemId}/Images/Primary?maxWidth=520&quality=88`, {}, 15000);
      if (!upstream.ok) return Response.json({ dataUrl: null });
      const buffer = await upstream.arrayBuffer();
      const type = upstream.headers.get('content-type') || 'image/jpeg';
      return Response.json({ dataUrl: `data:${type};base64,${toBase64(buffer)}` });
    }

    if (body.action === 'play') {
      const token = await signToken(config.apiKey, itemId, 6 * 60 * 60);
      return Response.json({ url: `/functions/jellyfinStream?item=${encodeURIComponent(itemId)}&t=${token}` });
    }

    return Response.json({ error: 'Unknown request.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'This video could not be prepared for playback.' }, { status: 500 });
  }
}