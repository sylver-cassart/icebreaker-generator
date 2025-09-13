// Simple analytics types and schemas
export interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  event: 'icebreaker_generated' | 'generation_failed';
  style?: 'professional' | 'casual' | 'creative';
  success: boolean;
  profileLength?: number;
  generationTime?: number; // in milliseconds
  errorType?: string;
}

export interface AnalyticsStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  styleBreakdown: {
    professional: number;
    casual: number;
    creative: number;
  };
  averageGenerationTime: number;
  recentEvents: AnalyticsEvent[];
}