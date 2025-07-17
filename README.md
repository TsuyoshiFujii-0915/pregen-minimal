# PreGen - Minimal

A modern web-based presentation system that converts YAML input files into beautiful, animated HTML presentations with contemporary website aesthetics.

## Features

- **15 Layout Types**: Complete catalog from title slides to interactive timelines
- **Scroll-Snap Navigation**: Vertical scroll with snap points for each slide
- **Dramatic Animations**: Intersection Observer-based content animations with bounce/elastic effects
- **AI-Powered Generation**: Automatic YAML generation from text documents using OpenAI
- **Responsive Design**: Automatic screen size detection and content scaling
- **Asset Management**: Automatic image detection, copying, and optimization

## Installation

```bash
npm install
```

## Setup

### OpenAI API Configuration (for AI Generation)

1. Create a `.env` file in the project root:
   ```bash
   cp .env.sample .env
   ```

2. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

Note: AI generation features require a valid OpenAI API key. Manual YAML creation and building work without an API key.

## Usage

### Manual YAML Creation

1. Create a YAML file in the `content/` directory
2. Build the presentation:
   ```bash
   npm run build
   ```
3. Preview the presentation:
   ```bash
   npm run preview
   ```

### AI-Powered Generation

1. Place your document in `input/{project-name}/{document}.md`
2. Place any images in `input/{project-name}/assets/`
3. Generate and build:
   ```bash
   npm run generate-and-build {project-name}
   ```

## Project Structure

```
input/                    # Input project directories
├── pregen/
│   ├── pregen.md        # Source document
│   └── assets/          # Project images
│       ├── image_01.png
│       └── image_02.png
└── ...

content/                  # Generated or manual YAML files
├── pregen.yaml
└── ...

presentations/           # Built HTML presentations
├── pregen/
│   ├── index.html
│   └── assets/
└── ...
```

## Layout Types

### 1. Title Slide (`title-slide`)
- Presentation opening with title, subtitle, author, date
- Typically uses black theme for impact

### 2. Section Break (`section-break`)
- Section dividers with large numbers and titles

### 3. Text Left (`text-left`)
- Left-aligned content display
- Fade-in from bottom animation

### 4. Text Center (`text-center`)
- Centered content display
- Fade-in from bottom animation

### 5. Image Full (`image-full`)
- Full-screen image display
- Covers entire screen

### 6. Image Single (`image-1`)
- Single centered image
- Maintains aspect ratio

### 7. Image Horizontal 2 (`image-horizontal-2`)
- Two images side by side
- Sequential fade-in from left

### 8. Image Grid 2x2 (`image-2x2`)
- Four images in grid layout
- Sequential fade-in from top-left

### 9. Image + Text Horizontal (`image-text-horizontal`)
- Image left, text right layout
- Image static, text fades in

### 10. Image + Text Vertical (`image-text-vertical`)
- Image top, text bottom layout
- Image static, text fades in

### 11. Bullet List (`list`)
- Bulleted list display
- Sequential fade-in from top
- Auto 2-column layout for 6+ items

### 12. Numbered List (`num-list`)
- Numbered list display
- Sequential fade-in by number order
- Auto 2-column layout for 6+ items

### 13. Card Layout 2 (`card-2`)
- Two cards side by side
- Dramatic bounce-in with scale effects

### 14. Card Layout 3 (`card-3`)
- Three cards side by side
- Dramatic bounce-in with scale effects

### 15. Timeline (`timeline`)
- Horizontal timeline with events
- Elastic slide-in from left
- Horizontal scroll with keyboard navigation

## YAML Structure

### Basic Structure
```yaml
title: "Presentation Title"
author: "Author Name"
date: "2024-01-01"
slides:
  - type: "title-slide"
    style: "black"
    title:
      visible: true
      text: "Main Title"
    subtitle:
      visible: true
      text: "Subtitle"
    content:
      author:
        visible: true
        text: "Author Name"
      date:
        visible: true
        text: "2024-01-01"
```

### Style Themes
- **Black Theme**: Black background (#050505), white text - for title slides and dramatic moments
- **White Theme**: White background (#FFFFFF), black text - for regular content

## Navigation

- **Vertical Scrolling**: All slides connected vertically
- **Scroll Snap**: Each slide snaps into view
- **Keyboard Support**: Arrow keys, Page Up/Down, Home/End
- **Intersection Observer**: Animations trigger when slides enter viewport

## AI Generation

The system uses OpenAI's o4-mini-2025-04-16 model with Structured Outputs to generate YAML presentations from text documents. The AI automatically:

- Detects and processes project files
- Scans for available assets
- Generates appropriate layouts
- Provides error recovery with retry mechanism

## Commands

```bash
# Build all presentations
npm run build

# Generate YAML from project input
node ai-generator.js --input project-name --auto-build

# Generate with error recovery
node ai-generator.js --input project-name --auto-build --retry-on-error

# Integrated generate and build
npm run generate-and-build project-name

# Preview presentations
npm run preview

# Open specific presentation directly
open presentations/project-name/index.html
```

### Opening Presentations

After building presentations, you can open them directly in your browser:

```bash
# Open specific presentation
open presentations/pregen/index.html

# On Linux/WSL
xdg-open presentations/pregen/index.html

# On Windows
start presentations/pregen/index.html
```

## System Requirements

- Node.js
- OpenAI API key (for AI generation)
- Internet connection (for AI features)

## Dependencies

- `fs-extra`: File system operations
- `js-yaml`: YAML parsing
- `openai`: AI generation
- `dotenv`: Environment variables

## Error Handling

The system includes comprehensive error handling:
- YAML structure validation
- Missing file detection
- Build process recovery
- AI generation retry mechanism
- User-friendly error messages

## Current Status

Production ready system with all core features implemented:
- ✅ 15 layout types
- ✅ Scroll-snap navigation  
- ✅ Dramatic animations
- ✅ AI-powered generation
- ✅ Asset management
- ✅ Error recovery
- ✅ Responsive design