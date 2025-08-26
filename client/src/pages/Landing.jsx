import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
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
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Enhanced 3D Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            background: isDarkMode 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0.3s ease',
            transform: 'translateZ(0) perspective(1000px) rotateX(10deg)'
          }}
        />
        
        {/* 3D Floating Cubes */}
        <div className="absolute top-20 right-20 w-20 h-20 opacity-30" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          transform: 'perspective(1000px) rotateX(25deg) rotateY(25deg)',
          animation: 'float3d 6s ease-in-out infinite'
        }} />
        
        <div className="absolute top-40 left-1/4 w-16 h-16 opacity-25" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          transform: 'perspective(1000px) rotateX(-20deg) rotateY(35deg)',
          animation: 'float3d 8s ease-in-out infinite reverse'
        }} />
        
        <div className="absolute bottom-32 right-1/3 w-24 h-24 opacity-20" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          transform: 'perspective(1000px) rotateX(30deg) rotateY(-25deg)',
          animation: 'float3d 7s ease-in-out infinite'
        }} />
        
        {/* 3D Geometric Shapes */}
        <div className="absolute top-1/3 right-10 w-32 h-32 opacity-15" style={{
          background: 'conic-gradient(from 180deg at 50% 50%, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #ff6b6b)',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          transform: 'perspective(1000px) rotateX(15deg) rotateY(45deg)',
          animation: 'rotate3d 10s linear infinite'
        }} />
        
        <div className="absolute bottom-20 left-20 w-40 h-40 opacity-15" style={{
          background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)',
          borderRadius: '50% 10% 50% 10%',
          transform: 'perspective(1000px) rotateX(-15deg) rotateY(-30deg)',
          animation: 'morph3d 12s ease-in-out infinite'
        }} />
      </div>

      {/* Header */}
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
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => window.location.href = '/login'}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
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

      {/* Enhanced Hero Section with 3D Elements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative">
        {/* 3D Calendar Icon Animation */}
        <div className="absolute top-10 right-10 opacity-20 pointer-events-none hidden lg:block">
          <div className="relative" style={{
            transform: 'perspective(1000px) rotateX(25deg) rotateY(15deg)',
            animation: 'float3d 4s ease-in-out infinite'
          }}>
            <Calendar className="w-32 h-32 text-blue-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-lg"
                 style={{ transform: 'translateZ(-10px) scale(1.1)' }} />
          </div>
        </div>
        
        <div className="text-center mb-16 relative">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 ${
            isDarkMode 
              ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' 
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <Sparkles className="w-4 h-4 mr-2" />
            🤖 AI-Powered Timetabling Solution
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`} style={{
            textShadow: isDarkMode 
              ? '0 8px 32px rgba(59, 130, 246, 0.3)' 
              : '0 8px 32px rgba(99, 102, 241, 0.3)',
            transform: 'perspective(1000px) translateZ(0)'
          }}>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              Smart Timetables with
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block transform hover:scale-110 transition-all duration-500"
                  style={{
                    animation: 'textGlow 3s ease-in-out infinite alternate'
                  }}>
              AI Optimization
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Revolutionary AI-powered timetable generation and optimization platform. Create perfect schedules for schools, universities, and organizations in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => window.location.href = '/login'}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center relative overflow-hidden"
              style={{
                transform: 'perspective(1000px) translateZ(0)',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ 
                     transform: 'skewX(-15deg) translateX(-100%)',
                     transition: 'transform 0.6s ease'
                   }} />
              Start Creating Timetables
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className={`group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center border-2 relative overflow-hidden ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white' 
                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
            }`} style={{
              transform: 'perspective(1000px) translateZ(0)',
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(75, 85, 99, 0.3)' 
                : '0 8px 32px rgba(156, 163, 175, 0.3)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
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

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Timetabling Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need for intelligent schedule management and optimization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-500 border relative overflow-hidden card-3d ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                    : 'bg-white/70 border-gray-200 hover:border-gray-300'
                } backdrop-blur-sm`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transform: 'perspective(1000px) rotateX(2deg) rotateY(2deg)',
                  boxShadow: isDarkMode 
                    ? '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(59, 130, 246, 0.1)' 
                    : '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(99, 102, 241, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateX(-5deg) rotateY(5deg) translateZ(20px) scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) rotateY(2deg) translateZ(0px) scale(1)';
                }}
              >
                {/* 3D Floating Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 relative group-hover:scale-110 transition-all duration-300`}
                     style={{
                       transform: 'translateZ(30px)',
                       boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                       animation: `float3d 3s ease-in-out infinite ${index * 0.5}s`
                     }}>
                  <div className="text-white relative z-10">
                    {feature.icon}
                  </div>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.gradient} opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-300`} />
                </div>
                
                <h3 className={`text-xl font-bold mb-4 relative z-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                
                <p className={`leading-relaxed relative z-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
                
                {/* 3D Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} 
                     style={{ transform: 'translateZ(-20px)' }} />
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{
                       background: `linear-gradient(45deg, transparent, ${feature.gradient.includes('blue') ? '#3b82f6' : feature.gradient.includes('purple') ? '#8b5cf6' : feature.gradient.includes('green') ? '#10b981' : feature.gradient.includes('orange') ? '#f59e0b' : feature.gradient.includes('indigo') ? '#6366f1' : '#06b6d4'}40, transparent)`,
                       backgroundSize: '400% 400%',
                       animation: 'gradientShift 3s ease infinite'
                     }} />
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
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
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${useCase.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
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
                
                <div className="space-y-3">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
            <p className={`text-xl mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              We would love to hear your inputs
            </p>
            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your feedback helps us improve our AI timetabling platform and create better scheduling solutions. Share your thoughts, suggestions, or experiences with us.
            </p>
          </div>
          
          <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/70 border-gray-200'
          }`}>
            <h4 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Feedback Form
            </h4>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.feedbackName}
                onChange={handleInputChange('feedbackName')}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDarkMode 
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
                  isDarkMode 
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
                  isDarkMode 
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
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } transform transition-all duration-300 scale-100`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome Back
              </h2>
              <button
                onClick={() => setSignInOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Mail className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
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
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } transform transition-all duration-300 scale-100`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Get Started
              </h2>
              <button
                onClick={() => setSignUpOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <User className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="relative">
                <Mail className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
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
        isDarkMode 
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
              <p className={`text-sm max-w-md leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Empowering organizations worldwide with intelligent timetable generation and optimization solutions.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-end space-y-4 md:space-y-0 md:space-x-6">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2025 AI Timetable Generator. All rights reserved.
              </p>
              
              <div className="flex space-x-4">
                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                }`}>
                  <Twitter className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                }`}>
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
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
