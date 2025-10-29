"""
Topic Extraction Module
Extracts and clusters topics from Reddit posts
"""

import pandas as pd
import re
from typing import List, Dict, Tuple
from collections import Counter, defaultdict
import string

# Common words to ignore
STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'about', 'just',
    'this', 'that', 'these', 'those', 'there', 'here', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'than', 'too', 'very', 'my', 'your', 'his',
    'her', 'its', 'our', 'their', 'what', 'which', 'who', 'whom', 'whose',
    'if', 'then', 'else', 'so', 'as', 'than', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'new', 'first', 'last', 'long', 'great', 'little', 'own', 'same',
    'get', 'got', 'make', 'made', 'know', 'think', 'take', 'see', 'come',
    'want', 'look', 'use', 'find', 'give', 'tell', 'work', 'call', 'try',
    'reddit', 'post', 'sub', 'subreddit', 'comment', 'thread'
}

# Patterns for common topic formats
TOPIC_PATTERNS = [
    # Product names: "iPhone 17", "PS5 Pro", "RTX 4090"
    r'\b([A-Z][a-zA-Z0-9]*\s*(?:\d+|Pro|Max|Ultra|Plus|Mini|Air)+)\b',
    # Events: "World Cup 2026", "Super Bowl LIX"
    r'\b([A-Z][a-zA-Z]*\s+(?:Cup|Bowl|Championship|Olympics|Conference|Summit)\s+\d{4})\b',
    # Companies/Brands: all caps or title case phrases
    r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
    # Hashtag-like: consecutive caps
    r'\b([A-Z]{2,}(?:[A-Z][a-z]+)+)\b',
]


def extract_keywords_from_text(text: str, min_length: int = 3) -> List[str]:
    """
    Extract potential keywords from text
    
    Args:
        text: Input text
        min_length: Minimum keyword length
    
    Returns:
        List of keywords
    """
    keywords = []
    
    # Try pattern matching first (for structured topics)
    for pattern in TOPIC_PATTERNS:
        matches = re.findall(pattern, text)
        keywords.extend(matches)
    
    # Also extract all title-case phrases (2-4 words)
    title_case_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b'
    title_matches = re.findall(title_case_pattern, text)
    keywords.extend(title_matches)
    
    # Extract capitalized words
    words = re.findall(r'\b[A-Z][a-zA-Z0-9]+\b', text)
    keywords.extend(words)
    
    # Clean and filter
    cleaned_keywords = []
    for kw in keywords:
        # Remove punctuation
        kw = kw.strip(string.punctuation)
        
        # Filter by length and stop words
        if len(kw) >= min_length and kw.lower() not in STOP_WORDS:
            cleaned_keywords.append(kw)
    
    return cleaned_keywords


def extract_topics_from_posts(posts_df: pd.DataFrame, top_n: int = 20) -> List[Dict]:
    """
    Extract trending topics from posts DataFrame
    
    Args:
        posts_df: DataFrame with 'title', 'score', 'num_comments', etc.
        top_n: Number of top topics to return
    
    Returns:
        List of topic dicts with metadata
    """
    if posts_df.empty:
        return []
    
    # Extract keywords from all titles
    all_keywords = []
    keyword_posts = defaultdict(list)  # Map keyword to posts
    
    for idx, row in posts_df.iterrows():
        title = row['title']
        keywords = extract_keywords_from_text(title)
        
        for kw in keywords:
            all_keywords.append(kw)
            keyword_posts[kw].append(idx)
    
    # Count keyword frequencies
    keyword_counts = Counter(all_keywords)
    
    # Calculate topic scores
    topic_scores = []
    
    for keyword, count in keyword_counts.most_common(top_n * 3):  # Get more candidates
        # Get posts that mention this keyword
        post_indices = keyword_posts[keyword]
        related_posts = posts_df.iloc[post_indices]
        
        # Calculate aggregate metrics
        total_score = related_posts['score'].sum()
        total_comments = related_posts['num_comments'].sum()
        avg_velocity = related_posts['velocity'].mean() if 'velocity' in related_posts else 0
        
        # Calculate topic score
        topic_score = (
            count * 100 +  # Frequency
            total_score * 0.5 +  # Reddit score
            total_comments * 2 +  # Comments (engagement)
            avg_velocity * 10  # Velocity (trending momentum)
        )
        
        # Get subreddits where this topic appears
        subreddits = related_posts['subreddit'].unique().tolist()
        
        topic_scores.append({
            'topic': keyword,
            'post_count': count,
            'total_score': int(total_score),
            'total_comments': int(total_comments),
            'avg_velocity': round(avg_velocity, 2),
            'topic_score': round(topic_score, 2),
            'subreddits': subreddits[:5],  # Top 5 subreddits
            'subreddit_count': len(subreddits)
        })
    
    # Sort by topic score
    topic_scores.sort(key=lambda x: x['topic_score'], reverse=True)
    
    # Group similar topics
    grouped_topics = group_similar_topics(topic_scores)
    
    return grouped_topics[:top_n]


