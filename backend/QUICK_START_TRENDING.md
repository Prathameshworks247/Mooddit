# Quick Start: Trending Topics Analysis

## 🎯 What Is This?

Your API now automatically **discovers and analyzes trending topics from Reddit** - no manual queries needed!

## 🚀 Get Started in 30 Seconds

### 1. Start Your Server
```bash
cd /Users/prathameshpatil/sinister-6/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Get Trending Topics
```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "top_n": 5
  }'
```

That's it! You'll get the top 5 trending topics on Reddit with full sentiment analysis.

## 📊 What You Get

For each trending topic:
- **Rank** - Where it ranks in trending
- **Trending Strength** - How hot it is (0-100%)
- **Post Count** - How many posts about it
- **Velocity** - Engagement per hour (trending momentum)
- **Sentiment Breakdown** - Positive/Negative/Neutral percentages
- **Component Analysis** - What people like/dislike (with Gemini)
- **Sample Posts** - Top posts about the topic
- **Subreddits** - Where it's trending

## 🎨 Example Response

```json
{
  "trending_topics": [
    {
      "topic_info": {
        "topic": "iPhone 17",
        "rank": 1,
        "trending_strength": 100.0,
        "post_count": 45,
        "total_score": 123456,
        "velocity": 1234.5,
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
          "summary": "Users love the new camera system"
        }
      ]
    }
  ]
}
```

## 🔧 Customize Your Request

### Get More/Fewer Topics
```json
{
  "top_n": 15  // Get top 15 topics
}
```

### Filter by Category
```json
{
  "category": "technology",  // or "gaming", "news", "sports"
  "top_n": 10
}
```

### Change Time Window
```json
{
  "time_window_hours": 48,  // Look back 48 hours
  "top_n": 10
}
```

### Disable Component Analysis (Faster)
```json
{
  "analyze_components": false,  // Skip component analysis
  "top_n": 10
}
```

### Full Control
```json
{
  "time_window_hours": 24,
  "top_n": 10,
  "category": "technology",
  "min_posts": 3,
  "analyze_sentiment": true,
  "analyze_components": true
}
```

## 📂 Available Categories

| Category | Includes |
|----------|----------|
| `all` | Everything (r/popular) |
| `technology` | Tech news, gadgets, programming |
| `gaming` | Games, consoles, esports |
| `news` | World news, politics |
| `entertainment` | Movies, TV, music |
| `sports` | Sports, teams, events |
| `science` | Science, space, future tech |

## 🧪 Test It

```bash
# Run the test suite
python test_trending.py
```

This will:
- ✅ Test basic trending analysis
- ✅ Test with component analysis
- ✅ Test multiple categories
- ✅ Save results to JSON file

## 💡 Use Cases

### 1. Real-Time Dashboard
```javascript
// Update every hour
setInterval(async () => {
  const response = await fetch('/api/trending/analyze', {
    method: 'POST',
    body: JSON.stringify({ top_n: 10 })
  });
  const data = await response.json();
  updateDashboard(data.trending_topics);
}, 3600000);
```

### 2. Morning Digest
```bash
# Get top 10 trends from last 24 hours
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{"time_window_hours": 24, "top_n": 10}' | jq
```

### 3. Tech News Monitor
```bash
# Monitor tech trends specifically
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{"category": "technology", "top_n": 5}'
```

### 4. Multi-Category Overview
```bash
# Check all categories
for cat in technology gaming news sports; do
  echo "=== $cat ==="
  curl -X POST "http://localhost:8000/api/trending/analyze" \
    -d "{\"category\": \"$cat\", \"top_n\": 3}" | \
    jq '.trending_topics[].topic_info.topic'
done
```

## 🎯 Quick Examples

### Example 1: What's Trending Right Now?
```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -H "Content-Type: application/json" \
  -d '{"top_n": 5}'
```

### Example 2: Tech Trends (No Component Analysis)
```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "technology",
    "top_n": 10,
    "analyze_components": false
  }'
```

### Example 3: Deep Dive (With Components)
```bash
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "top_n": 3,
    "analyze_components": true
  }'
```

## 🔥 Pro Tips

1. **Start Without Component Analysis** - It's faster
2. **Use Categories** - More focused results
3. **Cache Results** - Trending topics change slowly (cache for 30-60 min)
4. **Lower `top_n` for Deep Analysis** - Component analysis takes time
5. **Monitor Velocity** - Better indicator of "hotness" than score
6. **Check Subreddit Count** - Higher = more widespread trend

## ⚡ Performance

| Configuration | Time | Use Case |
|---------------|------|----------|
| 5 topics, no components | ~10-15s | Quick check |
| 10 topics, no components | ~20-30s | Dashboard |
| 5 topics, with components | ~30-60s | Deep analysis |
| 10 topics, with components | ~60-120s | Full report |

## 🚨 Troubleshooting

### "No trending posts found"
**Solution:** Increase `time_window_hours` or change `category`

### "No topics extracted"
**Solution:** Lower `min_posts` threshold

### Slow Response
**Solutions:**
- Disable component analysis: `"analyze_components": false`
- Reduce `top_n`: `"top_n": 5`
- Use specific category instead of "all"

### Component Analysis Returns `null`
**Reason:** Gemini not configured or API error
**Solution:** Check `.env` has `GEMINI_API_KEY`

## 📚 Documentation

- **Full Documentation**: `TRENDING_TOPICS.md`
- **API Reference**: http://localhost:8000/docs
- **Test Script**: `python test_trending.py`

## 🌟 What Makes This Special?

Unlike traditional trending APIs that require you to know what to search for, this:

1. **Auto-discovers** trending topics (you don't need to guess)
2. **Ranks by momentum** (not just popularity)
3. **Analyzes sentiment** (what people think)
4. **Breaks down components** (what they like/dislike)
5. **Tracks across subreddits** (see where it's trending)
6. **Provides sample posts** (read the actual discussion)

## 🎉 You're Ready!

```bash
# Start your server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, get trending topics
curl -X POST "http://localhost:8000/api/trending/analyze" \
  -d '{"top_n": 5}'

# Or run the test suite
python test_trending.py
```

Visit http://localhost:8000/docs to explore the API interactively! 🚀

