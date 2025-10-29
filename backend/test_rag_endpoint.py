#!/usr/bin/env python3
"""
Test script for RAG endpoint
Helps diagnose 500 errors
"""

import requests
import json

API_URL = "http://localhost:8000/api/rag"

# Test data
test_request = {
    "query": "iPhone 17",
    "question": "What do people think about the iPhone 17?",
    "time_window_hours": 48,
    "limit": 100,
    "include_context": True,
    "conversation_history": []
}

print("🧪 Testing RAG Endpoint")
print("=" * 60)
print(f"URL: {API_URL}")
print(f"Request: {json.dumps(test_request, indent=2)}")
print("=" * 60)

try:
    print("\n📡 Sending POST request...")
    response = requests.post(
        API_URL,
        json=test_request,
        timeout=60
    )
    
    print(f"\n📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("\n✅ SUCCESS!")
        data = response.json()
        print(f"\nQuery: {data.get('query')}")
        print(f"Question: {data.get('question')}")
        print(f"Answer: {data.get('answer')[:200]}...")
        print(f"\nTotal posts analyzed: {data.get('total_posts_analyzed')}")
        print(f"Sentiment: +{data.get('sentiment_summary', {}).get('positive')} "
              f"-{data.get('sentiment_summary', {}).get('negative')} "
              f"~{data.get('sentiment_summary', {}).get('neutral')}")
        
        if data.get('component_analysis'):
            print(f"\nComponents found: {len(data['component_analysis'])}")
            for comp in data['component_analysis'][:3]:
                print(f"  - {comp['component']}: {comp['sentiment']} ({comp['confidence']})")
    
    elif response.status_code == 500:
        print("\n❌ INTERNAL SERVER ERROR")
        try:
            error_data = response.json()
            print(f"\nError Detail: {error_data.get('detail')}")
        except:
            print(f"\nRaw Response: {response.text}")
        
        print("\n🔍 Common Causes:")
        print("  1. Gemini API key not set or invalid")
        print("  2. Gemini API quota exceeded")
        print("  3. No Reddit posts found")
        print("  4. Reddit scraper failing")
        print("  5. Sentiment analysis model not loaded")
        
        print("\n🛠️ Debugging Steps:")
        print("  1. Check backend terminal for full traceback")
        print("  2. Verify GEMINI_API_KEY in .env file")
        print("  3. Test /api/analyze endpoint first (simpler)")
        print("  4. Check if transformers model is downloaded")
    
    elif response.status_code == 503:
        print("\n❌ SERVICE UNAVAILABLE")
        error_data = response.json()
        print(f"\nError: {error_data.get('detail')}")
        print("\n💡 Solution: Set GEMINI_API_KEY in your .env file")
        print("   Get free API key: https://makersuite.google.com/app/apikey")
    
    elif response.status_code == 404:
        print("\n❌ NOT FOUND")
        error_data = response.json()
        print(f"\nError: {error_data.get('detail')}")
        print("\n💡 Try a different query or longer time window")
    
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        print(response.text)

except requests.exceptions.ConnectionError:
    print("\n❌ CONNECTION ERROR")
    print("Backend is not running!")
    print("\n🛠️ Start backend:")
    print("  cd /Users/prathameshpatil/sinister-6/backend")
    print("  source venv/bin/activate")
    print("  uvicorn main:app --reload")

except requests.exceptions.Timeout:
    print("\n❌ TIMEOUT")
    print("Request took longer than 60 seconds")
    print("This might happen if:")
    print("  - Reddit API is slow")
    print("  - Sentiment analysis is processing many posts")
    print("  - Gemini API is slow")

except Exception as e:
    print(f"\n❌ UNEXPECTED ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Test complete!")

