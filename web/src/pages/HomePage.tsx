import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-secondary-50/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <span className="text-white text-base font-bold">L</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent">LearnHub</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-primary-700 hover:text-primary-900 border-2 border-primary-300 rounded-xl hover:border-primary-500 hover:bg-primary-50/50 cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-xl hover:from-secondary-700 hover:to-secondary-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-150 active:translate-y-0 active:shadow-md"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl">
          <div className="inline-block mb-6 px-4 py-2 bg-primary-100/70 border border-primary-300 rounded-full">
            <span className="text-sm font-semibold text-primary-700">✨ Welcome to the future of learning</span>
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-black text-surface-900 tracking-tight leading-tight mb-2">
            Learning made
            <br />
            <span className="bg-gradient-to-r from-secondary-600 via-primary-500 to-tertiary-500 bg-clip-text text-transparent">simple & beautiful.</span>
          </h1>
          
          <p className="mt-8 text-xl text-surface-600 leading-relaxed max-w-3xl font-medium">
            A thoughtfully designed platform that adapts to <span className="text-primary-700 font-semibold">how you think</span>. Master new skills through interactive lessons, watch your growth come alive, and celebrate every milestone with visual progress that matters.
          </p>
          
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-tertiary-500 to-tertiary-600 rounded-2xl hover:from-tertiary-600 hover:to-tertiary-700 shadow-2xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-150 active:translate-y-0 group"
            >
              Start learning free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-primary-700 bg-white border-2 border-primary-300 rounded-2xl hover:bg-primary-50 hover:border-primary-500 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-150 active:translate-y-0 group">
              <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch demo
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-16 flex flex-wrap gap-6 pt-8 border-t border-primary-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">100</span>
              </div>
              <div>
                <div className="font-semibold text-surface-900">Topics</div>
                <div className="text-sm text-surface-600">Curated for growth</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">50K</span>
              </div>
              <div>
                <div className="font-semibold text-surface-900">Learners</div>
                <div className="text-sm text-surface-600">Already learning</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">4.9</span>
              </div>
              <div>
                <div className="font-semibold text-surface-900">Rating</div>
                <div className="text-sm text-surface-600">From real users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-white via-primary-50/40 to-surface-50 border-y border-primary-100/50">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-surface-900 mb-4">
              Everything you need to <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">learn powerfully</span>
            </h2>
            <p className="text-lg text-surface-600 font-medium leading-relaxed">
              Built with care for learners of all ages. Thoughtful design. Real results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Curated */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-primary-50/50 border-2 border-primary-100/60 group-hover:border-primary-300 shadow-lg hover:shadow-xl transition-all duration-300 cursor-default">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-surface-900 mb-3">Curated Topics</h3>
                <p className="text-surface-700 leading-relaxed font-medium">
                  Over 100 carefully structured topics across science, math, art, and beyond. Each designed for progressive mastery.
                </p>
              </div>
            </div>

            {/* Feature 2 - Interactive */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-200/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-secondary-50/50 border-2 border-secondary-100/60 group-hover:border-secondary-300 shadow-lg hover:shadow-xl transition-all duration-300 cursor-default">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-surface-900 mb-3">Interactive Learning</h3>
                <p className="text-surface-700 leading-relaxed font-medium">
                  Hands-on exercises, visual explanations, and real-world examples that make concepts click instantly.
                </p>
              </div>
            </div>

            {/* Feature 3 - Progress */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-200/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-accent-50/50 border-2 border-accent-100/60 group-hover:border-accent-300 shadow-lg hover:shadow-xl transition-all duration-300 cursor-default">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-surface-900 mb-3">Visible Progress</h3>
                <p className="text-surface-700 leading-relaxed font-medium">
                  See exactly where you are. Celebrate wins, identify growth areas, and stay motivated every day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-600 to-tertiary-500"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            Ready to transform how you learn?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 font-medium">
            Join thousands of learners who've discovered a smarter way to grow.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 px-10 py-4 text-lg font-bold text-primary-700 bg-white rounded-2xl hover:bg-primary-50 shadow-2xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-150 active:translate-y-0 group"
          >
            Start free today
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <p className="text-surface-400 font-medium">
            Made with <span className="text-tertiary-400">💜</span> for learners everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;