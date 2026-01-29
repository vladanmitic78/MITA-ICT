import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Network, Building2, Users, ArrowRight } from 'lucide-react';
import { publicAPI } from '../api';

const iconMap = {
  Network: Network,
  Building2: Building2,
  Users: Users
};

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await publicAPI.getServices();
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Set empty array on error to prevent undefined issues
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero Section - SEO Optimized */}
      <section style={{
        padding: '100px 7.6923%',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ maxWidth: '900px' }}>
          <h1 className="display-huge" style={{ marginBottom: '24px' }}>
            IT Consulting & Managed IT Services in Stockholm
          </h1>
          <p className="body-large" style={{ marginBottom: '40px', color: 'var(--text-secondary)' }}>
            MITA ICT is a leading technology solutions provider with 20+ years of experience. 
            We deliver expert IT strategy consulting, cloud solutions, cybersecurity, and digital transformation services 
            for enterprises and SMEs across Sweden and Europe.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary" style={{ textDecoration: 'none' }} data-testid="hero-cta-btn">
              Get Free Consultation
              <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section style={{
        padding: '60px 7.6923%',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          textAlign: 'center'
        }}>
          <div>
            <h3 className="heading-2" style={{ color: 'var(--brand-primary)', marginBottom: '8px' }}>20+</h3>
            <p className="body-medium">Years of IT Consulting Experience</p>
          </div>
          <div>
            <h3 className="heading-2" style={{ color: 'var(--brand-primary)', marginBottom: '8px' }}>100+</h3>
            <p className="body-medium">Enterprise IT Solutions Delivered</p>
          </div>
          <div>
            <h3 className="heading-2" style={{ color: 'var(--brand-primary)', marginBottom: '8px' }}>24/7</h3>
            <p className="body-medium">Managed IT Support Available</p>
          </div>
          <div>
            <h3 className="heading-2" style={{ color: 'var(--brand-primary)', marginBottom: '8px' }}>Sweden</h3>
            <p className="body-medium">Based in Stockholm</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{
        padding: '100px 7.6923%',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 className="display-large" style={{ textAlign: 'center', marginBottom: '20px' }}>
            Our IT Consulting Services
          </h2>
          <p className="body-large" style={{ textAlign: 'center', marginBottom: '60px', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 60px' }}>
            Comprehensive business IT services including cloud transformation consulting, 
            cybersecurity solutions, IT infrastructure management, and digital strategy consulting.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px'
          }}>
            {loading ? (
              <p className="body-large" style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
                Loading services...
              </p>
            ) : services.length === 0 ? (
              <p className="body-large" style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
                No services available
              </p>
            ) : (
              services.map((service) => {
                const IconComponent = iconMap[service.icon];
                return (
                  <div
                    key={service.id}
                    className="dark-hover"
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '40px',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.4s ease-in-out'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'var(--brand-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '24px'
                    }}>
                      <IconComponent size={32} color="var(--brand-primary)" />
                    </div>
                    <h3 className="heading-1" style={{ marginBottom: '16px' }}>{service.title}</h3>
                    <p className="body-medium">{service.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 7.6923%',
        background: 'var(--bg-secondary)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="display-large" style={{ marginBottom: '24px' }}>
            Ready to Transform Your Business?
          </h2>
          <p className="body-large" style={{ marginBottom: '40px', color: 'var(--text-secondary)' }}>
            Let's discuss how our expertise can help you achieve your technology and business goals.
          </p>
          <Link to="/contact" className="btn-primary" style={{ textDecoration: 'none' }}>
            Contact Us Today
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;