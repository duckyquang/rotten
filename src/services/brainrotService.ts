import { readFileSync } from 'fs';
import { join } from 'path';
import { ollamaService } from './ollamaService';
import { generatePrompt } from '../utils/promptGenerator';

interface BrainrotTerm {
  term: string;
  definition: string;
  use_case: string;
  educational_use_case: string;
}

export class BrainrotService {
  private terms: BrainrotTerm[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes
          currentField += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
      i++;
    }

    // Add the last field
    fields.push(currentField.trim());
    return fields;
  }

  private initialize() {
    try {
      const fileContent = readFileSync(join(process.cwd(), 'brainrot-terms.csv'), 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      // Skip header
      const header = this.parseCSVLine(lines[0]);
      const termIndex = header.indexOf('term');
      const definitionIndex = header.indexOf('definition');
      const useCaseIndex = header.indexOf('use case');
      const educationalUseCaseIndex = header.indexOf('educational use case');

      for (let i = 1; i < lines.length; i++) {
        const fields = this.parseCSVLine(lines[i]);
        if (fields.length >= 4) {
          this.terms.push({
            term: fields[termIndex] || '',
            definition: fields[definitionIndex] || '',
            use_case: fields[useCaseIndex] || '',
            educational_use_case: fields[educationalUseCaseIndex] || ''
          });
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing brainrot terms:', error);
      throw new Error('Failed to initialize brainrot terms');
    }
  }

  public generatePrompt(content: string, customInstructions: string): string {
    return generatePrompt(content, customInstructions, this.terms);
  }

  private async processWithAI(prompt: string): Promise<{ student: string; teacher: string }> {
    try {
      const response = await ollamaService.processContent(prompt);
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from AI service');
      }
      
      const { student, teacher } = response;
      if (!student || !teacher) {
        throw new Error('Missing student or teacher version in AI response');
      }

      return { student, teacher };
    } catch (error) {
      console.error('Error processing with AI:', error);
      throw new Error('Failed to process content with AI');
    }
  }

  public async convertContent(content: string, customInstructions: string): Promise<{ student: string; teacher: string }> {
    if (!this.initialized) {
      throw new Error('BrainrotService not initialized');
    }

    const prompt = this.generatePrompt(content, customInstructions);
    return this.processWithAI(prompt);
  }
}

// Export a singleton instance
export const brainrotService = new BrainrotService(); 