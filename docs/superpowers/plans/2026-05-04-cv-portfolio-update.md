# CV / Portfolio Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `klayverpaz.github.io` from "Data Scientist / AI Specialist" positioning to "Full-Stack AI Engineer" positioning with NDA-safe sanitized case-study detail pages, driven by an extended `portfolio.json` schema.

**Architecture:** Single source of truth in `portfolio.json` consumed by `generate_portfolio.py` (Jinja2 renderer). Existing templates updated for new skill rendering (tag-list per category) and education layout. New `project_template.html` produces one detail page per project under `projects/<slug>.html`. Test pipeline (pytest) validates JSON schema and rendered HTML output.

**Tech Stack:** Python 3 · Jinja2 · pytest · GitHub Pages (static hosting). No new runtime dependencies beyond `pytest`.

**Reference Spec:** `docs/superpowers/specs/2026-05-04-cv-portfolio-update-design.md`

---

## File Structure

| Path | Status | Responsibility |
|---|---|---|
| `portfolio.json` | modify | Single source of truth: CV data + 6 project case studies |
| `resume_template.html` | modify | Render `resume.html` with skills + education sections |
| `index_template.html` | modify | Render `index.html` hub: hero + project card grid + skills tag-list |
| `project_template.html` | create | Render one detail page per project (`projects/<slug>.html`) |
| `generate_portfolio.py` | modify | Also render `projects/*.html` from per-project data |
| `css/main.css` | modify | Add styles for: skill-category, stack-chip, project-card, status-tag |
| `css/projects.css` | create | Detail-page-specific layout (problem/architecture/outcomes sections) |
| `requirements.txt` | modify | Add `pytest` for test infrastructure |
| `tests/__init__.py` | create | Empty marker |
| `tests/test_schema.py` | create | Validate `portfolio.json` shape (required keys, project status enum, etc.) |
| `tests/test_render.py` | create | Render templates with `portfolio.json` and assert key strings present in output HTML |
| `projects/` | create | Output directory for generated detail pages (gitignored if pre-generated) |
| `portfolio_media/diagrams/` | create | Architecture diagram assets (PNG, sanitized) |
| `portfolio_media/covers/` | create | Project hero card images (16:9) |
| `portfolio_media/demos/` | create | Optional demo video files (mp4/gif) |
| `.gitignore` | modify | Ensure `__pycache__`, `.pytest_cache` ignored |

---

## Phase 0 — Test Infrastructure

### Task 0.1: Add pytest dependency

**Files:**
- Modify: `requirements.txt`

- [ ] **Step 1: Add pytest to requirements**

```
Jinja2==3.1.4
MarkupSafe==3.0.2
pytest==8.3.3
```

- [ ] **Step 2: Install**

Run:
```bash
cd /Users/klayver/Repositories/mind/klayverpaz.github.io
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Expected: `Successfully installed Jinja2-3.1.4 MarkupSafe-3.0.2 pytest-...`

- [ ] **Step 3: Update .gitignore**

Append to `.gitignore`:
```
.venv/
__pycache__/
.pytest_cache/
*.pyc
```

- [ ] **Step 4: Commit**

```bash
git add requirements.txt .gitignore
git commit -m "chore: add pytest for template/schema tests"
```

### Task 0.2: Create test scaffolding

**Files:**
- Create: `tests/__init__.py`
- Create: `tests/conftest.py`

- [ ] **Step 1: Write the failing test**

Create `tests/__init__.py` (empty file).

Create `tests/test_smoke.py`:
```python
def test_pytest_runs():
    assert True
```

- [ ] **Step 2: Run test**

Run:
```bash
cd /Users/klayver/Repositories/mind/klayverpaz.github.io
.venv/bin/pytest tests/ -v
```

Expected: `tests/test_smoke.py::test_pytest_runs PASSED`

- [ ] **Step 3: Add a fixture for loading portfolio.json**

Create `tests/conftest.py`:
```python
import json
from pathlib import Path

import pytest


@pytest.fixture
def portfolio_data():
    """Load portfolio.json from repo root."""
    root = Path(__file__).resolve().parent.parent
    with (root / "portfolio.json").open(encoding="utf-8") as f:
        return json.load(f)
```

- [ ] **Step 4: Commit**

```bash
git add tests/__init__.py tests/conftest.py tests/test_smoke.py
git commit -m "test: add pytest scaffolding and portfolio fixture"
```

---

## Phase 1 — Schema Update for portfolio.json

### Task 1.1: Define and validate the new top-level schema

**Files:**
- Create: `tests/test_schema.py`

- [ ] **Step 1: Write the failing test**

Create `tests/test_schema.py`:
```python
"""Schema validation tests for portfolio.json.

These tests document the required shape of portfolio.json.
The schema is intentionally enforced here (not in a separate JSON Schema
file) because pytest is the only consumer of validation, and the data
file is hand-edited.
"""

VALID_PROJECT_STATUSES = {
    "Production",
    "Production · Confidential",
    "Production · Patented",
    "Production · Adopted",
    "Pre-launch · Pilot ready",
    "In development · Anthropic Skill",
    "Open research",
}


def test_top_level_keys_present(portfolio_data):
    required = {
        "name",
        "label",
        "headline",
        "summary",
        "image_path",
        "base_url",
        "contact",
        "social_links",
        "work_experience",
        "skills",
        "projects",
        "education",
        "languages",
        "interests",
    }
    missing = required - set(portfolio_data.keys())
    assert not missing, f"missing top-level keys: {missing}"


def test_skills_is_categorized(portfolio_data):
    """Skills must be a list of {category, items[]} objects."""
    skills = portfolio_data["skills"]
    assert isinstance(skills, list) and skills
    for block in skills:
        assert "category" in block, f"skill block missing 'category': {block}"
        assert "items" in block, f"skill block missing 'items': {block}"
        assert isinstance(block["items"], list) and block["items"]


def test_languages_shape(portfolio_data):
    langs = portfolio_data["languages"]
    assert isinstance(langs, list) and langs
    for lang in langs:
        assert "language" in lang
        assert "fluency" in lang


def test_education_shape(portfolio_data):
    edu = portfolio_data["education"]
    assert isinstance(edu, list) and edu
    for entry in edu:
        assert "institution" in entry
        assert "kind" in entry, "each education entry must declare 'kind' (degree | research_affiliation)"
        assert entry["kind"] in {"degree", "research_affiliation"}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
.venv/bin/pytest tests/test_schema.py -v
```

Expected: tests fail because `portfolio.json` does not yet contain `headline`, categorized skills, or `kind` on education entries.

- [ ] **Step 3: Update portfolio.json — top-level fields**

Edit `portfolio.json`:
- Change `"label"` value to `"AI Engineer"` (the new headline label).
- Add new key `"headline": "AI Engineer"` at top level.
- Replace `"summary"` value with: `"Full-stack AI Engineer specializing in production agent systems. Build end-to-end AI products — LangGraph multi-agent orchestration, FastAPI backends, React frontends. Research roots in computer vision and geospatial ML at NYU."`

- [ ] **Step 4: Run test to verify partial progress**

Run:
```bash
.venv/bin/pytest tests/test_schema.py::test_top_level_keys_present -v
```

Expected: PASS (top-level keys present). Other schema tests still fail until subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add tests/test_schema.py portfolio.json
git commit -m "test(schema): add top-level portfolio.json schema test and headline field"
```

### Task 1.2: Update work_experience entries

**Files:**
- Modify: `portfolio.json`

- [ ] **Step 1: Add Arke entry as first work_experience element**

Edit `portfolio.json`. Replace the `"work_experience"` array's first element so the array begins with this entry (preserve subsequent entries — Atlântico, Agilean, etc. — in order with edits below):

