from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, case
from models import NewsArticle, UserInteraction, TrendingScore
from llm_service import GoogleCloudLLMService
from typing import List, Dict, Optional
import json
from datetime import datetime, timedelta
import math
import logging
import random

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.llm_service = GoogleCloudLLMService()
        # Simple in-memory cache for trending results
        self._trending_cache = {}
        self._cache_ttl = 300  # 5 minutes cache TTL
    
    def load_news_data(self, db: Session) -> bool:
        """Load news data from JSON file into database."""
        try:
            with open('news_data.json', 'r') as file:
                news_data = json.load(file)
            
            for article_data in news_data:
                # Check if article already exists
                existing = db.query(NewsArticle).filter(NewsArticle.id == article_data['id']).first()
                if not existing:
                    # Generate LLM summary
                    llm_summary = self.llm_service.generate_summary(
                        article_data['title'], 
                        article_data['description']
                    )
                    
                    # Parse publication date
                    pub_date = datetime.fromisoformat(article_data['publication_date'].replace('Z', '+00:00'))
                    
                    article = NewsArticle(
                        id=article_data['id'],
                        title=article_data['title'],
                        description=article_data['description'],
                        url=article_data['url'],
                        publication_date=pub_date,
                        source_name=article_data['source_name'],
                        category=article_data['category'],
                        relevance_score=article_data['relevance_score'],
                        latitude=article_data.get('latitude'),
                        longitude=article_data.get('longitude'),
                        llm_summary=llm_summary
                    )
                    
                    db.add(article)
            
            db.commit()
            logger.info(f"Loaded {len(news_data)} news articles into database")
            return True
            
        except Exception as e:
            logger.error(f"Error loading news data: {e}")
            db.rollback()
            return False
    
    def get_articles_by_category(self, db: Session, category: str, limit: int = 5) -> List[NewsArticle]:
        """Retrieve articles by category, ranked by publication date."""
        # Use PostgreSQL-specific ARRAY operator for category search
        articles = db.query(NewsArticle).filter(
            NewsArticle.category.any(category)
        ).order_by(desc(NewsArticle.publication_date)).limit(limit).all()
        
        return articles
    
    def get_articles_by_source(self, db: Session, source: str, limit: int = 5) -> List[NewsArticle]:
        """Retrieve articles by source, ranked by publication date."""
        articles = db.query(NewsArticle).filter(
            NewsArticle.source_name.ilike(f"%{source}%")
        ).order_by(desc(NewsArticle.publication_date)).limit(limit).all()
        
        return articles
    
    def search_articles(self, db: Session, query: str, limit: int = 5) -> List[NewsArticle]:
        """Search articles by query, ranked by relevance score and text matching."""
        search_terms = query.lower().split()
        
        articles = db.query(NewsArticle).filter(
            or_(
                *[NewsArticle.title.ilike(f"%{term}%") for term in search_terms],
                *[NewsArticle.description.ilike(f"%{term}%") for term in search_terms]
            )
        ).order_by(desc(NewsArticle.relevance_score)).limit(limit).all()
        
        return articles
    
    def get_articles_by_score(self, db: Session, min_score: float, limit: int = 5) -> List[NewsArticle]:
        """Retrieve articles by relevance score, ranked by score."""
        articles = db.query(NewsArticle).filter(
            NewsArticle.relevance_score >= min_score
        ).order_by(desc(NewsArticle.relevance_score)).limit(limit).all()
        
        return articles
    
    def get_nearby_articles(self, db: Session, lat: float, lon: float, radius: float, limit: int = 5) -> List[NewsArticle]:
        """Retrieve nearby articles using Haversine formula, ranked by distance."""
        articles = db.query(NewsArticle).filter(
            and_(
                NewsArticle.latitude.isnot(None),
                NewsArticle.longitude.isnot(None)
            )
        ).all()
        
        # Calculate distances and sort
        articles_with_distance = []
        for article in articles:
            distance = self._calculate_distance(lat, lon, article.latitude, article.longitude)
            if distance <= radius:
                articles_with_distance.append((article, distance))
        
        # Sort by distance and return top results
        articles_with_distance.sort(key=lambda x: x[1])
        return [article for article, _ in articles_with_distance[:limit]]
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula."""
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def get_trending_articles(self, db: Session, lat: float, lon: float, limit: int = 5) -> List[Dict]:
        """Get trending articles based on user interactions and location with caching."""
        # Check cache first
        cache_key = self._get_cache_key(lat, lon, limit)
        cached_result = self._get_cached_trending(cache_key)
        if cached_result:
            return cached_result
        
        # Simulate user interactions if none exist
        self._simulate_user_interactions(db)
        
        # Calculate trending scores
        self._calculate_trending_scores(db, lat, lon)
        
        # Get trending articles for the location cluster
        location_cluster = self._get_location_cluster(lat, lon)
        
        trending_scores = db.query(TrendingScore).filter(
            TrendingScore.location_cluster == location_cluster
        ).order_by(desc(TrendingScore.trending_score)).limit(limit).all()
        
        articles = []
        for score in trending_scores:
            article = db.query(NewsArticle).filter(NewsArticle.id == score.article_id).first()
            if article:
                articles.append({
                    'article': article,
                    'trending_score': score.trending_score
                })
        
        # Cache the results
        self._set_cached_trending(cache_key, articles)
        
        return articles
    
    def _simulate_user_interactions(self, db: Session):
        """Simulate a comprehensive stream of user activity events for trending calculations."""
        # Check if interactions already exist
        existing_interactions = db.query(UserInteraction).first()
        if existing_interactions:
            return
        
        # Get articles to simulate interactions
        articles = db.query(NewsArticle).limit(50).all()
        
        # Enhanced interaction types with weights
        interaction_types = ['view', 'click', 'share', 'bookmark', 'comment']
        interaction_weights = [0.3, 0.4, 0.2, 0.08, 0.02]  # Probability weights
        
        # Simulate realistic user behavior
        user_ids = [f"user_{i}" for i in range(1, 101)]  # 100 simulated users
        
        for article in articles:
            # Generate realistic interaction patterns based on article relevance
            base_interactions = max(1, int(article.relevance_score * 10))
            num_interactions = random.randint(base_interactions, base_interactions + 5)
            
            for _ in range(num_interactions):
                # Weighted random selection of interaction type
                interaction_type = random.choices(interaction_types, weights=interaction_weights)[0]
                
                # Generate realistic user location near article location
                if article.latitude and article.longitude:
                    # Users within 50km radius of article location
                    user_lat = article.latitude + random.uniform(-0.5, 0.5)
                    user_lon = article.longitude + random.uniform(-0.5, 0.5)
                else:
                    # Random global location if article has no coordinates
                    user_lat = random.uniform(-90, 90)
                    user_lon = random.uniform(-180, 180)
                
                # Realistic timestamp distribution (more recent = more likely)
                hours_ago = random.choices(
                    [1, 2, 4, 8, 12, 24, 48, 72],
                    weights=[0.3, 0.25, 0.2, 0.15, 0.08, 0.02, 0.0, 0.0]
                )[0]
                
                interaction = UserInteraction(
                    article_id=article.id,
                    user_id=random.choice(user_ids),
                    interaction_type=interaction_type,
                    user_latitude=user_lat,
                    user_longitude=user_lon,
                    timestamp=datetime.utcnow() - timedelta(hours=hours_ago)
                )
                db.add(interaction)
        
        db.commit()
        logger.info(f"Generated {sum(len(db.query(UserInteraction).filter(UserInteraction.article_id == a.id).all()) for a in articles)} simulated user interactions")
    
    def _calculate_trending_scores(self, db: Session, lat: float, lon: float):
        """Calculate sophisticated trending scores based on multiple factors."""
        location_cluster = self._get_location_cluster(lat, lon)
        
        # Get recent interactions for articles in this location cluster
        recent_cutoff = datetime.utcnow() - timedelta(hours=48)  # Extended to 48 hours
        
                # Enhanced query with interaction type analysis
        interactions = db.query(
            UserInteraction.article_id,
            func.count(UserInteraction.id).label('total_interactions'),
            func.max(UserInteraction.timestamp).label('last_interaction'),
 
        ).filter(
            and_(
                UserInteraction.timestamp >= recent_cutoff,
                UserInteraction.user_latitude.isnot(None),
                UserInteraction.user_longitude.isnot(None)
            )
        ).group_by(UserInteraction.article_id).all()
        
        for interaction in interactions:
            # Calculate sophisticated trending score
            # 1. Volume factor (total interactions)
            volume_factor = min(interaction.total_interactions / 10.0, 2.0)  # Cap at 2x
            
            # 2. Engagement quality factor (simplified)
            engagement_score = min(interaction.total_interactions / 5.0, 1.0)
            
            # 3. Recency factor (exponential decay)
            hours_since_last = (datetime.utcnow() - interaction.last_interaction).total_seconds() / 3600
            recency_factor = math.exp(-hours_since_last / 12.0)  # 12-hour half-life
            
            # 4. Geographic relevance factor
            geo_relevance = self._calculate_geographic_relevance(lat, lon, interaction.article_id, db)
            
            # 5. Article relevance score factor
            article = db.query(NewsArticle).filter(NewsArticle.id == interaction.article_id).first()
            article_relevance_factor = article.relevance_score if article else 0.5
            
            # Combined trending score
            trending_score = (
                volume_factor * 0.25 +
                engagement_score * 0.3 +
                recency_factor * 0.25 +
                geo_relevance * 0.15 +
                article_relevance_factor * 0.05
            ) * 100  # Scale to 0-100
            
            # Update or create trending score
            existing_score = db.query(TrendingScore).filter(
                and_(
                    TrendingScore.article_id == interaction.article_id,
                    TrendingScore.location_cluster == location_cluster
                )
            ).first()
            
            if existing_score:
                existing_score.trending_score = trending_score
                existing_score.last_updated = datetime.utcnow()
            else:
                new_score = TrendingScore(
                    article_id=interaction.article_id,
                    trending_score=trending_score,
                    location_cluster=location_cluster,
                    last_updated=datetime.utcnow()
                )
                db.add(new_score)
        
        db.commit()
        logger.info(f"Calculated trending scores for {len(interactions)} articles in location cluster {location_cluster}")
    
    def _calculate_geographic_relevance(self, user_lat: float, user_lon: float, article_id: str, db: Session) -> float:
        """Calculate geographic relevance score for trending calculations."""
        article = db.query(NewsArticle).filter(NewsArticle.id == article_id).first()
        if not article or not article.latitude or not article.longitude:
            return 0.5  # Neutral score for articles without location
        
        # Calculate distance between user and article
        distance = self._calculate_distance(user_lat, user_lon, article.latitude, article.longitude)
        
        # Convert distance to relevance score (closer = higher score)
        # 0km = 1.0, 50km = 0.8, 100km = 0.6, 200km = 0.4, 500km = 0.2
        if distance <= 50:
            return 1.0
        elif distance <= 100:
            return 0.8
        elif distance <= 200:
            return 0.6
        elif distance <= 500:
            return 0.4
        else:
            return 0.2
    
    def _get_location_cluster(self, lat: float, lon: float) -> str:
        """Get location cluster for geographic segmentation."""
        # Simple clustering: round coordinates to 1 decimal place
        cluster_lat = round(lat, 1)
        cluster_lon = round(lon, 1)
        return f"{cluster_lat}_{cluster_lon}"
    
    def _get_cache_key(self, lat: float, lon: float, limit: int) -> str:
        """Generate cache key for trending results."""
        location_cluster = self._get_location_cluster(lat, lon)
        return f"trending_{location_cluster}_{limit}"
    
    def _get_cached_trending(self, cache_key: str) -> Optional[List[Dict]]:
        """Get cached trending results if valid."""
        if cache_key in self._trending_cache:
            cached_data, timestamp = self._trending_cache[cache_key]
            if (datetime.utcnow() - timestamp).total_seconds() < self._cache_ttl:
                logger.info(f"Returning cached trending results for {cache_key}")
                return cached_data
            else:
                # Expired cache, remove it
                del self._trending_cache[cache_key]
        return None
    
    def _set_cached_trending(self, cache_key: str, data: List[Dict]):
        """Cache trending results with timestamp."""
        self._trending_cache[cache_key] = (data, datetime.utcnow())
        logger.info(f"Cached trending results for {cache_key}")
    
    def process_natural_language_query(self, db: Session, query: str, user_lat: Optional[float] = None, user_lon: Optional[float] = None) -> Dict:
        """Process natural language query using LLM and return relevant articles."""
        # Analyze query with LLM
        analysis = self.llm_service.analyze_query(query)
        
        # Get articles based on intent
        articles = []
        if analysis['intent'] == 'category':
            if analysis['entities']:
                articles = self.get_articles_by_category(db, analysis['entities'][0], 5)
        elif analysis['intent'] == 'source':
            if analysis['entities']:
                articles = self.get_articles_by_source(db, analysis['entities'][0], 5)
        elif analysis['intent'] == 'nearby':
            if user_lat and user_lon:
                articles = self.get_nearby_articles(db, user_lat, user_lon, 10, 5)
        elif analysis['intent'] == 'score':
            articles = self.get_articles_by_score(db, 0.7, 5)
        else:  # search
            articles = self.search_articles(db, query, 5)
        
        return {
            'entities': analysis['entities'],
            'intent': analysis['intent'],
            'articles': articles,
            'total_results': len(articles),
            'query_used': query
        }
