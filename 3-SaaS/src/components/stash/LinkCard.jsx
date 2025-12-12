
import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Link, IconButton, TextField } from '@mui/material';
import { ExternalLink, Tag, Trash2, Edit2, Check, X } from 'lucide-react';

export default function LinkCard({ link, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.title);
  const [editedSummary, setEditedSummary] = useState(link.summary);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(link.id, { ...link, title: editedTitle, summary: editedSummary });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(link.title);
    setEditedSummary(link.summary);
    setIsEditing(false);
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 3, position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            {isEditing ? (
              <TextField
                fullWidth
                variant="standard"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: '1.25rem', fontWeight: 500 } }}
              />
            ) : (
              <Link href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" underline="hover" color="inherit">
                <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                  {link.title}
                </Typography>
              </Link>
            )}
          </Box>
          <Link href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" color="text.secondary">
            <ExternalLink size={16} />
          </Link>
        </Box>

        {isEditing ? (
          <TextField
            fullWidth
            multiline
            variant="outlined"
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {link.summary}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {link.tags && link.tags.map(tag => (
              <Chip
                key={tag}
                icon={<Tag size={12} />}
                label={tag}
                size="small"
                sx={{
                  bgcolor: '#e6f4ea',
                  color: '#1e8e3e',
                  fontSize: '0.75rem',
                  height: 24
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditing ? (
              <>
                <IconButton size="small" onClick={handleSave} color="primary"><Check size={16} /></IconButton>
                <IconButton size="small" onClick={handleCancel} color="default"><X size={16} /></IconButton>
              </>
            ) : (
              <>
                <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}><Edit2 size={16} /></IconButton>
                <IconButton size="small" onClick={() => onDelete(link.id)} sx={{ opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}><Trash2 size={16} /></IconButton>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
