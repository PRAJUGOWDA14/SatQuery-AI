/**
 * SatQuery AI - API Service
 * 
 * Configured for backend integration with POST /api/analyze
 * The backend API URL can be configured via VITE_API_URL in .env
 */

export type AnalysisType =
  | 'Auto Detect'
  | 'Visual Question Answering'
  | 'Object Detection'
  | 'Change Detection'
  | 'Land Cover Analysis'
  | 'Spectral Analysis';

export interface AnalyzeRequestPayload {
  image: File | Blob;
  query: string;
  analysis_type: AnalysisType;
}

import { BackendDetection, BackendAnalysisMetadata } from '../types';

export interface GroundedDetection extends BackendDetection {
  id: string;
  label: string;
  confidence: number;
}

export interface AnalyzeResponseData {
  success?: boolean;
  task?: string;
  analysis?: {
    image_width: number;
    image_height: number;
    total_pixels: number;
    vegetation_percentage: number;
    water_percentage: number;
    builtup_percentage: number;
    bright_area_percentage: number;
  };
  image_url?: string;
  status?: 'success' | 'error';
  message?: string;
  analysis_type?: string;
  query?: string;
  answer?: string;
  summary?: string;
  confidence?: number;
  detections?: BackendDetection[];
  detected_objects?: Record<string, number> | string | number;
  area?: string | { value: number; unit: string } | number;
  area_km2?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: string | { lat: number; lng: number };
  location?: string;
  crs?: string;
  overlay_url?: string;
  metadata?: BackendAnalysisMetadata;
  raw_response?: unknown;
}

// Configurable API base URL with fallback to local proxy /api
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Execute satellite image analysis by calling POST /api/analyze
 * 
 * Sends multipart/form-data with:
 * - image: The uploaded satellite image File/Blob
 * - query: Natural language prompt
 * - analysis_type: Selected analysis category
 */
export async function analyzeImage(payload: AnalyzeRequestPayload): Promise<AnalyzeResponseData> {
  const formData = new FormData();
  formData.append('image', payload.image);
  formData.append('query', payload.query);
  formData.append('analysis_type', payload.analysis_type);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        // Note: Do NOT set Content-Type header when sending FormData; 
        // the browser sets it automatically with the multipart boundary
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data as AnalyzeResponseData;
  } catch (error: unknown) {
    // If backend endpoint is not yet reachable during development, report transparently
    const errMessage = error instanceof Error ? error.message : 'Network error or backend unreachable';
    console.warn('[SatQuery API] /api/analyze request failed or backend endpoint not yet active:', errMessage);
    
    // We rethrow so the caller / loading screen can show exact backend connection status
    throw error;
  }
}

export interface ProcessingStatusResponse {
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  data?: AnalyzeResponseData;
}

/**
 * Poll or check analysis progress from backend API (e.g. GET /api/analyze/status/:jobId or GET /api/analyze/status)
 */
export async function getAnalysisStatus(jobId?: string): Promise<ProcessingStatusResponse> {
  const url = jobId ? `${API_BASE_URL}/analyze/status/${jobId}` : `${API_BASE_URL}/analyze/status`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.status}`);
  }

  return response.json();
}
