import React, { useState, useEffect } from 'react';
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
  const [darkMode, setDarkMode] = useState(false);
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
      icon: <Calendar className="w-10 h-10" />,
      title: 'AI-Powered Scheduling',
      description: 'Generate optimal timetables using advanced AI algorithms that consider constraints, preferences, and resource availability for maximum efficiency.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: 'Smart Optimization',
      description: 'Minimize conflicts and maximize resource utilization with intelligent optimization that adapts to your specific scheduling requirements.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: 'Real-time Management',
      description: 'Monitor and adjust schedules in real-time with intuitive dashboard controls and instant conflict detection.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: 'Automated Solutions',
      description: 'Reduce manual effort with automated timetable generation that handles complex scheduling scenarios effortlessly.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: 'Performance Analytics',
      description: 'Track scheduling efficiency, resource utilization, and identify optimization opportunities with comprehensive analytics.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with reliable cloud infrastructure ensuring your scheduling data is always protected and accessible.',
      gradient: 'from-teal-500 to-cyan-500'
    },
  ];

  const benefits = [
    'Generate timetables in minutes, not hours',
    'Optimize resource allocation automatically',
    'Handle complex constraints effortlessly',
    'Real-time conflict detection and resolution',
    'Export schedules in multiple formats',
  ];

  const useCases = [
    { 
      icon: <GraduationCap className="w-12 h-12" />, 
      name: 'Educational Institutions', 
      desc: 'Schools, colleges, and universities',
      features: ['Class scheduling', 'Teacher allocation', 'Room management', 'Exam timetables'],
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      icon: <Building2 className="w-12 h-12" />, 
      name: 'Corporate Organizations', 
      desc: 'Meetings, training, and resource booking',
      features: ['Meeting rooms', 'Training schedules', 'Resource planning', 'Shift management'],
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      icon: <Users className="w-12 h-12" />, 
      name: 'Event Management', 
      desc: 'Conferences, workshops, and events',
      features: ['Session planning', 'Speaker coordination', 'Venue optimization', 'Attendee management'],
      gradient: 'from-green-500 to-teal-600'
    },
  ];

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSignIn = () => {
    alert(`Welcome back! Signing in with ${formData.email}`);
    setSignInOpen(false);
    setFormData(prev => ({ ...prev, email: '', password: '' }));
  };

  const handleSignUp = () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert(`Account created successfully for ${formData.name}!`);
    setSignUpOpen(false);
    setFormData(prev => ({ ...prev, name: '', email: '', password: '', confirmPassword: '' }));
  };

  const handleFeedbackSubmit = () => {
    alert('Thank you for your feedback!');
    setFormData(prev => ({ ...prev, feedbackName: '', feedbackEmail: '', feedbackComment: '' }));
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            background: darkMode 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0.3s ease'
          }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-10 animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* Header */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        darkMode 
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
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setSignInOpen(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500' 
                    : 'text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
                }`}
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 ${
            darkMode 
              ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' 
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <Sparkles className="w-4 h-4 mr-2" />
            🤖 AI-Powered Timetabling Solution
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Smart Timetables with
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              AI Optimization
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Revolutionary AI-powered timetable generation and optimization platform. Create perfect schedules for schools, universities, and organizations in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setSignUpOpen(true)}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center"
            >
              Start Creating Timetables
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className={`group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center border-2 ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white' 
                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
            }`}>
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              See Demo
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Timetabling Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need for intelligent schedule management and optimization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-500 hover:scale-105 border ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                    : 'bg-white/70 border-gray-200 hover:border-gray-300'
                } backdrop-blur-sm hover:shadow-2xl`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                
                <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Perfect for Every Organization
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Flexible solution that adapts to your specific scheduling needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-500 hover:scale-105 border text-center ${
                  darkMode 
                    ? 'bg-gray-800/30 border-gray-700 hover:border-gray-600' 
                    : 'bg-white/50 border-gray-200 hover:border-gray-300'
                } backdrop-blur-sm hover:shadow-2xl`}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${useCase.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {useCase.icon}
                  </div>
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {useCase.name}
                </h3>
                
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {useCase.desc}
                </p>
                
                <div className="space-y-3">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Please provide your valuable feedback
            </h3>
            <p className={`text-xl mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              We would love to hear your inputs
            </p>
            <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your feedback helps us improve our AI timetabling platform and create better scheduling solutions. Share your thoughts, suggestions, or experiences with us.
            </p>
          </div>
          
          <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/70 border-gray-200'
          }`}>
            <h4 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Feedback Form
            </h4>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.feedbackName}
                onChange={handleInputChange('feedbackName')}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              
              <input
                type="email"
                placeholder="Email"
                value={formData.feedbackEmail}
                onChange={handleInputChange('feedbackEmail')}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              
              <textarea
                placeholder="Comment (if any)"
                rows={4}
                value={formData.feedbackComment}
                onChange={handleInputChange('feedbackComment')}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              
              <button
                onClick={handleFeedbackSubmit}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      {signInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-8 rounded-2xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } transform transition-all duration-300 scale-100`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome Back
              </h2>
              <button
                onClick={() => setSignInOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Mail className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
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

      {/* Sign Up Modal */}
      {signUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-8 rounded-2xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } transform transition-all duration-300 scale-100`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Get Started
              </h2>
              <button
                onClick={() => setSignUpOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <User className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="relative">
                <Mail className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
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

      {/* Footer */}
      <footer className={`border-t backdrop-blur-xl ${
        darkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Timetable Generator
                </h3>
              </div>
              <p className={`text-sm max-w-md leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Empowering organizations worldwide with intelligent timetable generation and optimization solutions.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-end space-y-4 md:space-y-0 md:space-x-6">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2025 AI Timetable Generator. All rights reserved.
              </p>
              
              <div className="flex space-x-4">
                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                }`}>
                  <Twitter className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                }`}>
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                }`}>
                  <Github className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;