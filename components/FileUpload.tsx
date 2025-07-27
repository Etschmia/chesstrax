
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    // You might want to notify parent that file is removed
    // onFileSelect(null);
  }

  return (
    <div>
       <label className="block text-sm font-medium text-text-secondary mb-2">{t('fileUpload')}</label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pgn"
      />
      <div
        onClick={handleButtonClick}
        className="w-full h-full min-h-[50px] bg-gray-tertiary border-2 border-dashed border-gray-tertiary hover:border-accent rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors duration-200"
      >
        {fileName ? (
          <div className="flex items-center gap-3 text-text-primary">
            <FileText className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium truncate">{fileName}</span>
            <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-gray-primary">
                <X size={16}/>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-text-secondary">
            <UploadCloud className="h-5 w-5" />
            <span className="text-sm font-medium">{t('clickToUpload')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
