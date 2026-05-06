import json
from pathlib import Path

import pytest


@pytest.fixture
def portfolio_data():
    """Load portfolio.json from repo root."""
    root = Path(__file__).resolve().parent.parent
    with (root / "portfolio.json").open(encoding="utf-8") as f:
        return json.load(f)
