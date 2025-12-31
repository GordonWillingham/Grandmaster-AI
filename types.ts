
export interface ChessOpening {
  name: string;
  category: 'Offense' | 'Defense' | 'Gambit';
  era: 'Classic' | 'Contemporary';
  moves: string;
  description: string;
  pros: string[];
  cons: string[];
}

export type MoveQuality = 'Brilliant' | 'Great' | 'Best' | 'Excellent' | 'Inaccuracy' | 'Mistake' | 'Blunder' | 'Miss';

export interface MoveInsight {
  moveNumber: number;
  move: string;
  quality: MoveQuality;
  explanation: string;
  evalBefore: string;
  evalAfter: string;
}

export interface AnalysisResponse {
  evaluation: string;
  bestMoves: {
    move: string;
    explanation: string;
  }[];
  strategicAdvice: string;
}

export interface MoveAssessmentResponse {
  quality: MoveQuality;
  explanation: string;
  evaluation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type SkillLevel = {
  label: string;
  elo: number;
  description: string;
};
