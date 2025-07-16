#!/usr/bin/env node

/**
 * AI-Powered YAML Generation System
 * 
 * This standalone AI generator creates YAML presentation files from text documents
 * using OpenAI's latest o4-mini-2025-04-16 model with Structured Outputs for
 * guaranteed format compliance.
 * 
 * Usage:
 *   node ai-generator.js --input document.txt --output presentation.yaml
 *   node ai-generator.js --input document.md --auto-build
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// JSON Schema for YAML presentation structure
const YAML_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Presentation title"
    },
    "author": {
      "type": "string",
      "description": "Author name"
    },
    "date": {
      "type": "string",
      "description": "Presentation date (YYYY-MM-DD format)"
    },
    "slides": {
      "type": "array",
      "description": "Array of slide objects",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "title-slide",
              "section-break", 
              "text-left",
              "text-center",
              "image-full",
              "image-1",
              "image-horizontal-2",
              "image-2x2",
              "image-text-horizontal",
              "image-text-vertical",
              "list",
              "num-list",
              "card-2",
              "card-3",
              "timeline"
            ],
            "description": "Slide layout type"
          },
          "style": {
            "type": "string",
            "enum": ["black", "white"],
            "description": "Slide theme (black for impact, white for content)"
          },
          "title": {
            "type": "object",
            "properties": {
              "visible": {
                "type": "boolean",
                "description": "Whether title is visible"
              },
              "text": {
                "type": "string",
                "description": "Title text"
              }
            },
            "required": ["visible", "text"],
            "additionalProperties": false
          },
          "subtitle": {
            "type": "object",
            "properties": {
              "visible": {
                "type": "boolean",
                "description": "Whether subtitle is visible"
              },
              "text": {
                "type": "string",
                "description": "Subtitle text"
              }
            },
            "required": ["visible", "text"],
            "additionalProperties": false
          },
          "content": {
            "type": "object",
            "description": "Content specific to each slide type",
            "additionalProperties": true
          }
        },
        "required": ["type", "style"],
        "additionalProperties": false
      }
    }
  },
  "required": ["title", "slides"],
  "additionalProperties": false
};

// Content schema definitions for each slide type
const CONTENT_SCHEMAS = {
  "title-slide": {
    "type": "object",
    "properties": {
      "author": {
        "type": "object",
        "properties": {
          "visible": { "type": "boolean" },
          "text": { "type": "string" }
        },
        "required": ["visible", "text"]
      },
      "date": {
        "type": "object", 
        "properties": {
          "visible": { "type": "boolean" },
          "text": { "type": "string" }
        },
        "required": ["visible", "text"]
      }
    },
    "additionalProperties": false
  },
  "section-break": {
    "type": "object",
    "properties": {
      "number": { "type": "string" },
      "title": { "type": "string" }
    },
    "required": ["number", "title"],
    "additionalProperties": false
  },
  "text-left": {
    "type": "object",
    "properties": {
      "text": { "type": "string" }
    },
    "required": ["text"],
    "additionalProperties": false
  },
  "text-center": {
    "type": "object",
    "properties": {
      "text": { "type": "string" }
    },
    "required": ["text"],
    "additionalProperties": false
  },
  "image-full": {
    "type": "object",
    "properties": {
      "image": { "type": "string" }
    },
    "additionalProperties": false
  },
  "image-1": {
    "type": "object",
    "properties": {
      "image": { "type": "string" }
    },
    "additionalProperties": false
  },
  "image-horizontal-2": {
    "type": "object",
    "properties": {
      "image1": { "type": "string" },
      "image2": { "type": "string" }
    },
    "additionalProperties": false
  },
  "image-2x2": {
    "type": "object",
    "properties": {
      "image1": { "type": "string" },
      "image2": { "type": "string" },
      "image3": { "type": "string" },
      "image4": { "type": "string" }
    },
    "additionalProperties": false
  },
  "image-text-horizontal": {
    "type": "object",
    "properties": {
      "image": { "type": "string" },
      "text": { "type": "string" }
    },
    "required": ["text"],
    "additionalProperties": false
  },
  "image-text-vertical": {
    "type": "object",
    "properties": {
      "image": { "type": "string" },
      "text": { "type": "string" }
    },
    "required": ["text"],
    "additionalProperties": false
  },
  "list": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["items"],
    "additionalProperties": false
  },
  "num-list": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["items"],
    "additionalProperties": false
  },
  "card-2": {
    "type": "object",
    "properties": {
      "cards": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "image": { "type": "string" },
            "title": { "type": "string" },
            "description": { "type": "string" }
          },
          "required": ["title", "description"]
        },
        "minItems": 2,
        "maxItems": 2
      }
    },
    "required": ["cards"],
    "additionalProperties": false
  },
  "card-3": {
    "type": "object",
    "properties": {
      "cards": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "image": { "type": "string" },
            "title": { "type": "string" },
            "description": { "type": "string" }
          },
          "required": ["title", "description"]
        },
        "minItems": 3,
        "maxItems": 3
      }
    },
    "required": ["cards"],
    "additionalProperties": false
  },
  "timeline": {
    "type": "object",
    "properties": {
      "events": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "time": { "type": "string" },
            "title": { "type": "string" },
            "description": { "type": "string" }
          },
          "required": ["title", "description"]
        }
      }
    },
    "required": ["events"],
    "additionalProperties": false
  }
};

// System prompt for AI YAML generation
const SYSTEM_PROMPT = `You are an expert presentation designer who converts text documents into structured YAML presentations.

Your task is to analyze the input text and create a professional presentation with the following guidelines:

LAYOUT SELECTION RULES:
- title-slide: Opening slide with title, subtitle, author, date (always use black theme)
- section-break: Major section dividers with numbers and titles (use black theme) - MUST include content.number and content.title
- text-left: Standard text content (use white theme)
- text-center: Quotes, key statements, important messages (use white theme)
- image-full: Full-screen impact images (any theme)
- image-1: Single centered image (any theme)
- image-horizontal-2: Two images side by side (any theme)
- image-2x2: Four images in grid (any theme)
- image-text-horizontal: Image left, text right (any theme)
- image-text-vertical: Image top, text bottom (any theme)
- list: Bullet points (use white theme)
- num-list: Numbered lists (use white theme)
- card-2: Two feature cards (use white theme)
- card-3: Three feature cards (use white theme)
- timeline: Horizontal timeline events (use white theme)

THEME SELECTION:
- black: High-impact slides (title-slide, section-break, dramatic moments)
- white: Content slides (text, lists, cards, most layouts)

CONTENT GUIDELINES:
- Extract key information and organize into logical slides
- Use clear, concise language
- Create engaging titles and subtitles
- For images, use relative paths from project root (e.g., "input/folder/image.jpg", "assets/image.jpg", "sample/images/image.jpg")
- Only use image layouts if you have specific image content to display
- Prefer text-based layouts for abstract concepts and explanations
- Maintain professional presentation flow
- Balance text density across slides

STRUCTURE:
- Always start with title-slide
- Use section-break for major topics
- Mix layout types for visual variety
- End with impactful conclusion or call-to-action

Generate a complete YAML presentation that transforms the input text into a professional, engaging presentation.`;

/**
 * Generate YAML presentation from input text using OpenAI API
 * @param {string} inputText - The text content to convert
 * @param {Object} options - Generation options
 * @param {Object} projectData - Project data with assets information
 * @returns {Promise<Object>} Generated YAML content and metadata
 */
