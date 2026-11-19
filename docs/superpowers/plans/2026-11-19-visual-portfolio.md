# Visual Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-heavy `index.html` with a visual, case-driven portfolio (6 animated cases + detail pages) and align the résumé PDF with it.

**Architecture:** Static hand-made HTML pages sharing `css/portfolio.css` + `js/portfolio.js`. Scene markup/CSS/JS ported from `~/projects/Arke/arke-site/en/index.html` (read-only source). `generate_portfolio.py` reduced to compiling `resume.tex` → `Klayver_Paz_Resume.pdf`.

**Tech Stack:** HTML/CSS/vanilla JS, Geist font (woff2), Tectonic, pytest, Playwright (Node).

**Spec:** `docs/superpowers/specs/2026-11-19-visual-portfolio-design.md`

## Global Constraints

- American English, first person, no "we/our team", no "founder/owner/my company/clients/agency".
- Arke appears only as employer line "AI Engineer · Arke Analytica · Jan 2026 – Present".
- No Seegold, no finance-skill anywhere (site, résumé, portfolio.json).
- Every page: `<meta name="robots" content="noindex, nofollow">`; root `robots.txt` untouched.
- Light page (`color-scheme: light`), scenes in dark navy glass.
- `prefers-reduced-motion`: scenes show final state, no loops.
- No horizontal scroll at 390px; no console errors.
- Never edit `~/projects/Arke/arke-site`.
- No `git commit`/`push` without Klayver's OK (global rule overrides "frequent commits").

## Review Focus

- Mobile (390px): scenes must stay legible (font clamp via `cqi`), no overflow from marquee/showcase.
- Reduced motion: counters show final values (not "0").
- Showcase clones scenes: duplicated `id`s removed; generated content (calendar, map) must be built before cloning.
- Detail page opened directly (deep link) works without the index (shared JS must not assume index-only elements).
- Résumé link: `Klayver_Paz_Resume.pdf` resolves from index and every detail page (`../Klayver_Paz_Resume.pdf`).

---

### Task 1: Shared assets (CSS, JS, fonts)

**Files:** Create `css/portfolio.css`, `js/portfolio.js`, `fonts/geist-{400,500,600}.woff2` (copied).

- [ ] Port from Arke: tokens, `.scene/.stage` base, scenes `mo-month`, `mo-site`, `mo-map`, `mo-road`, `sc-tasks` (adapted as `mo-rag`), showcase, stats, marquee, reveal; drop carousel/form/faq/diag/lang.
- [ ] Re-theme page chrome to light (ink `#0B1220`, surface `#F5F7FB`, lines `rgba(11,18,32,.1)`); scenes keep dark tokens scoped under `.scene`.
- [ ] New scene `mo-meal` (Nutrir): plate photo → segment overlays appear → bars per food % → scale weight → "Record saved".
- [ ] JS: scene stepper, counters, showcase (clones `.work-case .scene`), reveal, header scroll, generated calendar/map; every lookup null-safe.

### Task 2: `index.html`

**Files:** Replace `index.html`.

- [ ] Sections per spec: nav, intro + showcase, impact strip (`1 month → 40 min`, `17% → 100%` recall, `Gov. standard`, `6 years`), marquee, 6 case cards (Challenge / What I built / Impact / chips / "Case details →"), experience timeline, toolbox, footer CTA.

### Task 3: Detail pages

**Files:** Create `projects/restrictions-rag.html`, `projects/construction-forecast.html`; replace `projects/{multi-agent-ops,midr,nutrir,crif}.html`; delete `projects/{seegold,finance-skill}.html`.

- [ ] Each: scene hero + up to 3 numbers, The problem, How it works (HTML flow of 4–6 steps), Key decisions (≤3), Stack, My role, prev/next.

### Task 4: Résumé + generator + repo docs

**Files:** Modify `resume.tex`, `portfolio.json`, `generate_portfolio.py`, `CLAUDE.md`, `tests/test_render.py`; delete `index_template.html`, `project_template.html`, `Klayver_Paz_Curriculo.pdf`, `resume_pt.tex`, covers for removed projects.

- [ ] Remove Seegold + Personal Finance Skill from `resume.tex` and `portfolio.json`.
- [ ] Reword Arke highlight: ~1 month → ~40 min attributed to the budget agent.
- [ ] `generate_portfolio.py`: only `render_resume_pdf()`.
- [ ] Tests: drop template render tests; keep schema tests; add `test_resume_has_no_seegold`.
- [ ] Run `./.venv/bin/python generate_portfolio.py` → PDF regenerated; `pytest tests/ -q` passes.

### Task 5: Playwright verification

**Files:** Create `package.json`, `playwright.config.ts`, `tests/e2e/portfolio.spec.ts`.

- [ ] Specs (desktop 1440 + mobile 390): index + each detail page load without console errors; no horizontal scroll; 6 cards with resolving detail links; résumé link 200; `noindex` meta present; reduced-motion shows final counter values; page text has no "Seegold"/"founder"/"our team".
- [ ] Run `npx playwright test` → all pass; screenshots reviewed by eye.
