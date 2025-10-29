# Trending Topics Analysis

## Overview

The Trending Topics Analysis feature automatically discovers what's trending on Reddit and performs comprehensive sentiment and component analysis on each topic.

## 🎯 What It Does

1. **Discovers Trending Posts** - Fetches hot posts from Reddit (r/popular or specific categories)
2. **Extracts Topics** - Uses NLP to identify trending topics from post titles
3. **Sentiment Analysis** - Analyzes sentiment for each trending topic
4. **Component Analysis** - (Optional) Uses Gemini AI to break down sentiment by components
5. **Ranks Topics** - Scores and ranks topics by trending momentum

## 🚀 Quick Start

### Basic Request (No Gemini Required)

```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "time_window_hours": 24,
    "top_n": 5,
    "analyze_sentiment": true,
    "analyze_components": false
  }'
```

### Full Analysis (With Gemini Component Analysis)

```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "time_window_hours": 24,
    "top_n": 10,
    "category": "technology",
    "analyze_sentiment": true,
    "analyze_components": true
  }'
```

## 📊 Response Format

```json
{
  "trending_topics": [
    {
      "topic_info": {
        "topic": "iPhone 17",
        "rank": 1,
        "post_count": 45,
        "total_score": 123456,
        "total_comments": 8934,
        "avg_velocity": 1234.5,
        "topic_score": 95000.0,
        "trending_strength": 100.0,
        "subreddits": ["apple", "technology", "gadgets"],
        "subreddit_count": 3,
        "variants": ["iPhone 17 Pro", "iPhone 17"]
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
          "confidence": "high",
          "summary": "Users praise the improved camera system",
          "mention_count": 45
        },
        {
          "component": "price",
          "sentiment": "negative",
          "confidence": "high",
          "summary": "Concerns about high pricing",
          "mention_count": 32
        }
      ],
      "trending_duration_hours": 8.5,
      "sample_posts": [
        {
          "title": "iPhone 17 camera is incredible!",
          "url": "https://...",
          "sentiment": "positive",
          "selftext": "...",
          "score": 5234,
          "created_utc": "2025-10-29T10:00:00"
        }
      ]
    }
  ],
  "total_topics_found": 10,
  "analysis_time": "2025-10-29T14:30:00",
  "time_window_hours": 24,
  "category": "technology"
}
```

## 🎛️ Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `time_window_hours` | int | 24 | How far back to look (1-168 hours) |
| `top_n` | int | 10 | Number of topics to analyze (1-20) |
| `category` | string | "all" | Category filter (see below) |
| `min_posts` | int | 2 | Minimum posts required for a topic |
| `analyze_sentiment` | bool | true | Perform sentiment analysis |
| `analyze_components` | bool | true | Perform component analysis (requires Gemini) |

### Available Categories

- `"all"` - All of Reddit (r/popular)
- `"technology"` - Tech-related subreddits
- `"gaming"` - Gaming subreddits
- `"news"` - News subreddits
- `"entertainment"` - Movies, TV, Music
- `"sports"` - Sports subreddits
- `"science"` - Science & space subreddits

## 📈 How It Works

### Step 1: Trending Discovery

```python
# Fetches hot posts from Reddit
trending_posts = get_trending_by_category("technology", time_window_hours=24)

# Calculates velocity (engagement per hour)
velocity = (score + comments * 2) / hours_since_posted
```

### Step 2: Topic Extraction

```python
# Extracts keywords using pattern matching
patterns = [
    r'\b([A-Z][a-zA-Z0-9]*\s*(?:\d+|Pro|Max)+)\b',  # iPhone 17, PS5 Pro
    r'\b([A-Z][a-zA-Z]*\s+(?:Cup|Bowl)\s+\d{4})\b'  # World Cup 2026
]

# Groups similar topics
"iPhone 17" + "iPhone 17 Pro" → "iPhone 17 Pro" (uses longest name)
```

### Step 3: Topic Ranking

