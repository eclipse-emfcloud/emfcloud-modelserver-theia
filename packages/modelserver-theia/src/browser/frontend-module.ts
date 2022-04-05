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
import { ModelServerClient } from '@eclipse-emfcloud/modelserver-client';
import { FrontendApplicationContribution, WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { ContainerModule } from '@theia/core/shared/inversify';

import { MODEL_SERVER_CLIENT_SERVICE_PATH, ModelServerFrontendClient, TheiaModelServerClient } from '../common';
import { ModelServerSubscriptionClientV2 } from '.';
import { ModelServerFrontendContribution } from './model-server-frontend-contribution';
import { ModelServerSubscriptionClient, ModelServerSubscriptionService } from './model-server-subscription-client';

export default new ContainerModule(bind => {
    bind(ModelServerFrontendContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ModelServerFrontendContribution);
    bind(ModelServerSubscriptionClient).toSelf().inSingletonScope();
    bind(ModelServerFrontendClient).toService(ModelServerSubscriptionClient);
    bind(ModelServerSubscriptionService).toService(ModelServerSubscriptionClient);
    bind(TheiaModelServerClient)
        .toDynamicValue(ctx => {
            const connection = ctx.container.get(WebSocketConnectionProvider);
            const client: ModelServerFrontendClient = ctx.container.get(ModelServerFrontendClient);
            return connection.createProxy<ModelServerClient>(MODEL_SERVER_CLIENT_SERVICE_PATH, client);
        })
        .inSingletonScope();
});

export const FrontendModuleV2 = new ContainerModule((bind, _unbind, _isBound, rebind) => {
    bind(ModelServerSubscriptionClientV2).toSelf().inSingletonScope();
    rebind(ModelServerSubscriptionClient).toService(ModelServerSubscriptionClientV2);
});
