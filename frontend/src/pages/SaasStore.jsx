import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react';
import { publicAPI } from '../api';

// Helper function to render description as bullet points
const renderDescriptionAsBullets = (description) => {
  if (!description) return null;
  
  // Split by period followed by space, or newlines
  const sentences = description
    .split(/(?<=[.!?])\s+|\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  if (sentences.length <= 1) {
    // If only one sentence or no clear splits, return as single bullet
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <ChevronRight size={18} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
          <span className="body-medium">{description}</span>
        </li>
      </ul>
    );
  }
  
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {sentences.map((sentence, index) => (
        <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <ChevronRight size={18} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
          <span className="body-medium">{sentence}</span>
        </li>
      ))}
    </ul>
  );
};

const SaasStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await publicAPI.getSaasProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Set empty array on error to prevent undefined issues
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
            {loading ? (
              <p className="body-large" style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
                Loading products...
              </p>
            ) : products.length === 0 ? (
              <p className="body-large" style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
                No products available
              </p>
            ) : (
              products.map((product) => (
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
                  <div style={{ marginBottom: '24px', flex: 1 }}>
                    {renderDescriptionAsBullets(product.description)}
                  </div>
                  
                  {/* Features List */}
                  <div style={{ marginBottom: '32px' }}>
                    {product.features && product.features.map((feature, index) => (
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
                    aria-label={`Learn more about ${product.title}`}
                  >
                    View Product Details
                    <ExternalLink size={20} />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaasStore;