# CV / Portfolio Update — Design Spec

**Date:** 2026-05-04
**Owner:** Klayver Paz
**Repo:** `klayverpaz.github.io`
**Status:** Approved (brainstorming phase complete)

---

## 1. Goal

Migrate the CV (`resume.html`) and portfolio site (`index.html` + new
`projects/` detail pages) from a "Data Scientist / AI Specialist"
positioning to a **Full-Stack AI Engineer** positioning that surfaces
recent agent-engineering work (LangGraph, LangSmith, Pinecone,
multi-agent orchestration) without exposing client identities under NDA.

The current site undersells the engineer's range — frontend, DDD/CQRS
backend, agentic systems, and CV/geospatial research are all present in
the body of work but missing from the public profile.

## 2. Audience Priority

1. International remote AI Engineer roles (US/EU) — primary
2. Brazilian tech recruiters for AI / ML Engineer (PJ or CLT) — secondary
3. Potential consulting clients via Arke Analytica — tertiary

Decision implications:
- Copy stays in English (already the case).
- Stack-forward, technical-depth visible.
- Quantified outcomes still included (serves audience 3 too).

## 3. Title & Positioning Strategy

**Layered approach — different layers do different jobs:**

| Layer | Text | Function |
|---|---|---|
| Site/CV headline label | **AI Engineer** | ATS keyword, recruiter scan, broad search |
| Tagline / summary | "Full-stack AI Engineer specializing in production agent systems. Build end-to-end AI products — LangGraph multi-agent orchestration, FastAPI backends, React frontends. Research roots in computer vision and geospatial ML at NYU." | Glue + value prop |
| Current role title | **AI Engineer / Agent Engineer @ Arke Analytica** | Niche signal, current focus |
| Skills first category | "Core (Agent / LLM Engineering)" | Depth |

The slash inline at role level (`AI Engineer / Agent Engineer`) gives both
ATS-friendly and niche-specific keywords without forcing a choice.

**Arke framing:** the consulting microempresa is positioned by role title
(AI Engineer / Agent Engineer @ Arke Analytica) without using the word
"founder" or "consultant". Bullets carry the implementation signal.

## 4. Resume Sections (final approved copy)

### 4.1 Header

```
Name:     Klayver Paz
Headline: AI Engineer
Summary:  Full-stack AI Engineer specializing in production agent
          systems. Build end-to-end AI products — LangGraph
          multi-agent orchestration, FastAPI backends, React
          frontends. Research roots in computer vision and
          geospatial ML at NYU.
Contact:  klayverpaz@gmail.com · +55 85 99692-9159 / +1 (917) 310-8558
          Fortaleza, Brazil 🇧🇷 & New York, USA 🇺🇸
Social:   LinkedIn · GitHub · Instagram (decision pending — keep or drop)
```

### 4.2 Work Experience — Arke (current)

```
AI Engineer / Agent Engineer @ Arke Analytica
Jan 2026 – Present  |  Fortaleza, Brazil

Building production AI products for B2B platforms. Independent practice.

• Reduced a recurring B2B operational workflow from ~1 month to
  ~40 minutes (~99% cycle-time reduction) by building a production
  multi-agent system on LangGraph: intent classification,
  deterministic workflow subgraphs, human-in-the-loop confirmation
  gates for state-changing operations.

• Designed lateral-query interrupt-and-resume pattern enabling users
  to pause in-flight workflows, ask side questions, then resume from
  the exact same node.

• Implemented session persistence with Redis checkpoints (TTL-bounded)
  and bearer-token pass-through auth where the agent never stores
  credentials. Deployed on AWS (ECS, MemoryDB).

• Delivered full-stack AI product end-to-end: FastAPI + async
  SQLAlchemy + Postgres backend with LangGraph AI module (Anthropic /
  OpenAI provider abstraction, SSE streaming) + React 19 + TypeScript +
  Tailwind frontend.

• Developed Anthropic Skill for personal-finance automation —
  stage-based state machine processing bank statements with validation
  gates, idempotent imports, and self-improving merchant classification.

Stack: LangGraph · LangSmith · Pinecone · Redis · FastAPI · React 19 ·
       TypeScript · Tailwind · AWS · PostgreSQL · Anthropic / OpenAI
```

