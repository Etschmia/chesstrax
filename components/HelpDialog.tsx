import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, ChevronRight, HelpCircle, Upload, User, BarChart3, AlertCircle, MessageCircleQuestion } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSection {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  contentKey: string;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>('gettingStarted');

  const helpSections: HelpSection[] = [
    {
      id: 'gettingStarted',
      icon: <HelpCircle size={20} className="text-accent" />,
      titleKey: 'help.gettingStarted.title',
      contentKey: 'help.gettingStarted.content'
    },
    {
      id: 'lichessIntegration',
      icon: <User size={20} className="text-accent" />,
      titleKey: 'help.lichessIntegration.title',
      contentKey: 'help.lichessIntegration.content'
    },
    {
      id: 'pgnUpload',
      icon: <Upload size={20} className="text-accent" />,
      titleKey: 'help.pgnUpload.title',
      contentKey: 'help.pgnUpload.content'
    },
    {
      id: 'analysisResults',
      icon: <BarChart3 size={20} className="text-accent" />,
      titleKey: 'help.analysisResults.title',
      contentKey: 'help.analysisResults.content'
    },
    {
      id: 'troubleshooting',
      icon: <AlertCircle size={20} className="text-accent" />,
      titleKey: 'help.troubleshooting.title',
      contentKey: 'help.troubleshooting.content'
    },
    {
      id: 'faq',
      icon: <MessageCircleQuestion size={20} className="text-accent" />,
      titleKey: 'help.faq.title',
      contentKey: 'help.faq.content'
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-secondary rounded-2xl shadow-2xl border border-gray-tertiary w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-tertiary">
          <div className="flex items-center gap-3">
            <HelpCircle size={24} className="text-accent" />
            <h2 className="text-2xl font-bold text-text-primary">{t('help.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2"
            aria-label="Close help dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-4">
            {helpSections.map((section) => (
              <div key={section.id} className="border border-gray-tertiary rounded-lg">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-tertiary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <h3 className="text-lg font-semibold text-text-primary">
                      {t(section.titleKey)}
                    </h3>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown size={20} className="text-text-secondary" />
                  ) : (
                    <ChevronRight size={20} className="text-text-secondary" />
                  )}
                </button>
                
                {expandedSection === section.id && (
                  <div className="px-4 pb-4">
                    <div className="pl-8 pr-4">
                      <div 
                        className="text-text-secondary leading-relaxed space-y-3"
                        dangerouslySetInnerHTML={{ 
                          __html: t(section.contentKey).replace(/\n/g, '<br/>') 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-tertiary p-6 bg-gray-tertiary/30">
          <div className="text-center text-sm text-text-secondary">
            <p>{t('help.footer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpDialog;