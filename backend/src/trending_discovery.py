"""
Trending Topics Discovery Module
Discovers trending topics from Reddit by analyzing popular posts
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import re
from collections import Counter
import time

def fetch_trending_posts(
    time_window_hours: int = 24,
    limit: int = 100,
    subreddits: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Fetch trending posts from Reddit using public JSON API
    
    Args:
        time_window_hours: How far back to look for trending posts
        limit: Maximum number of posts to fetch
        subreddits: List of subreddits to search (None = r/popular)
    
    Returns:
        DataFrame with columns: title, subreddit, score, num_comments, 
                                created_utc, url, awards, velocity
    """
    headers = {"User-agent": "Mozilla/5.0 (sentiment_analyzer/1.0)"}
    posts_data = []
    time_cutoff = datetime.utcnow() - timedelta(hours=time_window_hours)
    
    try:
        # Determine which subreddit to fetch from
        if subreddits:
            # Multi-subreddit (use + to combine)
            subreddit_str = "+".join(subreddits)
            url = f"https://www.reddit.com/r/{subreddit_str}/hot.json"
        else:
            # Default: r/popular (trending across all of Reddit)
            url = "https://www.reddit.com/r/popular/hot.json"
        
        # Fetch posts
        params = {"limit": min(limit, 100)}  # Reddit max is 100 per request
        response = requests.get(url, headers=headers, params=params, timeout=30)
        
        if response.status_code != 200:
            print(f"Error fetching from Reddit: {response.status_code}")
            return pd.DataFrame()
        
        data = response.json()
        children = data.get("data", {}).get("children", [])
        
        if not children:
            print("No posts found in response")
            return pd.DataFrame()
        
        for post in children:
            post_data = post.get("data", {})
            
            # Get post time
            created_utc = post_data.get("created_utc", 0)
            post_time = datetime.utcfromtimestamp(created_utc)
            
            # Skip old posts (but be lenient - hot posts might be older)
            # For trending, we want hot posts regardless of age initially
            
            # Calculate velocity (engagement per hour)
            hours_old = max((datetime.utcnow() - post_time).total_seconds() / 3600, 0.1)
            score = post_data.get("score", 0)
            num_comments = post_data.get("num_comments", 0)
            engagement_score = score + (num_comments * 2)
            velocity = engagement_score / hours_old
            
            posts_data.append({
                "title": post_data.get("title", ""),
                "selftext": post_data.get("selftext", ""),
                "subreddit": post_data.get("subreddit", ""),
                "score": score,
                "num_comments": num_comments,
                "created_utc": created_utc,
                "url": post_data.get("url", ""),
                "awards": post_data.get("total_awards_received", 0),
                "velocity": velocity,
                "post_id": post_data.get("id", "")
            })
        
        time.sleep(0.5)  # Be nice to Reddit's servers
    
    except requests.exceptions.Timeout:
        print("Request timed out")
        return pd.DataFrame()
    except Exception as e:
        print(f"Error fetching trending posts: {e}")
        return pd.DataFrame()
    
    if not posts_data:
        return pd.DataFrame()
    
    df = pd.DataFrame(posts_data)
    
    # Now filter by time window
    df["created_datetime"] = pd.to_datetime(df["created_utc"], unit="s")
    time_cutoff_tz = datetime.utcnow() - timedelta(hours=time_window_hours)
    
    # Be more lenient - if we got hot posts, keep them even if slightly older
    # This helps when there's less activity
    if len(df) > 0:
        df_filtered = df[df["created_datetime"] >= time_cutoff_tz]
        
        # If filtering removes too many, keep older posts
        if len(df_filtered) < 10 and len(df) >= 10:
            df = df.nlargest(min(limit, len(df)), "velocity")
        else:
            df = df_filtered
    
    # Sort by velocity (trending momentum)
    if not df.empty:
        df = df.sort_values("velocity", ascending=False)
    
    return df


