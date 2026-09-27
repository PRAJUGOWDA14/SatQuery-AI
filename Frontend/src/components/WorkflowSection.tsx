import React, { useState } from 'react';
import { Upload, MessageSquare, Cpu, BarChart3, ChevronRight, ArrowRight } from 'lucide-react';

interface WorkflowSectionProps {
  onStartAnalysis: () => void;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({ onStartAnalysis }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      step: 1,
      title: 'Upload Image',
      icon: Upload,
      accent: 'text-blue-400',
      borderAccent: 'border-blue-500/40',
      bgGlow: 'from-blue-500/10',
      shortDesc: 'Upload satellite or aerial images for analysis.',
      technicalSpecs: [
        'Supports common image formats such as PNG, JPG, and TIFF',
        'Automatic coordinate reference system (CRS) detection',
        'RGB image processing'
      ]
    },
    {
      step: 2,
      title: 'Ask Query',
      icon: MessageSquare,
      accent: 'text-indigo-400',
      borderAccent: 'border-indigo-500/40',
      bgGlow: 'from-indigo-500/10',
      shortDesc: 'Specify target objects, regions of interest, or temporal phenomena in plain language.',
      technicalSpecs: [
        'Natural-language prompt understanding tailored for Earth observation',
        'Direct spatial questions: counting, segmentation & anomaly identification',
        'Interpret natural-language analysis queries'
      ]
    },
    {
      step: 3,
      title: 'AI Analysis',
      icon: Cpu,
      accent: 'text-purple-400',
      borderAccent: 'border-purple-500/40',
      bgGlow: 'from-purple-500/10',
      shortDesc: 'Natural-language queries are routed to the available image-analysis functions.',
      technicalSpecs: [
        'Query-based task routing for supported image-analysis operations',
        'Current prototype uses RGB image-processing techniques for basic estimates',
        'Multispectral and SAR processing can be added as future modules'
      ]
    },
    {
      step: 4,
      title: 'Visual Results',
      icon: BarChart3,
      accent: 'text-cyan-400',
      borderAccent: 'border-cyan-500/40',
      bgGlow: 'from-cyan-500/10',
      shortDesc: 'Inspect the image, backend analysis results, and available visualization overlays.',
      technicalSpecs: [
        'Backend-provided detections and overlays can be visualized when available',
        'Analysis results can be presented through the existing results interface',
        'Advanced geospatial and spectral overlays can be added in future versions'
      ]
    }
  ];

  return (
    <section className="py-16 md:py-24 border-t border-white/10 bg-[#070b16]/70 sat-grid-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-wider text-cyan-400 uppercase mb-3">
            <span>Workflow Architecture</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>4-Stage Analysis Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-display">
            From Uploaded Image to Analysis Results
          </h2>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            A seamless four-step pipeline connecting Earth observation data with natural language reasoning.
          </p>
        </div>

        {/* The 4-Step Interactive Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative mb-12">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isSelected = activeStep === index;

            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(index)}
                className={`group relative rounded-2xl p-6 glass-panel transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `border ${item.borderAccent} bg-gradient-to-b ${item.bgGlow} to-transparent shadow-lg shadow-black/40`
                    : 'border border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Step Index & Flow Arrow */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Phase 0{item.step}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="hidden md:block w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${item.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-display">
                      {item.title}
                    </h3>
                  </div>

                  {/* Short description */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.shortDesc}
                  </p>
                </div>

                {/* Progress bar indicator */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className={`h-1 rounded-full transition-all duration-300 ${
                    isSelected ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full' : 'bg-white/10 w-8 group-hover:w-16'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel for Active Step */}
        <div className="max-w-4xl mx-auto rounded-2xl p-6 sm:p-8 glass-panel border border-white/10 bg-[#0b1224]/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase mb-1">
                <span>Phase 0{steps[activeStep].step} Technical Deep Dive</span>
              </div>
              <h4 className="text-xl font-bold text-white font-display">
                {steps[activeStep].title} Process Specifications
              </h4>
            </div>

            <button
              onClick={onStartAnalysis}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-lg shadow-md shadow-blue-500/20 whitespace-nowrap self-start md:self-auto cursor-pointer"
            >
              <span>Test with Real Imagery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps[activeStep].technicalSpecs.map((spec, sIdx) => (
              <div key={sIdx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <span className="text-[11px] font-mono text-slate-400 mb-2">0{sIdx + 1} Specification</span>
                <p className="text-sm text-slate-200 font-medium leading-snug">
                  {spec}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Global CTA Banner */}
        <div className="mt-16 text-center">
          <button
            onClick={onStartAnalysis}
            className="inline-flex items-center gap-3 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/25 cursor-pointer"
          >
            <span>Launch SatQuery Analysis Studio</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};