### 4.3 Work Experience — NYU

```
Research Scientist (Data Science) @ Vida Center,
NYU Tandon School of Engineering
Sep 2025 – Dec 2025  |  New York, USA

Contributed to the UrbanMapper project — an analytics framework for
large-scale urban Big Data processing and spatial-temporal modeling.

• Built CRIF (Calibrated Raster Interpolation), a Python library for
  unified geospatial rasterization and dasymetric mapping — formal
  mathematical derivation, custom Jupyter widgets, Docker packaging.

• Applied Bayesian modeling and geospatial methods (GeoPandas,
  Rasterio) to urban Big Data: point-to-raster aggregation, polygon
  rasterization with overlap handling, hotspot discovery via raster
  fusion.

• Collaborated with interdisciplinary teams (urban science, data
  visualization, applied math) to enhance data-driven decision-making
  in research contexts.

Stack: Python · GeoPandas · Rasterio · PyTorch · Bayesian modeling ·
       Jupyter widgets · Docker
```

### 4.4 Work Experience — Older Entries

```
Data Scientist @ Atlântico
Nov 2024 – Aug 2025  |  Fortaleza, Brazil

Built NLP and anomaly detection systems for industrial datasets.

• Shipped NLP pipelines (sentiment analysis, entity recognition) using
  RAG patterns over Ollama and GPT models — early production work with
  LLMs before the agent stack matured.
• Built anomaly detection and defect-forecasting models for industrial
  time-series data.
• Delivered APIs and microservices on Azure (Python + .NET).

Stack: Python · Ollama · GPT · RAG · Azure · .NET
```

```
Data Scientist & Software Developer @ Agilean
Oct 2020 – Nov 2024  |  Fortaleza, Brazil

Built predictive analytics and data integration systems for the
construction and industrial sectors.

• Forecasted construction-site waste and schedule delay using ML and
  data-mining over operational data.
• Designed and deployed ETL pipelines on Azure Data Factory.
• Built APIs and microservices in C# ASP.NET MVC and Python on
  Azure Cloud.

Stack: Python · ML · Azure · ETL · C# / .NET
```

```
Researcher @ Chief Scientist Program (FUNCAP, Ceará State Government)
Jan 2020 – Sep 2025  |  Fortaleza, Brazil

Computer vision research applied to highway infrastructure management.

• Built MIDR — a YOLO-ensemble defect-detection system with custom
  IOU/NMS fusion logic. Patented and currently the standard inspection
  system used by the Court of Accounts of the State of Ceará (TCE-CE).
• Designed scalable data pipelines for storage, preprocessing, and
  modeling of highway imagery datasets.
• Collaborated with civil engineering and AI experts; iteratively
  refined defect-detection accuracy across model generations.

Stack: PyTorch · YOLO · Ultralytics · OpenCV · Python
```

> Note: the previous CV listed "Junior Data Science Researcher" and
> "Research Scientist, Data Science" as two separate Chief Scientist
> Program entries. The new spec consolidates both into a single
> 2020–2025 entry to reduce timeline fragmentation.

### 4.5 Skills

Tag-list per category, no proficiency bars.

```
Core (Agent / LLM Engineering)
  LangGraph · LangSmith · LangChain · Anthropic Skills protocol ·
  Multi-agent orchestration · HITL workflows · RAG · Pinecone ·
  OpenAI / Anthropic SDKs · MCP

Backend Engineering
  Python 3.12 · FastAPI · Pydantic v2 · SQLAlchemy 2.0 async ·
  Alembic · PostgreSQL / SQL Server · Redis · DDD + CQRS ·
  Value Objects · vertical slicing

Frontend Engineering
  TypeScript · React 19 · Vite · Tailwind v4 · TanStack Query v5 ·
  React Router v7 · Radix UI · react-hook-form + zod · Vitest · MSW

DevOps & Quality
  Docker · CI/CD (Bitbucket Pipelines, GitHub Actions) · pytest ·
  ruff · mypy · type-checked Python · AWS (ECS, MemoryDB)

Computer Vision & Geospatial ML
  PyTorch · YOLO (ensemble + custom fusion) · OpenCV · scikit-learn ·
  Bayesian modeling · GeoPandas · Rasterio · pandas / NumPy

Past stack (still serviceable if needed)
  C# / .NET · Azure · Power BI · Microsoft Fabric · Databricks
```

