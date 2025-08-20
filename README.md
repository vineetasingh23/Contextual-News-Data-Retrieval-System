# Contextual News Data Retrieval System

A sophisticated, AI-powered news retrieval system that understands natural language queries, provides location-aware search, and delivers intelligent news recommendations with Google Cloud AI integration.

## 🚀 **System Overview**

This system demonstrates advanced backend capabilities including:
- **Natural Language Processing** with Google Cloud Language API
- **Location-aware news retrieval** with geographic clustering
- **Intelligent trending algorithms** based on user interactions
- **RESTful API design** with comprehensive error handling
- **Advanced caching mechanisms** for performance optimization
- **Multi-criteria search** with flexible filtering options

## 🏗️ **Architecture & Technology Stack**

### **Backend Framework**
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.9+** - Core programming language
- **Uvicorn** - ASGI server for production deployment

### **Database & ORM**
- **PostgreSQL** - Robust relational database
- **SQLAlchemy 2.0** - Modern Python ORM with async support
- **UUID-based primary keys** for scalability

### **AI & Machine Learning**
- **Google Cloud Natural Language API** - Entity extraction and intent recognition
- **Custom NLP pipelines** for query analysis and summarization
- **Intelligent ranking algorithms** for relevance scoring

### **Data Processing**
- **Haversine formula** for geographic distance calculations
- **Multi-factor trending algorithms** with location clustering
- **Real-time data enrichment** with LLM-generated summaries

## 📊 **Core Features**

### **1. Natural Language Query Processing**
- **Intent Recognition**: Automatically detects user intent (search, category, source, nearby, trending)
- **Entity Extraction**: Identifies people, organizations, locations, and concepts
- **Context Understanding**: Processes queries like "Show me tech news from Mumbai"
- **Confidence Scoring**: Provides confidence levels for AI analysis

### **2. Location-Aware News Retrieval**
- **Geographic Filtering**: Search news within specified radius (0.1km to 1000km)
- **Coordinate Validation**: Ensures latitude (-90 to 90) and longitude (-180 to 180) accuracy
- **Distance-Based Ranking**: Articles sorted by proximity to user location
- **Location Clustering**: Intelligent grouping for trending calculations

### **3. Advanced Search Capabilities**
- **Text Search**: Full-text search across titles and descriptions
- **Category Filtering**: News by specific categories (Technology, Business, Sports, etc.)
- **Source Filtering**: Articles from specific news sources
- **Relevance Scoring**: Articles ranked by AI-calculated relevance scores
- **Score Range Filtering**: Filter by minimum and maximum relevance scores

### **4. Trending News Intelligence**
- **User Interaction Simulation**: Realistic user behavior modeling
- **Multi-Factor Scoring**: Considers views, clicks, shares, bookmarks, and comments
- **Recency Weighting**: Time-decay algorithms for trending relevance
- **Geographic Relevance**: Location-specific trending calculations
- **Intelligent Caching**: 5-minute cache with automatic refresh capabilities

### **5. Flexible Search API**
- **Multi-Criteria Search**: Combine multiple search parameters
- **Optional Parameters**: All search criteria are optional and combinable
- **Dynamic Filtering**: Real-time filter application and combination
- **Comprehensive Results**: Rich metadata with applied filters information

## 🔌 **API Endpoints**

### **Core Endpoints**

#### **POST /api/v1/news/query**
Main endpoint for natural language queries with AI analysis.

**Request:**
```json
{
  "query": "Show me technology news from Mumbai",
  "user_latitude": 19.076,
  "user_longitude": 72.877
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-20T15:33:31.480665",
  "total_results": 5,
  "limit": 5,
  "query_info": {
    "user_location": {"latitude": 19.076, "longitude": 72.877},
    "analysis_confidence": 0.85
  },
  "articles": [...],
  "query": "Show me technology news from Mumbai",
  "intent": "category",
  "entities": ["technology", "Mumbai"],
  "confidence": 0.85,
  "processing_time_ms": 1888.97
}
```

#### **GET /api/v1/news/category**
Retrieve articles by category with optional location filtering.

**Parameters:**
- `category` (required): News category
- `lat` (optional): Latitude for location filtering
- `lon` (optional): Longitude for location filtering
- `radius` (optional): Search radius in km (default: 100)
- `limit` (optional): Maximum results (default: 5, max: 100)

**Example:**
```bash
GET /api/v1/news/category?category=General&lat=19.076&lon=72.877&radius=200&limit=10
```

#### **GET /api/v1/news/search**
Text-based search with optional location filtering.

**Parameters:**
- `query` (required): Search text
- `lat` (optional): Latitude for location filtering
- `lon` (optional): Longitude for location filtering
- `radius` (optional): Search radius in km (default: 100)
- `limit` (optional): Maximum results (default: 5, max: 100)

**Example:**
```bash
GET /api/v1/news/search?query=AI technology&lat=19.076&lon=72.877&radius=150
```

