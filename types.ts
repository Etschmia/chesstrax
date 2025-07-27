
export interface OpeningAnalysis {
  asWhite: string;
  asBlack: string;
}

export interface TacticalMotif {
  motif: string;
  explanation: string;
}

export interface StrategicWeakness {
  weakness: string;
  explanation: string;
}

export interface EndgamePractice {
  endgameType: string;
  explanation: string;
}

export interface AnalysisReportData {
  openingAnalysis: OpeningAnalysis;
  tacticalMotifs: TacticalMotif[];
  strategicWeaknesses: StrategicWeakness[];
  endgamePractice: EndgamePractice[];
  summary: string;
}
