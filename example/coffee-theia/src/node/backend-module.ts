/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { LaunchOptions } from '@eclipse-emfcloud/modelserver-theia';
import { ContainerModule, injectable } from 'inversify';
import { join, resolve } from 'path';

export default new ContainerModule(bind => {
    bind(LaunchOptions).to(SimpleLaunchOptions).inSingletonScope();
});

@injectable()
export class SimpleLaunchOptions implements LaunchOptions {
    baseURL = 'api/v1/';
    serverPort = 8081;
    hostname = 'localhost';
    jarPath = resolve(join(__dirname, '..', '..', 'build', 'org.eclipse.emfcloud.modelserver.example-0.7.0-SNAPSHOT-standalone.jar'));
    additionalArgs = ['--errorsOnly'];
}

