import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import { Button } from './ui/button';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after 1 second
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
        initializeServices(saved);
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const initializeServices = (prefs) => {
    // Initialize analytics if accepted
    if (prefs.analytics) {
      console.log('Analytics cookies enabled');
      // Add your analytics initialization here
    }

    // Initialize marketing if accepted
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
      // Initialize Facebook Pixel, TikTok Pixel, etc.
      window.fbq && window.fbq('consent', 'grant');
      window.ttq && window.ttq.track('Consent', { consent_type: 'granted' });
    }
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    initializeServices(prefs);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      {!showSettings && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            maxWidth: '380px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cookie size={20} color="var(--brand-primary)" />
              <h3 className="body-large" style={{ margin: 0, fontWeight: 600 }}>Cookie Preferences</h3>
            </div>
            <button
              onClick={handleAcceptNecessary}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
              aria-label="Close and accept necessary cookies only"
            >
              <X size={18} color="var(--text-muted)" />
            </button>
          </div>

          <p className="body-small" style={{ marginBottom: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            We use cookies to improve your experience and for marketing on social media. 
            By clicking "Accept All" you consent per GDPR/Swedish law.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              onClick={handleAcceptAll}
              className="btn-primary"
              style={{ flex: 1, minWidth: '100px', padding: '10px 16px', fontSize: '14px' }}
            >
              Accept All
            </Button>
            <Button
              onClick={handleAcceptNecessary}
              className="btn-secondary"
              style={{ flex: 1, minWidth: '100px', padding: '10px 16px', fontSize: '14px' }}
            >
              Necessary Only
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px', fontSize: '14px' }}
            >
              <Settings size={14} />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="heading-1">Cookie-inställningar</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Close settings"
              >
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>

            {/* Necessary Cookies */}
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="heading-2">Nödvändiga cookies</h3>
                <span className="body-small" style={{ color: 'var(--brand-primary)' }}>Alltid aktiv</span>
              </div>
              <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                Dessa cookies är nödvändiga för att webbplatsen ska fungera och kan inte inaktiveras. 
                De används för grundläggande funktioner som autentisering och säkerhet.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="heading-2">Analytiska cookies</h3>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    style={{ marginRight: '8px', cursor: 'pointer', width: '20px', height: '20px' }}
                  />
                </label>
              </div>
              <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                Hjälper oss förstå hur besökare använder webbplatsen för att förbättra användarupplevelsen.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="heading-2">Marknadsförings-cookies</h3>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    style={{ marginRight: '8px', cursor: 'pointer', width: '20px', height: '20px' }}
                  />
                </label>
              </div>
              <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                Används för att spåra besökare över webbplatser för marknadsföringsändamål på sociala medier 
                (Facebook, Instagram, TikTok, LinkedIn, YouTube). Data kan delas med tredje part.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button
                onClick={handleSavePreferences}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Spara inställningar
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Acceptera alla
              </Button>
            </div>

            <p className="body-small" style={{ marginTop: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Läs mer i vår <a href="/privacy" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Integritetspolicy</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
