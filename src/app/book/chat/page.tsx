import ChatInterface from './ChatInterface';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Chat with SHAIPE | Book',
  description: 'Ask questions about the SHAIPE book and get answers based on its content'
};

export default function BookChatPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link 
          href="/book" 
          className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Book
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
          Chat with SHAIPE
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Ask questions about the book "SHAIPE: A guide to creating superhuman AI-powered employees through AI Operations in the enterprise" and get answers based on its content.
        </p>
      </div>
      
      <ChatInterface />
      
      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          About this feature
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
          This chat interface uses AI to help you explore the concepts in the SHAIPE book. The AI has been trained on the book's content and can provide answers with direct references to specific chapters and sections.
        </p>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          For the most accurate information, you can always click on the source links to read the full content in context.
        </p>
      </div>
    </div>
  );
}
