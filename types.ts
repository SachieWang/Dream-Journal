export enum ImageSize {
  Size1K = "1K",
  Size2K = "2K",
  Size4K = "4K",
}

export enum AppState {
  IDLE = "IDLE",
  RECORDING = "RECORDING",
  PROCESSING_AUDIO = "PROCESSING_AUDIO",
  GENERATING_IMAGE = "GENERATING_IMAGE",
  VIEWING = "VIEWING",
  ERROR = "ERROR",
}

export interface DreamAnalysis {
  title: string;
  transcript: string;
  visualPrompt: string;
  analysis: {
    theme: string;
    archetypes: string[];
    interpretation: string;
  };
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  isError?: boolean;
}

export interface DreamEntry extends DreamAnalysis {
  id: string;
  date: Date;
  imageUrl?: string;
  imageSize: ImageSize;
}
