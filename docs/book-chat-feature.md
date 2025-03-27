# Book Chat Feature Documentation

## Overview

The "Chat with SHAIPE" feature allows users to ask questions about the book content and receive AI-generated answers based on the actual content of the book. This implementation uses:

1. **Content Chunking**: Book chapters are split into smaller, semantically meaningful chunks
2. **Vector Embeddings**: Each chunk is converted to a vector embedding using OpenAI's embedding model
3. **Similarity Search**: User questions are matched to the most relevant content chunks
4. **Contextual Answers**: OpenAI's chat model generates answers based on the relevant chunks

## Setup Instructions

### 1. Environment Variables

Add your OpenAI API key to the `.env.local` file:

```
OPENAI_API_KEY=your_api_key_here
```

### 2. Generate Embeddings

Before the chat feature can work, you need to generate embeddings for the book content. This is a manual process to control API costs:

```bash
# Process all book chapters
node scripts/generate_book_embeddings.js

# Process a specific chapter only
node scripts/generate_book_embeddings.js --chapter=chapter01_why_ai_operations

# Test without storing embeddings
node scripts/generate_book_embeddings.js --dry-run
```

### 3. MongoDB Configuration

The embeddings are stored in a MongoDB collection called `book_embeddings`. The script will automatically create the necessary indexes, including a vector search index if your MongoDB instance supports it.

## How It Works

### Data Flow

1. User asks a question on the chat interface
2. The question is sent to the `/api/book-chat` endpoint
3. The API generates an embedding for the question
4. MongoDB finds the most similar content chunks
5. The API sends the question and relevant chunks to OpenAI
6. OpenAI generates an answer with citations
7. The answer and sources are displayed to the user

### Content Processing

Book content is processed in these steps:

1. Markdown files are read from the `/content/book/` directory
2. Content is parsed into sections based on markdown headers
3. Sections are split into smaller chunks (300-500 words)
4. Each chunk is processed to include metadata about its source
5. OpenAI generates vector embeddings for each chunk
6. Chunks and embeddings are stored in MongoDB

## Technical Details

### MongoDB Schema

```javascript
{
  "_id": ObjectId("..."),
  "chapter_slug": "chapter03_who_this_book_is_for",
  "chapter_number": 3,
  "chapter_title": "Chapter 3: Who This Book Is For",
  "section_title": "Enterprise Leaders",
  "section_number": "3.2",
  "position_in_chapter": 12,
  "content": "The actual text content of this chunk...",
  "token_count": 150,
  "embedding": [0.023, -0.045, ...], // Vector embedding
  "citation": {
    "display_text": "Chapter 3: Who This Book Is For, Section: Enterprise Leaders",
    "url_path": "/book/chapter03_who_this_book_is_for#enterprise-leaders"
  },
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

### API Response Format

```javascript
{
  "answer": "The AI-generated answer text with citations...",
  "sources": [
    {
      "text": "Excerpt from the source content...",
      "citation": "Chapter 3: Who This Book Is For, Section: Enterprise Leaders",
      "link": "/book/chapter03_who_this_book_is_for#enterprise-leaders"
    },
    // Additional sources...
  ]
}
```

## Maintenance

### When to Update Embeddings

Run the embedding generation script when:
- New book chapters are added
- Existing chapters are significantly modified
- You want to improve the quality of responses

### Monitoring Usage

The OpenAI API usage is not automatically tracked. Consider implementing a tracking system if you need to monitor costs.

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure OPENAI_API_KEY is set in .env.local
2. **MongoDB Connection**: Check that MongoDB is running and accessible
3. **Vector Search**: If MongoDB doesn't support vector search, the feature will fall back to basic retrieval

### Debugging

The embedding generation script and API include detailed logging. Check the console output for error messages and debugging information.
