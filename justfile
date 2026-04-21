set shell               := ["bash", "-c"]
set dotenv-load         := true
set export              := true
APP_FQDN                := env_var_or_default("APP_FQDN", "server1.localhost")
APP_PORT                := env_var_or_default("APP_PORT", "4430")
APP_PORT_BROWSER        := env_var_or_default("APP_PORT_BROWSER", "4440")
DENO_DEPLOY_TOKEN       := env_var_or_default("DENO_DEPLOY_TOKEN", "")
# minimal formatting, bold is very useful
bold                               := '\033[1m'
normal                             := '\033[0m'
green                              := "\\e[32m"
yellow                             := "\\e[33m"
blue                               := "\\e[34m"
magenta                            := "\\e[35m"
grey                               := "\\e[90m"

# Serve docs locally
docs:
  cd docs && npm run dev

# Build docs (install deps if needed)
docs-build:
  cd docs && npm install && npm run build

@_help:
    just --list --unsorted
    echo -e ""
    echo -e "    Github  URL 🔗 {{green}}https://github.com/metapages/metaframe-js{{normal}}"
    echo -e "    Publish URL 🔗 {{green}}https://js.mtfm.io/{{normal}}"
    echo -e "    Develop URL 🔗 {{green}}https://{{APP_FQDN}}:{{APP_PORT}}/{{normal}}"
    echo -e ""

# open
# Run the server in development mode
@dev +args="": _mkcert docs-build open
  docker compose up --build {{args}}

# Shut down the local server
@down +args="":
  docker compose down {{args}}

check:
  just editor/check
  just worker/check

# Format TypeScript (editor: Prettier, worker: deno fmt)
fmt:
  just editor/fmt
  just worker/fmt

# DEV: generate TLS certs for HTTPS over localhost https://blog.filippo.io/mkcert-valid-https-certificates-for-localhost/
@_mkcert: _delete-certs
  mkdir -p .traefik/certs
  mkcert -cert-file .traefik/certs/local-cert.pem -key-file .traefik/certs/local-key.pem {{APP_FQDN}} s3.localhost localhost

open:
  deno run --allow-all https://deno.land/x/metapages@v0.0.17/exec/open_url.ts 'https://metapages.github.io/load-page-when-available/?url=https://{{APP_FQDN}}:{{APP_PORT}}'

publish: _ensure_deployctl docs-build
  #!/usr/bin/env bash
  set -euo pipefail
  # build the client in editor/dist
  just editor/build
  rm -rf deploy
  mkdir -p deploy
  cp -r editor/dist deploy/editor
  cp -r docs/.vitepress/dist deploy/docs
  cp -r worker/server.ts deploy/
  cp -r worker/deno.json deploy/
  cp -r worker/deno.lock deploy/
  cp -r worker/index.html deploy/
  cp -r worker/sw.js deploy/
  cp -r worker/cache-test-utils.js deploy/
  cp -r worker/static deploy/
  cd deploy
  deployctl deploy --project=metaframe-js --prod server.ts

# Checks and tests
test:
  just editor/test
  just worker/test
  just _integration-test
  just test-jupyter
  just test-marimo

# Build the Jupyter test Docker image
_build-jupyter-docker:
  docker compose -f examples/jupyter/docker-compose.yml build

# Run Jupyter widget unit tests in Docker (no browser needed)
test-jupyter-unit: _build-jupyter-docker
  docker compose -f examples/jupyter/docker-compose.yml run --rm test-unit

# Run notebook execution test via nbmake in Docker (kernel only, no browser)
test-jupyter-notebook: _build-jupyter-docker
  docker compose -f examples/jupyter/docker-compose.yml run --rm test-notebook

# Run Playwright browser integration tests in Docker (no external network required)
test-jupyter-browser: _build-jupyter-docker
  docker compose -f examples/jupyter/docker-compose.yml run --rm test-browser

