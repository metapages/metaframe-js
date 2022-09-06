# This is a ready-to-fork template repository

## Features:

  - [Github Pages](https://pages.github.com/) publishing
    - automatic versioning:
      - `/`: latest
      - `/v1.5.2/`: that version tag (so all published versions are available forever)
  - [npm](https://www.npmjs.com/) module publishing
    - automatic versioning, linked with above
    - external package versioned with the publised website
  - Common UI elements
    - Help button showing the (rendered) local `./Readme.md` file
    - Options (configurable) stored encoded in the URL hash params
  - Metaframe outputs updated below, when connected.
  - `just`file powered, dockerized, automated with dual human/CI controls

## Steps:

  1. Fork this repo
  2. Clone locally
  3. Modify `package.json` fields to match your own repository e.g. change the module name
  4. `just dev`
       - Modify code and publish:
       - `just publish`
