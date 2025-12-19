import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  BookOpen, Trophy, Clock, TrendingUp, Calendar, 
  Target, Award, Zap, ChevronRight, Play 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    upcomingExams: [],
    recentAttempts: [],
    analytics: null,
    topicProgress: []
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const examsRes = await api.get('exams/');
      const examsArray = Array.isArray(examsRes.data) ? examsRes.data : [];

      setDashboardData({
        upcomingExams: examsArray,
        recentAttempts: [],
        analytics: { total_attempts: 0, average_score: 0, current_streak: 0 },
        topicProgress: []
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (examId) => {
    navigate(`/test/${examId}`);
  };

  const handleViewResults = (attemptId) => {
    navigate(`/results/${attemptId}`);
  };

  const stats = [
    {
      icon: Trophy,
      label: 'Tests Completed',
      value: dashboardData.analytics?.total_attempts || 0,
      color: 'from-primary to-accent',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Target,
      label: 'Average Score',
      value: `${dashboardData.analytics?.average_score || 0}%`,
      color: 'from-accent to-primary',
      bgColor: 'bg-accent/10'
    },
    {
      icon: Calendar,
      label: 'Available Tests',
      value: dashboardData.upcomingExams.length,
      color: 'from-primary to-accent',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Zap,
      label: 'Current Streak',
      value: dashboardData.analytics?.current_streak || 0,
      color: 'from-warning to-danger',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="glass border-b border-elevated/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-bg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Mentara</h1>
              <p className="text-sm text-text-secondary">IB Exam Preparation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/leaderboard')}
              className="btn-ghost text-sm"
            >
              <Trophy className="w-4 h-4 inline-block mr-2" />
              Leaderboard
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-text">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-text-secondary">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-text mb-2">
            Welcome back, {user?.first_name}.
          </h2>
          <p className="text-text-secondary">
            Pick a test and continue your preparation.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-elevated hover-lift"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`text-2xl font-bold text-gradient bg-gradient-to-r ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Exams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-text flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Available Tests
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/exams')} className="btn-ghost text-sm">
                    View All
                  </button>
                  <button onClick={loadDashboardData} className="btn-secondary text-sm" disabled={loading}>
                    {loading ? 'Loading…' : 'Refresh'}
                  </button>
                </div>
              </div>

              {dashboardData.upcomingExams.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-text-secondary text-lg mb-2">No tests available yet</p>
                  <p className="text-sm text-text-secondary">
                    Ask your teacher to publish an exam, then refresh.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.upcomingExams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="card-elevated group cursor-pointer"
                    onClick={() => handleStartTest(exam.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        exam.level === 'HL' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
                      }`}>
                        {exam.level}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Paper {exam.paper_number}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-text mb-2 group-hover:text-gradient transition-colors">
                      {exam.title}
                    </h4>

                    <div className="flex items-center gap-4 mb-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {Number.isFinite(exam.duration)
                            ? `${exam.duration} min`
                            : (Number.isFinite(exam.duration_seconds) ? `${Math.round(exam.duration_seconds / 60)} min` : '—')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{exam.question_count || 0} questions</span>
                      </div>
                    </div>

                    <button className="btn-primary w-full group-hover:shadow-glow transition-all">
                      <Play className="w-4 h-4 inline-block mr-2" />
                      Start Test
                    </button>
                  </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Attempts */}
            {dashboardData.recentAttempts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary" />
                  Recent Activity
                </h3>

                <div className="space-y-3">
                  {dashboardData.recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="card-elevated flex items-center justify-between cursor-pointer group"
                      onClick={() => handleViewResults(attempt.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl ${
                          attempt.score >= 70 ? 'bg-accent/20' : 'bg-warning/20'
                        } flex items-center justify-center`}>
                          <div className="text-2xl font-bold text-gradient">
                            {attempt.score}%
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-text group-hover:text-primary transition-colors">
                            {attempt.exam_title}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Completed {new Date(attempt.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topic Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card-elevated"
            >
              <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Topic Mastery
              </h3>

              {dashboardData.topicProgress.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  Topic mastery will appear after your first attempts.
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.topicProgress.slice(0, 5).map((topic) => {
                    const progress = Number.isFinite(topic.progress) ? Math.max(0, Math.min(100, topic.progress)) : 0;
                    return (
                      <div key={topic.id || topic.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text">{topic.name}</span>
                          <span className="text-sm font-bold text-primary">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-accent"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Achievement Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="card-elevated bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-bg" />
                </div>
                <h4 className="text-lg font-bold text-gradient mb-2">
                  Keep going
                </h4>
                <p className="text-sm text-text-secondary mb-4">
                  Complete 3 more tests to unlock the "Dedicated Learner" badge!
                </p>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2">
                  <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent" />
                </div>
                <p className="text-xs text-text-secondary">2 of 5 tests</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
