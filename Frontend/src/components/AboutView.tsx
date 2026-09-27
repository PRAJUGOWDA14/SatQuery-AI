import React from 'react';
import { Satellite, Globe, Cpu, ShieldCheck, Compass, Radio } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="pb-8 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase mb-2">
          <span>Mission & Technology</span>
          <span className="text-slate-600">·</span>
          <span>Remote Sensing Image Analysis Prototype</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
          SatQuery AI Architecture
        </h1>
        <p className="mt-3 text-base text-slate-300 leading-relaxed max-w-3xl">
          SatQuery AI is a prototype for natural-language image analysis of uploaded satellite or aerial imagery. User queries are routed to the available backend analysis functions, which currently use RGB image-processing techniques to estimate basic image properties such as water-like, vegetation, and built-up regions.
        </p>
      </div>

      {/* Grid of Architectural Pillars */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              RGB Image Processing
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              SatQuery AI currently analyzes uploaded RGB satellite or aerial imagery using image-processing techniques. The prototype is designed to support future multispectral and SAR analysis as additional processing modules are integrated.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-cyan-400">
            Current Input: RGB Image
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Analysis Results & Overlays
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              The results interface can display values and visualization data returned by the backend. Real-world coordinates, geospatial measurements, and object detections require appropriate image metadata and dedicated processing modules.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-purple-400">
            Geospatial Metadata: Required for Real-World Measurements
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Query-Based Analysis
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Natural-language queries are routed to the analysis functions currently available in the backend. The prototype can recognize supported requests such as water, vegetation, built-up regions, area-related questions, and general image analysis.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-indigo-400">
            Query Router + Image Processing
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Change Detection
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              The backend can compare a before image with an after image and calculate the percentage of pixels that differ. This provides a basic image-level change estimate without assuming geospatial registration or satellite-specific metadata.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-emerald-400">
            Change Estimate: Pixel Difference
          </div>
        </div>

      </div>

    </div>
  );
};
