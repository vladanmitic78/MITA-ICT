import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit2, Trash2, Mail, Save, Settings, Search, Download, FileText, FileSpreadsheet, Share2, MessageCircle, Eye, Calendar, Check, X, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { publicAPI, adminAPI, authAPI } from '../api';
import ExpertiseEditor from '../components/ExpertiseEditor';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [saasProducts, setSaasProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
  const [meetingRequests, setMeetingRequests] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      try {
        const isAuth = localStorage.getItem('adminAuth');
        const token = localStorage.getItem('adminToken');
        
        console.log('🔐 Auth check in dashboard:', {
          isAuth,
          hasToken: !!token,
          tokenLength: token?.length
        });
        
        if (!isAuth || !token) {
          console.log('❌ Not authenticated, redirecting to login');
          toast.error('Please log in to access the dashboard');
          navigate('/admin');
          return false;
        }
        
        console.log('✅ Authentication verified');
        return true;
      } catch (error) {
        console.error('❌ Auth check error:', error);
        toast.error('Authentication error. Please log in again.');
        navigate('/admin');
        return false;
      }
    };
    
    if (checkAuth()) {
      // Load initial data only if authenticated
      loadData();
    }
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesRes, productsRes, contactsRes, aboutRes, chatSessionsRes, meetingRequestsRes] = await Promise.all([
        publicAPI.getServices(),
        publicAPI.getSaasProducts(),
        adminAPI.getContacts(),
        publicAPI.getAboutContent(),
        adminAPI.getChatSessions().catch(() => ({ data: [] })),
        adminAPI.getMeetingRequests().catch(() => ({ data: [] }))
      ]);
      setServices(servicesRes.data || []);
      setSaasProducts(productsRes.data || []);
      setContacts(contactsRes.data || []);
      setAboutContent(aboutRes.data || null);
      setChatSessions(chatSessionsRes.data || []);
      setMeetingRequests(meetingRequestsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminToken');
        navigate('/admin');
      } else {
        toast.error('Failed to load data');
        // Set default empty arrays to prevent undefined errors
        setServices([]);
        setSaasProducts([]);
        setContacts([]);
        setAboutContent(null);
        setChatSessions([]);
        setMeetingRequests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authMethod');
    toast.success('You have been successfully logged out.');
    navigate('/admin');
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem.type === 'service') {
        if (services.find(s => s.id === editingItem.id)) {
          await adminAPI.updateService(editingItem.id, {
            title: editingItem.title,
            description: editingItem.description,
            icon: editingItem.icon
          });
          setServices(services.map(s => s.id === editingItem.id ? editingItem : s));
          toast.success('Service updated successfully!');
        } else {
          const response = await adminAPI.createService({
            title: editingItem.title,
            description: editingItem.description,
            icon: editingItem.icon
          });
          setServices([...services, response.data]);
          toast.success('Service created successfully!');
        }
      } else if (editingItem.type === 'saas') {
        if (saasProducts.find(p => p.id === editingItem.id)) {
          await adminAPI.updateSaasProduct(editingItem.id, {
            title: editingItem.title,
            description: editingItem.description,
            link: editingItem.link,
            features: editingItem.features || []
          });
          setSaasProducts(saasProducts.map(p => p.id === editingItem.id ? editingItem : p));
          toast.success('Product updated successfully!');
        } else {
          const response = await adminAPI.createSaasProduct({
            title: editingItem.title,
            description: editingItem.description,
            link: editingItem.link,
            features: editingItem.features || []
          });
          setSaasProducts([...saasProducts, response.data]);
          toast.success('Product created successfully!');
        }
      } else if (editingItem.type === 'contact') {
        await adminAPI.updateContact(editingItem.id, {
          name: editingItem.name,
          email: editingItem.email,
          phone: editingItem.phone,
          service: editingItem.service,
          comment: editingItem.comment
        });
        setContacts(contacts.map(c => c.id === editingItem.id ? editingItem : c));
        toast.success('Contact updated successfully!');
      }
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save changes');
    }
  };

  const handleDelete = async (id, type) => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const { id, type } = itemToDelete;
      
      if (type === 'service') {
        await adminAPI.deleteService(id);
        setServices(services.filter(s => s.id !== id));
        toast.success('Service deleted successfully!');
      } else if (type === 'saas') {
        await adminAPI.deleteSaasProduct(id);
        setSaasProducts(saasProducts.filter(p => p.id !== id));
        toast.success('Product deleted successfully!');
      } else if (type === 'contact') {
        await adminAPI.deleteContact(id);
        setContacts(contacts.filter(c => c.id !== id));
        toast.success('Contact deleted successfully!');
      } else if (type === 'chatSession') {
        await adminAPI.deleteChatSession(id);
        setChatSessions(chatSessions.filter(s => s.id !== id));
        toast.success('Chat session deleted successfully!');
      }
      
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  const handleAdd = (type) => {
    const newItem = type === 'service'
      ? { id: Date.now().toString(), title: 'New Service', description: '', icon: 'Network' }
      : { id: Date.now().toString(), title: 'New Product', description: '', link: '#', features: [] };
    
    setEditingItem({ ...newItem, type });
    setIsEditDialogOpen(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/contacts/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mita_contacts_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/contacts/export/excel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mita_contacts_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Excel download error:', error);
      toast.error('Failed to download Excel');
    }
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      contact.service?.toLowerCase().includes(query) ||
      contact.comment?.toLowerCase().includes(query)
    );
  });

  // View chat session details
  const handleViewSession = async (sessionId) => {
    try {
      const response = await adminAPI.getChatSession(sessionId);
      setSelectedSession(response.data);
      setSessionDetailOpen(true);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Failed to load conversation');
    }
  };

  // Delete chat session
  const handleDeleteSession = async (sessionId) => {
    setItemToDelete({ id: sessionId, type: 'chatSession' });
    setDeleteConfirmOpen(true);
  };

  // Filter chat sessions with leads
  const leadsOnlySessions = chatSessions.filter(s => s.lead_captured);
  const allSessions = chatSessions;

  // Meeting request functions
  const pendingMeetings = meetingRequests.filter(m => m.status === 'pending');

  const handleUpdateMeetingStatus = async (requestId, newStatus) => {
    try {
      await adminAPI.updateMeetingRequestStatus(requestId, { status: newStatus });
      setMeetingRequests(meetingRequests.map(m => 
        m.id === requestId ? { ...m, status: newStatus } : m
      ));
      toast.success(`Meeting request ${newStatus}!`);
    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast.error('Failed to update meeting status');
    }
  };

  const handleDeleteMeeting = async (requestId) => {
    setItemToDelete({ id: requestId, type: 'meetingRequest' });
    setDeleteConfirmOpen(true);
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={() => navigate('/admin/social-media')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} />
            Social Media
          </Button>
          <Button onClick={() => navigate('/admin/settings')} className="btn-secondary">
            <Settings size={20} />
            Settings
          </Button>
          <Button onClick={handleLogout} className="btn-secondary">
            <LogOut size={20} />
            Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 7.6923%'
      }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['services', 'saas', 'about', 'contacts', 'chatleads'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`admin-tab-${tab}`}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontSize: '18px',
                fontWeight: 500,
                padding: '20px 0',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab === 'chatleads' && <MessageCircle size={18} />}
              {tab === 'chatleads' ? 'Chat Leads' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'chatleads' && leadsOnlySessions.length > 0 && (
                <span style={{
                  background: 'var(--brand-primary)',
                  color: 'black',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  {leadsOnlySessions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 7.6923%' }}>
        {loading ? (
          <p className="body-large">Loading...</p>
        ) : (
          <>
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

            {activeTab === 'about' && (
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <h2 className="heading-1">About Page Content</h2>
                  <p className="body-medium" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    Edit the content displayed on the About Us page
                  </p>
                </div>
                {aboutContent && (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '40px'
                  }}>
                    <div style={{ marginBottom: '24px' }}>
                      <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                        Page Title
                      </label>
                      <Input
                        value={aboutContent.title}
                        onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
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
                    
                    <div style={{ marginBottom: '32px' }}>
                      <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                        Content
                      </label>
                      <Textarea
                        value={aboutContent.content}
                        onChange={(e) => setAboutContent({ ...aboutContent, content: e.target.value })}
                        rows={15}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          borderRadius: '0px',
                          padding: '14px',
                          fontSize: '16px',
                          lineHeight: '1.6'
                        }}
                      />
                      <p className="body-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                        Use double line breaks (press Enter twice) to separate paragraphs
                      </p>
                    </div>
                    
                    {/* Expertise Editor */}
                    <ExpertiseEditor
                      expertise={aboutContent.expertise || []}
                      onChange={(newExpertise) => setAboutContent({ ...aboutContent, expertise: newExpertise })}
                    />
                    
                    <Button 
                      onClick={async () => {
                        try {
                          await adminAPI.updateAboutContent({
                            title: aboutContent.title,
                            content: aboutContent.content,
                            expertise: aboutContent.expertise || []
                          });
                          toast.success('About content updated successfully!');
                          loadData(); // Reload to get updated timestamp
                        } catch (error) {
                          console.error('Update error:', error);
                          toast.error(error.response?.data?.detail || 'Failed to update content');
                        }
                      }}
                      className="btn-primary" 
                      style={{ width: '100%' }}
                    >
                      <Save size={20} />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <h2 className="heading-1">Contact Submissions</h2>
                  <p className="body-medium" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    All contact form submissions ({contacts.length} total)
                  </p>
                </div>

                {/* Search and Export Controls */}
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  {/* Search Bar */}
                  <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                    <Search 
                      size={20} 
                      color="var(--text-muted)" 
                      style={{ 
                        position: 'absolute', 
                        left: '14px', 
                        top: '50%', 
                        transform: 'translateY(-50%)'
                      }} 
                    />
                    <Input
                      type="text"
                      placeholder="Search by name, email, phone, service, or comment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        borderRadius: '0px',
                        padding: '14px 14px 14px 44px',
                        fontSize: '16px',
                        width: '100%'
                      }}
                    />
                  </div>

                  {/* Download Buttons */}
                  <Button 
                    onClick={handleDownloadPDF}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      padding: '14px 20px'
                    }}
                  >
                    <FileText size={20} />
                    Export PDF
                  </Button>

                  <Button 
                    onClick={handleDownloadExcel}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      padding: '14px 20px'
                    }}
                  >
                    <FileSpreadsheet size={20} />
                    Export Excel
                  </Button>
                </div>

                {/* Search Results Info */}
                {searchQuery && (
                  <div style={{ 
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <p className="body-medium" style={{ color: 'var(--text-primary)' }}>
                      Found {filteredContacts.length} result{filteredContacts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}

                {filteredContacts.length === 0 ? (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '60px',
                    textAlign: 'center'
                  }}>
                    <Mail size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
                    <p className="body-large" style={{ color: 'var(--text-muted)' }}>
                      {searchQuery ? 'No contacts found matching your search' : 'No contact submissions yet'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '24px' }}>
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        padding: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start'
                      }}>
                        <div style={{ flex: 1 }}>
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
                            <p className="body-medium" style={{ marginTop: '8px' }}>{contact.comment || 'No comment provided'}</p>
                          </div>
                          <div style={{ marginTop: '12px' }}>
                            <span className="body-muted" style={{ fontSize: '12px' }}>
                              Submitted: {new Date(contact.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginLeft: '20px' }}>
                          <button
                            onClick={() => handleEdit(contact, 'contact')}
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
                            onClick={() => handleDelete(contact.id, 'contact')}
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
                )}
              </div>
            )}

            {activeTab === 'chatleads' && (
              <div data-testid="admin-chatleads-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <div>
                    <h2 className="heading-1">Chat Leads</h2>
                    <p className="body-muted" style={{ marginTop: '8px' }}>
                      View conversations from the AI chatbot. Leads with captured contact info are highlighted.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className="body-muted">
                      {leadsOnlySessions.length} leads captured • {allSessions.length} total conversations
                    </span>
                  </div>
                </div>

                {allSessions.length === 0 ? (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '60px',
                    textAlign: 'center'
                  }}>
                    <MessageCircle size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                    <p className="body-large" style={{ color: 'var(--text-muted)' }}>
                      No chat conversations yet. The chatbot will appear on your website after visitors accept cookies.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {allSessions.map((session) => (
                      <div 
                        key={session.id} 
                        data-testid={`chat-session-${session.id}`}
                        style={{
                          background: session.lead_captured ? 'linear-gradient(90deg, rgba(0,217,255,0.1) 0%, var(--bg-secondary) 100%)' : 'var(--bg-secondary)',
                          border: session.lead_captured ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          padding: '20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderRadius: '4px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            {session.lead_captured && (
                              <span style={{
                                background: 'var(--brand-primary)',
                                color: 'black',
                                fontSize: '11px',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                              }}>
                                Lead Captured
                              </span>
                            )}
                            <span className="body-muted" style={{ fontSize: '12px' }}>
                              {session.message_count} messages
                            </span>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div>
                              <span className="body-muted" style={{ fontSize: '12px' }}>Name</span>
                              <p className="body-medium" style={{ color: session.lead_name ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {session.lead_name || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <span className="body-muted" style={{ fontSize: '12px' }}>Email</span>
                              <p className="body-medium" style={{ color: session.lead_email ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                                {session.lead_email || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <span className="body-muted" style={{ fontSize: '12px' }}>Phone</span>
                              <p className="body-medium" style={{ color: session.lead_phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {session.lead_phone || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '12px' }}>
                            <span className="body-muted" style={{ fontSize: '11px' }}>
                              Started: {new Date(session.created_at).toLocaleString()} • 
                              Last activity: {new Date(session.updated_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                          <Button
                            onClick={() => handleViewSession(session.id)}
                            className="btn-secondary"
                            data-testid={`view-session-${session.id}`}
                            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Eye size={16} />
                            View Chat
                          </Button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            style={{
                              background: 'rgba(255, 0, 0, 0.1)',
                              border: 'none',
                              padding: '10px',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            <Trash2 size={18} color="#ff4444" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
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
              {editingItem?.type === 'contact' ? 'Edit Contact' : 
               editingItem && services.find(s => s.id === editingItem.id) ? 'Edit' : 'Add'} 
              {editingItem?.type === 'service' ? ' Service' : editingItem?.type === 'saas' ? ' Product' : ''}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div style={{ marginTop: '24px' }}>
              {editingItem.type === 'contact' ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Name</label>
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
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
                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
                    <Input
                      type="email"
                      value={editingItem.email}
                      onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
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
                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Phone</label>
                    <Input
                      value={editingItem.phone}
                      onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })}
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
                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Service</label>
                    <Input
                      value={editingItem.service}
                      onChange={(e) => setEditingItem({ ...editingItem, service: e.target.value })}
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
                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Comment</label>
                    <Textarea
                      value={editingItem.comment}
                      onChange={(e) => setEditingItem({ ...editingItem, comment: e.target.value })}
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
                </>
              ) : (
                <>
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
                </>
              )}
              <Button onClick={handleSave} className="btn-primary" style={{ width: '100%' }}>
                <Save size={20} />
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          maxWidth: '500px',
          padding: '32px'
        }}>
          <DialogHeader>
            <DialogTitle className="heading-1" style={{ color: '#ff4444' }}>
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div style={{ marginTop: '24px' }}>
            <p className="body-large" style={{ marginBottom: '24px' }}>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setItemToDelete(null);
                }}
                className="btn-secondary" 
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                style={{ 
                  flex: 1,
                  background: '#ff4444',
                  color: 'white'
                }}
              >
                <Trash2 size={20} />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Session Detail Dialog */}
      <Dialog open={sessionDetailOpen} onOpenChange={setSessionDetailOpen}>
        <DialogContent style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          maxWidth: '700px',
          maxHeight: '80vh',
          padding: '32px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <DialogHeader>
            <DialogTitle className="heading-1" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageCircle size={24} color="var(--brand-primary)" />
              Conversation Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div style={{ marginTop: '24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Lead Info Summary */}
              {selectedSession.lead_captured && (
                <div style={{
                  background: 'rgba(0,217,255,0.1)',
                  border: '1px solid var(--brand-primary)',
                  padding: '16px',
                  marginBottom: '20px',
                  borderRadius: '4px'
                }}>
                  <h4 className="body-medium" style={{ marginBottom: '12px', color: 'var(--brand-primary)' }}>
                    Captured Lead Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <span className="body-muted" style={{ fontSize: '12px' }}>Name</span>
                      <p className="body-medium">{selectedSession.lead_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="body-muted" style={{ fontSize: '12px' }}>Email</span>
                      <p className="body-medium" style={{ color: 'var(--brand-primary)' }}>
                        {selectedSession.lead_email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="body-muted" style={{ fontSize: '12px' }}>Phone</span>
                      <p className="body-medium">{selectedSession.lead_phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Conversation Messages */}
              <div style={{ marginBottom: '12px' }}>
                <span className="body-muted" style={{ fontSize: '14px' }}>
                  Conversation ({selectedSession.messages?.length || 0} messages)
                </span>
              </div>
              
              <div style={{
                flex: 1,
                overflowY: 'auto',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '16px',
                borderRadius: '4px'
              }}>
                {selectedSession.messages?.map((msg, idx) => (
                  <div 
                    key={idx}
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      background: msg.role === 'user' 
                        ? 'linear-gradient(135deg, var(--brand-primary) 0%, #0066cc 100%)' 
                        : 'var(--bg-secondary)',
                      color: msg.role === 'user' ? 'black' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ 
                        fontSize: '11px', 
                        marginBottom: '6px',
                        opacity: 0.7,
                        fontWeight: 500
                      }}>
                        {msg.role === 'user' ? 'Visitor' : 'AI Assistant'}
                      </div>
                      <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Session Info Footer */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="body-muted" style={{ fontSize: '12px' }}>
                  Session ID: {selectedSession.id?.substring(0, 8)}...
                </span>
                <span className="body-muted" style={{ fontSize: '12px' }}>
                  Started: {new Date(selectedSession.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
