"""Smoke tests that the templates render and contain the expected strings."""
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


REPO_ROOT = Path(__file__).resolve().parent.parent


def _env():
    return Environment(loader=FileSystemLoader(str(REPO_ROOT)),
                        autoescape=True)


def test_resume_tex_contains_required_sections():
    tex = (REPO_ROOT / "resume.tex").read_text(encoding="utf-8")
    for section in ("Experience", "Featured Projects", "Skills",
                    "Education", "Languages"):
        assert "\\section{" + section + "}" in tex


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
