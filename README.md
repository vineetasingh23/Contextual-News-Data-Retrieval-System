# News API

A simple news retrieval system that uses Google Cloud AI to understand queries and find relevant articles.

## What it does

- Takes natural language queries like "show me tech news from Mumbai"
- Uses AI to figure out what you want (category, location, source, etc.)
- Returns relevant news articles with summaries
- Has basic endpoints for category, search, source, nearby, and trending news

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./your-service-account-key.json
```

3. Make sure PostgreSQL is running and create a database

4. Start the server:
```bash
python3 -m uvicorn main:app --reload --port 8009
```

## API Endpoints

- `POST /api/v1/news/query` - Main endpoint for natural language queries
- `GET /api/v1/news/category?category=Technology` - Get articles by category
- `GET /api/v1/news/search?query=AI` - Search articles
- `GET /api/v1/news/source?source=Reuters` - Get articles by source
- `GET /api/v1/news/nearby?lat=19.076&lon=72.877` - Get nearby articles
- `GET /api/v1/news/trending?lat=19.076&lon=72.877` - Get trending articles

## Example Query

```bash
curl -X POST "http://localhost:8009/api/v1/news/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me technology news", "user_latitude": 19.076, "user_longitude": 72.877}'
```

## Database

Uses PostgreSQL with these main tables:
- `news_articles` - stores the news data
- `user_interactions` - tracks user engagement for trending
- `trending_scores` - calculated trending scores

## Notes

- The system loads sample news data on startup
- Trending news uses simulated user interactions
- Google Cloud Natural Language API is used for AI processing
- Basic caching is implemented for trending feeds
