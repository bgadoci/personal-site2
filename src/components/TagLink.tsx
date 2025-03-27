'use client';

import SafariSafeLink from './SafariSafeLink';

type TagLinkProps = {
  tag: string;
  isActive: boolean;
  className?: string;
};

export default function TagLink({ tag, isActive, className = '' }: TagLinkProps) {
  return (
    <SafariSafeLink 
      href={`/tags/${tag.toLowerCase()}`}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {tag}
    </SafariSafeLink>
  );
}
