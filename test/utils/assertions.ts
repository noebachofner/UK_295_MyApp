export function getValidationMessages(body: unknown): string[] {
  expect(body).toBeDefined();
  expect(body).not.toBeNull();
  expect(typeof body).toBe('object');

  const msg = (body as { message?: unknown }).message;

  if (!Array.isArray(msg)) {
    throw new Error('Expected body.message to be an array');
  }

  const strings: string[] = [];
  for (const m of msg) {
    if (typeof m !== 'string') {
      throw new Error('Expected every message entry to be a string');
    }
    strings.push(m);
  }
  return strings;
}
