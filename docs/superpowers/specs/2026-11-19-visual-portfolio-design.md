# Visual portfolio — design

Date: 2026-11-19 · Status: draft for Klayver's approval

## Intent

Replace the current resume-style `index.html` (a long HTML CV) with a **visual, case-driven
portfolio** that borrows the look of the new Arke Analytica site (glass "scenes" animated in
HTML, big impact numbers, challenge → solution cards) but presents **Klayver as an individual
engineer**, not a company.

**Who reads it and how it arrives.** Nobody finds it by search. Klayver sends the link to a
recruiter who asked for a portfolio; the recruiter forwards it to the hiring person inside the
company (a data/AI lead or a business stakeholder). That second reader decides in a minute or
two. So the page must impress at a glance and be skimmable: **visual first, very little text,
straight to the point, impact numbers up front.**

## Goals

- Each case shows, with an animation, **what the problem looked like, what was built, and the
  impact** — readable in ~10 seconds per case.
- Credible to a technical reader (stack, architecture on demand) without burying the business
  reader in text.
- All copy in **American English**, first person ("I built…"). No "our team", no sales tone.
- Works on desktop and phone (the link is often opened from email/LinkedIn on mobile).

## Non-goals

- No Portuguese version (decided: everything in English).
- No SEO, blog, contact form, or analytics.
- No redesign of the resume PDF — it stays exactly as is (`resume.tex` → Tectonic).

## Anti-goals (would be a failure even if it works)

- Walls of text; paragraphs longer than ~2 lines on the main page.
- Looking like a company sales page (big marketing hero, "Book a call", "we").
- Arke branding on the site, or anything that reads as "he owns a company" (see framing below).
- Being indexed by search engines.
- Breaking the Arke site, which lives under the same GitHub Pages domain
  (`klayverpaz.github.io/arke-analytica/`).

## Approaches considered

1. **Hand-made page in the Arke mold (chosen).** One page; each case a card with its animated
   scene + Challenge / What I built / Impact / Stack, linking to a detail page in the same style.
   Reuses Arke's scene HTML/CSS/JS nearly as-is.
2. Keep the Jinja generator and template the scenes from `portfolio.json`. Rejected: every scene
   is bespoke, so templating saves nothing and adds coupling.
3. Keep the current CV at `/` and add a separate `/work` page. Rejected: two links to send, and
   the first thing the recruiter opens is still the text-heavy CV.

Klayver picked 1 and said decoupling from `portfolio.json` is fine.

## Decided

- **Hand-made HTML** for `index.html` and `projects/*.html`, with styles/scripts shared via
  `css/portfolio.css` and `js/portfolio.js` (not inlined per page, since there are ~7 pages).
  Mark them with a comment `<!-- portfolio: hand-made page -->`.
- **`generate_portfolio.py` stops writing `index.html` and `projects/*.html`**; it only compiles
  the resume PDF. `index_template.html`, `project_template.html` are deleted. `portfolio.json`
  stays as the resume content reference (and `tests/test_schema.py` keeps validating it).
  Repo `CLAUDE.md` is rewritten to describe the new split.
- **Look:** light page (white / near-white background, dark ink typography, Geist font copied
  from `arke-site/assets/fonts/`). Scenes keep Arke's **dark navy glass** look and sit inside the
  light page as dark "screens". Accent blue from Arke. Page must still look intentional in
  dark-mode browsers (keep it light; set `color-scheme: light`).
- **Not indexable:** `<meta name="robots" content="noindex, nofollow">` on every page.
  **Do not** change the root `robots.txt` to `Disallow: /` — crawlers only read the root
  robots.txt, so that would also hide the Arke site.
- **Motion:** scenes start when scrolled into view (IntersectionObserver), loop; respect
  `prefers-reduced-motion` (show the final state, no loop).

## Page structure — `index.html`

