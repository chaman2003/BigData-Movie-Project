import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#00e4ff',
      dark: '#0080ff',
    },
    secondary: {
      main: '#7928ca',
      light: '#a855f7',
      dark: '#5b21b6',
    },
    background: {
      default: '#0f1419',
      paper: 'rgba(26, 32, 44, 0.6)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#ff0080',
    },
    success: {
      main: '#00ff88',
    },
    warning: {
      main: '#ffaa00',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 32, 44, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 212, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 48px 0 rgba(0, 212, 255, 0.2)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 32, 44, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 212, 255, 0.4)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00e4ff 0%, #0090ff 100%)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 212, 255, 0.5)',
          color: '#00d4ff',
          '&:hover': {
            borderColor: '#00d4ff',
            background: 'rgba(0, 212, 255, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          color: '#00d4ff',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00d4ff',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
        head: {
          fontWeight: 600,
          background: 'rgba(0, 212, 255, 0.05)',
        },
      },
    },
  },
});

export default theme;
