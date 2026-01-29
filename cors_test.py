#!/usr/bin/env python3
"""
Specific CORS and Browser Compatibility Test
"""

import requests
import json

BASE_URL = "https://mita-sales-bot.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_cors_detailed():
    """Test CORS configuration in detail"""
    print("🌍 Detailed CORS Testing...")
    
    # Test regular POST request to see CORS headers
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"username": "admin", "password": "admin123"},
            headers={
                "Content-Type": "application/json",
                "Origin": "https://example.com"  # Simulate cross-origin request
            }
        )
        
        print(f"POST /admin/login Status: {response.status_code}")
        print("CORS Headers in POST response:")
        cors_headers = [
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials", 
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
            "Access-Control-Expose-Headers"
        ]
        
        for header in cors_headers:
            value = response.headers.get(header, "NOT PRESENT")
            print(f"  {header}: {value}")
            
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful, token received: {data.get('token_type', 'unknown')}")
        else:
            print(f"❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing POST: {e}")
    
    print("\n" + "-" * 50)
    
    # Test GET request to see CORS headers
    try:
        response = requests.get(
            f"{API_BASE}/services",
            headers={"Origin": "https://example.com"}
        )
        
        print(f"GET /services Status: {response.status_code}")
        print("CORS Headers in GET response:")
        
        for header in cors_headers:
            value = response.headers.get(header, "NOT PRESENT")
            print(f"  {header}: {value}")
            
    except Exception as e:
        print(f"❌ Error testing GET: {e}")

def test_browser_simulation():
    """Simulate browser behavior"""
    print("\n🖥️ Browser Simulation Test...")
    
    # Simulate browser headers
    browser_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Origin": "https://mita-sales-bot.preview.emergentagent.com",
        "Referer": "https://mita-sales-bot.preview.emergentagent.com/admin/login"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"username": "admin", "password": "admin123"},
            headers={**browser_headers, "Content-Type": "application/json"}
        )
        
        print(f"Browser-like request Status: {response.status_code}")
        print(f"Response time: {response.elapsed.total_seconds():.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Browser-like login successful")
            print(f"Token type: {data.get('token_type')}")
            print(f"Token length: {len(data.get('access_token', ''))}")
        else:
            print(f"❌ Browser-like login failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error in browser simulation: {e}")

if __name__ == "__main__":
    test_cors_detailed()
    test_browser_simulation()