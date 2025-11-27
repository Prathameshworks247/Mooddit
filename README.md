# MOODDIT 🚀

A full-stack application for analyzing Reddit sentiment with AI-powered insights, trend predictions, and real-time visualization.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Configuration](#configuration)

---

## 🎯 Overview

This platform scrapes Reddit posts, analyzes sentiment using state-of-the-art NLP models, and provides:
- **Real-time sentiment analysis** with RoBERTa transformer model
- **AI-powered Q&A** using Google Gemini with RAG (Retrieval Augmented Generation)
- **Trend prediction** using machine learning time-series forecasting
- **Trending topics discovery** with automatic ranking and analysis
- **Interactive visualizations** with Recharts
- **Component-wise sentiment breakdown** (e.g., camera, battery for "iPhone 17")

---

## ✨ Features

### Backend (FastAPI)
- 🔍 **Reddit Scraper**: Fetch posts from Reddit with custom queries
- 🧠 **Sentiment Analysis**: RoBERTa-based sentiment classification
- 📊 **Chart Data API**: Time-series data optimized for Recharts
- 🤖 **RAG Endpoint**: AI-powered Q&A with Google Gemini
- 🔮 **Sentiment Prediction**: ML-based future trend forecasting
- 🔥 **Trending Topics**: Automatic discovery and analysis of trending topics
- 🌐 **CORS Enabled**: Network access from any device
- 📁 **CSV Export**: Save analysis results

### Frontend (React + TypeScript)
- 💬 **Chat Interface**: Conversational AI for sentiment queries
- 📈 **Interactive Charts**: 4 types of visualizations (pie, line, area charts)
- 🔮 **Prediction Modal**: View future sentiment predictions
- 🎨 **Dark Theme UI**: Modern, sleek design with Tailwind CSS
- 🔥 **Trending Dashboard**: Multi-category trending analysis
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Smart Caching**: Prevents unnecessary refetches

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Index   │  │   Main   │  │ Trending │  │ Charts  ││
│  │   Page   │  │ Chat Page│  │ Analysis │  │ Sidebar ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  /analyze│  │  /charts │  │   /rag   │  │ /predict││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│  ┌──────────┐                                           │
│  │/trending │                                           │
│  └──────────┘                                           │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌──────────┐     ┌──────────┐
   │ Reddit  │      │  RoBERTa │     │  Gemini  │
   │   API   │      │  Model   │     │   API    │
   └─────────┘      └──────────┘     └──────────┘
```

### Data Flow

```
1. User Query → Frontend
2. Frontend → Backend API (POST request)
3. Backend → Reddit API (fetch posts)
4. Backend → RoBERTa Model (sentiment analysis)
5. Backend → Google Gemini (optional: RAG/component analysis)
6. Backend → scikit-learn (optional: predictions)
7. Backend → Frontend (JSON response)
8. Frontend → Charts/UI (render data)
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.8+ | Core language |
| FastAPI | 0.109.0 | Web framework |
| Pydantic | 2.5.3 | Data validation |
| Pandas | 2.1.4 | Data manipulation |
| NumPy | 1.26.3 | Numerical operations |
| Transformers | 4.36.2 | NLP models (RoBERTa) |
| PyTorch | 2.2.2 | Deep learning backend |
| scikit-learn | 1.4.0 | ML predictions |
| google-generativeai | latest | Gemini AI integration |
| Uvicorn | 0.27.0 | ASGI server |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3+ | UI framework |
| TypeScript | 5.0+ | Type safety |
| Vite | 5.0+ | Build tool |
| Tailwind CSS | 3.4+ | Styling |
| Recharts | 2.13+ | Data visualization |
| shadcn/ui | latest | UI components |
| Axios | 1.7+ | HTTP client |
| React Router | 6.28+ | Routing |

---

## 📁 Project Structure

```
sinister-6/
├── backend/                          # FastAPI Backend
│   ├── main.py                       # Main API application
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables (API keys)
│   ├── src/
│   │   ├── __init__.py
│   │   ├── reddit_scraper.py         # Reddit data fetching
│   │   ├── sentiment_analysis.py    # RoBERTa sentiment model
│   │   ├── sentiment_predictor.py   # ML prediction models
│   │   ├── trending_discovery.py    # Trending posts fetcher
│   │   ├── topic_extractor.py       # Topic extraction & ranking
│   │   └── utils.py                 # Utility functions
│   ├── data/
│   │   ├── processed/               # CSV exports
│   │   └── raw/                     # Raw scraped data
│   ├── test_prediction.py           # Prediction API test
│   ├── test_trending.py             # Trending API test
│   └── README.md                    # Backend documentation
│
├── single-scribe-page/              # Main Frontend (React + TS)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx            # Landing page
│   │   │   ├── Main.tsx             # Chat interface
│   │   │   └── TrendingAnalysis.tsx # Trending dashboard
│   │   ├── components/
│   │   │   ├── used/
│   │   │   │   ├── sidebar.tsx      # Charts sidebar
│   │   │   │   └── charts/          # Chart components
│   │   │   │       ├── SentimentDistributionPieChart.tsx
│   │   │   │       ├── SentimentTrendChart.tsx
│   │   │   │       ├── PostsOverTimeChart.tsx
│   │   │   │       └── SentimentBreakdownLineChart.tsx
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── App.tsx                  # App router
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json                 # Node dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.ts           # Tailwind configuration
│   └── README.md                    # Frontend documentation
│
├── frontend/                         # Legacy frontend (backup)
├── frontend-2/                       # Alternative frontend (backup)
└── README.md                         # This file
```

---

## 🚀 Installation

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 18.0 or higher
- **npm** or **yarn**
- **Git**

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file
cp .env.example .env

# 6. Add your Google Gemini API key to .env
# GEMINI_API_KEY=your_api_key_here

# 7. Run the server
python main.py
# Or with uvicorn:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will run on**: `http://localhost:8000`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd single-scribe-page

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

**Frontend will run on**: `http://localhost:8080`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000
```

### Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/analyze` | POST | Full sentiment analysis |
| `/api/charts` | POST | Chart data for visualization |
| `/api/rag` | POST | AI-powered Q&A |
| `/api/predict` | POST | Sentiment trend prediction |
| `/api/trending/analyze` | POST | Trending topics analysis |

### 1. Sentiment Analysis

**POST** `/api/analyze`

```json
{
  "query": "iPhone 17",
  "limit": 300,
  "time_window_hours": 48,
  "interval_hours": 3
}
```

**Response:**
```json
{
  "query": "iPhone 17",
  "total_posts": 248,
  "sentiment_summary": {
    "positive": 42,
    "negative": 35,
    "neutral": 171
  },
  "time_series": [...],
  "posts": [...]
}
```

### 2. Chart Data

**POST** `/api/charts`

```json
{
  "query": "iPhone 17",
  "limit": 300,
  "time_window_hours": 48,
  "interval_hours": 3,
  "trim_empty_intervals": true
}
```

**Response:**
```json
{
  "query": "iPhone 17",
  "total_posts": 248,
  "sentiment_distribution": [...],
  "sentiment_over_time": [...],
  "posts_over_time": [...],
  "sentiment_posts_over_time": [...]
}
```

### 3. RAG Q&A

**POST** `/api/rag`

```json
{
  "query": "iPhone 17",
  "question": "What do people think about the camera?",
  "limit": 100,
  "time_window_hours": 48,
  "include_context": true
}
```

**Response:**
```json
{
  "query": "iPhone 17",
  "question": "What do people think about the camera?",
  "answer": "Based on the Reddit posts...",
  "confidence": "high",
  "component_analysis": [...],
  "source_posts": [...]
}
```

### 4. Sentiment Prediction

**POST** `/api/predict`

```json
{
  "query": "iPhone 17",
  "time_window_hours": 48,
  "hours_ahead": 12,
  "interval_hours": 3,
  "method": "hybrid"
}
```

**Response:**
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
  "historical_summary": {...}
}
```

### 5. Trending Topics

**POST** `/api/trending/analyze`

```json
{
  "time_window_hours": 24,
  "top_n": 10,
  "category": "technology",
  "analyze_sentiment": true,
  "analyze_components": true
}
```

**Response:**
```json
{
  "trending_topics": [
    {
      "topic_info": {
        "topic": "iPhone 17",
        "rank": 1,
        "post_count": 45,
        "trending_strength": 100.0
      },
      "sentiment_analysis": {...},
      "component_analysis": [...]
    }
  ]
}
```

---

## 🎮 Usage

### 1. Landing Page
- Navigate to `http://localhost:8080`
- Click "Trending Analysis" to explore trending topics