def group_similar_topics(topics: List[Dict]) -> List[Dict]:
    """
    Group similar topics together (e.g., "iPhone 17" and "iPhone 17 Pro")
    
    Args:
        topics: List of topic dicts
    
    Returns:
        Grouped topics with primary topic representing the group
    """
    grouped = []
    used_topics = set()
    
    for topic in topics:
        if topic['topic'] in used_topics:
            continue
        
        topic_name = topic['topic']
        similar = [topic]
        
        # Find similar topics
        for other_topic in topics:
            if other_topic['topic'] in used_topics:
                continue
            
            if topic_name != other_topic['topic']:
                # Check if topics are similar
                if are_topics_similar(topic_name, other_topic['topic']):
                    similar.append(other_topic)
                    used_topics.add(other_topic['topic'])
        
        # Merge similar topics
        if len(similar) > 1:
            merged = merge_topics(similar)
            grouped.append(merged)
        else:
            grouped.append(topic)
        
        used_topics.add(topic_name)
    
    return grouped


def are_topics_similar(topic1: str, topic2: str) -> bool:
    """
    Check if two topics are similar
    
    Examples:
    - "iPhone 17" and "iPhone 17 Pro" -> True
    - "World Cup" and "World Cup 2026" -> True
    - "Tesla" and "SpaceX" -> False
    """
    t1_lower = topic1.lower()
    t2_lower = topic2.lower()
    
    # One is substring of the other
    if t1_lower in t2_lower or t2_lower in t1_lower:
        return True
    
    # Same root words (first 2-3 words match)
    t1_words = t1_lower.split()
    t2_words = t2_lower.split()
    
    if len(t1_words) >= 2 and len(t2_words) >= 2:
        if t1_words[0] == t2_words[0] and t1_words[1] == t2_words[1]:
            return True
    
    return False


def merge_topics(topics: List[Dict]) -> Dict:
    """
    Merge similar topics into one
    
    Args:
        topics: List of similar topic dicts
    
    Returns:
        Merged topic dict
    """
    # Use the most comprehensive name (usually the longest)
    topic_names = [t['topic'] for t in topics]
    primary_topic = max(topic_names, key=len)
    
    # Aggregate metrics
    merged = {
        'topic': primary_topic,
        'variants': topic_names if len(topic_names) > 1 else None,
        'post_count': sum(t['post_count'] for t in topics),
        'total_score': sum(t['total_score'] for t in topics),
        'total_comments': sum(t['total_comments'] for t in topics),
        'avg_velocity': sum(t['avg_velocity'] for t in topics) / len(topics),
        'topic_score': sum(t['topic_score'] for t in topics),
        'subreddits': list(set(sum([t['subreddits'] for t in topics], []))),
        'subreddit_count': len(set(sum([t['subreddits'] for t in topics], [])))
    }
    
    return merged


def extract_top_trending_topics(
    posts_df: pd.DataFrame,
    top_n: int = 10,
    min_posts: int = 2
) -> List[Dict]:
    """
    Extract top trending topics with filtering
    
    Args:
        posts_df: Posts DataFrame
        top_n: Number of topics to return
        min_posts: Minimum posts required for a topic
    
    Returns:
        List of top trending topics
    """
    topics = extract_topics_from_posts(posts_df, top_n * 2)
    
    # Filter by minimum posts
    filtered_topics = [t for t in topics if t['post_count'] >= min_posts]
    
    # Rank topics
    for rank, topic in enumerate(filtered_topics[:top_n], 1):
        topic['rank'] = rank
        
        # Calculate normalized metrics (0-100)
        max_score = filtered_topics[0]['topic_score']
        topic['trending_strength'] = round((topic['topic_score'] / max_score) * 100, 1)
    
    return filtered_topics[:top_n]


def get_topic_keywords(topic_name: str, posts_df: pd.DataFrame, limit: int = 10) -> List[str]:
    """
    Get related keywords for a topic from posts
    
    Args:
        topic_name: Topic to analyze
        posts_df: Posts DataFrame
        limit: Max keywords to return
    
    Returns:
        List of related keywords
    """
    # Filter posts mentioning the topic
    topic_posts = posts_df[posts_df['title'].str.contains(topic_name, case=False, na=False)]
    
    if topic_posts.empty:
        return []
    
    # Extract all keywords from these posts
    all_keywords = []
    for title in topic_posts['title']:
        keywords = extract_keywords_from_text(title)
        all_keywords.extend(keywords)
    
    # Count and filter
    keyword_counts = Counter(all_keywords)
    
    # Remove the main topic itself
    topic_words = set(topic_name.lower().split())
    
    related_keywords = [
        kw for kw, count in keyword_counts.most_common(limit * 2)
        if kw.lower() not in topic_words and kw.lower() != topic_name.lower()
    ]
    
    return related_keywords[:limit]

