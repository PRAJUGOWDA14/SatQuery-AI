import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Crosshair, 
  Eye, 
  EyeOff, 
  Maximize2, 
  ShieldCheck, 
  Cpu, 
  Calendar, 
  Sliders, 
  FileText,
  Activity,
  Compass,
  Database,
  ExternalLink
} from 'lucide-react';
import { FinalAnalysisResult, BackendDetection } from '../types';
import { API_BASE_URL } from '../services/api';

interface ResultsViewProps {
  result: FinalAnalysisResult | null;
  onNewAnalysis: () => void;
  onOpenGeospatial?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  result, 
  onNewAnalysis,
  onOpenGeospatial,
}) => {
  // Viewer state
  const [viewMode, setViewMode] = useState<'overlay' | 'original'>('overlay');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Layer toggles
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showMasks, setShowMasks] = useState<boolean>(true);
  const [showPoints, setShowPoints] = useState<boolean>(true);
  const [showGridHUD, setShowGridHUD] = useState<boolean>(true);
  
  // Selection & accordion state
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [isTechnicalDetailsOpen, setIsTechnicalDetailsOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Analysis Result</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Please upload a satellite raster and dispatch a natural-language query to view image analysis results.
        </p>
        <button
          onClick={onNewAnalysis}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
        >
          Go to Analysis Workspace
        </button>
      </div>
    );
  }

  const {
    query,
    analysisType,
    image,
    answer,
    summary,
    confidence,
    detectedObjectsText,
    areaText,
    locationText,
    overlayUrl,
    changePercentage,
    changedPixels,
    totalPixels,
    detections = [],
    metadata,
  } = result;

  const fullOverlayUrl = overlayUrl ? (overlayUrl.startsWith('http') ? overlayUrl : API_BASE_URL.replace('/api', '') + overlayUrl) : undefined;

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.75));
  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pan helpers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Download comprehensive intelligence dossier
  const handleDownloadReport = () => {
    setIsDownloading(true);
    try {
      const reportContent = {
        title: 'SatQuery AI Remote-Sensing Intelligence Report',
        generatedAt: metadata.timestamp || new Date().toISOString(),
        queryDirective: query,
        analysisType: analysisType,
        summary: summary,
        keyFindings: {
          answerHeadline: answer,
          detectedObjects: detectedObjectsText,
          estimatedArea: areaText,
          confidenceScore: `${confidence}%`,
          primaryCoordinates: locationText,
        },
        rasterMetadata: {
          filename: image.filename,
          dimensions: `${image.width} x ${image.height} px`,
          fileSize: image.formattedSize,
          crs: metadata.crs,
          model: metadata.model,
          resolution: metadata.resolution,
          processingTime: `${metadata.processingTimeMs} ms`,
          method: metadata.analysisMethod,
        },
        groundedDetections: detections.map((d, index) => ({
          id: d.id || `TGT-${index + 1}`,
          label: d.label || 'Target Feature',
          confidence: `${d.confidence || confidence}%`,
          coordinates: typeof d.coordinates === 'object' ? `${d.coordinates.lat}° N, ${d.coordinates.lng}° E` : d.coordinates || locationText,
          area: d.area || areaText,
          bbox: d.bbox,
          spectralSignature: d.spectral_signature,
        })),
      };

      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `SatQuery-Analysis-Report-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Format date display
  const formattedDateTime = (() => {
    try {
      const d = metadata.timestamp ? new Date(metadata.timestamp) : new Date();
      return d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return '24 Sep 2026, 08:37 UTC';
    }
  })();

  // Primary detection for Findings Section cards
  const primaryDetection = detections[0] || {};
  const detectionLabel = detectedObjectsText || primaryDetection.label || 'No detected feature provided by backend';
  const detectionArea = primaryDetection.area ? String(primaryDetection.area) : areaText;
  const detectionConfidence = primaryDetection.confidence !== undefined ? `${primaryDetection.confidence}%` : (confidence !== null ? `${confidence}%` : 'Not provided');
  const detectionCoordinates = primaryDetection.coordinates 
    ? (typeof primaryDetection.coordinates === 'object' ? `${primaryDetection.coordinates.lat}° N, ${primaryDetection.coordinates.lng}° E` : String(primaryDetection.coordinates))
    : locationText;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* ========================================================================= */}
      {/* 1. HEADER                                                                 */}
      {/* ========================================================================= */}
      <header className="border-b border-white/10 bg-[#080d1b]/95 backdrop-blur-md sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Title & Mission Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Space-Tech Intelligence Console</span>
                  <span className="text-slate-600">·</span>
                  <span>Image Analysis Core</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display flex items-center gap-3">
                  <span>Analysis Results</span>
                  
                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Analysis Completed</span>
                  </span>
                </h1>
              </div>

              {/* Date/Time & Type metadata pill */}
              <div className="hidden lg:flex flex-col border-l border-white/10 pl-5 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDateTime}</span>
                </div>
                <div className="mt-0.5 text-purple-300">
                  Mode: <span className="font-semibold text-white">{analysisType}</span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {onOpenGeospatial && (
                <button
                  type="button"
                  onClick={onOpenGeospatial}
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:text-white text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="View map when location metadata is available"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Location Metadata</span>
                </button>
              )}

              <button
                type="button"
                onClick={onNewAnalysis}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>New</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span> Report
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* ========================================================================= */}
        {/* 2. TOP QUERY CARD                                                         */}
        {/* ========================================================================= */}
        <div className="rounded-2xl p-5 sm:p-6 glass-panel border border-white/15 bg-[#0a1020] shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Your Query</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
              Natural-Language Directive
            </span>
          </div>
          
          <div className="mt-1 text-base sm:text-lg text-white font-medium leading-relaxed bg-black/40 p-4 rounded-xl border border-white/10">
            &ldquo;{query}&rdquo;
          </div>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* 3. MAIN IMAGE RESULT (7 Columns)                                          */}
          {/* ========================================================================= */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="rounded-2xl glass-panel border border-white/15 overflow-hidden bg-[#090f1f] shadow-2xl flex flex-col">
              
              {/* Viewer Control Bar */}
              <div className="px-4 py-3 bg-[#0d152a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                
                {/* [Original] vs [Analysis Overlay] Mode Switch */}
                <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode('original')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      viewMode === 'original'
                        ? 'bg-white/15 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Original
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('overlay')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'overlay'
                        ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Analysis Overlay</span>
                  </button>
                </div>

                {/* Zoom Controls: +, -, Reset */}
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Zoom in"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Zoom out"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomReset}
                    title="Reset zoom and center"
                    className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <span className="px-1.5 text-[10px] text-cyan-400 font-mono">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                </div>

              </div>

              {/* Large Satellite Image Canvas Viewer */}
              <div
                ref={imageContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`relative w-full aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
                  zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                }`}
              >
                {/* Scalable Container */}
                <div
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                  }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Base Satellite Raster */}
                  <img
                    src={image.previewUrl}
                    alt={image.filename}
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Backend Provided Overlay URL (if returned) */}
                  {viewMode === 'overlay' && overlayUrl && (
                    <img
                      src={fullOverlayUrl}
                      alt="Backend Analysis Overlay"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80 mix-blend-screen"
                    />
                  )}

                  {/* Coordinate Grid HUD Overlay */}
                  {viewMode === 'overlay' && showGridHUD && (
                    <div className="absolute inset-0 sat-grid-bg opacity-30 pointer-events-none" />
                  )}

                  {/* Dynamic Overlays: Segmentation Masks */}
                  {viewMode === 'overlay' && showMasks && detections.map((det) => {
                    if (det.type !== 'mask' || !det.mask_polygon) return null;
                    const polygonPoints = det.mask_polygon
                      .map(([px, py]) => `${px}%,${py}%`)
                      .join(' ');
                    const isSelected = selectedDetectionId === det.id;

                    return (
                      <svg
                        key={`mask-${det.id}`}
                        className="absolute inset-0 w-full h-full pointer-events-auto"
                        onClick={() => setSelectedDetectionId(det.id || null)}
                      >
                        <polygon
                          points={polygonPoints}
                          className={`cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'fill-cyan-400/40 stroke-cyan-300 stroke-2'
                              : 'fill-cyan-500/25 stroke-cyan-400/80 stroke-1 hover:fill-cyan-400/35 hover:stroke-cyan-300'
                          }`}
                        />
                      </svg>
                    );
                  })}

                  {/* Dynamic Overlays: Bounding Boxes */}
                  {viewMode === 'overlay' && showBoundingBoxes && detections.map((det, idx) => {
                    if (!det.bbox) return null;
                    const [bx, by, bw, bh] = det.bbox;
                    const isSelected = selectedDetectionId === det.id;

                    return (
                      <div
                        key={`bbox-${det.id || idx}`}
                        onClick={() => setSelectedDetectionId(det.id || null)}
                        style={{
                          top: `${by}%`,
                          left: `${bx}%`,
                          width: `${bw}%`,
                          height: `${bh}%`,
                        }}
                        className={`absolute border-2 cursor-pointer transition-all duration-200 z-10 ${
                          isSelected
                            ? 'border-cyan-300 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.7)]'
                            : 'border-cyan-400/80 bg-cyan-400/10 hover:border-cyan-300 hover:bg-cyan-400/15'
                        }`}
                      >
                        {/* Box Tag Label */}
                        <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-md flex items-center gap-1.5">
                          <span className="font-semibold">{det.label || 'Target'}</span>
                          {det.confidence !== undefined && (
                            <span className="text-emerald-400">({det.confidence}%)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Dynamic Overlays: Detection Points */}
                  {viewMode === 'overlay' && showPoints && detections.map((det, idx) => {
                    if (det.type !== 'point' && !det.bbox) return null;
                    if (det.type !== 'point') return null;
                    const [px, py] = [det.bbox![0], det.bbox![1]];
                    const isSelected = selectedDetectionId === det.id;

                    return (
                      <div
                        key={`point-${det.id || idx}`}
                        onClick={() => setSelectedDetectionId(det.id || null)}
                        style={{ top: `${py}%`, left: `${px}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-cyan-300 bg-cyan-400 animate-ping' : 'border-purple-400 bg-purple-500/60 group-hover:scale-125'
                        }`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] font-mono text-purple-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {det.label || 'Anchor Point'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reticle HUD Corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

                {/* Raster Dimensions & Target Tag (Bottom Left) */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white font-semibold">{image.filename}</span>
                  <span className="text-slate-600">·</span>
                  <span>{image.width} × {image.height} px</span>
                </div>
              </div>

              {/* Layer Controls Footer Strip */}
              <div className="p-3 bg-[#0a1122] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-400 font-semibold">Active Layers:</span>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                      showBoundingBoxes
                        ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                        : 'border-white/10 bg-white/5 text-slate-500'
                    }`}
                  >
                    <span>Image Regions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMasks(!showMasks)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                      showMasks
                        ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                        : 'border-white/10 bg-white/5 text-slate-500'
                    }`}
                  >
                    <span>Image Mask</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPoints(!showPoints)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                      showPoints
                        ? 'border-purple-400/50 bg-purple-500/15 text-purple-300'
                        : 'border-white/10 bg-white/5 text-slate-500'
                    }`}
                  >
                    <span>Detected Features</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGridHUD(!showGridHUD)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                      showGridHUD
                        ? 'border-white/20 bg-white/10 text-slate-300'
                        : 'border-white/10 bg-transparent text-slate-500'
                    }`}
                  >
                    Analysis Grid
                  </button>
                </div>
              </div>

            </div>

          </section>

          {/* ========================================================================= */}
          {/* 4. RIGHT SIDE — AI RESPONSE (5 Columns)                                   */}
          {/* ========================================================================= */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            
            {/* SatQuery AI Response Card */}
            <div className="rounded-2xl p-6 glass-panel border border-cyan-500/30 bg-[#091424] shadow-2xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>SatQuery Response</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                  SatQuery Analysis
                </span>
              </div>

              {/* Dynamic Headline Answer */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-base sm:text-lg font-semibold text-cyan-200 leading-snug mb-5">
                {answer}
              </div>

              {/* Structured Findings Table / Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                
                {/* Detected Objects */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Detected Objects
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {detectedObjectsText}
                  </span>
                </div>

                {/* Estimated Area */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Estimated Area
                  </span>
                  <span className="text-sm sm:text-base font-bold text-cyan-300">
                    {areaText}
                  </span>
                </div>

                {/* Confidence */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Confidence
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400">
                    {confidence !== null ? `${confidence}%` : 'Not provided'}
                  </span>
                </div>

                {/* Location */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Location
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-purple-300 truncate block" title={locationText}>
                    {locationText}
                  </span>
                </div>

              </div>

            </div>

            {/* ========================================================================= */}
            {/* 6. EXPLANATION SECTION                                                    */}
            {/* ========================================================================= */}
            <div className="rounded-2xl p-6 glass-panel border border-white/15 bg-[#0a1020] shadow-lg">
              <h4 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Analysis Summary</span>
              </h4>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {summary}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 7. TECHNICAL DETAILS (Expandable Accordion)                                */}
            {/* ========================================================================= */}
            <div className="rounded-2xl glass-panel border border-white/15 bg-[#0a1020] overflow-hidden shadow-lg">
              
              <button
                type="button"
                onClick={() => setIsTechnicalDetailsOpen(!isTechnicalDetailsOpen)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-mono uppercase tracking-wider text-slate-200 font-semibold">
                    Technical Details
                  </span>
                </div>
                {isTechnicalDetailsOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isTechnicalDetailsOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-white/10 space-y-3 font-mono text-xs">
                  
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Model:</span>
                    <span className="text-cyan-300 font-semibold">{metadata.model}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Input Type:</span>
                    <span className="text-slate-200">{metadata.inputType}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Resolution:</span>
                    <span className="text-slate-200">{metadata.resolution}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Coordinates / CRS:</span>
                    <span className="text-purple-300 font-semibold">{metadata.crs}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Processing Time:</span>
                    <span className="text-emerald-400 font-semibold">{metadata.processingTimeMs} ms</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Analysis Method:</span>
                    <span className="text-slate-200 text-right max-w-xs">{metadata.analysisMethod}</span>
                  </div>

                </div>
              )}

            </div>

          </section>

        </div>

        {/* ========================================================================= */}
        {/* 5. FINDINGS SECTION (Full-Width Responsive Cards)                         */}
        {/* ========================================================================= */}
        <section className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Analysis Findings</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Populated dynamically from backend response
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: Detection */}
                <div className="rounded-2xl p-5 glass-panel border border-white/10 bg-[#0a1020] hover:border-cyan-400/40 transition-colors shadow-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                    Detection
                  </span>
                  <div className="text-lg font-bold text-white mb-1">
                    {detectionLabel}
                  </div>
                  <span className="text-xs font-mono text-cyan-400">
                    Backend detection result
                  </span>
                </div>

                {/* CARD 2: Area */}
                <div className="rounded-2xl p-5 glass-panel border border-white/10 bg-[#0a1020] hover:border-cyan-400/40 transition-colors shadow-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                    Area
                  </span>
                  <div className="text-lg font-bold text-cyan-300 mb-1">
                    {detectionArea}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Backend-provided area
                  </span>
                </div>

                {/* CARD 3: Confidence */}
                <div className="rounded-2xl p-5 glass-panel border border-white/10 bg-[#0a1020] hover:border-cyan-400/40 transition-colors shadow-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                    Confidence
                  </span>
                  <div className="text-lg font-bold text-emerald-400 mb-1">
                    {detectionConfidence}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Backend-provided confidence
                  </span>
                </div>
            {/* CHANGE DETECTION CARD */}
            {changePercentage !== undefined && (
              <div className="rounded-2xl p-5 glass-panel border border-orange-400/30 bg-[#0a1020] hover:border-orange-400/50 transition-colors shadow-lg">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Change Detected
                </span>
                <div className="text-lg font-bold text-orange-300 mb-1">
                  {changePercentage}%
                </div>
                <span className="text-xs font-mono text-slate-400 block">
                  {changedPixels?.toLocaleString() ?? '—'} changed pixels
                </span>
                <span className="text-xs font-mono text-slate-500">
                  of {totalPixels?.toLocaleString() ?? '—'} total pixels
                </span>
              </div>
            )}

            {/* CARD 4: Coordinates */}
            <div 
              onClick={onOpenGeospatial}
              className={`rounded-2xl p-5 glass-panel border border-white/10 bg-[#0a1020] hover:border-purple-400/50 transition-all shadow-lg ${
                onOpenGeospatial ? 'cursor-pointer group' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Coordinates
                </span>
                {onOpenGeospatial && (
                  <span className="text-[10px] font-mono text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-bold text-purple-300 truncate mb-1" title={detectionCoordinates}>
                {detectionCoordinates}
              </div>
              <span className="text-xs font-mono text-slate-400">
                Backend-provided coordinates
              </span>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
};
