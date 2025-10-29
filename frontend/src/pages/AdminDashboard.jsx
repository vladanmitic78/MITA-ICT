import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit2, Trash2, Mail, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { mockData } from '../mock';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState(mockData.services);
  const [saasProducts, setSaasProducts] = useState(mockData.saasProducts);
  const [contacts, setContacts] = useState(mockData.contacts);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('authMethod');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.'
    });
    navigate('/admin');
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem.type === 'service') {
      setServices(services.map(s => s.id === editingItem.id ? editingItem : s));
    } else if (editingItem.type === 'saas') {
      setSaasProducts(saasProducts.map(p => p.id === editingItem.id ? editingItem : p));
    }
    
    toast({
      title: 'Saved',
      description: 'Changes saved successfully!'
    });
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id, type) => {
    if (type === 'service') {
      setServices(services.filter(s => s.id !== id));
    } else if (type === 'saas') {
      setSaasProducts(saasProducts.filter(p => p.id !== id));
    }
    
    toast({
      title: 'Deleted',
      description: 'Item deleted successfully!'
    });
  };

  const handleAdd = (type) => {
    const newItem = type === 'service'
      ? { id: Date.now().toString(), title: 'New Service', description: '', icon: 'Network' }
      : { id: Date.now().toString(), title: 'New Product', description: '', link: '#', features: [] };
    
    setEditingItem({ ...newItem, type });
    setIsEditDialogOpen(true);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '24px 7.6923%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 className="display-large">Admin Dashboard</h1>
        <Button onClick={handleLogout} className="btn-secondary">
          <LogOut size={20} />
          Logout
        </Button>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 7.6923%'
      }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['services', 'saas', 'contacts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontSize: '18px',
                fontWeight: 500,
                padding: '20px 0',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 7.6923%' }}>
        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 className="heading-1">Consulting Services</h2>
              <Button onClick={() => handleAdd('service')} className="btn-primary">
                <Plus size={20} />
                Add Service
              </Button>
            </div>
            <div style={{ display: 'grid', gap: '24px' }}>
              {services.map(service => (
                <div key={service.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="heading-2" style={{ marginBottom: '8px' }}>{service.title}</h3>
                    <p className="body-medium">{service.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginLeft: '20px' }}>
                    <button
                      onClick={() => handleEdit(service, 'service')}
                      style={{
                        background: 'var(--brand-hover)',
                        border: 'none',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Edit2 size={20} color="var(--brand-primary)" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id, 'service')}
                      style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: 'none',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Trash2 size={20} color="#ff4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'saas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 className="heading-1">SaaS Products</h2>
              <Button onClick={() => handleAdd('saas')} className="btn-primary">
                <Plus size={20} />
                Add Product
              </Button>
            </div>
            <div style={{ display: 'grid', gap: '24px' }}>
              {saasProducts.map(product => (
                <div key={product.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="heading-2" style={{ marginBottom: '8px' }}>{product.title}</h3>
                    <p className="body-medium" style={{ marginBottom: '12px' }}>{product.description}</p>
                    <a href={product.link} className="body-muted" style={{ fontSize: '14px' }}>{product.link}</a>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginLeft: '20px' }}>
                    <button
                      onClick={() => handleEdit(product, 'saas')}
                      style={{
                        background: 'var(--brand-hover)',
                        border: 'none',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Edit2 size={20} color="var(--brand-primary)" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, 'saas')}
                      style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: 'none',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Trash2 size={20} color="#ff4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 className="heading-1">Contact Submissions</h2>
              <p className="body-medium" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                All contact form submissions will appear here
              </p>
            </div>
            {contacts.length === 0 ? (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '60px',
                textAlign: 'center'
              }}>
                <Mail size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
                <p className="body-large" style={{ color: 'var(--text-muted)' }}>No contact submissions yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '24px' }}>
                {contacts.map((contact, index) => (
                  <div key={index} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <span className="body-muted" style={{ fontSize: '14px' }}>Name:</span>
                        <p className="body-medium">{contact.name}</p>
                      </div>
                      <div>
                        <span className="body-muted" style={{ fontSize: '14px' }}>Email:</span>
                        <p className="body-medium">{contact.email}</p>
                      </div>
                      <div>
                        <span className="body-muted" style={{ fontSize: '14px' }}>Phone:</span>
                        <p className="body-medium">{contact.phone}</p>
                      </div>
                      <div>
                        <span className="body-muted" style={{ fontSize: '14px' }}>Service:</span>
                        <p className="body-medium">{contact.service}</p>
                      </div>
                    </div>
                    <div>
                      <span className="body-muted" style={{ fontSize: '14px' }}>Comment:</span>
                      <p className="body-medium" style={{ marginTop: '8px' }}>{contact.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          maxWidth: '600px',
          padding: '32px'
        }}>
          <DialogHeader>
            <DialogTitle className="heading-1">
              {editingItem?.id && mockData.services.find(s => s.id === editingItem.id) ? 'Edit' : 'Add'} {editingItem?.type === 'service' ? 'Service' : 'Product'}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Title</label>
                <Input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
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
              <div style={{ marginBottom: '20px' }}>
                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Description</label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={4}
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
              {editingItem.type === 'saas' && (
                <div style={{ marginBottom: '20px' }}>
                  <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Link</label>
                  <Input
                    value={editingItem.link}
                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
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
              )}
              <Button onClick={handleSave} className="btn-primary" style={{ width: '100%' }}>
                <Save size={20} />
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;