"""
Simple test script for the Reddit Sentiment Analysis API
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    return response.status_code == 200

def test_root():
    """Test the root endpoint"""
    print("Testing root endpoint...")
    response = requests.get(BASE_URL)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    return response.status_code == 200

def test_analyze(query="Python programming", limit=50):
    """Test the analyze endpoint"""
    print(f"Testing analyze endpoint with query: '{query}'...")
    payload = {
        "query": query,
        "limit": limit,
        "time_window_hours": 24,
        "interval_hours": 3
    }
    
    print(f"Request payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            json=payload,
            timeout=60
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nResults:")
            print(f"  Query: {data['query']}")
            print(f"  Total posts fetched: {data['total_posts']}")
            print(f"  Posts in timeframe: {data['posts_in_timeframe']}")
            print(f"  Sentiment summary:")
            print(f"    Positive: {data['sentiment_summary']['positive']}")
            print(f"    Negative: {data['sentiment_summary']['negative']}")
            print(f"    Neutral: {data['sentiment_summary']['neutral']}")
            print(f"  Time series points: {len(data['time_series'])}")
            print(f"  CSV saved to: {data['csv_path']}")
            
            if data['posts']:
                print(f"\n  Sample post:")
                post = data['posts'][0]
                print(f"    Title: {post['title'][:80]}...")
                print(f"    Sentiment: {post['sentiment_label']} ({post['sentiment_score']})")
                print(f"    Subreddit: r/{post['subreddit']}")
                print(f"    Score: {post['score']}")
        else:
            print(f"Error: {response.json()}")
        
        return response.status_code == 200
        
    except requests.exceptions.Timeout:
        print("Error: Request timed out. The query might be too large.")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_charts(query="Python programming", limit=50):
    """Test the charts endpoint"""
    print(f"Testing charts endpoint with query: '{query}'...")
    payload = {
        "query": query,
        "limit": limit,
        "time_window_hours": 48,
        "interval_hours": 6
    }
    
    print(f"Request payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/charts",
            json=payload,
            timeout=60
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nResults:")
            print(f"  Query: {data['query']}")
            print(f"  Total posts: {data['total_posts']}")
            print(f"  Time window requested: {data['time_window_hours']} hours")
            print(f"  Actual time range: {data['actual_time_range_hours']} hours")
            print(f"  First post: {data['first_post_time']}")
            print(f"  Last post: {data['last_post_time']}")
            
            # Chart 1: Sentiment Distribution
            print(f"\n  Sentiment Distribution:")
            for item in data['sentiment_distribution']:
                print(f"    {item['name']}: {item['value']} ({item['percentage']}%)")
            
            # Chart 2: Sentiment Over Time
            print(f"\n  Sentiment Over Time: {len(data['sentiment_over_time'])} time points")
            if data['sentiment_over_time']:
                sample = data['sentiment_over_time'][0]
                print(f"    Sample point:")
                print(f"      Time: {sample['date']} {sample['time']}")
                print(f"      Avg Sentiment: {sample['average_sentiment']}")
                print(f"      Posts: {sample['total_posts']}")
            
            # Chart 3: Posts Over Time
            print(f"\n  Posts Over Time: {len(data['posts_over_time'])} time points")
            total_posts_sum = sum(p['posts'] for p in data['posts_over_time'])
            print(f"    Total posts across all periods: {total_posts_sum}")
            
            # Chart 4: Sentiment Posts Over Time
            print(f"\n  Sentiment Posts Over Time: {len(data['sentiment_posts_over_time'])} time points")
            if data['sentiment_posts_over_time']:
                sample = data['sentiment_posts_over_time'][0]
                print(f"    Sample point:")
                print(f"      Positive: {sample['positive']}")
                print(f"      Negative: {sample['negative']}")
                print(f"      Neutral: {sample['neutral']}")
        else:
            print(f"Error: {response.json()}")
        
        return response.status_code == 200
        
    except requests.exceptions.Timeout:
        print("Error: Request timed out. The query might be too large.")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_rag(query="Python programming"):
    """Test the RAG endpoint"""
    print(f"Testing RAG endpoint with query: '{query}'...")
    
    question = "What are the main topics people discuss about this?"
    
    payload = {
        "query": query,
        "question": question,
        "limit": 100,
        "time_window_hours": 48,
        "include_context": True
    }
    
    print(f"Request payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/rag",
            json=payload,
            timeout=120  # RAG takes longer due to AI processing
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nResults:")
            print(f"  Query: {data['query']}")
            print(f"  Question: {data['question']}")
            print(f"  Model: {data['model_used']}")
            print(f"  Confidence: {data['confidence']}")
            print(f"  Posts analyzed: {data['total_posts_analyzed']}")
            
            print(f"\n  Sentiment Summary:")
            print(f"    Positive: {data['sentiment_summary']['positive']}")
            print(f"    Negative: {data['sentiment_summary']['negative']}")
            print(f"    Neutral: {data['sentiment_summary']['neutral']}")
            
            print(f"\n  Answer:")
            print(f"    {data['answer'][:200]}...")  # First 200 chars
            
            if data['source_posts']:
                print(f"\n  Source posts: {len(data['source_posts'])}")
                print(f"    Sample: \"{data['source_posts'][0]['title'][:60]}...\"")
            
            return True
        elif response.status_code == 503:
            print(f"\n⚠️ Gemini API not configured")
            print(f"  {response.json().get('detail', '')}")
            print(f"\n  To enable RAG:")
            print(f"  1. Get free API key: https://makersuite.google.com/app/apikey")
            print(f"  2. Add to .env: GEMINI_API_KEY=your_key")
            return None  # Not a failure, just not configured
        else:
            print(f"Error: {response.json()}")
            return False
        
    except requests.exceptions.Timeout:
        print("Error: Request timed out. Try reducing the limit.")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Reddit Sentiment Analysis API Test Suite")
    print("=" * 60)
    print()
    
    # Check if server is running
    try:
        requests.get(BASE_URL, timeout=2)
    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Cannot connect to {BASE_URL}")
        print("Make sure the API server is running:")
        print("  python main.py")
        print("  or")
        print("  uvicorn main:app --reload")
        sys.exit(1)
    
    # Run tests
    results = []
    
    results.append(("Health Check", test_health()))
    results.append(("Root Endpoint", test_root()))
    
    # You can customize the query here
    query = input("Enter a query to test (or press Enter for 'Python programming'): ").strip()
    if not query:
        query = "Python programming"
    
    print("\n" + "=" * 60)
    print("Testing Analyze Endpoint")
    print("=" * 60)
    results.append(("Analyze Endpoint", test_analyze(query)))
    
    print("\n" + "=" * 60)
    print("Testing Charts Endpoint")
    print("=" * 60)
    results.append(("Charts Endpoint", test_charts(query)))
    
    print("\n" + "=" * 60)
    print("Testing RAG Endpoint (AI-Powered)")
    print("=" * 60)
    rag_result = test_rag(query)
    if rag_result is not None:
        results.append(("RAG Endpoint", rag_result))
    else:
        print("  ℹ️ Skipped (Gemini API not configured)")
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()

