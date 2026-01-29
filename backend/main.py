from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
import traceback
import pandas as pd
from datetime import datetime, timedelta
from src.reddit_scraper import fetch_reddit_posts
from src.sentiment_analysis import analyze_sentiment, SENTIMENT_BACKEND
from src.trending_discovery import get_trending_by_category, get_trending_posts_with_scores
from src.topic_extractor import extract_top_trending_topics
from src.sentiment_predictor import predict_sentiment
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)
    # Use Gemini 1.5 Flash (fastest free model)
    # Updated model name for current API
    gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
else:
    gemini_model = None

app = FastAPI(
    title="Reddit Sentiment Analysis API",
    description="API for analyzing sentiment of Reddit posts",
    version="1.0.0"
)

# Enable CORS - Allow access from any device on the network
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers to the client
)

# Request/Response Models
class AnalysisRequest(BaseModel):
    query: str = Field(..., description="Topic to analyze", min_length=1)
    limit: int = Field(default=300, description="Number of posts to fetch", ge=10, le=1000)
    time_window_hours: int = Field(default=48, description="Time window in hours", ge=1, le=168)
    interval_hours: int = Field(default=3, description="Interval for grouping in hours", ge=1, le=24)
    trim_empty_intervals: bool = Field(default=True, description="Remove empty intervals from start/end")

class PostData(BaseModel):
    title: str
    url: str
    selftext: str
    created_utc: str
    score: int
    subreddit: str
    sentiment_label: str
    sentiment_score: int

class TimeSeriesPoint(BaseModel):
    timestamp: str
    sentiment_value: Optional[int]

class SentimentSummary(BaseModel):
    positive: int = 0
    negative: int = 0
    neutral: int = 0

class AnalysisResponse(BaseModel):
    query: str
    total_posts: int
    posts_in_timeframe: int
    sentiment_summary: SentimentSummary
    time_series: List[TimeSeriesPoint]
    posts: List[PostData]
    csv_path: str

# Chart-specific models
class SentimentDistribution(BaseModel):
    name: str
    value: int
    percentage: float

class SentimentOverTime(BaseModel):
    timestamp: str
    date: str
    time: str
    average_sentiment: float
    positive_count: int
    negative_count: int
    neutral_count: int
    total_posts: int

class PostsOverTime(BaseModel):
    timestamp: str
    date: str
    time: str
    posts: int

class SentimentPostsOverTime(BaseModel):
    timestamp: str
    date: str
    time: str
    positive: int
    negative: int
    neutral: int

class ChartDataResponse(BaseModel):
    query: str
    total_posts: int
    time_window_hours: int
    actual_time_range_hours: float
    first_post_time: Optional[str]
    last_post_time: Optional[str]
    sentiment_distribution: List[SentimentDistribution]
    sentiment_over_time: List[SentimentOverTime]
    posts_over_time: List[PostsOverTime]
    sentiment_posts_over_time: List[SentimentPostsOverTime]

# RAG-specific models
class ConversationTurn(BaseModel):
    question: str = Field(..., description="Previous question asked")
    answer: str = Field(..., description="Previous answer given")
    components: Optional[List[str]] = Field(default=None, description="Components mentioned in this turn")

class RAGRequest(BaseModel):
    query: str = Field(..., description="Topic to analyze from Reddit", min_length=1)
    question: str = Field(..., description="Question to ask about the data", min_length=1)
    limit: int = Field(default=100, description="Number of posts to fetch", ge=10, le=500)
    time_window_hours: int = Field(default=48, description="Time window in hours", ge=1, le=168)
    include_context: bool = Field(default=True, description="Include source posts in response")
    conversation_history: Optional[List[ConversationTurn]] = Field(
        default=None, 
        description="Previous Q&A pairs for context-aware follow-up questions"
    )

class ComponentSentiment(BaseModel):
    component: str = Field(..., description="Component or aspect name")
    sentiment: str = Field(..., description="Overall sentiment (positive/negative/neutral/mixed)")
    confidence: str = Field(..., description="Confidence level (high/medium/low)")
    summary: str = Field(..., description="Brief summary of sentiment")
    mention_count: int = Field(..., description="Number of posts mentioning this component")

class SourcePost(BaseModel):
    title: str
    url: str
    sentiment: str
    selftext: str
    score: int
    created_utc: str

class RAGResponse(BaseModel):
    query: str
    question: str
    answer: str
    confidence: str
    total_posts_analyzed: int
    sentiment_summary: SentimentSummary
    component_analysis: Optional[List[ComponentSentiment]] = None
    time_range: str
    source_posts: Optional[List[SourcePost]] = None
    model_used: str
    conversation_turn: Optional[ConversationTurn] = Field(
        default=None,
        description="Current Q&A turn to add to conversation history for next request"
    )

