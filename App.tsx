import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalysisReportData } from './types';
import { analyzeGames, model as geminiModel } from './services/geminiService';
import { fetchPgnFromLichess } from './services/lichessService';
import { usePgnParser, detectUserFromPgn, findUserGames } from './hooks/usePgnParser';
import FileUpload from './components/FileUpload';
import AnalysisReport from './components/AnalysisReport';
import Spinner from './components/Spinner';
import { LayoutGrid, BrainCircuit, Target, Shield, BookOpen, AlertTriangle, Upload, Download } from 'lucide-react';

type DataSource = 'upload' | 'lichess';

interface Report {
  data: AnalysisReportData;
  lichessUser: string;
  gameDateRange: string;
  analysisDate: Date;
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [pgnContent, setPgnContent] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [isFetchingPgn, setIsFetchingPgn] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('lichess');
  const [lichessUsername, setLichessUsername] = useState('');

  // This hook is now primarily for the UI display before analysis is triggered.
  const { lostGamesPgn, gameDates, detectedUser } = usePgnParser(pgnContent);

  const getGameDateRange = (dates: string[]): string => {
    if (dates.length === 0) return 'N/A';
    const validDates = dates.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
    if (validDates.length === 0) return 'N/A';

    validDates.sort((a, b) => a.getTime() - b.getTime());
    const first = validDates[0].toLocaleDateString();
    const last = validDates[validDates.length - 1].toLocaleDateString();
    return first === last ? first : `${first} to ${last}`;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPgnContent(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPgnContent(text);
      setReport(null);
      setError(null);
    };
    reader.onerror = () => {
      setError(t('error.fileRead'));
    };
    reader.readAsText(file);
  };

