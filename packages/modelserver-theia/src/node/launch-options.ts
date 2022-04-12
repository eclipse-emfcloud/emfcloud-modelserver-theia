/********************************************************************************
 * Copyright (c) 2019-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
export const LaunchOptions = Symbol('LaunchOptions');

export interface LaunchOptions {
    baseURL: string;
    serverPort: number;
    hostname: string;
    jarPath?: string;
    additionalArgs?: string[];

    /**
     * For a configuration including the `modelserver-node`, launch options
     * specific to that server process.
     */
    modelServerNode?: ModelServerNodeOptions;
}

export interface ModelServerNodeOptions {
    /**
     * The port of the Java _Model Server_ to which the Node layer connects.
     * In this case, the Java server is configured to listen on this port
     * and the `serverPort` of the containing `LaunchOptions` is the port on
     * which the `modelserver-node` is configured to listen.
     */
    upstreamPort: number;
    /**
     * The path of the Javascript main file to launch (often webpacked).
     */
    jsPath?: string;
    /**
     * Optional additional command-line arguments for the `modelserver-node` process.
     */
    additionalArgs?: string[];
}

export const DEFAULT_LAUNCH_OPTIONS: LaunchOptions = {
    baseURL: 'api/v1',
    serverPort: 8081,
    hostname: 'localhost'
};

export const DEFAULT_MODELSERVER_NODE_LAUNCH_OPTIONS: LaunchOptions & Pick<Required<LaunchOptions>, 'modelServerNode'> = {
    baseURL: 'api/v2',
    serverPort: 8082,
    hostname: 'localhost',
    modelServerNode: {
        upstreamPort: 8081
    }
};
