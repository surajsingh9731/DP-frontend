/** Reuse a command key for the same payload after an uncertain response; store no payload text. */
export async function storedActionKey(
  prefix: string,
  tenantId: string,
  action: string,
  payload: object,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const fingerprint = Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('');
  const storageKey = `${prefix}:${tenantId}:${action}:${fingerprint}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const key = crypto.randomUUID();
  sessionStorage.setItem(storageKey, key);
  return key;
}
