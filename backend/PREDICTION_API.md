# Sentiment Prediction API 🔮

## Overview

The Sentiment Prediction API uses time-series analysis to forecast future sentiment trends based on historical Reddit data. It analyzes past sentiment patterns and predicts how sentiment will likely change in the coming hours.

---

## 🎯 Endpoint

```
POST /api/predict
```

**Base URL**: `http://localhost:8000` (or your server URL)

---

## 📋 Request Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `query` | string | *required* | 1+ chars | Topic to analyze (e.g., "iPhone 17") |
| `limit` | integer | 300 | 10-1000 | Number of historical posts to fetch |
| `time_window_hours` | integer | 48 | 6-168 | Historical time window for analysis |
| `hours_ahead` | integer | 12 | 3-48 | How far ahead to predict |
| `interval_hours` | integer | 3 | 1-6 | Time interval for predictions |
| `method` | string | "hybrid" | - | Prediction method (see below) |

### Prediction Methods

1. **`linear`** - Linear regression on historical trend
   - Best for: Consistent trends
   - Pros: Simple, reliable for steady patterns
   - Cons: May not capture complex changes

2. **`moving_average`** - Weighted moving average with trend detection
   - Best for: Recent pattern focus
   - Pros: Adapts to recent changes
   - Cons: Can be volatile

3. **`hybrid`** *(recommended)* - Combination of both methods
   - Best for: General use, most reliable
   - Pros: Balances both approaches
   - Cons: None significant

---

## 📤 Request Example

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "limit": 300,
    "time_window_hours": 48,
    "hours_ahead": 12,
    "interval_hours": 3,
    "method": "hybrid"
  }'
```

### JavaScript Example

```javascript
const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'iPhone 17',
    time_window_hours: 48,
    hours_ahead: 12,
    interval_hours: 3,
    method: 'hybrid'
  })
});

const data = await response.json();
console.log(data);
```

---

## 📥 Response Format

```json
{
  "query": "iPhone 17",
  "predictions": [
    {
      "timestamp": "2025-10-29T12:00:00",
      "hours_ahead": 3,
      "predicted_sentiment_score": 0.145,
      "predicted_sentiment_ratio": 0.123,
      "predicted_sentiment": "positive",
      "confidence": 0.82
    },
    {
      "timestamp": "2025-10-29T15:00:00",
      "hours_ahead": 6,
      "predicted_sentiment_score": 0.168,
      "predicted_sentiment_ratio": 0.145,
      "predicted_sentiment": "positive",
      "confidence": 0.78
    }
  ],
  "historical_summary": {
    "total_posts_analyzed": 248,
    "time_range_hours": 47.5,
    "current_sentiment": {
      "score": 0.125,
      "ratio": 0.105
    },
    "average_sentiment": {
      "score": 0.087,
      "ratio": 0.068
    },
    "trend": "increasing"
  },
  "prediction_method": "hybrid",
  "interval_hours": 3,
  "generated_at": "2025-10-29T09:15:30.123456"
}
```

---

## 📊 Response Fields Explained

### Prediction Point

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `timestamp` | string (ISO 8601) | - | Predicted time point |
| `hours_ahead` | integer | - | Hours from now |
| `predicted_sentiment_score` | float | -1 to 1 | Predicted sentiment (-1=negative, 1=positive) |
| `predicted_sentiment_ratio` | float | -1 to 1 | Ratio of positive to negative |
| `predicted_sentiment` | string | - | Overall sentiment (positive/negative/neutral) |
| `confidence` | float | 0 to 1 | Prediction confidence (1=highest) |

### Historical Summary

| Field | Description |
|-------|-------------|
| `total_posts_analyzed` | Number of posts used for prediction |
| `time_range_hours` | Actual time range of data |
| `current_sentiment` | Most recent sentiment values |
| `average_sentiment` | Average across the historical window |
| `trend` | Overall trend direction (increasing/decreasing/stable) |

---

## 🎨 Sentiment Score Interpretation

| Score Range | Sentiment | Color (UI) |
|-------------|-----------|------------|
| **0.1 to 1.0** | Positive | 🟢 Green |
| **-0.1 to 0.1** | Neutral | ⚪ Gray |
| **-1.0 to -0.1** | Negative | 🔴 Red |

---

## 📈 Use Cases

### 1. **Product Launch Monitoring**
```json
{
  "query": "New iPhone 17",
  "time_window_hours": 72,
  "hours_ahead": 24,
  "interval_hours": 4
}
```
Monitor how sentiment evolves after a product announcement.

### 2. **Event Impact Analysis**
```json
{
  "query": "World Cup 2026",
  "time_window_hours": 48,
  "hours_ahead": 12,
  "interval_hours": 3
}
```
Predict sentiment changes during major events.

### 3. **Brand Reputation Tracking**
```json
{
  "query": "Tesla",
  "time_window_hours": 168,
  "hours_ahead": 48,
  "interval_hours": 6
}
```
Long-term sentiment trend forecasting.

### 4. **Quick Trend Check**
```json
{
  "query": "Bitcoin",
  "time_window_hours": 24,
  "hours_ahead": 6,
  "interval_hours": 2
}
```
Fast-moving topics with recent data focus.

---

## ⚠️ Error Handling

### Error Responses

#### 404 - No Data Found
```json
{
  "detail": "No posts found for the given query"
}
```

#### 400 - Insufficient Data
```json
{
  "detail": "Insufficient data for prediction. Only 5 posts found. Need at least 10."
}
```

#### 500 - Server Error
```json
{
  "detail": "Prediction error: [error message]"
}
```

---

## 🔧 How It Works

### Algorithm Flow

1. **Data Collection**
   - Fetches Reddit posts matching the query
   - Filters to the specified time window
   - Requires minimum 10 posts

2. **Sentiment Analysis**
   - Analyzes each post using transformer model
   - Normalizes sentiment labels (positive/negative/neutral)
   - Converts to numeric scores (-1, 0, 1)

3. **Trend Calculation**
   - Groups data into time intervals
   - Calculates average sentiment per interval
   - Identifies overall trend direction

4. **Prediction Generation**
   - **Linear Method**: Fits linear regression to trend
   - **Moving Average Method**: Uses weighted recent data with trend
   - **Hybrid Method**: Averages both methods

5. **Confidence Calculation**
   - Based on data consistency
   - Higher variance = lower confidence
   - Decreases for predictions further in the future

---

## 💡 Best Practices

### ✅ Recommendations

1. **Use Hybrid Method** - Most reliable for general use
2. **Adequate Historical Data** - Use at least 24 hours of history
3. **Reasonable Prediction Window** - Don't predict too far ahead (12-24 hours is optimal)
4. **Appropriate Intervals** - 3-hour intervals balance detail and reliability
5. **Check Confidence** - Focus on predictions with confidence > 0.5

### ❌ Avoid

1. **Too Little History** - Less than 12 hours may be unreliable
2. **Too Far Predictions** - Predictions beyond 48 hours are highly uncertain
3. **Too Fine Intervals** - 1-hour intervals with sparse data are noisy
4. **Ignoring Confidence** - Always consider confidence levels

---

## 📊 Confidence Levels Guide

| Confidence | Interpretation | Action |
|------------|----------------|--------|
| **0.8 - 1.0** | High confidence | Rely on prediction |
| **0.6 - 0.8** | Good confidence | Generally reliable |
| **0.4 - 0.6** | Moderate | Use with caution |
| **< 0.4** | Low confidence | Consider as rough estimate |

---

## 🚀 Quick Start Examples

### Example 1: Basic Prediction
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"query": "ChatGPT", "hours_ahead": 12}'
```

