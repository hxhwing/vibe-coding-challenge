import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Box, IconButton, Button, Container } from '@mui/material';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import CheckmatePage from './pages/CheckmatePage';
import StashPage from './pages/StashPage';
import AssistantPage from './pages/AssistantPage';
import theme from './theme';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout with Global Navigation
const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          {/* Logo / Home Link */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mr: 4 }}
            onClick={() => navigate('/')}
          >
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 1, p: 0.5, display: 'flex' }}>
              <LayoutDashboard color="white" size={24} />
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight="bold">
              Vibe One
            </Typography>
          </Box>

          {/* Flexible Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* User Info & Logout */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <IconButton onClick={logout} title="Sign Out" size="small">
                <LogOut size={20} />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkmate"
                element={
                  <ProtectedRoute>
                    <CheckmatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stash"
                element={
                  <ProtectedRoute>
                    <StashPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assistant"
                element={
                  <ProtectedRoute>
                    <AssistantPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AppLayout>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
