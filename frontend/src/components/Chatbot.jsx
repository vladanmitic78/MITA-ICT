import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { chatAPI } from '../api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add initial greeting when chat opens for first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi there! 👋 Welcome to MITA ICT. I'm here to help you learn about our IT and telecommunications consulting services. What can I help you with today?"
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        session_id: sessionId,
        message: userMessage
      });

      setSessionId(response.data.session_id);
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.message 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment or use our contact form to reach us directly." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        data-testid="chatbot-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-toggle"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
      >
        {isOpen ? (
          <X size={28} color="white" />
        ) : (
          <MessageCircle size={28} color="white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          data-testid="chatbot-window"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '500px',
            maxHeight: 'calc(100vh - 150px)',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999,
            border: '1px solid var(--border-color)'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MessageCircle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>MITA ICT Assistant</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>We typically reply instantly</div>
            </div>
          </div>

          {/* Messages Container */}
          <div
            data-testid="chatbot-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-primary)'
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  data-testid={`chat-message-${msg.role}`}
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' 
                      ? '16px 16px 4px 16px' 
                      : '16px 16px 16px 4px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)' 
                      : 'var(--bg-secondary)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end'
            }}
          >
            <textarea
              ref={inputRef}
              data-testid="chatbot-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              rows={1}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                maxHeight: '100px',
                minHeight: '44px'
              }}
            />
            <button
              data-testid="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: inputValue.trim() && !isLoading
                  ? 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)'
                  : 'var(--bg-tertiary)',
                border: 'none',
                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={18} color={inputValue.trim() && !isLoading ? 'white' : 'var(--text-muted)'} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
