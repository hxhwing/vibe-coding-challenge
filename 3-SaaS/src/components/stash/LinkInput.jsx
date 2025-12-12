
import React, { useState } from 'react';
import { Paper, InputBase, IconButton, CircularProgress } from '@mui/material';
import { Plus } from 'lucide-react';

export default function LinkInput({ onAddLink, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAddLink(url);
      setUrl('');
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      variant="elevation"
      elevation={3}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 24,
        mb: 4,
        border: '1px solid #e0e0e0',
        transition: '0.3s',
        '&:focus-within': {
          boxShadow: '0 1px 6px rgba(32, 33, 36, 0.28)',
          borderColor: 'transparent'
        }
      }}
    >
      <InputBase
        sx={{ ml: 2, flex: 1 }}
        placeholder="Paste a URL to stash..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
      />
      <IconButton type="submit" sx={{ p: '10px', color: 'primary.main' }} aria-label="add" disabled={isLoading || !url.trim()}>
        {isLoading ? <CircularProgress size={24} /> : <div style={{ backgroundColor: '#e6f4ea', borderRadius: '50%', padding: 4, display: 'flex' }}><Plus size={24} /></div>}
      </IconButton>
    </Paper>
  );
}
