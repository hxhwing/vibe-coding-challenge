
import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Avatar, CircularProgress, Tooltip } from '@mui/material';
import { Send, Bot, User, Sparkles, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

const ASSISTANT_API_URL = import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:8002';

export default function ChatInterface() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'model', content: `Hi ${user?.email?.split('@')[0]} !I'm Vibe Assistant. I can help you manage tasks and save links. What's on your mind ? ` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${ASSISTANT_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.uid // Use authenticated user ID
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.content }]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f7fa'
    }}>
      {/* Header */}
      <Paper elevation={0} sx={{
        p: 2,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        borderRadius: 0 // Ensure no rounded corners for full header
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ bgcolor: 'primary.main', borderRadius: 1, p: 0.5, display: 'flex' }}>
            <Sparkles color="white" size={24} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Vibe Assistant
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.email}
          </Typography>
          <Tooltip title="Logout">
            <IconButton onClick={logout} size="small" sx={{ color: 'text.secondary' }}>
              <LogOut size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 2
            }}
          >
            {msg.role === 'model' && (
              <Avatar sx={{ bgcolor: '#0f9d58', width: 32, height: 32 }}>
                <Bot size={18} />
              </Avatar>
            )}
            <Paper elevation={0} sx={{
              p: 2,
              maxWidth: '70%',
              borderRadius: 3,
              bgcolor: msg.role === 'user' ? '#1976d2' : '#ffffff',
              color: msg.role === 'user' ? '#fff' : 'text.primary',
              border: msg.role === 'model' ? '1px solid #e0e0e0' : 'none',
              '& pre': { overflowX: 'auto' },
              '& a': { color: msg.role === 'user' ? '#fff' : '#1976d2' }
            }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </Paper>
            {msg.role === 'user' && (
              <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                <User size={18} />
              </Avatar>
            )}
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#0f9d58', width: 32, height: 32 }}>
              <Bot size={18} />
            </Avatar>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <CircularProgress size={20} color="success" />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper elevation={3} sx={{ p: 2, m: 2, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#115293' } }}
          >
            <Send size={20} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
