"use client";

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ChatInterface from './chat/ChatInterface';

type SlideOutChatPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SlideOutChatPanel({ isOpen, onClose }: SlideOutChatPanelProps) {
  // State to handle animation
  const [isAnimating, setIsAnimating] = useState(false);
  // Ref for the panel element to detect outside clicks
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key to close panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);
  
  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the panel is open and the click is outside the panel
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    // Add event listener for mousedown events
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle animation states and body scroll locking
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scrolling when panel is open
      document.body.style.overflow = 'hidden';
    } else {
      // Wait for animation to complete before removing from DOM
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match this with the animation duration
      
      // Re-enable scrolling when panel is closed
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup function to ensure scrolling is re-enabled
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // If panel is not open and not animating, don't render anything
  if (!isOpen && !isAnimating) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0"
      style={{ 
        zIndex: 9999,
        visibility: isOpen || isAnimating ? 'visible' : 'hidden'
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop with fade transition */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.5)', /* slate-900 with 0.5 opacity */
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 300ms ease-in-out',
          zIndex: 9999
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel container */}
      <div 
        className="fixed inset-y-0 right-0 flex max-w-full pl-10"
        style={{ zIndex: 10000 }}
      >
        {/* Actual panel with slide animation */}
        <div 
          className="w-screen"
          style={{ 
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isOpen ? 1 : 0.7,
            maxWidth: '850px',
            width: '100%'
          }}
        >
          {/* Panel content with enhanced shadow */}
          <div 
            ref={panelRef} 
            className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-800 w-full"
            style={{ 
              boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.25)',
              maxWidth: '850px'
            }}
          >
            {/* Panel header - with title and close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Chat with SHAIPE</h2>
              <button
                type="button"
                className="rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onClick={onClose}
                style={{ cursor: 'pointer' }}
                aria-label="Close chat panel"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            {/* Panel body */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
