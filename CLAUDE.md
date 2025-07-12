# PreGen - Minimal

## Project Overview
A modern web-based presentation system that converts YAML input files into beautiful, animated HTML presentations with contemporary website aesthetics. Features vertical scroll-snap navigation and dramatic content animations for an engaging user experience.

## Current Implementation Status 🎯
**Production Ready**: Core presentation system with all 15 layout types, scroll-snap navigation, and dramatic animations fully implemented and functional.

## Core Concept
- **Multi-Slide YAML Architecture**: Single YAML file contains entire presentation with slides array
- **Scroll-Snap Navigation**: Vertical scroll with snap points for each slide (modern web UX)
- **Dramatic Animations**: Intersection Observer-based content animations with bounce/elastic effects
- **15 Layout Types**: Complete catalog from title slides to interactive timelines
- **Responsive Design**: Automatic screen size detection and content scaling
- **Template-based System**: Pre-defined layout templates with consistent visual design

## Navigation System
- **Vertical Scrolling**: All slides connected vertically like a modern website
- **Scroll Snap**: Each slide snaps into view during scroll
- **Keyboard Navigation**: Arrow keys, Page Up/Down, Home/End support
- **Intersection Observer**: Animations trigger when slides enter viewport
- **Timeline Exception**: Horizontal scroll isolated within timeline slides

## Style Themes

