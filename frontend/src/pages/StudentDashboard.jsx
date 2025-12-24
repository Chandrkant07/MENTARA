import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressRing from '../components/ProgressRing';
import '../styles/dashboard.css';

const BASE_API = import.meta.env.VITE_BASE_API || '/api';
const getToken = () => localStorage.getItem('access_token');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, avg_score: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [attemptsRes, topicsRes, leaderboardRes] = await Promise.all([
        fetch(`${BASE_API}/users/me/attempts/`, { headers: authHeaders() }),
        fetch(`${BASE_API}/analytics/user/me/topics/`, { headers: authHeaders() }),
        fetch(`${BASE_API}/leaderboard/?period=weekly`, { headers: authHeaders() })
      ]);

      const attemptsData = await attemptsRes.json();
      const topicsData = await topicsRes.json();
      const leaderboardData = await leaderboardRes.json();

      setAttempts(attemptsData.attempts || []);
      setTopics(topicsData.topics || []);
      setLeaderboard(leaderboardData.leaders || []);

      // Calculate stats
      const completed = attemptsData.attempts.filter(a => a.status === 'submitted').length;
      const scores = attemptsData.attempts.filter(a => a.status === 'submitted').map(a => a.score);
      const avg = scores.length ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1) : 0;
      
      // Simple streak calculation (days with attempts)
      const streak = calculateStreak(attemptsData.attempts);

      setStats({ total: attemptsData.attempts.length, completed, avg_score: avg, streak });
      setLoading(false);
    } catch (error) {
      console.error('Dashboard load error:', error);
      setLoading(false);
    }
  }

  function calculateStreak(attempts) {
    if (!attempts.length) return 0;
    const dates = attempts.map(a => new Date(a.started_at).toDateString());
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i-1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prevDate - currDate) / 86400000);
        if (diffDays === 1) streak++;
        else break;
      }
    }
    return streak;
  }

  if (loading) {
    return <div className="dashboard-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back! 🚀</h1>
        <p className="dashboard-subtitle">Your learning journey continues</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Tests Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.avg_score}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Topic Performance */}
        <div className="dashboard-section">
          <h2 className="section-title">📚 Topic Performance</h2>
          <div className="topics-grid">
            {topics.length === 0 ? (
              <p className="empty-state">No topic data yet. Start taking tests!</p>
            ) : (
              topics.map(topic => (
                <div key={topic.topic_id} className="topic-card">
                  <div className="topic-header">
                    <span className="topic-name">{topic.topic}</span>
                    <span className={`accuracy-badge ${topic.accuracy_pct >= 70 ? 'high' : topic.accuracy_pct >= 50 ? 'medium' : 'low'}`}>
                      {topic.accuracy_pct}%
                    </span>
                  </div>
                  <div className="topic-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${topic.accuracy_pct}%` }}></div>
                    </div>
                    <span className="topic-count">{topic.correct}/{topic.total} correct</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="dashboard-section">
          <h2 className="section-title">📝 Recent Attempts</h2>
          <div className="attempts-list">
            {attempts.slice(0, 5).map(attempt => (
              <div key={attempt.id} className="attempt-card">
                <div className="attempt-info">
                  <h3 className="attempt-title">{attempt.exam_title}</h3>
                  <p className="attempt-date">{new Date(attempt.started_at).toLocaleString()}</p>
                </div>
                <div className="attempt-score">
                  <ProgressRing size={60} stroke={6} percent={(attempt.score / 100) * 100} label={`${attempt.score}`} />
                </div>
                <Link to={`/attempt/${attempt.id}/review`} className="attempt-review-btn">
                  Review
                </Link>
              </div>
            ))}
            {attempts.length === 0 && (
              <p className="empty-state">No attempts yet. Take your first test!</p>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="dashboard-section">
          <h2 className="section-title">🏆 Weekly Leaderboard</h2>
          <div className="leaderboard-table">
            {leaderboard.slice(0, 10).map((entry, idx) => (
              <div key={entry.user_id} className={`leaderboard-row ${idx === 0 ? 'first' : idx === 1 ? 'second' : idx === 2 ? 'third' : ''}`}>
                <span className="rank">{idx + 1}</span>
                <span className="username">{entry.username}</span>
                <span className="score">{entry.score} pts</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="empty-state">No leaderboard data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <Link to="/exams" className="fab">
        <span>+</span>
      </Link>
    </div>
  );
}

export default StudentDashboard;
