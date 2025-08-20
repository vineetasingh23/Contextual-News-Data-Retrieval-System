
# Contextual News Data Retrieval System

A modern news retrieval system that understands natural language and delivers personalized, location-aware news using Google Cloud AI.

## What It Does

* **Natural Language Understanding** – Ask things like *“Show me tech news from Mumbai”* and get exactly what you want
* **Location Awareness** – Prioritizes local and regional news automatically
* **AI-Powered Analysis** – Extracts intent and context with Google Cloud Natural Language API
* **Real-Time Trending** – Highlights what’s popular in your area
* **Multi-Source Aggregation** – Pulls articles from multiple sources with intelligent filtering

## Key Features

* **Plain English Search** – Smart query understanding with intent + entity extraction
* **Geo-Intelligence** – Location-based filtering, radius search, and nearby news discovery
* **Trending Algorithm** – Considers engagement (views, shares, comments) with time-decay scoring
* **Flexible Search** – Combine text, category, source, and location filters with relevance scoring

## Quick Start

### Requirements

* Python 3.9+
* PostgreSQL 12+
* Google Cloud account with Natural Language API

### Setup

```bash
git clone https://github.com/vineetasingh23/Contextual-News-Data-Retrieval-System.git
cd Contextual-News-Data-Retrieval-System
pip install -r requirements.txt

cp .env.example .env
# update DB URL & Google Cloud credentials

python3 -m uvicorn main:app --reload --port 8006
```

Docs available at `http://localhost:8006/docs`

## API Endpoints

### Smart Query

```http
POST /api/v1/news/ask
```

```json
{
  "query": "What's happening in technology today?",
  "user_latitude": 19.076,
  "user_longitude": 72.877
}
```

### Browse by Category

```http
GET /api/v1/news/browse/{category}?lat=19.076&lon=72.877&limit=10
```

### Search

```http
GET /api/v1/news/search?query=artificial intelligence&lat=19.076&lon=72.877
```

### Nearby News

```http
GET /api/v1/news/nearby?lat=19.076&lon=72.877&radius=100
```

### Trending Now

```http
GET /api/v1/news/trending?lat=19.076&lon=72.877&limit=10
```

## Example Response

```json
{
  "articles": [
    {
      "title": "AI Revolution in Healthcare",
      "url": "https://example.com/article",
      "source_name": "TechCrunch",
      "category": ["Technology", "Health"],
      "relevance_score": 0.92,
      "ai_summary": "Concise AI-generated summary..."
    }
  ],
  "total_results": 15,
  "query_info": {"intent": "technology_news", "confidence": 0.95}
}
```

## Database

* **news\_articles** – stores articles, metadata, locations
* **user\_interactions** – tracks engagement (for trending)
* **trending\_scores** – cached trending scores by location

## Configuration

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/news_db
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

Enable **Google Cloud Natural Language API**, create a service account, and update `.env` with the credentials.

## Architecture

* **Backend**: FastAPI
* **Database**: PostgreSQL + SQLAlchemy
* **AI**: Google Cloud Natural Language API
* **Geo**: Haversine formula for distance
* **Caching**: In-memory for trending feeds

