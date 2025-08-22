#!/usr/bin/env python3


import os
import sys
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db, engine
from models import NewsArticle
from llm_service import GoogleCloudLLMService
import time

load_dotenv()

def enrich_articles_with_llm():

    try:
        llm_service = GoogleCloudLLMService()
    except Exception as e:
        print(f"Failed to initialize LLM service: {e}")
        return
    
    # Get database session
    db = next(get_db())
    
    try:
        # Get all articles that don't have summaries
        articles = db.query(NewsArticle).filter(
            (NewsArticle.llm_summary == "") | (NewsArticle.llm_summary.is_(None))
        ).all()
        
        total_articles = len(articles)
        print(f"Found {total_articles} articles to enrich")
        
        if total_articles == 0:
            print("All articles already have summaries!")
            return
        
        # Process articles in batches
        batch_size = 10
        processed = 0
        errors = 0
        
        for i in range(0, total_articles, batch_size):
            batch = articles[i:i + batch_size]
            
            for article in batch:
                try:
                    # Generate LLM summary
                    summary = llm_service.generate_summary(article.title, article.description or "")
                    
                    # Update article with summary
                    article.llm_summary = summary
                    processed += 1
                    
                    # Rate limiting to avoid API limits
                    time.sleep(0.1)
                    
                except Exception as e:
                    errors += 1
                    continue

            try:
                db.commit()
            except Exception as e:
                db.rollback()
                errors += 1
        
    except Exception as e:
        print(f" Database error: {e}")
        db.rollback()
    finally:
        db.close()

def test_llm_enrichment():
    
    try:
        llm_service = GoogleCloudLLMService()
    except Exception as e:
        print(f"Failed to initialize LLM service: {e}")
        return
    
    db = next(get_db())
    
    try:
        article = db.query(NewsArticle).first()
        
        if not article:
            print("No articles found in database")
            return
        
        summary = llm_service.generate_summary(article.title, article.description or "")
        
        
        article.llm_summary = summary
        db.commit()
        
        print("Test article updated successfully!")
        
    except Exception as e:
        print(f"Test failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_llm_enrichment()
    else:
        enrich_articles_with_llm()
