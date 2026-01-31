import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { authAPI } from '../api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  // Check localStorage availability on mount
  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const testKey = '__test_localStorage__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('✅ localStorage is available');
        return true;
      } catch (e) {
        console.error('❌ localStorage is NOT available:', e);
        toast.error('Your browser does not support localStorage. Please enable it or try a different browser.');
        return false;
      }
    };
    
    checkLocalStorage();
    
    // Log browser info for debugging
    console.log('Browser info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    });
  }, []);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check localStorage before attempting login
    try {
      const testKey = '__test_localStorage__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (storageError) {
      console.error('localStorage test failed:', storageError);
      toast.error('Unable to access browser storage. Please check your browser settings.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Login attempt started');
      console.log('Username:', credentials.username);
      console.log('API URL:', process.env.REACT_APP_BACKEND_URL);
      
      const response = await authAPI.login(credentials);
      console.log('✅ Login response received:', {
        hasData: !!response?.data,
        hasToken: !!response?.data?.access_token,
        responseStatus: response?.status
      });
      
      if (response && response.data && response.data.access_token) {
        const token = response.data.access_token;
        
        // Store token with additional error handling
        try {
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminAuth', 'true');
          
          // Verify token was stored
          const storedToken = localStorage.getItem('adminToken');
          if (storedToken !== token) {
            throw new Error('Token storage verification failed');
          }
          
          console.log('✅ Token stored and verified successfully');
          toast.success('Welcome to the admin dashboard!');
          
          // Small delay to ensure state is saved
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 100);
          
        } catch (storageError) {
          console.error('❌ Token storage failed:', storageError);
          toast.error('Failed to save login session. Please check your browser settings.');
          throw storageError;
        }
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.detail || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        console.error('No response received from server');
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else {
        // Error in request setup
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.googleLogin();
      localStorage.setItem('adminToken', response.data.access_token);
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('authMethod', 'google');
      toast.success('Welcome to the admin dashboard!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      paddingTop: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Lock size={48} color="var(--brand-primary)" style={{ margin: '0 auto 20px' }} />
          <h1 className="display-large" style={{ marginBottom: '12px' }}>Admin Login</h1>
          <p className="body-medium" style={{ color: 'var(--text-muted)' }}>Access your dashboard</p>
        </div>

        {/* Password Login Form */}
        <form onSubmit={handlePasswordLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="username" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px 14px 14px 44px',
                    fontSize: '16px',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label htmlFor="password" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px 14px 14px 44px',
                    fontSize: '16px',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                background: 'var(--brand-primary)',
                color: '#000000',
                borderRadius: '0px',
                fontSize: '18px',
                fontWeight: 500,
                minHeight: '56px',
                marginBottom: '16px'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
      </div>
    </div>
  );
};

export default AdminLogin;