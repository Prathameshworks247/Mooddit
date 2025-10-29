# Trending Analysis Frontend 🔥

## Overview

A beautiful, interactive React dashboard for visualizing trending topics and sentiment analysis from Reddit.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/prathameshpatil/sinister-6/single-scribe-page
npm install
```

### 2. Start Backend Server

```bash
cd /Users/prathameshpatil/sinister-6/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend

```bash
cd /Users/prathameshpatil/sinister-6/single-scribe-page
npm run dev
```

### 4. Open in Browser

```
http://localhost:5173/trending
```

## 📱 Features

### ✅ Implemented

- **Category Filtering**: 7 categories (All, Technology, Gaming, News, Entertainment, Sports, Science)
- **Real-time Data**: Fetch latest trending topics from Reddit
- **Sentiment Visualization**: Beautiful progress bars showing positive/negative/neutral sentiment
- **Component Analysis**: AI-powered breakdown of sentiment by components (requires Gemini)
- **Interactive Cards**: Expandable cards with detailed metrics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Skeleton loaders while fetching data
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Sample Posts**: View top posts for each trending topic
- **Subreddit Badges**: See where topics are trending
- **Trending Strength**: Visual indicator of how hot a topic is

### 🎨 UI Components

All components use shadcn/ui:
- Cards
- Badges
- Buttons
- Tabs
- Progress bars
- Skeleton loaders
- Scroll areas
- Alerts
- Switches
- Toast notifications

## 🎯 Usage

### Category Selection

Click any category tab to filter trending topics:
- 🌍 **All** - Everything from r/popular
- 💻 **Technology** - Tech news and gadgets
- 🎮 **Gaming** - Gaming news and releases
- 📰 **News** - World and local news
- 🎬 **Entertainment** - Movies, TV, music
- ⚽ **Sports** - Sports events and teams
- 🔬 **Science** - Science and space

### Component Analysis Toggle

Enable/disable AI-powered component analysis:
- **OFF** (faster): Basic sentiment analysis only
- **ON** (slower): Includes component-wise breakdown (camera, battery, price, etc.)

**Note:** Component analysis requires Gemini API key configured in backend.

### Refresh

Click the refresh button to fetch latest trending topics.

## 📊 What's Displayed

For each trending topic, you'll see:

