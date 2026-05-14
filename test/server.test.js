import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { describe, it } from 'node:test';
import { createServer } from '../src/server/createServer.js';

function inject(path, method = 'GET') {
  const server = createServer();
  const req = Readable.from([]);
  req.method = method;
  req.url = path;

  const chunks = [];
  const headers = new Map();
  const res = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    }
  });

  res.statusCode = 200;
  res.setHeader = (name, value) => headers.set(name.toLowerCase(), String(value));
  res.getHeader = (name) => headers.get(name.toLowerCase());
  res.writeHead = (statusCode, nextHeaders = {}) => {
    res.statusCode = statusCode;
    for (const [name, value] of Object.entries(nextHeaders)) {
      res.setHeader(name, value);
    }
    return res;
  };

  const done = new Promise((resolve, reject) => {
    res.on('finish', () => {
      resolve({
        status: res.statusCode,
        headers,
        body: Buffer.concat(chunks).toString('utf8')
      });
    });
    res.on('error', reject);
  });

  server.emit('request', req, res);
  return done;
}

describe('production server', () => {
  it('serves the migrated frontend', async () => {
    const response = await inject('/');

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(response.body, /Autonomous Safe Drone Convoy Following/);
    assert.match(response.body, /\/styles.css/);
    assert.match(response.body, /\/app.js/);
  });

  it('exposes project metadata through an API', async () => {
    const response = await inject('/api/project');
    const body = JSON.parse(response.body);

    assert.equal(response.status, 200);
    assert.equal(body.title, 'Autonomous Safe Drone Convoy Following');
    assert.equal(body.team.length, 4);
    assert.equal(body.demos.length, 3);
    assert.deepEqual(body.architecture.safetyStates, ['IDLE', 'ARM', 'FOLLOW', 'SEARCH', 'LAND']);
  });

  it('serves demo video assets with a video content type', async () => {
    const response = await inject('/videos/ros-sim.mp4', 'HEAD');

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
  });

  it('returns health state', async () => {
    const response = await inject('/api/health');
    const body = JSON.parse(response.body);

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.service, 'cs106a-drone-convoy');
  });
});
