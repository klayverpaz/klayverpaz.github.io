"""Content checks for the résumé source and the hand-made portfolio pages."""
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
PAGES = [REPO_ROOT / "index.html", *sorted((REPO_ROOT / "projects").glob("*.html"))]
DROPPED = ("Seegold", "Personal Finance Skill", "paying gyms")
OWNER_FRAMING = ("founder", "co-founder", "my company", "our team")


def test_resume_tex_contains_required_sections():
    tex = (REPO_ROOT / "resume.tex").read_text(encoding="utf-8")
    for section in ("Experience", "Featured Projects", "Skills",
                    "Education", "Languages"):
        assert "\\section{" + section + "}" in tex


def test_dropped_projects_are_gone_from_resume_sources():
    tex = (REPO_ROOT / "resume.tex").read_text(encoding="utf-8")
    data = (REPO_ROOT / "portfolio.json").read_text(encoding="utf-8")
    for word in DROPPED:
        assert word not in tex, f"{word!r} still in resume.tex"
        assert word not in data, f"{word!r} still in portfolio.json"


def test_forty_minutes_is_attributed_to_the_budget_agent():
    tex = (REPO_ROOT / "resume.tex").read_text(encoding="utf-8")
    assert "Budget-Matching Agent" in tex
    assert "Multi-Agent Operations Assistant" not in tex


def test_portfolio_pages_exist_and_are_noindex():
    assert len(PAGES) == 7
    for page in PAGES:
        html = page.read_text(encoding="utf-8")
        assert '<meta name="robots" content="noindex, nofollow">' in html, page.name
        assert "Klayver_Paz_Resume.pdf" in html, page.name


def test_portfolio_pages_avoid_dropped_and_owner_framing():
    for page in PAGES:
        text = page.read_text(encoding="utf-8").lower()
        for word in DROPPED + OWNER_FRAMING:
            assert word.lower() not in text, f"{word!r} in {page.name}"


def test_root_robots_txt_still_allows_crawling():
    """The Arke site lives under the same domain; the root robots.txt must not block it."""
    robots = (REPO_ROOT / "robots.txt").read_text(encoding="utf-8")
    assert "Disallow: /\n" not in robots + "\n"