### Example 2: Detailed Analysis
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tesla Model 3",
    "time_window_hours": 72,
    "hours_ahead": 24,
    "interval_hours": 4,
    "method": "hybrid"
  }'
```

### Example 3: Quick Check
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Bitcoin",
    "time_window_hours": 24,
    "hours_ahead": 6
  }'
```

---

## 🧪 Testing the API

### Using Python

```python
import requests

response = requests.post(
    'http://localhost:8000/api/predict',
    json={
        'query': 'iPhone 17',
        'time_window_hours': 48,
        'hours_ahead': 12,
        'interval_hours': 3,
        'method': 'hybrid'
    }
)

data = response.json()

print(f"Query: {data['query']}")
print(f"\nHistorical Summary:")
print(f"  Total Posts: {data['historical_summary']['total_posts_analyzed']}")
print(f"  Current Sentiment: {data['historical_summary']['current_sentiment']['score']:.3f}")
print(f"  Trend: {data['historical_summary']['trend']}")

print(f"\nPredictions:")
for pred in data['predictions']:
    print(f"  {pred['hours_ahead']}h ahead: {pred['predicted_sentiment']} "
          f"(score: {pred['predicted_sentiment_score']:.3f}, "
          f"confidence: {pred['confidence']:.2f})")
```

---

## 📚 Integration Tips

### For Recharts

```javascript
// Format predictions for line chart
const chartData = data.predictions.map(pred => ({
  time: new Date(pred.timestamp).toLocaleTimeString(),
  sentiment: pred.predicted_sentiment_score,
  confidence: pred.confidence * 100, // Convert to percentage
}));
```

### For Dashboard Display

```javascript
// Get overall trend
const overallTrend = data.historical_summary.trend;
const trendColor = overallTrend === 'increasing' ? 'green' : 
                   overallTrend === 'decreasing' ? 'red' : 'gray';

// Get prediction summary
const avgFutureSentiment = data.predictions.reduce(
  (sum, pred) => sum + pred.predicted_sentiment_score, 0
) / data.predictions.length;
```

---

## 🔍 Troubleshooting

### Issue: "No posts found"
**Solution**: Try a broader search term or increase time window

### Issue: "Insufficient data for prediction"
**Solution**: 
- Increase `limit` parameter
- Expand `time_window_hours`
- Use more popular topics

### Issue: Low confidence scores
**Solution**:
- Use more historical data
- Reduce prediction horizon
- Check if topic has stable sentiment

### Issue: Inconsistent predictions
**Solution**:
- Use `hybrid` method
- Increase time window
- Verify topic has enough discussion

---

## 🎯 Performance

- **Response Time**: 3-10 seconds (depending on data volume)
- **Minimum Posts Required**: 10
- **Recommended Posts**: 50-300
- **Optimal Time Window**: 24-72 hours
- **Optimal Prediction Window**: 12-24 hours

---

## 📝 Notes

- Predictions are based solely on historical patterns
- External events may cause sentiment to deviate from predictions
- Confidence decreases for predictions further in the future
- More data = more reliable predictions
- Use in combination with other analysis tools for best results

---

## 🔗 Related Endpoints

- `/api/analyze` - Full sentiment analysis
- `/api/charts` - Historical chart data
- `/api/rag` - Q&A about sentiment
- `/api/trending/analyze` - Trending topics analysis

---

**Need Help?** Check the main API documentation or test using the included `test_prediction.py` script!

