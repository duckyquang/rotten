import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Cache for storing recent conversion results
const conversionCache = new Map<string, {
  result: { student: string; teacher: string };
  timestamp: number;
}>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Maximum cache size (100 entries)
const MAX_CACHE_SIZE = 100;

// Clean up expired cache entries and maintain size limit
const cleanupCache = () => {
  const now = Date.now();
  const entries = Array.from(conversionCache.entries());
  
  // Remove expired entries
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      conversionCache.delete(key);
    }
  });

  // If still too large, remove oldest entries
  if (conversionCache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(conversionCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const entriesToRemove = sortedEntries.slice(0, sortedEntries.length - MAX_CACHE_SIZE);
    entriesToRemove.forEach(([key]) => conversionCache.delete(key));
  }
};

// Generate a cache key that's not too long
const generateCacheKey = (content: string, instructions: string): string => {
  const contentHash = Array.from(content)
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString(36);
  
  const instructionsHash = Array.from(instructions)
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString(36);
  
  return `${contentHash}-${instructionsHash}`;
};

// Helper functions for text extraction
async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdfData = await pdfParse(Buffer.from(buffer));
  return pdfData.text;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
  return result.value;
}

export async function POST(request: Request) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const instructions = formData.get('instructions') as string;

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract text based on file type
    let text = '';
    try {
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDOCX(file);
      } else {
        return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or DOCX file.' }, { status: 400 });
      }
    } catch (err) {
      console.error('Text extraction error:', err);
      return NextResponse.json({ error: 'Failed to extract text from file. Please ensure the file is not corrupted.' }, { status: 400 });
    }

    // Validate extracted text
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text content found in file' }, { status: 400 });
    }

    // Generate cache key
    const cacheKey = generateCacheKey(text, instructions);

    // Check cache
    const cachedResult = conversionCache.get(cacheKey);
    if (cachedResult) {
      // Clean up expired entries occasionally
      if (Math.random() < 0.1) cleanupCache();
      return NextResponse.json(cachedResult.result);
    }

    // Process content
    try {
      // Dynamically import ollamaService
      const { ollamaService } = await import('../../../services/ollamaService.mjs');
      const result = await ollamaService.processContent(text);
      
      // Validate result
      if (!result || !result.student || !result.teacher) {
        throw new Error('Failed to generate content');
      }

      // Cache result
      conversionCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      // Clean up cache occasionally
      if (Math.random() < 0.1) cleanupCache();

      return NextResponse.json(result);
    } catch (err) {
      console.error('Content processing error:', err);
      return NextResponse.json({ 
        error: err instanceof Error ? err.message : 'Failed to process content. Please try again.' 
      }, { status: 500 });
    }
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 