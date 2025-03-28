import ChatInterface from './ChatInterface';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Chat with SHAIPE | Book',
  description: 'Ask questions about the SHAIPE book and get answers based on its content'
};

export default function BookChatPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4" style={{ height: 'calc(100vh - 160px)' }}>
      <ChatInterface />
    </div>
  );
}
