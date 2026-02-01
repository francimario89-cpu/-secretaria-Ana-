
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
    '.tsx': 'text/javascript', // Babel vai processar isso
    '.ts': 'text/javascript'
  };

  contentType = map[extname] || 'text/plain';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT') {
        res.writeHead(404);
        res.end('Arquivo não encontrado');
      } else {
        res.writeHead(500);
        res.end('Erro no servidor: '+error.code);
      }
    } else {
      if (filePath === './index.html') {
        let html = content.toString();
        // Injeta a chave do Render no navegador com segurança
        const injection = `<script>window.RENDER_ENV = { API_KEY: "${apiKey}" };</script>`;
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
