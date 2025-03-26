'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminModeToggle({ initialAdminMode = false }: { initialAdminMode?: boolean }) {
  const [isAdminMode, setIsAdminMode] = useState(initialAdminMode);
  const router = useRouter();

  // Toggle admin mode and store in localStorage
  const toggleAdminMode = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    localStorage.setItem('adminMode', newMode ? 'true' : 'false');
    
    // Refresh the page to apply the changes
    router.refresh();
  };

  // Initialize from localStorage on client side
  useEffect(() => {
    const storedMode = localStorage.getItem('adminMode');
    if (storedMode !== null) {
      setIsAdminMode(storedMode === 'true');
    }
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md">
      <span className="text-sm text-slate-700 dark:text-slate-300">Admin Mode:</span>
      <button
        onClick={toggleAdminMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          isAdminMode ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
        role="switch"
        aria-checked={isAdminMode}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAdminMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {isAdminMode ? 'Showing all content (including drafts)' : 'Showing published content only'}
      </span>
    </div>
  );
}
