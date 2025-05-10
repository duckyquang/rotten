"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const brainrotService_js_1 = require("./services/brainrotService.js");
async function testConversion() {
    try {
        // Read the test document
        const text = (0, fs_1.readFileSync)('test-doc.txt', 'utf-8');
        console.log('Original text:', text);
        console.log('\nConverting...\n');
        // Convert the content
        const result = await brainrotService_js_1.brainrotService.convertContent(text, 'Make it fun and engaging for middle school students');
        console.log('Student Version:', result.studentVersion);
        console.log('\nTeacher Version:', result.teacherVersion);
    }
    catch (error) {
        console.error('Error during conversion:', error);
    }
}
testConversion();
