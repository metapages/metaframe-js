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

@_help:
    just --list --unsorted
    echo -e ""
    echo -e "    Github  URL 🔗 {{green}}https://github.com/metapages/metaframe-js{{normal}}"
    echo -e "    Publish URL 🔗 {{green}}https://js.mtfm.io/{{normal}}"
    echo -e "    Develop URL 🔗 {{green}}https://{{APP_FQDN}}:{{APP_PORT}}/{{normal}}"
    echo -e ""

# open
# Run the server in development mode
@dev +args="": _mkcert open
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

publish: _ensure_deployctl
  #!/usr/bin/env bash
  set -euo pipefail
  # build the client in editor/dist
  just editor/build
  rm -rf deploy
  mkdir -p deploy
  cp -r editor/dist deploy/editor
  cp -r worker/server.ts deploy/
  cp -r worker/index.html deploy/
  cp -r worker/sw.js deploy/
  cp -r worker/cache-test-utils.js deploy/
  cp -r worker/static deploy/
  cd deploy
  deployctl deploy --project=metaframe-js --prod server.ts

# Checks and tests
@test:
  just editor/test
  just worker/test

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
