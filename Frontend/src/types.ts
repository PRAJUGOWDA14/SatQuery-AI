export type NavTab = 'home' | 'analyze' | 'analysis/loading' | 'results' | 'geospatial' | 'history' | 'about' | 'settings';

export type AnalysisType =
  | 'Auto Detect'
  | 'Visual Question Answering'
  | 'Object Detection'
  | 'Change Detection'
  | 'Land Cover Analysis'
  | 'Spectral Analysis';

export interface BackendProcessingStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export interface BackendDetection {
  id?: string;
  label?: string;
  type?: 'bbox' | 'mask' | 'point' | 'highlight' | 'change';
  confidence?: number;
  bbox?: [number, number, number, number]; // [x%, y%, width%, height%] or [ymin, xmin, ymax, xmax]
  coordinates?: string | { lat: number; lng: number };
  latitude?: number;
  longitude?: number;
  area?: string | number;
  area_km2?: number;
  mask_polygon?: Array<[number, number]>; // polygon points in percentages [[x, y], ...]
  geo_polygon?: Array<[number, number]>; // [lat, lng] coordinates for real geo-polygon
  spectral_signature?: string;
}

export interface BackendAnalysisMetadata {
  model?: string;
  input_type?: string;
  resolution?: string;
  crs?: string;
  coordinates?: string;
  processing_time_ms?: number;
  analysis_method?: string;
  sensor?: string;
  timestamp?: string;
}

export interface BackendAnalysisResult {
  answer?: string;
  summary?: string;
  confidence?: number;
  detections?: BackendDetection[];
  detected_objects?: Record<string, number> | string | number;
  area?: string | { value: number; unit: string } | number;
  area_km2?: number;
  area_acres?: number;
  area_guntas?: number;
  gsd_m_per_pixel?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: string | { lat: number; lng: number };
  location?: string;
  crs?: string;
  overlay_url?: string;
  change_percentage?: number;
  changed_pixels?: number;
  total_pixels?: number;
  analysis_type?: string;
  metadata?: BackendAnalysisMetadata;
  raw_response?: unknown;
}

export interface FinalAnalysisResult {
  query: string;
  analysisType: AnalysisType;
  image: UploadedImageData;
  backendData?: BackendAnalysisResult;
  // Normalized accessible fields
  answer: string;
  summary: string;
  confidence: number | null;
  detectedObjectsText: string;
  areaText: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  area_km2?: number;
  area_acres?: number;
  area_guntas?: number;
  gsd_m_per_pixel?: number;
  crs?: string;
  overlayUrl?: string;
  changePercentage?: number;
  changedPixels?: number;
  totalPixels?: number;
  detections: BackendDetection[];
  metadata: {
    model: string;
    inputType: string;
    resolution: string;
    crs: string;
    coordinates: string;
    processingTimeMs: number;
    analysisMethod: string;
    timestamp: string;
  };
}

export interface UploadedImageData {
  file: File;
  previewUrl: string;
  filename: string;
  width: number;
  height: number;
  sizeBytes: number;
  formattedSize: string;
}

export interface SatelliteSample {
  id: string;
  title: string;
  sensor: string;
  modality: 'Optical' | 'SAR' | 'Multispectral' | 'Change Detection';
  resolution: string;
  acquisitionDate: string;
  coordinates: string;
  crs: string;
  imageUrl: string;
  description: string;
  recommendedQueries: string[];
}

export interface GroundedObject {
  id: string;
  label: string;
  confidence: number | null;
  bbox: [number, number, number, number]; // [x%, y%, width%, height%]
  coordinates: string;
  areaEstimate?: string;
  spectralSignature?: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  satellite: string;
  modality: string;
  query: string;
  coordinates: string;
  status: 'Completed' | 'Processing' | 'Archived';
  detectionsCount: number;
}

export interface HistoryItem {
  id: string;
  filename: string;
  thumbnailUrl: string;
  query: string;
  analysisType: string;
  date: string;
  status: 'Completed' | 'Processing' | 'Failed';
  result?: FinalAnalysisResult;
}
