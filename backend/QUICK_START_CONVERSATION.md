# Quick Start: Conversation Context

## TL;DR

Your RAG endpoint now supports **multi-turn conversations**! 🎉

Each response includes a `conversation_turn` field - save it and pass it back in the `conversation_history` array for context-aware follow-ups.

## Minimal Example

### Turn 1 (No context):
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What do people think about the iPhone 17?"
  }'
```

**Save the `conversation_turn` from the response!**

### Turn 2 (With context):
```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What about the camera?",
    "conversation_history": [
      {
        "question": "What do people think about the iPhone 17?",
        "answer": "...",
        "components": ["camera", "battery", "price"]
      }
    ]
  }'
```

The AI now understands "What about" refers to iPhone 17! 🎯

## What Changed?

### New Request Field:
```python
conversation_history: Optional[List[ConversationTurn]] = None
```

### New Response Field:
```python
conversation_turn: ConversationTurn  # Add this to history for next request
```

### ConversationTurn Structure:
```python
{
  "question": str,           # The question asked
  "answer": str,             # The answer given
  "components": List[str]    # Components discussed (e.g., ["camera", "battery"])
}
```

## Usage Pattern

```javascript
// 1. Initialize
let conversationHistory = [];

// 2. Ask first question
const response1 = await askQuestion("What do people think?", []);

// 3. Save the turn
conversationHistory.push(response1.conversation_turn);

// 4. Ask follow-up
const response2 = await askQuestion("What about the camera?", conversationHistory);

// 5. Continue building history
conversationHistory.push(response2.conversation_turn);
```

## Test It!

```bash
# Start your server
cd /Users/prathameshpatil/sinister-6/backend
source venv/bin/activate
uvicorn main:app --reload

# In another terminal, run the test
cd /Users/prathameshpatil/sinister-6/backend
source venv/bin/activate
python test_conversation.py
```

This will demonstrate:
- ✅ Multi-turn conversations
- ✅ Context awareness
- ✅ Pronoun resolution ("it", "that")
- ✅ Component tracking

## React Integration

```jsx
function ChatInterface() {
  const [history, setHistory] = useState([]);
  const [query] = useState("iPhone 17");

  const ask = async (question) => {
    const response = await fetch('/api/rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        question,
        conversation_history: history
      })
    });
    
    const data = await response.json();
    
    // Update history for next question
    setHistory([...history, data.conversation_turn]);
    
    return data;
  };

  return (
    <div>
      <button onClick={() => setHistory([])}>
        Clear History
      </button>
      {/* Your chat UI */}
    </div>
  );
}
```

## Key Benefits

1. **Natural Follow-ups**: "What about the camera?" instead of "What about the iPhone 17 camera?"
2. **Pronoun Resolution**: "it", "that", "this" automatically understood
3. **Progressive Disclosure**: Dive deeper into specific components
4. **Better UX**: More conversational, less repetitive

## Limitations

- Last 3 turns kept in context (manages prompt size)
- No server-side persistence (stateless)
- Best when follow-ups are about same `query`

## Full Documentation

- **Complete Guide**: `CONVERSATION_CONTEXT.md`
- **RAG Endpoint**: `RAG_ENDPOINT.md`
- **Component Analysis**: `COMPONENT_ANALYSIS.md`

## Questions?

The feature is production-ready! Just:
1. Save `conversation_turn` from each response
2. Pass as `conversation_history` in next request
3. Enjoy context-aware conversations! 🚀

