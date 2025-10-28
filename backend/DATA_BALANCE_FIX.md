# Data Balance Issue - Fixed! ✅

## The Problem

When querying topics like "iPhone 17" over a 48-hour window, you may notice that most or all posts are concentrated in just the last few hours, leaving many empty time intervals at the beginning. This creates charts with:

- Lots of zeros at the start
- Data clustered at the end
- Poor visualization balance

### Example Issue

```json
{
  "time_window_hours": 48,
  "posts_over_time": [
    { "time": "23:02", "posts": 0 },  // Empty
    { "time": "02:02", "posts": 0 },  // Empty
    { "time": "05:02", "posts": 0 },  // Empty
    ...
    { "time": "08:02", "posts": 37 }, // Data starts here!
    { "time": "11:02", "posts": 45 },
    { "time": "14:02", "posts": 50 }
  ]
}
```

## The Solution

The `/api/charts` endpoint now includes:

### 1. **Automatic Trimming** (Default: ON)

By default, the API now automatically removes empty intervals from the start and end of your data, showing only the time range where posts actually exist.

```json
{
  "query": "iPhone 17",
  "trim_empty_intervals": true  // ← Default: true
}
```

**Result:**
- Charts start from the first post
- Charts end at the last post
- No empty intervals cluttering your visualization

### 2. **Actual Time Range Info**

The response now includes the actual time span of your data:

```json
{
  "time_window_hours": 48,           // What you requested
  "actual_time_range_hours": 15.5,   // Actual data span
  "first_post_time": "2025-10-28T05:02:22",
  "last_post_time": "2025-10-28T20:32:15"
}
```

This helps you understand:
- How much of the requested window has data
- The actual posting period
- Whether to adjust your query parameters

## Usage Examples

### Default Behavior (Trimmed)

```bash
curl -X POST "http://localhost:8000/api/charts" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "time_window_hours": 48,
    "interval_hours": 3
  }'
```

**Result:** Only intervals with data (no leading/trailing zeros)

### Show All Intervals (Including Empty)

```bash
curl -X POST "http://localhost:8000/api/charts" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "time_window_hours": 48,
    "interval_hours": 3,
    "trim_empty_intervals": false
  }'
```

**Result:** Full 48-hour window (may include zeros)

## Updated Response Format

```json
{
  "query": "iPhone 17",
  "total_posts": 248,
  "time_window_hours": 48,
  
  // NEW: Actual data range info
  "actual_time_range_hours": 15.5,
  "first_post_time": "2025-10-28T05:02:22",
  "last_post_time": "2025-10-28T20:32:15",
  
  // Now trimmed by default
  "sentiment_over_time": [
    { "time": "05:02", "posts": 7 },    // Starts from first post
    { "time": "08:02", "posts": 37 },
    { "time": "11:02", "posts": 45 },
    ...
    { "time": "20:02", "posts": 43 }    // Ends at last post
  ]
}
```

## React Component Updates

If you're using the Recharts examples, they automatically work with the trimmed data! No changes needed.

### Display the Actual Time Range

You can show users the actual time span:

```jsx
const { data } = useChartData();

return (
  <div>
    <h2>Sentiment Analysis: {data.query}</h2>
    <p>
      Analyzed {data.total_posts} posts over{' '}
      <strong>{data.actual_time_range_hours} hours</strong>
      {' '}(requested {data.time_window_hours}h window)
    </p>
    <p className="text-sm text-gray-500">
      Data from {new Date(data.first_post_time).toLocaleString()} 
      to {new Date(data.last_post_time).toLocaleString()}
    </p>
    
    {/* Your charts here */}
  </div>
);
```

## Best Practices

### 1. **Use Shorter Time Windows for Recent Topics**

If most posts are recent:
```json
{
  "query": "Breaking News Topic",
  "time_window_hours": 24,  // Instead of 48
  "interval_hours": 2        // Smaller intervals
}
```

### 2. **Adjust Interval Based on Data Density**

Use `actual_time_range_hours` to decide:
```javascript
const suggestedInterval = Math.ceil(data.actual_time_range_hours / 12);
// Aim for ~12 data points on your chart
```

### 3. **Show Warning for Sparse Data**

```jsx
if (data.actual_time_range_hours < data.time_window_hours * 0.3) {
  return (
    <div className="warning">
      Note: Most posts are from the last {data.actual_time_range_hours.toFixed(1)} hours.
      Consider using a shorter time window.
    </div>
  );
}
```

### 4. **Dynamic Time Window Selection**

```javascript
// Frontend: Suggest optimal time window
const getOptimalTimeWindow = (query) => {
  // For breaking news / recent events
  if (isRecentTopic(query)) {
    return { time_window_hours: 24, interval_hours: 2 };
  }
  // For evergreen topics
  return { time_window_hours: 168, interval_hours: 12 };
};
```

## Why This Happens

Reddit posts are often concentrated in specific time periods:

1. **Breaking News**: All posts in last few hours
2. **Product Launches**: Spike on announcement day
3. **Events**: Concentrated around event time
4. **Trending Topics**: Sudden bursts of activity

This is normal behavior! The trimming feature ensures your charts look good regardless.

## Comparison: Before vs After

### Before (Unbalanced)
```
Posts Over Time Chart:
[0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 37, 45, 50, 66, 43]
      Empty space          ↑  Actual data →
```

### After (Balanced)
```
Posts Over Time Chart:
[7, 37, 45, 50, 66, 43]
 ← All actual data →
```

## Testing

Test with different settings:

```bash
# Default (trimmed)
python test_api.py

# Or manually:
curl -X POST "http://localhost:8000/api/charts" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "limit": 300,
    "trim_empty_intervals": true
  }' | jq '.actual_time_range_hours'
```

## API Documentation

Updated documentation available at:
- Interactive docs: http://localhost:8000/docs
- Charts API: `CHARTS_API.md`
- README: `README.md`

## Summary

✅ **Automatic trimming** removes empty intervals (default: ON)  
✅ **Actual time range** shows real data span  
✅ **First/last post times** for context  
✅ **Backward compatible** - can disable trimming  
✅ **No frontend changes needed** - works with existing components  

Your charts will now look balanced and professional, regardless of how the Reddit data is distributed! 🎉

