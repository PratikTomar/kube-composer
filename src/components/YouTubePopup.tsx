import React, { useEffect } from 'react';
import { X, PlayCircle } from 'lucide-react';

interface YouTubePopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function YouTubePopup({ isOpen, onClose, videoId }: YouTubePopupProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      {/* Backdrop - click to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-label="Close video popup"
      />
      
      {/* Video Container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Kube Composer Demo</h3>
              <p className="text-sm text-blue-100">Learn how to use Kube Composer in minutes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            aria-label="Close video"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Content */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title="Kube Composer Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-600">
              <p>🎯 Learn how to create Kubernetes deployments visually</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Watch on YouTube →
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
    </div>
  );
}