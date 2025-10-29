# Conversation Context Feature

## Overview

The RAG endpoint now supports **conversation history** to enable contextual follow-up questions. This allows you to have multi-turn conversations where the AI maintains context from previous questions and answers.

## How It Works

### 1. **First Question** (No Context)
```json
{
  "query": "iPhone 17",
  "question": "What do people think about the iPhone 17?",
  "limit": 100
}
```

**Response includes:**
- Answer to the question
- Component analysis (camera, battery, etc.)
- **conversation_turn** - Save this for the next request!

### 2. **Follow-up Questions** (With Context)
```json
{
  "query": "iPhone 17",
  "question": "What about the camera specifically?",
  "limit": 100,
  "conversation_history": [
    {
      "question": "What do people think about the iPhone 17?",
      "answer": "Overall, Reddit users are excited about the iPhone 17...",
      "components": ["camera", "battery", "display", "price"]
    }
  ]
}
```

The AI now understands:
- "What about" refers to iPhone 17
- You're asking about a specific component previously identified
- Context from the previous answer

### 3. **Multiple Follow-ups**
```json
{
  "query": "iPhone 17",
  "question": "How does it compare to the previous model?",
  "limit": 100,
  "conversation_history": [
    {
      "question": "What do people think about the iPhone 17?",
      "answer": "Overall, Reddit users are excited...",
      "components": ["camera", "battery", "display", "price"]
    },
    {
      "question": "What about the camera specifically?",
      "answer": "The camera receives overwhelmingly positive feedback...",
      "components": ["camera"]
    }
  ]
}
```

The AI understands:
- "it" = iPhone 17
- "the previous model" = comparing to older iPhone
- Maintains context about camera discussion

## API Models

### ConversationTurn
```python
class ConversationTurn(BaseModel):
    question: str              # Previous question asked
    answer: str                # Previous answer given
    components: Optional[List[str]]  # Components discussed
```

### Updated RAGRequest
```python
class RAGRequest(BaseModel):
    query: str                    # Topic (e.g., "iPhone 17")
    question: str                 # Current question
    limit: int = 100              # Posts to fetch
    time_window_hours: int = 48   # Time window
    include_context: bool = True  # Include source posts
    conversation_history: Optional[List[ConversationTurn]] = None  # NEW!
```

### Updated RAGResponse
```python
class RAGResponse(BaseModel):
    # ... existing fields ...
    conversation_turn: Optional[ConversationTurn]  # NEW! Add to history
```

## Usage Examples

### Example 1: Product Analysis Conversation

**Turn 1:**
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What are people saying about the iPhone 17?"
  }'
```

**Response:**
```json
{
  "answer": "Reddit discussions show mixed excitement...",
  "component_analysis": [
    {"component": "camera", "sentiment": "positive", ...},
    {"component": "battery", "sentiment": "neutral", ...},
    {"component": "price", "sentiment": "negative", ...}
  ],
  "conversation_turn": {
    "question": "What are people saying about the iPhone 17?",
    "answer": "Reddit discussions show mixed excitement...",
    "components": ["camera", "battery", "price"]
  }
}
```

**Turn 2:** (Using conversation_turn from previous response)
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "Why is the price sentiment negative?",
    "conversation_history": [
      {
        "question": "What are people saying about the iPhone 17?",
        "answer": "Reddit discussions show mixed excitement...",
        "components": ["camera", "battery", "price"]
      }
    ]
  }'
```

**Response:**
```json
{
  "answer": "Based on previous discussions about iPhone 17, users are frustrated with the pricing because...",
  "component_analysis": [
    {"component": "price", "sentiment": "negative", ...}
  ],
  ...
}
```

**Turn 3:**
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "How does the camera compare to iPhone 16?",
    "conversation_history": [
      {
        "question": "What are people saying about the iPhone 17?",
        "answer": "Reddit discussions show mixed excitement...",
        "components": ["camera", "battery", "price"]
      },
      {
        "question": "Why is the price sentiment negative?",
        "answer": "Users are frustrated with pricing because...",
        "components": ["price"]
      }
    ]
  }'
```

### Example 2: Event Analysis Conversation

**Turn 1:**
```json
{
  "query": "FIFA World Cup 2026",
  "question": "What's the overall sentiment about FIFA World Cup 2026?"
}
```

**Turn 2:**
```json
{
  "query": "FIFA World Cup 2026",
  "question": "What about the venue selection?",
  "conversation_history": [...]
}
```

**Turn 3:**
```json
{
  "query": "FIFA World Cup 2026",
  "question": "Are people excited about it being in North America?",
  "conversation_history": [...]
}
```

## Frontend Integration

### React Example

```javascript
import { useState } from 'react';