### Black Theme (High-Impact Slides)
- **Background**: Black (#050505)
- **Text**: White (#FFFFFF)
- **Usage**: Title slides, section breaks, dramatic moments

### White Theme (Standard Content)
- **Background**: White (#FFFFFF)
- **Text**: Black (#050505)
- **Usage**: Regular presentation content

## YAML Structure

### Multi-Slide Presentation Format
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
        
  - type: "text-left"
    style: "white"
    title:
      visible: true
      text: "Content Slide"
    content:
      text: "Slide content here"
      
  - type: "card-3"
    style: "white"
    title:
      visible: true
      text: "Services"
    content:
      cards:
        - image: "icon1.jpg"
          title: "Service 1"
          description: "Description 1"
        - image: "icon2.jpg"
          title: "Service 2"
          description: "Description 2"
        - image: "icon3.jpg"
          title: "Service 3"
          description: "Description 3"
```

## Complete Layout Catalog (15 Layouts)

### 1. Title Slide (`title-slide`)
- **Purpose**: Presentation opening with title, subtitle, author, date
- **Animation**: Static display
- **Typical Theme**: Black for impact

### 2. Section Break (`section-break`)
- **Purpose**: Section dividers with large numbers and titles
- **Animation**: Static display
- **Content**: Section number + title

### 3. Text Left (`text-left`)
- **Purpose**: Left-aligned content display
- **Animation**: Fade-in from bottom
- **Usage**: Standard text content

### 4. Text Center (`text-center`)
- **Purpose**: Centered content display
- **Animation**: Fade-in from bottom
- **Usage**: Quotes, statements, key messages

### 5. Image Full (`image-full`)
- **Purpose**: Full-screen image display
- **Animation**: Static display
- **Display**: Cover mode, fills entire screen

### 6. Image Single (`image-1`)
- **Purpose**: Single centered image
- **Animation**: Static display
- **Display**: Contain mode, maintains aspect ratio

### 7. Image Horizontal 2 (`image-horizontal-2`)
- **Purpose**: Two images side by side
- **Animation**: Sequential fade-in from left
- **Display**: Cover mode, sharp corners

### 8. Image Grid 2x2 (`image-2x2`)
- **Purpose**: Four images in grid layout
- **Animation**: Sequential fade-in from top-left
- **Display**: Cover mode, equal quadrants

### 9. Image + Text Horizontal (`image-text-horizontal`)
- **Purpose**: Image left, text right layout
- **Animation**: Image static, text fades in
- **Display**: Image contain mode, text vertically centered

### 10. Image + Text Vertical (`image-text-vertical`)
- **Purpose**: Image top, text bottom layout
- **Animation**: Image static, text fades in
- **Display**: Image cover mode, text horizontally centered

### 11. Bullet List (`list`)
- **Purpose**: Bulleted list display
- **Animation**: Sequential fade-in from top
- **Features**: Auto 2-column layout for 6+ items, dynamic scaling

### 12. Numbered List (`num-list`)
- **Purpose**: Numbered list display
- **Animation**: Sequential fade-in by number order
- **Features**: Auto 2-column layout for 6+ items, dynamic scaling

### 13. Card Layout 2 (`card-2`)
- **Purpose**: Two cards side by side
- **Animation**: Dramatic bounce-in with scale effects
- **Content**: Icon/image + title + description per card

### 14. Card Layout 3 (`card-3`)
- **Purpose**: Three cards side by side
- **Animation**: Dramatic bounce-in with scale effects
- **Content**: Icon/image + title + description per card

### 15. Timeline (`timeline`)
- **Purpose**: Horizontal timeline with events
- **Animation**: Elastic slide-in from left
- **Features**: Horizontal scroll, keyboard navigation
- **Interactive**: Left/right arrows for timeline navigation

## Animation System

### Dramatic Effects Philosophy
- **High-Impact Animations**: Bounce, elastic, and scale effects for visual impact
- **Intersection Observer**: Animations trigger when slides enter viewport (10% threshold)
- **Repeatable**: All animations re-trigger when returning to slides
- **Hardware Accelerated**: CSS transforms and opacity for 60fps performance

### Animation Types
- **Text Content**: Fade-in from bottom with subtle movement
- **List Items**: Sequential fade-in with staggered timing
- **Cards**: Dramatic bounce-in with scale (translateY(80px) scale(0.7) → normal)
- **Timeline**: Elastic slide-in from left (translateX(-100px) scale(0.8) → normal)

## Technical Architecture

### Build Process
1. **YAML Parsing**: Multi-slide structure validation and processing
2. **HTML Generation**: Single HTML file with all slides as scroll sections
3. **Asset Management**: Image copying and optimization (planned)
4. **CSS/JS Embedding**: All styles and scripts embedded in HTML
5. **Responsive Optimization**: Automatic screen size detection and scaling

### File Structure
```
content/
├── presentation1.yaml    # Multi-slide presentation
├── presentation2.yaml    # Multi-slide presentation
└── ...

presentations/
├── presentation1/
│   ├── index.html        # Complete presentation
│   └── assets/           # Images and resources
├── presentation2/
│   ├── index.html
│   └── assets/
└── ...
```

### Commands
```bash
# Build all presentations
node build.js

# Preview presentations
npm run preview
# Opens server at http://localhost:3000
```

## Responsive Design System
- **Automatic Detection**: Screen size and aspect ratio detection
- **Dynamic Scaling**: Font sizes, card dimensions, and spacing adjust automatically
- **Content Fitting**: All content guaranteed to fit within screen boundaries
- **Landscape Focused**: Optimized for landscape-oriented screens
- **Overflow Management**: Smart scaling for content-heavy slides

## Development Principles
- **Web-First Design**: Modern website aesthetics over traditional slide shows
- **Performance Optimized**: Hardware-accelerated animations and efficient rendering
- **User Experience Focused**: Smooth scrolling and intuitive navigation
- **Minimal Complexity**: Clean, focused implementation without unnecessary features

## Sample Assets
- **Test Files**: `content/test-all-features.yaml` and `content/test-multi-slide.yaml`
- **Sample Images**: `sample/images/sample_image.jpg`
- **Design References**: `references/` directory with 5 reference designs

---

# Future Enhancement Tasks

## Critical Priority Tasks

### 0. AI-Powered YAML Generation System 🤖
**Priority**: Critical  
**Description**: Automatic YAML generation from user documents (txt/md) using OpenAI API with Structured Outputs for guaranteed format compliance  
**User Benefit**: Eliminates manual YAML writing, dramatically improves UX  
**Estimated Time**: 8-12 hours  
**Requirements**:

#### Phase 1: Schema & API Foundation (3-4 hours)
- **JSON Schema Definition**: Create comprehensive schema for all 15 layout types
- **OpenAI Integration**: Implement GPT-4 API with Structured Outputs
- **Schema Validation**: Ensure generated YAML matches exact specification
- **Error Handling**: API failure recovery and fallback mechanisms

#### Phase 2: Content Analysis Engine (3-4 hours)
- **Document Parsing**: Support txt, md, and plain text input
- **Content Segmentation**: Intelligent slide boundary detection
- **Layout Selection**: AI-driven layout type recommendation based on content
- **Image Detection**: Identify image references and requirements in text

#### Phase 3: Prompt Engineering & Templates (2-3 hours)
- **Master Prompt**: Comprehensive system prompt with layout specifications
- **Layout-Specific Prompts**: Specialized prompts for each layout type
- **Context Management**: Maintain presentation coherence across slides
- **Example-Based Learning**: Few-shot prompting with high-quality examples

#### Phase 4: User Interface & Integration (2-3 hours)
- **Input Interface**: Clean text/file upload interface
- **Real-time Preview**: Live YAML generation and presentation preview
- **Manual Override**: Allow user editing of generated YAML
- **Batch Processing**: Handle multiple documents/sections

**Technical Implementation**:
```javascript
// Core API Integration
const generateYAML = async (inputText, options = {}) => {
  const schema = getYAMLSchema();
  const prompt = buildContextualPrompt(inputText, options);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { 
      type: "json_schema",
      json_schema: schema
    }
  });
  
  return validateAndCleanYAML(response.choices[0].message.content);
};
```

**JSON Schema Structure**:
```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "author": { "type": "string" },
    "date": { "type": "string" },
    "slides": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { 
            "enum": ["title-slide", "section-break", "text-left", "text-center", 
                    "image-full", "image-1", "image-horizontal-2", "image-2x2",
                    "image-text-horizontal", "image-text-vertical", "list", "num-list",
                    "card-2", "card-3", "timeline"] 
          },
          "style": { "enum": ["black", "white"] },
          "title": { /* title schema */ },
          "content": { /* layout-specific content schema */ }
        },
        "required": ["type", "style"]
      }
    }
  },
  "required": ["title", "slides"]
}
```

## High Priority Tasks

### 1. Image Asset Management System
**Priority**: High  
**Description**: Implement automatic image copying and optimization from YAML references to presentation assets folders  
**Current Issue**: "custom image copying not yet implemented" message in build output  
**Estimated Time**: 3-4 hours  
**Requirements**:
- Auto-detect image references in YAML content
- Copy images to `presentations/*/assets/` directories
- Implement basic image optimization (compression, format conversion)
- Handle missing image files gracefully

### 2. Error Handling & Validation
**Priority**: High  
**Description**: Robust error handling for build process and user input validation  
**Estimated Time**: 2-3 hours  
**Requirements**:
- Comprehensive YAML validation with helpful error messages
- Missing file detection and user-friendly warnings
- Build process failure recovery and diagnostics
- Invalid slide type/configuration handling

### 3. YAML Structure Validation
**Priority**: High  
**Description**: Schema-based validation system for YAML input files  
**Estimated Time**: 2-3 hours  
**Requirements**:
- Define JSON schema for valid YAML structure
- Type checking for all content fields
- Required field validation
- Helpful error messages for invalid configurations

## Future Layout Extensions

### 4. Advanced Layout Types
**Priority**: Medium  
**Description**: Additional layout types for comprehensive presentation needs  
**Estimated Time**: 6-8 hours  
**Planned Layouts**:
- **Table Layout**: Responsive data tables with styling
- **Chart Layouts**: Line, bar, pie, scatter plot charts
- **Process Flow**: Step-by-step process diagrams
- **Comparison Layout**: Side-by-side comparison tables
- **Quote Layout**: Large quote display with attribution
- **Contact Layout**: Contact information with multiple formats


## Task Status
- ✅ **Core Implementation**: Complete (15 layouts, navigation, animations)
- ✅ **Multi-Slide Architecture**: Complete (YAML structure, build system)
- ✅ **Scroll-Snap Navigation**: Complete (vertical scroll, intersection observer)
- ✅ **Dramatic Animations**: Complete (all layout types with high-impact effects)
- ✅ **Responsive Design**: Complete (automatic scaling and content fitting)
- 🚀 **AI-Powered YAML Generation**: Not implemented (critical priority - UX revolution)
- 🔄 **Image Asset Management**: Not implemented (high priority)
- 🔄 **Error Handling**: Basic implementation (needs enhancement)
- 🔄 **YAML Validation**: Basic implementation (needs schema validation)
- 📋 **Future Layouts**: Not started (planned for future iterations)

## Project Maturity
**Current State**: Production-ready presentation system with all core features  
**Next Phase**: UX Revolution - AI-powered YAML generation for seamless user experience  
**Short-term**: Asset management, validation, and error handling improvements  
**Long-term**: Layout extensions and advanced features

---

# Implementation Task Management

## Development Roadmap - Task Checklist

### Phase 1: Core System Enhancement

#### 1. Image Asset Management System
**Priority**: High | **Estimated Time**: 3-4 hours

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | ASSET-01 | Image Reference Detection | Pending | Scan YAML content for image references |
| ☐ | ASSET-02 | Asset Directory Creation | Pending | Create presentations/*/assets/ directories |
| ☐ | ASSET-03 | Image Copy Pipeline | Pending | Copy referenced images to asset directories |
| ☐ | ASSET-04 | Image Optimization | Pending | Basic compression and format optimization |
| ☐ | ASSET-05 | Missing File Handling | Pending | Graceful handling of missing images |

