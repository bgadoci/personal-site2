import ChatInterface from './ChatInterface';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Chat with SHAIPE | Book',
  description: 'Ask questions about the SHAIPE book and get answers based on its content'
};

export default function BookChatPage() {
  return (
    <div className="container mx-auto px-4 py-4 max-w-3xl" style={{ 
      height: 'calc(100vh - 160px)',
      maxWidth: '48rem'
    }}>
      <ChatInterface />
    </div>
  );
}
