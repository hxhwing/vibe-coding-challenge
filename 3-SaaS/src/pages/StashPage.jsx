import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LinkInput from '../components/stash/LinkInput';
import LinkList from '../components/stash/LinkList';
import { useAuth } from '../context/AuthContext';

export default function StashPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) fetchLinks();
  }, [user]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const fetchLinks = async () => {
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
    setLinks(prev => prev.filter(l => l.id !== id)); // Optimistic
    await fetch(`${API_URL}/api/links/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-Id': user.uid }
    });
  };

  const toggleRead = async (id) => {
    const link = links.find(l => l.id === id);
    if (link) {
      const updatedLink = { ...link, read: !link.read };
      setLinks(prev => prev.map(l => l.id === id ? updatedLink : l));
      await fetch(`${API_URL}/api/links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': user.uid },
        body: JSON.stringify(updatedLink)
      });
    }
  };

  const updateLink = async (id, updatedData) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l)); // Optimistic
    try {
      await fetch(`${API_URL}/api/links/${id}`, {
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
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ bgcolor: 'primary.main', borderRadius: 1, p: 0.5, display: 'flex' }}>
          <Bookmark color="white" size={32} />
        </Box>
        <Typography variant="h4" fontWeight="bold">
          Stash
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
        <LinkInput onAddLink={addLink} isLoading={isLoading} />
      </Box>
      <LinkList links={links} onDelete={deleteLink} onUpdate={updateLink} />
    </Container>
  );
}
