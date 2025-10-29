from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
import pandas as pd
from datetime import datetime, timedelta
from src.reddit_scraper import fetch_reddit_posts
from src.sentiment_analysis import analyze_sentiment
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

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
class RAGRequest(BaseModel):
    query: str = Field(..., description="Topic to analyze from Reddit", min_length=1)
    question: str = Field(..., description="Question to ask about the data", min_length=1)
    limit: int = Field(default=100, description="Number of posts to fetch", ge=10, le=500)
    time_window_hours: int = Field(default=48, description="Time window in hours", ge=1, le=168)
    include_context: bool = Field(default=True, description="Include source posts in response")

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
            "health": "/health (GET) - Health check"
        },
        "gemini_configured": gemini_model is not None
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
            context_parts.append(
                f"- [{row['sentiment_normalized'].upper()}] (Score: {row['score']}) \"{row['title']}\" "
                f"{f'- {row['selftext'][:200]}...' if row['selftext'] else ''}"
            )
        
        context = "\n".join(context_parts)
        
        # Step 4: Generate answer using Gemini
        # Enhanced prompt for component-wise analysis
        prompt = f"""You are a Reddit sentiment analysis assistant. Based on the following Reddit data, please answer the user's question with detailed component-wise sentiment analysis.

{context}

User's Question: {request.question}

Please provide:
1. A clear, direct answer to the question
2. Identify key components/aspects being discussed (e.g., for "iPhone 17": camera, battery, display, price, design, performance, etc.)
3. For each component, analyze the sentiment and provide specific examples
4. Support your analysis with mentions from the posts
5. Keep your main response concise (2-3 paragraphs)

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
            full_response = response.text
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
            source_posts = [
                SourcePost(
                    title=row["title"],
                    url=row["url"],
                    sentiment=row["sentiment_normalized"],
                    selftext=row["selftext"],
                    score=int(row["score"]),
                    created_utc=row["created_utc"].isoformat()
                )
                for _, row in sample_posts.head(10).iterrows()
            ]
        
        # Calculate time range
        first_post = filtered_df["created_utc"].min()
        last_post = filtered_df["created_utc"].max()
        time_range = f"{first_post.strftime('%Y-%m-%d %H:%M')} to {last_post.strftime('%Y-%m-%d %H:%M')}"
        
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
            model_used="gemini-2.0-flash-exp"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