#### 2. Error Handling & Validation  
**Priority**: High | **Estimated Time**: 2-3 hours

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | ERROR-01 | YAML Validation Enhancement | Pending | Comprehensive validation with helpful messages |
| ☐ | ERROR-02 | File Detection System | Pending | Missing file detection and warnings |
| ☐ | ERROR-03 | Build Process Recovery | Pending | Failure recovery and diagnostics |
| ☐ | ERROR-04 | Invalid Configuration Handling | Pending | Handle invalid slide types/configs |

#### 3. YAML Structure Validation
**Priority**: High | **Estimated Time**: 2-3 hours

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | SCHEMA-01 | JSON Schema Definition | Pending | Define schema for all layout types |
| ☐ | SCHEMA-02 | Type Checking System | Pending | Validate all content field types |
| ☐ | SCHEMA-03 | Required Field Validation | Pending | Ensure required fields are present |
| ☐ | SCHEMA-04 | Error Message System | Pending | User-friendly error messages |

### Phase 2: AI-Powered Generation System

#### 4. AI-Powered YAML Generation System 🤖
**Priority**: Critical | **Estimated Time**: 8-12 hours

**Phase 1: Schema & API Foundation (3-4 hours)**

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | AI-01 | JSON Schema Definition | Pending | Comprehensive schema for all 15 layout types |
| ☐ | AI-02 | OpenAI API Integration | Pending | Implement GPT-4 API with Structured Outputs |
| ☐ | AI-03 | Schema Validation | Pending | Ensure generated YAML matches specification |
| ☐ | AI-04 | API Error Handling | Pending | Failure recovery and fallback mechanisms |

