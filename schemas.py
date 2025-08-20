from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class NewsQuery(BaseModel):
    query: str
    user_latitude: float
    user_longitude: float

class NewsResponse(BaseModel):
    articles: List[dict]
    query: str
    intent: str
    entities: List[str]
    total_results: int

class CategoryResponse(BaseModel):
    id: UUID
    title: str
    description: str
    url: str
    publication_date: datetime
    source_name: str
    category: List[str]
    relevance_score: float
    latitude: Optional[float]
    longitude: Optional[float]
    llm_summary: Optional[str]

class SearchResponse(BaseModel):
    id: UUID
    title: str
    description: str
    url: str
    publication_date: datetime
    source_name: str
    category: List[str]
    relevance_score: float
    latitude: Optional[float]
    longitude: Optional[float]
    llm_summary: Optional[str]

class SourceResponse(BaseModel):
    id: UUID
    title: str
    description: str
    url: str
    publication_date: datetime
    source_name: str
    category: List[str]
    relevance_score: float
    latitude: Optional[float]
    longitude: Optional[float]
    llm_summary: Optional[str]

class NearbyResponse(BaseModel):
    id: UUID
    title: str
    description: str
    url: str
    publication_date: datetime
    source_name: str
    category: List[str]
    relevance_score: float
    latitude: Optional[float]
    longitude: Optional[float]
    llm_summary: Optional[str]

class TrendingResponse(BaseModel):
    articles: List[dict]
    trending_scores: List[float]
    location_cluster: str
    total_results: int
