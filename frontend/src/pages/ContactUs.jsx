import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

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
    
    // Validate reCAPTCHA
    if (!window.grecaptcha) {
      toast({
        title: 'Error',
        description: 'reCAPTCHA not loaded. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await window.grecaptcha.execute('6LdSFPsrAAAAAJIui51XHC_Bvlc6fhLkjzsE6_F3', { action: 'submit' });
      
      // Mock submission for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success!',
        description: 'Thank you for contacting us. We will get back to you soon.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        comment: ''
      });
      
      // Reset reCAPTCHA
      window.grecaptcha.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive'
      });
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
                    <SelectItem value="it-consulting">IT Consulting</SelectItem>
                    <SelectItem value="telco-consulting">Telco Consulting</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="pnl-optimization">P&L Optimization</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
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