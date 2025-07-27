
import React from 'react';
import type { LucideProps } from 'lucide-react';

interface ReportCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  children: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ icon: Icon, title, children }) => {
  return (
    <div className="bg-gray-secondary rounded-2xl p-6 border border-gray-tertiary shadow-lg h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-tertiary p-2 rounded-lg">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <h3 className="text-xl font-bold text-text-primary">{title}</h3>
      </div>
      <div className="prose prose-invert prose-p:text-text-secondary prose-li:text-text-secondary max-w-none">
        {children}
      </div>
    </div>
  );
};

export default ReportCard;
