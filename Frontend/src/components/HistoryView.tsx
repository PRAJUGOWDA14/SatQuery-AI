import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Satellite, 
  Layers, 
  AlertCircle,
  FileCode,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import { HistoryItem, FinalAnalysisResult } from '../types';
import { getAnalysisHistory, deleteAnalysisFromHistory, clearAllAnalysisHistory } from '../services/historyStorage';

interface HistoryViewProps {
  onViewResult: (result: FinalAnalysisResult) => void;
  onStartAnalysis: () => void;
}

type FilterCategory = 'All' | 'VQA' | 'Object Detection' | 'Change Detection' | 'Spectral Analysis';

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  onViewResult, 
  onStartAnalysis 
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load history from backend / dynamic storage
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const items = await getAnalysisHistory();
      setHistoryItems(items);
    } catch (err) {
      console.warn('Failed to load history items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle single item deletion
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const updated = await deleteAnalysisFromHistory(id);
      setHistoryItems(updated);
    } catch (err) {
      console.warn('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle viewing results
  const handleViewResults = (item: HistoryItem) => {
    if (item.result) {
      onViewResult(item.result);
      return;
    }

    // Fallback if result object was minimal
    const fallbackResult: FinalAnalysisResult = {
      query: item.query,
      analysisType: (item.analysisType as any) || 'Auto Detect',
      image: {
        file: new File([], item.filename),
        previewUrl: item.thumbnailUrl,
        filename: item.filename,
        width: 0,
        height: 0,
        sizeBytes: 0,
        formattedSize: 'Not available',
      },
      answer: 'This history record does not contain the original backend analysis result.',
      summary: 'Only the saved history metadata is available for this record.',
      confidence: null,
      detectedObjectsText: 'Not provided',
      areaText: 'Not available',
      locationText: 'Not available',
      latitude: undefined,
      longitude: undefined,
      area_km2: undefined,
      crs: 'Not provided',
      detections: [],
      metadata: {
        model: 'Not provided',
        inputType: 'Not provided',
        resolution: 'Not provided',
        crs: 'Not provided',
        coordinates: 'Not provided',
        processingTimeMs: 0,
        analysisMethod: 'Not provided',
        timestamp: item.date,
      },
    };

    onViewResult(fallbackResult);
  };

  // Filter items based on Category and Search text
  const filteredItems = historyItems.filter((item) => {
    // 1. Category Filter
    let matchesCategory = true;
    const typeLower = (item.analysisType || '').toLowerCase();
    const queryLower = (item.query || '').toLowerCase();

    if (activeFilter === 'VQA') {
      matchesCategory = 
        typeLower.includes('vqa') || 
        typeLower.includes('visual question') || 
        typeLower.includes('visual analysis');
    } else if (activeFilter === 'Object Detection') {
      matchesCategory = 
        typeLower.includes('object') || 
        typeLower.includes('detect') || 
        queryLower.includes('detect') ||
        queryLower.includes('identify');
    } else if (activeFilter === 'Change Detection') {
      matchesCategory = 
        typeLower.includes('change');
    } else if (activeFilter === 'Spectral Analysis') {
      matchesCategory = 
        typeLower.includes('spectral') || 
        typeLower.includes('land') || 
        typeLower.includes('cover') ||
        typeLower.includes('water');
    }

    // 2. Search Box Query Filter
    const searchTrimmed = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchTrimmed || 
      item.filename.toLowerCase().includes(searchTrimmed) ||
      item.query.toLowerCase().includes(searchTrimmed) ||
      item.analysisType.toLowerCase().includes(searchTrimmed);

    return matchesCategory && matchesSearch;
  });

  const filterOptions: FilterCategory[] = [
    'All',
    'VQA',
    'Object Detection',
    'Change Detection',
    'Spectral Analysis',
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* ========================================================================= */}
      {/* 1. HEADER                                                                 */}
      {/* ========================================================================= */}
      <div className="pb-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">
            Analysis History
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            View your previous satellite image analyses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartAnalysis}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start New Analysis</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH AND FILTERS                                                     */}
      {/* ========================================================================= */}
      <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search analyses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a1020] border border-white/10 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090f1f] border border-white/10 text-xs overflow-x-auto w-full lg:w-auto">
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CONTENT AREA: EMPTY STATE OR ANALYSIS CARDS                            */}
      {/* ========================================================================= */}
      <div className="mt-8">
        
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm font-mono">Retrieving analysis records...</p>
          </div>
        ) : historyItems.length === 0 ? (
          
          /* 3.1 EMPTY STATE (Exact requirement: "No analyses yet." / "Upload a satellite image to start your first analysis." / Button: "Start Analysis") */
          <div className="rounded-3xl p-12 sm:p-16 glass-panel border border-white/10 bg-[#080d1a] flex flex-col items-center justify-center text-center my-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-inner">
              <Satellite className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 font-display">
              No analyses yet.
            </h2>
            
            <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
              Upload a satellite image to start your first analysis.
            </p>

            <button
              type="button"
              onClick={onStartAnalysis}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Analysis</span>
            </button>
          </div>

        ) : filteredItems.length === 0 ? (
          
          /* 3.2 NO SEARCH RESULTS */
          <div className="rounded-2xl p-10 glass-panel border border-white/10 bg-[#080d1a] flex flex-col items-center justify-center text-center my-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              No matching analyses found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-5">
              No saved analysis matches "{searchQuery}" with filter "{activeFilter}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white font-mono cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

        ) : (
          
          /* 3.3 ANALYSIS CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl glass-panel border border-white/10 bg-[#091021] hover:border-cyan-500/40 transition-all duration-300 overflow-hidden flex flex-col shadow-xl group"
                >
                  {/* Card Thumbnail */}
                  <div className="relative w-full aspect-[16/10] bg-black/60 overflow-hidden border-b border-white/10">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091021] via-transparent to-black/30 pointer-events-none" />

                    {/* Status Badge (Top-Right) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[11px] font-mono text-emerald-400 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{item.status}</span>
                    </div>

                    {/* Sensor / Constellation Mini Badge (Top-Left) */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                      <Satellite className="w-3 h-3 text-cyan-400" />
                      <span>Image Analysis</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    
                    <div className="space-y-3">
                      {/* Filename */}
                      <div>
                        <h3 
                          className="text-base font-bold text-white font-mono truncate hover:text-cyan-300 transition-colors"
                          title={item.filename}
                        >
                          {item.filename}
                        </h3>
                      </div>

                      {/* Query */}
                      <div className="rounded-xl bg-black/40 border border-white/5 p-3 space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                          Query:
                        </span>
                        <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-relaxed">
                          "{item.query}"
                        </p>
                      </div>

                      {/* Type & Date Meta Fields */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400">
                            Type:
                          </span>
                          <span className="text-cyan-300 font-semibold truncate" title={item.analysisType}>
                            {item.analysisType}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            Date:
                          </span>
                          <span className="text-slate-300 truncate" title={item.date}>
                            {item.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Buttons (View Results & Delete) */}
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2.5">
                      
                      {/* View Results Button */}
                      <button
                        type="button"
                        onClick={() => handleViewResults(item)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/15 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Results</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={isDeleting}
                        title="Delete this analysis record"
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        )}

      </div>

    </div>
  );
};
