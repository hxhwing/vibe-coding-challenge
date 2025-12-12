
import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Checkbox, Box, TextField, Chip, Fade } from '@mui/material';
import { Edit2, Trash2, Calendar, Check, X } from 'lucide-react';

export default function TaskCard({ task, onUpdate, onDelete, onToggleComplete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    onUpdate(task.id, { ...task, title: editedTitle });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setIsEditing(false);
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        mb: 2,
        width: '100%',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        border: '1px solid transparent',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)', // Subtle default shadow like P1
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15)', // P1 hover shadow
          borderColor: 'primary.light'
        }
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 2, '&:last-child': { pb: 2 } }}>
        <Checkbox
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          color="primary"
          sx={{
            mt: -0.5,
            ml: -1,
            '&.Mui-checked': {
              color: 'primary.main',
            }
          }}
        />

        <Box sx={{ flexGrow: 1, ml: 1 }}>
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              variant="standard"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === 'Escape') handleCancel();
              }}
              sx={{ '& .MuiInputBase-root': { fontSize: '1rem' } }}
            />
          ) : (
            <Box>
              <Typography
                variant="body1"
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'text.secondary' : 'text.primary',
                  fontWeight: 500,
                  mb: 1,
                  wordBreak: 'break-word'
                }}
              >
                {task.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {task.due_date && (
                  <Chip
                    icon={<Calendar size={14} />}
                    label={task.due_date}
                    size="small"
                    sx={{
                      borderRadius: '8px',
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      fontWeight: 500,
                      height: 24,
                      '& .MuiChip-icon': { color: 'primary.main' }
                    }}
                  />
                )}
                {task.tags && task.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      borderRadius: '8px',
                      bgcolor: 'background.default',
                      color: 'text.secondary',
                      height: 24
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, ml: 1, opacity: isHovered || isEditing ? 1 : 0, transition: 'opacity 0.2s' }}>
          {isEditing ? (
            <>
              <IconButton size="small" onClick={handleSave} sx={{ color: 'success.main', bgcolor: 'success.lighter', '&:hover': { bgcolor: 'success.light' } }}><Check size={16} /></IconButton>
              <IconButton size="small" onClick={handleCancel} sx={{ color: 'error.main' }}><X size={16} /></IconButton>
            </>
          ) : (
            <>
              <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}><Edit2 size={16} /></IconButton>
              <IconButton size="small" onClick={() => onDelete(task.id)} sx={{ '&:hover': { color: 'error.main', bgcolor: 'error.light' } }}><Trash2 size={16} /></IconButton>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