async function generateYAML(inputText, options = {}, projectData = null) {
  console.log('🤖 Initializing AI YAML Generator...');
  
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(`OPENAI_API_KEY environment variable is required
      
Please set your OpenAI API key by either:
1. Creating a .env file with: OPENAI_API_KEY=your_api_key_here
2. Setting environment variable: export OPENAI_API_KEY=your_api_key_here
3. Running with: OPENAI_API_KEY=your_api_key_here node ai-generator.js

Get your API key from: https://platform.openai.com/api-keys`);
    }

    // Import OpenAI (dynamic import for Node.js compatibility)
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🔧 Building contextual prompt...');
    
    // Build project context if available
    let projectContext = '';
    if (projectData && projectData.assets && projectData.assets.length > 0) {
      projectContext = `

PROJECT ASSETS AVAILABLE:
${projectData.assets.map(asset => `- ${asset}`).join('\n')}

For image layouts (image-full, image-1, image-horizontal-2, image-2x2, image-text-horizontal, image-text-vertical, card-2, card-3), use these exact paths as they appear above.
`;
    }
    
    const contextualPrompt = `${SYSTEM_PROMPT}${projectContext}

INPUT TEXT TO CONVERT:
${inputText}

Generate a professional YAML presentation that transforms this content into an engaging, well-structured presentation. Use appropriate layout types, themes, and ensure smooth content flow.

Focus on creating slides with substantial content rather than over-segmenting into too many thin slides. Each slide should contain meaningful information and maintain good content density.

${projectData && projectData.assets && projectData.assets.length > 0 ? 
  'IMPORTANT: When using image layouts, reference the exact asset paths listed above. Do not make up image paths.' : 
  'NOTE: No image assets are available, so avoid using image-based layouts unless absolutely necessary.'}`;

    console.log('🚀 Calling OpenAI API with Structured Outputs...');
    
    const response = await openai.chat.completions.create({
      model: "o4-mini-2025-04-16",
      messages: [
        { role: "user", content: contextualPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "presentation_yaml",
          schema: YAML_SCHEMA
        }
      }
    });

    const generatedData = JSON.parse(response.choices[0].message.content);
    
    console.log('✅ AI generation successful!');
    console.log(`📊 Generated ${generatedData.slides.length} slides`);
    
    // Validate generated YAML matches specification
    const validationResult = validateYAMLStructure(generatedData);
    if (!validationResult.valid) {
      throw new Error(`Generated YAML validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Convert to YAML format
    const yaml = require('js-yaml');
    const yamlContent = yaml.dump(generatedData, { 
      indent: 2,
      lineWidth: 80,
      noRefs: true 
    });

    // Generate filename based on project name or custom output
    const filename = options.output || `${options.projectName}.yaml`;
    const fullPath = path.join('content', filename);

    // Ensure content directory exists
    try {
      await fs.mkdir('content', { recursive: true });
    } catch (err) {
      // Directory already exists
    }

    // Save generated YAML
    await fs.writeFile(fullPath, yamlContent, 'utf8');
    console.log(`💾 Generated YAML saved to: ${fullPath}`);

    // Auto-build if requested
    if (options.autoBuild) {
      console.log('🔨 Auto-building presentation...');
      try {
        const { stdout, stderr } = await execAsync('node build.js');
        console.log('Build output:', stdout);
        if (stderr) console.log('Build warnings:', stderr);
        console.log('✅ Build completed successfully!');
      } catch (buildError) {
        console.error('❌ Build failed:', buildError.message);
      }
    }

    return {
      filename,
      fullPath,
      yamlContent,
      generatedData,
      slideCount: generatedData.slides.length,
      usage: response.usage
    };

  } catch (error) {
    console.error('❌ AI generation failed:', error.message);
    throw error;
  }
}

/**
 * Validate YAML structure against schema
 * @param {Object} data - YAML data to validate
 * @returns {Object} Validation result
 */
function validateYAMLStructure(data) {
  const errors = [];
  
  // Basic structure validation
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  
  if (!data.slides || !Array.isArray(data.slides)) {
    errors.push('Missing or invalid slides array');
  }
  
  // Validate each slide
  if (data.slides) {
    data.slides.forEach((slide, index) => {
      if (!slide.type || !YAML_SCHEMA.properties.slides.items.properties.type.enum.includes(slide.type)) {
        errors.push(`Slide ${index + 1}: Invalid or missing type`);
      }
      
      if (!slide.style || !['black', 'white'].includes(slide.style)) {
        errors.push(`Slide ${index + 1}: Invalid or missing style`);
      }
      
      // Validate content based on slide type (only for critical fields)
      if (slide.type && CONTENT_SCHEMAS[slide.type]) {
        const contentSchema = CONTENT_SCHEMAS[slide.type];
        if (contentSchema.required) {
          contentSchema.required.forEach(field => {
            if (!slide.content || slide.content[field] === undefined) {
              errors.push(`Slide ${index + 1}: Missing required content field '${field}'`);
            }
          });
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Load project data from input directory
 * @param {string} projectName - Project directory name
 * @returns {Promise<Object>} Project data with document content and assets
 */
async function loadProjectData(projectName) {
  console.log(`📁 Loading project: ${projectName}`);
  
  const projectPath = path.join('input', projectName);
  
  try {
    // Check if project directory exists
    const stats = await fs.stat(projectPath);
    if (!stats.isDirectory()) {
      throw new Error(`Project path '${projectPath}' is not a directory`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Project directory '${projectPath}' does not exist`);
    }
    throw error;
  }
  
  // Find document file in project directory
  const documentFile = await findDocumentFile(projectPath);
  console.log(`📄 Found document: ${documentFile}`);
  
  // Read document content
  const content = await fs.readFile(documentFile, 'utf8');
  
  // Scan assets directory if it exists
  const assetsPath = path.join(projectPath, 'assets');
  const assets = await scanAssetsDirectory(assetsPath);
  
  return {
    name: projectName,
    documentPath: documentFile,
    document: content.trim(),
    assets: assets,
    assetsPath: assetsPath
  };
}

