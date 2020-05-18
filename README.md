# Model Server Theia ![build-status](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/eclipse-emfcloud/job/emfcloud-modelserver-theia/job/master/) ![build-status-server](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/deploy-emfcloud-modelserver-theia-npm/&label=publish)
[Model server](https://github.com/eclipse-emfcloud/emfcloud-modelserver) integration for Theia.

- <i>Snapshots: </i> https://www.npmjs.com/package/@eclipse-emfcloud/modelserver-theia

For more information, please visit the [EMF.cloud Website](https://www.eclipse.org/emfcloud/). If you have questions, contact us on our [spectrum chat](https://spectrum.chat/emfcloud/) and have a look at our [communication and support options](https://www.eclipse.org/emfcloud/contact/).

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

## Developing with the browser example

Start watching of modelserver-theia.

    cd modelserver-theia
    yarn watch

Start watching of the browser example.

    yarn rebuild:browser
    cd example/browser-app
    yarn watch

Launch `Start Browser Backend` and `Launch Browser Frontend` configuration from VS code.
