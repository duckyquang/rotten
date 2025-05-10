# 🔄 Rotten

Convert boring educational content into engaging Gen-Z style explanations! Rotten is a web application that transforms traditional educational materials into two versions:
- A student-friendly "brainrot" version using Gen-Z language and memes
- A teacher's guide with presentation tips and delivery instructions

## ✨ Features

- 📝 Support for multiple file formats (PDF, DOCX)
- 🎯 Automatic conversion to Gen-Z style language
- 👩‍🏫 Generates both student and teacher versions
- 🔄 Real-time preview
- 💾 Download converted content
- 🎨 Modern, responsive UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Ollama](https://ollama.ai/) for local LLM support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/duckyquang/rotten.git
cd rotten
```

2. Install dependencies:
```bash
npm install
```

3. Install and start Ollama:
```bash
# macOS
brew install ollama
brew services start ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
systemctl start ollama
```

4. Pull the required model:
```bash
ollama pull llama2
```

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🛠 How It Works

1. **File Upload**: Upload your educational content (PDF or DOCX)
2. **Text Extraction**: The content is extracted and cleaned
3. **AI Processing**: 
   - Content is processed by Llama 2 through Ollama
   - Converted into Gen-Z style language
   - Teaching instructions are generated
4. **Download**: Get both student and teacher versions

## 📖 API Reference

### POST /api/convert
Convert educational content to Gen-Z style.

Request:
```json
{
  "file": "File (PDF/DOCX)",
  "instructions": "Optional customization instructions"
}
```

Response:
```json
{
  "student": "Gen-Z style content",
  "teacher": "Teaching instructions"
}
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Ollama](https://ollama.ai/) - Local LLM Runtime
- [Llama 2](https://ai.meta.com/llama/) - Language Model
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF Processing
- [mammoth](https://www.npmjs.com/package/mammoth) - DOCX Processing

## 📧 Contact

Your Name - [@buiducquang](https://www.linkedin.com/in/buiducquang/) - quang.gateway@gmail.com

Project Link: [https://github.com/yourusername/rotten](https://github.com/duckyquang/rotten) 