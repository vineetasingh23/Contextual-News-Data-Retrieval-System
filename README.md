# Contextual News Data Retrieval System

A news retrieval system that uses Google Cloud AI to understand natural language queries and provide location-aware news search.

## What it does

- Takes natural language queries like "show me tech news from Mumbai"
- Uses AI to figure out what you want (category, location, source, etc.)
- Returns relevant news articles with summaries
- Has endpoints for category, search, source, nearby, and trending news
- Supports location-based filtering and multi-criteria search

## Features

### Core Functionality
- Natural language query processing with Google Cloud Language API
- Location-aware news retrieval with geographic filtering
- Trending news algorithms based on user interactions
- Flexible search with multiple optional parameters
- Comprehensive error handling and validation

### Search Capabilities
- Text search across titles and descriptions
- Category-based filtering (Technology, Business, Sports, etc.)
- Source-based filtering (Reuters, CNN, BBC, etc.)
- Location-based search within specified radius
- Score-based filtering by relevance scores

### Trending Intelligence
- User interaction simulation (views, clicks, shares, bookmarks, comments)
- Multi-factor scoring with time decay
- Location-specific trending calculations
- Intelligent caching with 5-minute TTL

## API Endpoints

### Main Endpoints

**POST /api/v1/news/query**
Natural language queries with AI analysis
```json
{
  "query": "Show me technology news from Mumbai",
  "user_latitude": 19.076,
  "user_longitude": 72.877
}
```

**GET /api/v1/news/category**
Get articles by category with optional location filtering
```
/api/v1/news/category?category=General&lat=19.076&lon=72.877&radius=200&limit=10
```

**GET /api/v1/news/search**
Text search with optional location filtering
```
/api/v1/news/search?query=AI technology&lat=19.076&lon=72.877&radius=150
```

**GET /api/v1/news/source**
Get articles by news source with optional location filtering
```
/api/v1/news/source?source=DW&lat=19.076&lon=72.877&radius=200
```

**GET /api/v1/news/nearby**
Location-based news retrieval within specified radius
```
/api/v1/news/nearby?lat=19.076&lon=72.877&radius=50&limit=10
```

**GET /api/v1/news/trending**
Get trending news articles for a specific location
```
/api/v1/news/trending?lat=19.076&lon=72.877&limit=10&force_refresh=true
```

**GET /api/v1/news/flexible**
Multi-criteria search with flexible parameter combinations
```
/api/v1/news/flexible?query=technology&category=Technology&lat=19.076&lon=72.877&radius=200&min_score=0.7&limit=10
```

**GET /health**
System health check with database and service status

## Database Schema

### news_articles
```sql
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    url VARCHAR,
    publication_date TIMESTAMP,
    source_name VARCHAR,
    category TEXT[],
    relevance_score FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    llm_summary TEXT
);
```

### user_interactions
```sql
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR,
    article_id UUID REFERENCES news_articles(id),
    interaction_type VARCHAR, -- view, click, share, bookmark, comment
    timestamp TIMESTAMP,
    user_latitude FLOAT,
    user_longitude FLOAT
);
```

### trending_scores
```sql
CREATE TABLE trending_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES news_articles(id),
    trending_score FLOAT,
    location_cluster VARCHAR,
    calculated_at TIMESTAMP
);
```

## Setup

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Google Cloud account with Natural Language API enabled

### Installation

1. Clone the repository
```bash
git clone https://github.com/vineetasingh23/Contextual-News-Data-Retrieval-System.git
cd Contextual-News-Data-Retrieval-System
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Create .env file
```env
DATABASE_URL=postgresql://username:password@localhost:5432/news_db
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./your-service-account-key.json
```

4. Setup database
```bash
brew services start postgresql
createdb news_db
```

5. Google Cloud setup
- Enable Natural Language API in Google Cloud Console
- Create service account with "Natural Language API User" role
- Download service account key JSON file
- Place in project directory and update .env

6. Start server
```bash
python3 -m uvicorn main:app --reload --port 8006
```

## Response Format

All endpoints return consistent JSON responses:

```json
{
  "success": true,
  "timestamp": "2025-08-20T15:33:31.480665",
  "total_results": 5,
  "limit": 5,
  "articles": [...],
  "filters_applied": {...}
}
```

### Article Schema
```json
{
  "id": "uuid-string",
  "title": "Article Title",
  "description": "Article description...",
  "url": "https://example.com/article",
  "publication_date": "2025-03-26T04:30:15",
  "source_name": "News Source",
  "category": ["Category1", "Category2"],
  "relevance_score": 0.85,
  "latitude": 19.076,
  "longitude": 72.877,
  "llm_summary": "AI-generated summary..."
}
```

## Error Handling

- 200 OK: Successful response
- 400 Bad Request: Invalid parameters or missing required fields
- 404 Not Found: No results found for query
- 422 Unprocessable Entity: Validation errors
- 500 Internal Server Error: Server-side errors

## Testing

### Health Check
```bash
curl "http://localhost:8006/health"
```

### API Documentation
- Swagger UI: http://localhost:8006/docs
- ReDoc: http://localhost:8006/redoc

### Step-by-Step Testing Guide

#### Prerequisites Check
```bash
# Check Python version
python3 --version

