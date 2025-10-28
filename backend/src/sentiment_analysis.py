from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Support both label styles: "LABEL_0" or "negative"
label_map = {
    "LABEL_0": -1, "LABEL_1": 0, "LABEL_2": 1,
    "negative": -1, "neutral": 0, "positive": 1
}

def analyze_sentiment(text):
    # Handle empty or non-string input gracefully
    if not isinstance(text, str) or text.strip() == "":
        return "neutral", 0

    # Tokenize text
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    
    # Model inference
    with torch.no_grad():
        outputs = model(**inputs)
        scores = torch.nn.functional.softmax(outputs.logits, dim=1)
        label_id = torch.argmax(scores, dim=1).item()
        label = model.config.id2label[label_id]
    
    # Map label to score
    sentiment_score = label_map.get(label, 0)  # Default to neutral if not found
    return label, sentiment_score
