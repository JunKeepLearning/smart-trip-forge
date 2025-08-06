import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'reset') {
        const { error } = await resetPassword(formData.email);
        if (error) {
          setError(error);
        } else {
          setResetEmailSent(true);
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password);
        if (error) {
          setError(error);
        } else {
          // Redirect to home after successful signup
          navigate('/');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error);
        } else {
          // Redirect to home after successful login
          navigate('/');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signup': return 'Sign up to start planning your trips';
      case 'reset': return 'Enter your email to receive reset instructions';
      default: return 'Sign in to your account to continue';
    }
  };

  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setMode('signin');
                setResetEmailSent(false);
                setFormData({ email: '', password: '' });
              }}
              variant="outline"
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Input (hidden for reset mode) */}
            {mode !== 'reset' && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 
                mode === 'signin' ? 'Sign In' : 
                mode === 'signup' ? 'Create Account' : 
                'Send Reset Link'
              }
            </Button>

            {/* Mode Switching Links */}
            <div className="text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-sm text-primary hover:text-primary/80 underline"
                  >
                    Don't have an account? Sign up
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Already have an account? Sign in
                </button>
              )}

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;