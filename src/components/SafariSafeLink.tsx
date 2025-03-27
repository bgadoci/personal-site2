'use client';

import { useState, useEffect, MouseEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface SafariSafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function SafariSafeLink({ 
  href, 
  children, 
  className = '', 
  onClick 
}: SafariSafeLinkProps) {
  const router = useRouter();
  const [lastNavigationTime, setLastNavigationTime] = useState(0);
  
  // Reset navigation time on component mount
  useEffect(() => {
    setLastNavigationTime(0);
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Execute any onClick handler passed to the component
    if (onClick) {
      onClick(e);
    }
    
    const now = Date.now();
    
    // Prevent navigation if it's been less than 500ms since the last navigation
    // This helps with the iOS Safari back gesture issue
    if (now - lastNavigationTime < 500) {
      return;
    }
    
    setLastNavigationTime(now);
    
    // Add a small delay before navigation to help iOS Safari
    setTimeout(() => {
      router.push(href);
    }, 50);
  };

  return (
    <a 
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
