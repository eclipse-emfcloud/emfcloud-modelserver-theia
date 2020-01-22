# Model Server Theia ![build-status](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/eclipse-emfcloud/job/emfcloud-modelserver-theia/job/master/) ![build-status-server](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/deploy-emfcloud-modelserver-theia-npm/&label=publish)
[Model server](https://github.com/eclipse-emfcloud/emfcloud-modelserver) integration for Theia.

- <i>Snapshots: </i> https://www.npmjs.com/package/@eclipse-emfcloud/modelserver-theia

## Getting started

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash

Install npm and node.

    nvm install 10.11.0
    nvm use 10.11.0

Install yarn.

    npm install -g yarn

## Running the browser example

    yarn rebuild:browser
    cd example/browser-app
    yarn start

Open http://localhost:3000 in the browser.

## Running the Electron example

    yarn rebuild:electron
    cd example/electron-app
    yarn start

## Developing with the browser example

Start watching of modelserver-theia.

    cd modelserver-theia
    yarn watch

Start watching of the browser example.

    yarn rebuild:browser
    cd example/browser-app
    yarn watch

Launch `Start Browser Backend` configuration from VS code.

Open http://localhost:3000 in the browser.

## Developing with the Electron example

Start watching of modelserver-theia.

    cd modelserver-theia
    yarn watch

Start watching of the electron example.

    yarn rebuild:electron
    cd example/electron-app
    yarn watch

Launch `Start Electron Backend` configuration from VS code.