```json
{
  "company": "Arke Analytica",
  "position": "AI Engineer / Agent Engineer",
  "url": "",
  "start_date": "January 2026",
  "end_date": "Present",
  "summary": "Building production AI products for B2B platforms. Independent practice.",
  "highlights": [
    "Reduced a recurring B2B operational workflow from ~1 month to ~40 minutes (~99% cycle-time reduction) by building a production multi-agent system on LangGraph: intent classification, deterministic workflow subgraphs, human-in-the-loop confirmation gates for state-changing operations.",
    "Designed lateral-query interrupt-and-resume pattern enabling users to pause in-flight workflows, ask side questions, then resume from the exact same node.",
    "Implemented session persistence with Redis checkpoints (TTL-bounded) and bearer-token pass-through auth where the agent never stores credentials. Deployed on AWS (ECS, MemoryDB).",
    "Delivered full-stack AI product end-to-end: FastAPI + async SQLAlchemy + Postgres backend with LangGraph AI module (Anthropic / OpenAI provider abstraction, SSE streaming) + React 19 + TypeScript + Tailwind frontend.",
    "Developed Anthropic Skill for personal-finance automation — stage-based state machine processing bank statements with validation gates, idempotent imports, and self-improving merchant classification."
  ],
  "stack": [
    "LangGraph", "LangSmith", "Pinecone", "Redis", "FastAPI",
    "React 19", "TypeScript", "Tailwind", "AWS", "PostgreSQL",
    "Anthropic / OpenAI"
  ]
}
```

- [ ] **Step 2: Update NYU entry**

Replace the existing NYU `Vida Center` work_experience entry with:

```json
{
  "company": "Vida Center — NYU Tandon School of Engineering",
  "position": "Research Scientist (Data Science)",
  "url": "https://vida.engineering.nyu.edu/",
  "start_date": "September 2025",
  "end_date": "December 2025",
  "summary": "Contributed to the UrbanMapper project — an analytics framework for large-scale urban Big Data processing and spatial-temporal modeling.",
  "highlights": [
    "Built CRIF (Calibrated Raster Interpolation), a Python library for unified geospatial rasterization and dasymetric mapping — formal mathematical derivation, custom Jupyter widgets, Docker packaging.",
    "Applied Bayesian modeling and geospatial methods (GeoPandas, Rasterio) to urban Big Data: point-to-raster aggregation, polygon rasterization with overlap handling, hotspot discovery via raster fusion.",
    "Collaborated with interdisciplinary teams (urban science, data visualization, applied math) to enhance data-driven decision-making in research contexts."
  ],
  "stack": [
    "Python", "GeoPandas", "Rasterio", "PyTorch",
    "Bayesian modeling", "Jupyter widgets", "Docker"
  ]
}
```

- [ ] **Step 3: Update Atlântico entry**

Replace its `summary`, `highlights`, and add `stack`:

```json
{
  "company": "Atlântico",
  "position": "Data Scientist",
  "url": "https://www.atlantico.com.br/",
  "start_date": "November 2024",
  "end_date": "August 2025",
  "summary": "Built NLP and anomaly detection systems for industrial datasets.",
  "highlights": [
    "Shipped NLP pipelines (sentiment analysis, entity recognition) using RAG patterns over Ollama and GPT models — early production work with LLMs before the agent stack matured.",
    "Built anomaly detection and defect-forecasting models for industrial time-series data.",
    "Delivered APIs and microservices on Azure (Python + .NET)."
  ],
  "stack": ["Python", "Ollama", "GPT", "RAG", "Azure", ".NET"]
}
```

- [ ] **Step 4: Update Agilean entry**

Replace summary/highlights and add stack:

```json
{
  "company": "Agilean",
  "position": "Data Scientist & Software Developer",
  "url": "https://www.agilean.com.br/",
  "start_date": "October 2020",
  "end_date": "November 2024",
  "summary": "Built predictive analytics and data integration systems for the construction and industrial sectors.",
  "highlights": [
    "Forecasted construction-site waste and schedule delay using ML and data-mining over operational data.",
    "Designed and deployed ETL pipelines on Azure Data Factory.",
    "Built APIs and microservices in C# ASP.NET MVC and Python on Azure Cloud."
  ],
  "stack": ["Python", "ML", "Azure", "ETL", "C# / .NET"]
}
```

- [ ] **Step 5: Consolidate Chief Scientist Program entries**

Remove BOTH existing Chief Scientist Program entries (Junior + Research Scientist) and replace with a single consolidated entry:

```json
{
  "company": "Chief Scientist Program (FUNCAP, Ceará State Government)",
  "position": "Researcher",
  "url": "https://www.funcap.ce.gov.br/cientista-chefe-de-infraestrutura",
  "start_date": "January 2020",
  "end_date": "September 2025",
  "summary": "Computer vision research applied to highway infrastructure management.",
  "highlights": [
    "Built MIDR — a YOLO-ensemble defect-detection system with custom IOU/NMS fusion logic. Patented and currently the standard inspection system used by the Court of Accounts of the State of Ceará (TCE-CE).",
    "Designed scalable data pipelines for storage, preprocessing, and modeling of highway imagery datasets.",
    "Collaborated with civil engineering and AI experts; iteratively refined defect-detection accuracy across model generations."
  ],
  "stack": ["PyTorch", "YOLO", "Ultralytics", "OpenCV", "Python"]
}
```

- [ ] **Step 6: Verify final ordering**

The `work_experience` array must be ordered: Arke, Vida Center / NYU, Atlântico, Agilean, Chief Scientist Program.

- [ ] **Step 7: Commit**

```bash
git add portfolio.json
git commit -m "feat(content): rewrite work experience with new positioning and stack data"
```

### Task 1.3: Replace skills array with categorized blocks

**Files:**
- Modify: `portfolio.json`

- [ ] **Step 1: Replace `skills` array**

Replace the entire `"skills"` array value with:

```json
[
  {
    "category": "Core (Agent / LLM Engineering)",
    "items": [
      "LangGraph", "LangSmith", "LangChain", "Anthropic Skills protocol",
      "Multi-agent orchestration", "HITL workflows", "RAG", "Pinecone",
      "OpenAI / Anthropic SDKs", "MCP"
    ]
  },
  {
    "category": "Backend Engineering",
    "items": [
      "Python 3.12", "FastAPI", "Pydantic v2", "SQLAlchemy 2.0 async",
      "Alembic", "PostgreSQL / SQL Server", "Redis", "DDD + CQRS",
      "Value Objects", "vertical slicing"
    ]
  },
  {
    "category": "Frontend Engineering",
    "items": [
      "TypeScript", "React 19", "Vite", "Tailwind v4",
      "TanStack Query v5", "React Router v7", "Radix UI",
      "react-hook-form + zod", "Vitest", "MSW"
    ]
  },
  {
    "category": "DevOps & Quality",
    "items": [
      "Docker", "CI/CD (Bitbucket Pipelines, GitHub Actions)",
      "pytest", "ruff", "mypy", "type-checked Python",
      "AWS (ECS, MemoryDB)"
    ]
  },
  {
    "category": "Computer Vision & Geospatial ML",
    "items": [
      "PyTorch", "YOLO (ensemble + custom fusion)", "OpenCV",
      "scikit-learn", "Bayesian modeling", "GeoPandas", "Rasterio",
      "pandas / NumPy"
    ]
  },
  {
    "category": "Past stack (still serviceable if needed)",
    "items": [
      "C# / .NET", "Azure", "Power BI",
      "Microsoft Fabric", "Databricks"
    ]
  }
]
```

- [ ] **Step 2: Run schema test**

Run:
```bash
.venv/bin/pytest tests/test_schema.py::test_skills_is_categorized -v
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add portfolio.json
git commit -m "feat(content): switch skills to categorized tag-list schema"
```

