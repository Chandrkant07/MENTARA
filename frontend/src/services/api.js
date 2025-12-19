import axios from 'axios';

// Base API URL - adjust for production
const API_BASE_URL = (import.meta.env.VITE_BASE_API || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ===================
// Auth API
// ===================
export const authAPI = {
  login: (username, password) => 
    api.post('auth/login/', { username, password }),
  
  register: (userData) => 
    api.post('auth/register/', userData),
  
  logout: () => 
    api.post('auth/logout/', {
      refresh: localStorage.getItem('refresh_token')
    }),
  
  requestPasswordReset: (email) => 
    api.post('auth/password-reset/', { email }),
  
  confirmPasswordReset: (token, password) => 
    api.post('auth/password-reset/confirm/', { token, password }),
  
  verifyEmail: (token) => 
    api.post('auth/verify-email/', { token }),
};

// ===================
// Exams API
// ===================
export const examsAPI = {
  // Get all exams
  getExams: (params = {}) => 
    api.get('exams/', { params }),
  
  // Get single exam
  getExam: (id) => 
    api.get(`exams/${id}/`),
  
  // Start an exam attempt
  startExam: (examId) => 
    api.post(`exams/${examId}/start/`),
  
  // Submit exam
  submitExam: (attemptId) => 
    api.post(`attempts/${attemptId}/submit/`),
  
  // Get exam questions
  getExamQuestions: (examId) => 
    api.get(`exams/${examId}/questions/`),
};

// ===================
// Questions API
// ===================
export const questionsAPI = {
  getQuestions: (params = {}) => 
    api.get('questions/', { params }),
  
  getQuestion: (id) => 
    api.get(`questions/${id}/`),
  
  createQuestion: (data) => 
    api.post('questions/', data),
  
  updateQuestion: (id, data) => 
    api.put(`questions/${id}/`, data),
  
  deleteQuestion: (id) => 
    api.delete(`questions/${id}/`),
};

// ===================
// Topics API
// ===================
export const topicsAPI = {
  getTopics: () => 
    api.get('topics/'),
  
  getTopic: (id) => 
    api.get(`topics/${id}/`),
  
  createTopic: (data) => 
    api.post('topics/', data),
  
  updateTopic: (id, data) => 
    api.put(`topics/${id}/`, data),
};

// ===================
// Attempts API
// ===================
export const attemptsAPI = {
  // Get user attempts
  getMyAttempts: (params = {}) => 
    api.get('attempts/', { params }),
  
  // Get specific attempt
  getAttempt: (id) => 
    api.get(`attempts/${id}/`),
  
  // Get attempt review/results
  getAttemptReview: (id) => 
    api.get(`attempts/${id}/review/`),
  
  // Save answer for a question
  saveResponse: (attemptId, questionId, answer) => 
    api.post('responses/', {
      attempt: attemptId,
      question: questionId,
      answer_payload: answer,
    }),
};

// ===================
// Analytics API
// ===================
export const analyticsAPI = {
  // Get user topic performance
  getUserTopicAnalytics: (userId = 'me') => 
    api.get(`analytics/user/${userId}/topics/`),
  
  // Get leaderboard
  getLeaderboard: (period = 'weekly') => 
    api.get(`leaderboard/`, { params: { period } }),
  
  // Get user stats
  getUserStats: (userId = 'me') => 
    api.get(`analytics/user/${userId}/stats/`),
};

// ===================
// User API
// ===================
export const userAPI = {
  // Get current user profile
  getMe: () => 
    api.get('users/me/'),
  
  // Update profile
  updateProfile: (data) => 
    api.patch('users/me/', data),
  
  // Get user attempts
  getMyAttempts: () => 
    api.get('users/me/attempts/'),
  
  // Get user stats
  getStats: () =>
    api.get('users/stats/'),
};

// ===================
// File Upload API
// ===================
export const uploadAPI = {
  // Upload answer file (for structured questions)
  uploadAnswer: (file, attemptId, questionId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attempt', attemptId);
    formData.append('question', questionId);
    
    return api.post('/uploads/answer/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Upload evaluated PDF (teacher)
  uploadEvaluatedPDF: (file, attemptId) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(`/attempts/${attemptId}/upload-pdf/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ===================
// Convenience methods on default api object
// ===================
// Add all convenience methods to the api object for backward compatibility
api.getExams = examsAPI.getExams;
api.getExam = examsAPI.getExam;
api.startExam = examsAPI.startExam;
api.submitExam = examsAPI.submitExam;
api.getExamQuestions = examsAPI.getExamQuestions;

api.getQuestions = questionsAPI.getQuestions;
api.getQuestion = questionsAPI.getQuestion;
api.createQuestion = questionsAPI.createQuestion;
api.updateQuestion = questionsAPI.updateQuestion;
api.deleteQuestion = questionsAPI.deleteQuestion;

api.getTopics = topicsAPI.getTopics;
api.getTopic = topicsAPI.getTopic;
api.createTopic = topicsAPI.createTopic;
api.updateTopic = topicsAPI.updateTopic;

api.getMyAttempts = attemptsAPI.getMyAttempts;
api.getAttempt = attemptsAPI.getAttempt;
api.getAttemptReview = attemptsAPI.getAttemptReview;
api.getAttemptResult = (id) => api.get(`attempts/${id}/review/`);
api.saveResponse = attemptsAPI.saveResponse;

api.getUserTopicAnalytics = analyticsAPI.getUserTopicAnalytics;
api.getLeaderboard = analyticsAPI.getLeaderboard;
api.getUserStats = analyticsAPI.getUserStats;
api.getUserAnalytics = async () => {
  // Get user stats from attempts
  try {
    const attemptsRes = await api.get('users/me/attempts/');
    const attempts = attemptsRes.data.attempts || [];
    const completed = attempts.filter(a => a.status === 'submitted' || a.status === 'timedout');
    const total_attempts = completed.length;
    const average_score = completed.length > 0 
      ? completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length 
      : 0;
    
    return {
      data: {
        total_attempts,
        average_score: Math.round(average_score),
        current_streak: 0
      }
    };
  } catch (err) {
    return { data: { total_attempts: 0, average_score: 0, current_streak: 0 } };
  }
};

api.getMe = userAPI.getMe;
api.updateProfile = userAPI.updateProfile;
api.getUserAttempts = async () => {
  const response = await api.get('users/me/attempts/');
  // Unwrap the {attempts: [...]} response to just [...]
  return { data: response.data.attempts || response.data || [] };
};
api.getStats = userAPI.getStats;

api.uploadAnswer = uploadAPI.uploadAnswer;
api.uploadEvaluatedPDF = uploadAPI.uploadEvaluatedPDF;

// Auth methods
api.login = authAPI.login;
api.register = authAPI.register;
api.logout = authAPI.logout;

export default api;
