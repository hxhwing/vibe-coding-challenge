import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { ThemeProvider, CssBaseline, Container, Box, Typography, AppBar, Toolbar } from '@mui/material';
import { Bookmark } from 'lucide-react';
import stashTheme from './theme';
import LinkInput from './components/LinkInput';
import LinkList from './components/LinkList';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a spinner
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppContent() {
  const { user, logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch links when user changes
  useEffect(() => {
    if (user) {
      fetchLinks();
    } else {
      setLinks([]);
    }
  }, [user]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const fetchLinks = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/api/links`, {
        headers: { 'X-User-Id': user.uid }
      });
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (e) {
      console.error("Failed to fetch links", e);
    }
  };

  const addLink = async (url) => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Create Link (Backend handles AI parsing)
      const response = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.uid
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error('Failed to add link');
      const newLink = await response.json();
      setLinks(prev => [newLink, ...prev]);
    } catch (error) {
      console.error("Error adding link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (id) => {
    if (!user) return;
    setLinks(prev => prev.filter(l => l.id !== id)); // Optimistic
    try {
      await fetch(`${API_URL}/api/links/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': user.uid }
      });
    } catch (error) {
      console.error("Failed to delete link", error);
    }
  };

  const toggleRead = async (id) => {
    if (!user) return;
    const link = links.find(l => l.id === id);
    if (link) {
      const updatedLink = { ...link, read: !link.read };
      setLinks(prev => prev.map(l => l.id === id ? updatedLink : l));
      try {
        await fetch(`${API_URL}/api/links/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-User-Id': user.uid },
          body: JSON.stringify(updatedLink)
        });
      } catch (error) {
        console.error("Failed to toggle read status", error);
      }
    }
  };

  const updateLink = async (id, updatedData) => {
    if (!user) return;
    // Optimistic Update
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));
    try {
      await fetch(`http://localhost:8001/api/links/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.uid
        },
        body: JSON.stringify({
          title: updatedData.title,
          summary: updatedData.summary,
          tags: updatedData.tags
        })
      });
    } catch (error) {
      console.error("Failed to update link", error);
    }
  };

  return (
    <ThemeProvider theme={stashTheme}>
      <CssBaseline />
      <AppBar position="static" color="inherit" sx={{ borderBottom: '1px solid #dadce0', boxShadow: 'none' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 1, p: 0.5, display: 'flex' }}>
              <Bookmark color="white" size={24} />
            </Box>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
              Stash
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" component="span" sx={{ mr: 2, color: 'text.secondary' }}>
              {user.email}
            </Typography>
            <Typography
              variant="body2"
              component="span"
              sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 500 }}
              onClick={logout}
            >
              Sign Out
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          <LinkInput onAddLink={addLink} isLoading={isLoading} />
        </Box>
        <LinkList links={links} onDelete={deleteLink} onUpdate={updateLink} />
      </Container>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
