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
import { LaunchOptions } from "@modelserver/theia";
import { ContainerModule, injectable } from "inversify";
import { join, resolve } from "path";

export default new ContainerModule(bind => {
    bind(LaunchOptions).to(SimpleLaunchOptions).inSingletonScope();
});

@injectable()
export class SimpleLaunchOptions implements LaunchOptions {
    isRunning = false;
    baseURL: string = "api/v1/";
    serverPort: number = 8081;
    hostname: string = "localhost";
    jarPath = resolve(join(__dirname, '..', '..', 'build', 'com.eclipsesource.modelserver.example-0.0.1-SNAPSHOT-standalone.jar'));
    additionalArgs = ["--errorsOnly"];
}

