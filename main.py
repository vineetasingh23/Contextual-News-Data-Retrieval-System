from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from database import get_db, create_tables
from models import NewsArticle, UserInteraction
from schemas import (
    NewsQuery, NewsResponse,
    CategoryResponse, SearchResponse, SourceResponse,
    NearbyResponse, TrendingResponse
)
from news_service import NewsService
from llm_service import GoogleCloudLLMService

# Basic logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="News API",
    description="Simple news retrieval API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
news_service = NewsService()
llm_service = GoogleCloudLLMService()

@app.on_event("startup")
async def startup_event():
    """Initialize database and load data on startup"""
    try:
        create_tables()
        logger.info("Database tables created")
        
        # Load initial news data
        news_service.load_news_data()
        logger.info("News data loaded")
        
        # Ensure user interactions exist for trending
        db = next(get_db())
        try:
            if db.query(UserInteraction).count() == 0:
                news_service._simulate_user_interactions(db)
        finally:
            db.close()
        
    except Exception as e:
        logger.error(f"Startup error: {e}")

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/v1/news/query", response_model=NewsResponse)
async def query_news(query_data: NewsQuery, db: Session = Depends(get_db)):
    """Main endpoint for natural language news queries"""
    try:
        # Analyze the query using LLM
        analysis = llm_service.analyze_query(query_data.query)
        
        # Get articles based on intent
        articles = news_service.get_articles_by_intent(
            db, analysis["intent"], analysis["entities"], 
            query_data.user_latitude, query_data.user_longitude
        )
        
        return NewsResponse(
            articles=articles,
            query=query_data.query,
            intent=analysis["intent"],
            entities=analysis["entities"],
            total_results=len(articles)
        )
        
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/category", response_model=List[CategoryResponse])
async def get_news_by_category(
    category: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get news articles by category"""
    try:
        articles = news_service.get_articles_by_category(db, category, limit)
        return articles
    except Exception as e:
        logger.error(f"Category error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/search", response_model=List[SearchResponse])
async def search_news(
    query: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Search news articles by text query"""
    try:
        articles = news_service.search_articles(db, query, limit)
        return articles
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/source", response_model=List[SourceResponse])
async def get_news_by_source(
    source: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get news articles by source"""
    try:
        articles = news_service.get_articles_by_source(db, source, limit)
        return articles
    except Exception as e:
        logger.error(f"Source error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/nearby", response_model=List[NearbyResponse])
async def get_nearby_news(
    lat: float,
    lon: float,
    radius: float = 100.0,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get news articles near a specific location"""
    try:
        articles = news_service.get_nearby_articles(db, lat, lon, radius, limit)
        return articles
    except Exception as e:
        logger.error(f"Nearby error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/trending", response_model=TrendingResponse)
async def get_trending_news(
    lat: float,
    lon: float,
    limit: int = 5,
    force_refresh: bool = False,
    db: Session = Depends(get_db)
):
    """Get trending news articles for a location"""
    try:
        if force_refresh:
            news_service.clear_trending_cache()
        
        result = news_service.get_trending_articles(db, lat, lon, limit)
        return result
    except Exception as e:
        logger.error(f"Trending error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)
