---
title: "Building a Modern Content Platform in Two Nights with Windsurf and Claude"
slug: "building-markdown-mongo-platform"
category: "blog"
tags: ["AI", "Next.js", "MongoDB", "Windsurf", "Claude", "Content Management", "Development"]
date: "2025-03-29"
status: "published"
coverImage: "https://storage.googleapis.com/bgadoci-blog-images/blog-images/images/blog-images/blog-post-images/blocks.png"
excerpt: "How I leveraged Windsurf and Claude 3.7 Sonnet to build a complete content platform in just two nights of after-work coding, combining the simplicity of markdown files with the power of MongoDB."
---

The site you're reading this on didn't exist a few days ago. What would typically take weeks of development, I accomplished in just two nights of after-work coding sessions. This wasn't a result of superhuman coding abilities, but rather a partnership with AI through Windsurf and Claude 3.7 Sonnet that fundamentally transformed my development workflow.

I had a specific vision in mind: create a platform that would give me the simplicity of writing in markdown files while providing the dynamic features of a modern content management system. The traditional approach would involve weeks of planning, coding, debugging, and deployment. Instead, I completed the entire project in two evenings after my regular workday, a testament to how AI is reshaping what's possible for individual creators.

The core innovation of this platform lies in its hybrid approach to content management. Rather than forcing me to choose between the simplicity of static site generators and the power of database-driven applications, this system bridges both worlds. At its foundation, all content lives as markdown files in a simple directory structure organized by category: `/content/blog`, `/content/book`, and `/content/research`. This flat-file approach means I can create and edit content directly in Windsurf, leveraging Claude's capabilities for research, drafting, and editing without switching contexts.

What makes this approach particularly powerful is how these markdown files sync with MongoDB. When the application starts, it automatically processes all markdown files, extracts their frontmatter metadata (title, slug, tags, etc.), and synchronizes this information with MongoDB collections. This creates a best-of-both-worlds scenario: I get the simplicity and git-trackability of markdown files for writing, combined with the querying power, indexing, and dynamic features that MongoDB enables.

The technical architecture is built on Next.js 15 with the App Router, providing a modern React framework with excellent performance characteristics. Tailwind CSS handles styling, creating a clean, responsive design system that adapts to any device. The application is deployed on Heroku with a connection to MongoDB Atlas, making the entire stack cloud-based and scalable.

What's particularly interesting about the development process is how Windsurf transformed the experience. Rather than constantly switching between documentation, Stack Overflow, and my IDE, I maintained a continuous conversation with Claude while writing code. When I needed to implement the MongoDB integration, Claude helped research the best practices, generated the connection code, and even created the synchronization logic that keeps the database in sync with the markdown files.

The markdown processing pipeline itself demonstrates the sophistication possible in such a short development time. The system uses gray-matter to parse frontmatter, then processes the markdown content through a remark/rehype pipeline that handles GitHub-flavored markdown, code syntax highlighting, and custom styling. This creates beautifully formatted content without requiring me to write HTML or CSS for each post.

Beyond basic content display, the platform includes features you'd expect from mature content management systems: tag-based filtering, full-text search across all content, category organization, and even specialized features like the interactive book chat functionality I recently announced. The search functionality leverages MongoDB's text indexing capabilities, while still allowing all content to be authored in simple markdown files.

What would normally require multiple specialized systems has been consolidated into one cohesive platform. My book, which spans 19 chapters and over 47,000 words, now lives alongside my blog posts in a unified reading experience. The platform even supports specialized research content with its own unique presentation.

The deployment process was equally streamlined. Claude guided me through setting up Heroku, configuring the MongoDB Atlas connection, and establishing the proper environment variables. When I needed to migrate images to Google Cloud Storage for better performance, Claude wrote Python scripts to handle the migration and update all the markdown files with the new image URLs.

This project represents a fundamental shift in how we can approach development. The combination of flat-file markdown for content creation and MongoDB for dynamic features creates a system that's both simple to maintain and powerful in capabilities. More importantly, the AI-assisted development process compressed what would have been weeks of work into just two evenings.

For creators and developers, this approach opens new possibilities. You no longer need to choose between the simplicity of writing in markdown and the power of database-driven applications. You can have both, and with AI assistance, you can build such systems in a fraction of the time it would traditionally take.

As I continue to enhance this platform, I'm excited about the possibilities this hybrid approach enables. The foundation is now in place for adding more interactive features, deeper integrations, and richer content experiences—all while maintaining the simplicity of writing in markdown files and leveraging AI through Windsurf to accelerate development.

What once seemed like an ambitious project requiring weeks of dedicated work has become something I can build in two nights after work. That's the transformative power of AI-assisted development, and it's changing what's possible for individual creators.