# Run all Playwright browser tests in Docker, including network-dependent ones (CDN + js.mtfm.io)
test-jupyter-browser-network: _build-jupyter-docker
  docker compose -f examples/jupyter/docker-compose.yml run --rm test-browser-network

# Run all Jupyter-related tests in Docker (unit + notebook + browser, no external network)
test-jupyter:
  just test-jupyter-unit
  just test-jupyter-notebook
  just test-jupyter-browser

# Run JupyterLab in Docker (editable metaframe-widget). http://localhost:${JUPYTER_PORT:-8888} — copy the access URL from the container logs (token in query string). Optional: JUPYTER_PORT=9999 just jupyter-docker
jupyter-docker: _build-jupyter-docker
  docker compose -f examples/jupyter/docker-compose.yml up jupyter

# Run test-jupyter, then start JupyterLab in Docker (same image as CI tests).
jupyter-docker-check: test-jupyter
  docker compose -f examples/jupyter/docker-compose.yml up jupyter

# Build the marimo test Docker image
_build-marimo-docker:
  docker compose -f examples/marimo/docker-compose.yml build

# Run marimo widget unit tests in Docker (no browser needed)
test-marimo-unit: _build-marimo-docker
  docker compose -f examples/marimo/docker-compose.yml run --rm test-unit

# Run Playwright browser integration tests for marimo in Docker (no external network required)
test-marimo-browser: _build-marimo-docker
  docker compose -f examples/marimo/docker-compose.yml run --rm test-browser

# Run all Playwright browser tests for marimo in Docker, including network-dependent ones
test-marimo-browser-network: _build-marimo-docker
  docker compose -f examples/marimo/docker-compose.yml run --rm test-browser-network

# Run all marimo-related tests in Docker (unit + browser, no external network)
test-marimo:
  just test-marimo-unit
  just test-marimo-browser

# Run marimo in Docker (editable metaframe-widget). http://localhost:${MARIMO_PORT:-2718}
marimo-docker:
  docker compose -f examples/marimo/docker-compose.yml up --build

# Run canonical metaframe-widget unit tests
test-python:
  cd python && pytest tests/ -v

# Build the metaframe-widget package (outputs to python/dist/)
build-python:
  cd python && hatch build

# Build and publish metaframe-widget to PyPI (requires HATCH_INDEX_USER and HATCH_INDEX_AUTH env vars, or interactive login)
publish-python: build-python
  cd python && hatch publish

# Run integration tests: starts the dev stack, runs vitest unit + playwright integration tests, tears down
_integration-test: _mkcert
  #!/usr/bin/env bash
  set -uo pipefail

  npm --prefix test install
  npx --prefix test playwright install chromium

  # Run unit tests (no server needed)
  npm --prefix test run test:unit

  # Start dev stack in background; use port 0 for Traefik web UI to avoid conflicts with host ports
  TRAEFIK_WEB_UI_PORT=0 docker compose up --build -d

  # On exit (success or failure), shut down the dev stack and preserve exit code
  cleanup() {
    local code=$?
    docker compose down
    exit $code
  }
  trap cleanup EXIT

  # Wait for server to be ready
  echo "Waiting for dev server at https://{{APP_FQDN}}:{{APP_PORT}}..."
  timeout 90 bash -c 'until curl -skf "https://{{APP_FQDN}}:{{APP_PORT}}" >/dev/null 2>&1; do sleep 2; done'
  echo "Dev server ready."

  # Run playwright integration tests
  (cd test && npx playwright test)

# Delete all cached and generated files, and docker volumes
clean: _delete-certs
    just editor/clean
    rm -rf deploy
    docker compose down -v

@_delete-certs:
  rm -rf .traefik/certs

show-metapage-lib:
  @rg "@metapages/metapage@"

@_ensure_deployctl:
    if ! command -v deployctl &> /dev/null; then echo '‼️ deployctl is being installed ‼️'; deno install -gArf jsr:@deno/deployctl; fi
