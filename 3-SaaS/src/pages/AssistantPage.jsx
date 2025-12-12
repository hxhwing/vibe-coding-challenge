import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, TextField, IconButton, Avatar, CircularProgress, Typography } from '@mui/material';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

const ASSISTANT_API_URL = import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:8002';

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'model', content: `Hi ${user?.email?.split('@')[0]}! I'm Vibe Assistant. I can help you manage tasks and save links. What's on your mind?` }
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
          'X-User-Id': user.uid
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
      height: 'calc(100vh - 65px)', // Subtract AppBar height
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f7fa',
      maxWidth: 1200,
      mx: 'auto',
      p: 2
    }}>
      {/* Messages */}
      <Paper elevation={0} sx={{
        flex: 1,
        overflow: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRadius: 4,
        mb: 2,
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0'
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
              bgcolor: msg.role === 'user' ? '#1976d2' : '#f5f5f5',
              color: msg.role === 'user' ? '#fff' : 'text.primary',
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
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f5f5f5' }}>
              <CircularProgress size={20} color="success" />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input */}
      <Paper elevation={3} sx={{ p: 1, borderRadius: 3, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Ask Vibe Assistant..."
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { px: 2, py: 1 } }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ bgcolor: '#1976d2', color: 'white', m: 0.5, '&:hover': { bgcolor: '#115293' }, borderRadius: 2 }}
        >
          <Send size={20} />
        </IconButton>
      </Paper>
    </Box>
  );
}
