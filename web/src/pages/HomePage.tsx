import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-white">
            ✨ LearnHub
          </div>
          <Link
            to="/login"
            className="px-6 py-2 bg-gray-800 text-blue-400 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            LOG IN
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight text-white">
              Learn & Play
              <br />
              <span className="text-blue-400">Together!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover amazing topics, play interactive games, and celebrate your learning journey!
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Link
                to="/login"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
              >
                GET STARTED
              </Link>
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white text-xl font-bold rounded-lg transition-colors border border-gray-700">
                EXPLORE TOPICS
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-colors border border-gray-700">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-3">Many Topics</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Explore different subjects from science to art and find what sparks your curiosity!
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-colors border border-gray-700">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-white mb-3">Fun Learning</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Learn through interactive games, puzzles, and activities that make education exciting!
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-colors border border-gray-700">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Progress</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                See how much you've learned, earn badges, and celebrate every achievement!
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gray-800 rounded-2xl p-8 md:p-12 border border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  100+
                </div>
                <div className="text-gray-400 font-semibold">Topics</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  50+
                </div>
                <div className="text-gray-400 font-semibold">Games</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  1000+
                </div>
                <div className="text-gray-400 font-semibold">Learners</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  4.9★
                </div>
                <div className="text-gray-400 font-semibold">Rating</div>
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="text-center mt-16">
            <p className="text-2xl md:text-3xl font-bold text-white mb-4">
              Remember: Learning is an adventure, and you're the hero! 💪✨
            </p>
            <p className="text-lg text-gray-400">
              Every step you take is a step toward greatness!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
