import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AnalysisReportData } from '../types';
import ReportCard from './ReportCard';
import { BookOpen, Target, BrainCircuit, Shield, Star, ExternalLink, FileDown, Clipboard, Check } from 'lucide-react';

interface AnalysisReportProps {
  data: AnalysisReportData;
  lichessUser: string;
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

const AnalysisReport: React.FC<AnalysisReportProps> = ({ data, lichessUser, gameDateRange, analysisDate }) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [didCopyToClipboard, setDidCopyToClipboard] = useState(false);

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('exportable-area');
    if (!reportElement) return;

    setIsDownloadingPdf(true);
    try {
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
        let text = `ChessTrax AI Coach - Analysis Report\n`;
        text += `======================================\n\n`;
        text += `Lichess Username: ${lichessUser}\n`;
        text += `Analysis Date: ${analysisDate.toLocaleDateString()}\n`;
        text += `Game Period Covered: ${gameDateRange}\n`;
        text += `Analysis powered by: ChessTrax AI Coach using Google Gemini 2.5 Flash. No engines were used.\n\n`;

        text += `--- PRIMARY FOCUS ---\n${data.summary}\n\n`;

        text += `--- OPENING ANALYSIS ---\n`;
        text += `As White:\n${data.openingAnalysis.asWhite}\n\n`;
        text += `As Black:\n${data.openingAnalysis.asBlack}\n\n`;

        text += `--- TACTICAL BLIND-SPOTS ---\n`;
        data.tacticalMotifs.forEach(item => {
            text += `* ${item.motif}:\n${item.explanation}\n\n`;
        });

        text += `--- STRATEGIC WEAKNESSES ---\n`;
        data.strategicWeaknesses.forEach(item => {
            text += `* ${item.weakness}:\n${item.explanation}\n\n`;
        });
        
        text += `--- ENDGAME TRAINING ---\n`;
        data.endgamePractice.forEach(item => {
            text += `* ${item.endgameType}:\n${item.explanation}\n\n`;
        });

        return text;
    };
    const reportText = generatePlainTextReport();
    navigator.clipboard.writeText(reportText);
    setDidCopyToClipboard(true);
    setTimeout(() => setDidCopyToClipboard(false), 2500);
  };


  return (
    <>
    <div id="exportable-area" className="bg-gray-primary p-6 md:p-8">
        <div className="mb-8 border-b border-gray-tertiary pb-6">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Your Personalized Analysis</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-text-secondary">
                <p><strong className="text-text-primary">Lichess User:</strong> {lichessUser}</p>
                <p><strong className="text-text-primary">Analysis Date:</strong> {analysisDate.toLocaleDateString()}</p>
                <p><strong className="text-text-primary">Game Period:</strong> {gameDateRange}</p>
                <p><strong className="text-text-primary">AI Model:</strong> Gemini 2.5 Flash</p>
            </div>
        </div>

        <div className="space-y-8">
            <ReportCard icon={Star} title="Primary Focus">
                <p className="text-text-secondary">{data.summary}</p>
            </ReportCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ReportCard icon={BookOpen} title="Opening Analysis">
                <div className='space-y-4'>
                    <div>
                        <h4 className="font-bold text-text-primary mb-1">As White</h4>
                        <p className="text-text-secondary">{data.openingAnalysis.asWhite}</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-text-primary mb-1">As Black</h4>
                        <p className="text-text-secondary">{data.openingAnalysis.asBlack}</p>
                    </div>
                    <TrainingLink href="https://lichess.org/opening">Explore openings on Lichess</TrainingLink>
                </div>
            </ReportCard>
            
            <ReportCard icon={Target} title="Tactical Blind-Spots">
              <ul className="space-y-4">
                {data.tacticalMotifs.map((motif, index) => (
                  <li key={index}>
                    <h4 className="font-bold text-text-primary">{motif.motif}</h4>
                    <p className="text-text-secondary mb-2">{motif.explanation}</p>
                    <TrainingLink href={`https://lichess.org/training/themes`}>Practice tactics by theme</TrainingLink>
                  </li>
                ))}
              </ul>
            </ReportCard>
            
            <ReportCard icon={BrainCircuit} title="Strategic Weaknesses">
              <ul className="space-y-4">
                {data.strategicWeaknesses.map((weakness, index) => (
                  <li key={index}>
                    <h4 className="font-bold text-text-primary">{weakness.weakness}</h4>
                    <p className="text-text-secondary">{weakness.explanation}</p>
                  </li>
                ))}
              </ul>
            </ReportCard>

            <ReportCard icon={Shield} title="Endgame Training">
              <ul className="space-y-4">
                {data.endgamePractice.map((endgame, index) => (
                  <li key={index}>
                    <h4 className="font-bold text-text-primary">{endgame.endgameType}</h4>
                    <p className="text-text-secondary mb-2">{endgame.explanation}</p>
                     <TrainingLink href="https://lichess.org/practice">Train endgames on Lichess</TrainingLink>
                  </li>
                ))}
              </ul>
            </ReportCard>
          </div>
        </div>
    </div>
    
    <div className="mt-8 p-6 bg-gray-secondary rounded-2xl border border-gray-tertiary flex flex-col sm:flex-row items-center justify-center gap-4">
        <h3 className="font-bold text-lg text-text-primary">Export Your Plan</h3>
        <div className="flex items-stretch gap-3">
             <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex items-center justify-center gap-2 bg-accent/90 hover:bg-accent text-gray-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-tertiary disabled:text-text-secondary disabled:cursor-not-allowed"
            >
                <FileDown size={18} />
                {isDownloadingPdf ? 'Creating PDF...' : 'Download PDF'}
            </button>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center justify-center gap-2 bg-gray-tertiary hover:bg-gray-primary text-text-primary font-bold py-2 px-4 rounded-lg transition-all duration-200"
                >
                    {didCopyToClipboard ? <><Check size={18} className="text-green-400" /> Copied!</> : <><Clipboard size={18} /> Copy for Docs</>}
                </button>
                 <a href="https://docs.new" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Open Google Docs
                </a>
            </div>
        </div>
    </div>
    </>
  );
};

export default AnalysisReport;