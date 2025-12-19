import React from 'react';
import ExamManagerNew from '../components/admin/ExamManagerNew';
import '../styles/premium-theme.css';

function TeacherExams() {
  return (
    <div className="min-h-screen bg-mentara-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-4">Exams</h1>
        <ExamManagerNew />
      </div>
    </div>
  );
}

export default TeacherExams;
