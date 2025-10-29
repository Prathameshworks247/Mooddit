# Reddit Sentiment Analysis API

A FastAPI-based backend service for analyzing sentiment of Reddit posts using transformer models.

## Features

- 🔍 Fetch Reddit posts based on search queries
- 🧠 AI-powered sentiment analysis using RoBERTa model
- 📊 Time-series sentiment data with configurable intervals
- 📁 CSV export of analysis results
- 🌐 RESTful API with JSON responses
- ⚡ Fast and async processing with FastAPI
- 🤖 **NEW**: RAG (Retrieval Augmented Generation) endpoint with Google Gemini
- 🔧 **NEW**: Component-wise sentiment analysis (e.g., camera, battery, price)
- 💬 **NEW**: Conversation context for multi-turn Q&A
- 🔥 **NEW**: Automatic trending topics discovery and analysis
- 🔮 **NEW**: Sentiment prediction with time-series forecasting

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

## RAG Endpoint & Conversation Context 🤖💬

The API now includes an intelligent Q&A endpoint powered by Google Gemini that can:
- Answer questions about Reddit sentiment data
- Perform component-wise analysis (e.g., "camera", "battery" for phones)
- Maintain conversation context for follow-up questions

### Quick Start

**1. Set up your Gemini API key:**
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**2. Ask a question:**
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What do people think about the iPhone 17?"
  }'
```

**3. Ask a follow-up (with context):**
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What about the camera?",
    "conversation_history": [
      {
        "question": "What do people think about the iPhone 17?",
        "answer": "...",
        "components": ["camera", "battery", "price"]
      }
    ]
  }'
```

The AI understands "What about" refers to iPhone 17! 🎯

### Features
- ✅ Multi-turn conversations
- ✅ Pronoun resolution ("it", "that", "this")
- ✅ Component-wise sentiment breakdown
- ✅ Confidence scoring
- ✅ Source post citations

### Documentation
- **Quick Start**: [`QUICK_START_CONVERSATION.md`](./QUICK_START_CONVERSATION.md)
- **Full Guide**: [`CONVERSATION_CONTEXT.md`](./CONVERSATION_CONTEXT.md)
- **Component Analysis**: [`COMPONENT_ANALYSIS.md`](./COMPONENT_ANALYSIS.md)
- **RAG Endpoint**: [`RAG_ENDPOINT.md`](./RAG_ENDPOINT.md)

### Test It
```bash
python test_conversation.py
```

## Trending Topics Discovery 🔥

Automatically discover and analyze what's trending on Reddit right now!

### Quick Start

```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "time_window_hours": 24,
    "top_n": 10,
    "category": "all",
    "analyze_components": true
  }'
```

### What It Does

1. **Discovers** trending posts from Reddit (r/popular or specific categories)
2. **Extracts** trending topics using NLP and pattern matching
3. **Analyzes** sentiment for each topic
4. **Breaks down** component-wise sentiment (camera, price, etc.)
5. **Ranks** topics by trending momentum

### Categories Available

- `all` - All of Reddit (r/popular)
- `technology` - Tech news and gadgets
- `gaming` - Gaming news and releases
- `news` - World and local news
- `entertainment` - Movies, TV, music
- `sports` - Sports events and teams
- `science` - Science and space

### Example Response

```json
{
  "trending_topics": [
    {
      "topic_info": {
        "topic": "iPhone 17",
        "rank": 1,
        "post_count": 45,
        "trending_strength": 100.0,
        "subreddits": ["apple", "technology", "gadgets"]
      },
      "sentiment_analysis": {
        "positive": 120,
        "negative": 35,
        "neutral": 180
      },
      "component_analysis": [
        {
          "component": "camera",
          "sentiment": "positive",
          "summary": "Users praise the improved camera system"
        }
      ]
    }
  ]
}
```

### Features

- ✅ Real-time trending discovery
- ✅ Multi-category support
- ✅ Velocity-based ranking (trending momentum)
- ✅ Component-wise analysis
- ✅ Sentiment trends over time
- ✅ Cross-subreddit topic tracking

### Documentation & Testing

- **Full Guide**: [`TRENDING_TOPICS.md`](./TRENDING_TOPICS.md)
- **Test Script**: `python test_trending.py`

## Sentiment Prediction 🔮

Predict future sentiment trends using time-series analysis and machine learning!

### Quick Start

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "time_window_hours": 48,
    "hours_ahead": 12,
    "interval_hours": 3,
    "method": "hybrid"
  }'
```

### What It Does

1. **Analyzes** historical sentiment patterns from Reddit posts
2. **Identifies** trends in sentiment over time
3. **Predicts** how sentiment will likely change in the next few hours
4. **Calculates** confidence levels for each prediction

### Prediction Methods

- **`linear`**: Linear regression on historical trends
- **`moving_average`**: Weighted average with trend detection
- **`hybrid`**: Combination of both (recommended)

### Example Response

```json
{
  "query": "iPhone 17",
  "predictions": [
    {
      "timestamp": "2025-10-29T15:00:00",
      "hours_ahead": 3,
      "predicted_sentiment_score": 0.145,
      "predicted_sentiment": "positive",
      "confidence": 0.82
    }
  ],
  "historical_summary": {
    "total_posts_analyzed": 248,
    "time_range_hours": 47.5,
    "current_sentiment": {
      "score": 0.125,
      "ratio": 0.105
    },
    "trend": "increasing"
  },
  "prediction_method": "hybrid"
}
```

### Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `query` | *required* | - | Topic to analyze |
| `time_window_hours` | 48 | 6-168 | Historical data window |
| `hours_ahead` | 12 | 3-48 | Prediction horizon |
| `interval_hours` | 3 | 1-6 | Prediction intervals |
| `method` | hybrid | - | Prediction algorithm |

### Use Cases

- 📈 **Product Launch Monitoring**: Predict sentiment evolution after announcements
- 🎮 **Event Impact Analysis**: Forecast sentiment during major events
- 💼 **Brand Reputation**: Track long-term sentiment trends
- 📊 **Quick Trend Check**: Fast predictions for volatile topics

### Features

- ✅ Multiple prediction algorithms
- ✅ Confidence scoring
- ✅ Historical trend analysis
- ✅ Customizable prediction horizons
- ✅ Handles sparse data gracefully

### Documentation & Testing

- **Full API Guide**: [`PREDICTION_API.md`](./PREDICTION_API.md)
- **Test Script**: `python test_prediction.py`

## Project Structure

```
backend/
├── main.py                      # FastAPI application
├── requirements.txt             # Python dependencies
├── README.md                    # This file
├── src/
│   ├── __init__.py
│   ├── reddit_scraper.py        # Reddit API scraper
│   ├── sentiment_analysis.py   # Sentiment analysis model
│   ├── sentiment_predictor.py  # Time-series prediction
│   ├── trending_discovery.py   # Trending topics discovery
│   ├── topic_extractor.py      # Topic extraction & ranking
│   └── utils.py                # Utility functions
├── data/
│   ├── processed/              # Analyzed data (CSV exports)
│   └── raw/                    # Raw scraped data
├── test_prediction.py          # Test prediction API
├── test_trending.py            # Test trending API
└── PREDICTION_API.md           # Prediction API docs
```

## Technologies Used

- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation using Python type hints
- **Pandas**: Data manipulation and analysis
- **Transformers**: Hugging Face transformer models
- **RoBERTa**: State-of-the-art sentiment analysis model
- **Google Gemini**: Advanced LLM for RAG and component analysis
- **scikit-learn**: Machine learning for sentiment prediction
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

