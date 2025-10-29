# RAG Endpoint Documentation 🤖

## Overview

The `/api/rag` endpoint uses **RAG (Retrieval Augmented Generation)** to answer questions about Reddit sentiment data. It combines:

1. **Reddit data** - Scraped posts about your topic
2. **Sentiment analysis** - Analyzed with RoBERTa model  
3. **Google Gemini AI** - Generates answers based on the data

## Model Used

**Google Gemini 1.5 Flash** - The best free model available:
- ✅ **Free tier**: 15 requests per minute
- ✅ **Fast**: Optimized for speed
- ✅ **Powerful**: Latest Gemini technology
- ✅ **1M token context**: Can handle lots of data

## Setup

### 1. Get Your Free Gemini API Key

Visit: https://makersuite.google.com/app/apikey

1. Sign in with your Google account
2. Click "Get API Key"
3. Copy your API key

### 2. Configure the API

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the Server

```bash
uvicorn main:app --reload
```

## API Endpoint

```
POST http://localhost:8000/api/rag
```

### Request

```json
{
  "query": "iPhone 17",
  "question": "What are people saying about the camera quality?",
  "limit": 100,
  "time_window_hours": 48,
  "include_context": true
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Topic to search on Reddit |
| `question` | string | Yes | - | Question to ask about the data |
| `limit` | integer | No | 100 | Number of posts to fetch (10-500) |
| `time_window_hours` | integer | No | 48 | Time window in hours (1-168) |
| `include_context` | boolean | No | true | Include source posts in response |

### Response

```json
{
  "query": "iPhone 17",
  "question": "What are people saying about the camera quality?",
  "answer": "Based on recent Reddit discussions, users are expressing mixed but generally positive sentiment about the iPhone 17's camera. The most discussed features include the improved low-light performance and enhanced zoom capabilities. Several highly-upvoted posts mention the 'incredible night mode' and 'professional-quality photos'. However, some users note concerns about the price increase not being justified by the camera improvements alone...",
  "confidence": "high",
  "total_posts_analyzed": 248,
  "sentiment_summary": {
    "positive": 120,
    "negative": 85,
    "neutral": 43
  },
  "time_range": "2025-10-28 05:02 to 2025-10-28 20:32",
  "source_posts": [
    {
      "title": "iPhone 17 Pro Max camera is insane!",
      "url": "https://reddit.com/r/iphone/...",
      "sentiment": "positive",
      "score": 1234,
      "created_utc": "2025-10-28T14:30:00"
    }
  ],
  "model_used": "gemini-1.5-flash"
}
```

## Example Usage

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What are the main complaints people have?",
    "limit": 200
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/rag",
    json={
        "query": "Tesla Model 3",
        "question": "What do people think about the build quality?",
        "limit": 150,
        "time_window_hours": 72
    }
)

data = response.json()
print(f"Question: {data['question']}")
print(f"Answer: {data['answer']}")
print(f"\nAnalyzed {data['total_posts_analyzed']} posts")
print(f"Sentiment: +{data['sentiment_summary']['positive']} "
      f"-{data['sentiment_summary']['negative']} "
      f"~{data['sentiment_summary']['neutral']}")
```

### Using JavaScript (Fetch)

```javascript
const askQuestion = async (query, question) => {
  const response = await fetch('http://localhost:8000/api/rag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      question: question,
      limit: 100,
      time_window_hours: 48
    })
  });

  const data = await response.json();
  return data;
};

// Usage
const result = await askQuestion(
  'PlayStation 6',
  'What features are people most excited about?'
);

console.log(result.answer);
```

## React Component Example

```jsx
import React, { useState } from 'react';

const RAGQueryComponent = () => {
  const [query, setQuery] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          question,
          limit: 150,
          time_window_hours: 48
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rag-container">
      <h2>Ask About Reddit Sentiment</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Topic to analyze:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., iPhone 17"
            required
          />
        </div>

        <div>
          <label>Your question:</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What are the main complaints?"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Ask AI'}
        </button>
      </form>

      {result && (
        <div className="result">
          <h3>Answer:</h3>
          <p>{result.answer}</p>

          <div className="metadata">
            <p>
              <strong>Confidence:</strong> {result.confidence} | 
              <strong> Posts Analyzed:</strong> {result.total_posts_analyzed} |
              <strong> Model:</strong> {result.model_used}
            </p>
            <p>
              <strong>Sentiment:</strong> {' '}
              <span className="positive">+{result.sentiment_summary.positive}</span>{' '}
              <span className="negative">-{result.sentiment_summary.negative}</span>{' '}
              <span className="neutral">~{result.sentiment_summary.neutral}</span>
            </p>
          </div>

          {result.source_posts && (
            <details>
              <summary>Source Posts ({result.source_posts.length})</summary>
              <ul>
                {result.source_posts.map((post, idx) => (
                  <li key={idx}>
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      {post.title}
                    </a>
                    <span className={`sentiment ${post.sentiment}`}>
                      {post.sentiment}
                    </span>
                    <span className="score">↑ {post.score}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default RAGQueryComponent;
```

## Example Questions

### Product Analysis

```json
{
  "query": "iPhone 17",
  "question": "What are the top complaints about the iPhone 17?"
}
```

```json
{
  "query": "Tesla Cybertruck",
  "question": "How do people feel about the design?"
}
```

### Feature Comparison

```json
{
  "query": "PS5 vs Xbox Series X",
  "question": "Which console do Reddit users prefer and why?"
}
```

### Trend Analysis

```json
{
  "query": "AI regulation",
  "question": "What are the main concerns people have about AI regulation?"
}
```

### Event Analysis

```json
{
  "query": "World Cup 2026",
  "question": "Which teams are people most excited about?"
}
```

## How It Works

### 1. Data Retrieval
```
Fetch Reddit posts about {query}
Filter by time window
Analyze sentiment with RoBERTa
```

### 2. Context Preparation
```
Select top posts by:
- 10 positive (highest scored)
- 10 negative (highest scored)
- 5 neutral (highest scored)

Build context with:
- Total posts count
- Sentiment breakdown
- Post titles and content
```

### 3. AI Generation
```
Send to Gemini 1.5 Flash:
- Context about Reddit data
- User's question
- Instructions for answer format

Receive:
- Concise answer
- Evidence-based response
- Sentiment pattern insights
```

### 4. Response Formatting
```
Return structured JSON with:
- Generated answer
- Confidence level
- Source posts
- Sentiment summary
```

## Confidence Levels

The API returns a confidence level based on data quantity:

- **high**: 20+ sample posts analyzed
- **medium**: 10-19 sample posts analyzed
- **low**: < 10 sample posts analyzed

## Best Practices

### 1. Ask Specific Questions

❌ **Bad:** "Tell me about iPhone 17"
✅ **Good:** "What do people think about the iPhone 17's battery life?"

### 2. Use Appropriate Time Windows

- **Breaking news**: 24-48 hours
- **Product launch**: 48-72 hours
- **General topics**: 72-168 hours

### 3. Adjust Limit Based on Topic

- **Popular topics**: 100-200 posts
- **Niche topics**: 50-100 posts
- **Very specific**: 25-50 posts

### 4. Handle Source Posts

Always check `include_context: true` to see which posts influenced the answer.

## Error Handling

### API Key Not Configured

```json
{
  "detail": "Gemini API not configured. Please set GEMINI_API_KEY in .env file..."
}
```

**Solution:** Add your API key to `.env`

### No Posts Found

```json
{
  "detail": "No posts found for the given query"
}
```

**Solution:** Try a different query or longer time window

### Gemini API Error

```json
{
  "detail": "Error generating response from Gemini: ..."
}
```

**Solution:** Check your API key, rate limits, or try again

## Rate Limits

**Gemini 1.5 Flash Free Tier:**
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

For higher limits, upgrade at: https://ai.google.dev/pricing

## Comparison with Other Endpoints

| Feature | `/api/analyze` | `/api/charts` | `/api/rag` |
|---------|----------------|---------------|------------|
| Purpose | Full analysis | Visualization | Q&A |
| Returns | All posts | Chart data | AI answer |
| AI-powered | ❌ | ❌ | ✅ |
| Interactive | ❌ | ❌ | ✅ |
| Best for | Data export | Dashboards | Insights |

## Testing

```bash
# Test the endpoint
python test_api.py

# Or manually test
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python programming",
    "question": "What are people saying about Python 3.12?"
  }'
```

## Interactive Documentation

Visit http://localhost:8000/docs to:
- Try the endpoint in your browser
- See the full API schema
- Generate code snippets

## Security Notes

1. **Never commit your API key** to version control
2. Use environment variables (`.env`)
3. Add `.env` to `.gitignore`
4. In production, use secure secrets management

## Troubleshooting

### Check if Gemini is configured

```bash
curl http://localhost:8000/
```

Look for `"gemini_configured": true` in the response.

### Test API key

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content("Hello!")
print(response.text)
```

## Advanced Usage

### Custom Prompts

The prompt sent to Gemini includes:
- Reddit data context
- Your question
- Instructions for formatting

You can modify the prompt in `main.py` for specialized use cases.

### Caching Responses

For frequently asked questions, consider caching RAG responses:

```python
import hashlib
import json

def cache_key(query, question):
    return hashlib.md5(f"{query}:{question}".encode()).hexdigest()

# Implement your caching logic
```

## Support

- **API Documentation**: http://localhost:8000/docs
- **Gemini Documentation**: https://ai.google.dev/docs
- **Get API Key**: https://makersuite.google.com/app/apikey

---

**Ready to ask questions about Reddit sentiment!** 🚀🤖

