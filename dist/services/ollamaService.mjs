import { brainrotService } from './brainrotService.js';
import fetch from 'node-fetch';
class OllamaService {
    OLLAMA_API_URL = 'http://localhost:11434/api/generate';
    MODEL = 'llama2';
    async generateText(prompt) {
        try {
            const response = await fetch(this.OLLAMA_API_URL, {
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
        const prompt = brainrotService.generatePrompt(text, instructions);
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
export const ollamaService = new OllamaService();