#### **GET /api/v1/news/source**
Retrieve articles by news source with optional location filtering.

**Parameters:**
- `source` (required): News source name
- `lat` (optional): Latitude for location filtering
- `lon` (optional): Longitude for location filtering
- `radius` (optional): Search radius in km (default: 100)
- `limit` (optional): Maximum results (default: 5, max: 100)

**Example:**
```bash
GET /api/v1/news/source?source=DW&lat=19.076&lon=72.877&radius=200
```

#### **GET /api/v1/news/nearby**
Location-based news retrieval within specified radius.

**Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in km (default: 100, max: 1000)
- `limit` (optional): Maximum results (default: 5, max: 100)

**Example:**
```bash
GET /api/v1/news/nearby?lat=19.076&lon=72.877&radius=50&limit=10
```

#### **GET /api/v1/news/trending**
Get trending news articles for a specific location.

**Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `limit` (optional): Maximum results (default: 5, max: 100)
- `force_refresh` (optional): Clear cache and recalculate (default: false)

**Example:**
```bash
GET /api/v1/news/trending?lat=19.076&lon=72.877&limit=10&force_refresh=true
```

### **Advanced Endpoints**

#### **GET /api/v1/news/flexible**
Multi-criteria search with flexible parameter combinations.

**Parameters:**
- `query` (optional): Text search query
- `category` (optional): News category
- `source` (optional): News source
- `lat` (optional): Latitude for location filtering
- `lon` (optional): Longitude for location filtering
- `radius` (optional): Search radius in km (default: 100)
- `min_score` (optional): Minimum relevance score (0.0 to 1.0)
- `max_score` (optional): Maximum relevance score (0.0 to 1.0)
- `limit` (optional): Maximum results (default: 5, max: 100)

**Example:**
```bash
GET /api/v1/news/flexible?query=technology&category=Technology&lat=19.076&lon=72.877&radius=200&min_score=0.7&limit=10
```

#### **GET /health**
System health check with detailed status information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-20T15:33:08.981643",
  "version": "1.0.0",
  "database_status": "connected",
  "llm_service_status": "available",
  "uptime_seconds": 7.065259695053101
}
```

## 🗄️ **Database Schema**

### **Core Tables**

#### **news_articles**
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

#### **user_interactions**
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

#### **trending_scores**
```sql
CREATE TABLE trending_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES news_articles(id),
    trending_score FLOAT,
    location_cluster VARCHAR,
    calculated_at TIMESTAMP
);
```

## 🔧 **Installation & Setup**

### **Prerequisites**
- Python 3.9+
- PostgreSQL 12+
- Google Cloud account with Natural Language API enabled

### **1. Clone Repository**
```bash
git clone https://github.com/vineetasingh23/Contextual-News-Data-Retrieval-System.git
cd Contextual-News-Data-Retrieval-System
```

### **2. Install Dependencies**
```bash
pip install -r requirements.txt
```

### **3. Environment Configuration**
Create `.env` file with your credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/news_db
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./your-service-account-key.json
```

### **4. Database Setup**
```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb news_db

# The system will automatically create tables on startup
```

### **5. Google Cloud Setup**
1. Enable Natural Language API in your Google Cloud Console
2. Create a service account with "Natural Language API User" role
3. Download the service account key JSON file
4. Place it in your project directory and update `.env`

### **6. Start the Server**
```bash
python3 -m uvicorn main:app --reload --port 8006
```

## 📊 **Data Processing & Algorithms**

### **Query Analysis Pipeline**
1. **Text Preprocessing**: Clean and normalize user input
2. **Entity Extraction**: Identify people, organizations, locations, concepts
3. **Intent Classification**: Determine user's search intent
4. **Confidence Scoring**: Calculate analysis reliability
5. **Query Optimization**: Enhance search parameters

### **Trending Score Algorithm**
The system uses a sophisticated 5-factor scoring algorithm:

1. **Volume Score**: Raw interaction counts (views, clicks, shares, bookmarks, comments)
2. **Engagement Weighting**: Different weights for different interaction types
3. **Recency Factor**: Exponential time decay (24-hour half-life)
4. **Geographic Relevance**: Distance-based relevance scoring
5. **Article Quality**: Relevance score integration

**Formula:**
```
trending_score = (views × 1 + clicks × 2 + shares × 3 + bookmarks × 2 + comments × 2) × e^(-time_diff/86400)
```

### **Location Clustering**
- **Geographic Segmentation**: 100km radius clustering
- **Distance Calculation**: Haversine formula for accurate measurements
- **Location-Specific Caching**: Separate cache entries per location cluster

## 🚀 **Performance Features**

### **Caching Strategy**
- **In-Memory Caching**: Fast access to trending calculations
- **TTL Management**: 5-minute cache expiration
- **Location-Based Keys**: Separate cache for different geographic areas
- **Force Refresh**: Manual cache invalidation capability

