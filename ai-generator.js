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
const readline = require('readline');

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
 * Generate YAML presentation with retry logic and error recovery
 * @param {string} inputText - The text content to convert
 * @param {Object} options - Generation options
 * @param {Object} projectData - Project data with assets information
 * @returns {Promise<Object>} Generated YAML content and metadata
 */
async function generateYAMLWithRetry(inputText, options = {}, projectData = null) {
  const maxAttempts = 3;
  let attempt = 0;
  let lastErrors = [];
  let lastWarnings = [];
  
  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`\n🤖 Generation Attempt ${attempt}/${maxAttempts}`);
      
      // Generate YAML
      const result = await generateYAML(inputText, options, projectData, lastErrors, lastWarnings);
      
      // Validate generated YAML
      const validationResult = validateYAMLStructure(result.generatedData);
      
      if (validationResult.valid) {
        console.log('✅ Validation successful!');
        return result;
      }
      
      // Store errors for next attempt
      lastErrors = validationResult.errors;
      lastWarnings = validationResult.warnings;
      
      // If this is the last attempt, don't prompt for retry
      if (attempt >= maxAttempts) {
        console.log(`\n❌ Maximum attempts (${maxAttempts}) reached.`);
        throw new Error(`Validation failed after ${maxAttempts} attempts:\n${lastErrors.join('\n')}`);
      }
      
      // Prompt user for retry (only if retry-on-error is enabled)
      if (options.retryOnError) {
        const shouldRetry = await promptUserRetry(lastErrors, lastWarnings, attempt);
        if (!shouldRetry) {
          console.log('🛑 User cancelled retry.');
          throw new Error(`User cancelled after ${attempt} attempt(s). Last errors:\n${lastErrors.join('\n')}`);
        }
      } else {
        // If retry-on-error is not enabled, fail immediately
        throw new Error(`Validation failed:\n${lastErrors.join('\n')}`);
      }
      
      // Add exponential backoff
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${backoffMs}ms before retry...`);
      await sleep(backoffMs);
      
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      // For API errors, also implement backoff
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      console.log(`⚠️  API Error: ${error.message}`);
      console.log(`⏳ Waiting ${backoffMs}ms before retry...`);
      await sleep(backoffMs);
    }
  }
  
  throw new Error(`Failed to generate valid YAML after ${maxAttempts} attempts`);
}

/**
 * Generate YAML presentation from input text using OpenAI API
 * @param {string} inputText - The text content to convert
 * @param {Object} options - Generation options
 * @param {Object} projectData - Project data with assets information
 * @param {Array} previousErrors - Previous validation errors for context
 * @param {Array} previousWarnings - Previous validation warnings for context
 * @returns {Promise<Object>} Generated YAML content and metadata
 */
async function generateYAML(inputText, options = {}, projectData = null, previousErrors = [], previousWarnings = []) {
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
    
    // Add error context if this is a retry
    const errorContext = formatErrorsForAI(previousErrors, previousWarnings);
    
    const contextualPrompt = `${SYSTEM_PROMPT}${projectContext}${errorContext}

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
 * Validate YAML structure against schema with detailed error reporting
 * @param {Object} data - YAML data to validate
 * @returns {Object} Validation result with detailed errors and warnings
 */
