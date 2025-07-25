import React, { useContext, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  Fade,
  Zoom,
  IconButton,
  Avatar,
  Chip,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeModeContext } from '../App';
import {
  Schedule,
  AutoAwesome,
  TrendingUp,
  Security,
  Speed,
  GroupWork,
  Analytics,
  Insights,
  LightMode,
  DarkMode,
  ArrowForward,
  CheckCircle,
  PlayCircle,
  Twitter,
  LinkedIn,
  GitHub,
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  CalendarToday,
  Dashboard,
  School,
  Business,
} from '@mui/icons-material';

const Landing = () => {
  const theme = useTheme();
  const { toggleColorMode, mode } = useContext(ThemeModeContext);
  
  // State for dialogs
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const features = [
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Scheduling',
      description: 'Generate optimal timetables using advanced AI algorithms that consider constraints, preferences, and resource availability for maximum efficiency.',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Smart Optimization',
      description: 'Minimize conflicts and maximize resource utilization with intelligent optimization that adapts to your specific scheduling requirements.',
    },
    {
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      title: 'Real-time Management',
      description: 'Monitor and adjust schedules in real-time with intuitive dashboard controls and instant conflict detection.',
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      title: 'Automated Solutions',
      description: 'Reduce manual effort with automated timetable generation that handles complex scheduling scenarios effortlessly.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Performance Analytics',
      description: 'Track scheduling efficiency, resource utilization, and identify optimization opportunities with comprehensive analytics.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with reliable cloud infrastructure ensuring your scheduling data is always protected and accessible.',
    },
  ];

  const benefits = [
    'Generate timetables in minutes, not hours',
    'Optimize resource allocation automatically',
    'Handle complex constraints effortlessly',
    'Real-time conflict detection and resolution',
    'Export schedules in multiple formats',
  ];

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSignIn = () => {
    // Add your sign-in logic here
    console.log('Sign in with:', formData.email, formData.password);
    alert(`Welcome back! Signing in with ${formData.email}`);
    setSignInOpen(false);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  const handleSignUp = () => {
    // Add your sign-up logic here
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Sign up with:', formData.name, formData.email, formData.password);
    alert(`Account created successfully for ${formData.name}!`);
    setSignUpOpen(false);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(110, 168, 254, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(192, 132, 252, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Header */}
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          background: theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(248, 250, 252, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CalendarToday sx={{ color: '#3b82f6' }} />
              AI Timetable Generator
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={toggleColorMode} color="inherit">
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
              <Button
                variant="outlined"
                sx={{ borderRadius: 3 }}
                onClick={() => setSignInOpen(true)}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                sx={{ borderRadius: 3 }}
                onClick={() => setSignUpOpen(true)}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <Fade in timeout={1000}>
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Chip
              label="🤖 AI-Powered Timetabling Solution"
              sx={{
                mb: 3,
                px: 2,
                py: 0.5,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(110, 168, 254, 0.1)'
                  : 'rgba(59, 130, 246, 0.1)',
                color: theme.palette.primary.main,
                border: `1px solid ${theme.palette.primary.main}20`,
                fontSize: '0.875rem',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 800,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)'
                  : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '2.5rem', md: '4rem' },
                lineHeight: 1.1,
              }}
            >
              Smart Timetables with
              <br />
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                AI Optimization
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Revolutionary AI-powered timetable generation and optimization platform. Create perfect schedules for schools, universities, and organizations in minutes.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Zoom in timeout={1200}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 32px rgba(59, 130, 246, 0.5)',
                    },
                  }}
                  onClick={() => setSignUpOpen(true)}
                >
                  Start Creating Timetables
                </Button>
              </Zoom>
              <Zoom in timeout={1400}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayCircle />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  }}
                >
                  See Demo
                </Button>
              </Zoom>
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3 }}>
              {benefits.map((benefit, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: theme.palette.text.secondary,
                  }}
                >
                  <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  <Typography variant="body2">{benefit}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Features Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Advanced Timetabling Features
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              mb: 6,
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Everything you need for intelligent schedule management and optimization
          </Typography>
          <Grid container spacing={4} alignItems="stretch">
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Card
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        border: `1px solid ${theme.palette.primary.main}40`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ 
                      color: theme.palette.text.secondary, 
                      lineHeight: 1.6,
                      flex: 1
                    }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Use Cases Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Perfect for Every Organization
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              mb: 8,
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Flexible solution that adapts to your specific scheduling needs
          </Typography>
          
          <Grid container spacing={4}>
            {[
              { 
                icon: <School sx={{ fontSize: 40 }} />, 
                name: 'Educational Institutions', 
                desc: 'Schools, colleges, and universities',
                features: ['Class scheduling', 'Teacher allocation', 'Room management', 'Exam timetables']
              },
              { 
                icon: <Business sx={{ fontSize: 40 }} />, 
                name: 'Corporate Organizations', 
                desc: 'Meetings, training, and resource booking',
                features: ['Meeting rooms', 'Training schedules', 'Resource planning', 'Shift management']
              },
              { 
                icon: <GroupWork sx={{ fontSize: 40 }} />, 
                name: 'Event Management', 
                desc: 'Conferences, workshops, and events',
                features: ['Session planning', 'Speaker coordination', 'Venue optimization', 'Attendee management']
              },
            ].map((useCase, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={2000 + index * 200}>
                  <Card
                    sx={{
                      p: 4,
                      height: '100%',
                      textAlign: 'center',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.4)'
                        : 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        border: `1px solid ${theme.palette.primary.main}40`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      {useCase.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                      {useCase.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {useCase.desc}
                    </Typography>
                    <Box sx={{ textAlign: 'left' }}>
                      {useCase.features.map((feature, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 16, mr: 1 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Feedback Form Section */}
        <Box sx={{ mb: 2 }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Fade in timeout={2200}>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        mb: 3,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      Please provide your valuable feedback
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                      }}
                    >
                      We would love to hear your inputs
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 2,
                        color: theme.palette.text.secondary,
                        lineHeight: 1.8,
                      }}
                    >
                      Your feedback helps us improve our AI timetabling platform and create better scheduling solutions. Share your thoughts, suggestions, or experiences with us.
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Fade in timeout={2400}>
                  <Card
                    sx={{
                      p: 4,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                        : '0 20px 40px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 4,
                        fontWeight: 600,
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                      }}
                    >
                      Feedback Form
                    </Typography>
                    
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        label="Your Name"
                        variant="outlined"
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                      />
                      <TextField
                        label="Comment (if any)"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                      />
                      
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                          fontSize: '1rem',
                          fontWeight: 600,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.5)',
                          },
                        }}
                        onClick={() => {
                          alert('Thank you for your feedback!');
                        }}
                      >
                        Send
                      </Button>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Container>

      {/* Sign In Dialog */}
      <Dialog 
        open={signInOpen} 
        onClose={() => setSignInOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your AI Timetable Generator account
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange('email')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                startAdornment={
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setSignInOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSignIn}
            sx={{ 
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            }}
          >
            Sign In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sign Up Dialog */}
      <Dialog 
        open={signUpOpen} 
        onClose={() => setSignUpOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Get Started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your AI Timetable Generator account
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange('name')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange('email')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                startAdornment={
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setSignUpOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSignUp}
            sx={{ 
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            }}
          >
            Create Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box
        sx={{
          py: 2,
          background: theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CalendarToday sx={{ color: '#3b82f6' }} />
                AI Timetable Generator
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: theme.palette.text.secondary,
                  maxWidth: 300,
                  lineHeight: 1.4,
                }}
              >
                Empowering organizations worldwide with intelligent timetable generation and optimization solutions.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  alignItems: 'center',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  © 2025 AI Timetable Generator. All rights reserved.
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <Twitter fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <LinkedIn fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <GitHub fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </Box>
  );
};

export default Landing;