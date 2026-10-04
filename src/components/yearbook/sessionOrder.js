const seed = crypto.getRandomValues(new Uint32Array(1))[0];
export const archiveSessionKey = seed;
function rank(id) {
  let value = seed;
  for (const char of String(id)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return (value ^ (value >>> 16)) >>> 0;
}
export function sessionOrder(comments) {
  return [...comments].sort((a, b) => rank(a.id) - rank(b.id) || String(a.id).localeCompare(String(b.id)));
}