# Trending-specific models
class TrendingTopicInfo(BaseModel):
    topic: str = Field(..., description="Topic name")
    rank: int = Field(..., description="Trending rank")
    post_count: int = Field(..., description="Number of posts about this topic")
    total_score: int = Field(..., description="Total Reddit score")
    total_comments: int = Field(..., description="Total comments")
    avg_velocity: float = Field(..., description="Average velocity (engagement per hour)")
    topic_score: float = Field(..., description="Calculated trending score")
    trending_strength: float = Field(..., description="Normalized trending strength (0-100)")
    subreddits: List[str] = Field(..., description="Subreddits where topic is trending")
    subreddit_count: int = Field(..., description="Number of subreddits")
    variants: Optional[List[str]] = Field(default=None, description="Topic name variations")

class TrendingTopicAnalysis(BaseModel):
    topic_info: TrendingTopicInfo
    sentiment_analysis: SentimentSummary
    component_analysis: Optional[List[ComponentSentiment]] = None
    key_insights: Optional[str] = None
    trending_duration_hours: Optional[float] = None
    sample_posts: List[SourcePost]

class TrendingRequest(BaseModel):
    time_window_hours: int = Field(default=24, description="Time window for trending posts", ge=1, le=168)
    top_n: int = Field(default=10, description="Number of top topics to analyze", ge=1, le=20)
    category: str = Field(default="all", description="Category (all, technology, gaming, news, etc.)")
    min_posts: int = Field(default=2, description="Minimum posts for a topic", ge=1)
    analyze_sentiment: bool = Field(default=True, description="Perform full sentiment analysis")
    analyze_components: bool = Field(default=True, description="Perform component analysis using RAG")

class TrendingResponse(BaseModel):
    trending_topics: List[TrendingTopicAnalysis]
    total_topics_found: int
    analysis_time: str
    time_window_hours: int
    category: str

# Prediction-specific models
class PredictionPoint(BaseModel):
    timestamp: str = Field(..., description="Predicted timestamp")
    hours_ahead: int = Field(..., description="Hours ahead from current time")
    predicted_sentiment_score: float = Field(..., description="Predicted sentiment score (-1 to 1)")
    predicted_sentiment_ratio: float = Field(..., description="Predicted sentiment ratio")
    predicted_sentiment: str = Field(..., description="Predicted overall sentiment")
    confidence: float = Field(..., description="Prediction confidence (0-1)")

class HistoricalSummary(BaseModel):
    total_posts_analyzed: int
    time_range_hours: float
    current_sentiment: Dict[str, float]
    average_sentiment: Dict[str, float]
    trend: str

class PredictionRequest(BaseModel):
    query: str = Field(..., description="Topic to analyze", min_length=1)
    limit: int = Field(default=300, description="Number of posts to fetch", ge=10, le=1000)
    time_window_hours: int = Field(default=48, description="Historical time window in hours", ge=6, le=168)
    hours_ahead: int = Field(default=12, description="Hours to predict ahead", ge=3, le=48)
    interval_hours: int = Field(default=3, description="Interval for predictions in hours", ge=1, le=6)
    method: str = Field(default="hybrid", description="Prediction method: linear, moving_average, or hybrid")

