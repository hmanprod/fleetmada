# Audit QA (local)

Objectif: exécuter un audit QA reproductible en local (seed DB + régression Playwright + exploration/crawl) et produire un dossier d’artefacts sous `qa/audits/`.

## Commande principale

```bash
npm run qa:audit -- --module <moduleId> --strict
```

Lister les modules disponibles:

```bash
npm run qa:audit -- --list-modules
```

Voir aussi: `qa/MODULES.md` (liste complète des modules + commandes).

## Options utiles

```bash
# Plusieurs modules
npm run qa:audit -- --modules vehicles,fuel --strict

# Tous les modules du catalogue
npm run qa:audit -- --all --strict

# Ne pas relancer docker/migrations/seed
npm run qa:audit -- --module vehicles --skip-setup --strict

# Ne pas exécuter Playwright (uniquement exploration)
npm run qa:audit -- --module vehicles --skip-playwright --strict

# Ne pas exécuter l’exploration (uniquement Playwright)
npm run qa:audit -- --module vehicles --skip-explore --strict

# Base URL différente
npm run qa:audit -- --module vehicles --base-url http://localhost:3000 --strict

# Stoppe au premier module rouge (utile CI)
npm run qa:audit -- --modules vehicles,fuel --strict --bail
```

## Sorties

Chaque run écrit dans un dossier unique:
- Index du run: `qa/audits/<YYYY-MM-DD>/<runId>/index.md` + `index.json`
- Rapport d’un module: `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/report.md` + `report.json`
- Navigation tree: `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/navigation-tree.json`
- Evidence: `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/evidence/` (playwright html/json + screenshots exploration)