### **Database Optimization**
- **Indexed Queries**: Optimized for common search patterns
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Smart filtering and sorting algorithms

### **Response Optimization**
- **Processing Time Tracking**: Monitor API performance
- **Efficient Data Serialization**: Optimized JSON response generation
- **Async Processing**: Non-blocking request handling

## 🔒 **Error Handling & Validation**

### **HTTP Status Codes**
- **200 OK**: Successful response
- **400 Bad Request**: Invalid parameters or missing required fields
- **404 Not Found**: No results found for query
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server-side errors

### **Input Validation**
- **Coordinate Validation**: Latitude (-90 to 90), Longitude (-180 to 180)
- **Radius Validation**: 0.1km to 1000km range
- **Limit Validation**: 1 to 100 results maximum
- **Score Range Validation**: 0.0 to 1.0 relevance scores

### **Error Response Format**
```json
{
  "success": false,
  "timestamp": "2025-08-20T15:33:31.480665",
  "error_code": "VALIDATION_ERROR",
  "error_message": "Validation error",
  "details": {
    "errors": [...],
    "body": {...}
  },
  "request_id": "uuid-string"
}
```

## 📈 **Usage Examples**

### **Basic News Search**
```bash
# Search for technology news
curl "http://localhost:8006/api/v1/news/search?query=technology&limit=5"

# Get news by category
curl "http://localhost:8006/api/v1/news/category?category=Technology&limit=10"

# Find nearby news
curl "http://localhost:8006/api/v1/news/nearby?lat=19.076&lon=72.877&radius=100"
```

### **Advanced Location-Based Search**
```bash
# Technology news near Mumbai with high relevance
curl "http://localhost:8006/api/v1/news/flexible?query=technology&category=Technology&lat=19.076&lon=72.877&radius=200&min_score=0.7&limit=10"

# Trending news in specific area
curl "http://localhost:8006/api/v1/news/trending?lat=19.076&lon=72.877&limit=10&force_refresh=true"
```

### **Natural Language Queries**
```bash
# AI-powered natural language search
curl -X POST "http://localhost:8006/api/v1/news/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me business news from New York",
    "user_latitude": 40.7128,
    "user_longitude": -74.0060
  }'
```

## 🧪 **Testing & Validation**

### **Health Check**
```bash
curl "http://localhost:8006/health"
```

### **API Documentation**
- **Swagger UI**: `http://localhost:8006/docs`
- **ReDoc**: `http://localhost:8006/redoc`
- **OpenAPI Schema**: `http://localhost:8006/openapi.json`

### **Test Scenarios**
1. **Parameter Validation**: Test invalid coordinates, limits, and parameters
2. **Location Filtering**: Verify distance-based filtering accuracy
3. **Trending Algorithms**: Test trending score calculations
4. **Error Handling**: Verify proper error responses and status codes
5. **Performance**: Monitor response times and caching effectiveness

## 🔮 **Future Enhancements**

### **Planned Features**
- **Real-time News Streaming**: WebSocket support for live updates
- **Advanced Analytics**: User behavior analysis and insights
- **Machine Learning**: Personalized news recommendations
- **Multi-language Support**: International news and language detection
- **Social Features**: User comments, ratings, and sharing

### **Scalability Improvements**
- **Redis Integration**: Distributed caching for horizontal scaling
- **Microservices Architecture**: Service decomposition for better scalability
- **Load Balancing**: Multiple instance support
- **Database Sharding**: Horizontal database scaling

## 📚 **API Reference**

### **Response Schema**
All endpoints return consistent JSON responses with:
- **Success Status**: Boolean indicating operation success
- **Timestamp**: ISO 8601 formatted response time
- **Total Results**: Count of articles returned
- **Limit Applied**: Maximum results requested
- **Articles Array**: Array of news article objects
- **Metadata**: Query information, filters applied, processing time

### **Article Schema**
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

## 🤝 **Contributing**

This project demonstrates advanced backend development capabilities. To contribute:

1. Fork the repository
2. Create a feature branch
3. Implement improvements
4. Add comprehensive tests
5. Submit a pull request

## 📄 **License**

This project is developed as a demonstration of advanced backend system capabilities.

## 🏆 **System Highlights**

- **100% RESTful API Compliance**: Follows all REST principles and best practices
- **Enterprise-Grade Error Handling**: Comprehensive validation and error responses
- **AI-Powered Intelligence**: Google Cloud integration for natural language understanding
- **Location-Aware Architecture**: Sophisticated geographic algorithms and caching
- **Production-Ready Code**: Professional-grade implementation with comprehensive testing
- **Scalable Design**: Modern architecture supporting horizontal scaling
- **Rich Metadata**: Comprehensive response information for debugging and monitoring

---

**Built with ❤️ using FastAPI, PostgreSQL, and Google Cloud AI**
