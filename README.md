# Smart News API

A modern news retrieval system that understands natural language and delivers personalized, location-aware news content using Google Cloud AI.

## What It Does

Transform how people discover news with intelligent search capabilities:

- **Natural Language Understanding**: Ask "Show me tech news from Mumbai" and get exactly what you want
- **Smart Location Awareness**: Automatically prioritizes local and regional news based on your location
- **AI-Powered Analysis**: Uses Google Cloud AI to understand intent and extract relevant entities
- **Real-Time Trending**: Discovers what's hot in your area based on user engagement patterns
- **Multi-Source Aggregation**: Pulls from various news sources with intelligent filtering

## Key Features

### Natural Language Processing
- Process queries in plain English
- Extract intent, entities, and context
- Smart category and source detection

### Location Intelligence  
- Geographic filtering within custom radius
- Location-specific trending calculations
- Nearby news discovery

### Trending & Engagement
- Multi-factor trending algorithm
- User interaction tracking (views, shares, comments)
- Time-decay scoring for relevance

### Flexible Search
- Combine text, category, source, and location filters
- Score-based quality filtering
- Advanced multi-criteria search

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Google Cloud account with Natural Language API

### Setup
```bash
# Clone and install
git clone https://github.com/vineetasingh23/Contextual-News-Data-Retrieval-System.git
cd Contextual-News-Data-Retrieval-System
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL and Google Cloud credentials

# Start the service
python3 -m uvicorn main:app --reload --port 8006
```

Visit `http://localhost:8006/docs` for interactive API documentation.

## API Endpoints

### Smart Query (Recommended)
```bash
POST /api/v1/news/ask
```
Ask for news in natural language:
```json
{
  "query": "What's happening in technology today?",
  "user_latitude": 19.076,
  "user_longitude": 72.877
}
```

### Browse by Category
```bash
GET /api/v1/news/browse/{category}?lat=19.076&lon=72.877&limit=10
```
Categories: `technology`, `business`, `sports`, `health`, `entertainment`, `politics`

### Text Search
```bash
GET /api/v1/news/search?query=artificial intelligence&lat=19.076&lon=72.877
```

### By News Source
```bash
GET /api/v1/news/from/{source}?limit=10
```
Sources: `CNN`, `BBC`, `Reuters`, `TechCrunch`, `ESPN`

### Nearby News
```bash
GET /api/v1/news/nearby?lat=19.076&lon=72.877&radius=100
```

### Trending Now
```bash
GET /api/v1/news/trending?lat=19.076&lon=72.877&limit=10
```

### Advanced Search
```bash
GET /api/v1/news/advanced-search?query=AI&category=technology&min_score=0.8
```

## Example Response

```json
{
  "articles": [
    {
      "id": "uuid-string",
      "title": "AI Revolution in Healthcare",
      "description": "Latest breakthrough in medical AI...",
      "url": "https://example.com/article",
      "publication_date": "2025-03-26T04:30:15",
      "source_name": "TechCrunch",
      "category": ["Technology", "Health"],
      "relevance_score": 0.92,
      "location": {"latitude": 19.076, "longitude": 72.877},
      "ai_summary": "Concise AI-generated summary..."
    }
  ],
  "total_results": 15,
  "processing_time_ms": 234,
  "query_info": {
    "intent": "technology_news",
    "confidence": 0.95
  }
}
```

## Database Schema

### Core Tables
- **news_articles**: Article content, metadata, and location data
- **user_interactions**: Engagement tracking for trending calculations  
- **trending_scores**: Cached trending calculations with location clustering

## Testing Your Setup

### Health Check
```bash
curl "http://localhost:8006/health"
```

### Quick Test
```bash
# Basic search
curl "http://localhost:8006/api/v1/news/search?query=technology&limit=3"

# Location-aware search
curl "http://localhost:8006/api/v1/news/nearby?lat=19.076&lon=72.877&radius=50"

# Smart query
curl -X POST "http://localhost:8006/api/v1/news/ask" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me sports news", "user_latitude": 19.076, "user_longitude": 72.877}'
```

## Configuration

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/news_db
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### Google Cloud Setup
1. Enable Natural Language API in Google Cloud Console
2. Create service account with "Natural Language API User" role  
3. Download service account key JSON file
4. Update `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`

## Architecture

- **Backend**: FastAPI with async support and automatic API documentation
- **Database**: PostgreSQL with SQLAlchemy ORM for robust data handling
- **AI Processing**: Google Cloud Natural Language API for query understanding
- **Caching**: In-memory caching for trending feeds with intelligent TTL
- **Geographic**: Haversine formula for accurate distance calculations
- **Validation**: Comprehensive input validation and user-friendly error messages

## Use Cases

### For Developers
- Build news aggregation apps
- Create location-aware news widgets
- Integrate smart news search into existing platforms

### For Content Teams
- Monitor trending topics by region
- Track news coverage across sources
- Discover local stories and events

### For Researchers
- Analyze news patterns geographically
- Study trending topics over time
- Access structured news data with AI summaries

## API Documentation

- **Interactive Docs**: `http://localhost:8006/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8006/redoc` (ReDoc)
- **Health Check**: `http://localhost:8006/health`

## Contributing

This project welcomes contributions! Whether you're fixing bugs, adding features, or improving documentation, your help makes the news discovery experience better for everyone.

---

**Ready to revolutionize how people discover news?** Start with a simple query and experience the power of AI-driven news retrieval!
