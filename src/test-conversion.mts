import { readFileSync } from 'fs';
import { brainrotService } from './services/brainrotService.mjs';

async function testConversion() {
  try {
    // Read the test document
    const text = readFileSync('test-doc.txt', 'utf-8');
    
    console.log('Original text:', text);
    console.log('\nConverting...\n');

    // Convert the content
    const result = await brainrotService.convertContent(text, 'Make it fun and engaging for middle school students');

    console.log('Student Version:', result.student);
    console.log('\nTeacher Version:', result.teacher);
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

testConversion(); 