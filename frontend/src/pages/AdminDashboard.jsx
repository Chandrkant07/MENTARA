import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FolderTree, 
  FileQuestion, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Trophy,
  Menu,
  X,
  Plus,
  TrendingUp,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TopicManager from '../components/admin/TopicManager';
import QuestionManager from '../components/admin/QuestionManager';
import ExamManager from '../components/admin/ExamManager';
import UserManager from '../components/admin/UserManager';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import Overview from '../components/admin/Overview';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopics: 0,
    totalQuestions: 0,
    totalExams: 0,
    activeTests: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const { default: api } = await import('../services/api');
      const { data } = await api.get('admin/overview/');
      setStats({
        totalUsers: data.totalUsers || 0,
        totalTopics: data.totalTopics || 0,
        totalQuestions: data.totalQuestions || 0,
        totalExams: data.totalExams || 0,
        activeTests: data.activeAttempts || 0,
        completionRate: data.avgScore || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'topics', label: 'Topics & Folders', icon: FolderTree },
    { id: 'questions', label: 'Question Bank', icon: FileQuestion },
    { id: 'exams', label: 'Exams & Papers', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview stats={stats} />;
      case 'topics':
        return <TopicManager />;
      case 'questions':
        return <QuestionManager />;
      case 'exams':
        return <ExamManager />;
      case 'users':
        return <UserManager />;
      case 'analytics':
        return <AnalyticsPanel />;
      default:
        return <Overview stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-mentara-dark flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-72 bg-mentara-surface border-r border-white/5 flex flex-col fixed h-full z-50"
          >
            {/* Logo & Close */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mentara-blue to-mentara-mint flex items-center justify-center">
                  <Target className="w-6 h-6 text-mentara-dark" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Mentara</h1>
                  <p className="text-xs text-mentara-blue">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Admin Info */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mentara-blue to-mentara-mint flex items-center justify-center">
                  <span className="text-lg font-bold text-mentara-dark">
                    {user?.first_name?.[0] || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-mentara-blue/20 text-mentara-blue text-xs rounded-full">
                    Administrator
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-mentara-blue/20 to-mentara-mint/20 text-mentara-blue shadow-lg shadow-mentara-blue/10'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 rounded-full bg-mentara-blue"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/5">
              <button
                onClick={logout}
                className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-mentara-surface/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-400" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Manage your platform content and users
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-mentara-blue/10 rounded-lg">
                <Users className="w-4 h-4 text-mentara-blue" />
                <span className="text-sm font-semibold text-white">{stats.totalUsers}</span>
                <span className="text-xs text-gray-400">Users</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-mentara-mint/10 rounded-lg">
                <FileText className="w-4 h-4 text-mentara-mint" />
                <span className="text-sm font-semibold text-white">{stats.totalExams}</span>
                <span className="text-xs text-gray-400">Exams</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