```python
topic_score = (
    frequency * 100 +
    total_reddit_score * 0.5 +
    total_comments * 2 +
    avg_velocity * 10
)
```

### Step 4: Sentiment Analysis

For each topic:
1. Fetch posts mentioning the topic
2. Analyze sentiment with RoBERTa model
3. Count positive/negative/neutral
4. Extract sample posts

### Step 5: Component Analysis (Optional)

If Gemini is configured:
1. Build context from top posts
2. Ask Gemini to identify components
3. Parse structured JSON response
4. Extract sentiment for each component

## 💡 Use Cases

### 1. Real-time Trend Monitoring

```javascript
// Poll every hour
setInterval(async () => {
  const response = await fetch('/api/trending/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      time_window_hours: 24,
      top_n: 10,
      category: "all"
    })
  });
  
  const data = await response.json();
  updateDashboard(data.trending_topics);
}, 3600000); // Every hour
```

### 2. Category-Specific Trends

```bash
# Technology trends
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{"category": "technology", "top_n": 5}'

# Gaming trends
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{"category": "gaming", "top_n": 5}'
```

### 3. Quick Sentiment Check (No Component Analysis)

```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{
    "top_n": 15,
    "analyze_components": false
  }'
```

### 4. Deep Dive Analysis (With Components)

```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{
    "top_n": 5,
    "analyze_components": true
  }'
```

## 🎨 Frontend Integration

### React Dashboard Example

```jsx
import { useState, useEffect } from 'react';

function TrendingDashboard() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = async (category = 'all') => {
    setLoading(true);
    try {
      const response = await fetch('/api/trending/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_window_hours: 24,
          top_n: 10,
          category,
          analyze_components: true
        })
      });
      
      const data = await response.json();
      setTrending(data.trending_topics);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrending();
    
    // Auto-refresh every hour
    const interval = setInterval(() => fetchTrending(), 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>🔥 Trending on Reddit</h1>
      
      <div className="category-tabs">
        {['all', 'technology', 'gaming', 'news'].map(cat => (
          <button key={cat} onClick={() => fetchTrending(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Analyzing trending topics...</p>
      ) : (
        <div className="trending-grid">
          {trending.map((item, idx) => (
            <TrendingCard key={idx} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingCard({ data }) {
  const { topic_info, sentiment_analysis, component_analysis } = data;
  
  return (
    <div className="card">
      <div className="rank">#{topic_info.rank}</div>
      <h2>{topic_info.topic}</h2>
      
      <div className="metrics">
        <span>💬 {topic_info.post_count} posts</span>
        <span>⚡ {topic_info.trending_strength}% trending</span>
        <span>🏆 {topic_info.total_score.toLocaleString()} score</span>
      </div>
      
      <div className="subreddits">
        {topic_info.subreddits.slice(0, 3).map(sub => (
          <span key={sub} className="badge">r/{sub}</span>
        ))}
      </div>
      
      <div className="sentiment">
        <div className="bar positive" style={{width: `${sentiment_analysis.positive}%`}}>
          {sentiment_analysis.positive}+ positive
        </div>
        <div className="bar negative" style={{width: `${sentiment_analysis.negative}%`}}>
          {sentiment_analysis.negative}- negative
        </div>
      </div>
      
      {component_analysis && (
        <div className="components">
          <h4>Component Sentiments:</h4>
          {component_analysis.map((comp, i) => (
            <div key={i} className="component">
              <span className={`emoji ${comp.sentiment}`}>
                {comp.sentiment === 'positive' ? '😊' : comp.sentiment === 'negative' ? '😞' : '😐'}
              </span>
              <span>{comp.component}: {comp.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔧 Technical Details

### Topic Extraction Algorithm

**Pattern Matching:**
- Product names: "iPhone 17", "PS5 Pro", "RTX 4090"
- Events: "World Cup 2026", "Super Bowl LIX"
- Brands: Capitalized phrases
- Acronyms: "NASA", "FBI", "AI"

**Grouping:**
- "iPhone 17" + "iPhone 17 Pro" → merged
- Uses longest name as primary
- Combines metrics from all variants

**Scoring:**
```python
topic_score = (
    post_count * 100 +           # Frequency (how many posts)
    total_score * 0.5 +          # Reddit karma
    total_comments * 2 +         # Engagement
    avg_velocity * 10            # Trending momentum
)
```

### Performance Optimization

**Caching Strategy:**
```python
# Cache trending topics for 1 hour
cache_key = f"trending_{category}_{time_window}"
cached = get_cache(cache_key)
if cached:
    return cached