1. **Intro (compact, not a marketing hero; ~70vh max).** Small photo, "Klayver Paz",
   "AI Engineer · LLM Agents & RAG", one line ("I build AI systems that run in production — from
   multi-agent LLM workflows to computer vision adopted by government."), "Fortaleza, Brazil ·
   Remote, US time-zone overlap". Buttons: **Download résumé (PDF)**, **Email**, LinkedIn, GitHub.
   Right side (desktop) / below (mobile): the **rotating case showcase** from the Arke hero
   (01 / 06, auto-advancing scene with case name + "See case →").
2. **Impact strip** — 4 big numbers, Arke "authority" style:
   `1 month → 40 min` (budget agent) · `17% → 100% recall` (budget agent, hardest eval case) ·
   `Government standard` (MIDR, TCE-CE) · `6 years` shipping ML/AI (Oct 2020 →).
3. **Where my work runs** — name marquee (text + flag): NYU VIDA (US), Agilean, Atlântico,
   UFC / FUNCAP, TCE-CE, Fortaleza City Hall.
4. **Selected work** — 6 case cards, alternating scene left/right on desktop, stacked on mobile.
   Each card: scene · tag (domain · where) · title · **Challenge** (1 line) · **What I built**
   (1–2 lines) · **Impact** (one big number or phrase) · 4–6 stack chips · "Case details →".
5. **Experience** — compact timeline, one line each: role · company · dates (no bullets).
   Agilean appears twice (2020–2024 employee; 2026 work is under Arke).
6. **Toolbox** — 4 groups of chips (LLM/Agents, Backend, ML/CV & Geo, Cloud/DevOps), short.
7. **Footer CTA** — "Let's talk." + email, LinkedIn, résumé PDF.

Nav (sticky, minimal): Work · Experience · Résumé ↓.

## How Arke and side ventures are framed (Klayver's constraint)

Klayver owns Arke Analytica, but recruiters must **not** read him as a business owner who will
split his time — he is looking for a full-time role. So:

- Arke appears **only as the employer line** ("AI Engineer · Arke Analytica · Jan 2026 – Present"),
  same as the résumé. Never "founder", "owner", "my company", "my clients", "agency", "our team".
- Cases done through Arke in 2026 are tagged **"Construction-tech SaaS · 2026"**: the résumé lists that client as
  "Confidential (under NDA)", so the site does not name it. Agilean is named only as the 2020–2024 employer
  (and was removed from the logo strip to avoid pointing at the 2026 client).
- **Seegold is left out** of the portfolio (it is his own product; same risk). `finance-skill`
  is left out too (personal side project). Both detail pages are deleted.

## The six cases

| # | Slug | Card title | Scene | Impact headline |
|---|------|-----------|-------|-----------------|
| 1 | `multi-agent-ops` (kept for old links) | A month of work in 40 minutes | Arke `mo-month` | ~1 month → ~40 min per cycle |
| 2 | `restrictions-rag` (new) | Suggesting site constraints from past projects | **Adapted** from Arke `sc-tasks` (activities selected → suggestions appear, each with its source badge: this project / same company / general base) | Suggestions grounded in 3 tiers of history; human approves before saving |
| 3 | `construction-forecast` (new) | Forecasting construction delays and waste | Arke `mo-site` | Qualitative (no number available) |
| 4 | `midr` | Road inspection from video | Arke `mo-road` | Adopted as TCE-CE inspection standard · patented |
| 5 | `nutrir` | Checking public meals from a photo | **New scene** (photo → segmented plate → % per item + scale weight → nutrition record) | Deployed by Fortaleza City Hall |
| 6 | `crif` | The whole city on one comparable map | Arke `mo-map` | Adopted by NYU's UrbanMapper framework |

Case facts:

- **1 — Budget agent (Agilean, 2026, via Arke).** The "1 month → 40 min" is specifically the
  **budget agent**: it associates schedule packages to budget items in a scenario, in two
  human-approved steps (compatibilization → cost), LangGraph with interrupts. Accuracy harness with
  blessed baselines per model/commit; on the hardest reference case recall went **0.17 → 1.00**
  with zero leakage (source: `agilean-mcp-server/docs/superpowers/2026-08-04-relatorio-final-obra-de-referencia.md`).
  Model in production: Claude Haiku 4.5; OpenAI embeddings; pgvector; Redis checkpoints; SSE.
- **2 — Restrictions agent (Agilean, 2026).** User selects up to 8 activities; agent suggests
  restrictions via semantic search over own project → same constructor → curated general base,
  each with a 2-sentence justification and its source; never picks the responsible person, never
  saves on its own (source: `Agilean/docs/resumo-agente-restricoes.md`). The conversational
  Planner (clone project/restrictions/topology with a confirmation plan) can be mentioned on the
  detail page of case 1 or 2 as the surrounding platform, not as its own case.
- **3 — Construction forecasting (Agilean employee, Oct 2020 – Nov 2024).** ML and data mining
  over operational data from thousands of construction projects to forecast site waste and
  schedule delay; plus ETL on Azure Data Factory and C#/.NET + Python services. Card only shows a
  qualitative impact; detail page kept short (problem, approach, stack) — no invented metrics.
- **4–6** — content condensed from `portfolio.json` `projects[]`.

## Case detail pages — `projects/<slug>.html`

Same visual language, still short. Top: big scene + title + up to 3 impact numbers. Then:
**The problem** (2–3 lines) · **How it works** (a simple HTML/SVG flow diagram, 4–6 boxes) ·
**Key decisions** (3 bullets max, one line each) · **Stack** chips · **My role** (one line) ·
"← All work" + next case link. Keep existing slugs so old links keep working.

## Résumé changes bundled with this work

The single résumé is the English PDF at `https://klayverpaz.github.io/Klayver_Paz_Resume.pdf`
(the link Klayver sends to recruiters). Changes:

- **Remove Seegold entirely** from `resume.tex` and `portfolio.json` (Featured Projects), so the
  résumé and the portfolio tell the same story (no side business). Also remove `finance-skill`
  from both if it remains, for the same reason.
- **Fix attribution of "~1 month → ~40 min"**: it comes from the **budget agent** (associating
  schedule packages to budget items), not from the ReAct planner. Reword the Arke highlight.
- Recompile `Klayver_Paz_Resume.pdf` (same filename, same URL).
- **Clean up other résumé files:** delete `Klayver_Paz_Curriculo.pdf` and `resume_pt.tex`
  (both untracked; Portuguese version no longer maintained). Only the English PDF remains.

## Hands off

The Arke site repo (`~/projects/Arke/arke-site`) is **read-only** for this work: copy scene
markup/CSS/JS and fonts out of it, never edit it.

## Verification

- Playwright spec `tests/e2e/portfolio.spec.ts` (desktop 1440 + mobile 390): every page loads
  with no console errors, no horizontal scroll, all 6 cards + detail links resolve, résumé PDF
  link resolves, `noindex` meta present, reduced-motion shows final scene state.
- `pytest tests/` still passes (schema tests; render tests replaced or removed).

## Left to the builder

Exact copy wording within the length limits above; scene timing; the flow diagrams' boxes;
how much of Arke's CSS to carry vs rewrite; whether the showcase reuses card scenes via cloning.


## Changes made during implementation

- Pages are plain static HTML (the one-off writer script was not kept); edit them directly.
- Detail pages for MIDR and Nutrir use real field photos (`portfolio_media/patch.png`, `stopsign.png`,
  `Quentinha.png`, `nutrir_sample.jpeg`); the Nutrir scene animates over the real meal photo.
- Résumé: the "multi-agent" featured project became **Budget-Matching Agent**; "client's own history"
  became "platform's own history".
- `index_template.html`, `project_template.html` and the old CSS were deleted; `generate_portfolio.py` only builds the PDF.
