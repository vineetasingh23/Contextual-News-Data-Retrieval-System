# Getting Started Guide

## Contextual News Data Retrieval System

This guide will help you set up and run the Contextual News Data Retrieval System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher**
- **PostgreSQL database server**
- **Google Cloud account** with Natural Language API enabled
- **Git** (for cloning the repository)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Contextual-News-Data-Retrieval-System

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your credentials
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/news_db

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
```

### 3. Google Cloud Setup

1. **Create a Google Cloud Project** (if you don't have one)
2. **Enable the Natural Language API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Library"
   - Search for "Natural Language API" and enable it
3. **Create a Service Account**:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Download the JSON key file
   - Update `GOOGLE_APPLICATION_CREDENTIALS` in your `.env` file

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb news_db

# Or using psql
psql -U postgres
CREATE DATABASE news_db;
\q
```

### 5. Run Setup Script

```bash
# Run the automated setup
python3 setup.py
```

The setup script will:
- Verify dependencies
- Create database tables
- Load sample news data
- Run system tests

### 6. Start the Application

```bash
# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Usage Examples

### 1. Natural Language Query

```bash
curl -X POST "http://localhost:8000/api/v1/news/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Latest developments in the Elon Musk Twitter acquisition near Palo Alto",
    "user_latitude": 37.4220,
    "user_longitude": -122.0840
  }'
```

### 2. Category-based Retrieval

```bash
curl "http://localhost:8000/api/v1/news/category?category=Technology&limit=5"
```

### 3. Location-based Search

```bash
curl "http://localhost:8000/api/v1/news/nearby?lat=37.4220&lon=-122.0840&radius=10&limit=5"
```

### 4. Trending News

```bash
curl "http://localhost:8000/api/v1/news/trending?lat=37.4220&lon=-122.0840&limit=5"
```

### 5. Text Search

```bash
curl "http://localhost:8000/api/v1/news/search?query=Elon%20Musk&limit=5"
```

## Interactive API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing the System

### Run the Test Suite

```bash
python3 test_system.py
```

### Manual Testing

1. **Start the server** (see step 6 above)
2. **Open your browser** to http://localhost:8000/docs
3. **Try different endpoints** using the interactive interface
4. **Test with sample queries** from the examples above

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```
Error: could not connect to server: Connection refused
```

**Solution**: Ensure PostgreSQL is running and check your `DATABASE_URL`

#### 2. Google Cloud API Error

```
Error: 403 Forbidden - The request is missing a valid API key
```

**Solution**: Verify your service account credentials and API enablement

#### 3. Import Errors

```
ModuleNotFoundError: No module named 'google.cloud.language'
```

**Solution**: Install dependencies with `pip install -r requirements.txt`

#### 4. Port Already in Use

```
Error: [Errno 48] Address already in use
```

**Solution**: Use a different port: `uvicorn main:app --port 8001`

### Debug Mode

Enable debug logging by setting in your `.env`:

```bash
DEBUG=True
LOG_LEVEL=DEBUG
```

## Performance Optimization

### 1. Database Indexing

The system automatically creates indexes for:
- Category searches
- Source searches
- Relevance score filtering
- Location-based queries
- User interactions

### 2. Caching

Enable Redis caching for trending feeds:
```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Start Redis
redis-server
```

### 3. Connection Pooling

Database connections are automatically pooled for optimal performance.

## Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### Logs

Check application logs for:
- Database operations
- API requests
- Error details
- Performance metrics

## Next Steps

After successful setup:

1. **Explore the API** using the interactive documentation
2. **Test different query types** to understand the system's capabilities
3. **Customize the news data** by modifying `news_data.json`
4. **Extend the system** by adding new endpoints or features
5. **Deploy to production** using your preferred hosting platform

## Support

If you encounter issues:

1. **Check the logs** for detailed error messages
2. **Verify your configuration** in the `.env` file
3. **Run the test suite** to identify specific problems
4. **Review the project structure** in `PROJECT_STRUCTURE.md`

## Contributing

To contribute to the project:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Run tests** to ensure everything works
5. **Submit a pull request**

---

**Happy coding! 🚀**
