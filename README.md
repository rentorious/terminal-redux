# Terminal Redux

Working documents live in [`docs/`](docs/) and are published with GitHub Pages at
**https://rentorious.github.io/terminal-redux/**.

## The docs site

`docs/` is a small static site with no server-side build:

| Path | What it is |
| --- | --- |
| `docs/gameplan/*.md` | The written sources. Edit these. |
| `docs/gameplan/*.html` | Rendered pages — two hand-built interactive documents, the rest generated from the markdown. |
| `docs/index.html` | Generated landing page listing every document. |
| `docs/assets/site.css`, `site.js` | Shared shell: theme, sidebar, table of contents. |
| `scripts/build-docs.mjs` | The generator. |

### Adding a document

1. Drop a `.md` file anywhere under `docs/` (a new folder becomes a new section).
2. Start it with an `# H1` title, optional `**Key:** value` metadata lines, then the body.
3. Run the build:

```bash
npm install       # once
npm run docs      # renders every .md and regenerates the index
npm run docs:serve # same, then serves docs/ on http://localhost:8080
```

Commit the generated `.html` along with the markdown — GitHub Pages serves the files as-is.
Pushing markdown alone also works: `.github/workflows/docs.yml` rebuilds and commits the
rendered pages for you.

### Notes

- Hand-written HTML documents (the brief and the playbook) are left untouched by the
  generator; it only reads their `<title>`, eyebrow and subtitle to list them.
- A document whose metadata says `supersedes <file>.md` marks that older document as
  superseded, on its own page and on the index.
- Section names and the index copy live at the top of `scripts/build-docs.mjs`.
