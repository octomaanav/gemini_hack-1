import { useState, useCallback } from 'react';
import { apiUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import type { ChapterInfo } from '../types';
import { storeFile } from '../utils/fileStorage';

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(apiUrl('/api/parse/chapters'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse PDF');
      }

      const data = await response.json();
      const chapters: ChapterInfo[] = data.chapters;

      // Store file in IndexedDB (handles large files)
      await storeFile('uploadedPDF', file);
      
      // Store metadata in sessionStorage (small data)
      sessionStorage.setItem('uploadedFileName', file.name);
      sessionStorage.setItem('parsedChapters', JSON.stringify(chapters));
      
      // Navigate to review page
      navigate('/parse/review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-secondary-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-primary-100/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-base font-bold">A</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent">
              Textbook Parser
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-surface-900 mb-3">
            Upload Your Textbook
          </h2>
          <p className="text-surface-600 text-lg">
            Upload a PDF textbook to extract chapters, sections, and learning goals
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
            ${isDragging 
              ? 'border-primary-500 bg-primary-50 scale-[1.02]' 
              : file 
                ? 'border-accent-400 bg-accent-50' 
                : 'border-surface-300 bg-white hover:border-primary-400 hover:bg-primary-50/50'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-surface-900">{file.name}</p>
                <p className="text-sm text-surface-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-sm text-surface-500 hover:text-surface-700 underline"
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-surface-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-surface-700">
                  Drop your PDF here or click to browse
                </p>
                <p className="text-sm text-surface-500 mt-1">
                  Supports PDF files up to 100MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`
              px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200
              flex items-center gap-3
              ${file && !isUploading
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                : 'bg-surface-200 text-surface-400 cursor-not-allowed'
              }
            `}
          >
            {isUploading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Extracting Chapters...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Extract Chapters
              </>
            )}
          </button>
        </div>

        {/* Info Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-surface-200">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">1</span>
            </div>
            <h3 className="font-semibold text-surface-900 mb-2">Upload PDF</h3>
            <p className="text-sm text-surface-600">
              Upload your textbook PDF and we'll extract the table of contents
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-surface-200">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">2</span>
            </div>
            <h3 className="font-semibold text-surface-900 mb-2">Review & Edit</h3>
            <p className="text-sm text-surface-600">
              Review extracted chapters and sections, make corrections if needed
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-surface-200">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">3</span>
            </div>
            <h3 className="font-semibold text-surface-900 mb-2">Parse Content</h3>
            <p className="text-sm text-surface-600">
              Generate learning goals and structured content for each section
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UploadPage;
