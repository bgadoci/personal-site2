import React from 'react';
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
        <span className="hidden sm:inline" style={{ marginLeft: '2px' }}>{text}</span>
      )}
    </button>
  );
};

export default ChatButton;
