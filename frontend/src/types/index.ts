export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publication_date: string;
  source_name: string;
  category: string[];
  relevance_score: number;
  latitude?: number;
  longitude?: number;
  llm_summary?: string;
}

export interface NewsQuery {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
}

export interface NewsResponse {
  success: boolean;
  timestamp: string;
  total_results: number;
  limit: number;
  query_info?: any;
  pagination?: any;
  articles: NewsArticle[];
  search_query?: string;
  filters_applied: Record<string, any>;
}

export interface CategoryResponse {
  success: boolean;
  timestamp: string;
  total_results: number;
  limit: number;
  query_info?: any;
  pagination?: any;
  articles: NewsArticle[];
  category: string;
  filters_applied: Record<string, any>;
}

export interface SearchResponse {
  success: boolean;
  timestamp: string;
  total_results: number;
  limit: number;
  query_info?: any;
  pagination?: any;
  articles: NewsArticle[];
  search_query: string;
  filters_applied: Record<string, any>;
}

export interface TrendingResponse {
  success: boolean;
  timestamp: string;
  total_results: number;
  limit: number;
  query_info?: any;
  pagination?: any;
  articles: NewsArticle[];
  trending_scores: number[];
  location_cluster: string;
  calculation_method: string;
  filters_applied: Record<string, any>;
}

export interface NearbyResponse {
  success: boolean;
  timestamp: string;
  articles: NewsArticle[];
  location: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
  total_results: number;
  limit: number;
  filters_applied: Record<string, any>;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  database_status: string;
  llm_service_status: string;
  uptime_seconds: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}
