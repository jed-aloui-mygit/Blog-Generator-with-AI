import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || config.defaultModel;
const today = new Date().toISOString().slice(0, 10);
const topic = process.env.BLOG_TOPIC || config.topics[Math.floor(Math.random() * config.topics.length)];

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 70);

const fallbackArticle = () => ({
  title: `Ce que l'IA change vraiment pour ${topic}`,
  excerpt: "Une analyse claire, actionnable et pensée pour aider les créateurs à passer de l'idée à la publication.",
  tags: ['IA', 'Automatisation', 'Création'],
  readTime: '4 min',
  html: `
    <p>L'intelligence artificielle n'est plus seulement une promesse technique. Elle devient une couche de travail quotidienne qui aide à chercher, structurer, rédiger et publier plus vite.</p>
    <h2>Pourquoi c'est important</h2>
    <p>Pour un créateur ou une petite équipe, le principal avantage consiste à transformer une intention en contenu publiable sans multiplier les outils. Un bon workflow combine une ligne éditoriale claire, un modèle performant et une validation humaine légère.</p>
    <h2>Comment l'appliquer</h2>
    <ul>
      <li>Définir une liste de sujets cohérente avec l'audience.</li>
      <li>Générer un brouillon structuré avec OpenRouter.</li>
      <li>Publier automatiquement sur GitHub Pages après vérification.</li>
    </ul>
    <p>Le résultat attendu n'est pas de remplacer la stratégie éditoriale, mais d'augmenter sa régularité et sa qualité perçue.</p>
  `
});

async function callOpenRouter() {
  if (!apiKey) return fallbackArticle();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.SITE_URL || 'https://github.com/',
      'X-Title': config.siteTitle
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'Tu es un rédacteur francophone expert. Réponds uniquement avec un JSON valide: title, excerpt, tags, readTime, html. Le champ html contient des paragraphes, h2, h3, ul/li, strong, sans balise h1.'
        },
        {
          role: 'user',
          content: `Écris un article de blog premium, concret et original sur: ${topic}. Ton: inspirant, utile, moderne. 900 à 1200 mots.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    })
  });

  if (!response.ok) throw new Error(`OpenRouter error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

const article = await callOpenRouter();
const slug = `${today}-${slugify(article.title || topic)}`;
const filePath = path.join(root, 'posts', `${slug}.json`);

if (existsSync(filePath)) {
  console.log(`Article already exists: ${filePath}`);
  process.exit(0);
}

await mkdir(path.dirname(filePath), { recursive: true });
await writeFile(filePath, `${JSON.stringify({
  title: article.title,
  excerpt: article.excerpt,
  date: today,
  topic,
  model,
  tags: article.tags || [],
  readTime: article.readTime || '5 min',
  html: article.html
}, null, 2)}\n`);

console.log(`Created ${filePath}`);