/**
 * Find document file in project directory
 * @param {string} projectPath - Path to project directory
 * @returns {Promise<string>} Path to document file
 */
async function findDocumentFile(projectPath) {
  try {
    const files = await fs.readdir(projectPath);
    
    // Priority order: .md files first, then .txt files
    const mdFiles = files.filter(file => file.endsWith('.md'));
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    if (mdFiles.length > 0) {
      return path.join(projectPath, mdFiles[0]);
    }
    
    if (txtFiles.length > 0) {
      return path.join(projectPath, txtFiles[0]);
    }
    
    throw new Error(`No document file found in ${projectPath}. Expected .md or .txt file.`);
  } catch (error) {
    throw new Error(`Failed to find document file: ${error.message}`);
  }
}

/**
 * Scan assets directory for images and resources
 * @param {string} assetsPath - Path to assets directory
 * @returns {Promise<Array>} Array of asset filenames with relative paths
 */
async function scanAssetsDirectory(assetsPath) {
  try {
    const stats = await fs.stat(assetsPath);
    if (!stats.isDirectory()) {
      return [];
    }
    
    const files = await fs.readdir(assetsPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    const assets = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(file => path.join(assetsPath, file));
    
    console.log(`🖼️  Found ${assets.length} asset(s): ${assets.map(a => path.basename(a)).join(', ')}`);
    return assets;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`📁 No assets directory found at ${assetsPath}`);
      return [];
    }
    throw new Error(`Failed to scan assets directory: ${error.message}`);
  }
}

