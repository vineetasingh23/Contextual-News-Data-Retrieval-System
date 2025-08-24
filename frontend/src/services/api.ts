import axios from 'axios';
import {
  NewsQuery,
  NewsResponse,
  CategoryResponse,
  SearchResponse,
  TrendingResponse,
  NearbyResponse,
  HealthResponse
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8009',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const newsAPI = {
  // Natural language query
  queryNews: async (queryData: NewsQuery): Promise<NewsResponse> => {
    // Transform the data to match backend schema
    const transformedData = {
      query: queryData.query,
      user_latitude: queryData.latitude,
      user_longitude: queryData.longitude,
      limit: queryData.limit,
      radius: queryData.radius
    };
    const response = await api.post('/api/v1/news/query', transformedData);
    return response.data;
  },

  // Category-based news
  getNewsByCategory: async (
    category: string,
    lat?: number,
    lon?: number,
    radius: number = 100.0,
    limit: number = 10
  ): Promise<CategoryResponse> => {
    const params = new URLSearchParams();
    params.append('category', category);
    params.append('limit', limit.toString());
    
    if (lat && lon) {
      params.append('lat', lat.toString());
      params.append('lon', lon.toString());
      params.append('radius', radius.toString());
    }

    const response = await api.get(`/api/v1/news/category?${params.toString()}`);
    return response.data;
  },

  // Text search
  searchNews: async (
    query: string,
    lat?: number,
    lon?: number,
    radius: number = 100.0,
    limit: number = 10
  ): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('limit', limit.toString());
    
    if (lat && lon) {
      params.append('lat', lat.toString());
      params.append('lon', lon.toString());
      params.append('radius', radius.toString());
    }

    const response = await api.get(`/api/v1/news/search?${params.toString()}`);
    return response.data;
  },

  // Trending news
  getTrendingNews: async (
    lat: number,
    lon: number,
    limit: number = 15,
    forceRefresh: boolean = false
  ): Promise<TrendingResponse> => {
    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('lon', lon.toString());
    params.append('limit', limit.toString());
    params.append('force_refresh', forceRefresh.toString());

    const response = await api.get(`/api/v1/news/trending?${params.toString()}`);
    return response.data;
  },

  // Nearby news
  getNearbyNews: async (
    lat: number,
    lon: number,
    radius: number = 100.0,
    limit: number = 10
  ): Promise<NearbyResponse> => {
    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('lon', lon.toString());
    params.append('radius', radius.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/api/v1/news/nearby?${params.toString()}`);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<HealthResponse> => {
    const response = await api.get('/health');
    return response.data;
  },
};
