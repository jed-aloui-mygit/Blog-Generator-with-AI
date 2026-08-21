import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const required = ['dist/index.html', 'dist/assets/styles.css', 'dist/feed.json'];
for (const file of required) await access(path.join(process.cwd(), file));
const html = await readFile(path.join(process.cwd(), 'dist/index.html'), 'utf8');
if (!html.includes('Pulse IA') || !html.includes('Dernières publications')) throw new Error('Homepage content check failed');
console.log('Static site checks passed');
