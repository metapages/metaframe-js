set shell               := ["bash", "-c"]
set dotenv-load         := true
export APP_FQDN         := env_var_or_default("APP_FQDN", "server1.localhost")
export APP_PORT         := env_var_or_default("APP_PORT", "4430")
export APP_PORT_BROWSER := env_var_or_default("APP_PORT_BROWSER", "4440")
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

dev services="":
    @just ingress/mkcert
    docker-compose down
    docker-compose build {{services}}
    just open
    docker-compose up {{services}}

@publish:
    just client/publish

# Open the development browser window
open:
    deno run --allow-all --unstable https://deno.land/x/metapages@v0.0.17/exec/open_url.ts https://metapages.github.io/load-page-when-available/?url=https://${APP_FQDN}:${APP_PORT_BROWSER:-4440}

# Delete all cached and generated files, and docker volumes
clean:
    just ingress/clean
    just client/clean
    docker-compose down -v


# start:
#     deno run --import-map=importMap.json -A --unstable server.js

# cache:
#     deno cache --import-map=importMap.json --reload server.js

# vendor:
#     deno run --import-map=importMap.json -A --unstable https://deno.land/x/ultra/vendor.ts

# DEV: generate TLS certs for HTTPS over localhost https://blog.filippo.io/mkcert-valid-https-certificates-for-localhost/
# @_mkcert:
#     APP_FQDN={{SERVER_FQDN}} deno run --allow-all --unstable https://deno.land/x/metapages@v0.0.13/commands/ensure_mkcert.ts
