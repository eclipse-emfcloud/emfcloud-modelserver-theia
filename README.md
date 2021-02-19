# Model Server Theia ![build-status](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/eclipse-emfcloud/job/emfcloud-modelserver-theia/job/master/)

This projects offers the [Model Server](https://github.com/eclipse-emfcloud/emfcloud-modelserver) integration for Typescript clients.

For more information, please visit the [EMF.cloud Website](https://www.eclipse.org/emfcloud/).

If you have questions, contact us on our [spectrum chat](https://spectrum.chat/emfcloud/) and have a look at our [communication and support options](https://www.eclipse.org/emfcloud/contact/).

<br/>

## Available via NPM ![build-status-server](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/deploy-emfcloud-modelserver-theia-npm/&label=publish)

- <i>Snapshots: </i> https://www.npmjs.com/package/@eclipse-emfcloud/modelserver-theia

## Project Structure

This project provides a Theia integration for the Model Server as Typescript API as well as an example implementation of said API.

- The Typescript API is provided in [`modelserver-theia`](./modelserver-theia/README.md)
- A custom example implementation is provided in `example/dev-example` and `example/coffee-theia`

## Used Projects

This project relies on the following projects:

- https://github.com/eclipse-emfcloud/emfcloud-modelserver
- https://github.com/eclipse-theia/theia

## Prerequisites

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash

Install npm and node.

    nvm install 10.11.0
    nvm use 10.11.0

Install yarn.

    npm install -g yarn

## Getting started

Clone this repository and build all packages via the VSCode task `Build all packages` or via command line:

    yarn install

> VSCode tasks can be accessed via via menu *Terminal > Run Task...* or shortcut <kbd>Ctrl</kbd>+<kbd>T</kbd>.

Next, if you pre-built version of the Model Server you can download it via the following command. If you run a Model Server instance already, this step can be skipped.

    yarn download:server

## Running the browser example

Start the Theia application via the VSCode task `Start Theia Browser Backend` or via command line:

    yarn start

Then run the VSCode task `Open Theia Example in Browser` or point your browser to [localhost:3000](http://localhost:3000).

## Developing with the browser example

Start watching all packages via the VSCode task `Watch all packages` or via command line:

    yarn watch

Launch the `Start Browser Backend` and `Launch Browser Frontend` configurations from the *Run* view in VSCode.
