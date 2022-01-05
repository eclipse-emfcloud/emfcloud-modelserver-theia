/********************************************************************************
 * Copyright (c) 2019-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { ModelServerClient, SubscriptionListener } from '@eclipse-emfcloud/modelserver-client';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { ContainerModule } from '@theia/core/shared/inversify';

import { MODEL_SERVER_CLIENT_SERVICE_PATH } from '../common';
import { DefaultModelServerLauncher, ModelServerLauncher } from './model-server-backend-contribution';
import { TheiaModelServerClient } from './theia-model-server-client';

export default new ContainerModule(bind => {
    bind(DefaultModelServerLauncher).toSelf().inSingletonScope();
    bind(ModelServerLauncher).toService(DefaultModelServerLauncher);
    bind(BackendApplicationContribution).toService(DefaultModelServerLauncher);

    bind(TheiaModelServerClient).toSelf().inSingletonScope();
    bind(ModelServerClient).toService(TheiaModelServerClient);

    bind(ConnectionHandler)
        .toDynamicValue(ctx =>
            new JsonRpcConnectionHandler<SubscriptionListener>(
                MODEL_SERVER_CLIENT_SERVICE_PATH,
                listener => {
                    const client = ctx.container.get(TheiaModelServerClient);
                    client.setListener(listener);
                    listener.onDidCloseConnection(() => client.dispose());
                    return client;
                }
            )
        ).inSingletonScope();
});
