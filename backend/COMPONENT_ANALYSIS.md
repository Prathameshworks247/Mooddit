# Component-Wise Sentiment Analysis 🔍

## Overview

The enhanced RAG endpoint now automatically identifies and analyzes sentiment for different components/aspects of any query. This works for products, services, events, or any topic!

## How It Works

### For Products (e.g., "iPhone 17")
Automatically identifies and analyzes:
- 📷 Camera
- 🔋 Battery
- 📱 Display
- 💰 Price
- 🎨 Design
- ⚡ Performance
- 📶 Connectivity
- etc.

### For Services (e.g., "Netflix")
Automatically identifies:
- Content library
- Pricing
- User interface
- Streaming quality
- Customer service
- etc.

### For Events (e.g., "World Cup 2026")
Automatically identifies:
- Venue
- Teams
- Schedule
- Tickets
- Organization
- etc.

## API Request

```bash
curl -X POST "http://localhost:8000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 17",
    "question": "What do people think about the iPhone 17? Analyze by component."
  }'
```

## Response Format

```json
{
  "query": "iPhone 17",
  "question": "What do people think about the iPhone 17? Analyze by component.",
  "answer": "Based on 248 Reddit posts, the iPhone 17 receives mixed but generally positive reception...",
  "confidence": "high",
  "total_posts_analyzed": 248,
  "sentiment_summary": {
    "positive": 120,
    "negative": 85,
    "neutral": 43
  },
  "component_analysis": [
    {
      "component": "Camera",
      "sentiment": "positive",
      "confidence": "high",
      "summary": "Users praise the improved low-light performance and zoom capabilities",
      "mention_count": 87
    },
    {
      "component": "Battery",
      "sentiment": "mixed",
      "confidence": "medium",
      "summary": "Battery life improved but not as much as expected",
      "mention_count": 45
    },
    {
      "component": "Price",
      "sentiment": "negative",
      "confidence": "high",
      "summary": "Many users feel the price increase isn't justified",
      "mention_count": 72
    },
    {
      "component": "Display",
      "sentiment": "positive",
      "confidence": "high",
      "summary": "Brighter screen and better color accuracy widely praised",
      "mention_count": 34
    },
    {
      "component": "Design",
      "sentiment": "neutral",
      "confidence": "medium",
      "summary": "Design changes are minimal, opinions are divided",
      "mention_count": 28
    }
  ],
  "time_range": "2025-10-28 05:02 to 2025-10-28 20:32",
  "source_posts": [...],
  "model_used": "gemini-2.0-flash-exp"
}
```

## Example Questions

### Product Analysis

**Query:** "Tesla Model 3"
**Question:** "Analyze sentiment for different aspects of the Tesla Model 3"

**Components Identified:**
- Build quality
- Autopilot
- Interior design
- Range
- Charging network
- Service quality

---

**Query:** "PlayStation 6"
**Question:** "What are people saying about PS6? Break down by features."

**Components Identified:**
- Graphics
- Controller
- Backward compatibility
- Price
- Launch lineup
- Performance

---

### Service Analysis

**Query:** "ChatGPT Plus"
**Question:** "Analyze user sentiment on different aspects"

**Components Identified:**
- Response quality
- Speed
- Pricing
- Features
- Customer support

---

### Event Analysis

**Query:** "FIFA World Cup 2026"
**Question:** "What aspects are people discussing?"

**Components Identified:**
- Host cities
- Stadium selection
- Ticket availability
- Team participation
- Schedule

## Usage Examples

### Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/rag",
    json={
        "query": "iPhone 17",
        "question": "Analyze component-wise sentiment",
        "limit": 200
    }
)

data = response.json()

print(f"Overall: {data['answer']}\n")
print("Component Breakdown:")

for component in data['component_analysis']:
    emoji = "✅" if component['sentiment'] == 'positive' else "❌" if component['sentiment'] == 'negative' else "➖"
    print(f"{emoji} {component['component']}: {component['sentiment']} ({component['mention_count']} mentions)")
    print(f"   {component['summary']}\n")
```

### JavaScript/React

```javascript
const analyzeComponents = async (query) => {
  const response = await fetch('http://localhost:8000/api/rag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      question: `Analyze ${query} by component and provide detailed sentiment breakdown`
    })
  });

  const data = await response.json();
  
  return {
    overall: data.answer,
    components: data.component_analysis,
    sentiment: data.sentiment_summary
  };
};

// Usage
const analysis = await analyzeComponents('iPhone 17');

