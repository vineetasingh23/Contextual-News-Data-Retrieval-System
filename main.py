from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from database import get_db, create_tables
from models import Base
from news_service import NewsService
from schemas import (
    NewsArticleResponse, NewsQueryRequest, NewsQueryResponse,
    CategoryRequest, SourceRequest, SearchRequest, ScoreRequest,
    NearbyRequest, TrendingRequest, TrendingResponse, ErrorResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Contextual News Data Retrieval System",
    description="A sophisticated backend system that fetches, organizes, and enriches news articles with LLM-generated insights",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
news_service = NewsService()

@app.on_event("startup")
async def startup_event():
    """Initialize database and load news data on startup."""
    try:
        # Create database tables
        create_tables()
        logger.info("Database tables created successfully")
        
        # Load news data
        db = next(get_db())
        success = news_service.load_news_data(db)
        if success:
            logger.info("News data loaded successfully")
        else:
            logger.warning("Failed to load news data")
        db.close()
        
    except Exception as e:
        logger.error(f"Startup error: {e}")

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with system information."""
    return {
        "message": "Contextual News Data Retrieval System",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/api/v1/news/query", response_model=NewsQueryResponse, tags=["News Query"])
async def process_natural_language_query(
    request: NewsQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Process natural language queries using LLM to extract entities and intent.
    Returns relevant news articles based on the analysis.
    """
    try:
        result = news_service.process_natural_language_query(
            db, 
            request.query, 
            request.user_latitude, 
            request.user_longitude
        )
        
        return NewsQueryResponse(
            entities=result['entities'],
            intent=result['intent'],
            articles=[NewsArticleResponse.from_orm(article) for article in result['articles']],
            total_results=result['total_results'],
            query_used=result['query_used']
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/category", response_model=List[NewsArticleResponse], tags=["News Retrieval"])
async def get_articles_by_category(
    category: str = Query(..., description="News category"),
    limit: int = Query(5, ge=1, le=50, description="Number of articles to return"),
    db: Session = Depends(get_db)
):
    """Retrieve articles by category, ranked by publication date."""
    try:
        articles = news_service.get_articles_by_category(db, category, limit)
        return [NewsArticleResponse.from_orm(article) for article in articles]
        
    except Exception as e:
        logger.error(f"Error retrieving articles by category: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/source", response_model=List[NewsArticleResponse], tags=["News Retrieval"])
async def get_articles_by_source(
    source: str = Query(..., description="News source"),
    limit: int = Query(5, ge=1, le=50, description="Number of articles to return"),
    db: Session = Depends(get_db)
):
    """Retrieve articles by source, ranked by publication date."""
    try:
        articles = news_service.get_articles_by_source(db, source, limit)
        return [NewsArticleResponse.from_orm(article) for article in articles]
        
    except Exception as e:
        logger.error(f"Error retrieving articles by source: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/search", response_model=List[NewsArticleResponse], tags=["News Retrieval"])
async def search_articles(
    query: str = Query(..., description="Search query"),
    limit: int = Query(5, ge=1, le=50, description="Number of articles to return"),
    db: Session = Depends(get_db)
):
    """Search articles by query, ranked by relevance score and text matching."""
    try:
        articles = news_service.search_articles(db, query, limit)
        return [NewsArticleResponse.from_orm(article) for article in articles]
        
    except Exception as e:
        logger.error(f"Error searching articles: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/score", response_model=List[NewsArticleResponse], tags=["News Retrieval"])
async def get_articles_by_score(
    min_score: float = Query(0.0, ge=0.0, le=1.0, description="Minimum relevance score"),
    limit: int = Query(5, ge=1, le=50, description="Number of articles to return"),
    db: Session = Depends(get_db)
):
    """Retrieve articles by relevance score, ranked by score."""
    try:
        articles = news_service.get_articles_by_score(db, min_score, limit)
        return [NewsArticleResponse.from_orm(article) for article in articles]
        
    except Exception as e:
        logger.error(f"Error retrieving articles by score: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/nearby", response_model=List[NewsArticleResponse], tags=["News Retrieval"])
async def get_nearby_articles(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: float = Query(10.0, gt=0, description="Radius in kilometers"),
    limit: int = Query(5, ge=1, le=50, description="Number of articles to return"),
    db: Session = Depends(get_db)
):
    """Retrieve nearby articles using Haversine formula, ranked by distance."""
    try:
        articles = news_service.get_nearby_articles(db, lat, lon, radius, limit)
        return [NewsArticleResponse.from_orm(article) for article in articles]
        
    except Exception as e:
        logger.error(f"Error retrieving nearby articles: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/trending", response_model=TrendingResponse, tags=["Trending News"])
async def get_trending_news(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    limit: int = Query(5, ge=1, le=50, description="Number of articles to return"),
    db: Session = Depends(get_db)
):
    """Get trending news based on user interactions and location."""
    try:
        trending_data = news_service.get_trending_articles(db, lat, lon, limit)
        
        articles = [trending_item['article'] for trending_item in trending_data]
        trending_scores = [trending_item['trending_score'] for trending_item in trending_data]
        
        # Get location cluster for the response
        location_cluster = news_service._get_location_cluster(lat, lon)
        
        return TrendingResponse(
            articles=[NewsArticleResponse.from_orm(article) for article in articles],
            trending_scores=trending_scores,
            location_cluster=location_cluster,
            total_results=len(articles)
        )
        
    except Exception as e:
        logger.error(f"Error retrieving trending news: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    return ErrorResponse(
        error=exc.detail,
        detail=f"Request failed with status code {exc.status_code}"
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return ErrorResponse(
        error="Internal server error",
        detail="An unexpected error occurred"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
