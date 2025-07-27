import React, { useState, useCallback } from 'react';
import type { AnalysisReportData } from './types';
import { analyzeGames } from './services/geminiService';
import { usePgnParser } from './hooks/usePgnParser';
import FileUpload from './components/FileUpload';
import AnalysisReport from './components/AnalysisReport';
import Spinner from './components/Spinner';
import { LayoutGrid, BrainCircuit, Target, Shield, BookOpen, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [lichessUser, setLichessUser] = useState<string>('');
  const [pgnContent, setPgnContent] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [analysisResult, setAnalysisResult] = useState<AnalysisReportData | null>(null);
  const [analysisDate, setAnalysisDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { lostGamesPgn, gameDates } = usePgnParser(pgnContent, lichessUser);
  
  const getGameDateRange = (dates: string[]): string => {
    if (dates.length === 0) return 'N/A';
    // Filter out invalid date strings before processing
    const validDates = dates.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
    if (validDates.length === 0) return 'N/A';

    validDates.sort((a, b) => a.getTime() - b.getTime());
    const first = validDates[0].toLocaleDateString();
    const last = validDates[validDates.length - 1].toLocaleDateString();
    return first === last ? first : `${first} to ${last}`;
  };

  const gameDateRange = getGameDateRange(gameDates);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPgnContent(text);
      setAnalysisResult(null); 
      setError(null);
    };
    reader.onerror = () => {
        setError('Failed to read the PGN file.');
    };
    reader.readAsText(file);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!lichessUser || lostGamesPgn.length === 0) {
      setError('Please provide a Lichess username and a PGN file with games you have lost.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisDate(null);

    try {
      // To keep the request size reasonable, let's analyze up to 50 of the most recent losses.
      const gamesToAnalyze = lostGamesPgn.slice(-50).join('\n\n');
      const result = await analyzeGames(gamesToAnalyze, lichessUser, language);
      setAnalysisResult(result);
      setAnalysisDate(new Date());
    } catch (e) {
      console.error(e);
      setError(`An error occurred during analysis. Please ensure your API key is configured correctly and the PGN is valid. Details: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [lichessUser, lostGamesPgn, language]);

  return (
    <div className="min-h-screen bg-gray-primary font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-2">
            <LayoutGrid className="h-10 w-10 text-accent" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">ChessTrax AI Coach</h1>
          </div>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
            Upload your Lichess PGN. Get a personalized training plan powered by Gemini.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-gray-secondary p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-tertiary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="lichessUser" className="block text-sm font-medium text-text-secondary mb-2">Lichess Username</label>
              <input
                type="text"
                id="lichessUser"
                value={lichessUser}
                onChange={(e) => setLichessUser(e.target.value)}
                placeholder="e.g., DrNykterstein"
                className="w-full bg-gray-tertiary text-text-primary placeholder-text-secondary rounded-lg px-4 py-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Language</label>
            <div className="flex rounded-lg bg-gray-tertiary p-1">
                <button
                    onClick={() => setLanguage('en')}
                    className={`w-full rounded-md py-2 text-sm font-semibold transition-colors ${language === 'en' ? 'bg-accent text-gray-primary' : 'text-text-secondary hover:bg-gray-primary/80'}`}
                >
                    English
                </button>
                <button
                    onClick={() => setLanguage('de')}
                    className={`w-full rounded-md py-2 text-sm font-semibold transition-colors ${language === 'de' ? 'bg-accent text-gray-primary' : 'text-text-secondary hover:bg-gray-primary/80'}`}
                >
                    Deutsch
                </button>
            </div>
          </div>

          <button
            onClick={handleAnalyzeClick}
            disabled={isLoading || !lichessUser || !pgnContent}
            className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent-dark text-gray-primary font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-tertiary disabled:text-text-secondary disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner />
                Analyzing Your Games...
              </>
            ) : (
              <>
                <BrainCircuit className="h-5 w-5" />
                Create My Training Plan
              </>
            )}
          </button>
          
          {lostGamesPgn.length > 0 && <p className="text-center text-sm text-text-secondary mt-4">Found {lostGamesPgn.length} lost games for '{lichessUser}' to analyze from a total of {gameDates.length} games.</p>}

        </div>

        {error && (
            <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5"/>
              <div>
                <h3 className="font-bold">Analysis Failed</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
        )}

        {analysisResult && analysisDate && (
          <div className="mt-12">
            <AnalysisReport 
              data={analysisResult} 
              lichessUser={lichessUser}
              gameDateRange={gameDateRange}
              analysisDate={analysisDate}
            />
          </div>
        )}
        
        {!isLoading && !analysisResult && !error && (
            <div className="text-center mt-16 text-text-secondary max-w-2xl mx-auto">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6 text-accent">
                    <div className="flex flex-col items-center gap-2"><BookOpen size={32}/><span>Openings</span></div>
                    <div className="flex flex-col items-center gap-2"><Target size={32}/><span>Tactics</span></div>
                    <div className="flex flex-col items-center gap-2"><BrainCircuit size={32}/><span>Strategy</span></div>
                    <div className="flex flex-col items-center gap-2"><Shield size={32}/><span>Endgames</span></div>
                </div>
                <h2 className="text-2xl font-semibold text-text-primary mb-2">Ready to Uncover Your Weaknesses?</h2>
                <p>Provide your Lichess username and upload a PGN file containing your games. Our AI will analyze your losses to find patterns and create your path to improvement.</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;