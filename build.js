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
      process.exit(1);
    }
  }

  async getYamlFiles() {
    const files = await fs.readdir(this.contentDir);
    return files
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.join(this.contentDir, file));
  }

  async processYamlFile(yamlFilePath) {
    const filename = path.basename(yamlFilePath, path.extname(yamlFilePath));
    console.log(`🔄 Processing ${filename}...`);
    
    try {
      // Parse YAML content
      const yamlContent = await fs.readFile(yamlFilePath, 'utf8');
      const slideData = yaml.load(yamlContent);
      
      // Validate required fields
      if (!slideData.type) {
        throw new Error(`Missing required field 'type' in ${filename}`);
      }
      
      // Create presentation directory
      const presentationDir = path.join(this.presentationsDir, filename);
      await fs.ensureDir(presentationDir);
      
      // Create assets directory
      const assetsDir = path.join(presentationDir, 'assets');
      await fs.ensureDir(assetsDir);
      
      // Copy assets (images)
      await this.copyAssets(slideData, assetsDir);
      
      // Generate HTML
      const htmlContent = await this.generateHTML(slideData);
      
      // Write HTML file
      await fs.writeFile(path.join(presentationDir, 'index.html'), htmlContent);
      
      console.log(`✅ Generated ${filename}/index.html`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
      throw error;
    }
  }

  async copyAssets(slideData, assetsDir) {
    // Copy sample image by default
    const sampleImageSource = path.join(this.sampleDir, 'images', 'sample_image.jpg');
    const sampleImageDest = path.join(assetsDir, 'sample.jpg');
    
    if (await fs.pathExists(sampleImageSource)) {
      await fs.copy(sampleImageSource, sampleImageDest);
    }
    
    // TODO: Add logic to copy custom images specified in YAML
    // This would scan the slideData for image references and copy them
  }

  async generateHTML(slideData) {
    const css = await this.generateCSS(slideData);
    const js = await this.generateJS(slideData);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${slideData.title?.text || 'PreGen Presentation'}</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div id="presentation">
        ${this.generateSlideContent(slideData)}
    </div>
    <script>
        ${js}
    </script>
</body>
</html>`;
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
    
    const listItems = items.map((item, index) => {
      const delay = 0.3 + (index * 0.15); // Sequential animation
      return `<li class="list-item" style="animation-delay: ${delay}s;">${item}</li>`;
    }).join('');
    
    const listClass = items.length >= 6 ? 'list-content two-column' : 'list-content single-column';
    const rowCount = items.length >= 6 ? Math.ceil(items.length / 2) : items.length;
    const gridStyle = items.length >= 6 ? `style="grid-template-rows: repeat(${rowCount}, 1fr);"` : '';
    
    return `<div class="slide-container ${style} list-layout">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="content">
        <ul class="${listClass}" ${gridStyle}>
          ${listItems}
        </ul>
      </div>
    </div>`;
  }

  generateNumList(slideData) {
    const style = slideData.style || 'white';
    const items = slideData.content?.items || [];
    const title = slideData.title?.visible ? slideData.title.text : '';
    
    const listItems = items.map((item, index) => {
      const delay = 0.3 + (index * 0.15); // Sequential animation
      return `<li class="num-list-item" style="animation-delay: ${delay}s;">${item}</li>`;
    }).join('');
    
    const listClass = items.length >= 6 ? 'num-list-content two-column' : 'num-list-content single-column';
    const rowCount = items.length >= 6 ? Math.ceil(items.length / 2) : items.length;
    const gridStyle = items.length >= 6 ? `style="grid-template-rows: repeat(${rowCount}, 1fr);"` : '';
    
    return `<div class="slide-container ${style} num-list-layout">
      ${title ? `<h1 class="slide-title">${title}</h1>` : ''}
      <div class="content">
        <ol class="${listClass}" ${gridStyle}>
          ${listItems}
        </ol>
      </div>
    </div>`;
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
          ${card1.description ? `<p class="card-description">${card1.description}</p>` : ''}
        </div>
        <div class="card card-right fade-in-card-2">
          ${card2.image ? `<img src="${card2.image}" alt="${card2.title || ''}" class="card-image">` : ''}
          ${card2.title ? `<h3 class="card-title">${card2.title}</h3>` : ''}
          ${card2.description ? `<p class="card-description">${card2.description}</p>` : ''}
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
          ${card1.description ? `<p class="card-description">${card1.description}</p>` : ''}
        </div>
        <div class="card card-center fade-in-card-2">
          ${card2.image ? `<img src="${card2.image}" alt="${card2.title || ''}" class="card-image">` : ''}
          ${card2.title ? `<h3 class="card-title">${card2.title}</h3>` : ''}
          ${card2.description ? `<p class="card-description">${card2.description}</p>` : ''}
        </div>
        <div class="card card-right fade-in-card-3">
          ${card3.image ? `<img src="${card3.image}" alt="${card3.title || ''}" class="card-image">` : ''}
          ${card3.title ? `<h3 class="card-title">${card3.title}</h3>` : ''}
          ${card3.description ? `<p class="card-description">${card3.description}</p>` : ''}
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
      <div class="timeline-container">
        <div class="timeline-wrapper">
          <div class="timeline-line"></div>
          <div class="timeline-items">
            ${timelineItems}
          </div>
        </div>
        <div class="timeline-navigation">
          <div class="timeline-nav-hint">← → Arrow keys to navigate | ↓ Enter to continue</div>
        </div>
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
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
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
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
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

.timeline-layout .timeline-container {
    position: absolute;
    top: 25%;
    bottom: 20%;
    left: 0;
    right: 0;
    overflow: hidden;
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

/* Animations */
.fade-in {
    opacity: 0;
    animation: fadeIn 0.8s ease-out 0.5s forwards;
}

.fade-in-left {
    opacity: 0;
    animation: fadeInLeft 0.8s ease-out 0.5s forwards;
}

.fade-in-right {
    opacity: 0;
    animation: fadeInRight 0.8s ease-out 0.8s forwards;
}

.fade-in-1 {
    opacity: 0;
    animation: fadeIn 0.8s ease-out 0.5s forwards;
}

.fade-in-2 {
    opacity: 0;
    animation: fadeIn 0.8s ease-out 0.8s forwards;
}

.fade-in-3 {
    opacity: 0;
    animation: fadeIn 0.8s ease-out 1.1s forwards;
}

.fade-in-4 {
    opacity: 0;
    animation: fadeIn 0.8s ease-out 1.4s forwards;
}

.fade-in-after {
    opacity: 0;
    animation: fadeIn 0.8s ease-out 1.0s forwards;
}

.fade-in-card-1 {
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.5s forwards;
}

.fade-in-card-2 {
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.8s forwards;
}

.fade-in-card-3 {
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 1.1s forwards;
}

.fade-in-timeline {
    opacity: 0;
    animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

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
`;
  }

  async generateJS(slideData) {
    const isTimeline = slideData.type === 'timeline';
    
    return `
// PreGen-Minimal JavaScript
console.log('PreGen-Minimal presentation loaded');

// Initialize presentation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Presentation initialized');
    
    ${isTimeline ? this.generateTimelineJS() : ''}
    
    // Add any interactive features here
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F11' || (e.key === 'f' && e.ctrlKey)) {
            // Toggle fullscreen
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });
});
`;
  }

  generateTimelineJS() {
    return `
    // Timeline-specific JavaScript
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const timelineItems = document.querySelectorAll('.timeline-item');
    let currentIndex = 0;
    
    if (timelineWrapper && timelineItems.length > 0) {
        console.log('Timeline initialized with', timelineItems.length, 'items');
        
        function scrollToItem(index) {
            if (index >= 0 && index < timelineItems.length) {
                const item = timelineItems[index];
                const itemRect = item.getBoundingClientRect();
                const wrapperRect = timelineWrapper.getBoundingClientRect();
                const scrollLeft = timelineWrapper.scrollLeft + itemRect.left - wrapperRect.left - (wrapperRect.width / 2) + (itemRect.width / 2);
                
                timelineWrapper.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
                
                currentIndex = index;
                console.log('Scrolled to timeline item', index);
            }
        }
        
        // Keyboard navigation for timeline
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollToItem(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollToItem(currentIndex + 1);
            } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
                // Continue to next slide (this would be handled by slide navigation system)
                console.log('Continue to next slide requested');
            }
        });
        
        // Initialize scroll position to first item
        setTimeout(() => {
            scrollToItem(0);
        }, 1000);
    }
    `;
  }
}

// Run the build process
if (require.main === module) {
  const builder = new PreGenBuilder();
  builder.build().catch(console.error);
}

module.exports = PreGenBuilder;