/**
 * Validate image paths and provide warnings
 * @param {Object} yamlData - Generated YAML data
 * @returns {Array} Array of validation warnings
 */
function validateImagePaths(yamlData) {
  const warnings = [];
  
  yamlData.slides.forEach((slide, index) => {
    if (!slide.content) return;
    
    // Check different image field patterns
    const imageFields = ['image', 'images'];
    imageFields.forEach(field => {
      if (slide.content[field]) {
        const images = Array.isArray(slide.content[field]) ? slide.content[field] : [slide.content[field]];
        images.forEach(imagePath => {
          // Only warn for suspicious paths, not valid local paths
          if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('data:') && 
              !imagePath.startsWith('input/') && !imagePath.startsWith('assets/') && 
              !imagePath.startsWith('sample/') && !imagePath.startsWith('references/') &&
              !imagePath.includes('.jpg') && !imagePath.includes('.png') && !imagePath.includes('.webp')) {
            warnings.push(`Slide ${index + 1}: Image path '${imagePath}' may need verification`);
          }
        });
      }
    });
    
    // Check cards for images
    if (slide.content.cards) {
      slide.content.cards.forEach((card, cardIndex) => {
        // Only warn for suspicious paths, not valid local paths
        if (card.image && !card.image.startsWith('http') && !card.image.startsWith('data:') && 
            !card.image.startsWith('input/') && !card.image.startsWith('assets/') && 
            !card.image.startsWith('sample/') && !card.image.startsWith('references/') &&
            !card.image.includes('.jpg') && !card.image.includes('.png') && !card.image.includes('.webp')) {
          warnings.push(`Slide ${index + 1}, Card ${cardIndex + 1}: Image path '${card.image}' may need verification`);
        }
      });
    }
  });
  
  return warnings;
}

