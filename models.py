from sqlalchemy import Column, String, Float, DateTime, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Import Base from database to avoid circular imports
from database import Base

class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    url = Column(String)
    publication_date = Column(DateTime)
    source_name = Column(String)
    category = Column(ARRAY(String))
    relevance_score = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    llm_summary = Column(Text)

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String)
    article_id = Column(UUID(as_uuid=True))
    interaction_type = Column(String)  # view, click, share, etc.
    timestamp = Column(DateTime)
    user_latitude = Column(Float)
    user_longitude = Column(Float)

class TrendingScore(Base):
    __tablename__ = "trending_scores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True))
    trending_score = Column(Float)
    location_cluster = Column(String)
    calculated_at = Column(DateTime)