### Task 1.4: Rewrite education and languages

**Files:**
- Modify: `portfolio.json`

- [ ] **Step 1: Replace `education` array**

```json
[
  {
    "kind": "degree",
    "institution": "Universidade Federal do Ceará (UFC)",
    "location": "Fortaleza, CE, Brazil",
    "url": "https://www.ufc.br/",
    "degree_title": "B.S. Civil Engineering",
    "graduation_date": "2022",
    "notes": "Concurrent research training in Data Science via Chief Scientist Program (FUNCAP, Ceará State Government).",
    "coursework_label": "Selected coursework (computer science track)",
    "coursework": [
      "Machine Learning", "Data Mining", "Digital Image Processing",
      "Numerical Methods", "Programming Fundamentals", "Linear Algebra",
      "Probability & Statistics", "Optimization"
    ]
  },
  {
    "kind": "research_affiliation",
    "institution": "NYU Tandon School of Engineering, Vida Center",
    "location": "New York, NY, USA",
    "url": "https://engineering.nyu.edu/",
    "role_title": "Research Scientist (Data Science)",
    "start_date": "September 2025",
    "end_date": "December 2025",
    "notes": "Urban analytics and geospatial ML research affiliation (UrbanMapper / CRIF). Also listed under Work Experience."
  }
]
```

- [ ] **Step 2: Update `languages` array**

```json
[
  {"language": "English", "fluency": "Full professional proficiency"},
  {"language": "Portuguese", "fluency": "Native speaker"}
]
```

- [ ] **Step 3: Update `interests` array (tighten copy)**

```json
[
  {
    "name": "Economics",
    "summary": "Incentives and decision-making in complex systems.",
    "images": []
  },
  {
    "name": "Game Theory",
    "summary": "Strategic interaction and applications in AI / human behavior.",
    "images": []
  },
  {
    "name": "Kickboxing",
    "summary": "Practitioner and competitor (Blue Belt).",
    "images": []
  }
]
```

- [ ] **Step 4: Run schema tests**

Run:
```bash
.venv/bin/pytest tests/test_schema.py -v
```

Expected: all schema tests PASS.

- [ ] **Step 5: Commit**

```bash
git add portfolio.json
git commit -m "feat(content): rewrite education, languages, interests for new positioning"
```

---

## Phase 2 — Project Schema and Detail-Page Generator

### Task 2.1: Add project schema test

**Files:**
- Modify: `tests/test_schema.py`

- [ ] **Step 1: Add the failing test**

Append to `tests/test_schema.py`:
```python
def test_projects_are_case_studies(portfolio_data):
    """Each project must include slug, status, tagline, stack, and case-study sections."""
    projects = portfolio_data["projects"]
    assert isinstance(projects, list) and len(projects) == 6
    seen_slugs = set()
    required_fields = {"slug", "title", "status", "tagline", "stack",
                       "cover_image", "sections"}
    for project in projects:
        missing = required_fields - set(project.keys())
        assert not missing, f"project {project.get('title')!r} missing: {missing}"
        assert project["slug"] not in seen_slugs, "duplicate slug"
        seen_slugs.add(project["slug"])

        sections = project["sections"]
        for required_section in ["problem", "architecture", "tech_stack",
                                  "engineering_highlights", "outcomes"]:
            assert required_section in sections, (
                f"project {project['title']!r} missing section "
                f"{required_section!r}"
            )
        # 'demo' is optional
```

- [ ] **Step 2: Run to verify failure**

Run:
```bash
.venv/bin/pytest tests/test_schema.py::test_projects_are_case_studies -v
```

Expected: FAIL — current `projects` array does not have the new schema.

- [ ] **Step 3: Commit**

```bash
git add tests/test_schema.py
git commit -m "test(schema): require case-study fields on each project"
```

### Task 2.2: Replace projects array with new case-study schema (skeleton with placeholders only for body sections — content comes in Phase 3)

**Files:**
- Modify: `portfolio.json`

- [ ] **Step 1: Replace `projects` array**

Replace the entire `"projects"` array with the six entries below. Section bodies marked `"TODO_PHASE_3"` are real strings and the schema test passes; Phase 3 fills them with the actual case-study copy.

```json
[
  {
    "slug": "multi-agent-ops",
    "title": "Multi-Agent Operations Assistant",
    "codename": "Confidential client",
    "status": "Production · Confidential",
    "tagline": "Conversational AI that automates complex operational workflows for an enterprise B2B SaaS platform.",
    "cover_image": "portfolio_media/covers/multi-agent-ops.png",
    "stack": ["LangGraph", "LangSmith", "Pinecone", "Redis", "FastAPI",
              "AWS (ECS, MemoryDB)", "Anthropic / OpenAI"],
    "sections": {
      "problem": "TODO_PHASE_3",
      "architecture": "TODO_PHASE_3",
      "architecture_diagram": "portfolio_media/diagrams/multi-agent-ops.png",
      "tech_stack": "TODO_PHASE_3",
      "engineering_highlights": ["TODO_PHASE_3"],
      "outcomes": ["TODO_PHASE_3"],
      "demo": null
    }
  },
  {
    "slug": "etherpay",
    "title": "Etherpay — Full-Stack AI SaaS",
    "codename": "Etherpay",
    "status": "Pre-launch · Pilot ready",
    "tagline": "Vertical SaaS for martial-arts gym operations — financial management module with embedded AI assistant.",
    "cover_image": "portfolio_media/covers/etherpay.png",
    "stack": ["FastAPI", "SQLAlchemy 2.0 async", "PostgreSQL", "Alembic",
              "LangGraph", "LangSmith", "React 19", "TypeScript",
              "Tailwind v4", "TanStack Query v5"],
    "sections": {
      "problem": "TODO_PHASE_3",
      "architecture": "TODO_PHASE_3",
      "architecture_diagram": "portfolio_media/diagrams/etherpay.png",
      "tech_stack": "TODO_PHASE_3",
      "engineering_highlights": ["TODO_PHASE_3"],
      "outcomes": ["TODO_PHASE_3"],
      "demo": "portfolio_media/demos/etherpay.mp4"
    }
  },
  {
    "slug": "finance-skill",
    "title": "Personal Finance Skill",
    "codename": "fatura-processor",
    "status": "In development · Anthropic Skill",
    "tagline": "Anthropic Skill that processes Brazilian bank statements with a stage-based state machine.",
    "cover_image": "portfolio_media/covers/finance-skill.png",
    "stack": ["Anthropic Skills protocol", "Python", "SQLite",
              "PDF parsing", "state machine"],
    "sections": {
      "problem": "TODO_PHASE_3",
      "architecture": "TODO_PHASE_3",
      "architecture_diagram": "portfolio_media/diagrams/finance-skill.png",
      "tech_stack": "TODO_PHASE_3",
      "engineering_highlights": ["TODO_PHASE_3"],
      "outcomes": ["TODO_PHASE_3"],
      "demo": "portfolio_media/demos/finance-skill.mp4"
    }
  },
  {
    "slug": "crif",
    "title": "CRIF — Calibrated Raster Interpolation",
    "codename": "CRIF",
    "status": "Open research",
    "tagline": "Geospatial library for unified rasterization and dasymetric mapping. Built at NYU Vida Center.",
    "cover_image": "portfolio_media/covers/crif.png",
    "stack": ["Python", "GeoPandas", "Rasterio", "Jupyter widgets",
              "Docker", "applied math"],
    "sections": {
      "problem": "TODO_PHASE_3",
      "architecture": "TODO_PHASE_3",
      "architecture_diagram": "portfolio_media/diagrams/crif.png",
      "tech_stack": "TODO_PHASE_3",
      "engineering_highlights": ["TODO_PHASE_3"],
      "outcomes": ["TODO_PHASE_3"],
      "demo": null
    }
  },
  {
    "slug": "midr",
    "title": "MIDR — Pavement Defect Detection",
    "codename": "MIDR",
    "status": "Production · Patented",
    "tagline": "YOLO-ensemble defect detection adopted by the Court of Accounts of Ceará (TCE-CE).",
    "cover_image": "portfolio_media/covers/midr.png",
    "stack": ["PyTorch", "YOLO", "Ultralytics", "OpenCV", "Python"],
    "sections": {
      "problem": "TODO_PHASE_3",
      "architecture": "TODO_PHASE_3",
      "architecture_diagram": "portfolio_media/diagrams/midr.png",
      "tech_stack": "TODO_PHASE_3",
      "engineering_highlights": ["TODO_PHASE_3"],
      "outcomes": ["TODO_PHASE_3"],
      "demo": "https://www.instagram.com/reel/C6wSjDZo3jv/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
  },
  {
    "slug": "nutrir",
    "title": "Nutrir — Meal Verification CV",
    "codename": "Nutrir",
    "status": "Production · Adopted",
    "tagline": "Computer vision for meal verification adopted by the Municipality of Fortaleza.",
    "cover_image": "portfolio_media/covers/nutrir.png",
    "stack": ["Python", "Computer Vision", "PyTorch", "image segmentation"],
    "sections": {
      "problem": "TODO_PHASE_3",
      "architecture": "TODO_PHASE_3",
      "architecture_diagram": "portfolio_media/diagrams/nutrir.png",
      "tech_stack": "TODO_PHASE_3",
      "engineering_highlights": ["TODO_PHASE_3"],
      "outcomes": ["TODO_PHASE_3"],
      "demo": null
    }
  }
]
```

