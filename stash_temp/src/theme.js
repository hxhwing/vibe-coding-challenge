
import { createTheme } from '@mui/material/styles';

const stashTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e8e3e', // Google Green (Stash Green)
    },
    secondary: {
      main: '#e6f4ea', // Light Green
    },
    background: {
      default: '#ffffff',
      paper: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      borderRadius: 24,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
          border: 'none',
        }
      }
    }
  },
});

export default stashTheme;
