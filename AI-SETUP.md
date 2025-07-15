# AI-Powered YAML Generator Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup OpenAI API Key
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file and add your OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key to your `.env` file

### 4. Test the Generator
```bash
# Create a sample text file
echo "Welcome to AI Presentations

This is a demo presentation about artificial intelligence.

## Key Features
- Automatic YAML generation
- Beautiful slide layouts
- Modern animations
- Responsive design

## Benefits
Using AI to generate presentations saves time and ensures consistency.

Thank you for using our system!" > sample-input.txt

# Generate YAML presentation
node ai-generator.js --input sample-input.txt --output demo.yaml --auto-build
```

## 🔧 Usage Examples

### Basic Generation
```bash
node ai-generator.js --input document.txt --output presentation.yaml
```

### With Auto-Build
```bash
node ai-generator.js --input document.md --auto-build
```

### Full Pipeline
```bash
node ai-generator.js --input notes.txt --output slides.yaml --auto-build
```

## 📋 Supported Input Formats

- **Plain Text** (.txt)
- **Markdown** (.md)
- **Any text file** (auto-detected)

## 🎯 Generated Output

The AI generator creates:
- **YAML file** in `content/` directory
- **HTML presentation** in `presentations/` directory (if --auto-build)
- **Asset management** (automatic image handling)

## 🔐 Environment Variables

Create `.env` file with:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

Alternative methods:
```bash
# Export to shell
export OPENAI_API_KEY=your_api_key_here

# Or run with inline variable
OPENAI_API_KEY=your_api_key_here node ai-generator.js --input file.txt
```

## 🛠️ Troubleshooting

### API Key Issues
```
Error: OPENAI_API_KEY environment variable is required
```
**Solution**: Check your `.env` file and API key validity

### Model Access
```
Error: Model 'o4-mini-2025-04-16' not found
```
**Solution**: Ensure you have access to the latest OpenAI models

### Build Failures
```
Error: Build failed
```
**Solution**: Check your YAML structure and run `node build.js` manually

## 📊 Features

- ✅ **15 Layout Types** - Complete catalog support
- ✅ **Structured Outputs** - Guaranteed format compliance
- ✅ **Auto-Validation** - Schema-based validation
- ✅ **Error Handling** - Comprehensive error recovery
- ✅ **Image Support** - Path validation and warnings
- ✅ **Auto-Build** - Optional presentation generation

## 🎨 Layout Types Generated

1. **title-slide** - Opening with title/subtitle
2. **section-break** - Section dividers
3. **text-left** - Left-aligned content
4. **text-center** - Centered content
5. **image-full** - Full-screen images
6. **image-1** - Single centered image
7. **image-horizontal-2** - Two images side by side
8. **image-2x2** - Four images in grid
9. **image-text-horizontal** - Image + text horizontal
10. **image-text-vertical** - Image + text vertical
11. **list** - Bullet lists
12. **num-list** - Numbered lists
13. **card-2** - Two feature cards
14. **card-3** - Three feature cards
15. **timeline** - Horizontal timeline

## 🌟 Advanced Usage

### Custom Prompts
The AI uses intelligent layout selection based on content analysis.

### Batch Processing
```bash
# Process multiple files
for file in documents/*.txt; do
  node ai-generator.js --input "$file" --auto-build
done
```

### Integration with Build System
```bash
# Generate and build in one command
node ai-generator.js --input content.md --auto-build
```

---

**Ready to create amazing presentations with AI! 🚀**