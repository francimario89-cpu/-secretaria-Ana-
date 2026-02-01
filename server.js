
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 10000;
const apiKey = process.env.API_KEY || '';

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './' || filePath === '.') filePath = './index.html';

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  const map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.tsx': 'text/javascript',
    '.ts': 'text/javascript'
  };

  contentType = map[extname] || 'text/plain';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Arquivo nao encontrado');
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      if (filePath === './index.html') {
        let html = content.toString();
        // Injeção limpa da API KEY
        const injection = `\n<script>window.RENDER_ENV = { API_KEY: "${apiKey}" };</script>\n`;
        html = html.replace('</head>', injection + '</head>');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html, 'utf-8');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Ana está online na porta ${port}`);
});
