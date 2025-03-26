'use client';

import Link from 'next/link';

type TagLinkProps = {
  tag: string;
  isActive: boolean;
  className?: string;
};

export default function TagLink({ tag, isActive, className = '' }: TagLinkProps) {
  return (
    <Link 
      href={`/tags/${tag.toLowerCase()}`}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {tag}
    </Link>
  );
}
