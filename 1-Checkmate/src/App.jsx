
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box, Typography, AppBar, Toolbar, Button, IconButton } from '@mui/material';
import { CheckSquare, LogIn, LogOut } from 'lucide-react';
import googleTheme from './theme';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

function CheckmateApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load tasks on mount or user change
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      // Load from local storage or just keep empty for guest session?
      // For now, simple ephemeral guest session (clears on refresh)
      // or we could load from localStorage specific to guest
    }
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
      // Use Shared Backend for AI Parsing (Stateless)
      const response = await fetch(`${API_URL}/api/parse-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to parse task');
      const data = await response.json();
      const newTasks = data.tasks;

      if (user) {
        // Persist to Backend
        // Note: API might support bulk create? 
        // For now, loop create or assume single for simplicity? 
        // Our API endpoint creates one by one currently.
        const createdTasks = await Promise.all(newTasks.map(async (t) => {
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
      } else {
        // Guest: Local State
        const guestTasks = newTasks.map(t => ({ ...t, id: Date.now() + Math.random().toString() }));
        setTasks(prev => [...guestTasks, ...prev]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback
      if (user) {
        // Create simple task
      } else {
        const newTask = {
          id: Date.now().toString(),
          title: text,
          completed: false,
          due_date: null,
          tags: []
        };
        setTasks(prev => [newTask, ...prev]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id, updatedTask) => {
    if (user) {
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t)); // Optimistic
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': user.uid },
        body: JSON.stringify(updatedTask)
      });
    } else {
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    }
  };

  const deleteTask = async (id) => {
    if (user) {
      setTasks(prev => prev.filter(t => t.id !== id)); // Optimistic
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': user.uid }
      });
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { ...task, completed: !task.completed });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header moved to Global App Layout */}

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
  );
}

// Layout with Global Navigation for Project 1
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          {/* Logo / Home Link */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 1, p: 0.5, display: 'flex' }}>
              <CheckSquare color="white" size={24} />
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight="bold">
              Checkmate
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <IconButton onClick={logout} title="Sign Out" size="small">
                <LogOut size={20} />
              </IconButton>
            </Box>
          ) : (
            <Button
              startIcon={<LogIn size={18} />}
              variant="outlined"
              size="small"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
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
        <ThemeProvider theme={googleTheme}>
          <CssBaseline />
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<CheckmateApp />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
