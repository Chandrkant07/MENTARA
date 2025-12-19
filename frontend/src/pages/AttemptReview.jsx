import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/dashboard.css';

const BASE_API = import.meta.env.VITE_BASE_API || 'http://localhost:8000/api';
const getToken = () => localStorage.getItem('access_token');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

function AttemptReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [attemptId]);

  async function load() {
    try {
      const res = await fetch(`${BASE_API}/attempts/${attemptId}/review/`, { headers: authHeaders() });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.detail || 'Failed to load attempt review');
      setData(body);
    } catch (err) {
      console.error('Attempt review load error:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="spinner"></div></div>;
  }

  if (!data) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Attempt Review</h1>
          <p className="dashboard-subtitle">Unable to load this attempt.</p>
        </div>
        <button className="attempt-review-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{data.exam_title || 'Attempt Review'}</h1>
        <p className="dashboard-subtitle">
          Score: {data.score ?? '—'} / {data.total ?? '—'}
          {data.percentage !== undefined && data.percentage !== null ? ` • ${data.percentage}%` : ''}
        </p>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">🧾 Responses</h2>
        <div className="attempts-list">
          {(data.responses || []).map((r, idx) => (
            <div key={`${r.question_id}-${idx}`} className="attempt-card" style={{ alignItems: 'stretch' }}>
              <div className="attempt-info">
                <h3 className="attempt-title">Q{idx + 1}</h3>
                <p className="attempt-date">{r.statement}</p>
                <p className="attempt-date">Answer: {JSON.stringify(r.answer)}</p>
                <p className="attempt-date">
                  Marks: {r.marks_obtained ?? '—'} / {r.total_marks ?? '—'}
                  {r.correct !== undefined ? ` • ${r.correct ? 'Correct' : 'Incorrect'}` : ''}
                </p>
                {r.remarks ? <p className="attempt-date">Teacher: {r.remarks}</p> : null}
              </div>
            </div>
          ))}
          {(data.responses || []).length === 0 && (
            <p className="empty-state">No responses found for this attempt.</p>
          )}
        </div>
      </div>

      <button className="attempt-review-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default AttemptReview;
