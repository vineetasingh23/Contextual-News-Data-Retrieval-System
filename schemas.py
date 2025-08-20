from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

# Base article schema for consistency
class ArticleBase(BaseModel):
    id: UUID
    title: str
    description: str
    url: str
    publication_date: datetime
    source_name: str
    category: List[str]
    relevance_score: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    llm_summary: Optional[str] = None

# Base response schema with consistent metadata
class BaseResponse(BaseModel):
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.now)
    total_results: int
    limit: int
    query_info: Optional[Dict[str, Any]] = None
    pagination: Optional[Dict[str, Any]] = None

# Request schemas
class NewsQuery(BaseModel):
    query: str = Field(..., description="Natural language query for news search")
    user_latitude: float = Field(..., ge=-90, le=90, description="User's latitude")
    user_longitude: float = Field(..., ge=-180, le=180, description="User's longitude")

# Enhanced response schemas with consistent structure
class NewsResponse(BaseResponse):
    """Main endpoint response with AI analysis"""
    articles: List[ArticleBase]
    query: str
    intent: str
    entities: List[str]
    confidence: float
    processing_time_ms: Optional[float] = None

class CategoryResponse(BaseResponse):
    """Category-based news response"""
    articles: List[ArticleBase]
    category: str
    filters_applied: Dict[str, Any]

class SearchResponse(BaseResponse):
    """Text search response"""
    articles: List[ArticleBase]
    search_query: str
    filters_applied: Dict[str, Any]

class SourceResponse(BaseResponse):
    """Source-based news response"""
    articles: List[ArticleBase]
    source: str
    filters_applied: Dict[str, Any]

class NearbyResponse(BaseResponse):
    """Location-based news response"""
    articles: List[ArticleBase]
    location: Dict[str, float]
    radius_km: float
    filters_applied: Dict[str, Any]

class TrendingResponse(BaseResponse):
    """Trending news response"""
    articles: List[ArticleBase]
    trending_scores: List[float]
    location_cluster: str
    calculation_method: str
    filters_applied: Dict[str, Any]

class FlexibleSearchResponse(BaseResponse):
    """Flexible search response with multiple criteria"""
    articles: List[ArticleBase]
    search_criteria: Dict[str, Any]
    filters_applied: Dict[str, Any]

# Error response schema for consistency
class ErrorResponse(BaseModel):
    success: bool = False
    timestamp: datetime = Field(default_factory=datetime.now)
    error_code: str
    error_message: str
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None

# Health check response
class HealthResponse(BaseModel):
    status: str = "healthy"
    timestamp: datetime = Field(default_factory=datetime.now)
    version: str = "1.0.0"
    database_status: str
    llm_service_status: str
    uptime_seconds: Optional[float] = None
