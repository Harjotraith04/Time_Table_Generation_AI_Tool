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
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  GraduationCap,
  Building2,
  UserCheck,
  X
} from 'lucide-react';

const Landing = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
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

  const handleSignIn = () => {
    console.log('Sign in:', { email: formData.email, password: formData.password });
    setSignInOpen(false);
  };

  const handleSignUp = () => {
    console.log('Sign up:', formData);
    setSignUpOpen(false);
  };

  const handleFeedbackSubmit = () => {
    alert('Thank you for your feedback!');
    setFormData(prev => ({ ...prev, feedbackName: '', feedbackEmail: '', feedbackComment: '' }));
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      <GridDistortion isDarkMode={isDarkMode} />
      
      <div className="fixed inset-0 pointer-events-none z-10" style={{
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.8) 100%)',
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
                AI Timetable Generator
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
                onClick={() => setSignInOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Sign In
              </button>
              
              <button
                onClick={() => setSignUpOpen(true)}
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
            fontFamily: '"Bookman Old Style", "Book Antiqua", Palatino, serif',
            color: '#E6E6FA',
            textShadow: '2px 2px 0px #D8BFD8, 4px 4px 0px #DDA0DD, 6px 6px 0px #DA70D6, 8px 8px 12px rgba(218,112,214,0.5)',
            transform: 'perspective(300px) rotateX(5deg)',
            letterSpacing: '0.02em',
            filter: 'drop-shadow(0 10px 20px rgba(218,112,214,0.3))'
          }}>
            <span style={{
              display: 'inline-block',
              transform: 'scaleY(0.95)',
              textShadow: 'inherit'
            }}>
              AI For Generating Timetable
            </span>
            <br />
            <span style={{
              display: 'inline-block',
              transform: 'scaleY(0.95)',
              textShadow: 'inherit'
            }}>
              and Optimization
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{
            color: '#00BFFF',
            textShadow: '0 0 10px rgba(0,191,255,0.5), 0 0 20px rgba(0,191,255,0.3), 0 0 30px rgba(0,191,255,0.2)'
          }}>
            Revolutionary AI-powered timetable generation and optimization platform. Create perfect schedules for schools, universities, and organizations in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => window.location.href = '/login'}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center"
            >
              Start Creating Timetables
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center border-2 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white' 
                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
            }`}>
              <Play className="w-5 h-5 mr-2" />
              See Demo
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 transform hover:scale-105 transition-all duration-300"
                   style={{ 
                     animationDelay: `${index * 0.1}s`,
                     animation: 'fadeInUp 0.6s ease-out forwards',
                     opacity: 0
                   }}>
                <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                className={`p-8 rounded-2xl transition-all duration-300 border hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                    : 'bg-white/70 border-gray-200 hover:border-gray-300'
                } backdrop-blur-sm`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                
                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

      {signInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-50">
                Welcome Back
              </h2>
              <button
                onClick={() => setSignInOpen(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10 text-gray-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/20 bg-white/10 text-slate-100 placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-white/20 bg-white/10 text-slate-100 placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-slate-100"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                onClick={handleSignIn}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {signUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-50">
                Get Started
              </h2>
              <button
                onClick={() => setSignUpOpen(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10 text-gray-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/20 bg-white/10 text-slate-100 placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/20 bg-white/10 text-slate-100 placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-white/20 bg-white/10 text-slate-100 placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-slate-100"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/20 bg-white/10 text-slate-100 placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              
              <button
                onClick={handleSignUp}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
