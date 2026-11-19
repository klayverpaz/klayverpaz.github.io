"""Generate index.html, project detail pages, and Klayver_Paz_Resume.pdf
from portfolio.json + resume.tex. Single source of truth: portfolio.json.

The PDF is compiled locally with Tectonic (https://tectonic-typesetting.github.io/).
Install with `brew install tectonic`. Tectonic is hermetic and fetches
LaTeX packages on demand; no system-wide TeX Live install is required.
"""

import json
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

REPO_ROOT = Path(__file__).resolve().parent
PDF_NAME = "Klayver_Paz_Resume.pdf"


def load_portfolio() -> dict:
    with (REPO_ROOT / "portfolio.json").open(encoding="utf-8") as f:
        data = json.load(f)
    data["current_year"] = datetime.now(tz=UTC).year
    if "social_links" in data:
        for link in data["social_links"]:
            svg_path = link.get("svg_path")
            if svg_path:
                with (REPO_ROOT / svg_path).open(encoding="utf-8") as svg_file:
                    link["svg_data"] = svg_file.read()
    return data


def render_index(env, data) -> None:
    template = env.get_template("index_template.html")
    (REPO_ROOT / "index.html").write_text(
        template.render(**data), encoding="utf-8"
    )


def render_projects(env, data) -> int:
    template = env.get_template("project_template.html")
    projects_dir = REPO_ROOT / "projects"
    projects_dir.mkdir(exist_ok=True)
    count = 0
    for project in data.get("projects", []):
        slug = project["slug"]
        (projects_dir / f"{slug}.html").write_text(
            template.render(project=project, **data),
            encoding="utf-8",
        )
        count += 1
    return count


def render_resume_pdf() -> None:
    """Compile resume.tex with Tectonic and emit Klayver_Paz_Resume.pdf."""
    if shutil.which("tectonic") is None:
        sys.exit(
            "tectonic not found on PATH. Install with `brew install tectonic` "
            "(or skip PDF render by running the individual HTML render funcs)."
        )
    tex = REPO_ROOT / "resume.tex"
    subprocess.run(
        ["tectonic", "--chatter", "minimal",
         "--outdir", str(REPO_ROOT), str(tex)],
        check=True,
    )
    (REPO_ROOT / "resume.pdf").replace(REPO_ROOT / PDF_NAME)


def main() -> None:
    data = load_portfolio()
    env = Environment(loader=FileSystemLoader(str(REPO_ROOT)), autoescape=True)
    render_index(env, data)
    project_count = render_projects(env, data)
    render_resume_pdf()
    print(
        f"Generated index.html, {PDF_NAME}, "
        f"and {project_count} project pages."
    )


if __name__ == "__main__":
    main()
