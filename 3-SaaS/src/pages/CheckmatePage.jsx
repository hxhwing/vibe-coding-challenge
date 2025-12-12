import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, ThemeProvider, createTheme } from '@mui/material';
import { CheckSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskInput from '../components/checkmate/TaskInput';
import TaskList from '../components/checkmate/TaskList';
import { useAuth } from '../context/AuthContext';

// Force Blue Theme for Checkmate Section
// Force Blue Theme for Checkmate Section
const checkmateTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8', // Google Blue
      light: '#e8f0fe', // Light Blue for Chips
    },
    secondary: { main: '#e37400' },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 24 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' } } }
  }
});

export default function CheckmatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'X-User-Id': user.uid }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    }
  };

  const addTask = async (text) => {
    setIsLoading(true);
    try {
      // AI Parse
      const response = await fetch(`${API_URL}/api/parse-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to parse task');
      const data = await response.json();

      // Persist
      const createdTasks = await Promise.all(data.tasks.map(async (t) => {
        const res = await fetch(`${API_URL}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.uid
          },
          body: JSON.stringify(t)
        });
        return res.json();
      }));
      setTasks(prev => [...createdTasks, ...prev]);

    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id, updatedTask) => {
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t)); // Optimistic
    await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': user.uid },
      body: JSON.stringify(updatedTask)
    });
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id)); // Optimistic
    await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-Id': user.uid }
    });
  };


  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { ...task, completed: !task.completed });
    }
  };

  return (
    <ThemeProvider theme={checkmateTheme}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{ bgcolor: 'primary.main', borderRadius: 1, p: 0.5, display: 'flex' }}>
            <CheckSquare color="white" size={32} />
          </Box>
          <Typography variant="h4" fontWeight="bold">
            Checkmate
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          <TaskInput onAddTask={addTask} isLoading={isLoading} />
        </Box>
        <TaskList
          tasks={tasks}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onToggleComplete={toggleComplete}
        />
      </Container>
    </ThemeProvider>
  );
}
