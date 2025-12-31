
import React from 'react';
import { OPENINGS } from '../constants';
import { ChessOpening } from '../types';
import { Book, Zap, Shield, History } from 'lucide-react';

interface OpeningLibraryProps {
  onSelect: (opening: ChessOpening) => void;
}

const OpeningLibrary: React.FC<OpeningLibraryProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Book className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold">Opening Theory</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {OPENINGS.map((opening) => (
          <button
            key={opening.name}
            onClick={() => onSelect(opening)}
            className="text-left bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 p-4 rounded-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-indigo-300 group-hover:text-indigo-200">{opening.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                opening.era === 'Classic' ? 'bg-amber-900/40 text-amber-300' : 'bg-cyan-900/40 text-cyan-300'
              }`}>
                {opening.era}
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 mb-3">{opening.description}</p>
            <div className="flex gap-2">
              <span className="text-[11px] bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono">
                {opening.moves}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OpeningLibrary;
