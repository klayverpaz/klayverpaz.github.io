"""Compile resume.tex into Klayver_Paz_Resume.pdf with Tectonic.

The portfolio pages (index.html, projects/*.html) are hand-made static HTML
and are NOT generated. portfolio.json is the reference copy of the résumé
content and must stay in sync with resume.tex.

Install Tectonic with `brew install tectonic` (https://tectonic-typesetting.github.io/).
"""

import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
PDF_NAME = "Klayver_Paz_Resume.pdf"


def render_resume_pdf() -> None:
    """Compile resume.tex with Tectonic and emit Klayver_Paz_Resume.pdf."""
    if shutil.which("tectonic") is None:
        sys.exit("tectonic not found on PATH. Install with `brew install tectonic`.")
    tex = REPO_ROOT / "resume.tex"
    subprocess.run(
        ["tectonic", "--chatter", "minimal",
         "--outdir", str(REPO_ROOT), str(tex)],
        check=True,
    )
    (REPO_ROOT / "resume.pdf").replace(REPO_ROOT / PDF_NAME)


def main() -> None:
    render_resume_pdf()
    print(f"Generated {PDF_NAME}.")


if __name__ == "__main__":
    main()
