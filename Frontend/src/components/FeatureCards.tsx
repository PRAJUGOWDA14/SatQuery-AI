import React from 'react';
import { Layers, MessageSquareText, Compass, History, ArrowUpRight } from 'lucide-react';
import opticalImg from '../assets/images/multimodal_satellite_optical_1790235611853.jpg';
import sarImg from '../assets/images/sar_radar_coastal_1790235625239.jpg';
import changeImg from '../assets/images/satellite_change_detection_1790235637290.jpg';

interface FeatureCardsProps {
  onSelectFeature: (modality: 'Multispectral' | 'SAR' | 'Change Detection' | 'Optical') => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onSelectFeature }) => {
  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-cyan-400 uppercase mb-3">
          <span>Core Capabilities</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span>Earth Observation Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-display">
          Engineered for Deep Remote Sensing Perception
        </h2>
        <p className="mt-3 text-base text-slate-400 max-w-2xl leading-relaxed">
          Bridging orbital sensor physics with multimodal reasoning to deliver actionable geospatial insights at scale.
        </p>
      </div>

      {/* Four Compact Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        
        {/* Card 1: Multimodal Analysis */}
        <div
          onClick={() => onSelectFeature('Multispectral')}
          className="group relative rounded-2xl p-6 glass-panel glass-panel-hover flex flex-col justify-between cursor-pointer border border-white/10 hover:border-blue-500/40"
        >
          <div>
            {/* Visual Header / Micro Thumbnail */}
            <div className="relative w-full h-32 mb-5 rounded-xl overflow-hidden bg-slate-950 border border-white/10">
              <img
                src={opticalImg}
                alt="RGB satellite or aerial imagery"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f] via-transparent to-transparent" />
              <div className="absolute top-2.5 left-2.5 p-2 rounded-lg bg-[#060913]/80 backdrop-blur-md border border-white/10 text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <div className="absolute bottom-2.5 left-2.5 text-[11px] font-mono text-cyan-300">
                <span>RGB Image Processing</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                Multimodal Analysis
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Analyze uploaded images using RGB image processing.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Image sources: User Uploads</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
        </div>

        {/* Card 2: Natural Language Queries */}
        <div
          onClick={() => onSelectFeature('Optical')}
          className="group relative rounded-2xl p-6 glass-panel glass-panel-hover flex flex-col justify-between cursor-pointer border border-white/10 hover:border-indigo-500/40"
        >
          <div>
            {/* Visual Micro-Card Representation */}
            <div className="relative w-full h-32 mb-5 rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono text-indigo-300">Zero-Shot Reasoning</span>
              </div>

              {/* Sample Natural Query Demonstration */}
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono line-clamp-2">
                &ldquo;Count all cargo vessels anchored in the outer harbor&rdquo;
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display group-hover:text-indigo-300 transition-colors">
                Natural Language Queries
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Ask questions in simple natural language.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Context: Semantic & Spatial</span>
            <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
        </div>

        {/* Card 3: Image-Based Analysis */}
        <div
          onClick={() => onSelectFeature('SAR')}
          className="group relative rounded-2xl p-6 glass-panel glass-panel-hover flex flex-col justify-between cursor-pointer border border-white/10 hover:border-purple-500/40"
        >
          <div>
            {/* Visual Header with Radar/Coordinate Graphic */}
            <div className="relative w-full h-32 mb-5 rounded-xl overflow-hidden bg-slate-950 border border-white/10">
              <img
                src={sarImg}
                alt="Radar image sample"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f] via-transparent to-transparent" />
              <div className="absolute top-2.5 left-2.5 p-2 rounded-lg bg-[#060913]/80 backdrop-blur-md border border-white/10 text-purple-400">
                <Compass className="w-4 h-4" />
              </div>
              <div className="absolute bottom-2.5 left-2.5 text-[11px] font-mono text-purple-300">
                <span>Image coordinates: Not provided</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                Image-Based Analysis
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Connect detected objects with real geographic locations.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Accuracy: Sub-Pixel Vector</span>
            <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
        </div>

        {/* Card 4: Change Detection */}
        <div
          onClick={() => onSelectFeature('Change Detection')}
          className="group relative rounded-2xl p-6 glass-panel glass-panel-hover flex flex-col justify-between cursor-pointer border border-white/10 hover:border-cyan-500/40"
        >
          <div>
            {/* Visual Header / Micro Thumbnail */}
            <div className="relative w-full h-32 mb-5 rounded-xl overflow-hidden bg-slate-950 border border-white/10">
              <img
                src={changeImg}
                alt="Multi-temporal satellite change detection"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f] via-transparent to-transparent" />
              <div className="absolute top-2.5 left-2.5 p-2 rounded-lg bg-[#060913]/80 backdrop-blur-md border border-white/10 text-cyan-400">
                <History className="w-4 h-4" />
              </div>
              <div className="absolute bottom-2.5 left-2.5 text-[11px] font-mono text-cyan-300">
                <span>ΔT Multi-Pass Comparison</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                Change Detection
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Compare imagery across different time periods.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Cadence: Daily to Decadal</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
        </div>

      </div>
    </section>
  );
};
