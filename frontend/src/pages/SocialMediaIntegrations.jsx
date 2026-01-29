import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Linkedin, Play, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { adminAPI } from '../api';

const SocialMediaIntegrations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState({});
  const [integrations, setIntegrations] = useState({
    facebook: {
      enabled: false,
      pixelId: '',
      accessToken: '',
      pageId: '',
      appId: '',
      appSecret: '',
    },
    instagram: {
      enabled: false,
      accessToken: '',
      businessAccountId: '',
    },
    tiktok: {
      enabled: false,
      pixelId: '',
      accessToken: '',
      advertis
erId: '',
    },
    linkedin: {
      enabled: false,
      partnerId: '',
      accessToken: '',
      organizationId: '',
    },
    youtube: {
      enabled: false,
      apiKey: '',
      channelId: '',
      clientId: '',
      clientSecret: '',
    },
  });

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('adminAuth');
      const token = localStorage.getItem('adminToken');
      if (!isAuth || !token) {
        toast.error('Please log in to access this page');
        navigate('/admin');
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      loadIntegrations();
    }
  }, [navigate]);

  const loadIntegrations = async () => {
    try {
      const response = await adminAPI.getSocialIntegrations();
      if (response.data) {
        setIntegrations(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading integrations:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await adminAPI.updateSocialIntegrations(integrations);
      toast.success('Social media integrations updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save integrations');
    }
  };

  const toggleShowSecret = (platform, field) => {
    setShowSecrets({
      ...showSecrets,
      [`${platform}-${field}`]: !showSecrets[`${platform}-${field}`],
    });
  };

  const renderSecretInput = (platform, field, value, label) => {
    const key = `${platform}-${field}`;
    const isVisible = showSecrets[key];

    return (
      <div style={{ marginBottom: '16px' }}>
        <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <Input
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={(e) =>
              setIntegrations({
                ...integrations,
                [platform]: { ...integrations[platform], [field]: e.target.value },
              })
            }
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '0px',
              padding: '14px 50px 14px 14px',
              fontSize: '16px',
              width: '100%',
            }}
          />
          <button
            type="button"
            onClick={() => toggleShowSecret(platform, field)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label={isVisible ? 'Hide' : 'Show'}
          >
            {isVisible ? <EyeOff size={20} color="var(--text-muted)" /> : <Eye size={20} color="var(--text-muted)" />}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="body-large">Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 7.6923%' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="display-large" style={{ marginBottom: '12px' }}>
            Social Media Integrations
          </h1>
          <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
            Configure social media platforms for marketing and analytics tracking (GDPR-compliant)
          </p>
        </div>

        {/* Facebook Integration */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Facebook size={32} color="#1877F2" />
              <div>
                <h2 className="heading-1">Facebook</h2>
                <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                  Facebook Pixel & Marketing API
                </p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={integrations.facebook.enabled}
                onChange={(e) =>
                  setIntegrations({
                    ...integrations,
                    facebook: { ...integrations.facebook, enabled: e.target.checked },
                  })
                }
                style={{ marginRight: '8px', cursor: 'pointer', width: '20px', height: '20px' }}
              />
              <span className="body-medium">Enabled</span>
            </label>
          </div>

          {integrations.facebook.enabled && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Pixel ID
                </label>
                <Input
                  value={integrations.facebook.pixelId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      facebook: { ...integrations.facebook, pixelId: e.target.value },
                    })
                  }
                  placeholder="123456789012345"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              {renderSecretInput('facebook', 'accessToken', integrations.facebook.accessToken, 'Access Token')}

              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Page ID
                </label>
                <Input
                  value={integrations.facebook.pageId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      facebook: { ...integrations.facebook, pageId: e.target.value },
                    })
                  }
                  placeholder="Your Facebook Page ID"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  App ID
                </label>
                <Input
                  value={integrations.facebook.appId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      facebook: { ...integrations.facebook, appId: e.target.value },
                    })
                  }
                  placeholder="Your App ID"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              {renderSecretInput('facebook', 'appSecret', integrations.facebook.appSecret, 'App Secret')}

              <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                Get your credentials from{' '}
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}
                >
                  Facebook for Developers
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Instagram Integration */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Instagram size={32} color="#E4405F" />
              <div>
                <h2 className="heading-1">Instagram</h2>
                <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                  Instagram Business API
                </p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={integrations.instagram.enabled}
                onChange={(e) =>
                  setIntegrations({
                    ...integrations,
                    instagram: { ...integrations.instagram, enabled: e.target.checked },
                  })
                }
                style={{ marginRight: '8px', cursor: 'pointer', width: '20px', height: '20px' }}
              />
              <span className="body-medium">Enabled</span>
            </label>
          </div>

          {integrations.instagram.enabled && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              {renderSecretInput('instagram', 'accessToken', integrations.instagram.accessToken, 'Access Token')}

              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Business Account ID
                </label>
                <Input
                  value={integrations.instagram.businessAccountId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      instagram: { ...integrations.instagram, businessAccountId: e.target.value },
                    })
                  }
                  placeholder="Your Instagram Business Account ID"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                Requires Facebook Business Account. Get credentials from{' '}
                <a
                  href="https://developers.facebook.com/products/instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}
                >
                  Instagram API
                </a>
              </p>
            </div>
          )}
        </div>

        {/* TikTok Integration */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Play size={32} color="#000000" style={{ background: '#fff', borderRadius: '4px', padding: '4px' }} />
              <div>
                <h2 className="heading-1">TikTok</h2>
                <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                  TikTok Pixel & Marketing API
                </p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={integrations.tiktok.enabled}
                onChange={(e) =>
                  setIntegrations({
                    ...integrations,
                    tiktok: { ...integrations.tiktok, enabled: e.target.checked },
                  })
                }
                style={{ marginRight: '8px', cursor: 'pointer', width: '20px', height: '20px' }}
              />
              <span className="body-medium">Enabled</span>
            </label>
          </div>

          {integrations.tiktok.enabled && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Pixel ID
                </label>
                <Input
                  value={integrations.tiktok.pixelId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      tiktok: { ...integrations.tiktok, pixelId: e.target.value },
                    })
                  }
                  placeholder="ABCDEFG1234567"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              {renderSecretInput('tiktok', 'accessToken', integrations.tiktok.accessToken, 'Access Token')}

              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Advertiser ID
                </label>
                <Input
                  value={integrations.tiktok.advertiserId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      tiktok: { ...integrations.tiktok, advertiserId: e.target.value },
                    })
                  }
                  placeholder="Your Advertiser ID"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                Get your credentials from{' '}
                <a
                  href="https://ads.tiktok.com/marketing_api/homepage"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}
                >
                  TikTok for Business
                </a>
              </p>
            </div>
          )}
        </div>

        {/* LinkedIn Integration */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Linkedin size={32} color="#0A66C2" />
              <div>
                <h2 className="heading-1">LinkedIn</h2>
                <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                  LinkedIn Insight Tag & Marketing
                </p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={integrations.linkedin.enabled}
                onChange={(e) =>
                  setIntegrations({
                    ...integrations,
                    linkedin: { ...integrations.linkedin, enabled: e.target.checked },
                  })
                }
                style={{ marginRight: '8px', cursor: 'pointer', width: '20px', height: '20px' }}
              />
              <span className="body-medium">Enabled</span>
            </label>
          </div>

          {integrations.linkedin.enabled && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Partner ID (Insight Tag)
                </label>
                <Input
                  value={integrations.linkedin.partnerId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      linkedin: { ...integrations.linkedin, partnerId: e.target.value },
                    })
                  }
                  placeholder="1234567"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              {renderSecretInput('linkedin', 'accessToken', integrations.linkedin.accessToken, 'Access Token')}

              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Organization ID
                </label>
                <Input
                  value={integrations.linkedin.organizationId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      linkedin: { ...integrations.linkedin, organizationId: e.target.value },
                    })
                  }
                  placeholder="Your Organization ID"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                Get your credentials from{' '}
                <a
                  href="https://business.linkedin.com/marketing-solutions/insight-tag"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}
                >
                  LinkedIn Marketing
                </a>
              </p>
            </div>
          )}
        </div>

        {/* YouTube Integration */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Youtube size={32} color="#FF0000" />
              <div>
                <h2 className="heading-1">YouTube</h2>
                <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                  YouTube Data API & Analytics
                </p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={integrations.youtube.enabled}
                onChange={(e) =>
                  setIntegrations({
                    ...integrations,
                    youtube: { ...integrations.youtube, enabled: e.target.checked },
                  })
                }
                style={{ marginRight: '8px', cursor: 'pointer', width: '20px', height: '20px' }}
              />
              <span className="body-medium">Enabled</span>
            </label>
          </div>

          {integrations.youtube.enabled && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              {renderSecretInput('youtube', 'apiKey', integrations.youtube.apiKey, 'API Key')}

              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Channel ID
                </label>
                <Input
                  value={integrations.youtube.channelId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      youtube: { ...integrations.youtube, channelId: e.target.value },
                    })
                  }
                  placeholder="UCxxxxxxxxxxxxxxxxxxxxx"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Client ID
                </label>
                <Input
                  value={integrations.youtube.clientId}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      youtube: { ...integrations.youtube, clientId: e.target.value },
                    })
                  }
                  placeholder="Your Client ID"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />
              </div>

              {renderSecretInput('youtube', 'clientSecret', integrations.youtube.clientSecret, 'Client Secret')}

              <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                Get your credentials from{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}
                >
                  Google Cloud Console
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
          <Button onClick={() => navigate('/admin/dashboard')} className="btn-secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={20} />
            Save All Integrations
          </Button>
        </div>

        {/* GDPR Notice */}
        <div
          style={{
            background: 'rgba(0, 217, 255, 0.1)',
            border: '1px solid var(--brand-primary)',
            padding: '20px',
            marginTop: '32px',
          }}
        >
          <h3 className="heading-2" style={{ marginBottom: '12px', color: 'var(--brand-primary)' }}>
            GDPR & Swedish Law Compliance
          </h3>
          <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            These integrations will only activate when users consent to marketing cookies through the cookie banner.
            All tracking complies with Swedish data protection laws and GDPR regulations.
          </p>
          <ul className="body-small" style={{ color: 'var(--text-muted)', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>User consent is required before any tracking pixels are loaded</li>
            <li style={{ marginBottom: '8px' }}>Users can withdraw consent at any time</li>
            <li style={{ marginBottom: '8px' }}>Data is processed according to GDPR Article 6(1)(a) - Consent</li>
            <li style={{ marginBottom: '8px' }}>Marketing data is stored for maximum 13 months</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaIntegrations;
