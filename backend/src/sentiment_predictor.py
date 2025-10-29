"""
Sentiment Prediction Module
Uses time-series analysis to predict future sentiment trends
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from sklearn.linear_model import LinearRegression


def prepare_time_series_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare sentiment data for time series forecasting
    
    Args:
        df: DataFrame with sentiment analysis results
        
    Returns:
        DataFrame with time-indexed sentiment data
    """
    if df.empty:
        return pd.DataFrame()
    
    # Ensure created_datetime is datetime
    if 'created_datetime' not in df.columns:
        df['created_datetime'] = pd.to_datetime(df['created_utc'], unit='s')
    
    # Sort by time
    df = df.sort_values('created_datetime')
    
    return df


def calculate_sentiment_trends(
    df: pd.DataFrame, 
    interval_hours: int = 3
) -> pd.DataFrame:
    """
    Calculate sentiment trends over time intervals
    
    Args:
        df: DataFrame with sentiment data
        interval_hours: Hours per interval
        
    Returns:
        DataFrame with time intervals and sentiment statistics
    """
    if df.empty:
        return pd.DataFrame()
    
    df = df.copy()
    
    # Create time intervals
    min_time = df['created_datetime'].min()
    max_time = df['created_datetime'].max()
    
    # Generate intervals
    intervals = pd.date_range(
        start=min_time.floor(f'{interval_hours}h'),
        end=max_time.ceil(f'{interval_hours}h'),
        freq=f'{interval_hours}h'
    )
    
    trend_data = []
    
    for i in range(len(intervals) - 1):
        start_time = intervals[i]
        end_time = intervals[i + 1]
        
        # Filter posts in this interval
        mask = (df['created_datetime'] >= start_time) & (df['created_datetime'] < end_time)
        interval_posts = df[mask]
        
        if len(interval_posts) > 0:
            avg_sentiment = interval_posts['sentiment_score'].mean()
            positive_count = (interval_posts['sentiment'] == 'positive').sum()
            negative_count = (interval_posts['sentiment'] == 'negative').sum()
            neutral_count = (interval_posts['sentiment'] == 'neutral').sum()
            total_posts = len(interval_posts)
            
            # Calculate sentiment ratio (positive - negative) / total
            sentiment_ratio = (positive_count - negative_count) / total_posts if total_posts > 0 else 0
        else:
            avg_sentiment = 0
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            total_posts = 0
            sentiment_ratio = 0
        
        trend_data.append({
            'timestamp': start_time,
            'avg_sentiment': avg_sentiment,
            'sentiment_ratio': sentiment_ratio,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'total_posts': total_posts
        })
    
    return pd.DataFrame(trend_data)