/**
 * Command line interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
AI-Powered YAML Generation System

Usage:
  node ai-generator.js --input <project> [--output <filename>] [--auto-build]

Options:
  --input <project>   Project directory name in input/ folder (e.g., 'pregen', 'sample-presentation')
  --output <filename> Output YAML filename (default: <project>.yaml)
  --auto-build        Automatically build presentation after generation
  --help, -h          Show this help message

Examples:
  node ai-generator.js --input pregen --auto-build
  node ai-generator.js --input sample-presentation --output custom-name.yaml
  node ai-generator.js --input pregen --output slides.yaml --auto-build

Project Structure:
  input/
  ├── pregen/
  │   ├── pregen.md        # Source document (auto-detected)
  │   └── assets/          # Images and resources
  │       ├── image_01.png
  │       └── image_02.png
  └── sample-presentation/
      ├── sample-presentation.md
      └── assets/
          └── sample_image.jpg

Environment Variables:
  OPENAI_API_KEY      OpenAI API key (required)
  
Setup:
  1. Create .env file: cp .env.example .env
  2. Edit .env with your OpenAI API key
  3. Get API key: https://platform.openai.com/api-keys
`);
    return;
  }

  // Parse command line arguments
  const options = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = args[i + 1];
        i++;
        break;
      case '--output':
        options.output = args[i + 1];
        i++;
        break;
      case '--auto-build':
        options.autoBuild = true;
        break;
    }
  }

  if (!options.input) {
    console.error('❌ Error: --input parameter is required');
    process.exit(1);
  }

  try {
    // Load project data
    const projectData = await loadProjectData(options.input);
    
    // Add project name to options for filename generation
    options.projectName = projectData.name;
    
    // Generate YAML with project context
    const result = await generateYAML(projectData.document, options, projectData);
    
    // Validate image paths
    const imageWarnings = validateImagePaths(result.generatedData);
    if (imageWarnings.length > 0) {
      console.log('\n⚠️  Image Path Warnings:');
      imageWarnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    console.log('\n🎉 Generation Summary:');
    console.log(`  Input: ${options.input}`);
    console.log(`  Output: ${result.fullPath}`);
    console.log(`  Slides: ${result.slideCount}`);
    console.log(`  Tokens: ${result.usage.total_tokens}`);
    
    if (options.autoBuild) {
      console.log('  Build: Completed');
    }
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateYAML,
  validateYAMLStructure,
  loadProjectData,
  findDocumentFile,
  scanAssetsDirectory,
  validateImagePaths,
  YAML_SCHEMA,
  CONTENT_SCHEMAS
};