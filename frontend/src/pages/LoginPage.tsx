/**
 * Login Page
 * Google OAuth login
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme, themeClasses, getThemeClass } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const LoginContent: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await login(credentialResponse.credential);
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4 ${
            isDark ? 'border-gold-400' : 'border-navy-600'
          }`} />
          <p className={isDark ? 'text-navy-200' : 'text-slate-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className={`rounded-2xl p-8 border text-center ${getThemeClass(themeClasses.card, isDark)}`}>
          <div className="text-6xl mb-4">💰</div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-navy-800'}`}>
            Welcome Back
          </h1>
          <p className={`mb-8 ${isDark ? 'text-navy-300' : 'text-slate-600'}`}>
            Sign in to access your financial dashboard and track your investments.
          </p>

          <div className="flex justify-center mb-6">
            {GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme={isDark ? "filled_black" : "outline"}
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            ) : (
              <div className={`rounded-lg p-4 text-sm ${
                isDark
                  ? 'bg-gold-500/20 border border-gold-400/30 text-gold-200'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}>
                <p className="font-semibold mb-1">Google OAuth not configured</p>
                <p>Set VITE_GOOGLE_CLIENT_ID in your .env file</p>
              </div>
            )}
          </div>

          <div className={`border-t pt-6 ${isDark ? 'border-navy-700' : 'border-slate-200'}`}>
            <p className={`text-sm mb-4 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>
              Don't have an account? Sign in with Google to get started.
            </p>
            <Link
              to="/"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isDark ? 'text-gold-400 hover:text-gold-300' : 'text-navy-600 hover:text-navy-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  if (!GOOGLE_CLIENT_ID) {
    return <LoginContent />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