### 4.6 Education

```
B.S. Civil Engineering — Universidade Federal do Ceará (UFC) · 2022
Concurrent research training in Data Science via Chief Scientist
Program (FUNCAP, Ceará State Government).

Selected coursework (computer science track):
  Machine Learning · Data Mining · Digital Image Processing ·
  Numerical Methods · Programming Fundamentals · Linear Algebra ·
  Probability & Statistics · Optimization

Research Scientist (Data Science) — NYU Tandon School of Engineering,
Vida Center · Sep 2025 – Dec 2025
Urban analytics and geospatial ML research affiliation
(UrbanMapper / CRIF). Also listed under Work Experience.
```

Rationale: surfaces NYU credibility inside Education without claiming a
degree, and counters the "civil engineering ≠ tech" inference for
international recruiters by listing the CS-track coursework explicitly.

### 4.7 Languages

```
English · Full professional proficiency
Portuguese · Native speaker
```

### 4.8 Interests

```
Economics · Incentives and decision-making in complex systems.
Game Theory · Strategic interaction and applications in AI / human behavior.
Kickboxing · Practitioner and competitor (Blue Belt).
```

## 5. Projects / Case Studies Index

Six projects, ordered to lead with current agent work, then breadth, then
depth and research credibility.

| # | Title | Codename | Status | Hero signal | Detail page |
|---|---|---|---|---|---|
| 1 | Multi-Agent Operations Assistant | (private client, NDA) | Production · Confidential | LangGraph multi-agent + HITL + lateral query | `/projects/multi-agent-ops.html` |
| 2 | Etherpay — Full-Stack AI SaaS | Etherpay | Pre-launch · Pilot ready | DDD/CQRS backend + LangGraph + React 19 frontend | `/projects/etherpay.html` |
| 3 | Personal Finance Skill | fatura-processor | In development · Anthropic Skill | State-machine PDF parser, validation gates | `/projects/finance-skill.html` |
| 4 | CRIF — Calibrated Raster Interpolation | CRIF | Open research · NYU | Geospatial library, formal math, dasymetric mapping | `/projects/crif.html` |
| 5 | MIDR — Pavement Defect Detection | MIDR | Production · Patented | YOLO ensemble custom fusion, used by TCE-CE | `/projects/midr.html` |
| 6 | Nutrir — Meal Verification CV | Nutrir | Production · Adopted by Fortaleza | Plate-segmentation CV system | `/projects/nutrir.html` |

### 5.1 Card Layout (grid on `index.html`)

```
┌─────────────────────────────────────┐
│ [hero image / diagram]              │
│                                     │
│ <Project Title>                     │
│ <Status tag>                        │
│ ─────────────────────────────────── │
│ <Tagline — 1 line>                  │
│                                     │
│ [Stack][Chip][Chip][Chip]           │
│                          Read more →│
└─────────────────────────────────────┘
```

### 5.2 Detail Page Template

```markdown
# <Title>
**Tagline:** <1-line value prop>
**Status:** Production / Patented / Sanitized case study / In development

## Problem
<2–3 sentences — business context, pain, stakes>

## Architecture
<sanitized diagram — abstracted node names if NDA>
<2–3 paragraphs explaining decisions: why this pattern, alternatives ruled out>

## Tech Stack
<full list — every tech a recruiter might search>

## Engineering Highlights
- <non-obvious technical decision 1>
- <non-obvious technical decision 2>
- <trade-off explained>

## Outcomes
- <metric 1: time saved / accuracy / throughput>
- <metric 2: adoption / users / volume>

## Demo
<embedded Loom/MP4 30–90s — sanitized UX>
```

