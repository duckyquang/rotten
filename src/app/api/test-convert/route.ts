export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { ollamaService } from '../../../services/ollamaService.mjs';

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

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    const instructions = (data.get('instructions') as string) || '';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract file content based on file type
    const fileBuffer = await file.arrayBuffer();
    let fileContent = '';

    if (file.name.toLowerCase().endsWith('.pdf')) {
      // Extract text from PDF
      const pdfData = await pdfParse(Buffer.from(fileBuffer));
      fileContent = pdfData.text;
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ buffer: Buffer.from(fileBuffer) });
      fileContent = result.value;
    } else {
      // For other file types, try direct text extraction
      fileContent = new TextDecoder().decode(fileBuffer);
    }

    // Validate extracted content
    if (!fileContent || fileContent.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text content could be extracted from the file' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate efficient cache key
    const cacheKey = generateCacheKey(fileContent, instructions);

    // Check cache
    const cachedResult = conversionCache.get(cacheKey);
    if (cachedResult) {
      // Clean up expired entries occasionally
      if (Math.random() < 0.1) cleanupCache();
      return new Response(
        JSON.stringify(cachedResult.result),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Process content and get both versions
      const result = await ollamaService.processContent(
        `${fileContent}\n\nInstructions: ${instructions}`
      );

      // Store in cache
      conversionCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      // Clean up cache occasionally
      if (Math.random() < 0.1) cleanupCache();

      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=300' // 5 minutes browser cache
          } 
        }
      );
    } catch (error) {
      // Handle specific errors from ollamaService
      return new Response(
        JSON.stringify({ 
          student: `Error: ${error.message}. Please try again.`,
          teacher: `Error: ${error.message}. Please try again.`
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Conversion error:', error);
    return new Response(
      JSON.stringify({ 
        student: 'Error: Failed to process file. Please try again.',
        teacher: 'Error: Failed to process file. Please try again.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 