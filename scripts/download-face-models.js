const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(process.cwd(), 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const models = [
  {
    url: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-weights_manifest.json',
    filename: 'tiny_face_detector_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-shard1',
    filename: 'tiny_face_detector_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json',
    filename: 'face_landmark_68_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-shard1',
    filename: 'face_landmark_68_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-weights_manifest.json',
    filename: 'face_recognition_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-shard1',
    filename: 'face_recognition_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-shard2',
    filename: 'face_recognition_model-shard2'
  }
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading from: ${url}`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        // Verify file exists and has size
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
          console.log(`Successfully downloaded and verified: ${path.basename(dest)}`);
          resolve();
        } else {
          reject(new Error(`Failed to verify downloaded file: ${dest}`));
        }
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete failed download
      reject(err);
    });
  });
}

async function downloadModels() {
  console.log('Downloading face-api.js models...');
  console.log(`Models will be saved to: ${modelsDir}`);
  
  const results = [];
  
  for (const model of models) {
    const dest = path.join(modelsDir, model.filename);
    
    try {
      console.log(`Downloading ${model.filename}...`);
      await downloadFile(model.url, dest);
      results.push({ model: model.filename, success: true });
    } catch (error) {
      console.error(`Error downloading ${model.filename}:`, error.message);
      results.push({ model: model.filename, success: false, error: error.message });
    }
  }

  // Print summary
  console.log('\nDownload Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Successfully downloaded: ${successful}/${models.length} models`);
  if (failed > 0) {
    console.log('\nFailed downloads:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.model}: ${r.error}`);
    });
    throw new Error('Some models failed to download');
  }

  // Verify all files exist
  const missingFiles = models
    .map(m => m.filename)
    .filter(filename => 
      !fs.existsSync(path.join(modelsDir, filename)) || 
      fs.statSync(path.join(modelsDir, filename)).size === 0
    );

  if (missingFiles.length > 0) {
    console.error('\nMissing or empty files:');
    missingFiles.forEach(file => console.error(`- ${file}`));
    throw new Error('Some model files are missing or empty');
  }

  console.log('\nAll models downloaded and verified successfully!');
}

downloadModels().catch(error => {
  console.error('\nFatal error:', error.message);
  process.exit(1);
}); 