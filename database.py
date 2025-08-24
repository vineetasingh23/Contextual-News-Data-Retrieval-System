from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Force the correct database URL
DATABASE_URL = "postgresql://vineeta:vineeta123@localhost:5432/newsdb"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    # Import models to ensure they are registered with Base
    from models import NewsArticle, UserInteraction, TrendingScore
    Base.metadata.create_all(bind=engine)
