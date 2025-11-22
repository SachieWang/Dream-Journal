import React, { useEffect, useState } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [needsKey, setNeedsKey] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) {
        setNeedsKey(false);
        onKeySelected();
      } else {
        setNeedsKey(true);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to avoid race condition as per instructions
        setNeedsKey(false);
        onKeySelected();
      } catch (error) {
        console.error("Error selecting key:", error);
        // Retry logic could go here
      }
    } else {
        alert("AI Studio environment not detected. This feature requires the AI Studio wrapper.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-night-900 text-mystic-300">
        Loading environment...
      </div>
    );
  }

  if (!needsKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/95 backdrop-blur-sm p-4">
      <div className="bg-night-800 border border-mystic-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="mb-6 text-mystic-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m2 12 20-4"/></svg>
            <h2 className="text-2xl font-serif text-white mb-2">Unlock Your Dream Journal</h2>
            <p className="text-sm text-gray-400">
              To generate high-fidelity surrealist visions (4K) and analyze deep psychological patterns, Oneiric requires access to paid Gemini services.
            </p>
        </div>
        
        <button
          onClick={handleSelectKey}
          className="w-full py-3 px-4 bg-gradient-to-r from-mystic-500 to-purple-600 hover:from-mystic-400 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-900/50 transition-all transform hover:scale-[1.02]"
        >
          Connect Google Cloud Project
        </button>
        
        <div className="mt-6 text-xs text-gray-500">
            <p>By connecting, you agree to use your own API key from a paid GCP project.</p>
            <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="underline hover:text-mystic-300 transition-colors"
            >
                Learn more about billing
            </a>
        </div>
      </div>
    </div>
  );
};
