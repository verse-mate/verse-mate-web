import { createServer } from 'node:http';

const port = Number(process.env.SLACK_STUB_PORT || 4010);

createServer((request, response) => {
  request.resume();
  request.on('end', () => {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ ok: true, channel: 'C0E2E', ts: `${Date.now() / 1000}` }));
  });
}).listen(port, '127.0.0.1');
