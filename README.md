# Markdown + MongoDB Content Platform

A modern content platform that combines the simplicity of Markdown for content creation with the power of MongoDB for metadata management and dynamic features.

## 🏗️ Tech Stack

- **Frontend**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **Deployment**: Heroku
- **Markdown Parsing**: `gray-matter`, `remark`

## 📁 Content Structure

Markdown content lives in the `/content` directory and is organized by category:

```
/content
  /blog
    post-1.md
  /research
    paper.md
  /book
    chapter-1.md
```

Each markdown file includes frontmatter with metadata like title, slug, category, tags, and date.

## 🧾 MongoDB Usage

The platform uses MongoDB to store metadata about content, enabling powerful filtering, searching, and dynamic features while keeping the actual content in Markdown files for simplicity.

## 🔧 Features

- List content by category (e.g., `/blog`, `/research`, `/book`)
- View individual posts with full markdown rendering
- Tag system with tag-based filtering and discovery
- Search across all posts by title, tags, category, or date
- Responsive design that works on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB Atlas account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/bgadoci/personal-site2.git
   cd personal-site2
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your MongoDB connection string and other required variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## 🌐 Deployment to Heroku

### Setting up Heroku

1. Install the Heroku CLI if you haven't already
   ```bash
   brew install heroku/brew/heroku
   ```

2. Login to Heroku
   ```bash
   heroku login
   ```

3. Create a new Heroku app
   ```bash
   heroku create your-app-name
   ```

4. Add MongoDB Atlas connection string as a config var
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   ```

5. Add a Procfile to the root of your project with the following content:
   ```
   web: npm start
   ```

6. Ensure your package.json has the correct scripts:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start -p $PORT",
     "lint": "next lint"
   }
   ```

7. Deploy to Heroku
   ```bash
   git push heroku main
   ```

8. Open your deployed app
   ```bash
   heroku open
   ```

## 📝 Content Management

To add new content:

1. Create a new Markdown file in the appropriate directory under `/content`
2. Include proper frontmatter with required metadata
3. Write your content using Markdown
4. The application will automatically sync content metadata to MongoDB on startup

## 🎨 Design System

The application follows a consistent design system with:

- Primary color palette based on Emerald
- Responsive design principles
- Accessible UI components
- Consistent typography and spacing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
