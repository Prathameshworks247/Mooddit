"""
Sentiment analysis with optional lightweight backend for low-memory deploys (e.g. Render 512MB).
Set USE_LIGHTWEIGHT_SENTIMENT=1 to use VADER (no PyTorch/transformers). Otherwise uses RoBERTa.
"""

import os

# Use lightweight backend when explicitly set or when running on Render (low memory)
_use_lightweight = os.getenv("USE_LIGHTWEIGHT_SENTIMENT", "").strip().lower() in ("1", "true", "yes")
if os.getenv("RENDER"):
    _use_lightweight = True

if _use_lightweight:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    _analyzer = SentimentIntensityAnalyzer()
    SENTIMENT_BACKEND = "vader"

    def analyze_sentiment(text):
        if not isinstance(text, str) or not text.strip():
            return "neutral", 0
        scores = _analyzer.polarity_scores(text)
        compound = scores["compound"]
        if compound >= 0.05:
            return "positive", 1
        if compound <= -0.05:
            return "negative", -1
        return "neutral", 0
else:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch

    model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    label_map = {
        "LABEL_0": -1, "LABEL_1": 0, "LABEL_2": 1,
        "negative": -1, "neutral": 0, "positive": 1
    }

    SENTIMENT_BACKEND = "roberta"

    def analyze_sentiment(text):
        if not isinstance(text, str) or not text.strip():
            return "neutral", 0
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
            scores = torch.nn.functional.softmax(outputs.logits, dim=1)
            label_id = torch.argmax(scores, dim=1).item()
            label = model.config.id2label[label_id]
        sentiment_score = label_map.get(label, 0)
        return label, sentiment_score
