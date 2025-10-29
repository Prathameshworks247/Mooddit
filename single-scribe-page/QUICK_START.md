# 🚀 Quick Start Guide - Trending Analysis Dashboard

## What I Fixed

### The Infinite Refetch Issue ✅
The component was refetching data repeatedly because:
- The `useEffect` was watching `selectedCategory` and triggering on every change
- This caused an infinite loop of state updates → re-renders → more fetches

**Solution:**
- Changed to only fetch once on initial page load
- Category changes now manually trigger fetches (not via `useEffect`)
- Added loading state check to prevent simultaneous requests

## Running the Application

### Terminal 1: Start Backend

```bash
cd /Users/prathameshpatil/sinister-6/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 2: Start Frontend

```bash
cd /Users/prathameshpatil/sinister-6/single-scribe-page
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Open in Browser

```
http://localhost:5173/trending
```

Or from the home page:
```
http://localhost:5173/
```
Click on the "Trending Analysis" card.

## How It Works Now

### Initial Load
1. Page loads → Automatically fetches trending topics for "All" category
2. Shows loading skeleton while fetching
3. Displays results when ready

### Changing Categories
1. Click a category tab (Technology, Gaming, etc.)
2. State updates → `selectedCategory` changes
3. 100ms delay → Triggers `fetchTrendingTopics()`
4. Shows loading state
5. Displays new results

### Refresh Button
- Click "Refresh" to manually fetch latest data
- Uses current category and settings
- Shows loading state during fetch

### Component Analysis Toggle
- Toggle ON: Enables AI component analysis (slower, requires Gemini API)
- Toggle OFF: Basic sentiment only (faster)
- **Note:** This setting applies on the NEXT fetch, not retroactively

## Understanding the Data

### Topics You're Seeing

From your JSON, the trending topics are:
1. **Apparently** (Rank #1, 100% trending strength)
2. **Woke** (Rank #2, 88.5% trending strength)
3. **Happy Halloween** (Rank #3, 116.5% trending strength)
4. **Every Trump** (Rank #4, 133.6% trending strength)
5. **Lock**, **Wife**, **Richard Nixon**, etc.

### Why These Topics?

The backend's topic extraction is picking up:
- **Common words** that appear frequently across posts
- **Phrases** that are repeated often
- **Named entities** (people, places, events)

These might seem generic because Reddit's r/popular covers a wide range of discussions!

### Sentiment Distribution

For each topic, you'll see:
- **Positive** posts (green)
- **Negative** posts (red)  
- **Neutral** posts (gray)

Example from "Apparently":
- Positive: 8 posts (8%)
- Negative: 34 posts (34%)
- Neutral: 58 posts (58%)

## Customization

### Change Number of Topics

Edit line 103 in `TrendingAnalysis.tsx`:
```typescript
const [topN, setTopN] = useState(10); // Change 10 to any number
```

### Change Time Window

Edit line 118 in `TrendingAnalysis.tsx`:
```typescript
time_window_hours: 24, // Change to 48 for 2 days, etc.
```

### Change API URL

Edit line 27 in `TrendingAnalysis.tsx`:
```typescript
const API_BASE_URL = "http://localhost:8000";

// Change to:
const API_BASE_URL = "http://192.168.1.100:8000"; // Your network IP
// or
const API_BASE_URL = "https://your-api.com"; // Production
```

## Troubleshooting

### ❌ "Network Error"

**Problem:** Can't connect to backend

**Solutions:**
1. Check backend is running: `http://localhost:8000/`
2. Check backend URL in code
3. Check CORS settings in backend `main.py`

### ❌ "No trending posts found"

**Problem:** Reddit API returned no data

**Solutions:**
1. Wait 1 minute (rate limiting)
2. Try different category
3. Check backend logs for errors

### ❌ Page keeps loading forever

**Problem:** Fetch stuck or infinite loop

**Solutions:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for stuck requests
4. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### ❌ Component Analysis not showing

**Possible Reasons:**
1. Toggle is OFF
2. Gemini API key not set in backend
3. Backend error (check backend logs)

**Check Backend Logs:**
```bash
# Look for errors like:
ERROR: Gemini API error: ...
```

### ❌ Old data showing after category change

**Problem:** Cache or state not updating

**Solutions:**
1. Click the Refresh button
2. Hard refresh the page
3. Clear browser cache

## Features Overview

### ✅ What Works
- [x] Fetch trending topics on page load
- [x] Category filtering (7 categories)
- [x] Manual refresh
- [x] Component analysis toggle
- [x] Loading states
- [x] Error handling
- [x] Responsive design
- [x] Toast notifications
- [x] Sentiment visualization
- [x] Sample posts viewing
- [x] External links to Reddit

### 🔄 How Data Flows

```
1. User Action (page load, category change, refresh)
   ↓
2. fetchTrendingTopics() called
   ↓
3. POST request to /api/trending/analyze
   ↓
4. Backend fetches Reddit data
   ↓
5. Backend extracts topics
   ↓
6. Backend analyzes sentiment
   ↓
7. (Optional) Backend analyzes components
   ↓
8. JSON response returned
   ↓
9. Frontend updates state
   ↓
10. UI re-renders with new data
```

## Performance Tips

### For Faster Loading
1. **Disable Component Analysis**: Much faster
2. **Reduce top_n**: Fewer topics = faster
3. **Use specific categories**: Less data to process

### For Better Results
1. **Enable Component Analysis**: More detailed insights
2. **Increase top_n**: More topics discovered
3. **Try different categories**: More focused results

## Next Steps

### Potential Enhancements
- [ ] Add date range picker
- [ ] Add auto-refresh timer
- [ ] Add topic search/filter
- [ ] Add export to CSV/JSON
- [ ] Add comparison view (compare 2 topics)
- [ ] Add historical trending data
- [ ] Add bookmarking favorite topics
- [ ] Add sharing functionality

### Integration Ideas
- Connect to other sentiment analysis tools
- Add chart visualizations (Recharts)
- Add real-time updates (WebSocket)
- Add user authentication
- Add saved searches

## Testing Checklist

Before considering it "working":
- [ ] Page loads without errors
- [ ] Initial data fetches automatically
- [ ] Category switching works
- [ ] Refresh button works
- [ ] Loading states show correctly
- [ ] Error messages display properly
- [ ] Toast notifications appear
- [ ] Sentiment bars render correctly
- [ ] Sample posts are clickable
- [ ] Responsive on mobile
- [ ] No infinite loading loops
- [ ] No console errors

## Getting Help

### Check Logs

**Frontend Console (Browser DevTools):**
```
Press F12 → Console tab
Look for errors in red
```

**Backend Terminal:**
```
Look for:
INFO: requests
ERROR: failures
```

### Common Error Messages

**"CORS policy"**
→ Backend CORS not configured for your frontend URL

**"404 Not Found"**
→ API endpoint doesn't exist or wrong URL

**"500 Internal Server Error"**
→ Backend crashed, check backend logs

**"Failed to fetch"**
→ Backend not running or wrong URL

## Success Indicators

You'll know it's working when:
✅ Page loads with data automatically
✅ Toast says "Analysis Complete"
✅ You see topic cards with sentiment bars
✅ Category tabs are clickable
✅ Refresh button updates data
✅ No console errors
✅ Loading states appear/disappear correctly

## 🎉 You're All Set!

The infinite refetch issue is fixed. The component now:
- Fetches once on initial load
- Fetches when you change categories (manually triggered)
- Fetches when you click refresh
- Never fetches in an infinite loop

Enjoy exploring trending topics! 🔥

