// Shared Jellyfin helpers: server-side only. The server address and API key are
// read from the MediaSetting record (never readable by app users) and never
// leave the backend.

const encoder = new TextEncoder();

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function signToken(secret, value, ttlSeconds) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${expires}.${await hmacHex(secret, `${value}|${expires}`)}`;
}

export async function verifyToken(secret, value, token) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [expiresPart, signature] = token.split('.');
  const expires = Number(expiresPart);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(secret, `${value}|${expires}`);
  return expected === signature;
}

export async function loadJellyfinConfig(base44) {
  const result = await base44.asServiceRole.entities.MediaSetting.list('-updated_date', 1);
  const row = Array.isArray(result) ? result[0] : result && result.items ? result.items[0] : null;
  const url = String((row && row.jellyfin_url) || '').trim().replace(/\/+$/, '');
  const apiKey = String((row && row.jellyfin_api_key) || '').trim();
  if (!url || !apiKey) return null;
  return { url, apiKey, userId: String((row && row.jellyfin_user_id) || '').trim() };
}

export async function saveJellyfinConfig(base44, values) {
  const result = await base44.asServiceRole.entities.MediaSetting.list('-updated_date', 1);
  const row = Array.isArray(result) ? result[0] : result && result.items ? result.items[0] : null;
  if (row) {
    await base44.asServiceRole.entities.MediaSetting.update(row.id, values);
    return row.id;
  }
  const created = await base44.asServiceRole.entities.MediaSetting.create(values);
  return created && created.id;
}

export function jellyfinHeaders(config) {
  return {
    'X-Emby-Token': config.apiKey,
    Authorization: `MediaBrowser Token="${config.apiKey}"`,
    Accept: 'application/json'
  };
}

export async function jellyfinFetch(config, path, init = {}, timeoutMs = 12000) {
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: { ...jellyfinHeaders(config), ...(init.headers || {}) },
    signal: AbortSignal.timeout(timeoutMs)
  });
  return response;
}

export async function jellyfinJson(config, path) {
  const response = await jellyfinFetch(config, path);
  if (!response.ok) throw new Error(`Jellyfin responded with ${response.status}`);
  return response.json();
}

export async function resolveJellyfinUserId(config) {
  if (config.userId) return config.userId;
  const users = await jellyfinJson(config, '/Users');
  const first = Array.isArray(users) ? users[0] : null;
  if (!first || !first.Id) throw new Error('No Jellyfin user is available for browsing.');
  return first.Id;
}

export function ticksToMinutes(ticks) {
  const value = Number(ticks);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.max(1, Math.round(value / 600000000));
}