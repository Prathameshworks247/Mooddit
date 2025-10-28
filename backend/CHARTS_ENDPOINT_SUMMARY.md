# Charts Endpoint - Feature Summary

## ✅ What Was Added

A new `/api/charts` endpoint has been added to the FastAPI backend, specifically optimized for creating 4 visualization charts with Recharts.

## 🎯 The 4 Charts

### 1. **Sentiment Distribution** 
**Chart Type:** Pie Chart or Bar Chart  
**Purpose:** Shows the overall breakdown of positive, negative, and neutral sentiments

**Data Structure:**
```json
{
  "sentiment_distribution": [
    { "name": "Positive", "value": 120, "percentage": 48.98 },
    { "name": "Negative", "value": 85, "percentage": 34.69 },
    { "name": "Neutral", "value": 40, "percentage": 16.33 }
  ]
}
```

### 2. **Sentiment Shift Over Time**
**Chart Type:** Line Chart or Area Chart  
**Purpose:** Shows how average sentiment changes over the 2-day period

**Data Structure:**
```json
{
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
  ]
}
```

**Key Metric:** `average_sentiment` ranges from -1 (all negative) to 1 (all positive)

### 3. **Total Posts Over Time**
**Chart Type:** Area Chart or Bar Chart  
**Purpose:** Shows post volume related to the query over the 2-day period

**Data Structure:**
```json
{
  "posts_over_time": [
    {
      "timestamp": "2025-10-26T12:00:00",
      "date": "2025-10-26",
      "time": "12:00",
      "posts": 26
    }
  ]
}
```

### 4. **Positive/Negative Posts Over Time**
**Chart Type:** Stacked Area Chart or Multi-Line Chart  
**Purpose:** Shows distribution of positive, negative, and neutral posts over the 2-day period

**Data Structure:**
```json
{
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

## 📡 API Usage

### Endpoint
```
POST http://localhost:8000/api/charts
```

### Request
```json
{
  "query": "iPhone 17",
  "limit": 300,
  "time_window_hours": 48,
  "interval_hours": 3
}
```

### Parameters
- `query`: Topic to analyze (e.g., "iPhone 17", "Python programming")
- `limit`: Number of posts to fetch (default: 300, range: 10-1000)
- `time_window_hours`: Time window in hours (default: 48, range: 1-168)
- `interval_hours`: Grouping interval (default: 3, range: 1-24)

### Example cURL Request
```bash
curl -X POST "http://localhost:8000/api/charts" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "limit": 300,
    "time_window_hours": 48,
    "interval_hours": 3
  }'
```

## 💻 React + Recharts Implementation

Complete React components with Recharts have been provided in `recharts_examples.jsx`. Here's a quick example:

```jsx
import { useChartData, SentimentDashboard } from './recharts_examples';

// Option 1: Use the complete dashboard
function App() {
  return <SentimentDashboard />;
}

// Option 2: Use individual charts
import {
  SentimentDistributionChart,
  SentimentOverTimeChart,
  PostsOverTimeChart,
  SentimentPostsOverTimeChart
} from './recharts_examples';

function CustomDashboard() {
  const { data, loading, error, fetchData } = useChartData();

  return (
    <div>
      <button onClick={() => fetchData('iPhone 17')}>Analyze</button>
      {data && (
        <>
          <SentimentDistributionChart data={data} />
          <SentimentOverTimeChart data={data} />
          <PostsOverTimeChart data={data} />
          <SentimentPostsOverTimeChart data={data} />
        </>
      )}
    </div>
  );
}
```

## 📦 Files Created/Modified

### New Files
1. **`recharts_examples.jsx`** - Complete React components with Recharts
   - `SentimentDashboard` - Full dashboard component
   - `SentimentDistributionChart` - Chart 1
   - `SentimentOverTimeChart` - Chart 2
   - `PostsOverTimeChart` - Chart 3
   - `SentimentPostsOverTimeChart` - Chart 4
   - `useChartData` - Custom React hook for API calls
   - CSS examples included

2. **`CHARTS_API.md`** - Comprehensive charts API documentation
   - Detailed endpoint documentation
   - All 4 chart datasets explained
   - Recharts code examples
   - Color recommendations
   - Best practices

3. **`CHARTS_ENDPOINT_SUMMARY.md`** - This file

### Modified Files
1. **`main.py`** - Added `/api/charts` endpoint with 4 chart datasets
2. **`test_api.py`** - Added `test_charts()` function
3. **`README.md`** - Added charts endpoint documentation

## 🚀 Quick Start

### 1. Start the API
```bash
cd backend
source venv/bin/activate  # or: venv\Scripts\activate on Windows
uvicorn main:app --reload
```

### 2. Test the Endpoint
```bash
python test_api.py
```

### 3. View Documentation
Visit: http://localhost:8000/docs

### 4. Try It Out
```bash
curl -X POST "http://localhost:8000/api/charts" \
  -H "Content-Type: application/json" \
  -d '{"query": "Python"}'