function ChatInterface() {
  const [query, setQuery] = useState('iPhone 17');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  const askQuestion = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          question: currentQuestion,
          conversation_history: conversationHistory,
          limit: 100
        })
      });
      
      const data = await response.json();
      
      // Add to messages
      setMessages([
        ...messages,
        { role: 'user', content: currentQuestion },
        { role: 'assistant', content: data.answer, components: data.component_analysis }
      ]);
      
      // Update conversation history
      setConversationHistory([
        ...conversationHistory,
        data.conversation_turn
      ]);
      
      setCurrentQuestion('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Topic (e.g., iPhone 17)"
      />
      
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
            {msg.components && (
              <ComponentAnalysis components={msg.components} />
            )}
          </div>
        ))}
      </div>
      
      <input
        value={currentQuestion}
        onChange={(e) => setCurrentQuestion(e.target.value)}
        placeholder="Ask a question..."
        onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
      />
    </div>
  );
}
```

## Best Practices

### 1. **Conversation History Limits**
- The system keeps the **last 3 turns** for context
- Older conversations are automatically trimmed
- Each turn's answer is truncated to 300 characters in the prompt

### 2. **Pronoun Resolution**
The AI is instructed to understand:
- "it", "this", "that" → refers to the main query topic
- "the camera", "battery life" → refers to components discussed
- "previous model", "compared to" → contextual comparisons

### 3. **Component Tracking**
- Each response includes `components` extracted from the analysis
- These help the AI understand what aspects were previously discussed
- Use them to suggest follow-up questions to users

### 4. **Session Management**
```javascript
// Store conversation history in:
- React state (for single-page sessions)
- LocalStorage (persists across page reloads)
- Backend database (multi-device, authentication)

// Example with LocalStorage:
const saveHistory = (history) => {
  localStorage.setItem(`conversation_${query}`, JSON.stringify(history));
};

const loadHistory = (query) => {
  return JSON.parse(localStorage.getItem(`conversation_${query}`) || '[]');
};
```

### 5. **Clear Context Button**
```javascript
<button onClick={() => setConversationHistory([])}>
  Start New Conversation
</button>
```

## Advanced Features

### Context-Aware Suggestions
```javascript
// Suggest follow-up questions based on components:
if (data.component_analysis) {
  const suggestions = data.component_analysis.map(comp =>
    `What about the ${comp.component}?`
  );
  setSuggestedQuestions(suggestions);
}
```

### Multi-Topic Conversations
```javascript
// Switch topics while maintaining separate histories:
const histories = {
  'iPhone 17': [...],
  'Samsung S25': [...],
  'Google Pixel 9': [...]
};

// Use the appropriate history for each query
const currentHistory = histories[currentQuery] || [];
```

## Limitations

1. **Context Window**: Only last 3 turns are included (to manage prompt size)
2. **No Memory**: Conversations don't persist between API calls (stateless)
3. **Same Query**: Context works best when follow-ups are about the same `query`
4. **Fresh Data**: Each request re-fetches Reddit data (no caching)

## Troubleshooting

### AI Not Understanding Context
- Ensure `conversation_history` is properly formatted
- Check that `conversation_turn` from previous response is included
- Verify `components` array is present

### Context Getting Lost
- Keep conversation history array under 5-10 turns
- Use clear, specific language in follow-up questions
- Reference components explicitly ("the camera" vs "it")

### Performance Issues
- Limit `conversation_history` array size
- Each turn adds ~300 chars to the prompt
- Consider summarizing very long conversations

## Testing

```bash
# Test without context
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What do people think?"
  }'

# Save the conversation_turn from response, then test with context
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What about the battery?",
    "conversation_history": [
      {
        "question": "What do people think?",
        "answer": "People are excited about...",
        "components": ["camera", "battery", "price"]
      }
    ]
  }'
```

## Summary

✅ **Conversation history enables:**
- Natural follow-up questions
- Pronoun resolution ("it", "this", "that")
- Component-focused discussions
- Multi-turn analysis

✅ **Frontend integration:**
- Save `conversation_turn` from each response
- Pass as `conversation_history` array in next request
- Display messages in chat UI
- Clear history for new topics

✅ **Best for:**
- Interactive dashboards
- Chat interfaces
- Guided analysis workflows
- Progressive disclosure of insights

