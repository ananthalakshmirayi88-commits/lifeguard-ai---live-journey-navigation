import http from 'http';
import fs from 'fs';
import path from 'path';
import { handleApiRequest } from './server/api.ts';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle API routes
  if (handleApiRequest(req, res)) {
    return;
  }

  // Serve static files from dist if in production
  const distPath = path.resolve(__dirname, 'dist');
  let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url || 'index.html');

  if (!fs.existsSync(filePath)) {
    filePath = path.join(distPath, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