### 2. Chat Interface (Main Page)
- Enter a topic (e.g., "iPhone 17")
- Ask questions about sentiment
- Click "Predict Trends" for future sentiment forecasts
- Open sidebar (☰) to view interactive charts

### 3. Trending Analysis
- Switch between categories (Technology, Gaming, News, etc.)
- View sentiment distribution with pie charts
- Explore trending metrics (velocity, post count, score)
- Analyze component-wise sentiment

### 4. Charts Sidebar
- Click the menu icon (☰) in the chat interface
- View 4 types of charts:
  - Sentiment Distribution (Pie)
  - Posts Over Time (Line)
  - Sentiment Trend (Line)
  - Sentiment Breakdown (Multi-line)

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Google Gemini API Key (Required for RAG features)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional configurations
API_PORT=8000
DEBUG=True
```

### API Configuration

Edit `backend/main.py` for:
- CORS settings
- Rate limiting
- Model configurations

### Frontend Configuration

Edit `single-scribe-page/src/` files:
- API base URL (default: `http://localhost:8000`)
- Theme colors in `tailwind.config.ts`
- Component styling in individual files

---

## 🎨 Features Breakdown

### Sentiment Analysis
- **Model**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Classification**: Positive, Negative, Neutral
- **Confidence Scores**: Provided for each prediction

