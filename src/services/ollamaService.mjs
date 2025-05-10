import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @returns {Promise<import('node-fetch').default>} */
const fetchModule = async () => {
  const module = await import('node-fetch');
  return module.default;
};

export class OllamaService {
  constructor() {
    this.OLLAMA_API_URL = 'http://localhost:11434/api/generate';
    this.MODEL = 'llama2:latest';
    this.isInitialized = false;
    this.initializationError = null;
    this.lastConnectionCheck = 0;
    this.connectionCheckInterval = 5000; // 5 seconds

    // Read the CSV file during initialization
    try {
      const csvPath = join(__dirname, '../../brainrot-terms.csv');
      this.brainrotTerms = readFileSync(csvPath, 'utf-8');
      console.log('Successfully loaded brainrot terms from:', csvPath);
    } catch (error) {
      console.error('Error reading brainrot-terms.csv:', error);
      this.brainrotTerms = '';
    }
  }

  /**
   * @returns {Promise<boolean>}
   */
  async checkConnection() {
    try {
      // Rate limit connection checks
      const now = Date.now();
      if (now - this.lastConnectionCheck < this.connectionCheckInterval) {
        return this.isInitialized;
      }
      this.lastConnectionCheck = now;

      const fetch = await fetchModule();
      const response = await fetch('http://localhost:11434/api/version');
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Ollama version:', data.version);
      return true;
    } catch (error) {
      console.error('Failed to connect to Ollama:', error);
      this.isInitialized = false;
      throw new Error('Cannot connect to Ollama. Please make sure Ollama is running (brew services start ollama)');
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Try to connect up to 3 times
      let connected = false;
      for (let i = 0; i < 3 && !connected; i++) {
        try {
          connected = await this.checkConnection();
        } catch (error) {
          if (i === 2) throw error;
          console.log(`Connection attempt ${i + 1} failed, retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Try to use the model
      const fetch = await fetchModule();
      console.log('Testing model availability...');
      const testResponse = await fetch(this.OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.MODEL,
          prompt: 'Hi',
          stream: false,
        }),
      });

      if (!testResponse.ok) {
        console.log('Model not available, attempting to pull...');
        const pullResponse = await fetch('http://localhost:11434/api/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'llama2' }),
        });
        
        if (!pullResponse.ok) {
          throw new Error(`Failed to pull model: ${pullResponse.statusText}`);
        }
        
        console.log('Model pulled successfully');
      }

      this.isInitialized = true;
      console.log('Ollama service initialized successfully');
    } catch (error) {
      this.isInitialized = false;
      this.initializationError = error.message;
      throw new Error(`Ollama initialization failed: ${error.message}. Please ensure Ollama is running (brew services start ollama)`);
    }
  }

  /**
   * @param {string} prompt
   * @returns {Promise<string>}
   */
  async generateText(prompt) {
    try {
      // Check connection before proceeding
      if (!this.isInitialized) {
        await this.initialize();
      } else {
        try {
          await this.checkConnection();
        } catch (error) {
          await this.initialize();
        }
      }

      const fetch = await fetchModule();
      const response = await fetch(this.OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.8,
            top_p: 0.9,
            num_predict: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('Empty response from Ollama');
      }
      return data.response;
    } catch (error) {
      console.error('Error generating text with Ollama:', error);
      throw new Error(`Failed to generate text: ${error.message}. Please ensure Ollama is running (brew services start ollama)`);
    }
  }

  /**
   * @param {string} prompt
   * @returns {Promise<{student: string, teacher: string}>}
   */
  async processContent(prompt) {
    try {
      // Clean the prompt
      const cleanedPrompt = prompt.replace(/\[\<[^\>]+\>\]/g, '')
                                 .replace(/\d+\s+\d+\s+R/g, '')
                                 .replace(/StartXRef:.+/g, '')
                                 .replace(/trailer|root|size|info|id/gi, '')
                                 .replace(/^\s*[\d\.]+\s*$/gm, '')
                                 .trim();

      const fullPrompt = `You are a Gen-Z content creator. Your task is to translate educational content into viral TikTok-style language.

IMPORTANT: You must output EXACTLY TWO sections marked with STUDENT: and TEACHER:. Each section must be at least 50 characters long.

Here's an example:

Original: "2 plus 3 is 5"
Student: "If you have 2 skibidis and it spawns 3 more, you have 5 skibidis total!"
Teacher: "Imagine the number of skibidis as the result of 2 plus 3, you have 5 skibidis total!"

Original: "Pressure is defined to be the amount of force exerted per area."
Student: "Pressure is when you have A TON OF AURA in the room and everyone is feeling it, no cap 💀."
Teacher: "Imagine the amount of force exerted per area, compared that to the amount of aura everyone is feeling in the room, that's pressure."

Original: "A parabola is a symmetrical open plane curve formed by the intersection of a cone with a plane parallel to its side. The path of a projectile under the influence of gravity ideally follows a curve of this shape."
Student: "But like fr, imagine the shot arc of LePookie, that curve is called a parabola, deadass 😭."
Teacher: "Imagine the path of a projectile under the influence of gravity when someone shoots a basketball, that curve is called a parabola."

YOUR TURN! Translate this educational content:
${cleanedPrompt}

Remember:
1. Try to contextualize the brainrot terms to the content instead of just using them randomly
2. Doesn't need to use brainrot terms in every sentence, but try to use them as much as possible
3. DO NOT REPEAT THE ORIGINAL TEXT - TRANSLATE IT INTO BRAINROT!
4. Use CAPS LOCK for emphasis
5. Then add "TEACHER:" section with presentation tips
6. Keep the educational value while making it engaging`;

      const response = await this.generateText(fullPrompt);
      
      // Extract versions
      let studentVersion = '';
      let teacherVersion = '';

      // Try multiple parsing methods
      const methods = [
        // Method 1: Exact markers with regex
        () => {
          const studentMatch = response.match(/STUDENT:\s*([\s\S]*?)(?=TEACHER:|$)/i);
          const teacherMatch = response.match(/TEACHER:\s*([\s\S]*?)$/i);
          if (studentMatch?.[1] && teacherMatch?.[1]) {
            return {
              student: studentMatch[1].trim(),
              teacher: teacherMatch[1].trim()
            };
          }
          return null;
        },
        // Method 2: Simple split
        () => {
          if (response.includes('STUDENT:') && response.includes('TEACHER:')) {
            const parts = response.split('TEACHER:');
            if (parts.length >= 2) {
              return {
                student: parts[0].replace('STUDENT:', '').trim(),
                teacher: parts[1].trim()
              };
            }
          }
          return null;
        }
      ];

      // Try each parsing method
      for (const method of methods) {
        const result = method();
        if (result?.student && result?.teacher) {
          studentVersion = result.student;
          teacherVersion = result.teacher;
          break;
        }
      }

      // If no valid content, try one more time with a simplified prompt
      if (!studentVersion || !teacherVersion) {
        console.log('First attempt failed, trying again with simplified prompt...');
        const retryPrompt = `Translate this into two sections marked STUDENT: and TEACHER:. Make the student version use Gen-Z language (fr fr, no cap) and emojis.

Content to translate:
${cleanedPrompt}`;

        const retryResponse = await this.generateText(retryPrompt);
        const parts = retryResponse.split(/STUDENT:|TEACHER:/i).filter(Boolean);
        if (parts.length >= 2) {
          studentVersion = parts[0].trim();
          teacherVersion = parts[1].trim();
        }
      }

      // Basic validation
      if (!studentVersion || studentVersion.length < 20) {
        throw new Error('Student version is too short or empty');
      }
      if (!teacherVersion || teacherVersion.length < 20) {
        throw new Error('Teacher version is too short or empty');
      }

      // Add Gen-Z terms and emoji if missing
      const genZTerms = ['fr fr', 'no cap', 'ong', 'bussin', 'rizz'];
      const hasGenZTerm = genZTerms.some(term => 
        studentVersion.toLowerCase().includes(term.toLowerCase())
      );
      const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(studentVersion);

      if (!hasGenZTerm || !hasEmoji) {
        studentVersion = `${studentVersion} fr fr 💀`;
      }

      return { 
        student: studentVersion,
        teacher: teacherVersion
      };

    } catch (error) {
      console.error('Error processing content:', error);
      throw new Error('Failed to convert content. Please try again.');
    }
  }
}

export const ollamaService = new OllamaService(); 