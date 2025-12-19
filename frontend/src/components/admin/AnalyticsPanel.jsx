import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    completionRate: 0,
    avgScore: 0,
    topTopics: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('admin/analytics/');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const statCards = [
    {
      title: 'Active Users',
      value: analytics.activeUsers,
      change: 'Last 7 days',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Avg Completion Rate',
      value: `${analytics.completionRate}%`,
      change: 'Real-time data',
      icon: Target,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Average Score',
      value: `${analytics.avgScore}%`,
      change: 'All attempts',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Attempts',
      value: analytics.totalAttempts || 0,
      change: 'All time',
      icon: Activity,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-hover p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Test Completion Trend</h3>
          <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Topic Performance</h3>
          <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      {/* Top Topics */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Top Performing Topics</h3>
        <div className="space-y-3">
          {analytics.topTopics && analytics.topTopics.length > 0 ? (
            analytics.topTopics.slice(0, 5).map((topic, index) => (
              <div key={topic.id || index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-mentara-blue/20 text-mentara-blue font-bold flex items-center justify-center text-sm">
                    #{index + 1}
                  </span>
                  <span className="text-white">{topic.name || 'Unnamed Topic'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{topic.attempts || 0} attempts</span>
                  <span className="text-sm font-semibold text-mentara-mint">{topic.avg_score || 0}% avg</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No topic data available</p>
              <p className="text-sm text-gray-500 mt-1">Data will appear as students complete tests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
