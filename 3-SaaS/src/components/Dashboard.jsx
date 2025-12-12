import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, IconButton, Chip } from '@mui/material';
import { Layers, CheckSquare, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const apps = [
    {
      id: 'stash',
      name: 'Stash',
      desc: 'Smart Link Aggregator',
      icon: <Layers size={40} />,
      color: '#e8f5e9',
      textColor: '#1b5e20'
    },
    {
      id: 'checkmate',
      name: 'Checkmate',
      desc: 'AI Task Manager',
      icon: <CheckSquare size={40} />,
      color: '#e3f2fd',
      textColor: '#0d47a1'
    },
    {
      id: 'assistant',
      name: 'Assistant',
      desc: 'AI Personal Helper',
      icon: <Sparkles size={40} />,
      color: '#fff3e0',
      textColor: '#e65100'
    }
  ];

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        Your Apps
      </Typography>

      <Grid container spacing={4}>
        {apps.map((app) => (
          <Grid item xs={12} sm={6} md={4} key={app.id}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}
            >
              <CardActionArea
                sx={{ height: '100%', p: 2 }}
                onClick={() => navigate('/' + app.id)}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: app.color,
                      color: app.textColor
                    }}
                  >
                    {app.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {app.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {app.desc}
                  </Typography>
                  {/* <Chip label="Coming Soon" size="small" sx={{ mt: 1 }} /> */}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
