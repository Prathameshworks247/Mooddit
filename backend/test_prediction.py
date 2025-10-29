"""
Test script for the Sentiment Prediction API endpoint
"""

import requests
import json
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
PREDICT_ENDPOINT = f"{API_BASE_URL}/api/predict"

def test_prediction(query: str, **kwargs):
    """
    Test the prediction endpoint with a given query
    
    Args:
        query: Topic to analyze
        **kwargs: Additional parameters (time_window_hours, hours_ahead, etc.)
    """
    print(f"\n{'='*80}")
    print(f"Testing Prediction for: {query}")
    print(f"{'='*80}\n")
    
    # Default parameters
    payload = {
        "query": query,
        "limit": 300,
        "time_window_hours": 48,
        "hours_ahead": 12,
        "interval_hours": 3,
        "method": "hybrid"
    }
    
    # Override with provided kwargs
    payload.update(kwargs)
    
    print(f"Request Parameters:")
    print(json.dumps(payload, indent=2))
    print()
    
    try:
        # Make the request
        print("Sending request...")
        response = requests.post(PREDICT_ENDPOINT, json=payload, timeout=60)
        
        # Check status
        if response.status_code != 200:
            print(f"❌ Error {response.status_code}: {response.text}")
            return None
        
        # Parse response
        data = response.json()
        
        print(f"✅ Success! Received prediction data\n")
        
        # Display Historical Summary
        print(f"{'='*80}")
        print(f"HISTORICAL SUMMARY")
        print(f"{'='*80}")
        
        hist = data['historical_summary']
        print(f"📊 Total Posts Analyzed: {hist['total_posts_analyzed']}")
        print(f"⏱️  Time Range: {hist['time_range_hours']:.1f} hours")
        print(f"📈 Trend: {hist['trend'].upper()}")
        print(f"\n💭 Current Sentiment:")
        print(f"   Score: {hist['current_sentiment']['score']:.3f}")
        print(f"   Ratio: {hist['current_sentiment']['ratio']:.3f}")
        print(f"\n📊 Average Sentiment (Historical):")
        print(f"   Score: {hist['average_sentiment']['score']:.3f}")
        print(f"   Ratio: {hist['average_sentiment']['ratio']:.3f}")
        
        # Display Predictions
        print(f"\n{'='*80}")
        print(f"PREDICTIONS ({data['prediction_method'].upper()} method)")
        print(f"{'='*80}\n")
        
        predictions = data['predictions']
        
        for i, pred in enumerate(predictions, 1):
            timestamp = datetime.fromisoformat(pred['timestamp'])
            
            # Determine sentiment emoji
            sentiment_emoji = {
                'positive': '🟢',
                'negative': '🔴',
                'neutral': '⚪'
            }.get(pred['predicted_sentiment'], '⚫')
            
            # Confidence bar
            confidence_pct = int(pred['confidence'] * 100)
            confidence_bar = '█' * (confidence_pct // 10) + '░' * (10 - confidence_pct // 10)
            
            print(f"Prediction #{i} - {pred['hours_ahead']}h ahead")
            print(f"  🕐 Time: {timestamp.strftime('%Y-%m-%d %H:%M')}")
            print(f"  {sentiment_emoji} Sentiment: {pred['predicted_sentiment'].upper()}")
            print(f"  📊 Score: {pred['predicted_sentiment_score']:+.3f}")
            print(f"  📈 Ratio: {pred['predicted_sentiment_ratio']:+.3f}")
            print(f"  ✨ Confidence: {confidence_bar} {confidence_pct}%")
            print()
        
        # Summary Statistics
        print(f"{'='*80}")
        print(f"PREDICTION SUMMARY")
        print(f"{'='*80}\n")
        
        avg_score = sum(p['predicted_sentiment_score'] for p in predictions) / len(predictions)
        avg_confidence = sum(p['confidence'] for p in predictions) / len(predictions)
        
        sentiment_counts = {}
        for pred in predictions:
            sent = pred['predicted_sentiment']
            sentiment_counts[sent] = sentiment_counts.get(sent, 0) + 1
        
        print(f"📊 Average Predicted Score: {avg_score:+.3f}")
        print(f"✨ Average Confidence: {avg_confidence:.2%}")
        print(f"📈 Prediction Horizon: {predictions[-1]['hours_ahead']} hours")
        print(f"⏱️  Intervals: {len(predictions)} predictions every {data['interval_hours']} hours")
        
        print(f"\n💭 Sentiment Distribution:")
        for sentiment, count in sentiment_counts.items():
            pct = (count / len(predictions)) * 100
            emoji = {'positive': '🟢', 'negative': '🔴', 'neutral': '⚪'}.get(sentiment, '⚫')
            print(f"   {emoji} {sentiment.capitalize()}: {count} ({pct:.1f}%)")
        
        # Overall Assessment
        print(f"\n{'='*80}")
        print(f"OVERALL ASSESSMENT")
        print(f"{'='*80}\n")
        
        if avg_confidence >= 0.7:
            reliability = "🟢 HIGH"
        elif avg_confidence >= 0.5:
            reliability = "🟡 MODERATE"
        else:
            reliability = "🔴 LOW"
        
        print(f"Reliability: {reliability}")
        
        if avg_score > 0.1:
            outlook = "📈 Sentiment likely to remain or become POSITIVE"
        elif avg_score < -0.1:
            outlook = "📉 Sentiment likely to remain or become NEGATIVE"
        else:
            outlook = "➡️  Sentiment likely to remain NEUTRAL"
        
        print(f"Outlook: {outlook}")
        
        if hist['trend'] == 'increasing' and avg_score > 0:
            print(f"💡 Insight: Positive momentum continuing")
        elif hist['trend'] == 'decreasing' and avg_score < 0:
            print(f"💡 Insight: Negative momentum continuing")
        elif (hist['trend'] == 'increasing' and avg_score < 0) or (hist['trend'] == 'decreasing' and avg_score > 0):
            print(f"💡 Insight: Potential reversal in trend")
        else:
            print(f"💡 Insight: Stable sentiment expected")
        
        print()
        
        return data
        
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The API might be processing a large dataset.")
        return None
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the server is running.")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def run_tests():
    """Run a series of test predictions"""
    
    print("\n" + "="*80)
    print("SENTIMENT PREDICTION API - TEST SUITE")
    print("="*80)
    
    # Test 1: Basic prediction
    print("\n\n🧪 TEST 1: Basic Prediction")
    test_prediction("iPhone 17")
    
    # Test 2: Short-term prediction
    print("\n\n🧪 TEST 2: Short-term Prediction (6 hours)")
    test_prediction(
        "Bitcoin",
        time_window_hours=24,
        hours_ahead=6,
        interval_hours=2
    )
    
    # Test 3: Long-term prediction
    print("\n\n🧪 TEST 3: Long-term Prediction (24 hours)")
    test_prediction(
        "Climate Change",
        time_window_hours=72,
        hours_ahead=24,
        interval_hours=4,
        method="hybrid"
    )
    
    # Test 4: Different methods comparison
    print("\n\n🧪 TEST 4: Method Comparison - Linear")
    test_prediction(
        "Tesla",
        time_window_hours=48,
        hours_ahead=12,
        interval_hours=3,
        method="linear"
    )
    
    print("\n\n🧪 TEST 5: Method Comparison - Moving Average")
    test_prediction(
        "Tesla",
        time_window_hours=48,
        hours_ahead=12,
        interval_hours=3,
        method="moving_average"
    )


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Run with command-line query
        query = " ".join(sys.argv[1:])
        test_prediction(query)
    else:
        # Run full test suite
        run_tests()
    
    print("\n" + "="*80)
    print("Tests completed!")
    print("="*80 + "\n")

