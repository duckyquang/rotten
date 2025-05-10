import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { brainrotService } from '@/services/brainrotService';
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const instructions = formData.get('instructions');
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        // Create temporary file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempPath = join(tmpdir(), `${uuidv4()}-${file.name}`);
        await writeFile(tempPath, buffer);
        // Extract text based on file type
        let text = '';
        if (file.type === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            text = pdfData.text;
        }
        else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        }
        else {
            // TODO: Add PPTX processing
            return NextResponse.json({ error: 'PPTX processing not implemented yet' }, { status: 501 });
        }
        // Process text with brainrot service
        const result = await brainrotService.convertContent(text, instructions);
        return NextResponse.json(result);
    }
    catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
    }
}
