import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [role, setRole] = useState('company');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, role);
      
      if (result.success) {
        // Redirect based on role
        if (result.user.role === 'company') {
          navigate('/dashboard/company');
        } else if (result.user.role === 'employee') {
          navigate('/dashboard/employee');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="navbar py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="MyHireShield" className="h-12 w-12 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent">
                MyHireShield
              </span>
            </Link>
            <Link to="/" className="navbar-link">
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Container */}
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your MyHireShield account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
                <i className="fas fa-exclamation-circle text-xl mt-0.5"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="form-label">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'company'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <i className={`fas fa-building text-2xl mb-2 ${role === 'company' ? 'text-green-600' : 'text-gray-400'}`}></i>
                  <div className="font-semibold">Company</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'employee'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <i className={`fas fa-user text-2xl mb-2 ${role === 'employee' ? 'text-red-600' : 'text-gray-400'}`}></i>
                  <div className="font-semibold">Employee</div>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-semibold">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="btn btn-outline">
                <i className="fab fa-google mr-2 text-red-500"></i>
                Google
              </button>
              <button className="btn btn-outline">
                <i className="fab fa-microsoft mr-2 text-blue-500"></i>
                Microsoft
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link 
                to={role === 'company' ? '/register/company' : '/register/employee'} 
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;