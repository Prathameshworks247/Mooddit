# Quick Start Guide

Get the Reddit Sentiment Analysis API up and running in 5 minutes!

## Prerequisites

- Python 3.12+ installed
- pip package manager
- 2-3 GB of free disk space (for model downloads)

## Installation Steps

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

This may take a few minutes as it downloads PyTorch and transformer models (~2GB).

### 5. Start the Server

**Option A: Using the startup script (macOS/Linux only)**
```bash
./start.sh
```

**Option B: Using uvicorn directly**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Option C: Using Python**
```bash
python main.py
```

### 6. Verify Installation

Open your browser and visit:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## First API Call

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"query": "Python", "limit": 100}'
```

### Using the Test Script

```bash
python test_api.py
```

### Using Browser (Swagger UI)

1. Go to http://localhost:8000/docs
2. Click on `POST /api/analyze`
3. Click "Try it out"
4. Enter your query in the request body:
   ```json
   {
     "query": "Python programming"
   }
   ```
5. Click "Execute"

## Docker Deployment (Alternative)

If you prefer Docker:

### Build and Run

```bash
docker-compose up --build
```

The API will be available at http://localhost:8000

### Stop the Container

```bash
docker-compose down
```

## Troubleshooting

### Port Already in Use

If port 8000 is already taken, use a different port:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### Module Not Found Errors

Make sure you're in the virtual environment:

```bash
which python  # Should show path to venv/bin/python
```

If not, activate the virtual environment again.

### Model Download Fails

The first run downloads the sentiment analysis model. If it fails:

1. Check your internet connection
2. Manually download the model:
   ```python
   from transformers import AutoTokenizer, AutoModelForSequenceClassification
   AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
   AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
   ```

### No Posts Found

If your query returns no posts:
- Try a more popular topic
- Increase the time window
- Check Reddit's availability

## Next Steps

- Read the [Full Documentation](README.md)
- Check the [API Examples](api_client_example.js)
- Test different queries and parameters
- Integrate with your frontend application

## API Quick Reference

### Analyze Endpoint

**URL:** `POST /api/analyze`

**Request Body:**
```json
{
  "query": "string",           // Required: Topic to search
  "limit": 300,                // Optional: Posts to fetch (10-1000)
  "time_window_hours": 48,     // Optional: Time window (1-168)
  "interval_hours": 3          // Optional: Grouping interval (1-24)
}
```

**Response:**
```json
{
  "query": "string",
  "total_posts": 0,
  "posts_in_timeframe": 0,
  "sentiment_summary": {
    "positive": 0,
    "negative": 0,
    "neutral": 0
  },
  "time_series": [...],
  "posts": [...],
  "csv_path": "string"
}
```

## Performance Tips

1. **First Request is Slow:** The model loads on first use (~10-20 seconds)
2. **Subsequent Requests:** Much faster (~2-5 seconds for 300 posts)
3. **Large Queries:** Use smaller limits or increase timeout
4. **Production:** Use `--workers 4` for better performance

## Support

- Check the [README](README.md) for detailed documentation
- Review [API Examples](api_client_example.js) for integration
- Test with [test_api.py](test_api.py) for debugging

Happy analyzing! 🎉

