# 📄 POC for using Docling to parse documents to structured output for AI analysis

A proof-of-concept application that combines **Docling**'s powerful document parsing capabilities with **OpenAI's API** to enable intelligent analysis and interaction with your documents.

## 🎯 Project Goal

This project demonstrates how to:

1. **Parse Documents** - Use Docling to extract structured content from various document formats (PDF, DOCX, PPTX, images)
2. **Process with AI** - Send the parsed content to OpenAI's API along with user-provided prompts
3. **Get Intelligent Output** - Receive AI-generated responses that can analyze, summarize, answer questions, or perform other tasks on your document content

## 🚀 How It Works

```
Document Input → Docling Parser → Structured Content → OpenAI API + User Prompt → AI Response
```

1. **Document Ingestion**: Upload or provide a document (PDF, DOCX, PPTX, or image)
2. **Content Extraction**: Docling processes the document and converts it to structured Markdown/JSON
3. **Prompt Integration**: Combine the parsed content with your custom text prompt
4. **AI Analysis**: Send both to OpenAI's API for intelligent processing
5. **Response**: Receive AI-generated insights, summaries, answers, or analysis

## 🔧 Features

- **Multi-format Support**: Handle PDFs, Word documents, PowerPoint presentations, and images
- **Structured Output**: Convert documents to clean, structured Markdown or JSON
- **Custom Prompting**: Add your own prompts to guide the AI analysis
- **OpenAI Integration**: Leverage GPT models for powerful document understanding
- **Flexible Pipeline**: Easy to extend for different use cases (RAG, Q&A, summarization, etc.)

## 🛠️ Tech Stack

- **[Docling](https://github.com/DS4SD/docling)** - Advanced document parsing and conversion
- **OpenAI API** - GPT models for intelligent text processing
- **Python** - Core application framework

## 📝 Example Workflow

```python
# 1. Parse document with Docling
parsed_content = docling.parse("document.pdf")

# 2. Combine with user prompt
user_prompt = "Summarize the key findings in this research paper"
full_prompt = f"{user_prompt}\n\nDocument content:\n{parsed_content}"

# 3. Send to OpenAI
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": full_prompt}]
)

# 4. Get AI analysis
ai_response = response.choices[0].message.content
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd doc-parse-poc
   ```

2. **Set up Python environment**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Run the backend**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## 📖 Usage

1. **Upload a Document**: Drag and drop or click to select a document (PDF, DOCX, PPTX, or image)
2. **Enter a Prompt**: Type what you want to know about the document
3. **Analyze**: Click the analyze button to process your document
4. **View Results**: See the AI-generated analysis with document metadata

### Example Prompts

- "Summarize the key points and main conclusions"
- "What are the most important findings?"
- "Extract all numerical data and statistics"
- "Identify the main themes and topics"
- "What action items or recommendations are mentioned?"

## 🏗️ Architecture

### Backend (Python/Flask)

```
backend/
├── app.py                 # Main Flask application
├── config/
│   └── settings.py        # Configuration management
├── services/
│   ├── document_parser.py # Docling integration
│   ├── openai_service.py  # OpenAI API client
│   └── file_service.py    # File handling
├── routes/
│   ├── document_routes.py # Document processing endpoints
│   └── health_routes.py   # Health check endpoints
├── requirements.txt       # Python dependencies
└── .env.example          # Environment template
```

### Frontend (React/TypeScript)

```
frontend/
├── src/
│   ├── components/        # React components
│   ├── services/          # API client
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
└── package.json         # Node.js dependencies
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4
FLASK_DEBUG=False
SECRET_KEY=your_secret_key
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216  # 16MB
```

#### Frontend

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Production Deployment

### Backend (Flask)

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn --bind 0.0.0.0:5000 wsgi:application
```

### Frontend (React)

```bash
# Build for production
npm run build
```

## 🧪 API Reference

### POST `/api/analyze`

Analyze a document with AI

**Request:**

- `file`: Document file (multipart/form-data)
- `prompt`: Analysis prompt (string)

**Response:**

```json
{
	"success": true,
	"analysis": "AI-generated analysis...",
	"metadata": {
		"document": {
			"title": "document.pdf",
			"file_type": ".pdf",
			"file_size": 1024,
			"page_count": 5
		},
		"usage": {
			"total_tokens": 1500,
			"model_used": "gpt-4"
		}
	}
}
```

### GET `/api/supported-formats`

Get supported file formats

### GET `/api/health`

Health check endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License (inherits core Docling license)

---

_Ready to unlock the intelligence hidden in your documents? This POC shows you how to combine state-of-the-art document parsing with powerful AI analysis!_
