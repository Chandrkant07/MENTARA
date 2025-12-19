import AutosaveQueue from '../src/utils/AutosaveQueue';

describe('AutosaveQueue', () => {
  const baseApi = 'http://localhost:8000/api';
  const attemptId = 'attempt-1';
  const headers = () => ({ 'Authorization': 'Bearer test', 'Content-Type': 'application/json' });

  beforeEach(() => { localStorage.clear(); global.fetch = jest.fn().mockResolvedValue({ ok: true }); });

  test('enqueue persists payloads', () => {
    const q = new AutosaveQueue({ baseApi, attemptId, getHeaders: headers });
    q.enqueue({ question_id: 1, answer: 'A', time_spent: 5, flagged: false });
    const raw = localStorage.getItem(`mentara_autosave_queue_${attemptId}`);
    expect(raw).toBeTruthy();
    const arr = JSON.parse(raw);
    expect(arr.length).toBe(1);
    expect(arr[0].payload.answer).toBe('A');
  });

  test('flush clears successful saves', async () => {
    const q = new AutosaveQueue({ baseApi, attemptId, getHeaders: headers });
    q.enqueue({ question_id: 1, answer: 'A', time_spent: 5, flagged: false });
    await q.flush();
    const raw = localStorage.getItem(`mentara_autosave_queue_${attemptId}`);
    expect(JSON.parse(raw)).toEqual([]);
    expect(fetch).toHaveBeenCalledWith(`${baseApi}/attempts/${attemptId}/save/`, expect.any(Object));
  });

  test('flush keeps failed items', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true });
    const q = new AutosaveQueue({ baseApi, attemptId, getHeaders: headers });
    q.enqueue({ question_id: 1, answer: 'A', time_spent: 5, flagged: false });
    await q.flush();
    const arr = JSON.parse(localStorage.getItem(`mentara_autosave_queue_${attemptId}`));
    expect(arr.length).toBe(1);
  });
});
