import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Landing from './pages/Landing';

// Create context for theme mode
export const ThemeModeContext = createContext({ 
  toggleColorMode: () => {},
  mode: 'light'
});

// Use function to get theme based on mode
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#6ea8fe' : '#3b82f6', // Brighter blue for dark mode
      light: mode === 'dark' ? '#93c5fd' : '#60a5fa',
      dark: mode === 'dark' ? '#3b82f6' : '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#c084fc' : '#8b5cf6', // More vibrant purple
      light: mode === 'dark' ? '#d8b4fe' : '#a78bfa',
      dark: mode === 'dark' ? '#9333ea' : '#7e22ce',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc', // Deep navy background
      paper: mode === 'dark' ? '#1e293b' : '#ffffff', // Slightly lighter navy for cards
      card: mode === 'dark' ? '#283548' : '#f1f5f9', // For secondary cards/elements
      elevated: mode === 'dark' ? '#334155' : '#ffffff', // For elevated UI elements
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#1e293b',
      secondary: mode === 'dark' ? '#cbd5e1' : '#64748b',
      accent: mode === 'dark' ? '#93c5fd' : '#2563eb', // For highlighted text
    },
    error: {
      main: mode === 'dark' ? '#fb7185' : '#ef4444', // More vibrant red for dark mode
      light: mode === 'dark' ? '#fda4af' : '#fca5a5',
      dark: mode === 'dark' ? '#e11d48' : '#b91c1c',
    },
    success: {
      main: mode === 'dark' ? '#4ade80' : '#22c55e',
      light: mode === 'dark' ? '#86efac' : '#86efac',
      dark: mode === 'dark' ? '#16a34a' : '#15803d',
    },
    info: {
      main: mode === 'dark' ? '#38bdf8' : '#0ea5e9', // Enhanced info color
      light: mode === 'dark' ? '#7dd3fc' : '#38bdf8',
      dark: mode === 'dark' ? '#0284c7' : '#0369a1', 
    },
    warning: {
      main: mode === 'dark' ? '#fcd34d' : '#f59e0b', // Enhanced warning color
      light: mode === 'dark' ? '#fde68a' : '#fcd34d',
      dark: mode === 'dark' ? '#d97706' : '#b45309',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  },  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2.125rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.005em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      opacity: 0.87,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      opacity: 0.87,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.02em',
    },
  },  shape: {
    borderRadius: 12, // Increased default border radius
  },  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.03), 0px 1px 2px rgba(0,0,0,0.04)',
    '0px 3px 6px rgba(0,0,0,0.04), 0px 2px 4px rgba(0,0,0,0.06)',
    '0px 4px 8px rgba(0,0,0,0.06), 0px 2px 4px rgba(0,0,0,0.08)',
    '0px 6px 12px rgba(0,0,0,0.06), 0px 3px 6px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.08), 0px 4px 8px rgba(0,0,0,0.1)',
    '0px 10px 20px rgba(0,0,0,0.1), 0px 6px 12px rgba(0,0,0,0.12)',
    '0px 12px 24px rgba(0,0,0,0.12), 0px 8px 16px rgba(0,0,0,0.14)',
    '0px 14px 28px rgba(0,0,0,0.14), 0px 10px 20px rgba(0,0,0,0.16)',
    '0px 16px 32px rgba(0,0,0,0.16), 0px 12px 24px rgba(0,0,0,0.18)',
    '0px 18px 36px rgba(0,0,0,0.18), 0px 14px 28px rgba(0,0,0,0.2)',
    '0px 20px 40px rgba(0,0,0,0.2), 0px 16px 32px rgba(0,0,0,0.22)',
    '0px 22px 44px rgba(0,0,0,0.22), 0px 18px 36px rgba(0,0,0,0.24)',
    '0px 24px 48px rgba(0,0,0,0.24), 0px 20px 40px rgba(0,0,0,0.26)',
    '0px 26px 52px rgba(0,0,0,0.26), 0px 22px 44px rgba(0,0,0,0.28)',
    '0px 28px 56px rgba(0,0,0,0.28), 0px 24px 48px rgba(0,0,0,0.3)',
    '0px 30px 60px rgba(0,0,0,0.3), 0px 26px 52px rgba(0,0,0,0.32)',
    '0px 32px 64px rgba(0,0,0,0.32), 0px 28px 56px rgba(0,0,0,0.34)',
    '0px 34px 68px rgba(0,0,0,0.34), 0px 30px 60px rgba(0,0,0,0.36)',
    '0px 36px 72px rgba(0,0,0,0.36), 0px 32px 64px rgba(0,0,0,0.38)',
    '0px 38px 76px rgba(0,0,0,0.38), 0px 34px 68px rgba(0,0,0,0.4)',
    '0px 40px 80px rgba(0,0,0,0.4), 0px 36px 72px rgba(0,0,0,0.42)',
    '0px 42px 84px rgba(0,0,0,0.42), 0px 38px 76px rgba(0,0,0,0.44)',
    '0px 44px 88px rgba(0,0,0,0.44), 0px 40px 80px rgba(0,0,0,0.46)',
    '0px 46px 92px rgba(0,0,0,0.46), 0px 42px 84px rgba(0,0,0,0.48)'
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} transparent`,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            },
          },
        },
      }),
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 500,
          '&:hover': {
            transform: 'translateY(-2px)',            boxShadow: '0 6px 12px -2px rgba(0,0,0,0.12), 0 4px 6px -2px rgba(0,0,0,0.07)',
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
              ? `rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.9)`
              : theme.palette.primary.main,
          },
        },
        contained: {
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 2px 8px 0 rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.25)'
            : '0 2px 8px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.05)',
          backdropFilter: 'blur(8px)',
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
          }
        },
        text: {
          '&:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 4px 20px 0 rgba(0,0,0,0.35), 0 2px 8px 0 rgba(0,0,0,0.2)'
            : '0 4px 20px 0 rgba(0,0,0,0.1), 0 2px 8px 0 rgba(0,0,0,0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 12px 28px 0 rgba(0,0,0,0.4), 0 4px 12px 0 rgba(0,0,0,0.25)'
              : '0 12px 28px 0 rgba(0,0,0,0.12), 0 4px 12px 0 rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          overflow: 'hidden',
        },
        elevation1: {
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 2px 8px 0 rgba(0,0,0,0.3)'
            : '0 2px 8px 0 rgba(0,0,0,0.08)'
        },
        elevation2: {
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 4px 12px 0 rgba(0,0,0,0.35)'
            : '0 4px 12px 0 rgba(0,0,0,0.1)'
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&.Mui-focused': {
              boxShadow: (theme) => `0 0 0 3px ${theme.palette.mode === 'dark' 
                ? 'rgba(99, 179, 237, 0.25)' 
                : 'rgba(66, 153, 225, 0.15)'}`,
            }
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
          }
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255,255,255,0.1)'
              : '0 0 0 1px rgba(0,0,0,0.05)'
          }
        },
        filled: {
          backdropFilter: 'blur(8px)',
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(99, 179, 237, 0.12)'
              : 'rgba(66, 153, 225, 0.08)',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(99, 179, 237, 0.18)'
                : 'rgba(66, 153, 225, 0.12)',
            }
          }
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.01)',
          }
        }
      }
    },
  },
});

function App() {
  // Get saved theme preference from localStorage or default to light
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('themeMode');
      return savedMode || 'light';
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return 'light';
    }
  });

  // Update localStorage when theme changes
  useEffect(() => {
    try {
      localStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Adds baseline styles and normalization */}
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export default App;