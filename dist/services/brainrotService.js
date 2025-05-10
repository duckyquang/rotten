"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brainrotService = void 0;
const sync_1 = require("csv-parse/sync");
const fs_1 = require("fs");
const path_1 = require("path");
const url_1 = require("url");
const path_2 = require("path");
const ollamaService_js_1 = require("./ollamaService.js");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_2.dirname)(__filename);
class BrainrotService {
    constructor() {
        this.terms = [];
        this.initialized = false;
        this.initialize();
    }
    initialize() {
        try {
            const csvPath = (0, path_1.join)(process.cwd(), 'brainrot-terms.csv');
            const fileContent = (0, fs_1.readFileSync)(csvPath, 'utf-8');
            this.terms = (0, sync_1.parse)(fileContent, {
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
        return ollamaService_js_1.ollamaService.processContent(text, instructions);
    }
}
// Export a singleton instance
exports.brainrotService = new BrainrotService();
