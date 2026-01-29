import requests
import pandas as pd
import time

# Reddit requires a descriptive, unique User-Agent or returns 403
REDDIT_USER_AGENT = "Mooddit:RedditSentiment:1.0 (sentiment analysis; https://github.com/Prathameshworks247/Mooddit)"


def fetch_reddit_posts(query, limit=100):
    base_url = "https://www.reddit.com/search.json"
    headers = {"User-Agent": REDDIT_USER_AGENT}
    params = {"q": query, "sort": "new", "limit": 100}
    all_posts = []

    after = None
    while len(all_posts) < limit:
        if after:
            params["after"] = after
        response = requests.get(base_url, headers=headers, params=params)
        if response.status_code != 200:
            print("⚠️ Failed to fetch data:", response.status_code)
            break

        data = response.json().get("data", {})
        children = data.get("children", [])
        if not children:
            break

        for post in children:
            post_data = post["data"]
            all_posts.append({
                "title": post_data.get("title", ""),
                "url": post_data.get("url", ""),
                "selftext": post_data.get("selftext", ""),
                "created_utc": post_data.get("created_utc", 0),
                "score": post_data.get("score", 0),
                "subreddit": post_data.get("subreddit", "")
            })

        after = data.get("after")
        if not after:
            break
        time.sleep(1)  # prevent rate limit

    df = pd.DataFrame(all_posts)
    return df
