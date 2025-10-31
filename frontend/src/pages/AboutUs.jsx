import React, { useState, useEffect } from 'react';
import { Award, Users, Target, TrendingUp } from 'lucide-react';
import { publicAPI } from '../api';

const iconMap = {
  'Years of Experience': Award,
  'Successful Projects': Target,
  'Industries Served': Users,
  'Client Satisfaction': TrendingUp
};

const AboutUs = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Static stats (not editable)
  const stats = [
    { label: 'Years of Experience', value: '20+' },
    { label: 'Successful Projects', value: '150+' },
    { label: 'Industries Served', value: '15+' },
    { label: 'Client Satisfaction', value: '98%' }
  ];

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await publicAPI.getAboutContent();
        setAboutContent(response.data);
      } catch (error) {
        console.error('Error fetching about content:', error);
        // Fallback content
        setAboutContent({
          title: 'About MITA ICT',
          content: 'Loading content...'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAboutContent();
  }, []);
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero Section */}
      <section style={{
        padding: '100px 7.6923%',
        textAlign: 'center',
        background: 'var(--bg-primary)'
      }}>
        <h1 className="display-huge" style={{ marginBottom: '24px' }}>
          {loading ? 'Loading...' : aboutContent?.title || 'About MITA ICT'}
        </h1>
        <p className="body-large" style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Two decades of excellence in IT and telecommunications consulting.
        </p>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 7.6923%',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            {stats.map((stat, index) => {
              const IconComponent = iconMap[stat.label];
              return (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--brand-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <IconComponent size={40} color="var(--brand-primary)" />
                  </div>
                  <div className="display-large" style={{ marginBottom: '8px' }}>{stat.value}</div>
                  <div className="body-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={{
        padding: '100px 7.6923%',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 className="display-large" style={{ marginBottom: '40px', textAlign: 'center' }}>
            Our Story
          </h2>
          {loading ? (
            <p className="body-large">Loading content...</p>
          ) : (
            <div style={{ lineHeight: '1.8' }}>
              {aboutContent?.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="body-large" style={{ marginBottom: '24px' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Expertise Section */}
      <section style={{
        padding: '100px 7.6923%',
        background: 'var(--bg-secondary)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="display-large" style={{ marginBottom: '40px' }}>
            Our Expertise
          </h2>
          {loading || !aboutContent?.expertise || aboutContent.expertise.length === 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              textAlign: 'left'
            }}>
              {[
                { title: 'IT Infrastructure', items: ['Network Design', 'Cloud Solutions', 'System Integration'] },
                { title: 'Telecommunications', items: ['OSS Implementation', 'Network Optimization', 'Voice & Data Solutions'] },
                { title: 'Cybersecurity', items: ['EDR/MDR/XDR Solutions', 'Security Audits', 'Compliance Management'] },
                { title: 'Leadership', items: ['Team Building', 'Sales Management', 'P&L Optimization'] }
              ].map((area, index) => (
                <div key={index} style={{
                  background: 'var(--bg-primary)',
                  padding: '30px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <h3 className="heading-1" style={{ marginBottom: '16px' }}>{area.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {area.items.map((item, i) => (
                      <li key={i} className="body-medium" style={{ marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--brand-primary)' }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              textAlign: 'left'
            }}>
              {aboutContent.expertise.map((area, index) => (
                <div key={index} style={{
                  background: 'var(--bg-primary)',
                  padding: '30px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <h3 className="heading-1" style={{ marginBottom: '16px' }}>{area.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {area.items && area.items.map((item, i) => (
                      <li key={i} className="body-medium" style={{ marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--brand-primary)' }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;