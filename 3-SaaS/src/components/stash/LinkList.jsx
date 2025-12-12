
import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import LinkCard from './LinkCard';

export default function LinkList({ links, onDelete, onUpdate }) {
  if (links.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
        <Typography variant="h6">Stash is empty</Typography>
        <Typography variant="body2">Paste a URL above to save it</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {links.map(link => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={link.id}>
            <LinkCard link={link} onDelete={onDelete} onUpdate={onUpdate} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
