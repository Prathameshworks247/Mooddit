/**
 * Example API Client for Reddit Sentiment Analysis
 * 
 * This file demonstrates how to integrate the FastAPI backend
 * with your frontend application (React, Vue, etc.)
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000';

/**
 * API Client Class
 */
class SentimentAPI {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Check if API is healthy
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  }

  /**
   * Analyze sentiment for a given query
   * @param {Object} params - Analysis parameters
   * @param {string} params.query - Topic to search for
   * @param {number} [params.limit=300] - Number of posts to fetch
   * @param {number} [params.timeWindowHours=48] - Time window in hours
   * @param {number} [params.intervalHours=3] - Interval for grouping
   * @returns {Promise<Object>}
   */
  async analyzeSentiment({ 
    query, 
    limit = 300, 
    timeWindowHours = 48, 
    intervalHours = 3 
  }) {
    const response = await fetch(`${this.baseURL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit,
        time_window_hours: timeWindowHours,
        interval_hours: intervalHours,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return response.json();
  }
}

// Export for ES modules
export default SentimentAPI;

// Usage Example 1: Basic React Component
export const SentimentAnalysisExample = () => {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const [error, setError] = React.useState(null);

  const api = new SentimentAPI();

  const handleAnalyze = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.analyzeSentiment({ 
        query,
        limit: 500,
        timeWindowHours: 72,
        intervalHours: 6
      });
      
      setResults(data);
      console.log('Analysis complete:', data);
    } catch (err) {
      setError(err.message);
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Enter topic..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleAnalyze(e.target.value);
          }
        }}
      />
      
      {loading && <div>Analyzing...</div>}
      {error && <div>Error: {error}</div>}
      
      {results && (
        <div>
          <h2>Results for: {results.query}</h2>
          <p>Total posts: {results.total_posts}</p>
          <p>Posts analyzed: {results.posts_in_timeframe}</p>
          
          <div>
            <h3>Sentiment Summary</h3>
            <p>Positive: {results.sentiment_summary.positive}</p>
            <p>Negative: {results.sentiment_summary.negative}</p>
            <p>Neutral: {results.sentiment_summary.neutral}</p>
          </div>
          
          <div>
            <h3>Time Series Data</h3>
            {/* Integrate with charting library like Chart.js, Recharts, etc. */}
          </div>
        </div>
      )}
    </div>
  );
};

// Usage Example 2: Vanilla JavaScript
export async function exampleVanillaJS() {
  const api = new SentimentAPI();

  try {
    // Check API health
    const health = await api.healthCheck();
    console.log('API Status:', health.status);

    // Analyze sentiment
    const results = await api.analyzeSentiment({
      query: 'iPhone 17',
      limit: 300,
      timeWindowHours: 48,
      intervalHours: 3
    });

    console.log('Query:', results.query);
    console.log('Total Posts:', results.total_posts);
    console.log('Sentiment:', results.sentiment_summary);
    
    // Process time series for visualization
    const chartData = results.time_series.map(point => ({
      time: new Date(point.timestamp),
      sentiment: point.sentiment_value
    }));
    
    console.log('Chart Data:', chartData);
    
    // Process individual posts
    const positivePosts = results.posts.filter(
      post => post.sentiment_label.toLowerCase() === 'positive'
    );
    
    console.log('Positive Posts:', positivePosts.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Usage Example 3: With Chart.js Integration
export function createSentimentChart(timeSeriesData, canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  const chartData = {
    labels: timeSeriesData.map(point => 
      new Date(point.timestamp).toLocaleString()
    ),
    datasets: [{
      label: 'Sentiment',
      data: timeSeriesData.map(point => point.sentiment_value),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      stepped: true,
      segment: {
        borderColor: ctx => {
          const value = ctx.p1.parsed.y;
          return value > 0 ? 'green' : value < 0 ? 'red' : 'gray';
        }
      }
    }]
  };

  new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      scales: {
        y: {
          min: -1,
          max: 1,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return value === 1 ? 'Positive' : 
                     value === 0 ? 'Neutral' : 
                     'Negative';
            }
          }
        }
      }
    }
  });
}

// Usage Example 4: Axios Integration
export async function exampleWithAxios(query) {
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/analyze`,
      {
        query: query,
        limit: 300,
        time_window_hours: 48,
        interval_hours: 3
      },
      {
        timeout: 60000, // 60 seconds
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { data } = response;
    
    // Calculate sentiment score
    const sentimentScore = (
      (data.sentiment_summary.positive - data.sentiment_summary.negative) /
      data.posts_in_timeframe * 100
    ).toFixed(2);
    
    console.log(`Sentiment Score: ${sentimentScore}%`);
    
    return data;
    
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Server Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Usage Example 5: React Hook
export function useSentimentAnalysis() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const api = React.useMemo(() => new SentimentAPI(), []);

  const analyze = React.useCallback(async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.analyzeSentiment(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const reset = React.useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, analyze, reset };
}

// Usage of the hook in a component:
// const { data, loading, error, analyze } = useSentimentAnalysis();
// 
// <button onClick={() => analyze({ query: 'React' })}>
//   Analyze
// </button>

