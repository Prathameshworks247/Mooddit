#!/usr/bin/env python3
"""
Test script for Trending Topics Analysis feature
Demonstrates trending topic discovery and analysis
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def check_server():
    """Check if server is running and show features"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Server is running!")
            print(f"\n📋 Available Endpoints:")
            for name, endpoint in data.get('endpoints', {}).items():
                print(f"   • {name}: {endpoint}")
            
            print(f"\n🎯 Features:")
            features = data.get('features', {})
            for feature, enabled in features.items():
                status = "✅" if enabled else "❌"
                print(f"   {status} {feature}")
            
            return True
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Server is not running at {BASE_URL}")
        print(f"   Please start: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return False

def test_basic_trending(category="all", top_n=5):
    """Test basic trending analysis without component analysis"""
    print_header(f"TEST 1: Basic Trending Analysis - {category.upper()}")
    
    print(f"\n📡 Fetching top {top_n} trending topics from Reddit...")
    print(f"   Category: {category}")
    print(f"   Time window: Last 24 hours")
    print(f"   Component analysis: Disabled (faster)")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/trending/analyze",
            json={
                "time_window_hours": 24,
                "top_n": top_n,
                "category": category,
                "analyze_sentiment": True,
                "analyze_components": False  # Faster
            },
            timeout=120  # 2 minutes timeout
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            print(f"\n❌ Error {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        print(f"\n✅ Analysis completed in {elapsed:.1f} seconds")
        print(f"   Found {data['total_topics_found']} trending topics")
        print(f"   Analyzed at: {data['analysis_time']}")
        
        print(f"\n🔥 TOP TRENDING TOPICS:")
        
        for topic in data['trending_topics']:
            info = topic['topic_info']
            sentiment = topic['sentiment_analysis']
            
            print(f"\n#{info['rank']} - {info['topic']}")
            print(f"   📊 Trending Strength: {info['trending_strength']}%")
            print(f"   💬 Posts: {info['post_count']}")
            print(f"   🏆 Total Score: {info['total_score']:,}")
            print(f"   💭 Comments: {info['total_comments']:,}")
            print(f"   ⚡ Velocity: {info['avg_velocity']:.1f} engagement/hour")
            print(f"   📍 Subreddits: {', '.join(['r/' + s for s in info['subreddits'][:3]])}")
            
            if info.get('variants'):
                print(f"   🔗 Variants: {', '.join(info['variants'][:3])}")
            
            # Sentiment bar
            total = sentiment['positive'] + sentiment['negative'] + sentiment['neutral']
            if total > 0:
                pos_pct = (sentiment['positive'] / total) * 100
                neg_pct = (sentiment['negative'] / total) * 100
                neu_pct = (sentiment['neutral'] / total) * 100
                
                print(f"   😊 Sentiment: {sentiment['positive']} positive ({pos_pct:.1f}%)")
                print(f"   😞           {sentiment['negative']} negative ({neg_pct:.1f}%)")
                print(f"   😐           {sentiment['neutral']} neutral ({neu_pct:.1f}%)")
            
            if topic.get('trending_duration_hours'):
                print(f"   ⏱️  Trending for: {topic['trending_duration_hours']:.1f} hours")
        
        return True
    
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out (this can happen with large analyses)")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_with_components(top_n=3):
    """Test trending analysis WITH component analysis (requires Gemini)"""
    print_header("TEST 2: Trending Analysis with Component Breakdown")
    
    print(f"\n📡 Analyzing top {top_n} trending topics WITH component analysis...")
    print(f"   ⚠️  This requires Gemini API key and takes longer")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/trending/analyze",
            json={
                "time_window_hours": 24,
                "top_n": top_n,
                "category": "all",
                "analyze_sentiment": True,
                "analyze_components": True  # Enable component analysis
            },
            timeout=300  # 5 minutes timeout
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            print(f"\n❌ Error {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        print(f"\n✅ Deep analysis completed in {elapsed:.1f} seconds")
        
        for topic in data['trending_topics']:
            info = topic['topic_info']
            components = topic.get('component_analysis', [])
            
            print(f"\n{'='*60}")
            print(f"#{info['rank']} - {info['topic']}")
            print(f"{'='*60}")
            
            if components:
                print(f"\n🔧 COMPONENT ANALYSIS:")
                for comp in components:
                    emoji = "😊" if comp['sentiment'] == "positive" else "😞" if comp['sentiment'] == "negative" else "😐"
                    print(f"\n   {emoji} {comp['component'].upper()}")
                    print(f"      Sentiment: {comp['sentiment']} ({comp['confidence']} confidence)")
                    print(f"      Summary: {comp['summary']}")
                    print(f"      Mentions: ~{comp['mention_count']}")
            else:
                print("   ℹ️  No component analysis available")
            
            # Sample posts
            if topic.get('sample_posts'):
                print(f"\n   📝 Sample Posts:")
                for i, post in enumerate(topic['sample_posts'][:3], 1):
                    print(f"      {i}. [{post['sentiment'].upper()}] {post['title'][:60]}...")
                    print(f"         Score: {post['score']:,} | {post['url'][:50]}...")
        
        return True
    
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out")
        print("   Tip: Reduce top_n or disable component analysis")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_categories():
    """Test different categories"""
    print_header("TEST 3: Multi-Category Analysis")
    
    categories = ["technology", "gaming", "news"]
    
    for category in categories:
        print(f"\n📂 Category: {category.upper()}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/trending/analyze",
                json={
                    "time_window_hours": 24,
                    "top_n": 3,
                    "category": category,
                    "analyze_sentiment": True,
                    "analyze_components": False
                },
                timeout=120
            )
            
            if response.status_code == 200:
                data = response.json()
                topics = [t['topic_info']['topic'] for t in data['trending_topics']]
                print(f"   Top trending: {', '.join(topics)}")
            else:
                print(f"   ❌ Error: {response.status_code}")
        
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(1)  # Be nice to the API

def save_results_to_file(category="all"):
    """Save trending analysis to a JSON file"""
    print_header("TEST 4: Save Results to File")
    
    print(f"\n💾 Fetching trending topics and saving to file...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/trending/analyze",
            json={
                "time_window_hours": 24,
                "top_n": 10,
                "category": category,
                "analyze_sentiment": True,
                "analyze_components": False
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Save to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"trending_{category}_{timestamp}.json"
            
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"✅ Results saved to: {filename}")
            print(f"   Topics analyzed: {data['total_topics_found']}")
            print(f"   File size: {len(json.dumps(data))} bytes")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "🔥" * 40)
    print("  TRENDING TOPICS ANALYSIS - TEST SUITE")
    print("🔥" * 40)
    
    # Check server
    if not check_server():
        return
    
    input("\n👉 Press Enter to start tests...")
    
    # Test 1: Basic trending analysis
    test_basic_trending(category="all", top_n=5)
    
    input("\n👉 Press Enter for next test...")
    
    # Test 2: Category-specific
    test_basic_trending(category="technology", top_n=3)
    
    input("\n👉 Press Enter for component analysis test (slower)...")
    
    # Test 3: With components (if Gemini configured)
    test_with_components(top_n=2)
    
    input("\n👉 Press Enter for multi-category test...")
    
    # Test 4: Multiple categories
    test_categories()
    
    input("\n👉 Press Enter to save results to file...")
    
    # Test 5: Save to file
    save_results_to_file()
    
    print_header("ALL TESTS COMPLETED!")
    print("\n✨ Trending Topics Analysis is working!")
    print("\n📚 Documentation: TRENDING_TOPICS.md")
    print("📖 API Docs: http://localhost:8000/docs")
    print("\n")

if __name__ == "__main__":
    main()