# Check if PostgreSQL is running
brew services list | grep postgresql
```

#### 1. Health Check
```bash
curl "http://localhost:8006/health"
```
**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-20T15:44:31.744963",
  "version": "1.0.0",
  "database_status": "connected",
  "llm_service_status": "available",
  "uptime_seconds": 13.253198146820068
}
```

#### 2. Basic Endpoint Tests
```bash
# Test category endpoint
curl "http://localhost:8006/api/v1/news/category?category=General&limit=2"

# Test search endpoint
curl "http://localhost:8006/api/v1/news/search?query=news&limit=1"
```

#### 3. Location-Based Search
```bash
# Test nearby endpoint
curl "http://localhost:8006/api/v1/news/nearby?lat=19.076&lon=72.877&radius=200&limit=3"

# Test category with location
curl "http://localhost:8006/api/v1/news/category?category=General&lat=19.076&lon=72.877&radius=200&limit=3"
```

#### 4. Flexible Search
```bash
# Test multi-criteria search
curl "http://localhost:8006/api/v1/news/flexible?min_score=0.8&max_score=1.0&limit=2"

# Test with location and score
curl "http://localhost:8006/api/v1/news/flexible?query=news&lat=19.076&lon=72.877&radius=200&min_score=0.5&limit=3"
```

#### 5. Trending News
```bash
# Test trending endpoint
curl "http://localhost:8006/api/v1/news/trending?lat=19.076&lon=72.877&limit=3"

# Test with force refresh
curl "http://localhost:8006/api/v1/news/trending?lat=19.076&lon=72.877&limit=3&force_refresh=true"
```

#### 6. Natural Language Query
```bash
# Test main AI endpoint
curl -X POST "http://localhost:8006/api/v1/news/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me general news", "user_latitude": 19.076, "user_longitude": 72.877}'
```

#### 7. Error Handling Tests
```bash
# Test invalid coordinates
curl "http://localhost:8006/api/v1/news/nearby?lat=200&lon=72.877"

# Test missing required parameters
curl "http://localhost:8006/api/v1/news/category?category="

# Test invalid score range
curl "http://localhost:8006/api/v1/news/flexible?min_score=2.0&max_score=1.0"
```

### Quick Test Script
```bash
#!/bin/bash
echo "Testing News API..."

echo "1. Health Check..."
curl -s "http://localhost:8006/health" | jq '.status'

echo "2. Category Search..."
curl -s "http://localhost:8006/api/v1/news/category?category=General&limit=1" | jq '.total_results'

echo "3. Location Search..."
curl -s "http://localhost:8006/api/v1/news/nearby?lat=19.076&lon=72.877&radius=200&limit=1" | jq '.total_results'

echo "4. Flexible Search..."
curl -s "http://localhost:8006/api/v1/news/flexible?min_score=0.8&limit=1" | jq '.total_results'

echo "Testing complete!"
```

### What to Look For

#### Success Indicators
- ✅ All endpoints return 200 status codes
- ✅ JSON responses are properly formatted
- ✅ Articles contain all required fields
- ✅ Location filtering works correctly
- ✅ Error handling provides clear messages
- ✅ Response times are reasonable (< 2 seconds)

#### Common Issues
- ❌ Database connection errors (check PostgreSQL)
- ❌ Google Cloud API errors (check credentials)
- ❌ Port already in use (change port or kill process)
- ❌ Missing dependencies (check pip install)

### Troubleshooting

#### If server won't start
```bash
# Check if port is in use
lsof -ti:8006 | xargs kill -9

# Check Python path
which python3

# Check dependencies
pip list | grep fastapi
```

#### If database errors
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Test connection
psql -d news_db -c "SELECT 1;"
```

#### If Google Cloud errors
- Check if service account key exists
- Verify project ID in .env
- Ensure Natural Language API is enabled

### Example Queries

## Architecture

- FastAPI backend with async support
- PostgreSQL database with SQLAlchemy ORM
- Google Cloud Natural Language API for AI processing
- Haversine formula for geographic calculations
- In-memory caching for trending feeds
- Comprehensive input validation and error handling

## Notes

- System loads sample news data on startup
- Trending news uses simulated user interactions
- All endpoints support optional location filtering
- Flexible search allows combining multiple criteria
- Production-ready with proper error handling and validation