console.log('Overall:', analysis.overall);
console.log('\nComponents:');
analysis.components.forEach(comp => {
  console.log(`${comp.component}: ${comp.sentiment} (${comp.mention_count} mentions)`);
  console.log(`  → ${comp.summary}`);
});
```

## React Component Example

```jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ComponentAnalysis = () => {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeComponents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          question: `Analyze ${query} by component with detailed sentiment breakdown`
        })
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#6b7280',
      mixed: '#f59e0b'
    };
    return colors[sentiment] || '#6b7280';
  };

  return (
    <div className="component-analysis">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter product, service, or topic..."
        />
        <button onClick={analyzeComponents} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Components'}
        </button>
      </div>

      {analysis && (
        <div className="results">
          <div className="overall-sentiment">
            <h3>Overall Analysis</h3>
            <p>{analysis.answer}</p>
            <div className="sentiment-badges">
              <span className="positive">+{analysis.sentiment_summary.positive}</span>
              <span className="negative">-{analysis.sentiment_summary.negative}</span>
              <span className="neutral">~{analysis.sentiment_summary.neutral}</span>
            </div>
          </div>

          {analysis.component_analysis && (
            <div className="components">
              <h3>Component Breakdown</h3>
              
              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysis.component_analysis}>
                  <XAxis dataKey="component" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="mention_count">
                    {analysis.component_analysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* List */}
              <div className="component-list">
                {analysis.component_analysis.map((comp, idx) => (
                  <div key={idx} className="component-card">
                    <div className="component-header">
                      <h4>{comp.component}</h4>
                      <span 
                        className={`sentiment-badge ${comp.sentiment}`}
                        style={{ backgroundColor: getSentimentColor(comp.sentiment) }}
                      >
                        {comp.sentiment}
                      </span>
                    </div>
                    <p className="summary">{comp.summary}</p>
                    <div className="meta">
                      <span>{comp.mention_count} mentions</span>
                      <span className={`confidence ${comp.confidence}`}>
                        {comp.confidence} confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComponentAnalysis;
```

## CSS Example

```css
.component-analysis {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.search-bar input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
}

.search-bar button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.overall-sentiment {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sentiment-badges {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.sentiment-badges span {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
}

.sentiment-badges .positive { background: #d1fae5; color: #065f46; }
.sentiment-badges .negative { background: #fee2e2; color: #991b1b; }
.sentiment-badges .neutral { background: #f3f4f6; color: #374151; }

.component-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.component-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sentiment-badge {
  padding: 4px 12px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.summary {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 12px;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #9ca3af;
}

.confidence {
  text-transform: capitalize;
}
```

## Benefits

✅ **Automatic Component Detection** - AI identifies relevant components  
✅ **Generalized** - Works for any query type  
✅ **Sentiment Per Component** - Detailed breakdown  
✅ **Confidence Scoring** - Know how reliable each analysis is  
✅ **Mention Count** - See how often each component is discussed  
✅ **Ready for Visualization** - Data structured for charts  

## Tips for Best Results

### 1. Be Specific in Questions

Good:
- "Analyze iPhone 17 component-wise"
- "Break down Tesla Model 3 sentiment by features"
- "What aspects of Netflix are users discussing?"

### 2. Use Larger Sample Sizes

```json
{
  "limit": 200,  // More posts = better component detection
  "time_window_hours": 72
}
```

### 3. Ask for Specific Components

```json
{
  "question": "Analyze camera, battery, and display sentiment for iPhone 17"
}
```

## Advanced Usage

### Compare Two Products

```python
async def compare_products(product1, product2):
    results = {}
    
    for product in [product1, product2]:
        response = await analyze_components(product)
        results[product] = response['component_analysis']
    
    # Compare common components
    comparison = {}
    for comp1 in results[product1]:
        for comp2 in results[product2]:
            if comp1['component'].lower() == comp2['component'].lower():
                comparison[comp1['component']] = {
                    product1: comp1['sentiment'],
                    product2: comp2['sentiment']
                }
    
    return comparison

# Usage
comparison = await compare_products('iPhone 17', 'Samsung S25 Ultra')
```

### Track Component Sentiment Over Time

```python
async def track_component_sentiment(query, component, days=7):
    results = []
    
    for day in range(days):
        response = await analyze_components(
            query,
            time_window_hours=24,
            offset_days=day
        )
        
        for comp in response['component_analysis']:
            if comp['component'].lower() == component.lower():
                results.append({
                    'day': day,
                    'sentiment': comp['sentiment'],
                    'mentions': comp['mention_count']
                })
    
    return results

# Usage
trend = await track_component_sentiment('iPhone 17', 'camera', days=7)
```

---

**🎉 Now you have automated component-wise sentiment analysis for any query!**