- [ ] **Step 2: Run schema test**

Run:
```bash
.venv/bin/pytest tests/test_schema.py::test_projects_are_case_studies -v
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add portfolio.json
git commit -m "feat(content): replace projects array with 6 case-study skeletons"
```

### Task 2.3: Create project_template.html (Jinja for detail pages)

**Files:**
- Create: `project_template.html`

- [ ] **Step 1: Write the failing render test**

Create `tests/test_render.py`:
```python
"""Smoke tests that the templates render and contain the expected strings."""
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


REPO_ROOT = Path(__file__).resolve().parent.parent


def _env():
    return Environment(loader=FileSystemLoader(str(REPO_ROOT)),
                        autoescape=True)


def test_resume_template_includes_skill_categories(portfolio_data):
    template = _env().get_template("resume_template.html")
    output = template.render(**portfolio_data)
    assert "Core (Agent / LLM Engineering)" in output
    assert "LangGraph" in output


def test_index_template_includes_project_cards(portfolio_data):
    template = _env().get_template("index_template.html")
    output = template.render(**portfolio_data)
    for project in portfolio_data["projects"]:
        assert project["title"] in output
        assert project["status"] in output


def test_project_template_renders_one_project(portfolio_data):
    template = _env().get_template("project_template.html")
    project = portfolio_data["projects"][0]
    output = template.render(project=project, **portfolio_data)
    assert project["title"] in output
    assert project["tagline"] in output
    for tech in project["stack"]:
        assert tech in output
```

- [ ] **Step 2: Run to verify failure**

Run:
```bash
.venv/bin/pytest tests/test_render.py -v
```

Expected: all three tests fail (templates not yet updated, `project_template.html` missing).

- [ ] **Step 3: Create `project_template.html`**

Create `project_template.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ project.title }} — {{ name }}</title>
    <meta name="description" content="{{ project.tagline }}">
    <meta name="author" content="{{ name }}">

    <meta property="og:title" content="{{ project.title }} — {{ name }}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{{ base_url }}/projects/{{ project.slug }}.html">
    <meta property="og:image" content="{{ base_url }}/{{ project.cover_image }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="../css/modern_normalize.css" />
    <link rel="stylesheet" href="../css/html5bp.css">
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="../css/projects.css">

    <meta name="theme-color" content="#fafafa">
  </head>

  <body>
    <header class="page-header project-header">
      <div class="container">
        <p class="breadcrumb"><a href="../index.html">← Back to portfolio</a></p>
        <h1>{{ project.title }}</h1>
        <p class="status-tag">{{ project.status }}</p>
        <p class="tagline">{{ project.tagline }}</p>
      </div>
    </header>

    <main class="page-content project-detail">
      <div class="container">

        <section class="project-section">
          <h2>Problem</h2>
          <p>{{ project.sections.problem }}</p>
        </section>

        <section class="project-section">
          <h2>Architecture</h2>
          {% if project.sections.architecture_diagram %}
            <figure>
              <img src="../{{ project.sections.architecture_diagram }}"
                   alt="{{ project.title }} architecture diagram">
            </figure>
          {% endif %}
          <p>{{ project.sections.architecture }}</p>
        </section>

        <section class="project-section">
          <h2>Tech Stack</h2>
          <ul class="stack-chips">
            {% for tech in project.stack %}
              <li class="stack-chip">{{ tech }}</li>
            {% endfor %}
          </ul>
          {% if project.sections.tech_stack %}
            <p>{{ project.sections.tech_stack }}</p>
          {% endif %}
        </section>

        <section class="project-section">
          <h2>Engineering Highlights</h2>
          <ul>
            {% for item in project.sections.engineering_highlights %}
              <li>{{ item }}</li>
            {% endfor %}
          </ul>
        </section>

        <section class="project-section">
          <h2>Outcomes</h2>
          <ul>
            {% for item in project.sections.outcomes %}
              <li>{{ item }}</li>
            {% endfor %}
          </ul>
        </section>

        {% if project.sections.demo %}
          <section class="project-section">
            <h2>Demo</h2>
            {% if project.sections.demo.endswith('.mp4') or project.sections.demo.endswith('.webm') %}
              <video controls width="800">
                <source src="../{{ project.sections.demo }}">
              </video>
            {% else %}
              <p><a href="{{ project.sections.demo }}" rel="noopener noreferrer">Watch demo →</a></p>
            {% endif %}
          </section>
        {% endif %}

      </div>
    </main>

    <footer class="page-footer">
      <div class="container">
        <p>© {{ current_year }} {{ name }}. All rights reserved.</p>
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 4: Run the project_template test**

Run:
```bash
.venv/bin/pytest tests/test_render.py::test_project_template_renders_one_project -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/test_render.py project_template.html
git commit -m "feat(template): add project_template.html for case-study detail pages"
```

### Task 2.4: Update generate_portfolio.py to render projects/*.html

**Files:**
- Modify: `generate_portfolio.py`

- [ ] **Step 1: Replace generate_portfolio.py contents**

```python
import json
from datetime import UTC, datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

REPO_ROOT = Path(__file__).resolve().parent

with (REPO_ROOT / "portfolio.json").open(encoding="utf-8") as f:
    data = json.load(f)

data["current_year"] = datetime.now(tz=UTC).year

if "social_links" in data:
    for link in data["social_links"]:
        svg_path = link.get("svg_path")
        if svg_path:
            with (REPO_ROOT / svg_path).open(encoding="utf-8") as svg_file:
                link["svg_data"] = svg_file.read()

env = Environment(loader=FileSystemLoader(str(REPO_ROOT)), autoescape=True)
index_template = env.get_template("index_template.html")
resume_template = env.get_template("resume_template.html")
project_template = env.get_template("project_template.html")

# Render index + resume.
(REPO_ROOT / "index.html").write_text(
    index_template.render(**data), encoding="utf-8"
)
(REPO_ROOT / "resume.html").write_text(
    resume_template.render(**data), encoding="utf-8"
)

