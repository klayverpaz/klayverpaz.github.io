# CLAUDE.md — Agent instructions for `klayverpaz.github.io`

This repo is Klayver Paz's personal portfolio + resume site, deployed via
GitHub Pages. The agent-facing rules below are mandatory.

## 1. Single source of truth

**`portfolio.json` is the single source of truth for all resume / portfolio
content** (work experience, featured projects, skills, education,
languages, interests, contact info, summary, social links).

When content changes, the change goes into `portfolio.json` first. Never
edit content directly in generated HTML.

## 2. How to regenerate everything

After modifying `portfolio.json`, any `*_template.html`, or `resume.tex`,
run the generator from the repo root. It is the **only** supported way
to produce the served files:

```bash
./.venv/bin/python generate_portfolio.py
```

Prerequisites (one-time, per machine):

```bash
# Python deps for the templating + tests
./.venv/bin/pip install -r requirements.txt

# Tectonic for the LaTeX -> PDF pass (~16 MB binary)
brew install tectonic
```

Files produced by `generate_portfolio.py` (all overwritten in place;
nothing else needs to be touched by hand):

- `index.html` — portfolio (rendered from `index_template.html` +
  `portfolio.json`).
- `projects/<slug>.html` — one detail page per project, rendered from
  `project_template.html` + `portfolio.json`.
- `Klayver_Paz_Resume.pdf` — compiled from `resume.tex` via Tectonic.

After regen, run the test suite to catch template drift:

```bash
./.venv/bin/python -m pytest tests/ -q
```

Then `git add` the regenerated files alongside the source change and
commit. **Never** commit a content change to `portfolio.json` /
`resume.tex` without also committing the regenerated artifacts.

The site has **no separate `resume.html` page**. The Download CV button on
`index.html` links to `Klayver_Paz_Resume.pdf`.

### Resume PDF — Tectonic, not Overleaf

PDF compilation runs locally via [Tectonic](https://tectonic-typesetting.github.io/).
Install once with:

```bash
brew install tectonic
```

The generator calls `tectonic` as a subprocess and renames the output to
`Klayver_Paz_Resume.pdf`. Tectonic is hermetic and fetches packages on
first run; no system TeX Live install needed.

Whenever `portfolio.json` content changes, the agent **must update
`resume.tex` by hand** so its content matches `portfolio.json`. Sections
that must mirror `portfolio.json`:

| `portfolio.json` field | LaTeX section in `resume.tex` |
|---|---|
| `name`, `label`, `summary` | Header block |
| `contact`, `social_links` | Header contact line |
| `work_experience[]` | `\section{Experience}` |
| `projects[]` | `\section{Featured Projects}` |
| `skills[]` | `\section{Skills}` |
| `education[]` | `\section{Education}` |
| `languages[]` | `\section{Languages}` |

Editing rules for `resume.tex`:

- Keep it single-file and self-contained — no external assets.
- Only use packages Tectonic can fetch (the current set works; do not add
  obscure or system-only packages without testing).
- Escape LaTeX special characters in any user-supplied text (`#`, `&`,
  `%`, `_`, `$`, `{`, `}`, `~`, `^`, `\`).
- Use `---` for em-dashes, `--` for en-dashes, `\&` for ampersand,
  `$\sim$` for tilde when used as "approximately".
- Use `\'a`, `\^a`, etc. for accented Latin characters when you want to
  stay ASCII-safe (e.g. `Cear\'a`, `Atl\^antico`).

## 3. PDF download button

`index.html` carries a "Download CV (PDF)" button that links to
`/Klayver_Paz_Resume.pdf`. The link is hidden in `@media print` via the
`.no-print` / `.header-cv-link` CSS rules. Don't break the link or rename
the file.

## 4. Layout invariants

- The portfolio (`index.html`) uses a 2-column grid (`2fr 1fr`) on
  viewports ≥ 48rem: `<main>` (work experience) + `<aside>` (skills,
  education, languages, interests).
- `Featured Projects` is intentionally placed **outside** `<main>` and
  spans both columns (`grid-column: 1 / -1` via the `.projects-full`
  class). Don't move it back inside `<main>`.

## 5. What not to do

- Do not reintroduce a Python PDF renderer (WeasyPrint, ReportLab,
  pdfplumber, pypdf). The PDF pipeline is `resume.tex` → Tectonic.
- Do not edit `index.html` or `projects/*.html` by hand — edit the
  templates (`index_template.html`, `project_template.html`) and rerun
  the generator.
- Do not bypass `portfolio.json` and add content that lives only in a
  template or only in `resume.tex`.
- Do not let `resume.tex` and `portfolio.json` drift. After every content
  update to the repo, verify both are in sync before claiming the task is
  complete.

## 6. Definition of done

A content-modifying task is complete only when **all** of the following
hold:

1. `portfolio.json` reflects the new content.
2. `resume.tex` mirrors the new content.
3. `./.venv/bin/python generate_portfolio.py` ran clean and emitted
   updated `index.html`, project pages, and `Klayver_Paz_Resume.pdf`.
4. `pytest tests/` passes.
