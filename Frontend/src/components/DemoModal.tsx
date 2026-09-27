import React, { useState } from 'react';
import { X, Play, Crosshair, Layers, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import sarImg from '../assets/images/sar_radar_coastal_1790235625239.jpg';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateAnalyze: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onNavigateAnalyze }) => {
  const [activeLayer, setActiveLayer] = useState<'rgb' | 'sar' | 'grounding'>('grounding');
  const [selectedDetection, setSelectedDetection] = useState<number | null>(0);

  if (!isOpen) return null;

  const mockDetections = [
    {
      id: 1,
      vesselType: 'Ultra-Large Container Vessel (ULCV)',
      coords: '51°56\'22"N, 4°19\'04"E',
      estimatedLength: '366 meters',
      backscatter: '-4.2 dB Sigma-0',
      box: { top: '35%', left: '42%', width: '18%', height: '12%' }
    },
    {
      id: 2,
      vesselType: 'Chemical Tanker (Handymax)',
      coords: '51°55\'41"N, 4°16\'48"E',
      estimatedLength: '182 meters',
      backscatter: '-6.8 dB Sigma-0',
      box: { top: '58%', left: '26%', width: '12%', height: '10%' }
    },
    {
      id: 3,
      vesselType: 'Tug & Escort Vessel',
      coords: '51°57\'09"N, 4°22\'15"E',
      estimatedLength: '32 meters',
      backscatter: '-11.4 dB Sigma-0',
      box: { top: '22%', left: '68%', width: '8%', height: '8%' }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-2xl glass-panel border border-white/20 bg-[#080d1a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0c1427]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>Interactive Interactive Demonstration</span>
                <span className="text-slate-600">·</span>
                <span>Radar Image Sample</span>
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                Maritime Vessel Grounding & Length Estimation
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 flex-1 overflow-y-auto">
          
          {/* Main Visual Viewport */}
          <div className="lg:col-span-2 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Query Badge */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 mb-4 flex items-start gap-3">
              <span className="text-xs font-mono uppercase text-indigo-400 font-bold whitespace-nowrap mt-0.5">
                Input Query:
              </span>
              <p className="text-sm text-slate-200 font-medium">
                &ldquo;Detect all commercial shipping vessels in the outer anchorage, extract spatial coordinates and estimate vessel length.&rdquo;
              </p>
            </div>

            {/* Satellite Canvas Screen */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-slate-950">
              <img
                src={sarImg}
                alt="Radar image sample"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Image Analysis Overlay */}
              {activeLayer === 'grounding' && (
                <>
                  {mockDetections.map((det, idx) => {
                    const isSelected = selectedDetection === idx;
                    return (
                      <div
                        key={det.id}
                        onClick={() => setSelectedDetection(idx)}
                        style={{
                          top: det.box.top,
                          left: det.box.left,
                          width: det.box.width,
                          height: det.box.height,
                        }}
                        className={`absolute border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                            : 'border-yellow-400/80 bg-yellow-400/10 hover:border-cyan-400'
                        }`}
                      >
                        <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300 whitespace-nowrap border border-white/10">
                          #{det.id} {det.estimatedLength}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Viewport HUD Overlays */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>ROTTERDAM PORT APPR · 5m RESOLUTION</span>
              </div>

              {/* Layer Controls */}
              <div className="absolute top-3 right-3 flex items-center gap-1 p-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs">
                <button
                  onClick={() => setActiveLayer('grounding')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activeLayer === 'grounding' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Grounding Box
                </button>
                <button
                  onClick={() => setActiveLayer('sar')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activeLayer === 'sar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Analysis Sample
                </button>
              </div>
            </div>

            {/* Micro telemetry footer */}
            <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Coordinates: Not provided</span>
              <span>Polarization: VV + VH Cross-Pol</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Model Inferred
              </span>
            </div>
          </div>

          {/* Detections / Inspector Sidebar */}
          <div className="p-6 bg-[#091022] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                  Target Detections (3)
                </h4>
                <span className="text-xs font-mono text-cyan-400">98.4% Confidence</span>
              </div>

              <div className="space-y-3">
                {mockDetections.map((det, idx) => {
                  const isSelected = selectedDetection === idx;
                  return (
                    <div
                      key={det.id}
                      onClick={() => setSelectedDetection(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400/80 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-cyan-400 font-bold">
                          TARGET #0{det.id}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {det.estimatedLength}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-white">
                        {det.vesselType}
                      </p>
                      <div className="mt-2 text-[11px] font-mono text-slate-400">
                        Coords: {det.coords}
                      </div>
                      <div className="mt-0.5 text-[11px] font-mono text-slate-400">
                        Radar Sigma: {det.backscatter}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Console CTA */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  onClose();
                  onNavigateAnalyze();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <span>Open in Live Analysis Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
