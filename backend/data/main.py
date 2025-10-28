from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
import pandas as pd
from datetime import datetime, timedelta
from src.reddit_scraper import fetch_reddit_posts
from src.sentiment_analysis import analyze_sentiment

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

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Reddit Sentiment Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/api/analyze (POST)",
            "health": "/health (GET)"
        }
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
