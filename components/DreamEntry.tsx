import React from 'react';
import { DreamEntry as DreamEntryType } from '../types';
import { DreamChat } from './DreamChat';

interface DreamEntryProps {
  entry: DreamEntryType;
  onReset: () => void;
}

export const DreamEntry: React.FC<DreamEntryProps> = ({ entry, onReset }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 animate-fade-in">
      <header className="flex justify-between items-center py-6 border-b border-mystic-500/20 mb-8">
        <button 
          onClick={onReset}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          New Entry
        </button>
        <div className="text-sm text-gray-500 font-mono">
          {entry.date.toLocaleDateString()} • {entry.date.toLocaleTimeString()}
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Left Column: Image & Transcript */}
        <div className="space-y-8">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-mystic-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-night-800 rounded-xl overflow-hidden aspect-square shadow-2xl">
                    {entry.imageUrl ? (
                    <img 
                        src={entry.imageUrl} 
                        alt={entry.visualPrompt} 
                        className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-night-800">
                        Image Generation Failed
                    </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <span className="text-xs text-white/80 font-mono bg-black/40 px-2 py-1 rounded border border-white/10">{entry.imageSize}</span>
                    </div>
                </div>
            </div>

            <div className="bg-night-800 rounded-xl p-6 border border-mystic-500/10 shadow-lg">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Transcript</h3>
                <p className="text-gray-300 leading-relaxed italic font-serif">"{entry.transcript}"</p>
            </div>
        </div>

        {/* Right Column: Analysis */}
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-serif text-white mb-2 leading-tight">{entry.title}</h1>
                <div className="h-1 w-20 bg-mystic-500 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-br from-night-800 to-night-700 rounded-xl p-6 border border-mystic-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                </div>
                <h3 className="text-mystic-400 text-sm font-bold uppercase tracking-wider mb-4">Psychological Interpretation</h3>
                
                <div className="space-y-4">
                    <div>
                        <span className="text-xs text-gray-500 uppercase block mb-1">Core Theme</span>
                        <p className="text-white font-medium">{entry.analysis.theme}</p>
                    </div>
                    
                    <div>
                        <span className="text-xs text-gray-500 uppercase block mb-1">Identified Archetypes</span>
                        <div className="flex flex-wrap gap-2">
                            {entry.analysis.archetypes.map((arch, idx) => (
                                <span key={idx} className="px-2 py-1 bg-mystic-500/20 text-mystic-300 text-xs rounded-md border border-mystic-500/30">
                                    {arch}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                        <p className="text-gray-300 text-sm leading-relaxed">{entry.analysis.interpretation}</p>
                    </div>
                </div>
            </div>

            <div className="bg-night-800 rounded-xl border border-mystic-500/10 flex-grow flex flex-col h-[500px]">
                <div className="p-4 border-b border-white/5">
                     <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Deep Dive Chat
                     </h3>
                </div>
                <div className="flex-grow overflow-hidden">
                    <DreamChat dreamContext={entry} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
