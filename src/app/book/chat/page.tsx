import ChatInterface from './ChatInterface';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Chat with SHAIPE | Book',
  description: 'Ask questions about the SHAIPE book and get answers based on its content'
};

export default function BookChatPage() {
  return (
    <div className="container mx-auto px-0 md:px-4 py-4" >
      <ChatInterface />
    </div>
  );
}
