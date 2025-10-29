#!/usr/bin/env python3
"""
Quick test to verify trending discovery is working
"""

from src.trending_discovery import fetch_trending_posts
from src.topic_extractor import extract_top_trending_topics

print("🔥 Testing Trending Discovery Fix\n")
print("="*60)

print("\n1. Fetching trending posts from r/popular...")
try:
    df = fetch_trending_posts(time_window_hours=48, limit=50)
    
    if df.empty:
        print("   ❌ No posts found!")
        print("   Tip: Reddit might be rate limiting. Try again in a minute.")
    else:
        print(f"   ✅ Found {len(df)} trending posts!")
        print(f"\n   Top 5 posts:")
        for i, row in df.head(5).iterrows():
            print(f"      {i+1}. [{row['subreddit']}] {row['title'][:60]}...")
            print(f"         Score: {row['score']:,} | Comments: {row['num_comments']} | Velocity: {row['velocity']:.1f}")
        
        print("\n2. Extracting trending topics...")
        topics = extract_top_trending_topics(df, top_n=5)
        
        if topics:
            print(f"   ✅ Found {len(topics)} trending topics!")
            print(f"\n   Top Trending Topics:")
            for topic in topics:
                print(f"      #{topic['rank']} - {topic['topic']}")
                print(f"         Posts: {topic['post_count']} | Strength: {topic['trending_strength']}%")
        else:
            print("   ⚠️  No topics extracted (this can happen with generic titles)")
        
        print("\n" + "="*60)
        print("✅ Trending discovery is working!")
        print("\nYou can now use: POST /api/trending/analyze")

except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
    print("\n💡 Make sure you have internet connection and Reddit is accessible")

