import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/saas', label: 'SaaS Store' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header style={{
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '16px 7.6923%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      width: '100%',
      height: '80px',
      zIndex: 10,
      boxSizing: 'border-box'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img 
          src="https://customer-assets.emergentagent.com/job_tech-advisory-4/artifacts/4cxdfavq_Icon.png" 
          alt="MITA ICT Logo - IT and Telecommunications Consulting" 
          style={{ height: '40px', objectFit: 'contain', cursor: 'pointer' }}
        />
        <span style={{ marginLeft: '12px', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
          MITA ICT
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px'
      }} className="desktop-nav">
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              color: isActive(link.path) ? 'var(--brand-active)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: 400,
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = isActive(link.path) ? 'var(--brand-active)' : 'var(--text-muted)'}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-menu-btn"
        style={{
          display: 'none',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '8px'
        }}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }} className="mobile-nav">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isActive(link.path) ? 'var(--brand-active)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 400
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;