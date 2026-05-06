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


def test_work_highlights_use_lead_body_shape(portfolio_data):
    """Each work_experience highlight must be a {lead, body} object."""
    for job in portfolio_data["work_experience"]:
        assert "highlights" in job
        assert isinstance(job["highlights"], list) and job["highlights"]
        for h in job["highlights"]:
            assert isinstance(h, dict), f"highlight is not dict: {h}"
            assert "lead" in h, f"missing 'lead' in highlight: {h}"
            assert "body" in h, f"missing 'body' in highlight: {h}"
            assert h["lead"].strip(), "empty lead"
            assert h["body"].strip(), "empty body"
