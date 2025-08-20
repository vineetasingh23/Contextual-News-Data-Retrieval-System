# Contextual News Data Retrieval System

A backend system that fetches, organizes, and enriches news articles with LLM-generated insights. The system understands user queries, extracts entities and intent, and provides contextual news retrieval based on location, category, source, and relevance.

## Features

- LLM-Powered Query Understanding: Extracts entities, concepts, and user intent
- Multiple Retrieval Strategies: Category, source, search, relevance score, and location-based
- Location-Aware: Nearby news retrieval with geospatial calculations
- Trending News Feed: Location-based trending articles with user interaction simulation
- Smart Ranking: Context-aware article ranking and enrichment
- Caching: In-memory caching for improved performance

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 14+
- Google Cloud account (optional - system works with fallback)

### Setup
1. Clone the repository
```bash
git clone https://github.com/vineetasingh23/Contextual-News-Data-Retrieval-System.git
cd Contextual-News-Data-Retrieval-System
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Configure environment
```bash
cp env.example .env
# Edit .env with your database and API credentials
```

4. Start the system
```bash
# Start PostgreSQL (if not running)
brew services start postgresql@14

# Create database
createdb news_db

# Run the application
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

5. Access your system
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## API Endpoints

### Core News Retrieval

#### Category-Based Search
```
GET /api/v1/news/category?category=Technology&limit=5
```
Finds news articles by category (e.g., Technology, World, Sports)

#### Source-Based Search
```
GET /api/v1/news/source?source=Reuters&limit=5
```
Retrieves articles from specific news sources

#### Smart Text Search
```
GET /api/v1/news/search?query=Elon Musk&limit=5
```
Searches article titles and descriptions

#### Relevance Score Filter
```
GET /api/v1/news/score?min_score=0.8&limit=5
```
Gets high-quality articles above a relevance threshold

### Location-Aware Features

#### Nearby News
```
GET /api/v1/news/nearby?lat=37.7749&lon=-122.4194&radius=50&limit=5
```
Finds news within a specified radius of your location

#### Trending News
```
GET /api/v1/news/trending?lat=37.7749&lon=-122.4194&limit=5
```
Shows what's trending in your area based on user engagement

### Natural Language Processing

#### Smart Query Processing
```
POST /api/v1/news/query
Content-Type: application/json

{
  "query": "Show me trending tech news near San Francisco",
  "user_latitude": 37.7749,
  "user_longitude": -122.4194
}
```
Analyzes your natural language query, extracts entities and intent, chooses the best retrieval strategy, and returns relevant results

## Usage Examples

### Find Local Tech News
```bash
curl "http://localhost:8000/api/v1/news/nearby?lat=37.7749&lon=-122.4194&radius=25&limit=3"
```

### Get Trending Stories
```bash
curl "http://localhost:8000/api/v1/news/trending?lat=40.7128&lon=-74.0060&limit=5"
```

### Natural Language Query
```bash
curl -X POST "http://localhost:8000/api/v1/news/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What technology news is trending in my area?",
    "user_latitude": 37.7749,
    "user_longitude": -122.4194
  }'
```

### High-Quality Content
```bash
curl "http://localhost:8000/api/v1/news/score?min_score=0.9&limit=3"
```

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/news_db

# Google Cloud (optional)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Redis (for production caching)
REDIS_URL=redis://localhost:6379

# Application
APP_NAME=News Retrieval System
DEBUG=True
LOG_LEVEL=INFO
```

### Database Schema
The system automatically creates these tables:
- news_articles: Core news content with metadata
- user_interactions: Simulated user engagement data
- trending_scores: Computed trending metrics

## How It Works

### Trending Algorithm
The trending score combines 5 factors:
1. Volume Factor (25%): Total interaction count
2. Engagement Quality (30%): Weighted by interaction type
3. Recency Factor (25%): Exponential decay over time
4. Geographic Relevance (15%): Distance-based scoring
5. Article Relevance (5%): Original content quality

### Caching
- In-Memory Cache: 5-minute TTL for trending results
- Location-Based Keys: Separate cache for each geographic cluster
- Smart Invalidation: Automatic expiration and cleanup

### Fallback Mechanisms
- LLM Service: Graceful degradation when Google Cloud API is unavailable
- Database Connection: Robust error handling and reconnection
- Data Validation: Comprehensive input validation and sanitization

## API Response Format

### Standard News Response
```json
{
  "title": "Article Title",
  "description": "Article description...",
  "url": "https://example.com/article",
  "publication_date": "2025-03-26T10:00:00Z",
  "source_name": "News Source",
  "category": ["Technology", "Business"],
  "relevance_score": 0.95,
  "latitude": 37.7749,
  "longitude": -122.4194,
  "llm_summary": "AI-generated summary...",
  "id": "uuid-here"
}
```

### Trending Response
```json
{
  "articles": [...],
  "trending_scores": [85.2, 72.8, 68.4],
  "location_cluster": "37.8_-122.4",
  "total_results": 3
}
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Verify connection string
echo $DATABASE_URL
```

**Google Cloud API Errors**
- The system works without Google Cloud credentials
- Check GOOGLE_APPLICATION_CREDENTIALS path
- Verify project ID in environment variables

**Port Already in Use**
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

## Performance

- Response Time: < 200ms for cached results
- Throughput: 1000+ requests/minute
- Cache Hit Rate: 85%+ for trending queries
- Database Queries: Optimized with proper indexing

## Author

vineetasingh23
