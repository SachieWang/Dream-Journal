import React, { useState } from 'react';
import { ApiKeySelector } from './components/ApiKeySelector';
import { DreamRecorder } from './components/DreamRecorder';
import { DreamEntry } from './components/DreamEntry';
import { AppState, DreamEntry as DreamEntryType, ImageSize } from './types';
import { analyzeAudioDream, generateDreamImage } from './services/geminiService';
import { blobToBase64 } from './utils/audioUtils';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentEntry, setCurrentEntry] = useState<DreamEntryType | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleRecordingComplete = async (audioBlob: Blob, imageSize: ImageSize) => {
    setAppState(AppState.PROCESSING_AUDIO);
    setLoadingMessage("Transcribing and Analyzing Dream Archetypes...");

    try {
      const base64Audio = await blobToBase64(audioBlob);
      const mimeType = "audio/webm"; // MediaRecorder standard usually

      // Step 1: Audio -> Analysis & Prompt
      const analysisResult = await analyzeAudioDream(base64Audio, mimeType);
      
      setAppState(AppState.GENERATING_IMAGE);
      setLoadingMessage(`Manifesting Surrealist Vision (${imageSize})...`);

      // Step 2: Prompt -> Image
      let imageUrl = undefined;
      try {
        imageUrl = await generateDreamImage(analysisResult.visualPrompt, imageSize);
      } catch (imgError) {
        console.error("Image generation failed:", imgError);
        // Continue without image if it fails, so user still gets analysis
      }

      const newEntry: DreamEntryType = {
        id: Date.now().toString(),
        date: new Date(),
        ...analysisResult,
        imageUrl,
        imageSize,
      };

      setCurrentEntry(newEntry);
      setAppState(AppState.VIEWING);

    } catch (error) {
      console.error("Process failed:", error);
      setAppState(AppState.ERROR);
      alert("Failed to process dream. Please try again.");
      setAppState(AppState.IDLE);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentEntry(null);
  };

  return (
    <div className="min-h-screen bg-night-900 text-gray-200 font-sans selection:bg-mystic-500/30">
      <ApiKeySelector onKeySelected={() => setHasApiKey(true)} />
      
      {hasApiKey && (
        <main className="flex flex-col min-h-screen">
          {/* Header - Only show when not viewing entry for cleaner look, or always? Always is better for nav */}
          <nav className="p-6 flex justify-center">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-mystic-500/20 rounded-lg border border-mystic-500/40">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mystic-400"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M20 10c.5 1.1 0.8 2.4 0.8 3.8 0 3.4-2 6.2-4.5 6.2-1.7 0-3.2-1.2-4-3.1-.8 1.9-2.3 3.1-4 3.1-2.5 0-4.5-2.8-4.5-6.2 0-1.4.3-2.7.8-3.8C2.2 5.6 6 2 12 2s9.8 3.6 7.2 8Z"/></svg>
               </div>
               <h1 className="text-xl font-serif font-bold tracking-wide text-white">ONEIRIC</h1>
            </div>
          </nav>

          <div className="flex-grow flex flex-col">
            
            {/* State: IDLE / RECORDING */}
            {(appState === AppState.IDLE || appState === AppState.RECORDING) && (
               <div className="flex-grow flex flex-col items-center justify-center -mt-16 animate-fade-in">
                  <DreamRecorder onRecordingComplete={handleRecordingComplete} />
               </div>
            )}

            {/* State: LOADING */}
            {(appState === AppState.PROCESSING_AUDIO || appState === AppState.GENERATING_IMAGE) && (
              <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-mystic-500 blur-xl opacity-20 animate-pulse-slow"></div>
                  <div className="w-24 h-24 border-4 border-mystic-500/30 border-t-mystic-400 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-serif text-white mb-2 animate-pulse">{loadingMessage}</h3>
                <p className="text-gray-500">Consulting the collective unconscious...</p>
              </div>
            )}

            {/* State: VIEWING */}
            {appState === AppState.VIEWING && currentEntry && (
              <DreamEntry entry={currentEntry} onReset={handleReset} />
            )}

          </div>
        </main>
      )}
    </div>
  );
};

export default App;
