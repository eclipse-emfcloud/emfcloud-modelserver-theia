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
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { ContainerModule } from 'inversify';

import { MODEL_SERVER_CLIENT_SERVICE_PATH, ModelServerClient, ModelServerFrontendClient } from '../common';
import { DefaultModelServerLauncher, ModelServerLauncher } from './model-server-backend-contribution';
import { DefaultModelServerClient } from './model-server-client';

export default new ContainerModule(bind => {
    bind(DefaultModelServerLauncher).toSelf().inSingletonScope();
    bind(ModelServerLauncher).toService(DefaultModelServerLauncher);
    bind(BackendApplicationContribution).toService(DefaultModelServerLauncher);

    bind(ModelServerClient).to(DefaultModelServerClient).inSingletonScope();

    bind(ConnectionHandler)
        .toDynamicValue(ctx =>
            new JsonRpcConnectionHandler<ModelServerFrontendClient>(
                MODEL_SERVER_CLIENT_SERVICE_PATH,
                client => {
                    const server = ctx.container.get<ModelServerClient>(
                        ModelServerClient
                    );
                    server.setClient(client);
                    client.onDidCloseConnection(() => server.dispose());
                    return server;
                }
            )
        ).inSingletonScope();
});
