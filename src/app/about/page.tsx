import React from 'react';
import Link from 'next/link';

export const metadata = {
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

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8">About Me</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column with sticky image */}
        <div className="md:w-1/3 md:sticky md:top-8 md:self-start">
          <img 
            src="/images/website-images/avatar.png" 
            alt="Brandon Gadoci" 
            className="w-full rounded-lg shadow-md border-2 border-emerald-500 dark:border-emerald-400"
          />
          
          <div className="flex gap-4 mt-4 justify-center">
            <Link 
              href="https://www.linkedin.com/in/bgadoci/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              LinkedIn
            </Link>
            <Link 
              href="https://x.com/bgadoci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              X (Twitter)
            </Link>
          </div>
        </div>
        
        {/* Right column with all text content */}
        <div className="md:w-2/3">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Brandon Gadoci</h2>
            <p className="text-lg text-emerald-600 dark:text-slate-300 mb-4">
              VP of AI Operations at data.world | Author of "SHAIPE"
            </p>
            
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              I'm leading the charge in AI Operations (AI Ops), helping organizations seamlessly integrate AI into their core business functions. 
              My work focuses on breaking down barriers to AI adoption, enabling businesses to harness the full potential of AI-driven insights, 
              automation, and innovation.
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">Professional Life</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              As the first employee and current VP of AI Operations at data.world, I support the Office of the COO in key strategic 
              cross-functional AI initiatives. Areas of focus include app development, operational excellence, and innovation. 
              At data.world, we empower organizations to transform siloed, scattered data into actionable knowledge.
            </p>
            
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Beyond data, my passion is in AI literacy and cultural transformation. AI is more than a tool—it's a paradigm shift in how 
              businesses operate, requiring new mindsets, education, and processes. I work with leaders and teams to demystify AI, overcome 
              resistance, and create environments where AI becomes an augmentation force rather than a disruption.
            </p>
            
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              I've also written a book on AI Operations which explores how organizations can effectively integrate AI into their operations. 
              You can access it on this site under the <Link href="/book" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Book</Link> section.
            </p>
            
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-5 mb-2">Key areas of focus:</h4>
            <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 mb-4 space-y-1">
              <li>AI Literacy & Change Management: Helping enterprises prepare their workforce for AI adoption</li>
              <li>Human-Centric AI: Driving AI initiatives that enhance human potential rather than replace it</li>
              <li>Discovering AI Use Cases: Identifying and implementing high-impact AI applications</li>
              <li>Scaling AI Operations: Moving organizations from experimentation to enterprise-wide AI integration</li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">Personal Life</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              I've been happily married for 23 years and am a proud parent of two teenagers. When I'm not working on AI initiatives, 
              I enjoy staying active through fitness, cooking delicious meals, appreciating good red wine, and spending time outdoors 
              when the weather permits.
            </p>
            
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              I'm a graduate of The University of Texas at Austin where I studied Advertising and Media. I also spent a year at the 
              Savannah College of Art and Design studying graphic design and playing NCAA Division III Soccer.
            </p>
            
            <p className="text-slate-700 dark:text-slate-300">
              I've become very excited about AI and spend most of my time using it and leveraging it. I believe it's a key to leveling 
              up in whatever you want to do. I'm always looking to connect with others navigating the AI revolution to build the future 
              of AI-powered business together!
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">Experience</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50">Vice President of AI Operations</h4>
                <p className="text-slate-600 dark:text-slate-400">data.world • Sep 2022 - Present</p>
                <p className="text-slate-700 dark:text-slate-300 mt-1">
                  Supporting the Office of the COO in key strategic cross-functional AI initiatives.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50">Vice President of Demand Generation</h4>
                <p className="text-slate-600 dark:text-slate-400">data.world • May 2022 - Sep 2023</p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50">Director of Sales Development & Operations</h4>
                <p className="text-slate-600 dark:text-slate-400">data.world • Dec 2015 - May 2022</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">Education</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-medium text-slate-900 dark:text-slate-50">The University of Texas at Austin</h4>
                <p className="text-slate-600 dark:text-slate-400">Advertising, Media • 1996 - 2000</p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-slate-900 dark:text-slate-50">Savannah College of Art and Design</h4>
                <p className="text-slate-600 dark:text-slate-400">Graphic Design • 1996 - 1997</p>
                <p className="text-slate-700 dark:text-slate-300 mt-1">Activities: NCAA Division III Soccer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
