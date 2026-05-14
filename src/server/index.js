import { createServer } from './createServer.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '127.0.0.1';
const server = createServer();

server.listen(port, host, () => {
  console.log(`cs106a-drone-convoy listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing HTTP server`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
