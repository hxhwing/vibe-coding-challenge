
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
      fontWeight: 500,
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
          boxShadow: 'none',
          border: '1px solid #dadce0',
        }
      }
    }
  },
});

export default stashTheme;
