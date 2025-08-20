# Project Structure Overview

## Contextual News Data Retrieval System

This document provides an overview of the system architecture and component organization.

## Directory Structure

```
Contextual-News-Data-Retrieval-System/
├── main.py                 # FastAPI application entry point
├── models.py               # SQLAlchemy database models
├── schemas.py              # Pydantic request/response schemas
├── database.py             # Database configuration and session management
├── llm_service.py          # Google Cloud Language API integration
├── news_service.py         # Core news retrieval and processing logic
├── news_data.json          # Sample news data file
├── requirements.txt        # Python dependencies
├── env.example             # Environment variables template

├── README.md               # Project documentation
└── PROJECT_STRUCTURE.md    # This file
```

## Component Architecture

### 1. FastAPI Application (`main.py`)
- **Purpose**: Main application entry point with REST API endpoints
- **Features**:
  - CORS middleware for cross-origin requests
  - Comprehensive error handling
  - API versioning (`/api/v1/`)
  - Automatic API documentation (`/docs`)
  - Database initialization and data loading on startup

### 2. Database Layer
- **Models** (`models.py`): SQLAlchemy ORM models for:
  - `NewsArticle`: Core news article data
  - `UserInteraction`: Simulated user engagement data
  - `TrendingScore`: Computed trending metrics
- **Database** (`database.py`): Connection management and table creation

### 3. Data Validation (`schemas.py`)
- **Request Schemas**: Input validation for API endpoints
- **Response Schemas**: Structured output formatting
- **Field Validation**: Type checking and constraints

### 4. LLM Integration (`llm_service.py`)
- **Google Cloud Language API**: Entity extraction and intent analysis
- **Query Processing**: Natural language understanding
- **Summary Generation**: Article content summarization
- **Fallback Logic**: Graceful degradation when API fails

### 5. News Processing (`news_service.py`)
- **Data Retrieval**: Multiple search strategies
- **Ranking Algorithms**: Relevance and distance-based sorting
- **Geospatial Calculations**: Haversine distance formula
- **Trending Logic**: User interaction simulation and scoring

## API Endpoints

### Core News Retrieval
- `GET /api/v1/news/category` - Articles by category
- `GET /api/v1/news/source` - Articles by source
- `GET /api/v1/news/search` - Text-based search
- `GET /api/v1/news/score` - Articles by relevance score
- `GET /api/v1/news/nearby` - Location-based retrieval

### Advanced Features
- `POST /api/v1/news/query` - Natural language processing
- `GET /api/v1/news/trending` - Location-based trending news

### Utility Endpoints
- `GET /` - System information
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## Data Flow

1. **User Query** → Natural language input
2. **LLM Analysis** → Entity extraction and intent detection
3. **Strategy Selection** → Choose appropriate retrieval method
4. **Data Retrieval** → Query database with filters
5. **Ranking & Enrichment** → Sort results and add LLM summaries
6. **Response** → Structured JSON output

## Key Features

### 1. Intelligent Query Understanding
- Uses Google Cloud Language API for entity extraction
- Determines user intent (category, source, nearby, score, search)
- Handles complex natural language queries

### 2. Multi-Strategy Retrieval
- **Category-based**: Filter by news categories
- **Source-based**: Filter by news sources
- **Search-based**: Full-text search with relevance scoring
- **Score-based**: High-relevance article filtering
- **Location-based**: Geographic proximity search

### 3. Advanced Ranking
- **Relevance Scoring**: Content-based ranking
- **Temporal Ranking**: Recent articles prioritized
- **Geographic Ranking**: Distance-based sorting
- **Trending Ranking**: User engagement metrics

### 4. Trending News System
- Simulates user interactions (views, clicks, shares)
- Calculates trending scores based on engagement and recency
- Location-aware clustering for geographic relevance
- Caching support for performance optimization

### 5. Robust Error Handling
- Graceful fallbacks when external APIs fail
- Comprehensive logging and monitoring
- User-friendly error messages
- Input validation and sanitization

## Technology Stack

- **Backend Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **LLM Service**: Google Cloud Natural Language API
- **Caching**: Redis (optional)
- **Geospatial**: Custom Haversine calculations
- **Validation**: Pydantic schemas
- **Testing**: Built-in test suite

## Setup Requirements

1. **Python 3.8+** with pip
2. **PostgreSQL** database server
3. **Google Cloud** project with Language API enabled
4. **Service account** credentials for Google Cloud
5. **Redis** server (optional, for caching)

## Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Redis-based caching for trending feeds
- **Geographic Clustering**: Location-based data segmentation
- **Async Processing**: Non-blocking API operations

## Security Features

- **Input Validation**: Comprehensive request sanitization
- **Error Handling**: No sensitive information leakage
- **CORS Configuration**: Configurable cross-origin policies
- **Environment Variables**: Secure credential management

## Monitoring & Logging

- **Structured Logging**: Comprehensive error tracking
- **Health Checks**: System status monitoring
- **Performance Metrics**: Query response times
- **Error Reporting**: Detailed exception information

## Future Enhancements

- **Real-time Updates**: WebSocket support for live news
- **Advanced Analytics**: User behavior tracking
- **Machine Learning**: Personalized content recommendations
- **Multi-language Support**: Internationalization
- **Mobile Optimization**: Responsive API design
