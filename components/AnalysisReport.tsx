import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalysisReportData } from '../types';
import ReportCard from './ReportCard';
import { Linkify } from './Linkify';
import { BookOpen, Target, BrainCircuit, Shield, Star, ExternalLink, FileDown, Clipboard, Check } from 'lucide-react';

interface AnalysisReportProps {
  data: AnalysisReportData;
  lichessUser: string;
  modelName: string;
  gameDateRange: string;
  analysisDate: Date;
}

const TrainingLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark font-semibold transition-colors"
    >
        {children} <ExternalLink size={14} />
    </a>
)

const AnalysisReport: React.FC<AnalysisReportProps> = ({ data, lichessUser, modelName, gameDateRange, analysisDate }) => {
  const { t } = useTranslation();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [didCopyToClipboard, setDidCopyToClipboard] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const safeData = {
    ...data,
    openingAnalysis: data.openingAnalysis || { asWhite: '', asBlack: '' },
    tacticalMotifs: data.tacticalMotifs || [],
    strategicWeaknesses: data.strategicWeaknesses || [],
    endgamePractice: data.endgamePractice || [],
    summary: data.summary || '',
  };

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('exportable-area');
    if (!reportElement) return;

    setIsDownloadingPdf(true);
    try {
      // Dynamically import PDF generation libraries
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#262421', // Match the primary background color
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ChessTrax_Analysis_${lichessUser}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    const generatePlainTextReport = (): string => {
        let text = `${t('clipboardReportTitle')}\n`;
        text += `======================================\n\n`;
        text += `${t('clipboardLichessUser', { user: lichessUser })}\n\n`;
        text += `${t('clipboardAnalysisDate', { date: analysisDate.toLocaleDateString() })}\n`;
        text += `${t('clipboardGamePeriod', { range: gameDateRange })}\n`;
        text += `${t('clipboardPoweredBy', { model: modelName })}\n\n`;

        text += `${t('clipboardPrimaryFocus')}\n${safeData.summary}\n\n`;

        text += `${t('clipboardOpeningAnalysis')}\n`;
        text += `${t('clipboardAsWhite')}\n${safeData.openingAnalysis.asWhite}\n\n`;
        text += `${t('clipboardAsBlack')}\n${safeData.openingAnalysis.asBlack}\n\n`;

        text += `${t('clipboardTacticalBlindSpots')}\n`;
        safeData.tacticalMotifs.forEach(item => {
            text += `* ${item.motif}:\n${item.explanation}\n\n`;
        });

        text += `${t('clipboardStrategicWeaknesses')}\n`;
        safeData.strategicWeaknesses.forEach(item => {
            text += `* ${item.weakness}:\n${item.explanation}\n\n`;
        });
        
        text += `${t('clipboardEndgameTraining')}\n`;
        safeData.endgamePractice.forEach(item => {
            text += `* ${item.endgameType}:\n${item.explanation}\n\n`;
        });

        return text;
    };
    const reportText = generatePlainTextReport();
    navigator.clipboard.writeText(reportText);
    setDidCopyToClipboard(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setDidCopyToClipboard(false), 2500);
  };


  return (
    <>
    <div id="exportable-area" className="bg-gray-primary p-6 md:p-8">
        <div className="mb-8 border-b border-gray-tertiary pb-6">
            <h2 className="text-3xl font-bold text-text-primary mb-3">{t('yourPersonalizedAnalysis')}</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-text-secondary">
                <p><strong className="text-text-primary">{t('lichessUserLabel')}</strong> {lichessUser}</p>
                <p><strong className="text-text-primary">{t('analysisDateLabel')}</strong> {analysisDate.toLocaleDateString()}</p>
                <p><strong className="text-text-primary">{t('gamePeriodLabel')}</strong> {gameDateRange}</p>
                <p><strong className="text-text-primary">{t('aiModelLabel')}</strong> {modelName}</p>
            </div>
        </div>

        <div className="space-y-8">
            <ReportCard icon={Star} title={t('primaryFocus')}> 
                <p className="text-text-secondary"><Linkify text={safeData.summary} /></p>
            </ReportCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ReportCard icon={BookOpen} title={t('openingAnalysis')}>
                <div className='space-y-4'>
                    <div>
                        <h4 className="font-bold text-text-primary mb-1">{t('asWhite')}</h4>
                        <p className="text-text-secondary"><Linkify text={safeData.openingAnalysis.asWhite} /></p>
                    </div>
                     <div>
                        <h4 className="font-bold text-text-primary mb-1">{t('asBlack')}</h4>
                        <p className="text-text-secondary"><Linkify text={safeData.openingAnalysis.asBlack} /></p>
                    </div>
                    <TrainingLink href="https://lichess.org/opening">{t('exploreOpenings')}</TrainingLink>
                </div>
            </ReportCard>
            
            <ReportCard icon={Target} title={t('tacticalBlindSpots')}>
              <ul className="space-y-4">
                {safeData.tacticalMotifs.map((motif) => (
                  <li key={motif.motif}>
                    <h4 className="font-bold text-text-primary">{motif.motif}</h4>
                    <p className="text-text-secondary mb-2"><Linkify text={motif.explanation} /></p>
                    <TrainingLink href={`https://lichess.org/training/themes`}>{t('practiceTactics')}</TrainingLink>
                  </li>
                ))}
              </ul>
            </ReportCard>
            
            <ReportCard icon={BrainCircuit} title={t('strategicWeaknesses')}>
              <ul className="space-y-4">
                {safeData.strategicWeaknesses.map((weakness) => (
                  <li key={weakness.weakness}>
                    <h4 className="font-bold text-text-primary">{weakness.weakness}</h4>
                    <p className="text-text-secondary"><Linkify text={weakness.explanation} /></p>
                  </li>
                ))}
              </ul>
            </ReportCard>

            <ReportCard icon={Shield} title={t('endgameTraining')}>
              <ul className="space-y-4">
                {safeData.endgamePractice.map((endgame) => (
                  <li key={endgame.endgameType}>
                    <h4 className="font-bold text-text-primary">{endgame.endgameType}</h4>
                    <p className="text-text-secondary mb-2"><Linkify text={endgame.explanation} /></p>
                     <TrainingLink href="https://lichess.org/practice">{t('trainEndgames')}</TrainingLink>
                  </li>
                ))}
              </ul>
            </ReportCard>
          </div>
        </div>
    </div>
    
    <div className="mt-8 p-6 bg-gray-secondary rounded-2xl border border-gray-tertiary flex flex-col sm:flex-row items-center justify-center gap-4">
        <h3 className="font-bold text-lg text-text-primary">{t('exportYourPlan')}</h3>
        <div className="flex items-stretch gap-3">
             <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex items-center justify-center gap-2 bg-accent/90 hover:bg-accent text-gray-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-tertiary disabled:text-text-secondary disabled:cursor-not-allowed"
            >
                <FileDown size={18} />
                {isDownloadingPdf ? t('creatingPdf') : t('downloadPdf')}
            </button>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center justify-center gap-2 bg-gray-tertiary hover:bg-gray-primary text-text-primary font-bold py-2 px-4 rounded-lg transition-all duration-200"
                >
                    {didCopyToClipboard ? <><Check size={18} className="text-green-400" /> {t('copied')}</> : <><Clipboard size={18} /> {t('copyForDocs')}</>}
                </button>
                 <a href="https://docs.new" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    {t('openGoogleDocs')}
                </a>
            </div>
        </div>
    </div>
    </>
  );
};

export default AnalysisReport;
