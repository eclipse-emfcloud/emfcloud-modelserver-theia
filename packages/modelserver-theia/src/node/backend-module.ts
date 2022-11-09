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
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { ContainerModule } from '@theia/core/shared/inversify';

import {
    ModelServerFrontendClient,
    MODEL_SERVER_CLIENT_SERVICE_PATH,
    MODEL_SERVER_CLIENT_V2_SERVICE_PATH,
    TheiaModelServerClient,
    TheiaModelServerClientV2
} from '../common';
import { TheiaModelServerJsonRpcProxyFactory } from '../common/jsonrpc-proxy-factory';
import { LaunchOptions } from './launch-options';
import { DefaultModelServerLauncher, DefaultModelServerNodeLauncher, ModelServerLauncher } from './model-server-backend-contribution';
import { TheiaBackendModelServerClient } from './theia-model-server-client';
import { TheiaBackendModelServerClientV2 } from './theia-model-server-client-v2';

export default new ContainerModule(bind => {
    bind(DefaultModelServerLauncher).toSelf().inSingletonScope();
    bind(DefaultModelServerNodeLauncher).toSelf().inSingletonScope();
    bind(ModelServerLauncher).toDynamicValue(({ container }) => {
        // If we are configured to launch the modelserver-node, then bind that launcher,
        // otherwise just the Java server launcher
        if (container.isBound(LaunchOptions) && container.get<LaunchOptions>(LaunchOptions).modelServerNode) {
            return container.get(DefaultModelServerNodeLauncher);
        }
        return container.get(DefaultModelServerLauncher);
    });
    bind(BackendApplicationContribution).toService(ModelServerLauncher);

    bind(TheiaModelServerClient).to(TheiaBackendModelServerClient).inSingletonScope();
    bind(ConnectionHandler)
        .toDynamicValue(
            ctx =>
                new JsonRpcConnectionHandler<ModelServerFrontendClient>(
                    MODEL_SERVER_CLIENT_SERVICE_PATH,
                    client => {
                        const modelServerClient = ctx.container.get<TheiaModelServerClient>(TheiaModelServerClient);
                        modelServerClient.setClient(client);
                        client.onDidCloseConnection(() => modelServerClient.dispose());
                        return modelServerClient;
                    },
                    TheiaModelServerJsonRpcProxyFactory
                )
        )
        .inSingletonScope();

    // For Model Server API v2
    bind(TheiaModelServerClientV2).to(TheiaBackendModelServerClientV2).inSingletonScope();
    bind(ConnectionHandler)
        .toDynamicValue(
            ctx =>
                new JsonRpcConnectionHandler<ModelServerFrontendClient>(
                    MODEL_SERVER_CLIENT_V2_SERVICE_PATH,
                    client => {
                        const modelServerClient = ctx.container.get<TheiaModelServerClientV2>(TheiaModelServerClientV2);
                        modelServerClient.setClient(client);
                        client.onDidCloseConnection(() => modelServerClient.dispose());
                        return modelServerClient;
                    },
                    TheiaModelServerJsonRpcProxyFactory
                )
        )
        .inSingletonScope();
});