**Phase 2: Content Analysis Engine (3-4 hours)**

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | AI-05 | Document Parsing | Pending | Support txt, md, and plain text input |
| ☐ | AI-06 | Content Segmentation | Pending | Intelligent slide boundary detection |
| ☐ | AI-07 | Layout Selection | Pending | AI-driven layout type recommendation |
| ☐ | AI-08 | Image Detection | Pending | Identify image references in text |

**Phase 3: Prompt Engineering & Templates (2-3 hours)**

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | AI-09 | Master Prompt Design | Pending | System prompt with layout specifications |
| ☐ | AI-10 | Layout-Specific Prompts | Pending | Specialized prompts for each layout |
| ☐ | AI-11 | Context Management | Pending | Maintain presentation coherence |
| ☐ | AI-12 | Example-Based Learning | Pending | Few-shot prompting with examples |

**Phase 4: User Interface & Integration (2-3 hours)**

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | AI-13 | Input Interface | Pending | Text/file upload interface |
| ☐ | AI-14 | Real-time Preview | Pending | Live YAML generation and preview |
| ☐ | AI-15 | Manual Override | Pending | Allow user editing of generated YAML |
| ☐ | AI-16 | Batch Processing | Pending | Handle multiple documents/sections |

### Phase 3: Future Extensions

#### 5. Advanced Layout Types
**Priority**: Medium | **Estimated Time**: 6-8 hours

| ✓ | Task ID | Task Name | Status | Description |
|---|---------|-----------|--------|-------------|
| ☐ | LAYOUT-01 | Table Layout | Pending | Responsive data tables with styling |
| ☐ | LAYOUT-02 | Chart Layouts | Pending | Line, bar, pie, scatter plot charts |
| ☐ | LAYOUT-03 | Process Flow | Pending | Step-by-step process diagrams |
| ☐ | LAYOUT-04 | Comparison Layout | Pending | Side-by-side comparison tables |
| ☐ | LAYOUT-05 | Quote Layout | Pending | Large quote display with attribution |
| ☐ | LAYOUT-06 | Contact Layout | Pending | Contact information formats |

## Task Progress Summary

### ✅ Completed Features
- Core Implementation (15 layouts, navigation, animations)
- Multi-Slide Architecture (YAML structure, build system)  
- Scroll-Snap Navigation (vertical scroll, intersection observer)
- Dramatic Animations (all layout types with high-impact effects)
- Responsive Design (automatic scaling and content fitting)

### 🔄 In Progress Features
- **Total Pending Tasks**: 26 tasks across 5 major components
- **Estimated Total Time**: 19-27 hours
- **Next Priority**: Image Asset Management System

### 📋 Task Status Legend
- **☐**: Not started
- **🔄**: In progress  
- **✅**: Completed
- **❌**: Blocked/Cancelled

---

*Last Updated: Session 6 - Added comprehensive task management checklist with progress tracking*