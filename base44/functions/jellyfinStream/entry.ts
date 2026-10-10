import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { loadJellyfinConfig, verifyToken, jellyfinHeaders } from '../../shared/jellyfin.ts';

// Each request serves a bounded chunk so a long film is streamed as a series of
// short, resumable range requests rather than one very long connection.
const CHUNK_BYTES = 4 * 1024 * 1024;

export default async function (req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const itemId = String(url.searchParams.get('item') || '');
    const token = url.searchParams.get('t') || '';
    if (!/^[a-zA-Z0-9]{1,64}$/.test(itemId)) return new Response('Not found', { status: 404 });

    const base44 = createClientFromRequest(req);
    const config = await loadJellyfinConfig(base44);
    if (!config) return new Response('Not connected', { status: 503 });
    if (!(await verifyToken(config.apiKey, itemId, token))) return new Response('Forbidden', { status: 403 });

    const rangeHeader = req.headers.get('range') || '';
    const match = /bytes=(\d+)-/.exec(rangeHeader);
    const start = match ? Number(match[1]) : 0;
    const end = start + CHUNK_BYTES - 1;

    const upstream = await fetch(`${config.url}/Videos/${itemId}/stream?static=true`, {
      headers: { ...jellyfinHeaders(config), Range: `bytes=${start}-${end}`, Accept: '*/*' },
      signal: AbortSignal.timeout(120000)
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response('Unavailable', { status: 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'private, no-store');

    const contentRange = upstream.headers.get('content-range');
    const contentLength = upstream.headers.get('content-length');
    if (contentRange) {
      headers.set('Content-Range', contentRange);
      if (contentLength) headers.set('Content-Length', contentLength);
      return new Response(upstream.body, { status: 206, headers });
    }

    if (contentLength) {
      const length = Number(contentLength);
      headers.set('Content-Range', `bytes ${start}-${start + length - 1}/*`);
      headers.set('Content-Length', contentLength);
    }
    return new Response(upstream.body, { status: upstream.status === 206 ? 206 : 200, headers });
  } catch (error) {
    return new Response('Stream error', { status: 502 });
  }
}