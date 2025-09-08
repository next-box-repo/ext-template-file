import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

import cfg from './public/config.json' with { type: 'json' };

const gulpBuild = async () => {
  const distDir = 'dist';
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const zipName = `${cfg.name.ru}-${cfg.version}.zip`;
  const outputPath = path.join(distDir, zipName);

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    throw new Error(`Archiver error: ${err.message}`);
  });

  output.on('error', (err) => {
    throw new Error(`WriteStream error: ${err.message}`);
  });

  archive.pipe(output);

  archive.glob('assets/fonts/**', {
    cwd: 'build',
    store: true,
  });

  archive.glob('**', {
    cwd: 'build',
    ignore: 'assets/fonts/**',
  });

  await archive.finalize();
};

export default gulpBuild;
