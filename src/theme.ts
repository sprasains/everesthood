import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // purple
    },
    secondary: {
      main: '#ec4899', // pink
    },
    background: {
      default: '#0f2027', // dark-soft
      paper: 'rgba(30, 41, 59, 0.5)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d0d0d0',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h3: {
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #ff4e53, #ffcc00)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h4: {
      fontWeight: 'bold',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

export default theme;
