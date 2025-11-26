const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download function with proper headers
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/svg+xml,image/*,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': urlObj.origin,
      },
    };

    const file = fs.createWriteStream(filepath);
    
    const req = protocol.request(options, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        // Handle redirects
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        const redirectUrl = response.headers.location;
        const absoluteUrl = redirectUrl.startsWith('http') ? redirectUrl : `${urlObj.protocol}//${urlObj.hostname}${redirectUrl}`;
        downloadFile(absoluteUrl, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
      }
    });

    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });

    req.end();
  });
}

async function downloadLogos() {
  try {
    console.log('Downloading logos...\n');

    // Download Sitecore logo
    const sitecoreLogoUrl = 'https://engage.sitecore.com/sitecore-logo.svg';
    const sitecoreLogoPath = path.join(publicDir, 'sitecore-logo.svg');
    await downloadFile(sitecoreLogoUrl, sitecoreLogoPath);

    // Download City Tour logo
    const cityTourLogoUrl = 'https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/455cf87cfe0d402a96c65c04c7c472c7';
    const cityTourLogoPath = path.join(publicDir, 'city-tour-logo.svg');
    await downloadFile(cityTourLogoUrl, cityTourLogoPath);

    console.log('\n✅ All logos downloaded successfully!');
  } catch (error) {
    console.error('❌ Error downloading logos:', error.message);
    process.exit(1);
  }
}

downloadLogos();

