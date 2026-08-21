import { mkdir, readFile, readdir, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const postFiles = (await readdir(path.join(root, 'posts')).catch(() => [])).filter((file) => file.endsWith('.json'));
const posts = (await Promise.all(postFiles.map(async (file) => {
  const post = JSON.parse(await readFile(path.join(root, 'posts', file), 'utf8'));
  return { ...post, slug: file.replace(/\.json$/, '') };
}))).sort((a, b) => b.date.localeCompare(a.date));

const layout = ({ title, description, body }) => `<!doctype html>
<html lang="${config.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="${config.baseUrl}/assets/styles.css">
</head>
<body>
  <div class="orb orb-one"></div><div class="orb orb-two"></div>
  <header class="site-header">
    <a class="brand" href="${config.baseUrl}/"><span>✦</span>${escapeHtml(config.siteTitle)}</a>
    <nav><a href="${config.baseUrl}/#articles">Articles</a><a href="${config.baseUrl}/#workflow">Automatisation</a></nav>
  </header>
  ${body}
  <footer class="site-footer">Créé avec GitHub Pages, OpenRouter et une touche d'imagination automatique.</footer>
</body>
</html>`;

const cards = posts.map((post) => `<article class="post-card">
  <div class="meta">${escapeHtml(post.date)} · ${escapeHtml(post.readTime)}</div>
  <h3><a href="${config.baseUrl}/posts/${post.slug}/">${escapeHtml(post.title)}</a></h3>
  <p>${escapeHtml(post.excerpt)}</p>
  <div class="tags">${(post.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
</article>`).join('');

await mkdir(dist, { recursive: true });
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });

await writeFile(path.join(dist, 'index.html'), layout({
  title: `${config.siteTitle} — ${config.siteTagline}`,
  description: config.siteDescription,
  body: `<main>
    <section class="hero">
      <p class="eyebrow">Blog autonome propulsé par IA</p>
      <h1>${escapeHtml(config.siteTagline)}</h1>
      <p class="hero-copy">Un site statique spectaculaire pour GitHub Pages, enrichi par des articles générés automatiquement via l'API OpenRouter et publiés par GitHub Actions.</p>
      <div class="hero-actions"><a class="button" href="#articles">Lire les articles</a><a class="button ghost" href="#workflow">Voir le workflow</a></div>
    </section>
    <section class="stats"><div><strong>${posts.length}</strong><span>articles publiés</span></div><div><strong>24/7</strong><span>génération possible</span></div><div><strong>100%</strong><span>compatible GitHub Pages</span></div></section>
    <section id="articles" class="section"><p class="eyebrow">Dernières publications</p><h2>Le magazine se remplit tout seul</h2><div class="grid">${cards || '<p>Aucun article pour le moment. Lancez npm run generate.</p>'}</div></section>
    <section id="workflow" class="section workflow"><p class="eyebrow">Automatisation</p><h2>Comment ça marche</h2><ol><li>GitHub Actions démarre selon le planning.</li><li>OpenRouter génère un article JSON structuré.</li><li>Le site est reconstruit et publié sur GitHub Pages.</li></ol></section>
  </main>`
}));

for (const post of posts) {
  const postDir = path.join(dist, 'posts', post.slug);
  await mkdir(postDir, { recursive: true });
  await writeFile(path.join(postDir, 'index.html'), layout({
    title: `${post.title} — ${config.siteTitle}`,
    description: post.excerpt,
    body: `<main class="article-shell"><article class="article"><a class="back" href="${config.baseUrl}/">← Retour</a><p class="eyebrow">${escapeHtml(post.topic)}</p><h1>${escapeHtml(post.title)}</h1><div class="meta">${escapeHtml(post.date)} · ${escapeHtml(post.readTime)} · ${escapeHtml(post.model)}</div><div class="article-content">${post.html}</div></article></main>`
  }));
}

await writeFile(path.join(dist, 'feed.json'), JSON.stringify({ title: config.siteTitle, posts }, null, 2));
console.log(`Built ${posts.length} post(s) in dist/`);
