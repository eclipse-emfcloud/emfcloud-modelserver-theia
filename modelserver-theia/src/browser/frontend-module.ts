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
import { FrontendApplicationContribution, WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { ContainerModule } from 'inversify';

import { MODEL_SERVER_CLIENT_SERVICE_PATH, ModelServerClient, ModelServerSubscriptionClient } from '../common';
import { ModelServerFrontendContribution } from './model-server-frontend-contribution';
import { DefaultModelServerSubscriptionClient } from './model-server-subscription-client';

export default new ContainerModule(bind => {
    bind(FrontendApplicationContribution).to(ModelServerFrontendContribution).inSingletonScope();
    bind(ModelServerSubscriptionClient).to(DefaultModelServerSubscriptionClient).inSingletonScope();
    bind(ModelServerClient)
        .toDynamicValue(ctx => {
            const connection = ctx.container.get(WebSocketConnectionProvider);
            const client: ModelServerSubscriptionClient = ctx.container.get(ModelServerSubscriptionClient);
            return connection.createProxy<ModelServerClient>(MODEL_SERVER_CLIENT_SERVICE_PATH, client);
        }).inSingletonScope();
});
