import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Verification state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { register, googleLogin, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      // Show OTP screen instead of navigating
      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyOtp(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/20 rounded-xl mb-4">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Create an account</h2>
          <p className="text-text-muted mt-2">Join Code100x today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {!showOtp ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-2.5 flex justify-center mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign up'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-text-muted">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      await googleLogin(credentialResponse.credential);
                      navigate('/');
                    } catch (err) {
                      setError(err.response?.data?.message || 'Google Sign Up failed');
                    }
                  }}
                  onError={() => {
                    setError('Google Sign Up Failed');
                  }}
                />
              </div>
            </div>

            <p className="text-center mt-6 text-sm text-text-muted">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-text-muted">
                We've sent a 6-digit verification code to <br/>
                <span className="font-semibold text-white">{email}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 text-center">Verification Code (OTP)</label>
              <input 
                type="text" 
                required
                maxLength={6}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || otp.length !== 6}
              className="w-full btn-primary py-2.5 flex justify-center mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Email'}
            </button>
            
            <p className="text-center mt-4 text-sm text-text-muted cursor-pointer hover:text-white" onClick={() => setShowOtp(false)}>
              Wrong email? Go back
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
