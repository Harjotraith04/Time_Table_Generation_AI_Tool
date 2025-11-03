import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import GridDistortion from '../components/GridDistortion';
import { 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Brain,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  Play,
  Twitter,
  Linkedin,
  Github,
  GraduationCap,
  Building2,
  UserCheck
} from 'lucide-react';

const Landing = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    feedbackName: '',
    feedbackEmail: '',
    feedbackComment: ''
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enable global page scrolling when the landing page is mounted.
  useEffect(() => {
    // Use inline styles to force-enable global scroll when landing mounts.
    // Inline styles take precedence over stylesheet rules and are reliable
    // across different CSS ordering setups.
    try {
      document.documentElement.style.overflowY = 'auto';
      document.body.style.overflowY = 'auto';
      // keep horizontal hidden
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';
    } catch (e) {}
    return () => {
      try {
        document.documentElement.style.overflowY = '';
        document.body.style.overflowY = '';
        document.documentElement.style.overflowX = '';
        document.body.style.overflowX = '';
      } catch (e) {}
    };
  }, []);

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      description: "AI-powered algorithms that automatically resolve conflicts and optimize resource allocation for maximum efficiency.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Optimization",
      description: "Machine learning models that learn from your preferences and continuously improve scheduling decisions.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Constraint Management",
      description: "Handle complex scheduling constraints including teacher availability, room capacity, and student preferences.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Instant notifications and updates when schedules change, keeping everyone informed and synchronized.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into resource utilization, scheduling efficiency, and optimization opportunities.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-user Access",
      description: "Role-based access control for administrators, teachers, and students with customized views and permissions.",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const useCases = [
    {
      icon: <GraduationCap className="w-12 h-12" />,
      name: "Schools & Universities",
      desc: "Academic institutions",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      name: "Corporate Training",
      desc: "Business organizations",  
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <UserCheck className="w-12 h-12" />,
      name: "Healthcare Facilities",
      desc: "Medical institutions",
      gradient: "from-green-500 to-emerald-600"
    }
  ];

  const benefits = [
    "Generate timetables in minutes, not hours",
    "Optimize resource allocation automatically", 
    "Handle complex constraints effortlessly",
    "Real-time conflict detection and resolution",
    "Export schedules in multiple formats"
  ];

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };


  const handleFeedbackSubmit = () => {
    alert('Thank you for your feedback!');
    setFormData(prev => ({ ...prev, feedbackName: '', feedbackEmail: '', feedbackComment: '' }));
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      <GridDistortion isDarkMode={isDarkMode} />
      
      {/* Enhanced gradient overlays for depth */}
      <div className="fixed inset-0 pointer-events-none z-10" style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.8) 100%)
        `,
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)'
      }} />

      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AlmanacAI
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 bg-white/10 text-slate-100 hover:bg-white/20`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Sign In
              </button>
              
              <button
                onClick={() => window.location.href = '/register'}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative z-20">
        
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ 
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ffffff 0%, #e879f9 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}>
            <span style={{ display: 'block' }}>
              AI For Generating Timetable
            </span>
            <span style={{ display: 'block' }}>
              and Optimization
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-medium" style={{
            color: '#cbd5e1',
            lineHeight: '1.7',
            letterSpacing: '0.01em'
          }}>
            Revolutionary AI-powered timetable generation and optimization platform. Create perfect schedules for schools, universities, and organizations in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => window.location.href = '/login'}
              className="group px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center backdrop-blur-sm border border-purple-500/20"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #3b82f6 100%)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              Start Creating Timetables
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => window.location.href = '/demo'}
              className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center border-2 backdrop-blur-md"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#cbd5e1',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = '#cbd5e1';
              }}
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Try Live Demo
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="group flex items-center space-x-2 transform hover:scale-105 transition-all duration-300 px-4 py-2 rounded-lg backdrop-blur-sm hover:backdrop-blur-md"
                   style={{ 
                     animationDelay: `${index * 0.1}s`,
                     animation: 'fadeInUp 0.6s ease-out forwards',
                     opacity: 0,
                     background: 'rgba(255, 255, 255, 0.05)',
                     border: '1px solid rgba(255, 255, 255, 0.1)'
                   }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                     style={{
                       background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                       boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                     }}>
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20 relative z-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Timetabling Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need for intelligent schedule management and optimization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                     style={{
                       boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                     }}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-purple-200 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="leading-relaxed" style={{ color: '#cbd5e1' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Perfect for Every Organization
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Flexible solution that adapts to your specific scheduling needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-500 hover:scale-105 border text-center ${
                  isDarkMode 
                    ? 'bg-gray-800/30 border-gray-700 hover:border-gray-600' 
                    : 'bg-white/50 border-gray-200 hover:border-gray-300'
                } backdrop-blur-sm hover:shadow-2xl`}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${useCase.gradient} flex items-center justify-center mx-auto mb-6`}>
                  <div className="text-white">
                    {useCase.icon}
                  </div>
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {useCase.name}
                </h3>
                
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {useCase.desc}
                </p>
                
                <button className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              We Value Your Feedback
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Help us improve by sharing your thoughts and suggestions
            </p>
          </div>
          
          <div className={`max-w-2xl mx-auto p-8 rounded-2xl border ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/70 border-gray-200'
          } backdrop-blur-sm`}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.feedbackName}
                    onChange={handleInputChange('feedbackName')}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.feedbackEmail}
                    onChange={handleInputChange('feedbackEmail')}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message
                </label>
                <textarea
                  rows={4}
                  value={formData.feedbackComment}
                  onChange={handleInputChange('feedbackComment')}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Share your thoughts, suggestions, or questions..."
                />
              </div>
              
              <button
                onClick={handleFeedbackSubmit}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Ready to revolutionize your scheduling process?
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mx-auto"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Landing;
