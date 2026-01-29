"""
Backend API Tests for MITA ICT Chatbot Feature
Tests: Chat endpoints, Admin login, Chat sessions management
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mita-sales-bot.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_USERNAME = "vladanmitic@gmail.com"
ADMIN_PASSWORD = "Admin123!"


class TestPublicEndpoints:
    """Test public API endpoints"""
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "MITA ICT" in data["message"]
        print(f"✅ Root endpoint working: {data['message']}")
    
    def test_services_endpoint(self):
        """Test services endpoint"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify service structure
        for service in data:
            assert "title" in service
            assert "description" in service
            assert "id" in service
        print(f"✅ Services endpoint working: {len(data)} services found")
    
    def test_saas_products_endpoint(self):
        """Test SaaS products endpoint"""
        response = requests.get(f"{BASE_URL}/api/saas-products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ SaaS products endpoint working: {len(data)} products found")
    
    def test_about_endpoint(self):
        """Test about content endpoint"""
        response = requests.get(f"{BASE_URL}/api/about")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "content" in data
        print(f"✅ About endpoint working: {data['title']}")


class TestChatbotEndpoints:
    """Test chatbot API endpoints"""
    
    def test_chat_message_new_session(self):
        """Test sending a chat message without session (creates new session)"""
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={"message": "Hello, what services do you offer?"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "session_id" in data
        assert "message" in data
        assert "lead_captured" in data
        
        # Verify session_id is a valid UUID format
        assert len(data["session_id"]) == 36
        
        # Verify AI response is not empty
        assert len(data["message"]) > 0
        
        print(f"✅ Chat message (new session) working: session_id={data['session_id'][:8]}...")
        return data["session_id"]
    
    def test_chat_message_existing_session(self):
        """Test sending a chat message with existing session (multi-turn)"""
        # First message to create session
        response1 = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={"message": "Tell me about IT consulting"}
        )
        assert response1.status_code == 200
        session_id = response1.json()["session_id"]
        
        # Wait a bit for AI processing
        time.sleep(1)
        
        # Second message with same session
        response2 = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={
                "session_id": session_id,
                "message": "What about pricing?"
            }
        )
        assert response2.status_code == 200
        data = response2.json()
        
        # Verify same session is used
        assert data["session_id"] == session_id
        assert len(data["message"]) > 0
        
        print(f"✅ Multi-turn conversation working: session maintained")
    
    def test_chat_lead_capture_email(self):
        """Test lead capture with email in message"""
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={"message": "My email is test_lead@example.com, please contact me"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Lead should be captured
        assert data["lead_captured"] == True
        print(f"✅ Lead capture (email) working: lead_captured={data['lead_captured']}")
    
    def test_chat_lead_capture_phone(self):
        """Test lead capture with phone in message"""
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={"message": "You can reach me at +46 70 123 4567"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Lead should be captured
        assert data["lead_captured"] == True
        print(f"✅ Lead capture (phone) working: lead_captured={data['lead_captured']}")


class TestAdminAuthentication:
    """Test admin authentication endpoints"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
        
        print(f"✅ Admin login working: token received")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={
                "username": "wrong@email.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        print(f"✅ Invalid login rejected correctly: status={response.status_code}")


class TestAdminChatSessions:
    """Test admin chat sessions management"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_chat_sessions(self, auth_token):
        """Test getting all chat sessions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/chat-sessions",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        # Verify session structure if sessions exist
        if len(data) > 0:
            session = data[0]
            assert "id" in session
            assert "lead_captured" in session
            assert "message_count" in session
            assert "created_at" in session
        
        print(f"✅ Get chat sessions working: {len(data)} sessions found")
    
    def test_get_chat_sessions_unauthorized(self):
        """Test getting chat sessions without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/chat-sessions")
        assert response.status_code == 401
        print(f"✅ Unauthorized access rejected correctly")
    
    def test_get_single_chat_session(self, auth_token):
        """Test getting a single chat session with full conversation"""
        # First create a chat session
        chat_response = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={"message": "TEST_session_detail: Hello"}
        )
        session_id = chat_response.json()["session_id"]
        
        # Get the session details
        response = requests.get(
            f"{BASE_URL}/api/admin/chat-sessions/{session_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == session_id
        assert "messages" in data
        assert len(data["messages"]) >= 2  # User message + AI response
        
        print(f"✅ Get single chat session working: {len(data['messages'])} messages")
    
    def test_delete_chat_session(self, auth_token):
        """Test deleting a chat session"""
        # First create a chat session
        chat_response = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={"message": "TEST_delete_session: This will be deleted"}
        )
        session_id = chat_response.json()["session_id"]
        
        # Delete the session
        response = requests.delete(
            f"{BASE_URL}/api/admin/chat-sessions/{session_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(
            f"{BASE_URL}/api/admin/chat-sessions/{session_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert get_response.status_code == 404
        
        print(f"✅ Delete chat session working: session removed")


class TestAdminContacts:
    """Test admin contacts management"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_contacts(self, auth_token):
        """Test getting all contacts"""
        response = requests.get(
            f"{BASE_URL}/api/admin/contacts",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Get contacts working: {len(data)} contacts found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
