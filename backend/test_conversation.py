#!/usr/bin/env python3
"""
Test script for conversation context feature in RAG endpoint
Demonstrates multi-turn conversations with context awareness
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_response(turn_number, question, response_data):
    """Pretty print a conversation turn"""
    print(f"\n{'=' * 80}")
    print(f"TURN {turn_number}: {question}")
    print(f"{'=' * 80}")
    print(f"\n📊 Query: {response_data['query']}")
    print(f"📈 Posts analyzed: {response_data['total_posts_analyzed']}")
    print(f"🎯 Confidence: {response_data['confidence']}")
    
    print(f"\n💬 ANSWER:")
    print(f"{response_data['answer']}\n")
    
    if response_data.get('component_analysis'):
        print(f"\n🔧 COMPONENT ANALYSIS:")
        for comp in response_data['component_analysis']:
            emoji = "😊" if comp['sentiment'] == "positive" else "😞" if comp['sentiment'] == "negative" else "😐"
            print(f"  {emoji} {comp['component'].upper()}: {comp['sentiment']} ({comp['confidence']} confidence)")
            print(f"     └─ {comp['summary']}")
            print(f"     └─ Mentions: {comp['mention_count']}")
    
    print(f"\n{'=' * 80}\n")

def test_conversation_flow():
    """Test a complete conversation flow"""
    print("\n🚀 Starting Conversation Context Test\n")
    
    # Initialize conversation state
    query = "iPhone 17"
    conversation_history = []
    
    # Turn 1: Initial question
    print("📝 Turn 1: Asking initial question...")
    turn1_data = {
        "query": query,
        "question": "What do people think about the iPhone 17?",
        "limit": 100
    }
    
    response1 = requests.post(f"{BASE_URL}/api/rag", json=turn1_data)
    if response1.status_code != 200:
        print(f"❌ Error: {response1.status_code}")
        print(response1.text)
        return
    
    data1 = response1.json()
    print_response(1, turn1_data['question'], data1)
    
    # Save conversation turn
    if 'conversation_turn' in data1:
        conversation_history.append(data1['conversation_turn'])
    
    time.sleep(1)  # Brief pause for readability
    
    # Turn 2: Follow-up about specific component
    print("📝 Turn 2: Asking about a specific component...")
    turn2_data = {
        "query": query,
        "question": "What about the camera specifically?",
        "limit": 100,
        "conversation_history": conversation_history
    }
    
    response2 = requests.post(f"{BASE_URL}/api/rag", json=turn2_data)
    if response2.status_code != 200:
        print(f"❌ Error: {response2.status_code}")
        print(response2.text)
        return
    
    data2 = response2.json()
    print_response(2, turn2_data['question'], data2)
    
    # Save conversation turn
    if 'conversation_turn' in data2:
        conversation_history.append(data2['conversation_turn'])
    
    time.sleep(1)
    
    # Turn 3: Pronoun resolution test
    print("📝 Turn 3: Testing pronoun resolution...")
    turn3_data = {
        "query": query,
        "question": "How does it compare to the iPhone 16?",
        "limit": 100,
        "conversation_history": conversation_history
    }
    
    response3 = requests.post(f"{BASE_URL}/api/rag", json=turn3_data)
    if response3.status_code != 200:
        print(f"❌ Error: {response3.status_code}")
        print(response3.text)
        return
    
    data3 = response3.json()
    print_response(3, turn3_data['question'], data3)
    
    # Save conversation turn
    if 'conversation_turn' in data3:
        conversation_history.append(data3['conversation_turn'])
    
    time.sleep(1)
    
    # Turn 4: Context-dependent question
    print("📝 Turn 4: Context-dependent follow-up...")
    turn4_data = {
        "query": query,
        "question": "Is that worth the price?",
        "limit": 100,
        "conversation_history": conversation_history
    }
    
    response4 = requests.post(f"{BASE_URL}/api/rag", json=turn4_data)
    if response4.status_code != 200:
        print(f"❌ Error: {response4.status_code}")
        print(response4.text)
        return
    
    data4 = response4.json()
    print_response(4, turn4_data['question'], data4)
    
    print("\n✅ Conversation test completed successfully!")
    print(f"\n📚 Total conversation turns: {len(conversation_history) + 1}")
    print(f"💾 Conversation history size: {len(json.dumps(conversation_history))} bytes")

def test_without_context():
    """Test the same questions without context (for comparison)"""
    print("\n🔄 Testing WITHOUT conversation context (for comparison)\n")
    
    query = "iPhone 17"
    questions = [
        "What do people think about the iPhone 17?",
        "What about the camera specifically?",
        "How does it compare to the iPhone 16?",
        "Is that worth the price?"
    ]
    
    for i, question in enumerate(questions, 1):
        print(f"\n📝 Question {i}: {question}")
        data = {
            "query": query,
            "question": question,
            "limit": 100
        }
        
        response = requests.post(f"{BASE_URL}/api/rag", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"💬 Answer snippet: {result['answer'][:200]}...")
        else:
            print(f"❌ Error: {response.status_code}")
        
        time.sleep(1)

def check_server():
    """Check if the server is running"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server is running")
            print(f"   Gemini configured: {data.get('gemini_configured', False)}")
            return True
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Server is not running at {BASE_URL}")
        print(f"   Please start the server with: uvicorn main:app --reload")
        return False

if __name__ == "__main__":
    print("🧪 RAG Conversation Context Test Suite")
    print("=" * 80)
    
    if not check_server():
        exit(1)
    
    print("\n" + "=" * 80)
    print("TEST 1: Multi-turn conversation WITH context")
    print("=" * 80)
    test_conversation_flow()
    
    print("\n" + "=" * 80)
    print("TEST 2: Same questions WITHOUT context")
    print("=" * 80)
    print("(Notice how answers lack context awareness)")
    test_without_context()
    
    print("\n" + "=" * 80)
    print("✨ All tests completed!")
    print("=" * 80)

