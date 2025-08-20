from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import time
import uuid

from database import get_db, create_tables
from models import NewsArticle, UserInteraction
from schemas import (
    NewsQuery, NewsResponse, ArticleBase,
    CategoryResponse, SearchResponse, SourceResponse,
    NearbyResponse, TrendingResponse, FlexibleSearchResponse,
    ErrorResponse, HealthResponse
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

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors with proper 422 status code"""
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error_code="VALIDATION_ERROR",
            error_message="Validation error",
            details={"errors": exc.errors(), "body": exc.body},
            request_id=str(uuid.uuid4())
        ).dict()
    )

# Services
news_service = NewsService()
llm_service = GoogleCloudLLMService()
startup_time = time.time()

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

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Simple health check endpoint"""
    try:
        # Check database connection
        db = next(get_db())
        db_status = "connected" if db else "disconnected"
        db.close()
        
        # Check LLM service
        llm_status = "available" if llm_service else "unavailable"
        
        return HealthResponse(
            status="healthy",
            database_status=db_status,
            llm_service_status=llm_status,
            uptime_seconds=time.time() - startup_time
        )
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            database_status="error",
            llm_service_status="error",
            uptime_seconds=time.time() - startup_time
        )

@app.post("/api/v1/news/query", response_model=NewsResponse)
async def query_news(query_data: NewsQuery, db: Session = Depends(get_db)):
    """Main endpoint for natural language news queries"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        # Validate query data
        if not query_data.query or query_data.query.strip() == "":
            raise HTTPException(status_code=400, detail="Query text is required")
        
        if not (-90 <= query_data.user_latitude <= 90):
            raise HTTPException(status_code=400, detail="User latitude must be between -90 and 90")
        
        if not (-180 <= query_data.user_longitude <= 180):
            raise HTTPException(status_code=400, detail="User longitude must be between -180 and 180")
        
        # Analyze the query using LLM
        analysis = llm_service.analyze_query(query_data.query)
        
        # Get articles based on intent
        articles = news_service.get_articles_by_intent(
            db, analysis["intent"], analysis["entities"], 
            query_data.user_latitude, query_data.user_longitude
        )
        
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found matching your query")
        
        processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        return NewsResponse(
            articles=articles,
            query=query_data.query,
            intent=analysis["intent"],
            entities=analysis["entities"],
            confidence=analysis.get("confidence", 0.0),
            processing_time_ms=processing_time,
            total_results=len(articles),
            limit=len(articles),
            query_info={
                "user_location": {
                    "latitude": query_data.user_latitude,
                    "longitude": query_data.user_longitude
                },
                "analysis_confidence": analysis.get("confidence", 0.0)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/category", response_model=CategoryResponse)
async def get_news_by_category(
    category: str,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius: Optional[float] = 100.0,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get news articles by category with optional location filtering"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        if not category or category.strip() == "":
            raise HTTPException(status_code=400, detail="Category parameter is required")
        
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        # Validate location parameters if provided
        if lat is not None and not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
        
        if lon is not None and not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
        
        if radius < 0.1 or radius > 1000:
            raise HTTPException(status_code=400, detail="Radius must be between 0.1 and 1000 km")
        
        # If location is provided, use location-aware category search
        if lat is not None and lon is not None:
            articles = news_service.get_articles_by_category_with_location(db, category, lat, lon, radius, limit)
        else:
            articles = news_service.get_articles_by_category(db, category, limit)
        
        if not articles:
            location_msg = f" near ({lat}, {lon})" if lat is not None and lon is not None else ""
            raise HTTPException(status_code=404, detail=f"No articles found for category: {category}{location_msg}")
        
        processing_time = (time.time() - start_time) * 1000
        
        return CategoryResponse(
            category=category,
            articles=articles,
            total_results=len(articles),
            limit=limit,
            filters_applied={
                "location": {"lat": lat, "lon": lon, "radius": radius} if lat and lon else None,
                "category": category
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Category error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/search", response_model=SearchResponse)
async def search_news(
    query: str,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius: Optional[float] = 100.0,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Search news articles by text query with optional location filtering"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        if not query or query.strip() == "":
            raise HTTPException(status_code=400, detail="Search query is required")
        
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        # Validate location parameters if provided
        if lat is not None and not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
        
        if lon is not None and not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
        
        if radius < 0.1 or radius > 1000:
            raise HTTPException(status_code=400, detail="Radius must be between 0.1 and 1000 km")
        
        # If location is provided, use location-aware search
        if lat is not None and lon is not None:
            articles = news_service.search_articles_with_location(db, query, lat, lon, radius, limit)
        else:
            articles = news_service.search_articles(db, query, limit)
        
        if not articles:
            location_msg = f" near ({lat}, {lon})" if lat is not None and lon is not None else ""
            raise HTTPException(status_code=404, detail=f"No articles found for query: {query}{location_msg}")
        
        processing_time = (time.time() - start_time) * 1000
        
        return SearchResponse(
            search_query=query,
            articles=articles,
            total_results=len(articles),
            limit=limit,
            filters_applied={
                "location": {"lat": lat, "lon": lon, "radius": radius} if lat and lon else None,
                "query": query
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/source", response_model=SourceResponse)
async def get_news_by_source(
    source: str,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius: Optional[float] = 100.0,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get news articles by source with optional location filtering"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        if not source or source.strip() == "":
            raise HTTPException(status_code=400, detail="Source parameter is required")
        
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        # Validate location parameters if provided
        if lat is not None and not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
        
        if lon is not None and not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
        
        if radius < 0.1 or radius > 1000:
            raise HTTPException(status_code=400, detail="Radius must be between 0.1 and 1000 km")
        
        # If location is provided, use location-aware source search
        if lat is not None and lon is not None:
            articles = news_service.get_articles_by_source_with_location(db, source, lat, lon, radius, limit)
        else:
            articles = news_service.get_articles_by_source(db, source, limit)
        
        if not articles:
            location_msg = f" near ({lat}, {lon})" if lat is not None and lon is not None else ""
            raise HTTPException(status_code=404, detail=f"No articles found for source: {source}{location_msg}")
        
        processing_time = (time.time() - start_time) * 1000
        
        return SourceResponse(
            source=source,
            articles=articles,
            total_results=len(articles),
            limit=limit,
            filters_applied={
                "location": {"lat": lat, "lon": lon, "radius": radius} if lat and lon else None,
                "source": source
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Source error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/nearby", response_model=NearbyResponse)
async def get_nearby_news(
    lat: float,
    lon: float,
    radius: float = 100.0,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get news articles near a specific location"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        if not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
        
        if not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
        
        if radius < 0.1 or radius > 1000:
            raise HTTPException(status_code=400, detail="Radius must be between 0.1 and 1000 km")
        
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        articles = news_service.get_nearby_articles(db, lat, lon, radius, limit)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found in the specified radius")
        
        processing_time = (time.time() - start_time) * 1000
        
        return NearbyResponse(
            location={"latitude": lat, "longitude": lon},
            radius_km=radius,
            articles=articles,
            total_results=len(articles),
            limit=limit,
            filters_applied={
                "location": {"lat": lat, "lon": lon, "radius": radius}
            }
        )
    except HTTPException:
        raise
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
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        if not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
        
        if not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
        
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        if force_refresh:
            news_service.clear_trending_cache()
        
        result = news_service.get_trending_articles(db, lat, lon, limit)
        
        if result["total_results"] == 0:
            raise HTTPException(status_code=404, detail="No trending articles found for this location")
        
        processing_time = (time.time() - start_time) * 1000
        
        return TrendingResponse(
            articles=result["articles"],
            trending_scores=result["trending_scores"],
            location_cluster=result["location_cluster"],
            calculation_method="multi-factor scoring with location clustering",
            total_results=result["total_results"],
            limit=limit,
            filters_applied={
                "location": {"lat": lat, "lon": lon},
                "trending_algorithm": "user_interaction_based"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trending error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/news/flexible", response_model=FlexibleSearchResponse)
async def flexible_news_search(
    query: Optional[str] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius: Optional[float] = 100.0,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Flexible news search with multiple optional parameters (demonstrates query parameter flexibility)"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        # At least one search criteria must be provided
        if not any([query, category, source, lat, lon, min_score, max_score]):
            raise HTTPException(
                status_code=400, 
                detail="At least one search criteria must be provided (query, category, source, location, or score range)"
            )
        
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        # Validate location parameters if provided
        if lat is not None and not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
        
        if lon is not None and not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
        
        if radius < 0.1 or radius > 1000:
            raise HTTPException(status_code=400, detail="Radius must be between 0.1 and 1000 km")
        
        # Validate score range if provided
        if min_score is not None and not (0.0 <= min_score <= 1.0):
            raise HTTPException(status_code=400, detail="Min score must be between 0.0 and 1.0")
        
        if max_score is not None and not (0.0 <= max_score <= 1.0):
            raise HTTPException(status_code=400, detail="Max score must be between 0.0 and 1.0")
        
        if min_score is not None and max_score is not None and min_score > max_score:
            raise HTTPException(status_code=400, detail="Min score cannot be greater than max score")
        
        # Use the flexible search service
        articles = news_service.flexible_search(
            db, query, category, source, lat, lon, radius, min_score, max_score, limit
        )
        
        if not articles:
            # Build descriptive error message
            criteria = []
            if query:
                criteria.append(f"query: '{query}'")
            if category:
                criteria.append(f"category: '{category}'")
            if source:
                criteria.append(f"source: '{source}'")
            if lat and lon:
                criteria.append(f"location: ({lat}, {lon})")
            if min_score is not None or max_score is not None:
                score_range = f"score: {min_score or 0.0}-{max_score or 1.0}"
                criteria.append(score_range)
            
            criteria_str = ", ".join(criteria)
            raise HTTPException(status_code=404, detail=f"No articles found matching criteria: {criteria_str}")
        
        processing_time = (time.time() - start_time) * 1000
        
        return FlexibleSearchResponse(
            articles=articles,
            total_results=len(articles),
            limit=limit,
            search_criteria={
                "query": query,
                "category": category,
                "source": source,
                "location": {"lat": lat, "lon": lon, "radius": radius} if lat and lon else None,
                "score_range": {"min": min_score, "max": max_score} if min_score or max_score else None
            },
            filters_applied={
                "location": {"lat": lat, "lon": lon, "radius": radius} if lat and lon else None,
                "category": category,
                "source": source,
                "score_range": {"min": min_score, "max": max_score} if min_score or max_score else None
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Flexible search error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)