def calculate_trending_score(row):
    """
    Calculate a comprehensive trending score for a post
    
    Factors:
    - Velocity (most important)
    - Raw score
    - Comments (engagement)
    - Recency
    - Awards
    """
    velocity_score = row['velocity'] * 0.5
    engagement_score = (row['score'] + row['num_comments'] * 2) * 0.3
    awards_score = row['awards'] * 10 * 0.1
    
    # Recency bonus (newer posts get a boost)
    hours_old = (datetime.utcnow() - datetime.utcfromtimestamp(row['created_utc'])).total_seconds() / 3600
    recency_multiplier = max(1.0, 2.0 - (hours_old / 24))  # Boost for posts < 24 hours
    
    total_score = (velocity_score + engagement_score + awards_score) * recency_multiplier
    
    return total_score


def get_trending_posts_with_scores(
    time_window_hours: int = 24,
    limit: int = 100,
    min_score: int = 100
) -> pd.DataFrame:
    """
    Fetch trending posts and calculate trending scores
    
    Args:
        time_window_hours: Time window for trending posts
        limit: Max posts to fetch
        min_score: Minimum Reddit score to consider
    
    Returns:
        DataFrame with trending posts and scores
    """
    df = fetch_trending_posts(time_window_hours, limit)
    
    if df.empty:
        return df
    
    # Filter by minimum score
    df = df[df['score'] >= min_score]
    
    # Calculate trending score
    df['trending_score'] = df.apply(calculate_trending_score, axis=1)
    
    # Sort by trending score
    df = df.sort_values("trending_score", ascending=False)
    
    return df


def get_subreddit_specific_trends(
    subreddits: List[str],
    time_window_hours: int = 24,
    posts_per_subreddit: int = 20
) -> pd.DataFrame:
    """
    Get trending posts from specific subreddits
    
    Args:
        subreddits: List of subreddit names (without r/)
        time_window_hours: Time window
        posts_per_subreddit: Posts to fetch per subreddit
    
    Returns:
        Combined DataFrame of trending posts from all subreddits
    """
    all_posts = []
    
    for subreddit_name in subreddits:
        try:
            df = fetch_trending_posts(
                time_window_hours=time_window_hours,
                limit=posts_per_subreddit,
                subreddits=[subreddit_name]
            )
            if not df.empty:
                all_posts.append(df)
        except Exception as e:
            print(f"Error fetching from r/{subreddit_name}: {e}")
            continue
    
    if not all_posts:
        return pd.DataFrame()
    
    # Combine all posts
    combined_df = pd.concat(all_posts, ignore_index=True)
    
    # Remove duplicates (same post in multiple subreddits)
    combined_df = combined_df.drop_duplicates(subset=['post_id'])
    
    # Calculate trending scores
    combined_df['trending_score'] = combined_df.apply(calculate_trending_score, axis=1)
    
    # Sort by trending score
    combined_df = combined_df.sort_values("trending_score", ascending=False)
    
    return combined_df


# Popular subreddits for different categories
CATEGORY_SUBREDDITS = {
    "technology": ["technology", "gadgets", "apple", "android", "programming"],
    "gaming": ["gaming", "Games", "pcgaming", "PS5", "xbox"],
    "news": ["news", "worldnews", "politics", "UpliftingNews"],
    "entertainment": ["movies", "television", "Music", "netflix"],
    "sports": ["sports", "nba", "nfl", "soccer", "formula1"],
    "science": ["science", "space", "Futurology", "Physics"],
    "all": None  # Will use r/popular
}


def get_trending_by_category(
    category: str = "all",
    time_window_hours: int = 24,
    limit: int = 50
) -> pd.DataFrame:
    """
    Get trending posts from a specific category
    
    Args:
        category: Category name (technology, gaming, news, etc.)
        time_window_hours: Time window
        limit: Max posts
    
    Returns:
        DataFrame of trending posts in category
    """
    subreddits = CATEGORY_SUBREDDITS.get(category.lower())
    
    if subreddits is None:
        # Use r/popular for "all"
        return fetch_trending_posts(time_window_hours, limit)
    else:
        # Fetch from category-specific subreddits
        return get_subreddit_specific_trends(subreddits, time_window_hours, limit // len(subreddits))

