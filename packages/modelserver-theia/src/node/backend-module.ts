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

import { MODEL_SERVER_CLIENT_SERVICE_PATH, ModelServerFrontendClient, TheiaModelServerClient } from '../common';
import { DefaultModelServerLauncher, ModelServerLauncher } from './model-server-backend-contribution';
import { TheiaBackendModelServerClient } from './theia-model-server-client';

export default new ContainerModule(bind => {
    bind(DefaultModelServerLauncher).toSelf().inSingletonScope();
    bind(ModelServerLauncher).toService(DefaultModelServerLauncher);
    bind(BackendApplicationContribution).toService(DefaultModelServerLauncher);

    bind(TheiaModelServerClient).to(TheiaBackendModelServerClient).inSingletonScope();

    bind(ConnectionHandler)
        .toDynamicValue(
            ctx =>
                new JsonRpcConnectionHandler<ModelServerFrontendClient>(MODEL_SERVER_CLIENT_SERVICE_PATH, client => {
                    const modelServerClient = ctx.container.get<TheiaModelServerClient>(TheiaModelServerClient);
                    modelServerClient.setClient(client);
                    client.onDidCloseConnection(() => modelServerClient.dispose());
                    return modelServerClient;
                })
        )
        .inSingletonScope();
});
