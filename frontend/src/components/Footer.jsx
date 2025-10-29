import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-primary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '60px 7.6923% 30px',
      marginTop: '100px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Company Info */}
        <div>
          <img 
            src="https://customer-assets.emergentagent.com/job_tech-advisory-4/artifacts/4cxdfavq_Icon.png" 
            alt="MITA ICT" 
            style={{ height: '40px', marginBottom: '16px' }}
          />
          <p className="body-medium" style={{ marginBottom: '12px' }}>MITA ICT</p>
          <p className="body-muted" style={{ marginBottom: '20px' }}>Where Technology Meets Strategy</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="heading-2" style={{ marginBottom: '20px' }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/" className="body-muted" style={{ textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              Home
            </Link>
            <Link to="/saas" className="body-muted" style={{ textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              SaaS Store
            </Link>
            <Link to="/about" className="body-muted" style={{ textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              About Us
            </Link>
            <Link to="/contact" className="body-muted" style={{ textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              Contact
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="heading-2" style={{ marginBottom: '20px' }}>Contact Us</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={20} color="var(--brand-primary)" />
              <span className="body-muted">info@mitaict.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={20} color="var(--brand-primary)" />
              <span className="body-muted">+46 XXX XXX XXX</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={20} color="var(--brand-primary)" />
              <span className="body-muted">Sweden</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '20px',
        textAlign: 'center'
      }}>
        <p className="body-muted">
          © {new Date().getFullYear()} MITA ICT. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;