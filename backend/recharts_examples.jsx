/**
 * Recharts Integration Examples for Reddit Sentiment Analysis API
 * 
 * This file contains React components using Recharts to visualize
 * the data from the /api/charts endpoint
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Color scheme
const COLORS = {
  positive: '#10b981', // green
  negative: '#ef4444', // red
  neutral: '#6b7280', // gray
  primary: '#3b82f6', // blue
};

/**
 * Custom hook to fetch chart data
 */
export const useChartData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (query, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/charts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: options.limit || 300,
          time_window_hours: options.timeWindowHours || 48,
          interval_hours: options.intervalHours || 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};

/**
 * Chart 1: Sentiment Distribution (Pie Chart)
 * Shows total positive, negative, and neutral sentiment counts
 */
export const SentimentDistributionChart = ({ data }) => {
  if (!data || !data.sentiment_distribution) return null;

  const chartData = data.sentiment_distribution;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.toLowerCase()]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Alternative: Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill={COLORS.primary}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.toLowerCase()]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Chart 2: Sentiment Shift Over Time (Line Chart)
 * Shows how average sentiment changes over the 2-day period
 */
export const SentimentOverTimeChart = ({ data }) => {
  if (!data || !data.sentiment_over_time) return null;

  const chartData = data.sentiment_over_time;

  // Custom tooltip to show more details
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}><strong>{data.date} {data.time}</strong></p>
          <p style={{ margin: '5px 0', color: COLORS.primary }}>
            Avg Sentiment: {data.average_sentiment.toFixed(3)}
          </p>
          <p style={{ margin: '5px 0', color: COLORS.positive }}>
            Positive: {data.positive_count}
          </p>
          <p style={{ margin: '5px 0', color: COLORS.negative }}>
            Negative: {data.negative_count}
          </p>
          <p style={{ margin: '5px 0', color: COLORS.neutral }}>
            Neutral: {data.neutral_count}
          </p>
          <p style={{ margin: '5px 0' }}>
            Total: {data.total_posts}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Sentiment Shift Over Time</h3>
      <p className="chart-subtitle">
        Average sentiment score (-1 = negative, 0 = neutral, 1 = positive)
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            domain={[-1, 1]}
            label={{ value: 'Avg Sentiment', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="average_sentiment" 
            stroke={COLORS.primary}
            strokeWidth={2}
            name="Average Sentiment"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {/* Reference line at 0 */}
          <Line 
            type="monotone" 
            dataKey={() => 0} 
            stroke="#000" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Chart 3: Total Posts Over Time (Area Chart)
 * Shows post volume over the 2-day period
 */
export const PostsOverTimeChart = ({ data }) => {
  if (!data || !data.posts_over_time) return null;

  const chartData = data.posts_over_time;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Total Posts Over Time</h3>
      <p className="chart-subtitle">
        Post volume related to "{data.query}" over {data.time_window_hours} hours
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time"
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Number of Posts', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="posts" 
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.6}
            name="Total Posts"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Chart 4: Sentiment Posts Over Time (Stacked Area Chart)
 * Shows positive and negative post counts over the 2-day period
 */
export const SentimentPostsOverTimeChart = ({ data }) => {
  if (!data || !data.sentiment_posts_over_time) return null;

  const chartData = data.sentiment_posts_over_time;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Sentiment Posts Over Time</h3>
      <p className="chart-subtitle">
        Positive vs Negative post distribution over time
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time"
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Number of Posts', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="positive" 
            stackId="1"
            stroke={COLORS.positive}
            fill={COLORS.positive}
            fillOpacity={0.8}
            name="Positive"
          />
          <Area 
            type="monotone" 
            dataKey="negative" 
            stackId="1"
            stroke={COLORS.negative}
            fill={COLORS.negative}
            fillOpacity={0.8}
            name="Negative"
          />
          <Area 
            type="monotone" 
            dataKey="neutral" 
            stackId="1"
            stroke={COLORS.neutral}
            fill={COLORS.neutral}
            fillOpacity={0.6}
            name="Neutral"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Alternative: Line Chart (non-stacked) */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="positive" 
            stroke={COLORS.positive}
            strokeWidth={2}
            name="Positive"
          />
          <Line 
            type="monotone" 
            dataKey="negative" 
            stroke={COLORS.negative}
            strokeWidth={2}
            name="Negative"
          />
          <Line 
            type="monotone" 
            dataKey="neutral" 
            stroke={COLORS.neutral}
            strokeWidth={2}
            name="Neutral"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Complete Dashboard Component
 * Shows all 4 charts together
 */
export const SentimentDashboard = () => {
  const { data, loading, error, fetchData } = useChartData();
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchData(query, {
        limit: 300,
        timeWindowHours: 48,
        intervalHours: 3,
      });
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Reddit Sentiment Analysis Dashboard</h1>
        
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a topic to analyze..."
            className="search-input"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="search-button"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="loading-message">
          Loading chart data...
        </div>
      )}

      {data && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4>Query</h4>
              <p>{data.query}</p>
            </div>
            <div className="stat-card">
              <h4>Total Posts</h4>
              <p>{data.total_posts}</p>
            </div>
            <div className="stat-card">
              <h4>Time Window</h4>
              <p>{data.time_window_hours} hours</p>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <SentimentDistributionChart data={data} />
            </div>
            
            <div className="chart-card">
              <SentimentOverTimeChart data={data} />
            </div>
            
            <div className="chart-card">
              <PostsOverTimeChart data={data} />
            </div>
            
            <div className="chart-card">
              <SentimentPostsOverTimeChart data={data} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Example CSS (add to your stylesheet)
 */
export const exampleCSS = `
.dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin-bottom: 20px;
  color: #1f2937;
}

.search-form {
  display: flex;
  gap: 10px;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-button {
  padding: 10px 30px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #2563eb;
}

.search-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card h4 {
  margin: 0 0 10px 0;
  color: #6b7280;
  font-size: 14px;
  text-transform: uppercase;
}

.stat-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 100%;
}

.chart-title {
  margin: 0 0 5px 0;
  color: #1f2937;
  font-size: 20px;
}

.chart-subtitle {
  margin: 0 0 20px 0;
  color: #6b7280;
  font-size: 14px;
}

.error-message {
  padding: 15px;
  background-color: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #991b1b;
  margin-bottom: 20px;
}

.loading-message {
  padding: 15px;
  background-color: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  color: #1e40af;
  margin-bottom: 20px;
  text-align: center;
}
`;

/**
 * Usage Example in your App
 */
export const AppExample = () => {
  return (
    <div className="App">
      <SentimentDashboard />
    </div>
  );
};

// Export individual components
export default {
  SentimentDistributionChart,
  SentimentOverTimeChart,
  PostsOverTimeChart,
  SentimentPostsOverTimeChart,
  SentimentDashboard,
  useChartData,
};

