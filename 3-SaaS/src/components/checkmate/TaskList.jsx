
import React from 'react';
import { Box, Typography } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, onUpdate, onDelete, onToggleComplete }) {
  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
        <Typography variant="h6">No tasks yet</Typography>
        <Typography variant="body2">Add a task above to get started</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: 829 }}>
      <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </Masonry>
    </Box>
  );
}
