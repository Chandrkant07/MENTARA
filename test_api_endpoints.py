"""
Test script to verify all API endpoints are working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test credentials
ADMIN_USER = {"username": "admin", "password": "admin123"}
STUDENT_USER = {"username": "student", "password": "student123"}

def login(credentials):
    """Login and get access token"""
    try:
        # Try JWT token endpoint first
        response = requests.post(f"http://localhost:8000/accounts/api/auth/login/", json=credentials)
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"Login failed: {response.status_code} - {response.text[:200]}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_exams_api(token):
    """Test exams API endpoint"""
    print("\n" + "="*60)
    print("TESTING EXAMS API")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Test GET /api/exams/
        print("\n1. Testing GET /api/exams/")
        response = requests.get(f"{BASE_URL}/exams/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Found {len(data)} exams")
            if data:
                exam = data[0]
                print(f"   ✓ First exam: {exam.get('title')}")
                print(f"     - ID: {exam.get('id')}")
                print(f"     - Topic: {exam.get('topic_name')}")
                print(f"     - Questions: {exam.get('question_count')}")
                print(f"     - Duration: {exam.get('duration')} min")
                print(f"     - Level: {exam.get('level')}")
                print(f"     - Visibility: {exam.get('visibility')}")
                print(f"     - Active: {exam.get('is_active')}")
                return exam.get('id')
        else:
            print(f"   ✗ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ✗ Exception: {e}")
        return None

def test_topics_api(token):
    """Test topics API endpoint"""
    print("\n" + "="*60)
    print("TESTING TOPICS API")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        print("\n1. Testing GET /api/topics/")
        response = requests.get(f"{BASE_URL}/topics/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Found {len(data)} topics")
            for topic in data[:3]:
                print(f"     - {topic.get('name')} (ID: {topic.get('id')}, Questions: {topic.get('questions_count')})")
        else:
            print(f"   ✗ Error: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Exception: {e}")

def test_questions_api(token):
    """Test questions API endpoint"""
    print("\n" + "="*60)
    print("TESTING QUESTIONS API")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        print("\n1. Testing GET /api/questions/")
        response = requests.get(f"{BASE_URL}/questions/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Found {len(data)} questions")
            if data:
                q = data[0]
                print(f"     - {q.get('statement')[:50]}...")
                print(f"       Type: {q.get('type')}, Marks: {q.get('marks')}")
        else:
            print(f"   ✗ Error: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Exception: {e}")

def test_start_exam(token, exam_id):
    """Test starting an exam"""
    print("\n" + "="*60)
    print("TESTING START EXAM")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        print(f"\n1. Testing POST /api/exams/{exam_id}/start/")
        response = requests.post(f"{BASE_URL}/exams/{exam_id}/start/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Exam started successfully")
            print(f"     - Attempt ID: {data.get('attempt_id')}")
            print(f"     - Expires at: {data.get('expires_at')}")
            print(f"     - Questions: {len(data.get('questions', []))}")
            return data.get('attempt_id')
        else:
            print(f"   ✗ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ✗ Exception: {e}")
        return None

def main():
    print("="*60)
    print("MENTARA API ENDPOINT TEST")
    print("="*60)
    
    # Test as student
    print("\n\nTESTING AS STUDENT USER")
    print("-"*60)
    student_token = login(STUDENT_USER)
    
    if student_token:
        print("✓ Student login successful")
        exam_id = test_exams_api(student_token)
        test_topics_api(student_token)
        test_questions_api(student_token)
        
        if exam_id:
            test_start_exam(student_token, exam_id)
    else:
        print("✗ Student login failed")
    
    # Test as admin
    print("\n\nTESTING AS ADMIN USER")
    print("-"*60)
    admin_token = login(ADMIN_USER)
    
    if admin_token:
        print("✓ Admin login successful")
        test_exams_api(admin_token)
        test_topics_api(admin_token)
        test_questions_api(admin_token)
    else:
        print("✗ Admin login failed")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
