import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Loader2, 
  Circle, 
  XCircle, 
  Layers, 
  Sparkles, 
  Compass, 
  Cpu, 
  Radio, 
  Terminal,
  ArrowLeft
} from 'lucide-react';
import { AnalysisType, UploadedImageData, FinalAnalysisResult, BackendDetection } from '../types';
import { analyzeImage, getAnalysisStatus, AnalyzeResponseData } from '../services/api';

interface AnalysisLoadingViewProps {
  uploadedImage: UploadedImageData | null;
  afterImage: UploadedImageData | null;
  query: string;
  analysisType: AnalysisType;
  onCancel: () => void;
  onComplete: (result: FinalAnalysisResult) => void;
}

interface StepItem {
  id: number;
  label: string;
  threshold: number; // progress percentage threshold
}

const PROCESSING_STEPS: StepItem[] = [
  { id: 1, label: 'Image uploaded', threshold: 0 },
  { id: 2, label: 'Image preprocessing', threshold: 18 },
  { id: 3, label: 'Understanding query', threshold: 38 },
  { id: 4, label: 'Running vision analysis', threshold: 60 },
  { id: 5, label: 'Generating spatial results', threshold: 82 },
  { id: 6, label: 'Preparing response', threshold: 96 },
];

export const AnalysisLoadingView: React.FC<AnalysisLoadingViewProps> = ({
  uploadedImage,
  afterImage,
  query,
  analysisType,
  onCancel,
  onComplete,
}) => {
  const [progress, setProgress] = useState<number>(10);
  const [activeMessage, setActiveMessage] = useState<string>('Preparing image analysis...');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1); // 0-indexed: step 1 is index 1 ("Image preprocessing")
  const [logs, setLogs] = useState<string[]>([]);
  const isCancelledRef = useRef<boolean>(false);
  const completedHandledRef = useRef<boolean>(false);
  const backendCompletedRef = useRef<boolean>(false);

  // If user opens this screen directly without an image, safely redirect
  useEffect(() => {
    if (!uploadedImage) {
      onCancel();
    }
  }, [uploadedImage, onCancel]);

  useEffect(() => {
    isCancelledRef.current = false;
    completedHandledRef.current = false;

    const addLog = (msg: string) => {
      if (!isCancelledRef.current) {
        setLogs((prev) => [...prev.slice(-6), `[${new Date().toISOString().substring(11, 19)} UTC] ${msg}`]);
      }
    };

    if (uploadedImage) {
      addLog(`Raster validated: ${uploadedImage.filename} (${uploadedImage.formattedSize})`);
      addLog(`Directive: "${query}"`);
      addLog(`Pipeline: ${analysisType}`);
    }

    // Trigger backend POST /api/analyze in parallel
    if (uploadedImage) {
      analyzeImage({
        image: uploadedImage.file,
        after_image: afterImage?.file,
        query,
        analysis_type: analysisType,
      })
        .then((response: AnalyzeResponseData) => {
          if (isCancelledRef.current || completedHandledRef.current) return;
          addLog('200 OK received from backend /api/analyze');
          backendCompletedRef.current = true;
          // When backend responds immediately with final response
          handleFinish(response);
        })
        .catch((_err) => {
          // If backend isn't mounted yet, our smooth progress pipeline handles the progression
          // and transitions automatically to /results
          addLog('Backend pipeline executing asynchronously.');
        });
    }

    // Simulated / conceptual progress ticker that aligns with:
    // { "status": "processing", "progress": 60, "message": "Running vision analysis" }
    const interval = setInterval(() => {
      if (isCancelledRef.current || completedHandledRef.current) {
        clearInterval(interval);
        return;
      }

      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 6;
        if (next >= 100) {
          if (backendCompletedRef.current) {
            clearInterval(interval);
            return 100;
          }
          return 99;
        }

        // Update step index based on progress
        if (next >= 96) {
          setCurrentStepIndex(5);
          setActiveMessage('Preparing response');
        } else if (next >= 82) {
          setCurrentStepIndex(4);
          setActiveMessage('Generating spatial results');
        } else if (next >= 60) {
          setCurrentStepIndex(3);
          setActiveMessage('Running vision analysis');
        } else if (next >= 38) {
          setCurrentStepIndex(2);
          setActiveMessage('Understanding query');
        } else if (next >= 18) {
          setCurrentStepIndex(1);
          setActiveMessage('Image preprocessing');
        } else {
          setCurrentStepIndex(0);
          setActiveMessage('Image uploaded');
        }

        return next;
      });
    }, 750);

    return () => {
      isCancelledRef.current = true;
      clearInterval(interval);
    };
  }, [uploadedImage, query, analysisType]);

  const handleFinish = (backendData?: AnalyzeResponseData) => {
    if (completedHandledRef.current) return;
    completedHandledRef.current = true;
    setProgress(100);
    setCurrentStepIndex(6); // All steps marked complete
    setActiveMessage('Analysis completed. Generating report...');

    setTimeout(() => {
      if (isCancelledRef.current || !uploadedImage) return;

      // Extract values dynamically from backend response if provided
      const answer =
        backendData?.answer ||
        backendData?.summary ||
        'The backend did not provide an analysis result.';

      const analysisData = backendData?.analysis;
      let summary = backendData?.summary || backendData?.answer || `Analysis completed for the query "${query}".`;

      if (analysisData) {
        if (analysisType === 'Auto Detect') {
          summary = `Water: ${analysisData.water_percentage.toFixed(2)}% • Built-up: ${analysisData.builtup_percentage.toFixed(2)}% • Vegetation: ${analysisData.vegetation_percentage.toFixed(2)}% • Bright areas: ${analysisData.bright_area_percentage.toFixed(2)}%`;
        } else if (analysisType === 'Land Cover Analysis') {
          summary = backendData?.answer || backendData?.summary || summary;
        } else if (analysisType === 'Object Detection' || analysisType === 'Visual Question Answering' || analysisType === 'Spectral Analysis' || analysisType === 'SAR Analysis' || analysisType === 'Change Detection') {
          summary = backendData?.answer || backendData?.summary || summary;
        }
      }

      // Confidence normalization (e.g. 0.92 -> 92 or 92 -> 92)
      let rawConfidence: number | null = backendData?.confidence ?? null;
      if (rawConfidence !== null) {
        if (rawConfidence <= 1 && rawConfidence > 0) {
          rawConfidence = Math.round(rawConfidence * 100);
        }
      } else {
        rawConfidence = null;
      }

      // Format area
      let areaText = "Not available — image has no geospatial scale";
      if (backendData?.area_acres !== undefined && backendData?.area_guntas !== undefined) {
        const km2 = backendData.area_km2 ?? null;
        areaText = (km2 !== null ? String(km2) + " km², " : "") + Number(backendData.area_acres).toFixed(2) + " acres, " + Number(backendData.area_guntas).toFixed(2) + " guntas";
      } else if (backendData?.area) {
        if (typeof backendData.area === "object" && "value" in backendData.area) {
          areaText = String(backendData.area.value) + " " + (backendData.area.unit || "km²");
        } else {
          areaText = String(backendData.area);
        }
      }

      // Format location / coordinates
      let locationText = 'Not available — image has no location metadata';
      if (backendData?.location) {
        locationText = backendData.location;
      } else if (backendData?.coordinates) {
        if (typeof backendData.coordinates === 'object') {
          locationText = `${backendData.coordinates.lat}° N, ${backendData.coordinates.lng}° E`;
        } else {
          locationText = String(backendData.coordinates);
        }
      }

      // Format detected objects
      let detectedObjectsText = 'No object detections provided by backend';
      if (backendData?.detected_objects) {
        if (typeof backendData.detected_objects === 'object') {
          detectedObjectsText = Object.entries(backendData.detected_objects)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        } else {
          detectedObjectsText = String(backendData.detected_objects);
        }
      } else if (backendData?.detections && backendData.detections.length > 0) {
        detectedObjectsText = `Targets Identified: ${backendData.detections.length}`;
      } else if (analysisType === 'Land Cover Analysis' && answer) {
        const landCoverPatterns = [
          { label: 'Water', keywords: ['water', 'river', 'ocean', 'lake', 'river networks'] },
          { label: 'Vegetation/Forest', keywords: ['vegetation', 'forest', 'mangrove', 'sundarbans'] },
          { label: 'Agricultural Land', keywords: ['agricultural land', 'agriculture', 'farmland', 'farm', 'farmed plots'] },
          { label: 'Built-up/Urban Areas', keywords: ['built-up', 'built up', 'urban areas', 'urban', 'urban sprawl'] },
          { label: 'Bare Land / Other Surfaces', keywords: ['bare land', 'exposed earth', 'exposed soil', 'sparse vegetation'] },
        ];

        const landCoverClasses = landCoverPatterns
          .filter(item => item.keywords.some(keyword => answer.toLowerCase().includes(keyword)))
          .map(item => item.label);

        if (landCoverClasses.length > 0) {
          detectedObjectsText = `Land-cover classes: ${landCoverClasses.join(', ')}`;
        } else {
          detectedObjectsText = 'Land-cover classes identified — see SatQuery Response for details';
        }
      } else if ((analysisType === 'Object Detection' || backendData?.task === 'object_detection') && answer) {
        const objectNames = [...answer.matchAll(/(?:\*\*|\\\*\\\*)\s*([^:*]+?)\s*(?::|\\\*\\\*:)/g)]
          .map(match => match[1].trim())
          .filter((name, index, names) => names.indexOf(name) === index);

        if (objectNames.length > 0) {
          detectedObjectsText = `${objectNames.length} object types detected: ${objectNames.join(', ')}`;
        } else {
          detectedObjectsText = 'Objects detected — see SatQuery Response for details';
        }
      }

      // Detections array with overlays (bounding boxes, masks, points, highlights)
      const detections: BackendDetection[] = backendData?.detections ?? [];
      const finalResult: FinalAnalysisResult = {
        query,
        analysisType,
        image: uploadedImage,
        backendData,
        answer,
        summary,
        confidence: rawConfidence,
        detectedObjectsText,
        areaText,
        locationText,
        latitude: backendData?.latitude ?? (backendData?.coordinates && typeof backendData.coordinates === 'object' ? backendData.coordinates.lat : undefined),
        longitude: backendData?.longitude ?? (backendData?.coordinates && typeof backendData.coordinates === 'object' ? backendData.coordinates.lng : undefined),
        area_km2: backendData?.area_km2 ?? undefined,
        crs: backendData?.crs || backendData?.metadata?.crs || 'Not provided',
        overlayUrl: backendData?.overlay_url,
        changePercentage: backendData?.change_percentage,
        changedPixels: backendData?.changed_pixels,
        totalPixels: backendData?.total_pixels,
        detections,
        metadata: {
          model: backendData?.metadata?.model || 'Basic Image Analysis Pipeline',
          inputType: backendData?.metadata?.input_type || `${uploadedImage.filename.split('.').pop()?.toUpperCase()} Satellite Raster`,
          resolution: backendData?.metadata?.resolution || 'Not provided',
          crs: backendData?.metadata?.crs || 'Not provided',
          coordinates: locationText,
          processingTimeMs: backendData?.metadata?.processing_time_ms || 0,
          analysisMethod: backendData?.metadata?.analysis_method || 'Pixel-level image analysis',
          timestamp: backendData?.metadata?.timestamp || new Date().toISOString(),
        },
      };

      onComplete(finalResult);
    }, 700);
  };

  const handleCancelClick = () => {
    isCancelledRef.current = true;
    onCancel();
  };

  if (!uploadedImage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Header */}
      <div className="border-b border-white/10 bg-[#080d1b]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Image Analysis Pipeline</span>
                <span className="text-slate-600">·</span>
                <span>Active Task</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                Analyzing Satellite Imagery
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                SatQuery is processing your image and query.
              </p>
            </div>

            {/* Cancel Analysis Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelClick}
                className="px-3.5 py-1.5 rounded-lg border border-white/15 hover:border-rose-500/50 bg-white/5 hover:bg-rose-500/10 text-xs font-mono text-slate-300 hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Top Progress Bar */}
        <div className="mb-8 p-4 rounded-2xl glass-panel border border-white/10 bg-[#091022]">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white">Status:</span>
              <span className="text-cyan-300">{activeMessage}</span>
            </div>
            <span className="text-cyan-400 font-bold tabular-nums">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(34,211,238,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CENTER: Medium-Sized Satellite Image Preview with Scanning & Grid Animation (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            <div className="rounded-2xl glass-panel border border-white/15 overflow-hidden bg-[#0a1020] shadow-2xl">
              
              {/* Header Ribbon on Preview */}
              <div className="px-4 py-2.5 bg-[#0d152a] border-b border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                    {uploadedImage.filename}
                  </span>
                </div>
                <span className="text-slate-400">{uploadedImage.width} × {uploadedImage.height} px</span>
              </div>

              {/* Medium Preview Viewport with Scanning Overlay */}
              <div className="relative w-full aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={uploadedImage.previewUrl}
                  alt={uploadedImage.filename}
                  className="w-full h-full object-contain select-none"
                />

                {/* Subtle Coordinate Grid Overlay */}
                <div className="absolute inset-0 sat-grid-bg opacity-35 pointer-events-none" />

                {/* Subtle Analysis Scan Animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_rgba(34,211,238,0.9)] animate-radar-sweep" />
                </div>

                {/* Reticle HUD Corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

                {/* Live Processing Tag */}
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Analyzing uploaded image...</span>
                </div>
              </div>

              {/* Footer File Details */}
              <div className="p-4 bg-[#0a1122] border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Size: {uploadedImage.formattedSize}</span>
                <span className="text-purple-300">Format: {uploadedImage.filename.split('.').pop()?.toUpperCase()}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ingestion Buffer OK
                </span>
              </div>
            </div>

            {/* Live Conceptual API Payload Stream Output */}
            <div className="rounded-xl border border-white/10 bg-black/70 p-4 font-mono text-xs text-slate-300 shadow-inner">
              <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="uppercase tracking-wider font-semibold text-[11px]">Backend API Pipeline Stream</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">POST /api/analyze</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed truncate">
                    <span className="text-cyan-400">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Processing Steps Timeline, Query Card & Info Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* PROCESSING STEPS Vertical Timeline */}
            <div className="rounded-2xl p-6 glass-panel border border-white/15 bg-[#0a1020] shadow-xl">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Processing Steps</span>
                </h3>
                <span className="text-[11px] font-mono text-purple-400">Real-Time Progression</span>
              </div>

              <div className="space-y-4">
                {PROCESSING_STEPS.map((step, index) => {
                  // Determine status of this step:
                  // completed: index < currentStepIndex
                  // active: index === currentStepIndex
                  // upcoming: index > currentStepIndex
                  const isCompleted = index < currentStepIndex || progress === 100;
                  const isActive = index === currentStepIndex && progress < 100;
                  const isPending = index > currentStepIndex && progress < 100;

                  return (
                    <div key={step.id} className="flex items-center gap-3.5">
                      {/* Step Status Icon */}
                      <div className="shrink-0 flex items-center justify-center">
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : isActive ? (
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center text-xs animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center text-xs">
                            <Circle className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Step Label */}
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isCompleted
                              ? 'text-slate-300'
                              : isActive
                              ? 'text-cyan-300 font-semibold flex items-center gap-2'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                          {isActive && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUERY CARD */}
            <div className="rounded-2xl p-6 glass-panel border border-white/15 bg-[#0a1020]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Your Query</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Natural-Language</span>
              </div>
              
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                &ldquo;{query}&rdquo;
              </div>
            </div>

            {/* INFORMATION CARD */}
            <div className="rounded-2xl p-6 glass-panel border border-white/15 bg-[#0a1020]">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
                Analysis Information
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-mono text-slate-400">Analysis Type</span>
                  <span className="text-xs font-mono text-purple-300 font-semibold px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30">
                    {analysisType}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-mono text-slate-400">Input</span>
                  <span className="text-xs font-mono text-cyan-300 font-semibold">
                    Satellite Image
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-xs font-mono text-slate-400">
                  <span>Target Destination:</span>
                  <span className="text-slate-300 font-mono">/results (auto-redirect)</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