```

## 📊 Data Flow

```
1. User sends query → POST /api/charts
2. API fetches Reddit posts (current scraper)
3. API analyzes sentiment (current model)
4. API aggregates data into 4 datasets:
   - Sentiment distribution (totals)
   - Sentiment over time (averages per interval)
   - Posts over time (counts per interval)
   - Sentiment posts over time (pos/neg/neu per interval)
5. Returns JSON optimized for Recharts
6. Frontend receives data → Renders 4 charts
```

## 🎨 Recommended Chart Library

**Recharts** (included in examples)
```bash
npm install recharts
```

**Alternative:** Chart.js, Victory, Nivo, or any chart library that accepts JSON data

## 💡 Key Features

✅ **Separate Endpoint** - `/api/charts` doesn't return heavy post data  
✅ **Optimized Data** - Pre-aggregated for charts (faster rendering)  
✅ **Time Formatting** - Includes `timestamp`, `date`, and `time` formats  
✅ **Flexible Intervals** - Configurable time grouping (1-24 hours)  
✅ **Complete Examples** - Ready-to-use React components provided  
✅ **Same Scraper** - Uses existing Reddit scraper and sentiment model  
✅ **Type-Safe** - Pydantic models for validation  
✅ **Auto-Documented** - Swagger UI at `/docs`  

## 📖 Documentation

- **Charts API Details**: `CHARTS_API.md`
- **React Examples**: `recharts_examples.jsx`
- **General API Docs**: `README.md`
- **Quick Start**: `QUICKSTART.md`

## 🧪 Testing

The test script (`test_api.py`) now includes charts endpoint testing:

```bash
python test_api.py
```

It will test:
1. Health check
2. Root endpoint
3. Analyze endpoint (full data)
4. Charts endpoint (visualization data)

## 🔍 Comparison: `/api/analyze` vs `/api/charts`

| Feature | `/api/analyze` | `/api/charts` |
|---------|----------------|---------------|
| Post Details | ✅ Full posts with titles, URLs | ❌ No post details |
| CSV Export | ✅ Yes | ❌ No |
| Aggregated Data | ✅ Yes | ✅ Yes (optimized) |
| Time Series | ✅ Sentiment values | ✅ 4 chart datasets |
| Response Size | Large (~500KB) | Small (~50KB) |
| Use Case | Data analysis, export | Visualization, charts |
| Speed | Slower (more data) | Faster (less data) |

## 🎯 Next Steps

1. **Install Recharts in your frontend:**
   ```bash
   npm install recharts
   ```

2. **Copy `recharts_examples.jsx` to your project**

3. **Import and use the dashboard:**
   ```jsx
   import { SentimentDashboard } from './recharts_examples';
   
   function App() {
     return <SentimentDashboard />;
   }
   ```

4. **Customize the colors and styling to match your theme**

5. **Deploy and enjoy! 🎉**

## 💬 Support

- Full documentation: `CHARTS_API.md`
- React examples: `recharts_examples.jsx`
- API testing: `python test_api.py`
- Interactive docs: http://localhost:8000/docs

---

**Happy Charting! 📊✨**

