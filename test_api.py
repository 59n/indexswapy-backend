import requests
import json

def test_api():
    base_url = "http://localhost:8080"
    endpoints = ["/", "/api/ratios", "/ratios", "/data"]
    
    for endpoint in endpoints:
        url = base_url + endpoint
        print(f"\nTesting endpoint: {url}")
        try:
            response = requests.get(url)
            print(f"Status code: {response.status_code}")
            print("Response:")
            print(json.dumps(response.json(), indent=2))
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_api() 