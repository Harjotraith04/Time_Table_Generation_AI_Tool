import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Calendar,
  ArrowRight,
  Brain,
  Clock,
  Users,
  BookOpen,
  Zap,
  Settings,
  BarChart3,
  UserCheck,
  Building
} from 'lucide-react';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  // Determine initial mode based on URL
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'admin'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (formType, field) => (event) => {
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [field]: event.target.value }));
    } else {
      setRegisterData(prev => ({ ...prev, [field]: event.target.value }));
    }
  };

  const toggleMode = (signUpMode) => {
    setIsSignUp(signUpMode);
    setError('');
    // Update URL without page reload
    navigate(signUpMode ? '/register' : '/login', { replace: true });
  };

  const validateRegister = () => {
    if (!registerData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!registerData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login({
        email: loginData.email,
        password: loginData.password
      });

      if (result.success) {
        if (result.user.role === 'admin' || result.user.role === 'faculty') {
          navigate('/admin-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateRegister()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        department: registerData.department || undefined
      });

      if (result.success) {
        if (result.user.role === 'admin' || result.user.role === 'faculty') {
          navigate('/admin-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex items-start justify-center pt-3 px-4 pb-4 overflow-hidden">
      <div className="w-full max-w-3xl">
        
        {/* Toggle Buttons */}
        <div className="flex gap-4 mb-4 bg-gray-800 rounded-2xl p-2 sticky top-3 z-20 shadow-lg ring-1 ring-white/10">
          <button
            onClick={() => toggleMode(false)}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              !isSignUp
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => toggleMode(true)}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              isSignUp
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Card Container */}
        <div className="relative mt-2">
          <div 
            className={`card-container ${isSignUp ? 'flipped' : ''}`}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            
            {/* Sign In Card */}
            <div className="card-face card-front">
              <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex ring-1 ring-white/10">
                {/* Left Panel */}
                <div className="hidden md:flex basis-5/12 bg-gradient-to-b from-gray-700 to-gray-800 p-6 text-white relative">
                  {/* Floating Icons */}
                  <div className="absolute top-2 left-3 animate-float-slow opacity-30">
                    <Clock className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="absolute top-6 right-6 animate-float-slow delay-1000 opacity-30">
                    <Calendar className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="absolute bottom-2 left-4 animate-float-slow delay-2000 opacity-30">
                    <Users className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="absolute bottom-4 right-4 animate-float-slow delay-3000 opacity-30">
                    <BookOpen className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
                    <div className="w-14 h-14 mb-3 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Brain className="w-7 h-7 text-blue-300" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Welcome Back</h2>
                    <p className="text-blue-100/80 text-xs">AI Timetable Generator</p>
                    <div className="space-y-2 mt-4 text-xs text-blue-100/80">
                      <div className="flex items-center justify-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Smart Scheduling</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>Multi-User</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Form */}
                <div className="basis-full md:basis-7/12 p-5">
                  <form onSubmit={handleLogin} className="space-y-3">
                    {error && (
                      <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 animate-shake">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-sm">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={loginData.email}
                        onChange={handleInputChange('login', 'email')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleInputChange('login', 'password')}
                        className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="text-right">
                      <button type="button" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Sign In</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    {/* Social Login */}
                    <div className="flex items-center my-3">
                      <div className="flex-1 border-t border-gray-600"></div>
                      <span className="px-4 text-gray-500 text-sm">Or continue with</span>
                      <div className="flex-1 border-t border-gray-600"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center space-x-2 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          G
                        </div>
                        <span className="text-gray-300">Google</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center space-x-2 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          f
                        </div>
                        <span className="text-gray-300">Facebook</span>
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => navigate('/')}
                      className="text-gray-500 hover:text-gray-400 text-sm transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Back to landing page</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Up Card */}
            <div className="card-face card-back">
              <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex ring-1 ring-white/10">
                {/* Left Panel */}
                <div className="hidden md:flex basis-5/12 bg-gradient-to-b from-purple-600 to-purple-700 p-6 text-white relative">
                  {/* Floating Icons */}
                  <div className="absolute top-2 left-3 animate-float-slow opacity-30">
                    <Settings className="w-4 h-4 text-purple-200" />
                  </div>
                  <div className="absolute top-6 right-6 animate-float-slow delay-1000 opacity-30">
                    <Shield className="w-5 h-5 text-purple-200" />
                  </div>
                  <div className="absolute bottom-2 left-4 animate-float-slow delay-2000 opacity-30">
                    <BarChart3 className="w-4 h-4 text-purple-200" />
                  </div>
                  <div className="absolute bottom-4 right-4 animate-float-slow delay-3000 opacity-30">
                    <UserCheck className="w-4 h-4 text-purple-200" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
                    <div className="w-14 h-14 mb-3 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Create Account</h2>
                    <p className="text-purple-100/90 text-xs">Administrator Registration</p>
                    <div className="space-y-2 mt-4 text-xs text-purple-100/90">
                      <div className="flex items-center justify-center space-x-1">
                        <UserCheck className="w-3 h-3" />
                        <span>Full Control</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <Settings className="w-3 h-3" />
                        <span>User Management</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Form */}
                <div className="basis-full md:basis-7/12 p-5">
                  <form onSubmit={handleRegister} className="space-y-3">
                    {error && (
                      <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 animate-shake">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-sm">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-purple-900/30 border border-purple-600 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 font-medium text-sm">Administrator Account</span>
                      </div>
                    </div>

                    <div className="relative">
                      <User className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={registerData.name}
                        onChange={handleInputChange('register', 'name')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={registerData.email}
                        onChange={handleInputChange('register', 'email')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Building className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Department (Optional)"
                        value={registerData.department}
                        onChange={handleInputChange('register', 'department')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-300"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={registerData.password}
                        onChange={handleInputChange('register', 'password')}
                        className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={registerData.confirmPassword}
                        onChange={handleInputChange('register', 'confirmPassword')}
                        className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-4 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Create Admin Account</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </form>

                  <div className="mt-3 text-center">
                    <button 
                      onClick={() => navigate('/')}
                      className="text-gray-500 hover:text-gray-400 text-sm transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Back to landing page</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
