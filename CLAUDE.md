# CLAUDE.md — Agent instructions for `klayverpaz.github.io`

Klayver Paz's portfolio + résumé, deployed via GitHub Pages. The portfolio is
sent by link to recruiters (it is not meant to be found by search).

## 1. What lives where

| Thing | Source | How it's produced |
|---|---|---|
| Portfolio home | `index.html` | **Hand-made** static HTML. Edit it directly. |
| Case detail pages | `projects/<slug>.html` | **Hand-made** static HTML. Edit directly. |
| Shared styles / scripts | `css/portfolio.css`, `js/portfolio.js`, `fonts/` | Hand-written. |
| Résumé PDF | `resume.tex` → `Klayver_Paz_Resume.pdf` | `./.venv/bin/python generate_portfolio.py` (Tectonic). |
| Résumé content reference | `portfolio.json` | Must mirror `resume.tex`; nothing renders from it. |

The link sent to recruiters for the résumé is
`https://klayverpaz.github.io/Klayver_Paz_Resume.pdf` — never rename that file.
There is only the English résumé (the Portuguese version was retired on 19/11/2026).

Design and decisions: `docs/superpowers/specs/2026-11-19-visual-portfolio-design.md`.
The animated scenes were ported from the Arke site; the Arke repo
(`~/projects/Arke/arke-site`) is **read-only** from here.

## 2. Content rules (Klayver's, mandatory)

- American English, first person, short. Visual first; no paragraph over ~2 lines on the home page.
- Klayver wants a **full-time** role. Never frame him as a business owner: no "founder",
  "owner", "my company", "my clients", "our team". Arke Analytica appears **only** as the
  employer line (AI Engineer, Jan 2026 – Present).
- **Seegold and the Personal Finance Skill are out** of the site, the résumé and `portfolio.json`.
- The 2026 construction-tech client is **under NDA** in the résumé: on the site it is
  "construction-tech SaaS", not named. Agilean is named only as the 2020–2024 employer.
- "~1 month → ~40 minutes" belongs to the **budget-matching agent**.
- Every page carries `<meta name="robots" content="noindex, nofollow">`. **Never** set the root
  `robots.txt` to `Disallow: /` — it would also hide the Arke site under the same domain.

## 3. Changing things

- **Portfolio copy/layout:** edit the HTML/CSS directly. Scenes are `.scene` blocks with
  `data-steps` (ms per step) and CSS keyed on `.s1…sN` classes; `js/portfolio.js` drives them.
  The hero showcase clones the scenes of the `.work-case` cards automatically.
- **Résumé content:** edit `resume.tex` **and** `portfolio.json` together, then
  `./.venv/bin/python generate_portfolio.py`. LaTeX rules: escape `# & % _ $ { } ~ ^ \`,
  `---` em-dash, `--` en-dash, `$\sim$` for "approximately". Do not add a Python PDF renderer.

## 4. Verification (definition of done)

```bash
./.venv/bin/python -m pytest tests/ -q      # content + schema checks
npm test                                     # Playwright: desktop + mobile, every page
```

First time: `npm install && npx playwright install chromium`; Tectonic via `brew install tectonic`.
Playwright serves the repo itself on port 8765 (see `playwright.config.ts`).
