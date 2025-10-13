/**
 * Script to generate app icons
 * This creates placeholder icons that you should replace with professional designs
 */

const fs = require('fs');
const path = require('path');

// SVG template for app icon
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#4CAF50" rx="${size * 0.22}"/>
  
  <!-- Letter R -->
  <text 
    x="50%" 
    y="50%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-weight="bold" 
    font-size="${size * 0.5}" 
    fill="white">
    R
  </text>
  
  <!-- Checkmark accent -->
  <path 
    d="M ${size * 0.7} ${size * 0.25} L ${size * 0.8} ${size * 0.35} L ${size * 0.65} ${size * 0.5}" 
    stroke="white" 
    stroke-width="${size * 0.05}" 
    fill="none" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    opacity="0.6"/>
</svg>
`;

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
const imagesDir = path.join(assetsDir, 'images');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Generate icons
const iconSizes = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'favicon.png': 48
};

console.log('📱 Generating app icons...\n');

Object.entries(iconSizes).forEach(([filename, size]) => {
  const svgContent = createIconSVG(size);
  const svgPath = path.join(assetsDir, filename.replace('.png', '.svg'));
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${filename.replace('.png', '.svg')} (${size}x${size})`);
});

console.log('\n✅ Icon SVG files created successfully!');
console.log('\n📝 Next steps:');
console.log('1. Convert SVG files to PNG using an online tool or image editor');
console.log('2. Place the PNG files in the assets folder');
console.log('3. Update app.json with icon paths\n');
console.log('💡 Tip: Use https://www.figma.com or https://www.canva.com for professional icons');
