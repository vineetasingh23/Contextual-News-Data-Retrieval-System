import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from models import NewsArticle, UserInteraction, TrendingScore
from llm_service import GoogleCloudLLMService
from datetime import datetime, timedelta
import random
import math

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.llm_service = GoogleCloudLLMService()
        self._trending_cache = {}
        self._cache_ttl = 300  # 5 minutes
        
    def load_news_data(self):
        """Load news data from JSON file into database"""
        try:
            with open('news_data.json', 'r') as f:
                data = json.load(f)
            
            logger.info(f"Loaded {len(data)} news articles")
            
        except Exception as e:
            logger.error(f"Error loading news data: {e}")
    
    def get_articles_by_intent(self, db: Session, intent: str, entities: list, lat: float, lon: float):
        """Get articles based on intent and entities"""
        if intent == "category":
            for entity in entities:
                if any(cat.lower() in entity.lower() for cat in ['technology', 'business', 'sports', 'politics']):
                    return self.get_articles_by_category(db, entity, 5)
        elif intent == "nearby":
            return self.get_nearby_articles(db, lat, lon, 100, 5)
        elif intent == "source":
            for entity in entities:
                if any(source.lower() in entity.lower() for source in ['reuters', 'cnn', 'bbc', 'times']):
                    return self.get_articles_by_source(db, entity, 5)
        
        # Default to search
        return self.search_articles(db, " ".join(entities), 5)
    
    def get_articles_by_category(self, db: Session, category: str, limit: int = 5):
        """Get articles by category"""
        try:
            articles = db.query(NewsArticle).filter(
                NewsArticle.category.any(category)
            ).order_by(desc(NewsArticle.publication_date)).limit(limit).all()
            
            return [self._format_article(article) for article in articles]
        except Exception as e:
            logger.error(f"Error getting articles by category: {e}")
            return []
    
    def search_articles(self, db: Session, query: str, limit: int = 5):
        """Search articles by text query"""
        try:
            # Use a simpler approach to avoid SQL syntax issues
            articles = db.query(NewsArticle).filter(
                NewsArticle.title.ilike(f"%{query}%")
            ).order_by(desc(NewsArticle.relevance_score)).limit(limit).all()
            
            # If we don't have enough results from title, also search description
            if len(articles) < limit:
                description_articles = db.query(NewsArticle).filter(
                    NewsArticle.description.ilike(f"%{query}%"),
                    ~NewsArticle.id.in_([a.id for a in articles])
                ).order_by(desc(NewsArticle.relevance_score)).limit(limit - len(articles)).all()
                articles.extend(description_articles)
            
            return [self._format_article(article) for article in articles]
        except Exception as e:
            logger.error(f"Error searching articles: {e}")
            return []
    
    def get_articles_by_source(self, db: Session, source: str, limit: int = 5):
        """Get articles by source"""
        try:
            articles = db.query(NewsArticle).filter(
                NewsArticle.source_name.ilike(f"%{source}%")
            ).order_by(desc(NewsArticle.publication_date)).limit(limit).all()
            
            return [self._format_article(article) for article in articles]
        except Exception as e:
            logger.error(f"Error getting articles by source: {e}")
            return []
    
    def get_nearby_articles(self, db: Session, lat: float, lon: float, radius: float, limit: int = 5):
        """Get articles near a location"""
        try:
            articles = db.query(NewsArticle).filter(
                NewsArticle.latitude.isnot(None),
                NewsArticle.longitude.isnot(None)
            ).all()
            
            # Calculate distances and filter by radius
            nearby_articles = []
            for article in articles:
                distance = self._calculate_distance(lat, lon, article.latitude, article.longitude)
                if distance <= radius:
                    nearby_articles.append((article, distance))
            
            # Sort by distance and return top results
            nearby_articles.sort(key=lambda x: x[1])
            return [self._format_article(article) for article, _ in nearby_articles[:limit]]
            
        except Exception as e:
            logger.error(f"Error getting nearby articles: {e}")
            return []
    
    def get_trending_articles(self, db: Session, lat: float, lon: float, limit: int = 5):
        """Get trending articles for a location"""
        cache_key = self._get_cache_key(lat, lon, limit)
        
        # Check cache first
        cached_result = self._get_cached_trending(cache_key)
        if cached_result:
            return cached_result
        
        try:
            # Simulate user interactions if none exist
            if db.query(UserInteraction).count() == 0:
                self._simulate_user_interactions(db)
            
            # Calculate trending scores
            trending_data = self._calculate_trending_scores(db, lat, lon, limit)
            
            # If no trending data found, create interactions near this location
            if trending_data['total_results'] == 0:
                self._create_location_specific_interactions(db, lat, lon)
                # Recalculate trending scores
                trending_data = self._calculate_trending_scores(db, lat, lon, limit)
            
            # Cache the result
            self._set_cached_trending(cache_key, trending_data)
            
            return trending_data
            
        except Exception as e:
            logger.error(f"Error getting trending articles: {e}")
            return {
                "articles": [],
                "trending_scores": [],
                "location_cluster": self._get_location_cluster(lat, lon),
                "total_results": 0
            }
    
    def _simulate_user_interactions(self, db: Session):
        """Simulate user interactions for trending calculation"""
        try:
            # Get some articles to work with
            articles = db.query(NewsArticle).limit(50).all()
            
            if not articles:
                logger.warning("No articles found for interaction simulation")
                return
            
            interaction_types = ['view', 'click', 'share', 'bookmark', 'comment']
            weights = [0.4, 0.3, 0.15, 0.1, 0.05]
            
            # Clear existing interactions first
            db.query(UserInteraction).delete()
            db.commit()
            
            for _ in range(1000):  # Generate 1000 interactions
                article = random.choice(articles)
                
                # Ensure article has valid coordinates
                if not article.latitude or not article.longitude:
                    continue
                
                interaction_type = random.choices(interaction_types, weights=weights)[0]
                
                # Random user location near article (within 50km)
                user_lat = article.latitude + random.uniform(-0.5, 0.5)
                user_lon = article.longitude + random.uniform(-0.5, 0.5)
                
                # Ensure coordinates are valid
                if -90 <= user_lat <= 90 and -180 <= user_lon <= 180:
                    interaction = UserInteraction(
                        user_id=f"user_{random.randint(1, 100)}",
                        article_id=article.id,
                        interaction_type=interaction_type,
                        timestamp=datetime.now() - timedelta(hours=random.randint(0, 72)),
                        user_latitude=user_lat,
                        user_longitude=user_lon
                    )
                    
                    db.add(interaction)
            
            db.commit()
            logger.info("Simulated user interactions created")
            
        except Exception as e:
            logger.error(f"Error simulating interactions: {e}")
            db.rollback()
    
    def _calculate_trending_scores(self, db: Session, lat: float, lon: float, limit: int):
        """Calculate trending scores for articles"""
        try:
            location_cluster = self._get_location_cluster(lat, lon)
            
            # Get all interactions first, then filter in Python to avoid SQL issues
            all_interactions = db.query(UserInteraction).all()
            
            if not all_interactions:
                return {
                    "articles": [],
                    "trending_scores": [],
                    "location_cluster": location_cluster,
                    "total_results": 0
                }
            
            # Filter interactions by location in Python
            nearby_interactions = []
            for interaction in all_interactions:
                if interaction.user_latitude and interaction.user_longitude:
                    # Calculate distance manually
                    distance = self._calculate_distance(lat, lon, interaction.user_latitude, interaction.user_longitude)
                    if distance <= 100:  # 100km radius
                        nearby_interactions.append(interaction)
            
            if not nearby_interactions:
                return {
                    "articles": [],
                    "trending_scores": [],
                    "location_cluster": location_cluster,
                    "total_results": 0
                }
            
            # Group by article and calculate scores
            article_scores = {}
            for interaction in nearby_interactions:
                if interaction.article_id not in article_scores:
                    article_scores[interaction.article_id] = {
                        'views': 0, 'clicks': 0, 'shares': 0, 'bookmarks': 0, 'comments': 0,
                        'last_interaction': interaction.timestamp
                    }
                
                scores = article_scores[interaction.article_id]
                if interaction.interaction_type == 'view':
                    scores['views'] += 1
                elif interaction.interaction_type == 'click':
                    scores['clicks'] += 1
                elif interaction.interaction_type == 'share':
                    scores['shares'] += 1
                elif interaction.interaction_type == 'bookmark':
                    scores['bookmarks'] += 1
                elif interaction.interaction_type == 'comment':
                    scores['comments'] += 1
                
                if interaction.timestamp > scores['last_interaction']:
                    scores['last_interaction'] = interaction.timestamp
            
            # Calculate final trending scores
            trending_items = []
            for article_id, scores in article_scores.items():
                try:
                    article = db.query(NewsArticle).filter(NewsArticle.id == article_id).first()
                    if article:
                        # Calculate trending score
                        base_score = (
                            scores['views'] * 1 +
                            scores['clicks'] * 2 +
                            scores['shares'] * 3 +
                            scores['bookmarks'] * 2 +
                            scores['comments'] * 2
                        )
                        
                        # Safe time calculation
                        try:
                            time_diff = (datetime.now() - scores['last_interaction']).total_seconds()
                            recency_factor = math.exp(-time_diff / 86400)  # 24 hour decay
                        except Exception:
                            recency_factor = 1.0
                        
                        trending_score = base_score * recency_factor
                        
                        trending_items.append({
                            'article': self._format_article(article),
                            'trending_score': trending_score
                        })
                except Exception as e:
                    logger.warning(f"Error processing article {article_id} for trending: {e}")
                    continue
            
            # Sort by trending score and return top results
            trending_items.sort(key=lambda x: x['trending_score'], reverse=True)
            
            return {
                "articles": [item['article'] for item in trending_items[:limit]],
                "trending_scores": [item['trending_score'] for item in trending_items[:limit]],
                "location_cluster": location_cluster,
                "total_results": len(trending_items[:limit])
            }
            
        except Exception as e:
            logger.error(f"Error calculating trending scores: {e}")
            return {
                "articles": [],
                "trending_scores": [],
                "location_cluster": self._get_location_cluster(lat, lon),
                "total_results": 0
            }
    
    def _create_location_specific_interactions(self, db: Session, lat: float, lon: float):
        """Create simulated interactions for a specific location"""
        try:
            # Get some articles to work with
            articles = db.query(NewsArticle).filter(
                NewsArticle.latitude.isnot(None),
                NewsArticle.longitude.isnot(None)
            ).all()
            
            if not articles:
                logger.warning("No articles found for location-specific interaction simulation")
                return
            
            interaction_types = ['view', 'click', 'share', 'bookmark', 'comment']
            weights = [0.4, 0.3, 0.15, 0.1, 0.05]
            
            # Clear existing interactions first
            db.query(UserInteraction).delete()
            db.commit()
            
            for _ in range(1000):  # Generate 1000 interactions
                article = random.choice(articles)
                
                # Ensure article has valid coordinates
                if not article.latitude or not article.longitude:
                    continue
                
                interaction_type = random.choices(interaction_types, weights=weights)[0]
                
                # Random user location near article (within 50km)
                user_lat = article.latitude + random.uniform(-0.5, 0.5)
                user_lon = article.longitude + random.uniform(-0.5, 0.5)
                
                # Ensure coordinates are valid
                if -90 <= user_lat <= 90 and -180 <= user_lon <= 180:
                    interaction = UserInteraction(
                        user_id=f"user_{random.randint(1, 100)}",
                        article_id=article.id,
                        interaction_type=interaction_type,
                        timestamp=datetime.now() - timedelta(hours=random.randint(0, 72)),
                        user_latitude=user_lat,
                        user_longitude=user_lon
                    )
                    
                    db.add(interaction)
            
            db.commit()
            logger.info("Location-specific interactions created")
            
        except Exception as e:
            logger.error(f"Error creating location-specific interactions: {e}")
            db.rollback()
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def _get_location_cluster(self, lat: float, lon: float) -> str:
        """Get location cluster for caching"""
        return f"{round(lat, 1)}_{round(lon, 1)}"
    
    def _get_cache_key(self, lat: float, lon: float, limit: int) -> str:
        """Generate cache key for trending results"""
        cluster = self._get_location_cluster(lat, lon)
        return f"trending_{cluster}_{limit}"
    
    def _get_cached_trending(self, cache_key: str):
        """Get cached trending results"""
        if cache_key in self._trending_cache:
            timestamp, data = self._trending_cache[cache_key]
            if datetime.now().timestamp() - timestamp < self._cache_ttl:
                return data
        return None
    
    def _set_cached_trending(self, cache_key: str, data):
        """Cache trending results"""
        self._trending_cache[cache_key] = (datetime.now().timestamp(), data)
    
    def clear_trending_cache(self):
        """Clear all trending cache entries"""
        self._trending_cache.clear()
    
    def _format_article(self, article: NewsArticle) -> dict:
        """Format article for API response"""
        return {
            "id": str(article.id),
            "title": article.title,
            "description": article.description,
            "url": article.url,
            "publication_date": article.publication_date,
            "source_name": article.source_name,
            "category": article.category,
            "relevance_score": article.relevance_score,
            "latitude": article.latitude,
            "longitude": article.longitude,
            "llm_summary": article.llm_summary
        }