# Fetch and cache
trending = fetch_and_analyze()
set_cache(cache_key, trending, ttl=3600)
```

**Parallel Processing:**
```python
# Analyze topics in parallel
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [
        executor.submit(analyze_topic, topic)
        for topic in trending_topics
    ]
    results = [f.result() for f in futures]
```

## 📊 Metrics Explained

### Velocity
**Definition:** Engagement per hour since posting
```
velocity = (score + comments * 2) / hours_old
```
**Why it matters:** Shows trending *momentum*, not just popularity

### Trending Strength
**Definition:** Normalized score (0-100)
```
trending_strength = (topic_score / max_score) * 100
```
**Why it matters:** Easy comparison between topics

### Topic Score
**Definition:** Comprehensive ranking score
**Factors:**
- 40% - Velocity (trending momentum)
- 30% - Engagement (score + comments)
- 10% - Awards
- 20% - Recency bonus

## 🚨 Error Handling

### No Trending Posts Found
```json
{
  "detail": "No trending posts found in the last 24 hours"
}
```
**Solution:** Increase `time_window_hours` or change `category`

### No Topics Extracted
```json
{
  "detail": "No trending topics extracted from posts"
}
```
**Solution:** Lower `min_posts` or check if Reddit is accessible

### Component Analysis Failed
Component analysis gracefully fails - returns `null` for `component_analysis`
**Reason:** Gemini not configured or API error

## 🔒 Rate Limiting

Reddit API limits:
- **60 requests per minute** (with OAuth)
- **10 requests per minute** (without OAuth)

**Best Practices:**
- Cache results for 30-60 minutes
- Stagger category requests
- Use reasonable `top_n` values (5-15)

## 📝 API Documentation

Full interactive API documentation available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🎯 Example Workflows

### 1. Morning Trends Digest
```bash
# Get top 10 trending topics from last 24 hours
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{"time_window_hours": 24, "top_n": 10}'
```

### 2. Real-time Tech News
```bash
# Monitor tech trends (refreshes every hour)
while true; do
  curl -X POST "http://localhost:8000/api/trending/analyze" \
    -d '{"category": "technology", "top_n": 5}' | jq
  sleep 3600
done
```

### 3. Multi-Category Analysis
```bash
# Analyze all categories
for cat in all technology gaming news sports; do
  echo "=== $cat ==="
  curl -X POST "http://localhost:8000/api/trending/analyze" \
    -d "{\"category\": \"$cat\", \"top_n\": 3}" | jq '.trending_topics[].topic_info.topic'
done
```

## 🌟 Tips & Best Practices

1. **Start Simple** - Disable component analysis for faster results
2. **Cache Results** - Trending topics change slowly (30-60 min cache is fine)
3. **Use Categories** - More focused results than "all"
4. **Lower `top_n` for Deep Analysis** - Component analysis is slower
5. **Monitor Velocity** - Better indicator of "hotness" than raw score
6. **Check Subreddit Count** - Higher = more widespread trend

## 🚀 What's Next?

Potential enhancements:
- [ ] Historical trending data
- [ ] Trend predictions
- [ ] Custom subreddit lists
- [ ] Sentiment trend over time
- [ ] Automated alerts for specific topics
- [ ] Export to CSV/JSON

---

## 📞 Support

For issues or questions:
- Check `/docs` for interactive API testing
- Review server logs for errors
- Ensure Reddit API credentials are valid
- Verify Gemini API key for component analysis

