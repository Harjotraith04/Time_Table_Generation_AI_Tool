import React, { useContext } from 'react';
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
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeModeContext } from '../App';
import {
  Analytics,
  Code,
  TrendingUp,
  Security,
  Speed,
  GroupWork,
  AutoAwesome,
  Insights,
  LightMode,
  DarkMode,
  ArrowForward,
  CheckCircle,
  PlayCircle,
  Twitter,
  LinkedIn,
  GitHub,
} from '@mui/icons-material';

const Landing = () => {
  const theme = useTheme();
  const { toggleColorMode, mode } = useContext(ThemeModeContext);

  const features = [
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Qualitative Coding',
      description: 'Streamline your coding process with AI-assisted thematic analysis, automated code suggestions, and intelligent pattern recognition across your qualitative data.',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Thematic Analysis',
      description: 'Discover meaningful themes and patterns in interviews, surveys, and documents with powerful analytical tools designed for researchers.',
    },
    {
      icon: <Insights sx={{ fontSize: 40 }} />,
      title: 'Data Visualization',
      description: 'Transform your findings into compelling visual narratives with interactive charts, theme maps, and publication-ready graphics.',
    },
    {
      icon: <GroupWork sx={{ fontSize: 40 }} />,
      title: 'Team Collaboration',
      description: 'Enable seamless collaboration with inter-rater reliability tools, shared codebooks, and real-time team coding sessions.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Research Insights',
      description: 'Generate comprehensive reports, track theme evolution, and extract actionable insights from your qualitative research data.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Ethical',
      description: 'Ensure data privacy and research ethics compliance with end-to-end encryption, anonymization tools, and secure data handling.',
    },
  ];

  const benefits = [
    'Code interviews, focus groups, and documents',
    'Identify themes with AI-powered analysis',
    'Collaborate with your research team',
    'Export findings in multiple formats',
    'Ensure inter-rater reliability',
  ];

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
              }}
            >
              ThemeAnalytica
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={toggleColorMode} color="inherit">
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                sx={{ borderRadius: 3 }}
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
              label="🔬 Qualitative Research Platform"
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
              Unlock Insights with
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
                Thematic Analysis
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
              Powerful qualitative data analysis platform for researchers. Code interviews, identify themes, and collaborate with your team using AI-powered insights.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Zoom in timeout={1200}>
                <Button
                  component={RouterLink}
                  to="/signup"
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
                >
                  Start Your Research
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
                  See How It Works
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
            Everything You Need for Qualitative Research
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
            From data collection to analysis and reporting - streamline your entire research workflow
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                          : '0 20px 40px rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${theme.palette.primary.main}40`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      {/* avatar removed */}
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                // avatar removed
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                // avatar removed
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Research Process Section */}
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
            Your Research Journey, Simplified
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
            Follow our proven methodology for systematic qualitative analysis
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Fade in timeout={1500}>
                <Box textAlign="center">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 3,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      fontSize: '2rem',
                    }}
                  >
                    1
                  </Avatar>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Upload & Organize
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Import interviews, documents, and media files. Organize your data into projects with secure cloud storage.
                  </Typography>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Fade in timeout={1700}>
                <Box textAlign="center">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 3,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      fontSize: '2rem',
                    }}
                  >
                    2
                  </Avatar>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Code & Analyze
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Apply codes manually or with AI assistance. Develop your codebook and identify emerging themes systematically.
                  </Typography>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Fade in timeout={1900}>
                <Box textAlign="center">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 3,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      fontSize: '2rem',
                    }}
                  >
                    3
                  </Avatar>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Report & Share
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Generate comprehensive reports, visualize findings, and collaborate with stakeholders on your discoveries.
                  </Typography>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Box>

        {/* Methodology Support Section */}
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
            Supported Research Methodologies
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
            Flexible tools that adapt to your preferred analytical approach
          </Typography>
          
          <Grid container spacing={3}>
            {[
              { name: 'Thematic Analysis', desc: 'Braun & Clarke methodology' },
              { name: 'Grounded Theory', desc: 'Constant comparative method' },
              { name: 'Content Analysis', desc: 'Quantitative & qualitative' },
              { name: 'Framework Analysis', desc: 'Ritchie & Spencer approach' },
              { name: 'Narrative Analysis', desc: 'Story-focused interpretation' },
              { name: 'Phenomenological Analysis', desc: 'IPA and descriptive methods' },
            ].map((method, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={2000 + index * 100}>
                  <Card
                    sx={{
                      p: 3,
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
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {method.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.desc}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
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
            Trusted by Researchers Worldwide
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
            See what our users are saying about ThemeAnalytica
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                quote: "ThemeAnalytica has revolutionized our qualitative data analysis. The AI-powered tools are incredibly intuitive and have saved us countless hours.",
                name: 'Dr. Jane Foster',
                title: 'Lead Researcher, University of Oxford',
                avatar: '/path/to/avatar1.png',
              },
              {
                quote: "The collaboration features are seamless. Our team can work on projects in real-time, which has significantly improved our workflow and inter-rater reliability.",
                name: 'Dr. Carlos Ramirez',
                title: 'Director of Research, Innovate Insights',
                avatar: '/path/to/avatar2.png',
              },
              {
                quote: "As a PhD student, this tool has been a lifesaver. It's affordable, powerful, and the customer support is outstanding. Highly recommended!",
                name: 'Aisha Khan',
                title: 'PhD Candidate, Stanford University',
                avatar: '/path/to/avatar3.png',
              },
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={2000 + index * 200}>
                  <Card
                    sx={{
                      p: 4,
                      height: '100%',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontStyle: 'italic',
                        mb: 3,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 50, height: 50, mr: 2 }} src={testimonial.avatar} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Feedback Form Section */}
        <Box sx={{ mb: 2 }}> {/* Reduced from mb: 8 to mb: 2 */}
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
                      Your feedback helps us improve our platform and create better tools for qualitative researchers worldwide. Share your thoughts, suggestions, or experiences with us.
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
                          // Add form submission logic here
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

      {/* Newsletter Subscription */}
      <Box
        sx={{
          py: 1, // Reduced padding
          background: theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.9)'
            : 'rgba(248, 250, 252, 0.9)',
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h6" // Reduced size
              sx={{
                mb: 1, // Reduced margin
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Stay Updated with Research Insights
            </Typography>
            <Typography
              variant="body2" // Reduced size
              sx={{
                mb: 2, // Reduced margin
                color: theme.palette.text.secondary,
              }}
            >
              Get the latest updates on qualitative research methodologies and platform features
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1, // Reduced gap
                maxWidth: 400,
                mx: 'auto',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                label="Your email"
                variant="outlined"
                size="small"
                fullWidth
              />
              <Button
                variant="contained"
                sx={{
                  px: 2, // Reduced padding
                  py: 1,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 2, // Reduced padding
          background: theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center"> {/* Reduced spacing */}
            {/* Left side - Company info */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1, // Reduced margin
                }}
              >
                ThemeAnalytica
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: theme.palette.text.secondary,
                  maxWidth: 300,
                  lineHeight: 1.4, // Reduced line height
                }}
              >
                Empowering researchers worldwide with intelligent qualitative analysis tools for meaningful insights and discoveries.
              </Typography>
            </Grid>
            
            {/* Right side - Copyright and social links */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  alignItems: 'center',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 1, // Reduced gap
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  © 2025 ThemeAnalytica. All rights reserved.
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}> {/* Reduced gap */}
                  {/* Social media icons */}
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
