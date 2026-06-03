@AGENTS.md

# Plateforme Giron — Guide développement

## Stack

Next.js 16 · Supabase Auth + DB · Airtable API · Vercel · Tailwind CSS v4 · Lucide React

## Design system

**Tokens** : `src/design/tokens.json` (source canonique — ne jamais écrire les variables CSS à la main)
**CSS** : bloc auto-généré dans `src/app/globals.css` entre les marqueurs `BEGIN/END GENERATED TOKENS`
**Mise à jour** : modifier `tokens.json` → `npm run tokens` → committer les deux fichiers

Guide complet (couleurs, typographie, composants, layouts) :
`2nd brain/1 - PROJECTS/App - Concours des solistes/Giron — Design System.md`

### Tokens clés

| Rôle | Variable |
|---|---|
| Fond canvas (crème) | `--paper` (#f6f3ec) |
| Surface (blanc) | `--surface` |
| Texte principal | `--ink-900` (#18171c) |
| Accent (terracotta) | `--accent` (#b73a2a) |
| Succès | `--success` (#2f7d49) |
| Warning | `--warn` (#b76b07) |
| Or / podium | `--gold` (#a17a2c) |
| Sidebar fond | `--nav-bg` (#131217) |

### Typographie

- UI : `'Geist'` (chargée via `--font-geist-sans`)
- Titres : `'Instrument Serif'` (classe `.h-display`, `.h-display-sm`, `.h-display-italic`)
- Chiffres : `'Geist Mono'` + classe `.num` (tabular-nums)

### Classes utilitaires disponibles

Définies dans `globals.css` — utiliser en priorité sur les Tailwind arbitraires :

- **Boutons** : `.btn`, `.btn.primary`, `.btn.accent`, `.btn.ghost`, `.btn.sm`, `.btn.lg`, `.iconbtn`
- **Tags/Chips** : `.tag`, `.tag.success`, `.tag.warn`, `.tag.accent`, `.tag.gold`, `.tag.info`, `.tag.dark`
- **Cartes** : `.card`, `.card-header`, `.card-title`, `.card-body`
- **Tableaux** : `.table` (header sticky, uppercase 11.5px)
- **Formulaires** : `.input`, `.select`, `.field`, `.field-label`
- **Onglets** : `.tabs`, `.tab`, `.tab.active`
- **Typo** : `.h1` → `.h3`, `.eyebrow`, `.lead`, `.small`, `.tiny`, `.num`, `.wavy`

### App Shell

Layout à 2 colonnes (sidebar 240px sombre + canvas crème) :

```
.app-shell → display: grid, 240px 1fr, height: 100dvh
.app-canvas → flex column, overflow: hidden
.app-scroll → flex 1, overflow-y: auto, padding 28px 32px
```

## Architecture

```
src/
  app/
    (app)/          ← routes protégées (auth + App Shell)
      layout.tsx    ← App Shell (sidebar + canvas)
      Sidebar.tsx   ← sidebar sombre avec nav
      dashboard/    ← liste des bases
      admin/        ← sync + gestion (admin only)
      base/[baseId] ← vue d'une base Airtable
    (auth)/login/   ← login magic link
    api/
      airtable/     ← proxy sécurisé GET/PATCH vers Airtable
      sync/         ← synchronise la base paramètres
      invite/       ← invite les utilisateurs par email
      webhook/      ← déclenche les webhooks Make
  design/
    tokens.json     ← source canonique des tokens CSS
  lib/supabase/     ← clients server/client/admin
  types/            ← AirtableBase, UserBase

scripts/
  sync-tokens.mjs   ← génère le bloc :root dans globals.css
```

## Variables d'environnement

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin Supabase (server only) |
| `AIRTABLE_TOKEN` | PAT Airtable |
| `AIRTABLE_PARAMS_BASE_ID` | `appopj4wmBrdMz5kD` |
| `AIRTABLE_PARAMS_TABLE` | `Paramètres` |
| `ADMIN_EMAIL` | Email admin (bypass RLS dashboard) |

## Règles

- Langue UI : **français absolu** (zéro anglais visible)
- Icônes : **Lucide React** partout — `size={16}`, `strokeWidth={1.6}`
- Couleurs : toujours via variables CSS (`var(--accent)`) — jamais de hex en dur
- Tailwind : utilitaires de layout OK ; pour les couleurs et tailles, préférer les tokens
- Champs Airtable : **ne jamais afficher un record ID** (format `recXXXXXX`). Les champs "linked record" retournent des IDs bruts — toujours utiliser le champ texte correspondant (lookup ou rollup). Exemples : `Nom catégorie` plutôt que `Catégorie`, `Société [txt]` plutôt que `Société`.
