'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import debounce from 'lodash/debounce';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<{
    student: string;
    teacher: string;
  } | null>(null);

  // Keep track of the current conversion request
  const currentRequestRef = useRef<AbortController | null>(null);

  // Cleanup function for ongoing requests
  const cleanupCurrentRequest = () => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupCurrentRequest();
  }, []);

  // Optimized convert function
  const convert = async (file: File, instructions: string) => {
    // Clean up any ongoing request
    cleanupCurrentRequest();

    // Create new abort controller for this request
    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    setIsConverting(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('instructions', instructions);

      const response = await fetch('/api/test-convert', {
        method: 'POST',
        body: formData,
        signal: abortController.signal
      });

      const data = await response.json();

      // Check if the response contains an error message
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Conversion failed');
      }
      
      // Check if we got valid student and teacher versions
      if (!data.student || !data.teacher || 
          data.student.includes('Error:') || 
          data.teacher.includes('Error:')) {
        throw new Error('Failed to generate content. Please try again.');
      }

      // Only update state if this is still the current request
      if (currentRequestRef.current === abortController) {
        setResults(data);
      }
    } catch (err) {
      console.error('Conversion error:', err);
      // Only update error if this is still the current request
      if (currentRequestRef.current === abortController) {
        setError(err instanceof Error ? err.message : 'Failed to convert file. Please try again.');
        setResults(null);
      }
    } finally {
      // Only update converting state if this is still the current request
      if (currentRequestRef.current === abortController) {
        setIsConverting(false);
        currentRequestRef.current = null;
      }
    }
  };

  // Debounced version of convert
  const debouncedConvert = useCallback(
    debounce((file: File, instructions: string) => convert(file, instructions), 1000),
    []
  );

  const handleConvert = async (customInstructions?: string) => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    // Cancel any pending debounced calls
    debouncedConvert.cancel();
    
    // Start new conversion
    debouncedConvert(file, customInstructions || instructions);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      // Cancel any ongoing conversion when a new file is dropped
      cleanupCurrentRequest();
      debouncedConvert.cancel();
      setIsConverting(false);
      setFile(acceptedFiles[0]);
      setError('');
      setResults(null);
    }
  });

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isConverting && file) {
      e.preventDefault();
      handleConvert();
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-6xl font-bold">rotten.</h1>
          <p className="text-xl">turn your educational material into brainrot</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg border border-red-500">
            {error}
          </div>
        )}

        {/* Upload Container */}
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-white rounded-[32px] p-12
            transition-all duration-200 cursor-pointer
            hover:border-gray-300 hover:bg-gray-900/30
            ${isDragActive ? 'border-gray-400 bg-gray-900/50 scale-[1.02]' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center space-y-6">
            <p className="text-xl">
              {file 
                ? `Selected: ${file.name}`
                : 'drag and drop your PDF, DOCX, or PPTX file here.'
              }
            </p>
            <div className="flex justify-center gap-4">
              <button 
                className="bg-white text-black px-6 py-2 rounded-full font-medium
                  transition-all duration-200
                  hover:bg-transparent hover:text-white hover:border-2 hover:border-white"
              >
                upload file
              </button>
              {file && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvert('');
                  }}
                  disabled={isConverting}
                  className="bg-white text-black px-6 py-2 rounded-full font-medium
                    transition-all duration-200
                    hover:bg-transparent hover:text-white hover:border-2 hover:border-white
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:border-0"
                >
                  {isConverting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                      <span>converting...</span>
                    </div>
                  ) : (
                    'quick convert'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="customize your output here..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent border-2 border-white rounded-full py-6 px-8 pr-16 text-xl
              transition-all duration-200
              focus:border-gray-300 focus:outline-none focus:bg-gray-900/30
              hover:border-gray-300"
          />
          <button
            onClick={() => handleConvert()}
            disabled={isConverting || !file}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2
              transition-all duration-200
              hover:scale-110 hover:opacity-80
              active:scale-95
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isConverting ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            ) : (
              <svg 
                className="w-8 h-8 fill-current" 
                viewBox="0 0 24 24"
              >
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-8">
            <div className="border-2 border-white rounded-[32px] p-8
              transition-all duration-200
              hover:border-gray-300 hover:bg-gray-900/30">
              <div className="space-y-12">
                {/* Student Version */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">student version</h2>
                    <button className="bg-white text-black px-6 py-2 rounded-full text-base
                      transition-all duration-200
                      hover:bg-transparent hover:text-white hover:border-2 hover:border-white">
                      download
                    </button>
                  </div>
                  <p className="font-mono whitespace-pre-wrap text-lg">{results.student}</p>
                </div>

                {/* Divider */}
                <hr className="border-white/30" />

                {/* Teacher Version */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">teacher version</h2>
                    <button className="bg-white text-black px-6 py-2 rounded-full text-base
                      transition-all duration-200
                      hover:bg-transparent hover:text-white hover:border-2 hover:border-white">
                      download
                    </button>
                  </div>
                  <p className="font-mono whitespace-pre-wrap text-lg">{results.teacher}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleConvert()}
              disabled={isConverting}
              className="mx-auto block bg-white text-black px-8 py-3 rounded-full text-lg
                transition-all duration-200
                hover:bg-transparent hover:text-white hover:border-2 hover:border-white
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:border-0"
            >
              {isConverting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                  <span>converting...</span>
                </div>
              ) : (
                'rewrite'
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
} 