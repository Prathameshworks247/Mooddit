import re
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_keywords(query: str) -> str:
    """Extract and clean key phrases from user query."""
    doc = nlp(query.lower())
    keywords = [chunk.text for chunk in doc.noun_chunks]
    cleaned = "+".join([re.sub(r"[^a-z0-9]+", "+", kw.strip()) for kw in keywords])
    return cleaned or query.replace(" ", "+")
