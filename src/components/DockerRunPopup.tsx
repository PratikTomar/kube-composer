import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download, Play, Terminal, Pocket as Docker } from 'lucide-react';

interface DockerRunPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DockerRunPopup({ isOpen, onClose }: DockerRunPopupProps) {
  const [copied, setCopied] = useState(false);
  
  const dockerCommand = 'docker pull same7ammar/kube-composer && docker run -p 8080:80 same7ammar/kube-composer';
  const simpleCommand = 'docker run -p 8080:80 same7ammar/kube-composer';

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(dockerCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = dockerCommand;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Backdrop - click to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-label="Close Docker popup"
      />
      
      {/* Popup Container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Docker className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Run Locally with Docker</h3>
              <p className="text-sm text-blue-100">Get Kube Composer running on your machine in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            aria-label="Close popup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Start */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <Play className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Quick Start</h4>
            </div>
            <p className="text-sm text-green-800 mb-4">
              Run this single command to pull and start Kube Composer locally:
            </p>
            
            {/* Command Box */}
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm font-mono">Terminal</span>
                </div>
                <button
                  onClick={handleCopyCommand}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors duration-200"
                  title="Copy command to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-green-400 font-mono text-sm block break-all">
                {dockerCommand}
              </code>
            </div>
          </div>

          {/* Step by Step Instructions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Prerequisites</span>
            </h4>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-gray-600">
                Make sure you have Docker installed on your system:
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://docs.docker.com/get-docker/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Download className="w-3 h-3" />
                  <span>Install Docker</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-gray-400">•</span>
                <a
                  href="https://docs.docker.com/desktop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <span>Docker Desktop</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Run the Command</span>
            </h4>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-gray-600">
                Open your terminal and run the command above. This will:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                <li>Pull the latest Kube Composer Docker image</li>
                <li>Start the container on port 8080</li>
                <li>Make it accessible at <code className="bg-gray-100 px-1 rounded">http://localhost:8080</code></li>
              </ul>
            </div>

            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Access the Application</span>
            </h4>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-gray-600">
                Once the container is running, open your browser and navigate to:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <a
                  href="http://localhost:8080"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium"
                >
                  <span>http://localhost:8080</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Alternative Commands */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Alternative Commands</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">If you already have the image:</p>
                <code className="bg-gray-900 text-green-400 px-3 py-2 rounded text-sm font-mono block">
                  {simpleCommand}
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Run in detached mode (background):</p>
                <code className="bg-gray-900 text-green-400 px-3 py-2 rounded text-sm font-mono block">
                  docker run -d -p 8080:80 same7ammar/kube-composer
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Custom port (e.g., 3000):</p>
                <code className="bg-gray-900 text-green-400 px-3 py-2 rounded text-sm font-mono block">
                  docker run -p 3000:80 same7ammar/kube-composer
                </code>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">Why Run Locally?</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• <strong>Privacy:</strong> Your data never leaves your machine</li>
              <li>• <strong>Speed:</strong> No network latency, instant responses</li>
              <li>• <strong>Offline:</strong> Works without internet connection</li>
              <li>• <strong>Customization:</strong> Modify and extend as needed</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p className="flex items-center">
              <Docker className="w-4 h-4 mr-2 text-blue-600" />
              Image: <code className="ml-1 bg-gray-200 px-1 rounded">same7ammar/kube-composer</code>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://hub.docker.com/r/same7ammar/kube-composer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View on Docker Hub</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}