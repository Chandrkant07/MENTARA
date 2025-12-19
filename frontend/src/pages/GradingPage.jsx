import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/grading.css';

const BASE_API = import.meta.env.VITE_BASE_API || 'http://127.0.0.1:8000/api';
const getToken = () => localStorage.getItem('access_token');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

function GradingPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState([]);
  const [marks, setMarks] = useState({});
  const [remarks, setRemarks] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  async function loadAttempt() {
    try {
      const res = await fetch(`${BASE_API}/attempts/${attemptId}/review/`, { headers: authHeaders() });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || 'Failed to load attempt for review');
      }
      
      setResponses(data.responses || []);
      
      // Initialize marks and remarks
      const initialMarks = {};
      const initialRemarks = {};
      data.responses?.forEach(r => {
        initialMarks[r.question_id] = r.teacher_mark ?? 0;
        initialRemarks[r.question_id] = r.remarks || '';
      });
      setMarks(initialMarks);
      setRemarks(initialRemarks);
      
      setLoading(false);
    } catch (error) {
      console.error('Load attempt error:', error);
      setLoading(false);
    }
  }

  async function handleGrade(responseId, questionId) {
    try {
      if (!responseId) {
        alert('Missing response id; please refresh the page.');
        return;
      }
      await fetch(`${BASE_API}/responses/${responseId}/grade/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          teacher_mark: marks[questionId],
          remarks: remarks[questionId]
        })
      });
      alert('Graded successfully!');
    } catch (error) {
      console.error('Grade error:', error);
      alert('Failed to grade');
    }
  }

  async function handleUploadPDF() {
    if (!pdfFile) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      
      await fetch(`${BASE_API}/attempts/${attemptId}/upload-pdf/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      
      alert('PDF uploaded successfully!');
      setPdfFile(null);
    } catch (error) {
      console.error('PDF upload error:', error);
      alert('Failed to upload PDF');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="grading-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="grading-container">
      <div className="grading-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1 className="grading-title">Grade Submission</h1>
      </div>

      <div className="grading-content">
        {responses.map((response, idx) => (
          <div key={response.question_id} className="response-card">
            <div className="response-header">
              <h3 className="question-number">Question {idx + 1}</h3>
              <span className={`auto-grade ${response.correct ? 'correct' : 'incorrect'}`}>
                {response.correct ? '✓ Correct' : '✗ Incorrect'} (Auto)
              </span>
            </div>
            
            <div className="question-statement">
              {response.statement}
            </div>

            <div className="student-answer">
              <strong>Student's Answer:</strong>
              <div className="answer-content">
                {JSON.stringify(response.answer)}
              </div>
            </div>

            <div className="grading-inputs">
              <div className="input-group">
                <label>Teacher Mark:</label>
                <input
                  type="number"
                  step="0.5"
                  value={marks[response.question_id] || 0}
                  onChange={(e) => setMarks({ ...marks, [response.question_id]: e.target.value })}
                  className="mark-input"
                />
              </div>

              <div className="input-group">
                <label>Remarks:</label>
                <textarea
                  value={remarks[response.question_id] || ''}
                  onChange={(e) => setRemarks({ ...remarks, [response.question_id]: e.target.value })}
                  className="remarks-textarea"
                  placeholder="Add feedback for student..."
                />
              </div>

              <button 
                onClick={() => handleGrade(response.response_id, response.question_id)}
                className="save-grade-btn"
              >
                Save Grade
              </button>
            </div>
          </div>
        ))}

        {/* PDF Upload Section */}
        <div className="pdf-upload-section">
          <h3 className="section-title">Upload Evaluated PDF</h3>
          <div className="pdf-upload-area">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="pdf-input"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="pdf-label">
              {pdfFile ? pdfFile.name : 'Choose PDF file...'}
            </label>
            <button
              onClick={handleUploadPDF}
              disabled={!pdfFile || saving}
              className="upload-pdf-btn"
            >
              {saving ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradingPage;
