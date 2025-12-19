import React from 'react';
import PropTypes from 'prop-types';

function ProgressRing({ size = 120, stroke = 10, percent = 0, label = '' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="progress-ring-wrapper" aria-label="Progress ring">
      <svg width={size} height={size}>
        <circle stroke="rgba(255,255,255,0.12)" fill="transparent" strokeWidth={stroke} r={radius} cx={size / 2} cy={size / 2} />
        <circle stroke="url(#ringGradient)" fill="transparent" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} r={radius} cx={size / 2} cy={size / 2} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7CE7FF" />
            <stop offset="100%" stopColor="#00C2A8" />
          </linearGradient>
        </defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="700">{label}</text>
      </svg>
    </div>
  );
}

ProgressRing.propTypes = { size: PropTypes.number, stroke: PropTypes.number, percent: PropTypes.number, label: PropTypes.string };
export default ProgressRing;
