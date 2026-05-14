import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demos, publicProjectPayload } from '../content/project.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '../..');
const distPublicRoot = path.join(appRoot, 'dist', 'public');
const publicRoot =
  process.env.NODE_ENV === 'production' && existsSync(distPublicRoot)
    ? distPublicRoot
    : path.join(appRoot, 'public');
const videosRoot = path.join(publicRoot, 'videos');
const sourceVideosRoot = path.join(appRoot, 'videos');

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.ico', 'image/x-icon']
]);

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function setBaseHeaders(res) {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'SAMEORIGIN');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'permissions-policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
}

function resolveStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');

  if (normalized.startsWith('/videos/')) {
    const relativeVideo = normalized.replace('/videos/', '');
    const builtVideo = path.join(videosRoot, relativeVideo);
    if (builtVideo.startsWith(videosRoot) && existsSync(builtVideo)) return builtVideo;

    const sourceVideo = path.join(sourceVideosRoot, relativeVideo);
    return sourceVideo.startsWith(sourceVideosRoot) ? sourceVideo : null;
  }

  const relativePath = normalized === '/' ? 'index.html' : normalized.replace(/^\/+/, '');
  const candidate = path.join(publicRoot, relativePath);
  return candidate.startsWith(publicRoot) ? candidate : null;
}

function streamFile(req, res, filePath) {
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypes.get(ext) ?? 'application/octet-stream';
  const immutable = /\.(css|js|png|jpg|jpeg|svg|ico|mp4)$/.test(ext);

  res.writeHead(200, {
    'content-type': contentType,
    'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache'
  });

  if (req.method === 'HEAD') {
    res.end();
    return true;
  }

  createReadStream(filePath).pipe(res);
  return true;
}

async function getBuildMetadata() {
  const buildMetaPath = path.join(appRoot, 'dist', 'build-meta.json');
  try {
    return JSON.parse(await readFile(buildMetaPath, 'utf8'));
  } catch {
    return null;
  }
}

export function createServer() {
  return createHttpServer(async (req, res) => {
    setBaseHeaders(res);

    if (!['GET', 'HEAD'].includes(req.method)) {
      return sendError(res, 405, 'Method not allowed');
    }

    const requestUrl = new URL(req.url, 'http://localhost');

    if (requestUrl.pathname === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'cs106a-drone-convoy',
        environment: process.env.NODE_ENV ?? 'development',
        build: await getBuildMetadata()
      });
    }

    if (requestUrl.pathname === '/api/project') {
      return sendJson(res, 200, publicProjectPayload());
    }

    if (requestUrl.pathname === '/api/demos') {
      return sendJson(res, 200, { demos });
    }

    const filePath = resolveStaticPath(requestUrl.pathname);
    if (streamFile(req, res, filePath)) return;

    const fallback = path.join(publicRoot, 'index.html');
    if (streamFile(req, res, fallback)) return;

    sendError(res, 404, 'Not found');
  });
}
