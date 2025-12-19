import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  FileQuestion, 
  FolderTree, 
  TrendingUp, 
  Activity,
  CheckCircle,
  Clock,
  Award,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Overview = ({ stats }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalTopics: 0,
    totalQuestions: 0,
    totalExams: 0,
    activeAttempts: 0,
    completedAttempts: 0,
    avgScore: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch overview stats from backend
      const response = await api.get('admin/overview/');
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: dashboardStats.totalUsers,
      change: `${dashboardStats.totalStudents} Students`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Exams',
      value: dashboardStats.totalExams,
      change: `${dashboardStats.totalTopics} Topics`,
      icon: FileText,
      color: 'from-mentara-mint to-green-500',
      bgColor: 'bg-mentara-mint/10'
    },
    {
      title: 'Question Bank',
      value: dashboardStats.totalQuestions,
      change: 'Ready to use',
      icon: FileQuestion,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Topics Created',
      value: dashboardStats.totalTopics,
      change: `${dashboardStats.totalTeachers} Teachers`,
      icon: FolderTree,
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Completed Tests',
      value: dashboardStats.completedAttempts,
      change: `${dashboardStats.activeAttempts} ongoing`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Active Attempts',
      value: dashboardStats.activeAttempts,
      change: 'In progress',
      icon: Clock,
      color: 'from-mentara-blue to-blue-500',
      bgColor: 'bg-mentara-blue/10'
    },
    {
      title: 'Average Score',
      value: `${dashboardStats.avgScore}%`,
      change: dashboardStats.completedAttempts > 0 ? 'Real data' : 'No data yet',
      icon: Target,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      title: 'Total Attempts',
      value: dashboardStats.completedAttempts + dashboardStats.activeAttempts,
      change: 'All time',
      icon: Activity,
      color: 'from-cyan-500 to-teal-500',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mentara-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-8 bg-gradient-to-br from-mentara-blue/20 via-mentara-surface to-mentara-mint/20 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, Admin! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Here's what's happening with Mentara today
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-mentara-blue to-mentara-mint flex items-center justify-center">
              <Award className="w-12 h-12 text-mentara-dark" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-hover p-6 bg-mentara-surface border border-white/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-full">
                  Live
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
              <div className="flex items-center gap-1 text-xs text-mentara-mint">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary py-4">
            <FileText className="w-5 h-5" />
            Create New Exam
          </button>
          <button className="btn-secondary py-4">
            <FileQuestion className="w-5 h-5" />
            Add Questions
          </button>
          <button className="btn-outline py-4">
            <FolderTree className="w-5 h-5" />
            Create Topic
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 ? (
            dashboardStats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-mentara-blue/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-mentara-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message || 'Activity logged'}</p>
                  <p className="text-xs text-gray-400">{activity.time || 'Recently'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-500 mt-1">Activity will appear here as users interact with the platform</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
