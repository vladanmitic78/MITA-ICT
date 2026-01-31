#!/usr/bin/env python3
"""
MITA ICT Backend API Testing Suite
Focus: Admin Authentication Flow and API Endpoints
"""

import requests
import json
import time
from datetime import datetime
import sys

# Configuration
BASE_URL = "https://tech-consult-13.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_admin_login(self):
        """Test admin login endpoint - HIGH PRIORITY"""
        print("\n🔐 Testing Admin Login Endpoint...")
        
        try:
            # Test with correct credentials
            login_data = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{API_BASE}/admin/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            response_time = time.time() - start_time
            
            # Check CORS headers
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.access_token = data["access_token"]
                    self.log_test(
                        "Admin Login - Valid Credentials",
                        True,
                        f"Login successful, token received (Response time: {response_time:.2f}s)",
                        {"token_type": data["token_type"], "cors_headers": cors_headers}
                    )
                else:
                    self.log_test(
                        "Admin Login - Valid Credentials",
                        False,
                        "Login response missing required fields",
                        data
                    )
            else:
                self.log_test(
                    "Admin Login - Valid Credentials",
                    False,
                    f"Login failed with status {response.status_code}",
                    response.json() if response.content else {"status_code": response.status_code}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Admin Login - Valid Credentials",
                False,
                f"Network error: {str(e)}"
            )
        
        # Test with incorrect credentials
        try:
            invalid_login_data = {
                "username": "wrong_user",
                "password": "wrong_pass"
            }
            
            response = self.session.post(
                f"{API_BASE}/admin/login",
                json=invalid_login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test(
                    "Admin Login - Invalid Credentials",
                    True,
                    "Correctly rejected invalid credentials with 401"
                )
            else:
                self.log_test(
                    "Admin Login - Invalid Credentials",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.json() if response.content else {"status_code": response.status_code}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Admin Login - Invalid Credentials",
                False,
                f"Network error: {str(e)}"
            )
    
    def test_protected_endpoints(self):
        """Test protected endpoints that require authentication"""
        print("\n🔒 Testing Protected Endpoints...")
        
        if not self.access_token:
            self.log_test(
                "Protected Endpoints Test",
                False,
                "No access token available - skipping protected endpoint tests"
            )
            return
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test GET /api/admin/contacts
        try:
            response = self.session.get(f"{API_BASE}/admin/contacts", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "GET /api/admin/contacts - With Token",
                    True,
                    f"Successfully retrieved contacts (count: {len(data) if isinstance(data, list) else 'unknown'})"
                )
            else:
                self.log_test(
                    "GET /api/admin/contacts - With Token",
                    False,
                    f"Failed with status {response.status_code}",
                    response.json() if response.content else {"status_code": response.status_code}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "GET /api/admin/contacts - With Token",
                False,
                f"Network error: {str(e)}"
            )
        
        # Test without token (should get 401)
        try:
            response = self.session.get(f"{API_BASE}/admin/contacts", timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "GET /api/admin/contacts - Without Token",
                    True,
                    "Correctly rejected request without token (401)"
                )
            else:
                self.log_test(
                    "GET /api/admin/contacts - Without Token",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.json() if response.content else {"status_code": response.status_code}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "GET /api/admin/contacts - Without Token",
                False,
                f"Network error: {str(e)}"
            )
    
    def test_public_endpoints(self):
        """Test public endpoints that should work without authentication"""
        print("\n🌐 Testing Public Endpoints...")
        
        public_endpoints = [
            ("/services", "GET Services"),
            ("/saas-products", "GET SaaS Products"),
            ("/about", "GET About Content"),
            ("/", "Root Endpoint")
        ]
        
        for endpoint, test_name in public_endpoints:
            try:
                response = self.session.get(f"{API_BASE}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test(
                        test_name,
                        True,
                        f"Successfully retrieved data (status: {response.status_code})"
                    )
                else:
                    self.log_test(
                        test_name,
                        False,
                        f"Failed with status {response.status_code}",
                        response.json() if response.content else {"status_code": response.status_code}
                    )
                    
            except requests.exceptions.RequestException as e:
                self.log_test(
                    test_name,
                    False,
                    f"Network error: {str(e)}"
                )
    
    def test_error_handling(self):
        """Test error handling for various scenarios"""
        print("\n⚠️ Testing Error Handling...")
        
        # Test 404 - Invalid endpoint
        try:
            response = self.session.get(f"{API_BASE}/nonexistent-endpoint", timeout=10)
            
            if response.status_code == 404:
                self.log_test(
                    "404 Error Handling",
                    True,
                    "Correctly returned 404 for invalid endpoint"
                )
            else:
                self.log_test(
                    "404 Error Handling",
                    False,
                    f"Expected 404, got {response.status_code}",
                    response.json() if response.content else {"status_code": response.status_code}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "404 Error Handling",
                False,
                f"Network error: {str(e)}"
            )
        
        # Test 400 - Malformed login request
        try:
            response = self.session.post(
                f"{API_BASE}/admin/login",
                json={"invalid": "data"},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code in [400, 422]:  # 422 is also acceptable for validation errors
                self.log_test(
                    "400/422 Error Handling - Malformed Request",
                    True,
                    f"Correctly rejected malformed request ({response.status_code})"
                )
            else:
                self.log_test(
                    "400/422 Error Handling - Malformed Request",
                    False,
                    f"Expected 400/422, got {response.status_code}",
                    response.json() if response.content else {"status_code": response.status_code}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "400/422 Error Handling - Malformed Request",
                False,
                f"Network error: {str(e)}"
            )
    
    def test_cors_headers(self):
        """Test CORS headers specifically"""
        print("\n🌍 Testing CORS Headers...")
        
        try:
            # Test OPTIONS request (preflight)
            response = self.session.options(f"{API_BASE}/admin/login", timeout=10)
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
                "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials")
            }
            
            # Check if CORS headers are present
            has_cors = any(cors_headers.values())
            
            if has_cors:
                self.log_test(
                    "CORS Headers - OPTIONS Request",
                    True,
                    "CORS headers present in OPTIONS response",
                    cors_headers
                )
            else:
                self.log_test(
                    "CORS Headers - OPTIONS Request",
                    False,
                    "No CORS headers found in OPTIONS response",
                    cors_headers
                )
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "CORS Headers - OPTIONS Request",
                False,
                f"Network error: {str(e)}"
            )
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting MITA ICT Backend API Tests")
        print(f"📍 Testing against: {BASE_URL}")
        print(f"🔑 Admin credentials: {ADMIN_USERNAME} / {'*' * len(ADMIN_PASSWORD)}")
        print("=" * 60)
        
        # Run tests in priority order
        self.test_admin_login()          # HIGH PRIORITY
        self.test_protected_endpoints()   # HIGH PRIORITY
        self.test_public_endpoints()      # MEDIUM PRIORITY
        self.test_cors_headers()         # HIGH PRIORITY (for browser compatibility)
        self.test_error_handling()       # LOW PRIORITY
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed. Check the details above.")
        sys.exit(1)