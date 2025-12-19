import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';

const BASE_API = (import.meta.env.VITE_BASE_API || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
const getToken = () => localStorage.getItem('access_token');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

function ExamsList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    loadExams();
  }, []);

  async function loadExams() {
    try {
      const res = await fetch(`${BASE_API}/exams/`, { headers: authHeaders() });
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setExams(list);
    } catch (err) {
      console.error('Failed to load exams:', err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="glass border-b border-elevated/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-bg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Available Exams</h1>
              <p className="text-sm text-text-secondary">Choose an exam to start</p>
            </div>
          </div>

          <Link to="/dashboard" className="btn-ghost text-sm">
            <ArrowLeft className="w-4 h-4 inline-block mr-2" />
            Back
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="card-elevated">
          <h2 className="text-lg font-bold text-text mb-4">Exams</h2>
          <div className="space-y-3 attempts-list">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="attempt-card flex items-center justify-between p-4 rounded-xl bg-surface/40 border border-elevated/50 hover:border-primary/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="attempt-title font-semibold text-text truncate">{exam.title}</div>
                  <div className="text-sm text-text-secondary flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exam.duration_seconds ? `${Math.round(exam.duration_seconds / 60)} min` : '—'}
                    </span>
                    <span>
                      {exam.total_marks ? `${exam.total_marks} marks` : '—'}
                    </span>
                  </div>
                </div>
                <Link to={`/test/${exam.id}`} className="attempt-review-btn btn-primary text-sm">
                  Start
                </Link>
              </div>
            ))}

            {exams.length === 0 && (
              <p className="text-text-secondary">No exams available right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamsList;
