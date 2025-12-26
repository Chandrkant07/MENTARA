import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import './index.css'

// Apply persisted theme early (before first render)
try {
  const savedTheme = localStorage.getItem('mentara_theme');
  if (savedTheme === 'light') document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');
} catch {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
