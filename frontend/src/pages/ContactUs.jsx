import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { publicAPI } from '../api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reCAPTCHA script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6LdSFPsrAAAAAJIui51XHC_Bvlc6fhLkjzsE6_F3';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleServiceChange = (value) => {
    setFormData({
      ...formData,
      service: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      let token = null;
      
      // Try to get reCAPTCHA token if available
      if (window.grecaptcha && window.grecaptcha.execute) {
        try {
          token = await window.grecaptcha.execute('6LdSFPsrAAAAAJIui51XHC_Bvlc6fhLkjzsE6_F3', { action: 'submit' });
        } catch (recaptchaError) {
          console.warn('reCAPTCHA execution failed:', recaptchaError);
          // Continue without reCAPTCHA token
        }
      } else {
        console.warn('reCAPTCHA not loaded, submitting without verification');
      }
      
      // Submit to API
      await publicAPI.submitContact({
        ...formData,
        recaptcha_token: token || 'no-token'
      });
      
      toast.success('Thank you for contacting us! We will get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        comment: ''
      });
      
      // Reset reCAPTCHA if available
      if (window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset();
        } catch (resetError) {
          console.warn('reCAPTCHA reset failed:', resetError);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit form. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero Section */}
      <section style={{
        padding: '100px 7.6923%',
        textAlign: 'center',
        background: 'var(--bg-primary)'
      }}>
        <h1 className="display-huge" style={{ marginBottom: '24px' }}>
          Get In Touch
        </h1>
        <p className="body-large" style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Have a question or ready to start a project? We'd love to hear from you.
        </p>
      </section>

      {/* Contact Form */}
      <section style={{
        padding: '60px 7.6923% 100px',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '40px'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="name" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Name / Company Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
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
                <label htmlFor="email" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
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
                <label htmlFor="phone" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Mobile Phone *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
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
                <label htmlFor="service" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Choose Service *
                </label>
                <Select onValueChange={handleServiceChange} value={formData.service} required>
                  <SelectTrigger style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: formData.service ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                    height: 'auto'
                  }}>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0px'
                  }}>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="it-consulting">IT consulting</SelectItem>
                    <SelectItem value="telco-consulting">Telco consulting</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="pnl-optimization">PnL optimisation</SelectItem>
                    <SelectItem value="company-registration">Setting up a company in Sweden</SelectItem>
                    <SelectItem value="others">others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label htmlFor="comment" className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                  Comment
                </label>
                <Textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows={6}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '0px',
                    padding: '14px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  background: 'var(--brand-primary)',
                  color: '#000000',
                  borderRadius: '0px',
                  fontSize: '18px',
                  fontWeight: 500,
                  minHeight: '56px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <Send size={20} />
                  </>
                )}
              </Button>
            </form>

            <p className="body-muted" style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
              This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;