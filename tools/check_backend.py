
import urllib.request
import urllib.error

url = "http://localhost:8000/api/auth/login/"
print(f"Checking backend availability at: {url}")

try:
    # We expect a 405 Method Not Allowed (since we do GET on a POST endpoint)
    # or 400 Bad Request, or 200 OK.
    # ConnectionRefusedError means server is down.
    req = urllib.request.Request(url, method='GET')
    with urllib.request.urlopen(req) as response:
        print(f"Backend responded with code: {response.getcode()}")
except urllib.error.HTTPError as e:
    print(f"Backend responded with HTTP error: {e.code}")
    if e.code in [405, 400, 401, 403]:
        print("Backend seems RUNNING (responded with expected error for GET request or unauthorized)")
    else:
        print("Backend might be running but returned an error.")
except urllib.error.URLError as e:
    print(f"Connection failed: {e.reason}")
    print("Backend is likely NOT RUNNING.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
