import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { adminAPI } from '../api';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await adminAPI.changePassword({
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword
      });
      
      toast.success('Password updated successfully! Please login again.');
      
      // Logout and redirect
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminToken');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '24px 7.6923%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Button onClick={() => navigate('/admin/dashboard')} className="btn-secondary">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
          <h1 className="display-large">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 7.6923%' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <Lock size={32} color="var(--brand-primary)" />
              <h2 className="heading-1">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="currentPassword" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Current Password *
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  required
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="newPassword" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  New Password *
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px'
                  }}
                />
                <p className="body-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                  Must be at least 6 characters long
                </p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label htmlFor="confirmPassword" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Confirm New Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdating}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {isUpdating ? 'Updating...' : (
                  <>
                    <Save size={20} />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            marginTop: '24px'
          }}>
            <h3 className="heading-2" style={{ marginBottom: '12px' }}>Security Information</h3>
            <p className="body-medium" style={{ marginBottom: '8px' }}>
              • Your admin account is protected with username/password authentication
            </p>
            <p className="body-medium" style={{ marginBottom: '8px' }}>
              • Admin login page is hidden from regular users
            </p>
            <p className="body-medium">
              • Only you can access the admin panel with your credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
