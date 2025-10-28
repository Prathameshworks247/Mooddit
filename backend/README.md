# Reddit Sentiment Analysis API

A FastAPI-based backend service for analyzing sentiment of Reddit posts using transformer models.

## Features

- 🔍 Fetch Reddit posts based on search queries
- 🧠 AI-powered sentiment analysis using RoBERTa model
- 📊 Time-series sentiment data with configurable intervals
- 📁 CSV export of analysis results
- 🌐 RESTful API with JSON responses
- ⚡ Fast and async processing with FastAPI

## Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the API

### Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:
```bash
python main.py
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Interactive API docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative API docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### GET `/`
Root endpoint with API information.

**Response:**
```json
{
  "message": "Reddit Sentiment Analysis API",
  "version": "1.0.0",
  "endpoints": {
    "analyze": "/api/analyze (POST) - Full sentiment analysis with posts",
    "charts": "/api/charts (POST) - Chart data optimized for Recharts",
    "health": "/health (GET) - Health check"
  }
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T12:00:00.000000"
}
```

### POST `/api/analyze`
Analyze sentiment of Reddit posts for a given query (full analysis with post details).

**Request Body:**
```json
{
  "query": "iPhone 17",
  "limit": 300,
  "time_window_hours": 48,
  "interval_hours": 3
}
```

**Parameters:**
- `query` (required): Topic to search for on Reddit
- `limit` (optional): Number of posts to fetch (10-1000, default: 300)
- `time_window_hours` (optional): Time window in hours (1-168, default: 48)
- `interval_hours` (optional): Grouping interval for time series (1-24, default: 3)

**Response:**
```json
{
  "query": "iPhone 17",
  "total_posts": 300,
  "posts_in_timeframe": 245,
  "sentiment_summary": {
    "positive": 120,
    "negative": 85,
    "neutral": 40
  },
  "time_series": [
    {
      "timestamp": "2025-10-26T12:00:00",
      "sentiment_value": 1
    },
    {
      "timestamp": "2025-10-26T15:00:00",
      "sentiment_value": -1
    }
  ],
  "posts": [
    {
      "title": "iPhone 17 leaked specs!",
      "url": "https://reddit.com/...",
      "selftext": "Here are the specs...",
      "created_utc": "2025-10-26T14:30:00",
      "score": 523,
      "subreddit": "apple",
      "sentiment_label": "positive",
      "sentiment_score": 1
    }
  ],
  "csv_path": "data/processed/reddit_iPhone_17_48h.csv"
}
```

**Sentiment Values:**
- `1`: Positive sentiment
- `0`: Neutral sentiment / No data
- `-1`: Negative sentiment

### POST `/api/charts`
Get chart data optimized for Recharts visualization.

**Request Body:**
```json
{
  "query": "iPhone 17",
  "limit": 300,
  "time_window_hours": 48,
  "interval_hours": 3
}
```

**Parameters:** Same as `/api/analyze`

**Response:**
```json
{
  "query": "iPhone 17",
  "total_posts": 245,
  "time_window_hours": 48,
  "sentiment_distribution": [
    {
      "name": "Positive",
      "value": 120,
      "percentage": 48.98
    },
    {
      "name": "Negative",
      "value": 85,
      "percentage": 34.69
    },
    {
      "name": "Neutral",
      "value": 40,
      "percentage": 16.33
    }
  ],
  "sentiment_over_time": [
    {
      "timestamp": "2025-10-26T12:00:00",
      "date": "2025-10-26",
      "time": "12:00",
      "average_sentiment": 0.245,
      "positive_count": 15,
      "negative_count": 8,
      "neutral_count": 3,
      "total_posts": 26
    }
  ],
  "posts_over_time": [
    {
      "timestamp": "2025-10-26T12:00:00",
      "date": "2025-10-26",
      "time": "12:00",
      "posts": 26
    }
  ],
  "sentiment_posts_over_time": [
    {
      "timestamp": "2025-10-26T12:00:00",
      "date": "2025-10-26",
      "time": "12:00",
      "positive": 15,
      "negative": 8,
      "neutral": 3
    }
  ]
}
```

**Chart Datasets:**
1. **sentiment_distribution** - Total positive/negative/neutral counts (Pie/Bar Chart)
2. **sentiment_over_time** - Average sentiment shift over time (Line Chart)
3. **posts_over_time** - Total post volume over time (Area/Bar Chart)
4. **sentiment_posts_over_time** - Positive/negative posts over time (Stacked Area Chart)

For detailed chart documentation and Recharts examples, see [CHARTS_API.md](CHARTS_API.md).

## Example Usage

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "FIFA World Cup 2026",
    "limit": 500,
    "time_window_hours": 72,
    "interval_hours": 6
  }'
```

### Using Python

```python
import requests

url = "http://localhost:8000/api/analyze"
payload = {
    "query": "iPhone 17",
    "limit": 300,
    "time_window_hours": 48,
    "interval_hours": 3
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Total posts: {data['total_posts']}")
print(f"Sentiment: +{data['sentiment_summary']['positive']} "
      f"-{data['sentiment_summary']['negative']} "
      f"~{data['sentiment_summary']['neutral']}")
```

### Using JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:8000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Cristiano Ronaldo',
    limit: 300,
    time_window_hours: 48,
    interval_hours: 3
  })
});

const data = await response.json();
console.log(data);
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── src/
│   ├── __init__.py
│   ├── reddit_scraper.py  # Reddit API scraper
│   ├── sentiment_analysis.py  # Sentiment analysis model
│   └── utils.py           # Utility functions
└── data/
    ├── processed/         # Analyzed data (CSV exports)
    └── raw/              # Raw scraped data
```

## Technologies Used

- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation using Python type hints
- **Pandas**: Data manipulation and analysis
- **Transformers**: Hugging Face transformer models
- **RoBERTa**: State-of-the-art sentiment analysis model
- **Uvicorn**: Lightning-fast ASGI server

## CORS Configuration

The API is configured to accept requests from any origin (`allow_origins=["*"]`). For production use, update this to specify your frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourfrontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK`: Successful request
- `404 Not Found`: No posts found for the query
- `422 Unprocessable Entity`: Invalid request parameters
- `500 Internal Server Error`: Server-side error

## Performance Notes

- First request may be slower as the sentiment analysis model loads
- Model is cached in memory after first use
- Processing time depends on the number of posts and complexity
- Consider using background tasks for large queries (>1000 posts)

## License

MIT License

