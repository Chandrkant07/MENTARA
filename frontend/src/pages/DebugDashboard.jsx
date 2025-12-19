import { useState, useEffect } from 'react';
import api from '../services/api';

const DebugDashboard = () => {
  const [data, setData] = useState({ exams: [], loading: true, error: null });

  useEffect(() => {
    console.log('=== DEBUG DASHBOARD LOADING ===');
    console.log('API Base URL:', api.defaults.baseURL);
    console.log('Full URL will be:', api.defaults.baseURL + '/exams/');
    
    // Test direct API call
    api.get('/exams/')
      .then(response => {
        console.log('SUCCESS! Raw response:', response);
        console.log('Exams data:', response.data);
        setData({ exams: response.data, loading: false, error: null });
      })
      .catch(error => {
        console.error('ERROR! Details:', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        console.error('Request URL was:', error.config?.url);
        console.error('Base URL:', error.config?.baseURL);
        console.error('Full URL:', error.config?.baseURL + error.config?.url);
        
        let errorMsg = error.message;
        if (error.response) {
          errorMsg += ` (Status: ${error.response.status})`;
        }
        if (error.config) {
          errorMsg += ` - URL: ${error.config.baseURL}${error.config.url}`;
        }
        
        setData({ exams: [], loading: false, error: errorMsg });
      });
  }, []);

  if (data.loading) {
    return <div style={{padding: '20px', color: 'white'}}>Loading...</div>;
  }

  if (data.error) {
    return (
      <div style={{padding: '20px', color: 'red', backgroundColor: '#1a1a1a', minHeight: '100vh'}}>
        <h1>ERROR</h1>
        <p>{data.error}</p>
        <p>Check browser console for details</p>
      </div>
    );
  }

  return (
    <div style={{padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh'}}>
      <h1>Debug Dashboard - Exams Loaded: {data.exams.length}</h1>
      {data.exams.map(exam => (
        <div key={exam.id} style={{border: '1px solid #333', padding: '10px', margin: '10px 0'}}>
          <h2>{exam.title}</h2>
          <p>ID: {exam.id}</p>
          <p>Topic: {exam.topic_name}</p>
          <p>Duration: {exam.duration} min</p>
          <p>Questions: {exam.question_count}</p>
          <p>Level: {exam.level}</p>
        </div>
      ))}
    </div>
  );
};

export default DebugDashboard;
