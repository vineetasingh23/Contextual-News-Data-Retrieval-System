from sqlalchemy import Column, String, Float, DateTime, Text, Integer, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    url = Column(String(1000), nullable=False)
    publication_date = Column(DateTime, nullable=False)
    source_name = Column(String(200), nullable=False)
    category = Column(ARRAY(String), nullable=False)
    relevance_score = Column(Float, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    llm_summary = Column(Text, nullable=True)
    
    # Indexes for better query performance
    __table_args__ = (
        Index('idx_category', 'category'),
        Index('idx_source', 'source_name'),
        Index('idx_relevance_score', 'relevance_score'),
        Index('idx_publication_date', 'publication_date'),
        Index('idx_location', 'latitude', 'longitude'),
    )

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(String(100), nullable=False)  # Simulated user ID
    interaction_type = Column(String(50), nullable=False)  # view, click, share
    user_latitude = Column(Float, nullable=True)
    user_longitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_user_article_id', 'article_id'),
        Index('idx_user_id', 'user_id'),
        Index('idx_interaction_type', 'interaction_type'),
        Index('idx_timestamp', 'timestamp'),
        Index('idx_user_location', 'user_latitude', 'user_longitude'),
    )

class TrendingScore(Base):
    __tablename__ = "trending_scores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), nullable=False)
    trending_score = Column(Float, nullable=False)
    location_cluster = Column(String(100), nullable=False)  # Geographic cluster
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_trending_article_id', 'article_id'),
        Index('idx_trending_score', 'trending_score'),
        Index('idx_location_cluster', 'location_cluster'),
        Index('idx_last_updated', 'last_updated'),
    )
