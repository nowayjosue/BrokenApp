const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

function downloadFile(urlString, outputFileName) {
  return new Promise((resolve, reject) => {
    const protocol = urlString.startsWith('https') ? https : http;
    const fileStream = fs.createWriteStream(outputFileName);

    protocol
      .get(urlString, (response) => {
        if (response.statusCode === 200) {
          response.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close(() => resolve());
          });
        } else {
          reject(`Failed to download ${urlString}`);
        }
      })
      .on('error', (err) => {
        reject(`Error while downloading ${urlString}: ${err}`);
      });
  });
}

function processUrlsFromFile(fileName) {
  return new Promise((resolve, reject) => {
    const urls = fs.readFileSync(fileName, 'utf8').split('\n').filter(Boolean);

    if (urls.length === 0) {
      reject('No valid URLs found in the input file.');
      return;
    }

    const downloadPromises = urls.map((urlString) => {
      const parsedUrl = new URL(urlString);
      const outputFileName = parsedUrl.hostname;
      return downloadFile(urlString, outputFileName);
    });

    Promise.all(downloadPromises)
      .then(() => resolve('All downloads completed successfully.'))
      .catch((err) => reject(err));
  });
}

if (process.argv.length !== 3) {
  console.error('Usage: node urls.js FILENAME');
} else {
  const fileName = process.argv[2];

  fs.access(fileName, fs.constants.R_OK, (err) => {
    if (err) {
      console.error(`Error: Cannot read the file '${fileName}'.`);
      process.exit(1);
    }

    processUrlsFromFile(fileName)
      .then((message) => {
        console.log(message);
      })
      .catch((err) => {
        console.error(`Error: ${err}`);
      });
  });
}