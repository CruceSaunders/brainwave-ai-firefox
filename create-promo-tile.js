const sharp = require('sharp');
const path = require('path');

// Create promotional tile for Chrome Web Store (440x280)
async function createPromoTile() {
  const width = 440;
  const height = 280;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Icon circle -->
      <circle cx="70" cy="140" r="45" fill="white" opacity="0.95"/>
      <text x="70" y="155" 
            text-anchor="middle" 
            font-family="Arial, sans-serif" 
            font-weight="bold"
            font-size="50px" 
            fill="#667eea">B</text>
      
      <!-- Title -->
      <text x="140" y="100" 
            font-family="Arial, sans-serif" 
            font-weight="bold"
            font-size="32px" 
            fill="white">BrainWave AI</text>
      
      <!-- Subtitle -->
      <text x="140" y="135" 
            font-family="Arial, sans-serif" 
            font-size="16px" 
            fill="white" opacity="0.9">AI Browser Assistant</text>
      
      <!-- Features -->
      <text x="140" y="175" 
            font-family="Arial, sans-serif" 
            font-size="14px" 
            fill="white" opacity="0.85">✨ Summarize • Rewrite • Explain • Translate</text>
      
      <!-- CTA -->
      <rect x="140" y="200" width="160" height="40" rx="20" fill="white"/>
      <text x="220" y="226" 
            text-anchor="middle"
            font-family="Arial, sans-serif" 
            font-weight="bold"
            font-size="14px" 
            fill="#667eea">Free • 5 requests/day</text>
    </svg>
  `;

  const outputPath = path.join(__dirname, 'store-listing', 'promo-small-440x280.png');
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Created promotional tile: ${outputPath}`);
}

createPromoTile().catch(console.error);
