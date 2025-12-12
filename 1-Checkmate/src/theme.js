
import { createTheme } from '@mui/material/styles';

const googleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8', // Google Blue
      light: '#e8f0fe',
    },
    secondary: {
      main: '#e37400', // Google Yellow/Orange accent
    },
    background: {
      default: '#f0f2f5', // Soft grey background
      paper: '#ffffff',
    },
    text: {
      primary: '#1f1f1f',
      secondary: '#444746',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      borderRadius: '20px',
    },
  },
  shape: {
    borderRadius: 16, // More rounded, Material 3 style
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px 1px rgba(0,0,0,0.15)',
            backgroundColor: '#155db5',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          border: 'none', // Remove hard border
        },
        elevation3: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#5f6368',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
          borderBottom: 'none',
        },
      },
    },
  },
});

export default googleTheme;
