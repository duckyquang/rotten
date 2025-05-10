# Rotten - Educational Content Brainrot Converter

## Overview
Rotten is a web application that transforms traditional educational materials into engaging, meme-style content that resonates with younger students. The app converts PDFs, PowerPoint presentations, and Word documents into two versions: a student-friendly "brainrot" version and a teacher's guide with delivery instructions.

## Core Features

### 1. Document Upload & Processing
- Support for multiple file formats (PDF, DOCX, PPTX)
- Drag-and-drop interface
- File validation and error handling
- Progress indication during processing

### 2. Content Customization
- Optional customization input field
- Support for specific style preferences:
  - TikTok slang
  - Absurdist humor
  - Dark humor
  - Other meme-based styles

### 3. Dual Output Generation
- Student Version:
  - Full brainrot language conversion
  - Preserved educational content
  - Meme-style formatting
  - Engaging and relatable tone

- Teacher Version:
  - Original content with embedded instructions
  - Delivery suggestions
  - Voice inflection guidance
  - Visual meme recommendations
  - Pedagogical tips

### 4. Output Delivery
- Downloadable formats (PDF/DOCX)
- Optional content preview
- Batch processing capability
- Error handling and retry options

## Implementation Pathway

### Phase 1: Frontend Development
1. Set up Next.js project with TypeScript
2. Implement responsive UI using Tailwind CSS
3. Create file upload component
4. Design customization input interface
5. Build preview and download components

### Phase 2: Backend Development
1. Set up Node.js/Express or Next.js API routes
2. Implement file upload handling with Multer
3. Create document parsing pipeline:
   - PDF processing
   - DOCX processing
   - PPTX processing
4. Develop AI integration layer
5. Implement document generation system

### Phase 3: AI Integration
1. Set up AI model connection
2. Develop prompt engineering system
3. Create content transformation pipeline
4. Implement dual-output generation
5. Add customization processing
6. Train AI model with brainrot-terms.csv:
   - Comprehensive dictionary of brainrot terms and their usage
   - Educational context for each term
   - Style variations and combinations
   - Cultural references and memes
   - Regional variations (e.g., Italian brainrot)
   - Proper implementation in educational content

### Phase 4: Testing & Deployment
1. Unit testing
2. Integration testing
3. User acceptance testing
4. Performance optimization
5. Deployment to production

## Technical Stack

### Frontend
- Framework: Next.js (Static Export)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React Context
- File Handling: react-dropzone
- Build Tool: npm scripts

### Backend
- Runtime: Node.js
- Framework: Express.js
- File Processing:
  - pdf-parse (PDF)
  - mammoth (DOCX)
  - pptx-parser (PPTX)
- Document Generation:
  - docx
  - pdfkit

### AI Integration
Options (choose one):
- Local: Ollama (Free, open-source)
- Hugging Face: Mixtral/Mistral (Free tier available)
- Local: LLaMA-2 (Free, open-source)

Training Data:
- brainrot-terms.csv: Comprehensive dictionary of brainrot language
  - Term definitions
  - Usage examples
  - Educational applications
  - Style variations
  - Cultural context
  - Regional adaptations

### Deployment
- Frontend: GitHub Pages (Free)
- Backend: Render Free Tier
- Storage: Local file system for temporary storage

### Development Tools
- Version Control: Git
- Package Manager: npm
- Testing: Jest
- Linting: ESLint
- Formatting: Prettier
- CI/CD: GitHub Actions (Free)

## Future Enhancements
1. User authentication system
2. Content history and templates
3. Batch processing
4. Custom style presets
5. Community sharing features
6. Analytics dashboard
7. API access for third-party integration 