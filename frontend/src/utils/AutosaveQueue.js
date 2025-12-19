export default class AutosaveQueue {
  constructor({ baseApi, attemptId, getHeaders, onFlushSuccess }) {
    this.baseApi = baseApi;
    this.attemptId = attemptId;
    this.getHeaders = getHeaders;
    this.onFlushSuccess = onFlushSuccess;
    this.key = `mentara_autosave_queue_${attemptId}`;
    this.loop = null;
    this.flush = this.flush.bind(this);
    window.addEventListener('online', this.flush);
  }
  readQueue() { try { const raw = localStorage.getItem(this.key); return raw ? JSON.parse(raw) : []; } catch { return []; } }
  writeQueue(arr) { try { localStorage.setItem(this.key, JSON.stringify(arr)); } catch {} }
  enqueue(payload) { const q = this.readQueue(); q.push({ payload, ts: Date.now() }); this.writeQueue(q); }
  async flush() {
    const q = this.readQueue(); if (!q.length) return;
    const remaining = [];
    for (const item of q) {
      try {
        const res = await fetch(`${this.baseApi}/attempts/${this.attemptId}/save/`, { method: 'POST', headers: this.getHeaders(), body: JSON.stringify(item.payload) });
        if (!res.ok) throw new Error('save failed');
      } catch { remaining.push(item); }
    }
    this.writeQueue(remaining);
    if (remaining.length === 0 && typeof this.onFlushSuccess === 'function') this.onFlushSuccess();
  }
  startRetryLoop() { if (this.loop) return; this.loop = setInterval(() => { if (navigator.onLine) this.flush(); }, 5000); }
  stopRetryLoop() { if (this.loop) clearInterval(this.loop); this.loop = null; window.removeEventListener('online', this.flush); }
}
