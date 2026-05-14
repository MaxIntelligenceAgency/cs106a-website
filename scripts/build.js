import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demos, project } from '../src/content/project.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const distRoot = path.join(appRoot, 'dist');
const publicRoot = path.join(appRoot, 'public');
const videosRoot = path.join(appRoot, 'videos');

async function assertFile(filePath) {
  const info = await stat(filePath);
  if (!info.isFile()) throw new Error(`${filePath} is not a file`);
}

async function main() {
  await Promise.all([
    assertFile(path.join(publicRoot, 'index.html')),
    assertFile(path.join(publicRoot, 'styles.css')),
    assertFile(path.join(publicRoot, 'app.js'))
  ]);

  const html = await readFile(path.join(publicRoot, 'index.html'), 'utf8');
  for (const asset of ['/styles.css', '/app.js']) {
    if (!html.includes(asset)) {
      throw new Error(`public/index.html does not reference ${asset}`);
    }
  }

  for (const demo of demos) {
    for (const file of demo.files) {
      await assertFile(path.join(appRoot, file.replace(/^\//, '')));
    }
  }

  await rm(distRoot, { recursive: true, force: true });
  await mkdir(path.join(distRoot, 'public'), { recursive: true });
  await cp(publicRoot, path.join(distRoot, 'public'), { recursive: true });
  await cp(videosRoot, path.join(distRoot, 'public', 'videos'), { recursive: true });

  const metadata = {
    name: project.slug,
    builtAt: new Date().toISOString(),
    node: process.version,
    assets: {
      demos: demos.length,
      videos: demos.flatMap((demo) => demo.files).length
    }
  };

  await writeFile(path.join(distRoot, 'build-meta.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(`Built ${project.slug} into ${path.relative(appRoot, distRoot)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
