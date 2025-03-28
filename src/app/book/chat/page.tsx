import ChatInterface from './ChatInterface';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Chat with SHAIPE | Book',
  description: 'Ask questions about the SHAIPE book and get answers based on its content'
};

export default function BookChatPage() {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-4" style={{ 
      maxWidth: '768px', // Explicit pixel width instead of Tailwind class
      height: 'calc(100vh - 160px)',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <ChatInterface />
    </div>
  );
}
