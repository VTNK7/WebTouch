const http = require('http');
const fs = require('fs');
const path = require('path');
const socket = require('./js/ws.js');


const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end("404 Not Found");
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    }
  });
});

server.listen(8080, () => {
  console.log('Server running at http://localhost:8080/');
});
