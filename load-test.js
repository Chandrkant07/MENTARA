import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'],             // Error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPass123!',
  first_name: 'Test',
  last_name: 'User',
  role: 'student',
};

export function setup() {
  // Register a test user
  const registerRes = http.post(`${BASE_URL}/api/auth/register/`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (registerRes.status !== 201) {
    console.error('Failed to register test user:', registerRes.body);
    return { token: null };
  }
  
  // Login and get token
  const loginRes = http.post(`${BASE_URL}/api/auth/login/`, JSON.stringify({
    email: testUser.email,
    password: testUser.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const token = JSON.parse(loginRes.body).access;
  return { token };
}

export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };
  
  // Test 1: Get user profile
  let res = http.get(`${BASE_URL}/api/users/me/`, { headers });
  check(res, {
    'profile loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);
  
  // Test 2: Get dashboard data
  res = http.get(`${BASE_URL}/api/users/me/attempts/`, { headers });
  check(res, {
    'attempts loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);
  
  // Test 3: Get exams list
  res = http.get(`${BASE_URL}/api/exams/`, { headers });
  check(res, {
    'exams loaded': (r) => r.status === 200,
    'response time ok': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  sleep(1);
  
  // Test 4: Get topics
  res = http.get(`${BASE_URL}/api/topics/`, { headers });
  check(res, {
    'topics loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);
  
  // Test 5: Get leaderboard
  res = http.get(`${BASE_URL}/api/leaderboard/?period=weekly`, { headers });
  check(res, {
    'leaderboard loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(2);
}

export function teardown(data) {
  // Cleanup test user if needed
  console.log('Load test completed');
}
