import { Github, Heart, Zap } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white relative">
      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Left: Copyright */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} Kube Composer. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/same7ammar/kube-composer/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  MIT License
                </a>
                <a
                  href="https://github.com/same7ammar/kube-composer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  <Github className="w-4 h-4" />
                  <span>Source Code</span>
                </a>
              </div>
            </div>
            
            {/* Center: Made with love */}
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span>for the Kubernetes community</span>
            </div>

            {/* Right: Built with Bolt.new Badge */}
            <div className="flex justify-end">
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-purple-600" />
                </div>
                <span>Built with Bolt.new</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
    </footer>
  );
}