Sanitization rules for NDA projects (e.g., Multi-Agent Operations
Assistant):
- No client name, product name, or industry-specific identifiers in the
  rendered output.
- Architecture diagrams use abstract node names ("Analytical Agent",
  "Workflow Agent") instead of business-specific names.
- Outcomes can include technical surface area metrics (e.g.,
  "12 query types") but not business numbers without explicit approval.
- Tagline frames the system in pattern terms ("conversational AI for
  enterprise B2B SaaS"), not domain terms.

## 6. Portfolio Site Architecture

```
klayverpaz.github.io/
├── index.html                 # hub: hero + projects grid (6 cards)
├── resume.html                # CV (rendered from portfolio.json)
├── projects/
│   ├── multi-agent-ops.html
│   ├── etherpay.html
│   ├── finance-skill.html
│   ├── crif.html
│   ├── midr.html
│   └── nutrir.html
├── portfolio_media/
│   ├── diagrams/              # sanitized architecture diagrams (PNG/SVG)
│   ├── demos/                 # mp4/gif/webm
│   └── covers/                # 6 hero cards 16:9
├── portfolio.json             # source of truth — CV data
├── projects.json              # source of truth — project metadata
└── generate_portfolio.py      # template renderer (existing — extend)
```

Rendering flow:
- `portfolio.json` + `resume_template.html` → `resume.html`
- `projects.json` + `index_template.html` → `index.html`
- `projects.json` + `project_template.html` (new) → `projects/<slug>.html`

Single source of truth: edit JSON, regenerate HTML. Pattern matches the
existing `generate_portfolio.py` design.

## 7. Asset Checklist

| Project | Cover | Architecture diagram | Demo | Case study text |
|---|---|---|---|---|
| Multi-Agent Ops | TODO | TODO (sanitized) | impossible (NDA) | TODO |
| Etherpay | TODO | TODO | TODO (record Loom) | TODO |
| Finance Skill | TODO | TODO | TODO (record Loom) | TODO |
| CRIF | exists (`media/`) | exists (`crif_ui.png`) | optional | base on README |
| MIDR | exists (`portfolio_media/midr.png`) | TODO (ensemble) | exists (Instagram reel) | base on existing CV entry |
| Nutrir | exists (`portfolio_media/nutrir*`) | TODO | optional | base on existing CV entry |

## 8. Order of Operations (implementation phase)

1. Update `portfolio.json` with new CV data — work experience, skills,
   education, languages, contact.
2. Create `projects.json` with case-study metadata for the six projects.
3. Update `resume_template.html` to render skills as tag-list per
   category instead of proficiency bars.
4. Create `project_template.html` Jinja template for detail pages.
5. Update `index_template.html` to render the 6-card project grid.
6. Update `generate_portfolio.py` to also render `projects/*.html` from
   `projects.json` + the new template.
7. Write the six case-study bodies (markdown source committed alongside
   `projects.json` or inline in JSON).
8. Produce sanitized architecture diagrams (Mermaid → PNG export) for
   the four projects missing diagrams (Multi-Agent Ops, Etherpay,
   Finance Skill, MIDR).
9. Capture demo videos (Loom 30–90s) for Etherpay and Finance Skill.
10. Regenerate site and deploy via GitHub Pages.

## 9. Out of Scope

- LinkedIn profile rewrite (separate follow-up after CV ships).
- Blog posts / talks (mentioned as long-term ideas but not part of this
  spec).
- New domain or hosting (stay on `klayverpaz.github.io`).
- Public OSS release of any private repos. Idea-protection decisions
  (provisional patents, skeleton-public approach) are deferred.

## 10. Open Questions

- Instagram link in social — keep or drop for B audience?
- Decision on whether to publish a public "skeleton" version of any
  private repo (Etherpay, Finance Skill) — deferred until after first
  pilot launch.
