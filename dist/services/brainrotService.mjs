import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ollamaService } from './ollamaService.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class BrainrotService {
    terms = [];
    initialized = false;
    constructor() {
        this.initialize();
    }
    initialize() {
        try {
            const csvPath = join(process.cwd(), 'brainrot-terms.csv');
            const fileContent = readFileSync(csvPath, 'utf-8');
            this.terms = parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            });
            this.initialized = true;
        }
        catch (error) {
            console.error('Error initializing brainrot terms:', error);
            throw new Error('Failed to initialize brainrot terms');
        }
    }
    generatePrompt(text, instructions) {
        const basePrompt = `Convert the following educational content into brainrot language. 
Use the following terms and their definitions as reference:
${this.terms.map(term => `- ${term.term}: ${term.definition}`).join('\n')}

Original text:
${text}

Custom instructions:
${instructions}

Generate two versions:
1. Student Version: Convert the content into engaging brainrot language while maintaining educational value
2. Teacher Version: Include the original content with embedded instructions on how to deliver it using brainrot language, including voice inflection, visual memes, and pedagogical tips`;
        return basePrompt;
    }
    async convertContent(text, instructions = '') {
        if (!this.initialized) {
            throw new Error('Brainrot service not initialized');
        }
        return ollamaService.processContent(text, instructions);
    }
}
// Export a singleton instance
export const brainrotService = new BrainrotService();