def predict_sentiment_linear(
    trend_df: pd.DataFrame, 
    hours_ahead: int = 12,
    interval_hours: int = 3
) -> List[Dict]:
    """
    Predict future sentiment using linear regression
    
    Args:
        trend_df: Historical trend data
        hours_ahead: Number of hours to predict ahead
        interval_hours: Hours per prediction interval
        
    Returns:
        List of prediction dictionaries
    """
    if trend_df.empty or len(trend_df) < 3:
        return []
    
    # Filter out intervals with no posts for training
    training_data = trend_df[trend_df['total_posts'] > 0].copy()
    
    if len(training_data) < 2:
        return []
    
    # Prepare features (time as numeric)
    training_data['time_numeric'] = (
        training_data['timestamp'] - training_data['timestamp'].min()
    ).dt.total_seconds() / 3600  # Convert to hours
    
    X = training_data[['time_numeric']].values
    
    # Train models for different metrics
    models = {}
    for metric in ['avg_sentiment', 'sentiment_ratio']:
        y = training_data[metric].values
        model = LinearRegression()
        model.fit(X, y)
        models[metric] = model
    
    # Generate future timestamps
    last_timestamp = trend_df['timestamp'].max()
    num_intervals = int(hours_ahead / interval_hours)
    
    predictions = []
    
    for i in range(1, num_intervals + 1):
        future_timestamp = last_timestamp + timedelta(hours=interval_hours * i)
        time_numeric = (future_timestamp - training_data['timestamp'].min()).total_seconds() / 3600
        
        # Predict sentiment
        pred_avg_sentiment = models['avg_sentiment'].predict([[time_numeric]])[0]
        pred_sentiment_ratio = models['sentiment_ratio'].predict([[time_numeric]])[0]
        
        # Clamp predictions to reasonable ranges
        pred_avg_sentiment = np.clip(pred_avg_sentiment, -1, 1)
        pred_sentiment_ratio = np.clip(pred_sentiment_ratio, -1, 1)
        
        # Determine overall sentiment
        if pred_avg_sentiment > 0.1:
            overall_sentiment = "positive"
        elif pred_avg_sentiment < -0.1:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"
        
        # Calculate confidence based on recent data consistency
        recent_variance = training_data['avg_sentiment'].tail(5).std()
        confidence = max(0.3, min(0.95, 1 - recent_variance))
        
        predictions.append({
            'timestamp': future_timestamp.isoformat(),
            'hours_ahead': interval_hours * i,
            'predicted_sentiment_score': round(float(pred_avg_sentiment), 3),
            'predicted_sentiment_ratio': round(float(pred_sentiment_ratio), 3),
            'predicted_sentiment': overall_sentiment,
            'confidence': round(float(confidence), 2)
        })
    
    return predictions


