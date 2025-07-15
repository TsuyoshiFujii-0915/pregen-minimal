#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class PreGenBuilder {
  constructor() {
    this.contentDir = path.join(__dirname, 'content');
    this.presentationsDir = path.join(__dirname, 'presentations');
    this.sampleDir = path.join(__dirname, 'sample');
  }

  async build() {
    try {
      console.log('🚀 Starting PreGen-Minimal build process...');
      
      // Pre-build system checks
      await this.performSystemChecks();
      
      // Ensure presentations directory exists
      await fs.ensureDir(this.presentationsDir);
      
      // Read all YAML files from content directory
      const yamlFiles = await this.getYamlFiles();
      
      if (yamlFiles.length === 0) {
        console.log('📁 No YAML files found in content directory');
        return;
      }
      
      console.log(`📄 Found ${yamlFiles.length} YAML file(s): ${yamlFiles.map(f => path.basename(f)).join(', ')}`);
      
      // Process each YAML file
      for (const yamlFile of yamlFiles) {
        await this.processYamlFile(yamlFile);
      }
      
      console.log('✅ Build process completed successfully!');
      console.log('🌐 Run "npm run preview" to view presentations');
      
    } catch (error) {
      console.error('❌ Build process failed:', error.message);
      
      // Enhanced error reporting with recovery suggestions
      this.reportBuildFailure(error);
      process.exit(1);
    }
  }

  /**
   * Perform comprehensive system checks before build process
   */
  async performSystemChecks() {
    console.log('🔍 Performing system checks...');
    const checks = [];
    
    // Check if content directory exists
    if (!(await fs.pathExists(this.contentDir))) {
      checks.push({ 
        type: 'error', 
        message: `Content directory not found: ${this.contentDir}`,
        solution: 'Create the content/ directory and add YAML presentation files'
      });
    }
    
    // Check if sample directory exists for fallback images
    if (!(await fs.pathExists(this.sampleDir))) {
      checks.push({ 
        type: 'warning', 
        message: `Sample directory not found: ${this.sampleDir}`,
        solution: 'Create sample/ directory with sample images for fallbacks'
      });
    } else {
      // Check for sample image
      const sampleImagePath = path.join(this.sampleDir, 'images', 'sample_image.jpg');
      if (!(await fs.pathExists(sampleImagePath))) {
        checks.push({ 
          type: 'warning', 
          message: `Sample image not found: ${sampleImagePath}`,
          solution: 'Add sample_image.jpg to sample/images/ for image fallbacks'
        });
      }
    }
    
    // Check Node.js modules
    try {
      require('js-yaml');
      require('fs-extra');
    } catch (error) {
      checks.push({ 
        type: 'error', 
        message: 'Required Node.js modules not found',
        solution: 'Run "npm install" to install dependencies'
      });
    }
    
    // Check write permissions for presentations directory
    try {
      await fs.ensureDir(this.presentationsDir);
      const testFile = path.join(this.presentationsDir, '.write-test');
      await fs.writeFile(testFile, 'test');
      await fs.remove(testFile);
    } catch (error) {
      checks.push({ 
        type: 'error', 
        message: `Cannot write to presentations directory: ${this.presentationsDir}`,
        solution: 'Check directory permissions or run with appropriate privileges'
      });
    }
    
    // Report checks
    const errors = checks.filter(c => c.type === 'error');
    const warnings = checks.filter(c => c.type === 'warning');
    
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} system warning(s):`);
      warnings.forEach(w => console.log(`   ${w.message} - ${w.solution}`));
    }
    
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} system error(s):`);
      errors.forEach(e => console.log(`   ${e.message} - ${e.solution}`));
      throw new Error(`System checks failed with ${errors.length} error(s)`);
    }
    
    if (warnings.length === 0 && errors.length === 0) {
      console.log('✅ All system checks passed');
    }
  }
  
  /**
   * Report build failure with enhanced error information and recovery suggestions
   * @param {Error} error - The error that caused the build failure
   */
  reportBuildFailure(error) {
    console.log('\n📋 Build Failure Report:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Categorize error types
    if (error.message.includes('YAML')) {
      console.log('🔍 Error Type: YAML Configuration Issue');
      console.log('💡 Suggestions:');
      console.log('   • Check YAML syntax and indentation');
      console.log('   • Verify all required fields are present');
      console.log('   • Validate slide types against supported layouts');
      console.log('   • Ensure content matches the slide type requirements');
    } else if (error.message.includes('Image') || error.message.includes('asset')) {
      console.log('🔍 Error Type: Asset/Image Issue');
      console.log('💡 Suggestions:');
      console.log('   • Check if referenced image files exist');
      console.log('   • Verify image file paths are correct');
      console.log('   • Ensure sample/ directory contains fallback images');
      console.log('   • Check file permissions for image files');
    } else if (error.message.includes('permission') || error.message.includes('EACCES')) {
      console.log('🔍 Error Type: File Permission Issue');
      console.log('💡 Suggestions:');
      console.log('   • Check directory write permissions');
      console.log('   • Run with appropriate user privileges');
      console.log('   • Ensure presentations/ directory is writable');
    } else if (error.message.includes('ENOENT') || error.message.includes('not found')) {
      console.log('🔍 Error Type: File/Directory Not Found');
      console.log('💡 Suggestions:');
      console.log('   • Create missing directories (content/, sample/, etc.)');
      console.log('   • Check file paths and names');
      console.log('   • Verify working directory is correct');
    } else {
      console.log('🔍 Error Type: General Build Error');
      console.log('💡 Suggestions:');
      console.log('   • Check Node.js version compatibility');
      console.log('   • Run "npm install" to update dependencies');
      console.log('   • Verify project structure is intact');
    }
    
    console.log('\n🔧 Recovery Steps:');
    console.log('   1. Review the error message above');
    console.log('   2. Apply suggested fixes');
    console.log('   3. Run "node build.js" again');
    console.log('   4. If issues persist, check file permissions and paths');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  async getYamlFiles() {
    const files = await fs.readdir(this.contentDir);
    return files
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.join(this.contentDir, file));
  }

  /**
   * Get comprehensive JSON schema for YAML validation
   * @returns {Object} JSON Schema for presentation YAML
   */
  getPresentationSchema() {
    return {
      type: "object",
      properties: {
        title: { 
          type: "string",
          minLength: 1,
          description: "Presentation title"
        },
        author: { 
          type: "string",
          description: "Presentation author"
        },
        date: { 
          type: "string", 
          description: "Presentation date"
        },
        slides: {
          type: "array",
          minItems: 1,
          description: "Array of presentation slides",
          items: {
            type: "object",
            properties: {
              type: {
                enum: [
                  "title-slide", "section-break", "text-left", "text-center",
                  "image-full", "image-1", "image-horizontal-2", "image-2x2",
                  "image-text-horizontal", "image-text-vertical",
                  "list", "num-list", "card-2", "card-3", "timeline"
                ],
                description: "Slide layout type"
              },
              style: {
                enum: ["black", "white"],
                description: "Slide theme style"
              },
              title: {
                type: "object",
                properties: {
                  visible: { type: "boolean" },
                  text: { type: "string" }
                },
                additionalProperties: false
              },
              subtitle: {
                type: "object", 
                properties: {
                  visible: { type: "boolean" },
                  text: { type: "string" }
                },
                additionalProperties: false
              },
              content: {
                type: "object",
                description: "Slide content varies by type"
                // Note: Content validation is layout-specific, handled separately
              }
            },
            required: ["type"],
            additionalProperties: false
          }
        }
      },
      required: ["slides"],
      additionalProperties: false
    };
  }
  
  /**
   * Validate YAML data against JSON schema
   * @param {Object} data - Parsed YAML data
   * @param {string} filename - File name for error reporting
   * @returns {Object} Validation result with errors and warnings
   */
  validateYamlSchema(data, filename) {
    const schema = this.getPresentationSchema();
    const errors = [];
    const warnings = [];
    
    // Basic type validation
    if (!data || typeof data !== 'object') {
      errors.push('YAML root must be an object');
      return { errors, warnings };
    }
    
    // Required fields validation
    if (!data.slides) {
      errors.push('Missing required "slides" field');
    } else if (!Array.isArray(data.slides)) {
      errors.push('Field "slides" must be an array');
    } else if (data.slides.length === 0) {
      errors.push('Field "slides" must contain at least one slide');
    }
    
    // Optional field validation with warnings
    if (!data.title || data.title.trim() === '') {
      warnings.push('Missing or empty "title" field');
    }
    
    if (!data.author || data.author.trim() === '') {
      warnings.push('Missing or empty "author" field');
    }
    
    if (!data.date || data.date.trim() === '') {
      warnings.push('Missing or empty "date" field');
    }
    
    // Validate slides array if present
    if (data.slides && Array.isArray(data.slides)) {
      data.slides.forEach((slide, index) => {
        const slideNum = index + 1;
        
        // Required type field
        if (!slide.type) {
          errors.push(`Slide ${slideNum}: Missing required "type" field`);
        } else {
          const validTypes = schema.properties.slides.items.properties.type.enum;
          if (!validTypes.includes(slide.type)) {
            errors.push(`Slide ${slideNum}: Invalid type "${slide.type}". Valid types: ${validTypes.join(', ')}`);
          }
        }
        
        // Optional style validation
        if (slide.style) {
          const validStyles = schema.properties.slides.items.properties.style.enum;
          if (!validStyles.includes(slide.style)) {
            errors.push(`Slide ${slideNum}: Invalid style "${slide.style}". Valid styles: ${validStyles.join(', ')}`);
          }
        }
        
        // Validate title structure if present
        if (slide.title && typeof slide.title !== 'object') {
          errors.push(`Slide ${slideNum}: Field "title" must be an object with "visible" and "text" properties`);
        }
        
        // Validate subtitle structure if present  
        if (slide.subtitle && typeof slide.subtitle !== 'object') {
          errors.push(`Slide ${slideNum}: Field "subtitle" must be an object with "visible" and "text" properties`);
        }
        
        // Content validation is layout-specific, handled in validateSlideContent
      });
    }
    
    return { errors, warnings };
  }

  /**
   * Parse YAML content for multi-slide presentations with schema validation
   * @param {string} yamlContent - Raw YAML content
   * @returns {Object} Normalized presentation data with metadata and slides array
   */
  parsePresentation(yamlContent) {
    try {
      const data = yaml.load(yamlContent);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid YAML: Expected object structure');
      }
      
      // Basic schema validation first
      const schemaValidation = this.validateYamlSchema(data, 'current file');
      if (schemaValidation.errors.length > 0) {
        throw new Error(`Schema validation failed:\n${schemaValidation.errors.map(e => `  • ${e}`).join('\n')}`);
      }
      
      // Expect multi-slide format only
      if (!data.slides || !Array.isArray(data.slides)) {
        throw new Error('Invalid YAML structure: Missing required "slides" array');
      }
      
      return {
        presentation: {
          title: data.title || 'Untitled Presentation',
          author: data.author || '',
          date: data.date || ''
        },
        slides: data.slides
      };
      
    } catch (error) {
      if (error.name === 'YAMLException') {
        throw new Error(`YAML parsing failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Enhanced validation for presentation data structure with comprehensive error handling
   * @param {Object} presentationData - Parsed presentation data
   * @param {string} filename - File name for error reporting
   */
  validatePresentationData(presentationData, filename) {
    const errors = [];
    const warnings = [];
    
    // Validate presentation metadata
    if (!presentationData.presentation) {
      errors.push(`Missing presentation metadata in ${filename}`);
    } else {
      // Validate metadata fields
      if (!presentationData.presentation.title || presentationData.presentation.title.trim() === '') {
        warnings.push(`Presentation title is empty or missing in ${filename}`);
      }
      if (!presentationData.presentation.author || presentationData.presentation.author.trim() === '') {
        warnings.push(`Presentation author is empty or missing in ${filename}`);
      }
    }

    // Validate slides array
    if (!presentationData.slides || !Array.isArray(presentationData.slides)) {
      errors.push(`Missing or invalid slides array in ${filename} - must be an array`);
      this.reportValidationResults(errors, warnings, filename);
      return; // Cannot continue without valid slides array
    }

    if (presentationData.slides.length === 0) {
      errors.push(`Presentation must contain at least one slide in ${filename}`);
    }

    // Enhanced slide validation
    const validLayouts = [
      'title-slide', 'section-break', 'text-left', 'text-center',
      'image-full', 'image-1', 'image-horizontal-2', 'image-2x2',
      'image-text-horizontal', 'image-text-vertical',
      'list', 'num-list', 'card-2', 'card-3', 'timeline'
    ];

    const validStyles = ['black', 'white'];
    
    presentationData.slides.forEach((slide, index) => {
      const slideNumber = index + 1;
      
      // Check required fields
      if (!slide.type) {
        errors.push(`Slide ${slideNumber}: Missing required "type" field in ${filename}`);
        return; // Skip further validation for this slide
      }

      // Validate slide type
      if (!validLayouts.includes(slide.type)) {
        errors.push(`Slide ${slideNumber}: Invalid layout type "${slide.type}" in ${filename}. Valid types: ${validLayouts.join(', ')}`);
      }

      // Validate slide style
      if (slide.style && !validStyles.includes(slide.style)) {
        errors.push(`Slide ${slideNumber}: Invalid style "${slide.style}" in ${filename}. Valid styles: ${validStyles.join(', ')}`);
      }
      
      // Content validation based on slide type
      try {
        this.validateSlideContent(slide, slideNumber, filename, errors, warnings);
      } catch (error) {
        errors.push(`Slide ${slideNumber}: Content validation failed - ${error.message}`);
      }
    });

    // Report all validation results
    this.reportValidationResults(errors, warnings, filename);
    
    if (errors.length > 0) {
      const errorSummary = `Validation failed for ${filename} with ${errors.length} error(s):\n${errors.map(e => `  • ${e}`).join('\n')}`;
      throw new Error(errorSummary);
    }
    
    console.log(`✅ Validated multi-slide presentation with ${presentationData.slides.length} slide(s)`);
  }
  
  /**
   * Validate content structure based on slide type
   * @param {Object} slide - Slide data to validate
   * @param {number} slideNumber - Slide number for error reporting  
   * @param {string} filename - File name for error reporting
   * @param {Array} errors - Array to collect validation errors
   * @param {Array} warnings - Array to collect validation warnings
   */
  validateSlideContent(slide, slideNumber, filename, errors, warnings) {
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
          errors.push(`Slide ${slideNumber}: Horizontal-2 layout requires content.image1 and content.image2 fields`);
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
        if (!content?.items || !Array.isArray(content.items)) {
          errors.push(`Slide ${slideNumber}: List layout requires content.items array`);
        } else if (content.items.length === 0) {
          warnings.push(`Slide ${slideNumber}: List layout has empty items array`);
        } else if (content.items.length > 12) {
          warnings.push(`Slide ${slideNumber}: List has ${content.items.length} items - consider splitting for better readability`);
        }
        break;
        
      case 'card-2':
        if (!content?.cards || !Array.isArray(content.cards)) {
          errors.push(`Slide ${slideNumber}: Card-2 layout requires content.cards array`);
        } else if (content.cards.length !== 2) {
          errors.push(`Slide ${slideNumber}: Card-2 layout requires exactly 2 cards, found ${content.cards.length}`);
        }
        break;
        
      case 'card-3':
        if (!content?.cards || !Array.isArray(content.cards)) {
          errors.push(`Slide ${slideNumber}: Card-3 layout requires content.cards array`);
        } else if (content.cards.length !== 3) {
          errors.push(`Slide ${slideNumber}: Card-3 layout requires exactly 3 cards, found ${content.cards.length}`);
        }
        break;
        
      case 'timeline':
        if (!content?.events || !Array.isArray(content.events)) {
          errors.push(`Slide ${slideNumber}: Timeline layout requires content.events array`);
        } else if (content.events.length === 0) {
          warnings.push(`Slide ${slideNumber}: Timeline layout has empty events array`);
        } else {
          // Validate timeline events
          content.events.forEach((event, eventIndex) => {
            if (!event.time && !event.title) {
              warnings.push(`Slide ${slideNumber}: Timeline event ${eventIndex + 1} missing time and title`);
            }
          });
        }
        break;
    }
  }
  
  /**
   * Report validation results with proper formatting
   * @param {Array} errors - Validation errors
   * @param {Array} warnings - Validation warnings  
   * @param {string} filename - File name for reporting
   */
  reportValidationResults(errors, warnings, filename) {
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} validation warning(s) for ${filename}:`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} validation error(s) for ${filename}:`);
      errors.forEach(error => console.log(`   ${error}`));
    }
  }

  async processYamlFile(yamlFilePath) {
    const filename = path.basename(yamlFilePath, path.extname(yamlFilePath));
    console.log(`🔄 Processing ${filename}...`);
    
    try {
      // Parse YAML content with multi-slide support
      const yamlContent = await fs.readFile(yamlFilePath, 'utf8');
      const presentationData = this.parsePresentation(yamlContent);
      
      // Validate presentation structure
      this.validatePresentationData(presentationData, filename);
      
      // Create presentation directory
      const presentationDir = path.join(this.presentationsDir, filename);
      await fs.ensureDir(presentationDir);
      
      // Create assets directory
      const assetsDir = path.join(presentationDir, 'assets');
      await fs.ensureDir(assetsDir);
      
      // Copy assets for all slides in presentation
      await this.copyAssetsForPresentation(presentationData, assetsDir);
      
      // Generate multi-slide HTML
      const htmlContent = await this.generatePresentationHTML(presentationData);
      
      // Write HTML file
      await fs.writeFile(path.join(presentationDir, 'index.html'), htmlContent);
      
      console.log(`✅ Generated ${filename}/index.html with ${presentationData.slides.length} slide(s)`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
      throw error;
    }
  }

  async copyAssetsForPresentation(presentationData, assetsDir) {
    // Copy sample image by default
    const sampleImageSource = path.join(this.sampleDir, 'images', 'sample_image.jpg');
    const sampleImageDest = path.join(assetsDir, 'sample.jpg');
    
    if (await fs.pathExists(sampleImageSource)) {
      await fs.copy(sampleImageSource, sampleImageDest);
    }
    
    // Collect all image references from all slides
    const imageReferences = new Set();
    
    presentationData.slides.forEach((slide, index) => {
      this.collectImageReferences(slide, imageReferences, index);
    });
    
    console.log(`📷 Found ${imageReferences.size} unique image reference(s)`);
    
    // Copy custom images if they exist
    for (const imageRef of imageReferences) {
      if (imageRef !== 'assets/sample.jpg') {
        await this.copyCustomImage(imageRef, assetsDir);
      }
    }
  }

  /**
   * Copy custom image with path resolution and error handling
   * @param {string} imageRef - Image reference from YAML content  
   * @param {string} assetsDir - Destination assets directory
   */
  async copyCustomImage(imageRef, assetsDir) {
    try {
      // Determine source path based on reference format
      let sourcePath;
      let destFilename;
      
      if (imageRef.startsWith('sample/')) {
        // Sample directory reference (e.g., "sample/images/sample_image.jpg")
        sourcePath = path.join(this.sampleDir, imageRef.substring('sample/'.length));
        destFilename = path.basename(imageRef);
      } else if (imageRef.startsWith('references/')) {
        // References directory reference (e.g., "references/reference_1.jpg")
        sourcePath = path.join(__dirname, imageRef);
        destFilename = path.basename(imageRef);
      } else if (path.isAbsolute(imageRef)) {
        // Absolute path reference
        sourcePath = imageRef;
        destFilename = path.basename(imageRef);
      } else {
        // Relative path reference - check in project root
        sourcePath = path.join(__dirname, imageRef);
        destFilename = path.basename(imageRef);
      }
      
      const destPath = path.join(assetsDir, destFilename);
      
      // Check if source file exists
      if (await fs.pathExists(sourcePath)) {
        // Copy image to assets directory
        await fs.copy(sourcePath, destPath);
        
        // Basic optimization: log file size
        const stats = await fs.stat(destPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`✅ Copied ${imageRef} → assets/${destFilename} (${fileSizeMB}MB)`);
        
        // Optional: Warn about large files
        if (stats.size > 2 * 1024 * 1024) { // 2MB threshold
          console.log(`⚠️  Large image file: ${destFilename} (${fileSizeMB}MB) - consider optimization`);
        }
        
      } else {
        // Handle missing files gracefully
        console.log(`❌ Image not found: ${imageRef} (${sourcePath})`);
        console.log(`📝 Creating placeholder for missing image: assets/${destFilename}`);
        
        // Copy sample image as fallback
        const sampleImageSource = path.join(this.sampleDir, 'images', 'sample_image.jpg');
        if (await fs.pathExists(sampleImageSource)) {
          await fs.copy(sampleImageSource, destPath);
          console.log(`🔄 Used sample image as fallback for ${destFilename}`);
        } else {
          console.log(`⚠️  No fallback image available for ${destFilename}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error copying image ${imageRef}:`, error.message);
      // Continue processing other images rather than failing the entire build
    }
  }

  collectImageReferences(slide, imageReferences, slideIndex) {
    const { type, content } = slide;
    
    switch (type) {
      case 'image-full':
      case 'image-1':
        if (content?.image) imageReferences.add(content.image);
        break;
        
      case 'image-horizontal-2':
        if (content?.image1) imageReferences.add(content.image1);
        if (content?.image2) imageReferences.add(content.image2);
        break;
        
      case 'image-2x2':
        if (content?.image1) imageReferences.add(content.image1);
        if (content?.image2) imageReferences.add(content.image2);
        if (content?.image3) imageReferences.add(content.image3);
        if (content?.image4) imageReferences.add(content.image4);
        break;
        
      case 'image-text-horizontal':
      case 'image-text-vertical':
        if (content?.image) imageReferences.add(content.image);
        break;
        
      case 'card-2':
      case 'card-3':
        if (content?.cards) {
          content.cards.forEach(card => {
            if (card.image) imageReferences.add(card.image);
          });
        }
        break;
    }
  }


  /**
   * Generate HTML for multi-slide presentation
   * @param {Object} presentationData - Normalized presentation data
   * @returns {string} Complete HTML content
   */
  async generatePresentationHTML(presentationData) {
    const css = await this.generatePresentationCSS(presentationData);
    const js = await this.generatePresentationJS(presentationData);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentationData.presentation.title}</title>
    <meta name="description" content="Generated with PreGen-Minimal">
    <meta name="author" content="${presentationData.presentation.author}">
    <style>
        ${css}
    </style>
</head>
<body>
    <div id="presentation-container" class="presentation-container">
        ${this.generateAllSlidesContent(presentationData)}
    </div>
    <script>
        ${js}
    </script>
</body>
</html>`;
  }

  /**
   * Generate content for all slides in presentation - Scroll-snap version
   * @param {Object} presentationData - Normalized presentation data
   * @returns {string} HTML content for all slides
   */
  generateAllSlidesContent(presentationData) {
    const slidesHTML = presentationData.slides.map((slide, index) => {
      return `
        <div class="slide-section" data-slide-index="${index}" data-slide-type="${slide.type}">
          ${this.generateSlideContent(slide)}
        </div>
      `;
    }).join('');

    return `<div class="slides-scroll-container">${slidesHTML}</div>`;
  }



  generateSlideContent(slideData) {
    const layoutType = slideData.type;
    const style = slideData.style || 'white';
    
    switch (layoutType) {
      case 'title-slide':
        return this.generateTitleSlide(slideData);
      case 'section-break':
        return this.generateSectionBreak(slideData);
      case 'text-left':
        return this.generateTextLeft(slideData);
      case 'text-center':
        return this.generateTextCenter(slideData);
      case 'image-full':
        return this.generateImageFull(slideData);
      case 'image-1':
        return this.generateImageSingle(slideData);
      case 'image-horizontal-2':
        return this.generateImageHorizontal2(slideData);
      case 'image-2x2':
        return this.generateImage2x2(slideData);
      case 'image-text-horizontal':
        return this.generateImageTextHorizontal(slideData);
      case 'image-text-vertical':
        return this.generateImageTextVertical(slideData);
      case 'list':
        return this.generateList(slideData);
      case 'num-list':
        return this.generateNumList(slideData);
      case 'card-2':
        return this.generateCard2(slideData);
      case 'card-3':
        return this.generateCard3(slideData);
      case 'timeline':
        return this.generateTimeline(slideData);
      default:
        return `<div class="slide-container ${style}">
          <div class="content">
            <h1>Layout "${layoutType}" not implemented yet</h1>
            <p>This layout will be implemented in the next phase.</p>
          </div>
        </div>`;
    }
  }

  generateTitleSlide(slideData) {
    const style = slideData.style || 'white';
    const title = slideData.title?.visible ? slideData.title.text : '';
    const subtitle = slideData.subtitle?.visible ? slideData.subtitle.text : '';
    const author = slideData.content?.author?.visible ? slideData.content.author.text : '';
    const date = slideData.content?.date?.visible ? slideData.content.date.text : '';
    
    return `<div class="slide-container ${style} title-slide">
      <div class="content">
        ${title ? `<h1 class="title">${title}</h1>` : ''}
        ${subtitle ? `<h2 class="subtitle">${subtitle}</h2>` : ''}
        ${author ? `<p class="author">${author}</p>` : ''}
        ${date ? `<p class="date">${date}</p>` : ''}
      </div>
    </div>`;
  }

  generateTextLeft(slideData) {
    const style = slideData.style || 'white';
    const title = slideData.title?.visible ? slideData.title.text : '';
    const content = slideData.content?.text || '';
    
    return `<div class="slide-container ${style} text-left">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="content">
        <div class="text-content fade-in">
          ${content}
        </div>
      </div>
    </div>`;
  }

  generateTextCenter(slideData) {
    const style = slideData.style || 'white';
    const title = slideData.title?.visible ? slideData.title.text : '';
    const content = slideData.content?.text || '';
    
    return `<div class="slide-container ${style} text-center">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="content">
        <div class="text-content fade-in">
          ${content}
        </div>
      </div>
    </div>`;
  }

  generateSectionBreak(slideData) {
    const style = slideData.style || 'black';
    const sectionNumber = slideData.content?.number || '01';
    const sectionTitle = slideData.content?.title || 'Section Title';
    
    return `<div class="slide-container ${style} section-break">
      <div class="content">
        <div class="section-number">${sectionNumber}</div>
        <div class="section-title">${sectionTitle}</div>
      </div>
    </div>`;
  }

  generateImageFull(slideData) {
    const style = slideData.style || 'white';
    const imageUrl = slideData.content?.image || 'assets/sample.jpg';
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    return `<div class="slide-container ${style} image-full">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="image-container">
        <img src="${imageUrl}" alt="Full screen image" class="full-image">
      </div>
    </div>`;
  }

  generateImageSingle(slideData) {
    const style = slideData.style || 'white';
    const imageUrl = slideData.content?.image || 'assets/sample.jpg';
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    return `<div class="slide-container ${style} image-single">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="content">
        <img src="${imageUrl}" alt="Single image" class="single-image">
      </div>
    </div>`;
  }

  generateImageHorizontal2(slideData) {
    const style = slideData.style || 'white';
    const image1 = slideData.content?.image1 || 'assets/sample.jpg';
    const image2 = slideData.content?.image2 || 'assets/sample.jpg';
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    return `<div class="slide-container ${style} image-horizontal-2">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="image-container-left">
        <img src="${image1}" alt="Image 1" class="horizontal-image fade-in-left">
      </div>
      <div class="image-container-right">
        <img src="${image2}" alt="Image 2" class="horizontal-image fade-in-right">
      </div>
    </div>`;
  }

  generateImage2x2(slideData) {
    const style = slideData.style || 'white';
    const image1 = slideData.content?.image1 || 'assets/sample.jpg';
    const image2 = slideData.content?.image2 || 'assets/sample.jpg';
    const image3 = slideData.content?.image3 || 'assets/sample.jpg';
    const image4 = slideData.content?.image4 || 'assets/sample.jpg';
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    return `<div class="slide-container ${style} image-2x2">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="grid-container">
        <div class="grid-item top-left">
          <img src="${image1}" alt="Image 1" class="grid-image fade-in-1">
        </div>
        <div class="grid-item top-right">
          <img src="${image2}" alt="Image 2" class="grid-image fade-in-2">
        </div>
        <div class="grid-item bottom-left">
          <img src="${image3}" alt="Image 3" class="grid-image fade-in-3">
        </div>
        <div class="grid-item bottom-right">
          <img src="${image4}" alt="Image 4" class="grid-image fade-in-4">
        </div>
      </div>
    </div>`;
  }

  generateImageTextHorizontal(slideData) {
    const style = slideData.style || 'white';
    const imageUrl = slideData.content?.image || 'assets/sample.jpg';
    const text = slideData.content?.text || '';
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    return `<div class="slide-container ${style} image-text-horizontal">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="image-container-left">
        <img src="${imageUrl}" alt="Image" class="image-text-image">
      </div>
      <div class="text-container-right">
        <div class="text-content fade-in-after">
          ${text}
        </div>
      </div>
    </div>`;
  }

  generateImageTextVertical(slideData) {
    const style = slideData.style || 'white';
    const imageUrl = slideData.content?.image || 'assets/sample.jpg';
    const text = slideData.content?.text || '';
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    return `<div class="slide-container ${style} image-text-vertical">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="image-container-top">
        <img src="${imageUrl}" alt="Image" class="image-text-image">
      </div>
      <div class="text-container-bottom">
        <div class="text-content fade-in-after">
          ${text}
        </div>
      </div>
    </div>`;
  }

  generateList(slideData) {
    const style = slideData.style || 'white';
    const items = slideData.content?.items || [];
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    // Calculate content density and scaling
    const contentDensity = this.calculateListContentDensity(items, title);
    const dynamicStyles = this.generateListDynamicStyles(contentDensity);
    
    const listItems = items.map((item, index) => {
      const delay = 0.3 + (index * 0.15); // Sequential animation
      return `<li class="list-item" style="animation-delay: ${delay}s;">${item}</li>`;
    }).join('');
    
    const isMultiColumn = items.length >= 6;
    const baseListClass = isMultiColumn ? 'list-content two-column' : 'list-content single-column';
    const scalingClass = contentDensity.requiresScaling ? 'dynamic-scaled' : '';
    const listClass = `${baseListClass} ${scalingClass}`.trim();
    
    const rowCount = isMultiColumn ? Math.ceil(items.length / 2) : items.length;
    const gridStyle = isMultiColumn ? `style="grid-template-rows: repeat(${rowCount}, 1fr);"` : '';
    
    return `<div class="slide-container ${style} list-layout">
      ${dynamicStyles}
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="content">
        <ul class="${listClass}" ${gridStyle}>
          ${listItems}
        </ul>
      </div>
    </div>`;
  }
  
  calculateListContentDensity(items, hasTitle) {
    const itemCount = items.length;
    const isMultiColumn = itemCount >= 6;
    const maxItemsPerColumn = isMultiColumn ? Math.ceil(itemCount / 2) : itemCount;
    
    // Calculate total content characteristics
    const totalLength = items.reduce((sum, item) => sum + item.length, 0);
    const averageLength = totalLength / itemCount;
    const longestItem = Math.max(...items.map(item => item.length));
    
    // Estimate space requirements (more aggressive scaling)
    const availableHeight = hasTitle ? 45 : 55; // Reduced available height for more realistic assessment
    const baseItemHeight = 10; // Increased base height per item
    
    // Adjust based on content length (longer items need more height due to wrapping)
    const lengthMultiplier = Math.min(1 + (averageLength - 30) / 80, 3); // More sensitive to length
    const estimatedItemHeight = baseItemHeight * lengthMultiplier;
    const requiredHeight = maxItemsPerColumn * estimatedItemHeight;
    
    // Calculate density factor (more aggressive threshold)
    const densityFactor = requiredHeight / availableHeight;
    const requiresScaling = densityFactor > 0.85; // Trigger scaling earlier
    
    return {
      itemCount,
      averageLength,
      longestItem,
      maxItemsPerColumn,
      densityFactor,
      requiresScaling,
      isMultiColumn
    };
  }
  
  generateListDynamicStyles(density) {
    if (!density.requiresScaling) {
      return ''; // No scaling needed
    }
    
    // Calculate scaling factors
    const scaleFactor = Math.min(0.95 / density.densityFactor, 1);
    
    // Progressive scaling with minimums
    const fontSizeScale = Math.max(0.65, scaleFactor); // Minimum 65% font size
    const lineHeightScale = Math.max(0.75, 0.8 + (scaleFactor - 0.8) * 0.5); // Compressed line height
    const marginScale = Math.max(0.4, scaleFactor * 0.7); // Reduced margins
    const gapScale = Math.max(0.5, scaleFactor * 0.8); // Reduced gap between columns
    
    // Calculate adjusted values
    const adjustedFontSize = (1.4 * fontSizeScale).toFixed(2);
    const adjustedLineHeight = (1.6 * lineHeightScale).toFixed(2);
    const adjustedMargin = (1.5 * marginScale).toFixed(2);
    const adjustedGap = density.isMultiColumn ? (2 * gapScale).toFixed(2) : '0';
    const adjustedBulletSize = (1.8 * fontSizeScale).toFixed(2);
    
    return `
    <style>
      /* Dynamic List Content Scaling for Dense Content */
      .list-content.dynamic-scaled .list-item {
        font-size: ${adjustedFontSize}rem !important;
        line-height: ${adjustedLineHeight} !important;
        margin-bottom: ${adjustedMargin}rem !important;
      }
      
      .list-content.dynamic-scaled.two-column {
        gap: ${adjustedGap}rem !important;
      }
      
      .list-content.dynamic-scaled .list-item::before {
        font-size: ${adjustedBulletSize}rem !important;
        line-height: ${adjustedLineHeight} !important;
      }
      
      /* Additional space optimization */
      .list-layout .content {
        padding: 0 !important;
      }
    </style>`;
  }

  generateNumList(slideData) {
    const style = slideData.style || 'white';
    const items = slideData.content?.items || [];
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    // Calculate content density and scaling for numbered lists
    const contentDensity = this.calculateListContentDensity(items, title);
    const dynamicStyles = this.generateNumListDynamicStyles(contentDensity);
    
    const listItems = items.map((item, index) => {
      const delay = 0.3 + (index * 0.15); // Sequential animation
      return `<li class="num-list-item" style="animation-delay: ${delay}s;">${item}</li>`;
    }).join('');
    
    const isMultiColumn = items.length >= 6;
    const baseListClass = isMultiColumn ? 'num-list-content two-column' : 'num-list-content single-column';
    const scalingClass = contentDensity.requiresScaling ? 'dynamic-scaled' : '';
    const listClass = `${baseListClass} ${scalingClass}`.trim();
    
    const rowCount = isMultiColumn ? Math.ceil(items.length / 2) : items.length;
    const gridStyle = isMultiColumn ? `style="grid-template-rows: repeat(${rowCount}, 1fr);"` : '';
    
    return `<div class="slide-container ${style} num-list-layout">
      ${dynamicStyles}
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="content">
        <ol class="${listClass}" ${gridStyle}>
          ${listItems}
        </ol>
      </div>
    </div>`;
  }
  
  generateNumListDynamicStyles(density) {
    if (!density.requiresScaling) {
      return ''; // No scaling needed
    }
    
    // Calculate scaling factors (same logic as bullet lists)
    const scaleFactor = Math.min(0.95 / density.densityFactor, 1);
    
    // Progressive scaling with minimums
    const fontSizeScale = Math.max(0.65, scaleFactor);
    const lineHeightScale = Math.max(0.75, 0.8 + (scaleFactor - 0.8) * 0.5);
    const marginScale = Math.max(0.4, scaleFactor * 0.7);
    const gapScale = Math.max(0.5, scaleFactor * 0.8);
    
    // Calculate adjusted values
    const adjustedFontSize = (1.4 * fontSizeScale).toFixed(2);
    const adjustedLineHeight = (1.6 * lineHeightScale).toFixed(2);
    const adjustedMargin = (1.5 * marginScale).toFixed(2);
    const adjustedGap = density.isMultiColumn ? (2 * gapScale).toFixed(2) : '0';
    
    return `
    <style>
      /* Dynamic Numbered List Content Scaling for Dense Content */
      .num-list-content.dynamic-scaled .num-list-item {
        font-size: ${adjustedFontSize}rem !important;
        line-height: ${adjustedLineHeight} !important;
        margin-bottom: ${adjustedMargin}rem !important;
      }
      
      .num-list-content.dynamic-scaled.two-column {
        gap: ${adjustedGap}rem !important;
      }
      
      /* Additional space optimization for numbered lists */
      .num-list-layout .content {
        padding: 0 !important;
      }
    </style>`;
  }

  generateCard2(slideData) {
    const style = slideData.style || 'white';
    const cards = slideData.content?.cards || [];
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    const card1 = cards[0] || {};
    const card2 = cards[1] || {};
    
    return `<div class="slide-container ${style} card-2-layout">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="card-container">
        <div class="card card-left fade-in-card-1">
          ${card1.image ? `<img src="${card1.image}" alt="${card1.title || ''}" class="card-image">` : ''}
          ${card1.title ? `<h3 class="card-title">${card1.title}</h3>` : ''}
          ${card1.description || card1.text ? `<p class="card-description">${card1.description || card1.text}</p>` : ''}
        </div>
        <div class="card card-right fade-in-card-2">
          ${card2.image ? `<img src="${card2.image}" alt="${card2.title || ''}" class="card-image">` : ''}
          ${card2.title ? `<h3 class="card-title">${card2.title}</h3>` : ''}
          ${card2.description || card2.text ? `<p class="card-description">${card2.description || card2.text}</p>` : ''}
        </div>
      </div>
    </div>`;
  }

  generateCard3(slideData) {
    const style = slideData.style || 'white';
    const cards = slideData.content?.cards || [];
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    const card1 = cards[0] || {};
    const card2 = cards[1] || {};
    const card3 = cards[2] || {};
    
    return `<div class="slide-container ${style} card-3-layout">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="card-container">
        <div class="card card-left fade-in-card-1">
          ${card1.image ? `<img src="${card1.image}" alt="${card1.title || ''}" class="card-image">` : ''}
          ${card1.title ? `<h3 class="card-title">${card1.title}</h3>` : ''}
          ${card1.description || card1.text ? `<p class="card-description">${card1.description || card1.text}</p>` : ''}
        </div>
        <div class="card card-center fade-in-card-2">
          ${card2.image ? `<img src="${card2.image}" alt="${card2.title || ''}" class="card-image">` : ''}
          ${card2.title ? `<h3 class="card-title">${card2.title}</h3>` : ''}
          ${card2.description || card2.text ? `<p class="card-description">${card2.description || card2.text}</p>` : ''}
        </div>
        <div class="card card-right fade-in-card-3">
          ${card3.image ? `<img src="${card3.image}" alt="${card3.title || ''}" class="card-image">` : ''}
          ${card3.title ? `<h3 class="card-title">${card3.title}</h3>` : ''}
          ${card3.description || card3.text ? `<p class="card-description">${card3.description || card3.text}</p>` : ''}
        </div>
      </div>
    </div>`;
  }

  generateTimeline(slideData) {
    const style = slideData.style || 'white';
    const events = slideData.content?.events || [];
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    const timelineItems = events.map((event, index) => {
      const delay = 0.5 + (index * 0.2);
      return `
        <div class="timeline-item fade-in-timeline" style="animation-delay: ${delay}s;">
          <div class="timeline-node"></div>
          <div class="timeline-time">${event.time || ''}</div>
          <div class="timeline-content">
            <h4 class="timeline-event-title">${event.title || ''}</h4>
            <p class="timeline-description">${event.description || ''}</p>
          </div>
        </div>
      `;
    }).join('');
    
    return `<div class="slide-container ${style} timeline-layout">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="timeline-scroll-container">
        <div class="timeline-wrapper">
          <div class="timeline-line"></div>
          <div class="timeline-items">
            ${timelineItems}
          </div>
        </div>
      </div>
      <div class="timeline-navigation">
        <div class="timeline-nav-hint">← → Arrow keys to navigate timeline | ↓ Next slide</div>
      </div>
    </div>`;
  }

  async generateCSS(slideData) {
    return `
/* Base Reset and Setup */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
}

/* Slide Container Base */
.slide-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* Theme Styles */
.slide-container.black {
    background-color: #050505;
    color: #FFFFFF;
}

.slide-container.white {
    background-color: #FFFFFF;
    color: #050505;
}

/* Title Slide Layout */
.title-slide .content {
    margin: 25% 15% 15% 15%;
    text-align: left;
}

.title-slide .title {
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.title-slide .subtitle {
    font-size: 2rem;
    font-weight: 400;
    margin-bottom: 2rem;
    line-height: 1.3;
}

.title-slide .author {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}

.title-slide .date {
    font-size: 1rem;
    opacity: 0.8;
}

/* Text Left Layout */
.text-left .slide-title {
    position: absolute;
    top: 3%;
    left: 15%;
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.text-left .content {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 50%;
    display: flex;
    align-items: center;
}

.text-left .text-content {
    font-size: 1.5rem;
    line-height: 1.6;
}

/* Text Center Layout */
.text-center .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.text-center .content {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 15%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.text-center .text-content {
    font-size: 1.5rem;
    line-height: 1.6;
}

/* Section Break Layout */
.section-break .content {
    margin: 25% 50% 25% 20%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
}

.section-break .section-number {
    font-size: 8rem;
    font-weight: 900;
    line-height: 0.8;
    margin-bottom: 1rem;
    opacity: 0.9;
}

.section-break .section-title {
    font-size: 3rem;
    font-weight: 600;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Image Full Layout */
.image-full .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 1.5rem 2.5rem;
}

.image-full .image-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.image-full .full-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

/* Image Single Layout */
.image-single .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.image-single .content {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 15%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-single .single-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
}

/* Image Horizontal 2 Layout */
.image-horizontal-2 .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.image-horizontal-2 .image-container-left {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 52%;
    overflow: hidden;
}

.image-horizontal-2 .image-container-right {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 52%;
    right: 15%;
    overflow: hidden;
}

.image-horizontal-2 .horizontal-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

/* Image 2x2 Grid Layout */
.image-2x2 .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.image-2x2 .grid-container {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 15%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
}

.image-2x2 .grid-item {
    overflow: hidden;
}

.image-2x2 .grid-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

/* Image + Text Horizontal Layout */
.image-text-horizontal .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.image-text-horizontal .image-container-left {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 55%;
    overflow: hidden;
}

.image-text-horizontal .text-container-right {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 55%;
    right: 15%;
    display: flex;
    align-items: center;
    padding: 2rem;
}

.image-text-horizontal .image-text-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
}

.image-text-horizontal .text-content {
    font-size: 1.4rem;
    line-height: 1.6;
}

/* Image + Text Vertical Layout */
.image-text-vertical .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.image-text-vertical .image-container-top {
    position: absolute;
    top: 20%;
    bottom: 40%;
    left: 15%;
    right: 15%;
    overflow: hidden;
}

.image-text-vertical .text-container-bottom {
    position: absolute;
    top: 65%;
    bottom: 15%;
    left: 15%;
    right: 15%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 1.5rem;
}

.image-text-vertical .image-text-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.image-text-vertical .text-content {
    font-size: 1.4rem;
    line-height: 1.6;
}

/* List Layout */
.list-layout .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.list-layout .content {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 15%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.list-content.single-column {
    list-style: none;
    padding: 0;
    width: 100%;
}

.list-content.two-column {
    list-style: none;
    padding: 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-flow: column;
    gap: 2rem;
}

.list-item {
    position: relative;
    padding-left: 2rem;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    line-height: 1.6;
    /* Initial state managed by JavaScript */
}

.list-item::before {
    content: "•";
    position: absolute;
    left: 0;
    top: 0;
    font-size: 1.8rem;
    line-height: 1.4;
    color: currentColor;
}

/* Numbered List Layout */
.num-list-layout .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.num-list-layout .content {
    position: absolute;
    top: 20%;
    bottom: 15%;
    left: 15%;
    right: 15%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.num-list-content.single-column {
    list-style: none;
    padding: 0;
    width: 100%;
    counter-reset: item;
}

.num-list-content.two-column {
    list-style: none;
    padding: 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-flow: column;
    gap: 2rem;
    counter-reset: item;
}

.num-list-item {
    position: relative;
    padding-left: 3rem;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    line-height: 1.6;
    /* Initial state managed by JavaScript */
    counter-increment: item;
}

.num-list-item::before {
    content: counter(item) ".";
    position: absolute;
    left: 0;
    top: 0;
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 1.6;
    color: currentColor;
    min-width: 2rem;
}

/* Card 2 Layout */
.card-2-layout .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.card-2-layout .card-container {
    position: absolute;
    top: 25%;
    bottom: 20%;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3rem;
}

.card-2-layout .card {
    flex: 1;
    max-width: 35%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0;
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.card-2-layout.black .card {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-2-layout .card:hover {
    transform: translateY(-5px);
}

.card-2-layout .card-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin: 0 auto 1.5rem auto;
    display: block;
}

.card-2-layout .card-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
    line-height: 1.3;
}

.card-2-layout .card-description {
    font-size: 1.1rem;
    line-height: 1.5;
    opacity: 0.9;
}

/* Card 3 Layout */
.card-3-layout .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.card-3-layout .card-container {
    position: absolute;
    top: 25%;
    bottom: 20%;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
}

.card-3-layout .card {
    flex: 1;
    max-width: 28%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.card-3-layout.black .card {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-3-layout .card:hover {
    transform: translateY(-5px);
}

.card-3-layout .card-image {
    width: 70px;
    height: 70px;
    object-fit: cover;
    margin: 0 auto 1.5rem auto;
    display: block;
}

.card-3-layout .card-title {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 1rem;
    line-height: 1.3;
}

.card-3-layout .card-description {
    font-size: 1rem;
    line-height: 1.5;
    opacity: 0.9;
}

/* Timeline Layout */
.timeline-layout .slide-title {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.2;
}

.timeline-layout .timeline-scroll-container {
    position: absolute;
    top: 25%;
    bottom: 20%;
    left: 0;
    right: 0;
    overflow: hidden;
    /* Prevent interference with main scroll container */
    z-index: 10;
}

.timeline-layout .timeline-wrapper {
    position: relative;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 2rem 0;
    scroll-behavior: smooth;
    /* Hide scrollbar */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.timeline-layout .timeline-wrapper::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.timeline-layout .timeline-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 4px;
    background: currentColor;
    opacity: 0.3;
    z-index: 1;
}

.timeline-layout .timeline-items {
    display: flex;
    position: relative;
    height: 100%;
    min-width: max-content;
    align-items: center;
    gap: 8rem;
    padding: 0 4rem;
    z-index: 2;
}

.timeline-layout .timeline-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 200px;
    max-width: 300px;
    opacity: 0;
}

.timeline-layout .timeline-node {
    width: 20px;
    height: 20px;
    background: currentColor;
    border-radius: 50%;
    position: relative;
    z-index: 3;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 1);
}

.timeline-layout.black .timeline-node {
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 1);
}

.timeline-layout .timeline-time {
    position: absolute;
    top: -3rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    opacity: 0.8;
    min-width: 100px;
}

.timeline-layout .timeline-content {
    position: absolute;
    top: 3rem;
    text-align: center;
    width: 100%;
}

.timeline-layout .timeline-event-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    line-height: 1.3;
}

.timeline-layout .timeline-description {
    font-size: 1rem;
    line-height: 1.4;
    opacity: 0.9;
}

.timeline-layout .timeline-navigation {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 100;
}

.timeline-layout .timeline-nav-hint {
    font-size: 0.9rem;
    opacity: 0.6;
    font-style: italic;
}

/* Animations handled by JavaScript Intersection Observer */

/* Responsive Design */
@media (max-width: 1024px) {
    .title-slide .title {
        font-size: 3rem;
    }
    
    .title-slide .subtitle {
        font-size: 1.5rem;
    }
    
    .text-left .text-content,
    .text-center .text-content {
        font-size: 1.2rem;
    }
    
    .section-break .section-number {
        font-size: 6rem;
    }
    
    .section-break .section-title {
        font-size: 2.5rem;
    }
    
    .text-left .slide-title,
    .text-center .slide-title,
    .image-full .slide-title,
    .image-single .slide-title,
    .image-horizontal-2 .slide-title,
    .image-2x2 .slide-title {
        font-size: 2.8rem;
    }
    
    .image-text-horizontal .slide-title,
    .image-text-vertical .slide-title {
        font-size: 2.8rem;
    }
    
    .image-text-horizontal .text-content,
    .image-text-vertical .text-content {
        font-size: 1.1rem;
    }
    
    .list-layout .slide-title,
    .num-list-layout .slide-title {
        font-size: 2.8rem;
    }
    
    .list-item,
    .num-list-item {
        font-size: 1.1rem;
    }
    
    .card-2-layout .slide-title,
    .card-3-layout .slide-title {
        font-size: 2.8rem;
    }
    
    .card-2-layout .card-title {
        font-size: 1.5rem;
    }
    
    .card-3-layout .card-title {
        font-size: 1.3rem;
    }
    
    .card-2-layout .card-description,
    .card-3-layout .card-description {
        font-size: 0.95rem;
    }
    
    .timeline-layout .slide-title {
        font-size: 2.8rem;
    }
    
    .timeline-layout .timeline-event-title {
        font-size: 1.2rem;
    }
    
    .timeline-layout .timeline-description {
        font-size: 0.9rem;
    }
    
    .timeline-layout .timeline-time {
        font-size: 1rem;
    }
}

@media (max-width: 768px) {
    .title-slide .title {
        font-size: 2.5rem;
    }
    
    .title-slide .subtitle {
        font-size: 1.2rem;
    }
    
    .text-left .text-content,
    .text-center .text-content {
        font-size: 1rem;
    }
    
    .section-break .section-number {
        font-size: 4rem;
    }
    
    .section-break .section-title {
        font-size: 2rem;
    }
    
    .text-left .slide-title,
    .text-center .slide-title,
    .image-full .slide-title,
    .image-single .slide-title,
    .image-horizontal-2 .slide-title,
    .image-2x2 .slide-title {
        font-size: 2.2rem;
    }
    
    .image-text-horizontal .slide-title,
    .image-text-vertical .slide-title {
        font-size: 2.2rem;
    }
    
    .image-text-horizontal .text-content,
    .image-text-vertical .text-content {
        font-size: 0.9rem;
    }
    
    .list-layout .slide-title,
    .num-list-layout .slide-title {
        font-size: 2.2rem;
    }
    
    .list-item,
    .num-list-item {
        font-size: 0.9rem;
    }
    
    .card-2-layout .slide-title,
    .card-3-layout .slide-title {
        font-size: 2.2rem;
    }
    
    .card-2-layout .card-title {
        font-size: 1.2rem;
    }
    
    .card-3-layout .card-title {
        font-size: 1.1rem;
    }
    
    .card-2-layout .card-description,
    .card-3-layout .card-description {
        font-size: 0.85rem;
    }
    
    .card-2-layout .card,
    .card-3-layout .card {
        padding: 1.5rem;
    }
    
    .card-2-layout .card-image {
        width: 60px;
        height: 60px;
    }
    
    .card-3-layout .card-image {
        width: 50px;
        height: 50px;
    }
    
    .timeline-layout .slide-title {
        font-size: 2.2rem;
    }
    
    .timeline-layout .timeline-event-title {
        font-size: 1.1rem;
    }
    
    .timeline-layout .timeline-description {
        font-size: 0.85rem;
    }
    
    .timeline-layout .timeline-time {
        font-size: 0.9rem;
    }
    
    .timeline-layout .timeline-items {
        gap: 6rem;
    }
    
    .timeline-layout .timeline-item {
        min-width: 150px;
        max-width: 250px;
    }
}

/* Removed legacy parallax and transition effects - incompatible with scroll-snap */

/* Content Layer Z-Index Management */
.content,
.slide-title {
    position: relative;
    z-index: 1;
}
}
`;
  }

  // Removed legacy generateJS() method - incompatible with scroll-snap concept

  // Removed generateTimelineJS() method - timeline navigation integrated into ScrollSnapNavigator

  /**
   * Generate CSS for multi-slide presentation (extends existing CSS with slide management)
   * @param {Object} presentationData - Normalized presentation data
   * @returns {string} Complete CSS with multi-slide support
   */
  async generatePresentationCSS(presentationData) {
    const baseCss = await this.generateCSS(presentationData.slides[0]); // Use first slide as template
    
    const multiSlideCss = `
/* Scroll-Snap Presentation Styles */
.presentation-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.slides-scroll-container {
    width: 100%;
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    
    /* Hide scrollbar but keep functionality */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
}

.slides-scroll-container::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
}

.slide-section {
    width: 100%;
    height: 100vh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    position: relative;
    display: flex;
    flex-direction: column;
    
    /* Ensure each slide takes full viewport */
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
}
}

/* Removed legacy presentation UI and parallax effects - not needed with scroll-snap */

/* Essential slide wrapper styles for scroll-snap */
.slide-wrapper {
    will-change: transform;
}

.slide-wrapper .slide-container {
    will-change: transform;
}

/* Animation states - Managed by JavaScript Intersection Observer */
`;

    return baseCss + multiSlideCss;
  }

  /**
   * Generate JavaScript for multi-slide presentation
   * @param {Object} presentationData - Normalized presentation data
   * @returns {string} Complete JavaScript with multi-slide navigation
   */
  async generatePresentationJS(presentationData) {
    const hasTimeline = presentationData.slides.some(slide => slide.type === 'timeline');
    
    return `
// PreGen-Minimal Multi-Slide Presentation
console.log('PreGen-Minimal multi-slide presentation loaded');

// Presentation configuration
const PRESENTATION_CONFIG = {
    totalSlides: ${presentationData.slides.length},
    slides: ${JSON.stringify(presentationData.slides.map(slide => ({ type: slide.type, style: slide.style || 'white' })))}
};

// Scroll-Snap Navigation System
class ScrollSnapNavigator {
    constructor(config) {
        this.config = config;
        this.currentSlide = 0;
        this.scrollContainer = null;
        this.slideElements = [];
        this.init();
    }
    
    init() {
        console.log('Scroll-snap navigator initializing...');
        this.scrollContainer = document.querySelector('.slides-scroll-container');
        this.slideElements = document.querySelectorAll('.slide-section');
        this.setupScrollTracking();
        this.setupKeyboardNavigation();
        this.setupResponsiveHandling();
        this.setupAnimationObserver();
        
        console.log(\`Scroll-snap navigator initialized with \${this.config.totalSlides} slides\`);
    }
    
    setupScrollTracking() {
        if (!this.scrollContainer) return;
        
        let scrollTimeout;
        this.scrollContainer.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateCurrentSlideFromScroll();
            }, 100);
        });
    }
    
    updateCurrentSlideFromScroll() {
        if (!this.scrollContainer) return;
        
        const scrollTop = this.scrollContainer.scrollTop;
        const slideHeight = window.innerHeight;
        const newSlide = Math.round(scrollTop / slideHeight);
        
        if (newSlide !== this.currentSlide && newSlide >= 0 && newSlide < this.config.totalSlides) {
            this.currentSlide = newSlide;
        }
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Check if current slide is timeline for special handling
            const currentSlideElement = this.slideElements[this.currentSlide];
            const isTimelineSlide = currentSlideElement && 
                currentSlideElement.getAttribute('data-slide-type') === 'timeline';
            
            switch(e.key) {
                case 'ArrowDown':
                case 'Space':
                case 'PageDown':
                case 'Enter':
                    e.preventDefault();
                    this.scrollToSlide(this.currentSlide + 1);
                    break;
                    
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    this.scrollToSlide(this.currentSlide - 1);
                    break;
                    
                case 'ArrowRight':
                    e.preventDefault();
                    if (isTimelineSlide) {
                        this.navigateTimelineRight();
                    } else {
                        this.scrollToSlide(this.currentSlide + 1);
                    }
                    break;
                    
                case 'ArrowLeft':
                    e.preventDefault();
                    if (isTimelineSlide) {
                        this.navigateTimelineLeft();
                    } else {
                        this.scrollToSlide(this.currentSlide - 1);
                    }
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    if (isTimelineSlide) {
                        this.navigateTimelineHome();
                    } else {
                        this.scrollToSlide(0);
                    }
                    break;
                    
                case 'End':
                    e.preventDefault();
                    if (isTimelineSlide) {
                        this.navigateTimelineEnd();
                    } else {
                        this.scrollToSlide(this.config.totalSlides - 1);
                    }
                    break;
                    
                case 'F11':
                case 'f':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                    
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        });
    }
    
    // Timeline navigation methods
    navigateTimelineRight() {
        const timelineContainer = this.getCurrentTimelineContainer();
        if (timelineContainer) {
            const scrollAmount = 300; // Adjust scroll distance
            timelineContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
    
    navigateTimelineLeft() {
        const timelineContainer = this.getCurrentTimelineContainer();
        if (timelineContainer) {
            const scrollAmount = 300;
            timelineContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    }
    
    navigateTimelineHome() {
        const timelineContainer = this.getCurrentTimelineContainer();
        if (timelineContainer) {
            timelineContainer.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }
    
    navigateTimelineEnd() {
        const timelineContainer = this.getCurrentTimelineContainer();
        if (timelineContainer) {
            timelineContainer.scrollTo({ 
                left: timelineContainer.scrollWidth - timelineContainer.clientWidth, 
                behavior: 'smooth' 
            });
        }
    }
    
    getCurrentTimelineContainer() {
        const currentSlide = this.slideElements[this.currentSlide];
        if (currentSlide && currentSlide.getAttribute('data-slide-type') === 'timeline') {
            return currentSlide.querySelector('.timeline-wrapper');
        }
        return null;
    }
    
    applyDynamicListScaling(slide, viewport) {
        const listItems = slide.querySelectorAll('li');
        const hasTitle = slide.querySelector('.slide-title');
        
        if (listItems.length === 0) return;
        
        // Calculate content density
        const totalContentLength = Array.from(listItems).reduce((total, item) => 
            total + (item.textContent?.length || 0), 0);
        const averageLength = totalContentLength / listItems.length;
        const availableHeight = hasTitle ? viewport.height * 0.45 : viewport.height * 0.55;
        const baseItemHeight = 45; // Base height per item in pixels
        
        const densityFactor = (listItems.length * baseItemHeight) / availableHeight;
        const lengthMultiplier = Math.min(1 + (averageLength - 30) / 80, 3);
        const finalDensity = densityFactor * lengthMultiplier;
        
        if (finalDensity > 0.85) {
            const scaleFactor = Math.max(0.65, 0.85 / finalDensity);
            const fontSize = Math.max(0.9, 1.4 * scaleFactor);
            const lineHeight = Math.max(1.2, 1.6 * (0.75 + scaleFactor * 0.25));
            
            // Apply scaling
            const listContainer = slide.querySelector('.list-content, .num-list-content');
            if (listContainer) {
                listContainer.style.fontSize = fontSize + 'rem';
                listContainer.style.lineHeight = lineHeight;
                
                console.log(\`Applied list scaling: \${fontSize.toFixed(2)}rem font, \${lineHeight.toFixed(2)} line-height\`);
            }
        }
    }
    
    adjustCardSizing(slide, viewport) {
        const cards = slide.querySelectorAll('.card');
        const cardType = slide.getAttribute('data-slide-type');
        
        if (cards.length === 0) return;
        
        // Calculate optimal card sizing based on viewport
        const availableWidth = viewport.width * 0.7; // Account for margins
        const cardCount = cards.length;
        const optimalCardWidth = Math.min(300, availableWidth / cardCount - 40); // 40px for gaps
        
        // Apply responsive sizing
        cards.forEach(card => {
            if (optimalCardWidth < 250) {
                // Compact mode for smaller screens
                card.style.minWidth = optimalCardWidth + 'px';
                card.style.fontSize = '0.9rem';
                
                const cardImage = card.querySelector('img');
                if (cardImage) {
                    cardImage.style.height = '60px';
                }
            }
        });
        
        console.log(\`Adjusted \${cardType} cards for \${viewport.width}px viewport\`);
    }
    
    setupAnimationObserver() {
        // Create intersection observer for slide animations
        const observerOptions = {
            root: this.scrollContainer,
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of slide is visible (much earlier trigger)
        };
        
        this.slideObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const slide = entry.target;
                const slideType = slide.getAttribute('data-slide-type');
                const slideIndex = parseInt(slide.getAttribute('data-slide-index'));
                
                if (entry.isIntersecting) {
                    console.log(\`🎬 ENTERING slide \${slideIndex}: \${slideType}\`);
                    
                    // Reset X-axis when entering new slide
                    this.resetHorizontalScroll();
                    
                    // Add a small delay to ensure reset is complete before animation
                    setTimeout(() => {
                        this.triggerSlideAnimations(slide, slideType);
                        console.log(\`🎯 TRIGGERING animations for slide \${slideIndex}: \${slideType}\`);
                    }, 150);
                    
                } else {
                    console.log(\`🔄 LEAVING slide \${slideIndex}: \${slideType}\`);
                    // Reset animations when leaving slide for re-entry
                    this.resetSlideAnimations(slide, slideType);
                }
            });
        }, observerOptions);
        
        // Observe all slide sections
        this.slideElements.forEach(slide => {
            this.slideObserver.observe(slide);
        });
    }
    
    triggerSlideAnimations(slide, slideType) {
        // Apply layout-specific entrance animations
        switch (slideType) {
            case 'title-slide':
            case 'section-break':
                // No animations for these layouts (as per specification)
                break;
                
            case 'text-left':
            case 'text-center':
                this.animateTextContent(slide);
                break;
                
            case 'image-full':
            case 'image-1':
                // Ensure images are visible (no animations, just show)
                this.showStaticImages(slide);
                break;
                
            case 'image-horizontal-2':
                this.animateImageSequence(slide, 'horizontal');
                break;
                
            case 'image-2x2':
                this.animateImageGrid(slide);
                break;
                
            case 'image-text-horizontal':
            case 'image-text-vertical':
                this.animateImageTextLayout(slide);
                break;
                
            case 'list':
            case 'num-list':
                this.animateListItems(slide);
                break;
                
            case 'card-2':
            case 'card-3':
                this.animateCardLayout(slide);
                break;
                
            case 'timeline':
                this.animateTimeline(slide);
                break;
                
            default:
                console.warn(\`Unknown slide type: \${slideType}\`);
        }
    }
    
    animateTextContent(slide) {
        const textContent = slide.querySelector('.text-content');
        if (textContent) {
            console.log('🎯 Found text content element for animation:', textContent);
            
            // Reset to initial state first
            textContent.style.transition = 'none';
            textContent.style.opacity = '0';
            textContent.style.setProperty('transform', 'translateY(20px)', 'important');
            
            // Force reflow
            textContent.offsetHeight;
            
            setTimeout(() => {
                console.log('🎯 Starting text content animation');
                textContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                textContent.style.opacity = '1';
                textContent.style.setProperty('transform', 'translateY(0)', 'important');
                console.log('✅ Text content animation applied');
            }, 100);
        } else {
            console.warn('⚠️ No .text-content element found in slide:', slide.innerHTML.substring(0, 200));
        }
    }
    
    showStaticImages(slide) {
        const images = slide.querySelectorAll('img');
        console.log(\`Found \${images.length} static images to show:\`, images);
        
        images.forEach((img, index) => {
            console.log(\`Making static image \${index + 1} visible\`);
            img.style.transition = 'none';
            img.style.opacity = '1';
            img.style.transform = 'none';
            console.log(\`Static image \${index + 1} shown\`);
        });
    }
    
    animateImageSequence(slide, direction) {
        const images = slide.querySelectorAll('img');
        images.forEach((img, index) => {
            img.style.opacity = '0';
            img.style.transform = direction === 'horizontal' ? 'translateX(-30px)' : 'translateY(30px)';
            
            setTimeout(() => {
                img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                img.style.opacity = '1';
                img.style.transform = 'translate(0)';
            }, index * 150 + 200);
        });
    }
    
    animateImageGrid(slide) {
        const images = slide.querySelectorAll('img');
        images.forEach((img, index) => {
            img.style.opacity = '0';
            img.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                img.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            }, index * 100 + 200);
        });
    }
    
    animateImageTextLayout(slide) {
        const image = slide.querySelector('img');
        const textContent = slide.querySelector('.text-content');
        
        if (image) {
            image.style.opacity = '1'; // Image appears immediately
        }
        
        if (textContent) {
            console.log('🎯 Found image-text content element for animation:', textContent);
            
            // Reset to initial state first
            textContent.style.transition = 'none';
            textContent.style.opacity = '0';
            textContent.style.setProperty('transform', 'translateY(20px)', 'important');
            
            // Force reflow
            textContent.offsetHeight;
            
            setTimeout(() => {
                console.log('🎯 Starting image-text content animation');
                textContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                textContent.style.opacity = '1';
                textContent.style.setProperty('transform', 'translateY(0)', 'important');
                console.log('✅ Image-text content animation applied');
            }, 300);
        } else {
            console.warn('⚠️ No .text-content element found in image-text slide:', slide.innerHTML.substring(0, 200));
        }
    }
    
    animateListItems(slide) {
        const listItems = slide.querySelectorAll('li');
        console.log(\`📝 Found \${listItems.length} list items in slide:\`, slide);
        console.log(\`📝 List item elements:\`, listItems);
        
        if (listItems.length === 0) {
            console.warn('⚠️ No list items found for animation in slide:', slide.innerHTML.substring(0, 200));
            return;
        }
        
        listItems.forEach((item, index) => {
            console.log(\`📄 Animating list item \${index + 1}/\${listItems.length}:\`, item);
            
            // Reset to initial state first
            item.style.transition = 'none';
            item.style.opacity = '0';
            item.style.transform = 'translateY(15px)';
            
            // Force reflow
            item.offsetHeight;
            
            setTimeout(() => {
                console.log(\`🎯 Starting animation for list item \${index + 1}\`);
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                console.log(\`✅ List item \${index + 1} animation CSS applied\`);
            }, index * 100 + 300); // Increased delay
        });
    }
    
    animateCardLayout(slide) {
        const cards = slide.querySelectorAll('.card');
        console.log(\`🃏 Found \${cards.length} cards in slide:\`, slide);
        console.log(\`🃏 Card elements:\`, cards);
        
        if (cards.length === 0) {
            console.warn('⚠️ No cards found for animation in slide:', slide.innerHTML.substring(0, 200));
            return;
        }
        
        cards.forEach((card, index) => {
            console.log(\`🎴 Animating card \${index + 1}/\${cards.length}:\`, card);
            
            // Reset to initial state first - DRAMATIC ANIMATION
            card.style.transition = 'none';
            card.style.opacity = '0';
            card.style.setProperty('transform', 'translateY(80px) scale(0.7)', 'important');
            
            // Force reflow
            card.offsetHeight;
            
            setTimeout(() => {
                console.log(\`🎯 Starting DRAMATIC animation for card \${index + 1}\`);
                card.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bounce effect
                card.style.opacity = '1';
                card.style.setProperty('transform', 'translateY(0) scale(1)', 'important');
                console.log(\`✅ Card \${index + 1} DRAMATIC animation CSS applied\`);
            }, index * 300 + 400); // Increased delay for visibility
        });
    }
    
    animateTimeline(slide) {
        const timelineItems = slide.querySelectorAll('.timeline-item');
        console.log(\`⏰ Found \${timelineItems.length} timeline items for DRAMATIC animation\`);
        
        timelineItems.forEach((item, index) => {
            // DRAMATIC initial state
            item.style.transition = 'none';
            item.style.opacity = '0';
            item.style.setProperty('transform', 'translateX(-100px) scale(0.8)', 'important');
            
            // Force reflow
            item.offsetHeight;
            
            setTimeout(() => {
                console.log(\`🎯 Starting DRAMATIC timeline animation for item \${index + 1}\`);
                item.style.transition = 'all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)'; // Elastic effect
                item.style.opacity = '1';
                item.style.setProperty('transform', 'translateX(0) scale(1)', 'important');
                console.log(\`✅ Timeline item \${index + 1} DRAMATIC animation applied\`);
            }, index * 250 + 300); // Longer delay for dramatic effect
        });
    }
    
    resetSlideAnimations(slide, slideType) {
        // Reset all animatable elements to initial state
        const animatableElements = slide.querySelectorAll('.text-content, .list-item, .num-list-item, .card, .timeline-item, img');
        
        animatableElements.forEach(element => {
            element.style.transition = 'none';
            element.style.opacity = '0';
            
            // Reset transforms based on element type with !important - DRAMATIC
            if (element.classList.contains('card')) {
                element.style.setProperty('transform', 'translateY(80px) scale(0.7)', 'important');
            } else if (element.classList.contains('text-content') || 
                element.classList.contains('list-item') || 
                element.classList.contains('num-list-item')) {
                element.style.setProperty('transform', 'translateY(30px)', 'important');
            } else if (element.classList.contains('timeline-item')) {
                element.style.setProperty('transform', 'translateX(-100px) scale(0.8)', 'important');
            } else if (element.tagName === 'IMG') {
                // Different transforms based on slide type with !important
                if (slideType === 'image-horizontal-2') {
                    element.style.setProperty('transform', 'translateX(-30px)', 'important');
                } else if (slideType === 'image-2x2') {
                    element.style.setProperty('transform', 'scale(0.8)', 'important');
                } else {
                    element.style.setProperty('transform', 'translateY(30px)', 'important');
                }
            }
            
            // Force reflow to apply initial state
            element.offsetHeight;
            
            // Re-enable transitions after reset
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease-out';
            }, 50);
        });
        
        console.log(\`🔄 Reset \${animatableElements.length} elements in \${slideType} slide\`);
    }
    
    scrollToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.config.totalSlides) return;
        
        const targetY = slideIndex * window.innerHeight;
        this.scrollContainer.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });
    }
    
    
    setupResponsiveHandling() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }
    
    
    handleResize() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        };
        
        if (viewport.ratio < 1.2) {
            console.warn('Consider using landscape orientation for optimal experience');
        }
        
        // Dynamic font scaling
        const baseSize = Math.min(viewport.width / 100, viewport.height / 60);
        document.documentElement.style.fontSize = baseSize + 'px';
        
        // Apply responsive layout adjustments
        this.adjustLayoutForViewport(viewport);
        
        // Reset horizontal scroll for all slides
        this.resetHorizontalScroll();
    }
    
    adjustLayoutForViewport(viewport) {
        // Calculate safe margins to ensure content fits
        const safeMarginTop = Math.max(10, Math.min(20, viewport.height * 0.15));
        const safeMarginBottom = Math.max(10, Math.min(15, viewport.height * 0.1));
        const safeMarginHorizontal = Math.max(15, Math.min(25, viewport.width * 0.1));
        
        // Update CSS custom properties for dynamic sizing
        document.documentElement.style.setProperty('--safe-margin-top', safeMarginTop + 'px');
        document.documentElement.style.setProperty('--safe-margin-bottom', safeMarginBottom + 'px'); 
        document.documentElement.style.setProperty('--safe-margin-horizontal', safeMarginHorizontal + 'px');
        document.documentElement.style.setProperty('--viewport-width', viewport.width + 'px');
        document.documentElement.style.setProperty('--viewport-height', viewport.height + 'px');
        
        // Trigger content scaling for specific layouts
        this.scaleContentForViewport(viewport);
    }
    
    scaleContentForViewport(viewport) {
        // List layouts: dynamic scaling based on content density
        const listSlides = document.querySelectorAll('.slide-section[data-slide-type="list"], .slide-section[data-slide-type="num-list"]');
        listSlides.forEach(slide => {
            this.applyDynamicListScaling(slide, viewport);
        });
        
        // Card layouts: ensure cards fit properly
        const cardSlides = document.querySelectorAll('.slide-section[data-slide-type^="card-"]');
        cardSlides.forEach(slide => {
            this.adjustCardSizing(slide, viewport);
        });
    }
    
    resetHorizontalScroll() {
        // Reset horizontal scroll position to prevent X-axis drift
        if (this.scrollContainer) {
            this.scrollContainer.scrollLeft = 0;
        }
        
        // Reset horizontal scroll for timeline containers
        const timelineContainers = document.querySelectorAll('.timeline-scroll-container');
        timelineContainers.forEach(container => {
            container.scrollLeft = 0;
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}

// Initialize the scroll-snap presentation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const navigator = new ScrollSnapNavigator(PRESENTATION_CONFIG);
    
    // Expose navigator globally for debugging
    window.presentationNavigator = navigator;
});
`;
  }

}

// Run the build process
if (require.main === module) {
  const builder = new PreGenBuilder();
  builder.build().catch(console.error);
}

module.exports = PreGenBuilder;