# Render one detail page per project.
projects_dir = REPO_ROOT / "projects"
projects_dir.mkdir(exist_ok=True)
for project in data.get("projects", []):
    slug = project["slug"]
    (projects_dir / f"{slug}.html").write_text(
        project_template.render(project=project, **data),
        encoding="utf-8",
    )

print(
    "Generated index.html, resume.html and "
    f"{len(data.get('projects', []))} project pages."
)
```

- [ ] **Step 2: Run the generator**

Run:
```bash
.venv/bin/python generate_portfolio.py
```

Expected: prints `Generated index.html, resume.html and 6 project pages.`

- [ ] **Step 3: Verify project files written**

Run:
```bash
ls projects/
```

Expected output:
```
crif.html  etherpay.html  finance-skill.html  midr.html  multi-agent-ops.html  nutrir.html
```

- [ ] **Step 4: Commit**

```bash
git add generate_portfolio.py projects/
git commit -m "feat(generator): emit one detail page per project"
```

---

## Phase 3 — Template Refresh: Skills, Education, Project Cards

### Task 3.1: Refresh resume_template.html (skills + education + work-experience stack)

**Files:**
- Modify: `resume_template.html`

- [ ] **Step 1: Update the work-experience block to render the new `stack` field**

Locate the `{% if work_experience %}` block in `resume_template.html`. Inside the per-job loop, after the highlights list, add:

```html
                  {% if job.stack %}
                    <p class="job-stack"><strong>Stack:</strong>
                      {{ job.stack | join(' · ') }}
                    </p>
                  {% endif %}
```

- [ ] **Step 2: Add Skills section to resume_template.html**

Inside the `<aside>` block (the sidebar), BEFORE the existing Languages section, insert:

```html
          {% if skills %}
            <section>
              <h2 class="section-heading">Skills</h2>
              {% for block in skills %}
                <section class="skill-category">
                  <h3>{{ block.category }}</h3>
                  <ul class="stack-chips">
                    {% for item in block.items %}
                      <li class="stack-chip">{{ item }}</li>
                    {% endfor %}
                  </ul>
                </section>
              {% endfor %}
            </section>
          {% endif %}
```

- [ ] **Step 3: Add Education section to resume_template.html**

After the Skills block (and before Languages), insert:

```html
          {% if education %}
            <section>
              <h2 class="section-heading">Education</h2>
              {% for entry in education %}
                <section class="education-entry">
                  {% if entry.url %}
                    <h3><a href="{{ entry.url }}">{{ entry.institution }}</a></h3>
                  {% else %}
                    <h3>{{ entry.institution }}</h3>
                  {% endif %}
                  {% if entry.kind == 'degree' %}
                    {% if entry.degree_title %}
                      <p>{{ entry.degree_title }}{% if entry.graduation_date %} · {{ entry.graduation_date }}{% endif %}</p>
                    {% endif %}
                    {% if entry.notes %}<p>{{ entry.notes }}</p>{% endif %}
                    {% if entry.coursework %}
                      <p>
                        <strong>{{ entry.coursework_label or 'Selected coursework' }}:</strong>
                        {{ entry.coursework | join(' · ') }}
                      </p>
                    {% endif %}
                  {% else %}
                    {% if entry.role_title %}<p>{{ entry.role_title }}</p>{% endif %}
                    {% if entry.start_date and entry.end_date %}
                      <p class="section-label">{{ entry.start_date }} – {{ entry.end_date }}</p>
                    {% endif %}
                    {% if entry.notes %}<p>{{ entry.notes }}</p>{% endif %}
                  {% endif %}
                </section>
              {% endfor %}
            </section>
          {% endif %}
```

- [ ] **Step 4: Add Interests section to resume_template.html**

After Languages, before `</aside>`:

```html
          {% if interests %}
            <section>
              <h2 class="section-heading">Interests</h2>
              {% for interest in interests %}
                <section>
                  <h3>{{ interest.name }}</h3>
                  {% if interest.summary %}<p>{{ interest.summary }}</p>{% endif %}
                </section>
              {% endfor %}
            </section>
          {% endif %}
```

- [ ] **Step 5: Run render test**

Run:
```bash
.venv/bin/pytest tests/test_render.py::test_resume_template_includes_skill_categories -v
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add resume_template.html
git commit -m "feat(template): add skills/education/interests to resume_template"
```

### Task 3.2: Refresh index_template.html (skills tag-list, education kind branching, project cards)

**Files:**
- Modify: `index_template.html`

- [ ] **Step 1: Replace the skills section in index_template.html**

Find the existing `{% if skills %}` block (uses `skill-bar-fill`) in the `<aside>`. Replace it with:

```html
          {% if skills %}
            <section>
              <h2 class="section-heading">Skills</h2>
              {% for block in skills %}
                <section class="skill-category">
                  <h3>{{ block.category }}</h3>
                  <ul class="stack-chips">
                    {% for item in block.items %}
                      <li class="stack-chip">{{ item }}</li>
                    {% endfor %}
                  </ul>
                </section>
              {% endfor %}
            </section>
          {% endif %}
```

- [ ] **Step 2: Update the education section in index_template.html**

Find the existing `{% if education %}` block (uses `Research & Education` heading). Replace its inner content so it branches on `entry.kind` exactly like the resume version:

```html
          {% if education %}
            <section>
              <h2 class="section-heading">Education</h2>
              {% for entry in education %}
                <section class="education-entry">
                  {% if entry.url %}
                    <h3><a href="{{ entry.url }}">{{ entry.institution }}</a></h3>
                  {% else %}
                    <h3>{{ entry.institution }}</h3>
                  {% endif %}
                  {% if entry.kind == 'degree' %}
                    {% if entry.degree_title %}
                      <p>{{ entry.degree_title }}{% if entry.graduation_date %} · {{ entry.graduation_date }}{% endif %}</p>
                    {% endif %}
                    {% if entry.notes %}<p>{{ entry.notes }}</p>{% endif %}
                    {% if entry.coursework %}
                      <p>
                        <strong>{{ entry.coursework_label or 'Selected coursework' }}:</strong>
                        {{ entry.coursework | join(' · ') }}
                      </p>
                    {% endif %}
                  {% else %}
                    {% if entry.role_title %}<p>{{ entry.role_title }}</p>{% endif %}
                    {% if entry.start_date and entry.end_date %}
                      <p class="section-label">{{ entry.start_date }} – {{ entry.end_date }}</p>
                    {% endif %}
                    {% if entry.notes %}<p>{{ entry.notes }}</p>{% endif %}
                  {% endif %}
                </section>
              {% endfor %}
            </section>
          {% endif %}
```

- [ ] **Step 3: Replace the projects section in index_template.html with a card grid**

Find the existing `{% if projects %}` block (uses `<h3>{{ project.title }}</h3>` plus image gallery). Replace it with:

```html
          {% if projects %}
            <section>
              <h2 class="section-heading">Selected Projects</h2>
              <ul class="project-grid">
                {% for project in projects %}
                  <li class="project-card">
                    <a class="project-card-link"
                       href="projects/{{ project.slug }}.html">
                      {% if project.cover_image %}
                        <img class="project-card-cover"
                             src="{{ project.cover_image }}"
                             alt="{{ project.title }} cover">
                      {% endif %}
                      <h3 class="project-card-title">{{ project.title }}</h3>
                      <p class="project-card-status">{{ project.status }}</p>
                      <p class="project-card-tagline">{{ project.tagline }}</p>
                      <ul class="stack-chips project-card-stack">
                        {% for tech in project.stack[:4] %}
                          <li class="stack-chip">{{ tech }}</li>
                        {% endfor %}
                      </ul>
                      <span class="project-card-cta">Read more →</span>
                    </a>
                  </li>
                {% endfor %}
              </ul>
            </section>
          {% endif %}
