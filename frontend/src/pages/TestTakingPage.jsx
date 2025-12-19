import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ProgressRing from '../components/ProgressRing';
import AutosaveQueue from '../utils/AutosaveQueue';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import '../styles/test-taking.css';

const BASE_API = (import.meta.env.VITE_BASE_API || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

const getToken = () => localStorage.getItem('access_token');
const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

const LSK = {
  ATTEMPT_STATE: (attemptId) => `mentara_attempt_${attemptId}_state`,
};

const initialQuestionState = () => ({
  currentIndex: 0,
  answers: {},
  flagged: {},
  times: {},
  lastSavedAt: null,
  savedMessage: '',
});

function secondsUntil(isoString) {
  const end = new Date(isoString).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}

function restoreState(attemptId) {
  try { const raw = localStorage.getItem(LSK.ATTEMPT_STATE(attemptId)); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function persistState(attemptId, state) {
  try { localStorage.setItem(LSK.ATTEMPT_STATE(attemptId), JSON.stringify(state)); } catch {}
}

function TestTakingPage({ examId }) {
  const [attemptId, setAttemptId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [state, setState] = useState(initialQuestionState());
  const [globalSeconds, setGlobalSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const autosaveQueueRef = useRef(null);
  const autosaveIntervalRef = useRef(null);
  const perQuestionTickRef = useRef(null);
  const prefetchControllersRef = useRef([]);

  const currentQuestion = questions[state.currentIndex] || null;
  const totalQuestions = questions.length;
  const answeredCount = useMemo(() => questions.filter(q => state.answers[q.id] != null && state.answers[q.id] !== '').length, [questions, state.answers]);
  const flaggedCount = useMemo(() => questions.filter(q => state.flagged[q.id]).length, [questions, state.flagged]);

  useEffect(() => {
    return () => {
      prefetchControllersRef.current.forEach(ctrl => ctrl.abort());
      if (autosaveIntervalRef.current) clearInterval(autosaveIntervalRef.current);
      if (perQuestionTickRef.current) clearInterval(perQuestionTickRef.current);
      autosaveQueueRef.current?.stopRetryLoop();
    };
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BASE_API}/exams/${examId}/start/`, { headers: authHeaders(), signal: ctrl.signal });
        if (!res.ok) throw new Error('start failed');
        const data = await res.json();
        setAttemptId(data.attempt_id);
        setExpiresAt(data.expires_at);
        setQuestions(data.questions || []);
        setGlobalSeconds(secondsUntil(data.expires_at));

        autosaveQueueRef.current = new AutosaveQueue({ baseApi: BASE_API, attemptId: data.attempt_id, getHeaders: authHeaders, onFlushSuccess: () => setState(s => ({ ...s, savedMessage: 'All saves synced' })) });
        autosaveQueueRef.current.startRetryLoop();

        try {
          const resumeRes = await fetch(`${BASE_API}/attempts/${data.attempt_id}/resume/`, { headers: authHeaders() });
          if (resumeRes.ok) {
            const resume = await resumeRes.json();
            setState(s => ({ ...s, answers: resume.answers || s.answers, times: resume.times || s.times, flagged: resume.flagged || s.flagged }));
          }
        } catch {}

        prefetchNextTwo(data.questions, 0);
        startTimers();
      } catch (e) {
        setState(s => ({ ...s, savedMessage: 'Failed to start exam' }));
      }
    })();
    return () => ctrl.abort();
  }, [examId]);

  function startTimers() {
    if (perQuestionTickRef.current) clearInterval(perQuestionTickRef.current);
    perQuestionTickRef.current = setInterval(() => {
      setState(s => {
        const q = questions[s.currentIndex];
        if (!q) return s;
        const times = { ...s.times };
        times[q.id] = (times[q.id] || 0) + 1;
        return { ...s, times };
      });
    }, 1000);

    if (autosaveIntervalRef.current) clearInterval(autosaveIntervalRef.current);
    autosaveIntervalRef.current = setInterval(() => {
      setGlobalSeconds(prev => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) doSubmit();
        return next;
      });
      autosave();
    }, 1000);
  }

  function prefetchNextTwo(qs, index) {
    const ctrl = new AbortController();
    prefetchControllersRef.current.push(ctrl);
    // If per-question endpoint exists, fetch index+1 and index+2 here.
  }

  function setAnswer(questionId, answerPayload) {
    setState(s => {
      const newAnswers = { ...s.answers, [questionId]: answerPayload };
      const newState = { ...s, answers: newAnswers };
      if (attemptId) persistState(attemptId, newState);
      return newState;
    });
  }

  function toggleFlag(questionId) {
    setState(s => {
      const newFlag = { ...s.flagged, [questionId]: !s.flagged[questionId] };
      const newState = { ...s, flagged: newFlag };
      if (attemptId) persistState(attemptId, newState);
      return newState;
    });
  }

  function goNext() { setState(s => { const nextIndex = Math.min(s.currentIndex + 1, totalQuestions - 1); if (nextIndex !== s.currentIndex) prefetchNextTwo(questions, nextIndex); return { ...s, currentIndex: nextIndex }; }); }
  function goPrev() { setState(s => ({ ...s, currentIndex: Math.max(s.currentIndex - 1, 0) })); }

  async function autosave() {
    if (!attemptId || !currentQuestion) return;
    const qid = currentQuestion.id;
    const payload = { question_id: qid, answer: state.answers[qid] ?? null, time_spent: state.times[qid] ?? 0, flagged: !!state.flagged[qid] };
    const now = Date.now();
    const last = state.lastSavedAt || 0;
    if (Math.floor(now / 10000) === Math.floor(last / 10000)) return;
    setState(s => ({ ...s, lastSavedAt: now, savedMessage: 'Saved' }));
    try {
      if (!navigator.onLine) throw new Error('offline');
      const res = await fetch(`${BASE_API}/attempts/${attemptId}/save/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('autosave failed');
    } catch (err) {
      autosaveQueueRef.current?.enqueue(payload);
      setState(s => ({ ...s, savedMessage: 'Offline: queued' }));
    }
  }

  function openSubmitConfirm() { document.getElementById('mentara-submit-modal')?.classList.add('open'); }
  function closeSubmitConfirm() { document.getElementById('mentara-submit-modal')?.classList.remove('open'); }

  async function doSubmit() {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      await autosaveQueueRef.current?.flush();
      const responses = questions.map(q => ({ question_id: q.id, answer: state.answers[q.id] ?? null, time_spent: state.times[q.id] ?? 0, flagged: !!state.flagged[q.id] }));
      const res = await fetch(`${BASE_API}/exams/${examId}/submit/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ attempt_id: attemptId, responses }) });
      if (!res.ok) throw new Error('submit failed');
      const data = await res.json();
      // Normalize to display
      setResults({ total_score: data.score ?? data.total_score, per_question: data.per_question ?? [], percentile: data.percentile ?? null });
    } catch (err) {
      setState(s => ({ ...s, savedMessage: 'Submit failed. Retry.' }));
    } finally {
      setSubmitting(false);
      closeSubmitConfirm();
    }
  }

  useKeyboardShortcuts({
    onNumberKey: (n) => {
      if (!currentQuestion) return;
      if (currentQuestion.type === 'mcq') {
        setAnswer(currentQuestion.id, String.fromCharCode(64 + n));
      } else if (currentQuestion.type === 'multi') {
        const existing = Array.isArray(state.answers[currentQuestion.id]) ? state.answers[currentQuestion.id] : [];
        const opt = String.fromCharCode(64 + n);
        const next = existing.includes(opt) ? existing.filter(o => o !== opt) : [...existing, opt];
        setAnswer(currentQuestion.id, next);
      }
    },
    onNext: goNext,
    onPrev: goPrev,
    onFlag: () => currentQuestion && toggleFlag(currentQuestion.id),
    onSubmitPrompt: openSubmitConfirm,
  });

  if (results) {
    return (
      <div className="test-results container" role="region" aria-label="Exam results">
        <h2>Results</h2>
        <div className="card-premium p-3">
          <p>Total Score: {results.total_score}</p>
          <p>Percentile: {results.percentile ?? '—'}</p>
        </div>
        <table aria-label="Per-question breakdown">
          <thead><tr><th>QID</th><th>Correct</th><th>Score</th><th>Time (s)</th></tr></thead>
          <tbody>
            {(results.per_question || []).map(r => (
              <tr key={r.question_id}><td>{r.question_id}</td><td>{r.correct ? '✔' : '✘'}</td><td>{r.score}</td><td>{state.times[r.question_id] ?? 0}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mentara-test container">
      <div className="layout">
        <main className="question-area" role="main" aria-live="polite">
          <header className="question-header">
            <div className="timer-chip" aria-label="Autosave status" aria-live="polite">{state.savedMessage}</div>
            <div className="question-progress">Question {state.currentIndex + 1} of {totalQuestions}</div>
          </header>

          {currentQuestion && (
            <QuestionRenderer
              question={currentQuestion}
              answer={state.answers[currentQuestion.id]}
              onAnswer={(payload) => setAnswer(currentQuestion.id, payload)}
            />
          )}

          <div className="nav-actions">
            <button className="btn-mentara btn-mentara-ghost" onClick={goPrev} aria-label="Previous question">Prev (P)</button>
            <button className="btn-mentara btn-mentara-primary" onClick={goNext} aria-label="Next question">Next (N)</button>
            <button className="btn-mentara btn-mentara-ghost" onClick={() => currentQuestion && toggleFlag(currentQuestion.id)} aria-pressed={!!(currentQuestion && state.flagged[currentQuestion.id])}>{currentQuestion && state.flagged[currentQuestion.id] ? 'Unflag (F)' : 'Flag (F)'}</button>
          </div>
        </main>

        <aside className="sticky-panel" role="complementary" aria-label="Exam Controls">
          <ProgressRing percent={Math.round((answeredCount / Math.max(totalQuestions, 1)) * 100)} label={`${answeredCount}/${totalQuestions}`} />
          <div className="global-timer" aria-label="Global timer">Time left: {Math.floor(globalSeconds / 60)}:{String(globalSeconds % 60).padStart(2, '0')}</div>
          <div className="segmented-progress" aria-label="Progress segments">
            {questions.map((q, idx) => {
              const isAnswered = state.answers[q.id] != null && state.answers[q.id] !== '';
              const isFlagged = !!state.flagged[q.id];
              return (
                <button key={q.id} className={[ 'segment', isAnswered ? 'answered' : 'unanswered', isFlagged ? 'flagged' : '', idx === state.currentIndex ? 'current' : '' ].join(' ')} onClick={() => setState(s => ({ ...s, currentIndex: idx }))} aria-label={`Go to question ${idx + 1}`} />
              );
            })}
          </div>
          <button className="btn-mentara btn-mentara-primary hover-lift submit-btn" onClick={openSubmitConfirm} aria-label="Submit exam">Submit (S)</button>
        </aside>
      </div>

      <div id="mentara-submit-modal" className="mentara-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-content card-premium">
          <h3 id="modal-title">Submit Exam?</h3>
          <p>You have answered {answeredCount} / {totalQuestions} questions.</p>
          <div className="modal-actions">
            <button className="btn-mentara btn-mentara-ghost" onClick={closeSubmitConfirm}>Cancel</button>
            <button disabled={submitting} className="btn-mentara btn-mentara-primary" onClick={doSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionRenderer({ question, answer, onAnswer }) {
  if (question.type === 'mcq') {
    const choices = question.choices || ['A', 'B', 'C', 'D'];
    const selected = answer || '';
    return (
      <div role="radiogroup" aria-label="Multiple choice">
        {choices.map((c, i) => {
          const letter = typeof c === 'string' ? c : c.label || String.fromCharCode(65 + i);
          const checked = selected === letter;
          return (
            <label key={letter} className="mcq-option">
              <input type="radio" role="radio" aria-checked={checked} checked={checked} onChange={() => onAnswer(letter)} data-option-index={i} />
              <span className="option-label">{letter}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === 'multi') {
    const choices = question.choices || ['A', 'B', 'C', 'D'];
    const selected = Array.isArray(answer) ? answer : [];
    const toggle = (letter) => { const next = selected.includes(letter) ? selected.filter(l => l !== letter) : [...selected, letter]; onAnswer(next); };
    return (
      <div role="group" aria-label="Multiple select">
        {choices.map((c, i) => {
          const letter = typeof c === 'string' ? c : c.label || String.fromCharCode(65 + i);
          const checked = selected.includes(letter);
          return (
            <label key={letter} className="mcq-option">
              <input type="checkbox" role="checkbox" aria-checked={checked} checked={checked} onChange={() => toggle(letter)} data-option-index={i} />
              <span className="option-label">{letter}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === 'fib') {
    return (
      <div className="fib">
        <input type="text" placeholder="Your answer" aria-label="Fill in the blank" value={answer || ''} onChange={(e) => onAnswer(e.target.value)} data-option-index="0" />
      </div>
    );
  }
  return (
    <div className="structured">
      <input type="file" aria-label="Upload file" onChange={() => onAnswer({ file: 'placeholder' })} data-option-index="0" />
      <p className="muted">Upload UI placeholder — integrate with signed URLs.</p>
    </div>
  );
}

TestTakingPage.propTypes = { examId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };
QuestionRenderer.propTypes = { question: PropTypes.object.isRequired, answer: PropTypes.any, onAnswer: PropTypes.func.isRequired };

export default TestTakingPage;
