export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Helper function to create JSON response with proper headers
function createJSONResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    // Basic request validation
    if (!request.body) {
      return createJSONResponse({ error: 'No request body' }, 400);
    }

    // Log the start of processing
    console.log('Step 1: Starting file processing');

    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!contentType?.includes('multipart/form-data')) {
      return createJSONResponse({ error: 'Invalid content type' }, 400);
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
      console.log('Step 2: FormData parsed');
    } catch (error) {
      console.error('FormData parsing error:', error);
      return createJSONResponse({ error: 'Failed to parse form data' }, 400);
    }

    // Get file and instructions
    const file = formData.get('file');
    const instructions = formData.get('instructions');
    
    // Log file details
    console.log('File type:', file ? typeof file : 'no file');
    console.log('File instanceof Blob:', file instanceof Blob);
    if (file instanceof Blob) {
      console.log('File size:', file.size);
      console.log('File type:', file.type);
    }

    // Basic validation
    if (!file || !(file instanceof Blob)) {
      return createJSONResponse({ error: 'No file provided' }, 400);
    }

    // Get filename
    const fileName = (file && 'name' in file && typeof file.name === 'string') 
      ? file.name 
      : 'upload.pdf';
    console.log('Filename:', fileName);

    // Validate file type
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
      return createJSONResponse({
        error: 'Unsupported file type. Please upload a PDF or DOCX file.'
      }, 400);
    }

    // Convert to buffer
    let buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log('Buffer size:', buffer.length);
    } catch (error) {
      console.error('Buffer conversion error:', error);
      return createJSONResponse({ error: 'Failed to process file' }, 500);
    }

    // Extract text based on file type
    let text = '';
    try {
      console.log('Step 3: Extracting text from file');
      if (fileName.endsWith('.pdf')) {
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } else if (fileName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      }
      console.log('Step 4: Text extracted successfully');
    } catch (error) {
      console.error('Text extraction error:', error);
      return createJSONResponse({
        error: 'Error extracting text from file. Please make sure the file is not corrupted.'
      }, 500);
    }

    if (!text) {
      return createJSONResponse({ error: 'No text content found in file' }, 400);
    }

    // Return extracted text
    return createJSONResponse({
      student: `Extracted text (${text.length} characters):\n${text.substring(0, 500)}...`,
      teacher: `File processed: ${fileName}\nExtracted ${text.length} characters of text\nInstructions: ${instructions || 'none'}`
    });

  } catch (error) {
    // Detailed error logging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return createJSONResponse({ 
      error: `Processing error: ${error.message}` 
    }, 500);
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 