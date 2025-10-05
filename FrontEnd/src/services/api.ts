const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Debug logging for production
console.log('🔧 API Configuration:', {
  baseUrl: API_BASE_URL,
  environment: import.meta.env.MODE,
  viteApiUrl: import.meta.env.VITE_API_URL
});

console.log('TuneCraft App v2.1.0 - CORS and API fixes applied');

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string | number | null;
  publishedAt: string;
  source: 'youtube' | 'soundcloud';
}

export interface Artist {
  id: string;
  name: string;
  thumbnail: string;
  subscribers?: string;
  source: 'youtube' | 'soundcloud';
}

export interface SearchResponse {
  tracks: Track[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  query: string;
  platform: string;
}

export interface TrendingResponse {
  tracks: Track[];
  region: string;
  platform: string;
}

export interface TrackDetailsResponse {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  views: string;
  publishedAt: string;
  description: string;
  source: 'youtube' | 'soundcloud';
  streamUrl?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Debug logging
    console.log(`🌐 API Request: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error Response:`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success:`, data);
      return data;
    } catch (error) {
      console.error(`💥 API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Search for tracks
  async searchTracks(
    query: string,
    platform: 'youtube' | 'soundcloud' | 'all' = 'all',
    page: number = 1,
    limit: number = 25
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      platform,
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.request<SearchResponse>(`/search/tracks?${params}`);
  }

  // Get trending tracks
  async getTrendingTracks(
    platform: 'youtube' | 'soundcloud' | 'all' = 'all',
    limit: number = 25,
    region: string = 'US'
  ): Promise<TrendingResponse> {
    const params = new URLSearchParams({
      platform,
      limit: limit.toString(),
      region,
    });

    return this.request<TrendingResponse>(`/tracks/trending?${params}`);
  }

  // Get track details
  async getTrackDetails(trackId: string, source: 'youtube' | 'soundcloud'): Promise<TrackDetailsResponse> {
    return this.request<TrackDetailsResponse>(`/tracks/${trackId}?source=${source}`);
  }

  // Get track stream URL
  async getTrackStreamUrl(trackId: string, source: 'youtube' | 'soundcloud'): Promise<{ streamUrl: string }> {
    return this.request<{ streamUrl: string }>(`/tracks/${trackId}/stream?source=${source}`);
  }

  // Search for artists
  async searchArtists(
    query: string,
    platform: 'youtube' | 'soundcloud' | 'all' = 'all',
    page: number = 1,
    limit: number = 25
  ): Promise<{ artists: Artist[]; pagination: any }> {
    const params = new URLSearchParams({
      q: query,
      platform,
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.request<{ artists: Artist[]; pagination: any }>(`/search/artists?${params}`);
  }

  // Get artist details
  async getArtistDetails(artistId: string, source: 'youtube' | 'soundcloud'): Promise<Artist> {
    return this.request<Artist>(`/artists/${artistId}?source=${source}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;