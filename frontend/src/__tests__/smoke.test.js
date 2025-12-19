// Minimal Jest smoke tests (CommonJS) so `npm test` validates something.
// No DOM/React setup required.

describe('smoke', () => {
  test('basic arithmetic works', () => {
    expect(2 + 2).toBe(4);
  });

  test('environment sanity', () => {
    expect(typeof process).toBe('object');
  });
});
