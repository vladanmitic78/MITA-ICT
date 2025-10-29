import React, { useState } from 'react';
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

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('adminToken', response.data.access_token);
      localStorage.setItem('adminAuth', 'true');
      toast.success('Welcome to the admin dashboard!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Invalid username or password');
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
        ) : null}

        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <span className="body-muted">or</span>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="btn-secondary"
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            borderRadius: '0px',
            fontSize: '18px',
            fontWeight: 500,
            minHeight: '56px'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Connecting...
            </>
          ) : (
            <>
              <Mail size={20} />
              Continue with Google
            </>
          )}
        </Button>

        <p className="body-muted" style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          Demo credentials: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;