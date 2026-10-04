import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Image as ImageIcon, X, RefreshCw, AlertCircle, 
  HelpCircle, ArrowRight, Sparkles, ChevronDown, CheckCircle2,
  FileCheck, Globe, Maximize2
} from 'lucide-react';
import { AnalysisType, UploadedImageData } from '../types';
import opticalSampleImg from '../assets/images/multimodal_satellite_optical_1790235611853.jpg';
import sarSampleImg from '../assets/images/sar_radar_coastal_1790235625239.jpg';
import changeSampleImg from '../assets/images/satellite_change_detection_1790235637290.jpg';

interface AnalysisWorkspaceProps {
  uploadedImage: UploadedImageData | null;
  setUploadedImage: (img: UploadedImageData | null) => void;
  afterImage: UploadedImageData | null;
  setAfterImage: (img: UploadedImageData | null) => void;
  query: string;
  setQuery: (q: string) => void;
  analysisType: AnalysisType;
  setAnalysisType: (t: AnalysisType) => void;
  onStartAnalysis: () => void;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  uploadedImage,
  setUploadedImage,
  afterImage,
  setAfterImage,
  query,
  setQuery,
  analysisType,
  setAnalysisType,
  onStartAnalysis,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const afterFileInputRef = useRef<HTMLInputElement | null>(null);

  const analysisOptions: AnalysisType[] = [
    'Auto Detect',
    'Visual Question Answering',
    'Object Detection',
    'Change Detection',
    'Land Cover Analysis',
    'Spectral Analysis',
  ];

  const exampleChips = [
    'Identify water bodies',
    'Detect buildings',
    'Find vegetation',
    'Analyze urban expansion',
    'Compare changes',
    'Identify flooded areas',
  ];

