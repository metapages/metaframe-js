"""
Browser integration tests for the MetaframeWidget using Playwright + JupyterLab.

Test tiers:
  @pytest.mark.integration  — needs a running JupyterLab (lab_url fixture)
  @pytest.mark.network      — also needs external network (CDN + js.mtfm.io)

Setup (one-time):
    pip install -e ".[dev]"
    playwright install chromium

Run (integration only, no network):
    pytest tests/test_browser.py -m "integration and not network"

Run (all, including network):
    pytest tests/test_browser.py -m integration
"""

import pytest
from playwright.sync_api import Page, expect

NOTEBOOK_LAB_PATH = "examples/demo.ipynb"


def _open_notebook(page: Page, lab_url: str) -> None:
    """Navigate to the demo notebook in JupyterLab."""
    # Build the direct notebook URL
    base, query = lab_url.split("?", 1)
    notebook_url = f"{base}/tree/{NOTEBOOK_LAB_PATH}?{query}"
    page.goto(notebook_url)
    # Wait for the notebook panel to be ready
    expect(page.locator(".jp-NotebookPanel")).to_be_visible(timeout=20_000)


def _run_all_cells(page: Page) -> None:
    """Execute all cells via the JupyterLab Run menu.

    JupyterLab 4.x does not expose window.app or window.jupyterapp;
    clicking the menu is the most reliable cross-version approach.
    """
    page.locator(".lm-MenuBar-item", has_text="Run").click()
    page.locator(".lm-Menu-item[data-command='runmenu:run-all']").click()


@pytest.mark.integration
def test_lab_loads(page: Page, lab_url: str):
    """JupyterLab starts and the launcher/file-browser is visible."""
    page.goto(lab_url)
    expect(
        page.locator(".jp-Launcher, .jp-FileBrowser")
    ).to_be_visible(timeout=15_000)


@pytest.mark.integration
def test_notebook_opens(page: Page, lab_url: str):
    """The demo notebook opens and its cells are visible."""
    _open_notebook(page, lab_url)
    # At least one code cell should be present
    expect(page.locator(".jp-CodeCell").first).to_be_visible(timeout=10_000)


@pytest.mark.integration
def test_cells_execute_without_traceback(page: Page, lab_url: str):
    """All notebook cells execute without raising a Python exception."""
    _open_notebook(page, lab_url)
    _run_all_cells(page)

    # Give the kernel time to execute all cells
    page.wait_for_timeout(8_000)

    # Check that no cell output contains a Python traceback
    outputs = page.locator(".jp-OutputArea-output").all()
    for output in outputs:
        text = output.inner_text()
        assert "Traceback (most recent call last)" not in text, (
            f"Python traceback found in cell output:\n{text[:300]}"
        )


@pytest.mark.integration
@pytest.mark.network
def test_widget_output_area_renders(page: Page, lab_url: str):
    """The anywidget output area appears after cells run (requires CDN load).

    JupyterLab 4.x does not set data-mime-type on output divs; instead we
    check that an output area containing an iframe is present, which means
    anywidget's ESM ran and injected its container.
    """
    _open_notebook(page, lab_url)
    _run_all_cells(page)

    widget_view = page.locator(".jp-OutputArea-output:has(iframe)")
    expect(widget_view.first).to_be_visible(timeout=60_000)


@pytest.mark.integration
@pytest.mark.network
def test_widget_iframe_renders(page: Page, lab_url: str):
    """The metaframe iframe is injected into the widget container by the ESM
    (requires CDN load of @metapages/metapage and js.mtfm.io)."""
    _open_notebook(page, lab_url)
    _run_all_cells(page)

    # The ESM creates a container div with an iframe inside the output area
    iframe = page.locator(".jp-OutputArea-output iframe")
    expect(iframe.first).to_be_visible(timeout=60_000)
