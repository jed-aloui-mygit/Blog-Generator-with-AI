# Pulse IA — Blog automatique pour GitHub Pages

Pulse IA est un blog statique au design premium qui peut publier automatiquement des articles générés par une IA via l'API OpenRouter. Il est pensé pour GitHub Pages: aucun serveur à maintenir, seulement des fichiers HTML/CSS générés.

## Fonctionnalités

- Design responsive sombre, lumineux et moderne.
- Génération d'articles en français avec OpenRouter.
- Publication planifiée avec GitHub Actions.
- Stockage des articles en JSON dans `posts/`.
- Build statique dans `dist/`, compatible GitHub Pages.

## Configuration rapide

1. Dans GitHub, activez Pages avec la source **GitHub Actions**.
2. Ajoutez un secret de dépôt `OPENROUTER_API_KEY`.
3. Optionnel: ajoutez une variable `OPENROUTER_MODEL` pour choisir un modèle OpenRouter, par exemple `openai/gpt-4o-mini` ou un modèle plus puissant disponible dans votre compte.
4. Lancez le workflow **Generate and publish AI blog** manuellement ou attendez le planning du lundi matin.

## Utilisation locale

```bash
npm run generate
npm run build
npm run check
```

Sans `OPENROUTER_API_KEY`, la commande `npm run generate` crée un article de démonstration afin de tester le workflow localement.

## Personnalisation

Modifiez `site.config.json` pour changer le nom du site, la description, le modèle par défaut et la liste des thèmes. Le design principal se trouve dans `assets/styles.css`.

## Sécurité

Ne mettez jamais votre clé OpenRouter dans le code frontend. Le workflow GitHub Actions lit la clé depuis les secrets GitHub et génère des fichiers statiques publiables sans exposer la clé aux visiteurs.
