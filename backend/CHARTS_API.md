# Charts API Documentation

## Overview

The `/api/charts` endpoint provides data optimized for visualization with Recharts. It returns 4 datasets perfect for creating interactive charts in your frontend.

## Endpoint

```
POST /api/charts
```

## Request

### Request Body

```json
{
  "query": "iPhone 17",
  "limit": 300,
  "time_window_hours": 48,
  "interval_hours": 3
}
```

### Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `query` | string | Yes | - | - | Topic to search for on Reddit |
| `limit` | integer | No | 300 | 10-1000 | Number of posts to fetch |
| `time_window_hours` | integer | No | 48 | 1-168 | Time window in hours (7 days max) |
| `interval_hours` | integer | No | 3 | 1-24 | Time interval for grouping data |

## Response

### Response Structure

```json
{
  "query": "iPhone 17",
  "total_posts": 245,
  "time_window_hours": 48,
  "sentiment_distribution": [...],
  "sentiment_over_time": [...],
  "posts_over_time": [...],
  "sentiment_posts_over_time": [...]
}
```

### Full Response Example

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

## Chart Datasets

### 1. Sentiment Distribution

**Purpose:** Show the overall distribution of sentiments  
**Chart Type:** Pie Chart, Bar Chart, or Donut Chart  
**Data Structure:**

```json
[
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
]
```

**Recharts Example:**

```jsx
<PieChart>
  <Pie
    data={data.sentiment_distribution}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={100}
    label
  >
    {data.sentiment_distribution.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={colors[entry.name]} />
    ))}
  </Pie>
</PieChart>
```

### 2. Sentiment Over Time

**Purpose:** Show how average sentiment shifts over the time period  
**Chart Type:** Line Chart or Area Chart  
**Data Structure:**

```json
[
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
```

**Key Fields:**
- `average_sentiment`: Score from -1 (all negative) to 1 (all positive)
- `positive_count`, `negative_count`, `neutral_count`: Counts for tooltip
- `time`: Display label for X-axis

**Recharts Example:**

```jsx
<LineChart data={data.sentiment_over_time}>
  <XAxis dataKey="time" />
  <YAxis domain={[-1, 1]} />
  <Line 
    type="monotone" 
    dataKey="average_sentiment" 
    stroke="#3b82f6"
  />
</LineChart>
```

### 3. Posts Over Time

**Purpose:** Show post volume trends over the time period  
**Chart Type:** Area Chart, Bar Chart, or Line Chart  
**Data Structure:**

```json
[
  {
    "timestamp": "2025-10-26T12:00:00",
    "date": "2025-10-26",
    "time": "12:00",
    "posts": 26
  }
]
```

**Recharts Example:**

```jsx
<AreaChart data={data.posts_over_time}>
  <XAxis dataKey="time" />
  <YAxis />
  <Area 
    type="monotone" 
    dataKey="posts" 
    stroke="#3b82f6"
    fill="#3b82f6"
    fillOpacity={0.6}
  />
</AreaChart>
```

### 4. Sentiment Posts Over Time

**Purpose:** Show positive, negative, and neutral post counts over time  
**Chart Type:** Stacked Area Chart, Multi-Line Chart, or Stacked Bar Chart  
**Data Structure:**

```json
[
  {
    "timestamp": "2025-10-26T12:00:00",
    "date": "2025-10-26",
    "time": "12:00",
    "positive": 15,
    "negative": 8,
    "neutral": 3
  }
]
```

**Recharts Example (Stacked Area):**

```jsx
<AreaChart data={data.sentiment_posts_over_time}>
  <XAxis dataKey="time" />
  <YAxis />
  <Area 
    type="monotone" 
    dataKey="positive" 
    stackId="1"
    stroke="#10b981"
    fill="#10b981"
  />
  <Area 
    type="monotone" 
    dataKey="negative" 
    stackId="1"
    stroke="#ef4444"
    fill="#ef4444"
  />
  <Area 
    type="monotone" 
    dataKey="neutral" 
    stackId="1"
    stroke="#6b7280"
    fill="#6b7280"
  />
</AreaChart>
```

**Recharts Example (Multi-Line):**

