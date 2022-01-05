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
import { ModelServerClient } from '@eclipse-emfcloud/modelserver-client';
import { FrontendApplicationContribution, WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { ContainerModule } from 'inversify';

import { MODEL_SERVER_CLIENT_SERVICE_PATH } from '../common';
import { ModelServerFrontendContribution } from './model-server-frontend-contribution';
import { DefaultSubscriptionService, ModelServerSubscriptionService } from './model-server-subscription-client';

export default new ContainerModule(bind => {
    bind(ModelServerFrontendContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ModelServerFrontendContribution);
    bind(DefaultSubscriptionService).toSelf().inSingletonScope();
    bind(ModelServerSubscriptionService).toService(DefaultSubscriptionService);
    bind(ModelServerClient)
        .toDynamicValue(ctx => {
            const connection = ctx.container.get(WebSocketConnectionProvider);
            const subService: ModelServerSubscriptionService = ctx.container.get(ModelServerSubscriptionService);
            return connection.createProxy<ModelServerClient>(MODEL_SERVER_CLIENT_SERVICE_PATH, subService.subscriptionListener);
        }).inSingletonScope();
});
