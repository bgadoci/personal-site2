import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Brandon Gadoci | VP of AI Operations',
  description: 'Learn more about Brandon Gadoci, VP of AI Operations at data.world, author, and AI enthusiast.',
  openGraph: {
    type: 'profile',
    locale: 'en_US',
    url: 'https://brandongadoci.com/about',
    title: 'About Brandon Gadoci | VP of AI Operations',
    description: 'Learn more about Brandon Gadoci, VP of AI Operations at data.world, author, and AI enthusiast.',
    siteName: 'Brandon Gadoci',
    images: [
      {
        url: 'https://brandongadoci.com/images/website-images/avatar.png',
        width: 1200,
        height: 630,
        alt: 'Brandon Gadoci',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Brandon Gadoci | VP of AI Operations',
    description: 'Learn more about Brandon Gadoci, VP of AI Operations at data.world, author, and AI enthusiast.',
    creator: '@bgadoci',
    images: ['https://brandongadoci.com/images/website-images/avatar.png'],
  },
};
