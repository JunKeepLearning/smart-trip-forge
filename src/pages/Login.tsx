import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, X } from 'lucide-react';

const DEFAULT_REDIRECT_PATH = '/';

const Login: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupEmailSent, setSignupEmailSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState(5); // 用于密码重置页面的倒计时
  const [signupCountdown, setSignupCountdown] = useState(5); // 用于注册页面的倒计时

  // 处理密码重置和注册页面的倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // 处理密码重置页面的倒计时
    if (resetEmailSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (resetEmailSent && countdown === 0) {
      // 倒计时结束后自动返回登录页面
      setMode('signin');
      setResetEmailSent(false);
      setCountdown(5); // 重置倒计时
    }
    
    // 处理注册页面的倒计时
    if (signupEmailSent && signupCountdown > 0) {
      timer = setTimeout(() => setSignupCountdown(signupCountdown - 1), 1000);
    } else if (signupEmailSent && signupCountdown === 0) {
      // 倒计时结束后自动返回登录页面
      setMode('signin');
      setSignupEmailSent(false);
      setSignupCountdown(5); // 重置倒计时
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resetEmailSent, countdown, signupEmailSent, signupCountdown]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' })); // Clear only this field's error
  };

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (mode !== 'reset') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    // Display name validation for signup
    if (mode === 'signup') {
      if (!formData.displayName) {
        errors.displayName = 'Nickname is required';
      } else if (formData.displayName.length < 2) {
        errors.displayName = 'Nickname must be at least 2 characters';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    const { error } = await signIn(formData.email, formData.password);
    if (error) {
      let errorMessage = error.message;
      
      // 根据错误类型提供更友好的错误信息
      switch (error.type) {
        case 'auth':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'validation':
          errorMessage = 'Please check your email and password format.';
          break;
        case 'server':
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setFieldErrors({ form: errorMessage });
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    const { error } = await signUp(formData.email, formData.password, formData.displayName);
    if (error) {
      let errorMessage = error.message;
      
      // 根据错误类型提供更友好的错误信息
      switch (error.type) {
        case 'auth':
          errorMessage = 'This email is already registered. Please try another one or sign in.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'validation':
          errorMessage = 'Please check your email and password format. Password should be at least 6 characters.';
          break;
        case 'server':
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setFieldErrors({ form: errorMessage });
      return false;
    }
    setSignupEmailSent(true); // 显示邮箱验证提示
    return false;
  };

  const handleResetPassword = async () => {
    const { error } = await resetPassword(formData.email);
    if (error) {
      let errorMessage = error.message;
      
      // 根据错误类型提供更友好的错误信息
      switch (error.type) {
        case 'auth':
          errorMessage = 'No account found with this email address.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'validation':
          errorMessage = 'Please check your email format.';
          break;
        case 'server':
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setFieldErrors({ form: errorMessage });
    } else {
      setResetEmailSent(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setFieldErrors({});

    try {
      if (mode === 'reset') {
        await handleResetPassword();
      } else if (mode === 'signup') {
        await handleSignUp();
      } else {
        const success = await handleSignIn();
        if (success) {
          // 获取重定向前的路径，如果没有则使用默认路径
          const from = location.state?.from?.pathname || DEFAULT_REDIRECT_PATH;
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setFieldErrors({ form: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Titles and descriptions
  const getTitle = () => {
    if (mode === 'signup') return 'Create an Account';
    if (mode === 'reset') return 'Reset Password';
    return 'Welcome Back';
  };
  const getDescription = () => {
    if (mode === 'signup') return 'Fill in the details to start your journey.';
    if (mode === 'reset') return 'Enter your email to receive reset instructions.';
    return 'Sign in to your account to continue.';
  };

  // Render email verification / reset success
  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <b>{formData.email}</b>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Please check your inbox and click the reset link to set a new password.</p>
              <p>If you don't see the email, check your spam folder.</p>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Returning to sign in page in {countdown} seconds...
            </div>
            <Button 
              onClick={() => {
                setMode('signin');
                setResetEmailSent(false);
                setCountdown(5); // 重置倒计时
              }}
              variant="outline"
              className="w-full"
            >
              Back to Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signupEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <b>{formData.email}</b>. Please check your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Please click the verification link in the email to activate your account.</p>
              <p>If you don't see the email, check your spam folder.</p>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Returning to sign in page in {signupCountdown} seconds...
            </div>
            <Button 
              onClick={() => {
                setMode('signin');
                setSignupEmailSent(false);
                setSignupCountdown(5); // 重置倒计时
              }}
              variant="outline"
              className="w-full"
            >
              Back to Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative">
      <Link to="/" className="absolute top-4 right-4">
        <Button variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium text-foreground">Nickname</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter your nickname"
                    className={`pl-10 ${fieldErrors.displayName ? 'border-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.displayName && (
                  <p className="text-sm text-destructive">{fieldErrors.displayName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`pl-10 ${fieldErrors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 ${fieldErrors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>
            )}

            {fieldErrors.form && (
              <Alert variant="destructive">
                <AlertDescription>{fieldErrors.form}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </Button>

            <div className="text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button type="button" onClick={() => setMode('signup')} className="text-sm text-primary hover:text-primary/80 underline">
                    Don't have an account? Sign up
                  </button>
                  <div>
                    <button type="button" onClick={() => setMode('reset')} className="text-sm text-primary hover:text-primary/80 underline">
                      Forgot your password?
                    </button>
                  </div>
                </>
              )}
              {mode === 'signup' && (
                <button type="button" onClick={() => setMode('signin')} className="text-sm text-primary hover:text-primary/80 underline">
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'reset' && (
                <button type="button" onClick={() => setMode('signin')} className="text-sm text-primary hover:text-primary/80 underline">
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
