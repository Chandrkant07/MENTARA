import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Award, BookOpen, Clock, Play, Sparkles, Target, TrendingUp, Trophy, Zap } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import StudentNav from '../components/layout/StudentNav';
import ThemeToggle from '../components/ui/ThemeToggle';

const LSK = {
  WEEKLY_GOAL: 'mentara_student_weekly_goal',
  ATTEMPT_UI: (attemptId) => `mentara_attempt_${attemptId}_ui`,
};

const readAttemptUi = (attemptId) => {
  try {
    const raw = localStorage.getItem(LSK.ATTEMPT_UI(attemptId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readWeeklyGoal = () => {
  try {
    const raw = localStorage.getItem(LSK.WEEKLY_GOAL);
    const n = raw ? Number(raw) : 5;
    if (!Number.isFinite(n)) return 5;
    return Math.max(1, Math.min(20, Math.round(n)));
  } catch {
    return 5;
  }
};

const writeWeeklyGoal = (n) => {
  try {
    localStorage.setItem(LSK.WEEKLY_GOAL, String(n));
  } catch {
    // ignore
  }
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [weeklyGoal, setWeeklyGoal] = useState(() => readWeeklyGoal());

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    upcomingExams: [],
    recentAttempts: [],
    topicProgress: [],
    leaderboard: [],
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [examsRes, attemptsRes, topicsRes, leaderboardRes] = await Promise.all([
        api.get('exams/'),
        api.get('users/me/attempts/'),
        api.get('analytics/user/me/topics/'),
        api.get('leaderboard/?period=weekly'),
      ]);

      const examsArray = Array.isArray(examsRes.data) ? examsRes.data : (examsRes.data?.results || []);
      const attemptsArray = attemptsRes.data?.attempts || [];
      const topicsArray = topicsRes.data?.topics || [];
      const leaders = leaderboardRes.data?.leaders || [];

      setDashboardData({
        upcomingExams: examsArray,
        recentAttempts: attemptsArray,
        topicProgress: topicsArray,
        leaderboard: leaders,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartTest = (examId) => {
    navigate(`/test/${examId}`);
  };

  const handleViewResults = (attemptId) => {
    navigate(`/results/${attemptId}`);
  };

  const submittedAttempts = useMemo(
    () => (dashboardData.recentAttempts || []).filter((a) => a && (a.status === 'submitted' || a.status === 'timedout')),
    [dashboardData.recentAttempts]
  );

  const gradedSubmittedAttempts = useMemo(
    () => submittedAttempts.filter((a) => !a?.needs_grading),
    [submittedAttempts]
  );

  const latestAttempt = useMemo(() => {
    const attempts = (dashboardData.recentAttempts || []).filter(Boolean);
    if (!attempts.length) return null;

    const sorted = [...attempts].sort((a, b) => {
      const ta = new Date(a?.started_at || a?.finished_at || 0).getTime();
      const tb = new Date(b?.started_at || b?.finished_at || 0).getTime();
      return tb - ta;
    });
    return sorted[0] || null;
  }, [dashboardData.recentAttempts]);

  const latestAttemptUi = useMemo(() => {
    if (!latestAttempt?.id) return null;
    return readAttemptUi(latestAttempt.id);
  }, [latestAttempt?.id]);

  const latestAttemptAnsweredCount = useMemo(() => {
    const answers = latestAttemptUi?.answers;
    if (!answers || typeof answers !== 'object') return 0;
    return Object.keys(answers).length;
  }, [latestAttemptUi]);

  const latestAttemptExamMeta = useMemo(() => {
    const examId = latestAttempt?.exam_id;
    if (!examId) return null;
    return (dashboardData.upcomingExams || []).find((e) => String(e?.id) === String(examId)) || null;
  }, [dashboardData.upcomingExams, latestAttempt?.exam_id]);

  useEffect(() => {
    writeWeeklyGoal(weeklyGoal);
  }, [weeklyGoal]);

  const avgScore = useMemo(() => {
    const scores = gradedSubmittedAttempts.map((a) => Number(a.percentage ?? 0)).filter((n) => Number.isFinite(n));
    if (!scores.length) return 0;
    const sum = scores.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  }, [gradedSubmittedAttempts]);

  const streak = useMemo(() => {
    const dates = submittedAttempts
      .map((a) => (a.started_at ? new Date(a.started_at).toDateString() : null))
      .filter(Boolean);
    if (!dates.length) return 0;

    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let count = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.floor((prev - curr) / 86400000);
      if (diffDays === 1) count += 1;
      else break;
    }
    return count;
  }, [submittedAttempts]);

  const myLeaderboardRank = useMemo(() => {
    const username = user?.username;
    if (!username) return null;
    const found = (dashboardData.leaderboard || []).find((l) => l && l.username === username);
    return found?.rank ?? null;
  }, [dashboardData.leaderboard, user?.username]);

  const topStats = useMemo(
    () => [
      { icon: Trophy, label: 'Tests Completed', value: submittedAttempts.length },
      { icon: Target, label: 'Average Score', value: `${avgScore}%` },
      { icon: Zap, label: 'Day Streak', value: streak },
      { icon: Award, label: 'Weekly Rank', value: myLeaderboardRank ? `#${myLeaderboardRank}` : '—' },
    ],
    [avgScore, myLeaderboardRank, streak, submittedAttempts.length]
  );

  const upcoming = useMemo(() => (dashboardData.upcomingExams || []).slice(0, 3), [dashboardData.upcomingExams]);
  const recentTwo = useMemo(() => submittedAttempts.slice(0, 2), [submittedAttempts]);
  const topTopics = useMemo(() => (dashboardData.topicProgress || []).slice(0, 4), [dashboardData.topicProgress]);

  const weeklyCompleted = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    let count = 0;
    for (const a of submittedAttempts) {
      const when = a?.finished_at || a?.started_at;
      if (!when) continue;
      const t = new Date(when).getTime();
      if (Number.isFinite(t) && t >= weekAgo) count += 1;
    }
    return count;
  }, [submittedAttempts]);

  const weeklyPct = useMemo(() => {
    if (!weeklyGoal) return 0;
    return Math.max(0, Math.min(100, Math.round((weeklyCompleted / weeklyGoal) * 100)));
  }, [weeklyCompleted, weeklyGoal]);

  const trendPoints = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const buckets = days.map((d) => ({ key: d.toDateString(), values: [] }));

    for (const attempt of submittedAttempts) {
      if (!attempt?.started_at) continue;
      if (attempt?.needs_grading) continue;
      const key = new Date(attempt.started_at).toDateString();
      const idx = buckets.findIndex((b) => b.key === key);
      if (idx >= 0) buckets[idx].values.push(Number(attempt.percentage ?? 0));
    }

    return buckets.map((b) => {
      if (!b.values.length) return 0;
      const sum = b.values.reduce((acc, v) => acc + v, 0);
      return Math.round((sum / b.values.length) * 10) / 10;
    });
  }, [submittedAttempts]);

  const trendPath = useMemo(() => {
    const w = 520;
    const h = 160;
    const pad = 12;
    const max = 100;
    const min = 0;
    const pts = trendPoints.length ? trendPoints : [0, 0, 0, 0, 0, 0, 0];
    const stepX = (w - pad * 2) / (pts.length - 1);

    const y = (v) => {
      const clamped = Math.max(min, Math.min(max, v));
      const t = (clamped - min) / (max - min);
      return h - pad - t * (h - pad * 2);
    };

    return pts
      .map((v, i) => {
        const x = pad + i * stepX;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y(v).toFixed(2)}`;
      })
      .join(' ');
  }, [trendPoints]);

  const trendAreaPath = useMemo(() => {
    const w = 520;
    const h = 160;
    const pad = 12;
    const max = 100;
    const min = 0;
    const pts = trendPoints.length ? trendPoints : [0, 0, 0, 0, 0, 0, 0];
    const stepX = (w - pad * 2) / (pts.length - 1);

    const y = (v) => {
      const clamped = Math.max(min, Math.min(max, v));
      const t = (clamped - min) / (max - min);
      return h - pad - t * (h - pad * 2);
    };

    const points = pts.map((v, i) => ({ x: pad + i * stepX, y: y(v) }));
    const start = points[0];
    const end = points[points.length - 1];
    return [
      `M ${start.x.toFixed(2)} ${(h - pad).toFixed(2)}`,
      `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
      ...points.slice(1).map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`),
      `L ${end.x.toFixed(2)} ${(h - pad).toFixed(2)}`,
      'Z',
    ].join(' ');
  }, [trendPoints]);

  return (
    <AppShell
      brandTitle="Mentara"
      brandSubtitle="IB Exam Preparation"
      nav={(
        <StudentNav active="dashboard" />
      )}
      right={(
        <>
          <ThemeToggle />
          <button className="btn-secondary text-sm hidden sm:inline-flex" onClick={loadDashboardData} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-text">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
            <button onClick={logout} className="btn-secondary text-sm">Logout</button>
          </div>
        </>
      )}
    >
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="card-elevated p-0 overflow-hidden border border-elevated/60 backdrop-blur-xl">
          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-surface/0 to-primary/4" />
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl opacity-60" />
            <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl opacity-60" />
            <img
              src="/marketing/hero-home.svg"
              alt=""
              className="hidden lg:block absolute right-8 bottom-0 w-[380px] opacity-30 pointer-events-none select-none"
              draggable="false"
            />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface/60 border border-elevated/60 text-xs font-medium text-text-secondary mb-4 backdrop-blur-sm">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Student Dashboard
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text mb-4 truncate tracking-tight leading-tight">
                  Welcome back, {user?.first_name || 'Student'}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface/60">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium">{streak} day streak</span>
                  </span>
                  <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface/60">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium">Avg {avgScore}%</span>
                  </span>
                  <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface/60">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="font-medium">Rank {myLeaderboardRank ? `#${myLeaderboardRank}` : '—'}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:flex-shrink-0">
                <button onClick={() => navigate('/exams')} className="btn-primary w-full sm:w-auto px-6 py-3 text-base font-semibold">
                  <Play className="w-4 h-4 inline-block mr-2" />
                  Start Test
                </button>
                <button onClick={() => navigate('/leaderboard')} className="btn-secondary w-full sm:w-auto px-6 py-3 text-base font-semibold">
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="sm:hidden mb-8">
        <div className="card-elevated flex items-center justify-between gap-4 p-5 border border-elevated/60 backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-text truncate mb-1">{user?.first_name} {user?.last_name}</div>
            <div className="text-xs text-text-secondary truncate font-medium">{user?.email}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="btn-secondary text-sm px-4 py-2 font-semibold" onClick={loadDashboardData} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button onClick={logout} className="btn-secondary text-sm px-4 py-2 font-semibold">Logout</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.button
          type="button"
          onClick={() => navigate('/library')}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card-elevated hover:border-primary/40 hover:bg-surface/40 transition-all duration-300 text-left group border border-elevated/60 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex-1">
              <div className="text-base font-bold text-text mb-1.5 group-hover:text-primary transition-colors">Browse Library</div>
              <div className="text-xs text-text-secondary leading-relaxed">Pick topics and start practicing</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface/60 overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary via-primary/80 to-primary/50 rounded-full transition-all duration-500" />
          </div>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => navigate('/exams')}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card-elevated hover:border-primary/40 hover:bg-surface/40 transition-all duration-300 text-left group border border-elevated/60 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex-1">
              <div className="text-base font-bold text-text mb-1.5 group-hover:text-primary transition-colors">Take a Test</div>
              <div className="text-xs text-text-secondary leading-relaxed">Timed practice with instant results</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
              <Play className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface/60 overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-primary via-primary/80 to-primary/50 rounded-full transition-all duration-500" />
          </div>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => navigate('/results')}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card-elevated hover:border-primary/40 hover:bg-surface/40 transition-all duration-300 text-left group border border-elevated/60 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex-1">
              <div className="text-base font-bold text-text mb-1.5 group-hover:text-primary transition-colors">Review Results</div>
              <div className="text-xs text-text-secondary leading-relaxed">Fix mistakes and improve score</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface/60 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-primary via-primary/80 to-primary/50 rounded-full transition-all duration-500" />
          </div>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-10"
      >
        <div className="card-elevated p-0 overflow-hidden border border-elevated/60 backdrop-blur-xl">
          <div className="relative p-8 sm:p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface/0 to-primary/6" />
            <motion.div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/12 blur-3xl opacity-70"
              animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-primary/12 blur-3xl opacity-70"
              animate={{ y: [0, 14, 0], x: [0, -8, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface/60 border border-elevated/60 text-xs font-medium text-text-secondary mb-4 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Continue Learning
                </div>

                {!latestAttempt ? (
                  <>
                    <div className="text-3xl sm:text-4xl font-extrabold text-text mb-3 tracking-tight leading-tight">Start your first practice session</div>
                    <div className="text-sm text-text-secondary max-w-2xl leading-relaxed">
                      Take a timed test and we'll keep your progress, streak, and analytics updated automatically.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl sm:text-4xl font-extrabold text-text mb-3 truncate tracking-tight leading-tight">{latestAttempt.exam_title || 'Your last test'}</div>
                    {(latestAttempt?.curriculum_name || latestAttempt?.topic_name) ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm font-medium">
                          {latestAttempt.curriculum_name || '—'}
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm font-medium">
                          {latestAttempt.topic_name || '—'}
                        </span>
                        {Number.isFinite(Number(latestAttempt?.rank)) ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary font-semibold backdrop-blur-sm">
                            Rank #{latestAttempt.rank}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm font-medium">
                        <span className={`w-2.5 h-2.5 rounded-full ${latestAttempt.status === 'inprogress' ? 'bg-primary animate-pulse' : 'bg-success'}`} />
                        {latestAttempt.status === 'inprogress' ? 'In progress' : 'Completed'}
                      </span>
                      {latestAttempt.status === 'inprogress' && (
                        <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm font-medium">
                          <Target className="w-4 h-4 text-primary" />
                          {latestAttemptExamMeta?.question_count
                            ? `${latestAttemptAnsweredCount}/${latestAttemptExamMeta.question_count} answered`
                            : `${latestAttemptAnsweredCount} answered`}
                        </span>
                      )}
                      {(latestAttempt.status === 'submitted' || latestAttempt.status === 'timedout') && (
                        <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/50 border border-elevated/60 text-text-secondary backdrop-blur-sm font-medium">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          {latestAttempt?.needs_grading
                            ? 'Pending teacher grading'
                            : (Number.isFinite(Number(latestAttempt.percentage))
                              ? `${Math.round(Number(latestAttempt.percentage))}% score`
                              : 'Results ready')}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-shrink-0">
                {!latestAttempt ? (
                  <button onClick={() => navigate('/exams')} className="btn-primary w-full sm:w-auto px-6 py-3 text-base font-semibold">
                    Start Practice
                    <ArrowRight className="w-4 h-4 inline-block ml-2" />
                  </button>
                ) : latestAttempt.status === 'inprogress' ? (
                  <button
                    onClick={() => navigate(`/test/${latestAttempt.exam_id}`)}
                    className="btn-primary w-full sm:w-auto px-6 py-3 text-base font-semibold"
                  >
                    Continue Test
                    <ArrowRight className="w-4 h-4 inline-block ml-2" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleViewResults(latestAttempt.id)}
                      className="btn-primary w-full sm:w-auto px-6 py-3 text-base font-semibold"
                    >
                      View Results
                      <ArrowRight className="w-4 h-4 inline-block ml-2" />
                    </button>
                    <button
                      onClick={() => navigate(`/attempt/${latestAttempt.id}/review`)}
                      className="btn-secondary w-full sm:w-auto px-6 py-3 text-base font-semibold"
                    >
                      Review Answers
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="card-elevated p-0 overflow-hidden mb-10 border border-elevated/60 backdrop-blur-xl">
        <div className="relative p-8 sm:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-surface/0 to-primary/4" />
          <img
            src="/marketing/hero-results.svg"
            alt=""
            className="hidden md:block absolute right-8 bottom-0 w-[340px] opacity-30 pointer-events-none select-none"
            draggable="false"
          />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-text-secondary mb-3 uppercase tracking-wider">Today's Plan</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-text mb-3 tracking-tight leading-tight">Build momentum in 20 minutes</div>
              <div className="text-sm text-text-secondary max-w-2xl leading-relaxed mb-6">
                Quick, guided routine to keep you consistent and improve scores.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { k: '1', t: 'Pick a topic', d: 'Library → choose weak areas' },
                  { k: '2', t: 'Take one test', d: 'Timed practice' },
                  { k: '3', t: 'Review mistakes', d: 'Fix gaps quickly' },
                ].map((x) => (
                  <div key={x.k} className="bg-surface/50 border border-elevated/60 rounded-2xl p-5 backdrop-blur-sm hover:border-primary/40 hover:bg-surface/60 transition-all group">
                    <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Step {x.k}</div>
                    <div className="mt-1 font-bold text-base text-text mb-2 group-hover:text-primary transition-colors">{x.t}</div>
                    <div className="mt-1 text-xs text-text-secondary leading-relaxed">{x.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0">
              <button onClick={() => navigate('/library')} className="btn-secondary w-full sm:w-auto px-6 py-3 text-base font-semibold">Open Library</button>
              <button onClick={() => navigate('/exams')} className="btn-primary w-full sm:w-auto px-6 py-3 text-base font-semibold">Start Practice</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {topStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card-elevated hover:border-primary/40 hover:bg-surface/20 transition-all duration-300 border border-elevated/60 backdrop-blur-xl group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold text-text leading-none tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-secondary mt-2 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface/60 overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-primary via-primary/80 to-primary/50 rounded-full transition-all duration-500" />
            </div>
          </motion.div>
        ))}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold text-text flex items-center gap-3 tracking-tight">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  Performance Trend
                </h3>
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">Last 7 days</div>
              </div>
              <div className="bg-surface/40 border border-elevated/60 rounded-2xl p-6 overflow-hidden backdrop-blur-sm">
                <svg viewBox="0 0 520 160" className="w-full h-40">
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>

                  <g className="text-text" opacity="0.12" stroke="currentColor" strokeWidth="1">
                    <path d="M 12 40 L 508 40" />
                    <path d="M 12 80 L 508 80" />
                    <path d="M 12 120 L 508 120" />
                  </g>

                  <g className="text-primary">
                    <path d={trendAreaPath} fill="url(#trendFill)" />
                    <path d={trendPath} fill="none" stroke="url(#trendStroke)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={trendPath} fill="none" stroke="currentColor" strokeWidth="12" strokeOpacity="0.12" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-text tracking-tight">Topic Performance</h3>
                  <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">Accuracy</div>
                </div>
                <div className="space-y-5">
                  {topTopics.map((t) => (
                    <div key={t.topic_id}>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="font-bold text-text">{t.topic}</div>
                        <div className="text-text-secondary font-semibold">{t.accuracy_pct}%</div>
                      </div>
                      <div className="w-full h-2.5 bg-surface/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(0, Math.min(100, t.accuracy_pct || 0))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {topTopics.length === 0 && (
                    <div className="text-sm text-text-secondary text-center py-8">No topic data yet. Take a test to see analytics.</div>
                  )}
                </div>
              </div>

              <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-text tracking-tight">Upcoming Tests</h3>
                  <button onClick={() => navigate('/exams')} className="btn-ghost text-sm px-3 py-1.5">View All</button>
                </div>
                <div className="space-y-4">
                  {upcoming.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-5 rounded-2xl bg-surface/50 border border-elevated/60 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 backdrop-blur-sm group"
                    >
                      <div className="font-bold text-base text-text mb-3 group-hover:text-primary transition-colors">{exam.title}</div>
                      <div className="text-xs text-text-secondary flex items-center gap-4 mb-4">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {Number.isFinite(exam.duration)
                            ? `${exam.duration} min`
                            : `${Math.round((exam.duration_seconds || 0) / 60)} min`}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <BookOpen className="w-3.5 h-3.5" />
                          {exam.question_count || 0} questions
                        </span>
                      </div>
                      <div>
                        <button onClick={() => handleStartTest(exam.id)} className="btn-secondary text-sm px-4 py-2 font-semibold">Start</button>
                      </div>
                    </div>
                  ))}
                  {upcoming.length === 0 && <div className="text-sm text-text-secondary text-center py-8">No tests available yet.</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-text tracking-tight">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                  {recentTwo.map((a) => (
                    <div
                      key={a.id}
                      className="p-5 rounded-2xl bg-surface/50 border border-elevated/60 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
                      onClick={() => handleViewResults(a.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-base text-text group-hover:text-primary transition-colors">{a.exam_title}</div>
                        <div className="text-sm font-bold text-text">
                          {a?.needs_grading ? <span className="text-warning">Pending grading</span> : `${Math.round(Number(a.percentage ?? 0))}%`}
                        </div>
                      </div>
                      <div className="text-xs text-text-secondary font-medium">
                        {a.started_at ? new Date(a.started_at).toLocaleString() : '—'}
                      </div>
                    </div>
                  ))}
                  {recentTwo.length === 0 && (
                    <div className="text-sm text-text-secondary text-center py-8">No activity yet. Start a test to see results.</div>
                  )}
                </div>
              </div>

              <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-text tracking-tight">Achievements</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-surface/50 border border-elevated/60 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 group backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all">
                        <Trophy className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-text mb-1">Consistency</div>
                        <div className="text-xs text-text-secondary font-medium">{streak} day streak</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-surface/50 border border-elevated/60 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 group backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-text mb-1">Momentum</div>
                        <div className="text-xs text-text-secondary font-medium">Avg score {avgScore}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-text tracking-tight">Weekly Goal</h3>
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">Last 7 days</div>
              </div>

              <div className="p-6 rounded-2xl bg-surface/50 border border-elevated/60 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-medium text-text-secondary mb-2">Completed</div>
                    <div className="text-3xl font-extrabold text-text tracking-tight">
                      {weeklyCompleted} <span className="text-text-secondary text-lg font-bold">/ {weeklyGoal}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary btn-icon w-10 h-10 p-0 flex items-center justify-center"
                      onClick={() => setWeeklyGoal((g) => Math.max(1, g - 1))}
                      aria-label="Decrease weekly goal"
                      title="Decrease goal"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-icon w-10 h-10 p-0 flex items-center justify-center"
                      onClick={() => setWeeklyGoal((g) => Math.min(20, g + 1))}
                      aria-label="Increase weekly goal"
                      title="Increase goal"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-text-secondary mb-3">
                    <span>Progress</span>
                    <span className="font-bold text-text">{weeklyPct}%</span>
                  </div>
                  <div className="w-full h-3 bg-bg rounded-full overflow-hidden border border-elevated/60">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 rounded-full transition-all duration-700"
                      style={{ width: `${weeklyPct}%` }}
                    />
                  </div>
                  <div className="mt-4 text-xs text-text-secondary leading-relaxed">
                    Tip: Set a goal you can hit consistently.
                  </div>
                </div>
              </div>
            </div>

            <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-text tracking-tight">Skill Analysis</h3>
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">Overview</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-elevated/60 backdrop-blur-sm hover:border-primary/40 transition-all group">
                  <span className="text-text-secondary font-medium">Accuracy</span>
                  <span className="font-bold text-text text-base">{avgScore}%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-elevated/60 backdrop-blur-sm hover:border-primary/40 transition-all group">
                  <span className="text-text-secondary font-medium">Speed</span>
                  <span className="font-bold text-text">{submittedAttempts.length ? 'Good' : '—'}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-elevated/60 backdrop-blur-sm hover:border-primary/40 transition-all group">
                  <span className="text-text-secondary font-medium">Consistency</span>
                  <span className="font-bold text-text">{streak ? 'Active' : '—'}</span>
                </div>
              </div>
            </div>

            <div className="card-elevated border border-elevated/60 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-text tracking-tight">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button onClick={() => navigate('/exams')} className="btn-primary w-full px-6 py-3 text-base font-semibold">Browse Tests</button>
                <button onClick={() => navigate('/leaderboard')} className="btn-secondary w-full px-6 py-3 text-base font-semibold">View Leaderboard</button>
              </div>
            </div>
          </div>
        </div>
    </AppShell>
  );
};

export default Dashboard;
