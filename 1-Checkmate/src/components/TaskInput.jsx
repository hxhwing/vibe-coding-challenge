
import React, { useState } from 'react';
import { Paper, InputBase, IconButton, CircularProgress, Fade } from '@mui/material';
import { ArrowUp } from 'lucide-react';

export default function TaskInput({ onAddTask, isLoading }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTask(input);
      setInput('');
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      sx={{
        p: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: '28px', // Pill shape
        mb: 4,
        transition: 'all 0.3s cubic-bezier(0.25,0.8,0.25,1)',
        boxShadow: isFocused
          ? '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        border: '1px solid',
        borderColor: isFocused ? 'transparent' : 'transparent', // Can add border if needed
        bgcolor: '#ffffff'
      }}
    >
      <InputBase
        sx={{ ml: 2, flex: 1, fontSize: '1.1rem' }}
        placeholder="Add a task (e.g., 'Buy milk tomorrow')"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <Fade in={!!input.trim() || isLoading}>
        <IconButton
          type="submit"
          sx={{
            p: '10px',
            bgcolor: input.trim() ? 'primary.main' : 'transparent',
            color: input.trim() ? 'white' : 'text.disabled',
            '&:hover': { bgcolor: input.trim() ? 'primary.dark' : 'transparent' },
            transition: 'all 0.2s'
          }}
          aria-label="add"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : <ArrowUp size={24} />}
        </IconButton>
      </Fade>
    </Paper>
  );
}