```

- [ ] **Step 4: Run render tests**

Run:
```bash
.venv/bin/pytest tests/test_render.py -v
```

Expected: all three render tests PASS.

- [ ] **Step 5: Commit**

```bash
git add index_template.html
git commit -m "feat(template): tag-list skills, education branching, project card grid"
```

### Task 3.3: CSS for tag-list, project cards, status tag, detail-page sections

**Files:**
- Modify: `css/main.css`
- Create: `css/projects.css`

- [ ] **Step 1: Append to css/main.css**

Append:
```css
/* Skills — categorized tag list */
.skill-category {
  margin-bottom: 1.25rem;
}
.skill-category h3 {
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
}

/* Stack chips — reusable */
.stack-chips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.stack-chip {
  display: inline-block;
  font-size: 0.78rem;
  line-height: 1.4;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  background: #eef0f4;
  color: #1f2933;
  white-space: nowrap;
}

/* Project grid (index page) */
.project-grid {
  list-style: none;
  padding: 0;
  margin: 1rem 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}
.project-card {
  background: #fff;
  border: 1px solid #e3e7ed;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 120ms ease, box-shadow 120ms ease;
}
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}
.project-card-link {
  display: block;
  padding: 0;
  text-decoration: none;
  color: inherit;
}
.project-card-cover {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #f3f4f6;
}
.project-card-title {
  font-size: 1.05rem;
  margin: 0.85rem 1rem 0.25rem;
}
.project-card-status {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5b6472;
  margin: 0 1rem 0.5rem;
}
.project-card-tagline {
  font-size: 0.9rem;
  color: #232b35;
  margin: 0 1rem 0.6rem;
}
.project-card-stack {
  margin: 0 1rem 0.6rem;
}
.project-card-cta {
  display: block;
  font-size: 0.85rem;
  color: #2563eb;
  margin: 0 1rem 1rem;
}

/* Job stack line in work experience */
.job-stack {
  font-size: 0.85rem;
  color: #4b5563;
}

