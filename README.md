# Contextual News Data Retrieval System

A sophisticated backend system that fetches, organizes, and enriches news articles with LLM-generated insights. The system understands user queries, extracts entities and intent, and provides contextual news retrieval based on location, category, source, and relevance.

## Features

- **LLM-Powered Query Understanding**: Extracts entities, concepts, and user intent
- **Multiple Retrieval Strategies**: Category, source, search, relevance score, and location-based
- **Location-Aware**: Nearby news retrieval with geospatial calculations
- **Trending News Feed**: Location-based trending articles with user interaction simulation
- **Smart Ranking**: Context-aware article ranking and enrichment
- **Caching**: Redis-based caching for improved performance

## API Endpoints

- `GET /api/v1/news/category` - Retrieve articles by category
- `GET /api/v1/news/source` - Retrieve articles by source
- `GET /api/v1/news/search` - Search articles by query
- `GET /api/v1/news/score` - Retrieve articles by relevance score
- `GET /api/v1/news/nearby` - Retrieve nearby articles by location
- `GET /api/v1/news/trending` - Get trending news by location
- `POST /api/v1/news/query` - Process natural language queries with LLM

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database credentials
   ```

3. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

## Database Setup

The system uses PostgreSQL. Make sure you have it running and update the connection string in `.env`.

## Usage Examples

- Query nearby news: `GET /api/v1/news/nearby?lat=37.4220&lon=-122.0840&radius=10`
- Search for specific topics: `GET /api/v1/news/search?query=Elon Musk&location=Palo Alto`
- Get trending news: `GET /api/v1/news/trending?lat=37.4220&lon=-122.0840&limit=5`
