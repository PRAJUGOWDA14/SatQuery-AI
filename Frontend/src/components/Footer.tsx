import React from 'react';
import { NavTab } from '../types';
import { Satellite } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/10 bg-[#04060d] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white">
              <Satellite className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-white font-display">
              SatQuery <span className="text-cyan-400">AI</span>
            </span>
            <span className="text-slate-600 text-xs ml-2">·</span>
            <span className="text-xs text-slate-400">Remote Sensing Image Analysis Prototype</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs">
            <button
              onClick={() => onNavigate('home')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('analyze')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Analyze
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              History
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-400 font-mono">
            &copy; {new Date().getFullYear()} SatQuery AI. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
};