/* Status tag (also reused on project detail pages) */
.status-tag {
  display: inline-block;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5b6472;
  background: #eef0f4;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}
```

- [ ] **Step 2: Create css/projects.css**

```css
/* Project detail-page layout */
.project-header {
  padding: 2.5rem 0 1.5rem;
}
.project-header .breadcrumb {
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.project-header .breadcrumb a {
  color: #2563eb;
  text-decoration: none;
}
.project-header h1 {
  margin: 0 0 0.4rem;
}
.project-header .tagline {
  font-size: 1.05rem;
  color: #1f2933;
  margin: 0.4rem 0 0;
  max-width: 60ch;
}

.project-detail .project-section {
  margin: 2rem 0;
}
.project-detail .project-section h2 {
  font-size: 1.25rem;
  border-bottom: 1px solid #e3e7ed;
  padding-bottom: 0.4rem;
  margin-bottom: 0.9rem;
}
.project-detail figure {
  margin: 0 0 1rem;
}
.project-detail figure img,
.project-detail video {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
```

- [ ] **Step 3: Regenerate and visually verify**

Run:
```bash
.venv/bin/python generate_portfolio.py
```

Open `index.html` and `projects/multi-agent-ops.html` in a browser. Verify:
- Project cards render in a grid with cover image, status, tagline, stack chips.
- Skills appear as tag-lists per category, no progress bars.
- Project detail page has breadcrumb, hero, status tag, sections.

- [ ] **Step 4: Commit**

```bash
git add css/main.css css/projects.css
git commit -m "feat(css): styles for skill tags, project grid, detail pages"
```

---

## Phase 4 — Case-Study Content Bodies

> Phase 4 fills in the `TODO_PHASE_3` strings with the real case-study
> copy. Each task fills one project. After every task, regenerate the
> site and verify the detail page reads cleanly.

> Sanitization rule reminder (from spec §5.2): no client name, product
> name, or industry-specific identifier in the rendered output for NDA
> projects (Multi-Agent Ops). Architecture diagrams use abstract node
> names.

### Task 4.1: Multi-Agent Ops case-study body

**Files:**
- Modify: `portfolio.json` (the project with `slug: "multi-agent-ops"`)

- [ ] **Step 1: Replace `sections` for `multi-agent-ops`**

Replace the project's `sections` object with:
```json
"sections": {
  "problem": "An enterprise B2B platform needed to expose its operational capabilities — data queries, configuration changes, and structural modifications — through natural language. Power users were spending 4+ hours per task on routine operations that could be parameterized; the longest single workflow took roughly one month end-to-end.",
  "architecture": "Multi-agent system on LangGraph. An intent classifier routes user requests across specialized agents (analytical, configuration, workflow). State-changing actions live in deterministic workflow subgraphs gated by an explicit human-in-the-loop confirmation step (LangGraph interrupts) — predictable behavior over fully LLM-driven flexibility, chosen because data integrity matters here. Persistent session state runs on Redis checkpoints with TTL, enabling multi-turn conversations and a 'lateral query' pattern: pause an in-flight workflow, answer a side question, resume from the same node. Multi-query orchestration lets a single user message trigger parallel queries that are merged into one synthesized response. A chained-action plan-execute pattern lets the assistant propose a full execution plan for sequential operations; the user confirms once, the system runs the plan with pre-condition checks between steps.",
  "architecture_diagram": "portfolio_media/diagrams/multi-agent-ops.png",
  "tech_stack": "LangGraph for multi-agent orchestration, LangSmith for tracing, Pinecone for retrieval, Redis-backed checkpoints, FastAPI for HTTP, Pydantic v2 for typed schemas, AWS (ECS, MemoryDB) in production, bearer-token pass-through auth so the agent never stores credentials.",
  "engineering_highlights": [
    "Designed an HITL gate pattern that prevents destructive operations without explicit user confirmation, surfaced through LangGraph interrupts.",
    "Implemented lateral-query interrupt-and-resume to handle real user behavior — people change topic mid-task and expect the workflow to resume cleanly.",
    "Built bearer-token pass-through architecture: agent never stores credentials; the downstream API enforces per-user access control transparently.",
    "Chose deterministic subgraphs over fully LLM-driven workflows for state changes — predictability over flexibility where data integrity matters."
  ],
  "outcomes": [
    "Reduced a recurring operational workflow from ~1 month to ~40 minutes (~99% cycle-time reduction).",
    "Twelve query types covering the full operational surface area.",
    "Multi-tenant: any platform user with a valid token uses the agent with their own permissions; in production with daily active users (volume metrics confidential)."
  ],
  "demo": null
}
```

- [ ] **Step 2: Regenerate and inspect**

Run:
```bash
.venv/bin/python generate_portfolio.py
```

Open `projects/multi-agent-ops.html` and verify the page reads cleanly with no `TODO_PHASE_3` strings.

- [ ] **Step 3: Commit**

```bash
git add portfolio.json projects/multi-agent-ops.html
git commit -m "content(case-study): multi-agent ops body"
```

### Task 4.2: Etherpay case-study body

**Files:**
- Modify: `portfolio.json` (project `slug: "etherpay"`)

- [ ] **Step 1: Replace `sections` for `etherpay`**

```json
"sections": {
  "problem": "Small martial-arts gyms run their finance on a mix of paper, spreadsheets, and WhatsApp messages. Owners lose hours every month on receivables, plan changes, and recurring billing — work that should be one click. Etherpay is a vertical SaaS for that operations layer, with an embedded AI assistant that absorbs the long-tail questions an owner would otherwise ask their accountant.",
  "architecture": "Two services: a FastAPI backend with a layered architecture (API → use cases → domain ← infrastructure) using DDD, CQRS, and Value Objects, with async SQLAlchemy 2.0 over PostgreSQL and Alembic migrations; and a React 19 + TypeScript SPA built with Vite, Tailwind v4, TanStack Query v5, and Radix UI. The backend exposes a streaming SSE endpoint backed by a LangGraph AI module with an Anthropic / OpenAI provider abstraction, so the agent can be swapped or graded without touching domain code. The frontend uses an axios refresh interceptor for JWT, react-hook-form + zod for typed forms, and Vitest + MSW for tests.",
  "architecture_diagram": "portfolio_media/diagrams/etherpay.png",
  "tech_stack": "Backend: Python 3.12, FastAPI, SQLAlchemy 2.0 async, Alembic, PostgreSQL, Redis, Pydantic v2, LangGraph, LangSmith. Frontend: TypeScript, React 19, Vite, Tailwind v4, TanStack Query v5, React Router v7, Radix UI, react-hook-form + zod. Testing: pytest, ruff, mypy, Vitest, MSW.",
  "engineering_highlights": [
    "Vertical-sliced architecture: a feature is one folder per layer (api/use_cases/domain/infrastructure). Cross-feature rules live in handlers that depend on Protocols, never on concrete repositories.",
    "Analytics features escape DDD overhead via 'Q-anémico' queries — frozen-dataclass DTOs over raw SQL, no aggregate rehydration. The right level of ceremony for the right shape of work.",
    "AI module is opt-in (`BACKEND_AI_PROVIDER=none` removes it cleanly). LangGraph tools call into existing query handlers, so the agent inherits domain access control automatically.",
    "Frontend follows a feature-slice pattern (`src/features/<name>/`) with a single typed axios layer and a Radix-based UI primitives package — keeps the SPA small as features land."
  ],
  "outcomes": [
    "Pre-launch with a piloting customer (martial-arts gym).",
    "Backend and frontend repos live, type-checked end to end (mypy + tsc strict).",
    "Built as a reusable foundation — the backend doubles as a clonable template for future vertical SaaS work."
  ],
  "demo": "portfolio_media/demos/etherpay.mp4"
}
```

- [ ] **Step 2: Regenerate, inspect, commit**

Run `.venv/bin/python generate_portfolio.py`, open `projects/etherpay.html`, then:
```bash
git add portfolio.json projects/etherpay.html
git commit -m "content(case-study): etherpay body"
```

### Task 4.3: Finance Skill case-study body

**Files:**
- Modify: `portfolio.json` (project `slug: "finance-skill"`)

- [ ] **Step 1: Replace `sections` for `finance-skill`**

```json
"sections": {
  "problem": "Personal finance tools auto-categorize on the bank's terms, not the user's. The goal here was to own the categorization layer end-to-end: feed in raw Itaú PDFs (credit card faturas and bank extratos), get back a typed CSV that lands in a SQLite expenses database with stable categories that improve over time.",
  "architecture": "Anthropic Skill — a markdown SKILL.md that orchestrates Claude through a 9-stage pipeline (extract → classify → write CSV → validate → batch questions → re-validate → import → update mappings → summary). Each stage writes its output to disk so the pipeline survives interruption. Validation is an external Python script (`validate_csv.py`) — Claude never does arithmetic itself. Classification uses substring matching against `merchant_mappings.json`, with a fallback rule cascade and a `[PERGUNTAR]` flag for ambiguous human-name transactions. The mapping file is updated in the same run so the system gets sharper with every fatura processed.",
  "architecture_diagram": "portfolio_media/diagrams/finance-skill.png",
  "tech_stack": "Anthropic Skills protocol, Python (PDF parsing, validation scripts), SQLite (`expenses.db`), JSON (merchant mappings).",
  "engineering_highlights": [
    "Stage-based state machine with disk-as-truth — every stage writes its output before the next stage reads, so a crashed conversation never loses progress.",
    "Validation gate: the import stage refuses to run on a fatura CSV that does not match the PDF's reported total. Bugs surface at the math, not in the database.",
    "Idempotent imports: the SQLite import script dedupes by source-file + row, so re-running a stage never double-counts.",
    "Self-improving classifier: every new merchant the user confirms is appended to `merchant_mappings.json`, lowering the [PERGUNTAR] rate over time."
  ],
  "outcomes": [
    "Used personally as the primary fatura → expenses pipeline.",
    "Currently undergoing a refactor to expose the pipeline as a small product surface."
  ],
  "demo": "portfolio_media/demos/finance-skill.mp4"
}
```

- [ ] **Step 2: Regenerate, inspect, commit**

```bash
.venv/bin/python generate_portfolio.py
git add portfolio.json projects/finance-skill.html
git commit -m "content(case-study): finance skill body"
```

### Task 4.4: CRIF case-study body

**Files:**
- Modify: `portfolio.json` (project `slug: "crif"`)

- [ ] **Step 1: Replace `sections` for `crif`**

```json
"sections": {
  "problem": "Urban analytics frequently needs to combine point datasets, polygon datasets, and raster priors at a common spatial grid — and the existing toolchain forces ad hoc glue code each time. CRIF (Calibrated Raster Interpolation) gives NYU Vida Center researchers one calibrated grid system for rasterizing geospatial data from points, polygons, and dasymetric mappings.",
  "architecture": "A Python library (`crif`) packaged as a pip-installable project (`pyproject.toml`). The core `Crif` class manages a unified grid. Three rasterization paths share that grid: point aggregation (with a min/max scaling variant for multi-band priors), polygon rasterization with overlap handling (sum or area-weighted average), and dasymetric mapping that distributes a polygon-level statistic into cells using weighted multi-band priors. Hotspot discovery is raster fusion — combine bands by sum or threshold. A custom Jupyter widget (HTML + JS in `crif_ui.js`) ships with the library so notebook users can visualize grids interactively.",
  "architecture_diagram": "portfolio_media/diagrams/crif.png",
  "tech_stack": "Python, GeoPandas, Rasterio, NumPy, custom Jupyter widget (JS), Docker for environment reproducibility, applied math (formal derivation of point/polygon/dasymetric interpolation in the README).",
  "engineering_highlights": [
    "Formalized the math first: every rasterization path in CRIF has an explicit derivation in the README. The code follows the math, not the other way round.",
    "Shared grid contract: every method emits or consumes the same grid, so combinations (e.g., crime polygon + population raster + violence raster) are one-liners.",
    "Custom Jupyter widget so visualization stays in-notebook — researchers do not switch tools to inspect intermediate rasters."
  ],
  "outcomes": [
    "In use within the NYU Vida Center / UrbanMapper research effort.",
    "Open research artifact — published with formal derivations to support reproducibility."
  ],
  "demo": null
}
```

- [ ] **Step 2: Regenerate, inspect, commit**

```bash
.venv/bin/python generate_portfolio.py
git add portfolio.json projects/crif.html
git commit -m "content(case-study): crif body"
```

### Task 4.5: MIDR case-study body

**Files:**
- Modify: `portfolio.json` (project `slug: "midr"`)

- [ ] **Step 1: Replace `sections` for `midr`**

```json
"sections": {
  "problem": "Brazilian state highway audit teams inspect roads manually. Coverage is partial, bias is high, and reports are slow. MIDR was built to detect and localize pavement defects (potholes, cracks, patches, signage damage) directly from windshield imagery, so an audit team can drive a route and walk away with a structured defect inventory.",
  "architecture": "An ensemble of YOLO models, each trained separately on different datasets / capture conditions, orchestrated by a `Detector` class (`src/midr/dd.py`). Each model emits its own predictions; a fusion layer applies IOU-based clustering and Non-Maximum Suppression across models, then resolves conflicts using a consensus rule that weighs model confidence and class relevance. The result is more robust than any single model — different models catch different defect classes well, and the ensemble inherits the union.",
  "architecture_diagram": "portfolio_media/diagrams/midr.png",
  "tech_stack": "PyTorch, Ultralytics YOLO, OpenCV, NumPy, Python 3.11, Conda environments for reproducibility.",
  "engineering_highlights": [
    "Custom IOU + NMS fusion across heterogeneous YOLO models — out-of-the-box ensembling assumes identical taxonomies, which we did not have.",
    "Pipeline supports both image batches and video inputs (`main_process_video.py`), so audit teams can submit raw drive footage without preprocessing.",
    "Iterative dataset curation: the training notebook (`train/yolo_tl_2025.ipynb`) treats dataset versioning as first-class — each model generation tracks the database it was trained on (`midr_01052025_smartphone_hd.db`, etc.)."
  ],
  "outcomes": [
    "Patented in Brazil.",
    "Adopted as the standard inspection system used by the Court of Accounts of the State of Ceará (TCE-CE).",
    "Featured publicly via project Instagram reel."
  ],
  "demo": "https://www.instagram.com/reel/C6wSjDZo3jv/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
}
```

- [ ] **Step 2: Regenerate, inspect, commit**

```bash
.venv/bin/python generate_portfolio.py
git add portfolio.json projects/midr.html
git commit -m "content(case-study): midr body"
```

### Task 4.6: Nutrir case-study body

**Files:**
- Modify: `portfolio.json` (project `slug: "nutrir"`)

- [ ] **Step 1: Replace `sections` for `nutrir`**

```json
"sections": {
  "problem": "Public meal programs for vulnerable populations need a way to verify that delivered meals match the contracted nutritional spec — at scale, without sending an inspector to every kitchen. Nutrir uses computer vision to look at a delivered tray and estimate the proportion of each food category present.",
  "architecture": "A computer-vision pipeline that segments a meal photo into food regions, classifies each region, and computes per-category mass-percentage estimates. Output is a structured nutrition record that can be checked against the contracted spec.",
  "architecture_diagram": "portfolio_media/diagrams/nutrir.png",
  "tech_stack": "Python, PyTorch, image segmentation models, OpenCV.",
  "engineering_highlights": [
    "Bounded-domain segmentation: the model operates over a known menu, not free-form food, which keeps accuracy practical.",
    "Per-region mass estimation calibrated against ground-truth weighed plates."
  ],
  "outcomes": [
    "Adopted by the Municipality of Fortaleza (Brazil) to verify meals delivered to vulnerable populations."
  ],
  "demo": null
}
```

- [ ] **Step 2: Regenerate, inspect, commit**

```bash
.venv/bin/python generate_portfolio.py
git add portfolio.json projects/nutrir.html
git commit -m "content(case-study): nutrir body"
```

---

## Phase 5 — Asset Capture (Manual)

> These tasks are not code edits; they are file deliveries. Each task is
> done when the asset exists at the named path and `python
> generate_portfolio.py` followed by a browser open shows the new image
> rendering. Use `excalidraw.com` or `mermaid.live` for diagrams; export
> at 1600×900 PNG. Use Loom for demo recordings; export MP4 at ≤10 MB.

### Task 5.1: Cover images for the 6 cards

**Files:**
- Create: `portfolio_media/covers/multi-agent-ops.png`
- Create: `portfolio_media/covers/etherpay.png`
- Create: `portfolio_media/covers/finance-skill.png`
- Create: `portfolio_media/covers/crif.png`
- Create: `portfolio_media/covers/midr.png`
- Create: `portfolio_media/covers/nutrir.png`

Each cover: 16:9, ≥1280×720, ≤200 KB JPEG/PNG. Place at the listed path.

- [ ] **Step 1: Drop files into place; commit each batch as ready**

```bash
git add portfolio_media/covers/*.png
git commit -m "asset(covers): project card cover images"
```

### Task 5.2: Architecture diagrams

**Files:**
- Create: `portfolio_media/diagrams/multi-agent-ops.png` (sanitized — abstract node names)
- Create: `portfolio_media/diagrams/etherpay.png`
- Create: `portfolio_media/diagrams/finance-skill.png`
- Create: `portfolio_media/diagrams/crif.png` (can derive from existing CRIF UI image)
- Create: `portfolio_media/diagrams/midr.png`
- Create: `portfolio_media/diagrams/nutrir.png`

Sanitization rule (from spec §5.2): abstract node names for NDA project (e.g., "Analytical Agent", "Workflow Agent" — never the client's domain terms).

- [ ] **Step 1: Create or import; commit when each lands**

```bash
git add portfolio_media/diagrams/<file>.png
git commit -m "asset(diagram): <project> architecture"
```

### Task 5.3: Demo videos (Etherpay + Finance Skill)

**Files:**
- Create: `portfolio_media/demos/etherpay.mp4`
- Create: `portfolio_media/demos/finance-skill.mp4`

30–90 seconds each. UX visible, sensitive data blurred.

- [ ] **Step 1: Record with Loom; export MP4; place; commit**

```bash
git add portfolio_media/demos/*.mp4
git commit -m "asset(demo): etherpay and finance-skill walkthroughs"
```

---

## Phase 6 — Final Verification & Deploy

### Task 6.1: Full regeneration + render-test pass

**Files:**
- (no edits — verification only)

- [ ] **Step 1: Run all tests**

Run:
```bash
.venv/bin/pytest -v
```

Expected: every schema and render test PASS.

- [ ] **Step 2: Regenerate**

Run:
```bash
.venv/bin/python generate_portfolio.py
```

Expected: `Generated index.html, resume.html and 6 project pages.`

- [ ] **Step 3: Spot-check `index.html`, `resume.html`, all 6 project pages in a browser**

Open each file. Verify:
- No `TODO_PHASE_3` strings appear anywhere on the rendered pages.
- All 6 project cards link to a working detail page.
- Skills render as tag-list (no progress bars).
- Education shows UFC + NYU.
- Headline reads "AI Engineer" and the Arke role title is "AI Engineer / Agent Engineer".

- [ ] **Step 4: Search the rendered HTML for placeholder strings**

Run:
```bash
grep -rn "TODO_PHASE_3" projects/ index.html resume.html
```

Expected: no output. Any hit is a content gap — go back to Phase 4 and fill it.

### Task 6.2: Deploy

**Files:**
- (no edits — deploy only)

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

GitHub Pages picks up the change automatically.

- [ ] **Step 2: Verify live site**

Open `https://klayverpaz.github.io/`. Confirm the live site matches local. Open one project detail page (e.g., `https://klayverpaz.github.io/projects/multi-agent-ops.html`) and confirm CSS + diagrams load.

- [ ] **Step 3: Final commit if needed**

If GitHub Pages requires a `.nojekyll` file for the new `projects/` directory:
```bash
touch .nojekyll
git add .nojekyll
git commit -m "chore: disable Jekyll processing on GitHub Pages"
git push
```

---

## Self-Review Notes (post-write check)

- Spec coverage: every section of `2026-05-04-cv-portfolio-update-design.md` has a task — header/summary (1.1), work experience (1.2), skills (1.3), education/languages/interests (1.4), projects schema (2.1–2.2), detail-page template + generator (2.3–2.4), template refresh (3.1–3.3), case-study bodies (4.1–4.6), assets (5.1–5.3), verify + deploy (6.1–6.2).
- Placeholder scan: the only `TODO_*` strings are inside `portfolio.json` `TODO_PHASE_3` markers, which exist on purpose so the schema test passes before Phase 4 fills the bodies. Phase 6.1 step 4 explicitly searches for any leftover and fails the verification if found.
- Type consistency: `slug`, `status`, `cover_image`, `stack`, `sections` are used consistently across schema test (2.1), data file (2.2), template (2.3), generator (2.4), and case-study tasks (4.1–4.6). Education branches on `kind` consistently across schema test (1.1), data file (1.4), resume template (3.1), and index template (3.2).
- Open spec questions deferred (not part of the plan): drop-or-keep Instagram social link; public skeleton repos.