def predict_sentiment_moving_average(
    trend_df: pd.DataFrame,
    hours_ahead: int = 12,
    interval_hours: int = 3,
    window_size: int = 5
) -> List[Dict]:
    """
    Predict future sentiment using weighted moving average
    
    Args:
        trend_df: Historical trend data
        hours_ahead: Number of hours to predict ahead
        interval_hours: Hours per prediction interval
        window_size: Number of recent periods to consider
        
    Returns:
        List of prediction dictionaries
    """
    if trend_df.empty or len(trend_df) < 2:
        return []
    
    # Filter out intervals with no posts
    data_with_posts = trend_df[trend_df['total_posts'] > 0].copy()
    
    if len(data_with_posts) < 2:
        return []
    
    # Calculate trend (difference between recent and earlier averages)
    recent_data = data_with_posts.tail(window_size)
    recent_avg_sentiment = recent_data['avg_sentiment'].mean()
    recent_ratio = recent_data['sentiment_ratio'].mean()
    
    # Calculate trend rate
    if len(recent_data) >= 2:
        first_half = recent_data.head(len(recent_data) // 2)
        second_half = recent_data.tail(len(recent_data) // 2)
        
        trend_rate = (
            second_half['avg_sentiment'].mean() - first_half['avg_sentiment'].mean()
        ) / len(recent_data)
    else:
        trend_rate = 0
    
    # Generate predictions
    last_timestamp = trend_df['timestamp'].max()
    num_intervals = int(hours_ahead / interval_hours)
    
    predictions = []
    
    for i in range(1, num_intervals + 1):
        future_timestamp = last_timestamp + timedelta(hours=interval_hours * i)
        
        # Apply trend with decay
        decay_factor = 0.85 ** i  # Decay confidence over time
        pred_avg_sentiment = recent_avg_sentiment + (trend_rate * i * decay_factor)
        pred_sentiment_ratio = recent_ratio + (trend_rate * i * decay_factor * 0.5)
        
        # Clamp predictions
        pred_avg_sentiment = np.clip(pred_avg_sentiment, -1, 1)
        pred_sentiment_ratio = np.clip(pred_sentiment_ratio, -1, 1)
        
        # Determine overall sentiment
        if pred_avg_sentiment > 0.1:
            overall_sentiment = "positive"
        elif pred_avg_sentiment < -0.1:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"
        
        # Calculate confidence (decreases over time)
        base_confidence = 0.85
        confidence = base_confidence * (decay_factor)
        
        predictions.append({
            'timestamp': future_timestamp.isoformat(),
            'hours_ahead': interval_hours * i,
            'predicted_sentiment_score': round(float(pred_avg_sentiment), 3),
            'predicted_sentiment_ratio': round(float(pred_sentiment_ratio), 3),
            'predicted_sentiment': overall_sentiment,
            'confidence': round(float(confidence), 2)
        })
    
    return predictions


def predict_sentiment(
    df: pd.DataFrame,
    hours_ahead: int = 12,
    interval_hours: int = 3,
    method: str = "hybrid"
) -> Dict:
    """
    Main prediction function - combines multiple methods
    
    Args:
        df: DataFrame with sentiment data
        hours_ahead: Number of hours to predict
        interval_hours: Hours per prediction interval
        method: Prediction method ('linear', 'moving_average', 'hybrid')
        
    Returns:
        Dictionary with predictions and metadata
    """
    if df.empty:
        return {
            'predictions': [],
            'historical_summary': {},
            'error': 'No data available for prediction'
        }
    
    # Prepare time series data
    df = prepare_time_series_data(df)
    
    # Calculate trends
    trend_df = calculate_sentiment_trends(df, interval_hours)
    
    if trend_df.empty or len(trend_df) < 2:
        return {
            'predictions': [],
            'historical_summary': {},
            'error': 'Insufficient data for prediction'
        }
    
    # Generate predictions based on method
    if method == "linear":
        predictions = predict_sentiment_linear(trend_df, hours_ahead, interval_hours)
    elif method == "moving_average":
        predictions = predict_sentiment_moving_average(trend_df, hours_ahead, interval_hours)
    else:  # hybrid - average of both methods
        linear_pred = predict_sentiment_linear(trend_df, hours_ahead, interval_hours)
        ma_pred = predict_sentiment_moving_average(trend_df, hours_ahead, interval_hours)
        
        if linear_pred and ma_pred:
            predictions = []
            for lp, mp in zip(linear_pred, ma_pred):
                predictions.append({
                    'timestamp': lp['timestamp'],
                    'hours_ahead': lp['hours_ahead'],
                    'predicted_sentiment_score': round(
                        (lp['predicted_sentiment_score'] + mp['predicted_sentiment_score']) / 2, 3
                    ),
                    'predicted_sentiment_ratio': round(
                        (lp['predicted_sentiment_ratio'] + mp['predicted_sentiment_ratio']) / 2, 3
                    ),
                    'predicted_sentiment': lp['predicted_sentiment'],  # Use linear's classification
                    'confidence': round((lp['confidence'] + mp['confidence']) / 2, 2)
                })
        else:
            predictions = linear_pred or ma_pred
    
    # Calculate historical summary
    data_with_posts = trend_df[trend_df['total_posts'] > 0]
    
    historical_summary = {
        'total_posts_analyzed': int(df['total_posts'].sum()) if 'total_posts' in df.columns else len(df),
        'time_range_hours': (df['created_datetime'].max() - df['created_datetime'].min()).total_seconds() / 3600,
        'current_sentiment': {
            'score': round(float(data_with_posts['avg_sentiment'].iloc[-1]), 3) if len(data_with_posts) > 0 else 0,
            'ratio': round(float(data_with_posts['sentiment_ratio'].iloc[-1]), 3) if len(data_with_posts) > 0 else 0,
        },
        'average_sentiment': {
            'score': round(float(data_with_posts['avg_sentiment'].mean()), 3),
            'ratio': round(float(data_with_posts['sentiment_ratio'].mean()), 3)
        },
        'trend': 'increasing' if len(data_with_posts) >= 2 and 
                 data_with_posts['avg_sentiment'].iloc[-1] > data_with_posts['avg_sentiment'].iloc[0] 
                 else 'decreasing' if len(data_with_posts) >= 2 else 'stable'
    }
    
    return {
        'predictions': predictions,
        'historical_summary': historical_summary,
        'prediction_method': method,
        'interval_hours': interval_hours
    }