### 📌 Header
- **Rank**: Position in trending (#1, #2, etc.)
- **Topic Name**: Main topic
- **Variants**: Alternative names/phrases
- **Trending Strength**: 0-100% indicator
- **Duration**: How long it's been trending

### 📈 Metrics
- **Posts**: Number of posts about this topic
- **Score**: Total Reddit karma
- **Comments**: Total comment count
- **Velocity**: Engagement per hour (trending momentum)

### 🏷️ Subreddits
- List of subreddits where the topic is trending
- Badge for each subreddit

### 💭 Sentiment Distribution
- **Positive**: Green progress bar with count and percentage
- **Negative**: Red progress bar with count and percentage
- **Neutral**: Gray progress bar with count and percentage

### 🔧 Component Analysis (if enabled)
- **Component Name**: e.g., "camera", "battery", "price"
- **Sentiment**: positive/negative/neutral/mixed
- **Confidence**: high/medium/low
- **Summary**: Brief description
- **Mention Count**: Approximate mentions

### 📝 Sample Posts
- Top 5 posts about the topic
- Post title (clickable link)
- Sentiment badge
- Upvote count

## 🔧 Configuration

### Change Backend URL

Edit `/src/pages/TrendingAnalysis.tsx`:

```typescript
// Line 27
const API_BASE_URL = "http://localhost:8000";

// Change to your backend URL:
const API_BASE_URL = "http://192.168.1.100:8000";  // Network
const API_BASE_URL = "https://your-api.com";        // Production
```

### Adjust Number of Topics

```typescript
// Line 90
const [topN, setTopN] = useState(10);

// Change to fetch more/fewer topics:
const [topN, setTopN] = useState(15);  // Fetch 15 topics
```

### Change Time Window

```typescript
// Line 107
time_window_hours: 24,

// Change to look further back:
time_window_hours: 48,  // Last 48 hours
```

## 🎨 Customization

### Colors

The design uses Tailwind CSS and shadcn/ui theming. To customize:

1. **Sentiment Colors**: Edit in `TrendingAnalysis.tsx`
   ```typescript
   // Line 153-163
   const getSentimentColor = (sentiment: string) => {
     switch (sentiment.toLowerCase()) {
       case "positive":
         return "bg-green-500/10 text-green-600 border-green-500/20";
       // Customize colors here
     }
   }
   ```

2. **Theme**: Edit `/src/index.css` for global theme changes

### Layout

The dashboard is fully responsive:
- **Desktop**: 7-column category tabs, side-by-side metrics
- **Tablet**: 4-column metrics grid
- **Mobile**: Stacked layout, simplified tabs

## 📱 Screenshots

### Desktop View
- Full category tabs with labels
- Multi-column metrics grid
- Expandable topic cards

### Mobile View
- Icon-only category tabs
- Stacked metrics
- Scrollable content

## 🐛 Troubleshooting

### "Network Error"

**Cause**: Backend not running or wrong URL

**Solutions**:
1. Start backend: `uvicorn main:app --reload`
2. Check URL in `API_BASE_URL`
3. Ensure CORS is enabled in backend

### "No trending posts found"

**Cause**: Reddit API issues or strict time window

**Solutions**:
1. Wait a minute and try again (rate limiting)
2. Increase time window in backend
3. Try different category

### Component Analysis Not Working

**Cause**: Gemini API not configured

**Solutions**:
1. Set `GEMINI_API_KEY` in backend `.env`
2. Or disable component analysis toggle

### Blank Page / Build Errors

**Cause**: Missing dependencies

**Solutions**:
```bash
npm install
npm run dev
```

## 🔐 CORS Setup

If accessing from different domain, ensure backend has CORS enabled:

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Performance Tips

1. **Disable Component Analysis**: Faster response times
2. **Reduce Top N**: Fewer topics = faster load
3. **Cache Results**: Implement client-side caching for repeated requests
4. **Lazy Load**: Load component analysis on demand

## 📦 Build for Production

```bash
# Build
npm run build

# Preview
npm run preview

# Deploy dist/ folder to your hosting service
```

## 🔄 Future Enhancements

Possible additions:
- [ ] Auto-refresh every X minutes
- [ ] Bookmark favorite topics
- [ ] Share trending topic cards
- [ ] Export data to CSV/JSON
- [ ] Dark/Light mode toggle
- [ ] Historical trending data
- [ ] Comparison mode (compare topics)
- [ ] Advanced filters (velocity range, sentiment range)
- [ ] Search within trending topics

## 🎯 API Integration

### Request Format

```typescript
POST /api/trending/analyze

{
  "time_window_hours": 24,
  "top_n": 10,
  "category": "technology",
  "analyze_sentiment": true,
  "analyze_components": true
}
```

### Response Format

```typescript
{
  "trending_topics": [
    {
      "topic_info": {
        "topic": "iPhone 17",
        "rank": 1,
        "post_count": 45,
        "trending_strength": 100.0,
        // ... more fields
      },
      "sentiment_analysis": {
        "positive": 120,
        "negative": 35,
        "neutral": 180
      },
      "component_analysis": [...],
      "sample_posts": [...]
    }
  ],
  "total_topics_found": 10,
  "analysis_time": "2025-10-29T14:30:00",
  "time_window_hours": 24,
  "category": "technology"
}
```

## 🛠️ Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **Lucide React**: Icons
- **React Router**: Routing
- **Tanstack Query**: Data fetching (ready for use)

## 📚 Component Structure

```
src/
├── pages/
│   ├── TrendingAnalysis.tsx    # Main dashboard page
│   ├── Index.tsx                # Home page with navigation
│   └── ...
├── components/
│   └── ui/                      # shadcn/ui components
├── App.tsx                      # Router setup
└── main.tsx                     # Entry point
```

## 💡 Tips

1. **Start Simple**: Disable component analysis for faster testing
2. **Monitor Console**: Check for API errors
3. **Use Categories**: More focused results than "all"
4. **Check Backend Logs**: Debug API issues server-side
5. **Mobile First**: Test on mobile for best experience

## 🎉 You're Ready!

```bash
# Terminal 1: Backend
cd backend && uvicorn main:app --reload

# Terminal 2: Frontend
cd single-scribe-page && npm run dev

# Open: http://localhost:5173/trending
```

Enjoy exploring trending topics! 🔥