class PredictionResponse(BaseModel):
    query: str
    predictions: List[PredictionPoint]
    historical_summary: HistoricalSummary
    prediction_method: str
    interval_hours: int
    generated_at: str

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Reddit Sentiment Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/api/analyze (POST) - Full sentiment analysis with posts",
            "charts": "/api/charts (POST) - Chart data optimized for Recharts",
            "rag": "/api/rag (POST) - Ask questions about Reddit sentiment data (AI-powered)",
            "trending": "/api/trending/analyze (POST) - Discover and analyze trending topics",
            "predict": "/api/predict (POST) - Predict future sentiment trends",
            "health": "/health (GET) - Health check"
        },
        "features": {
            "sentiment_analysis": True,
            "time_series_charts": True,
            "rag_qa": gemini_model is not None,
            "component_analysis": gemini_model is not None,
            "trending_discovery": True,
            "sentiment_prediction": True
        },
        "gemini_configured": gemini_model is not None,
        "sentiment_backend": SENTIMENT_BACKEND
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_sentiment_endpoint(request: AnalysisRequest):
    """
    Analyze sentiment of Reddit posts for a given query
    
    - **query**: Topic to search for on Reddit
    - **limit**: Maximum number of posts to fetch (10-1000)
    - **time_window_hours**: Time window to analyze (1-168 hours)
    - **interval_hours**: Grouping interval for time series (1-24 hours)
    """
    try:
        # Step 1: Fetch Reddit posts
        posts_df = fetch_reddit_posts(request.query, limit=request.limit)
        
        if posts_df.empty:
            raise HTTPException(status_code=404, detail="No posts found for the given query")
        
        posts_df["created_utc"] = pd.to_datetime(posts_df["created_utc"], unit="s")
        
        # Filter to specified time window
        time_cutoff = datetime.utcnow() - timedelta(hours=request.time_window_hours)
        filtered_df = posts_df[posts_df["created_utc"] >= time_cutoff]
        
        if filtered_df.empty:
            raise HTTPException(
                status_code=404, 
                detail=f"No posts found in the last {request.time_window_hours} hours"
            )
        
        # Step 2: Sentiment analysis
        filtered_df["sentiment_label"], filtered_df["sentiment_score"] = zip(
            *filtered_df["title"].apply(analyze_sentiment)
        )
        
        # Count sentiment distribution
        sentiment_counts = filtered_df["sentiment_label"].value_counts().to_dict()
        
        # Normalize sentiment labels
        sentiment_summary = SentimentSummary()
        for label, count in sentiment_counts.items():
            label_lower = label.lower()
            if label_lower in ["positive", "label_2"]:
                sentiment_summary.positive += count
            elif label_lower in ["negative", "label_0"]:
                sentiment_summary.negative += count
            else:
                sentiment_summary.neutral += count
        
        # Step 3: Group into time intervals
        time_series_df = filtered_df.sort_values("created_utc").set_index("created_utc")
        time_bins = pd.date_range(
            start=time_cutoff, 
            end=datetime.utcnow(), 
            freq=f"{request.interval_hours}H"
        )
        
        grouped_data = []
        for i in range(len(time_bins) - 1):
            start, end = time_bins[i], time_bins[i + 1]
            subset = time_series_df[(time_series_df.index >= start) & (time_series_df.index < end)]
            
            if subset.empty:
                sentiment_val = None
            else:
                # Ignore neutral sentiments for dominant calculation
                filtered_subset = subset[
                    subset["sentiment_label"].str.lower().isin(["positive", "negative", "label_2", "label_0"])
                ]
                if filtered_subset.empty:
                    sentiment_val = None
                else:
                    dominant = filtered_subset["sentiment_label"].value_counts().idxmax()
                    label_lower = dominant.lower()
                    if label_lower in ["positive", "label_2"]:
                        sentiment_val = 1
                    elif label_lower in ["negative", "label_0"]:
                        sentiment_val = -1
                    else:
                        sentiment_val = 0
            
            grouped_data.append({
                "timestamp": start.isoformat(),
                "sentiment_value": sentiment_val
            })
        
        # Forward fill missing values
        sentiment_df = pd.DataFrame(grouped_data)
        if not sentiment_df.empty:
            sentiment_df["sentiment_value"] = sentiment_df["sentiment_value"].fillna(method="ffill").fillna(0)
            time_series = [
                TimeSeriesPoint(**row) for row in sentiment_df.to_dict('records')
            ]
        else:
            time_series = []
        
        # Step 4: Save data
        os.makedirs("data/processed", exist_ok=True)
        csv_filename = f"reddit_{request.query.replace(' ', '_')}_{request.time_window_hours}h.csv"
        csv_path = os.path.join("data/processed", csv_filename)
        filtered_df.to_csv(csv_path, index=False)
        
        # Prepare posts data
        filtered_df_reset = filtered_df.reset_index(drop=True)
        posts_data = []
        for _, row in filtered_df_reset.iterrows():
            posts_data.append(PostData(
                title=row["title"],
                url=row["url"],
                selftext=row["selftext"],
                created_utc=row["created_utc"].isoformat(),
                score=int(row["score"]),
                subreddit=row["subreddit"],
                sentiment_label=row["sentiment_label"],
                sentiment_score=int(row["sentiment_score"])
            ))
        
        # Return response
        return AnalysisResponse(
            query=request.query,
            total_posts=len(posts_df),
            posts_in_timeframe=len(filtered_df),
            sentiment_summary=sentiment_summary,
            time_series=time_series,
            posts=posts_data,
            csv_path=csv_path
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/charts", response_model=ChartDataResponse)
async def get_chart_data(request: AnalysisRequest):
    """
    Get data optimized for Recharts visualization
    
    Returns 4 datasets for charts:
    1. Sentiment Distribution - Total positive, negative, neutral counts
    2. Sentiment Over Time - Average sentiment and counts over time periods
    3. Posts Over Time - Total post count over time periods
    4. Sentiment Posts Over Time - Positive/negative/neutral posts over time
    
    - **query**: Topic to search for on Reddit
    - **limit**: Maximum number of posts to fetch (10-1000)
    - **time_window_hours**: Time window in hours (1-168 hours)
    - **interval_hours**: Grouping interval for time series (1-24 hours)
    - **trim_empty_intervals**: Remove empty intervals from start/end (default: True)
    """
    try:
        # Step 1: Fetch Reddit posts
        posts_df = fetch_reddit_posts(request.query, limit=request.limit)
        
        if posts_df.empty:
            raise HTTPException(status_code=404, detail="No posts found for the given query")
        
        posts_df["created_utc"] = pd.to_datetime(posts_df["created_utc"], unit="s")
        
        # Filter to specified time window
        time_cutoff = datetime.utcnow() - timedelta(hours=request.time_window_hours)
        filtered_df = posts_df[posts_df["created_utc"] >= time_cutoff]
        
        if filtered_df.empty:
            raise HTTPException(
                status_code=404, 
                detail=f"No posts found in the last {request.time_window_hours} hours"
            )
        
        # Step 2: Sentiment analysis
        filtered_df["sentiment_label"], filtered_df["sentiment_score"] = zip(
            *filtered_df["title"].apply(analyze_sentiment)
        )
        
        # Normalize sentiment labels to positive/negative/neutral
        def normalize_label(label):
            label_lower = label.lower()
            if label_lower in ["positive", "label_2"]:
                return "positive"
            elif label_lower in ["negative", "label_0"]:
                return "negative"
            else:
                return "neutral"
        
        filtered_df["sentiment_normalized"] = filtered_df["sentiment_label"].apply(normalize_label)
        
        # Chart 1: Sentiment Distribution
        sentiment_counts = filtered_df["sentiment_normalized"].value_counts().to_dict()
        total_posts = len(filtered_df)
        
        sentiment_distribution = []
        for sentiment in ["positive", "negative", "neutral"]:
            count = sentiment_counts.get(sentiment, 0)
            sentiment_distribution.append(SentimentDistribution(
                name=sentiment.capitalize(),
                value=count,
                percentage=round((count / total_posts * 100) if total_posts > 0 else 0, 2)
            ))
        
        # Prepare time-based analysis
        time_series_df = filtered_df.sort_values("created_utc").copy()
        time_bins = pd.date_range(
            start=time_cutoff, 
            end=datetime.utcnow(), 
            freq=f"{request.interval_hours}H"
        )
        
        sentiment_over_time_data = []
        posts_over_time_data = []
        sentiment_posts_over_time_data = []
        
        for i in range(len(time_bins) - 1):
            start, end = time_bins[i], time_bins[i + 1]
            subset = time_series_df[
                (time_series_df["created_utc"] >= start) & 
                (time_series_df["created_utc"] < end)
            ]
            
            # Format timestamps for display
            timestamp_iso = start.isoformat()
            date_str = start.strftime("%Y-%m-%d")
            time_str = start.strftime("%H:%M")
            
            # Chart 2: Sentiment Over Time (Average sentiment)
            if not subset.empty:
                pos_count = len(subset[subset["sentiment_normalized"] == "positive"])
                neg_count = len(subset[subset["sentiment_normalized"] == "negative"])
                neu_count = len(subset[subset["sentiment_normalized"] == "neutral"])
                total = len(subset)
                
                # Calculate average sentiment (-1 to 1 scale)
                avg_sentiment = (pos_count - neg_count) / total if total > 0 else 0
                
                sentiment_over_time_data.append(SentimentOverTime(
                    timestamp=timestamp_iso,
                    date=date_str,
                    time=time_str,
                    average_sentiment=round(avg_sentiment, 3),
                    positive_count=pos_count,
                    negative_count=neg_count,
                    neutral_count=neu_count,
                    total_posts=total
                ))
                
                # Chart 3: Posts Over Time
                posts_over_time_data.append(PostsOverTime(
                    timestamp=timestamp_iso,
                    date=date_str,
                    time=time_str,
                    posts=total
                ))
                
                # Chart 4: Sentiment Posts Over Time
                sentiment_posts_over_time_data.append(SentimentPostsOverTime(
                    timestamp=timestamp_iso,
                    date=date_str,
                    time=time_str,
                    positive=pos_count,
                    negative=neg_count,
                    neutral=neu_count
                ))
            else:
                # Add zero data points for empty intervals
                sentiment_over_time_data.append(SentimentOverTime(
                    timestamp=timestamp_iso,
                    date=date_str,
                    time=time_str,
                    average_sentiment=0,
                    positive_count=0,
                    negative_count=0,
                    neutral_count=0,
                    total_posts=0
                ))
                
                posts_over_time_data.append(PostsOverTime(
                    timestamp=timestamp_iso,
                    date=date_str,
                    time=time_str,
                    posts=0
                ))
                
                sentiment_posts_over_time_data.append(SentimentPostsOverTime(
                    timestamp=timestamp_iso,
                    date=date_str,
                    time=time_str,
                    positive=0,
                    negative=0,
                    neutral=0
                ))
        
        # Trim empty intervals from start and end if requested
        if request.trim_empty_intervals:
            # Find first and last non-zero interval
            first_non_zero = None
            last_non_zero = None
            
            for i, item in enumerate(posts_over_time_data):
                if item.posts > 0:
                    if first_non_zero is None:
                        first_non_zero = i
                    last_non_zero = i
            
            if first_non_zero is not None and last_non_zero is not None:
                # Trim all three time series data
                sentiment_over_time_data = sentiment_over_time_data[first_non_zero:last_non_zero + 1]
                posts_over_time_data = posts_over_time_data[first_non_zero:last_non_zero + 1]
                sentiment_posts_over_time_data = sentiment_posts_over_time_data[first_non_zero:last_non_zero + 1]
        
        # Calculate actual time range
        first_post_time = filtered_df["created_utc"].min()
        last_post_time = filtered_df["created_utc"].max()
        actual_time_range = (last_post_time - first_post_time).total_seconds() / 3600  # hours
        
        # Return chart data
        return ChartDataResponse(
            query=request.query,
            total_posts=total_posts,
            time_window_hours=request.time_window_hours,
            actual_time_range_hours=round(actual_time_range, 2),
            first_post_time=first_post_time.isoformat(),
            last_post_time=last_post_time.isoformat(),
            sentiment_distribution=sentiment_distribution,
            sentiment_over_time=sentiment_over_time_data,
            posts_over_time=posts_over_time_data,
            sentiment_posts_over_time=sentiment_posts_over_time_data
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/rag", response_model=RAGResponse)
async def ask_question_about_sentiment(request: RAGRequest):
    """
    Ask questions about Reddit sentiment data using RAG with Gemini AI
    
    This endpoint:
    1. Fetches Reddit posts about your query
    2. Analyzes their sentiment
    3. Uses Google Gemini AI to answer your question based on the data
    
    - **query**: Topic to search on Reddit (e.g., "iPhone 17")
    - **question**: Question to ask about the sentiment data (e.g., "What are people saying about the camera?")
    - **limit**: Number of posts to analyze (10-500)
    - **time_window_hours**: Time window for posts (1-168 hours)
    - **include_context**: Include source posts in response
    """
    try:
        # Check if Gemini is configured
        if gemini_model is None:
            raise HTTPException(
                status_code=503, 
                detail="Gemini API not configured. Please set GEMINI_API_KEY in .env file. Get your free key at https://makersuite.google.com/app/apikey"
            )
        
        # Step 1: Fetch Reddit posts
        posts_df = fetch_reddit_posts(request.query, limit=request.limit)
        
        if posts_df.empty:
            raise HTTPException(
                status_code=404,
                detail="No posts found for the given query. Reddit may be rate-limiting; try again in a few minutes.",
            )
        
        posts_df["created_utc"] = pd.to_datetime(posts_df["created_utc"], unit="s")
        
        # Filter to specified time window
        time_cutoff = datetime.utcnow() - timedelta(hours=request.time_window_hours)
        filtered_df = posts_df[posts_df["created_utc"] >= time_cutoff]
        
        if filtered_df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No posts found in the last {request.time_window_hours} hours. Try a longer time window or different query.",
            )
        
        # Step 2: Sentiment analysis
        filtered_df["sentiment_label"], filtered_df["sentiment_score"] = zip(
            *filtered_df["title"].apply(analyze_sentiment)
        )
        
        # Normalize sentiment labels
        def normalize_label(label):
            label_lower = label.lower()
            if label_lower in ["positive", "label_2"]:
                return "positive"
            elif label_lower in ["negative", "label_0"]:
                return "negative"
            else:
                return "neutral"
        
        filtered_df["sentiment_normalized"] = filtered_df["sentiment_label"].apply(normalize_label)
        
        # Count sentiment distribution
        sentiment_counts = filtered_df["sentiment_normalized"].value_counts().to_dict()
        sentiment_summary = SentimentSummary(
            positive=sentiment_counts.get("positive", 0),
            negative=sentiment_counts.get("negative", 0),
            neutral=sentiment_counts.get("neutral", 0)
        )
        
        # Step 3: Prepare context for RAG
        # Select top posts by score and diverse sentiments
        positive_posts = filtered_df[filtered_df["sentiment_normalized"] == "positive"].nlargest(10, "score")
        negative_posts = filtered_df[filtered_df["sentiment_normalized"] == "negative"].nlargest(10, "score")
        neutral_posts = filtered_df[filtered_df["sentiment_normalized"] == "neutral"].nlargest(5, "score")
        
        sample_posts = pd.concat([positive_posts, negative_posts, neutral_posts]).sort_values("score", ascending=False).head(30)
        
        # Build context for Gemini
        context_parts = [
            f"Reddit Sentiment Analysis Report for: {request.query}",
            f"Total posts analyzed: {len(filtered_df)}",
            f"Time period: Last {request.time_window_hours} hours",
            f"Sentiment breakdown: {sentiment_summary.positive} positive, {sentiment_summary.negative} negative, {sentiment_summary.neutral} neutral",
            "",
            "Sample of popular Reddit posts:",
            ""
        ]
        
        for idx, row in sample_posts.iterrows():
            selftext = row.get("selftext") if hasattr(row, "get") else getattr(row, "selftext", "")
            if selftext is None or (isinstance(selftext, float) and pd.isna(selftext)):
                selftext = ""
            selftext_snippet = f"- {str(selftext)[:200]}..." if selftext else ""
            context_parts.append(
                f"- [{row['sentiment_normalized'].upper()}] (Score: {row['score']}) \"{row['title']}\" "
                f"{selftext_snippet}"
            )
        
        context = "\n".join(context_parts)
        
        # Step 4: Generate answer using Gemini
        # Enhanced prompt for component-wise analysis
        
        # Build conversation history context if provided
        conversation_context = ""
        if request.conversation_history and len(request.conversation_history) > 0:
            conversation_context = "\n\nPrevious Conversation Context:\n"
            for i, turn in enumerate(request.conversation_history[-3:], 1):  # Keep last 3 turns
                q = (turn.question or "")[:500]
                a = (turn.answer or "")[:300]
                conversation_context += f"\nQ{i}: {q}\nA{i}: {a}...\n"
                if turn.components:
                    conversation_context += f"Components discussed: {', '.join(str(c) for c in turn.components)}\n"
            conversation_context += "\n[Use this context to understand follow-up questions and maintain conversation continuity]\n"
        
        prompt = f"""You are a Reddit sentiment analysis assistant. Based on the following Reddit data, please answer the user's question with detailed component-wise sentiment analysis.

{context}{conversation_context}

Current Question: {request.question}

Please provide:
1. A clear, direct answer to the question (if this is a follow-up question, reference previous context)
2. Identify key components/aspects being discussed (e.g., for "iPhone 17": camera, battery, display, price, design, performance, etc.)
3. For each component, analyze the sentiment and provide specific examples
4. Support your analysis with mentions from the posts
5. Keep your main response concise (2-3 paragraphs)
6. If the question references "it", "this", "that", or other pronouns, use the conversation context to understand what is being referenced

Then, provide a component breakdown in this JSON format at the end:

COMPONENT_ANALYSIS:
[
  {{
    "component": "component_name",
    "sentiment": "positive/negative/neutral/mixed",
    "confidence": "high/medium/low",
    "summary": "brief summary of sentiment for this component",
    "mention_count": number_of_mentions
  }}
]

Answer:"""
        
        try:
            response = gemini_model.generate_content(prompt)
            try:
                full_response = response.text or ""
            except (ValueError, AttributeError) as text_err:
                # Blocked/empty or unsupported response
                full_response = f"[Response not available: {getattr(text_err, 'message', str(text_err))}]"
            confidence = "high" if len(sample_posts) >= 20 else "medium" if len(sample_posts) >= 10 else "low"
            
            # Parse component analysis from response
            component_analysis = None
            answer = full_response
            
            if "COMPONENT_ANALYSIS:" in full_response:
                parts = full_response.split("COMPONENT_ANALYSIS:")
                answer = parts[0].strip()
                
                try:
                    import json
                    import re
                    # Extract JSON array from the response
                    json_match = re.search(r'\[(.*?)\]', parts[1], re.DOTALL)
                    if json_match:
                        json_str = '[' + json_match.group(1) + ']'
                        components_data = json.loads(json_str)
                        component_analysis = [
                            ComponentSentiment(**comp) for comp in components_data
                        ]
                except Exception as parse_error:
                    # If parsing fails, continue without component analysis
                    print(f"Could not parse component analysis: {parse_error}")
                    pass
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error generating response from Gemini: {str(e)}"
            )
        
        # Step 5: Prepare source posts if requested
        source_posts = None
        if request.include_context:
            source_posts = []
            for _, row in sample_posts.head(10).iterrows():
                selftext_val = row.get("selftext", "") if hasattr(row, "get") else getattr(row, "selftext", "")
                if selftext_val is None or (isinstance(selftext_val, float) and pd.isna(selftext_val)):
                    selftext_val = ""
                created = row["created_utc"]
                created_str = created.isoformat() if hasattr(created, "isoformat") else str(created)
                source_posts.append(SourcePost(
                    title=str(row["title"] or ""),
                    url=str(row["url"] or ""),
                    sentiment=str(row["sentiment_normalized"] or "neutral"),
                    selftext=str(selftext_val),
                    score=int(row["score"]) if row["score"] is not None and not (isinstance(row["score"], float) and pd.isna(row["score"])) else 0,
                    created_utc=created_str,
                ))
        
        # Calculate time range
        first_post = filtered_df["created_utc"].min()
        last_post = filtered_df["created_utc"].max()
        time_range = f"{first_post.strftime('%Y-%m-%d %H:%M')} to {last_post.strftime('%Y-%m-%d %H:%M')}"
        
        # Build conversation turn for next request
        current_components = None
        if component_analysis:
            current_components = [comp.component for comp in component_analysis]
        
        current_turn = ConversationTurn(
            question=request.question,
            answer=answer,
            components=current_components
        )
        
        return RAGResponse(
            query=request.query,
            question=request.question,
            answer=answer,
            confidence=confidence,
            total_posts_analyzed=len(filtered_df),
            sentiment_summary=sentiment_summary,
            component_analysis=component_analysis,
            time_range=time_range,
            source_posts=source_posts,
            model_used="gemini-2.0-flash-exp",
            conversation_turn=current_turn
        )
    
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/trending/analyze", response_model=TrendingResponse)
async def analyze_trending_topics(request: TrendingRequest):
    """
    Discover and analyze trending topics from Reddit
    
    This endpoint:
    1. Discovers trending posts from Reddit
    2. Extracts trending topics using keyword analysis
    3. Performs sentiment analysis on each topic
    4. (Optional) Performs component-wise analysis using RAG
    
    - **time_window_hours**: How far back to look (1-168 hours)
    - **top_n**: Number of topics to analyze (1-20)
    - **category**: Category filter (all, technology, gaming, news, etc.)
    - **min_posts**: Minimum posts required for a topic
    - **analyze_sentiment**: Perform sentiment analysis
    - **analyze_components**: Perform component analysis with RAG (requires Gemini)
    """
    try:
        # Step 1: Fetch trending posts from Reddit
        print(f"Fetching trending posts from Reddit (category: {request.category})...")
        trending_posts_df = get_trending_by_category(
            category=request.category,
            time_window_hours=request.time_window_hours,
            limit=100
        )
        
        if trending_posts_df.empty:
            raise HTTPException(
                status_code=404, 
                detail=f"No trending posts found in the last {request.time_window_hours} hours"
            )
        
        print(f"Found {len(trending_posts_df)} trending posts")
        
        # Step 2: Extract trending topics
        print("Extracting trending topics...")
        trending_topics = extract_top_trending_topics(
            trending_posts_df,
            top_n=request.top_n,
            min_posts=request.min_posts
        )
        
        if not trending_topics:
            raise HTTPException(
                status_code=404,
                detail="No trending topics extracted from posts"
            )
        
        print(f"Extracted {len(trending_topics)} trending topics")
        
        # Step 3: Analyze each trending topic
        analyzed_topics = []
        
        for topic_info in trending_topics:
            topic_name = topic_info['topic']
            print(f"Analyzing topic: {topic_name}")
            
            try:
                # Fetch posts for this specific topic
                topic_posts_df = fetch_reddit_posts(topic_name, limit=100)
                
                if topic_posts_df.empty:
                    print(f"  No posts found for {topic_name}, skipping...")
                    continue
                
                # Perform sentiment analysis
                sentiment_summary = None
                component_analysis = None
                sample_posts = []
                
                if request.analyze_sentiment:
                    # Analyze sentiment
                    topic_posts_df["sentiment_label"], topic_posts_df["sentiment_score"] = zip(
                        *topic_posts_df["title"].apply(analyze_sentiment)
                    )
                    
                    # Normalize labels
                    def normalize_label(label):
                        label_lower = label.lower()
                        if label_lower in ["positive", "label_2"]:
                            return "positive"
                        elif label_lower in ["negative", "label_0"]:
                            return "negative"
                        else:
                            return "neutral"
                    
                    topic_posts_df["sentiment_normalized"] = topic_posts_df["sentiment_label"].apply(normalize_label)
                    
                    # Count sentiments
                    sentiment_counts = topic_posts_df["sentiment_normalized"].value_counts().to_dict()
                    sentiment_summary = SentimentSummary(
                        positive=sentiment_counts.get("positive", 0),
                        negative=sentiment_counts.get("negative", 0),
                        neutral=sentiment_counts.get("neutral", 0)
                    )
                    
                    # Get sample posts
                    topic_posts_df["created_utc"] = pd.to_datetime(topic_posts_df["created_utc"], unit="s")
                    sample_posts_df = topic_posts_df.nlargest(5, "score")
                    sample_posts = [
                        SourcePost(
                            title=row["title"],
                            url=row["url"],
                            sentiment=row["sentiment_normalized"],
                            selftext=row.get("selftext", ""),
                            score=int(row["score"]),
                            created_utc=row["created_utc"].isoformat()
                        )
                        for _, row in sample_posts_df.iterrows()
                    ]
                    
                    print(f"  Sentiment: {sentiment_summary.positive}+ / {sentiment_summary.negative}- / {sentiment_summary.neutral}=")
                
                # Component analysis with RAG (if enabled and Gemini available)
                if request.analyze_components and gemini_model and sentiment_summary:
                    try:
                        print(f"  Running component analysis with RAG...")
                        
                        # Build context for Gemini (reuse RAG logic)
                        sample_for_rag = topic_posts_df.nlargest(20, "score")
                        context_parts = [
                            f"Trending Topic: {topic_name}",
                            f"Total posts: {len(topic_posts_df)}",
                            f"Sentiment: {sentiment_summary.positive} positive, {sentiment_summary.negative} negative, {sentiment_summary.neutral} neutral",
                            "",
                            "Sample posts:"
                        ]
                        
                        for idx, row in sample_for_rag.head(15).iterrows():
                            context_parts.append(
                                f"- [{row['sentiment_normalized'].upper()}] (Score: {row['score']}) \"{row['title']}\""
                            )
                        
                        context = "\n".join(context_parts)
                        
                        # Generate component analysis
                        prompt = f"""Analyze this trending Reddit topic and identify key components/aspects being discussed.

{context}

Identify the main components or aspects people are discussing about "{topic_name}" (e.g., for a product: features, price, design; for an event: location, timing, impact).

Provide a component breakdown in this JSON format:

COMPONENT_ANALYSIS:
[
  {{
    "component": "component_name",
    "sentiment": "positive/negative/neutral/mixed",
    "confidence": "high/medium/low",
    "summary": "brief summary",
    "mention_count": estimated_mentions
  }}
]

Only return the JSON array, no other text."""
                        
                        response = gemini_model.generate_content(prompt)
                        response_text = response.text
                        
                        # Parse component analysis
                        if "COMPONENT_ANALYSIS:" in response_text:
                            parts = response_text.split("COMPONENT_ANALYSIS:")
                            response_text = parts[1].strip()
                        
                        import json
                        import re
                        json_match = re.search(r'\[(.*?)\]', response_text, re.DOTALL)
                        if json_match:
                            json_str = '[' + json_match.group(1) + ']'
                            components_data = json.loads(json_str)
                            component_analysis = [
                                ComponentSentiment(**comp) for comp in components_data
                            ]
                            print(f"  Found {len(component_analysis)} components")
                    
                    except Exception as e:
                        print(f"  Component analysis failed: {e}")
                        component_analysis = None
                
                # Calculate trending duration
                if not topic_posts_df.empty and "created_utc" in topic_posts_df.columns:
                    oldest_post = topic_posts_df["created_utc"].min()
                    trending_duration = (datetime.utcnow() - oldest_post).total_seconds() / 3600
                else:
                    trending_duration = None
                
                # Build analysis result
                topic_analysis = TrendingTopicAnalysis(
                    topic_info=TrendingTopicInfo(**topic_info),
                    sentiment_analysis=sentiment_summary or SentimentSummary(positive=0, negative=0, neutral=0),
                    component_analysis=component_analysis,
                    key_insights=None,  # Could add AI-generated insights here
                    trending_duration_hours=round(trending_duration, 1) if trending_duration else None,
                    sample_posts=sample_posts
                )
                
                analyzed_topics.append(topic_analysis)
            
            except Exception as topic_error:
                print(f"  Error analyzing {topic_name}: {topic_error}")
                continue
        
        if not analyzed_topics:
            raise HTTPException(
                status_code=500,
                detail="Failed to analyze any topics"
            )
        
        # Build response
        return TrendingResponse(
            trending_topics=analyzed_topics,
            total_topics_found=len(trending_topics),
            analysis_time=datetime.utcnow().isoformat(),
            time_window_hours=request.time_window_hours,
            category=request.category
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_sentiment_endpoint(request: PredictionRequest):
    """
    Predict future sentiment trends based on historical data
    
    Uses time-series analysis to forecast sentiment scores for the next few hours.
    Supports three prediction methods:
    - **linear**: Linear regression on historical trend
    - **moving_average**: Weighted moving average with trend detection
    - **hybrid**: Combination of both methods (default, most reliable)
    
    Parameters:
    - **query**: Topic to analyze
    - **limit**: Number of historical posts to fetch (10-1000)
    - **time_window_hours**: Historical time window (6-168 hours)
    - **hours_ahead**: Hours to predict into the future (3-48 hours)
    - **interval_hours**: Prediction interval (1-6 hours)
    - **method**: Prediction method (linear/moving_average/hybrid)
    
    Returns predictions with:
    - Sentiment scores and trends
    - Confidence levels
    - Historical summary for context
    """
    try:
        # Step 1: Fetch and prepare historical data
        print(f"Fetching posts for query: {request.query}")
        posts_df = fetch_reddit_posts(request.query, limit=request.limit)
        
        if posts_df.empty:
            raise HTTPException(
                status_code=404, 
                detail="No posts found for the given query"
            )
        
        # Convert timestamps
        posts_df["created_utc"] = pd.to_datetime(posts_df["created_utc"], unit="s")
        
        # Filter to time window
        time_cutoff = datetime.utcnow() - timedelta(hours=request.time_window_hours)
        posts_df = posts_df[posts_df["created_utc"] >= time_cutoff]
        
        if posts_df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No posts found in the last {request.time_window_hours} hours"
            )
        
        if len(posts_df) < 10:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data for prediction. Only {len(posts_df)} posts found. Need at least 10."
            )
        
        print(f"Found {len(posts_df)} posts in the time window")
        
        # Step 2: Perform sentiment analysis
        print("Analyzing sentiment...")
        sentiment_results = posts_df["title"].apply(analyze_sentiment)
        posts_df["sentiment"], posts_df["sentiment_score"] = zip(*sentiment_results)
        
        # Normalize sentiment labels
        def normalize_sentiment(label):
            label_lower = str(label).lower()
            if label_lower in ["positive", "label_2"]:
                return "positive"
            elif label_lower in ["negative", "label_0"]:
                return "negative"
            else:
                return "neutral"
        
        posts_df["sentiment_normalized"] = posts_df["sentiment"].apply(normalize_sentiment)
        
        # Convert sentiment to numeric for calculations
        def sentiment_to_score(sentiment):
            if sentiment == "positive":
                return 1.0
            elif sentiment == "negative":
                return -1.0
            else:
                return 0.0
        
        posts_df["sentiment_score_numeric"] = posts_df["sentiment_normalized"].apply(sentiment_to_score)
        
        # Add datetime column for prediction
        posts_df["created_datetime"] = posts_df["created_utc"]
        posts_df["total_posts"] = 1  # For aggregation
        
        print(f"Sentiment distribution: {posts_df['sentiment_normalized'].value_counts().to_dict()}")
        
        # Step 3: Generate predictions
        print(f"Generating predictions using {request.method} method...")
        prediction_result = predict_sentiment(
            df=posts_df,
            hours_ahead=request.hours_ahead,
            interval_hours=request.interval_hours,
            method=request.method
        )
        
        if 'error' in prediction_result:
            raise HTTPException(
                status_code=400,
                detail=prediction_result['error']
            )
        
        # Step 4: Format response
        predictions = [
            PredictionPoint(**pred) for pred in prediction_result['predictions']
        ]
        
        historical_summary = HistoricalSummary(**prediction_result['historical_summary'])
        
        print(f"Generated {len(predictions)} prediction points")
        
        return PredictionResponse(
            query=request.query,
            predictions=predictions,
            historical_summary=historical_summary,
            prediction_method=prediction_result['prediction_method'],
            interval_hours=prediction_result['interval_hours'],
            generated_at=datetime.utcnow().isoformat()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Prediction error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