  const performAnalysis = useCallback(async (pgn: string, user: string) => {
    const { lostGamesPgn, gameDates: parsedGameDates } = findUserGames(pgn, user);
    
    if (lostGamesPgn.length === 0) {
      setError(t('error.noLostGames'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setReport(null);

    try {
      const gamesToAnalyze = lostGamesPgn.slice(-50).join('\n\n');
      
      const currentLang = i18n.language;
      let apiLang: 'en' | 'de' | 'hy' = 'en';
      if (currentLang.startsWith('de')) {
        apiLang = 'de';
      } else if (currentLang.startsWith('hy')) {
        apiLang = 'hy';
      }
      
      const result = await analyzeGames(gamesToAnalyze, user, apiLang);
      setReport({
        data: result,
        lichessUser: user,
        gameDateRange: getGameDateRange(parsedGameDates),
        analysisDate: new Date()
      });
    } catch (e) {
      console.error(e);
      setError(t('error.analysis', { error: e instanceof Error ? e.message : 'Unknown error' }));
    } finally {
      setIsAnalyzing(false);
    }
  }, [i18n.language, t]);

  const handleAnalyzeClick = useCallback(async () => {
    setError(null);
    setReport(null);
    
    if (dataSource === 'lichess') {
      if (!lichessUsername.trim()) {
        setError(t('error.noUser'));
        return;
      }
      const user = lichessUsername.trim();
      setIsFetchingPgn(true);
      try {
        const pgn = await fetchPgnFromLichess(user);
        setPgnContent(pgn);
        await performAnalysis(pgn, user);
      } catch (e) {
        if (e instanceof Error && e.message.includes('404')) {
          setError(t('error.userNotFound', { user }));
        } else {
          setError(t('error.lichessFetch', { error: e instanceof Error ? e.message : 'Unknown error' }));
        }
      } finally {
        setIsFetchingPgn(false);
      }
    } else { // 'upload'
       if (!pgnContent) {
            setError(t('error.noPgnFile'));
            return;
       }
       const user = detectUserFromPgn(pgnContent);
       if (!user) {
           setError(t('error.userDetectFailed'));
           return;
       }
       await performAnalysis(pgnContent, user);
    }
  }, [dataSource, lichessUsername, pgnContent, performAnalysis, t]);
  
  const changeLanguage = (lng: 'en' | 'de' | 'hy') => {
    i18n.changeLanguage(lng);
  };
  
  const isLoading = isFetchingPgn || isAnalyzing;
  let loadingText = t('analyze');
  if (isFetchingPgn) loadingText = t('fetchingGames');
  if (isAnalyzing) loadingText = t('analyzing');
  
  const isAnalyzeButtonDisabled = isLoading || (dataSource === 'lichess' && !lichessUsername.trim()) || (dataSource === 'upload' && !pgnContent);

  return (
    <div className="min-h-screen bg-gray-primary font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-2">
            <LayoutGrid className="h-10 w-10 text-accent" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">{t('appTitle')}</h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10 md:mb-16">
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto text-center md:text-left">
              {t('appDescription')}
            </p>
            <div className="flex gap-4 rounded-lg bg-gray-tertiary p-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors ${i18n.language.startsWith('en') ? 'bg-accent text-gray-primary' : 'text-text-secondary hover:bg-gray-primary/80'}`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('de')}
                className={`w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors ${i18n.language.startsWith('de') ? 'bg-accent text-gray-primary' : 'text-text-secondary hover:bg-gray-primary/80'}`}
              >
                Deutsch
              </button>
              <button
                onClick={() => changeLanguage('hy')}
                className={`w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors ${i18n.language.startsWith('hy') ? 'bg-accent text-gray-primary' : 'text-text-secondary hover:bg-gray-primary/80'}`}
              >
                Հայերեն
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto bg-gray-secondary p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-tertiary">
          <div className="mb-6">
              <div className="flex bg-gray-tertiary rounded-lg p-1 mb-4">
                  <button onClick={() => setDataSource('lichess')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-colors ${dataSource === 'lichess' ? 'bg-accent text-gray-primary' : 'text-text-secondary hover:bg-gray-primary/80'}`}>
                      <Download size={16}/> {t('fetchFromLichess')}
                  </button>
                  <button onClick={() => setDataSource('upload')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-colors ${dataSource === 'upload' ? 'bg-accent text-gray-primary' : 'text-text-secondary hover:bg-gray-primary/80'}`}>
                      <Upload size={16}/> {t('uploadPgn')}
                  </button>
              </div>

              {dataSource === 'lichess' && (
                  <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="lichess-user">{t('lichessUsername')}</label>
                      <input
                          id="lichess-user"
                          type="text"
                          value={lichessUsername}
                          onChange={(e) => setLichessUsername(e.target.value)}
                          placeholder={t('lichessUsernamePlaceholder')}
                          className="w-full bg-gray-tertiary border-2 border-gray-tertiary focus:border-accent focus:outline-none focus:ring-0 rounded-lg px-4 py-2 text-text-primary"
                      />
                      <p className="text-xs text-text-secondary text-center mt-2">{t('fetchingGamesDescription')}</p>
                  </div>
              )}

              {dataSource === 'upload' && (
                  <div>
                      <FileUpload onFileSelect={handleFileSelect} />
                      <p className="text-xs text-text-secondary text-center mt-2">{t('autoUserDetection')}</p>
                  </div>
              )}
          </div>
          
          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzeButtonDisabled}
            className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent-dark text-gray-primary font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-tertiary disabled:text-text-secondary disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner />
                {loadingText}
              </>
            ) : (
              <>
                <BrainCircuit className="h-5 w-5" />
                {t('analyze')}
              </>
            )}
          </button>

          {detectedUser && lostGamesPgn.length > 0 && <p className="text-center text-sm text-text-secondary mt-4">{t('foundGames', { count: lostGamesPgn.length, total: gameDates.length, user: detectedUser })}</p>}
          {detectedUser && lostGamesPgn.length === 0 && pgnContent && <p className="text-center text-sm text-yellow-400 mt-4">{t('error.noLostGamesUser', {user: detectedUser})}</p>}
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <h3 className="font-bold">{t('analysisFailed')}</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {report && (
          <div className="mt-12">
            <AnalysisReport
              data={report.data}
              lichessUser={report.lichessUser}
              gameDateRange={report.gameDateRange}
              analysisDate={report.analysisDate}
              modelName={geminiModel}
            />
          </div>
        )}

        {!isLoading && !report && !error && (
          <div className="text-center mt-16 text-text-secondary max-w-2xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6 text-accent">
              <div className="flex flex-col items-center gap-2"><BookOpen size={32} /><span>{t('openings')}</span></div>
              <div className="flex flex-col items-center gap-2"><Target size={32} /><span>{t('tactics')}</span></div>
              <div className="flex flex-col items-center gap-2"><BrainCircuit size={32} /><span>{t('strategy')}</span></div>
              <div className="flex flex-col items-center gap-2"><Shield size={32} /><span>{t('endgames')}</span></div>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-4 text-text-secondary text-sm">
        <p>Project homepage: <a href="https://github.com/Etschmia/chesstrax-ai-coach" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">github.com/Etschmia/chesstrax-ai-coach</a></p>
      </footer>
    </div>
  );
};

export default App;