  // Helper to format bytes to human-readable string
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Process a selected file
  const processSelectedFile = (file: File) => {
    setValidationError(null);

    // Validate mime / extension
    const allowedExtensions = ['.tif', '.tiff', '.png', '.jpg', '.jpeg'];
    const fileNameLower = file.name.toLowerCase();
    const isValidFormat = allowedExtensions.some(ext => fileNameLower.endsWith(ext)) || 
      file.type.startsWith('image/');

    if (!isValidFormat) {
      setValidationError('Unsupported file format. Please upload PNG, JPG, TIFF.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setUploadedImage({
        file,
        previewUrl,
        filename: file.name,
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
        sizeBytes: file.size,
        formattedSize: formatFileSize(file.size),
      });
    };
    img.onerror = () => {
      // In case of raw TIFF without browser native decoder, provide standard dimensions fallback
      setUploadedImage({
        file,
        previewUrl,
        filename: file.name,
        width: 2048,
        height: 2048,
        sizeBytes: file.size,
        formattedSize: formatFileSize(file.size),
      });
    };
    img.src = previewUrl;
  };

  // Process the After image for Change Detection
  const processAfterSelectedFile = (file: File) => {
    setValidationError(null);

    const allowedExtensions = ['.tif', '.tiff', '.png', '.jpg', '.jpeg'];
    const fileNameLower = file.name.toLowerCase();
    const isValidFormat = allowedExtensions.some(ext => fileNameLower.endsWith(ext)) ||
      file.type.startsWith('image/');

    if (!isValidFormat) {
      setValidationError('Unsupported file format. Please upload PNG, JPG, TIFF.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setAfterImage({
        file,
        previewUrl,
        filename: file.name,
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
        sizeBytes: file.size,
        formattedSize: formatFileSize(file.size),
      });
    };

    img.onerror = () => {
      setAfterImage({
        file,
        previewUrl,
        filename: file.name,
        width: 2048,
        height: 2048,
        sizeBytes: file.size,
        formattedSize: formatFileSize(file.size),
      });
    };

    img.src = previewUrl;
  };
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to load sample satellite imagery as real File object
  const handleLoadSample = async (sampleUrl: string, sampleName: string) => {
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: 'image/jpeg' });
      processSelectedFile(file);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  // Submit & Validation handler
  const handleAnalyzeClick = () => {
    setValidationError(null);

    if (!uploadedImage) {
      setValidationError('Please upload a satellite image before starting analysis.');
      return;
    }

    if (!query.trim()) {
      setValidationError('Please enter a natural-language query or select an example prompt.');
      return;
    }

    setIsSubmitting(true);
    // Trigger navigation to /analysis/loading
    onStartAnalysis();
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col">
      
      {/* Top Page Header */}
      <div className="border-b border-white/10 bg-[#080d1b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Space-Tech Remote Sensing Console</span>
                <span className="text-slate-600">·</span>
                <span>Image Analysis Core</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-display">
                Satellite Image Analysis
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-slate-300">
                Upload imagery and ask a question in natural language.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Target API: POST /api/analyze</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        
        {/* Validation Error Banner */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Validation Required:</span> {validationError}
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-rose-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL — Image Upload (7 Columns on large screens for visual prominence) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Imagery Ingestion</span>
              </h2>
              {uploadedImage && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Image Ready
                </span>
              )}
            </div>

            {/* Image / Before Image */}
            <div className="rounded-2xl glass-panel border border-white/15 overflow-hidden bg-[#0a1020]">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {analysisType === 'Change Detection' ? 'Before Image' : 'Image'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {analysisType === 'Change Detection'
                        ? 'Upload the earlier image to compare with the After Image.'
                        : 'Upload a satellite or remote-sensing image for analysis.'}
                    </p>
                  </div>

                  {uploadedImage && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Image Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Upload Area or Preview Area */}
              {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[380px] ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                    : 'border-white/20 hover:border-cyan-400/50 bg-[#0a1020]/70'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".tif,.tiff,.png,.jpg,.jpeg,image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-5 shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                  Upload Remote-Sensing Image
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Drag & drop your image here
                </p>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold tracking-wide transition-all">
                    or Browse Files
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 w-full max-w-xs text-center">
                  <span className="text-xs font-mono text-slate-400 block">
                    Supported formats:
                  </span>
                  <span className="text-xs font-mono text-cyan-300 font-semibold mt-1 block">
                    PNG, JPG, TIFF
                  </span>
                </div>
              </div>
            ) : (
              /* Image Preview Box */
              <div className="rounded-2xl glass-panel border border-white/15 overflow-hidden bg-[#0a1020] flex flex-col">
                {/* Visual Preview Port */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-white/10">
                  <img
                    src={uploadedImage.previewUrl}
                    alt={uploadedImage.filename}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Subtle Grid HUD */}
                  <div className="absolute inset-0 sat-grid-bg opacity-30 pointer-events-none" />

                  {/* Top-Right Tag */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono text-cyan-300">
                    {uploadedImage.width} × {uploadedImage.height} px
                  </div>
                </div>

                {/* Metadata & Controls Bar */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d152a]">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <h4 className="text-sm font-semibold text-white truncate">
                        {uploadedImage.filename}
                      </h4>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>Dimensions: {uploadedImage.width} × {uploadedImage.height}</span>
                      <span>·</span>
                      <span>Size: {uploadedImage.formattedSize}</span>
                    </div>
                  </div>

                  {/* Actions: Replace Image & Remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".tif,.tiff,.png,.jpg,.jpeg,image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Replace Image</span>
                    </button>

                    <button
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            </div>

            {/* After Image — Change Detection */}
            {analysisType === 'Change Detection' && (
              <div className="rounded-2xl glass-panel border border-white/15 overflow-hidden bg-[#0a1020]">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        After Image
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Upload the later image to compare with the Before Image.
                      </p>
                    </div>

                    {afterImage && (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Image Ready
                      </span>
                    )}
                  </div>
                </div>

                {!afterImage ? (
                  <div
                    onClick={() => afterFileInputRef.current?.click()}
                    className="p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[380px] border-2 border-dashed border-white/15 hover:border-cyan-400/50 transition-all"
                  >
                    <input
                      ref={afterFileInputRef}
                      type="file"
                      accept=".tif,.tiff,.png,.jpg,.jpeg,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          processAfterSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <Upload className="w-8 h-8 text-cyan-400 mb-3" />

                    <h4 className="text-sm font-semibold text-white">
                      Upload After Image
                    </h4>

                    <p className="text-xs text-slate-400 mt-1">
                      Click to browse PNG, JPG or TIFF
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-white/10">
                      <img
                        src={afterImage.previewUrl}
                        alt={afterImage.filename}
                        className="w-full h-full object-contain"
                      />

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono text-cyan-300">
                        {afterImage.width} × {afterImage.height} px
                      </div>
                    </div>

                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d152a]">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="text-sm font-semibold text-white truncate">
                            {afterImage.filename}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs font-mono text-slate-400">
                          <span>Dimensions: {afterImage.width} × {afterImage.height}</span>
                          <span>·</span>
                          <span>Size: {afterImage.formattedSize}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => afterFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Replace</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (afterImage.previewUrl) {
                              URL.revokeObjectURL(afterImage.previewUrl);
                            }
                            setAfterImage(null);
                            if (afterFileInputRef.current) {
                              afterFileInputRef.current.value = '';
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Demo Pre-load Strip */}
            <div className="p-4 rounded-xl glass-panel border border-white/5 bg-[#090f1e]/80">
              <span className="text-xs font-mono text-slate-400 block mb-2.5">
                Or try with pre-calibrated sample satellite scenes:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample(opticalSampleImg, 'RGB_Agriculture_Sample.jpg')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                    RGB Sample
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">RGB Image Sample</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample(sarSampleImg, 'Radar_Harbor_Sample.jpg')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                    Radar Sample
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Radar Image Sample</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample(changeSampleImg, 'Satellite_Change_Sample.jpg')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                    Change Detection
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Satellite Image Sample</div>
                </button>
              </div>
            </div>

          </div>

          {/* CENTER/RIGHT PANEL — Query, Analysis Type & Trigger (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Query Card */}
            <div className="rounded-2xl p-6 glass-panel border border-white/15 bg-[#0a1020] flex flex-col">
              
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="query-input"
                  className="text-sm font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Ask SatQuery</span>
                </label>
                <span className="text-[11px] font-mono text-purple-400">Natural-Language</span>
              </div>

              {/* Large Query Input */}
              <textarea
                id="query-input"
                rows={4}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Example: Identify water bodies in this image and estimate their area."
                className="w-full p-4 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm sm:text-base text-slate-100 placeholder:text-slate-400 resize-none transition-colors leading-relaxed"
              />

              {/* Example Query Chips */}
              <div className="mt-4">
                <span className="text-xs font-mono text-slate-400 block mb-2">
                  Example query directives (click to load):
                </span>
                <div className="flex flex-wrap gap-2">
                  {exampleChips.map((chipText) => (
                    <button
                      key={chipText}
                      type="button"
                      onClick={() => {
                        setQuery(chipText);
                        if (validationError) setValidationError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 hover:border-cyan-400/40 text-xs text-slate-200 transition-all cursor-pointer text-left font-medium"
                    >
                      {chipText}
                    </button>
                  ))}
                </div>
              </div>

              {/* ANALYSIS TYPE Dropdown */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="analysis-type-select"
                    className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold"
                  >
                    Analysis Type
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400">Pipeline Mode</span>
                </div>

                <div className="relative">
                  <select
                    id="analysis-type-select"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 appearance-none cursor-pointer transition-colors font-medium pr-10"
                  >
                    {analysisOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#090f1f] text-slate-200 py-1">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* ANALYZE BUTTON */}
              <div className="mt-6 pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzeClick}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-300" />
                      <span>Initiating Orbital Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Image</span>
                      <ArrowRight className="w-5 h-5 text-cyan-300" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Backend Integration Note Card */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-400 flex items-start gap-3 font-mono">
              <span className="text-cyan-400 font-bold text-sm">API:</span>
              <div className="space-y-1">
                <p className="text-slate-300">
                  Calls <code className="text-cyan-300 font-bold">POST /api/analyze</code> with <code className="text-slate-200">FormData(image, query, analysis_type)</code>.
                </p>
                <p className="text-slate-400">
                  Configured via <code className="text-purple-300">src/services/api.ts</code> for clean backend communication.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
