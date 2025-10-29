import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { mockData } from '../mock';

const SaasStore = () => {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero Section */}
      <section style={{
        padding: '100px 7.6923%',
        textAlign: 'center',
        background: 'var(--bg-primary)'
      }}>
        <h1 className="display-huge" style={{ marginBottom: '24px' }}>
          SaaS Solutions
        </h1>
        <p className="body-large" style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Powerful software solutions designed to streamline your business operations and drive growth.
        </p>
      </section>

      {/* Products Grid */}
      <section style={{
        padding: '60px 7.6923% 100px',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '40px'
          }}>
            {mockData.saasProducts.map((product) => (
              <div
                key={product.id}
                className="dark-hover"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s ease-in-out'
                }}
              >
                <h3 className="heading-1" style={{ marginBottom: '16px' }}>{product.title}</h3>
                <p className="body-medium" style={{ marginBottom: '24px', flex: 1 }}>
                  {product.description}
                </p>
                
                {/* Features List */}
                <div style={{ marginBottom: '32px' }}>
                  {product.features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <CheckCircle2 size={20} color="var(--brand-primary)" />
                      <span className="body-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', width: '100%' }}
                >
                  Learn More
                  <ExternalLink size={20} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaasStore;