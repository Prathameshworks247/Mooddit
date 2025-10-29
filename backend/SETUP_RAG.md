# RAG Endpoint Setup Guide 🚀

## Quick Summary

I've added a **RAG (Retrieval Augmented Generation) endpoint** to your FastAPI backend that uses **Google Gemini 1.5 Flash** (free!) to answer questions about Reddit sentiment data.

## What's New

### 🆕 New Endpoint: `/api/rag`

Ask questions about Reddit sentiment data and get AI-powered answers!

**Example Request:**
```json
{
  "query": "iPhone 17",
  "question": "What are people saying about the battery life?"
}
```

**Example Response:**
```json
{
  "answer": "Based on 248 Reddit posts, users have mixed opinions...",
  "confidence": "high",
  "total_posts_analyzed": 248,
  "sentiment_summary": {
    "positive": 120,
    "negative": 85,
    "neutral": 43
  }
}
```

## Setup Steps

### 1. Install New Dependencies

```bash
cd backend
pip install google-generativeai==0.3.2 python-dotenv==1.0.0
```

Or update all:
```bash
pip install -r requirements.txt
```

### 2. Get Free Gemini API Key

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with Google
3. Click "Get API Key"
4. Copy your key

### 3. Create .env File

```bash
# Create .env in backend folder
cat > .env << 'EOF'
GEMINI_API_KEY=paste_your_key_here
EOF
```

Replace `paste_your_key_here` with your actual key.

### 4. Test It

```bash
# Start server
uvicorn main:app --reload

# In another terminal, test:
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python programming",
    "question": "What are the main topics people discuss?"
  }'
```

## Files Modified/Added

### Modified:
- ✅ `main.py` - Added RAG endpoint with Gemini integration
- ✅ `requirements.txt` - Added google-generativeai and python-dotenv
- ✅ `test_api.py` - Added RAG endpoint testing

### Added:
- ✅ `RAG_ENDPOINT.md` - Complete documentation
- ✅ `.env.example` - Environment template
- ✅ `SETUP_RAG.md` - This file

## Quick Test

```bash
python test_api.py
```

This will test all endpoints including the new RAG endpoint.

## Example Usage

### cURL
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tesla Model 3",
    "question": "What do people think about build quality?"
  }'
```

### Python
```python
import requests

response = requests.post(
    "http://localhost:8000/api/rag",
    json={
        "query": "iPhone 17",
        "question": "What are the main complaints?",
        "limit": 150
    }
)

data = response.json()
print(data['answer'])
```

### JavaScript/React
```javascript
const response = await fetch('http://localhost:8000/api/rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'PlayStation 6',
    question: 'What features are people excited about?'
  })
});

const data = await response.json();
console.log(data.answer);
```

## Features

✅ **Uses scraped Reddit data** - Same scraper you already have  
✅ **Sentiment analysis** - RoBERTa model analyzes sentiment  
✅ **Gemini 1.5 Flash** - Latest free AI model from Google  
✅ **Contextual answers** - Based on actual Reddit posts  
✅ **Source attribution** - Shows which posts influenced the answer  
✅ **Confidence scoring** - High/medium/low based on data quantity  

## API Limits (Free Tier)

- **15 requests/minute**
- **1,500 requests/day**
- **1M tokens/minute**

More than enough for development and moderate use!

## Troubleshooting

### "Gemini API not configured"

**Solution:** Add your API key to `.env`:
```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

### "Import google.generativeai could not be resolved"

**Solution:** Install the package:
```bash
pip install google-generativeai
```

### No answer or timeout

**Solution:** Reduce the limit or try a different query:
```json
{
  "query": "your topic",
  "limit": 50
}
```

## Full Documentation

See **`RAG_ENDPOINT.md`** for:
- Complete API reference
- React component examples
- Advanced usage patterns
- Best practices

## Interactive Docs

Visit: **http://localhost:8000/docs**

You'll see the new `/api/rag` endpoint with:
- Try it out feature
- Full schema
- Example requests/responses

## Next Steps

1. **Get API key** from https://makersuite.google.com/app/apikey
2. **Add to .env** file
3. **Restart server**: `uvicorn main:app --reload`
4. **Test it**: `python test_api.py`
5. **Use it** in your frontend!

---

**You now have AI-powered Q&A about Reddit sentiment!** 🎉🤖