### Prediction Methods
1. **Linear Regression**: Fits trend line to historical data
2. **Moving Average**: Weighted average with trend detection
3. **Hybrid**: Combines both methods (recommended)

### Trending Discovery
- **Velocity Scoring**: Engagement per hour
- **Multi-subreddit**: Tracks topics across subreddits
- **Keyword Extraction**: Automatic topic identification
- **Ranking**: Based on engagement, recency, and spread

### RAG (Retrieval Augmented Generation)
- **Model**: Google Gemini 2.0 Flash
- **Context Window**: Last 48 hours of posts
- **Component Analysis**: Automatic aspect extraction
- **Conversational**: Maintains context for follow-ups

---

## 🔧 Development

### Backend Development

```bash
# Run with auto-reload
uvicorn main:app --reload

# Run tests
python test_prediction.py
python test_trending.py

# Format code
black .
isort .

# Type checking
mypy .
```

### Frontend Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## 📊 Data Models

### Sentiment Analysis Response
```typescript
interface SentimentAnalysis {
  query: string;
  total_posts: number;
  sentiment_summary: {
    positive: number;
    negative: number;
    neutral: number;
  };
  time_series: TimeSeriesPoint[];
  posts: Post[];
}
```

### Chart Data Response
```typescript
interface ChartData {
  query: string;
  total_posts: number;
  sentiment_distribution: SentimentDistribution[];
  sentiment_over_time: SentimentOverTime[];
  posts_over_time: PostsOverTime[];
  sentiment_posts_over_time: SentimentPostsOverTime[];
}
```

### Prediction Response
```typescript
interface PredictionResponse {
  query: string;
  predictions: PredictionPoint[];
  historical_summary: HistoricalSummary;
  prediction_method: string;
}
```

---

## 🐛 Troubleshooting

### Backend Issue

**Issue**: `ModuleNotFoundError: No module named 'google.generativeai'`
```bash
pip install google-generativeai python-dotenv
```

**Issue**: SSL Certificate Error (macOS)
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org <package>
```

**Issue**: CORS Error
- Ensure backend is running on `0.0.0.0`
- Check firewall settings
- Verify frontend API URL matches backend

### Frontend Issues

**Issue**: Charts not loading
- Check if backend is running
- Verify API endpoint URLs
- Check browser console for errors

**Issue**: Blank page after reopening sidebar
- Clear browser cache
- Restart development server

---

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- **Reddit API**: Data source
- **Hugging Face**: RoBERTa model
- **Google Gemini**: AI capabilities
- **Recharts**: Visualization library
- **shadcn/ui**: UI components
- **FastAPI**: Backend framework

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI, React, and AI**

