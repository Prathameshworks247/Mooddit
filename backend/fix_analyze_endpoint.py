#!/usr/bin/env python3
"""
Fix the entire /api/analyze endpoint indentation
"""

with open('main.py', 'r') as f:
    content = f.read()

# Find and replace the problematic section
# The issue is in the for loop starting around line 220
broken_section = """        )

grouped_data = []
for i in range(len(time_bins) - 1):
    start, end = time_bins[i], time_bins[i + 1]
            subset = time_series_df[(time_series_df.index >= start) & (time_series_df.index < end)]

    if subset.empty:
        sentiment_val = None
    else:
                # Ignore neutral sentiments for dominant calculation
                filtered_subset = subset[
                    subset["sentiment_label"].str.lower().isin(["positive", "negative", "label_2", "label_0"])
                ]
                if filtered_subset.empty:
            sentiment_val = None
                else:
                    dominant = filtered_subset["sentiment_label"].value_counts().idxmax()
                    label_lower = dominant.lower()
                    if label_lower in ["positive", "label_2"]:
                        sentiment_val = 1
                    elif label_lower in ["negative", "label_0"]:
                        sentiment_val = -1
                    else:
                        sentiment_val = 0
            
            grouped_data.append({
                "timestamp": start.isoformat(),
                "sentiment_value": sentiment_val
            })"""

fixed_section = """        )
        
        grouped_data = []
        for i in range(len(time_bins) - 1):
            start, end = time_bins[i], time_bins[i + 1]
            subset = time_series_df[(time_series_df.index >= start) & (time_series_df.index < end)]
            
            if subset.empty:
                sentiment_val = None
            else:
                # Ignore neutral sentiments for dominant calculation
                filtered_subset = subset[
                    subset["sentiment_label"].str.lower().isin(["positive", "negative", "label_2", "label_0"])
                ]
                if filtered_subset.empty:
                    sentiment_val = None
                else:
                    dominant = filtered_subset["sentiment_label"].value_counts().idxmax()
                    label_lower = dominant.lower()
                    if label_lower in ["positive", "label_2"]:
                        sentiment_val = 1
                    elif label_lower in ["negative", "label_0"]:
                        sentiment_val = -1
                    else:
                        sentiment_val = 0
            
            grouped_data.append({
                "timestamp": start.isoformat(),
                "sentiment_value": sentiment_val
            })"""

content = content.replace(broken_section, fixed_section)

with open('main.py', 'w') as f:
    f.write(content)

print("✅ Fixed /api/analyze endpoint!")

