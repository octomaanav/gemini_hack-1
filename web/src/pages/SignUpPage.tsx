import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    console.log('Sign up:', { name, email, password });
  };

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-tertiary-50/20 to-secondary-50/20 flex flex-col lg:flex-row">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-tertiary-500 via-tertiary-600 to-orange-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative max-w-md text-center z-10">
          <div className="w-24 h-24 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl border border-white/20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Start your learning adventure
          </h2>
          <p className="text-orange-100 leading-relaxed text-lg font-medium mb-12">
            Join thousands of learners building knowledge through interactive lessons and personalized paths.
          </p>

          {/* Testimonial */}
          <div className="p-6 bg-white/15 backdrop-blur-md rounded-2xl text-left border border-white/20">
            <p className="text-white/95 italic leading-relaxed font-medium">
              "LearnHub helped me understand concepts I'd struggled with. The adaptive learning is incredible."
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-tertiary-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">SK</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Sarah K.</div>
                <div className="text-orange-100 text-xs font-semibold">Completed 12 courses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-tertiary-700 hover:text-tertiary-900 hover:bg-tertiary-100/60 rounded-lg px-3 py-2 -ml-3 cursor-pointer transition-all duration-150 mb-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-primary-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">L</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent">LearnHub</span>
          </Link>

          {/* Header */}
          <h1 className="text-3xl font-black text-surface-900 mb-2">
            Create your account
          </h1>
          <p className="text-lg text-surface-600 font-medium mb-10">
            Start learning free. No credit card required.
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Social Signup */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border-2 border-primary-200 rounded-2xl text-surface-700 font-bold hover:border-primary-400 hover:bg-primary-50/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-150 active:translate-y-0 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border-2 border-secondary-200 rounded-2xl text-surface-700 font-bold hover:border-secondary-400 hover:bg-secondary-50/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-150 active:translate-y-0 group"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-surface-300"></div>
            <span className="px-4 text-sm font-semibold text-surface-600">or</span>
            <div className="flex-1 border-t border-surface-300"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-surface-900 mb-2">
                Full name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-5 py-3.5 bg-white border-2 border-tertiary-200 rounded-xl text-surface-900 placeholder-surface-400 hover:border-tertiary-300 focus:outline-none focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-400/30 shadow-sm transition-all duration-150 font-medium"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-surface-900 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-5 py-3.5 bg-white border-2 border-tertiary-200 rounded-xl text-surface-900 placeholder-surface-400 hover:border-tertiary-300 focus:outline-none focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-400/30 shadow-sm transition-all duration-150 font-medium"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-surface-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-5 py-3.5 bg-white border-2 border-tertiary-200 rounded-xl text-surface-900 placeholder-surface-400 hover:border-tertiary-300 focus:outline-none focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-400/30 shadow-sm transition-all duration-150 font-medium"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs font-semibold text-surface-600">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              className="w-full px-5 py-3.5 bg-gradient-to-r from-tertiary-500 to-tertiary-600 text-white font-bold rounded-xl hover:from-tertiary-600 hover:to-tertiary-700 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-150 active:translate-y-0 text-base"
            >
              Create account
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-base text-surface-700 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-tertiary-600 hover:text-tertiary-700 cursor-pointer transition-colors duration-150">
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-surface-600 leading-relaxed font-medium">
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-surface-800 cursor-pointer transition-colors duration-150">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-surface-800 cursor-pointer transition-colors duration-150">Privacy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
