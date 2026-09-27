import React, { useState } from 'react';
import { ArrowRight, Play, Globe, Radar, Sparkles, Crosshair } from 'lucide-react';
import heroEarthImage from '../assets/images/hero_satellite_earth_1790235598782.jpg';

interface HeroProps {
  onStartAnalysis: () => void;
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartAnalysis, onOpenDemo }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden border-b border-white/10 sat-grid-bg">
      {/* Background Satellite / Earth Visualization */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Real Generated High-Fidelity Earth Imagery Backdrop */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen scale-105 transition-transform duration-1000 ease-out">
          <img
            src={heroEarthImage}
            alt="Orbital satellite Earth observation backdrop"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center filter saturate-125 brightness-95 transition-opacity duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Fallback styling if image takes a second */}
          {!imageLoaded && (
            <div className="w-full h-full bg-gradient-to-b from-[#060913] via-[#0b1329] to-[#060913]" />
          )}
        </div>

        {/* Space gradients & atmospheric limb glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/70 to-[#060913]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060913] via-transparent to-[#060913]" />
        
        {/* Subtle Radial Glows for Space Vibe */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-cyan-500/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        {/* Subtle Orbital Geometry Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse
            cx="50%"
            cy="52%"
            rx="46%"
            ry="28%"
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            className="animate-[spin_160s_linear_infinite] origin-center"
          />
          <ellipse
            cx="50%"
            cy="52%"
            rx="32%"
            ry="18%"
            fill="none"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1"
          />
        </svg>

        {/* Subtle coordinate markers */}
        <div className="absolute top-8 left-8 hidden lg:flex items-center gap-2 text-xs font-mono text-cyan-400/60 tabular-nums">
          <Crosshair className="w-3.5 h-3.5" />
          <span>REMOTE SENSING IMAGE ANALYSIS</span>
        </div>
        <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-2 text-xs font-mono text-purple-400/60 tabular-nums">
          <Radar className="w-3.5 h-3.5" />
          <span>IMAGE PROCESSING · RGB ANALYSIS</span>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center flex flex-col items-center">
        
        {/* Subtle Top Metadata / Category Note (Clean unboxed text, no pills) */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-cyan-400/90 mb-6 tracking-wider uppercase font-mono">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Remote Sensing Image Analysis</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-purple-400">Natural-Language Querying</span>
        </div>

        {/* Primary Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-display max-w-4xl leading-[1.1] text-balance">
          Ask Your Satellite Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Anything.</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl text-balance leading-relaxed">
          Analyze remote-sensing imagery using natural-language queries.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/25 cursor-pointer whitespace-nowrap"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-slate-200 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/15 hover:border-cyan-400/40 transition-all rounded-xl cursor-pointer backdrop-blur-sm whitespace-nowrap"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>View Demo</span>
          </button>
        </div>

        {/* Analysis Capabilities Strip (No fake pills, clean typographic notation) */}
        <div className="mt-14 pt-8 border-t border-white/10 w-full max-w-3xl flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>RGB Image Processing</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Water / Vegetation Estimates</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Built-up Region Estimates</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Basic Change Detection</span>
          </div>
        </div>

      </div>
    </section>
  );
};