function validateYAMLStructure(data) {
  const errors = [];
  const warnings = [];
  
  // Basic structure validation
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  
  if (!data.slides || !Array.isArray(data.slides)) {
    errors.push('Missing or invalid slides array');
  }
  
  // Validate each slide with detailed content validation
  if (data.slides) {
    data.slides.forEach((slide, index) => {
      const slideNumber = index + 1;
      
      if (!slide.type || !YAML_SCHEMA.properties.slides.items.properties.type.enum.includes(slide.type)) {
        errors.push(`Slide ${slideNumber}: Invalid or missing type`);
      }
      
      if (!slide.style || !['black', 'white'].includes(slide.style)) {
        errors.push(`Slide ${slideNumber}: Invalid or missing style`);
      }
      
      // Detailed content validation based on slide type
      try {
        validateSlideContent(slide, slideNumber, errors, warnings);
      } catch (error) {
        errors.push(`Slide ${slideNumber}: Content validation failed - ${error.message}`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate content structure based on slide type (extracted from build.js)
 * @param {Object} slide - Slide data to validate
 * @param {number} slideNumber - Slide number for error reporting  
 * @param {Array} errors - Array to collect validation errors
 * @param {Array} warnings - Array to collect validation warnings
 */
function validateSlideContent(slide, slideNumber, errors, warnings) {
  const { type, content, title } = slide;
  
  switch (type) {
    case 'title-slide':
      if (!title?.text && !content?.author?.text && !content?.date?.text) {
        warnings.push(`Slide ${slideNumber}: Title slide has no visible content (title, author, or date)`);
      }
      break;
      
    case 'section-break':
      if (!content?.number && !content?.title) {
        warnings.push(`Slide ${slideNumber}: Section break missing number and title`);
      }
      break;
      
    case 'text-left':
    case 'text-center':
      if (!content?.text || content.text.trim() === '') {
        errors.push(`Slide ${slideNumber}: Text layout requires content.text field`);
      }
      break;
      
    case 'image-full':
    case 'image-1':
      if (!content?.image) {
        errors.push(`Slide ${slideNumber}: Image layout requires content.image field`);
      }
      break;
      
    case 'image-horizontal-2':
      if (!content?.image1 || !content?.image2) {
        errors.push(`Slide ${slideNumber}: Image horizontal layout requires content.image1 and content.image2 fields`);
      }
      break;
      
    case 'image-2x2':
      const requiredImages = ['image1', 'image2', 'image3', 'image4'];
      const missingImages = requiredImages.filter(img => !content?.[img]);
      if (missingImages.length > 0) {
        errors.push(`Slide ${slideNumber}: 2x2 layout missing required images: ${missingImages.join(', ')}`);
      }
      break;
      
    case 'image-text-horizontal':
    case 'image-text-vertical':
      if (!content?.image) {
        errors.push(`Slide ${slideNumber}: Image-text layout requires content.image field`);
      }
      if (!content?.text || content.text.trim() === '') {
        errors.push(`Slide ${slideNumber}: Image-text layout requires content.text field`);
      }
      break;
      
    case 'list':
    case 'num-list':
      if (!content?.items || !Array.isArray(content.items) || content.items.length === 0) {
        errors.push(`Slide ${slideNumber}: List layout requires content.items array`);
      }
      break;
      
    case 'card-2':
      if (!content?.cards || !Array.isArray(content.cards) || content.cards.length !== 2) {
        errors.push(`Slide ${slideNumber}: Card-2 layout requires exactly 2 cards`);
      }
      break;
      
    case 'card-3':
      if (!content?.cards || !Array.isArray(content.cards) || content.cards.length !== 3) {
        errors.push(`Slide ${slideNumber}: Card-3 layout requires exactly 3 cards`);
      }
      break;
      
    case 'timeline':
      if (!content?.events || !Array.isArray(content.events) || content.events.length === 0) {
        errors.push(`Slide ${slideNumber}: Timeline layout requires content.events array`);
      }
      break;
  }
}

/**
 * Format validation errors for AI consumption
 * @param {Array} errors - Array of validation error messages
 * @param {Array} warnings - Array of validation warning messages
 * @returns {string} Formatted error context for AI prompt
 */
function formatErrorsForAI(errors, warnings) {
  if (errors.length === 0 && warnings.length === 0) {
    return '';
  }
  
  let errorContext = '\n\nIMPORTANT: The previous generation had validation issues. Please fix these problems:\n\n';
  
  if (errors.length > 0) {
    errorContext += `VALIDATION ERRORS (must fix):\n`;
    errors.forEach((error, index) => {
      errorContext += `${index + 1}. ${error}\n`;
    });
  }
  
  if (warnings.length > 0) {
    errorContext += `\nVALIDATION WARNINGS (should improve):\n`;
    warnings.forEach((warning, index) => {
      errorContext += `${index + 1}. ${warning}\n`;
    });
  }
  
  errorContext += `\nPlease ensure:\n`;
  errorContext += `- All slide types and styles are valid\n`;
  errorContext += `- Required content fields are present for each layout type\n`;
  errorContext += `- Text fields are strings, not arrays or objects\n`;
  errorContext += `- Image paths reference actual available assets\n`;
  errorContext += `- Card arrays have the correct number of items\n`;
  errorContext += `- List and timeline layouts have proper item arrays\n`;
  
  return errorContext;
}

/**
 * Prompt user for retry confirmation
 * @param {Array} errors - Array of validation errors
 * @param {Array} warnings - Array of validation warnings
 * @param {number} attempt - Current attempt number
 * @returns {Promise<boolean>} Whether user wants to retry
 */
async function promptUserRetry(errors, warnings, attempt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log(`\n🚨 Validation Failed (Attempt ${attempt})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (errors.length > 0) {
      console.log('❌ ERRORS:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    rl.question('🔄 Would you like to retry with error correction? (Y/n): ', (answer) => {
      rl.close();
      const shouldRetry = answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no';
      resolve(shouldRetry);
    });
  });
}

/**
 * Sleep utility for exponential backoff
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  node ai-generator.js --input <project> [--output <filename>] [--auto-build] [--retry-on-error]

Options:
  --input <project>   Project directory name in input/ folder (e.g., 'pregen', 'sample-presentation')
  --output <filename> Output YAML filename (default: <project>.yaml)
  --auto-build        Automatically build presentation after generation
  --retry-on-error    Enable automatic retry with error correction (max 3 attempts)
  --help, -h          Show this help message

Examples:
  node ai-generator.js --input pregen --auto-build
  node ai-generator.js --input sample-presentation --output custom-name.yaml
  node ai-generator.js --input pregen --output slides.yaml --auto-build --retry-on-error

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
      case '--retry-on-error':
        options.retryOnError = true;
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
    
    // Generate YAML with project context (with retry logic if enabled)
    const result = options.retryOnError ? 
      await generateYAMLWithRetry(projectData.document, options, projectData) :
      await generateYAML(projectData.document, options, projectData);
    
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
  generateYAMLWithRetry,
  validateYAMLStructure,
  validateSlideContent,
  formatErrorsForAI,
  promptUserRetry,
  loadProjectData,
  findDocumentFile,
  scanAssetsDirectory,
  validateImagePaths,
  YAML_SCHEMA,
  CONTENT_SCHEMAS
};