```jsx
<LineChart data={data.sentiment_posts_over_time}>
  <XAxis dataKey="time" />
  <YAxis />
  <Line type="monotone" dataKey="positive" stroke="#10b981" />
  <Line type="monotone" dataKey="negative" stroke="#ef4444" />
  <Line type="monotone" dataKey="neutral" stroke="#6b7280" />
</LineChart>
```

## Usage Examples

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/charts" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python programming",
    "limit": 300,
    "time_window_hours": 48,
    "interval_hours": 3
  }'
```

### Using Fetch API

```javascript
const fetchChartData = async (query) => {
  const response = await fetch('http://localhost:8000/api/charts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      limit: 300,
      time_window_hours: 48,
      interval_hours: 3,
    }),
  });

  const data = await response.json();
  return data;
};

// Usage
const chartData = await fetchChartData('iPhone 17');
console.log(chartData);
```

### Using Axios

```javascript
import axios from 'axios';

const fetchChartData = async (query) => {
  const { data } = await axios.post('http://localhost:8000/api/charts', {
    query: query,
    limit: 300,
    time_window_hours: 48,
    interval_hours: 3,
  });

  return data;
};
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SentimentChart = ({ query }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Sentiment Analysis: {data.query}</h2>
      <LineChart width={800} height={400} data={data.sentiment_over_time}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[-1, 1]} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="average_sentiment" 
          stroke="#3b82f6"
          name="Average Sentiment"
        />
      </LineChart>
    </div>
  );
};
```

## Color Recommendations

For consistent and accessible visualization:

```javascript
const COLORS = {
  positive: '#10b981',  // Green
  negative: '#ef4444',  // Red
  neutral: '#6b7280',   // Gray
  primary: '#3b82f6',   // Blue
};
```

## Time Formatting

The API provides three time formats for flexibility:

- `timestamp`: ISO 8601 format (e.g., "2025-10-26T12:00:00") - for precise calculations
- `date`: Date only (e.g., "2025-10-26") - for grouping by date
- `time`: Time only (e.g., "12:00") - for X-axis labels

## Best Practices

### 1. Interval Selection

- **Short periods (6-24 hours)**: Use 1-2 hour intervals
- **Medium periods (24-72 hours)**: Use 3-6 hour intervals
- **Long periods (3-7 days)**: Use 6-12 hour intervals

### 2. Chart Selection

**Sentiment Distribution:**
- Pie Chart: Best for quick overview
- Bar Chart: Easier to compare exact values

**Sentiment Over Time:**
- Line Chart: Shows trend clearly
- Area Chart: Emphasizes magnitude

**Posts Over Time:**
- Area Chart: Shows volume effectively
- Bar Chart: Good for discrete intervals

**Sentiment Posts Over Time:**
- Stacked Area: Shows composition
- Multi-Line: Better for comparing trends

### 3. Performance

- For real-time dashboards, cache responses for 5-10 minutes
- Use smaller intervals for better granularity
- Limit data points to 50-100 for smooth rendering

### 4. Error Handling

```javascript
try {
  const data = await fetchChartData(query);
  if (data.total_posts === 0) {
    // Show "no data" message
  }
} catch (error) {
  if (error.response?.status === 404) {
    // No posts found
  } else {
    // Server error
  }
}
```

## Complete Examples

See the following files for complete implementation examples:
- `recharts_examples.jsx` - Full React components with Recharts
- `test_api.py` - API testing script

## API Comparison

### `/api/analyze` vs `/api/charts`

**Use `/api/analyze` when you need:**
- Full post data with titles, URLs, content
- CSV export
- Detailed post-level information

**Use `/api/charts` when you need:**
- Data for visualization
- Aggregated statistics
- Better performance (no post data returned)
- Time-series data optimized for charts

## Interactive Documentation

Visit http://localhost:8000/docs when the server is running to:
- See the complete API schema
- Test the endpoint interactively
- View request/response examples
- Generate code snippets

## Support

For issues or questions:
1. Check the main [README.md](README.md)
2. Review [recharts_examples.jsx](recharts_examples.jsx)
3. Test with [test_api.py](test_api.py)

