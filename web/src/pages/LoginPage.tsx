import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login:', { email, password });
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Close and Sign Up */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors text-2xl font-light"
          >
            ×
          </button>
          <Link
            to="/signup"
            className="px-6 py-2 bg-gray-800 text-blue-400 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            SIGN UP
          </Link>
        </div>

        {/* Login Form Card */}
        <div className="bg-gray-800 rounded-2xl p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Log in
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 bg-gray-700 text-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg placeholder-gray-400"
                placeholder="Email or username"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 bg-gray-700 text-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg placeholder-gray-400"
                placeholder="Password"
              />
              <a
                href="#"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm font-semibold transition-colors"
              >
                FORGOT?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-lg transition-colors shadow-lg"
            >
              LOG IN
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm font-semibold">OR</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-bold text-sm">G</span>
              </div>
              <span className="text-blue-400">GOOGLE</span>
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">f</span>
              </div>
              <span className="text-white">FACEBOOK</span>
            </button>
          </div>
        </div>

        {/* Legal Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By signing in to LearnHub, you agree to our{' '}
            <a href="#" className="text-gray-400 hover:text-white underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-gray-400 hover:text-white underline">
              Privacy Policy
            </a>
            .
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This site is protected by reCAPTCHA Enterprise and the{' '}
            <a href="#" className="text-gray-400 hover:text-white underline">
              Google Privacy Policy
            </a>{' '}
            and{' '}
            <a href="#" className="text-gray-400 hover:text-white underline">
              Terms of Service
            </a>{' '}
            apply.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
