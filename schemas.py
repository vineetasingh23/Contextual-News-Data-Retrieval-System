from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class NewsArticleBase(BaseModel):
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

class NewsArticleResponse(NewsArticleBase):
    id: UUID
    
    class Config:
        from_attributes = True

class NewsQueryRequest(BaseModel):
    query: str = Field(..., description="Natural language query for news")
    user_latitude: Optional[float] = Field(None, description="User's latitude")
    user_longitude: Optional[float] = Field(None, description="User's longitude")

class NewsQueryResponse(BaseModel):
    entities: List[str]
    intent: str
    articles: List[NewsArticleResponse]
    total_results: int
    query_used: str

class CategoryRequest(BaseModel):
    category: str = Field(..., description="News category to retrieve")
    limit: int = Field(5, ge=1, le=50, description="Number of articles to return")

class SourceRequest(BaseModel):
    source: str = Field(..., description="News source to retrieve")
    limit: int = Field(5, ge=1, le=50, description="Number of articles to return")

class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    limit: int = Field(5, ge=1, le=50, description="Number of articles to return")

class ScoreRequest(BaseModel):
    min_score: float = Field(0.0, ge=0.0, le=1.0, description="Minimum relevance score")
    limit: int = Field(5, ge=1, le=50, description="Number of articles to return")

class NearbyRequest(BaseModel):
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    radius: float = Field(10.0, gt=0, description="Radius in kilometers")
    limit: int = Field(5, ge=1, le=50, description="Number of articles to return")

class TrendingRequest(BaseModel):
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    limit: int = Field(5, ge=1, le=50, description="Number of articles to return")

class TrendingResponse(BaseModel):
    articles: List[NewsArticleResponse]
    trending_scores: List[float]
    location_cluster: str
    total_results: int

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
