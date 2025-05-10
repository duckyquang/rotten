"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ollamaService = void 0;
const brainrotService_js_1 = require("./brainrotService.js");
const node_fetch_1 = __importDefault(require("node-fetch"));
class OllamaService {
    constructor() {
        this.OLLAMA_API_URL = 'http://localhost:11434/api/generate';
        this.MODEL = 'llama2';
    }
    async generateText(prompt) {
        try {
            const response = await (0, node_fetch_1.default)(this.OLLAMA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    prompt,
                    stream: false,
                }),
            });
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.response;
        }
        catch (error) {
            console.error('Error generating text with Ollama:', error);
            throw error;
        }
    }
    async processContent(text, instructions = '') {
        const prompt = brainrotService_js_1.brainrotService.generatePrompt(text, instructions);
        // Generate student version
        const studentPrompt = `${prompt}\n\nGenerate the student version first:`;
        const studentVersion = await this.generateText(studentPrompt);
        // Generate teacher version
        const teacherPrompt = `${prompt}\n\nNow generate the teacher version:`;
        const teacherVersion = await this.generateText(teacherPrompt);
        return {
            studentVersion,
            teacherVersion,
        };
    }
}
exports.ollamaService = new OllamaService();
