import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

interface ChatButtonProps {
  onClick: () => void;
  showText?: boolean;
  text?: string;
  className?: string;
}

/**
 * ChatButton component with explicit styling to match production environment
 * This ensures consistent appearance across all environments
 */
const ChatButton: React.FC<ChatButtonProps> = ({ 
  onClick, 
  showText = true, 
  text = "Chat", 
  className = "" 
}) => {
  // State to track if we should show the text based on screen width
  const [isWideScreen, setIsWideScreen] = useState(false);
  
  // Effect to handle window resize
  useEffect(() => {
    // Function to check window width and update state
    const checkScreenWidth = () => {
      setIsWideScreen(window.innerWidth >= 640);
    };
    
    // Check width on initial render
    checkScreenWidth();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenWidth);
    
    // Clean up event listener on component unmount
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);
  // Create the base button style that will be consistent across environments
  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#10b981', // emerald-500
    color: 'white',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px', // Specifically matching production
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 150ms ease-in-out'
  };

  // Hover state will be handled with JavaScript instead of CSS classes
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#059669'; // emerald-600
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#10b981'; // emerald-500
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Chat with SHAIPE"
    >
      <ChatBubbleLeftRightIcon style={{ width: '16px', height: '16px' }} />
      {showText && (
        <span style={{
          marginLeft: '2px',
          display: isWideScreen ? 'inline' : 'none'
        }}>{text}</span>
      )}
    </button>
  );
};

export default ChatButton;
